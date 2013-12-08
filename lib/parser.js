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
(function (root$817, factory$818) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$818);
    } else if (typeof exports !== 'undefined') {
        factory$818(exports, require('./expander'));
    } else {
        factory$818(root$817.esprima = {});
    }
}(this, function (exports$819, expander$820) {
    'use strict';
    var Token$821, TokenName$822, FnExprTokens$823, Syntax$824, PropertyKind$825, Messages$826, Regex$827, SyntaxTreeDelegate$828, ClassPropertyType$829, source$830, strict$831, index$832, lineNumber$833, lineStart$834, sm_lineNumber$835, sm_lineStart$836, sm_range$837, sm_index$838, length$839, delegate$840, tokenStream$841, streamIndex$842, lookahead$843, lookaheadIndex$844, state$845, extra$846;
    Token$821 = {
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
    TokenName$822 = {};
    TokenName$822[Token$821.BooleanLiteral] = 'Boolean';
    TokenName$822[Token$821.EOF] = '<end>';
    TokenName$822[Token$821.Identifier] = 'Identifier';
    TokenName$822[Token$821.Keyword] = 'Keyword';
    TokenName$822[Token$821.NullLiteral] = 'Null';
    TokenName$822[Token$821.NumericLiteral] = 'Numeric';
    TokenName$822[Token$821.Punctuator] = 'Punctuator';
    TokenName$822[Token$821.StringLiteral] = 'String';
    TokenName$822[Token$821.RegularExpression] = 'RegularExpression';
    TokenName$822[Token$821.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$823 = [
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
    Syntax$824 = {
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
    PropertyKind$825 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$829 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$826 = {
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
    Regex$827 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$847(condition$996, message$997) {
        if (!condition$996) {
            throw new Error('ASSERT: ' + message$997);
        }
    }
    function isIn$848(el$998, list$999) {
        return list$999.indexOf(el$998) !== -1;
    }
    function isDecimalDigit$849(ch$1000) {
        return ch$1000 >= 48 && ch$1000 <= 57;
    }    // 0..9
    function isHexDigit$850(ch$1001) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1001) >= 0;
    }
    function isOctalDigit$851(ch$1002) {
        return '01234567'.indexOf(ch$1002) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$852(ch$1003) {
        return ch$1003 === 32 || ch$1003 === 9 || ch$1003 === 11 || ch$1003 === 12 || ch$1003 === 160 || ch$1003 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1003)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$853(ch$1004) {
        return ch$1004 === 10 || ch$1004 === 13 || ch$1004 === 8232 || ch$1004 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$854(ch$1005) {
        return ch$1005 === 36 || ch$1005 === 95 || ch$1005 >= 65 && ch$1005 <= 90 || ch$1005 >= 97 && ch$1005 <= 122 || ch$1005 === 92 || ch$1005 >= 128 && Regex$827.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1005));
    }
    function isIdentifierPart$855(ch$1006) {
        return ch$1006 === 36 || ch$1006 === 95 || ch$1006 >= 65 && ch$1006 <= 90 || ch$1006 >= 97 && ch$1006 <= 122 || ch$1006 >= 48 && ch$1006 <= 57 || ch$1006 === 92 || ch$1006 >= 128 && Regex$827.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1006));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$856(id$1007) {
        switch (id$1007) {
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
    function isStrictModeReservedWord$857(id$1008) {
        switch (id$1008) {
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
    function isRestrictedWord$858(id$1009) {
        return id$1009 === 'eval' || id$1009 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$859(id$1010) {
        if (strict$831 && isStrictModeReservedWord$857(id$1010)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1010.length) {
        case 2:
            return id$1010 === 'if' || id$1010 === 'in' || id$1010 === 'do';
        case 3:
            return id$1010 === 'var' || id$1010 === 'for' || id$1010 === 'new' || id$1010 === 'try' || id$1010 === 'let';
        case 4:
            return id$1010 === 'this' || id$1010 === 'else' || id$1010 === 'case' || id$1010 === 'void' || id$1010 === 'with' || id$1010 === 'enum';
        case 5:
            return id$1010 === 'while' || id$1010 === 'break' || id$1010 === 'catch' || id$1010 === 'throw' || id$1010 === 'const' || id$1010 === 'yield' || id$1010 === 'class' || id$1010 === 'super';
        case 6:
            return id$1010 === 'return' || id$1010 === 'typeof' || id$1010 === 'delete' || id$1010 === 'switch' || id$1010 === 'export' || id$1010 === 'import';
        case 7:
            return id$1010 === 'default' || id$1010 === 'finally' || id$1010 === 'extends';
        case 8:
            return id$1010 === 'function' || id$1010 === 'continue' || id$1010 === 'debugger';
        case 10:
            return id$1010 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$860() {
        var ch$1011, blockComment$1012, lineComment$1013;
        blockComment$1012 = false;
        lineComment$1013 = false;
        while (index$832 < length$839) {
            ch$1011 = source$830.charCodeAt(index$832);
            if (lineComment$1013) {
                ++index$832;
                if (isLineTerminator$853(ch$1011)) {
                    lineComment$1013 = false;
                    if (ch$1011 === 13 && source$830.charCodeAt(index$832) === 10) {
                        ++index$832;
                    }
                    ++lineNumber$833;
                    lineStart$834 = index$832;
                }
            } else if (blockComment$1012) {
                if (isLineTerminator$853(ch$1011)) {
                    if (ch$1011 === 13 && source$830.charCodeAt(index$832 + 1) === 10) {
                        ++index$832;
                    }
                    ++lineNumber$833;
                    ++index$832;
                    lineStart$834 = index$832;
                    if (index$832 >= length$839) {
                        throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1011 = source$830.charCodeAt(index$832++);
                    if (index$832 >= length$839) {
                        throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1011 === 42) {
                        ch$1011 = source$830.charCodeAt(index$832);
                        if (ch$1011 === 47) {
                            ++index$832;
                            blockComment$1012 = false;
                        }
                    }
                }
            } else if (ch$1011 === 47) {
                ch$1011 = source$830.charCodeAt(index$832 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1011 === 47) {
                    index$832 += 2;
                    lineComment$1013 = true;
                } else if (ch$1011 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$832 += 2;
                    blockComment$1012 = true;
                    if (index$832 >= length$839) {
                        throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$852(ch$1011)) {
                ++index$832;
            } else if (isLineTerminator$853(ch$1011)) {
                ++index$832;
                if (ch$1011 === 13 && source$830.charCodeAt(index$832) === 10) {
                    ++index$832;
                }
                ++lineNumber$833;
                lineStart$834 = index$832;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$861(prefix$1014) {
        var i$1015, len$1016, ch$1017, code$1018 = 0;
        len$1016 = prefix$1014 === 'u' ? 4 : 2;
        for (i$1015 = 0; i$1015 < len$1016; ++i$1015) {
            if (index$832 < length$839 && isHexDigit$850(source$830[index$832])) {
                ch$1017 = source$830[index$832++];
                code$1018 = code$1018 * 16 + '0123456789abcdef'.indexOf(ch$1017.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1018);
    }
    function scanUnicodeCodePointEscape$862() {
        var ch$1019, code$1020, cu1$1021, cu2$1022;
        ch$1019 = source$830[index$832];
        code$1020 = 0;
        // At least, one hex digit is required.
        if (ch$1019 === '}') {
            throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
        }
        while (index$832 < length$839) {
            ch$1019 = source$830[index$832++];
            if (!isHexDigit$850(ch$1019)) {
                break;
            }
            code$1020 = code$1020 * 16 + '0123456789abcdef'.indexOf(ch$1019.toLowerCase());
        }
        if (code$1020 > 1114111 || ch$1019 !== '}') {
            throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1020 <= 65535) {
            return String.fromCharCode(code$1020);
        }
        cu1$1021 = (code$1020 - 65536 >> 10) + 55296;
        cu2$1022 = (code$1020 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1021, cu2$1022);
    }
    function getEscapedIdentifier$863() {
        var ch$1023, id$1024;
        ch$1023 = source$830.charCodeAt(index$832++);
        id$1024 = String.fromCharCode(ch$1023);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1023 === 92) {
            if (source$830.charCodeAt(index$832) !== 117) {
                throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
            }
            ++index$832;
            ch$1023 = scanHexEscape$861('u');
            if (!ch$1023 || ch$1023 === '\\' || !isIdentifierStart$854(ch$1023.charCodeAt(0))) {
                throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
            }
            id$1024 = ch$1023;
        }
        while (index$832 < length$839) {
            ch$1023 = source$830.charCodeAt(index$832);
            if (!isIdentifierPart$855(ch$1023)) {
                break;
            }
            ++index$832;
            id$1024 += String.fromCharCode(ch$1023);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1023 === 92) {
                id$1024 = id$1024.substr(0, id$1024.length - 1);
                if (source$830.charCodeAt(index$832) !== 117) {
                    throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
                }
                ++index$832;
                ch$1023 = scanHexEscape$861('u');
                if (!ch$1023 || ch$1023 === '\\' || !isIdentifierPart$855(ch$1023.charCodeAt(0))) {
                    throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
                }
                id$1024 += ch$1023;
            }
        }
        return id$1024;
    }
    function getIdentifier$864() {
        var start$1025, ch$1026;
        start$1025 = index$832++;
        while (index$832 < length$839) {
            ch$1026 = source$830.charCodeAt(index$832);
            if (ch$1026 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$832 = start$1025;
                return getEscapedIdentifier$863();
            }
            if (isIdentifierPart$855(ch$1026)) {
                ++index$832;
            } else {
                break;
            }
        }
        return source$830.slice(start$1025, index$832);
    }
    function scanIdentifier$865() {
        var start$1027, id$1028, type$1029;
        start$1027 = index$832;
        // Backslash (char #92) starts an escaped character.
        id$1028 = source$830.charCodeAt(index$832) === 92 ? getEscapedIdentifier$863() : getIdentifier$864();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1028.length === 1) {
            type$1029 = Token$821.Identifier;
        } else if (isKeyword$859(id$1028)) {
            type$1029 = Token$821.Keyword;
        } else if (id$1028 === 'null') {
            type$1029 = Token$821.NullLiteral;
        } else if (id$1028 === 'true' || id$1028 === 'false') {
            type$1029 = Token$821.BooleanLiteral;
        } else {
            type$1029 = Token$821.Identifier;
        }
        return {
            type: type$1029,
            value: id$1028,
            lineNumber: lineNumber$833,
            lineStart: lineStart$834,
            range: [
                start$1027,
                index$832
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$866() {
        var start$1030 = index$832, code$1031 = source$830.charCodeAt(index$832), code2$1032, ch1$1033 = source$830[index$832], ch2$1034, ch3$1035, ch4$1036;
        switch (code$1031) {
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
            ++index$832;
            if (extra$846.tokenize) {
                if (code$1031 === 40) {
                    extra$846.openParenToken = extra$846.tokens.length;
                } else if (code$1031 === 123) {
                    extra$846.openCurlyToken = extra$846.tokens.length;
                }
            }
            return {
                type: Token$821.Punctuator,
                value: String.fromCharCode(code$1031),
                lineNumber: lineNumber$833,
                lineStart: lineStart$834,
                range: [
                    start$1030,
                    index$832
                ]
            };
        default:
            code2$1032 = source$830.charCodeAt(index$832 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1032 === 61) {
                switch (code$1031) {
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
                    index$832 += 2;
                    return {
                        type: Token$821.Punctuator,
                        value: String.fromCharCode(code$1031) + String.fromCharCode(code2$1032),
                        lineNumber: lineNumber$833,
                        lineStart: lineStart$834,
                        range: [
                            start$1030,
                            index$832
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$832 += 2;
                    // !== and ===
                    if (source$830.charCodeAt(index$832) === 61) {
                        ++index$832;
                    }
                    return {
                        type: Token$821.Punctuator,
                        value: source$830.slice(start$1030, index$832),
                        lineNumber: lineNumber$833,
                        lineStart: lineStart$834,
                        range: [
                            start$1030,
                            index$832
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1034 = source$830[index$832 + 1];
        ch3$1035 = source$830[index$832 + 2];
        ch4$1036 = source$830[index$832 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1033 === '>' && ch2$1034 === '>' && ch3$1035 === '>') {
            if (ch4$1036 === '=') {
                index$832 += 4;
                return {
                    type: Token$821.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$833,
                    lineStart: lineStart$834,
                    range: [
                        start$1030,
                        index$832
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1033 === '>' && ch2$1034 === '>' && ch3$1035 === '>') {
            index$832 += 3;
            return {
                type: Token$821.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$833,
                lineStart: lineStart$834,
                range: [
                    start$1030,
                    index$832
                ]
            };
        }
        if (ch1$1033 === '<' && ch2$1034 === '<' && ch3$1035 === '=') {
            index$832 += 3;
            return {
                type: Token$821.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$833,
                lineStart: lineStart$834,
                range: [
                    start$1030,
                    index$832
                ]
            };
        }
        if (ch1$1033 === '>' && ch2$1034 === '>' && ch3$1035 === '=') {
            index$832 += 3;
            return {
                type: Token$821.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$833,
                lineStart: lineStart$834,
                range: [
                    start$1030,
                    index$832
                ]
            };
        }
        if (ch1$1033 === '.' && ch2$1034 === '.' && ch3$1035 === '.') {
            index$832 += 3;
            return {
                type: Token$821.Punctuator,
                value: '...',
                lineNumber: lineNumber$833,
                lineStart: lineStart$834,
                range: [
                    start$1030,
                    index$832
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1033 === ch2$1034 && '+-<>&|'.indexOf(ch1$1033) >= 0) {
            index$832 += 2;
            return {
                type: Token$821.Punctuator,
                value: ch1$1033 + ch2$1034,
                lineNumber: lineNumber$833,
                lineStart: lineStart$834,
                range: [
                    start$1030,
                    index$832
                ]
            };
        }
        if (ch1$1033 === '=' && ch2$1034 === '>') {
            index$832 += 2;
            return {
                type: Token$821.Punctuator,
                value: '=>',
                lineNumber: lineNumber$833,
                lineStart: lineStart$834,
                range: [
                    start$1030,
                    index$832
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1033) >= 0) {
            ++index$832;
            return {
                type: Token$821.Punctuator,
                value: ch1$1033,
                lineNumber: lineNumber$833,
                lineStart: lineStart$834,
                range: [
                    start$1030,
                    index$832
                ]
            };
        }
        if (ch1$1033 === '.') {
            ++index$832;
            return {
                type: Token$821.Punctuator,
                value: ch1$1033,
                lineNumber: lineNumber$833,
                lineStart: lineStart$834,
                range: [
                    start$1030,
                    index$832
                ]
            };
        }
        throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$867(start$1037) {
        var number$1038 = '';
        while (index$832 < length$839) {
            if (!isHexDigit$850(source$830[index$832])) {
                break;
            }
            number$1038 += source$830[index$832++];
        }
        if (number$1038.length === 0) {
            throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$854(source$830.charCodeAt(index$832))) {
            throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$821.NumericLiteral,
            value: parseInt('0x' + number$1038, 16),
            lineNumber: lineNumber$833,
            lineStart: lineStart$834,
            range: [
                start$1037,
                index$832
            ]
        };
    }
    function scanOctalLiteral$868(prefix$1039, start$1040) {
        var number$1041, octal$1042;
        if (isOctalDigit$851(prefix$1039)) {
            octal$1042 = true;
            number$1041 = '0' + source$830[index$832++];
        } else {
            octal$1042 = false;
            ++index$832;
            number$1041 = '';
        }
        while (index$832 < length$839) {
            if (!isOctalDigit$851(source$830[index$832])) {
                break;
            }
            number$1041 += source$830[index$832++];
        }
        if (!octal$1042 && number$1041.length === 0) {
            // only 0o or 0O
            throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$854(source$830.charCodeAt(index$832)) || isDecimalDigit$849(source$830.charCodeAt(index$832))) {
            throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$821.NumericLiteral,
            value: parseInt(number$1041, 8),
            octal: octal$1042,
            lineNumber: lineNumber$833,
            lineStart: lineStart$834,
            range: [
                start$1040,
                index$832
            ]
        };
    }
    function scanNumericLiteral$869() {
        var number$1043, start$1044, ch$1045, octal$1046;
        ch$1045 = source$830[index$832];
        assert$847(isDecimalDigit$849(ch$1045.charCodeAt(0)) || ch$1045 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1044 = index$832;
        number$1043 = '';
        if (ch$1045 !== '.') {
            number$1043 = source$830[index$832++];
            ch$1045 = source$830[index$832];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1043 === '0') {
                if (ch$1045 === 'x' || ch$1045 === 'X') {
                    ++index$832;
                    return scanHexLiteral$867(start$1044);
                }
                if (ch$1045 === 'b' || ch$1045 === 'B') {
                    ++index$832;
                    number$1043 = '';
                    while (index$832 < length$839) {
                        ch$1045 = source$830[index$832];
                        if (ch$1045 !== '0' && ch$1045 !== '1') {
                            break;
                        }
                        number$1043 += source$830[index$832++];
                    }
                    if (number$1043.length === 0) {
                        // only 0b or 0B
                        throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$832 < length$839) {
                        ch$1045 = source$830.charCodeAt(index$832);
                        if (isIdentifierStart$854(ch$1045) || isDecimalDigit$849(ch$1045)) {
                            throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$821.NumericLiteral,
                        value: parseInt(number$1043, 2),
                        lineNumber: lineNumber$833,
                        lineStart: lineStart$834,
                        range: [
                            start$1044,
                            index$832
                        ]
                    };
                }
                if (ch$1045 === 'o' || ch$1045 === 'O' || isOctalDigit$851(ch$1045)) {
                    return scanOctalLiteral$868(ch$1045, start$1044);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1045 && isDecimalDigit$849(ch$1045.charCodeAt(0))) {
                    throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$849(source$830.charCodeAt(index$832))) {
                number$1043 += source$830[index$832++];
            }
            ch$1045 = source$830[index$832];
        }
        if (ch$1045 === '.') {
            number$1043 += source$830[index$832++];
            while (isDecimalDigit$849(source$830.charCodeAt(index$832))) {
                number$1043 += source$830[index$832++];
            }
            ch$1045 = source$830[index$832];
        }
        if (ch$1045 === 'e' || ch$1045 === 'E') {
            number$1043 += source$830[index$832++];
            ch$1045 = source$830[index$832];
            if (ch$1045 === '+' || ch$1045 === '-') {
                number$1043 += source$830[index$832++];
            }
            if (isDecimalDigit$849(source$830.charCodeAt(index$832))) {
                while (isDecimalDigit$849(source$830.charCodeAt(index$832))) {
                    number$1043 += source$830[index$832++];
                }
            } else {
                throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$854(source$830.charCodeAt(index$832))) {
            throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$821.NumericLiteral,
            value: parseFloat(number$1043),
            lineNumber: lineNumber$833,
            lineStart: lineStart$834,
            range: [
                start$1044,
                index$832
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$870() {
        var str$1047 = '', quote$1048, start$1049, ch$1050, code$1051, unescaped$1052, restore$1053, octal$1054 = false;
        quote$1048 = source$830[index$832];
        assert$847(quote$1048 === '\'' || quote$1048 === '"', 'String literal must starts with a quote');
        start$1049 = index$832;
        ++index$832;
        while (index$832 < length$839) {
            ch$1050 = source$830[index$832++];
            if (ch$1050 === quote$1048) {
                quote$1048 = '';
                break;
            } else if (ch$1050 === '\\') {
                ch$1050 = source$830[index$832++];
                if (!ch$1050 || !isLineTerminator$853(ch$1050.charCodeAt(0))) {
                    switch (ch$1050) {
                    case 'n':
                        str$1047 += '\n';
                        break;
                    case 'r':
                        str$1047 += '\r';
                        break;
                    case 't':
                        str$1047 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$830[index$832] === '{') {
                            ++index$832;
                            str$1047 += scanUnicodeCodePointEscape$862();
                        } else {
                            restore$1053 = index$832;
                            unescaped$1052 = scanHexEscape$861(ch$1050);
                            if (unescaped$1052) {
                                str$1047 += unescaped$1052;
                            } else {
                                index$832 = restore$1053;
                                str$1047 += ch$1050;
                            }
                        }
                        break;
                    case 'b':
                        str$1047 += '\b';
                        break;
                    case 'f':
                        str$1047 += '\f';
                        break;
                    case 'v':
                        str$1047 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$851(ch$1050)) {
                            code$1051 = '01234567'.indexOf(ch$1050);
                            // \0 is not octal escape sequence
                            if (code$1051 !== 0) {
                                octal$1054 = true;
                            }
                            if (index$832 < length$839 && isOctalDigit$851(source$830[index$832])) {
                                octal$1054 = true;
                                code$1051 = code$1051 * 8 + '01234567'.indexOf(source$830[index$832++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1050) >= 0 && index$832 < length$839 && isOctalDigit$851(source$830[index$832])) {
                                    code$1051 = code$1051 * 8 + '01234567'.indexOf(source$830[index$832++]);
                                }
                            }
                            str$1047 += String.fromCharCode(code$1051);
                        } else {
                            str$1047 += ch$1050;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$833;
                    if (ch$1050 === '\r' && source$830[index$832] === '\n') {
                        ++index$832;
                    }
                }
            } else if (isLineTerminator$853(ch$1050.charCodeAt(0))) {
                break;
            } else {
                str$1047 += ch$1050;
            }
        }
        if (quote$1048 !== '') {
            throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$821.StringLiteral,
            value: str$1047,
            octal: octal$1054,
            lineNumber: lineNumber$833,
            lineStart: lineStart$834,
            range: [
                start$1049,
                index$832
            ]
        };
    }
    function scanTemplate$871() {
        var cooked$1055 = '', ch$1056, start$1057, terminated$1058, tail$1059, restore$1060, unescaped$1061, code$1062, octal$1063;
        terminated$1058 = false;
        tail$1059 = false;
        start$1057 = index$832;
        ++index$832;
        while (index$832 < length$839) {
            ch$1056 = source$830[index$832++];
            if (ch$1056 === '`') {
                tail$1059 = true;
                terminated$1058 = true;
                break;
            } else if (ch$1056 === '$') {
                if (source$830[index$832] === '{') {
                    ++index$832;
                    terminated$1058 = true;
                    break;
                }
                cooked$1055 += ch$1056;
            } else if (ch$1056 === '\\') {
                ch$1056 = source$830[index$832++];
                if (!isLineTerminator$853(ch$1056.charCodeAt(0))) {
                    switch (ch$1056) {
                    case 'n':
                        cooked$1055 += '\n';
                        break;
                    case 'r':
                        cooked$1055 += '\r';
                        break;
                    case 't':
                        cooked$1055 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$830[index$832] === '{') {
                            ++index$832;
                            cooked$1055 += scanUnicodeCodePointEscape$862();
                        } else {
                            restore$1060 = index$832;
                            unescaped$1061 = scanHexEscape$861(ch$1056);
                            if (unescaped$1061) {
                                cooked$1055 += unescaped$1061;
                            } else {
                                index$832 = restore$1060;
                                cooked$1055 += ch$1056;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1055 += '\b';
                        break;
                    case 'f':
                        cooked$1055 += '\f';
                        break;
                    case 'v':
                        cooked$1055 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$851(ch$1056)) {
                            code$1062 = '01234567'.indexOf(ch$1056);
                            // \0 is not octal escape sequence
                            if (code$1062 !== 0) {
                                octal$1063 = true;
                            }
                            if (index$832 < length$839 && isOctalDigit$851(source$830[index$832])) {
                                octal$1063 = true;
                                code$1062 = code$1062 * 8 + '01234567'.indexOf(source$830[index$832++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1056) >= 0 && index$832 < length$839 && isOctalDigit$851(source$830[index$832])) {
                                    code$1062 = code$1062 * 8 + '01234567'.indexOf(source$830[index$832++]);
                                }
                            }
                            cooked$1055 += String.fromCharCode(code$1062);
                        } else {
                            cooked$1055 += ch$1056;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$833;
                    if (ch$1056 === '\r' && source$830[index$832] === '\n') {
                        ++index$832;
                    }
                }
            } else if (isLineTerminator$853(ch$1056.charCodeAt(0))) {
                ++lineNumber$833;
                if (ch$1056 === '\r' && source$830[index$832] === '\n') {
                    ++index$832;
                }
                cooked$1055 += '\n';
            } else {
                cooked$1055 += ch$1056;
            }
        }
        if (!terminated$1058) {
            throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$821.Template,
            value: {
                cooked: cooked$1055,
                raw: source$830.slice(start$1057 + 1, index$832 - (tail$1059 ? 1 : 2))
            },
            tail: tail$1059,
            octal: octal$1063,
            lineNumber: lineNumber$833,
            lineStart: lineStart$834,
            range: [
                start$1057,
                index$832
            ]
        };
    }
    function scanTemplateElement$872(option$1064) {
        var startsWith$1065, template$1066;
        lookahead$843 = null;
        skipComment$860();
        startsWith$1065 = option$1064.head ? '`' : '}';
        if (source$830[index$832] !== startsWith$1065) {
            throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
        }
        template$1066 = scanTemplate$871();
        peek$878();
        return template$1066;
    }
    function scanRegExp$873() {
        var str$1067, ch$1068, start$1069, pattern$1070, flags$1071, value$1072, classMarker$1073 = false, restore$1074, terminated$1075 = false;
        lookahead$843 = null;
        skipComment$860();
        start$1069 = index$832;
        ch$1068 = source$830[index$832];
        assert$847(ch$1068 === '/', 'Regular expression literal must start with a slash');
        str$1067 = source$830[index$832++];
        while (index$832 < length$839) {
            ch$1068 = source$830[index$832++];
            str$1067 += ch$1068;
            if (classMarker$1073) {
                if (ch$1068 === ']') {
                    classMarker$1073 = false;
                }
            } else {
                if (ch$1068 === '\\') {
                    ch$1068 = source$830[index$832++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$853(ch$1068.charCodeAt(0))) {
                        throwError$881({}, Messages$826.UnterminatedRegExp);
                    }
                    str$1067 += ch$1068;
                } else if (ch$1068 === '/') {
                    terminated$1075 = true;
                    break;
                } else if (ch$1068 === '[') {
                    classMarker$1073 = true;
                } else if (isLineTerminator$853(ch$1068.charCodeAt(0))) {
                    throwError$881({}, Messages$826.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1075) {
            throwError$881({}, Messages$826.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1070 = str$1067.substr(1, str$1067.length - 2);
        flags$1071 = '';
        while (index$832 < length$839) {
            ch$1068 = source$830[index$832];
            if (!isIdentifierPart$855(ch$1068.charCodeAt(0))) {
                break;
            }
            ++index$832;
            if (ch$1068 === '\\' && index$832 < length$839) {
                ch$1068 = source$830[index$832];
                if (ch$1068 === 'u') {
                    ++index$832;
                    restore$1074 = index$832;
                    ch$1068 = scanHexEscape$861('u');
                    if (ch$1068) {
                        flags$1071 += ch$1068;
                        for (str$1067 += '\\u'; restore$1074 < index$832; ++restore$1074) {
                            str$1067 += source$830[restore$1074];
                        }
                    } else {
                        index$832 = restore$1074;
                        flags$1071 += 'u';
                        str$1067 += '\\u';
                    }
                } else {
                    str$1067 += '\\';
                }
            } else {
                flags$1071 += ch$1068;
                str$1067 += ch$1068;
            }
        }
        try {
            value$1072 = new RegExp(pattern$1070, flags$1071);
        } catch (e$1076) {
            throwError$881({}, Messages$826.InvalidRegExp);
        }
        // peek();
        if (extra$846.tokenize) {
            return {
                type: Token$821.RegularExpression,
                value: value$1072,
                lineNumber: lineNumber$833,
                lineStart: lineStart$834,
                range: [
                    start$1069,
                    index$832
                ]
            };
        }
        return {
            type: Token$821.RegularExpression,
            literal: str$1067,
            value: value$1072,
            range: [
                start$1069,
                index$832
            ]
        };
    }
    function isIdentifierName$874(token$1077) {
        return token$1077.type === Token$821.Identifier || token$1077.type === Token$821.Keyword || token$1077.type === Token$821.BooleanLiteral || token$1077.type === Token$821.NullLiteral;
    }
    function advanceSlash$875() {
        var prevToken$1078, checkToken$1079;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1078 = extra$846.tokens[extra$846.tokens.length - 1];
        if (!prevToken$1078) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$873();
        }
        if (prevToken$1078.type === 'Punctuator') {
            if (prevToken$1078.value === ')') {
                checkToken$1079 = extra$846.tokens[extra$846.openParenToken - 1];
                if (checkToken$1079 && checkToken$1079.type === 'Keyword' && (checkToken$1079.value === 'if' || checkToken$1079.value === 'while' || checkToken$1079.value === 'for' || checkToken$1079.value === 'with')) {
                    return scanRegExp$873();
                }
                return scanPunctuator$866();
            }
            if (prevToken$1078.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$846.tokens[extra$846.openCurlyToken - 3] && extra$846.tokens[extra$846.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1079 = extra$846.tokens[extra$846.openCurlyToken - 4];
                    if (!checkToken$1079) {
                        return scanPunctuator$866();
                    }
                } else if (extra$846.tokens[extra$846.openCurlyToken - 4] && extra$846.tokens[extra$846.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1079 = extra$846.tokens[extra$846.openCurlyToken - 5];
                    if (!checkToken$1079) {
                        return scanRegExp$873();
                    }
                } else {
                    return scanPunctuator$866();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$823.indexOf(checkToken$1079.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$866();
                }
                // It is a declaration.
                return scanRegExp$873();
            }
            return scanRegExp$873();
        }
        if (prevToken$1078.type === 'Keyword') {
            return scanRegExp$873();
        }
        return scanPunctuator$866();
    }
    function advance$876() {
        var ch$1080;
        skipComment$860();
        if (index$832 >= length$839) {
            return {
                type: Token$821.EOF,
                lineNumber: lineNumber$833,
                lineStart: lineStart$834,
                range: [
                    index$832,
                    index$832
                ]
            };
        }
        ch$1080 = source$830.charCodeAt(index$832);
        // Very common: ( and ) and ;
        if (ch$1080 === 40 || ch$1080 === 41 || ch$1080 === 58) {
            return scanPunctuator$866();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1080 === 39 || ch$1080 === 34) {
            return scanStringLiteral$870();
        }
        if (ch$1080 === 96) {
            return scanTemplate$871();
        }
        if (isIdentifierStart$854(ch$1080)) {
            return scanIdentifier$865();
        }
        // # and @ are allowed for sweet.js
        if (ch$1080 === 35 || ch$1080 === 64) {
            ++index$832;
            return {
                type: Token$821.Punctuator,
                value: String.fromCharCode(ch$1080),
                lineNumber: lineNumber$833,
                lineStart: lineStart$834,
                range: [
                    index$832 - 1,
                    index$832
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1080 === 46) {
            if (isDecimalDigit$849(source$830.charCodeAt(index$832 + 1))) {
                return scanNumericLiteral$869();
            }
            return scanPunctuator$866();
        }
        if (isDecimalDigit$849(ch$1080)) {
            return scanNumericLiteral$869();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$846.tokenize && ch$1080 === 47) {
            return advanceSlash$875();
        }
        return scanPunctuator$866();
    }
    function lex$877() {
        var token$1081;
        token$1081 = lookahead$843;
        streamIndex$842 = lookaheadIndex$844;
        lineNumber$833 = token$1081.lineNumber;
        lineStart$834 = token$1081.lineStart;
        sm_lineNumber$835 = lookahead$843.sm_lineNumber;
        sm_lineStart$836 = lookahead$843.sm_lineStart;
        sm_range$837 = lookahead$843.sm_range;
        sm_index$838 = lookahead$843.sm_range[0];
        lookahead$843 = tokenStream$841[++streamIndex$842].token;
        lookaheadIndex$844 = streamIndex$842;
        index$832 = lookahead$843.range[0];
        return token$1081;
    }
    function peek$878() {
        lookaheadIndex$844 = streamIndex$842 + 1;
        if (lookaheadIndex$844 >= length$839) {
            lookahead$843 = {
                type: Token$821.EOF,
                lineNumber: lineNumber$833,
                lineStart: lineStart$834,
                range: [
                    index$832,
                    index$832
                ]
            };
            return;
        }
        lookahead$843 = tokenStream$841[lookaheadIndex$844].token;
        index$832 = lookahead$843.range[0];
    }
    function lookahead2$879() {
        var adv$1082, pos$1083, line$1084, start$1085, result$1086;
        if (streamIndex$842 + 1 >= length$839 || streamIndex$842 + 2 >= length$839) {
            return {
                type: Token$821.EOF,
                lineNumber: lineNumber$833,
                lineStart: lineStart$834,
                range: [
                    index$832,
                    index$832
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$843 === null) {
            lookaheadIndex$844 = streamIndex$842 + 1;
            lookahead$843 = tokenStream$841[lookaheadIndex$844].token;
            index$832 = lookahead$843.range[0];
        }
        result$1086 = tokenStream$841[lookaheadIndex$844 + 1].token;
        return result$1086;
    }
    SyntaxTreeDelegate$828 = {
        name: 'SyntaxTree',
        postProcess: function (node$1087) {
            return node$1087;
        },
        createArrayExpression: function (elements$1088) {
            return {
                type: Syntax$824.ArrayExpression,
                elements: elements$1088
            };
        },
        createAssignmentExpression: function (operator$1089, left$1090, right$1091) {
            return {
                type: Syntax$824.AssignmentExpression,
                operator: operator$1089,
                left: left$1090,
                right: right$1091
            };
        },
        createBinaryExpression: function (operator$1092, left$1093, right$1094) {
            var type$1095 = operator$1092 === '||' || operator$1092 === '&&' ? Syntax$824.LogicalExpression : Syntax$824.BinaryExpression;
            return {
                type: type$1095,
                operator: operator$1092,
                left: left$1093,
                right: right$1094
            };
        },
        createBlockStatement: function (body$1096) {
            return {
                type: Syntax$824.BlockStatement,
                body: body$1096
            };
        },
        createBreakStatement: function (label$1097) {
            return {
                type: Syntax$824.BreakStatement,
                label: label$1097
            };
        },
        createCallExpression: function (callee$1098, args$1099) {
            return {
                type: Syntax$824.CallExpression,
                callee: callee$1098,
                'arguments': args$1099
            };
        },
        createCatchClause: function (param$1100, body$1101) {
            return {
                type: Syntax$824.CatchClause,
                param: param$1100,
                body: body$1101
            };
        },
        createConditionalExpression: function (test$1102, consequent$1103, alternate$1104) {
            return {
                type: Syntax$824.ConditionalExpression,
                test: test$1102,
                consequent: consequent$1103,
                alternate: alternate$1104
            };
        },
        createContinueStatement: function (label$1105) {
            return {
                type: Syntax$824.ContinueStatement,
                label: label$1105
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$824.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1106, test$1107) {
            return {
                type: Syntax$824.DoWhileStatement,
                body: body$1106,
                test: test$1107
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$824.EmptyStatement };
        },
        createExpressionStatement: function (expression$1108) {
            return {
                type: Syntax$824.ExpressionStatement,
                expression: expression$1108
            };
        },
        createForStatement: function (init$1109, test$1110, update$1111, body$1112) {
            return {
                type: Syntax$824.ForStatement,
                init: init$1109,
                test: test$1110,
                update: update$1111,
                body: body$1112
            };
        },
        createForInStatement: function (left$1113, right$1114, body$1115) {
            return {
                type: Syntax$824.ForInStatement,
                left: left$1113,
                right: right$1114,
                body: body$1115,
                each: false
            };
        },
        createForOfStatement: function (left$1116, right$1117, body$1118) {
            return {
                type: Syntax$824.ForOfStatement,
                left: left$1116,
                right: right$1117,
                body: body$1118
            };
        },
        createFunctionDeclaration: function (id$1119, params$1120, defaults$1121, body$1122, rest$1123, generator$1124, expression$1125) {
            return {
                type: Syntax$824.FunctionDeclaration,
                id: id$1119,
                params: params$1120,
                defaults: defaults$1121,
                body: body$1122,
                rest: rest$1123,
                generator: generator$1124,
                expression: expression$1125
            };
        },
        createFunctionExpression: function (id$1126, params$1127, defaults$1128, body$1129, rest$1130, generator$1131, expression$1132) {
            return {
                type: Syntax$824.FunctionExpression,
                id: id$1126,
                params: params$1127,
                defaults: defaults$1128,
                body: body$1129,
                rest: rest$1130,
                generator: generator$1131,
                expression: expression$1132
            };
        },
        createIdentifier: function (name$1133) {
            return {
                type: Syntax$824.Identifier,
                name: name$1133
            };
        },
        createIfStatement: function (test$1134, consequent$1135, alternate$1136) {
            return {
                type: Syntax$824.IfStatement,
                test: test$1134,
                consequent: consequent$1135,
                alternate: alternate$1136
            };
        },
        createLabeledStatement: function (label$1137, body$1138) {
            return {
                type: Syntax$824.LabeledStatement,
                label: label$1137,
                body: body$1138
            };
        },
        createLiteral: function (token$1139) {
            return {
                type: Syntax$824.Literal,
                value: token$1139.value,
                raw: String(token$1139.value)
            };
        },
        createMemberExpression: function (accessor$1140, object$1141, property$1142) {
            return {
                type: Syntax$824.MemberExpression,
                computed: accessor$1140 === '[',
                object: object$1141,
                property: property$1142
            };
        },
        createNewExpression: function (callee$1143, args$1144) {
            return {
                type: Syntax$824.NewExpression,
                callee: callee$1143,
                'arguments': args$1144
            };
        },
        createObjectExpression: function (properties$1145) {
            return {
                type: Syntax$824.ObjectExpression,
                properties: properties$1145
            };
        },
        createPostfixExpression: function (operator$1146, argument$1147) {
            return {
                type: Syntax$824.UpdateExpression,
                operator: operator$1146,
                argument: argument$1147,
                prefix: false
            };
        },
        createProgram: function (body$1148) {
            return {
                type: Syntax$824.Program,
                body: body$1148
            };
        },
        createProperty: function (kind$1149, key$1150, value$1151, method$1152, shorthand$1153) {
            return {
                type: Syntax$824.Property,
                key: key$1150,
                value: value$1151,
                kind: kind$1149,
                method: method$1152,
                shorthand: shorthand$1153
            };
        },
        createReturnStatement: function (argument$1154) {
            return {
                type: Syntax$824.ReturnStatement,
                argument: argument$1154
            };
        },
        createSequenceExpression: function (expressions$1155) {
            return {
                type: Syntax$824.SequenceExpression,
                expressions: expressions$1155
            };
        },
        createSwitchCase: function (test$1156, consequent$1157) {
            return {
                type: Syntax$824.SwitchCase,
                test: test$1156,
                consequent: consequent$1157
            };
        },
        createSwitchStatement: function (discriminant$1158, cases$1159) {
            return {
                type: Syntax$824.SwitchStatement,
                discriminant: discriminant$1158,
                cases: cases$1159
            };
        },
        createThisExpression: function () {
            return { type: Syntax$824.ThisExpression };
        },
        createThrowStatement: function (argument$1160) {
            return {
                type: Syntax$824.ThrowStatement,
                argument: argument$1160
            };
        },
        createTryStatement: function (block$1161, guardedHandlers$1162, handlers$1163, finalizer$1164) {
            return {
                type: Syntax$824.TryStatement,
                block: block$1161,
                guardedHandlers: guardedHandlers$1162,
                handlers: handlers$1163,
                finalizer: finalizer$1164
            };
        },
        createUnaryExpression: function (operator$1165, argument$1166) {
            if (operator$1165 === '++' || operator$1165 === '--') {
                return {
                    type: Syntax$824.UpdateExpression,
                    operator: operator$1165,
                    argument: argument$1166,
                    prefix: true
                };
            }
            return {
                type: Syntax$824.UnaryExpression,
                operator: operator$1165,
                argument: argument$1166
            };
        },
        createVariableDeclaration: function (declarations$1167, kind$1168) {
            return {
                type: Syntax$824.VariableDeclaration,
                declarations: declarations$1167,
                kind: kind$1168
            };
        },
        createVariableDeclarator: function (id$1169, init$1170) {
            return {
                type: Syntax$824.VariableDeclarator,
                id: id$1169,
                init: init$1170
            };
        },
        createWhileStatement: function (test$1171, body$1172) {
            return {
                type: Syntax$824.WhileStatement,
                test: test$1171,
                body: body$1172
            };
        },
        createWithStatement: function (object$1173, body$1174) {
            return {
                type: Syntax$824.WithStatement,
                object: object$1173,
                body: body$1174
            };
        },
        createTemplateElement: function (value$1175, tail$1176) {
            return {
                type: Syntax$824.TemplateElement,
                value: value$1175,
                tail: tail$1176
            };
        },
        createTemplateLiteral: function (quasis$1177, expressions$1178) {
            return {
                type: Syntax$824.TemplateLiteral,
                quasis: quasis$1177,
                expressions: expressions$1178
            };
        },
        createSpreadElement: function (argument$1179) {
            return {
                type: Syntax$824.SpreadElement,
                argument: argument$1179
            };
        },
        createTaggedTemplateExpression: function (tag$1180, quasi$1181) {
            return {
                type: Syntax$824.TaggedTemplateExpression,
                tag: tag$1180,
                quasi: quasi$1181
            };
        },
        createArrowFunctionExpression: function (params$1182, defaults$1183, body$1184, rest$1185, expression$1186) {
            return {
                type: Syntax$824.ArrowFunctionExpression,
                id: null,
                params: params$1182,
                defaults: defaults$1183,
                body: body$1184,
                rest: rest$1185,
                generator: false,
                expression: expression$1186
            };
        },
        createMethodDefinition: function (propertyType$1187, kind$1188, key$1189, value$1190) {
            return {
                type: Syntax$824.MethodDefinition,
                key: key$1189,
                value: value$1190,
                kind: kind$1188,
                'static': propertyType$1187 === ClassPropertyType$829.static
            };
        },
        createClassBody: function (body$1191) {
            return {
                type: Syntax$824.ClassBody,
                body: body$1191
            };
        },
        createClassExpression: function (id$1192, superClass$1193, body$1194) {
            return {
                type: Syntax$824.ClassExpression,
                id: id$1192,
                superClass: superClass$1193,
                body: body$1194
            };
        },
        createClassDeclaration: function (id$1195, superClass$1196, body$1197) {
            return {
                type: Syntax$824.ClassDeclaration,
                id: id$1195,
                superClass: superClass$1196,
                body: body$1197
            };
        },
        createExportSpecifier: function (id$1198, name$1199) {
            return {
                type: Syntax$824.ExportSpecifier,
                id: id$1198,
                name: name$1199
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$824.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1200, specifiers$1201, source$1202) {
            return {
                type: Syntax$824.ExportDeclaration,
                declaration: declaration$1200,
                specifiers: specifiers$1201,
                source: source$1202
            };
        },
        createImportSpecifier: function (id$1203, name$1204) {
            return {
                type: Syntax$824.ImportSpecifier,
                id: id$1203,
                name: name$1204
            };
        },
        createImportDeclaration: function (specifiers$1205, kind$1206, source$1207) {
            return {
                type: Syntax$824.ImportDeclaration,
                specifiers: specifiers$1205,
                kind: kind$1206,
                source: source$1207
            };
        },
        createYieldExpression: function (argument$1208, delegate$1209) {
            return {
                type: Syntax$824.YieldExpression,
                argument: argument$1208,
                delegate: delegate$1209
            };
        },
        createModuleDeclaration: function (id$1210, source$1211, body$1212) {
            return {
                type: Syntax$824.ModuleDeclaration,
                id: id$1210,
                source: source$1211,
                body: body$1212
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$880() {
        return lookahead$843.lineNumber !== lineNumber$833;
    }
    // Throw an exception
    function throwError$881(token$1213, messageFormat$1214) {
        var error$1215, args$1216 = Array.prototype.slice.call(arguments, 2), msg$1217 = messageFormat$1214.replace(/%(\d)/g, function (whole$1218, index$1219) {
                assert$847(index$1219 < args$1216.length, 'Message reference must be in range');
                return args$1216[index$1219];
            });
        if (typeof token$1213.lineNumber === 'number') {
            error$1215 = new Error('Line ' + token$1213.lineNumber + ': ' + msg$1217);
            error$1215.index = token$1213.range[0];
            error$1215.lineNumber = token$1213.lineNumber;
            error$1215.column = token$1213.range[0] - lineStart$834 + 1;
        } else {
            error$1215 = new Error('Line ' + lineNumber$833 + ': ' + msg$1217);
            error$1215.index = index$832;
            error$1215.lineNumber = lineNumber$833;
            error$1215.column = index$832 - lineStart$834 + 1;
        }
        error$1215.description = msg$1217;
        throw error$1215;
    }
    function throwErrorTolerant$882() {
        try {
            throwError$881.apply(null, arguments);
        } catch (e$1220) {
            if (extra$846.errors) {
                extra$846.errors.push(e$1220);
            } else {
                throw e$1220;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$883(token$1221) {
        if (token$1221.type === Token$821.EOF) {
            throwError$881(token$1221, Messages$826.UnexpectedEOS);
        }
        if (token$1221.type === Token$821.NumericLiteral) {
            throwError$881(token$1221, Messages$826.UnexpectedNumber);
        }
        if (token$1221.type === Token$821.StringLiteral) {
            throwError$881(token$1221, Messages$826.UnexpectedString);
        }
        if (token$1221.type === Token$821.Identifier) {
            throwError$881(token$1221, Messages$826.UnexpectedIdentifier);
        }
        if (token$1221.type === Token$821.Keyword) {
            if (isFutureReservedWord$856(token$1221.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$831 && isStrictModeReservedWord$857(token$1221.value)) {
                throwErrorTolerant$882(token$1221, Messages$826.StrictReservedWord);
                return;
            }
            throwError$881(token$1221, Messages$826.UnexpectedToken, token$1221.value);
        }
        if (token$1221.type === Token$821.Template) {
            throwError$881(token$1221, Messages$826.UnexpectedTemplate, token$1221.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$881(token$1221, Messages$826.UnexpectedToken, token$1221.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$884(value$1222) {
        var token$1223 = lex$877();
        if (token$1223.type !== Token$821.Punctuator || token$1223.value !== value$1222) {
            throwUnexpected$883(token$1223);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$885(keyword$1224) {
        var token$1225 = lex$877();
        if (token$1225.type !== Token$821.Keyword || token$1225.value !== keyword$1224) {
            throwUnexpected$883(token$1225);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$886(value$1226) {
        return lookahead$843.type === Token$821.Punctuator && lookahead$843.value === value$1226;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$887(keyword$1227) {
        return lookahead$843.type === Token$821.Keyword && lookahead$843.value === keyword$1227;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$888(keyword$1228) {
        return lookahead$843.type === Token$821.Identifier && lookahead$843.value === keyword$1228;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$889() {
        var op$1229;
        if (lookahead$843.type !== Token$821.Punctuator) {
            return false;
        }
        op$1229 = lookahead$843.value;
        return op$1229 === '=' || op$1229 === '*=' || op$1229 === '/=' || op$1229 === '%=' || op$1229 === '+=' || op$1229 === '-=' || op$1229 === '<<=' || op$1229 === '>>=' || op$1229 === '>>>=' || op$1229 === '&=' || op$1229 === '^=' || op$1229 === '|=';
    }
    function consumeSemicolon$890() {
        var line$1230, ch$1231;
        ch$1231 = lookahead$843.value ? String(lookahead$843.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1231 === 59) {
            lex$877();
            return;
        }
        if (lookahead$843.lineNumber !== lineNumber$833) {
            return;
        }
        if (match$886(';')) {
            lex$877();
            return;
        }
        if (lookahead$843.type !== Token$821.EOF && !match$886('}')) {
            throwUnexpected$883(lookahead$843);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$891(expr$1232) {
        return expr$1232.type === Syntax$824.Identifier || expr$1232.type === Syntax$824.MemberExpression;
    }
    function isAssignableLeftHandSide$892(expr$1233) {
        return isLeftHandSide$891(expr$1233) || expr$1233.type === Syntax$824.ObjectPattern || expr$1233.type === Syntax$824.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$893() {
        var elements$1234 = [], blocks$1235 = [], filter$1236 = null, tmp$1237, possiblecomprehension$1238 = true, body$1239;
        expect$884('[');
        while (!match$886(']')) {
            if (lookahead$843.value === 'for' && lookahead$843.type === Token$821.Keyword) {
                if (!possiblecomprehension$1238) {
                    throwError$881({}, Messages$826.ComprehensionError);
                }
                matchKeyword$887('for');
                tmp$1237 = parseForStatement$941({ ignoreBody: true });
                tmp$1237.of = tmp$1237.type === Syntax$824.ForOfStatement;
                tmp$1237.type = Syntax$824.ComprehensionBlock;
                if (tmp$1237.left.kind) {
                    // can't be let or const
                    throwError$881({}, Messages$826.ComprehensionError);
                }
                blocks$1235.push(tmp$1237);
            } else if (lookahead$843.value === 'if' && lookahead$843.type === Token$821.Keyword) {
                if (!possiblecomprehension$1238) {
                    throwError$881({}, Messages$826.ComprehensionError);
                }
                expectKeyword$885('if');
                expect$884('(');
                filter$1236 = parseExpression$921();
                expect$884(')');
            } else if (lookahead$843.value === ',' && lookahead$843.type === Token$821.Punctuator) {
                possiblecomprehension$1238 = false;
                // no longer allowed.
                lex$877();
                elements$1234.push(null);
            } else {
                tmp$1237 = parseSpreadOrAssignmentExpression$904();
                elements$1234.push(tmp$1237);
                if (tmp$1237 && tmp$1237.type === Syntax$824.SpreadElement) {
                    if (!match$886(']')) {
                        throwError$881({}, Messages$826.ElementAfterSpreadElement);
                    }
                } else if (!(match$886(']') || matchKeyword$887('for') || matchKeyword$887('if'))) {
                    expect$884(',');
                    // this lexes.
                    possiblecomprehension$1238 = false;
                }
            }
        }
        expect$884(']');
        if (filter$1236 && !blocks$1235.length) {
            throwError$881({}, Messages$826.ComprehensionRequiresBlock);
        }
        if (blocks$1235.length) {
            if (elements$1234.length !== 1) {
                throwError$881({}, Messages$826.ComprehensionError);
            }
            return {
                type: Syntax$824.ComprehensionExpression,
                filter: filter$1236,
                blocks: blocks$1235,
                body: elements$1234[0]
            };
        }
        return delegate$840.createArrayExpression(elements$1234);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$894(options$1240) {
        var previousStrict$1241, previousYieldAllowed$1242, params$1243, defaults$1244, body$1245;
        previousStrict$1241 = strict$831;
        previousYieldAllowed$1242 = state$845.yieldAllowed;
        state$845.yieldAllowed = options$1240.generator;
        params$1243 = options$1240.params || [];
        defaults$1244 = options$1240.defaults || [];
        body$1245 = parseConciseBody$953();
        if (options$1240.name && strict$831 && isRestrictedWord$858(params$1243[0].name)) {
            throwErrorTolerant$882(options$1240.name, Messages$826.StrictParamName);
        }
        if (state$845.yieldAllowed && !state$845.yieldFound) {
            throwErrorTolerant$882({}, Messages$826.NoYieldInGenerator);
        }
        strict$831 = previousStrict$1241;
        state$845.yieldAllowed = previousYieldAllowed$1242;
        return delegate$840.createFunctionExpression(null, params$1243, defaults$1244, body$1245, options$1240.rest || null, options$1240.generator, body$1245.type !== Syntax$824.BlockStatement);
    }
    function parsePropertyMethodFunction$895(options$1246) {
        var previousStrict$1247, tmp$1248, method$1249;
        previousStrict$1247 = strict$831;
        strict$831 = true;
        tmp$1248 = parseParams$957();
        if (tmp$1248.stricted) {
            throwErrorTolerant$882(tmp$1248.stricted, tmp$1248.message);
        }
        method$1249 = parsePropertyFunction$894({
            params: tmp$1248.params,
            defaults: tmp$1248.defaults,
            rest: tmp$1248.rest,
            generator: options$1246.generator
        });
        strict$831 = previousStrict$1247;
        return method$1249;
    }
    function parseObjectPropertyKey$896() {
        var token$1250 = lex$877();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1250.type === Token$821.StringLiteral || token$1250.type === Token$821.NumericLiteral) {
            if (strict$831 && token$1250.octal) {
                throwErrorTolerant$882(token$1250, Messages$826.StrictOctalLiteral);
            }
            return delegate$840.createLiteral(token$1250);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$840.createIdentifier(token$1250.value);
    }
    function parseObjectProperty$897() {
        var token$1251, key$1252, id$1253, value$1254, param$1255;
        token$1251 = lookahead$843;
        if (token$1251.type === Token$821.Identifier) {
            id$1253 = parseObjectPropertyKey$896();
            // Property Assignment: Getter and Setter.
            if (token$1251.value === 'get' && !(match$886(':') || match$886('('))) {
                key$1252 = parseObjectPropertyKey$896();
                expect$884('(');
                expect$884(')');
                return delegate$840.createProperty('get', key$1252, parsePropertyFunction$894({ generator: false }), false, false);
            }
            if (token$1251.value === 'set' && !(match$886(':') || match$886('('))) {
                key$1252 = parseObjectPropertyKey$896();
                expect$884('(');
                token$1251 = lookahead$843;
                param$1255 = [parseVariableIdentifier$924()];
                expect$884(')');
                return delegate$840.createProperty('set', key$1252, parsePropertyFunction$894({
                    params: param$1255,
                    generator: false,
                    name: token$1251
                }), false, false);
            }
            if (match$886(':')) {
                lex$877();
                return delegate$840.createProperty('init', id$1253, parseAssignmentExpression$920(), false, false);
            }
            if (match$886('(')) {
                return delegate$840.createProperty('init', id$1253, parsePropertyMethodFunction$895({ generator: false }), true, false);
            }
            return delegate$840.createProperty('init', id$1253, id$1253, false, true);
        }
        if (token$1251.type === Token$821.EOF || token$1251.type === Token$821.Punctuator) {
            if (!match$886('*')) {
                throwUnexpected$883(token$1251);
            }
            lex$877();
            id$1253 = parseObjectPropertyKey$896();
            if (!match$886('(')) {
                throwUnexpected$883(lex$877());
            }
            return delegate$840.createProperty('init', id$1253, parsePropertyMethodFunction$895({ generator: true }), true, false);
        }
        key$1252 = parseObjectPropertyKey$896();
        if (match$886(':')) {
            lex$877();
            return delegate$840.createProperty('init', key$1252, parseAssignmentExpression$920(), false, false);
        }
        if (match$886('(')) {
            return delegate$840.createProperty('init', key$1252, parsePropertyMethodFunction$895({ generator: false }), true, false);
        }
        throwUnexpected$883(lex$877());
    }
    function parseObjectInitialiser$898() {
        var properties$1256 = [], property$1257, name$1258, key$1259, kind$1260, map$1261 = {}, toString$1262 = String;
        expect$884('{');
        while (!match$886('}')) {
            property$1257 = parseObjectProperty$897();
            if (property$1257.key.type === Syntax$824.Identifier) {
                name$1258 = property$1257.key.name;
            } else {
                name$1258 = toString$1262(property$1257.key.value);
            }
            kind$1260 = property$1257.kind === 'init' ? PropertyKind$825.Data : property$1257.kind === 'get' ? PropertyKind$825.Get : PropertyKind$825.Set;
            key$1259 = '$' + name$1258;
            if (Object.prototype.hasOwnProperty.call(map$1261, key$1259)) {
                if (map$1261[key$1259] === PropertyKind$825.Data) {
                    if (strict$831 && kind$1260 === PropertyKind$825.Data) {
                        throwErrorTolerant$882({}, Messages$826.StrictDuplicateProperty);
                    } else if (kind$1260 !== PropertyKind$825.Data) {
                        throwErrorTolerant$882({}, Messages$826.AccessorDataProperty);
                    }
                } else {
                    if (kind$1260 === PropertyKind$825.Data) {
                        throwErrorTolerant$882({}, Messages$826.AccessorDataProperty);
                    } else if (map$1261[key$1259] & kind$1260) {
                        throwErrorTolerant$882({}, Messages$826.AccessorGetSet);
                    }
                }
                map$1261[key$1259] |= kind$1260;
            } else {
                map$1261[key$1259] = kind$1260;
            }
            properties$1256.push(property$1257);
            if (!match$886('}')) {
                expect$884(',');
            }
        }
        expect$884('}');
        return delegate$840.createObjectExpression(properties$1256);
    }
    function parseTemplateElement$899(option$1263) {
        var token$1264 = scanTemplateElement$872(option$1263);
        if (strict$831 && token$1264.octal) {
            throwError$881(token$1264, Messages$826.StrictOctalLiteral);
        }
        return delegate$840.createTemplateElement({
            raw: token$1264.value.raw,
            cooked: token$1264.value.cooked
        }, token$1264.tail);
    }
    function parseTemplateLiteral$900() {
        var quasi$1265, quasis$1266, expressions$1267;
        quasi$1265 = parseTemplateElement$899({ head: true });
        quasis$1266 = [quasi$1265];
        expressions$1267 = [];
        while (!quasi$1265.tail) {
            expressions$1267.push(parseExpression$921());
            quasi$1265 = parseTemplateElement$899({ head: false });
            quasis$1266.push(quasi$1265);
        }
        return delegate$840.createTemplateLiteral(quasis$1266, expressions$1267);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$901() {
        var expr$1268;
        expect$884('(');
        ++state$845.parenthesizedCount;
        expr$1268 = parseExpression$921();
        expect$884(')');
        return expr$1268;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$902() {
        var type$1269, token$1270, resolvedIdent$1271;
        token$1270 = lookahead$843;
        type$1269 = lookahead$843.type;
        if (type$1269 === Token$821.Identifier) {
            resolvedIdent$1271 = expander$820.resolve(tokenStream$841[lookaheadIndex$844]);
            lex$877();
            return delegate$840.createIdentifier(resolvedIdent$1271);
        }
        if (type$1269 === Token$821.StringLiteral || type$1269 === Token$821.NumericLiteral) {
            if (strict$831 && lookahead$843.octal) {
                throwErrorTolerant$882(lookahead$843, Messages$826.StrictOctalLiteral);
            }
            return delegate$840.createLiteral(lex$877());
        }
        if (type$1269 === Token$821.Keyword) {
            if (matchKeyword$887('this')) {
                lex$877();
                return delegate$840.createThisExpression();
            }
            if (matchKeyword$887('function')) {
                return parseFunctionExpression$959();
            }
            if (matchKeyword$887('class')) {
                return parseClassExpression$964();
            }
            if (matchKeyword$887('super')) {
                lex$877();
                return delegate$840.createIdentifier('super');
            }
        }
        if (type$1269 === Token$821.BooleanLiteral) {
            token$1270 = lex$877();
            token$1270.value = token$1270.value === 'true';
            return delegate$840.createLiteral(token$1270);
        }
        if (type$1269 === Token$821.NullLiteral) {
            token$1270 = lex$877();
            token$1270.value = null;
            return delegate$840.createLiteral(token$1270);
        }
        if (match$886('[')) {
            return parseArrayInitialiser$893();
        }
        if (match$886('{')) {
            return parseObjectInitialiser$898();
        }
        if (match$886('(')) {
            return parseGroupExpression$901();
        }
        if (lookahead$843.type === Token$821.RegularExpression) {
            return delegate$840.createLiteral(lex$877());
        }
        if (type$1269 === Token$821.Template) {
            return parseTemplateLiteral$900();
        }
        return throwUnexpected$883(lex$877());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$903() {
        var args$1272 = [], arg$1273;
        expect$884('(');
        if (!match$886(')')) {
            while (streamIndex$842 < length$839) {
                arg$1273 = parseSpreadOrAssignmentExpression$904();
                args$1272.push(arg$1273);
                if (match$886(')')) {
                    break;
                } else if (arg$1273.type === Syntax$824.SpreadElement) {
                    throwError$881({}, Messages$826.ElementAfterSpreadElement);
                }
                expect$884(',');
            }
        }
        expect$884(')');
        return args$1272;
    }
    function parseSpreadOrAssignmentExpression$904() {
        if (match$886('...')) {
            lex$877();
            return delegate$840.createSpreadElement(parseAssignmentExpression$920());
        }
        return parseAssignmentExpression$920();
    }
    function parseNonComputedProperty$905() {
        var token$1274 = lex$877();
        if (!isIdentifierName$874(token$1274)) {
            throwUnexpected$883(token$1274);
        }
        return delegate$840.createIdentifier(token$1274.value);
    }
    function parseNonComputedMember$906() {
        expect$884('.');
        return parseNonComputedProperty$905();
    }
    function parseComputedMember$907() {
        var expr$1275;
        expect$884('[');
        expr$1275 = parseExpression$921();
        expect$884(']');
        return expr$1275;
    }
    function parseNewExpression$908() {
        var callee$1276, args$1277;
        expectKeyword$885('new');
        callee$1276 = parseLeftHandSideExpression$910();
        args$1277 = match$886('(') ? parseArguments$903() : [];
        return delegate$840.createNewExpression(callee$1276, args$1277);
    }
    function parseLeftHandSideExpressionAllowCall$909() {
        var expr$1278, args$1279, property$1280;
        expr$1278 = matchKeyword$887('new') ? parseNewExpression$908() : parsePrimaryExpression$902();
        while (match$886('.') || match$886('[') || match$886('(') || lookahead$843.type === Token$821.Template) {
            if (match$886('(')) {
                args$1279 = parseArguments$903();
                expr$1278 = delegate$840.createCallExpression(expr$1278, args$1279);
            } else if (match$886('[')) {
                expr$1278 = delegate$840.createMemberExpression('[', expr$1278, parseComputedMember$907());
            } else if (match$886('.')) {
                expr$1278 = delegate$840.createMemberExpression('.', expr$1278, parseNonComputedMember$906());
            } else {
                expr$1278 = delegate$840.createTaggedTemplateExpression(expr$1278, parseTemplateLiteral$900());
            }
        }
        return expr$1278;
    }
    function parseLeftHandSideExpression$910() {
        var expr$1281, property$1282;
        expr$1281 = matchKeyword$887('new') ? parseNewExpression$908() : parsePrimaryExpression$902();
        while (match$886('.') || match$886('[') || lookahead$843.type === Token$821.Template) {
            if (match$886('[')) {
                expr$1281 = delegate$840.createMemberExpression('[', expr$1281, parseComputedMember$907());
            } else if (match$886('.')) {
                expr$1281 = delegate$840.createMemberExpression('.', expr$1281, parseNonComputedMember$906());
            } else {
                expr$1281 = delegate$840.createTaggedTemplateExpression(expr$1281, parseTemplateLiteral$900());
            }
        }
        return expr$1281;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$911() {
        var expr$1283 = parseLeftHandSideExpressionAllowCall$909(), token$1284 = lookahead$843;
        if (lookahead$843.type !== Token$821.Punctuator) {
            return expr$1283;
        }
        if ((match$886('++') || match$886('--')) && !peekLineTerminator$880()) {
            // 11.3.1, 11.3.2
            if (strict$831 && expr$1283.type === Syntax$824.Identifier && isRestrictedWord$858(expr$1283.name)) {
                throwErrorTolerant$882({}, Messages$826.StrictLHSPostfix);
            }
            if (!isLeftHandSide$891(expr$1283)) {
                throwError$881({}, Messages$826.InvalidLHSInAssignment);
            }
            token$1284 = lex$877();
            expr$1283 = delegate$840.createPostfixExpression(token$1284.value, expr$1283);
        }
        return expr$1283;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$912() {
        var token$1285, expr$1286;
        if (lookahead$843.type !== Token$821.Punctuator && lookahead$843.type !== Token$821.Keyword) {
            return parsePostfixExpression$911();
        }
        if (match$886('++') || match$886('--')) {
            token$1285 = lex$877();
            expr$1286 = parseUnaryExpression$912();
            // 11.4.4, 11.4.5
            if (strict$831 && expr$1286.type === Syntax$824.Identifier && isRestrictedWord$858(expr$1286.name)) {
                throwErrorTolerant$882({}, Messages$826.StrictLHSPrefix);
            }
            if (!isLeftHandSide$891(expr$1286)) {
                throwError$881({}, Messages$826.InvalidLHSInAssignment);
            }
            return delegate$840.createUnaryExpression(token$1285.value, expr$1286);
        }
        if (match$886('+') || match$886('-') || match$886('~') || match$886('!')) {
            token$1285 = lex$877();
            expr$1286 = parseUnaryExpression$912();
            return delegate$840.createUnaryExpression(token$1285.value, expr$1286);
        }
        if (matchKeyword$887('delete') || matchKeyword$887('void') || matchKeyword$887('typeof')) {
            token$1285 = lex$877();
            expr$1286 = parseUnaryExpression$912();
            expr$1286 = delegate$840.createUnaryExpression(token$1285.value, expr$1286);
            if (strict$831 && expr$1286.operator === 'delete' && expr$1286.argument.type === Syntax$824.Identifier) {
                throwErrorTolerant$882({}, Messages$826.StrictDelete);
            }
            return expr$1286;
        }
        return parsePostfixExpression$911();
    }
    function binaryPrecedence$913(token$1287, allowIn$1288) {
        var prec$1289 = 0;
        if (token$1287.type !== Token$821.Punctuator && token$1287.type !== Token$821.Keyword) {
            return 0;
        }
        switch (token$1287.value) {
        case '||':
            prec$1289 = 1;
            break;
        case '&&':
            prec$1289 = 2;
            break;
        case '|':
            prec$1289 = 3;
            break;
        case '^':
            prec$1289 = 4;
            break;
        case '&':
            prec$1289 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1289 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1289 = 7;
            break;
        case 'in':
            prec$1289 = allowIn$1288 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1289 = 8;
            break;
        case '+':
        case '-':
            prec$1289 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1289 = 11;
            break;
        default:
            break;
        }
        return prec$1289;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$914() {
        var expr$1290, token$1291, prec$1292, previousAllowIn$1293, stack$1294, right$1295, operator$1296, left$1297, i$1298;
        previousAllowIn$1293 = state$845.allowIn;
        state$845.allowIn = true;
        expr$1290 = parseUnaryExpression$912();
        token$1291 = lookahead$843;
        prec$1292 = binaryPrecedence$913(token$1291, previousAllowIn$1293);
        if (prec$1292 === 0) {
            return expr$1290;
        }
        token$1291.prec = prec$1292;
        lex$877();
        stack$1294 = [
            expr$1290,
            token$1291,
            parseUnaryExpression$912()
        ];
        while ((prec$1292 = binaryPrecedence$913(lookahead$843, previousAllowIn$1293)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1294.length > 2 && prec$1292 <= stack$1294[stack$1294.length - 2].prec) {
                right$1295 = stack$1294.pop();
                operator$1296 = stack$1294.pop().value;
                left$1297 = stack$1294.pop();
                stack$1294.push(delegate$840.createBinaryExpression(operator$1296, left$1297, right$1295));
            }
            // Shift.
            token$1291 = lex$877();
            token$1291.prec = prec$1292;
            stack$1294.push(token$1291);
            stack$1294.push(parseUnaryExpression$912());
        }
        state$845.allowIn = previousAllowIn$1293;
        // Final reduce to clean-up the stack.
        i$1298 = stack$1294.length - 1;
        expr$1290 = stack$1294[i$1298];
        while (i$1298 > 1) {
            expr$1290 = delegate$840.createBinaryExpression(stack$1294[i$1298 - 1].value, stack$1294[i$1298 - 2], expr$1290);
            i$1298 -= 2;
        }
        return expr$1290;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$915() {
        var expr$1299, previousAllowIn$1300, consequent$1301, alternate$1302;
        expr$1299 = parseBinaryExpression$914();
        if (match$886('?')) {
            lex$877();
            previousAllowIn$1300 = state$845.allowIn;
            state$845.allowIn = true;
            consequent$1301 = parseAssignmentExpression$920();
            state$845.allowIn = previousAllowIn$1300;
            expect$884(':');
            alternate$1302 = parseAssignmentExpression$920();
            expr$1299 = delegate$840.createConditionalExpression(expr$1299, consequent$1301, alternate$1302);
        }
        return expr$1299;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$916(expr$1303) {
        var i$1304, len$1305, property$1306, element$1307;
        if (expr$1303.type === Syntax$824.ObjectExpression) {
            expr$1303.type = Syntax$824.ObjectPattern;
            for (i$1304 = 0, len$1305 = expr$1303.properties.length; i$1304 < len$1305; i$1304 += 1) {
                property$1306 = expr$1303.properties[i$1304];
                if (property$1306.kind !== 'init') {
                    throwError$881({}, Messages$826.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$916(property$1306.value);
            }
        } else if (expr$1303.type === Syntax$824.ArrayExpression) {
            expr$1303.type = Syntax$824.ArrayPattern;
            for (i$1304 = 0, len$1305 = expr$1303.elements.length; i$1304 < len$1305; i$1304 += 1) {
                element$1307 = expr$1303.elements[i$1304];
                if (element$1307) {
                    reinterpretAsAssignmentBindingPattern$916(element$1307);
                }
            }
        } else if (expr$1303.type === Syntax$824.Identifier) {
            if (isRestrictedWord$858(expr$1303.name)) {
                throwError$881({}, Messages$826.InvalidLHSInAssignment);
            }
        } else if (expr$1303.type === Syntax$824.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$916(expr$1303.argument);
            if (expr$1303.argument.type === Syntax$824.ObjectPattern) {
                throwError$881({}, Messages$826.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1303.type !== Syntax$824.MemberExpression && expr$1303.type !== Syntax$824.CallExpression && expr$1303.type !== Syntax$824.NewExpression) {
                throwError$881({}, Messages$826.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$917(options$1308, expr$1309) {
        var i$1310, len$1311, property$1312, element$1313;
        if (expr$1309.type === Syntax$824.ObjectExpression) {
            expr$1309.type = Syntax$824.ObjectPattern;
            for (i$1310 = 0, len$1311 = expr$1309.properties.length; i$1310 < len$1311; i$1310 += 1) {
                property$1312 = expr$1309.properties[i$1310];
                if (property$1312.kind !== 'init') {
                    throwError$881({}, Messages$826.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$917(options$1308, property$1312.value);
            }
        } else if (expr$1309.type === Syntax$824.ArrayExpression) {
            expr$1309.type = Syntax$824.ArrayPattern;
            for (i$1310 = 0, len$1311 = expr$1309.elements.length; i$1310 < len$1311; i$1310 += 1) {
                element$1313 = expr$1309.elements[i$1310];
                if (element$1313) {
                    reinterpretAsDestructuredParameter$917(options$1308, element$1313);
                }
            }
        } else if (expr$1309.type === Syntax$824.Identifier) {
            validateParam$955(options$1308, expr$1309, expr$1309.name);
        } else {
            if (expr$1309.type !== Syntax$824.MemberExpression) {
                throwError$881({}, Messages$826.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$918(expressions$1314) {
        var i$1315, len$1316, param$1317, params$1318, defaults$1319, defaultCount$1320, options$1321, rest$1322;
        params$1318 = [];
        defaults$1319 = [];
        defaultCount$1320 = 0;
        rest$1322 = null;
        options$1321 = { paramSet: {} };
        for (i$1315 = 0, len$1316 = expressions$1314.length; i$1315 < len$1316; i$1315 += 1) {
            param$1317 = expressions$1314[i$1315];
            if (param$1317.type === Syntax$824.Identifier) {
                params$1318.push(param$1317);
                defaults$1319.push(null);
                validateParam$955(options$1321, param$1317, param$1317.name);
            } else if (param$1317.type === Syntax$824.ObjectExpression || param$1317.type === Syntax$824.ArrayExpression) {
                reinterpretAsDestructuredParameter$917(options$1321, param$1317);
                params$1318.push(param$1317);
                defaults$1319.push(null);
            } else if (param$1317.type === Syntax$824.SpreadElement) {
                assert$847(i$1315 === len$1316 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$917(options$1321, param$1317.argument);
                rest$1322 = param$1317.argument;
            } else if (param$1317.type === Syntax$824.AssignmentExpression) {
                params$1318.push(param$1317.left);
                defaults$1319.push(param$1317.right);
                ++defaultCount$1320;
                validateParam$955(options$1321, param$1317.left, param$1317.left.name);
            } else {
                return null;
            }
        }
        if (options$1321.message === Messages$826.StrictParamDupe) {
            throwError$881(strict$831 ? options$1321.stricted : options$1321.firstRestricted, options$1321.message);
        }
        if (defaultCount$1320 === 0) {
            defaults$1319 = [];
        }
        return {
            params: params$1318,
            defaults: defaults$1319,
            rest: rest$1322,
            stricted: options$1321.stricted,
            firstRestricted: options$1321.firstRestricted,
            message: options$1321.message
        };
    }
    function parseArrowFunctionExpression$919(options$1323) {
        var previousStrict$1324, previousYieldAllowed$1325, body$1326;
        expect$884('=>');
        previousStrict$1324 = strict$831;
        previousYieldAllowed$1325 = state$845.yieldAllowed;
        state$845.yieldAllowed = false;
        body$1326 = parseConciseBody$953();
        if (strict$831 && options$1323.firstRestricted) {
            throwError$881(options$1323.firstRestricted, options$1323.message);
        }
        if (strict$831 && options$1323.stricted) {
            throwErrorTolerant$882(options$1323.stricted, options$1323.message);
        }
        strict$831 = previousStrict$1324;
        state$845.yieldAllowed = previousYieldAllowed$1325;
        return delegate$840.createArrowFunctionExpression(options$1323.params, options$1323.defaults, body$1326, options$1323.rest, body$1326.type !== Syntax$824.BlockStatement);
    }
    function parseAssignmentExpression$920() {
        var expr$1327, token$1328, params$1329, oldParenthesizedCount$1330;
        if (matchKeyword$887('yield')) {
            return parseYieldExpression$960();
        }
        oldParenthesizedCount$1330 = state$845.parenthesizedCount;
        if (match$886('(')) {
            token$1328 = lookahead2$879();
            if (token$1328.type === Token$821.Punctuator && token$1328.value === ')' || token$1328.value === '...') {
                params$1329 = parseParams$957();
                if (!match$886('=>')) {
                    throwUnexpected$883(lex$877());
                }
                return parseArrowFunctionExpression$919(params$1329);
            }
        }
        token$1328 = lookahead$843;
        expr$1327 = parseConditionalExpression$915();
        if (match$886('=>') && (state$845.parenthesizedCount === oldParenthesizedCount$1330 || state$845.parenthesizedCount === oldParenthesizedCount$1330 + 1)) {
            if (expr$1327.type === Syntax$824.Identifier) {
                params$1329 = reinterpretAsCoverFormalsList$918([expr$1327]);
            } else if (expr$1327.type === Syntax$824.SequenceExpression) {
                params$1329 = reinterpretAsCoverFormalsList$918(expr$1327.expressions);
            }
            if (params$1329) {
                return parseArrowFunctionExpression$919(params$1329);
            }
        }
        if (matchAssign$889()) {
            // 11.13.1
            if (strict$831 && expr$1327.type === Syntax$824.Identifier && isRestrictedWord$858(expr$1327.name)) {
                throwErrorTolerant$882(token$1328, Messages$826.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$886('=') && (expr$1327.type === Syntax$824.ObjectExpression || expr$1327.type === Syntax$824.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$916(expr$1327);
            } else if (!isLeftHandSide$891(expr$1327)) {
                throwError$881({}, Messages$826.InvalidLHSInAssignment);
            }
            expr$1327 = delegate$840.createAssignmentExpression(lex$877().value, expr$1327, parseAssignmentExpression$920());
        }
        return expr$1327;
    }
    // 11.14 Comma Operator
    function parseExpression$921() {
        var expr$1331, expressions$1332, sequence$1333, coverFormalsList$1334, spreadFound$1335, oldParenthesizedCount$1336;
        oldParenthesizedCount$1336 = state$845.parenthesizedCount;
        expr$1331 = parseAssignmentExpression$920();
        expressions$1332 = [expr$1331];
        if (match$886(',')) {
            while (streamIndex$842 < length$839) {
                if (!match$886(',')) {
                    break;
                }
                lex$877();
                expr$1331 = parseSpreadOrAssignmentExpression$904();
                expressions$1332.push(expr$1331);
                if (expr$1331.type === Syntax$824.SpreadElement) {
                    spreadFound$1335 = true;
                    if (!match$886(')')) {
                        throwError$881({}, Messages$826.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1333 = delegate$840.createSequenceExpression(expressions$1332);
        }
        if (match$886('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$845.parenthesizedCount === oldParenthesizedCount$1336 || state$845.parenthesizedCount === oldParenthesizedCount$1336 + 1) {
                expr$1331 = expr$1331.type === Syntax$824.SequenceExpression ? expr$1331.expressions : expressions$1332;
                coverFormalsList$1334 = reinterpretAsCoverFormalsList$918(expr$1331);
                if (coverFormalsList$1334) {
                    return parseArrowFunctionExpression$919(coverFormalsList$1334);
                }
            }
            throwUnexpected$883(lex$877());
        }
        if (spreadFound$1335 && lookahead2$879().value !== '=>') {
            throwError$881({}, Messages$826.IllegalSpread);
        }
        return sequence$1333 || expr$1331;
    }
    // 12.1 Block
    function parseStatementList$922() {
        var list$1337 = [], statement$1338;
        while (streamIndex$842 < length$839) {
            if (match$886('}')) {
                break;
            }
            statement$1338 = parseSourceElement$967();
            if (typeof statement$1338 === 'undefined') {
                break;
            }
            list$1337.push(statement$1338);
        }
        return list$1337;
    }
    function parseBlock$923() {
        var block$1339;
        expect$884('{');
        block$1339 = parseStatementList$922();
        expect$884('}');
        return delegate$840.createBlockStatement(block$1339);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$924() {
        var token$1340 = lookahead$843, resolvedIdent$1341;
        if (token$1340.type !== Token$821.Identifier) {
            throwUnexpected$883(token$1340);
        }
        resolvedIdent$1341 = expander$820.resolve(tokenStream$841[lookaheadIndex$844]);
        lex$877();
        return delegate$840.createIdentifier(resolvedIdent$1341);
    }
    function parseVariableDeclaration$925(kind$1342) {
        var id$1343, init$1344 = null;
        if (match$886('{')) {
            id$1343 = parseObjectInitialiser$898();
            reinterpretAsAssignmentBindingPattern$916(id$1343);
        } else if (match$886('[')) {
            id$1343 = parseArrayInitialiser$893();
            reinterpretAsAssignmentBindingPattern$916(id$1343);
        } else {
            id$1343 = state$845.allowKeyword ? parseNonComputedProperty$905() : parseVariableIdentifier$924();
            // 12.2.1
            if (strict$831 && isRestrictedWord$858(id$1343.name)) {
                throwErrorTolerant$882({}, Messages$826.StrictVarName);
            }
        }
        if (kind$1342 === 'const') {
            if (!match$886('=')) {
                throwError$881({}, Messages$826.NoUnintializedConst);
            }
            expect$884('=');
            init$1344 = parseAssignmentExpression$920();
        } else if (match$886('=')) {
            lex$877();
            init$1344 = parseAssignmentExpression$920();
        }
        return delegate$840.createVariableDeclarator(id$1343, init$1344);
    }
    function parseVariableDeclarationList$926(kind$1345) {
        var list$1346 = [];
        do {
            list$1346.push(parseVariableDeclaration$925(kind$1345));
            if (!match$886(',')) {
                break;
            }
            lex$877();
        } while (streamIndex$842 < length$839);
        return list$1346;
    }
    function parseVariableStatement$927() {
        var declarations$1347;
        expectKeyword$885('var');
        declarations$1347 = parseVariableDeclarationList$926();
        consumeSemicolon$890();
        return delegate$840.createVariableDeclaration(declarations$1347, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$928(kind$1348) {
        var declarations$1349;
        expectKeyword$885(kind$1348);
        declarations$1349 = parseVariableDeclarationList$926(kind$1348);
        consumeSemicolon$890();
        return delegate$840.createVariableDeclaration(declarations$1349, kind$1348);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$929() {
        var id$1350, src$1351, body$1352;
        lex$877();
        // 'module'
        if (peekLineTerminator$880()) {
            throwError$881({}, Messages$826.NewlineAfterModule);
        }
        switch (lookahead$843.type) {
        case Token$821.StringLiteral:
            id$1350 = parsePrimaryExpression$902();
            body$1352 = parseModuleBlock$972();
            src$1351 = null;
            break;
        case Token$821.Identifier:
            id$1350 = parseVariableIdentifier$924();
            body$1352 = null;
            if (!matchContextualKeyword$888('from')) {
                throwUnexpected$883(lex$877());
            }
            lex$877();
            src$1351 = parsePrimaryExpression$902();
            if (src$1351.type !== Syntax$824.Literal) {
                throwError$881({}, Messages$826.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$890();
        return delegate$840.createModuleDeclaration(id$1350, src$1351, body$1352);
    }
    function parseExportBatchSpecifier$930() {
        expect$884('*');
        return delegate$840.createExportBatchSpecifier();
    }
    function parseExportSpecifier$931() {
        var id$1353, name$1354 = null;
        id$1353 = parseVariableIdentifier$924();
        if (matchContextualKeyword$888('as')) {
            lex$877();
            name$1354 = parseNonComputedProperty$905();
        }
        return delegate$840.createExportSpecifier(id$1353, name$1354);
    }
    function parseExportDeclaration$932() {
        var previousAllowKeyword$1355, decl$1356, def$1357, src$1358, specifiers$1359;
        expectKeyword$885('export');
        if (lookahead$843.type === Token$821.Keyword) {
            switch (lookahead$843.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$840.createExportDeclaration(parseSourceElement$967(), null, null);
            }
        }
        if (isIdentifierName$874(lookahead$843)) {
            previousAllowKeyword$1355 = state$845.allowKeyword;
            state$845.allowKeyword = true;
            decl$1356 = parseVariableDeclarationList$926('let');
            state$845.allowKeyword = previousAllowKeyword$1355;
            return delegate$840.createExportDeclaration(decl$1356, null, null);
        }
        specifiers$1359 = [];
        src$1358 = null;
        if (match$886('*')) {
            specifiers$1359.push(parseExportBatchSpecifier$930());
        } else {
            expect$884('{');
            do {
                specifiers$1359.push(parseExportSpecifier$931());
            } while (match$886(',') && lex$877());
            expect$884('}');
        }
        if (matchContextualKeyword$888('from')) {
            lex$877();
            src$1358 = parsePrimaryExpression$902();
            if (src$1358.type !== Syntax$824.Literal) {
                throwError$881({}, Messages$826.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$890();
        return delegate$840.createExportDeclaration(null, specifiers$1359, src$1358);
    }
    function parseImportDeclaration$933() {
        var specifiers$1360, kind$1361, src$1362;
        expectKeyword$885('import');
        specifiers$1360 = [];
        if (isIdentifierName$874(lookahead$843)) {
            kind$1361 = 'default';
            specifiers$1360.push(parseImportSpecifier$934());
            if (!matchContextualKeyword$888('from')) {
                throwError$881({}, Messages$826.NoFromAfterImport);
            }
            lex$877();
        } else if (match$886('{')) {
            kind$1361 = 'named';
            lex$877();
            do {
                specifiers$1360.push(parseImportSpecifier$934());
            } while (match$886(',') && lex$877());
            expect$884('}');
            if (!matchContextualKeyword$888('from')) {
                throwError$881({}, Messages$826.NoFromAfterImport);
            }
            lex$877();
        }
        src$1362 = parsePrimaryExpression$902();
        if (src$1362.type !== Syntax$824.Literal) {
            throwError$881({}, Messages$826.InvalidModuleSpecifier);
        }
        consumeSemicolon$890();
        return delegate$840.createImportDeclaration(specifiers$1360, kind$1361, src$1362);
    }
    function parseImportSpecifier$934() {
        var id$1363, name$1364 = null;
        id$1363 = parseNonComputedProperty$905();
        if (matchContextualKeyword$888('as')) {
            lex$877();
            name$1364 = parseVariableIdentifier$924();
        }
        return delegate$840.createImportSpecifier(id$1363, name$1364);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$935() {
        expect$884(';');
        return delegate$840.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$936() {
        var expr$1365 = parseExpression$921();
        consumeSemicolon$890();
        return delegate$840.createExpressionStatement(expr$1365);
    }
    // 12.5 If statement
    function parseIfStatement$937() {
        var test$1366, consequent$1367, alternate$1368;
        expectKeyword$885('if');
        expect$884('(');
        test$1366 = parseExpression$921();
        expect$884(')');
        consequent$1367 = parseStatement$952();
        if (matchKeyword$887('else')) {
            lex$877();
            alternate$1368 = parseStatement$952();
        } else {
            alternate$1368 = null;
        }
        return delegate$840.createIfStatement(test$1366, consequent$1367, alternate$1368);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$938() {
        var body$1369, test$1370, oldInIteration$1371;
        expectKeyword$885('do');
        oldInIteration$1371 = state$845.inIteration;
        state$845.inIteration = true;
        body$1369 = parseStatement$952();
        state$845.inIteration = oldInIteration$1371;
        expectKeyword$885('while');
        expect$884('(');
        test$1370 = parseExpression$921();
        expect$884(')');
        if (match$886(';')) {
            lex$877();
        }
        return delegate$840.createDoWhileStatement(body$1369, test$1370);
    }
    function parseWhileStatement$939() {
        var test$1372, body$1373, oldInIteration$1374;
        expectKeyword$885('while');
        expect$884('(');
        test$1372 = parseExpression$921();
        expect$884(')');
        oldInIteration$1374 = state$845.inIteration;
        state$845.inIteration = true;
        body$1373 = parseStatement$952();
        state$845.inIteration = oldInIteration$1374;
        return delegate$840.createWhileStatement(test$1372, body$1373);
    }
    function parseForVariableDeclaration$940() {
        var token$1375 = lex$877(), declarations$1376 = parseVariableDeclarationList$926();
        return delegate$840.createVariableDeclaration(declarations$1376, token$1375.value);
    }
    function parseForStatement$941(opts$1377) {
        var init$1378, test$1379, update$1380, left$1381, right$1382, body$1383, operator$1384, oldInIteration$1385;
        init$1378 = test$1379 = update$1380 = null;
        expectKeyword$885('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$888('each')) {
            throwError$881({}, Messages$826.EachNotAllowed);
        }
        expect$884('(');
        if (match$886(';')) {
            lex$877();
        } else {
            if (matchKeyword$887('var') || matchKeyword$887('let') || matchKeyword$887('const')) {
                state$845.allowIn = false;
                init$1378 = parseForVariableDeclaration$940();
                state$845.allowIn = true;
                if (init$1378.declarations.length === 1) {
                    if (matchKeyword$887('in') || matchContextualKeyword$888('of')) {
                        operator$1384 = lookahead$843;
                        if (!((operator$1384.value === 'in' || init$1378.kind !== 'var') && init$1378.declarations[0].init)) {
                            lex$877();
                            left$1381 = init$1378;
                            right$1382 = parseExpression$921();
                            init$1378 = null;
                        }
                    }
                }
            } else {
                state$845.allowIn = false;
                init$1378 = parseExpression$921();
                state$845.allowIn = true;
                if (matchContextualKeyword$888('of')) {
                    operator$1384 = lex$877();
                    left$1381 = init$1378;
                    right$1382 = parseExpression$921();
                    init$1378 = null;
                } else if (matchKeyword$887('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$892(init$1378)) {
                        throwError$881({}, Messages$826.InvalidLHSInForIn);
                    }
                    operator$1384 = lex$877();
                    left$1381 = init$1378;
                    right$1382 = parseExpression$921();
                    init$1378 = null;
                }
            }
            if (typeof left$1381 === 'undefined') {
                expect$884(';');
            }
        }
        if (typeof left$1381 === 'undefined') {
            if (!match$886(';')) {
                test$1379 = parseExpression$921();
            }
            expect$884(';');
            if (!match$886(')')) {
                update$1380 = parseExpression$921();
            }
        }
        expect$884(')');
        oldInIteration$1385 = state$845.inIteration;
        state$845.inIteration = true;
        if (!(opts$1377 !== undefined && opts$1377.ignoreBody)) {
            body$1383 = parseStatement$952();
        }
        state$845.inIteration = oldInIteration$1385;
        if (typeof left$1381 === 'undefined') {
            return delegate$840.createForStatement(init$1378, test$1379, update$1380, body$1383);
        }
        if (operator$1384.value === 'in') {
            return delegate$840.createForInStatement(left$1381, right$1382, body$1383);
        }
        return delegate$840.createForOfStatement(left$1381, right$1382, body$1383);
    }
    // 12.7 The continue statement
    function parseContinueStatement$942() {
        var label$1386 = null, key$1387;
        expectKeyword$885('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$843.value.charCodeAt(0) === 59) {
            lex$877();
            if (!state$845.inIteration) {
                throwError$881({}, Messages$826.IllegalContinue);
            }
            return delegate$840.createContinueStatement(null);
        }
        if (peekLineTerminator$880()) {
            if (!state$845.inIteration) {
                throwError$881({}, Messages$826.IllegalContinue);
            }
            return delegate$840.createContinueStatement(null);
        }
        if (lookahead$843.type === Token$821.Identifier) {
            label$1386 = parseVariableIdentifier$924();
            key$1387 = '$' + label$1386.name;
            if (!Object.prototype.hasOwnProperty.call(state$845.labelSet, key$1387)) {
                throwError$881({}, Messages$826.UnknownLabel, label$1386.name);
            }
        }
        consumeSemicolon$890();
        if (label$1386 === null && !state$845.inIteration) {
            throwError$881({}, Messages$826.IllegalContinue);
        }
        return delegate$840.createContinueStatement(label$1386);
    }
    // 12.8 The break statement
    function parseBreakStatement$943() {
        var label$1388 = null, key$1389;
        expectKeyword$885('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$843.value.charCodeAt(0) === 59) {
            lex$877();
            if (!(state$845.inIteration || state$845.inSwitch)) {
                throwError$881({}, Messages$826.IllegalBreak);
            }
            return delegate$840.createBreakStatement(null);
        }
        if (peekLineTerminator$880()) {
            if (!(state$845.inIteration || state$845.inSwitch)) {
                throwError$881({}, Messages$826.IllegalBreak);
            }
            return delegate$840.createBreakStatement(null);
        }
        if (lookahead$843.type === Token$821.Identifier) {
            label$1388 = parseVariableIdentifier$924();
            key$1389 = '$' + label$1388.name;
            if (!Object.prototype.hasOwnProperty.call(state$845.labelSet, key$1389)) {
                throwError$881({}, Messages$826.UnknownLabel, label$1388.name);
            }
        }
        consumeSemicolon$890();
        if (label$1388 === null && !(state$845.inIteration || state$845.inSwitch)) {
            throwError$881({}, Messages$826.IllegalBreak);
        }
        return delegate$840.createBreakStatement(label$1388);
    }
    // 12.9 The return statement
    function parseReturnStatement$944() {
        var argument$1390 = null;
        expectKeyword$885('return');
        if (!state$845.inFunctionBody) {
            throwErrorTolerant$882({}, Messages$826.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$854(String(lookahead$843.value).charCodeAt(0))) {
            argument$1390 = parseExpression$921();
            consumeSemicolon$890();
            return delegate$840.createReturnStatement(argument$1390);
        }
        if (peekLineTerminator$880()) {
            return delegate$840.createReturnStatement(null);
        }
        if (!match$886(';')) {
            if (!match$886('}') && lookahead$843.type !== Token$821.EOF) {
                argument$1390 = parseExpression$921();
            }
        }
        consumeSemicolon$890();
        return delegate$840.createReturnStatement(argument$1390);
    }
    // 12.10 The with statement
    function parseWithStatement$945() {
        var object$1391, body$1392;
        if (strict$831) {
            throwErrorTolerant$882({}, Messages$826.StrictModeWith);
        }
        expectKeyword$885('with');
        expect$884('(');
        object$1391 = parseExpression$921();
        expect$884(')');
        body$1392 = parseStatement$952();
        return delegate$840.createWithStatement(object$1391, body$1392);
    }
    // 12.10 The swith statement
    function parseSwitchCase$946() {
        var test$1393, consequent$1394 = [], sourceElement$1395;
        if (matchKeyword$887('default')) {
            lex$877();
            test$1393 = null;
        } else {
            expectKeyword$885('case');
            test$1393 = parseExpression$921();
        }
        expect$884(':');
        while (streamIndex$842 < length$839) {
            if (match$886('}') || matchKeyword$887('default') || matchKeyword$887('case')) {
                break;
            }
            sourceElement$1395 = parseSourceElement$967();
            if (typeof sourceElement$1395 === 'undefined') {
                break;
            }
            consequent$1394.push(sourceElement$1395);
        }
        return delegate$840.createSwitchCase(test$1393, consequent$1394);
    }
    function parseSwitchStatement$947() {
        var discriminant$1396, cases$1397, clause$1398, oldInSwitch$1399, defaultFound$1400;
        expectKeyword$885('switch');
        expect$884('(');
        discriminant$1396 = parseExpression$921();
        expect$884(')');
        expect$884('{');
        cases$1397 = [];
        if (match$886('}')) {
            lex$877();
            return delegate$840.createSwitchStatement(discriminant$1396, cases$1397);
        }
        oldInSwitch$1399 = state$845.inSwitch;
        state$845.inSwitch = true;
        defaultFound$1400 = false;
        while (streamIndex$842 < length$839) {
            if (match$886('}')) {
                break;
            }
            clause$1398 = parseSwitchCase$946();
            if (clause$1398.test === null) {
                if (defaultFound$1400) {
                    throwError$881({}, Messages$826.MultipleDefaultsInSwitch);
                }
                defaultFound$1400 = true;
            }
            cases$1397.push(clause$1398);
        }
        state$845.inSwitch = oldInSwitch$1399;
        expect$884('}');
        return delegate$840.createSwitchStatement(discriminant$1396, cases$1397);
    }
    // 12.13 The throw statement
    function parseThrowStatement$948() {
        var argument$1401;
        expectKeyword$885('throw');
        if (peekLineTerminator$880()) {
            throwError$881({}, Messages$826.NewlineAfterThrow);
        }
        argument$1401 = parseExpression$921();
        consumeSemicolon$890();
        return delegate$840.createThrowStatement(argument$1401);
    }
    // 12.14 The try statement
    function parseCatchClause$949() {
        var param$1402, body$1403;
        expectKeyword$885('catch');
        expect$884('(');
        if (match$886(')')) {
            throwUnexpected$883(lookahead$843);
        }
        param$1402 = parseExpression$921();
        // 12.14.1
        if (strict$831 && param$1402.type === Syntax$824.Identifier && isRestrictedWord$858(param$1402.name)) {
            throwErrorTolerant$882({}, Messages$826.StrictCatchVariable);
        }
        expect$884(')');
        body$1403 = parseBlock$923();
        return delegate$840.createCatchClause(param$1402, body$1403);
    }
    function parseTryStatement$950() {
        var block$1404, handlers$1405 = [], finalizer$1406 = null;
        expectKeyword$885('try');
        block$1404 = parseBlock$923();
        if (matchKeyword$887('catch')) {
            handlers$1405.push(parseCatchClause$949());
        }
        if (matchKeyword$887('finally')) {
            lex$877();
            finalizer$1406 = parseBlock$923();
        }
        if (handlers$1405.length === 0 && !finalizer$1406) {
            throwError$881({}, Messages$826.NoCatchOrFinally);
        }
        return delegate$840.createTryStatement(block$1404, [], handlers$1405, finalizer$1406);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$951() {
        expectKeyword$885('debugger');
        consumeSemicolon$890();
        return delegate$840.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$952() {
        var type$1407 = lookahead$843.type, expr$1408, labeledBody$1409, key$1410;
        if (type$1407 === Token$821.EOF) {
            throwUnexpected$883(lookahead$843);
        }
        if (type$1407 === Token$821.Punctuator) {
            switch (lookahead$843.value) {
            case ';':
                return parseEmptyStatement$935();
            case '{':
                return parseBlock$923();
            case '(':
                return parseExpressionStatement$936();
            default:
                break;
            }
        }
        if (type$1407 === Token$821.Keyword) {
            switch (lookahead$843.value) {
            case 'break':
                return parseBreakStatement$943();
            case 'continue':
                return parseContinueStatement$942();
            case 'debugger':
                return parseDebuggerStatement$951();
            case 'do':
                return parseDoWhileStatement$938();
            case 'for':
                return parseForStatement$941();
            case 'function':
                return parseFunctionDeclaration$958();
            case 'class':
                return parseClassDeclaration$965();
            case 'if':
                return parseIfStatement$937();
            case 'return':
                return parseReturnStatement$944();
            case 'switch':
                return parseSwitchStatement$947();
            case 'throw':
                return parseThrowStatement$948();
            case 'try':
                return parseTryStatement$950();
            case 'var':
                return parseVariableStatement$927();
            case 'while':
                return parseWhileStatement$939();
            case 'with':
                return parseWithStatement$945();
            default:
                break;
            }
        }
        expr$1408 = parseExpression$921();
        // 12.12 Labelled Statements
        if (expr$1408.type === Syntax$824.Identifier && match$886(':')) {
            lex$877();
            key$1410 = '$' + expr$1408.name;
            if (Object.prototype.hasOwnProperty.call(state$845.labelSet, key$1410)) {
                throwError$881({}, Messages$826.Redeclaration, 'Label', expr$1408.name);
            }
            state$845.labelSet[key$1410] = true;
            labeledBody$1409 = parseStatement$952();
            delete state$845.labelSet[key$1410];
            return delegate$840.createLabeledStatement(expr$1408, labeledBody$1409);
        }
        consumeSemicolon$890();
        return delegate$840.createExpressionStatement(expr$1408);
    }
    // 13 Function Definition
    function parseConciseBody$953() {
        if (match$886('{')) {
            return parseFunctionSourceElements$954();
        }
        return parseAssignmentExpression$920();
    }
    function parseFunctionSourceElements$954() {
        var sourceElement$1411, sourceElements$1412 = [], token$1413, directive$1414, firstRestricted$1415, oldLabelSet$1416, oldInIteration$1417, oldInSwitch$1418, oldInFunctionBody$1419, oldParenthesizedCount$1420;
        expect$884('{');
        while (streamIndex$842 < length$839) {
            if (lookahead$843.type !== Token$821.StringLiteral) {
                break;
            }
            token$1413 = lookahead$843;
            sourceElement$1411 = parseSourceElement$967();
            sourceElements$1412.push(sourceElement$1411);
            if (sourceElement$1411.expression.type !== Syntax$824.Literal) {
                // this is not directive
                break;
            }
            directive$1414 = token$1413.value;
            if (directive$1414 === 'use strict') {
                strict$831 = true;
                if (firstRestricted$1415) {
                    throwErrorTolerant$882(firstRestricted$1415, Messages$826.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1415 && token$1413.octal) {
                    firstRestricted$1415 = token$1413;
                }
            }
        }
        oldLabelSet$1416 = state$845.labelSet;
        oldInIteration$1417 = state$845.inIteration;
        oldInSwitch$1418 = state$845.inSwitch;
        oldInFunctionBody$1419 = state$845.inFunctionBody;
        oldParenthesizedCount$1420 = state$845.parenthesizedCount;
        state$845.labelSet = {};
        state$845.inIteration = false;
        state$845.inSwitch = false;
        state$845.inFunctionBody = true;
        state$845.parenthesizedCount = 0;
        while (streamIndex$842 < length$839) {
            if (match$886('}')) {
                break;
            }
            sourceElement$1411 = parseSourceElement$967();
            if (typeof sourceElement$1411 === 'undefined') {
                break;
            }
            sourceElements$1412.push(sourceElement$1411);
        }
        expect$884('}');
        state$845.labelSet = oldLabelSet$1416;
        state$845.inIteration = oldInIteration$1417;
        state$845.inSwitch = oldInSwitch$1418;
        state$845.inFunctionBody = oldInFunctionBody$1419;
        state$845.parenthesizedCount = oldParenthesizedCount$1420;
        return delegate$840.createBlockStatement(sourceElements$1412);
    }
    function validateParam$955(options$1421, param$1422, name$1423) {
        var key$1424 = '$' + name$1423;
        if (strict$831) {
            if (isRestrictedWord$858(name$1423)) {
                options$1421.stricted = param$1422;
                options$1421.message = Messages$826.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1421.paramSet, key$1424)) {
                options$1421.stricted = param$1422;
                options$1421.message = Messages$826.StrictParamDupe;
            }
        } else if (!options$1421.firstRestricted) {
            if (isRestrictedWord$858(name$1423)) {
                options$1421.firstRestricted = param$1422;
                options$1421.message = Messages$826.StrictParamName;
            } else if (isStrictModeReservedWord$857(name$1423)) {
                options$1421.firstRestricted = param$1422;
                options$1421.message = Messages$826.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1421.paramSet, key$1424)) {
                options$1421.firstRestricted = param$1422;
                options$1421.message = Messages$826.StrictParamDupe;
            }
        }
        options$1421.paramSet[key$1424] = true;
    }
    function parseParam$956(options$1425) {
        var token$1426, rest$1427, param$1428, def$1429;
        token$1426 = lookahead$843;
        if (token$1426.value === '...') {
            token$1426 = lex$877();
            rest$1427 = true;
        }
        if (match$886('[')) {
            param$1428 = parseArrayInitialiser$893();
            reinterpretAsDestructuredParameter$917(options$1425, param$1428);
        } else if (match$886('{')) {
            if (rest$1427) {
                throwError$881({}, Messages$826.ObjectPatternAsRestParameter);
            }
            param$1428 = parseObjectInitialiser$898();
            reinterpretAsDestructuredParameter$917(options$1425, param$1428);
        } else {
            param$1428 = parseVariableIdentifier$924();
            validateParam$955(options$1425, token$1426, token$1426.value);
            if (match$886('=')) {
                if (rest$1427) {
                    throwErrorTolerant$882(lookahead$843, Messages$826.DefaultRestParameter);
                }
                lex$877();
                def$1429 = parseAssignmentExpression$920();
                ++options$1425.defaultCount;
            }
        }
        if (rest$1427) {
            if (!match$886(')')) {
                throwError$881({}, Messages$826.ParameterAfterRestParameter);
            }
            options$1425.rest = param$1428;
            return false;
        }
        options$1425.params.push(param$1428);
        options$1425.defaults.push(def$1429);
        return !match$886(')');
    }
    function parseParams$957(firstRestricted$1430) {
        var options$1431;
        options$1431 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1430
        };
        expect$884('(');
        if (!match$886(')')) {
            options$1431.paramSet = {};
            while (streamIndex$842 < length$839) {
                if (!parseParam$956(options$1431)) {
                    break;
                }
                expect$884(',');
            }
        }
        expect$884(')');
        if (options$1431.defaultCount === 0) {
            options$1431.defaults = [];
        }
        return options$1431;
    }
    function parseFunctionDeclaration$958() {
        var id$1432, body$1433, token$1434, tmp$1435, firstRestricted$1436, message$1437, previousStrict$1438, previousYieldAllowed$1439, generator$1440, expression$1441;
        expectKeyword$885('function');
        generator$1440 = false;
        if (match$886('*')) {
            lex$877();
            generator$1440 = true;
        }
        token$1434 = lookahead$843;
        id$1432 = parseVariableIdentifier$924();
        if (strict$831) {
            if (isRestrictedWord$858(token$1434.value)) {
                throwErrorTolerant$882(token$1434, Messages$826.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$858(token$1434.value)) {
                firstRestricted$1436 = token$1434;
                message$1437 = Messages$826.StrictFunctionName;
            } else if (isStrictModeReservedWord$857(token$1434.value)) {
                firstRestricted$1436 = token$1434;
                message$1437 = Messages$826.StrictReservedWord;
            }
        }
        tmp$1435 = parseParams$957(firstRestricted$1436);
        firstRestricted$1436 = tmp$1435.firstRestricted;
        if (tmp$1435.message) {
            message$1437 = tmp$1435.message;
        }
        previousStrict$1438 = strict$831;
        previousYieldAllowed$1439 = state$845.yieldAllowed;
        state$845.yieldAllowed = generator$1440;
        // here we redo some work in order to set 'expression'
        expression$1441 = !match$886('{');
        body$1433 = parseConciseBody$953();
        if (strict$831 && firstRestricted$1436) {
            throwError$881(firstRestricted$1436, message$1437);
        }
        if (strict$831 && tmp$1435.stricted) {
            throwErrorTolerant$882(tmp$1435.stricted, message$1437);
        }
        if (state$845.yieldAllowed && !state$845.yieldFound) {
            throwErrorTolerant$882({}, Messages$826.NoYieldInGenerator);
        }
        strict$831 = previousStrict$1438;
        state$845.yieldAllowed = previousYieldAllowed$1439;
        return delegate$840.createFunctionDeclaration(id$1432, tmp$1435.params, tmp$1435.defaults, body$1433, tmp$1435.rest, generator$1440, expression$1441);
    }
    function parseFunctionExpression$959() {
        var token$1442, id$1443 = null, firstRestricted$1444, message$1445, tmp$1446, body$1447, previousStrict$1448, previousYieldAllowed$1449, generator$1450, expression$1451;
        expectKeyword$885('function');
        generator$1450 = false;
        if (match$886('*')) {
            lex$877();
            generator$1450 = true;
        }
        if (!match$886('(')) {
            token$1442 = lookahead$843;
            id$1443 = parseVariableIdentifier$924();
            if (strict$831) {
                if (isRestrictedWord$858(token$1442.value)) {
                    throwErrorTolerant$882(token$1442, Messages$826.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$858(token$1442.value)) {
                    firstRestricted$1444 = token$1442;
                    message$1445 = Messages$826.StrictFunctionName;
                } else if (isStrictModeReservedWord$857(token$1442.value)) {
                    firstRestricted$1444 = token$1442;
                    message$1445 = Messages$826.StrictReservedWord;
                }
            }
        }
        tmp$1446 = parseParams$957(firstRestricted$1444);
        firstRestricted$1444 = tmp$1446.firstRestricted;
        if (tmp$1446.message) {
            message$1445 = tmp$1446.message;
        }
        previousStrict$1448 = strict$831;
        previousYieldAllowed$1449 = state$845.yieldAllowed;
        state$845.yieldAllowed = generator$1450;
        // here we redo some work in order to set 'expression'
        expression$1451 = !match$886('{');
        body$1447 = parseConciseBody$953();
        if (strict$831 && firstRestricted$1444) {
            throwError$881(firstRestricted$1444, message$1445);
        }
        if (strict$831 && tmp$1446.stricted) {
            throwErrorTolerant$882(tmp$1446.stricted, message$1445);
        }
        if (state$845.yieldAllowed && !state$845.yieldFound) {
            throwErrorTolerant$882({}, Messages$826.NoYieldInGenerator);
        }
        strict$831 = previousStrict$1448;
        state$845.yieldAllowed = previousYieldAllowed$1449;
        return delegate$840.createFunctionExpression(id$1443, tmp$1446.params, tmp$1446.defaults, body$1447, tmp$1446.rest, generator$1450, expression$1451);
    }
    function parseYieldExpression$960() {
        var delegateFlag$1452, expr$1453, previousYieldAllowed$1454;
        expectKeyword$885('yield');
        if (!state$845.yieldAllowed) {
            throwErrorTolerant$882({}, Messages$826.IllegalYield);
        }
        delegateFlag$1452 = false;
        if (match$886('*')) {
            lex$877();
            delegateFlag$1452 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1454 = state$845.yieldAllowed;
        state$845.yieldAllowed = false;
        expr$1453 = parseAssignmentExpression$920();
        state$845.yieldAllowed = previousYieldAllowed$1454;
        state$845.yieldFound = true;
        return delegate$840.createYieldExpression(expr$1453, delegateFlag$1452);
    }
    // 14 Classes
    function parseMethodDefinition$961(existingPropNames$1455) {
        var token$1456, key$1457, param$1458, propType$1459, isValidDuplicateProp$1460 = false;
        if (lookahead$843.value === 'static') {
            propType$1459 = ClassPropertyType$829.static;
            lex$877();
        } else {
            propType$1459 = ClassPropertyType$829.prototype;
        }
        if (match$886('*')) {
            lex$877();
            return delegate$840.createMethodDefinition(propType$1459, '', parseObjectPropertyKey$896(), parsePropertyMethodFunction$895({ generator: true }));
        }
        token$1456 = lookahead$843;
        key$1457 = parseObjectPropertyKey$896();
        if (token$1456.value === 'get' && !match$886('(')) {
            key$1457 = parseObjectPropertyKey$896();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1455[propType$1459].hasOwnProperty(key$1457.name)) {
                isValidDuplicateProp$1460 = existingPropNames$1455[propType$1459][key$1457.name].get === undefined && existingPropNames$1455[propType$1459][key$1457.name].data === undefined && existingPropNames$1455[propType$1459][key$1457.name].set !== undefined;
                if (!isValidDuplicateProp$1460) {
                    throwError$881(key$1457, Messages$826.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1455[propType$1459][key$1457.name] = {};
            }
            existingPropNames$1455[propType$1459][key$1457.name].get = true;
            expect$884('(');
            expect$884(')');
            return delegate$840.createMethodDefinition(propType$1459, 'get', key$1457, parsePropertyFunction$894({ generator: false }));
        }
        if (token$1456.value === 'set' && !match$886('(')) {
            key$1457 = parseObjectPropertyKey$896();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1455[propType$1459].hasOwnProperty(key$1457.name)) {
                isValidDuplicateProp$1460 = existingPropNames$1455[propType$1459][key$1457.name].set === undefined && existingPropNames$1455[propType$1459][key$1457.name].data === undefined && existingPropNames$1455[propType$1459][key$1457.name].get !== undefined;
                if (!isValidDuplicateProp$1460) {
                    throwError$881(key$1457, Messages$826.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1455[propType$1459][key$1457.name] = {};
            }
            existingPropNames$1455[propType$1459][key$1457.name].set = true;
            expect$884('(');
            token$1456 = lookahead$843;
            param$1458 = [parseVariableIdentifier$924()];
            expect$884(')');
            return delegate$840.createMethodDefinition(propType$1459, 'set', key$1457, parsePropertyFunction$894({
                params: param$1458,
                generator: false,
                name: token$1456
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1455[propType$1459].hasOwnProperty(key$1457.name)) {
            throwError$881(key$1457, Messages$826.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1455[propType$1459][key$1457.name] = {};
        }
        existingPropNames$1455[propType$1459][key$1457.name].data = true;
        return delegate$840.createMethodDefinition(propType$1459, '', key$1457, parsePropertyMethodFunction$895({ generator: false }));
    }
    function parseClassElement$962(existingProps$1461) {
        if (match$886(';')) {
            lex$877();
            return;
        }
        return parseMethodDefinition$961(existingProps$1461);
    }
    function parseClassBody$963() {
        var classElement$1462, classElements$1463 = [], existingProps$1464 = {};
        existingProps$1464[ClassPropertyType$829.static] = {};
        existingProps$1464[ClassPropertyType$829.prototype] = {};
        expect$884('{');
        while (streamIndex$842 < length$839) {
            if (match$886('}')) {
                break;
            }
            classElement$1462 = parseClassElement$962(existingProps$1464);
            if (typeof classElement$1462 !== 'undefined') {
                classElements$1463.push(classElement$1462);
            }
        }
        expect$884('}');
        return delegate$840.createClassBody(classElements$1463);
    }
    function parseClassExpression$964() {
        var id$1465, previousYieldAllowed$1466, superClass$1467 = null;
        expectKeyword$885('class');
        if (!matchKeyword$887('extends') && !match$886('{')) {
            id$1465 = parseVariableIdentifier$924();
        }
        if (matchKeyword$887('extends')) {
            expectKeyword$885('extends');
            previousYieldAllowed$1466 = state$845.yieldAllowed;
            state$845.yieldAllowed = false;
            superClass$1467 = parseAssignmentExpression$920();
            state$845.yieldAllowed = previousYieldAllowed$1466;
        }
        return delegate$840.createClassExpression(id$1465, superClass$1467, parseClassBody$963());
    }
    function parseClassDeclaration$965() {
        var id$1468, previousYieldAllowed$1469, superClass$1470 = null;
        expectKeyword$885('class');
        id$1468 = parseVariableIdentifier$924();
        if (matchKeyword$887('extends')) {
            expectKeyword$885('extends');
            previousYieldAllowed$1469 = state$845.yieldAllowed;
            state$845.yieldAllowed = false;
            superClass$1470 = parseAssignmentExpression$920();
            state$845.yieldAllowed = previousYieldAllowed$1469;
        }
        return delegate$840.createClassDeclaration(id$1468, superClass$1470, parseClassBody$963());
    }
    // 15 Program
    function matchModuleDeclaration$966() {
        var id$1471;
        if (matchContextualKeyword$888('module')) {
            id$1471 = lookahead2$879();
            return id$1471.type === Token$821.StringLiteral || id$1471.type === Token$821.Identifier;
        }
        return false;
    }
    function parseSourceElement$967() {
        if (lookahead$843.type === Token$821.Keyword) {
            switch (lookahead$843.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$928(lookahead$843.value);
            case 'function':
                return parseFunctionDeclaration$958();
            case 'export':
                return parseExportDeclaration$932();
            case 'import':
                return parseImportDeclaration$933();
            default:
                return parseStatement$952();
            }
        }
        if (matchModuleDeclaration$966()) {
            throwError$881({}, Messages$826.NestedModule);
        }
        if (lookahead$843.type !== Token$821.EOF) {
            return parseStatement$952();
        }
    }
    function parseProgramElement$968() {
        if (lookahead$843.type === Token$821.Keyword) {
            switch (lookahead$843.value) {
            case 'export':
                return parseExportDeclaration$932();
            case 'import':
                return parseImportDeclaration$933();
            }
        }
        if (matchModuleDeclaration$966()) {
            return parseModuleDeclaration$929();
        }
        return parseSourceElement$967();
    }
    function parseProgramElements$969() {
        var sourceElement$1472, sourceElements$1473 = [], token$1474, directive$1475, firstRestricted$1476;
        while (streamIndex$842 < length$839) {
            token$1474 = lookahead$843;
            if (token$1474.type !== Token$821.StringLiteral) {
                break;
            }
            sourceElement$1472 = parseProgramElement$968();
            sourceElements$1473.push(sourceElement$1472);
            if (sourceElement$1472.expression.type !== Syntax$824.Literal) {
                // this is not directive
                break;
            }
            assert$847(false, 'directive isn\'t right');
            directive$1475 = source$830.slice(token$1474.range[0] + 1, token$1474.range[1] - 1);
            if (directive$1475 === 'use strict') {
                strict$831 = true;
                if (firstRestricted$1476) {
                    throwErrorTolerant$882(firstRestricted$1476, Messages$826.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1476 && token$1474.octal) {
                    firstRestricted$1476 = token$1474;
                }
            }
        }
        while (streamIndex$842 < length$839) {
            sourceElement$1472 = parseProgramElement$968();
            if (typeof sourceElement$1472 === 'undefined') {
                break;
            }
            sourceElements$1473.push(sourceElement$1472);
        }
        return sourceElements$1473;
    }
    function parseModuleElement$970() {
        return parseSourceElement$967();
    }
    function parseModuleElements$971() {
        var list$1477 = [], statement$1478;
        while (streamIndex$842 < length$839) {
            if (match$886('}')) {
                break;
            }
            statement$1478 = parseModuleElement$970();
            if (typeof statement$1478 === 'undefined') {
                break;
            }
            list$1477.push(statement$1478);
        }
        return list$1477;
    }
    function parseModuleBlock$972() {
        var block$1479;
        expect$884('{');
        block$1479 = parseModuleElements$971();
        expect$884('}');
        return delegate$840.createBlockStatement(block$1479);
    }
    function parseProgram$973() {
        var body$1480;
        strict$831 = false;
        peek$878();
        body$1480 = parseProgramElements$969();
        return delegate$840.createProgram(body$1480);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$974(type$1481, value$1482, start$1483, end$1484, loc$1485) {
        assert$847(typeof start$1483 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$846.comments.length > 0) {
            if (extra$846.comments[extra$846.comments.length - 1].range[1] > start$1483) {
                return;
            }
        }
        extra$846.comments.push({
            type: type$1481,
            value: value$1482,
            range: [
                start$1483,
                end$1484
            ],
            loc: loc$1485
        });
    }
    function scanComment$975() {
        var comment$1486, ch$1487, loc$1488, start$1489, blockComment$1490, lineComment$1491;
        comment$1486 = '';
        blockComment$1490 = false;
        lineComment$1491 = false;
        while (index$832 < length$839) {
            ch$1487 = source$830[index$832];
            if (lineComment$1491) {
                ch$1487 = source$830[index$832++];
                if (isLineTerminator$853(ch$1487.charCodeAt(0))) {
                    loc$1488.end = {
                        line: lineNumber$833,
                        column: index$832 - lineStart$834 - 1
                    };
                    lineComment$1491 = false;
                    addComment$974('Line', comment$1486, start$1489, index$832 - 1, loc$1488);
                    if (ch$1487 === '\r' && source$830[index$832] === '\n') {
                        ++index$832;
                    }
                    ++lineNumber$833;
                    lineStart$834 = index$832;
                    comment$1486 = '';
                } else if (index$832 >= length$839) {
                    lineComment$1491 = false;
                    comment$1486 += ch$1487;
                    loc$1488.end = {
                        line: lineNumber$833,
                        column: length$839 - lineStart$834
                    };
                    addComment$974('Line', comment$1486, start$1489, length$839, loc$1488);
                } else {
                    comment$1486 += ch$1487;
                }
            } else if (blockComment$1490) {
                if (isLineTerminator$853(ch$1487.charCodeAt(0))) {
                    if (ch$1487 === '\r' && source$830[index$832 + 1] === '\n') {
                        ++index$832;
                        comment$1486 += '\r\n';
                    } else {
                        comment$1486 += ch$1487;
                    }
                    ++lineNumber$833;
                    ++index$832;
                    lineStart$834 = index$832;
                    if (index$832 >= length$839) {
                        throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1487 = source$830[index$832++];
                    if (index$832 >= length$839) {
                        throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1486 += ch$1487;
                    if (ch$1487 === '*') {
                        ch$1487 = source$830[index$832];
                        if (ch$1487 === '/') {
                            comment$1486 = comment$1486.substr(0, comment$1486.length - 1);
                            blockComment$1490 = false;
                            ++index$832;
                            loc$1488.end = {
                                line: lineNumber$833,
                                column: index$832 - lineStart$834
                            };
                            addComment$974('Block', comment$1486, start$1489, index$832, loc$1488);
                            comment$1486 = '';
                        }
                    }
                }
            } else if (ch$1487 === '/') {
                ch$1487 = source$830[index$832 + 1];
                if (ch$1487 === '/') {
                    loc$1488 = {
                        start: {
                            line: lineNumber$833,
                            column: index$832 - lineStart$834
                        }
                    };
                    start$1489 = index$832;
                    index$832 += 2;
                    lineComment$1491 = true;
                    if (index$832 >= length$839) {
                        loc$1488.end = {
                            line: lineNumber$833,
                            column: index$832 - lineStart$834
                        };
                        lineComment$1491 = false;
                        addComment$974('Line', comment$1486, start$1489, index$832, loc$1488);
                    }
                } else if (ch$1487 === '*') {
                    start$1489 = index$832;
                    index$832 += 2;
                    blockComment$1490 = true;
                    loc$1488 = {
                        start: {
                            line: lineNumber$833,
                            column: index$832 - lineStart$834 - 2
                        }
                    };
                    if (index$832 >= length$839) {
                        throwError$881({}, Messages$826.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$852(ch$1487.charCodeAt(0))) {
                ++index$832;
            } else if (isLineTerminator$853(ch$1487.charCodeAt(0))) {
                ++index$832;
                if (ch$1487 === '\r' && source$830[index$832] === '\n') {
                    ++index$832;
                }
                ++lineNumber$833;
                lineStart$834 = index$832;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$976() {
        var i$1492, entry$1493, comment$1494, comments$1495 = [];
        for (i$1492 = 0; i$1492 < extra$846.comments.length; ++i$1492) {
            entry$1493 = extra$846.comments[i$1492];
            comment$1494 = {
                type: entry$1493.type,
                value: entry$1493.value
            };
            if (extra$846.range) {
                comment$1494.range = entry$1493.range;
            }
            if (extra$846.loc) {
                comment$1494.loc = entry$1493.loc;
            }
            comments$1495.push(comment$1494);
        }
        extra$846.comments = comments$1495;
    }
    function collectToken$977() {
        var start$1496, loc$1497, token$1498, range$1499, value$1500;
        skipComment$860();
        start$1496 = index$832;
        loc$1497 = {
            start: {
                line: lineNumber$833,
                column: index$832 - lineStart$834
            }
        };
        token$1498 = extra$846.advance();
        loc$1497.end = {
            line: lineNumber$833,
            column: index$832 - lineStart$834
        };
        if (token$1498.type !== Token$821.EOF) {
            range$1499 = [
                token$1498.range[0],
                token$1498.range[1]
            ];
            value$1500 = source$830.slice(token$1498.range[0], token$1498.range[1]);
            extra$846.tokens.push({
                type: TokenName$822[token$1498.type],
                value: value$1500,
                range: range$1499,
                loc: loc$1497
            });
        }
        return token$1498;
    }
    function collectRegex$978() {
        var pos$1501, loc$1502, regex$1503, token$1504;
        skipComment$860();
        pos$1501 = index$832;
        loc$1502 = {
            start: {
                line: lineNumber$833,
                column: index$832 - lineStart$834
            }
        };
        regex$1503 = extra$846.scanRegExp();
        loc$1502.end = {
            line: lineNumber$833,
            column: index$832 - lineStart$834
        };
        if (!extra$846.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$846.tokens.length > 0) {
                token$1504 = extra$846.tokens[extra$846.tokens.length - 1];
                if (token$1504.range[0] === pos$1501 && token$1504.type === 'Punctuator') {
                    if (token$1504.value === '/' || token$1504.value === '/=') {
                        extra$846.tokens.pop();
                    }
                }
            }
            extra$846.tokens.push({
                type: 'RegularExpression',
                value: regex$1503.literal,
                range: [
                    pos$1501,
                    index$832
                ],
                loc: loc$1502
            });
        }
        return regex$1503;
    }
    function filterTokenLocation$979() {
        var i$1505, entry$1506, token$1507, tokens$1508 = [];
        for (i$1505 = 0; i$1505 < extra$846.tokens.length; ++i$1505) {
            entry$1506 = extra$846.tokens[i$1505];
            token$1507 = {
                type: entry$1506.type,
                value: entry$1506.value
            };
            if (extra$846.range) {
                token$1507.range = entry$1506.range;
            }
            if (extra$846.loc) {
                token$1507.loc = entry$1506.loc;
            }
            tokens$1508.push(token$1507);
        }
        extra$846.tokens = tokens$1508;
    }
    function LocationMarker$980() {
        var sm_index$1509 = lookahead$843 ? lookahead$843.sm_range[0] : 0;
        var sm_lineStart$1510 = lookahead$843 ? lookahead$843.sm_lineStart : 0;
        var sm_lineNumber$1511 = lookahead$843 ? lookahead$843.sm_lineNumber : 1;
        this.range = [
            sm_index$1509,
            sm_index$1509
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1511,
                column: sm_index$1509 - sm_lineStart$1510
            },
            end: {
                line: sm_lineNumber$1511,
                column: sm_index$1509 - sm_lineStart$1510
            }
        };
    }
    LocationMarker$980.prototype = {
        constructor: LocationMarker$980,
        end: function () {
            this.range[1] = sm_index$838;
            this.loc.end.line = sm_lineNumber$835;
            this.loc.end.column = sm_index$838 - sm_lineStart$836;
        },
        applyGroup: function (node$1512) {
            if (extra$846.range) {
                node$1512.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$846.loc) {
                node$1512.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1512 = delegate$840.postProcess(node$1512);
            }
        },
        apply: function (node$1513) {
            var nodeType$1514 = typeof node$1513;
            assert$847(nodeType$1514 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1514);
            if (extra$846.range) {
                node$1513.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$846.loc) {
                node$1513.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1513 = delegate$840.postProcess(node$1513);
            }
        }
    };
    function createLocationMarker$981() {
        return new LocationMarker$980();
    }
    function trackGroupExpression$982() {
        var marker$1515, expr$1516;
        marker$1515 = createLocationMarker$981();
        expect$884('(');
        ++state$845.parenthesizedCount;
        expr$1516 = parseExpression$921();
        expect$884(')');
        marker$1515.end();
        marker$1515.applyGroup(expr$1516);
        return expr$1516;
    }
    function trackLeftHandSideExpression$983() {
        var marker$1517, expr$1518;
        // skipComment();
        marker$1517 = createLocationMarker$981();
        expr$1518 = matchKeyword$887('new') ? parseNewExpression$908() : parsePrimaryExpression$902();
        while (match$886('.') || match$886('[') || lookahead$843.type === Token$821.Template) {
            if (match$886('[')) {
                expr$1518 = delegate$840.createMemberExpression('[', expr$1518, parseComputedMember$907());
                marker$1517.end();
                marker$1517.apply(expr$1518);
            } else if (match$886('.')) {
                expr$1518 = delegate$840.createMemberExpression('.', expr$1518, parseNonComputedMember$906());
                marker$1517.end();
                marker$1517.apply(expr$1518);
            } else {
                expr$1518 = delegate$840.createTaggedTemplateExpression(expr$1518, parseTemplateLiteral$900());
                marker$1517.end();
                marker$1517.apply(expr$1518);
            }
        }
        return expr$1518;
    }
    function trackLeftHandSideExpressionAllowCall$984() {
        var marker$1519, expr$1520, args$1521;
        // skipComment();
        marker$1519 = createLocationMarker$981();
        expr$1520 = matchKeyword$887('new') ? parseNewExpression$908() : parsePrimaryExpression$902();
        while (match$886('.') || match$886('[') || match$886('(') || lookahead$843.type === Token$821.Template) {
            if (match$886('(')) {
                args$1521 = parseArguments$903();
                expr$1520 = delegate$840.createCallExpression(expr$1520, args$1521);
                marker$1519.end();
                marker$1519.apply(expr$1520);
            } else if (match$886('[')) {
                expr$1520 = delegate$840.createMemberExpression('[', expr$1520, parseComputedMember$907());
                marker$1519.end();
                marker$1519.apply(expr$1520);
            } else if (match$886('.')) {
                expr$1520 = delegate$840.createMemberExpression('.', expr$1520, parseNonComputedMember$906());
                marker$1519.end();
                marker$1519.apply(expr$1520);
            } else {
                expr$1520 = delegate$840.createTaggedTemplateExpression(expr$1520, parseTemplateLiteral$900());
                marker$1519.end();
                marker$1519.apply(expr$1520);
            }
        }
        return expr$1520;
    }
    function filterGroup$985(node$1522) {
        var n$1523, i$1524, entry$1525;
        n$1523 = Object.prototype.toString.apply(node$1522) === '[object Array]' ? [] : {};
        for (i$1524 in node$1522) {
            if (node$1522.hasOwnProperty(i$1524) && i$1524 !== 'groupRange' && i$1524 !== 'groupLoc') {
                entry$1525 = node$1522[i$1524];
                if (entry$1525 === null || typeof entry$1525 !== 'object' || entry$1525 instanceof RegExp) {
                    n$1523[i$1524] = entry$1525;
                } else {
                    n$1523[i$1524] = filterGroup$985(entry$1525);
                }
            }
        }
        return n$1523;
    }
    function wrapTrackingFunction$986(range$1526, loc$1527) {
        return function (parseFunction$1528) {
            function isBinary$1529(node$1531) {
                return node$1531.type === Syntax$824.LogicalExpression || node$1531.type === Syntax$824.BinaryExpression;
            }
            function visit$1530(node$1532) {
                var start$1533, end$1534;
                if (isBinary$1529(node$1532.left)) {
                    visit$1530(node$1532.left);
                }
                if (isBinary$1529(node$1532.right)) {
                    visit$1530(node$1532.right);
                }
                if (range$1526) {
                    if (node$1532.left.groupRange || node$1532.right.groupRange) {
                        start$1533 = node$1532.left.groupRange ? node$1532.left.groupRange[0] : node$1532.left.range[0];
                        end$1534 = node$1532.right.groupRange ? node$1532.right.groupRange[1] : node$1532.right.range[1];
                        node$1532.range = [
                            start$1533,
                            end$1534
                        ];
                    } else if (typeof node$1532.range === 'undefined') {
                        start$1533 = node$1532.left.range[0];
                        end$1534 = node$1532.right.range[1];
                        node$1532.range = [
                            start$1533,
                            end$1534
                        ];
                    }
                }
                if (loc$1527) {
                    if (node$1532.left.groupLoc || node$1532.right.groupLoc) {
                        start$1533 = node$1532.left.groupLoc ? node$1532.left.groupLoc.start : node$1532.left.loc.start;
                        end$1534 = node$1532.right.groupLoc ? node$1532.right.groupLoc.end : node$1532.right.loc.end;
                        node$1532.loc = {
                            start: start$1533,
                            end: end$1534
                        };
                        node$1532 = delegate$840.postProcess(node$1532);
                    } else if (typeof node$1532.loc === 'undefined') {
                        node$1532.loc = {
                            start: node$1532.left.loc.start,
                            end: node$1532.right.loc.end
                        };
                        node$1532 = delegate$840.postProcess(node$1532);
                    }
                }
            }
            return function () {
                var marker$1535, node$1536, curr$1537 = lookahead$843;
                marker$1535 = createLocationMarker$981();
                node$1536 = parseFunction$1528.apply(null, arguments);
                marker$1535.end();
                if (node$1536.type !== Syntax$824.Program) {
                    if (curr$1537.leadingComments) {
                        node$1536.leadingComments = curr$1537.leadingComments;
                    }
                    if (curr$1537.trailingComments) {
                        node$1536.trailingComments = curr$1537.trailingComments;
                    }
                }
                if (range$1526 && typeof node$1536.range === 'undefined') {
                    marker$1535.apply(node$1536);
                }
                if (loc$1527 && typeof node$1536.loc === 'undefined') {
                    marker$1535.apply(node$1536);
                }
                if (isBinary$1529(node$1536)) {
                    visit$1530(node$1536);
                }
                return node$1536;
            };
        };
    }
    function patch$987() {
        var wrapTracking$1538;
        if (extra$846.comments) {
            extra$846.skipComment = skipComment$860;
            skipComment$860 = scanComment$975;
        }
        if (extra$846.range || extra$846.loc) {
            extra$846.parseGroupExpression = parseGroupExpression$901;
            extra$846.parseLeftHandSideExpression = parseLeftHandSideExpression$910;
            extra$846.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$909;
            parseGroupExpression$901 = trackGroupExpression$982;
            parseLeftHandSideExpression$910 = trackLeftHandSideExpression$983;
            parseLeftHandSideExpressionAllowCall$909 = trackLeftHandSideExpressionAllowCall$984;
            wrapTracking$1538 = wrapTrackingFunction$986(extra$846.range, extra$846.loc);
            extra$846.parseArrayInitialiser = parseArrayInitialiser$893;
            extra$846.parseAssignmentExpression = parseAssignmentExpression$920;
            extra$846.parseBinaryExpression = parseBinaryExpression$914;
            extra$846.parseBlock = parseBlock$923;
            extra$846.parseFunctionSourceElements = parseFunctionSourceElements$954;
            extra$846.parseCatchClause = parseCatchClause$949;
            extra$846.parseComputedMember = parseComputedMember$907;
            extra$846.parseConditionalExpression = parseConditionalExpression$915;
            extra$846.parseConstLetDeclaration = parseConstLetDeclaration$928;
            extra$846.parseExportBatchSpecifier = parseExportBatchSpecifier$930;
            extra$846.parseExportDeclaration = parseExportDeclaration$932;
            extra$846.parseExportSpecifier = parseExportSpecifier$931;
            extra$846.parseExpression = parseExpression$921;
            extra$846.parseForVariableDeclaration = parseForVariableDeclaration$940;
            extra$846.parseFunctionDeclaration = parseFunctionDeclaration$958;
            extra$846.parseFunctionExpression = parseFunctionExpression$959;
            extra$846.parseParams = parseParams$957;
            extra$846.parseImportDeclaration = parseImportDeclaration$933;
            extra$846.parseImportSpecifier = parseImportSpecifier$934;
            extra$846.parseModuleDeclaration = parseModuleDeclaration$929;
            extra$846.parseModuleBlock = parseModuleBlock$972;
            extra$846.parseNewExpression = parseNewExpression$908;
            extra$846.parseNonComputedProperty = parseNonComputedProperty$905;
            extra$846.parseObjectInitialiser = parseObjectInitialiser$898;
            extra$846.parseObjectProperty = parseObjectProperty$897;
            extra$846.parseObjectPropertyKey = parseObjectPropertyKey$896;
            extra$846.parsePostfixExpression = parsePostfixExpression$911;
            extra$846.parsePrimaryExpression = parsePrimaryExpression$902;
            extra$846.parseProgram = parseProgram$973;
            extra$846.parsePropertyFunction = parsePropertyFunction$894;
            extra$846.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$904;
            extra$846.parseTemplateElement = parseTemplateElement$899;
            extra$846.parseTemplateLiteral = parseTemplateLiteral$900;
            extra$846.parseStatement = parseStatement$952;
            extra$846.parseSwitchCase = parseSwitchCase$946;
            extra$846.parseUnaryExpression = parseUnaryExpression$912;
            extra$846.parseVariableDeclaration = parseVariableDeclaration$925;
            extra$846.parseVariableIdentifier = parseVariableIdentifier$924;
            extra$846.parseMethodDefinition = parseMethodDefinition$961;
            extra$846.parseClassDeclaration = parseClassDeclaration$965;
            extra$846.parseClassExpression = parseClassExpression$964;
            extra$846.parseClassBody = parseClassBody$963;
            parseArrayInitialiser$893 = wrapTracking$1538(extra$846.parseArrayInitialiser);
            parseAssignmentExpression$920 = wrapTracking$1538(extra$846.parseAssignmentExpression);
            parseBinaryExpression$914 = wrapTracking$1538(extra$846.parseBinaryExpression);
            parseBlock$923 = wrapTracking$1538(extra$846.parseBlock);
            parseFunctionSourceElements$954 = wrapTracking$1538(extra$846.parseFunctionSourceElements);
            parseCatchClause$949 = wrapTracking$1538(extra$846.parseCatchClause);
            parseComputedMember$907 = wrapTracking$1538(extra$846.parseComputedMember);
            parseConditionalExpression$915 = wrapTracking$1538(extra$846.parseConditionalExpression);
            parseConstLetDeclaration$928 = wrapTracking$1538(extra$846.parseConstLetDeclaration);
            parseExportBatchSpecifier$930 = wrapTracking$1538(parseExportBatchSpecifier$930);
            parseExportDeclaration$932 = wrapTracking$1538(parseExportDeclaration$932);
            parseExportSpecifier$931 = wrapTracking$1538(parseExportSpecifier$931);
            parseExpression$921 = wrapTracking$1538(extra$846.parseExpression);
            parseForVariableDeclaration$940 = wrapTracking$1538(extra$846.parseForVariableDeclaration);
            parseFunctionDeclaration$958 = wrapTracking$1538(extra$846.parseFunctionDeclaration);
            parseFunctionExpression$959 = wrapTracking$1538(extra$846.parseFunctionExpression);
            parseParams$957 = wrapTracking$1538(extra$846.parseParams);
            parseImportDeclaration$933 = wrapTracking$1538(extra$846.parseImportDeclaration);
            parseImportSpecifier$934 = wrapTracking$1538(extra$846.parseImportSpecifier);
            parseModuleDeclaration$929 = wrapTracking$1538(extra$846.parseModuleDeclaration);
            parseModuleBlock$972 = wrapTracking$1538(extra$846.parseModuleBlock);
            parseLeftHandSideExpression$910 = wrapTracking$1538(parseLeftHandSideExpression$910);
            parseNewExpression$908 = wrapTracking$1538(extra$846.parseNewExpression);
            parseNonComputedProperty$905 = wrapTracking$1538(extra$846.parseNonComputedProperty);
            parseObjectInitialiser$898 = wrapTracking$1538(extra$846.parseObjectInitialiser);
            parseObjectProperty$897 = wrapTracking$1538(extra$846.parseObjectProperty);
            parseObjectPropertyKey$896 = wrapTracking$1538(extra$846.parseObjectPropertyKey);
            parsePostfixExpression$911 = wrapTracking$1538(extra$846.parsePostfixExpression);
            parsePrimaryExpression$902 = wrapTracking$1538(extra$846.parsePrimaryExpression);
            parseProgram$973 = wrapTracking$1538(extra$846.parseProgram);
            parsePropertyFunction$894 = wrapTracking$1538(extra$846.parsePropertyFunction);
            parseTemplateElement$899 = wrapTracking$1538(extra$846.parseTemplateElement);
            parseTemplateLiteral$900 = wrapTracking$1538(extra$846.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$904 = wrapTracking$1538(extra$846.parseSpreadOrAssignmentExpression);
            parseStatement$952 = wrapTracking$1538(extra$846.parseStatement);
            parseSwitchCase$946 = wrapTracking$1538(extra$846.parseSwitchCase);
            parseUnaryExpression$912 = wrapTracking$1538(extra$846.parseUnaryExpression);
            parseVariableDeclaration$925 = wrapTracking$1538(extra$846.parseVariableDeclaration);
            parseVariableIdentifier$924 = wrapTracking$1538(extra$846.parseVariableIdentifier);
            parseMethodDefinition$961 = wrapTracking$1538(extra$846.parseMethodDefinition);
            parseClassDeclaration$965 = wrapTracking$1538(extra$846.parseClassDeclaration);
            parseClassExpression$964 = wrapTracking$1538(extra$846.parseClassExpression);
            parseClassBody$963 = wrapTracking$1538(extra$846.parseClassBody);
        }
        if (typeof extra$846.tokens !== 'undefined') {
            extra$846.advance = advance$876;
            extra$846.scanRegExp = scanRegExp$873;
            advance$876 = collectToken$977;
            scanRegExp$873 = collectRegex$978;
        }
    }
    function unpatch$988() {
        if (typeof extra$846.skipComment === 'function') {
            skipComment$860 = extra$846.skipComment;
        }
        if (extra$846.range || extra$846.loc) {
            parseArrayInitialiser$893 = extra$846.parseArrayInitialiser;
            parseAssignmentExpression$920 = extra$846.parseAssignmentExpression;
            parseBinaryExpression$914 = extra$846.parseBinaryExpression;
            parseBlock$923 = extra$846.parseBlock;
            parseFunctionSourceElements$954 = extra$846.parseFunctionSourceElements;
            parseCatchClause$949 = extra$846.parseCatchClause;
            parseComputedMember$907 = extra$846.parseComputedMember;
            parseConditionalExpression$915 = extra$846.parseConditionalExpression;
            parseConstLetDeclaration$928 = extra$846.parseConstLetDeclaration;
            parseExportBatchSpecifier$930 = extra$846.parseExportBatchSpecifier;
            parseExportDeclaration$932 = extra$846.parseExportDeclaration;
            parseExportSpecifier$931 = extra$846.parseExportSpecifier;
            parseExpression$921 = extra$846.parseExpression;
            parseForVariableDeclaration$940 = extra$846.parseForVariableDeclaration;
            parseFunctionDeclaration$958 = extra$846.parseFunctionDeclaration;
            parseFunctionExpression$959 = extra$846.parseFunctionExpression;
            parseImportDeclaration$933 = extra$846.parseImportDeclaration;
            parseImportSpecifier$934 = extra$846.parseImportSpecifier;
            parseGroupExpression$901 = extra$846.parseGroupExpression;
            parseLeftHandSideExpression$910 = extra$846.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$909 = extra$846.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$929 = extra$846.parseModuleDeclaration;
            parseModuleBlock$972 = extra$846.parseModuleBlock;
            parseNewExpression$908 = extra$846.parseNewExpression;
            parseNonComputedProperty$905 = extra$846.parseNonComputedProperty;
            parseObjectInitialiser$898 = extra$846.parseObjectInitialiser;
            parseObjectProperty$897 = extra$846.parseObjectProperty;
            parseObjectPropertyKey$896 = extra$846.parseObjectPropertyKey;
            parsePostfixExpression$911 = extra$846.parsePostfixExpression;
            parsePrimaryExpression$902 = extra$846.parsePrimaryExpression;
            parseProgram$973 = extra$846.parseProgram;
            parsePropertyFunction$894 = extra$846.parsePropertyFunction;
            parseTemplateElement$899 = extra$846.parseTemplateElement;
            parseTemplateLiteral$900 = extra$846.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$904 = extra$846.parseSpreadOrAssignmentExpression;
            parseStatement$952 = extra$846.parseStatement;
            parseSwitchCase$946 = extra$846.parseSwitchCase;
            parseUnaryExpression$912 = extra$846.parseUnaryExpression;
            parseVariableDeclaration$925 = extra$846.parseVariableDeclaration;
            parseVariableIdentifier$924 = extra$846.parseVariableIdentifier;
            parseMethodDefinition$961 = extra$846.parseMethodDefinition;
            parseClassDeclaration$965 = extra$846.parseClassDeclaration;
            parseClassExpression$964 = extra$846.parseClassExpression;
            parseClassBody$963 = extra$846.parseClassBody;
        }
        if (typeof extra$846.scanRegExp === 'function') {
            advance$876 = extra$846.advance;
            scanRegExp$873 = extra$846.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$989(object$1539, properties$1540) {
        var entry$1541, result$1542 = {};
        for (entry$1541 in object$1539) {
            if (object$1539.hasOwnProperty(entry$1541)) {
                result$1542[entry$1541] = object$1539[entry$1541];
            }
        }
        for (entry$1541 in properties$1540) {
            if (properties$1540.hasOwnProperty(entry$1541)) {
                result$1542[entry$1541] = properties$1540[entry$1541];
            }
        }
        return result$1542;
    }
    function tokenize$990(code$1543, options$1544) {
        var toString$1545, token$1546, tokens$1547;
        toString$1545 = String;
        if (typeof code$1543 !== 'string' && !(code$1543 instanceof String)) {
            code$1543 = toString$1545(code$1543);
        }
        delegate$840 = SyntaxTreeDelegate$828;
        source$830 = code$1543;
        index$832 = 0;
        lineNumber$833 = source$830.length > 0 ? 1 : 0;
        lineStart$834 = 0;
        length$839 = source$830.length;
        lookahead$843 = null;
        state$845 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$846 = {};
        // Options matching.
        options$1544 = options$1544 || {};
        // Of course we collect tokens here.
        options$1544.tokens = true;
        extra$846.tokens = [];
        extra$846.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$846.openParenToken = -1;
        extra$846.openCurlyToken = -1;
        extra$846.range = typeof options$1544.range === 'boolean' && options$1544.range;
        extra$846.loc = typeof options$1544.loc === 'boolean' && options$1544.loc;
        if (typeof options$1544.comment === 'boolean' && options$1544.comment) {
            extra$846.comments = [];
        }
        if (typeof options$1544.tolerant === 'boolean' && options$1544.tolerant) {
            extra$846.errors = [];
        }
        if (length$839 > 0) {
            if (typeof source$830[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1543 instanceof String) {
                    source$830 = code$1543.valueOf();
                }
            }
        }
        patch$987();
        try {
            peek$878();
            if (lookahead$843.type === Token$821.EOF) {
                return extra$846.tokens;
            }
            token$1546 = lex$877();
            while (lookahead$843.type !== Token$821.EOF) {
                try {
                    token$1546 = lex$877();
                } catch (lexError$1548) {
                    token$1546 = lookahead$843;
                    if (extra$846.errors) {
                        extra$846.errors.push(lexError$1548);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1548;
                    }
                }
            }
            filterTokenLocation$979();
            tokens$1547 = extra$846.tokens;
            if (typeof extra$846.comments !== 'undefined') {
                filterCommentLocation$976();
                tokens$1547.comments = extra$846.comments;
            }
            if (typeof extra$846.errors !== 'undefined') {
                tokens$1547.errors = extra$846.errors;
            }
        } catch (e$1549) {
            throw e$1549;
        } finally {
            unpatch$988();
            extra$846 = {};
        }
        return tokens$1547;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$991(toks$1550, start$1551, inExprDelim$1552, parentIsBlock$1553) {
        var assignOps$1554 = [
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
        var binaryOps$1555 = [
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
        var unaryOps$1556 = [
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
        function back$1557(n$1558) {
            var idx$1559 = toks$1550.length - n$1558 > 0 ? toks$1550.length - n$1558 : 0;
            return toks$1550[idx$1559];
        }
        if (inExprDelim$1552 && toks$1550.length - (start$1551 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1557(start$1551 + 2).value === ':' && parentIsBlock$1553) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$848(back$1557(start$1551 + 2).value, unaryOps$1556.concat(binaryOps$1555).concat(assignOps$1554))) {
            // ... + {...}
            return false;
        } else if (back$1557(start$1551 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1560 = typeof back$1557(start$1551 + 1).startLineNumber !== 'undefined' ? back$1557(start$1551 + 1).startLineNumber : back$1557(start$1551 + 1).lineNumber;
            if (back$1557(start$1551 + 2).lineNumber !== currLineNumber$1560) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$848(back$1557(start$1551 + 2).value, [
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
    function readToken$992(toks$1561, inExprDelim$1562, parentIsBlock$1563) {
        var delimiters$1564 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1565 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1566 = toks$1561.length - 1;
        var comments$1567, commentsLen$1568 = extra$846.comments.length;
        function back$1569(n$1573) {
            var idx$1574 = toks$1561.length - n$1573 > 0 ? toks$1561.length - n$1573 : 0;
            return toks$1561[idx$1574];
        }
        function attachComments$1570(token$1575) {
            if (comments$1567) {
                token$1575.leadingComments = comments$1567;
            }
            return token$1575;
        }
        function _advance$1571() {
            return attachComments$1570(advance$876());
        }
        function _scanRegExp$1572() {
            return attachComments$1570(scanRegExp$873());
        }
        skipComment$860();
        if (extra$846.comments.length > commentsLen$1568) {
            comments$1567 = extra$846.comments.slice(commentsLen$1568);
        }
        if (isIn$848(source$830[index$832], delimiters$1564)) {
            return attachComments$1570(readDelim$993(toks$1561, inExprDelim$1562, parentIsBlock$1563));
        }
        if (source$830[index$832] === '/') {
            var prev$1576 = back$1569(1);
            if (prev$1576) {
                if (prev$1576.value === '()') {
                    if (isIn$848(back$1569(2).value, parenIdents$1565)) {
                        // ... if (...) / ...
                        return _scanRegExp$1572();
                    }
                    // ... (...) / ...
                    return _advance$1571();
                }
                if (prev$1576.value === '{}') {
                    if (blockAllowed$991(toks$1561, 0, inExprDelim$1562, parentIsBlock$1563)) {
                        if (back$1569(2).value === '()') {
                            // named function
                            if (back$1569(4).value === 'function') {
                                if (!blockAllowed$991(toks$1561, 3, inExprDelim$1562, parentIsBlock$1563)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1571();
                                }
                                if (toks$1561.length - 5 <= 0 && inExprDelim$1562) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1571();
                                }
                            }
                            // unnamed function
                            if (back$1569(3).value === 'function') {
                                if (!blockAllowed$991(toks$1561, 2, inExprDelim$1562, parentIsBlock$1563)) {
                                    // new function (...) {...} / ...
                                    return _advance$1571();
                                }
                                if (toks$1561.length - 4 <= 0 && inExprDelim$1562) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1571();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1572();
                    } else {
                        // ... + {...} / ...
                        return _advance$1571();
                    }
                }
                if (prev$1576.type === Token$821.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1572();
                }
                if (isKeyword$859(prev$1576.value)) {
                    // typeof /...
                    return _scanRegExp$1572();
                }
                return _advance$1571();
            }
            return _scanRegExp$1572();
        }
        return _advance$1571();
    }
    function readDelim$993(toks$1577, inExprDelim$1578, parentIsBlock$1579) {
        var startDelim$1580 = advance$876(), matchDelim$1581 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1582 = [];
        var delimiters$1583 = [
                '(',
                '{',
                '['
            ];
        assert$847(delimiters$1583.indexOf(startDelim$1580.value) !== -1, 'Need to begin at the delimiter');
        var token$1584 = startDelim$1580;
        var startLineNumber$1585 = token$1584.lineNumber;
        var startLineStart$1586 = token$1584.lineStart;
        var startRange$1587 = token$1584.range;
        var delimToken$1588 = {};
        delimToken$1588.type = Token$821.Delimiter;
        delimToken$1588.value = startDelim$1580.value + matchDelim$1581[startDelim$1580.value];
        delimToken$1588.startLineNumber = startLineNumber$1585;
        delimToken$1588.startLineStart = startLineStart$1586;
        delimToken$1588.startRange = startRange$1587;
        var delimIsBlock$1589 = false;
        if (startDelim$1580.value === '{') {
            delimIsBlock$1589 = blockAllowed$991(toks$1577.concat(delimToken$1588), 0, inExprDelim$1578, parentIsBlock$1579);
        }
        while (index$832 <= length$839) {
            token$1584 = readToken$992(inner$1582, startDelim$1580.value === '(' || startDelim$1580.value === '[', delimIsBlock$1589);
            if (token$1584.type === Token$821.Punctuator && token$1584.value === matchDelim$1581[startDelim$1580.value]) {
                if (token$1584.leadingComments) {
                    delimToken$1588.trailingComments = token$1584.leadingComments;
                }
                break;
            } else if (token$1584.type === Token$821.EOF) {
                throwError$881({}, Messages$826.UnexpectedEOS);
            } else {
                inner$1582.push(token$1584);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$832 >= length$839 && matchDelim$1581[startDelim$1580.value] !== source$830[length$839 - 1]) {
            throwError$881({}, Messages$826.UnexpectedEOS);
        }
        var endLineNumber$1590 = token$1584.lineNumber;
        var endLineStart$1591 = token$1584.lineStart;
        var endRange$1592 = token$1584.range;
        delimToken$1588.inner = inner$1582;
        delimToken$1588.endLineNumber = endLineNumber$1590;
        delimToken$1588.endLineStart = endLineStart$1591;
        delimToken$1588.endRange = endRange$1592;
        return delimToken$1588;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$994(code$1593) {
        var token$1594, tokenTree$1595 = [];
        extra$846 = {};
        extra$846.comments = [];
        patch$987();
        source$830 = code$1593;
        index$832 = 0;
        lineNumber$833 = source$830.length > 0 ? 1 : 0;
        lineStart$834 = 0;
        length$839 = source$830.length;
        state$845 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$832 < length$839) {
            tokenTree$1595.push(readToken$992(tokenTree$1595, false, false));
        }
        var last$1596 = tokenTree$1595[tokenTree$1595.length - 1];
        if (last$1596 && last$1596.type !== Token$821.EOF) {
            tokenTree$1595.push({
                type: Token$821.EOF,
                value: '',
                lineNumber: last$1596.lineNumber,
                lineStart: last$1596.lineStart,
                range: [
                    index$832,
                    index$832
                ]
            });
        }
        return expander$820.tokensToSyntax(tokenTree$1595);
    }
    function parse$995(code$1597, options$1598) {
        var program$1599, toString$1600;
        extra$846 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1597)) {
            tokenStream$841 = code$1597;
            length$839 = tokenStream$841.length;
            lineNumber$833 = tokenStream$841.length > 0 ? 1 : 0;
            source$830 = undefined;
        } else {
            toString$1600 = String;
            if (typeof code$1597 !== 'string' && !(code$1597 instanceof String)) {
                code$1597 = toString$1600(code$1597);
            }
            source$830 = code$1597;
            length$839 = source$830.length;
            lineNumber$833 = source$830.length > 0 ? 1 : 0;
        }
        delegate$840 = SyntaxTreeDelegate$828;
        streamIndex$842 = -1;
        index$832 = 0;
        lineStart$834 = 0;
        sm_lineStart$836 = 0;
        sm_lineNumber$835 = lineNumber$833;
        sm_index$838 = 0;
        sm_range$837 = [
            0,
            0
        ];
        lookahead$843 = null;
        state$845 = {
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
        if (typeof options$1598 !== 'undefined') {
            extra$846.range = typeof options$1598.range === 'boolean' && options$1598.range;
            extra$846.loc = typeof options$1598.loc === 'boolean' && options$1598.loc;
            if (extra$846.loc && options$1598.source !== null && options$1598.source !== undefined) {
                delegate$840 = extend$989(delegate$840, {
                    'postProcess': function (node$1601) {
                        node$1601.loc.source = toString$1600(options$1598.source);
                        return node$1601;
                    }
                });
            }
            if (typeof options$1598.tokens === 'boolean' && options$1598.tokens) {
                extra$846.tokens = [];
            }
            if (typeof options$1598.comment === 'boolean' && options$1598.comment) {
                extra$846.comments = [];
            }
            if (typeof options$1598.tolerant === 'boolean' && options$1598.tolerant) {
                extra$846.errors = [];
            }
        }
        if (length$839 > 0) {
            if (source$830 && typeof source$830[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1597 instanceof String) {
                    source$830 = code$1597.valueOf();
                }
            }
        }
        extra$846 = { loc: true };
        patch$987();
        try {
            program$1599 = parseProgram$973();
            if (typeof extra$846.comments !== 'undefined') {
                filterCommentLocation$976();
                program$1599.comments = extra$846.comments;
            }
            if (typeof extra$846.tokens !== 'undefined') {
                filterTokenLocation$979();
                program$1599.tokens = extra$846.tokens;
            }
            if (typeof extra$846.errors !== 'undefined') {
                program$1599.errors = extra$846.errors;
            }
            if (extra$846.range || extra$846.loc) {
                program$1599.body = filterGroup$985(program$1599.body);
            }
        } catch (e$1602) {
            throw e$1602;
        } finally {
            unpatch$988();
            extra$846 = {};
        }
        return program$1599;
    }
    exports$819.tokenize = tokenize$990;
    exports$819.read = read$994;
    exports$819.Token = Token$821;
    exports$819.assert = assert$847;
    exports$819.parse = parse$995;
    // Deep copy.
    exports$819.Syntax = function () {
        var name$1603, types$1604 = {};
        if (typeof Object.create === 'function') {
            types$1604 = Object.create(null);
        }
        for (name$1603 in Syntax$824) {
            if (Syntax$824.hasOwnProperty(name$1603)) {
                types$1604[name$1603] = Syntax$824[name$1603];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1604);
        }
        return types$1604;
    }();
}));
//# sourceMappingURL=parser.js.map