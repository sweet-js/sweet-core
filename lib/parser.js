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
(function (root$865, factory$866) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$866);
    } else if (typeof exports !== 'undefined') {
        factory$866(exports, require('./expander'));
    } else {
        factory$866(root$865.esprima = {});
    }
}(this, function (exports$867, expander$868) {
    'use strict';
    var Token$869, TokenName$870, FnExprTokens$871, Syntax$872, PropertyKind$873, Messages$874, Regex$875, SyntaxTreeDelegate$876, ClassPropertyType$877, source$878, strict$879, index$880, lineNumber$881, lineStart$882, sm_lineNumber$883, sm_lineStart$884, sm_range$885, sm_index$886, length$887, delegate$888, tokenStream$889, streamIndex$890, lookahead$891, lookaheadIndex$892, state$893, extra$894;
    Token$869 = {
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
    TokenName$870 = {};
    TokenName$870[Token$869.BooleanLiteral] = 'Boolean';
    TokenName$870[Token$869.EOF] = '<end>';
    TokenName$870[Token$869.Identifier] = 'Identifier';
    TokenName$870[Token$869.Keyword] = 'Keyword';
    TokenName$870[Token$869.NullLiteral] = 'Null';
    TokenName$870[Token$869.NumericLiteral] = 'Numeric';
    TokenName$870[Token$869.Punctuator] = 'Punctuator';
    TokenName$870[Token$869.StringLiteral] = 'String';
    TokenName$870[Token$869.RegularExpression] = 'RegularExpression';
    TokenName$870[Token$869.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$871 = [
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
    Syntax$872 = {
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
    PropertyKind$873 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$877 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$874 = {
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
    Regex$875 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$895(condition$1044, message$1045) {
        if (!condition$1044) {
            throw new Error('ASSERT: ' + message$1045);
        }
    }
    function isIn$896(el$1046, list$1047) {
        return list$1047.indexOf(el$1046) !== -1;
    }
    function isDecimalDigit$897(ch$1048) {
        return ch$1048 >= 48 && ch$1048 <= 57;
    }    // 0..9
    function isHexDigit$898(ch$1049) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1049) >= 0;
    }
    function isOctalDigit$899(ch$1050) {
        return '01234567'.indexOf(ch$1050) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$900(ch$1051) {
        return ch$1051 === 32 || ch$1051 === 9 || ch$1051 === 11 || ch$1051 === 12 || ch$1051 === 160 || ch$1051 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1051)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$901(ch$1052) {
        return ch$1052 === 10 || ch$1052 === 13 || ch$1052 === 8232 || ch$1052 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$902(ch$1053) {
        return ch$1053 === 36 || ch$1053 === 95 || ch$1053 >= 65 && ch$1053 <= 90 || ch$1053 >= 97 && ch$1053 <= 122 || ch$1053 === 92 || ch$1053 >= 128 && Regex$875.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1053));
    }
    function isIdentifierPart$903(ch$1054) {
        return ch$1054 === 36 || ch$1054 === 95 || ch$1054 >= 65 && ch$1054 <= 90 || ch$1054 >= 97 && ch$1054 <= 122 || ch$1054 >= 48 && ch$1054 <= 57 || ch$1054 === 92 || ch$1054 >= 128 && Regex$875.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1054));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$904(id$1055) {
        switch (id$1055) {
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
    function isStrictModeReservedWord$905(id$1056) {
        switch (id$1056) {
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
    function isRestrictedWord$906(id$1057) {
        return id$1057 === 'eval' || id$1057 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$907(id$1058) {
        if (strict$879 && isStrictModeReservedWord$905(id$1058)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1058.length) {
        case 2:
            return id$1058 === 'if' || id$1058 === 'in' || id$1058 === 'do';
        case 3:
            return id$1058 === 'var' || id$1058 === 'for' || id$1058 === 'new' || id$1058 === 'try' || id$1058 === 'let';
        case 4:
            return id$1058 === 'this' || id$1058 === 'else' || id$1058 === 'case' || id$1058 === 'void' || id$1058 === 'with' || id$1058 === 'enum';
        case 5:
            return id$1058 === 'while' || id$1058 === 'break' || id$1058 === 'catch' || id$1058 === 'throw' || id$1058 === 'const' || id$1058 === 'yield' || id$1058 === 'class' || id$1058 === 'super';
        case 6:
            return id$1058 === 'return' || id$1058 === 'typeof' || id$1058 === 'delete' || id$1058 === 'switch' || id$1058 === 'export' || id$1058 === 'import';
        case 7:
            return id$1058 === 'default' || id$1058 === 'finally' || id$1058 === 'extends';
        case 8:
            return id$1058 === 'function' || id$1058 === 'continue' || id$1058 === 'debugger';
        case 10:
            return id$1058 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$908() {
        var ch$1059, blockComment$1060, lineComment$1061;
        blockComment$1060 = false;
        lineComment$1061 = false;
        while (index$880 < length$887) {
            ch$1059 = source$878.charCodeAt(index$880);
            if (lineComment$1061) {
                ++index$880;
                if (isLineTerminator$901(ch$1059)) {
                    lineComment$1061 = false;
                    if (ch$1059 === 13 && source$878.charCodeAt(index$880) === 10) {
                        ++index$880;
                    }
                    ++lineNumber$881;
                    lineStart$882 = index$880;
                }
            } else if (blockComment$1060) {
                if (isLineTerminator$901(ch$1059)) {
                    if (ch$1059 === 13 && source$878.charCodeAt(index$880 + 1) === 10) {
                        ++index$880;
                    }
                    ++lineNumber$881;
                    ++index$880;
                    lineStart$882 = index$880;
                    if (index$880 >= length$887) {
                        throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1059 = source$878.charCodeAt(index$880++);
                    if (index$880 >= length$887) {
                        throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1059 === 42) {
                        ch$1059 = source$878.charCodeAt(index$880);
                        if (ch$1059 === 47) {
                            ++index$880;
                            blockComment$1060 = false;
                        }
                    }
                }
            } else if (ch$1059 === 47) {
                ch$1059 = source$878.charCodeAt(index$880 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1059 === 47) {
                    index$880 += 2;
                    lineComment$1061 = true;
                } else if (ch$1059 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$880 += 2;
                    blockComment$1060 = true;
                    if (index$880 >= length$887) {
                        throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$900(ch$1059)) {
                ++index$880;
            } else if (isLineTerminator$901(ch$1059)) {
                ++index$880;
                if (ch$1059 === 13 && source$878.charCodeAt(index$880) === 10) {
                    ++index$880;
                }
                ++lineNumber$881;
                lineStart$882 = index$880;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$909(prefix$1062) {
        var i$1063, len$1064, ch$1065, code$1066 = 0;
        len$1064 = prefix$1062 === 'u' ? 4 : 2;
        for (i$1063 = 0; i$1063 < len$1064; ++i$1063) {
            if (index$880 < length$887 && isHexDigit$898(source$878[index$880])) {
                ch$1065 = source$878[index$880++];
                code$1066 = code$1066 * 16 + '0123456789abcdef'.indexOf(ch$1065.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1066);
    }
    function scanUnicodeCodePointEscape$910() {
        var ch$1067, code$1068, cu1$1069, cu2$1070;
        ch$1067 = source$878[index$880];
        code$1068 = 0;
        // At least, one hex digit is required.
        if (ch$1067 === '}') {
            throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
        }
        while (index$880 < length$887) {
            ch$1067 = source$878[index$880++];
            if (!isHexDigit$898(ch$1067)) {
                break;
            }
            code$1068 = code$1068 * 16 + '0123456789abcdef'.indexOf(ch$1067.toLowerCase());
        }
        if (code$1068 > 1114111 || ch$1067 !== '}') {
            throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1068 <= 65535) {
            return String.fromCharCode(code$1068);
        }
        cu1$1069 = (code$1068 - 65536 >> 10) + 55296;
        cu2$1070 = (code$1068 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1069, cu2$1070);
    }
    function getEscapedIdentifier$911() {
        var ch$1071, id$1072;
        ch$1071 = source$878.charCodeAt(index$880++);
        id$1072 = String.fromCharCode(ch$1071);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1071 === 92) {
            if (source$878.charCodeAt(index$880) !== 117) {
                throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
            }
            ++index$880;
            ch$1071 = scanHexEscape$909('u');
            if (!ch$1071 || ch$1071 === '\\' || !isIdentifierStart$902(ch$1071.charCodeAt(0))) {
                throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
            }
            id$1072 = ch$1071;
        }
        while (index$880 < length$887) {
            ch$1071 = source$878.charCodeAt(index$880);
            if (!isIdentifierPart$903(ch$1071)) {
                break;
            }
            ++index$880;
            id$1072 += String.fromCharCode(ch$1071);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1071 === 92) {
                id$1072 = id$1072.substr(0, id$1072.length - 1);
                if (source$878.charCodeAt(index$880) !== 117) {
                    throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
                }
                ++index$880;
                ch$1071 = scanHexEscape$909('u');
                if (!ch$1071 || ch$1071 === '\\' || !isIdentifierPart$903(ch$1071.charCodeAt(0))) {
                    throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
                }
                id$1072 += ch$1071;
            }
        }
        return id$1072;
    }
    function getIdentifier$912() {
        var start$1073, ch$1074;
        start$1073 = index$880++;
        while (index$880 < length$887) {
            ch$1074 = source$878.charCodeAt(index$880);
            if (ch$1074 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$880 = start$1073;
                return getEscapedIdentifier$911();
            }
            if (isIdentifierPart$903(ch$1074)) {
                ++index$880;
            } else {
                break;
            }
        }
        return source$878.slice(start$1073, index$880);
    }
    function scanIdentifier$913() {
        var start$1075, id$1076, type$1077;
        start$1075 = index$880;
        // Backslash (char #92) starts an escaped character.
        id$1076 = source$878.charCodeAt(index$880) === 92 ? getEscapedIdentifier$911() : getIdentifier$912();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1076.length === 1) {
            type$1077 = Token$869.Identifier;
        } else if (isKeyword$907(id$1076)) {
            type$1077 = Token$869.Keyword;
        } else if (id$1076 === 'null') {
            type$1077 = Token$869.NullLiteral;
        } else if (id$1076 === 'true' || id$1076 === 'false') {
            type$1077 = Token$869.BooleanLiteral;
        } else {
            type$1077 = Token$869.Identifier;
        }
        return {
            type: type$1077,
            value: id$1076,
            lineNumber: lineNumber$881,
            lineStart: lineStart$882,
            range: [
                start$1075,
                index$880
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$914() {
        var start$1078 = index$880, code$1079 = source$878.charCodeAt(index$880), code2$1080, ch1$1081 = source$878[index$880], ch2$1082, ch3$1083, ch4$1084;
        switch (code$1079) {
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
            ++index$880;
            if (extra$894.tokenize) {
                if (code$1079 === 40) {
                    extra$894.openParenToken = extra$894.tokens.length;
                } else if (code$1079 === 123) {
                    extra$894.openCurlyToken = extra$894.tokens.length;
                }
            }
            return {
                type: Token$869.Punctuator,
                value: String.fromCharCode(code$1079),
                lineNumber: lineNumber$881,
                lineStart: lineStart$882,
                range: [
                    start$1078,
                    index$880
                ]
            };
        default:
            code2$1080 = source$878.charCodeAt(index$880 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1080 === 61) {
                switch (code$1079) {
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
                    index$880 += 2;
                    return {
                        type: Token$869.Punctuator,
                        value: String.fromCharCode(code$1079) + String.fromCharCode(code2$1080),
                        lineNumber: lineNumber$881,
                        lineStart: lineStart$882,
                        range: [
                            start$1078,
                            index$880
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$880 += 2;
                    // !== and ===
                    if (source$878.charCodeAt(index$880) === 61) {
                        ++index$880;
                    }
                    return {
                        type: Token$869.Punctuator,
                        value: source$878.slice(start$1078, index$880),
                        lineNumber: lineNumber$881,
                        lineStart: lineStart$882,
                        range: [
                            start$1078,
                            index$880
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1082 = source$878[index$880 + 1];
        ch3$1083 = source$878[index$880 + 2];
        ch4$1084 = source$878[index$880 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1081 === '>' && ch2$1082 === '>' && ch3$1083 === '>') {
            if (ch4$1084 === '=') {
                index$880 += 4;
                return {
                    type: Token$869.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$881,
                    lineStart: lineStart$882,
                    range: [
                        start$1078,
                        index$880
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1081 === '>' && ch2$1082 === '>' && ch3$1083 === '>') {
            index$880 += 3;
            return {
                type: Token$869.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$881,
                lineStart: lineStart$882,
                range: [
                    start$1078,
                    index$880
                ]
            };
        }
        if (ch1$1081 === '<' && ch2$1082 === '<' && ch3$1083 === '=') {
            index$880 += 3;
            return {
                type: Token$869.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$881,
                lineStart: lineStart$882,
                range: [
                    start$1078,
                    index$880
                ]
            };
        }
        if (ch1$1081 === '>' && ch2$1082 === '>' && ch3$1083 === '=') {
            index$880 += 3;
            return {
                type: Token$869.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$881,
                lineStart: lineStart$882,
                range: [
                    start$1078,
                    index$880
                ]
            };
        }
        if (ch1$1081 === '.' && ch2$1082 === '.' && ch3$1083 === '.') {
            index$880 += 3;
            return {
                type: Token$869.Punctuator,
                value: '...',
                lineNumber: lineNumber$881,
                lineStart: lineStart$882,
                range: [
                    start$1078,
                    index$880
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1081 === ch2$1082 && '+-<>&|'.indexOf(ch1$1081) >= 0) {
            index$880 += 2;
            return {
                type: Token$869.Punctuator,
                value: ch1$1081 + ch2$1082,
                lineNumber: lineNumber$881,
                lineStart: lineStart$882,
                range: [
                    start$1078,
                    index$880
                ]
            };
        }
        if (ch1$1081 === '=' && ch2$1082 === '>') {
            index$880 += 2;
            return {
                type: Token$869.Punctuator,
                value: '=>',
                lineNumber: lineNumber$881,
                lineStart: lineStart$882,
                range: [
                    start$1078,
                    index$880
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1081) >= 0) {
            ++index$880;
            return {
                type: Token$869.Punctuator,
                value: ch1$1081,
                lineNumber: lineNumber$881,
                lineStart: lineStart$882,
                range: [
                    start$1078,
                    index$880
                ]
            };
        }
        if (ch1$1081 === '.') {
            ++index$880;
            return {
                type: Token$869.Punctuator,
                value: ch1$1081,
                lineNumber: lineNumber$881,
                lineStart: lineStart$882,
                range: [
                    start$1078,
                    index$880
                ]
            };
        }
        throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$915(start$1085) {
        var number$1086 = '';
        while (index$880 < length$887) {
            if (!isHexDigit$898(source$878[index$880])) {
                break;
            }
            number$1086 += source$878[index$880++];
        }
        if (number$1086.length === 0) {
            throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$902(source$878.charCodeAt(index$880))) {
            throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$869.NumericLiteral,
            value: parseInt('0x' + number$1086, 16),
            lineNumber: lineNumber$881,
            lineStart: lineStart$882,
            range: [
                start$1085,
                index$880
            ]
        };
    }
    function scanOctalLiteral$916(prefix$1087, start$1088) {
        var number$1089, octal$1090;
        if (isOctalDigit$899(prefix$1087)) {
            octal$1090 = true;
            number$1089 = '0' + source$878[index$880++];
        } else {
            octal$1090 = false;
            ++index$880;
            number$1089 = '';
        }
        while (index$880 < length$887) {
            if (!isOctalDigit$899(source$878[index$880])) {
                break;
            }
            number$1089 += source$878[index$880++];
        }
        if (!octal$1090 && number$1089.length === 0) {
            // only 0o or 0O
            throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$902(source$878.charCodeAt(index$880)) || isDecimalDigit$897(source$878.charCodeAt(index$880))) {
            throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$869.NumericLiteral,
            value: parseInt(number$1089, 8),
            octal: octal$1090,
            lineNumber: lineNumber$881,
            lineStart: lineStart$882,
            range: [
                start$1088,
                index$880
            ]
        };
    }
    function scanNumericLiteral$917() {
        var number$1091, start$1092, ch$1093, octal$1094;
        ch$1093 = source$878[index$880];
        assert$895(isDecimalDigit$897(ch$1093.charCodeAt(0)) || ch$1093 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1092 = index$880;
        number$1091 = '';
        if (ch$1093 !== '.') {
            number$1091 = source$878[index$880++];
            ch$1093 = source$878[index$880];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1091 === '0') {
                if (ch$1093 === 'x' || ch$1093 === 'X') {
                    ++index$880;
                    return scanHexLiteral$915(start$1092);
                }
                if (ch$1093 === 'b' || ch$1093 === 'B') {
                    ++index$880;
                    number$1091 = '';
                    while (index$880 < length$887) {
                        ch$1093 = source$878[index$880];
                        if (ch$1093 !== '0' && ch$1093 !== '1') {
                            break;
                        }
                        number$1091 += source$878[index$880++];
                    }
                    if (number$1091.length === 0) {
                        // only 0b or 0B
                        throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$880 < length$887) {
                        ch$1093 = source$878.charCodeAt(index$880);
                        if (isIdentifierStart$902(ch$1093) || isDecimalDigit$897(ch$1093)) {
                            throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$869.NumericLiteral,
                        value: parseInt(number$1091, 2),
                        lineNumber: lineNumber$881,
                        lineStart: lineStart$882,
                        range: [
                            start$1092,
                            index$880
                        ]
                    };
                }
                if (ch$1093 === 'o' || ch$1093 === 'O' || isOctalDigit$899(ch$1093)) {
                    return scanOctalLiteral$916(ch$1093, start$1092);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1093 && isDecimalDigit$897(ch$1093.charCodeAt(0))) {
                    throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$897(source$878.charCodeAt(index$880))) {
                number$1091 += source$878[index$880++];
            }
            ch$1093 = source$878[index$880];
        }
        if (ch$1093 === '.') {
            number$1091 += source$878[index$880++];
            while (isDecimalDigit$897(source$878.charCodeAt(index$880))) {
                number$1091 += source$878[index$880++];
            }
            ch$1093 = source$878[index$880];
        }
        if (ch$1093 === 'e' || ch$1093 === 'E') {
            number$1091 += source$878[index$880++];
            ch$1093 = source$878[index$880];
            if (ch$1093 === '+' || ch$1093 === '-') {
                number$1091 += source$878[index$880++];
            }
            if (isDecimalDigit$897(source$878.charCodeAt(index$880))) {
                while (isDecimalDigit$897(source$878.charCodeAt(index$880))) {
                    number$1091 += source$878[index$880++];
                }
            } else {
                throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$902(source$878.charCodeAt(index$880))) {
            throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$869.NumericLiteral,
            value: parseFloat(number$1091),
            lineNumber: lineNumber$881,
            lineStart: lineStart$882,
            range: [
                start$1092,
                index$880
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$918() {
        var str$1095 = '', quote$1096, start$1097, ch$1098, code$1099, unescaped$1100, restore$1101, octal$1102 = false;
        quote$1096 = source$878[index$880];
        assert$895(quote$1096 === '\'' || quote$1096 === '"', 'String literal must starts with a quote');
        start$1097 = index$880;
        ++index$880;
        while (index$880 < length$887) {
            ch$1098 = source$878[index$880++];
            if (ch$1098 === quote$1096) {
                quote$1096 = '';
                break;
            } else if (ch$1098 === '\\') {
                ch$1098 = source$878[index$880++];
                if (!ch$1098 || !isLineTerminator$901(ch$1098.charCodeAt(0))) {
                    switch (ch$1098) {
                    case 'n':
                        str$1095 += '\n';
                        break;
                    case 'r':
                        str$1095 += '\r';
                        break;
                    case 't':
                        str$1095 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$878[index$880] === '{') {
                            ++index$880;
                            str$1095 += scanUnicodeCodePointEscape$910();
                        } else {
                            restore$1101 = index$880;
                            unescaped$1100 = scanHexEscape$909(ch$1098);
                            if (unescaped$1100) {
                                str$1095 += unescaped$1100;
                            } else {
                                index$880 = restore$1101;
                                str$1095 += ch$1098;
                            }
                        }
                        break;
                    case 'b':
                        str$1095 += '\b';
                        break;
                    case 'f':
                        str$1095 += '\f';
                        break;
                    case 'v':
                        str$1095 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$899(ch$1098)) {
                            code$1099 = '01234567'.indexOf(ch$1098);
                            // \0 is not octal escape sequence
                            if (code$1099 !== 0) {
                                octal$1102 = true;
                            }
                            if (index$880 < length$887 && isOctalDigit$899(source$878[index$880])) {
                                octal$1102 = true;
                                code$1099 = code$1099 * 8 + '01234567'.indexOf(source$878[index$880++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1098) >= 0 && index$880 < length$887 && isOctalDigit$899(source$878[index$880])) {
                                    code$1099 = code$1099 * 8 + '01234567'.indexOf(source$878[index$880++]);
                                }
                            }
                            str$1095 += String.fromCharCode(code$1099);
                        } else {
                            str$1095 += ch$1098;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$881;
                    if (ch$1098 === '\r' && source$878[index$880] === '\n') {
                        ++index$880;
                    }
                }
            } else if (isLineTerminator$901(ch$1098.charCodeAt(0))) {
                break;
            } else {
                str$1095 += ch$1098;
            }
        }
        if (quote$1096 !== '') {
            throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$869.StringLiteral,
            value: str$1095,
            octal: octal$1102,
            lineNumber: lineNumber$881,
            lineStart: lineStart$882,
            range: [
                start$1097,
                index$880
            ]
        };
    }
    function scanTemplate$919() {
        var cooked$1103 = '', ch$1104, start$1105, terminated$1106, tail$1107, restore$1108, unescaped$1109, code$1110, octal$1111;
        terminated$1106 = false;
        tail$1107 = false;
        start$1105 = index$880;
        ++index$880;
        while (index$880 < length$887) {
            ch$1104 = source$878[index$880++];
            if (ch$1104 === '`') {
                tail$1107 = true;
                terminated$1106 = true;
                break;
            } else if (ch$1104 === '$') {
                if (source$878[index$880] === '{') {
                    ++index$880;
                    terminated$1106 = true;
                    break;
                }
                cooked$1103 += ch$1104;
            } else if (ch$1104 === '\\') {
                ch$1104 = source$878[index$880++];
                if (!isLineTerminator$901(ch$1104.charCodeAt(0))) {
                    switch (ch$1104) {
                    case 'n':
                        cooked$1103 += '\n';
                        break;
                    case 'r':
                        cooked$1103 += '\r';
                        break;
                    case 't':
                        cooked$1103 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$878[index$880] === '{') {
                            ++index$880;
                            cooked$1103 += scanUnicodeCodePointEscape$910();
                        } else {
                            restore$1108 = index$880;
                            unescaped$1109 = scanHexEscape$909(ch$1104);
                            if (unescaped$1109) {
                                cooked$1103 += unescaped$1109;
                            } else {
                                index$880 = restore$1108;
                                cooked$1103 += ch$1104;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1103 += '\b';
                        break;
                    case 'f':
                        cooked$1103 += '\f';
                        break;
                    case 'v':
                        cooked$1103 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$899(ch$1104)) {
                            code$1110 = '01234567'.indexOf(ch$1104);
                            // \0 is not octal escape sequence
                            if (code$1110 !== 0) {
                                octal$1111 = true;
                            }
                            if (index$880 < length$887 && isOctalDigit$899(source$878[index$880])) {
                                octal$1111 = true;
                                code$1110 = code$1110 * 8 + '01234567'.indexOf(source$878[index$880++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1104) >= 0 && index$880 < length$887 && isOctalDigit$899(source$878[index$880])) {
                                    code$1110 = code$1110 * 8 + '01234567'.indexOf(source$878[index$880++]);
                                }
                            }
                            cooked$1103 += String.fromCharCode(code$1110);
                        } else {
                            cooked$1103 += ch$1104;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$881;
                    if (ch$1104 === '\r' && source$878[index$880] === '\n') {
                        ++index$880;
                    }
                }
            } else if (isLineTerminator$901(ch$1104.charCodeAt(0))) {
                ++lineNumber$881;
                if (ch$1104 === '\r' && source$878[index$880] === '\n') {
                    ++index$880;
                }
                cooked$1103 += '\n';
            } else {
                cooked$1103 += ch$1104;
            }
        }
        if (!terminated$1106) {
            throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$869.Template,
            value: {
                cooked: cooked$1103,
                raw: source$878.slice(start$1105 + 1, index$880 - (tail$1107 ? 1 : 2))
            },
            tail: tail$1107,
            octal: octal$1111,
            lineNumber: lineNumber$881,
            lineStart: lineStart$882,
            range: [
                start$1105,
                index$880
            ]
        };
    }
    function scanTemplateElement$920(option$1112) {
        var startsWith$1113, template$1114;
        lookahead$891 = null;
        skipComment$908();
        startsWith$1113 = option$1112.head ? '`' : '}';
        if (source$878[index$880] !== startsWith$1113) {
            throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
        }
        template$1114 = scanTemplate$919();
        peek$926();
        return template$1114;
    }
    function scanRegExp$921() {
        var str$1115, ch$1116, start$1117, pattern$1118, flags$1119, value$1120, classMarker$1121 = false, restore$1122, terminated$1123 = false;
        lookahead$891 = null;
        skipComment$908();
        start$1117 = index$880;
        ch$1116 = source$878[index$880];
        assert$895(ch$1116 === '/', 'Regular expression literal must start with a slash');
        str$1115 = source$878[index$880++];
        while (index$880 < length$887) {
            ch$1116 = source$878[index$880++];
            str$1115 += ch$1116;
            if (classMarker$1121) {
                if (ch$1116 === ']') {
                    classMarker$1121 = false;
                }
            } else {
                if (ch$1116 === '\\') {
                    ch$1116 = source$878[index$880++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$901(ch$1116.charCodeAt(0))) {
                        throwError$929({}, Messages$874.UnterminatedRegExp);
                    }
                    str$1115 += ch$1116;
                } else if (ch$1116 === '/') {
                    terminated$1123 = true;
                    break;
                } else if (ch$1116 === '[') {
                    classMarker$1121 = true;
                } else if (isLineTerminator$901(ch$1116.charCodeAt(0))) {
                    throwError$929({}, Messages$874.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1123) {
            throwError$929({}, Messages$874.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1118 = str$1115.substr(1, str$1115.length - 2);
        flags$1119 = '';
        while (index$880 < length$887) {
            ch$1116 = source$878[index$880];
            if (!isIdentifierPart$903(ch$1116.charCodeAt(0))) {
                break;
            }
            ++index$880;
            if (ch$1116 === '\\' && index$880 < length$887) {
                ch$1116 = source$878[index$880];
                if (ch$1116 === 'u') {
                    ++index$880;
                    restore$1122 = index$880;
                    ch$1116 = scanHexEscape$909('u');
                    if (ch$1116) {
                        flags$1119 += ch$1116;
                        for (str$1115 += '\\u'; restore$1122 < index$880; ++restore$1122) {
                            str$1115 += source$878[restore$1122];
                        }
                    } else {
                        index$880 = restore$1122;
                        flags$1119 += 'u';
                        str$1115 += '\\u';
                    }
                } else {
                    str$1115 += '\\';
                }
            } else {
                flags$1119 += ch$1116;
                str$1115 += ch$1116;
            }
        }
        try {
            value$1120 = new RegExp(pattern$1118, flags$1119);
        } catch (e$1124) {
            throwError$929({}, Messages$874.InvalidRegExp);
        }
        // peek();
        if (extra$894.tokenize) {
            return {
                type: Token$869.RegularExpression,
                value: value$1120,
                lineNumber: lineNumber$881,
                lineStart: lineStart$882,
                range: [
                    start$1117,
                    index$880
                ]
            };
        }
        return {
            type: Token$869.RegularExpression,
            literal: str$1115,
            value: value$1120,
            range: [
                start$1117,
                index$880
            ]
        };
    }
    function isIdentifierName$922(token$1125) {
        return token$1125.type === Token$869.Identifier || token$1125.type === Token$869.Keyword || token$1125.type === Token$869.BooleanLiteral || token$1125.type === Token$869.NullLiteral;
    }
    function advanceSlash$923() {
        var prevToken$1126, checkToken$1127;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1126 = extra$894.tokens[extra$894.tokens.length - 1];
        if (!prevToken$1126) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$921();
        }
        if (prevToken$1126.type === 'Punctuator') {
            if (prevToken$1126.value === ')') {
                checkToken$1127 = extra$894.tokens[extra$894.openParenToken - 1];
                if (checkToken$1127 && checkToken$1127.type === 'Keyword' && (checkToken$1127.value === 'if' || checkToken$1127.value === 'while' || checkToken$1127.value === 'for' || checkToken$1127.value === 'with')) {
                    return scanRegExp$921();
                }
                return scanPunctuator$914();
            }
            if (prevToken$1126.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$894.tokens[extra$894.openCurlyToken - 3] && extra$894.tokens[extra$894.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1127 = extra$894.tokens[extra$894.openCurlyToken - 4];
                    if (!checkToken$1127) {
                        return scanPunctuator$914();
                    }
                } else if (extra$894.tokens[extra$894.openCurlyToken - 4] && extra$894.tokens[extra$894.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1127 = extra$894.tokens[extra$894.openCurlyToken - 5];
                    if (!checkToken$1127) {
                        return scanRegExp$921();
                    }
                } else {
                    return scanPunctuator$914();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$871.indexOf(checkToken$1127.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$914();
                }
                // It is a declaration.
                return scanRegExp$921();
            }
            return scanRegExp$921();
        }
        if (prevToken$1126.type === 'Keyword') {
            return scanRegExp$921();
        }
        return scanPunctuator$914();
    }
    function advance$924() {
        var ch$1128;
        skipComment$908();
        if (index$880 >= length$887) {
            return {
                type: Token$869.EOF,
                lineNumber: lineNumber$881,
                lineStart: lineStart$882,
                range: [
                    index$880,
                    index$880
                ]
            };
        }
        ch$1128 = source$878.charCodeAt(index$880);
        // Very common: ( and ) and ;
        if (ch$1128 === 40 || ch$1128 === 41 || ch$1128 === 58) {
            return scanPunctuator$914();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1128 === 39 || ch$1128 === 34) {
            return scanStringLiteral$918();
        }
        if (ch$1128 === 96) {
            return scanTemplate$919();
        }
        if (isIdentifierStart$902(ch$1128)) {
            return scanIdentifier$913();
        }
        // # and @ are allowed for sweet.js
        if (ch$1128 === 35 || ch$1128 === 64) {
            ++index$880;
            return {
                type: Token$869.Punctuator,
                value: String.fromCharCode(ch$1128),
                lineNumber: lineNumber$881,
                lineStart: lineStart$882,
                range: [
                    index$880 - 1,
                    index$880
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1128 === 46) {
            if (isDecimalDigit$897(source$878.charCodeAt(index$880 + 1))) {
                return scanNumericLiteral$917();
            }
            return scanPunctuator$914();
        }
        if (isDecimalDigit$897(ch$1128)) {
            return scanNumericLiteral$917();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$894.tokenize && ch$1128 === 47) {
            return advanceSlash$923();
        }
        return scanPunctuator$914();
    }
    function lex$925() {
        var token$1129;
        token$1129 = lookahead$891;
        streamIndex$890 = lookaheadIndex$892;
        lineNumber$881 = token$1129.lineNumber;
        lineStart$882 = token$1129.lineStart;
        sm_lineNumber$883 = lookahead$891.sm_lineNumber;
        sm_lineStart$884 = lookahead$891.sm_lineStart;
        sm_range$885 = lookahead$891.sm_range;
        sm_index$886 = lookahead$891.sm_range[0];
        lookahead$891 = tokenStream$889[++streamIndex$890].token;
        lookaheadIndex$892 = streamIndex$890;
        index$880 = lookahead$891.range[0];
        return token$1129;
    }
    function peek$926() {
        lookaheadIndex$892 = streamIndex$890 + 1;
        if (lookaheadIndex$892 >= length$887) {
            lookahead$891 = {
                type: Token$869.EOF,
                lineNumber: lineNumber$881,
                lineStart: lineStart$882,
                range: [
                    index$880,
                    index$880
                ]
            };
            return;
        }
        lookahead$891 = tokenStream$889[lookaheadIndex$892].token;
        index$880 = lookahead$891.range[0];
    }
    function lookahead2$927() {
        var adv$1130, pos$1131, line$1132, start$1133, result$1134;
        if (streamIndex$890 + 1 >= length$887 || streamIndex$890 + 2 >= length$887) {
            return {
                type: Token$869.EOF,
                lineNumber: lineNumber$881,
                lineStart: lineStart$882,
                range: [
                    index$880,
                    index$880
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$891 === null) {
            lookaheadIndex$892 = streamIndex$890 + 1;
            lookahead$891 = tokenStream$889[lookaheadIndex$892].token;
            index$880 = lookahead$891.range[0];
        }
        result$1134 = tokenStream$889[lookaheadIndex$892 + 1].token;
        return result$1134;
    }
    SyntaxTreeDelegate$876 = {
        name: 'SyntaxTree',
        postProcess: function (node$1135) {
            return node$1135;
        },
        createArrayExpression: function (elements$1136) {
            return {
                type: Syntax$872.ArrayExpression,
                elements: elements$1136
            };
        },
        createAssignmentExpression: function (operator$1137, left$1138, right$1139) {
            return {
                type: Syntax$872.AssignmentExpression,
                operator: operator$1137,
                left: left$1138,
                right: right$1139
            };
        },
        createBinaryExpression: function (operator$1140, left$1141, right$1142) {
            var type$1143 = operator$1140 === '||' || operator$1140 === '&&' ? Syntax$872.LogicalExpression : Syntax$872.BinaryExpression;
            return {
                type: type$1143,
                operator: operator$1140,
                left: left$1141,
                right: right$1142
            };
        },
        createBlockStatement: function (body$1144) {
            return {
                type: Syntax$872.BlockStatement,
                body: body$1144
            };
        },
        createBreakStatement: function (label$1145) {
            return {
                type: Syntax$872.BreakStatement,
                label: label$1145
            };
        },
        createCallExpression: function (callee$1146, args$1147) {
            return {
                type: Syntax$872.CallExpression,
                callee: callee$1146,
                'arguments': args$1147
            };
        },
        createCatchClause: function (param$1148, body$1149) {
            return {
                type: Syntax$872.CatchClause,
                param: param$1148,
                body: body$1149
            };
        },
        createConditionalExpression: function (test$1150, consequent$1151, alternate$1152) {
            return {
                type: Syntax$872.ConditionalExpression,
                test: test$1150,
                consequent: consequent$1151,
                alternate: alternate$1152
            };
        },
        createContinueStatement: function (label$1153) {
            return {
                type: Syntax$872.ContinueStatement,
                label: label$1153
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$872.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1154, test$1155) {
            return {
                type: Syntax$872.DoWhileStatement,
                body: body$1154,
                test: test$1155
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$872.EmptyStatement };
        },
        createExpressionStatement: function (expression$1156) {
            return {
                type: Syntax$872.ExpressionStatement,
                expression: expression$1156
            };
        },
        createForStatement: function (init$1157, test$1158, update$1159, body$1160) {
            return {
                type: Syntax$872.ForStatement,
                init: init$1157,
                test: test$1158,
                update: update$1159,
                body: body$1160
            };
        },
        createForInStatement: function (left$1161, right$1162, body$1163) {
            return {
                type: Syntax$872.ForInStatement,
                left: left$1161,
                right: right$1162,
                body: body$1163,
                each: false
            };
        },
        createForOfStatement: function (left$1164, right$1165, body$1166) {
            return {
                type: Syntax$872.ForOfStatement,
                left: left$1164,
                right: right$1165,
                body: body$1166
            };
        },
        createFunctionDeclaration: function (id$1167, params$1168, defaults$1169, body$1170, rest$1171, generator$1172, expression$1173) {
            return {
                type: Syntax$872.FunctionDeclaration,
                id: id$1167,
                params: params$1168,
                defaults: defaults$1169,
                body: body$1170,
                rest: rest$1171,
                generator: generator$1172,
                expression: expression$1173
            };
        },
        createFunctionExpression: function (id$1174, params$1175, defaults$1176, body$1177, rest$1178, generator$1179, expression$1180) {
            return {
                type: Syntax$872.FunctionExpression,
                id: id$1174,
                params: params$1175,
                defaults: defaults$1176,
                body: body$1177,
                rest: rest$1178,
                generator: generator$1179,
                expression: expression$1180
            };
        },
        createIdentifier: function (name$1181) {
            return {
                type: Syntax$872.Identifier,
                name: name$1181
            };
        },
        createIfStatement: function (test$1182, consequent$1183, alternate$1184) {
            return {
                type: Syntax$872.IfStatement,
                test: test$1182,
                consequent: consequent$1183,
                alternate: alternate$1184
            };
        },
        createLabeledStatement: function (label$1185, body$1186) {
            return {
                type: Syntax$872.LabeledStatement,
                label: label$1185,
                body: body$1186
            };
        },
        createLiteral: function (token$1187) {
            return {
                type: Syntax$872.Literal,
                value: token$1187.value,
                raw: String(token$1187.value)
            };
        },
        createMemberExpression: function (accessor$1188, object$1189, property$1190) {
            return {
                type: Syntax$872.MemberExpression,
                computed: accessor$1188 === '[',
                object: object$1189,
                property: property$1190
            };
        },
        createNewExpression: function (callee$1191, args$1192) {
            return {
                type: Syntax$872.NewExpression,
                callee: callee$1191,
                'arguments': args$1192
            };
        },
        createObjectExpression: function (properties$1193) {
            return {
                type: Syntax$872.ObjectExpression,
                properties: properties$1193
            };
        },
        createPostfixExpression: function (operator$1194, argument$1195) {
            return {
                type: Syntax$872.UpdateExpression,
                operator: operator$1194,
                argument: argument$1195,
                prefix: false
            };
        },
        createProgram: function (body$1196) {
            return {
                type: Syntax$872.Program,
                body: body$1196
            };
        },
        createProperty: function (kind$1197, key$1198, value$1199, method$1200, shorthand$1201) {
            return {
                type: Syntax$872.Property,
                key: key$1198,
                value: value$1199,
                kind: kind$1197,
                method: method$1200,
                shorthand: shorthand$1201
            };
        },
        createReturnStatement: function (argument$1202) {
            return {
                type: Syntax$872.ReturnStatement,
                argument: argument$1202
            };
        },
        createSequenceExpression: function (expressions$1203) {
            return {
                type: Syntax$872.SequenceExpression,
                expressions: expressions$1203
            };
        },
        createSwitchCase: function (test$1204, consequent$1205) {
            return {
                type: Syntax$872.SwitchCase,
                test: test$1204,
                consequent: consequent$1205
            };
        },
        createSwitchStatement: function (discriminant$1206, cases$1207) {
            return {
                type: Syntax$872.SwitchStatement,
                discriminant: discriminant$1206,
                cases: cases$1207
            };
        },
        createThisExpression: function () {
            return { type: Syntax$872.ThisExpression };
        },
        createThrowStatement: function (argument$1208) {
            return {
                type: Syntax$872.ThrowStatement,
                argument: argument$1208
            };
        },
        createTryStatement: function (block$1209, guardedHandlers$1210, handlers$1211, finalizer$1212) {
            return {
                type: Syntax$872.TryStatement,
                block: block$1209,
                guardedHandlers: guardedHandlers$1210,
                handlers: handlers$1211,
                finalizer: finalizer$1212
            };
        },
        createUnaryExpression: function (operator$1213, argument$1214) {
            if (operator$1213 === '++' || operator$1213 === '--') {
                return {
                    type: Syntax$872.UpdateExpression,
                    operator: operator$1213,
                    argument: argument$1214,
                    prefix: true
                };
            }
            return {
                type: Syntax$872.UnaryExpression,
                operator: operator$1213,
                argument: argument$1214
            };
        },
        createVariableDeclaration: function (declarations$1215, kind$1216) {
            return {
                type: Syntax$872.VariableDeclaration,
                declarations: declarations$1215,
                kind: kind$1216
            };
        },
        createVariableDeclarator: function (id$1217, init$1218) {
            return {
                type: Syntax$872.VariableDeclarator,
                id: id$1217,
                init: init$1218
            };
        },
        createWhileStatement: function (test$1219, body$1220) {
            return {
                type: Syntax$872.WhileStatement,
                test: test$1219,
                body: body$1220
            };
        },
        createWithStatement: function (object$1221, body$1222) {
            return {
                type: Syntax$872.WithStatement,
                object: object$1221,
                body: body$1222
            };
        },
        createTemplateElement: function (value$1223, tail$1224) {
            return {
                type: Syntax$872.TemplateElement,
                value: value$1223,
                tail: tail$1224
            };
        },
        createTemplateLiteral: function (quasis$1225, expressions$1226) {
            return {
                type: Syntax$872.TemplateLiteral,
                quasis: quasis$1225,
                expressions: expressions$1226
            };
        },
        createSpreadElement: function (argument$1227) {
            return {
                type: Syntax$872.SpreadElement,
                argument: argument$1227
            };
        },
        createTaggedTemplateExpression: function (tag$1228, quasi$1229) {
            return {
                type: Syntax$872.TaggedTemplateExpression,
                tag: tag$1228,
                quasi: quasi$1229
            };
        },
        createArrowFunctionExpression: function (params$1230, defaults$1231, body$1232, rest$1233, expression$1234) {
            return {
                type: Syntax$872.ArrowFunctionExpression,
                id: null,
                params: params$1230,
                defaults: defaults$1231,
                body: body$1232,
                rest: rest$1233,
                generator: false,
                expression: expression$1234
            };
        },
        createMethodDefinition: function (propertyType$1235, kind$1236, key$1237, value$1238) {
            return {
                type: Syntax$872.MethodDefinition,
                key: key$1237,
                value: value$1238,
                kind: kind$1236,
                'static': propertyType$1235 === ClassPropertyType$877.static
            };
        },
        createClassBody: function (body$1239) {
            return {
                type: Syntax$872.ClassBody,
                body: body$1239
            };
        },
        createClassExpression: function (id$1240, superClass$1241, body$1242) {
            return {
                type: Syntax$872.ClassExpression,
                id: id$1240,
                superClass: superClass$1241,
                body: body$1242
            };
        },
        createClassDeclaration: function (id$1243, superClass$1244, body$1245) {
            return {
                type: Syntax$872.ClassDeclaration,
                id: id$1243,
                superClass: superClass$1244,
                body: body$1245
            };
        },
        createExportSpecifier: function (id$1246, name$1247) {
            return {
                type: Syntax$872.ExportSpecifier,
                id: id$1246,
                name: name$1247
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$872.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1248, specifiers$1249, source$1250) {
            return {
                type: Syntax$872.ExportDeclaration,
                declaration: declaration$1248,
                specifiers: specifiers$1249,
                source: source$1250
            };
        },
        createImportSpecifier: function (id$1251, name$1252) {
            return {
                type: Syntax$872.ImportSpecifier,
                id: id$1251,
                name: name$1252
            };
        },
        createImportDeclaration: function (specifiers$1253, kind$1254, source$1255) {
            return {
                type: Syntax$872.ImportDeclaration,
                specifiers: specifiers$1253,
                kind: kind$1254,
                source: source$1255
            };
        },
        createYieldExpression: function (argument$1256, delegate$1257) {
            return {
                type: Syntax$872.YieldExpression,
                argument: argument$1256,
                delegate: delegate$1257
            };
        },
        createModuleDeclaration: function (id$1258, source$1259, body$1260) {
            return {
                type: Syntax$872.ModuleDeclaration,
                id: id$1258,
                source: source$1259,
                body: body$1260
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$928() {
        return lookahead$891.lineNumber !== lineNumber$881;
    }
    // Throw an exception
    function throwError$929(token$1261, messageFormat$1262) {
        var error$1263, args$1264 = Array.prototype.slice.call(arguments, 2), msg$1265 = messageFormat$1262.replace(/%(\d)/g, function (whole$1269, index$1270) {
                assert$895(index$1270 < args$1264.length, 'Message reference must be in range');
                return args$1264[index$1270];
            });
        var startIndex$1266 = streamIndex$890 > 3 ? streamIndex$890 - 3 : 0;
        var toks$1267 = '', tailingMsg$1268 = '';
        if (tokenStream$889) {
            toks$1267 = tokenStream$889.slice(startIndex$1266, streamIndex$890 + 3).map(function (stx$1271) {
                return stx$1271.token.value;
            }).join(' ');
            tailingMsg$1268 = '\n[... ' + toks$1267 + ' ...]';
        }
        if (typeof token$1261.lineNumber === 'number') {
            error$1263 = new Error('Line ' + token$1261.lineNumber + ': ' + msg$1265 + tailingMsg$1268);
            error$1263.index = token$1261.range[0];
            error$1263.lineNumber = token$1261.lineNumber;
            error$1263.column = token$1261.range[0] - lineStart$882 + 1;
        } else {
            error$1263 = new Error('Line ' + lineNumber$881 + ': ' + msg$1265 + tailingMsg$1268);
            error$1263.index = index$880;
            error$1263.lineNumber = lineNumber$881;
            error$1263.column = index$880 - lineStart$882 + 1;
        }
        error$1263.description = msg$1265;
        throw error$1263;
    }
    function throwErrorTolerant$930() {
        try {
            throwError$929.apply(null, arguments);
        } catch (e$1272) {
            if (extra$894.errors) {
                extra$894.errors.push(e$1272);
            } else {
                throw e$1272;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$931(token$1273) {
        if (token$1273.type === Token$869.EOF) {
            throwError$929(token$1273, Messages$874.UnexpectedEOS);
        }
        if (token$1273.type === Token$869.NumericLiteral) {
            throwError$929(token$1273, Messages$874.UnexpectedNumber);
        }
        if (token$1273.type === Token$869.StringLiteral) {
            throwError$929(token$1273, Messages$874.UnexpectedString);
        }
        if (token$1273.type === Token$869.Identifier) {
            throwError$929(token$1273, Messages$874.UnexpectedIdentifier);
        }
        if (token$1273.type === Token$869.Keyword) {
            if (isFutureReservedWord$904(token$1273.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$879 && isStrictModeReservedWord$905(token$1273.value)) {
                throwErrorTolerant$930(token$1273, Messages$874.StrictReservedWord);
                return;
            }
            throwError$929(token$1273, Messages$874.UnexpectedToken, token$1273.value);
        }
        if (token$1273.type === Token$869.Template) {
            throwError$929(token$1273, Messages$874.UnexpectedTemplate, token$1273.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$929(token$1273, Messages$874.UnexpectedToken, token$1273.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$932(value$1274) {
        var token$1275 = lex$925();
        if (token$1275.type !== Token$869.Punctuator || token$1275.value !== value$1274) {
            throwUnexpected$931(token$1275);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$933(keyword$1276) {
        var token$1277 = lex$925();
        if (token$1277.type !== Token$869.Keyword || token$1277.value !== keyword$1276) {
            throwUnexpected$931(token$1277);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$934(value$1278) {
        return lookahead$891.type === Token$869.Punctuator && lookahead$891.value === value$1278;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$935(keyword$1279) {
        return lookahead$891.type === Token$869.Keyword && lookahead$891.value === keyword$1279;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$936(keyword$1280) {
        return lookahead$891.type === Token$869.Identifier && lookahead$891.value === keyword$1280;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$937() {
        var op$1281;
        if (lookahead$891.type !== Token$869.Punctuator) {
            return false;
        }
        op$1281 = lookahead$891.value;
        return op$1281 === '=' || op$1281 === '*=' || op$1281 === '/=' || op$1281 === '%=' || op$1281 === '+=' || op$1281 === '-=' || op$1281 === '<<=' || op$1281 === '>>=' || op$1281 === '>>>=' || op$1281 === '&=' || op$1281 === '^=' || op$1281 === '|=';
    }
    function consumeSemicolon$938() {
        var line$1282, ch$1283;
        ch$1283 = lookahead$891.value ? String(lookahead$891.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1283 === 59) {
            lex$925();
            return;
        }
        if (lookahead$891.lineNumber !== lineNumber$881) {
            return;
        }
        if (match$934(';')) {
            lex$925();
            return;
        }
        if (lookahead$891.type !== Token$869.EOF && !match$934('}')) {
            throwUnexpected$931(lookahead$891);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$939(expr$1284) {
        return expr$1284.type === Syntax$872.Identifier || expr$1284.type === Syntax$872.MemberExpression;
    }
    function isAssignableLeftHandSide$940(expr$1285) {
        return isLeftHandSide$939(expr$1285) || expr$1285.type === Syntax$872.ObjectPattern || expr$1285.type === Syntax$872.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$941() {
        var elements$1286 = [], blocks$1287 = [], filter$1288 = null, tmp$1289, possiblecomprehension$1290 = true, body$1291;
        expect$932('[');
        while (!match$934(']')) {
            if (lookahead$891.value === 'for' && lookahead$891.type === Token$869.Keyword) {
                if (!possiblecomprehension$1290) {
                    throwError$929({}, Messages$874.ComprehensionError);
                }
                matchKeyword$935('for');
                tmp$1289 = parseForStatement$989({ ignoreBody: true });
                tmp$1289.of = tmp$1289.type === Syntax$872.ForOfStatement;
                tmp$1289.type = Syntax$872.ComprehensionBlock;
                if (tmp$1289.left.kind) {
                    // can't be let or const
                    throwError$929({}, Messages$874.ComprehensionError);
                }
                blocks$1287.push(tmp$1289);
            } else if (lookahead$891.value === 'if' && lookahead$891.type === Token$869.Keyword) {
                if (!possiblecomprehension$1290) {
                    throwError$929({}, Messages$874.ComprehensionError);
                }
                expectKeyword$933('if');
                expect$932('(');
                filter$1288 = parseExpression$969();
                expect$932(')');
            } else if (lookahead$891.value === ',' && lookahead$891.type === Token$869.Punctuator) {
                possiblecomprehension$1290 = false;
                // no longer allowed.
                lex$925();
                elements$1286.push(null);
            } else {
                tmp$1289 = parseSpreadOrAssignmentExpression$952();
                elements$1286.push(tmp$1289);
                if (tmp$1289 && tmp$1289.type === Syntax$872.SpreadElement) {
                    if (!match$934(']')) {
                        throwError$929({}, Messages$874.ElementAfterSpreadElement);
                    }
                } else if (!(match$934(']') || matchKeyword$935('for') || matchKeyword$935('if'))) {
                    expect$932(',');
                    // this lexes.
                    possiblecomprehension$1290 = false;
                }
            }
        }
        expect$932(']');
        if (filter$1288 && !blocks$1287.length) {
            throwError$929({}, Messages$874.ComprehensionRequiresBlock);
        }
        if (blocks$1287.length) {
            if (elements$1286.length !== 1) {
                throwError$929({}, Messages$874.ComprehensionError);
            }
            return {
                type: Syntax$872.ComprehensionExpression,
                filter: filter$1288,
                blocks: blocks$1287,
                body: elements$1286[0]
            };
        }
        return delegate$888.createArrayExpression(elements$1286);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$942(options$1292) {
        var previousStrict$1293, previousYieldAllowed$1294, params$1295, defaults$1296, body$1297;
        previousStrict$1293 = strict$879;
        previousYieldAllowed$1294 = state$893.yieldAllowed;
        state$893.yieldAllowed = options$1292.generator;
        params$1295 = options$1292.params || [];
        defaults$1296 = options$1292.defaults || [];
        body$1297 = parseConciseBody$1001();
        if (options$1292.name && strict$879 && isRestrictedWord$906(params$1295[0].name)) {
            throwErrorTolerant$930(options$1292.name, Messages$874.StrictParamName);
        }
        if (state$893.yieldAllowed && !state$893.yieldFound) {
            throwErrorTolerant$930({}, Messages$874.NoYieldInGenerator);
        }
        strict$879 = previousStrict$1293;
        state$893.yieldAllowed = previousYieldAllowed$1294;
        return delegate$888.createFunctionExpression(null, params$1295, defaults$1296, body$1297, options$1292.rest || null, options$1292.generator, body$1297.type !== Syntax$872.BlockStatement);
    }
    function parsePropertyMethodFunction$943(options$1298) {
        var previousStrict$1299, tmp$1300, method$1301;
        previousStrict$1299 = strict$879;
        strict$879 = true;
        tmp$1300 = parseParams$1005();
        if (tmp$1300.stricted) {
            throwErrorTolerant$930(tmp$1300.stricted, tmp$1300.message);
        }
        method$1301 = parsePropertyFunction$942({
            params: tmp$1300.params,
            defaults: tmp$1300.defaults,
            rest: tmp$1300.rest,
            generator: options$1298.generator
        });
        strict$879 = previousStrict$1299;
        return method$1301;
    }
    function parseObjectPropertyKey$944() {
        var token$1302 = lex$925();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1302.type === Token$869.StringLiteral || token$1302.type === Token$869.NumericLiteral) {
            if (strict$879 && token$1302.octal) {
                throwErrorTolerant$930(token$1302, Messages$874.StrictOctalLiteral);
            }
            return delegate$888.createLiteral(token$1302);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$888.createIdentifier(token$1302.value);
    }
    function parseObjectProperty$945() {
        var token$1303, key$1304, id$1305, value$1306, param$1307;
        token$1303 = lookahead$891;
        if (token$1303.type === Token$869.Identifier) {
            id$1305 = parseObjectPropertyKey$944();
            // Property Assignment: Getter and Setter.
            if (token$1303.value === 'get' && !(match$934(':') || match$934('('))) {
                key$1304 = parseObjectPropertyKey$944();
                expect$932('(');
                expect$932(')');
                return delegate$888.createProperty('get', key$1304, parsePropertyFunction$942({ generator: false }), false, false);
            }
            if (token$1303.value === 'set' && !(match$934(':') || match$934('('))) {
                key$1304 = parseObjectPropertyKey$944();
                expect$932('(');
                token$1303 = lookahead$891;
                param$1307 = [parseVariableIdentifier$972()];
                expect$932(')');
                return delegate$888.createProperty('set', key$1304, parsePropertyFunction$942({
                    params: param$1307,
                    generator: false,
                    name: token$1303
                }), false, false);
            }
            if (match$934(':')) {
                lex$925();
                return delegate$888.createProperty('init', id$1305, parseAssignmentExpression$968(), false, false);
            }
            if (match$934('(')) {
                return delegate$888.createProperty('init', id$1305, parsePropertyMethodFunction$943({ generator: false }), true, false);
            }
            return delegate$888.createProperty('init', id$1305, id$1305, false, true);
        }
        if (token$1303.type === Token$869.EOF || token$1303.type === Token$869.Punctuator) {
            if (!match$934('*')) {
                throwUnexpected$931(token$1303);
            }
            lex$925();
            id$1305 = parseObjectPropertyKey$944();
            if (!match$934('(')) {
                throwUnexpected$931(lex$925());
            }
            return delegate$888.createProperty('init', id$1305, parsePropertyMethodFunction$943({ generator: true }), true, false);
        }
        key$1304 = parseObjectPropertyKey$944();
        if (match$934(':')) {
            lex$925();
            return delegate$888.createProperty('init', key$1304, parseAssignmentExpression$968(), false, false);
        }
        if (match$934('(')) {
            return delegate$888.createProperty('init', key$1304, parsePropertyMethodFunction$943({ generator: false }), true, false);
        }
        throwUnexpected$931(lex$925());
    }
    function parseObjectInitialiser$946() {
        var properties$1308 = [], property$1309, name$1310, key$1311, kind$1312, map$1313 = {}, toString$1314 = String;
        expect$932('{');
        while (!match$934('}')) {
            property$1309 = parseObjectProperty$945();
            if (property$1309.key.type === Syntax$872.Identifier) {
                name$1310 = property$1309.key.name;
            } else {
                name$1310 = toString$1314(property$1309.key.value);
            }
            kind$1312 = property$1309.kind === 'init' ? PropertyKind$873.Data : property$1309.kind === 'get' ? PropertyKind$873.Get : PropertyKind$873.Set;
            key$1311 = '$' + name$1310;
            if (Object.prototype.hasOwnProperty.call(map$1313, key$1311)) {
                if (map$1313[key$1311] === PropertyKind$873.Data) {
                    if (strict$879 && kind$1312 === PropertyKind$873.Data) {
                        throwErrorTolerant$930({}, Messages$874.StrictDuplicateProperty);
                    } else if (kind$1312 !== PropertyKind$873.Data) {
                        throwErrorTolerant$930({}, Messages$874.AccessorDataProperty);
                    }
                } else {
                    if (kind$1312 === PropertyKind$873.Data) {
                        throwErrorTolerant$930({}, Messages$874.AccessorDataProperty);
                    } else if (map$1313[key$1311] & kind$1312) {
                        throwErrorTolerant$930({}, Messages$874.AccessorGetSet);
                    }
                }
                map$1313[key$1311] |= kind$1312;
            } else {
                map$1313[key$1311] = kind$1312;
            }
            properties$1308.push(property$1309);
            if (!match$934('}')) {
                expect$932(',');
            }
        }
        expect$932('}');
        return delegate$888.createObjectExpression(properties$1308);
    }
    function parseTemplateElement$947(option$1315) {
        var token$1316 = lex$925();
        if (strict$879 && token$1316.octal) {
            throwError$929(token$1316, Messages$874.StrictOctalLiteral);
        }
        return delegate$888.createTemplateElement({
            raw: token$1316.value.raw,
            cooked: token$1316.value.cooked
        }, token$1316.tail);
    }
    function parseTemplateLiteral$948() {
        var quasi$1317, quasis$1318, expressions$1319;
        quasi$1317 = parseTemplateElement$947({ head: true });
        quasis$1318 = [quasi$1317];
        expressions$1319 = [];
        while (!quasi$1317.tail) {
            expressions$1319.push(parseExpression$969());
            quasi$1317 = parseTemplateElement$947({ head: false });
            quasis$1318.push(quasi$1317);
        }
        return delegate$888.createTemplateLiteral(quasis$1318, expressions$1319);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$949() {
        var expr$1320;
        expect$932('(');
        ++state$893.parenthesizedCount;
        expr$1320 = parseExpression$969();
        expect$932(')');
        return expr$1320;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$950() {
        var type$1321, token$1322, resolvedIdent$1323;
        token$1322 = lookahead$891;
        type$1321 = lookahead$891.type;
        if (type$1321 === Token$869.Identifier) {
            resolvedIdent$1323 = expander$868.resolve(tokenStream$889[lookaheadIndex$892]);
            lex$925();
            return delegate$888.createIdentifier(resolvedIdent$1323);
        }
        if (type$1321 === Token$869.StringLiteral || type$1321 === Token$869.NumericLiteral) {
            if (strict$879 && lookahead$891.octal) {
                throwErrorTolerant$930(lookahead$891, Messages$874.StrictOctalLiteral);
            }
            return delegate$888.createLiteral(lex$925());
        }
        if (type$1321 === Token$869.Keyword) {
            if (matchKeyword$935('this')) {
                lex$925();
                return delegate$888.createThisExpression();
            }
            if (matchKeyword$935('function')) {
                return parseFunctionExpression$1007();
            }
            if (matchKeyword$935('class')) {
                return parseClassExpression$1012();
            }
            if (matchKeyword$935('super')) {
                lex$925();
                return delegate$888.createIdentifier('super');
            }
        }
        if (type$1321 === Token$869.BooleanLiteral) {
            token$1322 = lex$925();
            token$1322.value = token$1322.value === 'true';
            return delegate$888.createLiteral(token$1322);
        }
        if (type$1321 === Token$869.NullLiteral) {
            token$1322 = lex$925();
            token$1322.value = null;
            return delegate$888.createLiteral(token$1322);
        }
        if (match$934('[')) {
            return parseArrayInitialiser$941();
        }
        if (match$934('{')) {
            return parseObjectInitialiser$946();
        }
        if (match$934('(')) {
            return parseGroupExpression$949();
        }
        if (lookahead$891.type === Token$869.RegularExpression) {
            return delegate$888.createLiteral(lex$925());
        }
        if (type$1321 === Token$869.Template) {
            return parseTemplateLiteral$948();
        }
        return throwUnexpected$931(lex$925());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$951() {
        var args$1324 = [], arg$1325;
        expect$932('(');
        if (!match$934(')')) {
            while (streamIndex$890 < length$887) {
                arg$1325 = parseSpreadOrAssignmentExpression$952();
                args$1324.push(arg$1325);
                if (match$934(')')) {
                    break;
                } else if (arg$1325.type === Syntax$872.SpreadElement) {
                    throwError$929({}, Messages$874.ElementAfterSpreadElement);
                }
                expect$932(',');
            }
        }
        expect$932(')');
        return args$1324;
    }
    function parseSpreadOrAssignmentExpression$952() {
        if (match$934('...')) {
            lex$925();
            return delegate$888.createSpreadElement(parseAssignmentExpression$968());
        }
        return parseAssignmentExpression$968();
    }
    function parseNonComputedProperty$953() {
        var token$1326 = lex$925();
        if (!isIdentifierName$922(token$1326)) {
            throwUnexpected$931(token$1326);
        }
        return delegate$888.createIdentifier(token$1326.value);
    }
    function parseNonComputedMember$954() {
        expect$932('.');
        return parseNonComputedProperty$953();
    }
    function parseComputedMember$955() {
        var expr$1327;
        expect$932('[');
        expr$1327 = parseExpression$969();
        expect$932(']');
        return expr$1327;
    }
    function parseNewExpression$956() {
        var callee$1328, args$1329;
        expectKeyword$933('new');
        callee$1328 = parseLeftHandSideExpression$958();
        args$1329 = match$934('(') ? parseArguments$951() : [];
        return delegate$888.createNewExpression(callee$1328, args$1329);
    }
    function parseLeftHandSideExpressionAllowCall$957() {
        var expr$1330, args$1331, property$1332;
        expr$1330 = matchKeyword$935('new') ? parseNewExpression$956() : parsePrimaryExpression$950();
        while (match$934('.') || match$934('[') || match$934('(') || lookahead$891.type === Token$869.Template) {
            if (match$934('(')) {
                args$1331 = parseArguments$951();
                expr$1330 = delegate$888.createCallExpression(expr$1330, args$1331);
            } else if (match$934('[')) {
                expr$1330 = delegate$888.createMemberExpression('[', expr$1330, parseComputedMember$955());
            } else if (match$934('.')) {
                expr$1330 = delegate$888.createMemberExpression('.', expr$1330, parseNonComputedMember$954());
            } else {
                expr$1330 = delegate$888.createTaggedTemplateExpression(expr$1330, parseTemplateLiteral$948());
            }
        }
        return expr$1330;
    }
    function parseLeftHandSideExpression$958() {
        var expr$1333, property$1334;
        expr$1333 = matchKeyword$935('new') ? parseNewExpression$956() : parsePrimaryExpression$950();
        while (match$934('.') || match$934('[') || lookahead$891.type === Token$869.Template) {
            if (match$934('[')) {
                expr$1333 = delegate$888.createMemberExpression('[', expr$1333, parseComputedMember$955());
            } else if (match$934('.')) {
                expr$1333 = delegate$888.createMemberExpression('.', expr$1333, parseNonComputedMember$954());
            } else {
                expr$1333 = delegate$888.createTaggedTemplateExpression(expr$1333, parseTemplateLiteral$948());
            }
        }
        return expr$1333;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$959() {
        var expr$1335 = parseLeftHandSideExpressionAllowCall$957(), token$1336 = lookahead$891;
        if (lookahead$891.type !== Token$869.Punctuator) {
            return expr$1335;
        }
        if ((match$934('++') || match$934('--')) && !peekLineTerminator$928()) {
            // 11.3.1, 11.3.2
            if (strict$879 && expr$1335.type === Syntax$872.Identifier && isRestrictedWord$906(expr$1335.name)) {
                throwErrorTolerant$930({}, Messages$874.StrictLHSPostfix);
            }
            if (!isLeftHandSide$939(expr$1335)) {
                throwError$929({}, Messages$874.InvalidLHSInAssignment);
            }
            token$1336 = lex$925();
            expr$1335 = delegate$888.createPostfixExpression(token$1336.value, expr$1335);
        }
        return expr$1335;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$960() {
        var token$1337, expr$1338;
        if (lookahead$891.type !== Token$869.Punctuator && lookahead$891.type !== Token$869.Keyword) {
            return parsePostfixExpression$959();
        }
        if (match$934('++') || match$934('--')) {
            token$1337 = lex$925();
            expr$1338 = parseUnaryExpression$960();
            // 11.4.4, 11.4.5
            if (strict$879 && expr$1338.type === Syntax$872.Identifier && isRestrictedWord$906(expr$1338.name)) {
                throwErrorTolerant$930({}, Messages$874.StrictLHSPrefix);
            }
            if (!isLeftHandSide$939(expr$1338)) {
                throwError$929({}, Messages$874.InvalidLHSInAssignment);
            }
            return delegate$888.createUnaryExpression(token$1337.value, expr$1338);
        }
        if (match$934('+') || match$934('-') || match$934('~') || match$934('!')) {
            token$1337 = lex$925();
            expr$1338 = parseUnaryExpression$960();
            return delegate$888.createUnaryExpression(token$1337.value, expr$1338);
        }
        if (matchKeyword$935('delete') || matchKeyword$935('void') || matchKeyword$935('typeof')) {
            token$1337 = lex$925();
            expr$1338 = parseUnaryExpression$960();
            expr$1338 = delegate$888.createUnaryExpression(token$1337.value, expr$1338);
            if (strict$879 && expr$1338.operator === 'delete' && expr$1338.argument.type === Syntax$872.Identifier) {
                throwErrorTolerant$930({}, Messages$874.StrictDelete);
            }
            return expr$1338;
        }
        return parsePostfixExpression$959();
    }
    function binaryPrecedence$961(token$1339, allowIn$1340) {
        var prec$1341 = 0;
        if (token$1339.type !== Token$869.Punctuator && token$1339.type !== Token$869.Keyword) {
            return 0;
        }
        switch (token$1339.value) {
        case '||':
            prec$1341 = 1;
            break;
        case '&&':
            prec$1341 = 2;
            break;
        case '|':
            prec$1341 = 3;
            break;
        case '^':
            prec$1341 = 4;
            break;
        case '&':
            prec$1341 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1341 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1341 = 7;
            break;
        case 'in':
            prec$1341 = allowIn$1340 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1341 = 8;
            break;
        case '+':
        case '-':
            prec$1341 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1341 = 11;
            break;
        default:
            break;
        }
        return prec$1341;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$962() {
        var expr$1342, token$1343, prec$1344, previousAllowIn$1345, stack$1346, right$1347, operator$1348, left$1349, i$1350;
        previousAllowIn$1345 = state$893.allowIn;
        state$893.allowIn = true;
        expr$1342 = parseUnaryExpression$960();
        token$1343 = lookahead$891;
        prec$1344 = binaryPrecedence$961(token$1343, previousAllowIn$1345);
        if (prec$1344 === 0) {
            return expr$1342;
        }
        token$1343.prec = prec$1344;
        lex$925();
        stack$1346 = [
            expr$1342,
            token$1343,
            parseUnaryExpression$960()
        ];
        while ((prec$1344 = binaryPrecedence$961(lookahead$891, previousAllowIn$1345)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1346.length > 2 && prec$1344 <= stack$1346[stack$1346.length - 2].prec) {
                right$1347 = stack$1346.pop();
                operator$1348 = stack$1346.pop().value;
                left$1349 = stack$1346.pop();
                stack$1346.push(delegate$888.createBinaryExpression(operator$1348, left$1349, right$1347));
            }
            // Shift.
            token$1343 = lex$925();
            token$1343.prec = prec$1344;
            stack$1346.push(token$1343);
            stack$1346.push(parseUnaryExpression$960());
        }
        state$893.allowIn = previousAllowIn$1345;
        // Final reduce to clean-up the stack.
        i$1350 = stack$1346.length - 1;
        expr$1342 = stack$1346[i$1350];
        while (i$1350 > 1) {
            expr$1342 = delegate$888.createBinaryExpression(stack$1346[i$1350 - 1].value, stack$1346[i$1350 - 2], expr$1342);
            i$1350 -= 2;
        }
        return expr$1342;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$963() {
        var expr$1351, previousAllowIn$1352, consequent$1353, alternate$1354;
        expr$1351 = parseBinaryExpression$962();
        if (match$934('?')) {
            lex$925();
            previousAllowIn$1352 = state$893.allowIn;
            state$893.allowIn = true;
            consequent$1353 = parseAssignmentExpression$968();
            state$893.allowIn = previousAllowIn$1352;
            expect$932(':');
            alternate$1354 = parseAssignmentExpression$968();
            expr$1351 = delegate$888.createConditionalExpression(expr$1351, consequent$1353, alternate$1354);
        }
        return expr$1351;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$964(expr$1355) {
        var i$1356, len$1357, property$1358, element$1359;
        if (expr$1355.type === Syntax$872.ObjectExpression) {
            expr$1355.type = Syntax$872.ObjectPattern;
            for (i$1356 = 0, len$1357 = expr$1355.properties.length; i$1356 < len$1357; i$1356 += 1) {
                property$1358 = expr$1355.properties[i$1356];
                if (property$1358.kind !== 'init') {
                    throwError$929({}, Messages$874.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$964(property$1358.value);
            }
        } else if (expr$1355.type === Syntax$872.ArrayExpression) {
            expr$1355.type = Syntax$872.ArrayPattern;
            for (i$1356 = 0, len$1357 = expr$1355.elements.length; i$1356 < len$1357; i$1356 += 1) {
                element$1359 = expr$1355.elements[i$1356];
                if (element$1359) {
                    reinterpretAsAssignmentBindingPattern$964(element$1359);
                }
            }
        } else if (expr$1355.type === Syntax$872.Identifier) {
            if (isRestrictedWord$906(expr$1355.name)) {
                throwError$929({}, Messages$874.InvalidLHSInAssignment);
            }
        } else if (expr$1355.type === Syntax$872.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$964(expr$1355.argument);
            if (expr$1355.argument.type === Syntax$872.ObjectPattern) {
                throwError$929({}, Messages$874.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1355.type !== Syntax$872.MemberExpression && expr$1355.type !== Syntax$872.CallExpression && expr$1355.type !== Syntax$872.NewExpression) {
                throwError$929({}, Messages$874.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$965(options$1360, expr$1361) {
        var i$1362, len$1363, property$1364, element$1365;
        if (expr$1361.type === Syntax$872.ObjectExpression) {
            expr$1361.type = Syntax$872.ObjectPattern;
            for (i$1362 = 0, len$1363 = expr$1361.properties.length; i$1362 < len$1363; i$1362 += 1) {
                property$1364 = expr$1361.properties[i$1362];
                if (property$1364.kind !== 'init') {
                    throwError$929({}, Messages$874.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$965(options$1360, property$1364.value);
            }
        } else if (expr$1361.type === Syntax$872.ArrayExpression) {
            expr$1361.type = Syntax$872.ArrayPattern;
            for (i$1362 = 0, len$1363 = expr$1361.elements.length; i$1362 < len$1363; i$1362 += 1) {
                element$1365 = expr$1361.elements[i$1362];
                if (element$1365) {
                    reinterpretAsDestructuredParameter$965(options$1360, element$1365);
                }
            }
        } else if (expr$1361.type === Syntax$872.Identifier) {
            validateParam$1003(options$1360, expr$1361, expr$1361.name);
        } else {
            if (expr$1361.type !== Syntax$872.MemberExpression) {
                throwError$929({}, Messages$874.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$966(expressions$1366) {
        var i$1367, len$1368, param$1369, params$1370, defaults$1371, defaultCount$1372, options$1373, rest$1374;
        params$1370 = [];
        defaults$1371 = [];
        defaultCount$1372 = 0;
        rest$1374 = null;
        options$1373 = { paramSet: {} };
        for (i$1367 = 0, len$1368 = expressions$1366.length; i$1367 < len$1368; i$1367 += 1) {
            param$1369 = expressions$1366[i$1367];
            if (param$1369.type === Syntax$872.Identifier) {
                params$1370.push(param$1369);
                defaults$1371.push(null);
                validateParam$1003(options$1373, param$1369, param$1369.name);
            } else if (param$1369.type === Syntax$872.ObjectExpression || param$1369.type === Syntax$872.ArrayExpression) {
                reinterpretAsDestructuredParameter$965(options$1373, param$1369);
                params$1370.push(param$1369);
                defaults$1371.push(null);
            } else if (param$1369.type === Syntax$872.SpreadElement) {
                assert$895(i$1367 === len$1368 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$965(options$1373, param$1369.argument);
                rest$1374 = param$1369.argument;
            } else if (param$1369.type === Syntax$872.AssignmentExpression) {
                params$1370.push(param$1369.left);
                defaults$1371.push(param$1369.right);
                ++defaultCount$1372;
                validateParam$1003(options$1373, param$1369.left, param$1369.left.name);
            } else {
                return null;
            }
        }
        if (options$1373.message === Messages$874.StrictParamDupe) {
            throwError$929(strict$879 ? options$1373.stricted : options$1373.firstRestricted, options$1373.message);
        }
        if (defaultCount$1372 === 0) {
            defaults$1371 = [];
        }
        return {
            params: params$1370,
            defaults: defaults$1371,
            rest: rest$1374,
            stricted: options$1373.stricted,
            firstRestricted: options$1373.firstRestricted,
            message: options$1373.message
        };
    }
    function parseArrowFunctionExpression$967(options$1375) {
        var previousStrict$1376, previousYieldAllowed$1377, body$1378;
        expect$932('=>');
        previousStrict$1376 = strict$879;
        previousYieldAllowed$1377 = state$893.yieldAllowed;
        state$893.yieldAllowed = false;
        body$1378 = parseConciseBody$1001();
        if (strict$879 && options$1375.firstRestricted) {
            throwError$929(options$1375.firstRestricted, options$1375.message);
        }
        if (strict$879 && options$1375.stricted) {
            throwErrorTolerant$930(options$1375.stricted, options$1375.message);
        }
        strict$879 = previousStrict$1376;
        state$893.yieldAllowed = previousYieldAllowed$1377;
        return delegate$888.createArrowFunctionExpression(options$1375.params, options$1375.defaults, body$1378, options$1375.rest, body$1378.type !== Syntax$872.BlockStatement);
    }
    function parseAssignmentExpression$968() {
        var expr$1379, token$1380, params$1381, oldParenthesizedCount$1382;
        if (matchKeyword$935('yield')) {
            return parseYieldExpression$1008();
        }
        oldParenthesizedCount$1382 = state$893.parenthesizedCount;
        if (match$934('(')) {
            token$1380 = lookahead2$927();
            if (token$1380.type === Token$869.Punctuator && token$1380.value === ')' || token$1380.value === '...') {
                params$1381 = parseParams$1005();
                if (!match$934('=>')) {
                    throwUnexpected$931(lex$925());
                }
                return parseArrowFunctionExpression$967(params$1381);
            }
        }
        token$1380 = lookahead$891;
        expr$1379 = parseConditionalExpression$963();
        if (match$934('=>') && (state$893.parenthesizedCount === oldParenthesizedCount$1382 || state$893.parenthesizedCount === oldParenthesizedCount$1382 + 1)) {
            if (expr$1379.type === Syntax$872.Identifier) {
                params$1381 = reinterpretAsCoverFormalsList$966([expr$1379]);
            } else if (expr$1379.type === Syntax$872.SequenceExpression) {
                params$1381 = reinterpretAsCoverFormalsList$966(expr$1379.expressions);
            }
            if (params$1381) {
                return parseArrowFunctionExpression$967(params$1381);
            }
        }
        if (matchAssign$937()) {
            // 11.13.1
            if (strict$879 && expr$1379.type === Syntax$872.Identifier && isRestrictedWord$906(expr$1379.name)) {
                throwErrorTolerant$930(token$1380, Messages$874.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$934('=') && (expr$1379.type === Syntax$872.ObjectExpression || expr$1379.type === Syntax$872.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$964(expr$1379);
            } else if (!isLeftHandSide$939(expr$1379)) {
                throwError$929({}, Messages$874.InvalidLHSInAssignment);
            }
            expr$1379 = delegate$888.createAssignmentExpression(lex$925().value, expr$1379, parseAssignmentExpression$968());
        }
        return expr$1379;
    }
    // 11.14 Comma Operator
    function parseExpression$969() {
        var expr$1383, expressions$1384, sequence$1385, coverFormalsList$1386, spreadFound$1387, oldParenthesizedCount$1388;
        oldParenthesizedCount$1388 = state$893.parenthesizedCount;
        expr$1383 = parseAssignmentExpression$968();
        expressions$1384 = [expr$1383];
        if (match$934(',')) {
            while (streamIndex$890 < length$887) {
                if (!match$934(',')) {
                    break;
                }
                lex$925();
                expr$1383 = parseSpreadOrAssignmentExpression$952();
                expressions$1384.push(expr$1383);
                if (expr$1383.type === Syntax$872.SpreadElement) {
                    spreadFound$1387 = true;
                    if (!match$934(')')) {
                        throwError$929({}, Messages$874.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1385 = delegate$888.createSequenceExpression(expressions$1384);
        }
        if (match$934('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$893.parenthesizedCount === oldParenthesizedCount$1388 || state$893.parenthesizedCount === oldParenthesizedCount$1388 + 1) {
                expr$1383 = expr$1383.type === Syntax$872.SequenceExpression ? expr$1383.expressions : expressions$1384;
                coverFormalsList$1386 = reinterpretAsCoverFormalsList$966(expr$1383);
                if (coverFormalsList$1386) {
                    return parseArrowFunctionExpression$967(coverFormalsList$1386);
                }
            }
            throwUnexpected$931(lex$925());
        }
        if (spreadFound$1387 && lookahead2$927().value !== '=>') {
            throwError$929({}, Messages$874.IllegalSpread);
        }
        return sequence$1385 || expr$1383;
    }
    // 12.1 Block
    function parseStatementList$970() {
        var list$1389 = [], statement$1390;
        while (streamIndex$890 < length$887) {
            if (match$934('}')) {
                break;
            }
            statement$1390 = parseSourceElement$1015();
            if (typeof statement$1390 === 'undefined') {
                break;
            }
            list$1389.push(statement$1390);
        }
        return list$1389;
    }
    function parseBlock$971() {
        var block$1391;
        expect$932('{');
        block$1391 = parseStatementList$970();
        expect$932('}');
        return delegate$888.createBlockStatement(block$1391);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$972() {
        var token$1392 = lookahead$891, resolvedIdent$1393;
        if (token$1392.type !== Token$869.Identifier) {
            throwUnexpected$931(token$1392);
        }
        resolvedIdent$1393 = expander$868.resolve(tokenStream$889[lookaheadIndex$892]);
        lex$925();
        return delegate$888.createIdentifier(resolvedIdent$1393);
    }
    function parseVariableDeclaration$973(kind$1394) {
        var id$1395, init$1396 = null;
        if (match$934('{')) {
            id$1395 = parseObjectInitialiser$946();
            reinterpretAsAssignmentBindingPattern$964(id$1395);
        } else if (match$934('[')) {
            id$1395 = parseArrayInitialiser$941();
            reinterpretAsAssignmentBindingPattern$964(id$1395);
        } else {
            id$1395 = state$893.allowKeyword ? parseNonComputedProperty$953() : parseVariableIdentifier$972();
            // 12.2.1
            if (strict$879 && isRestrictedWord$906(id$1395.name)) {
                throwErrorTolerant$930({}, Messages$874.StrictVarName);
            }
        }
        if (kind$1394 === 'const') {
            if (!match$934('=')) {
                throwError$929({}, Messages$874.NoUnintializedConst);
            }
            expect$932('=');
            init$1396 = parseAssignmentExpression$968();
        } else if (match$934('=')) {
            lex$925();
            init$1396 = parseAssignmentExpression$968();
        }
        return delegate$888.createVariableDeclarator(id$1395, init$1396);
    }
    function parseVariableDeclarationList$974(kind$1397) {
        var list$1398 = [];
        do {
            list$1398.push(parseVariableDeclaration$973(kind$1397));
            if (!match$934(',')) {
                break;
            }
            lex$925();
        } while (streamIndex$890 < length$887);
        return list$1398;
    }
    function parseVariableStatement$975() {
        var declarations$1399;
        expectKeyword$933('var');
        declarations$1399 = parseVariableDeclarationList$974();
        consumeSemicolon$938();
        return delegate$888.createVariableDeclaration(declarations$1399, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$976(kind$1400) {
        var declarations$1401;
        expectKeyword$933(kind$1400);
        declarations$1401 = parseVariableDeclarationList$974(kind$1400);
        consumeSemicolon$938();
        return delegate$888.createVariableDeclaration(declarations$1401, kind$1400);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$977() {
        var id$1402, src$1403, body$1404;
        lex$925();
        // 'module'
        if (peekLineTerminator$928()) {
            throwError$929({}, Messages$874.NewlineAfterModule);
        }
        switch (lookahead$891.type) {
        case Token$869.StringLiteral:
            id$1402 = parsePrimaryExpression$950();
            body$1404 = parseModuleBlock$1020();
            src$1403 = null;
            break;
        case Token$869.Identifier:
            id$1402 = parseVariableIdentifier$972();
            body$1404 = null;
            if (!matchContextualKeyword$936('from')) {
                throwUnexpected$931(lex$925());
            }
            lex$925();
            src$1403 = parsePrimaryExpression$950();
            if (src$1403.type !== Syntax$872.Literal) {
                throwError$929({}, Messages$874.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$938();
        return delegate$888.createModuleDeclaration(id$1402, src$1403, body$1404);
    }
    function parseExportBatchSpecifier$978() {
        expect$932('*');
        return delegate$888.createExportBatchSpecifier();
    }
    function parseExportSpecifier$979() {
        var id$1405, name$1406 = null;
        id$1405 = parseVariableIdentifier$972();
        if (matchContextualKeyword$936('as')) {
            lex$925();
            name$1406 = parseNonComputedProperty$953();
        }
        return delegate$888.createExportSpecifier(id$1405, name$1406);
    }
    function parseExportDeclaration$980() {
        var previousAllowKeyword$1407, decl$1408, def$1409, src$1410, specifiers$1411;
        expectKeyword$933('export');
        if (lookahead$891.type === Token$869.Keyword) {
            switch (lookahead$891.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$888.createExportDeclaration(parseSourceElement$1015(), null, null);
            }
        }
        if (isIdentifierName$922(lookahead$891)) {
            previousAllowKeyword$1407 = state$893.allowKeyword;
            state$893.allowKeyword = true;
            decl$1408 = parseVariableDeclarationList$974('let');
            state$893.allowKeyword = previousAllowKeyword$1407;
            return delegate$888.createExportDeclaration(decl$1408, null, null);
        }
        specifiers$1411 = [];
        src$1410 = null;
        if (match$934('*')) {
            specifiers$1411.push(parseExportBatchSpecifier$978());
        } else {
            expect$932('{');
            do {
                specifiers$1411.push(parseExportSpecifier$979());
            } while (match$934(',') && lex$925());
            expect$932('}');
        }
        if (matchContextualKeyword$936('from')) {
            lex$925();
            src$1410 = parsePrimaryExpression$950();
            if (src$1410.type !== Syntax$872.Literal) {
                throwError$929({}, Messages$874.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$938();
        return delegate$888.createExportDeclaration(null, specifiers$1411, src$1410);
    }
    function parseImportDeclaration$981() {
        var specifiers$1412, kind$1413, src$1414;
        expectKeyword$933('import');
        specifiers$1412 = [];
        if (isIdentifierName$922(lookahead$891)) {
            kind$1413 = 'default';
            specifiers$1412.push(parseImportSpecifier$982());
            if (!matchContextualKeyword$936('from')) {
                throwError$929({}, Messages$874.NoFromAfterImport);
            }
            lex$925();
        } else if (match$934('{')) {
            kind$1413 = 'named';
            lex$925();
            do {
                specifiers$1412.push(parseImportSpecifier$982());
            } while (match$934(',') && lex$925());
            expect$932('}');
            if (!matchContextualKeyword$936('from')) {
                throwError$929({}, Messages$874.NoFromAfterImport);
            }
            lex$925();
        }
        src$1414 = parsePrimaryExpression$950();
        if (src$1414.type !== Syntax$872.Literal) {
            throwError$929({}, Messages$874.InvalidModuleSpecifier);
        }
        consumeSemicolon$938();
        return delegate$888.createImportDeclaration(specifiers$1412, kind$1413, src$1414);
    }
    function parseImportSpecifier$982() {
        var id$1415, name$1416 = null;
        id$1415 = parseNonComputedProperty$953();
        if (matchContextualKeyword$936('as')) {
            lex$925();
            name$1416 = parseVariableIdentifier$972();
        }
        return delegate$888.createImportSpecifier(id$1415, name$1416);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$983() {
        expect$932(';');
        return delegate$888.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$984() {
        var expr$1417 = parseExpression$969();
        consumeSemicolon$938();
        return delegate$888.createExpressionStatement(expr$1417);
    }
    // 12.5 If statement
    function parseIfStatement$985() {
        var test$1418, consequent$1419, alternate$1420;
        expectKeyword$933('if');
        expect$932('(');
        test$1418 = parseExpression$969();
        expect$932(')');
        consequent$1419 = parseStatement$1000();
        if (matchKeyword$935('else')) {
            lex$925();
            alternate$1420 = parseStatement$1000();
        } else {
            alternate$1420 = null;
        }
        return delegate$888.createIfStatement(test$1418, consequent$1419, alternate$1420);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$986() {
        var body$1421, test$1422, oldInIteration$1423;
        expectKeyword$933('do');
        oldInIteration$1423 = state$893.inIteration;
        state$893.inIteration = true;
        body$1421 = parseStatement$1000();
        state$893.inIteration = oldInIteration$1423;
        expectKeyword$933('while');
        expect$932('(');
        test$1422 = parseExpression$969();
        expect$932(')');
        if (match$934(';')) {
            lex$925();
        }
        return delegate$888.createDoWhileStatement(body$1421, test$1422);
    }
    function parseWhileStatement$987() {
        var test$1424, body$1425, oldInIteration$1426;
        expectKeyword$933('while');
        expect$932('(');
        test$1424 = parseExpression$969();
        expect$932(')');
        oldInIteration$1426 = state$893.inIteration;
        state$893.inIteration = true;
        body$1425 = parseStatement$1000();
        state$893.inIteration = oldInIteration$1426;
        return delegate$888.createWhileStatement(test$1424, body$1425);
    }
    function parseForVariableDeclaration$988() {
        var token$1427 = lex$925(), declarations$1428 = parseVariableDeclarationList$974();
        return delegate$888.createVariableDeclaration(declarations$1428, token$1427.value);
    }
    function parseForStatement$989(opts$1429) {
        var init$1430, test$1431, update$1432, left$1433, right$1434, body$1435, operator$1436, oldInIteration$1437;
        init$1430 = test$1431 = update$1432 = null;
        expectKeyword$933('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$936('each')) {
            throwError$929({}, Messages$874.EachNotAllowed);
        }
        expect$932('(');
        if (match$934(';')) {
            lex$925();
        } else {
            if (matchKeyword$935('var') || matchKeyword$935('let') || matchKeyword$935('const')) {
                state$893.allowIn = false;
                init$1430 = parseForVariableDeclaration$988();
                state$893.allowIn = true;
                if (init$1430.declarations.length === 1) {
                    if (matchKeyword$935('in') || matchContextualKeyword$936('of')) {
                        operator$1436 = lookahead$891;
                        if (!((operator$1436.value === 'in' || init$1430.kind !== 'var') && init$1430.declarations[0].init)) {
                            lex$925();
                            left$1433 = init$1430;
                            right$1434 = parseExpression$969();
                            init$1430 = null;
                        }
                    }
                }
            } else {
                state$893.allowIn = false;
                init$1430 = parseExpression$969();
                state$893.allowIn = true;
                if (matchContextualKeyword$936('of')) {
                    operator$1436 = lex$925();
                    left$1433 = init$1430;
                    right$1434 = parseExpression$969();
                    init$1430 = null;
                } else if (matchKeyword$935('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$940(init$1430)) {
                        throwError$929({}, Messages$874.InvalidLHSInForIn);
                    }
                    operator$1436 = lex$925();
                    left$1433 = init$1430;
                    right$1434 = parseExpression$969();
                    init$1430 = null;
                }
            }
            if (typeof left$1433 === 'undefined') {
                expect$932(';');
            }
        }
        if (typeof left$1433 === 'undefined') {
            if (!match$934(';')) {
                test$1431 = parseExpression$969();
            }
            expect$932(';');
            if (!match$934(')')) {
                update$1432 = parseExpression$969();
            }
        }
        expect$932(')');
        oldInIteration$1437 = state$893.inIteration;
        state$893.inIteration = true;
        if (!(opts$1429 !== undefined && opts$1429.ignoreBody)) {
            body$1435 = parseStatement$1000();
        }
        state$893.inIteration = oldInIteration$1437;
        if (typeof left$1433 === 'undefined') {
            return delegate$888.createForStatement(init$1430, test$1431, update$1432, body$1435);
        }
        if (operator$1436.value === 'in') {
            return delegate$888.createForInStatement(left$1433, right$1434, body$1435);
        }
        return delegate$888.createForOfStatement(left$1433, right$1434, body$1435);
    }
    // 12.7 The continue statement
    function parseContinueStatement$990() {
        var label$1438 = null, key$1439;
        expectKeyword$933('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$891.value.charCodeAt(0) === 59) {
            lex$925();
            if (!state$893.inIteration) {
                throwError$929({}, Messages$874.IllegalContinue);
            }
            return delegate$888.createContinueStatement(null);
        }
        if (peekLineTerminator$928()) {
            if (!state$893.inIteration) {
                throwError$929({}, Messages$874.IllegalContinue);
            }
            return delegate$888.createContinueStatement(null);
        }
        if (lookahead$891.type === Token$869.Identifier) {
            label$1438 = parseVariableIdentifier$972();
            key$1439 = '$' + label$1438.name;
            if (!Object.prototype.hasOwnProperty.call(state$893.labelSet, key$1439)) {
                throwError$929({}, Messages$874.UnknownLabel, label$1438.name);
            }
        }
        consumeSemicolon$938();
        if (label$1438 === null && !state$893.inIteration) {
            throwError$929({}, Messages$874.IllegalContinue);
        }
        return delegate$888.createContinueStatement(label$1438);
    }
    // 12.8 The break statement
    function parseBreakStatement$991() {
        var label$1440 = null, key$1441;
        expectKeyword$933('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$891.value.charCodeAt(0) === 59) {
            lex$925();
            if (!(state$893.inIteration || state$893.inSwitch)) {
                throwError$929({}, Messages$874.IllegalBreak);
            }
            return delegate$888.createBreakStatement(null);
        }
        if (peekLineTerminator$928()) {
            if (!(state$893.inIteration || state$893.inSwitch)) {
                throwError$929({}, Messages$874.IllegalBreak);
            }
            return delegate$888.createBreakStatement(null);
        }
        if (lookahead$891.type === Token$869.Identifier) {
            label$1440 = parseVariableIdentifier$972();
            key$1441 = '$' + label$1440.name;
            if (!Object.prototype.hasOwnProperty.call(state$893.labelSet, key$1441)) {
                throwError$929({}, Messages$874.UnknownLabel, label$1440.name);
            }
        }
        consumeSemicolon$938();
        if (label$1440 === null && !(state$893.inIteration || state$893.inSwitch)) {
            throwError$929({}, Messages$874.IllegalBreak);
        }
        return delegate$888.createBreakStatement(label$1440);
    }
    // 12.9 The return statement
    function parseReturnStatement$992() {
        var argument$1442 = null;
        expectKeyword$933('return');
        if (!state$893.inFunctionBody) {
            throwErrorTolerant$930({}, Messages$874.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$902(String(lookahead$891.value).charCodeAt(0))) {
            argument$1442 = parseExpression$969();
            consumeSemicolon$938();
            return delegate$888.createReturnStatement(argument$1442);
        }
        if (peekLineTerminator$928()) {
            return delegate$888.createReturnStatement(null);
        }
        if (!match$934(';')) {
            if (!match$934('}') && lookahead$891.type !== Token$869.EOF) {
                argument$1442 = parseExpression$969();
            }
        }
        consumeSemicolon$938();
        return delegate$888.createReturnStatement(argument$1442);
    }
    // 12.10 The with statement
    function parseWithStatement$993() {
        var object$1443, body$1444;
        if (strict$879) {
            throwErrorTolerant$930({}, Messages$874.StrictModeWith);
        }
        expectKeyword$933('with');
        expect$932('(');
        object$1443 = parseExpression$969();
        expect$932(')');
        body$1444 = parseStatement$1000();
        return delegate$888.createWithStatement(object$1443, body$1444);
    }
    // 12.10 The swith statement
    function parseSwitchCase$994() {
        var test$1445, consequent$1446 = [], sourceElement$1447;
        if (matchKeyword$935('default')) {
            lex$925();
            test$1445 = null;
        } else {
            expectKeyword$933('case');
            test$1445 = parseExpression$969();
        }
        expect$932(':');
        while (streamIndex$890 < length$887) {
            if (match$934('}') || matchKeyword$935('default') || matchKeyword$935('case')) {
                break;
            }
            sourceElement$1447 = parseSourceElement$1015();
            if (typeof sourceElement$1447 === 'undefined') {
                break;
            }
            consequent$1446.push(sourceElement$1447);
        }
        return delegate$888.createSwitchCase(test$1445, consequent$1446);
    }
    function parseSwitchStatement$995() {
        var discriminant$1448, cases$1449, clause$1450, oldInSwitch$1451, defaultFound$1452;
        expectKeyword$933('switch');
        expect$932('(');
        discriminant$1448 = parseExpression$969();
        expect$932(')');
        expect$932('{');
        cases$1449 = [];
        if (match$934('}')) {
            lex$925();
            return delegate$888.createSwitchStatement(discriminant$1448, cases$1449);
        }
        oldInSwitch$1451 = state$893.inSwitch;
        state$893.inSwitch = true;
        defaultFound$1452 = false;
        while (streamIndex$890 < length$887) {
            if (match$934('}')) {
                break;
            }
            clause$1450 = parseSwitchCase$994();
            if (clause$1450.test === null) {
                if (defaultFound$1452) {
                    throwError$929({}, Messages$874.MultipleDefaultsInSwitch);
                }
                defaultFound$1452 = true;
            }
            cases$1449.push(clause$1450);
        }
        state$893.inSwitch = oldInSwitch$1451;
        expect$932('}');
        return delegate$888.createSwitchStatement(discriminant$1448, cases$1449);
    }
    // 12.13 The throw statement
    function parseThrowStatement$996() {
        var argument$1453;
        expectKeyword$933('throw');
        if (peekLineTerminator$928()) {
            throwError$929({}, Messages$874.NewlineAfterThrow);
        }
        argument$1453 = parseExpression$969();
        consumeSemicolon$938();
        return delegate$888.createThrowStatement(argument$1453);
    }
    // 12.14 The try statement
    function parseCatchClause$997() {
        var param$1454, body$1455;
        expectKeyword$933('catch');
        expect$932('(');
        if (match$934(')')) {
            throwUnexpected$931(lookahead$891);
        }
        param$1454 = parseExpression$969();
        // 12.14.1
        if (strict$879 && param$1454.type === Syntax$872.Identifier && isRestrictedWord$906(param$1454.name)) {
            throwErrorTolerant$930({}, Messages$874.StrictCatchVariable);
        }
        expect$932(')');
        body$1455 = parseBlock$971();
        return delegate$888.createCatchClause(param$1454, body$1455);
    }
    function parseTryStatement$998() {
        var block$1456, handlers$1457 = [], finalizer$1458 = null;
        expectKeyword$933('try');
        block$1456 = parseBlock$971();
        if (matchKeyword$935('catch')) {
            handlers$1457.push(parseCatchClause$997());
        }
        if (matchKeyword$935('finally')) {
            lex$925();
            finalizer$1458 = parseBlock$971();
        }
        if (handlers$1457.length === 0 && !finalizer$1458) {
            throwError$929({}, Messages$874.NoCatchOrFinally);
        }
        return delegate$888.createTryStatement(block$1456, [], handlers$1457, finalizer$1458);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$999() {
        expectKeyword$933('debugger');
        consumeSemicolon$938();
        return delegate$888.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$1000() {
        var type$1459 = lookahead$891.type, expr$1460, labeledBody$1461, key$1462;
        if (type$1459 === Token$869.EOF) {
            throwUnexpected$931(lookahead$891);
        }
        if (type$1459 === Token$869.Punctuator) {
            switch (lookahead$891.value) {
            case ';':
                return parseEmptyStatement$983();
            case '{':
                return parseBlock$971();
            case '(':
                return parseExpressionStatement$984();
            default:
                break;
            }
        }
        if (type$1459 === Token$869.Keyword) {
            switch (lookahead$891.value) {
            case 'break':
                return parseBreakStatement$991();
            case 'continue':
                return parseContinueStatement$990();
            case 'debugger':
                return parseDebuggerStatement$999();
            case 'do':
                return parseDoWhileStatement$986();
            case 'for':
                return parseForStatement$989();
            case 'function':
                return parseFunctionDeclaration$1006();
            case 'class':
                return parseClassDeclaration$1013();
            case 'if':
                return parseIfStatement$985();
            case 'return':
                return parseReturnStatement$992();
            case 'switch':
                return parseSwitchStatement$995();
            case 'throw':
                return parseThrowStatement$996();
            case 'try':
                return parseTryStatement$998();
            case 'var':
                return parseVariableStatement$975();
            case 'while':
                return parseWhileStatement$987();
            case 'with':
                return parseWithStatement$993();
            default:
                break;
            }
        }
        expr$1460 = parseExpression$969();
        // 12.12 Labelled Statements
        if (expr$1460.type === Syntax$872.Identifier && match$934(':')) {
            lex$925();
            key$1462 = '$' + expr$1460.name;
            if (Object.prototype.hasOwnProperty.call(state$893.labelSet, key$1462)) {
                throwError$929({}, Messages$874.Redeclaration, 'Label', expr$1460.name);
            }
            state$893.labelSet[key$1462] = true;
            labeledBody$1461 = parseStatement$1000();
            delete state$893.labelSet[key$1462];
            return delegate$888.createLabeledStatement(expr$1460, labeledBody$1461);
        }
        consumeSemicolon$938();
        return delegate$888.createExpressionStatement(expr$1460);
    }
    // 13 Function Definition
    function parseConciseBody$1001() {
        if (match$934('{')) {
            return parseFunctionSourceElements$1002();
        }
        return parseAssignmentExpression$968();
    }
    function parseFunctionSourceElements$1002() {
        var sourceElement$1463, sourceElements$1464 = [], token$1465, directive$1466, firstRestricted$1467, oldLabelSet$1468, oldInIteration$1469, oldInSwitch$1470, oldInFunctionBody$1471, oldParenthesizedCount$1472;
        expect$932('{');
        while (streamIndex$890 < length$887) {
            if (lookahead$891.type !== Token$869.StringLiteral) {
                break;
            }
            token$1465 = lookahead$891;
            sourceElement$1463 = parseSourceElement$1015();
            sourceElements$1464.push(sourceElement$1463);
            if (sourceElement$1463.expression.type !== Syntax$872.Literal) {
                // this is not directive
                break;
            }
            directive$1466 = token$1465.value;
            if (directive$1466 === 'use strict') {
                strict$879 = true;
                if (firstRestricted$1467) {
                    throwErrorTolerant$930(firstRestricted$1467, Messages$874.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1467 && token$1465.octal) {
                    firstRestricted$1467 = token$1465;
                }
            }
        }
        oldLabelSet$1468 = state$893.labelSet;
        oldInIteration$1469 = state$893.inIteration;
        oldInSwitch$1470 = state$893.inSwitch;
        oldInFunctionBody$1471 = state$893.inFunctionBody;
        oldParenthesizedCount$1472 = state$893.parenthesizedCount;
        state$893.labelSet = {};
        state$893.inIteration = false;
        state$893.inSwitch = false;
        state$893.inFunctionBody = true;
        state$893.parenthesizedCount = 0;
        while (streamIndex$890 < length$887) {
            if (match$934('}')) {
                break;
            }
            sourceElement$1463 = parseSourceElement$1015();
            if (typeof sourceElement$1463 === 'undefined') {
                break;
            }
            sourceElements$1464.push(sourceElement$1463);
        }
        expect$932('}');
        state$893.labelSet = oldLabelSet$1468;
        state$893.inIteration = oldInIteration$1469;
        state$893.inSwitch = oldInSwitch$1470;
        state$893.inFunctionBody = oldInFunctionBody$1471;
        state$893.parenthesizedCount = oldParenthesizedCount$1472;
        return delegate$888.createBlockStatement(sourceElements$1464);
    }
    function validateParam$1003(options$1473, param$1474, name$1475) {
        var key$1476 = '$' + name$1475;
        if (strict$879) {
            if (isRestrictedWord$906(name$1475)) {
                options$1473.stricted = param$1474;
                options$1473.message = Messages$874.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1473.paramSet, key$1476)) {
                options$1473.stricted = param$1474;
                options$1473.message = Messages$874.StrictParamDupe;
            }
        } else if (!options$1473.firstRestricted) {
            if (isRestrictedWord$906(name$1475)) {
                options$1473.firstRestricted = param$1474;
                options$1473.message = Messages$874.StrictParamName;
            } else if (isStrictModeReservedWord$905(name$1475)) {
                options$1473.firstRestricted = param$1474;
                options$1473.message = Messages$874.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1473.paramSet, key$1476)) {
                options$1473.firstRestricted = param$1474;
                options$1473.message = Messages$874.StrictParamDupe;
            }
        }
        options$1473.paramSet[key$1476] = true;
    }
    function parseParam$1004(options$1477) {
        var token$1478, rest$1479, param$1480, def$1481;
        token$1478 = lookahead$891;
        if (token$1478.value === '...') {
            token$1478 = lex$925();
            rest$1479 = true;
        }
        if (match$934('[')) {
            param$1480 = parseArrayInitialiser$941();
            reinterpretAsDestructuredParameter$965(options$1477, param$1480);
        } else if (match$934('{')) {
            if (rest$1479) {
                throwError$929({}, Messages$874.ObjectPatternAsRestParameter);
            }
            param$1480 = parseObjectInitialiser$946();
            reinterpretAsDestructuredParameter$965(options$1477, param$1480);
        } else {
            param$1480 = parseVariableIdentifier$972();
            validateParam$1003(options$1477, token$1478, token$1478.value);
            if (match$934('=')) {
                if (rest$1479) {
                    throwErrorTolerant$930(lookahead$891, Messages$874.DefaultRestParameter);
                }
                lex$925();
                def$1481 = parseAssignmentExpression$968();
                ++options$1477.defaultCount;
            }
        }
        if (rest$1479) {
            if (!match$934(')')) {
                throwError$929({}, Messages$874.ParameterAfterRestParameter);
            }
            options$1477.rest = param$1480;
            return false;
        }
        options$1477.params.push(param$1480);
        options$1477.defaults.push(def$1481);
        return !match$934(')');
    }
    function parseParams$1005(firstRestricted$1482) {
        var options$1483;
        options$1483 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1482
        };
        expect$932('(');
        if (!match$934(')')) {
            options$1483.paramSet = {};
            while (streamIndex$890 < length$887) {
                if (!parseParam$1004(options$1483)) {
                    break;
                }
                expect$932(',');
            }
        }
        expect$932(')');
        if (options$1483.defaultCount === 0) {
            options$1483.defaults = [];
        }
        return options$1483;
    }
    function parseFunctionDeclaration$1006() {
        var id$1484, body$1485, token$1486, tmp$1487, firstRestricted$1488, message$1489, previousStrict$1490, previousYieldAllowed$1491, generator$1492, expression$1493;
        expectKeyword$933('function');
        generator$1492 = false;
        if (match$934('*')) {
            lex$925();
            generator$1492 = true;
        }
        token$1486 = lookahead$891;
        id$1484 = parseVariableIdentifier$972();
        if (strict$879) {
            if (isRestrictedWord$906(token$1486.value)) {
                throwErrorTolerant$930(token$1486, Messages$874.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$906(token$1486.value)) {
                firstRestricted$1488 = token$1486;
                message$1489 = Messages$874.StrictFunctionName;
            } else if (isStrictModeReservedWord$905(token$1486.value)) {
                firstRestricted$1488 = token$1486;
                message$1489 = Messages$874.StrictReservedWord;
            }
        }
        tmp$1487 = parseParams$1005(firstRestricted$1488);
        firstRestricted$1488 = tmp$1487.firstRestricted;
        if (tmp$1487.message) {
            message$1489 = tmp$1487.message;
        }
        previousStrict$1490 = strict$879;
        previousYieldAllowed$1491 = state$893.yieldAllowed;
        state$893.yieldAllowed = generator$1492;
        // here we redo some work in order to set 'expression'
        expression$1493 = !match$934('{');
        body$1485 = parseConciseBody$1001();
        if (strict$879 && firstRestricted$1488) {
            throwError$929(firstRestricted$1488, message$1489);
        }
        if (strict$879 && tmp$1487.stricted) {
            throwErrorTolerant$930(tmp$1487.stricted, message$1489);
        }
        if (state$893.yieldAllowed && !state$893.yieldFound) {
            throwErrorTolerant$930({}, Messages$874.NoYieldInGenerator);
        }
        strict$879 = previousStrict$1490;
        state$893.yieldAllowed = previousYieldAllowed$1491;
        return delegate$888.createFunctionDeclaration(id$1484, tmp$1487.params, tmp$1487.defaults, body$1485, tmp$1487.rest, generator$1492, expression$1493);
    }
    function parseFunctionExpression$1007() {
        var token$1494, id$1495 = null, firstRestricted$1496, message$1497, tmp$1498, body$1499, previousStrict$1500, previousYieldAllowed$1501, generator$1502, expression$1503;
        expectKeyword$933('function');
        generator$1502 = false;
        if (match$934('*')) {
            lex$925();
            generator$1502 = true;
        }
        if (!match$934('(')) {
            token$1494 = lookahead$891;
            id$1495 = parseVariableIdentifier$972();
            if (strict$879) {
                if (isRestrictedWord$906(token$1494.value)) {
                    throwErrorTolerant$930(token$1494, Messages$874.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$906(token$1494.value)) {
                    firstRestricted$1496 = token$1494;
                    message$1497 = Messages$874.StrictFunctionName;
                } else if (isStrictModeReservedWord$905(token$1494.value)) {
                    firstRestricted$1496 = token$1494;
                    message$1497 = Messages$874.StrictReservedWord;
                }
            }
        }
        tmp$1498 = parseParams$1005(firstRestricted$1496);
        firstRestricted$1496 = tmp$1498.firstRestricted;
        if (tmp$1498.message) {
            message$1497 = tmp$1498.message;
        }
        previousStrict$1500 = strict$879;
        previousYieldAllowed$1501 = state$893.yieldAllowed;
        state$893.yieldAllowed = generator$1502;
        // here we redo some work in order to set 'expression'
        expression$1503 = !match$934('{');
        body$1499 = parseConciseBody$1001();
        if (strict$879 && firstRestricted$1496) {
            throwError$929(firstRestricted$1496, message$1497);
        }
        if (strict$879 && tmp$1498.stricted) {
            throwErrorTolerant$930(tmp$1498.stricted, message$1497);
        }
        if (state$893.yieldAllowed && !state$893.yieldFound) {
            throwErrorTolerant$930({}, Messages$874.NoYieldInGenerator);
        }
        strict$879 = previousStrict$1500;
        state$893.yieldAllowed = previousYieldAllowed$1501;
        return delegate$888.createFunctionExpression(id$1495, tmp$1498.params, tmp$1498.defaults, body$1499, tmp$1498.rest, generator$1502, expression$1503);
    }
    function parseYieldExpression$1008() {
        var delegateFlag$1504, expr$1505, previousYieldAllowed$1506;
        expectKeyword$933('yield');
        if (!state$893.yieldAllowed) {
            throwErrorTolerant$930({}, Messages$874.IllegalYield);
        }
        delegateFlag$1504 = false;
        if (match$934('*')) {
            lex$925();
            delegateFlag$1504 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1506 = state$893.yieldAllowed;
        state$893.yieldAllowed = false;
        expr$1505 = parseAssignmentExpression$968();
        state$893.yieldAllowed = previousYieldAllowed$1506;
        state$893.yieldFound = true;
        return delegate$888.createYieldExpression(expr$1505, delegateFlag$1504);
    }
    // 14 Classes
    function parseMethodDefinition$1009(existingPropNames$1507) {
        var token$1508, key$1509, param$1510, propType$1511, isValidDuplicateProp$1512 = false;
        if (lookahead$891.value === 'static') {
            propType$1511 = ClassPropertyType$877.static;
            lex$925();
        } else {
            propType$1511 = ClassPropertyType$877.prototype;
        }
        if (match$934('*')) {
            lex$925();
            return delegate$888.createMethodDefinition(propType$1511, '', parseObjectPropertyKey$944(), parsePropertyMethodFunction$943({ generator: true }));
        }
        token$1508 = lookahead$891;
        key$1509 = parseObjectPropertyKey$944();
        if (token$1508.value === 'get' && !match$934('(')) {
            key$1509 = parseObjectPropertyKey$944();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1507[propType$1511].hasOwnProperty(key$1509.name)) {
                isValidDuplicateProp$1512 = existingPropNames$1507[propType$1511][key$1509.name].get === undefined && existingPropNames$1507[propType$1511][key$1509.name].data === undefined && existingPropNames$1507[propType$1511][key$1509.name].set !== undefined;
                if (!isValidDuplicateProp$1512) {
                    throwError$929(key$1509, Messages$874.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1507[propType$1511][key$1509.name] = {};
            }
            existingPropNames$1507[propType$1511][key$1509.name].get = true;
            expect$932('(');
            expect$932(')');
            return delegate$888.createMethodDefinition(propType$1511, 'get', key$1509, parsePropertyFunction$942({ generator: false }));
        }
        if (token$1508.value === 'set' && !match$934('(')) {
            key$1509 = parseObjectPropertyKey$944();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1507[propType$1511].hasOwnProperty(key$1509.name)) {
                isValidDuplicateProp$1512 = existingPropNames$1507[propType$1511][key$1509.name].set === undefined && existingPropNames$1507[propType$1511][key$1509.name].data === undefined && existingPropNames$1507[propType$1511][key$1509.name].get !== undefined;
                if (!isValidDuplicateProp$1512) {
                    throwError$929(key$1509, Messages$874.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1507[propType$1511][key$1509.name] = {};
            }
            existingPropNames$1507[propType$1511][key$1509.name].set = true;
            expect$932('(');
            token$1508 = lookahead$891;
            param$1510 = [parseVariableIdentifier$972()];
            expect$932(')');
            return delegate$888.createMethodDefinition(propType$1511, 'set', key$1509, parsePropertyFunction$942({
                params: param$1510,
                generator: false,
                name: token$1508
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1507[propType$1511].hasOwnProperty(key$1509.name)) {
            throwError$929(key$1509, Messages$874.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1507[propType$1511][key$1509.name] = {};
        }
        existingPropNames$1507[propType$1511][key$1509.name].data = true;
        return delegate$888.createMethodDefinition(propType$1511, '', key$1509, parsePropertyMethodFunction$943({ generator: false }));
    }
    function parseClassElement$1010(existingProps$1513) {
        if (match$934(';')) {
            lex$925();
            return;
        }
        return parseMethodDefinition$1009(existingProps$1513);
    }
    function parseClassBody$1011() {
        var classElement$1514, classElements$1515 = [], existingProps$1516 = {};
        existingProps$1516[ClassPropertyType$877.static] = {};
        existingProps$1516[ClassPropertyType$877.prototype] = {};
        expect$932('{');
        while (streamIndex$890 < length$887) {
            if (match$934('}')) {
                break;
            }
            classElement$1514 = parseClassElement$1010(existingProps$1516);
            if (typeof classElement$1514 !== 'undefined') {
                classElements$1515.push(classElement$1514);
            }
        }
        expect$932('}');
        return delegate$888.createClassBody(classElements$1515);
    }
    function parseClassExpression$1012() {
        var id$1517, previousYieldAllowed$1518, superClass$1519 = null;
        expectKeyword$933('class');
        if (!matchKeyword$935('extends') && !match$934('{')) {
            id$1517 = parseVariableIdentifier$972();
        }
        if (matchKeyword$935('extends')) {
            expectKeyword$933('extends');
            previousYieldAllowed$1518 = state$893.yieldAllowed;
            state$893.yieldAllowed = false;
            superClass$1519 = parseAssignmentExpression$968();
            state$893.yieldAllowed = previousYieldAllowed$1518;
        }
        return delegate$888.createClassExpression(id$1517, superClass$1519, parseClassBody$1011());
    }
    function parseClassDeclaration$1013() {
        var id$1520, previousYieldAllowed$1521, superClass$1522 = null;
        expectKeyword$933('class');
        id$1520 = parseVariableIdentifier$972();
        if (matchKeyword$935('extends')) {
            expectKeyword$933('extends');
            previousYieldAllowed$1521 = state$893.yieldAllowed;
            state$893.yieldAllowed = false;
            superClass$1522 = parseAssignmentExpression$968();
            state$893.yieldAllowed = previousYieldAllowed$1521;
        }
        return delegate$888.createClassDeclaration(id$1520, superClass$1522, parseClassBody$1011());
    }
    // 15 Program
    function matchModuleDeclaration$1014() {
        var id$1523;
        if (matchContextualKeyword$936('module')) {
            id$1523 = lookahead2$927();
            return id$1523.type === Token$869.StringLiteral || id$1523.type === Token$869.Identifier;
        }
        return false;
    }
    function parseSourceElement$1015() {
        if (lookahead$891.type === Token$869.Keyword) {
            switch (lookahead$891.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$976(lookahead$891.value);
            case 'function':
                return parseFunctionDeclaration$1006();
            case 'export':
                return parseExportDeclaration$980();
            case 'import':
                return parseImportDeclaration$981();
            default:
                return parseStatement$1000();
            }
        }
        if (matchModuleDeclaration$1014()) {
            throwError$929({}, Messages$874.NestedModule);
        }
        if (lookahead$891.type !== Token$869.EOF) {
            return parseStatement$1000();
        }
    }
    function parseProgramElement$1016() {
        if (lookahead$891.type === Token$869.Keyword) {
            switch (lookahead$891.value) {
            case 'export':
                return parseExportDeclaration$980();
            case 'import':
                return parseImportDeclaration$981();
            }
        }
        if (matchModuleDeclaration$1014()) {
            return parseModuleDeclaration$977();
        }
        return parseSourceElement$1015();
    }
    function parseProgramElements$1017() {
        var sourceElement$1524, sourceElements$1525 = [], token$1526, directive$1527, firstRestricted$1528;
        while (streamIndex$890 < length$887) {
            token$1526 = lookahead$891;
            if (token$1526.type !== Token$869.StringLiteral) {
                break;
            }
            sourceElement$1524 = parseProgramElement$1016();
            sourceElements$1525.push(sourceElement$1524);
            if (sourceElement$1524.expression.type !== Syntax$872.Literal) {
                // this is not directive
                break;
            }
            directive$1527 = token$1526.value;
            if (directive$1527 === 'use strict') {
                strict$879 = true;
                if (firstRestricted$1528) {
                    throwErrorTolerant$930(firstRestricted$1528, Messages$874.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1528 && token$1526.octal) {
                    firstRestricted$1528 = token$1526;
                }
            }
        }
        while (streamIndex$890 < length$887) {
            sourceElement$1524 = parseProgramElement$1016();
            if (typeof sourceElement$1524 === 'undefined') {
                break;
            }
            sourceElements$1525.push(sourceElement$1524);
        }
        return sourceElements$1525;
    }
    function parseModuleElement$1018() {
        return parseSourceElement$1015();
    }
    function parseModuleElements$1019() {
        var list$1529 = [], statement$1530;
        while (streamIndex$890 < length$887) {
            if (match$934('}')) {
                break;
            }
            statement$1530 = parseModuleElement$1018();
            if (typeof statement$1530 === 'undefined') {
                break;
            }
            list$1529.push(statement$1530);
        }
        return list$1529;
    }
    function parseModuleBlock$1020() {
        var block$1531;
        expect$932('{');
        block$1531 = parseModuleElements$1019();
        expect$932('}');
        return delegate$888.createBlockStatement(block$1531);
    }
    function parseProgram$1021() {
        var body$1532;
        strict$879 = false;
        peek$926();
        body$1532 = parseProgramElements$1017();
        return delegate$888.createProgram(body$1532);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1022(type$1533, value$1534, start$1535, end$1536, loc$1537) {
        assert$895(typeof start$1535 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$894.comments.length > 0) {
            if (extra$894.comments[extra$894.comments.length - 1].range[1] > start$1535) {
                return;
            }
        }
        extra$894.comments.push({
            type: type$1533,
            value: value$1534,
            range: [
                start$1535,
                end$1536
            ],
            loc: loc$1537
        });
    }
    function scanComment$1023() {
        var comment$1538, ch$1539, loc$1540, start$1541, blockComment$1542, lineComment$1543;
        comment$1538 = '';
        blockComment$1542 = false;
        lineComment$1543 = false;
        while (index$880 < length$887) {
            ch$1539 = source$878[index$880];
            if (lineComment$1543) {
                ch$1539 = source$878[index$880++];
                if (isLineTerminator$901(ch$1539.charCodeAt(0))) {
                    loc$1540.end = {
                        line: lineNumber$881,
                        column: index$880 - lineStart$882 - 1
                    };
                    lineComment$1543 = false;
                    addComment$1022('Line', comment$1538, start$1541, index$880 - 1, loc$1540);
                    if (ch$1539 === '\r' && source$878[index$880] === '\n') {
                        ++index$880;
                    }
                    ++lineNumber$881;
                    lineStart$882 = index$880;
                    comment$1538 = '';
                } else if (index$880 >= length$887) {
                    lineComment$1543 = false;
                    comment$1538 += ch$1539;
                    loc$1540.end = {
                        line: lineNumber$881,
                        column: length$887 - lineStart$882
                    };
                    addComment$1022('Line', comment$1538, start$1541, length$887, loc$1540);
                } else {
                    comment$1538 += ch$1539;
                }
            } else if (blockComment$1542) {
                if (isLineTerminator$901(ch$1539.charCodeAt(0))) {
                    if (ch$1539 === '\r' && source$878[index$880 + 1] === '\n') {
                        ++index$880;
                        comment$1538 += '\r\n';
                    } else {
                        comment$1538 += ch$1539;
                    }
                    ++lineNumber$881;
                    ++index$880;
                    lineStart$882 = index$880;
                    if (index$880 >= length$887) {
                        throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1539 = source$878[index$880++];
                    if (index$880 >= length$887) {
                        throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1538 += ch$1539;
                    if (ch$1539 === '*') {
                        ch$1539 = source$878[index$880];
                        if (ch$1539 === '/') {
                            comment$1538 = comment$1538.substr(0, comment$1538.length - 1);
                            blockComment$1542 = false;
                            ++index$880;
                            loc$1540.end = {
                                line: lineNumber$881,
                                column: index$880 - lineStart$882
                            };
                            addComment$1022('Block', comment$1538, start$1541, index$880, loc$1540);
                            comment$1538 = '';
                        }
                    }
                }
            } else if (ch$1539 === '/') {
                ch$1539 = source$878[index$880 + 1];
                if (ch$1539 === '/') {
                    loc$1540 = {
                        start: {
                            line: lineNumber$881,
                            column: index$880 - lineStart$882
                        }
                    };
                    start$1541 = index$880;
                    index$880 += 2;
                    lineComment$1543 = true;
                    if (index$880 >= length$887) {
                        loc$1540.end = {
                            line: lineNumber$881,
                            column: index$880 - lineStart$882
                        };
                        lineComment$1543 = false;
                        addComment$1022('Line', comment$1538, start$1541, index$880, loc$1540);
                    }
                } else if (ch$1539 === '*') {
                    start$1541 = index$880;
                    index$880 += 2;
                    blockComment$1542 = true;
                    loc$1540 = {
                        start: {
                            line: lineNumber$881,
                            column: index$880 - lineStart$882 - 2
                        }
                    };
                    if (index$880 >= length$887) {
                        throwError$929({}, Messages$874.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$900(ch$1539.charCodeAt(0))) {
                ++index$880;
            } else if (isLineTerminator$901(ch$1539.charCodeAt(0))) {
                ++index$880;
                if (ch$1539 === '\r' && source$878[index$880] === '\n') {
                    ++index$880;
                }
                ++lineNumber$881;
                lineStart$882 = index$880;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1024() {
        var i$1544, entry$1545, comment$1546, comments$1547 = [];
        for (i$1544 = 0; i$1544 < extra$894.comments.length; ++i$1544) {
            entry$1545 = extra$894.comments[i$1544];
            comment$1546 = {
                type: entry$1545.type,
                value: entry$1545.value
            };
            if (extra$894.range) {
                comment$1546.range = entry$1545.range;
            }
            if (extra$894.loc) {
                comment$1546.loc = entry$1545.loc;
            }
            comments$1547.push(comment$1546);
        }
        extra$894.comments = comments$1547;
    }
    function collectToken$1025() {
        var start$1548, loc$1549, token$1550, range$1551, value$1552;
        skipComment$908();
        start$1548 = index$880;
        loc$1549 = {
            start: {
                line: lineNumber$881,
                column: index$880 - lineStart$882
            }
        };
        token$1550 = extra$894.advance();
        loc$1549.end = {
            line: lineNumber$881,
            column: index$880 - lineStart$882
        };
        if (token$1550.type !== Token$869.EOF) {
            range$1551 = [
                token$1550.range[0],
                token$1550.range[1]
            ];
            value$1552 = source$878.slice(token$1550.range[0], token$1550.range[1]);
            extra$894.tokens.push({
                type: TokenName$870[token$1550.type],
                value: value$1552,
                range: range$1551,
                loc: loc$1549
            });
        }
        return token$1550;
    }
    function collectRegex$1026() {
        var pos$1553, loc$1554, regex$1555, token$1556;
        skipComment$908();
        pos$1553 = index$880;
        loc$1554 = {
            start: {
                line: lineNumber$881,
                column: index$880 - lineStart$882
            }
        };
        regex$1555 = extra$894.scanRegExp();
        loc$1554.end = {
            line: lineNumber$881,
            column: index$880 - lineStart$882
        };
        if (!extra$894.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$894.tokens.length > 0) {
                token$1556 = extra$894.tokens[extra$894.tokens.length - 1];
                if (token$1556.range[0] === pos$1553 && token$1556.type === 'Punctuator') {
                    if (token$1556.value === '/' || token$1556.value === '/=') {
                        extra$894.tokens.pop();
                    }
                }
            }
            extra$894.tokens.push({
                type: 'RegularExpression',
                value: regex$1555.literal,
                range: [
                    pos$1553,
                    index$880
                ],
                loc: loc$1554
            });
        }
        return regex$1555;
    }
    function filterTokenLocation$1027() {
        var i$1557, entry$1558, token$1559, tokens$1560 = [];
        for (i$1557 = 0; i$1557 < extra$894.tokens.length; ++i$1557) {
            entry$1558 = extra$894.tokens[i$1557];
            token$1559 = {
                type: entry$1558.type,
                value: entry$1558.value
            };
            if (extra$894.range) {
                token$1559.range = entry$1558.range;
            }
            if (extra$894.loc) {
                token$1559.loc = entry$1558.loc;
            }
            tokens$1560.push(token$1559);
        }
        extra$894.tokens = tokens$1560;
    }
    function LocationMarker$1028() {
        var sm_index$1561 = lookahead$891 ? lookahead$891.sm_range[0] : 0;
        var sm_lineStart$1562 = lookahead$891 ? lookahead$891.sm_lineStart : 0;
        var sm_lineNumber$1563 = lookahead$891 ? lookahead$891.sm_lineNumber : 1;
        this.range = [
            sm_index$1561,
            sm_index$1561
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1563,
                column: sm_index$1561 - sm_lineStart$1562
            },
            end: {
                line: sm_lineNumber$1563,
                column: sm_index$1561 - sm_lineStart$1562
            }
        };
    }
    LocationMarker$1028.prototype = {
        constructor: LocationMarker$1028,
        end: function () {
            this.range[1] = sm_index$886;
            this.loc.end.line = sm_lineNumber$883;
            this.loc.end.column = sm_index$886 - sm_lineStart$884;
        },
        applyGroup: function (node$1564) {
            if (extra$894.range) {
                node$1564.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$894.loc) {
                node$1564.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1564 = delegate$888.postProcess(node$1564);
            }
        },
        apply: function (node$1565) {
            var nodeType$1566 = typeof node$1565;
            assert$895(nodeType$1566 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1566);
            if (extra$894.range) {
                node$1565.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$894.loc) {
                node$1565.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1565 = delegate$888.postProcess(node$1565);
            }
        }
    };
    function createLocationMarker$1029() {
        return new LocationMarker$1028();
    }
    function trackGroupExpression$1030() {
        var marker$1567, expr$1568;
        marker$1567 = createLocationMarker$1029();
        expect$932('(');
        ++state$893.parenthesizedCount;
        expr$1568 = parseExpression$969();
        expect$932(')');
        marker$1567.end();
        marker$1567.applyGroup(expr$1568);
        return expr$1568;
    }
    function trackLeftHandSideExpression$1031() {
        var marker$1569, expr$1570;
        // skipComment();
        marker$1569 = createLocationMarker$1029();
        expr$1570 = matchKeyword$935('new') ? parseNewExpression$956() : parsePrimaryExpression$950();
        while (match$934('.') || match$934('[') || lookahead$891.type === Token$869.Template) {
            if (match$934('[')) {
                expr$1570 = delegate$888.createMemberExpression('[', expr$1570, parseComputedMember$955());
                marker$1569.end();
                marker$1569.apply(expr$1570);
            } else if (match$934('.')) {
                expr$1570 = delegate$888.createMemberExpression('.', expr$1570, parseNonComputedMember$954());
                marker$1569.end();
                marker$1569.apply(expr$1570);
            } else {
                expr$1570 = delegate$888.createTaggedTemplateExpression(expr$1570, parseTemplateLiteral$948());
                marker$1569.end();
                marker$1569.apply(expr$1570);
            }
        }
        return expr$1570;
    }
    function trackLeftHandSideExpressionAllowCall$1032() {
        var marker$1571, expr$1572, args$1573;
        // skipComment();
        marker$1571 = createLocationMarker$1029();
        expr$1572 = matchKeyword$935('new') ? parseNewExpression$956() : parsePrimaryExpression$950();
        while (match$934('.') || match$934('[') || match$934('(') || lookahead$891.type === Token$869.Template) {
            if (match$934('(')) {
                args$1573 = parseArguments$951();
                expr$1572 = delegate$888.createCallExpression(expr$1572, args$1573);
                marker$1571.end();
                marker$1571.apply(expr$1572);
            } else if (match$934('[')) {
                expr$1572 = delegate$888.createMemberExpression('[', expr$1572, parseComputedMember$955());
                marker$1571.end();
                marker$1571.apply(expr$1572);
            } else if (match$934('.')) {
                expr$1572 = delegate$888.createMemberExpression('.', expr$1572, parseNonComputedMember$954());
                marker$1571.end();
                marker$1571.apply(expr$1572);
            } else {
                expr$1572 = delegate$888.createTaggedTemplateExpression(expr$1572, parseTemplateLiteral$948());
                marker$1571.end();
                marker$1571.apply(expr$1572);
            }
        }
        return expr$1572;
    }
    function filterGroup$1033(node$1574) {
        var n$1575, i$1576, entry$1577;
        n$1575 = Object.prototype.toString.apply(node$1574) === '[object Array]' ? [] : {};
        for (i$1576 in node$1574) {
            if (node$1574.hasOwnProperty(i$1576) && i$1576 !== 'groupRange' && i$1576 !== 'groupLoc') {
                entry$1577 = node$1574[i$1576];
                if (entry$1577 === null || typeof entry$1577 !== 'object' || entry$1577 instanceof RegExp) {
                    n$1575[i$1576] = entry$1577;
                } else {
                    n$1575[i$1576] = filterGroup$1033(entry$1577);
                }
            }
        }
        return n$1575;
    }
    function wrapTrackingFunction$1034(range$1578, loc$1579) {
        return function (parseFunction$1580) {
            function isBinary$1581(node$1583) {
                return node$1583.type === Syntax$872.LogicalExpression || node$1583.type === Syntax$872.BinaryExpression;
            }
            function visit$1582(node$1584) {
                var start$1585, end$1586;
                if (isBinary$1581(node$1584.left)) {
                    visit$1582(node$1584.left);
                }
                if (isBinary$1581(node$1584.right)) {
                    visit$1582(node$1584.right);
                }
                if (range$1578) {
                    if (node$1584.left.groupRange || node$1584.right.groupRange) {
                        start$1585 = node$1584.left.groupRange ? node$1584.left.groupRange[0] : node$1584.left.range[0];
                        end$1586 = node$1584.right.groupRange ? node$1584.right.groupRange[1] : node$1584.right.range[1];
                        node$1584.range = [
                            start$1585,
                            end$1586
                        ];
                    } else if (typeof node$1584.range === 'undefined') {
                        start$1585 = node$1584.left.range[0];
                        end$1586 = node$1584.right.range[1];
                        node$1584.range = [
                            start$1585,
                            end$1586
                        ];
                    }
                }
                if (loc$1579) {
                    if (node$1584.left.groupLoc || node$1584.right.groupLoc) {
                        start$1585 = node$1584.left.groupLoc ? node$1584.left.groupLoc.start : node$1584.left.loc.start;
                        end$1586 = node$1584.right.groupLoc ? node$1584.right.groupLoc.end : node$1584.right.loc.end;
                        node$1584.loc = {
                            start: start$1585,
                            end: end$1586
                        };
                        node$1584 = delegate$888.postProcess(node$1584);
                    } else if (typeof node$1584.loc === 'undefined') {
                        node$1584.loc = {
                            start: node$1584.left.loc.start,
                            end: node$1584.right.loc.end
                        };
                        node$1584 = delegate$888.postProcess(node$1584);
                    }
                }
            }
            return function () {
                var marker$1587, node$1588, curr$1589 = lookahead$891;
                marker$1587 = createLocationMarker$1029();
                node$1588 = parseFunction$1580.apply(null, arguments);
                marker$1587.end();
                if (node$1588.type !== Syntax$872.Program) {
                    if (curr$1589.leadingComments) {
                        node$1588.leadingComments = curr$1589.leadingComments;
                    }
                    if (curr$1589.trailingComments) {
                        node$1588.trailingComments = curr$1589.trailingComments;
                    }
                }
                if (range$1578 && typeof node$1588.range === 'undefined') {
                    marker$1587.apply(node$1588);
                }
                if (loc$1579 && typeof node$1588.loc === 'undefined') {
                    marker$1587.apply(node$1588);
                }
                if (isBinary$1581(node$1588)) {
                    visit$1582(node$1588);
                }
                return node$1588;
            };
        };
    }
    function patch$1035() {
        var wrapTracking$1590;
        if (extra$894.comments) {
            extra$894.skipComment = skipComment$908;
            skipComment$908 = scanComment$1023;
        }
        if (extra$894.range || extra$894.loc) {
            extra$894.parseGroupExpression = parseGroupExpression$949;
            extra$894.parseLeftHandSideExpression = parseLeftHandSideExpression$958;
            extra$894.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$957;
            parseGroupExpression$949 = trackGroupExpression$1030;
            parseLeftHandSideExpression$958 = trackLeftHandSideExpression$1031;
            parseLeftHandSideExpressionAllowCall$957 = trackLeftHandSideExpressionAllowCall$1032;
            wrapTracking$1590 = wrapTrackingFunction$1034(extra$894.range, extra$894.loc);
            extra$894.parseArrayInitialiser = parseArrayInitialiser$941;
            extra$894.parseAssignmentExpression = parseAssignmentExpression$968;
            extra$894.parseBinaryExpression = parseBinaryExpression$962;
            extra$894.parseBlock = parseBlock$971;
            extra$894.parseFunctionSourceElements = parseFunctionSourceElements$1002;
            extra$894.parseCatchClause = parseCatchClause$997;
            extra$894.parseComputedMember = parseComputedMember$955;
            extra$894.parseConditionalExpression = parseConditionalExpression$963;
            extra$894.parseConstLetDeclaration = parseConstLetDeclaration$976;
            extra$894.parseExportBatchSpecifier = parseExportBatchSpecifier$978;
            extra$894.parseExportDeclaration = parseExportDeclaration$980;
            extra$894.parseExportSpecifier = parseExportSpecifier$979;
            extra$894.parseExpression = parseExpression$969;
            extra$894.parseForVariableDeclaration = parseForVariableDeclaration$988;
            extra$894.parseFunctionDeclaration = parseFunctionDeclaration$1006;
            extra$894.parseFunctionExpression = parseFunctionExpression$1007;
            extra$894.parseParams = parseParams$1005;
            extra$894.parseImportDeclaration = parseImportDeclaration$981;
            extra$894.parseImportSpecifier = parseImportSpecifier$982;
            extra$894.parseModuleDeclaration = parseModuleDeclaration$977;
            extra$894.parseModuleBlock = parseModuleBlock$1020;
            extra$894.parseNewExpression = parseNewExpression$956;
            extra$894.parseNonComputedProperty = parseNonComputedProperty$953;
            extra$894.parseObjectInitialiser = parseObjectInitialiser$946;
            extra$894.parseObjectProperty = parseObjectProperty$945;
            extra$894.parseObjectPropertyKey = parseObjectPropertyKey$944;
            extra$894.parsePostfixExpression = parsePostfixExpression$959;
            extra$894.parsePrimaryExpression = parsePrimaryExpression$950;
            extra$894.parseProgram = parseProgram$1021;
            extra$894.parsePropertyFunction = parsePropertyFunction$942;
            extra$894.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$952;
            extra$894.parseTemplateElement = parseTemplateElement$947;
            extra$894.parseTemplateLiteral = parseTemplateLiteral$948;
            extra$894.parseStatement = parseStatement$1000;
            extra$894.parseSwitchCase = parseSwitchCase$994;
            extra$894.parseUnaryExpression = parseUnaryExpression$960;
            extra$894.parseVariableDeclaration = parseVariableDeclaration$973;
            extra$894.parseVariableIdentifier = parseVariableIdentifier$972;
            extra$894.parseMethodDefinition = parseMethodDefinition$1009;
            extra$894.parseClassDeclaration = parseClassDeclaration$1013;
            extra$894.parseClassExpression = parseClassExpression$1012;
            extra$894.parseClassBody = parseClassBody$1011;
            parseArrayInitialiser$941 = wrapTracking$1590(extra$894.parseArrayInitialiser);
            parseAssignmentExpression$968 = wrapTracking$1590(extra$894.parseAssignmentExpression);
            parseBinaryExpression$962 = wrapTracking$1590(extra$894.parseBinaryExpression);
            parseBlock$971 = wrapTracking$1590(extra$894.parseBlock);
            parseFunctionSourceElements$1002 = wrapTracking$1590(extra$894.parseFunctionSourceElements);
            parseCatchClause$997 = wrapTracking$1590(extra$894.parseCatchClause);
            parseComputedMember$955 = wrapTracking$1590(extra$894.parseComputedMember);
            parseConditionalExpression$963 = wrapTracking$1590(extra$894.parseConditionalExpression);
            parseConstLetDeclaration$976 = wrapTracking$1590(extra$894.parseConstLetDeclaration);
            parseExportBatchSpecifier$978 = wrapTracking$1590(parseExportBatchSpecifier$978);
            parseExportDeclaration$980 = wrapTracking$1590(parseExportDeclaration$980);
            parseExportSpecifier$979 = wrapTracking$1590(parseExportSpecifier$979);
            parseExpression$969 = wrapTracking$1590(extra$894.parseExpression);
            parseForVariableDeclaration$988 = wrapTracking$1590(extra$894.parseForVariableDeclaration);
            parseFunctionDeclaration$1006 = wrapTracking$1590(extra$894.parseFunctionDeclaration);
            parseFunctionExpression$1007 = wrapTracking$1590(extra$894.parseFunctionExpression);
            parseParams$1005 = wrapTracking$1590(extra$894.parseParams);
            parseImportDeclaration$981 = wrapTracking$1590(extra$894.parseImportDeclaration);
            parseImportSpecifier$982 = wrapTracking$1590(extra$894.parseImportSpecifier);
            parseModuleDeclaration$977 = wrapTracking$1590(extra$894.parseModuleDeclaration);
            parseModuleBlock$1020 = wrapTracking$1590(extra$894.parseModuleBlock);
            parseLeftHandSideExpression$958 = wrapTracking$1590(parseLeftHandSideExpression$958);
            parseNewExpression$956 = wrapTracking$1590(extra$894.parseNewExpression);
            parseNonComputedProperty$953 = wrapTracking$1590(extra$894.parseNonComputedProperty);
            parseObjectInitialiser$946 = wrapTracking$1590(extra$894.parseObjectInitialiser);
            parseObjectProperty$945 = wrapTracking$1590(extra$894.parseObjectProperty);
            parseObjectPropertyKey$944 = wrapTracking$1590(extra$894.parseObjectPropertyKey);
            parsePostfixExpression$959 = wrapTracking$1590(extra$894.parsePostfixExpression);
            parsePrimaryExpression$950 = wrapTracking$1590(extra$894.parsePrimaryExpression);
            parseProgram$1021 = wrapTracking$1590(extra$894.parseProgram);
            parsePropertyFunction$942 = wrapTracking$1590(extra$894.parsePropertyFunction);
            parseTemplateElement$947 = wrapTracking$1590(extra$894.parseTemplateElement);
            parseTemplateLiteral$948 = wrapTracking$1590(extra$894.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$952 = wrapTracking$1590(extra$894.parseSpreadOrAssignmentExpression);
            parseStatement$1000 = wrapTracking$1590(extra$894.parseStatement);
            parseSwitchCase$994 = wrapTracking$1590(extra$894.parseSwitchCase);
            parseUnaryExpression$960 = wrapTracking$1590(extra$894.parseUnaryExpression);
            parseVariableDeclaration$973 = wrapTracking$1590(extra$894.parseVariableDeclaration);
            parseVariableIdentifier$972 = wrapTracking$1590(extra$894.parseVariableIdentifier);
            parseMethodDefinition$1009 = wrapTracking$1590(extra$894.parseMethodDefinition);
            parseClassDeclaration$1013 = wrapTracking$1590(extra$894.parseClassDeclaration);
            parseClassExpression$1012 = wrapTracking$1590(extra$894.parseClassExpression);
            parseClassBody$1011 = wrapTracking$1590(extra$894.parseClassBody);
        }
        if (typeof extra$894.tokens !== 'undefined') {
            extra$894.advance = advance$924;
            extra$894.scanRegExp = scanRegExp$921;
            advance$924 = collectToken$1025;
            scanRegExp$921 = collectRegex$1026;
        }
    }
    function unpatch$1036() {
        if (typeof extra$894.skipComment === 'function') {
            skipComment$908 = extra$894.skipComment;
        }
        if (extra$894.range || extra$894.loc) {
            parseArrayInitialiser$941 = extra$894.parseArrayInitialiser;
            parseAssignmentExpression$968 = extra$894.parseAssignmentExpression;
            parseBinaryExpression$962 = extra$894.parseBinaryExpression;
            parseBlock$971 = extra$894.parseBlock;
            parseFunctionSourceElements$1002 = extra$894.parseFunctionSourceElements;
            parseCatchClause$997 = extra$894.parseCatchClause;
            parseComputedMember$955 = extra$894.parseComputedMember;
            parseConditionalExpression$963 = extra$894.parseConditionalExpression;
            parseConstLetDeclaration$976 = extra$894.parseConstLetDeclaration;
            parseExportBatchSpecifier$978 = extra$894.parseExportBatchSpecifier;
            parseExportDeclaration$980 = extra$894.parseExportDeclaration;
            parseExportSpecifier$979 = extra$894.parseExportSpecifier;
            parseExpression$969 = extra$894.parseExpression;
            parseForVariableDeclaration$988 = extra$894.parseForVariableDeclaration;
            parseFunctionDeclaration$1006 = extra$894.parseFunctionDeclaration;
            parseFunctionExpression$1007 = extra$894.parseFunctionExpression;
            parseImportDeclaration$981 = extra$894.parseImportDeclaration;
            parseImportSpecifier$982 = extra$894.parseImportSpecifier;
            parseGroupExpression$949 = extra$894.parseGroupExpression;
            parseLeftHandSideExpression$958 = extra$894.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$957 = extra$894.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$977 = extra$894.parseModuleDeclaration;
            parseModuleBlock$1020 = extra$894.parseModuleBlock;
            parseNewExpression$956 = extra$894.parseNewExpression;
            parseNonComputedProperty$953 = extra$894.parseNonComputedProperty;
            parseObjectInitialiser$946 = extra$894.parseObjectInitialiser;
            parseObjectProperty$945 = extra$894.parseObjectProperty;
            parseObjectPropertyKey$944 = extra$894.parseObjectPropertyKey;
            parsePostfixExpression$959 = extra$894.parsePostfixExpression;
            parsePrimaryExpression$950 = extra$894.parsePrimaryExpression;
            parseProgram$1021 = extra$894.parseProgram;
            parsePropertyFunction$942 = extra$894.parsePropertyFunction;
            parseTemplateElement$947 = extra$894.parseTemplateElement;
            parseTemplateLiteral$948 = extra$894.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$952 = extra$894.parseSpreadOrAssignmentExpression;
            parseStatement$1000 = extra$894.parseStatement;
            parseSwitchCase$994 = extra$894.parseSwitchCase;
            parseUnaryExpression$960 = extra$894.parseUnaryExpression;
            parseVariableDeclaration$973 = extra$894.parseVariableDeclaration;
            parseVariableIdentifier$972 = extra$894.parseVariableIdentifier;
            parseMethodDefinition$1009 = extra$894.parseMethodDefinition;
            parseClassDeclaration$1013 = extra$894.parseClassDeclaration;
            parseClassExpression$1012 = extra$894.parseClassExpression;
            parseClassBody$1011 = extra$894.parseClassBody;
        }
        if (typeof extra$894.scanRegExp === 'function') {
            advance$924 = extra$894.advance;
            scanRegExp$921 = extra$894.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1037(object$1591, properties$1592) {
        var entry$1593, result$1594 = {};
        for (entry$1593 in object$1591) {
            if (object$1591.hasOwnProperty(entry$1593)) {
                result$1594[entry$1593] = object$1591[entry$1593];
            }
        }
        for (entry$1593 in properties$1592) {
            if (properties$1592.hasOwnProperty(entry$1593)) {
                result$1594[entry$1593] = properties$1592[entry$1593];
            }
        }
        return result$1594;
    }
    function tokenize$1038(code$1595, options$1596) {
        var toString$1597, token$1598, tokens$1599;
        toString$1597 = String;
        if (typeof code$1595 !== 'string' && !(code$1595 instanceof String)) {
            code$1595 = toString$1597(code$1595);
        }
        delegate$888 = SyntaxTreeDelegate$876;
        source$878 = code$1595;
        index$880 = 0;
        lineNumber$881 = source$878.length > 0 ? 1 : 0;
        lineStart$882 = 0;
        length$887 = source$878.length;
        lookahead$891 = null;
        state$893 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$894 = {};
        // Options matching.
        options$1596 = options$1596 || {};
        // Of course we collect tokens here.
        options$1596.tokens = true;
        extra$894.tokens = [];
        extra$894.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$894.openParenToken = -1;
        extra$894.openCurlyToken = -1;
        extra$894.range = typeof options$1596.range === 'boolean' && options$1596.range;
        extra$894.loc = typeof options$1596.loc === 'boolean' && options$1596.loc;
        if (typeof options$1596.comment === 'boolean' && options$1596.comment) {
            extra$894.comments = [];
        }
        if (typeof options$1596.tolerant === 'boolean' && options$1596.tolerant) {
            extra$894.errors = [];
        }
        if (length$887 > 0) {
            if (typeof source$878[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1595 instanceof String) {
                    source$878 = code$1595.valueOf();
                }
            }
        }
        patch$1035();
        try {
            peek$926();
            if (lookahead$891.type === Token$869.EOF) {
                return extra$894.tokens;
            }
            token$1598 = lex$925();
            while (lookahead$891.type !== Token$869.EOF) {
                try {
                    token$1598 = lex$925();
                } catch (lexError$1600) {
                    token$1598 = lookahead$891;
                    if (extra$894.errors) {
                        extra$894.errors.push(lexError$1600);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1600;
                    }
                }
            }
            filterTokenLocation$1027();
            tokens$1599 = extra$894.tokens;
            if (typeof extra$894.comments !== 'undefined') {
                filterCommentLocation$1024();
                tokens$1599.comments = extra$894.comments;
            }
            if (typeof extra$894.errors !== 'undefined') {
                tokens$1599.errors = extra$894.errors;
            }
        } catch (e$1601) {
            throw e$1601;
        } finally {
            unpatch$1036();
            extra$894 = {};
        }
        return tokens$1599;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1039(toks$1602, start$1603, inExprDelim$1604, parentIsBlock$1605) {
        var assignOps$1606 = [
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
        var binaryOps$1607 = [
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
        var unaryOps$1608 = [
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
        function back$1609(n$1610) {
            var idx$1611 = toks$1602.length - n$1610 > 0 ? toks$1602.length - n$1610 : 0;
            return toks$1602[idx$1611];
        }
        if (inExprDelim$1604 && toks$1602.length - (start$1603 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1609(start$1603 + 2).value === ':' && parentIsBlock$1605) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$896(back$1609(start$1603 + 2).value, unaryOps$1608.concat(binaryOps$1607).concat(assignOps$1606))) {
            // ... + {...}
            return false;
        } else if (back$1609(start$1603 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1612 = typeof back$1609(start$1603 + 1).startLineNumber !== 'undefined' ? back$1609(start$1603 + 1).startLineNumber : back$1609(start$1603 + 1).lineNumber;
            if (back$1609(start$1603 + 2).lineNumber !== currLineNumber$1612) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$896(back$1609(start$1603 + 2).value, [
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
    function readToken$1040(toks$1613, inExprDelim$1614, parentIsBlock$1615) {
        var delimiters$1616 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1617 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1618 = toks$1613.length - 1;
        var comments$1619, commentsLen$1620 = extra$894.comments.length;
        function back$1621(n$1625) {
            var idx$1626 = toks$1613.length - n$1625 > 0 ? toks$1613.length - n$1625 : 0;
            return toks$1613[idx$1626];
        }
        function attachComments$1622(token$1627) {
            if (comments$1619) {
                token$1627.leadingComments = comments$1619;
            }
            return token$1627;
        }
        function _advance$1623() {
            return attachComments$1622(advance$924());
        }
        function _scanRegExp$1624() {
            return attachComments$1622(scanRegExp$921());
        }
        skipComment$908();
        if (extra$894.comments.length > commentsLen$1620) {
            comments$1619 = extra$894.comments.slice(commentsLen$1620);
        }
        if (isIn$896(source$878[index$880], delimiters$1616)) {
            return attachComments$1622(readDelim$1041(toks$1613, inExprDelim$1614, parentIsBlock$1615));
        }
        if (source$878[index$880] === '/') {
            var prev$1628 = back$1621(1);
            if (prev$1628) {
                if (prev$1628.value === '()') {
                    if (isIn$896(back$1621(2).value, parenIdents$1617)) {
                        // ... if (...) / ...
                        return _scanRegExp$1624();
                    }
                    // ... (...) / ...
                    return _advance$1623();
                }
                if (prev$1628.value === '{}') {
                    if (blockAllowed$1039(toks$1613, 0, inExprDelim$1614, parentIsBlock$1615)) {
                        if (back$1621(2).value === '()') {
                            // named function
                            if (back$1621(4).value === 'function') {
                                if (!blockAllowed$1039(toks$1613, 3, inExprDelim$1614, parentIsBlock$1615)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1623();
                                }
                                if (toks$1613.length - 5 <= 0 && inExprDelim$1614) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1623();
                                }
                            }
                            // unnamed function
                            if (back$1621(3).value === 'function') {
                                if (!blockAllowed$1039(toks$1613, 2, inExprDelim$1614, parentIsBlock$1615)) {
                                    // new function (...) {...} / ...
                                    return _advance$1623();
                                }
                                if (toks$1613.length - 4 <= 0 && inExprDelim$1614) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1623();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1624();
                    } else {
                        // ... + {...} / ...
                        return _advance$1623();
                    }
                }
                if (prev$1628.type === Token$869.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1624();
                }
                if (isKeyword$907(prev$1628.value)) {
                    // typeof /...
                    return _scanRegExp$1624();
                }
                return _advance$1623();
            }
            return _scanRegExp$1624();
        }
        return _advance$1623();
    }
    function readDelim$1041(toks$1629, inExprDelim$1630, parentIsBlock$1631) {
        var startDelim$1632 = advance$924(), matchDelim$1633 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1634 = [];
        var delimiters$1635 = [
                '(',
                '{',
                '['
            ];
        assert$895(delimiters$1635.indexOf(startDelim$1632.value) !== -1, 'Need to begin at the delimiter');
        var token$1636 = startDelim$1632;
        var startLineNumber$1637 = token$1636.lineNumber;
        var startLineStart$1638 = token$1636.lineStart;
        var startRange$1639 = token$1636.range;
        var delimToken$1640 = {};
        delimToken$1640.type = Token$869.Delimiter;
        delimToken$1640.value = startDelim$1632.value + matchDelim$1633[startDelim$1632.value];
        delimToken$1640.startLineNumber = startLineNumber$1637;
        delimToken$1640.startLineStart = startLineStart$1638;
        delimToken$1640.startRange = startRange$1639;
        var delimIsBlock$1641 = false;
        if (startDelim$1632.value === '{') {
            delimIsBlock$1641 = blockAllowed$1039(toks$1629.concat(delimToken$1640), 0, inExprDelim$1630, parentIsBlock$1631);
        }
        while (index$880 <= length$887) {
            token$1636 = readToken$1040(inner$1634, startDelim$1632.value === '(' || startDelim$1632.value === '[', delimIsBlock$1641);
            if (token$1636.type === Token$869.Punctuator && token$1636.value === matchDelim$1633[startDelim$1632.value]) {
                if (token$1636.leadingComments) {
                    delimToken$1640.trailingComments = token$1636.leadingComments;
                }
                break;
            } else if (token$1636.type === Token$869.EOF) {
                throwError$929({}, Messages$874.UnexpectedEOS);
            } else {
                inner$1634.push(token$1636);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$880 >= length$887 && matchDelim$1633[startDelim$1632.value] !== source$878[length$887 - 1]) {
            throwError$929({}, Messages$874.UnexpectedEOS);
        }
        var endLineNumber$1642 = token$1636.lineNumber;
        var endLineStart$1643 = token$1636.lineStart;
        var endRange$1644 = token$1636.range;
        delimToken$1640.inner = inner$1634;
        delimToken$1640.endLineNumber = endLineNumber$1642;
        delimToken$1640.endLineStart = endLineStart$1643;
        delimToken$1640.endRange = endRange$1644;
        return delimToken$1640;
    }
    // (Str) -> [...CSyntax]
    function read$1042(code$1645) {
        var token$1646, tokenTree$1647 = [];
        extra$894 = {};
        extra$894.comments = [];
        patch$1035();
        source$878 = code$1645;
        index$880 = 0;
        lineNumber$881 = source$878.length > 0 ? 1 : 0;
        lineStart$882 = 0;
        length$887 = source$878.length;
        state$893 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$880 < length$887) {
            tokenTree$1647.push(readToken$1040(tokenTree$1647, false, false));
        }
        var last$1648 = tokenTree$1647[tokenTree$1647.length - 1];
        if (last$1648 && last$1648.type !== Token$869.EOF) {
            tokenTree$1647.push({
                type: Token$869.EOF,
                value: '',
                lineNumber: last$1648.lineNumber,
                lineStart: last$1648.lineStart,
                range: [
                    index$880,
                    index$880
                ]
            });
        }
        return expander$868.tokensToSyntax(tokenTree$1647);
    }
    function parse$1043(code$1649, options$1650) {
        var program$1651, toString$1652;
        extra$894 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1649)) {
            tokenStream$889 = code$1649;
            length$887 = tokenStream$889.length;
            lineNumber$881 = tokenStream$889.length > 0 ? 1 : 0;
            source$878 = undefined;
        } else {
            toString$1652 = String;
            if (typeof code$1649 !== 'string' && !(code$1649 instanceof String)) {
                code$1649 = toString$1652(code$1649);
            }
            source$878 = code$1649;
            length$887 = source$878.length;
            lineNumber$881 = source$878.length > 0 ? 1 : 0;
        }
        delegate$888 = SyntaxTreeDelegate$876;
        streamIndex$890 = -1;
        index$880 = 0;
        lineStart$882 = 0;
        sm_lineStart$884 = 0;
        sm_lineNumber$883 = lineNumber$881;
        sm_index$886 = 0;
        sm_range$885 = [
            0,
            0
        ];
        lookahead$891 = null;
        state$893 = {
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
        if (typeof options$1650 !== 'undefined') {
            extra$894.range = typeof options$1650.range === 'boolean' && options$1650.range;
            extra$894.loc = typeof options$1650.loc === 'boolean' && options$1650.loc;
            if (extra$894.loc && options$1650.source !== null && options$1650.source !== undefined) {
                delegate$888 = extend$1037(delegate$888, {
                    'postProcess': function (node$1653) {
                        node$1653.loc.source = toString$1652(options$1650.source);
                        return node$1653;
                    }
                });
            }
            if (typeof options$1650.tokens === 'boolean' && options$1650.tokens) {
                extra$894.tokens = [];
            }
            if (typeof options$1650.comment === 'boolean' && options$1650.comment) {
                extra$894.comments = [];
            }
            if (typeof options$1650.tolerant === 'boolean' && options$1650.tolerant) {
                extra$894.errors = [];
            }
        }
        if (length$887 > 0) {
            if (source$878 && typeof source$878[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1649 instanceof String) {
                    source$878 = code$1649.valueOf();
                }
            }
        }
        extra$894 = {
            loc: true,
            errors: []
        };
        patch$1035();
        try {
            program$1651 = parseProgram$1021();
            if (typeof extra$894.comments !== 'undefined') {
                filterCommentLocation$1024();
                program$1651.comments = extra$894.comments;
            }
            if (typeof extra$894.tokens !== 'undefined') {
                filterTokenLocation$1027();
                program$1651.tokens = extra$894.tokens;
            }
            if (typeof extra$894.errors !== 'undefined') {
                program$1651.errors = extra$894.errors;
            }
            if (extra$894.range || extra$894.loc) {
                program$1651.body = filterGroup$1033(program$1651.body);
            }
        } catch (e$1654) {
            throw e$1654;
        } finally {
            unpatch$1036();
            extra$894 = {};
        }
        return program$1651;
    }
    exports$867.tokenize = tokenize$1038;
    exports$867.read = read$1042;
    exports$867.Token = Token$869;
    exports$867.parse = parse$1043;
    // Deep copy.
    exports$867.Syntax = function () {
        var name$1655, types$1656 = {};
        if (typeof Object.create === 'function') {
            types$1656 = Object.create(null);
        }
        for (name$1655 in Syntax$872) {
            if (Syntax$872.hasOwnProperty(name$1655)) {
                types$1656[name$1655] = Syntax$872[name$1655];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1656);
        }
        return types$1656;
    }();
}));
//# sourceMappingURL=parser.js.map