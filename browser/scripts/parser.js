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
(function (root$825, factory$826) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$826);
    } else if (typeof exports !== 'undefined') {
        factory$826(exports, require('./expander'));
    } else {
        factory$826(root$825.esprima = {});
    }
}(this, function (exports$827, expander$828) {
    'use strict';
    var Token$829, TokenName$830, FnExprTokens$831, Syntax$832, PropertyKind$833, Messages$834, Regex$835, SyntaxTreeDelegate$836, ClassPropertyType$837, source$838, strict$839, index$840, lineNumber$841, lineStart$842, sm_lineNumber$843, sm_lineStart$844, sm_range$845, sm_index$846, length$847, delegate$848, tokenStream$849, streamIndex$850, lookahead$851, lookaheadIndex$852, state$853, extra$854;
    Token$829 = {
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
    TokenName$830 = {};
    TokenName$830[Token$829.BooleanLiteral] = 'Boolean';
    TokenName$830[Token$829.EOF] = '<end>';
    TokenName$830[Token$829.Identifier] = 'Identifier';
    TokenName$830[Token$829.Keyword] = 'Keyword';
    TokenName$830[Token$829.NullLiteral] = 'Null';
    TokenName$830[Token$829.NumericLiteral] = 'Numeric';
    TokenName$830[Token$829.Punctuator] = 'Punctuator';
    TokenName$830[Token$829.StringLiteral] = 'String';
    TokenName$830[Token$829.RegularExpression] = 'RegularExpression';
    TokenName$830[Token$829.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$831 = [
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
    Syntax$832 = {
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
    PropertyKind$833 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$837 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$834 = {
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
    Regex$835 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$855(condition$1004, message$1005) {
        if (!condition$1004) {
            throw new Error('ASSERT: ' + message$1005);
        }
    }
    function isIn$856(el$1006, list$1007) {
        return list$1007.indexOf(el$1006) !== -1;
    }
    function isDecimalDigit$857(ch$1008) {
        return ch$1008 >= 48 && ch$1008 <= 57;
    }    // 0..9
    function isHexDigit$858(ch$1009) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1009) >= 0;
    }
    function isOctalDigit$859(ch$1010) {
        return '01234567'.indexOf(ch$1010) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$860(ch$1011) {
        return ch$1011 === 32 || ch$1011 === 9 || ch$1011 === 11 || ch$1011 === 12 || ch$1011 === 160 || ch$1011 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1011)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$861(ch$1012) {
        return ch$1012 === 10 || ch$1012 === 13 || ch$1012 === 8232 || ch$1012 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$862(ch$1013) {
        return ch$1013 === 36 || ch$1013 === 95 || ch$1013 >= 65 && ch$1013 <= 90 || ch$1013 >= 97 && ch$1013 <= 122 || ch$1013 === 92 || ch$1013 >= 128 && Regex$835.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1013));
    }
    function isIdentifierPart$863(ch$1014) {
        return ch$1014 === 36 || ch$1014 === 95 || ch$1014 >= 65 && ch$1014 <= 90 || ch$1014 >= 97 && ch$1014 <= 122 || ch$1014 >= 48 && ch$1014 <= 57 || ch$1014 === 92 || ch$1014 >= 128 && Regex$835.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1014));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$864(id$1015) {
        switch (id$1015) {
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
    function isStrictModeReservedWord$865(id$1016) {
        switch (id$1016) {
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
    function isRestrictedWord$866(id$1017) {
        return id$1017 === 'eval' || id$1017 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$867(id$1018) {
        if (strict$839 && isStrictModeReservedWord$865(id$1018)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1018.length) {
        case 2:
            return id$1018 === 'if' || id$1018 === 'in' || id$1018 === 'do';
        case 3:
            return id$1018 === 'var' || id$1018 === 'for' || id$1018 === 'new' || id$1018 === 'try' || id$1018 === 'let';
        case 4:
            return id$1018 === 'this' || id$1018 === 'else' || id$1018 === 'case' || id$1018 === 'void' || id$1018 === 'with' || id$1018 === 'enum';
        case 5:
            return id$1018 === 'while' || id$1018 === 'break' || id$1018 === 'catch' || id$1018 === 'throw' || id$1018 === 'const' || id$1018 === 'yield' || id$1018 === 'class' || id$1018 === 'super';
        case 6:
            return id$1018 === 'return' || id$1018 === 'typeof' || id$1018 === 'delete' || id$1018 === 'switch' || id$1018 === 'export' || id$1018 === 'import';
        case 7:
            return id$1018 === 'default' || id$1018 === 'finally' || id$1018 === 'extends';
        case 8:
            return id$1018 === 'function' || id$1018 === 'continue' || id$1018 === 'debugger';
        case 10:
            return id$1018 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$868() {
        var ch$1019, blockComment$1020, lineComment$1021;
        blockComment$1020 = false;
        lineComment$1021 = false;
        while (index$840 < length$847) {
            ch$1019 = source$838.charCodeAt(index$840);
            if (lineComment$1021) {
                ++index$840;
                if (isLineTerminator$861(ch$1019)) {
                    lineComment$1021 = false;
                    if (ch$1019 === 13 && source$838.charCodeAt(index$840) === 10) {
                        ++index$840;
                    }
                    ++lineNumber$841;
                    lineStart$842 = index$840;
                }
            } else if (blockComment$1020) {
                if (isLineTerminator$861(ch$1019)) {
                    if (ch$1019 === 13 && source$838.charCodeAt(index$840 + 1) === 10) {
                        ++index$840;
                    }
                    ++lineNumber$841;
                    ++index$840;
                    lineStart$842 = index$840;
                    if (index$840 >= length$847) {
                        throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1019 = source$838.charCodeAt(index$840++);
                    if (index$840 >= length$847) {
                        throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1019 === 42) {
                        ch$1019 = source$838.charCodeAt(index$840);
                        if (ch$1019 === 47) {
                            ++index$840;
                            blockComment$1020 = false;
                        }
                    }
                }
            } else if (ch$1019 === 47) {
                ch$1019 = source$838.charCodeAt(index$840 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1019 === 47) {
                    index$840 += 2;
                    lineComment$1021 = true;
                } else if (ch$1019 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$840 += 2;
                    blockComment$1020 = true;
                    if (index$840 >= length$847) {
                        throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$860(ch$1019)) {
                ++index$840;
            } else if (isLineTerminator$861(ch$1019)) {
                ++index$840;
                if (ch$1019 === 13 && source$838.charCodeAt(index$840) === 10) {
                    ++index$840;
                }
                ++lineNumber$841;
                lineStart$842 = index$840;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$869(prefix$1022) {
        var i$1023, len$1024, ch$1025, code$1026 = 0;
        len$1024 = prefix$1022 === 'u' ? 4 : 2;
        for (i$1023 = 0; i$1023 < len$1024; ++i$1023) {
            if (index$840 < length$847 && isHexDigit$858(source$838[index$840])) {
                ch$1025 = source$838[index$840++];
                code$1026 = code$1026 * 16 + '0123456789abcdef'.indexOf(ch$1025.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1026);
    }
    function scanUnicodeCodePointEscape$870() {
        var ch$1027, code$1028, cu1$1029, cu2$1030;
        ch$1027 = source$838[index$840];
        code$1028 = 0;
        // At least, one hex digit is required.
        if (ch$1027 === '}') {
            throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
        }
        while (index$840 < length$847) {
            ch$1027 = source$838[index$840++];
            if (!isHexDigit$858(ch$1027)) {
                break;
            }
            code$1028 = code$1028 * 16 + '0123456789abcdef'.indexOf(ch$1027.toLowerCase());
        }
        if (code$1028 > 1114111 || ch$1027 !== '}') {
            throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1028 <= 65535) {
            return String.fromCharCode(code$1028);
        }
        cu1$1029 = (code$1028 - 65536 >> 10) + 55296;
        cu2$1030 = (code$1028 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1029, cu2$1030);
    }
    function getEscapedIdentifier$871() {
        var ch$1031, id$1032;
        ch$1031 = source$838.charCodeAt(index$840++);
        id$1032 = String.fromCharCode(ch$1031);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1031 === 92) {
            if (source$838.charCodeAt(index$840) !== 117) {
                throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
            }
            ++index$840;
            ch$1031 = scanHexEscape$869('u');
            if (!ch$1031 || ch$1031 === '\\' || !isIdentifierStart$862(ch$1031.charCodeAt(0))) {
                throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
            }
            id$1032 = ch$1031;
        }
        while (index$840 < length$847) {
            ch$1031 = source$838.charCodeAt(index$840);
            if (!isIdentifierPart$863(ch$1031)) {
                break;
            }
            ++index$840;
            id$1032 += String.fromCharCode(ch$1031);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1031 === 92) {
                id$1032 = id$1032.substr(0, id$1032.length - 1);
                if (source$838.charCodeAt(index$840) !== 117) {
                    throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
                }
                ++index$840;
                ch$1031 = scanHexEscape$869('u');
                if (!ch$1031 || ch$1031 === '\\' || !isIdentifierPart$863(ch$1031.charCodeAt(0))) {
                    throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
                }
                id$1032 += ch$1031;
            }
        }
        return id$1032;
    }
    function getIdentifier$872() {
        var start$1033, ch$1034;
        start$1033 = index$840++;
        while (index$840 < length$847) {
            ch$1034 = source$838.charCodeAt(index$840);
            if (ch$1034 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$840 = start$1033;
                return getEscapedIdentifier$871();
            }
            if (isIdentifierPart$863(ch$1034)) {
                ++index$840;
            } else {
                break;
            }
        }
        return source$838.slice(start$1033, index$840);
    }
    function scanIdentifier$873() {
        var start$1035, id$1036, type$1037;
        start$1035 = index$840;
        // Backslash (char #92) starts an escaped character.
        id$1036 = source$838.charCodeAt(index$840) === 92 ? getEscapedIdentifier$871() : getIdentifier$872();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1036.length === 1) {
            type$1037 = Token$829.Identifier;
        } else if (isKeyword$867(id$1036)) {
            type$1037 = Token$829.Keyword;
        } else if (id$1036 === 'null') {
            type$1037 = Token$829.NullLiteral;
        } else if (id$1036 === 'true' || id$1036 === 'false') {
            type$1037 = Token$829.BooleanLiteral;
        } else {
            type$1037 = Token$829.Identifier;
        }
        return {
            type: type$1037,
            value: id$1036,
            lineNumber: lineNumber$841,
            lineStart: lineStart$842,
            range: [
                start$1035,
                index$840
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$874() {
        var start$1038 = index$840, code$1039 = source$838.charCodeAt(index$840), code2$1040, ch1$1041 = source$838[index$840], ch2$1042, ch3$1043, ch4$1044;
        switch (code$1039) {
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
            ++index$840;
            if (extra$854.tokenize) {
                if (code$1039 === 40) {
                    extra$854.openParenToken = extra$854.tokens.length;
                } else if (code$1039 === 123) {
                    extra$854.openCurlyToken = extra$854.tokens.length;
                }
            }
            return {
                type: Token$829.Punctuator,
                value: String.fromCharCode(code$1039),
                lineNumber: lineNumber$841,
                lineStart: lineStart$842,
                range: [
                    start$1038,
                    index$840
                ]
            };
        default:
            code2$1040 = source$838.charCodeAt(index$840 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1040 === 61) {
                switch (code$1039) {
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
                    index$840 += 2;
                    return {
                        type: Token$829.Punctuator,
                        value: String.fromCharCode(code$1039) + String.fromCharCode(code2$1040),
                        lineNumber: lineNumber$841,
                        lineStart: lineStart$842,
                        range: [
                            start$1038,
                            index$840
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$840 += 2;
                    // !== and ===
                    if (source$838.charCodeAt(index$840) === 61) {
                        ++index$840;
                    }
                    return {
                        type: Token$829.Punctuator,
                        value: source$838.slice(start$1038, index$840),
                        lineNumber: lineNumber$841,
                        lineStart: lineStart$842,
                        range: [
                            start$1038,
                            index$840
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1042 = source$838[index$840 + 1];
        ch3$1043 = source$838[index$840 + 2];
        ch4$1044 = source$838[index$840 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1041 === '>' && ch2$1042 === '>' && ch3$1043 === '>') {
            if (ch4$1044 === '=') {
                index$840 += 4;
                return {
                    type: Token$829.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$841,
                    lineStart: lineStart$842,
                    range: [
                        start$1038,
                        index$840
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1041 === '>' && ch2$1042 === '>' && ch3$1043 === '>') {
            index$840 += 3;
            return {
                type: Token$829.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$841,
                lineStart: lineStart$842,
                range: [
                    start$1038,
                    index$840
                ]
            };
        }
        if (ch1$1041 === '<' && ch2$1042 === '<' && ch3$1043 === '=') {
            index$840 += 3;
            return {
                type: Token$829.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$841,
                lineStart: lineStart$842,
                range: [
                    start$1038,
                    index$840
                ]
            };
        }
        if (ch1$1041 === '>' && ch2$1042 === '>' && ch3$1043 === '=') {
            index$840 += 3;
            return {
                type: Token$829.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$841,
                lineStart: lineStart$842,
                range: [
                    start$1038,
                    index$840
                ]
            };
        }
        if (ch1$1041 === '.' && ch2$1042 === '.' && ch3$1043 === '.') {
            index$840 += 3;
            return {
                type: Token$829.Punctuator,
                value: '...',
                lineNumber: lineNumber$841,
                lineStart: lineStart$842,
                range: [
                    start$1038,
                    index$840
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1041 === ch2$1042 && '+-<>&|'.indexOf(ch1$1041) >= 0) {
            index$840 += 2;
            return {
                type: Token$829.Punctuator,
                value: ch1$1041 + ch2$1042,
                lineNumber: lineNumber$841,
                lineStart: lineStart$842,
                range: [
                    start$1038,
                    index$840
                ]
            };
        }
        if (ch1$1041 === '=' && ch2$1042 === '>') {
            index$840 += 2;
            return {
                type: Token$829.Punctuator,
                value: '=>',
                lineNumber: lineNumber$841,
                lineStart: lineStart$842,
                range: [
                    start$1038,
                    index$840
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1041) >= 0) {
            ++index$840;
            return {
                type: Token$829.Punctuator,
                value: ch1$1041,
                lineNumber: lineNumber$841,
                lineStart: lineStart$842,
                range: [
                    start$1038,
                    index$840
                ]
            };
        }
        if (ch1$1041 === '.') {
            ++index$840;
            return {
                type: Token$829.Punctuator,
                value: ch1$1041,
                lineNumber: lineNumber$841,
                lineStart: lineStart$842,
                range: [
                    start$1038,
                    index$840
                ]
            };
        }
        throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$875(start$1045) {
        var number$1046 = '';
        while (index$840 < length$847) {
            if (!isHexDigit$858(source$838[index$840])) {
                break;
            }
            number$1046 += source$838[index$840++];
        }
        if (number$1046.length === 0) {
            throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$862(source$838.charCodeAt(index$840))) {
            throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$829.NumericLiteral,
            value: parseInt('0x' + number$1046, 16),
            lineNumber: lineNumber$841,
            lineStart: lineStart$842,
            range: [
                start$1045,
                index$840
            ]
        };
    }
    function scanOctalLiteral$876(prefix$1047, start$1048) {
        var number$1049, octal$1050;
        if (isOctalDigit$859(prefix$1047)) {
            octal$1050 = true;
            number$1049 = '0' + source$838[index$840++];
        } else {
            octal$1050 = false;
            ++index$840;
            number$1049 = '';
        }
        while (index$840 < length$847) {
            if (!isOctalDigit$859(source$838[index$840])) {
                break;
            }
            number$1049 += source$838[index$840++];
        }
        if (!octal$1050 && number$1049.length === 0) {
            // only 0o or 0O
            throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$862(source$838.charCodeAt(index$840)) || isDecimalDigit$857(source$838.charCodeAt(index$840))) {
            throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$829.NumericLiteral,
            value: parseInt(number$1049, 8),
            octal: octal$1050,
            lineNumber: lineNumber$841,
            lineStart: lineStart$842,
            range: [
                start$1048,
                index$840
            ]
        };
    }
    function scanNumericLiteral$877() {
        var number$1051, start$1052, ch$1053, octal$1054;
        ch$1053 = source$838[index$840];
        assert$855(isDecimalDigit$857(ch$1053.charCodeAt(0)) || ch$1053 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1052 = index$840;
        number$1051 = '';
        if (ch$1053 !== '.') {
            number$1051 = source$838[index$840++];
            ch$1053 = source$838[index$840];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1051 === '0') {
                if (ch$1053 === 'x' || ch$1053 === 'X') {
                    ++index$840;
                    return scanHexLiteral$875(start$1052);
                }
                if (ch$1053 === 'b' || ch$1053 === 'B') {
                    ++index$840;
                    number$1051 = '';
                    while (index$840 < length$847) {
                        ch$1053 = source$838[index$840];
                        if (ch$1053 !== '0' && ch$1053 !== '1') {
                            break;
                        }
                        number$1051 += source$838[index$840++];
                    }
                    if (number$1051.length === 0) {
                        // only 0b or 0B
                        throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$840 < length$847) {
                        ch$1053 = source$838.charCodeAt(index$840);
                        if (isIdentifierStart$862(ch$1053) || isDecimalDigit$857(ch$1053)) {
                            throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$829.NumericLiteral,
                        value: parseInt(number$1051, 2),
                        lineNumber: lineNumber$841,
                        lineStart: lineStart$842,
                        range: [
                            start$1052,
                            index$840
                        ]
                    };
                }
                if (ch$1053 === 'o' || ch$1053 === 'O' || isOctalDigit$859(ch$1053)) {
                    return scanOctalLiteral$876(ch$1053, start$1052);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1053 && isDecimalDigit$857(ch$1053.charCodeAt(0))) {
                    throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$857(source$838.charCodeAt(index$840))) {
                number$1051 += source$838[index$840++];
            }
            ch$1053 = source$838[index$840];
        }
        if (ch$1053 === '.') {
            number$1051 += source$838[index$840++];
            while (isDecimalDigit$857(source$838.charCodeAt(index$840))) {
                number$1051 += source$838[index$840++];
            }
            ch$1053 = source$838[index$840];
        }
        if (ch$1053 === 'e' || ch$1053 === 'E') {
            number$1051 += source$838[index$840++];
            ch$1053 = source$838[index$840];
            if (ch$1053 === '+' || ch$1053 === '-') {
                number$1051 += source$838[index$840++];
            }
            if (isDecimalDigit$857(source$838.charCodeAt(index$840))) {
                while (isDecimalDigit$857(source$838.charCodeAt(index$840))) {
                    number$1051 += source$838[index$840++];
                }
            } else {
                throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$862(source$838.charCodeAt(index$840))) {
            throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$829.NumericLiteral,
            value: parseFloat(number$1051),
            lineNumber: lineNumber$841,
            lineStart: lineStart$842,
            range: [
                start$1052,
                index$840
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$878() {
        var str$1055 = '', quote$1056, start$1057, ch$1058, code$1059, unescaped$1060, restore$1061, octal$1062 = false;
        quote$1056 = source$838[index$840];
        assert$855(quote$1056 === '\'' || quote$1056 === '"', 'String literal must starts with a quote');
        start$1057 = index$840;
        ++index$840;
        while (index$840 < length$847) {
            ch$1058 = source$838[index$840++];
            if (ch$1058 === quote$1056) {
                quote$1056 = '';
                break;
            } else if (ch$1058 === '\\') {
                ch$1058 = source$838[index$840++];
                if (!ch$1058 || !isLineTerminator$861(ch$1058.charCodeAt(0))) {
                    switch (ch$1058) {
                    case 'n':
                        str$1055 += '\n';
                        break;
                    case 'r':
                        str$1055 += '\r';
                        break;
                    case 't':
                        str$1055 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$838[index$840] === '{') {
                            ++index$840;
                            str$1055 += scanUnicodeCodePointEscape$870();
                        } else {
                            restore$1061 = index$840;
                            unescaped$1060 = scanHexEscape$869(ch$1058);
                            if (unescaped$1060) {
                                str$1055 += unescaped$1060;
                            } else {
                                index$840 = restore$1061;
                                str$1055 += ch$1058;
                            }
                        }
                        break;
                    case 'b':
                        str$1055 += '\b';
                        break;
                    case 'f':
                        str$1055 += '\f';
                        break;
                    case 'v':
                        str$1055 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$859(ch$1058)) {
                            code$1059 = '01234567'.indexOf(ch$1058);
                            // \0 is not octal escape sequence
                            if (code$1059 !== 0) {
                                octal$1062 = true;
                            }
                            if (index$840 < length$847 && isOctalDigit$859(source$838[index$840])) {
                                octal$1062 = true;
                                code$1059 = code$1059 * 8 + '01234567'.indexOf(source$838[index$840++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1058) >= 0 && index$840 < length$847 && isOctalDigit$859(source$838[index$840])) {
                                    code$1059 = code$1059 * 8 + '01234567'.indexOf(source$838[index$840++]);
                                }
                            }
                            str$1055 += String.fromCharCode(code$1059);
                        } else {
                            str$1055 += ch$1058;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$841;
                    if (ch$1058 === '\r' && source$838[index$840] === '\n') {
                        ++index$840;
                    }
                }
            } else if (isLineTerminator$861(ch$1058.charCodeAt(0))) {
                break;
            } else {
                str$1055 += ch$1058;
            }
        }
        if (quote$1056 !== '') {
            throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$829.StringLiteral,
            value: str$1055,
            octal: octal$1062,
            lineNumber: lineNumber$841,
            lineStart: lineStart$842,
            range: [
                start$1057,
                index$840
            ]
        };
    }
    function scanTemplate$879() {
        var cooked$1063 = '', ch$1064, start$1065, terminated$1066, tail$1067, restore$1068, unescaped$1069, code$1070, octal$1071;
        terminated$1066 = false;
        tail$1067 = false;
        start$1065 = index$840;
        ++index$840;
        while (index$840 < length$847) {
            ch$1064 = source$838[index$840++];
            if (ch$1064 === '`') {
                tail$1067 = true;
                terminated$1066 = true;
                break;
            } else if (ch$1064 === '$') {
                if (source$838[index$840] === '{') {
                    ++index$840;
                    terminated$1066 = true;
                    break;
                }
                cooked$1063 += ch$1064;
            } else if (ch$1064 === '\\') {
                ch$1064 = source$838[index$840++];
                if (!isLineTerminator$861(ch$1064.charCodeAt(0))) {
                    switch (ch$1064) {
                    case 'n':
                        cooked$1063 += '\n';
                        break;
                    case 'r':
                        cooked$1063 += '\r';
                        break;
                    case 't':
                        cooked$1063 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$838[index$840] === '{') {
                            ++index$840;
                            cooked$1063 += scanUnicodeCodePointEscape$870();
                        } else {
                            restore$1068 = index$840;
                            unescaped$1069 = scanHexEscape$869(ch$1064);
                            if (unescaped$1069) {
                                cooked$1063 += unescaped$1069;
                            } else {
                                index$840 = restore$1068;
                                cooked$1063 += ch$1064;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1063 += '\b';
                        break;
                    case 'f':
                        cooked$1063 += '\f';
                        break;
                    case 'v':
                        cooked$1063 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$859(ch$1064)) {
                            code$1070 = '01234567'.indexOf(ch$1064);
                            // \0 is not octal escape sequence
                            if (code$1070 !== 0) {
                                octal$1071 = true;
                            }
                            if (index$840 < length$847 && isOctalDigit$859(source$838[index$840])) {
                                octal$1071 = true;
                                code$1070 = code$1070 * 8 + '01234567'.indexOf(source$838[index$840++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1064) >= 0 && index$840 < length$847 && isOctalDigit$859(source$838[index$840])) {
                                    code$1070 = code$1070 * 8 + '01234567'.indexOf(source$838[index$840++]);
                                }
                            }
                            cooked$1063 += String.fromCharCode(code$1070);
                        } else {
                            cooked$1063 += ch$1064;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$841;
                    if (ch$1064 === '\r' && source$838[index$840] === '\n') {
                        ++index$840;
                    }
                }
            } else if (isLineTerminator$861(ch$1064.charCodeAt(0))) {
                ++lineNumber$841;
                if (ch$1064 === '\r' && source$838[index$840] === '\n') {
                    ++index$840;
                }
                cooked$1063 += '\n';
            } else {
                cooked$1063 += ch$1064;
            }
        }
        if (!terminated$1066) {
            throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$829.Template,
            value: {
                cooked: cooked$1063,
                raw: source$838.slice(start$1065 + 1, index$840 - (tail$1067 ? 1 : 2))
            },
            tail: tail$1067,
            octal: octal$1071,
            lineNumber: lineNumber$841,
            lineStart: lineStart$842,
            range: [
                start$1065,
                index$840
            ]
        };
    }
    function scanTemplateElement$880(option$1072) {
        var startsWith$1073, template$1074;
        lookahead$851 = null;
        skipComment$868();
        startsWith$1073 = option$1072.head ? '`' : '}';
        if (source$838[index$840] !== startsWith$1073) {
            throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
        }
        template$1074 = scanTemplate$879();
        peek$886();
        return template$1074;
    }
    function scanRegExp$881() {
        var str$1075, ch$1076, start$1077, pattern$1078, flags$1079, value$1080, classMarker$1081 = false, restore$1082, terminated$1083 = false;
        lookahead$851 = null;
        skipComment$868();
        start$1077 = index$840;
        ch$1076 = source$838[index$840];
        assert$855(ch$1076 === '/', 'Regular expression literal must start with a slash');
        str$1075 = source$838[index$840++];
        while (index$840 < length$847) {
            ch$1076 = source$838[index$840++];
            str$1075 += ch$1076;
            if (classMarker$1081) {
                if (ch$1076 === ']') {
                    classMarker$1081 = false;
                }
            } else {
                if (ch$1076 === '\\') {
                    ch$1076 = source$838[index$840++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$861(ch$1076.charCodeAt(0))) {
                        throwError$889({}, Messages$834.UnterminatedRegExp);
                    }
                    str$1075 += ch$1076;
                } else if (ch$1076 === '/') {
                    terminated$1083 = true;
                    break;
                } else if (ch$1076 === '[') {
                    classMarker$1081 = true;
                } else if (isLineTerminator$861(ch$1076.charCodeAt(0))) {
                    throwError$889({}, Messages$834.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1083) {
            throwError$889({}, Messages$834.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1078 = str$1075.substr(1, str$1075.length - 2);
        flags$1079 = '';
        while (index$840 < length$847) {
            ch$1076 = source$838[index$840];
            if (!isIdentifierPart$863(ch$1076.charCodeAt(0))) {
                break;
            }
            ++index$840;
            if (ch$1076 === '\\' && index$840 < length$847) {
                ch$1076 = source$838[index$840];
                if (ch$1076 === 'u') {
                    ++index$840;
                    restore$1082 = index$840;
                    ch$1076 = scanHexEscape$869('u');
                    if (ch$1076) {
                        flags$1079 += ch$1076;
                        for (str$1075 += '\\u'; restore$1082 < index$840; ++restore$1082) {
                            str$1075 += source$838[restore$1082];
                        }
                    } else {
                        index$840 = restore$1082;
                        flags$1079 += 'u';
                        str$1075 += '\\u';
                    }
                } else {
                    str$1075 += '\\';
                }
            } else {
                flags$1079 += ch$1076;
                str$1075 += ch$1076;
            }
        }
        try {
            value$1080 = new RegExp(pattern$1078, flags$1079);
        } catch (e$1084) {
            throwError$889({}, Messages$834.InvalidRegExp);
        }
        // peek();
        if (extra$854.tokenize) {
            return {
                type: Token$829.RegularExpression,
                value: value$1080,
                lineNumber: lineNumber$841,
                lineStart: lineStart$842,
                range: [
                    start$1077,
                    index$840
                ]
            };
        }
        return {
            type: Token$829.RegularExpression,
            literal: str$1075,
            value: value$1080,
            range: [
                start$1077,
                index$840
            ]
        };
    }
    function isIdentifierName$882(token$1085) {
        return token$1085.type === Token$829.Identifier || token$1085.type === Token$829.Keyword || token$1085.type === Token$829.BooleanLiteral || token$1085.type === Token$829.NullLiteral;
    }
    function advanceSlash$883() {
        var prevToken$1086, checkToken$1087;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1086 = extra$854.tokens[extra$854.tokens.length - 1];
        if (!prevToken$1086) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$881();
        }
        if (prevToken$1086.type === 'Punctuator') {
            if (prevToken$1086.value === ')') {
                checkToken$1087 = extra$854.tokens[extra$854.openParenToken - 1];
                if (checkToken$1087 && checkToken$1087.type === 'Keyword' && (checkToken$1087.value === 'if' || checkToken$1087.value === 'while' || checkToken$1087.value === 'for' || checkToken$1087.value === 'with')) {
                    return scanRegExp$881();
                }
                return scanPunctuator$874();
            }
            if (prevToken$1086.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$854.tokens[extra$854.openCurlyToken - 3] && extra$854.tokens[extra$854.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1087 = extra$854.tokens[extra$854.openCurlyToken - 4];
                    if (!checkToken$1087) {
                        return scanPunctuator$874();
                    }
                } else if (extra$854.tokens[extra$854.openCurlyToken - 4] && extra$854.tokens[extra$854.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1087 = extra$854.tokens[extra$854.openCurlyToken - 5];
                    if (!checkToken$1087) {
                        return scanRegExp$881();
                    }
                } else {
                    return scanPunctuator$874();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$831.indexOf(checkToken$1087.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$874();
                }
                // It is a declaration.
                return scanRegExp$881();
            }
            return scanRegExp$881();
        }
        if (prevToken$1086.type === 'Keyword') {
            return scanRegExp$881();
        }
        return scanPunctuator$874();
    }
    function advance$884() {
        var ch$1088;
        skipComment$868();
        if (index$840 >= length$847) {
            return {
                type: Token$829.EOF,
                lineNumber: lineNumber$841,
                lineStart: lineStart$842,
                range: [
                    index$840,
                    index$840
                ]
            };
        }
        ch$1088 = source$838.charCodeAt(index$840);
        // Very common: ( and ) and ;
        if (ch$1088 === 40 || ch$1088 === 41 || ch$1088 === 58) {
            return scanPunctuator$874();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1088 === 39 || ch$1088 === 34) {
            return scanStringLiteral$878();
        }
        if (ch$1088 === 96) {
            return scanTemplate$879();
        }
        if (isIdentifierStart$862(ch$1088)) {
            return scanIdentifier$873();
        }
        // # and @ are allowed for sweet.js
        if (ch$1088 === 35 || ch$1088 === 64) {
            ++index$840;
            return {
                type: Token$829.Punctuator,
                value: String.fromCharCode(ch$1088),
                lineNumber: lineNumber$841,
                lineStart: lineStart$842,
                range: [
                    index$840 - 1,
                    index$840
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1088 === 46) {
            if (isDecimalDigit$857(source$838.charCodeAt(index$840 + 1))) {
                return scanNumericLiteral$877();
            }
            return scanPunctuator$874();
        }
        if (isDecimalDigit$857(ch$1088)) {
            return scanNumericLiteral$877();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$854.tokenize && ch$1088 === 47) {
            return advanceSlash$883();
        }
        return scanPunctuator$874();
    }
    function lex$885() {
        var token$1089;
        token$1089 = lookahead$851;
        streamIndex$850 = lookaheadIndex$852;
        lineNumber$841 = token$1089.lineNumber;
        lineStart$842 = token$1089.lineStart;
        sm_lineNumber$843 = lookahead$851.sm_lineNumber;
        sm_lineStart$844 = lookahead$851.sm_lineStart;
        sm_range$845 = lookahead$851.sm_range;
        sm_index$846 = lookahead$851.sm_range[0];
        lookahead$851 = tokenStream$849[++streamIndex$850].token;
        lookaheadIndex$852 = streamIndex$850;
        index$840 = lookahead$851.range[0];
        return token$1089;
    }
    function peek$886() {
        lookaheadIndex$852 = streamIndex$850 + 1;
        if (lookaheadIndex$852 >= length$847) {
            lookahead$851 = {
                type: Token$829.EOF,
                lineNumber: lineNumber$841,
                lineStart: lineStart$842,
                range: [
                    index$840,
                    index$840
                ]
            };
            return;
        }
        lookahead$851 = tokenStream$849[lookaheadIndex$852].token;
        index$840 = lookahead$851.range[0];
    }
    function lookahead2$887() {
        var adv$1090, pos$1091, line$1092, start$1093, result$1094;
        if (streamIndex$850 + 1 >= length$847 || streamIndex$850 + 2 >= length$847) {
            return {
                type: Token$829.EOF,
                lineNumber: lineNumber$841,
                lineStart: lineStart$842,
                range: [
                    index$840,
                    index$840
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$851 === null) {
            lookaheadIndex$852 = streamIndex$850 + 1;
            lookahead$851 = tokenStream$849[lookaheadIndex$852].token;
            index$840 = lookahead$851.range[0];
        }
        result$1094 = tokenStream$849[lookaheadIndex$852 + 1].token;
        return result$1094;
    }
    SyntaxTreeDelegate$836 = {
        name: 'SyntaxTree',
        postProcess: function (node$1095) {
            return node$1095;
        },
        createArrayExpression: function (elements$1096) {
            return {
                type: Syntax$832.ArrayExpression,
                elements: elements$1096
            };
        },
        createAssignmentExpression: function (operator$1097, left$1098, right$1099) {
            return {
                type: Syntax$832.AssignmentExpression,
                operator: operator$1097,
                left: left$1098,
                right: right$1099
            };
        },
        createBinaryExpression: function (operator$1100, left$1101, right$1102) {
            var type$1103 = operator$1100 === '||' || operator$1100 === '&&' ? Syntax$832.LogicalExpression : Syntax$832.BinaryExpression;
            return {
                type: type$1103,
                operator: operator$1100,
                left: left$1101,
                right: right$1102
            };
        },
        createBlockStatement: function (body$1104) {
            return {
                type: Syntax$832.BlockStatement,
                body: body$1104
            };
        },
        createBreakStatement: function (label$1105) {
            return {
                type: Syntax$832.BreakStatement,
                label: label$1105
            };
        },
        createCallExpression: function (callee$1106, args$1107) {
            return {
                type: Syntax$832.CallExpression,
                callee: callee$1106,
                'arguments': args$1107
            };
        },
        createCatchClause: function (param$1108, body$1109) {
            return {
                type: Syntax$832.CatchClause,
                param: param$1108,
                body: body$1109
            };
        },
        createConditionalExpression: function (test$1110, consequent$1111, alternate$1112) {
            return {
                type: Syntax$832.ConditionalExpression,
                test: test$1110,
                consequent: consequent$1111,
                alternate: alternate$1112
            };
        },
        createContinueStatement: function (label$1113) {
            return {
                type: Syntax$832.ContinueStatement,
                label: label$1113
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$832.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1114, test$1115) {
            return {
                type: Syntax$832.DoWhileStatement,
                body: body$1114,
                test: test$1115
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$832.EmptyStatement };
        },
        createExpressionStatement: function (expression$1116) {
            return {
                type: Syntax$832.ExpressionStatement,
                expression: expression$1116
            };
        },
        createForStatement: function (init$1117, test$1118, update$1119, body$1120) {
            return {
                type: Syntax$832.ForStatement,
                init: init$1117,
                test: test$1118,
                update: update$1119,
                body: body$1120
            };
        },
        createForInStatement: function (left$1121, right$1122, body$1123) {
            return {
                type: Syntax$832.ForInStatement,
                left: left$1121,
                right: right$1122,
                body: body$1123,
                each: false
            };
        },
        createForOfStatement: function (left$1124, right$1125, body$1126) {
            return {
                type: Syntax$832.ForOfStatement,
                left: left$1124,
                right: right$1125,
                body: body$1126
            };
        },
        createFunctionDeclaration: function (id$1127, params$1128, defaults$1129, body$1130, rest$1131, generator$1132, expression$1133) {
            return {
                type: Syntax$832.FunctionDeclaration,
                id: id$1127,
                params: params$1128,
                defaults: defaults$1129,
                body: body$1130,
                rest: rest$1131,
                generator: generator$1132,
                expression: expression$1133
            };
        },
        createFunctionExpression: function (id$1134, params$1135, defaults$1136, body$1137, rest$1138, generator$1139, expression$1140) {
            return {
                type: Syntax$832.FunctionExpression,
                id: id$1134,
                params: params$1135,
                defaults: defaults$1136,
                body: body$1137,
                rest: rest$1138,
                generator: generator$1139,
                expression: expression$1140
            };
        },
        createIdentifier: function (name$1141) {
            return {
                type: Syntax$832.Identifier,
                name: name$1141
            };
        },
        createIfStatement: function (test$1142, consequent$1143, alternate$1144) {
            return {
                type: Syntax$832.IfStatement,
                test: test$1142,
                consequent: consequent$1143,
                alternate: alternate$1144
            };
        },
        createLabeledStatement: function (label$1145, body$1146) {
            return {
                type: Syntax$832.LabeledStatement,
                label: label$1145,
                body: body$1146
            };
        },
        createLiteral: function (token$1147) {
            return {
                type: Syntax$832.Literal,
                value: token$1147.value,
                raw: String(token$1147.value)
            };
        },
        createMemberExpression: function (accessor$1148, object$1149, property$1150) {
            return {
                type: Syntax$832.MemberExpression,
                computed: accessor$1148 === '[',
                object: object$1149,
                property: property$1150
            };
        },
        createNewExpression: function (callee$1151, args$1152) {
            return {
                type: Syntax$832.NewExpression,
                callee: callee$1151,
                'arguments': args$1152
            };
        },
        createObjectExpression: function (properties$1153) {
            return {
                type: Syntax$832.ObjectExpression,
                properties: properties$1153
            };
        },
        createPostfixExpression: function (operator$1154, argument$1155) {
            return {
                type: Syntax$832.UpdateExpression,
                operator: operator$1154,
                argument: argument$1155,
                prefix: false
            };
        },
        createProgram: function (body$1156) {
            return {
                type: Syntax$832.Program,
                body: body$1156
            };
        },
        createProperty: function (kind$1157, key$1158, value$1159, method$1160, shorthand$1161) {
            return {
                type: Syntax$832.Property,
                key: key$1158,
                value: value$1159,
                kind: kind$1157,
                method: method$1160,
                shorthand: shorthand$1161
            };
        },
        createReturnStatement: function (argument$1162) {
            return {
                type: Syntax$832.ReturnStatement,
                argument: argument$1162
            };
        },
        createSequenceExpression: function (expressions$1163) {
            return {
                type: Syntax$832.SequenceExpression,
                expressions: expressions$1163
            };
        },
        createSwitchCase: function (test$1164, consequent$1165) {
            return {
                type: Syntax$832.SwitchCase,
                test: test$1164,
                consequent: consequent$1165
            };
        },
        createSwitchStatement: function (discriminant$1166, cases$1167) {
            return {
                type: Syntax$832.SwitchStatement,
                discriminant: discriminant$1166,
                cases: cases$1167
            };
        },
        createThisExpression: function () {
            return { type: Syntax$832.ThisExpression };
        },
        createThrowStatement: function (argument$1168) {
            return {
                type: Syntax$832.ThrowStatement,
                argument: argument$1168
            };
        },
        createTryStatement: function (block$1169, guardedHandlers$1170, handlers$1171, finalizer$1172) {
            return {
                type: Syntax$832.TryStatement,
                block: block$1169,
                guardedHandlers: guardedHandlers$1170,
                handlers: handlers$1171,
                finalizer: finalizer$1172
            };
        },
        createUnaryExpression: function (operator$1173, argument$1174) {
            if (operator$1173 === '++' || operator$1173 === '--') {
                return {
                    type: Syntax$832.UpdateExpression,
                    operator: operator$1173,
                    argument: argument$1174,
                    prefix: true
                };
            }
            return {
                type: Syntax$832.UnaryExpression,
                operator: operator$1173,
                argument: argument$1174
            };
        },
        createVariableDeclaration: function (declarations$1175, kind$1176) {
            return {
                type: Syntax$832.VariableDeclaration,
                declarations: declarations$1175,
                kind: kind$1176
            };
        },
        createVariableDeclarator: function (id$1177, init$1178) {
            return {
                type: Syntax$832.VariableDeclarator,
                id: id$1177,
                init: init$1178
            };
        },
        createWhileStatement: function (test$1179, body$1180) {
            return {
                type: Syntax$832.WhileStatement,
                test: test$1179,
                body: body$1180
            };
        },
        createWithStatement: function (object$1181, body$1182) {
            return {
                type: Syntax$832.WithStatement,
                object: object$1181,
                body: body$1182
            };
        },
        createTemplateElement: function (value$1183, tail$1184) {
            return {
                type: Syntax$832.TemplateElement,
                value: value$1183,
                tail: tail$1184
            };
        },
        createTemplateLiteral: function (quasis$1185, expressions$1186) {
            return {
                type: Syntax$832.TemplateLiteral,
                quasis: quasis$1185,
                expressions: expressions$1186
            };
        },
        createSpreadElement: function (argument$1187) {
            return {
                type: Syntax$832.SpreadElement,
                argument: argument$1187
            };
        },
        createTaggedTemplateExpression: function (tag$1188, quasi$1189) {
            return {
                type: Syntax$832.TaggedTemplateExpression,
                tag: tag$1188,
                quasi: quasi$1189
            };
        },
        createArrowFunctionExpression: function (params$1190, defaults$1191, body$1192, rest$1193, expression$1194) {
            return {
                type: Syntax$832.ArrowFunctionExpression,
                id: null,
                params: params$1190,
                defaults: defaults$1191,
                body: body$1192,
                rest: rest$1193,
                generator: false,
                expression: expression$1194
            };
        },
        createMethodDefinition: function (propertyType$1195, kind$1196, key$1197, value$1198) {
            return {
                type: Syntax$832.MethodDefinition,
                key: key$1197,
                value: value$1198,
                kind: kind$1196,
                'static': propertyType$1195 === ClassPropertyType$837.static
            };
        },
        createClassBody: function (body$1199) {
            return {
                type: Syntax$832.ClassBody,
                body: body$1199
            };
        },
        createClassExpression: function (id$1200, superClass$1201, body$1202) {
            return {
                type: Syntax$832.ClassExpression,
                id: id$1200,
                superClass: superClass$1201,
                body: body$1202
            };
        },
        createClassDeclaration: function (id$1203, superClass$1204, body$1205) {
            return {
                type: Syntax$832.ClassDeclaration,
                id: id$1203,
                superClass: superClass$1204,
                body: body$1205
            };
        },
        createExportSpecifier: function (id$1206, name$1207) {
            return {
                type: Syntax$832.ExportSpecifier,
                id: id$1206,
                name: name$1207
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$832.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1208, specifiers$1209, source$1210) {
            return {
                type: Syntax$832.ExportDeclaration,
                declaration: declaration$1208,
                specifiers: specifiers$1209,
                source: source$1210
            };
        },
        createImportSpecifier: function (id$1211, name$1212) {
            return {
                type: Syntax$832.ImportSpecifier,
                id: id$1211,
                name: name$1212
            };
        },
        createImportDeclaration: function (specifiers$1213, kind$1214, source$1215) {
            return {
                type: Syntax$832.ImportDeclaration,
                specifiers: specifiers$1213,
                kind: kind$1214,
                source: source$1215
            };
        },
        createYieldExpression: function (argument$1216, delegate$1217) {
            return {
                type: Syntax$832.YieldExpression,
                argument: argument$1216,
                delegate: delegate$1217
            };
        },
        createModuleDeclaration: function (id$1218, source$1219, body$1220) {
            return {
                type: Syntax$832.ModuleDeclaration,
                id: id$1218,
                source: source$1219,
                body: body$1220
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$888() {
        return lookahead$851.lineNumber !== lineNumber$841;
    }
    // Throw an exception
    function throwError$889(token$1221, messageFormat$1222) {
        var error$1223, args$1224 = Array.prototype.slice.call(arguments, 2), msg$1225 = messageFormat$1222.replace(/%(\d)/g, function (whole$1229, index$1230) {
                assert$855(index$1230 < args$1224.length, 'Message reference must be in range');
                return args$1224[index$1230];
            });
        var startIndex$1226 = streamIndex$850 > 3 ? streamIndex$850 - 3 : 0;
        var toks$1227 = tokenStream$849.slice(startIndex$1226, streamIndex$850 + 3).map(function (stx$1231) {
                return stx$1231.token.value;
            }).join(' ');
        var tailingMsg$1228 = '\n[... ' + toks$1227 + ' ...]';
        if (typeof token$1221.lineNumber === 'number') {
            error$1223 = new Error('Line ' + token$1221.lineNumber + ': ' + msg$1225 + tailingMsg$1228);
            error$1223.index = token$1221.range[0];
            error$1223.lineNumber = token$1221.lineNumber;
            error$1223.column = token$1221.range[0] - lineStart$842 + 1;
        } else {
            error$1223 = new Error('Line ' + lineNumber$841 + ': ' + msg$1225 + tailingMsg$1228);
            error$1223.index = index$840;
            error$1223.lineNumber = lineNumber$841;
            error$1223.column = index$840 - lineStart$842 + 1;
        }
        error$1223.description = msg$1225;
        throw error$1223;
    }
    function throwErrorTolerant$890() {
        try {
            throwError$889.apply(null, arguments);
        } catch (e$1232) {
            if (extra$854.errors) {
                extra$854.errors.push(e$1232);
            } else {
                throw e$1232;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$891(token$1233) {
        if (token$1233.type === Token$829.EOF) {
            throwError$889(token$1233, Messages$834.UnexpectedEOS);
        }
        if (token$1233.type === Token$829.NumericLiteral) {
            throwError$889(token$1233, Messages$834.UnexpectedNumber);
        }
        if (token$1233.type === Token$829.StringLiteral) {
            throwError$889(token$1233, Messages$834.UnexpectedString);
        }
        if (token$1233.type === Token$829.Identifier) {
            throwError$889(token$1233, Messages$834.UnexpectedIdentifier);
        }
        if (token$1233.type === Token$829.Keyword) {
            if (isFutureReservedWord$864(token$1233.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$839 && isStrictModeReservedWord$865(token$1233.value)) {
                throwErrorTolerant$890(token$1233, Messages$834.StrictReservedWord);
                return;
            }
            throwError$889(token$1233, Messages$834.UnexpectedToken, token$1233.value);
        }
        if (token$1233.type === Token$829.Template) {
            throwError$889(token$1233, Messages$834.UnexpectedTemplate, token$1233.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$889(token$1233, Messages$834.UnexpectedToken, token$1233.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$892(value$1234) {
        var token$1235 = lex$885();
        if (token$1235.type !== Token$829.Punctuator || token$1235.value !== value$1234) {
            throwUnexpected$891(token$1235);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$893(keyword$1236) {
        var token$1237 = lex$885();
        if (token$1237.type !== Token$829.Keyword || token$1237.value !== keyword$1236) {
            throwUnexpected$891(token$1237);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$894(value$1238) {
        return lookahead$851.type === Token$829.Punctuator && lookahead$851.value === value$1238;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$895(keyword$1239) {
        return lookahead$851.type === Token$829.Keyword && lookahead$851.value === keyword$1239;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$896(keyword$1240) {
        return lookahead$851.type === Token$829.Identifier && lookahead$851.value === keyword$1240;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$897() {
        var op$1241;
        if (lookahead$851.type !== Token$829.Punctuator) {
            return false;
        }
        op$1241 = lookahead$851.value;
        return op$1241 === '=' || op$1241 === '*=' || op$1241 === '/=' || op$1241 === '%=' || op$1241 === '+=' || op$1241 === '-=' || op$1241 === '<<=' || op$1241 === '>>=' || op$1241 === '>>>=' || op$1241 === '&=' || op$1241 === '^=' || op$1241 === '|=';
    }
    function consumeSemicolon$898() {
        var line$1242, ch$1243;
        ch$1243 = lookahead$851.value ? String(lookahead$851.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1243 === 59) {
            lex$885();
            return;
        }
        if (lookahead$851.lineNumber !== lineNumber$841) {
            return;
        }
        if (match$894(';')) {
            lex$885();
            return;
        }
        if (lookahead$851.type !== Token$829.EOF && !match$894('}')) {
            throwUnexpected$891(lookahead$851);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$899(expr$1244) {
        return expr$1244.type === Syntax$832.Identifier || expr$1244.type === Syntax$832.MemberExpression;
    }
    function isAssignableLeftHandSide$900(expr$1245) {
        return isLeftHandSide$899(expr$1245) || expr$1245.type === Syntax$832.ObjectPattern || expr$1245.type === Syntax$832.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$901() {
        var elements$1246 = [], blocks$1247 = [], filter$1248 = null, tmp$1249, possiblecomprehension$1250 = true, body$1251;
        expect$892('[');
        while (!match$894(']')) {
            if (lookahead$851.value === 'for' && lookahead$851.type === Token$829.Keyword) {
                if (!possiblecomprehension$1250) {
                    throwError$889({}, Messages$834.ComprehensionError);
                }
                matchKeyword$895('for');
                tmp$1249 = parseForStatement$949({ ignoreBody: true });
                tmp$1249.of = tmp$1249.type === Syntax$832.ForOfStatement;
                tmp$1249.type = Syntax$832.ComprehensionBlock;
                if (tmp$1249.left.kind) {
                    // can't be let or const
                    throwError$889({}, Messages$834.ComprehensionError);
                }
                blocks$1247.push(tmp$1249);
            } else if (lookahead$851.value === 'if' && lookahead$851.type === Token$829.Keyword) {
                if (!possiblecomprehension$1250) {
                    throwError$889({}, Messages$834.ComprehensionError);
                }
                expectKeyword$893('if');
                expect$892('(');
                filter$1248 = parseExpression$929();
                expect$892(')');
            } else if (lookahead$851.value === ',' && lookahead$851.type === Token$829.Punctuator) {
                possiblecomprehension$1250 = false;
                // no longer allowed.
                lex$885();
                elements$1246.push(null);
            } else {
                tmp$1249 = parseSpreadOrAssignmentExpression$912();
                elements$1246.push(tmp$1249);
                if (tmp$1249 && tmp$1249.type === Syntax$832.SpreadElement) {
                    if (!match$894(']')) {
                        throwError$889({}, Messages$834.ElementAfterSpreadElement);
                    }
                } else if (!(match$894(']') || matchKeyword$895('for') || matchKeyword$895('if'))) {
                    expect$892(',');
                    // this lexes.
                    possiblecomprehension$1250 = false;
                }
            }
        }
        expect$892(']');
        if (filter$1248 && !blocks$1247.length) {
            throwError$889({}, Messages$834.ComprehensionRequiresBlock);
        }
        if (blocks$1247.length) {
            if (elements$1246.length !== 1) {
                throwError$889({}, Messages$834.ComprehensionError);
            }
            return {
                type: Syntax$832.ComprehensionExpression,
                filter: filter$1248,
                blocks: blocks$1247,
                body: elements$1246[0]
            };
        }
        return delegate$848.createArrayExpression(elements$1246);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$902(options$1252) {
        var previousStrict$1253, previousYieldAllowed$1254, params$1255, defaults$1256, body$1257;
        previousStrict$1253 = strict$839;
        previousYieldAllowed$1254 = state$853.yieldAllowed;
        state$853.yieldAllowed = options$1252.generator;
        params$1255 = options$1252.params || [];
        defaults$1256 = options$1252.defaults || [];
        body$1257 = parseConciseBody$961();
        if (options$1252.name && strict$839 && isRestrictedWord$866(params$1255[0].name)) {
            throwErrorTolerant$890(options$1252.name, Messages$834.StrictParamName);
        }
        if (state$853.yieldAllowed && !state$853.yieldFound) {
            throwErrorTolerant$890({}, Messages$834.NoYieldInGenerator);
        }
        strict$839 = previousStrict$1253;
        state$853.yieldAllowed = previousYieldAllowed$1254;
        return delegate$848.createFunctionExpression(null, params$1255, defaults$1256, body$1257, options$1252.rest || null, options$1252.generator, body$1257.type !== Syntax$832.BlockStatement);
    }
    function parsePropertyMethodFunction$903(options$1258) {
        var previousStrict$1259, tmp$1260, method$1261;
        previousStrict$1259 = strict$839;
        strict$839 = true;
        tmp$1260 = parseParams$965();
        if (tmp$1260.stricted) {
            throwErrorTolerant$890(tmp$1260.stricted, tmp$1260.message);
        }
        method$1261 = parsePropertyFunction$902({
            params: tmp$1260.params,
            defaults: tmp$1260.defaults,
            rest: tmp$1260.rest,
            generator: options$1258.generator
        });
        strict$839 = previousStrict$1259;
        return method$1261;
    }
    function parseObjectPropertyKey$904() {
        var token$1262 = lex$885();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1262.type === Token$829.StringLiteral || token$1262.type === Token$829.NumericLiteral) {
            if (strict$839 && token$1262.octal) {
                throwErrorTolerant$890(token$1262, Messages$834.StrictOctalLiteral);
            }
            return delegate$848.createLiteral(token$1262);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$848.createIdentifier(token$1262.value);
    }
    function parseObjectProperty$905() {
        var token$1263, key$1264, id$1265, value$1266, param$1267;
        token$1263 = lookahead$851;
        if (token$1263.type === Token$829.Identifier) {
            id$1265 = parseObjectPropertyKey$904();
            // Property Assignment: Getter and Setter.
            if (token$1263.value === 'get' && !(match$894(':') || match$894('('))) {
                key$1264 = parseObjectPropertyKey$904();
                expect$892('(');
                expect$892(')');
                return delegate$848.createProperty('get', key$1264, parsePropertyFunction$902({ generator: false }), false, false);
            }
            if (token$1263.value === 'set' && !(match$894(':') || match$894('('))) {
                key$1264 = parseObjectPropertyKey$904();
                expect$892('(');
                token$1263 = lookahead$851;
                param$1267 = [parseVariableIdentifier$932()];
                expect$892(')');
                return delegate$848.createProperty('set', key$1264, parsePropertyFunction$902({
                    params: param$1267,
                    generator: false,
                    name: token$1263
                }), false, false);
            }
            if (match$894(':')) {
                lex$885();
                return delegate$848.createProperty('init', id$1265, parseAssignmentExpression$928(), false, false);
            }
            if (match$894('(')) {
                return delegate$848.createProperty('init', id$1265, parsePropertyMethodFunction$903({ generator: false }), true, false);
            }
            return delegate$848.createProperty('init', id$1265, id$1265, false, true);
        }
        if (token$1263.type === Token$829.EOF || token$1263.type === Token$829.Punctuator) {
            if (!match$894('*')) {
                throwUnexpected$891(token$1263);
            }
            lex$885();
            id$1265 = parseObjectPropertyKey$904();
            if (!match$894('(')) {
                throwUnexpected$891(lex$885());
            }
            return delegate$848.createProperty('init', id$1265, parsePropertyMethodFunction$903({ generator: true }), true, false);
        }
        key$1264 = parseObjectPropertyKey$904();
        if (match$894(':')) {
            lex$885();
            return delegate$848.createProperty('init', key$1264, parseAssignmentExpression$928(), false, false);
        }
        if (match$894('(')) {
            return delegate$848.createProperty('init', key$1264, parsePropertyMethodFunction$903({ generator: false }), true, false);
        }
        throwUnexpected$891(lex$885());
    }
    function parseObjectInitialiser$906() {
        var properties$1268 = [], property$1269, name$1270, key$1271, kind$1272, map$1273 = {}, toString$1274 = String;
        expect$892('{');
        while (!match$894('}')) {
            property$1269 = parseObjectProperty$905();
            if (property$1269.key.type === Syntax$832.Identifier) {
                name$1270 = property$1269.key.name;
            } else {
                name$1270 = toString$1274(property$1269.key.value);
            }
            kind$1272 = property$1269.kind === 'init' ? PropertyKind$833.Data : property$1269.kind === 'get' ? PropertyKind$833.Get : PropertyKind$833.Set;
            key$1271 = '$' + name$1270;
            if (Object.prototype.hasOwnProperty.call(map$1273, key$1271)) {
                if (map$1273[key$1271] === PropertyKind$833.Data) {
                    if (strict$839 && kind$1272 === PropertyKind$833.Data) {
                        throwErrorTolerant$890({}, Messages$834.StrictDuplicateProperty);
                    } else if (kind$1272 !== PropertyKind$833.Data) {
                        throwErrorTolerant$890({}, Messages$834.AccessorDataProperty);
                    }
                } else {
                    if (kind$1272 === PropertyKind$833.Data) {
                        throwErrorTolerant$890({}, Messages$834.AccessorDataProperty);
                    } else if (map$1273[key$1271] & kind$1272) {
                        throwErrorTolerant$890({}, Messages$834.AccessorGetSet);
                    }
                }
                map$1273[key$1271] |= kind$1272;
            } else {
                map$1273[key$1271] = kind$1272;
            }
            properties$1268.push(property$1269);
            if (!match$894('}')) {
                expect$892(',');
            }
        }
        expect$892('}');
        return delegate$848.createObjectExpression(properties$1268);
    }
    function parseTemplateElement$907(option$1275) {
        var token$1276 = scanTemplateElement$880(option$1275);
        if (strict$839 && token$1276.octal) {
            throwError$889(token$1276, Messages$834.StrictOctalLiteral);
        }
        return delegate$848.createTemplateElement({
            raw: token$1276.value.raw,
            cooked: token$1276.value.cooked
        }, token$1276.tail);
    }
    function parseTemplateLiteral$908() {
        var quasi$1277, quasis$1278, expressions$1279;
        quasi$1277 = parseTemplateElement$907({ head: true });
        quasis$1278 = [quasi$1277];
        expressions$1279 = [];
        while (!quasi$1277.tail) {
            expressions$1279.push(parseExpression$929());
            quasi$1277 = parseTemplateElement$907({ head: false });
            quasis$1278.push(quasi$1277);
        }
        return delegate$848.createTemplateLiteral(quasis$1278, expressions$1279);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$909() {
        var expr$1280;
        expect$892('(');
        ++state$853.parenthesizedCount;
        expr$1280 = parseExpression$929();
        expect$892(')');
        return expr$1280;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$910() {
        var type$1281, token$1282, resolvedIdent$1283;
        token$1282 = lookahead$851;
        type$1281 = lookahead$851.type;
        if (type$1281 === Token$829.Identifier) {
            resolvedIdent$1283 = expander$828.resolve(tokenStream$849[lookaheadIndex$852]);
            lex$885();
            return delegate$848.createIdentifier(resolvedIdent$1283);
        }
        if (type$1281 === Token$829.StringLiteral || type$1281 === Token$829.NumericLiteral) {
            if (strict$839 && lookahead$851.octal) {
                throwErrorTolerant$890(lookahead$851, Messages$834.StrictOctalLiteral);
            }
            return delegate$848.createLiteral(lex$885());
        }
        if (type$1281 === Token$829.Keyword) {
            if (matchKeyword$895('this')) {
                lex$885();
                return delegate$848.createThisExpression();
            }
            if (matchKeyword$895('function')) {
                return parseFunctionExpression$967();
            }
            if (matchKeyword$895('class')) {
                return parseClassExpression$972();
            }
            if (matchKeyword$895('super')) {
                lex$885();
                return delegate$848.createIdentifier('super');
            }
        }
        if (type$1281 === Token$829.BooleanLiteral) {
            token$1282 = lex$885();
            token$1282.value = token$1282.value === 'true';
            return delegate$848.createLiteral(token$1282);
        }
        if (type$1281 === Token$829.NullLiteral) {
            token$1282 = lex$885();
            token$1282.value = null;
            return delegate$848.createLiteral(token$1282);
        }
        if (match$894('[')) {
            return parseArrayInitialiser$901();
        }
        if (match$894('{')) {
            return parseObjectInitialiser$906();
        }
        if (match$894('(')) {
            return parseGroupExpression$909();
        }
        if (lookahead$851.type === Token$829.RegularExpression) {
            return delegate$848.createLiteral(lex$885());
        }
        if (type$1281 === Token$829.Template) {
            return parseTemplateLiteral$908();
        }
        return throwUnexpected$891(lex$885());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$911() {
        var args$1284 = [], arg$1285;
        expect$892('(');
        if (!match$894(')')) {
            while (streamIndex$850 < length$847) {
                arg$1285 = parseSpreadOrAssignmentExpression$912();
                args$1284.push(arg$1285);
                if (match$894(')')) {
                    break;
                } else if (arg$1285.type === Syntax$832.SpreadElement) {
                    throwError$889({}, Messages$834.ElementAfterSpreadElement);
                }
                expect$892(',');
            }
        }
        expect$892(')');
        return args$1284;
    }
    function parseSpreadOrAssignmentExpression$912() {
        if (match$894('...')) {
            lex$885();
            return delegate$848.createSpreadElement(parseAssignmentExpression$928());
        }
        return parseAssignmentExpression$928();
    }
    function parseNonComputedProperty$913() {
        var token$1286 = lex$885();
        if (!isIdentifierName$882(token$1286)) {
            throwUnexpected$891(token$1286);
        }
        return delegate$848.createIdentifier(token$1286.value);
    }
    function parseNonComputedMember$914() {
        expect$892('.');
        return parseNonComputedProperty$913();
    }
    function parseComputedMember$915() {
        var expr$1287;
        expect$892('[');
        expr$1287 = parseExpression$929();
        expect$892(']');
        return expr$1287;
    }
    function parseNewExpression$916() {
        var callee$1288, args$1289;
        expectKeyword$893('new');
        callee$1288 = parseLeftHandSideExpression$918();
        args$1289 = match$894('(') ? parseArguments$911() : [];
        return delegate$848.createNewExpression(callee$1288, args$1289);
    }
    function parseLeftHandSideExpressionAllowCall$917() {
        var expr$1290, args$1291, property$1292;
        expr$1290 = matchKeyword$895('new') ? parseNewExpression$916() : parsePrimaryExpression$910();
        while (match$894('.') || match$894('[') || match$894('(') || lookahead$851.type === Token$829.Template) {
            if (match$894('(')) {
                args$1291 = parseArguments$911();
                expr$1290 = delegate$848.createCallExpression(expr$1290, args$1291);
            } else if (match$894('[')) {
                expr$1290 = delegate$848.createMemberExpression('[', expr$1290, parseComputedMember$915());
            } else if (match$894('.')) {
                expr$1290 = delegate$848.createMemberExpression('.', expr$1290, parseNonComputedMember$914());
            } else {
                expr$1290 = delegate$848.createTaggedTemplateExpression(expr$1290, parseTemplateLiteral$908());
            }
        }
        return expr$1290;
    }
    function parseLeftHandSideExpression$918() {
        var expr$1293, property$1294;
        expr$1293 = matchKeyword$895('new') ? parseNewExpression$916() : parsePrimaryExpression$910();
        while (match$894('.') || match$894('[') || lookahead$851.type === Token$829.Template) {
            if (match$894('[')) {
                expr$1293 = delegate$848.createMemberExpression('[', expr$1293, parseComputedMember$915());
            } else if (match$894('.')) {
                expr$1293 = delegate$848.createMemberExpression('.', expr$1293, parseNonComputedMember$914());
            } else {
                expr$1293 = delegate$848.createTaggedTemplateExpression(expr$1293, parseTemplateLiteral$908());
            }
        }
        return expr$1293;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$919() {
        var expr$1295 = parseLeftHandSideExpressionAllowCall$917(), token$1296 = lookahead$851;
        if (lookahead$851.type !== Token$829.Punctuator) {
            return expr$1295;
        }
        if ((match$894('++') || match$894('--')) && !peekLineTerminator$888()) {
            // 11.3.1, 11.3.2
            if (strict$839 && expr$1295.type === Syntax$832.Identifier && isRestrictedWord$866(expr$1295.name)) {
                throwErrorTolerant$890({}, Messages$834.StrictLHSPostfix);
            }
            if (!isLeftHandSide$899(expr$1295)) {
                throwError$889({}, Messages$834.InvalidLHSInAssignment);
            }
            token$1296 = lex$885();
            expr$1295 = delegate$848.createPostfixExpression(token$1296.value, expr$1295);
        }
        return expr$1295;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$920() {
        var token$1297, expr$1298;
        if (lookahead$851.type !== Token$829.Punctuator && lookahead$851.type !== Token$829.Keyword) {
            return parsePostfixExpression$919();
        }
        if (match$894('++') || match$894('--')) {
            token$1297 = lex$885();
            expr$1298 = parseUnaryExpression$920();
            // 11.4.4, 11.4.5
            if (strict$839 && expr$1298.type === Syntax$832.Identifier && isRestrictedWord$866(expr$1298.name)) {
                throwErrorTolerant$890({}, Messages$834.StrictLHSPrefix);
            }
            if (!isLeftHandSide$899(expr$1298)) {
                throwError$889({}, Messages$834.InvalidLHSInAssignment);
            }
            return delegate$848.createUnaryExpression(token$1297.value, expr$1298);
        }
        if (match$894('+') || match$894('-') || match$894('~') || match$894('!')) {
            token$1297 = lex$885();
            expr$1298 = parseUnaryExpression$920();
            return delegate$848.createUnaryExpression(token$1297.value, expr$1298);
        }
        if (matchKeyword$895('delete') || matchKeyword$895('void') || matchKeyword$895('typeof')) {
            token$1297 = lex$885();
            expr$1298 = parseUnaryExpression$920();
            expr$1298 = delegate$848.createUnaryExpression(token$1297.value, expr$1298);
            if (strict$839 && expr$1298.operator === 'delete' && expr$1298.argument.type === Syntax$832.Identifier) {
                throwErrorTolerant$890({}, Messages$834.StrictDelete);
            }
            return expr$1298;
        }
        return parsePostfixExpression$919();
    }
    function binaryPrecedence$921(token$1299, allowIn$1300) {
        var prec$1301 = 0;
        if (token$1299.type !== Token$829.Punctuator && token$1299.type !== Token$829.Keyword) {
            return 0;
        }
        switch (token$1299.value) {
        case '||':
            prec$1301 = 1;
            break;
        case '&&':
            prec$1301 = 2;
            break;
        case '|':
            prec$1301 = 3;
            break;
        case '^':
            prec$1301 = 4;
            break;
        case '&':
            prec$1301 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1301 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1301 = 7;
            break;
        case 'in':
            prec$1301 = allowIn$1300 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1301 = 8;
            break;
        case '+':
        case '-':
            prec$1301 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1301 = 11;
            break;
        default:
            break;
        }
        return prec$1301;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$922() {
        var expr$1302, token$1303, prec$1304, previousAllowIn$1305, stack$1306, right$1307, operator$1308, left$1309, i$1310;
        previousAllowIn$1305 = state$853.allowIn;
        state$853.allowIn = true;
        expr$1302 = parseUnaryExpression$920();
        token$1303 = lookahead$851;
        prec$1304 = binaryPrecedence$921(token$1303, previousAllowIn$1305);
        if (prec$1304 === 0) {
            return expr$1302;
        }
        token$1303.prec = prec$1304;
        lex$885();
        stack$1306 = [
            expr$1302,
            token$1303,
            parseUnaryExpression$920()
        ];
        while ((prec$1304 = binaryPrecedence$921(lookahead$851, previousAllowIn$1305)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1306.length > 2 && prec$1304 <= stack$1306[stack$1306.length - 2].prec) {
                right$1307 = stack$1306.pop();
                operator$1308 = stack$1306.pop().value;
                left$1309 = stack$1306.pop();
                stack$1306.push(delegate$848.createBinaryExpression(operator$1308, left$1309, right$1307));
            }
            // Shift.
            token$1303 = lex$885();
            token$1303.prec = prec$1304;
            stack$1306.push(token$1303);
            stack$1306.push(parseUnaryExpression$920());
        }
        state$853.allowIn = previousAllowIn$1305;
        // Final reduce to clean-up the stack.
        i$1310 = stack$1306.length - 1;
        expr$1302 = stack$1306[i$1310];
        while (i$1310 > 1) {
            expr$1302 = delegate$848.createBinaryExpression(stack$1306[i$1310 - 1].value, stack$1306[i$1310 - 2], expr$1302);
            i$1310 -= 2;
        }
        return expr$1302;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$923() {
        var expr$1311, previousAllowIn$1312, consequent$1313, alternate$1314;
        expr$1311 = parseBinaryExpression$922();
        if (match$894('?')) {
            lex$885();
            previousAllowIn$1312 = state$853.allowIn;
            state$853.allowIn = true;
            consequent$1313 = parseAssignmentExpression$928();
            state$853.allowIn = previousAllowIn$1312;
            expect$892(':');
            alternate$1314 = parseAssignmentExpression$928();
            expr$1311 = delegate$848.createConditionalExpression(expr$1311, consequent$1313, alternate$1314);
        }
        return expr$1311;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$924(expr$1315) {
        var i$1316, len$1317, property$1318, element$1319;
        if (expr$1315.type === Syntax$832.ObjectExpression) {
            expr$1315.type = Syntax$832.ObjectPattern;
            for (i$1316 = 0, len$1317 = expr$1315.properties.length; i$1316 < len$1317; i$1316 += 1) {
                property$1318 = expr$1315.properties[i$1316];
                if (property$1318.kind !== 'init') {
                    throwError$889({}, Messages$834.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$924(property$1318.value);
            }
        } else if (expr$1315.type === Syntax$832.ArrayExpression) {
            expr$1315.type = Syntax$832.ArrayPattern;
            for (i$1316 = 0, len$1317 = expr$1315.elements.length; i$1316 < len$1317; i$1316 += 1) {
                element$1319 = expr$1315.elements[i$1316];
                if (element$1319) {
                    reinterpretAsAssignmentBindingPattern$924(element$1319);
                }
            }
        } else if (expr$1315.type === Syntax$832.Identifier) {
            if (isRestrictedWord$866(expr$1315.name)) {
                throwError$889({}, Messages$834.InvalidLHSInAssignment);
            }
        } else if (expr$1315.type === Syntax$832.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$924(expr$1315.argument);
            if (expr$1315.argument.type === Syntax$832.ObjectPattern) {
                throwError$889({}, Messages$834.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1315.type !== Syntax$832.MemberExpression && expr$1315.type !== Syntax$832.CallExpression && expr$1315.type !== Syntax$832.NewExpression) {
                throwError$889({}, Messages$834.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$925(options$1320, expr$1321) {
        var i$1322, len$1323, property$1324, element$1325;
        if (expr$1321.type === Syntax$832.ObjectExpression) {
            expr$1321.type = Syntax$832.ObjectPattern;
            for (i$1322 = 0, len$1323 = expr$1321.properties.length; i$1322 < len$1323; i$1322 += 1) {
                property$1324 = expr$1321.properties[i$1322];
                if (property$1324.kind !== 'init') {
                    throwError$889({}, Messages$834.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$925(options$1320, property$1324.value);
            }
        } else if (expr$1321.type === Syntax$832.ArrayExpression) {
            expr$1321.type = Syntax$832.ArrayPattern;
            for (i$1322 = 0, len$1323 = expr$1321.elements.length; i$1322 < len$1323; i$1322 += 1) {
                element$1325 = expr$1321.elements[i$1322];
                if (element$1325) {
                    reinterpretAsDestructuredParameter$925(options$1320, element$1325);
                }
            }
        } else if (expr$1321.type === Syntax$832.Identifier) {
            validateParam$963(options$1320, expr$1321, expr$1321.name);
        } else {
            if (expr$1321.type !== Syntax$832.MemberExpression) {
                throwError$889({}, Messages$834.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$926(expressions$1326) {
        var i$1327, len$1328, param$1329, params$1330, defaults$1331, defaultCount$1332, options$1333, rest$1334;
        params$1330 = [];
        defaults$1331 = [];
        defaultCount$1332 = 0;
        rest$1334 = null;
        options$1333 = { paramSet: {} };
        for (i$1327 = 0, len$1328 = expressions$1326.length; i$1327 < len$1328; i$1327 += 1) {
            param$1329 = expressions$1326[i$1327];
            if (param$1329.type === Syntax$832.Identifier) {
                params$1330.push(param$1329);
                defaults$1331.push(null);
                validateParam$963(options$1333, param$1329, param$1329.name);
            } else if (param$1329.type === Syntax$832.ObjectExpression || param$1329.type === Syntax$832.ArrayExpression) {
                reinterpretAsDestructuredParameter$925(options$1333, param$1329);
                params$1330.push(param$1329);
                defaults$1331.push(null);
            } else if (param$1329.type === Syntax$832.SpreadElement) {
                assert$855(i$1327 === len$1328 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$925(options$1333, param$1329.argument);
                rest$1334 = param$1329.argument;
            } else if (param$1329.type === Syntax$832.AssignmentExpression) {
                params$1330.push(param$1329.left);
                defaults$1331.push(param$1329.right);
                ++defaultCount$1332;
                validateParam$963(options$1333, param$1329.left, param$1329.left.name);
            } else {
                return null;
            }
        }
        if (options$1333.message === Messages$834.StrictParamDupe) {
            throwError$889(strict$839 ? options$1333.stricted : options$1333.firstRestricted, options$1333.message);
        }
        if (defaultCount$1332 === 0) {
            defaults$1331 = [];
        }
        return {
            params: params$1330,
            defaults: defaults$1331,
            rest: rest$1334,
            stricted: options$1333.stricted,
            firstRestricted: options$1333.firstRestricted,
            message: options$1333.message
        };
    }
    function parseArrowFunctionExpression$927(options$1335) {
        var previousStrict$1336, previousYieldAllowed$1337, body$1338;
        expect$892('=>');
        previousStrict$1336 = strict$839;
        previousYieldAllowed$1337 = state$853.yieldAllowed;
        state$853.yieldAllowed = false;
        body$1338 = parseConciseBody$961();
        if (strict$839 && options$1335.firstRestricted) {
            throwError$889(options$1335.firstRestricted, options$1335.message);
        }
        if (strict$839 && options$1335.stricted) {
            throwErrorTolerant$890(options$1335.stricted, options$1335.message);
        }
        strict$839 = previousStrict$1336;
        state$853.yieldAllowed = previousYieldAllowed$1337;
        return delegate$848.createArrowFunctionExpression(options$1335.params, options$1335.defaults, body$1338, options$1335.rest, body$1338.type !== Syntax$832.BlockStatement);
    }
    function parseAssignmentExpression$928() {
        var expr$1339, token$1340, params$1341, oldParenthesizedCount$1342;
        if (matchKeyword$895('yield')) {
            return parseYieldExpression$968();
        }
        oldParenthesizedCount$1342 = state$853.parenthesizedCount;
        if (match$894('(')) {
            token$1340 = lookahead2$887();
            if (token$1340.type === Token$829.Punctuator && token$1340.value === ')' || token$1340.value === '...') {
                params$1341 = parseParams$965();
                if (!match$894('=>')) {
                    throwUnexpected$891(lex$885());
                }
                return parseArrowFunctionExpression$927(params$1341);
            }
        }
        token$1340 = lookahead$851;
        expr$1339 = parseConditionalExpression$923();
        if (match$894('=>') && (state$853.parenthesizedCount === oldParenthesizedCount$1342 || state$853.parenthesizedCount === oldParenthesizedCount$1342 + 1)) {
            if (expr$1339.type === Syntax$832.Identifier) {
                params$1341 = reinterpretAsCoverFormalsList$926([expr$1339]);
            } else if (expr$1339.type === Syntax$832.SequenceExpression) {
                params$1341 = reinterpretAsCoverFormalsList$926(expr$1339.expressions);
            }
            if (params$1341) {
                return parseArrowFunctionExpression$927(params$1341);
            }
        }
        if (matchAssign$897()) {
            // 11.13.1
            if (strict$839 && expr$1339.type === Syntax$832.Identifier && isRestrictedWord$866(expr$1339.name)) {
                throwErrorTolerant$890(token$1340, Messages$834.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$894('=') && (expr$1339.type === Syntax$832.ObjectExpression || expr$1339.type === Syntax$832.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$924(expr$1339);
            } else if (!isLeftHandSide$899(expr$1339)) {
                throwError$889({}, Messages$834.InvalidLHSInAssignment);
            }
            expr$1339 = delegate$848.createAssignmentExpression(lex$885().value, expr$1339, parseAssignmentExpression$928());
        }
        return expr$1339;
    }
    // 11.14 Comma Operator
    function parseExpression$929() {
        var expr$1343, expressions$1344, sequence$1345, coverFormalsList$1346, spreadFound$1347, oldParenthesizedCount$1348;
        oldParenthesizedCount$1348 = state$853.parenthesizedCount;
        expr$1343 = parseAssignmentExpression$928();
        expressions$1344 = [expr$1343];
        if (match$894(',')) {
            while (streamIndex$850 < length$847) {
                if (!match$894(',')) {
                    break;
                }
                lex$885();
                expr$1343 = parseSpreadOrAssignmentExpression$912();
                expressions$1344.push(expr$1343);
                if (expr$1343.type === Syntax$832.SpreadElement) {
                    spreadFound$1347 = true;
                    if (!match$894(')')) {
                        throwError$889({}, Messages$834.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1345 = delegate$848.createSequenceExpression(expressions$1344);
        }
        if (match$894('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$853.parenthesizedCount === oldParenthesizedCount$1348 || state$853.parenthesizedCount === oldParenthesizedCount$1348 + 1) {
                expr$1343 = expr$1343.type === Syntax$832.SequenceExpression ? expr$1343.expressions : expressions$1344;
                coverFormalsList$1346 = reinterpretAsCoverFormalsList$926(expr$1343);
                if (coverFormalsList$1346) {
                    return parseArrowFunctionExpression$927(coverFormalsList$1346);
                }
            }
            throwUnexpected$891(lex$885());
        }
        if (spreadFound$1347 && lookahead2$887().value !== '=>') {
            throwError$889({}, Messages$834.IllegalSpread);
        }
        return sequence$1345 || expr$1343;
    }
    // 12.1 Block
    function parseStatementList$930() {
        var list$1349 = [], statement$1350;
        while (streamIndex$850 < length$847) {
            if (match$894('}')) {
                break;
            }
            statement$1350 = parseSourceElement$975();
            if (typeof statement$1350 === 'undefined') {
                break;
            }
            list$1349.push(statement$1350);
        }
        return list$1349;
    }
    function parseBlock$931() {
        var block$1351;
        expect$892('{');
        block$1351 = parseStatementList$930();
        expect$892('}');
        return delegate$848.createBlockStatement(block$1351);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$932() {
        var token$1352 = lookahead$851, resolvedIdent$1353;
        if (token$1352.type !== Token$829.Identifier) {
            throwUnexpected$891(token$1352);
        }
        resolvedIdent$1353 = expander$828.resolve(tokenStream$849[lookaheadIndex$852]);
        lex$885();
        return delegate$848.createIdentifier(resolvedIdent$1353);
    }
    function parseVariableDeclaration$933(kind$1354) {
        var id$1355, init$1356 = null;
        if (match$894('{')) {
            id$1355 = parseObjectInitialiser$906();
            reinterpretAsAssignmentBindingPattern$924(id$1355);
        } else if (match$894('[')) {
            id$1355 = parseArrayInitialiser$901();
            reinterpretAsAssignmentBindingPattern$924(id$1355);
        } else {
            id$1355 = state$853.allowKeyword ? parseNonComputedProperty$913() : parseVariableIdentifier$932();
            // 12.2.1
            if (strict$839 && isRestrictedWord$866(id$1355.name)) {
                throwErrorTolerant$890({}, Messages$834.StrictVarName);
            }
        }
        if (kind$1354 === 'const') {
            if (!match$894('=')) {
                throwError$889({}, Messages$834.NoUnintializedConst);
            }
            expect$892('=');
            init$1356 = parseAssignmentExpression$928();
        } else if (match$894('=')) {
            lex$885();
            init$1356 = parseAssignmentExpression$928();
        }
        return delegate$848.createVariableDeclarator(id$1355, init$1356);
    }
    function parseVariableDeclarationList$934(kind$1357) {
        var list$1358 = [];
        do {
            list$1358.push(parseVariableDeclaration$933(kind$1357));
            if (!match$894(',')) {
                break;
            }
            lex$885();
        } while (streamIndex$850 < length$847);
        return list$1358;
    }
    function parseVariableStatement$935() {
        var declarations$1359;
        expectKeyword$893('var');
        declarations$1359 = parseVariableDeclarationList$934();
        consumeSemicolon$898();
        return delegate$848.createVariableDeclaration(declarations$1359, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$936(kind$1360) {
        var declarations$1361;
        expectKeyword$893(kind$1360);
        declarations$1361 = parseVariableDeclarationList$934(kind$1360);
        consumeSemicolon$898();
        return delegate$848.createVariableDeclaration(declarations$1361, kind$1360);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$937() {
        var id$1362, src$1363, body$1364;
        lex$885();
        // 'module'
        if (peekLineTerminator$888()) {
            throwError$889({}, Messages$834.NewlineAfterModule);
        }
        switch (lookahead$851.type) {
        case Token$829.StringLiteral:
            id$1362 = parsePrimaryExpression$910();
            body$1364 = parseModuleBlock$980();
            src$1363 = null;
            break;
        case Token$829.Identifier:
            id$1362 = parseVariableIdentifier$932();
            body$1364 = null;
            if (!matchContextualKeyword$896('from')) {
                throwUnexpected$891(lex$885());
            }
            lex$885();
            src$1363 = parsePrimaryExpression$910();
            if (src$1363.type !== Syntax$832.Literal) {
                throwError$889({}, Messages$834.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$898();
        return delegate$848.createModuleDeclaration(id$1362, src$1363, body$1364);
    }
    function parseExportBatchSpecifier$938() {
        expect$892('*');
        return delegate$848.createExportBatchSpecifier();
    }
    function parseExportSpecifier$939() {
        var id$1365, name$1366 = null;
        id$1365 = parseVariableIdentifier$932();
        if (matchContextualKeyword$896('as')) {
            lex$885();
            name$1366 = parseNonComputedProperty$913();
        }
        return delegate$848.createExportSpecifier(id$1365, name$1366);
    }
    function parseExportDeclaration$940() {
        var previousAllowKeyword$1367, decl$1368, def$1369, src$1370, specifiers$1371;
        expectKeyword$893('export');
        if (lookahead$851.type === Token$829.Keyword) {
            switch (lookahead$851.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$848.createExportDeclaration(parseSourceElement$975(), null, null);
            }
        }
        if (isIdentifierName$882(lookahead$851)) {
            previousAllowKeyword$1367 = state$853.allowKeyword;
            state$853.allowKeyword = true;
            decl$1368 = parseVariableDeclarationList$934('let');
            state$853.allowKeyword = previousAllowKeyword$1367;
            return delegate$848.createExportDeclaration(decl$1368, null, null);
        }
        specifiers$1371 = [];
        src$1370 = null;
        if (match$894('*')) {
            specifiers$1371.push(parseExportBatchSpecifier$938());
        } else {
            expect$892('{');
            do {
                specifiers$1371.push(parseExportSpecifier$939());
            } while (match$894(',') && lex$885());
            expect$892('}');
        }
        if (matchContextualKeyword$896('from')) {
            lex$885();
            src$1370 = parsePrimaryExpression$910();
            if (src$1370.type !== Syntax$832.Literal) {
                throwError$889({}, Messages$834.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$898();
        return delegate$848.createExportDeclaration(null, specifiers$1371, src$1370);
    }
    function parseImportDeclaration$941() {
        var specifiers$1372, kind$1373, src$1374;
        expectKeyword$893('import');
        specifiers$1372 = [];
        if (isIdentifierName$882(lookahead$851)) {
            kind$1373 = 'default';
            specifiers$1372.push(parseImportSpecifier$942());
            if (!matchContextualKeyword$896('from')) {
                throwError$889({}, Messages$834.NoFromAfterImport);
            }
            lex$885();
        } else if (match$894('{')) {
            kind$1373 = 'named';
            lex$885();
            do {
                specifiers$1372.push(parseImportSpecifier$942());
            } while (match$894(',') && lex$885());
            expect$892('}');
            if (!matchContextualKeyword$896('from')) {
                throwError$889({}, Messages$834.NoFromAfterImport);
            }
            lex$885();
        }
        src$1374 = parsePrimaryExpression$910();
        if (src$1374.type !== Syntax$832.Literal) {
            throwError$889({}, Messages$834.InvalidModuleSpecifier);
        }
        consumeSemicolon$898();
        return delegate$848.createImportDeclaration(specifiers$1372, kind$1373, src$1374);
    }
    function parseImportSpecifier$942() {
        var id$1375, name$1376 = null;
        id$1375 = parseNonComputedProperty$913();
        if (matchContextualKeyword$896('as')) {
            lex$885();
            name$1376 = parseVariableIdentifier$932();
        }
        return delegate$848.createImportSpecifier(id$1375, name$1376);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$943() {
        expect$892(';');
        return delegate$848.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$944() {
        var expr$1377 = parseExpression$929();
        consumeSemicolon$898();
        return delegate$848.createExpressionStatement(expr$1377);
    }
    // 12.5 If statement
    function parseIfStatement$945() {
        var test$1378, consequent$1379, alternate$1380;
        expectKeyword$893('if');
        expect$892('(');
        test$1378 = parseExpression$929();
        expect$892(')');
        consequent$1379 = parseStatement$960();
        if (matchKeyword$895('else')) {
            lex$885();
            alternate$1380 = parseStatement$960();
        } else {
            alternate$1380 = null;
        }
        return delegate$848.createIfStatement(test$1378, consequent$1379, alternate$1380);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$946() {
        var body$1381, test$1382, oldInIteration$1383;
        expectKeyword$893('do');
        oldInIteration$1383 = state$853.inIteration;
        state$853.inIteration = true;
        body$1381 = parseStatement$960();
        state$853.inIteration = oldInIteration$1383;
        expectKeyword$893('while');
        expect$892('(');
        test$1382 = parseExpression$929();
        expect$892(')');
        if (match$894(';')) {
            lex$885();
        }
        return delegate$848.createDoWhileStatement(body$1381, test$1382);
    }
    function parseWhileStatement$947() {
        var test$1384, body$1385, oldInIteration$1386;
        expectKeyword$893('while');
        expect$892('(');
        test$1384 = parseExpression$929();
        expect$892(')');
        oldInIteration$1386 = state$853.inIteration;
        state$853.inIteration = true;
        body$1385 = parseStatement$960();
        state$853.inIteration = oldInIteration$1386;
        return delegate$848.createWhileStatement(test$1384, body$1385);
    }
    function parseForVariableDeclaration$948() {
        var token$1387 = lex$885(), declarations$1388 = parseVariableDeclarationList$934();
        return delegate$848.createVariableDeclaration(declarations$1388, token$1387.value);
    }
    function parseForStatement$949(opts$1389) {
        var init$1390, test$1391, update$1392, left$1393, right$1394, body$1395, operator$1396, oldInIteration$1397;
        init$1390 = test$1391 = update$1392 = null;
        expectKeyword$893('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$896('each')) {
            throwError$889({}, Messages$834.EachNotAllowed);
        }
        expect$892('(');
        if (match$894(';')) {
            lex$885();
        } else {
            if (matchKeyword$895('var') || matchKeyword$895('let') || matchKeyword$895('const')) {
                state$853.allowIn = false;
                init$1390 = parseForVariableDeclaration$948();
                state$853.allowIn = true;
                if (init$1390.declarations.length === 1) {
                    if (matchKeyword$895('in') || matchContextualKeyword$896('of')) {
                        operator$1396 = lookahead$851;
                        if (!((operator$1396.value === 'in' || init$1390.kind !== 'var') && init$1390.declarations[0].init)) {
                            lex$885();
                            left$1393 = init$1390;
                            right$1394 = parseExpression$929();
                            init$1390 = null;
                        }
                    }
                }
            } else {
                state$853.allowIn = false;
                init$1390 = parseExpression$929();
                state$853.allowIn = true;
                if (matchContextualKeyword$896('of')) {
                    operator$1396 = lex$885();
                    left$1393 = init$1390;
                    right$1394 = parseExpression$929();
                    init$1390 = null;
                } else if (matchKeyword$895('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$900(init$1390)) {
                        throwError$889({}, Messages$834.InvalidLHSInForIn);
                    }
                    operator$1396 = lex$885();
                    left$1393 = init$1390;
                    right$1394 = parseExpression$929();
                    init$1390 = null;
                }
            }
            if (typeof left$1393 === 'undefined') {
                expect$892(';');
            }
        }
        if (typeof left$1393 === 'undefined') {
            if (!match$894(';')) {
                test$1391 = parseExpression$929();
            }
            expect$892(';');
            if (!match$894(')')) {
                update$1392 = parseExpression$929();
            }
        }
        expect$892(')');
        oldInIteration$1397 = state$853.inIteration;
        state$853.inIteration = true;
        if (!(opts$1389 !== undefined && opts$1389.ignoreBody)) {
            body$1395 = parseStatement$960();
        }
        state$853.inIteration = oldInIteration$1397;
        if (typeof left$1393 === 'undefined') {
            return delegate$848.createForStatement(init$1390, test$1391, update$1392, body$1395);
        }
        if (operator$1396.value === 'in') {
            return delegate$848.createForInStatement(left$1393, right$1394, body$1395);
        }
        return delegate$848.createForOfStatement(left$1393, right$1394, body$1395);
    }
    // 12.7 The continue statement
    function parseContinueStatement$950() {
        var label$1398 = null, key$1399;
        expectKeyword$893('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$851.value.charCodeAt(0) === 59) {
            lex$885();
            if (!state$853.inIteration) {
                throwError$889({}, Messages$834.IllegalContinue);
            }
            return delegate$848.createContinueStatement(null);
        }
        if (peekLineTerminator$888()) {
            if (!state$853.inIteration) {
                throwError$889({}, Messages$834.IllegalContinue);
            }
            return delegate$848.createContinueStatement(null);
        }
        if (lookahead$851.type === Token$829.Identifier) {
            label$1398 = parseVariableIdentifier$932();
            key$1399 = '$' + label$1398.name;
            if (!Object.prototype.hasOwnProperty.call(state$853.labelSet, key$1399)) {
                throwError$889({}, Messages$834.UnknownLabel, label$1398.name);
            }
        }
        consumeSemicolon$898();
        if (label$1398 === null && !state$853.inIteration) {
            throwError$889({}, Messages$834.IllegalContinue);
        }
        return delegate$848.createContinueStatement(label$1398);
    }
    // 12.8 The break statement
    function parseBreakStatement$951() {
        var label$1400 = null, key$1401;
        expectKeyword$893('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$851.value.charCodeAt(0) === 59) {
            lex$885();
            if (!(state$853.inIteration || state$853.inSwitch)) {
                throwError$889({}, Messages$834.IllegalBreak);
            }
            return delegate$848.createBreakStatement(null);
        }
        if (peekLineTerminator$888()) {
            if (!(state$853.inIteration || state$853.inSwitch)) {
                throwError$889({}, Messages$834.IllegalBreak);
            }
            return delegate$848.createBreakStatement(null);
        }
        if (lookahead$851.type === Token$829.Identifier) {
            label$1400 = parseVariableIdentifier$932();
            key$1401 = '$' + label$1400.name;
            if (!Object.prototype.hasOwnProperty.call(state$853.labelSet, key$1401)) {
                throwError$889({}, Messages$834.UnknownLabel, label$1400.name);
            }
        }
        consumeSemicolon$898();
        if (label$1400 === null && !(state$853.inIteration || state$853.inSwitch)) {
            throwError$889({}, Messages$834.IllegalBreak);
        }
        return delegate$848.createBreakStatement(label$1400);
    }
    // 12.9 The return statement
    function parseReturnStatement$952() {
        var argument$1402 = null;
        expectKeyword$893('return');
        if (!state$853.inFunctionBody) {
            throwErrorTolerant$890({}, Messages$834.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$862(String(lookahead$851.value).charCodeAt(0))) {
            argument$1402 = parseExpression$929();
            consumeSemicolon$898();
            return delegate$848.createReturnStatement(argument$1402);
        }
        if (peekLineTerminator$888()) {
            return delegate$848.createReturnStatement(null);
        }
        if (!match$894(';')) {
            if (!match$894('}') && lookahead$851.type !== Token$829.EOF) {
                argument$1402 = parseExpression$929();
            }
        }
        consumeSemicolon$898();
        return delegate$848.createReturnStatement(argument$1402);
    }
    // 12.10 The with statement
    function parseWithStatement$953() {
        var object$1403, body$1404;
        if (strict$839) {
            throwErrorTolerant$890({}, Messages$834.StrictModeWith);
        }
        expectKeyword$893('with');
        expect$892('(');
        object$1403 = parseExpression$929();
        expect$892(')');
        body$1404 = parseStatement$960();
        return delegate$848.createWithStatement(object$1403, body$1404);
    }
    // 12.10 The swith statement
    function parseSwitchCase$954() {
        var test$1405, consequent$1406 = [], sourceElement$1407;
        if (matchKeyword$895('default')) {
            lex$885();
            test$1405 = null;
        } else {
            expectKeyword$893('case');
            test$1405 = parseExpression$929();
        }
        expect$892(':');
        while (streamIndex$850 < length$847) {
            if (match$894('}') || matchKeyword$895('default') || matchKeyword$895('case')) {
                break;
            }
            sourceElement$1407 = parseSourceElement$975();
            if (typeof sourceElement$1407 === 'undefined') {
                break;
            }
            consequent$1406.push(sourceElement$1407);
        }
        return delegate$848.createSwitchCase(test$1405, consequent$1406);
    }
    function parseSwitchStatement$955() {
        var discriminant$1408, cases$1409, clause$1410, oldInSwitch$1411, defaultFound$1412;
        expectKeyword$893('switch');
        expect$892('(');
        discriminant$1408 = parseExpression$929();
        expect$892(')');
        expect$892('{');
        cases$1409 = [];
        if (match$894('}')) {
            lex$885();
            return delegate$848.createSwitchStatement(discriminant$1408, cases$1409);
        }
        oldInSwitch$1411 = state$853.inSwitch;
        state$853.inSwitch = true;
        defaultFound$1412 = false;
        while (streamIndex$850 < length$847) {
            if (match$894('}')) {
                break;
            }
            clause$1410 = parseSwitchCase$954();
            if (clause$1410.test === null) {
                if (defaultFound$1412) {
                    throwError$889({}, Messages$834.MultipleDefaultsInSwitch);
                }
                defaultFound$1412 = true;
            }
            cases$1409.push(clause$1410);
        }
        state$853.inSwitch = oldInSwitch$1411;
        expect$892('}');
        return delegate$848.createSwitchStatement(discriminant$1408, cases$1409);
    }
    // 12.13 The throw statement
    function parseThrowStatement$956() {
        var argument$1413;
        expectKeyword$893('throw');
        if (peekLineTerminator$888()) {
            throwError$889({}, Messages$834.NewlineAfterThrow);
        }
        argument$1413 = parseExpression$929();
        consumeSemicolon$898();
        return delegate$848.createThrowStatement(argument$1413);
    }
    // 12.14 The try statement
    function parseCatchClause$957() {
        var param$1414, body$1415;
        expectKeyword$893('catch');
        expect$892('(');
        if (match$894(')')) {
            throwUnexpected$891(lookahead$851);
        }
        param$1414 = parseExpression$929();
        // 12.14.1
        if (strict$839 && param$1414.type === Syntax$832.Identifier && isRestrictedWord$866(param$1414.name)) {
            throwErrorTolerant$890({}, Messages$834.StrictCatchVariable);
        }
        expect$892(')');
        body$1415 = parseBlock$931();
        return delegate$848.createCatchClause(param$1414, body$1415);
    }
    function parseTryStatement$958() {
        var block$1416, handlers$1417 = [], finalizer$1418 = null;
        expectKeyword$893('try');
        block$1416 = parseBlock$931();
        if (matchKeyword$895('catch')) {
            handlers$1417.push(parseCatchClause$957());
        }
        if (matchKeyword$895('finally')) {
            lex$885();
            finalizer$1418 = parseBlock$931();
        }
        if (handlers$1417.length === 0 && !finalizer$1418) {
            throwError$889({}, Messages$834.NoCatchOrFinally);
        }
        return delegate$848.createTryStatement(block$1416, [], handlers$1417, finalizer$1418);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$959() {
        expectKeyword$893('debugger');
        consumeSemicolon$898();
        return delegate$848.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$960() {
        var type$1419 = lookahead$851.type, expr$1420, labeledBody$1421, key$1422;
        if (type$1419 === Token$829.EOF) {
            throwUnexpected$891(lookahead$851);
        }
        if (type$1419 === Token$829.Punctuator) {
            switch (lookahead$851.value) {
            case ';':
                return parseEmptyStatement$943();
            case '{':
                return parseBlock$931();
            case '(':
                return parseExpressionStatement$944();
            default:
                break;
            }
        }
        if (type$1419 === Token$829.Keyword) {
            switch (lookahead$851.value) {
            case 'break':
                return parseBreakStatement$951();
            case 'continue':
                return parseContinueStatement$950();
            case 'debugger':
                return parseDebuggerStatement$959();
            case 'do':
                return parseDoWhileStatement$946();
            case 'for':
                return parseForStatement$949();
            case 'function':
                return parseFunctionDeclaration$966();
            case 'class':
                return parseClassDeclaration$973();
            case 'if':
                return parseIfStatement$945();
            case 'return':
                return parseReturnStatement$952();
            case 'switch':
                return parseSwitchStatement$955();
            case 'throw':
                return parseThrowStatement$956();
            case 'try':
                return parseTryStatement$958();
            case 'var':
                return parseVariableStatement$935();
            case 'while':
                return parseWhileStatement$947();
            case 'with':
                return parseWithStatement$953();
            default:
                break;
            }
        }
        expr$1420 = parseExpression$929();
        // 12.12 Labelled Statements
        if (expr$1420.type === Syntax$832.Identifier && match$894(':')) {
            lex$885();
            key$1422 = '$' + expr$1420.name;
            if (Object.prototype.hasOwnProperty.call(state$853.labelSet, key$1422)) {
                throwError$889({}, Messages$834.Redeclaration, 'Label', expr$1420.name);
            }
            state$853.labelSet[key$1422] = true;
            labeledBody$1421 = parseStatement$960();
            delete state$853.labelSet[key$1422];
            return delegate$848.createLabeledStatement(expr$1420, labeledBody$1421);
        }
        consumeSemicolon$898();
        return delegate$848.createExpressionStatement(expr$1420);
    }
    // 13 Function Definition
    function parseConciseBody$961() {
        if (match$894('{')) {
            return parseFunctionSourceElements$962();
        }
        return parseAssignmentExpression$928();
    }
    function parseFunctionSourceElements$962() {
        var sourceElement$1423, sourceElements$1424 = [], token$1425, directive$1426, firstRestricted$1427, oldLabelSet$1428, oldInIteration$1429, oldInSwitch$1430, oldInFunctionBody$1431, oldParenthesizedCount$1432;
        expect$892('{');
        while (streamIndex$850 < length$847) {
            if (lookahead$851.type !== Token$829.StringLiteral) {
                break;
            }
            token$1425 = lookahead$851;
            sourceElement$1423 = parseSourceElement$975();
            sourceElements$1424.push(sourceElement$1423);
            if (sourceElement$1423.expression.type !== Syntax$832.Literal) {
                // this is not directive
                break;
            }
            directive$1426 = token$1425.value;
            if (directive$1426 === 'use strict') {
                strict$839 = true;
                if (firstRestricted$1427) {
                    throwErrorTolerant$890(firstRestricted$1427, Messages$834.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1427 && token$1425.octal) {
                    firstRestricted$1427 = token$1425;
                }
            }
        }
        oldLabelSet$1428 = state$853.labelSet;
        oldInIteration$1429 = state$853.inIteration;
        oldInSwitch$1430 = state$853.inSwitch;
        oldInFunctionBody$1431 = state$853.inFunctionBody;
        oldParenthesizedCount$1432 = state$853.parenthesizedCount;
        state$853.labelSet = {};
        state$853.inIteration = false;
        state$853.inSwitch = false;
        state$853.inFunctionBody = true;
        state$853.parenthesizedCount = 0;
        while (streamIndex$850 < length$847) {
            if (match$894('}')) {
                break;
            }
            sourceElement$1423 = parseSourceElement$975();
            if (typeof sourceElement$1423 === 'undefined') {
                break;
            }
            sourceElements$1424.push(sourceElement$1423);
        }
        expect$892('}');
        state$853.labelSet = oldLabelSet$1428;
        state$853.inIteration = oldInIteration$1429;
        state$853.inSwitch = oldInSwitch$1430;
        state$853.inFunctionBody = oldInFunctionBody$1431;
        state$853.parenthesizedCount = oldParenthesizedCount$1432;
        return delegate$848.createBlockStatement(sourceElements$1424);
    }
    function validateParam$963(options$1433, param$1434, name$1435) {
        var key$1436 = '$' + name$1435;
        if (strict$839) {
            if (isRestrictedWord$866(name$1435)) {
                options$1433.stricted = param$1434;
                options$1433.message = Messages$834.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1433.paramSet, key$1436)) {
                options$1433.stricted = param$1434;
                options$1433.message = Messages$834.StrictParamDupe;
            }
        } else if (!options$1433.firstRestricted) {
            if (isRestrictedWord$866(name$1435)) {
                options$1433.firstRestricted = param$1434;
                options$1433.message = Messages$834.StrictParamName;
            } else if (isStrictModeReservedWord$865(name$1435)) {
                options$1433.firstRestricted = param$1434;
                options$1433.message = Messages$834.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1433.paramSet, key$1436)) {
                options$1433.firstRestricted = param$1434;
                options$1433.message = Messages$834.StrictParamDupe;
            }
        }
        options$1433.paramSet[key$1436] = true;
    }
    function parseParam$964(options$1437) {
        var token$1438, rest$1439, param$1440, def$1441;
        token$1438 = lookahead$851;
        if (token$1438.value === '...') {
            token$1438 = lex$885();
            rest$1439 = true;
        }
        if (match$894('[')) {
            param$1440 = parseArrayInitialiser$901();
            reinterpretAsDestructuredParameter$925(options$1437, param$1440);
        } else if (match$894('{')) {
            if (rest$1439) {
                throwError$889({}, Messages$834.ObjectPatternAsRestParameter);
            }
            param$1440 = parseObjectInitialiser$906();
            reinterpretAsDestructuredParameter$925(options$1437, param$1440);
        } else {
            param$1440 = parseVariableIdentifier$932();
            validateParam$963(options$1437, token$1438, token$1438.value);
            if (match$894('=')) {
                if (rest$1439) {
                    throwErrorTolerant$890(lookahead$851, Messages$834.DefaultRestParameter);
                }
                lex$885();
                def$1441 = parseAssignmentExpression$928();
                ++options$1437.defaultCount;
            }
        }
        if (rest$1439) {
            if (!match$894(')')) {
                throwError$889({}, Messages$834.ParameterAfterRestParameter);
            }
            options$1437.rest = param$1440;
            return false;
        }
        options$1437.params.push(param$1440);
        options$1437.defaults.push(def$1441);
        return !match$894(')');
    }
    function parseParams$965(firstRestricted$1442) {
        var options$1443;
        options$1443 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1442
        };
        expect$892('(');
        if (!match$894(')')) {
            options$1443.paramSet = {};
            while (streamIndex$850 < length$847) {
                if (!parseParam$964(options$1443)) {
                    break;
                }
                expect$892(',');
            }
        }
        expect$892(')');
        if (options$1443.defaultCount === 0) {
            options$1443.defaults = [];
        }
        return options$1443;
    }
    function parseFunctionDeclaration$966() {
        var id$1444, body$1445, token$1446, tmp$1447, firstRestricted$1448, message$1449, previousStrict$1450, previousYieldAllowed$1451, generator$1452, expression$1453;
        expectKeyword$893('function');
        generator$1452 = false;
        if (match$894('*')) {
            lex$885();
            generator$1452 = true;
        }
        token$1446 = lookahead$851;
        id$1444 = parseVariableIdentifier$932();
        if (strict$839) {
            if (isRestrictedWord$866(token$1446.value)) {
                throwErrorTolerant$890(token$1446, Messages$834.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$866(token$1446.value)) {
                firstRestricted$1448 = token$1446;
                message$1449 = Messages$834.StrictFunctionName;
            } else if (isStrictModeReservedWord$865(token$1446.value)) {
                firstRestricted$1448 = token$1446;
                message$1449 = Messages$834.StrictReservedWord;
            }
        }
        tmp$1447 = parseParams$965(firstRestricted$1448);
        firstRestricted$1448 = tmp$1447.firstRestricted;
        if (tmp$1447.message) {
            message$1449 = tmp$1447.message;
        }
        previousStrict$1450 = strict$839;
        previousYieldAllowed$1451 = state$853.yieldAllowed;
        state$853.yieldAllowed = generator$1452;
        // here we redo some work in order to set 'expression'
        expression$1453 = !match$894('{');
        body$1445 = parseConciseBody$961();
        if (strict$839 && firstRestricted$1448) {
            throwError$889(firstRestricted$1448, message$1449);
        }
        if (strict$839 && tmp$1447.stricted) {
            throwErrorTolerant$890(tmp$1447.stricted, message$1449);
        }
        if (state$853.yieldAllowed && !state$853.yieldFound) {
            throwErrorTolerant$890({}, Messages$834.NoYieldInGenerator);
        }
        strict$839 = previousStrict$1450;
        state$853.yieldAllowed = previousYieldAllowed$1451;
        return delegate$848.createFunctionDeclaration(id$1444, tmp$1447.params, tmp$1447.defaults, body$1445, tmp$1447.rest, generator$1452, expression$1453);
    }
    function parseFunctionExpression$967() {
        var token$1454, id$1455 = null, firstRestricted$1456, message$1457, tmp$1458, body$1459, previousStrict$1460, previousYieldAllowed$1461, generator$1462, expression$1463;
        expectKeyword$893('function');
        generator$1462 = false;
        if (match$894('*')) {
            lex$885();
            generator$1462 = true;
        }
        if (!match$894('(')) {
            token$1454 = lookahead$851;
            id$1455 = parseVariableIdentifier$932();
            if (strict$839) {
                if (isRestrictedWord$866(token$1454.value)) {
                    throwErrorTolerant$890(token$1454, Messages$834.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$866(token$1454.value)) {
                    firstRestricted$1456 = token$1454;
                    message$1457 = Messages$834.StrictFunctionName;
                } else if (isStrictModeReservedWord$865(token$1454.value)) {
                    firstRestricted$1456 = token$1454;
                    message$1457 = Messages$834.StrictReservedWord;
                }
            }
        }
        tmp$1458 = parseParams$965(firstRestricted$1456);
        firstRestricted$1456 = tmp$1458.firstRestricted;
        if (tmp$1458.message) {
            message$1457 = tmp$1458.message;
        }
        previousStrict$1460 = strict$839;
        previousYieldAllowed$1461 = state$853.yieldAllowed;
        state$853.yieldAllowed = generator$1462;
        // here we redo some work in order to set 'expression'
        expression$1463 = !match$894('{');
        body$1459 = parseConciseBody$961();
        if (strict$839 && firstRestricted$1456) {
            throwError$889(firstRestricted$1456, message$1457);
        }
        if (strict$839 && tmp$1458.stricted) {
            throwErrorTolerant$890(tmp$1458.stricted, message$1457);
        }
        if (state$853.yieldAllowed && !state$853.yieldFound) {
            throwErrorTolerant$890({}, Messages$834.NoYieldInGenerator);
        }
        strict$839 = previousStrict$1460;
        state$853.yieldAllowed = previousYieldAllowed$1461;
        return delegate$848.createFunctionExpression(id$1455, tmp$1458.params, tmp$1458.defaults, body$1459, tmp$1458.rest, generator$1462, expression$1463);
    }
    function parseYieldExpression$968() {
        var delegateFlag$1464, expr$1465, previousYieldAllowed$1466;
        expectKeyword$893('yield');
        if (!state$853.yieldAllowed) {
            throwErrorTolerant$890({}, Messages$834.IllegalYield);
        }
        delegateFlag$1464 = false;
        if (match$894('*')) {
            lex$885();
            delegateFlag$1464 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1466 = state$853.yieldAllowed;
        state$853.yieldAllowed = false;
        expr$1465 = parseAssignmentExpression$928();
        state$853.yieldAllowed = previousYieldAllowed$1466;
        state$853.yieldFound = true;
        return delegate$848.createYieldExpression(expr$1465, delegateFlag$1464);
    }
    // 14 Classes
    function parseMethodDefinition$969(existingPropNames$1467) {
        var token$1468, key$1469, param$1470, propType$1471, isValidDuplicateProp$1472 = false;
        if (lookahead$851.value === 'static') {
            propType$1471 = ClassPropertyType$837.static;
            lex$885();
        } else {
            propType$1471 = ClassPropertyType$837.prototype;
        }
        if (match$894('*')) {
            lex$885();
            return delegate$848.createMethodDefinition(propType$1471, '', parseObjectPropertyKey$904(), parsePropertyMethodFunction$903({ generator: true }));
        }
        token$1468 = lookahead$851;
        key$1469 = parseObjectPropertyKey$904();
        if (token$1468.value === 'get' && !match$894('(')) {
            key$1469 = parseObjectPropertyKey$904();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1467[propType$1471].hasOwnProperty(key$1469.name)) {
                isValidDuplicateProp$1472 = existingPropNames$1467[propType$1471][key$1469.name].get === undefined && existingPropNames$1467[propType$1471][key$1469.name].data === undefined && existingPropNames$1467[propType$1471][key$1469.name].set !== undefined;
                if (!isValidDuplicateProp$1472) {
                    throwError$889(key$1469, Messages$834.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1467[propType$1471][key$1469.name] = {};
            }
            existingPropNames$1467[propType$1471][key$1469.name].get = true;
            expect$892('(');
            expect$892(')');
            return delegate$848.createMethodDefinition(propType$1471, 'get', key$1469, parsePropertyFunction$902({ generator: false }));
        }
        if (token$1468.value === 'set' && !match$894('(')) {
            key$1469 = parseObjectPropertyKey$904();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1467[propType$1471].hasOwnProperty(key$1469.name)) {
                isValidDuplicateProp$1472 = existingPropNames$1467[propType$1471][key$1469.name].set === undefined && existingPropNames$1467[propType$1471][key$1469.name].data === undefined && existingPropNames$1467[propType$1471][key$1469.name].get !== undefined;
                if (!isValidDuplicateProp$1472) {
                    throwError$889(key$1469, Messages$834.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1467[propType$1471][key$1469.name] = {};
            }
            existingPropNames$1467[propType$1471][key$1469.name].set = true;
            expect$892('(');
            token$1468 = lookahead$851;
            param$1470 = [parseVariableIdentifier$932()];
            expect$892(')');
            return delegate$848.createMethodDefinition(propType$1471, 'set', key$1469, parsePropertyFunction$902({
                params: param$1470,
                generator: false,
                name: token$1468
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1467[propType$1471].hasOwnProperty(key$1469.name)) {
            throwError$889(key$1469, Messages$834.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1467[propType$1471][key$1469.name] = {};
        }
        existingPropNames$1467[propType$1471][key$1469.name].data = true;
        return delegate$848.createMethodDefinition(propType$1471, '', key$1469, parsePropertyMethodFunction$903({ generator: false }));
    }
    function parseClassElement$970(existingProps$1473) {
        if (match$894(';')) {
            lex$885();
            return;
        }
        return parseMethodDefinition$969(existingProps$1473);
    }
    function parseClassBody$971() {
        var classElement$1474, classElements$1475 = [], existingProps$1476 = {};
        existingProps$1476[ClassPropertyType$837.static] = {};
        existingProps$1476[ClassPropertyType$837.prototype] = {};
        expect$892('{');
        while (streamIndex$850 < length$847) {
            if (match$894('}')) {
                break;
            }
            classElement$1474 = parseClassElement$970(existingProps$1476);
            if (typeof classElement$1474 !== 'undefined') {
                classElements$1475.push(classElement$1474);
            }
        }
        expect$892('}');
        return delegate$848.createClassBody(classElements$1475);
    }
    function parseClassExpression$972() {
        var id$1477, previousYieldAllowed$1478, superClass$1479 = null;
        expectKeyword$893('class');
        if (!matchKeyword$895('extends') && !match$894('{')) {
            id$1477 = parseVariableIdentifier$932();
        }
        if (matchKeyword$895('extends')) {
            expectKeyword$893('extends');
            previousYieldAllowed$1478 = state$853.yieldAllowed;
            state$853.yieldAllowed = false;
            superClass$1479 = parseAssignmentExpression$928();
            state$853.yieldAllowed = previousYieldAllowed$1478;
        }
        return delegate$848.createClassExpression(id$1477, superClass$1479, parseClassBody$971());
    }
    function parseClassDeclaration$973() {
        var id$1480, previousYieldAllowed$1481, superClass$1482 = null;
        expectKeyword$893('class');
        id$1480 = parseVariableIdentifier$932();
        if (matchKeyword$895('extends')) {
            expectKeyword$893('extends');
            previousYieldAllowed$1481 = state$853.yieldAllowed;
            state$853.yieldAllowed = false;
            superClass$1482 = parseAssignmentExpression$928();
            state$853.yieldAllowed = previousYieldAllowed$1481;
        }
        return delegate$848.createClassDeclaration(id$1480, superClass$1482, parseClassBody$971());
    }
    // 15 Program
    function matchModuleDeclaration$974() {
        var id$1483;
        if (matchContextualKeyword$896('module')) {
            id$1483 = lookahead2$887();
            return id$1483.type === Token$829.StringLiteral || id$1483.type === Token$829.Identifier;
        }
        return false;
    }
    function parseSourceElement$975() {
        if (lookahead$851.type === Token$829.Keyword) {
            switch (lookahead$851.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$936(lookahead$851.value);
            case 'function':
                return parseFunctionDeclaration$966();
            case 'export':
                return parseExportDeclaration$940();
            case 'import':
                return parseImportDeclaration$941();
            default:
                return parseStatement$960();
            }
        }
        if (matchModuleDeclaration$974()) {
            throwError$889({}, Messages$834.NestedModule);
        }
        if (lookahead$851.type !== Token$829.EOF) {
            return parseStatement$960();
        }
    }
    function parseProgramElement$976() {
        if (lookahead$851.type === Token$829.Keyword) {
            switch (lookahead$851.value) {
            case 'export':
                return parseExportDeclaration$940();
            case 'import':
                return parseImportDeclaration$941();
            }
        }
        if (matchModuleDeclaration$974()) {
            return parseModuleDeclaration$937();
        }
        return parseSourceElement$975();
    }
    function parseProgramElements$977() {
        var sourceElement$1484, sourceElements$1485 = [], token$1486, directive$1487, firstRestricted$1488;
        while (streamIndex$850 < length$847) {
            token$1486 = lookahead$851;
            if (token$1486.type !== Token$829.StringLiteral) {
                break;
            }
            sourceElement$1484 = parseProgramElement$976();
            sourceElements$1485.push(sourceElement$1484);
            if (sourceElement$1484.expression.type !== Syntax$832.Literal) {
                // this is not directive
                break;
            }
            assert$855(false, 'directive isn\'t right');
            directive$1487 = source$838.slice(token$1486.range[0] + 1, token$1486.range[1] - 1);
            if (directive$1487 === 'use strict') {
                strict$839 = true;
                if (firstRestricted$1488) {
                    throwErrorTolerant$890(firstRestricted$1488, Messages$834.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1488 && token$1486.octal) {
                    firstRestricted$1488 = token$1486;
                }
            }
        }
        while (streamIndex$850 < length$847) {
            sourceElement$1484 = parseProgramElement$976();
            if (typeof sourceElement$1484 === 'undefined') {
                break;
            }
            sourceElements$1485.push(sourceElement$1484);
        }
        return sourceElements$1485;
    }
    function parseModuleElement$978() {
        return parseSourceElement$975();
    }
    function parseModuleElements$979() {
        var list$1489 = [], statement$1490;
        while (streamIndex$850 < length$847) {
            if (match$894('}')) {
                break;
            }
            statement$1490 = parseModuleElement$978();
            if (typeof statement$1490 === 'undefined') {
                break;
            }
            list$1489.push(statement$1490);
        }
        return list$1489;
    }
    function parseModuleBlock$980() {
        var block$1491;
        expect$892('{');
        block$1491 = parseModuleElements$979();
        expect$892('}');
        return delegate$848.createBlockStatement(block$1491);
    }
    function parseProgram$981() {
        var body$1492;
        strict$839 = false;
        peek$886();
        body$1492 = parseProgramElements$977();
        return delegate$848.createProgram(body$1492);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$982(type$1493, value$1494, start$1495, end$1496, loc$1497) {
        assert$855(typeof start$1495 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$854.comments.length > 0) {
            if (extra$854.comments[extra$854.comments.length - 1].range[1] > start$1495) {
                return;
            }
        }
        extra$854.comments.push({
            type: type$1493,
            value: value$1494,
            range: [
                start$1495,
                end$1496
            ],
            loc: loc$1497
        });
    }
    function scanComment$983() {
        var comment$1498, ch$1499, loc$1500, start$1501, blockComment$1502, lineComment$1503;
        comment$1498 = '';
        blockComment$1502 = false;
        lineComment$1503 = false;
        while (index$840 < length$847) {
            ch$1499 = source$838[index$840];
            if (lineComment$1503) {
                ch$1499 = source$838[index$840++];
                if (isLineTerminator$861(ch$1499.charCodeAt(0))) {
                    loc$1500.end = {
                        line: lineNumber$841,
                        column: index$840 - lineStart$842 - 1
                    };
                    lineComment$1503 = false;
                    addComment$982('Line', comment$1498, start$1501, index$840 - 1, loc$1500);
                    if (ch$1499 === '\r' && source$838[index$840] === '\n') {
                        ++index$840;
                    }
                    ++lineNumber$841;
                    lineStart$842 = index$840;
                    comment$1498 = '';
                } else if (index$840 >= length$847) {
                    lineComment$1503 = false;
                    comment$1498 += ch$1499;
                    loc$1500.end = {
                        line: lineNumber$841,
                        column: length$847 - lineStart$842
                    };
                    addComment$982('Line', comment$1498, start$1501, length$847, loc$1500);
                } else {
                    comment$1498 += ch$1499;
                }
            } else if (blockComment$1502) {
                if (isLineTerminator$861(ch$1499.charCodeAt(0))) {
                    if (ch$1499 === '\r' && source$838[index$840 + 1] === '\n') {
                        ++index$840;
                        comment$1498 += '\r\n';
                    } else {
                        comment$1498 += ch$1499;
                    }
                    ++lineNumber$841;
                    ++index$840;
                    lineStart$842 = index$840;
                    if (index$840 >= length$847) {
                        throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1499 = source$838[index$840++];
                    if (index$840 >= length$847) {
                        throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1498 += ch$1499;
                    if (ch$1499 === '*') {
                        ch$1499 = source$838[index$840];
                        if (ch$1499 === '/') {
                            comment$1498 = comment$1498.substr(0, comment$1498.length - 1);
                            blockComment$1502 = false;
                            ++index$840;
                            loc$1500.end = {
                                line: lineNumber$841,
                                column: index$840 - lineStart$842
                            };
                            addComment$982('Block', comment$1498, start$1501, index$840, loc$1500);
                            comment$1498 = '';
                        }
                    }
                }
            } else if (ch$1499 === '/') {
                ch$1499 = source$838[index$840 + 1];
                if (ch$1499 === '/') {
                    loc$1500 = {
                        start: {
                            line: lineNumber$841,
                            column: index$840 - lineStart$842
                        }
                    };
                    start$1501 = index$840;
                    index$840 += 2;
                    lineComment$1503 = true;
                    if (index$840 >= length$847) {
                        loc$1500.end = {
                            line: lineNumber$841,
                            column: index$840 - lineStart$842
                        };
                        lineComment$1503 = false;
                        addComment$982('Line', comment$1498, start$1501, index$840, loc$1500);
                    }
                } else if (ch$1499 === '*') {
                    start$1501 = index$840;
                    index$840 += 2;
                    blockComment$1502 = true;
                    loc$1500 = {
                        start: {
                            line: lineNumber$841,
                            column: index$840 - lineStart$842 - 2
                        }
                    };
                    if (index$840 >= length$847) {
                        throwError$889({}, Messages$834.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$860(ch$1499.charCodeAt(0))) {
                ++index$840;
            } else if (isLineTerminator$861(ch$1499.charCodeAt(0))) {
                ++index$840;
                if (ch$1499 === '\r' && source$838[index$840] === '\n') {
                    ++index$840;
                }
                ++lineNumber$841;
                lineStart$842 = index$840;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$984() {
        var i$1504, entry$1505, comment$1506, comments$1507 = [];
        for (i$1504 = 0; i$1504 < extra$854.comments.length; ++i$1504) {
            entry$1505 = extra$854.comments[i$1504];
            comment$1506 = {
                type: entry$1505.type,
                value: entry$1505.value
            };
            if (extra$854.range) {
                comment$1506.range = entry$1505.range;
            }
            if (extra$854.loc) {
                comment$1506.loc = entry$1505.loc;
            }
            comments$1507.push(comment$1506);
        }
        extra$854.comments = comments$1507;
    }
    function collectToken$985() {
        var start$1508, loc$1509, token$1510, range$1511, value$1512;
        skipComment$868();
        start$1508 = index$840;
        loc$1509 = {
            start: {
                line: lineNumber$841,
                column: index$840 - lineStart$842
            }
        };
        token$1510 = extra$854.advance();
        loc$1509.end = {
            line: lineNumber$841,
            column: index$840 - lineStart$842
        };
        if (token$1510.type !== Token$829.EOF) {
            range$1511 = [
                token$1510.range[0],
                token$1510.range[1]
            ];
            value$1512 = source$838.slice(token$1510.range[0], token$1510.range[1]);
            extra$854.tokens.push({
                type: TokenName$830[token$1510.type],
                value: value$1512,
                range: range$1511,
                loc: loc$1509
            });
        }
        return token$1510;
    }
    function collectRegex$986() {
        var pos$1513, loc$1514, regex$1515, token$1516;
        skipComment$868();
        pos$1513 = index$840;
        loc$1514 = {
            start: {
                line: lineNumber$841,
                column: index$840 - lineStart$842
            }
        };
        regex$1515 = extra$854.scanRegExp();
        loc$1514.end = {
            line: lineNumber$841,
            column: index$840 - lineStart$842
        };
        if (!extra$854.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$854.tokens.length > 0) {
                token$1516 = extra$854.tokens[extra$854.tokens.length - 1];
                if (token$1516.range[0] === pos$1513 && token$1516.type === 'Punctuator') {
                    if (token$1516.value === '/' || token$1516.value === '/=') {
                        extra$854.tokens.pop();
                    }
                }
            }
            extra$854.tokens.push({
                type: 'RegularExpression',
                value: regex$1515.literal,
                range: [
                    pos$1513,
                    index$840
                ],
                loc: loc$1514
            });
        }
        return regex$1515;
    }
    function filterTokenLocation$987() {
        var i$1517, entry$1518, token$1519, tokens$1520 = [];
        for (i$1517 = 0; i$1517 < extra$854.tokens.length; ++i$1517) {
            entry$1518 = extra$854.tokens[i$1517];
            token$1519 = {
                type: entry$1518.type,
                value: entry$1518.value
            };
            if (extra$854.range) {
                token$1519.range = entry$1518.range;
            }
            if (extra$854.loc) {
                token$1519.loc = entry$1518.loc;
            }
            tokens$1520.push(token$1519);
        }
        extra$854.tokens = tokens$1520;
    }
    function LocationMarker$988() {
        var sm_index$1521 = lookahead$851 ? lookahead$851.sm_range[0] : 0;
        var sm_lineStart$1522 = lookahead$851 ? lookahead$851.sm_lineStart : 0;
        var sm_lineNumber$1523 = lookahead$851 ? lookahead$851.sm_lineNumber : 1;
        this.range = [
            sm_index$1521,
            sm_index$1521
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1523,
                column: sm_index$1521 - sm_lineStart$1522
            },
            end: {
                line: sm_lineNumber$1523,
                column: sm_index$1521 - sm_lineStart$1522
            }
        };
    }
    LocationMarker$988.prototype = {
        constructor: LocationMarker$988,
        end: function () {
            this.range[1] = sm_index$846;
            this.loc.end.line = sm_lineNumber$843;
            this.loc.end.column = sm_index$846 - sm_lineStart$844;
        },
        applyGroup: function (node$1524) {
            if (extra$854.range) {
                node$1524.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$854.loc) {
                node$1524.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1524 = delegate$848.postProcess(node$1524);
            }
        },
        apply: function (node$1525) {
            var nodeType$1526 = typeof node$1525;
            assert$855(nodeType$1526 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1526);
            if (extra$854.range) {
                node$1525.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$854.loc) {
                node$1525.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1525 = delegate$848.postProcess(node$1525);
            }
        }
    };
    function createLocationMarker$989() {
        return new LocationMarker$988();
    }
    function trackGroupExpression$990() {
        var marker$1527, expr$1528;
        marker$1527 = createLocationMarker$989();
        expect$892('(');
        ++state$853.parenthesizedCount;
        expr$1528 = parseExpression$929();
        expect$892(')');
        marker$1527.end();
        marker$1527.applyGroup(expr$1528);
        return expr$1528;
    }
    function trackLeftHandSideExpression$991() {
        var marker$1529, expr$1530;
        // skipComment();
        marker$1529 = createLocationMarker$989();
        expr$1530 = matchKeyword$895('new') ? parseNewExpression$916() : parsePrimaryExpression$910();
        while (match$894('.') || match$894('[') || lookahead$851.type === Token$829.Template) {
            if (match$894('[')) {
                expr$1530 = delegate$848.createMemberExpression('[', expr$1530, parseComputedMember$915());
                marker$1529.end();
                marker$1529.apply(expr$1530);
            } else if (match$894('.')) {
                expr$1530 = delegate$848.createMemberExpression('.', expr$1530, parseNonComputedMember$914());
                marker$1529.end();
                marker$1529.apply(expr$1530);
            } else {
                expr$1530 = delegate$848.createTaggedTemplateExpression(expr$1530, parseTemplateLiteral$908());
                marker$1529.end();
                marker$1529.apply(expr$1530);
            }
        }
        return expr$1530;
    }
    function trackLeftHandSideExpressionAllowCall$992() {
        var marker$1531, expr$1532, args$1533;
        // skipComment();
        marker$1531 = createLocationMarker$989();
        expr$1532 = matchKeyword$895('new') ? parseNewExpression$916() : parsePrimaryExpression$910();
        while (match$894('.') || match$894('[') || match$894('(') || lookahead$851.type === Token$829.Template) {
            if (match$894('(')) {
                args$1533 = parseArguments$911();
                expr$1532 = delegate$848.createCallExpression(expr$1532, args$1533);
                marker$1531.end();
                marker$1531.apply(expr$1532);
            } else if (match$894('[')) {
                expr$1532 = delegate$848.createMemberExpression('[', expr$1532, parseComputedMember$915());
                marker$1531.end();
                marker$1531.apply(expr$1532);
            } else if (match$894('.')) {
                expr$1532 = delegate$848.createMemberExpression('.', expr$1532, parseNonComputedMember$914());
                marker$1531.end();
                marker$1531.apply(expr$1532);
            } else {
                expr$1532 = delegate$848.createTaggedTemplateExpression(expr$1532, parseTemplateLiteral$908());
                marker$1531.end();
                marker$1531.apply(expr$1532);
            }
        }
        return expr$1532;
    }
    function filterGroup$993(node$1534) {
        var n$1535, i$1536, entry$1537;
        n$1535 = Object.prototype.toString.apply(node$1534) === '[object Array]' ? [] : {};
        for (i$1536 in node$1534) {
            if (node$1534.hasOwnProperty(i$1536) && i$1536 !== 'groupRange' && i$1536 !== 'groupLoc') {
                entry$1537 = node$1534[i$1536];
                if (entry$1537 === null || typeof entry$1537 !== 'object' || entry$1537 instanceof RegExp) {
                    n$1535[i$1536] = entry$1537;
                } else {
                    n$1535[i$1536] = filterGroup$993(entry$1537);
                }
            }
        }
        return n$1535;
    }
    function wrapTrackingFunction$994(range$1538, loc$1539) {
        return function (parseFunction$1540) {
            function isBinary$1541(node$1543) {
                return node$1543.type === Syntax$832.LogicalExpression || node$1543.type === Syntax$832.BinaryExpression;
            }
            function visit$1542(node$1544) {
                var start$1545, end$1546;
                if (isBinary$1541(node$1544.left)) {
                    visit$1542(node$1544.left);
                }
                if (isBinary$1541(node$1544.right)) {
                    visit$1542(node$1544.right);
                }
                if (range$1538) {
                    if (node$1544.left.groupRange || node$1544.right.groupRange) {
                        start$1545 = node$1544.left.groupRange ? node$1544.left.groupRange[0] : node$1544.left.range[0];
                        end$1546 = node$1544.right.groupRange ? node$1544.right.groupRange[1] : node$1544.right.range[1];
                        node$1544.range = [
                            start$1545,
                            end$1546
                        ];
                    } else if (typeof node$1544.range === 'undefined') {
                        start$1545 = node$1544.left.range[0];
                        end$1546 = node$1544.right.range[1];
                        node$1544.range = [
                            start$1545,
                            end$1546
                        ];
                    }
                }
                if (loc$1539) {
                    if (node$1544.left.groupLoc || node$1544.right.groupLoc) {
                        start$1545 = node$1544.left.groupLoc ? node$1544.left.groupLoc.start : node$1544.left.loc.start;
                        end$1546 = node$1544.right.groupLoc ? node$1544.right.groupLoc.end : node$1544.right.loc.end;
                        node$1544.loc = {
                            start: start$1545,
                            end: end$1546
                        };
                        node$1544 = delegate$848.postProcess(node$1544);
                    } else if (typeof node$1544.loc === 'undefined') {
                        node$1544.loc = {
                            start: node$1544.left.loc.start,
                            end: node$1544.right.loc.end
                        };
                        node$1544 = delegate$848.postProcess(node$1544);
                    }
                }
            }
            return function () {
                var marker$1547, node$1548, curr$1549 = lookahead$851;
                marker$1547 = createLocationMarker$989();
                node$1548 = parseFunction$1540.apply(null, arguments);
                marker$1547.end();
                if (node$1548.type !== Syntax$832.Program) {
                    if (curr$1549.leadingComments) {
                        node$1548.leadingComments = curr$1549.leadingComments;
                    }
                    if (curr$1549.trailingComments) {
                        node$1548.trailingComments = curr$1549.trailingComments;
                    }
                }
                if (range$1538 && typeof node$1548.range === 'undefined') {
                    marker$1547.apply(node$1548);
                }
                if (loc$1539 && typeof node$1548.loc === 'undefined') {
                    marker$1547.apply(node$1548);
                }
                if (isBinary$1541(node$1548)) {
                    visit$1542(node$1548);
                }
                return node$1548;
            };
        };
    }
    function patch$995() {
        var wrapTracking$1550;
        if (extra$854.comments) {
            extra$854.skipComment = skipComment$868;
            skipComment$868 = scanComment$983;
        }
        if (extra$854.range || extra$854.loc) {
            extra$854.parseGroupExpression = parseGroupExpression$909;
            extra$854.parseLeftHandSideExpression = parseLeftHandSideExpression$918;
            extra$854.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$917;
            parseGroupExpression$909 = trackGroupExpression$990;
            parseLeftHandSideExpression$918 = trackLeftHandSideExpression$991;
            parseLeftHandSideExpressionAllowCall$917 = trackLeftHandSideExpressionAllowCall$992;
            wrapTracking$1550 = wrapTrackingFunction$994(extra$854.range, extra$854.loc);
            extra$854.parseArrayInitialiser = parseArrayInitialiser$901;
            extra$854.parseAssignmentExpression = parseAssignmentExpression$928;
            extra$854.parseBinaryExpression = parseBinaryExpression$922;
            extra$854.parseBlock = parseBlock$931;
            extra$854.parseFunctionSourceElements = parseFunctionSourceElements$962;
            extra$854.parseCatchClause = parseCatchClause$957;
            extra$854.parseComputedMember = parseComputedMember$915;
            extra$854.parseConditionalExpression = parseConditionalExpression$923;
            extra$854.parseConstLetDeclaration = parseConstLetDeclaration$936;
            extra$854.parseExportBatchSpecifier = parseExportBatchSpecifier$938;
            extra$854.parseExportDeclaration = parseExportDeclaration$940;
            extra$854.parseExportSpecifier = parseExportSpecifier$939;
            extra$854.parseExpression = parseExpression$929;
            extra$854.parseForVariableDeclaration = parseForVariableDeclaration$948;
            extra$854.parseFunctionDeclaration = parseFunctionDeclaration$966;
            extra$854.parseFunctionExpression = parseFunctionExpression$967;
            extra$854.parseParams = parseParams$965;
            extra$854.parseImportDeclaration = parseImportDeclaration$941;
            extra$854.parseImportSpecifier = parseImportSpecifier$942;
            extra$854.parseModuleDeclaration = parseModuleDeclaration$937;
            extra$854.parseModuleBlock = parseModuleBlock$980;
            extra$854.parseNewExpression = parseNewExpression$916;
            extra$854.parseNonComputedProperty = parseNonComputedProperty$913;
            extra$854.parseObjectInitialiser = parseObjectInitialiser$906;
            extra$854.parseObjectProperty = parseObjectProperty$905;
            extra$854.parseObjectPropertyKey = parseObjectPropertyKey$904;
            extra$854.parsePostfixExpression = parsePostfixExpression$919;
            extra$854.parsePrimaryExpression = parsePrimaryExpression$910;
            extra$854.parseProgram = parseProgram$981;
            extra$854.parsePropertyFunction = parsePropertyFunction$902;
            extra$854.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$912;
            extra$854.parseTemplateElement = parseTemplateElement$907;
            extra$854.parseTemplateLiteral = parseTemplateLiteral$908;
            extra$854.parseStatement = parseStatement$960;
            extra$854.parseSwitchCase = parseSwitchCase$954;
            extra$854.parseUnaryExpression = parseUnaryExpression$920;
            extra$854.parseVariableDeclaration = parseVariableDeclaration$933;
            extra$854.parseVariableIdentifier = parseVariableIdentifier$932;
            extra$854.parseMethodDefinition = parseMethodDefinition$969;
            extra$854.parseClassDeclaration = parseClassDeclaration$973;
            extra$854.parseClassExpression = parseClassExpression$972;
            extra$854.parseClassBody = parseClassBody$971;
            parseArrayInitialiser$901 = wrapTracking$1550(extra$854.parseArrayInitialiser);
            parseAssignmentExpression$928 = wrapTracking$1550(extra$854.parseAssignmentExpression);
            parseBinaryExpression$922 = wrapTracking$1550(extra$854.parseBinaryExpression);
            parseBlock$931 = wrapTracking$1550(extra$854.parseBlock);
            parseFunctionSourceElements$962 = wrapTracking$1550(extra$854.parseFunctionSourceElements);
            parseCatchClause$957 = wrapTracking$1550(extra$854.parseCatchClause);
            parseComputedMember$915 = wrapTracking$1550(extra$854.parseComputedMember);
            parseConditionalExpression$923 = wrapTracking$1550(extra$854.parseConditionalExpression);
            parseConstLetDeclaration$936 = wrapTracking$1550(extra$854.parseConstLetDeclaration);
            parseExportBatchSpecifier$938 = wrapTracking$1550(parseExportBatchSpecifier$938);
            parseExportDeclaration$940 = wrapTracking$1550(parseExportDeclaration$940);
            parseExportSpecifier$939 = wrapTracking$1550(parseExportSpecifier$939);
            parseExpression$929 = wrapTracking$1550(extra$854.parseExpression);
            parseForVariableDeclaration$948 = wrapTracking$1550(extra$854.parseForVariableDeclaration);
            parseFunctionDeclaration$966 = wrapTracking$1550(extra$854.parseFunctionDeclaration);
            parseFunctionExpression$967 = wrapTracking$1550(extra$854.parseFunctionExpression);
            parseParams$965 = wrapTracking$1550(extra$854.parseParams);
            parseImportDeclaration$941 = wrapTracking$1550(extra$854.parseImportDeclaration);
            parseImportSpecifier$942 = wrapTracking$1550(extra$854.parseImportSpecifier);
            parseModuleDeclaration$937 = wrapTracking$1550(extra$854.parseModuleDeclaration);
            parseModuleBlock$980 = wrapTracking$1550(extra$854.parseModuleBlock);
            parseLeftHandSideExpression$918 = wrapTracking$1550(parseLeftHandSideExpression$918);
            parseNewExpression$916 = wrapTracking$1550(extra$854.parseNewExpression);
            parseNonComputedProperty$913 = wrapTracking$1550(extra$854.parseNonComputedProperty);
            parseObjectInitialiser$906 = wrapTracking$1550(extra$854.parseObjectInitialiser);
            parseObjectProperty$905 = wrapTracking$1550(extra$854.parseObjectProperty);
            parseObjectPropertyKey$904 = wrapTracking$1550(extra$854.parseObjectPropertyKey);
            parsePostfixExpression$919 = wrapTracking$1550(extra$854.parsePostfixExpression);
            parsePrimaryExpression$910 = wrapTracking$1550(extra$854.parsePrimaryExpression);
            parseProgram$981 = wrapTracking$1550(extra$854.parseProgram);
            parsePropertyFunction$902 = wrapTracking$1550(extra$854.parsePropertyFunction);
            parseTemplateElement$907 = wrapTracking$1550(extra$854.parseTemplateElement);
            parseTemplateLiteral$908 = wrapTracking$1550(extra$854.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$912 = wrapTracking$1550(extra$854.parseSpreadOrAssignmentExpression);
            parseStatement$960 = wrapTracking$1550(extra$854.parseStatement);
            parseSwitchCase$954 = wrapTracking$1550(extra$854.parseSwitchCase);
            parseUnaryExpression$920 = wrapTracking$1550(extra$854.parseUnaryExpression);
            parseVariableDeclaration$933 = wrapTracking$1550(extra$854.parseVariableDeclaration);
            parseVariableIdentifier$932 = wrapTracking$1550(extra$854.parseVariableIdentifier);
            parseMethodDefinition$969 = wrapTracking$1550(extra$854.parseMethodDefinition);
            parseClassDeclaration$973 = wrapTracking$1550(extra$854.parseClassDeclaration);
            parseClassExpression$972 = wrapTracking$1550(extra$854.parseClassExpression);
            parseClassBody$971 = wrapTracking$1550(extra$854.parseClassBody);
        }
        if (typeof extra$854.tokens !== 'undefined') {
            extra$854.advance = advance$884;
            extra$854.scanRegExp = scanRegExp$881;
            advance$884 = collectToken$985;
            scanRegExp$881 = collectRegex$986;
        }
    }
    function unpatch$996() {
        if (typeof extra$854.skipComment === 'function') {
            skipComment$868 = extra$854.skipComment;
        }
        if (extra$854.range || extra$854.loc) {
            parseArrayInitialiser$901 = extra$854.parseArrayInitialiser;
            parseAssignmentExpression$928 = extra$854.parseAssignmentExpression;
            parseBinaryExpression$922 = extra$854.parseBinaryExpression;
            parseBlock$931 = extra$854.parseBlock;
            parseFunctionSourceElements$962 = extra$854.parseFunctionSourceElements;
            parseCatchClause$957 = extra$854.parseCatchClause;
            parseComputedMember$915 = extra$854.parseComputedMember;
            parseConditionalExpression$923 = extra$854.parseConditionalExpression;
            parseConstLetDeclaration$936 = extra$854.parseConstLetDeclaration;
            parseExportBatchSpecifier$938 = extra$854.parseExportBatchSpecifier;
            parseExportDeclaration$940 = extra$854.parseExportDeclaration;
            parseExportSpecifier$939 = extra$854.parseExportSpecifier;
            parseExpression$929 = extra$854.parseExpression;
            parseForVariableDeclaration$948 = extra$854.parseForVariableDeclaration;
            parseFunctionDeclaration$966 = extra$854.parseFunctionDeclaration;
            parseFunctionExpression$967 = extra$854.parseFunctionExpression;
            parseImportDeclaration$941 = extra$854.parseImportDeclaration;
            parseImportSpecifier$942 = extra$854.parseImportSpecifier;
            parseGroupExpression$909 = extra$854.parseGroupExpression;
            parseLeftHandSideExpression$918 = extra$854.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$917 = extra$854.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$937 = extra$854.parseModuleDeclaration;
            parseModuleBlock$980 = extra$854.parseModuleBlock;
            parseNewExpression$916 = extra$854.parseNewExpression;
            parseNonComputedProperty$913 = extra$854.parseNonComputedProperty;
            parseObjectInitialiser$906 = extra$854.parseObjectInitialiser;
            parseObjectProperty$905 = extra$854.parseObjectProperty;
            parseObjectPropertyKey$904 = extra$854.parseObjectPropertyKey;
            parsePostfixExpression$919 = extra$854.parsePostfixExpression;
            parsePrimaryExpression$910 = extra$854.parsePrimaryExpression;
            parseProgram$981 = extra$854.parseProgram;
            parsePropertyFunction$902 = extra$854.parsePropertyFunction;
            parseTemplateElement$907 = extra$854.parseTemplateElement;
            parseTemplateLiteral$908 = extra$854.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$912 = extra$854.parseSpreadOrAssignmentExpression;
            parseStatement$960 = extra$854.parseStatement;
            parseSwitchCase$954 = extra$854.parseSwitchCase;
            parseUnaryExpression$920 = extra$854.parseUnaryExpression;
            parseVariableDeclaration$933 = extra$854.parseVariableDeclaration;
            parseVariableIdentifier$932 = extra$854.parseVariableIdentifier;
            parseMethodDefinition$969 = extra$854.parseMethodDefinition;
            parseClassDeclaration$973 = extra$854.parseClassDeclaration;
            parseClassExpression$972 = extra$854.parseClassExpression;
            parseClassBody$971 = extra$854.parseClassBody;
        }
        if (typeof extra$854.scanRegExp === 'function') {
            advance$884 = extra$854.advance;
            scanRegExp$881 = extra$854.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$997(object$1551, properties$1552) {
        var entry$1553, result$1554 = {};
        for (entry$1553 in object$1551) {
            if (object$1551.hasOwnProperty(entry$1553)) {
                result$1554[entry$1553] = object$1551[entry$1553];
            }
        }
        for (entry$1553 in properties$1552) {
            if (properties$1552.hasOwnProperty(entry$1553)) {
                result$1554[entry$1553] = properties$1552[entry$1553];
            }
        }
        return result$1554;
    }
    function tokenize$998(code$1555, options$1556) {
        var toString$1557, token$1558, tokens$1559;
        toString$1557 = String;
        if (typeof code$1555 !== 'string' && !(code$1555 instanceof String)) {
            code$1555 = toString$1557(code$1555);
        }
        delegate$848 = SyntaxTreeDelegate$836;
        source$838 = code$1555;
        index$840 = 0;
        lineNumber$841 = source$838.length > 0 ? 1 : 0;
        lineStart$842 = 0;
        length$847 = source$838.length;
        lookahead$851 = null;
        state$853 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$854 = {};
        // Options matching.
        options$1556 = options$1556 || {};
        // Of course we collect tokens here.
        options$1556.tokens = true;
        extra$854.tokens = [];
        extra$854.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$854.openParenToken = -1;
        extra$854.openCurlyToken = -1;
        extra$854.range = typeof options$1556.range === 'boolean' && options$1556.range;
        extra$854.loc = typeof options$1556.loc === 'boolean' && options$1556.loc;
        if (typeof options$1556.comment === 'boolean' && options$1556.comment) {
            extra$854.comments = [];
        }
        if (typeof options$1556.tolerant === 'boolean' && options$1556.tolerant) {
            extra$854.errors = [];
        }
        if (length$847 > 0) {
            if (typeof source$838[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1555 instanceof String) {
                    source$838 = code$1555.valueOf();
                }
            }
        }
        patch$995();
        try {
            peek$886();
            if (lookahead$851.type === Token$829.EOF) {
                return extra$854.tokens;
            }
            token$1558 = lex$885();
            while (lookahead$851.type !== Token$829.EOF) {
                try {
                    token$1558 = lex$885();
                } catch (lexError$1560) {
                    token$1558 = lookahead$851;
                    if (extra$854.errors) {
                        extra$854.errors.push(lexError$1560);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1560;
                    }
                }
            }
            filterTokenLocation$987();
            tokens$1559 = extra$854.tokens;
            if (typeof extra$854.comments !== 'undefined') {
                filterCommentLocation$984();
                tokens$1559.comments = extra$854.comments;
            }
            if (typeof extra$854.errors !== 'undefined') {
                tokens$1559.errors = extra$854.errors;
            }
        } catch (e$1561) {
            throw e$1561;
        } finally {
            unpatch$996();
            extra$854 = {};
        }
        return tokens$1559;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$999(toks$1562, start$1563, inExprDelim$1564, parentIsBlock$1565) {
        var assignOps$1566 = [
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
        var binaryOps$1567 = [
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
        var unaryOps$1568 = [
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
        function back$1569(n$1570) {
            var idx$1571 = toks$1562.length - n$1570 > 0 ? toks$1562.length - n$1570 : 0;
            return toks$1562[idx$1571];
        }
        if (inExprDelim$1564 && toks$1562.length - (start$1563 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1569(start$1563 + 2).value === ':' && parentIsBlock$1565) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$856(back$1569(start$1563 + 2).value, unaryOps$1568.concat(binaryOps$1567).concat(assignOps$1566))) {
            // ... + {...}
            return false;
        } else if (back$1569(start$1563 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1572 = typeof back$1569(start$1563 + 1).startLineNumber !== 'undefined' ? back$1569(start$1563 + 1).startLineNumber : back$1569(start$1563 + 1).lineNumber;
            if (back$1569(start$1563 + 2).lineNumber !== currLineNumber$1572) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$856(back$1569(start$1563 + 2).value, [
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
    function readToken$1000(toks$1573, inExprDelim$1574, parentIsBlock$1575) {
        var delimiters$1576 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1577 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1578 = toks$1573.length - 1;
        var comments$1579, commentsLen$1580 = extra$854.comments.length;
        function back$1581(n$1585) {
            var idx$1586 = toks$1573.length - n$1585 > 0 ? toks$1573.length - n$1585 : 0;
            return toks$1573[idx$1586];
        }
        function attachComments$1582(token$1587) {
            if (comments$1579) {
                token$1587.leadingComments = comments$1579;
            }
            return token$1587;
        }
        function _advance$1583() {
            return attachComments$1582(advance$884());
        }
        function _scanRegExp$1584() {
            return attachComments$1582(scanRegExp$881());
        }
        skipComment$868();
        if (extra$854.comments.length > commentsLen$1580) {
            comments$1579 = extra$854.comments.slice(commentsLen$1580);
        }
        if (isIn$856(source$838[index$840], delimiters$1576)) {
            return attachComments$1582(readDelim$1001(toks$1573, inExprDelim$1574, parentIsBlock$1575));
        }
        if (source$838[index$840] === '/') {
            var prev$1588 = back$1581(1);
            if (prev$1588) {
                if (prev$1588.value === '()') {
                    if (isIn$856(back$1581(2).value, parenIdents$1577)) {
                        // ... if (...) / ...
                        return _scanRegExp$1584();
                    }
                    // ... (...) / ...
                    return _advance$1583();
                }
                if (prev$1588.value === '{}') {
                    if (blockAllowed$999(toks$1573, 0, inExprDelim$1574, parentIsBlock$1575)) {
                        if (back$1581(2).value === '()') {
                            // named function
                            if (back$1581(4).value === 'function') {
                                if (!blockAllowed$999(toks$1573, 3, inExprDelim$1574, parentIsBlock$1575)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1583();
                                }
                                if (toks$1573.length - 5 <= 0 && inExprDelim$1574) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1583();
                                }
                            }
                            // unnamed function
                            if (back$1581(3).value === 'function') {
                                if (!blockAllowed$999(toks$1573, 2, inExprDelim$1574, parentIsBlock$1575)) {
                                    // new function (...) {...} / ...
                                    return _advance$1583();
                                }
                                if (toks$1573.length - 4 <= 0 && inExprDelim$1574) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1583();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1584();
                    } else {
                        // ... + {...} / ...
                        return _advance$1583();
                    }
                }
                if (prev$1588.type === Token$829.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1584();
                }
                if (isKeyword$867(prev$1588.value)) {
                    // typeof /...
                    return _scanRegExp$1584();
                }
                return _advance$1583();
            }
            return _scanRegExp$1584();
        }
        return _advance$1583();
    }
    function readDelim$1001(toks$1589, inExprDelim$1590, parentIsBlock$1591) {
        var startDelim$1592 = advance$884(), matchDelim$1593 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1594 = [];
        var delimiters$1595 = [
                '(',
                '{',
                '['
            ];
        assert$855(delimiters$1595.indexOf(startDelim$1592.value) !== -1, 'Need to begin at the delimiter');
        var token$1596 = startDelim$1592;
        var startLineNumber$1597 = token$1596.lineNumber;
        var startLineStart$1598 = token$1596.lineStart;
        var startRange$1599 = token$1596.range;
        var delimToken$1600 = {};
        delimToken$1600.type = Token$829.Delimiter;
        delimToken$1600.value = startDelim$1592.value + matchDelim$1593[startDelim$1592.value];
        delimToken$1600.startLineNumber = startLineNumber$1597;
        delimToken$1600.startLineStart = startLineStart$1598;
        delimToken$1600.startRange = startRange$1599;
        var delimIsBlock$1601 = false;
        if (startDelim$1592.value === '{') {
            delimIsBlock$1601 = blockAllowed$999(toks$1589.concat(delimToken$1600), 0, inExprDelim$1590, parentIsBlock$1591);
        }
        while (index$840 <= length$847) {
            token$1596 = readToken$1000(inner$1594, startDelim$1592.value === '(' || startDelim$1592.value === '[', delimIsBlock$1601);
            if (token$1596.type === Token$829.Punctuator && token$1596.value === matchDelim$1593[startDelim$1592.value]) {
                if (token$1596.leadingComments) {
                    delimToken$1600.trailingComments = token$1596.leadingComments;
                }
                break;
            } else if (token$1596.type === Token$829.EOF) {
                throwError$889({}, Messages$834.UnexpectedEOS);
            } else {
                inner$1594.push(token$1596);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$840 >= length$847 && matchDelim$1593[startDelim$1592.value] !== source$838[length$847 - 1]) {
            throwError$889({}, Messages$834.UnexpectedEOS);
        }
        var endLineNumber$1602 = token$1596.lineNumber;
        var endLineStart$1603 = token$1596.lineStart;
        var endRange$1604 = token$1596.range;
        delimToken$1600.inner = inner$1594;
        delimToken$1600.endLineNumber = endLineNumber$1602;
        delimToken$1600.endLineStart = endLineStart$1603;
        delimToken$1600.endRange = endRange$1604;
        return delimToken$1600;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$1002(code$1605) {
        var token$1606, tokenTree$1607 = [];
        extra$854 = {};
        extra$854.comments = [];
        patch$995();
        source$838 = code$1605;
        index$840 = 0;
        lineNumber$841 = source$838.length > 0 ? 1 : 0;
        lineStart$842 = 0;
        length$847 = source$838.length;
        state$853 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$840 < length$847) {
            tokenTree$1607.push(readToken$1000(tokenTree$1607, false, false));
        }
        var last$1608 = tokenTree$1607[tokenTree$1607.length - 1];
        if (last$1608 && last$1608.type !== Token$829.EOF) {
            tokenTree$1607.push({
                type: Token$829.EOF,
                value: '',
                lineNumber: last$1608.lineNumber,
                lineStart: last$1608.lineStart,
                range: [
                    index$840,
                    index$840
                ]
            });
        }
        return expander$828.tokensToSyntax(tokenTree$1607);
    }
    function parse$1003(code$1609, options$1610) {
        var program$1611, toString$1612;
        extra$854 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1609)) {
            tokenStream$849 = code$1609;
            length$847 = tokenStream$849.length;
            lineNumber$841 = tokenStream$849.length > 0 ? 1 : 0;
            source$838 = undefined;
        } else {
            toString$1612 = String;
            if (typeof code$1609 !== 'string' && !(code$1609 instanceof String)) {
                code$1609 = toString$1612(code$1609);
            }
            source$838 = code$1609;
            length$847 = source$838.length;
            lineNumber$841 = source$838.length > 0 ? 1 : 0;
        }
        delegate$848 = SyntaxTreeDelegate$836;
        streamIndex$850 = -1;
        index$840 = 0;
        lineStart$842 = 0;
        sm_lineStart$844 = 0;
        sm_lineNumber$843 = lineNumber$841;
        sm_index$846 = 0;
        sm_range$845 = [
            0,
            0
        ];
        lookahead$851 = null;
        state$853 = {
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
        if (typeof options$1610 !== 'undefined') {
            extra$854.range = typeof options$1610.range === 'boolean' && options$1610.range;
            extra$854.loc = typeof options$1610.loc === 'boolean' && options$1610.loc;
            if (extra$854.loc && options$1610.source !== null && options$1610.source !== undefined) {
                delegate$848 = extend$997(delegate$848, {
                    'postProcess': function (node$1613) {
                        node$1613.loc.source = toString$1612(options$1610.source);
                        return node$1613;
                    }
                });
            }
            if (typeof options$1610.tokens === 'boolean' && options$1610.tokens) {
                extra$854.tokens = [];
            }
            if (typeof options$1610.comment === 'boolean' && options$1610.comment) {
                extra$854.comments = [];
            }
            if (typeof options$1610.tolerant === 'boolean' && options$1610.tolerant) {
                extra$854.errors = [];
            }
        }
        if (length$847 > 0) {
            if (source$838 && typeof source$838[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1609 instanceof String) {
                    source$838 = code$1609.valueOf();
                }
            }
        }
        extra$854 = { loc: true };
        patch$995();
        try {
            program$1611 = parseProgram$981();
            if (typeof extra$854.comments !== 'undefined') {
                filterCommentLocation$984();
                program$1611.comments = extra$854.comments;
            }
            if (typeof extra$854.tokens !== 'undefined') {
                filterTokenLocation$987();
                program$1611.tokens = extra$854.tokens;
            }
            if (typeof extra$854.errors !== 'undefined') {
                program$1611.errors = extra$854.errors;
            }
            if (extra$854.range || extra$854.loc) {
                program$1611.body = filterGroup$993(program$1611.body);
            }
        } catch (e$1614) {
            throw e$1614;
        } finally {
            unpatch$996();
            extra$854 = {};
        }
        return program$1611;
    }
    exports$827.tokenize = tokenize$998;
    exports$827.read = read$1002;
    exports$827.Token = Token$829;
    exports$827.assert = assert$855;
    exports$827.parse = parse$1003;
    // Deep copy.
    exports$827.Syntax = function () {
        var name$1615, types$1616 = {};
        if (typeof Object.create === 'function') {
            types$1616 = Object.create(null);
        }
        for (name$1615 in Syntax$832) {
            if (Syntax$832.hasOwnProperty(name$1615)) {
                types$1616[name$1615] = Syntax$832[name$1615];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1616);
        }
        return types$1616;
    }();
}));
//# sourceMappingURL=parser.js.map