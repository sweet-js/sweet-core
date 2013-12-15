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
(function (root$1010, factory$1011) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$1011);
    } else if (typeof exports !== 'undefined') {
        factory$1011(exports, require('./expander'));
    } else {
        factory$1011(root$1010.esprima = {});
    }
}(this, function (exports$1012, expander$1013) {
    'use strict';
    var Token$1014, TokenName$1015, FnExprTokens$1016, Syntax$1017, PropertyKind$1018, Messages$1019, Regex$1020, SyntaxTreeDelegate$1021, ClassPropertyType$1022, source$1023, strict$1024, index$1025, lineNumber$1026, lineStart$1027, sm_lineNumber$1028, sm_lineStart$1029, sm_range$1030, sm_index$1031, length$1032, delegate$1033, tokenStream$1034, streamIndex$1035, lookahead$1036, lookaheadIndex$1037, state$1038, extra$1039;
    Token$1014 = {
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
    TokenName$1015 = {};
    TokenName$1015[Token$1014.BooleanLiteral] = 'Boolean';
    TokenName$1015[Token$1014.EOF] = '<end>';
    TokenName$1015[Token$1014.Identifier] = 'Identifier';
    TokenName$1015[Token$1014.Keyword] = 'Keyword';
    TokenName$1015[Token$1014.NullLiteral] = 'Null';
    TokenName$1015[Token$1014.NumericLiteral] = 'Numeric';
    TokenName$1015[Token$1014.Punctuator] = 'Punctuator';
    TokenName$1015[Token$1014.StringLiteral] = 'String';
    TokenName$1015[Token$1014.RegularExpression] = 'RegularExpression';
    TokenName$1015[Token$1014.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$1016 = [
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
    Syntax$1017 = {
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
    PropertyKind$1018 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$1022 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$1019 = {
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
    Regex$1020 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$1040(condition$1189, message$1190) {
        if (!condition$1189) {
            throw new Error('ASSERT: ' + message$1190);
        }
    }
    function isIn$1041(el$1191, list$1192) {
        return list$1192.indexOf(el$1191) !== -1;
    }
    function isDecimalDigit$1042(ch$1193) {
        return ch$1193 >= 48 && ch$1193 <= 57;
    }    // 0..9
    function isHexDigit$1043(ch$1194) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1194) >= 0;
    }
    function isOctalDigit$1044(ch$1195) {
        return '01234567'.indexOf(ch$1195) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$1045(ch$1196) {
        return ch$1196 === 32 || ch$1196 === 9 || ch$1196 === 11 || ch$1196 === 12 || ch$1196 === 160 || ch$1196 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1196)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$1046(ch$1197) {
        return ch$1197 === 10 || ch$1197 === 13 || ch$1197 === 8232 || ch$1197 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$1047(ch$1198) {
        return ch$1198 === 36 || ch$1198 === 95 || ch$1198 >= 65 && ch$1198 <= 90 || ch$1198 >= 97 && ch$1198 <= 122 || ch$1198 === 92 || ch$1198 >= 128 && Regex$1020.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1198));
    }
    function isIdentifierPart$1048(ch$1199) {
        return ch$1199 === 36 || ch$1199 === 95 || ch$1199 >= 65 && ch$1199 <= 90 || ch$1199 >= 97 && ch$1199 <= 122 || ch$1199 >= 48 && ch$1199 <= 57 || ch$1199 === 92 || ch$1199 >= 128 && Regex$1020.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1199));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$1049(id$1200) {
        switch (id$1200) {
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
    function isStrictModeReservedWord$1050(id$1201) {
        switch (id$1201) {
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
    function isRestrictedWord$1051(id$1202) {
        return id$1202 === 'eval' || id$1202 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$1052(id$1203) {
        if (strict$1024 && isStrictModeReservedWord$1050(id$1203)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1203.length) {
        case 2:
            return id$1203 === 'if' || id$1203 === 'in' || id$1203 === 'do';
        case 3:
            return id$1203 === 'var' || id$1203 === 'for' || id$1203 === 'new' || id$1203 === 'try' || id$1203 === 'let';
        case 4:
            return id$1203 === 'this' || id$1203 === 'else' || id$1203 === 'case' || id$1203 === 'void' || id$1203 === 'with' || id$1203 === 'enum';
        case 5:
            return id$1203 === 'while' || id$1203 === 'break' || id$1203 === 'catch' || id$1203 === 'throw' || id$1203 === 'const' || id$1203 === 'yield' || id$1203 === 'class' || id$1203 === 'super';
        case 6:
            return id$1203 === 'return' || id$1203 === 'typeof' || id$1203 === 'delete' || id$1203 === 'switch' || id$1203 === 'export' || id$1203 === 'import';
        case 7:
            return id$1203 === 'default' || id$1203 === 'finally' || id$1203 === 'extends';
        case 8:
            return id$1203 === 'function' || id$1203 === 'continue' || id$1203 === 'debugger';
        case 10:
            return id$1203 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$1053() {
        var ch$1204, blockComment$1205, lineComment$1206;
        blockComment$1205 = false;
        lineComment$1206 = false;
        while (index$1025 < length$1032) {
            ch$1204 = source$1023.charCodeAt(index$1025);
            if (lineComment$1206) {
                ++index$1025;
                if (isLineTerminator$1046(ch$1204)) {
                    lineComment$1206 = false;
                    if (ch$1204 === 13 && source$1023.charCodeAt(index$1025) === 10) {
                        ++index$1025;
                    }
                    ++lineNumber$1026;
                    lineStart$1027 = index$1025;
                }
            } else if (blockComment$1205) {
                if (isLineTerminator$1046(ch$1204)) {
                    if (ch$1204 === 13 && source$1023.charCodeAt(index$1025 + 1) === 10) {
                        ++index$1025;
                    }
                    ++lineNumber$1026;
                    ++index$1025;
                    lineStart$1027 = index$1025;
                    if (index$1025 >= length$1032) {
                        throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1204 = source$1023.charCodeAt(index$1025++);
                    if (index$1025 >= length$1032) {
                        throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1204 === 42) {
                        ch$1204 = source$1023.charCodeAt(index$1025);
                        if (ch$1204 === 47) {
                            ++index$1025;
                            blockComment$1205 = false;
                        }
                    }
                }
            } else if (ch$1204 === 47) {
                ch$1204 = source$1023.charCodeAt(index$1025 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1204 === 47) {
                    index$1025 += 2;
                    lineComment$1206 = true;
                } else if (ch$1204 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$1025 += 2;
                    blockComment$1205 = true;
                    if (index$1025 >= length$1032) {
                        throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1045(ch$1204)) {
                ++index$1025;
            } else if (isLineTerminator$1046(ch$1204)) {
                ++index$1025;
                if (ch$1204 === 13 && source$1023.charCodeAt(index$1025) === 10) {
                    ++index$1025;
                }
                ++lineNumber$1026;
                lineStart$1027 = index$1025;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$1054(prefix$1207) {
        var i$1208, len$1209, ch$1210, code$1211 = 0;
        len$1209 = prefix$1207 === 'u' ? 4 : 2;
        for (i$1208 = 0; i$1208 < len$1209; ++i$1208) {
            if (index$1025 < length$1032 && isHexDigit$1043(source$1023[index$1025])) {
                ch$1210 = source$1023[index$1025++];
                code$1211 = code$1211 * 16 + '0123456789abcdef'.indexOf(ch$1210.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1211);
    }
    function scanUnicodeCodePointEscape$1055() {
        var ch$1212, code$1213, cu1$1214, cu2$1215;
        ch$1212 = source$1023[index$1025];
        code$1213 = 0;
        // At least, one hex digit is required.
        if (ch$1212 === '}') {
            throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
        }
        while (index$1025 < length$1032) {
            ch$1212 = source$1023[index$1025++];
            if (!isHexDigit$1043(ch$1212)) {
                break;
            }
            code$1213 = code$1213 * 16 + '0123456789abcdef'.indexOf(ch$1212.toLowerCase());
        }
        if (code$1213 > 1114111 || ch$1212 !== '}') {
            throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1213 <= 65535) {
            return String.fromCharCode(code$1213);
        }
        cu1$1214 = (code$1213 - 65536 >> 10) + 55296;
        cu2$1215 = (code$1213 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1214, cu2$1215);
    }
    function getEscapedIdentifier$1056() {
        var ch$1216, id$1217;
        ch$1216 = source$1023.charCodeAt(index$1025++);
        id$1217 = String.fromCharCode(ch$1216);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1216 === 92) {
            if (source$1023.charCodeAt(index$1025) !== 117) {
                throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
            }
            ++index$1025;
            ch$1216 = scanHexEscape$1054('u');
            if (!ch$1216 || ch$1216 === '\\' || !isIdentifierStart$1047(ch$1216.charCodeAt(0))) {
                throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
            }
            id$1217 = ch$1216;
        }
        while (index$1025 < length$1032) {
            ch$1216 = source$1023.charCodeAt(index$1025);
            if (!isIdentifierPart$1048(ch$1216)) {
                break;
            }
            ++index$1025;
            id$1217 += String.fromCharCode(ch$1216);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1216 === 92) {
                id$1217 = id$1217.substr(0, id$1217.length - 1);
                if (source$1023.charCodeAt(index$1025) !== 117) {
                    throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
                }
                ++index$1025;
                ch$1216 = scanHexEscape$1054('u');
                if (!ch$1216 || ch$1216 === '\\' || !isIdentifierPart$1048(ch$1216.charCodeAt(0))) {
                    throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
                }
                id$1217 += ch$1216;
            }
        }
        return id$1217;
    }
    function getIdentifier$1057() {
        var start$1218, ch$1219;
        start$1218 = index$1025++;
        while (index$1025 < length$1032) {
            ch$1219 = source$1023.charCodeAt(index$1025);
            if (ch$1219 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$1025 = start$1218;
                return getEscapedIdentifier$1056();
            }
            if (isIdentifierPart$1048(ch$1219)) {
                ++index$1025;
            } else {
                break;
            }
        }
        return source$1023.slice(start$1218, index$1025);
    }
    function scanIdentifier$1058() {
        var start$1220, id$1221, type$1222;
        start$1220 = index$1025;
        // Backslash (char #92) starts an escaped character.
        id$1221 = source$1023.charCodeAt(index$1025) === 92 ? getEscapedIdentifier$1056() : getIdentifier$1057();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1221.length === 1) {
            type$1222 = Token$1014.Identifier;
        } else if (isKeyword$1052(id$1221)) {
            type$1222 = Token$1014.Keyword;
        } else if (id$1221 === 'null') {
            type$1222 = Token$1014.NullLiteral;
        } else if (id$1221 === 'true' || id$1221 === 'false') {
            type$1222 = Token$1014.BooleanLiteral;
        } else {
            type$1222 = Token$1014.Identifier;
        }
        return {
            type: type$1222,
            value: id$1221,
            lineNumber: lineNumber$1026,
            lineStart: lineStart$1027,
            range: [
                start$1220,
                index$1025
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$1059() {
        var start$1223 = index$1025, code$1224 = source$1023.charCodeAt(index$1025), code2$1225, ch1$1226 = source$1023[index$1025], ch2$1227, ch3$1228, ch4$1229;
        switch (code$1224) {
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
            ++index$1025;
            if (extra$1039.tokenize) {
                if (code$1224 === 40) {
                    extra$1039.openParenToken = extra$1039.tokens.length;
                } else if (code$1224 === 123) {
                    extra$1039.openCurlyToken = extra$1039.tokens.length;
                }
            }
            return {
                type: Token$1014.Punctuator,
                value: String.fromCharCode(code$1224),
                lineNumber: lineNumber$1026,
                lineStart: lineStart$1027,
                range: [
                    start$1223,
                    index$1025
                ]
            };
        default:
            code2$1225 = source$1023.charCodeAt(index$1025 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1225 === 61) {
                switch (code$1224) {
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
                    index$1025 += 2;
                    return {
                        type: Token$1014.Punctuator,
                        value: String.fromCharCode(code$1224) + String.fromCharCode(code2$1225),
                        lineNumber: lineNumber$1026,
                        lineStart: lineStart$1027,
                        range: [
                            start$1223,
                            index$1025
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$1025 += 2;
                    // !== and ===
                    if (source$1023.charCodeAt(index$1025) === 61) {
                        ++index$1025;
                    }
                    return {
                        type: Token$1014.Punctuator,
                        value: source$1023.slice(start$1223, index$1025),
                        lineNumber: lineNumber$1026,
                        lineStart: lineStart$1027,
                        range: [
                            start$1223,
                            index$1025
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1227 = source$1023[index$1025 + 1];
        ch3$1228 = source$1023[index$1025 + 2];
        ch4$1229 = source$1023[index$1025 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1226 === '>' && ch2$1227 === '>' && ch3$1228 === '>') {
            if (ch4$1229 === '=') {
                index$1025 += 4;
                return {
                    type: Token$1014.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$1026,
                    lineStart: lineStart$1027,
                    range: [
                        start$1223,
                        index$1025
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1226 === '>' && ch2$1227 === '>' && ch3$1228 === '>') {
            index$1025 += 3;
            return {
                type: Token$1014.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$1026,
                lineStart: lineStart$1027,
                range: [
                    start$1223,
                    index$1025
                ]
            };
        }
        if (ch1$1226 === '<' && ch2$1227 === '<' && ch3$1228 === '=') {
            index$1025 += 3;
            return {
                type: Token$1014.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$1026,
                lineStart: lineStart$1027,
                range: [
                    start$1223,
                    index$1025
                ]
            };
        }
        if (ch1$1226 === '>' && ch2$1227 === '>' && ch3$1228 === '=') {
            index$1025 += 3;
            return {
                type: Token$1014.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$1026,
                lineStart: lineStart$1027,
                range: [
                    start$1223,
                    index$1025
                ]
            };
        }
        if (ch1$1226 === '.' && ch2$1227 === '.' && ch3$1228 === '.') {
            index$1025 += 3;
            return {
                type: Token$1014.Punctuator,
                value: '...',
                lineNumber: lineNumber$1026,
                lineStart: lineStart$1027,
                range: [
                    start$1223,
                    index$1025
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1226 === ch2$1227 && '+-<>&|'.indexOf(ch1$1226) >= 0) {
            index$1025 += 2;
            return {
                type: Token$1014.Punctuator,
                value: ch1$1226 + ch2$1227,
                lineNumber: lineNumber$1026,
                lineStart: lineStart$1027,
                range: [
                    start$1223,
                    index$1025
                ]
            };
        }
        if (ch1$1226 === '=' && ch2$1227 === '>') {
            index$1025 += 2;
            return {
                type: Token$1014.Punctuator,
                value: '=>',
                lineNumber: lineNumber$1026,
                lineStart: lineStart$1027,
                range: [
                    start$1223,
                    index$1025
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1226) >= 0) {
            ++index$1025;
            return {
                type: Token$1014.Punctuator,
                value: ch1$1226,
                lineNumber: lineNumber$1026,
                lineStart: lineStart$1027,
                range: [
                    start$1223,
                    index$1025
                ]
            };
        }
        if (ch1$1226 === '.') {
            ++index$1025;
            return {
                type: Token$1014.Punctuator,
                value: ch1$1226,
                lineNumber: lineNumber$1026,
                lineStart: lineStart$1027,
                range: [
                    start$1223,
                    index$1025
                ]
            };
        }
        throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$1060(start$1230) {
        var number$1231 = '';
        while (index$1025 < length$1032) {
            if (!isHexDigit$1043(source$1023[index$1025])) {
                break;
            }
            number$1231 += source$1023[index$1025++];
        }
        if (number$1231.length === 0) {
            throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$1047(source$1023.charCodeAt(index$1025))) {
            throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1014.NumericLiteral,
            value: parseInt('0x' + number$1231, 16),
            lineNumber: lineNumber$1026,
            lineStart: lineStart$1027,
            range: [
                start$1230,
                index$1025
            ]
        };
    }
    function scanOctalLiteral$1061(prefix$1232, start$1233) {
        var number$1234, octal$1235;
        if (isOctalDigit$1044(prefix$1232)) {
            octal$1235 = true;
            number$1234 = '0' + source$1023[index$1025++];
        } else {
            octal$1235 = false;
            ++index$1025;
            number$1234 = '';
        }
        while (index$1025 < length$1032) {
            if (!isOctalDigit$1044(source$1023[index$1025])) {
                break;
            }
            number$1234 += source$1023[index$1025++];
        }
        if (!octal$1235 && number$1234.length === 0) {
            // only 0o or 0O
            throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$1047(source$1023.charCodeAt(index$1025)) || isDecimalDigit$1042(source$1023.charCodeAt(index$1025))) {
            throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1014.NumericLiteral,
            value: parseInt(number$1234, 8),
            octal: octal$1235,
            lineNumber: lineNumber$1026,
            lineStart: lineStart$1027,
            range: [
                start$1233,
                index$1025
            ]
        };
    }
    function scanNumericLiteral$1062() {
        var number$1236, start$1237, ch$1238, octal$1239;
        ch$1238 = source$1023[index$1025];
        assert$1040(isDecimalDigit$1042(ch$1238.charCodeAt(0)) || ch$1238 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1237 = index$1025;
        number$1236 = '';
        if (ch$1238 !== '.') {
            number$1236 = source$1023[index$1025++];
            ch$1238 = source$1023[index$1025];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1236 === '0') {
                if (ch$1238 === 'x' || ch$1238 === 'X') {
                    ++index$1025;
                    return scanHexLiteral$1060(start$1237);
                }
                if (ch$1238 === 'b' || ch$1238 === 'B') {
                    ++index$1025;
                    number$1236 = '';
                    while (index$1025 < length$1032) {
                        ch$1238 = source$1023[index$1025];
                        if (ch$1238 !== '0' && ch$1238 !== '1') {
                            break;
                        }
                        number$1236 += source$1023[index$1025++];
                    }
                    if (number$1236.length === 0) {
                        // only 0b or 0B
                        throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$1025 < length$1032) {
                        ch$1238 = source$1023.charCodeAt(index$1025);
                        if (isIdentifierStart$1047(ch$1238) || isDecimalDigit$1042(ch$1238)) {
                            throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$1014.NumericLiteral,
                        value: parseInt(number$1236, 2),
                        lineNumber: lineNumber$1026,
                        lineStart: lineStart$1027,
                        range: [
                            start$1237,
                            index$1025
                        ]
                    };
                }
                if (ch$1238 === 'o' || ch$1238 === 'O' || isOctalDigit$1044(ch$1238)) {
                    return scanOctalLiteral$1061(ch$1238, start$1237);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1238 && isDecimalDigit$1042(ch$1238.charCodeAt(0))) {
                    throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$1042(source$1023.charCodeAt(index$1025))) {
                number$1236 += source$1023[index$1025++];
            }
            ch$1238 = source$1023[index$1025];
        }
        if (ch$1238 === '.') {
            number$1236 += source$1023[index$1025++];
            while (isDecimalDigit$1042(source$1023.charCodeAt(index$1025))) {
                number$1236 += source$1023[index$1025++];
            }
            ch$1238 = source$1023[index$1025];
        }
        if (ch$1238 === 'e' || ch$1238 === 'E') {
            number$1236 += source$1023[index$1025++];
            ch$1238 = source$1023[index$1025];
            if (ch$1238 === '+' || ch$1238 === '-') {
                number$1236 += source$1023[index$1025++];
            }
            if (isDecimalDigit$1042(source$1023.charCodeAt(index$1025))) {
                while (isDecimalDigit$1042(source$1023.charCodeAt(index$1025))) {
                    number$1236 += source$1023[index$1025++];
                }
            } else {
                throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$1047(source$1023.charCodeAt(index$1025))) {
            throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1014.NumericLiteral,
            value: parseFloat(number$1236),
            lineNumber: lineNumber$1026,
            lineStart: lineStart$1027,
            range: [
                start$1237,
                index$1025
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$1063() {
        var str$1240 = '', quote$1241, start$1242, ch$1243, code$1244, unescaped$1245, restore$1246, octal$1247 = false;
        quote$1241 = source$1023[index$1025];
        assert$1040(quote$1241 === '\'' || quote$1241 === '"', 'String literal must starts with a quote');
        start$1242 = index$1025;
        ++index$1025;
        while (index$1025 < length$1032) {
            ch$1243 = source$1023[index$1025++];
            if (ch$1243 === quote$1241) {
                quote$1241 = '';
                break;
            } else if (ch$1243 === '\\') {
                ch$1243 = source$1023[index$1025++];
                if (!ch$1243 || !isLineTerminator$1046(ch$1243.charCodeAt(0))) {
                    switch (ch$1243) {
                    case 'n':
                        str$1240 += '\n';
                        break;
                    case 'r':
                        str$1240 += '\r';
                        break;
                    case 't':
                        str$1240 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$1023[index$1025] === '{') {
                            ++index$1025;
                            str$1240 += scanUnicodeCodePointEscape$1055();
                        } else {
                            restore$1246 = index$1025;
                            unescaped$1245 = scanHexEscape$1054(ch$1243);
                            if (unescaped$1245) {
                                str$1240 += unescaped$1245;
                            } else {
                                index$1025 = restore$1246;
                                str$1240 += ch$1243;
                            }
                        }
                        break;
                    case 'b':
                        str$1240 += '\b';
                        break;
                    case 'f':
                        str$1240 += '\f';
                        break;
                    case 'v':
                        str$1240 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$1044(ch$1243)) {
                            code$1244 = '01234567'.indexOf(ch$1243);
                            // \0 is not octal escape sequence
                            if (code$1244 !== 0) {
                                octal$1247 = true;
                            }
                            if (index$1025 < length$1032 && isOctalDigit$1044(source$1023[index$1025])) {
                                octal$1247 = true;
                                code$1244 = code$1244 * 8 + '01234567'.indexOf(source$1023[index$1025++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1243) >= 0 && index$1025 < length$1032 && isOctalDigit$1044(source$1023[index$1025])) {
                                    code$1244 = code$1244 * 8 + '01234567'.indexOf(source$1023[index$1025++]);
                                }
                            }
                            str$1240 += String.fromCharCode(code$1244);
                        } else {
                            str$1240 += ch$1243;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$1026;
                    if (ch$1243 === '\r' && source$1023[index$1025] === '\n') {
                        ++index$1025;
                    }
                }
            } else if (isLineTerminator$1046(ch$1243.charCodeAt(0))) {
                break;
            } else {
                str$1240 += ch$1243;
            }
        }
        if (quote$1241 !== '') {
            throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1014.StringLiteral,
            value: str$1240,
            octal: octal$1247,
            lineNumber: lineNumber$1026,
            lineStart: lineStart$1027,
            range: [
                start$1242,
                index$1025
            ]
        };
    }
    function scanTemplate$1064() {
        var cooked$1248 = '', ch$1249, start$1250, terminated$1251, tail$1252, restore$1253, unescaped$1254, code$1255, octal$1256;
        terminated$1251 = false;
        tail$1252 = false;
        start$1250 = index$1025;
        ++index$1025;
        while (index$1025 < length$1032) {
            ch$1249 = source$1023[index$1025++];
            if (ch$1249 === '`') {
                tail$1252 = true;
                terminated$1251 = true;
                break;
            } else if (ch$1249 === '$') {
                if (source$1023[index$1025] === '{') {
                    ++index$1025;
                    terminated$1251 = true;
                    break;
                }
                cooked$1248 += ch$1249;
            } else if (ch$1249 === '\\') {
                ch$1249 = source$1023[index$1025++];
                if (!isLineTerminator$1046(ch$1249.charCodeAt(0))) {
                    switch (ch$1249) {
                    case 'n':
                        cooked$1248 += '\n';
                        break;
                    case 'r':
                        cooked$1248 += '\r';
                        break;
                    case 't':
                        cooked$1248 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$1023[index$1025] === '{') {
                            ++index$1025;
                            cooked$1248 += scanUnicodeCodePointEscape$1055();
                        } else {
                            restore$1253 = index$1025;
                            unescaped$1254 = scanHexEscape$1054(ch$1249);
                            if (unescaped$1254) {
                                cooked$1248 += unescaped$1254;
                            } else {
                                index$1025 = restore$1253;
                                cooked$1248 += ch$1249;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1248 += '\b';
                        break;
                    case 'f':
                        cooked$1248 += '\f';
                        break;
                    case 'v':
                        cooked$1248 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$1044(ch$1249)) {
                            code$1255 = '01234567'.indexOf(ch$1249);
                            // \0 is not octal escape sequence
                            if (code$1255 !== 0) {
                                octal$1256 = true;
                            }
                            if (index$1025 < length$1032 && isOctalDigit$1044(source$1023[index$1025])) {
                                octal$1256 = true;
                                code$1255 = code$1255 * 8 + '01234567'.indexOf(source$1023[index$1025++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1249) >= 0 && index$1025 < length$1032 && isOctalDigit$1044(source$1023[index$1025])) {
                                    code$1255 = code$1255 * 8 + '01234567'.indexOf(source$1023[index$1025++]);
                                }
                            }
                            cooked$1248 += String.fromCharCode(code$1255);
                        } else {
                            cooked$1248 += ch$1249;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$1026;
                    if (ch$1249 === '\r' && source$1023[index$1025] === '\n') {
                        ++index$1025;
                    }
                }
            } else if (isLineTerminator$1046(ch$1249.charCodeAt(0))) {
                ++lineNumber$1026;
                if (ch$1249 === '\r' && source$1023[index$1025] === '\n') {
                    ++index$1025;
                }
                cooked$1248 += '\n';
            } else {
                cooked$1248 += ch$1249;
            }
        }
        if (!terminated$1251) {
            throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1014.Template,
            value: {
                cooked: cooked$1248,
                raw: source$1023.slice(start$1250 + 1, index$1025 - (tail$1252 ? 1 : 2))
            },
            tail: tail$1252,
            octal: octal$1256,
            lineNumber: lineNumber$1026,
            lineStart: lineStart$1027,
            range: [
                start$1250,
                index$1025
            ]
        };
    }
    function scanTemplateElement$1065(option$1257) {
        var startsWith$1258, template$1259;
        lookahead$1036 = null;
        skipComment$1053();
        startsWith$1258 = option$1257.head ? '`' : '}';
        if (source$1023[index$1025] !== startsWith$1258) {
            throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
        }
        template$1259 = scanTemplate$1064();
        peek$1071();
        return template$1259;
    }
    function scanRegExp$1066() {
        var str$1260, ch$1261, start$1262, pattern$1263, flags$1264, value$1265, classMarker$1266 = false, restore$1267, terminated$1268 = false;
        lookahead$1036 = null;
        skipComment$1053();
        start$1262 = index$1025;
        ch$1261 = source$1023[index$1025];
        assert$1040(ch$1261 === '/', 'Regular expression literal must start with a slash');
        str$1260 = source$1023[index$1025++];
        while (index$1025 < length$1032) {
            ch$1261 = source$1023[index$1025++];
            str$1260 += ch$1261;
            if (classMarker$1266) {
                if (ch$1261 === ']') {
                    classMarker$1266 = false;
                }
            } else {
                if (ch$1261 === '\\') {
                    ch$1261 = source$1023[index$1025++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$1046(ch$1261.charCodeAt(0))) {
                        throwError$1074({}, Messages$1019.UnterminatedRegExp);
                    }
                    str$1260 += ch$1261;
                } else if (ch$1261 === '/') {
                    terminated$1268 = true;
                    break;
                } else if (ch$1261 === '[') {
                    classMarker$1266 = true;
                } else if (isLineTerminator$1046(ch$1261.charCodeAt(0))) {
                    throwError$1074({}, Messages$1019.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1268) {
            throwError$1074({}, Messages$1019.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1263 = str$1260.substr(1, str$1260.length - 2);
        flags$1264 = '';
        while (index$1025 < length$1032) {
            ch$1261 = source$1023[index$1025];
            if (!isIdentifierPart$1048(ch$1261.charCodeAt(0))) {
                break;
            }
            ++index$1025;
            if (ch$1261 === '\\' && index$1025 < length$1032) {
                ch$1261 = source$1023[index$1025];
                if (ch$1261 === 'u') {
                    ++index$1025;
                    restore$1267 = index$1025;
                    ch$1261 = scanHexEscape$1054('u');
                    if (ch$1261) {
                        flags$1264 += ch$1261;
                        for (str$1260 += '\\u'; restore$1267 < index$1025; ++restore$1267) {
                            str$1260 += source$1023[restore$1267];
                        }
                    } else {
                        index$1025 = restore$1267;
                        flags$1264 += 'u';
                        str$1260 += '\\u';
                    }
                } else {
                    str$1260 += '\\';
                }
            } else {
                flags$1264 += ch$1261;
                str$1260 += ch$1261;
            }
        }
        try {
            value$1265 = new RegExp(pattern$1263, flags$1264);
        } catch (e$1269) {
            throwError$1074({}, Messages$1019.InvalidRegExp);
        }
        // peek();
        if (extra$1039.tokenize) {
            return {
                type: Token$1014.RegularExpression,
                value: value$1265,
                lineNumber: lineNumber$1026,
                lineStart: lineStart$1027,
                range: [
                    start$1262,
                    index$1025
                ]
            };
        }
        return {
            type: Token$1014.RegularExpression,
            literal: str$1260,
            value: value$1265,
            range: [
                start$1262,
                index$1025
            ]
        };
    }
    function isIdentifierName$1067(token$1270) {
        return token$1270.type === Token$1014.Identifier || token$1270.type === Token$1014.Keyword || token$1270.type === Token$1014.BooleanLiteral || token$1270.type === Token$1014.NullLiteral;
    }
    function advanceSlash$1068() {
        var prevToken$1271, checkToken$1272;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1271 = extra$1039.tokens[extra$1039.tokens.length - 1];
        if (!prevToken$1271) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$1066();
        }
        if (prevToken$1271.type === 'Punctuator') {
            if (prevToken$1271.value === ')') {
                checkToken$1272 = extra$1039.tokens[extra$1039.openParenToken - 1];
                if (checkToken$1272 && checkToken$1272.type === 'Keyword' && (checkToken$1272.value === 'if' || checkToken$1272.value === 'while' || checkToken$1272.value === 'for' || checkToken$1272.value === 'with')) {
                    return scanRegExp$1066();
                }
                return scanPunctuator$1059();
            }
            if (prevToken$1271.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$1039.tokens[extra$1039.openCurlyToken - 3] && extra$1039.tokens[extra$1039.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1272 = extra$1039.tokens[extra$1039.openCurlyToken - 4];
                    if (!checkToken$1272) {
                        return scanPunctuator$1059();
                    }
                } else if (extra$1039.tokens[extra$1039.openCurlyToken - 4] && extra$1039.tokens[extra$1039.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1272 = extra$1039.tokens[extra$1039.openCurlyToken - 5];
                    if (!checkToken$1272) {
                        return scanRegExp$1066();
                    }
                } else {
                    return scanPunctuator$1059();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$1016.indexOf(checkToken$1272.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$1059();
                }
                // It is a declaration.
                return scanRegExp$1066();
            }
            return scanRegExp$1066();
        }
        if (prevToken$1271.type === 'Keyword') {
            return scanRegExp$1066();
        }
        return scanPunctuator$1059();
    }
    function advance$1069() {
        var ch$1273;
        skipComment$1053();
        if (index$1025 >= length$1032) {
            return {
                type: Token$1014.EOF,
                lineNumber: lineNumber$1026,
                lineStart: lineStart$1027,
                range: [
                    index$1025,
                    index$1025
                ]
            };
        }
        ch$1273 = source$1023.charCodeAt(index$1025);
        // Very common: ( and ) and ;
        if (ch$1273 === 40 || ch$1273 === 41 || ch$1273 === 58) {
            return scanPunctuator$1059();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1273 === 39 || ch$1273 === 34) {
            return scanStringLiteral$1063();
        }
        if (ch$1273 === 96) {
            return scanTemplate$1064();
        }
        if (isIdentifierStart$1047(ch$1273)) {
            return scanIdentifier$1058();
        }
        // # and @ are allowed for sweet.js
        if (ch$1273 === 35 || ch$1273 === 64) {
            ++index$1025;
            return {
                type: Token$1014.Punctuator,
                value: String.fromCharCode(ch$1273),
                lineNumber: lineNumber$1026,
                lineStart: lineStart$1027,
                range: [
                    index$1025 - 1,
                    index$1025
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1273 === 46) {
            if (isDecimalDigit$1042(source$1023.charCodeAt(index$1025 + 1))) {
                return scanNumericLiteral$1062();
            }
            return scanPunctuator$1059();
        }
        if (isDecimalDigit$1042(ch$1273)) {
            return scanNumericLiteral$1062();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$1039.tokenize && ch$1273 === 47) {
            return advanceSlash$1068();
        }
        return scanPunctuator$1059();
    }
    function lex$1070() {
        var token$1274;
        token$1274 = lookahead$1036;
        streamIndex$1035 = lookaheadIndex$1037;
        lineNumber$1026 = token$1274.lineNumber;
        lineStart$1027 = token$1274.lineStart;
        sm_lineNumber$1028 = lookahead$1036.sm_lineNumber;
        sm_lineStart$1029 = lookahead$1036.sm_lineStart;
        sm_range$1030 = lookahead$1036.sm_range;
        sm_index$1031 = lookahead$1036.sm_range[0];
        lookahead$1036 = tokenStream$1034[++streamIndex$1035].token;
        lookaheadIndex$1037 = streamIndex$1035;
        index$1025 = lookahead$1036.range[0];
        return token$1274;
    }
    function peek$1071() {
        lookaheadIndex$1037 = streamIndex$1035 + 1;
        if (lookaheadIndex$1037 >= length$1032) {
            lookahead$1036 = {
                type: Token$1014.EOF,
                lineNumber: lineNumber$1026,
                lineStart: lineStart$1027,
                range: [
                    index$1025,
                    index$1025
                ]
            };
            return;
        }
        lookahead$1036 = tokenStream$1034[lookaheadIndex$1037].token;
        index$1025 = lookahead$1036.range[0];
    }
    function lookahead2$1072() {
        var adv$1275, pos$1276, line$1277, start$1278, result$1279;
        if (streamIndex$1035 + 1 >= length$1032 || streamIndex$1035 + 2 >= length$1032) {
            return {
                type: Token$1014.EOF,
                lineNumber: lineNumber$1026,
                lineStart: lineStart$1027,
                range: [
                    index$1025,
                    index$1025
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$1036 === null) {
            lookaheadIndex$1037 = streamIndex$1035 + 1;
            lookahead$1036 = tokenStream$1034[lookaheadIndex$1037].token;
            index$1025 = lookahead$1036.range[0];
        }
        result$1279 = tokenStream$1034[lookaheadIndex$1037 + 1].token;
        return result$1279;
    }
    SyntaxTreeDelegate$1021 = {
        name: 'SyntaxTree',
        postProcess: function (node$1280) {
            return node$1280;
        },
        createArrayExpression: function (elements$1281) {
            return {
                type: Syntax$1017.ArrayExpression,
                elements: elements$1281
            };
        },
        createAssignmentExpression: function (operator$1282, left$1283, right$1284) {
            return {
                type: Syntax$1017.AssignmentExpression,
                operator: operator$1282,
                left: left$1283,
                right: right$1284
            };
        },
        createBinaryExpression: function (operator$1285, left$1286, right$1287) {
            var type$1288 = operator$1285 === '||' || operator$1285 === '&&' ? Syntax$1017.LogicalExpression : Syntax$1017.BinaryExpression;
            return {
                type: type$1288,
                operator: operator$1285,
                left: left$1286,
                right: right$1287
            };
        },
        createBlockStatement: function (body$1289) {
            return {
                type: Syntax$1017.BlockStatement,
                body: body$1289
            };
        },
        createBreakStatement: function (label$1290) {
            return {
                type: Syntax$1017.BreakStatement,
                label: label$1290
            };
        },
        createCallExpression: function (callee$1291, args$1292) {
            return {
                type: Syntax$1017.CallExpression,
                callee: callee$1291,
                'arguments': args$1292
            };
        },
        createCatchClause: function (param$1293, body$1294) {
            return {
                type: Syntax$1017.CatchClause,
                param: param$1293,
                body: body$1294
            };
        },
        createConditionalExpression: function (test$1295, consequent$1296, alternate$1297) {
            return {
                type: Syntax$1017.ConditionalExpression,
                test: test$1295,
                consequent: consequent$1296,
                alternate: alternate$1297
            };
        },
        createContinueStatement: function (label$1298) {
            return {
                type: Syntax$1017.ContinueStatement,
                label: label$1298
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$1017.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1299, test$1300) {
            return {
                type: Syntax$1017.DoWhileStatement,
                body: body$1299,
                test: test$1300
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$1017.EmptyStatement };
        },
        createExpressionStatement: function (expression$1301) {
            return {
                type: Syntax$1017.ExpressionStatement,
                expression: expression$1301
            };
        },
        createForStatement: function (init$1302, test$1303, update$1304, body$1305) {
            return {
                type: Syntax$1017.ForStatement,
                init: init$1302,
                test: test$1303,
                update: update$1304,
                body: body$1305
            };
        },
        createForInStatement: function (left$1306, right$1307, body$1308) {
            return {
                type: Syntax$1017.ForInStatement,
                left: left$1306,
                right: right$1307,
                body: body$1308,
                each: false
            };
        },
        createForOfStatement: function (left$1309, right$1310, body$1311) {
            return {
                type: Syntax$1017.ForOfStatement,
                left: left$1309,
                right: right$1310,
                body: body$1311
            };
        },
        createFunctionDeclaration: function (id$1312, params$1313, defaults$1314, body$1315, rest$1316, generator$1317, expression$1318) {
            return {
                type: Syntax$1017.FunctionDeclaration,
                id: id$1312,
                params: params$1313,
                defaults: defaults$1314,
                body: body$1315,
                rest: rest$1316,
                generator: generator$1317,
                expression: expression$1318
            };
        },
        createFunctionExpression: function (id$1319, params$1320, defaults$1321, body$1322, rest$1323, generator$1324, expression$1325) {
            return {
                type: Syntax$1017.FunctionExpression,
                id: id$1319,
                params: params$1320,
                defaults: defaults$1321,
                body: body$1322,
                rest: rest$1323,
                generator: generator$1324,
                expression: expression$1325
            };
        },
        createIdentifier: function (name$1326) {
            return {
                type: Syntax$1017.Identifier,
                name: name$1326
            };
        },
        createIfStatement: function (test$1327, consequent$1328, alternate$1329) {
            return {
                type: Syntax$1017.IfStatement,
                test: test$1327,
                consequent: consequent$1328,
                alternate: alternate$1329
            };
        },
        createLabeledStatement: function (label$1330, body$1331) {
            return {
                type: Syntax$1017.LabeledStatement,
                label: label$1330,
                body: body$1331
            };
        },
        createLiteral: function (token$1332) {
            return {
                type: Syntax$1017.Literal,
                value: token$1332.value,
                raw: String(token$1332.value)
            };
        },
        createMemberExpression: function (accessor$1333, object$1334, property$1335) {
            return {
                type: Syntax$1017.MemberExpression,
                computed: accessor$1333 === '[',
                object: object$1334,
                property: property$1335
            };
        },
        createNewExpression: function (callee$1336, args$1337) {
            return {
                type: Syntax$1017.NewExpression,
                callee: callee$1336,
                'arguments': args$1337
            };
        },
        createObjectExpression: function (properties$1338) {
            return {
                type: Syntax$1017.ObjectExpression,
                properties: properties$1338
            };
        },
        createPostfixExpression: function (operator$1339, argument$1340) {
            return {
                type: Syntax$1017.UpdateExpression,
                operator: operator$1339,
                argument: argument$1340,
                prefix: false
            };
        },
        createProgram: function (body$1341) {
            return {
                type: Syntax$1017.Program,
                body: body$1341
            };
        },
        createProperty: function (kind$1342, key$1343, value$1344, method$1345, shorthand$1346) {
            return {
                type: Syntax$1017.Property,
                key: key$1343,
                value: value$1344,
                kind: kind$1342,
                method: method$1345,
                shorthand: shorthand$1346
            };
        },
        createReturnStatement: function (argument$1347) {
            return {
                type: Syntax$1017.ReturnStatement,
                argument: argument$1347
            };
        },
        createSequenceExpression: function (expressions$1348) {
            return {
                type: Syntax$1017.SequenceExpression,
                expressions: expressions$1348
            };
        },
        createSwitchCase: function (test$1349, consequent$1350) {
            return {
                type: Syntax$1017.SwitchCase,
                test: test$1349,
                consequent: consequent$1350
            };
        },
        createSwitchStatement: function (discriminant$1351, cases$1352) {
            return {
                type: Syntax$1017.SwitchStatement,
                discriminant: discriminant$1351,
                cases: cases$1352
            };
        },
        createThisExpression: function () {
            return { type: Syntax$1017.ThisExpression };
        },
        createThrowStatement: function (argument$1353) {
            return {
                type: Syntax$1017.ThrowStatement,
                argument: argument$1353
            };
        },
        createTryStatement: function (block$1354, guardedHandlers$1355, handlers$1356, finalizer$1357) {
            return {
                type: Syntax$1017.TryStatement,
                block: block$1354,
                guardedHandlers: guardedHandlers$1355,
                handlers: handlers$1356,
                finalizer: finalizer$1357
            };
        },
        createUnaryExpression: function (operator$1358, argument$1359) {
            if (operator$1358 === '++' || operator$1358 === '--') {
                return {
                    type: Syntax$1017.UpdateExpression,
                    operator: operator$1358,
                    argument: argument$1359,
                    prefix: true
                };
            }
            return {
                type: Syntax$1017.UnaryExpression,
                operator: operator$1358,
                argument: argument$1359
            };
        },
        createVariableDeclaration: function (declarations$1360, kind$1361) {
            return {
                type: Syntax$1017.VariableDeclaration,
                declarations: declarations$1360,
                kind: kind$1361
            };
        },
        createVariableDeclarator: function (id$1362, init$1363) {
            return {
                type: Syntax$1017.VariableDeclarator,
                id: id$1362,
                init: init$1363
            };
        },
        createWhileStatement: function (test$1364, body$1365) {
            return {
                type: Syntax$1017.WhileStatement,
                test: test$1364,
                body: body$1365
            };
        },
        createWithStatement: function (object$1366, body$1367) {
            return {
                type: Syntax$1017.WithStatement,
                object: object$1366,
                body: body$1367
            };
        },
        createTemplateElement: function (value$1368, tail$1369) {
            return {
                type: Syntax$1017.TemplateElement,
                value: value$1368,
                tail: tail$1369
            };
        },
        createTemplateLiteral: function (quasis$1370, expressions$1371) {
            return {
                type: Syntax$1017.TemplateLiteral,
                quasis: quasis$1370,
                expressions: expressions$1371
            };
        },
        createSpreadElement: function (argument$1372) {
            return {
                type: Syntax$1017.SpreadElement,
                argument: argument$1372
            };
        },
        createTaggedTemplateExpression: function (tag$1373, quasi$1374) {
            return {
                type: Syntax$1017.TaggedTemplateExpression,
                tag: tag$1373,
                quasi: quasi$1374
            };
        },
        createArrowFunctionExpression: function (params$1375, defaults$1376, body$1377, rest$1378, expression$1379) {
            return {
                type: Syntax$1017.ArrowFunctionExpression,
                id: null,
                params: params$1375,
                defaults: defaults$1376,
                body: body$1377,
                rest: rest$1378,
                generator: false,
                expression: expression$1379
            };
        },
        createMethodDefinition: function (propertyType$1380, kind$1381, key$1382, value$1383) {
            return {
                type: Syntax$1017.MethodDefinition,
                key: key$1382,
                value: value$1383,
                kind: kind$1381,
                'static': propertyType$1380 === ClassPropertyType$1022.static
            };
        },
        createClassBody: function (body$1384) {
            return {
                type: Syntax$1017.ClassBody,
                body: body$1384
            };
        },
        createClassExpression: function (id$1385, superClass$1386, body$1387) {
            return {
                type: Syntax$1017.ClassExpression,
                id: id$1385,
                superClass: superClass$1386,
                body: body$1387
            };
        },
        createClassDeclaration: function (id$1388, superClass$1389, body$1390) {
            return {
                type: Syntax$1017.ClassDeclaration,
                id: id$1388,
                superClass: superClass$1389,
                body: body$1390
            };
        },
        createExportSpecifier: function (id$1391, name$1392) {
            return {
                type: Syntax$1017.ExportSpecifier,
                id: id$1391,
                name: name$1392
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$1017.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1393, specifiers$1394, source$1395) {
            return {
                type: Syntax$1017.ExportDeclaration,
                declaration: declaration$1393,
                specifiers: specifiers$1394,
                source: source$1395
            };
        },
        createImportSpecifier: function (id$1396, name$1397) {
            return {
                type: Syntax$1017.ImportSpecifier,
                id: id$1396,
                name: name$1397
            };
        },
        createImportDeclaration: function (specifiers$1398, kind$1399, source$1400) {
            return {
                type: Syntax$1017.ImportDeclaration,
                specifiers: specifiers$1398,
                kind: kind$1399,
                source: source$1400
            };
        },
        createYieldExpression: function (argument$1401, delegate$1402) {
            return {
                type: Syntax$1017.YieldExpression,
                argument: argument$1401,
                delegate: delegate$1402
            };
        },
        createModuleDeclaration: function (id$1403, source$1404, body$1405) {
            return {
                type: Syntax$1017.ModuleDeclaration,
                id: id$1403,
                source: source$1404,
                body: body$1405
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$1073() {
        return lookahead$1036.lineNumber !== lineNumber$1026;
    }
    // Throw an exception
    function throwError$1074(token$1406, messageFormat$1407) {
        var error$1408, args$1409 = Array.prototype.slice.call(arguments, 2), msg$1410 = messageFormat$1407.replace(/%(\d)/g, function (whole$1414, index$1415) {
                assert$1040(index$1415 < args$1409.length, 'Message reference must be in range');
                return args$1409[index$1415];
            });
        var startIndex$1411 = streamIndex$1035 > 3 ? streamIndex$1035 - 3 : 0;
        var toks$1412 = tokenStream$1034.slice(startIndex$1411, streamIndex$1035 + 3).map(function (stx$1416) {
                return stx$1416.token.value;
            }).join(' ');
        var tailingMsg$1413 = '\n[... ' + toks$1412 + ' ...]';
        if (typeof token$1406.lineNumber === 'number') {
            error$1408 = new Error('Line ' + token$1406.lineNumber + ': ' + msg$1410 + tailingMsg$1413);
            error$1408.index = token$1406.range[0];
            error$1408.lineNumber = token$1406.lineNumber;
            error$1408.column = token$1406.range[0] - lineStart$1027 + 1;
        } else {
            error$1408 = new Error('Line ' + lineNumber$1026 + ': ' + msg$1410 + tailingMsg$1413);
            error$1408.index = index$1025;
            error$1408.lineNumber = lineNumber$1026;
            error$1408.column = index$1025 - lineStart$1027 + 1;
        }
        error$1408.description = msg$1410;
        throw error$1408;
    }
    function throwErrorTolerant$1075() {
        try {
            throwError$1074.apply(null, arguments);
        } catch (e$1417) {
            if (extra$1039.errors) {
                extra$1039.errors.push(e$1417);
            } else {
                throw e$1417;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$1076(token$1418) {
        if (token$1418.type === Token$1014.EOF) {
            throwError$1074(token$1418, Messages$1019.UnexpectedEOS);
        }
        if (token$1418.type === Token$1014.NumericLiteral) {
            throwError$1074(token$1418, Messages$1019.UnexpectedNumber);
        }
        if (token$1418.type === Token$1014.StringLiteral) {
            throwError$1074(token$1418, Messages$1019.UnexpectedString);
        }
        if (token$1418.type === Token$1014.Identifier) {
            throwError$1074(token$1418, Messages$1019.UnexpectedIdentifier);
        }
        if (token$1418.type === Token$1014.Keyword) {
            if (isFutureReservedWord$1049(token$1418.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$1024 && isStrictModeReservedWord$1050(token$1418.value)) {
                throwErrorTolerant$1075(token$1418, Messages$1019.StrictReservedWord);
                return;
            }
            throwError$1074(token$1418, Messages$1019.UnexpectedToken, token$1418.value);
        }
        if (token$1418.type === Token$1014.Template) {
            throwError$1074(token$1418, Messages$1019.UnexpectedTemplate, token$1418.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$1074(token$1418, Messages$1019.UnexpectedToken, token$1418.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$1077(value$1419) {
        var token$1420 = lex$1070();
        if (token$1420.type !== Token$1014.Punctuator || token$1420.value !== value$1419) {
            throwUnexpected$1076(token$1420);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$1078(keyword$1421) {
        var token$1422 = lex$1070();
        if (token$1422.type !== Token$1014.Keyword || token$1422.value !== keyword$1421) {
            throwUnexpected$1076(token$1422);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$1079(value$1423) {
        return lookahead$1036.type === Token$1014.Punctuator && lookahead$1036.value === value$1423;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$1080(keyword$1424) {
        return lookahead$1036.type === Token$1014.Keyword && lookahead$1036.value === keyword$1424;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$1081(keyword$1425) {
        return lookahead$1036.type === Token$1014.Identifier && lookahead$1036.value === keyword$1425;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$1082() {
        var op$1426;
        if (lookahead$1036.type !== Token$1014.Punctuator) {
            return false;
        }
        op$1426 = lookahead$1036.value;
        return op$1426 === '=' || op$1426 === '*=' || op$1426 === '/=' || op$1426 === '%=' || op$1426 === '+=' || op$1426 === '-=' || op$1426 === '<<=' || op$1426 === '>>=' || op$1426 === '>>>=' || op$1426 === '&=' || op$1426 === '^=' || op$1426 === '|=';
    }
    function consumeSemicolon$1083() {
        var line$1427, ch$1428;
        ch$1428 = lookahead$1036.value ? String(lookahead$1036.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1428 === 59) {
            lex$1070();
            return;
        }
        if (lookahead$1036.lineNumber !== lineNumber$1026) {
            return;
        }
        if (match$1079(';')) {
            lex$1070();
            return;
        }
        if (lookahead$1036.type !== Token$1014.EOF && !match$1079('}')) {
            throwUnexpected$1076(lookahead$1036);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$1084(expr$1429) {
        return expr$1429.type === Syntax$1017.Identifier || expr$1429.type === Syntax$1017.MemberExpression;
    }
    function isAssignableLeftHandSide$1085(expr$1430) {
        return isLeftHandSide$1084(expr$1430) || expr$1430.type === Syntax$1017.ObjectPattern || expr$1430.type === Syntax$1017.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$1086() {
        var elements$1431 = [], blocks$1432 = [], filter$1433 = null, tmp$1434, possiblecomprehension$1435 = true, body$1436;
        expect$1077('[');
        while (!match$1079(']')) {
            if (lookahead$1036.value === 'for' && lookahead$1036.type === Token$1014.Keyword) {
                if (!possiblecomprehension$1435) {
                    throwError$1074({}, Messages$1019.ComprehensionError);
                }
                matchKeyword$1080('for');
                tmp$1434 = parseForStatement$1134({ ignoreBody: true });
                tmp$1434.of = tmp$1434.type === Syntax$1017.ForOfStatement;
                tmp$1434.type = Syntax$1017.ComprehensionBlock;
                if (tmp$1434.left.kind) {
                    // can't be let or const
                    throwError$1074({}, Messages$1019.ComprehensionError);
                }
                blocks$1432.push(tmp$1434);
            } else if (lookahead$1036.value === 'if' && lookahead$1036.type === Token$1014.Keyword) {
                if (!possiblecomprehension$1435) {
                    throwError$1074({}, Messages$1019.ComprehensionError);
                }
                expectKeyword$1078('if');
                expect$1077('(');
                filter$1433 = parseExpression$1114();
                expect$1077(')');
            } else if (lookahead$1036.value === ',' && lookahead$1036.type === Token$1014.Punctuator) {
                possiblecomprehension$1435 = false;
                // no longer allowed.
                lex$1070();
                elements$1431.push(null);
            } else {
                tmp$1434 = parseSpreadOrAssignmentExpression$1097();
                elements$1431.push(tmp$1434);
                if (tmp$1434 && tmp$1434.type === Syntax$1017.SpreadElement) {
                    if (!match$1079(']')) {
                        throwError$1074({}, Messages$1019.ElementAfterSpreadElement);
                    }
                } else if (!(match$1079(']') || matchKeyword$1080('for') || matchKeyword$1080('if'))) {
                    expect$1077(',');
                    // this lexes.
                    possiblecomprehension$1435 = false;
                }
            }
        }
        expect$1077(']');
        if (filter$1433 && !blocks$1432.length) {
            throwError$1074({}, Messages$1019.ComprehensionRequiresBlock);
        }
        if (blocks$1432.length) {
            if (elements$1431.length !== 1) {
                throwError$1074({}, Messages$1019.ComprehensionError);
            }
            return {
                type: Syntax$1017.ComprehensionExpression,
                filter: filter$1433,
                blocks: blocks$1432,
                body: elements$1431[0]
            };
        }
        return delegate$1033.createArrayExpression(elements$1431);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$1087(options$1437) {
        var previousStrict$1438, previousYieldAllowed$1439, params$1440, defaults$1441, body$1442;
        previousStrict$1438 = strict$1024;
        previousYieldAllowed$1439 = state$1038.yieldAllowed;
        state$1038.yieldAllowed = options$1437.generator;
        params$1440 = options$1437.params || [];
        defaults$1441 = options$1437.defaults || [];
        body$1442 = parseConciseBody$1146();
        if (options$1437.name && strict$1024 && isRestrictedWord$1051(params$1440[0].name)) {
            throwErrorTolerant$1075(options$1437.name, Messages$1019.StrictParamName);
        }
        if (state$1038.yieldAllowed && !state$1038.yieldFound) {
            throwErrorTolerant$1075({}, Messages$1019.NoYieldInGenerator);
        }
        strict$1024 = previousStrict$1438;
        state$1038.yieldAllowed = previousYieldAllowed$1439;
        return delegate$1033.createFunctionExpression(null, params$1440, defaults$1441, body$1442, options$1437.rest || null, options$1437.generator, body$1442.type !== Syntax$1017.BlockStatement);
    }
    function parsePropertyMethodFunction$1088(options$1443) {
        var previousStrict$1444, tmp$1445, method$1446;
        previousStrict$1444 = strict$1024;
        strict$1024 = true;
        tmp$1445 = parseParams$1150();
        if (tmp$1445.stricted) {
            throwErrorTolerant$1075(tmp$1445.stricted, tmp$1445.message);
        }
        method$1446 = parsePropertyFunction$1087({
            params: tmp$1445.params,
            defaults: tmp$1445.defaults,
            rest: tmp$1445.rest,
            generator: options$1443.generator
        });
        strict$1024 = previousStrict$1444;
        return method$1446;
    }
    function parseObjectPropertyKey$1089() {
        var token$1447 = lex$1070();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1447.type === Token$1014.StringLiteral || token$1447.type === Token$1014.NumericLiteral) {
            if (strict$1024 && token$1447.octal) {
                throwErrorTolerant$1075(token$1447, Messages$1019.StrictOctalLiteral);
            }
            return delegate$1033.createLiteral(token$1447);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$1033.createIdentifier(token$1447.value);
    }
    function parseObjectProperty$1090() {
        var token$1448, key$1449, id$1450, value$1451, param$1452;
        token$1448 = lookahead$1036;
        if (token$1448.type === Token$1014.Identifier) {
            id$1450 = parseObjectPropertyKey$1089();
            // Property Assignment: Getter and Setter.
            if (token$1448.value === 'get' && !(match$1079(':') || match$1079('('))) {
                key$1449 = parseObjectPropertyKey$1089();
                expect$1077('(');
                expect$1077(')');
                return delegate$1033.createProperty('get', key$1449, parsePropertyFunction$1087({ generator: false }), false, false);
            }
            if (token$1448.value === 'set' && !(match$1079(':') || match$1079('('))) {
                key$1449 = parseObjectPropertyKey$1089();
                expect$1077('(');
                token$1448 = lookahead$1036;
                param$1452 = [parseVariableIdentifier$1117()];
                expect$1077(')');
                return delegate$1033.createProperty('set', key$1449, parsePropertyFunction$1087({
                    params: param$1452,
                    generator: false,
                    name: token$1448
                }), false, false);
            }
            if (match$1079(':')) {
                lex$1070();
                return delegate$1033.createProperty('init', id$1450, parseAssignmentExpression$1113(), false, false);
            }
            if (match$1079('(')) {
                return delegate$1033.createProperty('init', id$1450, parsePropertyMethodFunction$1088({ generator: false }), true, false);
            }
            return delegate$1033.createProperty('init', id$1450, id$1450, false, true);
        }
        if (token$1448.type === Token$1014.EOF || token$1448.type === Token$1014.Punctuator) {
            if (!match$1079('*')) {
                throwUnexpected$1076(token$1448);
            }
            lex$1070();
            id$1450 = parseObjectPropertyKey$1089();
            if (!match$1079('(')) {
                throwUnexpected$1076(lex$1070());
            }
            return delegate$1033.createProperty('init', id$1450, parsePropertyMethodFunction$1088({ generator: true }), true, false);
        }
        key$1449 = parseObjectPropertyKey$1089();
        if (match$1079(':')) {
            lex$1070();
            return delegate$1033.createProperty('init', key$1449, parseAssignmentExpression$1113(), false, false);
        }
        if (match$1079('(')) {
            return delegate$1033.createProperty('init', key$1449, parsePropertyMethodFunction$1088({ generator: false }), true, false);
        }
        throwUnexpected$1076(lex$1070());
    }
    function parseObjectInitialiser$1091() {
        var properties$1453 = [], property$1454, name$1455, key$1456, kind$1457, map$1458 = {}, toString$1459 = String;
        expect$1077('{');
        while (!match$1079('}')) {
            property$1454 = parseObjectProperty$1090();
            if (property$1454.key.type === Syntax$1017.Identifier) {
                name$1455 = property$1454.key.name;
            } else {
                name$1455 = toString$1459(property$1454.key.value);
            }
            kind$1457 = property$1454.kind === 'init' ? PropertyKind$1018.Data : property$1454.kind === 'get' ? PropertyKind$1018.Get : PropertyKind$1018.Set;
            key$1456 = '$' + name$1455;
            if (Object.prototype.hasOwnProperty.call(map$1458, key$1456)) {
                if (map$1458[key$1456] === PropertyKind$1018.Data) {
                    if (strict$1024 && kind$1457 === PropertyKind$1018.Data) {
                        throwErrorTolerant$1075({}, Messages$1019.StrictDuplicateProperty);
                    } else if (kind$1457 !== PropertyKind$1018.Data) {
                        throwErrorTolerant$1075({}, Messages$1019.AccessorDataProperty);
                    }
                } else {
                    if (kind$1457 === PropertyKind$1018.Data) {
                        throwErrorTolerant$1075({}, Messages$1019.AccessorDataProperty);
                    } else if (map$1458[key$1456] & kind$1457) {
                        throwErrorTolerant$1075({}, Messages$1019.AccessorGetSet);
                    }
                }
                map$1458[key$1456] |= kind$1457;
            } else {
                map$1458[key$1456] = kind$1457;
            }
            properties$1453.push(property$1454);
            if (!match$1079('}')) {
                expect$1077(',');
            }
        }
        expect$1077('}');
        return delegate$1033.createObjectExpression(properties$1453);
    }
    function parseTemplateElement$1092(option$1460) {
        var token$1461 = scanTemplateElement$1065(option$1460);
        if (strict$1024 && token$1461.octal) {
            throwError$1074(token$1461, Messages$1019.StrictOctalLiteral);
        }
        return delegate$1033.createTemplateElement({
            raw: token$1461.value.raw,
            cooked: token$1461.value.cooked
        }, token$1461.tail);
    }
    function parseTemplateLiteral$1093() {
        var quasi$1462, quasis$1463, expressions$1464;
        quasi$1462 = parseTemplateElement$1092({ head: true });
        quasis$1463 = [quasi$1462];
        expressions$1464 = [];
        while (!quasi$1462.tail) {
            expressions$1464.push(parseExpression$1114());
            quasi$1462 = parseTemplateElement$1092({ head: false });
            quasis$1463.push(quasi$1462);
        }
        return delegate$1033.createTemplateLiteral(quasis$1463, expressions$1464);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$1094() {
        var expr$1465;
        expect$1077('(');
        ++state$1038.parenthesizedCount;
        expr$1465 = parseExpression$1114();
        expect$1077(')');
        return expr$1465;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$1095() {
        var type$1466, token$1467, resolvedIdent$1468;
        token$1467 = lookahead$1036;
        type$1466 = lookahead$1036.type;
        if (type$1466 === Token$1014.Identifier) {
            resolvedIdent$1468 = expander$1013.resolve(tokenStream$1034[lookaheadIndex$1037]);
            lex$1070();
            return delegate$1033.createIdentifier(resolvedIdent$1468);
        }
        if (type$1466 === Token$1014.StringLiteral || type$1466 === Token$1014.NumericLiteral) {
            if (strict$1024 && lookahead$1036.octal) {
                throwErrorTolerant$1075(lookahead$1036, Messages$1019.StrictOctalLiteral);
            }
            return delegate$1033.createLiteral(lex$1070());
        }
        if (type$1466 === Token$1014.Keyword) {
            if (matchKeyword$1080('this')) {
                lex$1070();
                return delegate$1033.createThisExpression();
            }
            if (matchKeyword$1080('function')) {
                return parseFunctionExpression$1152();
            }
            if (matchKeyword$1080('class')) {
                return parseClassExpression$1157();
            }
            if (matchKeyword$1080('super')) {
                lex$1070();
                return delegate$1033.createIdentifier('super');
            }
        }
        if (type$1466 === Token$1014.BooleanLiteral) {
            token$1467 = lex$1070();
            token$1467.value = token$1467.value === 'true';
            return delegate$1033.createLiteral(token$1467);
        }
        if (type$1466 === Token$1014.NullLiteral) {
            token$1467 = lex$1070();
            token$1467.value = null;
            return delegate$1033.createLiteral(token$1467);
        }
        if (match$1079('[')) {
            return parseArrayInitialiser$1086();
        }
        if (match$1079('{')) {
            return parseObjectInitialiser$1091();
        }
        if (match$1079('(')) {
            return parseGroupExpression$1094();
        }
        if (lookahead$1036.type === Token$1014.RegularExpression) {
            return delegate$1033.createLiteral(lex$1070());
        }
        if (type$1466 === Token$1014.Template) {
            return parseTemplateLiteral$1093();
        }
        return throwUnexpected$1076(lex$1070());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$1096() {
        var args$1469 = [], arg$1470;
        expect$1077('(');
        if (!match$1079(')')) {
            while (streamIndex$1035 < length$1032) {
                arg$1470 = parseSpreadOrAssignmentExpression$1097();
                args$1469.push(arg$1470);
                if (match$1079(')')) {
                    break;
                } else if (arg$1470.type === Syntax$1017.SpreadElement) {
                    throwError$1074({}, Messages$1019.ElementAfterSpreadElement);
                }
                expect$1077(',');
            }
        }
        expect$1077(')');
        return args$1469;
    }
    function parseSpreadOrAssignmentExpression$1097() {
        if (match$1079('...')) {
            lex$1070();
            return delegate$1033.createSpreadElement(parseAssignmentExpression$1113());
        }
        return parseAssignmentExpression$1113();
    }
    function parseNonComputedProperty$1098() {
        var token$1471 = lex$1070();
        if (!isIdentifierName$1067(token$1471)) {
            throwUnexpected$1076(token$1471);
        }
        return delegate$1033.createIdentifier(token$1471.value);
    }
    function parseNonComputedMember$1099() {
        expect$1077('.');
        return parseNonComputedProperty$1098();
    }
    function parseComputedMember$1100() {
        var expr$1472;
        expect$1077('[');
        expr$1472 = parseExpression$1114();
        expect$1077(']');
        return expr$1472;
    }
    function parseNewExpression$1101() {
        var callee$1473, args$1474;
        expectKeyword$1078('new');
        callee$1473 = parseLeftHandSideExpression$1103();
        args$1474 = match$1079('(') ? parseArguments$1096() : [];
        return delegate$1033.createNewExpression(callee$1473, args$1474);
    }
    function parseLeftHandSideExpressionAllowCall$1102() {
        var expr$1475, args$1476, property$1477;
        expr$1475 = matchKeyword$1080('new') ? parseNewExpression$1101() : parsePrimaryExpression$1095();
        while (match$1079('.') || match$1079('[') || match$1079('(') || lookahead$1036.type === Token$1014.Template) {
            if (match$1079('(')) {
                args$1476 = parseArguments$1096();
                expr$1475 = delegate$1033.createCallExpression(expr$1475, args$1476);
            } else if (match$1079('[')) {
                expr$1475 = delegate$1033.createMemberExpression('[', expr$1475, parseComputedMember$1100());
            } else if (match$1079('.')) {
                expr$1475 = delegate$1033.createMemberExpression('.', expr$1475, parseNonComputedMember$1099());
            } else {
                expr$1475 = delegate$1033.createTaggedTemplateExpression(expr$1475, parseTemplateLiteral$1093());
            }
        }
        return expr$1475;
    }
    function parseLeftHandSideExpression$1103() {
        var expr$1478, property$1479;
        expr$1478 = matchKeyword$1080('new') ? parseNewExpression$1101() : parsePrimaryExpression$1095();
        while (match$1079('.') || match$1079('[') || lookahead$1036.type === Token$1014.Template) {
            if (match$1079('[')) {
                expr$1478 = delegate$1033.createMemberExpression('[', expr$1478, parseComputedMember$1100());
            } else if (match$1079('.')) {
                expr$1478 = delegate$1033.createMemberExpression('.', expr$1478, parseNonComputedMember$1099());
            } else {
                expr$1478 = delegate$1033.createTaggedTemplateExpression(expr$1478, parseTemplateLiteral$1093());
            }
        }
        return expr$1478;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$1104() {
        var expr$1480 = parseLeftHandSideExpressionAllowCall$1102(), token$1481 = lookahead$1036;
        if (lookahead$1036.type !== Token$1014.Punctuator) {
            return expr$1480;
        }
        if ((match$1079('++') || match$1079('--')) && !peekLineTerminator$1073()) {
            // 11.3.1, 11.3.2
            if (strict$1024 && expr$1480.type === Syntax$1017.Identifier && isRestrictedWord$1051(expr$1480.name)) {
                throwErrorTolerant$1075({}, Messages$1019.StrictLHSPostfix);
            }
            if (!isLeftHandSide$1084(expr$1480)) {
                throwError$1074({}, Messages$1019.InvalidLHSInAssignment);
            }
            token$1481 = lex$1070();
            expr$1480 = delegate$1033.createPostfixExpression(token$1481.value, expr$1480);
        }
        return expr$1480;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$1105() {
        var token$1482, expr$1483;
        if (lookahead$1036.type !== Token$1014.Punctuator && lookahead$1036.type !== Token$1014.Keyword) {
            return parsePostfixExpression$1104();
        }
        if (match$1079('++') || match$1079('--')) {
            token$1482 = lex$1070();
            expr$1483 = parseUnaryExpression$1105();
            // 11.4.4, 11.4.5
            if (strict$1024 && expr$1483.type === Syntax$1017.Identifier && isRestrictedWord$1051(expr$1483.name)) {
                throwErrorTolerant$1075({}, Messages$1019.StrictLHSPrefix);
            }
            if (!isLeftHandSide$1084(expr$1483)) {
                throwError$1074({}, Messages$1019.InvalidLHSInAssignment);
            }
            return delegate$1033.createUnaryExpression(token$1482.value, expr$1483);
        }
        if (match$1079('+') || match$1079('-') || match$1079('~') || match$1079('!')) {
            token$1482 = lex$1070();
            expr$1483 = parseUnaryExpression$1105();
            return delegate$1033.createUnaryExpression(token$1482.value, expr$1483);
        }
        if (matchKeyword$1080('delete') || matchKeyword$1080('void') || matchKeyword$1080('typeof')) {
            token$1482 = lex$1070();
            expr$1483 = parseUnaryExpression$1105();
            expr$1483 = delegate$1033.createUnaryExpression(token$1482.value, expr$1483);
            if (strict$1024 && expr$1483.operator === 'delete' && expr$1483.argument.type === Syntax$1017.Identifier) {
                throwErrorTolerant$1075({}, Messages$1019.StrictDelete);
            }
            return expr$1483;
        }
        return parsePostfixExpression$1104();
    }
    function binaryPrecedence$1106(token$1484, allowIn$1485) {
        var prec$1486 = 0;
        if (token$1484.type !== Token$1014.Punctuator && token$1484.type !== Token$1014.Keyword) {
            return 0;
        }
        switch (token$1484.value) {
        case '||':
            prec$1486 = 1;
            break;
        case '&&':
            prec$1486 = 2;
            break;
        case '|':
            prec$1486 = 3;
            break;
        case '^':
            prec$1486 = 4;
            break;
        case '&':
            prec$1486 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1486 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1486 = 7;
            break;
        case 'in':
            prec$1486 = allowIn$1485 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1486 = 8;
            break;
        case '+':
        case '-':
            prec$1486 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1486 = 11;
            break;
        default:
            break;
        }
        return prec$1486;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$1107() {
        var expr$1487, token$1488, prec$1489, previousAllowIn$1490, stack$1491, right$1492, operator$1493, left$1494, i$1495;
        previousAllowIn$1490 = state$1038.allowIn;
        state$1038.allowIn = true;
        expr$1487 = parseUnaryExpression$1105();
        token$1488 = lookahead$1036;
        prec$1489 = binaryPrecedence$1106(token$1488, previousAllowIn$1490);
        if (prec$1489 === 0) {
            return expr$1487;
        }
        token$1488.prec = prec$1489;
        lex$1070();
        stack$1491 = [
            expr$1487,
            token$1488,
            parseUnaryExpression$1105()
        ];
        while ((prec$1489 = binaryPrecedence$1106(lookahead$1036, previousAllowIn$1490)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1491.length > 2 && prec$1489 <= stack$1491[stack$1491.length - 2].prec) {
                right$1492 = stack$1491.pop();
                operator$1493 = stack$1491.pop().value;
                left$1494 = stack$1491.pop();
                stack$1491.push(delegate$1033.createBinaryExpression(operator$1493, left$1494, right$1492));
            }
            // Shift.
            token$1488 = lex$1070();
            token$1488.prec = prec$1489;
            stack$1491.push(token$1488);
            stack$1491.push(parseUnaryExpression$1105());
        }
        state$1038.allowIn = previousAllowIn$1490;
        // Final reduce to clean-up the stack.
        i$1495 = stack$1491.length - 1;
        expr$1487 = stack$1491[i$1495];
        while (i$1495 > 1) {
            expr$1487 = delegate$1033.createBinaryExpression(stack$1491[i$1495 - 1].value, stack$1491[i$1495 - 2], expr$1487);
            i$1495 -= 2;
        }
        return expr$1487;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$1108() {
        var expr$1496, previousAllowIn$1497, consequent$1498, alternate$1499;
        expr$1496 = parseBinaryExpression$1107();
        if (match$1079('?')) {
            lex$1070();
            previousAllowIn$1497 = state$1038.allowIn;
            state$1038.allowIn = true;
            consequent$1498 = parseAssignmentExpression$1113();
            state$1038.allowIn = previousAllowIn$1497;
            expect$1077(':');
            alternate$1499 = parseAssignmentExpression$1113();
            expr$1496 = delegate$1033.createConditionalExpression(expr$1496, consequent$1498, alternate$1499);
        }
        return expr$1496;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$1109(expr$1500) {
        var i$1501, len$1502, property$1503, element$1504;
        if (expr$1500.type === Syntax$1017.ObjectExpression) {
            expr$1500.type = Syntax$1017.ObjectPattern;
            for (i$1501 = 0, len$1502 = expr$1500.properties.length; i$1501 < len$1502; i$1501 += 1) {
                property$1503 = expr$1500.properties[i$1501];
                if (property$1503.kind !== 'init') {
                    throwError$1074({}, Messages$1019.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$1109(property$1503.value);
            }
        } else if (expr$1500.type === Syntax$1017.ArrayExpression) {
            expr$1500.type = Syntax$1017.ArrayPattern;
            for (i$1501 = 0, len$1502 = expr$1500.elements.length; i$1501 < len$1502; i$1501 += 1) {
                element$1504 = expr$1500.elements[i$1501];
                if (element$1504) {
                    reinterpretAsAssignmentBindingPattern$1109(element$1504);
                }
            }
        } else if (expr$1500.type === Syntax$1017.Identifier) {
            if (isRestrictedWord$1051(expr$1500.name)) {
                throwError$1074({}, Messages$1019.InvalidLHSInAssignment);
            }
        } else if (expr$1500.type === Syntax$1017.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$1109(expr$1500.argument);
            if (expr$1500.argument.type === Syntax$1017.ObjectPattern) {
                throwError$1074({}, Messages$1019.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1500.type !== Syntax$1017.MemberExpression && expr$1500.type !== Syntax$1017.CallExpression && expr$1500.type !== Syntax$1017.NewExpression) {
                throwError$1074({}, Messages$1019.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$1110(options$1505, expr$1506) {
        var i$1507, len$1508, property$1509, element$1510;
        if (expr$1506.type === Syntax$1017.ObjectExpression) {
            expr$1506.type = Syntax$1017.ObjectPattern;
            for (i$1507 = 0, len$1508 = expr$1506.properties.length; i$1507 < len$1508; i$1507 += 1) {
                property$1509 = expr$1506.properties[i$1507];
                if (property$1509.kind !== 'init') {
                    throwError$1074({}, Messages$1019.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$1110(options$1505, property$1509.value);
            }
        } else if (expr$1506.type === Syntax$1017.ArrayExpression) {
            expr$1506.type = Syntax$1017.ArrayPattern;
            for (i$1507 = 0, len$1508 = expr$1506.elements.length; i$1507 < len$1508; i$1507 += 1) {
                element$1510 = expr$1506.elements[i$1507];
                if (element$1510) {
                    reinterpretAsDestructuredParameter$1110(options$1505, element$1510);
                }
            }
        } else if (expr$1506.type === Syntax$1017.Identifier) {
            validateParam$1148(options$1505, expr$1506, expr$1506.name);
        } else {
            if (expr$1506.type !== Syntax$1017.MemberExpression) {
                throwError$1074({}, Messages$1019.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$1111(expressions$1511) {
        var i$1512, len$1513, param$1514, params$1515, defaults$1516, defaultCount$1517, options$1518, rest$1519;
        params$1515 = [];
        defaults$1516 = [];
        defaultCount$1517 = 0;
        rest$1519 = null;
        options$1518 = { paramSet: {} };
        for (i$1512 = 0, len$1513 = expressions$1511.length; i$1512 < len$1513; i$1512 += 1) {
            param$1514 = expressions$1511[i$1512];
            if (param$1514.type === Syntax$1017.Identifier) {
                params$1515.push(param$1514);
                defaults$1516.push(null);
                validateParam$1148(options$1518, param$1514, param$1514.name);
            } else if (param$1514.type === Syntax$1017.ObjectExpression || param$1514.type === Syntax$1017.ArrayExpression) {
                reinterpretAsDestructuredParameter$1110(options$1518, param$1514);
                params$1515.push(param$1514);
                defaults$1516.push(null);
            } else if (param$1514.type === Syntax$1017.SpreadElement) {
                assert$1040(i$1512 === len$1513 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$1110(options$1518, param$1514.argument);
                rest$1519 = param$1514.argument;
            } else if (param$1514.type === Syntax$1017.AssignmentExpression) {
                params$1515.push(param$1514.left);
                defaults$1516.push(param$1514.right);
                ++defaultCount$1517;
                validateParam$1148(options$1518, param$1514.left, param$1514.left.name);
            } else {
                return null;
            }
        }
        if (options$1518.message === Messages$1019.StrictParamDupe) {
            throwError$1074(strict$1024 ? options$1518.stricted : options$1518.firstRestricted, options$1518.message);
        }
        if (defaultCount$1517 === 0) {
            defaults$1516 = [];
        }
        return {
            params: params$1515,
            defaults: defaults$1516,
            rest: rest$1519,
            stricted: options$1518.stricted,
            firstRestricted: options$1518.firstRestricted,
            message: options$1518.message
        };
    }
    function parseArrowFunctionExpression$1112(options$1520) {
        var previousStrict$1521, previousYieldAllowed$1522, body$1523;
        expect$1077('=>');
        previousStrict$1521 = strict$1024;
        previousYieldAllowed$1522 = state$1038.yieldAllowed;
        state$1038.yieldAllowed = false;
        body$1523 = parseConciseBody$1146();
        if (strict$1024 && options$1520.firstRestricted) {
            throwError$1074(options$1520.firstRestricted, options$1520.message);
        }
        if (strict$1024 && options$1520.stricted) {
            throwErrorTolerant$1075(options$1520.stricted, options$1520.message);
        }
        strict$1024 = previousStrict$1521;
        state$1038.yieldAllowed = previousYieldAllowed$1522;
        return delegate$1033.createArrowFunctionExpression(options$1520.params, options$1520.defaults, body$1523, options$1520.rest, body$1523.type !== Syntax$1017.BlockStatement);
    }
    function parseAssignmentExpression$1113() {
        var expr$1524, token$1525, params$1526, oldParenthesizedCount$1527;
        if (matchKeyword$1080('yield')) {
            return parseYieldExpression$1153();
        }
        oldParenthesizedCount$1527 = state$1038.parenthesizedCount;
        if (match$1079('(')) {
            token$1525 = lookahead2$1072();
            if (token$1525.type === Token$1014.Punctuator && token$1525.value === ')' || token$1525.value === '...') {
                params$1526 = parseParams$1150();
                if (!match$1079('=>')) {
                    throwUnexpected$1076(lex$1070());
                }
                return parseArrowFunctionExpression$1112(params$1526);
            }
        }
        token$1525 = lookahead$1036;
        expr$1524 = parseConditionalExpression$1108();
        if (match$1079('=>') && (state$1038.parenthesizedCount === oldParenthesizedCount$1527 || state$1038.parenthesizedCount === oldParenthesizedCount$1527 + 1)) {
            if (expr$1524.type === Syntax$1017.Identifier) {
                params$1526 = reinterpretAsCoverFormalsList$1111([expr$1524]);
            } else if (expr$1524.type === Syntax$1017.SequenceExpression) {
                params$1526 = reinterpretAsCoverFormalsList$1111(expr$1524.expressions);
            }
            if (params$1526) {
                return parseArrowFunctionExpression$1112(params$1526);
            }
        }
        if (matchAssign$1082()) {
            // 11.13.1
            if (strict$1024 && expr$1524.type === Syntax$1017.Identifier && isRestrictedWord$1051(expr$1524.name)) {
                throwErrorTolerant$1075(token$1525, Messages$1019.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$1079('=') && (expr$1524.type === Syntax$1017.ObjectExpression || expr$1524.type === Syntax$1017.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$1109(expr$1524);
            } else if (!isLeftHandSide$1084(expr$1524)) {
                throwError$1074({}, Messages$1019.InvalidLHSInAssignment);
            }
            expr$1524 = delegate$1033.createAssignmentExpression(lex$1070().value, expr$1524, parseAssignmentExpression$1113());
        }
        return expr$1524;
    }
    // 11.14 Comma Operator
    function parseExpression$1114() {
        var expr$1528, expressions$1529, sequence$1530, coverFormalsList$1531, spreadFound$1532, oldParenthesizedCount$1533;
        oldParenthesizedCount$1533 = state$1038.parenthesizedCount;
        expr$1528 = parseAssignmentExpression$1113();
        expressions$1529 = [expr$1528];
        if (match$1079(',')) {
            while (streamIndex$1035 < length$1032) {
                if (!match$1079(',')) {
                    break;
                }
                lex$1070();
                expr$1528 = parseSpreadOrAssignmentExpression$1097();
                expressions$1529.push(expr$1528);
                if (expr$1528.type === Syntax$1017.SpreadElement) {
                    spreadFound$1532 = true;
                    if (!match$1079(')')) {
                        throwError$1074({}, Messages$1019.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1530 = delegate$1033.createSequenceExpression(expressions$1529);
        }
        if (match$1079('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$1038.parenthesizedCount === oldParenthesizedCount$1533 || state$1038.parenthesizedCount === oldParenthesizedCount$1533 + 1) {
                expr$1528 = expr$1528.type === Syntax$1017.SequenceExpression ? expr$1528.expressions : expressions$1529;
                coverFormalsList$1531 = reinterpretAsCoverFormalsList$1111(expr$1528);
                if (coverFormalsList$1531) {
                    return parseArrowFunctionExpression$1112(coverFormalsList$1531);
                }
            }
            throwUnexpected$1076(lex$1070());
        }
        if (spreadFound$1532 && lookahead2$1072().value !== '=>') {
            throwError$1074({}, Messages$1019.IllegalSpread);
        }
        return sequence$1530 || expr$1528;
    }
    // 12.1 Block
    function parseStatementList$1115() {
        var list$1534 = [], statement$1535;
        while (streamIndex$1035 < length$1032) {
            if (match$1079('}')) {
                break;
            }
            statement$1535 = parseSourceElement$1160();
            if (typeof statement$1535 === 'undefined') {
                break;
            }
            list$1534.push(statement$1535);
        }
        return list$1534;
    }
    function parseBlock$1116() {
        var block$1536;
        expect$1077('{');
        block$1536 = parseStatementList$1115();
        expect$1077('}');
        return delegate$1033.createBlockStatement(block$1536);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$1117() {
        var token$1537 = lookahead$1036, resolvedIdent$1538;
        if (token$1537.type !== Token$1014.Identifier) {
            throwUnexpected$1076(token$1537);
        }
        resolvedIdent$1538 = expander$1013.resolve(tokenStream$1034[lookaheadIndex$1037]);
        lex$1070();
        return delegate$1033.createIdentifier(resolvedIdent$1538);
    }
    function parseVariableDeclaration$1118(kind$1539) {
        var id$1540, init$1541 = null;
        if (match$1079('{')) {
            id$1540 = parseObjectInitialiser$1091();
            reinterpretAsAssignmentBindingPattern$1109(id$1540);
        } else if (match$1079('[')) {
            id$1540 = parseArrayInitialiser$1086();
            reinterpretAsAssignmentBindingPattern$1109(id$1540);
        } else {
            id$1540 = state$1038.allowKeyword ? parseNonComputedProperty$1098() : parseVariableIdentifier$1117();
            // 12.2.1
            if (strict$1024 && isRestrictedWord$1051(id$1540.name)) {
                throwErrorTolerant$1075({}, Messages$1019.StrictVarName);
            }
        }
        if (kind$1539 === 'const') {
            if (!match$1079('=')) {
                throwError$1074({}, Messages$1019.NoUnintializedConst);
            }
            expect$1077('=');
            init$1541 = parseAssignmentExpression$1113();
        } else if (match$1079('=')) {
            lex$1070();
            init$1541 = parseAssignmentExpression$1113();
        }
        return delegate$1033.createVariableDeclarator(id$1540, init$1541);
    }
    function parseVariableDeclarationList$1119(kind$1542) {
        var list$1543 = [];
        do {
            list$1543.push(parseVariableDeclaration$1118(kind$1542));
            if (!match$1079(',')) {
                break;
            }
            lex$1070();
        } while (streamIndex$1035 < length$1032);
        return list$1543;
    }
    function parseVariableStatement$1120() {
        var declarations$1544;
        expectKeyword$1078('var');
        declarations$1544 = parseVariableDeclarationList$1119();
        consumeSemicolon$1083();
        return delegate$1033.createVariableDeclaration(declarations$1544, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$1121(kind$1545) {
        var declarations$1546;
        expectKeyword$1078(kind$1545);
        declarations$1546 = parseVariableDeclarationList$1119(kind$1545);
        consumeSemicolon$1083();
        return delegate$1033.createVariableDeclaration(declarations$1546, kind$1545);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$1122() {
        var id$1547, src$1548, body$1549;
        lex$1070();
        // 'module'
        if (peekLineTerminator$1073()) {
            throwError$1074({}, Messages$1019.NewlineAfterModule);
        }
        switch (lookahead$1036.type) {
        case Token$1014.StringLiteral:
            id$1547 = parsePrimaryExpression$1095();
            body$1549 = parseModuleBlock$1165();
            src$1548 = null;
            break;
        case Token$1014.Identifier:
            id$1547 = parseVariableIdentifier$1117();
            body$1549 = null;
            if (!matchContextualKeyword$1081('from')) {
                throwUnexpected$1076(lex$1070());
            }
            lex$1070();
            src$1548 = parsePrimaryExpression$1095();
            if (src$1548.type !== Syntax$1017.Literal) {
                throwError$1074({}, Messages$1019.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$1083();
        return delegate$1033.createModuleDeclaration(id$1547, src$1548, body$1549);
    }
    function parseExportBatchSpecifier$1123() {
        expect$1077('*');
        return delegate$1033.createExportBatchSpecifier();
    }
    function parseExportSpecifier$1124() {
        var id$1550, name$1551 = null;
        id$1550 = parseVariableIdentifier$1117();
        if (matchContextualKeyword$1081('as')) {
            lex$1070();
            name$1551 = parseNonComputedProperty$1098();
        }
        return delegate$1033.createExportSpecifier(id$1550, name$1551);
    }
    function parseExportDeclaration$1125() {
        var previousAllowKeyword$1552, decl$1553, def$1554, src$1555, specifiers$1556;
        expectKeyword$1078('export');
        if (lookahead$1036.type === Token$1014.Keyword) {
            switch (lookahead$1036.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$1033.createExportDeclaration(parseSourceElement$1160(), null, null);
            }
        }
        if (isIdentifierName$1067(lookahead$1036)) {
            previousAllowKeyword$1552 = state$1038.allowKeyword;
            state$1038.allowKeyword = true;
            decl$1553 = parseVariableDeclarationList$1119('let');
            state$1038.allowKeyword = previousAllowKeyword$1552;
            return delegate$1033.createExportDeclaration(decl$1553, null, null);
        }
        specifiers$1556 = [];
        src$1555 = null;
        if (match$1079('*')) {
            specifiers$1556.push(parseExportBatchSpecifier$1123());
        } else {
            expect$1077('{');
            do {
                specifiers$1556.push(parseExportSpecifier$1124());
            } while (match$1079(',') && lex$1070());
            expect$1077('}');
        }
        if (matchContextualKeyword$1081('from')) {
            lex$1070();
            src$1555 = parsePrimaryExpression$1095();
            if (src$1555.type !== Syntax$1017.Literal) {
                throwError$1074({}, Messages$1019.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$1083();
        return delegate$1033.createExportDeclaration(null, specifiers$1556, src$1555);
    }
    function parseImportDeclaration$1126() {
        var specifiers$1557, kind$1558, src$1559;
        expectKeyword$1078('import');
        specifiers$1557 = [];
        if (isIdentifierName$1067(lookahead$1036)) {
            kind$1558 = 'default';
            specifiers$1557.push(parseImportSpecifier$1127());
            if (!matchContextualKeyword$1081('from')) {
                throwError$1074({}, Messages$1019.NoFromAfterImport);
            }
            lex$1070();
        } else if (match$1079('{')) {
            kind$1558 = 'named';
            lex$1070();
            do {
                specifiers$1557.push(parseImportSpecifier$1127());
            } while (match$1079(',') && lex$1070());
            expect$1077('}');
            if (!matchContextualKeyword$1081('from')) {
                throwError$1074({}, Messages$1019.NoFromAfterImport);
            }
            lex$1070();
        }
        src$1559 = parsePrimaryExpression$1095();
        if (src$1559.type !== Syntax$1017.Literal) {
            throwError$1074({}, Messages$1019.InvalidModuleSpecifier);
        }
        consumeSemicolon$1083();
        return delegate$1033.createImportDeclaration(specifiers$1557, kind$1558, src$1559);
    }
    function parseImportSpecifier$1127() {
        var id$1560, name$1561 = null;
        id$1560 = parseNonComputedProperty$1098();
        if (matchContextualKeyword$1081('as')) {
            lex$1070();
            name$1561 = parseVariableIdentifier$1117();
        }
        return delegate$1033.createImportSpecifier(id$1560, name$1561);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$1128() {
        expect$1077(';');
        return delegate$1033.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$1129() {
        var expr$1562 = parseExpression$1114();
        consumeSemicolon$1083();
        return delegate$1033.createExpressionStatement(expr$1562);
    }
    // 12.5 If statement
    function parseIfStatement$1130() {
        var test$1563, consequent$1564, alternate$1565;
        expectKeyword$1078('if');
        expect$1077('(');
        test$1563 = parseExpression$1114();
        expect$1077(')');
        consequent$1564 = parseStatement$1145();
        if (matchKeyword$1080('else')) {
            lex$1070();
            alternate$1565 = parseStatement$1145();
        } else {
            alternate$1565 = null;
        }
        return delegate$1033.createIfStatement(test$1563, consequent$1564, alternate$1565);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$1131() {
        var body$1566, test$1567, oldInIteration$1568;
        expectKeyword$1078('do');
        oldInIteration$1568 = state$1038.inIteration;
        state$1038.inIteration = true;
        body$1566 = parseStatement$1145();
        state$1038.inIteration = oldInIteration$1568;
        expectKeyword$1078('while');
        expect$1077('(');
        test$1567 = parseExpression$1114();
        expect$1077(')');
        if (match$1079(';')) {
            lex$1070();
        }
        return delegate$1033.createDoWhileStatement(body$1566, test$1567);
    }
    function parseWhileStatement$1132() {
        var test$1569, body$1570, oldInIteration$1571;
        expectKeyword$1078('while');
        expect$1077('(');
        test$1569 = parseExpression$1114();
        expect$1077(')');
        oldInIteration$1571 = state$1038.inIteration;
        state$1038.inIteration = true;
        body$1570 = parseStatement$1145();
        state$1038.inIteration = oldInIteration$1571;
        return delegate$1033.createWhileStatement(test$1569, body$1570);
    }
    function parseForVariableDeclaration$1133() {
        var token$1572 = lex$1070(), declarations$1573 = parseVariableDeclarationList$1119();
        return delegate$1033.createVariableDeclaration(declarations$1573, token$1572.value);
    }
    function parseForStatement$1134(opts$1574) {
        var init$1575, test$1576, update$1577, left$1578, right$1579, body$1580, operator$1581, oldInIteration$1582;
        init$1575 = test$1576 = update$1577 = null;
        expectKeyword$1078('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$1081('each')) {
            throwError$1074({}, Messages$1019.EachNotAllowed);
        }
        expect$1077('(');
        if (match$1079(';')) {
            lex$1070();
        } else {
            if (matchKeyword$1080('var') || matchKeyword$1080('let') || matchKeyword$1080('const')) {
                state$1038.allowIn = false;
                init$1575 = parseForVariableDeclaration$1133();
                state$1038.allowIn = true;
                if (init$1575.declarations.length === 1) {
                    if (matchKeyword$1080('in') || matchContextualKeyword$1081('of')) {
                        operator$1581 = lookahead$1036;
                        if (!((operator$1581.value === 'in' || init$1575.kind !== 'var') && init$1575.declarations[0].init)) {
                            lex$1070();
                            left$1578 = init$1575;
                            right$1579 = parseExpression$1114();
                            init$1575 = null;
                        }
                    }
                }
            } else {
                state$1038.allowIn = false;
                init$1575 = parseExpression$1114();
                state$1038.allowIn = true;
                if (matchContextualKeyword$1081('of')) {
                    operator$1581 = lex$1070();
                    left$1578 = init$1575;
                    right$1579 = parseExpression$1114();
                    init$1575 = null;
                } else if (matchKeyword$1080('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$1085(init$1575)) {
                        throwError$1074({}, Messages$1019.InvalidLHSInForIn);
                    }
                    operator$1581 = lex$1070();
                    left$1578 = init$1575;
                    right$1579 = parseExpression$1114();
                    init$1575 = null;
                }
            }
            if (typeof left$1578 === 'undefined') {
                expect$1077(';');
            }
        }
        if (typeof left$1578 === 'undefined') {
            if (!match$1079(';')) {
                test$1576 = parseExpression$1114();
            }
            expect$1077(';');
            if (!match$1079(')')) {
                update$1577 = parseExpression$1114();
            }
        }
        expect$1077(')');
        oldInIteration$1582 = state$1038.inIteration;
        state$1038.inIteration = true;
        if (!(opts$1574 !== undefined && opts$1574.ignoreBody)) {
            body$1580 = parseStatement$1145();
        }
        state$1038.inIteration = oldInIteration$1582;
        if (typeof left$1578 === 'undefined') {
            return delegate$1033.createForStatement(init$1575, test$1576, update$1577, body$1580);
        }
        if (operator$1581.value === 'in') {
            return delegate$1033.createForInStatement(left$1578, right$1579, body$1580);
        }
        return delegate$1033.createForOfStatement(left$1578, right$1579, body$1580);
    }
    // 12.7 The continue statement
    function parseContinueStatement$1135() {
        var label$1583 = null, key$1584;
        expectKeyword$1078('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$1036.value.charCodeAt(0) === 59) {
            lex$1070();
            if (!state$1038.inIteration) {
                throwError$1074({}, Messages$1019.IllegalContinue);
            }
            return delegate$1033.createContinueStatement(null);
        }
        if (peekLineTerminator$1073()) {
            if (!state$1038.inIteration) {
                throwError$1074({}, Messages$1019.IllegalContinue);
            }
            return delegate$1033.createContinueStatement(null);
        }
        if (lookahead$1036.type === Token$1014.Identifier) {
            label$1583 = parseVariableIdentifier$1117();
            key$1584 = '$' + label$1583.name;
            if (!Object.prototype.hasOwnProperty.call(state$1038.labelSet, key$1584)) {
                throwError$1074({}, Messages$1019.UnknownLabel, label$1583.name);
            }
        }
        consumeSemicolon$1083();
        if (label$1583 === null && !state$1038.inIteration) {
            throwError$1074({}, Messages$1019.IllegalContinue);
        }
        return delegate$1033.createContinueStatement(label$1583);
    }
    // 12.8 The break statement
    function parseBreakStatement$1136() {
        var label$1585 = null, key$1586;
        expectKeyword$1078('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$1036.value.charCodeAt(0) === 59) {
            lex$1070();
            if (!(state$1038.inIteration || state$1038.inSwitch)) {
                throwError$1074({}, Messages$1019.IllegalBreak);
            }
            return delegate$1033.createBreakStatement(null);
        }
        if (peekLineTerminator$1073()) {
            if (!(state$1038.inIteration || state$1038.inSwitch)) {
                throwError$1074({}, Messages$1019.IllegalBreak);
            }
            return delegate$1033.createBreakStatement(null);
        }
        if (lookahead$1036.type === Token$1014.Identifier) {
            label$1585 = parseVariableIdentifier$1117();
            key$1586 = '$' + label$1585.name;
            if (!Object.prototype.hasOwnProperty.call(state$1038.labelSet, key$1586)) {
                throwError$1074({}, Messages$1019.UnknownLabel, label$1585.name);
            }
        }
        consumeSemicolon$1083();
        if (label$1585 === null && !(state$1038.inIteration || state$1038.inSwitch)) {
            throwError$1074({}, Messages$1019.IllegalBreak);
        }
        return delegate$1033.createBreakStatement(label$1585);
    }
    // 12.9 The return statement
    function parseReturnStatement$1137() {
        var argument$1587 = null;
        expectKeyword$1078('return');
        if (!state$1038.inFunctionBody) {
            throwErrorTolerant$1075({}, Messages$1019.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$1047(String(lookahead$1036.value).charCodeAt(0))) {
            argument$1587 = parseExpression$1114();
            consumeSemicolon$1083();
            return delegate$1033.createReturnStatement(argument$1587);
        }
        if (peekLineTerminator$1073()) {
            return delegate$1033.createReturnStatement(null);
        }
        if (!match$1079(';')) {
            if (!match$1079('}') && lookahead$1036.type !== Token$1014.EOF) {
                argument$1587 = parseExpression$1114();
            }
        }
        consumeSemicolon$1083();
        return delegate$1033.createReturnStatement(argument$1587);
    }
    // 12.10 The with statement
    function parseWithStatement$1138() {
        var object$1588, body$1589;
        if (strict$1024) {
            throwErrorTolerant$1075({}, Messages$1019.StrictModeWith);
        }
        expectKeyword$1078('with');
        expect$1077('(');
        object$1588 = parseExpression$1114();
        expect$1077(')');
        body$1589 = parseStatement$1145();
        return delegate$1033.createWithStatement(object$1588, body$1589);
    }
    // 12.10 The swith statement
    function parseSwitchCase$1139() {
        var test$1590, consequent$1591 = [], sourceElement$1592;
        if (matchKeyword$1080('default')) {
            lex$1070();
            test$1590 = null;
        } else {
            expectKeyword$1078('case');
            test$1590 = parseExpression$1114();
        }
        expect$1077(':');
        while (streamIndex$1035 < length$1032) {
            if (match$1079('}') || matchKeyword$1080('default') || matchKeyword$1080('case')) {
                break;
            }
            sourceElement$1592 = parseSourceElement$1160();
            if (typeof sourceElement$1592 === 'undefined') {
                break;
            }
            consequent$1591.push(sourceElement$1592);
        }
        return delegate$1033.createSwitchCase(test$1590, consequent$1591);
    }
    function parseSwitchStatement$1140() {
        var discriminant$1593, cases$1594, clause$1595, oldInSwitch$1596, defaultFound$1597;
        expectKeyword$1078('switch');
        expect$1077('(');
        discriminant$1593 = parseExpression$1114();
        expect$1077(')');
        expect$1077('{');
        cases$1594 = [];
        if (match$1079('}')) {
            lex$1070();
            return delegate$1033.createSwitchStatement(discriminant$1593, cases$1594);
        }
        oldInSwitch$1596 = state$1038.inSwitch;
        state$1038.inSwitch = true;
        defaultFound$1597 = false;
        while (streamIndex$1035 < length$1032) {
            if (match$1079('}')) {
                break;
            }
            clause$1595 = parseSwitchCase$1139();
            if (clause$1595.test === null) {
                if (defaultFound$1597) {
                    throwError$1074({}, Messages$1019.MultipleDefaultsInSwitch);
                }
                defaultFound$1597 = true;
            }
            cases$1594.push(clause$1595);
        }
        state$1038.inSwitch = oldInSwitch$1596;
        expect$1077('}');
        return delegate$1033.createSwitchStatement(discriminant$1593, cases$1594);
    }
    // 12.13 The throw statement
    function parseThrowStatement$1141() {
        var argument$1598;
        expectKeyword$1078('throw');
        if (peekLineTerminator$1073()) {
            throwError$1074({}, Messages$1019.NewlineAfterThrow);
        }
        argument$1598 = parseExpression$1114();
        consumeSemicolon$1083();
        return delegate$1033.createThrowStatement(argument$1598);
    }
    // 12.14 The try statement
    function parseCatchClause$1142() {
        var param$1599, body$1600;
        expectKeyword$1078('catch');
        expect$1077('(');
        if (match$1079(')')) {
            throwUnexpected$1076(lookahead$1036);
        }
        param$1599 = parseExpression$1114();
        // 12.14.1
        if (strict$1024 && param$1599.type === Syntax$1017.Identifier && isRestrictedWord$1051(param$1599.name)) {
            throwErrorTolerant$1075({}, Messages$1019.StrictCatchVariable);
        }
        expect$1077(')');
        body$1600 = parseBlock$1116();
        return delegate$1033.createCatchClause(param$1599, body$1600);
    }
    function parseTryStatement$1143() {
        var block$1601, handlers$1602 = [], finalizer$1603 = null;
        expectKeyword$1078('try');
        block$1601 = parseBlock$1116();
        if (matchKeyword$1080('catch')) {
            handlers$1602.push(parseCatchClause$1142());
        }
        if (matchKeyword$1080('finally')) {
            lex$1070();
            finalizer$1603 = parseBlock$1116();
        }
        if (handlers$1602.length === 0 && !finalizer$1603) {
            throwError$1074({}, Messages$1019.NoCatchOrFinally);
        }
        return delegate$1033.createTryStatement(block$1601, [], handlers$1602, finalizer$1603);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$1144() {
        expectKeyword$1078('debugger');
        consumeSemicolon$1083();
        return delegate$1033.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$1145() {
        var type$1604 = lookahead$1036.type, expr$1605, labeledBody$1606, key$1607;
        if (type$1604 === Token$1014.EOF) {
            throwUnexpected$1076(lookahead$1036);
        }
        if (type$1604 === Token$1014.Punctuator) {
            switch (lookahead$1036.value) {
            case ';':
                return parseEmptyStatement$1128();
            case '{':
                return parseBlock$1116();
            case '(':
                return parseExpressionStatement$1129();
            default:
                break;
            }
        }
        if (type$1604 === Token$1014.Keyword) {
            switch (lookahead$1036.value) {
            case 'break':
                return parseBreakStatement$1136();
            case 'continue':
                return parseContinueStatement$1135();
            case 'debugger':
                return parseDebuggerStatement$1144();
            case 'do':
                return parseDoWhileStatement$1131();
            case 'for':
                return parseForStatement$1134();
            case 'function':
                return parseFunctionDeclaration$1151();
            case 'class':
                return parseClassDeclaration$1158();
            case 'if':
                return parseIfStatement$1130();
            case 'return':
                return parseReturnStatement$1137();
            case 'switch':
                return parseSwitchStatement$1140();
            case 'throw':
                return parseThrowStatement$1141();
            case 'try':
                return parseTryStatement$1143();
            case 'var':
                return parseVariableStatement$1120();
            case 'while':
                return parseWhileStatement$1132();
            case 'with':
                return parseWithStatement$1138();
            default:
                break;
            }
        }
        expr$1605 = parseExpression$1114();
        // 12.12 Labelled Statements
        if (expr$1605.type === Syntax$1017.Identifier && match$1079(':')) {
            lex$1070();
            key$1607 = '$' + expr$1605.name;
            if (Object.prototype.hasOwnProperty.call(state$1038.labelSet, key$1607)) {
                throwError$1074({}, Messages$1019.Redeclaration, 'Label', expr$1605.name);
            }
            state$1038.labelSet[key$1607] = true;
            labeledBody$1606 = parseStatement$1145();
            delete state$1038.labelSet[key$1607];
            return delegate$1033.createLabeledStatement(expr$1605, labeledBody$1606);
        }
        consumeSemicolon$1083();
        return delegate$1033.createExpressionStatement(expr$1605);
    }
    // 13 Function Definition
    function parseConciseBody$1146() {
        if (match$1079('{')) {
            return parseFunctionSourceElements$1147();
        }
        return parseAssignmentExpression$1113();
    }
    function parseFunctionSourceElements$1147() {
        var sourceElement$1608, sourceElements$1609 = [], token$1610, directive$1611, firstRestricted$1612, oldLabelSet$1613, oldInIteration$1614, oldInSwitch$1615, oldInFunctionBody$1616, oldParenthesizedCount$1617;
        expect$1077('{');
        while (streamIndex$1035 < length$1032) {
            if (lookahead$1036.type !== Token$1014.StringLiteral) {
                break;
            }
            token$1610 = lookahead$1036;
            sourceElement$1608 = parseSourceElement$1160();
            sourceElements$1609.push(sourceElement$1608);
            if (sourceElement$1608.expression.type !== Syntax$1017.Literal) {
                // this is not directive
                break;
            }
            directive$1611 = token$1610.value;
            if (directive$1611 === 'use strict') {
                strict$1024 = true;
                if (firstRestricted$1612) {
                    throwErrorTolerant$1075(firstRestricted$1612, Messages$1019.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1612 && token$1610.octal) {
                    firstRestricted$1612 = token$1610;
                }
            }
        }
        oldLabelSet$1613 = state$1038.labelSet;
        oldInIteration$1614 = state$1038.inIteration;
        oldInSwitch$1615 = state$1038.inSwitch;
        oldInFunctionBody$1616 = state$1038.inFunctionBody;
        oldParenthesizedCount$1617 = state$1038.parenthesizedCount;
        state$1038.labelSet = {};
        state$1038.inIteration = false;
        state$1038.inSwitch = false;
        state$1038.inFunctionBody = true;
        state$1038.parenthesizedCount = 0;
        while (streamIndex$1035 < length$1032) {
            if (match$1079('}')) {
                break;
            }
            sourceElement$1608 = parseSourceElement$1160();
            if (typeof sourceElement$1608 === 'undefined') {
                break;
            }
            sourceElements$1609.push(sourceElement$1608);
        }
        expect$1077('}');
        state$1038.labelSet = oldLabelSet$1613;
        state$1038.inIteration = oldInIteration$1614;
        state$1038.inSwitch = oldInSwitch$1615;
        state$1038.inFunctionBody = oldInFunctionBody$1616;
        state$1038.parenthesizedCount = oldParenthesizedCount$1617;
        return delegate$1033.createBlockStatement(sourceElements$1609);
    }
    function validateParam$1148(options$1618, param$1619, name$1620) {
        var key$1621 = '$' + name$1620;
        if (strict$1024) {
            if (isRestrictedWord$1051(name$1620)) {
                options$1618.stricted = param$1619;
                options$1618.message = Messages$1019.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1618.paramSet, key$1621)) {
                options$1618.stricted = param$1619;
                options$1618.message = Messages$1019.StrictParamDupe;
            }
        } else if (!options$1618.firstRestricted) {
            if (isRestrictedWord$1051(name$1620)) {
                options$1618.firstRestricted = param$1619;
                options$1618.message = Messages$1019.StrictParamName;
            } else if (isStrictModeReservedWord$1050(name$1620)) {
                options$1618.firstRestricted = param$1619;
                options$1618.message = Messages$1019.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1618.paramSet, key$1621)) {
                options$1618.firstRestricted = param$1619;
                options$1618.message = Messages$1019.StrictParamDupe;
            }
        }
        options$1618.paramSet[key$1621] = true;
    }
    function parseParam$1149(options$1622) {
        var token$1623, rest$1624, param$1625, def$1626;
        token$1623 = lookahead$1036;
        if (token$1623.value === '...') {
            token$1623 = lex$1070();
            rest$1624 = true;
        }
        if (match$1079('[')) {
            param$1625 = parseArrayInitialiser$1086();
            reinterpretAsDestructuredParameter$1110(options$1622, param$1625);
        } else if (match$1079('{')) {
            if (rest$1624) {
                throwError$1074({}, Messages$1019.ObjectPatternAsRestParameter);
            }
            param$1625 = parseObjectInitialiser$1091();
            reinterpretAsDestructuredParameter$1110(options$1622, param$1625);
        } else {
            param$1625 = parseVariableIdentifier$1117();
            validateParam$1148(options$1622, token$1623, token$1623.value);
            if (match$1079('=')) {
                if (rest$1624) {
                    throwErrorTolerant$1075(lookahead$1036, Messages$1019.DefaultRestParameter);
                }
                lex$1070();
                def$1626 = parseAssignmentExpression$1113();
                ++options$1622.defaultCount;
            }
        }
        if (rest$1624) {
            if (!match$1079(')')) {
                throwError$1074({}, Messages$1019.ParameterAfterRestParameter);
            }
            options$1622.rest = param$1625;
            return false;
        }
        options$1622.params.push(param$1625);
        options$1622.defaults.push(def$1626);
        return !match$1079(')');
    }
    function parseParams$1150(firstRestricted$1627) {
        var options$1628;
        options$1628 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1627
        };
        expect$1077('(');
        if (!match$1079(')')) {
            options$1628.paramSet = {};
            while (streamIndex$1035 < length$1032) {
                if (!parseParam$1149(options$1628)) {
                    break;
                }
                expect$1077(',');
            }
        }
        expect$1077(')');
        if (options$1628.defaultCount === 0) {
            options$1628.defaults = [];
        }
        return options$1628;
    }
    function parseFunctionDeclaration$1151() {
        var id$1629, body$1630, token$1631, tmp$1632, firstRestricted$1633, message$1634, previousStrict$1635, previousYieldAllowed$1636, generator$1637, expression$1638;
        expectKeyword$1078('function');
        generator$1637 = false;
        if (match$1079('*')) {
            lex$1070();
            generator$1637 = true;
        }
        token$1631 = lookahead$1036;
        id$1629 = parseVariableIdentifier$1117();
        if (strict$1024) {
            if (isRestrictedWord$1051(token$1631.value)) {
                throwErrorTolerant$1075(token$1631, Messages$1019.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$1051(token$1631.value)) {
                firstRestricted$1633 = token$1631;
                message$1634 = Messages$1019.StrictFunctionName;
            } else if (isStrictModeReservedWord$1050(token$1631.value)) {
                firstRestricted$1633 = token$1631;
                message$1634 = Messages$1019.StrictReservedWord;
            }
        }
        tmp$1632 = parseParams$1150(firstRestricted$1633);
        firstRestricted$1633 = tmp$1632.firstRestricted;
        if (tmp$1632.message) {
            message$1634 = tmp$1632.message;
        }
        previousStrict$1635 = strict$1024;
        previousYieldAllowed$1636 = state$1038.yieldAllowed;
        state$1038.yieldAllowed = generator$1637;
        // here we redo some work in order to set 'expression'
        expression$1638 = !match$1079('{');
        body$1630 = parseConciseBody$1146();
        if (strict$1024 && firstRestricted$1633) {
            throwError$1074(firstRestricted$1633, message$1634);
        }
        if (strict$1024 && tmp$1632.stricted) {
            throwErrorTolerant$1075(tmp$1632.stricted, message$1634);
        }
        if (state$1038.yieldAllowed && !state$1038.yieldFound) {
            throwErrorTolerant$1075({}, Messages$1019.NoYieldInGenerator);
        }
        strict$1024 = previousStrict$1635;
        state$1038.yieldAllowed = previousYieldAllowed$1636;
        return delegate$1033.createFunctionDeclaration(id$1629, tmp$1632.params, tmp$1632.defaults, body$1630, tmp$1632.rest, generator$1637, expression$1638);
    }
    function parseFunctionExpression$1152() {
        var token$1639, id$1640 = null, firstRestricted$1641, message$1642, tmp$1643, body$1644, previousStrict$1645, previousYieldAllowed$1646, generator$1647, expression$1648;
        expectKeyword$1078('function');
        generator$1647 = false;
        if (match$1079('*')) {
            lex$1070();
            generator$1647 = true;
        }
        if (!match$1079('(')) {
            token$1639 = lookahead$1036;
            id$1640 = parseVariableIdentifier$1117();
            if (strict$1024) {
                if (isRestrictedWord$1051(token$1639.value)) {
                    throwErrorTolerant$1075(token$1639, Messages$1019.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$1051(token$1639.value)) {
                    firstRestricted$1641 = token$1639;
                    message$1642 = Messages$1019.StrictFunctionName;
                } else if (isStrictModeReservedWord$1050(token$1639.value)) {
                    firstRestricted$1641 = token$1639;
                    message$1642 = Messages$1019.StrictReservedWord;
                }
            }
        }
        tmp$1643 = parseParams$1150(firstRestricted$1641);
        firstRestricted$1641 = tmp$1643.firstRestricted;
        if (tmp$1643.message) {
            message$1642 = tmp$1643.message;
        }
        previousStrict$1645 = strict$1024;
        previousYieldAllowed$1646 = state$1038.yieldAllowed;
        state$1038.yieldAllowed = generator$1647;
        // here we redo some work in order to set 'expression'
        expression$1648 = !match$1079('{');
        body$1644 = parseConciseBody$1146();
        if (strict$1024 && firstRestricted$1641) {
            throwError$1074(firstRestricted$1641, message$1642);
        }
        if (strict$1024 && tmp$1643.stricted) {
            throwErrorTolerant$1075(tmp$1643.stricted, message$1642);
        }
        if (state$1038.yieldAllowed && !state$1038.yieldFound) {
            throwErrorTolerant$1075({}, Messages$1019.NoYieldInGenerator);
        }
        strict$1024 = previousStrict$1645;
        state$1038.yieldAllowed = previousYieldAllowed$1646;
        return delegate$1033.createFunctionExpression(id$1640, tmp$1643.params, tmp$1643.defaults, body$1644, tmp$1643.rest, generator$1647, expression$1648);
    }
    function parseYieldExpression$1153() {
        var delegateFlag$1649, expr$1650, previousYieldAllowed$1651;
        expectKeyword$1078('yield');
        if (!state$1038.yieldAllowed) {
            throwErrorTolerant$1075({}, Messages$1019.IllegalYield);
        }
        delegateFlag$1649 = false;
        if (match$1079('*')) {
            lex$1070();
            delegateFlag$1649 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1651 = state$1038.yieldAllowed;
        state$1038.yieldAllowed = false;
        expr$1650 = parseAssignmentExpression$1113();
        state$1038.yieldAllowed = previousYieldAllowed$1651;
        state$1038.yieldFound = true;
        return delegate$1033.createYieldExpression(expr$1650, delegateFlag$1649);
    }
    // 14 Classes
    function parseMethodDefinition$1154(existingPropNames$1652) {
        var token$1653, key$1654, param$1655, propType$1656, isValidDuplicateProp$1657 = false;
        if (lookahead$1036.value === 'static') {
            propType$1656 = ClassPropertyType$1022.static;
            lex$1070();
        } else {
            propType$1656 = ClassPropertyType$1022.prototype;
        }
        if (match$1079('*')) {
            lex$1070();
            return delegate$1033.createMethodDefinition(propType$1656, '', parseObjectPropertyKey$1089(), parsePropertyMethodFunction$1088({ generator: true }));
        }
        token$1653 = lookahead$1036;
        key$1654 = parseObjectPropertyKey$1089();
        if (token$1653.value === 'get' && !match$1079('(')) {
            key$1654 = parseObjectPropertyKey$1089();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1652[propType$1656].hasOwnProperty(key$1654.name)) {
                isValidDuplicateProp$1657 = existingPropNames$1652[propType$1656][key$1654.name].get === undefined && existingPropNames$1652[propType$1656][key$1654.name].data === undefined && existingPropNames$1652[propType$1656][key$1654.name].set !== undefined;
                if (!isValidDuplicateProp$1657) {
                    throwError$1074(key$1654, Messages$1019.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1652[propType$1656][key$1654.name] = {};
            }
            existingPropNames$1652[propType$1656][key$1654.name].get = true;
            expect$1077('(');
            expect$1077(')');
            return delegate$1033.createMethodDefinition(propType$1656, 'get', key$1654, parsePropertyFunction$1087({ generator: false }));
        }
        if (token$1653.value === 'set' && !match$1079('(')) {
            key$1654 = parseObjectPropertyKey$1089();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1652[propType$1656].hasOwnProperty(key$1654.name)) {
                isValidDuplicateProp$1657 = existingPropNames$1652[propType$1656][key$1654.name].set === undefined && existingPropNames$1652[propType$1656][key$1654.name].data === undefined && existingPropNames$1652[propType$1656][key$1654.name].get !== undefined;
                if (!isValidDuplicateProp$1657) {
                    throwError$1074(key$1654, Messages$1019.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1652[propType$1656][key$1654.name] = {};
            }
            existingPropNames$1652[propType$1656][key$1654.name].set = true;
            expect$1077('(');
            token$1653 = lookahead$1036;
            param$1655 = [parseVariableIdentifier$1117()];
            expect$1077(')');
            return delegate$1033.createMethodDefinition(propType$1656, 'set', key$1654, parsePropertyFunction$1087({
                params: param$1655,
                generator: false,
                name: token$1653
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1652[propType$1656].hasOwnProperty(key$1654.name)) {
            throwError$1074(key$1654, Messages$1019.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1652[propType$1656][key$1654.name] = {};
        }
        existingPropNames$1652[propType$1656][key$1654.name].data = true;
        return delegate$1033.createMethodDefinition(propType$1656, '', key$1654, parsePropertyMethodFunction$1088({ generator: false }));
    }
    function parseClassElement$1155(existingProps$1658) {
        if (match$1079(';')) {
            lex$1070();
            return;
        }
        return parseMethodDefinition$1154(existingProps$1658);
    }
    function parseClassBody$1156() {
        var classElement$1659, classElements$1660 = [], existingProps$1661 = {};
        existingProps$1661[ClassPropertyType$1022.static] = {};
        existingProps$1661[ClassPropertyType$1022.prototype] = {};
        expect$1077('{');
        while (streamIndex$1035 < length$1032) {
            if (match$1079('}')) {
                break;
            }
            classElement$1659 = parseClassElement$1155(existingProps$1661);
            if (typeof classElement$1659 !== 'undefined') {
                classElements$1660.push(classElement$1659);
            }
        }
        expect$1077('}');
        return delegate$1033.createClassBody(classElements$1660);
    }
    function parseClassExpression$1157() {
        var id$1662, previousYieldAllowed$1663, superClass$1664 = null;
        expectKeyword$1078('class');
        if (!matchKeyword$1080('extends') && !match$1079('{')) {
            id$1662 = parseVariableIdentifier$1117();
        }
        if (matchKeyword$1080('extends')) {
            expectKeyword$1078('extends');
            previousYieldAllowed$1663 = state$1038.yieldAllowed;
            state$1038.yieldAllowed = false;
            superClass$1664 = parseAssignmentExpression$1113();
            state$1038.yieldAllowed = previousYieldAllowed$1663;
        }
        return delegate$1033.createClassExpression(id$1662, superClass$1664, parseClassBody$1156());
    }
    function parseClassDeclaration$1158() {
        var id$1665, previousYieldAllowed$1666, superClass$1667 = null;
        expectKeyword$1078('class');
        id$1665 = parseVariableIdentifier$1117();
        if (matchKeyword$1080('extends')) {
            expectKeyword$1078('extends');
            previousYieldAllowed$1666 = state$1038.yieldAllowed;
            state$1038.yieldAllowed = false;
            superClass$1667 = parseAssignmentExpression$1113();
            state$1038.yieldAllowed = previousYieldAllowed$1666;
        }
        return delegate$1033.createClassDeclaration(id$1665, superClass$1667, parseClassBody$1156());
    }
    // 15 Program
    function matchModuleDeclaration$1159() {
        var id$1668;
        if (matchContextualKeyword$1081('module')) {
            id$1668 = lookahead2$1072();
            return id$1668.type === Token$1014.StringLiteral || id$1668.type === Token$1014.Identifier;
        }
        return false;
    }
    function parseSourceElement$1160() {
        if (lookahead$1036.type === Token$1014.Keyword) {
            switch (lookahead$1036.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$1121(lookahead$1036.value);
            case 'function':
                return parseFunctionDeclaration$1151();
            case 'export':
                return parseExportDeclaration$1125();
            case 'import':
                return parseImportDeclaration$1126();
            default:
                return parseStatement$1145();
            }
        }
        if (matchModuleDeclaration$1159()) {
            throwError$1074({}, Messages$1019.NestedModule);
        }
        if (lookahead$1036.type !== Token$1014.EOF) {
            return parseStatement$1145();
        }
    }
    function parseProgramElement$1161() {
        if (lookahead$1036.type === Token$1014.Keyword) {
            switch (lookahead$1036.value) {
            case 'export':
                return parseExportDeclaration$1125();
            case 'import':
                return parseImportDeclaration$1126();
            }
        }
        if (matchModuleDeclaration$1159()) {
            return parseModuleDeclaration$1122();
        }
        return parseSourceElement$1160();
    }
    function parseProgramElements$1162() {
        var sourceElement$1669, sourceElements$1670 = [], token$1671, directive$1672, firstRestricted$1673;
        while (streamIndex$1035 < length$1032) {
            token$1671 = lookahead$1036;
            if (token$1671.type !== Token$1014.StringLiteral) {
                break;
            }
            sourceElement$1669 = parseProgramElement$1161();
            sourceElements$1670.push(sourceElement$1669);
            if (sourceElement$1669.expression.type !== Syntax$1017.Literal) {
                // this is not directive
                break;
            }
            directive$1672 = token$1671.value;
            if (directive$1672 === 'use strict') {
                strict$1024 = true;
                if (firstRestricted$1673) {
                    throwErrorTolerant$1075(firstRestricted$1673, Messages$1019.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1673 && token$1671.octal) {
                    firstRestricted$1673 = token$1671;
                }
            }
        }
        while (streamIndex$1035 < length$1032) {
            sourceElement$1669 = parseProgramElement$1161();
            if (typeof sourceElement$1669 === 'undefined') {
                break;
            }
            sourceElements$1670.push(sourceElement$1669);
        }
        return sourceElements$1670;
    }
    function parseModuleElement$1163() {
        return parseSourceElement$1160();
    }
    function parseModuleElements$1164() {
        var list$1674 = [], statement$1675;
        while (streamIndex$1035 < length$1032) {
            if (match$1079('}')) {
                break;
            }
            statement$1675 = parseModuleElement$1163();
            if (typeof statement$1675 === 'undefined') {
                break;
            }
            list$1674.push(statement$1675);
        }
        return list$1674;
    }
    function parseModuleBlock$1165() {
        var block$1676;
        expect$1077('{');
        block$1676 = parseModuleElements$1164();
        expect$1077('}');
        return delegate$1033.createBlockStatement(block$1676);
    }
    function parseProgram$1166() {
        var body$1677;
        strict$1024 = false;
        peek$1071();
        body$1677 = parseProgramElements$1162();
        return delegate$1033.createProgram(body$1677);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1167(type$1678, value$1679, start$1680, end$1681, loc$1682) {
        assert$1040(typeof start$1680 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$1039.comments.length > 0) {
            if (extra$1039.comments[extra$1039.comments.length - 1].range[1] > start$1680) {
                return;
            }
        }
        extra$1039.comments.push({
            type: type$1678,
            value: value$1679,
            range: [
                start$1680,
                end$1681
            ],
            loc: loc$1682
        });
    }
    function scanComment$1168() {
        var comment$1683, ch$1684, loc$1685, start$1686, blockComment$1687, lineComment$1688;
        comment$1683 = '';
        blockComment$1687 = false;
        lineComment$1688 = false;
        while (index$1025 < length$1032) {
            ch$1684 = source$1023[index$1025];
            if (lineComment$1688) {
                ch$1684 = source$1023[index$1025++];
                if (isLineTerminator$1046(ch$1684.charCodeAt(0))) {
                    loc$1685.end = {
                        line: lineNumber$1026,
                        column: index$1025 - lineStart$1027 - 1
                    };
                    lineComment$1688 = false;
                    addComment$1167('Line', comment$1683, start$1686, index$1025 - 1, loc$1685);
                    if (ch$1684 === '\r' && source$1023[index$1025] === '\n') {
                        ++index$1025;
                    }
                    ++lineNumber$1026;
                    lineStart$1027 = index$1025;
                    comment$1683 = '';
                } else if (index$1025 >= length$1032) {
                    lineComment$1688 = false;
                    comment$1683 += ch$1684;
                    loc$1685.end = {
                        line: lineNumber$1026,
                        column: length$1032 - lineStart$1027
                    };
                    addComment$1167('Line', comment$1683, start$1686, length$1032, loc$1685);
                } else {
                    comment$1683 += ch$1684;
                }
            } else if (blockComment$1687) {
                if (isLineTerminator$1046(ch$1684.charCodeAt(0))) {
                    if (ch$1684 === '\r' && source$1023[index$1025 + 1] === '\n') {
                        ++index$1025;
                        comment$1683 += '\r\n';
                    } else {
                        comment$1683 += ch$1684;
                    }
                    ++lineNumber$1026;
                    ++index$1025;
                    lineStart$1027 = index$1025;
                    if (index$1025 >= length$1032) {
                        throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1684 = source$1023[index$1025++];
                    if (index$1025 >= length$1032) {
                        throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1683 += ch$1684;
                    if (ch$1684 === '*') {
                        ch$1684 = source$1023[index$1025];
                        if (ch$1684 === '/') {
                            comment$1683 = comment$1683.substr(0, comment$1683.length - 1);
                            blockComment$1687 = false;
                            ++index$1025;
                            loc$1685.end = {
                                line: lineNumber$1026,
                                column: index$1025 - lineStart$1027
                            };
                            addComment$1167('Block', comment$1683, start$1686, index$1025, loc$1685);
                            comment$1683 = '';
                        }
                    }
                }
            } else if (ch$1684 === '/') {
                ch$1684 = source$1023[index$1025 + 1];
                if (ch$1684 === '/') {
                    loc$1685 = {
                        start: {
                            line: lineNumber$1026,
                            column: index$1025 - lineStart$1027
                        }
                    };
                    start$1686 = index$1025;
                    index$1025 += 2;
                    lineComment$1688 = true;
                    if (index$1025 >= length$1032) {
                        loc$1685.end = {
                            line: lineNumber$1026,
                            column: index$1025 - lineStart$1027
                        };
                        lineComment$1688 = false;
                        addComment$1167('Line', comment$1683, start$1686, index$1025, loc$1685);
                    }
                } else if (ch$1684 === '*') {
                    start$1686 = index$1025;
                    index$1025 += 2;
                    blockComment$1687 = true;
                    loc$1685 = {
                        start: {
                            line: lineNumber$1026,
                            column: index$1025 - lineStart$1027 - 2
                        }
                    };
                    if (index$1025 >= length$1032) {
                        throwError$1074({}, Messages$1019.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1045(ch$1684.charCodeAt(0))) {
                ++index$1025;
            } else if (isLineTerminator$1046(ch$1684.charCodeAt(0))) {
                ++index$1025;
                if (ch$1684 === '\r' && source$1023[index$1025] === '\n') {
                    ++index$1025;
                }
                ++lineNumber$1026;
                lineStart$1027 = index$1025;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1169() {
        var i$1689, entry$1690, comment$1691, comments$1692 = [];
        for (i$1689 = 0; i$1689 < extra$1039.comments.length; ++i$1689) {
            entry$1690 = extra$1039.comments[i$1689];
            comment$1691 = {
                type: entry$1690.type,
                value: entry$1690.value
            };
            if (extra$1039.range) {
                comment$1691.range = entry$1690.range;
            }
            if (extra$1039.loc) {
                comment$1691.loc = entry$1690.loc;
            }
            comments$1692.push(comment$1691);
        }
        extra$1039.comments = comments$1692;
    }
    function collectToken$1170() {
        var start$1693, loc$1694, token$1695, range$1696, value$1697;
        skipComment$1053();
        start$1693 = index$1025;
        loc$1694 = {
            start: {
                line: lineNumber$1026,
                column: index$1025 - lineStart$1027
            }
        };
        token$1695 = extra$1039.advance();
        loc$1694.end = {
            line: lineNumber$1026,
            column: index$1025 - lineStart$1027
        };
        if (token$1695.type !== Token$1014.EOF) {
            range$1696 = [
                token$1695.range[0],
                token$1695.range[1]
            ];
            value$1697 = source$1023.slice(token$1695.range[0], token$1695.range[1]);
            extra$1039.tokens.push({
                type: TokenName$1015[token$1695.type],
                value: value$1697,
                range: range$1696,
                loc: loc$1694
            });
        }
        return token$1695;
    }
    function collectRegex$1171() {
        var pos$1698, loc$1699, regex$1700, token$1701;
        skipComment$1053();
        pos$1698 = index$1025;
        loc$1699 = {
            start: {
                line: lineNumber$1026,
                column: index$1025 - lineStart$1027
            }
        };
        regex$1700 = extra$1039.scanRegExp();
        loc$1699.end = {
            line: lineNumber$1026,
            column: index$1025 - lineStart$1027
        };
        if (!extra$1039.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$1039.tokens.length > 0) {
                token$1701 = extra$1039.tokens[extra$1039.tokens.length - 1];
                if (token$1701.range[0] === pos$1698 && token$1701.type === 'Punctuator') {
                    if (token$1701.value === '/' || token$1701.value === '/=') {
                        extra$1039.tokens.pop();
                    }
                }
            }
            extra$1039.tokens.push({
                type: 'RegularExpression',
                value: regex$1700.literal,
                range: [
                    pos$1698,
                    index$1025
                ],
                loc: loc$1699
            });
        }
        return regex$1700;
    }
    function filterTokenLocation$1172() {
        var i$1702, entry$1703, token$1704, tokens$1705 = [];
        for (i$1702 = 0; i$1702 < extra$1039.tokens.length; ++i$1702) {
            entry$1703 = extra$1039.tokens[i$1702];
            token$1704 = {
                type: entry$1703.type,
                value: entry$1703.value
            };
            if (extra$1039.range) {
                token$1704.range = entry$1703.range;
            }
            if (extra$1039.loc) {
                token$1704.loc = entry$1703.loc;
            }
            tokens$1705.push(token$1704);
        }
        extra$1039.tokens = tokens$1705;
    }
    function LocationMarker$1173() {
        var sm_index$1706 = lookahead$1036 ? lookahead$1036.sm_range[0] : 0;
        var sm_lineStart$1707 = lookahead$1036 ? lookahead$1036.sm_lineStart : 0;
        var sm_lineNumber$1708 = lookahead$1036 ? lookahead$1036.sm_lineNumber : 1;
        this.range = [
            sm_index$1706,
            sm_index$1706
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1708,
                column: sm_index$1706 - sm_lineStart$1707
            },
            end: {
                line: sm_lineNumber$1708,
                column: sm_index$1706 - sm_lineStart$1707
            }
        };
    }
    LocationMarker$1173.prototype = {
        constructor: LocationMarker$1173,
        end: function () {
            this.range[1] = sm_index$1031;
            this.loc.end.line = sm_lineNumber$1028;
            this.loc.end.column = sm_index$1031 - sm_lineStart$1029;
        },
        applyGroup: function (node$1709) {
            if (extra$1039.range) {
                node$1709.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$1039.loc) {
                node$1709.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1709 = delegate$1033.postProcess(node$1709);
            }
        },
        apply: function (node$1710) {
            var nodeType$1711 = typeof node$1710;
            assert$1040(nodeType$1711 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1711);
            if (extra$1039.range) {
                node$1710.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$1039.loc) {
                node$1710.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1710 = delegate$1033.postProcess(node$1710);
            }
        }
    };
    function createLocationMarker$1174() {
        return new LocationMarker$1173();
    }
    function trackGroupExpression$1175() {
        var marker$1712, expr$1713;
        marker$1712 = createLocationMarker$1174();
        expect$1077('(');
        ++state$1038.parenthesizedCount;
        expr$1713 = parseExpression$1114();
        expect$1077(')');
        marker$1712.end();
        marker$1712.applyGroup(expr$1713);
        return expr$1713;
    }
    function trackLeftHandSideExpression$1176() {
        var marker$1714, expr$1715;
        // skipComment();
        marker$1714 = createLocationMarker$1174();
        expr$1715 = matchKeyword$1080('new') ? parseNewExpression$1101() : parsePrimaryExpression$1095();
        while (match$1079('.') || match$1079('[') || lookahead$1036.type === Token$1014.Template) {
            if (match$1079('[')) {
                expr$1715 = delegate$1033.createMemberExpression('[', expr$1715, parseComputedMember$1100());
                marker$1714.end();
                marker$1714.apply(expr$1715);
            } else if (match$1079('.')) {
                expr$1715 = delegate$1033.createMemberExpression('.', expr$1715, parseNonComputedMember$1099());
                marker$1714.end();
                marker$1714.apply(expr$1715);
            } else {
                expr$1715 = delegate$1033.createTaggedTemplateExpression(expr$1715, parseTemplateLiteral$1093());
                marker$1714.end();
                marker$1714.apply(expr$1715);
            }
        }
        return expr$1715;
    }
    function trackLeftHandSideExpressionAllowCall$1177() {
        var marker$1716, expr$1717, args$1718;
        // skipComment();
        marker$1716 = createLocationMarker$1174();
        expr$1717 = matchKeyword$1080('new') ? parseNewExpression$1101() : parsePrimaryExpression$1095();
        while (match$1079('.') || match$1079('[') || match$1079('(') || lookahead$1036.type === Token$1014.Template) {
            if (match$1079('(')) {
                args$1718 = parseArguments$1096();
                expr$1717 = delegate$1033.createCallExpression(expr$1717, args$1718);
                marker$1716.end();
                marker$1716.apply(expr$1717);
            } else if (match$1079('[')) {
                expr$1717 = delegate$1033.createMemberExpression('[', expr$1717, parseComputedMember$1100());
                marker$1716.end();
                marker$1716.apply(expr$1717);
            } else if (match$1079('.')) {
                expr$1717 = delegate$1033.createMemberExpression('.', expr$1717, parseNonComputedMember$1099());
                marker$1716.end();
                marker$1716.apply(expr$1717);
            } else {
                expr$1717 = delegate$1033.createTaggedTemplateExpression(expr$1717, parseTemplateLiteral$1093());
                marker$1716.end();
                marker$1716.apply(expr$1717);
            }
        }
        return expr$1717;
    }
    function filterGroup$1178(node$1719) {
        var n$1720, i$1721, entry$1722;
        n$1720 = Object.prototype.toString.apply(node$1719) === '[object Array]' ? [] : {};
        for (i$1721 in node$1719) {
            if (node$1719.hasOwnProperty(i$1721) && i$1721 !== 'groupRange' && i$1721 !== 'groupLoc') {
                entry$1722 = node$1719[i$1721];
                if (entry$1722 === null || typeof entry$1722 !== 'object' || entry$1722 instanceof RegExp) {
                    n$1720[i$1721] = entry$1722;
                } else {
                    n$1720[i$1721] = filterGroup$1178(entry$1722);
                }
            }
        }
        return n$1720;
    }
    function wrapTrackingFunction$1179(range$1723, loc$1724) {
        return function (parseFunction$1725) {
            function isBinary$1726(node$1728) {
                return node$1728.type === Syntax$1017.LogicalExpression || node$1728.type === Syntax$1017.BinaryExpression;
            }
            function visit$1727(node$1729) {
                var start$1730, end$1731;
                if (isBinary$1726(node$1729.left)) {
                    visit$1727(node$1729.left);
                }
                if (isBinary$1726(node$1729.right)) {
                    visit$1727(node$1729.right);
                }
                if (range$1723) {
                    if (node$1729.left.groupRange || node$1729.right.groupRange) {
                        start$1730 = node$1729.left.groupRange ? node$1729.left.groupRange[0] : node$1729.left.range[0];
                        end$1731 = node$1729.right.groupRange ? node$1729.right.groupRange[1] : node$1729.right.range[1];
                        node$1729.range = [
                            start$1730,
                            end$1731
                        ];
                    } else if (typeof node$1729.range === 'undefined') {
                        start$1730 = node$1729.left.range[0];
                        end$1731 = node$1729.right.range[1];
                        node$1729.range = [
                            start$1730,
                            end$1731
                        ];
                    }
                }
                if (loc$1724) {
                    if (node$1729.left.groupLoc || node$1729.right.groupLoc) {
                        start$1730 = node$1729.left.groupLoc ? node$1729.left.groupLoc.start : node$1729.left.loc.start;
                        end$1731 = node$1729.right.groupLoc ? node$1729.right.groupLoc.end : node$1729.right.loc.end;
                        node$1729.loc = {
                            start: start$1730,
                            end: end$1731
                        };
                        node$1729 = delegate$1033.postProcess(node$1729);
                    } else if (typeof node$1729.loc === 'undefined') {
                        node$1729.loc = {
                            start: node$1729.left.loc.start,
                            end: node$1729.right.loc.end
                        };
                        node$1729 = delegate$1033.postProcess(node$1729);
                    }
                }
            }
            return function () {
                var marker$1732, node$1733, curr$1734 = lookahead$1036;
                marker$1732 = createLocationMarker$1174();
                node$1733 = parseFunction$1725.apply(null, arguments);
                marker$1732.end();
                if (node$1733.type !== Syntax$1017.Program) {
                    if (curr$1734.leadingComments) {
                        node$1733.leadingComments = curr$1734.leadingComments;
                    }
                    if (curr$1734.trailingComments) {
                        node$1733.trailingComments = curr$1734.trailingComments;
                    }
                }
                if (range$1723 && typeof node$1733.range === 'undefined') {
                    marker$1732.apply(node$1733);
                }
                if (loc$1724 && typeof node$1733.loc === 'undefined') {
                    marker$1732.apply(node$1733);
                }
                if (isBinary$1726(node$1733)) {
                    visit$1727(node$1733);
                }
                return node$1733;
            };
        };
    }
    function patch$1180() {
        var wrapTracking$1735;
        if (extra$1039.comments) {
            extra$1039.skipComment = skipComment$1053;
            skipComment$1053 = scanComment$1168;
        }
        if (extra$1039.range || extra$1039.loc) {
            extra$1039.parseGroupExpression = parseGroupExpression$1094;
            extra$1039.parseLeftHandSideExpression = parseLeftHandSideExpression$1103;
            extra$1039.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$1102;
            parseGroupExpression$1094 = trackGroupExpression$1175;
            parseLeftHandSideExpression$1103 = trackLeftHandSideExpression$1176;
            parseLeftHandSideExpressionAllowCall$1102 = trackLeftHandSideExpressionAllowCall$1177;
            wrapTracking$1735 = wrapTrackingFunction$1179(extra$1039.range, extra$1039.loc);
            extra$1039.parseArrayInitialiser = parseArrayInitialiser$1086;
            extra$1039.parseAssignmentExpression = parseAssignmentExpression$1113;
            extra$1039.parseBinaryExpression = parseBinaryExpression$1107;
            extra$1039.parseBlock = parseBlock$1116;
            extra$1039.parseFunctionSourceElements = parseFunctionSourceElements$1147;
            extra$1039.parseCatchClause = parseCatchClause$1142;
            extra$1039.parseComputedMember = parseComputedMember$1100;
            extra$1039.parseConditionalExpression = parseConditionalExpression$1108;
            extra$1039.parseConstLetDeclaration = parseConstLetDeclaration$1121;
            extra$1039.parseExportBatchSpecifier = parseExportBatchSpecifier$1123;
            extra$1039.parseExportDeclaration = parseExportDeclaration$1125;
            extra$1039.parseExportSpecifier = parseExportSpecifier$1124;
            extra$1039.parseExpression = parseExpression$1114;
            extra$1039.parseForVariableDeclaration = parseForVariableDeclaration$1133;
            extra$1039.parseFunctionDeclaration = parseFunctionDeclaration$1151;
            extra$1039.parseFunctionExpression = parseFunctionExpression$1152;
            extra$1039.parseParams = parseParams$1150;
            extra$1039.parseImportDeclaration = parseImportDeclaration$1126;
            extra$1039.parseImportSpecifier = parseImportSpecifier$1127;
            extra$1039.parseModuleDeclaration = parseModuleDeclaration$1122;
            extra$1039.parseModuleBlock = parseModuleBlock$1165;
            extra$1039.parseNewExpression = parseNewExpression$1101;
            extra$1039.parseNonComputedProperty = parseNonComputedProperty$1098;
            extra$1039.parseObjectInitialiser = parseObjectInitialiser$1091;
            extra$1039.parseObjectProperty = parseObjectProperty$1090;
            extra$1039.parseObjectPropertyKey = parseObjectPropertyKey$1089;
            extra$1039.parsePostfixExpression = parsePostfixExpression$1104;
            extra$1039.parsePrimaryExpression = parsePrimaryExpression$1095;
            extra$1039.parseProgram = parseProgram$1166;
            extra$1039.parsePropertyFunction = parsePropertyFunction$1087;
            extra$1039.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$1097;
            extra$1039.parseTemplateElement = parseTemplateElement$1092;
            extra$1039.parseTemplateLiteral = parseTemplateLiteral$1093;
            extra$1039.parseStatement = parseStatement$1145;
            extra$1039.parseSwitchCase = parseSwitchCase$1139;
            extra$1039.parseUnaryExpression = parseUnaryExpression$1105;
            extra$1039.parseVariableDeclaration = parseVariableDeclaration$1118;
            extra$1039.parseVariableIdentifier = parseVariableIdentifier$1117;
            extra$1039.parseMethodDefinition = parseMethodDefinition$1154;
            extra$1039.parseClassDeclaration = parseClassDeclaration$1158;
            extra$1039.parseClassExpression = parseClassExpression$1157;
            extra$1039.parseClassBody = parseClassBody$1156;
            parseArrayInitialiser$1086 = wrapTracking$1735(extra$1039.parseArrayInitialiser);
            parseAssignmentExpression$1113 = wrapTracking$1735(extra$1039.parseAssignmentExpression);
            parseBinaryExpression$1107 = wrapTracking$1735(extra$1039.parseBinaryExpression);
            parseBlock$1116 = wrapTracking$1735(extra$1039.parseBlock);
            parseFunctionSourceElements$1147 = wrapTracking$1735(extra$1039.parseFunctionSourceElements);
            parseCatchClause$1142 = wrapTracking$1735(extra$1039.parseCatchClause);
            parseComputedMember$1100 = wrapTracking$1735(extra$1039.parseComputedMember);
            parseConditionalExpression$1108 = wrapTracking$1735(extra$1039.parseConditionalExpression);
            parseConstLetDeclaration$1121 = wrapTracking$1735(extra$1039.parseConstLetDeclaration);
            parseExportBatchSpecifier$1123 = wrapTracking$1735(parseExportBatchSpecifier$1123);
            parseExportDeclaration$1125 = wrapTracking$1735(parseExportDeclaration$1125);
            parseExportSpecifier$1124 = wrapTracking$1735(parseExportSpecifier$1124);
            parseExpression$1114 = wrapTracking$1735(extra$1039.parseExpression);
            parseForVariableDeclaration$1133 = wrapTracking$1735(extra$1039.parseForVariableDeclaration);
            parseFunctionDeclaration$1151 = wrapTracking$1735(extra$1039.parseFunctionDeclaration);
            parseFunctionExpression$1152 = wrapTracking$1735(extra$1039.parseFunctionExpression);
            parseParams$1150 = wrapTracking$1735(extra$1039.parseParams);
            parseImportDeclaration$1126 = wrapTracking$1735(extra$1039.parseImportDeclaration);
            parseImportSpecifier$1127 = wrapTracking$1735(extra$1039.parseImportSpecifier);
            parseModuleDeclaration$1122 = wrapTracking$1735(extra$1039.parseModuleDeclaration);
            parseModuleBlock$1165 = wrapTracking$1735(extra$1039.parseModuleBlock);
            parseLeftHandSideExpression$1103 = wrapTracking$1735(parseLeftHandSideExpression$1103);
            parseNewExpression$1101 = wrapTracking$1735(extra$1039.parseNewExpression);
            parseNonComputedProperty$1098 = wrapTracking$1735(extra$1039.parseNonComputedProperty);
            parseObjectInitialiser$1091 = wrapTracking$1735(extra$1039.parseObjectInitialiser);
            parseObjectProperty$1090 = wrapTracking$1735(extra$1039.parseObjectProperty);
            parseObjectPropertyKey$1089 = wrapTracking$1735(extra$1039.parseObjectPropertyKey);
            parsePostfixExpression$1104 = wrapTracking$1735(extra$1039.parsePostfixExpression);
            parsePrimaryExpression$1095 = wrapTracking$1735(extra$1039.parsePrimaryExpression);
            parseProgram$1166 = wrapTracking$1735(extra$1039.parseProgram);
            parsePropertyFunction$1087 = wrapTracking$1735(extra$1039.parsePropertyFunction);
            parseTemplateElement$1092 = wrapTracking$1735(extra$1039.parseTemplateElement);
            parseTemplateLiteral$1093 = wrapTracking$1735(extra$1039.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$1097 = wrapTracking$1735(extra$1039.parseSpreadOrAssignmentExpression);
            parseStatement$1145 = wrapTracking$1735(extra$1039.parseStatement);
            parseSwitchCase$1139 = wrapTracking$1735(extra$1039.parseSwitchCase);
            parseUnaryExpression$1105 = wrapTracking$1735(extra$1039.parseUnaryExpression);
            parseVariableDeclaration$1118 = wrapTracking$1735(extra$1039.parseVariableDeclaration);
            parseVariableIdentifier$1117 = wrapTracking$1735(extra$1039.parseVariableIdentifier);
            parseMethodDefinition$1154 = wrapTracking$1735(extra$1039.parseMethodDefinition);
            parseClassDeclaration$1158 = wrapTracking$1735(extra$1039.parseClassDeclaration);
            parseClassExpression$1157 = wrapTracking$1735(extra$1039.parseClassExpression);
            parseClassBody$1156 = wrapTracking$1735(extra$1039.parseClassBody);
        }
        if (typeof extra$1039.tokens !== 'undefined') {
            extra$1039.advance = advance$1069;
            extra$1039.scanRegExp = scanRegExp$1066;
            advance$1069 = collectToken$1170;
            scanRegExp$1066 = collectRegex$1171;
        }
    }
    function unpatch$1181() {
        if (typeof extra$1039.skipComment === 'function') {
            skipComment$1053 = extra$1039.skipComment;
        }
        if (extra$1039.range || extra$1039.loc) {
            parseArrayInitialiser$1086 = extra$1039.parseArrayInitialiser;
            parseAssignmentExpression$1113 = extra$1039.parseAssignmentExpression;
            parseBinaryExpression$1107 = extra$1039.parseBinaryExpression;
            parseBlock$1116 = extra$1039.parseBlock;
            parseFunctionSourceElements$1147 = extra$1039.parseFunctionSourceElements;
            parseCatchClause$1142 = extra$1039.parseCatchClause;
            parseComputedMember$1100 = extra$1039.parseComputedMember;
            parseConditionalExpression$1108 = extra$1039.parseConditionalExpression;
            parseConstLetDeclaration$1121 = extra$1039.parseConstLetDeclaration;
            parseExportBatchSpecifier$1123 = extra$1039.parseExportBatchSpecifier;
            parseExportDeclaration$1125 = extra$1039.parseExportDeclaration;
            parseExportSpecifier$1124 = extra$1039.parseExportSpecifier;
            parseExpression$1114 = extra$1039.parseExpression;
            parseForVariableDeclaration$1133 = extra$1039.parseForVariableDeclaration;
            parseFunctionDeclaration$1151 = extra$1039.parseFunctionDeclaration;
            parseFunctionExpression$1152 = extra$1039.parseFunctionExpression;
            parseImportDeclaration$1126 = extra$1039.parseImportDeclaration;
            parseImportSpecifier$1127 = extra$1039.parseImportSpecifier;
            parseGroupExpression$1094 = extra$1039.parseGroupExpression;
            parseLeftHandSideExpression$1103 = extra$1039.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$1102 = extra$1039.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$1122 = extra$1039.parseModuleDeclaration;
            parseModuleBlock$1165 = extra$1039.parseModuleBlock;
            parseNewExpression$1101 = extra$1039.parseNewExpression;
            parseNonComputedProperty$1098 = extra$1039.parseNonComputedProperty;
            parseObjectInitialiser$1091 = extra$1039.parseObjectInitialiser;
            parseObjectProperty$1090 = extra$1039.parseObjectProperty;
            parseObjectPropertyKey$1089 = extra$1039.parseObjectPropertyKey;
            parsePostfixExpression$1104 = extra$1039.parsePostfixExpression;
            parsePrimaryExpression$1095 = extra$1039.parsePrimaryExpression;
            parseProgram$1166 = extra$1039.parseProgram;
            parsePropertyFunction$1087 = extra$1039.parsePropertyFunction;
            parseTemplateElement$1092 = extra$1039.parseTemplateElement;
            parseTemplateLiteral$1093 = extra$1039.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$1097 = extra$1039.parseSpreadOrAssignmentExpression;
            parseStatement$1145 = extra$1039.parseStatement;
            parseSwitchCase$1139 = extra$1039.parseSwitchCase;
            parseUnaryExpression$1105 = extra$1039.parseUnaryExpression;
            parseVariableDeclaration$1118 = extra$1039.parseVariableDeclaration;
            parseVariableIdentifier$1117 = extra$1039.parseVariableIdentifier;
            parseMethodDefinition$1154 = extra$1039.parseMethodDefinition;
            parseClassDeclaration$1158 = extra$1039.parseClassDeclaration;
            parseClassExpression$1157 = extra$1039.parseClassExpression;
            parseClassBody$1156 = extra$1039.parseClassBody;
        }
        if (typeof extra$1039.scanRegExp === 'function') {
            advance$1069 = extra$1039.advance;
            scanRegExp$1066 = extra$1039.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1182(object$1736, properties$1737) {
        var entry$1738, result$1739 = {};
        for (entry$1738 in object$1736) {
            if (object$1736.hasOwnProperty(entry$1738)) {
                result$1739[entry$1738] = object$1736[entry$1738];
            }
        }
        for (entry$1738 in properties$1737) {
            if (properties$1737.hasOwnProperty(entry$1738)) {
                result$1739[entry$1738] = properties$1737[entry$1738];
            }
        }
        return result$1739;
    }
    function tokenize$1183(code$1740, options$1741) {
        var toString$1742, token$1743, tokens$1744;
        toString$1742 = String;
        if (typeof code$1740 !== 'string' && !(code$1740 instanceof String)) {
            code$1740 = toString$1742(code$1740);
        }
        delegate$1033 = SyntaxTreeDelegate$1021;
        source$1023 = code$1740;
        index$1025 = 0;
        lineNumber$1026 = source$1023.length > 0 ? 1 : 0;
        lineStart$1027 = 0;
        length$1032 = source$1023.length;
        lookahead$1036 = null;
        state$1038 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$1039 = {};
        // Options matching.
        options$1741 = options$1741 || {};
        // Of course we collect tokens here.
        options$1741.tokens = true;
        extra$1039.tokens = [];
        extra$1039.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$1039.openParenToken = -1;
        extra$1039.openCurlyToken = -1;
        extra$1039.range = typeof options$1741.range === 'boolean' && options$1741.range;
        extra$1039.loc = typeof options$1741.loc === 'boolean' && options$1741.loc;
        if (typeof options$1741.comment === 'boolean' && options$1741.comment) {
            extra$1039.comments = [];
        }
        if (typeof options$1741.tolerant === 'boolean' && options$1741.tolerant) {
            extra$1039.errors = [];
        }
        if (length$1032 > 0) {
            if (typeof source$1023[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1740 instanceof String) {
                    source$1023 = code$1740.valueOf();
                }
            }
        }
        patch$1180();
        try {
            peek$1071();
            if (lookahead$1036.type === Token$1014.EOF) {
                return extra$1039.tokens;
            }
            token$1743 = lex$1070();
            while (lookahead$1036.type !== Token$1014.EOF) {
                try {
                    token$1743 = lex$1070();
                } catch (lexError$1745) {
                    token$1743 = lookahead$1036;
                    if (extra$1039.errors) {
                        extra$1039.errors.push(lexError$1745);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1745;
                    }
                }
            }
            filterTokenLocation$1172();
            tokens$1744 = extra$1039.tokens;
            if (typeof extra$1039.comments !== 'undefined') {
                filterCommentLocation$1169();
                tokens$1744.comments = extra$1039.comments;
            }
            if (typeof extra$1039.errors !== 'undefined') {
                tokens$1744.errors = extra$1039.errors;
            }
        } catch (e$1746) {
            throw e$1746;
        } finally {
            unpatch$1181();
            extra$1039 = {};
        }
        return tokens$1744;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1184(toks$1747, start$1748, inExprDelim$1749, parentIsBlock$1750) {
        var assignOps$1751 = [
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
        var binaryOps$1752 = [
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
        var unaryOps$1753 = [
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
        function back$1754(n$1755) {
            var idx$1756 = toks$1747.length - n$1755 > 0 ? toks$1747.length - n$1755 : 0;
            return toks$1747[idx$1756];
        }
        if (inExprDelim$1749 && toks$1747.length - (start$1748 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1754(start$1748 + 2).value === ':' && parentIsBlock$1750) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$1041(back$1754(start$1748 + 2).value, unaryOps$1753.concat(binaryOps$1752).concat(assignOps$1751))) {
            // ... + {...}
            return false;
        } else if (back$1754(start$1748 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1757 = typeof back$1754(start$1748 + 1).startLineNumber !== 'undefined' ? back$1754(start$1748 + 1).startLineNumber : back$1754(start$1748 + 1).lineNumber;
            if (back$1754(start$1748 + 2).lineNumber !== currLineNumber$1757) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$1041(back$1754(start$1748 + 2).value, [
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
    function readToken$1185(toks$1758, inExprDelim$1759, parentIsBlock$1760) {
        var delimiters$1761 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1762 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1763 = toks$1758.length - 1;
        var comments$1764, commentsLen$1765 = extra$1039.comments.length;
        function back$1766(n$1770) {
            var idx$1771 = toks$1758.length - n$1770 > 0 ? toks$1758.length - n$1770 : 0;
            return toks$1758[idx$1771];
        }
        function attachComments$1767(token$1772) {
            if (comments$1764) {
                token$1772.leadingComments = comments$1764;
            }
            return token$1772;
        }
        function _advance$1768() {
            return attachComments$1767(advance$1069());
        }
        function _scanRegExp$1769() {
            return attachComments$1767(scanRegExp$1066());
        }
        skipComment$1053();
        if (extra$1039.comments.length > commentsLen$1765) {
            comments$1764 = extra$1039.comments.slice(commentsLen$1765);
        }
        if (isIn$1041(source$1023[index$1025], delimiters$1761)) {
            return attachComments$1767(readDelim$1186(toks$1758, inExprDelim$1759, parentIsBlock$1760));
        }
        if (source$1023[index$1025] === '/') {
            var prev$1773 = back$1766(1);
            if (prev$1773) {
                if (prev$1773.value === '()') {
                    if (isIn$1041(back$1766(2).value, parenIdents$1762)) {
                        // ... if (...) / ...
                        return _scanRegExp$1769();
                    }
                    // ... (...) / ...
                    return _advance$1768();
                }
                if (prev$1773.value === '{}') {
                    if (blockAllowed$1184(toks$1758, 0, inExprDelim$1759, parentIsBlock$1760)) {
                        if (back$1766(2).value === '()') {
                            // named function
                            if (back$1766(4).value === 'function') {
                                if (!blockAllowed$1184(toks$1758, 3, inExprDelim$1759, parentIsBlock$1760)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1768();
                                }
                                if (toks$1758.length - 5 <= 0 && inExprDelim$1759) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1768();
                                }
                            }
                            // unnamed function
                            if (back$1766(3).value === 'function') {
                                if (!blockAllowed$1184(toks$1758, 2, inExprDelim$1759, parentIsBlock$1760)) {
                                    // new function (...) {...} / ...
                                    return _advance$1768();
                                }
                                if (toks$1758.length - 4 <= 0 && inExprDelim$1759) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1768();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1769();
                    } else {
                        // ... + {...} / ...
                        return _advance$1768();
                    }
                }
                if (prev$1773.type === Token$1014.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1769();
                }
                if (isKeyword$1052(prev$1773.value)) {
                    // typeof /...
                    return _scanRegExp$1769();
                }
                return _advance$1768();
            }
            return _scanRegExp$1769();
        }
        return _advance$1768();
    }
    function readDelim$1186(toks$1774, inExprDelim$1775, parentIsBlock$1776) {
        var startDelim$1777 = advance$1069(), matchDelim$1778 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1779 = [];
        var delimiters$1780 = [
                '(',
                '{',
                '['
            ];
        assert$1040(delimiters$1780.indexOf(startDelim$1777.value) !== -1, 'Need to begin at the delimiter');
        var token$1781 = startDelim$1777;
        var startLineNumber$1782 = token$1781.lineNumber;
        var startLineStart$1783 = token$1781.lineStart;
        var startRange$1784 = token$1781.range;
        var delimToken$1785 = {};
        delimToken$1785.type = Token$1014.Delimiter;
        delimToken$1785.value = startDelim$1777.value + matchDelim$1778[startDelim$1777.value];
        delimToken$1785.startLineNumber = startLineNumber$1782;
        delimToken$1785.startLineStart = startLineStart$1783;
        delimToken$1785.startRange = startRange$1784;
        var delimIsBlock$1786 = false;
        if (startDelim$1777.value === '{') {
            delimIsBlock$1786 = blockAllowed$1184(toks$1774.concat(delimToken$1785), 0, inExprDelim$1775, parentIsBlock$1776);
        }
        while (index$1025 <= length$1032) {
            token$1781 = readToken$1185(inner$1779, startDelim$1777.value === '(' || startDelim$1777.value === '[', delimIsBlock$1786);
            if (token$1781.type === Token$1014.Punctuator && token$1781.value === matchDelim$1778[startDelim$1777.value]) {
                if (token$1781.leadingComments) {
                    delimToken$1785.trailingComments = token$1781.leadingComments;
                }
                break;
            } else if (token$1781.type === Token$1014.EOF) {
                throwError$1074({}, Messages$1019.UnexpectedEOS);
            } else {
                inner$1779.push(token$1781);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$1025 >= length$1032 && matchDelim$1778[startDelim$1777.value] !== source$1023[length$1032 - 1]) {
            throwError$1074({}, Messages$1019.UnexpectedEOS);
        }
        var endLineNumber$1787 = token$1781.lineNumber;
        var endLineStart$1788 = token$1781.lineStart;
        var endRange$1789 = token$1781.range;
        delimToken$1785.inner = inner$1779;
        delimToken$1785.endLineNumber = endLineNumber$1787;
        delimToken$1785.endLineStart = endLineStart$1788;
        delimToken$1785.endRange = endRange$1789;
        return delimToken$1785;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$1187(code$1790) {
        var token$1791, tokenTree$1792 = [];
        extra$1039 = {};
        extra$1039.comments = [];
        patch$1180();
        source$1023 = code$1790;
        index$1025 = 0;
        lineNumber$1026 = source$1023.length > 0 ? 1 : 0;
        lineStart$1027 = 0;
        length$1032 = source$1023.length;
        state$1038 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$1025 < length$1032) {
            tokenTree$1792.push(readToken$1185(tokenTree$1792, false, false));
        }
        var last$1793 = tokenTree$1792[tokenTree$1792.length - 1];
        if (last$1793 && last$1793.type !== Token$1014.EOF) {
            tokenTree$1792.push({
                type: Token$1014.EOF,
                value: '',
                lineNumber: last$1793.lineNumber,
                lineStart: last$1793.lineStart,
                range: [
                    index$1025,
                    index$1025
                ]
            });
        }
        return expander$1013.tokensToSyntax(tokenTree$1792);
    }
    function parse$1188(code$1794, options$1795) {
        var program$1796, toString$1797;
        extra$1039 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1794)) {
            tokenStream$1034 = code$1794;
            length$1032 = tokenStream$1034.length;
            lineNumber$1026 = tokenStream$1034.length > 0 ? 1 : 0;
            source$1023 = undefined;
        } else {
            toString$1797 = String;
            if (typeof code$1794 !== 'string' && !(code$1794 instanceof String)) {
                code$1794 = toString$1797(code$1794);
            }
            source$1023 = code$1794;
            length$1032 = source$1023.length;
            lineNumber$1026 = source$1023.length > 0 ? 1 : 0;
        }
        delegate$1033 = SyntaxTreeDelegate$1021;
        streamIndex$1035 = -1;
        index$1025 = 0;
        lineStart$1027 = 0;
        sm_lineStart$1029 = 0;
        sm_lineNumber$1028 = lineNumber$1026;
        sm_index$1031 = 0;
        sm_range$1030 = [
            0,
            0
        ];
        lookahead$1036 = null;
        state$1038 = {
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
        if (typeof options$1795 !== 'undefined') {
            extra$1039.range = typeof options$1795.range === 'boolean' && options$1795.range;
            extra$1039.loc = typeof options$1795.loc === 'boolean' && options$1795.loc;
            if (extra$1039.loc && options$1795.source !== null && options$1795.source !== undefined) {
                delegate$1033 = extend$1182(delegate$1033, {
                    'postProcess': function (node$1798) {
                        node$1798.loc.source = toString$1797(options$1795.source);
                        return node$1798;
                    }
                });
            }
            if (typeof options$1795.tokens === 'boolean' && options$1795.tokens) {
                extra$1039.tokens = [];
            }
            if (typeof options$1795.comment === 'boolean' && options$1795.comment) {
                extra$1039.comments = [];
            }
            if (typeof options$1795.tolerant === 'boolean' && options$1795.tolerant) {
                extra$1039.errors = [];
            }
        }
        if (length$1032 > 0) {
            if (source$1023 && typeof source$1023[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1794 instanceof String) {
                    source$1023 = code$1794.valueOf();
                }
            }
        }
        extra$1039 = { loc: true };
        patch$1180();
        try {
            program$1796 = parseProgram$1166();
            if (typeof extra$1039.comments !== 'undefined') {
                filterCommentLocation$1169();
                program$1796.comments = extra$1039.comments;
            }
            if (typeof extra$1039.tokens !== 'undefined') {
                filterTokenLocation$1172();
                program$1796.tokens = extra$1039.tokens;
            }
            if (typeof extra$1039.errors !== 'undefined') {
                program$1796.errors = extra$1039.errors;
            }
            if (extra$1039.range || extra$1039.loc) {
                program$1796.body = filterGroup$1178(program$1796.body);
            }
        } catch (e$1799) {
            throw e$1799;
        } finally {
            unpatch$1181();
            extra$1039 = {};
        }
        return program$1796;
    }
    exports$1012.tokenize = tokenize$1183;
    exports$1012.read = read$1187;
    exports$1012.Token = Token$1014;
    exports$1012.parse = parse$1188;
    // Deep copy.
    exports$1012.Syntax = function () {
        var name$1800, types$1801 = {};
        if (typeof Object.create === 'function') {
            types$1801 = Object.create(null);
        }
        for (name$1800 in Syntax$1017) {
            if (Syntax$1017.hasOwnProperty(name$1800)) {
                types$1801[name$1800] = Syntax$1017[name$1800];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1801);
        }
        return types$1801;
    }();
}));
//# sourceMappingURL=parser.js.map