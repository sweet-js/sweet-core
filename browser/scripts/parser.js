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
(function (root$1070, factory$1071) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$1071);
    } else if (typeof exports !== 'undefined') {
        factory$1071(exports, require('./expander'));
    } else {
        factory$1071(root$1070.esprima = {});
    }
}(this, function (exports$1072, expander$1073) {
    'use strict';
    var Token$1074, TokenName$1075, FnExprTokens$1076, Syntax$1077, PropertyKind$1078, Messages$1079, Regex$1080, SyntaxTreeDelegate$1081, ClassPropertyType$1082, source$1083, strict$1084, index$1085, lineNumber$1086, lineStart$1087, sm_lineNumber$1088, sm_lineStart$1089, sm_range$1090, sm_index$1091, length$1092, delegate$1093, tokenStream$1094, streamIndex$1095, lookahead$1096, lookaheadIndex$1097, state$1098, extra$1099;
    Token$1074 = {
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
    TokenName$1075 = {};
    TokenName$1075[Token$1074.BooleanLiteral] = 'Boolean';
    TokenName$1075[Token$1074.EOF] = '<end>';
    TokenName$1075[Token$1074.Identifier] = 'Identifier';
    TokenName$1075[Token$1074.Keyword] = 'Keyword';
    TokenName$1075[Token$1074.NullLiteral] = 'Null';
    TokenName$1075[Token$1074.NumericLiteral] = 'Numeric';
    TokenName$1075[Token$1074.Punctuator] = 'Punctuator';
    TokenName$1075[Token$1074.StringLiteral] = 'String';
    TokenName$1075[Token$1074.RegularExpression] = 'RegularExpression';
    TokenName$1075[Token$1074.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$1076 = [
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
    Syntax$1077 = {
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
    PropertyKind$1078 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$1082 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$1079 = {
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
    Regex$1080 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$1100(condition$1249, message$1250) {
        if (!condition$1249) {
            throw new Error('ASSERT: ' + message$1250);
        }
    }
    function isIn$1101(el$1251, list$1252) {
        return list$1252.indexOf(el$1251) !== -1;
    }
    function isDecimalDigit$1102(ch$1253) {
        return ch$1253 >= 48 && ch$1253 <= 57;
    }    // 0..9
    function isHexDigit$1103(ch$1254) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1254) >= 0;
    }
    function isOctalDigit$1104(ch$1255) {
        return '01234567'.indexOf(ch$1255) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$1105(ch$1256) {
        return ch$1256 === 32 || ch$1256 === 9 || ch$1256 === 11 || ch$1256 === 12 || ch$1256 === 160 || ch$1256 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1256)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$1106(ch$1257) {
        return ch$1257 === 10 || ch$1257 === 13 || ch$1257 === 8232 || ch$1257 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$1107(ch$1258) {
        return ch$1258 === 36 || ch$1258 === 95 || ch$1258 >= 65 && ch$1258 <= 90 || ch$1258 >= 97 && ch$1258 <= 122 || ch$1258 === 92 || ch$1258 >= 128 && Regex$1080.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1258));
    }
    function isIdentifierPart$1108(ch$1259) {
        return ch$1259 === 36 || ch$1259 === 95 || ch$1259 >= 65 && ch$1259 <= 90 || ch$1259 >= 97 && ch$1259 <= 122 || ch$1259 >= 48 && ch$1259 <= 57 || ch$1259 === 92 || ch$1259 >= 128 && Regex$1080.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1259));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$1109(id$1260) {
        switch (id$1260) {
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
    function isStrictModeReservedWord$1110(id$1261) {
        switch (id$1261) {
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
    function isRestrictedWord$1111(id$1262) {
        return id$1262 === 'eval' || id$1262 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$1112(id$1263) {
        if (strict$1084 && isStrictModeReservedWord$1110(id$1263)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1263.length) {
        case 2:
            return id$1263 === 'if' || id$1263 === 'in' || id$1263 === 'do';
        case 3:
            return id$1263 === 'var' || id$1263 === 'for' || id$1263 === 'new' || id$1263 === 'try' || id$1263 === 'let';
        case 4:
            return id$1263 === 'this' || id$1263 === 'else' || id$1263 === 'case' || id$1263 === 'void' || id$1263 === 'with' || id$1263 === 'enum';
        case 5:
            return id$1263 === 'while' || id$1263 === 'break' || id$1263 === 'catch' || id$1263 === 'throw' || id$1263 === 'const' || id$1263 === 'yield' || id$1263 === 'class' || id$1263 === 'super';
        case 6:
            return id$1263 === 'return' || id$1263 === 'typeof' || id$1263 === 'delete' || id$1263 === 'switch' || id$1263 === 'export' || id$1263 === 'import';
        case 7:
            return id$1263 === 'default' || id$1263 === 'finally' || id$1263 === 'extends';
        case 8:
            return id$1263 === 'function' || id$1263 === 'continue' || id$1263 === 'debugger';
        case 10:
            return id$1263 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$1113() {
        var ch$1264, blockComment$1265, lineComment$1266;
        blockComment$1265 = false;
        lineComment$1266 = false;
        while (index$1085 < length$1092) {
            ch$1264 = source$1083.charCodeAt(index$1085);
            if (lineComment$1266) {
                ++index$1085;
                if (isLineTerminator$1106(ch$1264)) {
                    lineComment$1266 = false;
                    if (ch$1264 === 13 && source$1083.charCodeAt(index$1085) === 10) {
                        ++index$1085;
                    }
                    ++lineNumber$1086;
                    lineStart$1087 = index$1085;
                }
            } else if (blockComment$1265) {
                if (isLineTerminator$1106(ch$1264)) {
                    if (ch$1264 === 13 && source$1083.charCodeAt(index$1085 + 1) === 10) {
                        ++index$1085;
                    }
                    ++lineNumber$1086;
                    ++index$1085;
                    lineStart$1087 = index$1085;
                    if (index$1085 >= length$1092) {
                        throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1264 = source$1083.charCodeAt(index$1085++);
                    if (index$1085 >= length$1092) {
                        throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1264 === 42) {
                        ch$1264 = source$1083.charCodeAt(index$1085);
                        if (ch$1264 === 47) {
                            ++index$1085;
                            blockComment$1265 = false;
                        }
                    }
                }
            } else if (ch$1264 === 47) {
                ch$1264 = source$1083.charCodeAt(index$1085 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1264 === 47) {
                    index$1085 += 2;
                    lineComment$1266 = true;
                } else if (ch$1264 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$1085 += 2;
                    blockComment$1265 = true;
                    if (index$1085 >= length$1092) {
                        throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1105(ch$1264)) {
                ++index$1085;
            } else if (isLineTerminator$1106(ch$1264)) {
                ++index$1085;
                if (ch$1264 === 13 && source$1083.charCodeAt(index$1085) === 10) {
                    ++index$1085;
                }
                ++lineNumber$1086;
                lineStart$1087 = index$1085;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$1114(prefix$1267) {
        var i$1268, len$1269, ch$1270, code$1271 = 0;
        len$1269 = prefix$1267 === 'u' ? 4 : 2;
        for (i$1268 = 0; i$1268 < len$1269; ++i$1268) {
            if (index$1085 < length$1092 && isHexDigit$1103(source$1083[index$1085])) {
                ch$1270 = source$1083[index$1085++];
                code$1271 = code$1271 * 16 + '0123456789abcdef'.indexOf(ch$1270.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1271);
    }
    function scanUnicodeCodePointEscape$1115() {
        var ch$1272, code$1273, cu1$1274, cu2$1275;
        ch$1272 = source$1083[index$1085];
        code$1273 = 0;
        // At least, one hex digit is required.
        if (ch$1272 === '}') {
            throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
        }
        while (index$1085 < length$1092) {
            ch$1272 = source$1083[index$1085++];
            if (!isHexDigit$1103(ch$1272)) {
                break;
            }
            code$1273 = code$1273 * 16 + '0123456789abcdef'.indexOf(ch$1272.toLowerCase());
        }
        if (code$1273 > 1114111 || ch$1272 !== '}') {
            throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1273 <= 65535) {
            return String.fromCharCode(code$1273);
        }
        cu1$1274 = (code$1273 - 65536 >> 10) + 55296;
        cu2$1275 = (code$1273 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1274, cu2$1275);
    }
    function getEscapedIdentifier$1116() {
        var ch$1276, id$1277;
        ch$1276 = source$1083.charCodeAt(index$1085++);
        id$1277 = String.fromCharCode(ch$1276);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1276 === 92) {
            if (source$1083.charCodeAt(index$1085) !== 117) {
                throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
            }
            ++index$1085;
            ch$1276 = scanHexEscape$1114('u');
            if (!ch$1276 || ch$1276 === '\\' || !isIdentifierStart$1107(ch$1276.charCodeAt(0))) {
                throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
            }
            id$1277 = ch$1276;
        }
        while (index$1085 < length$1092) {
            ch$1276 = source$1083.charCodeAt(index$1085);
            if (!isIdentifierPart$1108(ch$1276)) {
                break;
            }
            ++index$1085;
            id$1277 += String.fromCharCode(ch$1276);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1276 === 92) {
                id$1277 = id$1277.substr(0, id$1277.length - 1);
                if (source$1083.charCodeAt(index$1085) !== 117) {
                    throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
                }
                ++index$1085;
                ch$1276 = scanHexEscape$1114('u');
                if (!ch$1276 || ch$1276 === '\\' || !isIdentifierPart$1108(ch$1276.charCodeAt(0))) {
                    throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
                }
                id$1277 += ch$1276;
            }
        }
        return id$1277;
    }
    function getIdentifier$1117() {
        var start$1278, ch$1279;
        start$1278 = index$1085++;
        while (index$1085 < length$1092) {
            ch$1279 = source$1083.charCodeAt(index$1085);
            if (ch$1279 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$1085 = start$1278;
                return getEscapedIdentifier$1116();
            }
            if (isIdentifierPart$1108(ch$1279)) {
                ++index$1085;
            } else {
                break;
            }
        }
        return source$1083.slice(start$1278, index$1085);
    }
    function scanIdentifier$1118() {
        var start$1280, id$1281, type$1282;
        start$1280 = index$1085;
        // Backslash (char #92) starts an escaped character.
        id$1281 = source$1083.charCodeAt(index$1085) === 92 ? getEscapedIdentifier$1116() : getIdentifier$1117();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1281.length === 1) {
            type$1282 = Token$1074.Identifier;
        } else if (isKeyword$1112(id$1281)) {
            type$1282 = Token$1074.Keyword;
        } else if (id$1281 === 'null') {
            type$1282 = Token$1074.NullLiteral;
        } else if (id$1281 === 'true' || id$1281 === 'false') {
            type$1282 = Token$1074.BooleanLiteral;
        } else {
            type$1282 = Token$1074.Identifier;
        }
        return {
            type: type$1282,
            value: id$1281,
            lineNumber: lineNumber$1086,
            lineStart: lineStart$1087,
            range: [
                start$1280,
                index$1085
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$1119() {
        var start$1283 = index$1085, code$1284 = source$1083.charCodeAt(index$1085), code2$1285, ch1$1286 = source$1083[index$1085], ch2$1287, ch3$1288, ch4$1289;
        switch (code$1284) {
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
            ++index$1085;
            if (extra$1099.tokenize) {
                if (code$1284 === 40) {
                    extra$1099.openParenToken = extra$1099.tokens.length;
                } else if (code$1284 === 123) {
                    extra$1099.openCurlyToken = extra$1099.tokens.length;
                }
            }
            return {
                type: Token$1074.Punctuator,
                value: String.fromCharCode(code$1284),
                lineNumber: lineNumber$1086,
                lineStart: lineStart$1087,
                range: [
                    start$1283,
                    index$1085
                ]
            };
        default:
            code2$1285 = source$1083.charCodeAt(index$1085 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1285 === 61) {
                switch (code$1284) {
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
                    index$1085 += 2;
                    return {
                        type: Token$1074.Punctuator,
                        value: String.fromCharCode(code$1284) + String.fromCharCode(code2$1285),
                        lineNumber: lineNumber$1086,
                        lineStart: lineStart$1087,
                        range: [
                            start$1283,
                            index$1085
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$1085 += 2;
                    // !== and ===
                    if (source$1083.charCodeAt(index$1085) === 61) {
                        ++index$1085;
                    }
                    return {
                        type: Token$1074.Punctuator,
                        value: source$1083.slice(start$1283, index$1085),
                        lineNumber: lineNumber$1086,
                        lineStart: lineStart$1087,
                        range: [
                            start$1283,
                            index$1085
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1287 = source$1083[index$1085 + 1];
        ch3$1288 = source$1083[index$1085 + 2];
        ch4$1289 = source$1083[index$1085 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1286 === '>' && ch2$1287 === '>' && ch3$1288 === '>') {
            if (ch4$1289 === '=') {
                index$1085 += 4;
                return {
                    type: Token$1074.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$1086,
                    lineStart: lineStart$1087,
                    range: [
                        start$1283,
                        index$1085
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1286 === '>' && ch2$1287 === '>' && ch3$1288 === '>') {
            index$1085 += 3;
            return {
                type: Token$1074.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$1086,
                lineStart: lineStart$1087,
                range: [
                    start$1283,
                    index$1085
                ]
            };
        }
        if (ch1$1286 === '<' && ch2$1287 === '<' && ch3$1288 === '=') {
            index$1085 += 3;
            return {
                type: Token$1074.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$1086,
                lineStart: lineStart$1087,
                range: [
                    start$1283,
                    index$1085
                ]
            };
        }
        if (ch1$1286 === '>' && ch2$1287 === '>' && ch3$1288 === '=') {
            index$1085 += 3;
            return {
                type: Token$1074.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$1086,
                lineStart: lineStart$1087,
                range: [
                    start$1283,
                    index$1085
                ]
            };
        }
        if (ch1$1286 === '.' && ch2$1287 === '.' && ch3$1288 === '.') {
            index$1085 += 3;
            return {
                type: Token$1074.Punctuator,
                value: '...',
                lineNumber: lineNumber$1086,
                lineStart: lineStart$1087,
                range: [
                    start$1283,
                    index$1085
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1286 === ch2$1287 && '+-<>&|'.indexOf(ch1$1286) >= 0) {
            index$1085 += 2;
            return {
                type: Token$1074.Punctuator,
                value: ch1$1286 + ch2$1287,
                lineNumber: lineNumber$1086,
                lineStart: lineStart$1087,
                range: [
                    start$1283,
                    index$1085
                ]
            };
        }
        if (ch1$1286 === '=' && ch2$1287 === '>') {
            index$1085 += 2;
            return {
                type: Token$1074.Punctuator,
                value: '=>',
                lineNumber: lineNumber$1086,
                lineStart: lineStart$1087,
                range: [
                    start$1283,
                    index$1085
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1286) >= 0) {
            ++index$1085;
            return {
                type: Token$1074.Punctuator,
                value: ch1$1286,
                lineNumber: lineNumber$1086,
                lineStart: lineStart$1087,
                range: [
                    start$1283,
                    index$1085
                ]
            };
        }
        if (ch1$1286 === '.') {
            ++index$1085;
            return {
                type: Token$1074.Punctuator,
                value: ch1$1286,
                lineNumber: lineNumber$1086,
                lineStart: lineStart$1087,
                range: [
                    start$1283,
                    index$1085
                ]
            };
        }
        throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$1120(start$1290) {
        var number$1291 = '';
        while (index$1085 < length$1092) {
            if (!isHexDigit$1103(source$1083[index$1085])) {
                break;
            }
            number$1291 += source$1083[index$1085++];
        }
        if (number$1291.length === 0) {
            throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$1107(source$1083.charCodeAt(index$1085))) {
            throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1074.NumericLiteral,
            value: parseInt('0x' + number$1291, 16),
            lineNumber: lineNumber$1086,
            lineStart: lineStart$1087,
            range: [
                start$1290,
                index$1085
            ]
        };
    }
    function scanOctalLiteral$1121(prefix$1292, start$1293) {
        var number$1294, octal$1295;
        if (isOctalDigit$1104(prefix$1292)) {
            octal$1295 = true;
            number$1294 = '0' + source$1083[index$1085++];
        } else {
            octal$1295 = false;
            ++index$1085;
            number$1294 = '';
        }
        while (index$1085 < length$1092) {
            if (!isOctalDigit$1104(source$1083[index$1085])) {
                break;
            }
            number$1294 += source$1083[index$1085++];
        }
        if (!octal$1295 && number$1294.length === 0) {
            // only 0o or 0O
            throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$1107(source$1083.charCodeAt(index$1085)) || isDecimalDigit$1102(source$1083.charCodeAt(index$1085))) {
            throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1074.NumericLiteral,
            value: parseInt(number$1294, 8),
            octal: octal$1295,
            lineNumber: lineNumber$1086,
            lineStart: lineStart$1087,
            range: [
                start$1293,
                index$1085
            ]
        };
    }
    function scanNumericLiteral$1122() {
        var number$1296, start$1297, ch$1298, octal$1299;
        ch$1298 = source$1083[index$1085];
        assert$1100(isDecimalDigit$1102(ch$1298.charCodeAt(0)) || ch$1298 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1297 = index$1085;
        number$1296 = '';
        if (ch$1298 !== '.') {
            number$1296 = source$1083[index$1085++];
            ch$1298 = source$1083[index$1085];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1296 === '0') {
                if (ch$1298 === 'x' || ch$1298 === 'X') {
                    ++index$1085;
                    return scanHexLiteral$1120(start$1297);
                }
                if (ch$1298 === 'b' || ch$1298 === 'B') {
                    ++index$1085;
                    number$1296 = '';
                    while (index$1085 < length$1092) {
                        ch$1298 = source$1083[index$1085];
                        if (ch$1298 !== '0' && ch$1298 !== '1') {
                            break;
                        }
                        number$1296 += source$1083[index$1085++];
                    }
                    if (number$1296.length === 0) {
                        // only 0b or 0B
                        throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$1085 < length$1092) {
                        ch$1298 = source$1083.charCodeAt(index$1085);
                        if (isIdentifierStart$1107(ch$1298) || isDecimalDigit$1102(ch$1298)) {
                            throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$1074.NumericLiteral,
                        value: parseInt(number$1296, 2),
                        lineNumber: lineNumber$1086,
                        lineStart: lineStart$1087,
                        range: [
                            start$1297,
                            index$1085
                        ]
                    };
                }
                if (ch$1298 === 'o' || ch$1298 === 'O' || isOctalDigit$1104(ch$1298)) {
                    return scanOctalLiteral$1121(ch$1298, start$1297);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1298 && isDecimalDigit$1102(ch$1298.charCodeAt(0))) {
                    throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$1102(source$1083.charCodeAt(index$1085))) {
                number$1296 += source$1083[index$1085++];
            }
            ch$1298 = source$1083[index$1085];
        }
        if (ch$1298 === '.') {
            number$1296 += source$1083[index$1085++];
            while (isDecimalDigit$1102(source$1083.charCodeAt(index$1085))) {
                number$1296 += source$1083[index$1085++];
            }
            ch$1298 = source$1083[index$1085];
        }
        if (ch$1298 === 'e' || ch$1298 === 'E') {
            number$1296 += source$1083[index$1085++];
            ch$1298 = source$1083[index$1085];
            if (ch$1298 === '+' || ch$1298 === '-') {
                number$1296 += source$1083[index$1085++];
            }
            if (isDecimalDigit$1102(source$1083.charCodeAt(index$1085))) {
                while (isDecimalDigit$1102(source$1083.charCodeAt(index$1085))) {
                    number$1296 += source$1083[index$1085++];
                }
            } else {
                throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$1107(source$1083.charCodeAt(index$1085))) {
            throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1074.NumericLiteral,
            value: parseFloat(number$1296),
            lineNumber: lineNumber$1086,
            lineStart: lineStart$1087,
            range: [
                start$1297,
                index$1085
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$1123() {
        var str$1300 = '', quote$1301, start$1302, ch$1303, code$1304, unescaped$1305, restore$1306, octal$1307 = false;
        quote$1301 = source$1083[index$1085];
        assert$1100(quote$1301 === '\'' || quote$1301 === '"', 'String literal must starts with a quote');
        start$1302 = index$1085;
        ++index$1085;
        while (index$1085 < length$1092) {
            ch$1303 = source$1083[index$1085++];
            if (ch$1303 === quote$1301) {
                quote$1301 = '';
                break;
            } else if (ch$1303 === '\\') {
                ch$1303 = source$1083[index$1085++];
                if (!ch$1303 || !isLineTerminator$1106(ch$1303.charCodeAt(0))) {
                    switch (ch$1303) {
                    case 'n':
                        str$1300 += '\n';
                        break;
                    case 'r':
                        str$1300 += '\r';
                        break;
                    case 't':
                        str$1300 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$1083[index$1085] === '{') {
                            ++index$1085;
                            str$1300 += scanUnicodeCodePointEscape$1115();
                        } else {
                            restore$1306 = index$1085;
                            unescaped$1305 = scanHexEscape$1114(ch$1303);
                            if (unescaped$1305) {
                                str$1300 += unescaped$1305;
                            } else {
                                index$1085 = restore$1306;
                                str$1300 += ch$1303;
                            }
                        }
                        break;
                    case 'b':
                        str$1300 += '\b';
                        break;
                    case 'f':
                        str$1300 += '\f';
                        break;
                    case 'v':
                        str$1300 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$1104(ch$1303)) {
                            code$1304 = '01234567'.indexOf(ch$1303);
                            // \0 is not octal escape sequence
                            if (code$1304 !== 0) {
                                octal$1307 = true;
                            }
                            if (index$1085 < length$1092 && isOctalDigit$1104(source$1083[index$1085])) {
                                octal$1307 = true;
                                code$1304 = code$1304 * 8 + '01234567'.indexOf(source$1083[index$1085++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1303) >= 0 && index$1085 < length$1092 && isOctalDigit$1104(source$1083[index$1085])) {
                                    code$1304 = code$1304 * 8 + '01234567'.indexOf(source$1083[index$1085++]);
                                }
                            }
                            str$1300 += String.fromCharCode(code$1304);
                        } else {
                            str$1300 += ch$1303;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$1086;
                    if (ch$1303 === '\r' && source$1083[index$1085] === '\n') {
                        ++index$1085;
                    }
                }
            } else if (isLineTerminator$1106(ch$1303.charCodeAt(0))) {
                break;
            } else {
                str$1300 += ch$1303;
            }
        }
        if (quote$1301 !== '') {
            throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1074.StringLiteral,
            value: str$1300,
            octal: octal$1307,
            lineNumber: lineNumber$1086,
            lineStart: lineStart$1087,
            range: [
                start$1302,
                index$1085
            ]
        };
    }
    function scanTemplate$1124() {
        var cooked$1308 = '', ch$1309, start$1310, terminated$1311, tail$1312, restore$1313, unescaped$1314, code$1315, octal$1316;
        terminated$1311 = false;
        tail$1312 = false;
        start$1310 = index$1085;
        ++index$1085;
        while (index$1085 < length$1092) {
            ch$1309 = source$1083[index$1085++];
            if (ch$1309 === '`') {
                tail$1312 = true;
                terminated$1311 = true;
                break;
            } else if (ch$1309 === '$') {
                if (source$1083[index$1085] === '{') {
                    ++index$1085;
                    terminated$1311 = true;
                    break;
                }
                cooked$1308 += ch$1309;
            } else if (ch$1309 === '\\') {
                ch$1309 = source$1083[index$1085++];
                if (!isLineTerminator$1106(ch$1309.charCodeAt(0))) {
                    switch (ch$1309) {
                    case 'n':
                        cooked$1308 += '\n';
                        break;
                    case 'r':
                        cooked$1308 += '\r';
                        break;
                    case 't':
                        cooked$1308 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$1083[index$1085] === '{') {
                            ++index$1085;
                            cooked$1308 += scanUnicodeCodePointEscape$1115();
                        } else {
                            restore$1313 = index$1085;
                            unescaped$1314 = scanHexEscape$1114(ch$1309);
                            if (unescaped$1314) {
                                cooked$1308 += unescaped$1314;
                            } else {
                                index$1085 = restore$1313;
                                cooked$1308 += ch$1309;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1308 += '\b';
                        break;
                    case 'f':
                        cooked$1308 += '\f';
                        break;
                    case 'v':
                        cooked$1308 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$1104(ch$1309)) {
                            code$1315 = '01234567'.indexOf(ch$1309);
                            // \0 is not octal escape sequence
                            if (code$1315 !== 0) {
                                octal$1316 = true;
                            }
                            if (index$1085 < length$1092 && isOctalDigit$1104(source$1083[index$1085])) {
                                octal$1316 = true;
                                code$1315 = code$1315 * 8 + '01234567'.indexOf(source$1083[index$1085++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1309) >= 0 && index$1085 < length$1092 && isOctalDigit$1104(source$1083[index$1085])) {
                                    code$1315 = code$1315 * 8 + '01234567'.indexOf(source$1083[index$1085++]);
                                }
                            }
                            cooked$1308 += String.fromCharCode(code$1315);
                        } else {
                            cooked$1308 += ch$1309;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$1086;
                    if (ch$1309 === '\r' && source$1083[index$1085] === '\n') {
                        ++index$1085;
                    }
                }
            } else if (isLineTerminator$1106(ch$1309.charCodeAt(0))) {
                ++lineNumber$1086;
                if (ch$1309 === '\r' && source$1083[index$1085] === '\n') {
                    ++index$1085;
                }
                cooked$1308 += '\n';
            } else {
                cooked$1308 += ch$1309;
            }
        }
        if (!terminated$1311) {
            throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1074.Template,
            value: {
                cooked: cooked$1308,
                raw: source$1083.slice(start$1310 + 1, index$1085 - (tail$1312 ? 1 : 2))
            },
            tail: tail$1312,
            octal: octal$1316,
            lineNumber: lineNumber$1086,
            lineStart: lineStart$1087,
            range: [
                start$1310,
                index$1085
            ]
        };
    }
    function scanTemplateElement$1125(option$1317) {
        var startsWith$1318, template$1319;
        lookahead$1096 = null;
        skipComment$1113();
        startsWith$1318 = option$1317.head ? '`' : '}';
        if (source$1083[index$1085] !== startsWith$1318) {
            throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
        }
        template$1319 = scanTemplate$1124();
        peek$1131();
        return template$1319;
    }
    function scanRegExp$1126() {
        var str$1320, ch$1321, start$1322, pattern$1323, flags$1324, value$1325, classMarker$1326 = false, restore$1327, terminated$1328 = false;
        lookahead$1096 = null;
        skipComment$1113();
        start$1322 = index$1085;
        ch$1321 = source$1083[index$1085];
        assert$1100(ch$1321 === '/', 'Regular expression literal must start with a slash');
        str$1320 = source$1083[index$1085++];
        while (index$1085 < length$1092) {
            ch$1321 = source$1083[index$1085++];
            str$1320 += ch$1321;
            if (classMarker$1326) {
                if (ch$1321 === ']') {
                    classMarker$1326 = false;
                }
            } else {
                if (ch$1321 === '\\') {
                    ch$1321 = source$1083[index$1085++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$1106(ch$1321.charCodeAt(0))) {
                        throwError$1134({}, Messages$1079.UnterminatedRegExp);
                    }
                    str$1320 += ch$1321;
                } else if (ch$1321 === '/') {
                    terminated$1328 = true;
                    break;
                } else if (ch$1321 === '[') {
                    classMarker$1326 = true;
                } else if (isLineTerminator$1106(ch$1321.charCodeAt(0))) {
                    throwError$1134({}, Messages$1079.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1328) {
            throwError$1134({}, Messages$1079.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1323 = str$1320.substr(1, str$1320.length - 2);
        flags$1324 = '';
        while (index$1085 < length$1092) {
            ch$1321 = source$1083[index$1085];
            if (!isIdentifierPart$1108(ch$1321.charCodeAt(0))) {
                break;
            }
            ++index$1085;
            if (ch$1321 === '\\' && index$1085 < length$1092) {
                ch$1321 = source$1083[index$1085];
                if (ch$1321 === 'u') {
                    ++index$1085;
                    restore$1327 = index$1085;
                    ch$1321 = scanHexEscape$1114('u');
                    if (ch$1321) {
                        flags$1324 += ch$1321;
                        for (str$1320 += '\\u'; restore$1327 < index$1085; ++restore$1327) {
                            str$1320 += source$1083[restore$1327];
                        }
                    } else {
                        index$1085 = restore$1327;
                        flags$1324 += 'u';
                        str$1320 += '\\u';
                    }
                } else {
                    str$1320 += '\\';
                }
            } else {
                flags$1324 += ch$1321;
                str$1320 += ch$1321;
            }
        }
        try {
            value$1325 = new RegExp(pattern$1323, flags$1324);
        } catch (e$1329) {
            throwError$1134({}, Messages$1079.InvalidRegExp);
        }
        // peek();
        if (extra$1099.tokenize) {
            return {
                type: Token$1074.RegularExpression,
                value: value$1325,
                lineNumber: lineNumber$1086,
                lineStart: lineStart$1087,
                range: [
                    start$1322,
                    index$1085
                ]
            };
        }
        return {
            type: Token$1074.RegularExpression,
            literal: str$1320,
            value: value$1325,
            range: [
                start$1322,
                index$1085
            ]
        };
    }
    function isIdentifierName$1127(token$1330) {
        return token$1330.type === Token$1074.Identifier || token$1330.type === Token$1074.Keyword || token$1330.type === Token$1074.BooleanLiteral || token$1330.type === Token$1074.NullLiteral;
    }
    function advanceSlash$1128() {
        var prevToken$1331, checkToken$1332;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1331 = extra$1099.tokens[extra$1099.tokens.length - 1];
        if (!prevToken$1331) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$1126();
        }
        if (prevToken$1331.type === 'Punctuator') {
            if (prevToken$1331.value === ')') {
                checkToken$1332 = extra$1099.tokens[extra$1099.openParenToken - 1];
                if (checkToken$1332 && checkToken$1332.type === 'Keyword' && (checkToken$1332.value === 'if' || checkToken$1332.value === 'while' || checkToken$1332.value === 'for' || checkToken$1332.value === 'with')) {
                    return scanRegExp$1126();
                }
                return scanPunctuator$1119();
            }
            if (prevToken$1331.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$1099.tokens[extra$1099.openCurlyToken - 3] && extra$1099.tokens[extra$1099.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1332 = extra$1099.tokens[extra$1099.openCurlyToken - 4];
                    if (!checkToken$1332) {
                        return scanPunctuator$1119();
                    }
                } else if (extra$1099.tokens[extra$1099.openCurlyToken - 4] && extra$1099.tokens[extra$1099.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1332 = extra$1099.tokens[extra$1099.openCurlyToken - 5];
                    if (!checkToken$1332) {
                        return scanRegExp$1126();
                    }
                } else {
                    return scanPunctuator$1119();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$1076.indexOf(checkToken$1332.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$1119();
                }
                // It is a declaration.
                return scanRegExp$1126();
            }
            return scanRegExp$1126();
        }
        if (prevToken$1331.type === 'Keyword') {
            return scanRegExp$1126();
        }
        return scanPunctuator$1119();
    }
    function advance$1129() {
        var ch$1333;
        skipComment$1113();
        if (index$1085 >= length$1092) {
            return {
                type: Token$1074.EOF,
                lineNumber: lineNumber$1086,
                lineStart: lineStart$1087,
                range: [
                    index$1085,
                    index$1085
                ]
            };
        }
        ch$1333 = source$1083.charCodeAt(index$1085);
        // Very common: ( and ) and ;
        if (ch$1333 === 40 || ch$1333 === 41 || ch$1333 === 58) {
            return scanPunctuator$1119();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1333 === 39 || ch$1333 === 34) {
            return scanStringLiteral$1123();
        }
        if (ch$1333 === 96) {
            return scanTemplate$1124();
        }
        if (isIdentifierStart$1107(ch$1333)) {
            return scanIdentifier$1118();
        }
        // # and @ are allowed for sweet.js
        if (ch$1333 === 35 || ch$1333 === 64) {
            ++index$1085;
            return {
                type: Token$1074.Punctuator,
                value: String.fromCharCode(ch$1333),
                lineNumber: lineNumber$1086,
                lineStart: lineStart$1087,
                range: [
                    index$1085 - 1,
                    index$1085
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1333 === 46) {
            if (isDecimalDigit$1102(source$1083.charCodeAt(index$1085 + 1))) {
                return scanNumericLiteral$1122();
            }
            return scanPunctuator$1119();
        }
        if (isDecimalDigit$1102(ch$1333)) {
            return scanNumericLiteral$1122();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$1099.tokenize && ch$1333 === 47) {
            return advanceSlash$1128();
        }
        return scanPunctuator$1119();
    }
    function lex$1130() {
        var token$1334;
        token$1334 = lookahead$1096;
        streamIndex$1095 = lookaheadIndex$1097;
        lineNumber$1086 = token$1334.lineNumber;
        lineStart$1087 = token$1334.lineStart;
        sm_lineNumber$1088 = lookahead$1096.sm_lineNumber;
        sm_lineStart$1089 = lookahead$1096.sm_lineStart;
        sm_range$1090 = lookahead$1096.sm_range;
        sm_index$1091 = lookahead$1096.sm_range[0];
        lookahead$1096 = tokenStream$1094[++streamIndex$1095].token;
        lookaheadIndex$1097 = streamIndex$1095;
        index$1085 = lookahead$1096.range[0];
        return token$1334;
    }
    function peek$1131() {
        lookaheadIndex$1097 = streamIndex$1095 + 1;
        if (lookaheadIndex$1097 >= length$1092) {
            lookahead$1096 = {
                type: Token$1074.EOF,
                lineNumber: lineNumber$1086,
                lineStart: lineStart$1087,
                range: [
                    index$1085,
                    index$1085
                ]
            };
            return;
        }
        lookahead$1096 = tokenStream$1094[lookaheadIndex$1097].token;
        index$1085 = lookahead$1096.range[0];
    }
    function lookahead2$1132() {
        var adv$1335, pos$1336, line$1337, start$1338, result$1339;
        if (streamIndex$1095 + 1 >= length$1092 || streamIndex$1095 + 2 >= length$1092) {
            return {
                type: Token$1074.EOF,
                lineNumber: lineNumber$1086,
                lineStart: lineStart$1087,
                range: [
                    index$1085,
                    index$1085
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$1096 === null) {
            lookaheadIndex$1097 = streamIndex$1095 + 1;
            lookahead$1096 = tokenStream$1094[lookaheadIndex$1097].token;
            index$1085 = lookahead$1096.range[0];
        }
        result$1339 = tokenStream$1094[lookaheadIndex$1097 + 1].token;
        return result$1339;
    }
    SyntaxTreeDelegate$1081 = {
        name: 'SyntaxTree',
        postProcess: function (node$1340) {
            return node$1340;
        },
        createArrayExpression: function (elements$1341) {
            return {
                type: Syntax$1077.ArrayExpression,
                elements: elements$1341
            };
        },
        createAssignmentExpression: function (operator$1342, left$1343, right$1344) {
            return {
                type: Syntax$1077.AssignmentExpression,
                operator: operator$1342,
                left: left$1343,
                right: right$1344
            };
        },
        createBinaryExpression: function (operator$1345, left$1346, right$1347) {
            var type$1348 = operator$1345 === '||' || operator$1345 === '&&' ? Syntax$1077.LogicalExpression : Syntax$1077.BinaryExpression;
            return {
                type: type$1348,
                operator: operator$1345,
                left: left$1346,
                right: right$1347
            };
        },
        createBlockStatement: function (body$1349) {
            return {
                type: Syntax$1077.BlockStatement,
                body: body$1349
            };
        },
        createBreakStatement: function (label$1350) {
            return {
                type: Syntax$1077.BreakStatement,
                label: label$1350
            };
        },
        createCallExpression: function (callee$1351, args$1352) {
            return {
                type: Syntax$1077.CallExpression,
                callee: callee$1351,
                'arguments': args$1352
            };
        },
        createCatchClause: function (param$1353, body$1354) {
            return {
                type: Syntax$1077.CatchClause,
                param: param$1353,
                body: body$1354
            };
        },
        createConditionalExpression: function (test$1355, consequent$1356, alternate$1357) {
            return {
                type: Syntax$1077.ConditionalExpression,
                test: test$1355,
                consequent: consequent$1356,
                alternate: alternate$1357
            };
        },
        createContinueStatement: function (label$1358) {
            return {
                type: Syntax$1077.ContinueStatement,
                label: label$1358
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$1077.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1359, test$1360) {
            return {
                type: Syntax$1077.DoWhileStatement,
                body: body$1359,
                test: test$1360
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$1077.EmptyStatement };
        },
        createExpressionStatement: function (expression$1361) {
            return {
                type: Syntax$1077.ExpressionStatement,
                expression: expression$1361
            };
        },
        createForStatement: function (init$1362, test$1363, update$1364, body$1365) {
            return {
                type: Syntax$1077.ForStatement,
                init: init$1362,
                test: test$1363,
                update: update$1364,
                body: body$1365
            };
        },
        createForInStatement: function (left$1366, right$1367, body$1368) {
            return {
                type: Syntax$1077.ForInStatement,
                left: left$1366,
                right: right$1367,
                body: body$1368,
                each: false
            };
        },
        createForOfStatement: function (left$1369, right$1370, body$1371) {
            return {
                type: Syntax$1077.ForOfStatement,
                left: left$1369,
                right: right$1370,
                body: body$1371
            };
        },
        createFunctionDeclaration: function (id$1372, params$1373, defaults$1374, body$1375, rest$1376, generator$1377, expression$1378) {
            return {
                type: Syntax$1077.FunctionDeclaration,
                id: id$1372,
                params: params$1373,
                defaults: defaults$1374,
                body: body$1375,
                rest: rest$1376,
                generator: generator$1377,
                expression: expression$1378
            };
        },
        createFunctionExpression: function (id$1379, params$1380, defaults$1381, body$1382, rest$1383, generator$1384, expression$1385) {
            return {
                type: Syntax$1077.FunctionExpression,
                id: id$1379,
                params: params$1380,
                defaults: defaults$1381,
                body: body$1382,
                rest: rest$1383,
                generator: generator$1384,
                expression: expression$1385
            };
        },
        createIdentifier: function (name$1386) {
            return {
                type: Syntax$1077.Identifier,
                name: name$1386
            };
        },
        createIfStatement: function (test$1387, consequent$1388, alternate$1389) {
            return {
                type: Syntax$1077.IfStatement,
                test: test$1387,
                consequent: consequent$1388,
                alternate: alternate$1389
            };
        },
        createLabeledStatement: function (label$1390, body$1391) {
            return {
                type: Syntax$1077.LabeledStatement,
                label: label$1390,
                body: body$1391
            };
        },
        createLiteral: function (token$1392) {
            return {
                type: Syntax$1077.Literal,
                value: token$1392.value,
                raw: String(token$1392.value)
            };
        },
        createMemberExpression: function (accessor$1393, object$1394, property$1395) {
            return {
                type: Syntax$1077.MemberExpression,
                computed: accessor$1393 === '[',
                object: object$1394,
                property: property$1395
            };
        },
        createNewExpression: function (callee$1396, args$1397) {
            return {
                type: Syntax$1077.NewExpression,
                callee: callee$1396,
                'arguments': args$1397
            };
        },
        createObjectExpression: function (properties$1398) {
            return {
                type: Syntax$1077.ObjectExpression,
                properties: properties$1398
            };
        },
        createPostfixExpression: function (operator$1399, argument$1400) {
            return {
                type: Syntax$1077.UpdateExpression,
                operator: operator$1399,
                argument: argument$1400,
                prefix: false
            };
        },
        createProgram: function (body$1401) {
            return {
                type: Syntax$1077.Program,
                body: body$1401
            };
        },
        createProperty: function (kind$1402, key$1403, value$1404, method$1405, shorthand$1406) {
            return {
                type: Syntax$1077.Property,
                key: key$1403,
                value: value$1404,
                kind: kind$1402,
                method: method$1405,
                shorthand: shorthand$1406
            };
        },
        createReturnStatement: function (argument$1407) {
            return {
                type: Syntax$1077.ReturnStatement,
                argument: argument$1407
            };
        },
        createSequenceExpression: function (expressions$1408) {
            return {
                type: Syntax$1077.SequenceExpression,
                expressions: expressions$1408
            };
        },
        createSwitchCase: function (test$1409, consequent$1410) {
            return {
                type: Syntax$1077.SwitchCase,
                test: test$1409,
                consequent: consequent$1410
            };
        },
        createSwitchStatement: function (discriminant$1411, cases$1412) {
            return {
                type: Syntax$1077.SwitchStatement,
                discriminant: discriminant$1411,
                cases: cases$1412
            };
        },
        createThisExpression: function () {
            return { type: Syntax$1077.ThisExpression };
        },
        createThrowStatement: function (argument$1413) {
            return {
                type: Syntax$1077.ThrowStatement,
                argument: argument$1413
            };
        },
        createTryStatement: function (block$1414, guardedHandlers$1415, handlers$1416, finalizer$1417) {
            return {
                type: Syntax$1077.TryStatement,
                block: block$1414,
                guardedHandlers: guardedHandlers$1415,
                handlers: handlers$1416,
                finalizer: finalizer$1417
            };
        },
        createUnaryExpression: function (operator$1418, argument$1419) {
            if (operator$1418 === '++' || operator$1418 === '--') {
                return {
                    type: Syntax$1077.UpdateExpression,
                    operator: operator$1418,
                    argument: argument$1419,
                    prefix: true
                };
            }
            return {
                type: Syntax$1077.UnaryExpression,
                operator: operator$1418,
                argument: argument$1419
            };
        },
        createVariableDeclaration: function (declarations$1420, kind$1421) {
            return {
                type: Syntax$1077.VariableDeclaration,
                declarations: declarations$1420,
                kind: kind$1421
            };
        },
        createVariableDeclarator: function (id$1422, init$1423) {
            return {
                type: Syntax$1077.VariableDeclarator,
                id: id$1422,
                init: init$1423
            };
        },
        createWhileStatement: function (test$1424, body$1425) {
            return {
                type: Syntax$1077.WhileStatement,
                test: test$1424,
                body: body$1425
            };
        },
        createWithStatement: function (object$1426, body$1427) {
            return {
                type: Syntax$1077.WithStatement,
                object: object$1426,
                body: body$1427
            };
        },
        createTemplateElement: function (value$1428, tail$1429) {
            return {
                type: Syntax$1077.TemplateElement,
                value: value$1428,
                tail: tail$1429
            };
        },
        createTemplateLiteral: function (quasis$1430, expressions$1431) {
            return {
                type: Syntax$1077.TemplateLiteral,
                quasis: quasis$1430,
                expressions: expressions$1431
            };
        },
        createSpreadElement: function (argument$1432) {
            return {
                type: Syntax$1077.SpreadElement,
                argument: argument$1432
            };
        },
        createTaggedTemplateExpression: function (tag$1433, quasi$1434) {
            return {
                type: Syntax$1077.TaggedTemplateExpression,
                tag: tag$1433,
                quasi: quasi$1434
            };
        },
        createArrowFunctionExpression: function (params$1435, defaults$1436, body$1437, rest$1438, expression$1439) {
            return {
                type: Syntax$1077.ArrowFunctionExpression,
                id: null,
                params: params$1435,
                defaults: defaults$1436,
                body: body$1437,
                rest: rest$1438,
                generator: false,
                expression: expression$1439
            };
        },
        createMethodDefinition: function (propertyType$1440, kind$1441, key$1442, value$1443) {
            return {
                type: Syntax$1077.MethodDefinition,
                key: key$1442,
                value: value$1443,
                kind: kind$1441,
                'static': propertyType$1440 === ClassPropertyType$1082.static
            };
        },
        createClassBody: function (body$1444) {
            return {
                type: Syntax$1077.ClassBody,
                body: body$1444
            };
        },
        createClassExpression: function (id$1445, superClass$1446, body$1447) {
            return {
                type: Syntax$1077.ClassExpression,
                id: id$1445,
                superClass: superClass$1446,
                body: body$1447
            };
        },
        createClassDeclaration: function (id$1448, superClass$1449, body$1450) {
            return {
                type: Syntax$1077.ClassDeclaration,
                id: id$1448,
                superClass: superClass$1449,
                body: body$1450
            };
        },
        createExportSpecifier: function (id$1451, name$1452) {
            return {
                type: Syntax$1077.ExportSpecifier,
                id: id$1451,
                name: name$1452
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$1077.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1453, specifiers$1454, source$1455) {
            return {
                type: Syntax$1077.ExportDeclaration,
                declaration: declaration$1453,
                specifiers: specifiers$1454,
                source: source$1455
            };
        },
        createImportSpecifier: function (id$1456, name$1457) {
            return {
                type: Syntax$1077.ImportSpecifier,
                id: id$1456,
                name: name$1457
            };
        },
        createImportDeclaration: function (specifiers$1458, kind$1459, source$1460) {
            return {
                type: Syntax$1077.ImportDeclaration,
                specifiers: specifiers$1458,
                kind: kind$1459,
                source: source$1460
            };
        },
        createYieldExpression: function (argument$1461, delegate$1462) {
            return {
                type: Syntax$1077.YieldExpression,
                argument: argument$1461,
                delegate: delegate$1462
            };
        },
        createModuleDeclaration: function (id$1463, source$1464, body$1465) {
            return {
                type: Syntax$1077.ModuleDeclaration,
                id: id$1463,
                source: source$1464,
                body: body$1465
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$1133() {
        return lookahead$1096.lineNumber !== lineNumber$1086;
    }
    // Throw an exception
    function throwError$1134(token$1466, messageFormat$1467) {
        var error$1468, args$1469 = Array.prototype.slice.call(arguments, 2), msg$1470 = messageFormat$1467.replace(/%(\d)/g, function (whole$1474, index$1475) {
                assert$1100(index$1475 < args$1469.length, 'Message reference must be in range');
                return args$1469[index$1475];
            });
        var startIndex$1471 = streamIndex$1095 > 3 ? streamIndex$1095 - 3 : 0;
        var toks$1472 = tokenStream$1094.slice(startIndex$1471, streamIndex$1095 + 3).map(function (stx$1476) {
                return stx$1476.token.value;
            }).join(' ');
        var tailingMsg$1473 = '\n[... ' + toks$1472 + ' ...]';
        if (typeof token$1466.lineNumber === 'number') {
            error$1468 = new Error('Line ' + token$1466.lineNumber + ': ' + msg$1470 + tailingMsg$1473);
            error$1468.index = token$1466.range[0];
            error$1468.lineNumber = token$1466.lineNumber;
            error$1468.column = token$1466.range[0] - lineStart$1087 + 1;
        } else {
            error$1468 = new Error('Line ' + lineNumber$1086 + ': ' + msg$1470 + tailingMsg$1473);
            error$1468.index = index$1085;
            error$1468.lineNumber = lineNumber$1086;
            error$1468.column = index$1085 - lineStart$1087 + 1;
        }
        error$1468.description = msg$1470;
        throw error$1468;
    }
    function throwErrorTolerant$1135() {
        try {
            throwError$1134.apply(null, arguments);
        } catch (e$1477) {
            if (extra$1099.errors) {
                extra$1099.errors.push(e$1477);
            } else {
                throw e$1477;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$1136(token$1478) {
        if (token$1478.type === Token$1074.EOF) {
            throwError$1134(token$1478, Messages$1079.UnexpectedEOS);
        }
        if (token$1478.type === Token$1074.NumericLiteral) {
            throwError$1134(token$1478, Messages$1079.UnexpectedNumber);
        }
        if (token$1478.type === Token$1074.StringLiteral) {
            throwError$1134(token$1478, Messages$1079.UnexpectedString);
        }
        if (token$1478.type === Token$1074.Identifier) {
            throwError$1134(token$1478, Messages$1079.UnexpectedIdentifier);
        }
        if (token$1478.type === Token$1074.Keyword) {
            if (isFutureReservedWord$1109(token$1478.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$1084 && isStrictModeReservedWord$1110(token$1478.value)) {
                throwErrorTolerant$1135(token$1478, Messages$1079.StrictReservedWord);
                return;
            }
            throwError$1134(token$1478, Messages$1079.UnexpectedToken, token$1478.value);
        }
        if (token$1478.type === Token$1074.Template) {
            throwError$1134(token$1478, Messages$1079.UnexpectedTemplate, token$1478.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$1134(token$1478, Messages$1079.UnexpectedToken, token$1478.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$1137(value$1479) {
        var token$1480 = lex$1130();
        if (token$1480.type !== Token$1074.Punctuator || token$1480.value !== value$1479) {
            throwUnexpected$1136(token$1480);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$1138(keyword$1481) {
        var token$1482 = lex$1130();
        if (token$1482.type !== Token$1074.Keyword || token$1482.value !== keyword$1481) {
            throwUnexpected$1136(token$1482);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$1139(value$1483) {
        return lookahead$1096.type === Token$1074.Punctuator && lookahead$1096.value === value$1483;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$1140(keyword$1484) {
        return lookahead$1096.type === Token$1074.Keyword && lookahead$1096.value === keyword$1484;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$1141(keyword$1485) {
        return lookahead$1096.type === Token$1074.Identifier && lookahead$1096.value === keyword$1485;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$1142() {
        var op$1486;
        if (lookahead$1096.type !== Token$1074.Punctuator) {
            return false;
        }
        op$1486 = lookahead$1096.value;
        return op$1486 === '=' || op$1486 === '*=' || op$1486 === '/=' || op$1486 === '%=' || op$1486 === '+=' || op$1486 === '-=' || op$1486 === '<<=' || op$1486 === '>>=' || op$1486 === '>>>=' || op$1486 === '&=' || op$1486 === '^=' || op$1486 === '|=';
    }
    function consumeSemicolon$1143() {
        var line$1487, ch$1488;
        ch$1488 = lookahead$1096.value ? String(lookahead$1096.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1488 === 59) {
            lex$1130();
            return;
        }
        if (lookahead$1096.lineNumber !== lineNumber$1086) {
            return;
        }
        if (match$1139(';')) {
            lex$1130();
            return;
        }
        if (lookahead$1096.type !== Token$1074.EOF && !match$1139('}')) {
            throwUnexpected$1136(lookahead$1096);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$1144(expr$1489) {
        return expr$1489.type === Syntax$1077.Identifier || expr$1489.type === Syntax$1077.MemberExpression;
    }
    function isAssignableLeftHandSide$1145(expr$1490) {
        return isLeftHandSide$1144(expr$1490) || expr$1490.type === Syntax$1077.ObjectPattern || expr$1490.type === Syntax$1077.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$1146() {
        var elements$1491 = [], blocks$1492 = [], filter$1493 = null, tmp$1494, possiblecomprehension$1495 = true, body$1496;
        expect$1137('[');
        while (!match$1139(']')) {
            if (lookahead$1096.value === 'for' && lookahead$1096.type === Token$1074.Keyword) {
                if (!possiblecomprehension$1495) {
                    throwError$1134({}, Messages$1079.ComprehensionError);
                }
                matchKeyword$1140('for');
                tmp$1494 = parseForStatement$1194({ ignoreBody: true });
                tmp$1494.of = tmp$1494.type === Syntax$1077.ForOfStatement;
                tmp$1494.type = Syntax$1077.ComprehensionBlock;
                if (tmp$1494.left.kind) {
                    // can't be let or const
                    throwError$1134({}, Messages$1079.ComprehensionError);
                }
                blocks$1492.push(tmp$1494);
            } else if (lookahead$1096.value === 'if' && lookahead$1096.type === Token$1074.Keyword) {
                if (!possiblecomprehension$1495) {
                    throwError$1134({}, Messages$1079.ComprehensionError);
                }
                expectKeyword$1138('if');
                expect$1137('(');
                filter$1493 = parseExpression$1174();
                expect$1137(')');
            } else if (lookahead$1096.value === ',' && lookahead$1096.type === Token$1074.Punctuator) {
                possiblecomprehension$1495 = false;
                // no longer allowed.
                lex$1130();
                elements$1491.push(null);
            } else {
                tmp$1494 = parseSpreadOrAssignmentExpression$1157();
                elements$1491.push(tmp$1494);
                if (tmp$1494 && tmp$1494.type === Syntax$1077.SpreadElement) {
                    if (!match$1139(']')) {
                        throwError$1134({}, Messages$1079.ElementAfterSpreadElement);
                    }
                } else if (!(match$1139(']') || matchKeyword$1140('for') || matchKeyword$1140('if'))) {
                    expect$1137(',');
                    // this lexes.
                    possiblecomprehension$1495 = false;
                }
            }
        }
        expect$1137(']');
        if (filter$1493 && !blocks$1492.length) {
            throwError$1134({}, Messages$1079.ComprehensionRequiresBlock);
        }
        if (blocks$1492.length) {
            if (elements$1491.length !== 1) {
                throwError$1134({}, Messages$1079.ComprehensionError);
            }
            return {
                type: Syntax$1077.ComprehensionExpression,
                filter: filter$1493,
                blocks: blocks$1492,
                body: elements$1491[0]
            };
        }
        return delegate$1093.createArrayExpression(elements$1491);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$1147(options$1497) {
        var previousStrict$1498, previousYieldAllowed$1499, params$1500, defaults$1501, body$1502;
        previousStrict$1498 = strict$1084;
        previousYieldAllowed$1499 = state$1098.yieldAllowed;
        state$1098.yieldAllowed = options$1497.generator;
        params$1500 = options$1497.params || [];
        defaults$1501 = options$1497.defaults || [];
        body$1502 = parseConciseBody$1206();
        if (options$1497.name && strict$1084 && isRestrictedWord$1111(params$1500[0].name)) {
            throwErrorTolerant$1135(options$1497.name, Messages$1079.StrictParamName);
        }
        if (state$1098.yieldAllowed && !state$1098.yieldFound) {
            throwErrorTolerant$1135({}, Messages$1079.NoYieldInGenerator);
        }
        strict$1084 = previousStrict$1498;
        state$1098.yieldAllowed = previousYieldAllowed$1499;
        return delegate$1093.createFunctionExpression(null, params$1500, defaults$1501, body$1502, options$1497.rest || null, options$1497.generator, body$1502.type !== Syntax$1077.BlockStatement);
    }
    function parsePropertyMethodFunction$1148(options$1503) {
        var previousStrict$1504, tmp$1505, method$1506;
        previousStrict$1504 = strict$1084;
        strict$1084 = true;
        tmp$1505 = parseParams$1210();
        if (tmp$1505.stricted) {
            throwErrorTolerant$1135(tmp$1505.stricted, tmp$1505.message);
        }
        method$1506 = parsePropertyFunction$1147({
            params: tmp$1505.params,
            defaults: tmp$1505.defaults,
            rest: tmp$1505.rest,
            generator: options$1503.generator
        });
        strict$1084 = previousStrict$1504;
        return method$1506;
    }
    function parseObjectPropertyKey$1149() {
        var token$1507 = lex$1130();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1507.type === Token$1074.StringLiteral || token$1507.type === Token$1074.NumericLiteral) {
            if (strict$1084 && token$1507.octal) {
                throwErrorTolerant$1135(token$1507, Messages$1079.StrictOctalLiteral);
            }
            return delegate$1093.createLiteral(token$1507);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$1093.createIdentifier(token$1507.value);
    }
    function parseObjectProperty$1150() {
        var token$1508, key$1509, id$1510, value$1511, param$1512;
        token$1508 = lookahead$1096;
        if (token$1508.type === Token$1074.Identifier) {
            id$1510 = parseObjectPropertyKey$1149();
            // Property Assignment: Getter and Setter.
            if (token$1508.value === 'get' && !(match$1139(':') || match$1139('('))) {
                key$1509 = parseObjectPropertyKey$1149();
                expect$1137('(');
                expect$1137(')');
                return delegate$1093.createProperty('get', key$1509, parsePropertyFunction$1147({ generator: false }), false, false);
            }
            if (token$1508.value === 'set' && !(match$1139(':') || match$1139('('))) {
                key$1509 = parseObjectPropertyKey$1149();
                expect$1137('(');
                token$1508 = lookahead$1096;
                param$1512 = [parseVariableIdentifier$1177()];
                expect$1137(')');
                return delegate$1093.createProperty('set', key$1509, parsePropertyFunction$1147({
                    params: param$1512,
                    generator: false,
                    name: token$1508
                }), false, false);
            }
            if (match$1139(':')) {
                lex$1130();
                return delegate$1093.createProperty('init', id$1510, parseAssignmentExpression$1173(), false, false);
            }
            if (match$1139('(')) {
                return delegate$1093.createProperty('init', id$1510, parsePropertyMethodFunction$1148({ generator: false }), true, false);
            }
            return delegate$1093.createProperty('init', id$1510, id$1510, false, true);
        }
        if (token$1508.type === Token$1074.EOF || token$1508.type === Token$1074.Punctuator) {
            if (!match$1139('*')) {
                throwUnexpected$1136(token$1508);
            }
            lex$1130();
            id$1510 = parseObjectPropertyKey$1149();
            if (!match$1139('(')) {
                throwUnexpected$1136(lex$1130());
            }
            return delegate$1093.createProperty('init', id$1510, parsePropertyMethodFunction$1148({ generator: true }), true, false);
        }
        key$1509 = parseObjectPropertyKey$1149();
        if (match$1139(':')) {
            lex$1130();
            return delegate$1093.createProperty('init', key$1509, parseAssignmentExpression$1173(), false, false);
        }
        if (match$1139('(')) {
            return delegate$1093.createProperty('init', key$1509, parsePropertyMethodFunction$1148({ generator: false }), true, false);
        }
        throwUnexpected$1136(lex$1130());
    }
    function parseObjectInitialiser$1151() {
        var properties$1513 = [], property$1514, name$1515, key$1516, kind$1517, map$1518 = {}, toString$1519 = String;
        expect$1137('{');
        while (!match$1139('}')) {
            property$1514 = parseObjectProperty$1150();
            if (property$1514.key.type === Syntax$1077.Identifier) {
                name$1515 = property$1514.key.name;
            } else {
                name$1515 = toString$1519(property$1514.key.value);
            }
            kind$1517 = property$1514.kind === 'init' ? PropertyKind$1078.Data : property$1514.kind === 'get' ? PropertyKind$1078.Get : PropertyKind$1078.Set;
            key$1516 = '$' + name$1515;
            if (Object.prototype.hasOwnProperty.call(map$1518, key$1516)) {
                if (map$1518[key$1516] === PropertyKind$1078.Data) {
                    if (strict$1084 && kind$1517 === PropertyKind$1078.Data) {
                        throwErrorTolerant$1135({}, Messages$1079.StrictDuplicateProperty);
                    } else if (kind$1517 !== PropertyKind$1078.Data) {
                        throwErrorTolerant$1135({}, Messages$1079.AccessorDataProperty);
                    }
                } else {
                    if (kind$1517 === PropertyKind$1078.Data) {
                        throwErrorTolerant$1135({}, Messages$1079.AccessorDataProperty);
                    } else if (map$1518[key$1516] & kind$1517) {
                        throwErrorTolerant$1135({}, Messages$1079.AccessorGetSet);
                    }
                }
                map$1518[key$1516] |= kind$1517;
            } else {
                map$1518[key$1516] = kind$1517;
            }
            properties$1513.push(property$1514);
            if (!match$1139('}')) {
                expect$1137(',');
            }
        }
        expect$1137('}');
        return delegate$1093.createObjectExpression(properties$1513);
    }
    function parseTemplateElement$1152(option$1520) {
        var token$1521 = scanTemplateElement$1125(option$1520);
        if (strict$1084 && token$1521.octal) {
            throwError$1134(token$1521, Messages$1079.StrictOctalLiteral);
        }
        return delegate$1093.createTemplateElement({
            raw: token$1521.value.raw,
            cooked: token$1521.value.cooked
        }, token$1521.tail);
    }
    function parseTemplateLiteral$1153() {
        var quasi$1522, quasis$1523, expressions$1524;
        quasi$1522 = parseTemplateElement$1152({ head: true });
        quasis$1523 = [quasi$1522];
        expressions$1524 = [];
        while (!quasi$1522.tail) {
            expressions$1524.push(parseExpression$1174());
            quasi$1522 = parseTemplateElement$1152({ head: false });
            quasis$1523.push(quasi$1522);
        }
        return delegate$1093.createTemplateLiteral(quasis$1523, expressions$1524);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$1154() {
        var expr$1525;
        expect$1137('(');
        ++state$1098.parenthesizedCount;
        expr$1525 = parseExpression$1174();
        expect$1137(')');
        return expr$1525;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$1155() {
        var type$1526, token$1527, resolvedIdent$1528;
        token$1527 = lookahead$1096;
        type$1526 = lookahead$1096.type;
        if (type$1526 === Token$1074.Identifier) {
            resolvedIdent$1528 = expander$1073.resolve(tokenStream$1094[lookaheadIndex$1097]);
            lex$1130();
            return delegate$1093.createIdentifier(resolvedIdent$1528);
        }
        if (type$1526 === Token$1074.StringLiteral || type$1526 === Token$1074.NumericLiteral) {
            if (strict$1084 && lookahead$1096.octal) {
                throwErrorTolerant$1135(lookahead$1096, Messages$1079.StrictOctalLiteral);
            }
            return delegate$1093.createLiteral(lex$1130());
        }
        if (type$1526 === Token$1074.Keyword) {
            if (matchKeyword$1140('this')) {
                lex$1130();
                return delegate$1093.createThisExpression();
            }
            if (matchKeyword$1140('function')) {
                return parseFunctionExpression$1212();
            }
            if (matchKeyword$1140('class')) {
                return parseClassExpression$1217();
            }
            if (matchKeyword$1140('super')) {
                lex$1130();
                return delegate$1093.createIdentifier('super');
            }
        }
        if (type$1526 === Token$1074.BooleanLiteral) {
            token$1527 = lex$1130();
            token$1527.value = token$1527.value === 'true';
            return delegate$1093.createLiteral(token$1527);
        }
        if (type$1526 === Token$1074.NullLiteral) {
            token$1527 = lex$1130();
            token$1527.value = null;
            return delegate$1093.createLiteral(token$1527);
        }
        if (match$1139('[')) {
            return parseArrayInitialiser$1146();
        }
        if (match$1139('{')) {
            return parseObjectInitialiser$1151();
        }
        if (match$1139('(')) {
            return parseGroupExpression$1154();
        }
        if (lookahead$1096.type === Token$1074.RegularExpression) {
            return delegate$1093.createLiteral(lex$1130());
        }
        if (type$1526 === Token$1074.Template) {
            return parseTemplateLiteral$1153();
        }
        return throwUnexpected$1136(lex$1130());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$1156() {
        var args$1529 = [], arg$1530;
        expect$1137('(');
        if (!match$1139(')')) {
            while (streamIndex$1095 < length$1092) {
                arg$1530 = parseSpreadOrAssignmentExpression$1157();
                args$1529.push(arg$1530);
                if (match$1139(')')) {
                    break;
                } else if (arg$1530.type === Syntax$1077.SpreadElement) {
                    throwError$1134({}, Messages$1079.ElementAfterSpreadElement);
                }
                expect$1137(',');
            }
        }
        expect$1137(')');
        return args$1529;
    }
    function parseSpreadOrAssignmentExpression$1157() {
        if (match$1139('...')) {
            lex$1130();
            return delegate$1093.createSpreadElement(parseAssignmentExpression$1173());
        }
        return parseAssignmentExpression$1173();
    }
    function parseNonComputedProperty$1158() {
        var token$1531 = lex$1130();
        if (!isIdentifierName$1127(token$1531)) {
            throwUnexpected$1136(token$1531);
        }
        return delegate$1093.createIdentifier(token$1531.value);
    }
    function parseNonComputedMember$1159() {
        expect$1137('.');
        return parseNonComputedProperty$1158();
    }
    function parseComputedMember$1160() {
        var expr$1532;
        expect$1137('[');
        expr$1532 = parseExpression$1174();
        expect$1137(']');
        return expr$1532;
    }
    function parseNewExpression$1161() {
        var callee$1533, args$1534;
        expectKeyword$1138('new');
        callee$1533 = parseLeftHandSideExpression$1163();
        args$1534 = match$1139('(') ? parseArguments$1156() : [];
        return delegate$1093.createNewExpression(callee$1533, args$1534);
    }
    function parseLeftHandSideExpressionAllowCall$1162() {
        var expr$1535, args$1536, property$1537;
        expr$1535 = matchKeyword$1140('new') ? parseNewExpression$1161() : parsePrimaryExpression$1155();
        while (match$1139('.') || match$1139('[') || match$1139('(') || lookahead$1096.type === Token$1074.Template) {
            if (match$1139('(')) {
                args$1536 = parseArguments$1156();
                expr$1535 = delegate$1093.createCallExpression(expr$1535, args$1536);
            } else if (match$1139('[')) {
                expr$1535 = delegate$1093.createMemberExpression('[', expr$1535, parseComputedMember$1160());
            } else if (match$1139('.')) {
                expr$1535 = delegate$1093.createMemberExpression('.', expr$1535, parseNonComputedMember$1159());
            } else {
                expr$1535 = delegate$1093.createTaggedTemplateExpression(expr$1535, parseTemplateLiteral$1153());
            }
        }
        return expr$1535;
    }
    function parseLeftHandSideExpression$1163() {
        var expr$1538, property$1539;
        expr$1538 = matchKeyword$1140('new') ? parseNewExpression$1161() : parsePrimaryExpression$1155();
        while (match$1139('.') || match$1139('[') || lookahead$1096.type === Token$1074.Template) {
            if (match$1139('[')) {
                expr$1538 = delegate$1093.createMemberExpression('[', expr$1538, parseComputedMember$1160());
            } else if (match$1139('.')) {
                expr$1538 = delegate$1093.createMemberExpression('.', expr$1538, parseNonComputedMember$1159());
            } else {
                expr$1538 = delegate$1093.createTaggedTemplateExpression(expr$1538, parseTemplateLiteral$1153());
            }
        }
        return expr$1538;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$1164() {
        var expr$1540 = parseLeftHandSideExpressionAllowCall$1162(), token$1541 = lookahead$1096;
        if (lookahead$1096.type !== Token$1074.Punctuator) {
            return expr$1540;
        }
        if ((match$1139('++') || match$1139('--')) && !peekLineTerminator$1133()) {
            // 11.3.1, 11.3.2
            if (strict$1084 && expr$1540.type === Syntax$1077.Identifier && isRestrictedWord$1111(expr$1540.name)) {
                throwErrorTolerant$1135({}, Messages$1079.StrictLHSPostfix);
            }
            if (!isLeftHandSide$1144(expr$1540)) {
                throwError$1134({}, Messages$1079.InvalidLHSInAssignment);
            }
            token$1541 = lex$1130();
            expr$1540 = delegate$1093.createPostfixExpression(token$1541.value, expr$1540);
        }
        return expr$1540;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$1165() {
        var token$1542, expr$1543;
        if (lookahead$1096.type !== Token$1074.Punctuator && lookahead$1096.type !== Token$1074.Keyword) {
            return parsePostfixExpression$1164();
        }
        if (match$1139('++') || match$1139('--')) {
            token$1542 = lex$1130();
            expr$1543 = parseUnaryExpression$1165();
            // 11.4.4, 11.4.5
            if (strict$1084 && expr$1543.type === Syntax$1077.Identifier && isRestrictedWord$1111(expr$1543.name)) {
                throwErrorTolerant$1135({}, Messages$1079.StrictLHSPrefix);
            }
            if (!isLeftHandSide$1144(expr$1543)) {
                throwError$1134({}, Messages$1079.InvalidLHSInAssignment);
            }
            return delegate$1093.createUnaryExpression(token$1542.value, expr$1543);
        }
        if (match$1139('+') || match$1139('-') || match$1139('~') || match$1139('!')) {
            token$1542 = lex$1130();
            expr$1543 = parseUnaryExpression$1165();
            return delegate$1093.createUnaryExpression(token$1542.value, expr$1543);
        }
        if (matchKeyword$1140('delete') || matchKeyword$1140('void') || matchKeyword$1140('typeof')) {
            token$1542 = lex$1130();
            expr$1543 = parseUnaryExpression$1165();
            expr$1543 = delegate$1093.createUnaryExpression(token$1542.value, expr$1543);
            if (strict$1084 && expr$1543.operator === 'delete' && expr$1543.argument.type === Syntax$1077.Identifier) {
                throwErrorTolerant$1135({}, Messages$1079.StrictDelete);
            }
            return expr$1543;
        }
        return parsePostfixExpression$1164();
    }
    function binaryPrecedence$1166(token$1544, allowIn$1545) {
        var prec$1546 = 0;
        if (token$1544.type !== Token$1074.Punctuator && token$1544.type !== Token$1074.Keyword) {
            return 0;
        }
        switch (token$1544.value) {
        case '||':
            prec$1546 = 1;
            break;
        case '&&':
            prec$1546 = 2;
            break;
        case '|':
            prec$1546 = 3;
            break;
        case '^':
            prec$1546 = 4;
            break;
        case '&':
            prec$1546 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1546 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1546 = 7;
            break;
        case 'in':
            prec$1546 = allowIn$1545 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1546 = 8;
            break;
        case '+':
        case '-':
            prec$1546 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1546 = 11;
            break;
        default:
            break;
        }
        return prec$1546;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$1167() {
        var expr$1547, token$1548, prec$1549, previousAllowIn$1550, stack$1551, right$1552, operator$1553, left$1554, i$1555;
        previousAllowIn$1550 = state$1098.allowIn;
        state$1098.allowIn = true;
        expr$1547 = parseUnaryExpression$1165();
        token$1548 = lookahead$1096;
        prec$1549 = binaryPrecedence$1166(token$1548, previousAllowIn$1550);
        if (prec$1549 === 0) {
            return expr$1547;
        }
        token$1548.prec = prec$1549;
        lex$1130();
        stack$1551 = [
            expr$1547,
            token$1548,
            parseUnaryExpression$1165()
        ];
        while ((prec$1549 = binaryPrecedence$1166(lookahead$1096, previousAllowIn$1550)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1551.length > 2 && prec$1549 <= stack$1551[stack$1551.length - 2].prec) {
                right$1552 = stack$1551.pop();
                operator$1553 = stack$1551.pop().value;
                left$1554 = stack$1551.pop();
                stack$1551.push(delegate$1093.createBinaryExpression(operator$1553, left$1554, right$1552));
            }
            // Shift.
            token$1548 = lex$1130();
            token$1548.prec = prec$1549;
            stack$1551.push(token$1548);
            stack$1551.push(parseUnaryExpression$1165());
        }
        state$1098.allowIn = previousAllowIn$1550;
        // Final reduce to clean-up the stack.
        i$1555 = stack$1551.length - 1;
        expr$1547 = stack$1551[i$1555];
        while (i$1555 > 1) {
            expr$1547 = delegate$1093.createBinaryExpression(stack$1551[i$1555 - 1].value, stack$1551[i$1555 - 2], expr$1547);
            i$1555 -= 2;
        }
        return expr$1547;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$1168() {
        var expr$1556, previousAllowIn$1557, consequent$1558, alternate$1559;
        expr$1556 = parseBinaryExpression$1167();
        if (match$1139('?')) {
            lex$1130();
            previousAllowIn$1557 = state$1098.allowIn;
            state$1098.allowIn = true;
            consequent$1558 = parseAssignmentExpression$1173();
            state$1098.allowIn = previousAllowIn$1557;
            expect$1137(':');
            alternate$1559 = parseAssignmentExpression$1173();
            expr$1556 = delegate$1093.createConditionalExpression(expr$1556, consequent$1558, alternate$1559);
        }
        return expr$1556;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$1169(expr$1560) {
        var i$1561, len$1562, property$1563, element$1564;
        if (expr$1560.type === Syntax$1077.ObjectExpression) {
            expr$1560.type = Syntax$1077.ObjectPattern;
            for (i$1561 = 0, len$1562 = expr$1560.properties.length; i$1561 < len$1562; i$1561 += 1) {
                property$1563 = expr$1560.properties[i$1561];
                if (property$1563.kind !== 'init') {
                    throwError$1134({}, Messages$1079.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$1169(property$1563.value);
            }
        } else if (expr$1560.type === Syntax$1077.ArrayExpression) {
            expr$1560.type = Syntax$1077.ArrayPattern;
            for (i$1561 = 0, len$1562 = expr$1560.elements.length; i$1561 < len$1562; i$1561 += 1) {
                element$1564 = expr$1560.elements[i$1561];
                if (element$1564) {
                    reinterpretAsAssignmentBindingPattern$1169(element$1564);
                }
            }
        } else if (expr$1560.type === Syntax$1077.Identifier) {
            if (isRestrictedWord$1111(expr$1560.name)) {
                throwError$1134({}, Messages$1079.InvalidLHSInAssignment);
            }
        } else if (expr$1560.type === Syntax$1077.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$1169(expr$1560.argument);
            if (expr$1560.argument.type === Syntax$1077.ObjectPattern) {
                throwError$1134({}, Messages$1079.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1560.type !== Syntax$1077.MemberExpression && expr$1560.type !== Syntax$1077.CallExpression && expr$1560.type !== Syntax$1077.NewExpression) {
                throwError$1134({}, Messages$1079.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$1170(options$1565, expr$1566) {
        var i$1567, len$1568, property$1569, element$1570;
        if (expr$1566.type === Syntax$1077.ObjectExpression) {
            expr$1566.type = Syntax$1077.ObjectPattern;
            for (i$1567 = 0, len$1568 = expr$1566.properties.length; i$1567 < len$1568; i$1567 += 1) {
                property$1569 = expr$1566.properties[i$1567];
                if (property$1569.kind !== 'init') {
                    throwError$1134({}, Messages$1079.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$1170(options$1565, property$1569.value);
            }
        } else if (expr$1566.type === Syntax$1077.ArrayExpression) {
            expr$1566.type = Syntax$1077.ArrayPattern;
            for (i$1567 = 0, len$1568 = expr$1566.elements.length; i$1567 < len$1568; i$1567 += 1) {
                element$1570 = expr$1566.elements[i$1567];
                if (element$1570) {
                    reinterpretAsDestructuredParameter$1170(options$1565, element$1570);
                }
            }
        } else if (expr$1566.type === Syntax$1077.Identifier) {
            validateParam$1208(options$1565, expr$1566, expr$1566.name);
        } else {
            if (expr$1566.type !== Syntax$1077.MemberExpression) {
                throwError$1134({}, Messages$1079.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$1171(expressions$1571) {
        var i$1572, len$1573, param$1574, params$1575, defaults$1576, defaultCount$1577, options$1578, rest$1579;
        params$1575 = [];
        defaults$1576 = [];
        defaultCount$1577 = 0;
        rest$1579 = null;
        options$1578 = { paramSet: {} };
        for (i$1572 = 0, len$1573 = expressions$1571.length; i$1572 < len$1573; i$1572 += 1) {
            param$1574 = expressions$1571[i$1572];
            if (param$1574.type === Syntax$1077.Identifier) {
                params$1575.push(param$1574);
                defaults$1576.push(null);
                validateParam$1208(options$1578, param$1574, param$1574.name);
            } else if (param$1574.type === Syntax$1077.ObjectExpression || param$1574.type === Syntax$1077.ArrayExpression) {
                reinterpretAsDestructuredParameter$1170(options$1578, param$1574);
                params$1575.push(param$1574);
                defaults$1576.push(null);
            } else if (param$1574.type === Syntax$1077.SpreadElement) {
                assert$1100(i$1572 === len$1573 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$1170(options$1578, param$1574.argument);
                rest$1579 = param$1574.argument;
            } else if (param$1574.type === Syntax$1077.AssignmentExpression) {
                params$1575.push(param$1574.left);
                defaults$1576.push(param$1574.right);
                ++defaultCount$1577;
                validateParam$1208(options$1578, param$1574.left, param$1574.left.name);
            } else {
                return null;
            }
        }
        if (options$1578.message === Messages$1079.StrictParamDupe) {
            throwError$1134(strict$1084 ? options$1578.stricted : options$1578.firstRestricted, options$1578.message);
        }
        if (defaultCount$1577 === 0) {
            defaults$1576 = [];
        }
        return {
            params: params$1575,
            defaults: defaults$1576,
            rest: rest$1579,
            stricted: options$1578.stricted,
            firstRestricted: options$1578.firstRestricted,
            message: options$1578.message
        };
    }
    function parseArrowFunctionExpression$1172(options$1580) {
        var previousStrict$1581, previousYieldAllowed$1582, body$1583;
        expect$1137('=>');
        previousStrict$1581 = strict$1084;
        previousYieldAllowed$1582 = state$1098.yieldAllowed;
        state$1098.yieldAllowed = false;
        body$1583 = parseConciseBody$1206();
        if (strict$1084 && options$1580.firstRestricted) {
            throwError$1134(options$1580.firstRestricted, options$1580.message);
        }
        if (strict$1084 && options$1580.stricted) {
            throwErrorTolerant$1135(options$1580.stricted, options$1580.message);
        }
        strict$1084 = previousStrict$1581;
        state$1098.yieldAllowed = previousYieldAllowed$1582;
        return delegate$1093.createArrowFunctionExpression(options$1580.params, options$1580.defaults, body$1583, options$1580.rest, body$1583.type !== Syntax$1077.BlockStatement);
    }
    function parseAssignmentExpression$1173() {
        var expr$1584, token$1585, params$1586, oldParenthesizedCount$1587;
        if (matchKeyword$1140('yield')) {
            return parseYieldExpression$1213();
        }
        oldParenthesizedCount$1587 = state$1098.parenthesizedCount;
        if (match$1139('(')) {
            token$1585 = lookahead2$1132();
            if (token$1585.type === Token$1074.Punctuator && token$1585.value === ')' || token$1585.value === '...') {
                params$1586 = parseParams$1210();
                if (!match$1139('=>')) {
                    throwUnexpected$1136(lex$1130());
                }
                return parseArrowFunctionExpression$1172(params$1586);
            }
        }
        token$1585 = lookahead$1096;
        expr$1584 = parseConditionalExpression$1168();
        if (match$1139('=>') && (state$1098.parenthesizedCount === oldParenthesizedCount$1587 || state$1098.parenthesizedCount === oldParenthesizedCount$1587 + 1)) {
            if (expr$1584.type === Syntax$1077.Identifier) {
                params$1586 = reinterpretAsCoverFormalsList$1171([expr$1584]);
            } else if (expr$1584.type === Syntax$1077.SequenceExpression) {
                params$1586 = reinterpretAsCoverFormalsList$1171(expr$1584.expressions);
            }
            if (params$1586) {
                return parseArrowFunctionExpression$1172(params$1586);
            }
        }
        if (matchAssign$1142()) {
            // 11.13.1
            if (strict$1084 && expr$1584.type === Syntax$1077.Identifier && isRestrictedWord$1111(expr$1584.name)) {
                throwErrorTolerant$1135(token$1585, Messages$1079.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$1139('=') && (expr$1584.type === Syntax$1077.ObjectExpression || expr$1584.type === Syntax$1077.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$1169(expr$1584);
            } else if (!isLeftHandSide$1144(expr$1584)) {
                throwError$1134({}, Messages$1079.InvalidLHSInAssignment);
            }
            expr$1584 = delegate$1093.createAssignmentExpression(lex$1130().value, expr$1584, parseAssignmentExpression$1173());
        }
        return expr$1584;
    }
    // 11.14 Comma Operator
    function parseExpression$1174() {
        var expr$1588, expressions$1589, sequence$1590, coverFormalsList$1591, spreadFound$1592, oldParenthesizedCount$1593;
        oldParenthesizedCount$1593 = state$1098.parenthesizedCount;
        expr$1588 = parseAssignmentExpression$1173();
        expressions$1589 = [expr$1588];
        if (match$1139(',')) {
            while (streamIndex$1095 < length$1092) {
                if (!match$1139(',')) {
                    break;
                }
                lex$1130();
                expr$1588 = parseSpreadOrAssignmentExpression$1157();
                expressions$1589.push(expr$1588);
                if (expr$1588.type === Syntax$1077.SpreadElement) {
                    spreadFound$1592 = true;
                    if (!match$1139(')')) {
                        throwError$1134({}, Messages$1079.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1590 = delegate$1093.createSequenceExpression(expressions$1589);
        }
        if (match$1139('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$1098.parenthesizedCount === oldParenthesizedCount$1593 || state$1098.parenthesizedCount === oldParenthesizedCount$1593 + 1) {
                expr$1588 = expr$1588.type === Syntax$1077.SequenceExpression ? expr$1588.expressions : expressions$1589;
                coverFormalsList$1591 = reinterpretAsCoverFormalsList$1171(expr$1588);
                if (coverFormalsList$1591) {
                    return parseArrowFunctionExpression$1172(coverFormalsList$1591);
                }
            }
            throwUnexpected$1136(lex$1130());
        }
        if (spreadFound$1592 && lookahead2$1132().value !== '=>') {
            throwError$1134({}, Messages$1079.IllegalSpread);
        }
        return sequence$1590 || expr$1588;
    }
    // 12.1 Block
    function parseStatementList$1175() {
        var list$1594 = [], statement$1595;
        while (streamIndex$1095 < length$1092) {
            if (match$1139('}')) {
                break;
            }
            statement$1595 = parseSourceElement$1220();
            if (typeof statement$1595 === 'undefined') {
                break;
            }
            list$1594.push(statement$1595);
        }
        return list$1594;
    }
    function parseBlock$1176() {
        var block$1596;
        expect$1137('{');
        block$1596 = parseStatementList$1175();
        expect$1137('}');
        return delegate$1093.createBlockStatement(block$1596);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$1177() {
        var token$1597 = lookahead$1096, resolvedIdent$1598;
        if (token$1597.type !== Token$1074.Identifier) {
            throwUnexpected$1136(token$1597);
        }
        resolvedIdent$1598 = expander$1073.resolve(tokenStream$1094[lookaheadIndex$1097]);
        lex$1130();
        return delegate$1093.createIdentifier(resolvedIdent$1598);
    }
    function parseVariableDeclaration$1178(kind$1599) {
        var id$1600, init$1601 = null;
        if (match$1139('{')) {
            id$1600 = parseObjectInitialiser$1151();
            reinterpretAsAssignmentBindingPattern$1169(id$1600);
        } else if (match$1139('[')) {
            id$1600 = parseArrayInitialiser$1146();
            reinterpretAsAssignmentBindingPattern$1169(id$1600);
        } else {
            id$1600 = state$1098.allowKeyword ? parseNonComputedProperty$1158() : parseVariableIdentifier$1177();
            // 12.2.1
            if (strict$1084 && isRestrictedWord$1111(id$1600.name)) {
                throwErrorTolerant$1135({}, Messages$1079.StrictVarName);
            }
        }
        if (kind$1599 === 'const') {
            if (!match$1139('=')) {
                throwError$1134({}, Messages$1079.NoUnintializedConst);
            }
            expect$1137('=');
            init$1601 = parseAssignmentExpression$1173();
        } else if (match$1139('=')) {
            lex$1130();
            init$1601 = parseAssignmentExpression$1173();
        }
        return delegate$1093.createVariableDeclarator(id$1600, init$1601);
    }
    function parseVariableDeclarationList$1179(kind$1602) {
        var list$1603 = [];
        do {
            list$1603.push(parseVariableDeclaration$1178(kind$1602));
            if (!match$1139(',')) {
                break;
            }
            lex$1130();
        } while (streamIndex$1095 < length$1092);
        return list$1603;
    }
    function parseVariableStatement$1180() {
        var declarations$1604;
        expectKeyword$1138('var');
        declarations$1604 = parseVariableDeclarationList$1179();
        consumeSemicolon$1143();
        return delegate$1093.createVariableDeclaration(declarations$1604, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$1181(kind$1605) {
        var declarations$1606;
        expectKeyword$1138(kind$1605);
        declarations$1606 = parseVariableDeclarationList$1179(kind$1605);
        consumeSemicolon$1143();
        return delegate$1093.createVariableDeclaration(declarations$1606, kind$1605);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$1182() {
        var id$1607, src$1608, body$1609;
        lex$1130();
        // 'module'
        if (peekLineTerminator$1133()) {
            throwError$1134({}, Messages$1079.NewlineAfterModule);
        }
        switch (lookahead$1096.type) {
        case Token$1074.StringLiteral:
            id$1607 = parsePrimaryExpression$1155();
            body$1609 = parseModuleBlock$1225();
            src$1608 = null;
            break;
        case Token$1074.Identifier:
            id$1607 = parseVariableIdentifier$1177();
            body$1609 = null;
            if (!matchContextualKeyword$1141('from')) {
                throwUnexpected$1136(lex$1130());
            }
            lex$1130();
            src$1608 = parsePrimaryExpression$1155();
            if (src$1608.type !== Syntax$1077.Literal) {
                throwError$1134({}, Messages$1079.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$1143();
        return delegate$1093.createModuleDeclaration(id$1607, src$1608, body$1609);
    }
    function parseExportBatchSpecifier$1183() {
        expect$1137('*');
        return delegate$1093.createExportBatchSpecifier();
    }
    function parseExportSpecifier$1184() {
        var id$1610, name$1611 = null;
        id$1610 = parseVariableIdentifier$1177();
        if (matchContextualKeyword$1141('as')) {
            lex$1130();
            name$1611 = parseNonComputedProperty$1158();
        }
        return delegate$1093.createExportSpecifier(id$1610, name$1611);
    }
    function parseExportDeclaration$1185() {
        var previousAllowKeyword$1612, decl$1613, def$1614, src$1615, specifiers$1616;
        expectKeyword$1138('export');
        if (lookahead$1096.type === Token$1074.Keyword) {
            switch (lookahead$1096.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$1093.createExportDeclaration(parseSourceElement$1220(), null, null);
            }
        }
        if (isIdentifierName$1127(lookahead$1096)) {
            previousAllowKeyword$1612 = state$1098.allowKeyword;
            state$1098.allowKeyword = true;
            decl$1613 = parseVariableDeclarationList$1179('let');
            state$1098.allowKeyword = previousAllowKeyword$1612;
            return delegate$1093.createExportDeclaration(decl$1613, null, null);
        }
        specifiers$1616 = [];
        src$1615 = null;
        if (match$1139('*')) {
            specifiers$1616.push(parseExportBatchSpecifier$1183());
        } else {
            expect$1137('{');
            do {
                specifiers$1616.push(parseExportSpecifier$1184());
            } while (match$1139(',') && lex$1130());
            expect$1137('}');
        }
        if (matchContextualKeyword$1141('from')) {
            lex$1130();
            src$1615 = parsePrimaryExpression$1155();
            if (src$1615.type !== Syntax$1077.Literal) {
                throwError$1134({}, Messages$1079.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$1143();
        return delegate$1093.createExportDeclaration(null, specifiers$1616, src$1615);
    }
    function parseImportDeclaration$1186() {
        var specifiers$1617, kind$1618, src$1619;
        expectKeyword$1138('import');
        specifiers$1617 = [];
        if (isIdentifierName$1127(lookahead$1096)) {
            kind$1618 = 'default';
            specifiers$1617.push(parseImportSpecifier$1187());
            if (!matchContextualKeyword$1141('from')) {
                throwError$1134({}, Messages$1079.NoFromAfterImport);
            }
            lex$1130();
        } else if (match$1139('{')) {
            kind$1618 = 'named';
            lex$1130();
            do {
                specifiers$1617.push(parseImportSpecifier$1187());
            } while (match$1139(',') && lex$1130());
            expect$1137('}');
            if (!matchContextualKeyword$1141('from')) {
                throwError$1134({}, Messages$1079.NoFromAfterImport);
            }
            lex$1130();
        }
        src$1619 = parsePrimaryExpression$1155();
        if (src$1619.type !== Syntax$1077.Literal) {
            throwError$1134({}, Messages$1079.InvalidModuleSpecifier);
        }
        consumeSemicolon$1143();
        return delegate$1093.createImportDeclaration(specifiers$1617, kind$1618, src$1619);
    }
    function parseImportSpecifier$1187() {
        var id$1620, name$1621 = null;
        id$1620 = parseNonComputedProperty$1158();
        if (matchContextualKeyword$1141('as')) {
            lex$1130();
            name$1621 = parseVariableIdentifier$1177();
        }
        return delegate$1093.createImportSpecifier(id$1620, name$1621);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$1188() {
        expect$1137(';');
        return delegate$1093.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$1189() {
        var expr$1622 = parseExpression$1174();
        consumeSemicolon$1143();
        return delegate$1093.createExpressionStatement(expr$1622);
    }
    // 12.5 If statement
    function parseIfStatement$1190() {
        var test$1623, consequent$1624, alternate$1625;
        expectKeyword$1138('if');
        expect$1137('(');
        test$1623 = parseExpression$1174();
        expect$1137(')');
        consequent$1624 = parseStatement$1205();
        if (matchKeyword$1140('else')) {
            lex$1130();
            alternate$1625 = parseStatement$1205();
        } else {
            alternate$1625 = null;
        }
        return delegate$1093.createIfStatement(test$1623, consequent$1624, alternate$1625);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$1191() {
        var body$1626, test$1627, oldInIteration$1628;
        expectKeyword$1138('do');
        oldInIteration$1628 = state$1098.inIteration;
        state$1098.inIteration = true;
        body$1626 = parseStatement$1205();
        state$1098.inIteration = oldInIteration$1628;
        expectKeyword$1138('while');
        expect$1137('(');
        test$1627 = parseExpression$1174();
        expect$1137(')');
        if (match$1139(';')) {
            lex$1130();
        }
        return delegate$1093.createDoWhileStatement(body$1626, test$1627);
    }
    function parseWhileStatement$1192() {
        var test$1629, body$1630, oldInIteration$1631;
        expectKeyword$1138('while');
        expect$1137('(');
        test$1629 = parseExpression$1174();
        expect$1137(')');
        oldInIteration$1631 = state$1098.inIteration;
        state$1098.inIteration = true;
        body$1630 = parseStatement$1205();
        state$1098.inIteration = oldInIteration$1631;
        return delegate$1093.createWhileStatement(test$1629, body$1630);
    }
    function parseForVariableDeclaration$1193() {
        var token$1632 = lex$1130(), declarations$1633 = parseVariableDeclarationList$1179();
        return delegate$1093.createVariableDeclaration(declarations$1633, token$1632.value);
    }
    function parseForStatement$1194(opts$1634) {
        var init$1635, test$1636, update$1637, left$1638, right$1639, body$1640, operator$1641, oldInIteration$1642;
        init$1635 = test$1636 = update$1637 = null;
        expectKeyword$1138('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$1141('each')) {
            throwError$1134({}, Messages$1079.EachNotAllowed);
        }
        expect$1137('(');
        if (match$1139(';')) {
            lex$1130();
        } else {
            if (matchKeyword$1140('var') || matchKeyword$1140('let') || matchKeyword$1140('const')) {
                state$1098.allowIn = false;
                init$1635 = parseForVariableDeclaration$1193();
                state$1098.allowIn = true;
                if (init$1635.declarations.length === 1) {
                    if (matchKeyword$1140('in') || matchContextualKeyword$1141('of')) {
                        operator$1641 = lookahead$1096;
                        if (!((operator$1641.value === 'in' || init$1635.kind !== 'var') && init$1635.declarations[0].init)) {
                            lex$1130();
                            left$1638 = init$1635;
                            right$1639 = parseExpression$1174();
                            init$1635 = null;
                        }
                    }
                }
            } else {
                state$1098.allowIn = false;
                init$1635 = parseExpression$1174();
                state$1098.allowIn = true;
                if (matchContextualKeyword$1141('of')) {
                    operator$1641 = lex$1130();
                    left$1638 = init$1635;
                    right$1639 = parseExpression$1174();
                    init$1635 = null;
                } else if (matchKeyword$1140('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$1145(init$1635)) {
                        throwError$1134({}, Messages$1079.InvalidLHSInForIn);
                    }
                    operator$1641 = lex$1130();
                    left$1638 = init$1635;
                    right$1639 = parseExpression$1174();
                    init$1635 = null;
                }
            }
            if (typeof left$1638 === 'undefined') {
                expect$1137(';');
            }
        }
        if (typeof left$1638 === 'undefined') {
            if (!match$1139(';')) {
                test$1636 = parseExpression$1174();
            }
            expect$1137(';');
            if (!match$1139(')')) {
                update$1637 = parseExpression$1174();
            }
        }
        expect$1137(')');
        oldInIteration$1642 = state$1098.inIteration;
        state$1098.inIteration = true;
        if (!(opts$1634 !== undefined && opts$1634.ignoreBody)) {
            body$1640 = parseStatement$1205();
        }
        state$1098.inIteration = oldInIteration$1642;
        if (typeof left$1638 === 'undefined') {
            return delegate$1093.createForStatement(init$1635, test$1636, update$1637, body$1640);
        }
        if (operator$1641.value === 'in') {
            return delegate$1093.createForInStatement(left$1638, right$1639, body$1640);
        }
        return delegate$1093.createForOfStatement(left$1638, right$1639, body$1640);
    }
    // 12.7 The continue statement
    function parseContinueStatement$1195() {
        var label$1643 = null, key$1644;
        expectKeyword$1138('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$1096.value.charCodeAt(0) === 59) {
            lex$1130();
            if (!state$1098.inIteration) {
                throwError$1134({}, Messages$1079.IllegalContinue);
            }
            return delegate$1093.createContinueStatement(null);
        }
        if (peekLineTerminator$1133()) {
            if (!state$1098.inIteration) {
                throwError$1134({}, Messages$1079.IllegalContinue);
            }
            return delegate$1093.createContinueStatement(null);
        }
        if (lookahead$1096.type === Token$1074.Identifier) {
            label$1643 = parseVariableIdentifier$1177();
            key$1644 = '$' + label$1643.name;
            if (!Object.prototype.hasOwnProperty.call(state$1098.labelSet, key$1644)) {
                throwError$1134({}, Messages$1079.UnknownLabel, label$1643.name);
            }
        }
        consumeSemicolon$1143();
        if (label$1643 === null && !state$1098.inIteration) {
            throwError$1134({}, Messages$1079.IllegalContinue);
        }
        return delegate$1093.createContinueStatement(label$1643);
    }
    // 12.8 The break statement
    function parseBreakStatement$1196() {
        var label$1645 = null, key$1646;
        expectKeyword$1138('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$1096.value.charCodeAt(0) === 59) {
            lex$1130();
            if (!(state$1098.inIteration || state$1098.inSwitch)) {
                throwError$1134({}, Messages$1079.IllegalBreak);
            }
            return delegate$1093.createBreakStatement(null);
        }
        if (peekLineTerminator$1133()) {
            if (!(state$1098.inIteration || state$1098.inSwitch)) {
                throwError$1134({}, Messages$1079.IllegalBreak);
            }
            return delegate$1093.createBreakStatement(null);
        }
        if (lookahead$1096.type === Token$1074.Identifier) {
            label$1645 = parseVariableIdentifier$1177();
            key$1646 = '$' + label$1645.name;
            if (!Object.prototype.hasOwnProperty.call(state$1098.labelSet, key$1646)) {
                throwError$1134({}, Messages$1079.UnknownLabel, label$1645.name);
            }
        }
        consumeSemicolon$1143();
        if (label$1645 === null && !(state$1098.inIteration || state$1098.inSwitch)) {
            throwError$1134({}, Messages$1079.IllegalBreak);
        }
        return delegate$1093.createBreakStatement(label$1645);
    }
    // 12.9 The return statement
    function parseReturnStatement$1197() {
        var argument$1647 = null;
        expectKeyword$1138('return');
        if (!state$1098.inFunctionBody) {
            throwErrorTolerant$1135({}, Messages$1079.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$1107(String(lookahead$1096.value).charCodeAt(0))) {
            argument$1647 = parseExpression$1174();
            consumeSemicolon$1143();
            return delegate$1093.createReturnStatement(argument$1647);
        }
        if (peekLineTerminator$1133()) {
            return delegate$1093.createReturnStatement(null);
        }
        if (!match$1139(';')) {
            if (!match$1139('}') && lookahead$1096.type !== Token$1074.EOF) {
                argument$1647 = parseExpression$1174();
            }
        }
        consumeSemicolon$1143();
        return delegate$1093.createReturnStatement(argument$1647);
    }
    // 12.10 The with statement
    function parseWithStatement$1198() {
        var object$1648, body$1649;
        if (strict$1084) {
            throwErrorTolerant$1135({}, Messages$1079.StrictModeWith);
        }
        expectKeyword$1138('with');
        expect$1137('(');
        object$1648 = parseExpression$1174();
        expect$1137(')');
        body$1649 = parseStatement$1205();
        return delegate$1093.createWithStatement(object$1648, body$1649);
    }
    // 12.10 The swith statement
    function parseSwitchCase$1199() {
        var test$1650, consequent$1651 = [], sourceElement$1652;
        if (matchKeyword$1140('default')) {
            lex$1130();
            test$1650 = null;
        } else {
            expectKeyword$1138('case');
            test$1650 = parseExpression$1174();
        }
        expect$1137(':');
        while (streamIndex$1095 < length$1092) {
            if (match$1139('}') || matchKeyword$1140('default') || matchKeyword$1140('case')) {
                break;
            }
            sourceElement$1652 = parseSourceElement$1220();
            if (typeof sourceElement$1652 === 'undefined') {
                break;
            }
            consequent$1651.push(sourceElement$1652);
        }
        return delegate$1093.createSwitchCase(test$1650, consequent$1651);
    }
    function parseSwitchStatement$1200() {
        var discriminant$1653, cases$1654, clause$1655, oldInSwitch$1656, defaultFound$1657;
        expectKeyword$1138('switch');
        expect$1137('(');
        discriminant$1653 = parseExpression$1174();
        expect$1137(')');
        expect$1137('{');
        cases$1654 = [];
        if (match$1139('}')) {
            lex$1130();
            return delegate$1093.createSwitchStatement(discriminant$1653, cases$1654);
        }
        oldInSwitch$1656 = state$1098.inSwitch;
        state$1098.inSwitch = true;
        defaultFound$1657 = false;
        while (streamIndex$1095 < length$1092) {
            if (match$1139('}')) {
                break;
            }
            clause$1655 = parseSwitchCase$1199();
            if (clause$1655.test === null) {
                if (defaultFound$1657) {
                    throwError$1134({}, Messages$1079.MultipleDefaultsInSwitch);
                }
                defaultFound$1657 = true;
            }
            cases$1654.push(clause$1655);
        }
        state$1098.inSwitch = oldInSwitch$1656;
        expect$1137('}');
        return delegate$1093.createSwitchStatement(discriminant$1653, cases$1654);
    }
    // 12.13 The throw statement
    function parseThrowStatement$1201() {
        var argument$1658;
        expectKeyword$1138('throw');
        if (peekLineTerminator$1133()) {
            throwError$1134({}, Messages$1079.NewlineAfterThrow);
        }
        argument$1658 = parseExpression$1174();
        consumeSemicolon$1143();
        return delegate$1093.createThrowStatement(argument$1658);
    }
    // 12.14 The try statement
    function parseCatchClause$1202() {
        var param$1659, body$1660;
        expectKeyword$1138('catch');
        expect$1137('(');
        if (match$1139(')')) {
            throwUnexpected$1136(lookahead$1096);
        }
        param$1659 = parseExpression$1174();
        // 12.14.1
        if (strict$1084 && param$1659.type === Syntax$1077.Identifier && isRestrictedWord$1111(param$1659.name)) {
            throwErrorTolerant$1135({}, Messages$1079.StrictCatchVariable);
        }
        expect$1137(')');
        body$1660 = parseBlock$1176();
        return delegate$1093.createCatchClause(param$1659, body$1660);
    }
    function parseTryStatement$1203() {
        var block$1661, handlers$1662 = [], finalizer$1663 = null;
        expectKeyword$1138('try');
        block$1661 = parseBlock$1176();
        if (matchKeyword$1140('catch')) {
            handlers$1662.push(parseCatchClause$1202());
        }
        if (matchKeyword$1140('finally')) {
            lex$1130();
            finalizer$1663 = parseBlock$1176();
        }
        if (handlers$1662.length === 0 && !finalizer$1663) {
            throwError$1134({}, Messages$1079.NoCatchOrFinally);
        }
        return delegate$1093.createTryStatement(block$1661, [], handlers$1662, finalizer$1663);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$1204() {
        expectKeyword$1138('debugger');
        consumeSemicolon$1143();
        return delegate$1093.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$1205() {
        var type$1664 = lookahead$1096.type, expr$1665, labeledBody$1666, key$1667;
        if (type$1664 === Token$1074.EOF) {
            throwUnexpected$1136(lookahead$1096);
        }
        if (type$1664 === Token$1074.Punctuator) {
            switch (lookahead$1096.value) {
            case ';':
                return parseEmptyStatement$1188();
            case '{':
                return parseBlock$1176();
            case '(':
                return parseExpressionStatement$1189();
            default:
                break;
            }
        }
        if (type$1664 === Token$1074.Keyword) {
            switch (lookahead$1096.value) {
            case 'break':
                return parseBreakStatement$1196();
            case 'continue':
                return parseContinueStatement$1195();
            case 'debugger':
                return parseDebuggerStatement$1204();
            case 'do':
                return parseDoWhileStatement$1191();
            case 'for':
                return parseForStatement$1194();
            case 'function':
                return parseFunctionDeclaration$1211();
            case 'class':
                return parseClassDeclaration$1218();
            case 'if':
                return parseIfStatement$1190();
            case 'return':
                return parseReturnStatement$1197();
            case 'switch':
                return parseSwitchStatement$1200();
            case 'throw':
                return parseThrowStatement$1201();
            case 'try':
                return parseTryStatement$1203();
            case 'var':
                return parseVariableStatement$1180();
            case 'while':
                return parseWhileStatement$1192();
            case 'with':
                return parseWithStatement$1198();
            default:
                break;
            }
        }
        expr$1665 = parseExpression$1174();
        // 12.12 Labelled Statements
        if (expr$1665.type === Syntax$1077.Identifier && match$1139(':')) {
            lex$1130();
            key$1667 = '$' + expr$1665.name;
            if (Object.prototype.hasOwnProperty.call(state$1098.labelSet, key$1667)) {
                throwError$1134({}, Messages$1079.Redeclaration, 'Label', expr$1665.name);
            }
            state$1098.labelSet[key$1667] = true;
            labeledBody$1666 = parseStatement$1205();
            delete state$1098.labelSet[key$1667];
            return delegate$1093.createLabeledStatement(expr$1665, labeledBody$1666);
        }
        consumeSemicolon$1143();
        return delegate$1093.createExpressionStatement(expr$1665);
    }
    // 13 Function Definition
    function parseConciseBody$1206() {
        if (match$1139('{')) {
            return parseFunctionSourceElements$1207();
        }
        return parseAssignmentExpression$1173();
    }
    function parseFunctionSourceElements$1207() {
        var sourceElement$1668, sourceElements$1669 = [], token$1670, directive$1671, firstRestricted$1672, oldLabelSet$1673, oldInIteration$1674, oldInSwitch$1675, oldInFunctionBody$1676, oldParenthesizedCount$1677;
        expect$1137('{');
        while (streamIndex$1095 < length$1092) {
            if (lookahead$1096.type !== Token$1074.StringLiteral) {
                break;
            }
            token$1670 = lookahead$1096;
            sourceElement$1668 = parseSourceElement$1220();
            sourceElements$1669.push(sourceElement$1668);
            if (sourceElement$1668.expression.type !== Syntax$1077.Literal) {
                // this is not directive
                break;
            }
            directive$1671 = token$1670.value;
            if (directive$1671 === 'use strict') {
                strict$1084 = true;
                if (firstRestricted$1672) {
                    throwErrorTolerant$1135(firstRestricted$1672, Messages$1079.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1672 && token$1670.octal) {
                    firstRestricted$1672 = token$1670;
                }
            }
        }
        oldLabelSet$1673 = state$1098.labelSet;
        oldInIteration$1674 = state$1098.inIteration;
        oldInSwitch$1675 = state$1098.inSwitch;
        oldInFunctionBody$1676 = state$1098.inFunctionBody;
        oldParenthesizedCount$1677 = state$1098.parenthesizedCount;
        state$1098.labelSet = {};
        state$1098.inIteration = false;
        state$1098.inSwitch = false;
        state$1098.inFunctionBody = true;
        state$1098.parenthesizedCount = 0;
        while (streamIndex$1095 < length$1092) {
            if (match$1139('}')) {
                break;
            }
            sourceElement$1668 = parseSourceElement$1220();
            if (typeof sourceElement$1668 === 'undefined') {
                break;
            }
            sourceElements$1669.push(sourceElement$1668);
        }
        expect$1137('}');
        state$1098.labelSet = oldLabelSet$1673;
        state$1098.inIteration = oldInIteration$1674;
        state$1098.inSwitch = oldInSwitch$1675;
        state$1098.inFunctionBody = oldInFunctionBody$1676;
        state$1098.parenthesizedCount = oldParenthesizedCount$1677;
        return delegate$1093.createBlockStatement(sourceElements$1669);
    }
    function validateParam$1208(options$1678, param$1679, name$1680) {
        var key$1681 = '$' + name$1680;
        if (strict$1084) {
            if (isRestrictedWord$1111(name$1680)) {
                options$1678.stricted = param$1679;
                options$1678.message = Messages$1079.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1678.paramSet, key$1681)) {
                options$1678.stricted = param$1679;
                options$1678.message = Messages$1079.StrictParamDupe;
            }
        } else if (!options$1678.firstRestricted) {
            if (isRestrictedWord$1111(name$1680)) {
                options$1678.firstRestricted = param$1679;
                options$1678.message = Messages$1079.StrictParamName;
            } else if (isStrictModeReservedWord$1110(name$1680)) {
                options$1678.firstRestricted = param$1679;
                options$1678.message = Messages$1079.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1678.paramSet, key$1681)) {
                options$1678.firstRestricted = param$1679;
                options$1678.message = Messages$1079.StrictParamDupe;
            }
        }
        options$1678.paramSet[key$1681] = true;
    }
    function parseParam$1209(options$1682) {
        var token$1683, rest$1684, param$1685, def$1686;
        token$1683 = lookahead$1096;
        if (token$1683.value === '...') {
            token$1683 = lex$1130();
            rest$1684 = true;
        }
        if (match$1139('[')) {
            param$1685 = parseArrayInitialiser$1146();
            reinterpretAsDestructuredParameter$1170(options$1682, param$1685);
        } else if (match$1139('{')) {
            if (rest$1684) {
                throwError$1134({}, Messages$1079.ObjectPatternAsRestParameter);
            }
            param$1685 = parseObjectInitialiser$1151();
            reinterpretAsDestructuredParameter$1170(options$1682, param$1685);
        } else {
            param$1685 = parseVariableIdentifier$1177();
            validateParam$1208(options$1682, token$1683, token$1683.value);
            if (match$1139('=')) {
                if (rest$1684) {
                    throwErrorTolerant$1135(lookahead$1096, Messages$1079.DefaultRestParameter);
                }
                lex$1130();
                def$1686 = parseAssignmentExpression$1173();
                ++options$1682.defaultCount;
            }
        }
        if (rest$1684) {
            if (!match$1139(')')) {
                throwError$1134({}, Messages$1079.ParameterAfterRestParameter);
            }
            options$1682.rest = param$1685;
            return false;
        }
        options$1682.params.push(param$1685);
        options$1682.defaults.push(def$1686);
        return !match$1139(')');
    }
    function parseParams$1210(firstRestricted$1687) {
        var options$1688;
        options$1688 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1687
        };
        expect$1137('(');
        if (!match$1139(')')) {
            options$1688.paramSet = {};
            while (streamIndex$1095 < length$1092) {
                if (!parseParam$1209(options$1688)) {
                    break;
                }
                expect$1137(',');
            }
        }
        expect$1137(')');
        if (options$1688.defaultCount === 0) {
            options$1688.defaults = [];
        }
        return options$1688;
    }
    function parseFunctionDeclaration$1211() {
        var id$1689, body$1690, token$1691, tmp$1692, firstRestricted$1693, message$1694, previousStrict$1695, previousYieldAllowed$1696, generator$1697, expression$1698;
        expectKeyword$1138('function');
        generator$1697 = false;
        if (match$1139('*')) {
            lex$1130();
            generator$1697 = true;
        }
        token$1691 = lookahead$1096;
        id$1689 = parseVariableIdentifier$1177();
        if (strict$1084) {
            if (isRestrictedWord$1111(token$1691.value)) {
                throwErrorTolerant$1135(token$1691, Messages$1079.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$1111(token$1691.value)) {
                firstRestricted$1693 = token$1691;
                message$1694 = Messages$1079.StrictFunctionName;
            } else if (isStrictModeReservedWord$1110(token$1691.value)) {
                firstRestricted$1693 = token$1691;
                message$1694 = Messages$1079.StrictReservedWord;
            }
        }
        tmp$1692 = parseParams$1210(firstRestricted$1693);
        firstRestricted$1693 = tmp$1692.firstRestricted;
        if (tmp$1692.message) {
            message$1694 = tmp$1692.message;
        }
        previousStrict$1695 = strict$1084;
        previousYieldAllowed$1696 = state$1098.yieldAllowed;
        state$1098.yieldAllowed = generator$1697;
        // here we redo some work in order to set 'expression'
        expression$1698 = !match$1139('{');
        body$1690 = parseConciseBody$1206();
        if (strict$1084 && firstRestricted$1693) {
            throwError$1134(firstRestricted$1693, message$1694);
        }
        if (strict$1084 && tmp$1692.stricted) {
            throwErrorTolerant$1135(tmp$1692.stricted, message$1694);
        }
        if (state$1098.yieldAllowed && !state$1098.yieldFound) {
            throwErrorTolerant$1135({}, Messages$1079.NoYieldInGenerator);
        }
        strict$1084 = previousStrict$1695;
        state$1098.yieldAllowed = previousYieldAllowed$1696;
        return delegate$1093.createFunctionDeclaration(id$1689, tmp$1692.params, tmp$1692.defaults, body$1690, tmp$1692.rest, generator$1697, expression$1698);
    }
    function parseFunctionExpression$1212() {
        var token$1699, id$1700 = null, firstRestricted$1701, message$1702, tmp$1703, body$1704, previousStrict$1705, previousYieldAllowed$1706, generator$1707, expression$1708;
        expectKeyword$1138('function');
        generator$1707 = false;
        if (match$1139('*')) {
            lex$1130();
            generator$1707 = true;
        }
        if (!match$1139('(')) {
            token$1699 = lookahead$1096;
            id$1700 = parseVariableIdentifier$1177();
            if (strict$1084) {
                if (isRestrictedWord$1111(token$1699.value)) {
                    throwErrorTolerant$1135(token$1699, Messages$1079.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$1111(token$1699.value)) {
                    firstRestricted$1701 = token$1699;
                    message$1702 = Messages$1079.StrictFunctionName;
                } else if (isStrictModeReservedWord$1110(token$1699.value)) {
                    firstRestricted$1701 = token$1699;
                    message$1702 = Messages$1079.StrictReservedWord;
                }
            }
        }
        tmp$1703 = parseParams$1210(firstRestricted$1701);
        firstRestricted$1701 = tmp$1703.firstRestricted;
        if (tmp$1703.message) {
            message$1702 = tmp$1703.message;
        }
        previousStrict$1705 = strict$1084;
        previousYieldAllowed$1706 = state$1098.yieldAllowed;
        state$1098.yieldAllowed = generator$1707;
        // here we redo some work in order to set 'expression'
        expression$1708 = !match$1139('{');
        body$1704 = parseConciseBody$1206();
        if (strict$1084 && firstRestricted$1701) {
            throwError$1134(firstRestricted$1701, message$1702);
        }
        if (strict$1084 && tmp$1703.stricted) {
            throwErrorTolerant$1135(tmp$1703.stricted, message$1702);
        }
        if (state$1098.yieldAllowed && !state$1098.yieldFound) {
            throwErrorTolerant$1135({}, Messages$1079.NoYieldInGenerator);
        }
        strict$1084 = previousStrict$1705;
        state$1098.yieldAllowed = previousYieldAllowed$1706;
        return delegate$1093.createFunctionExpression(id$1700, tmp$1703.params, tmp$1703.defaults, body$1704, tmp$1703.rest, generator$1707, expression$1708);
    }
    function parseYieldExpression$1213() {
        var delegateFlag$1709, expr$1710, previousYieldAllowed$1711;
        expectKeyword$1138('yield');
        if (!state$1098.yieldAllowed) {
            throwErrorTolerant$1135({}, Messages$1079.IllegalYield);
        }
        delegateFlag$1709 = false;
        if (match$1139('*')) {
            lex$1130();
            delegateFlag$1709 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1711 = state$1098.yieldAllowed;
        state$1098.yieldAllowed = false;
        expr$1710 = parseAssignmentExpression$1173();
        state$1098.yieldAllowed = previousYieldAllowed$1711;
        state$1098.yieldFound = true;
        return delegate$1093.createYieldExpression(expr$1710, delegateFlag$1709);
    }
    // 14 Classes
    function parseMethodDefinition$1214(existingPropNames$1712) {
        var token$1713, key$1714, param$1715, propType$1716, isValidDuplicateProp$1717 = false;
        if (lookahead$1096.value === 'static') {
            propType$1716 = ClassPropertyType$1082.static;
            lex$1130();
        } else {
            propType$1716 = ClassPropertyType$1082.prototype;
        }
        if (match$1139('*')) {
            lex$1130();
            return delegate$1093.createMethodDefinition(propType$1716, '', parseObjectPropertyKey$1149(), parsePropertyMethodFunction$1148({ generator: true }));
        }
        token$1713 = lookahead$1096;
        key$1714 = parseObjectPropertyKey$1149();
        if (token$1713.value === 'get' && !match$1139('(')) {
            key$1714 = parseObjectPropertyKey$1149();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1712[propType$1716].hasOwnProperty(key$1714.name)) {
                isValidDuplicateProp$1717 = existingPropNames$1712[propType$1716][key$1714.name].get === undefined && existingPropNames$1712[propType$1716][key$1714.name].data === undefined && existingPropNames$1712[propType$1716][key$1714.name].set !== undefined;
                if (!isValidDuplicateProp$1717) {
                    throwError$1134(key$1714, Messages$1079.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1712[propType$1716][key$1714.name] = {};
            }
            existingPropNames$1712[propType$1716][key$1714.name].get = true;
            expect$1137('(');
            expect$1137(')');
            return delegate$1093.createMethodDefinition(propType$1716, 'get', key$1714, parsePropertyFunction$1147({ generator: false }));
        }
        if (token$1713.value === 'set' && !match$1139('(')) {
            key$1714 = parseObjectPropertyKey$1149();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1712[propType$1716].hasOwnProperty(key$1714.name)) {
                isValidDuplicateProp$1717 = existingPropNames$1712[propType$1716][key$1714.name].set === undefined && existingPropNames$1712[propType$1716][key$1714.name].data === undefined && existingPropNames$1712[propType$1716][key$1714.name].get !== undefined;
                if (!isValidDuplicateProp$1717) {
                    throwError$1134(key$1714, Messages$1079.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1712[propType$1716][key$1714.name] = {};
            }
            existingPropNames$1712[propType$1716][key$1714.name].set = true;
            expect$1137('(');
            token$1713 = lookahead$1096;
            param$1715 = [parseVariableIdentifier$1177()];
            expect$1137(')');
            return delegate$1093.createMethodDefinition(propType$1716, 'set', key$1714, parsePropertyFunction$1147({
                params: param$1715,
                generator: false,
                name: token$1713
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1712[propType$1716].hasOwnProperty(key$1714.name)) {
            throwError$1134(key$1714, Messages$1079.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1712[propType$1716][key$1714.name] = {};
        }
        existingPropNames$1712[propType$1716][key$1714.name].data = true;
        return delegate$1093.createMethodDefinition(propType$1716, '', key$1714, parsePropertyMethodFunction$1148({ generator: false }));
    }
    function parseClassElement$1215(existingProps$1718) {
        if (match$1139(';')) {
            lex$1130();
            return;
        }
        return parseMethodDefinition$1214(existingProps$1718);
    }
    function parseClassBody$1216() {
        var classElement$1719, classElements$1720 = [], existingProps$1721 = {};
        existingProps$1721[ClassPropertyType$1082.static] = {};
        existingProps$1721[ClassPropertyType$1082.prototype] = {};
        expect$1137('{');
        while (streamIndex$1095 < length$1092) {
            if (match$1139('}')) {
                break;
            }
            classElement$1719 = parseClassElement$1215(existingProps$1721);
            if (typeof classElement$1719 !== 'undefined') {
                classElements$1720.push(classElement$1719);
            }
        }
        expect$1137('}');
        return delegate$1093.createClassBody(classElements$1720);
    }
    function parseClassExpression$1217() {
        var id$1722, previousYieldAllowed$1723, superClass$1724 = null;
        expectKeyword$1138('class');
        if (!matchKeyword$1140('extends') && !match$1139('{')) {
            id$1722 = parseVariableIdentifier$1177();
        }
        if (matchKeyword$1140('extends')) {
            expectKeyword$1138('extends');
            previousYieldAllowed$1723 = state$1098.yieldAllowed;
            state$1098.yieldAllowed = false;
            superClass$1724 = parseAssignmentExpression$1173();
            state$1098.yieldAllowed = previousYieldAllowed$1723;
        }
        return delegate$1093.createClassExpression(id$1722, superClass$1724, parseClassBody$1216());
    }
    function parseClassDeclaration$1218() {
        var id$1725, previousYieldAllowed$1726, superClass$1727 = null;
        expectKeyword$1138('class');
        id$1725 = parseVariableIdentifier$1177();
        if (matchKeyword$1140('extends')) {
            expectKeyword$1138('extends');
            previousYieldAllowed$1726 = state$1098.yieldAllowed;
            state$1098.yieldAllowed = false;
            superClass$1727 = parseAssignmentExpression$1173();
            state$1098.yieldAllowed = previousYieldAllowed$1726;
        }
        return delegate$1093.createClassDeclaration(id$1725, superClass$1727, parseClassBody$1216());
    }
    // 15 Program
    function matchModuleDeclaration$1219() {
        var id$1728;
        if (matchContextualKeyword$1141('module')) {
            id$1728 = lookahead2$1132();
            return id$1728.type === Token$1074.StringLiteral || id$1728.type === Token$1074.Identifier;
        }
        return false;
    }
    function parseSourceElement$1220() {
        if (lookahead$1096.type === Token$1074.Keyword) {
            switch (lookahead$1096.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$1181(lookahead$1096.value);
            case 'function':
                return parseFunctionDeclaration$1211();
            case 'export':
                return parseExportDeclaration$1185();
            case 'import':
                return parseImportDeclaration$1186();
            default:
                return parseStatement$1205();
            }
        }
        if (matchModuleDeclaration$1219()) {
            throwError$1134({}, Messages$1079.NestedModule);
        }
        if (lookahead$1096.type !== Token$1074.EOF) {
            return parseStatement$1205();
        }
    }
    function parseProgramElement$1221() {
        if (lookahead$1096.type === Token$1074.Keyword) {
            switch (lookahead$1096.value) {
            case 'export':
                return parseExportDeclaration$1185();
            case 'import':
                return parseImportDeclaration$1186();
            }
        }
        if (matchModuleDeclaration$1219()) {
            return parseModuleDeclaration$1182();
        }
        return parseSourceElement$1220();
    }
    function parseProgramElements$1222() {
        var sourceElement$1729, sourceElements$1730 = [], token$1731, directive$1732, firstRestricted$1733;
        while (streamIndex$1095 < length$1092) {
            token$1731 = lookahead$1096;
            if (token$1731.type !== Token$1074.StringLiteral) {
                break;
            }
            sourceElement$1729 = parseProgramElement$1221();
            sourceElements$1730.push(sourceElement$1729);
            if (sourceElement$1729.expression.type !== Syntax$1077.Literal) {
                // this is not directive
                break;
            }
            directive$1732 = token$1731.value;
            if (directive$1732 === 'use strict') {
                strict$1084 = true;
                if (firstRestricted$1733) {
                    throwErrorTolerant$1135(firstRestricted$1733, Messages$1079.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1733 && token$1731.octal) {
                    firstRestricted$1733 = token$1731;
                }
            }
        }
        while (streamIndex$1095 < length$1092) {
            sourceElement$1729 = parseProgramElement$1221();
            if (typeof sourceElement$1729 === 'undefined') {
                break;
            }
            sourceElements$1730.push(sourceElement$1729);
        }
        return sourceElements$1730;
    }
    function parseModuleElement$1223() {
        return parseSourceElement$1220();
    }
    function parseModuleElements$1224() {
        var list$1734 = [], statement$1735;
        while (streamIndex$1095 < length$1092) {
            if (match$1139('}')) {
                break;
            }
            statement$1735 = parseModuleElement$1223();
            if (typeof statement$1735 === 'undefined') {
                break;
            }
            list$1734.push(statement$1735);
        }
        return list$1734;
    }
    function parseModuleBlock$1225() {
        var block$1736;
        expect$1137('{');
        block$1736 = parseModuleElements$1224();
        expect$1137('}');
        return delegate$1093.createBlockStatement(block$1736);
    }
    function parseProgram$1226() {
        var body$1737;
        strict$1084 = false;
        peek$1131();
        body$1737 = parseProgramElements$1222();
        return delegate$1093.createProgram(body$1737);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1227(type$1738, value$1739, start$1740, end$1741, loc$1742) {
        assert$1100(typeof start$1740 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$1099.comments.length > 0) {
            if (extra$1099.comments[extra$1099.comments.length - 1].range[1] > start$1740) {
                return;
            }
        }
        extra$1099.comments.push({
            type: type$1738,
            value: value$1739,
            range: [
                start$1740,
                end$1741
            ],
            loc: loc$1742
        });
    }
    function scanComment$1228() {
        var comment$1743, ch$1744, loc$1745, start$1746, blockComment$1747, lineComment$1748;
        comment$1743 = '';
        blockComment$1747 = false;
        lineComment$1748 = false;
        while (index$1085 < length$1092) {
            ch$1744 = source$1083[index$1085];
            if (lineComment$1748) {
                ch$1744 = source$1083[index$1085++];
                if (isLineTerminator$1106(ch$1744.charCodeAt(0))) {
                    loc$1745.end = {
                        line: lineNumber$1086,
                        column: index$1085 - lineStart$1087 - 1
                    };
                    lineComment$1748 = false;
                    addComment$1227('Line', comment$1743, start$1746, index$1085 - 1, loc$1745);
                    if (ch$1744 === '\r' && source$1083[index$1085] === '\n') {
                        ++index$1085;
                    }
                    ++lineNumber$1086;
                    lineStart$1087 = index$1085;
                    comment$1743 = '';
                } else if (index$1085 >= length$1092) {
                    lineComment$1748 = false;
                    comment$1743 += ch$1744;
                    loc$1745.end = {
                        line: lineNumber$1086,
                        column: length$1092 - lineStart$1087
                    };
                    addComment$1227('Line', comment$1743, start$1746, length$1092, loc$1745);
                } else {
                    comment$1743 += ch$1744;
                }
            } else if (blockComment$1747) {
                if (isLineTerminator$1106(ch$1744.charCodeAt(0))) {
                    if (ch$1744 === '\r' && source$1083[index$1085 + 1] === '\n') {
                        ++index$1085;
                        comment$1743 += '\r\n';
                    } else {
                        comment$1743 += ch$1744;
                    }
                    ++lineNumber$1086;
                    ++index$1085;
                    lineStart$1087 = index$1085;
                    if (index$1085 >= length$1092) {
                        throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1744 = source$1083[index$1085++];
                    if (index$1085 >= length$1092) {
                        throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1743 += ch$1744;
                    if (ch$1744 === '*') {
                        ch$1744 = source$1083[index$1085];
                        if (ch$1744 === '/') {
                            comment$1743 = comment$1743.substr(0, comment$1743.length - 1);
                            blockComment$1747 = false;
                            ++index$1085;
                            loc$1745.end = {
                                line: lineNumber$1086,
                                column: index$1085 - lineStart$1087
                            };
                            addComment$1227('Block', comment$1743, start$1746, index$1085, loc$1745);
                            comment$1743 = '';
                        }
                    }
                }
            } else if (ch$1744 === '/') {
                ch$1744 = source$1083[index$1085 + 1];
                if (ch$1744 === '/') {
                    loc$1745 = {
                        start: {
                            line: lineNumber$1086,
                            column: index$1085 - lineStart$1087
                        }
                    };
                    start$1746 = index$1085;
                    index$1085 += 2;
                    lineComment$1748 = true;
                    if (index$1085 >= length$1092) {
                        loc$1745.end = {
                            line: lineNumber$1086,
                            column: index$1085 - lineStart$1087
                        };
                        lineComment$1748 = false;
                        addComment$1227('Line', comment$1743, start$1746, index$1085, loc$1745);
                    }
                } else if (ch$1744 === '*') {
                    start$1746 = index$1085;
                    index$1085 += 2;
                    blockComment$1747 = true;
                    loc$1745 = {
                        start: {
                            line: lineNumber$1086,
                            column: index$1085 - lineStart$1087 - 2
                        }
                    };
                    if (index$1085 >= length$1092) {
                        throwError$1134({}, Messages$1079.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1105(ch$1744.charCodeAt(0))) {
                ++index$1085;
            } else if (isLineTerminator$1106(ch$1744.charCodeAt(0))) {
                ++index$1085;
                if (ch$1744 === '\r' && source$1083[index$1085] === '\n') {
                    ++index$1085;
                }
                ++lineNumber$1086;
                lineStart$1087 = index$1085;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1229() {
        var i$1749, entry$1750, comment$1751, comments$1752 = [];
        for (i$1749 = 0; i$1749 < extra$1099.comments.length; ++i$1749) {
            entry$1750 = extra$1099.comments[i$1749];
            comment$1751 = {
                type: entry$1750.type,
                value: entry$1750.value
            };
            if (extra$1099.range) {
                comment$1751.range = entry$1750.range;
            }
            if (extra$1099.loc) {
                comment$1751.loc = entry$1750.loc;
            }
            comments$1752.push(comment$1751);
        }
        extra$1099.comments = comments$1752;
    }
    function collectToken$1230() {
        var start$1753, loc$1754, token$1755, range$1756, value$1757;
        skipComment$1113();
        start$1753 = index$1085;
        loc$1754 = {
            start: {
                line: lineNumber$1086,
                column: index$1085 - lineStart$1087
            }
        };
        token$1755 = extra$1099.advance();
        loc$1754.end = {
            line: lineNumber$1086,
            column: index$1085 - lineStart$1087
        };
        if (token$1755.type !== Token$1074.EOF) {
            range$1756 = [
                token$1755.range[0],
                token$1755.range[1]
            ];
            value$1757 = source$1083.slice(token$1755.range[0], token$1755.range[1]);
            extra$1099.tokens.push({
                type: TokenName$1075[token$1755.type],
                value: value$1757,
                range: range$1756,
                loc: loc$1754
            });
        }
        return token$1755;
    }
    function collectRegex$1231() {
        var pos$1758, loc$1759, regex$1760, token$1761;
        skipComment$1113();
        pos$1758 = index$1085;
        loc$1759 = {
            start: {
                line: lineNumber$1086,
                column: index$1085 - lineStart$1087
            }
        };
        regex$1760 = extra$1099.scanRegExp();
        loc$1759.end = {
            line: lineNumber$1086,
            column: index$1085 - lineStart$1087
        };
        if (!extra$1099.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$1099.tokens.length > 0) {
                token$1761 = extra$1099.tokens[extra$1099.tokens.length - 1];
                if (token$1761.range[0] === pos$1758 && token$1761.type === 'Punctuator') {
                    if (token$1761.value === '/' || token$1761.value === '/=') {
                        extra$1099.tokens.pop();
                    }
                }
            }
            extra$1099.tokens.push({
                type: 'RegularExpression',
                value: regex$1760.literal,
                range: [
                    pos$1758,
                    index$1085
                ],
                loc: loc$1759
            });
        }
        return regex$1760;
    }
    function filterTokenLocation$1232() {
        var i$1762, entry$1763, token$1764, tokens$1765 = [];
        for (i$1762 = 0; i$1762 < extra$1099.tokens.length; ++i$1762) {
            entry$1763 = extra$1099.tokens[i$1762];
            token$1764 = {
                type: entry$1763.type,
                value: entry$1763.value
            };
            if (extra$1099.range) {
                token$1764.range = entry$1763.range;
            }
            if (extra$1099.loc) {
                token$1764.loc = entry$1763.loc;
            }
            tokens$1765.push(token$1764);
        }
        extra$1099.tokens = tokens$1765;
    }
    function LocationMarker$1233() {
        var sm_index$1766 = lookahead$1096 ? lookahead$1096.sm_range[0] : 0;
        var sm_lineStart$1767 = lookahead$1096 ? lookahead$1096.sm_lineStart : 0;
        var sm_lineNumber$1768 = lookahead$1096 ? lookahead$1096.sm_lineNumber : 1;
        this.range = [
            sm_index$1766,
            sm_index$1766
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1768,
                column: sm_index$1766 - sm_lineStart$1767
            },
            end: {
                line: sm_lineNumber$1768,
                column: sm_index$1766 - sm_lineStart$1767
            }
        };
    }
    LocationMarker$1233.prototype = {
        constructor: LocationMarker$1233,
        end: function () {
            this.range[1] = sm_index$1091;
            this.loc.end.line = sm_lineNumber$1088;
            this.loc.end.column = sm_index$1091 - sm_lineStart$1089;
        },
        applyGroup: function (node$1769) {
            if (extra$1099.range) {
                node$1769.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$1099.loc) {
                node$1769.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1769 = delegate$1093.postProcess(node$1769);
            }
        },
        apply: function (node$1770) {
            var nodeType$1771 = typeof node$1770;
            assert$1100(nodeType$1771 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1771);
            if (extra$1099.range) {
                node$1770.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$1099.loc) {
                node$1770.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1770 = delegate$1093.postProcess(node$1770);
            }
        }
    };
    function createLocationMarker$1234() {
        return new LocationMarker$1233();
    }
    function trackGroupExpression$1235() {
        var marker$1772, expr$1773;
        marker$1772 = createLocationMarker$1234();
        expect$1137('(');
        ++state$1098.parenthesizedCount;
        expr$1773 = parseExpression$1174();
        expect$1137(')');
        marker$1772.end();
        marker$1772.applyGroup(expr$1773);
        return expr$1773;
    }
    function trackLeftHandSideExpression$1236() {
        var marker$1774, expr$1775;
        // skipComment();
        marker$1774 = createLocationMarker$1234();
        expr$1775 = matchKeyword$1140('new') ? parseNewExpression$1161() : parsePrimaryExpression$1155();
        while (match$1139('.') || match$1139('[') || lookahead$1096.type === Token$1074.Template) {
            if (match$1139('[')) {
                expr$1775 = delegate$1093.createMemberExpression('[', expr$1775, parseComputedMember$1160());
                marker$1774.end();
                marker$1774.apply(expr$1775);
            } else if (match$1139('.')) {
                expr$1775 = delegate$1093.createMemberExpression('.', expr$1775, parseNonComputedMember$1159());
                marker$1774.end();
                marker$1774.apply(expr$1775);
            } else {
                expr$1775 = delegate$1093.createTaggedTemplateExpression(expr$1775, parseTemplateLiteral$1153());
                marker$1774.end();
                marker$1774.apply(expr$1775);
            }
        }
        return expr$1775;
    }
    function trackLeftHandSideExpressionAllowCall$1237() {
        var marker$1776, expr$1777, args$1778;
        // skipComment();
        marker$1776 = createLocationMarker$1234();
        expr$1777 = matchKeyword$1140('new') ? parseNewExpression$1161() : parsePrimaryExpression$1155();
        while (match$1139('.') || match$1139('[') || match$1139('(') || lookahead$1096.type === Token$1074.Template) {
            if (match$1139('(')) {
                args$1778 = parseArguments$1156();
                expr$1777 = delegate$1093.createCallExpression(expr$1777, args$1778);
                marker$1776.end();
                marker$1776.apply(expr$1777);
            } else if (match$1139('[')) {
                expr$1777 = delegate$1093.createMemberExpression('[', expr$1777, parseComputedMember$1160());
                marker$1776.end();
                marker$1776.apply(expr$1777);
            } else if (match$1139('.')) {
                expr$1777 = delegate$1093.createMemberExpression('.', expr$1777, parseNonComputedMember$1159());
                marker$1776.end();
                marker$1776.apply(expr$1777);
            } else {
                expr$1777 = delegate$1093.createTaggedTemplateExpression(expr$1777, parseTemplateLiteral$1153());
                marker$1776.end();
                marker$1776.apply(expr$1777);
            }
        }
        return expr$1777;
    }
    function filterGroup$1238(node$1779) {
        var n$1780, i$1781, entry$1782;
        n$1780 = Object.prototype.toString.apply(node$1779) === '[object Array]' ? [] : {};
        for (i$1781 in node$1779) {
            if (node$1779.hasOwnProperty(i$1781) && i$1781 !== 'groupRange' && i$1781 !== 'groupLoc') {
                entry$1782 = node$1779[i$1781];
                if (entry$1782 === null || typeof entry$1782 !== 'object' || entry$1782 instanceof RegExp) {
                    n$1780[i$1781] = entry$1782;
                } else {
                    n$1780[i$1781] = filterGroup$1238(entry$1782);
                }
            }
        }
        return n$1780;
    }
    function wrapTrackingFunction$1239(range$1783, loc$1784) {
        return function (parseFunction$1785) {
            function isBinary$1786(node$1788) {
                return node$1788.type === Syntax$1077.LogicalExpression || node$1788.type === Syntax$1077.BinaryExpression;
            }
            function visit$1787(node$1789) {
                var start$1790, end$1791;
                if (isBinary$1786(node$1789.left)) {
                    visit$1787(node$1789.left);
                }
                if (isBinary$1786(node$1789.right)) {
                    visit$1787(node$1789.right);
                }
                if (range$1783) {
                    if (node$1789.left.groupRange || node$1789.right.groupRange) {
                        start$1790 = node$1789.left.groupRange ? node$1789.left.groupRange[0] : node$1789.left.range[0];
                        end$1791 = node$1789.right.groupRange ? node$1789.right.groupRange[1] : node$1789.right.range[1];
                        node$1789.range = [
                            start$1790,
                            end$1791
                        ];
                    } else if (typeof node$1789.range === 'undefined') {
                        start$1790 = node$1789.left.range[0];
                        end$1791 = node$1789.right.range[1];
                        node$1789.range = [
                            start$1790,
                            end$1791
                        ];
                    }
                }
                if (loc$1784) {
                    if (node$1789.left.groupLoc || node$1789.right.groupLoc) {
                        start$1790 = node$1789.left.groupLoc ? node$1789.left.groupLoc.start : node$1789.left.loc.start;
                        end$1791 = node$1789.right.groupLoc ? node$1789.right.groupLoc.end : node$1789.right.loc.end;
                        node$1789.loc = {
                            start: start$1790,
                            end: end$1791
                        };
                        node$1789 = delegate$1093.postProcess(node$1789);
                    } else if (typeof node$1789.loc === 'undefined') {
                        node$1789.loc = {
                            start: node$1789.left.loc.start,
                            end: node$1789.right.loc.end
                        };
                        node$1789 = delegate$1093.postProcess(node$1789);
                    }
                }
            }
            return function () {
                var marker$1792, node$1793, curr$1794 = lookahead$1096;
                marker$1792 = createLocationMarker$1234();
                node$1793 = parseFunction$1785.apply(null, arguments);
                marker$1792.end();
                if (node$1793.type !== Syntax$1077.Program) {
                    if (curr$1794.leadingComments) {
                        node$1793.leadingComments = curr$1794.leadingComments;
                    }
                    if (curr$1794.trailingComments) {
                        node$1793.trailingComments = curr$1794.trailingComments;
                    }
                }
                if (range$1783 && typeof node$1793.range === 'undefined') {
                    marker$1792.apply(node$1793);
                }
                if (loc$1784 && typeof node$1793.loc === 'undefined') {
                    marker$1792.apply(node$1793);
                }
                if (isBinary$1786(node$1793)) {
                    visit$1787(node$1793);
                }
                return node$1793;
            };
        };
    }
    function patch$1240() {
        var wrapTracking$1795;
        if (extra$1099.comments) {
            extra$1099.skipComment = skipComment$1113;
            skipComment$1113 = scanComment$1228;
        }
        if (extra$1099.range || extra$1099.loc) {
            extra$1099.parseGroupExpression = parseGroupExpression$1154;
            extra$1099.parseLeftHandSideExpression = parseLeftHandSideExpression$1163;
            extra$1099.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$1162;
            parseGroupExpression$1154 = trackGroupExpression$1235;
            parseLeftHandSideExpression$1163 = trackLeftHandSideExpression$1236;
            parseLeftHandSideExpressionAllowCall$1162 = trackLeftHandSideExpressionAllowCall$1237;
            wrapTracking$1795 = wrapTrackingFunction$1239(extra$1099.range, extra$1099.loc);
            extra$1099.parseArrayInitialiser = parseArrayInitialiser$1146;
            extra$1099.parseAssignmentExpression = parseAssignmentExpression$1173;
            extra$1099.parseBinaryExpression = parseBinaryExpression$1167;
            extra$1099.parseBlock = parseBlock$1176;
            extra$1099.parseFunctionSourceElements = parseFunctionSourceElements$1207;
            extra$1099.parseCatchClause = parseCatchClause$1202;
            extra$1099.parseComputedMember = parseComputedMember$1160;
            extra$1099.parseConditionalExpression = parseConditionalExpression$1168;
            extra$1099.parseConstLetDeclaration = parseConstLetDeclaration$1181;
            extra$1099.parseExportBatchSpecifier = parseExportBatchSpecifier$1183;
            extra$1099.parseExportDeclaration = parseExportDeclaration$1185;
            extra$1099.parseExportSpecifier = parseExportSpecifier$1184;
            extra$1099.parseExpression = parseExpression$1174;
            extra$1099.parseForVariableDeclaration = parseForVariableDeclaration$1193;
            extra$1099.parseFunctionDeclaration = parseFunctionDeclaration$1211;
            extra$1099.parseFunctionExpression = parseFunctionExpression$1212;
            extra$1099.parseParams = parseParams$1210;
            extra$1099.parseImportDeclaration = parseImportDeclaration$1186;
            extra$1099.parseImportSpecifier = parseImportSpecifier$1187;
            extra$1099.parseModuleDeclaration = parseModuleDeclaration$1182;
            extra$1099.parseModuleBlock = parseModuleBlock$1225;
            extra$1099.parseNewExpression = parseNewExpression$1161;
            extra$1099.parseNonComputedProperty = parseNonComputedProperty$1158;
            extra$1099.parseObjectInitialiser = parseObjectInitialiser$1151;
            extra$1099.parseObjectProperty = parseObjectProperty$1150;
            extra$1099.parseObjectPropertyKey = parseObjectPropertyKey$1149;
            extra$1099.parsePostfixExpression = parsePostfixExpression$1164;
            extra$1099.parsePrimaryExpression = parsePrimaryExpression$1155;
            extra$1099.parseProgram = parseProgram$1226;
            extra$1099.parsePropertyFunction = parsePropertyFunction$1147;
            extra$1099.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$1157;
            extra$1099.parseTemplateElement = parseTemplateElement$1152;
            extra$1099.parseTemplateLiteral = parseTemplateLiteral$1153;
            extra$1099.parseStatement = parseStatement$1205;
            extra$1099.parseSwitchCase = parseSwitchCase$1199;
            extra$1099.parseUnaryExpression = parseUnaryExpression$1165;
            extra$1099.parseVariableDeclaration = parseVariableDeclaration$1178;
            extra$1099.parseVariableIdentifier = parseVariableIdentifier$1177;
            extra$1099.parseMethodDefinition = parseMethodDefinition$1214;
            extra$1099.parseClassDeclaration = parseClassDeclaration$1218;
            extra$1099.parseClassExpression = parseClassExpression$1217;
            extra$1099.parseClassBody = parseClassBody$1216;
            parseArrayInitialiser$1146 = wrapTracking$1795(extra$1099.parseArrayInitialiser);
            parseAssignmentExpression$1173 = wrapTracking$1795(extra$1099.parseAssignmentExpression);
            parseBinaryExpression$1167 = wrapTracking$1795(extra$1099.parseBinaryExpression);
            parseBlock$1176 = wrapTracking$1795(extra$1099.parseBlock);
            parseFunctionSourceElements$1207 = wrapTracking$1795(extra$1099.parseFunctionSourceElements);
            parseCatchClause$1202 = wrapTracking$1795(extra$1099.parseCatchClause);
            parseComputedMember$1160 = wrapTracking$1795(extra$1099.parseComputedMember);
            parseConditionalExpression$1168 = wrapTracking$1795(extra$1099.parseConditionalExpression);
            parseConstLetDeclaration$1181 = wrapTracking$1795(extra$1099.parseConstLetDeclaration);
            parseExportBatchSpecifier$1183 = wrapTracking$1795(parseExportBatchSpecifier$1183);
            parseExportDeclaration$1185 = wrapTracking$1795(parseExportDeclaration$1185);
            parseExportSpecifier$1184 = wrapTracking$1795(parseExportSpecifier$1184);
            parseExpression$1174 = wrapTracking$1795(extra$1099.parseExpression);
            parseForVariableDeclaration$1193 = wrapTracking$1795(extra$1099.parseForVariableDeclaration);
            parseFunctionDeclaration$1211 = wrapTracking$1795(extra$1099.parseFunctionDeclaration);
            parseFunctionExpression$1212 = wrapTracking$1795(extra$1099.parseFunctionExpression);
            parseParams$1210 = wrapTracking$1795(extra$1099.parseParams);
            parseImportDeclaration$1186 = wrapTracking$1795(extra$1099.parseImportDeclaration);
            parseImportSpecifier$1187 = wrapTracking$1795(extra$1099.parseImportSpecifier);
            parseModuleDeclaration$1182 = wrapTracking$1795(extra$1099.parseModuleDeclaration);
            parseModuleBlock$1225 = wrapTracking$1795(extra$1099.parseModuleBlock);
            parseLeftHandSideExpression$1163 = wrapTracking$1795(parseLeftHandSideExpression$1163);
            parseNewExpression$1161 = wrapTracking$1795(extra$1099.parseNewExpression);
            parseNonComputedProperty$1158 = wrapTracking$1795(extra$1099.parseNonComputedProperty);
            parseObjectInitialiser$1151 = wrapTracking$1795(extra$1099.parseObjectInitialiser);
            parseObjectProperty$1150 = wrapTracking$1795(extra$1099.parseObjectProperty);
            parseObjectPropertyKey$1149 = wrapTracking$1795(extra$1099.parseObjectPropertyKey);
            parsePostfixExpression$1164 = wrapTracking$1795(extra$1099.parsePostfixExpression);
            parsePrimaryExpression$1155 = wrapTracking$1795(extra$1099.parsePrimaryExpression);
            parseProgram$1226 = wrapTracking$1795(extra$1099.parseProgram);
            parsePropertyFunction$1147 = wrapTracking$1795(extra$1099.parsePropertyFunction);
            parseTemplateElement$1152 = wrapTracking$1795(extra$1099.parseTemplateElement);
            parseTemplateLiteral$1153 = wrapTracking$1795(extra$1099.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$1157 = wrapTracking$1795(extra$1099.parseSpreadOrAssignmentExpression);
            parseStatement$1205 = wrapTracking$1795(extra$1099.parseStatement);
            parseSwitchCase$1199 = wrapTracking$1795(extra$1099.parseSwitchCase);
            parseUnaryExpression$1165 = wrapTracking$1795(extra$1099.parseUnaryExpression);
            parseVariableDeclaration$1178 = wrapTracking$1795(extra$1099.parseVariableDeclaration);
            parseVariableIdentifier$1177 = wrapTracking$1795(extra$1099.parseVariableIdentifier);
            parseMethodDefinition$1214 = wrapTracking$1795(extra$1099.parseMethodDefinition);
            parseClassDeclaration$1218 = wrapTracking$1795(extra$1099.parseClassDeclaration);
            parseClassExpression$1217 = wrapTracking$1795(extra$1099.parseClassExpression);
            parseClassBody$1216 = wrapTracking$1795(extra$1099.parseClassBody);
        }
        if (typeof extra$1099.tokens !== 'undefined') {
            extra$1099.advance = advance$1129;
            extra$1099.scanRegExp = scanRegExp$1126;
            advance$1129 = collectToken$1230;
            scanRegExp$1126 = collectRegex$1231;
        }
    }
    function unpatch$1241() {
        if (typeof extra$1099.skipComment === 'function') {
            skipComment$1113 = extra$1099.skipComment;
        }
        if (extra$1099.range || extra$1099.loc) {
            parseArrayInitialiser$1146 = extra$1099.parseArrayInitialiser;
            parseAssignmentExpression$1173 = extra$1099.parseAssignmentExpression;
            parseBinaryExpression$1167 = extra$1099.parseBinaryExpression;
            parseBlock$1176 = extra$1099.parseBlock;
            parseFunctionSourceElements$1207 = extra$1099.parseFunctionSourceElements;
            parseCatchClause$1202 = extra$1099.parseCatchClause;
            parseComputedMember$1160 = extra$1099.parseComputedMember;
            parseConditionalExpression$1168 = extra$1099.parseConditionalExpression;
            parseConstLetDeclaration$1181 = extra$1099.parseConstLetDeclaration;
            parseExportBatchSpecifier$1183 = extra$1099.parseExportBatchSpecifier;
            parseExportDeclaration$1185 = extra$1099.parseExportDeclaration;
            parseExportSpecifier$1184 = extra$1099.parseExportSpecifier;
            parseExpression$1174 = extra$1099.parseExpression;
            parseForVariableDeclaration$1193 = extra$1099.parseForVariableDeclaration;
            parseFunctionDeclaration$1211 = extra$1099.parseFunctionDeclaration;
            parseFunctionExpression$1212 = extra$1099.parseFunctionExpression;
            parseImportDeclaration$1186 = extra$1099.parseImportDeclaration;
            parseImportSpecifier$1187 = extra$1099.parseImportSpecifier;
            parseGroupExpression$1154 = extra$1099.parseGroupExpression;
            parseLeftHandSideExpression$1163 = extra$1099.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$1162 = extra$1099.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$1182 = extra$1099.parseModuleDeclaration;
            parseModuleBlock$1225 = extra$1099.parseModuleBlock;
            parseNewExpression$1161 = extra$1099.parseNewExpression;
            parseNonComputedProperty$1158 = extra$1099.parseNonComputedProperty;
            parseObjectInitialiser$1151 = extra$1099.parseObjectInitialiser;
            parseObjectProperty$1150 = extra$1099.parseObjectProperty;
            parseObjectPropertyKey$1149 = extra$1099.parseObjectPropertyKey;
            parsePostfixExpression$1164 = extra$1099.parsePostfixExpression;
            parsePrimaryExpression$1155 = extra$1099.parsePrimaryExpression;
            parseProgram$1226 = extra$1099.parseProgram;
            parsePropertyFunction$1147 = extra$1099.parsePropertyFunction;
            parseTemplateElement$1152 = extra$1099.parseTemplateElement;
            parseTemplateLiteral$1153 = extra$1099.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$1157 = extra$1099.parseSpreadOrAssignmentExpression;
            parseStatement$1205 = extra$1099.parseStatement;
            parseSwitchCase$1199 = extra$1099.parseSwitchCase;
            parseUnaryExpression$1165 = extra$1099.parseUnaryExpression;
            parseVariableDeclaration$1178 = extra$1099.parseVariableDeclaration;
            parseVariableIdentifier$1177 = extra$1099.parseVariableIdentifier;
            parseMethodDefinition$1214 = extra$1099.parseMethodDefinition;
            parseClassDeclaration$1218 = extra$1099.parseClassDeclaration;
            parseClassExpression$1217 = extra$1099.parseClassExpression;
            parseClassBody$1216 = extra$1099.parseClassBody;
        }
        if (typeof extra$1099.scanRegExp === 'function') {
            advance$1129 = extra$1099.advance;
            scanRegExp$1126 = extra$1099.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1242(object$1796, properties$1797) {
        var entry$1798, result$1799 = {};
        for (entry$1798 in object$1796) {
            if (object$1796.hasOwnProperty(entry$1798)) {
                result$1799[entry$1798] = object$1796[entry$1798];
            }
        }
        for (entry$1798 in properties$1797) {
            if (properties$1797.hasOwnProperty(entry$1798)) {
                result$1799[entry$1798] = properties$1797[entry$1798];
            }
        }
        return result$1799;
    }
    function tokenize$1243(code$1800, options$1801) {
        var toString$1802, token$1803, tokens$1804;
        toString$1802 = String;
        if (typeof code$1800 !== 'string' && !(code$1800 instanceof String)) {
            code$1800 = toString$1802(code$1800);
        }
        delegate$1093 = SyntaxTreeDelegate$1081;
        source$1083 = code$1800;
        index$1085 = 0;
        lineNumber$1086 = source$1083.length > 0 ? 1 : 0;
        lineStart$1087 = 0;
        length$1092 = source$1083.length;
        lookahead$1096 = null;
        state$1098 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$1099 = {};
        // Options matching.
        options$1801 = options$1801 || {};
        // Of course we collect tokens here.
        options$1801.tokens = true;
        extra$1099.tokens = [];
        extra$1099.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$1099.openParenToken = -1;
        extra$1099.openCurlyToken = -1;
        extra$1099.range = typeof options$1801.range === 'boolean' && options$1801.range;
        extra$1099.loc = typeof options$1801.loc === 'boolean' && options$1801.loc;
        if (typeof options$1801.comment === 'boolean' && options$1801.comment) {
            extra$1099.comments = [];
        }
        if (typeof options$1801.tolerant === 'boolean' && options$1801.tolerant) {
            extra$1099.errors = [];
        }
        if (length$1092 > 0) {
            if (typeof source$1083[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1800 instanceof String) {
                    source$1083 = code$1800.valueOf();
                }
            }
        }
        patch$1240();
        try {
            peek$1131();
            if (lookahead$1096.type === Token$1074.EOF) {
                return extra$1099.tokens;
            }
            token$1803 = lex$1130();
            while (lookahead$1096.type !== Token$1074.EOF) {
                try {
                    token$1803 = lex$1130();
                } catch (lexError$1805) {
                    token$1803 = lookahead$1096;
                    if (extra$1099.errors) {
                        extra$1099.errors.push(lexError$1805);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1805;
                    }
                }
            }
            filterTokenLocation$1232();
            tokens$1804 = extra$1099.tokens;
            if (typeof extra$1099.comments !== 'undefined') {
                filterCommentLocation$1229();
                tokens$1804.comments = extra$1099.comments;
            }
            if (typeof extra$1099.errors !== 'undefined') {
                tokens$1804.errors = extra$1099.errors;
            }
        } catch (e$1806) {
            throw e$1806;
        } finally {
            unpatch$1241();
            extra$1099 = {};
        }
        return tokens$1804;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1244(toks$1807, start$1808, inExprDelim$1809, parentIsBlock$1810) {
        var assignOps$1811 = [
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
        var binaryOps$1812 = [
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
        var unaryOps$1813 = [
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
        function back$1814(n$1815) {
            var idx$1816 = toks$1807.length - n$1815 > 0 ? toks$1807.length - n$1815 : 0;
            return toks$1807[idx$1816];
        }
        if (inExprDelim$1809 && toks$1807.length - (start$1808 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1814(start$1808 + 2).value === ':' && parentIsBlock$1810) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$1101(back$1814(start$1808 + 2).value, unaryOps$1813.concat(binaryOps$1812).concat(assignOps$1811))) {
            // ... + {...}
            return false;
        } else if (back$1814(start$1808 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1817 = typeof back$1814(start$1808 + 1).startLineNumber !== 'undefined' ? back$1814(start$1808 + 1).startLineNumber : back$1814(start$1808 + 1).lineNumber;
            if (back$1814(start$1808 + 2).lineNumber !== currLineNumber$1817) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$1101(back$1814(start$1808 + 2).value, [
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
    function readToken$1245(toks$1818, inExprDelim$1819, parentIsBlock$1820) {
        var delimiters$1821 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1822 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1823 = toks$1818.length - 1;
        var comments$1824, commentsLen$1825 = extra$1099.comments.length;
        function back$1826(n$1830) {
            var idx$1831 = toks$1818.length - n$1830 > 0 ? toks$1818.length - n$1830 : 0;
            return toks$1818[idx$1831];
        }
        function attachComments$1827(token$1832) {
            if (comments$1824) {
                token$1832.leadingComments = comments$1824;
            }
            return token$1832;
        }
        function _advance$1828() {
            return attachComments$1827(advance$1129());
        }
        function _scanRegExp$1829() {
            return attachComments$1827(scanRegExp$1126());
        }
        skipComment$1113();
        if (extra$1099.comments.length > commentsLen$1825) {
            comments$1824 = extra$1099.comments.slice(commentsLen$1825);
        }
        if (isIn$1101(source$1083[index$1085], delimiters$1821)) {
            return attachComments$1827(readDelim$1246(toks$1818, inExprDelim$1819, parentIsBlock$1820));
        }
        if (source$1083[index$1085] === '/') {
            var prev$1833 = back$1826(1);
            if (prev$1833) {
                if (prev$1833.value === '()') {
                    if (isIn$1101(back$1826(2).value, parenIdents$1822)) {
                        // ... if (...) / ...
                        return _scanRegExp$1829();
                    }
                    // ... (...) / ...
                    return _advance$1828();
                }
                if (prev$1833.value === '{}') {
                    if (blockAllowed$1244(toks$1818, 0, inExprDelim$1819, parentIsBlock$1820)) {
                        if (back$1826(2).value === '()') {
                            // named function
                            if (back$1826(4).value === 'function') {
                                if (!blockAllowed$1244(toks$1818, 3, inExprDelim$1819, parentIsBlock$1820)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1828();
                                }
                                if (toks$1818.length - 5 <= 0 && inExprDelim$1819) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1828();
                                }
                            }
                            // unnamed function
                            if (back$1826(3).value === 'function') {
                                if (!blockAllowed$1244(toks$1818, 2, inExprDelim$1819, parentIsBlock$1820)) {
                                    // new function (...) {...} / ...
                                    return _advance$1828();
                                }
                                if (toks$1818.length - 4 <= 0 && inExprDelim$1819) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1828();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1829();
                    } else {
                        // ... + {...} / ...
                        return _advance$1828();
                    }
                }
                if (prev$1833.type === Token$1074.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1829();
                }
                if (isKeyword$1112(prev$1833.value)) {
                    // typeof /...
                    return _scanRegExp$1829();
                }
                return _advance$1828();
            }
            return _scanRegExp$1829();
        }
        return _advance$1828();
    }
    function readDelim$1246(toks$1834, inExprDelim$1835, parentIsBlock$1836) {
        var startDelim$1837 = advance$1129(), matchDelim$1838 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1839 = [];
        var delimiters$1840 = [
                '(',
                '{',
                '['
            ];
        assert$1100(delimiters$1840.indexOf(startDelim$1837.value) !== -1, 'Need to begin at the delimiter');
        var token$1841 = startDelim$1837;
        var startLineNumber$1842 = token$1841.lineNumber;
        var startLineStart$1843 = token$1841.lineStart;
        var startRange$1844 = token$1841.range;
        var delimToken$1845 = {};
        delimToken$1845.type = Token$1074.Delimiter;
        delimToken$1845.value = startDelim$1837.value + matchDelim$1838[startDelim$1837.value];
        delimToken$1845.startLineNumber = startLineNumber$1842;
        delimToken$1845.startLineStart = startLineStart$1843;
        delimToken$1845.startRange = startRange$1844;
        var delimIsBlock$1846 = false;
        if (startDelim$1837.value === '{') {
            delimIsBlock$1846 = blockAllowed$1244(toks$1834.concat(delimToken$1845), 0, inExprDelim$1835, parentIsBlock$1836);
        }
        while (index$1085 <= length$1092) {
            token$1841 = readToken$1245(inner$1839, startDelim$1837.value === '(' || startDelim$1837.value === '[', delimIsBlock$1846);
            if (token$1841.type === Token$1074.Punctuator && token$1841.value === matchDelim$1838[startDelim$1837.value]) {
                if (token$1841.leadingComments) {
                    delimToken$1845.trailingComments = token$1841.leadingComments;
                }
                break;
            } else if (token$1841.type === Token$1074.EOF) {
                throwError$1134({}, Messages$1079.UnexpectedEOS);
            } else {
                inner$1839.push(token$1841);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$1085 >= length$1092 && matchDelim$1838[startDelim$1837.value] !== source$1083[length$1092 - 1]) {
            throwError$1134({}, Messages$1079.UnexpectedEOS);
        }
        var endLineNumber$1847 = token$1841.lineNumber;
        var endLineStart$1848 = token$1841.lineStart;
        var endRange$1849 = token$1841.range;
        delimToken$1845.inner = inner$1839;
        delimToken$1845.endLineNumber = endLineNumber$1847;
        delimToken$1845.endLineStart = endLineStart$1848;
        delimToken$1845.endRange = endRange$1849;
        return delimToken$1845;
    }
    // (Str) -> [...CSyntax]
    function read$1247(code$1850) {
        var token$1851, tokenTree$1852 = [];
        extra$1099 = {};
        extra$1099.comments = [];
        patch$1240();
        source$1083 = code$1850;
        index$1085 = 0;
        lineNumber$1086 = source$1083.length > 0 ? 1 : 0;
        lineStart$1087 = 0;
        length$1092 = source$1083.length;
        state$1098 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$1085 < length$1092) {
            tokenTree$1852.push(readToken$1245(tokenTree$1852, false, false));
        }
        var last$1853 = tokenTree$1852[tokenTree$1852.length - 1];
        if (last$1853 && last$1853.type !== Token$1074.EOF) {
            tokenTree$1852.push({
                type: Token$1074.EOF,
                value: '',
                lineNumber: last$1853.lineNumber,
                lineStart: last$1853.lineStart,
                range: [
                    index$1085,
                    index$1085
                ]
            });
        }
        return expander$1073.tokensToSyntax(tokenTree$1852);
    }
    function parse$1248(code$1854, options$1855) {
        var program$1856, toString$1857;
        extra$1099 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1854)) {
            tokenStream$1094 = code$1854;
            length$1092 = tokenStream$1094.length;
            lineNumber$1086 = tokenStream$1094.length > 0 ? 1 : 0;
            source$1083 = undefined;
        } else {
            toString$1857 = String;
            if (typeof code$1854 !== 'string' && !(code$1854 instanceof String)) {
                code$1854 = toString$1857(code$1854);
            }
            source$1083 = code$1854;
            length$1092 = source$1083.length;
            lineNumber$1086 = source$1083.length > 0 ? 1 : 0;
        }
        delegate$1093 = SyntaxTreeDelegate$1081;
        streamIndex$1095 = -1;
        index$1085 = 0;
        lineStart$1087 = 0;
        sm_lineStart$1089 = 0;
        sm_lineNumber$1088 = lineNumber$1086;
        sm_index$1091 = 0;
        sm_range$1090 = [
            0,
            0
        ];
        lookahead$1096 = null;
        state$1098 = {
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
        if (typeof options$1855 !== 'undefined') {
            extra$1099.range = typeof options$1855.range === 'boolean' && options$1855.range;
            extra$1099.loc = typeof options$1855.loc === 'boolean' && options$1855.loc;
            if (extra$1099.loc && options$1855.source !== null && options$1855.source !== undefined) {
                delegate$1093 = extend$1242(delegate$1093, {
                    'postProcess': function (node$1858) {
                        node$1858.loc.source = toString$1857(options$1855.source);
                        return node$1858;
                    }
                });
            }
            if (typeof options$1855.tokens === 'boolean' && options$1855.tokens) {
                extra$1099.tokens = [];
            }
            if (typeof options$1855.comment === 'boolean' && options$1855.comment) {
                extra$1099.comments = [];
            }
            if (typeof options$1855.tolerant === 'boolean' && options$1855.tolerant) {
                extra$1099.errors = [];
            }
        }
        if (length$1092 > 0) {
            if (source$1083 && typeof source$1083[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1854 instanceof String) {
                    source$1083 = code$1854.valueOf();
                }
            }
        }
        extra$1099 = { loc: true };
        patch$1240();
        try {
            program$1856 = parseProgram$1226();
            if (typeof extra$1099.comments !== 'undefined') {
                filterCommentLocation$1229();
                program$1856.comments = extra$1099.comments;
            }
            if (typeof extra$1099.tokens !== 'undefined') {
                filterTokenLocation$1232();
                program$1856.tokens = extra$1099.tokens;
            }
            if (typeof extra$1099.errors !== 'undefined') {
                program$1856.errors = extra$1099.errors;
            }
            if (extra$1099.range || extra$1099.loc) {
                program$1856.body = filterGroup$1238(program$1856.body);
            }
        } catch (e$1859) {
            throw e$1859;
        } finally {
            unpatch$1241();
            extra$1099 = {};
        }
        return program$1856;
    }
    exports$1072.tokenize = tokenize$1243;
    exports$1072.read = read$1247;
    exports$1072.Token = Token$1074;
    exports$1072.parse = parse$1248;
    // Deep copy.
    exports$1072.Syntax = function () {
        var name$1860, types$1861 = {};
        if (typeof Object.create === 'function') {
            types$1861 = Object.create(null);
        }
        for (name$1860 in Syntax$1077) {
            if (Syntax$1077.hasOwnProperty(name$1860)) {
                types$1861[name$1860] = Syntax$1077[name$1860];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1861);
        }
        return types$1861;
    }();
}));
//# sourceMappingURL=parser.js.map