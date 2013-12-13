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
(function (root$935, factory$936) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$936);
    } else if (typeof exports !== 'undefined') {
        factory$936(exports, require('./expander'));
    } else {
        factory$936(root$935.esprima = {});
    }
}(this, function (exports$937, expander$938) {
    'use strict';
    var Token$939, TokenName$940, FnExprTokens$941, Syntax$942, PropertyKind$943, Messages$944, Regex$945, SyntaxTreeDelegate$946, ClassPropertyType$947, source$948, strict$949, index$950, lineNumber$951, lineStart$952, sm_lineNumber$953, sm_lineStart$954, sm_range$955, sm_index$956, length$957, delegate$958, tokenStream$959, streamIndex$960, lookahead$961, lookaheadIndex$962, state$963, extra$964;
    Token$939 = {
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
    TokenName$940 = {};
    TokenName$940[Token$939.BooleanLiteral] = 'Boolean';
    TokenName$940[Token$939.EOF] = '<end>';
    TokenName$940[Token$939.Identifier] = 'Identifier';
    TokenName$940[Token$939.Keyword] = 'Keyword';
    TokenName$940[Token$939.NullLiteral] = 'Null';
    TokenName$940[Token$939.NumericLiteral] = 'Numeric';
    TokenName$940[Token$939.Punctuator] = 'Punctuator';
    TokenName$940[Token$939.StringLiteral] = 'String';
    TokenName$940[Token$939.RegularExpression] = 'RegularExpression';
    TokenName$940[Token$939.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$941 = [
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
    Syntax$942 = {
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
    PropertyKind$943 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$947 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$944 = {
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
    Regex$945 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$965(condition$1114, message$1115) {
        if (!condition$1114) {
            throw new Error('ASSERT: ' + message$1115);
        }
    }
    function isIn$966(el$1116, list$1117) {
        return list$1117.indexOf(el$1116) !== -1;
    }
    function isDecimalDigit$967(ch$1118) {
        return ch$1118 >= 48 && ch$1118 <= 57;
    }    // 0..9
    function isHexDigit$968(ch$1119) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1119) >= 0;
    }
    function isOctalDigit$969(ch$1120) {
        return '01234567'.indexOf(ch$1120) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$970(ch$1121) {
        return ch$1121 === 32 || ch$1121 === 9 || ch$1121 === 11 || ch$1121 === 12 || ch$1121 === 160 || ch$1121 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1121)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$971(ch$1122) {
        return ch$1122 === 10 || ch$1122 === 13 || ch$1122 === 8232 || ch$1122 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$972(ch$1123) {
        return ch$1123 === 36 || ch$1123 === 95 || ch$1123 >= 65 && ch$1123 <= 90 || ch$1123 >= 97 && ch$1123 <= 122 || ch$1123 === 92 || ch$1123 >= 128 && Regex$945.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1123));
    }
    function isIdentifierPart$973(ch$1124) {
        return ch$1124 === 36 || ch$1124 === 95 || ch$1124 >= 65 && ch$1124 <= 90 || ch$1124 >= 97 && ch$1124 <= 122 || ch$1124 >= 48 && ch$1124 <= 57 || ch$1124 === 92 || ch$1124 >= 128 && Regex$945.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1124));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$974(id$1125) {
        switch (id$1125) {
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
    function isStrictModeReservedWord$975(id$1126) {
        switch (id$1126) {
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
    function isRestrictedWord$976(id$1127) {
        return id$1127 === 'eval' || id$1127 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$977(id$1128) {
        if (strict$949 && isStrictModeReservedWord$975(id$1128)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1128.length) {
        case 2:
            return id$1128 === 'if' || id$1128 === 'in' || id$1128 === 'do';
        case 3:
            return id$1128 === 'var' || id$1128 === 'for' || id$1128 === 'new' || id$1128 === 'try' || id$1128 === 'let';
        case 4:
            return id$1128 === 'this' || id$1128 === 'else' || id$1128 === 'case' || id$1128 === 'void' || id$1128 === 'with' || id$1128 === 'enum';
        case 5:
            return id$1128 === 'while' || id$1128 === 'break' || id$1128 === 'catch' || id$1128 === 'throw' || id$1128 === 'const' || id$1128 === 'yield' || id$1128 === 'class' || id$1128 === 'super';
        case 6:
            return id$1128 === 'return' || id$1128 === 'typeof' || id$1128 === 'delete' || id$1128 === 'switch' || id$1128 === 'export' || id$1128 === 'import';
        case 7:
            return id$1128 === 'default' || id$1128 === 'finally' || id$1128 === 'extends';
        case 8:
            return id$1128 === 'function' || id$1128 === 'continue' || id$1128 === 'debugger';
        case 10:
            return id$1128 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$978() {
        var ch$1129, blockComment$1130, lineComment$1131;
        blockComment$1130 = false;
        lineComment$1131 = false;
        while (index$950 < length$957) {
            ch$1129 = source$948.charCodeAt(index$950);
            if (lineComment$1131) {
                ++index$950;
                if (isLineTerminator$971(ch$1129)) {
                    lineComment$1131 = false;
                    if (ch$1129 === 13 && source$948.charCodeAt(index$950) === 10) {
                        ++index$950;
                    }
                    ++lineNumber$951;
                    lineStart$952 = index$950;
                }
            } else if (blockComment$1130) {
                if (isLineTerminator$971(ch$1129)) {
                    if (ch$1129 === 13 && source$948.charCodeAt(index$950 + 1) === 10) {
                        ++index$950;
                    }
                    ++lineNumber$951;
                    ++index$950;
                    lineStart$952 = index$950;
                    if (index$950 >= length$957) {
                        throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1129 = source$948.charCodeAt(index$950++);
                    if (index$950 >= length$957) {
                        throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1129 === 42) {
                        ch$1129 = source$948.charCodeAt(index$950);
                        if (ch$1129 === 47) {
                            ++index$950;
                            blockComment$1130 = false;
                        }
                    }
                }
            } else if (ch$1129 === 47) {
                ch$1129 = source$948.charCodeAt(index$950 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1129 === 47) {
                    index$950 += 2;
                    lineComment$1131 = true;
                } else if (ch$1129 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$950 += 2;
                    blockComment$1130 = true;
                    if (index$950 >= length$957) {
                        throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$970(ch$1129)) {
                ++index$950;
            } else if (isLineTerminator$971(ch$1129)) {
                ++index$950;
                if (ch$1129 === 13 && source$948.charCodeAt(index$950) === 10) {
                    ++index$950;
                }
                ++lineNumber$951;
                lineStart$952 = index$950;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$979(prefix$1132) {
        var i$1133, len$1134, ch$1135, code$1136 = 0;
        len$1134 = prefix$1132 === 'u' ? 4 : 2;
        for (i$1133 = 0; i$1133 < len$1134; ++i$1133) {
            if (index$950 < length$957 && isHexDigit$968(source$948[index$950])) {
                ch$1135 = source$948[index$950++];
                code$1136 = code$1136 * 16 + '0123456789abcdef'.indexOf(ch$1135.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1136);
    }
    function scanUnicodeCodePointEscape$980() {
        var ch$1137, code$1138, cu1$1139, cu2$1140;
        ch$1137 = source$948[index$950];
        code$1138 = 0;
        // At least, one hex digit is required.
        if (ch$1137 === '}') {
            throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
        }
        while (index$950 < length$957) {
            ch$1137 = source$948[index$950++];
            if (!isHexDigit$968(ch$1137)) {
                break;
            }
            code$1138 = code$1138 * 16 + '0123456789abcdef'.indexOf(ch$1137.toLowerCase());
        }
        if (code$1138 > 1114111 || ch$1137 !== '}') {
            throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1138 <= 65535) {
            return String.fromCharCode(code$1138);
        }
        cu1$1139 = (code$1138 - 65536 >> 10) + 55296;
        cu2$1140 = (code$1138 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1139, cu2$1140);
    }
    function getEscapedIdentifier$981() {
        var ch$1141, id$1142;
        ch$1141 = source$948.charCodeAt(index$950++);
        id$1142 = String.fromCharCode(ch$1141);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1141 === 92) {
            if (source$948.charCodeAt(index$950) !== 117) {
                throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
            }
            ++index$950;
            ch$1141 = scanHexEscape$979('u');
            if (!ch$1141 || ch$1141 === '\\' || !isIdentifierStart$972(ch$1141.charCodeAt(0))) {
                throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
            }
            id$1142 = ch$1141;
        }
        while (index$950 < length$957) {
            ch$1141 = source$948.charCodeAt(index$950);
            if (!isIdentifierPart$973(ch$1141)) {
                break;
            }
            ++index$950;
            id$1142 += String.fromCharCode(ch$1141);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1141 === 92) {
                id$1142 = id$1142.substr(0, id$1142.length - 1);
                if (source$948.charCodeAt(index$950) !== 117) {
                    throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
                }
                ++index$950;
                ch$1141 = scanHexEscape$979('u');
                if (!ch$1141 || ch$1141 === '\\' || !isIdentifierPart$973(ch$1141.charCodeAt(0))) {
                    throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
                }
                id$1142 += ch$1141;
            }
        }
        return id$1142;
    }
    function getIdentifier$982() {
        var start$1143, ch$1144;
        start$1143 = index$950++;
        while (index$950 < length$957) {
            ch$1144 = source$948.charCodeAt(index$950);
            if (ch$1144 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$950 = start$1143;
                return getEscapedIdentifier$981();
            }
            if (isIdentifierPart$973(ch$1144)) {
                ++index$950;
            } else {
                break;
            }
        }
        return source$948.slice(start$1143, index$950);
    }
    function scanIdentifier$983() {
        var start$1145, id$1146, type$1147;
        start$1145 = index$950;
        // Backslash (char #92) starts an escaped character.
        id$1146 = source$948.charCodeAt(index$950) === 92 ? getEscapedIdentifier$981() : getIdentifier$982();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1146.length === 1) {
            type$1147 = Token$939.Identifier;
        } else if (isKeyword$977(id$1146)) {
            type$1147 = Token$939.Keyword;
        } else if (id$1146 === 'null') {
            type$1147 = Token$939.NullLiteral;
        } else if (id$1146 === 'true' || id$1146 === 'false') {
            type$1147 = Token$939.BooleanLiteral;
        } else {
            type$1147 = Token$939.Identifier;
        }
        return {
            type: type$1147,
            value: id$1146,
            lineNumber: lineNumber$951,
            lineStart: lineStart$952,
            range: [
                start$1145,
                index$950
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$984() {
        var start$1148 = index$950, code$1149 = source$948.charCodeAt(index$950), code2$1150, ch1$1151 = source$948[index$950], ch2$1152, ch3$1153, ch4$1154;
        switch (code$1149) {
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
            ++index$950;
            if (extra$964.tokenize) {
                if (code$1149 === 40) {
                    extra$964.openParenToken = extra$964.tokens.length;
                } else if (code$1149 === 123) {
                    extra$964.openCurlyToken = extra$964.tokens.length;
                }
            }
            return {
                type: Token$939.Punctuator,
                value: String.fromCharCode(code$1149),
                lineNumber: lineNumber$951,
                lineStart: lineStart$952,
                range: [
                    start$1148,
                    index$950
                ]
            };
        default:
            code2$1150 = source$948.charCodeAt(index$950 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1150 === 61) {
                switch (code$1149) {
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
                    index$950 += 2;
                    return {
                        type: Token$939.Punctuator,
                        value: String.fromCharCode(code$1149) + String.fromCharCode(code2$1150),
                        lineNumber: lineNumber$951,
                        lineStart: lineStart$952,
                        range: [
                            start$1148,
                            index$950
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$950 += 2;
                    // !== and ===
                    if (source$948.charCodeAt(index$950) === 61) {
                        ++index$950;
                    }
                    return {
                        type: Token$939.Punctuator,
                        value: source$948.slice(start$1148, index$950),
                        lineNumber: lineNumber$951,
                        lineStart: lineStart$952,
                        range: [
                            start$1148,
                            index$950
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1152 = source$948[index$950 + 1];
        ch3$1153 = source$948[index$950 + 2];
        ch4$1154 = source$948[index$950 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1151 === '>' && ch2$1152 === '>' && ch3$1153 === '>') {
            if (ch4$1154 === '=') {
                index$950 += 4;
                return {
                    type: Token$939.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$951,
                    lineStart: lineStart$952,
                    range: [
                        start$1148,
                        index$950
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1151 === '>' && ch2$1152 === '>' && ch3$1153 === '>') {
            index$950 += 3;
            return {
                type: Token$939.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$951,
                lineStart: lineStart$952,
                range: [
                    start$1148,
                    index$950
                ]
            };
        }
        if (ch1$1151 === '<' && ch2$1152 === '<' && ch3$1153 === '=') {
            index$950 += 3;
            return {
                type: Token$939.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$951,
                lineStart: lineStart$952,
                range: [
                    start$1148,
                    index$950
                ]
            };
        }
        if (ch1$1151 === '>' && ch2$1152 === '>' && ch3$1153 === '=') {
            index$950 += 3;
            return {
                type: Token$939.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$951,
                lineStart: lineStart$952,
                range: [
                    start$1148,
                    index$950
                ]
            };
        }
        if (ch1$1151 === '.' && ch2$1152 === '.' && ch3$1153 === '.') {
            index$950 += 3;
            return {
                type: Token$939.Punctuator,
                value: '...',
                lineNumber: lineNumber$951,
                lineStart: lineStart$952,
                range: [
                    start$1148,
                    index$950
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1151 === ch2$1152 && '+-<>&|'.indexOf(ch1$1151) >= 0) {
            index$950 += 2;
            return {
                type: Token$939.Punctuator,
                value: ch1$1151 + ch2$1152,
                lineNumber: lineNumber$951,
                lineStart: lineStart$952,
                range: [
                    start$1148,
                    index$950
                ]
            };
        }
        if (ch1$1151 === '=' && ch2$1152 === '>') {
            index$950 += 2;
            return {
                type: Token$939.Punctuator,
                value: '=>',
                lineNumber: lineNumber$951,
                lineStart: lineStart$952,
                range: [
                    start$1148,
                    index$950
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1151) >= 0) {
            ++index$950;
            return {
                type: Token$939.Punctuator,
                value: ch1$1151,
                lineNumber: lineNumber$951,
                lineStart: lineStart$952,
                range: [
                    start$1148,
                    index$950
                ]
            };
        }
        if (ch1$1151 === '.') {
            ++index$950;
            return {
                type: Token$939.Punctuator,
                value: ch1$1151,
                lineNumber: lineNumber$951,
                lineStart: lineStart$952,
                range: [
                    start$1148,
                    index$950
                ]
            };
        }
        throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$985(start$1155) {
        var number$1156 = '';
        while (index$950 < length$957) {
            if (!isHexDigit$968(source$948[index$950])) {
                break;
            }
            number$1156 += source$948[index$950++];
        }
        if (number$1156.length === 0) {
            throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$972(source$948.charCodeAt(index$950))) {
            throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$939.NumericLiteral,
            value: parseInt('0x' + number$1156, 16),
            lineNumber: lineNumber$951,
            lineStart: lineStart$952,
            range: [
                start$1155,
                index$950
            ]
        };
    }
    function scanOctalLiteral$986(prefix$1157, start$1158) {
        var number$1159, octal$1160;
        if (isOctalDigit$969(prefix$1157)) {
            octal$1160 = true;
            number$1159 = '0' + source$948[index$950++];
        } else {
            octal$1160 = false;
            ++index$950;
            number$1159 = '';
        }
        while (index$950 < length$957) {
            if (!isOctalDigit$969(source$948[index$950])) {
                break;
            }
            number$1159 += source$948[index$950++];
        }
        if (!octal$1160 && number$1159.length === 0) {
            // only 0o or 0O
            throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$972(source$948.charCodeAt(index$950)) || isDecimalDigit$967(source$948.charCodeAt(index$950))) {
            throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$939.NumericLiteral,
            value: parseInt(number$1159, 8),
            octal: octal$1160,
            lineNumber: lineNumber$951,
            lineStart: lineStart$952,
            range: [
                start$1158,
                index$950
            ]
        };
    }
    function scanNumericLiteral$987() {
        var number$1161, start$1162, ch$1163, octal$1164;
        ch$1163 = source$948[index$950];
        assert$965(isDecimalDigit$967(ch$1163.charCodeAt(0)) || ch$1163 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1162 = index$950;
        number$1161 = '';
        if (ch$1163 !== '.') {
            number$1161 = source$948[index$950++];
            ch$1163 = source$948[index$950];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1161 === '0') {
                if (ch$1163 === 'x' || ch$1163 === 'X') {
                    ++index$950;
                    return scanHexLiteral$985(start$1162);
                }
                if (ch$1163 === 'b' || ch$1163 === 'B') {
                    ++index$950;
                    number$1161 = '';
                    while (index$950 < length$957) {
                        ch$1163 = source$948[index$950];
                        if (ch$1163 !== '0' && ch$1163 !== '1') {
                            break;
                        }
                        number$1161 += source$948[index$950++];
                    }
                    if (number$1161.length === 0) {
                        // only 0b or 0B
                        throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$950 < length$957) {
                        ch$1163 = source$948.charCodeAt(index$950);
                        if (isIdentifierStart$972(ch$1163) || isDecimalDigit$967(ch$1163)) {
                            throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$939.NumericLiteral,
                        value: parseInt(number$1161, 2),
                        lineNumber: lineNumber$951,
                        lineStart: lineStart$952,
                        range: [
                            start$1162,
                            index$950
                        ]
                    };
                }
                if (ch$1163 === 'o' || ch$1163 === 'O' || isOctalDigit$969(ch$1163)) {
                    return scanOctalLiteral$986(ch$1163, start$1162);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1163 && isDecimalDigit$967(ch$1163.charCodeAt(0))) {
                    throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$967(source$948.charCodeAt(index$950))) {
                number$1161 += source$948[index$950++];
            }
            ch$1163 = source$948[index$950];
        }
        if (ch$1163 === '.') {
            number$1161 += source$948[index$950++];
            while (isDecimalDigit$967(source$948.charCodeAt(index$950))) {
                number$1161 += source$948[index$950++];
            }
            ch$1163 = source$948[index$950];
        }
        if (ch$1163 === 'e' || ch$1163 === 'E') {
            number$1161 += source$948[index$950++];
            ch$1163 = source$948[index$950];
            if (ch$1163 === '+' || ch$1163 === '-') {
                number$1161 += source$948[index$950++];
            }
            if (isDecimalDigit$967(source$948.charCodeAt(index$950))) {
                while (isDecimalDigit$967(source$948.charCodeAt(index$950))) {
                    number$1161 += source$948[index$950++];
                }
            } else {
                throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$972(source$948.charCodeAt(index$950))) {
            throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$939.NumericLiteral,
            value: parseFloat(number$1161),
            lineNumber: lineNumber$951,
            lineStart: lineStart$952,
            range: [
                start$1162,
                index$950
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$988() {
        var str$1165 = '', quote$1166, start$1167, ch$1168, code$1169, unescaped$1170, restore$1171, octal$1172 = false;
        quote$1166 = source$948[index$950];
        assert$965(quote$1166 === '\'' || quote$1166 === '"', 'String literal must starts with a quote');
        start$1167 = index$950;
        ++index$950;
        while (index$950 < length$957) {
            ch$1168 = source$948[index$950++];
            if (ch$1168 === quote$1166) {
                quote$1166 = '';
                break;
            } else if (ch$1168 === '\\') {
                ch$1168 = source$948[index$950++];
                if (!ch$1168 || !isLineTerminator$971(ch$1168.charCodeAt(0))) {
                    switch (ch$1168) {
                    case 'n':
                        str$1165 += '\n';
                        break;
                    case 'r':
                        str$1165 += '\r';
                        break;
                    case 't':
                        str$1165 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$948[index$950] === '{') {
                            ++index$950;
                            str$1165 += scanUnicodeCodePointEscape$980();
                        } else {
                            restore$1171 = index$950;
                            unescaped$1170 = scanHexEscape$979(ch$1168);
                            if (unescaped$1170) {
                                str$1165 += unescaped$1170;
                            } else {
                                index$950 = restore$1171;
                                str$1165 += ch$1168;
                            }
                        }
                        break;
                    case 'b':
                        str$1165 += '\b';
                        break;
                    case 'f':
                        str$1165 += '\f';
                        break;
                    case 'v':
                        str$1165 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$969(ch$1168)) {
                            code$1169 = '01234567'.indexOf(ch$1168);
                            // \0 is not octal escape sequence
                            if (code$1169 !== 0) {
                                octal$1172 = true;
                            }
                            if (index$950 < length$957 && isOctalDigit$969(source$948[index$950])) {
                                octal$1172 = true;
                                code$1169 = code$1169 * 8 + '01234567'.indexOf(source$948[index$950++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1168) >= 0 && index$950 < length$957 && isOctalDigit$969(source$948[index$950])) {
                                    code$1169 = code$1169 * 8 + '01234567'.indexOf(source$948[index$950++]);
                                }
                            }
                            str$1165 += String.fromCharCode(code$1169);
                        } else {
                            str$1165 += ch$1168;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$951;
                    if (ch$1168 === '\r' && source$948[index$950] === '\n') {
                        ++index$950;
                    }
                }
            } else if (isLineTerminator$971(ch$1168.charCodeAt(0))) {
                break;
            } else {
                str$1165 += ch$1168;
            }
        }
        if (quote$1166 !== '') {
            throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$939.StringLiteral,
            value: str$1165,
            octal: octal$1172,
            lineNumber: lineNumber$951,
            lineStart: lineStart$952,
            range: [
                start$1167,
                index$950
            ]
        };
    }
    function scanTemplate$989() {
        var cooked$1173 = '', ch$1174, start$1175, terminated$1176, tail$1177, restore$1178, unescaped$1179, code$1180, octal$1181;
        terminated$1176 = false;
        tail$1177 = false;
        start$1175 = index$950;
        ++index$950;
        while (index$950 < length$957) {
            ch$1174 = source$948[index$950++];
            if (ch$1174 === '`') {
                tail$1177 = true;
                terminated$1176 = true;
                break;
            } else if (ch$1174 === '$') {
                if (source$948[index$950] === '{') {
                    ++index$950;
                    terminated$1176 = true;
                    break;
                }
                cooked$1173 += ch$1174;
            } else if (ch$1174 === '\\') {
                ch$1174 = source$948[index$950++];
                if (!isLineTerminator$971(ch$1174.charCodeAt(0))) {
                    switch (ch$1174) {
                    case 'n':
                        cooked$1173 += '\n';
                        break;
                    case 'r':
                        cooked$1173 += '\r';
                        break;
                    case 't':
                        cooked$1173 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$948[index$950] === '{') {
                            ++index$950;
                            cooked$1173 += scanUnicodeCodePointEscape$980();
                        } else {
                            restore$1178 = index$950;
                            unescaped$1179 = scanHexEscape$979(ch$1174);
                            if (unescaped$1179) {
                                cooked$1173 += unescaped$1179;
                            } else {
                                index$950 = restore$1178;
                                cooked$1173 += ch$1174;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1173 += '\b';
                        break;
                    case 'f':
                        cooked$1173 += '\f';
                        break;
                    case 'v':
                        cooked$1173 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$969(ch$1174)) {
                            code$1180 = '01234567'.indexOf(ch$1174);
                            // \0 is not octal escape sequence
                            if (code$1180 !== 0) {
                                octal$1181 = true;
                            }
                            if (index$950 < length$957 && isOctalDigit$969(source$948[index$950])) {
                                octal$1181 = true;
                                code$1180 = code$1180 * 8 + '01234567'.indexOf(source$948[index$950++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1174) >= 0 && index$950 < length$957 && isOctalDigit$969(source$948[index$950])) {
                                    code$1180 = code$1180 * 8 + '01234567'.indexOf(source$948[index$950++]);
                                }
                            }
                            cooked$1173 += String.fromCharCode(code$1180);
                        } else {
                            cooked$1173 += ch$1174;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$951;
                    if (ch$1174 === '\r' && source$948[index$950] === '\n') {
                        ++index$950;
                    }
                }
            } else if (isLineTerminator$971(ch$1174.charCodeAt(0))) {
                ++lineNumber$951;
                if (ch$1174 === '\r' && source$948[index$950] === '\n') {
                    ++index$950;
                }
                cooked$1173 += '\n';
            } else {
                cooked$1173 += ch$1174;
            }
        }
        if (!terminated$1176) {
            throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$939.Template,
            value: {
                cooked: cooked$1173,
                raw: source$948.slice(start$1175 + 1, index$950 - (tail$1177 ? 1 : 2))
            },
            tail: tail$1177,
            octal: octal$1181,
            lineNumber: lineNumber$951,
            lineStart: lineStart$952,
            range: [
                start$1175,
                index$950
            ]
        };
    }
    function scanTemplateElement$990(option$1182) {
        var startsWith$1183, template$1184;
        lookahead$961 = null;
        skipComment$978();
        startsWith$1183 = option$1182.head ? '`' : '}';
        if (source$948[index$950] !== startsWith$1183) {
            throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
        }
        template$1184 = scanTemplate$989();
        peek$996();
        return template$1184;
    }
    function scanRegExp$991() {
        var str$1185, ch$1186, start$1187, pattern$1188, flags$1189, value$1190, classMarker$1191 = false, restore$1192, terminated$1193 = false;
        lookahead$961 = null;
        skipComment$978();
        start$1187 = index$950;
        ch$1186 = source$948[index$950];
        assert$965(ch$1186 === '/', 'Regular expression literal must start with a slash');
        str$1185 = source$948[index$950++];
        while (index$950 < length$957) {
            ch$1186 = source$948[index$950++];
            str$1185 += ch$1186;
            if (classMarker$1191) {
                if (ch$1186 === ']') {
                    classMarker$1191 = false;
                }
            } else {
                if (ch$1186 === '\\') {
                    ch$1186 = source$948[index$950++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$971(ch$1186.charCodeAt(0))) {
                        throwError$999({}, Messages$944.UnterminatedRegExp);
                    }
                    str$1185 += ch$1186;
                } else if (ch$1186 === '/') {
                    terminated$1193 = true;
                    break;
                } else if (ch$1186 === '[') {
                    classMarker$1191 = true;
                } else if (isLineTerminator$971(ch$1186.charCodeAt(0))) {
                    throwError$999({}, Messages$944.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1193) {
            throwError$999({}, Messages$944.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1188 = str$1185.substr(1, str$1185.length - 2);
        flags$1189 = '';
        while (index$950 < length$957) {
            ch$1186 = source$948[index$950];
            if (!isIdentifierPart$973(ch$1186.charCodeAt(0))) {
                break;
            }
            ++index$950;
            if (ch$1186 === '\\' && index$950 < length$957) {
                ch$1186 = source$948[index$950];
                if (ch$1186 === 'u') {
                    ++index$950;
                    restore$1192 = index$950;
                    ch$1186 = scanHexEscape$979('u');
                    if (ch$1186) {
                        flags$1189 += ch$1186;
                        for (str$1185 += '\\u'; restore$1192 < index$950; ++restore$1192) {
                            str$1185 += source$948[restore$1192];
                        }
                    } else {
                        index$950 = restore$1192;
                        flags$1189 += 'u';
                        str$1185 += '\\u';
                    }
                } else {
                    str$1185 += '\\';
                }
            } else {
                flags$1189 += ch$1186;
                str$1185 += ch$1186;
            }
        }
        try {
            value$1190 = new RegExp(pattern$1188, flags$1189);
        } catch (e$1194) {
            throwError$999({}, Messages$944.InvalidRegExp);
        }
        // peek();
        if (extra$964.tokenize) {
            return {
                type: Token$939.RegularExpression,
                value: value$1190,
                lineNumber: lineNumber$951,
                lineStart: lineStart$952,
                range: [
                    start$1187,
                    index$950
                ]
            };
        }
        return {
            type: Token$939.RegularExpression,
            literal: str$1185,
            value: value$1190,
            range: [
                start$1187,
                index$950
            ]
        };
    }
    function isIdentifierName$992(token$1195) {
        return token$1195.type === Token$939.Identifier || token$1195.type === Token$939.Keyword || token$1195.type === Token$939.BooleanLiteral || token$1195.type === Token$939.NullLiteral;
    }
    function advanceSlash$993() {
        var prevToken$1196, checkToken$1197;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1196 = extra$964.tokens[extra$964.tokens.length - 1];
        if (!prevToken$1196) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$991();
        }
        if (prevToken$1196.type === 'Punctuator') {
            if (prevToken$1196.value === ')') {
                checkToken$1197 = extra$964.tokens[extra$964.openParenToken - 1];
                if (checkToken$1197 && checkToken$1197.type === 'Keyword' && (checkToken$1197.value === 'if' || checkToken$1197.value === 'while' || checkToken$1197.value === 'for' || checkToken$1197.value === 'with')) {
                    return scanRegExp$991();
                }
                return scanPunctuator$984();
            }
            if (prevToken$1196.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$964.tokens[extra$964.openCurlyToken - 3] && extra$964.tokens[extra$964.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1197 = extra$964.tokens[extra$964.openCurlyToken - 4];
                    if (!checkToken$1197) {
                        return scanPunctuator$984();
                    }
                } else if (extra$964.tokens[extra$964.openCurlyToken - 4] && extra$964.tokens[extra$964.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1197 = extra$964.tokens[extra$964.openCurlyToken - 5];
                    if (!checkToken$1197) {
                        return scanRegExp$991();
                    }
                } else {
                    return scanPunctuator$984();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$941.indexOf(checkToken$1197.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$984();
                }
                // It is a declaration.
                return scanRegExp$991();
            }
            return scanRegExp$991();
        }
        if (prevToken$1196.type === 'Keyword') {
            return scanRegExp$991();
        }
        return scanPunctuator$984();
    }
    function advance$994() {
        var ch$1198;
        skipComment$978();
        if (index$950 >= length$957) {
            return {
                type: Token$939.EOF,
                lineNumber: lineNumber$951,
                lineStart: lineStart$952,
                range: [
                    index$950,
                    index$950
                ]
            };
        }
        ch$1198 = source$948.charCodeAt(index$950);
        // Very common: ( and ) and ;
        if (ch$1198 === 40 || ch$1198 === 41 || ch$1198 === 58) {
            return scanPunctuator$984();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1198 === 39 || ch$1198 === 34) {
            return scanStringLiteral$988();
        }
        if (ch$1198 === 96) {
            return scanTemplate$989();
        }
        if (isIdentifierStart$972(ch$1198)) {
            return scanIdentifier$983();
        }
        // # and @ are allowed for sweet.js
        if (ch$1198 === 35 || ch$1198 === 64) {
            ++index$950;
            return {
                type: Token$939.Punctuator,
                value: String.fromCharCode(ch$1198),
                lineNumber: lineNumber$951,
                lineStart: lineStart$952,
                range: [
                    index$950 - 1,
                    index$950
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1198 === 46) {
            if (isDecimalDigit$967(source$948.charCodeAt(index$950 + 1))) {
                return scanNumericLiteral$987();
            }
            return scanPunctuator$984();
        }
        if (isDecimalDigit$967(ch$1198)) {
            return scanNumericLiteral$987();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$964.tokenize && ch$1198 === 47) {
            return advanceSlash$993();
        }
        return scanPunctuator$984();
    }
    function lex$995() {
        var token$1199;
        token$1199 = lookahead$961;
        streamIndex$960 = lookaheadIndex$962;
        lineNumber$951 = token$1199.lineNumber;
        lineStart$952 = token$1199.lineStart;
        sm_lineNumber$953 = lookahead$961.sm_lineNumber;
        sm_lineStart$954 = lookahead$961.sm_lineStart;
        sm_range$955 = lookahead$961.sm_range;
        sm_index$956 = lookahead$961.sm_range[0];
        lookahead$961 = tokenStream$959[++streamIndex$960].token;
        lookaheadIndex$962 = streamIndex$960;
        index$950 = lookahead$961.range[0];
        return token$1199;
    }
    function peek$996() {
        lookaheadIndex$962 = streamIndex$960 + 1;
        if (lookaheadIndex$962 >= length$957) {
            lookahead$961 = {
                type: Token$939.EOF,
                lineNumber: lineNumber$951,
                lineStart: lineStart$952,
                range: [
                    index$950,
                    index$950
                ]
            };
            return;
        }
        lookahead$961 = tokenStream$959[lookaheadIndex$962].token;
        index$950 = lookahead$961.range[0];
    }
    function lookahead2$997() {
        var adv$1200, pos$1201, line$1202, start$1203, result$1204;
        if (streamIndex$960 + 1 >= length$957 || streamIndex$960 + 2 >= length$957) {
            return {
                type: Token$939.EOF,
                lineNumber: lineNumber$951,
                lineStart: lineStart$952,
                range: [
                    index$950,
                    index$950
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$961 === null) {
            lookaheadIndex$962 = streamIndex$960 + 1;
            lookahead$961 = tokenStream$959[lookaheadIndex$962].token;
            index$950 = lookahead$961.range[0];
        }
        result$1204 = tokenStream$959[lookaheadIndex$962 + 1].token;
        return result$1204;
    }
    SyntaxTreeDelegate$946 = {
        name: 'SyntaxTree',
        postProcess: function (node$1205) {
            return node$1205;
        },
        createArrayExpression: function (elements$1206) {
            return {
                type: Syntax$942.ArrayExpression,
                elements: elements$1206
            };
        },
        createAssignmentExpression: function (operator$1207, left$1208, right$1209) {
            return {
                type: Syntax$942.AssignmentExpression,
                operator: operator$1207,
                left: left$1208,
                right: right$1209
            };
        },
        createBinaryExpression: function (operator$1210, left$1211, right$1212) {
            var type$1213 = operator$1210 === '||' || operator$1210 === '&&' ? Syntax$942.LogicalExpression : Syntax$942.BinaryExpression;
            return {
                type: type$1213,
                operator: operator$1210,
                left: left$1211,
                right: right$1212
            };
        },
        createBlockStatement: function (body$1214) {
            return {
                type: Syntax$942.BlockStatement,
                body: body$1214
            };
        },
        createBreakStatement: function (label$1215) {
            return {
                type: Syntax$942.BreakStatement,
                label: label$1215
            };
        },
        createCallExpression: function (callee$1216, args$1217) {
            return {
                type: Syntax$942.CallExpression,
                callee: callee$1216,
                'arguments': args$1217
            };
        },
        createCatchClause: function (param$1218, body$1219) {
            return {
                type: Syntax$942.CatchClause,
                param: param$1218,
                body: body$1219
            };
        },
        createConditionalExpression: function (test$1220, consequent$1221, alternate$1222) {
            return {
                type: Syntax$942.ConditionalExpression,
                test: test$1220,
                consequent: consequent$1221,
                alternate: alternate$1222
            };
        },
        createContinueStatement: function (label$1223) {
            return {
                type: Syntax$942.ContinueStatement,
                label: label$1223
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$942.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1224, test$1225) {
            return {
                type: Syntax$942.DoWhileStatement,
                body: body$1224,
                test: test$1225
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$942.EmptyStatement };
        },
        createExpressionStatement: function (expression$1226) {
            return {
                type: Syntax$942.ExpressionStatement,
                expression: expression$1226
            };
        },
        createForStatement: function (init$1227, test$1228, update$1229, body$1230) {
            return {
                type: Syntax$942.ForStatement,
                init: init$1227,
                test: test$1228,
                update: update$1229,
                body: body$1230
            };
        },
        createForInStatement: function (left$1231, right$1232, body$1233) {
            return {
                type: Syntax$942.ForInStatement,
                left: left$1231,
                right: right$1232,
                body: body$1233,
                each: false
            };
        },
        createForOfStatement: function (left$1234, right$1235, body$1236) {
            return {
                type: Syntax$942.ForOfStatement,
                left: left$1234,
                right: right$1235,
                body: body$1236
            };
        },
        createFunctionDeclaration: function (id$1237, params$1238, defaults$1239, body$1240, rest$1241, generator$1242, expression$1243) {
            return {
                type: Syntax$942.FunctionDeclaration,
                id: id$1237,
                params: params$1238,
                defaults: defaults$1239,
                body: body$1240,
                rest: rest$1241,
                generator: generator$1242,
                expression: expression$1243
            };
        },
        createFunctionExpression: function (id$1244, params$1245, defaults$1246, body$1247, rest$1248, generator$1249, expression$1250) {
            return {
                type: Syntax$942.FunctionExpression,
                id: id$1244,
                params: params$1245,
                defaults: defaults$1246,
                body: body$1247,
                rest: rest$1248,
                generator: generator$1249,
                expression: expression$1250
            };
        },
        createIdentifier: function (name$1251) {
            return {
                type: Syntax$942.Identifier,
                name: name$1251
            };
        },
        createIfStatement: function (test$1252, consequent$1253, alternate$1254) {
            return {
                type: Syntax$942.IfStatement,
                test: test$1252,
                consequent: consequent$1253,
                alternate: alternate$1254
            };
        },
        createLabeledStatement: function (label$1255, body$1256) {
            return {
                type: Syntax$942.LabeledStatement,
                label: label$1255,
                body: body$1256
            };
        },
        createLiteral: function (token$1257) {
            return {
                type: Syntax$942.Literal,
                value: token$1257.value,
                raw: String(token$1257.value)
            };
        },
        createMemberExpression: function (accessor$1258, object$1259, property$1260) {
            return {
                type: Syntax$942.MemberExpression,
                computed: accessor$1258 === '[',
                object: object$1259,
                property: property$1260
            };
        },
        createNewExpression: function (callee$1261, args$1262) {
            return {
                type: Syntax$942.NewExpression,
                callee: callee$1261,
                'arguments': args$1262
            };
        },
        createObjectExpression: function (properties$1263) {
            return {
                type: Syntax$942.ObjectExpression,
                properties: properties$1263
            };
        },
        createPostfixExpression: function (operator$1264, argument$1265) {
            return {
                type: Syntax$942.UpdateExpression,
                operator: operator$1264,
                argument: argument$1265,
                prefix: false
            };
        },
        createProgram: function (body$1266) {
            return {
                type: Syntax$942.Program,
                body: body$1266
            };
        },
        createProperty: function (kind$1267, key$1268, value$1269, method$1270, shorthand$1271) {
            return {
                type: Syntax$942.Property,
                key: key$1268,
                value: value$1269,
                kind: kind$1267,
                method: method$1270,
                shorthand: shorthand$1271
            };
        },
        createReturnStatement: function (argument$1272) {
            return {
                type: Syntax$942.ReturnStatement,
                argument: argument$1272
            };
        },
        createSequenceExpression: function (expressions$1273) {
            return {
                type: Syntax$942.SequenceExpression,
                expressions: expressions$1273
            };
        },
        createSwitchCase: function (test$1274, consequent$1275) {
            return {
                type: Syntax$942.SwitchCase,
                test: test$1274,
                consequent: consequent$1275
            };
        },
        createSwitchStatement: function (discriminant$1276, cases$1277) {
            return {
                type: Syntax$942.SwitchStatement,
                discriminant: discriminant$1276,
                cases: cases$1277
            };
        },
        createThisExpression: function () {
            return { type: Syntax$942.ThisExpression };
        },
        createThrowStatement: function (argument$1278) {
            return {
                type: Syntax$942.ThrowStatement,
                argument: argument$1278
            };
        },
        createTryStatement: function (block$1279, guardedHandlers$1280, handlers$1281, finalizer$1282) {
            return {
                type: Syntax$942.TryStatement,
                block: block$1279,
                guardedHandlers: guardedHandlers$1280,
                handlers: handlers$1281,
                finalizer: finalizer$1282
            };
        },
        createUnaryExpression: function (operator$1283, argument$1284) {
            if (operator$1283 === '++' || operator$1283 === '--') {
                return {
                    type: Syntax$942.UpdateExpression,
                    operator: operator$1283,
                    argument: argument$1284,
                    prefix: true
                };
            }
            return {
                type: Syntax$942.UnaryExpression,
                operator: operator$1283,
                argument: argument$1284
            };
        },
        createVariableDeclaration: function (declarations$1285, kind$1286) {
            return {
                type: Syntax$942.VariableDeclaration,
                declarations: declarations$1285,
                kind: kind$1286
            };
        },
        createVariableDeclarator: function (id$1287, init$1288) {
            return {
                type: Syntax$942.VariableDeclarator,
                id: id$1287,
                init: init$1288
            };
        },
        createWhileStatement: function (test$1289, body$1290) {
            return {
                type: Syntax$942.WhileStatement,
                test: test$1289,
                body: body$1290
            };
        },
        createWithStatement: function (object$1291, body$1292) {
            return {
                type: Syntax$942.WithStatement,
                object: object$1291,
                body: body$1292
            };
        },
        createTemplateElement: function (value$1293, tail$1294) {
            return {
                type: Syntax$942.TemplateElement,
                value: value$1293,
                tail: tail$1294
            };
        },
        createTemplateLiteral: function (quasis$1295, expressions$1296) {
            return {
                type: Syntax$942.TemplateLiteral,
                quasis: quasis$1295,
                expressions: expressions$1296
            };
        },
        createSpreadElement: function (argument$1297) {
            return {
                type: Syntax$942.SpreadElement,
                argument: argument$1297
            };
        },
        createTaggedTemplateExpression: function (tag$1298, quasi$1299) {
            return {
                type: Syntax$942.TaggedTemplateExpression,
                tag: tag$1298,
                quasi: quasi$1299
            };
        },
        createArrowFunctionExpression: function (params$1300, defaults$1301, body$1302, rest$1303, expression$1304) {
            return {
                type: Syntax$942.ArrowFunctionExpression,
                id: null,
                params: params$1300,
                defaults: defaults$1301,
                body: body$1302,
                rest: rest$1303,
                generator: false,
                expression: expression$1304
            };
        },
        createMethodDefinition: function (propertyType$1305, kind$1306, key$1307, value$1308) {
            return {
                type: Syntax$942.MethodDefinition,
                key: key$1307,
                value: value$1308,
                kind: kind$1306,
                'static': propertyType$1305 === ClassPropertyType$947.static
            };
        },
        createClassBody: function (body$1309) {
            return {
                type: Syntax$942.ClassBody,
                body: body$1309
            };
        },
        createClassExpression: function (id$1310, superClass$1311, body$1312) {
            return {
                type: Syntax$942.ClassExpression,
                id: id$1310,
                superClass: superClass$1311,
                body: body$1312
            };
        },
        createClassDeclaration: function (id$1313, superClass$1314, body$1315) {
            return {
                type: Syntax$942.ClassDeclaration,
                id: id$1313,
                superClass: superClass$1314,
                body: body$1315
            };
        },
        createExportSpecifier: function (id$1316, name$1317) {
            return {
                type: Syntax$942.ExportSpecifier,
                id: id$1316,
                name: name$1317
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$942.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1318, specifiers$1319, source$1320) {
            return {
                type: Syntax$942.ExportDeclaration,
                declaration: declaration$1318,
                specifiers: specifiers$1319,
                source: source$1320
            };
        },
        createImportSpecifier: function (id$1321, name$1322) {
            return {
                type: Syntax$942.ImportSpecifier,
                id: id$1321,
                name: name$1322
            };
        },
        createImportDeclaration: function (specifiers$1323, kind$1324, source$1325) {
            return {
                type: Syntax$942.ImportDeclaration,
                specifiers: specifiers$1323,
                kind: kind$1324,
                source: source$1325
            };
        },
        createYieldExpression: function (argument$1326, delegate$1327) {
            return {
                type: Syntax$942.YieldExpression,
                argument: argument$1326,
                delegate: delegate$1327
            };
        },
        createModuleDeclaration: function (id$1328, source$1329, body$1330) {
            return {
                type: Syntax$942.ModuleDeclaration,
                id: id$1328,
                source: source$1329,
                body: body$1330
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$998() {
        return lookahead$961.lineNumber !== lineNumber$951;
    }
    // Throw an exception
    function throwError$999(token$1331, messageFormat$1332) {
        var error$1333, args$1334 = Array.prototype.slice.call(arguments, 2), msg$1335 = messageFormat$1332.replace(/%(\d)/g, function (whole$1339, index$1340) {
                assert$965(index$1340 < args$1334.length, 'Message reference must be in range');
                return args$1334[index$1340];
            });
        var startIndex$1336 = streamIndex$960 > 3 ? streamIndex$960 - 3 : 0;
        var toks$1337 = tokenStream$959.slice(startIndex$1336, streamIndex$960 + 3).map(function (stx$1341) {
                return stx$1341.token.value;
            }).join(' ');
        var tailingMsg$1338 = '\n[... ' + toks$1337 + ' ...]';
        if (typeof token$1331.lineNumber === 'number') {
            error$1333 = new Error('Line ' + token$1331.lineNumber + ': ' + msg$1335 + tailingMsg$1338);
            error$1333.index = token$1331.range[0];
            error$1333.lineNumber = token$1331.lineNumber;
            error$1333.column = token$1331.range[0] - lineStart$952 + 1;
        } else {
            error$1333 = new Error('Line ' + lineNumber$951 + ': ' + msg$1335 + tailingMsg$1338);
            error$1333.index = index$950;
            error$1333.lineNumber = lineNumber$951;
            error$1333.column = index$950 - lineStart$952 + 1;
        }
        error$1333.description = msg$1335;
        throw error$1333;
    }
    function throwErrorTolerant$1000() {
        try {
            throwError$999.apply(null, arguments);
        } catch (e$1342) {
            if (extra$964.errors) {
                extra$964.errors.push(e$1342);
            } else {
                throw e$1342;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$1001(token$1343) {
        if (token$1343.type === Token$939.EOF) {
            throwError$999(token$1343, Messages$944.UnexpectedEOS);
        }
        if (token$1343.type === Token$939.NumericLiteral) {
            throwError$999(token$1343, Messages$944.UnexpectedNumber);
        }
        if (token$1343.type === Token$939.StringLiteral) {
            throwError$999(token$1343, Messages$944.UnexpectedString);
        }
        if (token$1343.type === Token$939.Identifier) {
            throwError$999(token$1343, Messages$944.UnexpectedIdentifier);
        }
        if (token$1343.type === Token$939.Keyword) {
            if (isFutureReservedWord$974(token$1343.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$949 && isStrictModeReservedWord$975(token$1343.value)) {
                throwErrorTolerant$1000(token$1343, Messages$944.StrictReservedWord);
                return;
            }
            throwError$999(token$1343, Messages$944.UnexpectedToken, token$1343.value);
        }
        if (token$1343.type === Token$939.Template) {
            throwError$999(token$1343, Messages$944.UnexpectedTemplate, token$1343.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$999(token$1343, Messages$944.UnexpectedToken, token$1343.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$1002(value$1344) {
        var token$1345 = lex$995();
        if (token$1345.type !== Token$939.Punctuator || token$1345.value !== value$1344) {
            throwUnexpected$1001(token$1345);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$1003(keyword$1346) {
        var token$1347 = lex$995();
        if (token$1347.type !== Token$939.Keyword || token$1347.value !== keyword$1346) {
            throwUnexpected$1001(token$1347);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$1004(value$1348) {
        return lookahead$961.type === Token$939.Punctuator && lookahead$961.value === value$1348;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$1005(keyword$1349) {
        return lookahead$961.type === Token$939.Keyword && lookahead$961.value === keyword$1349;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$1006(keyword$1350) {
        return lookahead$961.type === Token$939.Identifier && lookahead$961.value === keyword$1350;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$1007() {
        var op$1351;
        if (lookahead$961.type !== Token$939.Punctuator) {
            return false;
        }
        op$1351 = lookahead$961.value;
        return op$1351 === '=' || op$1351 === '*=' || op$1351 === '/=' || op$1351 === '%=' || op$1351 === '+=' || op$1351 === '-=' || op$1351 === '<<=' || op$1351 === '>>=' || op$1351 === '>>>=' || op$1351 === '&=' || op$1351 === '^=' || op$1351 === '|=';
    }
    function consumeSemicolon$1008() {
        var line$1352, ch$1353;
        ch$1353 = lookahead$961.value ? String(lookahead$961.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1353 === 59) {
            lex$995();
            return;
        }
        if (lookahead$961.lineNumber !== lineNumber$951) {
            return;
        }
        if (match$1004(';')) {
            lex$995();
            return;
        }
        if (lookahead$961.type !== Token$939.EOF && !match$1004('}')) {
            throwUnexpected$1001(lookahead$961);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$1009(expr$1354) {
        return expr$1354.type === Syntax$942.Identifier || expr$1354.type === Syntax$942.MemberExpression;
    }
    function isAssignableLeftHandSide$1010(expr$1355) {
        return isLeftHandSide$1009(expr$1355) || expr$1355.type === Syntax$942.ObjectPattern || expr$1355.type === Syntax$942.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$1011() {
        var elements$1356 = [], blocks$1357 = [], filter$1358 = null, tmp$1359, possiblecomprehension$1360 = true, body$1361;
        expect$1002('[');
        while (!match$1004(']')) {
            if (lookahead$961.value === 'for' && lookahead$961.type === Token$939.Keyword) {
                if (!possiblecomprehension$1360) {
                    throwError$999({}, Messages$944.ComprehensionError);
                }
                matchKeyword$1005('for');
                tmp$1359 = parseForStatement$1059({ ignoreBody: true });
                tmp$1359.of = tmp$1359.type === Syntax$942.ForOfStatement;
                tmp$1359.type = Syntax$942.ComprehensionBlock;
                if (tmp$1359.left.kind) {
                    // can't be let or const
                    throwError$999({}, Messages$944.ComprehensionError);
                }
                blocks$1357.push(tmp$1359);
            } else if (lookahead$961.value === 'if' && lookahead$961.type === Token$939.Keyword) {
                if (!possiblecomprehension$1360) {
                    throwError$999({}, Messages$944.ComprehensionError);
                }
                expectKeyword$1003('if');
                expect$1002('(');
                filter$1358 = parseExpression$1039();
                expect$1002(')');
            } else if (lookahead$961.value === ',' && lookahead$961.type === Token$939.Punctuator) {
                possiblecomprehension$1360 = false;
                // no longer allowed.
                lex$995();
                elements$1356.push(null);
            } else {
                tmp$1359 = parseSpreadOrAssignmentExpression$1022();
                elements$1356.push(tmp$1359);
                if (tmp$1359 && tmp$1359.type === Syntax$942.SpreadElement) {
                    if (!match$1004(']')) {
                        throwError$999({}, Messages$944.ElementAfterSpreadElement);
                    }
                } else if (!(match$1004(']') || matchKeyword$1005('for') || matchKeyword$1005('if'))) {
                    expect$1002(',');
                    // this lexes.
                    possiblecomprehension$1360 = false;
                }
            }
        }
        expect$1002(']');
        if (filter$1358 && !blocks$1357.length) {
            throwError$999({}, Messages$944.ComprehensionRequiresBlock);
        }
        if (blocks$1357.length) {
            if (elements$1356.length !== 1) {
                throwError$999({}, Messages$944.ComprehensionError);
            }
            return {
                type: Syntax$942.ComprehensionExpression,
                filter: filter$1358,
                blocks: blocks$1357,
                body: elements$1356[0]
            };
        }
        return delegate$958.createArrayExpression(elements$1356);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$1012(options$1362) {
        var previousStrict$1363, previousYieldAllowed$1364, params$1365, defaults$1366, body$1367;
        previousStrict$1363 = strict$949;
        previousYieldAllowed$1364 = state$963.yieldAllowed;
        state$963.yieldAllowed = options$1362.generator;
        params$1365 = options$1362.params || [];
        defaults$1366 = options$1362.defaults || [];
        body$1367 = parseConciseBody$1071();
        if (options$1362.name && strict$949 && isRestrictedWord$976(params$1365[0].name)) {
            throwErrorTolerant$1000(options$1362.name, Messages$944.StrictParamName);
        }
        if (state$963.yieldAllowed && !state$963.yieldFound) {
            throwErrorTolerant$1000({}, Messages$944.NoYieldInGenerator);
        }
        strict$949 = previousStrict$1363;
        state$963.yieldAllowed = previousYieldAllowed$1364;
        return delegate$958.createFunctionExpression(null, params$1365, defaults$1366, body$1367, options$1362.rest || null, options$1362.generator, body$1367.type !== Syntax$942.BlockStatement);
    }
    function parsePropertyMethodFunction$1013(options$1368) {
        var previousStrict$1369, tmp$1370, method$1371;
        previousStrict$1369 = strict$949;
        strict$949 = true;
        tmp$1370 = parseParams$1075();
        if (tmp$1370.stricted) {
            throwErrorTolerant$1000(tmp$1370.stricted, tmp$1370.message);
        }
        method$1371 = parsePropertyFunction$1012({
            params: tmp$1370.params,
            defaults: tmp$1370.defaults,
            rest: tmp$1370.rest,
            generator: options$1368.generator
        });
        strict$949 = previousStrict$1369;
        return method$1371;
    }
    function parseObjectPropertyKey$1014() {
        var token$1372 = lex$995();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1372.type === Token$939.StringLiteral || token$1372.type === Token$939.NumericLiteral) {
            if (strict$949 && token$1372.octal) {
                throwErrorTolerant$1000(token$1372, Messages$944.StrictOctalLiteral);
            }
            return delegate$958.createLiteral(token$1372);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$958.createIdentifier(token$1372.value);
    }
    function parseObjectProperty$1015() {
        var token$1373, key$1374, id$1375, value$1376, param$1377;
        token$1373 = lookahead$961;
        if (token$1373.type === Token$939.Identifier) {
            id$1375 = parseObjectPropertyKey$1014();
            // Property Assignment: Getter and Setter.
            if (token$1373.value === 'get' && !(match$1004(':') || match$1004('('))) {
                key$1374 = parseObjectPropertyKey$1014();
                expect$1002('(');
                expect$1002(')');
                return delegate$958.createProperty('get', key$1374, parsePropertyFunction$1012({ generator: false }), false, false);
            }
            if (token$1373.value === 'set' && !(match$1004(':') || match$1004('('))) {
                key$1374 = parseObjectPropertyKey$1014();
                expect$1002('(');
                token$1373 = lookahead$961;
                param$1377 = [parseVariableIdentifier$1042()];
                expect$1002(')');
                return delegate$958.createProperty('set', key$1374, parsePropertyFunction$1012({
                    params: param$1377,
                    generator: false,
                    name: token$1373
                }), false, false);
            }
            if (match$1004(':')) {
                lex$995();
                return delegate$958.createProperty('init', id$1375, parseAssignmentExpression$1038(), false, false);
            }
            if (match$1004('(')) {
                return delegate$958.createProperty('init', id$1375, parsePropertyMethodFunction$1013({ generator: false }), true, false);
            }
            return delegate$958.createProperty('init', id$1375, id$1375, false, true);
        }
        if (token$1373.type === Token$939.EOF || token$1373.type === Token$939.Punctuator) {
            if (!match$1004('*')) {
                throwUnexpected$1001(token$1373);
            }
            lex$995();
            id$1375 = parseObjectPropertyKey$1014();
            if (!match$1004('(')) {
                throwUnexpected$1001(lex$995());
            }
            return delegate$958.createProperty('init', id$1375, parsePropertyMethodFunction$1013({ generator: true }), true, false);
        }
        key$1374 = parseObjectPropertyKey$1014();
        if (match$1004(':')) {
            lex$995();
            return delegate$958.createProperty('init', key$1374, parseAssignmentExpression$1038(), false, false);
        }
        if (match$1004('(')) {
            return delegate$958.createProperty('init', key$1374, parsePropertyMethodFunction$1013({ generator: false }), true, false);
        }
        throwUnexpected$1001(lex$995());
    }
    function parseObjectInitialiser$1016() {
        var properties$1378 = [], property$1379, name$1380, key$1381, kind$1382, map$1383 = {}, toString$1384 = String;
        expect$1002('{');
        while (!match$1004('}')) {
            property$1379 = parseObjectProperty$1015();
            if (property$1379.key.type === Syntax$942.Identifier) {
                name$1380 = property$1379.key.name;
            } else {
                name$1380 = toString$1384(property$1379.key.value);
            }
            kind$1382 = property$1379.kind === 'init' ? PropertyKind$943.Data : property$1379.kind === 'get' ? PropertyKind$943.Get : PropertyKind$943.Set;
            key$1381 = '$' + name$1380;
            if (Object.prototype.hasOwnProperty.call(map$1383, key$1381)) {
                if (map$1383[key$1381] === PropertyKind$943.Data) {
                    if (strict$949 && kind$1382 === PropertyKind$943.Data) {
                        throwErrorTolerant$1000({}, Messages$944.StrictDuplicateProperty);
                    } else if (kind$1382 !== PropertyKind$943.Data) {
                        throwErrorTolerant$1000({}, Messages$944.AccessorDataProperty);
                    }
                } else {
                    if (kind$1382 === PropertyKind$943.Data) {
                        throwErrorTolerant$1000({}, Messages$944.AccessorDataProperty);
                    } else if (map$1383[key$1381] & kind$1382) {
                        throwErrorTolerant$1000({}, Messages$944.AccessorGetSet);
                    }
                }
                map$1383[key$1381] |= kind$1382;
            } else {
                map$1383[key$1381] = kind$1382;
            }
            properties$1378.push(property$1379);
            if (!match$1004('}')) {
                expect$1002(',');
            }
        }
        expect$1002('}');
        return delegate$958.createObjectExpression(properties$1378);
    }
    function parseTemplateElement$1017(option$1385) {
        var token$1386 = scanTemplateElement$990(option$1385);
        if (strict$949 && token$1386.octal) {
            throwError$999(token$1386, Messages$944.StrictOctalLiteral);
        }
        return delegate$958.createTemplateElement({
            raw: token$1386.value.raw,
            cooked: token$1386.value.cooked
        }, token$1386.tail);
    }
    function parseTemplateLiteral$1018() {
        var quasi$1387, quasis$1388, expressions$1389;
        quasi$1387 = parseTemplateElement$1017({ head: true });
        quasis$1388 = [quasi$1387];
        expressions$1389 = [];
        while (!quasi$1387.tail) {
            expressions$1389.push(parseExpression$1039());
            quasi$1387 = parseTemplateElement$1017({ head: false });
            quasis$1388.push(quasi$1387);
        }
        return delegate$958.createTemplateLiteral(quasis$1388, expressions$1389);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$1019() {
        var expr$1390;
        expect$1002('(');
        ++state$963.parenthesizedCount;
        expr$1390 = parseExpression$1039();
        expect$1002(')');
        return expr$1390;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$1020() {
        var type$1391, token$1392, resolvedIdent$1393;
        token$1392 = lookahead$961;
        type$1391 = lookahead$961.type;
        if (type$1391 === Token$939.Identifier) {
            resolvedIdent$1393 = expander$938.resolve(tokenStream$959[lookaheadIndex$962]);
            lex$995();
            return delegate$958.createIdentifier(resolvedIdent$1393);
        }
        if (type$1391 === Token$939.StringLiteral || type$1391 === Token$939.NumericLiteral) {
            if (strict$949 && lookahead$961.octal) {
                throwErrorTolerant$1000(lookahead$961, Messages$944.StrictOctalLiteral);
            }
            return delegate$958.createLiteral(lex$995());
        }
        if (type$1391 === Token$939.Keyword) {
            if (matchKeyword$1005('this')) {
                lex$995();
                return delegate$958.createThisExpression();
            }
            if (matchKeyword$1005('function')) {
                return parseFunctionExpression$1077();
            }
            if (matchKeyword$1005('class')) {
                return parseClassExpression$1082();
            }
            if (matchKeyword$1005('super')) {
                lex$995();
                return delegate$958.createIdentifier('super');
            }
        }
        if (type$1391 === Token$939.BooleanLiteral) {
            token$1392 = lex$995();
            token$1392.value = token$1392.value === 'true';
            return delegate$958.createLiteral(token$1392);
        }
        if (type$1391 === Token$939.NullLiteral) {
            token$1392 = lex$995();
            token$1392.value = null;
            return delegate$958.createLiteral(token$1392);
        }
        if (match$1004('[')) {
            return parseArrayInitialiser$1011();
        }
        if (match$1004('{')) {
            return parseObjectInitialiser$1016();
        }
        if (match$1004('(')) {
            return parseGroupExpression$1019();
        }
        if (lookahead$961.type === Token$939.RegularExpression) {
            return delegate$958.createLiteral(lex$995());
        }
        if (type$1391 === Token$939.Template) {
            return parseTemplateLiteral$1018();
        }
        return throwUnexpected$1001(lex$995());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$1021() {
        var args$1394 = [], arg$1395;
        expect$1002('(');
        if (!match$1004(')')) {
            while (streamIndex$960 < length$957) {
                arg$1395 = parseSpreadOrAssignmentExpression$1022();
                args$1394.push(arg$1395);
                if (match$1004(')')) {
                    break;
                } else if (arg$1395.type === Syntax$942.SpreadElement) {
                    throwError$999({}, Messages$944.ElementAfterSpreadElement);
                }
                expect$1002(',');
            }
        }
        expect$1002(')');
        return args$1394;
    }
    function parseSpreadOrAssignmentExpression$1022() {
        if (match$1004('...')) {
            lex$995();
            return delegate$958.createSpreadElement(parseAssignmentExpression$1038());
        }
        return parseAssignmentExpression$1038();
    }
    function parseNonComputedProperty$1023() {
        var token$1396 = lex$995();
        if (!isIdentifierName$992(token$1396)) {
            throwUnexpected$1001(token$1396);
        }
        return delegate$958.createIdentifier(token$1396.value);
    }
    function parseNonComputedMember$1024() {
        expect$1002('.');
        return parseNonComputedProperty$1023();
    }
    function parseComputedMember$1025() {
        var expr$1397;
        expect$1002('[');
        expr$1397 = parseExpression$1039();
        expect$1002(']');
        return expr$1397;
    }
    function parseNewExpression$1026() {
        var callee$1398, args$1399;
        expectKeyword$1003('new');
        callee$1398 = parseLeftHandSideExpression$1028();
        args$1399 = match$1004('(') ? parseArguments$1021() : [];
        return delegate$958.createNewExpression(callee$1398, args$1399);
    }
    function parseLeftHandSideExpressionAllowCall$1027() {
        var expr$1400, args$1401, property$1402;
        expr$1400 = matchKeyword$1005('new') ? parseNewExpression$1026() : parsePrimaryExpression$1020();
        while (match$1004('.') || match$1004('[') || match$1004('(') || lookahead$961.type === Token$939.Template) {
            if (match$1004('(')) {
                args$1401 = parseArguments$1021();
                expr$1400 = delegate$958.createCallExpression(expr$1400, args$1401);
            } else if (match$1004('[')) {
                expr$1400 = delegate$958.createMemberExpression('[', expr$1400, parseComputedMember$1025());
            } else if (match$1004('.')) {
                expr$1400 = delegate$958.createMemberExpression('.', expr$1400, parseNonComputedMember$1024());
            } else {
                expr$1400 = delegate$958.createTaggedTemplateExpression(expr$1400, parseTemplateLiteral$1018());
            }
        }
        return expr$1400;
    }
    function parseLeftHandSideExpression$1028() {
        var expr$1403, property$1404;
        expr$1403 = matchKeyword$1005('new') ? parseNewExpression$1026() : parsePrimaryExpression$1020();
        while (match$1004('.') || match$1004('[') || lookahead$961.type === Token$939.Template) {
            if (match$1004('[')) {
                expr$1403 = delegate$958.createMemberExpression('[', expr$1403, parseComputedMember$1025());
            } else if (match$1004('.')) {
                expr$1403 = delegate$958.createMemberExpression('.', expr$1403, parseNonComputedMember$1024());
            } else {
                expr$1403 = delegate$958.createTaggedTemplateExpression(expr$1403, parseTemplateLiteral$1018());
            }
        }
        return expr$1403;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$1029() {
        var expr$1405 = parseLeftHandSideExpressionAllowCall$1027(), token$1406 = lookahead$961;
        if (lookahead$961.type !== Token$939.Punctuator) {
            return expr$1405;
        }
        if ((match$1004('++') || match$1004('--')) && !peekLineTerminator$998()) {
            // 11.3.1, 11.3.2
            if (strict$949 && expr$1405.type === Syntax$942.Identifier && isRestrictedWord$976(expr$1405.name)) {
                throwErrorTolerant$1000({}, Messages$944.StrictLHSPostfix);
            }
            if (!isLeftHandSide$1009(expr$1405)) {
                throwError$999({}, Messages$944.InvalidLHSInAssignment);
            }
            token$1406 = lex$995();
            expr$1405 = delegate$958.createPostfixExpression(token$1406.value, expr$1405);
        }
        return expr$1405;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$1030() {
        var token$1407, expr$1408;
        if (lookahead$961.type !== Token$939.Punctuator && lookahead$961.type !== Token$939.Keyword) {
            return parsePostfixExpression$1029();
        }
        if (match$1004('++') || match$1004('--')) {
            token$1407 = lex$995();
            expr$1408 = parseUnaryExpression$1030();
            // 11.4.4, 11.4.5
            if (strict$949 && expr$1408.type === Syntax$942.Identifier && isRestrictedWord$976(expr$1408.name)) {
                throwErrorTolerant$1000({}, Messages$944.StrictLHSPrefix);
            }
            if (!isLeftHandSide$1009(expr$1408)) {
                throwError$999({}, Messages$944.InvalidLHSInAssignment);
            }
            return delegate$958.createUnaryExpression(token$1407.value, expr$1408);
        }
        if (match$1004('+') || match$1004('-') || match$1004('~') || match$1004('!')) {
            token$1407 = lex$995();
            expr$1408 = parseUnaryExpression$1030();
            return delegate$958.createUnaryExpression(token$1407.value, expr$1408);
        }
        if (matchKeyword$1005('delete') || matchKeyword$1005('void') || matchKeyword$1005('typeof')) {
            token$1407 = lex$995();
            expr$1408 = parseUnaryExpression$1030();
            expr$1408 = delegate$958.createUnaryExpression(token$1407.value, expr$1408);
            if (strict$949 && expr$1408.operator === 'delete' && expr$1408.argument.type === Syntax$942.Identifier) {
                throwErrorTolerant$1000({}, Messages$944.StrictDelete);
            }
            return expr$1408;
        }
        return parsePostfixExpression$1029();
    }
    function binaryPrecedence$1031(token$1409, allowIn$1410) {
        var prec$1411 = 0;
        if (token$1409.type !== Token$939.Punctuator && token$1409.type !== Token$939.Keyword) {
            return 0;
        }
        switch (token$1409.value) {
        case '||':
            prec$1411 = 1;
            break;
        case '&&':
            prec$1411 = 2;
            break;
        case '|':
            prec$1411 = 3;
            break;
        case '^':
            prec$1411 = 4;
            break;
        case '&':
            prec$1411 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1411 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1411 = 7;
            break;
        case 'in':
            prec$1411 = allowIn$1410 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1411 = 8;
            break;
        case '+':
        case '-':
            prec$1411 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1411 = 11;
            break;
        default:
            break;
        }
        return prec$1411;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$1032() {
        var expr$1412, token$1413, prec$1414, previousAllowIn$1415, stack$1416, right$1417, operator$1418, left$1419, i$1420;
        previousAllowIn$1415 = state$963.allowIn;
        state$963.allowIn = true;
        expr$1412 = parseUnaryExpression$1030();
        token$1413 = lookahead$961;
        prec$1414 = binaryPrecedence$1031(token$1413, previousAllowIn$1415);
        if (prec$1414 === 0) {
            return expr$1412;
        }
        token$1413.prec = prec$1414;
        lex$995();
        stack$1416 = [
            expr$1412,
            token$1413,
            parseUnaryExpression$1030()
        ];
        while ((prec$1414 = binaryPrecedence$1031(lookahead$961, previousAllowIn$1415)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1416.length > 2 && prec$1414 <= stack$1416[stack$1416.length - 2].prec) {
                right$1417 = stack$1416.pop();
                operator$1418 = stack$1416.pop().value;
                left$1419 = stack$1416.pop();
                stack$1416.push(delegate$958.createBinaryExpression(operator$1418, left$1419, right$1417));
            }
            // Shift.
            token$1413 = lex$995();
            token$1413.prec = prec$1414;
            stack$1416.push(token$1413);
            stack$1416.push(parseUnaryExpression$1030());
        }
        state$963.allowIn = previousAllowIn$1415;
        // Final reduce to clean-up the stack.
        i$1420 = stack$1416.length - 1;
        expr$1412 = stack$1416[i$1420];
        while (i$1420 > 1) {
            expr$1412 = delegate$958.createBinaryExpression(stack$1416[i$1420 - 1].value, stack$1416[i$1420 - 2], expr$1412);
            i$1420 -= 2;
        }
        return expr$1412;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$1033() {
        var expr$1421, previousAllowIn$1422, consequent$1423, alternate$1424;
        expr$1421 = parseBinaryExpression$1032();
        if (match$1004('?')) {
            lex$995();
            previousAllowIn$1422 = state$963.allowIn;
            state$963.allowIn = true;
            consequent$1423 = parseAssignmentExpression$1038();
            state$963.allowIn = previousAllowIn$1422;
            expect$1002(':');
            alternate$1424 = parseAssignmentExpression$1038();
            expr$1421 = delegate$958.createConditionalExpression(expr$1421, consequent$1423, alternate$1424);
        }
        return expr$1421;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$1034(expr$1425) {
        var i$1426, len$1427, property$1428, element$1429;
        if (expr$1425.type === Syntax$942.ObjectExpression) {
            expr$1425.type = Syntax$942.ObjectPattern;
            for (i$1426 = 0, len$1427 = expr$1425.properties.length; i$1426 < len$1427; i$1426 += 1) {
                property$1428 = expr$1425.properties[i$1426];
                if (property$1428.kind !== 'init') {
                    throwError$999({}, Messages$944.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$1034(property$1428.value);
            }
        } else if (expr$1425.type === Syntax$942.ArrayExpression) {
            expr$1425.type = Syntax$942.ArrayPattern;
            for (i$1426 = 0, len$1427 = expr$1425.elements.length; i$1426 < len$1427; i$1426 += 1) {
                element$1429 = expr$1425.elements[i$1426];
                if (element$1429) {
                    reinterpretAsAssignmentBindingPattern$1034(element$1429);
                }
            }
        } else if (expr$1425.type === Syntax$942.Identifier) {
            if (isRestrictedWord$976(expr$1425.name)) {
                throwError$999({}, Messages$944.InvalidLHSInAssignment);
            }
        } else if (expr$1425.type === Syntax$942.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$1034(expr$1425.argument);
            if (expr$1425.argument.type === Syntax$942.ObjectPattern) {
                throwError$999({}, Messages$944.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1425.type !== Syntax$942.MemberExpression && expr$1425.type !== Syntax$942.CallExpression && expr$1425.type !== Syntax$942.NewExpression) {
                throwError$999({}, Messages$944.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$1035(options$1430, expr$1431) {
        var i$1432, len$1433, property$1434, element$1435;
        if (expr$1431.type === Syntax$942.ObjectExpression) {
            expr$1431.type = Syntax$942.ObjectPattern;
            for (i$1432 = 0, len$1433 = expr$1431.properties.length; i$1432 < len$1433; i$1432 += 1) {
                property$1434 = expr$1431.properties[i$1432];
                if (property$1434.kind !== 'init') {
                    throwError$999({}, Messages$944.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$1035(options$1430, property$1434.value);
            }
        } else if (expr$1431.type === Syntax$942.ArrayExpression) {
            expr$1431.type = Syntax$942.ArrayPattern;
            for (i$1432 = 0, len$1433 = expr$1431.elements.length; i$1432 < len$1433; i$1432 += 1) {
                element$1435 = expr$1431.elements[i$1432];
                if (element$1435) {
                    reinterpretAsDestructuredParameter$1035(options$1430, element$1435);
                }
            }
        } else if (expr$1431.type === Syntax$942.Identifier) {
            validateParam$1073(options$1430, expr$1431, expr$1431.name);
        } else {
            if (expr$1431.type !== Syntax$942.MemberExpression) {
                throwError$999({}, Messages$944.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$1036(expressions$1436) {
        var i$1437, len$1438, param$1439, params$1440, defaults$1441, defaultCount$1442, options$1443, rest$1444;
        params$1440 = [];
        defaults$1441 = [];
        defaultCount$1442 = 0;
        rest$1444 = null;
        options$1443 = { paramSet: {} };
        for (i$1437 = 0, len$1438 = expressions$1436.length; i$1437 < len$1438; i$1437 += 1) {
            param$1439 = expressions$1436[i$1437];
            if (param$1439.type === Syntax$942.Identifier) {
                params$1440.push(param$1439);
                defaults$1441.push(null);
                validateParam$1073(options$1443, param$1439, param$1439.name);
            } else if (param$1439.type === Syntax$942.ObjectExpression || param$1439.type === Syntax$942.ArrayExpression) {
                reinterpretAsDestructuredParameter$1035(options$1443, param$1439);
                params$1440.push(param$1439);
                defaults$1441.push(null);
            } else if (param$1439.type === Syntax$942.SpreadElement) {
                assert$965(i$1437 === len$1438 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$1035(options$1443, param$1439.argument);
                rest$1444 = param$1439.argument;
            } else if (param$1439.type === Syntax$942.AssignmentExpression) {
                params$1440.push(param$1439.left);
                defaults$1441.push(param$1439.right);
                ++defaultCount$1442;
                validateParam$1073(options$1443, param$1439.left, param$1439.left.name);
            } else {
                return null;
            }
        }
        if (options$1443.message === Messages$944.StrictParamDupe) {
            throwError$999(strict$949 ? options$1443.stricted : options$1443.firstRestricted, options$1443.message);
        }
        if (defaultCount$1442 === 0) {
            defaults$1441 = [];
        }
        return {
            params: params$1440,
            defaults: defaults$1441,
            rest: rest$1444,
            stricted: options$1443.stricted,
            firstRestricted: options$1443.firstRestricted,
            message: options$1443.message
        };
    }
    function parseArrowFunctionExpression$1037(options$1445) {
        var previousStrict$1446, previousYieldAllowed$1447, body$1448;
        expect$1002('=>');
        previousStrict$1446 = strict$949;
        previousYieldAllowed$1447 = state$963.yieldAllowed;
        state$963.yieldAllowed = false;
        body$1448 = parseConciseBody$1071();
        if (strict$949 && options$1445.firstRestricted) {
            throwError$999(options$1445.firstRestricted, options$1445.message);
        }
        if (strict$949 && options$1445.stricted) {
            throwErrorTolerant$1000(options$1445.stricted, options$1445.message);
        }
        strict$949 = previousStrict$1446;
        state$963.yieldAllowed = previousYieldAllowed$1447;
        return delegate$958.createArrowFunctionExpression(options$1445.params, options$1445.defaults, body$1448, options$1445.rest, body$1448.type !== Syntax$942.BlockStatement);
    }
    function parseAssignmentExpression$1038() {
        var expr$1449, token$1450, params$1451, oldParenthesizedCount$1452;
        if (matchKeyword$1005('yield')) {
            return parseYieldExpression$1078();
        }
        oldParenthesizedCount$1452 = state$963.parenthesizedCount;
        if (match$1004('(')) {
            token$1450 = lookahead2$997();
            if (token$1450.type === Token$939.Punctuator && token$1450.value === ')' || token$1450.value === '...') {
                params$1451 = parseParams$1075();
                if (!match$1004('=>')) {
                    throwUnexpected$1001(lex$995());
                }
                return parseArrowFunctionExpression$1037(params$1451);
            }
        }
        token$1450 = lookahead$961;
        expr$1449 = parseConditionalExpression$1033();
        if (match$1004('=>') && (state$963.parenthesizedCount === oldParenthesizedCount$1452 || state$963.parenthesizedCount === oldParenthesizedCount$1452 + 1)) {
            if (expr$1449.type === Syntax$942.Identifier) {
                params$1451 = reinterpretAsCoverFormalsList$1036([expr$1449]);
            } else if (expr$1449.type === Syntax$942.SequenceExpression) {
                params$1451 = reinterpretAsCoverFormalsList$1036(expr$1449.expressions);
            }
            if (params$1451) {
                return parseArrowFunctionExpression$1037(params$1451);
            }
        }
        if (matchAssign$1007()) {
            // 11.13.1
            if (strict$949 && expr$1449.type === Syntax$942.Identifier && isRestrictedWord$976(expr$1449.name)) {
                throwErrorTolerant$1000(token$1450, Messages$944.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$1004('=') && (expr$1449.type === Syntax$942.ObjectExpression || expr$1449.type === Syntax$942.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$1034(expr$1449);
            } else if (!isLeftHandSide$1009(expr$1449)) {
                throwError$999({}, Messages$944.InvalidLHSInAssignment);
            }
            expr$1449 = delegate$958.createAssignmentExpression(lex$995().value, expr$1449, parseAssignmentExpression$1038());
        }
        return expr$1449;
    }
    // 11.14 Comma Operator
    function parseExpression$1039() {
        var expr$1453, expressions$1454, sequence$1455, coverFormalsList$1456, spreadFound$1457, oldParenthesizedCount$1458;
        oldParenthesizedCount$1458 = state$963.parenthesizedCount;
        expr$1453 = parseAssignmentExpression$1038();
        expressions$1454 = [expr$1453];
        if (match$1004(',')) {
            while (streamIndex$960 < length$957) {
                if (!match$1004(',')) {
                    break;
                }
                lex$995();
                expr$1453 = parseSpreadOrAssignmentExpression$1022();
                expressions$1454.push(expr$1453);
                if (expr$1453.type === Syntax$942.SpreadElement) {
                    spreadFound$1457 = true;
                    if (!match$1004(')')) {
                        throwError$999({}, Messages$944.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1455 = delegate$958.createSequenceExpression(expressions$1454);
        }
        if (match$1004('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$963.parenthesizedCount === oldParenthesizedCount$1458 || state$963.parenthesizedCount === oldParenthesizedCount$1458 + 1) {
                expr$1453 = expr$1453.type === Syntax$942.SequenceExpression ? expr$1453.expressions : expressions$1454;
                coverFormalsList$1456 = reinterpretAsCoverFormalsList$1036(expr$1453);
                if (coverFormalsList$1456) {
                    return parseArrowFunctionExpression$1037(coverFormalsList$1456);
                }
            }
            throwUnexpected$1001(lex$995());
        }
        if (spreadFound$1457 && lookahead2$997().value !== '=>') {
            throwError$999({}, Messages$944.IllegalSpread);
        }
        return sequence$1455 || expr$1453;
    }
    // 12.1 Block
    function parseStatementList$1040() {
        var list$1459 = [], statement$1460;
        while (streamIndex$960 < length$957) {
            if (match$1004('}')) {
                break;
            }
            statement$1460 = parseSourceElement$1085();
            if (typeof statement$1460 === 'undefined') {
                break;
            }
            list$1459.push(statement$1460);
        }
        return list$1459;
    }
    function parseBlock$1041() {
        var block$1461;
        expect$1002('{');
        block$1461 = parseStatementList$1040();
        expect$1002('}');
        return delegate$958.createBlockStatement(block$1461);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$1042() {
        var token$1462 = lookahead$961, resolvedIdent$1463;
        if (token$1462.type !== Token$939.Identifier) {
            throwUnexpected$1001(token$1462);
        }
        resolvedIdent$1463 = expander$938.resolve(tokenStream$959[lookaheadIndex$962]);
        lex$995();
        return delegate$958.createIdentifier(resolvedIdent$1463);
    }
    function parseVariableDeclaration$1043(kind$1464) {
        var id$1465, init$1466 = null;
        if (match$1004('{')) {
            id$1465 = parseObjectInitialiser$1016();
            reinterpretAsAssignmentBindingPattern$1034(id$1465);
        } else if (match$1004('[')) {
            id$1465 = parseArrayInitialiser$1011();
            reinterpretAsAssignmentBindingPattern$1034(id$1465);
        } else {
            id$1465 = state$963.allowKeyword ? parseNonComputedProperty$1023() : parseVariableIdentifier$1042();
            // 12.2.1
            if (strict$949 && isRestrictedWord$976(id$1465.name)) {
                throwErrorTolerant$1000({}, Messages$944.StrictVarName);
            }
        }
        if (kind$1464 === 'const') {
            if (!match$1004('=')) {
                throwError$999({}, Messages$944.NoUnintializedConst);
            }
            expect$1002('=');
            init$1466 = parseAssignmentExpression$1038();
        } else if (match$1004('=')) {
            lex$995();
            init$1466 = parseAssignmentExpression$1038();
        }
        return delegate$958.createVariableDeclarator(id$1465, init$1466);
    }
    function parseVariableDeclarationList$1044(kind$1467) {
        var list$1468 = [];
        do {
            list$1468.push(parseVariableDeclaration$1043(kind$1467));
            if (!match$1004(',')) {
                break;
            }
            lex$995();
        } while (streamIndex$960 < length$957);
        return list$1468;
    }
    function parseVariableStatement$1045() {
        var declarations$1469;
        expectKeyword$1003('var');
        declarations$1469 = parseVariableDeclarationList$1044();
        consumeSemicolon$1008();
        return delegate$958.createVariableDeclaration(declarations$1469, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$1046(kind$1470) {
        var declarations$1471;
        expectKeyword$1003(kind$1470);
        declarations$1471 = parseVariableDeclarationList$1044(kind$1470);
        consumeSemicolon$1008();
        return delegate$958.createVariableDeclaration(declarations$1471, kind$1470);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$1047() {
        var id$1472, src$1473, body$1474;
        lex$995();
        // 'module'
        if (peekLineTerminator$998()) {
            throwError$999({}, Messages$944.NewlineAfterModule);
        }
        switch (lookahead$961.type) {
        case Token$939.StringLiteral:
            id$1472 = parsePrimaryExpression$1020();
            body$1474 = parseModuleBlock$1090();
            src$1473 = null;
            break;
        case Token$939.Identifier:
            id$1472 = parseVariableIdentifier$1042();
            body$1474 = null;
            if (!matchContextualKeyword$1006('from')) {
                throwUnexpected$1001(lex$995());
            }
            lex$995();
            src$1473 = parsePrimaryExpression$1020();
            if (src$1473.type !== Syntax$942.Literal) {
                throwError$999({}, Messages$944.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$1008();
        return delegate$958.createModuleDeclaration(id$1472, src$1473, body$1474);
    }
    function parseExportBatchSpecifier$1048() {
        expect$1002('*');
        return delegate$958.createExportBatchSpecifier();
    }
    function parseExportSpecifier$1049() {
        var id$1475, name$1476 = null;
        id$1475 = parseVariableIdentifier$1042();
        if (matchContextualKeyword$1006('as')) {
            lex$995();
            name$1476 = parseNonComputedProperty$1023();
        }
        return delegate$958.createExportSpecifier(id$1475, name$1476);
    }
    function parseExportDeclaration$1050() {
        var previousAllowKeyword$1477, decl$1478, def$1479, src$1480, specifiers$1481;
        expectKeyword$1003('export');
        if (lookahead$961.type === Token$939.Keyword) {
            switch (lookahead$961.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$958.createExportDeclaration(parseSourceElement$1085(), null, null);
            }
        }
        if (isIdentifierName$992(lookahead$961)) {
            previousAllowKeyword$1477 = state$963.allowKeyword;
            state$963.allowKeyword = true;
            decl$1478 = parseVariableDeclarationList$1044('let');
            state$963.allowKeyword = previousAllowKeyword$1477;
            return delegate$958.createExportDeclaration(decl$1478, null, null);
        }
        specifiers$1481 = [];
        src$1480 = null;
        if (match$1004('*')) {
            specifiers$1481.push(parseExportBatchSpecifier$1048());
        } else {
            expect$1002('{');
            do {
                specifiers$1481.push(parseExportSpecifier$1049());
            } while (match$1004(',') && lex$995());
            expect$1002('}');
        }
        if (matchContextualKeyword$1006('from')) {
            lex$995();
            src$1480 = parsePrimaryExpression$1020();
            if (src$1480.type !== Syntax$942.Literal) {
                throwError$999({}, Messages$944.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$1008();
        return delegate$958.createExportDeclaration(null, specifiers$1481, src$1480);
    }
    function parseImportDeclaration$1051() {
        var specifiers$1482, kind$1483, src$1484;
        expectKeyword$1003('import');
        specifiers$1482 = [];
        if (isIdentifierName$992(lookahead$961)) {
            kind$1483 = 'default';
            specifiers$1482.push(parseImportSpecifier$1052());
            if (!matchContextualKeyword$1006('from')) {
                throwError$999({}, Messages$944.NoFromAfterImport);
            }
            lex$995();
        } else if (match$1004('{')) {
            kind$1483 = 'named';
            lex$995();
            do {
                specifiers$1482.push(parseImportSpecifier$1052());
            } while (match$1004(',') && lex$995());
            expect$1002('}');
            if (!matchContextualKeyword$1006('from')) {
                throwError$999({}, Messages$944.NoFromAfterImport);
            }
            lex$995();
        }
        src$1484 = parsePrimaryExpression$1020();
        if (src$1484.type !== Syntax$942.Literal) {
            throwError$999({}, Messages$944.InvalidModuleSpecifier);
        }
        consumeSemicolon$1008();
        return delegate$958.createImportDeclaration(specifiers$1482, kind$1483, src$1484);
    }
    function parseImportSpecifier$1052() {
        var id$1485, name$1486 = null;
        id$1485 = parseNonComputedProperty$1023();
        if (matchContextualKeyword$1006('as')) {
            lex$995();
            name$1486 = parseVariableIdentifier$1042();
        }
        return delegate$958.createImportSpecifier(id$1485, name$1486);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$1053() {
        expect$1002(';');
        return delegate$958.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$1054() {
        var expr$1487 = parseExpression$1039();
        consumeSemicolon$1008();
        return delegate$958.createExpressionStatement(expr$1487);
    }
    // 12.5 If statement
    function parseIfStatement$1055() {
        var test$1488, consequent$1489, alternate$1490;
        expectKeyword$1003('if');
        expect$1002('(');
        test$1488 = parseExpression$1039();
        expect$1002(')');
        consequent$1489 = parseStatement$1070();
        if (matchKeyword$1005('else')) {
            lex$995();
            alternate$1490 = parseStatement$1070();
        } else {
            alternate$1490 = null;
        }
        return delegate$958.createIfStatement(test$1488, consequent$1489, alternate$1490);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$1056() {
        var body$1491, test$1492, oldInIteration$1493;
        expectKeyword$1003('do');
        oldInIteration$1493 = state$963.inIteration;
        state$963.inIteration = true;
        body$1491 = parseStatement$1070();
        state$963.inIteration = oldInIteration$1493;
        expectKeyword$1003('while');
        expect$1002('(');
        test$1492 = parseExpression$1039();
        expect$1002(')');
        if (match$1004(';')) {
            lex$995();
        }
        return delegate$958.createDoWhileStatement(body$1491, test$1492);
    }
    function parseWhileStatement$1057() {
        var test$1494, body$1495, oldInIteration$1496;
        expectKeyword$1003('while');
        expect$1002('(');
        test$1494 = parseExpression$1039();
        expect$1002(')');
        oldInIteration$1496 = state$963.inIteration;
        state$963.inIteration = true;
        body$1495 = parseStatement$1070();
        state$963.inIteration = oldInIteration$1496;
        return delegate$958.createWhileStatement(test$1494, body$1495);
    }
    function parseForVariableDeclaration$1058() {
        var token$1497 = lex$995(), declarations$1498 = parseVariableDeclarationList$1044();
        return delegate$958.createVariableDeclaration(declarations$1498, token$1497.value);
    }
    function parseForStatement$1059(opts$1499) {
        var init$1500, test$1501, update$1502, left$1503, right$1504, body$1505, operator$1506, oldInIteration$1507;
        init$1500 = test$1501 = update$1502 = null;
        expectKeyword$1003('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$1006('each')) {
            throwError$999({}, Messages$944.EachNotAllowed);
        }
        expect$1002('(');
        if (match$1004(';')) {
            lex$995();
        } else {
            if (matchKeyword$1005('var') || matchKeyword$1005('let') || matchKeyword$1005('const')) {
                state$963.allowIn = false;
                init$1500 = parseForVariableDeclaration$1058();
                state$963.allowIn = true;
                if (init$1500.declarations.length === 1) {
                    if (matchKeyword$1005('in') || matchContextualKeyword$1006('of')) {
                        operator$1506 = lookahead$961;
                        if (!((operator$1506.value === 'in' || init$1500.kind !== 'var') && init$1500.declarations[0].init)) {
                            lex$995();
                            left$1503 = init$1500;
                            right$1504 = parseExpression$1039();
                            init$1500 = null;
                        }
                    }
                }
            } else {
                state$963.allowIn = false;
                init$1500 = parseExpression$1039();
                state$963.allowIn = true;
                if (matchContextualKeyword$1006('of')) {
                    operator$1506 = lex$995();
                    left$1503 = init$1500;
                    right$1504 = parseExpression$1039();
                    init$1500 = null;
                } else if (matchKeyword$1005('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$1010(init$1500)) {
                        throwError$999({}, Messages$944.InvalidLHSInForIn);
                    }
                    operator$1506 = lex$995();
                    left$1503 = init$1500;
                    right$1504 = parseExpression$1039();
                    init$1500 = null;
                }
            }
            if (typeof left$1503 === 'undefined') {
                expect$1002(';');
            }
        }
        if (typeof left$1503 === 'undefined') {
            if (!match$1004(';')) {
                test$1501 = parseExpression$1039();
            }
            expect$1002(';');
            if (!match$1004(')')) {
                update$1502 = parseExpression$1039();
            }
        }
        expect$1002(')');
        oldInIteration$1507 = state$963.inIteration;
        state$963.inIteration = true;
        if (!(opts$1499 !== undefined && opts$1499.ignoreBody)) {
            body$1505 = parseStatement$1070();
        }
        state$963.inIteration = oldInIteration$1507;
        if (typeof left$1503 === 'undefined') {
            return delegate$958.createForStatement(init$1500, test$1501, update$1502, body$1505);
        }
        if (operator$1506.value === 'in') {
            return delegate$958.createForInStatement(left$1503, right$1504, body$1505);
        }
        return delegate$958.createForOfStatement(left$1503, right$1504, body$1505);
    }
    // 12.7 The continue statement
    function parseContinueStatement$1060() {
        var label$1508 = null, key$1509;
        expectKeyword$1003('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$961.value.charCodeAt(0) === 59) {
            lex$995();
            if (!state$963.inIteration) {
                throwError$999({}, Messages$944.IllegalContinue);
            }
            return delegate$958.createContinueStatement(null);
        }
        if (peekLineTerminator$998()) {
            if (!state$963.inIteration) {
                throwError$999({}, Messages$944.IllegalContinue);
            }
            return delegate$958.createContinueStatement(null);
        }
        if (lookahead$961.type === Token$939.Identifier) {
            label$1508 = parseVariableIdentifier$1042();
            key$1509 = '$' + label$1508.name;
            if (!Object.prototype.hasOwnProperty.call(state$963.labelSet, key$1509)) {
                throwError$999({}, Messages$944.UnknownLabel, label$1508.name);
            }
        }
        consumeSemicolon$1008();
        if (label$1508 === null && !state$963.inIteration) {
            throwError$999({}, Messages$944.IllegalContinue);
        }
        return delegate$958.createContinueStatement(label$1508);
    }
    // 12.8 The break statement
    function parseBreakStatement$1061() {
        var label$1510 = null, key$1511;
        expectKeyword$1003('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$961.value.charCodeAt(0) === 59) {
            lex$995();
            if (!(state$963.inIteration || state$963.inSwitch)) {
                throwError$999({}, Messages$944.IllegalBreak);
            }
            return delegate$958.createBreakStatement(null);
        }
        if (peekLineTerminator$998()) {
            if (!(state$963.inIteration || state$963.inSwitch)) {
                throwError$999({}, Messages$944.IllegalBreak);
            }
            return delegate$958.createBreakStatement(null);
        }
        if (lookahead$961.type === Token$939.Identifier) {
            label$1510 = parseVariableIdentifier$1042();
            key$1511 = '$' + label$1510.name;
            if (!Object.prototype.hasOwnProperty.call(state$963.labelSet, key$1511)) {
                throwError$999({}, Messages$944.UnknownLabel, label$1510.name);
            }
        }
        consumeSemicolon$1008();
        if (label$1510 === null && !(state$963.inIteration || state$963.inSwitch)) {
            throwError$999({}, Messages$944.IllegalBreak);
        }
        return delegate$958.createBreakStatement(label$1510);
    }
    // 12.9 The return statement
    function parseReturnStatement$1062() {
        var argument$1512 = null;
        expectKeyword$1003('return');
        if (!state$963.inFunctionBody) {
            throwErrorTolerant$1000({}, Messages$944.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$972(String(lookahead$961.value).charCodeAt(0))) {
            argument$1512 = parseExpression$1039();
            consumeSemicolon$1008();
            return delegate$958.createReturnStatement(argument$1512);
        }
        if (peekLineTerminator$998()) {
            return delegate$958.createReturnStatement(null);
        }
        if (!match$1004(';')) {
            if (!match$1004('}') && lookahead$961.type !== Token$939.EOF) {
                argument$1512 = parseExpression$1039();
            }
        }
        consumeSemicolon$1008();
        return delegate$958.createReturnStatement(argument$1512);
    }
    // 12.10 The with statement
    function parseWithStatement$1063() {
        var object$1513, body$1514;
        if (strict$949) {
            throwErrorTolerant$1000({}, Messages$944.StrictModeWith);
        }
        expectKeyword$1003('with');
        expect$1002('(');
        object$1513 = parseExpression$1039();
        expect$1002(')');
        body$1514 = parseStatement$1070();
        return delegate$958.createWithStatement(object$1513, body$1514);
    }
    // 12.10 The swith statement
    function parseSwitchCase$1064() {
        var test$1515, consequent$1516 = [], sourceElement$1517;
        if (matchKeyword$1005('default')) {
            lex$995();
            test$1515 = null;
        } else {
            expectKeyword$1003('case');
            test$1515 = parseExpression$1039();
        }
        expect$1002(':');
        while (streamIndex$960 < length$957) {
            if (match$1004('}') || matchKeyword$1005('default') || matchKeyword$1005('case')) {
                break;
            }
            sourceElement$1517 = parseSourceElement$1085();
            if (typeof sourceElement$1517 === 'undefined') {
                break;
            }
            consequent$1516.push(sourceElement$1517);
        }
        return delegate$958.createSwitchCase(test$1515, consequent$1516);
    }
    function parseSwitchStatement$1065() {
        var discriminant$1518, cases$1519, clause$1520, oldInSwitch$1521, defaultFound$1522;
        expectKeyword$1003('switch');
        expect$1002('(');
        discriminant$1518 = parseExpression$1039();
        expect$1002(')');
        expect$1002('{');
        cases$1519 = [];
        if (match$1004('}')) {
            lex$995();
            return delegate$958.createSwitchStatement(discriminant$1518, cases$1519);
        }
        oldInSwitch$1521 = state$963.inSwitch;
        state$963.inSwitch = true;
        defaultFound$1522 = false;
        while (streamIndex$960 < length$957) {
            if (match$1004('}')) {
                break;
            }
            clause$1520 = parseSwitchCase$1064();
            if (clause$1520.test === null) {
                if (defaultFound$1522) {
                    throwError$999({}, Messages$944.MultipleDefaultsInSwitch);
                }
                defaultFound$1522 = true;
            }
            cases$1519.push(clause$1520);
        }
        state$963.inSwitch = oldInSwitch$1521;
        expect$1002('}');
        return delegate$958.createSwitchStatement(discriminant$1518, cases$1519);
    }
    // 12.13 The throw statement
    function parseThrowStatement$1066() {
        var argument$1523;
        expectKeyword$1003('throw');
        if (peekLineTerminator$998()) {
            throwError$999({}, Messages$944.NewlineAfterThrow);
        }
        argument$1523 = parseExpression$1039();
        consumeSemicolon$1008();
        return delegate$958.createThrowStatement(argument$1523);
    }
    // 12.14 The try statement
    function parseCatchClause$1067() {
        var param$1524, body$1525;
        expectKeyword$1003('catch');
        expect$1002('(');
        if (match$1004(')')) {
            throwUnexpected$1001(lookahead$961);
        }
        param$1524 = parseExpression$1039();
        // 12.14.1
        if (strict$949 && param$1524.type === Syntax$942.Identifier && isRestrictedWord$976(param$1524.name)) {
            throwErrorTolerant$1000({}, Messages$944.StrictCatchVariable);
        }
        expect$1002(')');
        body$1525 = parseBlock$1041();
        return delegate$958.createCatchClause(param$1524, body$1525);
    }
    function parseTryStatement$1068() {
        var block$1526, handlers$1527 = [], finalizer$1528 = null;
        expectKeyword$1003('try');
        block$1526 = parseBlock$1041();
        if (matchKeyword$1005('catch')) {
            handlers$1527.push(parseCatchClause$1067());
        }
        if (matchKeyword$1005('finally')) {
            lex$995();
            finalizer$1528 = parseBlock$1041();
        }
        if (handlers$1527.length === 0 && !finalizer$1528) {
            throwError$999({}, Messages$944.NoCatchOrFinally);
        }
        return delegate$958.createTryStatement(block$1526, [], handlers$1527, finalizer$1528);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$1069() {
        expectKeyword$1003('debugger');
        consumeSemicolon$1008();
        return delegate$958.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$1070() {
        var type$1529 = lookahead$961.type, expr$1530, labeledBody$1531, key$1532;
        if (type$1529 === Token$939.EOF) {
            throwUnexpected$1001(lookahead$961);
        }
        if (type$1529 === Token$939.Punctuator) {
            switch (lookahead$961.value) {
            case ';':
                return parseEmptyStatement$1053();
            case '{':
                return parseBlock$1041();
            case '(':
                return parseExpressionStatement$1054();
            default:
                break;
            }
        }
        if (type$1529 === Token$939.Keyword) {
            switch (lookahead$961.value) {
            case 'break':
                return parseBreakStatement$1061();
            case 'continue':
                return parseContinueStatement$1060();
            case 'debugger':
                return parseDebuggerStatement$1069();
            case 'do':
                return parseDoWhileStatement$1056();
            case 'for':
                return parseForStatement$1059();
            case 'function':
                return parseFunctionDeclaration$1076();
            case 'class':
                return parseClassDeclaration$1083();
            case 'if':
                return parseIfStatement$1055();
            case 'return':
                return parseReturnStatement$1062();
            case 'switch':
                return parseSwitchStatement$1065();
            case 'throw':
                return parseThrowStatement$1066();
            case 'try':
                return parseTryStatement$1068();
            case 'var':
                return parseVariableStatement$1045();
            case 'while':
                return parseWhileStatement$1057();
            case 'with':
                return parseWithStatement$1063();
            default:
                break;
            }
        }
        expr$1530 = parseExpression$1039();
        // 12.12 Labelled Statements
        if (expr$1530.type === Syntax$942.Identifier && match$1004(':')) {
            lex$995();
            key$1532 = '$' + expr$1530.name;
            if (Object.prototype.hasOwnProperty.call(state$963.labelSet, key$1532)) {
                throwError$999({}, Messages$944.Redeclaration, 'Label', expr$1530.name);
            }
            state$963.labelSet[key$1532] = true;
            labeledBody$1531 = parseStatement$1070();
            delete state$963.labelSet[key$1532];
            return delegate$958.createLabeledStatement(expr$1530, labeledBody$1531);
        }
        consumeSemicolon$1008();
        return delegate$958.createExpressionStatement(expr$1530);
    }
    // 13 Function Definition
    function parseConciseBody$1071() {
        if (match$1004('{')) {
            return parseFunctionSourceElements$1072();
        }
        return parseAssignmentExpression$1038();
    }
    function parseFunctionSourceElements$1072() {
        var sourceElement$1533, sourceElements$1534 = [], token$1535, directive$1536, firstRestricted$1537, oldLabelSet$1538, oldInIteration$1539, oldInSwitch$1540, oldInFunctionBody$1541, oldParenthesizedCount$1542;
        expect$1002('{');
        while (streamIndex$960 < length$957) {
            if (lookahead$961.type !== Token$939.StringLiteral) {
                break;
            }
            token$1535 = lookahead$961;
            sourceElement$1533 = parseSourceElement$1085();
            sourceElements$1534.push(sourceElement$1533);
            if (sourceElement$1533.expression.type !== Syntax$942.Literal) {
                // this is not directive
                break;
            }
            directive$1536 = token$1535.value;
            if (directive$1536 === 'use strict') {
                strict$949 = true;
                if (firstRestricted$1537) {
                    throwErrorTolerant$1000(firstRestricted$1537, Messages$944.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1537 && token$1535.octal) {
                    firstRestricted$1537 = token$1535;
                }
            }
        }
        oldLabelSet$1538 = state$963.labelSet;
        oldInIteration$1539 = state$963.inIteration;
        oldInSwitch$1540 = state$963.inSwitch;
        oldInFunctionBody$1541 = state$963.inFunctionBody;
        oldParenthesizedCount$1542 = state$963.parenthesizedCount;
        state$963.labelSet = {};
        state$963.inIteration = false;
        state$963.inSwitch = false;
        state$963.inFunctionBody = true;
        state$963.parenthesizedCount = 0;
        while (streamIndex$960 < length$957) {
            if (match$1004('}')) {
                break;
            }
            sourceElement$1533 = parseSourceElement$1085();
            if (typeof sourceElement$1533 === 'undefined') {
                break;
            }
            sourceElements$1534.push(sourceElement$1533);
        }
        expect$1002('}');
        state$963.labelSet = oldLabelSet$1538;
        state$963.inIteration = oldInIteration$1539;
        state$963.inSwitch = oldInSwitch$1540;
        state$963.inFunctionBody = oldInFunctionBody$1541;
        state$963.parenthesizedCount = oldParenthesizedCount$1542;
        return delegate$958.createBlockStatement(sourceElements$1534);
    }
    function validateParam$1073(options$1543, param$1544, name$1545) {
        var key$1546 = '$' + name$1545;
        if (strict$949) {
            if (isRestrictedWord$976(name$1545)) {
                options$1543.stricted = param$1544;
                options$1543.message = Messages$944.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1543.paramSet, key$1546)) {
                options$1543.stricted = param$1544;
                options$1543.message = Messages$944.StrictParamDupe;
            }
        } else if (!options$1543.firstRestricted) {
            if (isRestrictedWord$976(name$1545)) {
                options$1543.firstRestricted = param$1544;
                options$1543.message = Messages$944.StrictParamName;
            } else if (isStrictModeReservedWord$975(name$1545)) {
                options$1543.firstRestricted = param$1544;
                options$1543.message = Messages$944.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1543.paramSet, key$1546)) {
                options$1543.firstRestricted = param$1544;
                options$1543.message = Messages$944.StrictParamDupe;
            }
        }
        options$1543.paramSet[key$1546] = true;
    }
    function parseParam$1074(options$1547) {
        var token$1548, rest$1549, param$1550, def$1551;
        token$1548 = lookahead$961;
        if (token$1548.value === '...') {
            token$1548 = lex$995();
            rest$1549 = true;
        }
        if (match$1004('[')) {
            param$1550 = parseArrayInitialiser$1011();
            reinterpretAsDestructuredParameter$1035(options$1547, param$1550);
        } else if (match$1004('{')) {
            if (rest$1549) {
                throwError$999({}, Messages$944.ObjectPatternAsRestParameter);
            }
            param$1550 = parseObjectInitialiser$1016();
            reinterpretAsDestructuredParameter$1035(options$1547, param$1550);
        } else {
            param$1550 = parseVariableIdentifier$1042();
            validateParam$1073(options$1547, token$1548, token$1548.value);
            if (match$1004('=')) {
                if (rest$1549) {
                    throwErrorTolerant$1000(lookahead$961, Messages$944.DefaultRestParameter);
                }
                lex$995();
                def$1551 = parseAssignmentExpression$1038();
                ++options$1547.defaultCount;
            }
        }
        if (rest$1549) {
            if (!match$1004(')')) {
                throwError$999({}, Messages$944.ParameterAfterRestParameter);
            }
            options$1547.rest = param$1550;
            return false;
        }
        options$1547.params.push(param$1550);
        options$1547.defaults.push(def$1551);
        return !match$1004(')');
    }
    function parseParams$1075(firstRestricted$1552) {
        var options$1553;
        options$1553 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1552
        };
        expect$1002('(');
        if (!match$1004(')')) {
            options$1553.paramSet = {};
            while (streamIndex$960 < length$957) {
                if (!parseParam$1074(options$1553)) {
                    break;
                }
                expect$1002(',');
            }
        }
        expect$1002(')');
        if (options$1553.defaultCount === 0) {
            options$1553.defaults = [];
        }
        return options$1553;
    }
    function parseFunctionDeclaration$1076() {
        var id$1554, body$1555, token$1556, tmp$1557, firstRestricted$1558, message$1559, previousStrict$1560, previousYieldAllowed$1561, generator$1562, expression$1563;
        expectKeyword$1003('function');
        generator$1562 = false;
        if (match$1004('*')) {
            lex$995();
            generator$1562 = true;
        }
        token$1556 = lookahead$961;
        id$1554 = parseVariableIdentifier$1042();
        if (strict$949) {
            if (isRestrictedWord$976(token$1556.value)) {
                throwErrorTolerant$1000(token$1556, Messages$944.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$976(token$1556.value)) {
                firstRestricted$1558 = token$1556;
                message$1559 = Messages$944.StrictFunctionName;
            } else if (isStrictModeReservedWord$975(token$1556.value)) {
                firstRestricted$1558 = token$1556;
                message$1559 = Messages$944.StrictReservedWord;
            }
        }
        tmp$1557 = parseParams$1075(firstRestricted$1558);
        firstRestricted$1558 = tmp$1557.firstRestricted;
        if (tmp$1557.message) {
            message$1559 = tmp$1557.message;
        }
        previousStrict$1560 = strict$949;
        previousYieldAllowed$1561 = state$963.yieldAllowed;
        state$963.yieldAllowed = generator$1562;
        // here we redo some work in order to set 'expression'
        expression$1563 = !match$1004('{');
        body$1555 = parseConciseBody$1071();
        if (strict$949 && firstRestricted$1558) {
            throwError$999(firstRestricted$1558, message$1559);
        }
        if (strict$949 && tmp$1557.stricted) {
            throwErrorTolerant$1000(tmp$1557.stricted, message$1559);
        }
        if (state$963.yieldAllowed && !state$963.yieldFound) {
            throwErrorTolerant$1000({}, Messages$944.NoYieldInGenerator);
        }
        strict$949 = previousStrict$1560;
        state$963.yieldAllowed = previousYieldAllowed$1561;
        return delegate$958.createFunctionDeclaration(id$1554, tmp$1557.params, tmp$1557.defaults, body$1555, tmp$1557.rest, generator$1562, expression$1563);
    }
    function parseFunctionExpression$1077() {
        var token$1564, id$1565 = null, firstRestricted$1566, message$1567, tmp$1568, body$1569, previousStrict$1570, previousYieldAllowed$1571, generator$1572, expression$1573;
        expectKeyword$1003('function');
        generator$1572 = false;
        if (match$1004('*')) {
            lex$995();
            generator$1572 = true;
        }
        if (!match$1004('(')) {
            token$1564 = lookahead$961;
            id$1565 = parseVariableIdentifier$1042();
            if (strict$949) {
                if (isRestrictedWord$976(token$1564.value)) {
                    throwErrorTolerant$1000(token$1564, Messages$944.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$976(token$1564.value)) {
                    firstRestricted$1566 = token$1564;
                    message$1567 = Messages$944.StrictFunctionName;
                } else if (isStrictModeReservedWord$975(token$1564.value)) {
                    firstRestricted$1566 = token$1564;
                    message$1567 = Messages$944.StrictReservedWord;
                }
            }
        }
        tmp$1568 = parseParams$1075(firstRestricted$1566);
        firstRestricted$1566 = tmp$1568.firstRestricted;
        if (tmp$1568.message) {
            message$1567 = tmp$1568.message;
        }
        previousStrict$1570 = strict$949;
        previousYieldAllowed$1571 = state$963.yieldAllowed;
        state$963.yieldAllowed = generator$1572;
        // here we redo some work in order to set 'expression'
        expression$1573 = !match$1004('{');
        body$1569 = parseConciseBody$1071();
        if (strict$949 && firstRestricted$1566) {
            throwError$999(firstRestricted$1566, message$1567);
        }
        if (strict$949 && tmp$1568.stricted) {
            throwErrorTolerant$1000(tmp$1568.stricted, message$1567);
        }
        if (state$963.yieldAllowed && !state$963.yieldFound) {
            throwErrorTolerant$1000({}, Messages$944.NoYieldInGenerator);
        }
        strict$949 = previousStrict$1570;
        state$963.yieldAllowed = previousYieldAllowed$1571;
        return delegate$958.createFunctionExpression(id$1565, tmp$1568.params, tmp$1568.defaults, body$1569, tmp$1568.rest, generator$1572, expression$1573);
    }
    function parseYieldExpression$1078() {
        var delegateFlag$1574, expr$1575, previousYieldAllowed$1576;
        expectKeyword$1003('yield');
        if (!state$963.yieldAllowed) {
            throwErrorTolerant$1000({}, Messages$944.IllegalYield);
        }
        delegateFlag$1574 = false;
        if (match$1004('*')) {
            lex$995();
            delegateFlag$1574 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1576 = state$963.yieldAllowed;
        state$963.yieldAllowed = false;
        expr$1575 = parseAssignmentExpression$1038();
        state$963.yieldAllowed = previousYieldAllowed$1576;
        state$963.yieldFound = true;
        return delegate$958.createYieldExpression(expr$1575, delegateFlag$1574);
    }
    // 14 Classes
    function parseMethodDefinition$1079(existingPropNames$1577) {
        var token$1578, key$1579, param$1580, propType$1581, isValidDuplicateProp$1582 = false;
        if (lookahead$961.value === 'static') {
            propType$1581 = ClassPropertyType$947.static;
            lex$995();
        } else {
            propType$1581 = ClassPropertyType$947.prototype;
        }
        if (match$1004('*')) {
            lex$995();
            return delegate$958.createMethodDefinition(propType$1581, '', parseObjectPropertyKey$1014(), parsePropertyMethodFunction$1013({ generator: true }));
        }
        token$1578 = lookahead$961;
        key$1579 = parseObjectPropertyKey$1014();
        if (token$1578.value === 'get' && !match$1004('(')) {
            key$1579 = parseObjectPropertyKey$1014();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1577[propType$1581].hasOwnProperty(key$1579.name)) {
                isValidDuplicateProp$1582 = existingPropNames$1577[propType$1581][key$1579.name].get === undefined && existingPropNames$1577[propType$1581][key$1579.name].data === undefined && existingPropNames$1577[propType$1581][key$1579.name].set !== undefined;
                if (!isValidDuplicateProp$1582) {
                    throwError$999(key$1579, Messages$944.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1577[propType$1581][key$1579.name] = {};
            }
            existingPropNames$1577[propType$1581][key$1579.name].get = true;
            expect$1002('(');
            expect$1002(')');
            return delegate$958.createMethodDefinition(propType$1581, 'get', key$1579, parsePropertyFunction$1012({ generator: false }));
        }
        if (token$1578.value === 'set' && !match$1004('(')) {
            key$1579 = parseObjectPropertyKey$1014();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1577[propType$1581].hasOwnProperty(key$1579.name)) {
                isValidDuplicateProp$1582 = existingPropNames$1577[propType$1581][key$1579.name].set === undefined && existingPropNames$1577[propType$1581][key$1579.name].data === undefined && existingPropNames$1577[propType$1581][key$1579.name].get !== undefined;
                if (!isValidDuplicateProp$1582) {
                    throwError$999(key$1579, Messages$944.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1577[propType$1581][key$1579.name] = {};
            }
            existingPropNames$1577[propType$1581][key$1579.name].set = true;
            expect$1002('(');
            token$1578 = lookahead$961;
            param$1580 = [parseVariableIdentifier$1042()];
            expect$1002(')');
            return delegate$958.createMethodDefinition(propType$1581, 'set', key$1579, parsePropertyFunction$1012({
                params: param$1580,
                generator: false,
                name: token$1578
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1577[propType$1581].hasOwnProperty(key$1579.name)) {
            throwError$999(key$1579, Messages$944.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1577[propType$1581][key$1579.name] = {};
        }
        existingPropNames$1577[propType$1581][key$1579.name].data = true;
        return delegate$958.createMethodDefinition(propType$1581, '', key$1579, parsePropertyMethodFunction$1013({ generator: false }));
    }
    function parseClassElement$1080(existingProps$1583) {
        if (match$1004(';')) {
            lex$995();
            return;
        }
        return parseMethodDefinition$1079(existingProps$1583);
    }
    function parseClassBody$1081() {
        var classElement$1584, classElements$1585 = [], existingProps$1586 = {};
        existingProps$1586[ClassPropertyType$947.static] = {};
        existingProps$1586[ClassPropertyType$947.prototype] = {};
        expect$1002('{');
        while (streamIndex$960 < length$957) {
            if (match$1004('}')) {
                break;
            }
            classElement$1584 = parseClassElement$1080(existingProps$1586);
            if (typeof classElement$1584 !== 'undefined') {
                classElements$1585.push(classElement$1584);
            }
        }
        expect$1002('}');
        return delegate$958.createClassBody(classElements$1585);
    }
    function parseClassExpression$1082() {
        var id$1587, previousYieldAllowed$1588, superClass$1589 = null;
        expectKeyword$1003('class');
        if (!matchKeyword$1005('extends') && !match$1004('{')) {
            id$1587 = parseVariableIdentifier$1042();
        }
        if (matchKeyword$1005('extends')) {
            expectKeyword$1003('extends');
            previousYieldAllowed$1588 = state$963.yieldAllowed;
            state$963.yieldAllowed = false;
            superClass$1589 = parseAssignmentExpression$1038();
            state$963.yieldAllowed = previousYieldAllowed$1588;
        }
        return delegate$958.createClassExpression(id$1587, superClass$1589, parseClassBody$1081());
    }
    function parseClassDeclaration$1083() {
        var id$1590, previousYieldAllowed$1591, superClass$1592 = null;
        expectKeyword$1003('class');
        id$1590 = parseVariableIdentifier$1042();
        if (matchKeyword$1005('extends')) {
            expectKeyword$1003('extends');
            previousYieldAllowed$1591 = state$963.yieldAllowed;
            state$963.yieldAllowed = false;
            superClass$1592 = parseAssignmentExpression$1038();
            state$963.yieldAllowed = previousYieldAllowed$1591;
        }
        return delegate$958.createClassDeclaration(id$1590, superClass$1592, parseClassBody$1081());
    }
    // 15 Program
    function matchModuleDeclaration$1084() {
        var id$1593;
        if (matchContextualKeyword$1006('module')) {
            id$1593 = lookahead2$997();
            return id$1593.type === Token$939.StringLiteral || id$1593.type === Token$939.Identifier;
        }
        return false;
    }
    function parseSourceElement$1085() {
        if (lookahead$961.type === Token$939.Keyword) {
            switch (lookahead$961.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$1046(lookahead$961.value);
            case 'function':
                return parseFunctionDeclaration$1076();
            case 'export':
                return parseExportDeclaration$1050();
            case 'import':
                return parseImportDeclaration$1051();
            default:
                return parseStatement$1070();
            }
        }
        if (matchModuleDeclaration$1084()) {
            throwError$999({}, Messages$944.NestedModule);
        }
        if (lookahead$961.type !== Token$939.EOF) {
            return parseStatement$1070();
        }
    }
    function parseProgramElement$1086() {
        if (lookahead$961.type === Token$939.Keyword) {
            switch (lookahead$961.value) {
            case 'export':
                return parseExportDeclaration$1050();
            case 'import':
                return parseImportDeclaration$1051();
            }
        }
        if (matchModuleDeclaration$1084()) {
            return parseModuleDeclaration$1047();
        }
        return parseSourceElement$1085();
    }
    function parseProgramElements$1087() {
        var sourceElement$1594, sourceElements$1595 = [], token$1596, directive$1597, firstRestricted$1598;
        while (streamIndex$960 < length$957) {
            token$1596 = lookahead$961;
            if (token$1596.type !== Token$939.StringLiteral) {
                break;
            }
            sourceElement$1594 = parseProgramElement$1086();
            sourceElements$1595.push(sourceElement$1594);
            if (sourceElement$1594.expression.type !== Syntax$942.Literal) {
                // this is not directive
                break;
            }
            directive$1597 = token$1596.value;
            if (directive$1597 === 'use strict') {
                strict$949 = true;
                if (firstRestricted$1598) {
                    throwErrorTolerant$1000(firstRestricted$1598, Messages$944.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1598 && token$1596.octal) {
                    firstRestricted$1598 = token$1596;
                }
            }
        }
        while (streamIndex$960 < length$957) {
            sourceElement$1594 = parseProgramElement$1086();
            if (typeof sourceElement$1594 === 'undefined') {
                break;
            }
            sourceElements$1595.push(sourceElement$1594);
        }
        return sourceElements$1595;
    }
    function parseModuleElement$1088() {
        return parseSourceElement$1085();
    }
    function parseModuleElements$1089() {
        var list$1599 = [], statement$1600;
        while (streamIndex$960 < length$957) {
            if (match$1004('}')) {
                break;
            }
            statement$1600 = parseModuleElement$1088();
            if (typeof statement$1600 === 'undefined') {
                break;
            }
            list$1599.push(statement$1600);
        }
        return list$1599;
    }
    function parseModuleBlock$1090() {
        var block$1601;
        expect$1002('{');
        block$1601 = parseModuleElements$1089();
        expect$1002('}');
        return delegate$958.createBlockStatement(block$1601);
    }
    function parseProgram$1091() {
        var body$1602;
        strict$949 = false;
        peek$996();
        body$1602 = parseProgramElements$1087();
        return delegate$958.createProgram(body$1602);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1092(type$1603, value$1604, start$1605, end$1606, loc$1607) {
        assert$965(typeof start$1605 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$964.comments.length > 0) {
            if (extra$964.comments[extra$964.comments.length - 1].range[1] > start$1605) {
                return;
            }
        }
        extra$964.comments.push({
            type: type$1603,
            value: value$1604,
            range: [
                start$1605,
                end$1606
            ],
            loc: loc$1607
        });
    }
    function scanComment$1093() {
        var comment$1608, ch$1609, loc$1610, start$1611, blockComment$1612, lineComment$1613;
        comment$1608 = '';
        blockComment$1612 = false;
        lineComment$1613 = false;
        while (index$950 < length$957) {
            ch$1609 = source$948[index$950];
            if (lineComment$1613) {
                ch$1609 = source$948[index$950++];
                if (isLineTerminator$971(ch$1609.charCodeAt(0))) {
                    loc$1610.end = {
                        line: lineNumber$951,
                        column: index$950 - lineStart$952 - 1
                    };
                    lineComment$1613 = false;
                    addComment$1092('Line', comment$1608, start$1611, index$950 - 1, loc$1610);
                    if (ch$1609 === '\r' && source$948[index$950] === '\n') {
                        ++index$950;
                    }
                    ++lineNumber$951;
                    lineStart$952 = index$950;
                    comment$1608 = '';
                } else if (index$950 >= length$957) {
                    lineComment$1613 = false;
                    comment$1608 += ch$1609;
                    loc$1610.end = {
                        line: lineNumber$951,
                        column: length$957 - lineStart$952
                    };
                    addComment$1092('Line', comment$1608, start$1611, length$957, loc$1610);
                } else {
                    comment$1608 += ch$1609;
                }
            } else if (blockComment$1612) {
                if (isLineTerminator$971(ch$1609.charCodeAt(0))) {
                    if (ch$1609 === '\r' && source$948[index$950 + 1] === '\n') {
                        ++index$950;
                        comment$1608 += '\r\n';
                    } else {
                        comment$1608 += ch$1609;
                    }
                    ++lineNumber$951;
                    ++index$950;
                    lineStart$952 = index$950;
                    if (index$950 >= length$957) {
                        throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1609 = source$948[index$950++];
                    if (index$950 >= length$957) {
                        throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1608 += ch$1609;
                    if (ch$1609 === '*') {
                        ch$1609 = source$948[index$950];
                        if (ch$1609 === '/') {
                            comment$1608 = comment$1608.substr(0, comment$1608.length - 1);
                            blockComment$1612 = false;
                            ++index$950;
                            loc$1610.end = {
                                line: lineNumber$951,
                                column: index$950 - lineStart$952
                            };
                            addComment$1092('Block', comment$1608, start$1611, index$950, loc$1610);
                            comment$1608 = '';
                        }
                    }
                }
            } else if (ch$1609 === '/') {
                ch$1609 = source$948[index$950 + 1];
                if (ch$1609 === '/') {
                    loc$1610 = {
                        start: {
                            line: lineNumber$951,
                            column: index$950 - lineStart$952
                        }
                    };
                    start$1611 = index$950;
                    index$950 += 2;
                    lineComment$1613 = true;
                    if (index$950 >= length$957) {
                        loc$1610.end = {
                            line: lineNumber$951,
                            column: index$950 - lineStart$952
                        };
                        lineComment$1613 = false;
                        addComment$1092('Line', comment$1608, start$1611, index$950, loc$1610);
                    }
                } else if (ch$1609 === '*') {
                    start$1611 = index$950;
                    index$950 += 2;
                    blockComment$1612 = true;
                    loc$1610 = {
                        start: {
                            line: lineNumber$951,
                            column: index$950 - lineStart$952 - 2
                        }
                    };
                    if (index$950 >= length$957) {
                        throwError$999({}, Messages$944.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$970(ch$1609.charCodeAt(0))) {
                ++index$950;
            } else if (isLineTerminator$971(ch$1609.charCodeAt(0))) {
                ++index$950;
                if (ch$1609 === '\r' && source$948[index$950] === '\n') {
                    ++index$950;
                }
                ++lineNumber$951;
                lineStart$952 = index$950;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1094() {
        var i$1614, entry$1615, comment$1616, comments$1617 = [];
        for (i$1614 = 0; i$1614 < extra$964.comments.length; ++i$1614) {
            entry$1615 = extra$964.comments[i$1614];
            comment$1616 = {
                type: entry$1615.type,
                value: entry$1615.value
            };
            if (extra$964.range) {
                comment$1616.range = entry$1615.range;
            }
            if (extra$964.loc) {
                comment$1616.loc = entry$1615.loc;
            }
            comments$1617.push(comment$1616);
        }
        extra$964.comments = comments$1617;
    }
    function collectToken$1095() {
        var start$1618, loc$1619, token$1620, range$1621, value$1622;
        skipComment$978();
        start$1618 = index$950;
        loc$1619 = {
            start: {
                line: lineNumber$951,
                column: index$950 - lineStart$952
            }
        };
        token$1620 = extra$964.advance();
        loc$1619.end = {
            line: lineNumber$951,
            column: index$950 - lineStart$952
        };
        if (token$1620.type !== Token$939.EOF) {
            range$1621 = [
                token$1620.range[0],
                token$1620.range[1]
            ];
            value$1622 = source$948.slice(token$1620.range[0], token$1620.range[1]);
            extra$964.tokens.push({
                type: TokenName$940[token$1620.type],
                value: value$1622,
                range: range$1621,
                loc: loc$1619
            });
        }
        return token$1620;
    }
    function collectRegex$1096() {
        var pos$1623, loc$1624, regex$1625, token$1626;
        skipComment$978();
        pos$1623 = index$950;
        loc$1624 = {
            start: {
                line: lineNumber$951,
                column: index$950 - lineStart$952
            }
        };
        regex$1625 = extra$964.scanRegExp();
        loc$1624.end = {
            line: lineNumber$951,
            column: index$950 - lineStart$952
        };
        if (!extra$964.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$964.tokens.length > 0) {
                token$1626 = extra$964.tokens[extra$964.tokens.length - 1];
                if (token$1626.range[0] === pos$1623 && token$1626.type === 'Punctuator') {
                    if (token$1626.value === '/' || token$1626.value === '/=') {
                        extra$964.tokens.pop();
                    }
                }
            }
            extra$964.tokens.push({
                type: 'RegularExpression',
                value: regex$1625.literal,
                range: [
                    pos$1623,
                    index$950
                ],
                loc: loc$1624
            });
        }
        return regex$1625;
    }
    function filterTokenLocation$1097() {
        var i$1627, entry$1628, token$1629, tokens$1630 = [];
        for (i$1627 = 0; i$1627 < extra$964.tokens.length; ++i$1627) {
            entry$1628 = extra$964.tokens[i$1627];
            token$1629 = {
                type: entry$1628.type,
                value: entry$1628.value
            };
            if (extra$964.range) {
                token$1629.range = entry$1628.range;
            }
            if (extra$964.loc) {
                token$1629.loc = entry$1628.loc;
            }
            tokens$1630.push(token$1629);
        }
        extra$964.tokens = tokens$1630;
    }
    function LocationMarker$1098() {
        var sm_index$1631 = lookahead$961 ? lookahead$961.sm_range[0] : 0;
        var sm_lineStart$1632 = lookahead$961 ? lookahead$961.sm_lineStart : 0;
        var sm_lineNumber$1633 = lookahead$961 ? lookahead$961.sm_lineNumber : 1;
        this.range = [
            sm_index$1631,
            sm_index$1631
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1633,
                column: sm_index$1631 - sm_lineStart$1632
            },
            end: {
                line: sm_lineNumber$1633,
                column: sm_index$1631 - sm_lineStart$1632
            }
        };
    }
    LocationMarker$1098.prototype = {
        constructor: LocationMarker$1098,
        end: function () {
            this.range[1] = sm_index$956;
            this.loc.end.line = sm_lineNumber$953;
            this.loc.end.column = sm_index$956 - sm_lineStart$954;
        },
        applyGroup: function (node$1634) {
            if (extra$964.range) {
                node$1634.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$964.loc) {
                node$1634.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1634 = delegate$958.postProcess(node$1634);
            }
        },
        apply: function (node$1635) {
            var nodeType$1636 = typeof node$1635;
            assert$965(nodeType$1636 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1636);
            if (extra$964.range) {
                node$1635.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$964.loc) {
                node$1635.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1635 = delegate$958.postProcess(node$1635);
            }
        }
    };
    function createLocationMarker$1099() {
        return new LocationMarker$1098();
    }
    function trackGroupExpression$1100() {
        var marker$1637, expr$1638;
        marker$1637 = createLocationMarker$1099();
        expect$1002('(');
        ++state$963.parenthesizedCount;
        expr$1638 = parseExpression$1039();
        expect$1002(')');
        marker$1637.end();
        marker$1637.applyGroup(expr$1638);
        return expr$1638;
    }
    function trackLeftHandSideExpression$1101() {
        var marker$1639, expr$1640;
        // skipComment();
        marker$1639 = createLocationMarker$1099();
        expr$1640 = matchKeyword$1005('new') ? parseNewExpression$1026() : parsePrimaryExpression$1020();
        while (match$1004('.') || match$1004('[') || lookahead$961.type === Token$939.Template) {
            if (match$1004('[')) {
                expr$1640 = delegate$958.createMemberExpression('[', expr$1640, parseComputedMember$1025());
                marker$1639.end();
                marker$1639.apply(expr$1640);
            } else if (match$1004('.')) {
                expr$1640 = delegate$958.createMemberExpression('.', expr$1640, parseNonComputedMember$1024());
                marker$1639.end();
                marker$1639.apply(expr$1640);
            } else {
                expr$1640 = delegate$958.createTaggedTemplateExpression(expr$1640, parseTemplateLiteral$1018());
                marker$1639.end();
                marker$1639.apply(expr$1640);
            }
        }
        return expr$1640;
    }
    function trackLeftHandSideExpressionAllowCall$1102() {
        var marker$1641, expr$1642, args$1643;
        // skipComment();
        marker$1641 = createLocationMarker$1099();
        expr$1642 = matchKeyword$1005('new') ? parseNewExpression$1026() : parsePrimaryExpression$1020();
        while (match$1004('.') || match$1004('[') || match$1004('(') || lookahead$961.type === Token$939.Template) {
            if (match$1004('(')) {
                args$1643 = parseArguments$1021();
                expr$1642 = delegate$958.createCallExpression(expr$1642, args$1643);
                marker$1641.end();
                marker$1641.apply(expr$1642);
            } else if (match$1004('[')) {
                expr$1642 = delegate$958.createMemberExpression('[', expr$1642, parseComputedMember$1025());
                marker$1641.end();
                marker$1641.apply(expr$1642);
            } else if (match$1004('.')) {
                expr$1642 = delegate$958.createMemberExpression('.', expr$1642, parseNonComputedMember$1024());
                marker$1641.end();
                marker$1641.apply(expr$1642);
            } else {
                expr$1642 = delegate$958.createTaggedTemplateExpression(expr$1642, parseTemplateLiteral$1018());
                marker$1641.end();
                marker$1641.apply(expr$1642);
            }
        }
        return expr$1642;
    }
    function filterGroup$1103(node$1644) {
        var n$1645, i$1646, entry$1647;
        n$1645 = Object.prototype.toString.apply(node$1644) === '[object Array]' ? [] : {};
        for (i$1646 in node$1644) {
            if (node$1644.hasOwnProperty(i$1646) && i$1646 !== 'groupRange' && i$1646 !== 'groupLoc') {
                entry$1647 = node$1644[i$1646];
                if (entry$1647 === null || typeof entry$1647 !== 'object' || entry$1647 instanceof RegExp) {
                    n$1645[i$1646] = entry$1647;
                } else {
                    n$1645[i$1646] = filterGroup$1103(entry$1647);
                }
            }
        }
        return n$1645;
    }
    function wrapTrackingFunction$1104(range$1648, loc$1649) {
        return function (parseFunction$1650) {
            function isBinary$1651(node$1653) {
                return node$1653.type === Syntax$942.LogicalExpression || node$1653.type === Syntax$942.BinaryExpression;
            }
            function visit$1652(node$1654) {
                var start$1655, end$1656;
                if (isBinary$1651(node$1654.left)) {
                    visit$1652(node$1654.left);
                }
                if (isBinary$1651(node$1654.right)) {
                    visit$1652(node$1654.right);
                }
                if (range$1648) {
                    if (node$1654.left.groupRange || node$1654.right.groupRange) {
                        start$1655 = node$1654.left.groupRange ? node$1654.left.groupRange[0] : node$1654.left.range[0];
                        end$1656 = node$1654.right.groupRange ? node$1654.right.groupRange[1] : node$1654.right.range[1];
                        node$1654.range = [
                            start$1655,
                            end$1656
                        ];
                    } else if (typeof node$1654.range === 'undefined') {
                        start$1655 = node$1654.left.range[0];
                        end$1656 = node$1654.right.range[1];
                        node$1654.range = [
                            start$1655,
                            end$1656
                        ];
                    }
                }
                if (loc$1649) {
                    if (node$1654.left.groupLoc || node$1654.right.groupLoc) {
                        start$1655 = node$1654.left.groupLoc ? node$1654.left.groupLoc.start : node$1654.left.loc.start;
                        end$1656 = node$1654.right.groupLoc ? node$1654.right.groupLoc.end : node$1654.right.loc.end;
                        node$1654.loc = {
                            start: start$1655,
                            end: end$1656
                        };
                        node$1654 = delegate$958.postProcess(node$1654);
                    } else if (typeof node$1654.loc === 'undefined') {
                        node$1654.loc = {
                            start: node$1654.left.loc.start,
                            end: node$1654.right.loc.end
                        };
                        node$1654 = delegate$958.postProcess(node$1654);
                    }
                }
            }
            return function () {
                var marker$1657, node$1658, curr$1659 = lookahead$961;
                marker$1657 = createLocationMarker$1099();
                node$1658 = parseFunction$1650.apply(null, arguments);
                marker$1657.end();
                if (node$1658.type !== Syntax$942.Program) {
                    if (curr$1659.leadingComments) {
                        node$1658.leadingComments = curr$1659.leadingComments;
                    }
                    if (curr$1659.trailingComments) {
                        node$1658.trailingComments = curr$1659.trailingComments;
                    }
                }
                if (range$1648 && typeof node$1658.range === 'undefined') {
                    marker$1657.apply(node$1658);
                }
                if (loc$1649 && typeof node$1658.loc === 'undefined') {
                    marker$1657.apply(node$1658);
                }
                if (isBinary$1651(node$1658)) {
                    visit$1652(node$1658);
                }
                return node$1658;
            };
        };
    }
    function patch$1105() {
        var wrapTracking$1660;
        if (extra$964.comments) {
            extra$964.skipComment = skipComment$978;
            skipComment$978 = scanComment$1093;
        }
        if (extra$964.range || extra$964.loc) {
            extra$964.parseGroupExpression = parseGroupExpression$1019;
            extra$964.parseLeftHandSideExpression = parseLeftHandSideExpression$1028;
            extra$964.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$1027;
            parseGroupExpression$1019 = trackGroupExpression$1100;
            parseLeftHandSideExpression$1028 = trackLeftHandSideExpression$1101;
            parseLeftHandSideExpressionAllowCall$1027 = trackLeftHandSideExpressionAllowCall$1102;
            wrapTracking$1660 = wrapTrackingFunction$1104(extra$964.range, extra$964.loc);
            extra$964.parseArrayInitialiser = parseArrayInitialiser$1011;
            extra$964.parseAssignmentExpression = parseAssignmentExpression$1038;
            extra$964.parseBinaryExpression = parseBinaryExpression$1032;
            extra$964.parseBlock = parseBlock$1041;
            extra$964.parseFunctionSourceElements = parseFunctionSourceElements$1072;
            extra$964.parseCatchClause = parseCatchClause$1067;
            extra$964.parseComputedMember = parseComputedMember$1025;
            extra$964.parseConditionalExpression = parseConditionalExpression$1033;
            extra$964.parseConstLetDeclaration = parseConstLetDeclaration$1046;
            extra$964.parseExportBatchSpecifier = parseExportBatchSpecifier$1048;
            extra$964.parseExportDeclaration = parseExportDeclaration$1050;
            extra$964.parseExportSpecifier = parseExportSpecifier$1049;
            extra$964.parseExpression = parseExpression$1039;
            extra$964.parseForVariableDeclaration = parseForVariableDeclaration$1058;
            extra$964.parseFunctionDeclaration = parseFunctionDeclaration$1076;
            extra$964.parseFunctionExpression = parseFunctionExpression$1077;
            extra$964.parseParams = parseParams$1075;
            extra$964.parseImportDeclaration = parseImportDeclaration$1051;
            extra$964.parseImportSpecifier = parseImportSpecifier$1052;
            extra$964.parseModuleDeclaration = parseModuleDeclaration$1047;
            extra$964.parseModuleBlock = parseModuleBlock$1090;
            extra$964.parseNewExpression = parseNewExpression$1026;
            extra$964.parseNonComputedProperty = parseNonComputedProperty$1023;
            extra$964.parseObjectInitialiser = parseObjectInitialiser$1016;
            extra$964.parseObjectProperty = parseObjectProperty$1015;
            extra$964.parseObjectPropertyKey = parseObjectPropertyKey$1014;
            extra$964.parsePostfixExpression = parsePostfixExpression$1029;
            extra$964.parsePrimaryExpression = parsePrimaryExpression$1020;
            extra$964.parseProgram = parseProgram$1091;
            extra$964.parsePropertyFunction = parsePropertyFunction$1012;
            extra$964.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$1022;
            extra$964.parseTemplateElement = parseTemplateElement$1017;
            extra$964.parseTemplateLiteral = parseTemplateLiteral$1018;
            extra$964.parseStatement = parseStatement$1070;
            extra$964.parseSwitchCase = parseSwitchCase$1064;
            extra$964.parseUnaryExpression = parseUnaryExpression$1030;
            extra$964.parseVariableDeclaration = parseVariableDeclaration$1043;
            extra$964.parseVariableIdentifier = parseVariableIdentifier$1042;
            extra$964.parseMethodDefinition = parseMethodDefinition$1079;
            extra$964.parseClassDeclaration = parseClassDeclaration$1083;
            extra$964.parseClassExpression = parseClassExpression$1082;
            extra$964.parseClassBody = parseClassBody$1081;
            parseArrayInitialiser$1011 = wrapTracking$1660(extra$964.parseArrayInitialiser);
            parseAssignmentExpression$1038 = wrapTracking$1660(extra$964.parseAssignmentExpression);
            parseBinaryExpression$1032 = wrapTracking$1660(extra$964.parseBinaryExpression);
            parseBlock$1041 = wrapTracking$1660(extra$964.parseBlock);
            parseFunctionSourceElements$1072 = wrapTracking$1660(extra$964.parseFunctionSourceElements);
            parseCatchClause$1067 = wrapTracking$1660(extra$964.parseCatchClause);
            parseComputedMember$1025 = wrapTracking$1660(extra$964.parseComputedMember);
            parseConditionalExpression$1033 = wrapTracking$1660(extra$964.parseConditionalExpression);
            parseConstLetDeclaration$1046 = wrapTracking$1660(extra$964.parseConstLetDeclaration);
            parseExportBatchSpecifier$1048 = wrapTracking$1660(parseExportBatchSpecifier$1048);
            parseExportDeclaration$1050 = wrapTracking$1660(parseExportDeclaration$1050);
            parseExportSpecifier$1049 = wrapTracking$1660(parseExportSpecifier$1049);
            parseExpression$1039 = wrapTracking$1660(extra$964.parseExpression);
            parseForVariableDeclaration$1058 = wrapTracking$1660(extra$964.parseForVariableDeclaration);
            parseFunctionDeclaration$1076 = wrapTracking$1660(extra$964.parseFunctionDeclaration);
            parseFunctionExpression$1077 = wrapTracking$1660(extra$964.parseFunctionExpression);
            parseParams$1075 = wrapTracking$1660(extra$964.parseParams);
            parseImportDeclaration$1051 = wrapTracking$1660(extra$964.parseImportDeclaration);
            parseImportSpecifier$1052 = wrapTracking$1660(extra$964.parseImportSpecifier);
            parseModuleDeclaration$1047 = wrapTracking$1660(extra$964.parseModuleDeclaration);
            parseModuleBlock$1090 = wrapTracking$1660(extra$964.parseModuleBlock);
            parseLeftHandSideExpression$1028 = wrapTracking$1660(parseLeftHandSideExpression$1028);
            parseNewExpression$1026 = wrapTracking$1660(extra$964.parseNewExpression);
            parseNonComputedProperty$1023 = wrapTracking$1660(extra$964.parseNonComputedProperty);
            parseObjectInitialiser$1016 = wrapTracking$1660(extra$964.parseObjectInitialiser);
            parseObjectProperty$1015 = wrapTracking$1660(extra$964.parseObjectProperty);
            parseObjectPropertyKey$1014 = wrapTracking$1660(extra$964.parseObjectPropertyKey);
            parsePostfixExpression$1029 = wrapTracking$1660(extra$964.parsePostfixExpression);
            parsePrimaryExpression$1020 = wrapTracking$1660(extra$964.parsePrimaryExpression);
            parseProgram$1091 = wrapTracking$1660(extra$964.parseProgram);
            parsePropertyFunction$1012 = wrapTracking$1660(extra$964.parsePropertyFunction);
            parseTemplateElement$1017 = wrapTracking$1660(extra$964.parseTemplateElement);
            parseTemplateLiteral$1018 = wrapTracking$1660(extra$964.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$1022 = wrapTracking$1660(extra$964.parseSpreadOrAssignmentExpression);
            parseStatement$1070 = wrapTracking$1660(extra$964.parseStatement);
            parseSwitchCase$1064 = wrapTracking$1660(extra$964.parseSwitchCase);
            parseUnaryExpression$1030 = wrapTracking$1660(extra$964.parseUnaryExpression);
            parseVariableDeclaration$1043 = wrapTracking$1660(extra$964.parseVariableDeclaration);
            parseVariableIdentifier$1042 = wrapTracking$1660(extra$964.parseVariableIdentifier);
            parseMethodDefinition$1079 = wrapTracking$1660(extra$964.parseMethodDefinition);
            parseClassDeclaration$1083 = wrapTracking$1660(extra$964.parseClassDeclaration);
            parseClassExpression$1082 = wrapTracking$1660(extra$964.parseClassExpression);
            parseClassBody$1081 = wrapTracking$1660(extra$964.parseClassBody);
        }
        if (typeof extra$964.tokens !== 'undefined') {
            extra$964.advance = advance$994;
            extra$964.scanRegExp = scanRegExp$991;
            advance$994 = collectToken$1095;
            scanRegExp$991 = collectRegex$1096;
        }
    }
    function unpatch$1106() {
        if (typeof extra$964.skipComment === 'function') {
            skipComment$978 = extra$964.skipComment;
        }
        if (extra$964.range || extra$964.loc) {
            parseArrayInitialiser$1011 = extra$964.parseArrayInitialiser;
            parseAssignmentExpression$1038 = extra$964.parseAssignmentExpression;
            parseBinaryExpression$1032 = extra$964.parseBinaryExpression;
            parseBlock$1041 = extra$964.parseBlock;
            parseFunctionSourceElements$1072 = extra$964.parseFunctionSourceElements;
            parseCatchClause$1067 = extra$964.parseCatchClause;
            parseComputedMember$1025 = extra$964.parseComputedMember;
            parseConditionalExpression$1033 = extra$964.parseConditionalExpression;
            parseConstLetDeclaration$1046 = extra$964.parseConstLetDeclaration;
            parseExportBatchSpecifier$1048 = extra$964.parseExportBatchSpecifier;
            parseExportDeclaration$1050 = extra$964.parseExportDeclaration;
            parseExportSpecifier$1049 = extra$964.parseExportSpecifier;
            parseExpression$1039 = extra$964.parseExpression;
            parseForVariableDeclaration$1058 = extra$964.parseForVariableDeclaration;
            parseFunctionDeclaration$1076 = extra$964.parseFunctionDeclaration;
            parseFunctionExpression$1077 = extra$964.parseFunctionExpression;
            parseImportDeclaration$1051 = extra$964.parseImportDeclaration;
            parseImportSpecifier$1052 = extra$964.parseImportSpecifier;
            parseGroupExpression$1019 = extra$964.parseGroupExpression;
            parseLeftHandSideExpression$1028 = extra$964.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$1027 = extra$964.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$1047 = extra$964.parseModuleDeclaration;
            parseModuleBlock$1090 = extra$964.parseModuleBlock;
            parseNewExpression$1026 = extra$964.parseNewExpression;
            parseNonComputedProperty$1023 = extra$964.parseNonComputedProperty;
            parseObjectInitialiser$1016 = extra$964.parseObjectInitialiser;
            parseObjectProperty$1015 = extra$964.parseObjectProperty;
            parseObjectPropertyKey$1014 = extra$964.parseObjectPropertyKey;
            parsePostfixExpression$1029 = extra$964.parsePostfixExpression;
            parsePrimaryExpression$1020 = extra$964.parsePrimaryExpression;
            parseProgram$1091 = extra$964.parseProgram;
            parsePropertyFunction$1012 = extra$964.parsePropertyFunction;
            parseTemplateElement$1017 = extra$964.parseTemplateElement;
            parseTemplateLiteral$1018 = extra$964.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$1022 = extra$964.parseSpreadOrAssignmentExpression;
            parseStatement$1070 = extra$964.parseStatement;
            parseSwitchCase$1064 = extra$964.parseSwitchCase;
            parseUnaryExpression$1030 = extra$964.parseUnaryExpression;
            parseVariableDeclaration$1043 = extra$964.parseVariableDeclaration;
            parseVariableIdentifier$1042 = extra$964.parseVariableIdentifier;
            parseMethodDefinition$1079 = extra$964.parseMethodDefinition;
            parseClassDeclaration$1083 = extra$964.parseClassDeclaration;
            parseClassExpression$1082 = extra$964.parseClassExpression;
            parseClassBody$1081 = extra$964.parseClassBody;
        }
        if (typeof extra$964.scanRegExp === 'function') {
            advance$994 = extra$964.advance;
            scanRegExp$991 = extra$964.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1107(object$1661, properties$1662) {
        var entry$1663, result$1664 = {};
        for (entry$1663 in object$1661) {
            if (object$1661.hasOwnProperty(entry$1663)) {
                result$1664[entry$1663] = object$1661[entry$1663];
            }
        }
        for (entry$1663 in properties$1662) {
            if (properties$1662.hasOwnProperty(entry$1663)) {
                result$1664[entry$1663] = properties$1662[entry$1663];
            }
        }
        return result$1664;
    }
    function tokenize$1108(code$1665, options$1666) {
        var toString$1667, token$1668, tokens$1669;
        toString$1667 = String;
        if (typeof code$1665 !== 'string' && !(code$1665 instanceof String)) {
            code$1665 = toString$1667(code$1665);
        }
        delegate$958 = SyntaxTreeDelegate$946;
        source$948 = code$1665;
        index$950 = 0;
        lineNumber$951 = source$948.length > 0 ? 1 : 0;
        lineStart$952 = 0;
        length$957 = source$948.length;
        lookahead$961 = null;
        state$963 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$964 = {};
        // Options matching.
        options$1666 = options$1666 || {};
        // Of course we collect tokens here.
        options$1666.tokens = true;
        extra$964.tokens = [];
        extra$964.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$964.openParenToken = -1;
        extra$964.openCurlyToken = -1;
        extra$964.range = typeof options$1666.range === 'boolean' && options$1666.range;
        extra$964.loc = typeof options$1666.loc === 'boolean' && options$1666.loc;
        if (typeof options$1666.comment === 'boolean' && options$1666.comment) {
            extra$964.comments = [];
        }
        if (typeof options$1666.tolerant === 'boolean' && options$1666.tolerant) {
            extra$964.errors = [];
        }
        if (length$957 > 0) {
            if (typeof source$948[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1665 instanceof String) {
                    source$948 = code$1665.valueOf();
                }
            }
        }
        patch$1105();
        try {
            peek$996();
            if (lookahead$961.type === Token$939.EOF) {
                return extra$964.tokens;
            }
            token$1668 = lex$995();
            while (lookahead$961.type !== Token$939.EOF) {
                try {
                    token$1668 = lex$995();
                } catch (lexError$1670) {
                    token$1668 = lookahead$961;
                    if (extra$964.errors) {
                        extra$964.errors.push(lexError$1670);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1670;
                    }
                }
            }
            filterTokenLocation$1097();
            tokens$1669 = extra$964.tokens;
            if (typeof extra$964.comments !== 'undefined') {
                filterCommentLocation$1094();
                tokens$1669.comments = extra$964.comments;
            }
            if (typeof extra$964.errors !== 'undefined') {
                tokens$1669.errors = extra$964.errors;
            }
        } catch (e$1671) {
            throw e$1671;
        } finally {
            unpatch$1106();
            extra$964 = {};
        }
        return tokens$1669;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1109(toks$1672, start$1673, inExprDelim$1674, parentIsBlock$1675) {
        var assignOps$1676 = [
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
        var binaryOps$1677 = [
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
        var unaryOps$1678 = [
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
        function back$1679(n$1680) {
            var idx$1681 = toks$1672.length - n$1680 > 0 ? toks$1672.length - n$1680 : 0;
            return toks$1672[idx$1681];
        }
        if (inExprDelim$1674 && toks$1672.length - (start$1673 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1679(start$1673 + 2).value === ':' && parentIsBlock$1675) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$966(back$1679(start$1673 + 2).value, unaryOps$1678.concat(binaryOps$1677).concat(assignOps$1676))) {
            // ... + {...}
            return false;
        } else if (back$1679(start$1673 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1682 = typeof back$1679(start$1673 + 1).startLineNumber !== 'undefined' ? back$1679(start$1673 + 1).startLineNumber : back$1679(start$1673 + 1).lineNumber;
            if (back$1679(start$1673 + 2).lineNumber !== currLineNumber$1682) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$966(back$1679(start$1673 + 2).value, [
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
    function readToken$1110(toks$1683, inExprDelim$1684, parentIsBlock$1685) {
        var delimiters$1686 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1687 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1688 = toks$1683.length - 1;
        var comments$1689, commentsLen$1690 = extra$964.comments.length;
        function back$1691(n$1695) {
            var idx$1696 = toks$1683.length - n$1695 > 0 ? toks$1683.length - n$1695 : 0;
            return toks$1683[idx$1696];
        }
        function attachComments$1692(token$1697) {
            if (comments$1689) {
                token$1697.leadingComments = comments$1689;
            }
            return token$1697;
        }
        function _advance$1693() {
            return attachComments$1692(advance$994());
        }
        function _scanRegExp$1694() {
            return attachComments$1692(scanRegExp$991());
        }
        skipComment$978();
        if (extra$964.comments.length > commentsLen$1690) {
            comments$1689 = extra$964.comments.slice(commentsLen$1690);
        }
        if (isIn$966(source$948[index$950], delimiters$1686)) {
            return attachComments$1692(readDelim$1111(toks$1683, inExprDelim$1684, parentIsBlock$1685));
        }
        if (source$948[index$950] === '/') {
            var prev$1698 = back$1691(1);
            if (prev$1698) {
                if (prev$1698.value === '()') {
                    if (isIn$966(back$1691(2).value, parenIdents$1687)) {
                        // ... if (...) / ...
                        return _scanRegExp$1694();
                    }
                    // ... (...) / ...
                    return _advance$1693();
                }
                if (prev$1698.value === '{}') {
                    if (blockAllowed$1109(toks$1683, 0, inExprDelim$1684, parentIsBlock$1685)) {
                        if (back$1691(2).value === '()') {
                            // named function
                            if (back$1691(4).value === 'function') {
                                if (!blockAllowed$1109(toks$1683, 3, inExprDelim$1684, parentIsBlock$1685)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1693();
                                }
                                if (toks$1683.length - 5 <= 0 && inExprDelim$1684) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1693();
                                }
                            }
                            // unnamed function
                            if (back$1691(3).value === 'function') {
                                if (!blockAllowed$1109(toks$1683, 2, inExprDelim$1684, parentIsBlock$1685)) {
                                    // new function (...) {...} / ...
                                    return _advance$1693();
                                }
                                if (toks$1683.length - 4 <= 0 && inExprDelim$1684) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1693();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1694();
                    } else {
                        // ... + {...} / ...
                        return _advance$1693();
                    }
                }
                if (prev$1698.type === Token$939.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1694();
                }
                if (isKeyword$977(prev$1698.value)) {
                    // typeof /...
                    return _scanRegExp$1694();
                }
                return _advance$1693();
            }
            return _scanRegExp$1694();
        }
        return _advance$1693();
    }
    function readDelim$1111(toks$1699, inExprDelim$1700, parentIsBlock$1701) {
        var startDelim$1702 = advance$994(), matchDelim$1703 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1704 = [];
        var delimiters$1705 = [
                '(',
                '{',
                '['
            ];
        assert$965(delimiters$1705.indexOf(startDelim$1702.value) !== -1, 'Need to begin at the delimiter');
        var token$1706 = startDelim$1702;
        var startLineNumber$1707 = token$1706.lineNumber;
        var startLineStart$1708 = token$1706.lineStart;
        var startRange$1709 = token$1706.range;
        var delimToken$1710 = {};
        delimToken$1710.type = Token$939.Delimiter;
        delimToken$1710.value = startDelim$1702.value + matchDelim$1703[startDelim$1702.value];
        delimToken$1710.startLineNumber = startLineNumber$1707;
        delimToken$1710.startLineStart = startLineStart$1708;
        delimToken$1710.startRange = startRange$1709;
        var delimIsBlock$1711 = false;
        if (startDelim$1702.value === '{') {
            delimIsBlock$1711 = blockAllowed$1109(toks$1699.concat(delimToken$1710), 0, inExprDelim$1700, parentIsBlock$1701);
        }
        while (index$950 <= length$957) {
            token$1706 = readToken$1110(inner$1704, startDelim$1702.value === '(' || startDelim$1702.value === '[', delimIsBlock$1711);
            if (token$1706.type === Token$939.Punctuator && token$1706.value === matchDelim$1703[startDelim$1702.value]) {
                if (token$1706.leadingComments) {
                    delimToken$1710.trailingComments = token$1706.leadingComments;
                }
                break;
            } else if (token$1706.type === Token$939.EOF) {
                throwError$999({}, Messages$944.UnexpectedEOS);
            } else {
                inner$1704.push(token$1706);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$950 >= length$957 && matchDelim$1703[startDelim$1702.value] !== source$948[length$957 - 1]) {
            throwError$999({}, Messages$944.UnexpectedEOS);
        }
        var endLineNumber$1712 = token$1706.lineNumber;
        var endLineStart$1713 = token$1706.lineStart;
        var endRange$1714 = token$1706.range;
        delimToken$1710.inner = inner$1704;
        delimToken$1710.endLineNumber = endLineNumber$1712;
        delimToken$1710.endLineStart = endLineStart$1713;
        delimToken$1710.endRange = endRange$1714;
        return delimToken$1710;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$1112(code$1715) {
        var token$1716, tokenTree$1717 = [];
        extra$964 = {};
        extra$964.comments = [];
        patch$1105();
        source$948 = code$1715;
        index$950 = 0;
        lineNumber$951 = source$948.length > 0 ? 1 : 0;
        lineStart$952 = 0;
        length$957 = source$948.length;
        state$963 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$950 < length$957) {
            tokenTree$1717.push(readToken$1110(tokenTree$1717, false, false));
        }
        var last$1718 = tokenTree$1717[tokenTree$1717.length - 1];
        if (last$1718 && last$1718.type !== Token$939.EOF) {
            tokenTree$1717.push({
                type: Token$939.EOF,
                value: '',
                lineNumber: last$1718.lineNumber,
                lineStart: last$1718.lineStart,
                range: [
                    index$950,
                    index$950
                ]
            });
        }
        return expander$938.tokensToSyntax(tokenTree$1717);
    }
    function parse$1113(code$1719, options$1720) {
        var program$1721, toString$1722;
        extra$964 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1719)) {
            tokenStream$959 = code$1719;
            length$957 = tokenStream$959.length;
            lineNumber$951 = tokenStream$959.length > 0 ? 1 : 0;
            source$948 = undefined;
        } else {
            toString$1722 = String;
            if (typeof code$1719 !== 'string' && !(code$1719 instanceof String)) {
                code$1719 = toString$1722(code$1719);
            }
            source$948 = code$1719;
            length$957 = source$948.length;
            lineNumber$951 = source$948.length > 0 ? 1 : 0;
        }
        delegate$958 = SyntaxTreeDelegate$946;
        streamIndex$960 = -1;
        index$950 = 0;
        lineStart$952 = 0;
        sm_lineStart$954 = 0;
        sm_lineNumber$953 = lineNumber$951;
        sm_index$956 = 0;
        sm_range$955 = [
            0,
            0
        ];
        lookahead$961 = null;
        state$963 = {
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
        if (typeof options$1720 !== 'undefined') {
            extra$964.range = typeof options$1720.range === 'boolean' && options$1720.range;
            extra$964.loc = typeof options$1720.loc === 'boolean' && options$1720.loc;
            if (extra$964.loc && options$1720.source !== null && options$1720.source !== undefined) {
                delegate$958 = extend$1107(delegate$958, {
                    'postProcess': function (node$1723) {
                        node$1723.loc.source = toString$1722(options$1720.source);
                        return node$1723;
                    }
                });
            }
            if (typeof options$1720.tokens === 'boolean' && options$1720.tokens) {
                extra$964.tokens = [];
            }
            if (typeof options$1720.comment === 'boolean' && options$1720.comment) {
                extra$964.comments = [];
            }
            if (typeof options$1720.tolerant === 'boolean' && options$1720.tolerant) {
                extra$964.errors = [];
            }
        }
        if (length$957 > 0) {
            if (source$948 && typeof source$948[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1719 instanceof String) {
                    source$948 = code$1719.valueOf();
                }
            }
        }
        extra$964 = { loc: true };
        patch$1105();
        try {
            program$1721 = parseProgram$1091();
            if (typeof extra$964.comments !== 'undefined') {
                filterCommentLocation$1094();
                program$1721.comments = extra$964.comments;
            }
            if (typeof extra$964.tokens !== 'undefined') {
                filterTokenLocation$1097();
                program$1721.tokens = extra$964.tokens;
            }
            if (typeof extra$964.errors !== 'undefined') {
                program$1721.errors = extra$964.errors;
            }
            if (extra$964.range || extra$964.loc) {
                program$1721.body = filterGroup$1103(program$1721.body);
            }
        } catch (e$1724) {
            throw e$1724;
        } finally {
            unpatch$1106();
            extra$964 = {};
        }
        return program$1721;
    }
    exports$937.tokenize = tokenize$1108;
    exports$937.read = read$1112;
    exports$937.Token = Token$939;
    exports$937.parse = parse$1113;
    // Deep copy.
    exports$937.Syntax = function () {
        var name$1725, types$1726 = {};
        if (typeof Object.create === 'function') {
            types$1726 = Object.create(null);
        }
        for (name$1725 in Syntax$942) {
            if (Syntax$942.hasOwnProperty(name$1725)) {
                types$1726[name$1725] = Syntax$942[name$1725];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1726);
        }
        return types$1726;
    }();
}));
//# sourceMappingURL=parser.js.map