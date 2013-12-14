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
(function (root$939, factory$940) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$940);
    } else if (typeof exports !== 'undefined') {
        factory$940(exports, require('./expander'));
    } else {
        factory$940(root$939.esprima = {});
    }
}(this, function (exports$941, expander$942) {
    'use strict';
    var Token$943, TokenName$944, FnExprTokens$945, Syntax$946, PropertyKind$947, Messages$948, Regex$949, SyntaxTreeDelegate$950, ClassPropertyType$951, source$952, strict$953, index$954, lineNumber$955, lineStart$956, sm_lineNumber$957, sm_lineStart$958, sm_range$959, sm_index$960, length$961, delegate$962, tokenStream$963, streamIndex$964, lookahead$965, lookaheadIndex$966, state$967, extra$968;
    Token$943 = {
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
    TokenName$944 = {};
    TokenName$944[Token$943.BooleanLiteral] = 'Boolean';
    TokenName$944[Token$943.EOF] = '<end>';
    TokenName$944[Token$943.Identifier] = 'Identifier';
    TokenName$944[Token$943.Keyword] = 'Keyword';
    TokenName$944[Token$943.NullLiteral] = 'Null';
    TokenName$944[Token$943.NumericLiteral] = 'Numeric';
    TokenName$944[Token$943.Punctuator] = 'Punctuator';
    TokenName$944[Token$943.StringLiteral] = 'String';
    TokenName$944[Token$943.RegularExpression] = 'RegularExpression';
    TokenName$944[Token$943.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$945 = [
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
    Syntax$946 = {
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
    PropertyKind$947 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$951 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$948 = {
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
    Regex$949 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$969(condition$1118, message$1119) {
        if (!condition$1118) {
            throw new Error('ASSERT: ' + message$1119);
        }
    }
    function isIn$970(el$1120, list$1121) {
        return list$1121.indexOf(el$1120) !== -1;
    }
    function isDecimalDigit$971(ch$1122) {
        return ch$1122 >= 48 && ch$1122 <= 57;
    }    // 0..9
    function isHexDigit$972(ch$1123) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1123) >= 0;
    }
    function isOctalDigit$973(ch$1124) {
        return '01234567'.indexOf(ch$1124) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$974(ch$1125) {
        return ch$1125 === 32 || ch$1125 === 9 || ch$1125 === 11 || ch$1125 === 12 || ch$1125 === 160 || ch$1125 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1125)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$975(ch$1126) {
        return ch$1126 === 10 || ch$1126 === 13 || ch$1126 === 8232 || ch$1126 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$976(ch$1127) {
        return ch$1127 === 36 || ch$1127 === 95 || ch$1127 >= 65 && ch$1127 <= 90 || ch$1127 >= 97 && ch$1127 <= 122 || ch$1127 === 92 || ch$1127 >= 128 && Regex$949.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1127));
    }
    function isIdentifierPart$977(ch$1128) {
        return ch$1128 === 36 || ch$1128 === 95 || ch$1128 >= 65 && ch$1128 <= 90 || ch$1128 >= 97 && ch$1128 <= 122 || ch$1128 >= 48 && ch$1128 <= 57 || ch$1128 === 92 || ch$1128 >= 128 && Regex$949.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1128));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$978(id$1129) {
        switch (id$1129) {
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
    function isStrictModeReservedWord$979(id$1130) {
        switch (id$1130) {
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
    function isRestrictedWord$980(id$1131) {
        return id$1131 === 'eval' || id$1131 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$981(id$1132) {
        if (strict$953 && isStrictModeReservedWord$979(id$1132)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1132.length) {
        case 2:
            return id$1132 === 'if' || id$1132 === 'in' || id$1132 === 'do';
        case 3:
            return id$1132 === 'var' || id$1132 === 'for' || id$1132 === 'new' || id$1132 === 'try' || id$1132 === 'let';
        case 4:
            return id$1132 === 'this' || id$1132 === 'else' || id$1132 === 'case' || id$1132 === 'void' || id$1132 === 'with' || id$1132 === 'enum';
        case 5:
            return id$1132 === 'while' || id$1132 === 'break' || id$1132 === 'catch' || id$1132 === 'throw' || id$1132 === 'const' || id$1132 === 'yield' || id$1132 === 'class' || id$1132 === 'super';
        case 6:
            return id$1132 === 'return' || id$1132 === 'typeof' || id$1132 === 'delete' || id$1132 === 'switch' || id$1132 === 'export' || id$1132 === 'import';
        case 7:
            return id$1132 === 'default' || id$1132 === 'finally' || id$1132 === 'extends';
        case 8:
            return id$1132 === 'function' || id$1132 === 'continue' || id$1132 === 'debugger';
        case 10:
            return id$1132 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$982() {
        var ch$1133, blockComment$1134, lineComment$1135;
        blockComment$1134 = false;
        lineComment$1135 = false;
        while (index$954 < length$961) {
            ch$1133 = source$952.charCodeAt(index$954);
            if (lineComment$1135) {
                ++index$954;
                if (isLineTerminator$975(ch$1133)) {
                    lineComment$1135 = false;
                    if (ch$1133 === 13 && source$952.charCodeAt(index$954) === 10) {
                        ++index$954;
                    }
                    ++lineNumber$955;
                    lineStart$956 = index$954;
                }
            } else if (blockComment$1134) {
                if (isLineTerminator$975(ch$1133)) {
                    if (ch$1133 === 13 && source$952.charCodeAt(index$954 + 1) === 10) {
                        ++index$954;
                    }
                    ++lineNumber$955;
                    ++index$954;
                    lineStart$956 = index$954;
                    if (index$954 >= length$961) {
                        throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1133 = source$952.charCodeAt(index$954++);
                    if (index$954 >= length$961) {
                        throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1133 === 42) {
                        ch$1133 = source$952.charCodeAt(index$954);
                        if (ch$1133 === 47) {
                            ++index$954;
                            blockComment$1134 = false;
                        }
                    }
                }
            } else if (ch$1133 === 47) {
                ch$1133 = source$952.charCodeAt(index$954 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1133 === 47) {
                    index$954 += 2;
                    lineComment$1135 = true;
                } else if (ch$1133 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$954 += 2;
                    blockComment$1134 = true;
                    if (index$954 >= length$961) {
                        throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$974(ch$1133)) {
                ++index$954;
            } else if (isLineTerminator$975(ch$1133)) {
                ++index$954;
                if (ch$1133 === 13 && source$952.charCodeAt(index$954) === 10) {
                    ++index$954;
                }
                ++lineNumber$955;
                lineStart$956 = index$954;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$983(prefix$1136) {
        var i$1137, len$1138, ch$1139, code$1140 = 0;
        len$1138 = prefix$1136 === 'u' ? 4 : 2;
        for (i$1137 = 0; i$1137 < len$1138; ++i$1137) {
            if (index$954 < length$961 && isHexDigit$972(source$952[index$954])) {
                ch$1139 = source$952[index$954++];
                code$1140 = code$1140 * 16 + '0123456789abcdef'.indexOf(ch$1139.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1140);
    }
    function scanUnicodeCodePointEscape$984() {
        var ch$1141, code$1142, cu1$1143, cu2$1144;
        ch$1141 = source$952[index$954];
        code$1142 = 0;
        // At least, one hex digit is required.
        if (ch$1141 === '}') {
            throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
        }
        while (index$954 < length$961) {
            ch$1141 = source$952[index$954++];
            if (!isHexDigit$972(ch$1141)) {
                break;
            }
            code$1142 = code$1142 * 16 + '0123456789abcdef'.indexOf(ch$1141.toLowerCase());
        }
        if (code$1142 > 1114111 || ch$1141 !== '}') {
            throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1142 <= 65535) {
            return String.fromCharCode(code$1142);
        }
        cu1$1143 = (code$1142 - 65536 >> 10) + 55296;
        cu2$1144 = (code$1142 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1143, cu2$1144);
    }
    function getEscapedIdentifier$985() {
        var ch$1145, id$1146;
        ch$1145 = source$952.charCodeAt(index$954++);
        id$1146 = String.fromCharCode(ch$1145);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1145 === 92) {
            if (source$952.charCodeAt(index$954) !== 117) {
                throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
            }
            ++index$954;
            ch$1145 = scanHexEscape$983('u');
            if (!ch$1145 || ch$1145 === '\\' || !isIdentifierStart$976(ch$1145.charCodeAt(0))) {
                throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
            }
            id$1146 = ch$1145;
        }
        while (index$954 < length$961) {
            ch$1145 = source$952.charCodeAt(index$954);
            if (!isIdentifierPart$977(ch$1145)) {
                break;
            }
            ++index$954;
            id$1146 += String.fromCharCode(ch$1145);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1145 === 92) {
                id$1146 = id$1146.substr(0, id$1146.length - 1);
                if (source$952.charCodeAt(index$954) !== 117) {
                    throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
                }
                ++index$954;
                ch$1145 = scanHexEscape$983('u');
                if (!ch$1145 || ch$1145 === '\\' || !isIdentifierPart$977(ch$1145.charCodeAt(0))) {
                    throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
                }
                id$1146 += ch$1145;
            }
        }
        return id$1146;
    }
    function getIdentifier$986() {
        var start$1147, ch$1148;
        start$1147 = index$954++;
        while (index$954 < length$961) {
            ch$1148 = source$952.charCodeAt(index$954);
            if (ch$1148 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$954 = start$1147;
                return getEscapedIdentifier$985();
            }
            if (isIdentifierPart$977(ch$1148)) {
                ++index$954;
            } else {
                break;
            }
        }
        return source$952.slice(start$1147, index$954);
    }
    function scanIdentifier$987() {
        var start$1149, id$1150, type$1151;
        start$1149 = index$954;
        // Backslash (char #92) starts an escaped character.
        id$1150 = source$952.charCodeAt(index$954) === 92 ? getEscapedIdentifier$985() : getIdentifier$986();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1150.length === 1) {
            type$1151 = Token$943.Identifier;
        } else if (isKeyword$981(id$1150)) {
            type$1151 = Token$943.Keyword;
        } else if (id$1150 === 'null') {
            type$1151 = Token$943.NullLiteral;
        } else if (id$1150 === 'true' || id$1150 === 'false') {
            type$1151 = Token$943.BooleanLiteral;
        } else {
            type$1151 = Token$943.Identifier;
        }
        return {
            type: type$1151,
            value: id$1150,
            lineNumber: lineNumber$955,
            lineStart: lineStart$956,
            range: [
                start$1149,
                index$954
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$988() {
        var start$1152 = index$954, code$1153 = source$952.charCodeAt(index$954), code2$1154, ch1$1155 = source$952[index$954], ch2$1156, ch3$1157, ch4$1158;
        switch (code$1153) {
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
            ++index$954;
            if (extra$968.tokenize) {
                if (code$1153 === 40) {
                    extra$968.openParenToken = extra$968.tokens.length;
                } else if (code$1153 === 123) {
                    extra$968.openCurlyToken = extra$968.tokens.length;
                }
            }
            return {
                type: Token$943.Punctuator,
                value: String.fromCharCode(code$1153),
                lineNumber: lineNumber$955,
                lineStart: lineStart$956,
                range: [
                    start$1152,
                    index$954
                ]
            };
        default:
            code2$1154 = source$952.charCodeAt(index$954 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1154 === 61) {
                switch (code$1153) {
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
                    index$954 += 2;
                    return {
                        type: Token$943.Punctuator,
                        value: String.fromCharCode(code$1153) + String.fromCharCode(code2$1154),
                        lineNumber: lineNumber$955,
                        lineStart: lineStart$956,
                        range: [
                            start$1152,
                            index$954
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$954 += 2;
                    // !== and ===
                    if (source$952.charCodeAt(index$954) === 61) {
                        ++index$954;
                    }
                    return {
                        type: Token$943.Punctuator,
                        value: source$952.slice(start$1152, index$954),
                        lineNumber: lineNumber$955,
                        lineStart: lineStart$956,
                        range: [
                            start$1152,
                            index$954
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1156 = source$952[index$954 + 1];
        ch3$1157 = source$952[index$954 + 2];
        ch4$1158 = source$952[index$954 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1155 === '>' && ch2$1156 === '>' && ch3$1157 === '>') {
            if (ch4$1158 === '=') {
                index$954 += 4;
                return {
                    type: Token$943.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$955,
                    lineStart: lineStart$956,
                    range: [
                        start$1152,
                        index$954
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1155 === '>' && ch2$1156 === '>' && ch3$1157 === '>') {
            index$954 += 3;
            return {
                type: Token$943.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$955,
                lineStart: lineStart$956,
                range: [
                    start$1152,
                    index$954
                ]
            };
        }
        if (ch1$1155 === '<' && ch2$1156 === '<' && ch3$1157 === '=') {
            index$954 += 3;
            return {
                type: Token$943.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$955,
                lineStart: lineStart$956,
                range: [
                    start$1152,
                    index$954
                ]
            };
        }
        if (ch1$1155 === '>' && ch2$1156 === '>' && ch3$1157 === '=') {
            index$954 += 3;
            return {
                type: Token$943.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$955,
                lineStart: lineStart$956,
                range: [
                    start$1152,
                    index$954
                ]
            };
        }
        if (ch1$1155 === '.' && ch2$1156 === '.' && ch3$1157 === '.') {
            index$954 += 3;
            return {
                type: Token$943.Punctuator,
                value: '...',
                lineNumber: lineNumber$955,
                lineStart: lineStart$956,
                range: [
                    start$1152,
                    index$954
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1155 === ch2$1156 && '+-<>&|'.indexOf(ch1$1155) >= 0) {
            index$954 += 2;
            return {
                type: Token$943.Punctuator,
                value: ch1$1155 + ch2$1156,
                lineNumber: lineNumber$955,
                lineStart: lineStart$956,
                range: [
                    start$1152,
                    index$954
                ]
            };
        }
        if (ch1$1155 === '=' && ch2$1156 === '>') {
            index$954 += 2;
            return {
                type: Token$943.Punctuator,
                value: '=>',
                lineNumber: lineNumber$955,
                lineStart: lineStart$956,
                range: [
                    start$1152,
                    index$954
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1155) >= 0) {
            ++index$954;
            return {
                type: Token$943.Punctuator,
                value: ch1$1155,
                lineNumber: lineNumber$955,
                lineStart: lineStart$956,
                range: [
                    start$1152,
                    index$954
                ]
            };
        }
        if (ch1$1155 === '.') {
            ++index$954;
            return {
                type: Token$943.Punctuator,
                value: ch1$1155,
                lineNumber: lineNumber$955,
                lineStart: lineStart$956,
                range: [
                    start$1152,
                    index$954
                ]
            };
        }
        throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$989(start$1159) {
        var number$1160 = '';
        while (index$954 < length$961) {
            if (!isHexDigit$972(source$952[index$954])) {
                break;
            }
            number$1160 += source$952[index$954++];
        }
        if (number$1160.length === 0) {
            throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$976(source$952.charCodeAt(index$954))) {
            throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$943.NumericLiteral,
            value: parseInt('0x' + number$1160, 16),
            lineNumber: lineNumber$955,
            lineStart: lineStart$956,
            range: [
                start$1159,
                index$954
            ]
        };
    }
    function scanOctalLiteral$990(prefix$1161, start$1162) {
        var number$1163, octal$1164;
        if (isOctalDigit$973(prefix$1161)) {
            octal$1164 = true;
            number$1163 = '0' + source$952[index$954++];
        } else {
            octal$1164 = false;
            ++index$954;
            number$1163 = '';
        }
        while (index$954 < length$961) {
            if (!isOctalDigit$973(source$952[index$954])) {
                break;
            }
            number$1163 += source$952[index$954++];
        }
        if (!octal$1164 && number$1163.length === 0) {
            // only 0o or 0O
            throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$976(source$952.charCodeAt(index$954)) || isDecimalDigit$971(source$952.charCodeAt(index$954))) {
            throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$943.NumericLiteral,
            value: parseInt(number$1163, 8),
            octal: octal$1164,
            lineNumber: lineNumber$955,
            lineStart: lineStart$956,
            range: [
                start$1162,
                index$954
            ]
        };
    }
    function scanNumericLiteral$991() {
        var number$1165, start$1166, ch$1167, octal$1168;
        ch$1167 = source$952[index$954];
        assert$969(isDecimalDigit$971(ch$1167.charCodeAt(0)) || ch$1167 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1166 = index$954;
        number$1165 = '';
        if (ch$1167 !== '.') {
            number$1165 = source$952[index$954++];
            ch$1167 = source$952[index$954];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1165 === '0') {
                if (ch$1167 === 'x' || ch$1167 === 'X') {
                    ++index$954;
                    return scanHexLiteral$989(start$1166);
                }
                if (ch$1167 === 'b' || ch$1167 === 'B') {
                    ++index$954;
                    number$1165 = '';
                    while (index$954 < length$961) {
                        ch$1167 = source$952[index$954];
                        if (ch$1167 !== '0' && ch$1167 !== '1') {
                            break;
                        }
                        number$1165 += source$952[index$954++];
                    }
                    if (number$1165.length === 0) {
                        // only 0b or 0B
                        throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$954 < length$961) {
                        ch$1167 = source$952.charCodeAt(index$954);
                        if (isIdentifierStart$976(ch$1167) || isDecimalDigit$971(ch$1167)) {
                            throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$943.NumericLiteral,
                        value: parseInt(number$1165, 2),
                        lineNumber: lineNumber$955,
                        lineStart: lineStart$956,
                        range: [
                            start$1166,
                            index$954
                        ]
                    };
                }
                if (ch$1167 === 'o' || ch$1167 === 'O' || isOctalDigit$973(ch$1167)) {
                    return scanOctalLiteral$990(ch$1167, start$1166);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1167 && isDecimalDigit$971(ch$1167.charCodeAt(0))) {
                    throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$971(source$952.charCodeAt(index$954))) {
                number$1165 += source$952[index$954++];
            }
            ch$1167 = source$952[index$954];
        }
        if (ch$1167 === '.') {
            number$1165 += source$952[index$954++];
            while (isDecimalDigit$971(source$952.charCodeAt(index$954))) {
                number$1165 += source$952[index$954++];
            }
            ch$1167 = source$952[index$954];
        }
        if (ch$1167 === 'e' || ch$1167 === 'E') {
            number$1165 += source$952[index$954++];
            ch$1167 = source$952[index$954];
            if (ch$1167 === '+' || ch$1167 === '-') {
                number$1165 += source$952[index$954++];
            }
            if (isDecimalDigit$971(source$952.charCodeAt(index$954))) {
                while (isDecimalDigit$971(source$952.charCodeAt(index$954))) {
                    number$1165 += source$952[index$954++];
                }
            } else {
                throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$976(source$952.charCodeAt(index$954))) {
            throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$943.NumericLiteral,
            value: parseFloat(number$1165),
            lineNumber: lineNumber$955,
            lineStart: lineStart$956,
            range: [
                start$1166,
                index$954
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$992() {
        var str$1169 = '', quote$1170, start$1171, ch$1172, code$1173, unescaped$1174, restore$1175, octal$1176 = false;
        quote$1170 = source$952[index$954];
        assert$969(quote$1170 === '\'' || quote$1170 === '"', 'String literal must starts with a quote');
        start$1171 = index$954;
        ++index$954;
        while (index$954 < length$961) {
            ch$1172 = source$952[index$954++];
            if (ch$1172 === quote$1170) {
                quote$1170 = '';
                break;
            } else if (ch$1172 === '\\') {
                ch$1172 = source$952[index$954++];
                if (!ch$1172 || !isLineTerminator$975(ch$1172.charCodeAt(0))) {
                    switch (ch$1172) {
                    case 'n':
                        str$1169 += '\n';
                        break;
                    case 'r':
                        str$1169 += '\r';
                        break;
                    case 't':
                        str$1169 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$952[index$954] === '{') {
                            ++index$954;
                            str$1169 += scanUnicodeCodePointEscape$984();
                        } else {
                            restore$1175 = index$954;
                            unescaped$1174 = scanHexEscape$983(ch$1172);
                            if (unescaped$1174) {
                                str$1169 += unescaped$1174;
                            } else {
                                index$954 = restore$1175;
                                str$1169 += ch$1172;
                            }
                        }
                        break;
                    case 'b':
                        str$1169 += '\b';
                        break;
                    case 'f':
                        str$1169 += '\f';
                        break;
                    case 'v':
                        str$1169 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$973(ch$1172)) {
                            code$1173 = '01234567'.indexOf(ch$1172);
                            // \0 is not octal escape sequence
                            if (code$1173 !== 0) {
                                octal$1176 = true;
                            }
                            if (index$954 < length$961 && isOctalDigit$973(source$952[index$954])) {
                                octal$1176 = true;
                                code$1173 = code$1173 * 8 + '01234567'.indexOf(source$952[index$954++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1172) >= 0 && index$954 < length$961 && isOctalDigit$973(source$952[index$954])) {
                                    code$1173 = code$1173 * 8 + '01234567'.indexOf(source$952[index$954++]);
                                }
                            }
                            str$1169 += String.fromCharCode(code$1173);
                        } else {
                            str$1169 += ch$1172;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$955;
                    if (ch$1172 === '\r' && source$952[index$954] === '\n') {
                        ++index$954;
                    }
                }
            } else if (isLineTerminator$975(ch$1172.charCodeAt(0))) {
                break;
            } else {
                str$1169 += ch$1172;
            }
        }
        if (quote$1170 !== '') {
            throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$943.StringLiteral,
            value: str$1169,
            octal: octal$1176,
            lineNumber: lineNumber$955,
            lineStart: lineStart$956,
            range: [
                start$1171,
                index$954
            ]
        };
    }
    function scanTemplate$993() {
        var cooked$1177 = '', ch$1178, start$1179, terminated$1180, tail$1181, restore$1182, unescaped$1183, code$1184, octal$1185;
        terminated$1180 = false;
        tail$1181 = false;
        start$1179 = index$954;
        ++index$954;
        while (index$954 < length$961) {
            ch$1178 = source$952[index$954++];
            if (ch$1178 === '`') {
                tail$1181 = true;
                terminated$1180 = true;
                break;
            } else if (ch$1178 === '$') {
                if (source$952[index$954] === '{') {
                    ++index$954;
                    terminated$1180 = true;
                    break;
                }
                cooked$1177 += ch$1178;
            } else if (ch$1178 === '\\') {
                ch$1178 = source$952[index$954++];
                if (!isLineTerminator$975(ch$1178.charCodeAt(0))) {
                    switch (ch$1178) {
                    case 'n':
                        cooked$1177 += '\n';
                        break;
                    case 'r':
                        cooked$1177 += '\r';
                        break;
                    case 't':
                        cooked$1177 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$952[index$954] === '{') {
                            ++index$954;
                            cooked$1177 += scanUnicodeCodePointEscape$984();
                        } else {
                            restore$1182 = index$954;
                            unescaped$1183 = scanHexEscape$983(ch$1178);
                            if (unescaped$1183) {
                                cooked$1177 += unescaped$1183;
                            } else {
                                index$954 = restore$1182;
                                cooked$1177 += ch$1178;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1177 += '\b';
                        break;
                    case 'f':
                        cooked$1177 += '\f';
                        break;
                    case 'v':
                        cooked$1177 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$973(ch$1178)) {
                            code$1184 = '01234567'.indexOf(ch$1178);
                            // \0 is not octal escape sequence
                            if (code$1184 !== 0) {
                                octal$1185 = true;
                            }
                            if (index$954 < length$961 && isOctalDigit$973(source$952[index$954])) {
                                octal$1185 = true;
                                code$1184 = code$1184 * 8 + '01234567'.indexOf(source$952[index$954++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1178) >= 0 && index$954 < length$961 && isOctalDigit$973(source$952[index$954])) {
                                    code$1184 = code$1184 * 8 + '01234567'.indexOf(source$952[index$954++]);
                                }
                            }
                            cooked$1177 += String.fromCharCode(code$1184);
                        } else {
                            cooked$1177 += ch$1178;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$955;
                    if (ch$1178 === '\r' && source$952[index$954] === '\n') {
                        ++index$954;
                    }
                }
            } else if (isLineTerminator$975(ch$1178.charCodeAt(0))) {
                ++lineNumber$955;
                if (ch$1178 === '\r' && source$952[index$954] === '\n') {
                    ++index$954;
                }
                cooked$1177 += '\n';
            } else {
                cooked$1177 += ch$1178;
            }
        }
        if (!terminated$1180) {
            throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$943.Template,
            value: {
                cooked: cooked$1177,
                raw: source$952.slice(start$1179 + 1, index$954 - (tail$1181 ? 1 : 2))
            },
            tail: tail$1181,
            octal: octal$1185,
            lineNumber: lineNumber$955,
            lineStart: lineStart$956,
            range: [
                start$1179,
                index$954
            ]
        };
    }
    function scanTemplateElement$994(option$1186) {
        var startsWith$1187, template$1188;
        lookahead$965 = null;
        skipComment$982();
        startsWith$1187 = option$1186.head ? '`' : '}';
        if (source$952[index$954] !== startsWith$1187) {
            throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
        }
        template$1188 = scanTemplate$993();
        peek$1000();
        return template$1188;
    }
    function scanRegExp$995() {
        var str$1189, ch$1190, start$1191, pattern$1192, flags$1193, value$1194, classMarker$1195 = false, restore$1196, terminated$1197 = false;
        lookahead$965 = null;
        skipComment$982();
        start$1191 = index$954;
        ch$1190 = source$952[index$954];
        assert$969(ch$1190 === '/', 'Regular expression literal must start with a slash');
        str$1189 = source$952[index$954++];
        while (index$954 < length$961) {
            ch$1190 = source$952[index$954++];
            str$1189 += ch$1190;
            if (classMarker$1195) {
                if (ch$1190 === ']') {
                    classMarker$1195 = false;
                }
            } else {
                if (ch$1190 === '\\') {
                    ch$1190 = source$952[index$954++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$975(ch$1190.charCodeAt(0))) {
                        throwError$1003({}, Messages$948.UnterminatedRegExp);
                    }
                    str$1189 += ch$1190;
                } else if (ch$1190 === '/') {
                    terminated$1197 = true;
                    break;
                } else if (ch$1190 === '[') {
                    classMarker$1195 = true;
                } else if (isLineTerminator$975(ch$1190.charCodeAt(0))) {
                    throwError$1003({}, Messages$948.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1197) {
            throwError$1003({}, Messages$948.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1192 = str$1189.substr(1, str$1189.length - 2);
        flags$1193 = '';
        while (index$954 < length$961) {
            ch$1190 = source$952[index$954];
            if (!isIdentifierPart$977(ch$1190.charCodeAt(0))) {
                break;
            }
            ++index$954;
            if (ch$1190 === '\\' && index$954 < length$961) {
                ch$1190 = source$952[index$954];
                if (ch$1190 === 'u') {
                    ++index$954;
                    restore$1196 = index$954;
                    ch$1190 = scanHexEscape$983('u');
                    if (ch$1190) {
                        flags$1193 += ch$1190;
                        for (str$1189 += '\\u'; restore$1196 < index$954; ++restore$1196) {
                            str$1189 += source$952[restore$1196];
                        }
                    } else {
                        index$954 = restore$1196;
                        flags$1193 += 'u';
                        str$1189 += '\\u';
                    }
                } else {
                    str$1189 += '\\';
                }
            } else {
                flags$1193 += ch$1190;
                str$1189 += ch$1190;
            }
        }
        try {
            value$1194 = new RegExp(pattern$1192, flags$1193);
        } catch (e$1198) {
            throwError$1003({}, Messages$948.InvalidRegExp);
        }
        // peek();
        if (extra$968.tokenize) {
            return {
                type: Token$943.RegularExpression,
                value: value$1194,
                lineNumber: lineNumber$955,
                lineStart: lineStart$956,
                range: [
                    start$1191,
                    index$954
                ]
            };
        }
        return {
            type: Token$943.RegularExpression,
            literal: str$1189,
            value: value$1194,
            range: [
                start$1191,
                index$954
            ]
        };
    }
    function isIdentifierName$996(token$1199) {
        return token$1199.type === Token$943.Identifier || token$1199.type === Token$943.Keyword || token$1199.type === Token$943.BooleanLiteral || token$1199.type === Token$943.NullLiteral;
    }
    function advanceSlash$997() {
        var prevToken$1200, checkToken$1201;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1200 = extra$968.tokens[extra$968.tokens.length - 1];
        if (!prevToken$1200) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$995();
        }
        if (prevToken$1200.type === 'Punctuator') {
            if (prevToken$1200.value === ')') {
                checkToken$1201 = extra$968.tokens[extra$968.openParenToken - 1];
                if (checkToken$1201 && checkToken$1201.type === 'Keyword' && (checkToken$1201.value === 'if' || checkToken$1201.value === 'while' || checkToken$1201.value === 'for' || checkToken$1201.value === 'with')) {
                    return scanRegExp$995();
                }
                return scanPunctuator$988();
            }
            if (prevToken$1200.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$968.tokens[extra$968.openCurlyToken - 3] && extra$968.tokens[extra$968.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1201 = extra$968.tokens[extra$968.openCurlyToken - 4];
                    if (!checkToken$1201) {
                        return scanPunctuator$988();
                    }
                } else if (extra$968.tokens[extra$968.openCurlyToken - 4] && extra$968.tokens[extra$968.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1201 = extra$968.tokens[extra$968.openCurlyToken - 5];
                    if (!checkToken$1201) {
                        return scanRegExp$995();
                    }
                } else {
                    return scanPunctuator$988();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$945.indexOf(checkToken$1201.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$988();
                }
                // It is a declaration.
                return scanRegExp$995();
            }
            return scanRegExp$995();
        }
        if (prevToken$1200.type === 'Keyword') {
            return scanRegExp$995();
        }
        return scanPunctuator$988();
    }
    function advance$998() {
        var ch$1202;
        skipComment$982();
        if (index$954 >= length$961) {
            return {
                type: Token$943.EOF,
                lineNumber: lineNumber$955,
                lineStart: lineStart$956,
                range: [
                    index$954,
                    index$954
                ]
            };
        }
        ch$1202 = source$952.charCodeAt(index$954);
        // Very common: ( and ) and ;
        if (ch$1202 === 40 || ch$1202 === 41 || ch$1202 === 58) {
            return scanPunctuator$988();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1202 === 39 || ch$1202 === 34) {
            return scanStringLiteral$992();
        }
        if (ch$1202 === 96) {
            return scanTemplate$993();
        }
        if (isIdentifierStart$976(ch$1202)) {
            return scanIdentifier$987();
        }
        // # and @ are allowed for sweet.js
        if (ch$1202 === 35 || ch$1202 === 64) {
            ++index$954;
            return {
                type: Token$943.Punctuator,
                value: String.fromCharCode(ch$1202),
                lineNumber: lineNumber$955,
                lineStart: lineStart$956,
                range: [
                    index$954 - 1,
                    index$954
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1202 === 46) {
            if (isDecimalDigit$971(source$952.charCodeAt(index$954 + 1))) {
                return scanNumericLiteral$991();
            }
            return scanPunctuator$988();
        }
        if (isDecimalDigit$971(ch$1202)) {
            return scanNumericLiteral$991();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$968.tokenize && ch$1202 === 47) {
            return advanceSlash$997();
        }
        return scanPunctuator$988();
    }
    function lex$999() {
        var token$1203;
        token$1203 = lookahead$965;
        streamIndex$964 = lookaheadIndex$966;
        lineNumber$955 = token$1203.lineNumber;
        lineStart$956 = token$1203.lineStart;
        sm_lineNumber$957 = lookahead$965.sm_lineNumber;
        sm_lineStart$958 = lookahead$965.sm_lineStart;
        sm_range$959 = lookahead$965.sm_range;
        sm_index$960 = lookahead$965.sm_range[0];
        lookahead$965 = tokenStream$963[++streamIndex$964].token;
        lookaheadIndex$966 = streamIndex$964;
        index$954 = lookahead$965.range[0];
        return token$1203;
    }
    function peek$1000() {
        lookaheadIndex$966 = streamIndex$964 + 1;
        if (lookaheadIndex$966 >= length$961) {
            lookahead$965 = {
                type: Token$943.EOF,
                lineNumber: lineNumber$955,
                lineStart: lineStart$956,
                range: [
                    index$954,
                    index$954
                ]
            };
            return;
        }
        lookahead$965 = tokenStream$963[lookaheadIndex$966].token;
        index$954 = lookahead$965.range[0];
    }
    function lookahead2$1001() {
        var adv$1204, pos$1205, line$1206, start$1207, result$1208;
        if (streamIndex$964 + 1 >= length$961 || streamIndex$964 + 2 >= length$961) {
            return {
                type: Token$943.EOF,
                lineNumber: lineNumber$955,
                lineStart: lineStart$956,
                range: [
                    index$954,
                    index$954
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$965 === null) {
            lookaheadIndex$966 = streamIndex$964 + 1;
            lookahead$965 = tokenStream$963[lookaheadIndex$966].token;
            index$954 = lookahead$965.range[0];
        }
        result$1208 = tokenStream$963[lookaheadIndex$966 + 1].token;
        return result$1208;
    }
    SyntaxTreeDelegate$950 = {
        name: 'SyntaxTree',
        postProcess: function (node$1209) {
            return node$1209;
        },
        createArrayExpression: function (elements$1210) {
            return {
                type: Syntax$946.ArrayExpression,
                elements: elements$1210
            };
        },
        createAssignmentExpression: function (operator$1211, left$1212, right$1213) {
            return {
                type: Syntax$946.AssignmentExpression,
                operator: operator$1211,
                left: left$1212,
                right: right$1213
            };
        },
        createBinaryExpression: function (operator$1214, left$1215, right$1216) {
            var type$1217 = operator$1214 === '||' || operator$1214 === '&&' ? Syntax$946.LogicalExpression : Syntax$946.BinaryExpression;
            return {
                type: type$1217,
                operator: operator$1214,
                left: left$1215,
                right: right$1216
            };
        },
        createBlockStatement: function (body$1218) {
            return {
                type: Syntax$946.BlockStatement,
                body: body$1218
            };
        },
        createBreakStatement: function (label$1219) {
            return {
                type: Syntax$946.BreakStatement,
                label: label$1219
            };
        },
        createCallExpression: function (callee$1220, args$1221) {
            return {
                type: Syntax$946.CallExpression,
                callee: callee$1220,
                'arguments': args$1221
            };
        },
        createCatchClause: function (param$1222, body$1223) {
            return {
                type: Syntax$946.CatchClause,
                param: param$1222,
                body: body$1223
            };
        },
        createConditionalExpression: function (test$1224, consequent$1225, alternate$1226) {
            return {
                type: Syntax$946.ConditionalExpression,
                test: test$1224,
                consequent: consequent$1225,
                alternate: alternate$1226
            };
        },
        createContinueStatement: function (label$1227) {
            return {
                type: Syntax$946.ContinueStatement,
                label: label$1227
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$946.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1228, test$1229) {
            return {
                type: Syntax$946.DoWhileStatement,
                body: body$1228,
                test: test$1229
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$946.EmptyStatement };
        },
        createExpressionStatement: function (expression$1230) {
            return {
                type: Syntax$946.ExpressionStatement,
                expression: expression$1230
            };
        },
        createForStatement: function (init$1231, test$1232, update$1233, body$1234) {
            return {
                type: Syntax$946.ForStatement,
                init: init$1231,
                test: test$1232,
                update: update$1233,
                body: body$1234
            };
        },
        createForInStatement: function (left$1235, right$1236, body$1237) {
            return {
                type: Syntax$946.ForInStatement,
                left: left$1235,
                right: right$1236,
                body: body$1237,
                each: false
            };
        },
        createForOfStatement: function (left$1238, right$1239, body$1240) {
            return {
                type: Syntax$946.ForOfStatement,
                left: left$1238,
                right: right$1239,
                body: body$1240
            };
        },
        createFunctionDeclaration: function (id$1241, params$1242, defaults$1243, body$1244, rest$1245, generator$1246, expression$1247) {
            return {
                type: Syntax$946.FunctionDeclaration,
                id: id$1241,
                params: params$1242,
                defaults: defaults$1243,
                body: body$1244,
                rest: rest$1245,
                generator: generator$1246,
                expression: expression$1247
            };
        },
        createFunctionExpression: function (id$1248, params$1249, defaults$1250, body$1251, rest$1252, generator$1253, expression$1254) {
            return {
                type: Syntax$946.FunctionExpression,
                id: id$1248,
                params: params$1249,
                defaults: defaults$1250,
                body: body$1251,
                rest: rest$1252,
                generator: generator$1253,
                expression: expression$1254
            };
        },
        createIdentifier: function (name$1255) {
            return {
                type: Syntax$946.Identifier,
                name: name$1255
            };
        },
        createIfStatement: function (test$1256, consequent$1257, alternate$1258) {
            return {
                type: Syntax$946.IfStatement,
                test: test$1256,
                consequent: consequent$1257,
                alternate: alternate$1258
            };
        },
        createLabeledStatement: function (label$1259, body$1260) {
            return {
                type: Syntax$946.LabeledStatement,
                label: label$1259,
                body: body$1260
            };
        },
        createLiteral: function (token$1261) {
            return {
                type: Syntax$946.Literal,
                value: token$1261.value,
                raw: String(token$1261.value)
            };
        },
        createMemberExpression: function (accessor$1262, object$1263, property$1264) {
            return {
                type: Syntax$946.MemberExpression,
                computed: accessor$1262 === '[',
                object: object$1263,
                property: property$1264
            };
        },
        createNewExpression: function (callee$1265, args$1266) {
            return {
                type: Syntax$946.NewExpression,
                callee: callee$1265,
                'arguments': args$1266
            };
        },
        createObjectExpression: function (properties$1267) {
            return {
                type: Syntax$946.ObjectExpression,
                properties: properties$1267
            };
        },
        createPostfixExpression: function (operator$1268, argument$1269) {
            return {
                type: Syntax$946.UpdateExpression,
                operator: operator$1268,
                argument: argument$1269,
                prefix: false
            };
        },
        createProgram: function (body$1270) {
            return {
                type: Syntax$946.Program,
                body: body$1270
            };
        },
        createProperty: function (kind$1271, key$1272, value$1273, method$1274, shorthand$1275) {
            return {
                type: Syntax$946.Property,
                key: key$1272,
                value: value$1273,
                kind: kind$1271,
                method: method$1274,
                shorthand: shorthand$1275
            };
        },
        createReturnStatement: function (argument$1276) {
            return {
                type: Syntax$946.ReturnStatement,
                argument: argument$1276
            };
        },
        createSequenceExpression: function (expressions$1277) {
            return {
                type: Syntax$946.SequenceExpression,
                expressions: expressions$1277
            };
        },
        createSwitchCase: function (test$1278, consequent$1279) {
            return {
                type: Syntax$946.SwitchCase,
                test: test$1278,
                consequent: consequent$1279
            };
        },
        createSwitchStatement: function (discriminant$1280, cases$1281) {
            return {
                type: Syntax$946.SwitchStatement,
                discriminant: discriminant$1280,
                cases: cases$1281
            };
        },
        createThisExpression: function () {
            return { type: Syntax$946.ThisExpression };
        },
        createThrowStatement: function (argument$1282) {
            return {
                type: Syntax$946.ThrowStatement,
                argument: argument$1282
            };
        },
        createTryStatement: function (block$1283, guardedHandlers$1284, handlers$1285, finalizer$1286) {
            return {
                type: Syntax$946.TryStatement,
                block: block$1283,
                guardedHandlers: guardedHandlers$1284,
                handlers: handlers$1285,
                finalizer: finalizer$1286
            };
        },
        createUnaryExpression: function (operator$1287, argument$1288) {
            if (operator$1287 === '++' || operator$1287 === '--') {
                return {
                    type: Syntax$946.UpdateExpression,
                    operator: operator$1287,
                    argument: argument$1288,
                    prefix: true
                };
            }
            return {
                type: Syntax$946.UnaryExpression,
                operator: operator$1287,
                argument: argument$1288
            };
        },
        createVariableDeclaration: function (declarations$1289, kind$1290) {
            return {
                type: Syntax$946.VariableDeclaration,
                declarations: declarations$1289,
                kind: kind$1290
            };
        },
        createVariableDeclarator: function (id$1291, init$1292) {
            return {
                type: Syntax$946.VariableDeclarator,
                id: id$1291,
                init: init$1292
            };
        },
        createWhileStatement: function (test$1293, body$1294) {
            return {
                type: Syntax$946.WhileStatement,
                test: test$1293,
                body: body$1294
            };
        },
        createWithStatement: function (object$1295, body$1296) {
            return {
                type: Syntax$946.WithStatement,
                object: object$1295,
                body: body$1296
            };
        },
        createTemplateElement: function (value$1297, tail$1298) {
            return {
                type: Syntax$946.TemplateElement,
                value: value$1297,
                tail: tail$1298
            };
        },
        createTemplateLiteral: function (quasis$1299, expressions$1300) {
            return {
                type: Syntax$946.TemplateLiteral,
                quasis: quasis$1299,
                expressions: expressions$1300
            };
        },
        createSpreadElement: function (argument$1301) {
            return {
                type: Syntax$946.SpreadElement,
                argument: argument$1301
            };
        },
        createTaggedTemplateExpression: function (tag$1302, quasi$1303) {
            return {
                type: Syntax$946.TaggedTemplateExpression,
                tag: tag$1302,
                quasi: quasi$1303
            };
        },
        createArrowFunctionExpression: function (params$1304, defaults$1305, body$1306, rest$1307, expression$1308) {
            return {
                type: Syntax$946.ArrowFunctionExpression,
                id: null,
                params: params$1304,
                defaults: defaults$1305,
                body: body$1306,
                rest: rest$1307,
                generator: false,
                expression: expression$1308
            };
        },
        createMethodDefinition: function (propertyType$1309, kind$1310, key$1311, value$1312) {
            return {
                type: Syntax$946.MethodDefinition,
                key: key$1311,
                value: value$1312,
                kind: kind$1310,
                'static': propertyType$1309 === ClassPropertyType$951.static
            };
        },
        createClassBody: function (body$1313) {
            return {
                type: Syntax$946.ClassBody,
                body: body$1313
            };
        },
        createClassExpression: function (id$1314, superClass$1315, body$1316) {
            return {
                type: Syntax$946.ClassExpression,
                id: id$1314,
                superClass: superClass$1315,
                body: body$1316
            };
        },
        createClassDeclaration: function (id$1317, superClass$1318, body$1319) {
            return {
                type: Syntax$946.ClassDeclaration,
                id: id$1317,
                superClass: superClass$1318,
                body: body$1319
            };
        },
        createExportSpecifier: function (id$1320, name$1321) {
            return {
                type: Syntax$946.ExportSpecifier,
                id: id$1320,
                name: name$1321
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$946.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1322, specifiers$1323, source$1324) {
            return {
                type: Syntax$946.ExportDeclaration,
                declaration: declaration$1322,
                specifiers: specifiers$1323,
                source: source$1324
            };
        },
        createImportSpecifier: function (id$1325, name$1326) {
            return {
                type: Syntax$946.ImportSpecifier,
                id: id$1325,
                name: name$1326
            };
        },
        createImportDeclaration: function (specifiers$1327, kind$1328, source$1329) {
            return {
                type: Syntax$946.ImportDeclaration,
                specifiers: specifiers$1327,
                kind: kind$1328,
                source: source$1329
            };
        },
        createYieldExpression: function (argument$1330, delegate$1331) {
            return {
                type: Syntax$946.YieldExpression,
                argument: argument$1330,
                delegate: delegate$1331
            };
        },
        createModuleDeclaration: function (id$1332, source$1333, body$1334) {
            return {
                type: Syntax$946.ModuleDeclaration,
                id: id$1332,
                source: source$1333,
                body: body$1334
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$1002() {
        return lookahead$965.lineNumber !== lineNumber$955;
    }
    // Throw an exception
    function throwError$1003(token$1335, messageFormat$1336) {
        var error$1337, args$1338 = Array.prototype.slice.call(arguments, 2), msg$1339 = messageFormat$1336.replace(/%(\d)/g, function (whole$1343, index$1344) {
                assert$969(index$1344 < args$1338.length, 'Message reference must be in range');
                return args$1338[index$1344];
            });
        var startIndex$1340 = streamIndex$964 > 3 ? streamIndex$964 - 3 : 0;
        var toks$1341 = tokenStream$963.slice(startIndex$1340, streamIndex$964 + 3).map(function (stx$1345) {
                return stx$1345.token.value;
            }).join(' ');
        var tailingMsg$1342 = '\n[... ' + toks$1341 + ' ...]';
        if (typeof token$1335.lineNumber === 'number') {
            error$1337 = new Error('Line ' + token$1335.lineNumber + ': ' + msg$1339 + tailingMsg$1342);
            error$1337.index = token$1335.range[0];
            error$1337.lineNumber = token$1335.lineNumber;
            error$1337.column = token$1335.range[0] - lineStart$956 + 1;
        } else {
            error$1337 = new Error('Line ' + lineNumber$955 + ': ' + msg$1339 + tailingMsg$1342);
            error$1337.index = index$954;
            error$1337.lineNumber = lineNumber$955;
            error$1337.column = index$954 - lineStart$956 + 1;
        }
        error$1337.description = msg$1339;
        throw error$1337;
    }
    function throwErrorTolerant$1004() {
        try {
            throwError$1003.apply(null, arguments);
        } catch (e$1346) {
            if (extra$968.errors) {
                extra$968.errors.push(e$1346);
            } else {
                throw e$1346;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$1005(token$1347) {
        if (token$1347.type === Token$943.EOF) {
            throwError$1003(token$1347, Messages$948.UnexpectedEOS);
        }
        if (token$1347.type === Token$943.NumericLiteral) {
            throwError$1003(token$1347, Messages$948.UnexpectedNumber);
        }
        if (token$1347.type === Token$943.StringLiteral) {
            throwError$1003(token$1347, Messages$948.UnexpectedString);
        }
        if (token$1347.type === Token$943.Identifier) {
            throwError$1003(token$1347, Messages$948.UnexpectedIdentifier);
        }
        if (token$1347.type === Token$943.Keyword) {
            if (isFutureReservedWord$978(token$1347.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$953 && isStrictModeReservedWord$979(token$1347.value)) {
                throwErrorTolerant$1004(token$1347, Messages$948.StrictReservedWord);
                return;
            }
            throwError$1003(token$1347, Messages$948.UnexpectedToken, token$1347.value);
        }
        if (token$1347.type === Token$943.Template) {
            throwError$1003(token$1347, Messages$948.UnexpectedTemplate, token$1347.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$1003(token$1347, Messages$948.UnexpectedToken, token$1347.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$1006(value$1348) {
        var token$1349 = lex$999();
        if (token$1349.type !== Token$943.Punctuator || token$1349.value !== value$1348) {
            throwUnexpected$1005(token$1349);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$1007(keyword$1350) {
        var token$1351 = lex$999();
        if (token$1351.type !== Token$943.Keyword || token$1351.value !== keyword$1350) {
            throwUnexpected$1005(token$1351);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$1008(value$1352) {
        return lookahead$965.type === Token$943.Punctuator && lookahead$965.value === value$1352;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$1009(keyword$1353) {
        return lookahead$965.type === Token$943.Keyword && lookahead$965.value === keyword$1353;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$1010(keyword$1354) {
        return lookahead$965.type === Token$943.Identifier && lookahead$965.value === keyword$1354;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$1011() {
        var op$1355;
        if (lookahead$965.type !== Token$943.Punctuator) {
            return false;
        }
        op$1355 = lookahead$965.value;
        return op$1355 === '=' || op$1355 === '*=' || op$1355 === '/=' || op$1355 === '%=' || op$1355 === '+=' || op$1355 === '-=' || op$1355 === '<<=' || op$1355 === '>>=' || op$1355 === '>>>=' || op$1355 === '&=' || op$1355 === '^=' || op$1355 === '|=';
    }
    function consumeSemicolon$1012() {
        var line$1356, ch$1357;
        ch$1357 = lookahead$965.value ? String(lookahead$965.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1357 === 59) {
            lex$999();
            return;
        }
        if (lookahead$965.lineNumber !== lineNumber$955) {
            return;
        }
        if (match$1008(';')) {
            lex$999();
            return;
        }
        if (lookahead$965.type !== Token$943.EOF && !match$1008('}')) {
            throwUnexpected$1005(lookahead$965);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$1013(expr$1358) {
        return expr$1358.type === Syntax$946.Identifier || expr$1358.type === Syntax$946.MemberExpression;
    }
    function isAssignableLeftHandSide$1014(expr$1359) {
        return isLeftHandSide$1013(expr$1359) || expr$1359.type === Syntax$946.ObjectPattern || expr$1359.type === Syntax$946.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$1015() {
        var elements$1360 = [], blocks$1361 = [], filter$1362 = null, tmp$1363, possiblecomprehension$1364 = true, body$1365;
        expect$1006('[');
        while (!match$1008(']')) {
            if (lookahead$965.value === 'for' && lookahead$965.type === Token$943.Keyword) {
                if (!possiblecomprehension$1364) {
                    throwError$1003({}, Messages$948.ComprehensionError);
                }
                matchKeyword$1009('for');
                tmp$1363 = parseForStatement$1063({ ignoreBody: true });
                tmp$1363.of = tmp$1363.type === Syntax$946.ForOfStatement;
                tmp$1363.type = Syntax$946.ComprehensionBlock;
                if (tmp$1363.left.kind) {
                    // can't be let or const
                    throwError$1003({}, Messages$948.ComprehensionError);
                }
                blocks$1361.push(tmp$1363);
            } else if (lookahead$965.value === 'if' && lookahead$965.type === Token$943.Keyword) {
                if (!possiblecomprehension$1364) {
                    throwError$1003({}, Messages$948.ComprehensionError);
                }
                expectKeyword$1007('if');
                expect$1006('(');
                filter$1362 = parseExpression$1043();
                expect$1006(')');
            } else if (lookahead$965.value === ',' && lookahead$965.type === Token$943.Punctuator) {
                possiblecomprehension$1364 = false;
                // no longer allowed.
                lex$999();
                elements$1360.push(null);
            } else {
                tmp$1363 = parseSpreadOrAssignmentExpression$1026();
                elements$1360.push(tmp$1363);
                if (tmp$1363 && tmp$1363.type === Syntax$946.SpreadElement) {
                    if (!match$1008(']')) {
                        throwError$1003({}, Messages$948.ElementAfterSpreadElement);
                    }
                } else if (!(match$1008(']') || matchKeyword$1009('for') || matchKeyword$1009('if'))) {
                    expect$1006(',');
                    // this lexes.
                    possiblecomprehension$1364 = false;
                }
            }
        }
        expect$1006(']');
        if (filter$1362 && !blocks$1361.length) {
            throwError$1003({}, Messages$948.ComprehensionRequiresBlock);
        }
        if (blocks$1361.length) {
            if (elements$1360.length !== 1) {
                throwError$1003({}, Messages$948.ComprehensionError);
            }
            return {
                type: Syntax$946.ComprehensionExpression,
                filter: filter$1362,
                blocks: blocks$1361,
                body: elements$1360[0]
            };
        }
        return delegate$962.createArrayExpression(elements$1360);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$1016(options$1366) {
        var previousStrict$1367, previousYieldAllowed$1368, params$1369, defaults$1370, body$1371;
        previousStrict$1367 = strict$953;
        previousYieldAllowed$1368 = state$967.yieldAllowed;
        state$967.yieldAllowed = options$1366.generator;
        params$1369 = options$1366.params || [];
        defaults$1370 = options$1366.defaults || [];
        body$1371 = parseConciseBody$1075();
        if (options$1366.name && strict$953 && isRestrictedWord$980(params$1369[0].name)) {
            throwErrorTolerant$1004(options$1366.name, Messages$948.StrictParamName);
        }
        if (state$967.yieldAllowed && !state$967.yieldFound) {
            throwErrorTolerant$1004({}, Messages$948.NoYieldInGenerator);
        }
        strict$953 = previousStrict$1367;
        state$967.yieldAllowed = previousYieldAllowed$1368;
        return delegate$962.createFunctionExpression(null, params$1369, defaults$1370, body$1371, options$1366.rest || null, options$1366.generator, body$1371.type !== Syntax$946.BlockStatement);
    }
    function parsePropertyMethodFunction$1017(options$1372) {
        var previousStrict$1373, tmp$1374, method$1375;
        previousStrict$1373 = strict$953;
        strict$953 = true;
        tmp$1374 = parseParams$1079();
        if (tmp$1374.stricted) {
            throwErrorTolerant$1004(tmp$1374.stricted, tmp$1374.message);
        }
        method$1375 = parsePropertyFunction$1016({
            params: tmp$1374.params,
            defaults: tmp$1374.defaults,
            rest: tmp$1374.rest,
            generator: options$1372.generator
        });
        strict$953 = previousStrict$1373;
        return method$1375;
    }
    function parseObjectPropertyKey$1018() {
        var token$1376 = lex$999();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1376.type === Token$943.StringLiteral || token$1376.type === Token$943.NumericLiteral) {
            if (strict$953 && token$1376.octal) {
                throwErrorTolerant$1004(token$1376, Messages$948.StrictOctalLiteral);
            }
            return delegate$962.createLiteral(token$1376);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$962.createIdentifier(token$1376.value);
    }
    function parseObjectProperty$1019() {
        var token$1377, key$1378, id$1379, value$1380, param$1381;
        token$1377 = lookahead$965;
        if (token$1377.type === Token$943.Identifier) {
            id$1379 = parseObjectPropertyKey$1018();
            // Property Assignment: Getter and Setter.
            if (token$1377.value === 'get' && !(match$1008(':') || match$1008('('))) {
                key$1378 = parseObjectPropertyKey$1018();
                expect$1006('(');
                expect$1006(')');
                return delegate$962.createProperty('get', key$1378, parsePropertyFunction$1016({ generator: false }), false, false);
            }
            if (token$1377.value === 'set' && !(match$1008(':') || match$1008('('))) {
                key$1378 = parseObjectPropertyKey$1018();
                expect$1006('(');
                token$1377 = lookahead$965;
                param$1381 = [parseVariableIdentifier$1046()];
                expect$1006(')');
                return delegate$962.createProperty('set', key$1378, parsePropertyFunction$1016({
                    params: param$1381,
                    generator: false,
                    name: token$1377
                }), false, false);
            }
            if (match$1008(':')) {
                lex$999();
                return delegate$962.createProperty('init', id$1379, parseAssignmentExpression$1042(), false, false);
            }
            if (match$1008('(')) {
                return delegate$962.createProperty('init', id$1379, parsePropertyMethodFunction$1017({ generator: false }), true, false);
            }
            return delegate$962.createProperty('init', id$1379, id$1379, false, true);
        }
        if (token$1377.type === Token$943.EOF || token$1377.type === Token$943.Punctuator) {
            if (!match$1008('*')) {
                throwUnexpected$1005(token$1377);
            }
            lex$999();
            id$1379 = parseObjectPropertyKey$1018();
            if (!match$1008('(')) {
                throwUnexpected$1005(lex$999());
            }
            return delegate$962.createProperty('init', id$1379, parsePropertyMethodFunction$1017({ generator: true }), true, false);
        }
        key$1378 = parseObjectPropertyKey$1018();
        if (match$1008(':')) {
            lex$999();
            return delegate$962.createProperty('init', key$1378, parseAssignmentExpression$1042(), false, false);
        }
        if (match$1008('(')) {
            return delegate$962.createProperty('init', key$1378, parsePropertyMethodFunction$1017({ generator: false }), true, false);
        }
        throwUnexpected$1005(lex$999());
    }
    function parseObjectInitialiser$1020() {
        var properties$1382 = [], property$1383, name$1384, key$1385, kind$1386, map$1387 = {}, toString$1388 = String;
        expect$1006('{');
        while (!match$1008('}')) {
            property$1383 = parseObjectProperty$1019();
            if (property$1383.key.type === Syntax$946.Identifier) {
                name$1384 = property$1383.key.name;
            } else {
                name$1384 = toString$1388(property$1383.key.value);
            }
            kind$1386 = property$1383.kind === 'init' ? PropertyKind$947.Data : property$1383.kind === 'get' ? PropertyKind$947.Get : PropertyKind$947.Set;
            key$1385 = '$' + name$1384;
            if (Object.prototype.hasOwnProperty.call(map$1387, key$1385)) {
                if (map$1387[key$1385] === PropertyKind$947.Data) {
                    if (strict$953 && kind$1386 === PropertyKind$947.Data) {
                        throwErrorTolerant$1004({}, Messages$948.StrictDuplicateProperty);
                    } else if (kind$1386 !== PropertyKind$947.Data) {
                        throwErrorTolerant$1004({}, Messages$948.AccessorDataProperty);
                    }
                } else {
                    if (kind$1386 === PropertyKind$947.Data) {
                        throwErrorTolerant$1004({}, Messages$948.AccessorDataProperty);
                    } else if (map$1387[key$1385] & kind$1386) {
                        throwErrorTolerant$1004({}, Messages$948.AccessorGetSet);
                    }
                }
                map$1387[key$1385] |= kind$1386;
            } else {
                map$1387[key$1385] = kind$1386;
            }
            properties$1382.push(property$1383);
            if (!match$1008('}')) {
                expect$1006(',');
            }
        }
        expect$1006('}');
        return delegate$962.createObjectExpression(properties$1382);
    }
    function parseTemplateElement$1021(option$1389) {
        var token$1390 = scanTemplateElement$994(option$1389);
        if (strict$953 && token$1390.octal) {
            throwError$1003(token$1390, Messages$948.StrictOctalLiteral);
        }
        return delegate$962.createTemplateElement({
            raw: token$1390.value.raw,
            cooked: token$1390.value.cooked
        }, token$1390.tail);
    }
    function parseTemplateLiteral$1022() {
        var quasi$1391, quasis$1392, expressions$1393;
        quasi$1391 = parseTemplateElement$1021({ head: true });
        quasis$1392 = [quasi$1391];
        expressions$1393 = [];
        while (!quasi$1391.tail) {
            expressions$1393.push(parseExpression$1043());
            quasi$1391 = parseTemplateElement$1021({ head: false });
            quasis$1392.push(quasi$1391);
        }
        return delegate$962.createTemplateLiteral(quasis$1392, expressions$1393);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$1023() {
        var expr$1394;
        expect$1006('(');
        ++state$967.parenthesizedCount;
        expr$1394 = parseExpression$1043();
        expect$1006(')');
        return expr$1394;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$1024() {
        var type$1395, token$1396, resolvedIdent$1397;
        token$1396 = lookahead$965;
        type$1395 = lookahead$965.type;
        if (type$1395 === Token$943.Identifier) {
            resolvedIdent$1397 = expander$942.resolve(tokenStream$963[lookaheadIndex$966]);
            lex$999();
            return delegate$962.createIdentifier(resolvedIdent$1397);
        }
        if (type$1395 === Token$943.StringLiteral || type$1395 === Token$943.NumericLiteral) {
            if (strict$953 && lookahead$965.octal) {
                throwErrorTolerant$1004(lookahead$965, Messages$948.StrictOctalLiteral);
            }
            return delegate$962.createLiteral(lex$999());
        }
        if (type$1395 === Token$943.Keyword) {
            if (matchKeyword$1009('this')) {
                lex$999();
                return delegate$962.createThisExpression();
            }
            if (matchKeyword$1009('function')) {
                return parseFunctionExpression$1081();
            }
            if (matchKeyword$1009('class')) {
                return parseClassExpression$1086();
            }
            if (matchKeyword$1009('super')) {
                lex$999();
                return delegate$962.createIdentifier('super');
            }
        }
        if (type$1395 === Token$943.BooleanLiteral) {
            token$1396 = lex$999();
            token$1396.value = token$1396.value === 'true';
            return delegate$962.createLiteral(token$1396);
        }
        if (type$1395 === Token$943.NullLiteral) {
            token$1396 = lex$999();
            token$1396.value = null;
            return delegate$962.createLiteral(token$1396);
        }
        if (match$1008('[')) {
            return parseArrayInitialiser$1015();
        }
        if (match$1008('{')) {
            return parseObjectInitialiser$1020();
        }
        if (match$1008('(')) {
            return parseGroupExpression$1023();
        }
        if (lookahead$965.type === Token$943.RegularExpression) {
            return delegate$962.createLiteral(lex$999());
        }
        if (type$1395 === Token$943.Template) {
            return parseTemplateLiteral$1022();
        }
        return throwUnexpected$1005(lex$999());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$1025() {
        var args$1398 = [], arg$1399;
        expect$1006('(');
        if (!match$1008(')')) {
            while (streamIndex$964 < length$961) {
                arg$1399 = parseSpreadOrAssignmentExpression$1026();
                args$1398.push(arg$1399);
                if (match$1008(')')) {
                    break;
                } else if (arg$1399.type === Syntax$946.SpreadElement) {
                    throwError$1003({}, Messages$948.ElementAfterSpreadElement);
                }
                expect$1006(',');
            }
        }
        expect$1006(')');
        return args$1398;
    }
    function parseSpreadOrAssignmentExpression$1026() {
        if (match$1008('...')) {
            lex$999();
            return delegate$962.createSpreadElement(parseAssignmentExpression$1042());
        }
        return parseAssignmentExpression$1042();
    }
    function parseNonComputedProperty$1027() {
        var token$1400 = lex$999();
        if (!isIdentifierName$996(token$1400)) {
            throwUnexpected$1005(token$1400);
        }
        return delegate$962.createIdentifier(token$1400.value);
    }
    function parseNonComputedMember$1028() {
        expect$1006('.');
        return parseNonComputedProperty$1027();
    }
    function parseComputedMember$1029() {
        var expr$1401;
        expect$1006('[');
        expr$1401 = parseExpression$1043();
        expect$1006(']');
        return expr$1401;
    }
    function parseNewExpression$1030() {
        var callee$1402, args$1403;
        expectKeyword$1007('new');
        callee$1402 = parseLeftHandSideExpression$1032();
        args$1403 = match$1008('(') ? parseArguments$1025() : [];
        return delegate$962.createNewExpression(callee$1402, args$1403);
    }
    function parseLeftHandSideExpressionAllowCall$1031() {
        var expr$1404, args$1405, property$1406;
        expr$1404 = matchKeyword$1009('new') ? parseNewExpression$1030() : parsePrimaryExpression$1024();
        while (match$1008('.') || match$1008('[') || match$1008('(') || lookahead$965.type === Token$943.Template) {
            if (match$1008('(')) {
                args$1405 = parseArguments$1025();
                expr$1404 = delegate$962.createCallExpression(expr$1404, args$1405);
            } else if (match$1008('[')) {
                expr$1404 = delegate$962.createMemberExpression('[', expr$1404, parseComputedMember$1029());
            } else if (match$1008('.')) {
                expr$1404 = delegate$962.createMemberExpression('.', expr$1404, parseNonComputedMember$1028());
            } else {
                expr$1404 = delegate$962.createTaggedTemplateExpression(expr$1404, parseTemplateLiteral$1022());
            }
        }
        return expr$1404;
    }
    function parseLeftHandSideExpression$1032() {
        var expr$1407, property$1408;
        expr$1407 = matchKeyword$1009('new') ? parseNewExpression$1030() : parsePrimaryExpression$1024();
        while (match$1008('.') || match$1008('[') || lookahead$965.type === Token$943.Template) {
            if (match$1008('[')) {
                expr$1407 = delegate$962.createMemberExpression('[', expr$1407, parseComputedMember$1029());
            } else if (match$1008('.')) {
                expr$1407 = delegate$962.createMemberExpression('.', expr$1407, parseNonComputedMember$1028());
            } else {
                expr$1407 = delegate$962.createTaggedTemplateExpression(expr$1407, parseTemplateLiteral$1022());
            }
        }
        return expr$1407;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$1033() {
        var expr$1409 = parseLeftHandSideExpressionAllowCall$1031(), token$1410 = lookahead$965;
        if (lookahead$965.type !== Token$943.Punctuator) {
            return expr$1409;
        }
        if ((match$1008('++') || match$1008('--')) && !peekLineTerminator$1002()) {
            // 11.3.1, 11.3.2
            if (strict$953 && expr$1409.type === Syntax$946.Identifier && isRestrictedWord$980(expr$1409.name)) {
                throwErrorTolerant$1004({}, Messages$948.StrictLHSPostfix);
            }
            if (!isLeftHandSide$1013(expr$1409)) {
                throwError$1003({}, Messages$948.InvalidLHSInAssignment);
            }
            token$1410 = lex$999();
            expr$1409 = delegate$962.createPostfixExpression(token$1410.value, expr$1409);
        }
        return expr$1409;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$1034() {
        var token$1411, expr$1412;
        if (lookahead$965.type !== Token$943.Punctuator && lookahead$965.type !== Token$943.Keyword) {
            return parsePostfixExpression$1033();
        }
        if (match$1008('++') || match$1008('--')) {
            token$1411 = lex$999();
            expr$1412 = parseUnaryExpression$1034();
            // 11.4.4, 11.4.5
            if (strict$953 && expr$1412.type === Syntax$946.Identifier && isRestrictedWord$980(expr$1412.name)) {
                throwErrorTolerant$1004({}, Messages$948.StrictLHSPrefix);
            }
            if (!isLeftHandSide$1013(expr$1412)) {
                throwError$1003({}, Messages$948.InvalidLHSInAssignment);
            }
            return delegate$962.createUnaryExpression(token$1411.value, expr$1412);
        }
        if (match$1008('+') || match$1008('-') || match$1008('~') || match$1008('!')) {
            token$1411 = lex$999();
            expr$1412 = parseUnaryExpression$1034();
            return delegate$962.createUnaryExpression(token$1411.value, expr$1412);
        }
        if (matchKeyword$1009('delete') || matchKeyword$1009('void') || matchKeyword$1009('typeof')) {
            token$1411 = lex$999();
            expr$1412 = parseUnaryExpression$1034();
            expr$1412 = delegate$962.createUnaryExpression(token$1411.value, expr$1412);
            if (strict$953 && expr$1412.operator === 'delete' && expr$1412.argument.type === Syntax$946.Identifier) {
                throwErrorTolerant$1004({}, Messages$948.StrictDelete);
            }
            return expr$1412;
        }
        return parsePostfixExpression$1033();
    }
    function binaryPrecedence$1035(token$1413, allowIn$1414) {
        var prec$1415 = 0;
        if (token$1413.type !== Token$943.Punctuator && token$1413.type !== Token$943.Keyword) {
            return 0;
        }
        switch (token$1413.value) {
        case '||':
            prec$1415 = 1;
            break;
        case '&&':
            prec$1415 = 2;
            break;
        case '|':
            prec$1415 = 3;
            break;
        case '^':
            prec$1415 = 4;
            break;
        case '&':
            prec$1415 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1415 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1415 = 7;
            break;
        case 'in':
            prec$1415 = allowIn$1414 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1415 = 8;
            break;
        case '+':
        case '-':
            prec$1415 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1415 = 11;
            break;
        default:
            break;
        }
        return prec$1415;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$1036() {
        var expr$1416, token$1417, prec$1418, previousAllowIn$1419, stack$1420, right$1421, operator$1422, left$1423, i$1424;
        previousAllowIn$1419 = state$967.allowIn;
        state$967.allowIn = true;
        expr$1416 = parseUnaryExpression$1034();
        token$1417 = lookahead$965;
        prec$1418 = binaryPrecedence$1035(token$1417, previousAllowIn$1419);
        if (prec$1418 === 0) {
            return expr$1416;
        }
        token$1417.prec = prec$1418;
        lex$999();
        stack$1420 = [
            expr$1416,
            token$1417,
            parseUnaryExpression$1034()
        ];
        while ((prec$1418 = binaryPrecedence$1035(lookahead$965, previousAllowIn$1419)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1420.length > 2 && prec$1418 <= stack$1420[stack$1420.length - 2].prec) {
                right$1421 = stack$1420.pop();
                operator$1422 = stack$1420.pop().value;
                left$1423 = stack$1420.pop();
                stack$1420.push(delegate$962.createBinaryExpression(operator$1422, left$1423, right$1421));
            }
            // Shift.
            token$1417 = lex$999();
            token$1417.prec = prec$1418;
            stack$1420.push(token$1417);
            stack$1420.push(parseUnaryExpression$1034());
        }
        state$967.allowIn = previousAllowIn$1419;
        // Final reduce to clean-up the stack.
        i$1424 = stack$1420.length - 1;
        expr$1416 = stack$1420[i$1424];
        while (i$1424 > 1) {
            expr$1416 = delegate$962.createBinaryExpression(stack$1420[i$1424 - 1].value, stack$1420[i$1424 - 2], expr$1416);
            i$1424 -= 2;
        }
        return expr$1416;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$1037() {
        var expr$1425, previousAllowIn$1426, consequent$1427, alternate$1428;
        expr$1425 = parseBinaryExpression$1036();
        if (match$1008('?')) {
            lex$999();
            previousAllowIn$1426 = state$967.allowIn;
            state$967.allowIn = true;
            consequent$1427 = parseAssignmentExpression$1042();
            state$967.allowIn = previousAllowIn$1426;
            expect$1006(':');
            alternate$1428 = parseAssignmentExpression$1042();
            expr$1425 = delegate$962.createConditionalExpression(expr$1425, consequent$1427, alternate$1428);
        }
        return expr$1425;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$1038(expr$1429) {
        var i$1430, len$1431, property$1432, element$1433;
        if (expr$1429.type === Syntax$946.ObjectExpression) {
            expr$1429.type = Syntax$946.ObjectPattern;
            for (i$1430 = 0, len$1431 = expr$1429.properties.length; i$1430 < len$1431; i$1430 += 1) {
                property$1432 = expr$1429.properties[i$1430];
                if (property$1432.kind !== 'init') {
                    throwError$1003({}, Messages$948.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$1038(property$1432.value);
            }
        } else if (expr$1429.type === Syntax$946.ArrayExpression) {
            expr$1429.type = Syntax$946.ArrayPattern;
            for (i$1430 = 0, len$1431 = expr$1429.elements.length; i$1430 < len$1431; i$1430 += 1) {
                element$1433 = expr$1429.elements[i$1430];
                if (element$1433) {
                    reinterpretAsAssignmentBindingPattern$1038(element$1433);
                }
            }
        } else if (expr$1429.type === Syntax$946.Identifier) {
            if (isRestrictedWord$980(expr$1429.name)) {
                throwError$1003({}, Messages$948.InvalidLHSInAssignment);
            }
        } else if (expr$1429.type === Syntax$946.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$1038(expr$1429.argument);
            if (expr$1429.argument.type === Syntax$946.ObjectPattern) {
                throwError$1003({}, Messages$948.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1429.type !== Syntax$946.MemberExpression && expr$1429.type !== Syntax$946.CallExpression && expr$1429.type !== Syntax$946.NewExpression) {
                throwError$1003({}, Messages$948.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$1039(options$1434, expr$1435) {
        var i$1436, len$1437, property$1438, element$1439;
        if (expr$1435.type === Syntax$946.ObjectExpression) {
            expr$1435.type = Syntax$946.ObjectPattern;
            for (i$1436 = 0, len$1437 = expr$1435.properties.length; i$1436 < len$1437; i$1436 += 1) {
                property$1438 = expr$1435.properties[i$1436];
                if (property$1438.kind !== 'init') {
                    throwError$1003({}, Messages$948.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$1039(options$1434, property$1438.value);
            }
        } else if (expr$1435.type === Syntax$946.ArrayExpression) {
            expr$1435.type = Syntax$946.ArrayPattern;
            for (i$1436 = 0, len$1437 = expr$1435.elements.length; i$1436 < len$1437; i$1436 += 1) {
                element$1439 = expr$1435.elements[i$1436];
                if (element$1439) {
                    reinterpretAsDestructuredParameter$1039(options$1434, element$1439);
                }
            }
        } else if (expr$1435.type === Syntax$946.Identifier) {
            validateParam$1077(options$1434, expr$1435, expr$1435.name);
        } else {
            if (expr$1435.type !== Syntax$946.MemberExpression) {
                throwError$1003({}, Messages$948.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$1040(expressions$1440) {
        var i$1441, len$1442, param$1443, params$1444, defaults$1445, defaultCount$1446, options$1447, rest$1448;
        params$1444 = [];
        defaults$1445 = [];
        defaultCount$1446 = 0;
        rest$1448 = null;
        options$1447 = { paramSet: {} };
        for (i$1441 = 0, len$1442 = expressions$1440.length; i$1441 < len$1442; i$1441 += 1) {
            param$1443 = expressions$1440[i$1441];
            if (param$1443.type === Syntax$946.Identifier) {
                params$1444.push(param$1443);
                defaults$1445.push(null);
                validateParam$1077(options$1447, param$1443, param$1443.name);
            } else if (param$1443.type === Syntax$946.ObjectExpression || param$1443.type === Syntax$946.ArrayExpression) {
                reinterpretAsDestructuredParameter$1039(options$1447, param$1443);
                params$1444.push(param$1443);
                defaults$1445.push(null);
            } else if (param$1443.type === Syntax$946.SpreadElement) {
                assert$969(i$1441 === len$1442 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$1039(options$1447, param$1443.argument);
                rest$1448 = param$1443.argument;
            } else if (param$1443.type === Syntax$946.AssignmentExpression) {
                params$1444.push(param$1443.left);
                defaults$1445.push(param$1443.right);
                ++defaultCount$1446;
                validateParam$1077(options$1447, param$1443.left, param$1443.left.name);
            } else {
                return null;
            }
        }
        if (options$1447.message === Messages$948.StrictParamDupe) {
            throwError$1003(strict$953 ? options$1447.stricted : options$1447.firstRestricted, options$1447.message);
        }
        if (defaultCount$1446 === 0) {
            defaults$1445 = [];
        }
        return {
            params: params$1444,
            defaults: defaults$1445,
            rest: rest$1448,
            stricted: options$1447.stricted,
            firstRestricted: options$1447.firstRestricted,
            message: options$1447.message
        };
    }
    function parseArrowFunctionExpression$1041(options$1449) {
        var previousStrict$1450, previousYieldAllowed$1451, body$1452;
        expect$1006('=>');
        previousStrict$1450 = strict$953;
        previousYieldAllowed$1451 = state$967.yieldAllowed;
        state$967.yieldAllowed = false;
        body$1452 = parseConciseBody$1075();
        if (strict$953 && options$1449.firstRestricted) {
            throwError$1003(options$1449.firstRestricted, options$1449.message);
        }
        if (strict$953 && options$1449.stricted) {
            throwErrorTolerant$1004(options$1449.stricted, options$1449.message);
        }
        strict$953 = previousStrict$1450;
        state$967.yieldAllowed = previousYieldAllowed$1451;
        return delegate$962.createArrowFunctionExpression(options$1449.params, options$1449.defaults, body$1452, options$1449.rest, body$1452.type !== Syntax$946.BlockStatement);
    }
    function parseAssignmentExpression$1042() {
        var expr$1453, token$1454, params$1455, oldParenthesizedCount$1456;
        if (matchKeyword$1009('yield')) {
            return parseYieldExpression$1082();
        }
        oldParenthesizedCount$1456 = state$967.parenthesizedCount;
        if (match$1008('(')) {
            token$1454 = lookahead2$1001();
            if (token$1454.type === Token$943.Punctuator && token$1454.value === ')' || token$1454.value === '...') {
                params$1455 = parseParams$1079();
                if (!match$1008('=>')) {
                    throwUnexpected$1005(lex$999());
                }
                return parseArrowFunctionExpression$1041(params$1455);
            }
        }
        token$1454 = lookahead$965;
        expr$1453 = parseConditionalExpression$1037();
        if (match$1008('=>') && (state$967.parenthesizedCount === oldParenthesizedCount$1456 || state$967.parenthesizedCount === oldParenthesizedCount$1456 + 1)) {
            if (expr$1453.type === Syntax$946.Identifier) {
                params$1455 = reinterpretAsCoverFormalsList$1040([expr$1453]);
            } else if (expr$1453.type === Syntax$946.SequenceExpression) {
                params$1455 = reinterpretAsCoverFormalsList$1040(expr$1453.expressions);
            }
            if (params$1455) {
                return parseArrowFunctionExpression$1041(params$1455);
            }
        }
        if (matchAssign$1011()) {
            // 11.13.1
            if (strict$953 && expr$1453.type === Syntax$946.Identifier && isRestrictedWord$980(expr$1453.name)) {
                throwErrorTolerant$1004(token$1454, Messages$948.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$1008('=') && (expr$1453.type === Syntax$946.ObjectExpression || expr$1453.type === Syntax$946.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$1038(expr$1453);
            } else if (!isLeftHandSide$1013(expr$1453)) {
                throwError$1003({}, Messages$948.InvalidLHSInAssignment);
            }
            expr$1453 = delegate$962.createAssignmentExpression(lex$999().value, expr$1453, parseAssignmentExpression$1042());
        }
        return expr$1453;
    }
    // 11.14 Comma Operator
    function parseExpression$1043() {
        var expr$1457, expressions$1458, sequence$1459, coverFormalsList$1460, spreadFound$1461, oldParenthesizedCount$1462;
        oldParenthesizedCount$1462 = state$967.parenthesizedCount;
        expr$1457 = parseAssignmentExpression$1042();
        expressions$1458 = [expr$1457];
        if (match$1008(',')) {
            while (streamIndex$964 < length$961) {
                if (!match$1008(',')) {
                    break;
                }
                lex$999();
                expr$1457 = parseSpreadOrAssignmentExpression$1026();
                expressions$1458.push(expr$1457);
                if (expr$1457.type === Syntax$946.SpreadElement) {
                    spreadFound$1461 = true;
                    if (!match$1008(')')) {
                        throwError$1003({}, Messages$948.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1459 = delegate$962.createSequenceExpression(expressions$1458);
        }
        if (match$1008('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$967.parenthesizedCount === oldParenthesizedCount$1462 || state$967.parenthesizedCount === oldParenthesizedCount$1462 + 1) {
                expr$1457 = expr$1457.type === Syntax$946.SequenceExpression ? expr$1457.expressions : expressions$1458;
                coverFormalsList$1460 = reinterpretAsCoverFormalsList$1040(expr$1457);
                if (coverFormalsList$1460) {
                    return parseArrowFunctionExpression$1041(coverFormalsList$1460);
                }
            }
            throwUnexpected$1005(lex$999());
        }
        if (spreadFound$1461 && lookahead2$1001().value !== '=>') {
            throwError$1003({}, Messages$948.IllegalSpread);
        }
        return sequence$1459 || expr$1457;
    }
    // 12.1 Block
    function parseStatementList$1044() {
        var list$1463 = [], statement$1464;
        while (streamIndex$964 < length$961) {
            if (match$1008('}')) {
                break;
            }
            statement$1464 = parseSourceElement$1089();
            if (typeof statement$1464 === 'undefined') {
                break;
            }
            list$1463.push(statement$1464);
        }
        return list$1463;
    }
    function parseBlock$1045() {
        var block$1465;
        expect$1006('{');
        block$1465 = parseStatementList$1044();
        expect$1006('}');
        return delegate$962.createBlockStatement(block$1465);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$1046() {
        var token$1466 = lookahead$965, resolvedIdent$1467;
        if (token$1466.type !== Token$943.Identifier) {
            throwUnexpected$1005(token$1466);
        }
        resolvedIdent$1467 = expander$942.resolve(tokenStream$963[lookaheadIndex$966]);
        lex$999();
        return delegate$962.createIdentifier(resolvedIdent$1467);
    }
    function parseVariableDeclaration$1047(kind$1468) {
        var id$1469, init$1470 = null;
        if (match$1008('{')) {
            id$1469 = parseObjectInitialiser$1020();
            reinterpretAsAssignmentBindingPattern$1038(id$1469);
        } else if (match$1008('[')) {
            id$1469 = parseArrayInitialiser$1015();
            reinterpretAsAssignmentBindingPattern$1038(id$1469);
        } else {
            id$1469 = state$967.allowKeyword ? parseNonComputedProperty$1027() : parseVariableIdentifier$1046();
            // 12.2.1
            if (strict$953 && isRestrictedWord$980(id$1469.name)) {
                throwErrorTolerant$1004({}, Messages$948.StrictVarName);
            }
        }
        if (kind$1468 === 'const') {
            if (!match$1008('=')) {
                throwError$1003({}, Messages$948.NoUnintializedConst);
            }
            expect$1006('=');
            init$1470 = parseAssignmentExpression$1042();
        } else if (match$1008('=')) {
            lex$999();
            init$1470 = parseAssignmentExpression$1042();
        }
        return delegate$962.createVariableDeclarator(id$1469, init$1470);
    }
    function parseVariableDeclarationList$1048(kind$1471) {
        var list$1472 = [];
        do {
            list$1472.push(parseVariableDeclaration$1047(kind$1471));
            if (!match$1008(',')) {
                break;
            }
            lex$999();
        } while (streamIndex$964 < length$961);
        return list$1472;
    }
    function parseVariableStatement$1049() {
        var declarations$1473;
        expectKeyword$1007('var');
        declarations$1473 = parseVariableDeclarationList$1048();
        consumeSemicolon$1012();
        return delegate$962.createVariableDeclaration(declarations$1473, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$1050(kind$1474) {
        var declarations$1475;
        expectKeyword$1007(kind$1474);
        declarations$1475 = parseVariableDeclarationList$1048(kind$1474);
        consumeSemicolon$1012();
        return delegate$962.createVariableDeclaration(declarations$1475, kind$1474);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$1051() {
        var id$1476, src$1477, body$1478;
        lex$999();
        // 'module'
        if (peekLineTerminator$1002()) {
            throwError$1003({}, Messages$948.NewlineAfterModule);
        }
        switch (lookahead$965.type) {
        case Token$943.StringLiteral:
            id$1476 = parsePrimaryExpression$1024();
            body$1478 = parseModuleBlock$1094();
            src$1477 = null;
            break;
        case Token$943.Identifier:
            id$1476 = parseVariableIdentifier$1046();
            body$1478 = null;
            if (!matchContextualKeyword$1010('from')) {
                throwUnexpected$1005(lex$999());
            }
            lex$999();
            src$1477 = parsePrimaryExpression$1024();
            if (src$1477.type !== Syntax$946.Literal) {
                throwError$1003({}, Messages$948.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$1012();
        return delegate$962.createModuleDeclaration(id$1476, src$1477, body$1478);
    }
    function parseExportBatchSpecifier$1052() {
        expect$1006('*');
        return delegate$962.createExportBatchSpecifier();
    }
    function parseExportSpecifier$1053() {
        var id$1479, name$1480 = null;
        id$1479 = parseVariableIdentifier$1046();
        if (matchContextualKeyword$1010('as')) {
            lex$999();
            name$1480 = parseNonComputedProperty$1027();
        }
        return delegate$962.createExportSpecifier(id$1479, name$1480);
    }
    function parseExportDeclaration$1054() {
        var previousAllowKeyword$1481, decl$1482, def$1483, src$1484, specifiers$1485;
        expectKeyword$1007('export');
        if (lookahead$965.type === Token$943.Keyword) {
            switch (lookahead$965.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$962.createExportDeclaration(parseSourceElement$1089(), null, null);
            }
        }
        if (isIdentifierName$996(lookahead$965)) {
            previousAllowKeyword$1481 = state$967.allowKeyword;
            state$967.allowKeyword = true;
            decl$1482 = parseVariableDeclarationList$1048('let');
            state$967.allowKeyword = previousAllowKeyword$1481;
            return delegate$962.createExportDeclaration(decl$1482, null, null);
        }
        specifiers$1485 = [];
        src$1484 = null;
        if (match$1008('*')) {
            specifiers$1485.push(parseExportBatchSpecifier$1052());
        } else {
            expect$1006('{');
            do {
                specifiers$1485.push(parseExportSpecifier$1053());
            } while (match$1008(',') && lex$999());
            expect$1006('}');
        }
        if (matchContextualKeyword$1010('from')) {
            lex$999();
            src$1484 = parsePrimaryExpression$1024();
            if (src$1484.type !== Syntax$946.Literal) {
                throwError$1003({}, Messages$948.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$1012();
        return delegate$962.createExportDeclaration(null, specifiers$1485, src$1484);
    }
    function parseImportDeclaration$1055() {
        var specifiers$1486, kind$1487, src$1488;
        expectKeyword$1007('import');
        specifiers$1486 = [];
        if (isIdentifierName$996(lookahead$965)) {
            kind$1487 = 'default';
            specifiers$1486.push(parseImportSpecifier$1056());
            if (!matchContextualKeyword$1010('from')) {
                throwError$1003({}, Messages$948.NoFromAfterImport);
            }
            lex$999();
        } else if (match$1008('{')) {
            kind$1487 = 'named';
            lex$999();
            do {
                specifiers$1486.push(parseImportSpecifier$1056());
            } while (match$1008(',') && lex$999());
            expect$1006('}');
            if (!matchContextualKeyword$1010('from')) {
                throwError$1003({}, Messages$948.NoFromAfterImport);
            }
            lex$999();
        }
        src$1488 = parsePrimaryExpression$1024();
        if (src$1488.type !== Syntax$946.Literal) {
            throwError$1003({}, Messages$948.InvalidModuleSpecifier);
        }
        consumeSemicolon$1012();
        return delegate$962.createImportDeclaration(specifiers$1486, kind$1487, src$1488);
    }
    function parseImportSpecifier$1056() {
        var id$1489, name$1490 = null;
        id$1489 = parseNonComputedProperty$1027();
        if (matchContextualKeyword$1010('as')) {
            lex$999();
            name$1490 = parseVariableIdentifier$1046();
        }
        return delegate$962.createImportSpecifier(id$1489, name$1490);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$1057() {
        expect$1006(';');
        return delegate$962.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$1058() {
        var expr$1491 = parseExpression$1043();
        consumeSemicolon$1012();
        return delegate$962.createExpressionStatement(expr$1491);
    }
    // 12.5 If statement
    function parseIfStatement$1059() {
        var test$1492, consequent$1493, alternate$1494;
        expectKeyword$1007('if');
        expect$1006('(');
        test$1492 = parseExpression$1043();
        expect$1006(')');
        consequent$1493 = parseStatement$1074();
        if (matchKeyword$1009('else')) {
            lex$999();
            alternate$1494 = parseStatement$1074();
        } else {
            alternate$1494 = null;
        }
        return delegate$962.createIfStatement(test$1492, consequent$1493, alternate$1494);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$1060() {
        var body$1495, test$1496, oldInIteration$1497;
        expectKeyword$1007('do');
        oldInIteration$1497 = state$967.inIteration;
        state$967.inIteration = true;
        body$1495 = parseStatement$1074();
        state$967.inIteration = oldInIteration$1497;
        expectKeyword$1007('while');
        expect$1006('(');
        test$1496 = parseExpression$1043();
        expect$1006(')');
        if (match$1008(';')) {
            lex$999();
        }
        return delegate$962.createDoWhileStatement(body$1495, test$1496);
    }
    function parseWhileStatement$1061() {
        var test$1498, body$1499, oldInIteration$1500;
        expectKeyword$1007('while');
        expect$1006('(');
        test$1498 = parseExpression$1043();
        expect$1006(')');
        oldInIteration$1500 = state$967.inIteration;
        state$967.inIteration = true;
        body$1499 = parseStatement$1074();
        state$967.inIteration = oldInIteration$1500;
        return delegate$962.createWhileStatement(test$1498, body$1499);
    }
    function parseForVariableDeclaration$1062() {
        var token$1501 = lex$999(), declarations$1502 = parseVariableDeclarationList$1048();
        return delegate$962.createVariableDeclaration(declarations$1502, token$1501.value);
    }
    function parseForStatement$1063(opts$1503) {
        var init$1504, test$1505, update$1506, left$1507, right$1508, body$1509, operator$1510, oldInIteration$1511;
        init$1504 = test$1505 = update$1506 = null;
        expectKeyword$1007('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$1010('each')) {
            throwError$1003({}, Messages$948.EachNotAllowed);
        }
        expect$1006('(');
        if (match$1008(';')) {
            lex$999();
        } else {
            if (matchKeyword$1009('var') || matchKeyword$1009('let') || matchKeyword$1009('const')) {
                state$967.allowIn = false;
                init$1504 = parseForVariableDeclaration$1062();
                state$967.allowIn = true;
                if (init$1504.declarations.length === 1) {
                    if (matchKeyword$1009('in') || matchContextualKeyword$1010('of')) {
                        operator$1510 = lookahead$965;
                        if (!((operator$1510.value === 'in' || init$1504.kind !== 'var') && init$1504.declarations[0].init)) {
                            lex$999();
                            left$1507 = init$1504;
                            right$1508 = parseExpression$1043();
                            init$1504 = null;
                        }
                    }
                }
            } else {
                state$967.allowIn = false;
                init$1504 = parseExpression$1043();
                state$967.allowIn = true;
                if (matchContextualKeyword$1010('of')) {
                    operator$1510 = lex$999();
                    left$1507 = init$1504;
                    right$1508 = parseExpression$1043();
                    init$1504 = null;
                } else if (matchKeyword$1009('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$1014(init$1504)) {
                        throwError$1003({}, Messages$948.InvalidLHSInForIn);
                    }
                    operator$1510 = lex$999();
                    left$1507 = init$1504;
                    right$1508 = parseExpression$1043();
                    init$1504 = null;
                }
            }
            if (typeof left$1507 === 'undefined') {
                expect$1006(';');
            }
        }
        if (typeof left$1507 === 'undefined') {
            if (!match$1008(';')) {
                test$1505 = parseExpression$1043();
            }
            expect$1006(';');
            if (!match$1008(')')) {
                update$1506 = parseExpression$1043();
            }
        }
        expect$1006(')');
        oldInIteration$1511 = state$967.inIteration;
        state$967.inIteration = true;
        if (!(opts$1503 !== undefined && opts$1503.ignoreBody)) {
            body$1509 = parseStatement$1074();
        }
        state$967.inIteration = oldInIteration$1511;
        if (typeof left$1507 === 'undefined') {
            return delegate$962.createForStatement(init$1504, test$1505, update$1506, body$1509);
        }
        if (operator$1510.value === 'in') {
            return delegate$962.createForInStatement(left$1507, right$1508, body$1509);
        }
        return delegate$962.createForOfStatement(left$1507, right$1508, body$1509);
    }
    // 12.7 The continue statement
    function parseContinueStatement$1064() {
        var label$1512 = null, key$1513;
        expectKeyword$1007('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$965.value.charCodeAt(0) === 59) {
            lex$999();
            if (!state$967.inIteration) {
                throwError$1003({}, Messages$948.IllegalContinue);
            }
            return delegate$962.createContinueStatement(null);
        }
        if (peekLineTerminator$1002()) {
            if (!state$967.inIteration) {
                throwError$1003({}, Messages$948.IllegalContinue);
            }
            return delegate$962.createContinueStatement(null);
        }
        if (lookahead$965.type === Token$943.Identifier) {
            label$1512 = parseVariableIdentifier$1046();
            key$1513 = '$' + label$1512.name;
            if (!Object.prototype.hasOwnProperty.call(state$967.labelSet, key$1513)) {
                throwError$1003({}, Messages$948.UnknownLabel, label$1512.name);
            }
        }
        consumeSemicolon$1012();
        if (label$1512 === null && !state$967.inIteration) {
            throwError$1003({}, Messages$948.IllegalContinue);
        }
        return delegate$962.createContinueStatement(label$1512);
    }
    // 12.8 The break statement
    function parseBreakStatement$1065() {
        var label$1514 = null, key$1515;
        expectKeyword$1007('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$965.value.charCodeAt(0) === 59) {
            lex$999();
            if (!(state$967.inIteration || state$967.inSwitch)) {
                throwError$1003({}, Messages$948.IllegalBreak);
            }
            return delegate$962.createBreakStatement(null);
        }
        if (peekLineTerminator$1002()) {
            if (!(state$967.inIteration || state$967.inSwitch)) {
                throwError$1003({}, Messages$948.IllegalBreak);
            }
            return delegate$962.createBreakStatement(null);
        }
        if (lookahead$965.type === Token$943.Identifier) {
            label$1514 = parseVariableIdentifier$1046();
            key$1515 = '$' + label$1514.name;
            if (!Object.prototype.hasOwnProperty.call(state$967.labelSet, key$1515)) {
                throwError$1003({}, Messages$948.UnknownLabel, label$1514.name);
            }
        }
        consumeSemicolon$1012();
        if (label$1514 === null && !(state$967.inIteration || state$967.inSwitch)) {
            throwError$1003({}, Messages$948.IllegalBreak);
        }
        return delegate$962.createBreakStatement(label$1514);
    }
    // 12.9 The return statement
    function parseReturnStatement$1066() {
        var argument$1516 = null;
        expectKeyword$1007('return');
        if (!state$967.inFunctionBody) {
            throwErrorTolerant$1004({}, Messages$948.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$976(String(lookahead$965.value).charCodeAt(0))) {
            argument$1516 = parseExpression$1043();
            consumeSemicolon$1012();
            return delegate$962.createReturnStatement(argument$1516);
        }
        if (peekLineTerminator$1002()) {
            return delegate$962.createReturnStatement(null);
        }
        if (!match$1008(';')) {
            if (!match$1008('}') && lookahead$965.type !== Token$943.EOF) {
                argument$1516 = parseExpression$1043();
            }
        }
        consumeSemicolon$1012();
        return delegate$962.createReturnStatement(argument$1516);
    }
    // 12.10 The with statement
    function parseWithStatement$1067() {
        var object$1517, body$1518;
        if (strict$953) {
            throwErrorTolerant$1004({}, Messages$948.StrictModeWith);
        }
        expectKeyword$1007('with');
        expect$1006('(');
        object$1517 = parseExpression$1043();
        expect$1006(')');
        body$1518 = parseStatement$1074();
        return delegate$962.createWithStatement(object$1517, body$1518);
    }
    // 12.10 The swith statement
    function parseSwitchCase$1068() {
        var test$1519, consequent$1520 = [], sourceElement$1521;
        if (matchKeyword$1009('default')) {
            lex$999();
            test$1519 = null;
        } else {
            expectKeyword$1007('case');
            test$1519 = parseExpression$1043();
        }
        expect$1006(':');
        while (streamIndex$964 < length$961) {
            if (match$1008('}') || matchKeyword$1009('default') || matchKeyword$1009('case')) {
                break;
            }
            sourceElement$1521 = parseSourceElement$1089();
            if (typeof sourceElement$1521 === 'undefined') {
                break;
            }
            consequent$1520.push(sourceElement$1521);
        }
        return delegate$962.createSwitchCase(test$1519, consequent$1520);
    }
    function parseSwitchStatement$1069() {
        var discriminant$1522, cases$1523, clause$1524, oldInSwitch$1525, defaultFound$1526;
        expectKeyword$1007('switch');
        expect$1006('(');
        discriminant$1522 = parseExpression$1043();
        expect$1006(')');
        expect$1006('{');
        cases$1523 = [];
        if (match$1008('}')) {
            lex$999();
            return delegate$962.createSwitchStatement(discriminant$1522, cases$1523);
        }
        oldInSwitch$1525 = state$967.inSwitch;
        state$967.inSwitch = true;
        defaultFound$1526 = false;
        while (streamIndex$964 < length$961) {
            if (match$1008('}')) {
                break;
            }
            clause$1524 = parseSwitchCase$1068();
            if (clause$1524.test === null) {
                if (defaultFound$1526) {
                    throwError$1003({}, Messages$948.MultipleDefaultsInSwitch);
                }
                defaultFound$1526 = true;
            }
            cases$1523.push(clause$1524);
        }
        state$967.inSwitch = oldInSwitch$1525;
        expect$1006('}');
        return delegate$962.createSwitchStatement(discriminant$1522, cases$1523);
    }
    // 12.13 The throw statement
    function parseThrowStatement$1070() {
        var argument$1527;
        expectKeyword$1007('throw');
        if (peekLineTerminator$1002()) {
            throwError$1003({}, Messages$948.NewlineAfterThrow);
        }
        argument$1527 = parseExpression$1043();
        consumeSemicolon$1012();
        return delegate$962.createThrowStatement(argument$1527);
    }
    // 12.14 The try statement
    function parseCatchClause$1071() {
        var param$1528, body$1529;
        expectKeyword$1007('catch');
        expect$1006('(');
        if (match$1008(')')) {
            throwUnexpected$1005(lookahead$965);
        }
        param$1528 = parseExpression$1043();
        // 12.14.1
        if (strict$953 && param$1528.type === Syntax$946.Identifier && isRestrictedWord$980(param$1528.name)) {
            throwErrorTolerant$1004({}, Messages$948.StrictCatchVariable);
        }
        expect$1006(')');
        body$1529 = parseBlock$1045();
        return delegate$962.createCatchClause(param$1528, body$1529);
    }
    function parseTryStatement$1072() {
        var block$1530, handlers$1531 = [], finalizer$1532 = null;
        expectKeyword$1007('try');
        block$1530 = parseBlock$1045();
        if (matchKeyword$1009('catch')) {
            handlers$1531.push(parseCatchClause$1071());
        }
        if (matchKeyword$1009('finally')) {
            lex$999();
            finalizer$1532 = parseBlock$1045();
        }
        if (handlers$1531.length === 0 && !finalizer$1532) {
            throwError$1003({}, Messages$948.NoCatchOrFinally);
        }
        return delegate$962.createTryStatement(block$1530, [], handlers$1531, finalizer$1532);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$1073() {
        expectKeyword$1007('debugger');
        consumeSemicolon$1012();
        return delegate$962.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$1074() {
        var type$1533 = lookahead$965.type, expr$1534, labeledBody$1535, key$1536;
        if (type$1533 === Token$943.EOF) {
            throwUnexpected$1005(lookahead$965);
        }
        if (type$1533 === Token$943.Punctuator) {
            switch (lookahead$965.value) {
            case ';':
                return parseEmptyStatement$1057();
            case '{':
                return parseBlock$1045();
            case '(':
                return parseExpressionStatement$1058();
            default:
                break;
            }
        }
        if (type$1533 === Token$943.Keyword) {
            switch (lookahead$965.value) {
            case 'break':
                return parseBreakStatement$1065();
            case 'continue':
                return parseContinueStatement$1064();
            case 'debugger':
                return parseDebuggerStatement$1073();
            case 'do':
                return parseDoWhileStatement$1060();
            case 'for':
                return parseForStatement$1063();
            case 'function':
                return parseFunctionDeclaration$1080();
            case 'class':
                return parseClassDeclaration$1087();
            case 'if':
                return parseIfStatement$1059();
            case 'return':
                return parseReturnStatement$1066();
            case 'switch':
                return parseSwitchStatement$1069();
            case 'throw':
                return parseThrowStatement$1070();
            case 'try':
                return parseTryStatement$1072();
            case 'var':
                return parseVariableStatement$1049();
            case 'while':
                return parseWhileStatement$1061();
            case 'with':
                return parseWithStatement$1067();
            default:
                break;
            }
        }
        expr$1534 = parseExpression$1043();
        // 12.12 Labelled Statements
        if (expr$1534.type === Syntax$946.Identifier && match$1008(':')) {
            lex$999();
            key$1536 = '$' + expr$1534.name;
            if (Object.prototype.hasOwnProperty.call(state$967.labelSet, key$1536)) {
                throwError$1003({}, Messages$948.Redeclaration, 'Label', expr$1534.name);
            }
            state$967.labelSet[key$1536] = true;
            labeledBody$1535 = parseStatement$1074();
            delete state$967.labelSet[key$1536];
            return delegate$962.createLabeledStatement(expr$1534, labeledBody$1535);
        }
        consumeSemicolon$1012();
        return delegate$962.createExpressionStatement(expr$1534);
    }
    // 13 Function Definition
    function parseConciseBody$1075() {
        if (match$1008('{')) {
            return parseFunctionSourceElements$1076();
        }
        return parseAssignmentExpression$1042();
    }
    function parseFunctionSourceElements$1076() {
        var sourceElement$1537, sourceElements$1538 = [], token$1539, directive$1540, firstRestricted$1541, oldLabelSet$1542, oldInIteration$1543, oldInSwitch$1544, oldInFunctionBody$1545, oldParenthesizedCount$1546;
        expect$1006('{');
        while (streamIndex$964 < length$961) {
            if (lookahead$965.type !== Token$943.StringLiteral) {
                break;
            }
            token$1539 = lookahead$965;
            sourceElement$1537 = parseSourceElement$1089();
            sourceElements$1538.push(sourceElement$1537);
            if (sourceElement$1537.expression.type !== Syntax$946.Literal) {
                // this is not directive
                break;
            }
            directive$1540 = token$1539.value;
            if (directive$1540 === 'use strict') {
                strict$953 = true;
                if (firstRestricted$1541) {
                    throwErrorTolerant$1004(firstRestricted$1541, Messages$948.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1541 && token$1539.octal) {
                    firstRestricted$1541 = token$1539;
                }
            }
        }
        oldLabelSet$1542 = state$967.labelSet;
        oldInIteration$1543 = state$967.inIteration;
        oldInSwitch$1544 = state$967.inSwitch;
        oldInFunctionBody$1545 = state$967.inFunctionBody;
        oldParenthesizedCount$1546 = state$967.parenthesizedCount;
        state$967.labelSet = {};
        state$967.inIteration = false;
        state$967.inSwitch = false;
        state$967.inFunctionBody = true;
        state$967.parenthesizedCount = 0;
        while (streamIndex$964 < length$961) {
            if (match$1008('}')) {
                break;
            }
            sourceElement$1537 = parseSourceElement$1089();
            if (typeof sourceElement$1537 === 'undefined') {
                break;
            }
            sourceElements$1538.push(sourceElement$1537);
        }
        expect$1006('}');
        state$967.labelSet = oldLabelSet$1542;
        state$967.inIteration = oldInIteration$1543;
        state$967.inSwitch = oldInSwitch$1544;
        state$967.inFunctionBody = oldInFunctionBody$1545;
        state$967.parenthesizedCount = oldParenthesizedCount$1546;
        return delegate$962.createBlockStatement(sourceElements$1538);
    }
    function validateParam$1077(options$1547, param$1548, name$1549) {
        var key$1550 = '$' + name$1549;
        if (strict$953) {
            if (isRestrictedWord$980(name$1549)) {
                options$1547.stricted = param$1548;
                options$1547.message = Messages$948.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1547.paramSet, key$1550)) {
                options$1547.stricted = param$1548;
                options$1547.message = Messages$948.StrictParamDupe;
            }
        } else if (!options$1547.firstRestricted) {
            if (isRestrictedWord$980(name$1549)) {
                options$1547.firstRestricted = param$1548;
                options$1547.message = Messages$948.StrictParamName;
            } else if (isStrictModeReservedWord$979(name$1549)) {
                options$1547.firstRestricted = param$1548;
                options$1547.message = Messages$948.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1547.paramSet, key$1550)) {
                options$1547.firstRestricted = param$1548;
                options$1547.message = Messages$948.StrictParamDupe;
            }
        }
        options$1547.paramSet[key$1550] = true;
    }
    function parseParam$1078(options$1551) {
        var token$1552, rest$1553, param$1554, def$1555;
        token$1552 = lookahead$965;
        if (token$1552.value === '...') {
            token$1552 = lex$999();
            rest$1553 = true;
        }
        if (match$1008('[')) {
            param$1554 = parseArrayInitialiser$1015();
            reinterpretAsDestructuredParameter$1039(options$1551, param$1554);
        } else if (match$1008('{')) {
            if (rest$1553) {
                throwError$1003({}, Messages$948.ObjectPatternAsRestParameter);
            }
            param$1554 = parseObjectInitialiser$1020();
            reinterpretAsDestructuredParameter$1039(options$1551, param$1554);
        } else {
            param$1554 = parseVariableIdentifier$1046();
            validateParam$1077(options$1551, token$1552, token$1552.value);
            if (match$1008('=')) {
                if (rest$1553) {
                    throwErrorTolerant$1004(lookahead$965, Messages$948.DefaultRestParameter);
                }
                lex$999();
                def$1555 = parseAssignmentExpression$1042();
                ++options$1551.defaultCount;
            }
        }
        if (rest$1553) {
            if (!match$1008(')')) {
                throwError$1003({}, Messages$948.ParameterAfterRestParameter);
            }
            options$1551.rest = param$1554;
            return false;
        }
        options$1551.params.push(param$1554);
        options$1551.defaults.push(def$1555);
        return !match$1008(')');
    }
    function parseParams$1079(firstRestricted$1556) {
        var options$1557;
        options$1557 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1556
        };
        expect$1006('(');
        if (!match$1008(')')) {
            options$1557.paramSet = {};
            while (streamIndex$964 < length$961) {
                if (!parseParam$1078(options$1557)) {
                    break;
                }
                expect$1006(',');
            }
        }
        expect$1006(')');
        if (options$1557.defaultCount === 0) {
            options$1557.defaults = [];
        }
        return options$1557;
    }
    function parseFunctionDeclaration$1080() {
        var id$1558, body$1559, token$1560, tmp$1561, firstRestricted$1562, message$1563, previousStrict$1564, previousYieldAllowed$1565, generator$1566, expression$1567;
        expectKeyword$1007('function');
        generator$1566 = false;
        if (match$1008('*')) {
            lex$999();
            generator$1566 = true;
        }
        token$1560 = lookahead$965;
        id$1558 = parseVariableIdentifier$1046();
        if (strict$953) {
            if (isRestrictedWord$980(token$1560.value)) {
                throwErrorTolerant$1004(token$1560, Messages$948.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$980(token$1560.value)) {
                firstRestricted$1562 = token$1560;
                message$1563 = Messages$948.StrictFunctionName;
            } else if (isStrictModeReservedWord$979(token$1560.value)) {
                firstRestricted$1562 = token$1560;
                message$1563 = Messages$948.StrictReservedWord;
            }
        }
        tmp$1561 = parseParams$1079(firstRestricted$1562);
        firstRestricted$1562 = tmp$1561.firstRestricted;
        if (tmp$1561.message) {
            message$1563 = tmp$1561.message;
        }
        previousStrict$1564 = strict$953;
        previousYieldAllowed$1565 = state$967.yieldAllowed;
        state$967.yieldAllowed = generator$1566;
        // here we redo some work in order to set 'expression'
        expression$1567 = !match$1008('{');
        body$1559 = parseConciseBody$1075();
        if (strict$953 && firstRestricted$1562) {
            throwError$1003(firstRestricted$1562, message$1563);
        }
        if (strict$953 && tmp$1561.stricted) {
            throwErrorTolerant$1004(tmp$1561.stricted, message$1563);
        }
        if (state$967.yieldAllowed && !state$967.yieldFound) {
            throwErrorTolerant$1004({}, Messages$948.NoYieldInGenerator);
        }
        strict$953 = previousStrict$1564;
        state$967.yieldAllowed = previousYieldAllowed$1565;
        return delegate$962.createFunctionDeclaration(id$1558, tmp$1561.params, tmp$1561.defaults, body$1559, tmp$1561.rest, generator$1566, expression$1567);
    }
    function parseFunctionExpression$1081() {
        var token$1568, id$1569 = null, firstRestricted$1570, message$1571, tmp$1572, body$1573, previousStrict$1574, previousYieldAllowed$1575, generator$1576, expression$1577;
        expectKeyword$1007('function');
        generator$1576 = false;
        if (match$1008('*')) {
            lex$999();
            generator$1576 = true;
        }
        if (!match$1008('(')) {
            token$1568 = lookahead$965;
            id$1569 = parseVariableIdentifier$1046();
            if (strict$953) {
                if (isRestrictedWord$980(token$1568.value)) {
                    throwErrorTolerant$1004(token$1568, Messages$948.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$980(token$1568.value)) {
                    firstRestricted$1570 = token$1568;
                    message$1571 = Messages$948.StrictFunctionName;
                } else if (isStrictModeReservedWord$979(token$1568.value)) {
                    firstRestricted$1570 = token$1568;
                    message$1571 = Messages$948.StrictReservedWord;
                }
            }
        }
        tmp$1572 = parseParams$1079(firstRestricted$1570);
        firstRestricted$1570 = tmp$1572.firstRestricted;
        if (tmp$1572.message) {
            message$1571 = tmp$1572.message;
        }
        previousStrict$1574 = strict$953;
        previousYieldAllowed$1575 = state$967.yieldAllowed;
        state$967.yieldAllowed = generator$1576;
        // here we redo some work in order to set 'expression'
        expression$1577 = !match$1008('{');
        body$1573 = parseConciseBody$1075();
        if (strict$953 && firstRestricted$1570) {
            throwError$1003(firstRestricted$1570, message$1571);
        }
        if (strict$953 && tmp$1572.stricted) {
            throwErrorTolerant$1004(tmp$1572.stricted, message$1571);
        }
        if (state$967.yieldAllowed && !state$967.yieldFound) {
            throwErrorTolerant$1004({}, Messages$948.NoYieldInGenerator);
        }
        strict$953 = previousStrict$1574;
        state$967.yieldAllowed = previousYieldAllowed$1575;
        return delegate$962.createFunctionExpression(id$1569, tmp$1572.params, tmp$1572.defaults, body$1573, tmp$1572.rest, generator$1576, expression$1577);
    }
    function parseYieldExpression$1082() {
        var delegateFlag$1578, expr$1579, previousYieldAllowed$1580;
        expectKeyword$1007('yield');
        if (!state$967.yieldAllowed) {
            throwErrorTolerant$1004({}, Messages$948.IllegalYield);
        }
        delegateFlag$1578 = false;
        if (match$1008('*')) {
            lex$999();
            delegateFlag$1578 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1580 = state$967.yieldAllowed;
        state$967.yieldAllowed = false;
        expr$1579 = parseAssignmentExpression$1042();
        state$967.yieldAllowed = previousYieldAllowed$1580;
        state$967.yieldFound = true;
        return delegate$962.createYieldExpression(expr$1579, delegateFlag$1578);
    }
    // 14 Classes
    function parseMethodDefinition$1083(existingPropNames$1581) {
        var token$1582, key$1583, param$1584, propType$1585, isValidDuplicateProp$1586 = false;
        if (lookahead$965.value === 'static') {
            propType$1585 = ClassPropertyType$951.static;
            lex$999();
        } else {
            propType$1585 = ClassPropertyType$951.prototype;
        }
        if (match$1008('*')) {
            lex$999();
            return delegate$962.createMethodDefinition(propType$1585, '', parseObjectPropertyKey$1018(), parsePropertyMethodFunction$1017({ generator: true }));
        }
        token$1582 = lookahead$965;
        key$1583 = parseObjectPropertyKey$1018();
        if (token$1582.value === 'get' && !match$1008('(')) {
            key$1583 = parseObjectPropertyKey$1018();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1581[propType$1585].hasOwnProperty(key$1583.name)) {
                isValidDuplicateProp$1586 = existingPropNames$1581[propType$1585][key$1583.name].get === undefined && existingPropNames$1581[propType$1585][key$1583.name].data === undefined && existingPropNames$1581[propType$1585][key$1583.name].set !== undefined;
                if (!isValidDuplicateProp$1586) {
                    throwError$1003(key$1583, Messages$948.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1581[propType$1585][key$1583.name] = {};
            }
            existingPropNames$1581[propType$1585][key$1583.name].get = true;
            expect$1006('(');
            expect$1006(')');
            return delegate$962.createMethodDefinition(propType$1585, 'get', key$1583, parsePropertyFunction$1016({ generator: false }));
        }
        if (token$1582.value === 'set' && !match$1008('(')) {
            key$1583 = parseObjectPropertyKey$1018();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1581[propType$1585].hasOwnProperty(key$1583.name)) {
                isValidDuplicateProp$1586 = existingPropNames$1581[propType$1585][key$1583.name].set === undefined && existingPropNames$1581[propType$1585][key$1583.name].data === undefined && existingPropNames$1581[propType$1585][key$1583.name].get !== undefined;
                if (!isValidDuplicateProp$1586) {
                    throwError$1003(key$1583, Messages$948.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1581[propType$1585][key$1583.name] = {};
            }
            existingPropNames$1581[propType$1585][key$1583.name].set = true;
            expect$1006('(');
            token$1582 = lookahead$965;
            param$1584 = [parseVariableIdentifier$1046()];
            expect$1006(')');
            return delegate$962.createMethodDefinition(propType$1585, 'set', key$1583, parsePropertyFunction$1016({
                params: param$1584,
                generator: false,
                name: token$1582
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1581[propType$1585].hasOwnProperty(key$1583.name)) {
            throwError$1003(key$1583, Messages$948.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1581[propType$1585][key$1583.name] = {};
        }
        existingPropNames$1581[propType$1585][key$1583.name].data = true;
        return delegate$962.createMethodDefinition(propType$1585, '', key$1583, parsePropertyMethodFunction$1017({ generator: false }));
    }
    function parseClassElement$1084(existingProps$1587) {
        if (match$1008(';')) {
            lex$999();
            return;
        }
        return parseMethodDefinition$1083(existingProps$1587);
    }
    function parseClassBody$1085() {
        var classElement$1588, classElements$1589 = [], existingProps$1590 = {};
        existingProps$1590[ClassPropertyType$951.static] = {};
        existingProps$1590[ClassPropertyType$951.prototype] = {};
        expect$1006('{');
        while (streamIndex$964 < length$961) {
            if (match$1008('}')) {
                break;
            }
            classElement$1588 = parseClassElement$1084(existingProps$1590);
            if (typeof classElement$1588 !== 'undefined') {
                classElements$1589.push(classElement$1588);
            }
        }
        expect$1006('}');
        return delegate$962.createClassBody(classElements$1589);
    }
    function parseClassExpression$1086() {
        var id$1591, previousYieldAllowed$1592, superClass$1593 = null;
        expectKeyword$1007('class');
        if (!matchKeyword$1009('extends') && !match$1008('{')) {
            id$1591 = parseVariableIdentifier$1046();
        }
        if (matchKeyword$1009('extends')) {
            expectKeyword$1007('extends');
            previousYieldAllowed$1592 = state$967.yieldAllowed;
            state$967.yieldAllowed = false;
            superClass$1593 = parseAssignmentExpression$1042();
            state$967.yieldAllowed = previousYieldAllowed$1592;
        }
        return delegate$962.createClassExpression(id$1591, superClass$1593, parseClassBody$1085());
    }
    function parseClassDeclaration$1087() {
        var id$1594, previousYieldAllowed$1595, superClass$1596 = null;
        expectKeyword$1007('class');
        id$1594 = parseVariableIdentifier$1046();
        if (matchKeyword$1009('extends')) {
            expectKeyword$1007('extends');
            previousYieldAllowed$1595 = state$967.yieldAllowed;
            state$967.yieldAllowed = false;
            superClass$1596 = parseAssignmentExpression$1042();
            state$967.yieldAllowed = previousYieldAllowed$1595;
        }
        return delegate$962.createClassDeclaration(id$1594, superClass$1596, parseClassBody$1085());
    }
    // 15 Program
    function matchModuleDeclaration$1088() {
        var id$1597;
        if (matchContextualKeyword$1010('module')) {
            id$1597 = lookahead2$1001();
            return id$1597.type === Token$943.StringLiteral || id$1597.type === Token$943.Identifier;
        }
        return false;
    }
    function parseSourceElement$1089() {
        if (lookahead$965.type === Token$943.Keyword) {
            switch (lookahead$965.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$1050(lookahead$965.value);
            case 'function':
                return parseFunctionDeclaration$1080();
            case 'export':
                return parseExportDeclaration$1054();
            case 'import':
                return parseImportDeclaration$1055();
            default:
                return parseStatement$1074();
            }
        }
        if (matchModuleDeclaration$1088()) {
            throwError$1003({}, Messages$948.NestedModule);
        }
        if (lookahead$965.type !== Token$943.EOF) {
            return parseStatement$1074();
        }
    }
    function parseProgramElement$1090() {
        if (lookahead$965.type === Token$943.Keyword) {
            switch (lookahead$965.value) {
            case 'export':
                return parseExportDeclaration$1054();
            case 'import':
                return parseImportDeclaration$1055();
            }
        }
        if (matchModuleDeclaration$1088()) {
            return parseModuleDeclaration$1051();
        }
        return parseSourceElement$1089();
    }
    function parseProgramElements$1091() {
        var sourceElement$1598, sourceElements$1599 = [], token$1600, directive$1601, firstRestricted$1602;
        while (streamIndex$964 < length$961) {
            token$1600 = lookahead$965;
            if (token$1600.type !== Token$943.StringLiteral) {
                break;
            }
            sourceElement$1598 = parseProgramElement$1090();
            sourceElements$1599.push(sourceElement$1598);
            if (sourceElement$1598.expression.type !== Syntax$946.Literal) {
                // this is not directive
                break;
            }
            directive$1601 = token$1600.value;
            if (directive$1601 === 'use strict') {
                strict$953 = true;
                if (firstRestricted$1602) {
                    throwErrorTolerant$1004(firstRestricted$1602, Messages$948.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1602 && token$1600.octal) {
                    firstRestricted$1602 = token$1600;
                }
            }
        }
        while (streamIndex$964 < length$961) {
            sourceElement$1598 = parseProgramElement$1090();
            if (typeof sourceElement$1598 === 'undefined') {
                break;
            }
            sourceElements$1599.push(sourceElement$1598);
        }
        return sourceElements$1599;
    }
    function parseModuleElement$1092() {
        return parseSourceElement$1089();
    }
    function parseModuleElements$1093() {
        var list$1603 = [], statement$1604;
        while (streamIndex$964 < length$961) {
            if (match$1008('}')) {
                break;
            }
            statement$1604 = parseModuleElement$1092();
            if (typeof statement$1604 === 'undefined') {
                break;
            }
            list$1603.push(statement$1604);
        }
        return list$1603;
    }
    function parseModuleBlock$1094() {
        var block$1605;
        expect$1006('{');
        block$1605 = parseModuleElements$1093();
        expect$1006('}');
        return delegate$962.createBlockStatement(block$1605);
    }
    function parseProgram$1095() {
        var body$1606;
        strict$953 = false;
        peek$1000();
        body$1606 = parseProgramElements$1091();
        return delegate$962.createProgram(body$1606);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1096(type$1607, value$1608, start$1609, end$1610, loc$1611) {
        assert$969(typeof start$1609 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$968.comments.length > 0) {
            if (extra$968.comments[extra$968.comments.length - 1].range[1] > start$1609) {
                return;
            }
        }
        extra$968.comments.push({
            type: type$1607,
            value: value$1608,
            range: [
                start$1609,
                end$1610
            ],
            loc: loc$1611
        });
    }
    function scanComment$1097() {
        var comment$1612, ch$1613, loc$1614, start$1615, blockComment$1616, lineComment$1617;
        comment$1612 = '';
        blockComment$1616 = false;
        lineComment$1617 = false;
        while (index$954 < length$961) {
            ch$1613 = source$952[index$954];
            if (lineComment$1617) {
                ch$1613 = source$952[index$954++];
                if (isLineTerminator$975(ch$1613.charCodeAt(0))) {
                    loc$1614.end = {
                        line: lineNumber$955,
                        column: index$954 - lineStart$956 - 1
                    };
                    lineComment$1617 = false;
                    addComment$1096('Line', comment$1612, start$1615, index$954 - 1, loc$1614);
                    if (ch$1613 === '\r' && source$952[index$954] === '\n') {
                        ++index$954;
                    }
                    ++lineNumber$955;
                    lineStart$956 = index$954;
                    comment$1612 = '';
                } else if (index$954 >= length$961) {
                    lineComment$1617 = false;
                    comment$1612 += ch$1613;
                    loc$1614.end = {
                        line: lineNumber$955,
                        column: length$961 - lineStart$956
                    };
                    addComment$1096('Line', comment$1612, start$1615, length$961, loc$1614);
                } else {
                    comment$1612 += ch$1613;
                }
            } else if (blockComment$1616) {
                if (isLineTerminator$975(ch$1613.charCodeAt(0))) {
                    if (ch$1613 === '\r' && source$952[index$954 + 1] === '\n') {
                        ++index$954;
                        comment$1612 += '\r\n';
                    } else {
                        comment$1612 += ch$1613;
                    }
                    ++lineNumber$955;
                    ++index$954;
                    lineStart$956 = index$954;
                    if (index$954 >= length$961) {
                        throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1613 = source$952[index$954++];
                    if (index$954 >= length$961) {
                        throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1612 += ch$1613;
                    if (ch$1613 === '*') {
                        ch$1613 = source$952[index$954];
                        if (ch$1613 === '/') {
                            comment$1612 = comment$1612.substr(0, comment$1612.length - 1);
                            blockComment$1616 = false;
                            ++index$954;
                            loc$1614.end = {
                                line: lineNumber$955,
                                column: index$954 - lineStart$956
                            };
                            addComment$1096('Block', comment$1612, start$1615, index$954, loc$1614);
                            comment$1612 = '';
                        }
                    }
                }
            } else if (ch$1613 === '/') {
                ch$1613 = source$952[index$954 + 1];
                if (ch$1613 === '/') {
                    loc$1614 = {
                        start: {
                            line: lineNumber$955,
                            column: index$954 - lineStart$956
                        }
                    };
                    start$1615 = index$954;
                    index$954 += 2;
                    lineComment$1617 = true;
                    if (index$954 >= length$961) {
                        loc$1614.end = {
                            line: lineNumber$955,
                            column: index$954 - lineStart$956
                        };
                        lineComment$1617 = false;
                        addComment$1096('Line', comment$1612, start$1615, index$954, loc$1614);
                    }
                } else if (ch$1613 === '*') {
                    start$1615 = index$954;
                    index$954 += 2;
                    blockComment$1616 = true;
                    loc$1614 = {
                        start: {
                            line: lineNumber$955,
                            column: index$954 - lineStart$956 - 2
                        }
                    };
                    if (index$954 >= length$961) {
                        throwError$1003({}, Messages$948.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$974(ch$1613.charCodeAt(0))) {
                ++index$954;
            } else if (isLineTerminator$975(ch$1613.charCodeAt(0))) {
                ++index$954;
                if (ch$1613 === '\r' && source$952[index$954] === '\n') {
                    ++index$954;
                }
                ++lineNumber$955;
                lineStart$956 = index$954;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1098() {
        var i$1618, entry$1619, comment$1620, comments$1621 = [];
        for (i$1618 = 0; i$1618 < extra$968.comments.length; ++i$1618) {
            entry$1619 = extra$968.comments[i$1618];
            comment$1620 = {
                type: entry$1619.type,
                value: entry$1619.value
            };
            if (extra$968.range) {
                comment$1620.range = entry$1619.range;
            }
            if (extra$968.loc) {
                comment$1620.loc = entry$1619.loc;
            }
            comments$1621.push(comment$1620);
        }
        extra$968.comments = comments$1621;
    }
    function collectToken$1099() {
        var start$1622, loc$1623, token$1624, range$1625, value$1626;
        skipComment$982();
        start$1622 = index$954;
        loc$1623 = {
            start: {
                line: lineNumber$955,
                column: index$954 - lineStart$956
            }
        };
        token$1624 = extra$968.advance();
        loc$1623.end = {
            line: lineNumber$955,
            column: index$954 - lineStart$956
        };
        if (token$1624.type !== Token$943.EOF) {
            range$1625 = [
                token$1624.range[0],
                token$1624.range[1]
            ];
            value$1626 = source$952.slice(token$1624.range[0], token$1624.range[1]);
            extra$968.tokens.push({
                type: TokenName$944[token$1624.type],
                value: value$1626,
                range: range$1625,
                loc: loc$1623
            });
        }
        return token$1624;
    }
    function collectRegex$1100() {
        var pos$1627, loc$1628, regex$1629, token$1630;
        skipComment$982();
        pos$1627 = index$954;
        loc$1628 = {
            start: {
                line: lineNumber$955,
                column: index$954 - lineStart$956
            }
        };
        regex$1629 = extra$968.scanRegExp();
        loc$1628.end = {
            line: lineNumber$955,
            column: index$954 - lineStart$956
        };
        if (!extra$968.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$968.tokens.length > 0) {
                token$1630 = extra$968.tokens[extra$968.tokens.length - 1];
                if (token$1630.range[0] === pos$1627 && token$1630.type === 'Punctuator') {
                    if (token$1630.value === '/' || token$1630.value === '/=') {
                        extra$968.tokens.pop();
                    }
                }
            }
            extra$968.tokens.push({
                type: 'RegularExpression',
                value: regex$1629.literal,
                range: [
                    pos$1627,
                    index$954
                ],
                loc: loc$1628
            });
        }
        return regex$1629;
    }
    function filterTokenLocation$1101() {
        var i$1631, entry$1632, token$1633, tokens$1634 = [];
        for (i$1631 = 0; i$1631 < extra$968.tokens.length; ++i$1631) {
            entry$1632 = extra$968.tokens[i$1631];
            token$1633 = {
                type: entry$1632.type,
                value: entry$1632.value
            };
            if (extra$968.range) {
                token$1633.range = entry$1632.range;
            }
            if (extra$968.loc) {
                token$1633.loc = entry$1632.loc;
            }
            tokens$1634.push(token$1633);
        }
        extra$968.tokens = tokens$1634;
    }
    function LocationMarker$1102() {
        var sm_index$1635 = lookahead$965 ? lookahead$965.sm_range[0] : 0;
        var sm_lineStart$1636 = lookahead$965 ? lookahead$965.sm_lineStart : 0;
        var sm_lineNumber$1637 = lookahead$965 ? lookahead$965.sm_lineNumber : 1;
        this.range = [
            sm_index$1635,
            sm_index$1635
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1637,
                column: sm_index$1635 - sm_lineStart$1636
            },
            end: {
                line: sm_lineNumber$1637,
                column: sm_index$1635 - sm_lineStart$1636
            }
        };
    }
    LocationMarker$1102.prototype = {
        constructor: LocationMarker$1102,
        end: function () {
            this.range[1] = sm_index$960;
            this.loc.end.line = sm_lineNumber$957;
            this.loc.end.column = sm_index$960 - sm_lineStart$958;
        },
        applyGroup: function (node$1638) {
            if (extra$968.range) {
                node$1638.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$968.loc) {
                node$1638.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1638 = delegate$962.postProcess(node$1638);
            }
        },
        apply: function (node$1639) {
            var nodeType$1640 = typeof node$1639;
            assert$969(nodeType$1640 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1640);
            if (extra$968.range) {
                node$1639.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$968.loc) {
                node$1639.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1639 = delegate$962.postProcess(node$1639);
            }
        }
    };
    function createLocationMarker$1103() {
        return new LocationMarker$1102();
    }
    function trackGroupExpression$1104() {
        var marker$1641, expr$1642;
        marker$1641 = createLocationMarker$1103();
        expect$1006('(');
        ++state$967.parenthesizedCount;
        expr$1642 = parseExpression$1043();
        expect$1006(')');
        marker$1641.end();
        marker$1641.applyGroup(expr$1642);
        return expr$1642;
    }
    function trackLeftHandSideExpression$1105() {
        var marker$1643, expr$1644;
        // skipComment();
        marker$1643 = createLocationMarker$1103();
        expr$1644 = matchKeyword$1009('new') ? parseNewExpression$1030() : parsePrimaryExpression$1024();
        while (match$1008('.') || match$1008('[') || lookahead$965.type === Token$943.Template) {
            if (match$1008('[')) {
                expr$1644 = delegate$962.createMemberExpression('[', expr$1644, parseComputedMember$1029());
                marker$1643.end();
                marker$1643.apply(expr$1644);
            } else if (match$1008('.')) {
                expr$1644 = delegate$962.createMemberExpression('.', expr$1644, parseNonComputedMember$1028());
                marker$1643.end();
                marker$1643.apply(expr$1644);
            } else {
                expr$1644 = delegate$962.createTaggedTemplateExpression(expr$1644, parseTemplateLiteral$1022());
                marker$1643.end();
                marker$1643.apply(expr$1644);
            }
        }
        return expr$1644;
    }
    function trackLeftHandSideExpressionAllowCall$1106() {
        var marker$1645, expr$1646, args$1647;
        // skipComment();
        marker$1645 = createLocationMarker$1103();
        expr$1646 = matchKeyword$1009('new') ? parseNewExpression$1030() : parsePrimaryExpression$1024();
        while (match$1008('.') || match$1008('[') || match$1008('(') || lookahead$965.type === Token$943.Template) {
            if (match$1008('(')) {
                args$1647 = parseArguments$1025();
                expr$1646 = delegate$962.createCallExpression(expr$1646, args$1647);
                marker$1645.end();
                marker$1645.apply(expr$1646);
            } else if (match$1008('[')) {
                expr$1646 = delegate$962.createMemberExpression('[', expr$1646, parseComputedMember$1029());
                marker$1645.end();
                marker$1645.apply(expr$1646);
            } else if (match$1008('.')) {
                expr$1646 = delegate$962.createMemberExpression('.', expr$1646, parseNonComputedMember$1028());
                marker$1645.end();
                marker$1645.apply(expr$1646);
            } else {
                expr$1646 = delegate$962.createTaggedTemplateExpression(expr$1646, parseTemplateLiteral$1022());
                marker$1645.end();
                marker$1645.apply(expr$1646);
            }
        }
        return expr$1646;
    }
    function filterGroup$1107(node$1648) {
        var n$1649, i$1650, entry$1651;
        n$1649 = Object.prototype.toString.apply(node$1648) === '[object Array]' ? [] : {};
        for (i$1650 in node$1648) {
            if (node$1648.hasOwnProperty(i$1650) && i$1650 !== 'groupRange' && i$1650 !== 'groupLoc') {
                entry$1651 = node$1648[i$1650];
                if (entry$1651 === null || typeof entry$1651 !== 'object' || entry$1651 instanceof RegExp) {
                    n$1649[i$1650] = entry$1651;
                } else {
                    n$1649[i$1650] = filterGroup$1107(entry$1651);
                }
            }
        }
        return n$1649;
    }
    function wrapTrackingFunction$1108(range$1652, loc$1653) {
        return function (parseFunction$1654) {
            function isBinary$1655(node$1657) {
                return node$1657.type === Syntax$946.LogicalExpression || node$1657.type === Syntax$946.BinaryExpression;
            }
            function visit$1656(node$1658) {
                var start$1659, end$1660;
                if (isBinary$1655(node$1658.left)) {
                    visit$1656(node$1658.left);
                }
                if (isBinary$1655(node$1658.right)) {
                    visit$1656(node$1658.right);
                }
                if (range$1652) {
                    if (node$1658.left.groupRange || node$1658.right.groupRange) {
                        start$1659 = node$1658.left.groupRange ? node$1658.left.groupRange[0] : node$1658.left.range[0];
                        end$1660 = node$1658.right.groupRange ? node$1658.right.groupRange[1] : node$1658.right.range[1];
                        node$1658.range = [
                            start$1659,
                            end$1660
                        ];
                    } else if (typeof node$1658.range === 'undefined') {
                        start$1659 = node$1658.left.range[0];
                        end$1660 = node$1658.right.range[1];
                        node$1658.range = [
                            start$1659,
                            end$1660
                        ];
                    }
                }
                if (loc$1653) {
                    if (node$1658.left.groupLoc || node$1658.right.groupLoc) {
                        start$1659 = node$1658.left.groupLoc ? node$1658.left.groupLoc.start : node$1658.left.loc.start;
                        end$1660 = node$1658.right.groupLoc ? node$1658.right.groupLoc.end : node$1658.right.loc.end;
                        node$1658.loc = {
                            start: start$1659,
                            end: end$1660
                        };
                        node$1658 = delegate$962.postProcess(node$1658);
                    } else if (typeof node$1658.loc === 'undefined') {
                        node$1658.loc = {
                            start: node$1658.left.loc.start,
                            end: node$1658.right.loc.end
                        };
                        node$1658 = delegate$962.postProcess(node$1658);
                    }
                }
            }
            return function () {
                var marker$1661, node$1662, curr$1663 = lookahead$965;
                marker$1661 = createLocationMarker$1103();
                node$1662 = parseFunction$1654.apply(null, arguments);
                marker$1661.end();
                if (node$1662.type !== Syntax$946.Program) {
                    if (curr$1663.leadingComments) {
                        node$1662.leadingComments = curr$1663.leadingComments;
                    }
                    if (curr$1663.trailingComments) {
                        node$1662.trailingComments = curr$1663.trailingComments;
                    }
                }
                if (range$1652 && typeof node$1662.range === 'undefined') {
                    marker$1661.apply(node$1662);
                }
                if (loc$1653 && typeof node$1662.loc === 'undefined') {
                    marker$1661.apply(node$1662);
                }
                if (isBinary$1655(node$1662)) {
                    visit$1656(node$1662);
                }
                return node$1662;
            };
        };
    }
    function patch$1109() {
        var wrapTracking$1664;
        if (extra$968.comments) {
            extra$968.skipComment = skipComment$982;
            skipComment$982 = scanComment$1097;
        }
        if (extra$968.range || extra$968.loc) {
            extra$968.parseGroupExpression = parseGroupExpression$1023;
            extra$968.parseLeftHandSideExpression = parseLeftHandSideExpression$1032;
            extra$968.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$1031;
            parseGroupExpression$1023 = trackGroupExpression$1104;
            parseLeftHandSideExpression$1032 = trackLeftHandSideExpression$1105;
            parseLeftHandSideExpressionAllowCall$1031 = trackLeftHandSideExpressionAllowCall$1106;
            wrapTracking$1664 = wrapTrackingFunction$1108(extra$968.range, extra$968.loc);
            extra$968.parseArrayInitialiser = parseArrayInitialiser$1015;
            extra$968.parseAssignmentExpression = parseAssignmentExpression$1042;
            extra$968.parseBinaryExpression = parseBinaryExpression$1036;
            extra$968.parseBlock = parseBlock$1045;
            extra$968.parseFunctionSourceElements = parseFunctionSourceElements$1076;
            extra$968.parseCatchClause = parseCatchClause$1071;
            extra$968.parseComputedMember = parseComputedMember$1029;
            extra$968.parseConditionalExpression = parseConditionalExpression$1037;
            extra$968.parseConstLetDeclaration = parseConstLetDeclaration$1050;
            extra$968.parseExportBatchSpecifier = parseExportBatchSpecifier$1052;
            extra$968.parseExportDeclaration = parseExportDeclaration$1054;
            extra$968.parseExportSpecifier = parseExportSpecifier$1053;
            extra$968.parseExpression = parseExpression$1043;
            extra$968.parseForVariableDeclaration = parseForVariableDeclaration$1062;
            extra$968.parseFunctionDeclaration = parseFunctionDeclaration$1080;
            extra$968.parseFunctionExpression = parseFunctionExpression$1081;
            extra$968.parseParams = parseParams$1079;
            extra$968.parseImportDeclaration = parseImportDeclaration$1055;
            extra$968.parseImportSpecifier = parseImportSpecifier$1056;
            extra$968.parseModuleDeclaration = parseModuleDeclaration$1051;
            extra$968.parseModuleBlock = parseModuleBlock$1094;
            extra$968.parseNewExpression = parseNewExpression$1030;
            extra$968.parseNonComputedProperty = parseNonComputedProperty$1027;
            extra$968.parseObjectInitialiser = parseObjectInitialiser$1020;
            extra$968.parseObjectProperty = parseObjectProperty$1019;
            extra$968.parseObjectPropertyKey = parseObjectPropertyKey$1018;
            extra$968.parsePostfixExpression = parsePostfixExpression$1033;
            extra$968.parsePrimaryExpression = parsePrimaryExpression$1024;
            extra$968.parseProgram = parseProgram$1095;
            extra$968.parsePropertyFunction = parsePropertyFunction$1016;
            extra$968.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$1026;
            extra$968.parseTemplateElement = parseTemplateElement$1021;
            extra$968.parseTemplateLiteral = parseTemplateLiteral$1022;
            extra$968.parseStatement = parseStatement$1074;
            extra$968.parseSwitchCase = parseSwitchCase$1068;
            extra$968.parseUnaryExpression = parseUnaryExpression$1034;
            extra$968.parseVariableDeclaration = parseVariableDeclaration$1047;
            extra$968.parseVariableIdentifier = parseVariableIdentifier$1046;
            extra$968.parseMethodDefinition = parseMethodDefinition$1083;
            extra$968.parseClassDeclaration = parseClassDeclaration$1087;
            extra$968.parseClassExpression = parseClassExpression$1086;
            extra$968.parseClassBody = parseClassBody$1085;
            parseArrayInitialiser$1015 = wrapTracking$1664(extra$968.parseArrayInitialiser);
            parseAssignmentExpression$1042 = wrapTracking$1664(extra$968.parseAssignmentExpression);
            parseBinaryExpression$1036 = wrapTracking$1664(extra$968.parseBinaryExpression);
            parseBlock$1045 = wrapTracking$1664(extra$968.parseBlock);
            parseFunctionSourceElements$1076 = wrapTracking$1664(extra$968.parseFunctionSourceElements);
            parseCatchClause$1071 = wrapTracking$1664(extra$968.parseCatchClause);
            parseComputedMember$1029 = wrapTracking$1664(extra$968.parseComputedMember);
            parseConditionalExpression$1037 = wrapTracking$1664(extra$968.parseConditionalExpression);
            parseConstLetDeclaration$1050 = wrapTracking$1664(extra$968.parseConstLetDeclaration);
            parseExportBatchSpecifier$1052 = wrapTracking$1664(parseExportBatchSpecifier$1052);
            parseExportDeclaration$1054 = wrapTracking$1664(parseExportDeclaration$1054);
            parseExportSpecifier$1053 = wrapTracking$1664(parseExportSpecifier$1053);
            parseExpression$1043 = wrapTracking$1664(extra$968.parseExpression);
            parseForVariableDeclaration$1062 = wrapTracking$1664(extra$968.parseForVariableDeclaration);
            parseFunctionDeclaration$1080 = wrapTracking$1664(extra$968.parseFunctionDeclaration);
            parseFunctionExpression$1081 = wrapTracking$1664(extra$968.parseFunctionExpression);
            parseParams$1079 = wrapTracking$1664(extra$968.parseParams);
            parseImportDeclaration$1055 = wrapTracking$1664(extra$968.parseImportDeclaration);
            parseImportSpecifier$1056 = wrapTracking$1664(extra$968.parseImportSpecifier);
            parseModuleDeclaration$1051 = wrapTracking$1664(extra$968.parseModuleDeclaration);
            parseModuleBlock$1094 = wrapTracking$1664(extra$968.parseModuleBlock);
            parseLeftHandSideExpression$1032 = wrapTracking$1664(parseLeftHandSideExpression$1032);
            parseNewExpression$1030 = wrapTracking$1664(extra$968.parseNewExpression);
            parseNonComputedProperty$1027 = wrapTracking$1664(extra$968.parseNonComputedProperty);
            parseObjectInitialiser$1020 = wrapTracking$1664(extra$968.parseObjectInitialiser);
            parseObjectProperty$1019 = wrapTracking$1664(extra$968.parseObjectProperty);
            parseObjectPropertyKey$1018 = wrapTracking$1664(extra$968.parseObjectPropertyKey);
            parsePostfixExpression$1033 = wrapTracking$1664(extra$968.parsePostfixExpression);
            parsePrimaryExpression$1024 = wrapTracking$1664(extra$968.parsePrimaryExpression);
            parseProgram$1095 = wrapTracking$1664(extra$968.parseProgram);
            parsePropertyFunction$1016 = wrapTracking$1664(extra$968.parsePropertyFunction);
            parseTemplateElement$1021 = wrapTracking$1664(extra$968.parseTemplateElement);
            parseTemplateLiteral$1022 = wrapTracking$1664(extra$968.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$1026 = wrapTracking$1664(extra$968.parseSpreadOrAssignmentExpression);
            parseStatement$1074 = wrapTracking$1664(extra$968.parseStatement);
            parseSwitchCase$1068 = wrapTracking$1664(extra$968.parseSwitchCase);
            parseUnaryExpression$1034 = wrapTracking$1664(extra$968.parseUnaryExpression);
            parseVariableDeclaration$1047 = wrapTracking$1664(extra$968.parseVariableDeclaration);
            parseVariableIdentifier$1046 = wrapTracking$1664(extra$968.parseVariableIdentifier);
            parseMethodDefinition$1083 = wrapTracking$1664(extra$968.parseMethodDefinition);
            parseClassDeclaration$1087 = wrapTracking$1664(extra$968.parseClassDeclaration);
            parseClassExpression$1086 = wrapTracking$1664(extra$968.parseClassExpression);
            parseClassBody$1085 = wrapTracking$1664(extra$968.parseClassBody);
        }
        if (typeof extra$968.tokens !== 'undefined') {
            extra$968.advance = advance$998;
            extra$968.scanRegExp = scanRegExp$995;
            advance$998 = collectToken$1099;
            scanRegExp$995 = collectRegex$1100;
        }
    }
    function unpatch$1110() {
        if (typeof extra$968.skipComment === 'function') {
            skipComment$982 = extra$968.skipComment;
        }
        if (extra$968.range || extra$968.loc) {
            parseArrayInitialiser$1015 = extra$968.parseArrayInitialiser;
            parseAssignmentExpression$1042 = extra$968.parseAssignmentExpression;
            parseBinaryExpression$1036 = extra$968.parseBinaryExpression;
            parseBlock$1045 = extra$968.parseBlock;
            parseFunctionSourceElements$1076 = extra$968.parseFunctionSourceElements;
            parseCatchClause$1071 = extra$968.parseCatchClause;
            parseComputedMember$1029 = extra$968.parseComputedMember;
            parseConditionalExpression$1037 = extra$968.parseConditionalExpression;
            parseConstLetDeclaration$1050 = extra$968.parseConstLetDeclaration;
            parseExportBatchSpecifier$1052 = extra$968.parseExportBatchSpecifier;
            parseExportDeclaration$1054 = extra$968.parseExportDeclaration;
            parseExportSpecifier$1053 = extra$968.parseExportSpecifier;
            parseExpression$1043 = extra$968.parseExpression;
            parseForVariableDeclaration$1062 = extra$968.parseForVariableDeclaration;
            parseFunctionDeclaration$1080 = extra$968.parseFunctionDeclaration;
            parseFunctionExpression$1081 = extra$968.parseFunctionExpression;
            parseImportDeclaration$1055 = extra$968.parseImportDeclaration;
            parseImportSpecifier$1056 = extra$968.parseImportSpecifier;
            parseGroupExpression$1023 = extra$968.parseGroupExpression;
            parseLeftHandSideExpression$1032 = extra$968.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$1031 = extra$968.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$1051 = extra$968.parseModuleDeclaration;
            parseModuleBlock$1094 = extra$968.parseModuleBlock;
            parseNewExpression$1030 = extra$968.parseNewExpression;
            parseNonComputedProperty$1027 = extra$968.parseNonComputedProperty;
            parseObjectInitialiser$1020 = extra$968.parseObjectInitialiser;
            parseObjectProperty$1019 = extra$968.parseObjectProperty;
            parseObjectPropertyKey$1018 = extra$968.parseObjectPropertyKey;
            parsePostfixExpression$1033 = extra$968.parsePostfixExpression;
            parsePrimaryExpression$1024 = extra$968.parsePrimaryExpression;
            parseProgram$1095 = extra$968.parseProgram;
            parsePropertyFunction$1016 = extra$968.parsePropertyFunction;
            parseTemplateElement$1021 = extra$968.parseTemplateElement;
            parseTemplateLiteral$1022 = extra$968.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$1026 = extra$968.parseSpreadOrAssignmentExpression;
            parseStatement$1074 = extra$968.parseStatement;
            parseSwitchCase$1068 = extra$968.parseSwitchCase;
            parseUnaryExpression$1034 = extra$968.parseUnaryExpression;
            parseVariableDeclaration$1047 = extra$968.parseVariableDeclaration;
            parseVariableIdentifier$1046 = extra$968.parseVariableIdentifier;
            parseMethodDefinition$1083 = extra$968.parseMethodDefinition;
            parseClassDeclaration$1087 = extra$968.parseClassDeclaration;
            parseClassExpression$1086 = extra$968.parseClassExpression;
            parseClassBody$1085 = extra$968.parseClassBody;
        }
        if (typeof extra$968.scanRegExp === 'function') {
            advance$998 = extra$968.advance;
            scanRegExp$995 = extra$968.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1111(object$1665, properties$1666) {
        var entry$1667, result$1668 = {};
        for (entry$1667 in object$1665) {
            if (object$1665.hasOwnProperty(entry$1667)) {
                result$1668[entry$1667] = object$1665[entry$1667];
            }
        }
        for (entry$1667 in properties$1666) {
            if (properties$1666.hasOwnProperty(entry$1667)) {
                result$1668[entry$1667] = properties$1666[entry$1667];
            }
        }
        return result$1668;
    }
    function tokenize$1112(code$1669, options$1670) {
        var toString$1671, token$1672, tokens$1673;
        toString$1671 = String;
        if (typeof code$1669 !== 'string' && !(code$1669 instanceof String)) {
            code$1669 = toString$1671(code$1669);
        }
        delegate$962 = SyntaxTreeDelegate$950;
        source$952 = code$1669;
        index$954 = 0;
        lineNumber$955 = source$952.length > 0 ? 1 : 0;
        lineStart$956 = 0;
        length$961 = source$952.length;
        lookahead$965 = null;
        state$967 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$968 = {};
        // Options matching.
        options$1670 = options$1670 || {};
        // Of course we collect tokens here.
        options$1670.tokens = true;
        extra$968.tokens = [];
        extra$968.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$968.openParenToken = -1;
        extra$968.openCurlyToken = -1;
        extra$968.range = typeof options$1670.range === 'boolean' && options$1670.range;
        extra$968.loc = typeof options$1670.loc === 'boolean' && options$1670.loc;
        if (typeof options$1670.comment === 'boolean' && options$1670.comment) {
            extra$968.comments = [];
        }
        if (typeof options$1670.tolerant === 'boolean' && options$1670.tolerant) {
            extra$968.errors = [];
        }
        if (length$961 > 0) {
            if (typeof source$952[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1669 instanceof String) {
                    source$952 = code$1669.valueOf();
                }
            }
        }
        patch$1109();
        try {
            peek$1000();
            if (lookahead$965.type === Token$943.EOF) {
                return extra$968.tokens;
            }
            token$1672 = lex$999();
            while (lookahead$965.type !== Token$943.EOF) {
                try {
                    token$1672 = lex$999();
                } catch (lexError$1674) {
                    token$1672 = lookahead$965;
                    if (extra$968.errors) {
                        extra$968.errors.push(lexError$1674);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1674;
                    }
                }
            }
            filterTokenLocation$1101();
            tokens$1673 = extra$968.tokens;
            if (typeof extra$968.comments !== 'undefined') {
                filterCommentLocation$1098();
                tokens$1673.comments = extra$968.comments;
            }
            if (typeof extra$968.errors !== 'undefined') {
                tokens$1673.errors = extra$968.errors;
            }
        } catch (e$1675) {
            throw e$1675;
        } finally {
            unpatch$1110();
            extra$968 = {};
        }
        return tokens$1673;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1113(toks$1676, start$1677, inExprDelim$1678, parentIsBlock$1679) {
        var assignOps$1680 = [
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
        var binaryOps$1681 = [
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
        var unaryOps$1682 = [
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
        function back$1683(n$1684) {
            var idx$1685 = toks$1676.length - n$1684 > 0 ? toks$1676.length - n$1684 : 0;
            return toks$1676[idx$1685];
        }
        if (inExprDelim$1678 && toks$1676.length - (start$1677 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1683(start$1677 + 2).value === ':' && parentIsBlock$1679) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$970(back$1683(start$1677 + 2).value, unaryOps$1682.concat(binaryOps$1681).concat(assignOps$1680))) {
            // ... + {...}
            return false;
        } else if (back$1683(start$1677 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1686 = typeof back$1683(start$1677 + 1).startLineNumber !== 'undefined' ? back$1683(start$1677 + 1).startLineNumber : back$1683(start$1677 + 1).lineNumber;
            if (back$1683(start$1677 + 2).lineNumber !== currLineNumber$1686) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$970(back$1683(start$1677 + 2).value, [
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
    function readToken$1114(toks$1687, inExprDelim$1688, parentIsBlock$1689) {
        var delimiters$1690 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1691 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1692 = toks$1687.length - 1;
        var comments$1693, commentsLen$1694 = extra$968.comments.length;
        function back$1695(n$1699) {
            var idx$1700 = toks$1687.length - n$1699 > 0 ? toks$1687.length - n$1699 : 0;
            return toks$1687[idx$1700];
        }
        function attachComments$1696(token$1701) {
            if (comments$1693) {
                token$1701.leadingComments = comments$1693;
            }
            return token$1701;
        }
        function _advance$1697() {
            return attachComments$1696(advance$998());
        }
        function _scanRegExp$1698() {
            return attachComments$1696(scanRegExp$995());
        }
        skipComment$982();
        if (extra$968.comments.length > commentsLen$1694) {
            comments$1693 = extra$968.comments.slice(commentsLen$1694);
        }
        if (isIn$970(source$952[index$954], delimiters$1690)) {
            return attachComments$1696(readDelim$1115(toks$1687, inExprDelim$1688, parentIsBlock$1689));
        }
        if (source$952[index$954] === '/') {
            var prev$1702 = back$1695(1);
            if (prev$1702) {
                if (prev$1702.value === '()') {
                    if (isIn$970(back$1695(2).value, parenIdents$1691)) {
                        // ... if (...) / ...
                        return _scanRegExp$1698();
                    }
                    // ... (...) / ...
                    return _advance$1697();
                }
                if (prev$1702.value === '{}') {
                    if (blockAllowed$1113(toks$1687, 0, inExprDelim$1688, parentIsBlock$1689)) {
                        if (back$1695(2).value === '()') {
                            // named function
                            if (back$1695(4).value === 'function') {
                                if (!blockAllowed$1113(toks$1687, 3, inExprDelim$1688, parentIsBlock$1689)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1697();
                                }
                                if (toks$1687.length - 5 <= 0 && inExprDelim$1688) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1697();
                                }
                            }
                            // unnamed function
                            if (back$1695(3).value === 'function') {
                                if (!blockAllowed$1113(toks$1687, 2, inExprDelim$1688, parentIsBlock$1689)) {
                                    // new function (...) {...} / ...
                                    return _advance$1697();
                                }
                                if (toks$1687.length - 4 <= 0 && inExprDelim$1688) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1697();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1698();
                    } else {
                        // ... + {...} / ...
                        return _advance$1697();
                    }
                }
                if (prev$1702.type === Token$943.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1698();
                }
                if (isKeyword$981(prev$1702.value)) {
                    // typeof /...
                    return _scanRegExp$1698();
                }
                return _advance$1697();
            }
            return _scanRegExp$1698();
        }
        return _advance$1697();
    }
    function readDelim$1115(toks$1703, inExprDelim$1704, parentIsBlock$1705) {
        var startDelim$1706 = advance$998(), matchDelim$1707 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1708 = [];
        var delimiters$1709 = [
                '(',
                '{',
                '['
            ];
        assert$969(delimiters$1709.indexOf(startDelim$1706.value) !== -1, 'Need to begin at the delimiter');
        var token$1710 = startDelim$1706;
        var startLineNumber$1711 = token$1710.lineNumber;
        var startLineStart$1712 = token$1710.lineStart;
        var startRange$1713 = token$1710.range;
        var delimToken$1714 = {};
        delimToken$1714.type = Token$943.Delimiter;
        delimToken$1714.value = startDelim$1706.value + matchDelim$1707[startDelim$1706.value];
        delimToken$1714.startLineNumber = startLineNumber$1711;
        delimToken$1714.startLineStart = startLineStart$1712;
        delimToken$1714.startRange = startRange$1713;
        var delimIsBlock$1715 = false;
        if (startDelim$1706.value === '{') {
            delimIsBlock$1715 = blockAllowed$1113(toks$1703.concat(delimToken$1714), 0, inExprDelim$1704, parentIsBlock$1705);
        }
        while (index$954 <= length$961) {
            token$1710 = readToken$1114(inner$1708, startDelim$1706.value === '(' || startDelim$1706.value === '[', delimIsBlock$1715);
            if (token$1710.type === Token$943.Punctuator && token$1710.value === matchDelim$1707[startDelim$1706.value]) {
                if (token$1710.leadingComments) {
                    delimToken$1714.trailingComments = token$1710.leadingComments;
                }
                break;
            } else if (token$1710.type === Token$943.EOF) {
                throwError$1003({}, Messages$948.UnexpectedEOS);
            } else {
                inner$1708.push(token$1710);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$954 >= length$961 && matchDelim$1707[startDelim$1706.value] !== source$952[length$961 - 1]) {
            throwError$1003({}, Messages$948.UnexpectedEOS);
        }
        var endLineNumber$1716 = token$1710.lineNumber;
        var endLineStart$1717 = token$1710.lineStart;
        var endRange$1718 = token$1710.range;
        delimToken$1714.inner = inner$1708;
        delimToken$1714.endLineNumber = endLineNumber$1716;
        delimToken$1714.endLineStart = endLineStart$1717;
        delimToken$1714.endRange = endRange$1718;
        return delimToken$1714;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$1116(code$1719) {
        var token$1720, tokenTree$1721 = [];
        extra$968 = {};
        extra$968.comments = [];
        patch$1109();
        source$952 = code$1719;
        index$954 = 0;
        lineNumber$955 = source$952.length > 0 ? 1 : 0;
        lineStart$956 = 0;
        length$961 = source$952.length;
        state$967 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$954 < length$961) {
            tokenTree$1721.push(readToken$1114(tokenTree$1721, false, false));
        }
        var last$1722 = tokenTree$1721[tokenTree$1721.length - 1];
        if (last$1722 && last$1722.type !== Token$943.EOF) {
            tokenTree$1721.push({
                type: Token$943.EOF,
                value: '',
                lineNumber: last$1722.lineNumber,
                lineStart: last$1722.lineStart,
                range: [
                    index$954,
                    index$954
                ]
            });
        }
        return expander$942.tokensToSyntax(tokenTree$1721);
    }
    function parse$1117(code$1723, options$1724) {
        var program$1725, toString$1726;
        extra$968 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1723)) {
            tokenStream$963 = code$1723;
            length$961 = tokenStream$963.length;
            lineNumber$955 = tokenStream$963.length > 0 ? 1 : 0;
            source$952 = undefined;
        } else {
            toString$1726 = String;
            if (typeof code$1723 !== 'string' && !(code$1723 instanceof String)) {
                code$1723 = toString$1726(code$1723);
            }
            source$952 = code$1723;
            length$961 = source$952.length;
            lineNumber$955 = source$952.length > 0 ? 1 : 0;
        }
        delegate$962 = SyntaxTreeDelegate$950;
        streamIndex$964 = -1;
        index$954 = 0;
        lineStart$956 = 0;
        sm_lineStart$958 = 0;
        sm_lineNumber$957 = lineNumber$955;
        sm_index$960 = 0;
        sm_range$959 = [
            0,
            0
        ];
        lookahead$965 = null;
        state$967 = {
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
        if (typeof options$1724 !== 'undefined') {
            extra$968.range = typeof options$1724.range === 'boolean' && options$1724.range;
            extra$968.loc = typeof options$1724.loc === 'boolean' && options$1724.loc;
            if (extra$968.loc && options$1724.source !== null && options$1724.source !== undefined) {
                delegate$962 = extend$1111(delegate$962, {
                    'postProcess': function (node$1727) {
                        node$1727.loc.source = toString$1726(options$1724.source);
                        return node$1727;
                    }
                });
            }
            if (typeof options$1724.tokens === 'boolean' && options$1724.tokens) {
                extra$968.tokens = [];
            }
            if (typeof options$1724.comment === 'boolean' && options$1724.comment) {
                extra$968.comments = [];
            }
            if (typeof options$1724.tolerant === 'boolean' && options$1724.tolerant) {
                extra$968.errors = [];
            }
        }
        if (length$961 > 0) {
            if (source$952 && typeof source$952[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1723 instanceof String) {
                    source$952 = code$1723.valueOf();
                }
            }
        }
        extra$968 = { loc: true };
        patch$1109();
        try {
            program$1725 = parseProgram$1095();
            if (typeof extra$968.comments !== 'undefined') {
                filterCommentLocation$1098();
                program$1725.comments = extra$968.comments;
            }
            if (typeof extra$968.tokens !== 'undefined') {
                filterTokenLocation$1101();
                program$1725.tokens = extra$968.tokens;
            }
            if (typeof extra$968.errors !== 'undefined') {
                program$1725.errors = extra$968.errors;
            }
            if (extra$968.range || extra$968.loc) {
                program$1725.body = filterGroup$1107(program$1725.body);
            }
        } catch (e$1728) {
            throw e$1728;
        } finally {
            unpatch$1110();
            extra$968 = {};
        }
        return program$1725;
    }
    exports$941.tokenize = tokenize$1112;
    exports$941.read = read$1116;
    exports$941.Token = Token$943;
    exports$941.parse = parse$1117;
    // Deep copy.
    exports$941.Syntax = function () {
        var name$1729, types$1730 = {};
        if (typeof Object.create === 'function') {
            types$1730 = Object.create(null);
        }
        for (name$1729 in Syntax$946) {
            if (Syntax$946.hasOwnProperty(name$1729)) {
                types$1730[name$1729] = Syntax$946[name$1729];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1730);
        }
        return types$1730;
    }();
}));
//# sourceMappingURL=parser.js.map