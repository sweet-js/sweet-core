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
(function (root$821, factory$822) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$822);
    } else if (typeof exports !== 'undefined') {
        factory$822(exports, require('./expander'));
    } else {
        factory$822(root$821.esprima = {});
    }
}(this, function (exports$823, expander$824) {
    'use strict';
    var Token$825, TokenName$826, FnExprTokens$827, Syntax$828, PropertyKind$829, Messages$830, Regex$831, SyntaxTreeDelegate$832, ClassPropertyType$833, source$834, strict$835, index$836, lineNumber$837, lineStart$838, sm_lineNumber$839, sm_lineStart$840, sm_range$841, sm_index$842, length$843, delegate$844, tokenStream$845, streamIndex$846, lookahead$847, lookaheadIndex$848, state$849, extra$850;
    Token$825 = {
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
    TokenName$826 = {};
    TokenName$826[Token$825.BooleanLiteral] = 'Boolean';
    TokenName$826[Token$825.EOF] = '<end>';
    TokenName$826[Token$825.Identifier] = 'Identifier';
    TokenName$826[Token$825.Keyword] = 'Keyword';
    TokenName$826[Token$825.NullLiteral] = 'Null';
    TokenName$826[Token$825.NumericLiteral] = 'Numeric';
    TokenName$826[Token$825.Punctuator] = 'Punctuator';
    TokenName$826[Token$825.StringLiteral] = 'String';
    TokenName$826[Token$825.RegularExpression] = 'RegularExpression';
    TokenName$826[Token$825.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$827 = [
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
    Syntax$828 = {
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
    PropertyKind$829 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$833 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$830 = {
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
    Regex$831 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$851(condition$1000, message$1001) {
        if (!condition$1000) {
            throw new Error('ASSERT: ' + message$1001);
        }
    }
    function isIn$852(el$1002, list$1003) {
        return list$1003.indexOf(el$1002) !== -1;
    }
    function isDecimalDigit$853(ch$1004) {
        return ch$1004 >= 48 && ch$1004 <= 57;
    }    // 0..9
    function isHexDigit$854(ch$1005) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1005) >= 0;
    }
    function isOctalDigit$855(ch$1006) {
        return '01234567'.indexOf(ch$1006) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$856(ch$1007) {
        return ch$1007 === 32 || ch$1007 === 9 || ch$1007 === 11 || ch$1007 === 12 || ch$1007 === 160 || ch$1007 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1007)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$857(ch$1008) {
        return ch$1008 === 10 || ch$1008 === 13 || ch$1008 === 8232 || ch$1008 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$858(ch$1009) {
        return ch$1009 === 36 || ch$1009 === 95 || ch$1009 >= 65 && ch$1009 <= 90 || ch$1009 >= 97 && ch$1009 <= 122 || ch$1009 === 92 || ch$1009 >= 128 && Regex$831.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1009));
    }
    function isIdentifierPart$859(ch$1010) {
        return ch$1010 === 36 || ch$1010 === 95 || ch$1010 >= 65 && ch$1010 <= 90 || ch$1010 >= 97 && ch$1010 <= 122 || ch$1010 >= 48 && ch$1010 <= 57 || ch$1010 === 92 || ch$1010 >= 128 && Regex$831.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1010));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$860(id$1011) {
        switch (id$1011) {
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
    function isStrictModeReservedWord$861(id$1012) {
        switch (id$1012) {
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
    function isRestrictedWord$862(id$1013) {
        return id$1013 === 'eval' || id$1013 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$863(id$1014) {
        if (strict$835 && isStrictModeReservedWord$861(id$1014)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1014.length) {
        case 2:
            return id$1014 === 'if' || id$1014 === 'in' || id$1014 === 'do';
        case 3:
            return id$1014 === 'var' || id$1014 === 'for' || id$1014 === 'new' || id$1014 === 'try' || id$1014 === 'let';
        case 4:
            return id$1014 === 'this' || id$1014 === 'else' || id$1014 === 'case' || id$1014 === 'void' || id$1014 === 'with' || id$1014 === 'enum';
        case 5:
            return id$1014 === 'while' || id$1014 === 'break' || id$1014 === 'catch' || id$1014 === 'throw' || id$1014 === 'const' || id$1014 === 'yield' || id$1014 === 'class' || id$1014 === 'super';
        case 6:
            return id$1014 === 'return' || id$1014 === 'typeof' || id$1014 === 'delete' || id$1014 === 'switch' || id$1014 === 'export' || id$1014 === 'import';
        case 7:
            return id$1014 === 'default' || id$1014 === 'finally' || id$1014 === 'extends';
        case 8:
            return id$1014 === 'function' || id$1014 === 'continue' || id$1014 === 'debugger';
        case 10:
            return id$1014 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$864() {
        var ch$1015, blockComment$1016, lineComment$1017;
        blockComment$1016 = false;
        lineComment$1017 = false;
        while (index$836 < length$843) {
            ch$1015 = source$834.charCodeAt(index$836);
            if (lineComment$1017) {
                ++index$836;
                if (isLineTerminator$857(ch$1015)) {
                    lineComment$1017 = false;
                    if (ch$1015 === 13 && source$834.charCodeAt(index$836) === 10) {
                        ++index$836;
                    }
                    ++lineNumber$837;
                    lineStart$838 = index$836;
                }
            } else if (blockComment$1016) {
                if (isLineTerminator$857(ch$1015)) {
                    if (ch$1015 === 13 && source$834.charCodeAt(index$836 + 1) === 10) {
                        ++index$836;
                    }
                    ++lineNumber$837;
                    ++index$836;
                    lineStart$838 = index$836;
                    if (index$836 >= length$843) {
                        throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1015 = source$834.charCodeAt(index$836++);
                    if (index$836 >= length$843) {
                        throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1015 === 42) {
                        ch$1015 = source$834.charCodeAt(index$836);
                        if (ch$1015 === 47) {
                            ++index$836;
                            blockComment$1016 = false;
                        }
                    }
                }
            } else if (ch$1015 === 47) {
                ch$1015 = source$834.charCodeAt(index$836 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1015 === 47) {
                    index$836 += 2;
                    lineComment$1017 = true;
                } else if (ch$1015 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$836 += 2;
                    blockComment$1016 = true;
                    if (index$836 >= length$843) {
                        throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$856(ch$1015)) {
                ++index$836;
            } else if (isLineTerminator$857(ch$1015)) {
                ++index$836;
                if (ch$1015 === 13 && source$834.charCodeAt(index$836) === 10) {
                    ++index$836;
                }
                ++lineNumber$837;
                lineStart$838 = index$836;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$865(prefix$1018) {
        var i$1019, len$1020, ch$1021, code$1022 = 0;
        len$1020 = prefix$1018 === 'u' ? 4 : 2;
        for (i$1019 = 0; i$1019 < len$1020; ++i$1019) {
            if (index$836 < length$843 && isHexDigit$854(source$834[index$836])) {
                ch$1021 = source$834[index$836++];
                code$1022 = code$1022 * 16 + '0123456789abcdef'.indexOf(ch$1021.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1022);
    }
    function scanUnicodeCodePointEscape$866() {
        var ch$1023, code$1024, cu1$1025, cu2$1026;
        ch$1023 = source$834[index$836];
        code$1024 = 0;
        // At least, one hex digit is required.
        if (ch$1023 === '}') {
            throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
        }
        while (index$836 < length$843) {
            ch$1023 = source$834[index$836++];
            if (!isHexDigit$854(ch$1023)) {
                break;
            }
            code$1024 = code$1024 * 16 + '0123456789abcdef'.indexOf(ch$1023.toLowerCase());
        }
        if (code$1024 > 1114111 || ch$1023 !== '}') {
            throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1024 <= 65535) {
            return String.fromCharCode(code$1024);
        }
        cu1$1025 = (code$1024 - 65536 >> 10) + 55296;
        cu2$1026 = (code$1024 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1025, cu2$1026);
    }
    function getEscapedIdentifier$867() {
        var ch$1027, id$1028;
        ch$1027 = source$834.charCodeAt(index$836++);
        id$1028 = String.fromCharCode(ch$1027);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1027 === 92) {
            if (source$834.charCodeAt(index$836) !== 117) {
                throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
            }
            ++index$836;
            ch$1027 = scanHexEscape$865('u');
            if (!ch$1027 || ch$1027 === '\\' || !isIdentifierStart$858(ch$1027.charCodeAt(0))) {
                throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
            }
            id$1028 = ch$1027;
        }
        while (index$836 < length$843) {
            ch$1027 = source$834.charCodeAt(index$836);
            if (!isIdentifierPart$859(ch$1027)) {
                break;
            }
            ++index$836;
            id$1028 += String.fromCharCode(ch$1027);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1027 === 92) {
                id$1028 = id$1028.substr(0, id$1028.length - 1);
                if (source$834.charCodeAt(index$836) !== 117) {
                    throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
                }
                ++index$836;
                ch$1027 = scanHexEscape$865('u');
                if (!ch$1027 || ch$1027 === '\\' || !isIdentifierPart$859(ch$1027.charCodeAt(0))) {
                    throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
                }
                id$1028 += ch$1027;
            }
        }
        return id$1028;
    }
    function getIdentifier$868() {
        var start$1029, ch$1030;
        start$1029 = index$836++;
        while (index$836 < length$843) {
            ch$1030 = source$834.charCodeAt(index$836);
            if (ch$1030 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$836 = start$1029;
                return getEscapedIdentifier$867();
            }
            if (isIdentifierPart$859(ch$1030)) {
                ++index$836;
            } else {
                break;
            }
        }
        return source$834.slice(start$1029, index$836);
    }
    function scanIdentifier$869() {
        var start$1031, id$1032, type$1033;
        start$1031 = index$836;
        // Backslash (char #92) starts an escaped character.
        id$1032 = source$834.charCodeAt(index$836) === 92 ? getEscapedIdentifier$867() : getIdentifier$868();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1032.length === 1) {
            type$1033 = Token$825.Identifier;
        } else if (isKeyword$863(id$1032)) {
            type$1033 = Token$825.Keyword;
        } else if (id$1032 === 'null') {
            type$1033 = Token$825.NullLiteral;
        } else if (id$1032 === 'true' || id$1032 === 'false') {
            type$1033 = Token$825.BooleanLiteral;
        } else {
            type$1033 = Token$825.Identifier;
        }
        return {
            type: type$1033,
            value: id$1032,
            lineNumber: lineNumber$837,
            lineStart: lineStart$838,
            range: [
                start$1031,
                index$836
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$870() {
        var start$1034 = index$836, code$1035 = source$834.charCodeAt(index$836), code2$1036, ch1$1037 = source$834[index$836], ch2$1038, ch3$1039, ch4$1040;
        switch (code$1035) {
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
            ++index$836;
            if (extra$850.tokenize) {
                if (code$1035 === 40) {
                    extra$850.openParenToken = extra$850.tokens.length;
                } else if (code$1035 === 123) {
                    extra$850.openCurlyToken = extra$850.tokens.length;
                }
            }
            return {
                type: Token$825.Punctuator,
                value: String.fromCharCode(code$1035),
                lineNumber: lineNumber$837,
                lineStart: lineStart$838,
                range: [
                    start$1034,
                    index$836
                ]
            };
        default:
            code2$1036 = source$834.charCodeAt(index$836 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1036 === 61) {
                switch (code$1035) {
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
                    index$836 += 2;
                    return {
                        type: Token$825.Punctuator,
                        value: String.fromCharCode(code$1035) + String.fromCharCode(code2$1036),
                        lineNumber: lineNumber$837,
                        lineStart: lineStart$838,
                        range: [
                            start$1034,
                            index$836
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$836 += 2;
                    // !== and ===
                    if (source$834.charCodeAt(index$836) === 61) {
                        ++index$836;
                    }
                    return {
                        type: Token$825.Punctuator,
                        value: source$834.slice(start$1034, index$836),
                        lineNumber: lineNumber$837,
                        lineStart: lineStart$838,
                        range: [
                            start$1034,
                            index$836
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1038 = source$834[index$836 + 1];
        ch3$1039 = source$834[index$836 + 2];
        ch4$1040 = source$834[index$836 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1037 === '>' && ch2$1038 === '>' && ch3$1039 === '>') {
            if (ch4$1040 === '=') {
                index$836 += 4;
                return {
                    type: Token$825.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$837,
                    lineStart: lineStart$838,
                    range: [
                        start$1034,
                        index$836
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1037 === '>' && ch2$1038 === '>' && ch3$1039 === '>') {
            index$836 += 3;
            return {
                type: Token$825.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$837,
                lineStart: lineStart$838,
                range: [
                    start$1034,
                    index$836
                ]
            };
        }
        if (ch1$1037 === '<' && ch2$1038 === '<' && ch3$1039 === '=') {
            index$836 += 3;
            return {
                type: Token$825.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$837,
                lineStart: lineStart$838,
                range: [
                    start$1034,
                    index$836
                ]
            };
        }
        if (ch1$1037 === '>' && ch2$1038 === '>' && ch3$1039 === '=') {
            index$836 += 3;
            return {
                type: Token$825.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$837,
                lineStart: lineStart$838,
                range: [
                    start$1034,
                    index$836
                ]
            };
        }
        if (ch1$1037 === '.' && ch2$1038 === '.' && ch3$1039 === '.') {
            index$836 += 3;
            return {
                type: Token$825.Punctuator,
                value: '...',
                lineNumber: lineNumber$837,
                lineStart: lineStart$838,
                range: [
                    start$1034,
                    index$836
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1037 === ch2$1038 && '+-<>&|'.indexOf(ch1$1037) >= 0) {
            index$836 += 2;
            return {
                type: Token$825.Punctuator,
                value: ch1$1037 + ch2$1038,
                lineNumber: lineNumber$837,
                lineStart: lineStart$838,
                range: [
                    start$1034,
                    index$836
                ]
            };
        }
        if (ch1$1037 === '=' && ch2$1038 === '>') {
            index$836 += 2;
            return {
                type: Token$825.Punctuator,
                value: '=>',
                lineNumber: lineNumber$837,
                lineStart: lineStart$838,
                range: [
                    start$1034,
                    index$836
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1037) >= 0) {
            ++index$836;
            return {
                type: Token$825.Punctuator,
                value: ch1$1037,
                lineNumber: lineNumber$837,
                lineStart: lineStart$838,
                range: [
                    start$1034,
                    index$836
                ]
            };
        }
        if (ch1$1037 === '.') {
            ++index$836;
            return {
                type: Token$825.Punctuator,
                value: ch1$1037,
                lineNumber: lineNumber$837,
                lineStart: lineStart$838,
                range: [
                    start$1034,
                    index$836
                ]
            };
        }
        throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$871(start$1041) {
        var number$1042 = '';
        while (index$836 < length$843) {
            if (!isHexDigit$854(source$834[index$836])) {
                break;
            }
            number$1042 += source$834[index$836++];
        }
        if (number$1042.length === 0) {
            throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$858(source$834.charCodeAt(index$836))) {
            throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$825.NumericLiteral,
            value: parseInt('0x' + number$1042, 16),
            lineNumber: lineNumber$837,
            lineStart: lineStart$838,
            range: [
                start$1041,
                index$836
            ]
        };
    }
    function scanOctalLiteral$872(prefix$1043, start$1044) {
        var number$1045, octal$1046;
        if (isOctalDigit$855(prefix$1043)) {
            octal$1046 = true;
            number$1045 = '0' + source$834[index$836++];
        } else {
            octal$1046 = false;
            ++index$836;
            number$1045 = '';
        }
        while (index$836 < length$843) {
            if (!isOctalDigit$855(source$834[index$836])) {
                break;
            }
            number$1045 += source$834[index$836++];
        }
        if (!octal$1046 && number$1045.length === 0) {
            // only 0o or 0O
            throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$858(source$834.charCodeAt(index$836)) || isDecimalDigit$853(source$834.charCodeAt(index$836))) {
            throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$825.NumericLiteral,
            value: parseInt(number$1045, 8),
            octal: octal$1046,
            lineNumber: lineNumber$837,
            lineStart: lineStart$838,
            range: [
                start$1044,
                index$836
            ]
        };
    }
    function scanNumericLiteral$873() {
        var number$1047, start$1048, ch$1049, octal$1050;
        ch$1049 = source$834[index$836];
        assert$851(isDecimalDigit$853(ch$1049.charCodeAt(0)) || ch$1049 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1048 = index$836;
        number$1047 = '';
        if (ch$1049 !== '.') {
            number$1047 = source$834[index$836++];
            ch$1049 = source$834[index$836];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1047 === '0') {
                if (ch$1049 === 'x' || ch$1049 === 'X') {
                    ++index$836;
                    return scanHexLiteral$871(start$1048);
                }
                if (ch$1049 === 'b' || ch$1049 === 'B') {
                    ++index$836;
                    number$1047 = '';
                    while (index$836 < length$843) {
                        ch$1049 = source$834[index$836];
                        if (ch$1049 !== '0' && ch$1049 !== '1') {
                            break;
                        }
                        number$1047 += source$834[index$836++];
                    }
                    if (number$1047.length === 0) {
                        // only 0b or 0B
                        throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$836 < length$843) {
                        ch$1049 = source$834.charCodeAt(index$836);
                        if (isIdentifierStart$858(ch$1049) || isDecimalDigit$853(ch$1049)) {
                            throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$825.NumericLiteral,
                        value: parseInt(number$1047, 2),
                        lineNumber: lineNumber$837,
                        lineStart: lineStart$838,
                        range: [
                            start$1048,
                            index$836
                        ]
                    };
                }
                if (ch$1049 === 'o' || ch$1049 === 'O' || isOctalDigit$855(ch$1049)) {
                    return scanOctalLiteral$872(ch$1049, start$1048);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1049 && isDecimalDigit$853(ch$1049.charCodeAt(0))) {
                    throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$853(source$834.charCodeAt(index$836))) {
                number$1047 += source$834[index$836++];
            }
            ch$1049 = source$834[index$836];
        }
        if (ch$1049 === '.') {
            number$1047 += source$834[index$836++];
            while (isDecimalDigit$853(source$834.charCodeAt(index$836))) {
                number$1047 += source$834[index$836++];
            }
            ch$1049 = source$834[index$836];
        }
        if (ch$1049 === 'e' || ch$1049 === 'E') {
            number$1047 += source$834[index$836++];
            ch$1049 = source$834[index$836];
            if (ch$1049 === '+' || ch$1049 === '-') {
                number$1047 += source$834[index$836++];
            }
            if (isDecimalDigit$853(source$834.charCodeAt(index$836))) {
                while (isDecimalDigit$853(source$834.charCodeAt(index$836))) {
                    number$1047 += source$834[index$836++];
                }
            } else {
                throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$858(source$834.charCodeAt(index$836))) {
            throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$825.NumericLiteral,
            value: parseFloat(number$1047),
            lineNumber: lineNumber$837,
            lineStart: lineStart$838,
            range: [
                start$1048,
                index$836
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$874() {
        var str$1051 = '', quote$1052, start$1053, ch$1054, code$1055, unescaped$1056, restore$1057, octal$1058 = false;
        quote$1052 = source$834[index$836];
        assert$851(quote$1052 === '\'' || quote$1052 === '"', 'String literal must starts with a quote');
        start$1053 = index$836;
        ++index$836;
        while (index$836 < length$843) {
            ch$1054 = source$834[index$836++];
            if (ch$1054 === quote$1052) {
                quote$1052 = '';
                break;
            } else if (ch$1054 === '\\') {
                ch$1054 = source$834[index$836++];
                if (!ch$1054 || !isLineTerminator$857(ch$1054.charCodeAt(0))) {
                    switch (ch$1054) {
                    case 'n':
                        str$1051 += '\n';
                        break;
                    case 'r':
                        str$1051 += '\r';
                        break;
                    case 't':
                        str$1051 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$834[index$836] === '{') {
                            ++index$836;
                            str$1051 += scanUnicodeCodePointEscape$866();
                        } else {
                            restore$1057 = index$836;
                            unescaped$1056 = scanHexEscape$865(ch$1054);
                            if (unescaped$1056) {
                                str$1051 += unescaped$1056;
                            } else {
                                index$836 = restore$1057;
                                str$1051 += ch$1054;
                            }
                        }
                        break;
                    case 'b':
                        str$1051 += '\b';
                        break;
                    case 'f':
                        str$1051 += '\f';
                        break;
                    case 'v':
                        str$1051 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$855(ch$1054)) {
                            code$1055 = '01234567'.indexOf(ch$1054);
                            // \0 is not octal escape sequence
                            if (code$1055 !== 0) {
                                octal$1058 = true;
                            }
                            if (index$836 < length$843 && isOctalDigit$855(source$834[index$836])) {
                                octal$1058 = true;
                                code$1055 = code$1055 * 8 + '01234567'.indexOf(source$834[index$836++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1054) >= 0 && index$836 < length$843 && isOctalDigit$855(source$834[index$836])) {
                                    code$1055 = code$1055 * 8 + '01234567'.indexOf(source$834[index$836++]);
                                }
                            }
                            str$1051 += String.fromCharCode(code$1055);
                        } else {
                            str$1051 += ch$1054;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$837;
                    if (ch$1054 === '\r' && source$834[index$836] === '\n') {
                        ++index$836;
                    }
                }
            } else if (isLineTerminator$857(ch$1054.charCodeAt(0))) {
                break;
            } else {
                str$1051 += ch$1054;
            }
        }
        if (quote$1052 !== '') {
            throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$825.StringLiteral,
            value: str$1051,
            octal: octal$1058,
            lineNumber: lineNumber$837,
            lineStart: lineStart$838,
            range: [
                start$1053,
                index$836
            ]
        };
    }
    function scanTemplate$875() {
        var cooked$1059 = '', ch$1060, start$1061, terminated$1062, tail$1063, restore$1064, unescaped$1065, code$1066, octal$1067;
        terminated$1062 = false;
        tail$1063 = false;
        start$1061 = index$836;
        ++index$836;
        while (index$836 < length$843) {
            ch$1060 = source$834[index$836++];
            if (ch$1060 === '`') {
                tail$1063 = true;
                terminated$1062 = true;
                break;
            } else if (ch$1060 === '$') {
                if (source$834[index$836] === '{') {
                    ++index$836;
                    terminated$1062 = true;
                    break;
                }
                cooked$1059 += ch$1060;
            } else if (ch$1060 === '\\') {
                ch$1060 = source$834[index$836++];
                if (!isLineTerminator$857(ch$1060.charCodeAt(0))) {
                    switch (ch$1060) {
                    case 'n':
                        cooked$1059 += '\n';
                        break;
                    case 'r':
                        cooked$1059 += '\r';
                        break;
                    case 't':
                        cooked$1059 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$834[index$836] === '{') {
                            ++index$836;
                            cooked$1059 += scanUnicodeCodePointEscape$866();
                        } else {
                            restore$1064 = index$836;
                            unescaped$1065 = scanHexEscape$865(ch$1060);
                            if (unescaped$1065) {
                                cooked$1059 += unescaped$1065;
                            } else {
                                index$836 = restore$1064;
                                cooked$1059 += ch$1060;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1059 += '\b';
                        break;
                    case 'f':
                        cooked$1059 += '\f';
                        break;
                    case 'v':
                        cooked$1059 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$855(ch$1060)) {
                            code$1066 = '01234567'.indexOf(ch$1060);
                            // \0 is not octal escape sequence
                            if (code$1066 !== 0) {
                                octal$1067 = true;
                            }
                            if (index$836 < length$843 && isOctalDigit$855(source$834[index$836])) {
                                octal$1067 = true;
                                code$1066 = code$1066 * 8 + '01234567'.indexOf(source$834[index$836++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1060) >= 0 && index$836 < length$843 && isOctalDigit$855(source$834[index$836])) {
                                    code$1066 = code$1066 * 8 + '01234567'.indexOf(source$834[index$836++]);
                                }
                            }
                            cooked$1059 += String.fromCharCode(code$1066);
                        } else {
                            cooked$1059 += ch$1060;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$837;
                    if (ch$1060 === '\r' && source$834[index$836] === '\n') {
                        ++index$836;
                    }
                }
            } else if (isLineTerminator$857(ch$1060.charCodeAt(0))) {
                ++lineNumber$837;
                if (ch$1060 === '\r' && source$834[index$836] === '\n') {
                    ++index$836;
                }
                cooked$1059 += '\n';
            } else {
                cooked$1059 += ch$1060;
            }
        }
        if (!terminated$1062) {
            throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$825.Template,
            value: {
                cooked: cooked$1059,
                raw: source$834.slice(start$1061 + 1, index$836 - (tail$1063 ? 1 : 2))
            },
            tail: tail$1063,
            octal: octal$1067,
            lineNumber: lineNumber$837,
            lineStart: lineStart$838,
            range: [
                start$1061,
                index$836
            ]
        };
    }
    function scanTemplateElement$876(option$1068) {
        var startsWith$1069, template$1070;
        lookahead$847 = null;
        skipComment$864();
        startsWith$1069 = option$1068.head ? '`' : '}';
        if (source$834[index$836] !== startsWith$1069) {
            throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
        }
        template$1070 = scanTemplate$875();
        peek$882();
        return template$1070;
    }
    function scanRegExp$877() {
        var str$1071, ch$1072, start$1073, pattern$1074, flags$1075, value$1076, classMarker$1077 = false, restore$1078, terminated$1079 = false;
        lookahead$847 = null;
        skipComment$864();
        start$1073 = index$836;
        ch$1072 = source$834[index$836];
        assert$851(ch$1072 === '/', 'Regular expression literal must start with a slash');
        str$1071 = source$834[index$836++];
        while (index$836 < length$843) {
            ch$1072 = source$834[index$836++];
            str$1071 += ch$1072;
            if (classMarker$1077) {
                if (ch$1072 === ']') {
                    classMarker$1077 = false;
                }
            } else {
                if (ch$1072 === '\\') {
                    ch$1072 = source$834[index$836++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$857(ch$1072.charCodeAt(0))) {
                        throwError$885({}, Messages$830.UnterminatedRegExp);
                    }
                    str$1071 += ch$1072;
                } else if (ch$1072 === '/') {
                    terminated$1079 = true;
                    break;
                } else if (ch$1072 === '[') {
                    classMarker$1077 = true;
                } else if (isLineTerminator$857(ch$1072.charCodeAt(0))) {
                    throwError$885({}, Messages$830.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1079) {
            throwError$885({}, Messages$830.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1074 = str$1071.substr(1, str$1071.length - 2);
        flags$1075 = '';
        while (index$836 < length$843) {
            ch$1072 = source$834[index$836];
            if (!isIdentifierPart$859(ch$1072.charCodeAt(0))) {
                break;
            }
            ++index$836;
            if (ch$1072 === '\\' && index$836 < length$843) {
                ch$1072 = source$834[index$836];
                if (ch$1072 === 'u') {
                    ++index$836;
                    restore$1078 = index$836;
                    ch$1072 = scanHexEscape$865('u');
                    if (ch$1072) {
                        flags$1075 += ch$1072;
                        for (str$1071 += '\\u'; restore$1078 < index$836; ++restore$1078) {
                            str$1071 += source$834[restore$1078];
                        }
                    } else {
                        index$836 = restore$1078;
                        flags$1075 += 'u';
                        str$1071 += '\\u';
                    }
                } else {
                    str$1071 += '\\';
                }
            } else {
                flags$1075 += ch$1072;
                str$1071 += ch$1072;
            }
        }
        try {
            value$1076 = new RegExp(pattern$1074, flags$1075);
        } catch (e$1080) {
            throwError$885({}, Messages$830.InvalidRegExp);
        }
        // peek();
        if (extra$850.tokenize) {
            return {
                type: Token$825.RegularExpression,
                value: value$1076,
                lineNumber: lineNumber$837,
                lineStart: lineStart$838,
                range: [
                    start$1073,
                    index$836
                ]
            };
        }
        return {
            type: Token$825.RegularExpression,
            literal: str$1071,
            value: value$1076,
            range: [
                start$1073,
                index$836
            ]
        };
    }
    function isIdentifierName$878(token$1081) {
        return token$1081.type === Token$825.Identifier || token$1081.type === Token$825.Keyword || token$1081.type === Token$825.BooleanLiteral || token$1081.type === Token$825.NullLiteral;
    }
    function advanceSlash$879() {
        var prevToken$1082, checkToken$1083;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1082 = extra$850.tokens[extra$850.tokens.length - 1];
        if (!prevToken$1082) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$877();
        }
        if (prevToken$1082.type === 'Punctuator') {
            if (prevToken$1082.value === ')') {
                checkToken$1083 = extra$850.tokens[extra$850.openParenToken - 1];
                if (checkToken$1083 && checkToken$1083.type === 'Keyword' && (checkToken$1083.value === 'if' || checkToken$1083.value === 'while' || checkToken$1083.value === 'for' || checkToken$1083.value === 'with')) {
                    return scanRegExp$877();
                }
                return scanPunctuator$870();
            }
            if (prevToken$1082.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$850.tokens[extra$850.openCurlyToken - 3] && extra$850.tokens[extra$850.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1083 = extra$850.tokens[extra$850.openCurlyToken - 4];
                    if (!checkToken$1083) {
                        return scanPunctuator$870();
                    }
                } else if (extra$850.tokens[extra$850.openCurlyToken - 4] && extra$850.tokens[extra$850.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1083 = extra$850.tokens[extra$850.openCurlyToken - 5];
                    if (!checkToken$1083) {
                        return scanRegExp$877();
                    }
                } else {
                    return scanPunctuator$870();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$827.indexOf(checkToken$1083.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$870();
                }
                // It is a declaration.
                return scanRegExp$877();
            }
            return scanRegExp$877();
        }
        if (prevToken$1082.type === 'Keyword') {
            return scanRegExp$877();
        }
        return scanPunctuator$870();
    }
    function advance$880() {
        var ch$1084;
        skipComment$864();
        if (index$836 >= length$843) {
            return {
                type: Token$825.EOF,
                lineNumber: lineNumber$837,
                lineStart: lineStart$838,
                range: [
                    index$836,
                    index$836
                ]
            };
        }
        ch$1084 = source$834.charCodeAt(index$836);
        // Very common: ( and ) and ;
        if (ch$1084 === 40 || ch$1084 === 41 || ch$1084 === 58) {
            return scanPunctuator$870();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1084 === 39 || ch$1084 === 34) {
            return scanStringLiteral$874();
        }
        if (ch$1084 === 96) {
            return scanTemplate$875();
        }
        if (isIdentifierStart$858(ch$1084)) {
            return scanIdentifier$869();
        }
        // # and @ are allowed for sweet.js
        if (ch$1084 === 35 || ch$1084 === 64) {
            ++index$836;
            return {
                type: Token$825.Punctuator,
                value: String.fromCharCode(ch$1084),
                lineNumber: lineNumber$837,
                lineStart: lineStart$838,
                range: [
                    index$836 - 1,
                    index$836
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1084 === 46) {
            if (isDecimalDigit$853(source$834.charCodeAt(index$836 + 1))) {
                return scanNumericLiteral$873();
            }
            return scanPunctuator$870();
        }
        if (isDecimalDigit$853(ch$1084)) {
            return scanNumericLiteral$873();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$850.tokenize && ch$1084 === 47) {
            return advanceSlash$879();
        }
        return scanPunctuator$870();
    }
    function lex$881() {
        var token$1085;
        token$1085 = lookahead$847;
        streamIndex$846 = lookaheadIndex$848;
        lineNumber$837 = token$1085.lineNumber;
        lineStart$838 = token$1085.lineStart;
        sm_lineNumber$839 = lookahead$847.sm_lineNumber;
        sm_lineStart$840 = lookahead$847.sm_lineStart;
        sm_range$841 = lookahead$847.sm_range;
        sm_index$842 = lookahead$847.sm_range[0];
        lookahead$847 = tokenStream$845[++streamIndex$846].token;
        lookaheadIndex$848 = streamIndex$846;
        index$836 = lookahead$847.range[0];
        return token$1085;
    }
    function peek$882() {
        lookaheadIndex$848 = streamIndex$846 + 1;
        if (lookaheadIndex$848 >= length$843) {
            lookahead$847 = {
                type: Token$825.EOF,
                lineNumber: lineNumber$837,
                lineStart: lineStart$838,
                range: [
                    index$836,
                    index$836
                ]
            };
            return;
        }
        lookahead$847 = tokenStream$845[lookaheadIndex$848].token;
        index$836 = lookahead$847.range[0];
    }
    function lookahead2$883() {
        var adv$1086, pos$1087, line$1088, start$1089, result$1090;
        if (streamIndex$846 + 1 >= length$843 || streamIndex$846 + 2 >= length$843) {
            return {
                type: Token$825.EOF,
                lineNumber: lineNumber$837,
                lineStart: lineStart$838,
                range: [
                    index$836,
                    index$836
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$847 === null) {
            lookaheadIndex$848 = streamIndex$846 + 1;
            lookahead$847 = tokenStream$845[lookaheadIndex$848].token;
            index$836 = lookahead$847.range[0];
        }
        result$1090 = tokenStream$845[lookaheadIndex$848 + 1].token;
        return result$1090;
    }
    SyntaxTreeDelegate$832 = {
        name: 'SyntaxTree',
        postProcess: function (node$1091) {
            return node$1091;
        },
        createArrayExpression: function (elements$1092) {
            return {
                type: Syntax$828.ArrayExpression,
                elements: elements$1092
            };
        },
        createAssignmentExpression: function (operator$1093, left$1094, right$1095) {
            return {
                type: Syntax$828.AssignmentExpression,
                operator: operator$1093,
                left: left$1094,
                right: right$1095
            };
        },
        createBinaryExpression: function (operator$1096, left$1097, right$1098) {
            var type$1099 = operator$1096 === '||' || operator$1096 === '&&' ? Syntax$828.LogicalExpression : Syntax$828.BinaryExpression;
            return {
                type: type$1099,
                operator: operator$1096,
                left: left$1097,
                right: right$1098
            };
        },
        createBlockStatement: function (body$1100) {
            return {
                type: Syntax$828.BlockStatement,
                body: body$1100
            };
        },
        createBreakStatement: function (label$1101) {
            return {
                type: Syntax$828.BreakStatement,
                label: label$1101
            };
        },
        createCallExpression: function (callee$1102, args$1103) {
            return {
                type: Syntax$828.CallExpression,
                callee: callee$1102,
                'arguments': args$1103
            };
        },
        createCatchClause: function (param$1104, body$1105) {
            return {
                type: Syntax$828.CatchClause,
                param: param$1104,
                body: body$1105
            };
        },
        createConditionalExpression: function (test$1106, consequent$1107, alternate$1108) {
            return {
                type: Syntax$828.ConditionalExpression,
                test: test$1106,
                consequent: consequent$1107,
                alternate: alternate$1108
            };
        },
        createContinueStatement: function (label$1109) {
            return {
                type: Syntax$828.ContinueStatement,
                label: label$1109
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$828.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1110, test$1111) {
            return {
                type: Syntax$828.DoWhileStatement,
                body: body$1110,
                test: test$1111
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$828.EmptyStatement };
        },
        createExpressionStatement: function (expression$1112) {
            return {
                type: Syntax$828.ExpressionStatement,
                expression: expression$1112
            };
        },
        createForStatement: function (init$1113, test$1114, update$1115, body$1116) {
            return {
                type: Syntax$828.ForStatement,
                init: init$1113,
                test: test$1114,
                update: update$1115,
                body: body$1116
            };
        },
        createForInStatement: function (left$1117, right$1118, body$1119) {
            return {
                type: Syntax$828.ForInStatement,
                left: left$1117,
                right: right$1118,
                body: body$1119,
                each: false
            };
        },
        createForOfStatement: function (left$1120, right$1121, body$1122) {
            return {
                type: Syntax$828.ForOfStatement,
                left: left$1120,
                right: right$1121,
                body: body$1122
            };
        },
        createFunctionDeclaration: function (id$1123, params$1124, defaults$1125, body$1126, rest$1127, generator$1128, expression$1129) {
            return {
                type: Syntax$828.FunctionDeclaration,
                id: id$1123,
                params: params$1124,
                defaults: defaults$1125,
                body: body$1126,
                rest: rest$1127,
                generator: generator$1128,
                expression: expression$1129
            };
        },
        createFunctionExpression: function (id$1130, params$1131, defaults$1132, body$1133, rest$1134, generator$1135, expression$1136) {
            return {
                type: Syntax$828.FunctionExpression,
                id: id$1130,
                params: params$1131,
                defaults: defaults$1132,
                body: body$1133,
                rest: rest$1134,
                generator: generator$1135,
                expression: expression$1136
            };
        },
        createIdentifier: function (name$1137) {
            return {
                type: Syntax$828.Identifier,
                name: name$1137
            };
        },
        createIfStatement: function (test$1138, consequent$1139, alternate$1140) {
            return {
                type: Syntax$828.IfStatement,
                test: test$1138,
                consequent: consequent$1139,
                alternate: alternate$1140
            };
        },
        createLabeledStatement: function (label$1141, body$1142) {
            return {
                type: Syntax$828.LabeledStatement,
                label: label$1141,
                body: body$1142
            };
        },
        createLiteral: function (token$1143) {
            return {
                type: Syntax$828.Literal,
                value: token$1143.value,
                raw: String(token$1143.value)
            };
        },
        createMemberExpression: function (accessor$1144, object$1145, property$1146) {
            return {
                type: Syntax$828.MemberExpression,
                computed: accessor$1144 === '[',
                object: object$1145,
                property: property$1146
            };
        },
        createNewExpression: function (callee$1147, args$1148) {
            return {
                type: Syntax$828.NewExpression,
                callee: callee$1147,
                'arguments': args$1148
            };
        },
        createObjectExpression: function (properties$1149) {
            return {
                type: Syntax$828.ObjectExpression,
                properties: properties$1149
            };
        },
        createPostfixExpression: function (operator$1150, argument$1151) {
            return {
                type: Syntax$828.UpdateExpression,
                operator: operator$1150,
                argument: argument$1151,
                prefix: false
            };
        },
        createProgram: function (body$1152) {
            return {
                type: Syntax$828.Program,
                body: body$1152
            };
        },
        createProperty: function (kind$1153, key$1154, value$1155, method$1156, shorthand$1157) {
            return {
                type: Syntax$828.Property,
                key: key$1154,
                value: value$1155,
                kind: kind$1153,
                method: method$1156,
                shorthand: shorthand$1157
            };
        },
        createReturnStatement: function (argument$1158) {
            return {
                type: Syntax$828.ReturnStatement,
                argument: argument$1158
            };
        },
        createSequenceExpression: function (expressions$1159) {
            return {
                type: Syntax$828.SequenceExpression,
                expressions: expressions$1159
            };
        },
        createSwitchCase: function (test$1160, consequent$1161) {
            return {
                type: Syntax$828.SwitchCase,
                test: test$1160,
                consequent: consequent$1161
            };
        },
        createSwitchStatement: function (discriminant$1162, cases$1163) {
            return {
                type: Syntax$828.SwitchStatement,
                discriminant: discriminant$1162,
                cases: cases$1163
            };
        },
        createThisExpression: function () {
            return { type: Syntax$828.ThisExpression };
        },
        createThrowStatement: function (argument$1164) {
            return {
                type: Syntax$828.ThrowStatement,
                argument: argument$1164
            };
        },
        createTryStatement: function (block$1165, guardedHandlers$1166, handlers$1167, finalizer$1168) {
            return {
                type: Syntax$828.TryStatement,
                block: block$1165,
                guardedHandlers: guardedHandlers$1166,
                handlers: handlers$1167,
                finalizer: finalizer$1168
            };
        },
        createUnaryExpression: function (operator$1169, argument$1170) {
            if (operator$1169 === '++' || operator$1169 === '--') {
                return {
                    type: Syntax$828.UpdateExpression,
                    operator: operator$1169,
                    argument: argument$1170,
                    prefix: true
                };
            }
            return {
                type: Syntax$828.UnaryExpression,
                operator: operator$1169,
                argument: argument$1170
            };
        },
        createVariableDeclaration: function (declarations$1171, kind$1172) {
            return {
                type: Syntax$828.VariableDeclaration,
                declarations: declarations$1171,
                kind: kind$1172
            };
        },
        createVariableDeclarator: function (id$1173, init$1174) {
            return {
                type: Syntax$828.VariableDeclarator,
                id: id$1173,
                init: init$1174
            };
        },
        createWhileStatement: function (test$1175, body$1176) {
            return {
                type: Syntax$828.WhileStatement,
                test: test$1175,
                body: body$1176
            };
        },
        createWithStatement: function (object$1177, body$1178) {
            return {
                type: Syntax$828.WithStatement,
                object: object$1177,
                body: body$1178
            };
        },
        createTemplateElement: function (value$1179, tail$1180) {
            return {
                type: Syntax$828.TemplateElement,
                value: value$1179,
                tail: tail$1180
            };
        },
        createTemplateLiteral: function (quasis$1181, expressions$1182) {
            return {
                type: Syntax$828.TemplateLiteral,
                quasis: quasis$1181,
                expressions: expressions$1182
            };
        },
        createSpreadElement: function (argument$1183) {
            return {
                type: Syntax$828.SpreadElement,
                argument: argument$1183
            };
        },
        createTaggedTemplateExpression: function (tag$1184, quasi$1185) {
            return {
                type: Syntax$828.TaggedTemplateExpression,
                tag: tag$1184,
                quasi: quasi$1185
            };
        },
        createArrowFunctionExpression: function (params$1186, defaults$1187, body$1188, rest$1189, expression$1190) {
            return {
                type: Syntax$828.ArrowFunctionExpression,
                id: null,
                params: params$1186,
                defaults: defaults$1187,
                body: body$1188,
                rest: rest$1189,
                generator: false,
                expression: expression$1190
            };
        },
        createMethodDefinition: function (propertyType$1191, kind$1192, key$1193, value$1194) {
            return {
                type: Syntax$828.MethodDefinition,
                key: key$1193,
                value: value$1194,
                kind: kind$1192,
                'static': propertyType$1191 === ClassPropertyType$833.static
            };
        },
        createClassBody: function (body$1195) {
            return {
                type: Syntax$828.ClassBody,
                body: body$1195
            };
        },
        createClassExpression: function (id$1196, superClass$1197, body$1198) {
            return {
                type: Syntax$828.ClassExpression,
                id: id$1196,
                superClass: superClass$1197,
                body: body$1198
            };
        },
        createClassDeclaration: function (id$1199, superClass$1200, body$1201) {
            return {
                type: Syntax$828.ClassDeclaration,
                id: id$1199,
                superClass: superClass$1200,
                body: body$1201
            };
        },
        createExportSpecifier: function (id$1202, name$1203) {
            return {
                type: Syntax$828.ExportSpecifier,
                id: id$1202,
                name: name$1203
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$828.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1204, specifiers$1205, source$1206) {
            return {
                type: Syntax$828.ExportDeclaration,
                declaration: declaration$1204,
                specifiers: specifiers$1205,
                source: source$1206
            };
        },
        createImportSpecifier: function (id$1207, name$1208) {
            return {
                type: Syntax$828.ImportSpecifier,
                id: id$1207,
                name: name$1208
            };
        },
        createImportDeclaration: function (specifiers$1209, kind$1210, source$1211) {
            return {
                type: Syntax$828.ImportDeclaration,
                specifiers: specifiers$1209,
                kind: kind$1210,
                source: source$1211
            };
        },
        createYieldExpression: function (argument$1212, delegate$1213) {
            return {
                type: Syntax$828.YieldExpression,
                argument: argument$1212,
                delegate: delegate$1213
            };
        },
        createModuleDeclaration: function (id$1214, source$1215, body$1216) {
            return {
                type: Syntax$828.ModuleDeclaration,
                id: id$1214,
                source: source$1215,
                body: body$1216
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$884() {
        return lookahead$847.lineNumber !== lineNumber$837;
    }
    // Throw an exception
    function throwError$885(token$1217, messageFormat$1218) {
        var error$1219, args$1220 = Array.prototype.slice.call(arguments, 2), msg$1221 = messageFormat$1218.replace(/%(\d)/g, function (whole$1222, index$1223) {
                assert$851(index$1223 < args$1220.length, 'Message reference must be in range');
                return args$1220[index$1223];
            });
        if (typeof token$1217.lineNumber === 'number') {
            error$1219 = new Error('Line ' + token$1217.lineNumber + ': ' + msg$1221);
            error$1219.index = token$1217.range[0];
            error$1219.lineNumber = token$1217.lineNumber;
            error$1219.column = token$1217.range[0] - lineStart$838 + 1;
        } else {
            error$1219 = new Error('Line ' + lineNumber$837 + ': ' + msg$1221);
            error$1219.index = index$836;
            error$1219.lineNumber = lineNumber$837;
            error$1219.column = index$836 - lineStart$838 + 1;
        }
        error$1219.description = msg$1221;
        throw error$1219;
    }
    function throwErrorTolerant$886() {
        try {
            throwError$885.apply(null, arguments);
        } catch (e$1224) {
            if (extra$850.errors) {
                extra$850.errors.push(e$1224);
            } else {
                throw e$1224;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$887(token$1225) {
        if (token$1225.type === Token$825.EOF) {
            throwError$885(token$1225, Messages$830.UnexpectedEOS);
        }
        if (token$1225.type === Token$825.NumericLiteral) {
            throwError$885(token$1225, Messages$830.UnexpectedNumber);
        }
        if (token$1225.type === Token$825.StringLiteral) {
            throwError$885(token$1225, Messages$830.UnexpectedString);
        }
        if (token$1225.type === Token$825.Identifier) {
            throwError$885(token$1225, Messages$830.UnexpectedIdentifier);
        }
        if (token$1225.type === Token$825.Keyword) {
            if (isFutureReservedWord$860(token$1225.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$835 && isStrictModeReservedWord$861(token$1225.value)) {
                throwErrorTolerant$886(token$1225, Messages$830.StrictReservedWord);
                return;
            }
            throwError$885(token$1225, Messages$830.UnexpectedToken, token$1225.value);
        }
        if (token$1225.type === Token$825.Template) {
            throwError$885(token$1225, Messages$830.UnexpectedTemplate, token$1225.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$885(token$1225, Messages$830.UnexpectedToken, token$1225.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$888(value$1226) {
        var token$1227 = lex$881();
        if (token$1227.type !== Token$825.Punctuator || token$1227.value !== value$1226) {
            throwUnexpected$887(token$1227);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$889(keyword$1228) {
        var token$1229 = lex$881();
        if (token$1229.type !== Token$825.Keyword || token$1229.value !== keyword$1228) {
            throwUnexpected$887(token$1229);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$890(value$1230) {
        return lookahead$847.type === Token$825.Punctuator && lookahead$847.value === value$1230;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$891(keyword$1231) {
        return lookahead$847.type === Token$825.Keyword && lookahead$847.value === keyword$1231;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$892(keyword$1232) {
        return lookahead$847.type === Token$825.Identifier && lookahead$847.value === keyword$1232;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$893() {
        var op$1233;
        if (lookahead$847.type !== Token$825.Punctuator) {
            return false;
        }
        op$1233 = lookahead$847.value;
        return op$1233 === '=' || op$1233 === '*=' || op$1233 === '/=' || op$1233 === '%=' || op$1233 === '+=' || op$1233 === '-=' || op$1233 === '<<=' || op$1233 === '>>=' || op$1233 === '>>>=' || op$1233 === '&=' || op$1233 === '^=' || op$1233 === '|=';
    }
    function consumeSemicolon$894() {
        var line$1234, ch$1235;
        ch$1235 = lookahead$847.value ? lookahead$847.value.charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1235 === 59) {
            lex$881();
            return;
        }
        if (lookahead$847.lineNumber !== lineNumber$837) {
            return;
        }
        if (match$890(';')) {
            lex$881();
            return;
        }
        if (lookahead$847.type !== Token$825.EOF && !match$890('}')) {
            throwUnexpected$887(lookahead$847);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$895(expr$1236) {
        return expr$1236.type === Syntax$828.Identifier || expr$1236.type === Syntax$828.MemberExpression;
    }
    function isAssignableLeftHandSide$896(expr$1237) {
        return isLeftHandSide$895(expr$1237) || expr$1237.type === Syntax$828.ObjectPattern || expr$1237.type === Syntax$828.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$897() {
        var elements$1238 = [], blocks$1239 = [], filter$1240 = null, tmp$1241, possiblecomprehension$1242 = true, body$1243;
        expect$888('[');
        while (!match$890(']')) {
            if (lookahead$847.value === 'for' && lookahead$847.type === Token$825.Keyword) {
                if (!possiblecomprehension$1242) {
                    throwError$885({}, Messages$830.ComprehensionError);
                }
                matchKeyword$891('for');
                tmp$1241 = parseForStatement$945({ ignoreBody: true });
                tmp$1241.of = tmp$1241.type === Syntax$828.ForOfStatement;
                tmp$1241.type = Syntax$828.ComprehensionBlock;
                if (tmp$1241.left.kind) {
                    // can't be let or const
                    throwError$885({}, Messages$830.ComprehensionError);
                }
                blocks$1239.push(tmp$1241);
            } else if (lookahead$847.value === 'if' && lookahead$847.type === Token$825.Keyword) {
                if (!possiblecomprehension$1242) {
                    throwError$885({}, Messages$830.ComprehensionError);
                }
                expectKeyword$889('if');
                expect$888('(');
                filter$1240 = parseExpression$925();
                expect$888(')');
            } else if (lookahead$847.value === ',' && lookahead$847.type === Token$825.Punctuator) {
                possiblecomprehension$1242 = false;
                // no longer allowed.
                lex$881();
                elements$1238.push(null);
            } else {
                tmp$1241 = parseSpreadOrAssignmentExpression$908();
                elements$1238.push(tmp$1241);
                if (tmp$1241 && tmp$1241.type === Syntax$828.SpreadElement) {
                    if (!match$890(']')) {
                        throwError$885({}, Messages$830.ElementAfterSpreadElement);
                    }
                } else if (!(match$890(']') || matchKeyword$891('for') || matchKeyword$891('if'))) {
                    expect$888(',');
                    // this lexes.
                    possiblecomprehension$1242 = false;
                }
            }
        }
        expect$888(']');
        if (filter$1240 && !blocks$1239.length) {
            throwError$885({}, Messages$830.ComprehensionRequiresBlock);
        }
        if (blocks$1239.length) {
            if (elements$1238.length !== 1) {
                throwError$885({}, Messages$830.ComprehensionError);
            }
            return {
                type: Syntax$828.ComprehensionExpression,
                filter: filter$1240,
                blocks: blocks$1239,
                body: elements$1238[0]
            };
        }
        return delegate$844.createArrayExpression(elements$1238);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$898(options$1244) {
        var previousStrict$1245, previousYieldAllowed$1246, params$1247, defaults$1248, body$1249;
        previousStrict$1245 = strict$835;
        previousYieldAllowed$1246 = state$849.yieldAllowed;
        state$849.yieldAllowed = options$1244.generator;
        params$1247 = options$1244.params || [];
        defaults$1248 = options$1244.defaults || [];
        body$1249 = parseConciseBody$957();
        if (options$1244.name && strict$835 && isRestrictedWord$862(params$1247[0].name)) {
            throwErrorTolerant$886(options$1244.name, Messages$830.StrictParamName);
        }
        if (state$849.yieldAllowed && !state$849.yieldFound) {
            throwErrorTolerant$886({}, Messages$830.NoYieldInGenerator);
        }
        strict$835 = previousStrict$1245;
        state$849.yieldAllowed = previousYieldAllowed$1246;
        return delegate$844.createFunctionExpression(null, params$1247, defaults$1248, body$1249, options$1244.rest || null, options$1244.generator, body$1249.type !== Syntax$828.BlockStatement);
    }
    function parsePropertyMethodFunction$899(options$1250) {
        var previousStrict$1251, tmp$1252, method$1253;
        previousStrict$1251 = strict$835;
        strict$835 = true;
        tmp$1252 = parseParams$961();
        if (tmp$1252.stricted) {
            throwErrorTolerant$886(tmp$1252.stricted, tmp$1252.message);
        }
        method$1253 = parsePropertyFunction$898({
            params: tmp$1252.params,
            defaults: tmp$1252.defaults,
            rest: tmp$1252.rest,
            generator: options$1250.generator
        });
        strict$835 = previousStrict$1251;
        return method$1253;
    }
    function parseObjectPropertyKey$900() {
        var token$1254 = lex$881();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1254.type === Token$825.StringLiteral || token$1254.type === Token$825.NumericLiteral) {
            if (strict$835 && token$1254.octal) {
                throwErrorTolerant$886(token$1254, Messages$830.StrictOctalLiteral);
            }
            return delegate$844.createLiteral(token$1254);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$844.createIdentifier(token$1254.value);
    }
    function parseObjectProperty$901() {
        var token$1255, key$1256, id$1257, value$1258, param$1259;
        token$1255 = lookahead$847;
        if (token$1255.type === Token$825.Identifier) {
            id$1257 = parseObjectPropertyKey$900();
            // Property Assignment: Getter and Setter.
            if (token$1255.value === 'get' && !(match$890(':') || match$890('('))) {
                key$1256 = parseObjectPropertyKey$900();
                expect$888('(');
                expect$888(')');
                return delegate$844.createProperty('get', key$1256, parsePropertyFunction$898({ generator: false }), false, false);
            }
            if (token$1255.value === 'set' && !(match$890(':') || match$890('('))) {
                key$1256 = parseObjectPropertyKey$900();
                expect$888('(');
                token$1255 = lookahead$847;
                param$1259 = [parseVariableIdentifier$928()];
                expect$888(')');
                return delegate$844.createProperty('set', key$1256, parsePropertyFunction$898({
                    params: param$1259,
                    generator: false,
                    name: token$1255
                }), false, false);
            }
            if (match$890(':')) {
                lex$881();
                return delegate$844.createProperty('init', id$1257, parseAssignmentExpression$924(), false, false);
            }
            if (match$890('(')) {
                return delegate$844.createProperty('init', id$1257, parsePropertyMethodFunction$899({ generator: false }), true, false);
            }
            return delegate$844.createProperty('init', id$1257, id$1257, false, true);
        }
        if (token$1255.type === Token$825.EOF || token$1255.type === Token$825.Punctuator) {
            if (!match$890('*')) {
                throwUnexpected$887(token$1255);
            }
            lex$881();
            id$1257 = parseObjectPropertyKey$900();
            if (!match$890('(')) {
                throwUnexpected$887(lex$881());
            }
            return delegate$844.createProperty('init', id$1257, parsePropertyMethodFunction$899({ generator: true }), true, false);
        }
        key$1256 = parseObjectPropertyKey$900();
        if (match$890(':')) {
            lex$881();
            return delegate$844.createProperty('init', key$1256, parseAssignmentExpression$924(), false, false);
        }
        if (match$890('(')) {
            return delegate$844.createProperty('init', key$1256, parsePropertyMethodFunction$899({ generator: false }), true, false);
        }
        throwUnexpected$887(lex$881());
    }
    function parseObjectInitialiser$902() {
        var properties$1260 = [], property$1261, name$1262, key$1263, kind$1264, map$1265 = {}, toString$1266 = String;
        expect$888('{');
        while (!match$890('}')) {
            property$1261 = parseObjectProperty$901();
            if (property$1261.key.type === Syntax$828.Identifier) {
                name$1262 = property$1261.key.name;
            } else {
                name$1262 = toString$1266(property$1261.key.value);
            }
            kind$1264 = property$1261.kind === 'init' ? PropertyKind$829.Data : property$1261.kind === 'get' ? PropertyKind$829.Get : PropertyKind$829.Set;
            key$1263 = '$' + name$1262;
            if (Object.prototype.hasOwnProperty.call(map$1265, key$1263)) {
                if (map$1265[key$1263] === PropertyKind$829.Data) {
                    if (strict$835 && kind$1264 === PropertyKind$829.Data) {
                        throwErrorTolerant$886({}, Messages$830.StrictDuplicateProperty);
                    } else if (kind$1264 !== PropertyKind$829.Data) {
                        throwErrorTolerant$886({}, Messages$830.AccessorDataProperty);
                    }
                } else {
                    if (kind$1264 === PropertyKind$829.Data) {
                        throwErrorTolerant$886({}, Messages$830.AccessorDataProperty);
                    } else if (map$1265[key$1263] & kind$1264) {
                        throwErrorTolerant$886({}, Messages$830.AccessorGetSet);
                    }
                }
                map$1265[key$1263] |= kind$1264;
            } else {
                map$1265[key$1263] = kind$1264;
            }
            properties$1260.push(property$1261);
            if (!match$890('}')) {
                expect$888(',');
            }
        }
        expect$888('}');
        return delegate$844.createObjectExpression(properties$1260);
    }
    function parseTemplateElement$903(option$1267) {
        var token$1268 = scanTemplateElement$876(option$1267);
        if (strict$835 && token$1268.octal) {
            throwError$885(token$1268, Messages$830.StrictOctalLiteral);
        }
        return delegate$844.createTemplateElement({
            raw: token$1268.value.raw,
            cooked: token$1268.value.cooked
        }, token$1268.tail);
    }
    function parseTemplateLiteral$904() {
        var quasi$1269, quasis$1270, expressions$1271;
        quasi$1269 = parseTemplateElement$903({ head: true });
        quasis$1270 = [quasi$1269];
        expressions$1271 = [];
        while (!quasi$1269.tail) {
            expressions$1271.push(parseExpression$925());
            quasi$1269 = parseTemplateElement$903({ head: false });
            quasis$1270.push(quasi$1269);
        }
        return delegate$844.createTemplateLiteral(quasis$1270, expressions$1271);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$905() {
        var expr$1272;
        expect$888('(');
        ++state$849.parenthesizedCount;
        expr$1272 = parseExpression$925();
        expect$888(')');
        return expr$1272;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$906() {
        var type$1273, token$1274, resolvedIdent$1275;
        token$1274 = lookahead$847;
        type$1273 = lookahead$847.type;
        if (type$1273 === Token$825.Identifier) {
            resolvedIdent$1275 = expander$824.resolve(tokenStream$845[lookaheadIndex$848]);
            lex$881();
            return delegate$844.createIdentifier(resolvedIdent$1275);
        }
        if (type$1273 === Token$825.StringLiteral || type$1273 === Token$825.NumericLiteral) {
            if (strict$835 && lookahead$847.octal) {
                throwErrorTolerant$886(lookahead$847, Messages$830.StrictOctalLiteral);
            }
            return delegate$844.createLiteral(lex$881());
        }
        if (type$1273 === Token$825.Keyword) {
            if (matchKeyword$891('this')) {
                lex$881();
                return delegate$844.createThisExpression();
            }
            if (matchKeyword$891('function')) {
                return parseFunctionExpression$963();
            }
            if (matchKeyword$891('class')) {
                return parseClassExpression$968();
            }
            if (matchKeyword$891('super')) {
                lex$881();
                return delegate$844.createIdentifier('super');
            }
        }
        if (type$1273 === Token$825.BooleanLiteral) {
            token$1274 = lex$881();
            token$1274.value = token$1274.value === 'true';
            return delegate$844.createLiteral(token$1274);
        }
        if (type$1273 === Token$825.NullLiteral) {
            token$1274 = lex$881();
            token$1274.value = null;
            return delegate$844.createLiteral(token$1274);
        }
        if (match$890('[')) {
            return parseArrayInitialiser$897();
        }
        if (match$890('{')) {
            return parseObjectInitialiser$902();
        }
        if (match$890('(')) {
            return parseGroupExpression$905();
        }
        if (lookahead$847.type === Token$825.RegularExpression) {
            return delegate$844.createLiteral(lex$881());
        }
        if (type$1273 === Token$825.Template) {
            return parseTemplateLiteral$904();
        }
        return throwUnexpected$887(lex$881());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$907() {
        var args$1276 = [], arg$1277;
        expect$888('(');
        if (!match$890(')')) {
            while (streamIndex$846 < length$843) {
                arg$1277 = parseSpreadOrAssignmentExpression$908();
                args$1276.push(arg$1277);
                if (match$890(')')) {
                    break;
                } else if (arg$1277.type === Syntax$828.SpreadElement) {
                    throwError$885({}, Messages$830.ElementAfterSpreadElement);
                }
                expect$888(',');
            }
        }
        expect$888(')');
        return args$1276;
    }
    function parseSpreadOrAssignmentExpression$908() {
        if (match$890('...')) {
            lex$881();
            return delegate$844.createSpreadElement(parseAssignmentExpression$924());
        }
        return parseAssignmentExpression$924();
    }
    function parseNonComputedProperty$909() {
        var token$1278 = lex$881();
        if (!isIdentifierName$878(token$1278)) {
            throwUnexpected$887(token$1278);
        }
        return delegate$844.createIdentifier(token$1278.value);
    }
    function parseNonComputedMember$910() {
        expect$888('.');
        return parseNonComputedProperty$909();
    }
    function parseComputedMember$911() {
        var expr$1279;
        expect$888('[');
        expr$1279 = parseExpression$925();
        expect$888(']');
        return expr$1279;
    }
    function parseNewExpression$912() {
        var callee$1280, args$1281;
        expectKeyword$889('new');
        callee$1280 = parseLeftHandSideExpression$914();
        args$1281 = match$890('(') ? parseArguments$907() : [];
        return delegate$844.createNewExpression(callee$1280, args$1281);
    }
    function parseLeftHandSideExpressionAllowCall$913() {
        var expr$1282, args$1283, property$1284;
        expr$1282 = matchKeyword$891('new') ? parseNewExpression$912() : parsePrimaryExpression$906();
        while (match$890('.') || match$890('[') || match$890('(') || lookahead$847.type === Token$825.Template) {
            if (match$890('(')) {
                args$1283 = parseArguments$907();
                expr$1282 = delegate$844.createCallExpression(expr$1282, args$1283);
            } else if (match$890('[')) {
                expr$1282 = delegate$844.createMemberExpression('[', expr$1282, parseComputedMember$911());
            } else if (match$890('.')) {
                expr$1282 = delegate$844.createMemberExpression('.', expr$1282, parseNonComputedMember$910());
            } else {
                expr$1282 = delegate$844.createTaggedTemplateExpression(expr$1282, parseTemplateLiteral$904());
            }
        }
        return expr$1282;
    }
    function parseLeftHandSideExpression$914() {
        var expr$1285, property$1286;
        expr$1285 = matchKeyword$891('new') ? parseNewExpression$912() : parsePrimaryExpression$906();
        while (match$890('.') || match$890('[') || lookahead$847.type === Token$825.Template) {
            if (match$890('[')) {
                expr$1285 = delegate$844.createMemberExpression('[', expr$1285, parseComputedMember$911());
            } else if (match$890('.')) {
                expr$1285 = delegate$844.createMemberExpression('.', expr$1285, parseNonComputedMember$910());
            } else {
                expr$1285 = delegate$844.createTaggedTemplateExpression(expr$1285, parseTemplateLiteral$904());
            }
        }
        return expr$1285;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$915() {
        var expr$1287 = parseLeftHandSideExpressionAllowCall$913(), token$1288 = lookahead$847;
        if (lookahead$847.type !== Token$825.Punctuator) {
            return expr$1287;
        }
        if ((match$890('++') || match$890('--')) && !peekLineTerminator$884()) {
            // 11.3.1, 11.3.2
            if (strict$835 && expr$1287.type === Syntax$828.Identifier && isRestrictedWord$862(expr$1287.name)) {
                throwErrorTolerant$886({}, Messages$830.StrictLHSPostfix);
            }
            if (!isLeftHandSide$895(expr$1287)) {
                throwError$885({}, Messages$830.InvalidLHSInAssignment);
            }
            token$1288 = lex$881();
            expr$1287 = delegate$844.createPostfixExpression(token$1288.value, expr$1287);
        }
        return expr$1287;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$916() {
        var token$1289, expr$1290;
        if (lookahead$847.type !== Token$825.Punctuator && lookahead$847.type !== Token$825.Keyword) {
            return parsePostfixExpression$915();
        }
        if (match$890('++') || match$890('--')) {
            token$1289 = lex$881();
            expr$1290 = parseUnaryExpression$916();
            // 11.4.4, 11.4.5
            if (strict$835 && expr$1290.type === Syntax$828.Identifier && isRestrictedWord$862(expr$1290.name)) {
                throwErrorTolerant$886({}, Messages$830.StrictLHSPrefix);
            }
            if (!isLeftHandSide$895(expr$1290)) {
                throwError$885({}, Messages$830.InvalidLHSInAssignment);
            }
            return delegate$844.createUnaryExpression(token$1289.value, expr$1290);
        }
        if (match$890('+') || match$890('-') || match$890('~') || match$890('!')) {
            token$1289 = lex$881();
            expr$1290 = parseUnaryExpression$916();
            return delegate$844.createUnaryExpression(token$1289.value, expr$1290);
        }
        if (matchKeyword$891('delete') || matchKeyword$891('void') || matchKeyword$891('typeof')) {
            token$1289 = lex$881();
            expr$1290 = parseUnaryExpression$916();
            expr$1290 = delegate$844.createUnaryExpression(token$1289.value, expr$1290);
            if (strict$835 && expr$1290.operator === 'delete' && expr$1290.argument.type === Syntax$828.Identifier) {
                throwErrorTolerant$886({}, Messages$830.StrictDelete);
            }
            return expr$1290;
        }
        return parsePostfixExpression$915();
    }
    function binaryPrecedence$917(token$1291, allowIn$1292) {
        var prec$1293 = 0;
        if (token$1291.type !== Token$825.Punctuator && token$1291.type !== Token$825.Keyword) {
            return 0;
        }
        switch (token$1291.value) {
        case '||':
            prec$1293 = 1;
            break;
        case '&&':
            prec$1293 = 2;
            break;
        case '|':
            prec$1293 = 3;
            break;
        case '^':
            prec$1293 = 4;
            break;
        case '&':
            prec$1293 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1293 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1293 = 7;
            break;
        case 'in':
            prec$1293 = allowIn$1292 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1293 = 8;
            break;
        case '+':
        case '-':
            prec$1293 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1293 = 11;
            break;
        default:
            break;
        }
        return prec$1293;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$918() {
        var expr$1294, token$1295, prec$1296, previousAllowIn$1297, stack$1298, right$1299, operator$1300, left$1301, i$1302;
        previousAllowIn$1297 = state$849.allowIn;
        state$849.allowIn = true;
        expr$1294 = parseUnaryExpression$916();
        token$1295 = lookahead$847;
        prec$1296 = binaryPrecedence$917(token$1295, previousAllowIn$1297);
        if (prec$1296 === 0) {
            return expr$1294;
        }
        token$1295.prec = prec$1296;
        lex$881();
        stack$1298 = [
            expr$1294,
            token$1295,
            parseUnaryExpression$916()
        ];
        while ((prec$1296 = binaryPrecedence$917(lookahead$847, previousAllowIn$1297)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1298.length > 2 && prec$1296 <= stack$1298[stack$1298.length - 2].prec) {
                right$1299 = stack$1298.pop();
                operator$1300 = stack$1298.pop().value;
                left$1301 = stack$1298.pop();
                stack$1298.push(delegate$844.createBinaryExpression(operator$1300, left$1301, right$1299));
            }
            // Shift.
            token$1295 = lex$881();
            token$1295.prec = prec$1296;
            stack$1298.push(token$1295);
            stack$1298.push(parseUnaryExpression$916());
        }
        state$849.allowIn = previousAllowIn$1297;
        // Final reduce to clean-up the stack.
        i$1302 = stack$1298.length - 1;
        expr$1294 = stack$1298[i$1302];
        while (i$1302 > 1) {
            expr$1294 = delegate$844.createBinaryExpression(stack$1298[i$1302 - 1].value, stack$1298[i$1302 - 2], expr$1294);
            i$1302 -= 2;
        }
        return expr$1294;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$919() {
        var expr$1303, previousAllowIn$1304, consequent$1305, alternate$1306;
        expr$1303 = parseBinaryExpression$918();
        if (match$890('?')) {
            lex$881();
            previousAllowIn$1304 = state$849.allowIn;
            state$849.allowIn = true;
            consequent$1305 = parseAssignmentExpression$924();
            state$849.allowIn = previousAllowIn$1304;
            expect$888(':');
            alternate$1306 = parseAssignmentExpression$924();
            expr$1303 = delegate$844.createConditionalExpression(expr$1303, consequent$1305, alternate$1306);
        }
        return expr$1303;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$920(expr$1307) {
        var i$1308, len$1309, property$1310, element$1311;
        if (expr$1307.type === Syntax$828.ObjectExpression) {
            expr$1307.type = Syntax$828.ObjectPattern;
            for (i$1308 = 0, len$1309 = expr$1307.properties.length; i$1308 < len$1309; i$1308 += 1) {
                property$1310 = expr$1307.properties[i$1308];
                if (property$1310.kind !== 'init') {
                    throwError$885({}, Messages$830.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$920(property$1310.value);
            }
        } else if (expr$1307.type === Syntax$828.ArrayExpression) {
            expr$1307.type = Syntax$828.ArrayPattern;
            for (i$1308 = 0, len$1309 = expr$1307.elements.length; i$1308 < len$1309; i$1308 += 1) {
                element$1311 = expr$1307.elements[i$1308];
                if (element$1311) {
                    reinterpretAsAssignmentBindingPattern$920(element$1311);
                }
            }
        } else if (expr$1307.type === Syntax$828.Identifier) {
            if (isRestrictedWord$862(expr$1307.name)) {
                throwError$885({}, Messages$830.InvalidLHSInAssignment);
            }
        } else if (expr$1307.type === Syntax$828.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$920(expr$1307.argument);
            if (expr$1307.argument.type === Syntax$828.ObjectPattern) {
                throwError$885({}, Messages$830.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1307.type !== Syntax$828.MemberExpression && expr$1307.type !== Syntax$828.CallExpression && expr$1307.type !== Syntax$828.NewExpression) {
                throwError$885({}, Messages$830.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$921(options$1312, expr$1313) {
        var i$1314, len$1315, property$1316, element$1317;
        if (expr$1313.type === Syntax$828.ObjectExpression) {
            expr$1313.type = Syntax$828.ObjectPattern;
            for (i$1314 = 0, len$1315 = expr$1313.properties.length; i$1314 < len$1315; i$1314 += 1) {
                property$1316 = expr$1313.properties[i$1314];
                if (property$1316.kind !== 'init') {
                    throwError$885({}, Messages$830.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$921(options$1312, property$1316.value);
            }
        } else if (expr$1313.type === Syntax$828.ArrayExpression) {
            expr$1313.type = Syntax$828.ArrayPattern;
            for (i$1314 = 0, len$1315 = expr$1313.elements.length; i$1314 < len$1315; i$1314 += 1) {
                element$1317 = expr$1313.elements[i$1314];
                if (element$1317) {
                    reinterpretAsDestructuredParameter$921(options$1312, element$1317);
                }
            }
        } else if (expr$1313.type === Syntax$828.Identifier) {
            validateParam$959(options$1312, expr$1313, expr$1313.name);
        } else {
            if (expr$1313.type !== Syntax$828.MemberExpression) {
                throwError$885({}, Messages$830.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$922(expressions$1318) {
        var i$1319, len$1320, param$1321, params$1322, defaults$1323, defaultCount$1324, options$1325, rest$1326;
        params$1322 = [];
        defaults$1323 = [];
        defaultCount$1324 = 0;
        rest$1326 = null;
        options$1325 = { paramSet: {} };
        for (i$1319 = 0, len$1320 = expressions$1318.length; i$1319 < len$1320; i$1319 += 1) {
            param$1321 = expressions$1318[i$1319];
            if (param$1321.type === Syntax$828.Identifier) {
                params$1322.push(param$1321);
                defaults$1323.push(null);
                validateParam$959(options$1325, param$1321, param$1321.name);
            } else if (param$1321.type === Syntax$828.ObjectExpression || param$1321.type === Syntax$828.ArrayExpression) {
                reinterpretAsDestructuredParameter$921(options$1325, param$1321);
                params$1322.push(param$1321);
                defaults$1323.push(null);
            } else if (param$1321.type === Syntax$828.SpreadElement) {
                assert$851(i$1319 === len$1320 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$921(options$1325, param$1321.argument);
                rest$1326 = param$1321.argument;
            } else if (param$1321.type === Syntax$828.AssignmentExpression) {
                params$1322.push(param$1321.left);
                defaults$1323.push(param$1321.right);
                ++defaultCount$1324;
                validateParam$959(options$1325, param$1321.left, param$1321.left.name);
            } else {
                return null;
            }
        }
        if (options$1325.message === Messages$830.StrictParamDupe) {
            throwError$885(strict$835 ? options$1325.stricted : options$1325.firstRestricted, options$1325.message);
        }
        if (defaultCount$1324 === 0) {
            defaults$1323 = [];
        }
        return {
            params: params$1322,
            defaults: defaults$1323,
            rest: rest$1326,
            stricted: options$1325.stricted,
            firstRestricted: options$1325.firstRestricted,
            message: options$1325.message
        };
    }
    function parseArrowFunctionExpression$923(options$1327) {
        var previousStrict$1328, previousYieldAllowed$1329, body$1330;
        expect$888('=>');
        previousStrict$1328 = strict$835;
        previousYieldAllowed$1329 = state$849.yieldAllowed;
        state$849.yieldAllowed = false;
        body$1330 = parseConciseBody$957();
        if (strict$835 && options$1327.firstRestricted) {
            throwError$885(options$1327.firstRestricted, options$1327.message);
        }
        if (strict$835 && options$1327.stricted) {
            throwErrorTolerant$886(options$1327.stricted, options$1327.message);
        }
        strict$835 = previousStrict$1328;
        state$849.yieldAllowed = previousYieldAllowed$1329;
        return delegate$844.createArrowFunctionExpression(options$1327.params, options$1327.defaults, body$1330, options$1327.rest, body$1330.type !== Syntax$828.BlockStatement);
    }
    function parseAssignmentExpression$924() {
        var expr$1331, token$1332, params$1333, oldParenthesizedCount$1334;
        if (matchKeyword$891('yield')) {
            return parseYieldExpression$964();
        }
        oldParenthesizedCount$1334 = state$849.parenthesizedCount;
        if (match$890('(')) {
            token$1332 = lookahead2$883();
            if (token$1332.type === Token$825.Punctuator && token$1332.value === ')' || token$1332.value === '...') {
                params$1333 = parseParams$961();
                if (!match$890('=>')) {
                    throwUnexpected$887(lex$881());
                }
                return parseArrowFunctionExpression$923(params$1333);
            }
        }
        token$1332 = lookahead$847;
        expr$1331 = parseConditionalExpression$919();
        if (match$890('=>') && (state$849.parenthesizedCount === oldParenthesizedCount$1334 || state$849.parenthesizedCount === oldParenthesizedCount$1334 + 1)) {
            if (expr$1331.type === Syntax$828.Identifier) {
                params$1333 = reinterpretAsCoverFormalsList$922([expr$1331]);
            } else if (expr$1331.type === Syntax$828.SequenceExpression) {
                params$1333 = reinterpretAsCoverFormalsList$922(expr$1331.expressions);
            }
            if (params$1333) {
                return parseArrowFunctionExpression$923(params$1333);
            }
        }
        if (matchAssign$893()) {
            // 11.13.1
            if (strict$835 && expr$1331.type === Syntax$828.Identifier && isRestrictedWord$862(expr$1331.name)) {
                throwErrorTolerant$886(token$1332, Messages$830.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$890('=') && (expr$1331.type === Syntax$828.ObjectExpression || expr$1331.type === Syntax$828.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$920(expr$1331);
            } else if (!isLeftHandSide$895(expr$1331)) {
                throwError$885({}, Messages$830.InvalidLHSInAssignment);
            }
            expr$1331 = delegate$844.createAssignmentExpression(lex$881().value, expr$1331, parseAssignmentExpression$924());
        }
        return expr$1331;
    }
    // 11.14 Comma Operator
    function parseExpression$925() {
        var expr$1335, expressions$1336, sequence$1337, coverFormalsList$1338, spreadFound$1339, oldParenthesizedCount$1340;
        oldParenthesizedCount$1340 = state$849.parenthesizedCount;
        expr$1335 = parseAssignmentExpression$924();
        expressions$1336 = [expr$1335];
        if (match$890(',')) {
            while (streamIndex$846 < length$843) {
                if (!match$890(',')) {
                    break;
                }
                lex$881();
                expr$1335 = parseSpreadOrAssignmentExpression$908();
                expressions$1336.push(expr$1335);
                if (expr$1335.type === Syntax$828.SpreadElement) {
                    spreadFound$1339 = true;
                    if (!match$890(')')) {
                        throwError$885({}, Messages$830.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1337 = delegate$844.createSequenceExpression(expressions$1336);
        }
        if (match$890('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$849.parenthesizedCount === oldParenthesizedCount$1340 || state$849.parenthesizedCount === oldParenthesizedCount$1340 + 1) {
                expr$1335 = expr$1335.type === Syntax$828.SequenceExpression ? expr$1335.expressions : expressions$1336;
                coverFormalsList$1338 = reinterpretAsCoverFormalsList$922(expr$1335);
                if (coverFormalsList$1338) {
                    return parseArrowFunctionExpression$923(coverFormalsList$1338);
                }
            }
            throwUnexpected$887(lex$881());
        }
        if (spreadFound$1339 && lookahead2$883().value !== '=>') {
            throwError$885({}, Messages$830.IllegalSpread);
        }
        return sequence$1337 || expr$1335;
    }
    // 12.1 Block
    function parseStatementList$926() {
        var list$1341 = [], statement$1342;
        while (streamIndex$846 < length$843) {
            if (match$890('}')) {
                break;
            }
            statement$1342 = parseSourceElement$971();
            if (typeof statement$1342 === 'undefined') {
                break;
            }
            list$1341.push(statement$1342);
        }
        return list$1341;
    }
    function parseBlock$927() {
        var block$1343;
        expect$888('{');
        block$1343 = parseStatementList$926();
        expect$888('}');
        return delegate$844.createBlockStatement(block$1343);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$928() {
        var token$1344 = lookahead$847, resolvedIdent$1345;
        if (token$1344.type !== Token$825.Identifier) {
            throwUnexpected$887(token$1344);
        }
        resolvedIdent$1345 = expander$824.resolve(tokenStream$845[lookaheadIndex$848]);
        lex$881();
        return delegate$844.createIdentifier(resolvedIdent$1345);
    }
    function parseVariableDeclaration$929(kind$1346) {
        var id$1347, init$1348 = null;
        if (match$890('{')) {
            id$1347 = parseObjectInitialiser$902();
            reinterpretAsAssignmentBindingPattern$920(id$1347);
        } else if (match$890('[')) {
            id$1347 = parseArrayInitialiser$897();
            reinterpretAsAssignmentBindingPattern$920(id$1347);
        } else {
            id$1347 = state$849.allowKeyword ? parseNonComputedProperty$909() : parseVariableIdentifier$928();
            // 12.2.1
            if (strict$835 && isRestrictedWord$862(id$1347.name)) {
                throwErrorTolerant$886({}, Messages$830.StrictVarName);
            }
        }
        if (kind$1346 === 'const') {
            if (!match$890('=')) {
                throwError$885({}, Messages$830.NoUnintializedConst);
            }
            expect$888('=');
            init$1348 = parseAssignmentExpression$924();
        } else if (match$890('=')) {
            lex$881();
            init$1348 = parseAssignmentExpression$924();
        }
        return delegate$844.createVariableDeclarator(id$1347, init$1348);
    }
    function parseVariableDeclarationList$930(kind$1349) {
        var list$1350 = [];
        do {
            list$1350.push(parseVariableDeclaration$929(kind$1349));
            if (!match$890(',')) {
                break;
            }
            lex$881();
        } while (streamIndex$846 < length$843);
        return list$1350;
    }
    function parseVariableStatement$931() {
        var declarations$1351;
        expectKeyword$889('var');
        declarations$1351 = parseVariableDeclarationList$930();
        consumeSemicolon$894();
        return delegate$844.createVariableDeclaration(declarations$1351, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$932(kind$1352) {
        var declarations$1353;
        expectKeyword$889(kind$1352);
        declarations$1353 = parseVariableDeclarationList$930(kind$1352);
        consumeSemicolon$894();
        return delegate$844.createVariableDeclaration(declarations$1353, kind$1352);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$933() {
        var id$1354, src$1355, body$1356;
        lex$881();
        // 'module'
        if (peekLineTerminator$884()) {
            throwError$885({}, Messages$830.NewlineAfterModule);
        }
        switch (lookahead$847.type) {
        case Token$825.StringLiteral:
            id$1354 = parsePrimaryExpression$906();
            body$1356 = parseModuleBlock$976();
            src$1355 = null;
            break;
        case Token$825.Identifier:
            id$1354 = parseVariableIdentifier$928();
            body$1356 = null;
            if (!matchContextualKeyword$892('from')) {
                throwUnexpected$887(lex$881());
            }
            lex$881();
            src$1355 = parsePrimaryExpression$906();
            if (src$1355.type !== Syntax$828.Literal) {
                throwError$885({}, Messages$830.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$894();
        return delegate$844.createModuleDeclaration(id$1354, src$1355, body$1356);
    }
    function parseExportBatchSpecifier$934() {
        expect$888('*');
        return delegate$844.createExportBatchSpecifier();
    }
    function parseExportSpecifier$935() {
        var id$1357, name$1358 = null;
        id$1357 = parseVariableIdentifier$928();
        if (matchContextualKeyword$892('as')) {
            lex$881();
            name$1358 = parseNonComputedProperty$909();
        }
        return delegate$844.createExportSpecifier(id$1357, name$1358);
    }
    function parseExportDeclaration$936() {
        var previousAllowKeyword$1359, decl$1360, def$1361, src$1362, specifiers$1363;
        expectKeyword$889('export');
        if (lookahead$847.type === Token$825.Keyword) {
            switch (lookahead$847.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$844.createExportDeclaration(parseSourceElement$971(), null, null);
            }
        }
        if (isIdentifierName$878(lookahead$847)) {
            previousAllowKeyword$1359 = state$849.allowKeyword;
            state$849.allowKeyword = true;
            decl$1360 = parseVariableDeclarationList$930('let');
            state$849.allowKeyword = previousAllowKeyword$1359;
            return delegate$844.createExportDeclaration(decl$1360, null, null);
        }
        specifiers$1363 = [];
        src$1362 = null;
        if (match$890('*')) {
            specifiers$1363.push(parseExportBatchSpecifier$934());
        } else {
            expect$888('{');
            do {
                specifiers$1363.push(parseExportSpecifier$935());
            } while (match$890(',') && lex$881());
            expect$888('}');
        }
        if (matchContextualKeyword$892('from')) {
            lex$881();
            src$1362 = parsePrimaryExpression$906();
            if (src$1362.type !== Syntax$828.Literal) {
                throwError$885({}, Messages$830.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$894();
        return delegate$844.createExportDeclaration(null, specifiers$1363, src$1362);
    }
    function parseImportDeclaration$937() {
        var specifiers$1364, kind$1365, src$1366;
        expectKeyword$889('import');
        specifiers$1364 = [];
        if (isIdentifierName$878(lookahead$847)) {
            kind$1365 = 'default';
            specifiers$1364.push(parseImportSpecifier$938());
            if (!matchContextualKeyword$892('from')) {
                throwError$885({}, Messages$830.NoFromAfterImport);
            }
            lex$881();
        } else if (match$890('{')) {
            kind$1365 = 'named';
            lex$881();
            do {
                specifiers$1364.push(parseImportSpecifier$938());
            } while (match$890(',') && lex$881());
            expect$888('}');
            if (!matchContextualKeyword$892('from')) {
                throwError$885({}, Messages$830.NoFromAfterImport);
            }
            lex$881();
        }
        src$1366 = parsePrimaryExpression$906();
        if (src$1366.type !== Syntax$828.Literal) {
            throwError$885({}, Messages$830.InvalidModuleSpecifier);
        }
        consumeSemicolon$894();
        return delegate$844.createImportDeclaration(specifiers$1364, kind$1365, src$1366);
    }
    function parseImportSpecifier$938() {
        var id$1367, name$1368 = null;
        id$1367 = parseNonComputedProperty$909();
        if (matchContextualKeyword$892('as')) {
            lex$881();
            name$1368 = parseVariableIdentifier$928();
        }
        return delegate$844.createImportSpecifier(id$1367, name$1368);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$939() {
        expect$888(';');
        return delegate$844.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$940() {
        var expr$1369 = parseExpression$925();
        consumeSemicolon$894();
        return delegate$844.createExpressionStatement(expr$1369);
    }
    // 12.5 If statement
    function parseIfStatement$941() {
        var test$1370, consequent$1371, alternate$1372;
        expectKeyword$889('if');
        expect$888('(');
        test$1370 = parseExpression$925();
        expect$888(')');
        consequent$1371 = parseStatement$956();
        if (matchKeyword$891('else')) {
            lex$881();
            alternate$1372 = parseStatement$956();
        } else {
            alternate$1372 = null;
        }
        return delegate$844.createIfStatement(test$1370, consequent$1371, alternate$1372);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$942() {
        var body$1373, test$1374, oldInIteration$1375;
        expectKeyword$889('do');
        oldInIteration$1375 = state$849.inIteration;
        state$849.inIteration = true;
        body$1373 = parseStatement$956();
        state$849.inIteration = oldInIteration$1375;
        expectKeyword$889('while');
        expect$888('(');
        test$1374 = parseExpression$925();
        expect$888(')');
        if (match$890(';')) {
            lex$881();
        }
        return delegate$844.createDoWhileStatement(body$1373, test$1374);
    }
    function parseWhileStatement$943() {
        var test$1376, body$1377, oldInIteration$1378;
        expectKeyword$889('while');
        expect$888('(');
        test$1376 = parseExpression$925();
        expect$888(')');
        oldInIteration$1378 = state$849.inIteration;
        state$849.inIteration = true;
        body$1377 = parseStatement$956();
        state$849.inIteration = oldInIteration$1378;
        return delegate$844.createWhileStatement(test$1376, body$1377);
    }
    function parseForVariableDeclaration$944() {
        var token$1379 = lex$881(), declarations$1380 = parseVariableDeclarationList$930();
        return delegate$844.createVariableDeclaration(declarations$1380, token$1379.value);
    }
    function parseForStatement$945(opts$1381) {
        var init$1382, test$1383, update$1384, left$1385, right$1386, body$1387, operator$1388, oldInIteration$1389;
        init$1382 = test$1383 = update$1384 = null;
        expectKeyword$889('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$892('each')) {
            throwError$885({}, Messages$830.EachNotAllowed);
        }
        expect$888('(');
        if (match$890(';')) {
            lex$881();
        } else {
            if (matchKeyword$891('var') || matchKeyword$891('let') || matchKeyword$891('const')) {
                state$849.allowIn = false;
                init$1382 = parseForVariableDeclaration$944();
                state$849.allowIn = true;
                if (init$1382.declarations.length === 1) {
                    if (matchKeyword$891('in') || matchContextualKeyword$892('of')) {
                        operator$1388 = lookahead$847;
                        if (!((operator$1388.value === 'in' || init$1382.kind !== 'var') && init$1382.declarations[0].init)) {
                            lex$881();
                            left$1385 = init$1382;
                            right$1386 = parseExpression$925();
                            init$1382 = null;
                        }
                    }
                }
            } else {
                state$849.allowIn = false;
                init$1382 = parseExpression$925();
                state$849.allowIn = true;
                if (matchContextualKeyword$892('of')) {
                    operator$1388 = lex$881();
                    left$1385 = init$1382;
                    right$1386 = parseExpression$925();
                    init$1382 = null;
                } else if (matchKeyword$891('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$896(init$1382)) {
                        throwError$885({}, Messages$830.InvalidLHSInForIn);
                    }
                    operator$1388 = lex$881();
                    left$1385 = init$1382;
                    right$1386 = parseExpression$925();
                    init$1382 = null;
                }
            }
            if (typeof left$1385 === 'undefined') {
                expect$888(';');
            }
        }
        if (typeof left$1385 === 'undefined') {
            if (!match$890(';')) {
                test$1383 = parseExpression$925();
            }
            expect$888(';');
            if (!match$890(')')) {
                update$1384 = parseExpression$925();
            }
        }
        expect$888(')');
        oldInIteration$1389 = state$849.inIteration;
        state$849.inIteration = true;
        if (!(opts$1381 !== undefined && opts$1381.ignoreBody)) {
            body$1387 = parseStatement$956();
        }
        state$849.inIteration = oldInIteration$1389;
        if (typeof left$1385 === 'undefined') {
            return delegate$844.createForStatement(init$1382, test$1383, update$1384, body$1387);
        }
        if (operator$1388.value === 'in') {
            return delegate$844.createForInStatement(left$1385, right$1386, body$1387);
        }
        return delegate$844.createForOfStatement(left$1385, right$1386, body$1387);
    }
    // 12.7 The continue statement
    function parseContinueStatement$946() {
        var label$1390 = null, key$1391;
        expectKeyword$889('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$847.value.charCodeAt(0) === 59) {
            lex$881();
            if (!state$849.inIteration) {
                throwError$885({}, Messages$830.IllegalContinue);
            }
            return delegate$844.createContinueStatement(null);
        }
        if (peekLineTerminator$884()) {
            if (!state$849.inIteration) {
                throwError$885({}, Messages$830.IllegalContinue);
            }
            return delegate$844.createContinueStatement(null);
        }
        if (lookahead$847.type === Token$825.Identifier) {
            label$1390 = parseVariableIdentifier$928();
            key$1391 = '$' + label$1390.name;
            if (!Object.prototype.hasOwnProperty.call(state$849.labelSet, key$1391)) {
                throwError$885({}, Messages$830.UnknownLabel, label$1390.name);
            }
        }
        consumeSemicolon$894();
        if (label$1390 === null && !state$849.inIteration) {
            throwError$885({}, Messages$830.IllegalContinue);
        }
        return delegate$844.createContinueStatement(label$1390);
    }
    // 12.8 The break statement
    function parseBreakStatement$947() {
        var label$1392 = null, key$1393;
        expectKeyword$889('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$847.value.charCodeAt(0) === 59) {
            lex$881();
            if (!(state$849.inIteration || state$849.inSwitch)) {
                throwError$885({}, Messages$830.IllegalBreak);
            }
            return delegate$844.createBreakStatement(null);
        }
        if (peekLineTerminator$884()) {
            if (!(state$849.inIteration || state$849.inSwitch)) {
                throwError$885({}, Messages$830.IllegalBreak);
            }
            return delegate$844.createBreakStatement(null);
        }
        if (lookahead$847.type === Token$825.Identifier) {
            label$1392 = parseVariableIdentifier$928();
            key$1393 = '$' + label$1392.name;
            if (!Object.prototype.hasOwnProperty.call(state$849.labelSet, key$1393)) {
                throwError$885({}, Messages$830.UnknownLabel, label$1392.name);
            }
        }
        consumeSemicolon$894();
        if (label$1392 === null && !(state$849.inIteration || state$849.inSwitch)) {
            throwError$885({}, Messages$830.IllegalBreak);
        }
        return delegate$844.createBreakStatement(label$1392);
    }
    // 12.9 The return statement
    function parseReturnStatement$948() {
        var argument$1394 = null;
        expectKeyword$889('return');
        if (!state$849.inFunctionBody) {
            throwErrorTolerant$886({}, Messages$830.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$858(String(lookahead$847.value).charCodeAt(0))) {
            argument$1394 = parseExpression$925();
            consumeSemicolon$894();
            return delegate$844.createReturnStatement(argument$1394);
        }
        if (peekLineTerminator$884()) {
            return delegate$844.createReturnStatement(null);
        }
        if (!match$890(';')) {
            if (!match$890('}') && lookahead$847.type !== Token$825.EOF) {
                argument$1394 = parseExpression$925();
            }
        }
        consumeSemicolon$894();
        return delegate$844.createReturnStatement(argument$1394);
    }
    // 12.10 The with statement
    function parseWithStatement$949() {
        var object$1395, body$1396;
        if (strict$835) {
            throwErrorTolerant$886({}, Messages$830.StrictModeWith);
        }
        expectKeyword$889('with');
        expect$888('(');
        object$1395 = parseExpression$925();
        expect$888(')');
        body$1396 = parseStatement$956();
        return delegate$844.createWithStatement(object$1395, body$1396);
    }
    // 12.10 The swith statement
    function parseSwitchCase$950() {
        var test$1397, consequent$1398 = [], sourceElement$1399;
        if (matchKeyword$891('default')) {
            lex$881();
            test$1397 = null;
        } else {
            expectKeyword$889('case');
            test$1397 = parseExpression$925();
        }
        expect$888(':');
        while (streamIndex$846 < length$843) {
            if (match$890('}') || matchKeyword$891('default') || matchKeyword$891('case')) {
                break;
            }
            sourceElement$1399 = parseSourceElement$971();
            if (typeof sourceElement$1399 === 'undefined') {
                break;
            }
            consequent$1398.push(sourceElement$1399);
        }
        return delegate$844.createSwitchCase(test$1397, consequent$1398);
    }
    function parseSwitchStatement$951() {
        var discriminant$1400, cases$1401, clause$1402, oldInSwitch$1403, defaultFound$1404;
        expectKeyword$889('switch');
        expect$888('(');
        discriminant$1400 = parseExpression$925();
        expect$888(')');
        expect$888('{');
        cases$1401 = [];
        if (match$890('}')) {
            lex$881();
            return delegate$844.createSwitchStatement(discriminant$1400, cases$1401);
        }
        oldInSwitch$1403 = state$849.inSwitch;
        state$849.inSwitch = true;
        defaultFound$1404 = false;
        while (streamIndex$846 < length$843) {
            if (match$890('}')) {
                break;
            }
            clause$1402 = parseSwitchCase$950();
            if (clause$1402.test === null) {
                if (defaultFound$1404) {
                    throwError$885({}, Messages$830.MultipleDefaultsInSwitch);
                }
                defaultFound$1404 = true;
            }
            cases$1401.push(clause$1402);
        }
        state$849.inSwitch = oldInSwitch$1403;
        expect$888('}');
        return delegate$844.createSwitchStatement(discriminant$1400, cases$1401);
    }
    // 12.13 The throw statement
    function parseThrowStatement$952() {
        var argument$1405;
        expectKeyword$889('throw');
        if (peekLineTerminator$884()) {
            throwError$885({}, Messages$830.NewlineAfterThrow);
        }
        argument$1405 = parseExpression$925();
        consumeSemicolon$894();
        return delegate$844.createThrowStatement(argument$1405);
    }
    // 12.14 The try statement
    function parseCatchClause$953() {
        var param$1406, body$1407;
        expectKeyword$889('catch');
        expect$888('(');
        if (match$890(')')) {
            throwUnexpected$887(lookahead$847);
        }
        param$1406 = parseExpression$925();
        // 12.14.1
        if (strict$835 && param$1406.type === Syntax$828.Identifier && isRestrictedWord$862(param$1406.name)) {
            throwErrorTolerant$886({}, Messages$830.StrictCatchVariable);
        }
        expect$888(')');
        body$1407 = parseBlock$927();
        return delegate$844.createCatchClause(param$1406, body$1407);
    }
    function parseTryStatement$954() {
        var block$1408, handlers$1409 = [], finalizer$1410 = null;
        expectKeyword$889('try');
        block$1408 = parseBlock$927();
        if (matchKeyword$891('catch')) {
            handlers$1409.push(parseCatchClause$953());
        }
        if (matchKeyword$891('finally')) {
            lex$881();
            finalizer$1410 = parseBlock$927();
        }
        if (handlers$1409.length === 0 && !finalizer$1410) {
            throwError$885({}, Messages$830.NoCatchOrFinally);
        }
        return delegate$844.createTryStatement(block$1408, [], handlers$1409, finalizer$1410);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$955() {
        expectKeyword$889('debugger');
        consumeSemicolon$894();
        return delegate$844.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$956() {
        var type$1411 = lookahead$847.type, expr$1412, labeledBody$1413, key$1414;
        if (type$1411 === Token$825.EOF) {
            throwUnexpected$887(lookahead$847);
        }
        if (type$1411 === Token$825.Punctuator) {
            switch (lookahead$847.value) {
            case ';':
                return parseEmptyStatement$939();
            case '{':
                return parseBlock$927();
            case '(':
                return parseExpressionStatement$940();
            default:
                break;
            }
        }
        if (type$1411 === Token$825.Keyword) {
            switch (lookahead$847.value) {
            case 'break':
                return parseBreakStatement$947();
            case 'continue':
                return parseContinueStatement$946();
            case 'debugger':
                return parseDebuggerStatement$955();
            case 'do':
                return parseDoWhileStatement$942();
            case 'for':
                return parseForStatement$945();
            case 'function':
                return parseFunctionDeclaration$962();
            case 'class':
                return parseClassDeclaration$969();
            case 'if':
                return parseIfStatement$941();
            case 'return':
                return parseReturnStatement$948();
            case 'switch':
                return parseSwitchStatement$951();
            case 'throw':
                return parseThrowStatement$952();
            case 'try':
                return parseTryStatement$954();
            case 'var':
                return parseVariableStatement$931();
            case 'while':
                return parseWhileStatement$943();
            case 'with':
                return parseWithStatement$949();
            default:
                break;
            }
        }
        expr$1412 = parseExpression$925();
        // 12.12 Labelled Statements
        if (expr$1412.type === Syntax$828.Identifier && match$890(':')) {
            lex$881();
            key$1414 = '$' + expr$1412.name;
            if (Object.prototype.hasOwnProperty.call(state$849.labelSet, key$1414)) {
                throwError$885({}, Messages$830.Redeclaration, 'Label', expr$1412.name);
            }
            state$849.labelSet[key$1414] = true;
            labeledBody$1413 = parseStatement$956();
            delete state$849.labelSet[key$1414];
            return delegate$844.createLabeledStatement(expr$1412, labeledBody$1413);
        }
        consumeSemicolon$894();
        return delegate$844.createExpressionStatement(expr$1412);
    }
    // 13 Function Definition
    function parseConciseBody$957() {
        if (match$890('{')) {
            return parseFunctionSourceElements$958();
        }
        return parseAssignmentExpression$924();
    }
    function parseFunctionSourceElements$958() {
        var sourceElement$1415, sourceElements$1416 = [], token$1417, directive$1418, firstRestricted$1419, oldLabelSet$1420, oldInIteration$1421, oldInSwitch$1422, oldInFunctionBody$1423, oldParenthesizedCount$1424;
        expect$888('{');
        while (streamIndex$846 < length$843) {
            if (lookahead$847.type !== Token$825.StringLiteral) {
                break;
            }
            token$1417 = lookahead$847;
            sourceElement$1415 = parseSourceElement$971();
            sourceElements$1416.push(sourceElement$1415);
            if (sourceElement$1415.expression.type !== Syntax$828.Literal) {
                // this is not directive
                break;
            }
            directive$1418 = token$1417.value;
            if (directive$1418 === 'use strict') {
                strict$835 = true;
                if (firstRestricted$1419) {
                    throwErrorTolerant$886(firstRestricted$1419, Messages$830.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1419 && token$1417.octal) {
                    firstRestricted$1419 = token$1417;
                }
            }
        }
        oldLabelSet$1420 = state$849.labelSet;
        oldInIteration$1421 = state$849.inIteration;
        oldInSwitch$1422 = state$849.inSwitch;
        oldInFunctionBody$1423 = state$849.inFunctionBody;
        oldParenthesizedCount$1424 = state$849.parenthesizedCount;
        state$849.labelSet = {};
        state$849.inIteration = false;
        state$849.inSwitch = false;
        state$849.inFunctionBody = true;
        state$849.parenthesizedCount = 0;
        while (streamIndex$846 < length$843) {
            if (match$890('}')) {
                break;
            }
            sourceElement$1415 = parseSourceElement$971();
            if (typeof sourceElement$1415 === 'undefined') {
                break;
            }
            sourceElements$1416.push(sourceElement$1415);
        }
        expect$888('}');
        state$849.labelSet = oldLabelSet$1420;
        state$849.inIteration = oldInIteration$1421;
        state$849.inSwitch = oldInSwitch$1422;
        state$849.inFunctionBody = oldInFunctionBody$1423;
        state$849.parenthesizedCount = oldParenthesizedCount$1424;
        return delegate$844.createBlockStatement(sourceElements$1416);
    }
    function validateParam$959(options$1425, param$1426, name$1427) {
        var key$1428 = '$' + name$1427;
        if (strict$835) {
            if (isRestrictedWord$862(name$1427)) {
                options$1425.stricted = param$1426;
                options$1425.message = Messages$830.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1425.paramSet, key$1428)) {
                options$1425.stricted = param$1426;
                options$1425.message = Messages$830.StrictParamDupe;
            }
        } else if (!options$1425.firstRestricted) {
            if (isRestrictedWord$862(name$1427)) {
                options$1425.firstRestricted = param$1426;
                options$1425.message = Messages$830.StrictParamName;
            } else if (isStrictModeReservedWord$861(name$1427)) {
                options$1425.firstRestricted = param$1426;
                options$1425.message = Messages$830.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1425.paramSet, key$1428)) {
                options$1425.firstRestricted = param$1426;
                options$1425.message = Messages$830.StrictParamDupe;
            }
        }
        options$1425.paramSet[key$1428] = true;
    }
    function parseParam$960(options$1429) {
        var token$1430, rest$1431, param$1432, def$1433;
        token$1430 = lookahead$847;
        if (token$1430.value === '...') {
            token$1430 = lex$881();
            rest$1431 = true;
        }
        if (match$890('[')) {
            param$1432 = parseArrayInitialiser$897();
            reinterpretAsDestructuredParameter$921(options$1429, param$1432);
        } else if (match$890('{')) {
            if (rest$1431) {
                throwError$885({}, Messages$830.ObjectPatternAsRestParameter);
            }
            param$1432 = parseObjectInitialiser$902();
            reinterpretAsDestructuredParameter$921(options$1429, param$1432);
        } else {
            param$1432 = parseVariableIdentifier$928();
            validateParam$959(options$1429, token$1430, token$1430.value);
            if (match$890('=')) {
                if (rest$1431) {
                    throwErrorTolerant$886(lookahead$847, Messages$830.DefaultRestParameter);
                }
                lex$881();
                def$1433 = parseAssignmentExpression$924();
                ++options$1429.defaultCount;
            }
        }
        if (rest$1431) {
            if (!match$890(')')) {
                throwError$885({}, Messages$830.ParameterAfterRestParameter);
            }
            options$1429.rest = param$1432;
            return false;
        }
        options$1429.params.push(param$1432);
        options$1429.defaults.push(def$1433);
        return !match$890(')');
    }
    function parseParams$961(firstRestricted$1434) {
        var options$1435;
        options$1435 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1434
        };
        expect$888('(');
        if (!match$890(')')) {
            options$1435.paramSet = {};
            while (streamIndex$846 < length$843) {
                if (!parseParam$960(options$1435)) {
                    break;
                }
                expect$888(',');
            }
        }
        expect$888(')');
        if (options$1435.defaultCount === 0) {
            options$1435.defaults = [];
        }
        return options$1435;
    }
    function parseFunctionDeclaration$962() {
        var id$1436, body$1437, token$1438, tmp$1439, firstRestricted$1440, message$1441, previousStrict$1442, previousYieldAllowed$1443, generator$1444, expression$1445;
        expectKeyword$889('function');
        generator$1444 = false;
        if (match$890('*')) {
            lex$881();
            generator$1444 = true;
        }
        token$1438 = lookahead$847;
        id$1436 = parseVariableIdentifier$928();
        if (strict$835) {
            if (isRestrictedWord$862(token$1438.value)) {
                throwErrorTolerant$886(token$1438, Messages$830.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$862(token$1438.value)) {
                firstRestricted$1440 = token$1438;
                message$1441 = Messages$830.StrictFunctionName;
            } else if (isStrictModeReservedWord$861(token$1438.value)) {
                firstRestricted$1440 = token$1438;
                message$1441 = Messages$830.StrictReservedWord;
            }
        }
        tmp$1439 = parseParams$961(firstRestricted$1440);
        firstRestricted$1440 = tmp$1439.firstRestricted;
        if (tmp$1439.message) {
            message$1441 = tmp$1439.message;
        }
        previousStrict$1442 = strict$835;
        previousYieldAllowed$1443 = state$849.yieldAllowed;
        state$849.yieldAllowed = generator$1444;
        // here we redo some work in order to set 'expression'
        expression$1445 = !match$890('{');
        body$1437 = parseConciseBody$957();
        if (strict$835 && firstRestricted$1440) {
            throwError$885(firstRestricted$1440, message$1441);
        }
        if (strict$835 && tmp$1439.stricted) {
            throwErrorTolerant$886(tmp$1439.stricted, message$1441);
        }
        if (state$849.yieldAllowed && !state$849.yieldFound) {
            throwErrorTolerant$886({}, Messages$830.NoYieldInGenerator);
        }
        strict$835 = previousStrict$1442;
        state$849.yieldAllowed = previousYieldAllowed$1443;
        return delegate$844.createFunctionDeclaration(id$1436, tmp$1439.params, tmp$1439.defaults, body$1437, tmp$1439.rest, generator$1444, expression$1445);
    }
    function parseFunctionExpression$963() {
        var token$1446, id$1447 = null, firstRestricted$1448, message$1449, tmp$1450, body$1451, previousStrict$1452, previousYieldAllowed$1453, generator$1454, expression$1455;
        expectKeyword$889('function');
        generator$1454 = false;
        if (match$890('*')) {
            lex$881();
            generator$1454 = true;
        }
        if (!match$890('(')) {
            token$1446 = lookahead$847;
            id$1447 = parseVariableIdentifier$928();
            if (strict$835) {
                if (isRestrictedWord$862(token$1446.value)) {
                    throwErrorTolerant$886(token$1446, Messages$830.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$862(token$1446.value)) {
                    firstRestricted$1448 = token$1446;
                    message$1449 = Messages$830.StrictFunctionName;
                } else if (isStrictModeReservedWord$861(token$1446.value)) {
                    firstRestricted$1448 = token$1446;
                    message$1449 = Messages$830.StrictReservedWord;
                }
            }
        }
        tmp$1450 = parseParams$961(firstRestricted$1448);
        firstRestricted$1448 = tmp$1450.firstRestricted;
        if (tmp$1450.message) {
            message$1449 = tmp$1450.message;
        }
        previousStrict$1452 = strict$835;
        previousYieldAllowed$1453 = state$849.yieldAllowed;
        state$849.yieldAllowed = generator$1454;
        // here we redo some work in order to set 'expression'
        expression$1455 = !match$890('{');
        body$1451 = parseConciseBody$957();
        if (strict$835 && firstRestricted$1448) {
            throwError$885(firstRestricted$1448, message$1449);
        }
        if (strict$835 && tmp$1450.stricted) {
            throwErrorTolerant$886(tmp$1450.stricted, message$1449);
        }
        if (state$849.yieldAllowed && !state$849.yieldFound) {
            throwErrorTolerant$886({}, Messages$830.NoYieldInGenerator);
        }
        strict$835 = previousStrict$1452;
        state$849.yieldAllowed = previousYieldAllowed$1453;
        return delegate$844.createFunctionExpression(id$1447, tmp$1450.params, tmp$1450.defaults, body$1451, tmp$1450.rest, generator$1454, expression$1455);
    }
    function parseYieldExpression$964() {
        var delegateFlag$1456, expr$1457, previousYieldAllowed$1458;
        expectKeyword$889('yield');
        if (!state$849.yieldAllowed) {
            throwErrorTolerant$886({}, Messages$830.IllegalYield);
        }
        delegateFlag$1456 = false;
        if (match$890('*')) {
            lex$881();
            delegateFlag$1456 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1458 = state$849.yieldAllowed;
        state$849.yieldAllowed = false;
        expr$1457 = parseAssignmentExpression$924();
        state$849.yieldAllowed = previousYieldAllowed$1458;
        state$849.yieldFound = true;
        return delegate$844.createYieldExpression(expr$1457, delegateFlag$1456);
    }
    // 14 Classes
    function parseMethodDefinition$965(existingPropNames$1459) {
        var token$1460, key$1461, param$1462, propType$1463, isValidDuplicateProp$1464 = false;
        if (lookahead$847.value === 'static') {
            propType$1463 = ClassPropertyType$833.static;
            lex$881();
        } else {
            propType$1463 = ClassPropertyType$833.prototype;
        }
        if (match$890('*')) {
            lex$881();
            return delegate$844.createMethodDefinition(propType$1463, '', parseObjectPropertyKey$900(), parsePropertyMethodFunction$899({ generator: true }));
        }
        token$1460 = lookahead$847;
        key$1461 = parseObjectPropertyKey$900();
        if (token$1460.value === 'get' && !match$890('(')) {
            key$1461 = parseObjectPropertyKey$900();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1459[propType$1463].hasOwnProperty(key$1461.name)) {
                isValidDuplicateProp$1464 = existingPropNames$1459[propType$1463][key$1461.name].get === undefined && existingPropNames$1459[propType$1463][key$1461.name].data === undefined && existingPropNames$1459[propType$1463][key$1461.name].set !== undefined;
                if (!isValidDuplicateProp$1464) {
                    throwError$885(key$1461, Messages$830.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1459[propType$1463][key$1461.name] = {};
            }
            existingPropNames$1459[propType$1463][key$1461.name].get = true;
            expect$888('(');
            expect$888(')');
            return delegate$844.createMethodDefinition(propType$1463, 'get', key$1461, parsePropertyFunction$898({ generator: false }));
        }
        if (token$1460.value === 'set' && !match$890('(')) {
            key$1461 = parseObjectPropertyKey$900();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1459[propType$1463].hasOwnProperty(key$1461.name)) {
                isValidDuplicateProp$1464 = existingPropNames$1459[propType$1463][key$1461.name].set === undefined && existingPropNames$1459[propType$1463][key$1461.name].data === undefined && existingPropNames$1459[propType$1463][key$1461.name].get !== undefined;
                if (!isValidDuplicateProp$1464) {
                    throwError$885(key$1461, Messages$830.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1459[propType$1463][key$1461.name] = {};
            }
            existingPropNames$1459[propType$1463][key$1461.name].set = true;
            expect$888('(');
            token$1460 = lookahead$847;
            param$1462 = [parseVariableIdentifier$928()];
            expect$888(')');
            return delegate$844.createMethodDefinition(propType$1463, 'set', key$1461, parsePropertyFunction$898({
                params: param$1462,
                generator: false,
                name: token$1460
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1459[propType$1463].hasOwnProperty(key$1461.name)) {
            throwError$885(key$1461, Messages$830.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1459[propType$1463][key$1461.name] = {};
        }
        existingPropNames$1459[propType$1463][key$1461.name].data = true;
        return delegate$844.createMethodDefinition(propType$1463, '', key$1461, parsePropertyMethodFunction$899({ generator: false }));
    }
    function parseClassElement$966(existingProps$1465) {
        if (match$890(';')) {
            lex$881();
            return;
        }
        return parseMethodDefinition$965(existingProps$1465);
    }
    function parseClassBody$967() {
        var classElement$1466, classElements$1467 = [], existingProps$1468 = {};
        existingProps$1468[ClassPropertyType$833.static] = {};
        existingProps$1468[ClassPropertyType$833.prototype] = {};
        expect$888('{');
        while (streamIndex$846 < length$843) {
            if (match$890('}')) {
                break;
            }
            classElement$1466 = parseClassElement$966(existingProps$1468);
            if (typeof classElement$1466 !== 'undefined') {
                classElements$1467.push(classElement$1466);
            }
        }
        expect$888('}');
        return delegate$844.createClassBody(classElements$1467);
    }
    function parseClassExpression$968() {
        var id$1469, previousYieldAllowed$1470, superClass$1471 = null;
        expectKeyword$889('class');
        if (!matchKeyword$891('extends') && !match$890('{')) {
            id$1469 = parseVariableIdentifier$928();
        }
        if (matchKeyword$891('extends')) {
            expectKeyword$889('extends');
            previousYieldAllowed$1470 = state$849.yieldAllowed;
            state$849.yieldAllowed = false;
            superClass$1471 = parseAssignmentExpression$924();
            state$849.yieldAllowed = previousYieldAllowed$1470;
        }
        return delegate$844.createClassExpression(id$1469, superClass$1471, parseClassBody$967());
    }
    function parseClassDeclaration$969() {
        var id$1472, previousYieldAllowed$1473, superClass$1474 = null;
        expectKeyword$889('class');
        id$1472 = parseVariableIdentifier$928();
        if (matchKeyword$891('extends')) {
            expectKeyword$889('extends');
            previousYieldAllowed$1473 = state$849.yieldAllowed;
            state$849.yieldAllowed = false;
            superClass$1474 = parseAssignmentExpression$924();
            state$849.yieldAllowed = previousYieldAllowed$1473;
        }
        return delegate$844.createClassDeclaration(id$1472, superClass$1474, parseClassBody$967());
    }
    // 15 Program
    function matchModuleDeclaration$970() {
        var id$1475;
        if (matchContextualKeyword$892('module')) {
            id$1475 = lookahead2$883();
            return id$1475.type === Token$825.StringLiteral || id$1475.type === Token$825.Identifier;
        }
        return false;
    }
    function parseSourceElement$971() {
        if (lookahead$847.type === Token$825.Keyword) {
            switch (lookahead$847.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$932(lookahead$847.value);
            case 'function':
                return parseFunctionDeclaration$962();
            case 'export':
                return parseExportDeclaration$936();
            case 'import':
                return parseImportDeclaration$937();
            default:
                return parseStatement$956();
            }
        }
        if (matchModuleDeclaration$970()) {
            throwError$885({}, Messages$830.NestedModule);
        }
        if (lookahead$847.type !== Token$825.EOF) {
            return parseStatement$956();
        }
    }
    function parseProgramElement$972() {
        if (lookahead$847.type === Token$825.Keyword) {
            switch (lookahead$847.value) {
            case 'export':
                return parseExportDeclaration$936();
            case 'import':
                return parseImportDeclaration$937();
            }
        }
        if (matchModuleDeclaration$970()) {
            return parseModuleDeclaration$933();
        }
        return parseSourceElement$971();
    }
    function parseProgramElements$973() {
        var sourceElement$1476, sourceElements$1477 = [], token$1478, directive$1479, firstRestricted$1480;
        while (streamIndex$846 < length$843) {
            token$1478 = lookahead$847;
            if (token$1478.type !== Token$825.StringLiteral) {
                break;
            }
            sourceElement$1476 = parseProgramElement$972();
            sourceElements$1477.push(sourceElement$1476);
            if (sourceElement$1476.expression.type !== Syntax$828.Literal) {
                // this is not directive
                break;
            }
            assert$851(false, 'directive isn\'t right');
            directive$1479 = source$834.slice(token$1478.range[0] + 1, token$1478.range[1] - 1);
            if (directive$1479 === 'use strict') {
                strict$835 = true;
                if (firstRestricted$1480) {
                    throwErrorTolerant$886(firstRestricted$1480, Messages$830.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1480 && token$1478.octal) {
                    firstRestricted$1480 = token$1478;
                }
            }
        }
        while (streamIndex$846 < length$843) {
            sourceElement$1476 = parseProgramElement$972();
            if (typeof sourceElement$1476 === 'undefined') {
                break;
            }
            sourceElements$1477.push(sourceElement$1476);
        }
        return sourceElements$1477;
    }
    function parseModuleElement$974() {
        return parseSourceElement$971();
    }
    function parseModuleElements$975() {
        var list$1481 = [], statement$1482;
        while (streamIndex$846 < length$843) {
            if (match$890('}')) {
                break;
            }
            statement$1482 = parseModuleElement$974();
            if (typeof statement$1482 === 'undefined') {
                break;
            }
            list$1481.push(statement$1482);
        }
        return list$1481;
    }
    function parseModuleBlock$976() {
        var block$1483;
        expect$888('{');
        block$1483 = parseModuleElements$975();
        expect$888('}');
        return delegate$844.createBlockStatement(block$1483);
    }
    function parseProgram$977() {
        var body$1484;
        strict$835 = false;
        peek$882();
        body$1484 = parseProgramElements$973();
        return delegate$844.createProgram(body$1484);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$978(type$1485, value$1486, start$1487, end$1488, loc$1489) {
        assert$851(typeof start$1487 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$850.comments.length > 0) {
            if (extra$850.comments[extra$850.comments.length - 1].range[1] > start$1487) {
                return;
            }
        }
        extra$850.comments.push({
            type: type$1485,
            value: value$1486,
            range: [
                start$1487,
                end$1488
            ],
            loc: loc$1489
        });
    }
    function scanComment$979() {
        var comment$1490, ch$1491, loc$1492, start$1493, blockComment$1494, lineComment$1495;
        comment$1490 = '';
        blockComment$1494 = false;
        lineComment$1495 = false;
        while (index$836 < length$843) {
            ch$1491 = source$834[index$836];
            if (lineComment$1495) {
                ch$1491 = source$834[index$836++];
                if (isLineTerminator$857(ch$1491.charCodeAt(0))) {
                    loc$1492.end = {
                        line: lineNumber$837,
                        column: index$836 - lineStart$838 - 1
                    };
                    lineComment$1495 = false;
                    addComment$978('Line', comment$1490, start$1493, index$836 - 1, loc$1492);
                    if (ch$1491 === '\r' && source$834[index$836] === '\n') {
                        ++index$836;
                    }
                    ++lineNumber$837;
                    lineStart$838 = index$836;
                    comment$1490 = '';
                } else if (index$836 >= length$843) {
                    lineComment$1495 = false;
                    comment$1490 += ch$1491;
                    loc$1492.end = {
                        line: lineNumber$837,
                        column: length$843 - lineStart$838
                    };
                    addComment$978('Line', comment$1490, start$1493, length$843, loc$1492);
                } else {
                    comment$1490 += ch$1491;
                }
            } else if (blockComment$1494) {
                if (isLineTerminator$857(ch$1491.charCodeAt(0))) {
                    if (ch$1491 === '\r' && source$834[index$836 + 1] === '\n') {
                        ++index$836;
                        comment$1490 += '\r\n';
                    } else {
                        comment$1490 += ch$1491;
                    }
                    ++lineNumber$837;
                    ++index$836;
                    lineStart$838 = index$836;
                    if (index$836 >= length$843) {
                        throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1491 = source$834[index$836++];
                    if (index$836 >= length$843) {
                        throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1490 += ch$1491;
                    if (ch$1491 === '*') {
                        ch$1491 = source$834[index$836];
                        if (ch$1491 === '/') {
                            comment$1490 = comment$1490.substr(0, comment$1490.length - 1);
                            blockComment$1494 = false;
                            ++index$836;
                            loc$1492.end = {
                                line: lineNumber$837,
                                column: index$836 - lineStart$838
                            };
                            addComment$978('Block', comment$1490, start$1493, index$836, loc$1492);
                            comment$1490 = '';
                        }
                    }
                }
            } else if (ch$1491 === '/') {
                ch$1491 = source$834[index$836 + 1];
                if (ch$1491 === '/') {
                    loc$1492 = {
                        start: {
                            line: lineNumber$837,
                            column: index$836 - lineStart$838
                        }
                    };
                    start$1493 = index$836;
                    index$836 += 2;
                    lineComment$1495 = true;
                    if (index$836 >= length$843) {
                        loc$1492.end = {
                            line: lineNumber$837,
                            column: index$836 - lineStart$838
                        };
                        lineComment$1495 = false;
                        addComment$978('Line', comment$1490, start$1493, index$836, loc$1492);
                    }
                } else if (ch$1491 === '*') {
                    start$1493 = index$836;
                    index$836 += 2;
                    blockComment$1494 = true;
                    loc$1492 = {
                        start: {
                            line: lineNumber$837,
                            column: index$836 - lineStart$838 - 2
                        }
                    };
                    if (index$836 >= length$843) {
                        throwError$885({}, Messages$830.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$856(ch$1491.charCodeAt(0))) {
                ++index$836;
            } else if (isLineTerminator$857(ch$1491.charCodeAt(0))) {
                ++index$836;
                if (ch$1491 === '\r' && source$834[index$836] === '\n') {
                    ++index$836;
                }
                ++lineNumber$837;
                lineStart$838 = index$836;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$980() {
        var i$1496, entry$1497, comment$1498, comments$1499 = [];
        for (i$1496 = 0; i$1496 < extra$850.comments.length; ++i$1496) {
            entry$1497 = extra$850.comments[i$1496];
            comment$1498 = {
                type: entry$1497.type,
                value: entry$1497.value
            };
            if (extra$850.range) {
                comment$1498.range = entry$1497.range;
            }
            if (extra$850.loc) {
                comment$1498.loc = entry$1497.loc;
            }
            comments$1499.push(comment$1498);
        }
        extra$850.comments = comments$1499;
    }
    function collectToken$981() {
        var start$1500, loc$1501, token$1502, range$1503, value$1504;
        skipComment$864();
        start$1500 = index$836;
        loc$1501 = {
            start: {
                line: lineNumber$837,
                column: index$836 - lineStart$838
            }
        };
        token$1502 = extra$850.advance();
        loc$1501.end = {
            line: lineNumber$837,
            column: index$836 - lineStart$838
        };
        if (token$1502.type !== Token$825.EOF) {
            range$1503 = [
                token$1502.range[0],
                token$1502.range[1]
            ];
            value$1504 = source$834.slice(token$1502.range[0], token$1502.range[1]);
            extra$850.tokens.push({
                type: TokenName$826[token$1502.type],
                value: value$1504,
                range: range$1503,
                loc: loc$1501
            });
        }
        return token$1502;
    }
    function collectRegex$982() {
        var pos$1505, loc$1506, regex$1507, token$1508;
        skipComment$864();
        pos$1505 = index$836;
        loc$1506 = {
            start: {
                line: lineNumber$837,
                column: index$836 - lineStart$838
            }
        };
        regex$1507 = extra$850.scanRegExp();
        loc$1506.end = {
            line: lineNumber$837,
            column: index$836 - lineStart$838
        };
        if (!extra$850.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$850.tokens.length > 0) {
                token$1508 = extra$850.tokens[extra$850.tokens.length - 1];
                if (token$1508.range[0] === pos$1505 && token$1508.type === 'Punctuator') {
                    if (token$1508.value === '/' || token$1508.value === '/=') {
                        extra$850.tokens.pop();
                    }
                }
            }
            extra$850.tokens.push({
                type: 'RegularExpression',
                value: regex$1507.literal,
                range: [
                    pos$1505,
                    index$836
                ],
                loc: loc$1506
            });
        }
        return regex$1507;
    }
    function filterTokenLocation$983() {
        var i$1509, entry$1510, token$1511, tokens$1512 = [];
        for (i$1509 = 0; i$1509 < extra$850.tokens.length; ++i$1509) {
            entry$1510 = extra$850.tokens[i$1509];
            token$1511 = {
                type: entry$1510.type,
                value: entry$1510.value
            };
            if (extra$850.range) {
                token$1511.range = entry$1510.range;
            }
            if (extra$850.loc) {
                token$1511.loc = entry$1510.loc;
            }
            tokens$1512.push(token$1511);
        }
        extra$850.tokens = tokens$1512;
    }
    function LocationMarker$984() {
        var sm_index$1513 = lookahead$847 ? lookahead$847.sm_range[0] : 0;
        var sm_lineStart$1514 = lookahead$847 ? lookahead$847.sm_lineStart : 0;
        var sm_lineNumber$1515 = lookahead$847 ? lookahead$847.sm_lineNumber : 1;
        this.range = [
            sm_index$1513,
            sm_index$1513
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1515,
                column: sm_index$1513 - sm_lineStart$1514
            },
            end: {
                line: sm_lineNumber$1515,
                column: sm_index$1513 - sm_lineStart$1514
            }
        };
    }
    LocationMarker$984.prototype = {
        constructor: LocationMarker$984,
        end: function () {
            this.range[1] = sm_index$842;
            this.loc.end.line = sm_lineNumber$839;
            this.loc.end.column = sm_index$842 - sm_lineStart$840;
        },
        applyGroup: function (node$1516) {
            if (extra$850.range) {
                node$1516.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$850.loc) {
                node$1516.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1516 = delegate$844.postProcess(node$1516);
            }
        },
        apply: function (node$1517) {
            var nodeType$1518 = typeof node$1517;
            assert$851(nodeType$1518 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1518);
            if (extra$850.range) {
                node$1517.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$850.loc) {
                node$1517.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1517 = delegate$844.postProcess(node$1517);
            }
        }
    };
    function createLocationMarker$985() {
        return new LocationMarker$984();
    }
    function trackGroupExpression$986() {
        var marker$1519, expr$1520;
        marker$1519 = createLocationMarker$985();
        expect$888('(');
        ++state$849.parenthesizedCount;
        expr$1520 = parseExpression$925();
        expect$888(')');
        marker$1519.end();
        marker$1519.applyGroup(expr$1520);
        return expr$1520;
    }
    function trackLeftHandSideExpression$987() {
        var marker$1521, expr$1522;
        // skipComment();
        marker$1521 = createLocationMarker$985();
        expr$1522 = matchKeyword$891('new') ? parseNewExpression$912() : parsePrimaryExpression$906();
        while (match$890('.') || match$890('[') || lookahead$847.type === Token$825.Template) {
            if (match$890('[')) {
                expr$1522 = delegate$844.createMemberExpression('[', expr$1522, parseComputedMember$911());
                marker$1521.end();
                marker$1521.apply(expr$1522);
            } else if (match$890('.')) {
                expr$1522 = delegate$844.createMemberExpression('.', expr$1522, parseNonComputedMember$910());
                marker$1521.end();
                marker$1521.apply(expr$1522);
            } else {
                expr$1522 = delegate$844.createTaggedTemplateExpression(expr$1522, parseTemplateLiteral$904());
                marker$1521.end();
                marker$1521.apply(expr$1522);
            }
        }
        return expr$1522;
    }
    function trackLeftHandSideExpressionAllowCall$988() {
        var marker$1523, expr$1524, args$1525;
        // skipComment();
        marker$1523 = createLocationMarker$985();
        expr$1524 = matchKeyword$891('new') ? parseNewExpression$912() : parsePrimaryExpression$906();
        while (match$890('.') || match$890('[') || match$890('(') || lookahead$847.type === Token$825.Template) {
            if (match$890('(')) {
                args$1525 = parseArguments$907();
                expr$1524 = delegate$844.createCallExpression(expr$1524, args$1525);
                marker$1523.end();
                marker$1523.apply(expr$1524);
            } else if (match$890('[')) {
                expr$1524 = delegate$844.createMemberExpression('[', expr$1524, parseComputedMember$911());
                marker$1523.end();
                marker$1523.apply(expr$1524);
            } else if (match$890('.')) {
                expr$1524 = delegate$844.createMemberExpression('.', expr$1524, parseNonComputedMember$910());
                marker$1523.end();
                marker$1523.apply(expr$1524);
            } else {
                expr$1524 = delegate$844.createTaggedTemplateExpression(expr$1524, parseTemplateLiteral$904());
                marker$1523.end();
                marker$1523.apply(expr$1524);
            }
        }
        return expr$1524;
    }
    function filterGroup$989(node$1526) {
        var n$1527, i$1528, entry$1529;
        n$1527 = Object.prototype.toString.apply(node$1526) === '[object Array]' ? [] : {};
        for (i$1528 in node$1526) {
            if (node$1526.hasOwnProperty(i$1528) && i$1528 !== 'groupRange' && i$1528 !== 'groupLoc') {
                entry$1529 = node$1526[i$1528];
                if (entry$1529 === null || typeof entry$1529 !== 'object' || entry$1529 instanceof RegExp) {
                    n$1527[i$1528] = entry$1529;
                } else {
                    n$1527[i$1528] = filterGroup$989(entry$1529);
                }
            }
        }
        return n$1527;
    }
    function wrapTrackingFunction$990(range$1530, loc$1531) {
        return function (parseFunction$1532) {
            function isBinary$1533(node$1535) {
                return node$1535.type === Syntax$828.LogicalExpression || node$1535.type === Syntax$828.BinaryExpression;
            }
            function visit$1534(node$1536) {
                var start$1537, end$1538;
                if (isBinary$1533(node$1536.left)) {
                    visit$1534(node$1536.left);
                }
                if (isBinary$1533(node$1536.right)) {
                    visit$1534(node$1536.right);
                }
                if (range$1530) {
                    if (node$1536.left.groupRange || node$1536.right.groupRange) {
                        start$1537 = node$1536.left.groupRange ? node$1536.left.groupRange[0] : node$1536.left.range[0];
                        end$1538 = node$1536.right.groupRange ? node$1536.right.groupRange[1] : node$1536.right.range[1];
                        node$1536.range = [
                            start$1537,
                            end$1538
                        ];
                    } else if (typeof node$1536.range === 'undefined') {
                        start$1537 = node$1536.left.range[0];
                        end$1538 = node$1536.right.range[1];
                        node$1536.range = [
                            start$1537,
                            end$1538
                        ];
                    }
                }
                if (loc$1531) {
                    if (node$1536.left.groupLoc || node$1536.right.groupLoc) {
                        start$1537 = node$1536.left.groupLoc ? node$1536.left.groupLoc.start : node$1536.left.loc.start;
                        end$1538 = node$1536.right.groupLoc ? node$1536.right.groupLoc.end : node$1536.right.loc.end;
                        node$1536.loc = {
                            start: start$1537,
                            end: end$1538
                        };
                        node$1536 = delegate$844.postProcess(node$1536);
                    } else if (typeof node$1536.loc === 'undefined') {
                        node$1536.loc = {
                            start: node$1536.left.loc.start,
                            end: node$1536.right.loc.end
                        };
                        node$1536 = delegate$844.postProcess(node$1536);
                    }
                }
            }
            return function () {
                var marker$1539, node$1540, curr$1541 = lookahead$847;
                marker$1539 = createLocationMarker$985();
                node$1540 = parseFunction$1532.apply(null, arguments);
                marker$1539.end();
                if (node$1540.type !== Syntax$828.Program) {
                    if (curr$1541.leadingComments) {
                        node$1540.leadingComments = curr$1541.leadingComments;
                    }
                    if (curr$1541.trailingComments) {
                        node$1540.trailingComments = curr$1541.trailingComments;
                    }
                }
                if (range$1530 && typeof node$1540.range === 'undefined') {
                    marker$1539.apply(node$1540);
                }
                if (loc$1531 && typeof node$1540.loc === 'undefined') {
                    marker$1539.apply(node$1540);
                }
                if (isBinary$1533(node$1540)) {
                    visit$1534(node$1540);
                }
                return node$1540;
            };
        };
    }
    function patch$991() {
        var wrapTracking$1542;
        if (extra$850.comments) {
            extra$850.skipComment = skipComment$864;
            skipComment$864 = scanComment$979;
        }
        if (extra$850.range || extra$850.loc) {
            extra$850.parseGroupExpression = parseGroupExpression$905;
            extra$850.parseLeftHandSideExpression = parseLeftHandSideExpression$914;
            extra$850.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$913;
            parseGroupExpression$905 = trackGroupExpression$986;
            parseLeftHandSideExpression$914 = trackLeftHandSideExpression$987;
            parseLeftHandSideExpressionAllowCall$913 = trackLeftHandSideExpressionAllowCall$988;
            wrapTracking$1542 = wrapTrackingFunction$990(extra$850.range, extra$850.loc);
            extra$850.parseArrayInitialiser = parseArrayInitialiser$897;
            extra$850.parseAssignmentExpression = parseAssignmentExpression$924;
            extra$850.parseBinaryExpression = parseBinaryExpression$918;
            extra$850.parseBlock = parseBlock$927;
            extra$850.parseFunctionSourceElements = parseFunctionSourceElements$958;
            extra$850.parseCatchClause = parseCatchClause$953;
            extra$850.parseComputedMember = parseComputedMember$911;
            extra$850.parseConditionalExpression = parseConditionalExpression$919;
            extra$850.parseConstLetDeclaration = parseConstLetDeclaration$932;
            extra$850.parseExportBatchSpecifier = parseExportBatchSpecifier$934;
            extra$850.parseExportDeclaration = parseExportDeclaration$936;
            extra$850.parseExportSpecifier = parseExportSpecifier$935;
            extra$850.parseExpression = parseExpression$925;
            extra$850.parseForVariableDeclaration = parseForVariableDeclaration$944;
            extra$850.parseFunctionDeclaration = parseFunctionDeclaration$962;
            extra$850.parseFunctionExpression = parseFunctionExpression$963;
            extra$850.parseParams = parseParams$961;
            extra$850.parseImportDeclaration = parseImportDeclaration$937;
            extra$850.parseImportSpecifier = parseImportSpecifier$938;
            extra$850.parseModuleDeclaration = parseModuleDeclaration$933;
            extra$850.parseModuleBlock = parseModuleBlock$976;
            extra$850.parseNewExpression = parseNewExpression$912;
            extra$850.parseNonComputedProperty = parseNonComputedProperty$909;
            extra$850.parseObjectInitialiser = parseObjectInitialiser$902;
            extra$850.parseObjectProperty = parseObjectProperty$901;
            extra$850.parseObjectPropertyKey = parseObjectPropertyKey$900;
            extra$850.parsePostfixExpression = parsePostfixExpression$915;
            extra$850.parsePrimaryExpression = parsePrimaryExpression$906;
            extra$850.parseProgram = parseProgram$977;
            extra$850.parsePropertyFunction = parsePropertyFunction$898;
            extra$850.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$908;
            extra$850.parseTemplateElement = parseTemplateElement$903;
            extra$850.parseTemplateLiteral = parseTemplateLiteral$904;
            extra$850.parseStatement = parseStatement$956;
            extra$850.parseSwitchCase = parseSwitchCase$950;
            extra$850.parseUnaryExpression = parseUnaryExpression$916;
            extra$850.parseVariableDeclaration = parseVariableDeclaration$929;
            extra$850.parseVariableIdentifier = parseVariableIdentifier$928;
            extra$850.parseMethodDefinition = parseMethodDefinition$965;
            extra$850.parseClassDeclaration = parseClassDeclaration$969;
            extra$850.parseClassExpression = parseClassExpression$968;
            extra$850.parseClassBody = parseClassBody$967;
            parseArrayInitialiser$897 = wrapTracking$1542(extra$850.parseArrayInitialiser);
            parseAssignmentExpression$924 = wrapTracking$1542(extra$850.parseAssignmentExpression);
            parseBinaryExpression$918 = wrapTracking$1542(extra$850.parseBinaryExpression);
            parseBlock$927 = wrapTracking$1542(extra$850.parseBlock);
            parseFunctionSourceElements$958 = wrapTracking$1542(extra$850.parseFunctionSourceElements);
            parseCatchClause$953 = wrapTracking$1542(extra$850.parseCatchClause);
            parseComputedMember$911 = wrapTracking$1542(extra$850.parseComputedMember);
            parseConditionalExpression$919 = wrapTracking$1542(extra$850.parseConditionalExpression);
            parseConstLetDeclaration$932 = wrapTracking$1542(extra$850.parseConstLetDeclaration);
            parseExportBatchSpecifier$934 = wrapTracking$1542(parseExportBatchSpecifier$934);
            parseExportDeclaration$936 = wrapTracking$1542(parseExportDeclaration$936);
            parseExportSpecifier$935 = wrapTracking$1542(parseExportSpecifier$935);
            parseExpression$925 = wrapTracking$1542(extra$850.parseExpression);
            parseForVariableDeclaration$944 = wrapTracking$1542(extra$850.parseForVariableDeclaration);
            parseFunctionDeclaration$962 = wrapTracking$1542(extra$850.parseFunctionDeclaration);
            parseFunctionExpression$963 = wrapTracking$1542(extra$850.parseFunctionExpression);
            parseParams$961 = wrapTracking$1542(extra$850.parseParams);
            parseImportDeclaration$937 = wrapTracking$1542(extra$850.parseImportDeclaration);
            parseImportSpecifier$938 = wrapTracking$1542(extra$850.parseImportSpecifier);
            parseModuleDeclaration$933 = wrapTracking$1542(extra$850.parseModuleDeclaration);
            parseModuleBlock$976 = wrapTracking$1542(extra$850.parseModuleBlock);
            parseLeftHandSideExpression$914 = wrapTracking$1542(parseLeftHandSideExpression$914);
            parseNewExpression$912 = wrapTracking$1542(extra$850.parseNewExpression);
            parseNonComputedProperty$909 = wrapTracking$1542(extra$850.parseNonComputedProperty);
            parseObjectInitialiser$902 = wrapTracking$1542(extra$850.parseObjectInitialiser);
            parseObjectProperty$901 = wrapTracking$1542(extra$850.parseObjectProperty);
            parseObjectPropertyKey$900 = wrapTracking$1542(extra$850.parseObjectPropertyKey);
            parsePostfixExpression$915 = wrapTracking$1542(extra$850.parsePostfixExpression);
            parsePrimaryExpression$906 = wrapTracking$1542(extra$850.parsePrimaryExpression);
            parseProgram$977 = wrapTracking$1542(extra$850.parseProgram);
            parsePropertyFunction$898 = wrapTracking$1542(extra$850.parsePropertyFunction);
            parseTemplateElement$903 = wrapTracking$1542(extra$850.parseTemplateElement);
            parseTemplateLiteral$904 = wrapTracking$1542(extra$850.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$908 = wrapTracking$1542(extra$850.parseSpreadOrAssignmentExpression);
            parseStatement$956 = wrapTracking$1542(extra$850.parseStatement);
            parseSwitchCase$950 = wrapTracking$1542(extra$850.parseSwitchCase);
            parseUnaryExpression$916 = wrapTracking$1542(extra$850.parseUnaryExpression);
            parseVariableDeclaration$929 = wrapTracking$1542(extra$850.parseVariableDeclaration);
            parseVariableIdentifier$928 = wrapTracking$1542(extra$850.parseVariableIdentifier);
            parseMethodDefinition$965 = wrapTracking$1542(extra$850.parseMethodDefinition);
            parseClassDeclaration$969 = wrapTracking$1542(extra$850.parseClassDeclaration);
            parseClassExpression$968 = wrapTracking$1542(extra$850.parseClassExpression);
            parseClassBody$967 = wrapTracking$1542(extra$850.parseClassBody);
        }
        if (typeof extra$850.tokens !== 'undefined') {
            extra$850.advance = advance$880;
            extra$850.scanRegExp = scanRegExp$877;
            advance$880 = collectToken$981;
            scanRegExp$877 = collectRegex$982;
        }
    }
    function unpatch$992() {
        if (typeof extra$850.skipComment === 'function') {
            skipComment$864 = extra$850.skipComment;
        }
        if (extra$850.range || extra$850.loc) {
            parseArrayInitialiser$897 = extra$850.parseArrayInitialiser;
            parseAssignmentExpression$924 = extra$850.parseAssignmentExpression;
            parseBinaryExpression$918 = extra$850.parseBinaryExpression;
            parseBlock$927 = extra$850.parseBlock;
            parseFunctionSourceElements$958 = extra$850.parseFunctionSourceElements;
            parseCatchClause$953 = extra$850.parseCatchClause;
            parseComputedMember$911 = extra$850.parseComputedMember;
            parseConditionalExpression$919 = extra$850.parseConditionalExpression;
            parseConstLetDeclaration$932 = extra$850.parseConstLetDeclaration;
            parseExportBatchSpecifier$934 = extra$850.parseExportBatchSpecifier;
            parseExportDeclaration$936 = extra$850.parseExportDeclaration;
            parseExportSpecifier$935 = extra$850.parseExportSpecifier;
            parseExpression$925 = extra$850.parseExpression;
            parseForVariableDeclaration$944 = extra$850.parseForVariableDeclaration;
            parseFunctionDeclaration$962 = extra$850.parseFunctionDeclaration;
            parseFunctionExpression$963 = extra$850.parseFunctionExpression;
            parseImportDeclaration$937 = extra$850.parseImportDeclaration;
            parseImportSpecifier$938 = extra$850.parseImportSpecifier;
            parseGroupExpression$905 = extra$850.parseGroupExpression;
            parseLeftHandSideExpression$914 = extra$850.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$913 = extra$850.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$933 = extra$850.parseModuleDeclaration;
            parseModuleBlock$976 = extra$850.parseModuleBlock;
            parseNewExpression$912 = extra$850.parseNewExpression;
            parseNonComputedProperty$909 = extra$850.parseNonComputedProperty;
            parseObjectInitialiser$902 = extra$850.parseObjectInitialiser;
            parseObjectProperty$901 = extra$850.parseObjectProperty;
            parseObjectPropertyKey$900 = extra$850.parseObjectPropertyKey;
            parsePostfixExpression$915 = extra$850.parsePostfixExpression;
            parsePrimaryExpression$906 = extra$850.parsePrimaryExpression;
            parseProgram$977 = extra$850.parseProgram;
            parsePropertyFunction$898 = extra$850.parsePropertyFunction;
            parseTemplateElement$903 = extra$850.parseTemplateElement;
            parseTemplateLiteral$904 = extra$850.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$908 = extra$850.parseSpreadOrAssignmentExpression;
            parseStatement$956 = extra$850.parseStatement;
            parseSwitchCase$950 = extra$850.parseSwitchCase;
            parseUnaryExpression$916 = extra$850.parseUnaryExpression;
            parseVariableDeclaration$929 = extra$850.parseVariableDeclaration;
            parseVariableIdentifier$928 = extra$850.parseVariableIdentifier;
            parseMethodDefinition$965 = extra$850.parseMethodDefinition;
            parseClassDeclaration$969 = extra$850.parseClassDeclaration;
            parseClassExpression$968 = extra$850.parseClassExpression;
            parseClassBody$967 = extra$850.parseClassBody;
        }
        if (typeof extra$850.scanRegExp === 'function') {
            advance$880 = extra$850.advance;
            scanRegExp$877 = extra$850.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$993(object$1543, properties$1544) {
        var entry$1545, result$1546 = {};
        for (entry$1545 in object$1543) {
            if (object$1543.hasOwnProperty(entry$1545)) {
                result$1546[entry$1545] = object$1543[entry$1545];
            }
        }
        for (entry$1545 in properties$1544) {
            if (properties$1544.hasOwnProperty(entry$1545)) {
                result$1546[entry$1545] = properties$1544[entry$1545];
            }
        }
        return result$1546;
    }
    function tokenize$994(code$1547, options$1548) {
        var toString$1549, token$1550, tokens$1551;
        toString$1549 = String;
        if (typeof code$1547 !== 'string' && !(code$1547 instanceof String)) {
            code$1547 = toString$1549(code$1547);
        }
        delegate$844 = SyntaxTreeDelegate$832;
        source$834 = code$1547;
        index$836 = 0;
        lineNumber$837 = source$834.length > 0 ? 1 : 0;
        lineStart$838 = 0;
        length$843 = source$834.length;
        lookahead$847 = null;
        state$849 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$850 = {};
        // Options matching.
        options$1548 = options$1548 || {};
        // Of course we collect tokens here.
        options$1548.tokens = true;
        extra$850.tokens = [];
        extra$850.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$850.openParenToken = -1;
        extra$850.openCurlyToken = -1;
        extra$850.range = typeof options$1548.range === 'boolean' && options$1548.range;
        extra$850.loc = typeof options$1548.loc === 'boolean' && options$1548.loc;
        if (typeof options$1548.comment === 'boolean' && options$1548.comment) {
            extra$850.comments = [];
        }
        if (typeof options$1548.tolerant === 'boolean' && options$1548.tolerant) {
            extra$850.errors = [];
        }
        if (length$843 > 0) {
            if (typeof source$834[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1547 instanceof String) {
                    source$834 = code$1547.valueOf();
                }
            }
        }
        patch$991();
        try {
            peek$882();
            if (lookahead$847.type === Token$825.EOF) {
                return extra$850.tokens;
            }
            token$1550 = lex$881();
            while (lookahead$847.type !== Token$825.EOF) {
                try {
                    token$1550 = lex$881();
                } catch (lexError$1552) {
                    token$1550 = lookahead$847;
                    if (extra$850.errors) {
                        extra$850.errors.push(lexError$1552);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1552;
                    }
                }
            }
            filterTokenLocation$983();
            tokens$1551 = extra$850.tokens;
            if (typeof extra$850.comments !== 'undefined') {
                filterCommentLocation$980();
                tokens$1551.comments = extra$850.comments;
            }
            if (typeof extra$850.errors !== 'undefined') {
                tokens$1551.errors = extra$850.errors;
            }
        } catch (e$1553) {
            throw e$1553;
        } finally {
            unpatch$992();
            extra$850 = {};
        }
        return tokens$1551;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$995(toks$1554, start$1555, inExprDelim$1556, parentIsBlock$1557) {
        var assignOps$1558 = [
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
        var binaryOps$1559 = [
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
        var unaryOps$1560 = [
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
        function back$1561(n$1562) {
            var idx$1563 = toks$1554.length - n$1562 > 0 ? toks$1554.length - n$1562 : 0;
            return toks$1554[idx$1563];
        }
        if (inExprDelim$1556 && toks$1554.length - (start$1555 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1561(start$1555 + 2).value === ':' && parentIsBlock$1557) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$852(back$1561(start$1555 + 2).value, unaryOps$1560.concat(binaryOps$1559).concat(assignOps$1558))) {
            // ... + {...}
            return false;
        } else if (back$1561(start$1555 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1564 = typeof back$1561(start$1555 + 1).startLineNumber !== 'undefined' ? back$1561(start$1555 + 1).startLineNumber : back$1561(start$1555 + 1).lineNumber;
            if (back$1561(start$1555 + 2).lineNumber !== currLineNumber$1564) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$852(back$1561(start$1555 + 2).value, [
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
    function readToken$996(toks$1565, inExprDelim$1566, parentIsBlock$1567) {
        var delimiters$1568 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1569 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1570 = toks$1565.length - 1;
        var comments$1571, commentsLen$1572 = extra$850.comments.length;
        function back$1573(n$1577) {
            var idx$1578 = toks$1565.length - n$1577 > 0 ? toks$1565.length - n$1577 : 0;
            return toks$1565[idx$1578];
        }
        function attachComments$1574(token$1579) {
            if (comments$1571) {
                token$1579.leadingComments = comments$1571;
            }
            return token$1579;
        }
        function _advance$1575() {
            return attachComments$1574(advance$880());
        }
        function _scanRegExp$1576() {
            return attachComments$1574(scanRegExp$877());
        }
        skipComment$864();
        if (extra$850.comments.length > commentsLen$1572) {
            comments$1571 = extra$850.comments.slice(commentsLen$1572);
        }
        if (isIn$852(source$834[index$836], delimiters$1568)) {
            return attachComments$1574(readDelim$997(toks$1565, inExprDelim$1566, parentIsBlock$1567));
        }
        if (source$834[index$836] === '/') {
            var prev$1580 = back$1573(1);
            if (prev$1580) {
                if (prev$1580.value === '()') {
                    if (isIn$852(back$1573(2).value, parenIdents$1569)) {
                        // ... if (...) / ...
                        return _scanRegExp$1576();
                    }
                    // ... (...) / ...
                    return _advance$1575();
                }
                if (prev$1580.value === '{}') {
                    if (blockAllowed$995(toks$1565, 0, inExprDelim$1566, parentIsBlock$1567)) {
                        if (back$1573(2).value === '()') {
                            // named function
                            if (back$1573(4).value === 'function') {
                                if (!blockAllowed$995(toks$1565, 3, inExprDelim$1566, parentIsBlock$1567)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1575();
                                }
                                if (toks$1565.length - 5 <= 0 && inExprDelim$1566) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1575();
                                }
                            }
                            // unnamed function
                            if (back$1573(3).value === 'function') {
                                if (!blockAllowed$995(toks$1565, 2, inExprDelim$1566, parentIsBlock$1567)) {
                                    // new function (...) {...} / ...
                                    return _advance$1575();
                                }
                                if (toks$1565.length - 4 <= 0 && inExprDelim$1566) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1575();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1576();
                    } else {
                        // ... + {...} / ...
                        return _advance$1575();
                    }
                }
                if (prev$1580.type === Token$825.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1576();
                }
                if (isKeyword$863(prev$1580.value)) {
                    // typeof /...
                    return _scanRegExp$1576();
                }
                return _advance$1575();
            }
            return _scanRegExp$1576();
        }
        return _advance$1575();
    }
    function readDelim$997(toks$1581, inExprDelim$1582, parentIsBlock$1583) {
        var startDelim$1584 = advance$880(), matchDelim$1585 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1586 = [];
        var delimiters$1587 = [
                '(',
                '{',
                '['
            ];
        assert$851(delimiters$1587.indexOf(startDelim$1584.value) !== -1, 'Need to begin at the delimiter');
        var token$1588 = startDelim$1584;
        var startLineNumber$1589 = token$1588.lineNumber;
        var startLineStart$1590 = token$1588.lineStart;
        var startRange$1591 = token$1588.range;
        var delimToken$1592 = {};
        delimToken$1592.type = Token$825.Delimiter;
        delimToken$1592.value = startDelim$1584.value + matchDelim$1585[startDelim$1584.value];
        delimToken$1592.startLineNumber = startLineNumber$1589;
        delimToken$1592.startLineStart = startLineStart$1590;
        delimToken$1592.startRange = startRange$1591;
        var delimIsBlock$1593 = false;
        if (startDelim$1584.value === '{') {
            delimIsBlock$1593 = blockAllowed$995(toks$1581.concat(delimToken$1592), 0, inExprDelim$1582, parentIsBlock$1583);
        }
        while (index$836 <= length$843) {
            token$1588 = readToken$996(inner$1586, startDelim$1584.value === '(' || startDelim$1584.value === '[', delimIsBlock$1593);
            if (token$1588.type === Token$825.Punctuator && token$1588.value === matchDelim$1585[startDelim$1584.value]) {
                if (token$1588.leadingComments) {
                    delimToken$1592.trailingComments = token$1588.leadingComments;
                }
                break;
            } else if (token$1588.type === Token$825.EOF) {
                throwError$885({}, Messages$830.UnexpectedEOS);
            } else {
                inner$1586.push(token$1588);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$836 >= length$843 && matchDelim$1585[startDelim$1584.value] !== source$834[length$843 - 1]) {
            throwError$885({}, Messages$830.UnexpectedEOS);
        }
        var endLineNumber$1594 = token$1588.lineNumber;
        var endLineStart$1595 = token$1588.lineStart;
        var endRange$1596 = token$1588.range;
        delimToken$1592.inner = inner$1586;
        delimToken$1592.endLineNumber = endLineNumber$1594;
        delimToken$1592.endLineStart = endLineStart$1595;
        delimToken$1592.endRange = endRange$1596;
        return delimToken$1592;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$998(code$1597) {
        var token$1598, tokenTree$1599 = [];
        extra$850 = {};
        extra$850.comments = [];
        patch$991();
        source$834 = code$1597;
        index$836 = 0;
        lineNumber$837 = source$834.length > 0 ? 1 : 0;
        lineStart$838 = 0;
        length$843 = source$834.length;
        state$849 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$836 < length$843) {
            tokenTree$1599.push(readToken$996(tokenTree$1599, false, false));
        }
        var last$1600 = tokenTree$1599[tokenTree$1599.length - 1];
        if (last$1600 && last$1600.type !== Token$825.EOF) {
            tokenTree$1599.push({
                type: Token$825.EOF,
                value: '',
                lineNumber: last$1600.lineNumber,
                lineStart: last$1600.lineStart,
                range: [
                    index$836,
                    index$836
                ]
            });
        }
        return expander$824.tokensToSyntax(tokenTree$1599);
    }
    function parse$999(code$1601, options$1602) {
        var program$1603, toString$1604;
        extra$850 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1601)) {
            tokenStream$845 = code$1601;
            length$843 = tokenStream$845.length;
            lineNumber$837 = tokenStream$845.length > 0 ? 1 : 0;
            source$834 = undefined;
        } else {
            toString$1604 = String;
            if (typeof code$1601 !== 'string' && !(code$1601 instanceof String)) {
                code$1601 = toString$1604(code$1601);
            }
            source$834 = code$1601;
            length$843 = source$834.length;
            lineNumber$837 = source$834.length > 0 ? 1 : 0;
        }
        delegate$844 = SyntaxTreeDelegate$832;
        streamIndex$846 = -1;
        index$836 = 0;
        lineStart$838 = 0;
        sm_lineStart$840 = 0;
        sm_lineNumber$839 = lineNumber$837;
        sm_index$842 = 0;
        sm_range$841 = [
            0,
            0
        ];
        lookahead$847 = null;
        state$849 = {
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
        if (typeof options$1602 !== 'undefined') {
            extra$850.range = typeof options$1602.range === 'boolean' && options$1602.range;
            extra$850.loc = typeof options$1602.loc === 'boolean' && options$1602.loc;
            if (extra$850.loc && options$1602.source !== null && options$1602.source !== undefined) {
                delegate$844 = extend$993(delegate$844, {
                    'postProcess': function (node$1605) {
                        node$1605.loc.source = toString$1604(options$1602.source);
                        return node$1605;
                    }
                });
            }
            if (typeof options$1602.tokens === 'boolean' && options$1602.tokens) {
                extra$850.tokens = [];
            }
            if (typeof options$1602.comment === 'boolean' && options$1602.comment) {
                extra$850.comments = [];
            }
            if (typeof options$1602.tolerant === 'boolean' && options$1602.tolerant) {
                extra$850.errors = [];
            }
        }
        if (length$843 > 0) {
            if (source$834 && typeof source$834[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1601 instanceof String) {
                    source$834 = code$1601.valueOf();
                }
            }
        }
        extra$850 = { loc: true };
        patch$991();
        try {
            program$1603 = parseProgram$977();
            if (typeof extra$850.comments !== 'undefined') {
                filterCommentLocation$980();
                program$1603.comments = extra$850.comments;
            }
            if (typeof extra$850.tokens !== 'undefined') {
                filterTokenLocation$983();
                program$1603.tokens = extra$850.tokens;
            }
            if (typeof extra$850.errors !== 'undefined') {
                program$1603.errors = extra$850.errors;
            }
            if (extra$850.range || extra$850.loc) {
                program$1603.body = filterGroup$989(program$1603.body);
            }
        } catch (e$1606) {
            throw e$1606;
        } finally {
            unpatch$992();
            extra$850 = {};
        }
        return program$1603;
    }
    exports$823.tokenize = tokenize$994;
    exports$823.read = read$998;
    exports$823.Token = Token$825;
    exports$823.assert = assert$851;
    exports$823.parse = parse$999;
    // Deep copy.
    exports$823.Syntax = function () {
        var name$1607, types$1608 = {};
        if (typeof Object.create === 'function') {
            types$1608 = Object.create(null);
        }
        for (name$1607 in Syntax$828) {
            if (Syntax$828.hasOwnProperty(name$1607)) {
                types$1608[name$1607] = Syntax$828[name$1607];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1608);
        }
        return types$1608;
    }();
}));
//# sourceMappingURL=parser.js.map