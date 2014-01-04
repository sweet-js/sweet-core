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
(function (root$1075, factory$1076) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$1076);
    } else if (typeof exports !== 'undefined') {
        factory$1076(exports, require('./expander'));
    } else {
        factory$1076(root$1075.esprima = {});
    }
}(this, function (exports$1077, expander$1078) {
    'use strict';
    var Token$1079, TokenName$1080, FnExprTokens$1081, Syntax$1082, PropertyKind$1083, Messages$1084, Regex$1085, SyntaxTreeDelegate$1086, ClassPropertyType$1087, source$1088, strict$1089, index$1090, lineNumber$1091, lineStart$1092, sm_lineNumber$1093, sm_lineStart$1094, sm_range$1095, sm_index$1096, length$1097, delegate$1098, tokenStream$1099, streamIndex$1100, lookahead$1101, lookaheadIndex$1102, state$1103, extra$1104;
    Token$1079 = {
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
    TokenName$1080 = {};
    TokenName$1080[Token$1079.BooleanLiteral] = 'Boolean';
    TokenName$1080[Token$1079.EOF] = '<end>';
    TokenName$1080[Token$1079.Identifier] = 'Identifier';
    TokenName$1080[Token$1079.Keyword] = 'Keyword';
    TokenName$1080[Token$1079.NullLiteral] = 'Null';
    TokenName$1080[Token$1079.NumericLiteral] = 'Numeric';
    TokenName$1080[Token$1079.Punctuator] = 'Punctuator';
    TokenName$1080[Token$1079.StringLiteral] = 'String';
    TokenName$1080[Token$1079.RegularExpression] = 'RegularExpression';
    TokenName$1080[Token$1079.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$1081 = [
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
    Syntax$1082 = {
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
    PropertyKind$1083 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$1087 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$1084 = {
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
    Regex$1085 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$1105(condition$1254, message$1255) {
        if (!condition$1254) {
            throw new Error('ASSERT: ' + message$1255);
        }
    }
    function isIn$1106(el$1256, list$1257) {
        return list$1257.indexOf(el$1256) !== -1;
    }
    function isDecimalDigit$1107(ch$1258) {
        return ch$1258 >= 48 && ch$1258 <= 57;
    }    // 0..9
    function isHexDigit$1108(ch$1259) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1259) >= 0;
    }
    function isOctalDigit$1109(ch$1260) {
        return '01234567'.indexOf(ch$1260) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$1110(ch$1261) {
        return ch$1261 === 32 || ch$1261 === 9 || ch$1261 === 11 || ch$1261 === 12 || ch$1261 === 160 || ch$1261 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1261)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$1111(ch$1262) {
        return ch$1262 === 10 || ch$1262 === 13 || ch$1262 === 8232 || ch$1262 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$1112(ch$1263) {
        return ch$1263 === 36 || ch$1263 === 95 || ch$1263 >= 65 && ch$1263 <= 90 || ch$1263 >= 97 && ch$1263 <= 122 || ch$1263 === 92 || ch$1263 >= 128 && Regex$1085.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1263));
    }
    function isIdentifierPart$1113(ch$1264) {
        return ch$1264 === 36 || ch$1264 === 95 || ch$1264 >= 65 && ch$1264 <= 90 || ch$1264 >= 97 && ch$1264 <= 122 || ch$1264 >= 48 && ch$1264 <= 57 || ch$1264 === 92 || ch$1264 >= 128 && Regex$1085.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1264));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$1114(id$1265) {
        switch (id$1265) {
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
    function isStrictModeReservedWord$1115(id$1266) {
        switch (id$1266) {
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
    function isRestrictedWord$1116(id$1267) {
        return id$1267 === 'eval' || id$1267 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$1117(id$1268) {
        if (strict$1089 && isStrictModeReservedWord$1115(id$1268)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1268.length) {
        case 2:
            return id$1268 === 'if' || id$1268 === 'in' || id$1268 === 'do';
        case 3:
            return id$1268 === 'var' || id$1268 === 'for' || id$1268 === 'new' || id$1268 === 'try' || id$1268 === 'let';
        case 4:
            return id$1268 === 'this' || id$1268 === 'else' || id$1268 === 'case' || id$1268 === 'void' || id$1268 === 'with' || id$1268 === 'enum';
        case 5:
            return id$1268 === 'while' || id$1268 === 'break' || id$1268 === 'catch' || id$1268 === 'throw' || id$1268 === 'const' || id$1268 === 'yield' || id$1268 === 'class' || id$1268 === 'super';
        case 6:
            return id$1268 === 'return' || id$1268 === 'typeof' || id$1268 === 'delete' || id$1268 === 'switch' || id$1268 === 'export' || id$1268 === 'import';
        case 7:
            return id$1268 === 'default' || id$1268 === 'finally' || id$1268 === 'extends';
        case 8:
            return id$1268 === 'function' || id$1268 === 'continue' || id$1268 === 'debugger';
        case 10:
            return id$1268 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$1118() {
        var ch$1269, blockComment$1270, lineComment$1271;
        blockComment$1270 = false;
        lineComment$1271 = false;
        while (index$1090 < length$1097) {
            ch$1269 = source$1088.charCodeAt(index$1090);
            if (lineComment$1271) {
                ++index$1090;
                if (isLineTerminator$1111(ch$1269)) {
                    lineComment$1271 = false;
                    if (ch$1269 === 13 && source$1088.charCodeAt(index$1090) === 10) {
                        ++index$1090;
                    }
                    ++lineNumber$1091;
                    lineStart$1092 = index$1090;
                }
            } else if (blockComment$1270) {
                if (isLineTerminator$1111(ch$1269)) {
                    if (ch$1269 === 13 && source$1088.charCodeAt(index$1090 + 1) === 10) {
                        ++index$1090;
                    }
                    ++lineNumber$1091;
                    ++index$1090;
                    lineStart$1092 = index$1090;
                    if (index$1090 >= length$1097) {
                        throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1269 = source$1088.charCodeAt(index$1090++);
                    if (index$1090 >= length$1097) {
                        throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1269 === 42) {
                        ch$1269 = source$1088.charCodeAt(index$1090);
                        if (ch$1269 === 47) {
                            ++index$1090;
                            blockComment$1270 = false;
                        }
                    }
                }
            } else if (ch$1269 === 47) {
                ch$1269 = source$1088.charCodeAt(index$1090 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1269 === 47) {
                    index$1090 += 2;
                    lineComment$1271 = true;
                } else if (ch$1269 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$1090 += 2;
                    blockComment$1270 = true;
                    if (index$1090 >= length$1097) {
                        throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1110(ch$1269)) {
                ++index$1090;
            } else if (isLineTerminator$1111(ch$1269)) {
                ++index$1090;
                if (ch$1269 === 13 && source$1088.charCodeAt(index$1090) === 10) {
                    ++index$1090;
                }
                ++lineNumber$1091;
                lineStart$1092 = index$1090;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$1119(prefix$1272) {
        var i$1273, len$1274, ch$1275, code$1276 = 0;
        len$1274 = prefix$1272 === 'u' ? 4 : 2;
        for (i$1273 = 0; i$1273 < len$1274; ++i$1273) {
            if (index$1090 < length$1097 && isHexDigit$1108(source$1088[index$1090])) {
                ch$1275 = source$1088[index$1090++];
                code$1276 = code$1276 * 16 + '0123456789abcdef'.indexOf(ch$1275.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1276);
    }
    function scanUnicodeCodePointEscape$1120() {
        var ch$1277, code$1278, cu1$1279, cu2$1280;
        ch$1277 = source$1088[index$1090];
        code$1278 = 0;
        // At least, one hex digit is required.
        if (ch$1277 === '}') {
            throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
        }
        while (index$1090 < length$1097) {
            ch$1277 = source$1088[index$1090++];
            if (!isHexDigit$1108(ch$1277)) {
                break;
            }
            code$1278 = code$1278 * 16 + '0123456789abcdef'.indexOf(ch$1277.toLowerCase());
        }
        if (code$1278 > 1114111 || ch$1277 !== '}') {
            throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1278 <= 65535) {
            return String.fromCharCode(code$1278);
        }
        cu1$1279 = (code$1278 - 65536 >> 10) + 55296;
        cu2$1280 = (code$1278 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1279, cu2$1280);
    }
    function getEscapedIdentifier$1121() {
        var ch$1281, id$1282;
        ch$1281 = source$1088.charCodeAt(index$1090++);
        id$1282 = String.fromCharCode(ch$1281);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1281 === 92) {
            if (source$1088.charCodeAt(index$1090) !== 117) {
                throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
            }
            ++index$1090;
            ch$1281 = scanHexEscape$1119('u');
            if (!ch$1281 || ch$1281 === '\\' || !isIdentifierStart$1112(ch$1281.charCodeAt(0))) {
                throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
            }
            id$1282 = ch$1281;
        }
        while (index$1090 < length$1097) {
            ch$1281 = source$1088.charCodeAt(index$1090);
            if (!isIdentifierPart$1113(ch$1281)) {
                break;
            }
            ++index$1090;
            id$1282 += String.fromCharCode(ch$1281);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1281 === 92) {
                id$1282 = id$1282.substr(0, id$1282.length - 1);
                if (source$1088.charCodeAt(index$1090) !== 117) {
                    throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
                }
                ++index$1090;
                ch$1281 = scanHexEscape$1119('u');
                if (!ch$1281 || ch$1281 === '\\' || !isIdentifierPart$1113(ch$1281.charCodeAt(0))) {
                    throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
                }
                id$1282 += ch$1281;
            }
        }
        return id$1282;
    }
    function getIdentifier$1122() {
        var start$1283, ch$1284;
        start$1283 = index$1090++;
        while (index$1090 < length$1097) {
            ch$1284 = source$1088.charCodeAt(index$1090);
            if (ch$1284 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$1090 = start$1283;
                return getEscapedIdentifier$1121();
            }
            if (isIdentifierPart$1113(ch$1284)) {
                ++index$1090;
            } else {
                break;
            }
        }
        return source$1088.slice(start$1283, index$1090);
    }
    function scanIdentifier$1123() {
        var start$1285, id$1286, type$1287;
        start$1285 = index$1090;
        // Backslash (char #92) starts an escaped character.
        id$1286 = source$1088.charCodeAt(index$1090) === 92 ? getEscapedIdentifier$1121() : getIdentifier$1122();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1286.length === 1) {
            type$1287 = Token$1079.Identifier;
        } else if (isKeyword$1117(id$1286)) {
            type$1287 = Token$1079.Keyword;
        } else if (id$1286 === 'null') {
            type$1287 = Token$1079.NullLiteral;
        } else if (id$1286 === 'true' || id$1286 === 'false') {
            type$1287 = Token$1079.BooleanLiteral;
        } else {
            type$1287 = Token$1079.Identifier;
        }
        return {
            type: type$1287,
            value: id$1286,
            lineNumber: lineNumber$1091,
            lineStart: lineStart$1092,
            range: [
                start$1285,
                index$1090
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$1124() {
        var start$1288 = index$1090, code$1289 = source$1088.charCodeAt(index$1090), code2$1290, ch1$1291 = source$1088[index$1090], ch2$1292, ch3$1293, ch4$1294;
        switch (code$1289) {
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
            ++index$1090;
            if (extra$1104.tokenize) {
                if (code$1289 === 40) {
                    extra$1104.openParenToken = extra$1104.tokens.length;
                } else if (code$1289 === 123) {
                    extra$1104.openCurlyToken = extra$1104.tokens.length;
                }
            }
            return {
                type: Token$1079.Punctuator,
                value: String.fromCharCode(code$1289),
                lineNumber: lineNumber$1091,
                lineStart: lineStart$1092,
                range: [
                    start$1288,
                    index$1090
                ]
            };
        default:
            code2$1290 = source$1088.charCodeAt(index$1090 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1290 === 61) {
                switch (code$1289) {
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
                    index$1090 += 2;
                    return {
                        type: Token$1079.Punctuator,
                        value: String.fromCharCode(code$1289) + String.fromCharCode(code2$1290),
                        lineNumber: lineNumber$1091,
                        lineStart: lineStart$1092,
                        range: [
                            start$1288,
                            index$1090
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$1090 += 2;
                    // !== and ===
                    if (source$1088.charCodeAt(index$1090) === 61) {
                        ++index$1090;
                    }
                    return {
                        type: Token$1079.Punctuator,
                        value: source$1088.slice(start$1288, index$1090),
                        lineNumber: lineNumber$1091,
                        lineStart: lineStart$1092,
                        range: [
                            start$1288,
                            index$1090
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1292 = source$1088[index$1090 + 1];
        ch3$1293 = source$1088[index$1090 + 2];
        ch4$1294 = source$1088[index$1090 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1291 === '>' && ch2$1292 === '>' && ch3$1293 === '>') {
            if (ch4$1294 === '=') {
                index$1090 += 4;
                return {
                    type: Token$1079.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$1091,
                    lineStart: lineStart$1092,
                    range: [
                        start$1288,
                        index$1090
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1291 === '>' && ch2$1292 === '>' && ch3$1293 === '>') {
            index$1090 += 3;
            return {
                type: Token$1079.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$1091,
                lineStart: lineStart$1092,
                range: [
                    start$1288,
                    index$1090
                ]
            };
        }
        if (ch1$1291 === '<' && ch2$1292 === '<' && ch3$1293 === '=') {
            index$1090 += 3;
            return {
                type: Token$1079.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$1091,
                lineStart: lineStart$1092,
                range: [
                    start$1288,
                    index$1090
                ]
            };
        }
        if (ch1$1291 === '>' && ch2$1292 === '>' && ch3$1293 === '=') {
            index$1090 += 3;
            return {
                type: Token$1079.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$1091,
                lineStart: lineStart$1092,
                range: [
                    start$1288,
                    index$1090
                ]
            };
        }
        if (ch1$1291 === '.' && ch2$1292 === '.' && ch3$1293 === '.') {
            index$1090 += 3;
            return {
                type: Token$1079.Punctuator,
                value: '...',
                lineNumber: lineNumber$1091,
                lineStart: lineStart$1092,
                range: [
                    start$1288,
                    index$1090
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1291 === ch2$1292 && '+-<>&|'.indexOf(ch1$1291) >= 0) {
            index$1090 += 2;
            return {
                type: Token$1079.Punctuator,
                value: ch1$1291 + ch2$1292,
                lineNumber: lineNumber$1091,
                lineStart: lineStart$1092,
                range: [
                    start$1288,
                    index$1090
                ]
            };
        }
        if (ch1$1291 === '=' && ch2$1292 === '>') {
            index$1090 += 2;
            return {
                type: Token$1079.Punctuator,
                value: '=>',
                lineNumber: lineNumber$1091,
                lineStart: lineStart$1092,
                range: [
                    start$1288,
                    index$1090
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1291) >= 0) {
            ++index$1090;
            return {
                type: Token$1079.Punctuator,
                value: ch1$1291,
                lineNumber: lineNumber$1091,
                lineStart: lineStart$1092,
                range: [
                    start$1288,
                    index$1090
                ]
            };
        }
        if (ch1$1291 === '.') {
            ++index$1090;
            return {
                type: Token$1079.Punctuator,
                value: ch1$1291,
                lineNumber: lineNumber$1091,
                lineStart: lineStart$1092,
                range: [
                    start$1288,
                    index$1090
                ]
            };
        }
        throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$1125(start$1295) {
        var number$1296 = '';
        while (index$1090 < length$1097) {
            if (!isHexDigit$1108(source$1088[index$1090])) {
                break;
            }
            number$1296 += source$1088[index$1090++];
        }
        if (number$1296.length === 0) {
            throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$1112(source$1088.charCodeAt(index$1090))) {
            throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1079.NumericLiteral,
            value: parseInt('0x' + number$1296, 16),
            lineNumber: lineNumber$1091,
            lineStart: lineStart$1092,
            range: [
                start$1295,
                index$1090
            ]
        };
    }
    function scanOctalLiteral$1126(prefix$1297, start$1298) {
        var number$1299, octal$1300;
        if (isOctalDigit$1109(prefix$1297)) {
            octal$1300 = true;
            number$1299 = '0' + source$1088[index$1090++];
        } else {
            octal$1300 = false;
            ++index$1090;
            number$1299 = '';
        }
        while (index$1090 < length$1097) {
            if (!isOctalDigit$1109(source$1088[index$1090])) {
                break;
            }
            number$1299 += source$1088[index$1090++];
        }
        if (!octal$1300 && number$1299.length === 0) {
            // only 0o or 0O
            throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$1112(source$1088.charCodeAt(index$1090)) || isDecimalDigit$1107(source$1088.charCodeAt(index$1090))) {
            throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1079.NumericLiteral,
            value: parseInt(number$1299, 8),
            octal: octal$1300,
            lineNumber: lineNumber$1091,
            lineStart: lineStart$1092,
            range: [
                start$1298,
                index$1090
            ]
        };
    }
    function scanNumericLiteral$1127() {
        var number$1301, start$1302, ch$1303, octal$1304;
        ch$1303 = source$1088[index$1090];
        assert$1105(isDecimalDigit$1107(ch$1303.charCodeAt(0)) || ch$1303 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1302 = index$1090;
        number$1301 = '';
        if (ch$1303 !== '.') {
            number$1301 = source$1088[index$1090++];
            ch$1303 = source$1088[index$1090];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1301 === '0') {
                if (ch$1303 === 'x' || ch$1303 === 'X') {
                    ++index$1090;
                    return scanHexLiteral$1125(start$1302);
                }
                if (ch$1303 === 'b' || ch$1303 === 'B') {
                    ++index$1090;
                    number$1301 = '';
                    while (index$1090 < length$1097) {
                        ch$1303 = source$1088[index$1090];
                        if (ch$1303 !== '0' && ch$1303 !== '1') {
                            break;
                        }
                        number$1301 += source$1088[index$1090++];
                    }
                    if (number$1301.length === 0) {
                        // only 0b or 0B
                        throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$1090 < length$1097) {
                        ch$1303 = source$1088.charCodeAt(index$1090);
                        if (isIdentifierStart$1112(ch$1303) || isDecimalDigit$1107(ch$1303)) {
                            throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$1079.NumericLiteral,
                        value: parseInt(number$1301, 2),
                        lineNumber: lineNumber$1091,
                        lineStart: lineStart$1092,
                        range: [
                            start$1302,
                            index$1090
                        ]
                    };
                }
                if (ch$1303 === 'o' || ch$1303 === 'O' || isOctalDigit$1109(ch$1303)) {
                    return scanOctalLiteral$1126(ch$1303, start$1302);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1303 && isDecimalDigit$1107(ch$1303.charCodeAt(0))) {
                    throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$1107(source$1088.charCodeAt(index$1090))) {
                number$1301 += source$1088[index$1090++];
            }
            ch$1303 = source$1088[index$1090];
        }
        if (ch$1303 === '.') {
            number$1301 += source$1088[index$1090++];
            while (isDecimalDigit$1107(source$1088.charCodeAt(index$1090))) {
                number$1301 += source$1088[index$1090++];
            }
            ch$1303 = source$1088[index$1090];
        }
        if (ch$1303 === 'e' || ch$1303 === 'E') {
            number$1301 += source$1088[index$1090++];
            ch$1303 = source$1088[index$1090];
            if (ch$1303 === '+' || ch$1303 === '-') {
                number$1301 += source$1088[index$1090++];
            }
            if (isDecimalDigit$1107(source$1088.charCodeAt(index$1090))) {
                while (isDecimalDigit$1107(source$1088.charCodeAt(index$1090))) {
                    number$1301 += source$1088[index$1090++];
                }
            } else {
                throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$1112(source$1088.charCodeAt(index$1090))) {
            throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1079.NumericLiteral,
            value: parseFloat(number$1301),
            lineNumber: lineNumber$1091,
            lineStart: lineStart$1092,
            range: [
                start$1302,
                index$1090
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$1128() {
        var str$1305 = '', quote$1306, start$1307, ch$1308, code$1309, unescaped$1310, restore$1311, octal$1312 = false;
        quote$1306 = source$1088[index$1090];
        assert$1105(quote$1306 === '\'' || quote$1306 === '"', 'String literal must starts with a quote');
        start$1307 = index$1090;
        ++index$1090;
        while (index$1090 < length$1097) {
            ch$1308 = source$1088[index$1090++];
            if (ch$1308 === quote$1306) {
                quote$1306 = '';
                break;
            } else if (ch$1308 === '\\') {
                ch$1308 = source$1088[index$1090++];
                if (!ch$1308 || !isLineTerminator$1111(ch$1308.charCodeAt(0))) {
                    switch (ch$1308) {
                    case 'n':
                        str$1305 += '\n';
                        break;
                    case 'r':
                        str$1305 += '\r';
                        break;
                    case 't':
                        str$1305 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$1088[index$1090] === '{') {
                            ++index$1090;
                            str$1305 += scanUnicodeCodePointEscape$1120();
                        } else {
                            restore$1311 = index$1090;
                            unescaped$1310 = scanHexEscape$1119(ch$1308);
                            if (unescaped$1310) {
                                str$1305 += unescaped$1310;
                            } else {
                                index$1090 = restore$1311;
                                str$1305 += ch$1308;
                            }
                        }
                        break;
                    case 'b':
                        str$1305 += '\b';
                        break;
                    case 'f':
                        str$1305 += '\f';
                        break;
                    case 'v':
                        str$1305 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$1109(ch$1308)) {
                            code$1309 = '01234567'.indexOf(ch$1308);
                            // \0 is not octal escape sequence
                            if (code$1309 !== 0) {
                                octal$1312 = true;
                            }
                            if (index$1090 < length$1097 && isOctalDigit$1109(source$1088[index$1090])) {
                                octal$1312 = true;
                                code$1309 = code$1309 * 8 + '01234567'.indexOf(source$1088[index$1090++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1308) >= 0 && index$1090 < length$1097 && isOctalDigit$1109(source$1088[index$1090])) {
                                    code$1309 = code$1309 * 8 + '01234567'.indexOf(source$1088[index$1090++]);
                                }
                            }
                            str$1305 += String.fromCharCode(code$1309);
                        } else {
                            str$1305 += ch$1308;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$1091;
                    if (ch$1308 === '\r' && source$1088[index$1090] === '\n') {
                        ++index$1090;
                    }
                }
            } else if (isLineTerminator$1111(ch$1308.charCodeAt(0))) {
                break;
            } else {
                str$1305 += ch$1308;
            }
        }
        if (quote$1306 !== '') {
            throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1079.StringLiteral,
            value: str$1305,
            octal: octal$1312,
            lineNumber: lineNumber$1091,
            lineStart: lineStart$1092,
            range: [
                start$1307,
                index$1090
            ]
        };
    }
    function scanTemplate$1129() {
        var cooked$1313 = '', ch$1314, start$1315, terminated$1316, tail$1317, restore$1318, unescaped$1319, code$1320, octal$1321;
        terminated$1316 = false;
        tail$1317 = false;
        start$1315 = index$1090;
        ++index$1090;
        while (index$1090 < length$1097) {
            ch$1314 = source$1088[index$1090++];
            if (ch$1314 === '`') {
                tail$1317 = true;
                terminated$1316 = true;
                break;
            } else if (ch$1314 === '$') {
                if (source$1088[index$1090] === '{') {
                    ++index$1090;
                    terminated$1316 = true;
                    break;
                }
                cooked$1313 += ch$1314;
            } else if (ch$1314 === '\\') {
                ch$1314 = source$1088[index$1090++];
                if (!isLineTerminator$1111(ch$1314.charCodeAt(0))) {
                    switch (ch$1314) {
                    case 'n':
                        cooked$1313 += '\n';
                        break;
                    case 'r':
                        cooked$1313 += '\r';
                        break;
                    case 't':
                        cooked$1313 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$1088[index$1090] === '{') {
                            ++index$1090;
                            cooked$1313 += scanUnicodeCodePointEscape$1120();
                        } else {
                            restore$1318 = index$1090;
                            unescaped$1319 = scanHexEscape$1119(ch$1314);
                            if (unescaped$1319) {
                                cooked$1313 += unescaped$1319;
                            } else {
                                index$1090 = restore$1318;
                                cooked$1313 += ch$1314;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1313 += '\b';
                        break;
                    case 'f':
                        cooked$1313 += '\f';
                        break;
                    case 'v':
                        cooked$1313 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$1109(ch$1314)) {
                            code$1320 = '01234567'.indexOf(ch$1314);
                            // \0 is not octal escape sequence
                            if (code$1320 !== 0) {
                                octal$1321 = true;
                            }
                            if (index$1090 < length$1097 && isOctalDigit$1109(source$1088[index$1090])) {
                                octal$1321 = true;
                                code$1320 = code$1320 * 8 + '01234567'.indexOf(source$1088[index$1090++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1314) >= 0 && index$1090 < length$1097 && isOctalDigit$1109(source$1088[index$1090])) {
                                    code$1320 = code$1320 * 8 + '01234567'.indexOf(source$1088[index$1090++]);
                                }
                            }
                            cooked$1313 += String.fromCharCode(code$1320);
                        } else {
                            cooked$1313 += ch$1314;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$1091;
                    if (ch$1314 === '\r' && source$1088[index$1090] === '\n') {
                        ++index$1090;
                    }
                }
            } else if (isLineTerminator$1111(ch$1314.charCodeAt(0))) {
                ++lineNumber$1091;
                if (ch$1314 === '\r' && source$1088[index$1090] === '\n') {
                    ++index$1090;
                }
                cooked$1313 += '\n';
            } else {
                cooked$1313 += ch$1314;
            }
        }
        if (!terminated$1316) {
            throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1079.Template,
            value: {
                cooked: cooked$1313,
                raw: source$1088.slice(start$1315 + 1, index$1090 - (tail$1317 ? 1 : 2))
            },
            tail: tail$1317,
            octal: octal$1321,
            lineNumber: lineNumber$1091,
            lineStart: lineStart$1092,
            range: [
                start$1315,
                index$1090
            ]
        };
    }
    function scanTemplateElement$1130(option$1322) {
        var startsWith$1323, template$1324;
        lookahead$1101 = null;
        skipComment$1118();
        startsWith$1323 = option$1322.head ? '`' : '}';
        if (source$1088[index$1090] !== startsWith$1323) {
            throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
        }
        template$1324 = scanTemplate$1129();
        peek$1136();
        return template$1324;
    }
    function scanRegExp$1131() {
        var str$1325, ch$1326, start$1327, pattern$1328, flags$1329, value$1330, classMarker$1331 = false, restore$1332, terminated$1333 = false;
        lookahead$1101 = null;
        skipComment$1118();
        start$1327 = index$1090;
        ch$1326 = source$1088[index$1090];
        assert$1105(ch$1326 === '/', 'Regular expression literal must start with a slash');
        str$1325 = source$1088[index$1090++];
        while (index$1090 < length$1097) {
            ch$1326 = source$1088[index$1090++];
            str$1325 += ch$1326;
            if (classMarker$1331) {
                if (ch$1326 === ']') {
                    classMarker$1331 = false;
                }
            } else {
                if (ch$1326 === '\\') {
                    ch$1326 = source$1088[index$1090++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$1111(ch$1326.charCodeAt(0))) {
                        throwError$1139({}, Messages$1084.UnterminatedRegExp);
                    }
                    str$1325 += ch$1326;
                } else if (ch$1326 === '/') {
                    terminated$1333 = true;
                    break;
                } else if (ch$1326 === '[') {
                    classMarker$1331 = true;
                } else if (isLineTerminator$1111(ch$1326.charCodeAt(0))) {
                    throwError$1139({}, Messages$1084.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1333) {
            throwError$1139({}, Messages$1084.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1328 = str$1325.substr(1, str$1325.length - 2);
        flags$1329 = '';
        while (index$1090 < length$1097) {
            ch$1326 = source$1088[index$1090];
            if (!isIdentifierPart$1113(ch$1326.charCodeAt(0))) {
                break;
            }
            ++index$1090;
            if (ch$1326 === '\\' && index$1090 < length$1097) {
                ch$1326 = source$1088[index$1090];
                if (ch$1326 === 'u') {
                    ++index$1090;
                    restore$1332 = index$1090;
                    ch$1326 = scanHexEscape$1119('u');
                    if (ch$1326) {
                        flags$1329 += ch$1326;
                        for (str$1325 += '\\u'; restore$1332 < index$1090; ++restore$1332) {
                            str$1325 += source$1088[restore$1332];
                        }
                    } else {
                        index$1090 = restore$1332;
                        flags$1329 += 'u';
                        str$1325 += '\\u';
                    }
                } else {
                    str$1325 += '\\';
                }
            } else {
                flags$1329 += ch$1326;
                str$1325 += ch$1326;
            }
        }
        try {
            value$1330 = new RegExp(pattern$1328, flags$1329);
        } catch (e$1334) {
            throwError$1139({}, Messages$1084.InvalidRegExp);
        }
        // peek();
        if (extra$1104.tokenize) {
            return {
                type: Token$1079.RegularExpression,
                value: value$1330,
                lineNumber: lineNumber$1091,
                lineStart: lineStart$1092,
                range: [
                    start$1327,
                    index$1090
                ]
            };
        }
        return {
            type: Token$1079.RegularExpression,
            literal: str$1325,
            value: value$1330,
            range: [
                start$1327,
                index$1090
            ]
        };
    }
    function isIdentifierName$1132(token$1335) {
        return token$1335.type === Token$1079.Identifier || token$1335.type === Token$1079.Keyword || token$1335.type === Token$1079.BooleanLiteral || token$1335.type === Token$1079.NullLiteral;
    }
    function advanceSlash$1133() {
        var prevToken$1336, checkToken$1337;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1336 = extra$1104.tokens[extra$1104.tokens.length - 1];
        if (!prevToken$1336) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$1131();
        }
        if (prevToken$1336.type === 'Punctuator') {
            if (prevToken$1336.value === ')') {
                checkToken$1337 = extra$1104.tokens[extra$1104.openParenToken - 1];
                if (checkToken$1337 && checkToken$1337.type === 'Keyword' && (checkToken$1337.value === 'if' || checkToken$1337.value === 'while' || checkToken$1337.value === 'for' || checkToken$1337.value === 'with')) {
                    return scanRegExp$1131();
                }
                return scanPunctuator$1124();
            }
            if (prevToken$1336.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$1104.tokens[extra$1104.openCurlyToken - 3] && extra$1104.tokens[extra$1104.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1337 = extra$1104.tokens[extra$1104.openCurlyToken - 4];
                    if (!checkToken$1337) {
                        return scanPunctuator$1124();
                    }
                } else if (extra$1104.tokens[extra$1104.openCurlyToken - 4] && extra$1104.tokens[extra$1104.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1337 = extra$1104.tokens[extra$1104.openCurlyToken - 5];
                    if (!checkToken$1337) {
                        return scanRegExp$1131();
                    }
                } else {
                    return scanPunctuator$1124();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$1081.indexOf(checkToken$1337.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$1124();
                }
                // It is a declaration.
                return scanRegExp$1131();
            }
            return scanRegExp$1131();
        }
        if (prevToken$1336.type === 'Keyword') {
            return scanRegExp$1131();
        }
        return scanPunctuator$1124();
    }
    function advance$1134() {
        var ch$1338;
        skipComment$1118();
        if (index$1090 >= length$1097) {
            return {
                type: Token$1079.EOF,
                lineNumber: lineNumber$1091,
                lineStart: lineStart$1092,
                range: [
                    index$1090,
                    index$1090
                ]
            };
        }
        ch$1338 = source$1088.charCodeAt(index$1090);
        // Very common: ( and ) and ;
        if (ch$1338 === 40 || ch$1338 === 41 || ch$1338 === 58) {
            return scanPunctuator$1124();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1338 === 39 || ch$1338 === 34) {
            return scanStringLiteral$1128();
        }
        if (ch$1338 === 96) {
            return scanTemplate$1129();
        }
        if (isIdentifierStart$1112(ch$1338)) {
            return scanIdentifier$1123();
        }
        // # and @ are allowed for sweet.js
        if (ch$1338 === 35 || ch$1338 === 64) {
            ++index$1090;
            return {
                type: Token$1079.Punctuator,
                value: String.fromCharCode(ch$1338),
                lineNumber: lineNumber$1091,
                lineStart: lineStart$1092,
                range: [
                    index$1090 - 1,
                    index$1090
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1338 === 46) {
            if (isDecimalDigit$1107(source$1088.charCodeAt(index$1090 + 1))) {
                return scanNumericLiteral$1127();
            }
            return scanPunctuator$1124();
        }
        if (isDecimalDigit$1107(ch$1338)) {
            return scanNumericLiteral$1127();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$1104.tokenize && ch$1338 === 47) {
            return advanceSlash$1133();
        }
        return scanPunctuator$1124();
    }
    function lex$1135() {
        var token$1339;
        token$1339 = lookahead$1101;
        streamIndex$1100 = lookaheadIndex$1102;
        lineNumber$1091 = token$1339.lineNumber;
        lineStart$1092 = token$1339.lineStart;
        sm_lineNumber$1093 = lookahead$1101.sm_lineNumber;
        sm_lineStart$1094 = lookahead$1101.sm_lineStart;
        sm_range$1095 = lookahead$1101.sm_range;
        sm_index$1096 = lookahead$1101.sm_range[0];
        lookahead$1101 = tokenStream$1099[++streamIndex$1100].token;
        lookaheadIndex$1102 = streamIndex$1100;
        index$1090 = lookahead$1101.range[0];
        return token$1339;
    }
    function peek$1136() {
        lookaheadIndex$1102 = streamIndex$1100 + 1;
        if (lookaheadIndex$1102 >= length$1097) {
            lookahead$1101 = {
                type: Token$1079.EOF,
                lineNumber: lineNumber$1091,
                lineStart: lineStart$1092,
                range: [
                    index$1090,
                    index$1090
                ]
            };
            return;
        }
        lookahead$1101 = tokenStream$1099[lookaheadIndex$1102].token;
        index$1090 = lookahead$1101.range[0];
    }
    function lookahead2$1137() {
        var adv$1340, pos$1341, line$1342, start$1343, result$1344;
        if (streamIndex$1100 + 1 >= length$1097 || streamIndex$1100 + 2 >= length$1097) {
            return {
                type: Token$1079.EOF,
                lineNumber: lineNumber$1091,
                lineStart: lineStart$1092,
                range: [
                    index$1090,
                    index$1090
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$1101 === null) {
            lookaheadIndex$1102 = streamIndex$1100 + 1;
            lookahead$1101 = tokenStream$1099[lookaheadIndex$1102].token;
            index$1090 = lookahead$1101.range[0];
        }
        result$1344 = tokenStream$1099[lookaheadIndex$1102 + 1].token;
        return result$1344;
    }
    SyntaxTreeDelegate$1086 = {
        name: 'SyntaxTree',
        postProcess: function (node$1345) {
            return node$1345;
        },
        createArrayExpression: function (elements$1346) {
            return {
                type: Syntax$1082.ArrayExpression,
                elements: elements$1346
            };
        },
        createAssignmentExpression: function (operator$1347, left$1348, right$1349) {
            return {
                type: Syntax$1082.AssignmentExpression,
                operator: operator$1347,
                left: left$1348,
                right: right$1349
            };
        },
        createBinaryExpression: function (operator$1350, left$1351, right$1352) {
            var type$1353 = operator$1350 === '||' || operator$1350 === '&&' ? Syntax$1082.LogicalExpression : Syntax$1082.BinaryExpression;
            return {
                type: type$1353,
                operator: operator$1350,
                left: left$1351,
                right: right$1352
            };
        },
        createBlockStatement: function (body$1354) {
            return {
                type: Syntax$1082.BlockStatement,
                body: body$1354
            };
        },
        createBreakStatement: function (label$1355) {
            return {
                type: Syntax$1082.BreakStatement,
                label: label$1355
            };
        },
        createCallExpression: function (callee$1356, args$1357) {
            return {
                type: Syntax$1082.CallExpression,
                callee: callee$1356,
                'arguments': args$1357
            };
        },
        createCatchClause: function (param$1358, body$1359) {
            return {
                type: Syntax$1082.CatchClause,
                param: param$1358,
                body: body$1359
            };
        },
        createConditionalExpression: function (test$1360, consequent$1361, alternate$1362) {
            return {
                type: Syntax$1082.ConditionalExpression,
                test: test$1360,
                consequent: consequent$1361,
                alternate: alternate$1362
            };
        },
        createContinueStatement: function (label$1363) {
            return {
                type: Syntax$1082.ContinueStatement,
                label: label$1363
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$1082.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1364, test$1365) {
            return {
                type: Syntax$1082.DoWhileStatement,
                body: body$1364,
                test: test$1365
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$1082.EmptyStatement };
        },
        createExpressionStatement: function (expression$1366) {
            return {
                type: Syntax$1082.ExpressionStatement,
                expression: expression$1366
            };
        },
        createForStatement: function (init$1367, test$1368, update$1369, body$1370) {
            return {
                type: Syntax$1082.ForStatement,
                init: init$1367,
                test: test$1368,
                update: update$1369,
                body: body$1370
            };
        },
        createForInStatement: function (left$1371, right$1372, body$1373) {
            return {
                type: Syntax$1082.ForInStatement,
                left: left$1371,
                right: right$1372,
                body: body$1373,
                each: false
            };
        },
        createForOfStatement: function (left$1374, right$1375, body$1376) {
            return {
                type: Syntax$1082.ForOfStatement,
                left: left$1374,
                right: right$1375,
                body: body$1376
            };
        },
        createFunctionDeclaration: function (id$1377, params$1378, defaults$1379, body$1380, rest$1381, generator$1382, expression$1383) {
            return {
                type: Syntax$1082.FunctionDeclaration,
                id: id$1377,
                params: params$1378,
                defaults: defaults$1379,
                body: body$1380,
                rest: rest$1381,
                generator: generator$1382,
                expression: expression$1383
            };
        },
        createFunctionExpression: function (id$1384, params$1385, defaults$1386, body$1387, rest$1388, generator$1389, expression$1390) {
            return {
                type: Syntax$1082.FunctionExpression,
                id: id$1384,
                params: params$1385,
                defaults: defaults$1386,
                body: body$1387,
                rest: rest$1388,
                generator: generator$1389,
                expression: expression$1390
            };
        },
        createIdentifier: function (name$1391) {
            return {
                type: Syntax$1082.Identifier,
                name: name$1391
            };
        },
        createIfStatement: function (test$1392, consequent$1393, alternate$1394) {
            return {
                type: Syntax$1082.IfStatement,
                test: test$1392,
                consequent: consequent$1393,
                alternate: alternate$1394
            };
        },
        createLabeledStatement: function (label$1395, body$1396) {
            return {
                type: Syntax$1082.LabeledStatement,
                label: label$1395,
                body: body$1396
            };
        },
        createLiteral: function (token$1397) {
            return {
                type: Syntax$1082.Literal,
                value: token$1397.value,
                raw: String(token$1397.value)
            };
        },
        createMemberExpression: function (accessor$1398, object$1399, property$1400) {
            return {
                type: Syntax$1082.MemberExpression,
                computed: accessor$1398 === '[',
                object: object$1399,
                property: property$1400
            };
        },
        createNewExpression: function (callee$1401, args$1402) {
            return {
                type: Syntax$1082.NewExpression,
                callee: callee$1401,
                'arguments': args$1402
            };
        },
        createObjectExpression: function (properties$1403) {
            return {
                type: Syntax$1082.ObjectExpression,
                properties: properties$1403
            };
        },
        createPostfixExpression: function (operator$1404, argument$1405) {
            return {
                type: Syntax$1082.UpdateExpression,
                operator: operator$1404,
                argument: argument$1405,
                prefix: false
            };
        },
        createProgram: function (body$1406) {
            return {
                type: Syntax$1082.Program,
                body: body$1406
            };
        },
        createProperty: function (kind$1407, key$1408, value$1409, method$1410, shorthand$1411) {
            return {
                type: Syntax$1082.Property,
                key: key$1408,
                value: value$1409,
                kind: kind$1407,
                method: method$1410,
                shorthand: shorthand$1411
            };
        },
        createReturnStatement: function (argument$1412) {
            return {
                type: Syntax$1082.ReturnStatement,
                argument: argument$1412
            };
        },
        createSequenceExpression: function (expressions$1413) {
            return {
                type: Syntax$1082.SequenceExpression,
                expressions: expressions$1413
            };
        },
        createSwitchCase: function (test$1414, consequent$1415) {
            return {
                type: Syntax$1082.SwitchCase,
                test: test$1414,
                consequent: consequent$1415
            };
        },
        createSwitchStatement: function (discriminant$1416, cases$1417) {
            return {
                type: Syntax$1082.SwitchStatement,
                discriminant: discriminant$1416,
                cases: cases$1417
            };
        },
        createThisExpression: function () {
            return { type: Syntax$1082.ThisExpression };
        },
        createThrowStatement: function (argument$1418) {
            return {
                type: Syntax$1082.ThrowStatement,
                argument: argument$1418
            };
        },
        createTryStatement: function (block$1419, guardedHandlers$1420, handlers$1421, finalizer$1422) {
            return {
                type: Syntax$1082.TryStatement,
                block: block$1419,
                guardedHandlers: guardedHandlers$1420,
                handlers: handlers$1421,
                finalizer: finalizer$1422
            };
        },
        createUnaryExpression: function (operator$1423, argument$1424) {
            if (operator$1423 === '++' || operator$1423 === '--') {
                return {
                    type: Syntax$1082.UpdateExpression,
                    operator: operator$1423,
                    argument: argument$1424,
                    prefix: true
                };
            }
            return {
                type: Syntax$1082.UnaryExpression,
                operator: operator$1423,
                argument: argument$1424
            };
        },
        createVariableDeclaration: function (declarations$1425, kind$1426) {
            return {
                type: Syntax$1082.VariableDeclaration,
                declarations: declarations$1425,
                kind: kind$1426
            };
        },
        createVariableDeclarator: function (id$1427, init$1428) {
            return {
                type: Syntax$1082.VariableDeclarator,
                id: id$1427,
                init: init$1428
            };
        },
        createWhileStatement: function (test$1429, body$1430) {
            return {
                type: Syntax$1082.WhileStatement,
                test: test$1429,
                body: body$1430
            };
        },
        createWithStatement: function (object$1431, body$1432) {
            return {
                type: Syntax$1082.WithStatement,
                object: object$1431,
                body: body$1432
            };
        },
        createTemplateElement: function (value$1433, tail$1434) {
            return {
                type: Syntax$1082.TemplateElement,
                value: value$1433,
                tail: tail$1434
            };
        },
        createTemplateLiteral: function (quasis$1435, expressions$1436) {
            return {
                type: Syntax$1082.TemplateLiteral,
                quasis: quasis$1435,
                expressions: expressions$1436
            };
        },
        createSpreadElement: function (argument$1437) {
            return {
                type: Syntax$1082.SpreadElement,
                argument: argument$1437
            };
        },
        createTaggedTemplateExpression: function (tag$1438, quasi$1439) {
            return {
                type: Syntax$1082.TaggedTemplateExpression,
                tag: tag$1438,
                quasi: quasi$1439
            };
        },
        createArrowFunctionExpression: function (params$1440, defaults$1441, body$1442, rest$1443, expression$1444) {
            return {
                type: Syntax$1082.ArrowFunctionExpression,
                id: null,
                params: params$1440,
                defaults: defaults$1441,
                body: body$1442,
                rest: rest$1443,
                generator: false,
                expression: expression$1444
            };
        },
        createMethodDefinition: function (propertyType$1445, kind$1446, key$1447, value$1448) {
            return {
                type: Syntax$1082.MethodDefinition,
                key: key$1447,
                value: value$1448,
                kind: kind$1446,
                'static': propertyType$1445 === ClassPropertyType$1087.static
            };
        },
        createClassBody: function (body$1449) {
            return {
                type: Syntax$1082.ClassBody,
                body: body$1449
            };
        },
        createClassExpression: function (id$1450, superClass$1451, body$1452) {
            return {
                type: Syntax$1082.ClassExpression,
                id: id$1450,
                superClass: superClass$1451,
                body: body$1452
            };
        },
        createClassDeclaration: function (id$1453, superClass$1454, body$1455) {
            return {
                type: Syntax$1082.ClassDeclaration,
                id: id$1453,
                superClass: superClass$1454,
                body: body$1455
            };
        },
        createExportSpecifier: function (id$1456, name$1457) {
            return {
                type: Syntax$1082.ExportSpecifier,
                id: id$1456,
                name: name$1457
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$1082.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1458, specifiers$1459, source$1460) {
            return {
                type: Syntax$1082.ExportDeclaration,
                declaration: declaration$1458,
                specifiers: specifiers$1459,
                source: source$1460
            };
        },
        createImportSpecifier: function (id$1461, name$1462) {
            return {
                type: Syntax$1082.ImportSpecifier,
                id: id$1461,
                name: name$1462
            };
        },
        createImportDeclaration: function (specifiers$1463, kind$1464, source$1465) {
            return {
                type: Syntax$1082.ImportDeclaration,
                specifiers: specifiers$1463,
                kind: kind$1464,
                source: source$1465
            };
        },
        createYieldExpression: function (argument$1466, delegate$1467) {
            return {
                type: Syntax$1082.YieldExpression,
                argument: argument$1466,
                delegate: delegate$1467
            };
        },
        createModuleDeclaration: function (id$1468, source$1469, body$1470) {
            return {
                type: Syntax$1082.ModuleDeclaration,
                id: id$1468,
                source: source$1469,
                body: body$1470
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$1138() {
        return lookahead$1101.lineNumber !== lineNumber$1091;
    }
    // Throw an exception
    function throwError$1139(token$1471, messageFormat$1472) {
        var error$1473, args$1474 = Array.prototype.slice.call(arguments, 2), msg$1475 = messageFormat$1472.replace(/%(\d)/g, function (whole$1479, index$1480) {
                assert$1105(index$1480 < args$1474.length, 'Message reference must be in range');
                return args$1474[index$1480];
            });
        var startIndex$1476 = streamIndex$1100 > 3 ? streamIndex$1100 - 3 : 0;
        var toks$1477 = tokenStream$1099.slice(startIndex$1476, streamIndex$1100 + 3).map(function (stx$1481) {
                return stx$1481.token.value;
            }).join(' ');
        var tailingMsg$1478 = '\n[... ' + toks$1477 + ' ...]';
        if (typeof token$1471.lineNumber === 'number') {
            error$1473 = new Error('Line ' + token$1471.lineNumber + ': ' + msg$1475 + tailingMsg$1478);
            error$1473.index = token$1471.range[0];
            error$1473.lineNumber = token$1471.lineNumber;
            error$1473.column = token$1471.range[0] - lineStart$1092 + 1;
        } else {
            error$1473 = new Error('Line ' + lineNumber$1091 + ': ' + msg$1475 + tailingMsg$1478);
            error$1473.index = index$1090;
            error$1473.lineNumber = lineNumber$1091;
            error$1473.column = index$1090 - lineStart$1092 + 1;
        }
        error$1473.description = msg$1475;
        throw error$1473;
    }
    function throwErrorTolerant$1140() {
        try {
            throwError$1139.apply(null, arguments);
        } catch (e$1482) {
            if (extra$1104.errors) {
                extra$1104.errors.push(e$1482);
            } else {
                throw e$1482;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$1141(token$1483) {
        if (token$1483.type === Token$1079.EOF) {
            throwError$1139(token$1483, Messages$1084.UnexpectedEOS);
        }
        if (token$1483.type === Token$1079.NumericLiteral) {
            throwError$1139(token$1483, Messages$1084.UnexpectedNumber);
        }
        if (token$1483.type === Token$1079.StringLiteral) {
            throwError$1139(token$1483, Messages$1084.UnexpectedString);
        }
        if (token$1483.type === Token$1079.Identifier) {
            throwError$1139(token$1483, Messages$1084.UnexpectedIdentifier);
        }
        if (token$1483.type === Token$1079.Keyword) {
            if (isFutureReservedWord$1114(token$1483.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$1089 && isStrictModeReservedWord$1115(token$1483.value)) {
                throwErrorTolerant$1140(token$1483, Messages$1084.StrictReservedWord);
                return;
            }
            throwError$1139(token$1483, Messages$1084.UnexpectedToken, token$1483.value);
        }
        if (token$1483.type === Token$1079.Template) {
            throwError$1139(token$1483, Messages$1084.UnexpectedTemplate, token$1483.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$1139(token$1483, Messages$1084.UnexpectedToken, token$1483.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$1142(value$1484) {
        var token$1485 = lex$1135();
        if (token$1485.type !== Token$1079.Punctuator || token$1485.value !== value$1484) {
            throwUnexpected$1141(token$1485);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$1143(keyword$1486) {
        var token$1487 = lex$1135();
        if (token$1487.type !== Token$1079.Keyword || token$1487.value !== keyword$1486) {
            throwUnexpected$1141(token$1487);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$1144(value$1488) {
        return lookahead$1101.type === Token$1079.Punctuator && lookahead$1101.value === value$1488;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$1145(keyword$1489) {
        return lookahead$1101.type === Token$1079.Keyword && lookahead$1101.value === keyword$1489;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$1146(keyword$1490) {
        return lookahead$1101.type === Token$1079.Identifier && lookahead$1101.value === keyword$1490;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$1147() {
        var op$1491;
        if (lookahead$1101.type !== Token$1079.Punctuator) {
            return false;
        }
        op$1491 = lookahead$1101.value;
        return op$1491 === '=' || op$1491 === '*=' || op$1491 === '/=' || op$1491 === '%=' || op$1491 === '+=' || op$1491 === '-=' || op$1491 === '<<=' || op$1491 === '>>=' || op$1491 === '>>>=' || op$1491 === '&=' || op$1491 === '^=' || op$1491 === '|=';
    }
    function consumeSemicolon$1148() {
        var line$1492, ch$1493;
        ch$1493 = lookahead$1101.value ? String(lookahead$1101.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1493 === 59) {
            lex$1135();
            return;
        }
        if (lookahead$1101.lineNumber !== lineNumber$1091) {
            return;
        }
        if (match$1144(';')) {
            lex$1135();
            return;
        }
        if (lookahead$1101.type !== Token$1079.EOF && !match$1144('}')) {
            throwUnexpected$1141(lookahead$1101);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$1149(expr$1494) {
        return expr$1494.type === Syntax$1082.Identifier || expr$1494.type === Syntax$1082.MemberExpression;
    }
    function isAssignableLeftHandSide$1150(expr$1495) {
        return isLeftHandSide$1149(expr$1495) || expr$1495.type === Syntax$1082.ObjectPattern || expr$1495.type === Syntax$1082.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$1151() {
        var elements$1496 = [], blocks$1497 = [], filter$1498 = null, tmp$1499, possiblecomprehension$1500 = true, body$1501;
        expect$1142('[');
        while (!match$1144(']')) {
            if (lookahead$1101.value === 'for' && lookahead$1101.type === Token$1079.Keyword) {
                if (!possiblecomprehension$1500) {
                    throwError$1139({}, Messages$1084.ComprehensionError);
                }
                matchKeyword$1145('for');
                tmp$1499 = parseForStatement$1199({ ignoreBody: true });
                tmp$1499.of = tmp$1499.type === Syntax$1082.ForOfStatement;
                tmp$1499.type = Syntax$1082.ComprehensionBlock;
                if (tmp$1499.left.kind) {
                    // can't be let or const
                    throwError$1139({}, Messages$1084.ComprehensionError);
                }
                blocks$1497.push(tmp$1499);
            } else if (lookahead$1101.value === 'if' && lookahead$1101.type === Token$1079.Keyword) {
                if (!possiblecomprehension$1500) {
                    throwError$1139({}, Messages$1084.ComprehensionError);
                }
                expectKeyword$1143('if');
                expect$1142('(');
                filter$1498 = parseExpression$1179();
                expect$1142(')');
            } else if (lookahead$1101.value === ',' && lookahead$1101.type === Token$1079.Punctuator) {
                possiblecomprehension$1500 = false;
                // no longer allowed.
                lex$1135();
                elements$1496.push(null);
            } else {
                tmp$1499 = parseSpreadOrAssignmentExpression$1162();
                elements$1496.push(tmp$1499);
                if (tmp$1499 && tmp$1499.type === Syntax$1082.SpreadElement) {
                    if (!match$1144(']')) {
                        throwError$1139({}, Messages$1084.ElementAfterSpreadElement);
                    }
                } else if (!(match$1144(']') || matchKeyword$1145('for') || matchKeyword$1145('if'))) {
                    expect$1142(',');
                    // this lexes.
                    possiblecomprehension$1500 = false;
                }
            }
        }
        expect$1142(']');
        if (filter$1498 && !blocks$1497.length) {
            throwError$1139({}, Messages$1084.ComprehensionRequiresBlock);
        }
        if (blocks$1497.length) {
            if (elements$1496.length !== 1) {
                throwError$1139({}, Messages$1084.ComprehensionError);
            }
            return {
                type: Syntax$1082.ComprehensionExpression,
                filter: filter$1498,
                blocks: blocks$1497,
                body: elements$1496[0]
            };
        }
        return delegate$1098.createArrayExpression(elements$1496);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$1152(options$1502) {
        var previousStrict$1503, previousYieldAllowed$1504, params$1505, defaults$1506, body$1507;
        previousStrict$1503 = strict$1089;
        previousYieldAllowed$1504 = state$1103.yieldAllowed;
        state$1103.yieldAllowed = options$1502.generator;
        params$1505 = options$1502.params || [];
        defaults$1506 = options$1502.defaults || [];
        body$1507 = parseConciseBody$1211();
        if (options$1502.name && strict$1089 && isRestrictedWord$1116(params$1505[0].name)) {
            throwErrorTolerant$1140(options$1502.name, Messages$1084.StrictParamName);
        }
        if (state$1103.yieldAllowed && !state$1103.yieldFound) {
            throwErrorTolerant$1140({}, Messages$1084.NoYieldInGenerator);
        }
        strict$1089 = previousStrict$1503;
        state$1103.yieldAllowed = previousYieldAllowed$1504;
        return delegate$1098.createFunctionExpression(null, params$1505, defaults$1506, body$1507, options$1502.rest || null, options$1502.generator, body$1507.type !== Syntax$1082.BlockStatement);
    }
    function parsePropertyMethodFunction$1153(options$1508) {
        var previousStrict$1509, tmp$1510, method$1511;
        previousStrict$1509 = strict$1089;
        strict$1089 = true;
        tmp$1510 = parseParams$1215();
        if (tmp$1510.stricted) {
            throwErrorTolerant$1140(tmp$1510.stricted, tmp$1510.message);
        }
        method$1511 = parsePropertyFunction$1152({
            params: tmp$1510.params,
            defaults: tmp$1510.defaults,
            rest: tmp$1510.rest,
            generator: options$1508.generator
        });
        strict$1089 = previousStrict$1509;
        return method$1511;
    }
    function parseObjectPropertyKey$1154() {
        var token$1512 = lex$1135();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1512.type === Token$1079.StringLiteral || token$1512.type === Token$1079.NumericLiteral) {
            if (strict$1089 && token$1512.octal) {
                throwErrorTolerant$1140(token$1512, Messages$1084.StrictOctalLiteral);
            }
            return delegate$1098.createLiteral(token$1512);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$1098.createIdentifier(token$1512.value);
    }
    function parseObjectProperty$1155() {
        var token$1513, key$1514, id$1515, value$1516, param$1517;
        token$1513 = lookahead$1101;
        if (token$1513.type === Token$1079.Identifier) {
            id$1515 = parseObjectPropertyKey$1154();
            // Property Assignment: Getter and Setter.
            if (token$1513.value === 'get' && !(match$1144(':') || match$1144('('))) {
                key$1514 = parseObjectPropertyKey$1154();
                expect$1142('(');
                expect$1142(')');
                return delegate$1098.createProperty('get', key$1514, parsePropertyFunction$1152({ generator: false }), false, false);
            }
            if (token$1513.value === 'set' && !(match$1144(':') || match$1144('('))) {
                key$1514 = parseObjectPropertyKey$1154();
                expect$1142('(');
                token$1513 = lookahead$1101;
                param$1517 = [parseVariableIdentifier$1182()];
                expect$1142(')');
                return delegate$1098.createProperty('set', key$1514, parsePropertyFunction$1152({
                    params: param$1517,
                    generator: false,
                    name: token$1513
                }), false, false);
            }
            if (match$1144(':')) {
                lex$1135();
                return delegate$1098.createProperty('init', id$1515, parseAssignmentExpression$1178(), false, false);
            }
            if (match$1144('(')) {
                return delegate$1098.createProperty('init', id$1515, parsePropertyMethodFunction$1153({ generator: false }), true, false);
            }
            return delegate$1098.createProperty('init', id$1515, id$1515, false, true);
        }
        if (token$1513.type === Token$1079.EOF || token$1513.type === Token$1079.Punctuator) {
            if (!match$1144('*')) {
                throwUnexpected$1141(token$1513);
            }
            lex$1135();
            id$1515 = parseObjectPropertyKey$1154();
            if (!match$1144('(')) {
                throwUnexpected$1141(lex$1135());
            }
            return delegate$1098.createProperty('init', id$1515, parsePropertyMethodFunction$1153({ generator: true }), true, false);
        }
        key$1514 = parseObjectPropertyKey$1154();
        if (match$1144(':')) {
            lex$1135();
            return delegate$1098.createProperty('init', key$1514, parseAssignmentExpression$1178(), false, false);
        }
        if (match$1144('(')) {
            return delegate$1098.createProperty('init', key$1514, parsePropertyMethodFunction$1153({ generator: false }), true, false);
        }
        throwUnexpected$1141(lex$1135());
    }
    function parseObjectInitialiser$1156() {
        var properties$1518 = [], property$1519, name$1520, key$1521, kind$1522, map$1523 = {}, toString$1524 = String;
        expect$1142('{');
        while (!match$1144('}')) {
            property$1519 = parseObjectProperty$1155();
            if (property$1519.key.type === Syntax$1082.Identifier) {
                name$1520 = property$1519.key.name;
            } else {
                name$1520 = toString$1524(property$1519.key.value);
            }
            kind$1522 = property$1519.kind === 'init' ? PropertyKind$1083.Data : property$1519.kind === 'get' ? PropertyKind$1083.Get : PropertyKind$1083.Set;
            key$1521 = '$' + name$1520;
            if (Object.prototype.hasOwnProperty.call(map$1523, key$1521)) {
                if (map$1523[key$1521] === PropertyKind$1083.Data) {
                    if (strict$1089 && kind$1522 === PropertyKind$1083.Data) {
                        throwErrorTolerant$1140({}, Messages$1084.StrictDuplicateProperty);
                    } else if (kind$1522 !== PropertyKind$1083.Data) {
                        throwErrorTolerant$1140({}, Messages$1084.AccessorDataProperty);
                    }
                } else {
                    if (kind$1522 === PropertyKind$1083.Data) {
                        throwErrorTolerant$1140({}, Messages$1084.AccessorDataProperty);
                    } else if (map$1523[key$1521] & kind$1522) {
                        throwErrorTolerant$1140({}, Messages$1084.AccessorGetSet);
                    }
                }
                map$1523[key$1521] |= kind$1522;
            } else {
                map$1523[key$1521] = kind$1522;
            }
            properties$1518.push(property$1519);
            if (!match$1144('}')) {
                expect$1142(',');
            }
        }
        expect$1142('}');
        return delegate$1098.createObjectExpression(properties$1518);
    }
    function parseTemplateElement$1157(option$1525) {
        var token$1526 = scanTemplateElement$1130(option$1525);
        if (strict$1089 && token$1526.octal) {
            throwError$1139(token$1526, Messages$1084.StrictOctalLiteral);
        }
        return delegate$1098.createTemplateElement({
            raw: token$1526.value.raw,
            cooked: token$1526.value.cooked
        }, token$1526.tail);
    }
    function parseTemplateLiteral$1158() {
        var quasi$1527, quasis$1528, expressions$1529;
        quasi$1527 = parseTemplateElement$1157({ head: true });
        quasis$1528 = [quasi$1527];
        expressions$1529 = [];
        while (!quasi$1527.tail) {
            expressions$1529.push(parseExpression$1179());
            quasi$1527 = parseTemplateElement$1157({ head: false });
            quasis$1528.push(quasi$1527);
        }
        return delegate$1098.createTemplateLiteral(quasis$1528, expressions$1529);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$1159() {
        var expr$1530;
        expect$1142('(');
        ++state$1103.parenthesizedCount;
        expr$1530 = parseExpression$1179();
        expect$1142(')');
        return expr$1530;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$1160() {
        var type$1531, token$1532, resolvedIdent$1533;
        token$1532 = lookahead$1101;
        type$1531 = lookahead$1101.type;
        if (type$1531 === Token$1079.Identifier) {
            resolvedIdent$1533 = expander$1078.resolve(tokenStream$1099[lookaheadIndex$1102]);
            lex$1135();
            return delegate$1098.createIdentifier(resolvedIdent$1533);
        }
        if (type$1531 === Token$1079.StringLiteral || type$1531 === Token$1079.NumericLiteral) {
            if (strict$1089 && lookahead$1101.octal) {
                throwErrorTolerant$1140(lookahead$1101, Messages$1084.StrictOctalLiteral);
            }
            return delegate$1098.createLiteral(lex$1135());
        }
        if (type$1531 === Token$1079.Keyword) {
            if (matchKeyword$1145('this')) {
                lex$1135();
                return delegate$1098.createThisExpression();
            }
            if (matchKeyword$1145('function')) {
                return parseFunctionExpression$1217();
            }
            if (matchKeyword$1145('class')) {
                return parseClassExpression$1222();
            }
            if (matchKeyword$1145('super')) {
                lex$1135();
                return delegate$1098.createIdentifier('super');
            }
        }
        if (type$1531 === Token$1079.BooleanLiteral) {
            token$1532 = lex$1135();
            token$1532.value = token$1532.value === 'true';
            return delegate$1098.createLiteral(token$1532);
        }
        if (type$1531 === Token$1079.NullLiteral) {
            token$1532 = lex$1135();
            token$1532.value = null;
            return delegate$1098.createLiteral(token$1532);
        }
        if (match$1144('[')) {
            return parseArrayInitialiser$1151();
        }
        if (match$1144('{')) {
            return parseObjectInitialiser$1156();
        }
        if (match$1144('(')) {
            return parseGroupExpression$1159();
        }
        if (lookahead$1101.type === Token$1079.RegularExpression) {
            return delegate$1098.createLiteral(lex$1135());
        }
        if (type$1531 === Token$1079.Template) {
            return parseTemplateLiteral$1158();
        }
        return throwUnexpected$1141(lex$1135());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$1161() {
        var args$1534 = [], arg$1535;
        expect$1142('(');
        if (!match$1144(')')) {
            while (streamIndex$1100 < length$1097) {
                arg$1535 = parseSpreadOrAssignmentExpression$1162();
                args$1534.push(arg$1535);
                if (match$1144(')')) {
                    break;
                } else if (arg$1535.type === Syntax$1082.SpreadElement) {
                    throwError$1139({}, Messages$1084.ElementAfterSpreadElement);
                }
                expect$1142(',');
            }
        }
        expect$1142(')');
        return args$1534;
    }
    function parseSpreadOrAssignmentExpression$1162() {
        if (match$1144('...')) {
            lex$1135();
            return delegate$1098.createSpreadElement(parseAssignmentExpression$1178());
        }
        return parseAssignmentExpression$1178();
    }
    function parseNonComputedProperty$1163() {
        var token$1536 = lex$1135();
        if (!isIdentifierName$1132(token$1536)) {
            throwUnexpected$1141(token$1536);
        }
        return delegate$1098.createIdentifier(token$1536.value);
    }
    function parseNonComputedMember$1164() {
        expect$1142('.');
        return parseNonComputedProperty$1163();
    }
    function parseComputedMember$1165() {
        var expr$1537;
        expect$1142('[');
        expr$1537 = parseExpression$1179();
        expect$1142(']');
        return expr$1537;
    }
    function parseNewExpression$1166() {
        var callee$1538, args$1539;
        expectKeyword$1143('new');
        callee$1538 = parseLeftHandSideExpression$1168();
        args$1539 = match$1144('(') ? parseArguments$1161() : [];
        return delegate$1098.createNewExpression(callee$1538, args$1539);
    }
    function parseLeftHandSideExpressionAllowCall$1167() {
        var expr$1540, args$1541, property$1542;
        expr$1540 = matchKeyword$1145('new') ? parseNewExpression$1166() : parsePrimaryExpression$1160();
        while (match$1144('.') || match$1144('[') || match$1144('(') || lookahead$1101.type === Token$1079.Template) {
            if (match$1144('(')) {
                args$1541 = parseArguments$1161();
                expr$1540 = delegate$1098.createCallExpression(expr$1540, args$1541);
            } else if (match$1144('[')) {
                expr$1540 = delegate$1098.createMemberExpression('[', expr$1540, parseComputedMember$1165());
            } else if (match$1144('.')) {
                expr$1540 = delegate$1098.createMemberExpression('.', expr$1540, parseNonComputedMember$1164());
            } else {
                expr$1540 = delegate$1098.createTaggedTemplateExpression(expr$1540, parseTemplateLiteral$1158());
            }
        }
        return expr$1540;
    }
    function parseLeftHandSideExpression$1168() {
        var expr$1543, property$1544;
        expr$1543 = matchKeyword$1145('new') ? parseNewExpression$1166() : parsePrimaryExpression$1160();
        while (match$1144('.') || match$1144('[') || lookahead$1101.type === Token$1079.Template) {
            if (match$1144('[')) {
                expr$1543 = delegate$1098.createMemberExpression('[', expr$1543, parseComputedMember$1165());
            } else if (match$1144('.')) {
                expr$1543 = delegate$1098.createMemberExpression('.', expr$1543, parseNonComputedMember$1164());
            } else {
                expr$1543 = delegate$1098.createTaggedTemplateExpression(expr$1543, parseTemplateLiteral$1158());
            }
        }
        return expr$1543;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$1169() {
        var expr$1545 = parseLeftHandSideExpressionAllowCall$1167(), token$1546 = lookahead$1101;
        if (lookahead$1101.type !== Token$1079.Punctuator) {
            return expr$1545;
        }
        if ((match$1144('++') || match$1144('--')) && !peekLineTerminator$1138()) {
            // 11.3.1, 11.3.2
            if (strict$1089 && expr$1545.type === Syntax$1082.Identifier && isRestrictedWord$1116(expr$1545.name)) {
                throwErrorTolerant$1140({}, Messages$1084.StrictLHSPostfix);
            }
            if (!isLeftHandSide$1149(expr$1545)) {
                throwError$1139({}, Messages$1084.InvalidLHSInAssignment);
            }
            token$1546 = lex$1135();
            expr$1545 = delegate$1098.createPostfixExpression(token$1546.value, expr$1545);
        }
        return expr$1545;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$1170() {
        var token$1547, expr$1548;
        if (lookahead$1101.type !== Token$1079.Punctuator && lookahead$1101.type !== Token$1079.Keyword) {
            return parsePostfixExpression$1169();
        }
        if (match$1144('++') || match$1144('--')) {
            token$1547 = lex$1135();
            expr$1548 = parseUnaryExpression$1170();
            // 11.4.4, 11.4.5
            if (strict$1089 && expr$1548.type === Syntax$1082.Identifier && isRestrictedWord$1116(expr$1548.name)) {
                throwErrorTolerant$1140({}, Messages$1084.StrictLHSPrefix);
            }
            if (!isLeftHandSide$1149(expr$1548)) {
                throwError$1139({}, Messages$1084.InvalidLHSInAssignment);
            }
            return delegate$1098.createUnaryExpression(token$1547.value, expr$1548);
        }
        if (match$1144('+') || match$1144('-') || match$1144('~') || match$1144('!')) {
            token$1547 = lex$1135();
            expr$1548 = parseUnaryExpression$1170();
            return delegate$1098.createUnaryExpression(token$1547.value, expr$1548);
        }
        if (matchKeyword$1145('delete') || matchKeyword$1145('void') || matchKeyword$1145('typeof')) {
            token$1547 = lex$1135();
            expr$1548 = parseUnaryExpression$1170();
            expr$1548 = delegate$1098.createUnaryExpression(token$1547.value, expr$1548);
            if (strict$1089 && expr$1548.operator === 'delete' && expr$1548.argument.type === Syntax$1082.Identifier) {
                throwErrorTolerant$1140({}, Messages$1084.StrictDelete);
            }
            return expr$1548;
        }
        return parsePostfixExpression$1169();
    }
    function binaryPrecedence$1171(token$1549, allowIn$1550) {
        var prec$1551 = 0;
        if (token$1549.type !== Token$1079.Punctuator && token$1549.type !== Token$1079.Keyword) {
            return 0;
        }
        switch (token$1549.value) {
        case '||':
            prec$1551 = 1;
            break;
        case '&&':
            prec$1551 = 2;
            break;
        case '|':
            prec$1551 = 3;
            break;
        case '^':
            prec$1551 = 4;
            break;
        case '&':
            prec$1551 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1551 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1551 = 7;
            break;
        case 'in':
            prec$1551 = allowIn$1550 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1551 = 8;
            break;
        case '+':
        case '-':
            prec$1551 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1551 = 11;
            break;
        default:
            break;
        }
        return prec$1551;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$1172() {
        var expr$1552, token$1553, prec$1554, previousAllowIn$1555, stack$1556, right$1557, operator$1558, left$1559, i$1560;
        previousAllowIn$1555 = state$1103.allowIn;
        state$1103.allowIn = true;
        expr$1552 = parseUnaryExpression$1170();
        token$1553 = lookahead$1101;
        prec$1554 = binaryPrecedence$1171(token$1553, previousAllowIn$1555);
        if (prec$1554 === 0) {
            return expr$1552;
        }
        token$1553.prec = prec$1554;
        lex$1135();
        stack$1556 = [
            expr$1552,
            token$1553,
            parseUnaryExpression$1170()
        ];
        while ((prec$1554 = binaryPrecedence$1171(lookahead$1101, previousAllowIn$1555)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1556.length > 2 && prec$1554 <= stack$1556[stack$1556.length - 2].prec) {
                right$1557 = stack$1556.pop();
                operator$1558 = stack$1556.pop().value;
                left$1559 = stack$1556.pop();
                stack$1556.push(delegate$1098.createBinaryExpression(operator$1558, left$1559, right$1557));
            }
            // Shift.
            token$1553 = lex$1135();
            token$1553.prec = prec$1554;
            stack$1556.push(token$1553);
            stack$1556.push(parseUnaryExpression$1170());
        }
        state$1103.allowIn = previousAllowIn$1555;
        // Final reduce to clean-up the stack.
        i$1560 = stack$1556.length - 1;
        expr$1552 = stack$1556[i$1560];
        while (i$1560 > 1) {
            expr$1552 = delegate$1098.createBinaryExpression(stack$1556[i$1560 - 1].value, stack$1556[i$1560 - 2], expr$1552);
            i$1560 -= 2;
        }
        return expr$1552;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$1173() {
        var expr$1561, previousAllowIn$1562, consequent$1563, alternate$1564;
        expr$1561 = parseBinaryExpression$1172();
        if (match$1144('?')) {
            lex$1135();
            previousAllowIn$1562 = state$1103.allowIn;
            state$1103.allowIn = true;
            consequent$1563 = parseAssignmentExpression$1178();
            state$1103.allowIn = previousAllowIn$1562;
            expect$1142(':');
            alternate$1564 = parseAssignmentExpression$1178();
            expr$1561 = delegate$1098.createConditionalExpression(expr$1561, consequent$1563, alternate$1564);
        }
        return expr$1561;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$1174(expr$1565) {
        var i$1566, len$1567, property$1568, element$1569;
        if (expr$1565.type === Syntax$1082.ObjectExpression) {
            expr$1565.type = Syntax$1082.ObjectPattern;
            for (i$1566 = 0, len$1567 = expr$1565.properties.length; i$1566 < len$1567; i$1566 += 1) {
                property$1568 = expr$1565.properties[i$1566];
                if (property$1568.kind !== 'init') {
                    throwError$1139({}, Messages$1084.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$1174(property$1568.value);
            }
        } else if (expr$1565.type === Syntax$1082.ArrayExpression) {
            expr$1565.type = Syntax$1082.ArrayPattern;
            for (i$1566 = 0, len$1567 = expr$1565.elements.length; i$1566 < len$1567; i$1566 += 1) {
                element$1569 = expr$1565.elements[i$1566];
                if (element$1569) {
                    reinterpretAsAssignmentBindingPattern$1174(element$1569);
                }
            }
        } else if (expr$1565.type === Syntax$1082.Identifier) {
            if (isRestrictedWord$1116(expr$1565.name)) {
                throwError$1139({}, Messages$1084.InvalidLHSInAssignment);
            }
        } else if (expr$1565.type === Syntax$1082.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$1174(expr$1565.argument);
            if (expr$1565.argument.type === Syntax$1082.ObjectPattern) {
                throwError$1139({}, Messages$1084.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1565.type !== Syntax$1082.MemberExpression && expr$1565.type !== Syntax$1082.CallExpression && expr$1565.type !== Syntax$1082.NewExpression) {
                throwError$1139({}, Messages$1084.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$1175(options$1570, expr$1571) {
        var i$1572, len$1573, property$1574, element$1575;
        if (expr$1571.type === Syntax$1082.ObjectExpression) {
            expr$1571.type = Syntax$1082.ObjectPattern;
            for (i$1572 = 0, len$1573 = expr$1571.properties.length; i$1572 < len$1573; i$1572 += 1) {
                property$1574 = expr$1571.properties[i$1572];
                if (property$1574.kind !== 'init') {
                    throwError$1139({}, Messages$1084.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$1175(options$1570, property$1574.value);
            }
        } else if (expr$1571.type === Syntax$1082.ArrayExpression) {
            expr$1571.type = Syntax$1082.ArrayPattern;
            for (i$1572 = 0, len$1573 = expr$1571.elements.length; i$1572 < len$1573; i$1572 += 1) {
                element$1575 = expr$1571.elements[i$1572];
                if (element$1575) {
                    reinterpretAsDestructuredParameter$1175(options$1570, element$1575);
                }
            }
        } else if (expr$1571.type === Syntax$1082.Identifier) {
            validateParam$1213(options$1570, expr$1571, expr$1571.name);
        } else {
            if (expr$1571.type !== Syntax$1082.MemberExpression) {
                throwError$1139({}, Messages$1084.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$1176(expressions$1576) {
        var i$1577, len$1578, param$1579, params$1580, defaults$1581, defaultCount$1582, options$1583, rest$1584;
        params$1580 = [];
        defaults$1581 = [];
        defaultCount$1582 = 0;
        rest$1584 = null;
        options$1583 = { paramSet: {} };
        for (i$1577 = 0, len$1578 = expressions$1576.length; i$1577 < len$1578; i$1577 += 1) {
            param$1579 = expressions$1576[i$1577];
            if (param$1579.type === Syntax$1082.Identifier) {
                params$1580.push(param$1579);
                defaults$1581.push(null);
                validateParam$1213(options$1583, param$1579, param$1579.name);
            } else if (param$1579.type === Syntax$1082.ObjectExpression || param$1579.type === Syntax$1082.ArrayExpression) {
                reinterpretAsDestructuredParameter$1175(options$1583, param$1579);
                params$1580.push(param$1579);
                defaults$1581.push(null);
            } else if (param$1579.type === Syntax$1082.SpreadElement) {
                assert$1105(i$1577 === len$1578 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$1175(options$1583, param$1579.argument);
                rest$1584 = param$1579.argument;
            } else if (param$1579.type === Syntax$1082.AssignmentExpression) {
                params$1580.push(param$1579.left);
                defaults$1581.push(param$1579.right);
                ++defaultCount$1582;
                validateParam$1213(options$1583, param$1579.left, param$1579.left.name);
            } else {
                return null;
            }
        }
        if (options$1583.message === Messages$1084.StrictParamDupe) {
            throwError$1139(strict$1089 ? options$1583.stricted : options$1583.firstRestricted, options$1583.message);
        }
        if (defaultCount$1582 === 0) {
            defaults$1581 = [];
        }
        return {
            params: params$1580,
            defaults: defaults$1581,
            rest: rest$1584,
            stricted: options$1583.stricted,
            firstRestricted: options$1583.firstRestricted,
            message: options$1583.message
        };
    }
    function parseArrowFunctionExpression$1177(options$1585) {
        var previousStrict$1586, previousYieldAllowed$1587, body$1588;
        expect$1142('=>');
        previousStrict$1586 = strict$1089;
        previousYieldAllowed$1587 = state$1103.yieldAllowed;
        state$1103.yieldAllowed = false;
        body$1588 = parseConciseBody$1211();
        if (strict$1089 && options$1585.firstRestricted) {
            throwError$1139(options$1585.firstRestricted, options$1585.message);
        }
        if (strict$1089 && options$1585.stricted) {
            throwErrorTolerant$1140(options$1585.stricted, options$1585.message);
        }
        strict$1089 = previousStrict$1586;
        state$1103.yieldAllowed = previousYieldAllowed$1587;
        return delegate$1098.createArrowFunctionExpression(options$1585.params, options$1585.defaults, body$1588, options$1585.rest, body$1588.type !== Syntax$1082.BlockStatement);
    }
    function parseAssignmentExpression$1178() {
        var expr$1589, token$1590, params$1591, oldParenthesizedCount$1592;
        if (matchKeyword$1145('yield')) {
            return parseYieldExpression$1218();
        }
        oldParenthesizedCount$1592 = state$1103.parenthesizedCount;
        if (match$1144('(')) {
            token$1590 = lookahead2$1137();
            if (token$1590.type === Token$1079.Punctuator && token$1590.value === ')' || token$1590.value === '...') {
                params$1591 = parseParams$1215();
                if (!match$1144('=>')) {
                    throwUnexpected$1141(lex$1135());
                }
                return parseArrowFunctionExpression$1177(params$1591);
            }
        }
        token$1590 = lookahead$1101;
        expr$1589 = parseConditionalExpression$1173();
        if (match$1144('=>') && (state$1103.parenthesizedCount === oldParenthesizedCount$1592 || state$1103.parenthesizedCount === oldParenthesizedCount$1592 + 1)) {
            if (expr$1589.type === Syntax$1082.Identifier) {
                params$1591 = reinterpretAsCoverFormalsList$1176([expr$1589]);
            } else if (expr$1589.type === Syntax$1082.SequenceExpression) {
                params$1591 = reinterpretAsCoverFormalsList$1176(expr$1589.expressions);
            }
            if (params$1591) {
                return parseArrowFunctionExpression$1177(params$1591);
            }
        }
        if (matchAssign$1147()) {
            // 11.13.1
            if (strict$1089 && expr$1589.type === Syntax$1082.Identifier && isRestrictedWord$1116(expr$1589.name)) {
                throwErrorTolerant$1140(token$1590, Messages$1084.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$1144('=') && (expr$1589.type === Syntax$1082.ObjectExpression || expr$1589.type === Syntax$1082.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$1174(expr$1589);
            } else if (!isLeftHandSide$1149(expr$1589)) {
                throwError$1139({}, Messages$1084.InvalidLHSInAssignment);
            }
            expr$1589 = delegate$1098.createAssignmentExpression(lex$1135().value, expr$1589, parseAssignmentExpression$1178());
        }
        return expr$1589;
    }
    // 11.14 Comma Operator
    function parseExpression$1179() {
        var expr$1593, expressions$1594, sequence$1595, coverFormalsList$1596, spreadFound$1597, oldParenthesizedCount$1598;
        oldParenthesizedCount$1598 = state$1103.parenthesizedCount;
        expr$1593 = parseAssignmentExpression$1178();
        expressions$1594 = [expr$1593];
        if (match$1144(',')) {
            while (streamIndex$1100 < length$1097) {
                if (!match$1144(',')) {
                    break;
                }
                lex$1135();
                expr$1593 = parseSpreadOrAssignmentExpression$1162();
                expressions$1594.push(expr$1593);
                if (expr$1593.type === Syntax$1082.SpreadElement) {
                    spreadFound$1597 = true;
                    if (!match$1144(')')) {
                        throwError$1139({}, Messages$1084.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1595 = delegate$1098.createSequenceExpression(expressions$1594);
        }
        if (match$1144('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$1103.parenthesizedCount === oldParenthesizedCount$1598 || state$1103.parenthesizedCount === oldParenthesizedCount$1598 + 1) {
                expr$1593 = expr$1593.type === Syntax$1082.SequenceExpression ? expr$1593.expressions : expressions$1594;
                coverFormalsList$1596 = reinterpretAsCoverFormalsList$1176(expr$1593);
                if (coverFormalsList$1596) {
                    return parseArrowFunctionExpression$1177(coverFormalsList$1596);
                }
            }
            throwUnexpected$1141(lex$1135());
        }
        if (spreadFound$1597 && lookahead2$1137().value !== '=>') {
            throwError$1139({}, Messages$1084.IllegalSpread);
        }
        return sequence$1595 || expr$1593;
    }
    // 12.1 Block
    function parseStatementList$1180() {
        var list$1599 = [], statement$1600;
        while (streamIndex$1100 < length$1097) {
            if (match$1144('}')) {
                break;
            }
            statement$1600 = parseSourceElement$1225();
            if (typeof statement$1600 === 'undefined') {
                break;
            }
            list$1599.push(statement$1600);
        }
        return list$1599;
    }
    function parseBlock$1181() {
        var block$1601;
        expect$1142('{');
        block$1601 = parseStatementList$1180();
        expect$1142('}');
        return delegate$1098.createBlockStatement(block$1601);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$1182() {
        var token$1602 = lookahead$1101, resolvedIdent$1603;
        if (token$1602.type !== Token$1079.Identifier) {
            throwUnexpected$1141(token$1602);
        }
        resolvedIdent$1603 = expander$1078.resolve(tokenStream$1099[lookaheadIndex$1102]);
        lex$1135();
        return delegate$1098.createIdentifier(resolvedIdent$1603);
    }
    function parseVariableDeclaration$1183(kind$1604) {
        var id$1605, init$1606 = null;
        if (match$1144('{')) {
            id$1605 = parseObjectInitialiser$1156();
            reinterpretAsAssignmentBindingPattern$1174(id$1605);
        } else if (match$1144('[')) {
            id$1605 = parseArrayInitialiser$1151();
            reinterpretAsAssignmentBindingPattern$1174(id$1605);
        } else {
            id$1605 = state$1103.allowKeyword ? parseNonComputedProperty$1163() : parseVariableIdentifier$1182();
            // 12.2.1
            if (strict$1089 && isRestrictedWord$1116(id$1605.name)) {
                throwErrorTolerant$1140({}, Messages$1084.StrictVarName);
            }
        }
        if (kind$1604 === 'const') {
            if (!match$1144('=')) {
                throwError$1139({}, Messages$1084.NoUnintializedConst);
            }
            expect$1142('=');
            init$1606 = parseAssignmentExpression$1178();
        } else if (match$1144('=')) {
            lex$1135();
            init$1606 = parseAssignmentExpression$1178();
        }
        return delegate$1098.createVariableDeclarator(id$1605, init$1606);
    }
    function parseVariableDeclarationList$1184(kind$1607) {
        var list$1608 = [];
        do {
            list$1608.push(parseVariableDeclaration$1183(kind$1607));
            if (!match$1144(',')) {
                break;
            }
            lex$1135();
        } while (streamIndex$1100 < length$1097);
        return list$1608;
    }
    function parseVariableStatement$1185() {
        var declarations$1609;
        expectKeyword$1143('var');
        declarations$1609 = parseVariableDeclarationList$1184();
        consumeSemicolon$1148();
        return delegate$1098.createVariableDeclaration(declarations$1609, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$1186(kind$1610) {
        var declarations$1611;
        expectKeyword$1143(kind$1610);
        declarations$1611 = parseVariableDeclarationList$1184(kind$1610);
        consumeSemicolon$1148();
        return delegate$1098.createVariableDeclaration(declarations$1611, kind$1610);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$1187() {
        var id$1612, src$1613, body$1614;
        lex$1135();
        // 'module'
        if (peekLineTerminator$1138()) {
            throwError$1139({}, Messages$1084.NewlineAfterModule);
        }
        switch (lookahead$1101.type) {
        case Token$1079.StringLiteral:
            id$1612 = parsePrimaryExpression$1160();
            body$1614 = parseModuleBlock$1230();
            src$1613 = null;
            break;
        case Token$1079.Identifier:
            id$1612 = parseVariableIdentifier$1182();
            body$1614 = null;
            if (!matchContextualKeyword$1146('from')) {
                throwUnexpected$1141(lex$1135());
            }
            lex$1135();
            src$1613 = parsePrimaryExpression$1160();
            if (src$1613.type !== Syntax$1082.Literal) {
                throwError$1139({}, Messages$1084.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$1148();
        return delegate$1098.createModuleDeclaration(id$1612, src$1613, body$1614);
    }
    function parseExportBatchSpecifier$1188() {
        expect$1142('*');
        return delegate$1098.createExportBatchSpecifier();
    }
    function parseExportSpecifier$1189() {
        var id$1615, name$1616 = null;
        id$1615 = parseVariableIdentifier$1182();
        if (matchContextualKeyword$1146('as')) {
            lex$1135();
            name$1616 = parseNonComputedProperty$1163();
        }
        return delegate$1098.createExportSpecifier(id$1615, name$1616);
    }
    function parseExportDeclaration$1190() {
        var previousAllowKeyword$1617, decl$1618, def$1619, src$1620, specifiers$1621;
        expectKeyword$1143('export');
        if (lookahead$1101.type === Token$1079.Keyword) {
            switch (lookahead$1101.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$1098.createExportDeclaration(parseSourceElement$1225(), null, null);
            }
        }
        if (isIdentifierName$1132(lookahead$1101)) {
            previousAllowKeyword$1617 = state$1103.allowKeyword;
            state$1103.allowKeyword = true;
            decl$1618 = parseVariableDeclarationList$1184('let');
            state$1103.allowKeyword = previousAllowKeyword$1617;
            return delegate$1098.createExportDeclaration(decl$1618, null, null);
        }
        specifiers$1621 = [];
        src$1620 = null;
        if (match$1144('*')) {
            specifiers$1621.push(parseExportBatchSpecifier$1188());
        } else {
            expect$1142('{');
            do {
                specifiers$1621.push(parseExportSpecifier$1189());
            } while (match$1144(',') && lex$1135());
            expect$1142('}');
        }
        if (matchContextualKeyword$1146('from')) {
            lex$1135();
            src$1620 = parsePrimaryExpression$1160();
            if (src$1620.type !== Syntax$1082.Literal) {
                throwError$1139({}, Messages$1084.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$1148();
        return delegate$1098.createExportDeclaration(null, specifiers$1621, src$1620);
    }
    function parseImportDeclaration$1191() {
        var specifiers$1622, kind$1623, src$1624;
        expectKeyword$1143('import');
        specifiers$1622 = [];
        if (isIdentifierName$1132(lookahead$1101)) {
            kind$1623 = 'default';
            specifiers$1622.push(parseImportSpecifier$1192());
            if (!matchContextualKeyword$1146('from')) {
                throwError$1139({}, Messages$1084.NoFromAfterImport);
            }
            lex$1135();
        } else if (match$1144('{')) {
            kind$1623 = 'named';
            lex$1135();
            do {
                specifiers$1622.push(parseImportSpecifier$1192());
            } while (match$1144(',') && lex$1135());
            expect$1142('}');
            if (!matchContextualKeyword$1146('from')) {
                throwError$1139({}, Messages$1084.NoFromAfterImport);
            }
            lex$1135();
        }
        src$1624 = parsePrimaryExpression$1160();
        if (src$1624.type !== Syntax$1082.Literal) {
            throwError$1139({}, Messages$1084.InvalidModuleSpecifier);
        }
        consumeSemicolon$1148();
        return delegate$1098.createImportDeclaration(specifiers$1622, kind$1623, src$1624);
    }
    function parseImportSpecifier$1192() {
        var id$1625, name$1626 = null;
        id$1625 = parseNonComputedProperty$1163();
        if (matchContextualKeyword$1146('as')) {
            lex$1135();
            name$1626 = parseVariableIdentifier$1182();
        }
        return delegate$1098.createImportSpecifier(id$1625, name$1626);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$1193() {
        expect$1142(';');
        return delegate$1098.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$1194() {
        var expr$1627 = parseExpression$1179();
        consumeSemicolon$1148();
        return delegate$1098.createExpressionStatement(expr$1627);
    }
    // 12.5 If statement
    function parseIfStatement$1195() {
        var test$1628, consequent$1629, alternate$1630;
        expectKeyword$1143('if');
        expect$1142('(');
        test$1628 = parseExpression$1179();
        expect$1142(')');
        consequent$1629 = parseStatement$1210();
        if (matchKeyword$1145('else')) {
            lex$1135();
            alternate$1630 = parseStatement$1210();
        } else {
            alternate$1630 = null;
        }
        return delegate$1098.createIfStatement(test$1628, consequent$1629, alternate$1630);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$1196() {
        var body$1631, test$1632, oldInIteration$1633;
        expectKeyword$1143('do');
        oldInIteration$1633 = state$1103.inIteration;
        state$1103.inIteration = true;
        body$1631 = parseStatement$1210();
        state$1103.inIteration = oldInIteration$1633;
        expectKeyword$1143('while');
        expect$1142('(');
        test$1632 = parseExpression$1179();
        expect$1142(')');
        if (match$1144(';')) {
            lex$1135();
        }
        return delegate$1098.createDoWhileStatement(body$1631, test$1632);
    }
    function parseWhileStatement$1197() {
        var test$1634, body$1635, oldInIteration$1636;
        expectKeyword$1143('while');
        expect$1142('(');
        test$1634 = parseExpression$1179();
        expect$1142(')');
        oldInIteration$1636 = state$1103.inIteration;
        state$1103.inIteration = true;
        body$1635 = parseStatement$1210();
        state$1103.inIteration = oldInIteration$1636;
        return delegate$1098.createWhileStatement(test$1634, body$1635);
    }
    function parseForVariableDeclaration$1198() {
        var token$1637 = lex$1135(), declarations$1638 = parseVariableDeclarationList$1184();
        return delegate$1098.createVariableDeclaration(declarations$1638, token$1637.value);
    }
    function parseForStatement$1199(opts$1639) {
        var init$1640, test$1641, update$1642, left$1643, right$1644, body$1645, operator$1646, oldInIteration$1647;
        init$1640 = test$1641 = update$1642 = null;
        expectKeyword$1143('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$1146('each')) {
            throwError$1139({}, Messages$1084.EachNotAllowed);
        }
        expect$1142('(');
        if (match$1144(';')) {
            lex$1135();
        } else {
            if (matchKeyword$1145('var') || matchKeyword$1145('let') || matchKeyword$1145('const')) {
                state$1103.allowIn = false;
                init$1640 = parseForVariableDeclaration$1198();
                state$1103.allowIn = true;
                if (init$1640.declarations.length === 1) {
                    if (matchKeyword$1145('in') || matchContextualKeyword$1146('of')) {
                        operator$1646 = lookahead$1101;
                        if (!((operator$1646.value === 'in' || init$1640.kind !== 'var') && init$1640.declarations[0].init)) {
                            lex$1135();
                            left$1643 = init$1640;
                            right$1644 = parseExpression$1179();
                            init$1640 = null;
                        }
                    }
                }
            } else {
                state$1103.allowIn = false;
                init$1640 = parseExpression$1179();
                state$1103.allowIn = true;
                if (matchContextualKeyword$1146('of')) {
                    operator$1646 = lex$1135();
                    left$1643 = init$1640;
                    right$1644 = parseExpression$1179();
                    init$1640 = null;
                } else if (matchKeyword$1145('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$1150(init$1640)) {
                        throwError$1139({}, Messages$1084.InvalidLHSInForIn);
                    }
                    operator$1646 = lex$1135();
                    left$1643 = init$1640;
                    right$1644 = parseExpression$1179();
                    init$1640 = null;
                }
            }
            if (typeof left$1643 === 'undefined') {
                expect$1142(';');
            }
        }
        if (typeof left$1643 === 'undefined') {
            if (!match$1144(';')) {
                test$1641 = parseExpression$1179();
            }
            expect$1142(';');
            if (!match$1144(')')) {
                update$1642 = parseExpression$1179();
            }
        }
        expect$1142(')');
        oldInIteration$1647 = state$1103.inIteration;
        state$1103.inIteration = true;
        if (!(opts$1639 !== undefined && opts$1639.ignoreBody)) {
            body$1645 = parseStatement$1210();
        }
        state$1103.inIteration = oldInIteration$1647;
        if (typeof left$1643 === 'undefined') {
            return delegate$1098.createForStatement(init$1640, test$1641, update$1642, body$1645);
        }
        if (operator$1646.value === 'in') {
            return delegate$1098.createForInStatement(left$1643, right$1644, body$1645);
        }
        return delegate$1098.createForOfStatement(left$1643, right$1644, body$1645);
    }
    // 12.7 The continue statement
    function parseContinueStatement$1200() {
        var label$1648 = null, key$1649;
        expectKeyword$1143('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$1101.value.charCodeAt(0) === 59) {
            lex$1135();
            if (!state$1103.inIteration) {
                throwError$1139({}, Messages$1084.IllegalContinue);
            }
            return delegate$1098.createContinueStatement(null);
        }
        if (peekLineTerminator$1138()) {
            if (!state$1103.inIteration) {
                throwError$1139({}, Messages$1084.IllegalContinue);
            }
            return delegate$1098.createContinueStatement(null);
        }
        if (lookahead$1101.type === Token$1079.Identifier) {
            label$1648 = parseVariableIdentifier$1182();
            key$1649 = '$' + label$1648.name;
            if (!Object.prototype.hasOwnProperty.call(state$1103.labelSet, key$1649)) {
                throwError$1139({}, Messages$1084.UnknownLabel, label$1648.name);
            }
        }
        consumeSemicolon$1148();
        if (label$1648 === null && !state$1103.inIteration) {
            throwError$1139({}, Messages$1084.IllegalContinue);
        }
        return delegate$1098.createContinueStatement(label$1648);
    }
    // 12.8 The break statement
    function parseBreakStatement$1201() {
        var label$1650 = null, key$1651;
        expectKeyword$1143('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$1101.value.charCodeAt(0) === 59) {
            lex$1135();
            if (!(state$1103.inIteration || state$1103.inSwitch)) {
                throwError$1139({}, Messages$1084.IllegalBreak);
            }
            return delegate$1098.createBreakStatement(null);
        }
        if (peekLineTerminator$1138()) {
            if (!(state$1103.inIteration || state$1103.inSwitch)) {
                throwError$1139({}, Messages$1084.IllegalBreak);
            }
            return delegate$1098.createBreakStatement(null);
        }
        if (lookahead$1101.type === Token$1079.Identifier) {
            label$1650 = parseVariableIdentifier$1182();
            key$1651 = '$' + label$1650.name;
            if (!Object.prototype.hasOwnProperty.call(state$1103.labelSet, key$1651)) {
                throwError$1139({}, Messages$1084.UnknownLabel, label$1650.name);
            }
        }
        consumeSemicolon$1148();
        if (label$1650 === null && !(state$1103.inIteration || state$1103.inSwitch)) {
            throwError$1139({}, Messages$1084.IllegalBreak);
        }
        return delegate$1098.createBreakStatement(label$1650);
    }
    // 12.9 The return statement
    function parseReturnStatement$1202() {
        var argument$1652 = null;
        expectKeyword$1143('return');
        if (!state$1103.inFunctionBody) {
            throwErrorTolerant$1140({}, Messages$1084.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$1112(String(lookahead$1101.value).charCodeAt(0))) {
            argument$1652 = parseExpression$1179();
            consumeSemicolon$1148();
            return delegate$1098.createReturnStatement(argument$1652);
        }
        if (peekLineTerminator$1138()) {
            return delegate$1098.createReturnStatement(null);
        }
        if (!match$1144(';')) {
            if (!match$1144('}') && lookahead$1101.type !== Token$1079.EOF) {
                argument$1652 = parseExpression$1179();
            }
        }
        consumeSemicolon$1148();
        return delegate$1098.createReturnStatement(argument$1652);
    }
    // 12.10 The with statement
    function parseWithStatement$1203() {
        var object$1653, body$1654;
        if (strict$1089) {
            throwErrorTolerant$1140({}, Messages$1084.StrictModeWith);
        }
        expectKeyword$1143('with');
        expect$1142('(');
        object$1653 = parseExpression$1179();
        expect$1142(')');
        body$1654 = parseStatement$1210();
        return delegate$1098.createWithStatement(object$1653, body$1654);
    }
    // 12.10 The swith statement
    function parseSwitchCase$1204() {
        var test$1655, consequent$1656 = [], sourceElement$1657;
        if (matchKeyword$1145('default')) {
            lex$1135();
            test$1655 = null;
        } else {
            expectKeyword$1143('case');
            test$1655 = parseExpression$1179();
        }
        expect$1142(':');
        while (streamIndex$1100 < length$1097) {
            if (match$1144('}') || matchKeyword$1145('default') || matchKeyword$1145('case')) {
                break;
            }
            sourceElement$1657 = parseSourceElement$1225();
            if (typeof sourceElement$1657 === 'undefined') {
                break;
            }
            consequent$1656.push(sourceElement$1657);
        }
        return delegate$1098.createSwitchCase(test$1655, consequent$1656);
    }
    function parseSwitchStatement$1205() {
        var discriminant$1658, cases$1659, clause$1660, oldInSwitch$1661, defaultFound$1662;
        expectKeyword$1143('switch');
        expect$1142('(');
        discriminant$1658 = parseExpression$1179();
        expect$1142(')');
        expect$1142('{');
        cases$1659 = [];
        if (match$1144('}')) {
            lex$1135();
            return delegate$1098.createSwitchStatement(discriminant$1658, cases$1659);
        }
        oldInSwitch$1661 = state$1103.inSwitch;
        state$1103.inSwitch = true;
        defaultFound$1662 = false;
        while (streamIndex$1100 < length$1097) {
            if (match$1144('}')) {
                break;
            }
            clause$1660 = parseSwitchCase$1204();
            if (clause$1660.test === null) {
                if (defaultFound$1662) {
                    throwError$1139({}, Messages$1084.MultipleDefaultsInSwitch);
                }
                defaultFound$1662 = true;
            }
            cases$1659.push(clause$1660);
        }
        state$1103.inSwitch = oldInSwitch$1661;
        expect$1142('}');
        return delegate$1098.createSwitchStatement(discriminant$1658, cases$1659);
    }
    // 12.13 The throw statement
    function parseThrowStatement$1206() {
        var argument$1663;
        expectKeyword$1143('throw');
        if (peekLineTerminator$1138()) {
            throwError$1139({}, Messages$1084.NewlineAfterThrow);
        }
        argument$1663 = parseExpression$1179();
        consumeSemicolon$1148();
        return delegate$1098.createThrowStatement(argument$1663);
    }
    // 12.14 The try statement
    function parseCatchClause$1207() {
        var param$1664, body$1665;
        expectKeyword$1143('catch');
        expect$1142('(');
        if (match$1144(')')) {
            throwUnexpected$1141(lookahead$1101);
        }
        param$1664 = parseExpression$1179();
        // 12.14.1
        if (strict$1089 && param$1664.type === Syntax$1082.Identifier && isRestrictedWord$1116(param$1664.name)) {
            throwErrorTolerant$1140({}, Messages$1084.StrictCatchVariable);
        }
        expect$1142(')');
        body$1665 = parseBlock$1181();
        return delegate$1098.createCatchClause(param$1664, body$1665);
    }
    function parseTryStatement$1208() {
        var block$1666, handlers$1667 = [], finalizer$1668 = null;
        expectKeyword$1143('try');
        block$1666 = parseBlock$1181();
        if (matchKeyword$1145('catch')) {
            handlers$1667.push(parseCatchClause$1207());
        }
        if (matchKeyword$1145('finally')) {
            lex$1135();
            finalizer$1668 = parseBlock$1181();
        }
        if (handlers$1667.length === 0 && !finalizer$1668) {
            throwError$1139({}, Messages$1084.NoCatchOrFinally);
        }
        return delegate$1098.createTryStatement(block$1666, [], handlers$1667, finalizer$1668);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$1209() {
        expectKeyword$1143('debugger');
        consumeSemicolon$1148();
        return delegate$1098.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$1210() {
        var type$1669 = lookahead$1101.type, expr$1670, labeledBody$1671, key$1672;
        if (type$1669 === Token$1079.EOF) {
            throwUnexpected$1141(lookahead$1101);
        }
        if (type$1669 === Token$1079.Punctuator) {
            switch (lookahead$1101.value) {
            case ';':
                return parseEmptyStatement$1193();
            case '{':
                return parseBlock$1181();
            case '(':
                return parseExpressionStatement$1194();
            default:
                break;
            }
        }
        if (type$1669 === Token$1079.Keyword) {
            switch (lookahead$1101.value) {
            case 'break':
                return parseBreakStatement$1201();
            case 'continue':
                return parseContinueStatement$1200();
            case 'debugger':
                return parseDebuggerStatement$1209();
            case 'do':
                return parseDoWhileStatement$1196();
            case 'for':
                return parseForStatement$1199();
            case 'function':
                return parseFunctionDeclaration$1216();
            case 'class':
                return parseClassDeclaration$1223();
            case 'if':
                return parseIfStatement$1195();
            case 'return':
                return parseReturnStatement$1202();
            case 'switch':
                return parseSwitchStatement$1205();
            case 'throw':
                return parseThrowStatement$1206();
            case 'try':
                return parseTryStatement$1208();
            case 'var':
                return parseVariableStatement$1185();
            case 'while':
                return parseWhileStatement$1197();
            case 'with':
                return parseWithStatement$1203();
            default:
                break;
            }
        }
        expr$1670 = parseExpression$1179();
        // 12.12 Labelled Statements
        if (expr$1670.type === Syntax$1082.Identifier && match$1144(':')) {
            lex$1135();
            key$1672 = '$' + expr$1670.name;
            if (Object.prototype.hasOwnProperty.call(state$1103.labelSet, key$1672)) {
                throwError$1139({}, Messages$1084.Redeclaration, 'Label', expr$1670.name);
            }
            state$1103.labelSet[key$1672] = true;
            labeledBody$1671 = parseStatement$1210();
            delete state$1103.labelSet[key$1672];
            return delegate$1098.createLabeledStatement(expr$1670, labeledBody$1671);
        }
        consumeSemicolon$1148();
        return delegate$1098.createExpressionStatement(expr$1670);
    }
    // 13 Function Definition
    function parseConciseBody$1211() {
        if (match$1144('{')) {
            return parseFunctionSourceElements$1212();
        }
        return parseAssignmentExpression$1178();
    }
    function parseFunctionSourceElements$1212() {
        var sourceElement$1673, sourceElements$1674 = [], token$1675, directive$1676, firstRestricted$1677, oldLabelSet$1678, oldInIteration$1679, oldInSwitch$1680, oldInFunctionBody$1681, oldParenthesizedCount$1682;
        expect$1142('{');
        while (streamIndex$1100 < length$1097) {
            if (lookahead$1101.type !== Token$1079.StringLiteral) {
                break;
            }
            token$1675 = lookahead$1101;
            sourceElement$1673 = parseSourceElement$1225();
            sourceElements$1674.push(sourceElement$1673);
            if (sourceElement$1673.expression.type !== Syntax$1082.Literal) {
                // this is not directive
                break;
            }
            directive$1676 = token$1675.value;
            if (directive$1676 === 'use strict') {
                strict$1089 = true;
                if (firstRestricted$1677) {
                    throwErrorTolerant$1140(firstRestricted$1677, Messages$1084.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1677 && token$1675.octal) {
                    firstRestricted$1677 = token$1675;
                }
            }
        }
        oldLabelSet$1678 = state$1103.labelSet;
        oldInIteration$1679 = state$1103.inIteration;
        oldInSwitch$1680 = state$1103.inSwitch;
        oldInFunctionBody$1681 = state$1103.inFunctionBody;
        oldParenthesizedCount$1682 = state$1103.parenthesizedCount;
        state$1103.labelSet = {};
        state$1103.inIteration = false;
        state$1103.inSwitch = false;
        state$1103.inFunctionBody = true;
        state$1103.parenthesizedCount = 0;
        while (streamIndex$1100 < length$1097) {
            if (match$1144('}')) {
                break;
            }
            sourceElement$1673 = parseSourceElement$1225();
            if (typeof sourceElement$1673 === 'undefined') {
                break;
            }
            sourceElements$1674.push(sourceElement$1673);
        }
        expect$1142('}');
        state$1103.labelSet = oldLabelSet$1678;
        state$1103.inIteration = oldInIteration$1679;
        state$1103.inSwitch = oldInSwitch$1680;
        state$1103.inFunctionBody = oldInFunctionBody$1681;
        state$1103.parenthesizedCount = oldParenthesizedCount$1682;
        return delegate$1098.createBlockStatement(sourceElements$1674);
    }
    function validateParam$1213(options$1683, param$1684, name$1685) {
        var key$1686 = '$' + name$1685;
        if (strict$1089) {
            if (isRestrictedWord$1116(name$1685)) {
                options$1683.stricted = param$1684;
                options$1683.message = Messages$1084.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1683.paramSet, key$1686)) {
                options$1683.stricted = param$1684;
                options$1683.message = Messages$1084.StrictParamDupe;
            }
        } else if (!options$1683.firstRestricted) {
            if (isRestrictedWord$1116(name$1685)) {
                options$1683.firstRestricted = param$1684;
                options$1683.message = Messages$1084.StrictParamName;
            } else if (isStrictModeReservedWord$1115(name$1685)) {
                options$1683.firstRestricted = param$1684;
                options$1683.message = Messages$1084.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1683.paramSet, key$1686)) {
                options$1683.firstRestricted = param$1684;
                options$1683.message = Messages$1084.StrictParamDupe;
            }
        }
        options$1683.paramSet[key$1686] = true;
    }
    function parseParam$1214(options$1687) {
        var token$1688, rest$1689, param$1690, def$1691;
        token$1688 = lookahead$1101;
        if (token$1688.value === '...') {
            token$1688 = lex$1135();
            rest$1689 = true;
        }
        if (match$1144('[')) {
            param$1690 = parseArrayInitialiser$1151();
            reinterpretAsDestructuredParameter$1175(options$1687, param$1690);
        } else if (match$1144('{')) {
            if (rest$1689) {
                throwError$1139({}, Messages$1084.ObjectPatternAsRestParameter);
            }
            param$1690 = parseObjectInitialiser$1156();
            reinterpretAsDestructuredParameter$1175(options$1687, param$1690);
        } else {
            param$1690 = parseVariableIdentifier$1182();
            validateParam$1213(options$1687, token$1688, token$1688.value);
            if (match$1144('=')) {
                if (rest$1689) {
                    throwErrorTolerant$1140(lookahead$1101, Messages$1084.DefaultRestParameter);
                }
                lex$1135();
                def$1691 = parseAssignmentExpression$1178();
                ++options$1687.defaultCount;
            }
        }
        if (rest$1689) {
            if (!match$1144(')')) {
                throwError$1139({}, Messages$1084.ParameterAfterRestParameter);
            }
            options$1687.rest = param$1690;
            return false;
        }
        options$1687.params.push(param$1690);
        options$1687.defaults.push(def$1691);
        return !match$1144(')');
    }
    function parseParams$1215(firstRestricted$1692) {
        var options$1693;
        options$1693 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1692
        };
        expect$1142('(');
        if (!match$1144(')')) {
            options$1693.paramSet = {};
            while (streamIndex$1100 < length$1097) {
                if (!parseParam$1214(options$1693)) {
                    break;
                }
                expect$1142(',');
            }
        }
        expect$1142(')');
        if (options$1693.defaultCount === 0) {
            options$1693.defaults = [];
        }
        return options$1693;
    }
    function parseFunctionDeclaration$1216() {
        var id$1694, body$1695, token$1696, tmp$1697, firstRestricted$1698, message$1699, previousStrict$1700, previousYieldAllowed$1701, generator$1702, expression$1703;
        expectKeyword$1143('function');
        generator$1702 = false;
        if (match$1144('*')) {
            lex$1135();
            generator$1702 = true;
        }
        token$1696 = lookahead$1101;
        id$1694 = parseVariableIdentifier$1182();
        if (strict$1089) {
            if (isRestrictedWord$1116(token$1696.value)) {
                throwErrorTolerant$1140(token$1696, Messages$1084.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$1116(token$1696.value)) {
                firstRestricted$1698 = token$1696;
                message$1699 = Messages$1084.StrictFunctionName;
            } else if (isStrictModeReservedWord$1115(token$1696.value)) {
                firstRestricted$1698 = token$1696;
                message$1699 = Messages$1084.StrictReservedWord;
            }
        }
        tmp$1697 = parseParams$1215(firstRestricted$1698);
        firstRestricted$1698 = tmp$1697.firstRestricted;
        if (tmp$1697.message) {
            message$1699 = tmp$1697.message;
        }
        previousStrict$1700 = strict$1089;
        previousYieldAllowed$1701 = state$1103.yieldAllowed;
        state$1103.yieldAllowed = generator$1702;
        // here we redo some work in order to set 'expression'
        expression$1703 = !match$1144('{');
        body$1695 = parseConciseBody$1211();
        if (strict$1089 && firstRestricted$1698) {
            throwError$1139(firstRestricted$1698, message$1699);
        }
        if (strict$1089 && tmp$1697.stricted) {
            throwErrorTolerant$1140(tmp$1697.stricted, message$1699);
        }
        if (state$1103.yieldAllowed && !state$1103.yieldFound) {
            throwErrorTolerant$1140({}, Messages$1084.NoYieldInGenerator);
        }
        strict$1089 = previousStrict$1700;
        state$1103.yieldAllowed = previousYieldAllowed$1701;
        return delegate$1098.createFunctionDeclaration(id$1694, tmp$1697.params, tmp$1697.defaults, body$1695, tmp$1697.rest, generator$1702, expression$1703);
    }
    function parseFunctionExpression$1217() {
        var token$1704, id$1705 = null, firstRestricted$1706, message$1707, tmp$1708, body$1709, previousStrict$1710, previousYieldAllowed$1711, generator$1712, expression$1713;
        expectKeyword$1143('function');
        generator$1712 = false;
        if (match$1144('*')) {
            lex$1135();
            generator$1712 = true;
        }
        if (!match$1144('(')) {
            token$1704 = lookahead$1101;
            id$1705 = parseVariableIdentifier$1182();
            if (strict$1089) {
                if (isRestrictedWord$1116(token$1704.value)) {
                    throwErrorTolerant$1140(token$1704, Messages$1084.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$1116(token$1704.value)) {
                    firstRestricted$1706 = token$1704;
                    message$1707 = Messages$1084.StrictFunctionName;
                } else if (isStrictModeReservedWord$1115(token$1704.value)) {
                    firstRestricted$1706 = token$1704;
                    message$1707 = Messages$1084.StrictReservedWord;
                }
            }
        }
        tmp$1708 = parseParams$1215(firstRestricted$1706);
        firstRestricted$1706 = tmp$1708.firstRestricted;
        if (tmp$1708.message) {
            message$1707 = tmp$1708.message;
        }
        previousStrict$1710 = strict$1089;
        previousYieldAllowed$1711 = state$1103.yieldAllowed;
        state$1103.yieldAllowed = generator$1712;
        // here we redo some work in order to set 'expression'
        expression$1713 = !match$1144('{');
        body$1709 = parseConciseBody$1211();
        if (strict$1089 && firstRestricted$1706) {
            throwError$1139(firstRestricted$1706, message$1707);
        }
        if (strict$1089 && tmp$1708.stricted) {
            throwErrorTolerant$1140(tmp$1708.stricted, message$1707);
        }
        if (state$1103.yieldAllowed && !state$1103.yieldFound) {
            throwErrorTolerant$1140({}, Messages$1084.NoYieldInGenerator);
        }
        strict$1089 = previousStrict$1710;
        state$1103.yieldAllowed = previousYieldAllowed$1711;
        return delegate$1098.createFunctionExpression(id$1705, tmp$1708.params, tmp$1708.defaults, body$1709, tmp$1708.rest, generator$1712, expression$1713);
    }
    function parseYieldExpression$1218() {
        var delegateFlag$1714, expr$1715, previousYieldAllowed$1716;
        expectKeyword$1143('yield');
        if (!state$1103.yieldAllowed) {
            throwErrorTolerant$1140({}, Messages$1084.IllegalYield);
        }
        delegateFlag$1714 = false;
        if (match$1144('*')) {
            lex$1135();
            delegateFlag$1714 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1716 = state$1103.yieldAllowed;
        state$1103.yieldAllowed = false;
        expr$1715 = parseAssignmentExpression$1178();
        state$1103.yieldAllowed = previousYieldAllowed$1716;
        state$1103.yieldFound = true;
        return delegate$1098.createYieldExpression(expr$1715, delegateFlag$1714);
    }
    // 14 Classes
    function parseMethodDefinition$1219(existingPropNames$1717) {
        var token$1718, key$1719, param$1720, propType$1721, isValidDuplicateProp$1722 = false;
        if (lookahead$1101.value === 'static') {
            propType$1721 = ClassPropertyType$1087.static;
            lex$1135();
        } else {
            propType$1721 = ClassPropertyType$1087.prototype;
        }
        if (match$1144('*')) {
            lex$1135();
            return delegate$1098.createMethodDefinition(propType$1721, '', parseObjectPropertyKey$1154(), parsePropertyMethodFunction$1153({ generator: true }));
        }
        token$1718 = lookahead$1101;
        key$1719 = parseObjectPropertyKey$1154();
        if (token$1718.value === 'get' && !match$1144('(')) {
            key$1719 = parseObjectPropertyKey$1154();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1717[propType$1721].hasOwnProperty(key$1719.name)) {
                isValidDuplicateProp$1722 = existingPropNames$1717[propType$1721][key$1719.name].get === undefined && existingPropNames$1717[propType$1721][key$1719.name].data === undefined && existingPropNames$1717[propType$1721][key$1719.name].set !== undefined;
                if (!isValidDuplicateProp$1722) {
                    throwError$1139(key$1719, Messages$1084.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1717[propType$1721][key$1719.name] = {};
            }
            existingPropNames$1717[propType$1721][key$1719.name].get = true;
            expect$1142('(');
            expect$1142(')');
            return delegate$1098.createMethodDefinition(propType$1721, 'get', key$1719, parsePropertyFunction$1152({ generator: false }));
        }
        if (token$1718.value === 'set' && !match$1144('(')) {
            key$1719 = parseObjectPropertyKey$1154();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1717[propType$1721].hasOwnProperty(key$1719.name)) {
                isValidDuplicateProp$1722 = existingPropNames$1717[propType$1721][key$1719.name].set === undefined && existingPropNames$1717[propType$1721][key$1719.name].data === undefined && existingPropNames$1717[propType$1721][key$1719.name].get !== undefined;
                if (!isValidDuplicateProp$1722) {
                    throwError$1139(key$1719, Messages$1084.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1717[propType$1721][key$1719.name] = {};
            }
            existingPropNames$1717[propType$1721][key$1719.name].set = true;
            expect$1142('(');
            token$1718 = lookahead$1101;
            param$1720 = [parseVariableIdentifier$1182()];
            expect$1142(')');
            return delegate$1098.createMethodDefinition(propType$1721, 'set', key$1719, parsePropertyFunction$1152({
                params: param$1720,
                generator: false,
                name: token$1718
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1717[propType$1721].hasOwnProperty(key$1719.name)) {
            throwError$1139(key$1719, Messages$1084.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1717[propType$1721][key$1719.name] = {};
        }
        existingPropNames$1717[propType$1721][key$1719.name].data = true;
        return delegate$1098.createMethodDefinition(propType$1721, '', key$1719, parsePropertyMethodFunction$1153({ generator: false }));
    }
    function parseClassElement$1220(existingProps$1723) {
        if (match$1144(';')) {
            lex$1135();
            return;
        }
        return parseMethodDefinition$1219(existingProps$1723);
    }
    function parseClassBody$1221() {
        var classElement$1724, classElements$1725 = [], existingProps$1726 = {};
        existingProps$1726[ClassPropertyType$1087.static] = {};
        existingProps$1726[ClassPropertyType$1087.prototype] = {};
        expect$1142('{');
        while (streamIndex$1100 < length$1097) {
            if (match$1144('}')) {
                break;
            }
            classElement$1724 = parseClassElement$1220(existingProps$1726);
            if (typeof classElement$1724 !== 'undefined') {
                classElements$1725.push(classElement$1724);
            }
        }
        expect$1142('}');
        return delegate$1098.createClassBody(classElements$1725);
    }
    function parseClassExpression$1222() {
        var id$1727, previousYieldAllowed$1728, superClass$1729 = null;
        expectKeyword$1143('class');
        if (!matchKeyword$1145('extends') && !match$1144('{')) {
            id$1727 = parseVariableIdentifier$1182();
        }
        if (matchKeyword$1145('extends')) {
            expectKeyword$1143('extends');
            previousYieldAllowed$1728 = state$1103.yieldAllowed;
            state$1103.yieldAllowed = false;
            superClass$1729 = parseAssignmentExpression$1178();
            state$1103.yieldAllowed = previousYieldAllowed$1728;
        }
        return delegate$1098.createClassExpression(id$1727, superClass$1729, parseClassBody$1221());
    }
    function parseClassDeclaration$1223() {
        var id$1730, previousYieldAllowed$1731, superClass$1732 = null;
        expectKeyword$1143('class');
        id$1730 = parseVariableIdentifier$1182();
        if (matchKeyword$1145('extends')) {
            expectKeyword$1143('extends');
            previousYieldAllowed$1731 = state$1103.yieldAllowed;
            state$1103.yieldAllowed = false;
            superClass$1732 = parseAssignmentExpression$1178();
            state$1103.yieldAllowed = previousYieldAllowed$1731;
        }
        return delegate$1098.createClassDeclaration(id$1730, superClass$1732, parseClassBody$1221());
    }
    // 15 Program
    function matchModuleDeclaration$1224() {
        var id$1733;
        if (matchContextualKeyword$1146('module')) {
            id$1733 = lookahead2$1137();
            return id$1733.type === Token$1079.StringLiteral || id$1733.type === Token$1079.Identifier;
        }
        return false;
    }
    function parseSourceElement$1225() {
        if (lookahead$1101.type === Token$1079.Keyword) {
            switch (lookahead$1101.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$1186(lookahead$1101.value);
            case 'function':
                return parseFunctionDeclaration$1216();
            case 'export':
                return parseExportDeclaration$1190();
            case 'import':
                return parseImportDeclaration$1191();
            default:
                return parseStatement$1210();
            }
        }
        if (matchModuleDeclaration$1224()) {
            throwError$1139({}, Messages$1084.NestedModule);
        }
        if (lookahead$1101.type !== Token$1079.EOF) {
            return parseStatement$1210();
        }
    }
    function parseProgramElement$1226() {
        if (lookahead$1101.type === Token$1079.Keyword) {
            switch (lookahead$1101.value) {
            case 'export':
                return parseExportDeclaration$1190();
            case 'import':
                return parseImportDeclaration$1191();
            }
        }
        if (matchModuleDeclaration$1224()) {
            return parseModuleDeclaration$1187();
        }
        return parseSourceElement$1225();
    }
    function parseProgramElements$1227() {
        var sourceElement$1734, sourceElements$1735 = [], token$1736, directive$1737, firstRestricted$1738;
        while (streamIndex$1100 < length$1097) {
            token$1736 = lookahead$1101;
            if (token$1736.type !== Token$1079.StringLiteral) {
                break;
            }
            sourceElement$1734 = parseProgramElement$1226();
            sourceElements$1735.push(sourceElement$1734);
            if (sourceElement$1734.expression.type !== Syntax$1082.Literal) {
                // this is not directive
                break;
            }
            directive$1737 = token$1736.value;
            if (directive$1737 === 'use strict') {
                strict$1089 = true;
                if (firstRestricted$1738) {
                    throwErrorTolerant$1140(firstRestricted$1738, Messages$1084.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1738 && token$1736.octal) {
                    firstRestricted$1738 = token$1736;
                }
            }
        }
        while (streamIndex$1100 < length$1097) {
            sourceElement$1734 = parseProgramElement$1226();
            if (typeof sourceElement$1734 === 'undefined') {
                break;
            }
            sourceElements$1735.push(sourceElement$1734);
        }
        return sourceElements$1735;
    }
    function parseModuleElement$1228() {
        return parseSourceElement$1225();
    }
    function parseModuleElements$1229() {
        var list$1739 = [], statement$1740;
        while (streamIndex$1100 < length$1097) {
            if (match$1144('}')) {
                break;
            }
            statement$1740 = parseModuleElement$1228();
            if (typeof statement$1740 === 'undefined') {
                break;
            }
            list$1739.push(statement$1740);
        }
        return list$1739;
    }
    function parseModuleBlock$1230() {
        var block$1741;
        expect$1142('{');
        block$1741 = parseModuleElements$1229();
        expect$1142('}');
        return delegate$1098.createBlockStatement(block$1741);
    }
    function parseProgram$1231() {
        var body$1742;
        strict$1089 = false;
        peek$1136();
        body$1742 = parseProgramElements$1227();
        return delegate$1098.createProgram(body$1742);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1232(type$1743, value$1744, start$1745, end$1746, loc$1747) {
        assert$1105(typeof start$1745 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$1104.comments.length > 0) {
            if (extra$1104.comments[extra$1104.comments.length - 1].range[1] > start$1745) {
                return;
            }
        }
        extra$1104.comments.push({
            type: type$1743,
            value: value$1744,
            range: [
                start$1745,
                end$1746
            ],
            loc: loc$1747
        });
    }
    function scanComment$1233() {
        var comment$1748, ch$1749, loc$1750, start$1751, blockComment$1752, lineComment$1753;
        comment$1748 = '';
        blockComment$1752 = false;
        lineComment$1753 = false;
        while (index$1090 < length$1097) {
            ch$1749 = source$1088[index$1090];
            if (lineComment$1753) {
                ch$1749 = source$1088[index$1090++];
                if (isLineTerminator$1111(ch$1749.charCodeAt(0))) {
                    loc$1750.end = {
                        line: lineNumber$1091,
                        column: index$1090 - lineStart$1092 - 1
                    };
                    lineComment$1753 = false;
                    addComment$1232('Line', comment$1748, start$1751, index$1090 - 1, loc$1750);
                    if (ch$1749 === '\r' && source$1088[index$1090] === '\n') {
                        ++index$1090;
                    }
                    ++lineNumber$1091;
                    lineStart$1092 = index$1090;
                    comment$1748 = '';
                } else if (index$1090 >= length$1097) {
                    lineComment$1753 = false;
                    comment$1748 += ch$1749;
                    loc$1750.end = {
                        line: lineNumber$1091,
                        column: length$1097 - lineStart$1092
                    };
                    addComment$1232('Line', comment$1748, start$1751, length$1097, loc$1750);
                } else {
                    comment$1748 += ch$1749;
                }
            } else if (blockComment$1752) {
                if (isLineTerminator$1111(ch$1749.charCodeAt(0))) {
                    if (ch$1749 === '\r' && source$1088[index$1090 + 1] === '\n') {
                        ++index$1090;
                        comment$1748 += '\r\n';
                    } else {
                        comment$1748 += ch$1749;
                    }
                    ++lineNumber$1091;
                    ++index$1090;
                    lineStart$1092 = index$1090;
                    if (index$1090 >= length$1097) {
                        throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1749 = source$1088[index$1090++];
                    if (index$1090 >= length$1097) {
                        throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1748 += ch$1749;
                    if (ch$1749 === '*') {
                        ch$1749 = source$1088[index$1090];
                        if (ch$1749 === '/') {
                            comment$1748 = comment$1748.substr(0, comment$1748.length - 1);
                            blockComment$1752 = false;
                            ++index$1090;
                            loc$1750.end = {
                                line: lineNumber$1091,
                                column: index$1090 - lineStart$1092
                            };
                            addComment$1232('Block', comment$1748, start$1751, index$1090, loc$1750);
                            comment$1748 = '';
                        }
                    }
                }
            } else if (ch$1749 === '/') {
                ch$1749 = source$1088[index$1090 + 1];
                if (ch$1749 === '/') {
                    loc$1750 = {
                        start: {
                            line: lineNumber$1091,
                            column: index$1090 - lineStart$1092
                        }
                    };
                    start$1751 = index$1090;
                    index$1090 += 2;
                    lineComment$1753 = true;
                    if (index$1090 >= length$1097) {
                        loc$1750.end = {
                            line: lineNumber$1091,
                            column: index$1090 - lineStart$1092
                        };
                        lineComment$1753 = false;
                        addComment$1232('Line', comment$1748, start$1751, index$1090, loc$1750);
                    }
                } else if (ch$1749 === '*') {
                    start$1751 = index$1090;
                    index$1090 += 2;
                    blockComment$1752 = true;
                    loc$1750 = {
                        start: {
                            line: lineNumber$1091,
                            column: index$1090 - lineStart$1092 - 2
                        }
                    };
                    if (index$1090 >= length$1097) {
                        throwError$1139({}, Messages$1084.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1110(ch$1749.charCodeAt(0))) {
                ++index$1090;
            } else if (isLineTerminator$1111(ch$1749.charCodeAt(0))) {
                ++index$1090;
                if (ch$1749 === '\r' && source$1088[index$1090] === '\n') {
                    ++index$1090;
                }
                ++lineNumber$1091;
                lineStart$1092 = index$1090;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1234() {
        var i$1754, entry$1755, comment$1756, comments$1757 = [];
        for (i$1754 = 0; i$1754 < extra$1104.comments.length; ++i$1754) {
            entry$1755 = extra$1104.comments[i$1754];
            comment$1756 = {
                type: entry$1755.type,
                value: entry$1755.value
            };
            if (extra$1104.range) {
                comment$1756.range = entry$1755.range;
            }
            if (extra$1104.loc) {
                comment$1756.loc = entry$1755.loc;
            }
            comments$1757.push(comment$1756);
        }
        extra$1104.comments = comments$1757;
    }
    function collectToken$1235() {
        var start$1758, loc$1759, token$1760, range$1761, value$1762;
        skipComment$1118();
        start$1758 = index$1090;
        loc$1759 = {
            start: {
                line: lineNumber$1091,
                column: index$1090 - lineStart$1092
            }
        };
        token$1760 = extra$1104.advance();
        loc$1759.end = {
            line: lineNumber$1091,
            column: index$1090 - lineStart$1092
        };
        if (token$1760.type !== Token$1079.EOF) {
            range$1761 = [
                token$1760.range[0],
                token$1760.range[1]
            ];
            value$1762 = source$1088.slice(token$1760.range[0], token$1760.range[1]);
            extra$1104.tokens.push({
                type: TokenName$1080[token$1760.type],
                value: value$1762,
                range: range$1761,
                loc: loc$1759
            });
        }
        return token$1760;
    }
    function collectRegex$1236() {
        var pos$1763, loc$1764, regex$1765, token$1766;
        skipComment$1118();
        pos$1763 = index$1090;
        loc$1764 = {
            start: {
                line: lineNumber$1091,
                column: index$1090 - lineStart$1092
            }
        };
        regex$1765 = extra$1104.scanRegExp();
        loc$1764.end = {
            line: lineNumber$1091,
            column: index$1090 - lineStart$1092
        };
        if (!extra$1104.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$1104.tokens.length > 0) {
                token$1766 = extra$1104.tokens[extra$1104.tokens.length - 1];
                if (token$1766.range[0] === pos$1763 && token$1766.type === 'Punctuator') {
                    if (token$1766.value === '/' || token$1766.value === '/=') {
                        extra$1104.tokens.pop();
                    }
                }
            }
            extra$1104.tokens.push({
                type: 'RegularExpression',
                value: regex$1765.literal,
                range: [
                    pos$1763,
                    index$1090
                ],
                loc: loc$1764
            });
        }
        return regex$1765;
    }
    function filterTokenLocation$1237() {
        var i$1767, entry$1768, token$1769, tokens$1770 = [];
        for (i$1767 = 0; i$1767 < extra$1104.tokens.length; ++i$1767) {
            entry$1768 = extra$1104.tokens[i$1767];
            token$1769 = {
                type: entry$1768.type,
                value: entry$1768.value
            };
            if (extra$1104.range) {
                token$1769.range = entry$1768.range;
            }
            if (extra$1104.loc) {
                token$1769.loc = entry$1768.loc;
            }
            tokens$1770.push(token$1769);
        }
        extra$1104.tokens = tokens$1770;
    }
    function LocationMarker$1238() {
        var sm_index$1771 = lookahead$1101 ? lookahead$1101.sm_range[0] : 0;
        var sm_lineStart$1772 = lookahead$1101 ? lookahead$1101.sm_lineStart : 0;
        var sm_lineNumber$1773 = lookahead$1101 ? lookahead$1101.sm_lineNumber : 1;
        this.range = [
            sm_index$1771,
            sm_index$1771
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1773,
                column: sm_index$1771 - sm_lineStart$1772
            },
            end: {
                line: sm_lineNumber$1773,
                column: sm_index$1771 - sm_lineStart$1772
            }
        };
    }
    LocationMarker$1238.prototype = {
        constructor: LocationMarker$1238,
        end: function () {
            this.range[1] = sm_index$1096;
            this.loc.end.line = sm_lineNumber$1093;
            this.loc.end.column = sm_index$1096 - sm_lineStart$1094;
        },
        applyGroup: function (node$1774) {
            if (extra$1104.range) {
                node$1774.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$1104.loc) {
                node$1774.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1774 = delegate$1098.postProcess(node$1774);
            }
        },
        apply: function (node$1775) {
            var nodeType$1776 = typeof node$1775;
            assert$1105(nodeType$1776 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1776);
            if (extra$1104.range) {
                node$1775.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$1104.loc) {
                node$1775.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1775 = delegate$1098.postProcess(node$1775);
            }
        }
    };
    function createLocationMarker$1239() {
        return new LocationMarker$1238();
    }
    function trackGroupExpression$1240() {
        var marker$1777, expr$1778;
        marker$1777 = createLocationMarker$1239();
        expect$1142('(');
        ++state$1103.parenthesizedCount;
        expr$1778 = parseExpression$1179();
        expect$1142(')');
        marker$1777.end();
        marker$1777.applyGroup(expr$1778);
        return expr$1778;
    }
    function trackLeftHandSideExpression$1241() {
        var marker$1779, expr$1780;
        // skipComment();
        marker$1779 = createLocationMarker$1239();
        expr$1780 = matchKeyword$1145('new') ? parseNewExpression$1166() : parsePrimaryExpression$1160();
        while (match$1144('.') || match$1144('[') || lookahead$1101.type === Token$1079.Template) {
            if (match$1144('[')) {
                expr$1780 = delegate$1098.createMemberExpression('[', expr$1780, parseComputedMember$1165());
                marker$1779.end();
                marker$1779.apply(expr$1780);
            } else if (match$1144('.')) {
                expr$1780 = delegate$1098.createMemberExpression('.', expr$1780, parseNonComputedMember$1164());
                marker$1779.end();
                marker$1779.apply(expr$1780);
            } else {
                expr$1780 = delegate$1098.createTaggedTemplateExpression(expr$1780, parseTemplateLiteral$1158());
                marker$1779.end();
                marker$1779.apply(expr$1780);
            }
        }
        return expr$1780;
    }
    function trackLeftHandSideExpressionAllowCall$1242() {
        var marker$1781, expr$1782, args$1783;
        // skipComment();
        marker$1781 = createLocationMarker$1239();
        expr$1782 = matchKeyword$1145('new') ? parseNewExpression$1166() : parsePrimaryExpression$1160();
        while (match$1144('.') || match$1144('[') || match$1144('(') || lookahead$1101.type === Token$1079.Template) {
            if (match$1144('(')) {
                args$1783 = parseArguments$1161();
                expr$1782 = delegate$1098.createCallExpression(expr$1782, args$1783);
                marker$1781.end();
                marker$1781.apply(expr$1782);
            } else if (match$1144('[')) {
                expr$1782 = delegate$1098.createMemberExpression('[', expr$1782, parseComputedMember$1165());
                marker$1781.end();
                marker$1781.apply(expr$1782);
            } else if (match$1144('.')) {
                expr$1782 = delegate$1098.createMemberExpression('.', expr$1782, parseNonComputedMember$1164());
                marker$1781.end();
                marker$1781.apply(expr$1782);
            } else {
                expr$1782 = delegate$1098.createTaggedTemplateExpression(expr$1782, parseTemplateLiteral$1158());
                marker$1781.end();
                marker$1781.apply(expr$1782);
            }
        }
        return expr$1782;
    }
    function filterGroup$1243(node$1784) {
        var n$1785, i$1786, entry$1787;
        n$1785 = Object.prototype.toString.apply(node$1784) === '[object Array]' ? [] : {};
        for (i$1786 in node$1784) {
            if (node$1784.hasOwnProperty(i$1786) && i$1786 !== 'groupRange' && i$1786 !== 'groupLoc') {
                entry$1787 = node$1784[i$1786];
                if (entry$1787 === null || typeof entry$1787 !== 'object' || entry$1787 instanceof RegExp) {
                    n$1785[i$1786] = entry$1787;
                } else {
                    n$1785[i$1786] = filterGroup$1243(entry$1787);
                }
            }
        }
        return n$1785;
    }
    function wrapTrackingFunction$1244(range$1788, loc$1789) {
        return function (parseFunction$1790) {
            function isBinary$1791(node$1793) {
                return node$1793.type === Syntax$1082.LogicalExpression || node$1793.type === Syntax$1082.BinaryExpression;
            }
            function visit$1792(node$1794) {
                var start$1795, end$1796;
                if (isBinary$1791(node$1794.left)) {
                    visit$1792(node$1794.left);
                }
                if (isBinary$1791(node$1794.right)) {
                    visit$1792(node$1794.right);
                }
                if (range$1788) {
                    if (node$1794.left.groupRange || node$1794.right.groupRange) {
                        start$1795 = node$1794.left.groupRange ? node$1794.left.groupRange[0] : node$1794.left.range[0];
                        end$1796 = node$1794.right.groupRange ? node$1794.right.groupRange[1] : node$1794.right.range[1];
                        node$1794.range = [
                            start$1795,
                            end$1796
                        ];
                    } else if (typeof node$1794.range === 'undefined') {
                        start$1795 = node$1794.left.range[0];
                        end$1796 = node$1794.right.range[1];
                        node$1794.range = [
                            start$1795,
                            end$1796
                        ];
                    }
                }
                if (loc$1789) {
                    if (node$1794.left.groupLoc || node$1794.right.groupLoc) {
                        start$1795 = node$1794.left.groupLoc ? node$1794.left.groupLoc.start : node$1794.left.loc.start;
                        end$1796 = node$1794.right.groupLoc ? node$1794.right.groupLoc.end : node$1794.right.loc.end;
                        node$1794.loc = {
                            start: start$1795,
                            end: end$1796
                        };
                        node$1794 = delegate$1098.postProcess(node$1794);
                    } else if (typeof node$1794.loc === 'undefined') {
                        node$1794.loc = {
                            start: node$1794.left.loc.start,
                            end: node$1794.right.loc.end
                        };
                        node$1794 = delegate$1098.postProcess(node$1794);
                    }
                }
            }
            return function () {
                var marker$1797, node$1798, curr$1799 = lookahead$1101;
                marker$1797 = createLocationMarker$1239();
                node$1798 = parseFunction$1790.apply(null, arguments);
                marker$1797.end();
                if (node$1798.type !== Syntax$1082.Program) {
                    if (curr$1799.leadingComments) {
                        node$1798.leadingComments = curr$1799.leadingComments;
                    }
                    if (curr$1799.trailingComments) {
                        node$1798.trailingComments = curr$1799.trailingComments;
                    }
                }
                if (range$1788 && typeof node$1798.range === 'undefined') {
                    marker$1797.apply(node$1798);
                }
                if (loc$1789 && typeof node$1798.loc === 'undefined') {
                    marker$1797.apply(node$1798);
                }
                if (isBinary$1791(node$1798)) {
                    visit$1792(node$1798);
                }
                return node$1798;
            };
        };
    }
    function patch$1245() {
        var wrapTracking$1800;
        if (extra$1104.comments) {
            extra$1104.skipComment = skipComment$1118;
            skipComment$1118 = scanComment$1233;
        }
        if (extra$1104.range || extra$1104.loc) {
            extra$1104.parseGroupExpression = parseGroupExpression$1159;
            extra$1104.parseLeftHandSideExpression = parseLeftHandSideExpression$1168;
            extra$1104.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$1167;
            parseGroupExpression$1159 = trackGroupExpression$1240;
            parseLeftHandSideExpression$1168 = trackLeftHandSideExpression$1241;
            parseLeftHandSideExpressionAllowCall$1167 = trackLeftHandSideExpressionAllowCall$1242;
            wrapTracking$1800 = wrapTrackingFunction$1244(extra$1104.range, extra$1104.loc);
            extra$1104.parseArrayInitialiser = parseArrayInitialiser$1151;
            extra$1104.parseAssignmentExpression = parseAssignmentExpression$1178;
            extra$1104.parseBinaryExpression = parseBinaryExpression$1172;
            extra$1104.parseBlock = parseBlock$1181;
            extra$1104.parseFunctionSourceElements = parseFunctionSourceElements$1212;
            extra$1104.parseCatchClause = parseCatchClause$1207;
            extra$1104.parseComputedMember = parseComputedMember$1165;
            extra$1104.parseConditionalExpression = parseConditionalExpression$1173;
            extra$1104.parseConstLetDeclaration = parseConstLetDeclaration$1186;
            extra$1104.parseExportBatchSpecifier = parseExportBatchSpecifier$1188;
            extra$1104.parseExportDeclaration = parseExportDeclaration$1190;
            extra$1104.parseExportSpecifier = parseExportSpecifier$1189;
            extra$1104.parseExpression = parseExpression$1179;
            extra$1104.parseForVariableDeclaration = parseForVariableDeclaration$1198;
            extra$1104.parseFunctionDeclaration = parseFunctionDeclaration$1216;
            extra$1104.parseFunctionExpression = parseFunctionExpression$1217;
            extra$1104.parseParams = parseParams$1215;
            extra$1104.parseImportDeclaration = parseImportDeclaration$1191;
            extra$1104.parseImportSpecifier = parseImportSpecifier$1192;
            extra$1104.parseModuleDeclaration = parseModuleDeclaration$1187;
            extra$1104.parseModuleBlock = parseModuleBlock$1230;
            extra$1104.parseNewExpression = parseNewExpression$1166;
            extra$1104.parseNonComputedProperty = parseNonComputedProperty$1163;
            extra$1104.parseObjectInitialiser = parseObjectInitialiser$1156;
            extra$1104.parseObjectProperty = parseObjectProperty$1155;
            extra$1104.parseObjectPropertyKey = parseObjectPropertyKey$1154;
            extra$1104.parsePostfixExpression = parsePostfixExpression$1169;
            extra$1104.parsePrimaryExpression = parsePrimaryExpression$1160;
            extra$1104.parseProgram = parseProgram$1231;
            extra$1104.parsePropertyFunction = parsePropertyFunction$1152;
            extra$1104.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$1162;
            extra$1104.parseTemplateElement = parseTemplateElement$1157;
            extra$1104.parseTemplateLiteral = parseTemplateLiteral$1158;
            extra$1104.parseStatement = parseStatement$1210;
            extra$1104.parseSwitchCase = parseSwitchCase$1204;
            extra$1104.parseUnaryExpression = parseUnaryExpression$1170;
            extra$1104.parseVariableDeclaration = parseVariableDeclaration$1183;
            extra$1104.parseVariableIdentifier = parseVariableIdentifier$1182;
            extra$1104.parseMethodDefinition = parseMethodDefinition$1219;
            extra$1104.parseClassDeclaration = parseClassDeclaration$1223;
            extra$1104.parseClassExpression = parseClassExpression$1222;
            extra$1104.parseClassBody = parseClassBody$1221;
            parseArrayInitialiser$1151 = wrapTracking$1800(extra$1104.parseArrayInitialiser);
            parseAssignmentExpression$1178 = wrapTracking$1800(extra$1104.parseAssignmentExpression);
            parseBinaryExpression$1172 = wrapTracking$1800(extra$1104.parseBinaryExpression);
            parseBlock$1181 = wrapTracking$1800(extra$1104.parseBlock);
            parseFunctionSourceElements$1212 = wrapTracking$1800(extra$1104.parseFunctionSourceElements);
            parseCatchClause$1207 = wrapTracking$1800(extra$1104.parseCatchClause);
            parseComputedMember$1165 = wrapTracking$1800(extra$1104.parseComputedMember);
            parseConditionalExpression$1173 = wrapTracking$1800(extra$1104.parseConditionalExpression);
            parseConstLetDeclaration$1186 = wrapTracking$1800(extra$1104.parseConstLetDeclaration);
            parseExportBatchSpecifier$1188 = wrapTracking$1800(parseExportBatchSpecifier$1188);
            parseExportDeclaration$1190 = wrapTracking$1800(parseExportDeclaration$1190);
            parseExportSpecifier$1189 = wrapTracking$1800(parseExportSpecifier$1189);
            parseExpression$1179 = wrapTracking$1800(extra$1104.parseExpression);
            parseForVariableDeclaration$1198 = wrapTracking$1800(extra$1104.parseForVariableDeclaration);
            parseFunctionDeclaration$1216 = wrapTracking$1800(extra$1104.parseFunctionDeclaration);
            parseFunctionExpression$1217 = wrapTracking$1800(extra$1104.parseFunctionExpression);
            parseParams$1215 = wrapTracking$1800(extra$1104.parseParams);
            parseImportDeclaration$1191 = wrapTracking$1800(extra$1104.parseImportDeclaration);
            parseImportSpecifier$1192 = wrapTracking$1800(extra$1104.parseImportSpecifier);
            parseModuleDeclaration$1187 = wrapTracking$1800(extra$1104.parseModuleDeclaration);
            parseModuleBlock$1230 = wrapTracking$1800(extra$1104.parseModuleBlock);
            parseLeftHandSideExpression$1168 = wrapTracking$1800(parseLeftHandSideExpression$1168);
            parseNewExpression$1166 = wrapTracking$1800(extra$1104.parseNewExpression);
            parseNonComputedProperty$1163 = wrapTracking$1800(extra$1104.parseNonComputedProperty);
            parseObjectInitialiser$1156 = wrapTracking$1800(extra$1104.parseObjectInitialiser);
            parseObjectProperty$1155 = wrapTracking$1800(extra$1104.parseObjectProperty);
            parseObjectPropertyKey$1154 = wrapTracking$1800(extra$1104.parseObjectPropertyKey);
            parsePostfixExpression$1169 = wrapTracking$1800(extra$1104.parsePostfixExpression);
            parsePrimaryExpression$1160 = wrapTracking$1800(extra$1104.parsePrimaryExpression);
            parseProgram$1231 = wrapTracking$1800(extra$1104.parseProgram);
            parsePropertyFunction$1152 = wrapTracking$1800(extra$1104.parsePropertyFunction);
            parseTemplateElement$1157 = wrapTracking$1800(extra$1104.parseTemplateElement);
            parseTemplateLiteral$1158 = wrapTracking$1800(extra$1104.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$1162 = wrapTracking$1800(extra$1104.parseSpreadOrAssignmentExpression);
            parseStatement$1210 = wrapTracking$1800(extra$1104.parseStatement);
            parseSwitchCase$1204 = wrapTracking$1800(extra$1104.parseSwitchCase);
            parseUnaryExpression$1170 = wrapTracking$1800(extra$1104.parseUnaryExpression);
            parseVariableDeclaration$1183 = wrapTracking$1800(extra$1104.parseVariableDeclaration);
            parseVariableIdentifier$1182 = wrapTracking$1800(extra$1104.parseVariableIdentifier);
            parseMethodDefinition$1219 = wrapTracking$1800(extra$1104.parseMethodDefinition);
            parseClassDeclaration$1223 = wrapTracking$1800(extra$1104.parseClassDeclaration);
            parseClassExpression$1222 = wrapTracking$1800(extra$1104.parseClassExpression);
            parseClassBody$1221 = wrapTracking$1800(extra$1104.parseClassBody);
        }
        if (typeof extra$1104.tokens !== 'undefined') {
            extra$1104.advance = advance$1134;
            extra$1104.scanRegExp = scanRegExp$1131;
            advance$1134 = collectToken$1235;
            scanRegExp$1131 = collectRegex$1236;
        }
    }
    function unpatch$1246() {
        if (typeof extra$1104.skipComment === 'function') {
            skipComment$1118 = extra$1104.skipComment;
        }
        if (extra$1104.range || extra$1104.loc) {
            parseArrayInitialiser$1151 = extra$1104.parseArrayInitialiser;
            parseAssignmentExpression$1178 = extra$1104.parseAssignmentExpression;
            parseBinaryExpression$1172 = extra$1104.parseBinaryExpression;
            parseBlock$1181 = extra$1104.parseBlock;
            parseFunctionSourceElements$1212 = extra$1104.parseFunctionSourceElements;
            parseCatchClause$1207 = extra$1104.parseCatchClause;
            parseComputedMember$1165 = extra$1104.parseComputedMember;
            parseConditionalExpression$1173 = extra$1104.parseConditionalExpression;
            parseConstLetDeclaration$1186 = extra$1104.parseConstLetDeclaration;
            parseExportBatchSpecifier$1188 = extra$1104.parseExportBatchSpecifier;
            parseExportDeclaration$1190 = extra$1104.parseExportDeclaration;
            parseExportSpecifier$1189 = extra$1104.parseExportSpecifier;
            parseExpression$1179 = extra$1104.parseExpression;
            parseForVariableDeclaration$1198 = extra$1104.parseForVariableDeclaration;
            parseFunctionDeclaration$1216 = extra$1104.parseFunctionDeclaration;
            parseFunctionExpression$1217 = extra$1104.parseFunctionExpression;
            parseImportDeclaration$1191 = extra$1104.parseImportDeclaration;
            parseImportSpecifier$1192 = extra$1104.parseImportSpecifier;
            parseGroupExpression$1159 = extra$1104.parseGroupExpression;
            parseLeftHandSideExpression$1168 = extra$1104.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$1167 = extra$1104.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$1187 = extra$1104.parseModuleDeclaration;
            parseModuleBlock$1230 = extra$1104.parseModuleBlock;
            parseNewExpression$1166 = extra$1104.parseNewExpression;
            parseNonComputedProperty$1163 = extra$1104.parseNonComputedProperty;
            parseObjectInitialiser$1156 = extra$1104.parseObjectInitialiser;
            parseObjectProperty$1155 = extra$1104.parseObjectProperty;
            parseObjectPropertyKey$1154 = extra$1104.parseObjectPropertyKey;
            parsePostfixExpression$1169 = extra$1104.parsePostfixExpression;
            parsePrimaryExpression$1160 = extra$1104.parsePrimaryExpression;
            parseProgram$1231 = extra$1104.parseProgram;
            parsePropertyFunction$1152 = extra$1104.parsePropertyFunction;
            parseTemplateElement$1157 = extra$1104.parseTemplateElement;
            parseTemplateLiteral$1158 = extra$1104.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$1162 = extra$1104.parseSpreadOrAssignmentExpression;
            parseStatement$1210 = extra$1104.parseStatement;
            parseSwitchCase$1204 = extra$1104.parseSwitchCase;
            parseUnaryExpression$1170 = extra$1104.parseUnaryExpression;
            parseVariableDeclaration$1183 = extra$1104.parseVariableDeclaration;
            parseVariableIdentifier$1182 = extra$1104.parseVariableIdentifier;
            parseMethodDefinition$1219 = extra$1104.parseMethodDefinition;
            parseClassDeclaration$1223 = extra$1104.parseClassDeclaration;
            parseClassExpression$1222 = extra$1104.parseClassExpression;
            parseClassBody$1221 = extra$1104.parseClassBody;
        }
        if (typeof extra$1104.scanRegExp === 'function') {
            advance$1134 = extra$1104.advance;
            scanRegExp$1131 = extra$1104.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1247(object$1801, properties$1802) {
        var entry$1803, result$1804 = {};
        for (entry$1803 in object$1801) {
            if (object$1801.hasOwnProperty(entry$1803)) {
                result$1804[entry$1803] = object$1801[entry$1803];
            }
        }
        for (entry$1803 in properties$1802) {
            if (properties$1802.hasOwnProperty(entry$1803)) {
                result$1804[entry$1803] = properties$1802[entry$1803];
            }
        }
        return result$1804;
    }
    function tokenize$1248(code$1805, options$1806) {
        var toString$1807, token$1808, tokens$1809;
        toString$1807 = String;
        if (typeof code$1805 !== 'string' && !(code$1805 instanceof String)) {
            code$1805 = toString$1807(code$1805);
        }
        delegate$1098 = SyntaxTreeDelegate$1086;
        source$1088 = code$1805;
        index$1090 = 0;
        lineNumber$1091 = source$1088.length > 0 ? 1 : 0;
        lineStart$1092 = 0;
        length$1097 = source$1088.length;
        lookahead$1101 = null;
        state$1103 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$1104 = {};
        // Options matching.
        options$1806 = options$1806 || {};
        // Of course we collect tokens here.
        options$1806.tokens = true;
        extra$1104.tokens = [];
        extra$1104.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$1104.openParenToken = -1;
        extra$1104.openCurlyToken = -1;
        extra$1104.range = typeof options$1806.range === 'boolean' && options$1806.range;
        extra$1104.loc = typeof options$1806.loc === 'boolean' && options$1806.loc;
        if (typeof options$1806.comment === 'boolean' && options$1806.comment) {
            extra$1104.comments = [];
        }
        if (typeof options$1806.tolerant === 'boolean' && options$1806.tolerant) {
            extra$1104.errors = [];
        }
        if (length$1097 > 0) {
            if (typeof source$1088[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1805 instanceof String) {
                    source$1088 = code$1805.valueOf();
                }
            }
        }
        patch$1245();
        try {
            peek$1136();
            if (lookahead$1101.type === Token$1079.EOF) {
                return extra$1104.tokens;
            }
            token$1808 = lex$1135();
            while (lookahead$1101.type !== Token$1079.EOF) {
                try {
                    token$1808 = lex$1135();
                } catch (lexError$1810) {
                    token$1808 = lookahead$1101;
                    if (extra$1104.errors) {
                        extra$1104.errors.push(lexError$1810);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1810;
                    }
                }
            }
            filterTokenLocation$1237();
            tokens$1809 = extra$1104.tokens;
            if (typeof extra$1104.comments !== 'undefined') {
                filterCommentLocation$1234();
                tokens$1809.comments = extra$1104.comments;
            }
            if (typeof extra$1104.errors !== 'undefined') {
                tokens$1809.errors = extra$1104.errors;
            }
        } catch (e$1811) {
            throw e$1811;
        } finally {
            unpatch$1246();
            extra$1104 = {};
        }
        return tokens$1809;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1249(toks$1812, start$1813, inExprDelim$1814, parentIsBlock$1815) {
        var assignOps$1816 = [
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
        var binaryOps$1817 = [
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
        var unaryOps$1818 = [
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
        function back$1819(n$1820) {
            var idx$1821 = toks$1812.length - n$1820 > 0 ? toks$1812.length - n$1820 : 0;
            return toks$1812[idx$1821];
        }
        if (inExprDelim$1814 && toks$1812.length - (start$1813 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1819(start$1813 + 2).value === ':' && parentIsBlock$1815) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$1106(back$1819(start$1813 + 2).value, unaryOps$1818.concat(binaryOps$1817).concat(assignOps$1816))) {
            // ... + {...}
            return false;
        } else if (back$1819(start$1813 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1822 = typeof back$1819(start$1813 + 1).startLineNumber !== 'undefined' ? back$1819(start$1813 + 1).startLineNumber : back$1819(start$1813 + 1).lineNumber;
            if (back$1819(start$1813 + 2).lineNumber !== currLineNumber$1822) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$1106(back$1819(start$1813 + 2).value, [
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
    function readToken$1250(toks$1823, inExprDelim$1824, parentIsBlock$1825) {
        var delimiters$1826 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1827 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1828 = toks$1823.length - 1;
        var comments$1829, commentsLen$1830 = extra$1104.comments.length;
        function back$1831(n$1835) {
            var idx$1836 = toks$1823.length - n$1835 > 0 ? toks$1823.length - n$1835 : 0;
            return toks$1823[idx$1836];
        }
        function attachComments$1832(token$1837) {
            if (comments$1829) {
                token$1837.leadingComments = comments$1829;
            }
            return token$1837;
        }
        function _advance$1833() {
            return attachComments$1832(advance$1134());
        }
        function _scanRegExp$1834() {
            return attachComments$1832(scanRegExp$1131());
        }
        skipComment$1118();
        if (extra$1104.comments.length > commentsLen$1830) {
            comments$1829 = extra$1104.comments.slice(commentsLen$1830);
        }
        if (isIn$1106(source$1088[index$1090], delimiters$1826)) {
            return attachComments$1832(readDelim$1251(toks$1823, inExprDelim$1824, parentIsBlock$1825));
        }
        if (source$1088[index$1090] === '/') {
            var prev$1838 = back$1831(1);
            if (prev$1838) {
                if (prev$1838.value === '()') {
                    if (isIn$1106(back$1831(2).value, parenIdents$1827)) {
                        // ... if (...) / ...
                        return _scanRegExp$1834();
                    }
                    // ... (...) / ...
                    return _advance$1833();
                }
                if (prev$1838.value === '{}') {
                    if (blockAllowed$1249(toks$1823, 0, inExprDelim$1824, parentIsBlock$1825)) {
                        if (back$1831(2).value === '()') {
                            // named function
                            if (back$1831(4).value === 'function') {
                                if (!blockAllowed$1249(toks$1823, 3, inExprDelim$1824, parentIsBlock$1825)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1833();
                                }
                                if (toks$1823.length - 5 <= 0 && inExprDelim$1824) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1833();
                                }
                            }
                            // unnamed function
                            if (back$1831(3).value === 'function') {
                                if (!blockAllowed$1249(toks$1823, 2, inExprDelim$1824, parentIsBlock$1825)) {
                                    // new function (...) {...} / ...
                                    return _advance$1833();
                                }
                                if (toks$1823.length - 4 <= 0 && inExprDelim$1824) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1833();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1834();
                    } else {
                        // ... + {...} / ...
                        return _advance$1833();
                    }
                }
                if (prev$1838.type === Token$1079.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1834();
                }
                if (isKeyword$1117(prev$1838.value)) {
                    // typeof /...
                    return _scanRegExp$1834();
                }
                return _advance$1833();
            }
            return _scanRegExp$1834();
        }
        return _advance$1833();
    }
    function readDelim$1251(toks$1839, inExprDelim$1840, parentIsBlock$1841) {
        var startDelim$1842 = advance$1134(), matchDelim$1843 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1844 = [];
        var delimiters$1845 = [
                '(',
                '{',
                '['
            ];
        assert$1105(delimiters$1845.indexOf(startDelim$1842.value) !== -1, 'Need to begin at the delimiter');
        var token$1846 = startDelim$1842;
        var startLineNumber$1847 = token$1846.lineNumber;
        var startLineStart$1848 = token$1846.lineStart;
        var startRange$1849 = token$1846.range;
        var delimToken$1850 = {};
        delimToken$1850.type = Token$1079.Delimiter;
        delimToken$1850.value = startDelim$1842.value + matchDelim$1843[startDelim$1842.value];
        delimToken$1850.startLineNumber = startLineNumber$1847;
        delimToken$1850.startLineStart = startLineStart$1848;
        delimToken$1850.startRange = startRange$1849;
        var delimIsBlock$1851 = false;
        if (startDelim$1842.value === '{') {
            delimIsBlock$1851 = blockAllowed$1249(toks$1839.concat(delimToken$1850), 0, inExprDelim$1840, parentIsBlock$1841);
        }
        while (index$1090 <= length$1097) {
            token$1846 = readToken$1250(inner$1844, startDelim$1842.value === '(' || startDelim$1842.value === '[', delimIsBlock$1851);
            if (token$1846.type === Token$1079.Punctuator && token$1846.value === matchDelim$1843[startDelim$1842.value]) {
                if (token$1846.leadingComments) {
                    delimToken$1850.trailingComments = token$1846.leadingComments;
                }
                break;
            } else if (token$1846.type === Token$1079.EOF) {
                throwError$1139({}, Messages$1084.UnexpectedEOS);
            } else {
                inner$1844.push(token$1846);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$1090 >= length$1097 && matchDelim$1843[startDelim$1842.value] !== source$1088[length$1097 - 1]) {
            throwError$1139({}, Messages$1084.UnexpectedEOS);
        }
        var endLineNumber$1852 = token$1846.lineNumber;
        var endLineStart$1853 = token$1846.lineStart;
        var endRange$1854 = token$1846.range;
        delimToken$1850.inner = inner$1844;
        delimToken$1850.endLineNumber = endLineNumber$1852;
        delimToken$1850.endLineStart = endLineStart$1853;
        delimToken$1850.endRange = endRange$1854;
        return delimToken$1850;
    }
    // (Str) -> [...CSyntax]
    function read$1252(code$1855) {
        var token$1856, tokenTree$1857 = [];
        extra$1104 = {};
        extra$1104.comments = [];
        patch$1245();
        source$1088 = code$1855;
        index$1090 = 0;
        lineNumber$1091 = source$1088.length > 0 ? 1 : 0;
        lineStart$1092 = 0;
        length$1097 = source$1088.length;
        state$1103 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$1090 < length$1097) {
            tokenTree$1857.push(readToken$1250(tokenTree$1857, false, false));
        }
        var last$1858 = tokenTree$1857[tokenTree$1857.length - 1];
        if (last$1858 && last$1858.type !== Token$1079.EOF) {
            tokenTree$1857.push({
                type: Token$1079.EOF,
                value: '',
                lineNumber: last$1858.lineNumber,
                lineStart: last$1858.lineStart,
                range: [
                    index$1090,
                    index$1090
                ]
            });
        }
        return expander$1078.tokensToSyntax(tokenTree$1857);
    }
    function parse$1253(code$1859, options$1860) {
        var program$1861, toString$1862;
        extra$1104 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1859)) {
            tokenStream$1099 = code$1859;
            length$1097 = tokenStream$1099.length;
            lineNumber$1091 = tokenStream$1099.length > 0 ? 1 : 0;
            source$1088 = undefined;
        } else {
            toString$1862 = String;
            if (typeof code$1859 !== 'string' && !(code$1859 instanceof String)) {
                code$1859 = toString$1862(code$1859);
            }
            source$1088 = code$1859;
            length$1097 = source$1088.length;
            lineNumber$1091 = source$1088.length > 0 ? 1 : 0;
        }
        delegate$1098 = SyntaxTreeDelegate$1086;
        streamIndex$1100 = -1;
        index$1090 = 0;
        lineStart$1092 = 0;
        sm_lineStart$1094 = 0;
        sm_lineNumber$1093 = lineNumber$1091;
        sm_index$1096 = 0;
        sm_range$1095 = [
            0,
            0
        ];
        lookahead$1101 = null;
        state$1103 = {
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
        if (typeof options$1860 !== 'undefined') {
            extra$1104.range = typeof options$1860.range === 'boolean' && options$1860.range;
            extra$1104.loc = typeof options$1860.loc === 'boolean' && options$1860.loc;
            if (extra$1104.loc && options$1860.source !== null && options$1860.source !== undefined) {
                delegate$1098 = extend$1247(delegate$1098, {
                    'postProcess': function (node$1863) {
                        node$1863.loc.source = toString$1862(options$1860.source);
                        return node$1863;
                    }
                });
            }
            if (typeof options$1860.tokens === 'boolean' && options$1860.tokens) {
                extra$1104.tokens = [];
            }
            if (typeof options$1860.comment === 'boolean' && options$1860.comment) {
                extra$1104.comments = [];
            }
            if (typeof options$1860.tolerant === 'boolean' && options$1860.tolerant) {
                extra$1104.errors = [];
            }
        }
        if (length$1097 > 0) {
            if (source$1088 && typeof source$1088[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1859 instanceof String) {
                    source$1088 = code$1859.valueOf();
                }
            }
        }
        extra$1104 = { loc: true };
        patch$1245();
        try {
            program$1861 = parseProgram$1231();
            if (typeof extra$1104.comments !== 'undefined') {
                filterCommentLocation$1234();
                program$1861.comments = extra$1104.comments;
            }
            if (typeof extra$1104.tokens !== 'undefined') {
                filterTokenLocation$1237();
                program$1861.tokens = extra$1104.tokens;
            }
            if (typeof extra$1104.errors !== 'undefined') {
                program$1861.errors = extra$1104.errors;
            }
            if (extra$1104.range || extra$1104.loc) {
                program$1861.body = filterGroup$1243(program$1861.body);
            }
        } catch (e$1864) {
            throw e$1864;
        } finally {
            unpatch$1246();
            extra$1104 = {};
        }
        return program$1861;
    }
    exports$1077.tokenize = tokenize$1248;
    exports$1077.read = read$1252;
    exports$1077.Token = Token$1079;
    exports$1077.parse = parse$1253;
    // Deep copy.
    exports$1077.Syntax = function () {
        var name$1865, types$1866 = {};
        if (typeof Object.create === 'function') {
            types$1866 = Object.create(null);
        }
        for (name$1865 in Syntax$1082) {
            if (Syntax$1082.hasOwnProperty(name$1865)) {
                types$1866[name$1865] = Syntax$1082[name$1865];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1866);
        }
        return types$1866;
    }();
}));
//# sourceMappingURL=parser.js.map