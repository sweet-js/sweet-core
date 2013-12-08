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
(function (root$822, factory$823) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$823);
    } else if (typeof exports !== 'undefined') {
        factory$823(exports, require('./expander'));
    } else {
        factory$823(root$822.esprima = {});
    }
}(this, function (exports$824, expander$825) {
    'use strict';
    var Token$826, TokenName$827, FnExprTokens$828, Syntax$829, PropertyKind$830, Messages$831, Regex$832, SyntaxTreeDelegate$833, ClassPropertyType$834, source$835, strict$836, index$837, lineNumber$838, lineStart$839, sm_lineNumber$840, sm_lineStart$841, sm_range$842, sm_index$843, length$844, delegate$845, tokenStream$846, streamIndex$847, lookahead$848, lookaheadIndex$849, state$850, extra$851;
    Token$826 = {
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
    TokenName$827 = {};
    TokenName$827[Token$826.BooleanLiteral] = 'Boolean';
    TokenName$827[Token$826.EOF] = '<end>';
    TokenName$827[Token$826.Identifier] = 'Identifier';
    TokenName$827[Token$826.Keyword] = 'Keyword';
    TokenName$827[Token$826.NullLiteral] = 'Null';
    TokenName$827[Token$826.NumericLiteral] = 'Numeric';
    TokenName$827[Token$826.Punctuator] = 'Punctuator';
    TokenName$827[Token$826.StringLiteral] = 'String';
    TokenName$827[Token$826.RegularExpression] = 'RegularExpression';
    TokenName$827[Token$826.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$828 = [
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
    Syntax$829 = {
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
    PropertyKind$830 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$834 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$831 = {
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
    Regex$832 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$852(condition$1001, message$1002) {
        if (!condition$1001) {
            throw new Error('ASSERT: ' + message$1002);
        }
    }
    function isIn$853(el$1003, list$1004) {
        return list$1004.indexOf(el$1003) !== -1;
    }
    function isDecimalDigit$854(ch$1005) {
        return ch$1005 >= 48 && ch$1005 <= 57;
    }    // 0..9
    function isHexDigit$855(ch$1006) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1006) >= 0;
    }
    function isOctalDigit$856(ch$1007) {
        return '01234567'.indexOf(ch$1007) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$857(ch$1008) {
        return ch$1008 === 32 || ch$1008 === 9 || ch$1008 === 11 || ch$1008 === 12 || ch$1008 === 160 || ch$1008 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1008)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$858(ch$1009) {
        return ch$1009 === 10 || ch$1009 === 13 || ch$1009 === 8232 || ch$1009 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$859(ch$1010) {
        return ch$1010 === 36 || ch$1010 === 95 || ch$1010 >= 65 && ch$1010 <= 90 || ch$1010 >= 97 && ch$1010 <= 122 || ch$1010 === 92 || ch$1010 >= 128 && Regex$832.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1010));
    }
    function isIdentifierPart$860(ch$1011) {
        return ch$1011 === 36 || ch$1011 === 95 || ch$1011 >= 65 && ch$1011 <= 90 || ch$1011 >= 97 && ch$1011 <= 122 || ch$1011 >= 48 && ch$1011 <= 57 || ch$1011 === 92 || ch$1011 >= 128 && Regex$832.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1011));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$861(id$1012) {
        switch (id$1012) {
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
    function isStrictModeReservedWord$862(id$1013) {
        switch (id$1013) {
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
    function isRestrictedWord$863(id$1014) {
        return id$1014 === 'eval' || id$1014 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$864(id$1015) {
        if (strict$836 && isStrictModeReservedWord$862(id$1015)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1015.length) {
        case 2:
            return id$1015 === 'if' || id$1015 === 'in' || id$1015 === 'do';
        case 3:
            return id$1015 === 'var' || id$1015 === 'for' || id$1015 === 'new' || id$1015 === 'try' || id$1015 === 'let';
        case 4:
            return id$1015 === 'this' || id$1015 === 'else' || id$1015 === 'case' || id$1015 === 'void' || id$1015 === 'with' || id$1015 === 'enum';
        case 5:
            return id$1015 === 'while' || id$1015 === 'break' || id$1015 === 'catch' || id$1015 === 'throw' || id$1015 === 'const' || id$1015 === 'yield' || id$1015 === 'class' || id$1015 === 'super';
        case 6:
            return id$1015 === 'return' || id$1015 === 'typeof' || id$1015 === 'delete' || id$1015 === 'switch' || id$1015 === 'export' || id$1015 === 'import';
        case 7:
            return id$1015 === 'default' || id$1015 === 'finally' || id$1015 === 'extends';
        case 8:
            return id$1015 === 'function' || id$1015 === 'continue' || id$1015 === 'debugger';
        case 10:
            return id$1015 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$865() {
        var ch$1016, blockComment$1017, lineComment$1018;
        blockComment$1017 = false;
        lineComment$1018 = false;
        while (index$837 < length$844) {
            ch$1016 = source$835.charCodeAt(index$837);
            if (lineComment$1018) {
                ++index$837;
                if (isLineTerminator$858(ch$1016)) {
                    lineComment$1018 = false;
                    if (ch$1016 === 13 && source$835.charCodeAt(index$837) === 10) {
                        ++index$837;
                    }
                    ++lineNumber$838;
                    lineStart$839 = index$837;
                }
            } else if (blockComment$1017) {
                if (isLineTerminator$858(ch$1016)) {
                    if (ch$1016 === 13 && source$835.charCodeAt(index$837 + 1) === 10) {
                        ++index$837;
                    }
                    ++lineNumber$838;
                    ++index$837;
                    lineStart$839 = index$837;
                    if (index$837 >= length$844) {
                        throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1016 = source$835.charCodeAt(index$837++);
                    if (index$837 >= length$844) {
                        throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1016 === 42) {
                        ch$1016 = source$835.charCodeAt(index$837);
                        if (ch$1016 === 47) {
                            ++index$837;
                            blockComment$1017 = false;
                        }
                    }
                }
            } else if (ch$1016 === 47) {
                ch$1016 = source$835.charCodeAt(index$837 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1016 === 47) {
                    index$837 += 2;
                    lineComment$1018 = true;
                } else if (ch$1016 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$837 += 2;
                    blockComment$1017 = true;
                    if (index$837 >= length$844) {
                        throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$857(ch$1016)) {
                ++index$837;
            } else if (isLineTerminator$858(ch$1016)) {
                ++index$837;
                if (ch$1016 === 13 && source$835.charCodeAt(index$837) === 10) {
                    ++index$837;
                }
                ++lineNumber$838;
                lineStart$839 = index$837;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$866(prefix$1019) {
        var i$1020, len$1021, ch$1022, code$1023 = 0;
        len$1021 = prefix$1019 === 'u' ? 4 : 2;
        for (i$1020 = 0; i$1020 < len$1021; ++i$1020) {
            if (index$837 < length$844 && isHexDigit$855(source$835[index$837])) {
                ch$1022 = source$835[index$837++];
                code$1023 = code$1023 * 16 + '0123456789abcdef'.indexOf(ch$1022.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1023);
    }
    function scanUnicodeCodePointEscape$867() {
        var ch$1024, code$1025, cu1$1026, cu2$1027;
        ch$1024 = source$835[index$837];
        code$1025 = 0;
        // At least, one hex digit is required.
        if (ch$1024 === '}') {
            throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
        }
        while (index$837 < length$844) {
            ch$1024 = source$835[index$837++];
            if (!isHexDigit$855(ch$1024)) {
                break;
            }
            code$1025 = code$1025 * 16 + '0123456789abcdef'.indexOf(ch$1024.toLowerCase());
        }
        if (code$1025 > 1114111 || ch$1024 !== '}') {
            throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1025 <= 65535) {
            return String.fromCharCode(code$1025);
        }
        cu1$1026 = (code$1025 - 65536 >> 10) + 55296;
        cu2$1027 = (code$1025 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1026, cu2$1027);
    }
    function getEscapedIdentifier$868() {
        var ch$1028, id$1029;
        ch$1028 = source$835.charCodeAt(index$837++);
        id$1029 = String.fromCharCode(ch$1028);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1028 === 92) {
            if (source$835.charCodeAt(index$837) !== 117) {
                throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
            }
            ++index$837;
            ch$1028 = scanHexEscape$866('u');
            if (!ch$1028 || ch$1028 === '\\' || !isIdentifierStart$859(ch$1028.charCodeAt(0))) {
                throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
            }
            id$1029 = ch$1028;
        }
        while (index$837 < length$844) {
            ch$1028 = source$835.charCodeAt(index$837);
            if (!isIdentifierPart$860(ch$1028)) {
                break;
            }
            ++index$837;
            id$1029 += String.fromCharCode(ch$1028);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1028 === 92) {
                id$1029 = id$1029.substr(0, id$1029.length - 1);
                if (source$835.charCodeAt(index$837) !== 117) {
                    throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
                }
                ++index$837;
                ch$1028 = scanHexEscape$866('u');
                if (!ch$1028 || ch$1028 === '\\' || !isIdentifierPart$860(ch$1028.charCodeAt(0))) {
                    throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
                }
                id$1029 += ch$1028;
            }
        }
        return id$1029;
    }
    function getIdentifier$869() {
        var start$1030, ch$1031;
        start$1030 = index$837++;
        while (index$837 < length$844) {
            ch$1031 = source$835.charCodeAt(index$837);
            if (ch$1031 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$837 = start$1030;
                return getEscapedIdentifier$868();
            }
            if (isIdentifierPart$860(ch$1031)) {
                ++index$837;
            } else {
                break;
            }
        }
        return source$835.slice(start$1030, index$837);
    }
    function scanIdentifier$870() {
        var start$1032, id$1033, type$1034;
        start$1032 = index$837;
        // Backslash (char #92) starts an escaped character.
        id$1033 = source$835.charCodeAt(index$837) === 92 ? getEscapedIdentifier$868() : getIdentifier$869();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1033.length === 1) {
            type$1034 = Token$826.Identifier;
        } else if (isKeyword$864(id$1033)) {
            type$1034 = Token$826.Keyword;
        } else if (id$1033 === 'null') {
            type$1034 = Token$826.NullLiteral;
        } else if (id$1033 === 'true' || id$1033 === 'false') {
            type$1034 = Token$826.BooleanLiteral;
        } else {
            type$1034 = Token$826.Identifier;
        }
        return {
            type: type$1034,
            value: id$1033,
            lineNumber: lineNumber$838,
            lineStart: lineStart$839,
            range: [
                start$1032,
                index$837
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$871() {
        var start$1035 = index$837, code$1036 = source$835.charCodeAt(index$837), code2$1037, ch1$1038 = source$835[index$837], ch2$1039, ch3$1040, ch4$1041;
        switch (code$1036) {
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
            ++index$837;
            if (extra$851.tokenize) {
                if (code$1036 === 40) {
                    extra$851.openParenToken = extra$851.tokens.length;
                } else if (code$1036 === 123) {
                    extra$851.openCurlyToken = extra$851.tokens.length;
                }
            }
            return {
                type: Token$826.Punctuator,
                value: String.fromCharCode(code$1036),
                lineNumber: lineNumber$838,
                lineStart: lineStart$839,
                range: [
                    start$1035,
                    index$837
                ]
            };
        default:
            code2$1037 = source$835.charCodeAt(index$837 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1037 === 61) {
                switch (code$1036) {
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
                    index$837 += 2;
                    return {
                        type: Token$826.Punctuator,
                        value: String.fromCharCode(code$1036) + String.fromCharCode(code2$1037),
                        lineNumber: lineNumber$838,
                        lineStart: lineStart$839,
                        range: [
                            start$1035,
                            index$837
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$837 += 2;
                    // !== and ===
                    if (source$835.charCodeAt(index$837) === 61) {
                        ++index$837;
                    }
                    return {
                        type: Token$826.Punctuator,
                        value: source$835.slice(start$1035, index$837),
                        lineNumber: lineNumber$838,
                        lineStart: lineStart$839,
                        range: [
                            start$1035,
                            index$837
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1039 = source$835[index$837 + 1];
        ch3$1040 = source$835[index$837 + 2];
        ch4$1041 = source$835[index$837 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1038 === '>' && ch2$1039 === '>' && ch3$1040 === '>') {
            if (ch4$1041 === '=') {
                index$837 += 4;
                return {
                    type: Token$826.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$838,
                    lineStart: lineStart$839,
                    range: [
                        start$1035,
                        index$837
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1038 === '>' && ch2$1039 === '>' && ch3$1040 === '>') {
            index$837 += 3;
            return {
                type: Token$826.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$838,
                lineStart: lineStart$839,
                range: [
                    start$1035,
                    index$837
                ]
            };
        }
        if (ch1$1038 === '<' && ch2$1039 === '<' && ch3$1040 === '=') {
            index$837 += 3;
            return {
                type: Token$826.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$838,
                lineStart: lineStart$839,
                range: [
                    start$1035,
                    index$837
                ]
            };
        }
        if (ch1$1038 === '>' && ch2$1039 === '>' && ch3$1040 === '=') {
            index$837 += 3;
            return {
                type: Token$826.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$838,
                lineStart: lineStart$839,
                range: [
                    start$1035,
                    index$837
                ]
            };
        }
        if (ch1$1038 === '.' && ch2$1039 === '.' && ch3$1040 === '.') {
            index$837 += 3;
            return {
                type: Token$826.Punctuator,
                value: '...',
                lineNumber: lineNumber$838,
                lineStart: lineStart$839,
                range: [
                    start$1035,
                    index$837
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1038 === ch2$1039 && '+-<>&|'.indexOf(ch1$1038) >= 0) {
            index$837 += 2;
            return {
                type: Token$826.Punctuator,
                value: ch1$1038 + ch2$1039,
                lineNumber: lineNumber$838,
                lineStart: lineStart$839,
                range: [
                    start$1035,
                    index$837
                ]
            };
        }
        if (ch1$1038 === '=' && ch2$1039 === '>') {
            index$837 += 2;
            return {
                type: Token$826.Punctuator,
                value: '=>',
                lineNumber: lineNumber$838,
                lineStart: lineStart$839,
                range: [
                    start$1035,
                    index$837
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1038) >= 0) {
            ++index$837;
            return {
                type: Token$826.Punctuator,
                value: ch1$1038,
                lineNumber: lineNumber$838,
                lineStart: lineStart$839,
                range: [
                    start$1035,
                    index$837
                ]
            };
        }
        if (ch1$1038 === '.') {
            ++index$837;
            return {
                type: Token$826.Punctuator,
                value: ch1$1038,
                lineNumber: lineNumber$838,
                lineStart: lineStart$839,
                range: [
                    start$1035,
                    index$837
                ]
            };
        }
        throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$872(start$1042) {
        var number$1043 = '';
        while (index$837 < length$844) {
            if (!isHexDigit$855(source$835[index$837])) {
                break;
            }
            number$1043 += source$835[index$837++];
        }
        if (number$1043.length === 0) {
            throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$859(source$835.charCodeAt(index$837))) {
            throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$826.NumericLiteral,
            value: parseInt('0x' + number$1043, 16),
            lineNumber: lineNumber$838,
            lineStart: lineStart$839,
            range: [
                start$1042,
                index$837
            ]
        };
    }
    function scanOctalLiteral$873(prefix$1044, start$1045) {
        var number$1046, octal$1047;
        if (isOctalDigit$856(prefix$1044)) {
            octal$1047 = true;
            number$1046 = '0' + source$835[index$837++];
        } else {
            octal$1047 = false;
            ++index$837;
            number$1046 = '';
        }
        while (index$837 < length$844) {
            if (!isOctalDigit$856(source$835[index$837])) {
                break;
            }
            number$1046 += source$835[index$837++];
        }
        if (!octal$1047 && number$1046.length === 0) {
            // only 0o or 0O
            throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$859(source$835.charCodeAt(index$837)) || isDecimalDigit$854(source$835.charCodeAt(index$837))) {
            throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$826.NumericLiteral,
            value: parseInt(number$1046, 8),
            octal: octal$1047,
            lineNumber: lineNumber$838,
            lineStart: lineStart$839,
            range: [
                start$1045,
                index$837
            ]
        };
    }
    function scanNumericLiteral$874() {
        var number$1048, start$1049, ch$1050, octal$1051;
        ch$1050 = source$835[index$837];
        assert$852(isDecimalDigit$854(ch$1050.charCodeAt(0)) || ch$1050 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1049 = index$837;
        number$1048 = '';
        if (ch$1050 !== '.') {
            number$1048 = source$835[index$837++];
            ch$1050 = source$835[index$837];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1048 === '0') {
                if (ch$1050 === 'x' || ch$1050 === 'X') {
                    ++index$837;
                    return scanHexLiteral$872(start$1049);
                }
                if (ch$1050 === 'b' || ch$1050 === 'B') {
                    ++index$837;
                    number$1048 = '';
                    while (index$837 < length$844) {
                        ch$1050 = source$835[index$837];
                        if (ch$1050 !== '0' && ch$1050 !== '1') {
                            break;
                        }
                        number$1048 += source$835[index$837++];
                    }
                    if (number$1048.length === 0) {
                        // only 0b or 0B
                        throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$837 < length$844) {
                        ch$1050 = source$835.charCodeAt(index$837);
                        if (isIdentifierStart$859(ch$1050) || isDecimalDigit$854(ch$1050)) {
                            throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$826.NumericLiteral,
                        value: parseInt(number$1048, 2),
                        lineNumber: lineNumber$838,
                        lineStart: lineStart$839,
                        range: [
                            start$1049,
                            index$837
                        ]
                    };
                }
                if (ch$1050 === 'o' || ch$1050 === 'O' || isOctalDigit$856(ch$1050)) {
                    return scanOctalLiteral$873(ch$1050, start$1049);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1050 && isDecimalDigit$854(ch$1050.charCodeAt(0))) {
                    throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$854(source$835.charCodeAt(index$837))) {
                number$1048 += source$835[index$837++];
            }
            ch$1050 = source$835[index$837];
        }
        if (ch$1050 === '.') {
            number$1048 += source$835[index$837++];
            while (isDecimalDigit$854(source$835.charCodeAt(index$837))) {
                number$1048 += source$835[index$837++];
            }
            ch$1050 = source$835[index$837];
        }
        if (ch$1050 === 'e' || ch$1050 === 'E') {
            number$1048 += source$835[index$837++];
            ch$1050 = source$835[index$837];
            if (ch$1050 === '+' || ch$1050 === '-') {
                number$1048 += source$835[index$837++];
            }
            if (isDecimalDigit$854(source$835.charCodeAt(index$837))) {
                while (isDecimalDigit$854(source$835.charCodeAt(index$837))) {
                    number$1048 += source$835[index$837++];
                }
            } else {
                throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$859(source$835.charCodeAt(index$837))) {
            throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$826.NumericLiteral,
            value: parseFloat(number$1048),
            lineNumber: lineNumber$838,
            lineStart: lineStart$839,
            range: [
                start$1049,
                index$837
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$875() {
        var str$1052 = '', quote$1053, start$1054, ch$1055, code$1056, unescaped$1057, restore$1058, octal$1059 = false;
        quote$1053 = source$835[index$837];
        assert$852(quote$1053 === '\'' || quote$1053 === '"', 'String literal must starts with a quote');
        start$1054 = index$837;
        ++index$837;
        while (index$837 < length$844) {
            ch$1055 = source$835[index$837++];
            if (ch$1055 === quote$1053) {
                quote$1053 = '';
                break;
            } else if (ch$1055 === '\\') {
                ch$1055 = source$835[index$837++];
                if (!ch$1055 || !isLineTerminator$858(ch$1055.charCodeAt(0))) {
                    switch (ch$1055) {
                    case 'n':
                        str$1052 += '\n';
                        break;
                    case 'r':
                        str$1052 += '\r';
                        break;
                    case 't':
                        str$1052 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$835[index$837] === '{') {
                            ++index$837;
                            str$1052 += scanUnicodeCodePointEscape$867();
                        } else {
                            restore$1058 = index$837;
                            unescaped$1057 = scanHexEscape$866(ch$1055);
                            if (unescaped$1057) {
                                str$1052 += unescaped$1057;
                            } else {
                                index$837 = restore$1058;
                                str$1052 += ch$1055;
                            }
                        }
                        break;
                    case 'b':
                        str$1052 += '\b';
                        break;
                    case 'f':
                        str$1052 += '\f';
                        break;
                    case 'v':
                        str$1052 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$856(ch$1055)) {
                            code$1056 = '01234567'.indexOf(ch$1055);
                            // \0 is not octal escape sequence
                            if (code$1056 !== 0) {
                                octal$1059 = true;
                            }
                            if (index$837 < length$844 && isOctalDigit$856(source$835[index$837])) {
                                octal$1059 = true;
                                code$1056 = code$1056 * 8 + '01234567'.indexOf(source$835[index$837++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1055) >= 0 && index$837 < length$844 && isOctalDigit$856(source$835[index$837])) {
                                    code$1056 = code$1056 * 8 + '01234567'.indexOf(source$835[index$837++]);
                                }
                            }
                            str$1052 += String.fromCharCode(code$1056);
                        } else {
                            str$1052 += ch$1055;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$838;
                    if (ch$1055 === '\r' && source$835[index$837] === '\n') {
                        ++index$837;
                    }
                }
            } else if (isLineTerminator$858(ch$1055.charCodeAt(0))) {
                break;
            } else {
                str$1052 += ch$1055;
            }
        }
        if (quote$1053 !== '') {
            throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$826.StringLiteral,
            value: str$1052,
            octal: octal$1059,
            lineNumber: lineNumber$838,
            lineStart: lineStart$839,
            range: [
                start$1054,
                index$837
            ]
        };
    }
    function scanTemplate$876() {
        var cooked$1060 = '', ch$1061, start$1062, terminated$1063, tail$1064, restore$1065, unescaped$1066, code$1067, octal$1068;
        terminated$1063 = false;
        tail$1064 = false;
        start$1062 = index$837;
        ++index$837;
        while (index$837 < length$844) {
            ch$1061 = source$835[index$837++];
            if (ch$1061 === '`') {
                tail$1064 = true;
                terminated$1063 = true;
                break;
            } else if (ch$1061 === '$') {
                if (source$835[index$837] === '{') {
                    ++index$837;
                    terminated$1063 = true;
                    break;
                }
                cooked$1060 += ch$1061;
            } else if (ch$1061 === '\\') {
                ch$1061 = source$835[index$837++];
                if (!isLineTerminator$858(ch$1061.charCodeAt(0))) {
                    switch (ch$1061) {
                    case 'n':
                        cooked$1060 += '\n';
                        break;
                    case 'r':
                        cooked$1060 += '\r';
                        break;
                    case 't':
                        cooked$1060 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$835[index$837] === '{') {
                            ++index$837;
                            cooked$1060 += scanUnicodeCodePointEscape$867();
                        } else {
                            restore$1065 = index$837;
                            unescaped$1066 = scanHexEscape$866(ch$1061);
                            if (unescaped$1066) {
                                cooked$1060 += unescaped$1066;
                            } else {
                                index$837 = restore$1065;
                                cooked$1060 += ch$1061;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1060 += '\b';
                        break;
                    case 'f':
                        cooked$1060 += '\f';
                        break;
                    case 'v':
                        cooked$1060 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$856(ch$1061)) {
                            code$1067 = '01234567'.indexOf(ch$1061);
                            // \0 is not octal escape sequence
                            if (code$1067 !== 0) {
                                octal$1068 = true;
                            }
                            if (index$837 < length$844 && isOctalDigit$856(source$835[index$837])) {
                                octal$1068 = true;
                                code$1067 = code$1067 * 8 + '01234567'.indexOf(source$835[index$837++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1061) >= 0 && index$837 < length$844 && isOctalDigit$856(source$835[index$837])) {
                                    code$1067 = code$1067 * 8 + '01234567'.indexOf(source$835[index$837++]);
                                }
                            }
                            cooked$1060 += String.fromCharCode(code$1067);
                        } else {
                            cooked$1060 += ch$1061;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$838;
                    if (ch$1061 === '\r' && source$835[index$837] === '\n') {
                        ++index$837;
                    }
                }
            } else if (isLineTerminator$858(ch$1061.charCodeAt(0))) {
                ++lineNumber$838;
                if (ch$1061 === '\r' && source$835[index$837] === '\n') {
                    ++index$837;
                }
                cooked$1060 += '\n';
            } else {
                cooked$1060 += ch$1061;
            }
        }
        if (!terminated$1063) {
            throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$826.Template,
            value: {
                cooked: cooked$1060,
                raw: source$835.slice(start$1062 + 1, index$837 - (tail$1064 ? 1 : 2))
            },
            tail: tail$1064,
            octal: octal$1068,
            lineNumber: lineNumber$838,
            lineStart: lineStart$839,
            range: [
                start$1062,
                index$837
            ]
        };
    }
    function scanTemplateElement$877(option$1069) {
        var startsWith$1070, template$1071;
        lookahead$848 = null;
        skipComment$865();
        startsWith$1070 = option$1069.head ? '`' : '}';
        if (source$835[index$837] !== startsWith$1070) {
            throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
        }
        template$1071 = scanTemplate$876();
        peek$883();
        return template$1071;
    }
    function scanRegExp$878() {
        var str$1072, ch$1073, start$1074, pattern$1075, flags$1076, value$1077, classMarker$1078 = false, restore$1079, terminated$1080 = false;
        lookahead$848 = null;
        skipComment$865();
        start$1074 = index$837;
        ch$1073 = source$835[index$837];
        assert$852(ch$1073 === '/', 'Regular expression literal must start with a slash');
        str$1072 = source$835[index$837++];
        while (index$837 < length$844) {
            ch$1073 = source$835[index$837++];
            str$1072 += ch$1073;
            if (classMarker$1078) {
                if (ch$1073 === ']') {
                    classMarker$1078 = false;
                }
            } else {
                if (ch$1073 === '\\') {
                    ch$1073 = source$835[index$837++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$858(ch$1073.charCodeAt(0))) {
                        throwError$886({}, Messages$831.UnterminatedRegExp);
                    }
                    str$1072 += ch$1073;
                } else if (ch$1073 === '/') {
                    terminated$1080 = true;
                    break;
                } else if (ch$1073 === '[') {
                    classMarker$1078 = true;
                } else if (isLineTerminator$858(ch$1073.charCodeAt(0))) {
                    throwError$886({}, Messages$831.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1080) {
            throwError$886({}, Messages$831.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1075 = str$1072.substr(1, str$1072.length - 2);
        flags$1076 = '';
        while (index$837 < length$844) {
            ch$1073 = source$835[index$837];
            if (!isIdentifierPart$860(ch$1073.charCodeAt(0))) {
                break;
            }
            ++index$837;
            if (ch$1073 === '\\' && index$837 < length$844) {
                ch$1073 = source$835[index$837];
                if (ch$1073 === 'u') {
                    ++index$837;
                    restore$1079 = index$837;
                    ch$1073 = scanHexEscape$866('u');
                    if (ch$1073) {
                        flags$1076 += ch$1073;
                        for (str$1072 += '\\u'; restore$1079 < index$837; ++restore$1079) {
                            str$1072 += source$835[restore$1079];
                        }
                    } else {
                        index$837 = restore$1079;
                        flags$1076 += 'u';
                        str$1072 += '\\u';
                    }
                } else {
                    str$1072 += '\\';
                }
            } else {
                flags$1076 += ch$1073;
                str$1072 += ch$1073;
            }
        }
        try {
            value$1077 = new RegExp(pattern$1075, flags$1076);
        } catch (e$1081) {
            throwError$886({}, Messages$831.InvalidRegExp);
        }
        // peek();
        if (extra$851.tokenize) {
            return {
                type: Token$826.RegularExpression,
                value: value$1077,
                lineNumber: lineNumber$838,
                lineStart: lineStart$839,
                range: [
                    start$1074,
                    index$837
                ]
            };
        }
        return {
            type: Token$826.RegularExpression,
            literal: str$1072,
            value: value$1077,
            range: [
                start$1074,
                index$837
            ]
        };
    }
    function isIdentifierName$879(token$1082) {
        return token$1082.type === Token$826.Identifier || token$1082.type === Token$826.Keyword || token$1082.type === Token$826.BooleanLiteral || token$1082.type === Token$826.NullLiteral;
    }
    function advanceSlash$880() {
        var prevToken$1083, checkToken$1084;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1083 = extra$851.tokens[extra$851.tokens.length - 1];
        if (!prevToken$1083) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$878();
        }
        if (prevToken$1083.type === 'Punctuator') {
            if (prevToken$1083.value === ')') {
                checkToken$1084 = extra$851.tokens[extra$851.openParenToken - 1];
                if (checkToken$1084 && checkToken$1084.type === 'Keyword' && (checkToken$1084.value === 'if' || checkToken$1084.value === 'while' || checkToken$1084.value === 'for' || checkToken$1084.value === 'with')) {
                    return scanRegExp$878();
                }
                return scanPunctuator$871();
            }
            if (prevToken$1083.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$851.tokens[extra$851.openCurlyToken - 3] && extra$851.tokens[extra$851.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1084 = extra$851.tokens[extra$851.openCurlyToken - 4];
                    if (!checkToken$1084) {
                        return scanPunctuator$871();
                    }
                } else if (extra$851.tokens[extra$851.openCurlyToken - 4] && extra$851.tokens[extra$851.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1084 = extra$851.tokens[extra$851.openCurlyToken - 5];
                    if (!checkToken$1084) {
                        return scanRegExp$878();
                    }
                } else {
                    return scanPunctuator$871();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$828.indexOf(checkToken$1084.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$871();
                }
                // It is a declaration.
                return scanRegExp$878();
            }
            return scanRegExp$878();
        }
        if (prevToken$1083.type === 'Keyword') {
            return scanRegExp$878();
        }
        return scanPunctuator$871();
    }
    function advance$881() {
        var ch$1085;
        skipComment$865();
        if (index$837 >= length$844) {
            return {
                type: Token$826.EOF,
                lineNumber: lineNumber$838,
                lineStart: lineStart$839,
                range: [
                    index$837,
                    index$837
                ]
            };
        }
        ch$1085 = source$835.charCodeAt(index$837);
        // Very common: ( and ) and ;
        if (ch$1085 === 40 || ch$1085 === 41 || ch$1085 === 58) {
            return scanPunctuator$871();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1085 === 39 || ch$1085 === 34) {
            return scanStringLiteral$875();
        }
        if (ch$1085 === 96) {
            return scanTemplate$876();
        }
        if (isIdentifierStart$859(ch$1085)) {
            return scanIdentifier$870();
        }
        // # and @ are allowed for sweet.js
        if (ch$1085 === 35 || ch$1085 === 64) {
            ++index$837;
            return {
                type: Token$826.Punctuator,
                value: String.fromCharCode(ch$1085),
                lineNumber: lineNumber$838,
                lineStart: lineStart$839,
                range: [
                    index$837 - 1,
                    index$837
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1085 === 46) {
            if (isDecimalDigit$854(source$835.charCodeAt(index$837 + 1))) {
                return scanNumericLiteral$874();
            }
            return scanPunctuator$871();
        }
        if (isDecimalDigit$854(ch$1085)) {
            return scanNumericLiteral$874();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$851.tokenize && ch$1085 === 47) {
            return advanceSlash$880();
        }
        return scanPunctuator$871();
    }
    function lex$882() {
        var token$1086;
        token$1086 = lookahead$848;
        streamIndex$847 = lookaheadIndex$849;
        lineNumber$838 = token$1086.lineNumber;
        lineStart$839 = token$1086.lineStart;
        sm_lineNumber$840 = lookahead$848.sm_lineNumber;
        sm_lineStart$841 = lookahead$848.sm_lineStart;
        sm_range$842 = lookahead$848.sm_range;
        sm_index$843 = lookahead$848.sm_range[0];
        lookahead$848 = tokenStream$846[++streamIndex$847].token;
        lookaheadIndex$849 = streamIndex$847;
        index$837 = lookahead$848.range[0];
        return token$1086;
    }
    function peek$883() {
        lookaheadIndex$849 = streamIndex$847 + 1;
        if (lookaheadIndex$849 >= length$844) {
            lookahead$848 = {
                type: Token$826.EOF,
                lineNumber: lineNumber$838,
                lineStart: lineStart$839,
                range: [
                    index$837,
                    index$837
                ]
            };
            return;
        }
        lookahead$848 = tokenStream$846[lookaheadIndex$849].token;
        index$837 = lookahead$848.range[0];
    }
    function lookahead2$884() {
        var adv$1087, pos$1088, line$1089, start$1090, result$1091;
        if (streamIndex$847 + 1 >= length$844 || streamIndex$847 + 2 >= length$844) {
            return {
                type: Token$826.EOF,
                lineNumber: lineNumber$838,
                lineStart: lineStart$839,
                range: [
                    index$837,
                    index$837
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$848 === null) {
            lookaheadIndex$849 = streamIndex$847 + 1;
            lookahead$848 = tokenStream$846[lookaheadIndex$849].token;
            index$837 = lookahead$848.range[0];
        }
        result$1091 = tokenStream$846[lookaheadIndex$849 + 1].token;
        return result$1091;
    }
    SyntaxTreeDelegate$833 = {
        name: 'SyntaxTree',
        postProcess: function (node$1092) {
            return node$1092;
        },
        createArrayExpression: function (elements$1093) {
            return {
                type: Syntax$829.ArrayExpression,
                elements: elements$1093
            };
        },
        createAssignmentExpression: function (operator$1094, left$1095, right$1096) {
            return {
                type: Syntax$829.AssignmentExpression,
                operator: operator$1094,
                left: left$1095,
                right: right$1096
            };
        },
        createBinaryExpression: function (operator$1097, left$1098, right$1099) {
            var type$1100 = operator$1097 === '||' || operator$1097 === '&&' ? Syntax$829.LogicalExpression : Syntax$829.BinaryExpression;
            return {
                type: type$1100,
                operator: operator$1097,
                left: left$1098,
                right: right$1099
            };
        },
        createBlockStatement: function (body$1101) {
            return {
                type: Syntax$829.BlockStatement,
                body: body$1101
            };
        },
        createBreakStatement: function (label$1102) {
            return {
                type: Syntax$829.BreakStatement,
                label: label$1102
            };
        },
        createCallExpression: function (callee$1103, args$1104) {
            return {
                type: Syntax$829.CallExpression,
                callee: callee$1103,
                'arguments': args$1104
            };
        },
        createCatchClause: function (param$1105, body$1106) {
            return {
                type: Syntax$829.CatchClause,
                param: param$1105,
                body: body$1106
            };
        },
        createConditionalExpression: function (test$1107, consequent$1108, alternate$1109) {
            return {
                type: Syntax$829.ConditionalExpression,
                test: test$1107,
                consequent: consequent$1108,
                alternate: alternate$1109
            };
        },
        createContinueStatement: function (label$1110) {
            return {
                type: Syntax$829.ContinueStatement,
                label: label$1110
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$829.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1111, test$1112) {
            return {
                type: Syntax$829.DoWhileStatement,
                body: body$1111,
                test: test$1112
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$829.EmptyStatement };
        },
        createExpressionStatement: function (expression$1113) {
            return {
                type: Syntax$829.ExpressionStatement,
                expression: expression$1113
            };
        },
        createForStatement: function (init$1114, test$1115, update$1116, body$1117) {
            return {
                type: Syntax$829.ForStatement,
                init: init$1114,
                test: test$1115,
                update: update$1116,
                body: body$1117
            };
        },
        createForInStatement: function (left$1118, right$1119, body$1120) {
            return {
                type: Syntax$829.ForInStatement,
                left: left$1118,
                right: right$1119,
                body: body$1120,
                each: false
            };
        },
        createForOfStatement: function (left$1121, right$1122, body$1123) {
            return {
                type: Syntax$829.ForOfStatement,
                left: left$1121,
                right: right$1122,
                body: body$1123
            };
        },
        createFunctionDeclaration: function (id$1124, params$1125, defaults$1126, body$1127, rest$1128, generator$1129, expression$1130) {
            return {
                type: Syntax$829.FunctionDeclaration,
                id: id$1124,
                params: params$1125,
                defaults: defaults$1126,
                body: body$1127,
                rest: rest$1128,
                generator: generator$1129,
                expression: expression$1130
            };
        },
        createFunctionExpression: function (id$1131, params$1132, defaults$1133, body$1134, rest$1135, generator$1136, expression$1137) {
            return {
                type: Syntax$829.FunctionExpression,
                id: id$1131,
                params: params$1132,
                defaults: defaults$1133,
                body: body$1134,
                rest: rest$1135,
                generator: generator$1136,
                expression: expression$1137
            };
        },
        createIdentifier: function (name$1138) {
            return {
                type: Syntax$829.Identifier,
                name: name$1138
            };
        },
        createIfStatement: function (test$1139, consequent$1140, alternate$1141) {
            return {
                type: Syntax$829.IfStatement,
                test: test$1139,
                consequent: consequent$1140,
                alternate: alternate$1141
            };
        },
        createLabeledStatement: function (label$1142, body$1143) {
            return {
                type: Syntax$829.LabeledStatement,
                label: label$1142,
                body: body$1143
            };
        },
        createLiteral: function (token$1144) {
            return {
                type: Syntax$829.Literal,
                value: token$1144.value,
                raw: String(token$1144.value)
            };
        },
        createMemberExpression: function (accessor$1145, object$1146, property$1147) {
            return {
                type: Syntax$829.MemberExpression,
                computed: accessor$1145 === '[',
                object: object$1146,
                property: property$1147
            };
        },
        createNewExpression: function (callee$1148, args$1149) {
            return {
                type: Syntax$829.NewExpression,
                callee: callee$1148,
                'arguments': args$1149
            };
        },
        createObjectExpression: function (properties$1150) {
            return {
                type: Syntax$829.ObjectExpression,
                properties: properties$1150
            };
        },
        createPostfixExpression: function (operator$1151, argument$1152) {
            return {
                type: Syntax$829.UpdateExpression,
                operator: operator$1151,
                argument: argument$1152,
                prefix: false
            };
        },
        createProgram: function (body$1153) {
            return {
                type: Syntax$829.Program,
                body: body$1153
            };
        },
        createProperty: function (kind$1154, key$1155, value$1156, method$1157, shorthand$1158) {
            return {
                type: Syntax$829.Property,
                key: key$1155,
                value: value$1156,
                kind: kind$1154,
                method: method$1157,
                shorthand: shorthand$1158
            };
        },
        createReturnStatement: function (argument$1159) {
            return {
                type: Syntax$829.ReturnStatement,
                argument: argument$1159
            };
        },
        createSequenceExpression: function (expressions$1160) {
            return {
                type: Syntax$829.SequenceExpression,
                expressions: expressions$1160
            };
        },
        createSwitchCase: function (test$1161, consequent$1162) {
            return {
                type: Syntax$829.SwitchCase,
                test: test$1161,
                consequent: consequent$1162
            };
        },
        createSwitchStatement: function (discriminant$1163, cases$1164) {
            return {
                type: Syntax$829.SwitchStatement,
                discriminant: discriminant$1163,
                cases: cases$1164
            };
        },
        createThisExpression: function () {
            return { type: Syntax$829.ThisExpression };
        },
        createThrowStatement: function (argument$1165) {
            return {
                type: Syntax$829.ThrowStatement,
                argument: argument$1165
            };
        },
        createTryStatement: function (block$1166, guardedHandlers$1167, handlers$1168, finalizer$1169) {
            return {
                type: Syntax$829.TryStatement,
                block: block$1166,
                guardedHandlers: guardedHandlers$1167,
                handlers: handlers$1168,
                finalizer: finalizer$1169
            };
        },
        createUnaryExpression: function (operator$1170, argument$1171) {
            if (operator$1170 === '++' || operator$1170 === '--') {
                return {
                    type: Syntax$829.UpdateExpression,
                    operator: operator$1170,
                    argument: argument$1171,
                    prefix: true
                };
            }
            return {
                type: Syntax$829.UnaryExpression,
                operator: operator$1170,
                argument: argument$1171
            };
        },
        createVariableDeclaration: function (declarations$1172, kind$1173) {
            return {
                type: Syntax$829.VariableDeclaration,
                declarations: declarations$1172,
                kind: kind$1173
            };
        },
        createVariableDeclarator: function (id$1174, init$1175) {
            return {
                type: Syntax$829.VariableDeclarator,
                id: id$1174,
                init: init$1175
            };
        },
        createWhileStatement: function (test$1176, body$1177) {
            return {
                type: Syntax$829.WhileStatement,
                test: test$1176,
                body: body$1177
            };
        },
        createWithStatement: function (object$1178, body$1179) {
            return {
                type: Syntax$829.WithStatement,
                object: object$1178,
                body: body$1179
            };
        },
        createTemplateElement: function (value$1180, tail$1181) {
            return {
                type: Syntax$829.TemplateElement,
                value: value$1180,
                tail: tail$1181
            };
        },
        createTemplateLiteral: function (quasis$1182, expressions$1183) {
            return {
                type: Syntax$829.TemplateLiteral,
                quasis: quasis$1182,
                expressions: expressions$1183
            };
        },
        createSpreadElement: function (argument$1184) {
            return {
                type: Syntax$829.SpreadElement,
                argument: argument$1184
            };
        },
        createTaggedTemplateExpression: function (tag$1185, quasi$1186) {
            return {
                type: Syntax$829.TaggedTemplateExpression,
                tag: tag$1185,
                quasi: quasi$1186
            };
        },
        createArrowFunctionExpression: function (params$1187, defaults$1188, body$1189, rest$1190, expression$1191) {
            return {
                type: Syntax$829.ArrowFunctionExpression,
                id: null,
                params: params$1187,
                defaults: defaults$1188,
                body: body$1189,
                rest: rest$1190,
                generator: false,
                expression: expression$1191
            };
        },
        createMethodDefinition: function (propertyType$1192, kind$1193, key$1194, value$1195) {
            return {
                type: Syntax$829.MethodDefinition,
                key: key$1194,
                value: value$1195,
                kind: kind$1193,
                'static': propertyType$1192 === ClassPropertyType$834.static
            };
        },
        createClassBody: function (body$1196) {
            return {
                type: Syntax$829.ClassBody,
                body: body$1196
            };
        },
        createClassExpression: function (id$1197, superClass$1198, body$1199) {
            return {
                type: Syntax$829.ClassExpression,
                id: id$1197,
                superClass: superClass$1198,
                body: body$1199
            };
        },
        createClassDeclaration: function (id$1200, superClass$1201, body$1202) {
            return {
                type: Syntax$829.ClassDeclaration,
                id: id$1200,
                superClass: superClass$1201,
                body: body$1202
            };
        },
        createExportSpecifier: function (id$1203, name$1204) {
            return {
                type: Syntax$829.ExportSpecifier,
                id: id$1203,
                name: name$1204
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$829.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1205, specifiers$1206, source$1207) {
            return {
                type: Syntax$829.ExportDeclaration,
                declaration: declaration$1205,
                specifiers: specifiers$1206,
                source: source$1207
            };
        },
        createImportSpecifier: function (id$1208, name$1209) {
            return {
                type: Syntax$829.ImportSpecifier,
                id: id$1208,
                name: name$1209
            };
        },
        createImportDeclaration: function (specifiers$1210, kind$1211, source$1212) {
            return {
                type: Syntax$829.ImportDeclaration,
                specifiers: specifiers$1210,
                kind: kind$1211,
                source: source$1212
            };
        },
        createYieldExpression: function (argument$1213, delegate$1214) {
            return {
                type: Syntax$829.YieldExpression,
                argument: argument$1213,
                delegate: delegate$1214
            };
        },
        createModuleDeclaration: function (id$1215, source$1216, body$1217) {
            return {
                type: Syntax$829.ModuleDeclaration,
                id: id$1215,
                source: source$1216,
                body: body$1217
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$885() {
        return lookahead$848.lineNumber !== lineNumber$838;
    }
    // Throw an exception
    function throwError$886(token$1218, messageFormat$1219) {
        var error$1220, args$1221 = Array.prototype.slice.call(arguments, 2), msg$1222 = messageFormat$1219.replace(/%(\d)/g, function (whole$1223, index$1224) {
                assert$852(index$1224 < args$1221.length, 'Message reference must be in range');
                return args$1221[index$1224];
            });
        if (typeof token$1218.lineNumber === 'number') {
            error$1220 = new Error('Line ' + token$1218.lineNumber + ': ' + msg$1222);
            error$1220.index = token$1218.range[0];
            error$1220.lineNumber = token$1218.lineNumber;
            error$1220.column = token$1218.range[0] - lineStart$839 + 1;
        } else {
            error$1220 = new Error('Line ' + lineNumber$838 + ': ' + msg$1222);
            error$1220.index = index$837;
            error$1220.lineNumber = lineNumber$838;
            error$1220.column = index$837 - lineStart$839 + 1;
        }
        error$1220.description = msg$1222;
        throw error$1220;
    }
    function throwErrorTolerant$887() {
        try {
            throwError$886.apply(null, arguments);
        } catch (e$1225) {
            if (extra$851.errors) {
                extra$851.errors.push(e$1225);
            } else {
                throw e$1225;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$888(token$1226) {
        if (token$1226.type === Token$826.EOF) {
            throwError$886(token$1226, Messages$831.UnexpectedEOS);
        }
        if (token$1226.type === Token$826.NumericLiteral) {
            throwError$886(token$1226, Messages$831.UnexpectedNumber);
        }
        if (token$1226.type === Token$826.StringLiteral) {
            throwError$886(token$1226, Messages$831.UnexpectedString);
        }
        if (token$1226.type === Token$826.Identifier) {
            throwError$886(token$1226, Messages$831.UnexpectedIdentifier);
        }
        if (token$1226.type === Token$826.Keyword) {
            if (isFutureReservedWord$861(token$1226.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$836 && isStrictModeReservedWord$862(token$1226.value)) {
                throwErrorTolerant$887(token$1226, Messages$831.StrictReservedWord);
                return;
            }
            throwError$886(token$1226, Messages$831.UnexpectedToken, token$1226.value);
        }
        if (token$1226.type === Token$826.Template) {
            throwError$886(token$1226, Messages$831.UnexpectedTemplate, token$1226.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$886(token$1226, Messages$831.UnexpectedToken, token$1226.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$889(value$1227) {
        var token$1228 = lex$882();
        if (token$1228.type !== Token$826.Punctuator || token$1228.value !== value$1227) {
            throwUnexpected$888(token$1228);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$890(keyword$1229) {
        var token$1230 = lex$882();
        if (token$1230.type !== Token$826.Keyword || token$1230.value !== keyword$1229) {
            throwUnexpected$888(token$1230);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$891(value$1231) {
        return lookahead$848.type === Token$826.Punctuator && lookahead$848.value === value$1231;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$892(keyword$1232) {
        return lookahead$848.type === Token$826.Keyword && lookahead$848.value === keyword$1232;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$893(keyword$1233) {
        return lookahead$848.type === Token$826.Identifier && lookahead$848.value === keyword$1233;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$894() {
        var op$1234;
        if (lookahead$848.type !== Token$826.Punctuator) {
            return false;
        }
        op$1234 = lookahead$848.value;
        return op$1234 === '=' || op$1234 === '*=' || op$1234 === '/=' || op$1234 === '%=' || op$1234 === '+=' || op$1234 === '-=' || op$1234 === '<<=' || op$1234 === '>>=' || op$1234 === '>>>=' || op$1234 === '&=' || op$1234 === '^=' || op$1234 === '|=';
    }
    function consumeSemicolon$895() {
        var line$1235, ch$1236;
        ch$1236 = lookahead$848.value ? String(lookahead$848.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1236 === 59) {
            lex$882();
            return;
        }
        if (lookahead$848.lineNumber !== lineNumber$838) {
            return;
        }
        if (match$891(';')) {
            lex$882();
            return;
        }
        if (lookahead$848.type !== Token$826.EOF && !match$891('}')) {
            throwUnexpected$888(lookahead$848);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$896(expr$1237) {
        return expr$1237.type === Syntax$829.Identifier || expr$1237.type === Syntax$829.MemberExpression;
    }
    function isAssignableLeftHandSide$897(expr$1238) {
        return isLeftHandSide$896(expr$1238) || expr$1238.type === Syntax$829.ObjectPattern || expr$1238.type === Syntax$829.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$898() {
        var elements$1239 = [], blocks$1240 = [], filter$1241 = null, tmp$1242, possiblecomprehension$1243 = true, body$1244;
        expect$889('[');
        while (!match$891(']')) {
            if (lookahead$848.value === 'for' && lookahead$848.type === Token$826.Keyword) {
                if (!possiblecomprehension$1243) {
                    throwError$886({}, Messages$831.ComprehensionError);
                }
                matchKeyword$892('for');
                tmp$1242 = parseForStatement$946({ ignoreBody: true });
                tmp$1242.of = tmp$1242.type === Syntax$829.ForOfStatement;
                tmp$1242.type = Syntax$829.ComprehensionBlock;
                if (tmp$1242.left.kind) {
                    // can't be let or const
                    throwError$886({}, Messages$831.ComprehensionError);
                }
                blocks$1240.push(tmp$1242);
            } else if (lookahead$848.value === 'if' && lookahead$848.type === Token$826.Keyword) {
                if (!possiblecomprehension$1243) {
                    throwError$886({}, Messages$831.ComprehensionError);
                }
                expectKeyword$890('if');
                expect$889('(');
                filter$1241 = parseExpression$926();
                expect$889(')');
            } else if (lookahead$848.value === ',' && lookahead$848.type === Token$826.Punctuator) {
                possiblecomprehension$1243 = false;
                // no longer allowed.
                lex$882();
                elements$1239.push(null);
            } else {
                tmp$1242 = parseSpreadOrAssignmentExpression$909();
                elements$1239.push(tmp$1242);
                if (tmp$1242 && tmp$1242.type === Syntax$829.SpreadElement) {
                    if (!match$891(']')) {
                        throwError$886({}, Messages$831.ElementAfterSpreadElement);
                    }
                } else if (!(match$891(']') || matchKeyword$892('for') || matchKeyword$892('if'))) {
                    expect$889(',');
                    // this lexes.
                    possiblecomprehension$1243 = false;
                }
            }
        }
        expect$889(']');
        if (filter$1241 && !blocks$1240.length) {
            throwError$886({}, Messages$831.ComprehensionRequiresBlock);
        }
        if (blocks$1240.length) {
            if (elements$1239.length !== 1) {
                throwError$886({}, Messages$831.ComprehensionError);
            }
            return {
                type: Syntax$829.ComprehensionExpression,
                filter: filter$1241,
                blocks: blocks$1240,
                body: elements$1239[0]
            };
        }
        return delegate$845.createArrayExpression(elements$1239);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$899(options$1245) {
        var previousStrict$1246, previousYieldAllowed$1247, params$1248, defaults$1249, body$1250;
        previousStrict$1246 = strict$836;
        previousYieldAllowed$1247 = state$850.yieldAllowed;
        state$850.yieldAllowed = options$1245.generator;
        params$1248 = options$1245.params || [];
        defaults$1249 = options$1245.defaults || [];
        body$1250 = parseConciseBody$958();
        if (options$1245.name && strict$836 && isRestrictedWord$863(params$1248[0].name)) {
            throwErrorTolerant$887(options$1245.name, Messages$831.StrictParamName);
        }
        if (state$850.yieldAllowed && !state$850.yieldFound) {
            throwErrorTolerant$887({}, Messages$831.NoYieldInGenerator);
        }
        strict$836 = previousStrict$1246;
        state$850.yieldAllowed = previousYieldAllowed$1247;
        return delegate$845.createFunctionExpression(null, params$1248, defaults$1249, body$1250, options$1245.rest || null, options$1245.generator, body$1250.type !== Syntax$829.BlockStatement);
    }
    function parsePropertyMethodFunction$900(options$1251) {
        var previousStrict$1252, tmp$1253, method$1254;
        previousStrict$1252 = strict$836;
        strict$836 = true;
        tmp$1253 = parseParams$962();
        if (tmp$1253.stricted) {
            throwErrorTolerant$887(tmp$1253.stricted, tmp$1253.message);
        }
        method$1254 = parsePropertyFunction$899({
            params: tmp$1253.params,
            defaults: tmp$1253.defaults,
            rest: tmp$1253.rest,
            generator: options$1251.generator
        });
        strict$836 = previousStrict$1252;
        return method$1254;
    }
    function parseObjectPropertyKey$901() {
        var token$1255 = lex$882();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1255.type === Token$826.StringLiteral || token$1255.type === Token$826.NumericLiteral) {
            if (strict$836 && token$1255.octal) {
                throwErrorTolerant$887(token$1255, Messages$831.StrictOctalLiteral);
            }
            return delegate$845.createLiteral(token$1255);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$845.createIdentifier(token$1255.value);
    }
    function parseObjectProperty$902() {
        var token$1256, key$1257, id$1258, value$1259, param$1260;
        token$1256 = lookahead$848;
        if (token$1256.type === Token$826.Identifier) {
            id$1258 = parseObjectPropertyKey$901();
            // Property Assignment: Getter and Setter.
            if (token$1256.value === 'get' && !(match$891(':') || match$891('('))) {
                key$1257 = parseObjectPropertyKey$901();
                expect$889('(');
                expect$889(')');
                return delegate$845.createProperty('get', key$1257, parsePropertyFunction$899({ generator: false }), false, false);
            }
            if (token$1256.value === 'set' && !(match$891(':') || match$891('('))) {
                key$1257 = parseObjectPropertyKey$901();
                expect$889('(');
                token$1256 = lookahead$848;
                param$1260 = [parseVariableIdentifier$929()];
                expect$889(')');
                return delegate$845.createProperty('set', key$1257, parsePropertyFunction$899({
                    params: param$1260,
                    generator: false,
                    name: token$1256
                }), false, false);
            }
            if (match$891(':')) {
                lex$882();
                return delegate$845.createProperty('init', id$1258, parseAssignmentExpression$925(), false, false);
            }
            if (match$891('(')) {
                return delegate$845.createProperty('init', id$1258, parsePropertyMethodFunction$900({ generator: false }), true, false);
            }
            return delegate$845.createProperty('init', id$1258, id$1258, false, true);
        }
        if (token$1256.type === Token$826.EOF || token$1256.type === Token$826.Punctuator) {
            if (!match$891('*')) {
                throwUnexpected$888(token$1256);
            }
            lex$882();
            id$1258 = parseObjectPropertyKey$901();
            if (!match$891('(')) {
                throwUnexpected$888(lex$882());
            }
            return delegate$845.createProperty('init', id$1258, parsePropertyMethodFunction$900({ generator: true }), true, false);
        }
        key$1257 = parseObjectPropertyKey$901();
        if (match$891(':')) {
            lex$882();
            return delegate$845.createProperty('init', key$1257, parseAssignmentExpression$925(), false, false);
        }
        if (match$891('(')) {
            return delegate$845.createProperty('init', key$1257, parsePropertyMethodFunction$900({ generator: false }), true, false);
        }
        throwUnexpected$888(lex$882());
    }
    function parseObjectInitialiser$903() {
        var properties$1261 = [], property$1262, name$1263, key$1264, kind$1265, map$1266 = {}, toString$1267 = String;
        expect$889('{');
        while (!match$891('}')) {
            property$1262 = parseObjectProperty$902();
            if (property$1262.key.type === Syntax$829.Identifier) {
                name$1263 = property$1262.key.name;
            } else {
                name$1263 = toString$1267(property$1262.key.value);
            }
            kind$1265 = property$1262.kind === 'init' ? PropertyKind$830.Data : property$1262.kind === 'get' ? PropertyKind$830.Get : PropertyKind$830.Set;
            key$1264 = '$' + name$1263;
            if (Object.prototype.hasOwnProperty.call(map$1266, key$1264)) {
                if (map$1266[key$1264] === PropertyKind$830.Data) {
                    if (strict$836 && kind$1265 === PropertyKind$830.Data) {
                        throwErrorTolerant$887({}, Messages$831.StrictDuplicateProperty);
                    } else if (kind$1265 !== PropertyKind$830.Data) {
                        throwErrorTolerant$887({}, Messages$831.AccessorDataProperty);
                    }
                } else {
                    if (kind$1265 === PropertyKind$830.Data) {
                        throwErrorTolerant$887({}, Messages$831.AccessorDataProperty);
                    } else if (map$1266[key$1264] & kind$1265) {
                        throwErrorTolerant$887({}, Messages$831.AccessorGetSet);
                    }
                }
                map$1266[key$1264] |= kind$1265;
            } else {
                map$1266[key$1264] = kind$1265;
            }
            properties$1261.push(property$1262);
            if (!match$891('}')) {
                expect$889(',');
            }
        }
        expect$889('}');
        return delegate$845.createObjectExpression(properties$1261);
    }
    function parseTemplateElement$904(option$1268) {
        var token$1269 = scanTemplateElement$877(option$1268);
        if (strict$836 && token$1269.octal) {
            throwError$886(token$1269, Messages$831.StrictOctalLiteral);
        }
        return delegate$845.createTemplateElement({
            raw: token$1269.value.raw,
            cooked: token$1269.value.cooked
        }, token$1269.tail);
    }
    function parseTemplateLiteral$905() {
        var quasi$1270, quasis$1271, expressions$1272;
        quasi$1270 = parseTemplateElement$904({ head: true });
        quasis$1271 = [quasi$1270];
        expressions$1272 = [];
        while (!quasi$1270.tail) {
            expressions$1272.push(parseExpression$926());
            quasi$1270 = parseTemplateElement$904({ head: false });
            quasis$1271.push(quasi$1270);
        }
        return delegate$845.createTemplateLiteral(quasis$1271, expressions$1272);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$906() {
        var expr$1273;
        expect$889('(');
        ++state$850.parenthesizedCount;
        expr$1273 = parseExpression$926();
        expect$889(')');
        return expr$1273;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$907() {
        var type$1274, token$1275, resolvedIdent$1276;
        token$1275 = lookahead$848;
        type$1274 = lookahead$848.type;
        if (type$1274 === Token$826.Identifier) {
            resolvedIdent$1276 = expander$825.resolve(tokenStream$846[lookaheadIndex$849]);
            lex$882();
            return delegate$845.createIdentifier(resolvedIdent$1276);
        }
        if (type$1274 === Token$826.StringLiteral || type$1274 === Token$826.NumericLiteral) {
            if (strict$836 && lookahead$848.octal) {
                throwErrorTolerant$887(lookahead$848, Messages$831.StrictOctalLiteral);
            }
            return delegate$845.createLiteral(lex$882());
        }
        if (type$1274 === Token$826.Keyword) {
            if (matchKeyword$892('this')) {
                lex$882();
                return delegate$845.createThisExpression();
            }
            if (matchKeyword$892('function')) {
                return parseFunctionExpression$964();
            }
            if (matchKeyword$892('class')) {
                return parseClassExpression$969();
            }
            if (matchKeyword$892('super')) {
                lex$882();
                return delegate$845.createIdentifier('super');
            }
        }
        if (type$1274 === Token$826.BooleanLiteral) {
            token$1275 = lex$882();
            token$1275.value = token$1275.value === 'true';
            return delegate$845.createLiteral(token$1275);
        }
        if (type$1274 === Token$826.NullLiteral) {
            token$1275 = lex$882();
            token$1275.value = null;
            return delegate$845.createLiteral(token$1275);
        }
        if (match$891('[')) {
            return parseArrayInitialiser$898();
        }
        if (match$891('{')) {
            return parseObjectInitialiser$903();
        }
        if (match$891('(')) {
            return parseGroupExpression$906();
        }
        if (lookahead$848.type === Token$826.RegularExpression) {
            return delegate$845.createLiteral(lex$882());
        }
        if (type$1274 === Token$826.Template) {
            return parseTemplateLiteral$905();
        }
        return throwUnexpected$888(lex$882());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$908() {
        var args$1277 = [], arg$1278;
        expect$889('(');
        if (!match$891(')')) {
            while (streamIndex$847 < length$844) {
                arg$1278 = parseSpreadOrAssignmentExpression$909();
                args$1277.push(arg$1278);
                if (match$891(')')) {
                    break;
                } else if (arg$1278.type === Syntax$829.SpreadElement) {
                    throwError$886({}, Messages$831.ElementAfterSpreadElement);
                }
                expect$889(',');
            }
        }
        expect$889(')');
        return args$1277;
    }
    function parseSpreadOrAssignmentExpression$909() {
        if (match$891('...')) {
            lex$882();
            return delegate$845.createSpreadElement(parseAssignmentExpression$925());
        }
        return parseAssignmentExpression$925();
    }
    function parseNonComputedProperty$910() {
        var token$1279 = lex$882();
        if (!isIdentifierName$879(token$1279)) {
            throwUnexpected$888(token$1279);
        }
        return delegate$845.createIdentifier(token$1279.value);
    }
    function parseNonComputedMember$911() {
        expect$889('.');
        return parseNonComputedProperty$910();
    }
    function parseComputedMember$912() {
        var expr$1280;
        expect$889('[');
        expr$1280 = parseExpression$926();
        expect$889(']');
        return expr$1280;
    }
    function parseNewExpression$913() {
        var callee$1281, args$1282;
        expectKeyword$890('new');
        callee$1281 = parseLeftHandSideExpression$915();
        args$1282 = match$891('(') ? parseArguments$908() : [];
        return delegate$845.createNewExpression(callee$1281, args$1282);
    }
    function parseLeftHandSideExpressionAllowCall$914() {
        var expr$1283, args$1284, property$1285;
        expr$1283 = matchKeyword$892('new') ? parseNewExpression$913() : parsePrimaryExpression$907();
        while (match$891('.') || match$891('[') || match$891('(') || lookahead$848.type === Token$826.Template) {
            if (match$891('(')) {
                args$1284 = parseArguments$908();
                expr$1283 = delegate$845.createCallExpression(expr$1283, args$1284);
            } else if (match$891('[')) {
                expr$1283 = delegate$845.createMemberExpression('[', expr$1283, parseComputedMember$912());
            } else if (match$891('.')) {
                expr$1283 = delegate$845.createMemberExpression('.', expr$1283, parseNonComputedMember$911());
            } else {
                expr$1283 = delegate$845.createTaggedTemplateExpression(expr$1283, parseTemplateLiteral$905());
            }
        }
        return expr$1283;
    }
    function parseLeftHandSideExpression$915() {
        var expr$1286, property$1287;
        expr$1286 = matchKeyword$892('new') ? parseNewExpression$913() : parsePrimaryExpression$907();
        while (match$891('.') || match$891('[') || lookahead$848.type === Token$826.Template) {
            if (match$891('[')) {
                expr$1286 = delegate$845.createMemberExpression('[', expr$1286, parseComputedMember$912());
            } else if (match$891('.')) {
                expr$1286 = delegate$845.createMemberExpression('.', expr$1286, parseNonComputedMember$911());
            } else {
                expr$1286 = delegate$845.createTaggedTemplateExpression(expr$1286, parseTemplateLiteral$905());
            }
        }
        return expr$1286;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$916() {
        var expr$1288 = parseLeftHandSideExpressionAllowCall$914(), token$1289 = lookahead$848;
        if (lookahead$848.type !== Token$826.Punctuator) {
            return expr$1288;
        }
        if ((match$891('++') || match$891('--')) && !peekLineTerminator$885()) {
            // 11.3.1, 11.3.2
            if (strict$836 && expr$1288.type === Syntax$829.Identifier && isRestrictedWord$863(expr$1288.name)) {
                throwErrorTolerant$887({}, Messages$831.StrictLHSPostfix);
            }
            if (!isLeftHandSide$896(expr$1288)) {
                throwError$886({}, Messages$831.InvalidLHSInAssignment);
            }
            token$1289 = lex$882();
            expr$1288 = delegate$845.createPostfixExpression(token$1289.value, expr$1288);
        }
        return expr$1288;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$917() {
        var token$1290, expr$1291;
        if (lookahead$848.type !== Token$826.Punctuator && lookahead$848.type !== Token$826.Keyword) {
            return parsePostfixExpression$916();
        }
        if (match$891('++') || match$891('--')) {
            token$1290 = lex$882();
            expr$1291 = parseUnaryExpression$917();
            // 11.4.4, 11.4.5
            if (strict$836 && expr$1291.type === Syntax$829.Identifier && isRestrictedWord$863(expr$1291.name)) {
                throwErrorTolerant$887({}, Messages$831.StrictLHSPrefix);
            }
            if (!isLeftHandSide$896(expr$1291)) {
                throwError$886({}, Messages$831.InvalidLHSInAssignment);
            }
            return delegate$845.createUnaryExpression(token$1290.value, expr$1291);
        }
        if (match$891('+') || match$891('-') || match$891('~') || match$891('!')) {
            token$1290 = lex$882();
            expr$1291 = parseUnaryExpression$917();
            return delegate$845.createUnaryExpression(token$1290.value, expr$1291);
        }
        if (matchKeyword$892('delete') || matchKeyword$892('void') || matchKeyword$892('typeof')) {
            token$1290 = lex$882();
            expr$1291 = parseUnaryExpression$917();
            expr$1291 = delegate$845.createUnaryExpression(token$1290.value, expr$1291);
            if (strict$836 && expr$1291.operator === 'delete' && expr$1291.argument.type === Syntax$829.Identifier) {
                throwErrorTolerant$887({}, Messages$831.StrictDelete);
            }
            return expr$1291;
        }
        return parsePostfixExpression$916();
    }
    function binaryPrecedence$918(token$1292, allowIn$1293) {
        var prec$1294 = 0;
        if (token$1292.type !== Token$826.Punctuator && token$1292.type !== Token$826.Keyword) {
            return 0;
        }
        switch (token$1292.value) {
        case '||':
            prec$1294 = 1;
            break;
        case '&&':
            prec$1294 = 2;
            break;
        case '|':
            prec$1294 = 3;
            break;
        case '^':
            prec$1294 = 4;
            break;
        case '&':
            prec$1294 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1294 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1294 = 7;
            break;
        case 'in':
            prec$1294 = allowIn$1293 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1294 = 8;
            break;
        case '+':
        case '-':
            prec$1294 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1294 = 11;
            break;
        default:
            break;
        }
        return prec$1294;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$919() {
        var expr$1295, token$1296, prec$1297, previousAllowIn$1298, stack$1299, right$1300, operator$1301, left$1302, i$1303;
        previousAllowIn$1298 = state$850.allowIn;
        state$850.allowIn = true;
        expr$1295 = parseUnaryExpression$917();
        token$1296 = lookahead$848;
        prec$1297 = binaryPrecedence$918(token$1296, previousAllowIn$1298);
        if (prec$1297 === 0) {
            return expr$1295;
        }
        token$1296.prec = prec$1297;
        lex$882();
        stack$1299 = [
            expr$1295,
            token$1296,
            parseUnaryExpression$917()
        ];
        while ((prec$1297 = binaryPrecedence$918(lookahead$848, previousAllowIn$1298)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1299.length > 2 && prec$1297 <= stack$1299[stack$1299.length - 2].prec) {
                right$1300 = stack$1299.pop();
                operator$1301 = stack$1299.pop().value;
                left$1302 = stack$1299.pop();
                stack$1299.push(delegate$845.createBinaryExpression(operator$1301, left$1302, right$1300));
            }
            // Shift.
            token$1296 = lex$882();
            token$1296.prec = prec$1297;
            stack$1299.push(token$1296);
            stack$1299.push(parseUnaryExpression$917());
        }
        state$850.allowIn = previousAllowIn$1298;
        // Final reduce to clean-up the stack.
        i$1303 = stack$1299.length - 1;
        expr$1295 = stack$1299[i$1303];
        while (i$1303 > 1) {
            expr$1295 = delegate$845.createBinaryExpression(stack$1299[i$1303 - 1].value, stack$1299[i$1303 - 2], expr$1295);
            i$1303 -= 2;
        }
        return expr$1295;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$920() {
        var expr$1304, previousAllowIn$1305, consequent$1306, alternate$1307;
        expr$1304 = parseBinaryExpression$919();
        if (match$891('?')) {
            lex$882();
            previousAllowIn$1305 = state$850.allowIn;
            state$850.allowIn = true;
            consequent$1306 = parseAssignmentExpression$925();
            state$850.allowIn = previousAllowIn$1305;
            expect$889(':');
            alternate$1307 = parseAssignmentExpression$925();
            expr$1304 = delegate$845.createConditionalExpression(expr$1304, consequent$1306, alternate$1307);
        }
        return expr$1304;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$921(expr$1308) {
        var i$1309, len$1310, property$1311, element$1312;
        if (expr$1308.type === Syntax$829.ObjectExpression) {
            expr$1308.type = Syntax$829.ObjectPattern;
            for (i$1309 = 0, len$1310 = expr$1308.properties.length; i$1309 < len$1310; i$1309 += 1) {
                property$1311 = expr$1308.properties[i$1309];
                if (property$1311.kind !== 'init') {
                    throwError$886({}, Messages$831.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$921(property$1311.value);
            }
        } else if (expr$1308.type === Syntax$829.ArrayExpression) {
            expr$1308.type = Syntax$829.ArrayPattern;
            for (i$1309 = 0, len$1310 = expr$1308.elements.length; i$1309 < len$1310; i$1309 += 1) {
                element$1312 = expr$1308.elements[i$1309];
                if (element$1312) {
                    reinterpretAsAssignmentBindingPattern$921(element$1312);
                }
            }
        } else if (expr$1308.type === Syntax$829.Identifier) {
            if (isRestrictedWord$863(expr$1308.name)) {
                throwError$886({}, Messages$831.InvalidLHSInAssignment);
            }
        } else if (expr$1308.type === Syntax$829.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$921(expr$1308.argument);
            if (expr$1308.argument.type === Syntax$829.ObjectPattern) {
                throwError$886({}, Messages$831.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1308.type !== Syntax$829.MemberExpression && expr$1308.type !== Syntax$829.CallExpression && expr$1308.type !== Syntax$829.NewExpression) {
                throwError$886({}, Messages$831.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$922(options$1313, expr$1314) {
        var i$1315, len$1316, property$1317, element$1318;
        if (expr$1314.type === Syntax$829.ObjectExpression) {
            expr$1314.type = Syntax$829.ObjectPattern;
            for (i$1315 = 0, len$1316 = expr$1314.properties.length; i$1315 < len$1316; i$1315 += 1) {
                property$1317 = expr$1314.properties[i$1315];
                if (property$1317.kind !== 'init') {
                    throwError$886({}, Messages$831.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$922(options$1313, property$1317.value);
            }
        } else if (expr$1314.type === Syntax$829.ArrayExpression) {
            expr$1314.type = Syntax$829.ArrayPattern;
            for (i$1315 = 0, len$1316 = expr$1314.elements.length; i$1315 < len$1316; i$1315 += 1) {
                element$1318 = expr$1314.elements[i$1315];
                if (element$1318) {
                    reinterpretAsDestructuredParameter$922(options$1313, element$1318);
                }
            }
        } else if (expr$1314.type === Syntax$829.Identifier) {
            validateParam$960(options$1313, expr$1314, expr$1314.name);
        } else {
            if (expr$1314.type !== Syntax$829.MemberExpression) {
                throwError$886({}, Messages$831.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$923(expressions$1319) {
        var i$1320, len$1321, param$1322, params$1323, defaults$1324, defaultCount$1325, options$1326, rest$1327;
        params$1323 = [];
        defaults$1324 = [];
        defaultCount$1325 = 0;
        rest$1327 = null;
        options$1326 = { paramSet: {} };
        for (i$1320 = 0, len$1321 = expressions$1319.length; i$1320 < len$1321; i$1320 += 1) {
            param$1322 = expressions$1319[i$1320];
            if (param$1322.type === Syntax$829.Identifier) {
                params$1323.push(param$1322);
                defaults$1324.push(null);
                validateParam$960(options$1326, param$1322, param$1322.name);
            } else if (param$1322.type === Syntax$829.ObjectExpression || param$1322.type === Syntax$829.ArrayExpression) {
                reinterpretAsDestructuredParameter$922(options$1326, param$1322);
                params$1323.push(param$1322);
                defaults$1324.push(null);
            } else if (param$1322.type === Syntax$829.SpreadElement) {
                assert$852(i$1320 === len$1321 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$922(options$1326, param$1322.argument);
                rest$1327 = param$1322.argument;
            } else if (param$1322.type === Syntax$829.AssignmentExpression) {
                params$1323.push(param$1322.left);
                defaults$1324.push(param$1322.right);
                ++defaultCount$1325;
                validateParam$960(options$1326, param$1322.left, param$1322.left.name);
            } else {
                return null;
            }
        }
        if (options$1326.message === Messages$831.StrictParamDupe) {
            throwError$886(strict$836 ? options$1326.stricted : options$1326.firstRestricted, options$1326.message);
        }
        if (defaultCount$1325 === 0) {
            defaults$1324 = [];
        }
        return {
            params: params$1323,
            defaults: defaults$1324,
            rest: rest$1327,
            stricted: options$1326.stricted,
            firstRestricted: options$1326.firstRestricted,
            message: options$1326.message
        };
    }
    function parseArrowFunctionExpression$924(options$1328) {
        var previousStrict$1329, previousYieldAllowed$1330, body$1331;
        expect$889('=>');
        previousStrict$1329 = strict$836;
        previousYieldAllowed$1330 = state$850.yieldAllowed;
        state$850.yieldAllowed = false;
        body$1331 = parseConciseBody$958();
        if (strict$836 && options$1328.firstRestricted) {
            throwError$886(options$1328.firstRestricted, options$1328.message);
        }
        if (strict$836 && options$1328.stricted) {
            throwErrorTolerant$887(options$1328.stricted, options$1328.message);
        }
        strict$836 = previousStrict$1329;
        state$850.yieldAllowed = previousYieldAllowed$1330;
        return delegate$845.createArrowFunctionExpression(options$1328.params, options$1328.defaults, body$1331, options$1328.rest, body$1331.type !== Syntax$829.BlockStatement);
    }
    function parseAssignmentExpression$925() {
        var expr$1332, token$1333, params$1334, oldParenthesizedCount$1335;
        if (matchKeyword$892('yield')) {
            return parseYieldExpression$965();
        }
        oldParenthesizedCount$1335 = state$850.parenthesizedCount;
        if (match$891('(')) {
            token$1333 = lookahead2$884();
            if (token$1333.type === Token$826.Punctuator && token$1333.value === ')' || token$1333.value === '...') {
                params$1334 = parseParams$962();
                if (!match$891('=>')) {
                    throwUnexpected$888(lex$882());
                }
                return parseArrowFunctionExpression$924(params$1334);
            }
        }
        token$1333 = lookahead$848;
        expr$1332 = parseConditionalExpression$920();
        if (match$891('=>') && (state$850.parenthesizedCount === oldParenthesizedCount$1335 || state$850.parenthesizedCount === oldParenthesizedCount$1335 + 1)) {
            if (expr$1332.type === Syntax$829.Identifier) {
                params$1334 = reinterpretAsCoverFormalsList$923([expr$1332]);
            } else if (expr$1332.type === Syntax$829.SequenceExpression) {
                params$1334 = reinterpretAsCoverFormalsList$923(expr$1332.expressions);
            }
            if (params$1334) {
                return parseArrowFunctionExpression$924(params$1334);
            }
        }
        if (matchAssign$894()) {
            // 11.13.1
            if (strict$836 && expr$1332.type === Syntax$829.Identifier && isRestrictedWord$863(expr$1332.name)) {
                throwErrorTolerant$887(token$1333, Messages$831.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$891('=') && (expr$1332.type === Syntax$829.ObjectExpression || expr$1332.type === Syntax$829.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$921(expr$1332);
            } else if (!isLeftHandSide$896(expr$1332)) {
                throwError$886({}, Messages$831.InvalidLHSInAssignment);
            }
            expr$1332 = delegate$845.createAssignmentExpression(lex$882().value, expr$1332, parseAssignmentExpression$925());
        }
        return expr$1332;
    }
    // 11.14 Comma Operator
    function parseExpression$926() {
        var expr$1336, expressions$1337, sequence$1338, coverFormalsList$1339, spreadFound$1340, oldParenthesizedCount$1341;
        oldParenthesizedCount$1341 = state$850.parenthesizedCount;
        expr$1336 = parseAssignmentExpression$925();
        expressions$1337 = [expr$1336];
        if (match$891(',')) {
            while (streamIndex$847 < length$844) {
                if (!match$891(',')) {
                    break;
                }
                lex$882();
                expr$1336 = parseSpreadOrAssignmentExpression$909();
                expressions$1337.push(expr$1336);
                if (expr$1336.type === Syntax$829.SpreadElement) {
                    spreadFound$1340 = true;
                    if (!match$891(')')) {
                        throwError$886({}, Messages$831.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1338 = delegate$845.createSequenceExpression(expressions$1337);
        }
        if (match$891('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$850.parenthesizedCount === oldParenthesizedCount$1341 || state$850.parenthesizedCount === oldParenthesizedCount$1341 + 1) {
                expr$1336 = expr$1336.type === Syntax$829.SequenceExpression ? expr$1336.expressions : expressions$1337;
                coverFormalsList$1339 = reinterpretAsCoverFormalsList$923(expr$1336);
                if (coverFormalsList$1339) {
                    return parseArrowFunctionExpression$924(coverFormalsList$1339);
                }
            }
            throwUnexpected$888(lex$882());
        }
        if (spreadFound$1340 && lookahead2$884().value !== '=>') {
            throwError$886({}, Messages$831.IllegalSpread);
        }
        return sequence$1338 || expr$1336;
    }
    // 12.1 Block
    function parseStatementList$927() {
        var list$1342 = [], statement$1343;
        while (streamIndex$847 < length$844) {
            if (match$891('}')) {
                break;
            }
            statement$1343 = parseSourceElement$972();
            if (typeof statement$1343 === 'undefined') {
                break;
            }
            list$1342.push(statement$1343);
        }
        return list$1342;
    }
    function parseBlock$928() {
        var block$1344;
        expect$889('{');
        block$1344 = parseStatementList$927();
        expect$889('}');
        return delegate$845.createBlockStatement(block$1344);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$929() {
        var token$1345 = lookahead$848, resolvedIdent$1346;
        if (token$1345.type !== Token$826.Identifier) {
            throwUnexpected$888(token$1345);
        }
        resolvedIdent$1346 = expander$825.resolve(tokenStream$846[lookaheadIndex$849]);
        lex$882();
        return delegate$845.createIdentifier(resolvedIdent$1346);
    }
    function parseVariableDeclaration$930(kind$1347) {
        var id$1348, init$1349 = null;
        if (match$891('{')) {
            id$1348 = parseObjectInitialiser$903();
            reinterpretAsAssignmentBindingPattern$921(id$1348);
        } else if (match$891('[')) {
            id$1348 = parseArrayInitialiser$898();
            reinterpretAsAssignmentBindingPattern$921(id$1348);
        } else {
            id$1348 = state$850.allowKeyword ? parseNonComputedProperty$910() : parseVariableIdentifier$929();
            // 12.2.1
            if (strict$836 && isRestrictedWord$863(id$1348.name)) {
                throwErrorTolerant$887({}, Messages$831.StrictVarName);
            }
        }
        if (kind$1347 === 'const') {
            if (!match$891('=')) {
                throwError$886({}, Messages$831.NoUnintializedConst);
            }
            expect$889('=');
            init$1349 = parseAssignmentExpression$925();
        } else if (match$891('=')) {
            lex$882();
            init$1349 = parseAssignmentExpression$925();
        }
        return delegate$845.createVariableDeclarator(id$1348, init$1349);
    }
    function parseVariableDeclarationList$931(kind$1350) {
        var list$1351 = [];
        do {
            list$1351.push(parseVariableDeclaration$930(kind$1350));
            if (!match$891(',')) {
                break;
            }
            lex$882();
        } while (streamIndex$847 < length$844);
        return list$1351;
    }
    function parseVariableStatement$932() {
        var declarations$1352;
        expectKeyword$890('var');
        declarations$1352 = parseVariableDeclarationList$931();
        consumeSemicolon$895();
        return delegate$845.createVariableDeclaration(declarations$1352, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$933(kind$1353) {
        var declarations$1354;
        expectKeyword$890(kind$1353);
        declarations$1354 = parseVariableDeclarationList$931(kind$1353);
        consumeSemicolon$895();
        return delegate$845.createVariableDeclaration(declarations$1354, kind$1353);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$934() {
        var id$1355, src$1356, body$1357;
        lex$882();
        // 'module'
        if (peekLineTerminator$885()) {
            throwError$886({}, Messages$831.NewlineAfterModule);
        }
        switch (lookahead$848.type) {
        case Token$826.StringLiteral:
            id$1355 = parsePrimaryExpression$907();
            body$1357 = parseModuleBlock$977();
            src$1356 = null;
            break;
        case Token$826.Identifier:
            id$1355 = parseVariableIdentifier$929();
            body$1357 = null;
            if (!matchContextualKeyword$893('from')) {
                throwUnexpected$888(lex$882());
            }
            lex$882();
            src$1356 = parsePrimaryExpression$907();
            if (src$1356.type !== Syntax$829.Literal) {
                throwError$886({}, Messages$831.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$895();
        return delegate$845.createModuleDeclaration(id$1355, src$1356, body$1357);
    }
    function parseExportBatchSpecifier$935() {
        expect$889('*');
        return delegate$845.createExportBatchSpecifier();
    }
    function parseExportSpecifier$936() {
        var id$1358, name$1359 = null;
        id$1358 = parseVariableIdentifier$929();
        if (matchContextualKeyword$893('as')) {
            lex$882();
            name$1359 = parseNonComputedProperty$910();
        }
        return delegate$845.createExportSpecifier(id$1358, name$1359);
    }
    function parseExportDeclaration$937() {
        var previousAllowKeyword$1360, decl$1361, def$1362, src$1363, specifiers$1364;
        expectKeyword$890('export');
        if (lookahead$848.type === Token$826.Keyword) {
            switch (lookahead$848.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$845.createExportDeclaration(parseSourceElement$972(), null, null);
            }
        }
        if (isIdentifierName$879(lookahead$848)) {
            previousAllowKeyword$1360 = state$850.allowKeyword;
            state$850.allowKeyword = true;
            decl$1361 = parseVariableDeclarationList$931('let');
            state$850.allowKeyword = previousAllowKeyword$1360;
            return delegate$845.createExportDeclaration(decl$1361, null, null);
        }
        specifiers$1364 = [];
        src$1363 = null;
        if (match$891('*')) {
            specifiers$1364.push(parseExportBatchSpecifier$935());
        } else {
            expect$889('{');
            do {
                specifiers$1364.push(parseExportSpecifier$936());
            } while (match$891(',') && lex$882());
            expect$889('}');
        }
        if (matchContextualKeyword$893('from')) {
            lex$882();
            src$1363 = parsePrimaryExpression$907();
            if (src$1363.type !== Syntax$829.Literal) {
                throwError$886({}, Messages$831.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$895();
        return delegate$845.createExportDeclaration(null, specifiers$1364, src$1363);
    }
    function parseImportDeclaration$938() {
        var specifiers$1365, kind$1366, src$1367;
        expectKeyword$890('import');
        specifiers$1365 = [];
        if (isIdentifierName$879(lookahead$848)) {
            kind$1366 = 'default';
            specifiers$1365.push(parseImportSpecifier$939());
            if (!matchContextualKeyword$893('from')) {
                throwError$886({}, Messages$831.NoFromAfterImport);
            }
            lex$882();
        } else if (match$891('{')) {
            kind$1366 = 'named';
            lex$882();
            do {
                specifiers$1365.push(parseImportSpecifier$939());
            } while (match$891(',') && lex$882());
            expect$889('}');
            if (!matchContextualKeyword$893('from')) {
                throwError$886({}, Messages$831.NoFromAfterImport);
            }
            lex$882();
        }
        src$1367 = parsePrimaryExpression$907();
        if (src$1367.type !== Syntax$829.Literal) {
            throwError$886({}, Messages$831.InvalidModuleSpecifier);
        }
        consumeSemicolon$895();
        return delegate$845.createImportDeclaration(specifiers$1365, kind$1366, src$1367);
    }
    function parseImportSpecifier$939() {
        var id$1368, name$1369 = null;
        id$1368 = parseNonComputedProperty$910();
        if (matchContextualKeyword$893('as')) {
            lex$882();
            name$1369 = parseVariableIdentifier$929();
        }
        return delegate$845.createImportSpecifier(id$1368, name$1369);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$940() {
        expect$889(';');
        return delegate$845.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$941() {
        var expr$1370 = parseExpression$926();
        consumeSemicolon$895();
        return delegate$845.createExpressionStatement(expr$1370);
    }
    // 12.5 If statement
    function parseIfStatement$942() {
        var test$1371, consequent$1372, alternate$1373;
        expectKeyword$890('if');
        expect$889('(');
        test$1371 = parseExpression$926();
        expect$889(')');
        consequent$1372 = parseStatement$957();
        if (matchKeyword$892('else')) {
            lex$882();
            alternate$1373 = parseStatement$957();
        } else {
            alternate$1373 = null;
        }
        return delegate$845.createIfStatement(test$1371, consequent$1372, alternate$1373);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$943() {
        var body$1374, test$1375, oldInIteration$1376;
        expectKeyword$890('do');
        oldInIteration$1376 = state$850.inIteration;
        state$850.inIteration = true;
        body$1374 = parseStatement$957();
        state$850.inIteration = oldInIteration$1376;
        expectKeyword$890('while');
        expect$889('(');
        test$1375 = parseExpression$926();
        expect$889(')');
        if (match$891(';')) {
            lex$882();
        }
        return delegate$845.createDoWhileStatement(body$1374, test$1375);
    }
    function parseWhileStatement$944() {
        var test$1377, body$1378, oldInIteration$1379;
        expectKeyword$890('while');
        expect$889('(');
        test$1377 = parseExpression$926();
        expect$889(')');
        oldInIteration$1379 = state$850.inIteration;
        state$850.inIteration = true;
        body$1378 = parseStatement$957();
        state$850.inIteration = oldInIteration$1379;
        return delegate$845.createWhileStatement(test$1377, body$1378);
    }
    function parseForVariableDeclaration$945() {
        var token$1380 = lex$882(), declarations$1381 = parseVariableDeclarationList$931();
        return delegate$845.createVariableDeclaration(declarations$1381, token$1380.value);
    }
    function parseForStatement$946(opts$1382) {
        var init$1383, test$1384, update$1385, left$1386, right$1387, body$1388, operator$1389, oldInIteration$1390;
        init$1383 = test$1384 = update$1385 = null;
        expectKeyword$890('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$893('each')) {
            throwError$886({}, Messages$831.EachNotAllowed);
        }
        expect$889('(');
        if (match$891(';')) {
            lex$882();
        } else {
            if (matchKeyword$892('var') || matchKeyword$892('let') || matchKeyword$892('const')) {
                state$850.allowIn = false;
                init$1383 = parseForVariableDeclaration$945();
                state$850.allowIn = true;
                if (init$1383.declarations.length === 1) {
                    if (matchKeyword$892('in') || matchContextualKeyword$893('of')) {
                        operator$1389 = lookahead$848;
                        if (!((operator$1389.value === 'in' || init$1383.kind !== 'var') && init$1383.declarations[0].init)) {
                            lex$882();
                            left$1386 = init$1383;
                            right$1387 = parseExpression$926();
                            init$1383 = null;
                        }
                    }
                }
            } else {
                state$850.allowIn = false;
                init$1383 = parseExpression$926();
                state$850.allowIn = true;
                if (matchContextualKeyword$893('of')) {
                    operator$1389 = lex$882();
                    left$1386 = init$1383;
                    right$1387 = parseExpression$926();
                    init$1383 = null;
                } else if (matchKeyword$892('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$897(init$1383)) {
                        throwError$886({}, Messages$831.InvalidLHSInForIn);
                    }
                    operator$1389 = lex$882();
                    left$1386 = init$1383;
                    right$1387 = parseExpression$926();
                    init$1383 = null;
                }
            }
            if (typeof left$1386 === 'undefined') {
                expect$889(';');
            }
        }
        if (typeof left$1386 === 'undefined') {
            if (!match$891(';')) {
                test$1384 = parseExpression$926();
            }
            expect$889(';');
            if (!match$891(')')) {
                update$1385 = parseExpression$926();
            }
        }
        expect$889(')');
        oldInIteration$1390 = state$850.inIteration;
        state$850.inIteration = true;
        if (!(opts$1382 !== undefined && opts$1382.ignoreBody)) {
            body$1388 = parseStatement$957();
        }
        state$850.inIteration = oldInIteration$1390;
        if (typeof left$1386 === 'undefined') {
            return delegate$845.createForStatement(init$1383, test$1384, update$1385, body$1388);
        }
        if (operator$1389.value === 'in') {
            return delegate$845.createForInStatement(left$1386, right$1387, body$1388);
        }
        return delegate$845.createForOfStatement(left$1386, right$1387, body$1388);
    }
    // 12.7 The continue statement
    function parseContinueStatement$947() {
        var label$1391 = null, key$1392;
        expectKeyword$890('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$848.value.charCodeAt(0) === 59) {
            lex$882();
            if (!state$850.inIteration) {
                throwError$886({}, Messages$831.IllegalContinue);
            }
            return delegate$845.createContinueStatement(null);
        }
        if (peekLineTerminator$885()) {
            if (!state$850.inIteration) {
                throwError$886({}, Messages$831.IllegalContinue);
            }
            return delegate$845.createContinueStatement(null);
        }
        if (lookahead$848.type === Token$826.Identifier) {
            label$1391 = parseVariableIdentifier$929();
            key$1392 = '$' + label$1391.name;
            if (!Object.prototype.hasOwnProperty.call(state$850.labelSet, key$1392)) {
                throwError$886({}, Messages$831.UnknownLabel, label$1391.name);
            }
        }
        consumeSemicolon$895();
        if (label$1391 === null && !state$850.inIteration) {
            throwError$886({}, Messages$831.IllegalContinue);
        }
        return delegate$845.createContinueStatement(label$1391);
    }
    // 12.8 The break statement
    function parseBreakStatement$948() {
        var label$1393 = null, key$1394;
        expectKeyword$890('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$848.value.charCodeAt(0) === 59) {
            lex$882();
            if (!(state$850.inIteration || state$850.inSwitch)) {
                throwError$886({}, Messages$831.IllegalBreak);
            }
            return delegate$845.createBreakStatement(null);
        }
        if (peekLineTerminator$885()) {
            if (!(state$850.inIteration || state$850.inSwitch)) {
                throwError$886({}, Messages$831.IllegalBreak);
            }
            return delegate$845.createBreakStatement(null);
        }
        if (lookahead$848.type === Token$826.Identifier) {
            label$1393 = parseVariableIdentifier$929();
            key$1394 = '$' + label$1393.name;
            if (!Object.prototype.hasOwnProperty.call(state$850.labelSet, key$1394)) {
                throwError$886({}, Messages$831.UnknownLabel, label$1393.name);
            }
        }
        consumeSemicolon$895();
        if (label$1393 === null && !(state$850.inIteration || state$850.inSwitch)) {
            throwError$886({}, Messages$831.IllegalBreak);
        }
        return delegate$845.createBreakStatement(label$1393);
    }
    // 12.9 The return statement
    function parseReturnStatement$949() {
        var argument$1395 = null;
        expectKeyword$890('return');
        if (!state$850.inFunctionBody) {
            throwErrorTolerant$887({}, Messages$831.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$859(String(lookahead$848.value).charCodeAt(0))) {
            argument$1395 = parseExpression$926();
            consumeSemicolon$895();
            return delegate$845.createReturnStatement(argument$1395);
        }
        if (peekLineTerminator$885()) {
            return delegate$845.createReturnStatement(null);
        }
        if (!match$891(';')) {
            if (!match$891('}') && lookahead$848.type !== Token$826.EOF) {
                argument$1395 = parseExpression$926();
            }
        }
        consumeSemicolon$895();
        return delegate$845.createReturnStatement(argument$1395);
    }
    // 12.10 The with statement
    function parseWithStatement$950() {
        var object$1396, body$1397;
        if (strict$836) {
            throwErrorTolerant$887({}, Messages$831.StrictModeWith);
        }
        expectKeyword$890('with');
        expect$889('(');
        object$1396 = parseExpression$926();
        expect$889(')');
        body$1397 = parseStatement$957();
        return delegate$845.createWithStatement(object$1396, body$1397);
    }
    // 12.10 The swith statement
    function parseSwitchCase$951() {
        var test$1398, consequent$1399 = [], sourceElement$1400;
        if (matchKeyword$892('default')) {
            lex$882();
            test$1398 = null;
        } else {
            expectKeyword$890('case');
            test$1398 = parseExpression$926();
        }
        expect$889(':');
        while (streamIndex$847 < length$844) {
            if (match$891('}') || matchKeyword$892('default') || matchKeyword$892('case')) {
                break;
            }
            sourceElement$1400 = parseSourceElement$972();
            if (typeof sourceElement$1400 === 'undefined') {
                break;
            }
            consequent$1399.push(sourceElement$1400);
        }
        return delegate$845.createSwitchCase(test$1398, consequent$1399);
    }
    function parseSwitchStatement$952() {
        var discriminant$1401, cases$1402, clause$1403, oldInSwitch$1404, defaultFound$1405;
        expectKeyword$890('switch');
        expect$889('(');
        discriminant$1401 = parseExpression$926();
        expect$889(')');
        expect$889('{');
        cases$1402 = [];
        if (match$891('}')) {
            lex$882();
            return delegate$845.createSwitchStatement(discriminant$1401, cases$1402);
        }
        oldInSwitch$1404 = state$850.inSwitch;
        state$850.inSwitch = true;
        defaultFound$1405 = false;
        while (streamIndex$847 < length$844) {
            if (match$891('}')) {
                break;
            }
            clause$1403 = parseSwitchCase$951();
            if (clause$1403.test === null) {
                if (defaultFound$1405) {
                    throwError$886({}, Messages$831.MultipleDefaultsInSwitch);
                }
                defaultFound$1405 = true;
            }
            cases$1402.push(clause$1403);
        }
        state$850.inSwitch = oldInSwitch$1404;
        expect$889('}');
        return delegate$845.createSwitchStatement(discriminant$1401, cases$1402);
    }
    // 12.13 The throw statement
    function parseThrowStatement$953() {
        var argument$1406;
        expectKeyword$890('throw');
        if (peekLineTerminator$885()) {
            throwError$886({}, Messages$831.NewlineAfterThrow);
        }
        argument$1406 = parseExpression$926();
        consumeSemicolon$895();
        return delegate$845.createThrowStatement(argument$1406);
    }
    // 12.14 The try statement
    function parseCatchClause$954() {
        var param$1407, body$1408;
        expectKeyword$890('catch');
        expect$889('(');
        if (match$891(')')) {
            throwUnexpected$888(lookahead$848);
        }
        param$1407 = parseExpression$926();
        // 12.14.1
        if (strict$836 && param$1407.type === Syntax$829.Identifier && isRestrictedWord$863(param$1407.name)) {
            throwErrorTolerant$887({}, Messages$831.StrictCatchVariable);
        }
        expect$889(')');
        body$1408 = parseBlock$928();
        return delegate$845.createCatchClause(param$1407, body$1408);
    }
    function parseTryStatement$955() {
        var block$1409, handlers$1410 = [], finalizer$1411 = null;
        expectKeyword$890('try');
        block$1409 = parseBlock$928();
        if (matchKeyword$892('catch')) {
            handlers$1410.push(parseCatchClause$954());
        }
        if (matchKeyword$892('finally')) {
            lex$882();
            finalizer$1411 = parseBlock$928();
        }
        if (handlers$1410.length === 0 && !finalizer$1411) {
            throwError$886({}, Messages$831.NoCatchOrFinally);
        }
        return delegate$845.createTryStatement(block$1409, [], handlers$1410, finalizer$1411);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$956() {
        expectKeyword$890('debugger');
        consumeSemicolon$895();
        return delegate$845.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$957() {
        var type$1412 = lookahead$848.type, expr$1413, labeledBody$1414, key$1415;
        if (type$1412 === Token$826.EOF) {
            throwUnexpected$888(lookahead$848);
        }
        if (type$1412 === Token$826.Punctuator) {
            switch (lookahead$848.value) {
            case ';':
                return parseEmptyStatement$940();
            case '{':
                return parseBlock$928();
            case '(':
                return parseExpressionStatement$941();
            default:
                break;
            }
        }
        if (type$1412 === Token$826.Keyword) {
            switch (lookahead$848.value) {
            case 'break':
                return parseBreakStatement$948();
            case 'continue':
                return parseContinueStatement$947();
            case 'debugger':
                return parseDebuggerStatement$956();
            case 'do':
                return parseDoWhileStatement$943();
            case 'for':
                return parseForStatement$946();
            case 'function':
                return parseFunctionDeclaration$963();
            case 'class':
                return parseClassDeclaration$970();
            case 'if':
                return parseIfStatement$942();
            case 'return':
                return parseReturnStatement$949();
            case 'switch':
                return parseSwitchStatement$952();
            case 'throw':
                return parseThrowStatement$953();
            case 'try':
                return parseTryStatement$955();
            case 'var':
                return parseVariableStatement$932();
            case 'while':
                return parseWhileStatement$944();
            case 'with':
                return parseWithStatement$950();
            default:
                break;
            }
        }
        expr$1413 = parseExpression$926();
        // 12.12 Labelled Statements
        if (expr$1413.type === Syntax$829.Identifier && match$891(':')) {
            lex$882();
            key$1415 = '$' + expr$1413.name;
            if (Object.prototype.hasOwnProperty.call(state$850.labelSet, key$1415)) {
                throwError$886({}, Messages$831.Redeclaration, 'Label', expr$1413.name);
            }
            state$850.labelSet[key$1415] = true;
            labeledBody$1414 = parseStatement$957();
            delete state$850.labelSet[key$1415];
            return delegate$845.createLabeledStatement(expr$1413, labeledBody$1414);
        }
        consumeSemicolon$895();
        return delegate$845.createExpressionStatement(expr$1413);
    }
    // 13 Function Definition
    function parseConciseBody$958() {
        if (match$891('{')) {
            return parseFunctionSourceElements$959();
        }
        return parseAssignmentExpression$925();
    }
    function parseFunctionSourceElements$959() {
        var sourceElement$1416, sourceElements$1417 = [], token$1418, directive$1419, firstRestricted$1420, oldLabelSet$1421, oldInIteration$1422, oldInSwitch$1423, oldInFunctionBody$1424, oldParenthesizedCount$1425;
        expect$889('{');
        while (streamIndex$847 < length$844) {
            if (lookahead$848.type !== Token$826.StringLiteral) {
                break;
            }
            token$1418 = lookahead$848;
            sourceElement$1416 = parseSourceElement$972();
            sourceElements$1417.push(sourceElement$1416);
            if (sourceElement$1416.expression.type !== Syntax$829.Literal) {
                // this is not directive
                break;
            }
            directive$1419 = token$1418.value;
            if (directive$1419 === 'use strict') {
                strict$836 = true;
                if (firstRestricted$1420) {
                    throwErrorTolerant$887(firstRestricted$1420, Messages$831.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1420 && token$1418.octal) {
                    firstRestricted$1420 = token$1418;
                }
            }
        }
        oldLabelSet$1421 = state$850.labelSet;
        oldInIteration$1422 = state$850.inIteration;
        oldInSwitch$1423 = state$850.inSwitch;
        oldInFunctionBody$1424 = state$850.inFunctionBody;
        oldParenthesizedCount$1425 = state$850.parenthesizedCount;
        state$850.labelSet = {};
        state$850.inIteration = false;
        state$850.inSwitch = false;
        state$850.inFunctionBody = true;
        state$850.parenthesizedCount = 0;
        while (streamIndex$847 < length$844) {
            if (match$891('}')) {
                break;
            }
            sourceElement$1416 = parseSourceElement$972();
            if (typeof sourceElement$1416 === 'undefined') {
                break;
            }
            sourceElements$1417.push(sourceElement$1416);
        }
        expect$889('}');
        state$850.labelSet = oldLabelSet$1421;
        state$850.inIteration = oldInIteration$1422;
        state$850.inSwitch = oldInSwitch$1423;
        state$850.inFunctionBody = oldInFunctionBody$1424;
        state$850.parenthesizedCount = oldParenthesizedCount$1425;
        return delegate$845.createBlockStatement(sourceElements$1417);
    }
    function validateParam$960(options$1426, param$1427, name$1428) {
        var key$1429 = '$' + name$1428;
        if (strict$836) {
            if (isRestrictedWord$863(name$1428)) {
                options$1426.stricted = param$1427;
                options$1426.message = Messages$831.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1426.paramSet, key$1429)) {
                options$1426.stricted = param$1427;
                options$1426.message = Messages$831.StrictParamDupe;
            }
        } else if (!options$1426.firstRestricted) {
            if (isRestrictedWord$863(name$1428)) {
                options$1426.firstRestricted = param$1427;
                options$1426.message = Messages$831.StrictParamName;
            } else if (isStrictModeReservedWord$862(name$1428)) {
                options$1426.firstRestricted = param$1427;
                options$1426.message = Messages$831.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1426.paramSet, key$1429)) {
                options$1426.firstRestricted = param$1427;
                options$1426.message = Messages$831.StrictParamDupe;
            }
        }
        options$1426.paramSet[key$1429] = true;
    }
    function parseParam$961(options$1430) {
        var token$1431, rest$1432, param$1433, def$1434;
        token$1431 = lookahead$848;
        if (token$1431.value === '...') {
            token$1431 = lex$882();
            rest$1432 = true;
        }
        if (match$891('[')) {
            param$1433 = parseArrayInitialiser$898();
            reinterpretAsDestructuredParameter$922(options$1430, param$1433);
        } else if (match$891('{')) {
            if (rest$1432) {
                throwError$886({}, Messages$831.ObjectPatternAsRestParameter);
            }
            param$1433 = parseObjectInitialiser$903();
            reinterpretAsDestructuredParameter$922(options$1430, param$1433);
        } else {
            param$1433 = parseVariableIdentifier$929();
            validateParam$960(options$1430, token$1431, token$1431.value);
            if (match$891('=')) {
                if (rest$1432) {
                    throwErrorTolerant$887(lookahead$848, Messages$831.DefaultRestParameter);
                }
                lex$882();
                def$1434 = parseAssignmentExpression$925();
                ++options$1430.defaultCount;
            }
        }
        if (rest$1432) {
            if (!match$891(')')) {
                throwError$886({}, Messages$831.ParameterAfterRestParameter);
            }
            options$1430.rest = param$1433;
            return false;
        }
        options$1430.params.push(param$1433);
        options$1430.defaults.push(def$1434);
        return !match$891(')');
    }
    function parseParams$962(firstRestricted$1435) {
        var options$1436;
        options$1436 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1435
        };
        expect$889('(');
        if (!match$891(')')) {
            options$1436.paramSet = {};
            while (streamIndex$847 < length$844) {
                if (!parseParam$961(options$1436)) {
                    break;
                }
                expect$889(',');
            }
        }
        expect$889(')');
        if (options$1436.defaultCount === 0) {
            options$1436.defaults = [];
        }
        return options$1436;
    }
    function parseFunctionDeclaration$963() {
        var id$1437, body$1438, token$1439, tmp$1440, firstRestricted$1441, message$1442, previousStrict$1443, previousYieldAllowed$1444, generator$1445, expression$1446;
        expectKeyword$890('function');
        generator$1445 = false;
        if (match$891('*')) {
            lex$882();
            generator$1445 = true;
        }
        token$1439 = lookahead$848;
        id$1437 = parseVariableIdentifier$929();
        if (strict$836) {
            if (isRestrictedWord$863(token$1439.value)) {
                throwErrorTolerant$887(token$1439, Messages$831.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$863(token$1439.value)) {
                firstRestricted$1441 = token$1439;
                message$1442 = Messages$831.StrictFunctionName;
            } else if (isStrictModeReservedWord$862(token$1439.value)) {
                firstRestricted$1441 = token$1439;
                message$1442 = Messages$831.StrictReservedWord;
            }
        }
        tmp$1440 = parseParams$962(firstRestricted$1441);
        firstRestricted$1441 = tmp$1440.firstRestricted;
        if (tmp$1440.message) {
            message$1442 = tmp$1440.message;
        }
        previousStrict$1443 = strict$836;
        previousYieldAllowed$1444 = state$850.yieldAllowed;
        state$850.yieldAllowed = generator$1445;
        // here we redo some work in order to set 'expression'
        expression$1446 = !match$891('{');
        body$1438 = parseConciseBody$958();
        if (strict$836 && firstRestricted$1441) {
            throwError$886(firstRestricted$1441, message$1442);
        }
        if (strict$836 && tmp$1440.stricted) {
            throwErrorTolerant$887(tmp$1440.stricted, message$1442);
        }
        if (state$850.yieldAllowed && !state$850.yieldFound) {
            throwErrorTolerant$887({}, Messages$831.NoYieldInGenerator);
        }
        strict$836 = previousStrict$1443;
        state$850.yieldAllowed = previousYieldAllowed$1444;
        return delegate$845.createFunctionDeclaration(id$1437, tmp$1440.params, tmp$1440.defaults, body$1438, tmp$1440.rest, generator$1445, expression$1446);
    }
    function parseFunctionExpression$964() {
        var token$1447, id$1448 = null, firstRestricted$1449, message$1450, tmp$1451, body$1452, previousStrict$1453, previousYieldAllowed$1454, generator$1455, expression$1456;
        expectKeyword$890('function');
        generator$1455 = false;
        if (match$891('*')) {
            lex$882();
            generator$1455 = true;
        }
        if (!match$891('(')) {
            token$1447 = lookahead$848;
            id$1448 = parseVariableIdentifier$929();
            if (strict$836) {
                if (isRestrictedWord$863(token$1447.value)) {
                    throwErrorTolerant$887(token$1447, Messages$831.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$863(token$1447.value)) {
                    firstRestricted$1449 = token$1447;
                    message$1450 = Messages$831.StrictFunctionName;
                } else if (isStrictModeReservedWord$862(token$1447.value)) {
                    firstRestricted$1449 = token$1447;
                    message$1450 = Messages$831.StrictReservedWord;
                }
            }
        }
        tmp$1451 = parseParams$962(firstRestricted$1449);
        firstRestricted$1449 = tmp$1451.firstRestricted;
        if (tmp$1451.message) {
            message$1450 = tmp$1451.message;
        }
        previousStrict$1453 = strict$836;
        previousYieldAllowed$1454 = state$850.yieldAllowed;
        state$850.yieldAllowed = generator$1455;
        // here we redo some work in order to set 'expression'
        expression$1456 = !match$891('{');
        body$1452 = parseConciseBody$958();
        if (strict$836 && firstRestricted$1449) {
            throwError$886(firstRestricted$1449, message$1450);
        }
        if (strict$836 && tmp$1451.stricted) {
            throwErrorTolerant$887(tmp$1451.stricted, message$1450);
        }
        if (state$850.yieldAllowed && !state$850.yieldFound) {
            throwErrorTolerant$887({}, Messages$831.NoYieldInGenerator);
        }
        strict$836 = previousStrict$1453;
        state$850.yieldAllowed = previousYieldAllowed$1454;
        return delegate$845.createFunctionExpression(id$1448, tmp$1451.params, tmp$1451.defaults, body$1452, tmp$1451.rest, generator$1455, expression$1456);
    }
    function parseYieldExpression$965() {
        var delegateFlag$1457, expr$1458, previousYieldAllowed$1459;
        expectKeyword$890('yield');
        if (!state$850.yieldAllowed) {
            throwErrorTolerant$887({}, Messages$831.IllegalYield);
        }
        delegateFlag$1457 = false;
        if (match$891('*')) {
            lex$882();
            delegateFlag$1457 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1459 = state$850.yieldAllowed;
        state$850.yieldAllowed = false;
        expr$1458 = parseAssignmentExpression$925();
        state$850.yieldAllowed = previousYieldAllowed$1459;
        state$850.yieldFound = true;
        return delegate$845.createYieldExpression(expr$1458, delegateFlag$1457);
    }
    // 14 Classes
    function parseMethodDefinition$966(existingPropNames$1460) {
        var token$1461, key$1462, param$1463, propType$1464, isValidDuplicateProp$1465 = false;
        if (lookahead$848.value === 'static') {
            propType$1464 = ClassPropertyType$834.static;
            lex$882();
        } else {
            propType$1464 = ClassPropertyType$834.prototype;
        }
        if (match$891('*')) {
            lex$882();
            return delegate$845.createMethodDefinition(propType$1464, '', parseObjectPropertyKey$901(), parsePropertyMethodFunction$900({ generator: true }));
        }
        token$1461 = lookahead$848;
        key$1462 = parseObjectPropertyKey$901();
        if (token$1461.value === 'get' && !match$891('(')) {
            key$1462 = parseObjectPropertyKey$901();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1460[propType$1464].hasOwnProperty(key$1462.name)) {
                isValidDuplicateProp$1465 = existingPropNames$1460[propType$1464][key$1462.name].get === undefined && existingPropNames$1460[propType$1464][key$1462.name].data === undefined && existingPropNames$1460[propType$1464][key$1462.name].set !== undefined;
                if (!isValidDuplicateProp$1465) {
                    throwError$886(key$1462, Messages$831.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1460[propType$1464][key$1462.name] = {};
            }
            existingPropNames$1460[propType$1464][key$1462.name].get = true;
            expect$889('(');
            expect$889(')');
            return delegate$845.createMethodDefinition(propType$1464, 'get', key$1462, parsePropertyFunction$899({ generator: false }));
        }
        if (token$1461.value === 'set' && !match$891('(')) {
            key$1462 = parseObjectPropertyKey$901();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1460[propType$1464].hasOwnProperty(key$1462.name)) {
                isValidDuplicateProp$1465 = existingPropNames$1460[propType$1464][key$1462.name].set === undefined && existingPropNames$1460[propType$1464][key$1462.name].data === undefined && existingPropNames$1460[propType$1464][key$1462.name].get !== undefined;
                if (!isValidDuplicateProp$1465) {
                    throwError$886(key$1462, Messages$831.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1460[propType$1464][key$1462.name] = {};
            }
            existingPropNames$1460[propType$1464][key$1462.name].set = true;
            expect$889('(');
            token$1461 = lookahead$848;
            param$1463 = [parseVariableIdentifier$929()];
            expect$889(')');
            return delegate$845.createMethodDefinition(propType$1464, 'set', key$1462, parsePropertyFunction$899({
                params: param$1463,
                generator: false,
                name: token$1461
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1460[propType$1464].hasOwnProperty(key$1462.name)) {
            throwError$886(key$1462, Messages$831.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1460[propType$1464][key$1462.name] = {};
        }
        existingPropNames$1460[propType$1464][key$1462.name].data = true;
        return delegate$845.createMethodDefinition(propType$1464, '', key$1462, parsePropertyMethodFunction$900({ generator: false }));
    }
    function parseClassElement$967(existingProps$1466) {
        if (match$891(';')) {
            lex$882();
            return;
        }
        return parseMethodDefinition$966(existingProps$1466);
    }
    function parseClassBody$968() {
        var classElement$1467, classElements$1468 = [], existingProps$1469 = {};
        existingProps$1469[ClassPropertyType$834.static] = {};
        existingProps$1469[ClassPropertyType$834.prototype] = {};
        expect$889('{');
        while (streamIndex$847 < length$844) {
            if (match$891('}')) {
                break;
            }
            classElement$1467 = parseClassElement$967(existingProps$1469);
            if (typeof classElement$1467 !== 'undefined') {
                classElements$1468.push(classElement$1467);
            }
        }
        expect$889('}');
        return delegate$845.createClassBody(classElements$1468);
    }
    function parseClassExpression$969() {
        var id$1470, previousYieldAllowed$1471, superClass$1472 = null;
        expectKeyword$890('class');
        if (!matchKeyword$892('extends') && !match$891('{')) {
            id$1470 = parseVariableIdentifier$929();
        }
        if (matchKeyword$892('extends')) {
            expectKeyword$890('extends');
            previousYieldAllowed$1471 = state$850.yieldAllowed;
            state$850.yieldAllowed = false;
            superClass$1472 = parseAssignmentExpression$925();
            state$850.yieldAllowed = previousYieldAllowed$1471;
        }
        return delegate$845.createClassExpression(id$1470, superClass$1472, parseClassBody$968());
    }
    function parseClassDeclaration$970() {
        var id$1473, previousYieldAllowed$1474, superClass$1475 = null;
        expectKeyword$890('class');
        id$1473 = parseVariableIdentifier$929();
        if (matchKeyword$892('extends')) {
            expectKeyword$890('extends');
            previousYieldAllowed$1474 = state$850.yieldAllowed;
            state$850.yieldAllowed = false;
            superClass$1475 = parseAssignmentExpression$925();
            state$850.yieldAllowed = previousYieldAllowed$1474;
        }
        return delegate$845.createClassDeclaration(id$1473, superClass$1475, parseClassBody$968());
    }
    // 15 Program
    function matchModuleDeclaration$971() {
        var id$1476;
        if (matchContextualKeyword$893('module')) {
            id$1476 = lookahead2$884();
            return id$1476.type === Token$826.StringLiteral || id$1476.type === Token$826.Identifier;
        }
        return false;
    }
    function parseSourceElement$972() {
        if (lookahead$848.type === Token$826.Keyword) {
            switch (lookahead$848.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$933(lookahead$848.value);
            case 'function':
                return parseFunctionDeclaration$963();
            case 'export':
                return parseExportDeclaration$937();
            case 'import':
                return parseImportDeclaration$938();
            default:
                return parseStatement$957();
            }
        }
        if (matchModuleDeclaration$971()) {
            throwError$886({}, Messages$831.NestedModule);
        }
        if (lookahead$848.type !== Token$826.EOF) {
            return parseStatement$957();
        }
    }
    function parseProgramElement$973() {
        if (lookahead$848.type === Token$826.Keyword) {
            switch (lookahead$848.value) {
            case 'export':
                return parseExportDeclaration$937();
            case 'import':
                return parseImportDeclaration$938();
            }
        }
        if (matchModuleDeclaration$971()) {
            return parseModuleDeclaration$934();
        }
        return parseSourceElement$972();
    }
    function parseProgramElements$974() {
        var sourceElement$1477, sourceElements$1478 = [], token$1479, directive$1480, firstRestricted$1481;
        while (streamIndex$847 < length$844) {
            token$1479 = lookahead$848;
            if (token$1479.type !== Token$826.StringLiteral) {
                break;
            }
            sourceElement$1477 = parseProgramElement$973();
            sourceElements$1478.push(sourceElement$1477);
            if (sourceElement$1477.expression.type !== Syntax$829.Literal) {
                // this is not directive
                break;
            }
            assert$852(false, 'directive isn\'t right');
            directive$1480 = source$835.slice(token$1479.range[0] + 1, token$1479.range[1] - 1);
            if (directive$1480 === 'use strict') {
                strict$836 = true;
                if (firstRestricted$1481) {
                    throwErrorTolerant$887(firstRestricted$1481, Messages$831.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1481 && token$1479.octal) {
                    firstRestricted$1481 = token$1479;
                }
            }
        }
        while (streamIndex$847 < length$844) {
            sourceElement$1477 = parseProgramElement$973();
            if (typeof sourceElement$1477 === 'undefined') {
                break;
            }
            sourceElements$1478.push(sourceElement$1477);
        }
        return sourceElements$1478;
    }
    function parseModuleElement$975() {
        return parseSourceElement$972();
    }
    function parseModuleElements$976() {
        var list$1482 = [], statement$1483;
        while (streamIndex$847 < length$844) {
            if (match$891('}')) {
                break;
            }
            statement$1483 = parseModuleElement$975();
            if (typeof statement$1483 === 'undefined') {
                break;
            }
            list$1482.push(statement$1483);
        }
        return list$1482;
    }
    function parseModuleBlock$977() {
        var block$1484;
        expect$889('{');
        block$1484 = parseModuleElements$976();
        expect$889('}');
        return delegate$845.createBlockStatement(block$1484);
    }
    function parseProgram$978() {
        var body$1485;
        strict$836 = false;
        peek$883();
        body$1485 = parseProgramElements$974();
        return delegate$845.createProgram(body$1485);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$979(type$1486, value$1487, start$1488, end$1489, loc$1490) {
        assert$852(typeof start$1488 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$851.comments.length > 0) {
            if (extra$851.comments[extra$851.comments.length - 1].range[1] > start$1488) {
                return;
            }
        }
        extra$851.comments.push({
            type: type$1486,
            value: value$1487,
            range: [
                start$1488,
                end$1489
            ],
            loc: loc$1490
        });
    }
    function scanComment$980() {
        var comment$1491, ch$1492, loc$1493, start$1494, blockComment$1495, lineComment$1496;
        comment$1491 = '';
        blockComment$1495 = false;
        lineComment$1496 = false;
        while (index$837 < length$844) {
            ch$1492 = source$835[index$837];
            if (lineComment$1496) {
                ch$1492 = source$835[index$837++];
                if (isLineTerminator$858(ch$1492.charCodeAt(0))) {
                    loc$1493.end = {
                        line: lineNumber$838,
                        column: index$837 - lineStart$839 - 1
                    };
                    lineComment$1496 = false;
                    addComment$979('Line', comment$1491, start$1494, index$837 - 1, loc$1493);
                    if (ch$1492 === '\r' && source$835[index$837] === '\n') {
                        ++index$837;
                    }
                    ++lineNumber$838;
                    lineStart$839 = index$837;
                    comment$1491 = '';
                } else if (index$837 >= length$844) {
                    lineComment$1496 = false;
                    comment$1491 += ch$1492;
                    loc$1493.end = {
                        line: lineNumber$838,
                        column: length$844 - lineStart$839
                    };
                    addComment$979('Line', comment$1491, start$1494, length$844, loc$1493);
                } else {
                    comment$1491 += ch$1492;
                }
            } else if (blockComment$1495) {
                if (isLineTerminator$858(ch$1492.charCodeAt(0))) {
                    if (ch$1492 === '\r' && source$835[index$837 + 1] === '\n') {
                        ++index$837;
                        comment$1491 += '\r\n';
                    } else {
                        comment$1491 += ch$1492;
                    }
                    ++lineNumber$838;
                    ++index$837;
                    lineStart$839 = index$837;
                    if (index$837 >= length$844) {
                        throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1492 = source$835[index$837++];
                    if (index$837 >= length$844) {
                        throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1491 += ch$1492;
                    if (ch$1492 === '*') {
                        ch$1492 = source$835[index$837];
                        if (ch$1492 === '/') {
                            comment$1491 = comment$1491.substr(0, comment$1491.length - 1);
                            blockComment$1495 = false;
                            ++index$837;
                            loc$1493.end = {
                                line: lineNumber$838,
                                column: index$837 - lineStart$839
                            };
                            addComment$979('Block', comment$1491, start$1494, index$837, loc$1493);
                            comment$1491 = '';
                        }
                    }
                }
            } else if (ch$1492 === '/') {
                ch$1492 = source$835[index$837 + 1];
                if (ch$1492 === '/') {
                    loc$1493 = {
                        start: {
                            line: lineNumber$838,
                            column: index$837 - lineStart$839
                        }
                    };
                    start$1494 = index$837;
                    index$837 += 2;
                    lineComment$1496 = true;
                    if (index$837 >= length$844) {
                        loc$1493.end = {
                            line: lineNumber$838,
                            column: index$837 - lineStart$839
                        };
                        lineComment$1496 = false;
                        addComment$979('Line', comment$1491, start$1494, index$837, loc$1493);
                    }
                } else if (ch$1492 === '*') {
                    start$1494 = index$837;
                    index$837 += 2;
                    blockComment$1495 = true;
                    loc$1493 = {
                        start: {
                            line: lineNumber$838,
                            column: index$837 - lineStart$839 - 2
                        }
                    };
                    if (index$837 >= length$844) {
                        throwError$886({}, Messages$831.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$857(ch$1492.charCodeAt(0))) {
                ++index$837;
            } else if (isLineTerminator$858(ch$1492.charCodeAt(0))) {
                ++index$837;
                if (ch$1492 === '\r' && source$835[index$837] === '\n') {
                    ++index$837;
                }
                ++lineNumber$838;
                lineStart$839 = index$837;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$981() {
        var i$1497, entry$1498, comment$1499, comments$1500 = [];
        for (i$1497 = 0; i$1497 < extra$851.comments.length; ++i$1497) {
            entry$1498 = extra$851.comments[i$1497];
            comment$1499 = {
                type: entry$1498.type,
                value: entry$1498.value
            };
            if (extra$851.range) {
                comment$1499.range = entry$1498.range;
            }
            if (extra$851.loc) {
                comment$1499.loc = entry$1498.loc;
            }
            comments$1500.push(comment$1499);
        }
        extra$851.comments = comments$1500;
    }
    function collectToken$982() {
        var start$1501, loc$1502, token$1503, range$1504, value$1505;
        skipComment$865();
        start$1501 = index$837;
        loc$1502 = {
            start: {
                line: lineNumber$838,
                column: index$837 - lineStart$839
            }
        };
        token$1503 = extra$851.advance();
        loc$1502.end = {
            line: lineNumber$838,
            column: index$837 - lineStart$839
        };
        if (token$1503.type !== Token$826.EOF) {
            range$1504 = [
                token$1503.range[0],
                token$1503.range[1]
            ];
            value$1505 = source$835.slice(token$1503.range[0], token$1503.range[1]);
            extra$851.tokens.push({
                type: TokenName$827[token$1503.type],
                value: value$1505,
                range: range$1504,
                loc: loc$1502
            });
        }
        return token$1503;
    }
    function collectRegex$983() {
        var pos$1506, loc$1507, regex$1508, token$1509;
        skipComment$865();
        pos$1506 = index$837;
        loc$1507 = {
            start: {
                line: lineNumber$838,
                column: index$837 - lineStart$839
            }
        };
        regex$1508 = extra$851.scanRegExp();
        loc$1507.end = {
            line: lineNumber$838,
            column: index$837 - lineStart$839
        };
        if (!extra$851.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$851.tokens.length > 0) {
                token$1509 = extra$851.tokens[extra$851.tokens.length - 1];
                if (token$1509.range[0] === pos$1506 && token$1509.type === 'Punctuator') {
                    if (token$1509.value === '/' || token$1509.value === '/=') {
                        extra$851.tokens.pop();
                    }
                }
            }
            extra$851.tokens.push({
                type: 'RegularExpression',
                value: regex$1508.literal,
                range: [
                    pos$1506,
                    index$837
                ],
                loc: loc$1507
            });
        }
        return regex$1508;
    }
    function filterTokenLocation$984() {
        var i$1510, entry$1511, token$1512, tokens$1513 = [];
        for (i$1510 = 0; i$1510 < extra$851.tokens.length; ++i$1510) {
            entry$1511 = extra$851.tokens[i$1510];
            token$1512 = {
                type: entry$1511.type,
                value: entry$1511.value
            };
            if (extra$851.range) {
                token$1512.range = entry$1511.range;
            }
            if (extra$851.loc) {
                token$1512.loc = entry$1511.loc;
            }
            tokens$1513.push(token$1512);
        }
        extra$851.tokens = tokens$1513;
    }
    function LocationMarker$985() {
        var sm_index$1514 = lookahead$848 ? lookahead$848.sm_range[0] : 0;
        var sm_lineStart$1515 = lookahead$848 ? lookahead$848.sm_lineStart : 0;
        var sm_lineNumber$1516 = lookahead$848 ? lookahead$848.sm_lineNumber : 1;
        this.range = [
            sm_index$1514,
            sm_index$1514
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1516,
                column: sm_index$1514 - sm_lineStart$1515
            },
            end: {
                line: sm_lineNumber$1516,
                column: sm_index$1514 - sm_lineStart$1515
            }
        };
    }
    LocationMarker$985.prototype = {
        constructor: LocationMarker$985,
        end: function () {
            this.range[1] = sm_index$843;
            this.loc.end.line = sm_lineNumber$840;
            this.loc.end.column = sm_index$843 - sm_lineStart$841;
        },
        applyGroup: function (node$1517) {
            if (extra$851.range) {
                node$1517.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$851.loc) {
                node$1517.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1517 = delegate$845.postProcess(node$1517);
            }
        },
        apply: function (node$1518) {
            var nodeType$1519 = typeof node$1518;
            assert$852(nodeType$1519 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1519);
            if (extra$851.range) {
                node$1518.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$851.loc) {
                node$1518.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1518 = delegate$845.postProcess(node$1518);
            }
        }
    };
    function createLocationMarker$986() {
        return new LocationMarker$985();
    }
    function trackGroupExpression$987() {
        var marker$1520, expr$1521;
        marker$1520 = createLocationMarker$986();
        expect$889('(');
        ++state$850.parenthesizedCount;
        expr$1521 = parseExpression$926();
        expect$889(')');
        marker$1520.end();
        marker$1520.applyGroup(expr$1521);
        return expr$1521;
    }
    function trackLeftHandSideExpression$988() {
        var marker$1522, expr$1523;
        // skipComment();
        marker$1522 = createLocationMarker$986();
        expr$1523 = matchKeyword$892('new') ? parseNewExpression$913() : parsePrimaryExpression$907();
        while (match$891('.') || match$891('[') || lookahead$848.type === Token$826.Template) {
            if (match$891('[')) {
                expr$1523 = delegate$845.createMemberExpression('[', expr$1523, parseComputedMember$912());
                marker$1522.end();
                marker$1522.apply(expr$1523);
            } else if (match$891('.')) {
                expr$1523 = delegate$845.createMemberExpression('.', expr$1523, parseNonComputedMember$911());
                marker$1522.end();
                marker$1522.apply(expr$1523);
            } else {
                expr$1523 = delegate$845.createTaggedTemplateExpression(expr$1523, parseTemplateLiteral$905());
                marker$1522.end();
                marker$1522.apply(expr$1523);
            }
        }
        return expr$1523;
    }
    function trackLeftHandSideExpressionAllowCall$989() {
        var marker$1524, expr$1525, args$1526;
        // skipComment();
        marker$1524 = createLocationMarker$986();
        expr$1525 = matchKeyword$892('new') ? parseNewExpression$913() : parsePrimaryExpression$907();
        while (match$891('.') || match$891('[') || match$891('(') || lookahead$848.type === Token$826.Template) {
            if (match$891('(')) {
                args$1526 = parseArguments$908();
                expr$1525 = delegate$845.createCallExpression(expr$1525, args$1526);
                marker$1524.end();
                marker$1524.apply(expr$1525);
            } else if (match$891('[')) {
                expr$1525 = delegate$845.createMemberExpression('[', expr$1525, parseComputedMember$912());
                marker$1524.end();
                marker$1524.apply(expr$1525);
            } else if (match$891('.')) {
                expr$1525 = delegate$845.createMemberExpression('.', expr$1525, parseNonComputedMember$911());
                marker$1524.end();
                marker$1524.apply(expr$1525);
            } else {
                expr$1525 = delegate$845.createTaggedTemplateExpression(expr$1525, parseTemplateLiteral$905());
                marker$1524.end();
                marker$1524.apply(expr$1525);
            }
        }
        return expr$1525;
    }
    function filterGroup$990(node$1527) {
        var n$1528, i$1529, entry$1530;
        n$1528 = Object.prototype.toString.apply(node$1527) === '[object Array]' ? [] : {};
        for (i$1529 in node$1527) {
            if (node$1527.hasOwnProperty(i$1529) && i$1529 !== 'groupRange' && i$1529 !== 'groupLoc') {
                entry$1530 = node$1527[i$1529];
                if (entry$1530 === null || typeof entry$1530 !== 'object' || entry$1530 instanceof RegExp) {
                    n$1528[i$1529] = entry$1530;
                } else {
                    n$1528[i$1529] = filterGroup$990(entry$1530);
                }
            }
        }
        return n$1528;
    }
    function wrapTrackingFunction$991(range$1531, loc$1532) {
        return function (parseFunction$1533) {
            function isBinary$1534(node$1536) {
                return node$1536.type === Syntax$829.LogicalExpression || node$1536.type === Syntax$829.BinaryExpression;
            }
            function visit$1535(node$1537) {
                var start$1538, end$1539;
                if (isBinary$1534(node$1537.left)) {
                    visit$1535(node$1537.left);
                }
                if (isBinary$1534(node$1537.right)) {
                    visit$1535(node$1537.right);
                }
                if (range$1531) {
                    if (node$1537.left.groupRange || node$1537.right.groupRange) {
                        start$1538 = node$1537.left.groupRange ? node$1537.left.groupRange[0] : node$1537.left.range[0];
                        end$1539 = node$1537.right.groupRange ? node$1537.right.groupRange[1] : node$1537.right.range[1];
                        node$1537.range = [
                            start$1538,
                            end$1539
                        ];
                    } else if (typeof node$1537.range === 'undefined') {
                        start$1538 = node$1537.left.range[0];
                        end$1539 = node$1537.right.range[1];
                        node$1537.range = [
                            start$1538,
                            end$1539
                        ];
                    }
                }
                if (loc$1532) {
                    if (node$1537.left.groupLoc || node$1537.right.groupLoc) {
                        start$1538 = node$1537.left.groupLoc ? node$1537.left.groupLoc.start : node$1537.left.loc.start;
                        end$1539 = node$1537.right.groupLoc ? node$1537.right.groupLoc.end : node$1537.right.loc.end;
                        node$1537.loc = {
                            start: start$1538,
                            end: end$1539
                        };
                        node$1537 = delegate$845.postProcess(node$1537);
                    } else if (typeof node$1537.loc === 'undefined') {
                        node$1537.loc = {
                            start: node$1537.left.loc.start,
                            end: node$1537.right.loc.end
                        };
                        node$1537 = delegate$845.postProcess(node$1537);
                    }
                }
            }
            return function () {
                var marker$1540, node$1541, curr$1542 = lookahead$848;
                marker$1540 = createLocationMarker$986();
                node$1541 = parseFunction$1533.apply(null, arguments);
                marker$1540.end();
                if (node$1541.type !== Syntax$829.Program) {
                    if (curr$1542.leadingComments) {
                        node$1541.leadingComments = curr$1542.leadingComments;
                    }
                    if (curr$1542.trailingComments) {
                        node$1541.trailingComments = curr$1542.trailingComments;
                    }
                }
                if (range$1531 && typeof node$1541.range === 'undefined') {
                    marker$1540.apply(node$1541);
                }
                if (loc$1532 && typeof node$1541.loc === 'undefined') {
                    marker$1540.apply(node$1541);
                }
                if (isBinary$1534(node$1541)) {
                    visit$1535(node$1541);
                }
                return node$1541;
            };
        };
    }
    function patch$992() {
        var wrapTracking$1543;
        if (extra$851.comments) {
            extra$851.skipComment = skipComment$865;
            skipComment$865 = scanComment$980;
        }
        if (extra$851.range || extra$851.loc) {
            extra$851.parseGroupExpression = parseGroupExpression$906;
            extra$851.parseLeftHandSideExpression = parseLeftHandSideExpression$915;
            extra$851.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$914;
            parseGroupExpression$906 = trackGroupExpression$987;
            parseLeftHandSideExpression$915 = trackLeftHandSideExpression$988;
            parseLeftHandSideExpressionAllowCall$914 = trackLeftHandSideExpressionAllowCall$989;
            wrapTracking$1543 = wrapTrackingFunction$991(extra$851.range, extra$851.loc);
            extra$851.parseArrayInitialiser = parseArrayInitialiser$898;
            extra$851.parseAssignmentExpression = parseAssignmentExpression$925;
            extra$851.parseBinaryExpression = parseBinaryExpression$919;
            extra$851.parseBlock = parseBlock$928;
            extra$851.parseFunctionSourceElements = parseFunctionSourceElements$959;
            extra$851.parseCatchClause = parseCatchClause$954;
            extra$851.parseComputedMember = parseComputedMember$912;
            extra$851.parseConditionalExpression = parseConditionalExpression$920;
            extra$851.parseConstLetDeclaration = parseConstLetDeclaration$933;
            extra$851.parseExportBatchSpecifier = parseExportBatchSpecifier$935;
            extra$851.parseExportDeclaration = parseExportDeclaration$937;
            extra$851.parseExportSpecifier = parseExportSpecifier$936;
            extra$851.parseExpression = parseExpression$926;
            extra$851.parseForVariableDeclaration = parseForVariableDeclaration$945;
            extra$851.parseFunctionDeclaration = parseFunctionDeclaration$963;
            extra$851.parseFunctionExpression = parseFunctionExpression$964;
            extra$851.parseParams = parseParams$962;
            extra$851.parseImportDeclaration = parseImportDeclaration$938;
            extra$851.parseImportSpecifier = parseImportSpecifier$939;
            extra$851.parseModuleDeclaration = parseModuleDeclaration$934;
            extra$851.parseModuleBlock = parseModuleBlock$977;
            extra$851.parseNewExpression = parseNewExpression$913;
            extra$851.parseNonComputedProperty = parseNonComputedProperty$910;
            extra$851.parseObjectInitialiser = parseObjectInitialiser$903;
            extra$851.parseObjectProperty = parseObjectProperty$902;
            extra$851.parseObjectPropertyKey = parseObjectPropertyKey$901;
            extra$851.parsePostfixExpression = parsePostfixExpression$916;
            extra$851.parsePrimaryExpression = parsePrimaryExpression$907;
            extra$851.parseProgram = parseProgram$978;
            extra$851.parsePropertyFunction = parsePropertyFunction$899;
            extra$851.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$909;
            extra$851.parseTemplateElement = parseTemplateElement$904;
            extra$851.parseTemplateLiteral = parseTemplateLiteral$905;
            extra$851.parseStatement = parseStatement$957;
            extra$851.parseSwitchCase = parseSwitchCase$951;
            extra$851.parseUnaryExpression = parseUnaryExpression$917;
            extra$851.parseVariableDeclaration = parseVariableDeclaration$930;
            extra$851.parseVariableIdentifier = parseVariableIdentifier$929;
            extra$851.parseMethodDefinition = parseMethodDefinition$966;
            extra$851.parseClassDeclaration = parseClassDeclaration$970;
            extra$851.parseClassExpression = parseClassExpression$969;
            extra$851.parseClassBody = parseClassBody$968;
            parseArrayInitialiser$898 = wrapTracking$1543(extra$851.parseArrayInitialiser);
            parseAssignmentExpression$925 = wrapTracking$1543(extra$851.parseAssignmentExpression);
            parseBinaryExpression$919 = wrapTracking$1543(extra$851.parseBinaryExpression);
            parseBlock$928 = wrapTracking$1543(extra$851.parseBlock);
            parseFunctionSourceElements$959 = wrapTracking$1543(extra$851.parseFunctionSourceElements);
            parseCatchClause$954 = wrapTracking$1543(extra$851.parseCatchClause);
            parseComputedMember$912 = wrapTracking$1543(extra$851.parseComputedMember);
            parseConditionalExpression$920 = wrapTracking$1543(extra$851.parseConditionalExpression);
            parseConstLetDeclaration$933 = wrapTracking$1543(extra$851.parseConstLetDeclaration);
            parseExportBatchSpecifier$935 = wrapTracking$1543(parseExportBatchSpecifier$935);
            parseExportDeclaration$937 = wrapTracking$1543(parseExportDeclaration$937);
            parseExportSpecifier$936 = wrapTracking$1543(parseExportSpecifier$936);
            parseExpression$926 = wrapTracking$1543(extra$851.parseExpression);
            parseForVariableDeclaration$945 = wrapTracking$1543(extra$851.parseForVariableDeclaration);
            parseFunctionDeclaration$963 = wrapTracking$1543(extra$851.parseFunctionDeclaration);
            parseFunctionExpression$964 = wrapTracking$1543(extra$851.parseFunctionExpression);
            parseParams$962 = wrapTracking$1543(extra$851.parseParams);
            parseImportDeclaration$938 = wrapTracking$1543(extra$851.parseImportDeclaration);
            parseImportSpecifier$939 = wrapTracking$1543(extra$851.parseImportSpecifier);
            parseModuleDeclaration$934 = wrapTracking$1543(extra$851.parseModuleDeclaration);
            parseModuleBlock$977 = wrapTracking$1543(extra$851.parseModuleBlock);
            parseLeftHandSideExpression$915 = wrapTracking$1543(parseLeftHandSideExpression$915);
            parseNewExpression$913 = wrapTracking$1543(extra$851.parseNewExpression);
            parseNonComputedProperty$910 = wrapTracking$1543(extra$851.parseNonComputedProperty);
            parseObjectInitialiser$903 = wrapTracking$1543(extra$851.parseObjectInitialiser);
            parseObjectProperty$902 = wrapTracking$1543(extra$851.parseObjectProperty);
            parseObjectPropertyKey$901 = wrapTracking$1543(extra$851.parseObjectPropertyKey);
            parsePostfixExpression$916 = wrapTracking$1543(extra$851.parsePostfixExpression);
            parsePrimaryExpression$907 = wrapTracking$1543(extra$851.parsePrimaryExpression);
            parseProgram$978 = wrapTracking$1543(extra$851.parseProgram);
            parsePropertyFunction$899 = wrapTracking$1543(extra$851.parsePropertyFunction);
            parseTemplateElement$904 = wrapTracking$1543(extra$851.parseTemplateElement);
            parseTemplateLiteral$905 = wrapTracking$1543(extra$851.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$909 = wrapTracking$1543(extra$851.parseSpreadOrAssignmentExpression);
            parseStatement$957 = wrapTracking$1543(extra$851.parseStatement);
            parseSwitchCase$951 = wrapTracking$1543(extra$851.parseSwitchCase);
            parseUnaryExpression$917 = wrapTracking$1543(extra$851.parseUnaryExpression);
            parseVariableDeclaration$930 = wrapTracking$1543(extra$851.parseVariableDeclaration);
            parseVariableIdentifier$929 = wrapTracking$1543(extra$851.parseVariableIdentifier);
            parseMethodDefinition$966 = wrapTracking$1543(extra$851.parseMethodDefinition);
            parseClassDeclaration$970 = wrapTracking$1543(extra$851.parseClassDeclaration);
            parseClassExpression$969 = wrapTracking$1543(extra$851.parseClassExpression);
            parseClassBody$968 = wrapTracking$1543(extra$851.parseClassBody);
        }
        if (typeof extra$851.tokens !== 'undefined') {
            extra$851.advance = advance$881;
            extra$851.scanRegExp = scanRegExp$878;
            advance$881 = collectToken$982;
            scanRegExp$878 = collectRegex$983;
        }
    }
    function unpatch$993() {
        if (typeof extra$851.skipComment === 'function') {
            skipComment$865 = extra$851.skipComment;
        }
        if (extra$851.range || extra$851.loc) {
            parseArrayInitialiser$898 = extra$851.parseArrayInitialiser;
            parseAssignmentExpression$925 = extra$851.parseAssignmentExpression;
            parseBinaryExpression$919 = extra$851.parseBinaryExpression;
            parseBlock$928 = extra$851.parseBlock;
            parseFunctionSourceElements$959 = extra$851.parseFunctionSourceElements;
            parseCatchClause$954 = extra$851.parseCatchClause;
            parseComputedMember$912 = extra$851.parseComputedMember;
            parseConditionalExpression$920 = extra$851.parseConditionalExpression;
            parseConstLetDeclaration$933 = extra$851.parseConstLetDeclaration;
            parseExportBatchSpecifier$935 = extra$851.parseExportBatchSpecifier;
            parseExportDeclaration$937 = extra$851.parseExportDeclaration;
            parseExportSpecifier$936 = extra$851.parseExportSpecifier;
            parseExpression$926 = extra$851.parseExpression;
            parseForVariableDeclaration$945 = extra$851.parseForVariableDeclaration;
            parseFunctionDeclaration$963 = extra$851.parseFunctionDeclaration;
            parseFunctionExpression$964 = extra$851.parseFunctionExpression;
            parseImportDeclaration$938 = extra$851.parseImportDeclaration;
            parseImportSpecifier$939 = extra$851.parseImportSpecifier;
            parseGroupExpression$906 = extra$851.parseGroupExpression;
            parseLeftHandSideExpression$915 = extra$851.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$914 = extra$851.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$934 = extra$851.parseModuleDeclaration;
            parseModuleBlock$977 = extra$851.parseModuleBlock;
            parseNewExpression$913 = extra$851.parseNewExpression;
            parseNonComputedProperty$910 = extra$851.parseNonComputedProperty;
            parseObjectInitialiser$903 = extra$851.parseObjectInitialiser;
            parseObjectProperty$902 = extra$851.parseObjectProperty;
            parseObjectPropertyKey$901 = extra$851.parseObjectPropertyKey;
            parsePostfixExpression$916 = extra$851.parsePostfixExpression;
            parsePrimaryExpression$907 = extra$851.parsePrimaryExpression;
            parseProgram$978 = extra$851.parseProgram;
            parsePropertyFunction$899 = extra$851.parsePropertyFunction;
            parseTemplateElement$904 = extra$851.parseTemplateElement;
            parseTemplateLiteral$905 = extra$851.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$909 = extra$851.parseSpreadOrAssignmentExpression;
            parseStatement$957 = extra$851.parseStatement;
            parseSwitchCase$951 = extra$851.parseSwitchCase;
            parseUnaryExpression$917 = extra$851.parseUnaryExpression;
            parseVariableDeclaration$930 = extra$851.parseVariableDeclaration;
            parseVariableIdentifier$929 = extra$851.parseVariableIdentifier;
            parseMethodDefinition$966 = extra$851.parseMethodDefinition;
            parseClassDeclaration$970 = extra$851.parseClassDeclaration;
            parseClassExpression$969 = extra$851.parseClassExpression;
            parseClassBody$968 = extra$851.parseClassBody;
        }
        if (typeof extra$851.scanRegExp === 'function') {
            advance$881 = extra$851.advance;
            scanRegExp$878 = extra$851.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$994(object$1544, properties$1545) {
        var entry$1546, result$1547 = {};
        for (entry$1546 in object$1544) {
            if (object$1544.hasOwnProperty(entry$1546)) {
                result$1547[entry$1546] = object$1544[entry$1546];
            }
        }
        for (entry$1546 in properties$1545) {
            if (properties$1545.hasOwnProperty(entry$1546)) {
                result$1547[entry$1546] = properties$1545[entry$1546];
            }
        }
        return result$1547;
    }
    function tokenize$995(code$1548, options$1549) {
        var toString$1550, token$1551, tokens$1552;
        toString$1550 = String;
        if (typeof code$1548 !== 'string' && !(code$1548 instanceof String)) {
            code$1548 = toString$1550(code$1548);
        }
        delegate$845 = SyntaxTreeDelegate$833;
        source$835 = code$1548;
        index$837 = 0;
        lineNumber$838 = source$835.length > 0 ? 1 : 0;
        lineStart$839 = 0;
        length$844 = source$835.length;
        lookahead$848 = null;
        state$850 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$851 = {};
        // Options matching.
        options$1549 = options$1549 || {};
        // Of course we collect tokens here.
        options$1549.tokens = true;
        extra$851.tokens = [];
        extra$851.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$851.openParenToken = -1;
        extra$851.openCurlyToken = -1;
        extra$851.range = typeof options$1549.range === 'boolean' && options$1549.range;
        extra$851.loc = typeof options$1549.loc === 'boolean' && options$1549.loc;
        if (typeof options$1549.comment === 'boolean' && options$1549.comment) {
            extra$851.comments = [];
        }
        if (typeof options$1549.tolerant === 'boolean' && options$1549.tolerant) {
            extra$851.errors = [];
        }
        if (length$844 > 0) {
            if (typeof source$835[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1548 instanceof String) {
                    source$835 = code$1548.valueOf();
                }
            }
        }
        patch$992();
        try {
            peek$883();
            if (lookahead$848.type === Token$826.EOF) {
                return extra$851.tokens;
            }
            token$1551 = lex$882();
            while (lookahead$848.type !== Token$826.EOF) {
                try {
                    token$1551 = lex$882();
                } catch (lexError$1553) {
                    token$1551 = lookahead$848;
                    if (extra$851.errors) {
                        extra$851.errors.push(lexError$1553);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1553;
                    }
                }
            }
            filterTokenLocation$984();
            tokens$1552 = extra$851.tokens;
            if (typeof extra$851.comments !== 'undefined') {
                filterCommentLocation$981();
                tokens$1552.comments = extra$851.comments;
            }
            if (typeof extra$851.errors !== 'undefined') {
                tokens$1552.errors = extra$851.errors;
            }
        } catch (e$1554) {
            throw e$1554;
        } finally {
            unpatch$993();
            extra$851 = {};
        }
        return tokens$1552;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$996(toks$1555, start$1556, inExprDelim$1557, parentIsBlock$1558) {
        var assignOps$1559 = [
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
        var binaryOps$1560 = [
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
        var unaryOps$1561 = [
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
        function back$1562(n$1563) {
            var idx$1564 = toks$1555.length - n$1563 > 0 ? toks$1555.length - n$1563 : 0;
            return toks$1555[idx$1564];
        }
        if (inExprDelim$1557 && toks$1555.length - (start$1556 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1562(start$1556 + 2).value === ':' && parentIsBlock$1558) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$853(back$1562(start$1556 + 2).value, unaryOps$1561.concat(binaryOps$1560).concat(assignOps$1559))) {
            // ... + {...}
            return false;
        } else if (back$1562(start$1556 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1565 = typeof back$1562(start$1556 + 1).startLineNumber !== 'undefined' ? back$1562(start$1556 + 1).startLineNumber : back$1562(start$1556 + 1).lineNumber;
            if (back$1562(start$1556 + 2).lineNumber !== currLineNumber$1565) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$853(back$1562(start$1556 + 2).value, [
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
    function readToken$997(toks$1566, inExprDelim$1567, parentIsBlock$1568) {
        var delimiters$1569 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1570 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1571 = toks$1566.length - 1;
        var comments$1572, commentsLen$1573 = extra$851.comments.length;
        function back$1574(n$1578) {
            var idx$1579 = toks$1566.length - n$1578 > 0 ? toks$1566.length - n$1578 : 0;
            return toks$1566[idx$1579];
        }
        function attachComments$1575(token$1580) {
            if (comments$1572) {
                token$1580.leadingComments = comments$1572;
            }
            return token$1580;
        }
        function _advance$1576() {
            return attachComments$1575(advance$881());
        }
        function _scanRegExp$1577() {
            return attachComments$1575(scanRegExp$878());
        }
        skipComment$865();
        if (extra$851.comments.length > commentsLen$1573) {
            comments$1572 = extra$851.comments.slice(commentsLen$1573);
        }
        if (isIn$853(source$835[index$837], delimiters$1569)) {
            return attachComments$1575(readDelim$998(toks$1566, inExprDelim$1567, parentIsBlock$1568));
        }
        if (source$835[index$837] === '/') {
            var prev$1581 = back$1574(1);
            if (prev$1581) {
                if (prev$1581.value === '()') {
                    if (isIn$853(back$1574(2).value, parenIdents$1570)) {
                        // ... if (...) / ...
                        return _scanRegExp$1577();
                    }
                    // ... (...) / ...
                    return _advance$1576();
                }
                if (prev$1581.value === '{}') {
                    if (blockAllowed$996(toks$1566, 0, inExprDelim$1567, parentIsBlock$1568)) {
                        if (back$1574(2).value === '()') {
                            // named function
                            if (back$1574(4).value === 'function') {
                                if (!blockAllowed$996(toks$1566, 3, inExprDelim$1567, parentIsBlock$1568)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1576();
                                }
                                if (toks$1566.length - 5 <= 0 && inExprDelim$1567) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1576();
                                }
                            }
                            // unnamed function
                            if (back$1574(3).value === 'function') {
                                if (!blockAllowed$996(toks$1566, 2, inExprDelim$1567, parentIsBlock$1568)) {
                                    // new function (...) {...} / ...
                                    return _advance$1576();
                                }
                                if (toks$1566.length - 4 <= 0 && inExprDelim$1567) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1576();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1577();
                    } else {
                        // ... + {...} / ...
                        return _advance$1576();
                    }
                }
                if (prev$1581.type === Token$826.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1577();
                }
                if (isKeyword$864(prev$1581.value)) {
                    // typeof /...
                    return _scanRegExp$1577();
                }
                return _advance$1576();
            }
            return _scanRegExp$1577();
        }
        return _advance$1576();
    }
    function readDelim$998(toks$1582, inExprDelim$1583, parentIsBlock$1584) {
        var startDelim$1585 = advance$881(), matchDelim$1586 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1587 = [];
        var delimiters$1588 = [
                '(',
                '{',
                '['
            ];
        assert$852(delimiters$1588.indexOf(startDelim$1585.value) !== -1, 'Need to begin at the delimiter');
        var token$1589 = startDelim$1585;
        var startLineNumber$1590 = token$1589.lineNumber;
        var startLineStart$1591 = token$1589.lineStart;
        var startRange$1592 = token$1589.range;
        var delimToken$1593 = {};
        delimToken$1593.type = Token$826.Delimiter;
        delimToken$1593.value = startDelim$1585.value + matchDelim$1586[startDelim$1585.value];
        delimToken$1593.startLineNumber = startLineNumber$1590;
        delimToken$1593.startLineStart = startLineStart$1591;
        delimToken$1593.startRange = startRange$1592;
        var delimIsBlock$1594 = false;
        if (startDelim$1585.value === '{') {
            delimIsBlock$1594 = blockAllowed$996(toks$1582.concat(delimToken$1593), 0, inExprDelim$1583, parentIsBlock$1584);
        }
        while (index$837 <= length$844) {
            token$1589 = readToken$997(inner$1587, startDelim$1585.value === '(' || startDelim$1585.value === '[', delimIsBlock$1594);
            if (token$1589.type === Token$826.Punctuator && token$1589.value === matchDelim$1586[startDelim$1585.value]) {
                if (token$1589.leadingComments) {
                    delimToken$1593.trailingComments = token$1589.leadingComments;
                }
                break;
            } else if (token$1589.type === Token$826.EOF) {
                throwError$886({}, Messages$831.UnexpectedEOS);
            } else {
                inner$1587.push(token$1589);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$837 >= length$844 && matchDelim$1586[startDelim$1585.value] !== source$835[length$844 - 1]) {
            throwError$886({}, Messages$831.UnexpectedEOS);
        }
        var endLineNumber$1595 = token$1589.lineNumber;
        var endLineStart$1596 = token$1589.lineStart;
        var endRange$1597 = token$1589.range;
        delimToken$1593.inner = inner$1587;
        delimToken$1593.endLineNumber = endLineNumber$1595;
        delimToken$1593.endLineStart = endLineStart$1596;
        delimToken$1593.endRange = endRange$1597;
        return delimToken$1593;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$999(code$1598) {
        var token$1599, tokenTree$1600 = [];
        extra$851 = {};
        extra$851.comments = [];
        patch$992();
        source$835 = code$1598;
        index$837 = 0;
        lineNumber$838 = source$835.length > 0 ? 1 : 0;
        lineStart$839 = 0;
        length$844 = source$835.length;
        state$850 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$837 < length$844) {
            tokenTree$1600.push(readToken$997(tokenTree$1600, false, false));
        }
        var last$1601 = tokenTree$1600[tokenTree$1600.length - 1];
        if (last$1601 && last$1601.type !== Token$826.EOF) {
            tokenTree$1600.push({
                type: Token$826.EOF,
                value: '',
                lineNumber: last$1601.lineNumber,
                lineStart: last$1601.lineStart,
                range: [
                    index$837,
                    index$837
                ]
            });
        }
        return expander$825.tokensToSyntax(tokenTree$1600);
    }
    function parse$1000(code$1602, options$1603) {
        var program$1604, toString$1605;
        extra$851 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1602)) {
            tokenStream$846 = code$1602;
            length$844 = tokenStream$846.length;
            lineNumber$838 = tokenStream$846.length > 0 ? 1 : 0;
            source$835 = undefined;
        } else {
            toString$1605 = String;
            if (typeof code$1602 !== 'string' && !(code$1602 instanceof String)) {
                code$1602 = toString$1605(code$1602);
            }
            source$835 = code$1602;
            length$844 = source$835.length;
            lineNumber$838 = source$835.length > 0 ? 1 : 0;
        }
        delegate$845 = SyntaxTreeDelegate$833;
        streamIndex$847 = -1;
        index$837 = 0;
        lineStart$839 = 0;
        sm_lineStart$841 = 0;
        sm_lineNumber$840 = lineNumber$838;
        sm_index$843 = 0;
        sm_range$842 = [
            0,
            0
        ];
        lookahead$848 = null;
        state$850 = {
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
        if (typeof options$1603 !== 'undefined') {
            extra$851.range = typeof options$1603.range === 'boolean' && options$1603.range;
            extra$851.loc = typeof options$1603.loc === 'boolean' && options$1603.loc;
            if (extra$851.loc && options$1603.source !== null && options$1603.source !== undefined) {
                delegate$845 = extend$994(delegate$845, {
                    'postProcess': function (node$1606) {
                        node$1606.loc.source = toString$1605(options$1603.source);
                        return node$1606;
                    }
                });
            }
            if (typeof options$1603.tokens === 'boolean' && options$1603.tokens) {
                extra$851.tokens = [];
            }
            if (typeof options$1603.comment === 'boolean' && options$1603.comment) {
                extra$851.comments = [];
            }
            if (typeof options$1603.tolerant === 'boolean' && options$1603.tolerant) {
                extra$851.errors = [];
            }
        }
        if (length$844 > 0) {
            if (source$835 && typeof source$835[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1602 instanceof String) {
                    source$835 = code$1602.valueOf();
                }
            }
        }
        extra$851 = { loc: true };
        patch$992();
        try {
            program$1604 = parseProgram$978();
            if (typeof extra$851.comments !== 'undefined') {
                filterCommentLocation$981();
                program$1604.comments = extra$851.comments;
            }
            if (typeof extra$851.tokens !== 'undefined') {
                filterTokenLocation$984();
                program$1604.tokens = extra$851.tokens;
            }
            if (typeof extra$851.errors !== 'undefined') {
                program$1604.errors = extra$851.errors;
            }
            if (extra$851.range || extra$851.loc) {
                program$1604.body = filterGroup$990(program$1604.body);
            }
        } catch (e$1607) {
            throw e$1607;
        } finally {
            unpatch$993();
            extra$851 = {};
        }
        return program$1604;
    }
    exports$824.tokenize = tokenize$995;
    exports$824.read = read$999;
    exports$824.Token = Token$826;
    exports$824.assert = assert$852;
    exports$824.parse = parse$1000;
    // Deep copy.
    exports$824.Syntax = function () {
        var name$1608, types$1609 = {};
        if (typeof Object.create === 'function') {
            types$1609 = Object.create(null);
        }
        for (name$1608 in Syntax$829) {
            if (Syntax$829.hasOwnProperty(name$1608)) {
                types$1609[name$1608] = Syntax$829[name$1608];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1609);
        }
        return types$1609;
    }();
}));
//# sourceMappingURL=parser.js.map