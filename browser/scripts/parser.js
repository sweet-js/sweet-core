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
(function (root$1068, factory$1069) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$1069);
    } else if (typeof exports !== 'undefined') {
        factory$1069(exports, require('./expander'));
    } else {
        factory$1069(root$1068.esprima = {});
    }
}(this, function (exports$1070, expander$1071) {
    'use strict';
    var Token$1072, TokenName$1073, FnExprTokens$1074, Syntax$1075, PropertyKind$1076, Messages$1077, Regex$1078, SyntaxTreeDelegate$1079, ClassPropertyType$1080, source$1081, strict$1082, index$1083, lineNumber$1084, lineStart$1085, sm_lineNumber$1086, sm_lineStart$1087, sm_range$1088, sm_index$1089, length$1090, delegate$1091, tokenStream$1092, streamIndex$1093, lookahead$1094, lookaheadIndex$1095, state$1096, extra$1097;
    Token$1072 = {
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
    TokenName$1073 = {};
    TokenName$1073[Token$1072.BooleanLiteral] = 'Boolean';
    TokenName$1073[Token$1072.EOF] = '<end>';
    TokenName$1073[Token$1072.Identifier] = 'Identifier';
    TokenName$1073[Token$1072.Keyword] = 'Keyword';
    TokenName$1073[Token$1072.NullLiteral] = 'Null';
    TokenName$1073[Token$1072.NumericLiteral] = 'Numeric';
    TokenName$1073[Token$1072.Punctuator] = 'Punctuator';
    TokenName$1073[Token$1072.StringLiteral] = 'String';
    TokenName$1073[Token$1072.RegularExpression] = 'RegularExpression';
    TokenName$1073[Token$1072.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$1074 = [
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
    Syntax$1075 = {
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
    PropertyKind$1076 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$1080 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$1077 = {
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
    Regex$1078 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$1098(condition$1247, message$1248) {
        if (!condition$1247) {
            throw new Error('ASSERT: ' + message$1248);
        }
    }
    function isIn$1099(el$1249, list$1250) {
        return list$1250.indexOf(el$1249) !== -1;
    }
    function isDecimalDigit$1100(ch$1251) {
        return ch$1251 >= 48 && ch$1251 <= 57;
    }    // 0..9
    function isHexDigit$1101(ch$1252) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1252) >= 0;
    }
    function isOctalDigit$1102(ch$1253) {
        return '01234567'.indexOf(ch$1253) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$1103(ch$1254) {
        return ch$1254 === 32 || ch$1254 === 9 || ch$1254 === 11 || ch$1254 === 12 || ch$1254 === 160 || ch$1254 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1254)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$1104(ch$1255) {
        return ch$1255 === 10 || ch$1255 === 13 || ch$1255 === 8232 || ch$1255 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$1105(ch$1256) {
        return ch$1256 === 36 || ch$1256 === 95 || ch$1256 >= 65 && ch$1256 <= 90 || ch$1256 >= 97 && ch$1256 <= 122 || ch$1256 === 92 || ch$1256 >= 128 && Regex$1078.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1256));
    }
    function isIdentifierPart$1106(ch$1257) {
        return ch$1257 === 36 || ch$1257 === 95 || ch$1257 >= 65 && ch$1257 <= 90 || ch$1257 >= 97 && ch$1257 <= 122 || ch$1257 >= 48 && ch$1257 <= 57 || ch$1257 === 92 || ch$1257 >= 128 && Regex$1078.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1257));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$1107(id$1258) {
        switch (id$1258) {
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
    function isStrictModeReservedWord$1108(id$1259) {
        switch (id$1259) {
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
    function isRestrictedWord$1109(id$1260) {
        return id$1260 === 'eval' || id$1260 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$1110(id$1261) {
        if (strict$1082 && isStrictModeReservedWord$1108(id$1261)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1261.length) {
        case 2:
            return id$1261 === 'if' || id$1261 === 'in' || id$1261 === 'do';
        case 3:
            return id$1261 === 'var' || id$1261 === 'for' || id$1261 === 'new' || id$1261 === 'try' || id$1261 === 'let';
        case 4:
            return id$1261 === 'this' || id$1261 === 'else' || id$1261 === 'case' || id$1261 === 'void' || id$1261 === 'with' || id$1261 === 'enum';
        case 5:
            return id$1261 === 'while' || id$1261 === 'break' || id$1261 === 'catch' || id$1261 === 'throw' || id$1261 === 'const' || id$1261 === 'yield' || id$1261 === 'class' || id$1261 === 'super';
        case 6:
            return id$1261 === 'return' || id$1261 === 'typeof' || id$1261 === 'delete' || id$1261 === 'switch' || id$1261 === 'export' || id$1261 === 'import';
        case 7:
            return id$1261 === 'default' || id$1261 === 'finally' || id$1261 === 'extends';
        case 8:
            return id$1261 === 'function' || id$1261 === 'continue' || id$1261 === 'debugger';
        case 10:
            return id$1261 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$1111() {
        var ch$1262, blockComment$1263, lineComment$1264;
        blockComment$1263 = false;
        lineComment$1264 = false;
        while (index$1083 < length$1090) {
            ch$1262 = source$1081.charCodeAt(index$1083);
            if (lineComment$1264) {
                ++index$1083;
                if (isLineTerminator$1104(ch$1262)) {
                    lineComment$1264 = false;
                    if (ch$1262 === 13 && source$1081.charCodeAt(index$1083) === 10) {
                        ++index$1083;
                    }
                    ++lineNumber$1084;
                    lineStart$1085 = index$1083;
                }
            } else if (blockComment$1263) {
                if (isLineTerminator$1104(ch$1262)) {
                    if (ch$1262 === 13 && source$1081.charCodeAt(index$1083 + 1) === 10) {
                        ++index$1083;
                    }
                    ++lineNumber$1084;
                    ++index$1083;
                    lineStart$1085 = index$1083;
                    if (index$1083 >= length$1090) {
                        throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1262 = source$1081.charCodeAt(index$1083++);
                    if (index$1083 >= length$1090) {
                        throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1262 === 42) {
                        ch$1262 = source$1081.charCodeAt(index$1083);
                        if (ch$1262 === 47) {
                            ++index$1083;
                            blockComment$1263 = false;
                        }
                    }
                }
            } else if (ch$1262 === 47) {
                ch$1262 = source$1081.charCodeAt(index$1083 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1262 === 47) {
                    index$1083 += 2;
                    lineComment$1264 = true;
                } else if (ch$1262 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$1083 += 2;
                    blockComment$1263 = true;
                    if (index$1083 >= length$1090) {
                        throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1103(ch$1262)) {
                ++index$1083;
            } else if (isLineTerminator$1104(ch$1262)) {
                ++index$1083;
                if (ch$1262 === 13 && source$1081.charCodeAt(index$1083) === 10) {
                    ++index$1083;
                }
                ++lineNumber$1084;
                lineStart$1085 = index$1083;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$1112(prefix$1265) {
        var i$1266, len$1267, ch$1268, code$1269 = 0;
        len$1267 = prefix$1265 === 'u' ? 4 : 2;
        for (i$1266 = 0; i$1266 < len$1267; ++i$1266) {
            if (index$1083 < length$1090 && isHexDigit$1101(source$1081[index$1083])) {
                ch$1268 = source$1081[index$1083++];
                code$1269 = code$1269 * 16 + '0123456789abcdef'.indexOf(ch$1268.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1269);
    }
    function scanUnicodeCodePointEscape$1113() {
        var ch$1270, code$1271, cu1$1272, cu2$1273;
        ch$1270 = source$1081[index$1083];
        code$1271 = 0;
        // At least, one hex digit is required.
        if (ch$1270 === '}') {
            throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
        }
        while (index$1083 < length$1090) {
            ch$1270 = source$1081[index$1083++];
            if (!isHexDigit$1101(ch$1270)) {
                break;
            }
            code$1271 = code$1271 * 16 + '0123456789abcdef'.indexOf(ch$1270.toLowerCase());
        }
        if (code$1271 > 1114111 || ch$1270 !== '}') {
            throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1271 <= 65535) {
            return String.fromCharCode(code$1271);
        }
        cu1$1272 = (code$1271 - 65536 >> 10) + 55296;
        cu2$1273 = (code$1271 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1272, cu2$1273);
    }
    function getEscapedIdentifier$1114() {
        var ch$1274, id$1275;
        ch$1274 = source$1081.charCodeAt(index$1083++);
        id$1275 = String.fromCharCode(ch$1274);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1274 === 92) {
            if (source$1081.charCodeAt(index$1083) !== 117) {
                throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
            }
            ++index$1083;
            ch$1274 = scanHexEscape$1112('u');
            if (!ch$1274 || ch$1274 === '\\' || !isIdentifierStart$1105(ch$1274.charCodeAt(0))) {
                throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
            }
            id$1275 = ch$1274;
        }
        while (index$1083 < length$1090) {
            ch$1274 = source$1081.charCodeAt(index$1083);
            if (!isIdentifierPart$1106(ch$1274)) {
                break;
            }
            ++index$1083;
            id$1275 += String.fromCharCode(ch$1274);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1274 === 92) {
                id$1275 = id$1275.substr(0, id$1275.length - 1);
                if (source$1081.charCodeAt(index$1083) !== 117) {
                    throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
                }
                ++index$1083;
                ch$1274 = scanHexEscape$1112('u');
                if (!ch$1274 || ch$1274 === '\\' || !isIdentifierPart$1106(ch$1274.charCodeAt(0))) {
                    throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
                }
                id$1275 += ch$1274;
            }
        }
        return id$1275;
    }
    function getIdentifier$1115() {
        var start$1276, ch$1277;
        start$1276 = index$1083++;
        while (index$1083 < length$1090) {
            ch$1277 = source$1081.charCodeAt(index$1083);
            if (ch$1277 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$1083 = start$1276;
                return getEscapedIdentifier$1114();
            }
            if (isIdentifierPart$1106(ch$1277)) {
                ++index$1083;
            } else {
                break;
            }
        }
        return source$1081.slice(start$1276, index$1083);
    }
    function scanIdentifier$1116() {
        var start$1278, id$1279, type$1280;
        start$1278 = index$1083;
        // Backslash (char #92) starts an escaped character.
        id$1279 = source$1081.charCodeAt(index$1083) === 92 ? getEscapedIdentifier$1114() : getIdentifier$1115();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1279.length === 1) {
            type$1280 = Token$1072.Identifier;
        } else if (isKeyword$1110(id$1279)) {
            type$1280 = Token$1072.Keyword;
        } else if (id$1279 === 'null') {
            type$1280 = Token$1072.NullLiteral;
        } else if (id$1279 === 'true' || id$1279 === 'false') {
            type$1280 = Token$1072.BooleanLiteral;
        } else {
            type$1280 = Token$1072.Identifier;
        }
        return {
            type: type$1280,
            value: id$1279,
            lineNumber: lineNumber$1084,
            lineStart: lineStart$1085,
            range: [
                start$1278,
                index$1083
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$1117() {
        var start$1281 = index$1083, code$1282 = source$1081.charCodeAt(index$1083), code2$1283, ch1$1284 = source$1081[index$1083], ch2$1285, ch3$1286, ch4$1287;
        switch (code$1282) {
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
            ++index$1083;
            if (extra$1097.tokenize) {
                if (code$1282 === 40) {
                    extra$1097.openParenToken = extra$1097.tokens.length;
                } else if (code$1282 === 123) {
                    extra$1097.openCurlyToken = extra$1097.tokens.length;
                }
            }
            return {
                type: Token$1072.Punctuator,
                value: String.fromCharCode(code$1282),
                lineNumber: lineNumber$1084,
                lineStart: lineStart$1085,
                range: [
                    start$1281,
                    index$1083
                ]
            };
        default:
            code2$1283 = source$1081.charCodeAt(index$1083 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1283 === 61) {
                switch (code$1282) {
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
                    index$1083 += 2;
                    return {
                        type: Token$1072.Punctuator,
                        value: String.fromCharCode(code$1282) + String.fromCharCode(code2$1283),
                        lineNumber: lineNumber$1084,
                        lineStart: lineStart$1085,
                        range: [
                            start$1281,
                            index$1083
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$1083 += 2;
                    // !== and ===
                    if (source$1081.charCodeAt(index$1083) === 61) {
                        ++index$1083;
                    }
                    return {
                        type: Token$1072.Punctuator,
                        value: source$1081.slice(start$1281, index$1083),
                        lineNumber: lineNumber$1084,
                        lineStart: lineStart$1085,
                        range: [
                            start$1281,
                            index$1083
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1285 = source$1081[index$1083 + 1];
        ch3$1286 = source$1081[index$1083 + 2];
        ch4$1287 = source$1081[index$1083 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1284 === '>' && ch2$1285 === '>' && ch3$1286 === '>') {
            if (ch4$1287 === '=') {
                index$1083 += 4;
                return {
                    type: Token$1072.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$1084,
                    lineStart: lineStart$1085,
                    range: [
                        start$1281,
                        index$1083
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1284 === '>' && ch2$1285 === '>' && ch3$1286 === '>') {
            index$1083 += 3;
            return {
                type: Token$1072.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$1084,
                lineStart: lineStart$1085,
                range: [
                    start$1281,
                    index$1083
                ]
            };
        }
        if (ch1$1284 === '<' && ch2$1285 === '<' && ch3$1286 === '=') {
            index$1083 += 3;
            return {
                type: Token$1072.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$1084,
                lineStart: lineStart$1085,
                range: [
                    start$1281,
                    index$1083
                ]
            };
        }
        if (ch1$1284 === '>' && ch2$1285 === '>' && ch3$1286 === '=') {
            index$1083 += 3;
            return {
                type: Token$1072.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$1084,
                lineStart: lineStart$1085,
                range: [
                    start$1281,
                    index$1083
                ]
            };
        }
        if (ch1$1284 === '.' && ch2$1285 === '.' && ch3$1286 === '.') {
            index$1083 += 3;
            return {
                type: Token$1072.Punctuator,
                value: '...',
                lineNumber: lineNumber$1084,
                lineStart: lineStart$1085,
                range: [
                    start$1281,
                    index$1083
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1284 === ch2$1285 && '+-<>&|'.indexOf(ch1$1284) >= 0) {
            index$1083 += 2;
            return {
                type: Token$1072.Punctuator,
                value: ch1$1284 + ch2$1285,
                lineNumber: lineNumber$1084,
                lineStart: lineStart$1085,
                range: [
                    start$1281,
                    index$1083
                ]
            };
        }
        if (ch1$1284 === '=' && ch2$1285 === '>') {
            index$1083 += 2;
            return {
                type: Token$1072.Punctuator,
                value: '=>',
                lineNumber: lineNumber$1084,
                lineStart: lineStart$1085,
                range: [
                    start$1281,
                    index$1083
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1284) >= 0) {
            ++index$1083;
            return {
                type: Token$1072.Punctuator,
                value: ch1$1284,
                lineNumber: lineNumber$1084,
                lineStart: lineStart$1085,
                range: [
                    start$1281,
                    index$1083
                ]
            };
        }
        if (ch1$1284 === '.') {
            ++index$1083;
            return {
                type: Token$1072.Punctuator,
                value: ch1$1284,
                lineNumber: lineNumber$1084,
                lineStart: lineStart$1085,
                range: [
                    start$1281,
                    index$1083
                ]
            };
        }
        throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$1118(start$1288) {
        var number$1289 = '';
        while (index$1083 < length$1090) {
            if (!isHexDigit$1101(source$1081[index$1083])) {
                break;
            }
            number$1289 += source$1081[index$1083++];
        }
        if (number$1289.length === 0) {
            throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$1105(source$1081.charCodeAt(index$1083))) {
            throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1072.NumericLiteral,
            value: parseInt('0x' + number$1289, 16),
            lineNumber: lineNumber$1084,
            lineStart: lineStart$1085,
            range: [
                start$1288,
                index$1083
            ]
        };
    }
    function scanOctalLiteral$1119(prefix$1290, start$1291) {
        var number$1292, octal$1293;
        if (isOctalDigit$1102(prefix$1290)) {
            octal$1293 = true;
            number$1292 = '0' + source$1081[index$1083++];
        } else {
            octal$1293 = false;
            ++index$1083;
            number$1292 = '';
        }
        while (index$1083 < length$1090) {
            if (!isOctalDigit$1102(source$1081[index$1083])) {
                break;
            }
            number$1292 += source$1081[index$1083++];
        }
        if (!octal$1293 && number$1292.length === 0) {
            // only 0o or 0O
            throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$1105(source$1081.charCodeAt(index$1083)) || isDecimalDigit$1100(source$1081.charCodeAt(index$1083))) {
            throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1072.NumericLiteral,
            value: parseInt(number$1292, 8),
            octal: octal$1293,
            lineNumber: lineNumber$1084,
            lineStart: lineStart$1085,
            range: [
                start$1291,
                index$1083
            ]
        };
    }
    function scanNumericLiteral$1120() {
        var number$1294, start$1295, ch$1296, octal$1297;
        ch$1296 = source$1081[index$1083];
        assert$1098(isDecimalDigit$1100(ch$1296.charCodeAt(0)) || ch$1296 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1295 = index$1083;
        number$1294 = '';
        if (ch$1296 !== '.') {
            number$1294 = source$1081[index$1083++];
            ch$1296 = source$1081[index$1083];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1294 === '0') {
                if (ch$1296 === 'x' || ch$1296 === 'X') {
                    ++index$1083;
                    return scanHexLiteral$1118(start$1295);
                }
                if (ch$1296 === 'b' || ch$1296 === 'B') {
                    ++index$1083;
                    number$1294 = '';
                    while (index$1083 < length$1090) {
                        ch$1296 = source$1081[index$1083];
                        if (ch$1296 !== '0' && ch$1296 !== '1') {
                            break;
                        }
                        number$1294 += source$1081[index$1083++];
                    }
                    if (number$1294.length === 0) {
                        // only 0b or 0B
                        throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$1083 < length$1090) {
                        ch$1296 = source$1081.charCodeAt(index$1083);
                        if (isIdentifierStart$1105(ch$1296) || isDecimalDigit$1100(ch$1296)) {
                            throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$1072.NumericLiteral,
                        value: parseInt(number$1294, 2),
                        lineNumber: lineNumber$1084,
                        lineStart: lineStart$1085,
                        range: [
                            start$1295,
                            index$1083
                        ]
                    };
                }
                if (ch$1296 === 'o' || ch$1296 === 'O' || isOctalDigit$1102(ch$1296)) {
                    return scanOctalLiteral$1119(ch$1296, start$1295);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1296 && isDecimalDigit$1100(ch$1296.charCodeAt(0))) {
                    throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$1100(source$1081.charCodeAt(index$1083))) {
                number$1294 += source$1081[index$1083++];
            }
            ch$1296 = source$1081[index$1083];
        }
        if (ch$1296 === '.') {
            number$1294 += source$1081[index$1083++];
            while (isDecimalDigit$1100(source$1081.charCodeAt(index$1083))) {
                number$1294 += source$1081[index$1083++];
            }
            ch$1296 = source$1081[index$1083];
        }
        if (ch$1296 === 'e' || ch$1296 === 'E') {
            number$1294 += source$1081[index$1083++];
            ch$1296 = source$1081[index$1083];
            if (ch$1296 === '+' || ch$1296 === '-') {
                number$1294 += source$1081[index$1083++];
            }
            if (isDecimalDigit$1100(source$1081.charCodeAt(index$1083))) {
                while (isDecimalDigit$1100(source$1081.charCodeAt(index$1083))) {
                    number$1294 += source$1081[index$1083++];
                }
            } else {
                throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$1105(source$1081.charCodeAt(index$1083))) {
            throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1072.NumericLiteral,
            value: parseFloat(number$1294),
            lineNumber: lineNumber$1084,
            lineStart: lineStart$1085,
            range: [
                start$1295,
                index$1083
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$1121() {
        var str$1298 = '', quote$1299, start$1300, ch$1301, code$1302, unescaped$1303, restore$1304, octal$1305 = false;
        quote$1299 = source$1081[index$1083];
        assert$1098(quote$1299 === '\'' || quote$1299 === '"', 'String literal must starts with a quote');
        start$1300 = index$1083;
        ++index$1083;
        while (index$1083 < length$1090) {
            ch$1301 = source$1081[index$1083++];
            if (ch$1301 === quote$1299) {
                quote$1299 = '';
                break;
            } else if (ch$1301 === '\\') {
                ch$1301 = source$1081[index$1083++];
                if (!ch$1301 || !isLineTerminator$1104(ch$1301.charCodeAt(0))) {
                    switch (ch$1301) {
                    case 'n':
                        str$1298 += '\n';
                        break;
                    case 'r':
                        str$1298 += '\r';
                        break;
                    case 't':
                        str$1298 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$1081[index$1083] === '{') {
                            ++index$1083;
                            str$1298 += scanUnicodeCodePointEscape$1113();
                        } else {
                            restore$1304 = index$1083;
                            unescaped$1303 = scanHexEscape$1112(ch$1301);
                            if (unescaped$1303) {
                                str$1298 += unescaped$1303;
                            } else {
                                index$1083 = restore$1304;
                                str$1298 += ch$1301;
                            }
                        }
                        break;
                    case 'b':
                        str$1298 += '\b';
                        break;
                    case 'f':
                        str$1298 += '\f';
                        break;
                    case 'v':
                        str$1298 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$1102(ch$1301)) {
                            code$1302 = '01234567'.indexOf(ch$1301);
                            // \0 is not octal escape sequence
                            if (code$1302 !== 0) {
                                octal$1305 = true;
                            }
                            if (index$1083 < length$1090 && isOctalDigit$1102(source$1081[index$1083])) {
                                octal$1305 = true;
                                code$1302 = code$1302 * 8 + '01234567'.indexOf(source$1081[index$1083++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1301) >= 0 && index$1083 < length$1090 && isOctalDigit$1102(source$1081[index$1083])) {
                                    code$1302 = code$1302 * 8 + '01234567'.indexOf(source$1081[index$1083++]);
                                }
                            }
                            str$1298 += String.fromCharCode(code$1302);
                        } else {
                            str$1298 += ch$1301;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$1084;
                    if (ch$1301 === '\r' && source$1081[index$1083] === '\n') {
                        ++index$1083;
                    }
                }
            } else if (isLineTerminator$1104(ch$1301.charCodeAt(0))) {
                break;
            } else {
                str$1298 += ch$1301;
            }
        }
        if (quote$1299 !== '') {
            throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1072.StringLiteral,
            value: str$1298,
            octal: octal$1305,
            lineNumber: lineNumber$1084,
            lineStart: lineStart$1085,
            range: [
                start$1300,
                index$1083
            ]
        };
    }
    function scanTemplate$1122() {
        var cooked$1306 = '', ch$1307, start$1308, terminated$1309, tail$1310, restore$1311, unescaped$1312, code$1313, octal$1314;
        terminated$1309 = false;
        tail$1310 = false;
        start$1308 = index$1083;
        ++index$1083;
        while (index$1083 < length$1090) {
            ch$1307 = source$1081[index$1083++];
            if (ch$1307 === '`') {
                tail$1310 = true;
                terminated$1309 = true;
                break;
            } else if (ch$1307 === '$') {
                if (source$1081[index$1083] === '{') {
                    ++index$1083;
                    terminated$1309 = true;
                    break;
                }
                cooked$1306 += ch$1307;
            } else if (ch$1307 === '\\') {
                ch$1307 = source$1081[index$1083++];
                if (!isLineTerminator$1104(ch$1307.charCodeAt(0))) {
                    switch (ch$1307) {
                    case 'n':
                        cooked$1306 += '\n';
                        break;
                    case 'r':
                        cooked$1306 += '\r';
                        break;
                    case 't':
                        cooked$1306 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$1081[index$1083] === '{') {
                            ++index$1083;
                            cooked$1306 += scanUnicodeCodePointEscape$1113();
                        } else {
                            restore$1311 = index$1083;
                            unescaped$1312 = scanHexEscape$1112(ch$1307);
                            if (unescaped$1312) {
                                cooked$1306 += unescaped$1312;
                            } else {
                                index$1083 = restore$1311;
                                cooked$1306 += ch$1307;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1306 += '\b';
                        break;
                    case 'f':
                        cooked$1306 += '\f';
                        break;
                    case 'v':
                        cooked$1306 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$1102(ch$1307)) {
                            code$1313 = '01234567'.indexOf(ch$1307);
                            // \0 is not octal escape sequence
                            if (code$1313 !== 0) {
                                octal$1314 = true;
                            }
                            if (index$1083 < length$1090 && isOctalDigit$1102(source$1081[index$1083])) {
                                octal$1314 = true;
                                code$1313 = code$1313 * 8 + '01234567'.indexOf(source$1081[index$1083++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1307) >= 0 && index$1083 < length$1090 && isOctalDigit$1102(source$1081[index$1083])) {
                                    code$1313 = code$1313 * 8 + '01234567'.indexOf(source$1081[index$1083++]);
                                }
                            }
                            cooked$1306 += String.fromCharCode(code$1313);
                        } else {
                            cooked$1306 += ch$1307;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$1084;
                    if (ch$1307 === '\r' && source$1081[index$1083] === '\n') {
                        ++index$1083;
                    }
                }
            } else if (isLineTerminator$1104(ch$1307.charCodeAt(0))) {
                ++lineNumber$1084;
                if (ch$1307 === '\r' && source$1081[index$1083] === '\n') {
                    ++index$1083;
                }
                cooked$1306 += '\n';
            } else {
                cooked$1306 += ch$1307;
            }
        }
        if (!terminated$1309) {
            throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1072.Template,
            value: {
                cooked: cooked$1306,
                raw: source$1081.slice(start$1308 + 1, index$1083 - (tail$1310 ? 1 : 2))
            },
            tail: tail$1310,
            octal: octal$1314,
            lineNumber: lineNumber$1084,
            lineStart: lineStart$1085,
            range: [
                start$1308,
                index$1083
            ]
        };
    }
    function scanTemplateElement$1123(option$1315) {
        var startsWith$1316, template$1317;
        lookahead$1094 = null;
        skipComment$1111();
        startsWith$1316 = option$1315.head ? '`' : '}';
        if (source$1081[index$1083] !== startsWith$1316) {
            throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
        }
        template$1317 = scanTemplate$1122();
        peek$1129();
        return template$1317;
    }
    function scanRegExp$1124() {
        var str$1318, ch$1319, start$1320, pattern$1321, flags$1322, value$1323, classMarker$1324 = false, restore$1325, terminated$1326 = false;
        lookahead$1094 = null;
        skipComment$1111();
        start$1320 = index$1083;
        ch$1319 = source$1081[index$1083];
        assert$1098(ch$1319 === '/', 'Regular expression literal must start with a slash');
        str$1318 = source$1081[index$1083++];
        while (index$1083 < length$1090) {
            ch$1319 = source$1081[index$1083++];
            str$1318 += ch$1319;
            if (classMarker$1324) {
                if (ch$1319 === ']') {
                    classMarker$1324 = false;
                }
            } else {
                if (ch$1319 === '\\') {
                    ch$1319 = source$1081[index$1083++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$1104(ch$1319.charCodeAt(0))) {
                        throwError$1132({}, Messages$1077.UnterminatedRegExp);
                    }
                    str$1318 += ch$1319;
                } else if (ch$1319 === '/') {
                    terminated$1326 = true;
                    break;
                } else if (ch$1319 === '[') {
                    classMarker$1324 = true;
                } else if (isLineTerminator$1104(ch$1319.charCodeAt(0))) {
                    throwError$1132({}, Messages$1077.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1326) {
            throwError$1132({}, Messages$1077.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1321 = str$1318.substr(1, str$1318.length - 2);
        flags$1322 = '';
        while (index$1083 < length$1090) {
            ch$1319 = source$1081[index$1083];
            if (!isIdentifierPart$1106(ch$1319.charCodeAt(0))) {
                break;
            }
            ++index$1083;
            if (ch$1319 === '\\' && index$1083 < length$1090) {
                ch$1319 = source$1081[index$1083];
                if (ch$1319 === 'u') {
                    ++index$1083;
                    restore$1325 = index$1083;
                    ch$1319 = scanHexEscape$1112('u');
                    if (ch$1319) {
                        flags$1322 += ch$1319;
                        for (str$1318 += '\\u'; restore$1325 < index$1083; ++restore$1325) {
                            str$1318 += source$1081[restore$1325];
                        }
                    } else {
                        index$1083 = restore$1325;
                        flags$1322 += 'u';
                        str$1318 += '\\u';
                    }
                } else {
                    str$1318 += '\\';
                }
            } else {
                flags$1322 += ch$1319;
                str$1318 += ch$1319;
            }
        }
        try {
            value$1323 = new RegExp(pattern$1321, flags$1322);
        } catch (e$1327) {
            throwError$1132({}, Messages$1077.InvalidRegExp);
        }
        // peek();
        if (extra$1097.tokenize) {
            return {
                type: Token$1072.RegularExpression,
                value: value$1323,
                lineNumber: lineNumber$1084,
                lineStart: lineStart$1085,
                range: [
                    start$1320,
                    index$1083
                ]
            };
        }
        return {
            type: Token$1072.RegularExpression,
            literal: str$1318,
            value: value$1323,
            range: [
                start$1320,
                index$1083
            ]
        };
    }
    function isIdentifierName$1125(token$1328) {
        return token$1328.type === Token$1072.Identifier || token$1328.type === Token$1072.Keyword || token$1328.type === Token$1072.BooleanLiteral || token$1328.type === Token$1072.NullLiteral;
    }
    function advanceSlash$1126() {
        var prevToken$1329, checkToken$1330;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1329 = extra$1097.tokens[extra$1097.tokens.length - 1];
        if (!prevToken$1329) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$1124();
        }
        if (prevToken$1329.type === 'Punctuator') {
            if (prevToken$1329.value === ')') {
                checkToken$1330 = extra$1097.tokens[extra$1097.openParenToken - 1];
                if (checkToken$1330 && checkToken$1330.type === 'Keyword' && (checkToken$1330.value === 'if' || checkToken$1330.value === 'while' || checkToken$1330.value === 'for' || checkToken$1330.value === 'with')) {
                    return scanRegExp$1124();
                }
                return scanPunctuator$1117();
            }
            if (prevToken$1329.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$1097.tokens[extra$1097.openCurlyToken - 3] && extra$1097.tokens[extra$1097.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1330 = extra$1097.tokens[extra$1097.openCurlyToken - 4];
                    if (!checkToken$1330) {
                        return scanPunctuator$1117();
                    }
                } else if (extra$1097.tokens[extra$1097.openCurlyToken - 4] && extra$1097.tokens[extra$1097.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1330 = extra$1097.tokens[extra$1097.openCurlyToken - 5];
                    if (!checkToken$1330) {
                        return scanRegExp$1124();
                    }
                } else {
                    return scanPunctuator$1117();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$1074.indexOf(checkToken$1330.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$1117();
                }
                // It is a declaration.
                return scanRegExp$1124();
            }
            return scanRegExp$1124();
        }
        if (prevToken$1329.type === 'Keyword') {
            return scanRegExp$1124();
        }
        return scanPunctuator$1117();
    }
    function advance$1127() {
        var ch$1331;
        skipComment$1111();
        if (index$1083 >= length$1090) {
            return {
                type: Token$1072.EOF,
                lineNumber: lineNumber$1084,
                lineStart: lineStart$1085,
                range: [
                    index$1083,
                    index$1083
                ]
            };
        }
        ch$1331 = source$1081.charCodeAt(index$1083);
        // Very common: ( and ) and ;
        if (ch$1331 === 40 || ch$1331 === 41 || ch$1331 === 58) {
            return scanPunctuator$1117();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1331 === 39 || ch$1331 === 34) {
            return scanStringLiteral$1121();
        }
        if (ch$1331 === 96) {
            return scanTemplate$1122();
        }
        if (isIdentifierStart$1105(ch$1331)) {
            return scanIdentifier$1116();
        }
        // # and @ are allowed for sweet.js
        if (ch$1331 === 35 || ch$1331 === 64) {
            ++index$1083;
            return {
                type: Token$1072.Punctuator,
                value: String.fromCharCode(ch$1331),
                lineNumber: lineNumber$1084,
                lineStart: lineStart$1085,
                range: [
                    index$1083 - 1,
                    index$1083
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1331 === 46) {
            if (isDecimalDigit$1100(source$1081.charCodeAt(index$1083 + 1))) {
                return scanNumericLiteral$1120();
            }
            return scanPunctuator$1117();
        }
        if (isDecimalDigit$1100(ch$1331)) {
            return scanNumericLiteral$1120();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$1097.tokenize && ch$1331 === 47) {
            return advanceSlash$1126();
        }
        return scanPunctuator$1117();
    }
    function lex$1128() {
        var token$1332;
        token$1332 = lookahead$1094;
        streamIndex$1093 = lookaheadIndex$1095;
        lineNumber$1084 = token$1332.lineNumber;
        lineStart$1085 = token$1332.lineStart;
        sm_lineNumber$1086 = lookahead$1094.sm_lineNumber;
        sm_lineStart$1087 = lookahead$1094.sm_lineStart;
        sm_range$1088 = lookahead$1094.sm_range;
        sm_index$1089 = lookahead$1094.sm_range[0];
        lookahead$1094 = tokenStream$1092[++streamIndex$1093].token;
        lookaheadIndex$1095 = streamIndex$1093;
        index$1083 = lookahead$1094.range[0];
        return token$1332;
    }
    function peek$1129() {
        lookaheadIndex$1095 = streamIndex$1093 + 1;
        if (lookaheadIndex$1095 >= length$1090) {
            lookahead$1094 = {
                type: Token$1072.EOF,
                lineNumber: lineNumber$1084,
                lineStart: lineStart$1085,
                range: [
                    index$1083,
                    index$1083
                ]
            };
            return;
        }
        lookahead$1094 = tokenStream$1092[lookaheadIndex$1095].token;
        index$1083 = lookahead$1094.range[0];
    }
    function lookahead2$1130() {
        var adv$1333, pos$1334, line$1335, start$1336, result$1337;
        if (streamIndex$1093 + 1 >= length$1090 || streamIndex$1093 + 2 >= length$1090) {
            return {
                type: Token$1072.EOF,
                lineNumber: lineNumber$1084,
                lineStart: lineStart$1085,
                range: [
                    index$1083,
                    index$1083
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$1094 === null) {
            lookaheadIndex$1095 = streamIndex$1093 + 1;
            lookahead$1094 = tokenStream$1092[lookaheadIndex$1095].token;
            index$1083 = lookahead$1094.range[0];
        }
        result$1337 = tokenStream$1092[lookaheadIndex$1095 + 1].token;
        return result$1337;
    }
    SyntaxTreeDelegate$1079 = {
        name: 'SyntaxTree',
        postProcess: function (node$1338) {
            return node$1338;
        },
        createArrayExpression: function (elements$1339) {
            return {
                type: Syntax$1075.ArrayExpression,
                elements: elements$1339
            };
        },
        createAssignmentExpression: function (operator$1340, left$1341, right$1342) {
            return {
                type: Syntax$1075.AssignmentExpression,
                operator: operator$1340,
                left: left$1341,
                right: right$1342
            };
        },
        createBinaryExpression: function (operator$1343, left$1344, right$1345) {
            var type$1346 = operator$1343 === '||' || operator$1343 === '&&' ? Syntax$1075.LogicalExpression : Syntax$1075.BinaryExpression;
            return {
                type: type$1346,
                operator: operator$1343,
                left: left$1344,
                right: right$1345
            };
        },
        createBlockStatement: function (body$1347) {
            return {
                type: Syntax$1075.BlockStatement,
                body: body$1347
            };
        },
        createBreakStatement: function (label$1348) {
            return {
                type: Syntax$1075.BreakStatement,
                label: label$1348
            };
        },
        createCallExpression: function (callee$1349, args$1350) {
            return {
                type: Syntax$1075.CallExpression,
                callee: callee$1349,
                'arguments': args$1350
            };
        },
        createCatchClause: function (param$1351, body$1352) {
            return {
                type: Syntax$1075.CatchClause,
                param: param$1351,
                body: body$1352
            };
        },
        createConditionalExpression: function (test$1353, consequent$1354, alternate$1355) {
            return {
                type: Syntax$1075.ConditionalExpression,
                test: test$1353,
                consequent: consequent$1354,
                alternate: alternate$1355
            };
        },
        createContinueStatement: function (label$1356) {
            return {
                type: Syntax$1075.ContinueStatement,
                label: label$1356
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$1075.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1357, test$1358) {
            return {
                type: Syntax$1075.DoWhileStatement,
                body: body$1357,
                test: test$1358
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$1075.EmptyStatement };
        },
        createExpressionStatement: function (expression$1359) {
            return {
                type: Syntax$1075.ExpressionStatement,
                expression: expression$1359
            };
        },
        createForStatement: function (init$1360, test$1361, update$1362, body$1363) {
            return {
                type: Syntax$1075.ForStatement,
                init: init$1360,
                test: test$1361,
                update: update$1362,
                body: body$1363
            };
        },
        createForInStatement: function (left$1364, right$1365, body$1366) {
            return {
                type: Syntax$1075.ForInStatement,
                left: left$1364,
                right: right$1365,
                body: body$1366,
                each: false
            };
        },
        createForOfStatement: function (left$1367, right$1368, body$1369) {
            return {
                type: Syntax$1075.ForOfStatement,
                left: left$1367,
                right: right$1368,
                body: body$1369
            };
        },
        createFunctionDeclaration: function (id$1370, params$1371, defaults$1372, body$1373, rest$1374, generator$1375, expression$1376) {
            return {
                type: Syntax$1075.FunctionDeclaration,
                id: id$1370,
                params: params$1371,
                defaults: defaults$1372,
                body: body$1373,
                rest: rest$1374,
                generator: generator$1375,
                expression: expression$1376
            };
        },
        createFunctionExpression: function (id$1377, params$1378, defaults$1379, body$1380, rest$1381, generator$1382, expression$1383) {
            return {
                type: Syntax$1075.FunctionExpression,
                id: id$1377,
                params: params$1378,
                defaults: defaults$1379,
                body: body$1380,
                rest: rest$1381,
                generator: generator$1382,
                expression: expression$1383
            };
        },
        createIdentifier: function (name$1384) {
            return {
                type: Syntax$1075.Identifier,
                name: name$1384
            };
        },
        createIfStatement: function (test$1385, consequent$1386, alternate$1387) {
            return {
                type: Syntax$1075.IfStatement,
                test: test$1385,
                consequent: consequent$1386,
                alternate: alternate$1387
            };
        },
        createLabeledStatement: function (label$1388, body$1389) {
            return {
                type: Syntax$1075.LabeledStatement,
                label: label$1388,
                body: body$1389
            };
        },
        createLiteral: function (token$1390) {
            return {
                type: Syntax$1075.Literal,
                value: token$1390.value,
                raw: String(token$1390.value)
            };
        },
        createMemberExpression: function (accessor$1391, object$1392, property$1393) {
            return {
                type: Syntax$1075.MemberExpression,
                computed: accessor$1391 === '[',
                object: object$1392,
                property: property$1393
            };
        },
        createNewExpression: function (callee$1394, args$1395) {
            return {
                type: Syntax$1075.NewExpression,
                callee: callee$1394,
                'arguments': args$1395
            };
        },
        createObjectExpression: function (properties$1396) {
            return {
                type: Syntax$1075.ObjectExpression,
                properties: properties$1396
            };
        },
        createPostfixExpression: function (operator$1397, argument$1398) {
            return {
                type: Syntax$1075.UpdateExpression,
                operator: operator$1397,
                argument: argument$1398,
                prefix: false
            };
        },
        createProgram: function (body$1399) {
            return {
                type: Syntax$1075.Program,
                body: body$1399
            };
        },
        createProperty: function (kind$1400, key$1401, value$1402, method$1403, shorthand$1404) {
            return {
                type: Syntax$1075.Property,
                key: key$1401,
                value: value$1402,
                kind: kind$1400,
                method: method$1403,
                shorthand: shorthand$1404
            };
        },
        createReturnStatement: function (argument$1405) {
            return {
                type: Syntax$1075.ReturnStatement,
                argument: argument$1405
            };
        },
        createSequenceExpression: function (expressions$1406) {
            return {
                type: Syntax$1075.SequenceExpression,
                expressions: expressions$1406
            };
        },
        createSwitchCase: function (test$1407, consequent$1408) {
            return {
                type: Syntax$1075.SwitchCase,
                test: test$1407,
                consequent: consequent$1408
            };
        },
        createSwitchStatement: function (discriminant$1409, cases$1410) {
            return {
                type: Syntax$1075.SwitchStatement,
                discriminant: discriminant$1409,
                cases: cases$1410
            };
        },
        createThisExpression: function () {
            return { type: Syntax$1075.ThisExpression };
        },
        createThrowStatement: function (argument$1411) {
            return {
                type: Syntax$1075.ThrowStatement,
                argument: argument$1411
            };
        },
        createTryStatement: function (block$1412, guardedHandlers$1413, handlers$1414, finalizer$1415) {
            return {
                type: Syntax$1075.TryStatement,
                block: block$1412,
                guardedHandlers: guardedHandlers$1413,
                handlers: handlers$1414,
                finalizer: finalizer$1415
            };
        },
        createUnaryExpression: function (operator$1416, argument$1417) {
            if (operator$1416 === '++' || operator$1416 === '--') {
                return {
                    type: Syntax$1075.UpdateExpression,
                    operator: operator$1416,
                    argument: argument$1417,
                    prefix: true
                };
            }
            return {
                type: Syntax$1075.UnaryExpression,
                operator: operator$1416,
                argument: argument$1417
            };
        },
        createVariableDeclaration: function (declarations$1418, kind$1419) {
            return {
                type: Syntax$1075.VariableDeclaration,
                declarations: declarations$1418,
                kind: kind$1419
            };
        },
        createVariableDeclarator: function (id$1420, init$1421) {
            return {
                type: Syntax$1075.VariableDeclarator,
                id: id$1420,
                init: init$1421
            };
        },
        createWhileStatement: function (test$1422, body$1423) {
            return {
                type: Syntax$1075.WhileStatement,
                test: test$1422,
                body: body$1423
            };
        },
        createWithStatement: function (object$1424, body$1425) {
            return {
                type: Syntax$1075.WithStatement,
                object: object$1424,
                body: body$1425
            };
        },
        createTemplateElement: function (value$1426, tail$1427) {
            return {
                type: Syntax$1075.TemplateElement,
                value: value$1426,
                tail: tail$1427
            };
        },
        createTemplateLiteral: function (quasis$1428, expressions$1429) {
            return {
                type: Syntax$1075.TemplateLiteral,
                quasis: quasis$1428,
                expressions: expressions$1429
            };
        },
        createSpreadElement: function (argument$1430) {
            return {
                type: Syntax$1075.SpreadElement,
                argument: argument$1430
            };
        },
        createTaggedTemplateExpression: function (tag$1431, quasi$1432) {
            return {
                type: Syntax$1075.TaggedTemplateExpression,
                tag: tag$1431,
                quasi: quasi$1432
            };
        },
        createArrowFunctionExpression: function (params$1433, defaults$1434, body$1435, rest$1436, expression$1437) {
            return {
                type: Syntax$1075.ArrowFunctionExpression,
                id: null,
                params: params$1433,
                defaults: defaults$1434,
                body: body$1435,
                rest: rest$1436,
                generator: false,
                expression: expression$1437
            };
        },
        createMethodDefinition: function (propertyType$1438, kind$1439, key$1440, value$1441) {
            return {
                type: Syntax$1075.MethodDefinition,
                key: key$1440,
                value: value$1441,
                kind: kind$1439,
                'static': propertyType$1438 === ClassPropertyType$1080.static
            };
        },
        createClassBody: function (body$1442) {
            return {
                type: Syntax$1075.ClassBody,
                body: body$1442
            };
        },
        createClassExpression: function (id$1443, superClass$1444, body$1445) {
            return {
                type: Syntax$1075.ClassExpression,
                id: id$1443,
                superClass: superClass$1444,
                body: body$1445
            };
        },
        createClassDeclaration: function (id$1446, superClass$1447, body$1448) {
            return {
                type: Syntax$1075.ClassDeclaration,
                id: id$1446,
                superClass: superClass$1447,
                body: body$1448
            };
        },
        createExportSpecifier: function (id$1449, name$1450) {
            return {
                type: Syntax$1075.ExportSpecifier,
                id: id$1449,
                name: name$1450
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$1075.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1451, specifiers$1452, source$1453) {
            return {
                type: Syntax$1075.ExportDeclaration,
                declaration: declaration$1451,
                specifiers: specifiers$1452,
                source: source$1453
            };
        },
        createImportSpecifier: function (id$1454, name$1455) {
            return {
                type: Syntax$1075.ImportSpecifier,
                id: id$1454,
                name: name$1455
            };
        },
        createImportDeclaration: function (specifiers$1456, kind$1457, source$1458) {
            return {
                type: Syntax$1075.ImportDeclaration,
                specifiers: specifiers$1456,
                kind: kind$1457,
                source: source$1458
            };
        },
        createYieldExpression: function (argument$1459, delegate$1460) {
            return {
                type: Syntax$1075.YieldExpression,
                argument: argument$1459,
                delegate: delegate$1460
            };
        },
        createModuleDeclaration: function (id$1461, source$1462, body$1463) {
            return {
                type: Syntax$1075.ModuleDeclaration,
                id: id$1461,
                source: source$1462,
                body: body$1463
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$1131() {
        return lookahead$1094.lineNumber !== lineNumber$1084;
    }
    // Throw an exception
    function throwError$1132(token$1464, messageFormat$1465) {
        var error$1466, args$1467 = Array.prototype.slice.call(arguments, 2), msg$1468 = messageFormat$1465.replace(/%(\d)/g, function (whole$1472, index$1473) {
                assert$1098(index$1473 < args$1467.length, 'Message reference must be in range');
                return args$1467[index$1473];
            });
        var startIndex$1469 = streamIndex$1093 > 3 ? streamIndex$1093 - 3 : 0;
        var toks$1470 = tokenStream$1092.slice(startIndex$1469, streamIndex$1093 + 3).map(function (stx$1474) {
                return stx$1474.token.value;
            }).join(' ');
        var tailingMsg$1471 = '\n[... ' + toks$1470 + ' ...]';
        if (typeof token$1464.lineNumber === 'number') {
            error$1466 = new Error('Line ' + token$1464.lineNumber + ': ' + msg$1468 + tailingMsg$1471);
            error$1466.index = token$1464.range[0];
            error$1466.lineNumber = token$1464.lineNumber;
            error$1466.column = token$1464.range[0] - lineStart$1085 + 1;
        } else {
            error$1466 = new Error('Line ' + lineNumber$1084 + ': ' + msg$1468 + tailingMsg$1471);
            error$1466.index = index$1083;
            error$1466.lineNumber = lineNumber$1084;
            error$1466.column = index$1083 - lineStart$1085 + 1;
        }
        error$1466.description = msg$1468;
        throw error$1466;
    }
    function throwErrorTolerant$1133() {
        try {
            throwError$1132.apply(null, arguments);
        } catch (e$1475) {
            if (extra$1097.errors) {
                extra$1097.errors.push(e$1475);
            } else {
                throw e$1475;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$1134(token$1476) {
        if (token$1476.type === Token$1072.EOF) {
            throwError$1132(token$1476, Messages$1077.UnexpectedEOS);
        }
        if (token$1476.type === Token$1072.NumericLiteral) {
            throwError$1132(token$1476, Messages$1077.UnexpectedNumber);
        }
        if (token$1476.type === Token$1072.StringLiteral) {
            throwError$1132(token$1476, Messages$1077.UnexpectedString);
        }
        if (token$1476.type === Token$1072.Identifier) {
            throwError$1132(token$1476, Messages$1077.UnexpectedIdentifier);
        }
        if (token$1476.type === Token$1072.Keyword) {
            if (isFutureReservedWord$1107(token$1476.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$1082 && isStrictModeReservedWord$1108(token$1476.value)) {
                throwErrorTolerant$1133(token$1476, Messages$1077.StrictReservedWord);
                return;
            }
            throwError$1132(token$1476, Messages$1077.UnexpectedToken, token$1476.value);
        }
        if (token$1476.type === Token$1072.Template) {
            throwError$1132(token$1476, Messages$1077.UnexpectedTemplate, token$1476.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$1132(token$1476, Messages$1077.UnexpectedToken, token$1476.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$1135(value$1477) {
        var token$1478 = lex$1128();
        if (token$1478.type !== Token$1072.Punctuator || token$1478.value !== value$1477) {
            throwUnexpected$1134(token$1478);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$1136(keyword$1479) {
        var token$1480 = lex$1128();
        if (token$1480.type !== Token$1072.Keyword || token$1480.value !== keyword$1479) {
            throwUnexpected$1134(token$1480);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$1137(value$1481) {
        return lookahead$1094.type === Token$1072.Punctuator && lookahead$1094.value === value$1481;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$1138(keyword$1482) {
        return lookahead$1094.type === Token$1072.Keyword && lookahead$1094.value === keyword$1482;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$1139(keyword$1483) {
        return lookahead$1094.type === Token$1072.Identifier && lookahead$1094.value === keyword$1483;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$1140() {
        var op$1484;
        if (lookahead$1094.type !== Token$1072.Punctuator) {
            return false;
        }
        op$1484 = lookahead$1094.value;
        return op$1484 === '=' || op$1484 === '*=' || op$1484 === '/=' || op$1484 === '%=' || op$1484 === '+=' || op$1484 === '-=' || op$1484 === '<<=' || op$1484 === '>>=' || op$1484 === '>>>=' || op$1484 === '&=' || op$1484 === '^=' || op$1484 === '|=';
    }
    function consumeSemicolon$1141() {
        var line$1485, ch$1486;
        ch$1486 = lookahead$1094.value ? String(lookahead$1094.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1486 === 59) {
            lex$1128();
            return;
        }
        if (lookahead$1094.lineNumber !== lineNumber$1084) {
            return;
        }
        if (match$1137(';')) {
            lex$1128();
            return;
        }
        if (lookahead$1094.type !== Token$1072.EOF && !match$1137('}')) {
            throwUnexpected$1134(lookahead$1094);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$1142(expr$1487) {
        return expr$1487.type === Syntax$1075.Identifier || expr$1487.type === Syntax$1075.MemberExpression;
    }
    function isAssignableLeftHandSide$1143(expr$1488) {
        return isLeftHandSide$1142(expr$1488) || expr$1488.type === Syntax$1075.ObjectPattern || expr$1488.type === Syntax$1075.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$1144() {
        var elements$1489 = [], blocks$1490 = [], filter$1491 = null, tmp$1492, possiblecomprehension$1493 = true, body$1494;
        expect$1135('[');
        while (!match$1137(']')) {
            if (lookahead$1094.value === 'for' && lookahead$1094.type === Token$1072.Keyword) {
                if (!possiblecomprehension$1493) {
                    throwError$1132({}, Messages$1077.ComprehensionError);
                }
                matchKeyword$1138('for');
                tmp$1492 = parseForStatement$1192({ ignoreBody: true });
                tmp$1492.of = tmp$1492.type === Syntax$1075.ForOfStatement;
                tmp$1492.type = Syntax$1075.ComprehensionBlock;
                if (tmp$1492.left.kind) {
                    // can't be let or const
                    throwError$1132({}, Messages$1077.ComprehensionError);
                }
                blocks$1490.push(tmp$1492);
            } else if (lookahead$1094.value === 'if' && lookahead$1094.type === Token$1072.Keyword) {
                if (!possiblecomprehension$1493) {
                    throwError$1132({}, Messages$1077.ComprehensionError);
                }
                expectKeyword$1136('if');
                expect$1135('(');
                filter$1491 = parseExpression$1172();
                expect$1135(')');
            } else if (lookahead$1094.value === ',' && lookahead$1094.type === Token$1072.Punctuator) {
                possiblecomprehension$1493 = false;
                // no longer allowed.
                lex$1128();
                elements$1489.push(null);
            } else {
                tmp$1492 = parseSpreadOrAssignmentExpression$1155();
                elements$1489.push(tmp$1492);
                if (tmp$1492 && tmp$1492.type === Syntax$1075.SpreadElement) {
                    if (!match$1137(']')) {
                        throwError$1132({}, Messages$1077.ElementAfterSpreadElement);
                    }
                } else if (!(match$1137(']') || matchKeyword$1138('for') || matchKeyword$1138('if'))) {
                    expect$1135(',');
                    // this lexes.
                    possiblecomprehension$1493 = false;
                }
            }
        }
        expect$1135(']');
        if (filter$1491 && !blocks$1490.length) {
            throwError$1132({}, Messages$1077.ComprehensionRequiresBlock);
        }
        if (blocks$1490.length) {
            if (elements$1489.length !== 1) {
                throwError$1132({}, Messages$1077.ComprehensionError);
            }
            return {
                type: Syntax$1075.ComprehensionExpression,
                filter: filter$1491,
                blocks: blocks$1490,
                body: elements$1489[0]
            };
        }
        return delegate$1091.createArrayExpression(elements$1489);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$1145(options$1495) {
        var previousStrict$1496, previousYieldAllowed$1497, params$1498, defaults$1499, body$1500;
        previousStrict$1496 = strict$1082;
        previousYieldAllowed$1497 = state$1096.yieldAllowed;
        state$1096.yieldAllowed = options$1495.generator;
        params$1498 = options$1495.params || [];
        defaults$1499 = options$1495.defaults || [];
        body$1500 = parseConciseBody$1204();
        if (options$1495.name && strict$1082 && isRestrictedWord$1109(params$1498[0].name)) {
            throwErrorTolerant$1133(options$1495.name, Messages$1077.StrictParamName);
        }
        if (state$1096.yieldAllowed && !state$1096.yieldFound) {
            throwErrorTolerant$1133({}, Messages$1077.NoYieldInGenerator);
        }
        strict$1082 = previousStrict$1496;
        state$1096.yieldAllowed = previousYieldAllowed$1497;
        return delegate$1091.createFunctionExpression(null, params$1498, defaults$1499, body$1500, options$1495.rest || null, options$1495.generator, body$1500.type !== Syntax$1075.BlockStatement);
    }
    function parsePropertyMethodFunction$1146(options$1501) {
        var previousStrict$1502, tmp$1503, method$1504;
        previousStrict$1502 = strict$1082;
        strict$1082 = true;
        tmp$1503 = parseParams$1208();
        if (tmp$1503.stricted) {
            throwErrorTolerant$1133(tmp$1503.stricted, tmp$1503.message);
        }
        method$1504 = parsePropertyFunction$1145({
            params: tmp$1503.params,
            defaults: tmp$1503.defaults,
            rest: tmp$1503.rest,
            generator: options$1501.generator
        });
        strict$1082 = previousStrict$1502;
        return method$1504;
    }
    function parseObjectPropertyKey$1147() {
        var token$1505 = lex$1128();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1505.type === Token$1072.StringLiteral || token$1505.type === Token$1072.NumericLiteral) {
            if (strict$1082 && token$1505.octal) {
                throwErrorTolerant$1133(token$1505, Messages$1077.StrictOctalLiteral);
            }
            return delegate$1091.createLiteral(token$1505);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$1091.createIdentifier(token$1505.value);
    }
    function parseObjectProperty$1148() {
        var token$1506, key$1507, id$1508, value$1509, param$1510;
        token$1506 = lookahead$1094;
        if (token$1506.type === Token$1072.Identifier) {
            id$1508 = parseObjectPropertyKey$1147();
            // Property Assignment: Getter and Setter.
            if (token$1506.value === 'get' && !(match$1137(':') || match$1137('('))) {
                key$1507 = parseObjectPropertyKey$1147();
                expect$1135('(');
                expect$1135(')');
                return delegate$1091.createProperty('get', key$1507, parsePropertyFunction$1145({ generator: false }), false, false);
            }
            if (token$1506.value === 'set' && !(match$1137(':') || match$1137('('))) {
                key$1507 = parseObjectPropertyKey$1147();
                expect$1135('(');
                token$1506 = lookahead$1094;
                param$1510 = [parseVariableIdentifier$1175()];
                expect$1135(')');
                return delegate$1091.createProperty('set', key$1507, parsePropertyFunction$1145({
                    params: param$1510,
                    generator: false,
                    name: token$1506
                }), false, false);
            }
            if (match$1137(':')) {
                lex$1128();
                return delegate$1091.createProperty('init', id$1508, parseAssignmentExpression$1171(), false, false);
            }
            if (match$1137('(')) {
                return delegate$1091.createProperty('init', id$1508, parsePropertyMethodFunction$1146({ generator: false }), true, false);
            }
            return delegate$1091.createProperty('init', id$1508, id$1508, false, true);
        }
        if (token$1506.type === Token$1072.EOF || token$1506.type === Token$1072.Punctuator) {
            if (!match$1137('*')) {
                throwUnexpected$1134(token$1506);
            }
            lex$1128();
            id$1508 = parseObjectPropertyKey$1147();
            if (!match$1137('(')) {
                throwUnexpected$1134(lex$1128());
            }
            return delegate$1091.createProperty('init', id$1508, parsePropertyMethodFunction$1146({ generator: true }), true, false);
        }
        key$1507 = parseObjectPropertyKey$1147();
        if (match$1137(':')) {
            lex$1128();
            return delegate$1091.createProperty('init', key$1507, parseAssignmentExpression$1171(), false, false);
        }
        if (match$1137('(')) {
            return delegate$1091.createProperty('init', key$1507, parsePropertyMethodFunction$1146({ generator: false }), true, false);
        }
        throwUnexpected$1134(lex$1128());
    }
    function parseObjectInitialiser$1149() {
        var properties$1511 = [], property$1512, name$1513, key$1514, kind$1515, map$1516 = {}, toString$1517 = String;
        expect$1135('{');
        while (!match$1137('}')) {
            property$1512 = parseObjectProperty$1148();
            if (property$1512.key.type === Syntax$1075.Identifier) {
                name$1513 = property$1512.key.name;
            } else {
                name$1513 = toString$1517(property$1512.key.value);
            }
            kind$1515 = property$1512.kind === 'init' ? PropertyKind$1076.Data : property$1512.kind === 'get' ? PropertyKind$1076.Get : PropertyKind$1076.Set;
            key$1514 = '$' + name$1513;
            if (Object.prototype.hasOwnProperty.call(map$1516, key$1514)) {
                if (map$1516[key$1514] === PropertyKind$1076.Data) {
                    if (strict$1082 && kind$1515 === PropertyKind$1076.Data) {
                        throwErrorTolerant$1133({}, Messages$1077.StrictDuplicateProperty);
                    } else if (kind$1515 !== PropertyKind$1076.Data) {
                        throwErrorTolerant$1133({}, Messages$1077.AccessorDataProperty);
                    }
                } else {
                    if (kind$1515 === PropertyKind$1076.Data) {
                        throwErrorTolerant$1133({}, Messages$1077.AccessorDataProperty);
                    } else if (map$1516[key$1514] & kind$1515) {
                        throwErrorTolerant$1133({}, Messages$1077.AccessorGetSet);
                    }
                }
                map$1516[key$1514] |= kind$1515;
            } else {
                map$1516[key$1514] = kind$1515;
            }
            properties$1511.push(property$1512);
            if (!match$1137('}')) {
                expect$1135(',');
            }
        }
        expect$1135('}');
        return delegate$1091.createObjectExpression(properties$1511);
    }
    function parseTemplateElement$1150(option$1518) {
        var token$1519 = scanTemplateElement$1123(option$1518);
        if (strict$1082 && token$1519.octal) {
            throwError$1132(token$1519, Messages$1077.StrictOctalLiteral);
        }
        return delegate$1091.createTemplateElement({
            raw: token$1519.value.raw,
            cooked: token$1519.value.cooked
        }, token$1519.tail);
    }
    function parseTemplateLiteral$1151() {
        var quasi$1520, quasis$1521, expressions$1522;
        quasi$1520 = parseTemplateElement$1150({ head: true });
        quasis$1521 = [quasi$1520];
        expressions$1522 = [];
        while (!quasi$1520.tail) {
            expressions$1522.push(parseExpression$1172());
            quasi$1520 = parseTemplateElement$1150({ head: false });
            quasis$1521.push(quasi$1520);
        }
        return delegate$1091.createTemplateLiteral(quasis$1521, expressions$1522);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$1152() {
        var expr$1523;
        expect$1135('(');
        ++state$1096.parenthesizedCount;
        expr$1523 = parseExpression$1172();
        expect$1135(')');
        return expr$1523;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$1153() {
        var type$1524, token$1525, resolvedIdent$1526;
        token$1525 = lookahead$1094;
        type$1524 = lookahead$1094.type;
        if (type$1524 === Token$1072.Identifier) {
            resolvedIdent$1526 = expander$1071.resolve(tokenStream$1092[lookaheadIndex$1095]);
            lex$1128();
            return delegate$1091.createIdentifier(resolvedIdent$1526);
        }
        if (type$1524 === Token$1072.StringLiteral || type$1524 === Token$1072.NumericLiteral) {
            if (strict$1082 && lookahead$1094.octal) {
                throwErrorTolerant$1133(lookahead$1094, Messages$1077.StrictOctalLiteral);
            }
            return delegate$1091.createLiteral(lex$1128());
        }
        if (type$1524 === Token$1072.Keyword) {
            if (matchKeyword$1138('this')) {
                lex$1128();
                return delegate$1091.createThisExpression();
            }
            if (matchKeyword$1138('function')) {
                return parseFunctionExpression$1210();
            }
            if (matchKeyword$1138('class')) {
                return parseClassExpression$1215();
            }
            if (matchKeyword$1138('super')) {
                lex$1128();
                return delegate$1091.createIdentifier('super');
            }
        }
        if (type$1524 === Token$1072.BooleanLiteral) {
            token$1525 = lex$1128();
            token$1525.value = token$1525.value === 'true';
            return delegate$1091.createLiteral(token$1525);
        }
        if (type$1524 === Token$1072.NullLiteral) {
            token$1525 = lex$1128();
            token$1525.value = null;
            return delegate$1091.createLiteral(token$1525);
        }
        if (match$1137('[')) {
            return parseArrayInitialiser$1144();
        }
        if (match$1137('{')) {
            return parseObjectInitialiser$1149();
        }
        if (match$1137('(')) {
            return parseGroupExpression$1152();
        }
        if (lookahead$1094.type === Token$1072.RegularExpression) {
            return delegate$1091.createLiteral(lex$1128());
        }
        if (type$1524 === Token$1072.Template) {
            return parseTemplateLiteral$1151();
        }
        return throwUnexpected$1134(lex$1128());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$1154() {
        var args$1527 = [], arg$1528;
        expect$1135('(');
        if (!match$1137(')')) {
            while (streamIndex$1093 < length$1090) {
                arg$1528 = parseSpreadOrAssignmentExpression$1155();
                args$1527.push(arg$1528);
                if (match$1137(')')) {
                    break;
                } else if (arg$1528.type === Syntax$1075.SpreadElement) {
                    throwError$1132({}, Messages$1077.ElementAfterSpreadElement);
                }
                expect$1135(',');
            }
        }
        expect$1135(')');
        return args$1527;
    }
    function parseSpreadOrAssignmentExpression$1155() {
        if (match$1137('...')) {
            lex$1128();
            return delegate$1091.createSpreadElement(parseAssignmentExpression$1171());
        }
        return parseAssignmentExpression$1171();
    }
    function parseNonComputedProperty$1156() {
        var token$1529 = lex$1128();
        if (!isIdentifierName$1125(token$1529)) {
            throwUnexpected$1134(token$1529);
        }
        return delegate$1091.createIdentifier(token$1529.value);
    }
    function parseNonComputedMember$1157() {
        expect$1135('.');
        return parseNonComputedProperty$1156();
    }
    function parseComputedMember$1158() {
        var expr$1530;
        expect$1135('[');
        expr$1530 = parseExpression$1172();
        expect$1135(']');
        return expr$1530;
    }
    function parseNewExpression$1159() {
        var callee$1531, args$1532;
        expectKeyword$1136('new');
        callee$1531 = parseLeftHandSideExpression$1161();
        args$1532 = match$1137('(') ? parseArguments$1154() : [];
        return delegate$1091.createNewExpression(callee$1531, args$1532);
    }
    function parseLeftHandSideExpressionAllowCall$1160() {
        var expr$1533, args$1534, property$1535;
        expr$1533 = matchKeyword$1138('new') ? parseNewExpression$1159() : parsePrimaryExpression$1153();
        while (match$1137('.') || match$1137('[') || match$1137('(') || lookahead$1094.type === Token$1072.Template) {
            if (match$1137('(')) {
                args$1534 = parseArguments$1154();
                expr$1533 = delegate$1091.createCallExpression(expr$1533, args$1534);
            } else if (match$1137('[')) {
                expr$1533 = delegate$1091.createMemberExpression('[', expr$1533, parseComputedMember$1158());
            } else if (match$1137('.')) {
                expr$1533 = delegate$1091.createMemberExpression('.', expr$1533, parseNonComputedMember$1157());
            } else {
                expr$1533 = delegate$1091.createTaggedTemplateExpression(expr$1533, parseTemplateLiteral$1151());
            }
        }
        return expr$1533;
    }
    function parseLeftHandSideExpression$1161() {
        var expr$1536, property$1537;
        expr$1536 = matchKeyword$1138('new') ? parseNewExpression$1159() : parsePrimaryExpression$1153();
        while (match$1137('.') || match$1137('[') || lookahead$1094.type === Token$1072.Template) {
            if (match$1137('[')) {
                expr$1536 = delegate$1091.createMemberExpression('[', expr$1536, parseComputedMember$1158());
            } else if (match$1137('.')) {
                expr$1536 = delegate$1091.createMemberExpression('.', expr$1536, parseNonComputedMember$1157());
            } else {
                expr$1536 = delegate$1091.createTaggedTemplateExpression(expr$1536, parseTemplateLiteral$1151());
            }
        }
        return expr$1536;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$1162() {
        var expr$1538 = parseLeftHandSideExpressionAllowCall$1160(), token$1539 = lookahead$1094;
        if (lookahead$1094.type !== Token$1072.Punctuator) {
            return expr$1538;
        }
        if ((match$1137('++') || match$1137('--')) && !peekLineTerminator$1131()) {
            // 11.3.1, 11.3.2
            if (strict$1082 && expr$1538.type === Syntax$1075.Identifier && isRestrictedWord$1109(expr$1538.name)) {
                throwErrorTolerant$1133({}, Messages$1077.StrictLHSPostfix);
            }
            if (!isLeftHandSide$1142(expr$1538)) {
                throwError$1132({}, Messages$1077.InvalidLHSInAssignment);
            }
            token$1539 = lex$1128();
            expr$1538 = delegate$1091.createPostfixExpression(token$1539.value, expr$1538);
        }
        return expr$1538;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$1163() {
        var token$1540, expr$1541;
        if (lookahead$1094.type !== Token$1072.Punctuator && lookahead$1094.type !== Token$1072.Keyword) {
            return parsePostfixExpression$1162();
        }
        if (match$1137('++') || match$1137('--')) {
            token$1540 = lex$1128();
            expr$1541 = parseUnaryExpression$1163();
            // 11.4.4, 11.4.5
            if (strict$1082 && expr$1541.type === Syntax$1075.Identifier && isRestrictedWord$1109(expr$1541.name)) {
                throwErrorTolerant$1133({}, Messages$1077.StrictLHSPrefix);
            }
            if (!isLeftHandSide$1142(expr$1541)) {
                throwError$1132({}, Messages$1077.InvalidLHSInAssignment);
            }
            return delegate$1091.createUnaryExpression(token$1540.value, expr$1541);
        }
        if (match$1137('+') || match$1137('-') || match$1137('~') || match$1137('!')) {
            token$1540 = lex$1128();
            expr$1541 = parseUnaryExpression$1163();
            return delegate$1091.createUnaryExpression(token$1540.value, expr$1541);
        }
        if (matchKeyword$1138('delete') || matchKeyword$1138('void') || matchKeyword$1138('typeof')) {
            token$1540 = lex$1128();
            expr$1541 = parseUnaryExpression$1163();
            expr$1541 = delegate$1091.createUnaryExpression(token$1540.value, expr$1541);
            if (strict$1082 && expr$1541.operator === 'delete' && expr$1541.argument.type === Syntax$1075.Identifier) {
                throwErrorTolerant$1133({}, Messages$1077.StrictDelete);
            }
            return expr$1541;
        }
        return parsePostfixExpression$1162();
    }
    function binaryPrecedence$1164(token$1542, allowIn$1543) {
        var prec$1544 = 0;
        if (token$1542.type !== Token$1072.Punctuator && token$1542.type !== Token$1072.Keyword) {
            return 0;
        }
        switch (token$1542.value) {
        case '||':
            prec$1544 = 1;
            break;
        case '&&':
            prec$1544 = 2;
            break;
        case '|':
            prec$1544 = 3;
            break;
        case '^':
            prec$1544 = 4;
            break;
        case '&':
            prec$1544 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1544 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1544 = 7;
            break;
        case 'in':
            prec$1544 = allowIn$1543 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1544 = 8;
            break;
        case '+':
        case '-':
            prec$1544 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1544 = 11;
            break;
        default:
            break;
        }
        return prec$1544;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$1165() {
        var expr$1545, token$1546, prec$1547, previousAllowIn$1548, stack$1549, right$1550, operator$1551, left$1552, i$1553;
        previousAllowIn$1548 = state$1096.allowIn;
        state$1096.allowIn = true;
        expr$1545 = parseUnaryExpression$1163();
        token$1546 = lookahead$1094;
        prec$1547 = binaryPrecedence$1164(token$1546, previousAllowIn$1548);
        if (prec$1547 === 0) {
            return expr$1545;
        }
        token$1546.prec = prec$1547;
        lex$1128();
        stack$1549 = [
            expr$1545,
            token$1546,
            parseUnaryExpression$1163()
        ];
        while ((prec$1547 = binaryPrecedence$1164(lookahead$1094, previousAllowIn$1548)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1549.length > 2 && prec$1547 <= stack$1549[stack$1549.length - 2].prec) {
                right$1550 = stack$1549.pop();
                operator$1551 = stack$1549.pop().value;
                left$1552 = stack$1549.pop();
                stack$1549.push(delegate$1091.createBinaryExpression(operator$1551, left$1552, right$1550));
            }
            // Shift.
            token$1546 = lex$1128();
            token$1546.prec = prec$1547;
            stack$1549.push(token$1546);
            stack$1549.push(parseUnaryExpression$1163());
        }
        state$1096.allowIn = previousAllowIn$1548;
        // Final reduce to clean-up the stack.
        i$1553 = stack$1549.length - 1;
        expr$1545 = stack$1549[i$1553];
        while (i$1553 > 1) {
            expr$1545 = delegate$1091.createBinaryExpression(stack$1549[i$1553 - 1].value, stack$1549[i$1553 - 2], expr$1545);
            i$1553 -= 2;
        }
        return expr$1545;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$1166() {
        var expr$1554, previousAllowIn$1555, consequent$1556, alternate$1557;
        expr$1554 = parseBinaryExpression$1165();
        if (match$1137('?')) {
            lex$1128();
            previousAllowIn$1555 = state$1096.allowIn;
            state$1096.allowIn = true;
            consequent$1556 = parseAssignmentExpression$1171();
            state$1096.allowIn = previousAllowIn$1555;
            expect$1135(':');
            alternate$1557 = parseAssignmentExpression$1171();
            expr$1554 = delegate$1091.createConditionalExpression(expr$1554, consequent$1556, alternate$1557);
        }
        return expr$1554;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$1167(expr$1558) {
        var i$1559, len$1560, property$1561, element$1562;
        if (expr$1558.type === Syntax$1075.ObjectExpression) {
            expr$1558.type = Syntax$1075.ObjectPattern;
            for (i$1559 = 0, len$1560 = expr$1558.properties.length; i$1559 < len$1560; i$1559 += 1) {
                property$1561 = expr$1558.properties[i$1559];
                if (property$1561.kind !== 'init') {
                    throwError$1132({}, Messages$1077.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$1167(property$1561.value);
            }
        } else if (expr$1558.type === Syntax$1075.ArrayExpression) {
            expr$1558.type = Syntax$1075.ArrayPattern;
            for (i$1559 = 0, len$1560 = expr$1558.elements.length; i$1559 < len$1560; i$1559 += 1) {
                element$1562 = expr$1558.elements[i$1559];
                if (element$1562) {
                    reinterpretAsAssignmentBindingPattern$1167(element$1562);
                }
            }
        } else if (expr$1558.type === Syntax$1075.Identifier) {
            if (isRestrictedWord$1109(expr$1558.name)) {
                throwError$1132({}, Messages$1077.InvalidLHSInAssignment);
            }
        } else if (expr$1558.type === Syntax$1075.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$1167(expr$1558.argument);
            if (expr$1558.argument.type === Syntax$1075.ObjectPattern) {
                throwError$1132({}, Messages$1077.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1558.type !== Syntax$1075.MemberExpression && expr$1558.type !== Syntax$1075.CallExpression && expr$1558.type !== Syntax$1075.NewExpression) {
                throwError$1132({}, Messages$1077.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$1168(options$1563, expr$1564) {
        var i$1565, len$1566, property$1567, element$1568;
        if (expr$1564.type === Syntax$1075.ObjectExpression) {
            expr$1564.type = Syntax$1075.ObjectPattern;
            for (i$1565 = 0, len$1566 = expr$1564.properties.length; i$1565 < len$1566; i$1565 += 1) {
                property$1567 = expr$1564.properties[i$1565];
                if (property$1567.kind !== 'init') {
                    throwError$1132({}, Messages$1077.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$1168(options$1563, property$1567.value);
            }
        } else if (expr$1564.type === Syntax$1075.ArrayExpression) {
            expr$1564.type = Syntax$1075.ArrayPattern;
            for (i$1565 = 0, len$1566 = expr$1564.elements.length; i$1565 < len$1566; i$1565 += 1) {
                element$1568 = expr$1564.elements[i$1565];
                if (element$1568) {
                    reinterpretAsDestructuredParameter$1168(options$1563, element$1568);
                }
            }
        } else if (expr$1564.type === Syntax$1075.Identifier) {
            validateParam$1206(options$1563, expr$1564, expr$1564.name);
        } else {
            if (expr$1564.type !== Syntax$1075.MemberExpression) {
                throwError$1132({}, Messages$1077.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$1169(expressions$1569) {
        var i$1570, len$1571, param$1572, params$1573, defaults$1574, defaultCount$1575, options$1576, rest$1577;
        params$1573 = [];
        defaults$1574 = [];
        defaultCount$1575 = 0;
        rest$1577 = null;
        options$1576 = { paramSet: {} };
        for (i$1570 = 0, len$1571 = expressions$1569.length; i$1570 < len$1571; i$1570 += 1) {
            param$1572 = expressions$1569[i$1570];
            if (param$1572.type === Syntax$1075.Identifier) {
                params$1573.push(param$1572);
                defaults$1574.push(null);
                validateParam$1206(options$1576, param$1572, param$1572.name);
            } else if (param$1572.type === Syntax$1075.ObjectExpression || param$1572.type === Syntax$1075.ArrayExpression) {
                reinterpretAsDestructuredParameter$1168(options$1576, param$1572);
                params$1573.push(param$1572);
                defaults$1574.push(null);
            } else if (param$1572.type === Syntax$1075.SpreadElement) {
                assert$1098(i$1570 === len$1571 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$1168(options$1576, param$1572.argument);
                rest$1577 = param$1572.argument;
            } else if (param$1572.type === Syntax$1075.AssignmentExpression) {
                params$1573.push(param$1572.left);
                defaults$1574.push(param$1572.right);
                ++defaultCount$1575;
                validateParam$1206(options$1576, param$1572.left, param$1572.left.name);
            } else {
                return null;
            }
        }
        if (options$1576.message === Messages$1077.StrictParamDupe) {
            throwError$1132(strict$1082 ? options$1576.stricted : options$1576.firstRestricted, options$1576.message);
        }
        if (defaultCount$1575 === 0) {
            defaults$1574 = [];
        }
        return {
            params: params$1573,
            defaults: defaults$1574,
            rest: rest$1577,
            stricted: options$1576.stricted,
            firstRestricted: options$1576.firstRestricted,
            message: options$1576.message
        };
    }
    function parseArrowFunctionExpression$1170(options$1578) {
        var previousStrict$1579, previousYieldAllowed$1580, body$1581;
        expect$1135('=>');
        previousStrict$1579 = strict$1082;
        previousYieldAllowed$1580 = state$1096.yieldAllowed;
        state$1096.yieldAllowed = false;
        body$1581 = parseConciseBody$1204();
        if (strict$1082 && options$1578.firstRestricted) {
            throwError$1132(options$1578.firstRestricted, options$1578.message);
        }
        if (strict$1082 && options$1578.stricted) {
            throwErrorTolerant$1133(options$1578.stricted, options$1578.message);
        }
        strict$1082 = previousStrict$1579;
        state$1096.yieldAllowed = previousYieldAllowed$1580;
        return delegate$1091.createArrowFunctionExpression(options$1578.params, options$1578.defaults, body$1581, options$1578.rest, body$1581.type !== Syntax$1075.BlockStatement);
    }
    function parseAssignmentExpression$1171() {
        var expr$1582, token$1583, params$1584, oldParenthesizedCount$1585;
        if (matchKeyword$1138('yield')) {
            return parseYieldExpression$1211();
        }
        oldParenthesizedCount$1585 = state$1096.parenthesizedCount;
        if (match$1137('(')) {
            token$1583 = lookahead2$1130();
            if (token$1583.type === Token$1072.Punctuator && token$1583.value === ')' || token$1583.value === '...') {
                params$1584 = parseParams$1208();
                if (!match$1137('=>')) {
                    throwUnexpected$1134(lex$1128());
                }
                return parseArrowFunctionExpression$1170(params$1584);
            }
        }
        token$1583 = lookahead$1094;
        expr$1582 = parseConditionalExpression$1166();
        if (match$1137('=>') && (state$1096.parenthesizedCount === oldParenthesizedCount$1585 || state$1096.parenthesizedCount === oldParenthesizedCount$1585 + 1)) {
            if (expr$1582.type === Syntax$1075.Identifier) {
                params$1584 = reinterpretAsCoverFormalsList$1169([expr$1582]);
            } else if (expr$1582.type === Syntax$1075.SequenceExpression) {
                params$1584 = reinterpretAsCoverFormalsList$1169(expr$1582.expressions);
            }
            if (params$1584) {
                return parseArrowFunctionExpression$1170(params$1584);
            }
        }
        if (matchAssign$1140()) {
            // 11.13.1
            if (strict$1082 && expr$1582.type === Syntax$1075.Identifier && isRestrictedWord$1109(expr$1582.name)) {
                throwErrorTolerant$1133(token$1583, Messages$1077.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$1137('=') && (expr$1582.type === Syntax$1075.ObjectExpression || expr$1582.type === Syntax$1075.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$1167(expr$1582);
            } else if (!isLeftHandSide$1142(expr$1582)) {
                throwError$1132({}, Messages$1077.InvalidLHSInAssignment);
            }
            expr$1582 = delegate$1091.createAssignmentExpression(lex$1128().value, expr$1582, parseAssignmentExpression$1171());
        }
        return expr$1582;
    }
    // 11.14 Comma Operator
    function parseExpression$1172() {
        var expr$1586, expressions$1587, sequence$1588, coverFormalsList$1589, spreadFound$1590, oldParenthesizedCount$1591;
        oldParenthesizedCount$1591 = state$1096.parenthesizedCount;
        expr$1586 = parseAssignmentExpression$1171();
        expressions$1587 = [expr$1586];
        if (match$1137(',')) {
            while (streamIndex$1093 < length$1090) {
                if (!match$1137(',')) {
                    break;
                }
                lex$1128();
                expr$1586 = parseSpreadOrAssignmentExpression$1155();
                expressions$1587.push(expr$1586);
                if (expr$1586.type === Syntax$1075.SpreadElement) {
                    spreadFound$1590 = true;
                    if (!match$1137(')')) {
                        throwError$1132({}, Messages$1077.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1588 = delegate$1091.createSequenceExpression(expressions$1587);
        }
        if (match$1137('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$1096.parenthesizedCount === oldParenthesizedCount$1591 || state$1096.parenthesizedCount === oldParenthesizedCount$1591 + 1) {
                expr$1586 = expr$1586.type === Syntax$1075.SequenceExpression ? expr$1586.expressions : expressions$1587;
                coverFormalsList$1589 = reinterpretAsCoverFormalsList$1169(expr$1586);
                if (coverFormalsList$1589) {
                    return parseArrowFunctionExpression$1170(coverFormalsList$1589);
                }
            }
            throwUnexpected$1134(lex$1128());
        }
        if (spreadFound$1590 && lookahead2$1130().value !== '=>') {
            throwError$1132({}, Messages$1077.IllegalSpread);
        }
        return sequence$1588 || expr$1586;
    }
    // 12.1 Block
    function parseStatementList$1173() {
        var list$1592 = [], statement$1593;
        while (streamIndex$1093 < length$1090) {
            if (match$1137('}')) {
                break;
            }
            statement$1593 = parseSourceElement$1218();
            if (typeof statement$1593 === 'undefined') {
                break;
            }
            list$1592.push(statement$1593);
        }
        return list$1592;
    }
    function parseBlock$1174() {
        var block$1594;
        expect$1135('{');
        block$1594 = parseStatementList$1173();
        expect$1135('}');
        return delegate$1091.createBlockStatement(block$1594);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$1175() {
        var token$1595 = lookahead$1094, resolvedIdent$1596;
        if (token$1595.type !== Token$1072.Identifier) {
            throwUnexpected$1134(token$1595);
        }
        resolvedIdent$1596 = expander$1071.resolve(tokenStream$1092[lookaheadIndex$1095]);
        lex$1128();
        return delegate$1091.createIdentifier(resolvedIdent$1596);
    }
    function parseVariableDeclaration$1176(kind$1597) {
        var id$1598, init$1599 = null;
        if (match$1137('{')) {
            id$1598 = parseObjectInitialiser$1149();
            reinterpretAsAssignmentBindingPattern$1167(id$1598);
        } else if (match$1137('[')) {
            id$1598 = parseArrayInitialiser$1144();
            reinterpretAsAssignmentBindingPattern$1167(id$1598);
        } else {
            id$1598 = state$1096.allowKeyword ? parseNonComputedProperty$1156() : parseVariableIdentifier$1175();
            // 12.2.1
            if (strict$1082 && isRestrictedWord$1109(id$1598.name)) {
                throwErrorTolerant$1133({}, Messages$1077.StrictVarName);
            }
        }
        if (kind$1597 === 'const') {
            if (!match$1137('=')) {
                throwError$1132({}, Messages$1077.NoUnintializedConst);
            }
            expect$1135('=');
            init$1599 = parseAssignmentExpression$1171();
        } else if (match$1137('=')) {
            lex$1128();
            init$1599 = parseAssignmentExpression$1171();
        }
        return delegate$1091.createVariableDeclarator(id$1598, init$1599);
    }
    function parseVariableDeclarationList$1177(kind$1600) {
        var list$1601 = [];
        do {
            list$1601.push(parseVariableDeclaration$1176(kind$1600));
            if (!match$1137(',')) {
                break;
            }
            lex$1128();
        } while (streamIndex$1093 < length$1090);
        return list$1601;
    }
    function parseVariableStatement$1178() {
        var declarations$1602;
        expectKeyword$1136('var');
        declarations$1602 = parseVariableDeclarationList$1177();
        consumeSemicolon$1141();
        return delegate$1091.createVariableDeclaration(declarations$1602, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$1179(kind$1603) {
        var declarations$1604;
        expectKeyword$1136(kind$1603);
        declarations$1604 = parseVariableDeclarationList$1177(kind$1603);
        consumeSemicolon$1141();
        return delegate$1091.createVariableDeclaration(declarations$1604, kind$1603);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$1180() {
        var id$1605, src$1606, body$1607;
        lex$1128();
        // 'module'
        if (peekLineTerminator$1131()) {
            throwError$1132({}, Messages$1077.NewlineAfterModule);
        }
        switch (lookahead$1094.type) {
        case Token$1072.StringLiteral:
            id$1605 = parsePrimaryExpression$1153();
            body$1607 = parseModuleBlock$1223();
            src$1606 = null;
            break;
        case Token$1072.Identifier:
            id$1605 = parseVariableIdentifier$1175();
            body$1607 = null;
            if (!matchContextualKeyword$1139('from')) {
                throwUnexpected$1134(lex$1128());
            }
            lex$1128();
            src$1606 = parsePrimaryExpression$1153();
            if (src$1606.type !== Syntax$1075.Literal) {
                throwError$1132({}, Messages$1077.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$1141();
        return delegate$1091.createModuleDeclaration(id$1605, src$1606, body$1607);
    }
    function parseExportBatchSpecifier$1181() {
        expect$1135('*');
        return delegate$1091.createExportBatchSpecifier();
    }
    function parseExportSpecifier$1182() {
        var id$1608, name$1609 = null;
        id$1608 = parseVariableIdentifier$1175();
        if (matchContextualKeyword$1139('as')) {
            lex$1128();
            name$1609 = parseNonComputedProperty$1156();
        }
        return delegate$1091.createExportSpecifier(id$1608, name$1609);
    }
    function parseExportDeclaration$1183() {
        var previousAllowKeyword$1610, decl$1611, def$1612, src$1613, specifiers$1614;
        expectKeyword$1136('export');
        if (lookahead$1094.type === Token$1072.Keyword) {
            switch (lookahead$1094.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$1091.createExportDeclaration(parseSourceElement$1218(), null, null);
            }
        }
        if (isIdentifierName$1125(lookahead$1094)) {
            previousAllowKeyword$1610 = state$1096.allowKeyword;
            state$1096.allowKeyword = true;
            decl$1611 = parseVariableDeclarationList$1177('let');
            state$1096.allowKeyword = previousAllowKeyword$1610;
            return delegate$1091.createExportDeclaration(decl$1611, null, null);
        }
        specifiers$1614 = [];
        src$1613 = null;
        if (match$1137('*')) {
            specifiers$1614.push(parseExportBatchSpecifier$1181());
        } else {
            expect$1135('{');
            do {
                specifiers$1614.push(parseExportSpecifier$1182());
            } while (match$1137(',') && lex$1128());
            expect$1135('}');
        }
        if (matchContextualKeyword$1139('from')) {
            lex$1128();
            src$1613 = parsePrimaryExpression$1153();
            if (src$1613.type !== Syntax$1075.Literal) {
                throwError$1132({}, Messages$1077.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$1141();
        return delegate$1091.createExportDeclaration(null, specifiers$1614, src$1613);
    }
    function parseImportDeclaration$1184() {
        var specifiers$1615, kind$1616, src$1617;
        expectKeyword$1136('import');
        specifiers$1615 = [];
        if (isIdentifierName$1125(lookahead$1094)) {
            kind$1616 = 'default';
            specifiers$1615.push(parseImportSpecifier$1185());
            if (!matchContextualKeyword$1139('from')) {
                throwError$1132({}, Messages$1077.NoFromAfterImport);
            }
            lex$1128();
        } else if (match$1137('{')) {
            kind$1616 = 'named';
            lex$1128();
            do {
                specifiers$1615.push(parseImportSpecifier$1185());
            } while (match$1137(',') && lex$1128());
            expect$1135('}');
            if (!matchContextualKeyword$1139('from')) {
                throwError$1132({}, Messages$1077.NoFromAfterImport);
            }
            lex$1128();
        }
        src$1617 = parsePrimaryExpression$1153();
        if (src$1617.type !== Syntax$1075.Literal) {
            throwError$1132({}, Messages$1077.InvalidModuleSpecifier);
        }
        consumeSemicolon$1141();
        return delegate$1091.createImportDeclaration(specifiers$1615, kind$1616, src$1617);
    }
    function parseImportSpecifier$1185() {
        var id$1618, name$1619 = null;
        id$1618 = parseNonComputedProperty$1156();
        if (matchContextualKeyword$1139('as')) {
            lex$1128();
            name$1619 = parseVariableIdentifier$1175();
        }
        return delegate$1091.createImportSpecifier(id$1618, name$1619);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$1186() {
        expect$1135(';');
        return delegate$1091.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$1187() {
        var expr$1620 = parseExpression$1172();
        consumeSemicolon$1141();
        return delegate$1091.createExpressionStatement(expr$1620);
    }
    // 12.5 If statement
    function parseIfStatement$1188() {
        var test$1621, consequent$1622, alternate$1623;
        expectKeyword$1136('if');
        expect$1135('(');
        test$1621 = parseExpression$1172();
        expect$1135(')');
        consequent$1622 = parseStatement$1203();
        if (matchKeyword$1138('else')) {
            lex$1128();
            alternate$1623 = parseStatement$1203();
        } else {
            alternate$1623 = null;
        }
        return delegate$1091.createIfStatement(test$1621, consequent$1622, alternate$1623);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$1189() {
        var body$1624, test$1625, oldInIteration$1626;
        expectKeyword$1136('do');
        oldInIteration$1626 = state$1096.inIteration;
        state$1096.inIteration = true;
        body$1624 = parseStatement$1203();
        state$1096.inIteration = oldInIteration$1626;
        expectKeyword$1136('while');
        expect$1135('(');
        test$1625 = parseExpression$1172();
        expect$1135(')');
        if (match$1137(';')) {
            lex$1128();
        }
        return delegate$1091.createDoWhileStatement(body$1624, test$1625);
    }
    function parseWhileStatement$1190() {
        var test$1627, body$1628, oldInIteration$1629;
        expectKeyword$1136('while');
        expect$1135('(');
        test$1627 = parseExpression$1172();
        expect$1135(')');
        oldInIteration$1629 = state$1096.inIteration;
        state$1096.inIteration = true;
        body$1628 = parseStatement$1203();
        state$1096.inIteration = oldInIteration$1629;
        return delegate$1091.createWhileStatement(test$1627, body$1628);
    }
    function parseForVariableDeclaration$1191() {
        var token$1630 = lex$1128(), declarations$1631 = parseVariableDeclarationList$1177();
        return delegate$1091.createVariableDeclaration(declarations$1631, token$1630.value);
    }
    function parseForStatement$1192(opts$1632) {
        var init$1633, test$1634, update$1635, left$1636, right$1637, body$1638, operator$1639, oldInIteration$1640;
        init$1633 = test$1634 = update$1635 = null;
        expectKeyword$1136('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$1139('each')) {
            throwError$1132({}, Messages$1077.EachNotAllowed);
        }
        expect$1135('(');
        if (match$1137(';')) {
            lex$1128();
        } else {
            if (matchKeyword$1138('var') || matchKeyword$1138('let') || matchKeyword$1138('const')) {
                state$1096.allowIn = false;
                init$1633 = parseForVariableDeclaration$1191();
                state$1096.allowIn = true;
                if (init$1633.declarations.length === 1) {
                    if (matchKeyword$1138('in') || matchContextualKeyword$1139('of')) {
                        operator$1639 = lookahead$1094;
                        if (!((operator$1639.value === 'in' || init$1633.kind !== 'var') && init$1633.declarations[0].init)) {
                            lex$1128();
                            left$1636 = init$1633;
                            right$1637 = parseExpression$1172();
                            init$1633 = null;
                        }
                    }
                }
            } else {
                state$1096.allowIn = false;
                init$1633 = parseExpression$1172();
                state$1096.allowIn = true;
                if (matchContextualKeyword$1139('of')) {
                    operator$1639 = lex$1128();
                    left$1636 = init$1633;
                    right$1637 = parseExpression$1172();
                    init$1633 = null;
                } else if (matchKeyword$1138('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$1143(init$1633)) {
                        throwError$1132({}, Messages$1077.InvalidLHSInForIn);
                    }
                    operator$1639 = lex$1128();
                    left$1636 = init$1633;
                    right$1637 = parseExpression$1172();
                    init$1633 = null;
                }
            }
            if (typeof left$1636 === 'undefined') {
                expect$1135(';');
            }
        }
        if (typeof left$1636 === 'undefined') {
            if (!match$1137(';')) {
                test$1634 = parseExpression$1172();
            }
            expect$1135(';');
            if (!match$1137(')')) {
                update$1635 = parseExpression$1172();
            }
        }
        expect$1135(')');
        oldInIteration$1640 = state$1096.inIteration;
        state$1096.inIteration = true;
        if (!(opts$1632 !== undefined && opts$1632.ignoreBody)) {
            body$1638 = parseStatement$1203();
        }
        state$1096.inIteration = oldInIteration$1640;
        if (typeof left$1636 === 'undefined') {
            return delegate$1091.createForStatement(init$1633, test$1634, update$1635, body$1638);
        }
        if (operator$1639.value === 'in') {
            return delegate$1091.createForInStatement(left$1636, right$1637, body$1638);
        }
        return delegate$1091.createForOfStatement(left$1636, right$1637, body$1638);
    }
    // 12.7 The continue statement
    function parseContinueStatement$1193() {
        var label$1641 = null, key$1642;
        expectKeyword$1136('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$1094.value.charCodeAt(0) === 59) {
            lex$1128();
            if (!state$1096.inIteration) {
                throwError$1132({}, Messages$1077.IllegalContinue);
            }
            return delegate$1091.createContinueStatement(null);
        }
        if (peekLineTerminator$1131()) {
            if (!state$1096.inIteration) {
                throwError$1132({}, Messages$1077.IllegalContinue);
            }
            return delegate$1091.createContinueStatement(null);
        }
        if (lookahead$1094.type === Token$1072.Identifier) {
            label$1641 = parseVariableIdentifier$1175();
            key$1642 = '$' + label$1641.name;
            if (!Object.prototype.hasOwnProperty.call(state$1096.labelSet, key$1642)) {
                throwError$1132({}, Messages$1077.UnknownLabel, label$1641.name);
            }
        }
        consumeSemicolon$1141();
        if (label$1641 === null && !state$1096.inIteration) {
            throwError$1132({}, Messages$1077.IllegalContinue);
        }
        return delegate$1091.createContinueStatement(label$1641);
    }
    // 12.8 The break statement
    function parseBreakStatement$1194() {
        var label$1643 = null, key$1644;
        expectKeyword$1136('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$1094.value.charCodeAt(0) === 59) {
            lex$1128();
            if (!(state$1096.inIteration || state$1096.inSwitch)) {
                throwError$1132({}, Messages$1077.IllegalBreak);
            }
            return delegate$1091.createBreakStatement(null);
        }
        if (peekLineTerminator$1131()) {
            if (!(state$1096.inIteration || state$1096.inSwitch)) {
                throwError$1132({}, Messages$1077.IllegalBreak);
            }
            return delegate$1091.createBreakStatement(null);
        }
        if (lookahead$1094.type === Token$1072.Identifier) {
            label$1643 = parseVariableIdentifier$1175();
            key$1644 = '$' + label$1643.name;
            if (!Object.prototype.hasOwnProperty.call(state$1096.labelSet, key$1644)) {
                throwError$1132({}, Messages$1077.UnknownLabel, label$1643.name);
            }
        }
        consumeSemicolon$1141();
        if (label$1643 === null && !(state$1096.inIteration || state$1096.inSwitch)) {
            throwError$1132({}, Messages$1077.IllegalBreak);
        }
        return delegate$1091.createBreakStatement(label$1643);
    }
    // 12.9 The return statement
    function parseReturnStatement$1195() {
        var argument$1645 = null;
        expectKeyword$1136('return');
        if (!state$1096.inFunctionBody) {
            throwErrorTolerant$1133({}, Messages$1077.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$1105(String(lookahead$1094.value).charCodeAt(0))) {
            argument$1645 = parseExpression$1172();
            consumeSemicolon$1141();
            return delegate$1091.createReturnStatement(argument$1645);
        }
        if (peekLineTerminator$1131()) {
            return delegate$1091.createReturnStatement(null);
        }
        if (!match$1137(';')) {
            if (!match$1137('}') && lookahead$1094.type !== Token$1072.EOF) {
                argument$1645 = parseExpression$1172();
            }
        }
        consumeSemicolon$1141();
        return delegate$1091.createReturnStatement(argument$1645);
    }
    // 12.10 The with statement
    function parseWithStatement$1196() {
        var object$1646, body$1647;
        if (strict$1082) {
            throwErrorTolerant$1133({}, Messages$1077.StrictModeWith);
        }
        expectKeyword$1136('with');
        expect$1135('(');
        object$1646 = parseExpression$1172();
        expect$1135(')');
        body$1647 = parseStatement$1203();
        return delegate$1091.createWithStatement(object$1646, body$1647);
    }
    // 12.10 The swith statement
    function parseSwitchCase$1197() {
        var test$1648, consequent$1649 = [], sourceElement$1650;
        if (matchKeyword$1138('default')) {
            lex$1128();
            test$1648 = null;
        } else {
            expectKeyword$1136('case');
            test$1648 = parseExpression$1172();
        }
        expect$1135(':');
        while (streamIndex$1093 < length$1090) {
            if (match$1137('}') || matchKeyword$1138('default') || matchKeyword$1138('case')) {
                break;
            }
            sourceElement$1650 = parseSourceElement$1218();
            if (typeof sourceElement$1650 === 'undefined') {
                break;
            }
            consequent$1649.push(sourceElement$1650);
        }
        return delegate$1091.createSwitchCase(test$1648, consequent$1649);
    }
    function parseSwitchStatement$1198() {
        var discriminant$1651, cases$1652, clause$1653, oldInSwitch$1654, defaultFound$1655;
        expectKeyword$1136('switch');
        expect$1135('(');
        discriminant$1651 = parseExpression$1172();
        expect$1135(')');
        expect$1135('{');
        cases$1652 = [];
        if (match$1137('}')) {
            lex$1128();
            return delegate$1091.createSwitchStatement(discriminant$1651, cases$1652);
        }
        oldInSwitch$1654 = state$1096.inSwitch;
        state$1096.inSwitch = true;
        defaultFound$1655 = false;
        while (streamIndex$1093 < length$1090) {
            if (match$1137('}')) {
                break;
            }
            clause$1653 = parseSwitchCase$1197();
            if (clause$1653.test === null) {
                if (defaultFound$1655) {
                    throwError$1132({}, Messages$1077.MultipleDefaultsInSwitch);
                }
                defaultFound$1655 = true;
            }
            cases$1652.push(clause$1653);
        }
        state$1096.inSwitch = oldInSwitch$1654;
        expect$1135('}');
        return delegate$1091.createSwitchStatement(discriminant$1651, cases$1652);
    }
    // 12.13 The throw statement
    function parseThrowStatement$1199() {
        var argument$1656;
        expectKeyword$1136('throw');
        if (peekLineTerminator$1131()) {
            throwError$1132({}, Messages$1077.NewlineAfterThrow);
        }
        argument$1656 = parseExpression$1172();
        consumeSemicolon$1141();
        return delegate$1091.createThrowStatement(argument$1656);
    }
    // 12.14 The try statement
    function parseCatchClause$1200() {
        var param$1657, body$1658;
        expectKeyword$1136('catch');
        expect$1135('(');
        if (match$1137(')')) {
            throwUnexpected$1134(lookahead$1094);
        }
        param$1657 = parseExpression$1172();
        // 12.14.1
        if (strict$1082 && param$1657.type === Syntax$1075.Identifier && isRestrictedWord$1109(param$1657.name)) {
            throwErrorTolerant$1133({}, Messages$1077.StrictCatchVariable);
        }
        expect$1135(')');
        body$1658 = parseBlock$1174();
        return delegate$1091.createCatchClause(param$1657, body$1658);
    }
    function parseTryStatement$1201() {
        var block$1659, handlers$1660 = [], finalizer$1661 = null;
        expectKeyword$1136('try');
        block$1659 = parseBlock$1174();
        if (matchKeyword$1138('catch')) {
            handlers$1660.push(parseCatchClause$1200());
        }
        if (matchKeyword$1138('finally')) {
            lex$1128();
            finalizer$1661 = parseBlock$1174();
        }
        if (handlers$1660.length === 0 && !finalizer$1661) {
            throwError$1132({}, Messages$1077.NoCatchOrFinally);
        }
        return delegate$1091.createTryStatement(block$1659, [], handlers$1660, finalizer$1661);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$1202() {
        expectKeyword$1136('debugger');
        consumeSemicolon$1141();
        return delegate$1091.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$1203() {
        var type$1662 = lookahead$1094.type, expr$1663, labeledBody$1664, key$1665;
        if (type$1662 === Token$1072.EOF) {
            throwUnexpected$1134(lookahead$1094);
        }
        if (type$1662 === Token$1072.Punctuator) {
            switch (lookahead$1094.value) {
            case ';':
                return parseEmptyStatement$1186();
            case '{':
                return parseBlock$1174();
            case '(':
                return parseExpressionStatement$1187();
            default:
                break;
            }
        }
        if (type$1662 === Token$1072.Keyword) {
            switch (lookahead$1094.value) {
            case 'break':
                return parseBreakStatement$1194();
            case 'continue':
                return parseContinueStatement$1193();
            case 'debugger':
                return parseDebuggerStatement$1202();
            case 'do':
                return parseDoWhileStatement$1189();
            case 'for':
                return parseForStatement$1192();
            case 'function':
                return parseFunctionDeclaration$1209();
            case 'class':
                return parseClassDeclaration$1216();
            case 'if':
                return parseIfStatement$1188();
            case 'return':
                return parseReturnStatement$1195();
            case 'switch':
                return parseSwitchStatement$1198();
            case 'throw':
                return parseThrowStatement$1199();
            case 'try':
                return parseTryStatement$1201();
            case 'var':
                return parseVariableStatement$1178();
            case 'while':
                return parseWhileStatement$1190();
            case 'with':
                return parseWithStatement$1196();
            default:
                break;
            }
        }
        expr$1663 = parseExpression$1172();
        // 12.12 Labelled Statements
        if (expr$1663.type === Syntax$1075.Identifier && match$1137(':')) {
            lex$1128();
            key$1665 = '$' + expr$1663.name;
            if (Object.prototype.hasOwnProperty.call(state$1096.labelSet, key$1665)) {
                throwError$1132({}, Messages$1077.Redeclaration, 'Label', expr$1663.name);
            }
            state$1096.labelSet[key$1665] = true;
            labeledBody$1664 = parseStatement$1203();
            delete state$1096.labelSet[key$1665];
            return delegate$1091.createLabeledStatement(expr$1663, labeledBody$1664);
        }
        consumeSemicolon$1141();
        return delegate$1091.createExpressionStatement(expr$1663);
    }
    // 13 Function Definition
    function parseConciseBody$1204() {
        if (match$1137('{')) {
            return parseFunctionSourceElements$1205();
        }
        return parseAssignmentExpression$1171();
    }
    function parseFunctionSourceElements$1205() {
        var sourceElement$1666, sourceElements$1667 = [], token$1668, directive$1669, firstRestricted$1670, oldLabelSet$1671, oldInIteration$1672, oldInSwitch$1673, oldInFunctionBody$1674, oldParenthesizedCount$1675;
        expect$1135('{');
        while (streamIndex$1093 < length$1090) {
            if (lookahead$1094.type !== Token$1072.StringLiteral) {
                break;
            }
            token$1668 = lookahead$1094;
            sourceElement$1666 = parseSourceElement$1218();
            sourceElements$1667.push(sourceElement$1666);
            if (sourceElement$1666.expression.type !== Syntax$1075.Literal) {
                // this is not directive
                break;
            }
            directive$1669 = token$1668.value;
            if (directive$1669 === 'use strict') {
                strict$1082 = true;
                if (firstRestricted$1670) {
                    throwErrorTolerant$1133(firstRestricted$1670, Messages$1077.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1670 && token$1668.octal) {
                    firstRestricted$1670 = token$1668;
                }
            }
        }
        oldLabelSet$1671 = state$1096.labelSet;
        oldInIteration$1672 = state$1096.inIteration;
        oldInSwitch$1673 = state$1096.inSwitch;
        oldInFunctionBody$1674 = state$1096.inFunctionBody;
        oldParenthesizedCount$1675 = state$1096.parenthesizedCount;
        state$1096.labelSet = {};
        state$1096.inIteration = false;
        state$1096.inSwitch = false;
        state$1096.inFunctionBody = true;
        state$1096.parenthesizedCount = 0;
        while (streamIndex$1093 < length$1090) {
            if (match$1137('}')) {
                break;
            }
            sourceElement$1666 = parseSourceElement$1218();
            if (typeof sourceElement$1666 === 'undefined') {
                break;
            }
            sourceElements$1667.push(sourceElement$1666);
        }
        expect$1135('}');
        state$1096.labelSet = oldLabelSet$1671;
        state$1096.inIteration = oldInIteration$1672;
        state$1096.inSwitch = oldInSwitch$1673;
        state$1096.inFunctionBody = oldInFunctionBody$1674;
        state$1096.parenthesizedCount = oldParenthesizedCount$1675;
        return delegate$1091.createBlockStatement(sourceElements$1667);
    }
    function validateParam$1206(options$1676, param$1677, name$1678) {
        var key$1679 = '$' + name$1678;
        if (strict$1082) {
            if (isRestrictedWord$1109(name$1678)) {
                options$1676.stricted = param$1677;
                options$1676.message = Messages$1077.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1676.paramSet, key$1679)) {
                options$1676.stricted = param$1677;
                options$1676.message = Messages$1077.StrictParamDupe;
            }
        } else if (!options$1676.firstRestricted) {
            if (isRestrictedWord$1109(name$1678)) {
                options$1676.firstRestricted = param$1677;
                options$1676.message = Messages$1077.StrictParamName;
            } else if (isStrictModeReservedWord$1108(name$1678)) {
                options$1676.firstRestricted = param$1677;
                options$1676.message = Messages$1077.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1676.paramSet, key$1679)) {
                options$1676.firstRestricted = param$1677;
                options$1676.message = Messages$1077.StrictParamDupe;
            }
        }
        options$1676.paramSet[key$1679] = true;
    }
    function parseParam$1207(options$1680) {
        var token$1681, rest$1682, param$1683, def$1684;
        token$1681 = lookahead$1094;
        if (token$1681.value === '...') {
            token$1681 = lex$1128();
            rest$1682 = true;
        }
        if (match$1137('[')) {
            param$1683 = parseArrayInitialiser$1144();
            reinterpretAsDestructuredParameter$1168(options$1680, param$1683);
        } else if (match$1137('{')) {
            if (rest$1682) {
                throwError$1132({}, Messages$1077.ObjectPatternAsRestParameter);
            }
            param$1683 = parseObjectInitialiser$1149();
            reinterpretAsDestructuredParameter$1168(options$1680, param$1683);
        } else {
            param$1683 = parseVariableIdentifier$1175();
            validateParam$1206(options$1680, token$1681, token$1681.value);
            if (match$1137('=')) {
                if (rest$1682) {
                    throwErrorTolerant$1133(lookahead$1094, Messages$1077.DefaultRestParameter);
                }
                lex$1128();
                def$1684 = parseAssignmentExpression$1171();
                ++options$1680.defaultCount;
            }
        }
        if (rest$1682) {
            if (!match$1137(')')) {
                throwError$1132({}, Messages$1077.ParameterAfterRestParameter);
            }
            options$1680.rest = param$1683;
            return false;
        }
        options$1680.params.push(param$1683);
        options$1680.defaults.push(def$1684);
        return !match$1137(')');
    }
    function parseParams$1208(firstRestricted$1685) {
        var options$1686;
        options$1686 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1685
        };
        expect$1135('(');
        if (!match$1137(')')) {
            options$1686.paramSet = {};
            while (streamIndex$1093 < length$1090) {
                if (!parseParam$1207(options$1686)) {
                    break;
                }
                expect$1135(',');
            }
        }
        expect$1135(')');
        if (options$1686.defaultCount === 0) {
            options$1686.defaults = [];
        }
        return options$1686;
    }
    function parseFunctionDeclaration$1209() {
        var id$1687, body$1688, token$1689, tmp$1690, firstRestricted$1691, message$1692, previousStrict$1693, previousYieldAllowed$1694, generator$1695, expression$1696;
        expectKeyword$1136('function');
        generator$1695 = false;
        if (match$1137('*')) {
            lex$1128();
            generator$1695 = true;
        }
        token$1689 = lookahead$1094;
        id$1687 = parseVariableIdentifier$1175();
        if (strict$1082) {
            if (isRestrictedWord$1109(token$1689.value)) {
                throwErrorTolerant$1133(token$1689, Messages$1077.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$1109(token$1689.value)) {
                firstRestricted$1691 = token$1689;
                message$1692 = Messages$1077.StrictFunctionName;
            } else if (isStrictModeReservedWord$1108(token$1689.value)) {
                firstRestricted$1691 = token$1689;
                message$1692 = Messages$1077.StrictReservedWord;
            }
        }
        tmp$1690 = parseParams$1208(firstRestricted$1691);
        firstRestricted$1691 = tmp$1690.firstRestricted;
        if (tmp$1690.message) {
            message$1692 = tmp$1690.message;
        }
        previousStrict$1693 = strict$1082;
        previousYieldAllowed$1694 = state$1096.yieldAllowed;
        state$1096.yieldAllowed = generator$1695;
        // here we redo some work in order to set 'expression'
        expression$1696 = !match$1137('{');
        body$1688 = parseConciseBody$1204();
        if (strict$1082 && firstRestricted$1691) {
            throwError$1132(firstRestricted$1691, message$1692);
        }
        if (strict$1082 && tmp$1690.stricted) {
            throwErrorTolerant$1133(tmp$1690.stricted, message$1692);
        }
        if (state$1096.yieldAllowed && !state$1096.yieldFound) {
            throwErrorTolerant$1133({}, Messages$1077.NoYieldInGenerator);
        }
        strict$1082 = previousStrict$1693;
        state$1096.yieldAllowed = previousYieldAllowed$1694;
        return delegate$1091.createFunctionDeclaration(id$1687, tmp$1690.params, tmp$1690.defaults, body$1688, tmp$1690.rest, generator$1695, expression$1696);
    }
    function parseFunctionExpression$1210() {
        var token$1697, id$1698 = null, firstRestricted$1699, message$1700, tmp$1701, body$1702, previousStrict$1703, previousYieldAllowed$1704, generator$1705, expression$1706;
        expectKeyword$1136('function');
        generator$1705 = false;
        if (match$1137('*')) {
            lex$1128();
            generator$1705 = true;
        }
        if (!match$1137('(')) {
            token$1697 = lookahead$1094;
            id$1698 = parseVariableIdentifier$1175();
            if (strict$1082) {
                if (isRestrictedWord$1109(token$1697.value)) {
                    throwErrorTolerant$1133(token$1697, Messages$1077.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$1109(token$1697.value)) {
                    firstRestricted$1699 = token$1697;
                    message$1700 = Messages$1077.StrictFunctionName;
                } else if (isStrictModeReservedWord$1108(token$1697.value)) {
                    firstRestricted$1699 = token$1697;
                    message$1700 = Messages$1077.StrictReservedWord;
                }
            }
        }
        tmp$1701 = parseParams$1208(firstRestricted$1699);
        firstRestricted$1699 = tmp$1701.firstRestricted;
        if (tmp$1701.message) {
            message$1700 = tmp$1701.message;
        }
        previousStrict$1703 = strict$1082;
        previousYieldAllowed$1704 = state$1096.yieldAllowed;
        state$1096.yieldAllowed = generator$1705;
        // here we redo some work in order to set 'expression'
        expression$1706 = !match$1137('{');
        body$1702 = parseConciseBody$1204();
        if (strict$1082 && firstRestricted$1699) {
            throwError$1132(firstRestricted$1699, message$1700);
        }
        if (strict$1082 && tmp$1701.stricted) {
            throwErrorTolerant$1133(tmp$1701.stricted, message$1700);
        }
        if (state$1096.yieldAllowed && !state$1096.yieldFound) {
            throwErrorTolerant$1133({}, Messages$1077.NoYieldInGenerator);
        }
        strict$1082 = previousStrict$1703;
        state$1096.yieldAllowed = previousYieldAllowed$1704;
        return delegate$1091.createFunctionExpression(id$1698, tmp$1701.params, tmp$1701.defaults, body$1702, tmp$1701.rest, generator$1705, expression$1706);
    }
    function parseYieldExpression$1211() {
        var delegateFlag$1707, expr$1708, previousYieldAllowed$1709;
        expectKeyword$1136('yield');
        if (!state$1096.yieldAllowed) {
            throwErrorTolerant$1133({}, Messages$1077.IllegalYield);
        }
        delegateFlag$1707 = false;
        if (match$1137('*')) {
            lex$1128();
            delegateFlag$1707 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1709 = state$1096.yieldAllowed;
        state$1096.yieldAllowed = false;
        expr$1708 = parseAssignmentExpression$1171();
        state$1096.yieldAllowed = previousYieldAllowed$1709;
        state$1096.yieldFound = true;
        return delegate$1091.createYieldExpression(expr$1708, delegateFlag$1707);
    }
    // 14 Classes
    function parseMethodDefinition$1212(existingPropNames$1710) {
        var token$1711, key$1712, param$1713, propType$1714, isValidDuplicateProp$1715 = false;
        if (lookahead$1094.value === 'static') {
            propType$1714 = ClassPropertyType$1080.static;
            lex$1128();
        } else {
            propType$1714 = ClassPropertyType$1080.prototype;
        }
        if (match$1137('*')) {
            lex$1128();
            return delegate$1091.createMethodDefinition(propType$1714, '', parseObjectPropertyKey$1147(), parsePropertyMethodFunction$1146({ generator: true }));
        }
        token$1711 = lookahead$1094;
        key$1712 = parseObjectPropertyKey$1147();
        if (token$1711.value === 'get' && !match$1137('(')) {
            key$1712 = parseObjectPropertyKey$1147();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1710[propType$1714].hasOwnProperty(key$1712.name)) {
                isValidDuplicateProp$1715 = existingPropNames$1710[propType$1714][key$1712.name].get === undefined && existingPropNames$1710[propType$1714][key$1712.name].data === undefined && existingPropNames$1710[propType$1714][key$1712.name].set !== undefined;
                if (!isValidDuplicateProp$1715) {
                    throwError$1132(key$1712, Messages$1077.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1710[propType$1714][key$1712.name] = {};
            }
            existingPropNames$1710[propType$1714][key$1712.name].get = true;
            expect$1135('(');
            expect$1135(')');
            return delegate$1091.createMethodDefinition(propType$1714, 'get', key$1712, parsePropertyFunction$1145({ generator: false }));
        }
        if (token$1711.value === 'set' && !match$1137('(')) {
            key$1712 = parseObjectPropertyKey$1147();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1710[propType$1714].hasOwnProperty(key$1712.name)) {
                isValidDuplicateProp$1715 = existingPropNames$1710[propType$1714][key$1712.name].set === undefined && existingPropNames$1710[propType$1714][key$1712.name].data === undefined && existingPropNames$1710[propType$1714][key$1712.name].get !== undefined;
                if (!isValidDuplicateProp$1715) {
                    throwError$1132(key$1712, Messages$1077.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1710[propType$1714][key$1712.name] = {};
            }
            existingPropNames$1710[propType$1714][key$1712.name].set = true;
            expect$1135('(');
            token$1711 = lookahead$1094;
            param$1713 = [parseVariableIdentifier$1175()];
            expect$1135(')');
            return delegate$1091.createMethodDefinition(propType$1714, 'set', key$1712, parsePropertyFunction$1145({
                params: param$1713,
                generator: false,
                name: token$1711
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1710[propType$1714].hasOwnProperty(key$1712.name)) {
            throwError$1132(key$1712, Messages$1077.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1710[propType$1714][key$1712.name] = {};
        }
        existingPropNames$1710[propType$1714][key$1712.name].data = true;
        return delegate$1091.createMethodDefinition(propType$1714, '', key$1712, parsePropertyMethodFunction$1146({ generator: false }));
    }
    function parseClassElement$1213(existingProps$1716) {
        if (match$1137(';')) {
            lex$1128();
            return;
        }
        return parseMethodDefinition$1212(existingProps$1716);
    }
    function parseClassBody$1214() {
        var classElement$1717, classElements$1718 = [], existingProps$1719 = {};
        existingProps$1719[ClassPropertyType$1080.static] = {};
        existingProps$1719[ClassPropertyType$1080.prototype] = {};
        expect$1135('{');
        while (streamIndex$1093 < length$1090) {
            if (match$1137('}')) {
                break;
            }
            classElement$1717 = parseClassElement$1213(existingProps$1719);
            if (typeof classElement$1717 !== 'undefined') {
                classElements$1718.push(classElement$1717);
            }
        }
        expect$1135('}');
        return delegate$1091.createClassBody(classElements$1718);
    }
    function parseClassExpression$1215() {
        var id$1720, previousYieldAllowed$1721, superClass$1722 = null;
        expectKeyword$1136('class');
        if (!matchKeyword$1138('extends') && !match$1137('{')) {
            id$1720 = parseVariableIdentifier$1175();
        }
        if (matchKeyword$1138('extends')) {
            expectKeyword$1136('extends');
            previousYieldAllowed$1721 = state$1096.yieldAllowed;
            state$1096.yieldAllowed = false;
            superClass$1722 = parseAssignmentExpression$1171();
            state$1096.yieldAllowed = previousYieldAllowed$1721;
        }
        return delegate$1091.createClassExpression(id$1720, superClass$1722, parseClassBody$1214());
    }
    function parseClassDeclaration$1216() {
        var id$1723, previousYieldAllowed$1724, superClass$1725 = null;
        expectKeyword$1136('class');
        id$1723 = parseVariableIdentifier$1175();
        if (matchKeyword$1138('extends')) {
            expectKeyword$1136('extends');
            previousYieldAllowed$1724 = state$1096.yieldAllowed;
            state$1096.yieldAllowed = false;
            superClass$1725 = parseAssignmentExpression$1171();
            state$1096.yieldAllowed = previousYieldAllowed$1724;
        }
        return delegate$1091.createClassDeclaration(id$1723, superClass$1725, parseClassBody$1214());
    }
    // 15 Program
    function matchModuleDeclaration$1217() {
        var id$1726;
        if (matchContextualKeyword$1139('module')) {
            id$1726 = lookahead2$1130();
            return id$1726.type === Token$1072.StringLiteral || id$1726.type === Token$1072.Identifier;
        }
        return false;
    }
    function parseSourceElement$1218() {
        if (lookahead$1094.type === Token$1072.Keyword) {
            switch (lookahead$1094.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$1179(lookahead$1094.value);
            case 'function':
                return parseFunctionDeclaration$1209();
            case 'export':
                return parseExportDeclaration$1183();
            case 'import':
                return parseImportDeclaration$1184();
            default:
                return parseStatement$1203();
            }
        }
        if (matchModuleDeclaration$1217()) {
            throwError$1132({}, Messages$1077.NestedModule);
        }
        if (lookahead$1094.type !== Token$1072.EOF) {
            return parseStatement$1203();
        }
    }
    function parseProgramElement$1219() {
        if (lookahead$1094.type === Token$1072.Keyword) {
            switch (lookahead$1094.value) {
            case 'export':
                return parseExportDeclaration$1183();
            case 'import':
                return parseImportDeclaration$1184();
            }
        }
        if (matchModuleDeclaration$1217()) {
            return parseModuleDeclaration$1180();
        }
        return parseSourceElement$1218();
    }
    function parseProgramElements$1220() {
        var sourceElement$1727, sourceElements$1728 = [], token$1729, directive$1730, firstRestricted$1731;
        while (streamIndex$1093 < length$1090) {
            token$1729 = lookahead$1094;
            if (token$1729.type !== Token$1072.StringLiteral) {
                break;
            }
            sourceElement$1727 = parseProgramElement$1219();
            sourceElements$1728.push(sourceElement$1727);
            if (sourceElement$1727.expression.type !== Syntax$1075.Literal) {
                // this is not directive
                break;
            }
            directive$1730 = token$1729.value;
            if (directive$1730 === 'use strict') {
                strict$1082 = true;
                if (firstRestricted$1731) {
                    throwErrorTolerant$1133(firstRestricted$1731, Messages$1077.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1731 && token$1729.octal) {
                    firstRestricted$1731 = token$1729;
                }
            }
        }
        while (streamIndex$1093 < length$1090) {
            sourceElement$1727 = parseProgramElement$1219();
            if (typeof sourceElement$1727 === 'undefined') {
                break;
            }
            sourceElements$1728.push(sourceElement$1727);
        }
        return sourceElements$1728;
    }
    function parseModuleElement$1221() {
        return parseSourceElement$1218();
    }
    function parseModuleElements$1222() {
        var list$1732 = [], statement$1733;
        while (streamIndex$1093 < length$1090) {
            if (match$1137('}')) {
                break;
            }
            statement$1733 = parseModuleElement$1221();
            if (typeof statement$1733 === 'undefined') {
                break;
            }
            list$1732.push(statement$1733);
        }
        return list$1732;
    }
    function parseModuleBlock$1223() {
        var block$1734;
        expect$1135('{');
        block$1734 = parseModuleElements$1222();
        expect$1135('}');
        return delegate$1091.createBlockStatement(block$1734);
    }
    function parseProgram$1224() {
        var body$1735;
        strict$1082 = false;
        peek$1129();
        body$1735 = parseProgramElements$1220();
        return delegate$1091.createProgram(body$1735);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1225(type$1736, value$1737, start$1738, end$1739, loc$1740) {
        assert$1098(typeof start$1738 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$1097.comments.length > 0) {
            if (extra$1097.comments[extra$1097.comments.length - 1].range[1] > start$1738) {
                return;
            }
        }
        extra$1097.comments.push({
            type: type$1736,
            value: value$1737,
            range: [
                start$1738,
                end$1739
            ],
            loc: loc$1740
        });
    }
    function scanComment$1226() {
        var comment$1741, ch$1742, loc$1743, start$1744, blockComment$1745, lineComment$1746;
        comment$1741 = '';
        blockComment$1745 = false;
        lineComment$1746 = false;
        while (index$1083 < length$1090) {
            ch$1742 = source$1081[index$1083];
            if (lineComment$1746) {
                ch$1742 = source$1081[index$1083++];
                if (isLineTerminator$1104(ch$1742.charCodeAt(0))) {
                    loc$1743.end = {
                        line: lineNumber$1084,
                        column: index$1083 - lineStart$1085 - 1
                    };
                    lineComment$1746 = false;
                    addComment$1225('Line', comment$1741, start$1744, index$1083 - 1, loc$1743);
                    if (ch$1742 === '\r' && source$1081[index$1083] === '\n') {
                        ++index$1083;
                    }
                    ++lineNumber$1084;
                    lineStart$1085 = index$1083;
                    comment$1741 = '';
                } else if (index$1083 >= length$1090) {
                    lineComment$1746 = false;
                    comment$1741 += ch$1742;
                    loc$1743.end = {
                        line: lineNumber$1084,
                        column: length$1090 - lineStart$1085
                    };
                    addComment$1225('Line', comment$1741, start$1744, length$1090, loc$1743);
                } else {
                    comment$1741 += ch$1742;
                }
            } else if (blockComment$1745) {
                if (isLineTerminator$1104(ch$1742.charCodeAt(0))) {
                    if (ch$1742 === '\r' && source$1081[index$1083 + 1] === '\n') {
                        ++index$1083;
                        comment$1741 += '\r\n';
                    } else {
                        comment$1741 += ch$1742;
                    }
                    ++lineNumber$1084;
                    ++index$1083;
                    lineStart$1085 = index$1083;
                    if (index$1083 >= length$1090) {
                        throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1742 = source$1081[index$1083++];
                    if (index$1083 >= length$1090) {
                        throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1741 += ch$1742;
                    if (ch$1742 === '*') {
                        ch$1742 = source$1081[index$1083];
                        if (ch$1742 === '/') {
                            comment$1741 = comment$1741.substr(0, comment$1741.length - 1);
                            blockComment$1745 = false;
                            ++index$1083;
                            loc$1743.end = {
                                line: lineNumber$1084,
                                column: index$1083 - lineStart$1085
                            };
                            addComment$1225('Block', comment$1741, start$1744, index$1083, loc$1743);
                            comment$1741 = '';
                        }
                    }
                }
            } else if (ch$1742 === '/') {
                ch$1742 = source$1081[index$1083 + 1];
                if (ch$1742 === '/') {
                    loc$1743 = {
                        start: {
                            line: lineNumber$1084,
                            column: index$1083 - lineStart$1085
                        }
                    };
                    start$1744 = index$1083;
                    index$1083 += 2;
                    lineComment$1746 = true;
                    if (index$1083 >= length$1090) {
                        loc$1743.end = {
                            line: lineNumber$1084,
                            column: index$1083 - lineStart$1085
                        };
                        lineComment$1746 = false;
                        addComment$1225('Line', comment$1741, start$1744, index$1083, loc$1743);
                    }
                } else if (ch$1742 === '*') {
                    start$1744 = index$1083;
                    index$1083 += 2;
                    blockComment$1745 = true;
                    loc$1743 = {
                        start: {
                            line: lineNumber$1084,
                            column: index$1083 - lineStart$1085 - 2
                        }
                    };
                    if (index$1083 >= length$1090) {
                        throwError$1132({}, Messages$1077.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1103(ch$1742.charCodeAt(0))) {
                ++index$1083;
            } else if (isLineTerminator$1104(ch$1742.charCodeAt(0))) {
                ++index$1083;
                if (ch$1742 === '\r' && source$1081[index$1083] === '\n') {
                    ++index$1083;
                }
                ++lineNumber$1084;
                lineStart$1085 = index$1083;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1227() {
        var i$1747, entry$1748, comment$1749, comments$1750 = [];
        for (i$1747 = 0; i$1747 < extra$1097.comments.length; ++i$1747) {
            entry$1748 = extra$1097.comments[i$1747];
            comment$1749 = {
                type: entry$1748.type,
                value: entry$1748.value
            };
            if (extra$1097.range) {
                comment$1749.range = entry$1748.range;
            }
            if (extra$1097.loc) {
                comment$1749.loc = entry$1748.loc;
            }
            comments$1750.push(comment$1749);
        }
        extra$1097.comments = comments$1750;
    }
    function collectToken$1228() {
        var start$1751, loc$1752, token$1753, range$1754, value$1755;
        skipComment$1111();
        start$1751 = index$1083;
        loc$1752 = {
            start: {
                line: lineNumber$1084,
                column: index$1083 - lineStart$1085
            }
        };
        token$1753 = extra$1097.advance();
        loc$1752.end = {
            line: lineNumber$1084,
            column: index$1083 - lineStart$1085
        };
        if (token$1753.type !== Token$1072.EOF) {
            range$1754 = [
                token$1753.range[0],
                token$1753.range[1]
            ];
            value$1755 = source$1081.slice(token$1753.range[0], token$1753.range[1]);
            extra$1097.tokens.push({
                type: TokenName$1073[token$1753.type],
                value: value$1755,
                range: range$1754,
                loc: loc$1752
            });
        }
        return token$1753;
    }
    function collectRegex$1229() {
        var pos$1756, loc$1757, regex$1758, token$1759;
        skipComment$1111();
        pos$1756 = index$1083;
        loc$1757 = {
            start: {
                line: lineNumber$1084,
                column: index$1083 - lineStart$1085
            }
        };
        regex$1758 = extra$1097.scanRegExp();
        loc$1757.end = {
            line: lineNumber$1084,
            column: index$1083 - lineStart$1085
        };
        if (!extra$1097.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$1097.tokens.length > 0) {
                token$1759 = extra$1097.tokens[extra$1097.tokens.length - 1];
                if (token$1759.range[0] === pos$1756 && token$1759.type === 'Punctuator') {
                    if (token$1759.value === '/' || token$1759.value === '/=') {
                        extra$1097.tokens.pop();
                    }
                }
            }
            extra$1097.tokens.push({
                type: 'RegularExpression',
                value: regex$1758.literal,
                range: [
                    pos$1756,
                    index$1083
                ],
                loc: loc$1757
            });
        }
        return regex$1758;
    }
    function filterTokenLocation$1230() {
        var i$1760, entry$1761, token$1762, tokens$1763 = [];
        for (i$1760 = 0; i$1760 < extra$1097.tokens.length; ++i$1760) {
            entry$1761 = extra$1097.tokens[i$1760];
            token$1762 = {
                type: entry$1761.type,
                value: entry$1761.value
            };
            if (extra$1097.range) {
                token$1762.range = entry$1761.range;
            }
            if (extra$1097.loc) {
                token$1762.loc = entry$1761.loc;
            }
            tokens$1763.push(token$1762);
        }
        extra$1097.tokens = tokens$1763;
    }
    function LocationMarker$1231() {
        var sm_index$1764 = lookahead$1094 ? lookahead$1094.sm_range[0] : 0;
        var sm_lineStart$1765 = lookahead$1094 ? lookahead$1094.sm_lineStart : 0;
        var sm_lineNumber$1766 = lookahead$1094 ? lookahead$1094.sm_lineNumber : 1;
        this.range = [
            sm_index$1764,
            sm_index$1764
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1766,
                column: sm_index$1764 - sm_lineStart$1765
            },
            end: {
                line: sm_lineNumber$1766,
                column: sm_index$1764 - sm_lineStart$1765
            }
        };
    }
    LocationMarker$1231.prototype = {
        constructor: LocationMarker$1231,
        end: function () {
            this.range[1] = sm_index$1089;
            this.loc.end.line = sm_lineNumber$1086;
            this.loc.end.column = sm_index$1089 - sm_lineStart$1087;
        },
        applyGroup: function (node$1767) {
            if (extra$1097.range) {
                node$1767.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$1097.loc) {
                node$1767.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1767 = delegate$1091.postProcess(node$1767);
            }
        },
        apply: function (node$1768) {
            var nodeType$1769 = typeof node$1768;
            assert$1098(nodeType$1769 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1769);
            if (extra$1097.range) {
                node$1768.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$1097.loc) {
                node$1768.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1768 = delegate$1091.postProcess(node$1768);
            }
        }
    };
    function createLocationMarker$1232() {
        return new LocationMarker$1231();
    }
    function trackGroupExpression$1233() {
        var marker$1770, expr$1771;
        marker$1770 = createLocationMarker$1232();
        expect$1135('(');
        ++state$1096.parenthesizedCount;
        expr$1771 = parseExpression$1172();
        expect$1135(')');
        marker$1770.end();
        marker$1770.applyGroup(expr$1771);
        return expr$1771;
    }
    function trackLeftHandSideExpression$1234() {
        var marker$1772, expr$1773;
        // skipComment();
        marker$1772 = createLocationMarker$1232();
        expr$1773 = matchKeyword$1138('new') ? parseNewExpression$1159() : parsePrimaryExpression$1153();
        while (match$1137('.') || match$1137('[') || lookahead$1094.type === Token$1072.Template) {
            if (match$1137('[')) {
                expr$1773 = delegate$1091.createMemberExpression('[', expr$1773, parseComputedMember$1158());
                marker$1772.end();
                marker$1772.apply(expr$1773);
            } else if (match$1137('.')) {
                expr$1773 = delegate$1091.createMemberExpression('.', expr$1773, parseNonComputedMember$1157());
                marker$1772.end();
                marker$1772.apply(expr$1773);
            } else {
                expr$1773 = delegate$1091.createTaggedTemplateExpression(expr$1773, parseTemplateLiteral$1151());
                marker$1772.end();
                marker$1772.apply(expr$1773);
            }
        }
        return expr$1773;
    }
    function trackLeftHandSideExpressionAllowCall$1235() {
        var marker$1774, expr$1775, args$1776;
        // skipComment();
        marker$1774 = createLocationMarker$1232();
        expr$1775 = matchKeyword$1138('new') ? parseNewExpression$1159() : parsePrimaryExpression$1153();
        while (match$1137('.') || match$1137('[') || match$1137('(') || lookahead$1094.type === Token$1072.Template) {
            if (match$1137('(')) {
                args$1776 = parseArguments$1154();
                expr$1775 = delegate$1091.createCallExpression(expr$1775, args$1776);
                marker$1774.end();
                marker$1774.apply(expr$1775);
            } else if (match$1137('[')) {
                expr$1775 = delegate$1091.createMemberExpression('[', expr$1775, parseComputedMember$1158());
                marker$1774.end();
                marker$1774.apply(expr$1775);
            } else if (match$1137('.')) {
                expr$1775 = delegate$1091.createMemberExpression('.', expr$1775, parseNonComputedMember$1157());
                marker$1774.end();
                marker$1774.apply(expr$1775);
            } else {
                expr$1775 = delegate$1091.createTaggedTemplateExpression(expr$1775, parseTemplateLiteral$1151());
                marker$1774.end();
                marker$1774.apply(expr$1775);
            }
        }
        return expr$1775;
    }
    function filterGroup$1236(node$1777) {
        var n$1778, i$1779, entry$1780;
        n$1778 = Object.prototype.toString.apply(node$1777) === '[object Array]' ? [] : {};
        for (i$1779 in node$1777) {
            if (node$1777.hasOwnProperty(i$1779) && i$1779 !== 'groupRange' && i$1779 !== 'groupLoc') {
                entry$1780 = node$1777[i$1779];
                if (entry$1780 === null || typeof entry$1780 !== 'object' || entry$1780 instanceof RegExp) {
                    n$1778[i$1779] = entry$1780;
                } else {
                    n$1778[i$1779] = filterGroup$1236(entry$1780);
                }
            }
        }
        return n$1778;
    }
    function wrapTrackingFunction$1237(range$1781, loc$1782) {
        return function (parseFunction$1783) {
            function isBinary$1784(node$1786) {
                return node$1786.type === Syntax$1075.LogicalExpression || node$1786.type === Syntax$1075.BinaryExpression;
            }
            function visit$1785(node$1787) {
                var start$1788, end$1789;
                if (isBinary$1784(node$1787.left)) {
                    visit$1785(node$1787.left);
                }
                if (isBinary$1784(node$1787.right)) {
                    visit$1785(node$1787.right);
                }
                if (range$1781) {
                    if (node$1787.left.groupRange || node$1787.right.groupRange) {
                        start$1788 = node$1787.left.groupRange ? node$1787.left.groupRange[0] : node$1787.left.range[0];
                        end$1789 = node$1787.right.groupRange ? node$1787.right.groupRange[1] : node$1787.right.range[1];
                        node$1787.range = [
                            start$1788,
                            end$1789
                        ];
                    } else if (typeof node$1787.range === 'undefined') {
                        start$1788 = node$1787.left.range[0];
                        end$1789 = node$1787.right.range[1];
                        node$1787.range = [
                            start$1788,
                            end$1789
                        ];
                    }
                }
                if (loc$1782) {
                    if (node$1787.left.groupLoc || node$1787.right.groupLoc) {
                        start$1788 = node$1787.left.groupLoc ? node$1787.left.groupLoc.start : node$1787.left.loc.start;
                        end$1789 = node$1787.right.groupLoc ? node$1787.right.groupLoc.end : node$1787.right.loc.end;
                        node$1787.loc = {
                            start: start$1788,
                            end: end$1789
                        };
                        node$1787 = delegate$1091.postProcess(node$1787);
                    } else if (typeof node$1787.loc === 'undefined') {
                        node$1787.loc = {
                            start: node$1787.left.loc.start,
                            end: node$1787.right.loc.end
                        };
                        node$1787 = delegate$1091.postProcess(node$1787);
                    }
                }
            }
            return function () {
                var marker$1790, node$1791, curr$1792 = lookahead$1094;
                marker$1790 = createLocationMarker$1232();
                node$1791 = parseFunction$1783.apply(null, arguments);
                marker$1790.end();
                if (node$1791.type !== Syntax$1075.Program) {
                    if (curr$1792.leadingComments) {
                        node$1791.leadingComments = curr$1792.leadingComments;
                    }
                    if (curr$1792.trailingComments) {
                        node$1791.trailingComments = curr$1792.trailingComments;
                    }
                }
                if (range$1781 && typeof node$1791.range === 'undefined') {
                    marker$1790.apply(node$1791);
                }
                if (loc$1782 && typeof node$1791.loc === 'undefined') {
                    marker$1790.apply(node$1791);
                }
                if (isBinary$1784(node$1791)) {
                    visit$1785(node$1791);
                }
                return node$1791;
            };
        };
    }
    function patch$1238() {
        var wrapTracking$1793;
        if (extra$1097.comments) {
            extra$1097.skipComment = skipComment$1111;
            skipComment$1111 = scanComment$1226;
        }
        if (extra$1097.range || extra$1097.loc) {
            extra$1097.parseGroupExpression = parseGroupExpression$1152;
            extra$1097.parseLeftHandSideExpression = parseLeftHandSideExpression$1161;
            extra$1097.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$1160;
            parseGroupExpression$1152 = trackGroupExpression$1233;
            parseLeftHandSideExpression$1161 = trackLeftHandSideExpression$1234;
            parseLeftHandSideExpressionAllowCall$1160 = trackLeftHandSideExpressionAllowCall$1235;
            wrapTracking$1793 = wrapTrackingFunction$1237(extra$1097.range, extra$1097.loc);
            extra$1097.parseArrayInitialiser = parseArrayInitialiser$1144;
            extra$1097.parseAssignmentExpression = parseAssignmentExpression$1171;
            extra$1097.parseBinaryExpression = parseBinaryExpression$1165;
            extra$1097.parseBlock = parseBlock$1174;
            extra$1097.parseFunctionSourceElements = parseFunctionSourceElements$1205;
            extra$1097.parseCatchClause = parseCatchClause$1200;
            extra$1097.parseComputedMember = parseComputedMember$1158;
            extra$1097.parseConditionalExpression = parseConditionalExpression$1166;
            extra$1097.parseConstLetDeclaration = parseConstLetDeclaration$1179;
            extra$1097.parseExportBatchSpecifier = parseExportBatchSpecifier$1181;
            extra$1097.parseExportDeclaration = parseExportDeclaration$1183;
            extra$1097.parseExportSpecifier = parseExportSpecifier$1182;
            extra$1097.parseExpression = parseExpression$1172;
            extra$1097.parseForVariableDeclaration = parseForVariableDeclaration$1191;
            extra$1097.parseFunctionDeclaration = parseFunctionDeclaration$1209;
            extra$1097.parseFunctionExpression = parseFunctionExpression$1210;
            extra$1097.parseParams = parseParams$1208;
            extra$1097.parseImportDeclaration = parseImportDeclaration$1184;
            extra$1097.parseImportSpecifier = parseImportSpecifier$1185;
            extra$1097.parseModuleDeclaration = parseModuleDeclaration$1180;
            extra$1097.parseModuleBlock = parseModuleBlock$1223;
            extra$1097.parseNewExpression = parseNewExpression$1159;
            extra$1097.parseNonComputedProperty = parseNonComputedProperty$1156;
            extra$1097.parseObjectInitialiser = parseObjectInitialiser$1149;
            extra$1097.parseObjectProperty = parseObjectProperty$1148;
            extra$1097.parseObjectPropertyKey = parseObjectPropertyKey$1147;
            extra$1097.parsePostfixExpression = parsePostfixExpression$1162;
            extra$1097.parsePrimaryExpression = parsePrimaryExpression$1153;
            extra$1097.parseProgram = parseProgram$1224;
            extra$1097.parsePropertyFunction = parsePropertyFunction$1145;
            extra$1097.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$1155;
            extra$1097.parseTemplateElement = parseTemplateElement$1150;
            extra$1097.parseTemplateLiteral = parseTemplateLiteral$1151;
            extra$1097.parseStatement = parseStatement$1203;
            extra$1097.parseSwitchCase = parseSwitchCase$1197;
            extra$1097.parseUnaryExpression = parseUnaryExpression$1163;
            extra$1097.parseVariableDeclaration = parseVariableDeclaration$1176;
            extra$1097.parseVariableIdentifier = parseVariableIdentifier$1175;
            extra$1097.parseMethodDefinition = parseMethodDefinition$1212;
            extra$1097.parseClassDeclaration = parseClassDeclaration$1216;
            extra$1097.parseClassExpression = parseClassExpression$1215;
            extra$1097.parseClassBody = parseClassBody$1214;
            parseArrayInitialiser$1144 = wrapTracking$1793(extra$1097.parseArrayInitialiser);
            parseAssignmentExpression$1171 = wrapTracking$1793(extra$1097.parseAssignmentExpression);
            parseBinaryExpression$1165 = wrapTracking$1793(extra$1097.parseBinaryExpression);
            parseBlock$1174 = wrapTracking$1793(extra$1097.parseBlock);
            parseFunctionSourceElements$1205 = wrapTracking$1793(extra$1097.parseFunctionSourceElements);
            parseCatchClause$1200 = wrapTracking$1793(extra$1097.parseCatchClause);
            parseComputedMember$1158 = wrapTracking$1793(extra$1097.parseComputedMember);
            parseConditionalExpression$1166 = wrapTracking$1793(extra$1097.parseConditionalExpression);
            parseConstLetDeclaration$1179 = wrapTracking$1793(extra$1097.parseConstLetDeclaration);
            parseExportBatchSpecifier$1181 = wrapTracking$1793(parseExportBatchSpecifier$1181);
            parseExportDeclaration$1183 = wrapTracking$1793(parseExportDeclaration$1183);
            parseExportSpecifier$1182 = wrapTracking$1793(parseExportSpecifier$1182);
            parseExpression$1172 = wrapTracking$1793(extra$1097.parseExpression);
            parseForVariableDeclaration$1191 = wrapTracking$1793(extra$1097.parseForVariableDeclaration);
            parseFunctionDeclaration$1209 = wrapTracking$1793(extra$1097.parseFunctionDeclaration);
            parseFunctionExpression$1210 = wrapTracking$1793(extra$1097.parseFunctionExpression);
            parseParams$1208 = wrapTracking$1793(extra$1097.parseParams);
            parseImportDeclaration$1184 = wrapTracking$1793(extra$1097.parseImportDeclaration);
            parseImportSpecifier$1185 = wrapTracking$1793(extra$1097.parseImportSpecifier);
            parseModuleDeclaration$1180 = wrapTracking$1793(extra$1097.parseModuleDeclaration);
            parseModuleBlock$1223 = wrapTracking$1793(extra$1097.parseModuleBlock);
            parseLeftHandSideExpression$1161 = wrapTracking$1793(parseLeftHandSideExpression$1161);
            parseNewExpression$1159 = wrapTracking$1793(extra$1097.parseNewExpression);
            parseNonComputedProperty$1156 = wrapTracking$1793(extra$1097.parseNonComputedProperty);
            parseObjectInitialiser$1149 = wrapTracking$1793(extra$1097.parseObjectInitialiser);
            parseObjectProperty$1148 = wrapTracking$1793(extra$1097.parseObjectProperty);
            parseObjectPropertyKey$1147 = wrapTracking$1793(extra$1097.parseObjectPropertyKey);
            parsePostfixExpression$1162 = wrapTracking$1793(extra$1097.parsePostfixExpression);
            parsePrimaryExpression$1153 = wrapTracking$1793(extra$1097.parsePrimaryExpression);
            parseProgram$1224 = wrapTracking$1793(extra$1097.parseProgram);
            parsePropertyFunction$1145 = wrapTracking$1793(extra$1097.parsePropertyFunction);
            parseTemplateElement$1150 = wrapTracking$1793(extra$1097.parseTemplateElement);
            parseTemplateLiteral$1151 = wrapTracking$1793(extra$1097.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$1155 = wrapTracking$1793(extra$1097.parseSpreadOrAssignmentExpression);
            parseStatement$1203 = wrapTracking$1793(extra$1097.parseStatement);
            parseSwitchCase$1197 = wrapTracking$1793(extra$1097.parseSwitchCase);
            parseUnaryExpression$1163 = wrapTracking$1793(extra$1097.parseUnaryExpression);
            parseVariableDeclaration$1176 = wrapTracking$1793(extra$1097.parseVariableDeclaration);
            parseVariableIdentifier$1175 = wrapTracking$1793(extra$1097.parseVariableIdentifier);
            parseMethodDefinition$1212 = wrapTracking$1793(extra$1097.parseMethodDefinition);
            parseClassDeclaration$1216 = wrapTracking$1793(extra$1097.parseClassDeclaration);
            parseClassExpression$1215 = wrapTracking$1793(extra$1097.parseClassExpression);
            parseClassBody$1214 = wrapTracking$1793(extra$1097.parseClassBody);
        }
        if (typeof extra$1097.tokens !== 'undefined') {
            extra$1097.advance = advance$1127;
            extra$1097.scanRegExp = scanRegExp$1124;
            advance$1127 = collectToken$1228;
            scanRegExp$1124 = collectRegex$1229;
        }
    }
    function unpatch$1239() {
        if (typeof extra$1097.skipComment === 'function') {
            skipComment$1111 = extra$1097.skipComment;
        }
        if (extra$1097.range || extra$1097.loc) {
            parseArrayInitialiser$1144 = extra$1097.parseArrayInitialiser;
            parseAssignmentExpression$1171 = extra$1097.parseAssignmentExpression;
            parseBinaryExpression$1165 = extra$1097.parseBinaryExpression;
            parseBlock$1174 = extra$1097.parseBlock;
            parseFunctionSourceElements$1205 = extra$1097.parseFunctionSourceElements;
            parseCatchClause$1200 = extra$1097.parseCatchClause;
            parseComputedMember$1158 = extra$1097.parseComputedMember;
            parseConditionalExpression$1166 = extra$1097.parseConditionalExpression;
            parseConstLetDeclaration$1179 = extra$1097.parseConstLetDeclaration;
            parseExportBatchSpecifier$1181 = extra$1097.parseExportBatchSpecifier;
            parseExportDeclaration$1183 = extra$1097.parseExportDeclaration;
            parseExportSpecifier$1182 = extra$1097.parseExportSpecifier;
            parseExpression$1172 = extra$1097.parseExpression;
            parseForVariableDeclaration$1191 = extra$1097.parseForVariableDeclaration;
            parseFunctionDeclaration$1209 = extra$1097.parseFunctionDeclaration;
            parseFunctionExpression$1210 = extra$1097.parseFunctionExpression;
            parseImportDeclaration$1184 = extra$1097.parseImportDeclaration;
            parseImportSpecifier$1185 = extra$1097.parseImportSpecifier;
            parseGroupExpression$1152 = extra$1097.parseGroupExpression;
            parseLeftHandSideExpression$1161 = extra$1097.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$1160 = extra$1097.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$1180 = extra$1097.parseModuleDeclaration;
            parseModuleBlock$1223 = extra$1097.parseModuleBlock;
            parseNewExpression$1159 = extra$1097.parseNewExpression;
            parseNonComputedProperty$1156 = extra$1097.parseNonComputedProperty;
            parseObjectInitialiser$1149 = extra$1097.parseObjectInitialiser;
            parseObjectProperty$1148 = extra$1097.parseObjectProperty;
            parseObjectPropertyKey$1147 = extra$1097.parseObjectPropertyKey;
            parsePostfixExpression$1162 = extra$1097.parsePostfixExpression;
            parsePrimaryExpression$1153 = extra$1097.parsePrimaryExpression;
            parseProgram$1224 = extra$1097.parseProgram;
            parsePropertyFunction$1145 = extra$1097.parsePropertyFunction;
            parseTemplateElement$1150 = extra$1097.parseTemplateElement;
            parseTemplateLiteral$1151 = extra$1097.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$1155 = extra$1097.parseSpreadOrAssignmentExpression;
            parseStatement$1203 = extra$1097.parseStatement;
            parseSwitchCase$1197 = extra$1097.parseSwitchCase;
            parseUnaryExpression$1163 = extra$1097.parseUnaryExpression;
            parseVariableDeclaration$1176 = extra$1097.parseVariableDeclaration;
            parseVariableIdentifier$1175 = extra$1097.parseVariableIdentifier;
            parseMethodDefinition$1212 = extra$1097.parseMethodDefinition;
            parseClassDeclaration$1216 = extra$1097.parseClassDeclaration;
            parseClassExpression$1215 = extra$1097.parseClassExpression;
            parseClassBody$1214 = extra$1097.parseClassBody;
        }
        if (typeof extra$1097.scanRegExp === 'function') {
            advance$1127 = extra$1097.advance;
            scanRegExp$1124 = extra$1097.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1240(object$1794, properties$1795) {
        var entry$1796, result$1797 = {};
        for (entry$1796 in object$1794) {
            if (object$1794.hasOwnProperty(entry$1796)) {
                result$1797[entry$1796] = object$1794[entry$1796];
            }
        }
        for (entry$1796 in properties$1795) {
            if (properties$1795.hasOwnProperty(entry$1796)) {
                result$1797[entry$1796] = properties$1795[entry$1796];
            }
        }
        return result$1797;
    }
    function tokenize$1241(code$1798, options$1799) {
        var toString$1800, token$1801, tokens$1802;
        toString$1800 = String;
        if (typeof code$1798 !== 'string' && !(code$1798 instanceof String)) {
            code$1798 = toString$1800(code$1798);
        }
        delegate$1091 = SyntaxTreeDelegate$1079;
        source$1081 = code$1798;
        index$1083 = 0;
        lineNumber$1084 = source$1081.length > 0 ? 1 : 0;
        lineStart$1085 = 0;
        length$1090 = source$1081.length;
        lookahead$1094 = null;
        state$1096 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$1097 = {};
        // Options matching.
        options$1799 = options$1799 || {};
        // Of course we collect tokens here.
        options$1799.tokens = true;
        extra$1097.tokens = [];
        extra$1097.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$1097.openParenToken = -1;
        extra$1097.openCurlyToken = -1;
        extra$1097.range = typeof options$1799.range === 'boolean' && options$1799.range;
        extra$1097.loc = typeof options$1799.loc === 'boolean' && options$1799.loc;
        if (typeof options$1799.comment === 'boolean' && options$1799.comment) {
            extra$1097.comments = [];
        }
        if (typeof options$1799.tolerant === 'boolean' && options$1799.tolerant) {
            extra$1097.errors = [];
        }
        if (length$1090 > 0) {
            if (typeof source$1081[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1798 instanceof String) {
                    source$1081 = code$1798.valueOf();
                }
            }
        }
        patch$1238();
        try {
            peek$1129();
            if (lookahead$1094.type === Token$1072.EOF) {
                return extra$1097.tokens;
            }
            token$1801 = lex$1128();
            while (lookahead$1094.type !== Token$1072.EOF) {
                try {
                    token$1801 = lex$1128();
                } catch (lexError$1803) {
                    token$1801 = lookahead$1094;
                    if (extra$1097.errors) {
                        extra$1097.errors.push(lexError$1803);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1803;
                    }
                }
            }
            filterTokenLocation$1230();
            tokens$1802 = extra$1097.tokens;
            if (typeof extra$1097.comments !== 'undefined') {
                filterCommentLocation$1227();
                tokens$1802.comments = extra$1097.comments;
            }
            if (typeof extra$1097.errors !== 'undefined') {
                tokens$1802.errors = extra$1097.errors;
            }
        } catch (e$1804) {
            throw e$1804;
        } finally {
            unpatch$1239();
            extra$1097 = {};
        }
        return tokens$1802;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1242(toks$1805, start$1806, inExprDelim$1807, parentIsBlock$1808) {
        var assignOps$1809 = [
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
        var binaryOps$1810 = [
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
        var unaryOps$1811 = [
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
        function back$1812(n$1813) {
            var idx$1814 = toks$1805.length - n$1813 > 0 ? toks$1805.length - n$1813 : 0;
            return toks$1805[idx$1814];
        }
        if (inExprDelim$1807 && toks$1805.length - (start$1806 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1812(start$1806 + 2).value === ':' && parentIsBlock$1808) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$1099(back$1812(start$1806 + 2).value, unaryOps$1811.concat(binaryOps$1810).concat(assignOps$1809))) {
            // ... + {...}
            return false;
        } else if (back$1812(start$1806 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1815 = typeof back$1812(start$1806 + 1).startLineNumber !== 'undefined' ? back$1812(start$1806 + 1).startLineNumber : back$1812(start$1806 + 1).lineNumber;
            if (back$1812(start$1806 + 2).lineNumber !== currLineNumber$1815) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$1099(back$1812(start$1806 + 2).value, [
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
    function readToken$1243(toks$1816, inExprDelim$1817, parentIsBlock$1818) {
        var delimiters$1819 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1820 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1821 = toks$1816.length - 1;
        var comments$1822, commentsLen$1823 = extra$1097.comments.length;
        function back$1824(n$1828) {
            var idx$1829 = toks$1816.length - n$1828 > 0 ? toks$1816.length - n$1828 : 0;
            return toks$1816[idx$1829];
        }
        function attachComments$1825(token$1830) {
            if (comments$1822) {
                token$1830.leadingComments = comments$1822;
            }
            return token$1830;
        }
        function _advance$1826() {
            return attachComments$1825(advance$1127());
        }
        function _scanRegExp$1827() {
            return attachComments$1825(scanRegExp$1124());
        }
        skipComment$1111();
        if (extra$1097.comments.length > commentsLen$1823) {
            comments$1822 = extra$1097.comments.slice(commentsLen$1823);
        }
        if (isIn$1099(source$1081[index$1083], delimiters$1819)) {
            return attachComments$1825(readDelim$1244(toks$1816, inExprDelim$1817, parentIsBlock$1818));
        }
        if (source$1081[index$1083] === '/') {
            var prev$1831 = back$1824(1);
            if (prev$1831) {
                if (prev$1831.value === '()') {
                    if (isIn$1099(back$1824(2).value, parenIdents$1820)) {
                        // ... if (...) / ...
                        return _scanRegExp$1827();
                    }
                    // ... (...) / ...
                    return _advance$1826();
                }
                if (prev$1831.value === '{}') {
                    if (blockAllowed$1242(toks$1816, 0, inExprDelim$1817, parentIsBlock$1818)) {
                        if (back$1824(2).value === '()') {
                            // named function
                            if (back$1824(4).value === 'function') {
                                if (!blockAllowed$1242(toks$1816, 3, inExprDelim$1817, parentIsBlock$1818)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1826();
                                }
                                if (toks$1816.length - 5 <= 0 && inExprDelim$1817) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1826();
                                }
                            }
                            // unnamed function
                            if (back$1824(3).value === 'function') {
                                if (!blockAllowed$1242(toks$1816, 2, inExprDelim$1817, parentIsBlock$1818)) {
                                    // new function (...) {...} / ...
                                    return _advance$1826();
                                }
                                if (toks$1816.length - 4 <= 0 && inExprDelim$1817) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1826();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1827();
                    } else {
                        // ... + {...} / ...
                        return _advance$1826();
                    }
                }
                if (prev$1831.type === Token$1072.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1827();
                }
                if (isKeyword$1110(prev$1831.value)) {
                    // typeof /...
                    return _scanRegExp$1827();
                }
                return _advance$1826();
            }
            return _scanRegExp$1827();
        }
        return _advance$1826();
    }
    function readDelim$1244(toks$1832, inExprDelim$1833, parentIsBlock$1834) {
        var startDelim$1835 = advance$1127(), matchDelim$1836 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1837 = [];
        var delimiters$1838 = [
                '(',
                '{',
                '['
            ];
        assert$1098(delimiters$1838.indexOf(startDelim$1835.value) !== -1, 'Need to begin at the delimiter');
        var token$1839 = startDelim$1835;
        var startLineNumber$1840 = token$1839.lineNumber;
        var startLineStart$1841 = token$1839.lineStart;
        var startRange$1842 = token$1839.range;
        var delimToken$1843 = {};
        delimToken$1843.type = Token$1072.Delimiter;
        delimToken$1843.value = startDelim$1835.value + matchDelim$1836[startDelim$1835.value];
        delimToken$1843.startLineNumber = startLineNumber$1840;
        delimToken$1843.startLineStart = startLineStart$1841;
        delimToken$1843.startRange = startRange$1842;
        var delimIsBlock$1844 = false;
        if (startDelim$1835.value === '{') {
            delimIsBlock$1844 = blockAllowed$1242(toks$1832.concat(delimToken$1843), 0, inExprDelim$1833, parentIsBlock$1834);
        }
        while (index$1083 <= length$1090) {
            token$1839 = readToken$1243(inner$1837, startDelim$1835.value === '(' || startDelim$1835.value === '[', delimIsBlock$1844);
            if (token$1839.type === Token$1072.Punctuator && token$1839.value === matchDelim$1836[startDelim$1835.value]) {
                if (token$1839.leadingComments) {
                    delimToken$1843.trailingComments = token$1839.leadingComments;
                }
                break;
            } else if (token$1839.type === Token$1072.EOF) {
                throwError$1132({}, Messages$1077.UnexpectedEOS);
            } else {
                inner$1837.push(token$1839);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$1083 >= length$1090 && matchDelim$1836[startDelim$1835.value] !== source$1081[length$1090 - 1]) {
            throwError$1132({}, Messages$1077.UnexpectedEOS);
        }
        var endLineNumber$1845 = token$1839.lineNumber;
        var endLineStart$1846 = token$1839.lineStart;
        var endRange$1847 = token$1839.range;
        delimToken$1843.inner = inner$1837;
        delimToken$1843.endLineNumber = endLineNumber$1845;
        delimToken$1843.endLineStart = endLineStart$1846;
        delimToken$1843.endRange = endRange$1847;
        return delimToken$1843;
    }
    // (Str) -> [...CSyntax]
    function read$1245(code$1848) {
        var token$1849, tokenTree$1850 = [];
        extra$1097 = {};
        extra$1097.comments = [];
        patch$1238();
        source$1081 = code$1848;
        index$1083 = 0;
        lineNumber$1084 = source$1081.length > 0 ? 1 : 0;
        lineStart$1085 = 0;
        length$1090 = source$1081.length;
        state$1096 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$1083 < length$1090) {
            tokenTree$1850.push(readToken$1243(tokenTree$1850, false, false));
        }
        var last$1851 = tokenTree$1850[tokenTree$1850.length - 1];
        if (last$1851 && last$1851.type !== Token$1072.EOF) {
            tokenTree$1850.push({
                type: Token$1072.EOF,
                value: '',
                lineNumber: last$1851.lineNumber,
                lineStart: last$1851.lineStart,
                range: [
                    index$1083,
                    index$1083
                ]
            });
        }
        return expander$1071.tokensToSyntax(tokenTree$1850);
    }
    function parse$1246(code$1852, options$1853) {
        var program$1854, toString$1855;
        extra$1097 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1852)) {
            tokenStream$1092 = code$1852;
            length$1090 = tokenStream$1092.length;
            lineNumber$1084 = tokenStream$1092.length > 0 ? 1 : 0;
            source$1081 = undefined;
        } else {
            toString$1855 = String;
            if (typeof code$1852 !== 'string' && !(code$1852 instanceof String)) {
                code$1852 = toString$1855(code$1852);
            }
            source$1081 = code$1852;
            length$1090 = source$1081.length;
            lineNumber$1084 = source$1081.length > 0 ? 1 : 0;
        }
        delegate$1091 = SyntaxTreeDelegate$1079;
        streamIndex$1093 = -1;
        index$1083 = 0;
        lineStart$1085 = 0;
        sm_lineStart$1087 = 0;
        sm_lineNumber$1086 = lineNumber$1084;
        sm_index$1089 = 0;
        sm_range$1088 = [
            0,
            0
        ];
        lookahead$1094 = null;
        state$1096 = {
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
        if (typeof options$1853 !== 'undefined') {
            extra$1097.range = typeof options$1853.range === 'boolean' && options$1853.range;
            extra$1097.loc = typeof options$1853.loc === 'boolean' && options$1853.loc;
            if (extra$1097.loc && options$1853.source !== null && options$1853.source !== undefined) {
                delegate$1091 = extend$1240(delegate$1091, {
                    'postProcess': function (node$1856) {
                        node$1856.loc.source = toString$1855(options$1853.source);
                        return node$1856;
                    }
                });
            }
            if (typeof options$1853.tokens === 'boolean' && options$1853.tokens) {
                extra$1097.tokens = [];
            }
            if (typeof options$1853.comment === 'boolean' && options$1853.comment) {
                extra$1097.comments = [];
            }
            if (typeof options$1853.tolerant === 'boolean' && options$1853.tolerant) {
                extra$1097.errors = [];
            }
        }
        if (length$1090 > 0) {
            if (source$1081 && typeof source$1081[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1852 instanceof String) {
                    source$1081 = code$1852.valueOf();
                }
            }
        }
        extra$1097 = { loc: true };
        patch$1238();
        try {
            program$1854 = parseProgram$1224();
            if (typeof extra$1097.comments !== 'undefined') {
                filterCommentLocation$1227();
                program$1854.comments = extra$1097.comments;
            }
            if (typeof extra$1097.tokens !== 'undefined') {
                filterTokenLocation$1230();
                program$1854.tokens = extra$1097.tokens;
            }
            if (typeof extra$1097.errors !== 'undefined') {
                program$1854.errors = extra$1097.errors;
            }
            if (extra$1097.range || extra$1097.loc) {
                program$1854.body = filterGroup$1236(program$1854.body);
            }
        } catch (e$1857) {
            throw e$1857;
        } finally {
            unpatch$1239();
            extra$1097 = {};
        }
        return program$1854;
    }
    exports$1070.tokenize = tokenize$1241;
    exports$1070.read = read$1245;
    exports$1070.Token = Token$1072;
    exports$1070.parse = parse$1246;
    // Deep copy.
    exports$1070.Syntax = function () {
        var name$1858, types$1859 = {};
        if (typeof Object.create === 'function') {
            types$1859 = Object.create(null);
        }
        for (name$1858 in Syntax$1075) {
            if (Syntax$1075.hasOwnProperty(name$1858)) {
                types$1859[name$1858] = Syntax$1075[name$1858];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1859);
        }
        return types$1859;
    }();
}));
//# sourceMappingURL=parser.js.map