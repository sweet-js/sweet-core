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
(function (root$826, factory$827) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$827);
    } else if (typeof exports !== 'undefined') {
        factory$827(exports, require('./expander'));
    } else {
        factory$827(root$826.esprima = {});
    }
}(this, function (exports$828, expander$829) {
    'use strict';
    var Token$830, TokenName$831, FnExprTokens$832, Syntax$833, PropertyKind$834, Messages$835, Regex$836, SyntaxTreeDelegate$837, ClassPropertyType$838, source$839, strict$840, index$841, lineNumber$842, lineStart$843, sm_lineNumber$844, sm_lineStart$845, sm_range$846, sm_index$847, length$848, delegate$849, tokenStream$850, streamIndex$851, lookahead$852, lookaheadIndex$853, state$854, extra$855;
    Token$830 = {
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
    TokenName$831 = {};
    TokenName$831[Token$830.BooleanLiteral] = 'Boolean';
    TokenName$831[Token$830.EOF] = '<end>';
    TokenName$831[Token$830.Identifier] = 'Identifier';
    TokenName$831[Token$830.Keyword] = 'Keyword';
    TokenName$831[Token$830.NullLiteral] = 'Null';
    TokenName$831[Token$830.NumericLiteral] = 'Numeric';
    TokenName$831[Token$830.Punctuator] = 'Punctuator';
    TokenName$831[Token$830.StringLiteral] = 'String';
    TokenName$831[Token$830.RegularExpression] = 'RegularExpression';
    TokenName$831[Token$830.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$832 = [
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
    Syntax$833 = {
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
    PropertyKind$834 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$838 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$835 = {
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
    Regex$836 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$856(condition$1005, message$1006) {
        if (!condition$1005) {
            throw new Error('ASSERT: ' + message$1006);
        }
    }
    function isIn$857(el$1007, list$1008) {
        return list$1008.indexOf(el$1007) !== -1;
    }
    function isDecimalDigit$858(ch$1009) {
        return ch$1009 >= 48 && ch$1009 <= 57;
    }    // 0..9
    function isHexDigit$859(ch$1010) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1010) >= 0;
    }
    function isOctalDigit$860(ch$1011) {
        return '01234567'.indexOf(ch$1011) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$861(ch$1012) {
        return ch$1012 === 32 || ch$1012 === 9 || ch$1012 === 11 || ch$1012 === 12 || ch$1012 === 160 || ch$1012 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1012)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$862(ch$1013) {
        return ch$1013 === 10 || ch$1013 === 13 || ch$1013 === 8232 || ch$1013 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$863(ch$1014) {
        return ch$1014 === 36 || ch$1014 === 95 || ch$1014 >= 65 && ch$1014 <= 90 || ch$1014 >= 97 && ch$1014 <= 122 || ch$1014 === 92 || ch$1014 >= 128 && Regex$836.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1014));
    }
    function isIdentifierPart$864(ch$1015) {
        return ch$1015 === 36 || ch$1015 === 95 || ch$1015 >= 65 && ch$1015 <= 90 || ch$1015 >= 97 && ch$1015 <= 122 || ch$1015 >= 48 && ch$1015 <= 57 || ch$1015 === 92 || ch$1015 >= 128 && Regex$836.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1015));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$865(id$1016) {
        switch (id$1016) {
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
    function isStrictModeReservedWord$866(id$1017) {
        switch (id$1017) {
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
    function isRestrictedWord$867(id$1018) {
        return id$1018 === 'eval' || id$1018 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$868(id$1019) {
        if (strict$840 && isStrictModeReservedWord$866(id$1019)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1019.length) {
        case 2:
            return id$1019 === 'if' || id$1019 === 'in' || id$1019 === 'do';
        case 3:
            return id$1019 === 'var' || id$1019 === 'for' || id$1019 === 'new' || id$1019 === 'try' || id$1019 === 'let';
        case 4:
            return id$1019 === 'this' || id$1019 === 'else' || id$1019 === 'case' || id$1019 === 'void' || id$1019 === 'with' || id$1019 === 'enum';
        case 5:
            return id$1019 === 'while' || id$1019 === 'break' || id$1019 === 'catch' || id$1019 === 'throw' || id$1019 === 'const' || id$1019 === 'yield' || id$1019 === 'class' || id$1019 === 'super';
        case 6:
            return id$1019 === 'return' || id$1019 === 'typeof' || id$1019 === 'delete' || id$1019 === 'switch' || id$1019 === 'export' || id$1019 === 'import';
        case 7:
            return id$1019 === 'default' || id$1019 === 'finally' || id$1019 === 'extends';
        case 8:
            return id$1019 === 'function' || id$1019 === 'continue' || id$1019 === 'debugger';
        case 10:
            return id$1019 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$869() {
        var ch$1020, blockComment$1021, lineComment$1022;
        blockComment$1021 = false;
        lineComment$1022 = false;
        while (index$841 < length$848) {
            ch$1020 = source$839.charCodeAt(index$841);
            if (lineComment$1022) {
                ++index$841;
                if (isLineTerminator$862(ch$1020)) {
                    lineComment$1022 = false;
                    if (ch$1020 === 13 && source$839.charCodeAt(index$841) === 10) {
                        ++index$841;
                    }
                    ++lineNumber$842;
                    lineStart$843 = index$841;
                }
            } else if (blockComment$1021) {
                if (isLineTerminator$862(ch$1020)) {
                    if (ch$1020 === 13 && source$839.charCodeAt(index$841 + 1) === 10) {
                        ++index$841;
                    }
                    ++lineNumber$842;
                    ++index$841;
                    lineStart$843 = index$841;
                    if (index$841 >= length$848) {
                        throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1020 = source$839.charCodeAt(index$841++);
                    if (index$841 >= length$848) {
                        throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1020 === 42) {
                        ch$1020 = source$839.charCodeAt(index$841);
                        if (ch$1020 === 47) {
                            ++index$841;
                            blockComment$1021 = false;
                        }
                    }
                }
            } else if (ch$1020 === 47) {
                ch$1020 = source$839.charCodeAt(index$841 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1020 === 47) {
                    index$841 += 2;
                    lineComment$1022 = true;
                } else if (ch$1020 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$841 += 2;
                    blockComment$1021 = true;
                    if (index$841 >= length$848) {
                        throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$861(ch$1020)) {
                ++index$841;
            } else if (isLineTerminator$862(ch$1020)) {
                ++index$841;
                if (ch$1020 === 13 && source$839.charCodeAt(index$841) === 10) {
                    ++index$841;
                }
                ++lineNumber$842;
                lineStart$843 = index$841;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$870(prefix$1023) {
        var i$1024, len$1025, ch$1026, code$1027 = 0;
        len$1025 = prefix$1023 === 'u' ? 4 : 2;
        for (i$1024 = 0; i$1024 < len$1025; ++i$1024) {
            if (index$841 < length$848 && isHexDigit$859(source$839[index$841])) {
                ch$1026 = source$839[index$841++];
                code$1027 = code$1027 * 16 + '0123456789abcdef'.indexOf(ch$1026.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1027);
    }
    function scanUnicodeCodePointEscape$871() {
        var ch$1028, code$1029, cu1$1030, cu2$1031;
        ch$1028 = source$839[index$841];
        code$1029 = 0;
        // At least, one hex digit is required.
        if (ch$1028 === '}') {
            throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
        }
        while (index$841 < length$848) {
            ch$1028 = source$839[index$841++];
            if (!isHexDigit$859(ch$1028)) {
                break;
            }
            code$1029 = code$1029 * 16 + '0123456789abcdef'.indexOf(ch$1028.toLowerCase());
        }
        if (code$1029 > 1114111 || ch$1028 !== '}') {
            throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1029 <= 65535) {
            return String.fromCharCode(code$1029);
        }
        cu1$1030 = (code$1029 - 65536 >> 10) + 55296;
        cu2$1031 = (code$1029 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1030, cu2$1031);
    }
    function getEscapedIdentifier$872() {
        var ch$1032, id$1033;
        ch$1032 = source$839.charCodeAt(index$841++);
        id$1033 = String.fromCharCode(ch$1032);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1032 === 92) {
            if (source$839.charCodeAt(index$841) !== 117) {
                throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
            }
            ++index$841;
            ch$1032 = scanHexEscape$870('u');
            if (!ch$1032 || ch$1032 === '\\' || !isIdentifierStart$863(ch$1032.charCodeAt(0))) {
                throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
            }
            id$1033 = ch$1032;
        }
        while (index$841 < length$848) {
            ch$1032 = source$839.charCodeAt(index$841);
            if (!isIdentifierPart$864(ch$1032)) {
                break;
            }
            ++index$841;
            id$1033 += String.fromCharCode(ch$1032);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1032 === 92) {
                id$1033 = id$1033.substr(0, id$1033.length - 1);
                if (source$839.charCodeAt(index$841) !== 117) {
                    throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
                }
                ++index$841;
                ch$1032 = scanHexEscape$870('u');
                if (!ch$1032 || ch$1032 === '\\' || !isIdentifierPart$864(ch$1032.charCodeAt(0))) {
                    throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
                }
                id$1033 += ch$1032;
            }
        }
        return id$1033;
    }
    function getIdentifier$873() {
        var start$1034, ch$1035;
        start$1034 = index$841++;
        while (index$841 < length$848) {
            ch$1035 = source$839.charCodeAt(index$841);
            if (ch$1035 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$841 = start$1034;
                return getEscapedIdentifier$872();
            }
            if (isIdentifierPart$864(ch$1035)) {
                ++index$841;
            } else {
                break;
            }
        }
        return source$839.slice(start$1034, index$841);
    }
    function scanIdentifier$874() {
        var start$1036, id$1037, type$1038;
        start$1036 = index$841;
        // Backslash (char #92) starts an escaped character.
        id$1037 = source$839.charCodeAt(index$841) === 92 ? getEscapedIdentifier$872() : getIdentifier$873();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1037.length === 1) {
            type$1038 = Token$830.Identifier;
        } else if (isKeyword$868(id$1037)) {
            type$1038 = Token$830.Keyword;
        } else if (id$1037 === 'null') {
            type$1038 = Token$830.NullLiteral;
        } else if (id$1037 === 'true' || id$1037 === 'false') {
            type$1038 = Token$830.BooleanLiteral;
        } else {
            type$1038 = Token$830.Identifier;
        }
        return {
            type: type$1038,
            value: id$1037,
            lineNumber: lineNumber$842,
            lineStart: lineStart$843,
            range: [
                start$1036,
                index$841
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$875() {
        var start$1039 = index$841, code$1040 = source$839.charCodeAt(index$841), code2$1041, ch1$1042 = source$839[index$841], ch2$1043, ch3$1044, ch4$1045;
        switch (code$1040) {
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
            ++index$841;
            if (extra$855.tokenize) {
                if (code$1040 === 40) {
                    extra$855.openParenToken = extra$855.tokens.length;
                } else if (code$1040 === 123) {
                    extra$855.openCurlyToken = extra$855.tokens.length;
                }
            }
            return {
                type: Token$830.Punctuator,
                value: String.fromCharCode(code$1040),
                lineNumber: lineNumber$842,
                lineStart: lineStart$843,
                range: [
                    start$1039,
                    index$841
                ]
            };
        default:
            code2$1041 = source$839.charCodeAt(index$841 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1041 === 61) {
                switch (code$1040) {
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
                    index$841 += 2;
                    return {
                        type: Token$830.Punctuator,
                        value: String.fromCharCode(code$1040) + String.fromCharCode(code2$1041),
                        lineNumber: lineNumber$842,
                        lineStart: lineStart$843,
                        range: [
                            start$1039,
                            index$841
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$841 += 2;
                    // !== and ===
                    if (source$839.charCodeAt(index$841) === 61) {
                        ++index$841;
                    }
                    return {
                        type: Token$830.Punctuator,
                        value: source$839.slice(start$1039, index$841),
                        lineNumber: lineNumber$842,
                        lineStart: lineStart$843,
                        range: [
                            start$1039,
                            index$841
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1043 = source$839[index$841 + 1];
        ch3$1044 = source$839[index$841 + 2];
        ch4$1045 = source$839[index$841 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1042 === '>' && ch2$1043 === '>' && ch3$1044 === '>') {
            if (ch4$1045 === '=') {
                index$841 += 4;
                return {
                    type: Token$830.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$842,
                    lineStart: lineStart$843,
                    range: [
                        start$1039,
                        index$841
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1042 === '>' && ch2$1043 === '>' && ch3$1044 === '>') {
            index$841 += 3;
            return {
                type: Token$830.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$842,
                lineStart: lineStart$843,
                range: [
                    start$1039,
                    index$841
                ]
            };
        }
        if (ch1$1042 === '<' && ch2$1043 === '<' && ch3$1044 === '=') {
            index$841 += 3;
            return {
                type: Token$830.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$842,
                lineStart: lineStart$843,
                range: [
                    start$1039,
                    index$841
                ]
            };
        }
        if (ch1$1042 === '>' && ch2$1043 === '>' && ch3$1044 === '=') {
            index$841 += 3;
            return {
                type: Token$830.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$842,
                lineStart: lineStart$843,
                range: [
                    start$1039,
                    index$841
                ]
            };
        }
        if (ch1$1042 === '.' && ch2$1043 === '.' && ch3$1044 === '.') {
            index$841 += 3;
            return {
                type: Token$830.Punctuator,
                value: '...',
                lineNumber: lineNumber$842,
                lineStart: lineStart$843,
                range: [
                    start$1039,
                    index$841
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1042 === ch2$1043 && '+-<>&|'.indexOf(ch1$1042) >= 0) {
            index$841 += 2;
            return {
                type: Token$830.Punctuator,
                value: ch1$1042 + ch2$1043,
                lineNumber: lineNumber$842,
                lineStart: lineStart$843,
                range: [
                    start$1039,
                    index$841
                ]
            };
        }
        if (ch1$1042 === '=' && ch2$1043 === '>') {
            index$841 += 2;
            return {
                type: Token$830.Punctuator,
                value: '=>',
                lineNumber: lineNumber$842,
                lineStart: lineStart$843,
                range: [
                    start$1039,
                    index$841
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1042) >= 0) {
            ++index$841;
            return {
                type: Token$830.Punctuator,
                value: ch1$1042,
                lineNumber: lineNumber$842,
                lineStart: lineStart$843,
                range: [
                    start$1039,
                    index$841
                ]
            };
        }
        if (ch1$1042 === '.') {
            ++index$841;
            return {
                type: Token$830.Punctuator,
                value: ch1$1042,
                lineNumber: lineNumber$842,
                lineStart: lineStart$843,
                range: [
                    start$1039,
                    index$841
                ]
            };
        }
        throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$876(start$1046) {
        var number$1047 = '';
        while (index$841 < length$848) {
            if (!isHexDigit$859(source$839[index$841])) {
                break;
            }
            number$1047 += source$839[index$841++];
        }
        if (number$1047.length === 0) {
            throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$863(source$839.charCodeAt(index$841))) {
            throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$830.NumericLiteral,
            value: parseInt('0x' + number$1047, 16),
            lineNumber: lineNumber$842,
            lineStart: lineStart$843,
            range: [
                start$1046,
                index$841
            ]
        };
    }
    function scanOctalLiteral$877(prefix$1048, start$1049) {
        var number$1050, octal$1051;
        if (isOctalDigit$860(prefix$1048)) {
            octal$1051 = true;
            number$1050 = '0' + source$839[index$841++];
        } else {
            octal$1051 = false;
            ++index$841;
            number$1050 = '';
        }
        while (index$841 < length$848) {
            if (!isOctalDigit$860(source$839[index$841])) {
                break;
            }
            number$1050 += source$839[index$841++];
        }
        if (!octal$1051 && number$1050.length === 0) {
            // only 0o or 0O
            throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$863(source$839.charCodeAt(index$841)) || isDecimalDigit$858(source$839.charCodeAt(index$841))) {
            throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$830.NumericLiteral,
            value: parseInt(number$1050, 8),
            octal: octal$1051,
            lineNumber: lineNumber$842,
            lineStart: lineStart$843,
            range: [
                start$1049,
                index$841
            ]
        };
    }
    function scanNumericLiteral$878() {
        var number$1052, start$1053, ch$1054, octal$1055;
        ch$1054 = source$839[index$841];
        assert$856(isDecimalDigit$858(ch$1054.charCodeAt(0)) || ch$1054 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1053 = index$841;
        number$1052 = '';
        if (ch$1054 !== '.') {
            number$1052 = source$839[index$841++];
            ch$1054 = source$839[index$841];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1052 === '0') {
                if (ch$1054 === 'x' || ch$1054 === 'X') {
                    ++index$841;
                    return scanHexLiteral$876(start$1053);
                }
                if (ch$1054 === 'b' || ch$1054 === 'B') {
                    ++index$841;
                    number$1052 = '';
                    while (index$841 < length$848) {
                        ch$1054 = source$839[index$841];
                        if (ch$1054 !== '0' && ch$1054 !== '1') {
                            break;
                        }
                        number$1052 += source$839[index$841++];
                    }
                    if (number$1052.length === 0) {
                        // only 0b or 0B
                        throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$841 < length$848) {
                        ch$1054 = source$839.charCodeAt(index$841);
                        if (isIdentifierStart$863(ch$1054) || isDecimalDigit$858(ch$1054)) {
                            throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$830.NumericLiteral,
                        value: parseInt(number$1052, 2),
                        lineNumber: lineNumber$842,
                        lineStart: lineStart$843,
                        range: [
                            start$1053,
                            index$841
                        ]
                    };
                }
                if (ch$1054 === 'o' || ch$1054 === 'O' || isOctalDigit$860(ch$1054)) {
                    return scanOctalLiteral$877(ch$1054, start$1053);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1054 && isDecimalDigit$858(ch$1054.charCodeAt(0))) {
                    throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$858(source$839.charCodeAt(index$841))) {
                number$1052 += source$839[index$841++];
            }
            ch$1054 = source$839[index$841];
        }
        if (ch$1054 === '.') {
            number$1052 += source$839[index$841++];
            while (isDecimalDigit$858(source$839.charCodeAt(index$841))) {
                number$1052 += source$839[index$841++];
            }
            ch$1054 = source$839[index$841];
        }
        if (ch$1054 === 'e' || ch$1054 === 'E') {
            number$1052 += source$839[index$841++];
            ch$1054 = source$839[index$841];
            if (ch$1054 === '+' || ch$1054 === '-') {
                number$1052 += source$839[index$841++];
            }
            if (isDecimalDigit$858(source$839.charCodeAt(index$841))) {
                while (isDecimalDigit$858(source$839.charCodeAt(index$841))) {
                    number$1052 += source$839[index$841++];
                }
            } else {
                throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$863(source$839.charCodeAt(index$841))) {
            throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$830.NumericLiteral,
            value: parseFloat(number$1052),
            lineNumber: lineNumber$842,
            lineStart: lineStart$843,
            range: [
                start$1053,
                index$841
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$879() {
        var str$1056 = '', quote$1057, start$1058, ch$1059, code$1060, unescaped$1061, restore$1062, octal$1063 = false;
        quote$1057 = source$839[index$841];
        assert$856(quote$1057 === '\'' || quote$1057 === '"', 'String literal must starts with a quote');
        start$1058 = index$841;
        ++index$841;
        while (index$841 < length$848) {
            ch$1059 = source$839[index$841++];
            if (ch$1059 === quote$1057) {
                quote$1057 = '';
                break;
            } else if (ch$1059 === '\\') {
                ch$1059 = source$839[index$841++];
                if (!ch$1059 || !isLineTerminator$862(ch$1059.charCodeAt(0))) {
                    switch (ch$1059) {
                    case 'n':
                        str$1056 += '\n';
                        break;
                    case 'r':
                        str$1056 += '\r';
                        break;
                    case 't':
                        str$1056 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$839[index$841] === '{') {
                            ++index$841;
                            str$1056 += scanUnicodeCodePointEscape$871();
                        } else {
                            restore$1062 = index$841;
                            unescaped$1061 = scanHexEscape$870(ch$1059);
                            if (unescaped$1061) {
                                str$1056 += unescaped$1061;
                            } else {
                                index$841 = restore$1062;
                                str$1056 += ch$1059;
                            }
                        }
                        break;
                    case 'b':
                        str$1056 += '\b';
                        break;
                    case 'f':
                        str$1056 += '\f';
                        break;
                    case 'v':
                        str$1056 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$860(ch$1059)) {
                            code$1060 = '01234567'.indexOf(ch$1059);
                            // \0 is not octal escape sequence
                            if (code$1060 !== 0) {
                                octal$1063 = true;
                            }
                            if (index$841 < length$848 && isOctalDigit$860(source$839[index$841])) {
                                octal$1063 = true;
                                code$1060 = code$1060 * 8 + '01234567'.indexOf(source$839[index$841++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1059) >= 0 && index$841 < length$848 && isOctalDigit$860(source$839[index$841])) {
                                    code$1060 = code$1060 * 8 + '01234567'.indexOf(source$839[index$841++]);
                                }
                            }
                            str$1056 += String.fromCharCode(code$1060);
                        } else {
                            str$1056 += ch$1059;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$842;
                    if (ch$1059 === '\r' && source$839[index$841] === '\n') {
                        ++index$841;
                    }
                }
            } else if (isLineTerminator$862(ch$1059.charCodeAt(0))) {
                break;
            } else {
                str$1056 += ch$1059;
            }
        }
        if (quote$1057 !== '') {
            throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$830.StringLiteral,
            value: str$1056,
            octal: octal$1063,
            lineNumber: lineNumber$842,
            lineStart: lineStart$843,
            range: [
                start$1058,
                index$841
            ]
        };
    }
    function scanTemplate$880() {
        var cooked$1064 = '', ch$1065, start$1066, terminated$1067, tail$1068, restore$1069, unescaped$1070, code$1071, octal$1072;
        terminated$1067 = false;
        tail$1068 = false;
        start$1066 = index$841;
        ++index$841;
        while (index$841 < length$848) {
            ch$1065 = source$839[index$841++];
            if (ch$1065 === '`') {
                tail$1068 = true;
                terminated$1067 = true;
                break;
            } else if (ch$1065 === '$') {
                if (source$839[index$841] === '{') {
                    ++index$841;
                    terminated$1067 = true;
                    break;
                }
                cooked$1064 += ch$1065;
            } else if (ch$1065 === '\\') {
                ch$1065 = source$839[index$841++];
                if (!isLineTerminator$862(ch$1065.charCodeAt(0))) {
                    switch (ch$1065) {
                    case 'n':
                        cooked$1064 += '\n';
                        break;
                    case 'r':
                        cooked$1064 += '\r';
                        break;
                    case 't':
                        cooked$1064 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$839[index$841] === '{') {
                            ++index$841;
                            cooked$1064 += scanUnicodeCodePointEscape$871();
                        } else {
                            restore$1069 = index$841;
                            unescaped$1070 = scanHexEscape$870(ch$1065);
                            if (unescaped$1070) {
                                cooked$1064 += unescaped$1070;
                            } else {
                                index$841 = restore$1069;
                                cooked$1064 += ch$1065;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1064 += '\b';
                        break;
                    case 'f':
                        cooked$1064 += '\f';
                        break;
                    case 'v':
                        cooked$1064 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$860(ch$1065)) {
                            code$1071 = '01234567'.indexOf(ch$1065);
                            // \0 is not octal escape sequence
                            if (code$1071 !== 0) {
                                octal$1072 = true;
                            }
                            if (index$841 < length$848 && isOctalDigit$860(source$839[index$841])) {
                                octal$1072 = true;
                                code$1071 = code$1071 * 8 + '01234567'.indexOf(source$839[index$841++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1065) >= 0 && index$841 < length$848 && isOctalDigit$860(source$839[index$841])) {
                                    code$1071 = code$1071 * 8 + '01234567'.indexOf(source$839[index$841++]);
                                }
                            }
                            cooked$1064 += String.fromCharCode(code$1071);
                        } else {
                            cooked$1064 += ch$1065;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$842;
                    if (ch$1065 === '\r' && source$839[index$841] === '\n') {
                        ++index$841;
                    }
                }
            } else if (isLineTerminator$862(ch$1065.charCodeAt(0))) {
                ++lineNumber$842;
                if (ch$1065 === '\r' && source$839[index$841] === '\n') {
                    ++index$841;
                }
                cooked$1064 += '\n';
            } else {
                cooked$1064 += ch$1065;
            }
        }
        if (!terminated$1067) {
            throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$830.Template,
            value: {
                cooked: cooked$1064,
                raw: source$839.slice(start$1066 + 1, index$841 - (tail$1068 ? 1 : 2))
            },
            tail: tail$1068,
            octal: octal$1072,
            lineNumber: lineNumber$842,
            lineStart: lineStart$843,
            range: [
                start$1066,
                index$841
            ]
        };
    }
    function scanTemplateElement$881(option$1073) {
        var startsWith$1074, template$1075;
        lookahead$852 = null;
        skipComment$869();
        startsWith$1074 = option$1073.head ? '`' : '}';
        if (source$839[index$841] !== startsWith$1074) {
            throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
        }
        template$1075 = scanTemplate$880();
        peek$887();
        return template$1075;
    }
    function scanRegExp$882() {
        var str$1076, ch$1077, start$1078, pattern$1079, flags$1080, value$1081, classMarker$1082 = false, restore$1083, terminated$1084 = false;
        lookahead$852 = null;
        skipComment$869();
        start$1078 = index$841;
        ch$1077 = source$839[index$841];
        assert$856(ch$1077 === '/', 'Regular expression literal must start with a slash');
        str$1076 = source$839[index$841++];
        while (index$841 < length$848) {
            ch$1077 = source$839[index$841++];
            str$1076 += ch$1077;
            if (classMarker$1082) {
                if (ch$1077 === ']') {
                    classMarker$1082 = false;
                }
            } else {
                if (ch$1077 === '\\') {
                    ch$1077 = source$839[index$841++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$862(ch$1077.charCodeAt(0))) {
                        throwError$890({}, Messages$835.UnterminatedRegExp);
                    }
                    str$1076 += ch$1077;
                } else if (ch$1077 === '/') {
                    terminated$1084 = true;
                    break;
                } else if (ch$1077 === '[') {
                    classMarker$1082 = true;
                } else if (isLineTerminator$862(ch$1077.charCodeAt(0))) {
                    throwError$890({}, Messages$835.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1084) {
            throwError$890({}, Messages$835.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1079 = str$1076.substr(1, str$1076.length - 2);
        flags$1080 = '';
        while (index$841 < length$848) {
            ch$1077 = source$839[index$841];
            if (!isIdentifierPart$864(ch$1077.charCodeAt(0))) {
                break;
            }
            ++index$841;
            if (ch$1077 === '\\' && index$841 < length$848) {
                ch$1077 = source$839[index$841];
                if (ch$1077 === 'u') {
                    ++index$841;
                    restore$1083 = index$841;
                    ch$1077 = scanHexEscape$870('u');
                    if (ch$1077) {
                        flags$1080 += ch$1077;
                        for (str$1076 += '\\u'; restore$1083 < index$841; ++restore$1083) {
                            str$1076 += source$839[restore$1083];
                        }
                    } else {
                        index$841 = restore$1083;
                        flags$1080 += 'u';
                        str$1076 += '\\u';
                    }
                } else {
                    str$1076 += '\\';
                }
            } else {
                flags$1080 += ch$1077;
                str$1076 += ch$1077;
            }
        }
        try {
            value$1081 = new RegExp(pattern$1079, flags$1080);
        } catch (e$1085) {
            throwError$890({}, Messages$835.InvalidRegExp);
        }
        // peek();
        if (extra$855.tokenize) {
            return {
                type: Token$830.RegularExpression,
                value: value$1081,
                lineNumber: lineNumber$842,
                lineStart: lineStart$843,
                range: [
                    start$1078,
                    index$841
                ]
            };
        }
        return {
            type: Token$830.RegularExpression,
            literal: str$1076,
            value: value$1081,
            range: [
                start$1078,
                index$841
            ]
        };
    }
    function isIdentifierName$883(token$1086) {
        return token$1086.type === Token$830.Identifier || token$1086.type === Token$830.Keyword || token$1086.type === Token$830.BooleanLiteral || token$1086.type === Token$830.NullLiteral;
    }
    function advanceSlash$884() {
        var prevToken$1087, checkToken$1088;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1087 = extra$855.tokens[extra$855.tokens.length - 1];
        if (!prevToken$1087) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$882();
        }
        if (prevToken$1087.type === 'Punctuator') {
            if (prevToken$1087.value === ')') {
                checkToken$1088 = extra$855.tokens[extra$855.openParenToken - 1];
                if (checkToken$1088 && checkToken$1088.type === 'Keyword' && (checkToken$1088.value === 'if' || checkToken$1088.value === 'while' || checkToken$1088.value === 'for' || checkToken$1088.value === 'with')) {
                    return scanRegExp$882();
                }
                return scanPunctuator$875();
            }
            if (prevToken$1087.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$855.tokens[extra$855.openCurlyToken - 3] && extra$855.tokens[extra$855.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1088 = extra$855.tokens[extra$855.openCurlyToken - 4];
                    if (!checkToken$1088) {
                        return scanPunctuator$875();
                    }
                } else if (extra$855.tokens[extra$855.openCurlyToken - 4] && extra$855.tokens[extra$855.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1088 = extra$855.tokens[extra$855.openCurlyToken - 5];
                    if (!checkToken$1088) {
                        return scanRegExp$882();
                    }
                } else {
                    return scanPunctuator$875();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$832.indexOf(checkToken$1088.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$875();
                }
                // It is a declaration.
                return scanRegExp$882();
            }
            return scanRegExp$882();
        }
        if (prevToken$1087.type === 'Keyword') {
            return scanRegExp$882();
        }
        return scanPunctuator$875();
    }
    function advance$885() {
        var ch$1089;
        skipComment$869();
        if (index$841 >= length$848) {
            return {
                type: Token$830.EOF,
                lineNumber: lineNumber$842,
                lineStart: lineStart$843,
                range: [
                    index$841,
                    index$841
                ]
            };
        }
        ch$1089 = source$839.charCodeAt(index$841);
        // Very common: ( and ) and ;
        if (ch$1089 === 40 || ch$1089 === 41 || ch$1089 === 58) {
            return scanPunctuator$875();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1089 === 39 || ch$1089 === 34) {
            return scanStringLiteral$879();
        }
        if (ch$1089 === 96) {
            return scanTemplate$880();
        }
        if (isIdentifierStart$863(ch$1089)) {
            return scanIdentifier$874();
        }
        // # and @ are allowed for sweet.js
        if (ch$1089 === 35 || ch$1089 === 64) {
            ++index$841;
            return {
                type: Token$830.Punctuator,
                value: String.fromCharCode(ch$1089),
                lineNumber: lineNumber$842,
                lineStart: lineStart$843,
                range: [
                    index$841 - 1,
                    index$841
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1089 === 46) {
            if (isDecimalDigit$858(source$839.charCodeAt(index$841 + 1))) {
                return scanNumericLiteral$878();
            }
            return scanPunctuator$875();
        }
        if (isDecimalDigit$858(ch$1089)) {
            return scanNumericLiteral$878();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$855.tokenize && ch$1089 === 47) {
            return advanceSlash$884();
        }
        return scanPunctuator$875();
    }
    function lex$886() {
        var token$1090;
        token$1090 = lookahead$852;
        streamIndex$851 = lookaheadIndex$853;
        lineNumber$842 = token$1090.lineNumber;
        lineStart$843 = token$1090.lineStart;
        sm_lineNumber$844 = lookahead$852.sm_lineNumber;
        sm_lineStart$845 = lookahead$852.sm_lineStart;
        sm_range$846 = lookahead$852.sm_range;
        sm_index$847 = lookahead$852.sm_range[0];
        lookahead$852 = tokenStream$850[++streamIndex$851].token;
        lookaheadIndex$853 = streamIndex$851;
        index$841 = lookahead$852.range[0];
        return token$1090;
    }
    function peek$887() {
        lookaheadIndex$853 = streamIndex$851 + 1;
        if (lookaheadIndex$853 >= length$848) {
            lookahead$852 = {
                type: Token$830.EOF,
                lineNumber: lineNumber$842,
                lineStart: lineStart$843,
                range: [
                    index$841,
                    index$841
                ]
            };
            return;
        }
        lookahead$852 = tokenStream$850[lookaheadIndex$853].token;
        index$841 = lookahead$852.range[0];
    }
    function lookahead2$888() {
        var adv$1091, pos$1092, line$1093, start$1094, result$1095;
        if (streamIndex$851 + 1 >= length$848 || streamIndex$851 + 2 >= length$848) {
            return {
                type: Token$830.EOF,
                lineNumber: lineNumber$842,
                lineStart: lineStart$843,
                range: [
                    index$841,
                    index$841
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$852 === null) {
            lookaheadIndex$853 = streamIndex$851 + 1;
            lookahead$852 = tokenStream$850[lookaheadIndex$853].token;
            index$841 = lookahead$852.range[0];
        }
        result$1095 = tokenStream$850[lookaheadIndex$853 + 1].token;
        return result$1095;
    }
    SyntaxTreeDelegate$837 = {
        name: 'SyntaxTree',
        postProcess: function (node$1096) {
            return node$1096;
        },
        createArrayExpression: function (elements$1097) {
            return {
                type: Syntax$833.ArrayExpression,
                elements: elements$1097
            };
        },
        createAssignmentExpression: function (operator$1098, left$1099, right$1100) {
            return {
                type: Syntax$833.AssignmentExpression,
                operator: operator$1098,
                left: left$1099,
                right: right$1100
            };
        },
        createBinaryExpression: function (operator$1101, left$1102, right$1103) {
            var type$1104 = operator$1101 === '||' || operator$1101 === '&&' ? Syntax$833.LogicalExpression : Syntax$833.BinaryExpression;
            return {
                type: type$1104,
                operator: operator$1101,
                left: left$1102,
                right: right$1103
            };
        },
        createBlockStatement: function (body$1105) {
            return {
                type: Syntax$833.BlockStatement,
                body: body$1105
            };
        },
        createBreakStatement: function (label$1106) {
            return {
                type: Syntax$833.BreakStatement,
                label: label$1106
            };
        },
        createCallExpression: function (callee$1107, args$1108) {
            return {
                type: Syntax$833.CallExpression,
                callee: callee$1107,
                'arguments': args$1108
            };
        },
        createCatchClause: function (param$1109, body$1110) {
            return {
                type: Syntax$833.CatchClause,
                param: param$1109,
                body: body$1110
            };
        },
        createConditionalExpression: function (test$1111, consequent$1112, alternate$1113) {
            return {
                type: Syntax$833.ConditionalExpression,
                test: test$1111,
                consequent: consequent$1112,
                alternate: alternate$1113
            };
        },
        createContinueStatement: function (label$1114) {
            return {
                type: Syntax$833.ContinueStatement,
                label: label$1114
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$833.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1115, test$1116) {
            return {
                type: Syntax$833.DoWhileStatement,
                body: body$1115,
                test: test$1116
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$833.EmptyStatement };
        },
        createExpressionStatement: function (expression$1117) {
            return {
                type: Syntax$833.ExpressionStatement,
                expression: expression$1117
            };
        },
        createForStatement: function (init$1118, test$1119, update$1120, body$1121) {
            return {
                type: Syntax$833.ForStatement,
                init: init$1118,
                test: test$1119,
                update: update$1120,
                body: body$1121
            };
        },
        createForInStatement: function (left$1122, right$1123, body$1124) {
            return {
                type: Syntax$833.ForInStatement,
                left: left$1122,
                right: right$1123,
                body: body$1124,
                each: false
            };
        },
        createForOfStatement: function (left$1125, right$1126, body$1127) {
            return {
                type: Syntax$833.ForOfStatement,
                left: left$1125,
                right: right$1126,
                body: body$1127
            };
        },
        createFunctionDeclaration: function (id$1128, params$1129, defaults$1130, body$1131, rest$1132, generator$1133, expression$1134) {
            return {
                type: Syntax$833.FunctionDeclaration,
                id: id$1128,
                params: params$1129,
                defaults: defaults$1130,
                body: body$1131,
                rest: rest$1132,
                generator: generator$1133,
                expression: expression$1134
            };
        },
        createFunctionExpression: function (id$1135, params$1136, defaults$1137, body$1138, rest$1139, generator$1140, expression$1141) {
            return {
                type: Syntax$833.FunctionExpression,
                id: id$1135,
                params: params$1136,
                defaults: defaults$1137,
                body: body$1138,
                rest: rest$1139,
                generator: generator$1140,
                expression: expression$1141
            };
        },
        createIdentifier: function (name$1142) {
            return {
                type: Syntax$833.Identifier,
                name: name$1142
            };
        },
        createIfStatement: function (test$1143, consequent$1144, alternate$1145) {
            return {
                type: Syntax$833.IfStatement,
                test: test$1143,
                consequent: consequent$1144,
                alternate: alternate$1145
            };
        },
        createLabeledStatement: function (label$1146, body$1147) {
            return {
                type: Syntax$833.LabeledStatement,
                label: label$1146,
                body: body$1147
            };
        },
        createLiteral: function (token$1148) {
            return {
                type: Syntax$833.Literal,
                value: token$1148.value,
                raw: String(token$1148.value)
            };
        },
        createMemberExpression: function (accessor$1149, object$1150, property$1151) {
            return {
                type: Syntax$833.MemberExpression,
                computed: accessor$1149 === '[',
                object: object$1150,
                property: property$1151
            };
        },
        createNewExpression: function (callee$1152, args$1153) {
            return {
                type: Syntax$833.NewExpression,
                callee: callee$1152,
                'arguments': args$1153
            };
        },
        createObjectExpression: function (properties$1154) {
            return {
                type: Syntax$833.ObjectExpression,
                properties: properties$1154
            };
        },
        createPostfixExpression: function (operator$1155, argument$1156) {
            return {
                type: Syntax$833.UpdateExpression,
                operator: operator$1155,
                argument: argument$1156,
                prefix: false
            };
        },
        createProgram: function (body$1157) {
            return {
                type: Syntax$833.Program,
                body: body$1157
            };
        },
        createProperty: function (kind$1158, key$1159, value$1160, method$1161, shorthand$1162) {
            return {
                type: Syntax$833.Property,
                key: key$1159,
                value: value$1160,
                kind: kind$1158,
                method: method$1161,
                shorthand: shorthand$1162
            };
        },
        createReturnStatement: function (argument$1163) {
            return {
                type: Syntax$833.ReturnStatement,
                argument: argument$1163
            };
        },
        createSequenceExpression: function (expressions$1164) {
            return {
                type: Syntax$833.SequenceExpression,
                expressions: expressions$1164
            };
        },
        createSwitchCase: function (test$1165, consequent$1166) {
            return {
                type: Syntax$833.SwitchCase,
                test: test$1165,
                consequent: consequent$1166
            };
        },
        createSwitchStatement: function (discriminant$1167, cases$1168) {
            return {
                type: Syntax$833.SwitchStatement,
                discriminant: discriminant$1167,
                cases: cases$1168
            };
        },
        createThisExpression: function () {
            return { type: Syntax$833.ThisExpression };
        },
        createThrowStatement: function (argument$1169) {
            return {
                type: Syntax$833.ThrowStatement,
                argument: argument$1169
            };
        },
        createTryStatement: function (block$1170, guardedHandlers$1171, handlers$1172, finalizer$1173) {
            return {
                type: Syntax$833.TryStatement,
                block: block$1170,
                guardedHandlers: guardedHandlers$1171,
                handlers: handlers$1172,
                finalizer: finalizer$1173
            };
        },
        createUnaryExpression: function (operator$1174, argument$1175) {
            if (operator$1174 === '++' || operator$1174 === '--') {
                return {
                    type: Syntax$833.UpdateExpression,
                    operator: operator$1174,
                    argument: argument$1175,
                    prefix: true
                };
            }
            return {
                type: Syntax$833.UnaryExpression,
                operator: operator$1174,
                argument: argument$1175
            };
        },
        createVariableDeclaration: function (declarations$1176, kind$1177) {
            return {
                type: Syntax$833.VariableDeclaration,
                declarations: declarations$1176,
                kind: kind$1177
            };
        },
        createVariableDeclarator: function (id$1178, init$1179) {
            return {
                type: Syntax$833.VariableDeclarator,
                id: id$1178,
                init: init$1179
            };
        },
        createWhileStatement: function (test$1180, body$1181) {
            return {
                type: Syntax$833.WhileStatement,
                test: test$1180,
                body: body$1181
            };
        },
        createWithStatement: function (object$1182, body$1183) {
            return {
                type: Syntax$833.WithStatement,
                object: object$1182,
                body: body$1183
            };
        },
        createTemplateElement: function (value$1184, tail$1185) {
            return {
                type: Syntax$833.TemplateElement,
                value: value$1184,
                tail: tail$1185
            };
        },
        createTemplateLiteral: function (quasis$1186, expressions$1187) {
            return {
                type: Syntax$833.TemplateLiteral,
                quasis: quasis$1186,
                expressions: expressions$1187
            };
        },
        createSpreadElement: function (argument$1188) {
            return {
                type: Syntax$833.SpreadElement,
                argument: argument$1188
            };
        },
        createTaggedTemplateExpression: function (tag$1189, quasi$1190) {
            return {
                type: Syntax$833.TaggedTemplateExpression,
                tag: tag$1189,
                quasi: quasi$1190
            };
        },
        createArrowFunctionExpression: function (params$1191, defaults$1192, body$1193, rest$1194, expression$1195) {
            return {
                type: Syntax$833.ArrowFunctionExpression,
                id: null,
                params: params$1191,
                defaults: defaults$1192,
                body: body$1193,
                rest: rest$1194,
                generator: false,
                expression: expression$1195
            };
        },
        createMethodDefinition: function (propertyType$1196, kind$1197, key$1198, value$1199) {
            return {
                type: Syntax$833.MethodDefinition,
                key: key$1198,
                value: value$1199,
                kind: kind$1197,
                'static': propertyType$1196 === ClassPropertyType$838.static
            };
        },
        createClassBody: function (body$1200) {
            return {
                type: Syntax$833.ClassBody,
                body: body$1200
            };
        },
        createClassExpression: function (id$1201, superClass$1202, body$1203) {
            return {
                type: Syntax$833.ClassExpression,
                id: id$1201,
                superClass: superClass$1202,
                body: body$1203
            };
        },
        createClassDeclaration: function (id$1204, superClass$1205, body$1206) {
            return {
                type: Syntax$833.ClassDeclaration,
                id: id$1204,
                superClass: superClass$1205,
                body: body$1206
            };
        },
        createExportSpecifier: function (id$1207, name$1208) {
            return {
                type: Syntax$833.ExportSpecifier,
                id: id$1207,
                name: name$1208
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$833.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1209, specifiers$1210, source$1211) {
            return {
                type: Syntax$833.ExportDeclaration,
                declaration: declaration$1209,
                specifiers: specifiers$1210,
                source: source$1211
            };
        },
        createImportSpecifier: function (id$1212, name$1213) {
            return {
                type: Syntax$833.ImportSpecifier,
                id: id$1212,
                name: name$1213
            };
        },
        createImportDeclaration: function (specifiers$1214, kind$1215, source$1216) {
            return {
                type: Syntax$833.ImportDeclaration,
                specifiers: specifiers$1214,
                kind: kind$1215,
                source: source$1216
            };
        },
        createYieldExpression: function (argument$1217, delegate$1218) {
            return {
                type: Syntax$833.YieldExpression,
                argument: argument$1217,
                delegate: delegate$1218
            };
        },
        createModuleDeclaration: function (id$1219, source$1220, body$1221) {
            return {
                type: Syntax$833.ModuleDeclaration,
                id: id$1219,
                source: source$1220,
                body: body$1221
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$889() {
        return lookahead$852.lineNumber !== lineNumber$842;
    }
    // Throw an exception
    function throwError$890(token$1222, messageFormat$1223) {
        var error$1224, args$1225 = Array.prototype.slice.call(arguments, 2), msg$1226 = messageFormat$1223.replace(/%(\d)/g, function (whole$1227, index$1228) {
                assert$856(index$1228 < args$1225.length, 'Message reference must be in range');
                return args$1225[index$1228];
            });
        if (typeof token$1222.lineNumber === 'number') {
            error$1224 = new Error('Line ' + token$1222.lineNumber + ': ' + msg$1226);
            error$1224.index = token$1222.range[0];
            error$1224.lineNumber = token$1222.lineNumber;
            error$1224.column = token$1222.range[0] - lineStart$843 + 1;
        } else {
            error$1224 = new Error('Line ' + lineNumber$842 + ': ' + msg$1226);
            error$1224.index = index$841;
            error$1224.lineNumber = lineNumber$842;
            error$1224.column = index$841 - lineStart$843 + 1;
        }
        error$1224.description = msg$1226;
        throw error$1224;
    }
    function throwErrorTolerant$891() {
        try {
            throwError$890.apply(null, arguments);
        } catch (e$1229) {
            if (extra$855.errors) {
                extra$855.errors.push(e$1229);
            } else {
                throw e$1229;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$892(token$1230) {
        if (token$1230.type === Token$830.EOF) {
            throwError$890(token$1230, Messages$835.UnexpectedEOS);
        }
        if (token$1230.type === Token$830.NumericLiteral) {
            throwError$890(token$1230, Messages$835.UnexpectedNumber);
        }
        if (token$1230.type === Token$830.StringLiteral) {
            throwError$890(token$1230, Messages$835.UnexpectedString);
        }
        if (token$1230.type === Token$830.Identifier) {
            throwError$890(token$1230, Messages$835.UnexpectedIdentifier);
        }
        if (token$1230.type === Token$830.Keyword) {
            if (isFutureReservedWord$865(token$1230.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$840 && isStrictModeReservedWord$866(token$1230.value)) {
                throwErrorTolerant$891(token$1230, Messages$835.StrictReservedWord);
                return;
            }
            throwError$890(token$1230, Messages$835.UnexpectedToken, token$1230.value);
        }
        if (token$1230.type === Token$830.Template) {
            throwError$890(token$1230, Messages$835.UnexpectedTemplate, token$1230.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$890(token$1230, Messages$835.UnexpectedToken, token$1230.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$893(value$1231) {
        var token$1232 = lex$886();
        if (token$1232.type !== Token$830.Punctuator || token$1232.value !== value$1231) {
            throwUnexpected$892(token$1232);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$894(keyword$1233) {
        var token$1234 = lex$886();
        if (token$1234.type !== Token$830.Keyword || token$1234.value !== keyword$1233) {
            throwUnexpected$892(token$1234);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$895(value$1235) {
        return lookahead$852.type === Token$830.Punctuator && lookahead$852.value === value$1235;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$896(keyword$1236) {
        return lookahead$852.type === Token$830.Keyword && lookahead$852.value === keyword$1236;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$897(keyword$1237) {
        return lookahead$852.type === Token$830.Identifier && lookahead$852.value === keyword$1237;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$898() {
        var op$1238;
        if (lookahead$852.type !== Token$830.Punctuator) {
            return false;
        }
        op$1238 = lookahead$852.value;
        return op$1238 === '=' || op$1238 === '*=' || op$1238 === '/=' || op$1238 === '%=' || op$1238 === '+=' || op$1238 === '-=' || op$1238 === '<<=' || op$1238 === '>>=' || op$1238 === '>>>=' || op$1238 === '&=' || op$1238 === '^=' || op$1238 === '|=';
    }
    function consumeSemicolon$899() {
        var line$1239, ch$1240;
        ch$1240 = lookahead$852.value ? String(lookahead$852.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1240 === 59) {
            lex$886();
            return;
        }
        if (lookahead$852.lineNumber !== lineNumber$842) {
            return;
        }
        if (match$895(';')) {
            lex$886();
            return;
        }
        if (lookahead$852.type !== Token$830.EOF && !match$895('}')) {
            throwUnexpected$892(lookahead$852);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$900(expr$1241) {
        return expr$1241.type === Syntax$833.Identifier || expr$1241.type === Syntax$833.MemberExpression;
    }
    function isAssignableLeftHandSide$901(expr$1242) {
        return isLeftHandSide$900(expr$1242) || expr$1242.type === Syntax$833.ObjectPattern || expr$1242.type === Syntax$833.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$902() {
        var elements$1243 = [], blocks$1244 = [], filter$1245 = null, tmp$1246, possiblecomprehension$1247 = true, body$1248;
        expect$893('[');
        while (!match$895(']')) {
            if (lookahead$852.value === 'for' && lookahead$852.type === Token$830.Keyword) {
                if (!possiblecomprehension$1247) {
                    throwError$890({}, Messages$835.ComprehensionError);
                }
                matchKeyword$896('for');
                tmp$1246 = parseForStatement$950({ ignoreBody: true });
                tmp$1246.of = tmp$1246.type === Syntax$833.ForOfStatement;
                tmp$1246.type = Syntax$833.ComprehensionBlock;
                if (tmp$1246.left.kind) {
                    // can't be let or const
                    throwError$890({}, Messages$835.ComprehensionError);
                }
                blocks$1244.push(tmp$1246);
            } else if (lookahead$852.value === 'if' && lookahead$852.type === Token$830.Keyword) {
                if (!possiblecomprehension$1247) {
                    throwError$890({}, Messages$835.ComprehensionError);
                }
                expectKeyword$894('if');
                expect$893('(');
                filter$1245 = parseExpression$930();
                expect$893(')');
            } else if (lookahead$852.value === ',' && lookahead$852.type === Token$830.Punctuator) {
                possiblecomprehension$1247 = false;
                // no longer allowed.
                lex$886();
                elements$1243.push(null);
            } else {
                tmp$1246 = parseSpreadOrAssignmentExpression$913();
                elements$1243.push(tmp$1246);
                if (tmp$1246 && tmp$1246.type === Syntax$833.SpreadElement) {
                    if (!match$895(']')) {
                        throwError$890({}, Messages$835.ElementAfterSpreadElement);
                    }
                } else if (!(match$895(']') || matchKeyword$896('for') || matchKeyword$896('if'))) {
                    expect$893(',');
                    // this lexes.
                    possiblecomprehension$1247 = false;
                }
            }
        }
        expect$893(']');
        if (filter$1245 && !blocks$1244.length) {
            throwError$890({}, Messages$835.ComprehensionRequiresBlock);
        }
        if (blocks$1244.length) {
            if (elements$1243.length !== 1) {
                throwError$890({}, Messages$835.ComprehensionError);
            }
            return {
                type: Syntax$833.ComprehensionExpression,
                filter: filter$1245,
                blocks: blocks$1244,
                body: elements$1243[0]
            };
        }
        return delegate$849.createArrayExpression(elements$1243);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$903(options$1249) {
        var previousStrict$1250, previousYieldAllowed$1251, params$1252, defaults$1253, body$1254;
        previousStrict$1250 = strict$840;
        previousYieldAllowed$1251 = state$854.yieldAllowed;
        state$854.yieldAllowed = options$1249.generator;
        params$1252 = options$1249.params || [];
        defaults$1253 = options$1249.defaults || [];
        body$1254 = parseConciseBody$962();
        if (options$1249.name && strict$840 && isRestrictedWord$867(params$1252[0].name)) {
            throwErrorTolerant$891(options$1249.name, Messages$835.StrictParamName);
        }
        if (state$854.yieldAllowed && !state$854.yieldFound) {
            throwErrorTolerant$891({}, Messages$835.NoYieldInGenerator);
        }
        strict$840 = previousStrict$1250;
        state$854.yieldAllowed = previousYieldAllowed$1251;
        return delegate$849.createFunctionExpression(null, params$1252, defaults$1253, body$1254, options$1249.rest || null, options$1249.generator, body$1254.type !== Syntax$833.BlockStatement);
    }
    function parsePropertyMethodFunction$904(options$1255) {
        var previousStrict$1256, tmp$1257, method$1258;
        previousStrict$1256 = strict$840;
        strict$840 = true;
        tmp$1257 = parseParams$966();
        if (tmp$1257.stricted) {
            throwErrorTolerant$891(tmp$1257.stricted, tmp$1257.message);
        }
        method$1258 = parsePropertyFunction$903({
            params: tmp$1257.params,
            defaults: tmp$1257.defaults,
            rest: tmp$1257.rest,
            generator: options$1255.generator
        });
        strict$840 = previousStrict$1256;
        return method$1258;
    }
    function parseObjectPropertyKey$905() {
        var token$1259 = lex$886();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1259.type === Token$830.StringLiteral || token$1259.type === Token$830.NumericLiteral) {
            if (strict$840 && token$1259.octal) {
                throwErrorTolerant$891(token$1259, Messages$835.StrictOctalLiteral);
            }
            return delegate$849.createLiteral(token$1259);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$849.createIdentifier(token$1259.value);
    }
    function parseObjectProperty$906() {
        var token$1260, key$1261, id$1262, value$1263, param$1264;
        token$1260 = lookahead$852;
        if (token$1260.type === Token$830.Identifier) {
            id$1262 = parseObjectPropertyKey$905();
            // Property Assignment: Getter and Setter.
            if (token$1260.value === 'get' && !(match$895(':') || match$895('('))) {
                key$1261 = parseObjectPropertyKey$905();
                expect$893('(');
                expect$893(')');
                return delegate$849.createProperty('get', key$1261, parsePropertyFunction$903({ generator: false }), false, false);
            }
            if (token$1260.value === 'set' && !(match$895(':') || match$895('('))) {
                key$1261 = parseObjectPropertyKey$905();
                expect$893('(');
                token$1260 = lookahead$852;
                param$1264 = [parseVariableIdentifier$933()];
                expect$893(')');
                return delegate$849.createProperty('set', key$1261, parsePropertyFunction$903({
                    params: param$1264,
                    generator: false,
                    name: token$1260
                }), false, false);
            }
            if (match$895(':')) {
                lex$886();
                return delegate$849.createProperty('init', id$1262, parseAssignmentExpression$929(), false, false);
            }
            if (match$895('(')) {
                return delegate$849.createProperty('init', id$1262, parsePropertyMethodFunction$904({ generator: false }), true, false);
            }
            return delegate$849.createProperty('init', id$1262, id$1262, false, true);
        }
        if (token$1260.type === Token$830.EOF || token$1260.type === Token$830.Punctuator) {
            if (!match$895('*')) {
                throwUnexpected$892(token$1260);
            }
            lex$886();
            id$1262 = parseObjectPropertyKey$905();
            if (!match$895('(')) {
                throwUnexpected$892(lex$886());
            }
            return delegate$849.createProperty('init', id$1262, parsePropertyMethodFunction$904({ generator: true }), true, false);
        }
        key$1261 = parseObjectPropertyKey$905();
        if (match$895(':')) {
            lex$886();
            return delegate$849.createProperty('init', key$1261, parseAssignmentExpression$929(), false, false);
        }
        if (match$895('(')) {
            return delegate$849.createProperty('init', key$1261, parsePropertyMethodFunction$904({ generator: false }), true, false);
        }
        throwUnexpected$892(lex$886());
    }
    function parseObjectInitialiser$907() {
        var properties$1265 = [], property$1266, name$1267, key$1268, kind$1269, map$1270 = {}, toString$1271 = String;
        expect$893('{');
        while (!match$895('}')) {
            property$1266 = parseObjectProperty$906();
            if (property$1266.key.type === Syntax$833.Identifier) {
                name$1267 = property$1266.key.name;
            } else {
                name$1267 = toString$1271(property$1266.key.value);
            }
            kind$1269 = property$1266.kind === 'init' ? PropertyKind$834.Data : property$1266.kind === 'get' ? PropertyKind$834.Get : PropertyKind$834.Set;
            key$1268 = '$' + name$1267;
            if (Object.prototype.hasOwnProperty.call(map$1270, key$1268)) {
                if (map$1270[key$1268] === PropertyKind$834.Data) {
                    if (strict$840 && kind$1269 === PropertyKind$834.Data) {
                        throwErrorTolerant$891({}, Messages$835.StrictDuplicateProperty);
                    } else if (kind$1269 !== PropertyKind$834.Data) {
                        throwErrorTolerant$891({}, Messages$835.AccessorDataProperty);
                    }
                } else {
                    if (kind$1269 === PropertyKind$834.Data) {
                        throwErrorTolerant$891({}, Messages$835.AccessorDataProperty);
                    } else if (map$1270[key$1268] & kind$1269) {
                        throwErrorTolerant$891({}, Messages$835.AccessorGetSet);
                    }
                }
                map$1270[key$1268] |= kind$1269;
            } else {
                map$1270[key$1268] = kind$1269;
            }
            properties$1265.push(property$1266);
            if (!match$895('}')) {
                expect$893(',');
            }
        }
        expect$893('}');
        return delegate$849.createObjectExpression(properties$1265);
    }
    function parseTemplateElement$908(option$1272) {
        var token$1273 = scanTemplateElement$881(option$1272);
        if (strict$840 && token$1273.octal) {
            throwError$890(token$1273, Messages$835.StrictOctalLiteral);
        }
        return delegate$849.createTemplateElement({
            raw: token$1273.value.raw,
            cooked: token$1273.value.cooked
        }, token$1273.tail);
    }
    function parseTemplateLiteral$909() {
        var quasi$1274, quasis$1275, expressions$1276;
        quasi$1274 = parseTemplateElement$908({ head: true });
        quasis$1275 = [quasi$1274];
        expressions$1276 = [];
        while (!quasi$1274.tail) {
            expressions$1276.push(parseExpression$930());
            quasi$1274 = parseTemplateElement$908({ head: false });
            quasis$1275.push(quasi$1274);
        }
        return delegate$849.createTemplateLiteral(quasis$1275, expressions$1276);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$910() {
        var expr$1277;
        expect$893('(');
        ++state$854.parenthesizedCount;
        expr$1277 = parseExpression$930();
        expect$893(')');
        return expr$1277;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$911() {
        var type$1278, token$1279, resolvedIdent$1280;
        token$1279 = lookahead$852;
        type$1278 = lookahead$852.type;
        if (type$1278 === Token$830.Identifier) {
            resolvedIdent$1280 = expander$829.resolve(tokenStream$850[lookaheadIndex$853]);
            lex$886();
            return delegate$849.createIdentifier(resolvedIdent$1280);
        }
        if (type$1278 === Token$830.StringLiteral || type$1278 === Token$830.NumericLiteral) {
            if (strict$840 && lookahead$852.octal) {
                throwErrorTolerant$891(lookahead$852, Messages$835.StrictOctalLiteral);
            }
            return delegate$849.createLiteral(lex$886());
        }
        if (type$1278 === Token$830.Keyword) {
            if (matchKeyword$896('this')) {
                lex$886();
                return delegate$849.createThisExpression();
            }
            if (matchKeyword$896('function')) {
                return parseFunctionExpression$968();
            }
            if (matchKeyword$896('class')) {
                return parseClassExpression$973();
            }
            if (matchKeyword$896('super')) {
                lex$886();
                return delegate$849.createIdentifier('super');
            }
        }
        if (type$1278 === Token$830.BooleanLiteral) {
            token$1279 = lex$886();
            token$1279.value = token$1279.value === 'true';
            return delegate$849.createLiteral(token$1279);
        }
        if (type$1278 === Token$830.NullLiteral) {
            token$1279 = lex$886();
            token$1279.value = null;
            return delegate$849.createLiteral(token$1279);
        }
        if (match$895('[')) {
            return parseArrayInitialiser$902();
        }
        if (match$895('{')) {
            return parseObjectInitialiser$907();
        }
        if (match$895('(')) {
            return parseGroupExpression$910();
        }
        if (lookahead$852.type === Token$830.RegularExpression) {
            return delegate$849.createLiteral(lex$886());
        }
        if (type$1278 === Token$830.Template) {
            return parseTemplateLiteral$909();
        }
        return throwUnexpected$892(lex$886());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$912() {
        var args$1281 = [], arg$1282;
        expect$893('(');
        if (!match$895(')')) {
            while (streamIndex$851 < length$848) {
                arg$1282 = parseSpreadOrAssignmentExpression$913();
                args$1281.push(arg$1282);
                if (match$895(')')) {
                    break;
                } else if (arg$1282.type === Syntax$833.SpreadElement) {
                    throwError$890({}, Messages$835.ElementAfterSpreadElement);
                }
                expect$893(',');
            }
        }
        expect$893(')');
        return args$1281;
    }
    function parseSpreadOrAssignmentExpression$913() {
        if (match$895('...')) {
            lex$886();
            return delegate$849.createSpreadElement(parseAssignmentExpression$929());
        }
        return parseAssignmentExpression$929();
    }
    function parseNonComputedProperty$914() {
        var token$1283 = lex$886();
        if (!isIdentifierName$883(token$1283)) {
            throwUnexpected$892(token$1283);
        }
        return delegate$849.createIdentifier(token$1283.value);
    }
    function parseNonComputedMember$915() {
        expect$893('.');
        return parseNonComputedProperty$914();
    }
    function parseComputedMember$916() {
        var expr$1284;
        expect$893('[');
        expr$1284 = parseExpression$930();
        expect$893(']');
        return expr$1284;
    }
    function parseNewExpression$917() {
        var callee$1285, args$1286;
        expectKeyword$894('new');
        callee$1285 = parseLeftHandSideExpression$919();
        args$1286 = match$895('(') ? parseArguments$912() : [];
        return delegate$849.createNewExpression(callee$1285, args$1286);
    }
    function parseLeftHandSideExpressionAllowCall$918() {
        var expr$1287, args$1288, property$1289;
        expr$1287 = matchKeyword$896('new') ? parseNewExpression$917() : parsePrimaryExpression$911();
        while (match$895('.') || match$895('[') || match$895('(') || lookahead$852.type === Token$830.Template) {
            if (match$895('(')) {
                args$1288 = parseArguments$912();
                expr$1287 = delegate$849.createCallExpression(expr$1287, args$1288);
            } else if (match$895('[')) {
                expr$1287 = delegate$849.createMemberExpression('[', expr$1287, parseComputedMember$916());
            } else if (match$895('.')) {
                expr$1287 = delegate$849.createMemberExpression('.', expr$1287, parseNonComputedMember$915());
            } else {
                expr$1287 = delegate$849.createTaggedTemplateExpression(expr$1287, parseTemplateLiteral$909());
            }
        }
        return expr$1287;
    }
    function parseLeftHandSideExpression$919() {
        var expr$1290, property$1291;
        expr$1290 = matchKeyword$896('new') ? parseNewExpression$917() : parsePrimaryExpression$911();
        while (match$895('.') || match$895('[') || lookahead$852.type === Token$830.Template) {
            if (match$895('[')) {
                expr$1290 = delegate$849.createMemberExpression('[', expr$1290, parseComputedMember$916());
            } else if (match$895('.')) {
                expr$1290 = delegate$849.createMemberExpression('.', expr$1290, parseNonComputedMember$915());
            } else {
                expr$1290 = delegate$849.createTaggedTemplateExpression(expr$1290, parseTemplateLiteral$909());
            }
        }
        return expr$1290;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$920() {
        var expr$1292 = parseLeftHandSideExpressionAllowCall$918(), token$1293 = lookahead$852;
        if (lookahead$852.type !== Token$830.Punctuator) {
            return expr$1292;
        }
        if ((match$895('++') || match$895('--')) && !peekLineTerminator$889()) {
            // 11.3.1, 11.3.2
            if (strict$840 && expr$1292.type === Syntax$833.Identifier && isRestrictedWord$867(expr$1292.name)) {
                throwErrorTolerant$891({}, Messages$835.StrictLHSPostfix);
            }
            if (!isLeftHandSide$900(expr$1292)) {
                throwError$890({}, Messages$835.InvalidLHSInAssignment);
            }
            token$1293 = lex$886();
            expr$1292 = delegate$849.createPostfixExpression(token$1293.value, expr$1292);
        }
        return expr$1292;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$921() {
        var token$1294, expr$1295;
        if (lookahead$852.type !== Token$830.Punctuator && lookahead$852.type !== Token$830.Keyword) {
            return parsePostfixExpression$920();
        }
        if (match$895('++') || match$895('--')) {
            token$1294 = lex$886();
            expr$1295 = parseUnaryExpression$921();
            // 11.4.4, 11.4.5
            if (strict$840 && expr$1295.type === Syntax$833.Identifier && isRestrictedWord$867(expr$1295.name)) {
                throwErrorTolerant$891({}, Messages$835.StrictLHSPrefix);
            }
            if (!isLeftHandSide$900(expr$1295)) {
                throwError$890({}, Messages$835.InvalidLHSInAssignment);
            }
            return delegate$849.createUnaryExpression(token$1294.value, expr$1295);
        }
        if (match$895('+') || match$895('-') || match$895('~') || match$895('!')) {
            token$1294 = lex$886();
            expr$1295 = parseUnaryExpression$921();
            return delegate$849.createUnaryExpression(token$1294.value, expr$1295);
        }
        if (matchKeyword$896('delete') || matchKeyword$896('void') || matchKeyword$896('typeof')) {
            token$1294 = lex$886();
            expr$1295 = parseUnaryExpression$921();
            expr$1295 = delegate$849.createUnaryExpression(token$1294.value, expr$1295);
            if (strict$840 && expr$1295.operator === 'delete' && expr$1295.argument.type === Syntax$833.Identifier) {
                throwErrorTolerant$891({}, Messages$835.StrictDelete);
            }
            return expr$1295;
        }
        return parsePostfixExpression$920();
    }
    function binaryPrecedence$922(token$1296, allowIn$1297) {
        var prec$1298 = 0;
        if (token$1296.type !== Token$830.Punctuator && token$1296.type !== Token$830.Keyword) {
            return 0;
        }
        switch (token$1296.value) {
        case '||':
            prec$1298 = 1;
            break;
        case '&&':
            prec$1298 = 2;
            break;
        case '|':
            prec$1298 = 3;
            break;
        case '^':
            prec$1298 = 4;
            break;
        case '&':
            prec$1298 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1298 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1298 = 7;
            break;
        case 'in':
            prec$1298 = allowIn$1297 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1298 = 8;
            break;
        case '+':
        case '-':
            prec$1298 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1298 = 11;
            break;
        default:
            break;
        }
        return prec$1298;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$923() {
        var expr$1299, token$1300, prec$1301, previousAllowIn$1302, stack$1303, right$1304, operator$1305, left$1306, i$1307;
        previousAllowIn$1302 = state$854.allowIn;
        state$854.allowIn = true;
        expr$1299 = parseUnaryExpression$921();
        token$1300 = lookahead$852;
        prec$1301 = binaryPrecedence$922(token$1300, previousAllowIn$1302);
        if (prec$1301 === 0) {
            return expr$1299;
        }
        token$1300.prec = prec$1301;
        lex$886();
        stack$1303 = [
            expr$1299,
            token$1300,
            parseUnaryExpression$921()
        ];
        while ((prec$1301 = binaryPrecedence$922(lookahead$852, previousAllowIn$1302)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1303.length > 2 && prec$1301 <= stack$1303[stack$1303.length - 2].prec) {
                right$1304 = stack$1303.pop();
                operator$1305 = stack$1303.pop().value;
                left$1306 = stack$1303.pop();
                stack$1303.push(delegate$849.createBinaryExpression(operator$1305, left$1306, right$1304));
            }
            // Shift.
            token$1300 = lex$886();
            token$1300.prec = prec$1301;
            stack$1303.push(token$1300);
            stack$1303.push(parseUnaryExpression$921());
        }
        state$854.allowIn = previousAllowIn$1302;
        // Final reduce to clean-up the stack.
        i$1307 = stack$1303.length - 1;
        expr$1299 = stack$1303[i$1307];
        while (i$1307 > 1) {
            expr$1299 = delegate$849.createBinaryExpression(stack$1303[i$1307 - 1].value, stack$1303[i$1307 - 2], expr$1299);
            i$1307 -= 2;
        }
        return expr$1299;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$924() {
        var expr$1308, previousAllowIn$1309, consequent$1310, alternate$1311;
        expr$1308 = parseBinaryExpression$923();
        if (match$895('?')) {
            lex$886();
            previousAllowIn$1309 = state$854.allowIn;
            state$854.allowIn = true;
            consequent$1310 = parseAssignmentExpression$929();
            state$854.allowIn = previousAllowIn$1309;
            expect$893(':');
            alternate$1311 = parseAssignmentExpression$929();
            expr$1308 = delegate$849.createConditionalExpression(expr$1308, consequent$1310, alternate$1311);
        }
        return expr$1308;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$925(expr$1312) {
        var i$1313, len$1314, property$1315, element$1316;
        if (expr$1312.type === Syntax$833.ObjectExpression) {
            expr$1312.type = Syntax$833.ObjectPattern;
            for (i$1313 = 0, len$1314 = expr$1312.properties.length; i$1313 < len$1314; i$1313 += 1) {
                property$1315 = expr$1312.properties[i$1313];
                if (property$1315.kind !== 'init') {
                    throwError$890({}, Messages$835.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$925(property$1315.value);
            }
        } else if (expr$1312.type === Syntax$833.ArrayExpression) {
            expr$1312.type = Syntax$833.ArrayPattern;
            for (i$1313 = 0, len$1314 = expr$1312.elements.length; i$1313 < len$1314; i$1313 += 1) {
                element$1316 = expr$1312.elements[i$1313];
                if (element$1316) {
                    reinterpretAsAssignmentBindingPattern$925(element$1316);
                }
            }
        } else if (expr$1312.type === Syntax$833.Identifier) {
            if (isRestrictedWord$867(expr$1312.name)) {
                throwError$890({}, Messages$835.InvalidLHSInAssignment);
            }
        } else if (expr$1312.type === Syntax$833.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$925(expr$1312.argument);
            if (expr$1312.argument.type === Syntax$833.ObjectPattern) {
                throwError$890({}, Messages$835.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1312.type !== Syntax$833.MemberExpression && expr$1312.type !== Syntax$833.CallExpression && expr$1312.type !== Syntax$833.NewExpression) {
                throwError$890({}, Messages$835.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$926(options$1317, expr$1318) {
        var i$1319, len$1320, property$1321, element$1322;
        if (expr$1318.type === Syntax$833.ObjectExpression) {
            expr$1318.type = Syntax$833.ObjectPattern;
            for (i$1319 = 0, len$1320 = expr$1318.properties.length; i$1319 < len$1320; i$1319 += 1) {
                property$1321 = expr$1318.properties[i$1319];
                if (property$1321.kind !== 'init') {
                    throwError$890({}, Messages$835.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$926(options$1317, property$1321.value);
            }
        } else if (expr$1318.type === Syntax$833.ArrayExpression) {
            expr$1318.type = Syntax$833.ArrayPattern;
            for (i$1319 = 0, len$1320 = expr$1318.elements.length; i$1319 < len$1320; i$1319 += 1) {
                element$1322 = expr$1318.elements[i$1319];
                if (element$1322) {
                    reinterpretAsDestructuredParameter$926(options$1317, element$1322);
                }
            }
        } else if (expr$1318.type === Syntax$833.Identifier) {
            validateParam$964(options$1317, expr$1318, expr$1318.name);
        } else {
            if (expr$1318.type !== Syntax$833.MemberExpression) {
                throwError$890({}, Messages$835.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$927(expressions$1323) {
        var i$1324, len$1325, param$1326, params$1327, defaults$1328, defaultCount$1329, options$1330, rest$1331;
        params$1327 = [];
        defaults$1328 = [];
        defaultCount$1329 = 0;
        rest$1331 = null;
        options$1330 = { paramSet: {} };
        for (i$1324 = 0, len$1325 = expressions$1323.length; i$1324 < len$1325; i$1324 += 1) {
            param$1326 = expressions$1323[i$1324];
            if (param$1326.type === Syntax$833.Identifier) {
                params$1327.push(param$1326);
                defaults$1328.push(null);
                validateParam$964(options$1330, param$1326, param$1326.name);
            } else if (param$1326.type === Syntax$833.ObjectExpression || param$1326.type === Syntax$833.ArrayExpression) {
                reinterpretAsDestructuredParameter$926(options$1330, param$1326);
                params$1327.push(param$1326);
                defaults$1328.push(null);
            } else if (param$1326.type === Syntax$833.SpreadElement) {
                assert$856(i$1324 === len$1325 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$926(options$1330, param$1326.argument);
                rest$1331 = param$1326.argument;
            } else if (param$1326.type === Syntax$833.AssignmentExpression) {
                params$1327.push(param$1326.left);
                defaults$1328.push(param$1326.right);
                ++defaultCount$1329;
                validateParam$964(options$1330, param$1326.left, param$1326.left.name);
            } else {
                return null;
            }
        }
        if (options$1330.message === Messages$835.StrictParamDupe) {
            throwError$890(strict$840 ? options$1330.stricted : options$1330.firstRestricted, options$1330.message);
        }
        if (defaultCount$1329 === 0) {
            defaults$1328 = [];
        }
        return {
            params: params$1327,
            defaults: defaults$1328,
            rest: rest$1331,
            stricted: options$1330.stricted,
            firstRestricted: options$1330.firstRestricted,
            message: options$1330.message
        };
    }
    function parseArrowFunctionExpression$928(options$1332) {
        var previousStrict$1333, previousYieldAllowed$1334, body$1335;
        expect$893('=>');
        previousStrict$1333 = strict$840;
        previousYieldAllowed$1334 = state$854.yieldAllowed;
        state$854.yieldAllowed = false;
        body$1335 = parseConciseBody$962();
        if (strict$840 && options$1332.firstRestricted) {
            throwError$890(options$1332.firstRestricted, options$1332.message);
        }
        if (strict$840 && options$1332.stricted) {
            throwErrorTolerant$891(options$1332.stricted, options$1332.message);
        }
        strict$840 = previousStrict$1333;
        state$854.yieldAllowed = previousYieldAllowed$1334;
        return delegate$849.createArrowFunctionExpression(options$1332.params, options$1332.defaults, body$1335, options$1332.rest, body$1335.type !== Syntax$833.BlockStatement);
    }
    function parseAssignmentExpression$929() {
        var expr$1336, token$1337, params$1338, oldParenthesizedCount$1339;
        if (matchKeyword$896('yield')) {
            return parseYieldExpression$969();
        }
        oldParenthesizedCount$1339 = state$854.parenthesizedCount;
        if (match$895('(')) {
            token$1337 = lookahead2$888();
            if (token$1337.type === Token$830.Punctuator && token$1337.value === ')' || token$1337.value === '...') {
                params$1338 = parseParams$966();
                if (!match$895('=>')) {
                    throwUnexpected$892(lex$886());
                }
                return parseArrowFunctionExpression$928(params$1338);
            }
        }
        token$1337 = lookahead$852;
        expr$1336 = parseConditionalExpression$924();
        if (match$895('=>') && (state$854.parenthesizedCount === oldParenthesizedCount$1339 || state$854.parenthesizedCount === oldParenthesizedCount$1339 + 1)) {
            if (expr$1336.type === Syntax$833.Identifier) {
                params$1338 = reinterpretAsCoverFormalsList$927([expr$1336]);
            } else if (expr$1336.type === Syntax$833.SequenceExpression) {
                params$1338 = reinterpretAsCoverFormalsList$927(expr$1336.expressions);
            }
            if (params$1338) {
                return parseArrowFunctionExpression$928(params$1338);
            }
        }
        if (matchAssign$898()) {
            // 11.13.1
            if (strict$840 && expr$1336.type === Syntax$833.Identifier && isRestrictedWord$867(expr$1336.name)) {
                throwErrorTolerant$891(token$1337, Messages$835.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$895('=') && (expr$1336.type === Syntax$833.ObjectExpression || expr$1336.type === Syntax$833.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$925(expr$1336);
            } else if (!isLeftHandSide$900(expr$1336)) {
                throwError$890({}, Messages$835.InvalidLHSInAssignment);
            }
            expr$1336 = delegate$849.createAssignmentExpression(lex$886().value, expr$1336, parseAssignmentExpression$929());
        }
        return expr$1336;
    }
    // 11.14 Comma Operator
    function parseExpression$930() {
        var expr$1340, expressions$1341, sequence$1342, coverFormalsList$1343, spreadFound$1344, oldParenthesizedCount$1345;
        oldParenthesizedCount$1345 = state$854.parenthesizedCount;
        expr$1340 = parseAssignmentExpression$929();
        expressions$1341 = [expr$1340];
        if (match$895(',')) {
            while (streamIndex$851 < length$848) {
                if (!match$895(',')) {
                    break;
                }
                lex$886();
                expr$1340 = parseSpreadOrAssignmentExpression$913();
                expressions$1341.push(expr$1340);
                if (expr$1340.type === Syntax$833.SpreadElement) {
                    spreadFound$1344 = true;
                    if (!match$895(')')) {
                        throwError$890({}, Messages$835.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1342 = delegate$849.createSequenceExpression(expressions$1341);
        }
        if (match$895('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$854.parenthesizedCount === oldParenthesizedCount$1345 || state$854.parenthesizedCount === oldParenthesizedCount$1345 + 1) {
                expr$1340 = expr$1340.type === Syntax$833.SequenceExpression ? expr$1340.expressions : expressions$1341;
                coverFormalsList$1343 = reinterpretAsCoverFormalsList$927(expr$1340);
                if (coverFormalsList$1343) {
                    return parseArrowFunctionExpression$928(coverFormalsList$1343);
                }
            }
            throwUnexpected$892(lex$886());
        }
        if (spreadFound$1344 && lookahead2$888().value !== '=>') {
            throwError$890({}, Messages$835.IllegalSpread);
        }
        return sequence$1342 || expr$1340;
    }
    // 12.1 Block
    function parseStatementList$931() {
        var list$1346 = [], statement$1347;
        while (streamIndex$851 < length$848) {
            if (match$895('}')) {
                break;
            }
            statement$1347 = parseSourceElement$976();
            if (typeof statement$1347 === 'undefined') {
                break;
            }
            list$1346.push(statement$1347);
        }
        return list$1346;
    }
    function parseBlock$932() {
        var block$1348;
        expect$893('{');
        block$1348 = parseStatementList$931();
        expect$893('}');
        return delegate$849.createBlockStatement(block$1348);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$933() {
        var token$1349 = lookahead$852, resolvedIdent$1350;
        if (token$1349.type !== Token$830.Identifier) {
            throwUnexpected$892(token$1349);
        }
        resolvedIdent$1350 = expander$829.resolve(tokenStream$850[lookaheadIndex$853]);
        lex$886();
        return delegate$849.createIdentifier(resolvedIdent$1350);
    }
    function parseVariableDeclaration$934(kind$1351) {
        var id$1352, init$1353 = null;
        if (match$895('{')) {
            id$1352 = parseObjectInitialiser$907();
            reinterpretAsAssignmentBindingPattern$925(id$1352);
        } else if (match$895('[')) {
            id$1352 = parseArrayInitialiser$902();
            reinterpretAsAssignmentBindingPattern$925(id$1352);
        } else {
            id$1352 = state$854.allowKeyword ? parseNonComputedProperty$914() : parseVariableIdentifier$933();
            // 12.2.1
            if (strict$840 && isRestrictedWord$867(id$1352.name)) {
                throwErrorTolerant$891({}, Messages$835.StrictVarName);
            }
        }
        if (kind$1351 === 'const') {
            if (!match$895('=')) {
                throwError$890({}, Messages$835.NoUnintializedConst);
            }
            expect$893('=');
            init$1353 = parseAssignmentExpression$929();
        } else if (match$895('=')) {
            lex$886();
            init$1353 = parseAssignmentExpression$929();
        }
        return delegate$849.createVariableDeclarator(id$1352, init$1353);
    }
    function parseVariableDeclarationList$935(kind$1354) {
        var list$1355 = [];
        do {
            list$1355.push(parseVariableDeclaration$934(kind$1354));
            if (!match$895(',')) {
                break;
            }
            lex$886();
        } while (streamIndex$851 < length$848);
        return list$1355;
    }
    function parseVariableStatement$936() {
        var declarations$1356;
        expectKeyword$894('var');
        declarations$1356 = parseVariableDeclarationList$935();
        consumeSemicolon$899();
        return delegate$849.createVariableDeclaration(declarations$1356, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$937(kind$1357) {
        var declarations$1358;
        expectKeyword$894(kind$1357);
        declarations$1358 = parseVariableDeclarationList$935(kind$1357);
        consumeSemicolon$899();
        return delegate$849.createVariableDeclaration(declarations$1358, kind$1357);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$938() {
        var id$1359, src$1360, body$1361;
        lex$886();
        // 'module'
        if (peekLineTerminator$889()) {
            throwError$890({}, Messages$835.NewlineAfterModule);
        }
        switch (lookahead$852.type) {
        case Token$830.StringLiteral:
            id$1359 = parsePrimaryExpression$911();
            body$1361 = parseModuleBlock$981();
            src$1360 = null;
            break;
        case Token$830.Identifier:
            id$1359 = parseVariableIdentifier$933();
            body$1361 = null;
            if (!matchContextualKeyword$897('from')) {
                throwUnexpected$892(lex$886());
            }
            lex$886();
            src$1360 = parsePrimaryExpression$911();
            if (src$1360.type !== Syntax$833.Literal) {
                throwError$890({}, Messages$835.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$899();
        return delegate$849.createModuleDeclaration(id$1359, src$1360, body$1361);
    }
    function parseExportBatchSpecifier$939() {
        expect$893('*');
        return delegate$849.createExportBatchSpecifier();
    }
    function parseExportSpecifier$940() {
        var id$1362, name$1363 = null;
        id$1362 = parseVariableIdentifier$933();
        if (matchContextualKeyword$897('as')) {
            lex$886();
            name$1363 = parseNonComputedProperty$914();
        }
        return delegate$849.createExportSpecifier(id$1362, name$1363);
    }
    function parseExportDeclaration$941() {
        var previousAllowKeyword$1364, decl$1365, def$1366, src$1367, specifiers$1368;
        expectKeyword$894('export');
        if (lookahead$852.type === Token$830.Keyword) {
            switch (lookahead$852.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$849.createExportDeclaration(parseSourceElement$976(), null, null);
            }
        }
        if (isIdentifierName$883(lookahead$852)) {
            previousAllowKeyword$1364 = state$854.allowKeyword;
            state$854.allowKeyword = true;
            decl$1365 = parseVariableDeclarationList$935('let');
            state$854.allowKeyword = previousAllowKeyword$1364;
            return delegate$849.createExportDeclaration(decl$1365, null, null);
        }
        specifiers$1368 = [];
        src$1367 = null;
        if (match$895('*')) {
            specifiers$1368.push(parseExportBatchSpecifier$939());
        } else {
            expect$893('{');
            do {
                specifiers$1368.push(parseExportSpecifier$940());
            } while (match$895(',') && lex$886());
            expect$893('}');
        }
        if (matchContextualKeyword$897('from')) {
            lex$886();
            src$1367 = parsePrimaryExpression$911();
            if (src$1367.type !== Syntax$833.Literal) {
                throwError$890({}, Messages$835.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$899();
        return delegate$849.createExportDeclaration(null, specifiers$1368, src$1367);
    }
    function parseImportDeclaration$942() {
        var specifiers$1369, kind$1370, src$1371;
        expectKeyword$894('import');
        specifiers$1369 = [];
        if (isIdentifierName$883(lookahead$852)) {
            kind$1370 = 'default';
            specifiers$1369.push(parseImportSpecifier$943());
            if (!matchContextualKeyword$897('from')) {
                throwError$890({}, Messages$835.NoFromAfterImport);
            }
            lex$886();
        } else if (match$895('{')) {
            kind$1370 = 'named';
            lex$886();
            do {
                specifiers$1369.push(parseImportSpecifier$943());
            } while (match$895(',') && lex$886());
            expect$893('}');
            if (!matchContextualKeyword$897('from')) {
                throwError$890({}, Messages$835.NoFromAfterImport);
            }
            lex$886();
        }
        src$1371 = parsePrimaryExpression$911();
        if (src$1371.type !== Syntax$833.Literal) {
            throwError$890({}, Messages$835.InvalidModuleSpecifier);
        }
        consumeSemicolon$899();
        return delegate$849.createImportDeclaration(specifiers$1369, kind$1370, src$1371);
    }
    function parseImportSpecifier$943() {
        var id$1372, name$1373 = null;
        id$1372 = parseNonComputedProperty$914();
        if (matchContextualKeyword$897('as')) {
            lex$886();
            name$1373 = parseVariableIdentifier$933();
        }
        return delegate$849.createImportSpecifier(id$1372, name$1373);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$944() {
        expect$893(';');
        return delegate$849.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$945() {
        var expr$1374 = parseExpression$930();
        consumeSemicolon$899();
        return delegate$849.createExpressionStatement(expr$1374);
    }
    // 12.5 If statement
    function parseIfStatement$946() {
        var test$1375, consequent$1376, alternate$1377;
        expectKeyword$894('if');
        expect$893('(');
        test$1375 = parseExpression$930();
        expect$893(')');
        consequent$1376 = parseStatement$961();
        if (matchKeyword$896('else')) {
            lex$886();
            alternate$1377 = parseStatement$961();
        } else {
            alternate$1377 = null;
        }
        return delegate$849.createIfStatement(test$1375, consequent$1376, alternate$1377);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$947() {
        var body$1378, test$1379, oldInIteration$1380;
        expectKeyword$894('do');
        oldInIteration$1380 = state$854.inIteration;
        state$854.inIteration = true;
        body$1378 = parseStatement$961();
        state$854.inIteration = oldInIteration$1380;
        expectKeyword$894('while');
        expect$893('(');
        test$1379 = parseExpression$930();
        expect$893(')');
        if (match$895(';')) {
            lex$886();
        }
        return delegate$849.createDoWhileStatement(body$1378, test$1379);
    }
    function parseWhileStatement$948() {
        var test$1381, body$1382, oldInIteration$1383;
        expectKeyword$894('while');
        expect$893('(');
        test$1381 = parseExpression$930();
        expect$893(')');
        oldInIteration$1383 = state$854.inIteration;
        state$854.inIteration = true;
        body$1382 = parseStatement$961();
        state$854.inIteration = oldInIteration$1383;
        return delegate$849.createWhileStatement(test$1381, body$1382);
    }
    function parseForVariableDeclaration$949() {
        var token$1384 = lex$886(), declarations$1385 = parseVariableDeclarationList$935();
        return delegate$849.createVariableDeclaration(declarations$1385, token$1384.value);
    }
    function parseForStatement$950(opts$1386) {
        var init$1387, test$1388, update$1389, left$1390, right$1391, body$1392, operator$1393, oldInIteration$1394;
        init$1387 = test$1388 = update$1389 = null;
        expectKeyword$894('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$897('each')) {
            throwError$890({}, Messages$835.EachNotAllowed);
        }
        expect$893('(');
        if (match$895(';')) {
            lex$886();
        } else {
            if (matchKeyword$896('var') || matchKeyword$896('let') || matchKeyword$896('const')) {
                state$854.allowIn = false;
                init$1387 = parseForVariableDeclaration$949();
                state$854.allowIn = true;
                if (init$1387.declarations.length === 1) {
                    if (matchKeyword$896('in') || matchContextualKeyword$897('of')) {
                        operator$1393 = lookahead$852;
                        if (!((operator$1393.value === 'in' || init$1387.kind !== 'var') && init$1387.declarations[0].init)) {
                            lex$886();
                            left$1390 = init$1387;
                            right$1391 = parseExpression$930();
                            init$1387 = null;
                        }
                    }
                }
            } else {
                state$854.allowIn = false;
                init$1387 = parseExpression$930();
                state$854.allowIn = true;
                if (matchContextualKeyword$897('of')) {
                    operator$1393 = lex$886();
                    left$1390 = init$1387;
                    right$1391 = parseExpression$930();
                    init$1387 = null;
                } else if (matchKeyword$896('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$901(init$1387)) {
                        throwError$890({}, Messages$835.InvalidLHSInForIn);
                    }
                    operator$1393 = lex$886();
                    left$1390 = init$1387;
                    right$1391 = parseExpression$930();
                    init$1387 = null;
                }
            }
            if (typeof left$1390 === 'undefined') {
                expect$893(';');
            }
        }
        if (typeof left$1390 === 'undefined') {
            if (!match$895(';')) {
                test$1388 = parseExpression$930();
            }
            expect$893(';');
            if (!match$895(')')) {
                update$1389 = parseExpression$930();
            }
        }
        expect$893(')');
        oldInIteration$1394 = state$854.inIteration;
        state$854.inIteration = true;
        if (!(opts$1386 !== undefined && opts$1386.ignoreBody)) {
            body$1392 = parseStatement$961();
        }
        state$854.inIteration = oldInIteration$1394;
        if (typeof left$1390 === 'undefined') {
            return delegate$849.createForStatement(init$1387, test$1388, update$1389, body$1392);
        }
        if (operator$1393.value === 'in') {
            return delegate$849.createForInStatement(left$1390, right$1391, body$1392);
        }
        return delegate$849.createForOfStatement(left$1390, right$1391, body$1392);
    }
    // 12.7 The continue statement
    function parseContinueStatement$951() {
        var label$1395 = null, key$1396;
        expectKeyword$894('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$852.value.charCodeAt(0) === 59) {
            lex$886();
            if (!state$854.inIteration) {
                throwError$890({}, Messages$835.IllegalContinue);
            }
            return delegate$849.createContinueStatement(null);
        }
        if (peekLineTerminator$889()) {
            if (!state$854.inIteration) {
                throwError$890({}, Messages$835.IllegalContinue);
            }
            return delegate$849.createContinueStatement(null);
        }
        if (lookahead$852.type === Token$830.Identifier) {
            label$1395 = parseVariableIdentifier$933();
            key$1396 = '$' + label$1395.name;
            if (!Object.prototype.hasOwnProperty.call(state$854.labelSet, key$1396)) {
                throwError$890({}, Messages$835.UnknownLabel, label$1395.name);
            }
        }
        consumeSemicolon$899();
        if (label$1395 === null && !state$854.inIteration) {
            throwError$890({}, Messages$835.IllegalContinue);
        }
        return delegate$849.createContinueStatement(label$1395);
    }
    // 12.8 The break statement
    function parseBreakStatement$952() {
        var label$1397 = null, key$1398;
        expectKeyword$894('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$852.value.charCodeAt(0) === 59) {
            lex$886();
            if (!(state$854.inIteration || state$854.inSwitch)) {
                throwError$890({}, Messages$835.IllegalBreak);
            }
            return delegate$849.createBreakStatement(null);
        }
        if (peekLineTerminator$889()) {
            if (!(state$854.inIteration || state$854.inSwitch)) {
                throwError$890({}, Messages$835.IllegalBreak);
            }
            return delegate$849.createBreakStatement(null);
        }
        if (lookahead$852.type === Token$830.Identifier) {
            label$1397 = parseVariableIdentifier$933();
            key$1398 = '$' + label$1397.name;
            if (!Object.prototype.hasOwnProperty.call(state$854.labelSet, key$1398)) {
                throwError$890({}, Messages$835.UnknownLabel, label$1397.name);
            }
        }
        consumeSemicolon$899();
        if (label$1397 === null && !(state$854.inIteration || state$854.inSwitch)) {
            throwError$890({}, Messages$835.IllegalBreak);
        }
        return delegate$849.createBreakStatement(label$1397);
    }
    // 12.9 The return statement
    function parseReturnStatement$953() {
        var argument$1399 = null;
        expectKeyword$894('return');
        if (!state$854.inFunctionBody) {
            throwErrorTolerant$891({}, Messages$835.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$863(String(lookahead$852.value).charCodeAt(0))) {
            argument$1399 = parseExpression$930();
            consumeSemicolon$899();
            return delegate$849.createReturnStatement(argument$1399);
        }
        if (peekLineTerminator$889()) {
            return delegate$849.createReturnStatement(null);
        }
        if (!match$895(';')) {
            if (!match$895('}') && lookahead$852.type !== Token$830.EOF) {
                argument$1399 = parseExpression$930();
            }
        }
        consumeSemicolon$899();
        return delegate$849.createReturnStatement(argument$1399);
    }
    // 12.10 The with statement
    function parseWithStatement$954() {
        var object$1400, body$1401;
        if (strict$840) {
            throwErrorTolerant$891({}, Messages$835.StrictModeWith);
        }
        expectKeyword$894('with');
        expect$893('(');
        object$1400 = parseExpression$930();
        expect$893(')');
        body$1401 = parseStatement$961();
        return delegate$849.createWithStatement(object$1400, body$1401);
    }
    // 12.10 The swith statement
    function parseSwitchCase$955() {
        var test$1402, consequent$1403 = [], sourceElement$1404;
        if (matchKeyword$896('default')) {
            lex$886();
            test$1402 = null;
        } else {
            expectKeyword$894('case');
            test$1402 = parseExpression$930();
        }
        expect$893(':');
        while (streamIndex$851 < length$848) {
            if (match$895('}') || matchKeyword$896('default') || matchKeyword$896('case')) {
                break;
            }
            sourceElement$1404 = parseSourceElement$976();
            if (typeof sourceElement$1404 === 'undefined') {
                break;
            }
            consequent$1403.push(sourceElement$1404);
        }
        return delegate$849.createSwitchCase(test$1402, consequent$1403);
    }
    function parseSwitchStatement$956() {
        var discriminant$1405, cases$1406, clause$1407, oldInSwitch$1408, defaultFound$1409;
        expectKeyword$894('switch');
        expect$893('(');
        discriminant$1405 = parseExpression$930();
        expect$893(')');
        expect$893('{');
        cases$1406 = [];
        if (match$895('}')) {
            lex$886();
            return delegate$849.createSwitchStatement(discriminant$1405, cases$1406);
        }
        oldInSwitch$1408 = state$854.inSwitch;
        state$854.inSwitch = true;
        defaultFound$1409 = false;
        while (streamIndex$851 < length$848) {
            if (match$895('}')) {
                break;
            }
            clause$1407 = parseSwitchCase$955();
            if (clause$1407.test === null) {
                if (defaultFound$1409) {
                    throwError$890({}, Messages$835.MultipleDefaultsInSwitch);
                }
                defaultFound$1409 = true;
            }
            cases$1406.push(clause$1407);
        }
        state$854.inSwitch = oldInSwitch$1408;
        expect$893('}');
        return delegate$849.createSwitchStatement(discriminant$1405, cases$1406);
    }
    // 12.13 The throw statement
    function parseThrowStatement$957() {
        var argument$1410;
        expectKeyword$894('throw');
        if (peekLineTerminator$889()) {
            throwError$890({}, Messages$835.NewlineAfterThrow);
        }
        argument$1410 = parseExpression$930();
        consumeSemicolon$899();
        return delegate$849.createThrowStatement(argument$1410);
    }
    // 12.14 The try statement
    function parseCatchClause$958() {
        var param$1411, body$1412;
        expectKeyword$894('catch');
        expect$893('(');
        if (match$895(')')) {
            throwUnexpected$892(lookahead$852);
        }
        param$1411 = parseExpression$930();
        // 12.14.1
        if (strict$840 && param$1411.type === Syntax$833.Identifier && isRestrictedWord$867(param$1411.name)) {
            throwErrorTolerant$891({}, Messages$835.StrictCatchVariable);
        }
        expect$893(')');
        body$1412 = parseBlock$932();
        return delegate$849.createCatchClause(param$1411, body$1412);
    }
    function parseTryStatement$959() {
        var block$1413, handlers$1414 = [], finalizer$1415 = null;
        expectKeyword$894('try');
        block$1413 = parseBlock$932();
        if (matchKeyword$896('catch')) {
            handlers$1414.push(parseCatchClause$958());
        }
        if (matchKeyword$896('finally')) {
            lex$886();
            finalizer$1415 = parseBlock$932();
        }
        if (handlers$1414.length === 0 && !finalizer$1415) {
            throwError$890({}, Messages$835.NoCatchOrFinally);
        }
        return delegate$849.createTryStatement(block$1413, [], handlers$1414, finalizer$1415);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$960() {
        expectKeyword$894('debugger');
        consumeSemicolon$899();
        return delegate$849.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$961() {
        var type$1416 = lookahead$852.type, expr$1417, labeledBody$1418, key$1419;
        if (type$1416 === Token$830.EOF) {
            throwUnexpected$892(lookahead$852);
        }
        if (type$1416 === Token$830.Punctuator) {
            switch (lookahead$852.value) {
            case ';':
                return parseEmptyStatement$944();
            case '{':
                return parseBlock$932();
            case '(':
                return parseExpressionStatement$945();
            default:
                break;
            }
        }
        if (type$1416 === Token$830.Keyword) {
            switch (lookahead$852.value) {
            case 'break':
                return parseBreakStatement$952();
            case 'continue':
                return parseContinueStatement$951();
            case 'debugger':
                return parseDebuggerStatement$960();
            case 'do':
                return parseDoWhileStatement$947();
            case 'for':
                return parseForStatement$950();
            case 'function':
                return parseFunctionDeclaration$967();
            case 'class':
                return parseClassDeclaration$974();
            case 'if':
                return parseIfStatement$946();
            case 'return':
                return parseReturnStatement$953();
            case 'switch':
                return parseSwitchStatement$956();
            case 'throw':
                return parseThrowStatement$957();
            case 'try':
                return parseTryStatement$959();
            case 'var':
                return parseVariableStatement$936();
            case 'while':
                return parseWhileStatement$948();
            case 'with':
                return parseWithStatement$954();
            default:
                break;
            }
        }
        expr$1417 = parseExpression$930();
        // 12.12 Labelled Statements
        if (expr$1417.type === Syntax$833.Identifier && match$895(':')) {
            lex$886();
            key$1419 = '$' + expr$1417.name;
            if (Object.prototype.hasOwnProperty.call(state$854.labelSet, key$1419)) {
                throwError$890({}, Messages$835.Redeclaration, 'Label', expr$1417.name);
            }
            state$854.labelSet[key$1419] = true;
            labeledBody$1418 = parseStatement$961();
            delete state$854.labelSet[key$1419];
            return delegate$849.createLabeledStatement(expr$1417, labeledBody$1418);
        }
        consumeSemicolon$899();
        return delegate$849.createExpressionStatement(expr$1417);
    }
    // 13 Function Definition
    function parseConciseBody$962() {
        if (match$895('{')) {
            return parseFunctionSourceElements$963();
        }
        return parseAssignmentExpression$929();
    }
    function parseFunctionSourceElements$963() {
        var sourceElement$1420, sourceElements$1421 = [], token$1422, directive$1423, firstRestricted$1424, oldLabelSet$1425, oldInIteration$1426, oldInSwitch$1427, oldInFunctionBody$1428, oldParenthesizedCount$1429;
        expect$893('{');
        while (streamIndex$851 < length$848) {
            if (lookahead$852.type !== Token$830.StringLiteral) {
                break;
            }
            token$1422 = lookahead$852;
            sourceElement$1420 = parseSourceElement$976();
            sourceElements$1421.push(sourceElement$1420);
            if (sourceElement$1420.expression.type !== Syntax$833.Literal) {
                // this is not directive
                break;
            }
            directive$1423 = token$1422.value;
            if (directive$1423 === 'use strict') {
                strict$840 = true;
                if (firstRestricted$1424) {
                    throwErrorTolerant$891(firstRestricted$1424, Messages$835.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1424 && token$1422.octal) {
                    firstRestricted$1424 = token$1422;
                }
            }
        }
        oldLabelSet$1425 = state$854.labelSet;
        oldInIteration$1426 = state$854.inIteration;
        oldInSwitch$1427 = state$854.inSwitch;
        oldInFunctionBody$1428 = state$854.inFunctionBody;
        oldParenthesizedCount$1429 = state$854.parenthesizedCount;
        state$854.labelSet = {};
        state$854.inIteration = false;
        state$854.inSwitch = false;
        state$854.inFunctionBody = true;
        state$854.parenthesizedCount = 0;
        while (streamIndex$851 < length$848) {
            if (match$895('}')) {
                break;
            }
            sourceElement$1420 = parseSourceElement$976();
            if (typeof sourceElement$1420 === 'undefined') {
                break;
            }
            sourceElements$1421.push(sourceElement$1420);
        }
        expect$893('}');
        state$854.labelSet = oldLabelSet$1425;
        state$854.inIteration = oldInIteration$1426;
        state$854.inSwitch = oldInSwitch$1427;
        state$854.inFunctionBody = oldInFunctionBody$1428;
        state$854.parenthesizedCount = oldParenthesizedCount$1429;
        return delegate$849.createBlockStatement(sourceElements$1421);
    }
    function validateParam$964(options$1430, param$1431, name$1432) {
        var key$1433 = '$' + name$1432;
        if (strict$840) {
            if (isRestrictedWord$867(name$1432)) {
                options$1430.stricted = param$1431;
                options$1430.message = Messages$835.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1430.paramSet, key$1433)) {
                options$1430.stricted = param$1431;
                options$1430.message = Messages$835.StrictParamDupe;
            }
        } else if (!options$1430.firstRestricted) {
            if (isRestrictedWord$867(name$1432)) {
                options$1430.firstRestricted = param$1431;
                options$1430.message = Messages$835.StrictParamName;
            } else if (isStrictModeReservedWord$866(name$1432)) {
                options$1430.firstRestricted = param$1431;
                options$1430.message = Messages$835.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1430.paramSet, key$1433)) {
                options$1430.firstRestricted = param$1431;
                options$1430.message = Messages$835.StrictParamDupe;
            }
        }
        options$1430.paramSet[key$1433] = true;
    }
    function parseParam$965(options$1434) {
        var token$1435, rest$1436, param$1437, def$1438;
        token$1435 = lookahead$852;
        if (token$1435.value === '...') {
            token$1435 = lex$886();
            rest$1436 = true;
        }
        if (match$895('[')) {
            param$1437 = parseArrayInitialiser$902();
            reinterpretAsDestructuredParameter$926(options$1434, param$1437);
        } else if (match$895('{')) {
            if (rest$1436) {
                throwError$890({}, Messages$835.ObjectPatternAsRestParameter);
            }
            param$1437 = parseObjectInitialiser$907();
            reinterpretAsDestructuredParameter$926(options$1434, param$1437);
        } else {
            param$1437 = parseVariableIdentifier$933();
            validateParam$964(options$1434, token$1435, token$1435.value);
            if (match$895('=')) {
                if (rest$1436) {
                    throwErrorTolerant$891(lookahead$852, Messages$835.DefaultRestParameter);
                }
                lex$886();
                def$1438 = parseAssignmentExpression$929();
                ++options$1434.defaultCount;
            }
        }
        if (rest$1436) {
            if (!match$895(')')) {
                throwError$890({}, Messages$835.ParameterAfterRestParameter);
            }
            options$1434.rest = param$1437;
            return false;
        }
        options$1434.params.push(param$1437);
        options$1434.defaults.push(def$1438);
        return !match$895(')');
    }
    function parseParams$966(firstRestricted$1439) {
        var options$1440;
        options$1440 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1439
        };
        expect$893('(');
        if (!match$895(')')) {
            options$1440.paramSet = {};
            while (streamIndex$851 < length$848) {
                if (!parseParam$965(options$1440)) {
                    break;
                }
                expect$893(',');
            }
        }
        expect$893(')');
        if (options$1440.defaultCount === 0) {
            options$1440.defaults = [];
        }
        return options$1440;
    }
    function parseFunctionDeclaration$967() {
        var id$1441, body$1442, token$1443, tmp$1444, firstRestricted$1445, message$1446, previousStrict$1447, previousYieldAllowed$1448, generator$1449, expression$1450;
        expectKeyword$894('function');
        generator$1449 = false;
        if (match$895('*')) {
            lex$886();
            generator$1449 = true;
        }
        token$1443 = lookahead$852;
        id$1441 = parseVariableIdentifier$933();
        if (strict$840) {
            if (isRestrictedWord$867(token$1443.value)) {
                throwErrorTolerant$891(token$1443, Messages$835.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$867(token$1443.value)) {
                firstRestricted$1445 = token$1443;
                message$1446 = Messages$835.StrictFunctionName;
            } else if (isStrictModeReservedWord$866(token$1443.value)) {
                firstRestricted$1445 = token$1443;
                message$1446 = Messages$835.StrictReservedWord;
            }
        }
        tmp$1444 = parseParams$966(firstRestricted$1445);
        firstRestricted$1445 = tmp$1444.firstRestricted;
        if (tmp$1444.message) {
            message$1446 = tmp$1444.message;
        }
        previousStrict$1447 = strict$840;
        previousYieldAllowed$1448 = state$854.yieldAllowed;
        state$854.yieldAllowed = generator$1449;
        // here we redo some work in order to set 'expression'
        expression$1450 = !match$895('{');
        body$1442 = parseConciseBody$962();
        if (strict$840 && firstRestricted$1445) {
            throwError$890(firstRestricted$1445, message$1446);
        }
        if (strict$840 && tmp$1444.stricted) {
            throwErrorTolerant$891(tmp$1444.stricted, message$1446);
        }
        if (state$854.yieldAllowed && !state$854.yieldFound) {
            throwErrorTolerant$891({}, Messages$835.NoYieldInGenerator);
        }
        strict$840 = previousStrict$1447;
        state$854.yieldAllowed = previousYieldAllowed$1448;
        return delegate$849.createFunctionDeclaration(id$1441, tmp$1444.params, tmp$1444.defaults, body$1442, tmp$1444.rest, generator$1449, expression$1450);
    }
    function parseFunctionExpression$968() {
        var token$1451, id$1452 = null, firstRestricted$1453, message$1454, tmp$1455, body$1456, previousStrict$1457, previousYieldAllowed$1458, generator$1459, expression$1460;
        expectKeyword$894('function');
        generator$1459 = false;
        if (match$895('*')) {
            lex$886();
            generator$1459 = true;
        }
        if (!match$895('(')) {
            token$1451 = lookahead$852;
            id$1452 = parseVariableIdentifier$933();
            if (strict$840) {
                if (isRestrictedWord$867(token$1451.value)) {
                    throwErrorTolerant$891(token$1451, Messages$835.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$867(token$1451.value)) {
                    firstRestricted$1453 = token$1451;
                    message$1454 = Messages$835.StrictFunctionName;
                } else if (isStrictModeReservedWord$866(token$1451.value)) {
                    firstRestricted$1453 = token$1451;
                    message$1454 = Messages$835.StrictReservedWord;
                }
            }
        }
        tmp$1455 = parseParams$966(firstRestricted$1453);
        firstRestricted$1453 = tmp$1455.firstRestricted;
        if (tmp$1455.message) {
            message$1454 = tmp$1455.message;
        }
        previousStrict$1457 = strict$840;
        previousYieldAllowed$1458 = state$854.yieldAllowed;
        state$854.yieldAllowed = generator$1459;
        // here we redo some work in order to set 'expression'
        expression$1460 = !match$895('{');
        body$1456 = parseConciseBody$962();
        if (strict$840 && firstRestricted$1453) {
            throwError$890(firstRestricted$1453, message$1454);
        }
        if (strict$840 && tmp$1455.stricted) {
            throwErrorTolerant$891(tmp$1455.stricted, message$1454);
        }
        if (state$854.yieldAllowed && !state$854.yieldFound) {
            throwErrorTolerant$891({}, Messages$835.NoYieldInGenerator);
        }
        strict$840 = previousStrict$1457;
        state$854.yieldAllowed = previousYieldAllowed$1458;
        return delegate$849.createFunctionExpression(id$1452, tmp$1455.params, tmp$1455.defaults, body$1456, tmp$1455.rest, generator$1459, expression$1460);
    }
    function parseYieldExpression$969() {
        var delegateFlag$1461, expr$1462, previousYieldAllowed$1463;
        expectKeyword$894('yield');
        if (!state$854.yieldAllowed) {
            throwErrorTolerant$891({}, Messages$835.IllegalYield);
        }
        delegateFlag$1461 = false;
        if (match$895('*')) {
            lex$886();
            delegateFlag$1461 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1463 = state$854.yieldAllowed;
        state$854.yieldAllowed = false;
        expr$1462 = parseAssignmentExpression$929();
        state$854.yieldAllowed = previousYieldAllowed$1463;
        state$854.yieldFound = true;
        return delegate$849.createYieldExpression(expr$1462, delegateFlag$1461);
    }
    // 14 Classes
    function parseMethodDefinition$970(existingPropNames$1464) {
        var token$1465, key$1466, param$1467, propType$1468, isValidDuplicateProp$1469 = false;
        if (lookahead$852.value === 'static') {
            propType$1468 = ClassPropertyType$838.static;
            lex$886();
        } else {
            propType$1468 = ClassPropertyType$838.prototype;
        }
        if (match$895('*')) {
            lex$886();
            return delegate$849.createMethodDefinition(propType$1468, '', parseObjectPropertyKey$905(), parsePropertyMethodFunction$904({ generator: true }));
        }
        token$1465 = lookahead$852;
        key$1466 = parseObjectPropertyKey$905();
        if (token$1465.value === 'get' && !match$895('(')) {
            key$1466 = parseObjectPropertyKey$905();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1464[propType$1468].hasOwnProperty(key$1466.name)) {
                isValidDuplicateProp$1469 = existingPropNames$1464[propType$1468][key$1466.name].get === undefined && existingPropNames$1464[propType$1468][key$1466.name].data === undefined && existingPropNames$1464[propType$1468][key$1466.name].set !== undefined;
                if (!isValidDuplicateProp$1469) {
                    throwError$890(key$1466, Messages$835.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1464[propType$1468][key$1466.name] = {};
            }
            existingPropNames$1464[propType$1468][key$1466.name].get = true;
            expect$893('(');
            expect$893(')');
            return delegate$849.createMethodDefinition(propType$1468, 'get', key$1466, parsePropertyFunction$903({ generator: false }));
        }
        if (token$1465.value === 'set' && !match$895('(')) {
            key$1466 = parseObjectPropertyKey$905();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1464[propType$1468].hasOwnProperty(key$1466.name)) {
                isValidDuplicateProp$1469 = existingPropNames$1464[propType$1468][key$1466.name].set === undefined && existingPropNames$1464[propType$1468][key$1466.name].data === undefined && existingPropNames$1464[propType$1468][key$1466.name].get !== undefined;
                if (!isValidDuplicateProp$1469) {
                    throwError$890(key$1466, Messages$835.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1464[propType$1468][key$1466.name] = {};
            }
            existingPropNames$1464[propType$1468][key$1466.name].set = true;
            expect$893('(');
            token$1465 = lookahead$852;
            param$1467 = [parseVariableIdentifier$933()];
            expect$893(')');
            return delegate$849.createMethodDefinition(propType$1468, 'set', key$1466, parsePropertyFunction$903({
                params: param$1467,
                generator: false,
                name: token$1465
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1464[propType$1468].hasOwnProperty(key$1466.name)) {
            throwError$890(key$1466, Messages$835.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1464[propType$1468][key$1466.name] = {};
        }
        existingPropNames$1464[propType$1468][key$1466.name].data = true;
        return delegate$849.createMethodDefinition(propType$1468, '', key$1466, parsePropertyMethodFunction$904({ generator: false }));
    }
    function parseClassElement$971(existingProps$1470) {
        if (match$895(';')) {
            lex$886();
            return;
        }
        return parseMethodDefinition$970(existingProps$1470);
    }
    function parseClassBody$972() {
        var classElement$1471, classElements$1472 = [], existingProps$1473 = {};
        existingProps$1473[ClassPropertyType$838.static] = {};
        existingProps$1473[ClassPropertyType$838.prototype] = {};
        expect$893('{');
        while (streamIndex$851 < length$848) {
            if (match$895('}')) {
                break;
            }
            classElement$1471 = parseClassElement$971(existingProps$1473);
            if (typeof classElement$1471 !== 'undefined') {
                classElements$1472.push(classElement$1471);
            }
        }
        expect$893('}');
        return delegate$849.createClassBody(classElements$1472);
    }
    function parseClassExpression$973() {
        var id$1474, previousYieldAllowed$1475, superClass$1476 = null;
        expectKeyword$894('class');
        if (!matchKeyword$896('extends') && !match$895('{')) {
            id$1474 = parseVariableIdentifier$933();
        }
        if (matchKeyword$896('extends')) {
            expectKeyword$894('extends');
            previousYieldAllowed$1475 = state$854.yieldAllowed;
            state$854.yieldAllowed = false;
            superClass$1476 = parseAssignmentExpression$929();
            state$854.yieldAllowed = previousYieldAllowed$1475;
        }
        return delegate$849.createClassExpression(id$1474, superClass$1476, parseClassBody$972());
    }
    function parseClassDeclaration$974() {
        var id$1477, previousYieldAllowed$1478, superClass$1479 = null;
        expectKeyword$894('class');
        id$1477 = parseVariableIdentifier$933();
        if (matchKeyword$896('extends')) {
            expectKeyword$894('extends');
            previousYieldAllowed$1478 = state$854.yieldAllowed;
            state$854.yieldAllowed = false;
            superClass$1479 = parseAssignmentExpression$929();
            state$854.yieldAllowed = previousYieldAllowed$1478;
        }
        return delegate$849.createClassDeclaration(id$1477, superClass$1479, parseClassBody$972());
    }
    // 15 Program
    function matchModuleDeclaration$975() {
        var id$1480;
        if (matchContextualKeyword$897('module')) {
            id$1480 = lookahead2$888();
            return id$1480.type === Token$830.StringLiteral || id$1480.type === Token$830.Identifier;
        }
        return false;
    }
    function parseSourceElement$976() {
        if (lookahead$852.type === Token$830.Keyword) {
            switch (lookahead$852.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$937(lookahead$852.value);
            case 'function':
                return parseFunctionDeclaration$967();
            case 'export':
                return parseExportDeclaration$941();
            case 'import':
                return parseImportDeclaration$942();
            default:
                return parseStatement$961();
            }
        }
        if (matchModuleDeclaration$975()) {
            throwError$890({}, Messages$835.NestedModule);
        }
        if (lookahead$852.type !== Token$830.EOF) {
            return parseStatement$961();
        }
    }
    function parseProgramElement$977() {
        if (lookahead$852.type === Token$830.Keyword) {
            switch (lookahead$852.value) {
            case 'export':
                return parseExportDeclaration$941();
            case 'import':
                return parseImportDeclaration$942();
            }
        }
        if (matchModuleDeclaration$975()) {
            return parseModuleDeclaration$938();
        }
        return parseSourceElement$976();
    }
    function parseProgramElements$978() {
        var sourceElement$1481, sourceElements$1482 = [], token$1483, directive$1484, firstRestricted$1485;
        while (streamIndex$851 < length$848) {
            token$1483 = lookahead$852;
            if (token$1483.type !== Token$830.StringLiteral) {
                break;
            }
            sourceElement$1481 = parseProgramElement$977();
            sourceElements$1482.push(sourceElement$1481);
            if (sourceElement$1481.expression.type !== Syntax$833.Literal) {
                // this is not directive
                break;
            }
            assert$856(false, 'directive isn\'t right');
            directive$1484 = source$839.slice(token$1483.range[0] + 1, token$1483.range[1] - 1);
            if (directive$1484 === 'use strict') {
                strict$840 = true;
                if (firstRestricted$1485) {
                    throwErrorTolerant$891(firstRestricted$1485, Messages$835.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1485 && token$1483.octal) {
                    firstRestricted$1485 = token$1483;
                }
            }
        }
        while (streamIndex$851 < length$848) {
            sourceElement$1481 = parseProgramElement$977();
            if (typeof sourceElement$1481 === 'undefined') {
                break;
            }
            sourceElements$1482.push(sourceElement$1481);
        }
        return sourceElements$1482;
    }
    function parseModuleElement$979() {
        return parseSourceElement$976();
    }
    function parseModuleElements$980() {
        var list$1486 = [], statement$1487;
        while (streamIndex$851 < length$848) {
            if (match$895('}')) {
                break;
            }
            statement$1487 = parseModuleElement$979();
            if (typeof statement$1487 === 'undefined') {
                break;
            }
            list$1486.push(statement$1487);
        }
        return list$1486;
    }
    function parseModuleBlock$981() {
        var block$1488;
        expect$893('{');
        block$1488 = parseModuleElements$980();
        expect$893('}');
        return delegate$849.createBlockStatement(block$1488);
    }
    function parseProgram$982() {
        var body$1489;
        strict$840 = false;
        peek$887();
        body$1489 = parseProgramElements$978();
        return delegate$849.createProgram(body$1489);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$983(type$1490, value$1491, start$1492, end$1493, loc$1494) {
        assert$856(typeof start$1492 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$855.comments.length > 0) {
            if (extra$855.comments[extra$855.comments.length - 1].range[1] > start$1492) {
                return;
            }
        }
        extra$855.comments.push({
            type: type$1490,
            value: value$1491,
            range: [
                start$1492,
                end$1493
            ],
            loc: loc$1494
        });
    }
    function scanComment$984() {
        var comment$1495, ch$1496, loc$1497, start$1498, blockComment$1499, lineComment$1500;
        comment$1495 = '';
        blockComment$1499 = false;
        lineComment$1500 = false;
        while (index$841 < length$848) {
            ch$1496 = source$839[index$841];
            if (lineComment$1500) {
                ch$1496 = source$839[index$841++];
                if (isLineTerminator$862(ch$1496.charCodeAt(0))) {
                    loc$1497.end = {
                        line: lineNumber$842,
                        column: index$841 - lineStart$843 - 1
                    };
                    lineComment$1500 = false;
                    addComment$983('Line', comment$1495, start$1498, index$841 - 1, loc$1497);
                    if (ch$1496 === '\r' && source$839[index$841] === '\n') {
                        ++index$841;
                    }
                    ++lineNumber$842;
                    lineStart$843 = index$841;
                    comment$1495 = '';
                } else if (index$841 >= length$848) {
                    lineComment$1500 = false;
                    comment$1495 += ch$1496;
                    loc$1497.end = {
                        line: lineNumber$842,
                        column: length$848 - lineStart$843
                    };
                    addComment$983('Line', comment$1495, start$1498, length$848, loc$1497);
                } else {
                    comment$1495 += ch$1496;
                }
            } else if (blockComment$1499) {
                if (isLineTerminator$862(ch$1496.charCodeAt(0))) {
                    if (ch$1496 === '\r' && source$839[index$841 + 1] === '\n') {
                        ++index$841;
                        comment$1495 += '\r\n';
                    } else {
                        comment$1495 += ch$1496;
                    }
                    ++lineNumber$842;
                    ++index$841;
                    lineStart$843 = index$841;
                    if (index$841 >= length$848) {
                        throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1496 = source$839[index$841++];
                    if (index$841 >= length$848) {
                        throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1495 += ch$1496;
                    if (ch$1496 === '*') {
                        ch$1496 = source$839[index$841];
                        if (ch$1496 === '/') {
                            comment$1495 = comment$1495.substr(0, comment$1495.length - 1);
                            blockComment$1499 = false;
                            ++index$841;
                            loc$1497.end = {
                                line: lineNumber$842,
                                column: index$841 - lineStart$843
                            };
                            addComment$983('Block', comment$1495, start$1498, index$841, loc$1497);
                            comment$1495 = '';
                        }
                    }
                }
            } else if (ch$1496 === '/') {
                ch$1496 = source$839[index$841 + 1];
                if (ch$1496 === '/') {
                    loc$1497 = {
                        start: {
                            line: lineNumber$842,
                            column: index$841 - lineStart$843
                        }
                    };
                    start$1498 = index$841;
                    index$841 += 2;
                    lineComment$1500 = true;
                    if (index$841 >= length$848) {
                        loc$1497.end = {
                            line: lineNumber$842,
                            column: index$841 - lineStart$843
                        };
                        lineComment$1500 = false;
                        addComment$983('Line', comment$1495, start$1498, index$841, loc$1497);
                    }
                } else if (ch$1496 === '*') {
                    start$1498 = index$841;
                    index$841 += 2;
                    blockComment$1499 = true;
                    loc$1497 = {
                        start: {
                            line: lineNumber$842,
                            column: index$841 - lineStart$843 - 2
                        }
                    };
                    if (index$841 >= length$848) {
                        throwError$890({}, Messages$835.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$861(ch$1496.charCodeAt(0))) {
                ++index$841;
            } else if (isLineTerminator$862(ch$1496.charCodeAt(0))) {
                ++index$841;
                if (ch$1496 === '\r' && source$839[index$841] === '\n') {
                    ++index$841;
                }
                ++lineNumber$842;
                lineStart$843 = index$841;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$985() {
        var i$1501, entry$1502, comment$1503, comments$1504 = [];
        for (i$1501 = 0; i$1501 < extra$855.comments.length; ++i$1501) {
            entry$1502 = extra$855.comments[i$1501];
            comment$1503 = {
                type: entry$1502.type,
                value: entry$1502.value
            };
            if (extra$855.range) {
                comment$1503.range = entry$1502.range;
            }
            if (extra$855.loc) {
                comment$1503.loc = entry$1502.loc;
            }
            comments$1504.push(comment$1503);
        }
        extra$855.comments = comments$1504;
    }
    function collectToken$986() {
        var start$1505, loc$1506, token$1507, range$1508, value$1509;
        skipComment$869();
        start$1505 = index$841;
        loc$1506 = {
            start: {
                line: lineNumber$842,
                column: index$841 - lineStart$843
            }
        };
        token$1507 = extra$855.advance();
        loc$1506.end = {
            line: lineNumber$842,
            column: index$841 - lineStart$843
        };
        if (token$1507.type !== Token$830.EOF) {
            range$1508 = [
                token$1507.range[0],
                token$1507.range[1]
            ];
            value$1509 = source$839.slice(token$1507.range[0], token$1507.range[1]);
            extra$855.tokens.push({
                type: TokenName$831[token$1507.type],
                value: value$1509,
                range: range$1508,
                loc: loc$1506
            });
        }
        return token$1507;
    }
    function collectRegex$987() {
        var pos$1510, loc$1511, regex$1512, token$1513;
        skipComment$869();
        pos$1510 = index$841;
        loc$1511 = {
            start: {
                line: lineNumber$842,
                column: index$841 - lineStart$843
            }
        };
        regex$1512 = extra$855.scanRegExp();
        loc$1511.end = {
            line: lineNumber$842,
            column: index$841 - lineStart$843
        };
        if (!extra$855.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$855.tokens.length > 0) {
                token$1513 = extra$855.tokens[extra$855.tokens.length - 1];
                if (token$1513.range[0] === pos$1510 && token$1513.type === 'Punctuator') {
                    if (token$1513.value === '/' || token$1513.value === '/=') {
                        extra$855.tokens.pop();
                    }
                }
            }
            extra$855.tokens.push({
                type: 'RegularExpression',
                value: regex$1512.literal,
                range: [
                    pos$1510,
                    index$841
                ],
                loc: loc$1511
            });
        }
        return regex$1512;
    }
    function filterTokenLocation$988() {
        var i$1514, entry$1515, token$1516, tokens$1517 = [];
        for (i$1514 = 0; i$1514 < extra$855.tokens.length; ++i$1514) {
            entry$1515 = extra$855.tokens[i$1514];
            token$1516 = {
                type: entry$1515.type,
                value: entry$1515.value
            };
            if (extra$855.range) {
                token$1516.range = entry$1515.range;
            }
            if (extra$855.loc) {
                token$1516.loc = entry$1515.loc;
            }
            tokens$1517.push(token$1516);
        }
        extra$855.tokens = tokens$1517;
    }
    function LocationMarker$989() {
        var sm_index$1518 = lookahead$852 ? lookahead$852.sm_range[0] : 0;
        var sm_lineStart$1519 = lookahead$852 ? lookahead$852.sm_lineStart : 0;
        var sm_lineNumber$1520 = lookahead$852 ? lookahead$852.sm_lineNumber : 1;
        this.range = [
            sm_index$1518,
            sm_index$1518
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1520,
                column: sm_index$1518 - sm_lineStart$1519
            },
            end: {
                line: sm_lineNumber$1520,
                column: sm_index$1518 - sm_lineStart$1519
            }
        };
    }
    LocationMarker$989.prototype = {
        constructor: LocationMarker$989,
        end: function () {
            this.range[1] = sm_index$847;
            this.loc.end.line = sm_lineNumber$844;
            this.loc.end.column = sm_index$847 - sm_lineStart$845;
        },
        applyGroup: function (node$1521) {
            if (extra$855.range) {
                node$1521.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$855.loc) {
                node$1521.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1521 = delegate$849.postProcess(node$1521);
            }
        },
        apply: function (node$1522) {
            var nodeType$1523 = typeof node$1522;
            assert$856(nodeType$1523 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1523);
            if (extra$855.range) {
                node$1522.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$855.loc) {
                node$1522.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1522 = delegate$849.postProcess(node$1522);
            }
        }
    };
    function createLocationMarker$990() {
        return new LocationMarker$989();
    }
    function trackGroupExpression$991() {
        var marker$1524, expr$1525;
        marker$1524 = createLocationMarker$990();
        expect$893('(');
        ++state$854.parenthesizedCount;
        expr$1525 = parseExpression$930();
        expect$893(')');
        marker$1524.end();
        marker$1524.applyGroup(expr$1525);
        return expr$1525;
    }
    function trackLeftHandSideExpression$992() {
        var marker$1526, expr$1527;
        // skipComment();
        marker$1526 = createLocationMarker$990();
        expr$1527 = matchKeyword$896('new') ? parseNewExpression$917() : parsePrimaryExpression$911();
        while (match$895('.') || match$895('[') || lookahead$852.type === Token$830.Template) {
            if (match$895('[')) {
                expr$1527 = delegate$849.createMemberExpression('[', expr$1527, parseComputedMember$916());
                marker$1526.end();
                marker$1526.apply(expr$1527);
            } else if (match$895('.')) {
                expr$1527 = delegate$849.createMemberExpression('.', expr$1527, parseNonComputedMember$915());
                marker$1526.end();
                marker$1526.apply(expr$1527);
            } else {
                expr$1527 = delegate$849.createTaggedTemplateExpression(expr$1527, parseTemplateLiteral$909());
                marker$1526.end();
                marker$1526.apply(expr$1527);
            }
        }
        return expr$1527;
    }
    function trackLeftHandSideExpressionAllowCall$993() {
        var marker$1528, expr$1529, args$1530;
        // skipComment();
        marker$1528 = createLocationMarker$990();
        expr$1529 = matchKeyword$896('new') ? parseNewExpression$917() : parsePrimaryExpression$911();
        while (match$895('.') || match$895('[') || match$895('(') || lookahead$852.type === Token$830.Template) {
            if (match$895('(')) {
                args$1530 = parseArguments$912();
                expr$1529 = delegate$849.createCallExpression(expr$1529, args$1530);
                marker$1528.end();
                marker$1528.apply(expr$1529);
            } else if (match$895('[')) {
                expr$1529 = delegate$849.createMemberExpression('[', expr$1529, parseComputedMember$916());
                marker$1528.end();
                marker$1528.apply(expr$1529);
            } else if (match$895('.')) {
                expr$1529 = delegate$849.createMemberExpression('.', expr$1529, parseNonComputedMember$915());
                marker$1528.end();
                marker$1528.apply(expr$1529);
            } else {
                expr$1529 = delegate$849.createTaggedTemplateExpression(expr$1529, parseTemplateLiteral$909());
                marker$1528.end();
                marker$1528.apply(expr$1529);
            }
        }
        return expr$1529;
    }
    function filterGroup$994(node$1531) {
        var n$1532, i$1533, entry$1534;
        n$1532 = Object.prototype.toString.apply(node$1531) === '[object Array]' ? [] : {};
        for (i$1533 in node$1531) {
            if (node$1531.hasOwnProperty(i$1533) && i$1533 !== 'groupRange' && i$1533 !== 'groupLoc') {
                entry$1534 = node$1531[i$1533];
                if (entry$1534 === null || typeof entry$1534 !== 'object' || entry$1534 instanceof RegExp) {
                    n$1532[i$1533] = entry$1534;
                } else {
                    n$1532[i$1533] = filterGroup$994(entry$1534);
                }
            }
        }
        return n$1532;
    }
    function wrapTrackingFunction$995(range$1535, loc$1536) {
        return function (parseFunction$1537) {
            function isBinary$1538(node$1540) {
                return node$1540.type === Syntax$833.LogicalExpression || node$1540.type === Syntax$833.BinaryExpression;
            }
            function visit$1539(node$1541) {
                var start$1542, end$1543;
                if (isBinary$1538(node$1541.left)) {
                    visit$1539(node$1541.left);
                }
                if (isBinary$1538(node$1541.right)) {
                    visit$1539(node$1541.right);
                }
                if (range$1535) {
                    if (node$1541.left.groupRange || node$1541.right.groupRange) {
                        start$1542 = node$1541.left.groupRange ? node$1541.left.groupRange[0] : node$1541.left.range[0];
                        end$1543 = node$1541.right.groupRange ? node$1541.right.groupRange[1] : node$1541.right.range[1];
                        node$1541.range = [
                            start$1542,
                            end$1543
                        ];
                    } else if (typeof node$1541.range === 'undefined') {
                        start$1542 = node$1541.left.range[0];
                        end$1543 = node$1541.right.range[1];
                        node$1541.range = [
                            start$1542,
                            end$1543
                        ];
                    }
                }
                if (loc$1536) {
                    if (node$1541.left.groupLoc || node$1541.right.groupLoc) {
                        start$1542 = node$1541.left.groupLoc ? node$1541.left.groupLoc.start : node$1541.left.loc.start;
                        end$1543 = node$1541.right.groupLoc ? node$1541.right.groupLoc.end : node$1541.right.loc.end;
                        node$1541.loc = {
                            start: start$1542,
                            end: end$1543
                        };
                        node$1541 = delegate$849.postProcess(node$1541);
                    } else if (typeof node$1541.loc === 'undefined') {
                        node$1541.loc = {
                            start: node$1541.left.loc.start,
                            end: node$1541.right.loc.end
                        };
                        node$1541 = delegate$849.postProcess(node$1541);
                    }
                }
            }
            return function () {
                var marker$1544, node$1545, curr$1546 = lookahead$852;
                marker$1544 = createLocationMarker$990();
                node$1545 = parseFunction$1537.apply(null, arguments);
                marker$1544.end();
                if (node$1545.type !== Syntax$833.Program) {
                    if (curr$1546.leadingComments) {
                        node$1545.leadingComments = curr$1546.leadingComments;
                    }
                    if (curr$1546.trailingComments) {
                        node$1545.trailingComments = curr$1546.trailingComments;
                    }
                }
                if (range$1535 && typeof node$1545.range === 'undefined') {
                    marker$1544.apply(node$1545);
                }
                if (loc$1536 && typeof node$1545.loc === 'undefined') {
                    marker$1544.apply(node$1545);
                }
                if (isBinary$1538(node$1545)) {
                    visit$1539(node$1545);
                }
                return node$1545;
            };
        };
    }
    function patch$996() {
        var wrapTracking$1547;
        if (extra$855.comments) {
            extra$855.skipComment = skipComment$869;
            skipComment$869 = scanComment$984;
        }
        if (extra$855.range || extra$855.loc) {
            extra$855.parseGroupExpression = parseGroupExpression$910;
            extra$855.parseLeftHandSideExpression = parseLeftHandSideExpression$919;
            extra$855.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$918;
            parseGroupExpression$910 = trackGroupExpression$991;
            parseLeftHandSideExpression$919 = trackLeftHandSideExpression$992;
            parseLeftHandSideExpressionAllowCall$918 = trackLeftHandSideExpressionAllowCall$993;
            wrapTracking$1547 = wrapTrackingFunction$995(extra$855.range, extra$855.loc);
            extra$855.parseArrayInitialiser = parseArrayInitialiser$902;
            extra$855.parseAssignmentExpression = parseAssignmentExpression$929;
            extra$855.parseBinaryExpression = parseBinaryExpression$923;
            extra$855.parseBlock = parseBlock$932;
            extra$855.parseFunctionSourceElements = parseFunctionSourceElements$963;
            extra$855.parseCatchClause = parseCatchClause$958;
            extra$855.parseComputedMember = parseComputedMember$916;
            extra$855.parseConditionalExpression = parseConditionalExpression$924;
            extra$855.parseConstLetDeclaration = parseConstLetDeclaration$937;
            extra$855.parseExportBatchSpecifier = parseExportBatchSpecifier$939;
            extra$855.parseExportDeclaration = parseExportDeclaration$941;
            extra$855.parseExportSpecifier = parseExportSpecifier$940;
            extra$855.parseExpression = parseExpression$930;
            extra$855.parseForVariableDeclaration = parseForVariableDeclaration$949;
            extra$855.parseFunctionDeclaration = parseFunctionDeclaration$967;
            extra$855.parseFunctionExpression = parseFunctionExpression$968;
            extra$855.parseParams = parseParams$966;
            extra$855.parseImportDeclaration = parseImportDeclaration$942;
            extra$855.parseImportSpecifier = parseImportSpecifier$943;
            extra$855.parseModuleDeclaration = parseModuleDeclaration$938;
            extra$855.parseModuleBlock = parseModuleBlock$981;
            extra$855.parseNewExpression = parseNewExpression$917;
            extra$855.parseNonComputedProperty = parseNonComputedProperty$914;
            extra$855.parseObjectInitialiser = parseObjectInitialiser$907;
            extra$855.parseObjectProperty = parseObjectProperty$906;
            extra$855.parseObjectPropertyKey = parseObjectPropertyKey$905;
            extra$855.parsePostfixExpression = parsePostfixExpression$920;
            extra$855.parsePrimaryExpression = parsePrimaryExpression$911;
            extra$855.parseProgram = parseProgram$982;
            extra$855.parsePropertyFunction = parsePropertyFunction$903;
            extra$855.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$913;
            extra$855.parseTemplateElement = parseTemplateElement$908;
            extra$855.parseTemplateLiteral = parseTemplateLiteral$909;
            extra$855.parseStatement = parseStatement$961;
            extra$855.parseSwitchCase = parseSwitchCase$955;
            extra$855.parseUnaryExpression = parseUnaryExpression$921;
            extra$855.parseVariableDeclaration = parseVariableDeclaration$934;
            extra$855.parseVariableIdentifier = parseVariableIdentifier$933;
            extra$855.parseMethodDefinition = parseMethodDefinition$970;
            extra$855.parseClassDeclaration = parseClassDeclaration$974;
            extra$855.parseClassExpression = parseClassExpression$973;
            extra$855.parseClassBody = parseClassBody$972;
            parseArrayInitialiser$902 = wrapTracking$1547(extra$855.parseArrayInitialiser);
            parseAssignmentExpression$929 = wrapTracking$1547(extra$855.parseAssignmentExpression);
            parseBinaryExpression$923 = wrapTracking$1547(extra$855.parseBinaryExpression);
            parseBlock$932 = wrapTracking$1547(extra$855.parseBlock);
            parseFunctionSourceElements$963 = wrapTracking$1547(extra$855.parseFunctionSourceElements);
            parseCatchClause$958 = wrapTracking$1547(extra$855.parseCatchClause);
            parseComputedMember$916 = wrapTracking$1547(extra$855.parseComputedMember);
            parseConditionalExpression$924 = wrapTracking$1547(extra$855.parseConditionalExpression);
            parseConstLetDeclaration$937 = wrapTracking$1547(extra$855.parseConstLetDeclaration);
            parseExportBatchSpecifier$939 = wrapTracking$1547(parseExportBatchSpecifier$939);
            parseExportDeclaration$941 = wrapTracking$1547(parseExportDeclaration$941);
            parseExportSpecifier$940 = wrapTracking$1547(parseExportSpecifier$940);
            parseExpression$930 = wrapTracking$1547(extra$855.parseExpression);
            parseForVariableDeclaration$949 = wrapTracking$1547(extra$855.parseForVariableDeclaration);
            parseFunctionDeclaration$967 = wrapTracking$1547(extra$855.parseFunctionDeclaration);
            parseFunctionExpression$968 = wrapTracking$1547(extra$855.parseFunctionExpression);
            parseParams$966 = wrapTracking$1547(extra$855.parseParams);
            parseImportDeclaration$942 = wrapTracking$1547(extra$855.parseImportDeclaration);
            parseImportSpecifier$943 = wrapTracking$1547(extra$855.parseImportSpecifier);
            parseModuleDeclaration$938 = wrapTracking$1547(extra$855.parseModuleDeclaration);
            parseModuleBlock$981 = wrapTracking$1547(extra$855.parseModuleBlock);
            parseLeftHandSideExpression$919 = wrapTracking$1547(parseLeftHandSideExpression$919);
            parseNewExpression$917 = wrapTracking$1547(extra$855.parseNewExpression);
            parseNonComputedProperty$914 = wrapTracking$1547(extra$855.parseNonComputedProperty);
            parseObjectInitialiser$907 = wrapTracking$1547(extra$855.parseObjectInitialiser);
            parseObjectProperty$906 = wrapTracking$1547(extra$855.parseObjectProperty);
            parseObjectPropertyKey$905 = wrapTracking$1547(extra$855.parseObjectPropertyKey);
            parsePostfixExpression$920 = wrapTracking$1547(extra$855.parsePostfixExpression);
            parsePrimaryExpression$911 = wrapTracking$1547(extra$855.parsePrimaryExpression);
            parseProgram$982 = wrapTracking$1547(extra$855.parseProgram);
            parsePropertyFunction$903 = wrapTracking$1547(extra$855.parsePropertyFunction);
            parseTemplateElement$908 = wrapTracking$1547(extra$855.parseTemplateElement);
            parseTemplateLiteral$909 = wrapTracking$1547(extra$855.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$913 = wrapTracking$1547(extra$855.parseSpreadOrAssignmentExpression);
            parseStatement$961 = wrapTracking$1547(extra$855.parseStatement);
            parseSwitchCase$955 = wrapTracking$1547(extra$855.parseSwitchCase);
            parseUnaryExpression$921 = wrapTracking$1547(extra$855.parseUnaryExpression);
            parseVariableDeclaration$934 = wrapTracking$1547(extra$855.parseVariableDeclaration);
            parseVariableIdentifier$933 = wrapTracking$1547(extra$855.parseVariableIdentifier);
            parseMethodDefinition$970 = wrapTracking$1547(extra$855.parseMethodDefinition);
            parseClassDeclaration$974 = wrapTracking$1547(extra$855.parseClassDeclaration);
            parseClassExpression$973 = wrapTracking$1547(extra$855.parseClassExpression);
            parseClassBody$972 = wrapTracking$1547(extra$855.parseClassBody);
        }
        if (typeof extra$855.tokens !== 'undefined') {
            extra$855.advance = advance$885;
            extra$855.scanRegExp = scanRegExp$882;
            advance$885 = collectToken$986;
            scanRegExp$882 = collectRegex$987;
        }
    }
    function unpatch$997() {
        if (typeof extra$855.skipComment === 'function') {
            skipComment$869 = extra$855.skipComment;
        }
        if (extra$855.range || extra$855.loc) {
            parseArrayInitialiser$902 = extra$855.parseArrayInitialiser;
            parseAssignmentExpression$929 = extra$855.parseAssignmentExpression;
            parseBinaryExpression$923 = extra$855.parseBinaryExpression;
            parseBlock$932 = extra$855.parseBlock;
            parseFunctionSourceElements$963 = extra$855.parseFunctionSourceElements;
            parseCatchClause$958 = extra$855.parseCatchClause;
            parseComputedMember$916 = extra$855.parseComputedMember;
            parseConditionalExpression$924 = extra$855.parseConditionalExpression;
            parseConstLetDeclaration$937 = extra$855.parseConstLetDeclaration;
            parseExportBatchSpecifier$939 = extra$855.parseExportBatchSpecifier;
            parseExportDeclaration$941 = extra$855.parseExportDeclaration;
            parseExportSpecifier$940 = extra$855.parseExportSpecifier;
            parseExpression$930 = extra$855.parseExpression;
            parseForVariableDeclaration$949 = extra$855.parseForVariableDeclaration;
            parseFunctionDeclaration$967 = extra$855.parseFunctionDeclaration;
            parseFunctionExpression$968 = extra$855.parseFunctionExpression;
            parseImportDeclaration$942 = extra$855.parseImportDeclaration;
            parseImportSpecifier$943 = extra$855.parseImportSpecifier;
            parseGroupExpression$910 = extra$855.parseGroupExpression;
            parseLeftHandSideExpression$919 = extra$855.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$918 = extra$855.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$938 = extra$855.parseModuleDeclaration;
            parseModuleBlock$981 = extra$855.parseModuleBlock;
            parseNewExpression$917 = extra$855.parseNewExpression;
            parseNonComputedProperty$914 = extra$855.parseNonComputedProperty;
            parseObjectInitialiser$907 = extra$855.parseObjectInitialiser;
            parseObjectProperty$906 = extra$855.parseObjectProperty;
            parseObjectPropertyKey$905 = extra$855.parseObjectPropertyKey;
            parsePostfixExpression$920 = extra$855.parsePostfixExpression;
            parsePrimaryExpression$911 = extra$855.parsePrimaryExpression;
            parseProgram$982 = extra$855.parseProgram;
            parsePropertyFunction$903 = extra$855.parsePropertyFunction;
            parseTemplateElement$908 = extra$855.parseTemplateElement;
            parseTemplateLiteral$909 = extra$855.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$913 = extra$855.parseSpreadOrAssignmentExpression;
            parseStatement$961 = extra$855.parseStatement;
            parseSwitchCase$955 = extra$855.parseSwitchCase;
            parseUnaryExpression$921 = extra$855.parseUnaryExpression;
            parseVariableDeclaration$934 = extra$855.parseVariableDeclaration;
            parseVariableIdentifier$933 = extra$855.parseVariableIdentifier;
            parseMethodDefinition$970 = extra$855.parseMethodDefinition;
            parseClassDeclaration$974 = extra$855.parseClassDeclaration;
            parseClassExpression$973 = extra$855.parseClassExpression;
            parseClassBody$972 = extra$855.parseClassBody;
        }
        if (typeof extra$855.scanRegExp === 'function') {
            advance$885 = extra$855.advance;
            scanRegExp$882 = extra$855.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$998(object$1548, properties$1549) {
        var entry$1550, result$1551 = {};
        for (entry$1550 in object$1548) {
            if (object$1548.hasOwnProperty(entry$1550)) {
                result$1551[entry$1550] = object$1548[entry$1550];
            }
        }
        for (entry$1550 in properties$1549) {
            if (properties$1549.hasOwnProperty(entry$1550)) {
                result$1551[entry$1550] = properties$1549[entry$1550];
            }
        }
        return result$1551;
    }
    function tokenize$999(code$1552, options$1553) {
        var toString$1554, token$1555, tokens$1556;
        toString$1554 = String;
        if (typeof code$1552 !== 'string' && !(code$1552 instanceof String)) {
            code$1552 = toString$1554(code$1552);
        }
        delegate$849 = SyntaxTreeDelegate$837;
        source$839 = code$1552;
        index$841 = 0;
        lineNumber$842 = source$839.length > 0 ? 1 : 0;
        lineStart$843 = 0;
        length$848 = source$839.length;
        lookahead$852 = null;
        state$854 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$855 = {};
        // Options matching.
        options$1553 = options$1553 || {};
        // Of course we collect tokens here.
        options$1553.tokens = true;
        extra$855.tokens = [];
        extra$855.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$855.openParenToken = -1;
        extra$855.openCurlyToken = -1;
        extra$855.range = typeof options$1553.range === 'boolean' && options$1553.range;
        extra$855.loc = typeof options$1553.loc === 'boolean' && options$1553.loc;
        if (typeof options$1553.comment === 'boolean' && options$1553.comment) {
            extra$855.comments = [];
        }
        if (typeof options$1553.tolerant === 'boolean' && options$1553.tolerant) {
            extra$855.errors = [];
        }
        if (length$848 > 0) {
            if (typeof source$839[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1552 instanceof String) {
                    source$839 = code$1552.valueOf();
                }
            }
        }
        patch$996();
        try {
            peek$887();
            if (lookahead$852.type === Token$830.EOF) {
                return extra$855.tokens;
            }
            token$1555 = lex$886();
            while (lookahead$852.type !== Token$830.EOF) {
                try {
                    token$1555 = lex$886();
                } catch (lexError$1557) {
                    token$1555 = lookahead$852;
                    if (extra$855.errors) {
                        extra$855.errors.push(lexError$1557);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1557;
                    }
                }
            }
            filterTokenLocation$988();
            tokens$1556 = extra$855.tokens;
            if (typeof extra$855.comments !== 'undefined') {
                filterCommentLocation$985();
                tokens$1556.comments = extra$855.comments;
            }
            if (typeof extra$855.errors !== 'undefined') {
                tokens$1556.errors = extra$855.errors;
            }
        } catch (e$1558) {
            throw e$1558;
        } finally {
            unpatch$997();
            extra$855 = {};
        }
        return tokens$1556;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1000(toks$1559, start$1560, inExprDelim$1561, parentIsBlock$1562) {
        var assignOps$1563 = [
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
        var binaryOps$1564 = [
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
        var unaryOps$1565 = [
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
        function back$1566(n$1567) {
            var idx$1568 = toks$1559.length - n$1567 > 0 ? toks$1559.length - n$1567 : 0;
            return toks$1559[idx$1568];
        }
        if (inExprDelim$1561 && toks$1559.length - (start$1560 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1566(start$1560 + 2).value === ':' && parentIsBlock$1562) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$857(back$1566(start$1560 + 2).value, unaryOps$1565.concat(binaryOps$1564).concat(assignOps$1563))) {
            // ... + {...}
            return false;
        } else if (back$1566(start$1560 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1569 = typeof back$1566(start$1560 + 1).startLineNumber !== 'undefined' ? back$1566(start$1560 + 1).startLineNumber : back$1566(start$1560 + 1).lineNumber;
            if (back$1566(start$1560 + 2).lineNumber !== currLineNumber$1569) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$857(back$1566(start$1560 + 2).value, [
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
    function readToken$1001(toks$1570, inExprDelim$1571, parentIsBlock$1572) {
        var delimiters$1573 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1574 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1575 = toks$1570.length - 1;
        var comments$1576, commentsLen$1577 = extra$855.comments.length;
        function back$1578(n$1582) {
            var idx$1583 = toks$1570.length - n$1582 > 0 ? toks$1570.length - n$1582 : 0;
            return toks$1570[idx$1583];
        }
        function attachComments$1579(token$1584) {
            if (comments$1576) {
                token$1584.leadingComments = comments$1576;
            }
            return token$1584;
        }
        function _advance$1580() {
            return attachComments$1579(advance$885());
        }
        function _scanRegExp$1581() {
            return attachComments$1579(scanRegExp$882());
        }
        skipComment$869();
        if (extra$855.comments.length > commentsLen$1577) {
            comments$1576 = extra$855.comments.slice(commentsLen$1577);
        }
        if (isIn$857(source$839[index$841], delimiters$1573)) {
            return attachComments$1579(readDelim$1002(toks$1570, inExprDelim$1571, parentIsBlock$1572));
        }
        if (source$839[index$841] === '/') {
            var prev$1585 = back$1578(1);
            if (prev$1585) {
                if (prev$1585.value === '()') {
                    if (isIn$857(back$1578(2).value, parenIdents$1574)) {
                        // ... if (...) / ...
                        return _scanRegExp$1581();
                    }
                    // ... (...) / ...
                    return _advance$1580();
                }
                if (prev$1585.value === '{}') {
                    if (blockAllowed$1000(toks$1570, 0, inExprDelim$1571, parentIsBlock$1572)) {
                        if (back$1578(2).value === '()') {
                            // named function
                            if (back$1578(4).value === 'function') {
                                if (!blockAllowed$1000(toks$1570, 3, inExprDelim$1571, parentIsBlock$1572)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1580();
                                }
                                if (toks$1570.length - 5 <= 0 && inExprDelim$1571) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1580();
                                }
                            }
                            // unnamed function
                            if (back$1578(3).value === 'function') {
                                if (!blockAllowed$1000(toks$1570, 2, inExprDelim$1571, parentIsBlock$1572)) {
                                    // new function (...) {...} / ...
                                    return _advance$1580();
                                }
                                if (toks$1570.length - 4 <= 0 && inExprDelim$1571) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1580();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1581();
                    } else {
                        // ... + {...} / ...
                        return _advance$1580();
                    }
                }
                if (prev$1585.type === Token$830.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1581();
                }
                if (isKeyword$868(prev$1585.value)) {
                    // typeof /...
                    return _scanRegExp$1581();
                }
                return _advance$1580();
            }
            return _scanRegExp$1581();
        }
        return _advance$1580();
    }
    function readDelim$1002(toks$1586, inExprDelim$1587, parentIsBlock$1588) {
        var startDelim$1589 = advance$885(), matchDelim$1590 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1591 = [];
        var delimiters$1592 = [
                '(',
                '{',
                '['
            ];
        assert$856(delimiters$1592.indexOf(startDelim$1589.value) !== -1, 'Need to begin at the delimiter');
        var token$1593 = startDelim$1589;
        var startLineNumber$1594 = token$1593.lineNumber;
        var startLineStart$1595 = token$1593.lineStart;
        var startRange$1596 = token$1593.range;
        var delimToken$1597 = {};
        delimToken$1597.type = Token$830.Delimiter;
        delimToken$1597.value = startDelim$1589.value + matchDelim$1590[startDelim$1589.value];
        delimToken$1597.startLineNumber = startLineNumber$1594;
        delimToken$1597.startLineStart = startLineStart$1595;
        delimToken$1597.startRange = startRange$1596;
        var delimIsBlock$1598 = false;
        if (startDelim$1589.value === '{') {
            delimIsBlock$1598 = blockAllowed$1000(toks$1586.concat(delimToken$1597), 0, inExprDelim$1587, parentIsBlock$1588);
        }
        while (index$841 <= length$848) {
            token$1593 = readToken$1001(inner$1591, startDelim$1589.value === '(' || startDelim$1589.value === '[', delimIsBlock$1598);
            if (token$1593.type === Token$830.Punctuator && token$1593.value === matchDelim$1590[startDelim$1589.value]) {
                if (token$1593.leadingComments) {
                    delimToken$1597.trailingComments = token$1593.leadingComments;
                }
                break;
            } else if (token$1593.type === Token$830.EOF) {
                throwError$890({}, Messages$835.UnexpectedEOS);
            } else {
                inner$1591.push(token$1593);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$841 >= length$848 && matchDelim$1590[startDelim$1589.value] !== source$839[length$848 - 1]) {
            throwError$890({}, Messages$835.UnexpectedEOS);
        }
        var endLineNumber$1599 = token$1593.lineNumber;
        var endLineStart$1600 = token$1593.lineStart;
        var endRange$1601 = token$1593.range;
        delimToken$1597.inner = inner$1591;
        delimToken$1597.endLineNumber = endLineNumber$1599;
        delimToken$1597.endLineStart = endLineStart$1600;
        delimToken$1597.endRange = endRange$1601;
        return delimToken$1597;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$1003(code$1602) {
        var token$1603, tokenTree$1604 = [];
        extra$855 = {};
        extra$855.comments = [];
        patch$996();
        source$839 = code$1602;
        index$841 = 0;
        lineNumber$842 = source$839.length > 0 ? 1 : 0;
        lineStart$843 = 0;
        length$848 = source$839.length;
        state$854 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$841 < length$848) {
            tokenTree$1604.push(readToken$1001(tokenTree$1604, false, false));
        }
        var last$1605 = tokenTree$1604[tokenTree$1604.length - 1];
        if (last$1605 && last$1605.type !== Token$830.EOF) {
            tokenTree$1604.push({
                type: Token$830.EOF,
                value: '',
                lineNumber: last$1605.lineNumber,
                lineStart: last$1605.lineStart,
                range: [
                    index$841,
                    index$841
                ]
            });
        }
        return expander$829.tokensToSyntax(tokenTree$1604);
    }
    function parse$1004(code$1606, options$1607) {
        var program$1608, toString$1609;
        extra$855 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1606)) {
            tokenStream$850 = code$1606;
            length$848 = tokenStream$850.length;
            lineNumber$842 = tokenStream$850.length > 0 ? 1 : 0;
            source$839 = undefined;
        } else {
            toString$1609 = String;
            if (typeof code$1606 !== 'string' && !(code$1606 instanceof String)) {
                code$1606 = toString$1609(code$1606);
            }
            source$839 = code$1606;
            length$848 = source$839.length;
            lineNumber$842 = source$839.length > 0 ? 1 : 0;
        }
        delegate$849 = SyntaxTreeDelegate$837;
        streamIndex$851 = -1;
        index$841 = 0;
        lineStart$843 = 0;
        sm_lineStart$845 = 0;
        sm_lineNumber$844 = lineNumber$842;
        sm_index$847 = 0;
        sm_range$846 = [
            0,
            0
        ];
        lookahead$852 = null;
        state$854 = {
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
        if (typeof options$1607 !== 'undefined') {
            extra$855.range = typeof options$1607.range === 'boolean' && options$1607.range;
            extra$855.loc = typeof options$1607.loc === 'boolean' && options$1607.loc;
            if (extra$855.loc && options$1607.source !== null && options$1607.source !== undefined) {
                delegate$849 = extend$998(delegate$849, {
                    'postProcess': function (node$1610) {
                        node$1610.loc.source = toString$1609(options$1607.source);
                        return node$1610;
                    }
                });
            }
            if (typeof options$1607.tokens === 'boolean' && options$1607.tokens) {
                extra$855.tokens = [];
            }
            if (typeof options$1607.comment === 'boolean' && options$1607.comment) {
                extra$855.comments = [];
            }
            if (typeof options$1607.tolerant === 'boolean' && options$1607.tolerant) {
                extra$855.errors = [];
            }
        }
        if (length$848 > 0) {
            if (source$839 && typeof source$839[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1606 instanceof String) {
                    source$839 = code$1606.valueOf();
                }
            }
        }
        extra$855 = { loc: true };
        patch$996();
        try {
            program$1608 = parseProgram$982();
            if (typeof extra$855.comments !== 'undefined') {
                filterCommentLocation$985();
                program$1608.comments = extra$855.comments;
            }
            if (typeof extra$855.tokens !== 'undefined') {
                filterTokenLocation$988();
                program$1608.tokens = extra$855.tokens;
            }
            if (typeof extra$855.errors !== 'undefined') {
                program$1608.errors = extra$855.errors;
            }
            if (extra$855.range || extra$855.loc) {
                program$1608.body = filterGroup$994(program$1608.body);
            }
        } catch (e$1611) {
            throw e$1611;
        } finally {
            unpatch$997();
            extra$855 = {};
        }
        return program$1608;
    }
    exports$828.tokenize = tokenize$999;
    exports$828.read = read$1003;
    exports$828.Token = Token$830;
    exports$828.assert = assert$856;
    exports$828.parse = parse$1004;
    // Deep copy.
    exports$828.Syntax = function () {
        var name$1612, types$1613 = {};
        if (typeof Object.create === 'function') {
            types$1613 = Object.create(null);
        }
        for (name$1612 in Syntax$833) {
            if (Syntax$833.hasOwnProperty(name$1612)) {
                types$1613[name$1612] = Syntax$833[name$1612];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1613);
        }
        return types$1613;
    }();
}));
//# sourceMappingURL=parser.js.map