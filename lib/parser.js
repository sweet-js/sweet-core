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
(function (root$947, factory$948) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$948);
    } else if (typeof exports !== 'undefined') {
        factory$948(exports, require('./expander'));
    } else {
        factory$948(root$947.esprima = {});
    }
}(this, function (exports$949, expander$950) {
    'use strict';
    var Token$951, TokenName$952, FnExprTokens$953, Syntax$954, PropertyKind$955, Messages$956, Regex$957, SyntaxTreeDelegate$958, ClassPropertyType$959, source$960, strict$961, index$962, lineNumber$963, lineStart$964, sm_lineNumber$965, sm_lineStart$966, sm_range$967, sm_index$968, length$969, delegate$970, tokenStream$971, streamIndex$972, lookahead$973, lookaheadIndex$974, state$975, extra$976;
    Token$951 = {
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
    TokenName$952 = {};
    TokenName$952[Token$951.BooleanLiteral] = 'Boolean';
    TokenName$952[Token$951.EOF] = '<end>';
    TokenName$952[Token$951.Identifier] = 'Identifier';
    TokenName$952[Token$951.Keyword] = 'Keyword';
    TokenName$952[Token$951.NullLiteral] = 'Null';
    TokenName$952[Token$951.NumericLiteral] = 'Numeric';
    TokenName$952[Token$951.Punctuator] = 'Punctuator';
    TokenName$952[Token$951.StringLiteral] = 'String';
    TokenName$952[Token$951.RegularExpression] = 'RegularExpression';
    TokenName$952[Token$951.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$953 = [
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
    Syntax$954 = {
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
    PropertyKind$955 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$959 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$956 = {
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
    Regex$957 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$977(condition$1126, message$1127) {
        if (!condition$1126) {
            throw new Error('ASSERT: ' + message$1127);
        }
    }
    function isIn$978(el$1128, list$1129) {
        return list$1129.indexOf(el$1128) !== -1;
    }
    function isDecimalDigit$979(ch$1130) {
        return ch$1130 >= 48 && ch$1130 <= 57;
    }    // 0..9
    function isHexDigit$980(ch$1131) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1131) >= 0;
    }
    function isOctalDigit$981(ch$1132) {
        return '01234567'.indexOf(ch$1132) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$982(ch$1133) {
        return ch$1133 === 32 || ch$1133 === 9 || ch$1133 === 11 || ch$1133 === 12 || ch$1133 === 160 || ch$1133 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1133)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$983(ch$1134) {
        return ch$1134 === 10 || ch$1134 === 13 || ch$1134 === 8232 || ch$1134 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$984(ch$1135) {
        return ch$1135 === 36 || ch$1135 === 95 || ch$1135 >= 65 && ch$1135 <= 90 || ch$1135 >= 97 && ch$1135 <= 122 || ch$1135 === 92 || ch$1135 >= 128 && Regex$957.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1135));
    }
    function isIdentifierPart$985(ch$1136) {
        return ch$1136 === 36 || ch$1136 === 95 || ch$1136 >= 65 && ch$1136 <= 90 || ch$1136 >= 97 && ch$1136 <= 122 || ch$1136 >= 48 && ch$1136 <= 57 || ch$1136 === 92 || ch$1136 >= 128 && Regex$957.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1136));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$986(id$1137) {
        switch (id$1137) {
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
    function isStrictModeReservedWord$987(id$1138) {
        switch (id$1138) {
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
    function isRestrictedWord$988(id$1139) {
        return id$1139 === 'eval' || id$1139 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$989(id$1140) {
        if (strict$961 && isStrictModeReservedWord$987(id$1140)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1140.length) {
        case 2:
            return id$1140 === 'if' || id$1140 === 'in' || id$1140 === 'do';
        case 3:
            return id$1140 === 'var' || id$1140 === 'for' || id$1140 === 'new' || id$1140 === 'try' || id$1140 === 'let';
        case 4:
            return id$1140 === 'this' || id$1140 === 'else' || id$1140 === 'case' || id$1140 === 'void' || id$1140 === 'with' || id$1140 === 'enum';
        case 5:
            return id$1140 === 'while' || id$1140 === 'break' || id$1140 === 'catch' || id$1140 === 'throw' || id$1140 === 'const' || id$1140 === 'yield' || id$1140 === 'class' || id$1140 === 'super';
        case 6:
            return id$1140 === 'return' || id$1140 === 'typeof' || id$1140 === 'delete' || id$1140 === 'switch' || id$1140 === 'export' || id$1140 === 'import';
        case 7:
            return id$1140 === 'default' || id$1140 === 'finally' || id$1140 === 'extends';
        case 8:
            return id$1140 === 'function' || id$1140 === 'continue' || id$1140 === 'debugger';
        case 10:
            return id$1140 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$990() {
        var ch$1141, blockComment$1142, lineComment$1143;
        blockComment$1142 = false;
        lineComment$1143 = false;
        while (index$962 < length$969) {
            ch$1141 = source$960.charCodeAt(index$962);
            if (lineComment$1143) {
                ++index$962;
                if (isLineTerminator$983(ch$1141)) {
                    lineComment$1143 = false;
                    if (ch$1141 === 13 && source$960.charCodeAt(index$962) === 10) {
                        ++index$962;
                    }
                    ++lineNumber$963;
                    lineStart$964 = index$962;
                }
            } else if (blockComment$1142) {
                if (isLineTerminator$983(ch$1141)) {
                    if (ch$1141 === 13 && source$960.charCodeAt(index$962 + 1) === 10) {
                        ++index$962;
                    }
                    ++lineNumber$963;
                    ++index$962;
                    lineStart$964 = index$962;
                    if (index$962 >= length$969) {
                        throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1141 = source$960.charCodeAt(index$962++);
                    if (index$962 >= length$969) {
                        throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1141 === 42) {
                        ch$1141 = source$960.charCodeAt(index$962);
                        if (ch$1141 === 47) {
                            ++index$962;
                            blockComment$1142 = false;
                        }
                    }
                }
            } else if (ch$1141 === 47) {
                ch$1141 = source$960.charCodeAt(index$962 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1141 === 47) {
                    index$962 += 2;
                    lineComment$1143 = true;
                } else if (ch$1141 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$962 += 2;
                    blockComment$1142 = true;
                    if (index$962 >= length$969) {
                        throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$982(ch$1141)) {
                ++index$962;
            } else if (isLineTerminator$983(ch$1141)) {
                ++index$962;
                if (ch$1141 === 13 && source$960.charCodeAt(index$962) === 10) {
                    ++index$962;
                }
                ++lineNumber$963;
                lineStart$964 = index$962;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$991(prefix$1144) {
        var i$1145, len$1146, ch$1147, code$1148 = 0;
        len$1146 = prefix$1144 === 'u' ? 4 : 2;
        for (i$1145 = 0; i$1145 < len$1146; ++i$1145) {
            if (index$962 < length$969 && isHexDigit$980(source$960[index$962])) {
                ch$1147 = source$960[index$962++];
                code$1148 = code$1148 * 16 + '0123456789abcdef'.indexOf(ch$1147.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1148);
    }
    function scanUnicodeCodePointEscape$992() {
        var ch$1149, code$1150, cu1$1151, cu2$1152;
        ch$1149 = source$960[index$962];
        code$1150 = 0;
        // At least, one hex digit is required.
        if (ch$1149 === '}') {
            throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
        }
        while (index$962 < length$969) {
            ch$1149 = source$960[index$962++];
            if (!isHexDigit$980(ch$1149)) {
                break;
            }
            code$1150 = code$1150 * 16 + '0123456789abcdef'.indexOf(ch$1149.toLowerCase());
        }
        if (code$1150 > 1114111 || ch$1149 !== '}') {
            throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1150 <= 65535) {
            return String.fromCharCode(code$1150);
        }
        cu1$1151 = (code$1150 - 65536 >> 10) + 55296;
        cu2$1152 = (code$1150 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1151, cu2$1152);
    }
    function getEscapedIdentifier$993() {
        var ch$1153, id$1154;
        ch$1153 = source$960.charCodeAt(index$962++);
        id$1154 = String.fromCharCode(ch$1153);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1153 === 92) {
            if (source$960.charCodeAt(index$962) !== 117) {
                throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
            }
            ++index$962;
            ch$1153 = scanHexEscape$991('u');
            if (!ch$1153 || ch$1153 === '\\' || !isIdentifierStart$984(ch$1153.charCodeAt(0))) {
                throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
            }
            id$1154 = ch$1153;
        }
        while (index$962 < length$969) {
            ch$1153 = source$960.charCodeAt(index$962);
            if (!isIdentifierPart$985(ch$1153)) {
                break;
            }
            ++index$962;
            id$1154 += String.fromCharCode(ch$1153);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1153 === 92) {
                id$1154 = id$1154.substr(0, id$1154.length - 1);
                if (source$960.charCodeAt(index$962) !== 117) {
                    throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
                }
                ++index$962;
                ch$1153 = scanHexEscape$991('u');
                if (!ch$1153 || ch$1153 === '\\' || !isIdentifierPart$985(ch$1153.charCodeAt(0))) {
                    throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
                }
                id$1154 += ch$1153;
            }
        }
        return id$1154;
    }
    function getIdentifier$994() {
        var start$1155, ch$1156;
        start$1155 = index$962++;
        while (index$962 < length$969) {
            ch$1156 = source$960.charCodeAt(index$962);
            if (ch$1156 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$962 = start$1155;
                return getEscapedIdentifier$993();
            }
            if (isIdentifierPart$985(ch$1156)) {
                ++index$962;
            } else {
                break;
            }
        }
        return source$960.slice(start$1155, index$962);
    }
    function scanIdentifier$995() {
        var start$1157, id$1158, type$1159;
        start$1157 = index$962;
        // Backslash (char #92) starts an escaped character.
        id$1158 = source$960.charCodeAt(index$962) === 92 ? getEscapedIdentifier$993() : getIdentifier$994();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1158.length === 1) {
            type$1159 = Token$951.Identifier;
        } else if (isKeyword$989(id$1158)) {
            type$1159 = Token$951.Keyword;
        } else if (id$1158 === 'null') {
            type$1159 = Token$951.NullLiteral;
        } else if (id$1158 === 'true' || id$1158 === 'false') {
            type$1159 = Token$951.BooleanLiteral;
        } else {
            type$1159 = Token$951.Identifier;
        }
        return {
            type: type$1159,
            value: id$1158,
            lineNumber: lineNumber$963,
            lineStart: lineStart$964,
            range: [
                start$1157,
                index$962
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$996() {
        var start$1160 = index$962, code$1161 = source$960.charCodeAt(index$962), code2$1162, ch1$1163 = source$960[index$962], ch2$1164, ch3$1165, ch4$1166;
        switch (code$1161) {
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
            ++index$962;
            if (extra$976.tokenize) {
                if (code$1161 === 40) {
                    extra$976.openParenToken = extra$976.tokens.length;
                } else if (code$1161 === 123) {
                    extra$976.openCurlyToken = extra$976.tokens.length;
                }
            }
            return {
                type: Token$951.Punctuator,
                value: String.fromCharCode(code$1161),
                lineNumber: lineNumber$963,
                lineStart: lineStart$964,
                range: [
                    start$1160,
                    index$962
                ]
            };
        default:
            code2$1162 = source$960.charCodeAt(index$962 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1162 === 61) {
                switch (code$1161) {
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
                    index$962 += 2;
                    return {
                        type: Token$951.Punctuator,
                        value: String.fromCharCode(code$1161) + String.fromCharCode(code2$1162),
                        lineNumber: lineNumber$963,
                        lineStart: lineStart$964,
                        range: [
                            start$1160,
                            index$962
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$962 += 2;
                    // !== and ===
                    if (source$960.charCodeAt(index$962) === 61) {
                        ++index$962;
                    }
                    return {
                        type: Token$951.Punctuator,
                        value: source$960.slice(start$1160, index$962),
                        lineNumber: lineNumber$963,
                        lineStart: lineStart$964,
                        range: [
                            start$1160,
                            index$962
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1164 = source$960[index$962 + 1];
        ch3$1165 = source$960[index$962 + 2];
        ch4$1166 = source$960[index$962 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1163 === '>' && ch2$1164 === '>' && ch3$1165 === '>') {
            if (ch4$1166 === '=') {
                index$962 += 4;
                return {
                    type: Token$951.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$963,
                    lineStart: lineStart$964,
                    range: [
                        start$1160,
                        index$962
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1163 === '>' && ch2$1164 === '>' && ch3$1165 === '>') {
            index$962 += 3;
            return {
                type: Token$951.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$963,
                lineStart: lineStart$964,
                range: [
                    start$1160,
                    index$962
                ]
            };
        }
        if (ch1$1163 === '<' && ch2$1164 === '<' && ch3$1165 === '=') {
            index$962 += 3;
            return {
                type: Token$951.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$963,
                lineStart: lineStart$964,
                range: [
                    start$1160,
                    index$962
                ]
            };
        }
        if (ch1$1163 === '>' && ch2$1164 === '>' && ch3$1165 === '=') {
            index$962 += 3;
            return {
                type: Token$951.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$963,
                lineStart: lineStart$964,
                range: [
                    start$1160,
                    index$962
                ]
            };
        }
        if (ch1$1163 === '.' && ch2$1164 === '.' && ch3$1165 === '.') {
            index$962 += 3;
            return {
                type: Token$951.Punctuator,
                value: '...',
                lineNumber: lineNumber$963,
                lineStart: lineStart$964,
                range: [
                    start$1160,
                    index$962
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1163 === ch2$1164 && '+-<>&|'.indexOf(ch1$1163) >= 0) {
            index$962 += 2;
            return {
                type: Token$951.Punctuator,
                value: ch1$1163 + ch2$1164,
                lineNumber: lineNumber$963,
                lineStart: lineStart$964,
                range: [
                    start$1160,
                    index$962
                ]
            };
        }
        if (ch1$1163 === '=' && ch2$1164 === '>') {
            index$962 += 2;
            return {
                type: Token$951.Punctuator,
                value: '=>',
                lineNumber: lineNumber$963,
                lineStart: lineStart$964,
                range: [
                    start$1160,
                    index$962
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1163) >= 0) {
            ++index$962;
            return {
                type: Token$951.Punctuator,
                value: ch1$1163,
                lineNumber: lineNumber$963,
                lineStart: lineStart$964,
                range: [
                    start$1160,
                    index$962
                ]
            };
        }
        if (ch1$1163 === '.') {
            ++index$962;
            return {
                type: Token$951.Punctuator,
                value: ch1$1163,
                lineNumber: lineNumber$963,
                lineStart: lineStart$964,
                range: [
                    start$1160,
                    index$962
                ]
            };
        }
        throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$997(start$1167) {
        var number$1168 = '';
        while (index$962 < length$969) {
            if (!isHexDigit$980(source$960[index$962])) {
                break;
            }
            number$1168 += source$960[index$962++];
        }
        if (number$1168.length === 0) {
            throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$984(source$960.charCodeAt(index$962))) {
            throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$951.NumericLiteral,
            value: parseInt('0x' + number$1168, 16),
            lineNumber: lineNumber$963,
            lineStart: lineStart$964,
            range: [
                start$1167,
                index$962
            ]
        };
    }
    function scanOctalLiteral$998(prefix$1169, start$1170) {
        var number$1171, octal$1172;
        if (isOctalDigit$981(prefix$1169)) {
            octal$1172 = true;
            number$1171 = '0' + source$960[index$962++];
        } else {
            octal$1172 = false;
            ++index$962;
            number$1171 = '';
        }
        while (index$962 < length$969) {
            if (!isOctalDigit$981(source$960[index$962])) {
                break;
            }
            number$1171 += source$960[index$962++];
        }
        if (!octal$1172 && number$1171.length === 0) {
            // only 0o or 0O
            throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$984(source$960.charCodeAt(index$962)) || isDecimalDigit$979(source$960.charCodeAt(index$962))) {
            throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$951.NumericLiteral,
            value: parseInt(number$1171, 8),
            octal: octal$1172,
            lineNumber: lineNumber$963,
            lineStart: lineStart$964,
            range: [
                start$1170,
                index$962
            ]
        };
    }
    function scanNumericLiteral$999() {
        var number$1173, start$1174, ch$1175, octal$1176;
        ch$1175 = source$960[index$962];
        assert$977(isDecimalDigit$979(ch$1175.charCodeAt(0)) || ch$1175 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1174 = index$962;
        number$1173 = '';
        if (ch$1175 !== '.') {
            number$1173 = source$960[index$962++];
            ch$1175 = source$960[index$962];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1173 === '0') {
                if (ch$1175 === 'x' || ch$1175 === 'X') {
                    ++index$962;
                    return scanHexLiteral$997(start$1174);
                }
                if (ch$1175 === 'b' || ch$1175 === 'B') {
                    ++index$962;
                    number$1173 = '';
                    while (index$962 < length$969) {
                        ch$1175 = source$960[index$962];
                        if (ch$1175 !== '0' && ch$1175 !== '1') {
                            break;
                        }
                        number$1173 += source$960[index$962++];
                    }
                    if (number$1173.length === 0) {
                        // only 0b or 0B
                        throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$962 < length$969) {
                        ch$1175 = source$960.charCodeAt(index$962);
                        if (isIdentifierStart$984(ch$1175) || isDecimalDigit$979(ch$1175)) {
                            throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$951.NumericLiteral,
                        value: parseInt(number$1173, 2),
                        lineNumber: lineNumber$963,
                        lineStart: lineStart$964,
                        range: [
                            start$1174,
                            index$962
                        ]
                    };
                }
                if (ch$1175 === 'o' || ch$1175 === 'O' || isOctalDigit$981(ch$1175)) {
                    return scanOctalLiteral$998(ch$1175, start$1174);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1175 && isDecimalDigit$979(ch$1175.charCodeAt(0))) {
                    throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$979(source$960.charCodeAt(index$962))) {
                number$1173 += source$960[index$962++];
            }
            ch$1175 = source$960[index$962];
        }
        if (ch$1175 === '.') {
            number$1173 += source$960[index$962++];
            while (isDecimalDigit$979(source$960.charCodeAt(index$962))) {
                number$1173 += source$960[index$962++];
            }
            ch$1175 = source$960[index$962];
        }
        if (ch$1175 === 'e' || ch$1175 === 'E') {
            number$1173 += source$960[index$962++];
            ch$1175 = source$960[index$962];
            if (ch$1175 === '+' || ch$1175 === '-') {
                number$1173 += source$960[index$962++];
            }
            if (isDecimalDigit$979(source$960.charCodeAt(index$962))) {
                while (isDecimalDigit$979(source$960.charCodeAt(index$962))) {
                    number$1173 += source$960[index$962++];
                }
            } else {
                throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$984(source$960.charCodeAt(index$962))) {
            throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$951.NumericLiteral,
            value: parseFloat(number$1173),
            lineNumber: lineNumber$963,
            lineStart: lineStart$964,
            range: [
                start$1174,
                index$962
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$1000() {
        var str$1177 = '', quote$1178, start$1179, ch$1180, code$1181, unescaped$1182, restore$1183, octal$1184 = false;
        quote$1178 = source$960[index$962];
        assert$977(quote$1178 === '\'' || quote$1178 === '"', 'String literal must starts with a quote');
        start$1179 = index$962;
        ++index$962;
        while (index$962 < length$969) {
            ch$1180 = source$960[index$962++];
            if (ch$1180 === quote$1178) {
                quote$1178 = '';
                break;
            } else if (ch$1180 === '\\') {
                ch$1180 = source$960[index$962++];
                if (!ch$1180 || !isLineTerminator$983(ch$1180.charCodeAt(0))) {
                    switch (ch$1180) {
                    case 'n':
                        str$1177 += '\n';
                        break;
                    case 'r':
                        str$1177 += '\r';
                        break;
                    case 't':
                        str$1177 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$960[index$962] === '{') {
                            ++index$962;
                            str$1177 += scanUnicodeCodePointEscape$992();
                        } else {
                            restore$1183 = index$962;
                            unescaped$1182 = scanHexEscape$991(ch$1180);
                            if (unescaped$1182) {
                                str$1177 += unescaped$1182;
                            } else {
                                index$962 = restore$1183;
                                str$1177 += ch$1180;
                            }
                        }
                        break;
                    case 'b':
                        str$1177 += '\b';
                        break;
                    case 'f':
                        str$1177 += '\f';
                        break;
                    case 'v':
                        str$1177 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$981(ch$1180)) {
                            code$1181 = '01234567'.indexOf(ch$1180);
                            // \0 is not octal escape sequence
                            if (code$1181 !== 0) {
                                octal$1184 = true;
                            }
                            if (index$962 < length$969 && isOctalDigit$981(source$960[index$962])) {
                                octal$1184 = true;
                                code$1181 = code$1181 * 8 + '01234567'.indexOf(source$960[index$962++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1180) >= 0 && index$962 < length$969 && isOctalDigit$981(source$960[index$962])) {
                                    code$1181 = code$1181 * 8 + '01234567'.indexOf(source$960[index$962++]);
                                }
                            }
                            str$1177 += String.fromCharCode(code$1181);
                        } else {
                            str$1177 += ch$1180;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$963;
                    if (ch$1180 === '\r' && source$960[index$962] === '\n') {
                        ++index$962;
                    }
                }
            } else if (isLineTerminator$983(ch$1180.charCodeAt(0))) {
                break;
            } else {
                str$1177 += ch$1180;
            }
        }
        if (quote$1178 !== '') {
            throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$951.StringLiteral,
            value: str$1177,
            octal: octal$1184,
            lineNumber: lineNumber$963,
            lineStart: lineStart$964,
            range: [
                start$1179,
                index$962
            ]
        };
    }
    function scanTemplate$1001() {
        var cooked$1185 = '', ch$1186, start$1187, terminated$1188, tail$1189, restore$1190, unescaped$1191, code$1192, octal$1193;
        terminated$1188 = false;
        tail$1189 = false;
        start$1187 = index$962;
        ++index$962;
        while (index$962 < length$969) {
            ch$1186 = source$960[index$962++];
            if (ch$1186 === '`') {
                tail$1189 = true;
                terminated$1188 = true;
                break;
            } else if (ch$1186 === '$') {
                if (source$960[index$962] === '{') {
                    ++index$962;
                    terminated$1188 = true;
                    break;
                }
                cooked$1185 += ch$1186;
            } else if (ch$1186 === '\\') {
                ch$1186 = source$960[index$962++];
                if (!isLineTerminator$983(ch$1186.charCodeAt(0))) {
                    switch (ch$1186) {
                    case 'n':
                        cooked$1185 += '\n';
                        break;
                    case 'r':
                        cooked$1185 += '\r';
                        break;
                    case 't':
                        cooked$1185 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$960[index$962] === '{') {
                            ++index$962;
                            cooked$1185 += scanUnicodeCodePointEscape$992();
                        } else {
                            restore$1190 = index$962;
                            unescaped$1191 = scanHexEscape$991(ch$1186);
                            if (unescaped$1191) {
                                cooked$1185 += unescaped$1191;
                            } else {
                                index$962 = restore$1190;
                                cooked$1185 += ch$1186;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1185 += '\b';
                        break;
                    case 'f':
                        cooked$1185 += '\f';
                        break;
                    case 'v':
                        cooked$1185 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$981(ch$1186)) {
                            code$1192 = '01234567'.indexOf(ch$1186);
                            // \0 is not octal escape sequence
                            if (code$1192 !== 0) {
                                octal$1193 = true;
                            }
                            if (index$962 < length$969 && isOctalDigit$981(source$960[index$962])) {
                                octal$1193 = true;
                                code$1192 = code$1192 * 8 + '01234567'.indexOf(source$960[index$962++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1186) >= 0 && index$962 < length$969 && isOctalDigit$981(source$960[index$962])) {
                                    code$1192 = code$1192 * 8 + '01234567'.indexOf(source$960[index$962++]);
                                }
                            }
                            cooked$1185 += String.fromCharCode(code$1192);
                        } else {
                            cooked$1185 += ch$1186;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$963;
                    if (ch$1186 === '\r' && source$960[index$962] === '\n') {
                        ++index$962;
                    }
                }
            } else if (isLineTerminator$983(ch$1186.charCodeAt(0))) {
                ++lineNumber$963;
                if (ch$1186 === '\r' && source$960[index$962] === '\n') {
                    ++index$962;
                }
                cooked$1185 += '\n';
            } else {
                cooked$1185 += ch$1186;
            }
        }
        if (!terminated$1188) {
            throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$951.Template,
            value: {
                cooked: cooked$1185,
                raw: source$960.slice(start$1187 + 1, index$962 - (tail$1189 ? 1 : 2))
            },
            tail: tail$1189,
            octal: octal$1193,
            lineNumber: lineNumber$963,
            lineStart: lineStart$964,
            range: [
                start$1187,
                index$962
            ]
        };
    }
    function scanTemplateElement$1002(option$1194) {
        var startsWith$1195, template$1196;
        lookahead$973 = null;
        skipComment$990();
        startsWith$1195 = option$1194.head ? '`' : '}';
        if (source$960[index$962] !== startsWith$1195) {
            throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
        }
        template$1196 = scanTemplate$1001();
        peek$1008();
        return template$1196;
    }
    function scanRegExp$1003() {
        var str$1197, ch$1198, start$1199, pattern$1200, flags$1201, value$1202, classMarker$1203 = false, restore$1204, terminated$1205 = false;
        lookahead$973 = null;
        skipComment$990();
        start$1199 = index$962;
        ch$1198 = source$960[index$962];
        assert$977(ch$1198 === '/', 'Regular expression literal must start with a slash');
        str$1197 = source$960[index$962++];
        while (index$962 < length$969) {
            ch$1198 = source$960[index$962++];
            str$1197 += ch$1198;
            if (classMarker$1203) {
                if (ch$1198 === ']') {
                    classMarker$1203 = false;
                }
            } else {
                if (ch$1198 === '\\') {
                    ch$1198 = source$960[index$962++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$983(ch$1198.charCodeAt(0))) {
                        throwError$1011({}, Messages$956.UnterminatedRegExp);
                    }
                    str$1197 += ch$1198;
                } else if (ch$1198 === '/') {
                    terminated$1205 = true;
                    break;
                } else if (ch$1198 === '[') {
                    classMarker$1203 = true;
                } else if (isLineTerminator$983(ch$1198.charCodeAt(0))) {
                    throwError$1011({}, Messages$956.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1205) {
            throwError$1011({}, Messages$956.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1200 = str$1197.substr(1, str$1197.length - 2);
        flags$1201 = '';
        while (index$962 < length$969) {
            ch$1198 = source$960[index$962];
            if (!isIdentifierPart$985(ch$1198.charCodeAt(0))) {
                break;
            }
            ++index$962;
            if (ch$1198 === '\\' && index$962 < length$969) {
                ch$1198 = source$960[index$962];
                if (ch$1198 === 'u') {
                    ++index$962;
                    restore$1204 = index$962;
                    ch$1198 = scanHexEscape$991('u');
                    if (ch$1198) {
                        flags$1201 += ch$1198;
                        for (str$1197 += '\\u'; restore$1204 < index$962; ++restore$1204) {
                            str$1197 += source$960[restore$1204];
                        }
                    } else {
                        index$962 = restore$1204;
                        flags$1201 += 'u';
                        str$1197 += '\\u';
                    }
                } else {
                    str$1197 += '\\';
                }
            } else {
                flags$1201 += ch$1198;
                str$1197 += ch$1198;
            }
        }
        try {
            value$1202 = new RegExp(pattern$1200, flags$1201);
        } catch (e$1206) {
            throwError$1011({}, Messages$956.InvalidRegExp);
        }
        // peek();
        if (extra$976.tokenize) {
            return {
                type: Token$951.RegularExpression,
                value: value$1202,
                lineNumber: lineNumber$963,
                lineStart: lineStart$964,
                range: [
                    start$1199,
                    index$962
                ]
            };
        }
        return {
            type: Token$951.RegularExpression,
            literal: str$1197,
            value: value$1202,
            range: [
                start$1199,
                index$962
            ]
        };
    }
    function isIdentifierName$1004(token$1207) {
        return token$1207.type === Token$951.Identifier || token$1207.type === Token$951.Keyword || token$1207.type === Token$951.BooleanLiteral || token$1207.type === Token$951.NullLiteral;
    }
    function advanceSlash$1005() {
        var prevToken$1208, checkToken$1209;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1208 = extra$976.tokens[extra$976.tokens.length - 1];
        if (!prevToken$1208) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$1003();
        }
        if (prevToken$1208.type === 'Punctuator') {
            if (prevToken$1208.value === ')') {
                checkToken$1209 = extra$976.tokens[extra$976.openParenToken - 1];
                if (checkToken$1209 && checkToken$1209.type === 'Keyword' && (checkToken$1209.value === 'if' || checkToken$1209.value === 'while' || checkToken$1209.value === 'for' || checkToken$1209.value === 'with')) {
                    return scanRegExp$1003();
                }
                return scanPunctuator$996();
            }
            if (prevToken$1208.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$976.tokens[extra$976.openCurlyToken - 3] && extra$976.tokens[extra$976.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1209 = extra$976.tokens[extra$976.openCurlyToken - 4];
                    if (!checkToken$1209) {
                        return scanPunctuator$996();
                    }
                } else if (extra$976.tokens[extra$976.openCurlyToken - 4] && extra$976.tokens[extra$976.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1209 = extra$976.tokens[extra$976.openCurlyToken - 5];
                    if (!checkToken$1209) {
                        return scanRegExp$1003();
                    }
                } else {
                    return scanPunctuator$996();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$953.indexOf(checkToken$1209.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$996();
                }
                // It is a declaration.
                return scanRegExp$1003();
            }
            return scanRegExp$1003();
        }
        if (prevToken$1208.type === 'Keyword') {
            return scanRegExp$1003();
        }
        return scanPunctuator$996();
    }
    function advance$1006() {
        var ch$1210;
        skipComment$990();
        if (index$962 >= length$969) {
            return {
                type: Token$951.EOF,
                lineNumber: lineNumber$963,
                lineStart: lineStart$964,
                range: [
                    index$962,
                    index$962
                ]
            };
        }
        ch$1210 = source$960.charCodeAt(index$962);
        // Very common: ( and ) and ;
        if (ch$1210 === 40 || ch$1210 === 41 || ch$1210 === 58) {
            return scanPunctuator$996();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1210 === 39 || ch$1210 === 34) {
            return scanStringLiteral$1000();
        }
        if (ch$1210 === 96) {
            return scanTemplate$1001();
        }
        if (isIdentifierStart$984(ch$1210)) {
            return scanIdentifier$995();
        }
        // # and @ are allowed for sweet.js
        if (ch$1210 === 35 || ch$1210 === 64) {
            ++index$962;
            return {
                type: Token$951.Punctuator,
                value: String.fromCharCode(ch$1210),
                lineNumber: lineNumber$963,
                lineStart: lineStart$964,
                range: [
                    index$962 - 1,
                    index$962
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1210 === 46) {
            if (isDecimalDigit$979(source$960.charCodeAt(index$962 + 1))) {
                return scanNumericLiteral$999();
            }
            return scanPunctuator$996();
        }
        if (isDecimalDigit$979(ch$1210)) {
            return scanNumericLiteral$999();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$976.tokenize && ch$1210 === 47) {
            return advanceSlash$1005();
        }
        return scanPunctuator$996();
    }
    function lex$1007() {
        var token$1211;
        token$1211 = lookahead$973;
        streamIndex$972 = lookaheadIndex$974;
        lineNumber$963 = token$1211.lineNumber;
        lineStart$964 = token$1211.lineStart;
        sm_lineNumber$965 = lookahead$973.sm_lineNumber;
        sm_lineStart$966 = lookahead$973.sm_lineStart;
        sm_range$967 = lookahead$973.sm_range;
        sm_index$968 = lookahead$973.sm_range[0];
        lookahead$973 = tokenStream$971[++streamIndex$972].token;
        lookaheadIndex$974 = streamIndex$972;
        index$962 = lookahead$973.range[0];
        return token$1211;
    }
    function peek$1008() {
        lookaheadIndex$974 = streamIndex$972 + 1;
        if (lookaheadIndex$974 >= length$969) {
            lookahead$973 = {
                type: Token$951.EOF,
                lineNumber: lineNumber$963,
                lineStart: lineStart$964,
                range: [
                    index$962,
                    index$962
                ]
            };
            return;
        }
        lookahead$973 = tokenStream$971[lookaheadIndex$974].token;
        index$962 = lookahead$973.range[0];
    }
    function lookahead2$1009() {
        var adv$1212, pos$1213, line$1214, start$1215, result$1216;
        if (streamIndex$972 + 1 >= length$969 || streamIndex$972 + 2 >= length$969) {
            return {
                type: Token$951.EOF,
                lineNumber: lineNumber$963,
                lineStart: lineStart$964,
                range: [
                    index$962,
                    index$962
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$973 === null) {
            lookaheadIndex$974 = streamIndex$972 + 1;
            lookahead$973 = tokenStream$971[lookaheadIndex$974].token;
            index$962 = lookahead$973.range[0];
        }
        result$1216 = tokenStream$971[lookaheadIndex$974 + 1].token;
        return result$1216;
    }
    SyntaxTreeDelegate$958 = {
        name: 'SyntaxTree',
        postProcess: function (node$1217) {
            return node$1217;
        },
        createArrayExpression: function (elements$1218) {
            return {
                type: Syntax$954.ArrayExpression,
                elements: elements$1218
            };
        },
        createAssignmentExpression: function (operator$1219, left$1220, right$1221) {
            return {
                type: Syntax$954.AssignmentExpression,
                operator: operator$1219,
                left: left$1220,
                right: right$1221
            };
        },
        createBinaryExpression: function (operator$1222, left$1223, right$1224) {
            var type$1225 = operator$1222 === '||' || operator$1222 === '&&' ? Syntax$954.LogicalExpression : Syntax$954.BinaryExpression;
            return {
                type: type$1225,
                operator: operator$1222,
                left: left$1223,
                right: right$1224
            };
        },
        createBlockStatement: function (body$1226) {
            return {
                type: Syntax$954.BlockStatement,
                body: body$1226
            };
        },
        createBreakStatement: function (label$1227) {
            return {
                type: Syntax$954.BreakStatement,
                label: label$1227
            };
        },
        createCallExpression: function (callee$1228, args$1229) {
            return {
                type: Syntax$954.CallExpression,
                callee: callee$1228,
                'arguments': args$1229
            };
        },
        createCatchClause: function (param$1230, body$1231) {
            return {
                type: Syntax$954.CatchClause,
                param: param$1230,
                body: body$1231
            };
        },
        createConditionalExpression: function (test$1232, consequent$1233, alternate$1234) {
            return {
                type: Syntax$954.ConditionalExpression,
                test: test$1232,
                consequent: consequent$1233,
                alternate: alternate$1234
            };
        },
        createContinueStatement: function (label$1235) {
            return {
                type: Syntax$954.ContinueStatement,
                label: label$1235
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$954.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1236, test$1237) {
            return {
                type: Syntax$954.DoWhileStatement,
                body: body$1236,
                test: test$1237
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$954.EmptyStatement };
        },
        createExpressionStatement: function (expression$1238) {
            return {
                type: Syntax$954.ExpressionStatement,
                expression: expression$1238
            };
        },
        createForStatement: function (init$1239, test$1240, update$1241, body$1242) {
            return {
                type: Syntax$954.ForStatement,
                init: init$1239,
                test: test$1240,
                update: update$1241,
                body: body$1242
            };
        },
        createForInStatement: function (left$1243, right$1244, body$1245) {
            return {
                type: Syntax$954.ForInStatement,
                left: left$1243,
                right: right$1244,
                body: body$1245,
                each: false
            };
        },
        createForOfStatement: function (left$1246, right$1247, body$1248) {
            return {
                type: Syntax$954.ForOfStatement,
                left: left$1246,
                right: right$1247,
                body: body$1248
            };
        },
        createFunctionDeclaration: function (id$1249, params$1250, defaults$1251, body$1252, rest$1253, generator$1254, expression$1255) {
            return {
                type: Syntax$954.FunctionDeclaration,
                id: id$1249,
                params: params$1250,
                defaults: defaults$1251,
                body: body$1252,
                rest: rest$1253,
                generator: generator$1254,
                expression: expression$1255
            };
        },
        createFunctionExpression: function (id$1256, params$1257, defaults$1258, body$1259, rest$1260, generator$1261, expression$1262) {
            return {
                type: Syntax$954.FunctionExpression,
                id: id$1256,
                params: params$1257,
                defaults: defaults$1258,
                body: body$1259,
                rest: rest$1260,
                generator: generator$1261,
                expression: expression$1262
            };
        },
        createIdentifier: function (name$1263) {
            return {
                type: Syntax$954.Identifier,
                name: name$1263
            };
        },
        createIfStatement: function (test$1264, consequent$1265, alternate$1266) {
            return {
                type: Syntax$954.IfStatement,
                test: test$1264,
                consequent: consequent$1265,
                alternate: alternate$1266
            };
        },
        createLabeledStatement: function (label$1267, body$1268) {
            return {
                type: Syntax$954.LabeledStatement,
                label: label$1267,
                body: body$1268
            };
        },
        createLiteral: function (token$1269) {
            return {
                type: Syntax$954.Literal,
                value: token$1269.value,
                raw: String(token$1269.value)
            };
        },
        createMemberExpression: function (accessor$1270, object$1271, property$1272) {
            return {
                type: Syntax$954.MemberExpression,
                computed: accessor$1270 === '[',
                object: object$1271,
                property: property$1272
            };
        },
        createNewExpression: function (callee$1273, args$1274) {
            return {
                type: Syntax$954.NewExpression,
                callee: callee$1273,
                'arguments': args$1274
            };
        },
        createObjectExpression: function (properties$1275) {
            return {
                type: Syntax$954.ObjectExpression,
                properties: properties$1275
            };
        },
        createPostfixExpression: function (operator$1276, argument$1277) {
            return {
                type: Syntax$954.UpdateExpression,
                operator: operator$1276,
                argument: argument$1277,
                prefix: false
            };
        },
        createProgram: function (body$1278) {
            return {
                type: Syntax$954.Program,
                body: body$1278
            };
        },
        createProperty: function (kind$1279, key$1280, value$1281, method$1282, shorthand$1283) {
            return {
                type: Syntax$954.Property,
                key: key$1280,
                value: value$1281,
                kind: kind$1279,
                method: method$1282,
                shorthand: shorthand$1283
            };
        },
        createReturnStatement: function (argument$1284) {
            return {
                type: Syntax$954.ReturnStatement,
                argument: argument$1284
            };
        },
        createSequenceExpression: function (expressions$1285) {
            return {
                type: Syntax$954.SequenceExpression,
                expressions: expressions$1285
            };
        },
        createSwitchCase: function (test$1286, consequent$1287) {
            return {
                type: Syntax$954.SwitchCase,
                test: test$1286,
                consequent: consequent$1287
            };
        },
        createSwitchStatement: function (discriminant$1288, cases$1289) {
            return {
                type: Syntax$954.SwitchStatement,
                discriminant: discriminant$1288,
                cases: cases$1289
            };
        },
        createThisExpression: function () {
            return { type: Syntax$954.ThisExpression };
        },
        createThrowStatement: function (argument$1290) {
            return {
                type: Syntax$954.ThrowStatement,
                argument: argument$1290
            };
        },
        createTryStatement: function (block$1291, guardedHandlers$1292, handlers$1293, finalizer$1294) {
            return {
                type: Syntax$954.TryStatement,
                block: block$1291,
                guardedHandlers: guardedHandlers$1292,
                handlers: handlers$1293,
                finalizer: finalizer$1294
            };
        },
        createUnaryExpression: function (operator$1295, argument$1296) {
            if (operator$1295 === '++' || operator$1295 === '--') {
                return {
                    type: Syntax$954.UpdateExpression,
                    operator: operator$1295,
                    argument: argument$1296,
                    prefix: true
                };
            }
            return {
                type: Syntax$954.UnaryExpression,
                operator: operator$1295,
                argument: argument$1296
            };
        },
        createVariableDeclaration: function (declarations$1297, kind$1298) {
            return {
                type: Syntax$954.VariableDeclaration,
                declarations: declarations$1297,
                kind: kind$1298
            };
        },
        createVariableDeclarator: function (id$1299, init$1300) {
            return {
                type: Syntax$954.VariableDeclarator,
                id: id$1299,
                init: init$1300
            };
        },
        createWhileStatement: function (test$1301, body$1302) {
            return {
                type: Syntax$954.WhileStatement,
                test: test$1301,
                body: body$1302
            };
        },
        createWithStatement: function (object$1303, body$1304) {
            return {
                type: Syntax$954.WithStatement,
                object: object$1303,
                body: body$1304
            };
        },
        createTemplateElement: function (value$1305, tail$1306) {
            return {
                type: Syntax$954.TemplateElement,
                value: value$1305,
                tail: tail$1306
            };
        },
        createTemplateLiteral: function (quasis$1307, expressions$1308) {
            return {
                type: Syntax$954.TemplateLiteral,
                quasis: quasis$1307,
                expressions: expressions$1308
            };
        },
        createSpreadElement: function (argument$1309) {
            return {
                type: Syntax$954.SpreadElement,
                argument: argument$1309
            };
        },
        createTaggedTemplateExpression: function (tag$1310, quasi$1311) {
            return {
                type: Syntax$954.TaggedTemplateExpression,
                tag: tag$1310,
                quasi: quasi$1311
            };
        },
        createArrowFunctionExpression: function (params$1312, defaults$1313, body$1314, rest$1315, expression$1316) {
            return {
                type: Syntax$954.ArrowFunctionExpression,
                id: null,
                params: params$1312,
                defaults: defaults$1313,
                body: body$1314,
                rest: rest$1315,
                generator: false,
                expression: expression$1316
            };
        },
        createMethodDefinition: function (propertyType$1317, kind$1318, key$1319, value$1320) {
            return {
                type: Syntax$954.MethodDefinition,
                key: key$1319,
                value: value$1320,
                kind: kind$1318,
                'static': propertyType$1317 === ClassPropertyType$959.static
            };
        },
        createClassBody: function (body$1321) {
            return {
                type: Syntax$954.ClassBody,
                body: body$1321
            };
        },
        createClassExpression: function (id$1322, superClass$1323, body$1324) {
            return {
                type: Syntax$954.ClassExpression,
                id: id$1322,
                superClass: superClass$1323,
                body: body$1324
            };
        },
        createClassDeclaration: function (id$1325, superClass$1326, body$1327) {
            return {
                type: Syntax$954.ClassDeclaration,
                id: id$1325,
                superClass: superClass$1326,
                body: body$1327
            };
        },
        createExportSpecifier: function (id$1328, name$1329) {
            return {
                type: Syntax$954.ExportSpecifier,
                id: id$1328,
                name: name$1329
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$954.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1330, specifiers$1331, source$1332) {
            return {
                type: Syntax$954.ExportDeclaration,
                declaration: declaration$1330,
                specifiers: specifiers$1331,
                source: source$1332
            };
        },
        createImportSpecifier: function (id$1333, name$1334) {
            return {
                type: Syntax$954.ImportSpecifier,
                id: id$1333,
                name: name$1334
            };
        },
        createImportDeclaration: function (specifiers$1335, kind$1336, source$1337) {
            return {
                type: Syntax$954.ImportDeclaration,
                specifiers: specifiers$1335,
                kind: kind$1336,
                source: source$1337
            };
        },
        createYieldExpression: function (argument$1338, delegate$1339) {
            return {
                type: Syntax$954.YieldExpression,
                argument: argument$1338,
                delegate: delegate$1339
            };
        },
        createModuleDeclaration: function (id$1340, source$1341, body$1342) {
            return {
                type: Syntax$954.ModuleDeclaration,
                id: id$1340,
                source: source$1341,
                body: body$1342
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$1010() {
        return lookahead$973.lineNumber !== lineNumber$963;
    }
    // Throw an exception
    function throwError$1011(token$1343, messageFormat$1344) {
        var error$1345, args$1346 = Array.prototype.slice.call(arguments, 2), msg$1347 = messageFormat$1344.replace(/%(\d)/g, function (whole$1351, index$1352) {
                assert$977(index$1352 < args$1346.length, 'Message reference must be in range');
                return args$1346[index$1352];
            });
        var startIndex$1348 = streamIndex$972 > 3 ? streamIndex$972 - 3 : 0;
        var toks$1349 = tokenStream$971.slice(startIndex$1348, streamIndex$972 + 3).map(function (stx$1353) {
                return stx$1353.token.value;
            }).join(' ');
        var tailingMsg$1350 = '\n[... ' + toks$1349 + ' ...]';
        if (typeof token$1343.lineNumber === 'number') {
            error$1345 = new Error('Line ' + token$1343.lineNumber + ': ' + msg$1347 + tailingMsg$1350);
            error$1345.index = token$1343.range[0];
            error$1345.lineNumber = token$1343.lineNumber;
            error$1345.column = token$1343.range[0] - lineStart$964 + 1;
        } else {
            error$1345 = new Error('Line ' + lineNumber$963 + ': ' + msg$1347 + tailingMsg$1350);
            error$1345.index = index$962;
            error$1345.lineNumber = lineNumber$963;
            error$1345.column = index$962 - lineStart$964 + 1;
        }
        error$1345.description = msg$1347;
        throw error$1345;
    }
    function throwErrorTolerant$1012() {
        try {
            throwError$1011.apply(null, arguments);
        } catch (e$1354) {
            if (extra$976.errors) {
                extra$976.errors.push(e$1354);
            } else {
                throw e$1354;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$1013(token$1355) {
        if (token$1355.type === Token$951.EOF) {
            throwError$1011(token$1355, Messages$956.UnexpectedEOS);
        }
        if (token$1355.type === Token$951.NumericLiteral) {
            throwError$1011(token$1355, Messages$956.UnexpectedNumber);
        }
        if (token$1355.type === Token$951.StringLiteral) {
            throwError$1011(token$1355, Messages$956.UnexpectedString);
        }
        if (token$1355.type === Token$951.Identifier) {
            throwError$1011(token$1355, Messages$956.UnexpectedIdentifier);
        }
        if (token$1355.type === Token$951.Keyword) {
            if (isFutureReservedWord$986(token$1355.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$961 && isStrictModeReservedWord$987(token$1355.value)) {
                throwErrorTolerant$1012(token$1355, Messages$956.StrictReservedWord);
                return;
            }
            throwError$1011(token$1355, Messages$956.UnexpectedToken, token$1355.value);
        }
        if (token$1355.type === Token$951.Template) {
            throwError$1011(token$1355, Messages$956.UnexpectedTemplate, token$1355.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$1011(token$1355, Messages$956.UnexpectedToken, token$1355.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$1014(value$1356) {
        var token$1357 = lex$1007();
        if (token$1357.type !== Token$951.Punctuator || token$1357.value !== value$1356) {
            throwUnexpected$1013(token$1357);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$1015(keyword$1358) {
        var token$1359 = lex$1007();
        if (token$1359.type !== Token$951.Keyword || token$1359.value !== keyword$1358) {
            throwUnexpected$1013(token$1359);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$1016(value$1360) {
        return lookahead$973.type === Token$951.Punctuator && lookahead$973.value === value$1360;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$1017(keyword$1361) {
        return lookahead$973.type === Token$951.Keyword && lookahead$973.value === keyword$1361;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$1018(keyword$1362) {
        return lookahead$973.type === Token$951.Identifier && lookahead$973.value === keyword$1362;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$1019() {
        var op$1363;
        if (lookahead$973.type !== Token$951.Punctuator) {
            return false;
        }
        op$1363 = lookahead$973.value;
        return op$1363 === '=' || op$1363 === '*=' || op$1363 === '/=' || op$1363 === '%=' || op$1363 === '+=' || op$1363 === '-=' || op$1363 === '<<=' || op$1363 === '>>=' || op$1363 === '>>>=' || op$1363 === '&=' || op$1363 === '^=' || op$1363 === '|=';
    }
    function consumeSemicolon$1020() {
        var line$1364, ch$1365;
        ch$1365 = lookahead$973.value ? String(lookahead$973.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1365 === 59) {
            lex$1007();
            return;
        }
        if (lookahead$973.lineNumber !== lineNumber$963) {
            return;
        }
        if (match$1016(';')) {
            lex$1007();
            return;
        }
        if (lookahead$973.type !== Token$951.EOF && !match$1016('}')) {
            throwUnexpected$1013(lookahead$973);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$1021(expr$1366) {
        return expr$1366.type === Syntax$954.Identifier || expr$1366.type === Syntax$954.MemberExpression;
    }
    function isAssignableLeftHandSide$1022(expr$1367) {
        return isLeftHandSide$1021(expr$1367) || expr$1367.type === Syntax$954.ObjectPattern || expr$1367.type === Syntax$954.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$1023() {
        var elements$1368 = [], blocks$1369 = [], filter$1370 = null, tmp$1371, possiblecomprehension$1372 = true, body$1373;
        expect$1014('[');
        while (!match$1016(']')) {
            if (lookahead$973.value === 'for' && lookahead$973.type === Token$951.Keyword) {
                if (!possiblecomprehension$1372) {
                    throwError$1011({}, Messages$956.ComprehensionError);
                }
                matchKeyword$1017('for');
                tmp$1371 = parseForStatement$1071({ ignoreBody: true });
                tmp$1371.of = tmp$1371.type === Syntax$954.ForOfStatement;
                tmp$1371.type = Syntax$954.ComprehensionBlock;
                if (tmp$1371.left.kind) {
                    // can't be let or const
                    throwError$1011({}, Messages$956.ComprehensionError);
                }
                blocks$1369.push(tmp$1371);
            } else if (lookahead$973.value === 'if' && lookahead$973.type === Token$951.Keyword) {
                if (!possiblecomprehension$1372) {
                    throwError$1011({}, Messages$956.ComprehensionError);
                }
                expectKeyword$1015('if');
                expect$1014('(');
                filter$1370 = parseExpression$1051();
                expect$1014(')');
            } else if (lookahead$973.value === ',' && lookahead$973.type === Token$951.Punctuator) {
                possiblecomprehension$1372 = false;
                // no longer allowed.
                lex$1007();
                elements$1368.push(null);
            } else {
                tmp$1371 = parseSpreadOrAssignmentExpression$1034();
                elements$1368.push(tmp$1371);
                if (tmp$1371 && tmp$1371.type === Syntax$954.SpreadElement) {
                    if (!match$1016(']')) {
                        throwError$1011({}, Messages$956.ElementAfterSpreadElement);
                    }
                } else if (!(match$1016(']') || matchKeyword$1017('for') || matchKeyword$1017('if'))) {
                    expect$1014(',');
                    // this lexes.
                    possiblecomprehension$1372 = false;
                }
            }
        }
        expect$1014(']');
        if (filter$1370 && !blocks$1369.length) {
            throwError$1011({}, Messages$956.ComprehensionRequiresBlock);
        }
        if (blocks$1369.length) {
            if (elements$1368.length !== 1) {
                throwError$1011({}, Messages$956.ComprehensionError);
            }
            return {
                type: Syntax$954.ComprehensionExpression,
                filter: filter$1370,
                blocks: blocks$1369,
                body: elements$1368[0]
            };
        }
        return delegate$970.createArrayExpression(elements$1368);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$1024(options$1374) {
        var previousStrict$1375, previousYieldAllowed$1376, params$1377, defaults$1378, body$1379;
        previousStrict$1375 = strict$961;
        previousYieldAllowed$1376 = state$975.yieldAllowed;
        state$975.yieldAllowed = options$1374.generator;
        params$1377 = options$1374.params || [];
        defaults$1378 = options$1374.defaults || [];
        body$1379 = parseConciseBody$1083();
        if (options$1374.name && strict$961 && isRestrictedWord$988(params$1377[0].name)) {
            throwErrorTolerant$1012(options$1374.name, Messages$956.StrictParamName);
        }
        if (state$975.yieldAllowed && !state$975.yieldFound) {
            throwErrorTolerant$1012({}, Messages$956.NoYieldInGenerator);
        }
        strict$961 = previousStrict$1375;
        state$975.yieldAllowed = previousYieldAllowed$1376;
        return delegate$970.createFunctionExpression(null, params$1377, defaults$1378, body$1379, options$1374.rest || null, options$1374.generator, body$1379.type !== Syntax$954.BlockStatement);
    }
    function parsePropertyMethodFunction$1025(options$1380) {
        var previousStrict$1381, tmp$1382, method$1383;
        previousStrict$1381 = strict$961;
        strict$961 = true;
        tmp$1382 = parseParams$1087();
        if (tmp$1382.stricted) {
            throwErrorTolerant$1012(tmp$1382.stricted, tmp$1382.message);
        }
        method$1383 = parsePropertyFunction$1024({
            params: tmp$1382.params,
            defaults: tmp$1382.defaults,
            rest: tmp$1382.rest,
            generator: options$1380.generator
        });
        strict$961 = previousStrict$1381;
        return method$1383;
    }
    function parseObjectPropertyKey$1026() {
        var token$1384 = lex$1007();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1384.type === Token$951.StringLiteral || token$1384.type === Token$951.NumericLiteral) {
            if (strict$961 && token$1384.octal) {
                throwErrorTolerant$1012(token$1384, Messages$956.StrictOctalLiteral);
            }
            return delegate$970.createLiteral(token$1384);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$970.createIdentifier(token$1384.value);
    }
    function parseObjectProperty$1027() {
        var token$1385, key$1386, id$1387, value$1388, param$1389;
        token$1385 = lookahead$973;
        if (token$1385.type === Token$951.Identifier) {
            id$1387 = parseObjectPropertyKey$1026();
            // Property Assignment: Getter and Setter.
            if (token$1385.value === 'get' && !(match$1016(':') || match$1016('('))) {
                key$1386 = parseObjectPropertyKey$1026();
                expect$1014('(');
                expect$1014(')');
                return delegate$970.createProperty('get', key$1386, parsePropertyFunction$1024({ generator: false }), false, false);
            }
            if (token$1385.value === 'set' && !(match$1016(':') || match$1016('('))) {
                key$1386 = parseObjectPropertyKey$1026();
                expect$1014('(');
                token$1385 = lookahead$973;
                param$1389 = [parseVariableIdentifier$1054()];
                expect$1014(')');
                return delegate$970.createProperty('set', key$1386, parsePropertyFunction$1024({
                    params: param$1389,
                    generator: false,
                    name: token$1385
                }), false, false);
            }
            if (match$1016(':')) {
                lex$1007();
                return delegate$970.createProperty('init', id$1387, parseAssignmentExpression$1050(), false, false);
            }
            if (match$1016('(')) {
                return delegate$970.createProperty('init', id$1387, parsePropertyMethodFunction$1025({ generator: false }), true, false);
            }
            return delegate$970.createProperty('init', id$1387, id$1387, false, true);
        }
        if (token$1385.type === Token$951.EOF || token$1385.type === Token$951.Punctuator) {
            if (!match$1016('*')) {
                throwUnexpected$1013(token$1385);
            }
            lex$1007();
            id$1387 = parseObjectPropertyKey$1026();
            if (!match$1016('(')) {
                throwUnexpected$1013(lex$1007());
            }
            return delegate$970.createProperty('init', id$1387, parsePropertyMethodFunction$1025({ generator: true }), true, false);
        }
        key$1386 = parseObjectPropertyKey$1026();
        if (match$1016(':')) {
            lex$1007();
            return delegate$970.createProperty('init', key$1386, parseAssignmentExpression$1050(), false, false);
        }
        if (match$1016('(')) {
            return delegate$970.createProperty('init', key$1386, parsePropertyMethodFunction$1025({ generator: false }), true, false);
        }
        throwUnexpected$1013(lex$1007());
    }
    function parseObjectInitialiser$1028() {
        var properties$1390 = [], property$1391, name$1392, key$1393, kind$1394, map$1395 = {}, toString$1396 = String;
        expect$1014('{');
        while (!match$1016('}')) {
            property$1391 = parseObjectProperty$1027();
            if (property$1391.key.type === Syntax$954.Identifier) {
                name$1392 = property$1391.key.name;
            } else {
                name$1392 = toString$1396(property$1391.key.value);
            }
            kind$1394 = property$1391.kind === 'init' ? PropertyKind$955.Data : property$1391.kind === 'get' ? PropertyKind$955.Get : PropertyKind$955.Set;
            key$1393 = '$' + name$1392;
            if (Object.prototype.hasOwnProperty.call(map$1395, key$1393)) {
                if (map$1395[key$1393] === PropertyKind$955.Data) {
                    if (strict$961 && kind$1394 === PropertyKind$955.Data) {
                        throwErrorTolerant$1012({}, Messages$956.StrictDuplicateProperty);
                    } else if (kind$1394 !== PropertyKind$955.Data) {
                        throwErrorTolerant$1012({}, Messages$956.AccessorDataProperty);
                    }
                } else {
                    if (kind$1394 === PropertyKind$955.Data) {
                        throwErrorTolerant$1012({}, Messages$956.AccessorDataProperty);
                    } else if (map$1395[key$1393] & kind$1394) {
                        throwErrorTolerant$1012({}, Messages$956.AccessorGetSet);
                    }
                }
                map$1395[key$1393] |= kind$1394;
            } else {
                map$1395[key$1393] = kind$1394;
            }
            properties$1390.push(property$1391);
            if (!match$1016('}')) {
                expect$1014(',');
            }
        }
        expect$1014('}');
        return delegate$970.createObjectExpression(properties$1390);
    }
    function parseTemplateElement$1029(option$1397) {
        var token$1398 = scanTemplateElement$1002(option$1397);
        if (strict$961 && token$1398.octal) {
            throwError$1011(token$1398, Messages$956.StrictOctalLiteral);
        }
        return delegate$970.createTemplateElement({
            raw: token$1398.value.raw,
            cooked: token$1398.value.cooked
        }, token$1398.tail);
    }
    function parseTemplateLiteral$1030() {
        var quasi$1399, quasis$1400, expressions$1401;
        quasi$1399 = parseTemplateElement$1029({ head: true });
        quasis$1400 = [quasi$1399];
        expressions$1401 = [];
        while (!quasi$1399.tail) {
            expressions$1401.push(parseExpression$1051());
            quasi$1399 = parseTemplateElement$1029({ head: false });
            quasis$1400.push(quasi$1399);
        }
        return delegate$970.createTemplateLiteral(quasis$1400, expressions$1401);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$1031() {
        var expr$1402;
        expect$1014('(');
        ++state$975.parenthesizedCount;
        expr$1402 = parseExpression$1051();
        expect$1014(')');
        return expr$1402;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$1032() {
        var type$1403, token$1404, resolvedIdent$1405;
        token$1404 = lookahead$973;
        type$1403 = lookahead$973.type;
        if (type$1403 === Token$951.Identifier) {
            resolvedIdent$1405 = expander$950.resolve(tokenStream$971[lookaheadIndex$974]);
            lex$1007();
            return delegate$970.createIdentifier(resolvedIdent$1405);
        }
        if (type$1403 === Token$951.StringLiteral || type$1403 === Token$951.NumericLiteral) {
            if (strict$961 && lookahead$973.octal) {
                throwErrorTolerant$1012(lookahead$973, Messages$956.StrictOctalLiteral);
            }
            return delegate$970.createLiteral(lex$1007());
        }
        if (type$1403 === Token$951.Keyword) {
            if (matchKeyword$1017('this')) {
                lex$1007();
                return delegate$970.createThisExpression();
            }
            if (matchKeyword$1017('function')) {
                return parseFunctionExpression$1089();
            }
            if (matchKeyword$1017('class')) {
                return parseClassExpression$1094();
            }
            if (matchKeyword$1017('super')) {
                lex$1007();
                return delegate$970.createIdentifier('super');
            }
        }
        if (type$1403 === Token$951.BooleanLiteral) {
            token$1404 = lex$1007();
            token$1404.value = token$1404.value === 'true';
            return delegate$970.createLiteral(token$1404);
        }
        if (type$1403 === Token$951.NullLiteral) {
            token$1404 = lex$1007();
            token$1404.value = null;
            return delegate$970.createLiteral(token$1404);
        }
        if (match$1016('[')) {
            return parseArrayInitialiser$1023();
        }
        if (match$1016('{')) {
            return parseObjectInitialiser$1028();
        }
        if (match$1016('(')) {
            return parseGroupExpression$1031();
        }
        if (lookahead$973.type === Token$951.RegularExpression) {
            return delegate$970.createLiteral(lex$1007());
        }
        if (type$1403 === Token$951.Template) {
            return parseTemplateLiteral$1030();
        }
        return throwUnexpected$1013(lex$1007());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$1033() {
        var args$1406 = [], arg$1407;
        expect$1014('(');
        if (!match$1016(')')) {
            while (streamIndex$972 < length$969) {
                arg$1407 = parseSpreadOrAssignmentExpression$1034();
                args$1406.push(arg$1407);
                if (match$1016(')')) {
                    break;
                } else if (arg$1407.type === Syntax$954.SpreadElement) {
                    throwError$1011({}, Messages$956.ElementAfterSpreadElement);
                }
                expect$1014(',');
            }
        }
        expect$1014(')');
        return args$1406;
    }
    function parseSpreadOrAssignmentExpression$1034() {
        if (match$1016('...')) {
            lex$1007();
            return delegate$970.createSpreadElement(parseAssignmentExpression$1050());
        }
        return parseAssignmentExpression$1050();
    }
    function parseNonComputedProperty$1035() {
        var token$1408 = lex$1007();
        if (!isIdentifierName$1004(token$1408)) {
            throwUnexpected$1013(token$1408);
        }
        return delegate$970.createIdentifier(token$1408.value);
    }
    function parseNonComputedMember$1036() {
        expect$1014('.');
        return parseNonComputedProperty$1035();
    }
    function parseComputedMember$1037() {
        var expr$1409;
        expect$1014('[');
        expr$1409 = parseExpression$1051();
        expect$1014(']');
        return expr$1409;
    }
    function parseNewExpression$1038() {
        var callee$1410, args$1411;
        expectKeyword$1015('new');
        callee$1410 = parseLeftHandSideExpression$1040();
        args$1411 = match$1016('(') ? parseArguments$1033() : [];
        return delegate$970.createNewExpression(callee$1410, args$1411);
    }
    function parseLeftHandSideExpressionAllowCall$1039() {
        var expr$1412, args$1413, property$1414;
        expr$1412 = matchKeyword$1017('new') ? parseNewExpression$1038() : parsePrimaryExpression$1032();
        while (match$1016('.') || match$1016('[') || match$1016('(') || lookahead$973.type === Token$951.Template) {
            if (match$1016('(')) {
                args$1413 = parseArguments$1033();
                expr$1412 = delegate$970.createCallExpression(expr$1412, args$1413);
            } else if (match$1016('[')) {
                expr$1412 = delegate$970.createMemberExpression('[', expr$1412, parseComputedMember$1037());
            } else if (match$1016('.')) {
                expr$1412 = delegate$970.createMemberExpression('.', expr$1412, parseNonComputedMember$1036());
            } else {
                expr$1412 = delegate$970.createTaggedTemplateExpression(expr$1412, parseTemplateLiteral$1030());
            }
        }
        return expr$1412;
    }
    function parseLeftHandSideExpression$1040() {
        var expr$1415, property$1416;
        expr$1415 = matchKeyword$1017('new') ? parseNewExpression$1038() : parsePrimaryExpression$1032();
        while (match$1016('.') || match$1016('[') || lookahead$973.type === Token$951.Template) {
            if (match$1016('[')) {
                expr$1415 = delegate$970.createMemberExpression('[', expr$1415, parseComputedMember$1037());
            } else if (match$1016('.')) {
                expr$1415 = delegate$970.createMemberExpression('.', expr$1415, parseNonComputedMember$1036());
            } else {
                expr$1415 = delegate$970.createTaggedTemplateExpression(expr$1415, parseTemplateLiteral$1030());
            }
        }
        return expr$1415;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$1041() {
        var expr$1417 = parseLeftHandSideExpressionAllowCall$1039(), token$1418 = lookahead$973;
        if (lookahead$973.type !== Token$951.Punctuator) {
            return expr$1417;
        }
        if ((match$1016('++') || match$1016('--')) && !peekLineTerminator$1010()) {
            // 11.3.1, 11.3.2
            if (strict$961 && expr$1417.type === Syntax$954.Identifier && isRestrictedWord$988(expr$1417.name)) {
                throwErrorTolerant$1012({}, Messages$956.StrictLHSPostfix);
            }
            if (!isLeftHandSide$1021(expr$1417)) {
                throwError$1011({}, Messages$956.InvalidLHSInAssignment);
            }
            token$1418 = lex$1007();
            expr$1417 = delegate$970.createPostfixExpression(token$1418.value, expr$1417);
        }
        return expr$1417;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$1042() {
        var token$1419, expr$1420;
        if (lookahead$973.type !== Token$951.Punctuator && lookahead$973.type !== Token$951.Keyword) {
            return parsePostfixExpression$1041();
        }
        if (match$1016('++') || match$1016('--')) {
            token$1419 = lex$1007();
            expr$1420 = parseUnaryExpression$1042();
            // 11.4.4, 11.4.5
            if (strict$961 && expr$1420.type === Syntax$954.Identifier && isRestrictedWord$988(expr$1420.name)) {
                throwErrorTolerant$1012({}, Messages$956.StrictLHSPrefix);
            }
            if (!isLeftHandSide$1021(expr$1420)) {
                throwError$1011({}, Messages$956.InvalidLHSInAssignment);
            }
            return delegate$970.createUnaryExpression(token$1419.value, expr$1420);
        }
        if (match$1016('+') || match$1016('-') || match$1016('~') || match$1016('!')) {
            token$1419 = lex$1007();
            expr$1420 = parseUnaryExpression$1042();
            return delegate$970.createUnaryExpression(token$1419.value, expr$1420);
        }
        if (matchKeyword$1017('delete') || matchKeyword$1017('void') || matchKeyword$1017('typeof')) {
            token$1419 = lex$1007();
            expr$1420 = parseUnaryExpression$1042();
            expr$1420 = delegate$970.createUnaryExpression(token$1419.value, expr$1420);
            if (strict$961 && expr$1420.operator === 'delete' && expr$1420.argument.type === Syntax$954.Identifier) {
                throwErrorTolerant$1012({}, Messages$956.StrictDelete);
            }
            return expr$1420;
        }
        return parsePostfixExpression$1041();
    }
    function binaryPrecedence$1043(token$1421, allowIn$1422) {
        var prec$1423 = 0;
        if (token$1421.type !== Token$951.Punctuator && token$1421.type !== Token$951.Keyword) {
            return 0;
        }
        switch (token$1421.value) {
        case '||':
            prec$1423 = 1;
            break;
        case '&&':
            prec$1423 = 2;
            break;
        case '|':
            prec$1423 = 3;
            break;
        case '^':
            prec$1423 = 4;
            break;
        case '&':
            prec$1423 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1423 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1423 = 7;
            break;
        case 'in':
            prec$1423 = allowIn$1422 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1423 = 8;
            break;
        case '+':
        case '-':
            prec$1423 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1423 = 11;
            break;
        default:
            break;
        }
        return prec$1423;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$1044() {
        var expr$1424, token$1425, prec$1426, previousAllowIn$1427, stack$1428, right$1429, operator$1430, left$1431, i$1432;
        previousAllowIn$1427 = state$975.allowIn;
        state$975.allowIn = true;
        expr$1424 = parseUnaryExpression$1042();
        token$1425 = lookahead$973;
        prec$1426 = binaryPrecedence$1043(token$1425, previousAllowIn$1427);
        if (prec$1426 === 0) {
            return expr$1424;
        }
        token$1425.prec = prec$1426;
        lex$1007();
        stack$1428 = [
            expr$1424,
            token$1425,
            parseUnaryExpression$1042()
        ];
        while ((prec$1426 = binaryPrecedence$1043(lookahead$973, previousAllowIn$1427)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1428.length > 2 && prec$1426 <= stack$1428[stack$1428.length - 2].prec) {
                right$1429 = stack$1428.pop();
                operator$1430 = stack$1428.pop().value;
                left$1431 = stack$1428.pop();
                stack$1428.push(delegate$970.createBinaryExpression(operator$1430, left$1431, right$1429));
            }
            // Shift.
            token$1425 = lex$1007();
            token$1425.prec = prec$1426;
            stack$1428.push(token$1425);
            stack$1428.push(parseUnaryExpression$1042());
        }
        state$975.allowIn = previousAllowIn$1427;
        // Final reduce to clean-up the stack.
        i$1432 = stack$1428.length - 1;
        expr$1424 = stack$1428[i$1432];
        while (i$1432 > 1) {
            expr$1424 = delegate$970.createBinaryExpression(stack$1428[i$1432 - 1].value, stack$1428[i$1432 - 2], expr$1424);
            i$1432 -= 2;
        }
        return expr$1424;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$1045() {
        var expr$1433, previousAllowIn$1434, consequent$1435, alternate$1436;
        expr$1433 = parseBinaryExpression$1044();
        if (match$1016('?')) {
            lex$1007();
            previousAllowIn$1434 = state$975.allowIn;
            state$975.allowIn = true;
            consequent$1435 = parseAssignmentExpression$1050();
            state$975.allowIn = previousAllowIn$1434;
            expect$1014(':');
            alternate$1436 = parseAssignmentExpression$1050();
            expr$1433 = delegate$970.createConditionalExpression(expr$1433, consequent$1435, alternate$1436);
        }
        return expr$1433;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$1046(expr$1437) {
        var i$1438, len$1439, property$1440, element$1441;
        if (expr$1437.type === Syntax$954.ObjectExpression) {
            expr$1437.type = Syntax$954.ObjectPattern;
            for (i$1438 = 0, len$1439 = expr$1437.properties.length; i$1438 < len$1439; i$1438 += 1) {
                property$1440 = expr$1437.properties[i$1438];
                if (property$1440.kind !== 'init') {
                    throwError$1011({}, Messages$956.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$1046(property$1440.value);
            }
        } else if (expr$1437.type === Syntax$954.ArrayExpression) {
            expr$1437.type = Syntax$954.ArrayPattern;
            for (i$1438 = 0, len$1439 = expr$1437.elements.length; i$1438 < len$1439; i$1438 += 1) {
                element$1441 = expr$1437.elements[i$1438];
                if (element$1441) {
                    reinterpretAsAssignmentBindingPattern$1046(element$1441);
                }
            }
        } else if (expr$1437.type === Syntax$954.Identifier) {
            if (isRestrictedWord$988(expr$1437.name)) {
                throwError$1011({}, Messages$956.InvalidLHSInAssignment);
            }
        } else if (expr$1437.type === Syntax$954.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$1046(expr$1437.argument);
            if (expr$1437.argument.type === Syntax$954.ObjectPattern) {
                throwError$1011({}, Messages$956.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1437.type !== Syntax$954.MemberExpression && expr$1437.type !== Syntax$954.CallExpression && expr$1437.type !== Syntax$954.NewExpression) {
                throwError$1011({}, Messages$956.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$1047(options$1442, expr$1443) {
        var i$1444, len$1445, property$1446, element$1447;
        if (expr$1443.type === Syntax$954.ObjectExpression) {
            expr$1443.type = Syntax$954.ObjectPattern;
            for (i$1444 = 0, len$1445 = expr$1443.properties.length; i$1444 < len$1445; i$1444 += 1) {
                property$1446 = expr$1443.properties[i$1444];
                if (property$1446.kind !== 'init') {
                    throwError$1011({}, Messages$956.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$1047(options$1442, property$1446.value);
            }
        } else if (expr$1443.type === Syntax$954.ArrayExpression) {
            expr$1443.type = Syntax$954.ArrayPattern;
            for (i$1444 = 0, len$1445 = expr$1443.elements.length; i$1444 < len$1445; i$1444 += 1) {
                element$1447 = expr$1443.elements[i$1444];
                if (element$1447) {
                    reinterpretAsDestructuredParameter$1047(options$1442, element$1447);
                }
            }
        } else if (expr$1443.type === Syntax$954.Identifier) {
            validateParam$1085(options$1442, expr$1443, expr$1443.name);
        } else {
            if (expr$1443.type !== Syntax$954.MemberExpression) {
                throwError$1011({}, Messages$956.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$1048(expressions$1448) {
        var i$1449, len$1450, param$1451, params$1452, defaults$1453, defaultCount$1454, options$1455, rest$1456;
        params$1452 = [];
        defaults$1453 = [];
        defaultCount$1454 = 0;
        rest$1456 = null;
        options$1455 = { paramSet: {} };
        for (i$1449 = 0, len$1450 = expressions$1448.length; i$1449 < len$1450; i$1449 += 1) {
            param$1451 = expressions$1448[i$1449];
            if (param$1451.type === Syntax$954.Identifier) {
                params$1452.push(param$1451);
                defaults$1453.push(null);
                validateParam$1085(options$1455, param$1451, param$1451.name);
            } else if (param$1451.type === Syntax$954.ObjectExpression || param$1451.type === Syntax$954.ArrayExpression) {
                reinterpretAsDestructuredParameter$1047(options$1455, param$1451);
                params$1452.push(param$1451);
                defaults$1453.push(null);
            } else if (param$1451.type === Syntax$954.SpreadElement) {
                assert$977(i$1449 === len$1450 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$1047(options$1455, param$1451.argument);
                rest$1456 = param$1451.argument;
            } else if (param$1451.type === Syntax$954.AssignmentExpression) {
                params$1452.push(param$1451.left);
                defaults$1453.push(param$1451.right);
                ++defaultCount$1454;
                validateParam$1085(options$1455, param$1451.left, param$1451.left.name);
            } else {
                return null;
            }
        }
        if (options$1455.message === Messages$956.StrictParamDupe) {
            throwError$1011(strict$961 ? options$1455.stricted : options$1455.firstRestricted, options$1455.message);
        }
        if (defaultCount$1454 === 0) {
            defaults$1453 = [];
        }
        return {
            params: params$1452,
            defaults: defaults$1453,
            rest: rest$1456,
            stricted: options$1455.stricted,
            firstRestricted: options$1455.firstRestricted,
            message: options$1455.message
        };
    }
    function parseArrowFunctionExpression$1049(options$1457) {
        var previousStrict$1458, previousYieldAllowed$1459, body$1460;
        expect$1014('=>');
        previousStrict$1458 = strict$961;
        previousYieldAllowed$1459 = state$975.yieldAllowed;
        state$975.yieldAllowed = false;
        body$1460 = parseConciseBody$1083();
        if (strict$961 && options$1457.firstRestricted) {
            throwError$1011(options$1457.firstRestricted, options$1457.message);
        }
        if (strict$961 && options$1457.stricted) {
            throwErrorTolerant$1012(options$1457.stricted, options$1457.message);
        }
        strict$961 = previousStrict$1458;
        state$975.yieldAllowed = previousYieldAllowed$1459;
        return delegate$970.createArrowFunctionExpression(options$1457.params, options$1457.defaults, body$1460, options$1457.rest, body$1460.type !== Syntax$954.BlockStatement);
    }
    function parseAssignmentExpression$1050() {
        var expr$1461, token$1462, params$1463, oldParenthesizedCount$1464;
        if (matchKeyword$1017('yield')) {
            return parseYieldExpression$1090();
        }
        oldParenthesizedCount$1464 = state$975.parenthesizedCount;
        if (match$1016('(')) {
            token$1462 = lookahead2$1009();
            if (token$1462.type === Token$951.Punctuator && token$1462.value === ')' || token$1462.value === '...') {
                params$1463 = parseParams$1087();
                if (!match$1016('=>')) {
                    throwUnexpected$1013(lex$1007());
                }
                return parseArrowFunctionExpression$1049(params$1463);
            }
        }
        token$1462 = lookahead$973;
        expr$1461 = parseConditionalExpression$1045();
        if (match$1016('=>') && (state$975.parenthesizedCount === oldParenthesizedCount$1464 || state$975.parenthesizedCount === oldParenthesizedCount$1464 + 1)) {
            if (expr$1461.type === Syntax$954.Identifier) {
                params$1463 = reinterpretAsCoverFormalsList$1048([expr$1461]);
            } else if (expr$1461.type === Syntax$954.SequenceExpression) {
                params$1463 = reinterpretAsCoverFormalsList$1048(expr$1461.expressions);
            }
            if (params$1463) {
                return parseArrowFunctionExpression$1049(params$1463);
            }
        }
        if (matchAssign$1019()) {
            // 11.13.1
            if (strict$961 && expr$1461.type === Syntax$954.Identifier && isRestrictedWord$988(expr$1461.name)) {
                throwErrorTolerant$1012(token$1462, Messages$956.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$1016('=') && (expr$1461.type === Syntax$954.ObjectExpression || expr$1461.type === Syntax$954.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$1046(expr$1461);
            } else if (!isLeftHandSide$1021(expr$1461)) {
                throwError$1011({}, Messages$956.InvalidLHSInAssignment);
            }
            expr$1461 = delegate$970.createAssignmentExpression(lex$1007().value, expr$1461, parseAssignmentExpression$1050());
        }
        return expr$1461;
    }
    // 11.14 Comma Operator
    function parseExpression$1051() {
        var expr$1465, expressions$1466, sequence$1467, coverFormalsList$1468, spreadFound$1469, oldParenthesizedCount$1470;
        oldParenthesizedCount$1470 = state$975.parenthesizedCount;
        expr$1465 = parseAssignmentExpression$1050();
        expressions$1466 = [expr$1465];
        if (match$1016(',')) {
            while (streamIndex$972 < length$969) {
                if (!match$1016(',')) {
                    break;
                }
                lex$1007();
                expr$1465 = parseSpreadOrAssignmentExpression$1034();
                expressions$1466.push(expr$1465);
                if (expr$1465.type === Syntax$954.SpreadElement) {
                    spreadFound$1469 = true;
                    if (!match$1016(')')) {
                        throwError$1011({}, Messages$956.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1467 = delegate$970.createSequenceExpression(expressions$1466);
        }
        if (match$1016('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$975.parenthesizedCount === oldParenthesizedCount$1470 || state$975.parenthesizedCount === oldParenthesizedCount$1470 + 1) {
                expr$1465 = expr$1465.type === Syntax$954.SequenceExpression ? expr$1465.expressions : expressions$1466;
                coverFormalsList$1468 = reinterpretAsCoverFormalsList$1048(expr$1465);
                if (coverFormalsList$1468) {
                    return parseArrowFunctionExpression$1049(coverFormalsList$1468);
                }
            }
            throwUnexpected$1013(lex$1007());
        }
        if (spreadFound$1469 && lookahead2$1009().value !== '=>') {
            throwError$1011({}, Messages$956.IllegalSpread);
        }
        return sequence$1467 || expr$1465;
    }
    // 12.1 Block
    function parseStatementList$1052() {
        var list$1471 = [], statement$1472;
        while (streamIndex$972 < length$969) {
            if (match$1016('}')) {
                break;
            }
            statement$1472 = parseSourceElement$1097();
            if (typeof statement$1472 === 'undefined') {
                break;
            }
            list$1471.push(statement$1472);
        }
        return list$1471;
    }
    function parseBlock$1053() {
        var block$1473;
        expect$1014('{');
        block$1473 = parseStatementList$1052();
        expect$1014('}');
        return delegate$970.createBlockStatement(block$1473);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$1054() {
        var token$1474 = lookahead$973, resolvedIdent$1475;
        if (token$1474.type !== Token$951.Identifier) {
            throwUnexpected$1013(token$1474);
        }
        resolvedIdent$1475 = expander$950.resolve(tokenStream$971[lookaheadIndex$974]);
        lex$1007();
        return delegate$970.createIdentifier(resolvedIdent$1475);
    }
    function parseVariableDeclaration$1055(kind$1476) {
        var id$1477, init$1478 = null;
        if (match$1016('{')) {
            id$1477 = parseObjectInitialiser$1028();
            reinterpretAsAssignmentBindingPattern$1046(id$1477);
        } else if (match$1016('[')) {
            id$1477 = parseArrayInitialiser$1023();
            reinterpretAsAssignmentBindingPattern$1046(id$1477);
        } else {
            id$1477 = state$975.allowKeyword ? parseNonComputedProperty$1035() : parseVariableIdentifier$1054();
            // 12.2.1
            if (strict$961 && isRestrictedWord$988(id$1477.name)) {
                throwErrorTolerant$1012({}, Messages$956.StrictVarName);
            }
        }
        if (kind$1476 === 'const') {
            if (!match$1016('=')) {
                throwError$1011({}, Messages$956.NoUnintializedConst);
            }
            expect$1014('=');
            init$1478 = parseAssignmentExpression$1050();
        } else if (match$1016('=')) {
            lex$1007();
            init$1478 = parseAssignmentExpression$1050();
        }
        return delegate$970.createVariableDeclarator(id$1477, init$1478);
    }
    function parseVariableDeclarationList$1056(kind$1479) {
        var list$1480 = [];
        do {
            list$1480.push(parseVariableDeclaration$1055(kind$1479));
            if (!match$1016(',')) {
                break;
            }
            lex$1007();
        } while (streamIndex$972 < length$969);
        return list$1480;
    }
    function parseVariableStatement$1057() {
        var declarations$1481;
        expectKeyword$1015('var');
        declarations$1481 = parseVariableDeclarationList$1056();
        consumeSemicolon$1020();
        return delegate$970.createVariableDeclaration(declarations$1481, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$1058(kind$1482) {
        var declarations$1483;
        expectKeyword$1015(kind$1482);
        declarations$1483 = parseVariableDeclarationList$1056(kind$1482);
        consumeSemicolon$1020();
        return delegate$970.createVariableDeclaration(declarations$1483, kind$1482);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$1059() {
        var id$1484, src$1485, body$1486;
        lex$1007();
        // 'module'
        if (peekLineTerminator$1010()) {
            throwError$1011({}, Messages$956.NewlineAfterModule);
        }
        switch (lookahead$973.type) {
        case Token$951.StringLiteral:
            id$1484 = parsePrimaryExpression$1032();
            body$1486 = parseModuleBlock$1102();
            src$1485 = null;
            break;
        case Token$951.Identifier:
            id$1484 = parseVariableIdentifier$1054();
            body$1486 = null;
            if (!matchContextualKeyword$1018('from')) {
                throwUnexpected$1013(lex$1007());
            }
            lex$1007();
            src$1485 = parsePrimaryExpression$1032();
            if (src$1485.type !== Syntax$954.Literal) {
                throwError$1011({}, Messages$956.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$1020();
        return delegate$970.createModuleDeclaration(id$1484, src$1485, body$1486);
    }
    function parseExportBatchSpecifier$1060() {
        expect$1014('*');
        return delegate$970.createExportBatchSpecifier();
    }
    function parseExportSpecifier$1061() {
        var id$1487, name$1488 = null;
        id$1487 = parseVariableIdentifier$1054();
        if (matchContextualKeyword$1018('as')) {
            lex$1007();
            name$1488 = parseNonComputedProperty$1035();
        }
        return delegate$970.createExportSpecifier(id$1487, name$1488);
    }
    function parseExportDeclaration$1062() {
        var previousAllowKeyword$1489, decl$1490, def$1491, src$1492, specifiers$1493;
        expectKeyword$1015('export');
        if (lookahead$973.type === Token$951.Keyword) {
            switch (lookahead$973.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$970.createExportDeclaration(parseSourceElement$1097(), null, null);
            }
        }
        if (isIdentifierName$1004(lookahead$973)) {
            previousAllowKeyword$1489 = state$975.allowKeyword;
            state$975.allowKeyword = true;
            decl$1490 = parseVariableDeclarationList$1056('let');
            state$975.allowKeyword = previousAllowKeyword$1489;
            return delegate$970.createExportDeclaration(decl$1490, null, null);
        }
        specifiers$1493 = [];
        src$1492 = null;
        if (match$1016('*')) {
            specifiers$1493.push(parseExportBatchSpecifier$1060());
        } else {
            expect$1014('{');
            do {
                specifiers$1493.push(parseExportSpecifier$1061());
            } while (match$1016(',') && lex$1007());
            expect$1014('}');
        }
        if (matchContextualKeyword$1018('from')) {
            lex$1007();
            src$1492 = parsePrimaryExpression$1032();
            if (src$1492.type !== Syntax$954.Literal) {
                throwError$1011({}, Messages$956.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$1020();
        return delegate$970.createExportDeclaration(null, specifiers$1493, src$1492);
    }
    function parseImportDeclaration$1063() {
        var specifiers$1494, kind$1495, src$1496;
        expectKeyword$1015('import');
        specifiers$1494 = [];
        if (isIdentifierName$1004(lookahead$973)) {
            kind$1495 = 'default';
            specifiers$1494.push(parseImportSpecifier$1064());
            if (!matchContextualKeyword$1018('from')) {
                throwError$1011({}, Messages$956.NoFromAfterImport);
            }
            lex$1007();
        } else if (match$1016('{')) {
            kind$1495 = 'named';
            lex$1007();
            do {
                specifiers$1494.push(parseImportSpecifier$1064());
            } while (match$1016(',') && lex$1007());
            expect$1014('}');
            if (!matchContextualKeyword$1018('from')) {
                throwError$1011({}, Messages$956.NoFromAfterImport);
            }
            lex$1007();
        }
        src$1496 = parsePrimaryExpression$1032();
        if (src$1496.type !== Syntax$954.Literal) {
            throwError$1011({}, Messages$956.InvalidModuleSpecifier);
        }
        consumeSemicolon$1020();
        return delegate$970.createImportDeclaration(specifiers$1494, kind$1495, src$1496);
    }
    function parseImportSpecifier$1064() {
        var id$1497, name$1498 = null;
        id$1497 = parseNonComputedProperty$1035();
        if (matchContextualKeyword$1018('as')) {
            lex$1007();
            name$1498 = parseVariableIdentifier$1054();
        }
        return delegate$970.createImportSpecifier(id$1497, name$1498);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$1065() {
        expect$1014(';');
        return delegate$970.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$1066() {
        var expr$1499 = parseExpression$1051();
        consumeSemicolon$1020();
        return delegate$970.createExpressionStatement(expr$1499);
    }
    // 12.5 If statement
    function parseIfStatement$1067() {
        var test$1500, consequent$1501, alternate$1502;
        expectKeyword$1015('if');
        expect$1014('(');
        test$1500 = parseExpression$1051();
        expect$1014(')');
        consequent$1501 = parseStatement$1082();
        if (matchKeyword$1017('else')) {
            lex$1007();
            alternate$1502 = parseStatement$1082();
        } else {
            alternate$1502 = null;
        }
        return delegate$970.createIfStatement(test$1500, consequent$1501, alternate$1502);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$1068() {
        var body$1503, test$1504, oldInIteration$1505;
        expectKeyword$1015('do');
        oldInIteration$1505 = state$975.inIteration;
        state$975.inIteration = true;
        body$1503 = parseStatement$1082();
        state$975.inIteration = oldInIteration$1505;
        expectKeyword$1015('while');
        expect$1014('(');
        test$1504 = parseExpression$1051();
        expect$1014(')');
        if (match$1016(';')) {
            lex$1007();
        }
        return delegate$970.createDoWhileStatement(body$1503, test$1504);
    }
    function parseWhileStatement$1069() {
        var test$1506, body$1507, oldInIteration$1508;
        expectKeyword$1015('while');
        expect$1014('(');
        test$1506 = parseExpression$1051();
        expect$1014(')');
        oldInIteration$1508 = state$975.inIteration;
        state$975.inIteration = true;
        body$1507 = parseStatement$1082();
        state$975.inIteration = oldInIteration$1508;
        return delegate$970.createWhileStatement(test$1506, body$1507);
    }
    function parseForVariableDeclaration$1070() {
        var token$1509 = lex$1007(), declarations$1510 = parseVariableDeclarationList$1056();
        return delegate$970.createVariableDeclaration(declarations$1510, token$1509.value);
    }
    function parseForStatement$1071(opts$1511) {
        var init$1512, test$1513, update$1514, left$1515, right$1516, body$1517, operator$1518, oldInIteration$1519;
        init$1512 = test$1513 = update$1514 = null;
        expectKeyword$1015('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$1018('each')) {
            throwError$1011({}, Messages$956.EachNotAllowed);
        }
        expect$1014('(');
        if (match$1016(';')) {
            lex$1007();
        } else {
            if (matchKeyword$1017('var') || matchKeyword$1017('let') || matchKeyword$1017('const')) {
                state$975.allowIn = false;
                init$1512 = parseForVariableDeclaration$1070();
                state$975.allowIn = true;
                if (init$1512.declarations.length === 1) {
                    if (matchKeyword$1017('in') || matchContextualKeyword$1018('of')) {
                        operator$1518 = lookahead$973;
                        if (!((operator$1518.value === 'in' || init$1512.kind !== 'var') && init$1512.declarations[0].init)) {
                            lex$1007();
                            left$1515 = init$1512;
                            right$1516 = parseExpression$1051();
                            init$1512 = null;
                        }
                    }
                }
            } else {
                state$975.allowIn = false;
                init$1512 = parseExpression$1051();
                state$975.allowIn = true;
                if (matchContextualKeyword$1018('of')) {
                    operator$1518 = lex$1007();
                    left$1515 = init$1512;
                    right$1516 = parseExpression$1051();
                    init$1512 = null;
                } else if (matchKeyword$1017('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$1022(init$1512)) {
                        throwError$1011({}, Messages$956.InvalidLHSInForIn);
                    }
                    operator$1518 = lex$1007();
                    left$1515 = init$1512;
                    right$1516 = parseExpression$1051();
                    init$1512 = null;
                }
            }
            if (typeof left$1515 === 'undefined') {
                expect$1014(';');
            }
        }
        if (typeof left$1515 === 'undefined') {
            if (!match$1016(';')) {
                test$1513 = parseExpression$1051();
            }
            expect$1014(';');
            if (!match$1016(')')) {
                update$1514 = parseExpression$1051();
            }
        }
        expect$1014(')');
        oldInIteration$1519 = state$975.inIteration;
        state$975.inIteration = true;
        if (!(opts$1511 !== undefined && opts$1511.ignoreBody)) {
            body$1517 = parseStatement$1082();
        }
        state$975.inIteration = oldInIteration$1519;
        if (typeof left$1515 === 'undefined') {
            return delegate$970.createForStatement(init$1512, test$1513, update$1514, body$1517);
        }
        if (operator$1518.value === 'in') {
            return delegate$970.createForInStatement(left$1515, right$1516, body$1517);
        }
        return delegate$970.createForOfStatement(left$1515, right$1516, body$1517);
    }
    // 12.7 The continue statement
    function parseContinueStatement$1072() {
        var label$1520 = null, key$1521;
        expectKeyword$1015('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$973.value.charCodeAt(0) === 59) {
            lex$1007();
            if (!state$975.inIteration) {
                throwError$1011({}, Messages$956.IllegalContinue);
            }
            return delegate$970.createContinueStatement(null);
        }
        if (peekLineTerminator$1010()) {
            if (!state$975.inIteration) {
                throwError$1011({}, Messages$956.IllegalContinue);
            }
            return delegate$970.createContinueStatement(null);
        }
        if (lookahead$973.type === Token$951.Identifier) {
            label$1520 = parseVariableIdentifier$1054();
            key$1521 = '$' + label$1520.name;
            if (!Object.prototype.hasOwnProperty.call(state$975.labelSet, key$1521)) {
                throwError$1011({}, Messages$956.UnknownLabel, label$1520.name);
            }
        }
        consumeSemicolon$1020();
        if (label$1520 === null && !state$975.inIteration) {
            throwError$1011({}, Messages$956.IllegalContinue);
        }
        return delegate$970.createContinueStatement(label$1520);
    }
    // 12.8 The break statement
    function parseBreakStatement$1073() {
        var label$1522 = null, key$1523;
        expectKeyword$1015('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$973.value.charCodeAt(0) === 59) {
            lex$1007();
            if (!(state$975.inIteration || state$975.inSwitch)) {
                throwError$1011({}, Messages$956.IllegalBreak);
            }
            return delegate$970.createBreakStatement(null);
        }
        if (peekLineTerminator$1010()) {
            if (!(state$975.inIteration || state$975.inSwitch)) {
                throwError$1011({}, Messages$956.IllegalBreak);
            }
            return delegate$970.createBreakStatement(null);
        }
        if (lookahead$973.type === Token$951.Identifier) {
            label$1522 = parseVariableIdentifier$1054();
            key$1523 = '$' + label$1522.name;
            if (!Object.prototype.hasOwnProperty.call(state$975.labelSet, key$1523)) {
                throwError$1011({}, Messages$956.UnknownLabel, label$1522.name);
            }
        }
        consumeSemicolon$1020();
        if (label$1522 === null && !(state$975.inIteration || state$975.inSwitch)) {
            throwError$1011({}, Messages$956.IllegalBreak);
        }
        return delegate$970.createBreakStatement(label$1522);
    }
    // 12.9 The return statement
    function parseReturnStatement$1074() {
        var argument$1524 = null;
        expectKeyword$1015('return');
        if (!state$975.inFunctionBody) {
            throwErrorTolerant$1012({}, Messages$956.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$984(String(lookahead$973.value).charCodeAt(0))) {
            argument$1524 = parseExpression$1051();
            consumeSemicolon$1020();
            return delegate$970.createReturnStatement(argument$1524);
        }
        if (peekLineTerminator$1010()) {
            return delegate$970.createReturnStatement(null);
        }
        if (!match$1016(';')) {
            if (!match$1016('}') && lookahead$973.type !== Token$951.EOF) {
                argument$1524 = parseExpression$1051();
            }
        }
        consumeSemicolon$1020();
        return delegate$970.createReturnStatement(argument$1524);
    }
    // 12.10 The with statement
    function parseWithStatement$1075() {
        var object$1525, body$1526;
        if (strict$961) {
            throwErrorTolerant$1012({}, Messages$956.StrictModeWith);
        }
        expectKeyword$1015('with');
        expect$1014('(');
        object$1525 = parseExpression$1051();
        expect$1014(')');
        body$1526 = parseStatement$1082();
        return delegate$970.createWithStatement(object$1525, body$1526);
    }
    // 12.10 The swith statement
    function parseSwitchCase$1076() {
        var test$1527, consequent$1528 = [], sourceElement$1529;
        if (matchKeyword$1017('default')) {
            lex$1007();
            test$1527 = null;
        } else {
            expectKeyword$1015('case');
            test$1527 = parseExpression$1051();
        }
        expect$1014(':');
        while (streamIndex$972 < length$969) {
            if (match$1016('}') || matchKeyword$1017('default') || matchKeyword$1017('case')) {
                break;
            }
            sourceElement$1529 = parseSourceElement$1097();
            if (typeof sourceElement$1529 === 'undefined') {
                break;
            }
            consequent$1528.push(sourceElement$1529);
        }
        return delegate$970.createSwitchCase(test$1527, consequent$1528);
    }
    function parseSwitchStatement$1077() {
        var discriminant$1530, cases$1531, clause$1532, oldInSwitch$1533, defaultFound$1534;
        expectKeyword$1015('switch');
        expect$1014('(');
        discriminant$1530 = parseExpression$1051();
        expect$1014(')');
        expect$1014('{');
        cases$1531 = [];
        if (match$1016('}')) {
            lex$1007();
            return delegate$970.createSwitchStatement(discriminant$1530, cases$1531);
        }
        oldInSwitch$1533 = state$975.inSwitch;
        state$975.inSwitch = true;
        defaultFound$1534 = false;
        while (streamIndex$972 < length$969) {
            if (match$1016('}')) {
                break;
            }
            clause$1532 = parseSwitchCase$1076();
            if (clause$1532.test === null) {
                if (defaultFound$1534) {
                    throwError$1011({}, Messages$956.MultipleDefaultsInSwitch);
                }
                defaultFound$1534 = true;
            }
            cases$1531.push(clause$1532);
        }
        state$975.inSwitch = oldInSwitch$1533;
        expect$1014('}');
        return delegate$970.createSwitchStatement(discriminant$1530, cases$1531);
    }
    // 12.13 The throw statement
    function parseThrowStatement$1078() {
        var argument$1535;
        expectKeyword$1015('throw');
        if (peekLineTerminator$1010()) {
            throwError$1011({}, Messages$956.NewlineAfterThrow);
        }
        argument$1535 = parseExpression$1051();
        consumeSemicolon$1020();
        return delegate$970.createThrowStatement(argument$1535);
    }
    // 12.14 The try statement
    function parseCatchClause$1079() {
        var param$1536, body$1537;
        expectKeyword$1015('catch');
        expect$1014('(');
        if (match$1016(')')) {
            throwUnexpected$1013(lookahead$973);
        }
        param$1536 = parseExpression$1051();
        // 12.14.1
        if (strict$961 && param$1536.type === Syntax$954.Identifier && isRestrictedWord$988(param$1536.name)) {
            throwErrorTolerant$1012({}, Messages$956.StrictCatchVariable);
        }
        expect$1014(')');
        body$1537 = parseBlock$1053();
        return delegate$970.createCatchClause(param$1536, body$1537);
    }
    function parseTryStatement$1080() {
        var block$1538, handlers$1539 = [], finalizer$1540 = null;
        expectKeyword$1015('try');
        block$1538 = parseBlock$1053();
        if (matchKeyword$1017('catch')) {
            handlers$1539.push(parseCatchClause$1079());
        }
        if (matchKeyword$1017('finally')) {
            lex$1007();
            finalizer$1540 = parseBlock$1053();
        }
        if (handlers$1539.length === 0 && !finalizer$1540) {
            throwError$1011({}, Messages$956.NoCatchOrFinally);
        }
        return delegate$970.createTryStatement(block$1538, [], handlers$1539, finalizer$1540);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$1081() {
        expectKeyword$1015('debugger');
        consumeSemicolon$1020();
        return delegate$970.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$1082() {
        var type$1541 = lookahead$973.type, expr$1542, labeledBody$1543, key$1544;
        if (type$1541 === Token$951.EOF) {
            throwUnexpected$1013(lookahead$973);
        }
        if (type$1541 === Token$951.Punctuator) {
            switch (lookahead$973.value) {
            case ';':
                return parseEmptyStatement$1065();
            case '{':
                return parseBlock$1053();
            case '(':
                return parseExpressionStatement$1066();
            default:
                break;
            }
        }
        if (type$1541 === Token$951.Keyword) {
            switch (lookahead$973.value) {
            case 'break':
                return parseBreakStatement$1073();
            case 'continue':
                return parseContinueStatement$1072();
            case 'debugger':
                return parseDebuggerStatement$1081();
            case 'do':
                return parseDoWhileStatement$1068();
            case 'for':
                return parseForStatement$1071();
            case 'function':
                return parseFunctionDeclaration$1088();
            case 'class':
                return parseClassDeclaration$1095();
            case 'if':
                return parseIfStatement$1067();
            case 'return':
                return parseReturnStatement$1074();
            case 'switch':
                return parseSwitchStatement$1077();
            case 'throw':
                return parseThrowStatement$1078();
            case 'try':
                return parseTryStatement$1080();
            case 'var':
                return parseVariableStatement$1057();
            case 'while':
                return parseWhileStatement$1069();
            case 'with':
                return parseWithStatement$1075();
            default:
                break;
            }
        }
        expr$1542 = parseExpression$1051();
        // 12.12 Labelled Statements
        if (expr$1542.type === Syntax$954.Identifier && match$1016(':')) {
            lex$1007();
            key$1544 = '$' + expr$1542.name;
            if (Object.prototype.hasOwnProperty.call(state$975.labelSet, key$1544)) {
                throwError$1011({}, Messages$956.Redeclaration, 'Label', expr$1542.name);
            }
            state$975.labelSet[key$1544] = true;
            labeledBody$1543 = parseStatement$1082();
            delete state$975.labelSet[key$1544];
            return delegate$970.createLabeledStatement(expr$1542, labeledBody$1543);
        }
        consumeSemicolon$1020();
        return delegate$970.createExpressionStatement(expr$1542);
    }
    // 13 Function Definition
    function parseConciseBody$1083() {
        if (match$1016('{')) {
            return parseFunctionSourceElements$1084();
        }
        return parseAssignmentExpression$1050();
    }
    function parseFunctionSourceElements$1084() {
        var sourceElement$1545, sourceElements$1546 = [], token$1547, directive$1548, firstRestricted$1549, oldLabelSet$1550, oldInIteration$1551, oldInSwitch$1552, oldInFunctionBody$1553, oldParenthesizedCount$1554;
        expect$1014('{');
        while (streamIndex$972 < length$969) {
            if (lookahead$973.type !== Token$951.StringLiteral) {
                break;
            }
            token$1547 = lookahead$973;
            sourceElement$1545 = parseSourceElement$1097();
            sourceElements$1546.push(sourceElement$1545);
            if (sourceElement$1545.expression.type !== Syntax$954.Literal) {
                // this is not directive
                break;
            }
            directive$1548 = token$1547.value;
            if (directive$1548 === 'use strict') {
                strict$961 = true;
                if (firstRestricted$1549) {
                    throwErrorTolerant$1012(firstRestricted$1549, Messages$956.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1549 && token$1547.octal) {
                    firstRestricted$1549 = token$1547;
                }
            }
        }
        oldLabelSet$1550 = state$975.labelSet;
        oldInIteration$1551 = state$975.inIteration;
        oldInSwitch$1552 = state$975.inSwitch;
        oldInFunctionBody$1553 = state$975.inFunctionBody;
        oldParenthesizedCount$1554 = state$975.parenthesizedCount;
        state$975.labelSet = {};
        state$975.inIteration = false;
        state$975.inSwitch = false;
        state$975.inFunctionBody = true;
        state$975.parenthesizedCount = 0;
        while (streamIndex$972 < length$969) {
            if (match$1016('}')) {
                break;
            }
            sourceElement$1545 = parseSourceElement$1097();
            if (typeof sourceElement$1545 === 'undefined') {
                break;
            }
            sourceElements$1546.push(sourceElement$1545);
        }
        expect$1014('}');
        state$975.labelSet = oldLabelSet$1550;
        state$975.inIteration = oldInIteration$1551;
        state$975.inSwitch = oldInSwitch$1552;
        state$975.inFunctionBody = oldInFunctionBody$1553;
        state$975.parenthesizedCount = oldParenthesizedCount$1554;
        return delegate$970.createBlockStatement(sourceElements$1546);
    }
    function validateParam$1085(options$1555, param$1556, name$1557) {
        var key$1558 = '$' + name$1557;
        if (strict$961) {
            if (isRestrictedWord$988(name$1557)) {
                options$1555.stricted = param$1556;
                options$1555.message = Messages$956.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1555.paramSet, key$1558)) {
                options$1555.stricted = param$1556;
                options$1555.message = Messages$956.StrictParamDupe;
            }
        } else if (!options$1555.firstRestricted) {
            if (isRestrictedWord$988(name$1557)) {
                options$1555.firstRestricted = param$1556;
                options$1555.message = Messages$956.StrictParamName;
            } else if (isStrictModeReservedWord$987(name$1557)) {
                options$1555.firstRestricted = param$1556;
                options$1555.message = Messages$956.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1555.paramSet, key$1558)) {
                options$1555.firstRestricted = param$1556;
                options$1555.message = Messages$956.StrictParamDupe;
            }
        }
        options$1555.paramSet[key$1558] = true;
    }
    function parseParam$1086(options$1559) {
        var token$1560, rest$1561, param$1562, def$1563;
        token$1560 = lookahead$973;
        if (token$1560.value === '...') {
            token$1560 = lex$1007();
            rest$1561 = true;
        }
        if (match$1016('[')) {
            param$1562 = parseArrayInitialiser$1023();
            reinterpretAsDestructuredParameter$1047(options$1559, param$1562);
        } else if (match$1016('{')) {
            if (rest$1561) {
                throwError$1011({}, Messages$956.ObjectPatternAsRestParameter);
            }
            param$1562 = parseObjectInitialiser$1028();
            reinterpretAsDestructuredParameter$1047(options$1559, param$1562);
        } else {
            param$1562 = parseVariableIdentifier$1054();
            validateParam$1085(options$1559, token$1560, token$1560.value);
            if (match$1016('=')) {
                if (rest$1561) {
                    throwErrorTolerant$1012(lookahead$973, Messages$956.DefaultRestParameter);
                }
                lex$1007();
                def$1563 = parseAssignmentExpression$1050();
                ++options$1559.defaultCount;
            }
        }
        if (rest$1561) {
            if (!match$1016(')')) {
                throwError$1011({}, Messages$956.ParameterAfterRestParameter);
            }
            options$1559.rest = param$1562;
            return false;
        }
        options$1559.params.push(param$1562);
        options$1559.defaults.push(def$1563);
        return !match$1016(')');
    }
    function parseParams$1087(firstRestricted$1564) {
        var options$1565;
        options$1565 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1564
        };
        expect$1014('(');
        if (!match$1016(')')) {
            options$1565.paramSet = {};
            while (streamIndex$972 < length$969) {
                if (!parseParam$1086(options$1565)) {
                    break;
                }
                expect$1014(',');
            }
        }
        expect$1014(')');
        if (options$1565.defaultCount === 0) {
            options$1565.defaults = [];
        }
        return options$1565;
    }
    function parseFunctionDeclaration$1088() {
        var id$1566, body$1567, token$1568, tmp$1569, firstRestricted$1570, message$1571, previousStrict$1572, previousYieldAllowed$1573, generator$1574, expression$1575;
        expectKeyword$1015('function');
        generator$1574 = false;
        if (match$1016('*')) {
            lex$1007();
            generator$1574 = true;
        }
        token$1568 = lookahead$973;
        id$1566 = parseVariableIdentifier$1054();
        if (strict$961) {
            if (isRestrictedWord$988(token$1568.value)) {
                throwErrorTolerant$1012(token$1568, Messages$956.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$988(token$1568.value)) {
                firstRestricted$1570 = token$1568;
                message$1571 = Messages$956.StrictFunctionName;
            } else if (isStrictModeReservedWord$987(token$1568.value)) {
                firstRestricted$1570 = token$1568;
                message$1571 = Messages$956.StrictReservedWord;
            }
        }
        tmp$1569 = parseParams$1087(firstRestricted$1570);
        firstRestricted$1570 = tmp$1569.firstRestricted;
        if (tmp$1569.message) {
            message$1571 = tmp$1569.message;
        }
        previousStrict$1572 = strict$961;
        previousYieldAllowed$1573 = state$975.yieldAllowed;
        state$975.yieldAllowed = generator$1574;
        // here we redo some work in order to set 'expression'
        expression$1575 = !match$1016('{');
        body$1567 = parseConciseBody$1083();
        if (strict$961 && firstRestricted$1570) {
            throwError$1011(firstRestricted$1570, message$1571);
        }
        if (strict$961 && tmp$1569.stricted) {
            throwErrorTolerant$1012(tmp$1569.stricted, message$1571);
        }
        if (state$975.yieldAllowed && !state$975.yieldFound) {
            throwErrorTolerant$1012({}, Messages$956.NoYieldInGenerator);
        }
        strict$961 = previousStrict$1572;
        state$975.yieldAllowed = previousYieldAllowed$1573;
        return delegate$970.createFunctionDeclaration(id$1566, tmp$1569.params, tmp$1569.defaults, body$1567, tmp$1569.rest, generator$1574, expression$1575);
    }
    function parseFunctionExpression$1089() {
        var token$1576, id$1577 = null, firstRestricted$1578, message$1579, tmp$1580, body$1581, previousStrict$1582, previousYieldAllowed$1583, generator$1584, expression$1585;
        expectKeyword$1015('function');
        generator$1584 = false;
        if (match$1016('*')) {
            lex$1007();
            generator$1584 = true;
        }
        if (!match$1016('(')) {
            token$1576 = lookahead$973;
            id$1577 = parseVariableIdentifier$1054();
            if (strict$961) {
                if (isRestrictedWord$988(token$1576.value)) {
                    throwErrorTolerant$1012(token$1576, Messages$956.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$988(token$1576.value)) {
                    firstRestricted$1578 = token$1576;
                    message$1579 = Messages$956.StrictFunctionName;
                } else if (isStrictModeReservedWord$987(token$1576.value)) {
                    firstRestricted$1578 = token$1576;
                    message$1579 = Messages$956.StrictReservedWord;
                }
            }
        }
        tmp$1580 = parseParams$1087(firstRestricted$1578);
        firstRestricted$1578 = tmp$1580.firstRestricted;
        if (tmp$1580.message) {
            message$1579 = tmp$1580.message;
        }
        previousStrict$1582 = strict$961;
        previousYieldAllowed$1583 = state$975.yieldAllowed;
        state$975.yieldAllowed = generator$1584;
        // here we redo some work in order to set 'expression'
        expression$1585 = !match$1016('{');
        body$1581 = parseConciseBody$1083();
        if (strict$961 && firstRestricted$1578) {
            throwError$1011(firstRestricted$1578, message$1579);
        }
        if (strict$961 && tmp$1580.stricted) {
            throwErrorTolerant$1012(tmp$1580.stricted, message$1579);
        }
        if (state$975.yieldAllowed && !state$975.yieldFound) {
            throwErrorTolerant$1012({}, Messages$956.NoYieldInGenerator);
        }
        strict$961 = previousStrict$1582;
        state$975.yieldAllowed = previousYieldAllowed$1583;
        return delegate$970.createFunctionExpression(id$1577, tmp$1580.params, tmp$1580.defaults, body$1581, tmp$1580.rest, generator$1584, expression$1585);
    }
    function parseYieldExpression$1090() {
        var delegateFlag$1586, expr$1587, previousYieldAllowed$1588;
        expectKeyword$1015('yield');
        if (!state$975.yieldAllowed) {
            throwErrorTolerant$1012({}, Messages$956.IllegalYield);
        }
        delegateFlag$1586 = false;
        if (match$1016('*')) {
            lex$1007();
            delegateFlag$1586 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1588 = state$975.yieldAllowed;
        state$975.yieldAllowed = false;
        expr$1587 = parseAssignmentExpression$1050();
        state$975.yieldAllowed = previousYieldAllowed$1588;
        state$975.yieldFound = true;
        return delegate$970.createYieldExpression(expr$1587, delegateFlag$1586);
    }
    // 14 Classes
    function parseMethodDefinition$1091(existingPropNames$1589) {
        var token$1590, key$1591, param$1592, propType$1593, isValidDuplicateProp$1594 = false;
        if (lookahead$973.value === 'static') {
            propType$1593 = ClassPropertyType$959.static;
            lex$1007();
        } else {
            propType$1593 = ClassPropertyType$959.prototype;
        }
        if (match$1016('*')) {
            lex$1007();
            return delegate$970.createMethodDefinition(propType$1593, '', parseObjectPropertyKey$1026(), parsePropertyMethodFunction$1025({ generator: true }));
        }
        token$1590 = lookahead$973;
        key$1591 = parseObjectPropertyKey$1026();
        if (token$1590.value === 'get' && !match$1016('(')) {
            key$1591 = parseObjectPropertyKey$1026();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1589[propType$1593].hasOwnProperty(key$1591.name)) {
                isValidDuplicateProp$1594 = existingPropNames$1589[propType$1593][key$1591.name].get === undefined && existingPropNames$1589[propType$1593][key$1591.name].data === undefined && existingPropNames$1589[propType$1593][key$1591.name].set !== undefined;
                if (!isValidDuplicateProp$1594) {
                    throwError$1011(key$1591, Messages$956.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1589[propType$1593][key$1591.name] = {};
            }
            existingPropNames$1589[propType$1593][key$1591.name].get = true;
            expect$1014('(');
            expect$1014(')');
            return delegate$970.createMethodDefinition(propType$1593, 'get', key$1591, parsePropertyFunction$1024({ generator: false }));
        }
        if (token$1590.value === 'set' && !match$1016('(')) {
            key$1591 = parseObjectPropertyKey$1026();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1589[propType$1593].hasOwnProperty(key$1591.name)) {
                isValidDuplicateProp$1594 = existingPropNames$1589[propType$1593][key$1591.name].set === undefined && existingPropNames$1589[propType$1593][key$1591.name].data === undefined && existingPropNames$1589[propType$1593][key$1591.name].get !== undefined;
                if (!isValidDuplicateProp$1594) {
                    throwError$1011(key$1591, Messages$956.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1589[propType$1593][key$1591.name] = {};
            }
            existingPropNames$1589[propType$1593][key$1591.name].set = true;
            expect$1014('(');
            token$1590 = lookahead$973;
            param$1592 = [parseVariableIdentifier$1054()];
            expect$1014(')');
            return delegate$970.createMethodDefinition(propType$1593, 'set', key$1591, parsePropertyFunction$1024({
                params: param$1592,
                generator: false,
                name: token$1590
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1589[propType$1593].hasOwnProperty(key$1591.name)) {
            throwError$1011(key$1591, Messages$956.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1589[propType$1593][key$1591.name] = {};
        }
        existingPropNames$1589[propType$1593][key$1591.name].data = true;
        return delegate$970.createMethodDefinition(propType$1593, '', key$1591, parsePropertyMethodFunction$1025({ generator: false }));
    }
    function parseClassElement$1092(existingProps$1595) {
        if (match$1016(';')) {
            lex$1007();
            return;
        }
        return parseMethodDefinition$1091(existingProps$1595);
    }
    function parseClassBody$1093() {
        var classElement$1596, classElements$1597 = [], existingProps$1598 = {};
        existingProps$1598[ClassPropertyType$959.static] = {};
        existingProps$1598[ClassPropertyType$959.prototype] = {};
        expect$1014('{');
        while (streamIndex$972 < length$969) {
            if (match$1016('}')) {
                break;
            }
            classElement$1596 = parseClassElement$1092(existingProps$1598);
            if (typeof classElement$1596 !== 'undefined') {
                classElements$1597.push(classElement$1596);
            }
        }
        expect$1014('}');
        return delegate$970.createClassBody(classElements$1597);
    }
    function parseClassExpression$1094() {
        var id$1599, previousYieldAllowed$1600, superClass$1601 = null;
        expectKeyword$1015('class');
        if (!matchKeyword$1017('extends') && !match$1016('{')) {
            id$1599 = parseVariableIdentifier$1054();
        }
        if (matchKeyword$1017('extends')) {
            expectKeyword$1015('extends');
            previousYieldAllowed$1600 = state$975.yieldAllowed;
            state$975.yieldAllowed = false;
            superClass$1601 = parseAssignmentExpression$1050();
            state$975.yieldAllowed = previousYieldAllowed$1600;
        }
        return delegate$970.createClassExpression(id$1599, superClass$1601, parseClassBody$1093());
    }
    function parseClassDeclaration$1095() {
        var id$1602, previousYieldAllowed$1603, superClass$1604 = null;
        expectKeyword$1015('class');
        id$1602 = parseVariableIdentifier$1054();
        if (matchKeyword$1017('extends')) {
            expectKeyword$1015('extends');
            previousYieldAllowed$1603 = state$975.yieldAllowed;
            state$975.yieldAllowed = false;
            superClass$1604 = parseAssignmentExpression$1050();
            state$975.yieldAllowed = previousYieldAllowed$1603;
        }
        return delegate$970.createClassDeclaration(id$1602, superClass$1604, parseClassBody$1093());
    }
    // 15 Program
    function matchModuleDeclaration$1096() {
        var id$1605;
        if (matchContextualKeyword$1018('module')) {
            id$1605 = lookahead2$1009();
            return id$1605.type === Token$951.StringLiteral || id$1605.type === Token$951.Identifier;
        }
        return false;
    }
    function parseSourceElement$1097() {
        if (lookahead$973.type === Token$951.Keyword) {
            switch (lookahead$973.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$1058(lookahead$973.value);
            case 'function':
                return parseFunctionDeclaration$1088();
            case 'export':
                return parseExportDeclaration$1062();
            case 'import':
                return parseImportDeclaration$1063();
            default:
                return parseStatement$1082();
            }
        }
        if (matchModuleDeclaration$1096()) {
            throwError$1011({}, Messages$956.NestedModule);
        }
        if (lookahead$973.type !== Token$951.EOF) {
            return parseStatement$1082();
        }
    }
    function parseProgramElement$1098() {
        if (lookahead$973.type === Token$951.Keyword) {
            switch (lookahead$973.value) {
            case 'export':
                return parseExportDeclaration$1062();
            case 'import':
                return parseImportDeclaration$1063();
            }
        }
        if (matchModuleDeclaration$1096()) {
            return parseModuleDeclaration$1059();
        }
        return parseSourceElement$1097();
    }
    function parseProgramElements$1099() {
        var sourceElement$1606, sourceElements$1607 = [], token$1608, directive$1609, firstRestricted$1610;
        while (streamIndex$972 < length$969) {
            token$1608 = lookahead$973;
            if (token$1608.type !== Token$951.StringLiteral) {
                break;
            }
            sourceElement$1606 = parseProgramElement$1098();
            sourceElements$1607.push(sourceElement$1606);
            if (sourceElement$1606.expression.type !== Syntax$954.Literal) {
                // this is not directive
                break;
            }
            directive$1609 = token$1608.value;
            if (directive$1609 === 'use strict') {
                strict$961 = true;
                if (firstRestricted$1610) {
                    throwErrorTolerant$1012(firstRestricted$1610, Messages$956.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1610 && token$1608.octal) {
                    firstRestricted$1610 = token$1608;
                }
            }
        }
        while (streamIndex$972 < length$969) {
            sourceElement$1606 = parseProgramElement$1098();
            if (typeof sourceElement$1606 === 'undefined') {
                break;
            }
            sourceElements$1607.push(sourceElement$1606);
        }
        return sourceElements$1607;
    }
    function parseModuleElement$1100() {
        return parseSourceElement$1097();
    }
    function parseModuleElements$1101() {
        var list$1611 = [], statement$1612;
        while (streamIndex$972 < length$969) {
            if (match$1016('}')) {
                break;
            }
            statement$1612 = parseModuleElement$1100();
            if (typeof statement$1612 === 'undefined') {
                break;
            }
            list$1611.push(statement$1612);
        }
        return list$1611;
    }
    function parseModuleBlock$1102() {
        var block$1613;
        expect$1014('{');
        block$1613 = parseModuleElements$1101();
        expect$1014('}');
        return delegate$970.createBlockStatement(block$1613);
    }
    function parseProgram$1103() {
        var body$1614;
        strict$961 = false;
        peek$1008();
        body$1614 = parseProgramElements$1099();
        return delegate$970.createProgram(body$1614);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1104(type$1615, value$1616, start$1617, end$1618, loc$1619) {
        assert$977(typeof start$1617 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$976.comments.length > 0) {
            if (extra$976.comments[extra$976.comments.length - 1].range[1] > start$1617) {
                return;
            }
        }
        extra$976.comments.push({
            type: type$1615,
            value: value$1616,
            range: [
                start$1617,
                end$1618
            ],
            loc: loc$1619
        });
    }
    function scanComment$1105() {
        var comment$1620, ch$1621, loc$1622, start$1623, blockComment$1624, lineComment$1625;
        comment$1620 = '';
        blockComment$1624 = false;
        lineComment$1625 = false;
        while (index$962 < length$969) {
            ch$1621 = source$960[index$962];
            if (lineComment$1625) {
                ch$1621 = source$960[index$962++];
                if (isLineTerminator$983(ch$1621.charCodeAt(0))) {
                    loc$1622.end = {
                        line: lineNumber$963,
                        column: index$962 - lineStart$964 - 1
                    };
                    lineComment$1625 = false;
                    addComment$1104('Line', comment$1620, start$1623, index$962 - 1, loc$1622);
                    if (ch$1621 === '\r' && source$960[index$962] === '\n') {
                        ++index$962;
                    }
                    ++lineNumber$963;
                    lineStart$964 = index$962;
                    comment$1620 = '';
                } else if (index$962 >= length$969) {
                    lineComment$1625 = false;
                    comment$1620 += ch$1621;
                    loc$1622.end = {
                        line: lineNumber$963,
                        column: length$969 - lineStart$964
                    };
                    addComment$1104('Line', comment$1620, start$1623, length$969, loc$1622);
                } else {
                    comment$1620 += ch$1621;
                }
            } else if (blockComment$1624) {
                if (isLineTerminator$983(ch$1621.charCodeAt(0))) {
                    if (ch$1621 === '\r' && source$960[index$962 + 1] === '\n') {
                        ++index$962;
                        comment$1620 += '\r\n';
                    } else {
                        comment$1620 += ch$1621;
                    }
                    ++lineNumber$963;
                    ++index$962;
                    lineStart$964 = index$962;
                    if (index$962 >= length$969) {
                        throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1621 = source$960[index$962++];
                    if (index$962 >= length$969) {
                        throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1620 += ch$1621;
                    if (ch$1621 === '*') {
                        ch$1621 = source$960[index$962];
                        if (ch$1621 === '/') {
                            comment$1620 = comment$1620.substr(0, comment$1620.length - 1);
                            blockComment$1624 = false;
                            ++index$962;
                            loc$1622.end = {
                                line: lineNumber$963,
                                column: index$962 - lineStart$964
                            };
                            addComment$1104('Block', comment$1620, start$1623, index$962, loc$1622);
                            comment$1620 = '';
                        }
                    }
                }
            } else if (ch$1621 === '/') {
                ch$1621 = source$960[index$962 + 1];
                if (ch$1621 === '/') {
                    loc$1622 = {
                        start: {
                            line: lineNumber$963,
                            column: index$962 - lineStart$964
                        }
                    };
                    start$1623 = index$962;
                    index$962 += 2;
                    lineComment$1625 = true;
                    if (index$962 >= length$969) {
                        loc$1622.end = {
                            line: lineNumber$963,
                            column: index$962 - lineStart$964
                        };
                        lineComment$1625 = false;
                        addComment$1104('Line', comment$1620, start$1623, index$962, loc$1622);
                    }
                } else if (ch$1621 === '*') {
                    start$1623 = index$962;
                    index$962 += 2;
                    blockComment$1624 = true;
                    loc$1622 = {
                        start: {
                            line: lineNumber$963,
                            column: index$962 - lineStart$964 - 2
                        }
                    };
                    if (index$962 >= length$969) {
                        throwError$1011({}, Messages$956.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$982(ch$1621.charCodeAt(0))) {
                ++index$962;
            } else if (isLineTerminator$983(ch$1621.charCodeAt(0))) {
                ++index$962;
                if (ch$1621 === '\r' && source$960[index$962] === '\n') {
                    ++index$962;
                }
                ++lineNumber$963;
                lineStart$964 = index$962;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1106() {
        var i$1626, entry$1627, comment$1628, comments$1629 = [];
        for (i$1626 = 0; i$1626 < extra$976.comments.length; ++i$1626) {
            entry$1627 = extra$976.comments[i$1626];
            comment$1628 = {
                type: entry$1627.type,
                value: entry$1627.value
            };
            if (extra$976.range) {
                comment$1628.range = entry$1627.range;
            }
            if (extra$976.loc) {
                comment$1628.loc = entry$1627.loc;
            }
            comments$1629.push(comment$1628);
        }
        extra$976.comments = comments$1629;
    }
    function collectToken$1107() {
        var start$1630, loc$1631, token$1632, range$1633, value$1634;
        skipComment$990();
        start$1630 = index$962;
        loc$1631 = {
            start: {
                line: lineNumber$963,
                column: index$962 - lineStart$964
            }
        };
        token$1632 = extra$976.advance();
        loc$1631.end = {
            line: lineNumber$963,
            column: index$962 - lineStart$964
        };
        if (token$1632.type !== Token$951.EOF) {
            range$1633 = [
                token$1632.range[0],
                token$1632.range[1]
            ];
            value$1634 = source$960.slice(token$1632.range[0], token$1632.range[1]);
            extra$976.tokens.push({
                type: TokenName$952[token$1632.type],
                value: value$1634,
                range: range$1633,
                loc: loc$1631
            });
        }
        return token$1632;
    }
    function collectRegex$1108() {
        var pos$1635, loc$1636, regex$1637, token$1638;
        skipComment$990();
        pos$1635 = index$962;
        loc$1636 = {
            start: {
                line: lineNumber$963,
                column: index$962 - lineStart$964
            }
        };
        regex$1637 = extra$976.scanRegExp();
        loc$1636.end = {
            line: lineNumber$963,
            column: index$962 - lineStart$964
        };
        if (!extra$976.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$976.tokens.length > 0) {
                token$1638 = extra$976.tokens[extra$976.tokens.length - 1];
                if (token$1638.range[0] === pos$1635 && token$1638.type === 'Punctuator') {
                    if (token$1638.value === '/' || token$1638.value === '/=') {
                        extra$976.tokens.pop();
                    }
                }
            }
            extra$976.tokens.push({
                type: 'RegularExpression',
                value: regex$1637.literal,
                range: [
                    pos$1635,
                    index$962
                ],
                loc: loc$1636
            });
        }
        return regex$1637;
    }
    function filterTokenLocation$1109() {
        var i$1639, entry$1640, token$1641, tokens$1642 = [];
        for (i$1639 = 0; i$1639 < extra$976.tokens.length; ++i$1639) {
            entry$1640 = extra$976.tokens[i$1639];
            token$1641 = {
                type: entry$1640.type,
                value: entry$1640.value
            };
            if (extra$976.range) {
                token$1641.range = entry$1640.range;
            }
            if (extra$976.loc) {
                token$1641.loc = entry$1640.loc;
            }
            tokens$1642.push(token$1641);
        }
        extra$976.tokens = tokens$1642;
    }
    function LocationMarker$1110() {
        var sm_index$1643 = lookahead$973 ? lookahead$973.sm_range[0] : 0;
        var sm_lineStart$1644 = lookahead$973 ? lookahead$973.sm_lineStart : 0;
        var sm_lineNumber$1645 = lookahead$973 ? lookahead$973.sm_lineNumber : 1;
        this.range = [
            sm_index$1643,
            sm_index$1643
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1645,
                column: sm_index$1643 - sm_lineStart$1644
            },
            end: {
                line: sm_lineNumber$1645,
                column: sm_index$1643 - sm_lineStart$1644
            }
        };
    }
    LocationMarker$1110.prototype = {
        constructor: LocationMarker$1110,
        end: function () {
            this.range[1] = sm_index$968;
            this.loc.end.line = sm_lineNumber$965;
            this.loc.end.column = sm_index$968 - sm_lineStart$966;
        },
        applyGroup: function (node$1646) {
            if (extra$976.range) {
                node$1646.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$976.loc) {
                node$1646.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1646 = delegate$970.postProcess(node$1646);
            }
        },
        apply: function (node$1647) {
            var nodeType$1648 = typeof node$1647;
            assert$977(nodeType$1648 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1648);
            if (extra$976.range) {
                node$1647.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$976.loc) {
                node$1647.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1647 = delegate$970.postProcess(node$1647);
            }
        }
    };
    function createLocationMarker$1111() {
        return new LocationMarker$1110();
    }
    function trackGroupExpression$1112() {
        var marker$1649, expr$1650;
        marker$1649 = createLocationMarker$1111();
        expect$1014('(');
        ++state$975.parenthesizedCount;
        expr$1650 = parseExpression$1051();
        expect$1014(')');
        marker$1649.end();
        marker$1649.applyGroup(expr$1650);
        return expr$1650;
    }
    function trackLeftHandSideExpression$1113() {
        var marker$1651, expr$1652;
        // skipComment();
        marker$1651 = createLocationMarker$1111();
        expr$1652 = matchKeyword$1017('new') ? parseNewExpression$1038() : parsePrimaryExpression$1032();
        while (match$1016('.') || match$1016('[') || lookahead$973.type === Token$951.Template) {
            if (match$1016('[')) {
                expr$1652 = delegate$970.createMemberExpression('[', expr$1652, parseComputedMember$1037());
                marker$1651.end();
                marker$1651.apply(expr$1652);
            } else if (match$1016('.')) {
                expr$1652 = delegate$970.createMemberExpression('.', expr$1652, parseNonComputedMember$1036());
                marker$1651.end();
                marker$1651.apply(expr$1652);
            } else {
                expr$1652 = delegate$970.createTaggedTemplateExpression(expr$1652, parseTemplateLiteral$1030());
                marker$1651.end();
                marker$1651.apply(expr$1652);
            }
        }
        return expr$1652;
    }
    function trackLeftHandSideExpressionAllowCall$1114() {
        var marker$1653, expr$1654, args$1655;
        // skipComment();
        marker$1653 = createLocationMarker$1111();
        expr$1654 = matchKeyword$1017('new') ? parseNewExpression$1038() : parsePrimaryExpression$1032();
        while (match$1016('.') || match$1016('[') || match$1016('(') || lookahead$973.type === Token$951.Template) {
            if (match$1016('(')) {
                args$1655 = parseArguments$1033();
                expr$1654 = delegate$970.createCallExpression(expr$1654, args$1655);
                marker$1653.end();
                marker$1653.apply(expr$1654);
            } else if (match$1016('[')) {
                expr$1654 = delegate$970.createMemberExpression('[', expr$1654, parseComputedMember$1037());
                marker$1653.end();
                marker$1653.apply(expr$1654);
            } else if (match$1016('.')) {
                expr$1654 = delegate$970.createMemberExpression('.', expr$1654, parseNonComputedMember$1036());
                marker$1653.end();
                marker$1653.apply(expr$1654);
            } else {
                expr$1654 = delegate$970.createTaggedTemplateExpression(expr$1654, parseTemplateLiteral$1030());
                marker$1653.end();
                marker$1653.apply(expr$1654);
            }
        }
        return expr$1654;
    }
    function filterGroup$1115(node$1656) {
        var n$1657, i$1658, entry$1659;
        n$1657 = Object.prototype.toString.apply(node$1656) === '[object Array]' ? [] : {};
        for (i$1658 in node$1656) {
            if (node$1656.hasOwnProperty(i$1658) && i$1658 !== 'groupRange' && i$1658 !== 'groupLoc') {
                entry$1659 = node$1656[i$1658];
                if (entry$1659 === null || typeof entry$1659 !== 'object' || entry$1659 instanceof RegExp) {
                    n$1657[i$1658] = entry$1659;
                } else {
                    n$1657[i$1658] = filterGroup$1115(entry$1659);
                }
            }
        }
        return n$1657;
    }
    function wrapTrackingFunction$1116(range$1660, loc$1661) {
        return function (parseFunction$1662) {
            function isBinary$1663(node$1665) {
                return node$1665.type === Syntax$954.LogicalExpression || node$1665.type === Syntax$954.BinaryExpression;
            }
            function visit$1664(node$1666) {
                var start$1667, end$1668;
                if (isBinary$1663(node$1666.left)) {
                    visit$1664(node$1666.left);
                }
                if (isBinary$1663(node$1666.right)) {
                    visit$1664(node$1666.right);
                }
                if (range$1660) {
                    if (node$1666.left.groupRange || node$1666.right.groupRange) {
                        start$1667 = node$1666.left.groupRange ? node$1666.left.groupRange[0] : node$1666.left.range[0];
                        end$1668 = node$1666.right.groupRange ? node$1666.right.groupRange[1] : node$1666.right.range[1];
                        node$1666.range = [
                            start$1667,
                            end$1668
                        ];
                    } else if (typeof node$1666.range === 'undefined') {
                        start$1667 = node$1666.left.range[0];
                        end$1668 = node$1666.right.range[1];
                        node$1666.range = [
                            start$1667,
                            end$1668
                        ];
                    }
                }
                if (loc$1661) {
                    if (node$1666.left.groupLoc || node$1666.right.groupLoc) {
                        start$1667 = node$1666.left.groupLoc ? node$1666.left.groupLoc.start : node$1666.left.loc.start;
                        end$1668 = node$1666.right.groupLoc ? node$1666.right.groupLoc.end : node$1666.right.loc.end;
                        node$1666.loc = {
                            start: start$1667,
                            end: end$1668
                        };
                        node$1666 = delegate$970.postProcess(node$1666);
                    } else if (typeof node$1666.loc === 'undefined') {
                        node$1666.loc = {
                            start: node$1666.left.loc.start,
                            end: node$1666.right.loc.end
                        };
                        node$1666 = delegate$970.postProcess(node$1666);
                    }
                }
            }
            return function () {
                var marker$1669, node$1670, curr$1671 = lookahead$973;
                marker$1669 = createLocationMarker$1111();
                node$1670 = parseFunction$1662.apply(null, arguments);
                marker$1669.end();
                if (node$1670.type !== Syntax$954.Program) {
                    if (curr$1671.leadingComments) {
                        node$1670.leadingComments = curr$1671.leadingComments;
                    }
                    if (curr$1671.trailingComments) {
                        node$1670.trailingComments = curr$1671.trailingComments;
                    }
                }
                if (range$1660 && typeof node$1670.range === 'undefined') {
                    marker$1669.apply(node$1670);
                }
                if (loc$1661 && typeof node$1670.loc === 'undefined') {
                    marker$1669.apply(node$1670);
                }
                if (isBinary$1663(node$1670)) {
                    visit$1664(node$1670);
                }
                return node$1670;
            };
        };
    }
    function patch$1117() {
        var wrapTracking$1672;
        if (extra$976.comments) {
            extra$976.skipComment = skipComment$990;
            skipComment$990 = scanComment$1105;
        }
        if (extra$976.range || extra$976.loc) {
            extra$976.parseGroupExpression = parseGroupExpression$1031;
            extra$976.parseLeftHandSideExpression = parseLeftHandSideExpression$1040;
            extra$976.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$1039;
            parseGroupExpression$1031 = trackGroupExpression$1112;
            parseLeftHandSideExpression$1040 = trackLeftHandSideExpression$1113;
            parseLeftHandSideExpressionAllowCall$1039 = trackLeftHandSideExpressionAllowCall$1114;
            wrapTracking$1672 = wrapTrackingFunction$1116(extra$976.range, extra$976.loc);
            extra$976.parseArrayInitialiser = parseArrayInitialiser$1023;
            extra$976.parseAssignmentExpression = parseAssignmentExpression$1050;
            extra$976.parseBinaryExpression = parseBinaryExpression$1044;
            extra$976.parseBlock = parseBlock$1053;
            extra$976.parseFunctionSourceElements = parseFunctionSourceElements$1084;
            extra$976.parseCatchClause = parseCatchClause$1079;
            extra$976.parseComputedMember = parseComputedMember$1037;
            extra$976.parseConditionalExpression = parseConditionalExpression$1045;
            extra$976.parseConstLetDeclaration = parseConstLetDeclaration$1058;
            extra$976.parseExportBatchSpecifier = parseExportBatchSpecifier$1060;
            extra$976.parseExportDeclaration = parseExportDeclaration$1062;
            extra$976.parseExportSpecifier = parseExportSpecifier$1061;
            extra$976.parseExpression = parseExpression$1051;
            extra$976.parseForVariableDeclaration = parseForVariableDeclaration$1070;
            extra$976.parseFunctionDeclaration = parseFunctionDeclaration$1088;
            extra$976.parseFunctionExpression = parseFunctionExpression$1089;
            extra$976.parseParams = parseParams$1087;
            extra$976.parseImportDeclaration = parseImportDeclaration$1063;
            extra$976.parseImportSpecifier = parseImportSpecifier$1064;
            extra$976.parseModuleDeclaration = parseModuleDeclaration$1059;
            extra$976.parseModuleBlock = parseModuleBlock$1102;
            extra$976.parseNewExpression = parseNewExpression$1038;
            extra$976.parseNonComputedProperty = parseNonComputedProperty$1035;
            extra$976.parseObjectInitialiser = parseObjectInitialiser$1028;
            extra$976.parseObjectProperty = parseObjectProperty$1027;
            extra$976.parseObjectPropertyKey = parseObjectPropertyKey$1026;
            extra$976.parsePostfixExpression = parsePostfixExpression$1041;
            extra$976.parsePrimaryExpression = parsePrimaryExpression$1032;
            extra$976.parseProgram = parseProgram$1103;
            extra$976.parsePropertyFunction = parsePropertyFunction$1024;
            extra$976.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$1034;
            extra$976.parseTemplateElement = parseTemplateElement$1029;
            extra$976.parseTemplateLiteral = parseTemplateLiteral$1030;
            extra$976.parseStatement = parseStatement$1082;
            extra$976.parseSwitchCase = parseSwitchCase$1076;
            extra$976.parseUnaryExpression = parseUnaryExpression$1042;
            extra$976.parseVariableDeclaration = parseVariableDeclaration$1055;
            extra$976.parseVariableIdentifier = parseVariableIdentifier$1054;
            extra$976.parseMethodDefinition = parseMethodDefinition$1091;
            extra$976.parseClassDeclaration = parseClassDeclaration$1095;
            extra$976.parseClassExpression = parseClassExpression$1094;
            extra$976.parseClassBody = parseClassBody$1093;
            parseArrayInitialiser$1023 = wrapTracking$1672(extra$976.parseArrayInitialiser);
            parseAssignmentExpression$1050 = wrapTracking$1672(extra$976.parseAssignmentExpression);
            parseBinaryExpression$1044 = wrapTracking$1672(extra$976.parseBinaryExpression);
            parseBlock$1053 = wrapTracking$1672(extra$976.parseBlock);
            parseFunctionSourceElements$1084 = wrapTracking$1672(extra$976.parseFunctionSourceElements);
            parseCatchClause$1079 = wrapTracking$1672(extra$976.parseCatchClause);
            parseComputedMember$1037 = wrapTracking$1672(extra$976.parseComputedMember);
            parseConditionalExpression$1045 = wrapTracking$1672(extra$976.parseConditionalExpression);
            parseConstLetDeclaration$1058 = wrapTracking$1672(extra$976.parseConstLetDeclaration);
            parseExportBatchSpecifier$1060 = wrapTracking$1672(parseExportBatchSpecifier$1060);
            parseExportDeclaration$1062 = wrapTracking$1672(parseExportDeclaration$1062);
            parseExportSpecifier$1061 = wrapTracking$1672(parseExportSpecifier$1061);
            parseExpression$1051 = wrapTracking$1672(extra$976.parseExpression);
            parseForVariableDeclaration$1070 = wrapTracking$1672(extra$976.parseForVariableDeclaration);
            parseFunctionDeclaration$1088 = wrapTracking$1672(extra$976.parseFunctionDeclaration);
            parseFunctionExpression$1089 = wrapTracking$1672(extra$976.parseFunctionExpression);
            parseParams$1087 = wrapTracking$1672(extra$976.parseParams);
            parseImportDeclaration$1063 = wrapTracking$1672(extra$976.parseImportDeclaration);
            parseImportSpecifier$1064 = wrapTracking$1672(extra$976.parseImportSpecifier);
            parseModuleDeclaration$1059 = wrapTracking$1672(extra$976.parseModuleDeclaration);
            parseModuleBlock$1102 = wrapTracking$1672(extra$976.parseModuleBlock);
            parseLeftHandSideExpression$1040 = wrapTracking$1672(parseLeftHandSideExpression$1040);
            parseNewExpression$1038 = wrapTracking$1672(extra$976.parseNewExpression);
            parseNonComputedProperty$1035 = wrapTracking$1672(extra$976.parseNonComputedProperty);
            parseObjectInitialiser$1028 = wrapTracking$1672(extra$976.parseObjectInitialiser);
            parseObjectProperty$1027 = wrapTracking$1672(extra$976.parseObjectProperty);
            parseObjectPropertyKey$1026 = wrapTracking$1672(extra$976.parseObjectPropertyKey);
            parsePostfixExpression$1041 = wrapTracking$1672(extra$976.parsePostfixExpression);
            parsePrimaryExpression$1032 = wrapTracking$1672(extra$976.parsePrimaryExpression);
            parseProgram$1103 = wrapTracking$1672(extra$976.parseProgram);
            parsePropertyFunction$1024 = wrapTracking$1672(extra$976.parsePropertyFunction);
            parseTemplateElement$1029 = wrapTracking$1672(extra$976.parseTemplateElement);
            parseTemplateLiteral$1030 = wrapTracking$1672(extra$976.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$1034 = wrapTracking$1672(extra$976.parseSpreadOrAssignmentExpression);
            parseStatement$1082 = wrapTracking$1672(extra$976.parseStatement);
            parseSwitchCase$1076 = wrapTracking$1672(extra$976.parseSwitchCase);
            parseUnaryExpression$1042 = wrapTracking$1672(extra$976.parseUnaryExpression);
            parseVariableDeclaration$1055 = wrapTracking$1672(extra$976.parseVariableDeclaration);
            parseVariableIdentifier$1054 = wrapTracking$1672(extra$976.parseVariableIdentifier);
            parseMethodDefinition$1091 = wrapTracking$1672(extra$976.parseMethodDefinition);
            parseClassDeclaration$1095 = wrapTracking$1672(extra$976.parseClassDeclaration);
            parseClassExpression$1094 = wrapTracking$1672(extra$976.parseClassExpression);
            parseClassBody$1093 = wrapTracking$1672(extra$976.parseClassBody);
        }
        if (typeof extra$976.tokens !== 'undefined') {
            extra$976.advance = advance$1006;
            extra$976.scanRegExp = scanRegExp$1003;
            advance$1006 = collectToken$1107;
            scanRegExp$1003 = collectRegex$1108;
        }
    }
    function unpatch$1118() {
        if (typeof extra$976.skipComment === 'function') {
            skipComment$990 = extra$976.skipComment;
        }
        if (extra$976.range || extra$976.loc) {
            parseArrayInitialiser$1023 = extra$976.parseArrayInitialiser;
            parseAssignmentExpression$1050 = extra$976.parseAssignmentExpression;
            parseBinaryExpression$1044 = extra$976.parseBinaryExpression;
            parseBlock$1053 = extra$976.parseBlock;
            parseFunctionSourceElements$1084 = extra$976.parseFunctionSourceElements;
            parseCatchClause$1079 = extra$976.parseCatchClause;
            parseComputedMember$1037 = extra$976.parseComputedMember;
            parseConditionalExpression$1045 = extra$976.parseConditionalExpression;
            parseConstLetDeclaration$1058 = extra$976.parseConstLetDeclaration;
            parseExportBatchSpecifier$1060 = extra$976.parseExportBatchSpecifier;
            parseExportDeclaration$1062 = extra$976.parseExportDeclaration;
            parseExportSpecifier$1061 = extra$976.parseExportSpecifier;
            parseExpression$1051 = extra$976.parseExpression;
            parseForVariableDeclaration$1070 = extra$976.parseForVariableDeclaration;
            parseFunctionDeclaration$1088 = extra$976.parseFunctionDeclaration;
            parseFunctionExpression$1089 = extra$976.parseFunctionExpression;
            parseImportDeclaration$1063 = extra$976.parseImportDeclaration;
            parseImportSpecifier$1064 = extra$976.parseImportSpecifier;
            parseGroupExpression$1031 = extra$976.parseGroupExpression;
            parseLeftHandSideExpression$1040 = extra$976.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$1039 = extra$976.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$1059 = extra$976.parseModuleDeclaration;
            parseModuleBlock$1102 = extra$976.parseModuleBlock;
            parseNewExpression$1038 = extra$976.parseNewExpression;
            parseNonComputedProperty$1035 = extra$976.parseNonComputedProperty;
            parseObjectInitialiser$1028 = extra$976.parseObjectInitialiser;
            parseObjectProperty$1027 = extra$976.parseObjectProperty;
            parseObjectPropertyKey$1026 = extra$976.parseObjectPropertyKey;
            parsePostfixExpression$1041 = extra$976.parsePostfixExpression;
            parsePrimaryExpression$1032 = extra$976.parsePrimaryExpression;
            parseProgram$1103 = extra$976.parseProgram;
            parsePropertyFunction$1024 = extra$976.parsePropertyFunction;
            parseTemplateElement$1029 = extra$976.parseTemplateElement;
            parseTemplateLiteral$1030 = extra$976.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$1034 = extra$976.parseSpreadOrAssignmentExpression;
            parseStatement$1082 = extra$976.parseStatement;
            parseSwitchCase$1076 = extra$976.parseSwitchCase;
            parseUnaryExpression$1042 = extra$976.parseUnaryExpression;
            parseVariableDeclaration$1055 = extra$976.parseVariableDeclaration;
            parseVariableIdentifier$1054 = extra$976.parseVariableIdentifier;
            parseMethodDefinition$1091 = extra$976.parseMethodDefinition;
            parseClassDeclaration$1095 = extra$976.parseClassDeclaration;
            parseClassExpression$1094 = extra$976.parseClassExpression;
            parseClassBody$1093 = extra$976.parseClassBody;
        }
        if (typeof extra$976.scanRegExp === 'function') {
            advance$1006 = extra$976.advance;
            scanRegExp$1003 = extra$976.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1119(object$1673, properties$1674) {
        var entry$1675, result$1676 = {};
        for (entry$1675 in object$1673) {
            if (object$1673.hasOwnProperty(entry$1675)) {
                result$1676[entry$1675] = object$1673[entry$1675];
            }
        }
        for (entry$1675 in properties$1674) {
            if (properties$1674.hasOwnProperty(entry$1675)) {
                result$1676[entry$1675] = properties$1674[entry$1675];
            }
        }
        return result$1676;
    }
    function tokenize$1120(code$1677, options$1678) {
        var toString$1679, token$1680, tokens$1681;
        toString$1679 = String;
        if (typeof code$1677 !== 'string' && !(code$1677 instanceof String)) {
            code$1677 = toString$1679(code$1677);
        }
        delegate$970 = SyntaxTreeDelegate$958;
        source$960 = code$1677;
        index$962 = 0;
        lineNumber$963 = source$960.length > 0 ? 1 : 0;
        lineStart$964 = 0;
        length$969 = source$960.length;
        lookahead$973 = null;
        state$975 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$976 = {};
        // Options matching.
        options$1678 = options$1678 || {};
        // Of course we collect tokens here.
        options$1678.tokens = true;
        extra$976.tokens = [];
        extra$976.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$976.openParenToken = -1;
        extra$976.openCurlyToken = -1;
        extra$976.range = typeof options$1678.range === 'boolean' && options$1678.range;
        extra$976.loc = typeof options$1678.loc === 'boolean' && options$1678.loc;
        if (typeof options$1678.comment === 'boolean' && options$1678.comment) {
            extra$976.comments = [];
        }
        if (typeof options$1678.tolerant === 'boolean' && options$1678.tolerant) {
            extra$976.errors = [];
        }
        if (length$969 > 0) {
            if (typeof source$960[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1677 instanceof String) {
                    source$960 = code$1677.valueOf();
                }
            }
        }
        patch$1117();
        try {
            peek$1008();
            if (lookahead$973.type === Token$951.EOF) {
                return extra$976.tokens;
            }
            token$1680 = lex$1007();
            while (lookahead$973.type !== Token$951.EOF) {
                try {
                    token$1680 = lex$1007();
                } catch (lexError$1682) {
                    token$1680 = lookahead$973;
                    if (extra$976.errors) {
                        extra$976.errors.push(lexError$1682);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1682;
                    }
                }
            }
            filterTokenLocation$1109();
            tokens$1681 = extra$976.tokens;
            if (typeof extra$976.comments !== 'undefined') {
                filterCommentLocation$1106();
                tokens$1681.comments = extra$976.comments;
            }
            if (typeof extra$976.errors !== 'undefined') {
                tokens$1681.errors = extra$976.errors;
            }
        } catch (e$1683) {
            throw e$1683;
        } finally {
            unpatch$1118();
            extra$976 = {};
        }
        return tokens$1681;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1121(toks$1684, start$1685, inExprDelim$1686, parentIsBlock$1687) {
        var assignOps$1688 = [
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
        var binaryOps$1689 = [
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
        var unaryOps$1690 = [
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
        function back$1691(n$1692) {
            var idx$1693 = toks$1684.length - n$1692 > 0 ? toks$1684.length - n$1692 : 0;
            return toks$1684[idx$1693];
        }
        if (inExprDelim$1686 && toks$1684.length - (start$1685 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1691(start$1685 + 2).value === ':' && parentIsBlock$1687) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$978(back$1691(start$1685 + 2).value, unaryOps$1690.concat(binaryOps$1689).concat(assignOps$1688))) {
            // ... + {...}
            return false;
        } else if (back$1691(start$1685 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1694 = typeof back$1691(start$1685 + 1).startLineNumber !== 'undefined' ? back$1691(start$1685 + 1).startLineNumber : back$1691(start$1685 + 1).lineNumber;
            if (back$1691(start$1685 + 2).lineNumber !== currLineNumber$1694) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$978(back$1691(start$1685 + 2).value, [
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
    function readToken$1122(toks$1695, inExprDelim$1696, parentIsBlock$1697) {
        var delimiters$1698 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1699 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1700 = toks$1695.length - 1;
        var comments$1701, commentsLen$1702 = extra$976.comments.length;
        function back$1703(n$1707) {
            var idx$1708 = toks$1695.length - n$1707 > 0 ? toks$1695.length - n$1707 : 0;
            return toks$1695[idx$1708];
        }
        function attachComments$1704(token$1709) {
            if (comments$1701) {
                token$1709.leadingComments = comments$1701;
            }
            return token$1709;
        }
        function _advance$1705() {
            return attachComments$1704(advance$1006());
        }
        function _scanRegExp$1706() {
            return attachComments$1704(scanRegExp$1003());
        }
        skipComment$990();
        if (extra$976.comments.length > commentsLen$1702) {
            comments$1701 = extra$976.comments.slice(commentsLen$1702);
        }
        if (isIn$978(source$960[index$962], delimiters$1698)) {
            return attachComments$1704(readDelim$1123(toks$1695, inExprDelim$1696, parentIsBlock$1697));
        }
        if (source$960[index$962] === '/') {
            var prev$1710 = back$1703(1);
            if (prev$1710) {
                if (prev$1710.value === '()') {
                    if (isIn$978(back$1703(2).value, parenIdents$1699)) {
                        // ... if (...) / ...
                        return _scanRegExp$1706();
                    }
                    // ... (...) / ...
                    return _advance$1705();
                }
                if (prev$1710.value === '{}') {
                    if (blockAllowed$1121(toks$1695, 0, inExprDelim$1696, parentIsBlock$1697)) {
                        if (back$1703(2).value === '()') {
                            // named function
                            if (back$1703(4).value === 'function') {
                                if (!blockAllowed$1121(toks$1695, 3, inExprDelim$1696, parentIsBlock$1697)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1705();
                                }
                                if (toks$1695.length - 5 <= 0 && inExprDelim$1696) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1705();
                                }
                            }
                            // unnamed function
                            if (back$1703(3).value === 'function') {
                                if (!blockAllowed$1121(toks$1695, 2, inExprDelim$1696, parentIsBlock$1697)) {
                                    // new function (...) {...} / ...
                                    return _advance$1705();
                                }
                                if (toks$1695.length - 4 <= 0 && inExprDelim$1696) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1705();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1706();
                    } else {
                        // ... + {...} / ...
                        return _advance$1705();
                    }
                }
                if (prev$1710.type === Token$951.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1706();
                }
                if (isKeyword$989(prev$1710.value)) {
                    // typeof /...
                    return _scanRegExp$1706();
                }
                return _advance$1705();
            }
            return _scanRegExp$1706();
        }
        return _advance$1705();
    }
    function readDelim$1123(toks$1711, inExprDelim$1712, parentIsBlock$1713) {
        var startDelim$1714 = advance$1006(), matchDelim$1715 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1716 = [];
        var delimiters$1717 = [
                '(',
                '{',
                '['
            ];
        assert$977(delimiters$1717.indexOf(startDelim$1714.value) !== -1, 'Need to begin at the delimiter');
        var token$1718 = startDelim$1714;
        var startLineNumber$1719 = token$1718.lineNumber;
        var startLineStart$1720 = token$1718.lineStart;
        var startRange$1721 = token$1718.range;
        var delimToken$1722 = {};
        delimToken$1722.type = Token$951.Delimiter;
        delimToken$1722.value = startDelim$1714.value + matchDelim$1715[startDelim$1714.value];
        delimToken$1722.startLineNumber = startLineNumber$1719;
        delimToken$1722.startLineStart = startLineStart$1720;
        delimToken$1722.startRange = startRange$1721;
        var delimIsBlock$1723 = false;
        if (startDelim$1714.value === '{') {
            delimIsBlock$1723 = blockAllowed$1121(toks$1711.concat(delimToken$1722), 0, inExprDelim$1712, parentIsBlock$1713);
        }
        while (index$962 <= length$969) {
            token$1718 = readToken$1122(inner$1716, startDelim$1714.value === '(' || startDelim$1714.value === '[', delimIsBlock$1723);
            if (token$1718.type === Token$951.Punctuator && token$1718.value === matchDelim$1715[startDelim$1714.value]) {
                if (token$1718.leadingComments) {
                    delimToken$1722.trailingComments = token$1718.leadingComments;
                }
                break;
            } else if (token$1718.type === Token$951.EOF) {
                throwError$1011({}, Messages$956.UnexpectedEOS);
            } else {
                inner$1716.push(token$1718);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$962 >= length$969 && matchDelim$1715[startDelim$1714.value] !== source$960[length$969 - 1]) {
            throwError$1011({}, Messages$956.UnexpectedEOS);
        }
        var endLineNumber$1724 = token$1718.lineNumber;
        var endLineStart$1725 = token$1718.lineStart;
        var endRange$1726 = token$1718.range;
        delimToken$1722.inner = inner$1716;
        delimToken$1722.endLineNumber = endLineNumber$1724;
        delimToken$1722.endLineStart = endLineStart$1725;
        delimToken$1722.endRange = endRange$1726;
        return delimToken$1722;
    }
    // (Str) -> [...CSyntax]
    function read$1124(code$1727) {
        var token$1728, tokenTree$1729 = [];
        extra$976 = {};
        extra$976.comments = [];
        patch$1117();
        source$960 = code$1727;
        index$962 = 0;
        lineNumber$963 = source$960.length > 0 ? 1 : 0;
        lineStart$964 = 0;
        length$969 = source$960.length;
        state$975 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$962 < length$969) {
            tokenTree$1729.push(readToken$1122(tokenTree$1729, false, false));
        }
        var last$1730 = tokenTree$1729[tokenTree$1729.length - 1];
        if (last$1730 && last$1730.type !== Token$951.EOF) {
            tokenTree$1729.push({
                type: Token$951.EOF,
                value: '',
                lineNumber: last$1730.lineNumber,
                lineStart: last$1730.lineStart,
                range: [
                    index$962,
                    index$962
                ]
            });
        }
        return expander$950.tokensToSyntax(tokenTree$1729);
    }
    function parse$1125(code$1731, options$1732) {
        var program$1733, toString$1734;
        extra$976 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1731)) {
            tokenStream$971 = code$1731;
            length$969 = tokenStream$971.length;
            lineNumber$963 = tokenStream$971.length > 0 ? 1 : 0;
            source$960 = undefined;
        } else {
            toString$1734 = String;
            if (typeof code$1731 !== 'string' && !(code$1731 instanceof String)) {
                code$1731 = toString$1734(code$1731);
            }
            source$960 = code$1731;
            length$969 = source$960.length;
            lineNumber$963 = source$960.length > 0 ? 1 : 0;
        }
        delegate$970 = SyntaxTreeDelegate$958;
        streamIndex$972 = -1;
        index$962 = 0;
        lineStart$964 = 0;
        sm_lineStart$966 = 0;
        sm_lineNumber$965 = lineNumber$963;
        sm_index$968 = 0;
        sm_range$967 = [
            0,
            0
        ];
        lookahead$973 = null;
        state$975 = {
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
        if (typeof options$1732 !== 'undefined') {
            extra$976.range = typeof options$1732.range === 'boolean' && options$1732.range;
            extra$976.loc = typeof options$1732.loc === 'boolean' && options$1732.loc;
            if (extra$976.loc && options$1732.source !== null && options$1732.source !== undefined) {
                delegate$970 = extend$1119(delegate$970, {
                    'postProcess': function (node$1735) {
                        node$1735.loc.source = toString$1734(options$1732.source);
                        return node$1735;
                    }
                });
            }
            if (typeof options$1732.tokens === 'boolean' && options$1732.tokens) {
                extra$976.tokens = [];
            }
            if (typeof options$1732.comment === 'boolean' && options$1732.comment) {
                extra$976.comments = [];
            }
            if (typeof options$1732.tolerant === 'boolean' && options$1732.tolerant) {
                extra$976.errors = [];
            }
        }
        if (length$969 > 0) {
            if (source$960 && typeof source$960[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1731 instanceof String) {
                    source$960 = code$1731.valueOf();
                }
            }
        }
        extra$976 = { loc: true };
        patch$1117();
        try {
            program$1733 = parseProgram$1103();
            if (typeof extra$976.comments !== 'undefined') {
                filterCommentLocation$1106();
                program$1733.comments = extra$976.comments;
            }
            if (typeof extra$976.tokens !== 'undefined') {
                filterTokenLocation$1109();
                program$1733.tokens = extra$976.tokens;
            }
            if (typeof extra$976.errors !== 'undefined') {
                program$1733.errors = extra$976.errors;
            }
            if (extra$976.range || extra$976.loc) {
                program$1733.body = filterGroup$1115(program$1733.body);
            }
        } catch (e$1736) {
            throw e$1736;
        } finally {
            unpatch$1118();
            extra$976 = {};
        }
        return program$1733;
    }
    exports$949.tokenize = tokenize$1120;
    exports$949.read = read$1124;
    exports$949.Token = Token$951;
    exports$949.parse = parse$1125;
    // Deep copy.
    exports$949.Syntax = function () {
        var name$1737, types$1738 = {};
        if (typeof Object.create === 'function') {
            types$1738 = Object.create(null);
        }
        for (name$1737 in Syntax$954) {
            if (Syntax$954.hasOwnProperty(name$1737)) {
                types$1738[name$1737] = Syntax$954[name$1737];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1738);
        }
        return types$1738;
    }();
}));
//# sourceMappingURL=parser.js.map