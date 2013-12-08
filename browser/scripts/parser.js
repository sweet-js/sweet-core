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
(function (root$820, factory$821) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$821);
    } else if (typeof exports !== 'undefined') {
        factory$821(exports, require('./expander'));
    } else {
        factory$821(root$820.esprima = {});
    }
}(this, function (exports$822, expander$823) {
    'use strict';
    var Token$824, TokenName$825, FnExprTokens$826, Syntax$827, PropertyKind$828, Messages$829, Regex$830, SyntaxTreeDelegate$831, ClassPropertyType$832, source$833, strict$834, index$835, lineNumber$836, lineStart$837, sm_lineNumber$838, sm_lineStart$839, sm_range$840, sm_index$841, length$842, delegate$843, tokenStream$844, streamIndex$845, lookahead$846, lookaheadIndex$847, state$848, extra$849;
    Token$824 = {
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
    TokenName$825 = {};
    TokenName$825[Token$824.BooleanLiteral] = 'Boolean';
    TokenName$825[Token$824.EOF] = '<end>';
    TokenName$825[Token$824.Identifier] = 'Identifier';
    TokenName$825[Token$824.Keyword] = 'Keyword';
    TokenName$825[Token$824.NullLiteral] = 'Null';
    TokenName$825[Token$824.NumericLiteral] = 'Numeric';
    TokenName$825[Token$824.Punctuator] = 'Punctuator';
    TokenName$825[Token$824.StringLiteral] = 'String';
    TokenName$825[Token$824.RegularExpression] = 'RegularExpression';
    TokenName$825[Token$824.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$826 = [
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
    Syntax$827 = {
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
    PropertyKind$828 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$832 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$829 = {
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
    Regex$830 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$850(condition$999, message$1000) {
        if (!condition$999) {
            throw new Error('ASSERT: ' + message$1000);
        }
    }
    function isIn$851(el$1001, list$1002) {
        return list$1002.indexOf(el$1001) !== -1;
    }
    function isDecimalDigit$852(ch$1003) {
        return ch$1003 >= 48 && ch$1003 <= 57;
    }    // 0..9
    function isHexDigit$853(ch$1004) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1004) >= 0;
    }
    function isOctalDigit$854(ch$1005) {
        return '01234567'.indexOf(ch$1005) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$855(ch$1006) {
        return ch$1006 === 32 || ch$1006 === 9 || ch$1006 === 11 || ch$1006 === 12 || ch$1006 === 160 || ch$1006 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1006)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$856(ch$1007) {
        return ch$1007 === 10 || ch$1007 === 13 || ch$1007 === 8232 || ch$1007 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$857(ch$1008) {
        return ch$1008 === 36 || ch$1008 === 95 || ch$1008 >= 65 && ch$1008 <= 90 || ch$1008 >= 97 && ch$1008 <= 122 || ch$1008 === 92 || ch$1008 >= 128 && Regex$830.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1008));
    }
    function isIdentifierPart$858(ch$1009) {
        return ch$1009 === 36 || ch$1009 === 95 || ch$1009 >= 65 && ch$1009 <= 90 || ch$1009 >= 97 && ch$1009 <= 122 || ch$1009 >= 48 && ch$1009 <= 57 || ch$1009 === 92 || ch$1009 >= 128 && Regex$830.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1009));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$859(id$1010) {
        switch (id$1010) {
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
    function isStrictModeReservedWord$860(id$1011) {
        switch (id$1011) {
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
    function isRestrictedWord$861(id$1012) {
        return id$1012 === 'eval' || id$1012 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$862(id$1013) {
        if (strict$834 && isStrictModeReservedWord$860(id$1013)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1013.length) {
        case 2:
            return id$1013 === 'if' || id$1013 === 'in' || id$1013 === 'do';
        case 3:
            return id$1013 === 'var' || id$1013 === 'for' || id$1013 === 'new' || id$1013 === 'try' || id$1013 === 'let';
        case 4:
            return id$1013 === 'this' || id$1013 === 'else' || id$1013 === 'case' || id$1013 === 'void' || id$1013 === 'with' || id$1013 === 'enum';
        case 5:
            return id$1013 === 'while' || id$1013 === 'break' || id$1013 === 'catch' || id$1013 === 'throw' || id$1013 === 'const' || id$1013 === 'yield' || id$1013 === 'class' || id$1013 === 'super';
        case 6:
            return id$1013 === 'return' || id$1013 === 'typeof' || id$1013 === 'delete' || id$1013 === 'switch' || id$1013 === 'export' || id$1013 === 'import';
        case 7:
            return id$1013 === 'default' || id$1013 === 'finally' || id$1013 === 'extends';
        case 8:
            return id$1013 === 'function' || id$1013 === 'continue' || id$1013 === 'debugger';
        case 10:
            return id$1013 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$863() {
        var ch$1014, blockComment$1015, lineComment$1016;
        blockComment$1015 = false;
        lineComment$1016 = false;
        while (index$835 < length$842) {
            ch$1014 = source$833.charCodeAt(index$835);
            if (lineComment$1016) {
                ++index$835;
                if (isLineTerminator$856(ch$1014)) {
                    lineComment$1016 = false;
                    if (ch$1014 === 13 && source$833.charCodeAt(index$835) === 10) {
                        ++index$835;
                    }
                    ++lineNumber$836;
                    lineStart$837 = index$835;
                }
            } else if (blockComment$1015) {
                if (isLineTerminator$856(ch$1014)) {
                    if (ch$1014 === 13 && source$833.charCodeAt(index$835 + 1) === 10) {
                        ++index$835;
                    }
                    ++lineNumber$836;
                    ++index$835;
                    lineStart$837 = index$835;
                    if (index$835 >= length$842) {
                        throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1014 = source$833.charCodeAt(index$835++);
                    if (index$835 >= length$842) {
                        throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1014 === 42) {
                        ch$1014 = source$833.charCodeAt(index$835);
                        if (ch$1014 === 47) {
                            ++index$835;
                            blockComment$1015 = false;
                        }
                    }
                }
            } else if (ch$1014 === 47) {
                ch$1014 = source$833.charCodeAt(index$835 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1014 === 47) {
                    index$835 += 2;
                    lineComment$1016 = true;
                } else if (ch$1014 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$835 += 2;
                    blockComment$1015 = true;
                    if (index$835 >= length$842) {
                        throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$855(ch$1014)) {
                ++index$835;
            } else if (isLineTerminator$856(ch$1014)) {
                ++index$835;
                if (ch$1014 === 13 && source$833.charCodeAt(index$835) === 10) {
                    ++index$835;
                }
                ++lineNumber$836;
                lineStart$837 = index$835;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$864(prefix$1017) {
        var i$1018, len$1019, ch$1020, code$1021 = 0;
        len$1019 = prefix$1017 === 'u' ? 4 : 2;
        for (i$1018 = 0; i$1018 < len$1019; ++i$1018) {
            if (index$835 < length$842 && isHexDigit$853(source$833[index$835])) {
                ch$1020 = source$833[index$835++];
                code$1021 = code$1021 * 16 + '0123456789abcdef'.indexOf(ch$1020.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1021);
    }
    function scanUnicodeCodePointEscape$865() {
        var ch$1022, code$1023, cu1$1024, cu2$1025;
        ch$1022 = source$833[index$835];
        code$1023 = 0;
        // At least, one hex digit is required.
        if (ch$1022 === '}') {
            throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
        }
        while (index$835 < length$842) {
            ch$1022 = source$833[index$835++];
            if (!isHexDigit$853(ch$1022)) {
                break;
            }
            code$1023 = code$1023 * 16 + '0123456789abcdef'.indexOf(ch$1022.toLowerCase());
        }
        if (code$1023 > 1114111 || ch$1022 !== '}') {
            throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1023 <= 65535) {
            return String.fromCharCode(code$1023);
        }
        cu1$1024 = (code$1023 - 65536 >> 10) + 55296;
        cu2$1025 = (code$1023 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1024, cu2$1025);
    }
    function getEscapedIdentifier$866() {
        var ch$1026, id$1027;
        ch$1026 = source$833.charCodeAt(index$835++);
        id$1027 = String.fromCharCode(ch$1026);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1026 === 92) {
            if (source$833.charCodeAt(index$835) !== 117) {
                throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
            }
            ++index$835;
            ch$1026 = scanHexEscape$864('u');
            if (!ch$1026 || ch$1026 === '\\' || !isIdentifierStart$857(ch$1026.charCodeAt(0))) {
                throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
            }
            id$1027 = ch$1026;
        }
        while (index$835 < length$842) {
            ch$1026 = source$833.charCodeAt(index$835);
            if (!isIdentifierPart$858(ch$1026)) {
                break;
            }
            ++index$835;
            id$1027 += String.fromCharCode(ch$1026);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1026 === 92) {
                id$1027 = id$1027.substr(0, id$1027.length - 1);
                if (source$833.charCodeAt(index$835) !== 117) {
                    throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
                }
                ++index$835;
                ch$1026 = scanHexEscape$864('u');
                if (!ch$1026 || ch$1026 === '\\' || !isIdentifierPart$858(ch$1026.charCodeAt(0))) {
                    throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
                }
                id$1027 += ch$1026;
            }
        }
        return id$1027;
    }
    function getIdentifier$867() {
        var start$1028, ch$1029;
        start$1028 = index$835++;
        while (index$835 < length$842) {
            ch$1029 = source$833.charCodeAt(index$835);
            if (ch$1029 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$835 = start$1028;
                return getEscapedIdentifier$866();
            }
            if (isIdentifierPart$858(ch$1029)) {
                ++index$835;
            } else {
                break;
            }
        }
        return source$833.slice(start$1028, index$835);
    }
    function scanIdentifier$868() {
        var start$1030, id$1031, type$1032;
        start$1030 = index$835;
        // Backslash (char #92) starts an escaped character.
        id$1031 = source$833.charCodeAt(index$835) === 92 ? getEscapedIdentifier$866() : getIdentifier$867();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1031.length === 1) {
            type$1032 = Token$824.Identifier;
        } else if (isKeyword$862(id$1031)) {
            type$1032 = Token$824.Keyword;
        } else if (id$1031 === 'null') {
            type$1032 = Token$824.NullLiteral;
        } else if (id$1031 === 'true' || id$1031 === 'false') {
            type$1032 = Token$824.BooleanLiteral;
        } else {
            type$1032 = Token$824.Identifier;
        }
        return {
            type: type$1032,
            value: id$1031,
            lineNumber: lineNumber$836,
            lineStart: lineStart$837,
            range: [
                start$1030,
                index$835
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$869() {
        var start$1033 = index$835, code$1034 = source$833.charCodeAt(index$835), code2$1035, ch1$1036 = source$833[index$835], ch2$1037, ch3$1038, ch4$1039;
        switch (code$1034) {
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
            ++index$835;
            if (extra$849.tokenize) {
                if (code$1034 === 40) {
                    extra$849.openParenToken = extra$849.tokens.length;
                } else if (code$1034 === 123) {
                    extra$849.openCurlyToken = extra$849.tokens.length;
                }
            }
            return {
                type: Token$824.Punctuator,
                value: String.fromCharCode(code$1034),
                lineNumber: lineNumber$836,
                lineStart: lineStart$837,
                range: [
                    start$1033,
                    index$835
                ]
            };
        default:
            code2$1035 = source$833.charCodeAt(index$835 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1035 === 61) {
                switch (code$1034) {
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
                    index$835 += 2;
                    return {
                        type: Token$824.Punctuator,
                        value: String.fromCharCode(code$1034) + String.fromCharCode(code2$1035),
                        lineNumber: lineNumber$836,
                        lineStart: lineStart$837,
                        range: [
                            start$1033,
                            index$835
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$835 += 2;
                    // !== and ===
                    if (source$833.charCodeAt(index$835) === 61) {
                        ++index$835;
                    }
                    return {
                        type: Token$824.Punctuator,
                        value: source$833.slice(start$1033, index$835),
                        lineNumber: lineNumber$836,
                        lineStart: lineStart$837,
                        range: [
                            start$1033,
                            index$835
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1037 = source$833[index$835 + 1];
        ch3$1038 = source$833[index$835 + 2];
        ch4$1039 = source$833[index$835 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1036 === '>' && ch2$1037 === '>' && ch3$1038 === '>') {
            if (ch4$1039 === '=') {
                index$835 += 4;
                return {
                    type: Token$824.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$836,
                    lineStart: lineStart$837,
                    range: [
                        start$1033,
                        index$835
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1036 === '>' && ch2$1037 === '>' && ch3$1038 === '>') {
            index$835 += 3;
            return {
                type: Token$824.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$836,
                lineStart: lineStart$837,
                range: [
                    start$1033,
                    index$835
                ]
            };
        }
        if (ch1$1036 === '<' && ch2$1037 === '<' && ch3$1038 === '=') {
            index$835 += 3;
            return {
                type: Token$824.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$836,
                lineStart: lineStart$837,
                range: [
                    start$1033,
                    index$835
                ]
            };
        }
        if (ch1$1036 === '>' && ch2$1037 === '>' && ch3$1038 === '=') {
            index$835 += 3;
            return {
                type: Token$824.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$836,
                lineStart: lineStart$837,
                range: [
                    start$1033,
                    index$835
                ]
            };
        }
        if (ch1$1036 === '.' && ch2$1037 === '.' && ch3$1038 === '.') {
            index$835 += 3;
            return {
                type: Token$824.Punctuator,
                value: '...',
                lineNumber: lineNumber$836,
                lineStart: lineStart$837,
                range: [
                    start$1033,
                    index$835
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1036 === ch2$1037 && '+-<>&|'.indexOf(ch1$1036) >= 0) {
            index$835 += 2;
            return {
                type: Token$824.Punctuator,
                value: ch1$1036 + ch2$1037,
                lineNumber: lineNumber$836,
                lineStart: lineStart$837,
                range: [
                    start$1033,
                    index$835
                ]
            };
        }
        if (ch1$1036 === '=' && ch2$1037 === '>') {
            index$835 += 2;
            return {
                type: Token$824.Punctuator,
                value: '=>',
                lineNumber: lineNumber$836,
                lineStart: lineStart$837,
                range: [
                    start$1033,
                    index$835
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1036) >= 0) {
            ++index$835;
            return {
                type: Token$824.Punctuator,
                value: ch1$1036,
                lineNumber: lineNumber$836,
                lineStart: lineStart$837,
                range: [
                    start$1033,
                    index$835
                ]
            };
        }
        if (ch1$1036 === '.') {
            ++index$835;
            return {
                type: Token$824.Punctuator,
                value: ch1$1036,
                lineNumber: lineNumber$836,
                lineStart: lineStart$837,
                range: [
                    start$1033,
                    index$835
                ]
            };
        }
        throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$870(start$1040) {
        var number$1041 = '';
        while (index$835 < length$842) {
            if (!isHexDigit$853(source$833[index$835])) {
                break;
            }
            number$1041 += source$833[index$835++];
        }
        if (number$1041.length === 0) {
            throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$857(source$833.charCodeAt(index$835))) {
            throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$824.NumericLiteral,
            value: parseInt('0x' + number$1041, 16),
            lineNumber: lineNumber$836,
            lineStart: lineStart$837,
            range: [
                start$1040,
                index$835
            ]
        };
    }
    function scanOctalLiteral$871(prefix$1042, start$1043) {
        var number$1044, octal$1045;
        if (isOctalDigit$854(prefix$1042)) {
            octal$1045 = true;
            number$1044 = '0' + source$833[index$835++];
        } else {
            octal$1045 = false;
            ++index$835;
            number$1044 = '';
        }
        while (index$835 < length$842) {
            if (!isOctalDigit$854(source$833[index$835])) {
                break;
            }
            number$1044 += source$833[index$835++];
        }
        if (!octal$1045 && number$1044.length === 0) {
            // only 0o or 0O
            throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$857(source$833.charCodeAt(index$835)) || isDecimalDigit$852(source$833.charCodeAt(index$835))) {
            throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$824.NumericLiteral,
            value: parseInt(number$1044, 8),
            octal: octal$1045,
            lineNumber: lineNumber$836,
            lineStart: lineStart$837,
            range: [
                start$1043,
                index$835
            ]
        };
    }
    function scanNumericLiteral$872() {
        var number$1046, start$1047, ch$1048, octal$1049;
        ch$1048 = source$833[index$835];
        assert$850(isDecimalDigit$852(ch$1048.charCodeAt(0)) || ch$1048 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1047 = index$835;
        number$1046 = '';
        if (ch$1048 !== '.') {
            number$1046 = source$833[index$835++];
            ch$1048 = source$833[index$835];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1046 === '0') {
                if (ch$1048 === 'x' || ch$1048 === 'X') {
                    ++index$835;
                    return scanHexLiteral$870(start$1047);
                }
                if (ch$1048 === 'b' || ch$1048 === 'B') {
                    ++index$835;
                    number$1046 = '';
                    while (index$835 < length$842) {
                        ch$1048 = source$833[index$835];
                        if (ch$1048 !== '0' && ch$1048 !== '1') {
                            break;
                        }
                        number$1046 += source$833[index$835++];
                    }
                    if (number$1046.length === 0) {
                        // only 0b or 0B
                        throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$835 < length$842) {
                        ch$1048 = source$833.charCodeAt(index$835);
                        if (isIdentifierStart$857(ch$1048) || isDecimalDigit$852(ch$1048)) {
                            throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$824.NumericLiteral,
                        value: parseInt(number$1046, 2),
                        lineNumber: lineNumber$836,
                        lineStart: lineStart$837,
                        range: [
                            start$1047,
                            index$835
                        ]
                    };
                }
                if (ch$1048 === 'o' || ch$1048 === 'O' || isOctalDigit$854(ch$1048)) {
                    return scanOctalLiteral$871(ch$1048, start$1047);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1048 && isDecimalDigit$852(ch$1048.charCodeAt(0))) {
                    throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$852(source$833.charCodeAt(index$835))) {
                number$1046 += source$833[index$835++];
            }
            ch$1048 = source$833[index$835];
        }
        if (ch$1048 === '.') {
            number$1046 += source$833[index$835++];
            while (isDecimalDigit$852(source$833.charCodeAt(index$835))) {
                number$1046 += source$833[index$835++];
            }
            ch$1048 = source$833[index$835];
        }
        if (ch$1048 === 'e' || ch$1048 === 'E') {
            number$1046 += source$833[index$835++];
            ch$1048 = source$833[index$835];
            if (ch$1048 === '+' || ch$1048 === '-') {
                number$1046 += source$833[index$835++];
            }
            if (isDecimalDigit$852(source$833.charCodeAt(index$835))) {
                while (isDecimalDigit$852(source$833.charCodeAt(index$835))) {
                    number$1046 += source$833[index$835++];
                }
            } else {
                throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$857(source$833.charCodeAt(index$835))) {
            throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$824.NumericLiteral,
            value: parseFloat(number$1046),
            lineNumber: lineNumber$836,
            lineStart: lineStart$837,
            range: [
                start$1047,
                index$835
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$873() {
        var str$1050 = '', quote$1051, start$1052, ch$1053, code$1054, unescaped$1055, restore$1056, octal$1057 = false;
        quote$1051 = source$833[index$835];
        assert$850(quote$1051 === '\'' || quote$1051 === '"', 'String literal must starts with a quote');
        start$1052 = index$835;
        ++index$835;
        while (index$835 < length$842) {
            ch$1053 = source$833[index$835++];
            if (ch$1053 === quote$1051) {
                quote$1051 = '';
                break;
            } else if (ch$1053 === '\\') {
                ch$1053 = source$833[index$835++];
                if (!ch$1053 || !isLineTerminator$856(ch$1053.charCodeAt(0))) {
                    switch (ch$1053) {
                    case 'n':
                        str$1050 += '\n';
                        break;
                    case 'r':
                        str$1050 += '\r';
                        break;
                    case 't':
                        str$1050 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$833[index$835] === '{') {
                            ++index$835;
                            str$1050 += scanUnicodeCodePointEscape$865();
                        } else {
                            restore$1056 = index$835;
                            unescaped$1055 = scanHexEscape$864(ch$1053);
                            if (unescaped$1055) {
                                str$1050 += unescaped$1055;
                            } else {
                                index$835 = restore$1056;
                                str$1050 += ch$1053;
                            }
                        }
                        break;
                    case 'b':
                        str$1050 += '\b';
                        break;
                    case 'f':
                        str$1050 += '\f';
                        break;
                    case 'v':
                        str$1050 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$854(ch$1053)) {
                            code$1054 = '01234567'.indexOf(ch$1053);
                            // \0 is not octal escape sequence
                            if (code$1054 !== 0) {
                                octal$1057 = true;
                            }
                            if (index$835 < length$842 && isOctalDigit$854(source$833[index$835])) {
                                octal$1057 = true;
                                code$1054 = code$1054 * 8 + '01234567'.indexOf(source$833[index$835++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1053) >= 0 && index$835 < length$842 && isOctalDigit$854(source$833[index$835])) {
                                    code$1054 = code$1054 * 8 + '01234567'.indexOf(source$833[index$835++]);
                                }
                            }
                            str$1050 += String.fromCharCode(code$1054);
                        } else {
                            str$1050 += ch$1053;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$836;
                    if (ch$1053 === '\r' && source$833[index$835] === '\n') {
                        ++index$835;
                    }
                }
            } else if (isLineTerminator$856(ch$1053.charCodeAt(0))) {
                break;
            } else {
                str$1050 += ch$1053;
            }
        }
        if (quote$1051 !== '') {
            throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$824.StringLiteral,
            value: str$1050,
            octal: octal$1057,
            lineNumber: lineNumber$836,
            lineStart: lineStart$837,
            range: [
                start$1052,
                index$835
            ]
        };
    }
    function scanTemplate$874() {
        var cooked$1058 = '', ch$1059, start$1060, terminated$1061, tail$1062, restore$1063, unescaped$1064, code$1065, octal$1066;
        terminated$1061 = false;
        tail$1062 = false;
        start$1060 = index$835;
        ++index$835;
        while (index$835 < length$842) {
            ch$1059 = source$833[index$835++];
            if (ch$1059 === '`') {
                tail$1062 = true;
                terminated$1061 = true;
                break;
            } else if (ch$1059 === '$') {
                if (source$833[index$835] === '{') {
                    ++index$835;
                    terminated$1061 = true;
                    break;
                }
                cooked$1058 += ch$1059;
            } else if (ch$1059 === '\\') {
                ch$1059 = source$833[index$835++];
                if (!isLineTerminator$856(ch$1059.charCodeAt(0))) {
                    switch (ch$1059) {
                    case 'n':
                        cooked$1058 += '\n';
                        break;
                    case 'r':
                        cooked$1058 += '\r';
                        break;
                    case 't':
                        cooked$1058 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$833[index$835] === '{') {
                            ++index$835;
                            cooked$1058 += scanUnicodeCodePointEscape$865();
                        } else {
                            restore$1063 = index$835;
                            unescaped$1064 = scanHexEscape$864(ch$1059);
                            if (unescaped$1064) {
                                cooked$1058 += unescaped$1064;
                            } else {
                                index$835 = restore$1063;
                                cooked$1058 += ch$1059;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1058 += '\b';
                        break;
                    case 'f':
                        cooked$1058 += '\f';
                        break;
                    case 'v':
                        cooked$1058 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$854(ch$1059)) {
                            code$1065 = '01234567'.indexOf(ch$1059);
                            // \0 is not octal escape sequence
                            if (code$1065 !== 0) {
                                octal$1066 = true;
                            }
                            if (index$835 < length$842 && isOctalDigit$854(source$833[index$835])) {
                                octal$1066 = true;
                                code$1065 = code$1065 * 8 + '01234567'.indexOf(source$833[index$835++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1059) >= 0 && index$835 < length$842 && isOctalDigit$854(source$833[index$835])) {
                                    code$1065 = code$1065 * 8 + '01234567'.indexOf(source$833[index$835++]);
                                }
                            }
                            cooked$1058 += String.fromCharCode(code$1065);
                        } else {
                            cooked$1058 += ch$1059;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$836;
                    if (ch$1059 === '\r' && source$833[index$835] === '\n') {
                        ++index$835;
                    }
                }
            } else if (isLineTerminator$856(ch$1059.charCodeAt(0))) {
                ++lineNumber$836;
                if (ch$1059 === '\r' && source$833[index$835] === '\n') {
                    ++index$835;
                }
                cooked$1058 += '\n';
            } else {
                cooked$1058 += ch$1059;
            }
        }
        if (!terminated$1061) {
            throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$824.Template,
            value: {
                cooked: cooked$1058,
                raw: source$833.slice(start$1060 + 1, index$835 - (tail$1062 ? 1 : 2))
            },
            tail: tail$1062,
            octal: octal$1066,
            lineNumber: lineNumber$836,
            lineStart: lineStart$837,
            range: [
                start$1060,
                index$835
            ]
        };
    }
    function scanTemplateElement$875(option$1067) {
        var startsWith$1068, template$1069;
        lookahead$846 = null;
        skipComment$863();
        startsWith$1068 = option$1067.head ? '`' : '}';
        if (source$833[index$835] !== startsWith$1068) {
            throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
        }
        template$1069 = scanTemplate$874();
        peek$881();
        return template$1069;
    }
    function scanRegExp$876() {
        var str$1070, ch$1071, start$1072, pattern$1073, flags$1074, value$1075, classMarker$1076 = false, restore$1077, terminated$1078 = false;
        lookahead$846 = null;
        skipComment$863();
        start$1072 = index$835;
        ch$1071 = source$833[index$835];
        assert$850(ch$1071 === '/', 'Regular expression literal must start with a slash');
        str$1070 = source$833[index$835++];
        while (index$835 < length$842) {
            ch$1071 = source$833[index$835++];
            str$1070 += ch$1071;
            if (classMarker$1076) {
                if (ch$1071 === ']') {
                    classMarker$1076 = false;
                }
            } else {
                if (ch$1071 === '\\') {
                    ch$1071 = source$833[index$835++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$856(ch$1071.charCodeAt(0))) {
                        throwError$884({}, Messages$829.UnterminatedRegExp);
                    }
                    str$1070 += ch$1071;
                } else if (ch$1071 === '/') {
                    terminated$1078 = true;
                    break;
                } else if (ch$1071 === '[') {
                    classMarker$1076 = true;
                } else if (isLineTerminator$856(ch$1071.charCodeAt(0))) {
                    throwError$884({}, Messages$829.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1078) {
            throwError$884({}, Messages$829.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1073 = str$1070.substr(1, str$1070.length - 2);
        flags$1074 = '';
        while (index$835 < length$842) {
            ch$1071 = source$833[index$835];
            if (!isIdentifierPart$858(ch$1071.charCodeAt(0))) {
                break;
            }
            ++index$835;
            if (ch$1071 === '\\' && index$835 < length$842) {
                ch$1071 = source$833[index$835];
                if (ch$1071 === 'u') {
                    ++index$835;
                    restore$1077 = index$835;
                    ch$1071 = scanHexEscape$864('u');
                    if (ch$1071) {
                        flags$1074 += ch$1071;
                        for (str$1070 += '\\u'; restore$1077 < index$835; ++restore$1077) {
                            str$1070 += source$833[restore$1077];
                        }
                    } else {
                        index$835 = restore$1077;
                        flags$1074 += 'u';
                        str$1070 += '\\u';
                    }
                } else {
                    str$1070 += '\\';
                }
            } else {
                flags$1074 += ch$1071;
                str$1070 += ch$1071;
            }
        }
        try {
            value$1075 = new RegExp(pattern$1073, flags$1074);
        } catch (e$1079) {
            throwError$884({}, Messages$829.InvalidRegExp);
        }
        // peek();
        if (extra$849.tokenize) {
            return {
                type: Token$824.RegularExpression,
                value: value$1075,
                lineNumber: lineNumber$836,
                lineStart: lineStart$837,
                range: [
                    start$1072,
                    index$835
                ]
            };
        }
        return {
            type: Token$824.RegularExpression,
            literal: str$1070,
            value: value$1075,
            range: [
                start$1072,
                index$835
            ]
        };
    }
    function isIdentifierName$877(token$1080) {
        return token$1080.type === Token$824.Identifier || token$1080.type === Token$824.Keyword || token$1080.type === Token$824.BooleanLiteral || token$1080.type === Token$824.NullLiteral;
    }
    function advanceSlash$878() {
        var prevToken$1081, checkToken$1082;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1081 = extra$849.tokens[extra$849.tokens.length - 1];
        if (!prevToken$1081) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$876();
        }
        if (prevToken$1081.type === 'Punctuator') {
            if (prevToken$1081.value === ')') {
                checkToken$1082 = extra$849.tokens[extra$849.openParenToken - 1];
                if (checkToken$1082 && checkToken$1082.type === 'Keyword' && (checkToken$1082.value === 'if' || checkToken$1082.value === 'while' || checkToken$1082.value === 'for' || checkToken$1082.value === 'with')) {
                    return scanRegExp$876();
                }
                return scanPunctuator$869();
            }
            if (prevToken$1081.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$849.tokens[extra$849.openCurlyToken - 3] && extra$849.tokens[extra$849.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1082 = extra$849.tokens[extra$849.openCurlyToken - 4];
                    if (!checkToken$1082) {
                        return scanPunctuator$869();
                    }
                } else if (extra$849.tokens[extra$849.openCurlyToken - 4] && extra$849.tokens[extra$849.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1082 = extra$849.tokens[extra$849.openCurlyToken - 5];
                    if (!checkToken$1082) {
                        return scanRegExp$876();
                    }
                } else {
                    return scanPunctuator$869();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$826.indexOf(checkToken$1082.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$869();
                }
                // It is a declaration.
                return scanRegExp$876();
            }
            return scanRegExp$876();
        }
        if (prevToken$1081.type === 'Keyword') {
            return scanRegExp$876();
        }
        return scanPunctuator$869();
    }
    function advance$879() {
        var ch$1083;
        skipComment$863();
        if (index$835 >= length$842) {
            return {
                type: Token$824.EOF,
                lineNumber: lineNumber$836,
                lineStart: lineStart$837,
                range: [
                    index$835,
                    index$835
                ]
            };
        }
        ch$1083 = source$833.charCodeAt(index$835);
        // Very common: ( and ) and ;
        if (ch$1083 === 40 || ch$1083 === 41 || ch$1083 === 58) {
            return scanPunctuator$869();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1083 === 39 || ch$1083 === 34) {
            return scanStringLiteral$873();
        }
        if (ch$1083 === 96) {
            return scanTemplate$874();
        }
        if (isIdentifierStart$857(ch$1083)) {
            return scanIdentifier$868();
        }
        // # and @ are allowed for sweet.js
        if (ch$1083 === 35 || ch$1083 === 64) {
            ++index$835;
            return {
                type: Token$824.Punctuator,
                value: String.fromCharCode(ch$1083),
                lineNumber: lineNumber$836,
                lineStart: lineStart$837,
                range: [
                    index$835 - 1,
                    index$835
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1083 === 46) {
            if (isDecimalDigit$852(source$833.charCodeAt(index$835 + 1))) {
                return scanNumericLiteral$872();
            }
            return scanPunctuator$869();
        }
        if (isDecimalDigit$852(ch$1083)) {
            return scanNumericLiteral$872();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$849.tokenize && ch$1083 === 47) {
            return advanceSlash$878();
        }
        return scanPunctuator$869();
    }
    function lex$880() {
        var token$1084;
        token$1084 = lookahead$846;
        streamIndex$845 = lookaheadIndex$847;
        lineNumber$836 = token$1084.lineNumber;
        lineStart$837 = token$1084.lineStart;
        sm_lineNumber$838 = lookahead$846.sm_lineNumber;
        sm_lineStart$839 = lookahead$846.sm_lineStart;
        sm_range$840 = lookahead$846.sm_range;
        sm_index$841 = lookahead$846.sm_range[0];
        lookahead$846 = tokenStream$844[++streamIndex$845].token;
        lookaheadIndex$847 = streamIndex$845;
        index$835 = lookahead$846.range[0];
        return token$1084;
    }
    function peek$881() {
        lookaheadIndex$847 = streamIndex$845 + 1;
        if (lookaheadIndex$847 >= length$842) {
            lookahead$846 = {
                type: Token$824.EOF,
                lineNumber: lineNumber$836,
                lineStart: lineStart$837,
                range: [
                    index$835,
                    index$835
                ]
            };
            return;
        }
        lookahead$846 = tokenStream$844[lookaheadIndex$847].token;
        index$835 = lookahead$846.range[0];
    }
    function lookahead2$882() {
        var adv$1085, pos$1086, line$1087, start$1088, result$1089;
        if (streamIndex$845 + 1 >= length$842 || streamIndex$845 + 2 >= length$842) {
            return {
                type: Token$824.EOF,
                lineNumber: lineNumber$836,
                lineStart: lineStart$837,
                range: [
                    index$835,
                    index$835
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$846 === null) {
            lookaheadIndex$847 = streamIndex$845 + 1;
            lookahead$846 = tokenStream$844[lookaheadIndex$847].token;
            index$835 = lookahead$846.range[0];
        }
        result$1089 = tokenStream$844[lookaheadIndex$847 + 1].token;
        return result$1089;
    }
    SyntaxTreeDelegate$831 = {
        name: 'SyntaxTree',
        postProcess: function (node$1090) {
            return node$1090;
        },
        createArrayExpression: function (elements$1091) {
            return {
                type: Syntax$827.ArrayExpression,
                elements: elements$1091
            };
        },
        createAssignmentExpression: function (operator$1092, left$1093, right$1094) {
            return {
                type: Syntax$827.AssignmentExpression,
                operator: operator$1092,
                left: left$1093,
                right: right$1094
            };
        },
        createBinaryExpression: function (operator$1095, left$1096, right$1097) {
            var type$1098 = operator$1095 === '||' || operator$1095 === '&&' ? Syntax$827.LogicalExpression : Syntax$827.BinaryExpression;
            return {
                type: type$1098,
                operator: operator$1095,
                left: left$1096,
                right: right$1097
            };
        },
        createBlockStatement: function (body$1099) {
            return {
                type: Syntax$827.BlockStatement,
                body: body$1099
            };
        },
        createBreakStatement: function (label$1100) {
            return {
                type: Syntax$827.BreakStatement,
                label: label$1100
            };
        },
        createCallExpression: function (callee$1101, args$1102) {
            return {
                type: Syntax$827.CallExpression,
                callee: callee$1101,
                'arguments': args$1102
            };
        },
        createCatchClause: function (param$1103, body$1104) {
            return {
                type: Syntax$827.CatchClause,
                param: param$1103,
                body: body$1104
            };
        },
        createConditionalExpression: function (test$1105, consequent$1106, alternate$1107) {
            return {
                type: Syntax$827.ConditionalExpression,
                test: test$1105,
                consequent: consequent$1106,
                alternate: alternate$1107
            };
        },
        createContinueStatement: function (label$1108) {
            return {
                type: Syntax$827.ContinueStatement,
                label: label$1108
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$827.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1109, test$1110) {
            return {
                type: Syntax$827.DoWhileStatement,
                body: body$1109,
                test: test$1110
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$827.EmptyStatement };
        },
        createExpressionStatement: function (expression$1111) {
            return {
                type: Syntax$827.ExpressionStatement,
                expression: expression$1111
            };
        },
        createForStatement: function (init$1112, test$1113, update$1114, body$1115) {
            return {
                type: Syntax$827.ForStatement,
                init: init$1112,
                test: test$1113,
                update: update$1114,
                body: body$1115
            };
        },
        createForInStatement: function (left$1116, right$1117, body$1118) {
            return {
                type: Syntax$827.ForInStatement,
                left: left$1116,
                right: right$1117,
                body: body$1118,
                each: false
            };
        },
        createForOfStatement: function (left$1119, right$1120, body$1121) {
            return {
                type: Syntax$827.ForOfStatement,
                left: left$1119,
                right: right$1120,
                body: body$1121
            };
        },
        createFunctionDeclaration: function (id$1122, params$1123, defaults$1124, body$1125, rest$1126, generator$1127, expression$1128) {
            return {
                type: Syntax$827.FunctionDeclaration,
                id: id$1122,
                params: params$1123,
                defaults: defaults$1124,
                body: body$1125,
                rest: rest$1126,
                generator: generator$1127,
                expression: expression$1128
            };
        },
        createFunctionExpression: function (id$1129, params$1130, defaults$1131, body$1132, rest$1133, generator$1134, expression$1135) {
            return {
                type: Syntax$827.FunctionExpression,
                id: id$1129,
                params: params$1130,
                defaults: defaults$1131,
                body: body$1132,
                rest: rest$1133,
                generator: generator$1134,
                expression: expression$1135
            };
        },
        createIdentifier: function (name$1136) {
            return {
                type: Syntax$827.Identifier,
                name: name$1136
            };
        },
        createIfStatement: function (test$1137, consequent$1138, alternate$1139) {
            return {
                type: Syntax$827.IfStatement,
                test: test$1137,
                consequent: consequent$1138,
                alternate: alternate$1139
            };
        },
        createLabeledStatement: function (label$1140, body$1141) {
            return {
                type: Syntax$827.LabeledStatement,
                label: label$1140,
                body: body$1141
            };
        },
        createLiteral: function (token$1142) {
            return {
                type: Syntax$827.Literal,
                value: token$1142.value,
                raw: String(token$1142.value)
            };
        },
        createMemberExpression: function (accessor$1143, object$1144, property$1145) {
            return {
                type: Syntax$827.MemberExpression,
                computed: accessor$1143 === '[',
                object: object$1144,
                property: property$1145
            };
        },
        createNewExpression: function (callee$1146, args$1147) {
            return {
                type: Syntax$827.NewExpression,
                callee: callee$1146,
                'arguments': args$1147
            };
        },
        createObjectExpression: function (properties$1148) {
            return {
                type: Syntax$827.ObjectExpression,
                properties: properties$1148
            };
        },
        createPostfixExpression: function (operator$1149, argument$1150) {
            return {
                type: Syntax$827.UpdateExpression,
                operator: operator$1149,
                argument: argument$1150,
                prefix: false
            };
        },
        createProgram: function (body$1151) {
            return {
                type: Syntax$827.Program,
                body: body$1151
            };
        },
        createProperty: function (kind$1152, key$1153, value$1154, method$1155, shorthand$1156) {
            return {
                type: Syntax$827.Property,
                key: key$1153,
                value: value$1154,
                kind: kind$1152,
                method: method$1155,
                shorthand: shorthand$1156
            };
        },
        createReturnStatement: function (argument$1157) {
            return {
                type: Syntax$827.ReturnStatement,
                argument: argument$1157
            };
        },
        createSequenceExpression: function (expressions$1158) {
            return {
                type: Syntax$827.SequenceExpression,
                expressions: expressions$1158
            };
        },
        createSwitchCase: function (test$1159, consequent$1160) {
            return {
                type: Syntax$827.SwitchCase,
                test: test$1159,
                consequent: consequent$1160
            };
        },
        createSwitchStatement: function (discriminant$1161, cases$1162) {
            return {
                type: Syntax$827.SwitchStatement,
                discriminant: discriminant$1161,
                cases: cases$1162
            };
        },
        createThisExpression: function () {
            return { type: Syntax$827.ThisExpression };
        },
        createThrowStatement: function (argument$1163) {
            return {
                type: Syntax$827.ThrowStatement,
                argument: argument$1163
            };
        },
        createTryStatement: function (block$1164, guardedHandlers$1165, handlers$1166, finalizer$1167) {
            return {
                type: Syntax$827.TryStatement,
                block: block$1164,
                guardedHandlers: guardedHandlers$1165,
                handlers: handlers$1166,
                finalizer: finalizer$1167
            };
        },
        createUnaryExpression: function (operator$1168, argument$1169) {
            if (operator$1168 === '++' || operator$1168 === '--') {
                return {
                    type: Syntax$827.UpdateExpression,
                    operator: operator$1168,
                    argument: argument$1169,
                    prefix: true
                };
            }
            return {
                type: Syntax$827.UnaryExpression,
                operator: operator$1168,
                argument: argument$1169
            };
        },
        createVariableDeclaration: function (declarations$1170, kind$1171) {
            return {
                type: Syntax$827.VariableDeclaration,
                declarations: declarations$1170,
                kind: kind$1171
            };
        },
        createVariableDeclarator: function (id$1172, init$1173) {
            return {
                type: Syntax$827.VariableDeclarator,
                id: id$1172,
                init: init$1173
            };
        },
        createWhileStatement: function (test$1174, body$1175) {
            return {
                type: Syntax$827.WhileStatement,
                test: test$1174,
                body: body$1175
            };
        },
        createWithStatement: function (object$1176, body$1177) {
            return {
                type: Syntax$827.WithStatement,
                object: object$1176,
                body: body$1177
            };
        },
        createTemplateElement: function (value$1178, tail$1179) {
            return {
                type: Syntax$827.TemplateElement,
                value: value$1178,
                tail: tail$1179
            };
        },
        createTemplateLiteral: function (quasis$1180, expressions$1181) {
            return {
                type: Syntax$827.TemplateLiteral,
                quasis: quasis$1180,
                expressions: expressions$1181
            };
        },
        createSpreadElement: function (argument$1182) {
            return {
                type: Syntax$827.SpreadElement,
                argument: argument$1182
            };
        },
        createTaggedTemplateExpression: function (tag$1183, quasi$1184) {
            return {
                type: Syntax$827.TaggedTemplateExpression,
                tag: tag$1183,
                quasi: quasi$1184
            };
        },
        createArrowFunctionExpression: function (params$1185, defaults$1186, body$1187, rest$1188, expression$1189) {
            return {
                type: Syntax$827.ArrowFunctionExpression,
                id: null,
                params: params$1185,
                defaults: defaults$1186,
                body: body$1187,
                rest: rest$1188,
                generator: false,
                expression: expression$1189
            };
        },
        createMethodDefinition: function (propertyType$1190, kind$1191, key$1192, value$1193) {
            return {
                type: Syntax$827.MethodDefinition,
                key: key$1192,
                value: value$1193,
                kind: kind$1191,
                'static': propertyType$1190 === ClassPropertyType$832.static
            };
        },
        createClassBody: function (body$1194) {
            return {
                type: Syntax$827.ClassBody,
                body: body$1194
            };
        },
        createClassExpression: function (id$1195, superClass$1196, body$1197) {
            return {
                type: Syntax$827.ClassExpression,
                id: id$1195,
                superClass: superClass$1196,
                body: body$1197
            };
        },
        createClassDeclaration: function (id$1198, superClass$1199, body$1200) {
            return {
                type: Syntax$827.ClassDeclaration,
                id: id$1198,
                superClass: superClass$1199,
                body: body$1200
            };
        },
        createExportSpecifier: function (id$1201, name$1202) {
            return {
                type: Syntax$827.ExportSpecifier,
                id: id$1201,
                name: name$1202
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$827.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1203, specifiers$1204, source$1205) {
            return {
                type: Syntax$827.ExportDeclaration,
                declaration: declaration$1203,
                specifiers: specifiers$1204,
                source: source$1205
            };
        },
        createImportSpecifier: function (id$1206, name$1207) {
            return {
                type: Syntax$827.ImportSpecifier,
                id: id$1206,
                name: name$1207
            };
        },
        createImportDeclaration: function (specifiers$1208, kind$1209, source$1210) {
            return {
                type: Syntax$827.ImportDeclaration,
                specifiers: specifiers$1208,
                kind: kind$1209,
                source: source$1210
            };
        },
        createYieldExpression: function (argument$1211, delegate$1212) {
            return {
                type: Syntax$827.YieldExpression,
                argument: argument$1211,
                delegate: delegate$1212
            };
        },
        createModuleDeclaration: function (id$1213, source$1214, body$1215) {
            return {
                type: Syntax$827.ModuleDeclaration,
                id: id$1213,
                source: source$1214,
                body: body$1215
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$883() {
        return lookahead$846.lineNumber !== lineNumber$836;
    }
    // Throw an exception
    function throwError$884(token$1216, messageFormat$1217) {
        var error$1218, args$1219 = Array.prototype.slice.call(arguments, 2), msg$1220 = messageFormat$1217.replace(/%(\d)/g, function (whole$1221, index$1222) {
                assert$850(index$1222 < args$1219.length, 'Message reference must be in range');
                return args$1219[index$1222];
            });
        if (typeof token$1216.lineNumber === 'number') {
            error$1218 = new Error('Line ' + token$1216.lineNumber + ': ' + msg$1220);
            error$1218.index = token$1216.range[0];
            error$1218.lineNumber = token$1216.lineNumber;
            error$1218.column = token$1216.range[0] - lineStart$837 + 1;
        } else {
            error$1218 = new Error('Line ' + lineNumber$836 + ': ' + msg$1220);
            error$1218.index = index$835;
            error$1218.lineNumber = lineNumber$836;
            error$1218.column = index$835 - lineStart$837 + 1;
        }
        error$1218.description = msg$1220;
        throw error$1218;
    }
    function throwErrorTolerant$885() {
        try {
            throwError$884.apply(null, arguments);
        } catch (e$1223) {
            if (extra$849.errors) {
                extra$849.errors.push(e$1223);
            } else {
                throw e$1223;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$886(token$1224) {
        if (token$1224.type === Token$824.EOF) {
            throwError$884(token$1224, Messages$829.UnexpectedEOS);
        }
        if (token$1224.type === Token$824.NumericLiteral) {
            throwError$884(token$1224, Messages$829.UnexpectedNumber);
        }
        if (token$1224.type === Token$824.StringLiteral) {
            throwError$884(token$1224, Messages$829.UnexpectedString);
        }
        if (token$1224.type === Token$824.Identifier) {
            throwError$884(token$1224, Messages$829.UnexpectedIdentifier);
        }
        if (token$1224.type === Token$824.Keyword) {
            if (isFutureReservedWord$859(token$1224.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$834 && isStrictModeReservedWord$860(token$1224.value)) {
                throwErrorTolerant$885(token$1224, Messages$829.StrictReservedWord);
                return;
            }
            throwError$884(token$1224, Messages$829.UnexpectedToken, token$1224.value);
        }
        if (token$1224.type === Token$824.Template) {
            throwError$884(token$1224, Messages$829.UnexpectedTemplate, token$1224.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$884(token$1224, Messages$829.UnexpectedToken, token$1224.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$887(value$1225) {
        var token$1226 = lex$880();
        if (token$1226.type !== Token$824.Punctuator || token$1226.value !== value$1225) {
            throwUnexpected$886(token$1226);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$888(keyword$1227) {
        var token$1228 = lex$880();
        if (token$1228.type !== Token$824.Keyword || token$1228.value !== keyword$1227) {
            throwUnexpected$886(token$1228);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$889(value$1229) {
        return lookahead$846.type === Token$824.Punctuator && lookahead$846.value === value$1229;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$890(keyword$1230) {
        return lookahead$846.type === Token$824.Keyword && lookahead$846.value === keyword$1230;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$891(keyword$1231) {
        return lookahead$846.type === Token$824.Identifier && lookahead$846.value === keyword$1231;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$892() {
        var op$1232;
        if (lookahead$846.type !== Token$824.Punctuator) {
            return false;
        }
        op$1232 = lookahead$846.value;
        return op$1232 === '=' || op$1232 === '*=' || op$1232 === '/=' || op$1232 === '%=' || op$1232 === '+=' || op$1232 === '-=' || op$1232 === '<<=' || op$1232 === '>>=' || op$1232 === '>>>=' || op$1232 === '&=' || op$1232 === '^=' || op$1232 === '|=';
    }
    function consumeSemicolon$893() {
        var line$1233, ch$1234;
        ch$1234 = lookahead$846.value ? String(lookahead$846.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1234 === 59) {
            lex$880();
            return;
        }
        if (lookahead$846.lineNumber !== lineNumber$836) {
            return;
        }
        if (match$889(';')) {
            lex$880();
            return;
        }
        if (lookahead$846.type !== Token$824.EOF && !match$889('}')) {
            throwUnexpected$886(lookahead$846);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$894(expr$1235) {
        return expr$1235.type === Syntax$827.Identifier || expr$1235.type === Syntax$827.MemberExpression;
    }
    function isAssignableLeftHandSide$895(expr$1236) {
        return isLeftHandSide$894(expr$1236) || expr$1236.type === Syntax$827.ObjectPattern || expr$1236.type === Syntax$827.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$896() {
        var elements$1237 = [], blocks$1238 = [], filter$1239 = null, tmp$1240, possiblecomprehension$1241 = true, body$1242;
        expect$887('[');
        while (!match$889(']')) {
            if (lookahead$846.value === 'for' && lookahead$846.type === Token$824.Keyword) {
                if (!possiblecomprehension$1241) {
                    throwError$884({}, Messages$829.ComprehensionError);
                }
                matchKeyword$890('for');
                tmp$1240 = parseForStatement$944({ ignoreBody: true });
                tmp$1240.of = tmp$1240.type === Syntax$827.ForOfStatement;
                tmp$1240.type = Syntax$827.ComprehensionBlock;
                if (tmp$1240.left.kind) {
                    // can't be let or const
                    throwError$884({}, Messages$829.ComprehensionError);
                }
                blocks$1238.push(tmp$1240);
            } else if (lookahead$846.value === 'if' && lookahead$846.type === Token$824.Keyword) {
                if (!possiblecomprehension$1241) {
                    throwError$884({}, Messages$829.ComprehensionError);
                }
                expectKeyword$888('if');
                expect$887('(');
                filter$1239 = parseExpression$924();
                expect$887(')');
            } else if (lookahead$846.value === ',' && lookahead$846.type === Token$824.Punctuator) {
                possiblecomprehension$1241 = false;
                // no longer allowed.
                lex$880();
                elements$1237.push(null);
            } else {
                tmp$1240 = parseSpreadOrAssignmentExpression$907();
                elements$1237.push(tmp$1240);
                if (tmp$1240 && tmp$1240.type === Syntax$827.SpreadElement) {
                    if (!match$889(']')) {
                        throwError$884({}, Messages$829.ElementAfterSpreadElement);
                    }
                } else if (!(match$889(']') || matchKeyword$890('for') || matchKeyword$890('if'))) {
                    expect$887(',');
                    // this lexes.
                    possiblecomprehension$1241 = false;
                }
            }
        }
        expect$887(']');
        if (filter$1239 && !blocks$1238.length) {
            throwError$884({}, Messages$829.ComprehensionRequiresBlock);
        }
        if (blocks$1238.length) {
            if (elements$1237.length !== 1) {
                throwError$884({}, Messages$829.ComprehensionError);
            }
            return {
                type: Syntax$827.ComprehensionExpression,
                filter: filter$1239,
                blocks: blocks$1238,
                body: elements$1237[0]
            };
        }
        return delegate$843.createArrayExpression(elements$1237);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$897(options$1243) {
        var previousStrict$1244, previousYieldAllowed$1245, params$1246, defaults$1247, body$1248;
        previousStrict$1244 = strict$834;
        previousYieldAllowed$1245 = state$848.yieldAllowed;
        state$848.yieldAllowed = options$1243.generator;
        params$1246 = options$1243.params || [];
        defaults$1247 = options$1243.defaults || [];
        body$1248 = parseConciseBody$956();
        if (options$1243.name && strict$834 && isRestrictedWord$861(params$1246[0].name)) {
            throwErrorTolerant$885(options$1243.name, Messages$829.StrictParamName);
        }
        if (state$848.yieldAllowed && !state$848.yieldFound) {
            throwErrorTolerant$885({}, Messages$829.NoYieldInGenerator);
        }
        strict$834 = previousStrict$1244;
        state$848.yieldAllowed = previousYieldAllowed$1245;
        return delegate$843.createFunctionExpression(null, params$1246, defaults$1247, body$1248, options$1243.rest || null, options$1243.generator, body$1248.type !== Syntax$827.BlockStatement);
    }
    function parsePropertyMethodFunction$898(options$1249) {
        var previousStrict$1250, tmp$1251, method$1252;
        previousStrict$1250 = strict$834;
        strict$834 = true;
        tmp$1251 = parseParams$960();
        if (tmp$1251.stricted) {
            throwErrorTolerant$885(tmp$1251.stricted, tmp$1251.message);
        }
        method$1252 = parsePropertyFunction$897({
            params: tmp$1251.params,
            defaults: tmp$1251.defaults,
            rest: tmp$1251.rest,
            generator: options$1249.generator
        });
        strict$834 = previousStrict$1250;
        return method$1252;
    }
    function parseObjectPropertyKey$899() {
        var token$1253 = lex$880();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1253.type === Token$824.StringLiteral || token$1253.type === Token$824.NumericLiteral) {
            if (strict$834 && token$1253.octal) {
                throwErrorTolerant$885(token$1253, Messages$829.StrictOctalLiteral);
            }
            return delegate$843.createLiteral(token$1253);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$843.createIdentifier(token$1253.value);
    }
    function parseObjectProperty$900() {
        var token$1254, key$1255, id$1256, value$1257, param$1258;
        token$1254 = lookahead$846;
        if (token$1254.type === Token$824.Identifier) {
            id$1256 = parseObjectPropertyKey$899();
            // Property Assignment: Getter and Setter.
            if (token$1254.value === 'get' && !(match$889(':') || match$889('('))) {
                key$1255 = parseObjectPropertyKey$899();
                expect$887('(');
                expect$887(')');
                return delegate$843.createProperty('get', key$1255, parsePropertyFunction$897({ generator: false }), false, false);
            }
            if (token$1254.value === 'set' && !(match$889(':') || match$889('('))) {
                key$1255 = parseObjectPropertyKey$899();
                expect$887('(');
                token$1254 = lookahead$846;
                param$1258 = [parseVariableIdentifier$927()];
                expect$887(')');
                return delegate$843.createProperty('set', key$1255, parsePropertyFunction$897({
                    params: param$1258,
                    generator: false,
                    name: token$1254
                }), false, false);
            }
            if (match$889(':')) {
                lex$880();
                return delegate$843.createProperty('init', id$1256, parseAssignmentExpression$923(), false, false);
            }
            if (match$889('(')) {
                return delegate$843.createProperty('init', id$1256, parsePropertyMethodFunction$898({ generator: false }), true, false);
            }
            return delegate$843.createProperty('init', id$1256, id$1256, false, true);
        }
        if (token$1254.type === Token$824.EOF || token$1254.type === Token$824.Punctuator) {
            if (!match$889('*')) {
                throwUnexpected$886(token$1254);
            }
            lex$880();
            id$1256 = parseObjectPropertyKey$899();
            if (!match$889('(')) {
                throwUnexpected$886(lex$880());
            }
            return delegate$843.createProperty('init', id$1256, parsePropertyMethodFunction$898({ generator: true }), true, false);
        }
        key$1255 = parseObjectPropertyKey$899();
        if (match$889(':')) {
            lex$880();
            return delegate$843.createProperty('init', key$1255, parseAssignmentExpression$923(), false, false);
        }
        if (match$889('(')) {
            return delegate$843.createProperty('init', key$1255, parsePropertyMethodFunction$898({ generator: false }), true, false);
        }
        throwUnexpected$886(lex$880());
    }
    function parseObjectInitialiser$901() {
        var properties$1259 = [], property$1260, name$1261, key$1262, kind$1263, map$1264 = {}, toString$1265 = String;
        expect$887('{');
        while (!match$889('}')) {
            property$1260 = parseObjectProperty$900();
            if (property$1260.key.type === Syntax$827.Identifier) {
                name$1261 = property$1260.key.name;
            } else {
                name$1261 = toString$1265(property$1260.key.value);
            }
            kind$1263 = property$1260.kind === 'init' ? PropertyKind$828.Data : property$1260.kind === 'get' ? PropertyKind$828.Get : PropertyKind$828.Set;
            key$1262 = '$' + name$1261;
            if (Object.prototype.hasOwnProperty.call(map$1264, key$1262)) {
                if (map$1264[key$1262] === PropertyKind$828.Data) {
                    if (strict$834 && kind$1263 === PropertyKind$828.Data) {
                        throwErrorTolerant$885({}, Messages$829.StrictDuplicateProperty);
                    } else if (kind$1263 !== PropertyKind$828.Data) {
                        throwErrorTolerant$885({}, Messages$829.AccessorDataProperty);
                    }
                } else {
                    if (kind$1263 === PropertyKind$828.Data) {
                        throwErrorTolerant$885({}, Messages$829.AccessorDataProperty);
                    } else if (map$1264[key$1262] & kind$1263) {
                        throwErrorTolerant$885({}, Messages$829.AccessorGetSet);
                    }
                }
                map$1264[key$1262] |= kind$1263;
            } else {
                map$1264[key$1262] = kind$1263;
            }
            properties$1259.push(property$1260);
            if (!match$889('}')) {
                expect$887(',');
            }
        }
        expect$887('}');
        return delegate$843.createObjectExpression(properties$1259);
    }
    function parseTemplateElement$902(option$1266) {
        var token$1267 = scanTemplateElement$875(option$1266);
        if (strict$834 && token$1267.octal) {
            throwError$884(token$1267, Messages$829.StrictOctalLiteral);
        }
        return delegate$843.createTemplateElement({
            raw: token$1267.value.raw,
            cooked: token$1267.value.cooked
        }, token$1267.tail);
    }
    function parseTemplateLiteral$903() {
        var quasi$1268, quasis$1269, expressions$1270;
        quasi$1268 = parseTemplateElement$902({ head: true });
        quasis$1269 = [quasi$1268];
        expressions$1270 = [];
        while (!quasi$1268.tail) {
            expressions$1270.push(parseExpression$924());
            quasi$1268 = parseTemplateElement$902({ head: false });
            quasis$1269.push(quasi$1268);
        }
        return delegate$843.createTemplateLiteral(quasis$1269, expressions$1270);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$904() {
        var expr$1271;
        expect$887('(');
        ++state$848.parenthesizedCount;
        expr$1271 = parseExpression$924();
        expect$887(')');
        return expr$1271;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$905() {
        var type$1272, token$1273, resolvedIdent$1274;
        token$1273 = lookahead$846;
        type$1272 = lookahead$846.type;
        if (type$1272 === Token$824.Identifier) {
            resolvedIdent$1274 = expander$823.resolve(tokenStream$844[lookaheadIndex$847]);
            lex$880();
            return delegate$843.createIdentifier(resolvedIdent$1274);
        }
        if (type$1272 === Token$824.StringLiteral || type$1272 === Token$824.NumericLiteral) {
            if (strict$834 && lookahead$846.octal) {
                throwErrorTolerant$885(lookahead$846, Messages$829.StrictOctalLiteral);
            }
            return delegate$843.createLiteral(lex$880());
        }
        if (type$1272 === Token$824.Keyword) {
            if (matchKeyword$890('this')) {
                lex$880();
                return delegate$843.createThisExpression();
            }
            if (matchKeyword$890('function')) {
                return parseFunctionExpression$962();
            }
            if (matchKeyword$890('class')) {
                return parseClassExpression$967();
            }
            if (matchKeyword$890('super')) {
                lex$880();
                return delegate$843.createIdentifier('super');
            }
        }
        if (type$1272 === Token$824.BooleanLiteral) {
            token$1273 = lex$880();
            token$1273.value = token$1273.value === 'true';
            return delegate$843.createLiteral(token$1273);
        }
        if (type$1272 === Token$824.NullLiteral) {
            token$1273 = lex$880();
            token$1273.value = null;
            return delegate$843.createLiteral(token$1273);
        }
        if (match$889('[')) {
            return parseArrayInitialiser$896();
        }
        if (match$889('{')) {
            return parseObjectInitialiser$901();
        }
        if (match$889('(')) {
            return parseGroupExpression$904();
        }
        if (lookahead$846.type === Token$824.RegularExpression) {
            return delegate$843.createLiteral(lex$880());
        }
        if (type$1272 === Token$824.Template) {
            return parseTemplateLiteral$903();
        }
        return throwUnexpected$886(lex$880());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$906() {
        var args$1275 = [], arg$1276;
        expect$887('(');
        if (!match$889(')')) {
            while (streamIndex$845 < length$842) {
                arg$1276 = parseSpreadOrAssignmentExpression$907();
                args$1275.push(arg$1276);
                if (match$889(')')) {
                    break;
                } else if (arg$1276.type === Syntax$827.SpreadElement) {
                    throwError$884({}, Messages$829.ElementAfterSpreadElement);
                }
                expect$887(',');
            }
        }
        expect$887(')');
        return args$1275;
    }
    function parseSpreadOrAssignmentExpression$907() {
        if (match$889('...')) {
            lex$880();
            return delegate$843.createSpreadElement(parseAssignmentExpression$923());
        }
        return parseAssignmentExpression$923();
    }
    function parseNonComputedProperty$908() {
        var token$1277 = lex$880();
        if (!isIdentifierName$877(token$1277)) {
            throwUnexpected$886(token$1277);
        }
        return delegate$843.createIdentifier(token$1277.value);
    }
    function parseNonComputedMember$909() {
        expect$887('.');
        return parseNonComputedProperty$908();
    }
    function parseComputedMember$910() {
        var expr$1278;
        expect$887('[');
        expr$1278 = parseExpression$924();
        expect$887(']');
        return expr$1278;
    }
    function parseNewExpression$911() {
        var callee$1279, args$1280;
        expectKeyword$888('new');
        callee$1279 = parseLeftHandSideExpression$913();
        args$1280 = match$889('(') ? parseArguments$906() : [];
        return delegate$843.createNewExpression(callee$1279, args$1280);
    }
    function parseLeftHandSideExpressionAllowCall$912() {
        var expr$1281, args$1282, property$1283;
        expr$1281 = matchKeyword$890('new') ? parseNewExpression$911() : parsePrimaryExpression$905();
        while (match$889('.') || match$889('[') || match$889('(') || lookahead$846.type === Token$824.Template) {
            if (match$889('(')) {
                args$1282 = parseArguments$906();
                expr$1281 = delegate$843.createCallExpression(expr$1281, args$1282);
            } else if (match$889('[')) {
                expr$1281 = delegate$843.createMemberExpression('[', expr$1281, parseComputedMember$910());
            } else if (match$889('.')) {
                expr$1281 = delegate$843.createMemberExpression('.', expr$1281, parseNonComputedMember$909());
            } else {
                expr$1281 = delegate$843.createTaggedTemplateExpression(expr$1281, parseTemplateLiteral$903());
            }
        }
        return expr$1281;
    }
    function parseLeftHandSideExpression$913() {
        var expr$1284, property$1285;
        expr$1284 = matchKeyword$890('new') ? parseNewExpression$911() : parsePrimaryExpression$905();
        while (match$889('.') || match$889('[') || lookahead$846.type === Token$824.Template) {
            if (match$889('[')) {
                expr$1284 = delegate$843.createMemberExpression('[', expr$1284, parseComputedMember$910());
            } else if (match$889('.')) {
                expr$1284 = delegate$843.createMemberExpression('.', expr$1284, parseNonComputedMember$909());
            } else {
                expr$1284 = delegate$843.createTaggedTemplateExpression(expr$1284, parseTemplateLiteral$903());
            }
        }
        return expr$1284;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$914() {
        var expr$1286 = parseLeftHandSideExpressionAllowCall$912(), token$1287 = lookahead$846;
        if (lookahead$846.type !== Token$824.Punctuator) {
            return expr$1286;
        }
        if ((match$889('++') || match$889('--')) && !peekLineTerminator$883()) {
            // 11.3.1, 11.3.2
            if (strict$834 && expr$1286.type === Syntax$827.Identifier && isRestrictedWord$861(expr$1286.name)) {
                throwErrorTolerant$885({}, Messages$829.StrictLHSPostfix);
            }
            if (!isLeftHandSide$894(expr$1286)) {
                throwError$884({}, Messages$829.InvalidLHSInAssignment);
            }
            token$1287 = lex$880();
            expr$1286 = delegate$843.createPostfixExpression(token$1287.value, expr$1286);
        }
        return expr$1286;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$915() {
        var token$1288, expr$1289;
        if (lookahead$846.type !== Token$824.Punctuator && lookahead$846.type !== Token$824.Keyword) {
            return parsePostfixExpression$914();
        }
        if (match$889('++') || match$889('--')) {
            token$1288 = lex$880();
            expr$1289 = parseUnaryExpression$915();
            // 11.4.4, 11.4.5
            if (strict$834 && expr$1289.type === Syntax$827.Identifier && isRestrictedWord$861(expr$1289.name)) {
                throwErrorTolerant$885({}, Messages$829.StrictLHSPrefix);
            }
            if (!isLeftHandSide$894(expr$1289)) {
                throwError$884({}, Messages$829.InvalidLHSInAssignment);
            }
            return delegate$843.createUnaryExpression(token$1288.value, expr$1289);
        }
        if (match$889('+') || match$889('-') || match$889('~') || match$889('!')) {
            token$1288 = lex$880();
            expr$1289 = parseUnaryExpression$915();
            return delegate$843.createUnaryExpression(token$1288.value, expr$1289);
        }
        if (matchKeyword$890('delete') || matchKeyword$890('void') || matchKeyword$890('typeof')) {
            token$1288 = lex$880();
            expr$1289 = parseUnaryExpression$915();
            expr$1289 = delegate$843.createUnaryExpression(token$1288.value, expr$1289);
            if (strict$834 && expr$1289.operator === 'delete' && expr$1289.argument.type === Syntax$827.Identifier) {
                throwErrorTolerant$885({}, Messages$829.StrictDelete);
            }
            return expr$1289;
        }
        return parsePostfixExpression$914();
    }
    function binaryPrecedence$916(token$1290, allowIn$1291) {
        var prec$1292 = 0;
        if (token$1290.type !== Token$824.Punctuator && token$1290.type !== Token$824.Keyword) {
            return 0;
        }
        switch (token$1290.value) {
        case '||':
            prec$1292 = 1;
            break;
        case '&&':
            prec$1292 = 2;
            break;
        case '|':
            prec$1292 = 3;
            break;
        case '^':
            prec$1292 = 4;
            break;
        case '&':
            prec$1292 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1292 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1292 = 7;
            break;
        case 'in':
            prec$1292 = allowIn$1291 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1292 = 8;
            break;
        case '+':
        case '-':
            prec$1292 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1292 = 11;
            break;
        default:
            break;
        }
        return prec$1292;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$917() {
        var expr$1293, token$1294, prec$1295, previousAllowIn$1296, stack$1297, right$1298, operator$1299, left$1300, i$1301;
        previousAllowIn$1296 = state$848.allowIn;
        state$848.allowIn = true;
        expr$1293 = parseUnaryExpression$915();
        token$1294 = lookahead$846;
        prec$1295 = binaryPrecedence$916(token$1294, previousAllowIn$1296);
        if (prec$1295 === 0) {
            return expr$1293;
        }
        token$1294.prec = prec$1295;
        lex$880();
        stack$1297 = [
            expr$1293,
            token$1294,
            parseUnaryExpression$915()
        ];
        while ((prec$1295 = binaryPrecedence$916(lookahead$846, previousAllowIn$1296)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1297.length > 2 && prec$1295 <= stack$1297[stack$1297.length - 2].prec) {
                right$1298 = stack$1297.pop();
                operator$1299 = stack$1297.pop().value;
                left$1300 = stack$1297.pop();
                stack$1297.push(delegate$843.createBinaryExpression(operator$1299, left$1300, right$1298));
            }
            // Shift.
            token$1294 = lex$880();
            token$1294.prec = prec$1295;
            stack$1297.push(token$1294);
            stack$1297.push(parseUnaryExpression$915());
        }
        state$848.allowIn = previousAllowIn$1296;
        // Final reduce to clean-up the stack.
        i$1301 = stack$1297.length - 1;
        expr$1293 = stack$1297[i$1301];
        while (i$1301 > 1) {
            expr$1293 = delegate$843.createBinaryExpression(stack$1297[i$1301 - 1].value, stack$1297[i$1301 - 2], expr$1293);
            i$1301 -= 2;
        }
        return expr$1293;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$918() {
        var expr$1302, previousAllowIn$1303, consequent$1304, alternate$1305;
        expr$1302 = parseBinaryExpression$917();
        if (match$889('?')) {
            lex$880();
            previousAllowIn$1303 = state$848.allowIn;
            state$848.allowIn = true;
            consequent$1304 = parseAssignmentExpression$923();
            state$848.allowIn = previousAllowIn$1303;
            expect$887(':');
            alternate$1305 = parseAssignmentExpression$923();
            expr$1302 = delegate$843.createConditionalExpression(expr$1302, consequent$1304, alternate$1305);
        }
        return expr$1302;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$919(expr$1306) {
        var i$1307, len$1308, property$1309, element$1310;
        if (expr$1306.type === Syntax$827.ObjectExpression) {
            expr$1306.type = Syntax$827.ObjectPattern;
            for (i$1307 = 0, len$1308 = expr$1306.properties.length; i$1307 < len$1308; i$1307 += 1) {
                property$1309 = expr$1306.properties[i$1307];
                if (property$1309.kind !== 'init') {
                    throwError$884({}, Messages$829.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$919(property$1309.value);
            }
        } else if (expr$1306.type === Syntax$827.ArrayExpression) {
            expr$1306.type = Syntax$827.ArrayPattern;
            for (i$1307 = 0, len$1308 = expr$1306.elements.length; i$1307 < len$1308; i$1307 += 1) {
                element$1310 = expr$1306.elements[i$1307];
                if (element$1310) {
                    reinterpretAsAssignmentBindingPattern$919(element$1310);
                }
            }
        } else if (expr$1306.type === Syntax$827.Identifier) {
            if (isRestrictedWord$861(expr$1306.name)) {
                throwError$884({}, Messages$829.InvalidLHSInAssignment);
            }
        } else if (expr$1306.type === Syntax$827.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$919(expr$1306.argument);
            if (expr$1306.argument.type === Syntax$827.ObjectPattern) {
                throwError$884({}, Messages$829.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1306.type !== Syntax$827.MemberExpression && expr$1306.type !== Syntax$827.CallExpression && expr$1306.type !== Syntax$827.NewExpression) {
                throwError$884({}, Messages$829.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$920(options$1311, expr$1312) {
        var i$1313, len$1314, property$1315, element$1316;
        if (expr$1312.type === Syntax$827.ObjectExpression) {
            expr$1312.type = Syntax$827.ObjectPattern;
            for (i$1313 = 0, len$1314 = expr$1312.properties.length; i$1313 < len$1314; i$1313 += 1) {
                property$1315 = expr$1312.properties[i$1313];
                if (property$1315.kind !== 'init') {
                    throwError$884({}, Messages$829.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$920(options$1311, property$1315.value);
            }
        } else if (expr$1312.type === Syntax$827.ArrayExpression) {
            expr$1312.type = Syntax$827.ArrayPattern;
            for (i$1313 = 0, len$1314 = expr$1312.elements.length; i$1313 < len$1314; i$1313 += 1) {
                element$1316 = expr$1312.elements[i$1313];
                if (element$1316) {
                    reinterpretAsDestructuredParameter$920(options$1311, element$1316);
                }
            }
        } else if (expr$1312.type === Syntax$827.Identifier) {
            validateParam$958(options$1311, expr$1312, expr$1312.name);
        } else {
            if (expr$1312.type !== Syntax$827.MemberExpression) {
                throwError$884({}, Messages$829.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$921(expressions$1317) {
        var i$1318, len$1319, param$1320, params$1321, defaults$1322, defaultCount$1323, options$1324, rest$1325;
        params$1321 = [];
        defaults$1322 = [];
        defaultCount$1323 = 0;
        rest$1325 = null;
        options$1324 = { paramSet: {} };
        for (i$1318 = 0, len$1319 = expressions$1317.length; i$1318 < len$1319; i$1318 += 1) {
            param$1320 = expressions$1317[i$1318];
            if (param$1320.type === Syntax$827.Identifier) {
                params$1321.push(param$1320);
                defaults$1322.push(null);
                validateParam$958(options$1324, param$1320, param$1320.name);
            } else if (param$1320.type === Syntax$827.ObjectExpression || param$1320.type === Syntax$827.ArrayExpression) {
                reinterpretAsDestructuredParameter$920(options$1324, param$1320);
                params$1321.push(param$1320);
                defaults$1322.push(null);
            } else if (param$1320.type === Syntax$827.SpreadElement) {
                assert$850(i$1318 === len$1319 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$920(options$1324, param$1320.argument);
                rest$1325 = param$1320.argument;
            } else if (param$1320.type === Syntax$827.AssignmentExpression) {
                params$1321.push(param$1320.left);
                defaults$1322.push(param$1320.right);
                ++defaultCount$1323;
                validateParam$958(options$1324, param$1320.left, param$1320.left.name);
            } else {
                return null;
            }
        }
        if (options$1324.message === Messages$829.StrictParamDupe) {
            throwError$884(strict$834 ? options$1324.stricted : options$1324.firstRestricted, options$1324.message);
        }
        if (defaultCount$1323 === 0) {
            defaults$1322 = [];
        }
        return {
            params: params$1321,
            defaults: defaults$1322,
            rest: rest$1325,
            stricted: options$1324.stricted,
            firstRestricted: options$1324.firstRestricted,
            message: options$1324.message
        };
    }
    function parseArrowFunctionExpression$922(options$1326) {
        var previousStrict$1327, previousYieldAllowed$1328, body$1329;
        expect$887('=>');
        previousStrict$1327 = strict$834;
        previousYieldAllowed$1328 = state$848.yieldAllowed;
        state$848.yieldAllowed = false;
        body$1329 = parseConciseBody$956();
        if (strict$834 && options$1326.firstRestricted) {
            throwError$884(options$1326.firstRestricted, options$1326.message);
        }
        if (strict$834 && options$1326.stricted) {
            throwErrorTolerant$885(options$1326.stricted, options$1326.message);
        }
        strict$834 = previousStrict$1327;
        state$848.yieldAllowed = previousYieldAllowed$1328;
        return delegate$843.createArrowFunctionExpression(options$1326.params, options$1326.defaults, body$1329, options$1326.rest, body$1329.type !== Syntax$827.BlockStatement);
    }
    function parseAssignmentExpression$923() {
        var expr$1330, token$1331, params$1332, oldParenthesizedCount$1333;
        if (matchKeyword$890('yield')) {
            return parseYieldExpression$963();
        }
        oldParenthesizedCount$1333 = state$848.parenthesizedCount;
        if (match$889('(')) {
            token$1331 = lookahead2$882();
            if (token$1331.type === Token$824.Punctuator && token$1331.value === ')' || token$1331.value === '...') {
                params$1332 = parseParams$960();
                if (!match$889('=>')) {
                    throwUnexpected$886(lex$880());
                }
                return parseArrowFunctionExpression$922(params$1332);
            }
        }
        token$1331 = lookahead$846;
        expr$1330 = parseConditionalExpression$918();
        if (match$889('=>') && (state$848.parenthesizedCount === oldParenthesizedCount$1333 || state$848.parenthesizedCount === oldParenthesizedCount$1333 + 1)) {
            if (expr$1330.type === Syntax$827.Identifier) {
                params$1332 = reinterpretAsCoverFormalsList$921([expr$1330]);
            } else if (expr$1330.type === Syntax$827.SequenceExpression) {
                params$1332 = reinterpretAsCoverFormalsList$921(expr$1330.expressions);
            }
            if (params$1332) {
                return parseArrowFunctionExpression$922(params$1332);
            }
        }
        if (matchAssign$892()) {
            // 11.13.1
            if (strict$834 && expr$1330.type === Syntax$827.Identifier && isRestrictedWord$861(expr$1330.name)) {
                throwErrorTolerant$885(token$1331, Messages$829.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$889('=') && (expr$1330.type === Syntax$827.ObjectExpression || expr$1330.type === Syntax$827.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$919(expr$1330);
            } else if (!isLeftHandSide$894(expr$1330)) {
                throwError$884({}, Messages$829.InvalidLHSInAssignment);
            }
            expr$1330 = delegate$843.createAssignmentExpression(lex$880().value, expr$1330, parseAssignmentExpression$923());
        }
        return expr$1330;
    }
    // 11.14 Comma Operator
    function parseExpression$924() {
        var expr$1334, expressions$1335, sequence$1336, coverFormalsList$1337, spreadFound$1338, oldParenthesizedCount$1339;
        oldParenthesizedCount$1339 = state$848.parenthesizedCount;
        expr$1334 = parseAssignmentExpression$923();
        expressions$1335 = [expr$1334];
        if (match$889(',')) {
            while (streamIndex$845 < length$842) {
                if (!match$889(',')) {
                    break;
                }
                lex$880();
                expr$1334 = parseSpreadOrAssignmentExpression$907();
                expressions$1335.push(expr$1334);
                if (expr$1334.type === Syntax$827.SpreadElement) {
                    spreadFound$1338 = true;
                    if (!match$889(')')) {
                        throwError$884({}, Messages$829.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1336 = delegate$843.createSequenceExpression(expressions$1335);
        }
        if (match$889('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$848.parenthesizedCount === oldParenthesizedCount$1339 || state$848.parenthesizedCount === oldParenthesizedCount$1339 + 1) {
                expr$1334 = expr$1334.type === Syntax$827.SequenceExpression ? expr$1334.expressions : expressions$1335;
                coverFormalsList$1337 = reinterpretAsCoverFormalsList$921(expr$1334);
                if (coverFormalsList$1337) {
                    return parseArrowFunctionExpression$922(coverFormalsList$1337);
                }
            }
            throwUnexpected$886(lex$880());
        }
        if (spreadFound$1338 && lookahead2$882().value !== '=>') {
            throwError$884({}, Messages$829.IllegalSpread);
        }
        return sequence$1336 || expr$1334;
    }
    // 12.1 Block
    function parseStatementList$925() {
        var list$1340 = [], statement$1341;
        while (streamIndex$845 < length$842) {
            if (match$889('}')) {
                break;
            }
            statement$1341 = parseSourceElement$970();
            if (typeof statement$1341 === 'undefined') {
                break;
            }
            list$1340.push(statement$1341);
        }
        return list$1340;
    }
    function parseBlock$926() {
        var block$1342;
        expect$887('{');
        block$1342 = parseStatementList$925();
        expect$887('}');
        return delegate$843.createBlockStatement(block$1342);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$927() {
        var token$1343 = lookahead$846, resolvedIdent$1344;
        if (token$1343.type !== Token$824.Identifier) {
            throwUnexpected$886(token$1343);
        }
        resolvedIdent$1344 = expander$823.resolve(tokenStream$844[lookaheadIndex$847]);
        lex$880();
        return delegate$843.createIdentifier(resolvedIdent$1344);
    }
    function parseVariableDeclaration$928(kind$1345) {
        var id$1346, init$1347 = null;
        if (match$889('{')) {
            id$1346 = parseObjectInitialiser$901();
            reinterpretAsAssignmentBindingPattern$919(id$1346);
        } else if (match$889('[')) {
            id$1346 = parseArrayInitialiser$896();
            reinterpretAsAssignmentBindingPattern$919(id$1346);
        } else {
            id$1346 = state$848.allowKeyword ? parseNonComputedProperty$908() : parseVariableIdentifier$927();
            // 12.2.1
            if (strict$834 && isRestrictedWord$861(id$1346.name)) {
                throwErrorTolerant$885({}, Messages$829.StrictVarName);
            }
        }
        if (kind$1345 === 'const') {
            if (!match$889('=')) {
                throwError$884({}, Messages$829.NoUnintializedConst);
            }
            expect$887('=');
            init$1347 = parseAssignmentExpression$923();
        } else if (match$889('=')) {
            lex$880();
            init$1347 = parseAssignmentExpression$923();
        }
        return delegate$843.createVariableDeclarator(id$1346, init$1347);
    }
    function parseVariableDeclarationList$929(kind$1348) {
        var list$1349 = [];
        do {
            list$1349.push(parseVariableDeclaration$928(kind$1348));
            if (!match$889(',')) {
                break;
            }
            lex$880();
        } while (streamIndex$845 < length$842);
        return list$1349;
    }
    function parseVariableStatement$930() {
        var declarations$1350;
        expectKeyword$888('var');
        declarations$1350 = parseVariableDeclarationList$929();
        consumeSemicolon$893();
        return delegate$843.createVariableDeclaration(declarations$1350, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$931(kind$1351) {
        var declarations$1352;
        expectKeyword$888(kind$1351);
        declarations$1352 = parseVariableDeclarationList$929(kind$1351);
        consumeSemicolon$893();
        return delegate$843.createVariableDeclaration(declarations$1352, kind$1351);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$932() {
        var id$1353, src$1354, body$1355;
        lex$880();
        // 'module'
        if (peekLineTerminator$883()) {
            throwError$884({}, Messages$829.NewlineAfterModule);
        }
        switch (lookahead$846.type) {
        case Token$824.StringLiteral:
            id$1353 = parsePrimaryExpression$905();
            body$1355 = parseModuleBlock$975();
            src$1354 = null;
            break;
        case Token$824.Identifier:
            id$1353 = parseVariableIdentifier$927();
            body$1355 = null;
            if (!matchContextualKeyword$891('from')) {
                throwUnexpected$886(lex$880());
            }
            lex$880();
            src$1354 = parsePrimaryExpression$905();
            if (src$1354.type !== Syntax$827.Literal) {
                throwError$884({}, Messages$829.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$893();
        return delegate$843.createModuleDeclaration(id$1353, src$1354, body$1355);
    }
    function parseExportBatchSpecifier$933() {
        expect$887('*');
        return delegate$843.createExportBatchSpecifier();
    }
    function parseExportSpecifier$934() {
        var id$1356, name$1357 = null;
        id$1356 = parseVariableIdentifier$927();
        if (matchContextualKeyword$891('as')) {
            lex$880();
            name$1357 = parseNonComputedProperty$908();
        }
        return delegate$843.createExportSpecifier(id$1356, name$1357);
    }
    function parseExportDeclaration$935() {
        var previousAllowKeyword$1358, decl$1359, def$1360, src$1361, specifiers$1362;
        expectKeyword$888('export');
        if (lookahead$846.type === Token$824.Keyword) {
            switch (lookahead$846.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$843.createExportDeclaration(parseSourceElement$970(), null, null);
            }
        }
        if (isIdentifierName$877(lookahead$846)) {
            previousAllowKeyword$1358 = state$848.allowKeyword;
            state$848.allowKeyword = true;
            decl$1359 = parseVariableDeclarationList$929('let');
            state$848.allowKeyword = previousAllowKeyword$1358;
            return delegate$843.createExportDeclaration(decl$1359, null, null);
        }
        specifiers$1362 = [];
        src$1361 = null;
        if (match$889('*')) {
            specifiers$1362.push(parseExportBatchSpecifier$933());
        } else {
            expect$887('{');
            do {
                specifiers$1362.push(parseExportSpecifier$934());
            } while (match$889(',') && lex$880());
            expect$887('}');
        }
        if (matchContextualKeyword$891('from')) {
            lex$880();
            src$1361 = parsePrimaryExpression$905();
            if (src$1361.type !== Syntax$827.Literal) {
                throwError$884({}, Messages$829.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$893();
        return delegate$843.createExportDeclaration(null, specifiers$1362, src$1361);
    }
    function parseImportDeclaration$936() {
        var specifiers$1363, kind$1364, src$1365;
        expectKeyword$888('import');
        specifiers$1363 = [];
        if (isIdentifierName$877(lookahead$846)) {
            kind$1364 = 'default';
            specifiers$1363.push(parseImportSpecifier$937());
            if (!matchContextualKeyword$891('from')) {
                throwError$884({}, Messages$829.NoFromAfterImport);
            }
            lex$880();
        } else if (match$889('{')) {
            kind$1364 = 'named';
            lex$880();
            do {
                specifiers$1363.push(parseImportSpecifier$937());
            } while (match$889(',') && lex$880());
            expect$887('}');
            if (!matchContextualKeyword$891('from')) {
                throwError$884({}, Messages$829.NoFromAfterImport);
            }
            lex$880();
        }
        src$1365 = parsePrimaryExpression$905();
        if (src$1365.type !== Syntax$827.Literal) {
            throwError$884({}, Messages$829.InvalidModuleSpecifier);
        }
        consumeSemicolon$893();
        return delegate$843.createImportDeclaration(specifiers$1363, kind$1364, src$1365);
    }
    function parseImportSpecifier$937() {
        var id$1366, name$1367 = null;
        id$1366 = parseNonComputedProperty$908();
        if (matchContextualKeyword$891('as')) {
            lex$880();
            name$1367 = parseVariableIdentifier$927();
        }
        return delegate$843.createImportSpecifier(id$1366, name$1367);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$938() {
        expect$887(';');
        return delegate$843.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$939() {
        var expr$1368 = parseExpression$924();
        consumeSemicolon$893();
        return delegate$843.createExpressionStatement(expr$1368);
    }
    // 12.5 If statement
    function parseIfStatement$940() {
        var test$1369, consequent$1370, alternate$1371;
        expectKeyword$888('if');
        expect$887('(');
        test$1369 = parseExpression$924();
        expect$887(')');
        consequent$1370 = parseStatement$955();
        if (matchKeyword$890('else')) {
            lex$880();
            alternate$1371 = parseStatement$955();
        } else {
            alternate$1371 = null;
        }
        return delegate$843.createIfStatement(test$1369, consequent$1370, alternate$1371);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$941() {
        var body$1372, test$1373, oldInIteration$1374;
        expectKeyword$888('do');
        oldInIteration$1374 = state$848.inIteration;
        state$848.inIteration = true;
        body$1372 = parseStatement$955();
        state$848.inIteration = oldInIteration$1374;
        expectKeyword$888('while');
        expect$887('(');
        test$1373 = parseExpression$924();
        expect$887(')');
        if (match$889(';')) {
            lex$880();
        }
        return delegate$843.createDoWhileStatement(body$1372, test$1373);
    }
    function parseWhileStatement$942() {
        var test$1375, body$1376, oldInIteration$1377;
        expectKeyword$888('while');
        expect$887('(');
        test$1375 = parseExpression$924();
        expect$887(')');
        oldInIteration$1377 = state$848.inIteration;
        state$848.inIteration = true;
        body$1376 = parseStatement$955();
        state$848.inIteration = oldInIteration$1377;
        return delegate$843.createWhileStatement(test$1375, body$1376);
    }
    function parseForVariableDeclaration$943() {
        var token$1378 = lex$880(), declarations$1379 = parseVariableDeclarationList$929();
        return delegate$843.createVariableDeclaration(declarations$1379, token$1378.value);
    }
    function parseForStatement$944(opts$1380) {
        var init$1381, test$1382, update$1383, left$1384, right$1385, body$1386, operator$1387, oldInIteration$1388;
        init$1381 = test$1382 = update$1383 = null;
        expectKeyword$888('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$891('each')) {
            throwError$884({}, Messages$829.EachNotAllowed);
        }
        expect$887('(');
        if (match$889(';')) {
            lex$880();
        } else {
            if (matchKeyword$890('var') || matchKeyword$890('let') || matchKeyword$890('const')) {
                state$848.allowIn = false;
                init$1381 = parseForVariableDeclaration$943();
                state$848.allowIn = true;
                if (init$1381.declarations.length === 1) {
                    if (matchKeyword$890('in') || matchContextualKeyword$891('of')) {
                        operator$1387 = lookahead$846;
                        if (!((operator$1387.value === 'in' || init$1381.kind !== 'var') && init$1381.declarations[0].init)) {
                            lex$880();
                            left$1384 = init$1381;
                            right$1385 = parseExpression$924();
                            init$1381 = null;
                        }
                    }
                }
            } else {
                state$848.allowIn = false;
                init$1381 = parseExpression$924();
                state$848.allowIn = true;
                if (matchContextualKeyword$891('of')) {
                    operator$1387 = lex$880();
                    left$1384 = init$1381;
                    right$1385 = parseExpression$924();
                    init$1381 = null;
                } else if (matchKeyword$890('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$895(init$1381)) {
                        throwError$884({}, Messages$829.InvalidLHSInForIn);
                    }
                    operator$1387 = lex$880();
                    left$1384 = init$1381;
                    right$1385 = parseExpression$924();
                    init$1381 = null;
                }
            }
            if (typeof left$1384 === 'undefined') {
                expect$887(';');
            }
        }
        if (typeof left$1384 === 'undefined') {
            if (!match$889(';')) {
                test$1382 = parseExpression$924();
            }
            expect$887(';');
            if (!match$889(')')) {
                update$1383 = parseExpression$924();
            }
        }
        expect$887(')');
        oldInIteration$1388 = state$848.inIteration;
        state$848.inIteration = true;
        if (!(opts$1380 !== undefined && opts$1380.ignoreBody)) {
            body$1386 = parseStatement$955();
        }
        state$848.inIteration = oldInIteration$1388;
        if (typeof left$1384 === 'undefined') {
            return delegate$843.createForStatement(init$1381, test$1382, update$1383, body$1386);
        }
        if (operator$1387.value === 'in') {
            return delegate$843.createForInStatement(left$1384, right$1385, body$1386);
        }
        return delegate$843.createForOfStatement(left$1384, right$1385, body$1386);
    }
    // 12.7 The continue statement
    function parseContinueStatement$945() {
        var label$1389 = null, key$1390;
        expectKeyword$888('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$846.value.charCodeAt(0) === 59) {
            lex$880();
            if (!state$848.inIteration) {
                throwError$884({}, Messages$829.IllegalContinue);
            }
            return delegate$843.createContinueStatement(null);
        }
        if (peekLineTerminator$883()) {
            if (!state$848.inIteration) {
                throwError$884({}, Messages$829.IllegalContinue);
            }
            return delegate$843.createContinueStatement(null);
        }
        if (lookahead$846.type === Token$824.Identifier) {
            label$1389 = parseVariableIdentifier$927();
            key$1390 = '$' + label$1389.name;
            if (!Object.prototype.hasOwnProperty.call(state$848.labelSet, key$1390)) {
                throwError$884({}, Messages$829.UnknownLabel, label$1389.name);
            }
        }
        consumeSemicolon$893();
        if (label$1389 === null && !state$848.inIteration) {
            throwError$884({}, Messages$829.IllegalContinue);
        }
        return delegate$843.createContinueStatement(label$1389);
    }
    // 12.8 The break statement
    function parseBreakStatement$946() {
        var label$1391 = null, key$1392;
        expectKeyword$888('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$846.value.charCodeAt(0) === 59) {
            lex$880();
            if (!(state$848.inIteration || state$848.inSwitch)) {
                throwError$884({}, Messages$829.IllegalBreak);
            }
            return delegate$843.createBreakStatement(null);
        }
        if (peekLineTerminator$883()) {
            if (!(state$848.inIteration || state$848.inSwitch)) {
                throwError$884({}, Messages$829.IllegalBreak);
            }
            return delegate$843.createBreakStatement(null);
        }
        if (lookahead$846.type === Token$824.Identifier) {
            label$1391 = parseVariableIdentifier$927();
            key$1392 = '$' + label$1391.name;
            if (!Object.prototype.hasOwnProperty.call(state$848.labelSet, key$1392)) {
                throwError$884({}, Messages$829.UnknownLabel, label$1391.name);
            }
        }
        consumeSemicolon$893();
        if (label$1391 === null && !(state$848.inIteration || state$848.inSwitch)) {
            throwError$884({}, Messages$829.IllegalBreak);
        }
        return delegate$843.createBreakStatement(label$1391);
    }
    // 12.9 The return statement
    function parseReturnStatement$947() {
        var argument$1393 = null;
        expectKeyword$888('return');
        if (!state$848.inFunctionBody) {
            throwErrorTolerant$885({}, Messages$829.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$857(String(lookahead$846.value).charCodeAt(0))) {
            argument$1393 = parseExpression$924();
            consumeSemicolon$893();
            return delegate$843.createReturnStatement(argument$1393);
        }
        if (peekLineTerminator$883()) {
            return delegate$843.createReturnStatement(null);
        }
        if (!match$889(';')) {
            if (!match$889('}') && lookahead$846.type !== Token$824.EOF) {
                argument$1393 = parseExpression$924();
            }
        }
        consumeSemicolon$893();
        return delegate$843.createReturnStatement(argument$1393);
    }
    // 12.10 The with statement
    function parseWithStatement$948() {
        var object$1394, body$1395;
        if (strict$834) {
            throwErrorTolerant$885({}, Messages$829.StrictModeWith);
        }
        expectKeyword$888('with');
        expect$887('(');
        object$1394 = parseExpression$924();
        expect$887(')');
        body$1395 = parseStatement$955();
        return delegate$843.createWithStatement(object$1394, body$1395);
    }
    // 12.10 The swith statement
    function parseSwitchCase$949() {
        var test$1396, consequent$1397 = [], sourceElement$1398;
        if (matchKeyword$890('default')) {
            lex$880();
            test$1396 = null;
        } else {
            expectKeyword$888('case');
            test$1396 = parseExpression$924();
        }
        expect$887(':');
        while (streamIndex$845 < length$842) {
            if (match$889('}') || matchKeyword$890('default') || matchKeyword$890('case')) {
                break;
            }
            sourceElement$1398 = parseSourceElement$970();
            if (typeof sourceElement$1398 === 'undefined') {
                break;
            }
            consequent$1397.push(sourceElement$1398);
        }
        return delegate$843.createSwitchCase(test$1396, consequent$1397);
    }
    function parseSwitchStatement$950() {
        var discriminant$1399, cases$1400, clause$1401, oldInSwitch$1402, defaultFound$1403;
        expectKeyword$888('switch');
        expect$887('(');
        discriminant$1399 = parseExpression$924();
        expect$887(')');
        expect$887('{');
        cases$1400 = [];
        if (match$889('}')) {
            lex$880();
            return delegate$843.createSwitchStatement(discriminant$1399, cases$1400);
        }
        oldInSwitch$1402 = state$848.inSwitch;
        state$848.inSwitch = true;
        defaultFound$1403 = false;
        while (streamIndex$845 < length$842) {
            if (match$889('}')) {
                break;
            }
            clause$1401 = parseSwitchCase$949();
            if (clause$1401.test === null) {
                if (defaultFound$1403) {
                    throwError$884({}, Messages$829.MultipleDefaultsInSwitch);
                }
                defaultFound$1403 = true;
            }
            cases$1400.push(clause$1401);
        }
        state$848.inSwitch = oldInSwitch$1402;
        expect$887('}');
        return delegate$843.createSwitchStatement(discriminant$1399, cases$1400);
    }
    // 12.13 The throw statement
    function parseThrowStatement$951() {
        var argument$1404;
        expectKeyword$888('throw');
        if (peekLineTerminator$883()) {
            throwError$884({}, Messages$829.NewlineAfterThrow);
        }
        argument$1404 = parseExpression$924();
        consumeSemicolon$893();
        return delegate$843.createThrowStatement(argument$1404);
    }
    // 12.14 The try statement
    function parseCatchClause$952() {
        var param$1405, body$1406;
        expectKeyword$888('catch');
        expect$887('(');
        if (match$889(')')) {
            throwUnexpected$886(lookahead$846);
        }
        param$1405 = parseExpression$924();
        // 12.14.1
        if (strict$834 && param$1405.type === Syntax$827.Identifier && isRestrictedWord$861(param$1405.name)) {
            throwErrorTolerant$885({}, Messages$829.StrictCatchVariable);
        }
        expect$887(')');
        body$1406 = parseBlock$926();
        return delegate$843.createCatchClause(param$1405, body$1406);
    }
    function parseTryStatement$953() {
        var block$1407, handlers$1408 = [], finalizer$1409 = null;
        expectKeyword$888('try');
        block$1407 = parseBlock$926();
        if (matchKeyword$890('catch')) {
            handlers$1408.push(parseCatchClause$952());
        }
        if (matchKeyword$890('finally')) {
            lex$880();
            finalizer$1409 = parseBlock$926();
        }
        if (handlers$1408.length === 0 && !finalizer$1409) {
            throwError$884({}, Messages$829.NoCatchOrFinally);
        }
        return delegate$843.createTryStatement(block$1407, [], handlers$1408, finalizer$1409);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$954() {
        expectKeyword$888('debugger');
        consumeSemicolon$893();
        return delegate$843.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$955() {
        var type$1410 = lookahead$846.type, expr$1411, labeledBody$1412, key$1413;
        if (type$1410 === Token$824.EOF) {
            throwUnexpected$886(lookahead$846);
        }
        if (type$1410 === Token$824.Punctuator) {
            switch (lookahead$846.value) {
            case ';':
                return parseEmptyStatement$938();
            case '{':
                return parseBlock$926();
            case '(':
                return parseExpressionStatement$939();
            default:
                break;
            }
        }
        if (type$1410 === Token$824.Keyword) {
            switch (lookahead$846.value) {
            case 'break':
                return parseBreakStatement$946();
            case 'continue':
                return parseContinueStatement$945();
            case 'debugger':
                return parseDebuggerStatement$954();
            case 'do':
                return parseDoWhileStatement$941();
            case 'for':
                return parseForStatement$944();
            case 'function':
                return parseFunctionDeclaration$961();
            case 'class':
                return parseClassDeclaration$968();
            case 'if':
                return parseIfStatement$940();
            case 'return':
                return parseReturnStatement$947();
            case 'switch':
                return parseSwitchStatement$950();
            case 'throw':
                return parseThrowStatement$951();
            case 'try':
                return parseTryStatement$953();
            case 'var':
                return parseVariableStatement$930();
            case 'while':
                return parseWhileStatement$942();
            case 'with':
                return parseWithStatement$948();
            default:
                break;
            }
        }
        expr$1411 = parseExpression$924();
        // 12.12 Labelled Statements
        if (expr$1411.type === Syntax$827.Identifier && match$889(':')) {
            lex$880();
            key$1413 = '$' + expr$1411.name;
            if (Object.prototype.hasOwnProperty.call(state$848.labelSet, key$1413)) {
                throwError$884({}, Messages$829.Redeclaration, 'Label', expr$1411.name);
            }
            state$848.labelSet[key$1413] = true;
            labeledBody$1412 = parseStatement$955();
            delete state$848.labelSet[key$1413];
            return delegate$843.createLabeledStatement(expr$1411, labeledBody$1412);
        }
        consumeSemicolon$893();
        return delegate$843.createExpressionStatement(expr$1411);
    }
    // 13 Function Definition
    function parseConciseBody$956() {
        if (match$889('{')) {
            return parseFunctionSourceElements$957();
        }
        return parseAssignmentExpression$923();
    }
    function parseFunctionSourceElements$957() {
        var sourceElement$1414, sourceElements$1415 = [], token$1416, directive$1417, firstRestricted$1418, oldLabelSet$1419, oldInIteration$1420, oldInSwitch$1421, oldInFunctionBody$1422, oldParenthesizedCount$1423;
        expect$887('{');
        while (streamIndex$845 < length$842) {
            if (lookahead$846.type !== Token$824.StringLiteral) {
                break;
            }
            token$1416 = lookahead$846;
            sourceElement$1414 = parseSourceElement$970();
            sourceElements$1415.push(sourceElement$1414);
            if (sourceElement$1414.expression.type !== Syntax$827.Literal) {
                // this is not directive
                break;
            }
            directive$1417 = token$1416.value;
            if (directive$1417 === 'use strict') {
                strict$834 = true;
                if (firstRestricted$1418) {
                    throwErrorTolerant$885(firstRestricted$1418, Messages$829.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1418 && token$1416.octal) {
                    firstRestricted$1418 = token$1416;
                }
            }
        }
        oldLabelSet$1419 = state$848.labelSet;
        oldInIteration$1420 = state$848.inIteration;
        oldInSwitch$1421 = state$848.inSwitch;
        oldInFunctionBody$1422 = state$848.inFunctionBody;
        oldParenthesizedCount$1423 = state$848.parenthesizedCount;
        state$848.labelSet = {};
        state$848.inIteration = false;
        state$848.inSwitch = false;
        state$848.inFunctionBody = true;
        state$848.parenthesizedCount = 0;
        while (streamIndex$845 < length$842) {
            if (match$889('}')) {
                break;
            }
            sourceElement$1414 = parseSourceElement$970();
            if (typeof sourceElement$1414 === 'undefined') {
                break;
            }
            sourceElements$1415.push(sourceElement$1414);
        }
        expect$887('}');
        state$848.labelSet = oldLabelSet$1419;
        state$848.inIteration = oldInIteration$1420;
        state$848.inSwitch = oldInSwitch$1421;
        state$848.inFunctionBody = oldInFunctionBody$1422;
        state$848.parenthesizedCount = oldParenthesizedCount$1423;
        return delegate$843.createBlockStatement(sourceElements$1415);
    }
    function validateParam$958(options$1424, param$1425, name$1426) {
        var key$1427 = '$' + name$1426;
        if (strict$834) {
            if (isRestrictedWord$861(name$1426)) {
                options$1424.stricted = param$1425;
                options$1424.message = Messages$829.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1424.paramSet, key$1427)) {
                options$1424.stricted = param$1425;
                options$1424.message = Messages$829.StrictParamDupe;
            }
        } else if (!options$1424.firstRestricted) {
            if (isRestrictedWord$861(name$1426)) {
                options$1424.firstRestricted = param$1425;
                options$1424.message = Messages$829.StrictParamName;
            } else if (isStrictModeReservedWord$860(name$1426)) {
                options$1424.firstRestricted = param$1425;
                options$1424.message = Messages$829.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1424.paramSet, key$1427)) {
                options$1424.firstRestricted = param$1425;
                options$1424.message = Messages$829.StrictParamDupe;
            }
        }
        options$1424.paramSet[key$1427] = true;
    }
    function parseParam$959(options$1428) {
        var token$1429, rest$1430, param$1431, def$1432;
        token$1429 = lookahead$846;
        if (token$1429.value === '...') {
            token$1429 = lex$880();
            rest$1430 = true;
        }
        if (match$889('[')) {
            param$1431 = parseArrayInitialiser$896();
            reinterpretAsDestructuredParameter$920(options$1428, param$1431);
        } else if (match$889('{')) {
            if (rest$1430) {
                throwError$884({}, Messages$829.ObjectPatternAsRestParameter);
            }
            param$1431 = parseObjectInitialiser$901();
            reinterpretAsDestructuredParameter$920(options$1428, param$1431);
        } else {
            param$1431 = parseVariableIdentifier$927();
            validateParam$958(options$1428, token$1429, token$1429.value);
            if (match$889('=')) {
                if (rest$1430) {
                    throwErrorTolerant$885(lookahead$846, Messages$829.DefaultRestParameter);
                }
                lex$880();
                def$1432 = parseAssignmentExpression$923();
                ++options$1428.defaultCount;
            }
        }
        if (rest$1430) {
            if (!match$889(')')) {
                throwError$884({}, Messages$829.ParameterAfterRestParameter);
            }
            options$1428.rest = param$1431;
            return false;
        }
        options$1428.params.push(param$1431);
        options$1428.defaults.push(def$1432);
        return !match$889(')');
    }
    function parseParams$960(firstRestricted$1433) {
        var options$1434;
        options$1434 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1433
        };
        expect$887('(');
        if (!match$889(')')) {
            options$1434.paramSet = {};
            while (streamIndex$845 < length$842) {
                if (!parseParam$959(options$1434)) {
                    break;
                }
                expect$887(',');
            }
        }
        expect$887(')');
        if (options$1434.defaultCount === 0) {
            options$1434.defaults = [];
        }
        return options$1434;
    }
    function parseFunctionDeclaration$961() {
        var id$1435, body$1436, token$1437, tmp$1438, firstRestricted$1439, message$1440, previousStrict$1441, previousYieldAllowed$1442, generator$1443, expression$1444;
        expectKeyword$888('function');
        generator$1443 = false;
        if (match$889('*')) {
            lex$880();
            generator$1443 = true;
        }
        token$1437 = lookahead$846;
        id$1435 = parseVariableIdentifier$927();
        if (strict$834) {
            if (isRestrictedWord$861(token$1437.value)) {
                throwErrorTolerant$885(token$1437, Messages$829.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$861(token$1437.value)) {
                firstRestricted$1439 = token$1437;
                message$1440 = Messages$829.StrictFunctionName;
            } else if (isStrictModeReservedWord$860(token$1437.value)) {
                firstRestricted$1439 = token$1437;
                message$1440 = Messages$829.StrictReservedWord;
            }
        }
        tmp$1438 = parseParams$960(firstRestricted$1439);
        firstRestricted$1439 = tmp$1438.firstRestricted;
        if (tmp$1438.message) {
            message$1440 = tmp$1438.message;
        }
        previousStrict$1441 = strict$834;
        previousYieldAllowed$1442 = state$848.yieldAllowed;
        state$848.yieldAllowed = generator$1443;
        // here we redo some work in order to set 'expression'
        expression$1444 = !match$889('{');
        body$1436 = parseConciseBody$956();
        if (strict$834 && firstRestricted$1439) {
            throwError$884(firstRestricted$1439, message$1440);
        }
        if (strict$834 && tmp$1438.stricted) {
            throwErrorTolerant$885(tmp$1438.stricted, message$1440);
        }
        if (state$848.yieldAllowed && !state$848.yieldFound) {
            throwErrorTolerant$885({}, Messages$829.NoYieldInGenerator);
        }
        strict$834 = previousStrict$1441;
        state$848.yieldAllowed = previousYieldAllowed$1442;
        return delegate$843.createFunctionDeclaration(id$1435, tmp$1438.params, tmp$1438.defaults, body$1436, tmp$1438.rest, generator$1443, expression$1444);
    }
    function parseFunctionExpression$962() {
        var token$1445, id$1446 = null, firstRestricted$1447, message$1448, tmp$1449, body$1450, previousStrict$1451, previousYieldAllowed$1452, generator$1453, expression$1454;
        expectKeyword$888('function');
        generator$1453 = false;
        if (match$889('*')) {
            lex$880();
            generator$1453 = true;
        }
        if (!match$889('(')) {
            token$1445 = lookahead$846;
            id$1446 = parseVariableIdentifier$927();
            if (strict$834) {
                if (isRestrictedWord$861(token$1445.value)) {
                    throwErrorTolerant$885(token$1445, Messages$829.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$861(token$1445.value)) {
                    firstRestricted$1447 = token$1445;
                    message$1448 = Messages$829.StrictFunctionName;
                } else if (isStrictModeReservedWord$860(token$1445.value)) {
                    firstRestricted$1447 = token$1445;
                    message$1448 = Messages$829.StrictReservedWord;
                }
            }
        }
        tmp$1449 = parseParams$960(firstRestricted$1447);
        firstRestricted$1447 = tmp$1449.firstRestricted;
        if (tmp$1449.message) {
            message$1448 = tmp$1449.message;
        }
        previousStrict$1451 = strict$834;
        previousYieldAllowed$1452 = state$848.yieldAllowed;
        state$848.yieldAllowed = generator$1453;
        // here we redo some work in order to set 'expression'
        expression$1454 = !match$889('{');
        body$1450 = parseConciseBody$956();
        if (strict$834 && firstRestricted$1447) {
            throwError$884(firstRestricted$1447, message$1448);
        }
        if (strict$834 && tmp$1449.stricted) {
            throwErrorTolerant$885(tmp$1449.stricted, message$1448);
        }
        if (state$848.yieldAllowed && !state$848.yieldFound) {
            throwErrorTolerant$885({}, Messages$829.NoYieldInGenerator);
        }
        strict$834 = previousStrict$1451;
        state$848.yieldAllowed = previousYieldAllowed$1452;
        return delegate$843.createFunctionExpression(id$1446, tmp$1449.params, tmp$1449.defaults, body$1450, tmp$1449.rest, generator$1453, expression$1454);
    }
    function parseYieldExpression$963() {
        var delegateFlag$1455, expr$1456, previousYieldAllowed$1457;
        expectKeyword$888('yield');
        if (!state$848.yieldAllowed) {
            throwErrorTolerant$885({}, Messages$829.IllegalYield);
        }
        delegateFlag$1455 = false;
        if (match$889('*')) {
            lex$880();
            delegateFlag$1455 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1457 = state$848.yieldAllowed;
        state$848.yieldAllowed = false;
        expr$1456 = parseAssignmentExpression$923();
        state$848.yieldAllowed = previousYieldAllowed$1457;
        state$848.yieldFound = true;
        return delegate$843.createYieldExpression(expr$1456, delegateFlag$1455);
    }
    // 14 Classes
    function parseMethodDefinition$964(existingPropNames$1458) {
        var token$1459, key$1460, param$1461, propType$1462, isValidDuplicateProp$1463 = false;
        if (lookahead$846.value === 'static') {
            propType$1462 = ClassPropertyType$832.static;
            lex$880();
        } else {
            propType$1462 = ClassPropertyType$832.prototype;
        }
        if (match$889('*')) {
            lex$880();
            return delegate$843.createMethodDefinition(propType$1462, '', parseObjectPropertyKey$899(), parsePropertyMethodFunction$898({ generator: true }));
        }
        token$1459 = lookahead$846;
        key$1460 = parseObjectPropertyKey$899();
        if (token$1459.value === 'get' && !match$889('(')) {
            key$1460 = parseObjectPropertyKey$899();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1458[propType$1462].hasOwnProperty(key$1460.name)) {
                isValidDuplicateProp$1463 = existingPropNames$1458[propType$1462][key$1460.name].get === undefined && existingPropNames$1458[propType$1462][key$1460.name].data === undefined && existingPropNames$1458[propType$1462][key$1460.name].set !== undefined;
                if (!isValidDuplicateProp$1463) {
                    throwError$884(key$1460, Messages$829.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1458[propType$1462][key$1460.name] = {};
            }
            existingPropNames$1458[propType$1462][key$1460.name].get = true;
            expect$887('(');
            expect$887(')');
            return delegate$843.createMethodDefinition(propType$1462, 'get', key$1460, parsePropertyFunction$897({ generator: false }));
        }
        if (token$1459.value === 'set' && !match$889('(')) {
            key$1460 = parseObjectPropertyKey$899();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1458[propType$1462].hasOwnProperty(key$1460.name)) {
                isValidDuplicateProp$1463 = existingPropNames$1458[propType$1462][key$1460.name].set === undefined && existingPropNames$1458[propType$1462][key$1460.name].data === undefined && existingPropNames$1458[propType$1462][key$1460.name].get !== undefined;
                if (!isValidDuplicateProp$1463) {
                    throwError$884(key$1460, Messages$829.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1458[propType$1462][key$1460.name] = {};
            }
            existingPropNames$1458[propType$1462][key$1460.name].set = true;
            expect$887('(');
            token$1459 = lookahead$846;
            param$1461 = [parseVariableIdentifier$927()];
            expect$887(')');
            return delegate$843.createMethodDefinition(propType$1462, 'set', key$1460, parsePropertyFunction$897({
                params: param$1461,
                generator: false,
                name: token$1459
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1458[propType$1462].hasOwnProperty(key$1460.name)) {
            throwError$884(key$1460, Messages$829.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1458[propType$1462][key$1460.name] = {};
        }
        existingPropNames$1458[propType$1462][key$1460.name].data = true;
        return delegate$843.createMethodDefinition(propType$1462, '', key$1460, parsePropertyMethodFunction$898({ generator: false }));
    }
    function parseClassElement$965(existingProps$1464) {
        if (match$889(';')) {
            lex$880();
            return;
        }
        return parseMethodDefinition$964(existingProps$1464);
    }
    function parseClassBody$966() {
        var classElement$1465, classElements$1466 = [], existingProps$1467 = {};
        existingProps$1467[ClassPropertyType$832.static] = {};
        existingProps$1467[ClassPropertyType$832.prototype] = {};
        expect$887('{');
        while (streamIndex$845 < length$842) {
            if (match$889('}')) {
                break;
            }
            classElement$1465 = parseClassElement$965(existingProps$1467);
            if (typeof classElement$1465 !== 'undefined') {
                classElements$1466.push(classElement$1465);
            }
        }
        expect$887('}');
        return delegate$843.createClassBody(classElements$1466);
    }
    function parseClassExpression$967() {
        var id$1468, previousYieldAllowed$1469, superClass$1470 = null;
        expectKeyword$888('class');
        if (!matchKeyword$890('extends') && !match$889('{')) {
            id$1468 = parseVariableIdentifier$927();
        }
        if (matchKeyword$890('extends')) {
            expectKeyword$888('extends');
            previousYieldAllowed$1469 = state$848.yieldAllowed;
            state$848.yieldAllowed = false;
            superClass$1470 = parseAssignmentExpression$923();
            state$848.yieldAllowed = previousYieldAllowed$1469;
        }
        return delegate$843.createClassExpression(id$1468, superClass$1470, parseClassBody$966());
    }
    function parseClassDeclaration$968() {
        var id$1471, previousYieldAllowed$1472, superClass$1473 = null;
        expectKeyword$888('class');
        id$1471 = parseVariableIdentifier$927();
        if (matchKeyword$890('extends')) {
            expectKeyword$888('extends');
            previousYieldAllowed$1472 = state$848.yieldAllowed;
            state$848.yieldAllowed = false;
            superClass$1473 = parseAssignmentExpression$923();
            state$848.yieldAllowed = previousYieldAllowed$1472;
        }
        return delegate$843.createClassDeclaration(id$1471, superClass$1473, parseClassBody$966());
    }
    // 15 Program
    function matchModuleDeclaration$969() {
        var id$1474;
        if (matchContextualKeyword$891('module')) {
            id$1474 = lookahead2$882();
            return id$1474.type === Token$824.StringLiteral || id$1474.type === Token$824.Identifier;
        }
        return false;
    }
    function parseSourceElement$970() {
        if (lookahead$846.type === Token$824.Keyword) {
            switch (lookahead$846.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$931(lookahead$846.value);
            case 'function':
                return parseFunctionDeclaration$961();
            case 'export':
                return parseExportDeclaration$935();
            case 'import':
                return parseImportDeclaration$936();
            default:
                return parseStatement$955();
            }
        }
        if (matchModuleDeclaration$969()) {
            throwError$884({}, Messages$829.NestedModule);
        }
        if (lookahead$846.type !== Token$824.EOF) {
            return parseStatement$955();
        }
    }
    function parseProgramElement$971() {
        if (lookahead$846.type === Token$824.Keyword) {
            switch (lookahead$846.value) {
            case 'export':
                return parseExportDeclaration$935();
            case 'import':
                return parseImportDeclaration$936();
            }
        }
        if (matchModuleDeclaration$969()) {
            return parseModuleDeclaration$932();
        }
        return parseSourceElement$970();
    }
    function parseProgramElements$972() {
        var sourceElement$1475, sourceElements$1476 = [], token$1477, directive$1478, firstRestricted$1479;
        while (streamIndex$845 < length$842) {
            token$1477 = lookahead$846;
            if (token$1477.type !== Token$824.StringLiteral) {
                break;
            }
            sourceElement$1475 = parseProgramElement$971();
            sourceElements$1476.push(sourceElement$1475);
            if (sourceElement$1475.expression.type !== Syntax$827.Literal) {
                // this is not directive
                break;
            }
            assert$850(false, 'directive isn\'t right');
            directive$1478 = source$833.slice(token$1477.range[0] + 1, token$1477.range[1] - 1);
            if (directive$1478 === 'use strict') {
                strict$834 = true;
                if (firstRestricted$1479) {
                    throwErrorTolerant$885(firstRestricted$1479, Messages$829.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1479 && token$1477.octal) {
                    firstRestricted$1479 = token$1477;
                }
            }
        }
        while (streamIndex$845 < length$842) {
            sourceElement$1475 = parseProgramElement$971();
            if (typeof sourceElement$1475 === 'undefined') {
                break;
            }
            sourceElements$1476.push(sourceElement$1475);
        }
        return sourceElements$1476;
    }
    function parseModuleElement$973() {
        return parseSourceElement$970();
    }
    function parseModuleElements$974() {
        var list$1480 = [], statement$1481;
        while (streamIndex$845 < length$842) {
            if (match$889('}')) {
                break;
            }
            statement$1481 = parseModuleElement$973();
            if (typeof statement$1481 === 'undefined') {
                break;
            }
            list$1480.push(statement$1481);
        }
        return list$1480;
    }
    function parseModuleBlock$975() {
        var block$1482;
        expect$887('{');
        block$1482 = parseModuleElements$974();
        expect$887('}');
        return delegate$843.createBlockStatement(block$1482);
    }
    function parseProgram$976() {
        var body$1483;
        strict$834 = false;
        peek$881();
        body$1483 = parseProgramElements$972();
        return delegate$843.createProgram(body$1483);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$977(type$1484, value$1485, start$1486, end$1487, loc$1488) {
        assert$850(typeof start$1486 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$849.comments.length > 0) {
            if (extra$849.comments[extra$849.comments.length - 1].range[1] > start$1486) {
                return;
            }
        }
        extra$849.comments.push({
            type: type$1484,
            value: value$1485,
            range: [
                start$1486,
                end$1487
            ],
            loc: loc$1488
        });
    }
    function scanComment$978() {
        var comment$1489, ch$1490, loc$1491, start$1492, blockComment$1493, lineComment$1494;
        comment$1489 = '';
        blockComment$1493 = false;
        lineComment$1494 = false;
        while (index$835 < length$842) {
            ch$1490 = source$833[index$835];
            if (lineComment$1494) {
                ch$1490 = source$833[index$835++];
                if (isLineTerminator$856(ch$1490.charCodeAt(0))) {
                    loc$1491.end = {
                        line: lineNumber$836,
                        column: index$835 - lineStart$837 - 1
                    };
                    lineComment$1494 = false;
                    addComment$977('Line', comment$1489, start$1492, index$835 - 1, loc$1491);
                    if (ch$1490 === '\r' && source$833[index$835] === '\n') {
                        ++index$835;
                    }
                    ++lineNumber$836;
                    lineStart$837 = index$835;
                    comment$1489 = '';
                } else if (index$835 >= length$842) {
                    lineComment$1494 = false;
                    comment$1489 += ch$1490;
                    loc$1491.end = {
                        line: lineNumber$836,
                        column: length$842 - lineStart$837
                    };
                    addComment$977('Line', comment$1489, start$1492, length$842, loc$1491);
                } else {
                    comment$1489 += ch$1490;
                }
            } else if (blockComment$1493) {
                if (isLineTerminator$856(ch$1490.charCodeAt(0))) {
                    if (ch$1490 === '\r' && source$833[index$835 + 1] === '\n') {
                        ++index$835;
                        comment$1489 += '\r\n';
                    } else {
                        comment$1489 += ch$1490;
                    }
                    ++lineNumber$836;
                    ++index$835;
                    lineStart$837 = index$835;
                    if (index$835 >= length$842) {
                        throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1490 = source$833[index$835++];
                    if (index$835 >= length$842) {
                        throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1489 += ch$1490;
                    if (ch$1490 === '*') {
                        ch$1490 = source$833[index$835];
                        if (ch$1490 === '/') {
                            comment$1489 = comment$1489.substr(0, comment$1489.length - 1);
                            blockComment$1493 = false;
                            ++index$835;
                            loc$1491.end = {
                                line: lineNumber$836,
                                column: index$835 - lineStart$837
                            };
                            addComment$977('Block', comment$1489, start$1492, index$835, loc$1491);
                            comment$1489 = '';
                        }
                    }
                }
            } else if (ch$1490 === '/') {
                ch$1490 = source$833[index$835 + 1];
                if (ch$1490 === '/') {
                    loc$1491 = {
                        start: {
                            line: lineNumber$836,
                            column: index$835 - lineStart$837
                        }
                    };
                    start$1492 = index$835;
                    index$835 += 2;
                    lineComment$1494 = true;
                    if (index$835 >= length$842) {
                        loc$1491.end = {
                            line: lineNumber$836,
                            column: index$835 - lineStart$837
                        };
                        lineComment$1494 = false;
                        addComment$977('Line', comment$1489, start$1492, index$835, loc$1491);
                    }
                } else if (ch$1490 === '*') {
                    start$1492 = index$835;
                    index$835 += 2;
                    blockComment$1493 = true;
                    loc$1491 = {
                        start: {
                            line: lineNumber$836,
                            column: index$835 - lineStart$837 - 2
                        }
                    };
                    if (index$835 >= length$842) {
                        throwError$884({}, Messages$829.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$855(ch$1490.charCodeAt(0))) {
                ++index$835;
            } else if (isLineTerminator$856(ch$1490.charCodeAt(0))) {
                ++index$835;
                if (ch$1490 === '\r' && source$833[index$835] === '\n') {
                    ++index$835;
                }
                ++lineNumber$836;
                lineStart$837 = index$835;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$979() {
        var i$1495, entry$1496, comment$1497, comments$1498 = [];
        for (i$1495 = 0; i$1495 < extra$849.comments.length; ++i$1495) {
            entry$1496 = extra$849.comments[i$1495];
            comment$1497 = {
                type: entry$1496.type,
                value: entry$1496.value
            };
            if (extra$849.range) {
                comment$1497.range = entry$1496.range;
            }
            if (extra$849.loc) {
                comment$1497.loc = entry$1496.loc;
            }
            comments$1498.push(comment$1497);
        }
        extra$849.comments = comments$1498;
    }
    function collectToken$980() {
        var start$1499, loc$1500, token$1501, range$1502, value$1503;
        skipComment$863();
        start$1499 = index$835;
        loc$1500 = {
            start: {
                line: lineNumber$836,
                column: index$835 - lineStart$837
            }
        };
        token$1501 = extra$849.advance();
        loc$1500.end = {
            line: lineNumber$836,
            column: index$835 - lineStart$837
        };
        if (token$1501.type !== Token$824.EOF) {
            range$1502 = [
                token$1501.range[0],
                token$1501.range[1]
            ];
            value$1503 = source$833.slice(token$1501.range[0], token$1501.range[1]);
            extra$849.tokens.push({
                type: TokenName$825[token$1501.type],
                value: value$1503,
                range: range$1502,
                loc: loc$1500
            });
        }
        return token$1501;
    }
    function collectRegex$981() {
        var pos$1504, loc$1505, regex$1506, token$1507;
        skipComment$863();
        pos$1504 = index$835;
        loc$1505 = {
            start: {
                line: lineNumber$836,
                column: index$835 - lineStart$837
            }
        };
        regex$1506 = extra$849.scanRegExp();
        loc$1505.end = {
            line: lineNumber$836,
            column: index$835 - lineStart$837
        };
        if (!extra$849.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$849.tokens.length > 0) {
                token$1507 = extra$849.tokens[extra$849.tokens.length - 1];
                if (token$1507.range[0] === pos$1504 && token$1507.type === 'Punctuator') {
                    if (token$1507.value === '/' || token$1507.value === '/=') {
                        extra$849.tokens.pop();
                    }
                }
            }
            extra$849.tokens.push({
                type: 'RegularExpression',
                value: regex$1506.literal,
                range: [
                    pos$1504,
                    index$835
                ],
                loc: loc$1505
            });
        }
        return regex$1506;
    }
    function filterTokenLocation$982() {
        var i$1508, entry$1509, token$1510, tokens$1511 = [];
        for (i$1508 = 0; i$1508 < extra$849.tokens.length; ++i$1508) {
            entry$1509 = extra$849.tokens[i$1508];
            token$1510 = {
                type: entry$1509.type,
                value: entry$1509.value
            };
            if (extra$849.range) {
                token$1510.range = entry$1509.range;
            }
            if (extra$849.loc) {
                token$1510.loc = entry$1509.loc;
            }
            tokens$1511.push(token$1510);
        }
        extra$849.tokens = tokens$1511;
    }
    function LocationMarker$983() {
        var sm_index$1512 = lookahead$846 ? lookahead$846.sm_range[0] : 0;
        var sm_lineStart$1513 = lookahead$846 ? lookahead$846.sm_lineStart : 0;
        var sm_lineNumber$1514 = lookahead$846 ? lookahead$846.sm_lineNumber : 1;
        this.range = [
            sm_index$1512,
            sm_index$1512
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1514,
                column: sm_index$1512 - sm_lineStart$1513
            },
            end: {
                line: sm_lineNumber$1514,
                column: sm_index$1512 - sm_lineStart$1513
            }
        };
    }
    LocationMarker$983.prototype = {
        constructor: LocationMarker$983,
        end: function () {
            this.range[1] = sm_index$841;
            this.loc.end.line = sm_lineNumber$838;
            this.loc.end.column = sm_index$841 - sm_lineStart$839;
        },
        applyGroup: function (node$1515) {
            if (extra$849.range) {
                node$1515.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$849.loc) {
                node$1515.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1515 = delegate$843.postProcess(node$1515);
            }
        },
        apply: function (node$1516) {
            var nodeType$1517 = typeof node$1516;
            assert$850(nodeType$1517 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1517);
            if (extra$849.range) {
                node$1516.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$849.loc) {
                node$1516.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1516 = delegate$843.postProcess(node$1516);
            }
        }
    };
    function createLocationMarker$984() {
        return new LocationMarker$983();
    }
    function trackGroupExpression$985() {
        var marker$1518, expr$1519;
        marker$1518 = createLocationMarker$984();
        expect$887('(');
        ++state$848.parenthesizedCount;
        expr$1519 = parseExpression$924();
        expect$887(')');
        marker$1518.end();
        marker$1518.applyGroup(expr$1519);
        return expr$1519;
    }
    function trackLeftHandSideExpression$986() {
        var marker$1520, expr$1521;
        // skipComment();
        marker$1520 = createLocationMarker$984();
        expr$1521 = matchKeyword$890('new') ? parseNewExpression$911() : parsePrimaryExpression$905();
        while (match$889('.') || match$889('[') || lookahead$846.type === Token$824.Template) {
            if (match$889('[')) {
                expr$1521 = delegate$843.createMemberExpression('[', expr$1521, parseComputedMember$910());
                marker$1520.end();
                marker$1520.apply(expr$1521);
            } else if (match$889('.')) {
                expr$1521 = delegate$843.createMemberExpression('.', expr$1521, parseNonComputedMember$909());
                marker$1520.end();
                marker$1520.apply(expr$1521);
            } else {
                expr$1521 = delegate$843.createTaggedTemplateExpression(expr$1521, parseTemplateLiteral$903());
                marker$1520.end();
                marker$1520.apply(expr$1521);
            }
        }
        return expr$1521;
    }
    function trackLeftHandSideExpressionAllowCall$987() {
        var marker$1522, expr$1523, args$1524;
        // skipComment();
        marker$1522 = createLocationMarker$984();
        expr$1523 = matchKeyword$890('new') ? parseNewExpression$911() : parsePrimaryExpression$905();
        while (match$889('.') || match$889('[') || match$889('(') || lookahead$846.type === Token$824.Template) {
            if (match$889('(')) {
                args$1524 = parseArguments$906();
                expr$1523 = delegate$843.createCallExpression(expr$1523, args$1524);
                marker$1522.end();
                marker$1522.apply(expr$1523);
            } else if (match$889('[')) {
                expr$1523 = delegate$843.createMemberExpression('[', expr$1523, parseComputedMember$910());
                marker$1522.end();
                marker$1522.apply(expr$1523);
            } else if (match$889('.')) {
                expr$1523 = delegate$843.createMemberExpression('.', expr$1523, parseNonComputedMember$909());
                marker$1522.end();
                marker$1522.apply(expr$1523);
            } else {
                expr$1523 = delegate$843.createTaggedTemplateExpression(expr$1523, parseTemplateLiteral$903());
                marker$1522.end();
                marker$1522.apply(expr$1523);
            }
        }
        return expr$1523;
    }
    function filterGroup$988(node$1525) {
        var n$1526, i$1527, entry$1528;
        n$1526 = Object.prototype.toString.apply(node$1525) === '[object Array]' ? [] : {};
        for (i$1527 in node$1525) {
            if (node$1525.hasOwnProperty(i$1527) && i$1527 !== 'groupRange' && i$1527 !== 'groupLoc') {
                entry$1528 = node$1525[i$1527];
                if (entry$1528 === null || typeof entry$1528 !== 'object' || entry$1528 instanceof RegExp) {
                    n$1526[i$1527] = entry$1528;
                } else {
                    n$1526[i$1527] = filterGroup$988(entry$1528);
                }
            }
        }
        return n$1526;
    }
    function wrapTrackingFunction$989(range$1529, loc$1530) {
        return function (parseFunction$1531) {
            function isBinary$1532(node$1534) {
                return node$1534.type === Syntax$827.LogicalExpression || node$1534.type === Syntax$827.BinaryExpression;
            }
            function visit$1533(node$1535) {
                var start$1536, end$1537;
                if (isBinary$1532(node$1535.left)) {
                    visit$1533(node$1535.left);
                }
                if (isBinary$1532(node$1535.right)) {
                    visit$1533(node$1535.right);
                }
                if (range$1529) {
                    if (node$1535.left.groupRange || node$1535.right.groupRange) {
                        start$1536 = node$1535.left.groupRange ? node$1535.left.groupRange[0] : node$1535.left.range[0];
                        end$1537 = node$1535.right.groupRange ? node$1535.right.groupRange[1] : node$1535.right.range[1];
                        node$1535.range = [
                            start$1536,
                            end$1537
                        ];
                    } else if (typeof node$1535.range === 'undefined') {
                        start$1536 = node$1535.left.range[0];
                        end$1537 = node$1535.right.range[1];
                        node$1535.range = [
                            start$1536,
                            end$1537
                        ];
                    }
                }
                if (loc$1530) {
                    if (node$1535.left.groupLoc || node$1535.right.groupLoc) {
                        start$1536 = node$1535.left.groupLoc ? node$1535.left.groupLoc.start : node$1535.left.loc.start;
                        end$1537 = node$1535.right.groupLoc ? node$1535.right.groupLoc.end : node$1535.right.loc.end;
                        node$1535.loc = {
                            start: start$1536,
                            end: end$1537
                        };
                        node$1535 = delegate$843.postProcess(node$1535);
                    } else if (typeof node$1535.loc === 'undefined') {
                        node$1535.loc = {
                            start: node$1535.left.loc.start,
                            end: node$1535.right.loc.end
                        };
                        node$1535 = delegate$843.postProcess(node$1535);
                    }
                }
            }
            return function () {
                var marker$1538, node$1539, curr$1540 = lookahead$846;
                marker$1538 = createLocationMarker$984();
                node$1539 = parseFunction$1531.apply(null, arguments);
                marker$1538.end();
                if (node$1539.type !== Syntax$827.Program) {
                    if (curr$1540.leadingComments) {
                        node$1539.leadingComments = curr$1540.leadingComments;
                    }
                    if (curr$1540.trailingComments) {
                        node$1539.trailingComments = curr$1540.trailingComments;
                    }
                }
                if (range$1529 && typeof node$1539.range === 'undefined') {
                    marker$1538.apply(node$1539);
                }
                if (loc$1530 && typeof node$1539.loc === 'undefined') {
                    marker$1538.apply(node$1539);
                }
                if (isBinary$1532(node$1539)) {
                    visit$1533(node$1539);
                }
                return node$1539;
            };
        };
    }
    function patch$990() {
        var wrapTracking$1541;
        if (extra$849.comments) {
            extra$849.skipComment = skipComment$863;
            skipComment$863 = scanComment$978;
        }
        if (extra$849.range || extra$849.loc) {
            extra$849.parseGroupExpression = parseGroupExpression$904;
            extra$849.parseLeftHandSideExpression = parseLeftHandSideExpression$913;
            extra$849.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$912;
            parseGroupExpression$904 = trackGroupExpression$985;
            parseLeftHandSideExpression$913 = trackLeftHandSideExpression$986;
            parseLeftHandSideExpressionAllowCall$912 = trackLeftHandSideExpressionAllowCall$987;
            wrapTracking$1541 = wrapTrackingFunction$989(extra$849.range, extra$849.loc);
            extra$849.parseArrayInitialiser = parseArrayInitialiser$896;
            extra$849.parseAssignmentExpression = parseAssignmentExpression$923;
            extra$849.parseBinaryExpression = parseBinaryExpression$917;
            extra$849.parseBlock = parseBlock$926;
            extra$849.parseFunctionSourceElements = parseFunctionSourceElements$957;
            extra$849.parseCatchClause = parseCatchClause$952;
            extra$849.parseComputedMember = parseComputedMember$910;
            extra$849.parseConditionalExpression = parseConditionalExpression$918;
            extra$849.parseConstLetDeclaration = parseConstLetDeclaration$931;
            extra$849.parseExportBatchSpecifier = parseExportBatchSpecifier$933;
            extra$849.parseExportDeclaration = parseExportDeclaration$935;
            extra$849.parseExportSpecifier = parseExportSpecifier$934;
            extra$849.parseExpression = parseExpression$924;
            extra$849.parseForVariableDeclaration = parseForVariableDeclaration$943;
            extra$849.parseFunctionDeclaration = parseFunctionDeclaration$961;
            extra$849.parseFunctionExpression = parseFunctionExpression$962;
            extra$849.parseParams = parseParams$960;
            extra$849.parseImportDeclaration = parseImportDeclaration$936;
            extra$849.parseImportSpecifier = parseImportSpecifier$937;
            extra$849.parseModuleDeclaration = parseModuleDeclaration$932;
            extra$849.parseModuleBlock = parseModuleBlock$975;
            extra$849.parseNewExpression = parseNewExpression$911;
            extra$849.parseNonComputedProperty = parseNonComputedProperty$908;
            extra$849.parseObjectInitialiser = parseObjectInitialiser$901;
            extra$849.parseObjectProperty = parseObjectProperty$900;
            extra$849.parseObjectPropertyKey = parseObjectPropertyKey$899;
            extra$849.parsePostfixExpression = parsePostfixExpression$914;
            extra$849.parsePrimaryExpression = parsePrimaryExpression$905;
            extra$849.parseProgram = parseProgram$976;
            extra$849.parsePropertyFunction = parsePropertyFunction$897;
            extra$849.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$907;
            extra$849.parseTemplateElement = parseTemplateElement$902;
            extra$849.parseTemplateLiteral = parseTemplateLiteral$903;
            extra$849.parseStatement = parseStatement$955;
            extra$849.parseSwitchCase = parseSwitchCase$949;
            extra$849.parseUnaryExpression = parseUnaryExpression$915;
            extra$849.parseVariableDeclaration = parseVariableDeclaration$928;
            extra$849.parseVariableIdentifier = parseVariableIdentifier$927;
            extra$849.parseMethodDefinition = parseMethodDefinition$964;
            extra$849.parseClassDeclaration = parseClassDeclaration$968;
            extra$849.parseClassExpression = parseClassExpression$967;
            extra$849.parseClassBody = parseClassBody$966;
            parseArrayInitialiser$896 = wrapTracking$1541(extra$849.parseArrayInitialiser);
            parseAssignmentExpression$923 = wrapTracking$1541(extra$849.parseAssignmentExpression);
            parseBinaryExpression$917 = wrapTracking$1541(extra$849.parseBinaryExpression);
            parseBlock$926 = wrapTracking$1541(extra$849.parseBlock);
            parseFunctionSourceElements$957 = wrapTracking$1541(extra$849.parseFunctionSourceElements);
            parseCatchClause$952 = wrapTracking$1541(extra$849.parseCatchClause);
            parseComputedMember$910 = wrapTracking$1541(extra$849.parseComputedMember);
            parseConditionalExpression$918 = wrapTracking$1541(extra$849.parseConditionalExpression);
            parseConstLetDeclaration$931 = wrapTracking$1541(extra$849.parseConstLetDeclaration);
            parseExportBatchSpecifier$933 = wrapTracking$1541(parseExportBatchSpecifier$933);
            parseExportDeclaration$935 = wrapTracking$1541(parseExportDeclaration$935);
            parseExportSpecifier$934 = wrapTracking$1541(parseExportSpecifier$934);
            parseExpression$924 = wrapTracking$1541(extra$849.parseExpression);
            parseForVariableDeclaration$943 = wrapTracking$1541(extra$849.parseForVariableDeclaration);
            parseFunctionDeclaration$961 = wrapTracking$1541(extra$849.parseFunctionDeclaration);
            parseFunctionExpression$962 = wrapTracking$1541(extra$849.parseFunctionExpression);
            parseParams$960 = wrapTracking$1541(extra$849.parseParams);
            parseImportDeclaration$936 = wrapTracking$1541(extra$849.parseImportDeclaration);
            parseImportSpecifier$937 = wrapTracking$1541(extra$849.parseImportSpecifier);
            parseModuleDeclaration$932 = wrapTracking$1541(extra$849.parseModuleDeclaration);
            parseModuleBlock$975 = wrapTracking$1541(extra$849.parseModuleBlock);
            parseLeftHandSideExpression$913 = wrapTracking$1541(parseLeftHandSideExpression$913);
            parseNewExpression$911 = wrapTracking$1541(extra$849.parseNewExpression);
            parseNonComputedProperty$908 = wrapTracking$1541(extra$849.parseNonComputedProperty);
            parseObjectInitialiser$901 = wrapTracking$1541(extra$849.parseObjectInitialiser);
            parseObjectProperty$900 = wrapTracking$1541(extra$849.parseObjectProperty);
            parseObjectPropertyKey$899 = wrapTracking$1541(extra$849.parseObjectPropertyKey);
            parsePostfixExpression$914 = wrapTracking$1541(extra$849.parsePostfixExpression);
            parsePrimaryExpression$905 = wrapTracking$1541(extra$849.parsePrimaryExpression);
            parseProgram$976 = wrapTracking$1541(extra$849.parseProgram);
            parsePropertyFunction$897 = wrapTracking$1541(extra$849.parsePropertyFunction);
            parseTemplateElement$902 = wrapTracking$1541(extra$849.parseTemplateElement);
            parseTemplateLiteral$903 = wrapTracking$1541(extra$849.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$907 = wrapTracking$1541(extra$849.parseSpreadOrAssignmentExpression);
            parseStatement$955 = wrapTracking$1541(extra$849.parseStatement);
            parseSwitchCase$949 = wrapTracking$1541(extra$849.parseSwitchCase);
            parseUnaryExpression$915 = wrapTracking$1541(extra$849.parseUnaryExpression);
            parseVariableDeclaration$928 = wrapTracking$1541(extra$849.parseVariableDeclaration);
            parseVariableIdentifier$927 = wrapTracking$1541(extra$849.parseVariableIdentifier);
            parseMethodDefinition$964 = wrapTracking$1541(extra$849.parseMethodDefinition);
            parseClassDeclaration$968 = wrapTracking$1541(extra$849.parseClassDeclaration);
            parseClassExpression$967 = wrapTracking$1541(extra$849.parseClassExpression);
            parseClassBody$966 = wrapTracking$1541(extra$849.parseClassBody);
        }
        if (typeof extra$849.tokens !== 'undefined') {
            extra$849.advance = advance$879;
            extra$849.scanRegExp = scanRegExp$876;
            advance$879 = collectToken$980;
            scanRegExp$876 = collectRegex$981;
        }
    }
    function unpatch$991() {
        if (typeof extra$849.skipComment === 'function') {
            skipComment$863 = extra$849.skipComment;
        }
        if (extra$849.range || extra$849.loc) {
            parseArrayInitialiser$896 = extra$849.parseArrayInitialiser;
            parseAssignmentExpression$923 = extra$849.parseAssignmentExpression;
            parseBinaryExpression$917 = extra$849.parseBinaryExpression;
            parseBlock$926 = extra$849.parseBlock;
            parseFunctionSourceElements$957 = extra$849.parseFunctionSourceElements;
            parseCatchClause$952 = extra$849.parseCatchClause;
            parseComputedMember$910 = extra$849.parseComputedMember;
            parseConditionalExpression$918 = extra$849.parseConditionalExpression;
            parseConstLetDeclaration$931 = extra$849.parseConstLetDeclaration;
            parseExportBatchSpecifier$933 = extra$849.parseExportBatchSpecifier;
            parseExportDeclaration$935 = extra$849.parseExportDeclaration;
            parseExportSpecifier$934 = extra$849.parseExportSpecifier;
            parseExpression$924 = extra$849.parseExpression;
            parseForVariableDeclaration$943 = extra$849.parseForVariableDeclaration;
            parseFunctionDeclaration$961 = extra$849.parseFunctionDeclaration;
            parseFunctionExpression$962 = extra$849.parseFunctionExpression;
            parseImportDeclaration$936 = extra$849.parseImportDeclaration;
            parseImportSpecifier$937 = extra$849.parseImportSpecifier;
            parseGroupExpression$904 = extra$849.parseGroupExpression;
            parseLeftHandSideExpression$913 = extra$849.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$912 = extra$849.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$932 = extra$849.parseModuleDeclaration;
            parseModuleBlock$975 = extra$849.parseModuleBlock;
            parseNewExpression$911 = extra$849.parseNewExpression;
            parseNonComputedProperty$908 = extra$849.parseNonComputedProperty;
            parseObjectInitialiser$901 = extra$849.parseObjectInitialiser;
            parseObjectProperty$900 = extra$849.parseObjectProperty;
            parseObjectPropertyKey$899 = extra$849.parseObjectPropertyKey;
            parsePostfixExpression$914 = extra$849.parsePostfixExpression;
            parsePrimaryExpression$905 = extra$849.parsePrimaryExpression;
            parseProgram$976 = extra$849.parseProgram;
            parsePropertyFunction$897 = extra$849.parsePropertyFunction;
            parseTemplateElement$902 = extra$849.parseTemplateElement;
            parseTemplateLiteral$903 = extra$849.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$907 = extra$849.parseSpreadOrAssignmentExpression;
            parseStatement$955 = extra$849.parseStatement;
            parseSwitchCase$949 = extra$849.parseSwitchCase;
            parseUnaryExpression$915 = extra$849.parseUnaryExpression;
            parseVariableDeclaration$928 = extra$849.parseVariableDeclaration;
            parseVariableIdentifier$927 = extra$849.parseVariableIdentifier;
            parseMethodDefinition$964 = extra$849.parseMethodDefinition;
            parseClassDeclaration$968 = extra$849.parseClassDeclaration;
            parseClassExpression$967 = extra$849.parseClassExpression;
            parseClassBody$966 = extra$849.parseClassBody;
        }
        if (typeof extra$849.scanRegExp === 'function') {
            advance$879 = extra$849.advance;
            scanRegExp$876 = extra$849.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$992(object$1542, properties$1543) {
        var entry$1544, result$1545 = {};
        for (entry$1544 in object$1542) {
            if (object$1542.hasOwnProperty(entry$1544)) {
                result$1545[entry$1544] = object$1542[entry$1544];
            }
        }
        for (entry$1544 in properties$1543) {
            if (properties$1543.hasOwnProperty(entry$1544)) {
                result$1545[entry$1544] = properties$1543[entry$1544];
            }
        }
        return result$1545;
    }
    function tokenize$993(code$1546, options$1547) {
        var toString$1548, token$1549, tokens$1550;
        toString$1548 = String;
        if (typeof code$1546 !== 'string' && !(code$1546 instanceof String)) {
            code$1546 = toString$1548(code$1546);
        }
        delegate$843 = SyntaxTreeDelegate$831;
        source$833 = code$1546;
        index$835 = 0;
        lineNumber$836 = source$833.length > 0 ? 1 : 0;
        lineStart$837 = 0;
        length$842 = source$833.length;
        lookahead$846 = null;
        state$848 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$849 = {};
        // Options matching.
        options$1547 = options$1547 || {};
        // Of course we collect tokens here.
        options$1547.tokens = true;
        extra$849.tokens = [];
        extra$849.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$849.openParenToken = -1;
        extra$849.openCurlyToken = -1;
        extra$849.range = typeof options$1547.range === 'boolean' && options$1547.range;
        extra$849.loc = typeof options$1547.loc === 'boolean' && options$1547.loc;
        if (typeof options$1547.comment === 'boolean' && options$1547.comment) {
            extra$849.comments = [];
        }
        if (typeof options$1547.tolerant === 'boolean' && options$1547.tolerant) {
            extra$849.errors = [];
        }
        if (length$842 > 0) {
            if (typeof source$833[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1546 instanceof String) {
                    source$833 = code$1546.valueOf();
                }
            }
        }
        patch$990();
        try {
            peek$881();
            if (lookahead$846.type === Token$824.EOF) {
                return extra$849.tokens;
            }
            token$1549 = lex$880();
            while (lookahead$846.type !== Token$824.EOF) {
                try {
                    token$1549 = lex$880();
                } catch (lexError$1551) {
                    token$1549 = lookahead$846;
                    if (extra$849.errors) {
                        extra$849.errors.push(lexError$1551);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1551;
                    }
                }
            }
            filterTokenLocation$982();
            tokens$1550 = extra$849.tokens;
            if (typeof extra$849.comments !== 'undefined') {
                filterCommentLocation$979();
                tokens$1550.comments = extra$849.comments;
            }
            if (typeof extra$849.errors !== 'undefined') {
                tokens$1550.errors = extra$849.errors;
            }
        } catch (e$1552) {
            throw e$1552;
        } finally {
            unpatch$991();
            extra$849 = {};
        }
        return tokens$1550;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$994(toks$1553, start$1554, inExprDelim$1555, parentIsBlock$1556) {
        var assignOps$1557 = [
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
        var binaryOps$1558 = [
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
        var unaryOps$1559 = [
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
        function back$1560(n$1561) {
            var idx$1562 = toks$1553.length - n$1561 > 0 ? toks$1553.length - n$1561 : 0;
            return toks$1553[idx$1562];
        }
        if (inExprDelim$1555 && toks$1553.length - (start$1554 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1560(start$1554 + 2).value === ':' && parentIsBlock$1556) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$851(back$1560(start$1554 + 2).value, unaryOps$1559.concat(binaryOps$1558).concat(assignOps$1557))) {
            // ... + {...}
            return false;
        } else if (back$1560(start$1554 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1563 = typeof back$1560(start$1554 + 1).startLineNumber !== 'undefined' ? back$1560(start$1554 + 1).startLineNumber : back$1560(start$1554 + 1).lineNumber;
            if (back$1560(start$1554 + 2).lineNumber !== currLineNumber$1563) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$851(back$1560(start$1554 + 2).value, [
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
    function readToken$995(toks$1564, inExprDelim$1565, parentIsBlock$1566) {
        var delimiters$1567 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1568 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1569 = toks$1564.length - 1;
        var comments$1570, commentsLen$1571 = extra$849.comments.length;
        function back$1572(n$1576) {
            var idx$1577 = toks$1564.length - n$1576 > 0 ? toks$1564.length - n$1576 : 0;
            return toks$1564[idx$1577];
        }
        function attachComments$1573(token$1578) {
            if (comments$1570) {
                token$1578.leadingComments = comments$1570;
            }
            return token$1578;
        }
        function _advance$1574() {
            return attachComments$1573(advance$879());
        }
        function _scanRegExp$1575() {
            return attachComments$1573(scanRegExp$876());
        }
        skipComment$863();
        if (extra$849.comments.length > commentsLen$1571) {
            comments$1570 = extra$849.comments.slice(commentsLen$1571);
        }
        if (isIn$851(source$833[index$835], delimiters$1567)) {
            return attachComments$1573(readDelim$996(toks$1564, inExprDelim$1565, parentIsBlock$1566));
        }
        if (source$833[index$835] === '/') {
            var prev$1579 = back$1572(1);
            if (prev$1579) {
                if (prev$1579.value === '()') {
                    if (isIn$851(back$1572(2).value, parenIdents$1568)) {
                        // ... if (...) / ...
                        return _scanRegExp$1575();
                    }
                    // ... (...) / ...
                    return _advance$1574();
                }
                if (prev$1579.value === '{}') {
                    if (blockAllowed$994(toks$1564, 0, inExprDelim$1565, parentIsBlock$1566)) {
                        if (back$1572(2).value === '()') {
                            // named function
                            if (back$1572(4).value === 'function') {
                                if (!blockAllowed$994(toks$1564, 3, inExprDelim$1565, parentIsBlock$1566)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1574();
                                }
                                if (toks$1564.length - 5 <= 0 && inExprDelim$1565) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1574();
                                }
                            }
                            // unnamed function
                            if (back$1572(3).value === 'function') {
                                if (!blockAllowed$994(toks$1564, 2, inExprDelim$1565, parentIsBlock$1566)) {
                                    // new function (...) {...} / ...
                                    return _advance$1574();
                                }
                                if (toks$1564.length - 4 <= 0 && inExprDelim$1565) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1574();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1575();
                    } else {
                        // ... + {...} / ...
                        return _advance$1574();
                    }
                }
                if (prev$1579.type === Token$824.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1575();
                }
                if (isKeyword$862(prev$1579.value)) {
                    // typeof /...
                    return _scanRegExp$1575();
                }
                return _advance$1574();
            }
            return _scanRegExp$1575();
        }
        return _advance$1574();
    }
    function readDelim$996(toks$1580, inExprDelim$1581, parentIsBlock$1582) {
        var startDelim$1583 = advance$879(), matchDelim$1584 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1585 = [];
        var delimiters$1586 = [
                '(',
                '{',
                '['
            ];
        assert$850(delimiters$1586.indexOf(startDelim$1583.value) !== -1, 'Need to begin at the delimiter');
        var token$1587 = startDelim$1583;
        var startLineNumber$1588 = token$1587.lineNumber;
        var startLineStart$1589 = token$1587.lineStart;
        var startRange$1590 = token$1587.range;
        var delimToken$1591 = {};
        delimToken$1591.type = Token$824.Delimiter;
        delimToken$1591.value = startDelim$1583.value + matchDelim$1584[startDelim$1583.value];
        delimToken$1591.startLineNumber = startLineNumber$1588;
        delimToken$1591.startLineStart = startLineStart$1589;
        delimToken$1591.startRange = startRange$1590;
        var delimIsBlock$1592 = false;
        if (startDelim$1583.value === '{') {
            delimIsBlock$1592 = blockAllowed$994(toks$1580.concat(delimToken$1591), 0, inExprDelim$1581, parentIsBlock$1582);
        }
        while (index$835 <= length$842) {
            token$1587 = readToken$995(inner$1585, startDelim$1583.value === '(' || startDelim$1583.value === '[', delimIsBlock$1592);
            if (token$1587.type === Token$824.Punctuator && token$1587.value === matchDelim$1584[startDelim$1583.value]) {
                if (token$1587.leadingComments) {
                    delimToken$1591.trailingComments = token$1587.leadingComments;
                }
                break;
            } else if (token$1587.type === Token$824.EOF) {
                throwError$884({}, Messages$829.UnexpectedEOS);
            } else {
                inner$1585.push(token$1587);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$835 >= length$842 && matchDelim$1584[startDelim$1583.value] !== source$833[length$842 - 1]) {
            throwError$884({}, Messages$829.UnexpectedEOS);
        }
        var endLineNumber$1593 = token$1587.lineNumber;
        var endLineStart$1594 = token$1587.lineStart;
        var endRange$1595 = token$1587.range;
        delimToken$1591.inner = inner$1585;
        delimToken$1591.endLineNumber = endLineNumber$1593;
        delimToken$1591.endLineStart = endLineStart$1594;
        delimToken$1591.endRange = endRange$1595;
        return delimToken$1591;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$997(code$1596) {
        var token$1597, tokenTree$1598 = [];
        extra$849 = {};
        extra$849.comments = [];
        patch$990();
        source$833 = code$1596;
        index$835 = 0;
        lineNumber$836 = source$833.length > 0 ? 1 : 0;
        lineStart$837 = 0;
        length$842 = source$833.length;
        state$848 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$835 < length$842) {
            tokenTree$1598.push(readToken$995(tokenTree$1598, false, false));
        }
        var last$1599 = tokenTree$1598[tokenTree$1598.length - 1];
        if (last$1599 && last$1599.type !== Token$824.EOF) {
            tokenTree$1598.push({
                type: Token$824.EOF,
                value: '',
                lineNumber: last$1599.lineNumber,
                lineStart: last$1599.lineStart,
                range: [
                    index$835,
                    index$835
                ]
            });
        }
        return expander$823.tokensToSyntax(tokenTree$1598);
    }
    function parse$998(code$1600, options$1601) {
        var program$1602, toString$1603;
        extra$849 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1600)) {
            tokenStream$844 = code$1600;
            length$842 = tokenStream$844.length;
            lineNumber$836 = tokenStream$844.length > 0 ? 1 : 0;
            source$833 = undefined;
        } else {
            toString$1603 = String;
            if (typeof code$1600 !== 'string' && !(code$1600 instanceof String)) {
                code$1600 = toString$1603(code$1600);
            }
            source$833 = code$1600;
            length$842 = source$833.length;
            lineNumber$836 = source$833.length > 0 ? 1 : 0;
        }
        delegate$843 = SyntaxTreeDelegate$831;
        streamIndex$845 = -1;
        index$835 = 0;
        lineStart$837 = 0;
        sm_lineStart$839 = 0;
        sm_lineNumber$838 = lineNumber$836;
        sm_index$841 = 0;
        sm_range$840 = [
            0,
            0
        ];
        lookahead$846 = null;
        state$848 = {
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
        if (typeof options$1601 !== 'undefined') {
            extra$849.range = typeof options$1601.range === 'boolean' && options$1601.range;
            extra$849.loc = typeof options$1601.loc === 'boolean' && options$1601.loc;
            if (extra$849.loc && options$1601.source !== null && options$1601.source !== undefined) {
                delegate$843 = extend$992(delegate$843, {
                    'postProcess': function (node$1604) {
                        node$1604.loc.source = toString$1603(options$1601.source);
                        return node$1604;
                    }
                });
            }
            if (typeof options$1601.tokens === 'boolean' && options$1601.tokens) {
                extra$849.tokens = [];
            }
            if (typeof options$1601.comment === 'boolean' && options$1601.comment) {
                extra$849.comments = [];
            }
            if (typeof options$1601.tolerant === 'boolean' && options$1601.tolerant) {
                extra$849.errors = [];
            }
        }
        if (length$842 > 0) {
            if (source$833 && typeof source$833[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1600 instanceof String) {
                    source$833 = code$1600.valueOf();
                }
            }
        }
        extra$849 = { loc: true };
        patch$990();
        try {
            program$1602 = parseProgram$976();
            if (typeof extra$849.comments !== 'undefined') {
                filterCommentLocation$979();
                program$1602.comments = extra$849.comments;
            }
            if (typeof extra$849.tokens !== 'undefined') {
                filterTokenLocation$982();
                program$1602.tokens = extra$849.tokens;
            }
            if (typeof extra$849.errors !== 'undefined') {
                program$1602.errors = extra$849.errors;
            }
            if (extra$849.range || extra$849.loc) {
                program$1602.body = filterGroup$988(program$1602.body);
            }
        } catch (e$1605) {
            throw e$1605;
        } finally {
            unpatch$991();
            extra$849 = {};
        }
        return program$1602;
    }
    exports$822.tokenize = tokenize$993;
    exports$822.read = read$997;
    exports$822.Token = Token$824;
    exports$822.assert = assert$850;
    exports$822.parse = parse$998;
    // Deep copy.
    exports$822.Syntax = function () {
        var name$1606, types$1607 = {};
        if (typeof Object.create === 'function') {
            types$1607 = Object.create(null);
        }
        for (name$1606 in Syntax$827) {
            if (Syntax$827.hasOwnProperty(name$1606)) {
                types$1607[name$1606] = Syntax$827[name$1606];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1607);
        }
        return types$1607;
    }();
}));
//# sourceMappingURL=parser.js.map