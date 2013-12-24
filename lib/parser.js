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
(function (root$943, factory$944) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$944);
    } else if (typeof exports !== 'undefined') {
        factory$944(exports, require('./expander'));
    } else {
        factory$944(root$943.esprima = {});
    }
}(this, function (exports$945, expander$946) {
    'use strict';
    var Token$947, TokenName$948, FnExprTokens$949, Syntax$950, PropertyKind$951, Messages$952, Regex$953, SyntaxTreeDelegate$954, ClassPropertyType$955, source$956, strict$957, index$958, lineNumber$959, lineStart$960, sm_lineNumber$961, sm_lineStart$962, sm_range$963, sm_index$964, length$965, delegate$966, tokenStream$967, streamIndex$968, lookahead$969, lookaheadIndex$970, state$971, extra$972;
    Token$947 = {
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
    TokenName$948 = {};
    TokenName$948[Token$947.BooleanLiteral] = 'Boolean';
    TokenName$948[Token$947.EOF] = '<end>';
    TokenName$948[Token$947.Identifier] = 'Identifier';
    TokenName$948[Token$947.Keyword] = 'Keyword';
    TokenName$948[Token$947.NullLiteral] = 'Null';
    TokenName$948[Token$947.NumericLiteral] = 'Numeric';
    TokenName$948[Token$947.Punctuator] = 'Punctuator';
    TokenName$948[Token$947.StringLiteral] = 'String';
    TokenName$948[Token$947.RegularExpression] = 'RegularExpression';
    TokenName$948[Token$947.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$949 = [
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
    Syntax$950 = {
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
    PropertyKind$951 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$955 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$952 = {
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
    Regex$953 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$973(condition$1122, message$1123) {
        if (!condition$1122) {
            throw new Error('ASSERT: ' + message$1123);
        }
    }
    function isIn$974(el$1124, list$1125) {
        return list$1125.indexOf(el$1124) !== -1;
    }
    function isDecimalDigit$975(ch$1126) {
        return ch$1126 >= 48 && ch$1126 <= 57;
    }    // 0..9
    function isHexDigit$976(ch$1127) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1127) >= 0;
    }
    function isOctalDigit$977(ch$1128) {
        return '01234567'.indexOf(ch$1128) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$978(ch$1129) {
        return ch$1129 === 32 || ch$1129 === 9 || ch$1129 === 11 || ch$1129 === 12 || ch$1129 === 160 || ch$1129 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1129)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$979(ch$1130) {
        return ch$1130 === 10 || ch$1130 === 13 || ch$1130 === 8232 || ch$1130 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$980(ch$1131) {
        return ch$1131 === 36 || ch$1131 === 95 || ch$1131 >= 65 && ch$1131 <= 90 || ch$1131 >= 97 && ch$1131 <= 122 || ch$1131 === 92 || ch$1131 >= 128 && Regex$953.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1131));
    }
    function isIdentifierPart$981(ch$1132) {
        return ch$1132 === 36 || ch$1132 === 95 || ch$1132 >= 65 && ch$1132 <= 90 || ch$1132 >= 97 && ch$1132 <= 122 || ch$1132 >= 48 && ch$1132 <= 57 || ch$1132 === 92 || ch$1132 >= 128 && Regex$953.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1132));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$982(id$1133) {
        switch (id$1133) {
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
    function isStrictModeReservedWord$983(id$1134) {
        switch (id$1134) {
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
    function isRestrictedWord$984(id$1135) {
        return id$1135 === 'eval' || id$1135 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$985(id$1136) {
        if (strict$957 && isStrictModeReservedWord$983(id$1136)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1136.length) {
        case 2:
            return id$1136 === 'if' || id$1136 === 'in' || id$1136 === 'do';
        case 3:
            return id$1136 === 'var' || id$1136 === 'for' || id$1136 === 'new' || id$1136 === 'try' || id$1136 === 'let';
        case 4:
            return id$1136 === 'this' || id$1136 === 'else' || id$1136 === 'case' || id$1136 === 'void' || id$1136 === 'with' || id$1136 === 'enum';
        case 5:
            return id$1136 === 'while' || id$1136 === 'break' || id$1136 === 'catch' || id$1136 === 'throw' || id$1136 === 'const' || id$1136 === 'yield' || id$1136 === 'class' || id$1136 === 'super';
        case 6:
            return id$1136 === 'return' || id$1136 === 'typeof' || id$1136 === 'delete' || id$1136 === 'switch' || id$1136 === 'export' || id$1136 === 'import';
        case 7:
            return id$1136 === 'default' || id$1136 === 'finally' || id$1136 === 'extends';
        case 8:
            return id$1136 === 'function' || id$1136 === 'continue' || id$1136 === 'debugger';
        case 10:
            return id$1136 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$986() {
        var ch$1137, blockComment$1138, lineComment$1139;
        blockComment$1138 = false;
        lineComment$1139 = false;
        while (index$958 < length$965) {
            ch$1137 = source$956.charCodeAt(index$958);
            if (lineComment$1139) {
                ++index$958;
                if (isLineTerminator$979(ch$1137)) {
                    lineComment$1139 = false;
                    if (ch$1137 === 13 && source$956.charCodeAt(index$958) === 10) {
                        ++index$958;
                    }
                    ++lineNumber$959;
                    lineStart$960 = index$958;
                }
            } else if (blockComment$1138) {
                if (isLineTerminator$979(ch$1137)) {
                    if (ch$1137 === 13 && source$956.charCodeAt(index$958 + 1) === 10) {
                        ++index$958;
                    }
                    ++lineNumber$959;
                    ++index$958;
                    lineStart$960 = index$958;
                    if (index$958 >= length$965) {
                        throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1137 = source$956.charCodeAt(index$958++);
                    if (index$958 >= length$965) {
                        throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1137 === 42) {
                        ch$1137 = source$956.charCodeAt(index$958);
                        if (ch$1137 === 47) {
                            ++index$958;
                            blockComment$1138 = false;
                        }
                    }
                }
            } else if (ch$1137 === 47) {
                ch$1137 = source$956.charCodeAt(index$958 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1137 === 47) {
                    index$958 += 2;
                    lineComment$1139 = true;
                } else if (ch$1137 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$958 += 2;
                    blockComment$1138 = true;
                    if (index$958 >= length$965) {
                        throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$978(ch$1137)) {
                ++index$958;
            } else if (isLineTerminator$979(ch$1137)) {
                ++index$958;
                if (ch$1137 === 13 && source$956.charCodeAt(index$958) === 10) {
                    ++index$958;
                }
                ++lineNumber$959;
                lineStart$960 = index$958;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$987(prefix$1140) {
        var i$1141, len$1142, ch$1143, code$1144 = 0;
        len$1142 = prefix$1140 === 'u' ? 4 : 2;
        for (i$1141 = 0; i$1141 < len$1142; ++i$1141) {
            if (index$958 < length$965 && isHexDigit$976(source$956[index$958])) {
                ch$1143 = source$956[index$958++];
                code$1144 = code$1144 * 16 + '0123456789abcdef'.indexOf(ch$1143.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1144);
    }
    function scanUnicodeCodePointEscape$988() {
        var ch$1145, code$1146, cu1$1147, cu2$1148;
        ch$1145 = source$956[index$958];
        code$1146 = 0;
        // At least, one hex digit is required.
        if (ch$1145 === '}') {
            throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
        }
        while (index$958 < length$965) {
            ch$1145 = source$956[index$958++];
            if (!isHexDigit$976(ch$1145)) {
                break;
            }
            code$1146 = code$1146 * 16 + '0123456789abcdef'.indexOf(ch$1145.toLowerCase());
        }
        if (code$1146 > 1114111 || ch$1145 !== '}') {
            throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1146 <= 65535) {
            return String.fromCharCode(code$1146);
        }
        cu1$1147 = (code$1146 - 65536 >> 10) + 55296;
        cu2$1148 = (code$1146 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1147, cu2$1148);
    }
    function getEscapedIdentifier$989() {
        var ch$1149, id$1150;
        ch$1149 = source$956.charCodeAt(index$958++);
        id$1150 = String.fromCharCode(ch$1149);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1149 === 92) {
            if (source$956.charCodeAt(index$958) !== 117) {
                throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
            }
            ++index$958;
            ch$1149 = scanHexEscape$987('u');
            if (!ch$1149 || ch$1149 === '\\' || !isIdentifierStart$980(ch$1149.charCodeAt(0))) {
                throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
            }
            id$1150 = ch$1149;
        }
        while (index$958 < length$965) {
            ch$1149 = source$956.charCodeAt(index$958);
            if (!isIdentifierPart$981(ch$1149)) {
                break;
            }
            ++index$958;
            id$1150 += String.fromCharCode(ch$1149);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1149 === 92) {
                id$1150 = id$1150.substr(0, id$1150.length - 1);
                if (source$956.charCodeAt(index$958) !== 117) {
                    throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
                }
                ++index$958;
                ch$1149 = scanHexEscape$987('u');
                if (!ch$1149 || ch$1149 === '\\' || !isIdentifierPart$981(ch$1149.charCodeAt(0))) {
                    throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
                }
                id$1150 += ch$1149;
            }
        }
        return id$1150;
    }
    function getIdentifier$990() {
        var start$1151, ch$1152;
        start$1151 = index$958++;
        while (index$958 < length$965) {
            ch$1152 = source$956.charCodeAt(index$958);
            if (ch$1152 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$958 = start$1151;
                return getEscapedIdentifier$989();
            }
            if (isIdentifierPart$981(ch$1152)) {
                ++index$958;
            } else {
                break;
            }
        }
        return source$956.slice(start$1151, index$958);
    }
    function scanIdentifier$991() {
        var start$1153, id$1154, type$1155;
        start$1153 = index$958;
        // Backslash (char #92) starts an escaped character.
        id$1154 = source$956.charCodeAt(index$958) === 92 ? getEscapedIdentifier$989() : getIdentifier$990();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1154.length === 1) {
            type$1155 = Token$947.Identifier;
        } else if (isKeyword$985(id$1154)) {
            type$1155 = Token$947.Keyword;
        } else if (id$1154 === 'null') {
            type$1155 = Token$947.NullLiteral;
        } else if (id$1154 === 'true' || id$1154 === 'false') {
            type$1155 = Token$947.BooleanLiteral;
        } else {
            type$1155 = Token$947.Identifier;
        }
        return {
            type: type$1155,
            value: id$1154,
            lineNumber: lineNumber$959,
            lineStart: lineStart$960,
            range: [
                start$1153,
                index$958
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$992() {
        var start$1156 = index$958, code$1157 = source$956.charCodeAt(index$958), code2$1158, ch1$1159 = source$956[index$958], ch2$1160, ch3$1161, ch4$1162;
        switch (code$1157) {
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
            ++index$958;
            if (extra$972.tokenize) {
                if (code$1157 === 40) {
                    extra$972.openParenToken = extra$972.tokens.length;
                } else if (code$1157 === 123) {
                    extra$972.openCurlyToken = extra$972.tokens.length;
                }
            }
            return {
                type: Token$947.Punctuator,
                value: String.fromCharCode(code$1157),
                lineNumber: lineNumber$959,
                lineStart: lineStart$960,
                range: [
                    start$1156,
                    index$958
                ]
            };
        default:
            code2$1158 = source$956.charCodeAt(index$958 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1158 === 61) {
                switch (code$1157) {
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
                    index$958 += 2;
                    return {
                        type: Token$947.Punctuator,
                        value: String.fromCharCode(code$1157) + String.fromCharCode(code2$1158),
                        lineNumber: lineNumber$959,
                        lineStart: lineStart$960,
                        range: [
                            start$1156,
                            index$958
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$958 += 2;
                    // !== and ===
                    if (source$956.charCodeAt(index$958) === 61) {
                        ++index$958;
                    }
                    return {
                        type: Token$947.Punctuator,
                        value: source$956.slice(start$1156, index$958),
                        lineNumber: lineNumber$959,
                        lineStart: lineStart$960,
                        range: [
                            start$1156,
                            index$958
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1160 = source$956[index$958 + 1];
        ch3$1161 = source$956[index$958 + 2];
        ch4$1162 = source$956[index$958 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1159 === '>' && ch2$1160 === '>' && ch3$1161 === '>') {
            if (ch4$1162 === '=') {
                index$958 += 4;
                return {
                    type: Token$947.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$959,
                    lineStart: lineStart$960,
                    range: [
                        start$1156,
                        index$958
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1159 === '>' && ch2$1160 === '>' && ch3$1161 === '>') {
            index$958 += 3;
            return {
                type: Token$947.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$959,
                lineStart: lineStart$960,
                range: [
                    start$1156,
                    index$958
                ]
            };
        }
        if (ch1$1159 === '<' && ch2$1160 === '<' && ch3$1161 === '=') {
            index$958 += 3;
            return {
                type: Token$947.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$959,
                lineStart: lineStart$960,
                range: [
                    start$1156,
                    index$958
                ]
            };
        }
        if (ch1$1159 === '>' && ch2$1160 === '>' && ch3$1161 === '=') {
            index$958 += 3;
            return {
                type: Token$947.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$959,
                lineStart: lineStart$960,
                range: [
                    start$1156,
                    index$958
                ]
            };
        }
        if (ch1$1159 === '.' && ch2$1160 === '.' && ch3$1161 === '.') {
            index$958 += 3;
            return {
                type: Token$947.Punctuator,
                value: '...',
                lineNumber: lineNumber$959,
                lineStart: lineStart$960,
                range: [
                    start$1156,
                    index$958
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1159 === ch2$1160 && '+-<>&|'.indexOf(ch1$1159) >= 0) {
            index$958 += 2;
            return {
                type: Token$947.Punctuator,
                value: ch1$1159 + ch2$1160,
                lineNumber: lineNumber$959,
                lineStart: lineStart$960,
                range: [
                    start$1156,
                    index$958
                ]
            };
        }
        if (ch1$1159 === '=' && ch2$1160 === '>') {
            index$958 += 2;
            return {
                type: Token$947.Punctuator,
                value: '=>',
                lineNumber: lineNumber$959,
                lineStart: lineStart$960,
                range: [
                    start$1156,
                    index$958
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1159) >= 0) {
            ++index$958;
            return {
                type: Token$947.Punctuator,
                value: ch1$1159,
                lineNumber: lineNumber$959,
                lineStart: lineStart$960,
                range: [
                    start$1156,
                    index$958
                ]
            };
        }
        if (ch1$1159 === '.') {
            ++index$958;
            return {
                type: Token$947.Punctuator,
                value: ch1$1159,
                lineNumber: lineNumber$959,
                lineStart: lineStart$960,
                range: [
                    start$1156,
                    index$958
                ]
            };
        }
        throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$993(start$1163) {
        var number$1164 = '';
        while (index$958 < length$965) {
            if (!isHexDigit$976(source$956[index$958])) {
                break;
            }
            number$1164 += source$956[index$958++];
        }
        if (number$1164.length === 0) {
            throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$980(source$956.charCodeAt(index$958))) {
            throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$947.NumericLiteral,
            value: parseInt('0x' + number$1164, 16),
            lineNumber: lineNumber$959,
            lineStart: lineStart$960,
            range: [
                start$1163,
                index$958
            ]
        };
    }
    function scanOctalLiteral$994(prefix$1165, start$1166) {
        var number$1167, octal$1168;
        if (isOctalDigit$977(prefix$1165)) {
            octal$1168 = true;
            number$1167 = '0' + source$956[index$958++];
        } else {
            octal$1168 = false;
            ++index$958;
            number$1167 = '';
        }
        while (index$958 < length$965) {
            if (!isOctalDigit$977(source$956[index$958])) {
                break;
            }
            number$1167 += source$956[index$958++];
        }
        if (!octal$1168 && number$1167.length === 0) {
            // only 0o or 0O
            throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$980(source$956.charCodeAt(index$958)) || isDecimalDigit$975(source$956.charCodeAt(index$958))) {
            throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$947.NumericLiteral,
            value: parseInt(number$1167, 8),
            octal: octal$1168,
            lineNumber: lineNumber$959,
            lineStart: lineStart$960,
            range: [
                start$1166,
                index$958
            ]
        };
    }
    function scanNumericLiteral$995() {
        var number$1169, start$1170, ch$1171, octal$1172;
        ch$1171 = source$956[index$958];
        assert$973(isDecimalDigit$975(ch$1171.charCodeAt(0)) || ch$1171 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1170 = index$958;
        number$1169 = '';
        if (ch$1171 !== '.') {
            number$1169 = source$956[index$958++];
            ch$1171 = source$956[index$958];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1169 === '0') {
                if (ch$1171 === 'x' || ch$1171 === 'X') {
                    ++index$958;
                    return scanHexLiteral$993(start$1170);
                }
                if (ch$1171 === 'b' || ch$1171 === 'B') {
                    ++index$958;
                    number$1169 = '';
                    while (index$958 < length$965) {
                        ch$1171 = source$956[index$958];
                        if (ch$1171 !== '0' && ch$1171 !== '1') {
                            break;
                        }
                        number$1169 += source$956[index$958++];
                    }
                    if (number$1169.length === 0) {
                        // only 0b or 0B
                        throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$958 < length$965) {
                        ch$1171 = source$956.charCodeAt(index$958);
                        if (isIdentifierStart$980(ch$1171) || isDecimalDigit$975(ch$1171)) {
                            throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$947.NumericLiteral,
                        value: parseInt(number$1169, 2),
                        lineNumber: lineNumber$959,
                        lineStart: lineStart$960,
                        range: [
                            start$1170,
                            index$958
                        ]
                    };
                }
                if (ch$1171 === 'o' || ch$1171 === 'O' || isOctalDigit$977(ch$1171)) {
                    return scanOctalLiteral$994(ch$1171, start$1170);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1171 && isDecimalDigit$975(ch$1171.charCodeAt(0))) {
                    throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$975(source$956.charCodeAt(index$958))) {
                number$1169 += source$956[index$958++];
            }
            ch$1171 = source$956[index$958];
        }
        if (ch$1171 === '.') {
            number$1169 += source$956[index$958++];
            while (isDecimalDigit$975(source$956.charCodeAt(index$958))) {
                number$1169 += source$956[index$958++];
            }
            ch$1171 = source$956[index$958];
        }
        if (ch$1171 === 'e' || ch$1171 === 'E') {
            number$1169 += source$956[index$958++];
            ch$1171 = source$956[index$958];
            if (ch$1171 === '+' || ch$1171 === '-') {
                number$1169 += source$956[index$958++];
            }
            if (isDecimalDigit$975(source$956.charCodeAt(index$958))) {
                while (isDecimalDigit$975(source$956.charCodeAt(index$958))) {
                    number$1169 += source$956[index$958++];
                }
            } else {
                throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$980(source$956.charCodeAt(index$958))) {
            throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$947.NumericLiteral,
            value: parseFloat(number$1169),
            lineNumber: lineNumber$959,
            lineStart: lineStart$960,
            range: [
                start$1170,
                index$958
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$996() {
        var str$1173 = '', quote$1174, start$1175, ch$1176, code$1177, unescaped$1178, restore$1179, octal$1180 = false;
        quote$1174 = source$956[index$958];
        assert$973(quote$1174 === '\'' || quote$1174 === '"', 'String literal must starts with a quote');
        start$1175 = index$958;
        ++index$958;
        while (index$958 < length$965) {
            ch$1176 = source$956[index$958++];
            if (ch$1176 === quote$1174) {
                quote$1174 = '';
                break;
            } else if (ch$1176 === '\\') {
                ch$1176 = source$956[index$958++];
                if (!ch$1176 || !isLineTerminator$979(ch$1176.charCodeAt(0))) {
                    switch (ch$1176) {
                    case 'n':
                        str$1173 += '\n';
                        break;
                    case 'r':
                        str$1173 += '\r';
                        break;
                    case 't':
                        str$1173 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$956[index$958] === '{') {
                            ++index$958;
                            str$1173 += scanUnicodeCodePointEscape$988();
                        } else {
                            restore$1179 = index$958;
                            unescaped$1178 = scanHexEscape$987(ch$1176);
                            if (unescaped$1178) {
                                str$1173 += unescaped$1178;
                            } else {
                                index$958 = restore$1179;
                                str$1173 += ch$1176;
                            }
                        }
                        break;
                    case 'b':
                        str$1173 += '\b';
                        break;
                    case 'f':
                        str$1173 += '\f';
                        break;
                    case 'v':
                        str$1173 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$977(ch$1176)) {
                            code$1177 = '01234567'.indexOf(ch$1176);
                            // \0 is not octal escape sequence
                            if (code$1177 !== 0) {
                                octal$1180 = true;
                            }
                            if (index$958 < length$965 && isOctalDigit$977(source$956[index$958])) {
                                octal$1180 = true;
                                code$1177 = code$1177 * 8 + '01234567'.indexOf(source$956[index$958++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1176) >= 0 && index$958 < length$965 && isOctalDigit$977(source$956[index$958])) {
                                    code$1177 = code$1177 * 8 + '01234567'.indexOf(source$956[index$958++]);
                                }
                            }
                            str$1173 += String.fromCharCode(code$1177);
                        } else {
                            str$1173 += ch$1176;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$959;
                    if (ch$1176 === '\r' && source$956[index$958] === '\n') {
                        ++index$958;
                    }
                }
            } else if (isLineTerminator$979(ch$1176.charCodeAt(0))) {
                break;
            } else {
                str$1173 += ch$1176;
            }
        }
        if (quote$1174 !== '') {
            throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$947.StringLiteral,
            value: str$1173,
            octal: octal$1180,
            lineNumber: lineNumber$959,
            lineStart: lineStart$960,
            range: [
                start$1175,
                index$958
            ]
        };
    }
    function scanTemplate$997() {
        var cooked$1181 = '', ch$1182, start$1183, terminated$1184, tail$1185, restore$1186, unescaped$1187, code$1188, octal$1189;
        terminated$1184 = false;
        tail$1185 = false;
        start$1183 = index$958;
        ++index$958;
        while (index$958 < length$965) {
            ch$1182 = source$956[index$958++];
            if (ch$1182 === '`') {
                tail$1185 = true;
                terminated$1184 = true;
                break;
            } else if (ch$1182 === '$') {
                if (source$956[index$958] === '{') {
                    ++index$958;
                    terminated$1184 = true;
                    break;
                }
                cooked$1181 += ch$1182;
            } else if (ch$1182 === '\\') {
                ch$1182 = source$956[index$958++];
                if (!isLineTerminator$979(ch$1182.charCodeAt(0))) {
                    switch (ch$1182) {
                    case 'n':
                        cooked$1181 += '\n';
                        break;
                    case 'r':
                        cooked$1181 += '\r';
                        break;
                    case 't':
                        cooked$1181 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$956[index$958] === '{') {
                            ++index$958;
                            cooked$1181 += scanUnicodeCodePointEscape$988();
                        } else {
                            restore$1186 = index$958;
                            unescaped$1187 = scanHexEscape$987(ch$1182);
                            if (unescaped$1187) {
                                cooked$1181 += unescaped$1187;
                            } else {
                                index$958 = restore$1186;
                                cooked$1181 += ch$1182;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1181 += '\b';
                        break;
                    case 'f':
                        cooked$1181 += '\f';
                        break;
                    case 'v':
                        cooked$1181 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$977(ch$1182)) {
                            code$1188 = '01234567'.indexOf(ch$1182);
                            // \0 is not octal escape sequence
                            if (code$1188 !== 0) {
                                octal$1189 = true;
                            }
                            if (index$958 < length$965 && isOctalDigit$977(source$956[index$958])) {
                                octal$1189 = true;
                                code$1188 = code$1188 * 8 + '01234567'.indexOf(source$956[index$958++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1182) >= 0 && index$958 < length$965 && isOctalDigit$977(source$956[index$958])) {
                                    code$1188 = code$1188 * 8 + '01234567'.indexOf(source$956[index$958++]);
                                }
                            }
                            cooked$1181 += String.fromCharCode(code$1188);
                        } else {
                            cooked$1181 += ch$1182;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$959;
                    if (ch$1182 === '\r' && source$956[index$958] === '\n') {
                        ++index$958;
                    }
                }
            } else if (isLineTerminator$979(ch$1182.charCodeAt(0))) {
                ++lineNumber$959;
                if (ch$1182 === '\r' && source$956[index$958] === '\n') {
                    ++index$958;
                }
                cooked$1181 += '\n';
            } else {
                cooked$1181 += ch$1182;
            }
        }
        if (!terminated$1184) {
            throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$947.Template,
            value: {
                cooked: cooked$1181,
                raw: source$956.slice(start$1183 + 1, index$958 - (tail$1185 ? 1 : 2))
            },
            tail: tail$1185,
            octal: octal$1189,
            lineNumber: lineNumber$959,
            lineStart: lineStart$960,
            range: [
                start$1183,
                index$958
            ]
        };
    }
    function scanTemplateElement$998(option$1190) {
        var startsWith$1191, template$1192;
        lookahead$969 = null;
        skipComment$986();
        startsWith$1191 = option$1190.head ? '`' : '}';
        if (source$956[index$958] !== startsWith$1191) {
            throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
        }
        template$1192 = scanTemplate$997();
        peek$1004();
        return template$1192;
    }
    function scanRegExp$999() {
        var str$1193, ch$1194, start$1195, pattern$1196, flags$1197, value$1198, classMarker$1199 = false, restore$1200, terminated$1201 = false;
        lookahead$969 = null;
        skipComment$986();
        start$1195 = index$958;
        ch$1194 = source$956[index$958];
        assert$973(ch$1194 === '/', 'Regular expression literal must start with a slash');
        str$1193 = source$956[index$958++];
        while (index$958 < length$965) {
            ch$1194 = source$956[index$958++];
            str$1193 += ch$1194;
            if (classMarker$1199) {
                if (ch$1194 === ']') {
                    classMarker$1199 = false;
                }
            } else {
                if (ch$1194 === '\\') {
                    ch$1194 = source$956[index$958++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$979(ch$1194.charCodeAt(0))) {
                        throwError$1007({}, Messages$952.UnterminatedRegExp);
                    }
                    str$1193 += ch$1194;
                } else if (ch$1194 === '/') {
                    terminated$1201 = true;
                    break;
                } else if (ch$1194 === '[') {
                    classMarker$1199 = true;
                } else if (isLineTerminator$979(ch$1194.charCodeAt(0))) {
                    throwError$1007({}, Messages$952.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1201) {
            throwError$1007({}, Messages$952.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1196 = str$1193.substr(1, str$1193.length - 2);
        flags$1197 = '';
        while (index$958 < length$965) {
            ch$1194 = source$956[index$958];
            if (!isIdentifierPart$981(ch$1194.charCodeAt(0))) {
                break;
            }
            ++index$958;
            if (ch$1194 === '\\' && index$958 < length$965) {
                ch$1194 = source$956[index$958];
                if (ch$1194 === 'u') {
                    ++index$958;
                    restore$1200 = index$958;
                    ch$1194 = scanHexEscape$987('u');
                    if (ch$1194) {
                        flags$1197 += ch$1194;
                        for (str$1193 += '\\u'; restore$1200 < index$958; ++restore$1200) {
                            str$1193 += source$956[restore$1200];
                        }
                    } else {
                        index$958 = restore$1200;
                        flags$1197 += 'u';
                        str$1193 += '\\u';
                    }
                } else {
                    str$1193 += '\\';
                }
            } else {
                flags$1197 += ch$1194;
                str$1193 += ch$1194;
            }
        }
        try {
            value$1198 = new RegExp(pattern$1196, flags$1197);
        } catch (e$1202) {
            throwError$1007({}, Messages$952.InvalidRegExp);
        }
        // peek();
        if (extra$972.tokenize) {
            return {
                type: Token$947.RegularExpression,
                value: value$1198,
                lineNumber: lineNumber$959,
                lineStart: lineStart$960,
                range: [
                    start$1195,
                    index$958
                ]
            };
        }
        return {
            type: Token$947.RegularExpression,
            literal: str$1193,
            value: value$1198,
            range: [
                start$1195,
                index$958
            ]
        };
    }
    function isIdentifierName$1000(token$1203) {
        return token$1203.type === Token$947.Identifier || token$1203.type === Token$947.Keyword || token$1203.type === Token$947.BooleanLiteral || token$1203.type === Token$947.NullLiteral;
    }
    function advanceSlash$1001() {
        var prevToken$1204, checkToken$1205;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1204 = extra$972.tokens[extra$972.tokens.length - 1];
        if (!prevToken$1204) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$999();
        }
        if (prevToken$1204.type === 'Punctuator') {
            if (prevToken$1204.value === ')') {
                checkToken$1205 = extra$972.tokens[extra$972.openParenToken - 1];
                if (checkToken$1205 && checkToken$1205.type === 'Keyword' && (checkToken$1205.value === 'if' || checkToken$1205.value === 'while' || checkToken$1205.value === 'for' || checkToken$1205.value === 'with')) {
                    return scanRegExp$999();
                }
                return scanPunctuator$992();
            }
            if (prevToken$1204.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$972.tokens[extra$972.openCurlyToken - 3] && extra$972.tokens[extra$972.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1205 = extra$972.tokens[extra$972.openCurlyToken - 4];
                    if (!checkToken$1205) {
                        return scanPunctuator$992();
                    }
                } else if (extra$972.tokens[extra$972.openCurlyToken - 4] && extra$972.tokens[extra$972.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1205 = extra$972.tokens[extra$972.openCurlyToken - 5];
                    if (!checkToken$1205) {
                        return scanRegExp$999();
                    }
                } else {
                    return scanPunctuator$992();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$949.indexOf(checkToken$1205.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$992();
                }
                // It is a declaration.
                return scanRegExp$999();
            }
            return scanRegExp$999();
        }
        if (prevToken$1204.type === 'Keyword') {
            return scanRegExp$999();
        }
        return scanPunctuator$992();
    }
    function advance$1002() {
        var ch$1206;
        skipComment$986();
        if (index$958 >= length$965) {
            return {
                type: Token$947.EOF,
                lineNumber: lineNumber$959,
                lineStart: lineStart$960,
                range: [
                    index$958,
                    index$958
                ]
            };
        }
        ch$1206 = source$956.charCodeAt(index$958);
        // Very common: ( and ) and ;
        if (ch$1206 === 40 || ch$1206 === 41 || ch$1206 === 58) {
            return scanPunctuator$992();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1206 === 39 || ch$1206 === 34) {
            return scanStringLiteral$996();
        }
        if (ch$1206 === 96) {
            return scanTemplate$997();
        }
        if (isIdentifierStart$980(ch$1206)) {
            return scanIdentifier$991();
        }
        // # and @ are allowed for sweet.js
        if (ch$1206 === 35 || ch$1206 === 64) {
            ++index$958;
            return {
                type: Token$947.Punctuator,
                value: String.fromCharCode(ch$1206),
                lineNumber: lineNumber$959,
                lineStart: lineStart$960,
                range: [
                    index$958 - 1,
                    index$958
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1206 === 46) {
            if (isDecimalDigit$975(source$956.charCodeAt(index$958 + 1))) {
                return scanNumericLiteral$995();
            }
            return scanPunctuator$992();
        }
        if (isDecimalDigit$975(ch$1206)) {
            return scanNumericLiteral$995();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$972.tokenize && ch$1206 === 47) {
            return advanceSlash$1001();
        }
        return scanPunctuator$992();
    }
    function lex$1003() {
        var token$1207;
        token$1207 = lookahead$969;
        streamIndex$968 = lookaheadIndex$970;
        lineNumber$959 = token$1207.lineNumber;
        lineStart$960 = token$1207.lineStart;
        sm_lineNumber$961 = lookahead$969.sm_lineNumber;
        sm_lineStart$962 = lookahead$969.sm_lineStart;
        sm_range$963 = lookahead$969.sm_range;
        sm_index$964 = lookahead$969.sm_range[0];
        lookahead$969 = tokenStream$967[++streamIndex$968].token;
        lookaheadIndex$970 = streamIndex$968;
        index$958 = lookahead$969.range[0];
        return token$1207;
    }
    function peek$1004() {
        lookaheadIndex$970 = streamIndex$968 + 1;
        if (lookaheadIndex$970 >= length$965) {
            lookahead$969 = {
                type: Token$947.EOF,
                lineNumber: lineNumber$959,
                lineStart: lineStart$960,
                range: [
                    index$958,
                    index$958
                ]
            };
            return;
        }
        lookahead$969 = tokenStream$967[lookaheadIndex$970].token;
        index$958 = lookahead$969.range[0];
    }
    function lookahead2$1005() {
        var adv$1208, pos$1209, line$1210, start$1211, result$1212;
        if (streamIndex$968 + 1 >= length$965 || streamIndex$968 + 2 >= length$965) {
            return {
                type: Token$947.EOF,
                lineNumber: lineNumber$959,
                lineStart: lineStart$960,
                range: [
                    index$958,
                    index$958
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$969 === null) {
            lookaheadIndex$970 = streamIndex$968 + 1;
            lookahead$969 = tokenStream$967[lookaheadIndex$970].token;
            index$958 = lookahead$969.range[0];
        }
        result$1212 = tokenStream$967[lookaheadIndex$970 + 1].token;
        return result$1212;
    }
    SyntaxTreeDelegate$954 = {
        name: 'SyntaxTree',
        postProcess: function (node$1213) {
            return node$1213;
        },
        createArrayExpression: function (elements$1214) {
            return {
                type: Syntax$950.ArrayExpression,
                elements: elements$1214
            };
        },
        createAssignmentExpression: function (operator$1215, left$1216, right$1217) {
            return {
                type: Syntax$950.AssignmentExpression,
                operator: operator$1215,
                left: left$1216,
                right: right$1217
            };
        },
        createBinaryExpression: function (operator$1218, left$1219, right$1220) {
            var type$1221 = operator$1218 === '||' || operator$1218 === '&&' ? Syntax$950.LogicalExpression : Syntax$950.BinaryExpression;
            return {
                type: type$1221,
                operator: operator$1218,
                left: left$1219,
                right: right$1220
            };
        },
        createBlockStatement: function (body$1222) {
            return {
                type: Syntax$950.BlockStatement,
                body: body$1222
            };
        },
        createBreakStatement: function (label$1223) {
            return {
                type: Syntax$950.BreakStatement,
                label: label$1223
            };
        },
        createCallExpression: function (callee$1224, args$1225) {
            return {
                type: Syntax$950.CallExpression,
                callee: callee$1224,
                'arguments': args$1225
            };
        },
        createCatchClause: function (param$1226, body$1227) {
            return {
                type: Syntax$950.CatchClause,
                param: param$1226,
                body: body$1227
            };
        },
        createConditionalExpression: function (test$1228, consequent$1229, alternate$1230) {
            return {
                type: Syntax$950.ConditionalExpression,
                test: test$1228,
                consequent: consequent$1229,
                alternate: alternate$1230
            };
        },
        createContinueStatement: function (label$1231) {
            return {
                type: Syntax$950.ContinueStatement,
                label: label$1231
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$950.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1232, test$1233) {
            return {
                type: Syntax$950.DoWhileStatement,
                body: body$1232,
                test: test$1233
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$950.EmptyStatement };
        },
        createExpressionStatement: function (expression$1234) {
            return {
                type: Syntax$950.ExpressionStatement,
                expression: expression$1234
            };
        },
        createForStatement: function (init$1235, test$1236, update$1237, body$1238) {
            return {
                type: Syntax$950.ForStatement,
                init: init$1235,
                test: test$1236,
                update: update$1237,
                body: body$1238
            };
        },
        createForInStatement: function (left$1239, right$1240, body$1241) {
            return {
                type: Syntax$950.ForInStatement,
                left: left$1239,
                right: right$1240,
                body: body$1241,
                each: false
            };
        },
        createForOfStatement: function (left$1242, right$1243, body$1244) {
            return {
                type: Syntax$950.ForOfStatement,
                left: left$1242,
                right: right$1243,
                body: body$1244
            };
        },
        createFunctionDeclaration: function (id$1245, params$1246, defaults$1247, body$1248, rest$1249, generator$1250, expression$1251) {
            return {
                type: Syntax$950.FunctionDeclaration,
                id: id$1245,
                params: params$1246,
                defaults: defaults$1247,
                body: body$1248,
                rest: rest$1249,
                generator: generator$1250,
                expression: expression$1251
            };
        },
        createFunctionExpression: function (id$1252, params$1253, defaults$1254, body$1255, rest$1256, generator$1257, expression$1258) {
            return {
                type: Syntax$950.FunctionExpression,
                id: id$1252,
                params: params$1253,
                defaults: defaults$1254,
                body: body$1255,
                rest: rest$1256,
                generator: generator$1257,
                expression: expression$1258
            };
        },
        createIdentifier: function (name$1259) {
            return {
                type: Syntax$950.Identifier,
                name: name$1259
            };
        },
        createIfStatement: function (test$1260, consequent$1261, alternate$1262) {
            return {
                type: Syntax$950.IfStatement,
                test: test$1260,
                consequent: consequent$1261,
                alternate: alternate$1262
            };
        },
        createLabeledStatement: function (label$1263, body$1264) {
            return {
                type: Syntax$950.LabeledStatement,
                label: label$1263,
                body: body$1264
            };
        },
        createLiteral: function (token$1265) {
            return {
                type: Syntax$950.Literal,
                value: token$1265.value,
                raw: String(token$1265.value)
            };
        },
        createMemberExpression: function (accessor$1266, object$1267, property$1268) {
            return {
                type: Syntax$950.MemberExpression,
                computed: accessor$1266 === '[',
                object: object$1267,
                property: property$1268
            };
        },
        createNewExpression: function (callee$1269, args$1270) {
            return {
                type: Syntax$950.NewExpression,
                callee: callee$1269,
                'arguments': args$1270
            };
        },
        createObjectExpression: function (properties$1271) {
            return {
                type: Syntax$950.ObjectExpression,
                properties: properties$1271
            };
        },
        createPostfixExpression: function (operator$1272, argument$1273) {
            return {
                type: Syntax$950.UpdateExpression,
                operator: operator$1272,
                argument: argument$1273,
                prefix: false
            };
        },
        createProgram: function (body$1274) {
            return {
                type: Syntax$950.Program,
                body: body$1274
            };
        },
        createProperty: function (kind$1275, key$1276, value$1277, method$1278, shorthand$1279) {
            return {
                type: Syntax$950.Property,
                key: key$1276,
                value: value$1277,
                kind: kind$1275,
                method: method$1278,
                shorthand: shorthand$1279
            };
        },
        createReturnStatement: function (argument$1280) {
            return {
                type: Syntax$950.ReturnStatement,
                argument: argument$1280
            };
        },
        createSequenceExpression: function (expressions$1281) {
            return {
                type: Syntax$950.SequenceExpression,
                expressions: expressions$1281
            };
        },
        createSwitchCase: function (test$1282, consequent$1283) {
            return {
                type: Syntax$950.SwitchCase,
                test: test$1282,
                consequent: consequent$1283
            };
        },
        createSwitchStatement: function (discriminant$1284, cases$1285) {
            return {
                type: Syntax$950.SwitchStatement,
                discriminant: discriminant$1284,
                cases: cases$1285
            };
        },
        createThisExpression: function () {
            return { type: Syntax$950.ThisExpression };
        },
        createThrowStatement: function (argument$1286) {
            return {
                type: Syntax$950.ThrowStatement,
                argument: argument$1286
            };
        },
        createTryStatement: function (block$1287, guardedHandlers$1288, handlers$1289, finalizer$1290) {
            return {
                type: Syntax$950.TryStatement,
                block: block$1287,
                guardedHandlers: guardedHandlers$1288,
                handlers: handlers$1289,
                finalizer: finalizer$1290
            };
        },
        createUnaryExpression: function (operator$1291, argument$1292) {
            if (operator$1291 === '++' || operator$1291 === '--') {
                return {
                    type: Syntax$950.UpdateExpression,
                    operator: operator$1291,
                    argument: argument$1292,
                    prefix: true
                };
            }
            return {
                type: Syntax$950.UnaryExpression,
                operator: operator$1291,
                argument: argument$1292
            };
        },
        createVariableDeclaration: function (declarations$1293, kind$1294) {
            return {
                type: Syntax$950.VariableDeclaration,
                declarations: declarations$1293,
                kind: kind$1294
            };
        },
        createVariableDeclarator: function (id$1295, init$1296) {
            return {
                type: Syntax$950.VariableDeclarator,
                id: id$1295,
                init: init$1296
            };
        },
        createWhileStatement: function (test$1297, body$1298) {
            return {
                type: Syntax$950.WhileStatement,
                test: test$1297,
                body: body$1298
            };
        },
        createWithStatement: function (object$1299, body$1300) {
            return {
                type: Syntax$950.WithStatement,
                object: object$1299,
                body: body$1300
            };
        },
        createTemplateElement: function (value$1301, tail$1302) {
            return {
                type: Syntax$950.TemplateElement,
                value: value$1301,
                tail: tail$1302
            };
        },
        createTemplateLiteral: function (quasis$1303, expressions$1304) {
            return {
                type: Syntax$950.TemplateLiteral,
                quasis: quasis$1303,
                expressions: expressions$1304
            };
        },
        createSpreadElement: function (argument$1305) {
            return {
                type: Syntax$950.SpreadElement,
                argument: argument$1305
            };
        },
        createTaggedTemplateExpression: function (tag$1306, quasi$1307) {
            return {
                type: Syntax$950.TaggedTemplateExpression,
                tag: tag$1306,
                quasi: quasi$1307
            };
        },
        createArrowFunctionExpression: function (params$1308, defaults$1309, body$1310, rest$1311, expression$1312) {
            return {
                type: Syntax$950.ArrowFunctionExpression,
                id: null,
                params: params$1308,
                defaults: defaults$1309,
                body: body$1310,
                rest: rest$1311,
                generator: false,
                expression: expression$1312
            };
        },
        createMethodDefinition: function (propertyType$1313, kind$1314, key$1315, value$1316) {
            return {
                type: Syntax$950.MethodDefinition,
                key: key$1315,
                value: value$1316,
                kind: kind$1314,
                'static': propertyType$1313 === ClassPropertyType$955.static
            };
        },
        createClassBody: function (body$1317) {
            return {
                type: Syntax$950.ClassBody,
                body: body$1317
            };
        },
        createClassExpression: function (id$1318, superClass$1319, body$1320) {
            return {
                type: Syntax$950.ClassExpression,
                id: id$1318,
                superClass: superClass$1319,
                body: body$1320
            };
        },
        createClassDeclaration: function (id$1321, superClass$1322, body$1323) {
            return {
                type: Syntax$950.ClassDeclaration,
                id: id$1321,
                superClass: superClass$1322,
                body: body$1323
            };
        },
        createExportSpecifier: function (id$1324, name$1325) {
            return {
                type: Syntax$950.ExportSpecifier,
                id: id$1324,
                name: name$1325
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$950.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1326, specifiers$1327, source$1328) {
            return {
                type: Syntax$950.ExportDeclaration,
                declaration: declaration$1326,
                specifiers: specifiers$1327,
                source: source$1328
            };
        },
        createImportSpecifier: function (id$1329, name$1330) {
            return {
                type: Syntax$950.ImportSpecifier,
                id: id$1329,
                name: name$1330
            };
        },
        createImportDeclaration: function (specifiers$1331, kind$1332, source$1333) {
            return {
                type: Syntax$950.ImportDeclaration,
                specifiers: specifiers$1331,
                kind: kind$1332,
                source: source$1333
            };
        },
        createYieldExpression: function (argument$1334, delegate$1335) {
            return {
                type: Syntax$950.YieldExpression,
                argument: argument$1334,
                delegate: delegate$1335
            };
        },
        createModuleDeclaration: function (id$1336, source$1337, body$1338) {
            return {
                type: Syntax$950.ModuleDeclaration,
                id: id$1336,
                source: source$1337,
                body: body$1338
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$1006() {
        return lookahead$969.lineNumber !== lineNumber$959;
    }
    // Throw an exception
    function throwError$1007(token$1339, messageFormat$1340) {
        var error$1341, args$1342 = Array.prototype.slice.call(arguments, 2), msg$1343 = messageFormat$1340.replace(/%(\d)/g, function (whole$1347, index$1348) {
                assert$973(index$1348 < args$1342.length, 'Message reference must be in range');
                return args$1342[index$1348];
            });
        var startIndex$1344 = streamIndex$968 > 3 ? streamIndex$968 - 3 : 0;
        var toks$1345 = tokenStream$967.slice(startIndex$1344, streamIndex$968 + 3).map(function (stx$1349) {
                return stx$1349.token.value;
            }).join(' ');
        var tailingMsg$1346 = '\n[... ' + toks$1345 + ' ...]';
        if (typeof token$1339.lineNumber === 'number') {
            error$1341 = new Error('Line ' + token$1339.lineNumber + ': ' + msg$1343 + tailingMsg$1346);
            error$1341.index = token$1339.range[0];
            error$1341.lineNumber = token$1339.lineNumber;
            error$1341.column = token$1339.range[0] - lineStart$960 + 1;
        } else {
            error$1341 = new Error('Line ' + lineNumber$959 + ': ' + msg$1343 + tailingMsg$1346);
            error$1341.index = index$958;
            error$1341.lineNumber = lineNumber$959;
            error$1341.column = index$958 - lineStart$960 + 1;
        }
        error$1341.description = msg$1343;
        throw error$1341;
    }
    function throwErrorTolerant$1008() {
        try {
            throwError$1007.apply(null, arguments);
        } catch (e$1350) {
            if (extra$972.errors) {
                extra$972.errors.push(e$1350);
            } else {
                throw e$1350;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$1009(token$1351) {
        if (token$1351.type === Token$947.EOF) {
            throwError$1007(token$1351, Messages$952.UnexpectedEOS);
        }
        if (token$1351.type === Token$947.NumericLiteral) {
            throwError$1007(token$1351, Messages$952.UnexpectedNumber);
        }
        if (token$1351.type === Token$947.StringLiteral) {
            throwError$1007(token$1351, Messages$952.UnexpectedString);
        }
        if (token$1351.type === Token$947.Identifier) {
            throwError$1007(token$1351, Messages$952.UnexpectedIdentifier);
        }
        if (token$1351.type === Token$947.Keyword) {
            if (isFutureReservedWord$982(token$1351.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$957 && isStrictModeReservedWord$983(token$1351.value)) {
                throwErrorTolerant$1008(token$1351, Messages$952.StrictReservedWord);
                return;
            }
            throwError$1007(token$1351, Messages$952.UnexpectedToken, token$1351.value);
        }
        if (token$1351.type === Token$947.Template) {
            throwError$1007(token$1351, Messages$952.UnexpectedTemplate, token$1351.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$1007(token$1351, Messages$952.UnexpectedToken, token$1351.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$1010(value$1352) {
        var token$1353 = lex$1003();
        if (token$1353.type !== Token$947.Punctuator || token$1353.value !== value$1352) {
            throwUnexpected$1009(token$1353);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$1011(keyword$1354) {
        var token$1355 = lex$1003();
        if (token$1355.type !== Token$947.Keyword || token$1355.value !== keyword$1354) {
            throwUnexpected$1009(token$1355);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$1012(value$1356) {
        return lookahead$969.type === Token$947.Punctuator && lookahead$969.value === value$1356;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$1013(keyword$1357) {
        return lookahead$969.type === Token$947.Keyword && lookahead$969.value === keyword$1357;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$1014(keyword$1358) {
        return lookahead$969.type === Token$947.Identifier && lookahead$969.value === keyword$1358;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$1015() {
        var op$1359;
        if (lookahead$969.type !== Token$947.Punctuator) {
            return false;
        }
        op$1359 = lookahead$969.value;
        return op$1359 === '=' || op$1359 === '*=' || op$1359 === '/=' || op$1359 === '%=' || op$1359 === '+=' || op$1359 === '-=' || op$1359 === '<<=' || op$1359 === '>>=' || op$1359 === '>>>=' || op$1359 === '&=' || op$1359 === '^=' || op$1359 === '|=';
    }
    function consumeSemicolon$1016() {
        var line$1360, ch$1361;
        ch$1361 = lookahead$969.value ? String(lookahead$969.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1361 === 59) {
            lex$1003();
            return;
        }
        if (lookahead$969.lineNumber !== lineNumber$959) {
            return;
        }
        if (match$1012(';')) {
            lex$1003();
            return;
        }
        if (lookahead$969.type !== Token$947.EOF && !match$1012('}')) {
            throwUnexpected$1009(lookahead$969);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$1017(expr$1362) {
        return expr$1362.type === Syntax$950.Identifier || expr$1362.type === Syntax$950.MemberExpression;
    }
    function isAssignableLeftHandSide$1018(expr$1363) {
        return isLeftHandSide$1017(expr$1363) || expr$1363.type === Syntax$950.ObjectPattern || expr$1363.type === Syntax$950.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$1019() {
        var elements$1364 = [], blocks$1365 = [], filter$1366 = null, tmp$1367, possiblecomprehension$1368 = true, body$1369;
        expect$1010('[');
        while (!match$1012(']')) {
            if (lookahead$969.value === 'for' && lookahead$969.type === Token$947.Keyword) {
                if (!possiblecomprehension$1368) {
                    throwError$1007({}, Messages$952.ComprehensionError);
                }
                matchKeyword$1013('for');
                tmp$1367 = parseForStatement$1067({ ignoreBody: true });
                tmp$1367.of = tmp$1367.type === Syntax$950.ForOfStatement;
                tmp$1367.type = Syntax$950.ComprehensionBlock;
                if (tmp$1367.left.kind) {
                    // can't be let or const
                    throwError$1007({}, Messages$952.ComprehensionError);
                }
                blocks$1365.push(tmp$1367);
            } else if (lookahead$969.value === 'if' && lookahead$969.type === Token$947.Keyword) {
                if (!possiblecomprehension$1368) {
                    throwError$1007({}, Messages$952.ComprehensionError);
                }
                expectKeyword$1011('if');
                expect$1010('(');
                filter$1366 = parseExpression$1047();
                expect$1010(')');
            } else if (lookahead$969.value === ',' && lookahead$969.type === Token$947.Punctuator) {
                possiblecomprehension$1368 = false;
                // no longer allowed.
                lex$1003();
                elements$1364.push(null);
            } else {
                tmp$1367 = parseSpreadOrAssignmentExpression$1030();
                elements$1364.push(tmp$1367);
                if (tmp$1367 && tmp$1367.type === Syntax$950.SpreadElement) {
                    if (!match$1012(']')) {
                        throwError$1007({}, Messages$952.ElementAfterSpreadElement);
                    }
                } else if (!(match$1012(']') || matchKeyword$1013('for') || matchKeyword$1013('if'))) {
                    expect$1010(',');
                    // this lexes.
                    possiblecomprehension$1368 = false;
                }
            }
        }
        expect$1010(']');
        if (filter$1366 && !blocks$1365.length) {
            throwError$1007({}, Messages$952.ComprehensionRequiresBlock);
        }
        if (blocks$1365.length) {
            if (elements$1364.length !== 1) {
                throwError$1007({}, Messages$952.ComprehensionError);
            }
            return {
                type: Syntax$950.ComprehensionExpression,
                filter: filter$1366,
                blocks: blocks$1365,
                body: elements$1364[0]
            };
        }
        return delegate$966.createArrayExpression(elements$1364);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$1020(options$1370) {
        var previousStrict$1371, previousYieldAllowed$1372, params$1373, defaults$1374, body$1375;
        previousStrict$1371 = strict$957;
        previousYieldAllowed$1372 = state$971.yieldAllowed;
        state$971.yieldAllowed = options$1370.generator;
        params$1373 = options$1370.params || [];
        defaults$1374 = options$1370.defaults || [];
        body$1375 = parseConciseBody$1079();
        if (options$1370.name && strict$957 && isRestrictedWord$984(params$1373[0].name)) {
            throwErrorTolerant$1008(options$1370.name, Messages$952.StrictParamName);
        }
        if (state$971.yieldAllowed && !state$971.yieldFound) {
            throwErrorTolerant$1008({}, Messages$952.NoYieldInGenerator);
        }
        strict$957 = previousStrict$1371;
        state$971.yieldAllowed = previousYieldAllowed$1372;
        return delegate$966.createFunctionExpression(null, params$1373, defaults$1374, body$1375, options$1370.rest || null, options$1370.generator, body$1375.type !== Syntax$950.BlockStatement);
    }
    function parsePropertyMethodFunction$1021(options$1376) {
        var previousStrict$1377, tmp$1378, method$1379;
        previousStrict$1377 = strict$957;
        strict$957 = true;
        tmp$1378 = parseParams$1083();
        if (tmp$1378.stricted) {
            throwErrorTolerant$1008(tmp$1378.stricted, tmp$1378.message);
        }
        method$1379 = parsePropertyFunction$1020({
            params: tmp$1378.params,
            defaults: tmp$1378.defaults,
            rest: tmp$1378.rest,
            generator: options$1376.generator
        });
        strict$957 = previousStrict$1377;
        return method$1379;
    }
    function parseObjectPropertyKey$1022() {
        var token$1380 = lex$1003();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1380.type === Token$947.StringLiteral || token$1380.type === Token$947.NumericLiteral) {
            if (strict$957 && token$1380.octal) {
                throwErrorTolerant$1008(token$1380, Messages$952.StrictOctalLiteral);
            }
            return delegate$966.createLiteral(token$1380);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$966.createIdentifier(token$1380.value);
    }
    function parseObjectProperty$1023() {
        var token$1381, key$1382, id$1383, value$1384, param$1385;
        token$1381 = lookahead$969;
        if (token$1381.type === Token$947.Identifier) {
            id$1383 = parseObjectPropertyKey$1022();
            // Property Assignment: Getter and Setter.
            if (token$1381.value === 'get' && !(match$1012(':') || match$1012('('))) {
                key$1382 = parseObjectPropertyKey$1022();
                expect$1010('(');
                expect$1010(')');
                return delegate$966.createProperty('get', key$1382, parsePropertyFunction$1020({ generator: false }), false, false);
            }
            if (token$1381.value === 'set' && !(match$1012(':') || match$1012('('))) {
                key$1382 = parseObjectPropertyKey$1022();
                expect$1010('(');
                token$1381 = lookahead$969;
                param$1385 = [parseVariableIdentifier$1050()];
                expect$1010(')');
                return delegate$966.createProperty('set', key$1382, parsePropertyFunction$1020({
                    params: param$1385,
                    generator: false,
                    name: token$1381
                }), false, false);
            }
            if (match$1012(':')) {
                lex$1003();
                return delegate$966.createProperty('init', id$1383, parseAssignmentExpression$1046(), false, false);
            }
            if (match$1012('(')) {
                return delegate$966.createProperty('init', id$1383, parsePropertyMethodFunction$1021({ generator: false }), true, false);
            }
            return delegate$966.createProperty('init', id$1383, id$1383, false, true);
        }
        if (token$1381.type === Token$947.EOF || token$1381.type === Token$947.Punctuator) {
            if (!match$1012('*')) {
                throwUnexpected$1009(token$1381);
            }
            lex$1003();
            id$1383 = parseObjectPropertyKey$1022();
            if (!match$1012('(')) {
                throwUnexpected$1009(lex$1003());
            }
            return delegate$966.createProperty('init', id$1383, parsePropertyMethodFunction$1021({ generator: true }), true, false);
        }
        key$1382 = parseObjectPropertyKey$1022();
        if (match$1012(':')) {
            lex$1003();
            return delegate$966.createProperty('init', key$1382, parseAssignmentExpression$1046(), false, false);
        }
        if (match$1012('(')) {
            return delegate$966.createProperty('init', key$1382, parsePropertyMethodFunction$1021({ generator: false }), true, false);
        }
        throwUnexpected$1009(lex$1003());
    }
    function parseObjectInitialiser$1024() {
        var properties$1386 = [], property$1387, name$1388, key$1389, kind$1390, map$1391 = {}, toString$1392 = String;
        expect$1010('{');
        while (!match$1012('}')) {
            property$1387 = parseObjectProperty$1023();
            if (property$1387.key.type === Syntax$950.Identifier) {
                name$1388 = property$1387.key.name;
            } else {
                name$1388 = toString$1392(property$1387.key.value);
            }
            kind$1390 = property$1387.kind === 'init' ? PropertyKind$951.Data : property$1387.kind === 'get' ? PropertyKind$951.Get : PropertyKind$951.Set;
            key$1389 = '$' + name$1388;
            if (Object.prototype.hasOwnProperty.call(map$1391, key$1389)) {
                if (map$1391[key$1389] === PropertyKind$951.Data) {
                    if (strict$957 && kind$1390 === PropertyKind$951.Data) {
                        throwErrorTolerant$1008({}, Messages$952.StrictDuplicateProperty);
                    } else if (kind$1390 !== PropertyKind$951.Data) {
                        throwErrorTolerant$1008({}, Messages$952.AccessorDataProperty);
                    }
                } else {
                    if (kind$1390 === PropertyKind$951.Data) {
                        throwErrorTolerant$1008({}, Messages$952.AccessorDataProperty);
                    } else if (map$1391[key$1389] & kind$1390) {
                        throwErrorTolerant$1008({}, Messages$952.AccessorGetSet);
                    }
                }
                map$1391[key$1389] |= kind$1390;
            } else {
                map$1391[key$1389] = kind$1390;
            }
            properties$1386.push(property$1387);
            if (!match$1012('}')) {
                expect$1010(',');
            }
        }
        expect$1010('}');
        return delegate$966.createObjectExpression(properties$1386);
    }
    function parseTemplateElement$1025(option$1393) {
        var token$1394 = scanTemplateElement$998(option$1393);
        if (strict$957 && token$1394.octal) {
            throwError$1007(token$1394, Messages$952.StrictOctalLiteral);
        }
        return delegate$966.createTemplateElement({
            raw: token$1394.value.raw,
            cooked: token$1394.value.cooked
        }, token$1394.tail);
    }
    function parseTemplateLiteral$1026() {
        var quasi$1395, quasis$1396, expressions$1397;
        quasi$1395 = parseTemplateElement$1025({ head: true });
        quasis$1396 = [quasi$1395];
        expressions$1397 = [];
        while (!quasi$1395.tail) {
            expressions$1397.push(parseExpression$1047());
            quasi$1395 = parseTemplateElement$1025({ head: false });
            quasis$1396.push(quasi$1395);
        }
        return delegate$966.createTemplateLiteral(quasis$1396, expressions$1397);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$1027() {
        var expr$1398;
        expect$1010('(');
        ++state$971.parenthesizedCount;
        expr$1398 = parseExpression$1047();
        expect$1010(')');
        return expr$1398;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$1028() {
        var type$1399, token$1400, resolvedIdent$1401;
        token$1400 = lookahead$969;
        type$1399 = lookahead$969.type;
        if (type$1399 === Token$947.Identifier) {
            resolvedIdent$1401 = expander$946.resolve(tokenStream$967[lookaheadIndex$970]);
            lex$1003();
            return delegate$966.createIdentifier(resolvedIdent$1401);
        }
        if (type$1399 === Token$947.StringLiteral || type$1399 === Token$947.NumericLiteral) {
            if (strict$957 && lookahead$969.octal) {
                throwErrorTolerant$1008(lookahead$969, Messages$952.StrictOctalLiteral);
            }
            return delegate$966.createLiteral(lex$1003());
        }
        if (type$1399 === Token$947.Keyword) {
            if (matchKeyword$1013('this')) {
                lex$1003();
                return delegate$966.createThisExpression();
            }
            if (matchKeyword$1013('function')) {
                return parseFunctionExpression$1085();
            }
            if (matchKeyword$1013('class')) {
                return parseClassExpression$1090();
            }
            if (matchKeyword$1013('super')) {
                lex$1003();
                return delegate$966.createIdentifier('super');
            }
        }
        if (type$1399 === Token$947.BooleanLiteral) {
            token$1400 = lex$1003();
            token$1400.value = token$1400.value === 'true';
            return delegate$966.createLiteral(token$1400);
        }
        if (type$1399 === Token$947.NullLiteral) {
            token$1400 = lex$1003();
            token$1400.value = null;
            return delegate$966.createLiteral(token$1400);
        }
        if (match$1012('[')) {
            return parseArrayInitialiser$1019();
        }
        if (match$1012('{')) {
            return parseObjectInitialiser$1024();
        }
        if (match$1012('(')) {
            return parseGroupExpression$1027();
        }
        if (lookahead$969.type === Token$947.RegularExpression) {
            return delegate$966.createLiteral(lex$1003());
        }
        if (type$1399 === Token$947.Template) {
            return parseTemplateLiteral$1026();
        }
        return throwUnexpected$1009(lex$1003());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$1029() {
        var args$1402 = [], arg$1403;
        expect$1010('(');
        if (!match$1012(')')) {
            while (streamIndex$968 < length$965) {
                arg$1403 = parseSpreadOrAssignmentExpression$1030();
                args$1402.push(arg$1403);
                if (match$1012(')')) {
                    break;
                } else if (arg$1403.type === Syntax$950.SpreadElement) {
                    throwError$1007({}, Messages$952.ElementAfterSpreadElement);
                }
                expect$1010(',');
            }
        }
        expect$1010(')');
        return args$1402;
    }
    function parseSpreadOrAssignmentExpression$1030() {
        if (match$1012('...')) {
            lex$1003();
            return delegate$966.createSpreadElement(parseAssignmentExpression$1046());
        }
        return parseAssignmentExpression$1046();
    }
    function parseNonComputedProperty$1031() {
        var token$1404 = lex$1003();
        if (!isIdentifierName$1000(token$1404)) {
            throwUnexpected$1009(token$1404);
        }
        return delegate$966.createIdentifier(token$1404.value);
    }
    function parseNonComputedMember$1032() {
        expect$1010('.');
        return parseNonComputedProperty$1031();
    }
    function parseComputedMember$1033() {
        var expr$1405;
        expect$1010('[');
        expr$1405 = parseExpression$1047();
        expect$1010(']');
        return expr$1405;
    }
    function parseNewExpression$1034() {
        var callee$1406, args$1407;
        expectKeyword$1011('new');
        callee$1406 = parseLeftHandSideExpression$1036();
        args$1407 = match$1012('(') ? parseArguments$1029() : [];
        return delegate$966.createNewExpression(callee$1406, args$1407);
    }
    function parseLeftHandSideExpressionAllowCall$1035() {
        var expr$1408, args$1409, property$1410;
        expr$1408 = matchKeyword$1013('new') ? parseNewExpression$1034() : parsePrimaryExpression$1028();
        while (match$1012('.') || match$1012('[') || match$1012('(') || lookahead$969.type === Token$947.Template) {
            if (match$1012('(')) {
                args$1409 = parseArguments$1029();
                expr$1408 = delegate$966.createCallExpression(expr$1408, args$1409);
            } else if (match$1012('[')) {
                expr$1408 = delegate$966.createMemberExpression('[', expr$1408, parseComputedMember$1033());
            } else if (match$1012('.')) {
                expr$1408 = delegate$966.createMemberExpression('.', expr$1408, parseNonComputedMember$1032());
            } else {
                expr$1408 = delegate$966.createTaggedTemplateExpression(expr$1408, parseTemplateLiteral$1026());
            }
        }
        return expr$1408;
    }
    function parseLeftHandSideExpression$1036() {
        var expr$1411, property$1412;
        expr$1411 = matchKeyword$1013('new') ? parseNewExpression$1034() : parsePrimaryExpression$1028();
        while (match$1012('.') || match$1012('[') || lookahead$969.type === Token$947.Template) {
            if (match$1012('[')) {
                expr$1411 = delegate$966.createMemberExpression('[', expr$1411, parseComputedMember$1033());
            } else if (match$1012('.')) {
                expr$1411 = delegate$966.createMemberExpression('.', expr$1411, parseNonComputedMember$1032());
            } else {
                expr$1411 = delegate$966.createTaggedTemplateExpression(expr$1411, parseTemplateLiteral$1026());
            }
        }
        return expr$1411;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$1037() {
        var expr$1413 = parseLeftHandSideExpressionAllowCall$1035(), token$1414 = lookahead$969;
        if (lookahead$969.type !== Token$947.Punctuator) {
            return expr$1413;
        }
        if ((match$1012('++') || match$1012('--')) && !peekLineTerminator$1006()) {
            // 11.3.1, 11.3.2
            if (strict$957 && expr$1413.type === Syntax$950.Identifier && isRestrictedWord$984(expr$1413.name)) {
                throwErrorTolerant$1008({}, Messages$952.StrictLHSPostfix);
            }
            if (!isLeftHandSide$1017(expr$1413)) {
                throwError$1007({}, Messages$952.InvalidLHSInAssignment);
            }
            token$1414 = lex$1003();
            expr$1413 = delegate$966.createPostfixExpression(token$1414.value, expr$1413);
        }
        return expr$1413;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$1038() {
        var token$1415, expr$1416;
        if (lookahead$969.type !== Token$947.Punctuator && lookahead$969.type !== Token$947.Keyword) {
            return parsePostfixExpression$1037();
        }
        if (match$1012('++') || match$1012('--')) {
            token$1415 = lex$1003();
            expr$1416 = parseUnaryExpression$1038();
            // 11.4.4, 11.4.5
            if (strict$957 && expr$1416.type === Syntax$950.Identifier && isRestrictedWord$984(expr$1416.name)) {
                throwErrorTolerant$1008({}, Messages$952.StrictLHSPrefix);
            }
            if (!isLeftHandSide$1017(expr$1416)) {
                throwError$1007({}, Messages$952.InvalidLHSInAssignment);
            }
            return delegate$966.createUnaryExpression(token$1415.value, expr$1416);
        }
        if (match$1012('+') || match$1012('-') || match$1012('~') || match$1012('!')) {
            token$1415 = lex$1003();
            expr$1416 = parseUnaryExpression$1038();
            return delegate$966.createUnaryExpression(token$1415.value, expr$1416);
        }
        if (matchKeyword$1013('delete') || matchKeyword$1013('void') || matchKeyword$1013('typeof')) {
            token$1415 = lex$1003();
            expr$1416 = parseUnaryExpression$1038();
            expr$1416 = delegate$966.createUnaryExpression(token$1415.value, expr$1416);
            if (strict$957 && expr$1416.operator === 'delete' && expr$1416.argument.type === Syntax$950.Identifier) {
                throwErrorTolerant$1008({}, Messages$952.StrictDelete);
            }
            return expr$1416;
        }
        return parsePostfixExpression$1037();
    }
    function binaryPrecedence$1039(token$1417, allowIn$1418) {
        var prec$1419 = 0;
        if (token$1417.type !== Token$947.Punctuator && token$1417.type !== Token$947.Keyword) {
            return 0;
        }
        switch (token$1417.value) {
        case '||':
            prec$1419 = 1;
            break;
        case '&&':
            prec$1419 = 2;
            break;
        case '|':
            prec$1419 = 3;
            break;
        case '^':
            prec$1419 = 4;
            break;
        case '&':
            prec$1419 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1419 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1419 = 7;
            break;
        case 'in':
            prec$1419 = allowIn$1418 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1419 = 8;
            break;
        case '+':
        case '-':
            prec$1419 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1419 = 11;
            break;
        default:
            break;
        }
        return prec$1419;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$1040() {
        var expr$1420, token$1421, prec$1422, previousAllowIn$1423, stack$1424, right$1425, operator$1426, left$1427, i$1428;
        previousAllowIn$1423 = state$971.allowIn;
        state$971.allowIn = true;
        expr$1420 = parseUnaryExpression$1038();
        token$1421 = lookahead$969;
        prec$1422 = binaryPrecedence$1039(token$1421, previousAllowIn$1423);
        if (prec$1422 === 0) {
            return expr$1420;
        }
        token$1421.prec = prec$1422;
        lex$1003();
        stack$1424 = [
            expr$1420,
            token$1421,
            parseUnaryExpression$1038()
        ];
        while ((prec$1422 = binaryPrecedence$1039(lookahead$969, previousAllowIn$1423)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1424.length > 2 && prec$1422 <= stack$1424[stack$1424.length - 2].prec) {
                right$1425 = stack$1424.pop();
                operator$1426 = stack$1424.pop().value;
                left$1427 = stack$1424.pop();
                stack$1424.push(delegate$966.createBinaryExpression(operator$1426, left$1427, right$1425));
            }
            // Shift.
            token$1421 = lex$1003();
            token$1421.prec = prec$1422;
            stack$1424.push(token$1421);
            stack$1424.push(parseUnaryExpression$1038());
        }
        state$971.allowIn = previousAllowIn$1423;
        // Final reduce to clean-up the stack.
        i$1428 = stack$1424.length - 1;
        expr$1420 = stack$1424[i$1428];
        while (i$1428 > 1) {
            expr$1420 = delegate$966.createBinaryExpression(stack$1424[i$1428 - 1].value, stack$1424[i$1428 - 2], expr$1420);
            i$1428 -= 2;
        }
        return expr$1420;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$1041() {
        var expr$1429, previousAllowIn$1430, consequent$1431, alternate$1432;
        expr$1429 = parseBinaryExpression$1040();
        if (match$1012('?')) {
            lex$1003();
            previousAllowIn$1430 = state$971.allowIn;
            state$971.allowIn = true;
            consequent$1431 = parseAssignmentExpression$1046();
            state$971.allowIn = previousAllowIn$1430;
            expect$1010(':');
            alternate$1432 = parseAssignmentExpression$1046();
            expr$1429 = delegate$966.createConditionalExpression(expr$1429, consequent$1431, alternate$1432);
        }
        return expr$1429;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$1042(expr$1433) {
        var i$1434, len$1435, property$1436, element$1437;
        if (expr$1433.type === Syntax$950.ObjectExpression) {
            expr$1433.type = Syntax$950.ObjectPattern;
            for (i$1434 = 0, len$1435 = expr$1433.properties.length; i$1434 < len$1435; i$1434 += 1) {
                property$1436 = expr$1433.properties[i$1434];
                if (property$1436.kind !== 'init') {
                    throwError$1007({}, Messages$952.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$1042(property$1436.value);
            }
        } else if (expr$1433.type === Syntax$950.ArrayExpression) {
            expr$1433.type = Syntax$950.ArrayPattern;
            for (i$1434 = 0, len$1435 = expr$1433.elements.length; i$1434 < len$1435; i$1434 += 1) {
                element$1437 = expr$1433.elements[i$1434];
                if (element$1437) {
                    reinterpretAsAssignmentBindingPattern$1042(element$1437);
                }
            }
        } else if (expr$1433.type === Syntax$950.Identifier) {
            if (isRestrictedWord$984(expr$1433.name)) {
                throwError$1007({}, Messages$952.InvalidLHSInAssignment);
            }
        } else if (expr$1433.type === Syntax$950.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$1042(expr$1433.argument);
            if (expr$1433.argument.type === Syntax$950.ObjectPattern) {
                throwError$1007({}, Messages$952.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1433.type !== Syntax$950.MemberExpression && expr$1433.type !== Syntax$950.CallExpression && expr$1433.type !== Syntax$950.NewExpression) {
                throwError$1007({}, Messages$952.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$1043(options$1438, expr$1439) {
        var i$1440, len$1441, property$1442, element$1443;
        if (expr$1439.type === Syntax$950.ObjectExpression) {
            expr$1439.type = Syntax$950.ObjectPattern;
            for (i$1440 = 0, len$1441 = expr$1439.properties.length; i$1440 < len$1441; i$1440 += 1) {
                property$1442 = expr$1439.properties[i$1440];
                if (property$1442.kind !== 'init') {
                    throwError$1007({}, Messages$952.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$1043(options$1438, property$1442.value);
            }
        } else if (expr$1439.type === Syntax$950.ArrayExpression) {
            expr$1439.type = Syntax$950.ArrayPattern;
            for (i$1440 = 0, len$1441 = expr$1439.elements.length; i$1440 < len$1441; i$1440 += 1) {
                element$1443 = expr$1439.elements[i$1440];
                if (element$1443) {
                    reinterpretAsDestructuredParameter$1043(options$1438, element$1443);
                }
            }
        } else if (expr$1439.type === Syntax$950.Identifier) {
            validateParam$1081(options$1438, expr$1439, expr$1439.name);
        } else {
            if (expr$1439.type !== Syntax$950.MemberExpression) {
                throwError$1007({}, Messages$952.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$1044(expressions$1444) {
        var i$1445, len$1446, param$1447, params$1448, defaults$1449, defaultCount$1450, options$1451, rest$1452;
        params$1448 = [];
        defaults$1449 = [];
        defaultCount$1450 = 0;
        rest$1452 = null;
        options$1451 = { paramSet: {} };
        for (i$1445 = 0, len$1446 = expressions$1444.length; i$1445 < len$1446; i$1445 += 1) {
            param$1447 = expressions$1444[i$1445];
            if (param$1447.type === Syntax$950.Identifier) {
                params$1448.push(param$1447);
                defaults$1449.push(null);
                validateParam$1081(options$1451, param$1447, param$1447.name);
            } else if (param$1447.type === Syntax$950.ObjectExpression || param$1447.type === Syntax$950.ArrayExpression) {
                reinterpretAsDestructuredParameter$1043(options$1451, param$1447);
                params$1448.push(param$1447);
                defaults$1449.push(null);
            } else if (param$1447.type === Syntax$950.SpreadElement) {
                assert$973(i$1445 === len$1446 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$1043(options$1451, param$1447.argument);
                rest$1452 = param$1447.argument;
            } else if (param$1447.type === Syntax$950.AssignmentExpression) {
                params$1448.push(param$1447.left);
                defaults$1449.push(param$1447.right);
                ++defaultCount$1450;
                validateParam$1081(options$1451, param$1447.left, param$1447.left.name);
            } else {
                return null;
            }
        }
        if (options$1451.message === Messages$952.StrictParamDupe) {
            throwError$1007(strict$957 ? options$1451.stricted : options$1451.firstRestricted, options$1451.message);
        }
        if (defaultCount$1450 === 0) {
            defaults$1449 = [];
        }
        return {
            params: params$1448,
            defaults: defaults$1449,
            rest: rest$1452,
            stricted: options$1451.stricted,
            firstRestricted: options$1451.firstRestricted,
            message: options$1451.message
        };
    }
    function parseArrowFunctionExpression$1045(options$1453) {
        var previousStrict$1454, previousYieldAllowed$1455, body$1456;
        expect$1010('=>');
        previousStrict$1454 = strict$957;
        previousYieldAllowed$1455 = state$971.yieldAllowed;
        state$971.yieldAllowed = false;
        body$1456 = parseConciseBody$1079();
        if (strict$957 && options$1453.firstRestricted) {
            throwError$1007(options$1453.firstRestricted, options$1453.message);
        }
        if (strict$957 && options$1453.stricted) {
            throwErrorTolerant$1008(options$1453.stricted, options$1453.message);
        }
        strict$957 = previousStrict$1454;
        state$971.yieldAllowed = previousYieldAllowed$1455;
        return delegate$966.createArrowFunctionExpression(options$1453.params, options$1453.defaults, body$1456, options$1453.rest, body$1456.type !== Syntax$950.BlockStatement);
    }
    function parseAssignmentExpression$1046() {
        var expr$1457, token$1458, params$1459, oldParenthesizedCount$1460;
        if (matchKeyword$1013('yield')) {
            return parseYieldExpression$1086();
        }
        oldParenthesizedCount$1460 = state$971.parenthesizedCount;
        if (match$1012('(')) {
            token$1458 = lookahead2$1005();
            if (token$1458.type === Token$947.Punctuator && token$1458.value === ')' || token$1458.value === '...') {
                params$1459 = parseParams$1083();
                if (!match$1012('=>')) {
                    throwUnexpected$1009(lex$1003());
                }
                return parseArrowFunctionExpression$1045(params$1459);
            }
        }
        token$1458 = lookahead$969;
        expr$1457 = parseConditionalExpression$1041();
        if (match$1012('=>') && (state$971.parenthesizedCount === oldParenthesizedCount$1460 || state$971.parenthesizedCount === oldParenthesizedCount$1460 + 1)) {
            if (expr$1457.type === Syntax$950.Identifier) {
                params$1459 = reinterpretAsCoverFormalsList$1044([expr$1457]);
            } else if (expr$1457.type === Syntax$950.SequenceExpression) {
                params$1459 = reinterpretAsCoverFormalsList$1044(expr$1457.expressions);
            }
            if (params$1459) {
                return parseArrowFunctionExpression$1045(params$1459);
            }
        }
        if (matchAssign$1015()) {
            // 11.13.1
            if (strict$957 && expr$1457.type === Syntax$950.Identifier && isRestrictedWord$984(expr$1457.name)) {
                throwErrorTolerant$1008(token$1458, Messages$952.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$1012('=') && (expr$1457.type === Syntax$950.ObjectExpression || expr$1457.type === Syntax$950.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$1042(expr$1457);
            } else if (!isLeftHandSide$1017(expr$1457)) {
                throwError$1007({}, Messages$952.InvalidLHSInAssignment);
            }
            expr$1457 = delegate$966.createAssignmentExpression(lex$1003().value, expr$1457, parseAssignmentExpression$1046());
        }
        return expr$1457;
    }
    // 11.14 Comma Operator
    function parseExpression$1047() {
        var expr$1461, expressions$1462, sequence$1463, coverFormalsList$1464, spreadFound$1465, oldParenthesizedCount$1466;
        oldParenthesizedCount$1466 = state$971.parenthesizedCount;
        expr$1461 = parseAssignmentExpression$1046();
        expressions$1462 = [expr$1461];
        if (match$1012(',')) {
            while (streamIndex$968 < length$965) {
                if (!match$1012(',')) {
                    break;
                }
                lex$1003();
                expr$1461 = parseSpreadOrAssignmentExpression$1030();
                expressions$1462.push(expr$1461);
                if (expr$1461.type === Syntax$950.SpreadElement) {
                    spreadFound$1465 = true;
                    if (!match$1012(')')) {
                        throwError$1007({}, Messages$952.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1463 = delegate$966.createSequenceExpression(expressions$1462);
        }
        if (match$1012('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$971.parenthesizedCount === oldParenthesizedCount$1466 || state$971.parenthesizedCount === oldParenthesizedCount$1466 + 1) {
                expr$1461 = expr$1461.type === Syntax$950.SequenceExpression ? expr$1461.expressions : expressions$1462;
                coverFormalsList$1464 = reinterpretAsCoverFormalsList$1044(expr$1461);
                if (coverFormalsList$1464) {
                    return parseArrowFunctionExpression$1045(coverFormalsList$1464);
                }
            }
            throwUnexpected$1009(lex$1003());
        }
        if (spreadFound$1465 && lookahead2$1005().value !== '=>') {
            throwError$1007({}, Messages$952.IllegalSpread);
        }
        return sequence$1463 || expr$1461;
    }
    // 12.1 Block
    function parseStatementList$1048() {
        var list$1467 = [], statement$1468;
        while (streamIndex$968 < length$965) {
            if (match$1012('}')) {
                break;
            }
            statement$1468 = parseSourceElement$1093();
            if (typeof statement$1468 === 'undefined') {
                break;
            }
            list$1467.push(statement$1468);
        }
        return list$1467;
    }
    function parseBlock$1049() {
        var block$1469;
        expect$1010('{');
        block$1469 = parseStatementList$1048();
        expect$1010('}');
        return delegate$966.createBlockStatement(block$1469);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$1050() {
        var token$1470 = lookahead$969, resolvedIdent$1471;
        if (token$1470.type !== Token$947.Identifier) {
            throwUnexpected$1009(token$1470);
        }
        resolvedIdent$1471 = expander$946.resolve(tokenStream$967[lookaheadIndex$970]);
        lex$1003();
        return delegate$966.createIdentifier(resolvedIdent$1471);
    }
    function parseVariableDeclaration$1051(kind$1472) {
        var id$1473, init$1474 = null;
        if (match$1012('{')) {
            id$1473 = parseObjectInitialiser$1024();
            reinterpretAsAssignmentBindingPattern$1042(id$1473);
        } else if (match$1012('[')) {
            id$1473 = parseArrayInitialiser$1019();
            reinterpretAsAssignmentBindingPattern$1042(id$1473);
        } else {
            id$1473 = state$971.allowKeyword ? parseNonComputedProperty$1031() : parseVariableIdentifier$1050();
            // 12.2.1
            if (strict$957 && isRestrictedWord$984(id$1473.name)) {
                throwErrorTolerant$1008({}, Messages$952.StrictVarName);
            }
        }
        if (kind$1472 === 'const') {
            if (!match$1012('=')) {
                throwError$1007({}, Messages$952.NoUnintializedConst);
            }
            expect$1010('=');
            init$1474 = parseAssignmentExpression$1046();
        } else if (match$1012('=')) {
            lex$1003();
            init$1474 = parseAssignmentExpression$1046();
        }
        return delegate$966.createVariableDeclarator(id$1473, init$1474);
    }
    function parseVariableDeclarationList$1052(kind$1475) {
        var list$1476 = [];
        do {
            list$1476.push(parseVariableDeclaration$1051(kind$1475));
            if (!match$1012(',')) {
                break;
            }
            lex$1003();
        } while (streamIndex$968 < length$965);
        return list$1476;
    }
    function parseVariableStatement$1053() {
        var declarations$1477;
        expectKeyword$1011('var');
        declarations$1477 = parseVariableDeclarationList$1052();
        consumeSemicolon$1016();
        return delegate$966.createVariableDeclaration(declarations$1477, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$1054(kind$1478) {
        var declarations$1479;
        expectKeyword$1011(kind$1478);
        declarations$1479 = parseVariableDeclarationList$1052(kind$1478);
        consumeSemicolon$1016();
        return delegate$966.createVariableDeclaration(declarations$1479, kind$1478);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$1055() {
        var id$1480, src$1481, body$1482;
        lex$1003();
        // 'module'
        if (peekLineTerminator$1006()) {
            throwError$1007({}, Messages$952.NewlineAfterModule);
        }
        switch (lookahead$969.type) {
        case Token$947.StringLiteral:
            id$1480 = parsePrimaryExpression$1028();
            body$1482 = parseModuleBlock$1098();
            src$1481 = null;
            break;
        case Token$947.Identifier:
            id$1480 = parseVariableIdentifier$1050();
            body$1482 = null;
            if (!matchContextualKeyword$1014('from')) {
                throwUnexpected$1009(lex$1003());
            }
            lex$1003();
            src$1481 = parsePrimaryExpression$1028();
            if (src$1481.type !== Syntax$950.Literal) {
                throwError$1007({}, Messages$952.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$1016();
        return delegate$966.createModuleDeclaration(id$1480, src$1481, body$1482);
    }
    function parseExportBatchSpecifier$1056() {
        expect$1010('*');
        return delegate$966.createExportBatchSpecifier();
    }
    function parseExportSpecifier$1057() {
        var id$1483, name$1484 = null;
        id$1483 = parseVariableIdentifier$1050();
        if (matchContextualKeyword$1014('as')) {
            lex$1003();
            name$1484 = parseNonComputedProperty$1031();
        }
        return delegate$966.createExportSpecifier(id$1483, name$1484);
    }
    function parseExportDeclaration$1058() {
        var previousAllowKeyword$1485, decl$1486, def$1487, src$1488, specifiers$1489;
        expectKeyword$1011('export');
        if (lookahead$969.type === Token$947.Keyword) {
            switch (lookahead$969.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$966.createExportDeclaration(parseSourceElement$1093(), null, null);
            }
        }
        if (isIdentifierName$1000(lookahead$969)) {
            previousAllowKeyword$1485 = state$971.allowKeyword;
            state$971.allowKeyword = true;
            decl$1486 = parseVariableDeclarationList$1052('let');
            state$971.allowKeyword = previousAllowKeyword$1485;
            return delegate$966.createExportDeclaration(decl$1486, null, null);
        }
        specifiers$1489 = [];
        src$1488 = null;
        if (match$1012('*')) {
            specifiers$1489.push(parseExportBatchSpecifier$1056());
        } else {
            expect$1010('{');
            do {
                specifiers$1489.push(parseExportSpecifier$1057());
            } while (match$1012(',') && lex$1003());
            expect$1010('}');
        }
        if (matchContextualKeyword$1014('from')) {
            lex$1003();
            src$1488 = parsePrimaryExpression$1028();
            if (src$1488.type !== Syntax$950.Literal) {
                throwError$1007({}, Messages$952.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$1016();
        return delegate$966.createExportDeclaration(null, specifiers$1489, src$1488);
    }
    function parseImportDeclaration$1059() {
        var specifiers$1490, kind$1491, src$1492;
        expectKeyword$1011('import');
        specifiers$1490 = [];
        if (isIdentifierName$1000(lookahead$969)) {
            kind$1491 = 'default';
            specifiers$1490.push(parseImportSpecifier$1060());
            if (!matchContextualKeyword$1014('from')) {
                throwError$1007({}, Messages$952.NoFromAfterImport);
            }
            lex$1003();
        } else if (match$1012('{')) {
            kind$1491 = 'named';
            lex$1003();
            do {
                specifiers$1490.push(parseImportSpecifier$1060());
            } while (match$1012(',') && lex$1003());
            expect$1010('}');
            if (!matchContextualKeyword$1014('from')) {
                throwError$1007({}, Messages$952.NoFromAfterImport);
            }
            lex$1003();
        }
        src$1492 = parsePrimaryExpression$1028();
        if (src$1492.type !== Syntax$950.Literal) {
            throwError$1007({}, Messages$952.InvalidModuleSpecifier);
        }
        consumeSemicolon$1016();
        return delegate$966.createImportDeclaration(specifiers$1490, kind$1491, src$1492);
    }
    function parseImportSpecifier$1060() {
        var id$1493, name$1494 = null;
        id$1493 = parseNonComputedProperty$1031();
        if (matchContextualKeyword$1014('as')) {
            lex$1003();
            name$1494 = parseVariableIdentifier$1050();
        }
        return delegate$966.createImportSpecifier(id$1493, name$1494);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$1061() {
        expect$1010(';');
        return delegate$966.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$1062() {
        var expr$1495 = parseExpression$1047();
        consumeSemicolon$1016();
        return delegate$966.createExpressionStatement(expr$1495);
    }
    // 12.5 If statement
    function parseIfStatement$1063() {
        var test$1496, consequent$1497, alternate$1498;
        expectKeyword$1011('if');
        expect$1010('(');
        test$1496 = parseExpression$1047();
        expect$1010(')');
        consequent$1497 = parseStatement$1078();
        if (matchKeyword$1013('else')) {
            lex$1003();
            alternate$1498 = parseStatement$1078();
        } else {
            alternate$1498 = null;
        }
        return delegate$966.createIfStatement(test$1496, consequent$1497, alternate$1498);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$1064() {
        var body$1499, test$1500, oldInIteration$1501;
        expectKeyword$1011('do');
        oldInIteration$1501 = state$971.inIteration;
        state$971.inIteration = true;
        body$1499 = parseStatement$1078();
        state$971.inIteration = oldInIteration$1501;
        expectKeyword$1011('while');
        expect$1010('(');
        test$1500 = parseExpression$1047();
        expect$1010(')');
        if (match$1012(';')) {
            lex$1003();
        }
        return delegate$966.createDoWhileStatement(body$1499, test$1500);
    }
    function parseWhileStatement$1065() {
        var test$1502, body$1503, oldInIteration$1504;
        expectKeyword$1011('while');
        expect$1010('(');
        test$1502 = parseExpression$1047();
        expect$1010(')');
        oldInIteration$1504 = state$971.inIteration;
        state$971.inIteration = true;
        body$1503 = parseStatement$1078();
        state$971.inIteration = oldInIteration$1504;
        return delegate$966.createWhileStatement(test$1502, body$1503);
    }
    function parseForVariableDeclaration$1066() {
        var token$1505 = lex$1003(), declarations$1506 = parseVariableDeclarationList$1052();
        return delegate$966.createVariableDeclaration(declarations$1506, token$1505.value);
    }
    function parseForStatement$1067(opts$1507) {
        var init$1508, test$1509, update$1510, left$1511, right$1512, body$1513, operator$1514, oldInIteration$1515;
        init$1508 = test$1509 = update$1510 = null;
        expectKeyword$1011('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$1014('each')) {
            throwError$1007({}, Messages$952.EachNotAllowed);
        }
        expect$1010('(');
        if (match$1012(';')) {
            lex$1003();
        } else {
            if (matchKeyword$1013('var') || matchKeyword$1013('let') || matchKeyword$1013('const')) {
                state$971.allowIn = false;
                init$1508 = parseForVariableDeclaration$1066();
                state$971.allowIn = true;
                if (init$1508.declarations.length === 1) {
                    if (matchKeyword$1013('in') || matchContextualKeyword$1014('of')) {
                        operator$1514 = lookahead$969;
                        if (!((operator$1514.value === 'in' || init$1508.kind !== 'var') && init$1508.declarations[0].init)) {
                            lex$1003();
                            left$1511 = init$1508;
                            right$1512 = parseExpression$1047();
                            init$1508 = null;
                        }
                    }
                }
            } else {
                state$971.allowIn = false;
                init$1508 = parseExpression$1047();
                state$971.allowIn = true;
                if (matchContextualKeyword$1014('of')) {
                    operator$1514 = lex$1003();
                    left$1511 = init$1508;
                    right$1512 = parseExpression$1047();
                    init$1508 = null;
                } else if (matchKeyword$1013('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$1018(init$1508)) {
                        throwError$1007({}, Messages$952.InvalidLHSInForIn);
                    }
                    operator$1514 = lex$1003();
                    left$1511 = init$1508;
                    right$1512 = parseExpression$1047();
                    init$1508 = null;
                }
            }
            if (typeof left$1511 === 'undefined') {
                expect$1010(';');
            }
        }
        if (typeof left$1511 === 'undefined') {
            if (!match$1012(';')) {
                test$1509 = parseExpression$1047();
            }
            expect$1010(';');
            if (!match$1012(')')) {
                update$1510 = parseExpression$1047();
            }
        }
        expect$1010(')');
        oldInIteration$1515 = state$971.inIteration;
        state$971.inIteration = true;
        if (!(opts$1507 !== undefined && opts$1507.ignoreBody)) {
            body$1513 = parseStatement$1078();
        }
        state$971.inIteration = oldInIteration$1515;
        if (typeof left$1511 === 'undefined') {
            return delegate$966.createForStatement(init$1508, test$1509, update$1510, body$1513);
        }
        if (operator$1514.value === 'in') {
            return delegate$966.createForInStatement(left$1511, right$1512, body$1513);
        }
        return delegate$966.createForOfStatement(left$1511, right$1512, body$1513);
    }
    // 12.7 The continue statement
    function parseContinueStatement$1068() {
        var label$1516 = null, key$1517;
        expectKeyword$1011('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$969.value.charCodeAt(0) === 59) {
            lex$1003();
            if (!state$971.inIteration) {
                throwError$1007({}, Messages$952.IllegalContinue);
            }
            return delegate$966.createContinueStatement(null);
        }
        if (peekLineTerminator$1006()) {
            if (!state$971.inIteration) {
                throwError$1007({}, Messages$952.IllegalContinue);
            }
            return delegate$966.createContinueStatement(null);
        }
        if (lookahead$969.type === Token$947.Identifier) {
            label$1516 = parseVariableIdentifier$1050();
            key$1517 = '$' + label$1516.name;
            if (!Object.prototype.hasOwnProperty.call(state$971.labelSet, key$1517)) {
                throwError$1007({}, Messages$952.UnknownLabel, label$1516.name);
            }
        }
        consumeSemicolon$1016();
        if (label$1516 === null && !state$971.inIteration) {
            throwError$1007({}, Messages$952.IllegalContinue);
        }
        return delegate$966.createContinueStatement(label$1516);
    }
    // 12.8 The break statement
    function parseBreakStatement$1069() {
        var label$1518 = null, key$1519;
        expectKeyword$1011('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$969.value.charCodeAt(0) === 59) {
            lex$1003();
            if (!(state$971.inIteration || state$971.inSwitch)) {
                throwError$1007({}, Messages$952.IllegalBreak);
            }
            return delegate$966.createBreakStatement(null);
        }
        if (peekLineTerminator$1006()) {
            if (!(state$971.inIteration || state$971.inSwitch)) {
                throwError$1007({}, Messages$952.IllegalBreak);
            }
            return delegate$966.createBreakStatement(null);
        }
        if (lookahead$969.type === Token$947.Identifier) {
            label$1518 = parseVariableIdentifier$1050();
            key$1519 = '$' + label$1518.name;
            if (!Object.prototype.hasOwnProperty.call(state$971.labelSet, key$1519)) {
                throwError$1007({}, Messages$952.UnknownLabel, label$1518.name);
            }
        }
        consumeSemicolon$1016();
        if (label$1518 === null && !(state$971.inIteration || state$971.inSwitch)) {
            throwError$1007({}, Messages$952.IllegalBreak);
        }
        return delegate$966.createBreakStatement(label$1518);
    }
    // 12.9 The return statement
    function parseReturnStatement$1070() {
        var argument$1520 = null;
        expectKeyword$1011('return');
        if (!state$971.inFunctionBody) {
            throwErrorTolerant$1008({}, Messages$952.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$980(String(lookahead$969.value).charCodeAt(0))) {
            argument$1520 = parseExpression$1047();
            consumeSemicolon$1016();
            return delegate$966.createReturnStatement(argument$1520);
        }
        if (peekLineTerminator$1006()) {
            return delegate$966.createReturnStatement(null);
        }
        if (!match$1012(';')) {
            if (!match$1012('}') && lookahead$969.type !== Token$947.EOF) {
                argument$1520 = parseExpression$1047();
            }
        }
        consumeSemicolon$1016();
        return delegate$966.createReturnStatement(argument$1520);
    }
    // 12.10 The with statement
    function parseWithStatement$1071() {
        var object$1521, body$1522;
        if (strict$957) {
            throwErrorTolerant$1008({}, Messages$952.StrictModeWith);
        }
        expectKeyword$1011('with');
        expect$1010('(');
        object$1521 = parseExpression$1047();
        expect$1010(')');
        body$1522 = parseStatement$1078();
        return delegate$966.createWithStatement(object$1521, body$1522);
    }
    // 12.10 The swith statement
    function parseSwitchCase$1072() {
        var test$1523, consequent$1524 = [], sourceElement$1525;
        if (matchKeyword$1013('default')) {
            lex$1003();
            test$1523 = null;
        } else {
            expectKeyword$1011('case');
            test$1523 = parseExpression$1047();
        }
        expect$1010(':');
        while (streamIndex$968 < length$965) {
            if (match$1012('}') || matchKeyword$1013('default') || matchKeyword$1013('case')) {
                break;
            }
            sourceElement$1525 = parseSourceElement$1093();
            if (typeof sourceElement$1525 === 'undefined') {
                break;
            }
            consequent$1524.push(sourceElement$1525);
        }
        return delegate$966.createSwitchCase(test$1523, consequent$1524);
    }
    function parseSwitchStatement$1073() {
        var discriminant$1526, cases$1527, clause$1528, oldInSwitch$1529, defaultFound$1530;
        expectKeyword$1011('switch');
        expect$1010('(');
        discriminant$1526 = parseExpression$1047();
        expect$1010(')');
        expect$1010('{');
        cases$1527 = [];
        if (match$1012('}')) {
            lex$1003();
            return delegate$966.createSwitchStatement(discriminant$1526, cases$1527);
        }
        oldInSwitch$1529 = state$971.inSwitch;
        state$971.inSwitch = true;
        defaultFound$1530 = false;
        while (streamIndex$968 < length$965) {
            if (match$1012('}')) {
                break;
            }
            clause$1528 = parseSwitchCase$1072();
            if (clause$1528.test === null) {
                if (defaultFound$1530) {
                    throwError$1007({}, Messages$952.MultipleDefaultsInSwitch);
                }
                defaultFound$1530 = true;
            }
            cases$1527.push(clause$1528);
        }
        state$971.inSwitch = oldInSwitch$1529;
        expect$1010('}');
        return delegate$966.createSwitchStatement(discriminant$1526, cases$1527);
    }
    // 12.13 The throw statement
    function parseThrowStatement$1074() {
        var argument$1531;
        expectKeyword$1011('throw');
        if (peekLineTerminator$1006()) {
            throwError$1007({}, Messages$952.NewlineAfterThrow);
        }
        argument$1531 = parseExpression$1047();
        consumeSemicolon$1016();
        return delegate$966.createThrowStatement(argument$1531);
    }
    // 12.14 The try statement
    function parseCatchClause$1075() {
        var param$1532, body$1533;
        expectKeyword$1011('catch');
        expect$1010('(');
        if (match$1012(')')) {
            throwUnexpected$1009(lookahead$969);
        }
        param$1532 = parseExpression$1047();
        // 12.14.1
        if (strict$957 && param$1532.type === Syntax$950.Identifier && isRestrictedWord$984(param$1532.name)) {
            throwErrorTolerant$1008({}, Messages$952.StrictCatchVariable);
        }
        expect$1010(')');
        body$1533 = parseBlock$1049();
        return delegate$966.createCatchClause(param$1532, body$1533);
    }
    function parseTryStatement$1076() {
        var block$1534, handlers$1535 = [], finalizer$1536 = null;
        expectKeyword$1011('try');
        block$1534 = parseBlock$1049();
        if (matchKeyword$1013('catch')) {
            handlers$1535.push(parseCatchClause$1075());
        }
        if (matchKeyword$1013('finally')) {
            lex$1003();
            finalizer$1536 = parseBlock$1049();
        }
        if (handlers$1535.length === 0 && !finalizer$1536) {
            throwError$1007({}, Messages$952.NoCatchOrFinally);
        }
        return delegate$966.createTryStatement(block$1534, [], handlers$1535, finalizer$1536);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$1077() {
        expectKeyword$1011('debugger');
        consumeSemicolon$1016();
        return delegate$966.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$1078() {
        var type$1537 = lookahead$969.type, expr$1538, labeledBody$1539, key$1540;
        if (type$1537 === Token$947.EOF) {
            throwUnexpected$1009(lookahead$969);
        }
        if (type$1537 === Token$947.Punctuator) {
            switch (lookahead$969.value) {
            case ';':
                return parseEmptyStatement$1061();
            case '{':
                return parseBlock$1049();
            case '(':
                return parseExpressionStatement$1062();
            default:
                break;
            }
        }
        if (type$1537 === Token$947.Keyword) {
            switch (lookahead$969.value) {
            case 'break':
                return parseBreakStatement$1069();
            case 'continue':
                return parseContinueStatement$1068();
            case 'debugger':
                return parseDebuggerStatement$1077();
            case 'do':
                return parseDoWhileStatement$1064();
            case 'for':
                return parseForStatement$1067();
            case 'function':
                return parseFunctionDeclaration$1084();
            case 'class':
                return parseClassDeclaration$1091();
            case 'if':
                return parseIfStatement$1063();
            case 'return':
                return parseReturnStatement$1070();
            case 'switch':
                return parseSwitchStatement$1073();
            case 'throw':
                return parseThrowStatement$1074();
            case 'try':
                return parseTryStatement$1076();
            case 'var':
                return parseVariableStatement$1053();
            case 'while':
                return parseWhileStatement$1065();
            case 'with':
                return parseWithStatement$1071();
            default:
                break;
            }
        }
        expr$1538 = parseExpression$1047();
        // 12.12 Labelled Statements
        if (expr$1538.type === Syntax$950.Identifier && match$1012(':')) {
            lex$1003();
            key$1540 = '$' + expr$1538.name;
            if (Object.prototype.hasOwnProperty.call(state$971.labelSet, key$1540)) {
                throwError$1007({}, Messages$952.Redeclaration, 'Label', expr$1538.name);
            }
            state$971.labelSet[key$1540] = true;
            labeledBody$1539 = parseStatement$1078();
            delete state$971.labelSet[key$1540];
            return delegate$966.createLabeledStatement(expr$1538, labeledBody$1539);
        }
        consumeSemicolon$1016();
        return delegate$966.createExpressionStatement(expr$1538);
    }
    // 13 Function Definition
    function parseConciseBody$1079() {
        if (match$1012('{')) {
            return parseFunctionSourceElements$1080();
        }
        return parseAssignmentExpression$1046();
    }
    function parseFunctionSourceElements$1080() {
        var sourceElement$1541, sourceElements$1542 = [], token$1543, directive$1544, firstRestricted$1545, oldLabelSet$1546, oldInIteration$1547, oldInSwitch$1548, oldInFunctionBody$1549, oldParenthesizedCount$1550;
        expect$1010('{');
        while (streamIndex$968 < length$965) {
            if (lookahead$969.type !== Token$947.StringLiteral) {
                break;
            }
            token$1543 = lookahead$969;
            sourceElement$1541 = parseSourceElement$1093();
            sourceElements$1542.push(sourceElement$1541);
            if (sourceElement$1541.expression.type !== Syntax$950.Literal) {
                // this is not directive
                break;
            }
            directive$1544 = token$1543.value;
            if (directive$1544 === 'use strict') {
                strict$957 = true;
                if (firstRestricted$1545) {
                    throwErrorTolerant$1008(firstRestricted$1545, Messages$952.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1545 && token$1543.octal) {
                    firstRestricted$1545 = token$1543;
                }
            }
        }
        oldLabelSet$1546 = state$971.labelSet;
        oldInIteration$1547 = state$971.inIteration;
        oldInSwitch$1548 = state$971.inSwitch;
        oldInFunctionBody$1549 = state$971.inFunctionBody;
        oldParenthesizedCount$1550 = state$971.parenthesizedCount;
        state$971.labelSet = {};
        state$971.inIteration = false;
        state$971.inSwitch = false;
        state$971.inFunctionBody = true;
        state$971.parenthesizedCount = 0;
        while (streamIndex$968 < length$965) {
            if (match$1012('}')) {
                break;
            }
            sourceElement$1541 = parseSourceElement$1093();
            if (typeof sourceElement$1541 === 'undefined') {
                break;
            }
            sourceElements$1542.push(sourceElement$1541);
        }
        expect$1010('}');
        state$971.labelSet = oldLabelSet$1546;
        state$971.inIteration = oldInIteration$1547;
        state$971.inSwitch = oldInSwitch$1548;
        state$971.inFunctionBody = oldInFunctionBody$1549;
        state$971.parenthesizedCount = oldParenthesizedCount$1550;
        return delegate$966.createBlockStatement(sourceElements$1542);
    }
    function validateParam$1081(options$1551, param$1552, name$1553) {
        var key$1554 = '$' + name$1553;
        if (strict$957) {
            if (isRestrictedWord$984(name$1553)) {
                options$1551.stricted = param$1552;
                options$1551.message = Messages$952.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1551.paramSet, key$1554)) {
                options$1551.stricted = param$1552;
                options$1551.message = Messages$952.StrictParamDupe;
            }
        } else if (!options$1551.firstRestricted) {
            if (isRestrictedWord$984(name$1553)) {
                options$1551.firstRestricted = param$1552;
                options$1551.message = Messages$952.StrictParamName;
            } else if (isStrictModeReservedWord$983(name$1553)) {
                options$1551.firstRestricted = param$1552;
                options$1551.message = Messages$952.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1551.paramSet, key$1554)) {
                options$1551.firstRestricted = param$1552;
                options$1551.message = Messages$952.StrictParamDupe;
            }
        }
        options$1551.paramSet[key$1554] = true;
    }
    function parseParam$1082(options$1555) {
        var token$1556, rest$1557, param$1558, def$1559;
        token$1556 = lookahead$969;
        if (token$1556.value === '...') {
            token$1556 = lex$1003();
            rest$1557 = true;
        }
        if (match$1012('[')) {
            param$1558 = parseArrayInitialiser$1019();
            reinterpretAsDestructuredParameter$1043(options$1555, param$1558);
        } else if (match$1012('{')) {
            if (rest$1557) {
                throwError$1007({}, Messages$952.ObjectPatternAsRestParameter);
            }
            param$1558 = parseObjectInitialiser$1024();
            reinterpretAsDestructuredParameter$1043(options$1555, param$1558);
        } else {
            param$1558 = parseVariableIdentifier$1050();
            validateParam$1081(options$1555, token$1556, token$1556.value);
            if (match$1012('=')) {
                if (rest$1557) {
                    throwErrorTolerant$1008(lookahead$969, Messages$952.DefaultRestParameter);
                }
                lex$1003();
                def$1559 = parseAssignmentExpression$1046();
                ++options$1555.defaultCount;
            }
        }
        if (rest$1557) {
            if (!match$1012(')')) {
                throwError$1007({}, Messages$952.ParameterAfterRestParameter);
            }
            options$1555.rest = param$1558;
            return false;
        }
        options$1555.params.push(param$1558);
        options$1555.defaults.push(def$1559);
        return !match$1012(')');
    }
    function parseParams$1083(firstRestricted$1560) {
        var options$1561;
        options$1561 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1560
        };
        expect$1010('(');
        if (!match$1012(')')) {
            options$1561.paramSet = {};
            while (streamIndex$968 < length$965) {
                if (!parseParam$1082(options$1561)) {
                    break;
                }
                expect$1010(',');
            }
        }
        expect$1010(')');
        if (options$1561.defaultCount === 0) {
            options$1561.defaults = [];
        }
        return options$1561;
    }
    function parseFunctionDeclaration$1084() {
        var id$1562, body$1563, token$1564, tmp$1565, firstRestricted$1566, message$1567, previousStrict$1568, previousYieldAllowed$1569, generator$1570, expression$1571;
        expectKeyword$1011('function');
        generator$1570 = false;
        if (match$1012('*')) {
            lex$1003();
            generator$1570 = true;
        }
        token$1564 = lookahead$969;
        id$1562 = parseVariableIdentifier$1050();
        if (strict$957) {
            if (isRestrictedWord$984(token$1564.value)) {
                throwErrorTolerant$1008(token$1564, Messages$952.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$984(token$1564.value)) {
                firstRestricted$1566 = token$1564;
                message$1567 = Messages$952.StrictFunctionName;
            } else if (isStrictModeReservedWord$983(token$1564.value)) {
                firstRestricted$1566 = token$1564;
                message$1567 = Messages$952.StrictReservedWord;
            }
        }
        tmp$1565 = parseParams$1083(firstRestricted$1566);
        firstRestricted$1566 = tmp$1565.firstRestricted;
        if (tmp$1565.message) {
            message$1567 = tmp$1565.message;
        }
        previousStrict$1568 = strict$957;
        previousYieldAllowed$1569 = state$971.yieldAllowed;
        state$971.yieldAllowed = generator$1570;
        // here we redo some work in order to set 'expression'
        expression$1571 = !match$1012('{');
        body$1563 = parseConciseBody$1079();
        if (strict$957 && firstRestricted$1566) {
            throwError$1007(firstRestricted$1566, message$1567);
        }
        if (strict$957 && tmp$1565.stricted) {
            throwErrorTolerant$1008(tmp$1565.stricted, message$1567);
        }
        if (state$971.yieldAllowed && !state$971.yieldFound) {
            throwErrorTolerant$1008({}, Messages$952.NoYieldInGenerator);
        }
        strict$957 = previousStrict$1568;
        state$971.yieldAllowed = previousYieldAllowed$1569;
        return delegate$966.createFunctionDeclaration(id$1562, tmp$1565.params, tmp$1565.defaults, body$1563, tmp$1565.rest, generator$1570, expression$1571);
    }
    function parseFunctionExpression$1085() {
        var token$1572, id$1573 = null, firstRestricted$1574, message$1575, tmp$1576, body$1577, previousStrict$1578, previousYieldAllowed$1579, generator$1580, expression$1581;
        expectKeyword$1011('function');
        generator$1580 = false;
        if (match$1012('*')) {
            lex$1003();
            generator$1580 = true;
        }
        if (!match$1012('(')) {
            token$1572 = lookahead$969;
            id$1573 = parseVariableIdentifier$1050();
            if (strict$957) {
                if (isRestrictedWord$984(token$1572.value)) {
                    throwErrorTolerant$1008(token$1572, Messages$952.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$984(token$1572.value)) {
                    firstRestricted$1574 = token$1572;
                    message$1575 = Messages$952.StrictFunctionName;
                } else if (isStrictModeReservedWord$983(token$1572.value)) {
                    firstRestricted$1574 = token$1572;
                    message$1575 = Messages$952.StrictReservedWord;
                }
            }
        }
        tmp$1576 = parseParams$1083(firstRestricted$1574);
        firstRestricted$1574 = tmp$1576.firstRestricted;
        if (tmp$1576.message) {
            message$1575 = tmp$1576.message;
        }
        previousStrict$1578 = strict$957;
        previousYieldAllowed$1579 = state$971.yieldAllowed;
        state$971.yieldAllowed = generator$1580;
        // here we redo some work in order to set 'expression'
        expression$1581 = !match$1012('{');
        body$1577 = parseConciseBody$1079();
        if (strict$957 && firstRestricted$1574) {
            throwError$1007(firstRestricted$1574, message$1575);
        }
        if (strict$957 && tmp$1576.stricted) {
            throwErrorTolerant$1008(tmp$1576.stricted, message$1575);
        }
        if (state$971.yieldAllowed && !state$971.yieldFound) {
            throwErrorTolerant$1008({}, Messages$952.NoYieldInGenerator);
        }
        strict$957 = previousStrict$1578;
        state$971.yieldAllowed = previousYieldAllowed$1579;
        return delegate$966.createFunctionExpression(id$1573, tmp$1576.params, tmp$1576.defaults, body$1577, tmp$1576.rest, generator$1580, expression$1581);
    }
    function parseYieldExpression$1086() {
        var delegateFlag$1582, expr$1583, previousYieldAllowed$1584;
        expectKeyword$1011('yield');
        if (!state$971.yieldAllowed) {
            throwErrorTolerant$1008({}, Messages$952.IllegalYield);
        }
        delegateFlag$1582 = false;
        if (match$1012('*')) {
            lex$1003();
            delegateFlag$1582 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1584 = state$971.yieldAllowed;
        state$971.yieldAllowed = false;
        expr$1583 = parseAssignmentExpression$1046();
        state$971.yieldAllowed = previousYieldAllowed$1584;
        state$971.yieldFound = true;
        return delegate$966.createYieldExpression(expr$1583, delegateFlag$1582);
    }
    // 14 Classes
    function parseMethodDefinition$1087(existingPropNames$1585) {
        var token$1586, key$1587, param$1588, propType$1589, isValidDuplicateProp$1590 = false;
        if (lookahead$969.value === 'static') {
            propType$1589 = ClassPropertyType$955.static;
            lex$1003();
        } else {
            propType$1589 = ClassPropertyType$955.prototype;
        }
        if (match$1012('*')) {
            lex$1003();
            return delegate$966.createMethodDefinition(propType$1589, '', parseObjectPropertyKey$1022(), parsePropertyMethodFunction$1021({ generator: true }));
        }
        token$1586 = lookahead$969;
        key$1587 = parseObjectPropertyKey$1022();
        if (token$1586.value === 'get' && !match$1012('(')) {
            key$1587 = parseObjectPropertyKey$1022();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1585[propType$1589].hasOwnProperty(key$1587.name)) {
                isValidDuplicateProp$1590 = existingPropNames$1585[propType$1589][key$1587.name].get === undefined && existingPropNames$1585[propType$1589][key$1587.name].data === undefined && existingPropNames$1585[propType$1589][key$1587.name].set !== undefined;
                if (!isValidDuplicateProp$1590) {
                    throwError$1007(key$1587, Messages$952.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1585[propType$1589][key$1587.name] = {};
            }
            existingPropNames$1585[propType$1589][key$1587.name].get = true;
            expect$1010('(');
            expect$1010(')');
            return delegate$966.createMethodDefinition(propType$1589, 'get', key$1587, parsePropertyFunction$1020({ generator: false }));
        }
        if (token$1586.value === 'set' && !match$1012('(')) {
            key$1587 = parseObjectPropertyKey$1022();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1585[propType$1589].hasOwnProperty(key$1587.name)) {
                isValidDuplicateProp$1590 = existingPropNames$1585[propType$1589][key$1587.name].set === undefined && existingPropNames$1585[propType$1589][key$1587.name].data === undefined && existingPropNames$1585[propType$1589][key$1587.name].get !== undefined;
                if (!isValidDuplicateProp$1590) {
                    throwError$1007(key$1587, Messages$952.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1585[propType$1589][key$1587.name] = {};
            }
            existingPropNames$1585[propType$1589][key$1587.name].set = true;
            expect$1010('(');
            token$1586 = lookahead$969;
            param$1588 = [parseVariableIdentifier$1050()];
            expect$1010(')');
            return delegate$966.createMethodDefinition(propType$1589, 'set', key$1587, parsePropertyFunction$1020({
                params: param$1588,
                generator: false,
                name: token$1586
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1585[propType$1589].hasOwnProperty(key$1587.name)) {
            throwError$1007(key$1587, Messages$952.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1585[propType$1589][key$1587.name] = {};
        }
        existingPropNames$1585[propType$1589][key$1587.name].data = true;
        return delegate$966.createMethodDefinition(propType$1589, '', key$1587, parsePropertyMethodFunction$1021({ generator: false }));
    }
    function parseClassElement$1088(existingProps$1591) {
        if (match$1012(';')) {
            lex$1003();
            return;
        }
        return parseMethodDefinition$1087(existingProps$1591);
    }
    function parseClassBody$1089() {
        var classElement$1592, classElements$1593 = [], existingProps$1594 = {};
        existingProps$1594[ClassPropertyType$955.static] = {};
        existingProps$1594[ClassPropertyType$955.prototype] = {};
        expect$1010('{');
        while (streamIndex$968 < length$965) {
            if (match$1012('}')) {
                break;
            }
            classElement$1592 = parseClassElement$1088(existingProps$1594);
            if (typeof classElement$1592 !== 'undefined') {
                classElements$1593.push(classElement$1592);
            }
        }
        expect$1010('}');
        return delegate$966.createClassBody(classElements$1593);
    }
    function parseClassExpression$1090() {
        var id$1595, previousYieldAllowed$1596, superClass$1597 = null;
        expectKeyword$1011('class');
        if (!matchKeyword$1013('extends') && !match$1012('{')) {
            id$1595 = parseVariableIdentifier$1050();
        }
        if (matchKeyword$1013('extends')) {
            expectKeyword$1011('extends');
            previousYieldAllowed$1596 = state$971.yieldAllowed;
            state$971.yieldAllowed = false;
            superClass$1597 = parseAssignmentExpression$1046();
            state$971.yieldAllowed = previousYieldAllowed$1596;
        }
        return delegate$966.createClassExpression(id$1595, superClass$1597, parseClassBody$1089());
    }
    function parseClassDeclaration$1091() {
        var id$1598, previousYieldAllowed$1599, superClass$1600 = null;
        expectKeyword$1011('class');
        id$1598 = parseVariableIdentifier$1050();
        if (matchKeyword$1013('extends')) {
            expectKeyword$1011('extends');
            previousYieldAllowed$1599 = state$971.yieldAllowed;
            state$971.yieldAllowed = false;
            superClass$1600 = parseAssignmentExpression$1046();
            state$971.yieldAllowed = previousYieldAllowed$1599;
        }
        return delegate$966.createClassDeclaration(id$1598, superClass$1600, parseClassBody$1089());
    }
    // 15 Program
    function matchModuleDeclaration$1092() {
        var id$1601;
        if (matchContextualKeyword$1014('module')) {
            id$1601 = lookahead2$1005();
            return id$1601.type === Token$947.StringLiteral || id$1601.type === Token$947.Identifier;
        }
        return false;
    }
    function parseSourceElement$1093() {
        if (lookahead$969.type === Token$947.Keyword) {
            switch (lookahead$969.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$1054(lookahead$969.value);
            case 'function':
                return parseFunctionDeclaration$1084();
            case 'export':
                return parseExportDeclaration$1058();
            case 'import':
                return parseImportDeclaration$1059();
            default:
                return parseStatement$1078();
            }
        }
        if (matchModuleDeclaration$1092()) {
            throwError$1007({}, Messages$952.NestedModule);
        }
        if (lookahead$969.type !== Token$947.EOF) {
            return parseStatement$1078();
        }
    }
    function parseProgramElement$1094() {
        if (lookahead$969.type === Token$947.Keyword) {
            switch (lookahead$969.value) {
            case 'export':
                return parseExportDeclaration$1058();
            case 'import':
                return parseImportDeclaration$1059();
            }
        }
        if (matchModuleDeclaration$1092()) {
            return parseModuleDeclaration$1055();
        }
        return parseSourceElement$1093();
    }
    function parseProgramElements$1095() {
        var sourceElement$1602, sourceElements$1603 = [], token$1604, directive$1605, firstRestricted$1606;
        while (streamIndex$968 < length$965) {
            token$1604 = lookahead$969;
            if (token$1604.type !== Token$947.StringLiteral) {
                break;
            }
            sourceElement$1602 = parseProgramElement$1094();
            sourceElements$1603.push(sourceElement$1602);
            if (sourceElement$1602.expression.type !== Syntax$950.Literal) {
                // this is not directive
                break;
            }
            directive$1605 = token$1604.value;
            if (directive$1605 === 'use strict') {
                strict$957 = true;
                if (firstRestricted$1606) {
                    throwErrorTolerant$1008(firstRestricted$1606, Messages$952.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1606 && token$1604.octal) {
                    firstRestricted$1606 = token$1604;
                }
            }
        }
        while (streamIndex$968 < length$965) {
            sourceElement$1602 = parseProgramElement$1094();
            if (typeof sourceElement$1602 === 'undefined') {
                break;
            }
            sourceElements$1603.push(sourceElement$1602);
        }
        return sourceElements$1603;
    }
    function parseModuleElement$1096() {
        return parseSourceElement$1093();
    }
    function parseModuleElements$1097() {
        var list$1607 = [], statement$1608;
        while (streamIndex$968 < length$965) {
            if (match$1012('}')) {
                break;
            }
            statement$1608 = parseModuleElement$1096();
            if (typeof statement$1608 === 'undefined') {
                break;
            }
            list$1607.push(statement$1608);
        }
        return list$1607;
    }
    function parseModuleBlock$1098() {
        var block$1609;
        expect$1010('{');
        block$1609 = parseModuleElements$1097();
        expect$1010('}');
        return delegate$966.createBlockStatement(block$1609);
    }
    function parseProgram$1099() {
        var body$1610;
        strict$957 = false;
        peek$1004();
        body$1610 = parseProgramElements$1095();
        return delegate$966.createProgram(body$1610);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1100(type$1611, value$1612, start$1613, end$1614, loc$1615) {
        assert$973(typeof start$1613 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$972.comments.length > 0) {
            if (extra$972.comments[extra$972.comments.length - 1].range[1] > start$1613) {
                return;
            }
        }
        extra$972.comments.push({
            type: type$1611,
            value: value$1612,
            range: [
                start$1613,
                end$1614
            ],
            loc: loc$1615
        });
    }
    function scanComment$1101() {
        var comment$1616, ch$1617, loc$1618, start$1619, blockComment$1620, lineComment$1621;
        comment$1616 = '';
        blockComment$1620 = false;
        lineComment$1621 = false;
        while (index$958 < length$965) {
            ch$1617 = source$956[index$958];
            if (lineComment$1621) {
                ch$1617 = source$956[index$958++];
                if (isLineTerminator$979(ch$1617.charCodeAt(0))) {
                    loc$1618.end = {
                        line: lineNumber$959,
                        column: index$958 - lineStart$960 - 1
                    };
                    lineComment$1621 = false;
                    addComment$1100('Line', comment$1616, start$1619, index$958 - 1, loc$1618);
                    if (ch$1617 === '\r' && source$956[index$958] === '\n') {
                        ++index$958;
                    }
                    ++lineNumber$959;
                    lineStart$960 = index$958;
                    comment$1616 = '';
                } else if (index$958 >= length$965) {
                    lineComment$1621 = false;
                    comment$1616 += ch$1617;
                    loc$1618.end = {
                        line: lineNumber$959,
                        column: length$965 - lineStart$960
                    };
                    addComment$1100('Line', comment$1616, start$1619, length$965, loc$1618);
                } else {
                    comment$1616 += ch$1617;
                }
            } else if (blockComment$1620) {
                if (isLineTerminator$979(ch$1617.charCodeAt(0))) {
                    if (ch$1617 === '\r' && source$956[index$958 + 1] === '\n') {
                        ++index$958;
                        comment$1616 += '\r\n';
                    } else {
                        comment$1616 += ch$1617;
                    }
                    ++lineNumber$959;
                    ++index$958;
                    lineStart$960 = index$958;
                    if (index$958 >= length$965) {
                        throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1617 = source$956[index$958++];
                    if (index$958 >= length$965) {
                        throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1616 += ch$1617;
                    if (ch$1617 === '*') {
                        ch$1617 = source$956[index$958];
                        if (ch$1617 === '/') {
                            comment$1616 = comment$1616.substr(0, comment$1616.length - 1);
                            blockComment$1620 = false;
                            ++index$958;
                            loc$1618.end = {
                                line: lineNumber$959,
                                column: index$958 - lineStart$960
                            };
                            addComment$1100('Block', comment$1616, start$1619, index$958, loc$1618);
                            comment$1616 = '';
                        }
                    }
                }
            } else if (ch$1617 === '/') {
                ch$1617 = source$956[index$958 + 1];
                if (ch$1617 === '/') {
                    loc$1618 = {
                        start: {
                            line: lineNumber$959,
                            column: index$958 - lineStart$960
                        }
                    };
                    start$1619 = index$958;
                    index$958 += 2;
                    lineComment$1621 = true;
                    if (index$958 >= length$965) {
                        loc$1618.end = {
                            line: lineNumber$959,
                            column: index$958 - lineStart$960
                        };
                        lineComment$1621 = false;
                        addComment$1100('Line', comment$1616, start$1619, index$958, loc$1618);
                    }
                } else if (ch$1617 === '*') {
                    start$1619 = index$958;
                    index$958 += 2;
                    blockComment$1620 = true;
                    loc$1618 = {
                        start: {
                            line: lineNumber$959,
                            column: index$958 - lineStart$960 - 2
                        }
                    };
                    if (index$958 >= length$965) {
                        throwError$1007({}, Messages$952.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$978(ch$1617.charCodeAt(0))) {
                ++index$958;
            } else if (isLineTerminator$979(ch$1617.charCodeAt(0))) {
                ++index$958;
                if (ch$1617 === '\r' && source$956[index$958] === '\n') {
                    ++index$958;
                }
                ++lineNumber$959;
                lineStart$960 = index$958;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1102() {
        var i$1622, entry$1623, comment$1624, comments$1625 = [];
        for (i$1622 = 0; i$1622 < extra$972.comments.length; ++i$1622) {
            entry$1623 = extra$972.comments[i$1622];
            comment$1624 = {
                type: entry$1623.type,
                value: entry$1623.value
            };
            if (extra$972.range) {
                comment$1624.range = entry$1623.range;
            }
            if (extra$972.loc) {
                comment$1624.loc = entry$1623.loc;
            }
            comments$1625.push(comment$1624);
        }
        extra$972.comments = comments$1625;
    }
    function collectToken$1103() {
        var start$1626, loc$1627, token$1628, range$1629, value$1630;
        skipComment$986();
        start$1626 = index$958;
        loc$1627 = {
            start: {
                line: lineNumber$959,
                column: index$958 - lineStart$960
            }
        };
        token$1628 = extra$972.advance();
        loc$1627.end = {
            line: lineNumber$959,
            column: index$958 - lineStart$960
        };
        if (token$1628.type !== Token$947.EOF) {
            range$1629 = [
                token$1628.range[0],
                token$1628.range[1]
            ];
            value$1630 = source$956.slice(token$1628.range[0], token$1628.range[1]);
            extra$972.tokens.push({
                type: TokenName$948[token$1628.type],
                value: value$1630,
                range: range$1629,
                loc: loc$1627
            });
        }
        return token$1628;
    }
    function collectRegex$1104() {
        var pos$1631, loc$1632, regex$1633, token$1634;
        skipComment$986();
        pos$1631 = index$958;
        loc$1632 = {
            start: {
                line: lineNumber$959,
                column: index$958 - lineStart$960
            }
        };
        regex$1633 = extra$972.scanRegExp();
        loc$1632.end = {
            line: lineNumber$959,
            column: index$958 - lineStart$960
        };
        if (!extra$972.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$972.tokens.length > 0) {
                token$1634 = extra$972.tokens[extra$972.tokens.length - 1];
                if (token$1634.range[0] === pos$1631 && token$1634.type === 'Punctuator') {
                    if (token$1634.value === '/' || token$1634.value === '/=') {
                        extra$972.tokens.pop();
                    }
                }
            }
            extra$972.tokens.push({
                type: 'RegularExpression',
                value: regex$1633.literal,
                range: [
                    pos$1631,
                    index$958
                ],
                loc: loc$1632
            });
        }
        return regex$1633;
    }
    function filterTokenLocation$1105() {
        var i$1635, entry$1636, token$1637, tokens$1638 = [];
        for (i$1635 = 0; i$1635 < extra$972.tokens.length; ++i$1635) {
            entry$1636 = extra$972.tokens[i$1635];
            token$1637 = {
                type: entry$1636.type,
                value: entry$1636.value
            };
            if (extra$972.range) {
                token$1637.range = entry$1636.range;
            }
            if (extra$972.loc) {
                token$1637.loc = entry$1636.loc;
            }
            tokens$1638.push(token$1637);
        }
        extra$972.tokens = tokens$1638;
    }
    function LocationMarker$1106() {
        var sm_index$1639 = lookahead$969 ? lookahead$969.sm_range[0] : 0;
        var sm_lineStart$1640 = lookahead$969 ? lookahead$969.sm_lineStart : 0;
        var sm_lineNumber$1641 = lookahead$969 ? lookahead$969.sm_lineNumber : 1;
        this.range = [
            sm_index$1639,
            sm_index$1639
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1641,
                column: sm_index$1639 - sm_lineStart$1640
            },
            end: {
                line: sm_lineNumber$1641,
                column: sm_index$1639 - sm_lineStart$1640
            }
        };
    }
    LocationMarker$1106.prototype = {
        constructor: LocationMarker$1106,
        end: function () {
            this.range[1] = sm_index$964;
            this.loc.end.line = sm_lineNumber$961;
            this.loc.end.column = sm_index$964 - sm_lineStart$962;
        },
        applyGroup: function (node$1642) {
            if (extra$972.range) {
                node$1642.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$972.loc) {
                node$1642.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1642 = delegate$966.postProcess(node$1642);
            }
        },
        apply: function (node$1643) {
            var nodeType$1644 = typeof node$1643;
            assert$973(nodeType$1644 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1644);
            if (extra$972.range) {
                node$1643.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$972.loc) {
                node$1643.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1643 = delegate$966.postProcess(node$1643);
            }
        }
    };
    function createLocationMarker$1107() {
        return new LocationMarker$1106();
    }
    function trackGroupExpression$1108() {
        var marker$1645, expr$1646;
        marker$1645 = createLocationMarker$1107();
        expect$1010('(');
        ++state$971.parenthesizedCount;
        expr$1646 = parseExpression$1047();
        expect$1010(')');
        marker$1645.end();
        marker$1645.applyGroup(expr$1646);
        return expr$1646;
    }
    function trackLeftHandSideExpression$1109() {
        var marker$1647, expr$1648;
        // skipComment();
        marker$1647 = createLocationMarker$1107();
        expr$1648 = matchKeyword$1013('new') ? parseNewExpression$1034() : parsePrimaryExpression$1028();
        while (match$1012('.') || match$1012('[') || lookahead$969.type === Token$947.Template) {
            if (match$1012('[')) {
                expr$1648 = delegate$966.createMemberExpression('[', expr$1648, parseComputedMember$1033());
                marker$1647.end();
                marker$1647.apply(expr$1648);
            } else if (match$1012('.')) {
                expr$1648 = delegate$966.createMemberExpression('.', expr$1648, parseNonComputedMember$1032());
                marker$1647.end();
                marker$1647.apply(expr$1648);
            } else {
                expr$1648 = delegate$966.createTaggedTemplateExpression(expr$1648, parseTemplateLiteral$1026());
                marker$1647.end();
                marker$1647.apply(expr$1648);
            }
        }
        return expr$1648;
    }
    function trackLeftHandSideExpressionAllowCall$1110() {
        var marker$1649, expr$1650, args$1651;
        // skipComment();
        marker$1649 = createLocationMarker$1107();
        expr$1650 = matchKeyword$1013('new') ? parseNewExpression$1034() : parsePrimaryExpression$1028();
        while (match$1012('.') || match$1012('[') || match$1012('(') || lookahead$969.type === Token$947.Template) {
            if (match$1012('(')) {
                args$1651 = parseArguments$1029();
                expr$1650 = delegate$966.createCallExpression(expr$1650, args$1651);
                marker$1649.end();
                marker$1649.apply(expr$1650);
            } else if (match$1012('[')) {
                expr$1650 = delegate$966.createMemberExpression('[', expr$1650, parseComputedMember$1033());
                marker$1649.end();
                marker$1649.apply(expr$1650);
            } else if (match$1012('.')) {
                expr$1650 = delegate$966.createMemberExpression('.', expr$1650, parseNonComputedMember$1032());
                marker$1649.end();
                marker$1649.apply(expr$1650);
            } else {
                expr$1650 = delegate$966.createTaggedTemplateExpression(expr$1650, parseTemplateLiteral$1026());
                marker$1649.end();
                marker$1649.apply(expr$1650);
            }
        }
        return expr$1650;
    }
    function filterGroup$1111(node$1652) {
        var n$1653, i$1654, entry$1655;
        n$1653 = Object.prototype.toString.apply(node$1652) === '[object Array]' ? [] : {};
        for (i$1654 in node$1652) {
            if (node$1652.hasOwnProperty(i$1654) && i$1654 !== 'groupRange' && i$1654 !== 'groupLoc') {
                entry$1655 = node$1652[i$1654];
                if (entry$1655 === null || typeof entry$1655 !== 'object' || entry$1655 instanceof RegExp) {
                    n$1653[i$1654] = entry$1655;
                } else {
                    n$1653[i$1654] = filterGroup$1111(entry$1655);
                }
            }
        }
        return n$1653;
    }
    function wrapTrackingFunction$1112(range$1656, loc$1657) {
        return function (parseFunction$1658) {
            function isBinary$1659(node$1661) {
                return node$1661.type === Syntax$950.LogicalExpression || node$1661.type === Syntax$950.BinaryExpression;
            }
            function visit$1660(node$1662) {
                var start$1663, end$1664;
                if (isBinary$1659(node$1662.left)) {
                    visit$1660(node$1662.left);
                }
                if (isBinary$1659(node$1662.right)) {
                    visit$1660(node$1662.right);
                }
                if (range$1656) {
                    if (node$1662.left.groupRange || node$1662.right.groupRange) {
                        start$1663 = node$1662.left.groupRange ? node$1662.left.groupRange[0] : node$1662.left.range[0];
                        end$1664 = node$1662.right.groupRange ? node$1662.right.groupRange[1] : node$1662.right.range[1];
                        node$1662.range = [
                            start$1663,
                            end$1664
                        ];
                    } else if (typeof node$1662.range === 'undefined') {
                        start$1663 = node$1662.left.range[0];
                        end$1664 = node$1662.right.range[1];
                        node$1662.range = [
                            start$1663,
                            end$1664
                        ];
                    }
                }
                if (loc$1657) {
                    if (node$1662.left.groupLoc || node$1662.right.groupLoc) {
                        start$1663 = node$1662.left.groupLoc ? node$1662.left.groupLoc.start : node$1662.left.loc.start;
                        end$1664 = node$1662.right.groupLoc ? node$1662.right.groupLoc.end : node$1662.right.loc.end;
                        node$1662.loc = {
                            start: start$1663,
                            end: end$1664
                        };
                        node$1662 = delegate$966.postProcess(node$1662);
                    } else if (typeof node$1662.loc === 'undefined') {
                        node$1662.loc = {
                            start: node$1662.left.loc.start,
                            end: node$1662.right.loc.end
                        };
                        node$1662 = delegate$966.postProcess(node$1662);
                    }
                }
            }
            return function () {
                var marker$1665, node$1666, curr$1667 = lookahead$969;
                marker$1665 = createLocationMarker$1107();
                node$1666 = parseFunction$1658.apply(null, arguments);
                marker$1665.end();
                if (node$1666.type !== Syntax$950.Program) {
                    if (curr$1667.leadingComments) {
                        node$1666.leadingComments = curr$1667.leadingComments;
                    }
                    if (curr$1667.trailingComments) {
                        node$1666.trailingComments = curr$1667.trailingComments;
                    }
                }
                if (range$1656 && typeof node$1666.range === 'undefined') {
                    marker$1665.apply(node$1666);
                }
                if (loc$1657 && typeof node$1666.loc === 'undefined') {
                    marker$1665.apply(node$1666);
                }
                if (isBinary$1659(node$1666)) {
                    visit$1660(node$1666);
                }
                return node$1666;
            };
        };
    }
    function patch$1113() {
        var wrapTracking$1668;
        if (extra$972.comments) {
            extra$972.skipComment = skipComment$986;
            skipComment$986 = scanComment$1101;
        }
        if (extra$972.range || extra$972.loc) {
            extra$972.parseGroupExpression = parseGroupExpression$1027;
            extra$972.parseLeftHandSideExpression = parseLeftHandSideExpression$1036;
            extra$972.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$1035;
            parseGroupExpression$1027 = trackGroupExpression$1108;
            parseLeftHandSideExpression$1036 = trackLeftHandSideExpression$1109;
            parseLeftHandSideExpressionAllowCall$1035 = trackLeftHandSideExpressionAllowCall$1110;
            wrapTracking$1668 = wrapTrackingFunction$1112(extra$972.range, extra$972.loc);
            extra$972.parseArrayInitialiser = parseArrayInitialiser$1019;
            extra$972.parseAssignmentExpression = parseAssignmentExpression$1046;
            extra$972.parseBinaryExpression = parseBinaryExpression$1040;
            extra$972.parseBlock = parseBlock$1049;
            extra$972.parseFunctionSourceElements = parseFunctionSourceElements$1080;
            extra$972.parseCatchClause = parseCatchClause$1075;
            extra$972.parseComputedMember = parseComputedMember$1033;
            extra$972.parseConditionalExpression = parseConditionalExpression$1041;
            extra$972.parseConstLetDeclaration = parseConstLetDeclaration$1054;
            extra$972.parseExportBatchSpecifier = parseExportBatchSpecifier$1056;
            extra$972.parseExportDeclaration = parseExportDeclaration$1058;
            extra$972.parseExportSpecifier = parseExportSpecifier$1057;
            extra$972.parseExpression = parseExpression$1047;
            extra$972.parseForVariableDeclaration = parseForVariableDeclaration$1066;
            extra$972.parseFunctionDeclaration = parseFunctionDeclaration$1084;
            extra$972.parseFunctionExpression = parseFunctionExpression$1085;
            extra$972.parseParams = parseParams$1083;
            extra$972.parseImportDeclaration = parseImportDeclaration$1059;
            extra$972.parseImportSpecifier = parseImportSpecifier$1060;
            extra$972.parseModuleDeclaration = parseModuleDeclaration$1055;
            extra$972.parseModuleBlock = parseModuleBlock$1098;
            extra$972.parseNewExpression = parseNewExpression$1034;
            extra$972.parseNonComputedProperty = parseNonComputedProperty$1031;
            extra$972.parseObjectInitialiser = parseObjectInitialiser$1024;
            extra$972.parseObjectProperty = parseObjectProperty$1023;
            extra$972.parseObjectPropertyKey = parseObjectPropertyKey$1022;
            extra$972.parsePostfixExpression = parsePostfixExpression$1037;
            extra$972.parsePrimaryExpression = parsePrimaryExpression$1028;
            extra$972.parseProgram = parseProgram$1099;
            extra$972.parsePropertyFunction = parsePropertyFunction$1020;
            extra$972.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$1030;
            extra$972.parseTemplateElement = parseTemplateElement$1025;
            extra$972.parseTemplateLiteral = parseTemplateLiteral$1026;
            extra$972.parseStatement = parseStatement$1078;
            extra$972.parseSwitchCase = parseSwitchCase$1072;
            extra$972.parseUnaryExpression = parseUnaryExpression$1038;
            extra$972.parseVariableDeclaration = parseVariableDeclaration$1051;
            extra$972.parseVariableIdentifier = parseVariableIdentifier$1050;
            extra$972.parseMethodDefinition = parseMethodDefinition$1087;
            extra$972.parseClassDeclaration = parseClassDeclaration$1091;
            extra$972.parseClassExpression = parseClassExpression$1090;
            extra$972.parseClassBody = parseClassBody$1089;
            parseArrayInitialiser$1019 = wrapTracking$1668(extra$972.parseArrayInitialiser);
            parseAssignmentExpression$1046 = wrapTracking$1668(extra$972.parseAssignmentExpression);
            parseBinaryExpression$1040 = wrapTracking$1668(extra$972.parseBinaryExpression);
            parseBlock$1049 = wrapTracking$1668(extra$972.parseBlock);
            parseFunctionSourceElements$1080 = wrapTracking$1668(extra$972.parseFunctionSourceElements);
            parseCatchClause$1075 = wrapTracking$1668(extra$972.parseCatchClause);
            parseComputedMember$1033 = wrapTracking$1668(extra$972.parseComputedMember);
            parseConditionalExpression$1041 = wrapTracking$1668(extra$972.parseConditionalExpression);
            parseConstLetDeclaration$1054 = wrapTracking$1668(extra$972.parseConstLetDeclaration);
            parseExportBatchSpecifier$1056 = wrapTracking$1668(parseExportBatchSpecifier$1056);
            parseExportDeclaration$1058 = wrapTracking$1668(parseExportDeclaration$1058);
            parseExportSpecifier$1057 = wrapTracking$1668(parseExportSpecifier$1057);
            parseExpression$1047 = wrapTracking$1668(extra$972.parseExpression);
            parseForVariableDeclaration$1066 = wrapTracking$1668(extra$972.parseForVariableDeclaration);
            parseFunctionDeclaration$1084 = wrapTracking$1668(extra$972.parseFunctionDeclaration);
            parseFunctionExpression$1085 = wrapTracking$1668(extra$972.parseFunctionExpression);
            parseParams$1083 = wrapTracking$1668(extra$972.parseParams);
            parseImportDeclaration$1059 = wrapTracking$1668(extra$972.parseImportDeclaration);
            parseImportSpecifier$1060 = wrapTracking$1668(extra$972.parseImportSpecifier);
            parseModuleDeclaration$1055 = wrapTracking$1668(extra$972.parseModuleDeclaration);
            parseModuleBlock$1098 = wrapTracking$1668(extra$972.parseModuleBlock);
            parseLeftHandSideExpression$1036 = wrapTracking$1668(parseLeftHandSideExpression$1036);
            parseNewExpression$1034 = wrapTracking$1668(extra$972.parseNewExpression);
            parseNonComputedProperty$1031 = wrapTracking$1668(extra$972.parseNonComputedProperty);
            parseObjectInitialiser$1024 = wrapTracking$1668(extra$972.parseObjectInitialiser);
            parseObjectProperty$1023 = wrapTracking$1668(extra$972.parseObjectProperty);
            parseObjectPropertyKey$1022 = wrapTracking$1668(extra$972.parseObjectPropertyKey);
            parsePostfixExpression$1037 = wrapTracking$1668(extra$972.parsePostfixExpression);
            parsePrimaryExpression$1028 = wrapTracking$1668(extra$972.parsePrimaryExpression);
            parseProgram$1099 = wrapTracking$1668(extra$972.parseProgram);
            parsePropertyFunction$1020 = wrapTracking$1668(extra$972.parsePropertyFunction);
            parseTemplateElement$1025 = wrapTracking$1668(extra$972.parseTemplateElement);
            parseTemplateLiteral$1026 = wrapTracking$1668(extra$972.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$1030 = wrapTracking$1668(extra$972.parseSpreadOrAssignmentExpression);
            parseStatement$1078 = wrapTracking$1668(extra$972.parseStatement);
            parseSwitchCase$1072 = wrapTracking$1668(extra$972.parseSwitchCase);
            parseUnaryExpression$1038 = wrapTracking$1668(extra$972.parseUnaryExpression);
            parseVariableDeclaration$1051 = wrapTracking$1668(extra$972.parseVariableDeclaration);
            parseVariableIdentifier$1050 = wrapTracking$1668(extra$972.parseVariableIdentifier);
            parseMethodDefinition$1087 = wrapTracking$1668(extra$972.parseMethodDefinition);
            parseClassDeclaration$1091 = wrapTracking$1668(extra$972.parseClassDeclaration);
            parseClassExpression$1090 = wrapTracking$1668(extra$972.parseClassExpression);
            parseClassBody$1089 = wrapTracking$1668(extra$972.parseClassBody);
        }
        if (typeof extra$972.tokens !== 'undefined') {
            extra$972.advance = advance$1002;
            extra$972.scanRegExp = scanRegExp$999;
            advance$1002 = collectToken$1103;
            scanRegExp$999 = collectRegex$1104;
        }
    }
    function unpatch$1114() {
        if (typeof extra$972.skipComment === 'function') {
            skipComment$986 = extra$972.skipComment;
        }
        if (extra$972.range || extra$972.loc) {
            parseArrayInitialiser$1019 = extra$972.parseArrayInitialiser;
            parseAssignmentExpression$1046 = extra$972.parseAssignmentExpression;
            parseBinaryExpression$1040 = extra$972.parseBinaryExpression;
            parseBlock$1049 = extra$972.parseBlock;
            parseFunctionSourceElements$1080 = extra$972.parseFunctionSourceElements;
            parseCatchClause$1075 = extra$972.parseCatchClause;
            parseComputedMember$1033 = extra$972.parseComputedMember;
            parseConditionalExpression$1041 = extra$972.parseConditionalExpression;
            parseConstLetDeclaration$1054 = extra$972.parseConstLetDeclaration;
            parseExportBatchSpecifier$1056 = extra$972.parseExportBatchSpecifier;
            parseExportDeclaration$1058 = extra$972.parseExportDeclaration;
            parseExportSpecifier$1057 = extra$972.parseExportSpecifier;
            parseExpression$1047 = extra$972.parseExpression;
            parseForVariableDeclaration$1066 = extra$972.parseForVariableDeclaration;
            parseFunctionDeclaration$1084 = extra$972.parseFunctionDeclaration;
            parseFunctionExpression$1085 = extra$972.parseFunctionExpression;
            parseImportDeclaration$1059 = extra$972.parseImportDeclaration;
            parseImportSpecifier$1060 = extra$972.parseImportSpecifier;
            parseGroupExpression$1027 = extra$972.parseGroupExpression;
            parseLeftHandSideExpression$1036 = extra$972.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$1035 = extra$972.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$1055 = extra$972.parseModuleDeclaration;
            parseModuleBlock$1098 = extra$972.parseModuleBlock;
            parseNewExpression$1034 = extra$972.parseNewExpression;
            parseNonComputedProperty$1031 = extra$972.parseNonComputedProperty;
            parseObjectInitialiser$1024 = extra$972.parseObjectInitialiser;
            parseObjectProperty$1023 = extra$972.parseObjectProperty;
            parseObjectPropertyKey$1022 = extra$972.parseObjectPropertyKey;
            parsePostfixExpression$1037 = extra$972.parsePostfixExpression;
            parsePrimaryExpression$1028 = extra$972.parsePrimaryExpression;
            parseProgram$1099 = extra$972.parseProgram;
            parsePropertyFunction$1020 = extra$972.parsePropertyFunction;
            parseTemplateElement$1025 = extra$972.parseTemplateElement;
            parseTemplateLiteral$1026 = extra$972.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$1030 = extra$972.parseSpreadOrAssignmentExpression;
            parseStatement$1078 = extra$972.parseStatement;
            parseSwitchCase$1072 = extra$972.parseSwitchCase;
            parseUnaryExpression$1038 = extra$972.parseUnaryExpression;
            parseVariableDeclaration$1051 = extra$972.parseVariableDeclaration;
            parseVariableIdentifier$1050 = extra$972.parseVariableIdentifier;
            parseMethodDefinition$1087 = extra$972.parseMethodDefinition;
            parseClassDeclaration$1091 = extra$972.parseClassDeclaration;
            parseClassExpression$1090 = extra$972.parseClassExpression;
            parseClassBody$1089 = extra$972.parseClassBody;
        }
        if (typeof extra$972.scanRegExp === 'function') {
            advance$1002 = extra$972.advance;
            scanRegExp$999 = extra$972.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1115(object$1669, properties$1670) {
        var entry$1671, result$1672 = {};
        for (entry$1671 in object$1669) {
            if (object$1669.hasOwnProperty(entry$1671)) {
                result$1672[entry$1671] = object$1669[entry$1671];
            }
        }
        for (entry$1671 in properties$1670) {
            if (properties$1670.hasOwnProperty(entry$1671)) {
                result$1672[entry$1671] = properties$1670[entry$1671];
            }
        }
        return result$1672;
    }
    function tokenize$1116(code$1673, options$1674) {
        var toString$1675, token$1676, tokens$1677;
        toString$1675 = String;
        if (typeof code$1673 !== 'string' && !(code$1673 instanceof String)) {
            code$1673 = toString$1675(code$1673);
        }
        delegate$966 = SyntaxTreeDelegate$954;
        source$956 = code$1673;
        index$958 = 0;
        lineNumber$959 = source$956.length > 0 ? 1 : 0;
        lineStart$960 = 0;
        length$965 = source$956.length;
        lookahead$969 = null;
        state$971 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$972 = {};
        // Options matching.
        options$1674 = options$1674 || {};
        // Of course we collect tokens here.
        options$1674.tokens = true;
        extra$972.tokens = [];
        extra$972.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$972.openParenToken = -1;
        extra$972.openCurlyToken = -1;
        extra$972.range = typeof options$1674.range === 'boolean' && options$1674.range;
        extra$972.loc = typeof options$1674.loc === 'boolean' && options$1674.loc;
        if (typeof options$1674.comment === 'boolean' && options$1674.comment) {
            extra$972.comments = [];
        }
        if (typeof options$1674.tolerant === 'boolean' && options$1674.tolerant) {
            extra$972.errors = [];
        }
        if (length$965 > 0) {
            if (typeof source$956[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1673 instanceof String) {
                    source$956 = code$1673.valueOf();
                }
            }
        }
        patch$1113();
        try {
            peek$1004();
            if (lookahead$969.type === Token$947.EOF) {
                return extra$972.tokens;
            }
            token$1676 = lex$1003();
            while (lookahead$969.type !== Token$947.EOF) {
                try {
                    token$1676 = lex$1003();
                } catch (lexError$1678) {
                    token$1676 = lookahead$969;
                    if (extra$972.errors) {
                        extra$972.errors.push(lexError$1678);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1678;
                    }
                }
            }
            filterTokenLocation$1105();
            tokens$1677 = extra$972.tokens;
            if (typeof extra$972.comments !== 'undefined') {
                filterCommentLocation$1102();
                tokens$1677.comments = extra$972.comments;
            }
            if (typeof extra$972.errors !== 'undefined') {
                tokens$1677.errors = extra$972.errors;
            }
        } catch (e$1679) {
            throw e$1679;
        } finally {
            unpatch$1114();
            extra$972 = {};
        }
        return tokens$1677;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1117(toks$1680, start$1681, inExprDelim$1682, parentIsBlock$1683) {
        var assignOps$1684 = [
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
        var binaryOps$1685 = [
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
        var unaryOps$1686 = [
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
        function back$1687(n$1688) {
            var idx$1689 = toks$1680.length - n$1688 > 0 ? toks$1680.length - n$1688 : 0;
            return toks$1680[idx$1689];
        }
        if (inExprDelim$1682 && toks$1680.length - (start$1681 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1687(start$1681 + 2).value === ':' && parentIsBlock$1683) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$974(back$1687(start$1681 + 2).value, unaryOps$1686.concat(binaryOps$1685).concat(assignOps$1684))) {
            // ... + {...}
            return false;
        } else if (back$1687(start$1681 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1690 = typeof back$1687(start$1681 + 1).startLineNumber !== 'undefined' ? back$1687(start$1681 + 1).startLineNumber : back$1687(start$1681 + 1).lineNumber;
            if (back$1687(start$1681 + 2).lineNumber !== currLineNumber$1690) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$974(back$1687(start$1681 + 2).value, [
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
    function readToken$1118(toks$1691, inExprDelim$1692, parentIsBlock$1693) {
        var delimiters$1694 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1695 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1696 = toks$1691.length - 1;
        var comments$1697, commentsLen$1698 = extra$972.comments.length;
        function back$1699(n$1703) {
            var idx$1704 = toks$1691.length - n$1703 > 0 ? toks$1691.length - n$1703 : 0;
            return toks$1691[idx$1704];
        }
        function attachComments$1700(token$1705) {
            if (comments$1697) {
                token$1705.leadingComments = comments$1697;
            }
            return token$1705;
        }
        function _advance$1701() {
            return attachComments$1700(advance$1002());
        }
        function _scanRegExp$1702() {
            return attachComments$1700(scanRegExp$999());
        }
        skipComment$986();
        if (extra$972.comments.length > commentsLen$1698) {
            comments$1697 = extra$972.comments.slice(commentsLen$1698);
        }
        if (isIn$974(source$956[index$958], delimiters$1694)) {
            return attachComments$1700(readDelim$1119(toks$1691, inExprDelim$1692, parentIsBlock$1693));
        }
        if (source$956[index$958] === '/') {
            var prev$1706 = back$1699(1);
            if (prev$1706) {
                if (prev$1706.value === '()') {
                    if (isIn$974(back$1699(2).value, parenIdents$1695)) {
                        // ... if (...) / ...
                        return _scanRegExp$1702();
                    }
                    // ... (...) / ...
                    return _advance$1701();
                }
                if (prev$1706.value === '{}') {
                    if (blockAllowed$1117(toks$1691, 0, inExprDelim$1692, parentIsBlock$1693)) {
                        if (back$1699(2).value === '()') {
                            // named function
                            if (back$1699(4).value === 'function') {
                                if (!blockAllowed$1117(toks$1691, 3, inExprDelim$1692, parentIsBlock$1693)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1701();
                                }
                                if (toks$1691.length - 5 <= 0 && inExprDelim$1692) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1701();
                                }
                            }
                            // unnamed function
                            if (back$1699(3).value === 'function') {
                                if (!blockAllowed$1117(toks$1691, 2, inExprDelim$1692, parentIsBlock$1693)) {
                                    // new function (...) {...} / ...
                                    return _advance$1701();
                                }
                                if (toks$1691.length - 4 <= 0 && inExprDelim$1692) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1701();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1702();
                    } else {
                        // ... + {...} / ...
                        return _advance$1701();
                    }
                }
                if (prev$1706.type === Token$947.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1702();
                }
                if (isKeyword$985(prev$1706.value)) {
                    // typeof /...
                    return _scanRegExp$1702();
                }
                return _advance$1701();
            }
            return _scanRegExp$1702();
        }
        return _advance$1701();
    }
    function readDelim$1119(toks$1707, inExprDelim$1708, parentIsBlock$1709) {
        var startDelim$1710 = advance$1002(), matchDelim$1711 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1712 = [];
        var delimiters$1713 = [
                '(',
                '{',
                '['
            ];
        assert$973(delimiters$1713.indexOf(startDelim$1710.value) !== -1, 'Need to begin at the delimiter');
        var token$1714 = startDelim$1710;
        var startLineNumber$1715 = token$1714.lineNumber;
        var startLineStart$1716 = token$1714.lineStart;
        var startRange$1717 = token$1714.range;
        var delimToken$1718 = {};
        delimToken$1718.type = Token$947.Delimiter;
        delimToken$1718.value = startDelim$1710.value + matchDelim$1711[startDelim$1710.value];
        delimToken$1718.startLineNumber = startLineNumber$1715;
        delimToken$1718.startLineStart = startLineStart$1716;
        delimToken$1718.startRange = startRange$1717;
        var delimIsBlock$1719 = false;
        if (startDelim$1710.value === '{') {
            delimIsBlock$1719 = blockAllowed$1117(toks$1707.concat(delimToken$1718), 0, inExprDelim$1708, parentIsBlock$1709);
        }
        while (index$958 <= length$965) {
            token$1714 = readToken$1118(inner$1712, startDelim$1710.value === '(' || startDelim$1710.value === '[', delimIsBlock$1719);
            if (token$1714.type === Token$947.Punctuator && token$1714.value === matchDelim$1711[startDelim$1710.value]) {
                if (token$1714.leadingComments) {
                    delimToken$1718.trailingComments = token$1714.leadingComments;
                }
                break;
            } else if (token$1714.type === Token$947.EOF) {
                throwError$1007({}, Messages$952.UnexpectedEOS);
            } else {
                inner$1712.push(token$1714);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$958 >= length$965 && matchDelim$1711[startDelim$1710.value] !== source$956[length$965 - 1]) {
            throwError$1007({}, Messages$952.UnexpectedEOS);
        }
        var endLineNumber$1720 = token$1714.lineNumber;
        var endLineStart$1721 = token$1714.lineStart;
        var endRange$1722 = token$1714.range;
        delimToken$1718.inner = inner$1712;
        delimToken$1718.endLineNumber = endLineNumber$1720;
        delimToken$1718.endLineStart = endLineStart$1721;
        delimToken$1718.endRange = endRange$1722;
        return delimToken$1718;
    }
    // (Str) -> [...CSyntax]
    function read$1120(code$1723) {
        var token$1724, tokenTree$1725 = [];
        extra$972 = {};
        extra$972.comments = [];
        patch$1113();
        source$956 = code$1723;
        index$958 = 0;
        lineNumber$959 = source$956.length > 0 ? 1 : 0;
        lineStart$960 = 0;
        length$965 = source$956.length;
        state$971 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$958 < length$965) {
            tokenTree$1725.push(readToken$1118(tokenTree$1725, false, false));
        }
        var last$1726 = tokenTree$1725[tokenTree$1725.length - 1];
        if (last$1726 && last$1726.type !== Token$947.EOF) {
            tokenTree$1725.push({
                type: Token$947.EOF,
                value: '',
                lineNumber: last$1726.lineNumber,
                lineStart: last$1726.lineStart,
                range: [
                    index$958,
                    index$958
                ]
            });
        }
        return expander$946.tokensToSyntax(tokenTree$1725);
    }
    function parse$1121(code$1727, options$1728) {
        var program$1729, toString$1730;
        extra$972 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1727)) {
            tokenStream$967 = code$1727;
            length$965 = tokenStream$967.length;
            lineNumber$959 = tokenStream$967.length > 0 ? 1 : 0;
            source$956 = undefined;
        } else {
            toString$1730 = String;
            if (typeof code$1727 !== 'string' && !(code$1727 instanceof String)) {
                code$1727 = toString$1730(code$1727);
            }
            source$956 = code$1727;
            length$965 = source$956.length;
            lineNumber$959 = source$956.length > 0 ? 1 : 0;
        }
        delegate$966 = SyntaxTreeDelegate$954;
        streamIndex$968 = -1;
        index$958 = 0;
        lineStart$960 = 0;
        sm_lineStart$962 = 0;
        sm_lineNumber$961 = lineNumber$959;
        sm_index$964 = 0;
        sm_range$963 = [
            0,
            0
        ];
        lookahead$969 = null;
        state$971 = {
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
        if (typeof options$1728 !== 'undefined') {
            extra$972.range = typeof options$1728.range === 'boolean' && options$1728.range;
            extra$972.loc = typeof options$1728.loc === 'boolean' && options$1728.loc;
            if (extra$972.loc && options$1728.source !== null && options$1728.source !== undefined) {
                delegate$966 = extend$1115(delegate$966, {
                    'postProcess': function (node$1731) {
                        node$1731.loc.source = toString$1730(options$1728.source);
                        return node$1731;
                    }
                });
            }
            if (typeof options$1728.tokens === 'boolean' && options$1728.tokens) {
                extra$972.tokens = [];
            }
            if (typeof options$1728.comment === 'boolean' && options$1728.comment) {
                extra$972.comments = [];
            }
            if (typeof options$1728.tolerant === 'boolean' && options$1728.tolerant) {
                extra$972.errors = [];
            }
        }
        if (length$965 > 0) {
            if (source$956 && typeof source$956[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1727 instanceof String) {
                    source$956 = code$1727.valueOf();
                }
            }
        }
        extra$972 = { loc: true };
        patch$1113();
        try {
            program$1729 = parseProgram$1099();
            if (typeof extra$972.comments !== 'undefined') {
                filterCommentLocation$1102();
                program$1729.comments = extra$972.comments;
            }
            if (typeof extra$972.tokens !== 'undefined') {
                filterTokenLocation$1105();
                program$1729.tokens = extra$972.tokens;
            }
            if (typeof extra$972.errors !== 'undefined') {
                program$1729.errors = extra$972.errors;
            }
            if (extra$972.range || extra$972.loc) {
                program$1729.body = filterGroup$1111(program$1729.body);
            }
        } catch (e$1732) {
            throw e$1732;
        } finally {
            unpatch$1114();
            extra$972 = {};
        }
        return program$1729;
    }
    exports$945.tokenize = tokenize$1116;
    exports$945.read = read$1120;
    exports$945.Token = Token$947;
    exports$945.parse = parse$1121;
    // Deep copy.
    exports$945.Syntax = function () {
        var name$1733, types$1734 = {};
        if (typeof Object.create === 'function') {
            types$1734 = Object.create(null);
        }
        for (name$1733 in Syntax$950) {
            if (Syntax$950.hasOwnProperty(name$1733)) {
                types$1734[name$1733] = Syntax$950[name$1733];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1734);
        }
        return types$1734;
    }();
}));
//# sourceMappingURL=parser.js.map