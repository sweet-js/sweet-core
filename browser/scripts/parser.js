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
/*jslint bitwise:true plusplus:true */
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
(function (root$941, factory$942) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$942);
    } else if (typeof exports !== 'undefined') {
        factory$942(exports, require('./expander'));
    } else {
        factory$942(root$941.esprima = {});
    }
}(this, function (exports$943, expander$944) {
    'use strict';
    var Token$945, TokenName$946, FnExprTokens$947, Syntax$948, PropertyKind$949, Messages$950, Regex$951, SyntaxTreeDelegate$952, ClassPropertyType$953, source$954, strict$955, index$956, lineNumber$957, lineStart$958, sm_lineNumber$959, sm_lineStart$960, sm_range$961, sm_index$962, length$963, delegate$964, tokenStream$965, streamIndex$966, lookahead$967, lookaheadIndex$968, state$969, extra$970;
    Token$945 = {
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
    TokenName$946 = {};
    TokenName$946[Token$945.BooleanLiteral] = 'Boolean';
    TokenName$946[Token$945.EOF] = '<end>';
    TokenName$946[Token$945.Identifier] = 'Identifier';
    TokenName$946[Token$945.Keyword] = 'Keyword';
    TokenName$946[Token$945.NullLiteral] = 'Null';
    TokenName$946[Token$945.NumericLiteral] = 'Numeric';
    TokenName$946[Token$945.Punctuator] = 'Punctuator';
    TokenName$946[Token$945.StringLiteral] = 'String';
    TokenName$946[Token$945.RegularExpression] = 'RegularExpression';
    TokenName$946[Token$945.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$947 = [
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
    Syntax$948 = {
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
    PropertyKind$949 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$953 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$950 = {
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
    Regex$951 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$971(condition$1120, message$1121) {
        if (!condition$1120) {
            throw new Error('ASSERT: ' + message$1121);
        }
    }
    function isIn$972(el$1122, list$1123) {
        return list$1123.indexOf(el$1122) !== -1;
    }
    function isDecimalDigit$973(ch$1124) {
        return ch$1124 >= 48 && ch$1124 <= 57;
    }    // 0..9
    function isHexDigit$974(ch$1125) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1125) >= 0;
    }
    function isOctalDigit$975(ch$1126) {
        return '01234567'.indexOf(ch$1126) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$976(ch$1127) {
        return ch$1127 === 32 || ch$1127 === 9 || ch$1127 === 11 || ch$1127 === 12 || ch$1127 === 160 || ch$1127 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1127)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$977(ch$1128) {
        return ch$1128 === 10 || ch$1128 === 13 || ch$1128 === 8232 || ch$1128 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$978(ch$1129) {
        return ch$1129 === 36 || ch$1129 === 95 || ch$1129 >= 65 && ch$1129 <= 90 || ch$1129 >= 97 && ch$1129 <= 122 || ch$1129 === 92 || ch$1129 >= 128 && Regex$951.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1129));
    }
    function isIdentifierPart$979(ch$1130) {
        return ch$1130 === 36 || ch$1130 === 95 || ch$1130 >= 65 && ch$1130 <= 90 || ch$1130 >= 97 && ch$1130 <= 122 || ch$1130 >= 48 && ch$1130 <= 57 || ch$1130 === 92 || ch$1130 >= 128 && Regex$951.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1130));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$980(id$1131) {
        switch (id$1131) {
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
    function isStrictModeReservedWord$981(id$1132) {
        switch (id$1132) {
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
    function isRestrictedWord$982(id$1133) {
        return id$1133 === 'eval' || id$1133 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$983(id$1134) {
        if (strict$955 && isStrictModeReservedWord$981(id$1134)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1134.length) {
        case 2:
            return id$1134 === 'if' || id$1134 === 'in' || id$1134 === 'do';
        case 3:
            return id$1134 === 'var' || id$1134 === 'for' || id$1134 === 'new' || id$1134 === 'try' || id$1134 === 'let';
        case 4:
            return id$1134 === 'this' || id$1134 === 'else' || id$1134 === 'case' || id$1134 === 'void' || id$1134 === 'with' || id$1134 === 'enum';
        case 5:
            return id$1134 === 'while' || id$1134 === 'break' || id$1134 === 'catch' || id$1134 === 'throw' || id$1134 === 'const' || id$1134 === 'yield' || id$1134 === 'class' || id$1134 === 'super';
        case 6:
            return id$1134 === 'return' || id$1134 === 'typeof' || id$1134 === 'delete' || id$1134 === 'switch' || id$1134 === 'export' || id$1134 === 'import';
        case 7:
            return id$1134 === 'default' || id$1134 === 'finally' || id$1134 === 'extends';
        case 8:
            return id$1134 === 'function' || id$1134 === 'continue' || id$1134 === 'debugger';
        case 10:
            return id$1134 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$984() {
        var ch$1135, blockComment$1136, lineComment$1137;
        blockComment$1136 = false;
        lineComment$1137 = false;
        while (index$956 < length$963) {
            ch$1135 = source$954.charCodeAt(index$956);
            if (lineComment$1137) {
                ++index$956;
                if (isLineTerminator$977(ch$1135)) {
                    lineComment$1137 = false;
                    if (ch$1135 === 13 && source$954.charCodeAt(index$956) === 10) {
                        ++index$956;
                    }
                    ++lineNumber$957;
                    lineStart$958 = index$956;
                }
            } else if (blockComment$1136) {
                if (isLineTerminator$977(ch$1135)) {
                    if (ch$1135 === 13 && source$954.charCodeAt(index$956 + 1) === 10) {
                        ++index$956;
                    }
                    ++lineNumber$957;
                    ++index$956;
                    lineStart$958 = index$956;
                    if (index$956 >= length$963) {
                        throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1135 = source$954.charCodeAt(index$956++);
                    if (index$956 >= length$963) {
                        throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1135 === 42) {
                        ch$1135 = source$954.charCodeAt(index$956);
                        if (ch$1135 === 47) {
                            ++index$956;
                            blockComment$1136 = false;
                        }
                    }
                }
            } else if (ch$1135 === 47) {
                ch$1135 = source$954.charCodeAt(index$956 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1135 === 47) {
                    index$956 += 2;
                    lineComment$1137 = true;
                } else if (ch$1135 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$956 += 2;
                    blockComment$1136 = true;
                    if (index$956 >= length$963) {
                        throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$976(ch$1135)) {
                ++index$956;
            } else if (isLineTerminator$977(ch$1135)) {
                ++index$956;
                if (ch$1135 === 13 && source$954.charCodeAt(index$956) === 10) {
                    ++index$956;
                }
                ++lineNumber$957;
                lineStart$958 = index$956;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$985(prefix$1138) {
        var i$1139, len$1140, ch$1141, code$1142 = 0;
        len$1140 = prefix$1138 === 'u' ? 4 : 2;
        for (i$1139 = 0; i$1139 < len$1140; ++i$1139) {
            if (index$956 < length$963 && isHexDigit$974(source$954[index$956])) {
                ch$1141 = source$954[index$956++];
                code$1142 = code$1142 * 16 + '0123456789abcdef'.indexOf(ch$1141.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1142);
    }
    function scanUnicodeCodePointEscape$986() {
        var ch$1143, code$1144, cu1$1145, cu2$1146;
        ch$1143 = source$954[index$956];
        code$1144 = 0;
        // At least, one hex digit is required.
        if (ch$1143 === '}') {
            throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
        }
        while (index$956 < length$963) {
            ch$1143 = source$954[index$956++];
            if (!isHexDigit$974(ch$1143)) {
                break;
            }
            code$1144 = code$1144 * 16 + '0123456789abcdef'.indexOf(ch$1143.toLowerCase());
        }
        if (code$1144 > 1114111 || ch$1143 !== '}') {
            throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1144 <= 65535) {
            return String.fromCharCode(code$1144);
        }
        cu1$1145 = (code$1144 - 65536 >> 10) + 55296;
        cu2$1146 = (code$1144 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1145, cu2$1146);
    }
    function getEscapedIdentifier$987() {
        var ch$1147, id$1148;
        ch$1147 = source$954.charCodeAt(index$956++);
        id$1148 = String.fromCharCode(ch$1147);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1147 === 92) {
            if (source$954.charCodeAt(index$956) !== 117) {
                throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
            }
            ++index$956;
            ch$1147 = scanHexEscape$985('u');
            if (!ch$1147 || ch$1147 === '\\' || !isIdentifierStart$978(ch$1147.charCodeAt(0))) {
                throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
            }
            id$1148 = ch$1147;
        }
        while (index$956 < length$963) {
            ch$1147 = source$954.charCodeAt(index$956);
            if (!isIdentifierPart$979(ch$1147)) {
                break;
            }
            ++index$956;
            id$1148 += String.fromCharCode(ch$1147);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1147 === 92) {
                id$1148 = id$1148.substr(0, id$1148.length - 1);
                if (source$954.charCodeAt(index$956) !== 117) {
                    throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
                }
                ++index$956;
                ch$1147 = scanHexEscape$985('u');
                if (!ch$1147 || ch$1147 === '\\' || !isIdentifierPart$979(ch$1147.charCodeAt(0))) {
                    throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
                }
                id$1148 += ch$1147;
            }
        }
        return id$1148;
    }
    function getIdentifier$988() {
        var start$1149, ch$1150;
        start$1149 = index$956++;
        while (index$956 < length$963) {
            ch$1150 = source$954.charCodeAt(index$956);
            if (ch$1150 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$956 = start$1149;
                return getEscapedIdentifier$987();
            }
            if (isIdentifierPart$979(ch$1150)) {
                ++index$956;
            } else {
                break;
            }
        }
        return source$954.slice(start$1149, index$956);
    }
    function scanIdentifier$989() {
        var start$1151, id$1152, type$1153;
        start$1151 = index$956;
        // Backslash (char #92) starts an escaped character.
        id$1152 = source$954.charCodeAt(index$956) === 92 ? getEscapedIdentifier$987() : getIdentifier$988();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1152.length === 1) {
            type$1153 = Token$945.Identifier;
        } else if (isKeyword$983(id$1152)) {
            type$1153 = Token$945.Keyword;
        } else if (id$1152 === 'null') {
            type$1153 = Token$945.NullLiteral;
        } else if (id$1152 === 'true' || id$1152 === 'false') {
            type$1153 = Token$945.BooleanLiteral;
        } else {
            type$1153 = Token$945.Identifier;
        }
        return {
            type: type$1153,
            value: id$1152,
            lineNumber: lineNumber$957,
            lineStart: lineStart$958,
            range: [
                start$1151,
                index$956
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$990() {
        var start$1154 = index$956, code$1155 = source$954.charCodeAt(index$956), code2$1156, ch1$1157 = source$954[index$956], ch2$1158, ch3$1159, ch4$1160;
        switch (code$1155) {
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
            ++index$956;
            if (extra$970.tokenize) {
                if (code$1155 === 40) {
                    extra$970.openParenToken = extra$970.tokens.length;
                } else if (code$1155 === 123) {
                    extra$970.openCurlyToken = extra$970.tokens.length;
                }
            }
            return {
                type: Token$945.Punctuator,
                value: String.fromCharCode(code$1155),
                lineNumber: lineNumber$957,
                lineStart: lineStart$958,
                range: [
                    start$1154,
                    index$956
                ]
            };
        default:
            code2$1156 = source$954.charCodeAt(index$956 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1156 === 61) {
                switch (code$1155) {
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
                    index$956 += 2;
                    return {
                        type: Token$945.Punctuator,
                        value: String.fromCharCode(code$1155) + String.fromCharCode(code2$1156),
                        lineNumber: lineNumber$957,
                        lineStart: lineStart$958,
                        range: [
                            start$1154,
                            index$956
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$956 += 2;
                    // !== and ===
                    if (source$954.charCodeAt(index$956) === 61) {
                        ++index$956;
                    }
                    return {
                        type: Token$945.Punctuator,
                        value: source$954.slice(start$1154, index$956),
                        lineNumber: lineNumber$957,
                        lineStart: lineStart$958,
                        range: [
                            start$1154,
                            index$956
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1158 = source$954[index$956 + 1];
        ch3$1159 = source$954[index$956 + 2];
        ch4$1160 = source$954[index$956 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1157 === '>' && ch2$1158 === '>' && ch3$1159 === '>') {
            if (ch4$1160 === '=') {
                index$956 += 4;
                return {
                    type: Token$945.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$957,
                    lineStart: lineStart$958,
                    range: [
                        start$1154,
                        index$956
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1157 === '>' && ch2$1158 === '>' && ch3$1159 === '>') {
            index$956 += 3;
            return {
                type: Token$945.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$957,
                lineStart: lineStart$958,
                range: [
                    start$1154,
                    index$956
                ]
            };
        }
        if (ch1$1157 === '<' && ch2$1158 === '<' && ch3$1159 === '=') {
            index$956 += 3;
            return {
                type: Token$945.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$957,
                lineStart: lineStart$958,
                range: [
                    start$1154,
                    index$956
                ]
            };
        }
        if (ch1$1157 === '>' && ch2$1158 === '>' && ch3$1159 === '=') {
            index$956 += 3;
            return {
                type: Token$945.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$957,
                lineStart: lineStart$958,
                range: [
                    start$1154,
                    index$956
                ]
            };
        }
        if (ch1$1157 === '.' && ch2$1158 === '.' && ch3$1159 === '.') {
            index$956 += 3;
            return {
                type: Token$945.Punctuator,
                value: '...',
                lineNumber: lineNumber$957,
                lineStart: lineStart$958,
                range: [
                    start$1154,
                    index$956
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1157 === ch2$1158 && '+-<>&|'.indexOf(ch1$1157) >= 0) {
            index$956 += 2;
            return {
                type: Token$945.Punctuator,
                value: ch1$1157 + ch2$1158,
                lineNumber: lineNumber$957,
                lineStart: lineStart$958,
                range: [
                    start$1154,
                    index$956
                ]
            };
        }
        if (ch1$1157 === '=' && ch2$1158 === '>') {
            index$956 += 2;
            return {
                type: Token$945.Punctuator,
                value: '=>',
                lineNumber: lineNumber$957,
                lineStart: lineStart$958,
                range: [
                    start$1154,
                    index$956
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1157) >= 0) {
            ++index$956;
            return {
                type: Token$945.Punctuator,
                value: ch1$1157,
                lineNumber: lineNumber$957,
                lineStart: lineStart$958,
                range: [
                    start$1154,
                    index$956
                ]
            };
        }
        if (ch1$1157 === '.') {
            ++index$956;
            return {
                type: Token$945.Punctuator,
                value: ch1$1157,
                lineNumber: lineNumber$957,
                lineStart: lineStart$958,
                range: [
                    start$1154,
                    index$956
                ]
            };
        }
        throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$991(start$1161) {
        var number$1162 = '';
        while (index$956 < length$963) {
            if (!isHexDigit$974(source$954[index$956])) {
                break;
            }
            number$1162 += source$954[index$956++];
        }
        if (number$1162.length === 0) {
            throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$978(source$954.charCodeAt(index$956))) {
            throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$945.NumericLiteral,
            value: parseInt('0x' + number$1162, 16),
            lineNumber: lineNumber$957,
            lineStart: lineStart$958,
            range: [
                start$1161,
                index$956
            ]
        };
    }
    function scanOctalLiteral$992(prefix$1163, start$1164) {
        var number$1165, octal$1166;
        if (isOctalDigit$975(prefix$1163)) {
            octal$1166 = true;
            number$1165 = '0' + source$954[index$956++];
        } else {
            octal$1166 = false;
            ++index$956;
            number$1165 = '';
        }
        while (index$956 < length$963) {
            if (!isOctalDigit$975(source$954[index$956])) {
                break;
            }
            number$1165 += source$954[index$956++];
        }
        if (!octal$1166 && number$1165.length === 0) {
            // only 0o or 0O
            throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$978(source$954.charCodeAt(index$956)) || isDecimalDigit$973(source$954.charCodeAt(index$956))) {
            throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$945.NumericLiteral,
            value: parseInt(number$1165, 8),
            octal: octal$1166,
            lineNumber: lineNumber$957,
            lineStart: lineStart$958,
            range: [
                start$1164,
                index$956
            ]
        };
    }
    function scanNumericLiteral$993() {
        var number$1167, start$1168, ch$1169, octal$1170;
        ch$1169 = source$954[index$956];
        assert$971(isDecimalDigit$973(ch$1169.charCodeAt(0)) || ch$1169 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1168 = index$956;
        number$1167 = '';
        if (ch$1169 !== '.') {
            number$1167 = source$954[index$956++];
            ch$1169 = source$954[index$956];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1167 === '0') {
                if (ch$1169 === 'x' || ch$1169 === 'X') {
                    ++index$956;
                    return scanHexLiteral$991(start$1168);
                }
                if (ch$1169 === 'b' || ch$1169 === 'B') {
                    ++index$956;
                    number$1167 = '';
                    while (index$956 < length$963) {
                        ch$1169 = source$954[index$956];
                        if (ch$1169 !== '0' && ch$1169 !== '1') {
                            break;
                        }
                        number$1167 += source$954[index$956++];
                    }
                    if (number$1167.length === 0) {
                        // only 0b or 0B
                        throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$956 < length$963) {
                        ch$1169 = source$954.charCodeAt(index$956);
                        if (isIdentifierStart$978(ch$1169) || isDecimalDigit$973(ch$1169)) {
                            throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$945.NumericLiteral,
                        value: parseInt(number$1167, 2),
                        lineNumber: lineNumber$957,
                        lineStart: lineStart$958,
                        range: [
                            start$1168,
                            index$956
                        ]
                    };
                }
                if (ch$1169 === 'o' || ch$1169 === 'O' || isOctalDigit$975(ch$1169)) {
                    return scanOctalLiteral$992(ch$1169, start$1168);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1169 && isDecimalDigit$973(ch$1169.charCodeAt(0))) {
                    throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$973(source$954.charCodeAt(index$956))) {
                number$1167 += source$954[index$956++];
            }
            ch$1169 = source$954[index$956];
        }
        if (ch$1169 === '.') {
            number$1167 += source$954[index$956++];
            while (isDecimalDigit$973(source$954.charCodeAt(index$956))) {
                number$1167 += source$954[index$956++];
            }
            ch$1169 = source$954[index$956];
        }
        if (ch$1169 === 'e' || ch$1169 === 'E') {
            number$1167 += source$954[index$956++];
            ch$1169 = source$954[index$956];
            if (ch$1169 === '+' || ch$1169 === '-') {
                number$1167 += source$954[index$956++];
            }
            if (isDecimalDigit$973(source$954.charCodeAt(index$956))) {
                while (isDecimalDigit$973(source$954.charCodeAt(index$956))) {
                    number$1167 += source$954[index$956++];
                }
            } else {
                throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$978(source$954.charCodeAt(index$956))) {
            throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$945.NumericLiteral,
            value: parseFloat(number$1167),
            lineNumber: lineNumber$957,
            lineStart: lineStart$958,
            range: [
                start$1168,
                index$956
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$994() {
        var str$1171 = '', quote$1172, start$1173, ch$1174, code$1175, unescaped$1176, restore$1177, octal$1178 = false;
        quote$1172 = source$954[index$956];
        assert$971(quote$1172 === '\'' || quote$1172 === '"', 'String literal must starts with a quote');
        start$1173 = index$956;
        ++index$956;
        while (index$956 < length$963) {
            ch$1174 = source$954[index$956++];
            if (ch$1174 === quote$1172) {
                quote$1172 = '';
                break;
            } else if (ch$1174 === '\\') {
                ch$1174 = source$954[index$956++];
                if (!ch$1174 || !isLineTerminator$977(ch$1174.charCodeAt(0))) {
                    switch (ch$1174) {
                    case 'n':
                        str$1171 += '\n';
                        break;
                    case 'r':
                        str$1171 += '\r';
                        break;
                    case 't':
                        str$1171 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$954[index$956] === '{') {
                            ++index$956;
                            str$1171 += scanUnicodeCodePointEscape$986();
                        } else {
                            restore$1177 = index$956;
                            unescaped$1176 = scanHexEscape$985(ch$1174);
                            if (unescaped$1176) {
                                str$1171 += unescaped$1176;
                            } else {
                                index$956 = restore$1177;
                                str$1171 += ch$1174;
                            }
                        }
                        break;
                    case 'b':
                        str$1171 += '\b';
                        break;
                    case 'f':
                        str$1171 += '\f';
                        break;
                    case 'v':
                        str$1171 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$975(ch$1174)) {
                            code$1175 = '01234567'.indexOf(ch$1174);
                            // \0 is not octal escape sequence
                            if (code$1175 !== 0) {
                                octal$1178 = true;
                            }
                            if (index$956 < length$963 && isOctalDigit$975(source$954[index$956])) {
                                octal$1178 = true;
                                code$1175 = code$1175 * 8 + '01234567'.indexOf(source$954[index$956++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1174) >= 0 && index$956 < length$963 && isOctalDigit$975(source$954[index$956])) {
                                    code$1175 = code$1175 * 8 + '01234567'.indexOf(source$954[index$956++]);
                                }
                            }
                            str$1171 += String.fromCharCode(code$1175);
                        } else {
                            str$1171 += ch$1174;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$957;
                    if (ch$1174 === '\r' && source$954[index$956] === '\n') {
                        ++index$956;
                    }
                }
            } else if (isLineTerminator$977(ch$1174.charCodeAt(0))) {
                break;
            } else {
                str$1171 += ch$1174;
            }
        }
        if (quote$1172 !== '') {
            throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$945.StringLiteral,
            value: str$1171,
            octal: octal$1178,
            lineNumber: lineNumber$957,
            lineStart: lineStart$958,
            range: [
                start$1173,
                index$956
            ]
        };
    }
    function scanTemplate$995() {
        var cooked$1179 = '', ch$1180, start$1181, terminated$1182, tail$1183, restore$1184, unescaped$1185, code$1186, octal$1187;
        terminated$1182 = false;
        tail$1183 = false;
        start$1181 = index$956;
        ++index$956;
        while (index$956 < length$963) {
            ch$1180 = source$954[index$956++];
            if (ch$1180 === '`') {
                tail$1183 = true;
                terminated$1182 = true;
                break;
            } else if (ch$1180 === '$') {
                if (source$954[index$956] === '{') {
                    ++index$956;
                    terminated$1182 = true;
                    break;
                }
                cooked$1179 += ch$1180;
            } else if (ch$1180 === '\\') {
                ch$1180 = source$954[index$956++];
                if (!isLineTerminator$977(ch$1180.charCodeAt(0))) {
                    switch (ch$1180) {
                    case 'n':
                        cooked$1179 += '\n';
                        break;
                    case 'r':
                        cooked$1179 += '\r';
                        break;
                    case 't':
                        cooked$1179 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$954[index$956] === '{') {
                            ++index$956;
                            cooked$1179 += scanUnicodeCodePointEscape$986();
                        } else {
                            restore$1184 = index$956;
                            unescaped$1185 = scanHexEscape$985(ch$1180);
                            if (unescaped$1185) {
                                cooked$1179 += unescaped$1185;
                            } else {
                                index$956 = restore$1184;
                                cooked$1179 += ch$1180;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1179 += '\b';
                        break;
                    case 'f':
                        cooked$1179 += '\f';
                        break;
                    case 'v':
                        cooked$1179 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$975(ch$1180)) {
                            code$1186 = '01234567'.indexOf(ch$1180);
                            // \0 is not octal escape sequence
                            if (code$1186 !== 0) {
                                octal$1187 = true;
                            }
                            if (index$956 < length$963 && isOctalDigit$975(source$954[index$956])) {
                                octal$1187 = true;
                                code$1186 = code$1186 * 8 + '01234567'.indexOf(source$954[index$956++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1180) >= 0 && index$956 < length$963 && isOctalDigit$975(source$954[index$956])) {
                                    code$1186 = code$1186 * 8 + '01234567'.indexOf(source$954[index$956++]);
                                }
                            }
                            cooked$1179 += String.fromCharCode(code$1186);
                        } else {
                            cooked$1179 += ch$1180;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$957;
                    if (ch$1180 === '\r' && source$954[index$956] === '\n') {
                        ++index$956;
                    }
                }
            } else if (isLineTerminator$977(ch$1180.charCodeAt(0))) {
                ++lineNumber$957;
                if (ch$1180 === '\r' && source$954[index$956] === '\n') {
                    ++index$956;
                }
                cooked$1179 += '\n';
            } else {
                cooked$1179 += ch$1180;
            }
        }
        if (!terminated$1182) {
            throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$945.Template,
            value: {
                cooked: cooked$1179,
                raw: source$954.slice(start$1181 + 1, index$956 - (tail$1183 ? 1 : 2))
            },
            tail: tail$1183,
            octal: octal$1187,
            lineNumber: lineNumber$957,
            lineStart: lineStart$958,
            range: [
                start$1181,
                index$956
            ]
        };
    }
    function scanTemplateElement$996(option$1188) {
        var startsWith$1189, template$1190;
        lookahead$967 = null;
        skipComment$984();
        startsWith$1189 = option$1188.head ? '`' : '}';
        if (source$954[index$956] !== startsWith$1189) {
            throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
        }
        template$1190 = scanTemplate$995();
        peek$1002();
        return template$1190;
    }
    function scanRegExp$997() {
        var str$1191, ch$1192, start$1193, pattern$1194, flags$1195, value$1196, classMarker$1197 = false, restore$1198, terminated$1199 = false;
        lookahead$967 = null;
        skipComment$984();
        start$1193 = index$956;
        ch$1192 = source$954[index$956];
        assert$971(ch$1192 === '/', 'Regular expression literal must start with a slash');
        str$1191 = source$954[index$956++];
        while (index$956 < length$963) {
            ch$1192 = source$954[index$956++];
            str$1191 += ch$1192;
            if (classMarker$1197) {
                if (ch$1192 === ']') {
                    classMarker$1197 = false;
                }
            } else {
                if (ch$1192 === '\\') {
                    ch$1192 = source$954[index$956++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$977(ch$1192.charCodeAt(0))) {
                        throwError$1005({}, Messages$950.UnterminatedRegExp);
                    }
                    str$1191 += ch$1192;
                } else if (ch$1192 === '/') {
                    terminated$1199 = true;
                    break;
                } else if (ch$1192 === '[') {
                    classMarker$1197 = true;
                } else if (isLineTerminator$977(ch$1192.charCodeAt(0))) {
                    throwError$1005({}, Messages$950.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1199) {
            throwError$1005({}, Messages$950.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1194 = str$1191.substr(1, str$1191.length - 2);
        flags$1195 = '';
        while (index$956 < length$963) {
            ch$1192 = source$954[index$956];
            if (!isIdentifierPart$979(ch$1192.charCodeAt(0))) {
                break;
            }
            ++index$956;
            if (ch$1192 === '\\' && index$956 < length$963) {
                ch$1192 = source$954[index$956];
                if (ch$1192 === 'u') {
                    ++index$956;
                    restore$1198 = index$956;
                    ch$1192 = scanHexEscape$985('u');
                    if (ch$1192) {
                        flags$1195 += ch$1192;
                        for (str$1191 += '\\u'; restore$1198 < index$956; ++restore$1198) {
                            str$1191 += source$954[restore$1198];
                        }
                    } else {
                        index$956 = restore$1198;
                        flags$1195 += 'u';
                        str$1191 += '\\u';
                    }
                } else {
                    str$1191 += '\\';
                }
            } else {
                flags$1195 += ch$1192;
                str$1191 += ch$1192;
            }
        }
        try {
            value$1196 = new RegExp(pattern$1194, flags$1195);
        } catch (e$1200) {
            throwError$1005({}, Messages$950.InvalidRegExp);
        }
        // peek();
        if (extra$970.tokenize) {
            return {
                type: Token$945.RegularExpression,
                value: value$1196,
                lineNumber: lineNumber$957,
                lineStart: lineStart$958,
                range: [
                    start$1193,
                    index$956
                ]
            };
        }
        return {
            type: Token$945.RegularExpression,
            literal: str$1191,
            value: value$1196,
            range: [
                start$1193,
                index$956
            ]
        };
    }
    function isIdentifierName$998(token$1201) {
        return token$1201.type === Token$945.Identifier || token$1201.type === Token$945.Keyword || token$1201.type === Token$945.BooleanLiteral || token$1201.type === Token$945.NullLiteral;
    }
    function advanceSlash$999() {
        var prevToken$1202, checkToken$1203;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1202 = extra$970.tokens[extra$970.tokens.length - 1];
        if (!prevToken$1202) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$997();
        }
        if (prevToken$1202.type === 'Punctuator') {
            if (prevToken$1202.value === ')') {
                checkToken$1203 = extra$970.tokens[extra$970.openParenToken - 1];
                if (checkToken$1203 && checkToken$1203.type === 'Keyword' && (checkToken$1203.value === 'if' || checkToken$1203.value === 'while' || checkToken$1203.value === 'for' || checkToken$1203.value === 'with')) {
                    return scanRegExp$997();
                }
                return scanPunctuator$990();
            }
            if (prevToken$1202.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$970.tokens[extra$970.openCurlyToken - 3] && extra$970.tokens[extra$970.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1203 = extra$970.tokens[extra$970.openCurlyToken - 4];
                    if (!checkToken$1203) {
                        return scanPunctuator$990();
                    }
                } else if (extra$970.tokens[extra$970.openCurlyToken - 4] && extra$970.tokens[extra$970.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1203 = extra$970.tokens[extra$970.openCurlyToken - 5];
                    if (!checkToken$1203) {
                        return scanRegExp$997();
                    }
                } else {
                    return scanPunctuator$990();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$947.indexOf(checkToken$1203.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$990();
                }
                // It is a declaration.
                return scanRegExp$997();
            }
            return scanRegExp$997();
        }
        if (prevToken$1202.type === 'Keyword') {
            return scanRegExp$997();
        }
        return scanPunctuator$990();
    }
    function advance$1000() {
        var ch$1204;
        skipComment$984();
        if (index$956 >= length$963) {
            return {
                type: Token$945.EOF,
                lineNumber: lineNumber$957,
                lineStart: lineStart$958,
                range: [
                    index$956,
                    index$956
                ]
            };
        }
        ch$1204 = source$954.charCodeAt(index$956);
        // Very common: ( and ) and ;
        if (ch$1204 === 40 || ch$1204 === 41 || ch$1204 === 58) {
            return scanPunctuator$990();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1204 === 39 || ch$1204 === 34) {
            return scanStringLiteral$994();
        }
        if (ch$1204 === 96) {
            return scanTemplate$995();
        }
        if (isIdentifierStart$978(ch$1204)) {
            return scanIdentifier$989();
        }
        // # and @ are allowed for sweet.js
        if (ch$1204 === 35 || ch$1204 === 64) {
            ++index$956;
            return {
                type: Token$945.Punctuator,
                value: String.fromCharCode(ch$1204),
                lineNumber: lineNumber$957,
                lineStart: lineStart$958,
                range: [
                    index$956 - 1,
                    index$956
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1204 === 46) {
            if (isDecimalDigit$973(source$954.charCodeAt(index$956 + 1))) {
                return scanNumericLiteral$993();
            }
            return scanPunctuator$990();
        }
        if (isDecimalDigit$973(ch$1204)) {
            return scanNumericLiteral$993();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$970.tokenize && ch$1204 === 47) {
            return advanceSlash$999();
        }
        return scanPunctuator$990();
    }
    function lex$1001() {
        var token$1205;
        token$1205 = lookahead$967;
        streamIndex$966 = lookaheadIndex$968;
        lineNumber$957 = token$1205.lineNumber;
        lineStart$958 = token$1205.lineStart;
        sm_lineNumber$959 = lookahead$967.sm_lineNumber;
        sm_lineStart$960 = lookahead$967.sm_lineStart;
        sm_range$961 = lookahead$967.sm_range;
        sm_index$962 = lookahead$967.sm_range[0];
        lookahead$967 = tokenStream$965[++streamIndex$966].token;
        lookaheadIndex$968 = streamIndex$966;
        index$956 = lookahead$967.range[0];
        return token$1205;
    }
    function peek$1002() {
        lookaheadIndex$968 = streamIndex$966 + 1;
        if (lookaheadIndex$968 >= length$963) {
            lookahead$967 = {
                type: Token$945.EOF,
                lineNumber: lineNumber$957,
                lineStart: lineStart$958,
                range: [
                    index$956,
                    index$956
                ]
            };
            return;
        }
        lookahead$967 = tokenStream$965[lookaheadIndex$968].token;
        index$956 = lookahead$967.range[0];
    }
    function lookahead2$1003() {
        var adv$1206, pos$1207, line$1208, start$1209, result$1210;
        if (streamIndex$966 + 1 >= length$963 || streamIndex$966 + 2 >= length$963) {
            return {
                type: Token$945.EOF,
                lineNumber: lineNumber$957,
                lineStart: lineStart$958,
                range: [
                    index$956,
                    index$956
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$967 === null) {
            lookaheadIndex$968 = streamIndex$966 + 1;
            lookahead$967 = tokenStream$965[lookaheadIndex$968].token;
            index$956 = lookahead$967.range[0];
        }
        result$1210 = tokenStream$965[lookaheadIndex$968 + 1].token;
        return result$1210;
    }
    SyntaxTreeDelegate$952 = {
        name: 'SyntaxTree',
        postProcess: function (node$1211) {
            return node$1211;
        },
        createArrayExpression: function (elements$1212) {
            return {
                type: Syntax$948.ArrayExpression,
                elements: elements$1212
            };
        },
        createAssignmentExpression: function (operator$1213, left$1214, right$1215) {
            return {
                type: Syntax$948.AssignmentExpression,
                operator: operator$1213,
                left: left$1214,
                right: right$1215
            };
        },
        createBinaryExpression: function (operator$1216, left$1217, right$1218) {
            var type$1219 = operator$1216 === '||' || operator$1216 === '&&' ? Syntax$948.LogicalExpression : Syntax$948.BinaryExpression;
            return {
                type: type$1219,
                operator: operator$1216,
                left: left$1217,
                right: right$1218
            };
        },
        createBlockStatement: function (body$1220) {
            return {
                type: Syntax$948.BlockStatement,
                body: body$1220
            };
        },
        createBreakStatement: function (label$1221) {
            return {
                type: Syntax$948.BreakStatement,
                label: label$1221
            };
        },
        createCallExpression: function (callee$1222, args$1223) {
            return {
                type: Syntax$948.CallExpression,
                callee: callee$1222,
                'arguments': args$1223
            };
        },
        createCatchClause: function (param$1224, body$1225) {
            return {
                type: Syntax$948.CatchClause,
                param: param$1224,
                body: body$1225
            };
        },
        createConditionalExpression: function (test$1226, consequent$1227, alternate$1228) {
            return {
                type: Syntax$948.ConditionalExpression,
                test: test$1226,
                consequent: consequent$1227,
                alternate: alternate$1228
            };
        },
        createContinueStatement: function (label$1229) {
            return {
                type: Syntax$948.ContinueStatement,
                label: label$1229
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$948.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1230, test$1231) {
            return {
                type: Syntax$948.DoWhileStatement,
                body: body$1230,
                test: test$1231
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$948.EmptyStatement };
        },
        createExpressionStatement: function (expression$1232) {
            return {
                type: Syntax$948.ExpressionStatement,
                expression: expression$1232
            };
        },
        createForStatement: function (init$1233, test$1234, update$1235, body$1236) {
            return {
                type: Syntax$948.ForStatement,
                init: init$1233,
                test: test$1234,
                update: update$1235,
                body: body$1236
            };
        },
        createForInStatement: function (left$1237, right$1238, body$1239) {
            return {
                type: Syntax$948.ForInStatement,
                left: left$1237,
                right: right$1238,
                body: body$1239,
                each: false
            };
        },
        createForOfStatement: function (left$1240, right$1241, body$1242) {
            return {
                type: Syntax$948.ForOfStatement,
                left: left$1240,
                right: right$1241,
                body: body$1242
            };
        },
        createFunctionDeclaration: function (id$1243, params$1244, defaults$1245, body$1246, rest$1247, generator$1248, expression$1249) {
            return {
                type: Syntax$948.FunctionDeclaration,
                id: id$1243,
                params: params$1244,
                defaults: defaults$1245,
                body: body$1246,
                rest: rest$1247,
                generator: generator$1248,
                expression: expression$1249
            };
        },
        createFunctionExpression: function (id$1250, params$1251, defaults$1252, body$1253, rest$1254, generator$1255, expression$1256) {
            return {
                type: Syntax$948.FunctionExpression,
                id: id$1250,
                params: params$1251,
                defaults: defaults$1252,
                body: body$1253,
                rest: rest$1254,
                generator: generator$1255,
                expression: expression$1256
            };
        },
        createIdentifier: function (name$1257) {
            return {
                type: Syntax$948.Identifier,
                name: name$1257
            };
        },
        createIfStatement: function (test$1258, consequent$1259, alternate$1260) {
            return {
                type: Syntax$948.IfStatement,
                test: test$1258,
                consequent: consequent$1259,
                alternate: alternate$1260
            };
        },
        createLabeledStatement: function (label$1261, body$1262) {
            return {
                type: Syntax$948.LabeledStatement,
                label: label$1261,
                body: body$1262
            };
        },
        createLiteral: function (token$1263) {
            return {
                type: Syntax$948.Literal,
                value: token$1263.value,
                raw: String(token$1263.value)
            };
        },
        createMemberExpression: function (accessor$1264, object$1265, property$1266) {
            return {
                type: Syntax$948.MemberExpression,
                computed: accessor$1264 === '[',
                object: object$1265,
                property: property$1266
            };
        },
        createNewExpression: function (callee$1267, args$1268) {
            return {
                type: Syntax$948.NewExpression,
                callee: callee$1267,
                'arguments': args$1268
            };
        },
        createObjectExpression: function (properties$1269) {
            return {
                type: Syntax$948.ObjectExpression,
                properties: properties$1269
            };
        },
        createPostfixExpression: function (operator$1270, argument$1271) {
            return {
                type: Syntax$948.UpdateExpression,
                operator: operator$1270,
                argument: argument$1271,
                prefix: false
            };
        },
        createProgram: function (body$1272) {
            return {
                type: Syntax$948.Program,
                body: body$1272
            };
        },
        createProperty: function (kind$1273, key$1274, value$1275, method$1276, shorthand$1277) {
            return {
                type: Syntax$948.Property,
                key: key$1274,
                value: value$1275,
                kind: kind$1273,
                method: method$1276,
                shorthand: shorthand$1277
            };
        },
        createReturnStatement: function (argument$1278) {
            return {
                type: Syntax$948.ReturnStatement,
                argument: argument$1278
            };
        },
        createSequenceExpression: function (expressions$1279) {
            return {
                type: Syntax$948.SequenceExpression,
                expressions: expressions$1279
            };
        },
        createSwitchCase: function (test$1280, consequent$1281) {
            return {
                type: Syntax$948.SwitchCase,
                test: test$1280,
                consequent: consequent$1281
            };
        },
        createSwitchStatement: function (discriminant$1282, cases$1283) {
            return {
                type: Syntax$948.SwitchStatement,
                discriminant: discriminant$1282,
                cases: cases$1283
            };
        },
        createThisExpression: function () {
            return { type: Syntax$948.ThisExpression };
        },
        createThrowStatement: function (argument$1284) {
            return {
                type: Syntax$948.ThrowStatement,
                argument: argument$1284
            };
        },
        createTryStatement: function (block$1285, guardedHandlers$1286, handlers$1287, finalizer$1288) {
            return {
                type: Syntax$948.TryStatement,
                block: block$1285,
                guardedHandlers: guardedHandlers$1286,
                handlers: handlers$1287,
                finalizer: finalizer$1288
            };
        },
        createUnaryExpression: function (operator$1289, argument$1290) {
            if (operator$1289 === '++' || operator$1289 === '--') {
                return {
                    type: Syntax$948.UpdateExpression,
                    operator: operator$1289,
                    argument: argument$1290,
                    prefix: true
                };
            }
            return {
                type: Syntax$948.UnaryExpression,
                operator: operator$1289,
                argument: argument$1290
            };
        },
        createVariableDeclaration: function (declarations$1291, kind$1292) {
            return {
                type: Syntax$948.VariableDeclaration,
                declarations: declarations$1291,
                kind: kind$1292
            };
        },
        createVariableDeclarator: function (id$1293, init$1294) {
            return {
                type: Syntax$948.VariableDeclarator,
                id: id$1293,
                init: init$1294
            };
        },
        createWhileStatement: function (test$1295, body$1296) {
            return {
                type: Syntax$948.WhileStatement,
                test: test$1295,
                body: body$1296
            };
        },
        createWithStatement: function (object$1297, body$1298) {
            return {
                type: Syntax$948.WithStatement,
                object: object$1297,
                body: body$1298
            };
        },
        createTemplateElement: function (value$1299, tail$1300) {
            return {
                type: Syntax$948.TemplateElement,
                value: value$1299,
                tail: tail$1300
            };
        },
        createTemplateLiteral: function (quasis$1301, expressions$1302) {
            return {
                type: Syntax$948.TemplateLiteral,
                quasis: quasis$1301,
                expressions: expressions$1302
            };
        },
        createSpreadElement: function (argument$1303) {
            return {
                type: Syntax$948.SpreadElement,
                argument: argument$1303
            };
        },
        createTaggedTemplateExpression: function (tag$1304, quasi$1305) {
            return {
                type: Syntax$948.TaggedTemplateExpression,
                tag: tag$1304,
                quasi: quasi$1305
            };
        },
        createArrowFunctionExpression: function (params$1306, defaults$1307, body$1308, rest$1309, expression$1310) {
            return {
                type: Syntax$948.ArrowFunctionExpression,
                id: null,
                params: params$1306,
                defaults: defaults$1307,
                body: body$1308,
                rest: rest$1309,
                generator: false,
                expression: expression$1310
            };
        },
        createMethodDefinition: function (propertyType$1311, kind$1312, key$1313, value$1314) {
            return {
                type: Syntax$948.MethodDefinition,
                key: key$1313,
                value: value$1314,
                kind: kind$1312,
                'static': propertyType$1311 === ClassPropertyType$953.static
            };
        },
        createClassBody: function (body$1315) {
            return {
                type: Syntax$948.ClassBody,
                body: body$1315
            };
        },
        createClassExpression: function (id$1316, superClass$1317, body$1318) {
            return {
                type: Syntax$948.ClassExpression,
                id: id$1316,
                superClass: superClass$1317,
                body: body$1318
            };
        },
        createClassDeclaration: function (id$1319, superClass$1320, body$1321) {
            return {
                type: Syntax$948.ClassDeclaration,
                id: id$1319,
                superClass: superClass$1320,
                body: body$1321
            };
        },
        createExportSpecifier: function (id$1322, name$1323) {
            return {
                type: Syntax$948.ExportSpecifier,
                id: id$1322,
                name: name$1323
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$948.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1324, specifiers$1325, source$1326) {
            return {
                type: Syntax$948.ExportDeclaration,
                declaration: declaration$1324,
                specifiers: specifiers$1325,
                source: source$1326
            };
        },
        createImportSpecifier: function (id$1327, name$1328) {
            return {
                type: Syntax$948.ImportSpecifier,
                id: id$1327,
                name: name$1328
            };
        },
        createImportDeclaration: function (specifiers$1329, kind$1330, source$1331) {
            return {
                type: Syntax$948.ImportDeclaration,
                specifiers: specifiers$1329,
                kind: kind$1330,
                source: source$1331
            };
        },
        createYieldExpression: function (argument$1332, delegate$1333) {
            return {
                type: Syntax$948.YieldExpression,
                argument: argument$1332,
                delegate: delegate$1333
            };
        },
        createModuleDeclaration: function (id$1334, source$1335, body$1336) {
            return {
                type: Syntax$948.ModuleDeclaration,
                id: id$1334,
                source: source$1335,
                body: body$1336
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$1004() {
        return lookahead$967.lineNumber !== lineNumber$957;
    }
    // Throw an exception
    function throwError$1005(token$1337, messageFormat$1338) {
        var error$1339, args$1340 = Array.prototype.slice.call(arguments, 2), msg$1341 = messageFormat$1338.replace(/%(\d)/g, function (whole$1345, index$1346) {
                assert$971(index$1346 < args$1340.length, 'Message reference must be in range');
                return args$1340[index$1346];
            });
        var startIndex$1342 = streamIndex$966 > 3 ? streamIndex$966 - 3 : 0;
        var toks$1343 = tokenStream$965.slice(startIndex$1342, streamIndex$966 + 3).map(function (stx$1347) {
                return stx$1347.token.value;
            }).join(' ');
        var tailingMsg$1344 = '\n[... ' + toks$1343 + ' ...]';
        if (typeof token$1337.lineNumber === 'number') {
            error$1339 = new Error('Line ' + token$1337.lineNumber + ': ' + msg$1341 + tailingMsg$1344);
            error$1339.index = token$1337.range[0];
            error$1339.lineNumber = token$1337.lineNumber;
            error$1339.column = token$1337.range[0] - lineStart$958 + 1;
        } else {
            error$1339 = new Error('Line ' + lineNumber$957 + ': ' + msg$1341 + tailingMsg$1344);
            error$1339.index = index$956;
            error$1339.lineNumber = lineNumber$957;
            error$1339.column = index$956 - lineStart$958 + 1;
        }
        error$1339.description = msg$1341;
        throw error$1339;
    }
    function throwErrorTolerant$1006() {
        try {
            throwError$1005.apply(null, arguments);
        } catch (e$1348) {
            if (extra$970.errors) {
                extra$970.errors.push(e$1348);
            } else {
                throw e$1348;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$1007(token$1349) {
        if (token$1349.type === Token$945.EOF) {
            throwError$1005(token$1349, Messages$950.UnexpectedEOS);
        }
        if (token$1349.type === Token$945.NumericLiteral) {
            throwError$1005(token$1349, Messages$950.UnexpectedNumber);
        }
        if (token$1349.type === Token$945.StringLiteral) {
            throwError$1005(token$1349, Messages$950.UnexpectedString);
        }
        if (token$1349.type === Token$945.Identifier) {
            throwError$1005(token$1349, Messages$950.UnexpectedIdentifier);
        }
        if (token$1349.type === Token$945.Keyword) {
            if (isFutureReservedWord$980(token$1349.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$955 && isStrictModeReservedWord$981(token$1349.value)) {
                throwErrorTolerant$1006(token$1349, Messages$950.StrictReservedWord);
                return;
            }
            throwError$1005(token$1349, Messages$950.UnexpectedToken, token$1349.value);
        }
        if (token$1349.type === Token$945.Template) {
            throwError$1005(token$1349, Messages$950.UnexpectedTemplate, token$1349.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$1005(token$1349, Messages$950.UnexpectedToken, token$1349.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$1008(value$1350) {
        var token$1351 = lex$1001();
        if (token$1351.type !== Token$945.Punctuator || token$1351.value !== value$1350) {
            throwUnexpected$1007(token$1351);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$1009(keyword$1352) {
        var token$1353 = lex$1001();
        if (token$1353.type !== Token$945.Keyword || token$1353.value !== keyword$1352) {
            throwUnexpected$1007(token$1353);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$1010(value$1354) {
        return lookahead$967.type === Token$945.Punctuator && lookahead$967.value === value$1354;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$1011(keyword$1355) {
        return lookahead$967.type === Token$945.Keyword && lookahead$967.value === keyword$1355;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$1012(keyword$1356) {
        return lookahead$967.type === Token$945.Identifier && lookahead$967.value === keyword$1356;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$1013() {
        var op$1357;
        if (lookahead$967.type !== Token$945.Punctuator) {
            return false;
        }
        op$1357 = lookahead$967.value;
        return op$1357 === '=' || op$1357 === '*=' || op$1357 === '/=' || op$1357 === '%=' || op$1357 === '+=' || op$1357 === '-=' || op$1357 === '<<=' || op$1357 === '>>=' || op$1357 === '>>>=' || op$1357 === '&=' || op$1357 === '^=' || op$1357 === '|=';
    }
    function consumeSemicolon$1014() {
        var line$1358, ch$1359;
        ch$1359 = lookahead$967.value ? String(lookahead$967.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1359 === 59) {
            lex$1001();
            return;
        }
        if (lookahead$967.lineNumber !== lineNumber$957) {
            return;
        }
        if (match$1010(';')) {
            lex$1001();
            return;
        }
        if (lookahead$967.type !== Token$945.EOF && !match$1010('}')) {
            throwUnexpected$1007(lookahead$967);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$1015(expr$1360) {
        return expr$1360.type === Syntax$948.Identifier || expr$1360.type === Syntax$948.MemberExpression;
    }
    function isAssignableLeftHandSide$1016(expr$1361) {
        return isLeftHandSide$1015(expr$1361) || expr$1361.type === Syntax$948.ObjectPattern || expr$1361.type === Syntax$948.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$1017() {
        var elements$1362 = [], blocks$1363 = [], filter$1364 = null, tmp$1365, possiblecomprehension$1366 = true, body$1367;
        expect$1008('[');
        while (!match$1010(']')) {
            if (lookahead$967.value === 'for' && lookahead$967.type === Token$945.Keyword) {
                if (!possiblecomprehension$1366) {
                    throwError$1005({}, Messages$950.ComprehensionError);
                }
                matchKeyword$1011('for');
                tmp$1365 = parseForStatement$1065({ ignoreBody: true });
                tmp$1365.of = tmp$1365.type === Syntax$948.ForOfStatement;
                tmp$1365.type = Syntax$948.ComprehensionBlock;
                if (tmp$1365.left.kind) {
                    // can't be let or const
                    throwError$1005({}, Messages$950.ComprehensionError);
                }
                blocks$1363.push(tmp$1365);
            } else if (lookahead$967.value === 'if' && lookahead$967.type === Token$945.Keyword) {
                if (!possiblecomprehension$1366) {
                    throwError$1005({}, Messages$950.ComprehensionError);
                }
                expectKeyword$1009('if');
                expect$1008('(');
                filter$1364 = parseExpression$1045();
                expect$1008(')');
            } else if (lookahead$967.value === ',' && lookahead$967.type === Token$945.Punctuator) {
                possiblecomprehension$1366 = false;
                // no longer allowed.
                lex$1001();
                elements$1362.push(null);
            } else {
                tmp$1365 = parseSpreadOrAssignmentExpression$1028();
                elements$1362.push(tmp$1365);
                if (tmp$1365 && tmp$1365.type === Syntax$948.SpreadElement) {
                    if (!match$1010(']')) {
                        throwError$1005({}, Messages$950.ElementAfterSpreadElement);
                    }
                } else if (!(match$1010(']') || matchKeyword$1011('for') || matchKeyword$1011('if'))) {
                    expect$1008(',');
                    // this lexes.
                    possiblecomprehension$1366 = false;
                }
            }
        }
        expect$1008(']');
        if (filter$1364 && !blocks$1363.length) {
            throwError$1005({}, Messages$950.ComprehensionRequiresBlock);
        }
        if (blocks$1363.length) {
            if (elements$1362.length !== 1) {
                throwError$1005({}, Messages$950.ComprehensionError);
            }
            return {
                type: Syntax$948.ComprehensionExpression,
                filter: filter$1364,
                blocks: blocks$1363,
                body: elements$1362[0]
            };
        }
        return delegate$964.createArrayExpression(elements$1362);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$1018(options$1368) {
        var previousStrict$1369, previousYieldAllowed$1370, params$1371, defaults$1372, body$1373;
        previousStrict$1369 = strict$955;
        previousYieldAllowed$1370 = state$969.yieldAllowed;
        state$969.yieldAllowed = options$1368.generator;
        params$1371 = options$1368.params || [];
        defaults$1372 = options$1368.defaults || [];
        body$1373 = parseConciseBody$1077();
        if (options$1368.name && strict$955 && isRestrictedWord$982(params$1371[0].name)) {
            throwErrorTolerant$1006(options$1368.name, Messages$950.StrictParamName);
        }
        if (state$969.yieldAllowed && !state$969.yieldFound) {
            throwErrorTolerant$1006({}, Messages$950.NoYieldInGenerator);
        }
        strict$955 = previousStrict$1369;
        state$969.yieldAllowed = previousYieldAllowed$1370;
        return delegate$964.createFunctionExpression(null, params$1371, defaults$1372, body$1373, options$1368.rest || null, options$1368.generator, body$1373.type !== Syntax$948.BlockStatement);
    }
    function parsePropertyMethodFunction$1019(options$1374) {
        var previousStrict$1375, tmp$1376, method$1377;
        previousStrict$1375 = strict$955;
        strict$955 = true;
        tmp$1376 = parseParams$1081();
        if (tmp$1376.stricted) {
            throwErrorTolerant$1006(tmp$1376.stricted, tmp$1376.message);
        }
        method$1377 = parsePropertyFunction$1018({
            params: tmp$1376.params,
            defaults: tmp$1376.defaults,
            rest: tmp$1376.rest,
            generator: options$1374.generator
        });
        strict$955 = previousStrict$1375;
        return method$1377;
    }
    function parseObjectPropertyKey$1020() {
        var token$1378 = lex$1001();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1378.type === Token$945.StringLiteral || token$1378.type === Token$945.NumericLiteral) {
            if (strict$955 && token$1378.octal) {
                throwErrorTolerant$1006(token$1378, Messages$950.StrictOctalLiteral);
            }
            return delegate$964.createLiteral(token$1378);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$964.createIdentifier(token$1378.value);
    }
    function parseObjectProperty$1021() {
        var token$1379, key$1380, id$1381, value$1382, param$1383;
        token$1379 = lookahead$967;
        if (token$1379.type === Token$945.Identifier) {
            id$1381 = parseObjectPropertyKey$1020();
            // Property Assignment: Getter and Setter.
            if (token$1379.value === 'get' && !(match$1010(':') || match$1010('('))) {
                key$1380 = parseObjectPropertyKey$1020();
                expect$1008('(');
                expect$1008(')');
                return delegate$964.createProperty('get', key$1380, parsePropertyFunction$1018({ generator: false }), false, false);
            }
            if (token$1379.value === 'set' && !(match$1010(':') || match$1010('('))) {
                key$1380 = parseObjectPropertyKey$1020();
                expect$1008('(');
                token$1379 = lookahead$967;
                param$1383 = [parseVariableIdentifier$1048()];
                expect$1008(')');
                return delegate$964.createProperty('set', key$1380, parsePropertyFunction$1018({
                    params: param$1383,
                    generator: false,
                    name: token$1379
                }), false, false);
            }
            if (match$1010(':')) {
                lex$1001();
                return delegate$964.createProperty('init', id$1381, parseAssignmentExpression$1044(), false, false);
            }
            if (match$1010('(')) {
                return delegate$964.createProperty('init', id$1381, parsePropertyMethodFunction$1019({ generator: false }), true, false);
            }
            return delegate$964.createProperty('init', id$1381, id$1381, false, true);
        }
        if (token$1379.type === Token$945.EOF || token$1379.type === Token$945.Punctuator) {
            if (!match$1010('*')) {
                throwUnexpected$1007(token$1379);
            }
            lex$1001();
            id$1381 = parseObjectPropertyKey$1020();
            if (!match$1010('(')) {
                throwUnexpected$1007(lex$1001());
            }
            return delegate$964.createProperty('init', id$1381, parsePropertyMethodFunction$1019({ generator: true }), true, false);
        }
        key$1380 = parseObjectPropertyKey$1020();
        if (match$1010(':')) {
            lex$1001();
            return delegate$964.createProperty('init', key$1380, parseAssignmentExpression$1044(), false, false);
        }
        if (match$1010('(')) {
            return delegate$964.createProperty('init', key$1380, parsePropertyMethodFunction$1019({ generator: false }), true, false);
        }
        throwUnexpected$1007(lex$1001());
    }
    function parseObjectInitialiser$1022() {
        var properties$1384 = [], property$1385, name$1386, key$1387, kind$1388, map$1389 = {}, toString$1390 = String;
        expect$1008('{');
        while (!match$1010('}')) {
            property$1385 = parseObjectProperty$1021();
            if (property$1385.key.type === Syntax$948.Identifier) {
                name$1386 = property$1385.key.name;
            } else {
                name$1386 = toString$1390(property$1385.key.value);
            }
            kind$1388 = property$1385.kind === 'init' ? PropertyKind$949.Data : property$1385.kind === 'get' ? PropertyKind$949.Get : PropertyKind$949.Set;
            key$1387 = '$' + name$1386;
            if (Object.prototype.hasOwnProperty.call(map$1389, key$1387)) {
                if (map$1389[key$1387] === PropertyKind$949.Data) {
                    if (strict$955 && kind$1388 === PropertyKind$949.Data) {
                        throwErrorTolerant$1006({}, Messages$950.StrictDuplicateProperty);
                    } else if (kind$1388 !== PropertyKind$949.Data) {
                        throwErrorTolerant$1006({}, Messages$950.AccessorDataProperty);
                    }
                } else {
                    if (kind$1388 === PropertyKind$949.Data) {
                        throwErrorTolerant$1006({}, Messages$950.AccessorDataProperty);
                    } else if (map$1389[key$1387] & kind$1388) {
                        throwErrorTolerant$1006({}, Messages$950.AccessorGetSet);
                    }
                }
                map$1389[key$1387] |= kind$1388;
            } else {
                map$1389[key$1387] = kind$1388;
            }
            properties$1384.push(property$1385);
            if (!match$1010('}')) {
                expect$1008(',');
            }
        }
        expect$1008('}');
        return delegate$964.createObjectExpression(properties$1384);
    }
    function parseTemplateElement$1023(option$1391) {
        var token$1392 = scanTemplateElement$996(option$1391);
        if (strict$955 && token$1392.octal) {
            throwError$1005(token$1392, Messages$950.StrictOctalLiteral);
        }
        return delegate$964.createTemplateElement({
            raw: token$1392.value.raw,
            cooked: token$1392.value.cooked
        }, token$1392.tail);
    }
    function parseTemplateLiteral$1024() {
        var quasi$1393, quasis$1394, expressions$1395;
        quasi$1393 = parseTemplateElement$1023({ head: true });
        quasis$1394 = [quasi$1393];
        expressions$1395 = [];
        while (!quasi$1393.tail) {
            expressions$1395.push(parseExpression$1045());
            quasi$1393 = parseTemplateElement$1023({ head: false });
            quasis$1394.push(quasi$1393);
        }
        return delegate$964.createTemplateLiteral(quasis$1394, expressions$1395);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$1025() {
        var expr$1396;
        expect$1008('(');
        ++state$969.parenthesizedCount;
        expr$1396 = parseExpression$1045();
        expect$1008(')');
        return expr$1396;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$1026() {
        var type$1397, token$1398, resolvedIdent$1399;
        token$1398 = lookahead$967;
        type$1397 = lookahead$967.type;
        if (type$1397 === Token$945.Identifier) {
            resolvedIdent$1399 = expander$944.resolve(tokenStream$965[lookaheadIndex$968]);
            lex$1001();
            return delegate$964.createIdentifier(resolvedIdent$1399);
        }
        if (type$1397 === Token$945.StringLiteral || type$1397 === Token$945.NumericLiteral) {
            if (strict$955 && lookahead$967.octal) {
                throwErrorTolerant$1006(lookahead$967, Messages$950.StrictOctalLiteral);
            }
            return delegate$964.createLiteral(lex$1001());
        }
        if (type$1397 === Token$945.Keyword) {
            if (matchKeyword$1011('this')) {
                lex$1001();
                return delegate$964.createThisExpression();
            }
            if (matchKeyword$1011('function')) {
                return parseFunctionExpression$1083();
            }
            if (matchKeyword$1011('class')) {
                return parseClassExpression$1088();
            }
            if (matchKeyword$1011('super')) {
                lex$1001();
                return delegate$964.createIdentifier('super');
            }
        }
        if (type$1397 === Token$945.BooleanLiteral) {
            token$1398 = lex$1001();
            token$1398.value = token$1398.value === 'true';
            return delegate$964.createLiteral(token$1398);
        }
        if (type$1397 === Token$945.NullLiteral) {
            token$1398 = lex$1001();
            token$1398.value = null;
            return delegate$964.createLiteral(token$1398);
        }
        if (match$1010('[')) {
            return parseArrayInitialiser$1017();
        }
        if (match$1010('{')) {
            return parseObjectInitialiser$1022();
        }
        if (match$1010('(')) {
            return parseGroupExpression$1025();
        }
        if (lookahead$967.type === Token$945.RegularExpression) {
            return delegate$964.createLiteral(lex$1001());
        }
        if (type$1397 === Token$945.Template) {
            return parseTemplateLiteral$1024();
        }
        return throwUnexpected$1007(lex$1001());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$1027() {
        var args$1400 = [], arg$1401;
        expect$1008('(');
        if (!match$1010(')')) {
            while (streamIndex$966 < length$963) {
                arg$1401 = parseSpreadOrAssignmentExpression$1028();
                args$1400.push(arg$1401);
                if (match$1010(')')) {
                    break;
                } else if (arg$1401.type === Syntax$948.SpreadElement) {
                    throwError$1005({}, Messages$950.ElementAfterSpreadElement);
                }
                expect$1008(',');
            }
        }
        expect$1008(')');
        return args$1400;
    }
    function parseSpreadOrAssignmentExpression$1028() {
        if (match$1010('...')) {
            lex$1001();
            return delegate$964.createSpreadElement(parseAssignmentExpression$1044());
        }
        return parseAssignmentExpression$1044();
    }
    function parseNonComputedProperty$1029() {
        var token$1402 = lex$1001();
        if (!isIdentifierName$998(token$1402)) {
            throwUnexpected$1007(token$1402);
        }
        return delegate$964.createIdentifier(token$1402.value);
    }
    function parseNonComputedMember$1030() {
        expect$1008('.');
        return parseNonComputedProperty$1029();
    }
    function parseComputedMember$1031() {
        var expr$1403;
        expect$1008('[');
        expr$1403 = parseExpression$1045();
        expect$1008(']');
        return expr$1403;
    }
    function parseNewExpression$1032() {
        var callee$1404, args$1405;
        expectKeyword$1009('new');
        callee$1404 = parseLeftHandSideExpression$1034();
        args$1405 = match$1010('(') ? parseArguments$1027() : [];
        return delegate$964.createNewExpression(callee$1404, args$1405);
    }
    function parseLeftHandSideExpressionAllowCall$1033() {
        var expr$1406, args$1407, property$1408;
        expr$1406 = matchKeyword$1011('new') ? parseNewExpression$1032() : parsePrimaryExpression$1026();
        while (match$1010('.') || match$1010('[') || match$1010('(') || lookahead$967.type === Token$945.Template) {
            if (match$1010('(')) {
                args$1407 = parseArguments$1027();
                expr$1406 = delegate$964.createCallExpression(expr$1406, args$1407);
            } else if (match$1010('[')) {
                expr$1406 = delegate$964.createMemberExpression('[', expr$1406, parseComputedMember$1031());
            } else if (match$1010('.')) {
                expr$1406 = delegate$964.createMemberExpression('.', expr$1406, parseNonComputedMember$1030());
            } else {
                expr$1406 = delegate$964.createTaggedTemplateExpression(expr$1406, parseTemplateLiteral$1024());
            }
        }
        return expr$1406;
    }
    function parseLeftHandSideExpression$1034() {
        var expr$1409, property$1410;
        expr$1409 = matchKeyword$1011('new') ? parseNewExpression$1032() : parsePrimaryExpression$1026();
        while (match$1010('.') || match$1010('[') || lookahead$967.type === Token$945.Template) {
            if (match$1010('[')) {
                expr$1409 = delegate$964.createMemberExpression('[', expr$1409, parseComputedMember$1031());
            } else if (match$1010('.')) {
                expr$1409 = delegate$964.createMemberExpression('.', expr$1409, parseNonComputedMember$1030());
            } else {
                expr$1409 = delegate$964.createTaggedTemplateExpression(expr$1409, parseTemplateLiteral$1024());
            }
        }
        return expr$1409;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$1035() {
        var expr$1411 = parseLeftHandSideExpressionAllowCall$1033(), token$1412 = lookahead$967;
        if (lookahead$967.type !== Token$945.Punctuator) {
            return expr$1411;
        }
        if ((match$1010('++') || match$1010('--')) && !peekLineTerminator$1004()) {
            // 11.3.1, 11.3.2
            if (strict$955 && expr$1411.type === Syntax$948.Identifier && isRestrictedWord$982(expr$1411.name)) {
                throwErrorTolerant$1006({}, Messages$950.StrictLHSPostfix);
            }
            if (!isLeftHandSide$1015(expr$1411)) {
                throwError$1005({}, Messages$950.InvalidLHSInAssignment);
            }
            token$1412 = lex$1001();
            expr$1411 = delegate$964.createPostfixExpression(token$1412.value, expr$1411);
        }
        return expr$1411;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$1036() {
        var token$1413, expr$1414;
        if (lookahead$967.type !== Token$945.Punctuator && lookahead$967.type !== Token$945.Keyword) {
            return parsePostfixExpression$1035();
        }
        if (match$1010('++') || match$1010('--')) {
            token$1413 = lex$1001();
            expr$1414 = parseUnaryExpression$1036();
            // 11.4.4, 11.4.5
            if (strict$955 && expr$1414.type === Syntax$948.Identifier && isRestrictedWord$982(expr$1414.name)) {
                throwErrorTolerant$1006({}, Messages$950.StrictLHSPrefix);
            }
            if (!isLeftHandSide$1015(expr$1414)) {
                throwError$1005({}, Messages$950.InvalidLHSInAssignment);
            }
            return delegate$964.createUnaryExpression(token$1413.value, expr$1414);
        }
        if (match$1010('+') || match$1010('-') || match$1010('~') || match$1010('!')) {
            token$1413 = lex$1001();
            expr$1414 = parseUnaryExpression$1036();
            return delegate$964.createUnaryExpression(token$1413.value, expr$1414);
        }
        if (matchKeyword$1011('delete') || matchKeyword$1011('void') || matchKeyword$1011('typeof')) {
            token$1413 = lex$1001();
            expr$1414 = parseUnaryExpression$1036();
            expr$1414 = delegate$964.createUnaryExpression(token$1413.value, expr$1414);
            if (strict$955 && expr$1414.operator === 'delete' && expr$1414.argument.type === Syntax$948.Identifier) {
                throwErrorTolerant$1006({}, Messages$950.StrictDelete);
            }
            return expr$1414;
        }
        return parsePostfixExpression$1035();
    }
    function binaryPrecedence$1037(token$1415, allowIn$1416) {
        var prec$1417 = 0;
        if (token$1415.type !== Token$945.Punctuator && token$1415.type !== Token$945.Keyword) {
            return 0;
        }
        switch (token$1415.value) {
        case '||':
            prec$1417 = 1;
            break;
        case '&&':
            prec$1417 = 2;
            break;
        case '|':
            prec$1417 = 3;
            break;
        case '^':
            prec$1417 = 4;
            break;
        case '&':
            prec$1417 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1417 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1417 = 7;
            break;
        case 'in':
            prec$1417 = allowIn$1416 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1417 = 8;
            break;
        case '+':
        case '-':
            prec$1417 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1417 = 11;
            break;
        default:
            break;
        }
        return prec$1417;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$1038() {
        var expr$1418, token$1419, prec$1420, previousAllowIn$1421, stack$1422, right$1423, operator$1424, left$1425, i$1426;
        previousAllowIn$1421 = state$969.allowIn;
        state$969.allowIn = true;
        expr$1418 = parseUnaryExpression$1036();
        token$1419 = lookahead$967;
        prec$1420 = binaryPrecedence$1037(token$1419, previousAllowIn$1421);
        if (prec$1420 === 0) {
            return expr$1418;
        }
        token$1419.prec = prec$1420;
        lex$1001();
        stack$1422 = [
            expr$1418,
            token$1419,
            parseUnaryExpression$1036()
        ];
        while ((prec$1420 = binaryPrecedence$1037(lookahead$967, previousAllowIn$1421)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1422.length > 2 && prec$1420 <= stack$1422[stack$1422.length - 2].prec) {
                right$1423 = stack$1422.pop();
                operator$1424 = stack$1422.pop().value;
                left$1425 = stack$1422.pop();
                stack$1422.push(delegate$964.createBinaryExpression(operator$1424, left$1425, right$1423));
            }
            // Shift.
            token$1419 = lex$1001();
            token$1419.prec = prec$1420;
            stack$1422.push(token$1419);
            stack$1422.push(parseUnaryExpression$1036());
        }
        state$969.allowIn = previousAllowIn$1421;
        // Final reduce to clean-up the stack.
        i$1426 = stack$1422.length - 1;
        expr$1418 = stack$1422[i$1426];
        while (i$1426 > 1) {
            expr$1418 = delegate$964.createBinaryExpression(stack$1422[i$1426 - 1].value, stack$1422[i$1426 - 2], expr$1418);
            i$1426 -= 2;
        }
        return expr$1418;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$1039() {
        var expr$1427, previousAllowIn$1428, consequent$1429, alternate$1430;
        expr$1427 = parseBinaryExpression$1038();
        if (match$1010('?')) {
            lex$1001();
            previousAllowIn$1428 = state$969.allowIn;
            state$969.allowIn = true;
            consequent$1429 = parseAssignmentExpression$1044();
            state$969.allowIn = previousAllowIn$1428;
            expect$1008(':');
            alternate$1430 = parseAssignmentExpression$1044();
            expr$1427 = delegate$964.createConditionalExpression(expr$1427, consequent$1429, alternate$1430);
        }
        return expr$1427;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$1040(expr$1431) {
        var i$1432, len$1433, property$1434, element$1435;
        if (expr$1431.type === Syntax$948.ObjectExpression) {
            expr$1431.type = Syntax$948.ObjectPattern;
            for (i$1432 = 0, len$1433 = expr$1431.properties.length; i$1432 < len$1433; i$1432 += 1) {
                property$1434 = expr$1431.properties[i$1432];
                if (property$1434.kind !== 'init') {
                    throwError$1005({}, Messages$950.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$1040(property$1434.value);
            }
        } else if (expr$1431.type === Syntax$948.ArrayExpression) {
            expr$1431.type = Syntax$948.ArrayPattern;
            for (i$1432 = 0, len$1433 = expr$1431.elements.length; i$1432 < len$1433; i$1432 += 1) {
                element$1435 = expr$1431.elements[i$1432];
                if (element$1435) {
                    reinterpretAsAssignmentBindingPattern$1040(element$1435);
                }
            }
        } else if (expr$1431.type === Syntax$948.Identifier) {
            if (isRestrictedWord$982(expr$1431.name)) {
                throwError$1005({}, Messages$950.InvalidLHSInAssignment);
            }
        } else if (expr$1431.type === Syntax$948.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$1040(expr$1431.argument);
            if (expr$1431.argument.type === Syntax$948.ObjectPattern) {
                throwError$1005({}, Messages$950.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1431.type !== Syntax$948.MemberExpression && expr$1431.type !== Syntax$948.CallExpression && expr$1431.type !== Syntax$948.NewExpression) {
                throwError$1005({}, Messages$950.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$1041(options$1436, expr$1437) {
        var i$1438, len$1439, property$1440, element$1441;
        if (expr$1437.type === Syntax$948.ObjectExpression) {
            expr$1437.type = Syntax$948.ObjectPattern;
            for (i$1438 = 0, len$1439 = expr$1437.properties.length; i$1438 < len$1439; i$1438 += 1) {
                property$1440 = expr$1437.properties[i$1438];
                if (property$1440.kind !== 'init') {
                    throwError$1005({}, Messages$950.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$1041(options$1436, property$1440.value);
            }
        } else if (expr$1437.type === Syntax$948.ArrayExpression) {
            expr$1437.type = Syntax$948.ArrayPattern;
            for (i$1438 = 0, len$1439 = expr$1437.elements.length; i$1438 < len$1439; i$1438 += 1) {
                element$1441 = expr$1437.elements[i$1438];
                if (element$1441) {
                    reinterpretAsDestructuredParameter$1041(options$1436, element$1441);
                }
            }
        } else if (expr$1437.type === Syntax$948.Identifier) {
            validateParam$1079(options$1436, expr$1437, expr$1437.name);
        } else {
            if (expr$1437.type !== Syntax$948.MemberExpression) {
                throwError$1005({}, Messages$950.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$1042(expressions$1442) {
        var i$1443, len$1444, param$1445, params$1446, defaults$1447, defaultCount$1448, options$1449, rest$1450;
        params$1446 = [];
        defaults$1447 = [];
        defaultCount$1448 = 0;
        rest$1450 = null;
        options$1449 = { paramSet: {} };
        for (i$1443 = 0, len$1444 = expressions$1442.length; i$1443 < len$1444; i$1443 += 1) {
            param$1445 = expressions$1442[i$1443];
            if (param$1445.type === Syntax$948.Identifier) {
                params$1446.push(param$1445);
                defaults$1447.push(null);
                validateParam$1079(options$1449, param$1445, param$1445.name);
            } else if (param$1445.type === Syntax$948.ObjectExpression || param$1445.type === Syntax$948.ArrayExpression) {
                reinterpretAsDestructuredParameter$1041(options$1449, param$1445);
                params$1446.push(param$1445);
                defaults$1447.push(null);
            } else if (param$1445.type === Syntax$948.SpreadElement) {
                assert$971(i$1443 === len$1444 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$1041(options$1449, param$1445.argument);
                rest$1450 = param$1445.argument;
            } else if (param$1445.type === Syntax$948.AssignmentExpression) {
                params$1446.push(param$1445.left);
                defaults$1447.push(param$1445.right);
                ++defaultCount$1448;
                validateParam$1079(options$1449, param$1445.left, param$1445.left.name);
            } else {
                return null;
            }
        }
        if (options$1449.message === Messages$950.StrictParamDupe) {
            throwError$1005(strict$955 ? options$1449.stricted : options$1449.firstRestricted, options$1449.message);
        }
        if (defaultCount$1448 === 0) {
            defaults$1447 = [];
        }
        return {
            params: params$1446,
            defaults: defaults$1447,
            rest: rest$1450,
            stricted: options$1449.stricted,
            firstRestricted: options$1449.firstRestricted,
            message: options$1449.message
        };
    }
    function parseArrowFunctionExpression$1043(options$1451) {
        var previousStrict$1452, previousYieldAllowed$1453, body$1454;
        expect$1008('=>');
        previousStrict$1452 = strict$955;
        previousYieldAllowed$1453 = state$969.yieldAllowed;
        state$969.yieldAllowed = false;
        body$1454 = parseConciseBody$1077();
        if (strict$955 && options$1451.firstRestricted) {
            throwError$1005(options$1451.firstRestricted, options$1451.message);
        }
        if (strict$955 && options$1451.stricted) {
            throwErrorTolerant$1006(options$1451.stricted, options$1451.message);
        }
        strict$955 = previousStrict$1452;
        state$969.yieldAllowed = previousYieldAllowed$1453;
        return delegate$964.createArrowFunctionExpression(options$1451.params, options$1451.defaults, body$1454, options$1451.rest, body$1454.type !== Syntax$948.BlockStatement);
    }
    function parseAssignmentExpression$1044() {
        var expr$1455, token$1456, params$1457, oldParenthesizedCount$1458;
        if (matchKeyword$1011('yield')) {
            return parseYieldExpression$1084();
        }
        oldParenthesizedCount$1458 = state$969.parenthesizedCount;
        if (match$1010('(')) {
            token$1456 = lookahead2$1003();
            if (token$1456.type === Token$945.Punctuator && token$1456.value === ')' || token$1456.value === '...') {
                params$1457 = parseParams$1081();
                if (!match$1010('=>')) {
                    throwUnexpected$1007(lex$1001());
                }
                return parseArrowFunctionExpression$1043(params$1457);
            }
        }
        token$1456 = lookahead$967;
        expr$1455 = parseConditionalExpression$1039();
        if (match$1010('=>') && (state$969.parenthesizedCount === oldParenthesizedCount$1458 || state$969.parenthesizedCount === oldParenthesizedCount$1458 + 1)) {
            if (expr$1455.type === Syntax$948.Identifier) {
                params$1457 = reinterpretAsCoverFormalsList$1042([expr$1455]);
            } else if (expr$1455.type === Syntax$948.SequenceExpression) {
                params$1457 = reinterpretAsCoverFormalsList$1042(expr$1455.expressions);
            }
            if (params$1457) {
                return parseArrowFunctionExpression$1043(params$1457);
            }
        }
        if (matchAssign$1013()) {
            // 11.13.1
            if (strict$955 && expr$1455.type === Syntax$948.Identifier && isRestrictedWord$982(expr$1455.name)) {
                throwErrorTolerant$1006(token$1456, Messages$950.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$1010('=') && (expr$1455.type === Syntax$948.ObjectExpression || expr$1455.type === Syntax$948.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$1040(expr$1455);
            } else if (!isLeftHandSide$1015(expr$1455)) {
                throwError$1005({}, Messages$950.InvalidLHSInAssignment);
            }
            expr$1455 = delegate$964.createAssignmentExpression(lex$1001().value, expr$1455, parseAssignmentExpression$1044());
        }
        return expr$1455;
    }
    // 11.14 Comma Operator
    function parseExpression$1045() {
        var expr$1459, expressions$1460, sequence$1461, coverFormalsList$1462, spreadFound$1463, oldParenthesizedCount$1464;
        oldParenthesizedCount$1464 = state$969.parenthesizedCount;
        expr$1459 = parseAssignmentExpression$1044();
        expressions$1460 = [expr$1459];
        if (match$1010(',')) {
            while (streamIndex$966 < length$963) {
                if (!match$1010(',')) {
                    break;
                }
                lex$1001();
                expr$1459 = parseSpreadOrAssignmentExpression$1028();
                expressions$1460.push(expr$1459);
                if (expr$1459.type === Syntax$948.SpreadElement) {
                    spreadFound$1463 = true;
                    if (!match$1010(')')) {
                        throwError$1005({}, Messages$950.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1461 = delegate$964.createSequenceExpression(expressions$1460);
        }
        if (match$1010('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$969.parenthesizedCount === oldParenthesizedCount$1464 || state$969.parenthesizedCount === oldParenthesizedCount$1464 + 1) {
                expr$1459 = expr$1459.type === Syntax$948.SequenceExpression ? expr$1459.expressions : expressions$1460;
                coverFormalsList$1462 = reinterpretAsCoverFormalsList$1042(expr$1459);
                if (coverFormalsList$1462) {
                    return parseArrowFunctionExpression$1043(coverFormalsList$1462);
                }
            }
            throwUnexpected$1007(lex$1001());
        }
        if (spreadFound$1463 && lookahead2$1003().value !== '=>') {
            throwError$1005({}, Messages$950.IllegalSpread);
        }
        return sequence$1461 || expr$1459;
    }
    // 12.1 Block
    function parseStatementList$1046() {
        var list$1465 = [], statement$1466;
        while (streamIndex$966 < length$963) {
            if (match$1010('}')) {
                break;
            }
            statement$1466 = parseSourceElement$1091();
            if (typeof statement$1466 === 'undefined') {
                break;
            }
            list$1465.push(statement$1466);
        }
        return list$1465;
    }
    function parseBlock$1047() {
        var block$1467;
        expect$1008('{');
        block$1467 = parseStatementList$1046();
        expect$1008('}');
        return delegate$964.createBlockStatement(block$1467);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$1048() {
        var token$1468 = lookahead$967, resolvedIdent$1469;
        if (token$1468.type !== Token$945.Identifier) {
            throwUnexpected$1007(token$1468);
        }
        resolvedIdent$1469 = expander$944.resolve(tokenStream$965[lookaheadIndex$968]);
        lex$1001();
        return delegate$964.createIdentifier(resolvedIdent$1469);
    }
    function parseVariableDeclaration$1049(kind$1470) {
        var id$1471, init$1472 = null;
        if (match$1010('{')) {
            id$1471 = parseObjectInitialiser$1022();
            reinterpretAsAssignmentBindingPattern$1040(id$1471);
        } else if (match$1010('[')) {
            id$1471 = parseArrayInitialiser$1017();
            reinterpretAsAssignmentBindingPattern$1040(id$1471);
        } else {
            id$1471 = state$969.allowKeyword ? parseNonComputedProperty$1029() : parseVariableIdentifier$1048();
            // 12.2.1
            if (strict$955 && isRestrictedWord$982(id$1471.name)) {
                throwErrorTolerant$1006({}, Messages$950.StrictVarName);
            }
        }
        if (kind$1470 === 'const') {
            if (!match$1010('=')) {
                throwError$1005({}, Messages$950.NoUnintializedConst);
            }
            expect$1008('=');
            init$1472 = parseAssignmentExpression$1044();
        } else if (match$1010('=')) {
            lex$1001();
            init$1472 = parseAssignmentExpression$1044();
        }
        return delegate$964.createVariableDeclarator(id$1471, init$1472);
    }
    function parseVariableDeclarationList$1050(kind$1473) {
        var list$1474 = [];
        do {
            list$1474.push(parseVariableDeclaration$1049(kind$1473));
            if (!match$1010(',')) {
                break;
            }
            lex$1001();
        } while (streamIndex$966 < length$963);
        return list$1474;
    }
    function parseVariableStatement$1051() {
        var declarations$1475;
        expectKeyword$1009('var');
        declarations$1475 = parseVariableDeclarationList$1050();
        consumeSemicolon$1014();
        return delegate$964.createVariableDeclaration(declarations$1475, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$1052(kind$1476) {
        var declarations$1477;
        expectKeyword$1009(kind$1476);
        declarations$1477 = parseVariableDeclarationList$1050(kind$1476);
        consumeSemicolon$1014();
        return delegate$964.createVariableDeclaration(declarations$1477, kind$1476);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$1053() {
        var id$1478, src$1479, body$1480;
        lex$1001();
        // 'module'
        if (peekLineTerminator$1004()) {
            throwError$1005({}, Messages$950.NewlineAfterModule);
        }
        switch (lookahead$967.type) {
        case Token$945.StringLiteral:
            id$1478 = parsePrimaryExpression$1026();
            body$1480 = parseModuleBlock$1096();
            src$1479 = null;
            break;
        case Token$945.Identifier:
            id$1478 = parseVariableIdentifier$1048();
            body$1480 = null;
            if (!matchContextualKeyword$1012('from')) {
                throwUnexpected$1007(lex$1001());
            }
            lex$1001();
            src$1479 = parsePrimaryExpression$1026();
            if (src$1479.type !== Syntax$948.Literal) {
                throwError$1005({}, Messages$950.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$1014();
        return delegate$964.createModuleDeclaration(id$1478, src$1479, body$1480);
    }
    function parseExportBatchSpecifier$1054() {
        expect$1008('*');
        return delegate$964.createExportBatchSpecifier();
    }
    function parseExportSpecifier$1055() {
        var id$1481, name$1482 = null;
        id$1481 = parseVariableIdentifier$1048();
        if (matchContextualKeyword$1012('as')) {
            lex$1001();
            name$1482 = parseNonComputedProperty$1029();
        }
        return delegate$964.createExportSpecifier(id$1481, name$1482);
    }
    function parseExportDeclaration$1056() {
        var previousAllowKeyword$1483, decl$1484, def$1485, src$1486, specifiers$1487;
        expectKeyword$1009('export');
        if (lookahead$967.type === Token$945.Keyword) {
            switch (lookahead$967.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$964.createExportDeclaration(parseSourceElement$1091(), null, null);
            }
        }
        if (isIdentifierName$998(lookahead$967)) {
            previousAllowKeyword$1483 = state$969.allowKeyword;
            state$969.allowKeyword = true;
            decl$1484 = parseVariableDeclarationList$1050('let');
            state$969.allowKeyword = previousAllowKeyword$1483;
            return delegate$964.createExportDeclaration(decl$1484, null, null);
        }
        specifiers$1487 = [];
        src$1486 = null;
        if (match$1010('*')) {
            specifiers$1487.push(parseExportBatchSpecifier$1054());
        } else {
            expect$1008('{');
            do {
                specifiers$1487.push(parseExportSpecifier$1055());
            } while (match$1010(',') && lex$1001());
            expect$1008('}');
        }
        if (matchContextualKeyword$1012('from')) {
            lex$1001();
            src$1486 = parsePrimaryExpression$1026();
            if (src$1486.type !== Syntax$948.Literal) {
                throwError$1005({}, Messages$950.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$1014();
        return delegate$964.createExportDeclaration(null, specifiers$1487, src$1486);
    }
    function parseImportDeclaration$1057() {
        var specifiers$1488, kind$1489, src$1490;
        expectKeyword$1009('import');
        specifiers$1488 = [];
        if (isIdentifierName$998(lookahead$967)) {
            kind$1489 = 'default';
            specifiers$1488.push(parseImportSpecifier$1058());
            if (!matchContextualKeyword$1012('from')) {
                throwError$1005({}, Messages$950.NoFromAfterImport);
            }
            lex$1001();
        } else if (match$1010('{')) {
            kind$1489 = 'named';
            lex$1001();
            do {
                specifiers$1488.push(parseImportSpecifier$1058());
            } while (match$1010(',') && lex$1001());
            expect$1008('}');
            if (!matchContextualKeyword$1012('from')) {
                throwError$1005({}, Messages$950.NoFromAfterImport);
            }
            lex$1001();
        }
        src$1490 = parsePrimaryExpression$1026();
        if (src$1490.type !== Syntax$948.Literal) {
            throwError$1005({}, Messages$950.InvalidModuleSpecifier);
        }
        consumeSemicolon$1014();
        return delegate$964.createImportDeclaration(specifiers$1488, kind$1489, src$1490);
    }
    function parseImportSpecifier$1058() {
        var id$1491, name$1492 = null;
        id$1491 = parseNonComputedProperty$1029();
        if (matchContextualKeyword$1012('as')) {
            lex$1001();
            name$1492 = parseVariableIdentifier$1048();
        }
        return delegate$964.createImportSpecifier(id$1491, name$1492);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$1059() {
        expect$1008(';');
        return delegate$964.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$1060() {
        var expr$1493 = parseExpression$1045();
        consumeSemicolon$1014();
        return delegate$964.createExpressionStatement(expr$1493);
    }
    // 12.5 If statement
    function parseIfStatement$1061() {
        var test$1494, consequent$1495, alternate$1496;
        expectKeyword$1009('if');
        expect$1008('(');
        test$1494 = parseExpression$1045();
        expect$1008(')');
        consequent$1495 = parseStatement$1076();
        if (matchKeyword$1011('else')) {
            lex$1001();
            alternate$1496 = parseStatement$1076();
        } else {
            alternate$1496 = null;
        }
        return delegate$964.createIfStatement(test$1494, consequent$1495, alternate$1496);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$1062() {
        var body$1497, test$1498, oldInIteration$1499;
        expectKeyword$1009('do');
        oldInIteration$1499 = state$969.inIteration;
        state$969.inIteration = true;
        body$1497 = parseStatement$1076();
        state$969.inIteration = oldInIteration$1499;
        expectKeyword$1009('while');
        expect$1008('(');
        test$1498 = parseExpression$1045();
        expect$1008(')');
        if (match$1010(';')) {
            lex$1001();
        }
        return delegate$964.createDoWhileStatement(body$1497, test$1498);
    }
    function parseWhileStatement$1063() {
        var test$1500, body$1501, oldInIteration$1502;
        expectKeyword$1009('while');
        expect$1008('(');
        test$1500 = parseExpression$1045();
        expect$1008(')');
        oldInIteration$1502 = state$969.inIteration;
        state$969.inIteration = true;
        body$1501 = parseStatement$1076();
        state$969.inIteration = oldInIteration$1502;
        return delegate$964.createWhileStatement(test$1500, body$1501);
    }
    function parseForVariableDeclaration$1064() {
        var token$1503 = lex$1001(), declarations$1504 = parseVariableDeclarationList$1050();
        return delegate$964.createVariableDeclaration(declarations$1504, token$1503.value);
    }
    function parseForStatement$1065(opts$1505) {
        var init$1506, test$1507, update$1508, left$1509, right$1510, body$1511, operator$1512, oldInIteration$1513;
        init$1506 = test$1507 = update$1508 = null;
        expectKeyword$1009('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$1012('each')) {
            throwError$1005({}, Messages$950.EachNotAllowed);
        }
        expect$1008('(');
        if (match$1010(';')) {
            lex$1001();
        } else {
            if (matchKeyword$1011('var') || matchKeyword$1011('let') || matchKeyword$1011('const')) {
                state$969.allowIn = false;
                init$1506 = parseForVariableDeclaration$1064();
                state$969.allowIn = true;
                if (init$1506.declarations.length === 1) {
                    if (matchKeyword$1011('in') || matchContextualKeyword$1012('of')) {
                        operator$1512 = lookahead$967;
                        if (!((operator$1512.value === 'in' || init$1506.kind !== 'var') && init$1506.declarations[0].init)) {
                            lex$1001();
                            left$1509 = init$1506;
                            right$1510 = parseExpression$1045();
                            init$1506 = null;
                        }
                    }
                }
            } else {
                state$969.allowIn = false;
                init$1506 = parseExpression$1045();
                state$969.allowIn = true;
                if (matchContextualKeyword$1012('of')) {
                    operator$1512 = lex$1001();
                    left$1509 = init$1506;
                    right$1510 = parseExpression$1045();
                    init$1506 = null;
                } else if (matchKeyword$1011('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$1016(init$1506)) {
                        throwError$1005({}, Messages$950.InvalidLHSInForIn);
                    }
                    operator$1512 = lex$1001();
                    left$1509 = init$1506;
                    right$1510 = parseExpression$1045();
                    init$1506 = null;
                }
            }
            if (typeof left$1509 === 'undefined') {
                expect$1008(';');
            }
        }
        if (typeof left$1509 === 'undefined') {
            if (!match$1010(';')) {
                test$1507 = parseExpression$1045();
            }
            expect$1008(';');
            if (!match$1010(')')) {
                update$1508 = parseExpression$1045();
            }
        }
        expect$1008(')');
        oldInIteration$1513 = state$969.inIteration;
        state$969.inIteration = true;
        if (!(opts$1505 !== undefined && opts$1505.ignoreBody)) {
            body$1511 = parseStatement$1076();
        }
        state$969.inIteration = oldInIteration$1513;
        if (typeof left$1509 === 'undefined') {
            return delegate$964.createForStatement(init$1506, test$1507, update$1508, body$1511);
        }
        if (operator$1512.value === 'in') {
            return delegate$964.createForInStatement(left$1509, right$1510, body$1511);
        }
        return delegate$964.createForOfStatement(left$1509, right$1510, body$1511);
    }
    // 12.7 The continue statement
    function parseContinueStatement$1066() {
        var label$1514 = null, key$1515;
        expectKeyword$1009('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$967.value.charCodeAt(0) === 59) {
            lex$1001();
            if (!state$969.inIteration) {
                throwError$1005({}, Messages$950.IllegalContinue);
            }
            return delegate$964.createContinueStatement(null);
        }
        if (peekLineTerminator$1004()) {
            if (!state$969.inIteration) {
                throwError$1005({}, Messages$950.IllegalContinue);
            }
            return delegate$964.createContinueStatement(null);
        }
        if (lookahead$967.type === Token$945.Identifier) {
            label$1514 = parseVariableIdentifier$1048();
            key$1515 = '$' + label$1514.name;
            if (!Object.prototype.hasOwnProperty.call(state$969.labelSet, key$1515)) {
                throwError$1005({}, Messages$950.UnknownLabel, label$1514.name);
            }
        }
        consumeSemicolon$1014();
        if (label$1514 === null && !state$969.inIteration) {
            throwError$1005({}, Messages$950.IllegalContinue);
        }
        return delegate$964.createContinueStatement(label$1514);
    }
    // 12.8 The break statement
    function parseBreakStatement$1067() {
        var label$1516 = null, key$1517;
        expectKeyword$1009('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$967.value.charCodeAt(0) === 59) {
            lex$1001();
            if (!(state$969.inIteration || state$969.inSwitch)) {
                throwError$1005({}, Messages$950.IllegalBreak);
            }
            return delegate$964.createBreakStatement(null);
        }
        if (peekLineTerminator$1004()) {
            if (!(state$969.inIteration || state$969.inSwitch)) {
                throwError$1005({}, Messages$950.IllegalBreak);
            }
            return delegate$964.createBreakStatement(null);
        }
        if (lookahead$967.type === Token$945.Identifier) {
            label$1516 = parseVariableIdentifier$1048();
            key$1517 = '$' + label$1516.name;
            if (!Object.prototype.hasOwnProperty.call(state$969.labelSet, key$1517)) {
                throwError$1005({}, Messages$950.UnknownLabel, label$1516.name);
            }
        }
        consumeSemicolon$1014();
        if (label$1516 === null && !(state$969.inIteration || state$969.inSwitch)) {
            throwError$1005({}, Messages$950.IllegalBreak);
        }
        return delegate$964.createBreakStatement(label$1516);
    }
    // 12.9 The return statement
    function parseReturnStatement$1068() {
        var argument$1518 = null;
        expectKeyword$1009('return');
        if (!state$969.inFunctionBody) {
            throwErrorTolerant$1006({}, Messages$950.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$978(String(lookahead$967.value).charCodeAt(0))) {
            argument$1518 = parseExpression$1045();
            consumeSemicolon$1014();
            return delegate$964.createReturnStatement(argument$1518);
        }
        if (peekLineTerminator$1004()) {
            return delegate$964.createReturnStatement(null);
        }
        if (!match$1010(';')) {
            if (!match$1010('}') && lookahead$967.type !== Token$945.EOF) {
                argument$1518 = parseExpression$1045();
            }
        }
        consumeSemicolon$1014();
        return delegate$964.createReturnStatement(argument$1518);
    }
    // 12.10 The with statement
    function parseWithStatement$1069() {
        var object$1519, body$1520;
        if (strict$955) {
            throwErrorTolerant$1006({}, Messages$950.StrictModeWith);
        }
        expectKeyword$1009('with');
        expect$1008('(');
        object$1519 = parseExpression$1045();
        expect$1008(')');
        body$1520 = parseStatement$1076();
        return delegate$964.createWithStatement(object$1519, body$1520);
    }
    // 12.10 The swith statement
    function parseSwitchCase$1070() {
        var test$1521, consequent$1522 = [], sourceElement$1523;
        if (matchKeyword$1011('default')) {
            lex$1001();
            test$1521 = null;
        } else {
            expectKeyword$1009('case');
            test$1521 = parseExpression$1045();
        }
        expect$1008(':');
        while (streamIndex$966 < length$963) {
            if (match$1010('}') || matchKeyword$1011('default') || matchKeyword$1011('case')) {
                break;
            }
            sourceElement$1523 = parseSourceElement$1091();
            if (typeof sourceElement$1523 === 'undefined') {
                break;
            }
            consequent$1522.push(sourceElement$1523);
        }
        return delegate$964.createSwitchCase(test$1521, consequent$1522);
    }
    function parseSwitchStatement$1071() {
        var discriminant$1524, cases$1525, clause$1526, oldInSwitch$1527, defaultFound$1528;
        expectKeyword$1009('switch');
        expect$1008('(');
        discriminant$1524 = parseExpression$1045();
        expect$1008(')');
        expect$1008('{');
        cases$1525 = [];
        if (match$1010('}')) {
            lex$1001();
            return delegate$964.createSwitchStatement(discriminant$1524, cases$1525);
        }
        oldInSwitch$1527 = state$969.inSwitch;
        state$969.inSwitch = true;
        defaultFound$1528 = false;
        while (streamIndex$966 < length$963) {
            if (match$1010('}')) {
                break;
            }
            clause$1526 = parseSwitchCase$1070();
            if (clause$1526.test === null) {
                if (defaultFound$1528) {
                    throwError$1005({}, Messages$950.MultipleDefaultsInSwitch);
                }
                defaultFound$1528 = true;
            }
            cases$1525.push(clause$1526);
        }
        state$969.inSwitch = oldInSwitch$1527;
        expect$1008('}');
        return delegate$964.createSwitchStatement(discriminant$1524, cases$1525);
    }
    // 12.13 The throw statement
    function parseThrowStatement$1072() {
        var argument$1529;
        expectKeyword$1009('throw');
        if (peekLineTerminator$1004()) {
            throwError$1005({}, Messages$950.NewlineAfterThrow);
        }
        argument$1529 = parseExpression$1045();
        consumeSemicolon$1014();
        return delegate$964.createThrowStatement(argument$1529);
    }
    // 12.14 The try statement
    function parseCatchClause$1073() {
        var param$1530, body$1531;
        expectKeyword$1009('catch');
        expect$1008('(');
        if (match$1010(')')) {
            throwUnexpected$1007(lookahead$967);
        }
        param$1530 = parseExpression$1045();
        // 12.14.1
        if (strict$955 && param$1530.type === Syntax$948.Identifier && isRestrictedWord$982(param$1530.name)) {
            throwErrorTolerant$1006({}, Messages$950.StrictCatchVariable);
        }
        expect$1008(')');
        body$1531 = parseBlock$1047();
        return delegate$964.createCatchClause(param$1530, body$1531);
    }
    function parseTryStatement$1074() {
        var block$1532, handlers$1533 = [], finalizer$1534 = null;
        expectKeyword$1009('try');
        block$1532 = parseBlock$1047();
        if (matchKeyword$1011('catch')) {
            handlers$1533.push(parseCatchClause$1073());
        }
        if (matchKeyword$1011('finally')) {
            lex$1001();
            finalizer$1534 = parseBlock$1047();
        }
        if (handlers$1533.length === 0 && !finalizer$1534) {
            throwError$1005({}, Messages$950.NoCatchOrFinally);
        }
        return delegate$964.createTryStatement(block$1532, [], handlers$1533, finalizer$1534);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$1075() {
        expectKeyword$1009('debugger');
        consumeSemicolon$1014();
        return delegate$964.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$1076() {
        var type$1535 = lookahead$967.type, expr$1536, labeledBody$1537, key$1538;
        if (type$1535 === Token$945.EOF) {
            throwUnexpected$1007(lookahead$967);
        }
        if (type$1535 === Token$945.Punctuator) {
            switch (lookahead$967.value) {
            case ';':
                return parseEmptyStatement$1059();
            case '{':
                return parseBlock$1047();
            case '(':
                return parseExpressionStatement$1060();
            default:
                break;
            }
        }
        if (type$1535 === Token$945.Keyword) {
            switch (lookahead$967.value) {
            case 'break':
                return parseBreakStatement$1067();
            case 'continue':
                return parseContinueStatement$1066();
            case 'debugger':
                return parseDebuggerStatement$1075();
            case 'do':
                return parseDoWhileStatement$1062();
            case 'for':
                return parseForStatement$1065();
            case 'function':
                return parseFunctionDeclaration$1082();
            case 'class':
                return parseClassDeclaration$1089();
            case 'if':
                return parseIfStatement$1061();
            case 'return':
                return parseReturnStatement$1068();
            case 'switch':
                return parseSwitchStatement$1071();
            case 'throw':
                return parseThrowStatement$1072();
            case 'try':
                return parseTryStatement$1074();
            case 'var':
                return parseVariableStatement$1051();
            case 'while':
                return parseWhileStatement$1063();
            case 'with':
                return parseWithStatement$1069();
            default:
                break;
            }
        }
        expr$1536 = parseExpression$1045();
        // 12.12 Labelled Statements
        if (expr$1536.type === Syntax$948.Identifier && match$1010(':')) {
            lex$1001();
            key$1538 = '$' + expr$1536.name;
            if (Object.prototype.hasOwnProperty.call(state$969.labelSet, key$1538)) {
                throwError$1005({}, Messages$950.Redeclaration, 'Label', expr$1536.name);
            }
            state$969.labelSet[key$1538] = true;
            labeledBody$1537 = parseStatement$1076();
            delete state$969.labelSet[key$1538];
            return delegate$964.createLabeledStatement(expr$1536, labeledBody$1537);
        }
        consumeSemicolon$1014();
        return delegate$964.createExpressionStatement(expr$1536);
    }
    // 13 Function Definition
    function parseConciseBody$1077() {
        if (match$1010('{')) {
            return parseFunctionSourceElements$1078();
        }
        return parseAssignmentExpression$1044();
    }
    function parseFunctionSourceElements$1078() {
        var sourceElement$1539, sourceElements$1540 = [], token$1541, directive$1542, firstRestricted$1543, oldLabelSet$1544, oldInIteration$1545, oldInSwitch$1546, oldInFunctionBody$1547, oldParenthesizedCount$1548;
        expect$1008('{');
        while (streamIndex$966 < length$963) {
            if (lookahead$967.type !== Token$945.StringLiteral) {
                break;
            }
            token$1541 = lookahead$967;
            sourceElement$1539 = parseSourceElement$1091();
            sourceElements$1540.push(sourceElement$1539);
            if (sourceElement$1539.expression.type !== Syntax$948.Literal) {
                // this is not directive
                break;
            }
            directive$1542 = token$1541.value;
            if (directive$1542 === 'use strict') {
                strict$955 = true;
                if (firstRestricted$1543) {
                    throwErrorTolerant$1006(firstRestricted$1543, Messages$950.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1543 && token$1541.octal) {
                    firstRestricted$1543 = token$1541;
                }
            }
        }
        oldLabelSet$1544 = state$969.labelSet;
        oldInIteration$1545 = state$969.inIteration;
        oldInSwitch$1546 = state$969.inSwitch;
        oldInFunctionBody$1547 = state$969.inFunctionBody;
        oldParenthesizedCount$1548 = state$969.parenthesizedCount;
        state$969.labelSet = {};
        state$969.inIteration = false;
        state$969.inSwitch = false;
        state$969.inFunctionBody = true;
        state$969.parenthesizedCount = 0;
        while (streamIndex$966 < length$963) {
            if (match$1010('}')) {
                break;
            }
            sourceElement$1539 = parseSourceElement$1091();
            if (typeof sourceElement$1539 === 'undefined') {
                break;
            }
            sourceElements$1540.push(sourceElement$1539);
        }
        expect$1008('}');
        state$969.labelSet = oldLabelSet$1544;
        state$969.inIteration = oldInIteration$1545;
        state$969.inSwitch = oldInSwitch$1546;
        state$969.inFunctionBody = oldInFunctionBody$1547;
        state$969.parenthesizedCount = oldParenthesizedCount$1548;
        return delegate$964.createBlockStatement(sourceElements$1540);
    }
    function validateParam$1079(options$1549, param$1550, name$1551) {
        var key$1552 = '$' + name$1551;
        if (strict$955) {
            if (isRestrictedWord$982(name$1551)) {
                options$1549.stricted = param$1550;
                options$1549.message = Messages$950.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1549.paramSet, key$1552)) {
                options$1549.stricted = param$1550;
                options$1549.message = Messages$950.StrictParamDupe;
            }
        } else if (!options$1549.firstRestricted) {
            if (isRestrictedWord$982(name$1551)) {
                options$1549.firstRestricted = param$1550;
                options$1549.message = Messages$950.StrictParamName;
            } else if (isStrictModeReservedWord$981(name$1551)) {
                options$1549.firstRestricted = param$1550;
                options$1549.message = Messages$950.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1549.paramSet, key$1552)) {
                options$1549.firstRestricted = param$1550;
                options$1549.message = Messages$950.StrictParamDupe;
            }
        }
        options$1549.paramSet[key$1552] = true;
    }
    function parseParam$1080(options$1553) {
        var token$1554, rest$1555, param$1556, def$1557;
        token$1554 = lookahead$967;
        if (token$1554.value === '...') {
            token$1554 = lex$1001();
            rest$1555 = true;
        }
        if (match$1010('[')) {
            param$1556 = parseArrayInitialiser$1017();
            reinterpretAsDestructuredParameter$1041(options$1553, param$1556);
        } else if (match$1010('{')) {
            if (rest$1555) {
                throwError$1005({}, Messages$950.ObjectPatternAsRestParameter);
            }
            param$1556 = parseObjectInitialiser$1022();
            reinterpretAsDestructuredParameter$1041(options$1553, param$1556);
        } else {
            param$1556 = parseVariableIdentifier$1048();
            validateParam$1079(options$1553, token$1554, token$1554.value);
            if (match$1010('=')) {
                if (rest$1555) {
                    throwErrorTolerant$1006(lookahead$967, Messages$950.DefaultRestParameter);
                }
                lex$1001();
                def$1557 = parseAssignmentExpression$1044();
                ++options$1553.defaultCount;
            }
        }
        if (rest$1555) {
            if (!match$1010(')')) {
                throwError$1005({}, Messages$950.ParameterAfterRestParameter);
            }
            options$1553.rest = param$1556;
            return false;
        }
        options$1553.params.push(param$1556);
        options$1553.defaults.push(def$1557);
        return !match$1010(')');
    }
    function parseParams$1081(firstRestricted$1558) {
        var options$1559;
        options$1559 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1558
        };
        expect$1008('(');
        if (!match$1010(')')) {
            options$1559.paramSet = {};
            while (streamIndex$966 < length$963) {
                if (!parseParam$1080(options$1559)) {
                    break;
                }
                expect$1008(',');
            }
        }
        expect$1008(')');
        if (options$1559.defaultCount === 0) {
            options$1559.defaults = [];
        }
        return options$1559;
    }
    function parseFunctionDeclaration$1082() {
        var id$1560, body$1561, token$1562, tmp$1563, firstRestricted$1564, message$1565, previousStrict$1566, previousYieldAllowed$1567, generator$1568, expression$1569;
        expectKeyword$1009('function');
        generator$1568 = false;
        if (match$1010('*')) {
            lex$1001();
            generator$1568 = true;
        }
        token$1562 = lookahead$967;
        id$1560 = parseVariableIdentifier$1048();
        if (strict$955) {
            if (isRestrictedWord$982(token$1562.value)) {
                throwErrorTolerant$1006(token$1562, Messages$950.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$982(token$1562.value)) {
                firstRestricted$1564 = token$1562;
                message$1565 = Messages$950.StrictFunctionName;
            } else if (isStrictModeReservedWord$981(token$1562.value)) {
                firstRestricted$1564 = token$1562;
                message$1565 = Messages$950.StrictReservedWord;
            }
        }
        tmp$1563 = parseParams$1081(firstRestricted$1564);
        firstRestricted$1564 = tmp$1563.firstRestricted;
        if (tmp$1563.message) {
            message$1565 = tmp$1563.message;
        }
        previousStrict$1566 = strict$955;
        previousYieldAllowed$1567 = state$969.yieldAllowed;
        state$969.yieldAllowed = generator$1568;
        // here we redo some work in order to set 'expression'
        expression$1569 = !match$1010('{');
        body$1561 = parseConciseBody$1077();
        if (strict$955 && firstRestricted$1564) {
            throwError$1005(firstRestricted$1564, message$1565);
        }
        if (strict$955 && tmp$1563.stricted) {
            throwErrorTolerant$1006(tmp$1563.stricted, message$1565);
        }
        if (state$969.yieldAllowed && !state$969.yieldFound) {
            throwErrorTolerant$1006({}, Messages$950.NoYieldInGenerator);
        }
        strict$955 = previousStrict$1566;
        state$969.yieldAllowed = previousYieldAllowed$1567;
        return delegate$964.createFunctionDeclaration(id$1560, tmp$1563.params, tmp$1563.defaults, body$1561, tmp$1563.rest, generator$1568, expression$1569);
    }
    function parseFunctionExpression$1083() {
        var token$1570, id$1571 = null, firstRestricted$1572, message$1573, tmp$1574, body$1575, previousStrict$1576, previousYieldAllowed$1577, generator$1578, expression$1579;
        expectKeyword$1009('function');
        generator$1578 = false;
        if (match$1010('*')) {
            lex$1001();
            generator$1578 = true;
        }
        if (!match$1010('(')) {
            token$1570 = lookahead$967;
            id$1571 = parseVariableIdentifier$1048();
            if (strict$955) {
                if (isRestrictedWord$982(token$1570.value)) {
                    throwErrorTolerant$1006(token$1570, Messages$950.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$982(token$1570.value)) {
                    firstRestricted$1572 = token$1570;
                    message$1573 = Messages$950.StrictFunctionName;
                } else if (isStrictModeReservedWord$981(token$1570.value)) {
                    firstRestricted$1572 = token$1570;
                    message$1573 = Messages$950.StrictReservedWord;
                }
            }
        }
        tmp$1574 = parseParams$1081(firstRestricted$1572);
        firstRestricted$1572 = tmp$1574.firstRestricted;
        if (tmp$1574.message) {
            message$1573 = tmp$1574.message;
        }
        previousStrict$1576 = strict$955;
        previousYieldAllowed$1577 = state$969.yieldAllowed;
        state$969.yieldAllowed = generator$1578;
        // here we redo some work in order to set 'expression'
        expression$1579 = !match$1010('{');
        body$1575 = parseConciseBody$1077();
        if (strict$955 && firstRestricted$1572) {
            throwError$1005(firstRestricted$1572, message$1573);
        }
        if (strict$955 && tmp$1574.stricted) {
            throwErrorTolerant$1006(tmp$1574.stricted, message$1573);
        }
        if (state$969.yieldAllowed && !state$969.yieldFound) {
            throwErrorTolerant$1006({}, Messages$950.NoYieldInGenerator);
        }
        strict$955 = previousStrict$1576;
        state$969.yieldAllowed = previousYieldAllowed$1577;
        return delegate$964.createFunctionExpression(id$1571, tmp$1574.params, tmp$1574.defaults, body$1575, tmp$1574.rest, generator$1578, expression$1579);
    }
    function parseYieldExpression$1084() {
        var delegateFlag$1580, expr$1581, previousYieldAllowed$1582;
        expectKeyword$1009('yield');
        if (!state$969.yieldAllowed) {
            throwErrorTolerant$1006({}, Messages$950.IllegalYield);
        }
        delegateFlag$1580 = false;
        if (match$1010('*')) {
            lex$1001();
            delegateFlag$1580 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1582 = state$969.yieldAllowed;
        state$969.yieldAllowed = false;
        expr$1581 = parseAssignmentExpression$1044();
        state$969.yieldAllowed = previousYieldAllowed$1582;
        state$969.yieldFound = true;
        return delegate$964.createYieldExpression(expr$1581, delegateFlag$1580);
    }
    // 14 Classes
    function parseMethodDefinition$1085(existingPropNames$1583) {
        var token$1584, key$1585, param$1586, propType$1587, isValidDuplicateProp$1588 = false;
        if (lookahead$967.value === 'static') {
            propType$1587 = ClassPropertyType$953.static;
            lex$1001();
        } else {
            propType$1587 = ClassPropertyType$953.prototype;
        }
        if (match$1010('*')) {
            lex$1001();
            return delegate$964.createMethodDefinition(propType$1587, '', parseObjectPropertyKey$1020(), parsePropertyMethodFunction$1019({ generator: true }));
        }
        token$1584 = lookahead$967;
        key$1585 = parseObjectPropertyKey$1020();
        if (token$1584.value === 'get' && !match$1010('(')) {
            key$1585 = parseObjectPropertyKey$1020();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1583[propType$1587].hasOwnProperty(key$1585.name)) {
                isValidDuplicateProp$1588 = existingPropNames$1583[propType$1587][key$1585.name].get === undefined && existingPropNames$1583[propType$1587][key$1585.name].data === undefined && existingPropNames$1583[propType$1587][key$1585.name].set !== undefined;
                if (!isValidDuplicateProp$1588) {
                    throwError$1005(key$1585, Messages$950.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1583[propType$1587][key$1585.name] = {};
            }
            existingPropNames$1583[propType$1587][key$1585.name].get = true;
            expect$1008('(');
            expect$1008(')');
            return delegate$964.createMethodDefinition(propType$1587, 'get', key$1585, parsePropertyFunction$1018({ generator: false }));
        }
        if (token$1584.value === 'set' && !match$1010('(')) {
            key$1585 = parseObjectPropertyKey$1020();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1583[propType$1587].hasOwnProperty(key$1585.name)) {
                isValidDuplicateProp$1588 = existingPropNames$1583[propType$1587][key$1585.name].set === undefined && existingPropNames$1583[propType$1587][key$1585.name].data === undefined && existingPropNames$1583[propType$1587][key$1585.name].get !== undefined;
                if (!isValidDuplicateProp$1588) {
                    throwError$1005(key$1585, Messages$950.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1583[propType$1587][key$1585.name] = {};
            }
            existingPropNames$1583[propType$1587][key$1585.name].set = true;
            expect$1008('(');
            token$1584 = lookahead$967;
            param$1586 = [parseVariableIdentifier$1048()];
            expect$1008(')');
            return delegate$964.createMethodDefinition(propType$1587, 'set', key$1585, parsePropertyFunction$1018({
                params: param$1586,
                generator: false,
                name: token$1584
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1583[propType$1587].hasOwnProperty(key$1585.name)) {
            throwError$1005(key$1585, Messages$950.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1583[propType$1587][key$1585.name] = {};
        }
        existingPropNames$1583[propType$1587][key$1585.name].data = true;
        return delegate$964.createMethodDefinition(propType$1587, '', key$1585, parsePropertyMethodFunction$1019({ generator: false }));
    }
    function parseClassElement$1086(existingProps$1589) {
        if (match$1010(';')) {
            lex$1001();
            return;
        }
        return parseMethodDefinition$1085(existingProps$1589);
    }
    function parseClassBody$1087() {
        var classElement$1590, classElements$1591 = [], existingProps$1592 = {};
        existingProps$1592[ClassPropertyType$953.static] = {};
        existingProps$1592[ClassPropertyType$953.prototype] = {};
        expect$1008('{');
        while (streamIndex$966 < length$963) {
            if (match$1010('}')) {
                break;
            }
            classElement$1590 = parseClassElement$1086(existingProps$1592);
            if (typeof classElement$1590 !== 'undefined') {
                classElements$1591.push(classElement$1590);
            }
        }
        expect$1008('}');
        return delegate$964.createClassBody(classElements$1591);
    }
    function parseClassExpression$1088() {
        var id$1593, previousYieldAllowed$1594, superClass$1595 = null;
        expectKeyword$1009('class');
        if (!matchKeyword$1011('extends') && !match$1010('{')) {
            id$1593 = parseVariableIdentifier$1048();
        }
        if (matchKeyword$1011('extends')) {
            expectKeyword$1009('extends');
            previousYieldAllowed$1594 = state$969.yieldAllowed;
            state$969.yieldAllowed = false;
            superClass$1595 = parseAssignmentExpression$1044();
            state$969.yieldAllowed = previousYieldAllowed$1594;
        }
        return delegate$964.createClassExpression(id$1593, superClass$1595, parseClassBody$1087());
    }
    function parseClassDeclaration$1089() {
        var id$1596, previousYieldAllowed$1597, superClass$1598 = null;
        expectKeyword$1009('class');
        id$1596 = parseVariableIdentifier$1048();
        if (matchKeyword$1011('extends')) {
            expectKeyword$1009('extends');
            previousYieldAllowed$1597 = state$969.yieldAllowed;
            state$969.yieldAllowed = false;
            superClass$1598 = parseAssignmentExpression$1044();
            state$969.yieldAllowed = previousYieldAllowed$1597;
        }
        return delegate$964.createClassDeclaration(id$1596, superClass$1598, parseClassBody$1087());
    }
    // 15 Program
    function matchModuleDeclaration$1090() {
        var id$1599;
        if (matchContextualKeyword$1012('module')) {
            id$1599 = lookahead2$1003();
            return id$1599.type === Token$945.StringLiteral || id$1599.type === Token$945.Identifier;
        }
        return false;
    }
    function parseSourceElement$1091() {
        if (lookahead$967.type === Token$945.Keyword) {
            switch (lookahead$967.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$1052(lookahead$967.value);
            case 'function':
                return parseFunctionDeclaration$1082();
            case 'export':
                return parseExportDeclaration$1056();
            case 'import':
                return parseImportDeclaration$1057();
            default:
                return parseStatement$1076();
            }
        }
        if (matchModuleDeclaration$1090()) {
            throwError$1005({}, Messages$950.NestedModule);
        }
        if (lookahead$967.type !== Token$945.EOF) {
            return parseStatement$1076();
        }
    }
    function parseProgramElement$1092() {
        if (lookahead$967.type === Token$945.Keyword) {
            switch (lookahead$967.value) {
            case 'export':
                return parseExportDeclaration$1056();
            case 'import':
                return parseImportDeclaration$1057();
            }
        }
        if (matchModuleDeclaration$1090()) {
            return parseModuleDeclaration$1053();
        }
        return parseSourceElement$1091();
    }
    function parseProgramElements$1093() {
        var sourceElement$1600, sourceElements$1601 = [], token$1602, directive$1603, firstRestricted$1604;
        while (streamIndex$966 < length$963) {
            token$1602 = lookahead$967;
            if (token$1602.type !== Token$945.StringLiteral) {
                break;
            }
            sourceElement$1600 = parseProgramElement$1092();
            sourceElements$1601.push(sourceElement$1600);
            if (sourceElement$1600.expression.type !== Syntax$948.Literal) {
                // this is not directive
                break;
            }
            directive$1603 = token$1602.value;
            if (directive$1603 === 'use strict') {
                strict$955 = true;
                if (firstRestricted$1604) {
                    throwErrorTolerant$1006(firstRestricted$1604, Messages$950.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1604 && token$1602.octal) {
                    firstRestricted$1604 = token$1602;
                }
            }
        }
        while (streamIndex$966 < length$963) {
            sourceElement$1600 = parseProgramElement$1092();
            if (typeof sourceElement$1600 === 'undefined') {
                break;
            }
            sourceElements$1601.push(sourceElement$1600);
        }
        return sourceElements$1601;
    }
    function parseModuleElement$1094() {
        return parseSourceElement$1091();
    }
    function parseModuleElements$1095() {
        var list$1605 = [], statement$1606;
        while (streamIndex$966 < length$963) {
            if (match$1010('}')) {
                break;
            }
            statement$1606 = parseModuleElement$1094();
            if (typeof statement$1606 === 'undefined') {
                break;
            }
            list$1605.push(statement$1606);
        }
        return list$1605;
    }
    function parseModuleBlock$1096() {
        var block$1607;
        expect$1008('{');
        block$1607 = parseModuleElements$1095();
        expect$1008('}');
        return delegate$964.createBlockStatement(block$1607);
    }
    function parseProgram$1097() {
        var body$1608;
        strict$955 = false;
        peek$1002();
        body$1608 = parseProgramElements$1093();
        return delegate$964.createProgram(body$1608);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1098(type$1609, value$1610, start$1611, end$1612, loc$1613) {
        assert$971(typeof start$1611 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$970.comments.length > 0) {
            if (extra$970.comments[extra$970.comments.length - 1].range[1] > start$1611) {
                return;
            }
        }
        extra$970.comments.push({
            type: type$1609,
            value: value$1610,
            range: [
                start$1611,
                end$1612
            ],
            loc: loc$1613
        });
    }
    function scanComment$1099() {
        var comment$1614, ch$1615, loc$1616, start$1617, blockComment$1618, lineComment$1619;
        comment$1614 = '';
        blockComment$1618 = false;
        lineComment$1619 = false;
        while (index$956 < length$963) {
            ch$1615 = source$954[index$956];
            if (lineComment$1619) {
                ch$1615 = source$954[index$956++];
                if (isLineTerminator$977(ch$1615.charCodeAt(0))) {
                    loc$1616.end = {
                        line: lineNumber$957,
                        column: index$956 - lineStart$958 - 1
                    };
                    lineComment$1619 = false;
                    addComment$1098('Line', comment$1614, start$1617, index$956 - 1, loc$1616);
                    if (ch$1615 === '\r' && source$954[index$956] === '\n') {
                        ++index$956;
                    }
                    ++lineNumber$957;
                    lineStart$958 = index$956;
                    comment$1614 = '';
                } else if (index$956 >= length$963) {
                    lineComment$1619 = false;
                    comment$1614 += ch$1615;
                    loc$1616.end = {
                        line: lineNumber$957,
                        column: length$963 - lineStart$958
                    };
                    addComment$1098('Line', comment$1614, start$1617, length$963, loc$1616);
                } else {
                    comment$1614 += ch$1615;
                }
            } else if (blockComment$1618) {
                if (isLineTerminator$977(ch$1615.charCodeAt(0))) {
                    if (ch$1615 === '\r' && source$954[index$956 + 1] === '\n') {
                        ++index$956;
                        comment$1614 += '\r\n';
                    } else {
                        comment$1614 += ch$1615;
                    }
                    ++lineNumber$957;
                    ++index$956;
                    lineStart$958 = index$956;
                    if (index$956 >= length$963) {
                        throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1615 = source$954[index$956++];
                    if (index$956 >= length$963) {
                        throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1614 += ch$1615;
                    if (ch$1615 === '*') {
                        ch$1615 = source$954[index$956];
                        if (ch$1615 === '/') {
                            comment$1614 = comment$1614.substr(0, comment$1614.length - 1);
                            blockComment$1618 = false;
                            ++index$956;
                            loc$1616.end = {
                                line: lineNumber$957,
                                column: index$956 - lineStart$958
                            };
                            addComment$1098('Block', comment$1614, start$1617, index$956, loc$1616);
                            comment$1614 = '';
                        }
                    }
                }
            } else if (ch$1615 === '/') {
                ch$1615 = source$954[index$956 + 1];
                if (ch$1615 === '/') {
                    loc$1616 = {
                        start: {
                            line: lineNumber$957,
                            column: index$956 - lineStart$958
                        }
                    };
                    start$1617 = index$956;
                    index$956 += 2;
                    lineComment$1619 = true;
                    if (index$956 >= length$963) {
                        loc$1616.end = {
                            line: lineNumber$957,
                            column: index$956 - lineStart$958
                        };
                        lineComment$1619 = false;
                        addComment$1098('Line', comment$1614, start$1617, index$956, loc$1616);
                    }
                } else if (ch$1615 === '*') {
                    start$1617 = index$956;
                    index$956 += 2;
                    blockComment$1618 = true;
                    loc$1616 = {
                        start: {
                            line: lineNumber$957,
                            column: index$956 - lineStart$958 - 2
                        }
                    };
                    if (index$956 >= length$963) {
                        throwError$1005({}, Messages$950.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$976(ch$1615.charCodeAt(0))) {
                ++index$956;
            } else if (isLineTerminator$977(ch$1615.charCodeAt(0))) {
                ++index$956;
                if (ch$1615 === '\r' && source$954[index$956] === '\n') {
                    ++index$956;
                }
                ++lineNumber$957;
                lineStart$958 = index$956;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1100() {
        var i$1620, entry$1621, comment$1622, comments$1623 = [];
        for (i$1620 = 0; i$1620 < extra$970.comments.length; ++i$1620) {
            entry$1621 = extra$970.comments[i$1620];
            comment$1622 = {
                type: entry$1621.type,
                value: entry$1621.value
            };
            if (extra$970.range) {
                comment$1622.range = entry$1621.range;
            }
            if (extra$970.loc) {
                comment$1622.loc = entry$1621.loc;
            }
            comments$1623.push(comment$1622);
        }
        extra$970.comments = comments$1623;
    }
    function collectToken$1101() {
        var start$1624, loc$1625, token$1626, range$1627, value$1628;
        skipComment$984();
        start$1624 = index$956;
        loc$1625 = {
            start: {
                line: lineNumber$957,
                column: index$956 - lineStart$958
            }
        };
        token$1626 = extra$970.advance();
        loc$1625.end = {
            line: lineNumber$957,
            column: index$956 - lineStart$958
        };
        if (token$1626.type !== Token$945.EOF) {
            range$1627 = [
                token$1626.range[0],
                token$1626.range[1]
            ];
            value$1628 = source$954.slice(token$1626.range[0], token$1626.range[1]);
            extra$970.tokens.push({
                type: TokenName$946[token$1626.type],
                value: value$1628,
                range: range$1627,
                loc: loc$1625
            });
        }
        return token$1626;
    }
    function collectRegex$1102() {
        var pos$1629, loc$1630, regex$1631, token$1632;
        skipComment$984();
        pos$1629 = index$956;
        loc$1630 = {
            start: {
                line: lineNumber$957,
                column: index$956 - lineStart$958
            }
        };
        regex$1631 = extra$970.scanRegExp();
        loc$1630.end = {
            line: lineNumber$957,
            column: index$956 - lineStart$958
        };
        if (!extra$970.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$970.tokens.length > 0) {
                token$1632 = extra$970.tokens[extra$970.tokens.length - 1];
                if (token$1632.range[0] === pos$1629 && token$1632.type === 'Punctuator') {
                    if (token$1632.value === '/' || token$1632.value === '/=') {
                        extra$970.tokens.pop();
                    }
                }
            }
            extra$970.tokens.push({
                type: 'RegularExpression',
                value: regex$1631.literal,
                range: [
                    pos$1629,
                    index$956
                ],
                loc: loc$1630
            });
        }
        return regex$1631;
    }
    function filterTokenLocation$1103() {
        var i$1633, entry$1634, token$1635, tokens$1636 = [];
        for (i$1633 = 0; i$1633 < extra$970.tokens.length; ++i$1633) {
            entry$1634 = extra$970.tokens[i$1633];
            token$1635 = {
                type: entry$1634.type,
                value: entry$1634.value
            };
            if (extra$970.range) {
                token$1635.range = entry$1634.range;
            }
            if (extra$970.loc) {
                token$1635.loc = entry$1634.loc;
            }
            tokens$1636.push(token$1635);
        }
        extra$970.tokens = tokens$1636;
    }
    function LocationMarker$1104() {
        var sm_index$1637 = lookahead$967 ? lookahead$967.sm_range[0] : 0;
        var sm_lineStart$1638 = lookahead$967 ? lookahead$967.sm_lineStart : 0;
        var sm_lineNumber$1639 = lookahead$967 ? lookahead$967.sm_lineNumber : 1;
        this.range = [
            sm_index$1637,
            sm_index$1637
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1639,
                column: sm_index$1637 - sm_lineStart$1638
            },
            end: {
                line: sm_lineNumber$1639,
                column: sm_index$1637 - sm_lineStart$1638
            }
        };
    }
    LocationMarker$1104.prototype = {
        constructor: LocationMarker$1104,
        end: function () {
            this.range[1] = sm_index$962;
            this.loc.end.line = sm_lineNumber$959;
            this.loc.end.column = sm_index$962 - sm_lineStart$960;
        },
        applyGroup: function (node$1640) {
            if (extra$970.range) {
                node$1640.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$970.loc) {
                node$1640.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1640 = delegate$964.postProcess(node$1640);
            }
        },
        apply: function (node$1641) {
            var nodeType$1642 = typeof node$1641;
            assert$971(nodeType$1642 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1642);
            if (extra$970.range) {
                node$1641.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$970.loc) {
                node$1641.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1641 = delegate$964.postProcess(node$1641);
            }
        }
    };
    function createLocationMarker$1105() {
        return new LocationMarker$1104();
    }
    function trackGroupExpression$1106() {
        var marker$1643, expr$1644;
        marker$1643 = createLocationMarker$1105();
        expect$1008('(');
        ++state$969.parenthesizedCount;
        expr$1644 = parseExpression$1045();
        expect$1008(')');
        marker$1643.end();
        marker$1643.applyGroup(expr$1644);
        return expr$1644;
    }
    function trackLeftHandSideExpression$1107() {
        var marker$1645, expr$1646;
        // skipComment();
        marker$1645 = createLocationMarker$1105();
        expr$1646 = matchKeyword$1011('new') ? parseNewExpression$1032() : parsePrimaryExpression$1026();
        while (match$1010('.') || match$1010('[') || lookahead$967.type === Token$945.Template) {
            if (match$1010('[')) {
                expr$1646 = delegate$964.createMemberExpression('[', expr$1646, parseComputedMember$1031());
                marker$1645.end();
                marker$1645.apply(expr$1646);
            } else if (match$1010('.')) {
                expr$1646 = delegate$964.createMemberExpression('.', expr$1646, parseNonComputedMember$1030());
                marker$1645.end();
                marker$1645.apply(expr$1646);
            } else {
                expr$1646 = delegate$964.createTaggedTemplateExpression(expr$1646, parseTemplateLiteral$1024());
                marker$1645.end();
                marker$1645.apply(expr$1646);
            }
        }
        return expr$1646;
    }
    function trackLeftHandSideExpressionAllowCall$1108() {
        var marker$1647, expr$1648, args$1649;
        // skipComment();
        marker$1647 = createLocationMarker$1105();
        expr$1648 = matchKeyword$1011('new') ? parseNewExpression$1032() : parsePrimaryExpression$1026();
        while (match$1010('.') || match$1010('[') || match$1010('(') || lookahead$967.type === Token$945.Template) {
            if (match$1010('(')) {
                args$1649 = parseArguments$1027();
                expr$1648 = delegate$964.createCallExpression(expr$1648, args$1649);
                marker$1647.end();
                marker$1647.apply(expr$1648);
            } else if (match$1010('[')) {
                expr$1648 = delegate$964.createMemberExpression('[', expr$1648, parseComputedMember$1031());
                marker$1647.end();
                marker$1647.apply(expr$1648);
            } else if (match$1010('.')) {
                expr$1648 = delegate$964.createMemberExpression('.', expr$1648, parseNonComputedMember$1030());
                marker$1647.end();
                marker$1647.apply(expr$1648);
            } else {
                expr$1648 = delegate$964.createTaggedTemplateExpression(expr$1648, parseTemplateLiteral$1024());
                marker$1647.end();
                marker$1647.apply(expr$1648);
            }
        }
        return expr$1648;
    }
    function filterGroup$1109(node$1650) {
        var n$1651, i$1652, entry$1653;
        n$1651 = Object.prototype.toString.apply(node$1650) === '[object Array]' ? [] : {};
        for (i$1652 in node$1650) {
            if (node$1650.hasOwnProperty(i$1652) && i$1652 !== 'groupRange' && i$1652 !== 'groupLoc') {
                entry$1653 = node$1650[i$1652];
                if (entry$1653 === null || typeof entry$1653 !== 'object' || entry$1653 instanceof RegExp) {
                    n$1651[i$1652] = entry$1653;
                } else {
                    n$1651[i$1652] = filterGroup$1109(entry$1653);
                }
            }
        }
        return n$1651;
    }
    function wrapTrackingFunction$1110(range$1654, loc$1655) {
        return function (parseFunction$1656) {
            function isBinary$1657(node$1659) {
                return node$1659.type === Syntax$948.LogicalExpression || node$1659.type === Syntax$948.BinaryExpression;
            }
            function visit$1658(node$1660) {
                var start$1661, end$1662;
                if (isBinary$1657(node$1660.left)) {
                    visit$1658(node$1660.left);
                }
                if (isBinary$1657(node$1660.right)) {
                    visit$1658(node$1660.right);
                }
                if (range$1654) {
                    if (node$1660.left.groupRange || node$1660.right.groupRange) {
                        start$1661 = node$1660.left.groupRange ? node$1660.left.groupRange[0] : node$1660.left.range[0];
                        end$1662 = node$1660.right.groupRange ? node$1660.right.groupRange[1] : node$1660.right.range[1];
                        node$1660.range = [
                            start$1661,
                            end$1662
                        ];
                    } else if (typeof node$1660.range === 'undefined') {
                        start$1661 = node$1660.left.range[0];
                        end$1662 = node$1660.right.range[1];
                        node$1660.range = [
                            start$1661,
                            end$1662
                        ];
                    }
                }
                if (loc$1655) {
                    if (node$1660.left.groupLoc || node$1660.right.groupLoc) {
                        start$1661 = node$1660.left.groupLoc ? node$1660.left.groupLoc.start : node$1660.left.loc.start;
                        end$1662 = node$1660.right.groupLoc ? node$1660.right.groupLoc.end : node$1660.right.loc.end;
                        node$1660.loc = {
                            start: start$1661,
                            end: end$1662
                        };
                        node$1660 = delegate$964.postProcess(node$1660);
                    } else if (typeof node$1660.loc === 'undefined') {
                        node$1660.loc = {
                            start: node$1660.left.loc.start,
                            end: node$1660.right.loc.end
                        };
                        node$1660 = delegate$964.postProcess(node$1660);
                    }
                }
            }
            return function () {
                var marker$1663, node$1664, curr$1665 = lookahead$967;
                marker$1663 = createLocationMarker$1105();
                node$1664 = parseFunction$1656.apply(null, arguments);
                marker$1663.end();
                if (node$1664.type !== Syntax$948.Program) {
                    if (curr$1665.leadingComments) {
                        node$1664.leadingComments = curr$1665.leadingComments;
                    }
                    if (curr$1665.trailingComments) {
                        node$1664.trailingComments = curr$1665.trailingComments;
                    }
                }
                if (range$1654 && typeof node$1664.range === 'undefined') {
                    marker$1663.apply(node$1664);
                }
                if (loc$1655 && typeof node$1664.loc === 'undefined') {
                    marker$1663.apply(node$1664);
                }
                if (isBinary$1657(node$1664)) {
                    visit$1658(node$1664);
                }
                return node$1664;
            };
        };
    }
    function patch$1111() {
        var wrapTracking$1666;
        if (extra$970.comments) {
            extra$970.skipComment = skipComment$984;
            skipComment$984 = scanComment$1099;
        }
        if (extra$970.range || extra$970.loc) {
            extra$970.parseGroupExpression = parseGroupExpression$1025;
            extra$970.parseLeftHandSideExpression = parseLeftHandSideExpression$1034;
            extra$970.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$1033;
            parseGroupExpression$1025 = trackGroupExpression$1106;
            parseLeftHandSideExpression$1034 = trackLeftHandSideExpression$1107;
            parseLeftHandSideExpressionAllowCall$1033 = trackLeftHandSideExpressionAllowCall$1108;
            wrapTracking$1666 = wrapTrackingFunction$1110(extra$970.range, extra$970.loc);
            extra$970.parseArrayInitialiser = parseArrayInitialiser$1017;
            extra$970.parseAssignmentExpression = parseAssignmentExpression$1044;
            extra$970.parseBinaryExpression = parseBinaryExpression$1038;
            extra$970.parseBlock = parseBlock$1047;
            extra$970.parseFunctionSourceElements = parseFunctionSourceElements$1078;
            extra$970.parseCatchClause = parseCatchClause$1073;
            extra$970.parseComputedMember = parseComputedMember$1031;
            extra$970.parseConditionalExpression = parseConditionalExpression$1039;
            extra$970.parseConstLetDeclaration = parseConstLetDeclaration$1052;
            extra$970.parseExportBatchSpecifier = parseExportBatchSpecifier$1054;
            extra$970.parseExportDeclaration = parseExportDeclaration$1056;
            extra$970.parseExportSpecifier = parseExportSpecifier$1055;
            extra$970.parseExpression = parseExpression$1045;
            extra$970.parseForVariableDeclaration = parseForVariableDeclaration$1064;
            extra$970.parseFunctionDeclaration = parseFunctionDeclaration$1082;
            extra$970.parseFunctionExpression = parseFunctionExpression$1083;
            extra$970.parseParams = parseParams$1081;
            extra$970.parseImportDeclaration = parseImportDeclaration$1057;
            extra$970.parseImportSpecifier = parseImportSpecifier$1058;
            extra$970.parseModuleDeclaration = parseModuleDeclaration$1053;
            extra$970.parseModuleBlock = parseModuleBlock$1096;
            extra$970.parseNewExpression = parseNewExpression$1032;
            extra$970.parseNonComputedProperty = parseNonComputedProperty$1029;
            extra$970.parseObjectInitialiser = parseObjectInitialiser$1022;
            extra$970.parseObjectProperty = parseObjectProperty$1021;
            extra$970.parseObjectPropertyKey = parseObjectPropertyKey$1020;
            extra$970.parsePostfixExpression = parsePostfixExpression$1035;
            extra$970.parsePrimaryExpression = parsePrimaryExpression$1026;
            extra$970.parseProgram = parseProgram$1097;
            extra$970.parsePropertyFunction = parsePropertyFunction$1018;
            extra$970.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$1028;
            extra$970.parseTemplateElement = parseTemplateElement$1023;
            extra$970.parseTemplateLiteral = parseTemplateLiteral$1024;
            extra$970.parseStatement = parseStatement$1076;
            extra$970.parseSwitchCase = parseSwitchCase$1070;
            extra$970.parseUnaryExpression = parseUnaryExpression$1036;
            extra$970.parseVariableDeclaration = parseVariableDeclaration$1049;
            extra$970.parseVariableIdentifier = parseVariableIdentifier$1048;
            extra$970.parseMethodDefinition = parseMethodDefinition$1085;
            extra$970.parseClassDeclaration = parseClassDeclaration$1089;
            extra$970.parseClassExpression = parseClassExpression$1088;
            extra$970.parseClassBody = parseClassBody$1087;
            parseArrayInitialiser$1017 = wrapTracking$1666(extra$970.parseArrayInitialiser);
            parseAssignmentExpression$1044 = wrapTracking$1666(extra$970.parseAssignmentExpression);
            parseBinaryExpression$1038 = wrapTracking$1666(extra$970.parseBinaryExpression);
            parseBlock$1047 = wrapTracking$1666(extra$970.parseBlock);
            parseFunctionSourceElements$1078 = wrapTracking$1666(extra$970.parseFunctionSourceElements);
            parseCatchClause$1073 = wrapTracking$1666(extra$970.parseCatchClause);
            parseComputedMember$1031 = wrapTracking$1666(extra$970.parseComputedMember);
            parseConditionalExpression$1039 = wrapTracking$1666(extra$970.parseConditionalExpression);
            parseConstLetDeclaration$1052 = wrapTracking$1666(extra$970.parseConstLetDeclaration);
            parseExportBatchSpecifier$1054 = wrapTracking$1666(parseExportBatchSpecifier$1054);
            parseExportDeclaration$1056 = wrapTracking$1666(parseExportDeclaration$1056);
            parseExportSpecifier$1055 = wrapTracking$1666(parseExportSpecifier$1055);
            parseExpression$1045 = wrapTracking$1666(extra$970.parseExpression);
            parseForVariableDeclaration$1064 = wrapTracking$1666(extra$970.parseForVariableDeclaration);
            parseFunctionDeclaration$1082 = wrapTracking$1666(extra$970.parseFunctionDeclaration);
            parseFunctionExpression$1083 = wrapTracking$1666(extra$970.parseFunctionExpression);
            parseParams$1081 = wrapTracking$1666(extra$970.parseParams);
            parseImportDeclaration$1057 = wrapTracking$1666(extra$970.parseImportDeclaration);
            parseImportSpecifier$1058 = wrapTracking$1666(extra$970.parseImportSpecifier);
            parseModuleDeclaration$1053 = wrapTracking$1666(extra$970.parseModuleDeclaration);
            parseModuleBlock$1096 = wrapTracking$1666(extra$970.parseModuleBlock);
            parseLeftHandSideExpression$1034 = wrapTracking$1666(parseLeftHandSideExpression$1034);
            parseNewExpression$1032 = wrapTracking$1666(extra$970.parseNewExpression);
            parseNonComputedProperty$1029 = wrapTracking$1666(extra$970.parseNonComputedProperty);
            parseObjectInitialiser$1022 = wrapTracking$1666(extra$970.parseObjectInitialiser);
            parseObjectProperty$1021 = wrapTracking$1666(extra$970.parseObjectProperty);
            parseObjectPropertyKey$1020 = wrapTracking$1666(extra$970.parseObjectPropertyKey);
            parsePostfixExpression$1035 = wrapTracking$1666(extra$970.parsePostfixExpression);
            parsePrimaryExpression$1026 = wrapTracking$1666(extra$970.parsePrimaryExpression);
            parseProgram$1097 = wrapTracking$1666(extra$970.parseProgram);
            parsePropertyFunction$1018 = wrapTracking$1666(extra$970.parsePropertyFunction);
            parseTemplateElement$1023 = wrapTracking$1666(extra$970.parseTemplateElement);
            parseTemplateLiteral$1024 = wrapTracking$1666(extra$970.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$1028 = wrapTracking$1666(extra$970.parseSpreadOrAssignmentExpression);
            parseStatement$1076 = wrapTracking$1666(extra$970.parseStatement);
            parseSwitchCase$1070 = wrapTracking$1666(extra$970.parseSwitchCase);
            parseUnaryExpression$1036 = wrapTracking$1666(extra$970.parseUnaryExpression);
            parseVariableDeclaration$1049 = wrapTracking$1666(extra$970.parseVariableDeclaration);
            parseVariableIdentifier$1048 = wrapTracking$1666(extra$970.parseVariableIdentifier);
            parseMethodDefinition$1085 = wrapTracking$1666(extra$970.parseMethodDefinition);
            parseClassDeclaration$1089 = wrapTracking$1666(extra$970.parseClassDeclaration);
            parseClassExpression$1088 = wrapTracking$1666(extra$970.parseClassExpression);
            parseClassBody$1087 = wrapTracking$1666(extra$970.parseClassBody);
        }
        if (typeof extra$970.tokens !== 'undefined') {
            extra$970.advance = advance$1000;
            extra$970.scanRegExp = scanRegExp$997;
            advance$1000 = collectToken$1101;
            scanRegExp$997 = collectRegex$1102;
        }
    }
    function unpatch$1112() {
        if (typeof extra$970.skipComment === 'function') {
            skipComment$984 = extra$970.skipComment;
        }
        if (extra$970.range || extra$970.loc) {
            parseArrayInitialiser$1017 = extra$970.parseArrayInitialiser;
            parseAssignmentExpression$1044 = extra$970.parseAssignmentExpression;
            parseBinaryExpression$1038 = extra$970.parseBinaryExpression;
            parseBlock$1047 = extra$970.parseBlock;
            parseFunctionSourceElements$1078 = extra$970.parseFunctionSourceElements;
            parseCatchClause$1073 = extra$970.parseCatchClause;
            parseComputedMember$1031 = extra$970.parseComputedMember;
            parseConditionalExpression$1039 = extra$970.parseConditionalExpression;
            parseConstLetDeclaration$1052 = extra$970.parseConstLetDeclaration;
            parseExportBatchSpecifier$1054 = extra$970.parseExportBatchSpecifier;
            parseExportDeclaration$1056 = extra$970.parseExportDeclaration;
            parseExportSpecifier$1055 = extra$970.parseExportSpecifier;
            parseExpression$1045 = extra$970.parseExpression;
            parseForVariableDeclaration$1064 = extra$970.parseForVariableDeclaration;
            parseFunctionDeclaration$1082 = extra$970.parseFunctionDeclaration;
            parseFunctionExpression$1083 = extra$970.parseFunctionExpression;
            parseImportDeclaration$1057 = extra$970.parseImportDeclaration;
            parseImportSpecifier$1058 = extra$970.parseImportSpecifier;
            parseGroupExpression$1025 = extra$970.parseGroupExpression;
            parseLeftHandSideExpression$1034 = extra$970.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$1033 = extra$970.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$1053 = extra$970.parseModuleDeclaration;
            parseModuleBlock$1096 = extra$970.parseModuleBlock;
            parseNewExpression$1032 = extra$970.parseNewExpression;
            parseNonComputedProperty$1029 = extra$970.parseNonComputedProperty;
            parseObjectInitialiser$1022 = extra$970.parseObjectInitialiser;
            parseObjectProperty$1021 = extra$970.parseObjectProperty;
            parseObjectPropertyKey$1020 = extra$970.parseObjectPropertyKey;
            parsePostfixExpression$1035 = extra$970.parsePostfixExpression;
            parsePrimaryExpression$1026 = extra$970.parsePrimaryExpression;
            parseProgram$1097 = extra$970.parseProgram;
            parsePropertyFunction$1018 = extra$970.parsePropertyFunction;
            parseTemplateElement$1023 = extra$970.parseTemplateElement;
            parseTemplateLiteral$1024 = extra$970.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$1028 = extra$970.parseSpreadOrAssignmentExpression;
            parseStatement$1076 = extra$970.parseStatement;
            parseSwitchCase$1070 = extra$970.parseSwitchCase;
            parseUnaryExpression$1036 = extra$970.parseUnaryExpression;
            parseVariableDeclaration$1049 = extra$970.parseVariableDeclaration;
            parseVariableIdentifier$1048 = extra$970.parseVariableIdentifier;
            parseMethodDefinition$1085 = extra$970.parseMethodDefinition;
            parseClassDeclaration$1089 = extra$970.parseClassDeclaration;
            parseClassExpression$1088 = extra$970.parseClassExpression;
            parseClassBody$1087 = extra$970.parseClassBody;
        }
        if (typeof extra$970.scanRegExp === 'function') {
            advance$1000 = extra$970.advance;
            scanRegExp$997 = extra$970.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1113(object$1667, properties$1668) {
        var entry$1669, result$1670 = {};
        for (entry$1669 in object$1667) {
            if (object$1667.hasOwnProperty(entry$1669)) {
                result$1670[entry$1669] = object$1667[entry$1669];
            }
        }
        for (entry$1669 in properties$1668) {
            if (properties$1668.hasOwnProperty(entry$1669)) {
                result$1670[entry$1669] = properties$1668[entry$1669];
            }
        }
        return result$1670;
    }
    function tokenize$1114(code$1671, options$1672) {
        var toString$1673, token$1674, tokens$1675;
        toString$1673 = String;
        if (typeof code$1671 !== 'string' && !(code$1671 instanceof String)) {
            code$1671 = toString$1673(code$1671);
        }
        delegate$964 = SyntaxTreeDelegate$952;
        source$954 = code$1671;
        index$956 = 0;
        lineNumber$957 = source$954.length > 0 ? 1 : 0;
        lineStart$958 = 0;
        length$963 = source$954.length;
        lookahead$967 = null;
        state$969 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$970 = {};
        // Options matching.
        options$1672 = options$1672 || {};
        // Of course we collect tokens here.
        options$1672.tokens = true;
        extra$970.tokens = [];
        extra$970.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$970.openParenToken = -1;
        extra$970.openCurlyToken = -1;
        extra$970.range = typeof options$1672.range === 'boolean' && options$1672.range;
        extra$970.loc = typeof options$1672.loc === 'boolean' && options$1672.loc;
        if (typeof options$1672.comment === 'boolean' && options$1672.comment) {
            extra$970.comments = [];
        }
        if (typeof options$1672.tolerant === 'boolean' && options$1672.tolerant) {
            extra$970.errors = [];
        }
        if (length$963 > 0) {
            if (typeof source$954[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1671 instanceof String) {
                    source$954 = code$1671.valueOf();
                }
            }
        }
        patch$1111();
        try {
            peek$1002();
            if (lookahead$967.type === Token$945.EOF) {
                return extra$970.tokens;
            }
            token$1674 = lex$1001();
            while (lookahead$967.type !== Token$945.EOF) {
                try {
                    token$1674 = lex$1001();
                } catch (lexError$1676) {
                    token$1674 = lookahead$967;
                    if (extra$970.errors) {
                        extra$970.errors.push(lexError$1676);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1676;
                    }
                }
            }
            filterTokenLocation$1103();
            tokens$1675 = extra$970.tokens;
            if (typeof extra$970.comments !== 'undefined') {
                filterCommentLocation$1100();
                tokens$1675.comments = extra$970.comments;
            }
            if (typeof extra$970.errors !== 'undefined') {
                tokens$1675.errors = extra$970.errors;
            }
        } catch (e$1677) {
            throw e$1677;
        } finally {
            unpatch$1112();
            extra$970 = {};
        }
        return tokens$1675;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1115(toks$1678, start$1679, inExprDelim$1680, parentIsBlock$1681) {
        var assignOps$1682 = [
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
        var binaryOps$1683 = [
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
        var unaryOps$1684 = [
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
        function back$1685(n$1686) {
            var idx$1687 = toks$1678.length - n$1686 > 0 ? toks$1678.length - n$1686 : 0;
            return toks$1678[idx$1687];
        }
        if (inExprDelim$1680 && toks$1678.length - (start$1679 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1685(start$1679 + 2).value === ':' && parentIsBlock$1681) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$972(back$1685(start$1679 + 2).value, unaryOps$1684.concat(binaryOps$1683).concat(assignOps$1682))) {
            // ... + {...}
            return false;
        } else if (back$1685(start$1679 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1688 = typeof back$1685(start$1679 + 1).startLineNumber !== 'undefined' ? back$1685(start$1679 + 1).startLineNumber : back$1685(start$1679 + 1).lineNumber;
            if (back$1685(start$1679 + 2).lineNumber !== currLineNumber$1688) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$972(back$1685(start$1679 + 2).value, [
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
    function readToken$1116(toks$1689, inExprDelim$1690, parentIsBlock$1691) {
        var delimiters$1692 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1693 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1694 = toks$1689.length - 1;
        var comments$1695, commentsLen$1696 = extra$970.comments.length;
        function back$1697(n$1701) {
            var idx$1702 = toks$1689.length - n$1701 > 0 ? toks$1689.length - n$1701 : 0;
            return toks$1689[idx$1702];
        }
        function attachComments$1698(token$1703) {
            if (comments$1695) {
                token$1703.leadingComments = comments$1695;
            }
            return token$1703;
        }
        function _advance$1699() {
            return attachComments$1698(advance$1000());
        }
        function _scanRegExp$1700() {
            return attachComments$1698(scanRegExp$997());
        }
        skipComment$984();
        if (extra$970.comments.length > commentsLen$1696) {
            comments$1695 = extra$970.comments.slice(commentsLen$1696);
        }
        if (isIn$972(source$954[index$956], delimiters$1692)) {
            return attachComments$1698(readDelim$1117(toks$1689, inExprDelim$1690, parentIsBlock$1691));
        }
        if (source$954[index$956] === '/') {
            var prev$1704 = back$1697(1);
            if (prev$1704) {
                if (prev$1704.value === '()') {
                    if (isIn$972(back$1697(2).value, parenIdents$1693)) {
                        // ... if (...) / ...
                        return _scanRegExp$1700();
                    }
                    // ... (...) / ...
                    return _advance$1699();
                }
                if (prev$1704.value === '{}') {
                    if (blockAllowed$1115(toks$1689, 0, inExprDelim$1690, parentIsBlock$1691)) {
                        if (back$1697(2).value === '()') {
                            // named function
                            if (back$1697(4).value === 'function') {
                                if (!blockAllowed$1115(toks$1689, 3, inExprDelim$1690, parentIsBlock$1691)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1699();
                                }
                                if (toks$1689.length - 5 <= 0 && inExprDelim$1690) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1699();
                                }
                            }
                            // unnamed function
                            if (back$1697(3).value === 'function') {
                                if (!blockAllowed$1115(toks$1689, 2, inExprDelim$1690, parentIsBlock$1691)) {
                                    // new function (...) {...} / ...
                                    return _advance$1699();
                                }
                                if (toks$1689.length - 4 <= 0 && inExprDelim$1690) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1699();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1700();
                    } else {
                        // ... + {...} / ...
                        return _advance$1699();
                    }
                }
                if (prev$1704.type === Token$945.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1700();
                }
                if (isKeyword$983(prev$1704.value)) {
                    // typeof /...
                    return _scanRegExp$1700();
                }
                return _advance$1699();
            }
            return _scanRegExp$1700();
        }
        return _advance$1699();
    }
    function readDelim$1117(toks$1705, inExprDelim$1706, parentIsBlock$1707) {
        var startDelim$1708 = advance$1000(), matchDelim$1709 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1710 = [];
        var delimiters$1711 = [
                '(',
                '{',
                '['
            ];
        assert$971(delimiters$1711.indexOf(startDelim$1708.value) !== -1, 'Need to begin at the delimiter');
        var token$1712 = startDelim$1708;
        var startLineNumber$1713 = token$1712.lineNumber;
        var startLineStart$1714 = token$1712.lineStart;
        var startRange$1715 = token$1712.range;
        var delimToken$1716 = {};
        delimToken$1716.type = Token$945.Delimiter;
        delimToken$1716.value = startDelim$1708.value + matchDelim$1709[startDelim$1708.value];
        delimToken$1716.startLineNumber = startLineNumber$1713;
        delimToken$1716.startLineStart = startLineStart$1714;
        delimToken$1716.startRange = startRange$1715;
        var delimIsBlock$1717 = false;
        if (startDelim$1708.value === '{') {
            delimIsBlock$1717 = blockAllowed$1115(toks$1705.concat(delimToken$1716), 0, inExprDelim$1706, parentIsBlock$1707);
        }
        while (index$956 <= length$963) {
            token$1712 = readToken$1116(inner$1710, startDelim$1708.value === '(' || startDelim$1708.value === '[', delimIsBlock$1717);
            if (token$1712.type === Token$945.Punctuator && token$1712.value === matchDelim$1709[startDelim$1708.value]) {
                if (token$1712.leadingComments) {
                    delimToken$1716.trailingComments = token$1712.leadingComments;
                }
                break;
            } else if (token$1712.type === Token$945.EOF) {
                throwError$1005({}, Messages$950.UnexpectedEOS);
            } else {
                inner$1710.push(token$1712);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$956 >= length$963 && matchDelim$1709[startDelim$1708.value] !== source$954[length$963 - 1]) {
            throwError$1005({}, Messages$950.UnexpectedEOS);
        }
        var endLineNumber$1718 = token$1712.lineNumber;
        var endLineStart$1719 = token$1712.lineStart;
        var endRange$1720 = token$1712.range;
        delimToken$1716.inner = inner$1710;
        delimToken$1716.endLineNumber = endLineNumber$1718;
        delimToken$1716.endLineStart = endLineStart$1719;
        delimToken$1716.endRange = endRange$1720;
        return delimToken$1716;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$1118(code$1721) {
        var token$1722, tokenTree$1723 = [];
        extra$970 = {};
        extra$970.comments = [];
        patch$1111();
        source$954 = code$1721;
        index$956 = 0;
        lineNumber$957 = source$954.length > 0 ? 1 : 0;
        lineStart$958 = 0;
        length$963 = source$954.length;
        state$969 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$956 < length$963) {
            tokenTree$1723.push(readToken$1116(tokenTree$1723, false, false));
        }
        var last$1724 = tokenTree$1723[tokenTree$1723.length - 1];
        if (last$1724 && last$1724.type !== Token$945.EOF) {
            tokenTree$1723.push({
                type: Token$945.EOF,
                value: '',
                lineNumber: last$1724.lineNumber,
                lineStart: last$1724.lineStart,
                range: [
                    index$956,
                    index$956
                ]
            });
        }
        return expander$944.tokensToSyntax(tokenTree$1723);
    }
    function parse$1119(code$1725, options$1726) {
        var program$1727, toString$1728;
        extra$970 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1725)) {
            tokenStream$965 = code$1725;
            length$963 = tokenStream$965.length;
            lineNumber$957 = tokenStream$965.length > 0 ? 1 : 0;
            source$954 = undefined;
        } else {
            toString$1728 = String;
            if (typeof code$1725 !== 'string' && !(code$1725 instanceof String)) {
                code$1725 = toString$1728(code$1725);
            }
            source$954 = code$1725;
            length$963 = source$954.length;
            lineNumber$957 = source$954.length > 0 ? 1 : 0;
        }
        delegate$964 = SyntaxTreeDelegate$952;
        streamIndex$966 = -1;
        index$956 = 0;
        lineStart$958 = 0;
        sm_lineStart$960 = 0;
        sm_lineNumber$959 = lineNumber$957;
        sm_index$962 = 0;
        sm_range$961 = [
            0,
            0
        ];
        lookahead$967 = null;
        state$969 = {
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
        if (typeof options$1726 !== 'undefined') {
            extra$970.range = typeof options$1726.range === 'boolean' && options$1726.range;
            extra$970.loc = typeof options$1726.loc === 'boolean' && options$1726.loc;
            if (extra$970.loc && options$1726.source !== null && options$1726.source !== undefined) {
                delegate$964 = extend$1113(delegate$964, {
                    'postProcess': function (node$1729) {
                        node$1729.loc.source = toString$1728(options$1726.source);
                        return node$1729;
                    }
                });
            }
            if (typeof options$1726.tokens === 'boolean' && options$1726.tokens) {
                extra$970.tokens = [];
            }
            if (typeof options$1726.comment === 'boolean' && options$1726.comment) {
                extra$970.comments = [];
            }
            if (typeof options$1726.tolerant === 'boolean' && options$1726.tolerant) {
                extra$970.errors = [];
            }
        }
        if (length$963 > 0) {
            if (source$954 && typeof source$954[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1725 instanceof String) {
                    source$954 = code$1725.valueOf();
                }
            }
        }
        extra$970 = { loc: true };
        patch$1111();
        try {
            program$1727 = parseProgram$1097();
            if (typeof extra$970.comments !== 'undefined') {
                filterCommentLocation$1100();
                program$1727.comments = extra$970.comments;
            }
            if (typeof extra$970.tokens !== 'undefined') {
                filterTokenLocation$1103();
                program$1727.tokens = extra$970.tokens;
            }
            if (typeof extra$970.errors !== 'undefined') {
                program$1727.errors = extra$970.errors;
            }
            if (extra$970.range || extra$970.loc) {
                program$1727.body = filterGroup$1109(program$1727.body);
            }
        } catch (e$1730) {
            throw e$1730;
        } finally {
            unpatch$1112();
            extra$970 = {};
        }
        return program$1727;
    }
    exports$943.tokenize = tokenize$1114;
    exports$943.read = read$1118;
    exports$943.Token = Token$945;
    exports$943.parse = parse$1119;
    // Deep copy.
    exports$943.Syntax = function () {
        var name$1731, types$1732 = {};
        if (typeof Object.create === 'function') {
            types$1732 = Object.create(null);
        }
        for (name$1731 in Syntax$948) {
            if (Syntax$948.hasOwnProperty(name$1731)) {
                types$1732[name$1731] = Syntax$948[name$1731];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1732);
        }
        return types$1732;
    }();
}));
//# sourceMappingURL=parser.js.map