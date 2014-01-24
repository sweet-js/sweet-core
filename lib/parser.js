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
(function (root$869, factory$870) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$870);
    } else if (typeof exports !== 'undefined') {
        factory$870(exports, require('./expander'));
    } else {
        factory$870(root$869.esprima = {});
    }
}(this, function (exports$871, expander$872) {
    'use strict';
    var Token$873, TokenName$874, FnExprTokens$875, Syntax$876, PropertyKind$877, Messages$878, Regex$879, SyntaxTreeDelegate$880, ClassPropertyType$881, source$882, strict$883, index$884, lineNumber$885, lineStart$886, sm_lineNumber$887, sm_lineStart$888, sm_range$889, sm_index$890, length$891, delegate$892, tokenStream$893, streamIndex$894, lookahead$895, lookaheadIndex$896, state$897, extra$898;
    Token$873 = {
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
    TokenName$874 = {};
    TokenName$874[Token$873.BooleanLiteral] = 'Boolean';
    TokenName$874[Token$873.EOF] = '<end>';
    TokenName$874[Token$873.Identifier] = 'Identifier';
    TokenName$874[Token$873.Keyword] = 'Keyword';
    TokenName$874[Token$873.NullLiteral] = 'Null';
    TokenName$874[Token$873.NumericLiteral] = 'Numeric';
    TokenName$874[Token$873.Punctuator] = 'Punctuator';
    TokenName$874[Token$873.StringLiteral] = 'String';
    TokenName$874[Token$873.RegularExpression] = 'RegularExpression';
    TokenName$874[Token$873.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$875 = [
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
    Syntax$876 = {
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
    PropertyKind$877 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$881 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$878 = {
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
    Regex$879 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$899(condition$1048, message$1049) {
        if (!condition$1048) {
            throw new Error('ASSERT: ' + message$1049);
        }
    }
    function isIn$900(el$1050, list$1051) {
        return list$1051.indexOf(el$1050) !== -1;
    }
    function isDecimalDigit$901(ch$1052) {
        return ch$1052 >= 48 && ch$1052 <= 57;
    }    // 0..9
    function isHexDigit$902(ch$1053) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1053) >= 0;
    }
    function isOctalDigit$903(ch$1054) {
        return '01234567'.indexOf(ch$1054) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$904(ch$1055) {
        return ch$1055 === 32 || ch$1055 === 9 || ch$1055 === 11 || ch$1055 === 12 || ch$1055 === 160 || ch$1055 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1055)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$905(ch$1056) {
        return ch$1056 === 10 || ch$1056 === 13 || ch$1056 === 8232 || ch$1056 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$906(ch$1057) {
        return ch$1057 === 36 || ch$1057 === 95 || ch$1057 >= 65 && ch$1057 <= 90 || ch$1057 >= 97 && ch$1057 <= 122 || ch$1057 === 92 || ch$1057 >= 128 && Regex$879.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1057));
    }
    function isIdentifierPart$907(ch$1058) {
        return ch$1058 === 36 || ch$1058 === 95 || ch$1058 >= 65 && ch$1058 <= 90 || ch$1058 >= 97 && ch$1058 <= 122 || ch$1058 >= 48 && ch$1058 <= 57 || ch$1058 === 92 || ch$1058 >= 128 && Regex$879.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1058));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$908(id$1059) {
        switch (id$1059) {
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
    function isStrictModeReservedWord$909(id$1060) {
        switch (id$1060) {
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
    function isRestrictedWord$910(id$1061) {
        return id$1061 === 'eval' || id$1061 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$911(id$1062) {
        if (strict$883 && isStrictModeReservedWord$909(id$1062)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1062.length) {
        case 2:
            return id$1062 === 'if' || id$1062 === 'in' || id$1062 === 'do';
        case 3:
            return id$1062 === 'var' || id$1062 === 'for' || id$1062 === 'new' || id$1062 === 'try' || id$1062 === 'let';
        case 4:
            return id$1062 === 'this' || id$1062 === 'else' || id$1062 === 'case' || id$1062 === 'void' || id$1062 === 'with' || id$1062 === 'enum';
        case 5:
            return id$1062 === 'while' || id$1062 === 'break' || id$1062 === 'catch' || id$1062 === 'throw' || id$1062 === 'const' || id$1062 === 'yield' || id$1062 === 'class' || id$1062 === 'super';
        case 6:
            return id$1062 === 'return' || id$1062 === 'typeof' || id$1062 === 'delete' || id$1062 === 'switch' || id$1062 === 'export' || id$1062 === 'import';
        case 7:
            return id$1062 === 'default' || id$1062 === 'finally' || id$1062 === 'extends';
        case 8:
            return id$1062 === 'function' || id$1062 === 'continue' || id$1062 === 'debugger';
        case 10:
            return id$1062 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$912() {
        var ch$1063, blockComment$1064, lineComment$1065;
        blockComment$1064 = false;
        lineComment$1065 = false;
        while (index$884 < length$891) {
            ch$1063 = source$882.charCodeAt(index$884);
            if (lineComment$1065) {
                ++index$884;
                if (isLineTerminator$905(ch$1063)) {
                    lineComment$1065 = false;
                    if (ch$1063 === 13 && source$882.charCodeAt(index$884) === 10) {
                        ++index$884;
                    }
                    ++lineNumber$885;
                    lineStart$886 = index$884;
                }
            } else if (blockComment$1064) {
                if (isLineTerminator$905(ch$1063)) {
                    if (ch$1063 === 13 && source$882.charCodeAt(index$884 + 1) === 10) {
                        ++index$884;
                    }
                    ++lineNumber$885;
                    ++index$884;
                    lineStart$886 = index$884;
                    if (index$884 >= length$891) {
                        throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1063 = source$882.charCodeAt(index$884++);
                    if (index$884 >= length$891) {
                        throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1063 === 42) {
                        ch$1063 = source$882.charCodeAt(index$884);
                        if (ch$1063 === 47) {
                            ++index$884;
                            blockComment$1064 = false;
                        }
                    }
                }
            } else if (ch$1063 === 47) {
                ch$1063 = source$882.charCodeAt(index$884 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1063 === 47) {
                    index$884 += 2;
                    lineComment$1065 = true;
                } else if (ch$1063 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$884 += 2;
                    blockComment$1064 = true;
                    if (index$884 >= length$891) {
                        throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$904(ch$1063)) {
                ++index$884;
            } else if (isLineTerminator$905(ch$1063)) {
                ++index$884;
                if (ch$1063 === 13 && source$882.charCodeAt(index$884) === 10) {
                    ++index$884;
                }
                ++lineNumber$885;
                lineStart$886 = index$884;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$913(prefix$1066) {
        var i$1067, len$1068, ch$1069, code$1070 = 0;
        len$1068 = prefix$1066 === 'u' ? 4 : 2;
        for (i$1067 = 0; i$1067 < len$1068; ++i$1067) {
            if (index$884 < length$891 && isHexDigit$902(source$882[index$884])) {
                ch$1069 = source$882[index$884++];
                code$1070 = code$1070 * 16 + '0123456789abcdef'.indexOf(ch$1069.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1070);
    }
    function scanUnicodeCodePointEscape$914() {
        var ch$1071, code$1072, cu1$1073, cu2$1074;
        ch$1071 = source$882[index$884];
        code$1072 = 0;
        // At least, one hex digit is required.
        if (ch$1071 === '}') {
            throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
        }
        while (index$884 < length$891) {
            ch$1071 = source$882[index$884++];
            if (!isHexDigit$902(ch$1071)) {
                break;
            }
            code$1072 = code$1072 * 16 + '0123456789abcdef'.indexOf(ch$1071.toLowerCase());
        }
        if (code$1072 > 1114111 || ch$1071 !== '}') {
            throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1072 <= 65535) {
            return String.fromCharCode(code$1072);
        }
        cu1$1073 = (code$1072 - 65536 >> 10) + 55296;
        cu2$1074 = (code$1072 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1073, cu2$1074);
    }
    function getEscapedIdentifier$915() {
        var ch$1075, id$1076;
        ch$1075 = source$882.charCodeAt(index$884++);
        id$1076 = String.fromCharCode(ch$1075);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1075 === 92) {
            if (source$882.charCodeAt(index$884) !== 117) {
                throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
            }
            ++index$884;
            ch$1075 = scanHexEscape$913('u');
            if (!ch$1075 || ch$1075 === '\\' || !isIdentifierStart$906(ch$1075.charCodeAt(0))) {
                throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
            }
            id$1076 = ch$1075;
        }
        while (index$884 < length$891) {
            ch$1075 = source$882.charCodeAt(index$884);
            if (!isIdentifierPart$907(ch$1075)) {
                break;
            }
            ++index$884;
            id$1076 += String.fromCharCode(ch$1075);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1075 === 92) {
                id$1076 = id$1076.substr(0, id$1076.length - 1);
                if (source$882.charCodeAt(index$884) !== 117) {
                    throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
                }
                ++index$884;
                ch$1075 = scanHexEscape$913('u');
                if (!ch$1075 || ch$1075 === '\\' || !isIdentifierPart$907(ch$1075.charCodeAt(0))) {
                    throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
                }
                id$1076 += ch$1075;
            }
        }
        return id$1076;
    }
    function getIdentifier$916() {
        var start$1077, ch$1078;
        start$1077 = index$884++;
        while (index$884 < length$891) {
            ch$1078 = source$882.charCodeAt(index$884);
            if (ch$1078 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$884 = start$1077;
                return getEscapedIdentifier$915();
            }
            if (isIdentifierPart$907(ch$1078)) {
                ++index$884;
            } else {
                break;
            }
        }
        return source$882.slice(start$1077, index$884);
    }
    function scanIdentifier$917() {
        var start$1079, id$1080, type$1081;
        start$1079 = index$884;
        // Backslash (char #92) starts an escaped character.
        id$1080 = source$882.charCodeAt(index$884) === 92 ? getEscapedIdentifier$915() : getIdentifier$916();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1080.length === 1) {
            type$1081 = Token$873.Identifier;
        } else if (isKeyword$911(id$1080)) {
            type$1081 = Token$873.Keyword;
        } else if (id$1080 === 'null') {
            type$1081 = Token$873.NullLiteral;
        } else if (id$1080 === 'true' || id$1080 === 'false') {
            type$1081 = Token$873.BooleanLiteral;
        } else {
            type$1081 = Token$873.Identifier;
        }
        return {
            type: type$1081,
            value: id$1080,
            lineNumber: lineNumber$885,
            lineStart: lineStart$886,
            range: [
                start$1079,
                index$884
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$918() {
        var start$1082 = index$884, code$1083 = source$882.charCodeAt(index$884), code2$1084, ch1$1085 = source$882[index$884], ch2$1086, ch3$1087, ch4$1088;
        switch (code$1083) {
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
            ++index$884;
            if (extra$898.tokenize) {
                if (code$1083 === 40) {
                    extra$898.openParenToken = extra$898.tokens.length;
                } else if (code$1083 === 123) {
                    extra$898.openCurlyToken = extra$898.tokens.length;
                }
            }
            return {
                type: Token$873.Punctuator,
                value: String.fromCharCode(code$1083),
                lineNumber: lineNumber$885,
                lineStart: lineStart$886,
                range: [
                    start$1082,
                    index$884
                ]
            };
        default:
            code2$1084 = source$882.charCodeAt(index$884 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1084 === 61) {
                switch (code$1083) {
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
                    index$884 += 2;
                    return {
                        type: Token$873.Punctuator,
                        value: String.fromCharCode(code$1083) + String.fromCharCode(code2$1084),
                        lineNumber: lineNumber$885,
                        lineStart: lineStart$886,
                        range: [
                            start$1082,
                            index$884
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$884 += 2;
                    // !== and ===
                    if (source$882.charCodeAt(index$884) === 61) {
                        ++index$884;
                    }
                    return {
                        type: Token$873.Punctuator,
                        value: source$882.slice(start$1082, index$884),
                        lineNumber: lineNumber$885,
                        lineStart: lineStart$886,
                        range: [
                            start$1082,
                            index$884
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1086 = source$882[index$884 + 1];
        ch3$1087 = source$882[index$884 + 2];
        ch4$1088 = source$882[index$884 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1085 === '>' && ch2$1086 === '>' && ch3$1087 === '>') {
            if (ch4$1088 === '=') {
                index$884 += 4;
                return {
                    type: Token$873.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$885,
                    lineStart: lineStart$886,
                    range: [
                        start$1082,
                        index$884
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1085 === '>' && ch2$1086 === '>' && ch3$1087 === '>') {
            index$884 += 3;
            return {
                type: Token$873.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$885,
                lineStart: lineStart$886,
                range: [
                    start$1082,
                    index$884
                ]
            };
        }
        if (ch1$1085 === '<' && ch2$1086 === '<' && ch3$1087 === '=') {
            index$884 += 3;
            return {
                type: Token$873.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$885,
                lineStart: lineStart$886,
                range: [
                    start$1082,
                    index$884
                ]
            };
        }
        if (ch1$1085 === '>' && ch2$1086 === '>' && ch3$1087 === '=') {
            index$884 += 3;
            return {
                type: Token$873.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$885,
                lineStart: lineStart$886,
                range: [
                    start$1082,
                    index$884
                ]
            };
        }
        if (ch1$1085 === '.' && ch2$1086 === '.' && ch3$1087 === '.') {
            index$884 += 3;
            return {
                type: Token$873.Punctuator,
                value: '...',
                lineNumber: lineNumber$885,
                lineStart: lineStart$886,
                range: [
                    start$1082,
                    index$884
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1085 === ch2$1086 && '+-<>&|'.indexOf(ch1$1085) >= 0) {
            index$884 += 2;
            return {
                type: Token$873.Punctuator,
                value: ch1$1085 + ch2$1086,
                lineNumber: lineNumber$885,
                lineStart: lineStart$886,
                range: [
                    start$1082,
                    index$884
                ]
            };
        }
        if (ch1$1085 === '=' && ch2$1086 === '>') {
            index$884 += 2;
            return {
                type: Token$873.Punctuator,
                value: '=>',
                lineNumber: lineNumber$885,
                lineStart: lineStart$886,
                range: [
                    start$1082,
                    index$884
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1085) >= 0) {
            ++index$884;
            return {
                type: Token$873.Punctuator,
                value: ch1$1085,
                lineNumber: lineNumber$885,
                lineStart: lineStart$886,
                range: [
                    start$1082,
                    index$884
                ]
            };
        }
        if (ch1$1085 === '.') {
            ++index$884;
            return {
                type: Token$873.Punctuator,
                value: ch1$1085,
                lineNumber: lineNumber$885,
                lineStart: lineStart$886,
                range: [
                    start$1082,
                    index$884
                ]
            };
        }
        throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$919(start$1089) {
        var number$1090 = '';
        while (index$884 < length$891) {
            if (!isHexDigit$902(source$882[index$884])) {
                break;
            }
            number$1090 += source$882[index$884++];
        }
        if (number$1090.length === 0) {
            throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$906(source$882.charCodeAt(index$884))) {
            throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$873.NumericLiteral,
            value: parseInt('0x' + number$1090, 16),
            lineNumber: lineNumber$885,
            lineStart: lineStart$886,
            range: [
                start$1089,
                index$884
            ]
        };
    }
    function scanOctalLiteral$920(prefix$1091, start$1092) {
        var number$1093, octal$1094;
        if (isOctalDigit$903(prefix$1091)) {
            octal$1094 = true;
            number$1093 = '0' + source$882[index$884++];
        } else {
            octal$1094 = false;
            ++index$884;
            number$1093 = '';
        }
        while (index$884 < length$891) {
            if (!isOctalDigit$903(source$882[index$884])) {
                break;
            }
            number$1093 += source$882[index$884++];
        }
        if (!octal$1094 && number$1093.length === 0) {
            // only 0o or 0O
            throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$906(source$882.charCodeAt(index$884)) || isDecimalDigit$901(source$882.charCodeAt(index$884))) {
            throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$873.NumericLiteral,
            value: parseInt(number$1093, 8),
            octal: octal$1094,
            lineNumber: lineNumber$885,
            lineStart: lineStart$886,
            range: [
                start$1092,
                index$884
            ]
        };
    }
    function scanNumericLiteral$921() {
        var number$1095, start$1096, ch$1097, octal$1098;
        ch$1097 = source$882[index$884];
        assert$899(isDecimalDigit$901(ch$1097.charCodeAt(0)) || ch$1097 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1096 = index$884;
        number$1095 = '';
        if (ch$1097 !== '.') {
            number$1095 = source$882[index$884++];
            ch$1097 = source$882[index$884];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1095 === '0') {
                if (ch$1097 === 'x' || ch$1097 === 'X') {
                    ++index$884;
                    return scanHexLiteral$919(start$1096);
                }
                if (ch$1097 === 'b' || ch$1097 === 'B') {
                    ++index$884;
                    number$1095 = '';
                    while (index$884 < length$891) {
                        ch$1097 = source$882[index$884];
                        if (ch$1097 !== '0' && ch$1097 !== '1') {
                            break;
                        }
                        number$1095 += source$882[index$884++];
                    }
                    if (number$1095.length === 0) {
                        // only 0b or 0B
                        throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$884 < length$891) {
                        ch$1097 = source$882.charCodeAt(index$884);
                        if (isIdentifierStart$906(ch$1097) || isDecimalDigit$901(ch$1097)) {
                            throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$873.NumericLiteral,
                        value: parseInt(number$1095, 2),
                        lineNumber: lineNumber$885,
                        lineStart: lineStart$886,
                        range: [
                            start$1096,
                            index$884
                        ]
                    };
                }
                if (ch$1097 === 'o' || ch$1097 === 'O' || isOctalDigit$903(ch$1097)) {
                    return scanOctalLiteral$920(ch$1097, start$1096);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1097 && isDecimalDigit$901(ch$1097.charCodeAt(0))) {
                    throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$901(source$882.charCodeAt(index$884))) {
                number$1095 += source$882[index$884++];
            }
            ch$1097 = source$882[index$884];
        }
        if (ch$1097 === '.') {
            number$1095 += source$882[index$884++];
            while (isDecimalDigit$901(source$882.charCodeAt(index$884))) {
                number$1095 += source$882[index$884++];
            }
            ch$1097 = source$882[index$884];
        }
        if (ch$1097 === 'e' || ch$1097 === 'E') {
            number$1095 += source$882[index$884++];
            ch$1097 = source$882[index$884];
            if (ch$1097 === '+' || ch$1097 === '-') {
                number$1095 += source$882[index$884++];
            }
            if (isDecimalDigit$901(source$882.charCodeAt(index$884))) {
                while (isDecimalDigit$901(source$882.charCodeAt(index$884))) {
                    number$1095 += source$882[index$884++];
                }
            } else {
                throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$906(source$882.charCodeAt(index$884))) {
            throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$873.NumericLiteral,
            value: parseFloat(number$1095),
            lineNumber: lineNumber$885,
            lineStart: lineStart$886,
            range: [
                start$1096,
                index$884
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$922() {
        var str$1099 = '', quote$1100, start$1101, ch$1102, code$1103, unescaped$1104, restore$1105, octal$1106 = false;
        quote$1100 = source$882[index$884];
        assert$899(quote$1100 === '\'' || quote$1100 === '"', 'String literal must starts with a quote');
        start$1101 = index$884;
        ++index$884;
        while (index$884 < length$891) {
            ch$1102 = source$882[index$884++];
            if (ch$1102 === quote$1100) {
                quote$1100 = '';
                break;
            } else if (ch$1102 === '\\') {
                ch$1102 = source$882[index$884++];
                if (!ch$1102 || !isLineTerminator$905(ch$1102.charCodeAt(0))) {
                    switch (ch$1102) {
                    case 'n':
                        str$1099 += '\n';
                        break;
                    case 'r':
                        str$1099 += '\r';
                        break;
                    case 't':
                        str$1099 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$882[index$884] === '{') {
                            ++index$884;
                            str$1099 += scanUnicodeCodePointEscape$914();
                        } else {
                            restore$1105 = index$884;
                            unescaped$1104 = scanHexEscape$913(ch$1102);
                            if (unescaped$1104) {
                                str$1099 += unescaped$1104;
                            } else {
                                index$884 = restore$1105;
                                str$1099 += ch$1102;
                            }
                        }
                        break;
                    case 'b':
                        str$1099 += '\b';
                        break;
                    case 'f':
                        str$1099 += '\f';
                        break;
                    case 'v':
                        str$1099 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$903(ch$1102)) {
                            code$1103 = '01234567'.indexOf(ch$1102);
                            // \0 is not octal escape sequence
                            if (code$1103 !== 0) {
                                octal$1106 = true;
                            }
                            if (index$884 < length$891 && isOctalDigit$903(source$882[index$884])) {
                                octal$1106 = true;
                                code$1103 = code$1103 * 8 + '01234567'.indexOf(source$882[index$884++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1102) >= 0 && index$884 < length$891 && isOctalDigit$903(source$882[index$884])) {
                                    code$1103 = code$1103 * 8 + '01234567'.indexOf(source$882[index$884++]);
                                }
                            }
                            str$1099 += String.fromCharCode(code$1103);
                        } else {
                            str$1099 += ch$1102;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$885;
                    if (ch$1102 === '\r' && source$882[index$884] === '\n') {
                        ++index$884;
                    }
                }
            } else if (isLineTerminator$905(ch$1102.charCodeAt(0))) {
                break;
            } else {
                str$1099 += ch$1102;
            }
        }
        if (quote$1100 !== '') {
            throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$873.StringLiteral,
            value: str$1099,
            octal: octal$1106,
            lineNumber: lineNumber$885,
            lineStart: lineStart$886,
            range: [
                start$1101,
                index$884
            ]
        };
    }
    function scanTemplate$923() {
        var cooked$1107 = '', ch$1108, start$1109, terminated$1110, tail$1111, restore$1112, unescaped$1113, code$1114, octal$1115;
        terminated$1110 = false;
        tail$1111 = false;
        start$1109 = index$884;
        ++index$884;
        while (index$884 < length$891) {
            ch$1108 = source$882[index$884++];
            if (ch$1108 === '`') {
                tail$1111 = true;
                terminated$1110 = true;
                break;
            } else if (ch$1108 === '$') {
                if (source$882[index$884] === '{') {
                    ++index$884;
                    terminated$1110 = true;
                    break;
                }
                cooked$1107 += ch$1108;
            } else if (ch$1108 === '\\') {
                ch$1108 = source$882[index$884++];
                if (!isLineTerminator$905(ch$1108.charCodeAt(0))) {
                    switch (ch$1108) {
                    case 'n':
                        cooked$1107 += '\n';
                        break;
                    case 'r':
                        cooked$1107 += '\r';
                        break;
                    case 't':
                        cooked$1107 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$882[index$884] === '{') {
                            ++index$884;
                            cooked$1107 += scanUnicodeCodePointEscape$914();
                        } else {
                            restore$1112 = index$884;
                            unescaped$1113 = scanHexEscape$913(ch$1108);
                            if (unescaped$1113) {
                                cooked$1107 += unescaped$1113;
                            } else {
                                index$884 = restore$1112;
                                cooked$1107 += ch$1108;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1107 += '\b';
                        break;
                    case 'f':
                        cooked$1107 += '\f';
                        break;
                    case 'v':
                        cooked$1107 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$903(ch$1108)) {
                            code$1114 = '01234567'.indexOf(ch$1108);
                            // \0 is not octal escape sequence
                            if (code$1114 !== 0) {
                                octal$1115 = true;
                            }
                            if (index$884 < length$891 && isOctalDigit$903(source$882[index$884])) {
                                octal$1115 = true;
                                code$1114 = code$1114 * 8 + '01234567'.indexOf(source$882[index$884++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1108) >= 0 && index$884 < length$891 && isOctalDigit$903(source$882[index$884])) {
                                    code$1114 = code$1114 * 8 + '01234567'.indexOf(source$882[index$884++]);
                                }
                            }
                            cooked$1107 += String.fromCharCode(code$1114);
                        } else {
                            cooked$1107 += ch$1108;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$885;
                    if (ch$1108 === '\r' && source$882[index$884] === '\n') {
                        ++index$884;
                    }
                }
            } else if (isLineTerminator$905(ch$1108.charCodeAt(0))) {
                ++lineNumber$885;
                if (ch$1108 === '\r' && source$882[index$884] === '\n') {
                    ++index$884;
                }
                cooked$1107 += '\n';
            } else {
                cooked$1107 += ch$1108;
            }
        }
        if (!terminated$1110) {
            throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$873.Template,
            value: {
                cooked: cooked$1107,
                raw: source$882.slice(start$1109 + 1, index$884 - (tail$1111 ? 1 : 2))
            },
            tail: tail$1111,
            octal: octal$1115,
            lineNumber: lineNumber$885,
            lineStart: lineStart$886,
            range: [
                start$1109,
                index$884
            ]
        };
    }
    function scanTemplateElement$924(option$1116) {
        var startsWith$1117, template$1118;
        lookahead$895 = null;
        skipComment$912();
        startsWith$1117 = option$1116.head ? '`' : '}';
        if (source$882[index$884] !== startsWith$1117) {
            throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
        }
        template$1118 = scanTemplate$923();
        peek$930();
        return template$1118;
    }
    function scanRegExp$925() {
        var str$1119, ch$1120, start$1121, pattern$1122, flags$1123, value$1124, classMarker$1125 = false, restore$1126, terminated$1127 = false;
        lookahead$895 = null;
        skipComment$912();
        start$1121 = index$884;
        ch$1120 = source$882[index$884];
        assert$899(ch$1120 === '/', 'Regular expression literal must start with a slash');
        str$1119 = source$882[index$884++];
        while (index$884 < length$891) {
            ch$1120 = source$882[index$884++];
            str$1119 += ch$1120;
            if (classMarker$1125) {
                if (ch$1120 === ']') {
                    classMarker$1125 = false;
                }
            } else {
                if (ch$1120 === '\\') {
                    ch$1120 = source$882[index$884++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$905(ch$1120.charCodeAt(0))) {
                        throwError$933({}, Messages$878.UnterminatedRegExp);
                    }
                    str$1119 += ch$1120;
                } else if (ch$1120 === '/') {
                    terminated$1127 = true;
                    break;
                } else if (ch$1120 === '[') {
                    classMarker$1125 = true;
                } else if (isLineTerminator$905(ch$1120.charCodeAt(0))) {
                    throwError$933({}, Messages$878.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1127) {
            throwError$933({}, Messages$878.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1122 = str$1119.substr(1, str$1119.length - 2);
        flags$1123 = '';
        while (index$884 < length$891) {
            ch$1120 = source$882[index$884];
            if (!isIdentifierPart$907(ch$1120.charCodeAt(0))) {
                break;
            }
            ++index$884;
            if (ch$1120 === '\\' && index$884 < length$891) {
                ch$1120 = source$882[index$884];
                if (ch$1120 === 'u') {
                    ++index$884;
                    restore$1126 = index$884;
                    ch$1120 = scanHexEscape$913('u');
                    if (ch$1120) {
                        flags$1123 += ch$1120;
                        for (str$1119 += '\\u'; restore$1126 < index$884; ++restore$1126) {
                            str$1119 += source$882[restore$1126];
                        }
                    } else {
                        index$884 = restore$1126;
                        flags$1123 += 'u';
                        str$1119 += '\\u';
                    }
                } else {
                    str$1119 += '\\';
                }
            } else {
                flags$1123 += ch$1120;
                str$1119 += ch$1120;
            }
        }
        try {
            value$1124 = new RegExp(pattern$1122, flags$1123);
        } catch (e$1128) {
            throwError$933({}, Messages$878.InvalidRegExp);
        }
        // peek();
        if (extra$898.tokenize) {
            return {
                type: Token$873.RegularExpression,
                value: value$1124,
                lineNumber: lineNumber$885,
                lineStart: lineStart$886,
                range: [
                    start$1121,
                    index$884
                ]
            };
        }
        return {
            type: Token$873.RegularExpression,
            literal: str$1119,
            value: value$1124,
            range: [
                start$1121,
                index$884
            ]
        };
    }
    function isIdentifierName$926(token$1129) {
        return token$1129.type === Token$873.Identifier || token$1129.type === Token$873.Keyword || token$1129.type === Token$873.BooleanLiteral || token$1129.type === Token$873.NullLiteral;
    }
    function advanceSlash$927() {
        var prevToken$1130, checkToken$1131;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1130 = extra$898.tokens[extra$898.tokens.length - 1];
        if (!prevToken$1130) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$925();
        }
        if (prevToken$1130.type === 'Punctuator') {
            if (prevToken$1130.value === ')') {
                checkToken$1131 = extra$898.tokens[extra$898.openParenToken - 1];
                if (checkToken$1131 && checkToken$1131.type === 'Keyword' && (checkToken$1131.value === 'if' || checkToken$1131.value === 'while' || checkToken$1131.value === 'for' || checkToken$1131.value === 'with')) {
                    return scanRegExp$925();
                }
                return scanPunctuator$918();
            }
            if (prevToken$1130.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$898.tokens[extra$898.openCurlyToken - 3] && extra$898.tokens[extra$898.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1131 = extra$898.tokens[extra$898.openCurlyToken - 4];
                    if (!checkToken$1131) {
                        return scanPunctuator$918();
                    }
                } else if (extra$898.tokens[extra$898.openCurlyToken - 4] && extra$898.tokens[extra$898.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1131 = extra$898.tokens[extra$898.openCurlyToken - 5];
                    if (!checkToken$1131) {
                        return scanRegExp$925();
                    }
                } else {
                    return scanPunctuator$918();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$875.indexOf(checkToken$1131.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$918();
                }
                // It is a declaration.
                return scanRegExp$925();
            }
            return scanRegExp$925();
        }
        if (prevToken$1130.type === 'Keyword') {
            return scanRegExp$925();
        }
        return scanPunctuator$918();
    }
    function advance$928() {
        var ch$1132;
        skipComment$912();
        if (index$884 >= length$891) {
            return {
                type: Token$873.EOF,
                lineNumber: lineNumber$885,
                lineStart: lineStart$886,
                range: [
                    index$884,
                    index$884
                ]
            };
        }
        ch$1132 = source$882.charCodeAt(index$884);
        // Very common: ( and ) and ;
        if (ch$1132 === 40 || ch$1132 === 41 || ch$1132 === 58) {
            return scanPunctuator$918();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1132 === 39 || ch$1132 === 34) {
            return scanStringLiteral$922();
        }
        if (ch$1132 === 96) {
            return scanTemplate$923();
        }
        if (isIdentifierStart$906(ch$1132)) {
            return scanIdentifier$917();
        }
        // # and @ are allowed for sweet.js
        if (ch$1132 === 35 || ch$1132 === 64) {
            ++index$884;
            return {
                type: Token$873.Punctuator,
                value: String.fromCharCode(ch$1132),
                lineNumber: lineNumber$885,
                lineStart: lineStart$886,
                range: [
                    index$884 - 1,
                    index$884
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1132 === 46) {
            if (isDecimalDigit$901(source$882.charCodeAt(index$884 + 1))) {
                return scanNumericLiteral$921();
            }
            return scanPunctuator$918();
        }
        if (isDecimalDigit$901(ch$1132)) {
            return scanNumericLiteral$921();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$898.tokenize && ch$1132 === 47) {
            return advanceSlash$927();
        }
        return scanPunctuator$918();
    }
    function lex$929() {
        var token$1133;
        token$1133 = lookahead$895;
        streamIndex$894 = lookaheadIndex$896;
        lineNumber$885 = token$1133.lineNumber;
        lineStart$886 = token$1133.lineStart;
        sm_lineNumber$887 = lookahead$895.sm_lineNumber;
        sm_lineStart$888 = lookahead$895.sm_lineStart;
        sm_range$889 = lookahead$895.sm_range;
        sm_index$890 = lookahead$895.sm_range[0];
        lookahead$895 = tokenStream$893[++streamIndex$894].token;
        lookaheadIndex$896 = streamIndex$894;
        index$884 = lookahead$895.range[0];
        return token$1133;
    }
    function peek$930() {
        lookaheadIndex$896 = streamIndex$894 + 1;
        if (lookaheadIndex$896 >= length$891) {
            lookahead$895 = {
                type: Token$873.EOF,
                lineNumber: lineNumber$885,
                lineStart: lineStart$886,
                range: [
                    index$884,
                    index$884
                ]
            };
            return;
        }
        lookahead$895 = tokenStream$893[lookaheadIndex$896].token;
        index$884 = lookahead$895.range[0];
    }
    function lookahead2$931() {
        var adv$1134, pos$1135, line$1136, start$1137, result$1138;
        if (streamIndex$894 + 1 >= length$891 || streamIndex$894 + 2 >= length$891) {
            return {
                type: Token$873.EOF,
                lineNumber: lineNumber$885,
                lineStart: lineStart$886,
                range: [
                    index$884,
                    index$884
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$895 === null) {
            lookaheadIndex$896 = streamIndex$894 + 1;
            lookahead$895 = tokenStream$893[lookaheadIndex$896].token;
            index$884 = lookahead$895.range[0];
        }
        result$1138 = tokenStream$893[lookaheadIndex$896 + 1].token;
        return result$1138;
    }
    SyntaxTreeDelegate$880 = {
        name: 'SyntaxTree',
        postProcess: function (node$1139) {
            return node$1139;
        },
        createArrayExpression: function (elements$1140) {
            return {
                type: Syntax$876.ArrayExpression,
                elements: elements$1140
            };
        },
        createAssignmentExpression: function (operator$1141, left$1142, right$1143) {
            return {
                type: Syntax$876.AssignmentExpression,
                operator: operator$1141,
                left: left$1142,
                right: right$1143
            };
        },
        createBinaryExpression: function (operator$1144, left$1145, right$1146) {
            var type$1147 = operator$1144 === '||' || operator$1144 === '&&' ? Syntax$876.LogicalExpression : Syntax$876.BinaryExpression;
            return {
                type: type$1147,
                operator: operator$1144,
                left: left$1145,
                right: right$1146
            };
        },
        createBlockStatement: function (body$1148) {
            return {
                type: Syntax$876.BlockStatement,
                body: body$1148
            };
        },
        createBreakStatement: function (label$1149) {
            return {
                type: Syntax$876.BreakStatement,
                label: label$1149
            };
        },
        createCallExpression: function (callee$1150, args$1151) {
            return {
                type: Syntax$876.CallExpression,
                callee: callee$1150,
                'arguments': args$1151
            };
        },
        createCatchClause: function (param$1152, body$1153) {
            return {
                type: Syntax$876.CatchClause,
                param: param$1152,
                body: body$1153
            };
        },
        createConditionalExpression: function (test$1154, consequent$1155, alternate$1156) {
            return {
                type: Syntax$876.ConditionalExpression,
                test: test$1154,
                consequent: consequent$1155,
                alternate: alternate$1156
            };
        },
        createContinueStatement: function (label$1157) {
            return {
                type: Syntax$876.ContinueStatement,
                label: label$1157
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$876.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1158, test$1159) {
            return {
                type: Syntax$876.DoWhileStatement,
                body: body$1158,
                test: test$1159
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$876.EmptyStatement };
        },
        createExpressionStatement: function (expression$1160) {
            return {
                type: Syntax$876.ExpressionStatement,
                expression: expression$1160
            };
        },
        createForStatement: function (init$1161, test$1162, update$1163, body$1164) {
            return {
                type: Syntax$876.ForStatement,
                init: init$1161,
                test: test$1162,
                update: update$1163,
                body: body$1164
            };
        },
        createForInStatement: function (left$1165, right$1166, body$1167) {
            return {
                type: Syntax$876.ForInStatement,
                left: left$1165,
                right: right$1166,
                body: body$1167,
                each: false
            };
        },
        createForOfStatement: function (left$1168, right$1169, body$1170) {
            return {
                type: Syntax$876.ForOfStatement,
                left: left$1168,
                right: right$1169,
                body: body$1170
            };
        },
        createFunctionDeclaration: function (id$1171, params$1172, defaults$1173, body$1174, rest$1175, generator$1176, expression$1177) {
            return {
                type: Syntax$876.FunctionDeclaration,
                id: id$1171,
                params: params$1172,
                defaults: defaults$1173,
                body: body$1174,
                rest: rest$1175,
                generator: generator$1176,
                expression: expression$1177
            };
        },
        createFunctionExpression: function (id$1178, params$1179, defaults$1180, body$1181, rest$1182, generator$1183, expression$1184) {
            return {
                type: Syntax$876.FunctionExpression,
                id: id$1178,
                params: params$1179,
                defaults: defaults$1180,
                body: body$1181,
                rest: rest$1182,
                generator: generator$1183,
                expression: expression$1184
            };
        },
        createIdentifier: function (name$1185) {
            return {
                type: Syntax$876.Identifier,
                name: name$1185
            };
        },
        createIfStatement: function (test$1186, consequent$1187, alternate$1188) {
            return {
                type: Syntax$876.IfStatement,
                test: test$1186,
                consequent: consequent$1187,
                alternate: alternate$1188
            };
        },
        createLabeledStatement: function (label$1189, body$1190) {
            return {
                type: Syntax$876.LabeledStatement,
                label: label$1189,
                body: body$1190
            };
        },
        createLiteral: function (token$1191) {
            return {
                type: Syntax$876.Literal,
                value: token$1191.value,
                raw: String(token$1191.value)
            };
        },
        createMemberExpression: function (accessor$1192, object$1193, property$1194) {
            return {
                type: Syntax$876.MemberExpression,
                computed: accessor$1192 === '[',
                object: object$1193,
                property: property$1194
            };
        },
        createNewExpression: function (callee$1195, args$1196) {
            return {
                type: Syntax$876.NewExpression,
                callee: callee$1195,
                'arguments': args$1196
            };
        },
        createObjectExpression: function (properties$1197) {
            return {
                type: Syntax$876.ObjectExpression,
                properties: properties$1197
            };
        },
        createPostfixExpression: function (operator$1198, argument$1199) {
            return {
                type: Syntax$876.UpdateExpression,
                operator: operator$1198,
                argument: argument$1199,
                prefix: false
            };
        },
        createProgram: function (body$1200) {
            return {
                type: Syntax$876.Program,
                body: body$1200
            };
        },
        createProperty: function (kind$1201, key$1202, value$1203, method$1204, shorthand$1205) {
            return {
                type: Syntax$876.Property,
                key: key$1202,
                value: value$1203,
                kind: kind$1201,
                method: method$1204,
                shorthand: shorthand$1205
            };
        },
        createReturnStatement: function (argument$1206) {
            return {
                type: Syntax$876.ReturnStatement,
                argument: argument$1206
            };
        },
        createSequenceExpression: function (expressions$1207) {
            return {
                type: Syntax$876.SequenceExpression,
                expressions: expressions$1207
            };
        },
        createSwitchCase: function (test$1208, consequent$1209) {
            return {
                type: Syntax$876.SwitchCase,
                test: test$1208,
                consequent: consequent$1209
            };
        },
        createSwitchStatement: function (discriminant$1210, cases$1211) {
            return {
                type: Syntax$876.SwitchStatement,
                discriminant: discriminant$1210,
                cases: cases$1211
            };
        },
        createThisExpression: function () {
            return { type: Syntax$876.ThisExpression };
        },
        createThrowStatement: function (argument$1212) {
            return {
                type: Syntax$876.ThrowStatement,
                argument: argument$1212
            };
        },
        createTryStatement: function (block$1213, guardedHandlers$1214, handlers$1215, finalizer$1216) {
            return {
                type: Syntax$876.TryStatement,
                block: block$1213,
                guardedHandlers: guardedHandlers$1214,
                handlers: handlers$1215,
                finalizer: finalizer$1216
            };
        },
        createUnaryExpression: function (operator$1217, argument$1218) {
            if (operator$1217 === '++' || operator$1217 === '--') {
                return {
                    type: Syntax$876.UpdateExpression,
                    operator: operator$1217,
                    argument: argument$1218,
                    prefix: true
                };
            }
            return {
                type: Syntax$876.UnaryExpression,
                operator: operator$1217,
                argument: argument$1218
            };
        },
        createVariableDeclaration: function (declarations$1219, kind$1220) {
            return {
                type: Syntax$876.VariableDeclaration,
                declarations: declarations$1219,
                kind: kind$1220
            };
        },
        createVariableDeclarator: function (id$1221, init$1222) {
            return {
                type: Syntax$876.VariableDeclarator,
                id: id$1221,
                init: init$1222
            };
        },
        createWhileStatement: function (test$1223, body$1224) {
            return {
                type: Syntax$876.WhileStatement,
                test: test$1223,
                body: body$1224
            };
        },
        createWithStatement: function (object$1225, body$1226) {
            return {
                type: Syntax$876.WithStatement,
                object: object$1225,
                body: body$1226
            };
        },
        createTemplateElement: function (value$1227, tail$1228) {
            return {
                type: Syntax$876.TemplateElement,
                value: value$1227,
                tail: tail$1228
            };
        },
        createTemplateLiteral: function (quasis$1229, expressions$1230) {
            return {
                type: Syntax$876.TemplateLiteral,
                quasis: quasis$1229,
                expressions: expressions$1230
            };
        },
        createSpreadElement: function (argument$1231) {
            return {
                type: Syntax$876.SpreadElement,
                argument: argument$1231
            };
        },
        createTaggedTemplateExpression: function (tag$1232, quasi$1233) {
            return {
                type: Syntax$876.TaggedTemplateExpression,
                tag: tag$1232,
                quasi: quasi$1233
            };
        },
        createArrowFunctionExpression: function (params$1234, defaults$1235, body$1236, rest$1237, expression$1238) {
            return {
                type: Syntax$876.ArrowFunctionExpression,
                id: null,
                params: params$1234,
                defaults: defaults$1235,
                body: body$1236,
                rest: rest$1237,
                generator: false,
                expression: expression$1238
            };
        },
        createMethodDefinition: function (propertyType$1239, kind$1240, key$1241, value$1242) {
            return {
                type: Syntax$876.MethodDefinition,
                key: key$1241,
                value: value$1242,
                kind: kind$1240,
                'static': propertyType$1239 === ClassPropertyType$881.static
            };
        },
        createClassBody: function (body$1243) {
            return {
                type: Syntax$876.ClassBody,
                body: body$1243
            };
        },
        createClassExpression: function (id$1244, superClass$1245, body$1246) {
            return {
                type: Syntax$876.ClassExpression,
                id: id$1244,
                superClass: superClass$1245,
                body: body$1246
            };
        },
        createClassDeclaration: function (id$1247, superClass$1248, body$1249) {
            return {
                type: Syntax$876.ClassDeclaration,
                id: id$1247,
                superClass: superClass$1248,
                body: body$1249
            };
        },
        createExportSpecifier: function (id$1250, name$1251) {
            return {
                type: Syntax$876.ExportSpecifier,
                id: id$1250,
                name: name$1251
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$876.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1252, specifiers$1253, source$1254) {
            return {
                type: Syntax$876.ExportDeclaration,
                declaration: declaration$1252,
                specifiers: specifiers$1253,
                source: source$1254
            };
        },
        createImportSpecifier: function (id$1255, name$1256) {
            return {
                type: Syntax$876.ImportSpecifier,
                id: id$1255,
                name: name$1256
            };
        },
        createImportDeclaration: function (specifiers$1257, kind$1258, source$1259) {
            return {
                type: Syntax$876.ImportDeclaration,
                specifiers: specifiers$1257,
                kind: kind$1258,
                source: source$1259
            };
        },
        createYieldExpression: function (argument$1260, delegate$1261) {
            return {
                type: Syntax$876.YieldExpression,
                argument: argument$1260,
                delegate: delegate$1261
            };
        },
        createModuleDeclaration: function (id$1262, source$1263, body$1264) {
            return {
                type: Syntax$876.ModuleDeclaration,
                id: id$1262,
                source: source$1263,
                body: body$1264
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$932() {
        return lookahead$895.lineNumber !== lineNumber$885;
    }
    // Throw an exception
    function throwError$933(token$1265, messageFormat$1266) {
        var error$1267, args$1268 = Array.prototype.slice.call(arguments, 2), msg$1269 = messageFormat$1266.replace(/%(\d)/g, function (whole$1273, index$1274) {
                assert$899(index$1274 < args$1268.length, 'Message reference must be in range');
                return args$1268[index$1274];
            });
        var startIndex$1270 = streamIndex$894 > 3 ? streamIndex$894 - 3 : 0;
        var toks$1271 = '', tailingMsg$1272 = '';
        if (tokenStream$893) {
            toks$1271 = tokenStream$893.slice(startIndex$1270, streamIndex$894 + 3).map(function (stx$1275) {
                return stx$1275.token.value;
            }).join(' ');
            tailingMsg$1272 = '\n[... ' + toks$1271 + ' ...]';
        }
        if (typeof token$1265.lineNumber === 'number') {
            error$1267 = new Error('Line ' + token$1265.lineNumber + ': ' + msg$1269 + tailingMsg$1272);
            error$1267.index = token$1265.range[0];
            error$1267.lineNumber = token$1265.lineNumber;
            error$1267.column = token$1265.range[0] - lineStart$886 + 1;
        } else {
            error$1267 = new Error('Line ' + lineNumber$885 + ': ' + msg$1269 + tailingMsg$1272);
            error$1267.index = index$884;
            error$1267.lineNumber = lineNumber$885;
            error$1267.column = index$884 - lineStart$886 + 1;
        }
        error$1267.description = msg$1269;
        throw error$1267;
    }
    function throwErrorTolerant$934() {
        try {
            throwError$933.apply(null, arguments);
        } catch (e$1276) {
            if (extra$898.errors) {
                extra$898.errors.push(e$1276);
            } else {
                throw e$1276;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$935(token$1277) {
        if (token$1277.type === Token$873.EOF) {
            throwError$933(token$1277, Messages$878.UnexpectedEOS);
        }
        if (token$1277.type === Token$873.NumericLiteral) {
            throwError$933(token$1277, Messages$878.UnexpectedNumber);
        }
        if (token$1277.type === Token$873.StringLiteral) {
            throwError$933(token$1277, Messages$878.UnexpectedString);
        }
        if (token$1277.type === Token$873.Identifier) {
            throwError$933(token$1277, Messages$878.UnexpectedIdentifier);
        }
        if (token$1277.type === Token$873.Keyword) {
            if (isFutureReservedWord$908(token$1277.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$883 && isStrictModeReservedWord$909(token$1277.value)) {
                throwErrorTolerant$934(token$1277, Messages$878.StrictReservedWord);
                return;
            }
            throwError$933(token$1277, Messages$878.UnexpectedToken, token$1277.value);
        }
        if (token$1277.type === Token$873.Template) {
            throwError$933(token$1277, Messages$878.UnexpectedTemplate, token$1277.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$933(token$1277, Messages$878.UnexpectedToken, token$1277.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$936(value$1278) {
        var token$1279 = lex$929();
        if (token$1279.type !== Token$873.Punctuator || token$1279.value !== value$1278) {
            throwUnexpected$935(token$1279);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$937(keyword$1280) {
        var token$1281 = lex$929();
        if (token$1281.type !== Token$873.Keyword || token$1281.value !== keyword$1280) {
            throwUnexpected$935(token$1281);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$938(value$1282) {
        return lookahead$895.type === Token$873.Punctuator && lookahead$895.value === value$1282;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$939(keyword$1283) {
        return lookahead$895.type === Token$873.Keyword && lookahead$895.value === keyword$1283;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$940(keyword$1284) {
        return lookahead$895.type === Token$873.Identifier && lookahead$895.value === keyword$1284;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$941() {
        var op$1285;
        if (lookahead$895.type !== Token$873.Punctuator) {
            return false;
        }
        op$1285 = lookahead$895.value;
        return op$1285 === '=' || op$1285 === '*=' || op$1285 === '/=' || op$1285 === '%=' || op$1285 === '+=' || op$1285 === '-=' || op$1285 === '<<=' || op$1285 === '>>=' || op$1285 === '>>>=' || op$1285 === '&=' || op$1285 === '^=' || op$1285 === '|=';
    }
    function consumeSemicolon$942() {
        var line$1286, ch$1287;
        ch$1287 = lookahead$895.value ? String(lookahead$895.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1287 === 59) {
            lex$929();
            return;
        }
        if (lookahead$895.lineNumber !== lineNumber$885) {
            return;
        }
        if (match$938(';')) {
            lex$929();
            return;
        }
        if (lookahead$895.type !== Token$873.EOF && !match$938('}')) {
            throwUnexpected$935(lookahead$895);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$943(expr$1288) {
        return expr$1288.type === Syntax$876.Identifier || expr$1288.type === Syntax$876.MemberExpression;
    }
    function isAssignableLeftHandSide$944(expr$1289) {
        return isLeftHandSide$943(expr$1289) || expr$1289.type === Syntax$876.ObjectPattern || expr$1289.type === Syntax$876.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$945() {
        var elements$1290 = [], blocks$1291 = [], filter$1292 = null, tmp$1293, possiblecomprehension$1294 = true, body$1295;
        expect$936('[');
        while (!match$938(']')) {
            if (lookahead$895.value === 'for' && lookahead$895.type === Token$873.Keyword) {
                if (!possiblecomprehension$1294) {
                    throwError$933({}, Messages$878.ComprehensionError);
                }
                matchKeyword$939('for');
                tmp$1293 = parseForStatement$993({ ignoreBody: true });
                tmp$1293.of = tmp$1293.type === Syntax$876.ForOfStatement;
                tmp$1293.type = Syntax$876.ComprehensionBlock;
                if (tmp$1293.left.kind) {
                    // can't be let or const
                    throwError$933({}, Messages$878.ComprehensionError);
                }
                blocks$1291.push(tmp$1293);
            } else if (lookahead$895.value === 'if' && lookahead$895.type === Token$873.Keyword) {
                if (!possiblecomprehension$1294) {
                    throwError$933({}, Messages$878.ComprehensionError);
                }
                expectKeyword$937('if');
                expect$936('(');
                filter$1292 = parseExpression$973();
                expect$936(')');
            } else if (lookahead$895.value === ',' && lookahead$895.type === Token$873.Punctuator) {
                possiblecomprehension$1294 = false;
                // no longer allowed.
                lex$929();
                elements$1290.push(null);
            } else {
                tmp$1293 = parseSpreadOrAssignmentExpression$956();
                elements$1290.push(tmp$1293);
                if (tmp$1293 && tmp$1293.type === Syntax$876.SpreadElement) {
                    if (!match$938(']')) {
                        throwError$933({}, Messages$878.ElementAfterSpreadElement);
                    }
                } else if (!(match$938(']') || matchKeyword$939('for') || matchKeyword$939('if'))) {
                    expect$936(',');
                    // this lexes.
                    possiblecomprehension$1294 = false;
                }
            }
        }
        expect$936(']');
        if (filter$1292 && !blocks$1291.length) {
            throwError$933({}, Messages$878.ComprehensionRequiresBlock);
        }
        if (blocks$1291.length) {
            if (elements$1290.length !== 1) {
                throwError$933({}, Messages$878.ComprehensionError);
            }
            return {
                type: Syntax$876.ComprehensionExpression,
                filter: filter$1292,
                blocks: blocks$1291,
                body: elements$1290[0]
            };
        }
        return delegate$892.createArrayExpression(elements$1290);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$946(options$1296) {
        var previousStrict$1297, previousYieldAllowed$1298, params$1299, defaults$1300, body$1301;
        previousStrict$1297 = strict$883;
        previousYieldAllowed$1298 = state$897.yieldAllowed;
        state$897.yieldAllowed = options$1296.generator;
        params$1299 = options$1296.params || [];
        defaults$1300 = options$1296.defaults || [];
        body$1301 = parseConciseBody$1005();
        if (options$1296.name && strict$883 && isRestrictedWord$910(params$1299[0].name)) {
            throwErrorTolerant$934(options$1296.name, Messages$878.StrictParamName);
        }
        if (state$897.yieldAllowed && !state$897.yieldFound) {
            throwErrorTolerant$934({}, Messages$878.NoYieldInGenerator);
        }
        strict$883 = previousStrict$1297;
        state$897.yieldAllowed = previousYieldAllowed$1298;
        return delegate$892.createFunctionExpression(null, params$1299, defaults$1300, body$1301, options$1296.rest || null, options$1296.generator, body$1301.type !== Syntax$876.BlockStatement);
    }
    function parsePropertyMethodFunction$947(options$1302) {
        var previousStrict$1303, tmp$1304, method$1305;
        previousStrict$1303 = strict$883;
        strict$883 = true;
        tmp$1304 = parseParams$1009();
        if (tmp$1304.stricted) {
            throwErrorTolerant$934(tmp$1304.stricted, tmp$1304.message);
        }
        method$1305 = parsePropertyFunction$946({
            params: tmp$1304.params,
            defaults: tmp$1304.defaults,
            rest: tmp$1304.rest,
            generator: options$1302.generator
        });
        strict$883 = previousStrict$1303;
        return method$1305;
    }
    function parseObjectPropertyKey$948() {
        var token$1306 = lex$929();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1306.type === Token$873.StringLiteral || token$1306.type === Token$873.NumericLiteral) {
            if (strict$883 && token$1306.octal) {
                throwErrorTolerant$934(token$1306, Messages$878.StrictOctalLiteral);
            }
            return delegate$892.createLiteral(token$1306);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$892.createIdentifier(token$1306.value);
    }
    function parseObjectProperty$949() {
        var token$1307, key$1308, id$1309, value$1310, param$1311;
        token$1307 = lookahead$895;
        if (token$1307.type === Token$873.Identifier) {
            id$1309 = parseObjectPropertyKey$948();
            // Property Assignment: Getter and Setter.
            if (token$1307.value === 'get' && !(match$938(':') || match$938('('))) {
                key$1308 = parseObjectPropertyKey$948();
                expect$936('(');
                expect$936(')');
                return delegate$892.createProperty('get', key$1308, parsePropertyFunction$946({ generator: false }), false, false);
            }
            if (token$1307.value === 'set' && !(match$938(':') || match$938('('))) {
                key$1308 = parseObjectPropertyKey$948();
                expect$936('(');
                token$1307 = lookahead$895;
                param$1311 = [parseVariableIdentifier$976()];
                expect$936(')');
                return delegate$892.createProperty('set', key$1308, parsePropertyFunction$946({
                    params: param$1311,
                    generator: false,
                    name: token$1307
                }), false, false);
            }
            if (match$938(':')) {
                lex$929();
                return delegate$892.createProperty('init', id$1309, parseAssignmentExpression$972(), false, false);
            }
            if (match$938('(')) {
                return delegate$892.createProperty('init', id$1309, parsePropertyMethodFunction$947({ generator: false }), true, false);
            }
            return delegate$892.createProperty('init', id$1309, id$1309, false, true);
        }
        if (token$1307.type === Token$873.EOF || token$1307.type === Token$873.Punctuator) {
            if (!match$938('*')) {
                throwUnexpected$935(token$1307);
            }
            lex$929();
            id$1309 = parseObjectPropertyKey$948();
            if (!match$938('(')) {
                throwUnexpected$935(lex$929());
            }
            return delegate$892.createProperty('init', id$1309, parsePropertyMethodFunction$947({ generator: true }), true, false);
        }
        key$1308 = parseObjectPropertyKey$948();
        if (match$938(':')) {
            lex$929();
            return delegate$892.createProperty('init', key$1308, parseAssignmentExpression$972(), false, false);
        }
        if (match$938('(')) {
            return delegate$892.createProperty('init', key$1308, parsePropertyMethodFunction$947({ generator: false }), true, false);
        }
        throwUnexpected$935(lex$929());
    }
    function parseObjectInitialiser$950() {
        var properties$1312 = [], property$1313, name$1314, key$1315, kind$1316, map$1317 = {}, toString$1318 = String;
        expect$936('{');
        while (!match$938('}')) {
            property$1313 = parseObjectProperty$949();
            if (property$1313.key.type === Syntax$876.Identifier) {
                name$1314 = property$1313.key.name;
            } else {
                name$1314 = toString$1318(property$1313.key.value);
            }
            kind$1316 = property$1313.kind === 'init' ? PropertyKind$877.Data : property$1313.kind === 'get' ? PropertyKind$877.Get : PropertyKind$877.Set;
            key$1315 = '$' + name$1314;
            if (Object.prototype.hasOwnProperty.call(map$1317, key$1315)) {
                if (map$1317[key$1315] === PropertyKind$877.Data) {
                    if (strict$883 && kind$1316 === PropertyKind$877.Data) {
                        throwErrorTolerant$934({}, Messages$878.StrictDuplicateProperty);
                    } else if (kind$1316 !== PropertyKind$877.Data) {
                        throwErrorTolerant$934({}, Messages$878.AccessorDataProperty);
                    }
                } else {
                    if (kind$1316 === PropertyKind$877.Data) {
                        throwErrorTolerant$934({}, Messages$878.AccessorDataProperty);
                    } else if (map$1317[key$1315] & kind$1316) {
                        throwErrorTolerant$934({}, Messages$878.AccessorGetSet);
                    }
                }
                map$1317[key$1315] |= kind$1316;
            } else {
                map$1317[key$1315] = kind$1316;
            }
            properties$1312.push(property$1313);
            if (!match$938('}')) {
                expect$936(',');
            }
        }
        expect$936('}');
        return delegate$892.createObjectExpression(properties$1312);
    }
    function parseTemplateElement$951(option$1319) {
        var token$1320 = lex$929();
        if (strict$883 && token$1320.octal) {
            throwError$933(token$1320, Messages$878.StrictOctalLiteral);
        }
        return delegate$892.createTemplateElement({
            raw: token$1320.value.raw,
            cooked: token$1320.value.cooked
        }, token$1320.tail);
    }
    function parseTemplateLiteral$952() {
        var quasi$1321, quasis$1322, expressions$1323;
        quasi$1321 = parseTemplateElement$951({ head: true });
        quasis$1322 = [quasi$1321];
        expressions$1323 = [];
        while (!quasi$1321.tail) {
            expressions$1323.push(parseExpression$973());
            quasi$1321 = parseTemplateElement$951({ head: false });
            quasis$1322.push(quasi$1321);
        }
        return delegate$892.createTemplateLiteral(quasis$1322, expressions$1323);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$953() {
        var expr$1324;
        expect$936('(');
        ++state$897.parenthesizedCount;
        expr$1324 = parseExpression$973();
        expect$936(')');
        return expr$1324;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$954() {
        var type$1325, token$1326, resolvedIdent$1327;
        token$1326 = lookahead$895;
        type$1325 = lookahead$895.type;
        if (type$1325 === Token$873.Identifier) {
            resolvedIdent$1327 = expander$872.resolve(tokenStream$893[lookaheadIndex$896]);
            lex$929();
            return delegate$892.createIdentifier(resolvedIdent$1327);
        }
        if (type$1325 === Token$873.StringLiteral || type$1325 === Token$873.NumericLiteral) {
            if (strict$883 && lookahead$895.octal) {
                throwErrorTolerant$934(lookahead$895, Messages$878.StrictOctalLiteral);
            }
            return delegate$892.createLiteral(lex$929());
        }
        if (type$1325 === Token$873.Keyword) {
            if (matchKeyword$939('this')) {
                lex$929();
                return delegate$892.createThisExpression();
            }
            if (matchKeyword$939('function')) {
                return parseFunctionExpression$1011();
            }
            if (matchKeyword$939('class')) {
                return parseClassExpression$1016();
            }
            if (matchKeyword$939('super')) {
                lex$929();
                return delegate$892.createIdentifier('super');
            }
        }
        if (type$1325 === Token$873.BooleanLiteral) {
            token$1326 = lex$929();
            token$1326.value = token$1326.value === 'true';
            return delegate$892.createLiteral(token$1326);
        }
        if (type$1325 === Token$873.NullLiteral) {
            token$1326 = lex$929();
            token$1326.value = null;
            return delegate$892.createLiteral(token$1326);
        }
        if (match$938('[')) {
            return parseArrayInitialiser$945();
        }
        if (match$938('{')) {
            return parseObjectInitialiser$950();
        }
        if (match$938('(')) {
            return parseGroupExpression$953();
        }
        if (lookahead$895.type === Token$873.RegularExpression) {
            return delegate$892.createLiteral(lex$929());
        }
        if (type$1325 === Token$873.Template) {
            return parseTemplateLiteral$952();
        }
        return throwUnexpected$935(lex$929());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$955() {
        var args$1328 = [], arg$1329;
        expect$936('(');
        if (!match$938(')')) {
            while (streamIndex$894 < length$891) {
                arg$1329 = parseSpreadOrAssignmentExpression$956();
                args$1328.push(arg$1329);
                if (match$938(')')) {
                    break;
                } else if (arg$1329.type === Syntax$876.SpreadElement) {
                    throwError$933({}, Messages$878.ElementAfterSpreadElement);
                }
                expect$936(',');
            }
        }
        expect$936(')');
        return args$1328;
    }
    function parseSpreadOrAssignmentExpression$956() {
        if (match$938('...')) {
            lex$929();
            return delegate$892.createSpreadElement(parseAssignmentExpression$972());
        }
        return parseAssignmentExpression$972();
    }
    function parseNonComputedProperty$957() {
        var token$1330 = lex$929();
        if (!isIdentifierName$926(token$1330)) {
            throwUnexpected$935(token$1330);
        }
        return delegate$892.createIdentifier(token$1330.value);
    }
    function parseNonComputedMember$958() {
        expect$936('.');
        return parseNonComputedProperty$957();
    }
    function parseComputedMember$959() {
        var expr$1331;
        expect$936('[');
        expr$1331 = parseExpression$973();
        expect$936(']');
        return expr$1331;
    }
    function parseNewExpression$960() {
        var callee$1332, args$1333;
        expectKeyword$937('new');
        callee$1332 = parseLeftHandSideExpression$962();
        args$1333 = match$938('(') ? parseArguments$955() : [];
        return delegate$892.createNewExpression(callee$1332, args$1333);
    }
    function parseLeftHandSideExpressionAllowCall$961() {
        var expr$1334, args$1335, property$1336;
        expr$1334 = matchKeyword$939('new') ? parseNewExpression$960() : parsePrimaryExpression$954();
        while (match$938('.') || match$938('[') || match$938('(') || lookahead$895.type === Token$873.Template) {
            if (match$938('(')) {
                args$1335 = parseArguments$955();
                expr$1334 = delegate$892.createCallExpression(expr$1334, args$1335);
            } else if (match$938('[')) {
                expr$1334 = delegate$892.createMemberExpression('[', expr$1334, parseComputedMember$959());
            } else if (match$938('.')) {
                expr$1334 = delegate$892.createMemberExpression('.', expr$1334, parseNonComputedMember$958());
            } else {
                expr$1334 = delegate$892.createTaggedTemplateExpression(expr$1334, parseTemplateLiteral$952());
            }
        }
        return expr$1334;
    }
    function parseLeftHandSideExpression$962() {
        var expr$1337, property$1338;
        expr$1337 = matchKeyword$939('new') ? parseNewExpression$960() : parsePrimaryExpression$954();
        while (match$938('.') || match$938('[') || lookahead$895.type === Token$873.Template) {
            if (match$938('[')) {
                expr$1337 = delegate$892.createMemberExpression('[', expr$1337, parseComputedMember$959());
            } else if (match$938('.')) {
                expr$1337 = delegate$892.createMemberExpression('.', expr$1337, parseNonComputedMember$958());
            } else {
                expr$1337 = delegate$892.createTaggedTemplateExpression(expr$1337, parseTemplateLiteral$952());
            }
        }
        return expr$1337;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$963() {
        var expr$1339 = parseLeftHandSideExpressionAllowCall$961(), token$1340 = lookahead$895;
        if (lookahead$895.type !== Token$873.Punctuator) {
            return expr$1339;
        }
        if ((match$938('++') || match$938('--')) && !peekLineTerminator$932()) {
            // 11.3.1, 11.3.2
            if (strict$883 && expr$1339.type === Syntax$876.Identifier && isRestrictedWord$910(expr$1339.name)) {
                throwErrorTolerant$934({}, Messages$878.StrictLHSPostfix);
            }
            if (!isLeftHandSide$943(expr$1339)) {
                throwError$933({}, Messages$878.InvalidLHSInAssignment);
            }
            token$1340 = lex$929();
            expr$1339 = delegate$892.createPostfixExpression(token$1340.value, expr$1339);
        }
        return expr$1339;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$964() {
        var token$1341, expr$1342;
        if (lookahead$895.type !== Token$873.Punctuator && lookahead$895.type !== Token$873.Keyword) {
            return parsePostfixExpression$963();
        }
        if (match$938('++') || match$938('--')) {
            token$1341 = lex$929();
            expr$1342 = parseUnaryExpression$964();
            // 11.4.4, 11.4.5
            if (strict$883 && expr$1342.type === Syntax$876.Identifier && isRestrictedWord$910(expr$1342.name)) {
                throwErrorTolerant$934({}, Messages$878.StrictLHSPrefix);
            }
            if (!isLeftHandSide$943(expr$1342)) {
                throwError$933({}, Messages$878.InvalidLHSInAssignment);
            }
            return delegate$892.createUnaryExpression(token$1341.value, expr$1342);
        }
        if (match$938('+') || match$938('-') || match$938('~') || match$938('!')) {
            token$1341 = lex$929();
            expr$1342 = parseUnaryExpression$964();
            return delegate$892.createUnaryExpression(token$1341.value, expr$1342);
        }
        if (matchKeyword$939('delete') || matchKeyword$939('void') || matchKeyword$939('typeof')) {
            token$1341 = lex$929();
            expr$1342 = parseUnaryExpression$964();
            expr$1342 = delegate$892.createUnaryExpression(token$1341.value, expr$1342);
            if (strict$883 && expr$1342.operator === 'delete' && expr$1342.argument.type === Syntax$876.Identifier) {
                throwErrorTolerant$934({}, Messages$878.StrictDelete);
            }
            return expr$1342;
        }
        return parsePostfixExpression$963();
    }
    function binaryPrecedence$965(token$1343, allowIn$1344) {
        var prec$1345 = 0;
        if (token$1343.type !== Token$873.Punctuator && token$1343.type !== Token$873.Keyword) {
            return 0;
        }
        switch (token$1343.value) {
        case '||':
            prec$1345 = 1;
            break;
        case '&&':
            prec$1345 = 2;
            break;
        case '|':
            prec$1345 = 3;
            break;
        case '^':
            prec$1345 = 4;
            break;
        case '&':
            prec$1345 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1345 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1345 = 7;
            break;
        case 'in':
            prec$1345 = allowIn$1344 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1345 = 8;
            break;
        case '+':
        case '-':
            prec$1345 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1345 = 11;
            break;
        default:
            break;
        }
        return prec$1345;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$966() {
        var expr$1346, token$1347, prec$1348, previousAllowIn$1349, stack$1350, right$1351, operator$1352, left$1353, i$1354;
        previousAllowIn$1349 = state$897.allowIn;
        state$897.allowIn = true;
        expr$1346 = parseUnaryExpression$964();
        token$1347 = lookahead$895;
        prec$1348 = binaryPrecedence$965(token$1347, previousAllowIn$1349);
        if (prec$1348 === 0) {
            return expr$1346;
        }
        token$1347.prec = prec$1348;
        lex$929();
        stack$1350 = [
            expr$1346,
            token$1347,
            parseUnaryExpression$964()
        ];
        while ((prec$1348 = binaryPrecedence$965(lookahead$895, previousAllowIn$1349)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1350.length > 2 && prec$1348 <= stack$1350[stack$1350.length - 2].prec) {
                right$1351 = stack$1350.pop();
                operator$1352 = stack$1350.pop().value;
                left$1353 = stack$1350.pop();
                stack$1350.push(delegate$892.createBinaryExpression(operator$1352, left$1353, right$1351));
            }
            // Shift.
            token$1347 = lex$929();
            token$1347.prec = prec$1348;
            stack$1350.push(token$1347);
            stack$1350.push(parseUnaryExpression$964());
        }
        state$897.allowIn = previousAllowIn$1349;
        // Final reduce to clean-up the stack.
        i$1354 = stack$1350.length - 1;
        expr$1346 = stack$1350[i$1354];
        while (i$1354 > 1) {
            expr$1346 = delegate$892.createBinaryExpression(stack$1350[i$1354 - 1].value, stack$1350[i$1354 - 2], expr$1346);
            i$1354 -= 2;
        }
        return expr$1346;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$967() {
        var expr$1355, previousAllowIn$1356, consequent$1357, alternate$1358;
        expr$1355 = parseBinaryExpression$966();
        if (match$938('?')) {
            lex$929();
            previousAllowIn$1356 = state$897.allowIn;
            state$897.allowIn = true;
            consequent$1357 = parseAssignmentExpression$972();
            state$897.allowIn = previousAllowIn$1356;
            expect$936(':');
            alternate$1358 = parseAssignmentExpression$972();
            expr$1355 = delegate$892.createConditionalExpression(expr$1355, consequent$1357, alternate$1358);
        }
        return expr$1355;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$968(expr$1359) {
        var i$1360, len$1361, property$1362, element$1363;
        if (expr$1359.type === Syntax$876.ObjectExpression) {
            expr$1359.type = Syntax$876.ObjectPattern;
            for (i$1360 = 0, len$1361 = expr$1359.properties.length; i$1360 < len$1361; i$1360 += 1) {
                property$1362 = expr$1359.properties[i$1360];
                if (property$1362.kind !== 'init') {
                    throwError$933({}, Messages$878.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$968(property$1362.value);
            }
        } else if (expr$1359.type === Syntax$876.ArrayExpression) {
            expr$1359.type = Syntax$876.ArrayPattern;
            for (i$1360 = 0, len$1361 = expr$1359.elements.length; i$1360 < len$1361; i$1360 += 1) {
                element$1363 = expr$1359.elements[i$1360];
                if (element$1363) {
                    reinterpretAsAssignmentBindingPattern$968(element$1363);
                }
            }
        } else if (expr$1359.type === Syntax$876.Identifier) {
            if (isRestrictedWord$910(expr$1359.name)) {
                throwError$933({}, Messages$878.InvalidLHSInAssignment);
            }
        } else if (expr$1359.type === Syntax$876.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$968(expr$1359.argument);
            if (expr$1359.argument.type === Syntax$876.ObjectPattern) {
                throwError$933({}, Messages$878.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1359.type !== Syntax$876.MemberExpression && expr$1359.type !== Syntax$876.CallExpression && expr$1359.type !== Syntax$876.NewExpression) {
                throwError$933({}, Messages$878.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$969(options$1364, expr$1365) {
        var i$1366, len$1367, property$1368, element$1369;
        if (expr$1365.type === Syntax$876.ObjectExpression) {
            expr$1365.type = Syntax$876.ObjectPattern;
            for (i$1366 = 0, len$1367 = expr$1365.properties.length; i$1366 < len$1367; i$1366 += 1) {
                property$1368 = expr$1365.properties[i$1366];
                if (property$1368.kind !== 'init') {
                    throwError$933({}, Messages$878.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$969(options$1364, property$1368.value);
            }
        } else if (expr$1365.type === Syntax$876.ArrayExpression) {
            expr$1365.type = Syntax$876.ArrayPattern;
            for (i$1366 = 0, len$1367 = expr$1365.elements.length; i$1366 < len$1367; i$1366 += 1) {
                element$1369 = expr$1365.elements[i$1366];
                if (element$1369) {
                    reinterpretAsDestructuredParameter$969(options$1364, element$1369);
                }
            }
        } else if (expr$1365.type === Syntax$876.Identifier) {
            validateParam$1007(options$1364, expr$1365, expr$1365.name);
        } else {
            if (expr$1365.type !== Syntax$876.MemberExpression) {
                throwError$933({}, Messages$878.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$970(expressions$1370) {
        var i$1371, len$1372, param$1373, params$1374, defaults$1375, defaultCount$1376, options$1377, rest$1378;
        params$1374 = [];
        defaults$1375 = [];
        defaultCount$1376 = 0;
        rest$1378 = null;
        options$1377 = { paramSet: {} };
        for (i$1371 = 0, len$1372 = expressions$1370.length; i$1371 < len$1372; i$1371 += 1) {
            param$1373 = expressions$1370[i$1371];
            if (param$1373.type === Syntax$876.Identifier) {
                params$1374.push(param$1373);
                defaults$1375.push(null);
                validateParam$1007(options$1377, param$1373, param$1373.name);
            } else if (param$1373.type === Syntax$876.ObjectExpression || param$1373.type === Syntax$876.ArrayExpression) {
                reinterpretAsDestructuredParameter$969(options$1377, param$1373);
                params$1374.push(param$1373);
                defaults$1375.push(null);
            } else if (param$1373.type === Syntax$876.SpreadElement) {
                assert$899(i$1371 === len$1372 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$969(options$1377, param$1373.argument);
                rest$1378 = param$1373.argument;
            } else if (param$1373.type === Syntax$876.AssignmentExpression) {
                params$1374.push(param$1373.left);
                defaults$1375.push(param$1373.right);
                ++defaultCount$1376;
                validateParam$1007(options$1377, param$1373.left, param$1373.left.name);
            } else {
                return null;
            }
        }
        if (options$1377.message === Messages$878.StrictParamDupe) {
            throwError$933(strict$883 ? options$1377.stricted : options$1377.firstRestricted, options$1377.message);
        }
        if (defaultCount$1376 === 0) {
            defaults$1375 = [];
        }
        return {
            params: params$1374,
            defaults: defaults$1375,
            rest: rest$1378,
            stricted: options$1377.stricted,
            firstRestricted: options$1377.firstRestricted,
            message: options$1377.message
        };
    }
    function parseArrowFunctionExpression$971(options$1379) {
        var previousStrict$1380, previousYieldAllowed$1381, body$1382;
        expect$936('=>');
        previousStrict$1380 = strict$883;
        previousYieldAllowed$1381 = state$897.yieldAllowed;
        state$897.yieldAllowed = false;
        body$1382 = parseConciseBody$1005();
        if (strict$883 && options$1379.firstRestricted) {
            throwError$933(options$1379.firstRestricted, options$1379.message);
        }
        if (strict$883 && options$1379.stricted) {
            throwErrorTolerant$934(options$1379.stricted, options$1379.message);
        }
        strict$883 = previousStrict$1380;
        state$897.yieldAllowed = previousYieldAllowed$1381;
        return delegate$892.createArrowFunctionExpression(options$1379.params, options$1379.defaults, body$1382, options$1379.rest, body$1382.type !== Syntax$876.BlockStatement);
    }
    function parseAssignmentExpression$972() {
        var expr$1383, token$1384, params$1385, oldParenthesizedCount$1386;
        if (matchKeyword$939('yield')) {
            return parseYieldExpression$1012();
        }
        oldParenthesizedCount$1386 = state$897.parenthesizedCount;
        if (match$938('(')) {
            token$1384 = lookahead2$931();
            if (token$1384.type === Token$873.Punctuator && token$1384.value === ')' || token$1384.value === '...') {
                params$1385 = parseParams$1009();
                if (!match$938('=>')) {
                    throwUnexpected$935(lex$929());
                }
                return parseArrowFunctionExpression$971(params$1385);
            }
        }
        token$1384 = lookahead$895;
        expr$1383 = parseConditionalExpression$967();
        if (match$938('=>') && (state$897.parenthesizedCount === oldParenthesizedCount$1386 || state$897.parenthesizedCount === oldParenthesizedCount$1386 + 1)) {
            if (expr$1383.type === Syntax$876.Identifier) {
                params$1385 = reinterpretAsCoverFormalsList$970([expr$1383]);
            } else if (expr$1383.type === Syntax$876.SequenceExpression) {
                params$1385 = reinterpretAsCoverFormalsList$970(expr$1383.expressions);
            }
            if (params$1385) {
                return parseArrowFunctionExpression$971(params$1385);
            }
        }
        if (matchAssign$941()) {
            // 11.13.1
            if (strict$883 && expr$1383.type === Syntax$876.Identifier && isRestrictedWord$910(expr$1383.name)) {
                throwErrorTolerant$934(token$1384, Messages$878.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$938('=') && (expr$1383.type === Syntax$876.ObjectExpression || expr$1383.type === Syntax$876.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$968(expr$1383);
            } else if (!isLeftHandSide$943(expr$1383)) {
                throwError$933({}, Messages$878.InvalidLHSInAssignment);
            }
            expr$1383 = delegate$892.createAssignmentExpression(lex$929().value, expr$1383, parseAssignmentExpression$972());
        }
        return expr$1383;
    }
    // 11.14 Comma Operator
    function parseExpression$973() {
        var expr$1387, expressions$1388, sequence$1389, coverFormalsList$1390, spreadFound$1391, oldParenthesizedCount$1392;
        oldParenthesizedCount$1392 = state$897.parenthesizedCount;
        expr$1387 = parseAssignmentExpression$972();
        expressions$1388 = [expr$1387];
        if (match$938(',')) {
            while (streamIndex$894 < length$891) {
                if (!match$938(',')) {
                    break;
                }
                lex$929();
                expr$1387 = parseSpreadOrAssignmentExpression$956();
                expressions$1388.push(expr$1387);
                if (expr$1387.type === Syntax$876.SpreadElement) {
                    spreadFound$1391 = true;
                    if (!match$938(')')) {
                        throwError$933({}, Messages$878.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1389 = delegate$892.createSequenceExpression(expressions$1388);
        }
        if (match$938('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$897.parenthesizedCount === oldParenthesizedCount$1392 || state$897.parenthesizedCount === oldParenthesizedCount$1392 + 1) {
                expr$1387 = expr$1387.type === Syntax$876.SequenceExpression ? expr$1387.expressions : expressions$1388;
                coverFormalsList$1390 = reinterpretAsCoverFormalsList$970(expr$1387);
                if (coverFormalsList$1390) {
                    return parseArrowFunctionExpression$971(coverFormalsList$1390);
                }
            }
            throwUnexpected$935(lex$929());
        }
        if (spreadFound$1391 && lookahead2$931().value !== '=>') {
            throwError$933({}, Messages$878.IllegalSpread);
        }
        return sequence$1389 || expr$1387;
    }
    // 12.1 Block
    function parseStatementList$974() {
        var list$1393 = [], statement$1394;
        while (streamIndex$894 < length$891) {
            if (match$938('}')) {
                break;
            }
            statement$1394 = parseSourceElement$1019();
            if (typeof statement$1394 === 'undefined') {
                break;
            }
            list$1393.push(statement$1394);
        }
        return list$1393;
    }
    function parseBlock$975() {
        var block$1395;
        expect$936('{');
        block$1395 = parseStatementList$974();
        expect$936('}');
        return delegate$892.createBlockStatement(block$1395);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$976() {
        var token$1396 = lookahead$895, resolvedIdent$1397;
        if (token$1396.type !== Token$873.Identifier) {
            throwUnexpected$935(token$1396);
        }
        resolvedIdent$1397 = expander$872.resolve(tokenStream$893[lookaheadIndex$896]);
        lex$929();
        return delegate$892.createIdentifier(resolvedIdent$1397);
    }
    function parseVariableDeclaration$977(kind$1398) {
        var id$1399, init$1400 = null;
        if (match$938('{')) {
            id$1399 = parseObjectInitialiser$950();
            reinterpretAsAssignmentBindingPattern$968(id$1399);
        } else if (match$938('[')) {
            id$1399 = parseArrayInitialiser$945();
            reinterpretAsAssignmentBindingPattern$968(id$1399);
        } else {
            id$1399 = state$897.allowKeyword ? parseNonComputedProperty$957() : parseVariableIdentifier$976();
            // 12.2.1
            if (strict$883 && isRestrictedWord$910(id$1399.name)) {
                throwErrorTolerant$934({}, Messages$878.StrictVarName);
            }
        }
        if (kind$1398 === 'const') {
            if (!match$938('=')) {
                throwError$933({}, Messages$878.NoUnintializedConst);
            }
            expect$936('=');
            init$1400 = parseAssignmentExpression$972();
        } else if (match$938('=')) {
            lex$929();
            init$1400 = parseAssignmentExpression$972();
        }
        return delegate$892.createVariableDeclarator(id$1399, init$1400);
    }
    function parseVariableDeclarationList$978(kind$1401) {
        var list$1402 = [];
        do {
            list$1402.push(parseVariableDeclaration$977(kind$1401));
            if (!match$938(',')) {
                break;
            }
            lex$929();
        } while (streamIndex$894 < length$891);
        return list$1402;
    }
    function parseVariableStatement$979() {
        var declarations$1403;
        expectKeyword$937('var');
        declarations$1403 = parseVariableDeclarationList$978();
        consumeSemicolon$942();
        return delegate$892.createVariableDeclaration(declarations$1403, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$980(kind$1404) {
        var declarations$1405;
        expectKeyword$937(kind$1404);
        declarations$1405 = parseVariableDeclarationList$978(kind$1404);
        consumeSemicolon$942();
        return delegate$892.createVariableDeclaration(declarations$1405, kind$1404);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$981() {
        var id$1406, src$1407, body$1408;
        lex$929();
        // 'module'
        if (peekLineTerminator$932()) {
            throwError$933({}, Messages$878.NewlineAfterModule);
        }
        switch (lookahead$895.type) {
        case Token$873.StringLiteral:
            id$1406 = parsePrimaryExpression$954();
            body$1408 = parseModuleBlock$1024();
            src$1407 = null;
            break;
        case Token$873.Identifier:
            id$1406 = parseVariableIdentifier$976();
            body$1408 = null;
            if (!matchContextualKeyword$940('from')) {
                throwUnexpected$935(lex$929());
            }
            lex$929();
            src$1407 = parsePrimaryExpression$954();
            if (src$1407.type !== Syntax$876.Literal) {
                throwError$933({}, Messages$878.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$942();
        return delegate$892.createModuleDeclaration(id$1406, src$1407, body$1408);
    }
    function parseExportBatchSpecifier$982() {
        expect$936('*');
        return delegate$892.createExportBatchSpecifier();
    }
    function parseExportSpecifier$983() {
        var id$1409, name$1410 = null;
        id$1409 = parseVariableIdentifier$976();
        if (matchContextualKeyword$940('as')) {
            lex$929();
            name$1410 = parseNonComputedProperty$957();
        }
        return delegate$892.createExportSpecifier(id$1409, name$1410);
    }
    function parseExportDeclaration$984() {
        var previousAllowKeyword$1411, decl$1412, def$1413, src$1414, specifiers$1415;
        expectKeyword$937('export');
        if (lookahead$895.type === Token$873.Keyword) {
            switch (lookahead$895.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$892.createExportDeclaration(parseSourceElement$1019(), null, null);
            }
        }
        if (isIdentifierName$926(lookahead$895)) {
            previousAllowKeyword$1411 = state$897.allowKeyword;
            state$897.allowKeyword = true;
            decl$1412 = parseVariableDeclarationList$978('let');
            state$897.allowKeyword = previousAllowKeyword$1411;
            return delegate$892.createExportDeclaration(decl$1412, null, null);
        }
        specifiers$1415 = [];
        src$1414 = null;
        if (match$938('*')) {
            specifiers$1415.push(parseExportBatchSpecifier$982());
        } else {
            expect$936('{');
            do {
                specifiers$1415.push(parseExportSpecifier$983());
            } while (match$938(',') && lex$929());
            expect$936('}');
        }
        if (matchContextualKeyword$940('from')) {
            lex$929();
            src$1414 = parsePrimaryExpression$954();
            if (src$1414.type !== Syntax$876.Literal) {
                throwError$933({}, Messages$878.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$942();
        return delegate$892.createExportDeclaration(null, specifiers$1415, src$1414);
    }
    function parseImportDeclaration$985() {
        var specifiers$1416, kind$1417, src$1418;
        expectKeyword$937('import');
        specifiers$1416 = [];
        if (isIdentifierName$926(lookahead$895)) {
            kind$1417 = 'default';
            specifiers$1416.push(parseImportSpecifier$986());
            if (!matchContextualKeyword$940('from')) {
                throwError$933({}, Messages$878.NoFromAfterImport);
            }
            lex$929();
        } else if (match$938('{')) {
            kind$1417 = 'named';
            lex$929();
            do {
                specifiers$1416.push(parseImportSpecifier$986());
            } while (match$938(',') && lex$929());
            expect$936('}');
            if (!matchContextualKeyword$940('from')) {
                throwError$933({}, Messages$878.NoFromAfterImport);
            }
            lex$929();
        }
        src$1418 = parsePrimaryExpression$954();
        if (src$1418.type !== Syntax$876.Literal) {
            throwError$933({}, Messages$878.InvalidModuleSpecifier);
        }
        consumeSemicolon$942();
        return delegate$892.createImportDeclaration(specifiers$1416, kind$1417, src$1418);
    }
    function parseImportSpecifier$986() {
        var id$1419, name$1420 = null;
        id$1419 = parseNonComputedProperty$957();
        if (matchContextualKeyword$940('as')) {
            lex$929();
            name$1420 = parseVariableIdentifier$976();
        }
        return delegate$892.createImportSpecifier(id$1419, name$1420);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$987() {
        expect$936(';');
        return delegate$892.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$988() {
        var expr$1421 = parseExpression$973();
        consumeSemicolon$942();
        return delegate$892.createExpressionStatement(expr$1421);
    }
    // 12.5 If statement
    function parseIfStatement$989() {
        var test$1422, consequent$1423, alternate$1424;
        expectKeyword$937('if');
        expect$936('(');
        test$1422 = parseExpression$973();
        expect$936(')');
        consequent$1423 = parseStatement$1004();
        if (matchKeyword$939('else')) {
            lex$929();
            alternate$1424 = parseStatement$1004();
        } else {
            alternate$1424 = null;
        }
        return delegate$892.createIfStatement(test$1422, consequent$1423, alternate$1424);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$990() {
        var body$1425, test$1426, oldInIteration$1427;
        expectKeyword$937('do');
        oldInIteration$1427 = state$897.inIteration;
        state$897.inIteration = true;
        body$1425 = parseStatement$1004();
        state$897.inIteration = oldInIteration$1427;
        expectKeyword$937('while');
        expect$936('(');
        test$1426 = parseExpression$973();
        expect$936(')');
        if (match$938(';')) {
            lex$929();
        }
        return delegate$892.createDoWhileStatement(body$1425, test$1426);
    }
    function parseWhileStatement$991() {
        var test$1428, body$1429, oldInIteration$1430;
        expectKeyword$937('while');
        expect$936('(');
        test$1428 = parseExpression$973();
        expect$936(')');
        oldInIteration$1430 = state$897.inIteration;
        state$897.inIteration = true;
        body$1429 = parseStatement$1004();
        state$897.inIteration = oldInIteration$1430;
        return delegate$892.createWhileStatement(test$1428, body$1429);
    }
    function parseForVariableDeclaration$992() {
        var token$1431 = lex$929(), declarations$1432 = parseVariableDeclarationList$978();
        return delegate$892.createVariableDeclaration(declarations$1432, token$1431.value);
    }
    function parseForStatement$993(opts$1433) {
        var init$1434, test$1435, update$1436, left$1437, right$1438, body$1439, operator$1440, oldInIteration$1441;
        init$1434 = test$1435 = update$1436 = null;
        expectKeyword$937('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$940('each')) {
            throwError$933({}, Messages$878.EachNotAllowed);
        }
        expect$936('(');
        if (match$938(';')) {
            lex$929();
        } else {
            if (matchKeyword$939('var') || matchKeyword$939('let') || matchKeyword$939('const')) {
                state$897.allowIn = false;
                init$1434 = parseForVariableDeclaration$992();
                state$897.allowIn = true;
                if (init$1434.declarations.length === 1) {
                    if (matchKeyword$939('in') || matchContextualKeyword$940('of')) {
                        operator$1440 = lookahead$895;
                        if (!((operator$1440.value === 'in' || init$1434.kind !== 'var') && init$1434.declarations[0].init)) {
                            lex$929();
                            left$1437 = init$1434;
                            right$1438 = parseExpression$973();
                            init$1434 = null;
                        }
                    }
                }
            } else {
                state$897.allowIn = false;
                init$1434 = parseExpression$973();
                state$897.allowIn = true;
                if (matchContextualKeyword$940('of')) {
                    operator$1440 = lex$929();
                    left$1437 = init$1434;
                    right$1438 = parseExpression$973();
                    init$1434 = null;
                } else if (matchKeyword$939('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$944(init$1434)) {
                        throwError$933({}, Messages$878.InvalidLHSInForIn);
                    }
                    operator$1440 = lex$929();
                    left$1437 = init$1434;
                    right$1438 = parseExpression$973();
                    init$1434 = null;
                }
            }
            if (typeof left$1437 === 'undefined') {
                expect$936(';');
            }
        }
        if (typeof left$1437 === 'undefined') {
            if (!match$938(';')) {
                test$1435 = parseExpression$973();
            }
            expect$936(';');
            if (!match$938(')')) {
                update$1436 = parseExpression$973();
            }
        }
        expect$936(')');
        oldInIteration$1441 = state$897.inIteration;
        state$897.inIteration = true;
        if (!(opts$1433 !== undefined && opts$1433.ignoreBody)) {
            body$1439 = parseStatement$1004();
        }
        state$897.inIteration = oldInIteration$1441;
        if (typeof left$1437 === 'undefined') {
            return delegate$892.createForStatement(init$1434, test$1435, update$1436, body$1439);
        }
        if (operator$1440.value === 'in') {
            return delegate$892.createForInStatement(left$1437, right$1438, body$1439);
        }
        return delegate$892.createForOfStatement(left$1437, right$1438, body$1439);
    }
    // 12.7 The continue statement
    function parseContinueStatement$994() {
        var label$1442 = null, key$1443;
        expectKeyword$937('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$895.value.charCodeAt(0) === 59) {
            lex$929();
            if (!state$897.inIteration) {
                throwError$933({}, Messages$878.IllegalContinue);
            }
            return delegate$892.createContinueStatement(null);
        }
        if (peekLineTerminator$932()) {
            if (!state$897.inIteration) {
                throwError$933({}, Messages$878.IllegalContinue);
            }
            return delegate$892.createContinueStatement(null);
        }
        if (lookahead$895.type === Token$873.Identifier) {
            label$1442 = parseVariableIdentifier$976();
            key$1443 = '$' + label$1442.name;
            if (!Object.prototype.hasOwnProperty.call(state$897.labelSet, key$1443)) {
                throwError$933({}, Messages$878.UnknownLabel, label$1442.name);
            }
        }
        consumeSemicolon$942();
        if (label$1442 === null && !state$897.inIteration) {
            throwError$933({}, Messages$878.IllegalContinue);
        }
        return delegate$892.createContinueStatement(label$1442);
    }
    // 12.8 The break statement
    function parseBreakStatement$995() {
        var label$1444 = null, key$1445;
        expectKeyword$937('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$895.value.charCodeAt(0) === 59) {
            lex$929();
            if (!(state$897.inIteration || state$897.inSwitch)) {
                throwError$933({}, Messages$878.IllegalBreak);
            }
            return delegate$892.createBreakStatement(null);
        }
        if (peekLineTerminator$932()) {
            if (!(state$897.inIteration || state$897.inSwitch)) {
                throwError$933({}, Messages$878.IllegalBreak);
            }
            return delegate$892.createBreakStatement(null);
        }
        if (lookahead$895.type === Token$873.Identifier) {
            label$1444 = parseVariableIdentifier$976();
            key$1445 = '$' + label$1444.name;
            if (!Object.prototype.hasOwnProperty.call(state$897.labelSet, key$1445)) {
                throwError$933({}, Messages$878.UnknownLabel, label$1444.name);
            }
        }
        consumeSemicolon$942();
        if (label$1444 === null && !(state$897.inIteration || state$897.inSwitch)) {
            throwError$933({}, Messages$878.IllegalBreak);
        }
        return delegate$892.createBreakStatement(label$1444);
    }
    // 12.9 The return statement
    function parseReturnStatement$996() {
        var argument$1446 = null;
        expectKeyword$937('return');
        if (!state$897.inFunctionBody) {
            throwErrorTolerant$934({}, Messages$878.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$906(String(lookahead$895.value).charCodeAt(0))) {
            argument$1446 = parseExpression$973();
            consumeSemicolon$942();
            return delegate$892.createReturnStatement(argument$1446);
        }
        if (peekLineTerminator$932()) {
            return delegate$892.createReturnStatement(null);
        }
        if (!match$938(';')) {
            if (!match$938('}') && lookahead$895.type !== Token$873.EOF) {
                argument$1446 = parseExpression$973();
            }
        }
        consumeSemicolon$942();
        return delegate$892.createReturnStatement(argument$1446);
    }
    // 12.10 The with statement
    function parseWithStatement$997() {
        var object$1447, body$1448;
        if (strict$883) {
            throwErrorTolerant$934({}, Messages$878.StrictModeWith);
        }
        expectKeyword$937('with');
        expect$936('(');
        object$1447 = parseExpression$973();
        expect$936(')');
        body$1448 = parseStatement$1004();
        return delegate$892.createWithStatement(object$1447, body$1448);
    }
    // 12.10 The swith statement
    function parseSwitchCase$998() {
        var test$1449, consequent$1450 = [], sourceElement$1451;
        if (matchKeyword$939('default')) {
            lex$929();
            test$1449 = null;
        } else {
            expectKeyword$937('case');
            test$1449 = parseExpression$973();
        }
        expect$936(':');
        while (streamIndex$894 < length$891) {
            if (match$938('}') || matchKeyword$939('default') || matchKeyword$939('case')) {
                break;
            }
            sourceElement$1451 = parseSourceElement$1019();
            if (typeof sourceElement$1451 === 'undefined') {
                break;
            }
            consequent$1450.push(sourceElement$1451);
        }
        return delegate$892.createSwitchCase(test$1449, consequent$1450);
    }
    function parseSwitchStatement$999() {
        var discriminant$1452, cases$1453, clause$1454, oldInSwitch$1455, defaultFound$1456;
        expectKeyword$937('switch');
        expect$936('(');
        discriminant$1452 = parseExpression$973();
        expect$936(')');
        expect$936('{');
        cases$1453 = [];
        if (match$938('}')) {
            lex$929();
            return delegate$892.createSwitchStatement(discriminant$1452, cases$1453);
        }
        oldInSwitch$1455 = state$897.inSwitch;
        state$897.inSwitch = true;
        defaultFound$1456 = false;
        while (streamIndex$894 < length$891) {
            if (match$938('}')) {
                break;
            }
            clause$1454 = parseSwitchCase$998();
            if (clause$1454.test === null) {
                if (defaultFound$1456) {
                    throwError$933({}, Messages$878.MultipleDefaultsInSwitch);
                }
                defaultFound$1456 = true;
            }
            cases$1453.push(clause$1454);
        }
        state$897.inSwitch = oldInSwitch$1455;
        expect$936('}');
        return delegate$892.createSwitchStatement(discriminant$1452, cases$1453);
    }
    // 12.13 The throw statement
    function parseThrowStatement$1000() {
        var argument$1457;
        expectKeyword$937('throw');
        if (peekLineTerminator$932()) {
            throwError$933({}, Messages$878.NewlineAfterThrow);
        }
        argument$1457 = parseExpression$973();
        consumeSemicolon$942();
        return delegate$892.createThrowStatement(argument$1457);
    }
    // 12.14 The try statement
    function parseCatchClause$1001() {
        var param$1458, body$1459;
        expectKeyword$937('catch');
        expect$936('(');
        if (match$938(')')) {
            throwUnexpected$935(lookahead$895);
        }
        param$1458 = parseExpression$973();
        // 12.14.1
        if (strict$883 && param$1458.type === Syntax$876.Identifier && isRestrictedWord$910(param$1458.name)) {
            throwErrorTolerant$934({}, Messages$878.StrictCatchVariable);
        }
        expect$936(')');
        body$1459 = parseBlock$975();
        return delegate$892.createCatchClause(param$1458, body$1459);
    }
    function parseTryStatement$1002() {
        var block$1460, handlers$1461 = [], finalizer$1462 = null;
        expectKeyword$937('try');
        block$1460 = parseBlock$975();
        if (matchKeyword$939('catch')) {
            handlers$1461.push(parseCatchClause$1001());
        }
        if (matchKeyword$939('finally')) {
            lex$929();
            finalizer$1462 = parseBlock$975();
        }
        if (handlers$1461.length === 0 && !finalizer$1462) {
            throwError$933({}, Messages$878.NoCatchOrFinally);
        }
        return delegate$892.createTryStatement(block$1460, [], handlers$1461, finalizer$1462);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$1003() {
        expectKeyword$937('debugger');
        consumeSemicolon$942();
        return delegate$892.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$1004() {
        var type$1463 = lookahead$895.type, expr$1464, labeledBody$1465, key$1466;
        if (type$1463 === Token$873.EOF) {
            throwUnexpected$935(lookahead$895);
        }
        if (type$1463 === Token$873.Punctuator) {
            switch (lookahead$895.value) {
            case ';':
                return parseEmptyStatement$987();
            case '{':
                return parseBlock$975();
            case '(':
                return parseExpressionStatement$988();
            default:
                break;
            }
        }
        if (type$1463 === Token$873.Keyword) {
            switch (lookahead$895.value) {
            case 'break':
                return parseBreakStatement$995();
            case 'continue':
                return parseContinueStatement$994();
            case 'debugger':
                return parseDebuggerStatement$1003();
            case 'do':
                return parseDoWhileStatement$990();
            case 'for':
                return parseForStatement$993();
            case 'function':
                return parseFunctionDeclaration$1010();
            case 'class':
                return parseClassDeclaration$1017();
            case 'if':
                return parseIfStatement$989();
            case 'return':
                return parseReturnStatement$996();
            case 'switch':
                return parseSwitchStatement$999();
            case 'throw':
                return parseThrowStatement$1000();
            case 'try':
                return parseTryStatement$1002();
            case 'var':
                return parseVariableStatement$979();
            case 'while':
                return parseWhileStatement$991();
            case 'with':
                return parseWithStatement$997();
            default:
                break;
            }
        }
        expr$1464 = parseExpression$973();
        // 12.12 Labelled Statements
        if (expr$1464.type === Syntax$876.Identifier && match$938(':')) {
            lex$929();
            key$1466 = '$' + expr$1464.name;
            if (Object.prototype.hasOwnProperty.call(state$897.labelSet, key$1466)) {
                throwError$933({}, Messages$878.Redeclaration, 'Label', expr$1464.name);
            }
            state$897.labelSet[key$1466] = true;
            labeledBody$1465 = parseStatement$1004();
            delete state$897.labelSet[key$1466];
            return delegate$892.createLabeledStatement(expr$1464, labeledBody$1465);
        }
        consumeSemicolon$942();
        return delegate$892.createExpressionStatement(expr$1464);
    }
    // 13 Function Definition
    function parseConciseBody$1005() {
        if (match$938('{')) {
            return parseFunctionSourceElements$1006();
        }
        return parseAssignmentExpression$972();
    }
    function parseFunctionSourceElements$1006() {
        var sourceElement$1467, sourceElements$1468 = [], token$1469, directive$1470, firstRestricted$1471, oldLabelSet$1472, oldInIteration$1473, oldInSwitch$1474, oldInFunctionBody$1475, oldParenthesizedCount$1476;
        expect$936('{');
        while (streamIndex$894 < length$891) {
            if (lookahead$895.type !== Token$873.StringLiteral) {
                break;
            }
            token$1469 = lookahead$895;
            sourceElement$1467 = parseSourceElement$1019();
            sourceElements$1468.push(sourceElement$1467);
            if (sourceElement$1467.expression.type !== Syntax$876.Literal) {
                // this is not directive
                break;
            }
            directive$1470 = token$1469.value;
            if (directive$1470 === 'use strict') {
                strict$883 = true;
                if (firstRestricted$1471) {
                    throwErrorTolerant$934(firstRestricted$1471, Messages$878.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1471 && token$1469.octal) {
                    firstRestricted$1471 = token$1469;
                }
            }
        }
        oldLabelSet$1472 = state$897.labelSet;
        oldInIteration$1473 = state$897.inIteration;
        oldInSwitch$1474 = state$897.inSwitch;
        oldInFunctionBody$1475 = state$897.inFunctionBody;
        oldParenthesizedCount$1476 = state$897.parenthesizedCount;
        state$897.labelSet = {};
        state$897.inIteration = false;
        state$897.inSwitch = false;
        state$897.inFunctionBody = true;
        state$897.parenthesizedCount = 0;
        while (streamIndex$894 < length$891) {
            if (match$938('}')) {
                break;
            }
            sourceElement$1467 = parseSourceElement$1019();
            if (typeof sourceElement$1467 === 'undefined') {
                break;
            }
            sourceElements$1468.push(sourceElement$1467);
        }
        expect$936('}');
        state$897.labelSet = oldLabelSet$1472;
        state$897.inIteration = oldInIteration$1473;
        state$897.inSwitch = oldInSwitch$1474;
        state$897.inFunctionBody = oldInFunctionBody$1475;
        state$897.parenthesizedCount = oldParenthesizedCount$1476;
        return delegate$892.createBlockStatement(sourceElements$1468);
    }
    function validateParam$1007(options$1477, param$1478, name$1479) {
        var key$1480 = '$' + name$1479;
        if (strict$883) {
            if (isRestrictedWord$910(name$1479)) {
                options$1477.stricted = param$1478;
                options$1477.message = Messages$878.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1477.paramSet, key$1480)) {
                options$1477.stricted = param$1478;
                options$1477.message = Messages$878.StrictParamDupe;
            }
        } else if (!options$1477.firstRestricted) {
            if (isRestrictedWord$910(name$1479)) {
                options$1477.firstRestricted = param$1478;
                options$1477.message = Messages$878.StrictParamName;
            } else if (isStrictModeReservedWord$909(name$1479)) {
                options$1477.firstRestricted = param$1478;
                options$1477.message = Messages$878.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1477.paramSet, key$1480)) {
                options$1477.firstRestricted = param$1478;
                options$1477.message = Messages$878.StrictParamDupe;
            }
        }
        options$1477.paramSet[key$1480] = true;
    }
    function parseParam$1008(options$1481) {
        var token$1482, rest$1483, param$1484, def$1485;
        token$1482 = lookahead$895;
        if (token$1482.value === '...') {
            token$1482 = lex$929();
            rest$1483 = true;
        }
        if (match$938('[')) {
            param$1484 = parseArrayInitialiser$945();
            reinterpretAsDestructuredParameter$969(options$1481, param$1484);
        } else if (match$938('{')) {
            if (rest$1483) {
                throwError$933({}, Messages$878.ObjectPatternAsRestParameter);
            }
            param$1484 = parseObjectInitialiser$950();
            reinterpretAsDestructuredParameter$969(options$1481, param$1484);
        } else {
            param$1484 = parseVariableIdentifier$976();
            validateParam$1007(options$1481, token$1482, token$1482.value);
            if (match$938('=')) {
                if (rest$1483) {
                    throwErrorTolerant$934(lookahead$895, Messages$878.DefaultRestParameter);
                }
                lex$929();
                def$1485 = parseAssignmentExpression$972();
                ++options$1481.defaultCount;
            }
        }
        if (rest$1483) {
            if (!match$938(')')) {
                throwError$933({}, Messages$878.ParameterAfterRestParameter);
            }
            options$1481.rest = param$1484;
            return false;
        }
        options$1481.params.push(param$1484);
        options$1481.defaults.push(def$1485);
        return !match$938(')');
    }
    function parseParams$1009(firstRestricted$1486) {
        var options$1487;
        options$1487 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1486
        };
        expect$936('(');
        if (!match$938(')')) {
            options$1487.paramSet = {};
            while (streamIndex$894 < length$891) {
                if (!parseParam$1008(options$1487)) {
                    break;
                }
                expect$936(',');
            }
        }
        expect$936(')');
        if (options$1487.defaultCount === 0) {
            options$1487.defaults = [];
        }
        return options$1487;
    }
    function parseFunctionDeclaration$1010() {
        var id$1488, body$1489, token$1490, tmp$1491, firstRestricted$1492, message$1493, previousStrict$1494, previousYieldAllowed$1495, generator$1496, expression$1497;
        expectKeyword$937('function');
        generator$1496 = false;
        if (match$938('*')) {
            lex$929();
            generator$1496 = true;
        }
        token$1490 = lookahead$895;
        id$1488 = parseVariableIdentifier$976();
        if (strict$883) {
            if (isRestrictedWord$910(token$1490.value)) {
                throwErrorTolerant$934(token$1490, Messages$878.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$910(token$1490.value)) {
                firstRestricted$1492 = token$1490;
                message$1493 = Messages$878.StrictFunctionName;
            } else if (isStrictModeReservedWord$909(token$1490.value)) {
                firstRestricted$1492 = token$1490;
                message$1493 = Messages$878.StrictReservedWord;
            }
        }
        tmp$1491 = parseParams$1009(firstRestricted$1492);
        firstRestricted$1492 = tmp$1491.firstRestricted;
        if (tmp$1491.message) {
            message$1493 = tmp$1491.message;
        }
        previousStrict$1494 = strict$883;
        previousYieldAllowed$1495 = state$897.yieldAllowed;
        state$897.yieldAllowed = generator$1496;
        // here we redo some work in order to set 'expression'
        expression$1497 = !match$938('{');
        body$1489 = parseConciseBody$1005();
        if (strict$883 && firstRestricted$1492) {
            throwError$933(firstRestricted$1492, message$1493);
        }
        if (strict$883 && tmp$1491.stricted) {
            throwErrorTolerant$934(tmp$1491.stricted, message$1493);
        }
        if (state$897.yieldAllowed && !state$897.yieldFound) {
            throwErrorTolerant$934({}, Messages$878.NoYieldInGenerator);
        }
        strict$883 = previousStrict$1494;
        state$897.yieldAllowed = previousYieldAllowed$1495;
        return delegate$892.createFunctionDeclaration(id$1488, tmp$1491.params, tmp$1491.defaults, body$1489, tmp$1491.rest, generator$1496, expression$1497);
    }
    function parseFunctionExpression$1011() {
        var token$1498, id$1499 = null, firstRestricted$1500, message$1501, tmp$1502, body$1503, previousStrict$1504, previousYieldAllowed$1505, generator$1506, expression$1507;
        expectKeyword$937('function');
        generator$1506 = false;
        if (match$938('*')) {
            lex$929();
            generator$1506 = true;
        }
        if (!match$938('(')) {
            token$1498 = lookahead$895;
            id$1499 = parseVariableIdentifier$976();
            if (strict$883) {
                if (isRestrictedWord$910(token$1498.value)) {
                    throwErrorTolerant$934(token$1498, Messages$878.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$910(token$1498.value)) {
                    firstRestricted$1500 = token$1498;
                    message$1501 = Messages$878.StrictFunctionName;
                } else if (isStrictModeReservedWord$909(token$1498.value)) {
                    firstRestricted$1500 = token$1498;
                    message$1501 = Messages$878.StrictReservedWord;
                }
            }
        }
        tmp$1502 = parseParams$1009(firstRestricted$1500);
        firstRestricted$1500 = tmp$1502.firstRestricted;
        if (tmp$1502.message) {
            message$1501 = tmp$1502.message;
        }
        previousStrict$1504 = strict$883;
        previousYieldAllowed$1505 = state$897.yieldAllowed;
        state$897.yieldAllowed = generator$1506;
        // here we redo some work in order to set 'expression'
        expression$1507 = !match$938('{');
        body$1503 = parseConciseBody$1005();
        if (strict$883 && firstRestricted$1500) {
            throwError$933(firstRestricted$1500, message$1501);
        }
        if (strict$883 && tmp$1502.stricted) {
            throwErrorTolerant$934(tmp$1502.stricted, message$1501);
        }
        if (state$897.yieldAllowed && !state$897.yieldFound) {
            throwErrorTolerant$934({}, Messages$878.NoYieldInGenerator);
        }
        strict$883 = previousStrict$1504;
        state$897.yieldAllowed = previousYieldAllowed$1505;
        return delegate$892.createFunctionExpression(id$1499, tmp$1502.params, tmp$1502.defaults, body$1503, tmp$1502.rest, generator$1506, expression$1507);
    }
    function parseYieldExpression$1012() {
        var delegateFlag$1508, expr$1509, previousYieldAllowed$1510;
        expectKeyword$937('yield');
        if (!state$897.yieldAllowed) {
            throwErrorTolerant$934({}, Messages$878.IllegalYield);
        }
        delegateFlag$1508 = false;
        if (match$938('*')) {
            lex$929();
            delegateFlag$1508 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1510 = state$897.yieldAllowed;
        state$897.yieldAllowed = false;
        expr$1509 = parseAssignmentExpression$972();
        state$897.yieldAllowed = previousYieldAllowed$1510;
        state$897.yieldFound = true;
        return delegate$892.createYieldExpression(expr$1509, delegateFlag$1508);
    }
    // 14 Classes
    function parseMethodDefinition$1013(existingPropNames$1511) {
        var token$1512, key$1513, param$1514, propType$1515, isValidDuplicateProp$1516 = false;
        if (lookahead$895.value === 'static') {
            propType$1515 = ClassPropertyType$881.static;
            lex$929();
        } else {
            propType$1515 = ClassPropertyType$881.prototype;
        }
        if (match$938('*')) {
            lex$929();
            return delegate$892.createMethodDefinition(propType$1515, '', parseObjectPropertyKey$948(), parsePropertyMethodFunction$947({ generator: true }));
        }
        token$1512 = lookahead$895;
        key$1513 = parseObjectPropertyKey$948();
        if (token$1512.value === 'get' && !match$938('(')) {
            key$1513 = parseObjectPropertyKey$948();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1511[propType$1515].hasOwnProperty(key$1513.name)) {
                isValidDuplicateProp$1516 = existingPropNames$1511[propType$1515][key$1513.name].get === undefined && existingPropNames$1511[propType$1515][key$1513.name].data === undefined && existingPropNames$1511[propType$1515][key$1513.name].set !== undefined;
                if (!isValidDuplicateProp$1516) {
                    throwError$933(key$1513, Messages$878.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1511[propType$1515][key$1513.name] = {};
            }
            existingPropNames$1511[propType$1515][key$1513.name].get = true;
            expect$936('(');
            expect$936(')');
            return delegate$892.createMethodDefinition(propType$1515, 'get', key$1513, parsePropertyFunction$946({ generator: false }));
        }
        if (token$1512.value === 'set' && !match$938('(')) {
            key$1513 = parseObjectPropertyKey$948();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1511[propType$1515].hasOwnProperty(key$1513.name)) {
                isValidDuplicateProp$1516 = existingPropNames$1511[propType$1515][key$1513.name].set === undefined && existingPropNames$1511[propType$1515][key$1513.name].data === undefined && existingPropNames$1511[propType$1515][key$1513.name].get !== undefined;
                if (!isValidDuplicateProp$1516) {
                    throwError$933(key$1513, Messages$878.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1511[propType$1515][key$1513.name] = {};
            }
            existingPropNames$1511[propType$1515][key$1513.name].set = true;
            expect$936('(');
            token$1512 = lookahead$895;
            param$1514 = [parseVariableIdentifier$976()];
            expect$936(')');
            return delegate$892.createMethodDefinition(propType$1515, 'set', key$1513, parsePropertyFunction$946({
                params: param$1514,
                generator: false,
                name: token$1512
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1511[propType$1515].hasOwnProperty(key$1513.name)) {
            throwError$933(key$1513, Messages$878.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1511[propType$1515][key$1513.name] = {};
        }
        existingPropNames$1511[propType$1515][key$1513.name].data = true;
        return delegate$892.createMethodDefinition(propType$1515, '', key$1513, parsePropertyMethodFunction$947({ generator: false }));
    }
    function parseClassElement$1014(existingProps$1517) {
        if (match$938(';')) {
            lex$929();
            return;
        }
        return parseMethodDefinition$1013(existingProps$1517);
    }
    function parseClassBody$1015() {
        var classElement$1518, classElements$1519 = [], existingProps$1520 = {};
        existingProps$1520[ClassPropertyType$881.static] = {};
        existingProps$1520[ClassPropertyType$881.prototype] = {};
        expect$936('{');
        while (streamIndex$894 < length$891) {
            if (match$938('}')) {
                break;
            }
            classElement$1518 = parseClassElement$1014(existingProps$1520);
            if (typeof classElement$1518 !== 'undefined') {
                classElements$1519.push(classElement$1518);
            }
        }
        expect$936('}');
        return delegate$892.createClassBody(classElements$1519);
    }
    function parseClassExpression$1016() {
        var id$1521, previousYieldAllowed$1522, superClass$1523 = null;
        expectKeyword$937('class');
        if (!matchKeyword$939('extends') && !match$938('{')) {
            id$1521 = parseVariableIdentifier$976();
        }
        if (matchKeyword$939('extends')) {
            expectKeyword$937('extends');
            previousYieldAllowed$1522 = state$897.yieldAllowed;
            state$897.yieldAllowed = false;
            superClass$1523 = parseAssignmentExpression$972();
            state$897.yieldAllowed = previousYieldAllowed$1522;
        }
        return delegate$892.createClassExpression(id$1521, superClass$1523, parseClassBody$1015());
    }
    function parseClassDeclaration$1017() {
        var id$1524, previousYieldAllowed$1525, superClass$1526 = null;
        expectKeyword$937('class');
        id$1524 = parseVariableIdentifier$976();
        if (matchKeyword$939('extends')) {
            expectKeyword$937('extends');
            previousYieldAllowed$1525 = state$897.yieldAllowed;
            state$897.yieldAllowed = false;
            superClass$1526 = parseAssignmentExpression$972();
            state$897.yieldAllowed = previousYieldAllowed$1525;
        }
        return delegate$892.createClassDeclaration(id$1524, superClass$1526, parseClassBody$1015());
    }
    // 15 Program
    function matchModuleDeclaration$1018() {
        var id$1527;
        if (matchContextualKeyword$940('module')) {
            id$1527 = lookahead2$931();
            return id$1527.type === Token$873.StringLiteral || id$1527.type === Token$873.Identifier;
        }
        return false;
    }
    function parseSourceElement$1019() {
        if (lookahead$895.type === Token$873.Keyword) {
            switch (lookahead$895.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$980(lookahead$895.value);
            case 'function':
                return parseFunctionDeclaration$1010();
            case 'export':
                return parseExportDeclaration$984();
            case 'import':
                return parseImportDeclaration$985();
            default:
                return parseStatement$1004();
            }
        }
        if (matchModuleDeclaration$1018()) {
            throwError$933({}, Messages$878.NestedModule);
        }
        if (lookahead$895.type !== Token$873.EOF) {
            return parseStatement$1004();
        }
    }
    function parseProgramElement$1020() {
        if (lookahead$895.type === Token$873.Keyword) {
            switch (lookahead$895.value) {
            case 'export':
                return parseExportDeclaration$984();
            case 'import':
                return parseImportDeclaration$985();
            }
        }
        if (matchModuleDeclaration$1018()) {
            return parseModuleDeclaration$981();
        }
        return parseSourceElement$1019();
    }
    function parseProgramElements$1021() {
        var sourceElement$1528, sourceElements$1529 = [], token$1530, directive$1531, firstRestricted$1532;
        while (streamIndex$894 < length$891) {
            token$1530 = lookahead$895;
            if (token$1530.type !== Token$873.StringLiteral) {
                break;
            }
            sourceElement$1528 = parseProgramElement$1020();
            sourceElements$1529.push(sourceElement$1528);
            if (sourceElement$1528.expression.type !== Syntax$876.Literal) {
                // this is not directive
                break;
            }
            directive$1531 = token$1530.value;
            if (directive$1531 === 'use strict') {
                strict$883 = true;
                if (firstRestricted$1532) {
                    throwErrorTolerant$934(firstRestricted$1532, Messages$878.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1532 && token$1530.octal) {
                    firstRestricted$1532 = token$1530;
                }
            }
        }
        while (streamIndex$894 < length$891) {
            sourceElement$1528 = parseProgramElement$1020();
            if (typeof sourceElement$1528 === 'undefined') {
                break;
            }
            sourceElements$1529.push(sourceElement$1528);
        }
        return sourceElements$1529;
    }
    function parseModuleElement$1022() {
        return parseSourceElement$1019();
    }
    function parseModuleElements$1023() {
        var list$1533 = [], statement$1534;
        while (streamIndex$894 < length$891) {
            if (match$938('}')) {
                break;
            }
            statement$1534 = parseModuleElement$1022();
            if (typeof statement$1534 === 'undefined') {
                break;
            }
            list$1533.push(statement$1534);
        }
        return list$1533;
    }
    function parseModuleBlock$1024() {
        var block$1535;
        expect$936('{');
        block$1535 = parseModuleElements$1023();
        expect$936('}');
        return delegate$892.createBlockStatement(block$1535);
    }
    function parseProgram$1025() {
        var body$1536;
        strict$883 = false;
        peek$930();
        body$1536 = parseProgramElements$1021();
        return delegate$892.createProgram(body$1536);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1026(type$1537, value$1538, start$1539, end$1540, loc$1541) {
        assert$899(typeof start$1539 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$898.comments.length > 0) {
            if (extra$898.comments[extra$898.comments.length - 1].range[1] > start$1539) {
                return;
            }
        }
        extra$898.comments.push({
            type: type$1537,
            value: value$1538,
            range: [
                start$1539,
                end$1540
            ],
            loc: loc$1541
        });
    }
    function scanComment$1027() {
        var comment$1542, ch$1543, loc$1544, start$1545, blockComment$1546, lineComment$1547;
        comment$1542 = '';
        blockComment$1546 = false;
        lineComment$1547 = false;
        while (index$884 < length$891) {
            ch$1543 = source$882[index$884];
            if (lineComment$1547) {
                ch$1543 = source$882[index$884++];
                if (isLineTerminator$905(ch$1543.charCodeAt(0))) {
                    loc$1544.end = {
                        line: lineNumber$885,
                        column: index$884 - lineStart$886 - 1
                    };
                    lineComment$1547 = false;
                    addComment$1026('Line', comment$1542, start$1545, index$884 - 1, loc$1544);
                    if (ch$1543 === '\r' && source$882[index$884] === '\n') {
                        ++index$884;
                    }
                    ++lineNumber$885;
                    lineStart$886 = index$884;
                    comment$1542 = '';
                } else if (index$884 >= length$891) {
                    lineComment$1547 = false;
                    comment$1542 += ch$1543;
                    loc$1544.end = {
                        line: lineNumber$885,
                        column: length$891 - lineStart$886
                    };
                    addComment$1026('Line', comment$1542, start$1545, length$891, loc$1544);
                } else {
                    comment$1542 += ch$1543;
                }
            } else if (blockComment$1546) {
                if (isLineTerminator$905(ch$1543.charCodeAt(0))) {
                    if (ch$1543 === '\r' && source$882[index$884 + 1] === '\n') {
                        ++index$884;
                        comment$1542 += '\r\n';
                    } else {
                        comment$1542 += ch$1543;
                    }
                    ++lineNumber$885;
                    ++index$884;
                    lineStart$886 = index$884;
                    if (index$884 >= length$891) {
                        throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1543 = source$882[index$884++];
                    if (index$884 >= length$891) {
                        throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1542 += ch$1543;
                    if (ch$1543 === '*') {
                        ch$1543 = source$882[index$884];
                        if (ch$1543 === '/') {
                            comment$1542 = comment$1542.substr(0, comment$1542.length - 1);
                            blockComment$1546 = false;
                            ++index$884;
                            loc$1544.end = {
                                line: lineNumber$885,
                                column: index$884 - lineStart$886
                            };
                            addComment$1026('Block', comment$1542, start$1545, index$884, loc$1544);
                            comment$1542 = '';
                        }
                    }
                }
            } else if (ch$1543 === '/') {
                ch$1543 = source$882[index$884 + 1];
                if (ch$1543 === '/') {
                    loc$1544 = {
                        start: {
                            line: lineNumber$885,
                            column: index$884 - lineStart$886
                        }
                    };
                    start$1545 = index$884;
                    index$884 += 2;
                    lineComment$1547 = true;
                    if (index$884 >= length$891) {
                        loc$1544.end = {
                            line: lineNumber$885,
                            column: index$884 - lineStart$886
                        };
                        lineComment$1547 = false;
                        addComment$1026('Line', comment$1542, start$1545, index$884, loc$1544);
                    }
                } else if (ch$1543 === '*') {
                    start$1545 = index$884;
                    index$884 += 2;
                    blockComment$1546 = true;
                    loc$1544 = {
                        start: {
                            line: lineNumber$885,
                            column: index$884 - lineStart$886 - 2
                        }
                    };
                    if (index$884 >= length$891) {
                        throwError$933({}, Messages$878.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$904(ch$1543.charCodeAt(0))) {
                ++index$884;
            } else if (isLineTerminator$905(ch$1543.charCodeAt(0))) {
                ++index$884;
                if (ch$1543 === '\r' && source$882[index$884] === '\n') {
                    ++index$884;
                }
                ++lineNumber$885;
                lineStart$886 = index$884;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1028() {
        var i$1548, entry$1549, comment$1550, comments$1551 = [];
        for (i$1548 = 0; i$1548 < extra$898.comments.length; ++i$1548) {
            entry$1549 = extra$898.comments[i$1548];
            comment$1550 = {
                type: entry$1549.type,
                value: entry$1549.value
            };
            if (extra$898.range) {
                comment$1550.range = entry$1549.range;
            }
            if (extra$898.loc) {
                comment$1550.loc = entry$1549.loc;
            }
            comments$1551.push(comment$1550);
        }
        extra$898.comments = comments$1551;
    }
    function collectToken$1029() {
        var start$1552, loc$1553, token$1554, range$1555, value$1556;
        skipComment$912();
        start$1552 = index$884;
        loc$1553 = {
            start: {
                line: lineNumber$885,
                column: index$884 - lineStart$886
            }
        };
        token$1554 = extra$898.advance();
        loc$1553.end = {
            line: lineNumber$885,
            column: index$884 - lineStart$886
        };
        if (token$1554.type !== Token$873.EOF) {
            range$1555 = [
                token$1554.range[0],
                token$1554.range[1]
            ];
            value$1556 = source$882.slice(token$1554.range[0], token$1554.range[1]);
            extra$898.tokens.push({
                type: TokenName$874[token$1554.type],
                value: value$1556,
                range: range$1555,
                loc: loc$1553
            });
        }
        return token$1554;
    }
    function collectRegex$1030() {
        var pos$1557, loc$1558, regex$1559, token$1560;
        skipComment$912();
        pos$1557 = index$884;
        loc$1558 = {
            start: {
                line: lineNumber$885,
                column: index$884 - lineStart$886
            }
        };
        regex$1559 = extra$898.scanRegExp();
        loc$1558.end = {
            line: lineNumber$885,
            column: index$884 - lineStart$886
        };
        if (!extra$898.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$898.tokens.length > 0) {
                token$1560 = extra$898.tokens[extra$898.tokens.length - 1];
                if (token$1560.range[0] === pos$1557 && token$1560.type === 'Punctuator') {
                    if (token$1560.value === '/' || token$1560.value === '/=') {
                        extra$898.tokens.pop();
                    }
                }
            }
            extra$898.tokens.push({
                type: 'RegularExpression',
                value: regex$1559.literal,
                range: [
                    pos$1557,
                    index$884
                ],
                loc: loc$1558
            });
        }
        return regex$1559;
    }
    function filterTokenLocation$1031() {
        var i$1561, entry$1562, token$1563, tokens$1564 = [];
        for (i$1561 = 0; i$1561 < extra$898.tokens.length; ++i$1561) {
            entry$1562 = extra$898.tokens[i$1561];
            token$1563 = {
                type: entry$1562.type,
                value: entry$1562.value
            };
            if (extra$898.range) {
                token$1563.range = entry$1562.range;
            }
            if (extra$898.loc) {
                token$1563.loc = entry$1562.loc;
            }
            tokens$1564.push(token$1563);
        }
        extra$898.tokens = tokens$1564;
    }
    function LocationMarker$1032() {
        var sm_index$1565 = lookahead$895 ? lookahead$895.sm_range[0] : 0;
        var sm_lineStart$1566 = lookahead$895 ? lookahead$895.sm_lineStart : 0;
        var sm_lineNumber$1567 = lookahead$895 ? lookahead$895.sm_lineNumber : 1;
        this.range = [
            sm_index$1565,
            sm_index$1565
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1567,
                column: sm_index$1565 - sm_lineStart$1566
            },
            end: {
                line: sm_lineNumber$1567,
                column: sm_index$1565 - sm_lineStart$1566
            }
        };
    }
    LocationMarker$1032.prototype = {
        constructor: LocationMarker$1032,
        end: function () {
            this.range[1] = sm_index$890;
            this.loc.end.line = sm_lineNumber$887;
            this.loc.end.column = sm_index$890 - sm_lineStart$888;
        },
        applyGroup: function (node$1568) {
            if (extra$898.range) {
                node$1568.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$898.loc) {
                node$1568.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1568 = delegate$892.postProcess(node$1568);
            }
        },
        apply: function (node$1569) {
            var nodeType$1570 = typeof node$1569;
            assert$899(nodeType$1570 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1570);
            if (extra$898.range) {
                node$1569.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$898.loc) {
                node$1569.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1569 = delegate$892.postProcess(node$1569);
            }
        }
    };
    function createLocationMarker$1033() {
        return new LocationMarker$1032();
    }
    function trackGroupExpression$1034() {
        var marker$1571, expr$1572;
        marker$1571 = createLocationMarker$1033();
        expect$936('(');
        ++state$897.parenthesizedCount;
        expr$1572 = parseExpression$973();
        expect$936(')');
        marker$1571.end();
        marker$1571.applyGroup(expr$1572);
        return expr$1572;
    }
    function trackLeftHandSideExpression$1035() {
        var marker$1573, expr$1574;
        // skipComment();
        marker$1573 = createLocationMarker$1033();
        expr$1574 = matchKeyword$939('new') ? parseNewExpression$960() : parsePrimaryExpression$954();
        while (match$938('.') || match$938('[') || lookahead$895.type === Token$873.Template) {
            if (match$938('[')) {
                expr$1574 = delegate$892.createMemberExpression('[', expr$1574, parseComputedMember$959());
                marker$1573.end();
                marker$1573.apply(expr$1574);
            } else if (match$938('.')) {
                expr$1574 = delegate$892.createMemberExpression('.', expr$1574, parseNonComputedMember$958());
                marker$1573.end();
                marker$1573.apply(expr$1574);
            } else {
                expr$1574 = delegate$892.createTaggedTemplateExpression(expr$1574, parseTemplateLiteral$952());
                marker$1573.end();
                marker$1573.apply(expr$1574);
            }
        }
        return expr$1574;
    }
    function trackLeftHandSideExpressionAllowCall$1036() {
        var marker$1575, expr$1576, args$1577;
        // skipComment();
        marker$1575 = createLocationMarker$1033();
        expr$1576 = matchKeyword$939('new') ? parseNewExpression$960() : parsePrimaryExpression$954();
        while (match$938('.') || match$938('[') || match$938('(') || lookahead$895.type === Token$873.Template) {
            if (match$938('(')) {
                args$1577 = parseArguments$955();
                expr$1576 = delegate$892.createCallExpression(expr$1576, args$1577);
                marker$1575.end();
                marker$1575.apply(expr$1576);
            } else if (match$938('[')) {
                expr$1576 = delegate$892.createMemberExpression('[', expr$1576, parseComputedMember$959());
                marker$1575.end();
                marker$1575.apply(expr$1576);
            } else if (match$938('.')) {
                expr$1576 = delegate$892.createMemberExpression('.', expr$1576, parseNonComputedMember$958());
                marker$1575.end();
                marker$1575.apply(expr$1576);
            } else {
                expr$1576 = delegate$892.createTaggedTemplateExpression(expr$1576, parseTemplateLiteral$952());
                marker$1575.end();
                marker$1575.apply(expr$1576);
            }
        }
        return expr$1576;
    }
    function filterGroup$1037(node$1578) {
        var n$1579, i$1580, entry$1581;
        n$1579 = Object.prototype.toString.apply(node$1578) === '[object Array]' ? [] : {};
        for (i$1580 in node$1578) {
            if (node$1578.hasOwnProperty(i$1580) && i$1580 !== 'groupRange' && i$1580 !== 'groupLoc') {
                entry$1581 = node$1578[i$1580];
                if (entry$1581 === null || typeof entry$1581 !== 'object' || entry$1581 instanceof RegExp) {
                    n$1579[i$1580] = entry$1581;
                } else {
                    n$1579[i$1580] = filterGroup$1037(entry$1581);
                }
            }
        }
        return n$1579;
    }
    function wrapTrackingFunction$1038(range$1582, loc$1583) {
        return function (parseFunction$1584) {
            function isBinary$1585(node$1587) {
                return node$1587.type === Syntax$876.LogicalExpression || node$1587.type === Syntax$876.BinaryExpression;
            }
            function visit$1586(node$1588) {
                var start$1589, end$1590;
                if (isBinary$1585(node$1588.left)) {
                    visit$1586(node$1588.left);
                }
                if (isBinary$1585(node$1588.right)) {
                    visit$1586(node$1588.right);
                }
                if (range$1582) {
                    if (node$1588.left.groupRange || node$1588.right.groupRange) {
                        start$1589 = node$1588.left.groupRange ? node$1588.left.groupRange[0] : node$1588.left.range[0];
                        end$1590 = node$1588.right.groupRange ? node$1588.right.groupRange[1] : node$1588.right.range[1];
                        node$1588.range = [
                            start$1589,
                            end$1590
                        ];
                    } else if (typeof node$1588.range === 'undefined') {
                        start$1589 = node$1588.left.range[0];
                        end$1590 = node$1588.right.range[1];
                        node$1588.range = [
                            start$1589,
                            end$1590
                        ];
                    }
                }
                if (loc$1583) {
                    if (node$1588.left.groupLoc || node$1588.right.groupLoc) {
                        start$1589 = node$1588.left.groupLoc ? node$1588.left.groupLoc.start : node$1588.left.loc.start;
                        end$1590 = node$1588.right.groupLoc ? node$1588.right.groupLoc.end : node$1588.right.loc.end;
                        node$1588.loc = {
                            start: start$1589,
                            end: end$1590
                        };
                        node$1588 = delegate$892.postProcess(node$1588);
                    } else if (typeof node$1588.loc === 'undefined') {
                        node$1588.loc = {
                            start: node$1588.left.loc.start,
                            end: node$1588.right.loc.end
                        };
                        node$1588 = delegate$892.postProcess(node$1588);
                    }
                }
            }
            return function () {
                var marker$1591, node$1592, curr$1593 = lookahead$895;
                marker$1591 = createLocationMarker$1033();
                node$1592 = parseFunction$1584.apply(null, arguments);
                marker$1591.end();
                if (node$1592.type !== Syntax$876.Program) {
                    if (curr$1593.leadingComments) {
                        node$1592.leadingComments = curr$1593.leadingComments;
                    }
                    if (curr$1593.trailingComments) {
                        node$1592.trailingComments = curr$1593.trailingComments;
                    }
                }
                if (range$1582 && typeof node$1592.range === 'undefined') {
                    marker$1591.apply(node$1592);
                }
                if (loc$1583 && typeof node$1592.loc === 'undefined') {
                    marker$1591.apply(node$1592);
                }
                if (isBinary$1585(node$1592)) {
                    visit$1586(node$1592);
                }
                return node$1592;
            };
        };
    }
    function patch$1039() {
        var wrapTracking$1594;
        if (extra$898.comments) {
            extra$898.skipComment = skipComment$912;
            skipComment$912 = scanComment$1027;
        }
        if (extra$898.range || extra$898.loc) {
            extra$898.parseGroupExpression = parseGroupExpression$953;
            extra$898.parseLeftHandSideExpression = parseLeftHandSideExpression$962;
            extra$898.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$961;
            parseGroupExpression$953 = trackGroupExpression$1034;
            parseLeftHandSideExpression$962 = trackLeftHandSideExpression$1035;
            parseLeftHandSideExpressionAllowCall$961 = trackLeftHandSideExpressionAllowCall$1036;
            wrapTracking$1594 = wrapTrackingFunction$1038(extra$898.range, extra$898.loc);
            extra$898.parseArrayInitialiser = parseArrayInitialiser$945;
            extra$898.parseAssignmentExpression = parseAssignmentExpression$972;
            extra$898.parseBinaryExpression = parseBinaryExpression$966;
            extra$898.parseBlock = parseBlock$975;
            extra$898.parseFunctionSourceElements = parseFunctionSourceElements$1006;
            extra$898.parseCatchClause = parseCatchClause$1001;
            extra$898.parseComputedMember = parseComputedMember$959;
            extra$898.parseConditionalExpression = parseConditionalExpression$967;
            extra$898.parseConstLetDeclaration = parseConstLetDeclaration$980;
            extra$898.parseExportBatchSpecifier = parseExportBatchSpecifier$982;
            extra$898.parseExportDeclaration = parseExportDeclaration$984;
            extra$898.parseExportSpecifier = parseExportSpecifier$983;
            extra$898.parseExpression = parseExpression$973;
            extra$898.parseForVariableDeclaration = parseForVariableDeclaration$992;
            extra$898.parseFunctionDeclaration = parseFunctionDeclaration$1010;
            extra$898.parseFunctionExpression = parseFunctionExpression$1011;
            extra$898.parseParams = parseParams$1009;
            extra$898.parseImportDeclaration = parseImportDeclaration$985;
            extra$898.parseImportSpecifier = parseImportSpecifier$986;
            extra$898.parseModuleDeclaration = parseModuleDeclaration$981;
            extra$898.parseModuleBlock = parseModuleBlock$1024;
            extra$898.parseNewExpression = parseNewExpression$960;
            extra$898.parseNonComputedProperty = parseNonComputedProperty$957;
            extra$898.parseObjectInitialiser = parseObjectInitialiser$950;
            extra$898.parseObjectProperty = parseObjectProperty$949;
            extra$898.parseObjectPropertyKey = parseObjectPropertyKey$948;
            extra$898.parsePostfixExpression = parsePostfixExpression$963;
            extra$898.parsePrimaryExpression = parsePrimaryExpression$954;
            extra$898.parseProgram = parseProgram$1025;
            extra$898.parsePropertyFunction = parsePropertyFunction$946;
            extra$898.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$956;
            extra$898.parseTemplateElement = parseTemplateElement$951;
            extra$898.parseTemplateLiteral = parseTemplateLiteral$952;
            extra$898.parseStatement = parseStatement$1004;
            extra$898.parseSwitchCase = parseSwitchCase$998;
            extra$898.parseUnaryExpression = parseUnaryExpression$964;
            extra$898.parseVariableDeclaration = parseVariableDeclaration$977;
            extra$898.parseVariableIdentifier = parseVariableIdentifier$976;
            extra$898.parseMethodDefinition = parseMethodDefinition$1013;
            extra$898.parseClassDeclaration = parseClassDeclaration$1017;
            extra$898.parseClassExpression = parseClassExpression$1016;
            extra$898.parseClassBody = parseClassBody$1015;
            parseArrayInitialiser$945 = wrapTracking$1594(extra$898.parseArrayInitialiser);
            parseAssignmentExpression$972 = wrapTracking$1594(extra$898.parseAssignmentExpression);
            parseBinaryExpression$966 = wrapTracking$1594(extra$898.parseBinaryExpression);
            parseBlock$975 = wrapTracking$1594(extra$898.parseBlock);
            parseFunctionSourceElements$1006 = wrapTracking$1594(extra$898.parseFunctionSourceElements);
            parseCatchClause$1001 = wrapTracking$1594(extra$898.parseCatchClause);
            parseComputedMember$959 = wrapTracking$1594(extra$898.parseComputedMember);
            parseConditionalExpression$967 = wrapTracking$1594(extra$898.parseConditionalExpression);
            parseConstLetDeclaration$980 = wrapTracking$1594(extra$898.parseConstLetDeclaration);
            parseExportBatchSpecifier$982 = wrapTracking$1594(parseExportBatchSpecifier$982);
            parseExportDeclaration$984 = wrapTracking$1594(parseExportDeclaration$984);
            parseExportSpecifier$983 = wrapTracking$1594(parseExportSpecifier$983);
            parseExpression$973 = wrapTracking$1594(extra$898.parseExpression);
            parseForVariableDeclaration$992 = wrapTracking$1594(extra$898.parseForVariableDeclaration);
            parseFunctionDeclaration$1010 = wrapTracking$1594(extra$898.parseFunctionDeclaration);
            parseFunctionExpression$1011 = wrapTracking$1594(extra$898.parseFunctionExpression);
            parseParams$1009 = wrapTracking$1594(extra$898.parseParams);
            parseImportDeclaration$985 = wrapTracking$1594(extra$898.parseImportDeclaration);
            parseImportSpecifier$986 = wrapTracking$1594(extra$898.parseImportSpecifier);
            parseModuleDeclaration$981 = wrapTracking$1594(extra$898.parseModuleDeclaration);
            parseModuleBlock$1024 = wrapTracking$1594(extra$898.parseModuleBlock);
            parseLeftHandSideExpression$962 = wrapTracking$1594(parseLeftHandSideExpression$962);
            parseNewExpression$960 = wrapTracking$1594(extra$898.parseNewExpression);
            parseNonComputedProperty$957 = wrapTracking$1594(extra$898.parseNonComputedProperty);
            parseObjectInitialiser$950 = wrapTracking$1594(extra$898.parseObjectInitialiser);
            parseObjectProperty$949 = wrapTracking$1594(extra$898.parseObjectProperty);
            parseObjectPropertyKey$948 = wrapTracking$1594(extra$898.parseObjectPropertyKey);
            parsePostfixExpression$963 = wrapTracking$1594(extra$898.parsePostfixExpression);
            parsePrimaryExpression$954 = wrapTracking$1594(extra$898.parsePrimaryExpression);
            parseProgram$1025 = wrapTracking$1594(extra$898.parseProgram);
            parsePropertyFunction$946 = wrapTracking$1594(extra$898.parsePropertyFunction);
            parseTemplateElement$951 = wrapTracking$1594(extra$898.parseTemplateElement);
            parseTemplateLiteral$952 = wrapTracking$1594(extra$898.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$956 = wrapTracking$1594(extra$898.parseSpreadOrAssignmentExpression);
            parseStatement$1004 = wrapTracking$1594(extra$898.parseStatement);
            parseSwitchCase$998 = wrapTracking$1594(extra$898.parseSwitchCase);
            parseUnaryExpression$964 = wrapTracking$1594(extra$898.parseUnaryExpression);
            parseVariableDeclaration$977 = wrapTracking$1594(extra$898.parseVariableDeclaration);
            parseVariableIdentifier$976 = wrapTracking$1594(extra$898.parseVariableIdentifier);
            parseMethodDefinition$1013 = wrapTracking$1594(extra$898.parseMethodDefinition);
            parseClassDeclaration$1017 = wrapTracking$1594(extra$898.parseClassDeclaration);
            parseClassExpression$1016 = wrapTracking$1594(extra$898.parseClassExpression);
            parseClassBody$1015 = wrapTracking$1594(extra$898.parseClassBody);
        }
        if (typeof extra$898.tokens !== 'undefined') {
            extra$898.advance = advance$928;
            extra$898.scanRegExp = scanRegExp$925;
            advance$928 = collectToken$1029;
            scanRegExp$925 = collectRegex$1030;
        }
    }
    function unpatch$1040() {
        if (typeof extra$898.skipComment === 'function') {
            skipComment$912 = extra$898.skipComment;
        }
        if (extra$898.range || extra$898.loc) {
            parseArrayInitialiser$945 = extra$898.parseArrayInitialiser;
            parseAssignmentExpression$972 = extra$898.parseAssignmentExpression;
            parseBinaryExpression$966 = extra$898.parseBinaryExpression;
            parseBlock$975 = extra$898.parseBlock;
            parseFunctionSourceElements$1006 = extra$898.parseFunctionSourceElements;
            parseCatchClause$1001 = extra$898.parseCatchClause;
            parseComputedMember$959 = extra$898.parseComputedMember;
            parseConditionalExpression$967 = extra$898.parseConditionalExpression;
            parseConstLetDeclaration$980 = extra$898.parseConstLetDeclaration;
            parseExportBatchSpecifier$982 = extra$898.parseExportBatchSpecifier;
            parseExportDeclaration$984 = extra$898.parseExportDeclaration;
            parseExportSpecifier$983 = extra$898.parseExportSpecifier;
            parseExpression$973 = extra$898.parseExpression;
            parseForVariableDeclaration$992 = extra$898.parseForVariableDeclaration;
            parseFunctionDeclaration$1010 = extra$898.parseFunctionDeclaration;
            parseFunctionExpression$1011 = extra$898.parseFunctionExpression;
            parseImportDeclaration$985 = extra$898.parseImportDeclaration;
            parseImportSpecifier$986 = extra$898.parseImportSpecifier;
            parseGroupExpression$953 = extra$898.parseGroupExpression;
            parseLeftHandSideExpression$962 = extra$898.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$961 = extra$898.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$981 = extra$898.parseModuleDeclaration;
            parseModuleBlock$1024 = extra$898.parseModuleBlock;
            parseNewExpression$960 = extra$898.parseNewExpression;
            parseNonComputedProperty$957 = extra$898.parseNonComputedProperty;
            parseObjectInitialiser$950 = extra$898.parseObjectInitialiser;
            parseObjectProperty$949 = extra$898.parseObjectProperty;
            parseObjectPropertyKey$948 = extra$898.parseObjectPropertyKey;
            parsePostfixExpression$963 = extra$898.parsePostfixExpression;
            parsePrimaryExpression$954 = extra$898.parsePrimaryExpression;
            parseProgram$1025 = extra$898.parseProgram;
            parsePropertyFunction$946 = extra$898.parsePropertyFunction;
            parseTemplateElement$951 = extra$898.parseTemplateElement;
            parseTemplateLiteral$952 = extra$898.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$956 = extra$898.parseSpreadOrAssignmentExpression;
            parseStatement$1004 = extra$898.parseStatement;
            parseSwitchCase$998 = extra$898.parseSwitchCase;
            parseUnaryExpression$964 = extra$898.parseUnaryExpression;
            parseVariableDeclaration$977 = extra$898.parseVariableDeclaration;
            parseVariableIdentifier$976 = extra$898.parseVariableIdentifier;
            parseMethodDefinition$1013 = extra$898.parseMethodDefinition;
            parseClassDeclaration$1017 = extra$898.parseClassDeclaration;
            parseClassExpression$1016 = extra$898.parseClassExpression;
            parseClassBody$1015 = extra$898.parseClassBody;
        }
        if (typeof extra$898.scanRegExp === 'function') {
            advance$928 = extra$898.advance;
            scanRegExp$925 = extra$898.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1041(object$1595, properties$1596) {
        var entry$1597, result$1598 = {};
        for (entry$1597 in object$1595) {
            if (object$1595.hasOwnProperty(entry$1597)) {
                result$1598[entry$1597] = object$1595[entry$1597];
            }
        }
        for (entry$1597 in properties$1596) {
            if (properties$1596.hasOwnProperty(entry$1597)) {
                result$1598[entry$1597] = properties$1596[entry$1597];
            }
        }
        return result$1598;
    }
    function tokenize$1042(code$1599, options$1600) {
        var toString$1601, token$1602, tokens$1603;
        toString$1601 = String;
        if (typeof code$1599 !== 'string' && !(code$1599 instanceof String)) {
            code$1599 = toString$1601(code$1599);
        }
        delegate$892 = SyntaxTreeDelegate$880;
        source$882 = code$1599;
        index$884 = 0;
        lineNumber$885 = source$882.length > 0 ? 1 : 0;
        lineStart$886 = 0;
        length$891 = source$882.length;
        lookahead$895 = null;
        state$897 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$898 = {};
        // Options matching.
        options$1600 = options$1600 || {};
        // Of course we collect tokens here.
        options$1600.tokens = true;
        extra$898.tokens = [];
        extra$898.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$898.openParenToken = -1;
        extra$898.openCurlyToken = -1;
        extra$898.range = typeof options$1600.range === 'boolean' && options$1600.range;
        extra$898.loc = typeof options$1600.loc === 'boolean' && options$1600.loc;
        if (typeof options$1600.comment === 'boolean' && options$1600.comment) {
            extra$898.comments = [];
        }
        if (typeof options$1600.tolerant === 'boolean' && options$1600.tolerant) {
            extra$898.errors = [];
        }
        if (length$891 > 0) {
            if (typeof source$882[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1599 instanceof String) {
                    source$882 = code$1599.valueOf();
                }
            }
        }
        patch$1039();
        try {
            peek$930();
            if (lookahead$895.type === Token$873.EOF) {
                return extra$898.tokens;
            }
            token$1602 = lex$929();
            while (lookahead$895.type !== Token$873.EOF) {
                try {
                    token$1602 = lex$929();
                } catch (lexError$1604) {
                    token$1602 = lookahead$895;
                    if (extra$898.errors) {
                        extra$898.errors.push(lexError$1604);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1604;
                    }
                }
            }
            filterTokenLocation$1031();
            tokens$1603 = extra$898.tokens;
            if (typeof extra$898.comments !== 'undefined') {
                filterCommentLocation$1028();
                tokens$1603.comments = extra$898.comments;
            }
            if (typeof extra$898.errors !== 'undefined') {
                tokens$1603.errors = extra$898.errors;
            }
        } catch (e$1605) {
            throw e$1605;
        } finally {
            unpatch$1040();
            extra$898 = {};
        }
        return tokens$1603;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1043(toks$1606, start$1607, inExprDelim$1608, parentIsBlock$1609) {
        var assignOps$1610 = [
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
        var binaryOps$1611 = [
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
        var unaryOps$1612 = [
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
        function back$1613(n$1614) {
            var idx$1615 = toks$1606.length - n$1614 > 0 ? toks$1606.length - n$1614 : 0;
            return toks$1606[idx$1615];
        }
        if (inExprDelim$1608 && toks$1606.length - (start$1607 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1613(start$1607 + 2).value === ':' && parentIsBlock$1609) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$900(back$1613(start$1607 + 2).value, unaryOps$1612.concat(binaryOps$1611).concat(assignOps$1610))) {
            // ... + {...}
            return false;
        } else if (back$1613(start$1607 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1616 = typeof back$1613(start$1607 + 1).startLineNumber !== 'undefined' ? back$1613(start$1607 + 1).startLineNumber : back$1613(start$1607 + 1).lineNumber;
            if (back$1613(start$1607 + 2).lineNumber !== currLineNumber$1616) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$900(back$1613(start$1607 + 2).value, [
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
    function readToken$1044(toks$1617, inExprDelim$1618, parentIsBlock$1619) {
        var delimiters$1620 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1621 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1622 = toks$1617.length - 1;
        var comments$1623, commentsLen$1624 = extra$898.comments.length;
        function back$1625(n$1629) {
            var idx$1630 = toks$1617.length - n$1629 > 0 ? toks$1617.length - n$1629 : 0;
            return toks$1617[idx$1630];
        }
        function attachComments$1626(token$1631) {
            if (comments$1623) {
                token$1631.leadingComments = comments$1623;
            }
            return token$1631;
        }
        function _advance$1627() {
            return attachComments$1626(advance$928());
        }
        function _scanRegExp$1628() {
            return attachComments$1626(scanRegExp$925());
        }
        skipComment$912();
        if (extra$898.comments.length > commentsLen$1624) {
            comments$1623 = extra$898.comments.slice(commentsLen$1624);
        }
        if (isIn$900(source$882[index$884], delimiters$1620)) {
            return attachComments$1626(readDelim$1045(toks$1617, inExprDelim$1618, parentIsBlock$1619));
        }
        if (source$882[index$884] === '/') {
            var prev$1632 = back$1625(1);
            if (prev$1632) {
                if (prev$1632.value === '()') {
                    if (isIn$900(back$1625(2).value, parenIdents$1621)) {
                        // ... if (...) / ...
                        return _scanRegExp$1628();
                    }
                    // ... (...) / ...
                    return _advance$1627();
                }
                if (prev$1632.value === '{}') {
                    if (blockAllowed$1043(toks$1617, 0, inExprDelim$1618, parentIsBlock$1619)) {
                        if (back$1625(2).value === '()') {
                            // named function
                            if (back$1625(4).value === 'function') {
                                if (!blockAllowed$1043(toks$1617, 3, inExprDelim$1618, parentIsBlock$1619)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1627();
                                }
                                if (toks$1617.length - 5 <= 0 && inExprDelim$1618) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1627();
                                }
                            }
                            // unnamed function
                            if (back$1625(3).value === 'function') {
                                if (!blockAllowed$1043(toks$1617, 2, inExprDelim$1618, parentIsBlock$1619)) {
                                    // new function (...) {...} / ...
                                    return _advance$1627();
                                }
                                if (toks$1617.length - 4 <= 0 && inExprDelim$1618) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1627();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1628();
                    } else {
                        // ... + {...} / ...
                        return _advance$1627();
                    }
                }
                if (prev$1632.type === Token$873.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1628();
                }
                if (isKeyword$911(prev$1632.value)) {
                    // typeof /...
                    return _scanRegExp$1628();
                }
                return _advance$1627();
            }
            return _scanRegExp$1628();
        }
        return _advance$1627();
    }
    function readDelim$1045(toks$1633, inExprDelim$1634, parentIsBlock$1635) {
        var startDelim$1636 = advance$928(), matchDelim$1637 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1638 = [];
        var delimiters$1639 = [
                '(',
                '{',
                '['
            ];
        assert$899(delimiters$1639.indexOf(startDelim$1636.value) !== -1, 'Need to begin at the delimiter');
        var token$1640 = startDelim$1636;
        var startLineNumber$1641 = token$1640.lineNumber;
        var startLineStart$1642 = token$1640.lineStart;
        var startRange$1643 = token$1640.range;
        var delimToken$1644 = {};
        delimToken$1644.type = Token$873.Delimiter;
        delimToken$1644.value = startDelim$1636.value + matchDelim$1637[startDelim$1636.value];
        delimToken$1644.startLineNumber = startLineNumber$1641;
        delimToken$1644.startLineStart = startLineStart$1642;
        delimToken$1644.startRange = startRange$1643;
        var delimIsBlock$1645 = false;
        if (startDelim$1636.value === '{') {
            delimIsBlock$1645 = blockAllowed$1043(toks$1633.concat(delimToken$1644), 0, inExprDelim$1634, parentIsBlock$1635);
        }
        while (index$884 <= length$891) {
            token$1640 = readToken$1044(inner$1638, startDelim$1636.value === '(' || startDelim$1636.value === '[', delimIsBlock$1645);
            if (token$1640.type === Token$873.Punctuator && token$1640.value === matchDelim$1637[startDelim$1636.value]) {
                if (token$1640.leadingComments) {
                    delimToken$1644.trailingComments = token$1640.leadingComments;
                }
                break;
            } else if (token$1640.type === Token$873.EOF) {
                throwError$933({}, Messages$878.UnexpectedEOS);
            } else {
                inner$1638.push(token$1640);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$884 >= length$891 && matchDelim$1637[startDelim$1636.value] !== source$882[length$891 - 1]) {
            throwError$933({}, Messages$878.UnexpectedEOS);
        }
        var endLineNumber$1646 = token$1640.lineNumber;
        var endLineStart$1647 = token$1640.lineStart;
        var endRange$1648 = token$1640.range;
        delimToken$1644.inner = inner$1638;
        delimToken$1644.endLineNumber = endLineNumber$1646;
        delimToken$1644.endLineStart = endLineStart$1647;
        delimToken$1644.endRange = endRange$1648;
        return delimToken$1644;
    }
    // (Str) -> [...CSyntax]
    function read$1046(code$1649) {
        var token$1650, tokenTree$1651 = [];
        extra$898 = {};
        extra$898.comments = [];
        patch$1039();
        source$882 = code$1649;
        index$884 = 0;
        lineNumber$885 = source$882.length > 0 ? 1 : 0;
        lineStart$886 = 0;
        length$891 = source$882.length;
        state$897 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$884 < length$891) {
            tokenTree$1651.push(readToken$1044(tokenTree$1651, false, false));
        }
        var last$1652 = tokenTree$1651[tokenTree$1651.length - 1];
        if (last$1652 && last$1652.type !== Token$873.EOF) {
            tokenTree$1651.push({
                type: Token$873.EOF,
                value: '',
                lineNumber: last$1652.lineNumber,
                lineStart: last$1652.lineStart,
                range: [
                    index$884,
                    index$884
                ]
            });
        }
        return expander$872.tokensToSyntax(tokenTree$1651);
    }
    function parse$1047(code$1653, options$1654) {
        var program$1655, toString$1656;
        extra$898 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1653)) {
            tokenStream$893 = code$1653;
            length$891 = tokenStream$893.length;
            lineNumber$885 = tokenStream$893.length > 0 ? 1 : 0;
            source$882 = undefined;
        } else {
            toString$1656 = String;
            if (typeof code$1653 !== 'string' && !(code$1653 instanceof String)) {
                code$1653 = toString$1656(code$1653);
            }
            source$882 = code$1653;
            length$891 = source$882.length;
            lineNumber$885 = source$882.length > 0 ? 1 : 0;
        }
        delegate$892 = SyntaxTreeDelegate$880;
        streamIndex$894 = -1;
        index$884 = 0;
        lineStart$886 = 0;
        sm_lineStart$888 = 0;
        sm_lineNumber$887 = lineNumber$885;
        sm_index$890 = 0;
        sm_range$889 = [
            0,
            0
        ];
        lookahead$895 = null;
        state$897 = {
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
        if (typeof options$1654 !== 'undefined') {
            extra$898.range = typeof options$1654.range === 'boolean' && options$1654.range;
            extra$898.loc = typeof options$1654.loc === 'boolean' && options$1654.loc;
            if (extra$898.loc && options$1654.source !== null && options$1654.source !== undefined) {
                delegate$892 = extend$1041(delegate$892, {
                    'postProcess': function (node$1657) {
                        node$1657.loc.source = toString$1656(options$1654.source);
                        return node$1657;
                    }
                });
            }
            if (typeof options$1654.tokens === 'boolean' && options$1654.tokens) {
                extra$898.tokens = [];
            }
            if (typeof options$1654.comment === 'boolean' && options$1654.comment) {
                extra$898.comments = [];
            }
            if (typeof options$1654.tolerant === 'boolean' && options$1654.tolerant) {
                extra$898.errors = [];
            }
        }
        if (length$891 > 0) {
            if (source$882 && typeof source$882[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1653 instanceof String) {
                    source$882 = code$1653.valueOf();
                }
            }
        }
        extra$898 = {
            loc: true,
            errors: []
        };
        patch$1039();
        try {
            program$1655 = parseProgram$1025();
            if (typeof extra$898.comments !== 'undefined') {
                filterCommentLocation$1028();
                program$1655.comments = extra$898.comments;
            }
            if (typeof extra$898.tokens !== 'undefined') {
                filterTokenLocation$1031();
                program$1655.tokens = extra$898.tokens;
            }
            if (typeof extra$898.errors !== 'undefined') {
                program$1655.errors = extra$898.errors;
            }
            if (extra$898.range || extra$898.loc) {
                program$1655.body = filterGroup$1037(program$1655.body);
            }
        } catch (e$1658) {
            throw e$1658;
        } finally {
            unpatch$1040();
            extra$898 = {};
        }
        return program$1655;
    }
    exports$871.tokenize = tokenize$1042;
    exports$871.read = read$1046;
    exports$871.Token = Token$873;
    exports$871.parse = parse$1047;
    // Deep copy.
    exports$871.Syntax = function () {
        var name$1659, types$1660 = {};
        if (typeof Object.create === 'function') {
            types$1660 = Object.create(null);
        }
        for (name$1659 in Syntax$876) {
            if (Syntax$876.hasOwnProperty(name$1659)) {
                types$1660[name$1659] = Syntax$876[name$1659];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1660);
        }
        return types$1660;
    }();
}));
//# sourceMappingURL=parser.js.map