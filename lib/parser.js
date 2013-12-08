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
(function (root$813, factory$814) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$814);
    } else if (typeof exports !== 'undefined') {
        factory$814(exports, require('./expander'));
    } else {
        factory$814(root$813.esprima = {});
    }
}(this, function (exports$815, expander$816) {
    'use strict';
    var Token$817, TokenName$818, FnExprTokens$819, Syntax$820, PropertyKind$821, Messages$822, Regex$823, SyntaxTreeDelegate$824, ClassPropertyType$825, source$826, strict$827, index$828, lineNumber$829, lineStart$830, sm_lineNumber$831, sm_lineStart$832, sm_range$833, sm_index$834, length$835, delegate$836, tokenStream$837, streamIndex$838, lookahead$839, lookaheadIndex$840, state$841, extra$842;
    Token$817 = {
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
    TokenName$818 = {};
    TokenName$818[Token$817.BooleanLiteral] = 'Boolean';
    TokenName$818[Token$817.EOF] = '<end>';
    TokenName$818[Token$817.Identifier] = 'Identifier';
    TokenName$818[Token$817.Keyword] = 'Keyword';
    TokenName$818[Token$817.NullLiteral] = 'Null';
    TokenName$818[Token$817.NumericLiteral] = 'Numeric';
    TokenName$818[Token$817.Punctuator] = 'Punctuator';
    TokenName$818[Token$817.StringLiteral] = 'String';
    TokenName$818[Token$817.RegularExpression] = 'RegularExpression';
    TokenName$818[Token$817.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$819 = [
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
    Syntax$820 = {
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
    PropertyKind$821 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$825 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$822 = {
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
    Regex$823 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$843(condition$992, message$993) {
        if (!condition$992) {
            throw new Error('ASSERT: ' + message$993);
        }
    }
    function isIn$844(el$994, list$995) {
        return list$995.indexOf(el$994) !== -1;
    }
    function isDecimalDigit$845(ch$996) {
        return ch$996 >= 48 && ch$996 <= 57;
    }    // 0..9
    function isHexDigit$846(ch$997) {
        return '0123456789abcdefABCDEF'.indexOf(ch$997) >= 0;
    }
    function isOctalDigit$847(ch$998) {
        return '01234567'.indexOf(ch$998) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$848(ch$999) {
        return ch$999 === 32 || ch$999 === 9 || ch$999 === 11 || ch$999 === 12 || ch$999 === 160 || ch$999 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$999)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$849(ch$1000) {
        return ch$1000 === 10 || ch$1000 === 13 || ch$1000 === 8232 || ch$1000 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$850(ch$1001) {
        return ch$1001 === 36 || ch$1001 === 95 || ch$1001 >= 65 && ch$1001 <= 90 || ch$1001 >= 97 && ch$1001 <= 122 || ch$1001 === 92 || ch$1001 >= 128 && Regex$823.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1001));
    }
    function isIdentifierPart$851(ch$1002) {
        return ch$1002 === 36 || ch$1002 === 95 || ch$1002 >= 65 && ch$1002 <= 90 || ch$1002 >= 97 && ch$1002 <= 122 || ch$1002 >= 48 && ch$1002 <= 57 || ch$1002 === 92 || ch$1002 >= 128 && Regex$823.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1002));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$852(id$1003) {
        switch (id$1003) {
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
    function isStrictModeReservedWord$853(id$1004) {
        switch (id$1004) {
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
    function isRestrictedWord$854(id$1005) {
        return id$1005 === 'eval' || id$1005 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$855(id$1006) {
        if (strict$827 && isStrictModeReservedWord$853(id$1006)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1006.length) {
        case 2:
            return id$1006 === 'if' || id$1006 === 'in' || id$1006 === 'do';
        case 3:
            return id$1006 === 'var' || id$1006 === 'for' || id$1006 === 'new' || id$1006 === 'try' || id$1006 === 'let';
        case 4:
            return id$1006 === 'this' || id$1006 === 'else' || id$1006 === 'case' || id$1006 === 'void' || id$1006 === 'with' || id$1006 === 'enum';
        case 5:
            return id$1006 === 'while' || id$1006 === 'break' || id$1006 === 'catch' || id$1006 === 'throw' || id$1006 === 'const' || id$1006 === 'yield' || id$1006 === 'class' || id$1006 === 'super';
        case 6:
            return id$1006 === 'return' || id$1006 === 'typeof' || id$1006 === 'delete' || id$1006 === 'switch' || id$1006 === 'export' || id$1006 === 'import';
        case 7:
            return id$1006 === 'default' || id$1006 === 'finally' || id$1006 === 'extends';
        case 8:
            return id$1006 === 'function' || id$1006 === 'continue' || id$1006 === 'debugger';
        case 10:
            return id$1006 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$856() {
        var ch$1007, blockComment$1008, lineComment$1009;
        blockComment$1008 = false;
        lineComment$1009 = false;
        while (index$828 < length$835) {
            ch$1007 = source$826.charCodeAt(index$828);
            if (lineComment$1009) {
                ++index$828;
                if (isLineTerminator$849(ch$1007)) {
                    lineComment$1009 = false;
                    if (ch$1007 === 13 && source$826.charCodeAt(index$828) === 10) {
                        ++index$828;
                    }
                    ++lineNumber$829;
                    lineStart$830 = index$828;
                }
            } else if (blockComment$1008) {
                if (isLineTerminator$849(ch$1007)) {
                    if (ch$1007 === 13 && source$826.charCodeAt(index$828 + 1) === 10) {
                        ++index$828;
                    }
                    ++lineNumber$829;
                    ++index$828;
                    lineStart$830 = index$828;
                    if (index$828 >= length$835) {
                        throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1007 = source$826.charCodeAt(index$828++);
                    if (index$828 >= length$835) {
                        throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1007 === 42) {
                        ch$1007 = source$826.charCodeAt(index$828);
                        if (ch$1007 === 47) {
                            ++index$828;
                            blockComment$1008 = false;
                        }
                    }
                }
            } else if (ch$1007 === 47) {
                ch$1007 = source$826.charCodeAt(index$828 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1007 === 47) {
                    index$828 += 2;
                    lineComment$1009 = true;
                } else if (ch$1007 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$828 += 2;
                    blockComment$1008 = true;
                    if (index$828 >= length$835) {
                        throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$848(ch$1007)) {
                ++index$828;
            } else if (isLineTerminator$849(ch$1007)) {
                ++index$828;
                if (ch$1007 === 13 && source$826.charCodeAt(index$828) === 10) {
                    ++index$828;
                }
                ++lineNumber$829;
                lineStart$830 = index$828;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$857(prefix$1010) {
        var i$1011, len$1012, ch$1013, code$1014 = 0;
        len$1012 = prefix$1010 === 'u' ? 4 : 2;
        for (i$1011 = 0; i$1011 < len$1012; ++i$1011) {
            if (index$828 < length$835 && isHexDigit$846(source$826[index$828])) {
                ch$1013 = source$826[index$828++];
                code$1014 = code$1014 * 16 + '0123456789abcdef'.indexOf(ch$1013.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1014);
    }
    function scanUnicodeCodePointEscape$858() {
        var ch$1015, code$1016, cu1$1017, cu2$1018;
        ch$1015 = source$826[index$828];
        code$1016 = 0;
        // At least, one hex digit is required.
        if (ch$1015 === '}') {
            throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
        }
        while (index$828 < length$835) {
            ch$1015 = source$826[index$828++];
            if (!isHexDigit$846(ch$1015)) {
                break;
            }
            code$1016 = code$1016 * 16 + '0123456789abcdef'.indexOf(ch$1015.toLowerCase());
        }
        if (code$1016 > 1114111 || ch$1015 !== '}') {
            throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1016 <= 65535) {
            return String.fromCharCode(code$1016);
        }
        cu1$1017 = (code$1016 - 65536 >> 10) + 55296;
        cu2$1018 = (code$1016 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1017, cu2$1018);
    }
    function getEscapedIdentifier$859() {
        var ch$1019, id$1020;
        ch$1019 = source$826.charCodeAt(index$828++);
        id$1020 = String.fromCharCode(ch$1019);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1019 === 92) {
            if (source$826.charCodeAt(index$828) !== 117) {
                throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
            }
            ++index$828;
            ch$1019 = scanHexEscape$857('u');
            if (!ch$1019 || ch$1019 === '\\' || !isIdentifierStart$850(ch$1019.charCodeAt(0))) {
                throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
            }
            id$1020 = ch$1019;
        }
        while (index$828 < length$835) {
            ch$1019 = source$826.charCodeAt(index$828);
            if (!isIdentifierPart$851(ch$1019)) {
                break;
            }
            ++index$828;
            id$1020 += String.fromCharCode(ch$1019);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1019 === 92) {
                id$1020 = id$1020.substr(0, id$1020.length - 1);
                if (source$826.charCodeAt(index$828) !== 117) {
                    throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
                }
                ++index$828;
                ch$1019 = scanHexEscape$857('u');
                if (!ch$1019 || ch$1019 === '\\' || !isIdentifierPart$851(ch$1019.charCodeAt(0))) {
                    throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
                }
                id$1020 += ch$1019;
            }
        }
        return id$1020;
    }
    function getIdentifier$860() {
        var start$1021, ch$1022;
        start$1021 = index$828++;
        while (index$828 < length$835) {
            ch$1022 = source$826.charCodeAt(index$828);
            if (ch$1022 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$828 = start$1021;
                return getEscapedIdentifier$859();
            }
            if (isIdentifierPart$851(ch$1022)) {
                ++index$828;
            } else {
                break;
            }
        }
        return source$826.slice(start$1021, index$828);
    }
    function scanIdentifier$861() {
        var start$1023, id$1024, type$1025;
        start$1023 = index$828;
        // Backslash (char #92) starts an escaped character.
        id$1024 = source$826.charCodeAt(index$828) === 92 ? getEscapedIdentifier$859() : getIdentifier$860();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1024.length === 1) {
            type$1025 = Token$817.Identifier;
        } else if (isKeyword$855(id$1024)) {
            type$1025 = Token$817.Keyword;
        } else if (id$1024 === 'null') {
            type$1025 = Token$817.NullLiteral;
        } else if (id$1024 === 'true' || id$1024 === 'false') {
            type$1025 = Token$817.BooleanLiteral;
        } else {
            type$1025 = Token$817.Identifier;
        }
        return {
            type: type$1025,
            value: id$1024,
            lineNumber: lineNumber$829,
            lineStart: lineStart$830,
            range: [
                start$1023,
                index$828
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$862() {
        var start$1026 = index$828, code$1027 = source$826.charCodeAt(index$828), code2$1028, ch1$1029 = source$826[index$828], ch2$1030, ch3$1031, ch4$1032;
        switch (code$1027) {
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
            ++index$828;
            if (extra$842.tokenize) {
                if (code$1027 === 40) {
                    extra$842.openParenToken = extra$842.tokens.length;
                } else if (code$1027 === 123) {
                    extra$842.openCurlyToken = extra$842.tokens.length;
                }
            }
            return {
                type: Token$817.Punctuator,
                value: String.fromCharCode(code$1027),
                lineNumber: lineNumber$829,
                lineStart: lineStart$830,
                range: [
                    start$1026,
                    index$828
                ]
            };
        default:
            code2$1028 = source$826.charCodeAt(index$828 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1028 === 61) {
                switch (code$1027) {
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
                    index$828 += 2;
                    return {
                        type: Token$817.Punctuator,
                        value: String.fromCharCode(code$1027) + String.fromCharCode(code2$1028),
                        lineNumber: lineNumber$829,
                        lineStart: lineStart$830,
                        range: [
                            start$1026,
                            index$828
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$828 += 2;
                    // !== and ===
                    if (source$826.charCodeAt(index$828) === 61) {
                        ++index$828;
                    }
                    return {
                        type: Token$817.Punctuator,
                        value: source$826.slice(start$1026, index$828),
                        lineNumber: lineNumber$829,
                        lineStart: lineStart$830,
                        range: [
                            start$1026,
                            index$828
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1030 = source$826[index$828 + 1];
        ch3$1031 = source$826[index$828 + 2];
        ch4$1032 = source$826[index$828 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1029 === '>' && ch2$1030 === '>' && ch3$1031 === '>') {
            if (ch4$1032 === '=') {
                index$828 += 4;
                return {
                    type: Token$817.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$829,
                    lineStart: lineStart$830,
                    range: [
                        start$1026,
                        index$828
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1029 === '>' && ch2$1030 === '>' && ch3$1031 === '>') {
            index$828 += 3;
            return {
                type: Token$817.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$829,
                lineStart: lineStart$830,
                range: [
                    start$1026,
                    index$828
                ]
            };
        }
        if (ch1$1029 === '<' && ch2$1030 === '<' && ch3$1031 === '=') {
            index$828 += 3;
            return {
                type: Token$817.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$829,
                lineStart: lineStart$830,
                range: [
                    start$1026,
                    index$828
                ]
            };
        }
        if (ch1$1029 === '>' && ch2$1030 === '>' && ch3$1031 === '=') {
            index$828 += 3;
            return {
                type: Token$817.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$829,
                lineStart: lineStart$830,
                range: [
                    start$1026,
                    index$828
                ]
            };
        }
        if (ch1$1029 === '.' && ch2$1030 === '.' && ch3$1031 === '.') {
            index$828 += 3;
            return {
                type: Token$817.Punctuator,
                value: '...',
                lineNumber: lineNumber$829,
                lineStart: lineStart$830,
                range: [
                    start$1026,
                    index$828
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1029 === ch2$1030 && '+-<>&|'.indexOf(ch1$1029) >= 0) {
            index$828 += 2;
            return {
                type: Token$817.Punctuator,
                value: ch1$1029 + ch2$1030,
                lineNumber: lineNumber$829,
                lineStart: lineStart$830,
                range: [
                    start$1026,
                    index$828
                ]
            };
        }
        if (ch1$1029 === '=' && ch2$1030 === '>') {
            index$828 += 2;
            return {
                type: Token$817.Punctuator,
                value: '=>',
                lineNumber: lineNumber$829,
                lineStart: lineStart$830,
                range: [
                    start$1026,
                    index$828
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1029) >= 0) {
            ++index$828;
            return {
                type: Token$817.Punctuator,
                value: ch1$1029,
                lineNumber: lineNumber$829,
                lineStart: lineStart$830,
                range: [
                    start$1026,
                    index$828
                ]
            };
        }
        if (ch1$1029 === '.') {
            ++index$828;
            return {
                type: Token$817.Punctuator,
                value: ch1$1029,
                lineNumber: lineNumber$829,
                lineStart: lineStart$830,
                range: [
                    start$1026,
                    index$828
                ]
            };
        }
        throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$863(start$1033) {
        var number$1034 = '';
        while (index$828 < length$835) {
            if (!isHexDigit$846(source$826[index$828])) {
                break;
            }
            number$1034 += source$826[index$828++];
        }
        if (number$1034.length === 0) {
            throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$850(source$826.charCodeAt(index$828))) {
            throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$817.NumericLiteral,
            value: parseInt('0x' + number$1034, 16),
            lineNumber: lineNumber$829,
            lineStart: lineStart$830,
            range: [
                start$1033,
                index$828
            ]
        };
    }
    function scanOctalLiteral$864(prefix$1035, start$1036) {
        var number$1037, octal$1038;
        if (isOctalDigit$847(prefix$1035)) {
            octal$1038 = true;
            number$1037 = '0' + source$826[index$828++];
        } else {
            octal$1038 = false;
            ++index$828;
            number$1037 = '';
        }
        while (index$828 < length$835) {
            if (!isOctalDigit$847(source$826[index$828])) {
                break;
            }
            number$1037 += source$826[index$828++];
        }
        if (!octal$1038 && number$1037.length === 0) {
            // only 0o or 0O
            throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$850(source$826.charCodeAt(index$828)) || isDecimalDigit$845(source$826.charCodeAt(index$828))) {
            throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$817.NumericLiteral,
            value: parseInt(number$1037, 8),
            octal: octal$1038,
            lineNumber: lineNumber$829,
            lineStart: lineStart$830,
            range: [
                start$1036,
                index$828
            ]
        };
    }
    function scanNumericLiteral$865() {
        var number$1039, start$1040, ch$1041, octal$1042;
        ch$1041 = source$826[index$828];
        assert$843(isDecimalDigit$845(ch$1041.charCodeAt(0)) || ch$1041 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1040 = index$828;
        number$1039 = '';
        if (ch$1041 !== '.') {
            number$1039 = source$826[index$828++];
            ch$1041 = source$826[index$828];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1039 === '0') {
                if (ch$1041 === 'x' || ch$1041 === 'X') {
                    ++index$828;
                    return scanHexLiteral$863(start$1040);
                }
                if (ch$1041 === 'b' || ch$1041 === 'B') {
                    ++index$828;
                    number$1039 = '';
                    while (index$828 < length$835) {
                        ch$1041 = source$826[index$828];
                        if (ch$1041 !== '0' && ch$1041 !== '1') {
                            break;
                        }
                        number$1039 += source$826[index$828++];
                    }
                    if (number$1039.length === 0) {
                        // only 0b or 0B
                        throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$828 < length$835) {
                        ch$1041 = source$826.charCodeAt(index$828);
                        if (isIdentifierStart$850(ch$1041) || isDecimalDigit$845(ch$1041)) {
                            throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$817.NumericLiteral,
                        value: parseInt(number$1039, 2),
                        lineNumber: lineNumber$829,
                        lineStart: lineStart$830,
                        range: [
                            start$1040,
                            index$828
                        ]
                    };
                }
                if (ch$1041 === 'o' || ch$1041 === 'O' || isOctalDigit$847(ch$1041)) {
                    return scanOctalLiteral$864(ch$1041, start$1040);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1041 && isDecimalDigit$845(ch$1041.charCodeAt(0))) {
                    throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$845(source$826.charCodeAt(index$828))) {
                number$1039 += source$826[index$828++];
            }
            ch$1041 = source$826[index$828];
        }
        if (ch$1041 === '.') {
            number$1039 += source$826[index$828++];
            while (isDecimalDigit$845(source$826.charCodeAt(index$828))) {
                number$1039 += source$826[index$828++];
            }
            ch$1041 = source$826[index$828];
        }
        if (ch$1041 === 'e' || ch$1041 === 'E') {
            number$1039 += source$826[index$828++];
            ch$1041 = source$826[index$828];
            if (ch$1041 === '+' || ch$1041 === '-') {
                number$1039 += source$826[index$828++];
            }
            if (isDecimalDigit$845(source$826.charCodeAt(index$828))) {
                while (isDecimalDigit$845(source$826.charCodeAt(index$828))) {
                    number$1039 += source$826[index$828++];
                }
            } else {
                throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$850(source$826.charCodeAt(index$828))) {
            throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$817.NumericLiteral,
            value: parseFloat(number$1039),
            lineNumber: lineNumber$829,
            lineStart: lineStart$830,
            range: [
                start$1040,
                index$828
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$866() {
        var str$1043 = '', quote$1044, start$1045, ch$1046, code$1047, unescaped$1048, restore$1049, octal$1050 = false;
        quote$1044 = source$826[index$828];
        assert$843(quote$1044 === '\'' || quote$1044 === '"', 'String literal must starts with a quote');
        start$1045 = index$828;
        ++index$828;
        while (index$828 < length$835) {
            ch$1046 = source$826[index$828++];
            if (ch$1046 === quote$1044) {
                quote$1044 = '';
                break;
            } else if (ch$1046 === '\\') {
                ch$1046 = source$826[index$828++];
                if (!ch$1046 || !isLineTerminator$849(ch$1046.charCodeAt(0))) {
                    switch (ch$1046) {
                    case 'n':
                        str$1043 += '\n';
                        break;
                    case 'r':
                        str$1043 += '\r';
                        break;
                    case 't':
                        str$1043 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$826[index$828] === '{') {
                            ++index$828;
                            str$1043 += scanUnicodeCodePointEscape$858();
                        } else {
                            restore$1049 = index$828;
                            unescaped$1048 = scanHexEscape$857(ch$1046);
                            if (unescaped$1048) {
                                str$1043 += unescaped$1048;
                            } else {
                                index$828 = restore$1049;
                                str$1043 += ch$1046;
                            }
                        }
                        break;
                    case 'b':
                        str$1043 += '\b';
                        break;
                    case 'f':
                        str$1043 += '\f';
                        break;
                    case 'v':
                        str$1043 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$847(ch$1046)) {
                            code$1047 = '01234567'.indexOf(ch$1046);
                            // \0 is not octal escape sequence
                            if (code$1047 !== 0) {
                                octal$1050 = true;
                            }
                            if (index$828 < length$835 && isOctalDigit$847(source$826[index$828])) {
                                octal$1050 = true;
                                code$1047 = code$1047 * 8 + '01234567'.indexOf(source$826[index$828++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1046) >= 0 && index$828 < length$835 && isOctalDigit$847(source$826[index$828])) {
                                    code$1047 = code$1047 * 8 + '01234567'.indexOf(source$826[index$828++]);
                                }
                            }
                            str$1043 += String.fromCharCode(code$1047);
                        } else {
                            str$1043 += ch$1046;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$829;
                    if (ch$1046 === '\r' && source$826[index$828] === '\n') {
                        ++index$828;
                    }
                }
            } else if (isLineTerminator$849(ch$1046.charCodeAt(0))) {
                break;
            } else {
                str$1043 += ch$1046;
            }
        }
        if (quote$1044 !== '') {
            throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$817.StringLiteral,
            value: str$1043,
            octal: octal$1050,
            lineNumber: lineNumber$829,
            lineStart: lineStart$830,
            range: [
                start$1045,
                index$828
            ]
        };
    }
    function scanTemplate$867() {
        var cooked$1051 = '', ch$1052, start$1053, terminated$1054, tail$1055, restore$1056, unescaped$1057, code$1058, octal$1059;
        terminated$1054 = false;
        tail$1055 = false;
        start$1053 = index$828;
        ++index$828;
        while (index$828 < length$835) {
            ch$1052 = source$826[index$828++];
            if (ch$1052 === '`') {
                tail$1055 = true;
                terminated$1054 = true;
                break;
            } else if (ch$1052 === '$') {
                if (source$826[index$828] === '{') {
                    ++index$828;
                    terminated$1054 = true;
                    break;
                }
                cooked$1051 += ch$1052;
            } else if (ch$1052 === '\\') {
                ch$1052 = source$826[index$828++];
                if (!isLineTerminator$849(ch$1052.charCodeAt(0))) {
                    switch (ch$1052) {
                    case 'n':
                        cooked$1051 += '\n';
                        break;
                    case 'r':
                        cooked$1051 += '\r';
                        break;
                    case 't':
                        cooked$1051 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$826[index$828] === '{') {
                            ++index$828;
                            cooked$1051 += scanUnicodeCodePointEscape$858();
                        } else {
                            restore$1056 = index$828;
                            unescaped$1057 = scanHexEscape$857(ch$1052);
                            if (unescaped$1057) {
                                cooked$1051 += unescaped$1057;
                            } else {
                                index$828 = restore$1056;
                                cooked$1051 += ch$1052;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1051 += '\b';
                        break;
                    case 'f':
                        cooked$1051 += '\f';
                        break;
                    case 'v':
                        cooked$1051 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$847(ch$1052)) {
                            code$1058 = '01234567'.indexOf(ch$1052);
                            // \0 is not octal escape sequence
                            if (code$1058 !== 0) {
                                octal$1059 = true;
                            }
                            if (index$828 < length$835 && isOctalDigit$847(source$826[index$828])) {
                                octal$1059 = true;
                                code$1058 = code$1058 * 8 + '01234567'.indexOf(source$826[index$828++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1052) >= 0 && index$828 < length$835 && isOctalDigit$847(source$826[index$828])) {
                                    code$1058 = code$1058 * 8 + '01234567'.indexOf(source$826[index$828++]);
                                }
                            }
                            cooked$1051 += String.fromCharCode(code$1058);
                        } else {
                            cooked$1051 += ch$1052;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$829;
                    if (ch$1052 === '\r' && source$826[index$828] === '\n') {
                        ++index$828;
                    }
                }
            } else if (isLineTerminator$849(ch$1052.charCodeAt(0))) {
                ++lineNumber$829;
                if (ch$1052 === '\r' && source$826[index$828] === '\n') {
                    ++index$828;
                }
                cooked$1051 += '\n';
            } else {
                cooked$1051 += ch$1052;
            }
        }
        if (!terminated$1054) {
            throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$817.Template,
            value: {
                cooked: cooked$1051,
                raw: source$826.slice(start$1053 + 1, index$828 - (tail$1055 ? 1 : 2))
            },
            tail: tail$1055,
            octal: octal$1059,
            lineNumber: lineNumber$829,
            lineStart: lineStart$830,
            range: [
                start$1053,
                index$828
            ]
        };
    }
    function scanTemplateElement$868(option$1060) {
        var startsWith$1061, template$1062;
        lookahead$839 = null;
        skipComment$856();
        startsWith$1061 = option$1060.head ? '`' : '}';
        if (source$826[index$828] !== startsWith$1061) {
            throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
        }
        template$1062 = scanTemplate$867();
        peek$874();
        return template$1062;
    }
    function scanRegExp$869() {
        var str$1063, ch$1064, start$1065, pattern$1066, flags$1067, value$1068, classMarker$1069 = false, restore$1070, terminated$1071 = false;
        lookahead$839 = null;
        skipComment$856();
        start$1065 = index$828;
        ch$1064 = source$826[index$828];
        assert$843(ch$1064 === '/', 'Regular expression literal must start with a slash');
        str$1063 = source$826[index$828++];
        while (index$828 < length$835) {
            ch$1064 = source$826[index$828++];
            str$1063 += ch$1064;
            if (classMarker$1069) {
                if (ch$1064 === ']') {
                    classMarker$1069 = false;
                }
            } else {
                if (ch$1064 === '\\') {
                    ch$1064 = source$826[index$828++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$849(ch$1064.charCodeAt(0))) {
                        throwError$877({}, Messages$822.UnterminatedRegExp);
                    }
                    str$1063 += ch$1064;
                } else if (ch$1064 === '/') {
                    terminated$1071 = true;
                    break;
                } else if (ch$1064 === '[') {
                    classMarker$1069 = true;
                } else if (isLineTerminator$849(ch$1064.charCodeAt(0))) {
                    throwError$877({}, Messages$822.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1071) {
            throwError$877({}, Messages$822.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1066 = str$1063.substr(1, str$1063.length - 2);
        flags$1067 = '';
        while (index$828 < length$835) {
            ch$1064 = source$826[index$828];
            if (!isIdentifierPart$851(ch$1064.charCodeAt(0))) {
                break;
            }
            ++index$828;
            if (ch$1064 === '\\' && index$828 < length$835) {
                ch$1064 = source$826[index$828];
                if (ch$1064 === 'u') {
                    ++index$828;
                    restore$1070 = index$828;
                    ch$1064 = scanHexEscape$857('u');
                    if (ch$1064) {
                        flags$1067 += ch$1064;
                        for (str$1063 += '\\u'; restore$1070 < index$828; ++restore$1070) {
                            str$1063 += source$826[restore$1070];
                        }
                    } else {
                        index$828 = restore$1070;
                        flags$1067 += 'u';
                        str$1063 += '\\u';
                    }
                } else {
                    str$1063 += '\\';
                }
            } else {
                flags$1067 += ch$1064;
                str$1063 += ch$1064;
            }
        }
        try {
            value$1068 = new RegExp(pattern$1066, flags$1067);
        } catch (e$1072) {
            throwError$877({}, Messages$822.InvalidRegExp);
        }
        // peek();
        if (extra$842.tokenize) {
            return {
                type: Token$817.RegularExpression,
                value: value$1068,
                lineNumber: lineNumber$829,
                lineStart: lineStart$830,
                range: [
                    start$1065,
                    index$828
                ]
            };
        }
        return {
            type: Token$817.RegularExpression,
            literal: str$1063,
            value: value$1068,
            range: [
                start$1065,
                index$828
            ]
        };
    }
    function isIdentifierName$870(token$1073) {
        return token$1073.type === Token$817.Identifier || token$1073.type === Token$817.Keyword || token$1073.type === Token$817.BooleanLiteral || token$1073.type === Token$817.NullLiteral;
    }
    function advanceSlash$871() {
        var prevToken$1074, checkToken$1075;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1074 = extra$842.tokens[extra$842.tokens.length - 1];
        if (!prevToken$1074) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$869();
        }
        if (prevToken$1074.type === 'Punctuator') {
            if (prevToken$1074.value === ')') {
                checkToken$1075 = extra$842.tokens[extra$842.openParenToken - 1];
                if (checkToken$1075 && checkToken$1075.type === 'Keyword' && (checkToken$1075.value === 'if' || checkToken$1075.value === 'while' || checkToken$1075.value === 'for' || checkToken$1075.value === 'with')) {
                    return scanRegExp$869();
                }
                return scanPunctuator$862();
            }
            if (prevToken$1074.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$842.tokens[extra$842.openCurlyToken - 3] && extra$842.tokens[extra$842.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1075 = extra$842.tokens[extra$842.openCurlyToken - 4];
                    if (!checkToken$1075) {
                        return scanPunctuator$862();
                    }
                } else if (extra$842.tokens[extra$842.openCurlyToken - 4] && extra$842.tokens[extra$842.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1075 = extra$842.tokens[extra$842.openCurlyToken - 5];
                    if (!checkToken$1075) {
                        return scanRegExp$869();
                    }
                } else {
                    return scanPunctuator$862();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$819.indexOf(checkToken$1075.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$862();
                }
                // It is a declaration.
                return scanRegExp$869();
            }
            return scanRegExp$869();
        }
        if (prevToken$1074.type === 'Keyword') {
            return scanRegExp$869();
        }
        return scanPunctuator$862();
    }
    function advance$872() {
        var ch$1076;
        skipComment$856();
        if (index$828 >= length$835) {
            return {
                type: Token$817.EOF,
                lineNumber: lineNumber$829,
                lineStart: lineStart$830,
                range: [
                    index$828,
                    index$828
                ]
            };
        }
        ch$1076 = source$826.charCodeAt(index$828);
        // Very common: ( and ) and ;
        if (ch$1076 === 40 || ch$1076 === 41 || ch$1076 === 58) {
            return scanPunctuator$862();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1076 === 39 || ch$1076 === 34) {
            return scanStringLiteral$866();
        }
        if (ch$1076 === 96) {
            return scanTemplate$867();
        }
        if (isIdentifierStart$850(ch$1076)) {
            return scanIdentifier$861();
        }
        // # and @ are allowed for sweet.js
        if (ch$1076 === 35 || ch$1076 === 64) {
            ++index$828;
            return {
                type: Token$817.Punctuator,
                value: String.fromCharCode(ch$1076),
                lineNumber: lineNumber$829,
                lineStart: lineStart$830,
                range: [
                    index$828 - 1,
                    index$828
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1076 === 46) {
            if (isDecimalDigit$845(source$826.charCodeAt(index$828 + 1))) {
                return scanNumericLiteral$865();
            }
            return scanPunctuator$862();
        }
        if (isDecimalDigit$845(ch$1076)) {
            return scanNumericLiteral$865();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$842.tokenize && ch$1076 === 47) {
            return advanceSlash$871();
        }
        return scanPunctuator$862();
    }
    function lex$873() {
        var token$1077;
        token$1077 = lookahead$839;
        streamIndex$838 = lookaheadIndex$840;
        lineNumber$829 = token$1077.lineNumber;
        lineStart$830 = token$1077.lineStart;
        sm_lineNumber$831 = lookahead$839.sm_lineNumber;
        sm_lineStart$832 = lookahead$839.sm_lineStart;
        sm_range$833 = lookahead$839.sm_range;
        sm_index$834 = lookahead$839.sm_range[0];
        lookahead$839 = tokenStream$837[++streamIndex$838].token;
        lookaheadIndex$840 = streamIndex$838;
        index$828 = lookahead$839.range[0];
        return token$1077;
    }
    function peek$874() {
        lookaheadIndex$840 = streamIndex$838 + 1;
        if (lookaheadIndex$840 >= length$835) {
            lookahead$839 = {
                type: Token$817.EOF,
                lineNumber: lineNumber$829,
                lineStart: lineStart$830,
                range: [
                    index$828,
                    index$828
                ]
            };
            return;
        }
        lookahead$839 = tokenStream$837[lookaheadIndex$840].token;
        index$828 = lookahead$839.range[0];
    }
    function lookahead2$875() {
        var adv$1078, pos$1079, line$1080, start$1081, result$1082;
        if (streamIndex$838 + 1 >= length$835 || streamIndex$838 + 2 >= length$835) {
            return {
                type: Token$817.EOF,
                lineNumber: lineNumber$829,
                lineStart: lineStart$830,
                range: [
                    index$828,
                    index$828
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$839 === null) {
            lookaheadIndex$840 = streamIndex$838 + 1;
            lookahead$839 = tokenStream$837[lookaheadIndex$840].token;
            index$828 = lookahead$839.range[0];
        }
        result$1082 = tokenStream$837[lookaheadIndex$840 + 1].token;
        return result$1082;
    }
    SyntaxTreeDelegate$824 = {
        name: 'SyntaxTree',
        postProcess: function (node$1083) {
            return node$1083;
        },
        createArrayExpression: function (elements$1084) {
            return {
                type: Syntax$820.ArrayExpression,
                elements: elements$1084
            };
        },
        createAssignmentExpression: function (operator$1085, left$1086, right$1087) {
            return {
                type: Syntax$820.AssignmentExpression,
                operator: operator$1085,
                left: left$1086,
                right: right$1087
            };
        },
        createBinaryExpression: function (operator$1088, left$1089, right$1090) {
            var type$1091 = operator$1088 === '||' || operator$1088 === '&&' ? Syntax$820.LogicalExpression : Syntax$820.BinaryExpression;
            return {
                type: type$1091,
                operator: operator$1088,
                left: left$1089,
                right: right$1090
            };
        },
        createBlockStatement: function (body$1092) {
            return {
                type: Syntax$820.BlockStatement,
                body: body$1092
            };
        },
        createBreakStatement: function (label$1093) {
            return {
                type: Syntax$820.BreakStatement,
                label: label$1093
            };
        },
        createCallExpression: function (callee$1094, args$1095) {
            return {
                type: Syntax$820.CallExpression,
                callee: callee$1094,
                'arguments': args$1095
            };
        },
        createCatchClause: function (param$1096, body$1097) {
            return {
                type: Syntax$820.CatchClause,
                param: param$1096,
                body: body$1097
            };
        },
        createConditionalExpression: function (test$1098, consequent$1099, alternate$1100) {
            return {
                type: Syntax$820.ConditionalExpression,
                test: test$1098,
                consequent: consequent$1099,
                alternate: alternate$1100
            };
        },
        createContinueStatement: function (label$1101) {
            return {
                type: Syntax$820.ContinueStatement,
                label: label$1101
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$820.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1102, test$1103) {
            return {
                type: Syntax$820.DoWhileStatement,
                body: body$1102,
                test: test$1103
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$820.EmptyStatement };
        },
        createExpressionStatement: function (expression$1104) {
            return {
                type: Syntax$820.ExpressionStatement,
                expression: expression$1104
            };
        },
        createForStatement: function (init$1105, test$1106, update$1107, body$1108) {
            return {
                type: Syntax$820.ForStatement,
                init: init$1105,
                test: test$1106,
                update: update$1107,
                body: body$1108
            };
        },
        createForInStatement: function (left$1109, right$1110, body$1111) {
            return {
                type: Syntax$820.ForInStatement,
                left: left$1109,
                right: right$1110,
                body: body$1111,
                each: false
            };
        },
        createForOfStatement: function (left$1112, right$1113, body$1114) {
            return {
                type: Syntax$820.ForOfStatement,
                left: left$1112,
                right: right$1113,
                body: body$1114
            };
        },
        createFunctionDeclaration: function (id$1115, params$1116, defaults$1117, body$1118, rest$1119, generator$1120, expression$1121) {
            return {
                type: Syntax$820.FunctionDeclaration,
                id: id$1115,
                params: params$1116,
                defaults: defaults$1117,
                body: body$1118,
                rest: rest$1119,
                generator: generator$1120,
                expression: expression$1121
            };
        },
        createFunctionExpression: function (id$1122, params$1123, defaults$1124, body$1125, rest$1126, generator$1127, expression$1128) {
            return {
                type: Syntax$820.FunctionExpression,
                id: id$1122,
                params: params$1123,
                defaults: defaults$1124,
                body: body$1125,
                rest: rest$1126,
                generator: generator$1127,
                expression: expression$1128
            };
        },
        createIdentifier: function (name$1129) {
            return {
                type: Syntax$820.Identifier,
                name: name$1129
            };
        },
        createIfStatement: function (test$1130, consequent$1131, alternate$1132) {
            return {
                type: Syntax$820.IfStatement,
                test: test$1130,
                consequent: consequent$1131,
                alternate: alternate$1132
            };
        },
        createLabeledStatement: function (label$1133, body$1134) {
            return {
                type: Syntax$820.LabeledStatement,
                label: label$1133,
                body: body$1134
            };
        },
        createLiteral: function (token$1135) {
            return {
                type: Syntax$820.Literal,
                value: token$1135.value,
                raw: String(token$1135.value)
            };
        },
        createMemberExpression: function (accessor$1136, object$1137, property$1138) {
            return {
                type: Syntax$820.MemberExpression,
                computed: accessor$1136 === '[',
                object: object$1137,
                property: property$1138
            };
        },
        createNewExpression: function (callee$1139, args$1140) {
            return {
                type: Syntax$820.NewExpression,
                callee: callee$1139,
                'arguments': args$1140
            };
        },
        createObjectExpression: function (properties$1141) {
            return {
                type: Syntax$820.ObjectExpression,
                properties: properties$1141
            };
        },
        createPostfixExpression: function (operator$1142, argument$1143) {
            return {
                type: Syntax$820.UpdateExpression,
                operator: operator$1142,
                argument: argument$1143,
                prefix: false
            };
        },
        createProgram: function (body$1144) {
            return {
                type: Syntax$820.Program,
                body: body$1144
            };
        },
        createProperty: function (kind$1145, key$1146, value$1147, method$1148, shorthand$1149) {
            return {
                type: Syntax$820.Property,
                key: key$1146,
                value: value$1147,
                kind: kind$1145,
                method: method$1148,
                shorthand: shorthand$1149
            };
        },
        createReturnStatement: function (argument$1150) {
            return {
                type: Syntax$820.ReturnStatement,
                argument: argument$1150
            };
        },
        createSequenceExpression: function (expressions$1151) {
            return {
                type: Syntax$820.SequenceExpression,
                expressions: expressions$1151
            };
        },
        createSwitchCase: function (test$1152, consequent$1153) {
            return {
                type: Syntax$820.SwitchCase,
                test: test$1152,
                consequent: consequent$1153
            };
        },
        createSwitchStatement: function (discriminant$1154, cases$1155) {
            return {
                type: Syntax$820.SwitchStatement,
                discriminant: discriminant$1154,
                cases: cases$1155
            };
        },
        createThisExpression: function () {
            return { type: Syntax$820.ThisExpression };
        },
        createThrowStatement: function (argument$1156) {
            return {
                type: Syntax$820.ThrowStatement,
                argument: argument$1156
            };
        },
        createTryStatement: function (block$1157, guardedHandlers$1158, handlers$1159, finalizer$1160) {
            return {
                type: Syntax$820.TryStatement,
                block: block$1157,
                guardedHandlers: guardedHandlers$1158,
                handlers: handlers$1159,
                finalizer: finalizer$1160
            };
        },
        createUnaryExpression: function (operator$1161, argument$1162) {
            if (operator$1161 === '++' || operator$1161 === '--') {
                return {
                    type: Syntax$820.UpdateExpression,
                    operator: operator$1161,
                    argument: argument$1162,
                    prefix: true
                };
            }
            return {
                type: Syntax$820.UnaryExpression,
                operator: operator$1161,
                argument: argument$1162
            };
        },
        createVariableDeclaration: function (declarations$1163, kind$1164) {
            return {
                type: Syntax$820.VariableDeclaration,
                declarations: declarations$1163,
                kind: kind$1164
            };
        },
        createVariableDeclarator: function (id$1165, init$1166) {
            return {
                type: Syntax$820.VariableDeclarator,
                id: id$1165,
                init: init$1166
            };
        },
        createWhileStatement: function (test$1167, body$1168) {
            return {
                type: Syntax$820.WhileStatement,
                test: test$1167,
                body: body$1168
            };
        },
        createWithStatement: function (object$1169, body$1170) {
            return {
                type: Syntax$820.WithStatement,
                object: object$1169,
                body: body$1170
            };
        },
        createTemplateElement: function (value$1171, tail$1172) {
            return {
                type: Syntax$820.TemplateElement,
                value: value$1171,
                tail: tail$1172
            };
        },
        createTemplateLiteral: function (quasis$1173, expressions$1174) {
            return {
                type: Syntax$820.TemplateLiteral,
                quasis: quasis$1173,
                expressions: expressions$1174
            };
        },
        createSpreadElement: function (argument$1175) {
            return {
                type: Syntax$820.SpreadElement,
                argument: argument$1175
            };
        },
        createTaggedTemplateExpression: function (tag$1176, quasi$1177) {
            return {
                type: Syntax$820.TaggedTemplateExpression,
                tag: tag$1176,
                quasi: quasi$1177
            };
        },
        createArrowFunctionExpression: function (params$1178, defaults$1179, body$1180, rest$1181, expression$1182) {
            return {
                type: Syntax$820.ArrowFunctionExpression,
                id: null,
                params: params$1178,
                defaults: defaults$1179,
                body: body$1180,
                rest: rest$1181,
                generator: false,
                expression: expression$1182
            };
        },
        createMethodDefinition: function (propertyType$1183, kind$1184, key$1185, value$1186) {
            return {
                type: Syntax$820.MethodDefinition,
                key: key$1185,
                value: value$1186,
                kind: kind$1184,
                'static': propertyType$1183 === ClassPropertyType$825.static
            };
        },
        createClassBody: function (body$1187) {
            return {
                type: Syntax$820.ClassBody,
                body: body$1187
            };
        },
        createClassExpression: function (id$1188, superClass$1189, body$1190) {
            return {
                type: Syntax$820.ClassExpression,
                id: id$1188,
                superClass: superClass$1189,
                body: body$1190
            };
        },
        createClassDeclaration: function (id$1191, superClass$1192, body$1193) {
            return {
                type: Syntax$820.ClassDeclaration,
                id: id$1191,
                superClass: superClass$1192,
                body: body$1193
            };
        },
        createExportSpecifier: function (id$1194, name$1195) {
            return {
                type: Syntax$820.ExportSpecifier,
                id: id$1194,
                name: name$1195
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$820.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1196, specifiers$1197, source$1198) {
            return {
                type: Syntax$820.ExportDeclaration,
                declaration: declaration$1196,
                specifiers: specifiers$1197,
                source: source$1198
            };
        },
        createImportSpecifier: function (id$1199, name$1200) {
            return {
                type: Syntax$820.ImportSpecifier,
                id: id$1199,
                name: name$1200
            };
        },
        createImportDeclaration: function (specifiers$1201, kind$1202, source$1203) {
            return {
                type: Syntax$820.ImportDeclaration,
                specifiers: specifiers$1201,
                kind: kind$1202,
                source: source$1203
            };
        },
        createYieldExpression: function (argument$1204, delegate$1205) {
            return {
                type: Syntax$820.YieldExpression,
                argument: argument$1204,
                delegate: delegate$1205
            };
        },
        createModuleDeclaration: function (id$1206, source$1207, body$1208) {
            return {
                type: Syntax$820.ModuleDeclaration,
                id: id$1206,
                source: source$1207,
                body: body$1208
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$876() {
        return lookahead$839.lineNumber !== lineNumber$829;
    }
    // Throw an exception
    function throwError$877(token$1209, messageFormat$1210) {
        var error$1211, args$1212 = Array.prototype.slice.call(arguments, 2), msg$1213 = messageFormat$1210.replace(/%(\d)/g, function (whole$1214, index$1215) {
                assert$843(index$1215 < args$1212.length, 'Message reference must be in range');
                return args$1212[index$1215];
            });
        if (typeof token$1209.lineNumber === 'number') {
            error$1211 = new Error('Line ' + token$1209.lineNumber + ': ' + msg$1213);
            error$1211.index = token$1209.range[0];
            error$1211.lineNumber = token$1209.lineNumber;
            error$1211.column = token$1209.range[0] - lineStart$830 + 1;
        } else {
            error$1211 = new Error('Line ' + lineNumber$829 + ': ' + msg$1213);
            error$1211.index = index$828;
            error$1211.lineNumber = lineNumber$829;
            error$1211.column = index$828 - lineStart$830 + 1;
        }
        error$1211.description = msg$1213;
        throw error$1211;
    }
    function throwErrorTolerant$878() {
        try {
            throwError$877.apply(null, arguments);
        } catch (e$1216) {
            if (extra$842.errors) {
                extra$842.errors.push(e$1216);
            } else {
                throw e$1216;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$879(token$1217) {
        if (token$1217.type === Token$817.EOF) {
            throwError$877(token$1217, Messages$822.UnexpectedEOS);
        }
        if (token$1217.type === Token$817.NumericLiteral) {
            throwError$877(token$1217, Messages$822.UnexpectedNumber);
        }
        if (token$1217.type === Token$817.StringLiteral) {
            throwError$877(token$1217, Messages$822.UnexpectedString);
        }
        if (token$1217.type === Token$817.Identifier) {
            throwError$877(token$1217, Messages$822.UnexpectedIdentifier);
        }
        if (token$1217.type === Token$817.Keyword) {
            if (isFutureReservedWord$852(token$1217.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$827 && isStrictModeReservedWord$853(token$1217.value)) {
                throwErrorTolerant$878(token$1217, Messages$822.StrictReservedWord);
                return;
            }
            throwError$877(token$1217, Messages$822.UnexpectedToken, token$1217.value);
        }
        if (token$1217.type === Token$817.Template) {
            throwError$877(token$1217, Messages$822.UnexpectedTemplate, token$1217.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$877(token$1217, Messages$822.UnexpectedToken, token$1217.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$880(value$1218) {
        var token$1219 = lex$873();
        if (token$1219.type !== Token$817.Punctuator || token$1219.value !== value$1218) {
            throwUnexpected$879(token$1219);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$881(keyword$1220) {
        var token$1221 = lex$873();
        if (token$1221.type !== Token$817.Keyword || token$1221.value !== keyword$1220) {
            throwUnexpected$879(token$1221);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$882(value$1222) {
        return lookahead$839.type === Token$817.Punctuator && lookahead$839.value === value$1222;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$883(keyword$1223) {
        return lookahead$839.type === Token$817.Keyword && lookahead$839.value === keyword$1223;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$884(keyword$1224) {
        return lookahead$839.type === Token$817.Identifier && lookahead$839.value === keyword$1224;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$885() {
        var op$1225;
        if (lookahead$839.type !== Token$817.Punctuator) {
            return false;
        }
        op$1225 = lookahead$839.value;
        return op$1225 === '=' || op$1225 === '*=' || op$1225 === '/=' || op$1225 === '%=' || op$1225 === '+=' || op$1225 === '-=' || op$1225 === '<<=' || op$1225 === '>>=' || op$1225 === '>>>=' || op$1225 === '&=' || op$1225 === '^=' || op$1225 === '|=';
    }
    function consumeSemicolon$886() {
        var line$1226, ch$1227;
        ch$1227 = lookahead$839.value ? lookahead$839.value.charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1227 === 59) {
            lex$873();
            return;
        }
        if (lookahead$839.lineNumber !== lineNumber$829) {
            return;
        }
        if (match$882(';')) {
            lex$873();
            return;
        }
        if (lookahead$839.type !== Token$817.EOF && !match$882('}')) {
            throwUnexpected$879(lookahead$839);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$887(expr$1228) {
        return expr$1228.type === Syntax$820.Identifier || expr$1228.type === Syntax$820.MemberExpression;
    }
    function isAssignableLeftHandSide$888(expr$1229) {
        return isLeftHandSide$887(expr$1229) || expr$1229.type === Syntax$820.ObjectPattern || expr$1229.type === Syntax$820.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$889() {
        var elements$1230 = [], blocks$1231 = [], filter$1232 = null, tmp$1233, possiblecomprehension$1234 = true, body$1235;
        expect$880('[');
        while (!match$882(']')) {
            if (lookahead$839.value === 'for' && lookahead$839.type === Token$817.Keyword) {
                if (!possiblecomprehension$1234) {
                    throwError$877({}, Messages$822.ComprehensionError);
                }
                matchKeyword$883('for');
                tmp$1233 = parseForStatement$937({ ignoreBody: true });
                tmp$1233.of = tmp$1233.type === Syntax$820.ForOfStatement;
                tmp$1233.type = Syntax$820.ComprehensionBlock;
                if (tmp$1233.left.kind) {
                    // can't be let or const
                    throwError$877({}, Messages$822.ComprehensionError);
                }
                blocks$1231.push(tmp$1233);
            } else if (lookahead$839.value === 'if' && lookahead$839.type === Token$817.Keyword) {
                if (!possiblecomprehension$1234) {
                    throwError$877({}, Messages$822.ComprehensionError);
                }
                expectKeyword$881('if');
                expect$880('(');
                filter$1232 = parseExpression$917();
                expect$880(')');
            } else if (lookahead$839.value === ',' && lookahead$839.type === Token$817.Punctuator) {
                possiblecomprehension$1234 = false;
                // no longer allowed.
                lex$873();
                elements$1230.push(null);
            } else {
                tmp$1233 = parseSpreadOrAssignmentExpression$900();
                elements$1230.push(tmp$1233);
                if (tmp$1233 && tmp$1233.type === Syntax$820.SpreadElement) {
                    if (!match$882(']')) {
                        throwError$877({}, Messages$822.ElementAfterSpreadElement);
                    }
                } else if (!(match$882(']') || matchKeyword$883('for') || matchKeyword$883('if'))) {
                    expect$880(',');
                    // this lexes.
                    possiblecomprehension$1234 = false;
                }
            }
        }
        expect$880(']');
        if (filter$1232 && !blocks$1231.length) {
            throwError$877({}, Messages$822.ComprehensionRequiresBlock);
        }
        if (blocks$1231.length) {
            if (elements$1230.length !== 1) {
                throwError$877({}, Messages$822.ComprehensionError);
            }
            return {
                type: Syntax$820.ComprehensionExpression,
                filter: filter$1232,
                blocks: blocks$1231,
                body: elements$1230[0]
            };
        }
        return delegate$836.createArrayExpression(elements$1230);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$890(options$1236) {
        var previousStrict$1237, previousYieldAllowed$1238, params$1239, defaults$1240, body$1241;
        previousStrict$1237 = strict$827;
        previousYieldAllowed$1238 = state$841.yieldAllowed;
        state$841.yieldAllowed = options$1236.generator;
        params$1239 = options$1236.params || [];
        defaults$1240 = options$1236.defaults || [];
        body$1241 = parseConciseBody$949();
        if (options$1236.name && strict$827 && isRestrictedWord$854(params$1239[0].name)) {
            throwErrorTolerant$878(options$1236.name, Messages$822.StrictParamName);
        }
        if (state$841.yieldAllowed && !state$841.yieldFound) {
            throwErrorTolerant$878({}, Messages$822.NoYieldInGenerator);
        }
        strict$827 = previousStrict$1237;
        state$841.yieldAllowed = previousYieldAllowed$1238;
        return delegate$836.createFunctionExpression(null, params$1239, defaults$1240, body$1241, options$1236.rest || null, options$1236.generator, body$1241.type !== Syntax$820.BlockStatement);
    }
    function parsePropertyMethodFunction$891(options$1242) {
        var previousStrict$1243, tmp$1244, method$1245;
        previousStrict$1243 = strict$827;
        strict$827 = true;
        tmp$1244 = parseParams$953();
        if (tmp$1244.stricted) {
            throwErrorTolerant$878(tmp$1244.stricted, tmp$1244.message);
        }
        method$1245 = parsePropertyFunction$890({
            params: tmp$1244.params,
            defaults: tmp$1244.defaults,
            rest: tmp$1244.rest,
            generator: options$1242.generator
        });
        strict$827 = previousStrict$1243;
        return method$1245;
    }
    function parseObjectPropertyKey$892() {
        var token$1246 = lex$873();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1246.type === Token$817.StringLiteral || token$1246.type === Token$817.NumericLiteral) {
            if (strict$827 && token$1246.octal) {
                throwErrorTolerant$878(token$1246, Messages$822.StrictOctalLiteral);
            }
            return delegate$836.createLiteral(token$1246);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$836.createIdentifier(token$1246.value);
    }
    function parseObjectProperty$893() {
        var token$1247, key$1248, id$1249, value$1250, param$1251;
        token$1247 = lookahead$839;
        if (token$1247.type === Token$817.Identifier) {
            id$1249 = parseObjectPropertyKey$892();
            // Property Assignment: Getter and Setter.
            if (token$1247.value === 'get' && !(match$882(':') || match$882('('))) {
                key$1248 = parseObjectPropertyKey$892();
                expect$880('(');
                expect$880(')');
                return delegate$836.createProperty('get', key$1248, parsePropertyFunction$890({ generator: false }), false, false);
            }
            if (token$1247.value === 'set' && !(match$882(':') || match$882('('))) {
                key$1248 = parseObjectPropertyKey$892();
                expect$880('(');
                token$1247 = lookahead$839;
                param$1251 = [parseVariableIdentifier$920()];
                expect$880(')');
                return delegate$836.createProperty('set', key$1248, parsePropertyFunction$890({
                    params: param$1251,
                    generator: false,
                    name: token$1247
                }), false, false);
            }
            if (match$882(':')) {
                lex$873();
                return delegate$836.createProperty('init', id$1249, parseAssignmentExpression$916(), false, false);
            }
            if (match$882('(')) {
                return delegate$836.createProperty('init', id$1249, parsePropertyMethodFunction$891({ generator: false }), true, false);
            }
            return delegate$836.createProperty('init', id$1249, id$1249, false, true);
        }
        if (token$1247.type === Token$817.EOF || token$1247.type === Token$817.Punctuator) {
            if (!match$882('*')) {
                throwUnexpected$879(token$1247);
            }
            lex$873();
            id$1249 = parseObjectPropertyKey$892();
            if (!match$882('(')) {
                throwUnexpected$879(lex$873());
            }
            return delegate$836.createProperty('init', id$1249, parsePropertyMethodFunction$891({ generator: true }), true, false);
        }
        key$1248 = parseObjectPropertyKey$892();
        if (match$882(':')) {
            lex$873();
            return delegate$836.createProperty('init', key$1248, parseAssignmentExpression$916(), false, false);
        }
        if (match$882('(')) {
            return delegate$836.createProperty('init', key$1248, parsePropertyMethodFunction$891({ generator: false }), true, false);
        }
        throwUnexpected$879(lex$873());
    }
    function parseObjectInitialiser$894() {
        var properties$1252 = [], property$1253, name$1254, key$1255, kind$1256, map$1257 = {}, toString$1258 = String;
        expect$880('{');
        while (!match$882('}')) {
            property$1253 = parseObjectProperty$893();
            if (property$1253.key.type === Syntax$820.Identifier) {
                name$1254 = property$1253.key.name;
            } else {
                name$1254 = toString$1258(property$1253.key.value);
            }
            kind$1256 = property$1253.kind === 'init' ? PropertyKind$821.Data : property$1253.kind === 'get' ? PropertyKind$821.Get : PropertyKind$821.Set;
            key$1255 = '$' + name$1254;
            if (Object.prototype.hasOwnProperty.call(map$1257, key$1255)) {
                if (map$1257[key$1255] === PropertyKind$821.Data) {
                    if (strict$827 && kind$1256 === PropertyKind$821.Data) {
                        throwErrorTolerant$878({}, Messages$822.StrictDuplicateProperty);
                    } else if (kind$1256 !== PropertyKind$821.Data) {
                        throwErrorTolerant$878({}, Messages$822.AccessorDataProperty);
                    }
                } else {
                    if (kind$1256 === PropertyKind$821.Data) {
                        throwErrorTolerant$878({}, Messages$822.AccessorDataProperty);
                    } else if (map$1257[key$1255] & kind$1256) {
                        throwErrorTolerant$878({}, Messages$822.AccessorGetSet);
                    }
                }
                map$1257[key$1255] |= kind$1256;
            } else {
                map$1257[key$1255] = kind$1256;
            }
            properties$1252.push(property$1253);
            if (!match$882('}')) {
                expect$880(',');
            }
        }
        expect$880('}');
        return delegate$836.createObjectExpression(properties$1252);
    }
    function parseTemplateElement$895(option$1259) {
        var token$1260 = scanTemplateElement$868(option$1259);
        if (strict$827 && token$1260.octal) {
            throwError$877(token$1260, Messages$822.StrictOctalLiteral);
        }
        return delegate$836.createTemplateElement({
            raw: token$1260.value.raw,
            cooked: token$1260.value.cooked
        }, token$1260.tail);
    }
    function parseTemplateLiteral$896() {
        var quasi$1261, quasis$1262, expressions$1263;
        quasi$1261 = parseTemplateElement$895({ head: true });
        quasis$1262 = [quasi$1261];
        expressions$1263 = [];
        while (!quasi$1261.tail) {
            expressions$1263.push(parseExpression$917());
            quasi$1261 = parseTemplateElement$895({ head: false });
            quasis$1262.push(quasi$1261);
        }
        return delegate$836.createTemplateLiteral(quasis$1262, expressions$1263);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$897() {
        var expr$1264;
        expect$880('(');
        ++state$841.parenthesizedCount;
        expr$1264 = parseExpression$917();
        expect$880(')');
        return expr$1264;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$898() {
        var type$1265, token$1266, resolvedIdent$1267;
        token$1266 = lookahead$839;
        type$1265 = lookahead$839.type;
        if (type$1265 === Token$817.Identifier) {
            resolvedIdent$1267 = expander$816.resolve(tokenStream$837[lookaheadIndex$840]);
            lex$873();
            return delegate$836.createIdentifier(resolvedIdent$1267);
        }
        if (type$1265 === Token$817.StringLiteral || type$1265 === Token$817.NumericLiteral) {
            if (strict$827 && lookahead$839.octal) {
                throwErrorTolerant$878(lookahead$839, Messages$822.StrictOctalLiteral);
            }
            return delegate$836.createLiteral(lex$873());
        }
        if (type$1265 === Token$817.Keyword) {
            if (matchKeyword$883('this')) {
                lex$873();
                return delegate$836.createThisExpression();
            }
            if (matchKeyword$883('function')) {
                return parseFunctionExpression$955();
            }
            if (matchKeyword$883('class')) {
                return parseClassExpression$960();
            }
            if (matchKeyword$883('super')) {
                lex$873();
                return delegate$836.createIdentifier('super');
            }
        }
        if (type$1265 === Token$817.BooleanLiteral) {
            token$1266 = lex$873();
            token$1266.value = token$1266.value === 'true';
            return delegate$836.createLiteral(token$1266);
        }
        if (type$1265 === Token$817.NullLiteral) {
            token$1266 = lex$873();
            token$1266.value = null;
            return delegate$836.createLiteral(token$1266);
        }
        if (match$882('[')) {
            return parseArrayInitialiser$889();
        }
        if (match$882('{')) {
            return parseObjectInitialiser$894();
        }
        if (match$882('(')) {
            return parseGroupExpression$897();
        }
        if (lookahead$839.type === Token$817.RegularExpression) {
            return delegate$836.createLiteral(lex$873());
        }
        if (type$1265 === Token$817.Template) {
            return parseTemplateLiteral$896();
        }
        return throwUnexpected$879(lex$873());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$899() {
        var args$1268 = [], arg$1269;
        expect$880('(');
        if (!match$882(')')) {
            while (streamIndex$838 < length$835) {
                arg$1269 = parseSpreadOrAssignmentExpression$900();
                args$1268.push(arg$1269);
                if (match$882(')')) {
                    break;
                } else if (arg$1269.type === Syntax$820.SpreadElement) {
                    throwError$877({}, Messages$822.ElementAfterSpreadElement);
                }
                expect$880(',');
            }
        }
        expect$880(')');
        return args$1268;
    }
    function parseSpreadOrAssignmentExpression$900() {
        if (match$882('...')) {
            lex$873();
            return delegate$836.createSpreadElement(parseAssignmentExpression$916());
        }
        return parseAssignmentExpression$916();
    }
    function parseNonComputedProperty$901() {
        var token$1270 = lex$873();
        if (!isIdentifierName$870(token$1270)) {
            throwUnexpected$879(token$1270);
        }
        return delegate$836.createIdentifier(token$1270.value);
    }
    function parseNonComputedMember$902() {
        expect$880('.');
        return parseNonComputedProperty$901();
    }
    function parseComputedMember$903() {
        var expr$1271;
        expect$880('[');
        expr$1271 = parseExpression$917();
        expect$880(']');
        return expr$1271;
    }
    function parseNewExpression$904() {
        var callee$1272, args$1273;
        expectKeyword$881('new');
        callee$1272 = parseLeftHandSideExpression$906();
        args$1273 = match$882('(') ? parseArguments$899() : [];
        return delegate$836.createNewExpression(callee$1272, args$1273);
    }
    function parseLeftHandSideExpressionAllowCall$905() {
        var expr$1274, args$1275, property$1276;
        expr$1274 = matchKeyword$883('new') ? parseNewExpression$904() : parsePrimaryExpression$898();
        while (match$882('.') || match$882('[') || match$882('(') || lookahead$839.type === Token$817.Template) {
            if (match$882('(')) {
                args$1275 = parseArguments$899();
                expr$1274 = delegate$836.createCallExpression(expr$1274, args$1275);
            } else if (match$882('[')) {
                expr$1274 = delegate$836.createMemberExpression('[', expr$1274, parseComputedMember$903());
            } else if (match$882('.')) {
                expr$1274 = delegate$836.createMemberExpression('.', expr$1274, parseNonComputedMember$902());
            } else {
                expr$1274 = delegate$836.createTaggedTemplateExpression(expr$1274, parseTemplateLiteral$896());
            }
        }
        return expr$1274;
    }
    function parseLeftHandSideExpression$906() {
        var expr$1277, property$1278;
        expr$1277 = matchKeyword$883('new') ? parseNewExpression$904() : parsePrimaryExpression$898();
        while (match$882('.') || match$882('[') || lookahead$839.type === Token$817.Template) {
            if (match$882('[')) {
                expr$1277 = delegate$836.createMemberExpression('[', expr$1277, parseComputedMember$903());
            } else if (match$882('.')) {
                expr$1277 = delegate$836.createMemberExpression('.', expr$1277, parseNonComputedMember$902());
            } else {
                expr$1277 = delegate$836.createTaggedTemplateExpression(expr$1277, parseTemplateLiteral$896());
            }
        }
        return expr$1277;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$907() {
        var expr$1279 = parseLeftHandSideExpressionAllowCall$905(), token$1280 = lookahead$839;
        if (lookahead$839.type !== Token$817.Punctuator) {
            return expr$1279;
        }
        if ((match$882('++') || match$882('--')) && !peekLineTerminator$876()) {
            // 11.3.1, 11.3.2
            if (strict$827 && expr$1279.type === Syntax$820.Identifier && isRestrictedWord$854(expr$1279.name)) {
                throwErrorTolerant$878({}, Messages$822.StrictLHSPostfix);
            }
            if (!isLeftHandSide$887(expr$1279)) {
                throwError$877({}, Messages$822.InvalidLHSInAssignment);
            }
            token$1280 = lex$873();
            expr$1279 = delegate$836.createPostfixExpression(token$1280.value, expr$1279);
        }
        return expr$1279;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$908() {
        var token$1281, expr$1282;
        if (lookahead$839.type !== Token$817.Punctuator && lookahead$839.type !== Token$817.Keyword) {
            return parsePostfixExpression$907();
        }
        if (match$882('++') || match$882('--')) {
            token$1281 = lex$873();
            expr$1282 = parseUnaryExpression$908();
            // 11.4.4, 11.4.5
            if (strict$827 && expr$1282.type === Syntax$820.Identifier && isRestrictedWord$854(expr$1282.name)) {
                throwErrorTolerant$878({}, Messages$822.StrictLHSPrefix);
            }
            if (!isLeftHandSide$887(expr$1282)) {
                throwError$877({}, Messages$822.InvalidLHSInAssignment);
            }
            return delegate$836.createUnaryExpression(token$1281.value, expr$1282);
        }
        if (match$882('+') || match$882('-') || match$882('~') || match$882('!')) {
            token$1281 = lex$873();
            expr$1282 = parseUnaryExpression$908();
            return delegate$836.createUnaryExpression(token$1281.value, expr$1282);
        }
        if (matchKeyword$883('delete') || matchKeyword$883('void') || matchKeyword$883('typeof')) {
            token$1281 = lex$873();
            expr$1282 = parseUnaryExpression$908();
            expr$1282 = delegate$836.createUnaryExpression(token$1281.value, expr$1282);
            if (strict$827 && expr$1282.operator === 'delete' && expr$1282.argument.type === Syntax$820.Identifier) {
                throwErrorTolerant$878({}, Messages$822.StrictDelete);
            }
            return expr$1282;
        }
        return parsePostfixExpression$907();
    }
    function binaryPrecedence$909(token$1283, allowIn$1284) {
        var prec$1285 = 0;
        if (token$1283.type !== Token$817.Punctuator && token$1283.type !== Token$817.Keyword) {
            return 0;
        }
        switch (token$1283.value) {
        case '||':
            prec$1285 = 1;
            break;
        case '&&':
            prec$1285 = 2;
            break;
        case '|':
            prec$1285 = 3;
            break;
        case '^':
            prec$1285 = 4;
            break;
        case '&':
            prec$1285 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1285 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1285 = 7;
            break;
        case 'in':
            prec$1285 = allowIn$1284 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1285 = 8;
            break;
        case '+':
        case '-':
            prec$1285 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1285 = 11;
            break;
        default:
            break;
        }
        return prec$1285;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$910() {
        var expr$1286, token$1287, prec$1288, previousAllowIn$1289, stack$1290, right$1291, operator$1292, left$1293, i$1294;
        previousAllowIn$1289 = state$841.allowIn;
        state$841.allowIn = true;
        expr$1286 = parseUnaryExpression$908();
        token$1287 = lookahead$839;
        prec$1288 = binaryPrecedence$909(token$1287, previousAllowIn$1289);
        if (prec$1288 === 0) {
            return expr$1286;
        }
        token$1287.prec = prec$1288;
        lex$873();
        stack$1290 = [
            expr$1286,
            token$1287,
            parseUnaryExpression$908()
        ];
        while ((prec$1288 = binaryPrecedence$909(lookahead$839, previousAllowIn$1289)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1290.length > 2 && prec$1288 <= stack$1290[stack$1290.length - 2].prec) {
                right$1291 = stack$1290.pop();
                operator$1292 = stack$1290.pop().value;
                left$1293 = stack$1290.pop();
                stack$1290.push(delegate$836.createBinaryExpression(operator$1292, left$1293, right$1291));
            }
            // Shift.
            token$1287 = lex$873();
            token$1287.prec = prec$1288;
            stack$1290.push(token$1287);
            stack$1290.push(parseUnaryExpression$908());
        }
        state$841.allowIn = previousAllowIn$1289;
        // Final reduce to clean-up the stack.
        i$1294 = stack$1290.length - 1;
        expr$1286 = stack$1290[i$1294];
        while (i$1294 > 1) {
            expr$1286 = delegate$836.createBinaryExpression(stack$1290[i$1294 - 1].value, stack$1290[i$1294 - 2], expr$1286);
            i$1294 -= 2;
        }
        return expr$1286;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$911() {
        var expr$1295, previousAllowIn$1296, consequent$1297, alternate$1298;
        expr$1295 = parseBinaryExpression$910();
        if (match$882('?')) {
            lex$873();
            previousAllowIn$1296 = state$841.allowIn;
            state$841.allowIn = true;
            consequent$1297 = parseAssignmentExpression$916();
            state$841.allowIn = previousAllowIn$1296;
            expect$880(':');
            alternate$1298 = parseAssignmentExpression$916();
            expr$1295 = delegate$836.createConditionalExpression(expr$1295, consequent$1297, alternate$1298);
        }
        return expr$1295;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$912(expr$1299) {
        var i$1300, len$1301, property$1302, element$1303;
        if (expr$1299.type === Syntax$820.ObjectExpression) {
            expr$1299.type = Syntax$820.ObjectPattern;
            for (i$1300 = 0, len$1301 = expr$1299.properties.length; i$1300 < len$1301; i$1300 += 1) {
                property$1302 = expr$1299.properties[i$1300];
                if (property$1302.kind !== 'init') {
                    throwError$877({}, Messages$822.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$912(property$1302.value);
            }
        } else if (expr$1299.type === Syntax$820.ArrayExpression) {
            expr$1299.type = Syntax$820.ArrayPattern;
            for (i$1300 = 0, len$1301 = expr$1299.elements.length; i$1300 < len$1301; i$1300 += 1) {
                element$1303 = expr$1299.elements[i$1300];
                if (element$1303) {
                    reinterpretAsAssignmentBindingPattern$912(element$1303);
                }
            }
        } else if (expr$1299.type === Syntax$820.Identifier) {
            if (isRestrictedWord$854(expr$1299.name)) {
                throwError$877({}, Messages$822.InvalidLHSInAssignment);
            }
        } else if (expr$1299.type === Syntax$820.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$912(expr$1299.argument);
            if (expr$1299.argument.type === Syntax$820.ObjectPattern) {
                throwError$877({}, Messages$822.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1299.type !== Syntax$820.MemberExpression && expr$1299.type !== Syntax$820.CallExpression && expr$1299.type !== Syntax$820.NewExpression) {
                throwError$877({}, Messages$822.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$913(options$1304, expr$1305) {
        var i$1306, len$1307, property$1308, element$1309;
        if (expr$1305.type === Syntax$820.ObjectExpression) {
            expr$1305.type = Syntax$820.ObjectPattern;
            for (i$1306 = 0, len$1307 = expr$1305.properties.length; i$1306 < len$1307; i$1306 += 1) {
                property$1308 = expr$1305.properties[i$1306];
                if (property$1308.kind !== 'init') {
                    throwError$877({}, Messages$822.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$913(options$1304, property$1308.value);
            }
        } else if (expr$1305.type === Syntax$820.ArrayExpression) {
            expr$1305.type = Syntax$820.ArrayPattern;
            for (i$1306 = 0, len$1307 = expr$1305.elements.length; i$1306 < len$1307; i$1306 += 1) {
                element$1309 = expr$1305.elements[i$1306];
                if (element$1309) {
                    reinterpretAsDestructuredParameter$913(options$1304, element$1309);
                }
            }
        } else if (expr$1305.type === Syntax$820.Identifier) {
            validateParam$951(options$1304, expr$1305, expr$1305.name);
        } else {
            if (expr$1305.type !== Syntax$820.MemberExpression) {
                throwError$877({}, Messages$822.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$914(expressions$1310) {
        var i$1311, len$1312, param$1313, params$1314, defaults$1315, defaultCount$1316, options$1317, rest$1318;
        params$1314 = [];
        defaults$1315 = [];
        defaultCount$1316 = 0;
        rest$1318 = null;
        options$1317 = { paramSet: {} };
        for (i$1311 = 0, len$1312 = expressions$1310.length; i$1311 < len$1312; i$1311 += 1) {
            param$1313 = expressions$1310[i$1311];
            if (param$1313.type === Syntax$820.Identifier) {
                params$1314.push(param$1313);
                defaults$1315.push(null);
                validateParam$951(options$1317, param$1313, param$1313.name);
            } else if (param$1313.type === Syntax$820.ObjectExpression || param$1313.type === Syntax$820.ArrayExpression) {
                reinterpretAsDestructuredParameter$913(options$1317, param$1313);
                params$1314.push(param$1313);
                defaults$1315.push(null);
            } else if (param$1313.type === Syntax$820.SpreadElement) {
                assert$843(i$1311 === len$1312 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$913(options$1317, param$1313.argument);
                rest$1318 = param$1313.argument;
            } else if (param$1313.type === Syntax$820.AssignmentExpression) {
                params$1314.push(param$1313.left);
                defaults$1315.push(param$1313.right);
                ++defaultCount$1316;
                validateParam$951(options$1317, param$1313.left, param$1313.left.name);
            } else {
                return null;
            }
        }
        if (options$1317.message === Messages$822.StrictParamDupe) {
            throwError$877(strict$827 ? options$1317.stricted : options$1317.firstRestricted, options$1317.message);
        }
        if (defaultCount$1316 === 0) {
            defaults$1315 = [];
        }
        return {
            params: params$1314,
            defaults: defaults$1315,
            rest: rest$1318,
            stricted: options$1317.stricted,
            firstRestricted: options$1317.firstRestricted,
            message: options$1317.message
        };
    }
    function parseArrowFunctionExpression$915(options$1319) {
        var previousStrict$1320, previousYieldAllowed$1321, body$1322;
        expect$880('=>');
        previousStrict$1320 = strict$827;
        previousYieldAllowed$1321 = state$841.yieldAllowed;
        state$841.yieldAllowed = false;
        body$1322 = parseConciseBody$949();
        if (strict$827 && options$1319.firstRestricted) {
            throwError$877(options$1319.firstRestricted, options$1319.message);
        }
        if (strict$827 && options$1319.stricted) {
            throwErrorTolerant$878(options$1319.stricted, options$1319.message);
        }
        strict$827 = previousStrict$1320;
        state$841.yieldAllowed = previousYieldAllowed$1321;
        return delegate$836.createArrowFunctionExpression(options$1319.params, options$1319.defaults, body$1322, options$1319.rest, body$1322.type !== Syntax$820.BlockStatement);
    }
    function parseAssignmentExpression$916() {
        var expr$1323, token$1324, params$1325, oldParenthesizedCount$1326;
        if (matchKeyword$883('yield')) {
            return parseYieldExpression$956();
        }
        oldParenthesizedCount$1326 = state$841.parenthesizedCount;
        if (match$882('(')) {
            token$1324 = lookahead2$875();
            if (token$1324.type === Token$817.Punctuator && token$1324.value === ')' || token$1324.value === '...') {
                params$1325 = parseParams$953();
                if (!match$882('=>')) {
                    throwUnexpected$879(lex$873());
                }
                return parseArrowFunctionExpression$915(params$1325);
            }
        }
        token$1324 = lookahead$839;
        expr$1323 = parseConditionalExpression$911();
        if (match$882('=>') && (state$841.parenthesizedCount === oldParenthesizedCount$1326 || state$841.parenthesizedCount === oldParenthesizedCount$1326 + 1)) {
            if (expr$1323.type === Syntax$820.Identifier) {
                params$1325 = reinterpretAsCoverFormalsList$914([expr$1323]);
            } else if (expr$1323.type === Syntax$820.SequenceExpression) {
                params$1325 = reinterpretAsCoverFormalsList$914(expr$1323.expressions);
            }
            if (params$1325) {
                return parseArrowFunctionExpression$915(params$1325);
            }
        }
        if (matchAssign$885()) {
            // 11.13.1
            if (strict$827 && expr$1323.type === Syntax$820.Identifier && isRestrictedWord$854(expr$1323.name)) {
                throwErrorTolerant$878(token$1324, Messages$822.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$882('=') && (expr$1323.type === Syntax$820.ObjectExpression || expr$1323.type === Syntax$820.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$912(expr$1323);
            } else if (!isLeftHandSide$887(expr$1323)) {
                throwError$877({}, Messages$822.InvalidLHSInAssignment);
            }
            expr$1323 = delegate$836.createAssignmentExpression(lex$873().value, expr$1323, parseAssignmentExpression$916());
        }
        return expr$1323;
    }
    // 11.14 Comma Operator
    function parseExpression$917() {
        var expr$1327, expressions$1328, sequence$1329, coverFormalsList$1330, spreadFound$1331, oldParenthesizedCount$1332;
        oldParenthesizedCount$1332 = state$841.parenthesizedCount;
        expr$1327 = parseAssignmentExpression$916();
        expressions$1328 = [expr$1327];
        if (match$882(',')) {
            while (streamIndex$838 < length$835) {
                if (!match$882(',')) {
                    break;
                }
                lex$873();
                expr$1327 = parseSpreadOrAssignmentExpression$900();
                expressions$1328.push(expr$1327);
                if (expr$1327.type === Syntax$820.SpreadElement) {
                    spreadFound$1331 = true;
                    if (!match$882(')')) {
                        throwError$877({}, Messages$822.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1329 = delegate$836.createSequenceExpression(expressions$1328);
        }
        if (match$882('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$841.parenthesizedCount === oldParenthesizedCount$1332 || state$841.parenthesizedCount === oldParenthesizedCount$1332 + 1) {
                expr$1327 = expr$1327.type === Syntax$820.SequenceExpression ? expr$1327.expressions : expressions$1328;
                coverFormalsList$1330 = reinterpretAsCoverFormalsList$914(expr$1327);
                if (coverFormalsList$1330) {
                    return parseArrowFunctionExpression$915(coverFormalsList$1330);
                }
            }
            throwUnexpected$879(lex$873());
        }
        if (spreadFound$1331 && lookahead2$875().value !== '=>') {
            throwError$877({}, Messages$822.IllegalSpread);
        }
        return sequence$1329 || expr$1327;
    }
    // 12.1 Block
    function parseStatementList$918() {
        var list$1333 = [], statement$1334;
        while (streamIndex$838 < length$835) {
            if (match$882('}')) {
                break;
            }
            statement$1334 = parseSourceElement$963();
            if (typeof statement$1334 === 'undefined') {
                break;
            }
            list$1333.push(statement$1334);
        }
        return list$1333;
    }
    function parseBlock$919() {
        var block$1335;
        expect$880('{');
        block$1335 = parseStatementList$918();
        expect$880('}');
        return delegate$836.createBlockStatement(block$1335);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$920() {
        var token$1336 = lookahead$839, resolvedIdent$1337;
        if (token$1336.type !== Token$817.Identifier) {
            throwUnexpected$879(token$1336);
        }
        resolvedIdent$1337 = expander$816.resolve(tokenStream$837[lookaheadIndex$840]);
        lex$873();
        return delegate$836.createIdentifier(resolvedIdent$1337);
    }
    function parseVariableDeclaration$921(kind$1338) {
        var id$1339, init$1340 = null;
        if (match$882('{')) {
            id$1339 = parseObjectInitialiser$894();
            reinterpretAsAssignmentBindingPattern$912(id$1339);
        } else if (match$882('[')) {
            id$1339 = parseArrayInitialiser$889();
            reinterpretAsAssignmentBindingPattern$912(id$1339);
        } else {
            id$1339 = state$841.allowKeyword ? parseNonComputedProperty$901() : parseVariableIdentifier$920();
            // 12.2.1
            if (strict$827 && isRestrictedWord$854(id$1339.name)) {
                throwErrorTolerant$878({}, Messages$822.StrictVarName);
            }
        }
        if (kind$1338 === 'const') {
            if (!match$882('=')) {
                throwError$877({}, Messages$822.NoUnintializedConst);
            }
            expect$880('=');
            init$1340 = parseAssignmentExpression$916();
        } else if (match$882('=')) {
            lex$873();
            init$1340 = parseAssignmentExpression$916();
        }
        return delegate$836.createVariableDeclarator(id$1339, init$1340);
    }
    function parseVariableDeclarationList$922(kind$1341) {
        var list$1342 = [];
        do {
            list$1342.push(parseVariableDeclaration$921(kind$1341));
            if (!match$882(',')) {
                break;
            }
            lex$873();
        } while (streamIndex$838 < length$835);
        return list$1342;
    }
    function parseVariableStatement$923() {
        var declarations$1343;
        expectKeyword$881('var');
        declarations$1343 = parseVariableDeclarationList$922();
        consumeSemicolon$886();
        return delegate$836.createVariableDeclaration(declarations$1343, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$924(kind$1344) {
        var declarations$1345;
        expectKeyword$881(kind$1344);
        declarations$1345 = parseVariableDeclarationList$922(kind$1344);
        consumeSemicolon$886();
        return delegate$836.createVariableDeclaration(declarations$1345, kind$1344);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$925() {
        var id$1346, src$1347, body$1348;
        lex$873();
        // 'module'
        if (peekLineTerminator$876()) {
            throwError$877({}, Messages$822.NewlineAfterModule);
        }
        switch (lookahead$839.type) {
        case Token$817.StringLiteral:
            id$1346 = parsePrimaryExpression$898();
            body$1348 = parseModuleBlock$968();
            src$1347 = null;
            break;
        case Token$817.Identifier:
            id$1346 = parseVariableIdentifier$920();
            body$1348 = null;
            if (!matchContextualKeyword$884('from')) {
                throwUnexpected$879(lex$873());
            }
            lex$873();
            src$1347 = parsePrimaryExpression$898();
            if (src$1347.type !== Syntax$820.Literal) {
                throwError$877({}, Messages$822.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$886();
        return delegate$836.createModuleDeclaration(id$1346, src$1347, body$1348);
    }
    function parseExportBatchSpecifier$926() {
        expect$880('*');
        return delegate$836.createExportBatchSpecifier();
    }
    function parseExportSpecifier$927() {
        var id$1349, name$1350 = null;
        id$1349 = parseVariableIdentifier$920();
        if (matchContextualKeyword$884('as')) {
            lex$873();
            name$1350 = parseNonComputedProperty$901();
        }
        return delegate$836.createExportSpecifier(id$1349, name$1350);
    }
    function parseExportDeclaration$928() {
        var previousAllowKeyword$1351, decl$1352, def$1353, src$1354, specifiers$1355;
        expectKeyword$881('export');
        if (lookahead$839.type === Token$817.Keyword) {
            switch (lookahead$839.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$836.createExportDeclaration(parseSourceElement$963(), null, null);
            }
        }
        if (isIdentifierName$870(lookahead$839)) {
            previousAllowKeyword$1351 = state$841.allowKeyword;
            state$841.allowKeyword = true;
            decl$1352 = parseVariableDeclarationList$922('let');
            state$841.allowKeyword = previousAllowKeyword$1351;
            return delegate$836.createExportDeclaration(decl$1352, null, null);
        }
        specifiers$1355 = [];
        src$1354 = null;
        if (match$882('*')) {
            specifiers$1355.push(parseExportBatchSpecifier$926());
        } else {
            expect$880('{');
            do {
                specifiers$1355.push(parseExportSpecifier$927());
            } while (match$882(',') && lex$873());
            expect$880('}');
        }
        if (matchContextualKeyword$884('from')) {
            lex$873();
            src$1354 = parsePrimaryExpression$898();
            if (src$1354.type !== Syntax$820.Literal) {
                throwError$877({}, Messages$822.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$886();
        return delegate$836.createExportDeclaration(null, specifiers$1355, src$1354);
    }
    function parseImportDeclaration$929() {
        var specifiers$1356, kind$1357, src$1358;
        expectKeyword$881('import');
        specifiers$1356 = [];
        if (isIdentifierName$870(lookahead$839)) {
            kind$1357 = 'default';
            specifiers$1356.push(parseImportSpecifier$930());
            if (!matchContextualKeyword$884('from')) {
                throwError$877({}, Messages$822.NoFromAfterImport);
            }
            lex$873();
        } else if (match$882('{')) {
            kind$1357 = 'named';
            lex$873();
            do {
                specifiers$1356.push(parseImportSpecifier$930());
            } while (match$882(',') && lex$873());
            expect$880('}');
            if (!matchContextualKeyword$884('from')) {
                throwError$877({}, Messages$822.NoFromAfterImport);
            }
            lex$873();
        }
        src$1358 = parsePrimaryExpression$898();
        if (src$1358.type !== Syntax$820.Literal) {
            throwError$877({}, Messages$822.InvalidModuleSpecifier);
        }
        consumeSemicolon$886();
        return delegate$836.createImportDeclaration(specifiers$1356, kind$1357, src$1358);
    }
    function parseImportSpecifier$930() {
        var id$1359, name$1360 = null;
        id$1359 = parseNonComputedProperty$901();
        if (matchContextualKeyword$884('as')) {
            lex$873();
            name$1360 = parseVariableIdentifier$920();
        }
        return delegate$836.createImportSpecifier(id$1359, name$1360);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$931() {
        expect$880(';');
        return delegate$836.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$932() {
        var expr$1361 = parseExpression$917();
        consumeSemicolon$886();
        return delegate$836.createExpressionStatement(expr$1361);
    }
    // 12.5 If statement
    function parseIfStatement$933() {
        var test$1362, consequent$1363, alternate$1364;
        expectKeyword$881('if');
        expect$880('(');
        test$1362 = parseExpression$917();
        expect$880(')');
        consequent$1363 = parseStatement$948();
        if (matchKeyword$883('else')) {
            lex$873();
            alternate$1364 = parseStatement$948();
        } else {
            alternate$1364 = null;
        }
        return delegate$836.createIfStatement(test$1362, consequent$1363, alternate$1364);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$934() {
        var body$1365, test$1366, oldInIteration$1367;
        expectKeyword$881('do');
        oldInIteration$1367 = state$841.inIteration;
        state$841.inIteration = true;
        body$1365 = parseStatement$948();
        state$841.inIteration = oldInIteration$1367;
        expectKeyword$881('while');
        expect$880('(');
        test$1366 = parseExpression$917();
        expect$880(')');
        if (match$882(';')) {
            lex$873();
        }
        return delegate$836.createDoWhileStatement(body$1365, test$1366);
    }
    function parseWhileStatement$935() {
        var test$1368, body$1369, oldInIteration$1370;
        expectKeyword$881('while');
        expect$880('(');
        test$1368 = parseExpression$917();
        expect$880(')');
        oldInIteration$1370 = state$841.inIteration;
        state$841.inIteration = true;
        body$1369 = parseStatement$948();
        state$841.inIteration = oldInIteration$1370;
        return delegate$836.createWhileStatement(test$1368, body$1369);
    }
    function parseForVariableDeclaration$936() {
        var token$1371 = lex$873(), declarations$1372 = parseVariableDeclarationList$922();
        return delegate$836.createVariableDeclaration(declarations$1372, token$1371.value);
    }
    function parseForStatement$937(opts$1373) {
        var init$1374, test$1375, update$1376, left$1377, right$1378, body$1379, operator$1380, oldInIteration$1381;
        init$1374 = test$1375 = update$1376 = null;
        expectKeyword$881('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$884('each')) {
            throwError$877({}, Messages$822.EachNotAllowed);
        }
        expect$880('(');
        if (match$882(';')) {
            lex$873();
        } else {
            if (matchKeyword$883('var') || matchKeyword$883('let') || matchKeyword$883('const')) {
                state$841.allowIn = false;
                init$1374 = parseForVariableDeclaration$936();
                state$841.allowIn = true;
                if (init$1374.declarations.length === 1) {
                    if (matchKeyword$883('in') || matchContextualKeyword$884('of')) {
                        operator$1380 = lookahead$839;
                        if (!((operator$1380.value === 'in' || init$1374.kind !== 'var') && init$1374.declarations[0].init)) {
                            lex$873();
                            left$1377 = init$1374;
                            right$1378 = parseExpression$917();
                            init$1374 = null;
                        }
                    }
                }
            } else {
                state$841.allowIn = false;
                init$1374 = parseExpression$917();
                state$841.allowIn = true;
                if (matchContextualKeyword$884('of')) {
                    operator$1380 = lex$873();
                    left$1377 = init$1374;
                    right$1378 = parseExpression$917();
                    init$1374 = null;
                } else if (matchKeyword$883('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$888(init$1374)) {
                        throwError$877({}, Messages$822.InvalidLHSInForIn);
                    }
                    operator$1380 = lex$873();
                    left$1377 = init$1374;
                    right$1378 = parseExpression$917();
                    init$1374 = null;
                }
            }
            if (typeof left$1377 === 'undefined') {
                expect$880(';');
            }
        }
        if (typeof left$1377 === 'undefined') {
            if (!match$882(';')) {
                test$1375 = parseExpression$917();
            }
            expect$880(';');
            if (!match$882(')')) {
                update$1376 = parseExpression$917();
            }
        }
        expect$880(')');
        oldInIteration$1381 = state$841.inIteration;
        state$841.inIteration = true;
        if (!(opts$1373 !== undefined && opts$1373.ignoreBody)) {
            body$1379 = parseStatement$948();
        }
        state$841.inIteration = oldInIteration$1381;
        if (typeof left$1377 === 'undefined') {
            return delegate$836.createForStatement(init$1374, test$1375, update$1376, body$1379);
        }
        if (operator$1380.value === 'in') {
            return delegate$836.createForInStatement(left$1377, right$1378, body$1379);
        }
        return delegate$836.createForOfStatement(left$1377, right$1378, body$1379);
    }
    // 12.7 The continue statement
    function parseContinueStatement$938() {
        var label$1382 = null, key$1383;
        expectKeyword$881('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$839.value.charCodeAt(0) === 59) {
            lex$873();
            if (!state$841.inIteration) {
                throwError$877({}, Messages$822.IllegalContinue);
            }
            return delegate$836.createContinueStatement(null);
        }
        if (peekLineTerminator$876()) {
            if (!state$841.inIteration) {
                throwError$877({}, Messages$822.IllegalContinue);
            }
            return delegate$836.createContinueStatement(null);
        }
        if (lookahead$839.type === Token$817.Identifier) {
            label$1382 = parseVariableIdentifier$920();
            key$1383 = '$' + label$1382.name;
            if (!Object.prototype.hasOwnProperty.call(state$841.labelSet, key$1383)) {
                throwError$877({}, Messages$822.UnknownLabel, label$1382.name);
            }
        }
        consumeSemicolon$886();
        if (label$1382 === null && !state$841.inIteration) {
            throwError$877({}, Messages$822.IllegalContinue);
        }
        return delegate$836.createContinueStatement(label$1382);
    }
    // 12.8 The break statement
    function parseBreakStatement$939() {
        var label$1384 = null, key$1385;
        expectKeyword$881('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$839.value.charCodeAt(0) === 59) {
            lex$873();
            if (!(state$841.inIteration || state$841.inSwitch)) {
                throwError$877({}, Messages$822.IllegalBreak);
            }
            return delegate$836.createBreakStatement(null);
        }
        if (peekLineTerminator$876()) {
            if (!(state$841.inIteration || state$841.inSwitch)) {
                throwError$877({}, Messages$822.IllegalBreak);
            }
            return delegate$836.createBreakStatement(null);
        }
        if (lookahead$839.type === Token$817.Identifier) {
            label$1384 = parseVariableIdentifier$920();
            key$1385 = '$' + label$1384.name;
            if (!Object.prototype.hasOwnProperty.call(state$841.labelSet, key$1385)) {
                throwError$877({}, Messages$822.UnknownLabel, label$1384.name);
            }
        }
        consumeSemicolon$886();
        if (label$1384 === null && !(state$841.inIteration || state$841.inSwitch)) {
            throwError$877({}, Messages$822.IllegalBreak);
        }
        return delegate$836.createBreakStatement(label$1384);
    }
    // 12.9 The return statement
    function parseReturnStatement$940() {
        var argument$1386 = null;
        expectKeyword$881('return');
        if (!state$841.inFunctionBody) {
            throwErrorTolerant$878({}, Messages$822.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$850(String(lookahead$839.value).charCodeAt(0))) {
            argument$1386 = parseExpression$917();
            consumeSemicolon$886();
            return delegate$836.createReturnStatement(argument$1386);
        }
        if (peekLineTerminator$876()) {
            return delegate$836.createReturnStatement(null);
        }
        if (!match$882(';')) {
            if (!match$882('}') && lookahead$839.type !== Token$817.EOF) {
                argument$1386 = parseExpression$917();
            }
        }
        consumeSemicolon$886();
        return delegate$836.createReturnStatement(argument$1386);
    }
    // 12.10 The with statement
    function parseWithStatement$941() {
        var object$1387, body$1388;
        if (strict$827) {
            throwErrorTolerant$878({}, Messages$822.StrictModeWith);
        }
        expectKeyword$881('with');
        expect$880('(');
        object$1387 = parseExpression$917();
        expect$880(')');
        body$1388 = parseStatement$948();
        return delegate$836.createWithStatement(object$1387, body$1388);
    }
    // 12.10 The swith statement
    function parseSwitchCase$942() {
        var test$1389, consequent$1390 = [], sourceElement$1391;
        if (matchKeyword$883('default')) {
            lex$873();
            test$1389 = null;
        } else {
            expectKeyword$881('case');
            test$1389 = parseExpression$917();
        }
        expect$880(':');
        while (streamIndex$838 < length$835) {
            if (match$882('}') || matchKeyword$883('default') || matchKeyword$883('case')) {
                break;
            }
            sourceElement$1391 = parseSourceElement$963();
            if (typeof sourceElement$1391 === 'undefined') {
                break;
            }
            consequent$1390.push(sourceElement$1391);
        }
        return delegate$836.createSwitchCase(test$1389, consequent$1390);
    }
    function parseSwitchStatement$943() {
        var discriminant$1392, cases$1393, clause$1394, oldInSwitch$1395, defaultFound$1396;
        expectKeyword$881('switch');
        expect$880('(');
        discriminant$1392 = parseExpression$917();
        expect$880(')');
        expect$880('{');
        cases$1393 = [];
        if (match$882('}')) {
            lex$873();
            return delegate$836.createSwitchStatement(discriminant$1392, cases$1393);
        }
        oldInSwitch$1395 = state$841.inSwitch;
        state$841.inSwitch = true;
        defaultFound$1396 = false;
        while (streamIndex$838 < length$835) {
            if (match$882('}')) {
                break;
            }
            clause$1394 = parseSwitchCase$942();
            if (clause$1394.test === null) {
                if (defaultFound$1396) {
                    throwError$877({}, Messages$822.MultipleDefaultsInSwitch);
                }
                defaultFound$1396 = true;
            }
            cases$1393.push(clause$1394);
        }
        state$841.inSwitch = oldInSwitch$1395;
        expect$880('}');
        return delegate$836.createSwitchStatement(discriminant$1392, cases$1393);
    }
    // 12.13 The throw statement
    function parseThrowStatement$944() {
        var argument$1397;
        expectKeyword$881('throw');
        if (peekLineTerminator$876()) {
            throwError$877({}, Messages$822.NewlineAfterThrow);
        }
        argument$1397 = parseExpression$917();
        consumeSemicolon$886();
        return delegate$836.createThrowStatement(argument$1397);
    }
    // 12.14 The try statement
    function parseCatchClause$945() {
        var param$1398, body$1399;
        expectKeyword$881('catch');
        expect$880('(');
        if (match$882(')')) {
            throwUnexpected$879(lookahead$839);
        }
        param$1398 = parseExpression$917();
        // 12.14.1
        if (strict$827 && param$1398.type === Syntax$820.Identifier && isRestrictedWord$854(param$1398.name)) {
            throwErrorTolerant$878({}, Messages$822.StrictCatchVariable);
        }
        expect$880(')');
        body$1399 = parseBlock$919();
        return delegate$836.createCatchClause(param$1398, body$1399);
    }
    function parseTryStatement$946() {
        var block$1400, handlers$1401 = [], finalizer$1402 = null;
        expectKeyword$881('try');
        block$1400 = parseBlock$919();
        if (matchKeyword$883('catch')) {
            handlers$1401.push(parseCatchClause$945());
        }
        if (matchKeyword$883('finally')) {
            lex$873();
            finalizer$1402 = parseBlock$919();
        }
        if (handlers$1401.length === 0 && !finalizer$1402) {
            throwError$877({}, Messages$822.NoCatchOrFinally);
        }
        return delegate$836.createTryStatement(block$1400, [], handlers$1401, finalizer$1402);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$947() {
        expectKeyword$881('debugger');
        consumeSemicolon$886();
        return delegate$836.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$948() {
        var type$1403 = lookahead$839.type, expr$1404, labeledBody$1405, key$1406;
        if (type$1403 === Token$817.EOF) {
            throwUnexpected$879(lookahead$839);
        }
        if (type$1403 === Token$817.Punctuator) {
            switch (lookahead$839.value) {
            case ';':
                return parseEmptyStatement$931();
            case '{':
                return parseBlock$919();
            case '(':
                return parseExpressionStatement$932();
            default:
                break;
            }
        }
        if (type$1403 === Token$817.Keyword) {
            switch (lookahead$839.value) {
            case 'break':
                return parseBreakStatement$939();
            case 'continue':
                return parseContinueStatement$938();
            case 'debugger':
                return parseDebuggerStatement$947();
            case 'do':
                return parseDoWhileStatement$934();
            case 'for':
                return parseForStatement$937();
            case 'function':
                return parseFunctionDeclaration$954();
            case 'class':
                return parseClassDeclaration$961();
            case 'if':
                return parseIfStatement$933();
            case 'return':
                return parseReturnStatement$940();
            case 'switch':
                return parseSwitchStatement$943();
            case 'throw':
                return parseThrowStatement$944();
            case 'try':
                return parseTryStatement$946();
            case 'var':
                return parseVariableStatement$923();
            case 'while':
                return parseWhileStatement$935();
            case 'with':
                return parseWithStatement$941();
            default:
                break;
            }
        }
        expr$1404 = parseExpression$917();
        // 12.12 Labelled Statements
        if (expr$1404.type === Syntax$820.Identifier && match$882(':')) {
            lex$873();
            key$1406 = '$' + expr$1404.name;
            if (Object.prototype.hasOwnProperty.call(state$841.labelSet, key$1406)) {
                throwError$877({}, Messages$822.Redeclaration, 'Label', expr$1404.name);
            }
            state$841.labelSet[key$1406] = true;
            labeledBody$1405 = parseStatement$948();
            delete state$841.labelSet[key$1406];
            return delegate$836.createLabeledStatement(expr$1404, labeledBody$1405);
        }
        consumeSemicolon$886();
        return delegate$836.createExpressionStatement(expr$1404);
    }
    // 13 Function Definition
    function parseConciseBody$949() {
        if (match$882('{')) {
            return parseFunctionSourceElements$950();
        }
        return parseAssignmentExpression$916();
    }
    function parseFunctionSourceElements$950() {
        var sourceElement$1407, sourceElements$1408 = [], token$1409, directive$1410, firstRestricted$1411, oldLabelSet$1412, oldInIteration$1413, oldInSwitch$1414, oldInFunctionBody$1415, oldParenthesizedCount$1416;
        expect$880('{');
        while (streamIndex$838 < length$835) {
            if (lookahead$839.type !== Token$817.StringLiteral) {
                break;
            }
            token$1409 = lookahead$839;
            sourceElement$1407 = parseSourceElement$963();
            sourceElements$1408.push(sourceElement$1407);
            if (sourceElement$1407.expression.type !== Syntax$820.Literal) {
                // this is not directive
                break;
            }
            directive$1410 = token$1409.value;
            if (directive$1410 === 'use strict') {
                strict$827 = true;
                if (firstRestricted$1411) {
                    throwErrorTolerant$878(firstRestricted$1411, Messages$822.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1411 && token$1409.octal) {
                    firstRestricted$1411 = token$1409;
                }
            }
        }
        oldLabelSet$1412 = state$841.labelSet;
        oldInIteration$1413 = state$841.inIteration;
        oldInSwitch$1414 = state$841.inSwitch;
        oldInFunctionBody$1415 = state$841.inFunctionBody;
        oldParenthesizedCount$1416 = state$841.parenthesizedCount;
        state$841.labelSet = {};
        state$841.inIteration = false;
        state$841.inSwitch = false;
        state$841.inFunctionBody = true;
        state$841.parenthesizedCount = 0;
        while (streamIndex$838 < length$835) {
            if (match$882('}')) {
                break;
            }
            sourceElement$1407 = parseSourceElement$963();
            if (typeof sourceElement$1407 === 'undefined') {
                break;
            }
            sourceElements$1408.push(sourceElement$1407);
        }
        expect$880('}');
        state$841.labelSet = oldLabelSet$1412;
        state$841.inIteration = oldInIteration$1413;
        state$841.inSwitch = oldInSwitch$1414;
        state$841.inFunctionBody = oldInFunctionBody$1415;
        state$841.parenthesizedCount = oldParenthesizedCount$1416;
        return delegate$836.createBlockStatement(sourceElements$1408);
    }
    function validateParam$951(options$1417, param$1418, name$1419) {
        var key$1420 = '$' + name$1419;
        if (strict$827) {
            if (isRestrictedWord$854(name$1419)) {
                options$1417.stricted = param$1418;
                options$1417.message = Messages$822.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1417.paramSet, key$1420)) {
                options$1417.stricted = param$1418;
                options$1417.message = Messages$822.StrictParamDupe;
            }
        } else if (!options$1417.firstRestricted) {
            if (isRestrictedWord$854(name$1419)) {
                options$1417.firstRestricted = param$1418;
                options$1417.message = Messages$822.StrictParamName;
            } else if (isStrictModeReservedWord$853(name$1419)) {
                options$1417.firstRestricted = param$1418;
                options$1417.message = Messages$822.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1417.paramSet, key$1420)) {
                options$1417.firstRestricted = param$1418;
                options$1417.message = Messages$822.StrictParamDupe;
            }
        }
        options$1417.paramSet[key$1420] = true;
    }
    function parseParam$952(options$1421) {
        var token$1422, rest$1423, param$1424, def$1425;
        token$1422 = lookahead$839;
        if (token$1422.value === '...') {
            token$1422 = lex$873();
            rest$1423 = true;
        }
        if (match$882('[')) {
            param$1424 = parseArrayInitialiser$889();
            reinterpretAsDestructuredParameter$913(options$1421, param$1424);
        } else if (match$882('{')) {
            if (rest$1423) {
                throwError$877({}, Messages$822.ObjectPatternAsRestParameter);
            }
            param$1424 = parseObjectInitialiser$894();
            reinterpretAsDestructuredParameter$913(options$1421, param$1424);
        } else {
            param$1424 = parseVariableIdentifier$920();
            validateParam$951(options$1421, token$1422, token$1422.value);
            if (match$882('=')) {
                if (rest$1423) {
                    throwErrorTolerant$878(lookahead$839, Messages$822.DefaultRestParameter);
                }
                lex$873();
                def$1425 = parseAssignmentExpression$916();
                ++options$1421.defaultCount;
            }
        }
        if (rest$1423) {
            if (!match$882(')')) {
                throwError$877({}, Messages$822.ParameterAfterRestParameter);
            }
            options$1421.rest = param$1424;
            return false;
        }
        options$1421.params.push(param$1424);
        options$1421.defaults.push(def$1425);
        return !match$882(')');
    }
    function parseParams$953(firstRestricted$1426) {
        var options$1427;
        options$1427 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1426
        };
        expect$880('(');
        if (!match$882(')')) {
            options$1427.paramSet = {};
            while (streamIndex$838 < length$835) {
                if (!parseParam$952(options$1427)) {
                    break;
                }
                expect$880(',');
            }
        }
        expect$880(')');
        if (options$1427.defaultCount === 0) {
            options$1427.defaults = [];
        }
        return options$1427;
    }
    function parseFunctionDeclaration$954() {
        var id$1428, body$1429, token$1430, tmp$1431, firstRestricted$1432, message$1433, previousStrict$1434, previousYieldAllowed$1435, generator$1436, expression$1437;
        expectKeyword$881('function');
        generator$1436 = false;
        if (match$882('*')) {
            lex$873();
            generator$1436 = true;
        }
        token$1430 = lookahead$839;
        id$1428 = parseVariableIdentifier$920();
        if (strict$827) {
            if (isRestrictedWord$854(token$1430.value)) {
                throwErrorTolerant$878(token$1430, Messages$822.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$854(token$1430.value)) {
                firstRestricted$1432 = token$1430;
                message$1433 = Messages$822.StrictFunctionName;
            } else if (isStrictModeReservedWord$853(token$1430.value)) {
                firstRestricted$1432 = token$1430;
                message$1433 = Messages$822.StrictReservedWord;
            }
        }
        tmp$1431 = parseParams$953(firstRestricted$1432);
        firstRestricted$1432 = tmp$1431.firstRestricted;
        if (tmp$1431.message) {
            message$1433 = tmp$1431.message;
        }
        previousStrict$1434 = strict$827;
        previousYieldAllowed$1435 = state$841.yieldAllowed;
        state$841.yieldAllowed = generator$1436;
        // here we redo some work in order to set 'expression'
        expression$1437 = !match$882('{');
        body$1429 = parseConciseBody$949();
        if (strict$827 && firstRestricted$1432) {
            throwError$877(firstRestricted$1432, message$1433);
        }
        if (strict$827 && tmp$1431.stricted) {
            throwErrorTolerant$878(tmp$1431.stricted, message$1433);
        }
        if (state$841.yieldAllowed && !state$841.yieldFound) {
            throwErrorTolerant$878({}, Messages$822.NoYieldInGenerator);
        }
        strict$827 = previousStrict$1434;
        state$841.yieldAllowed = previousYieldAllowed$1435;
        return delegate$836.createFunctionDeclaration(id$1428, tmp$1431.params, tmp$1431.defaults, body$1429, tmp$1431.rest, generator$1436, expression$1437);
    }
    function parseFunctionExpression$955() {
        var token$1438, id$1439 = null, firstRestricted$1440, message$1441, tmp$1442, body$1443, previousStrict$1444, previousYieldAllowed$1445, generator$1446, expression$1447;
        expectKeyword$881('function');
        generator$1446 = false;
        if (match$882('*')) {
            lex$873();
            generator$1446 = true;
        }
        if (!match$882('(')) {
            token$1438 = lookahead$839;
            id$1439 = parseVariableIdentifier$920();
            if (strict$827) {
                if (isRestrictedWord$854(token$1438.value)) {
                    throwErrorTolerant$878(token$1438, Messages$822.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$854(token$1438.value)) {
                    firstRestricted$1440 = token$1438;
                    message$1441 = Messages$822.StrictFunctionName;
                } else if (isStrictModeReservedWord$853(token$1438.value)) {
                    firstRestricted$1440 = token$1438;
                    message$1441 = Messages$822.StrictReservedWord;
                }
            }
        }
        tmp$1442 = parseParams$953(firstRestricted$1440);
        firstRestricted$1440 = tmp$1442.firstRestricted;
        if (tmp$1442.message) {
            message$1441 = tmp$1442.message;
        }
        previousStrict$1444 = strict$827;
        previousYieldAllowed$1445 = state$841.yieldAllowed;
        state$841.yieldAllowed = generator$1446;
        // here we redo some work in order to set 'expression'
        expression$1447 = !match$882('{');
        body$1443 = parseConciseBody$949();
        if (strict$827 && firstRestricted$1440) {
            throwError$877(firstRestricted$1440, message$1441);
        }
        if (strict$827 && tmp$1442.stricted) {
            throwErrorTolerant$878(tmp$1442.stricted, message$1441);
        }
        if (state$841.yieldAllowed && !state$841.yieldFound) {
            throwErrorTolerant$878({}, Messages$822.NoYieldInGenerator);
        }
        strict$827 = previousStrict$1444;
        state$841.yieldAllowed = previousYieldAllowed$1445;
        return delegate$836.createFunctionExpression(id$1439, tmp$1442.params, tmp$1442.defaults, body$1443, tmp$1442.rest, generator$1446, expression$1447);
    }
    function parseYieldExpression$956() {
        var delegateFlag$1448, expr$1449, previousYieldAllowed$1450;
        expectKeyword$881('yield');
        if (!state$841.yieldAllowed) {
            throwErrorTolerant$878({}, Messages$822.IllegalYield);
        }
        delegateFlag$1448 = false;
        if (match$882('*')) {
            lex$873();
            delegateFlag$1448 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1450 = state$841.yieldAllowed;
        state$841.yieldAllowed = false;
        expr$1449 = parseAssignmentExpression$916();
        state$841.yieldAllowed = previousYieldAllowed$1450;
        state$841.yieldFound = true;
        return delegate$836.createYieldExpression(expr$1449, delegateFlag$1448);
    }
    // 14 Classes
    function parseMethodDefinition$957(existingPropNames$1451) {
        var token$1452, key$1453, param$1454, propType$1455, isValidDuplicateProp$1456 = false;
        if (lookahead$839.value === 'static') {
            propType$1455 = ClassPropertyType$825.static;
            lex$873();
        } else {
            propType$1455 = ClassPropertyType$825.prototype;
        }
        if (match$882('*')) {
            lex$873();
            return delegate$836.createMethodDefinition(propType$1455, '', parseObjectPropertyKey$892(), parsePropertyMethodFunction$891({ generator: true }));
        }
        token$1452 = lookahead$839;
        key$1453 = parseObjectPropertyKey$892();
        if (token$1452.value === 'get' && !match$882('(')) {
            key$1453 = parseObjectPropertyKey$892();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1451[propType$1455].hasOwnProperty(key$1453.name)) {
                isValidDuplicateProp$1456 = existingPropNames$1451[propType$1455][key$1453.name].get === undefined && existingPropNames$1451[propType$1455][key$1453.name].data === undefined && existingPropNames$1451[propType$1455][key$1453.name].set !== undefined;
                if (!isValidDuplicateProp$1456) {
                    throwError$877(key$1453, Messages$822.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1451[propType$1455][key$1453.name] = {};
            }
            existingPropNames$1451[propType$1455][key$1453.name].get = true;
            expect$880('(');
            expect$880(')');
            return delegate$836.createMethodDefinition(propType$1455, 'get', key$1453, parsePropertyFunction$890({ generator: false }));
        }
        if (token$1452.value === 'set' && !match$882('(')) {
            key$1453 = parseObjectPropertyKey$892();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1451[propType$1455].hasOwnProperty(key$1453.name)) {
                isValidDuplicateProp$1456 = existingPropNames$1451[propType$1455][key$1453.name].set === undefined && existingPropNames$1451[propType$1455][key$1453.name].data === undefined && existingPropNames$1451[propType$1455][key$1453.name].get !== undefined;
                if (!isValidDuplicateProp$1456) {
                    throwError$877(key$1453, Messages$822.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1451[propType$1455][key$1453.name] = {};
            }
            existingPropNames$1451[propType$1455][key$1453.name].set = true;
            expect$880('(');
            token$1452 = lookahead$839;
            param$1454 = [parseVariableIdentifier$920()];
            expect$880(')');
            return delegate$836.createMethodDefinition(propType$1455, 'set', key$1453, parsePropertyFunction$890({
                params: param$1454,
                generator: false,
                name: token$1452
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1451[propType$1455].hasOwnProperty(key$1453.name)) {
            throwError$877(key$1453, Messages$822.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1451[propType$1455][key$1453.name] = {};
        }
        existingPropNames$1451[propType$1455][key$1453.name].data = true;
        return delegate$836.createMethodDefinition(propType$1455, '', key$1453, parsePropertyMethodFunction$891({ generator: false }));
    }
    function parseClassElement$958(existingProps$1457) {
        if (match$882(';')) {
            lex$873();
            return;
        }
        return parseMethodDefinition$957(existingProps$1457);
    }
    function parseClassBody$959() {
        var classElement$1458, classElements$1459 = [], existingProps$1460 = {};
        existingProps$1460[ClassPropertyType$825.static] = {};
        existingProps$1460[ClassPropertyType$825.prototype] = {};
        expect$880('{');
        while (streamIndex$838 < length$835) {
            if (match$882('}')) {
                break;
            }
            classElement$1458 = parseClassElement$958(existingProps$1460);
            if (typeof classElement$1458 !== 'undefined') {
                classElements$1459.push(classElement$1458);
            }
        }
        expect$880('}');
        return delegate$836.createClassBody(classElements$1459);
    }
    function parseClassExpression$960() {
        var id$1461, previousYieldAllowed$1462, superClass$1463 = null;
        expectKeyword$881('class');
        if (!matchKeyword$883('extends') && !match$882('{')) {
            id$1461 = parseVariableIdentifier$920();
        }
        if (matchKeyword$883('extends')) {
            expectKeyword$881('extends');
            previousYieldAllowed$1462 = state$841.yieldAllowed;
            state$841.yieldAllowed = false;
            superClass$1463 = parseAssignmentExpression$916();
            state$841.yieldAllowed = previousYieldAllowed$1462;
        }
        return delegate$836.createClassExpression(id$1461, superClass$1463, parseClassBody$959());
    }
    function parseClassDeclaration$961() {
        var id$1464, previousYieldAllowed$1465, superClass$1466 = null;
        expectKeyword$881('class');
        id$1464 = parseVariableIdentifier$920();
        if (matchKeyword$883('extends')) {
            expectKeyword$881('extends');
            previousYieldAllowed$1465 = state$841.yieldAllowed;
            state$841.yieldAllowed = false;
            superClass$1466 = parseAssignmentExpression$916();
            state$841.yieldAllowed = previousYieldAllowed$1465;
        }
        return delegate$836.createClassDeclaration(id$1464, superClass$1466, parseClassBody$959());
    }
    // 15 Program
    function matchModuleDeclaration$962() {
        var id$1467;
        if (matchContextualKeyword$884('module')) {
            id$1467 = lookahead2$875();
            return id$1467.type === Token$817.StringLiteral || id$1467.type === Token$817.Identifier;
        }
        return false;
    }
    function parseSourceElement$963() {
        if (lookahead$839.type === Token$817.Keyword) {
            switch (lookahead$839.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$924(lookahead$839.value);
            case 'function':
                return parseFunctionDeclaration$954();
            case 'export':
                return parseExportDeclaration$928();
            case 'import':
                return parseImportDeclaration$929();
            default:
                return parseStatement$948();
            }
        }
        if (matchModuleDeclaration$962()) {
            throwError$877({}, Messages$822.NestedModule);
        }
        if (lookahead$839.type !== Token$817.EOF) {
            return parseStatement$948();
        }
    }
    function parseProgramElement$964() {
        if (lookahead$839.type === Token$817.Keyword) {
            switch (lookahead$839.value) {
            case 'export':
                return parseExportDeclaration$928();
            case 'import':
                return parseImportDeclaration$929();
            }
        }
        if (matchModuleDeclaration$962()) {
            return parseModuleDeclaration$925();
        }
        return parseSourceElement$963();
    }
    function parseProgramElements$965() {
        var sourceElement$1468, sourceElements$1469 = [], token$1470, directive$1471, firstRestricted$1472;
        while (streamIndex$838 < length$835) {
            token$1470 = lookahead$839;
            if (token$1470.type !== Token$817.StringLiteral) {
                break;
            }
            sourceElement$1468 = parseProgramElement$964();
            sourceElements$1469.push(sourceElement$1468);
            if (sourceElement$1468.expression.type !== Syntax$820.Literal) {
                // this is not directive
                break;
            }
            assert$843(false, 'directive isn\'t right');
            directive$1471 = source$826.slice(token$1470.range[0] + 1, token$1470.range[1] - 1);
            if (directive$1471 === 'use strict') {
                strict$827 = true;
                if (firstRestricted$1472) {
                    throwErrorTolerant$878(firstRestricted$1472, Messages$822.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1472 && token$1470.octal) {
                    firstRestricted$1472 = token$1470;
                }
            }
        }
        while (streamIndex$838 < length$835) {
            sourceElement$1468 = parseProgramElement$964();
            if (typeof sourceElement$1468 === 'undefined') {
                break;
            }
            sourceElements$1469.push(sourceElement$1468);
        }
        return sourceElements$1469;
    }
    function parseModuleElement$966() {
        return parseSourceElement$963();
    }
    function parseModuleElements$967() {
        var list$1473 = [], statement$1474;
        while (streamIndex$838 < length$835) {
            if (match$882('}')) {
                break;
            }
            statement$1474 = parseModuleElement$966();
            if (typeof statement$1474 === 'undefined') {
                break;
            }
            list$1473.push(statement$1474);
        }
        return list$1473;
    }
    function parseModuleBlock$968() {
        var block$1475;
        expect$880('{');
        block$1475 = parseModuleElements$967();
        expect$880('}');
        return delegate$836.createBlockStatement(block$1475);
    }
    function parseProgram$969() {
        var body$1476;
        strict$827 = false;
        peek$874();
        body$1476 = parseProgramElements$965();
        return delegate$836.createProgram(body$1476);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$970(type$1477, value$1478, start$1479, end$1480, loc$1481) {
        assert$843(typeof start$1479 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$842.comments.length > 0) {
            if (extra$842.comments[extra$842.comments.length - 1].range[1] > start$1479) {
                return;
            }
        }
        extra$842.comments.push({
            type: type$1477,
            value: value$1478,
            range: [
                start$1479,
                end$1480
            ],
            loc: loc$1481
        });
    }
    function scanComment$971() {
        var comment$1482, ch$1483, loc$1484, start$1485, blockComment$1486, lineComment$1487;
        comment$1482 = '';
        blockComment$1486 = false;
        lineComment$1487 = false;
        while (index$828 < length$835) {
            ch$1483 = source$826[index$828];
            if (lineComment$1487) {
                ch$1483 = source$826[index$828++];
                if (isLineTerminator$849(ch$1483.charCodeAt(0))) {
                    loc$1484.end = {
                        line: lineNumber$829,
                        column: index$828 - lineStart$830 - 1
                    };
                    lineComment$1487 = false;
                    addComment$970('Line', comment$1482, start$1485, index$828 - 1, loc$1484);
                    if (ch$1483 === '\r' && source$826[index$828] === '\n') {
                        ++index$828;
                    }
                    ++lineNumber$829;
                    lineStart$830 = index$828;
                    comment$1482 = '';
                } else if (index$828 >= length$835) {
                    lineComment$1487 = false;
                    comment$1482 += ch$1483;
                    loc$1484.end = {
                        line: lineNumber$829,
                        column: length$835 - lineStart$830
                    };
                    addComment$970('Line', comment$1482, start$1485, length$835, loc$1484);
                } else {
                    comment$1482 += ch$1483;
                }
            } else if (blockComment$1486) {
                if (isLineTerminator$849(ch$1483.charCodeAt(0))) {
                    if (ch$1483 === '\r' && source$826[index$828 + 1] === '\n') {
                        ++index$828;
                        comment$1482 += '\r\n';
                    } else {
                        comment$1482 += ch$1483;
                    }
                    ++lineNumber$829;
                    ++index$828;
                    lineStart$830 = index$828;
                    if (index$828 >= length$835) {
                        throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1483 = source$826[index$828++];
                    if (index$828 >= length$835) {
                        throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1482 += ch$1483;
                    if (ch$1483 === '*') {
                        ch$1483 = source$826[index$828];
                        if (ch$1483 === '/') {
                            comment$1482 = comment$1482.substr(0, comment$1482.length - 1);
                            blockComment$1486 = false;
                            ++index$828;
                            loc$1484.end = {
                                line: lineNumber$829,
                                column: index$828 - lineStart$830
                            };
                            addComment$970('Block', comment$1482, start$1485, index$828, loc$1484);
                            comment$1482 = '';
                        }
                    }
                }
            } else if (ch$1483 === '/') {
                ch$1483 = source$826[index$828 + 1];
                if (ch$1483 === '/') {
                    loc$1484 = {
                        start: {
                            line: lineNumber$829,
                            column: index$828 - lineStart$830
                        }
                    };
                    start$1485 = index$828;
                    index$828 += 2;
                    lineComment$1487 = true;
                    if (index$828 >= length$835) {
                        loc$1484.end = {
                            line: lineNumber$829,
                            column: index$828 - lineStart$830
                        };
                        lineComment$1487 = false;
                        addComment$970('Line', comment$1482, start$1485, index$828, loc$1484);
                    }
                } else if (ch$1483 === '*') {
                    start$1485 = index$828;
                    index$828 += 2;
                    blockComment$1486 = true;
                    loc$1484 = {
                        start: {
                            line: lineNumber$829,
                            column: index$828 - lineStart$830 - 2
                        }
                    };
                    if (index$828 >= length$835) {
                        throwError$877({}, Messages$822.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$848(ch$1483.charCodeAt(0))) {
                ++index$828;
            } else if (isLineTerminator$849(ch$1483.charCodeAt(0))) {
                ++index$828;
                if (ch$1483 === '\r' && source$826[index$828] === '\n') {
                    ++index$828;
                }
                ++lineNumber$829;
                lineStart$830 = index$828;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$972() {
        var i$1488, entry$1489, comment$1490, comments$1491 = [];
        for (i$1488 = 0; i$1488 < extra$842.comments.length; ++i$1488) {
            entry$1489 = extra$842.comments[i$1488];
            comment$1490 = {
                type: entry$1489.type,
                value: entry$1489.value
            };
            if (extra$842.range) {
                comment$1490.range = entry$1489.range;
            }
            if (extra$842.loc) {
                comment$1490.loc = entry$1489.loc;
            }
            comments$1491.push(comment$1490);
        }
        extra$842.comments = comments$1491;
    }
    function collectToken$973() {
        var start$1492, loc$1493, token$1494, range$1495, value$1496;
        skipComment$856();
        start$1492 = index$828;
        loc$1493 = {
            start: {
                line: lineNumber$829,
                column: index$828 - lineStart$830
            }
        };
        token$1494 = extra$842.advance();
        loc$1493.end = {
            line: lineNumber$829,
            column: index$828 - lineStart$830
        };
        if (token$1494.type !== Token$817.EOF) {
            range$1495 = [
                token$1494.range[0],
                token$1494.range[1]
            ];
            value$1496 = source$826.slice(token$1494.range[0], token$1494.range[1]);
            extra$842.tokens.push({
                type: TokenName$818[token$1494.type],
                value: value$1496,
                range: range$1495,
                loc: loc$1493
            });
        }
        return token$1494;
    }
    function collectRegex$974() {
        var pos$1497, loc$1498, regex$1499, token$1500;
        skipComment$856();
        pos$1497 = index$828;
        loc$1498 = {
            start: {
                line: lineNumber$829,
                column: index$828 - lineStart$830
            }
        };
        regex$1499 = extra$842.scanRegExp();
        loc$1498.end = {
            line: lineNumber$829,
            column: index$828 - lineStart$830
        };
        if (!extra$842.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$842.tokens.length > 0) {
                token$1500 = extra$842.tokens[extra$842.tokens.length - 1];
                if (token$1500.range[0] === pos$1497 && token$1500.type === 'Punctuator') {
                    if (token$1500.value === '/' || token$1500.value === '/=') {
                        extra$842.tokens.pop();
                    }
                }
            }
            extra$842.tokens.push({
                type: 'RegularExpression',
                value: regex$1499.literal,
                range: [
                    pos$1497,
                    index$828
                ],
                loc: loc$1498
            });
        }
        return regex$1499;
    }
    function filterTokenLocation$975() {
        var i$1501, entry$1502, token$1503, tokens$1504 = [];
        for (i$1501 = 0; i$1501 < extra$842.tokens.length; ++i$1501) {
            entry$1502 = extra$842.tokens[i$1501];
            token$1503 = {
                type: entry$1502.type,
                value: entry$1502.value
            };
            if (extra$842.range) {
                token$1503.range = entry$1502.range;
            }
            if (extra$842.loc) {
                token$1503.loc = entry$1502.loc;
            }
            tokens$1504.push(token$1503);
        }
        extra$842.tokens = tokens$1504;
    }
    function LocationMarker$976() {
        var sm_index$1505 = lookahead$839 ? lookahead$839.sm_range[0] : 0;
        var sm_lineStart$1506 = lookahead$839 ? lookahead$839.sm_lineStart : 0;
        var sm_lineNumber$1507 = lookahead$839 ? lookahead$839.sm_lineNumber : 1;
        this.range = [
            sm_index$1505,
            sm_index$1505
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1507,
                column: sm_index$1505 - sm_lineStart$1506
            },
            end: {
                line: sm_lineNumber$1507,
                column: sm_index$1505 - sm_lineStart$1506
            }
        };
    }
    LocationMarker$976.prototype = {
        constructor: LocationMarker$976,
        end: function () {
            this.range[1] = sm_index$834;
            this.loc.end.line = sm_lineNumber$831;
            this.loc.end.column = sm_index$834 - sm_lineStart$832;
        },
        applyGroup: function (node$1508) {
            if (extra$842.range) {
                node$1508.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$842.loc) {
                node$1508.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1508 = delegate$836.postProcess(node$1508);
            }
        },
        apply: function (node$1509) {
            var nodeType$1510 = typeof node$1509;
            assert$843(nodeType$1510 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1510);
            if (extra$842.range) {
                node$1509.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$842.loc) {
                node$1509.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1509 = delegate$836.postProcess(node$1509);
            }
        }
    };
    function createLocationMarker$977() {
        return new LocationMarker$976();
    }
    function trackGroupExpression$978() {
        var marker$1511, expr$1512;
        marker$1511 = createLocationMarker$977();
        expect$880('(');
        ++state$841.parenthesizedCount;
        expr$1512 = parseExpression$917();
        expect$880(')');
        marker$1511.end();
        marker$1511.applyGroup(expr$1512);
        return expr$1512;
    }
    function trackLeftHandSideExpression$979() {
        var marker$1513, expr$1514;
        // skipComment();
        marker$1513 = createLocationMarker$977();
        expr$1514 = matchKeyword$883('new') ? parseNewExpression$904() : parsePrimaryExpression$898();
        while (match$882('.') || match$882('[') || lookahead$839.type === Token$817.Template) {
            if (match$882('[')) {
                expr$1514 = delegate$836.createMemberExpression('[', expr$1514, parseComputedMember$903());
                marker$1513.end();
                marker$1513.apply(expr$1514);
            } else if (match$882('.')) {
                expr$1514 = delegate$836.createMemberExpression('.', expr$1514, parseNonComputedMember$902());
                marker$1513.end();
                marker$1513.apply(expr$1514);
            } else {
                expr$1514 = delegate$836.createTaggedTemplateExpression(expr$1514, parseTemplateLiteral$896());
                marker$1513.end();
                marker$1513.apply(expr$1514);
            }
        }
        return expr$1514;
    }
    function trackLeftHandSideExpressionAllowCall$980() {
        var marker$1515, expr$1516, args$1517;
        // skipComment();
        marker$1515 = createLocationMarker$977();
        expr$1516 = matchKeyword$883('new') ? parseNewExpression$904() : parsePrimaryExpression$898();
        while (match$882('.') || match$882('[') || match$882('(') || lookahead$839.type === Token$817.Template) {
            if (match$882('(')) {
                args$1517 = parseArguments$899();
                expr$1516 = delegate$836.createCallExpression(expr$1516, args$1517);
                marker$1515.end();
                marker$1515.apply(expr$1516);
            } else if (match$882('[')) {
                expr$1516 = delegate$836.createMemberExpression('[', expr$1516, parseComputedMember$903());
                marker$1515.end();
                marker$1515.apply(expr$1516);
            } else if (match$882('.')) {
                expr$1516 = delegate$836.createMemberExpression('.', expr$1516, parseNonComputedMember$902());
                marker$1515.end();
                marker$1515.apply(expr$1516);
            } else {
                expr$1516 = delegate$836.createTaggedTemplateExpression(expr$1516, parseTemplateLiteral$896());
                marker$1515.end();
                marker$1515.apply(expr$1516);
            }
        }
        return expr$1516;
    }
    function filterGroup$981(node$1518) {
        var n$1519, i$1520, entry$1521;
        n$1519 = Object.prototype.toString.apply(node$1518) === '[object Array]' ? [] : {};
        for (i$1520 in node$1518) {
            if (node$1518.hasOwnProperty(i$1520) && i$1520 !== 'groupRange' && i$1520 !== 'groupLoc') {
                entry$1521 = node$1518[i$1520];
                if (entry$1521 === null || typeof entry$1521 !== 'object' || entry$1521 instanceof RegExp) {
                    n$1519[i$1520] = entry$1521;
                } else {
                    n$1519[i$1520] = filterGroup$981(entry$1521);
                }
            }
        }
        return n$1519;
    }
    function wrapTrackingFunction$982(range$1522, loc$1523) {
        return function (parseFunction$1524) {
            function isBinary$1525(node$1527) {
                return node$1527.type === Syntax$820.LogicalExpression || node$1527.type === Syntax$820.BinaryExpression;
            }
            function visit$1526(node$1528) {
                var start$1529, end$1530;
                if (isBinary$1525(node$1528.left)) {
                    visit$1526(node$1528.left);
                }
                if (isBinary$1525(node$1528.right)) {
                    visit$1526(node$1528.right);
                }
                if (range$1522) {
                    if (node$1528.left.groupRange || node$1528.right.groupRange) {
                        start$1529 = node$1528.left.groupRange ? node$1528.left.groupRange[0] : node$1528.left.range[0];
                        end$1530 = node$1528.right.groupRange ? node$1528.right.groupRange[1] : node$1528.right.range[1];
                        node$1528.range = [
                            start$1529,
                            end$1530
                        ];
                    } else if (typeof node$1528.range === 'undefined') {
                        start$1529 = node$1528.left.range[0];
                        end$1530 = node$1528.right.range[1];
                        node$1528.range = [
                            start$1529,
                            end$1530
                        ];
                    }
                }
                if (loc$1523) {
                    if (node$1528.left.groupLoc || node$1528.right.groupLoc) {
                        start$1529 = node$1528.left.groupLoc ? node$1528.left.groupLoc.start : node$1528.left.loc.start;
                        end$1530 = node$1528.right.groupLoc ? node$1528.right.groupLoc.end : node$1528.right.loc.end;
                        node$1528.loc = {
                            start: start$1529,
                            end: end$1530
                        };
                        node$1528 = delegate$836.postProcess(node$1528);
                    } else if (typeof node$1528.loc === 'undefined') {
                        node$1528.loc = {
                            start: node$1528.left.loc.start,
                            end: node$1528.right.loc.end
                        };
                        node$1528 = delegate$836.postProcess(node$1528);
                    }
                }
            }
            return function () {
                var marker$1531, node$1532, curr$1533 = lookahead$839;
                marker$1531 = createLocationMarker$977();
                node$1532 = parseFunction$1524.apply(null, arguments);
                marker$1531.end();
                if (node$1532.type !== Syntax$820.Program) {
                    if (curr$1533.leadingComments) {
                        node$1532.leadingComments = curr$1533.leadingComments;
                    }
                    if (curr$1533.trailingComments) {
                        node$1532.trailingComments = curr$1533.trailingComments;
                    }
                }
                if (range$1522 && typeof node$1532.range === 'undefined') {
                    marker$1531.apply(node$1532);
                }
                if (loc$1523 && typeof node$1532.loc === 'undefined') {
                    marker$1531.apply(node$1532);
                }
                if (isBinary$1525(node$1532)) {
                    visit$1526(node$1532);
                }
                return node$1532;
            };
        };
    }
    function patch$983() {
        var wrapTracking$1534;
        if (extra$842.comments) {
            extra$842.skipComment = skipComment$856;
            skipComment$856 = scanComment$971;
        }
        if (extra$842.range || extra$842.loc) {
            extra$842.parseGroupExpression = parseGroupExpression$897;
            extra$842.parseLeftHandSideExpression = parseLeftHandSideExpression$906;
            extra$842.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$905;
            parseGroupExpression$897 = trackGroupExpression$978;
            parseLeftHandSideExpression$906 = trackLeftHandSideExpression$979;
            parseLeftHandSideExpressionAllowCall$905 = trackLeftHandSideExpressionAllowCall$980;
            wrapTracking$1534 = wrapTrackingFunction$982(extra$842.range, extra$842.loc);
            extra$842.parseArrayInitialiser = parseArrayInitialiser$889;
            extra$842.parseAssignmentExpression = parseAssignmentExpression$916;
            extra$842.parseBinaryExpression = parseBinaryExpression$910;
            extra$842.parseBlock = parseBlock$919;
            extra$842.parseFunctionSourceElements = parseFunctionSourceElements$950;
            extra$842.parseCatchClause = parseCatchClause$945;
            extra$842.parseComputedMember = parseComputedMember$903;
            extra$842.parseConditionalExpression = parseConditionalExpression$911;
            extra$842.parseConstLetDeclaration = parseConstLetDeclaration$924;
            extra$842.parseExportBatchSpecifier = parseExportBatchSpecifier$926;
            extra$842.parseExportDeclaration = parseExportDeclaration$928;
            extra$842.parseExportSpecifier = parseExportSpecifier$927;
            extra$842.parseExpression = parseExpression$917;
            extra$842.parseForVariableDeclaration = parseForVariableDeclaration$936;
            extra$842.parseFunctionDeclaration = parseFunctionDeclaration$954;
            extra$842.parseFunctionExpression = parseFunctionExpression$955;
            extra$842.parseParams = parseParams$953;
            extra$842.parseImportDeclaration = parseImportDeclaration$929;
            extra$842.parseImportSpecifier = parseImportSpecifier$930;
            extra$842.parseModuleDeclaration = parseModuleDeclaration$925;
            extra$842.parseModuleBlock = parseModuleBlock$968;
            extra$842.parseNewExpression = parseNewExpression$904;
            extra$842.parseNonComputedProperty = parseNonComputedProperty$901;
            extra$842.parseObjectInitialiser = parseObjectInitialiser$894;
            extra$842.parseObjectProperty = parseObjectProperty$893;
            extra$842.parseObjectPropertyKey = parseObjectPropertyKey$892;
            extra$842.parsePostfixExpression = parsePostfixExpression$907;
            extra$842.parsePrimaryExpression = parsePrimaryExpression$898;
            extra$842.parseProgram = parseProgram$969;
            extra$842.parsePropertyFunction = parsePropertyFunction$890;
            extra$842.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$900;
            extra$842.parseTemplateElement = parseTemplateElement$895;
            extra$842.parseTemplateLiteral = parseTemplateLiteral$896;
            extra$842.parseStatement = parseStatement$948;
            extra$842.parseSwitchCase = parseSwitchCase$942;
            extra$842.parseUnaryExpression = parseUnaryExpression$908;
            extra$842.parseVariableDeclaration = parseVariableDeclaration$921;
            extra$842.parseVariableIdentifier = parseVariableIdentifier$920;
            extra$842.parseMethodDefinition = parseMethodDefinition$957;
            extra$842.parseClassDeclaration = parseClassDeclaration$961;
            extra$842.parseClassExpression = parseClassExpression$960;
            extra$842.parseClassBody = parseClassBody$959;
            parseArrayInitialiser$889 = wrapTracking$1534(extra$842.parseArrayInitialiser);
            parseAssignmentExpression$916 = wrapTracking$1534(extra$842.parseAssignmentExpression);
            parseBinaryExpression$910 = wrapTracking$1534(extra$842.parseBinaryExpression);
            parseBlock$919 = wrapTracking$1534(extra$842.parseBlock);
            parseFunctionSourceElements$950 = wrapTracking$1534(extra$842.parseFunctionSourceElements);
            parseCatchClause$945 = wrapTracking$1534(extra$842.parseCatchClause);
            parseComputedMember$903 = wrapTracking$1534(extra$842.parseComputedMember);
            parseConditionalExpression$911 = wrapTracking$1534(extra$842.parseConditionalExpression);
            parseConstLetDeclaration$924 = wrapTracking$1534(extra$842.parseConstLetDeclaration);
            parseExportBatchSpecifier$926 = wrapTracking$1534(parseExportBatchSpecifier$926);
            parseExportDeclaration$928 = wrapTracking$1534(parseExportDeclaration$928);
            parseExportSpecifier$927 = wrapTracking$1534(parseExportSpecifier$927);
            parseExpression$917 = wrapTracking$1534(extra$842.parseExpression);
            parseForVariableDeclaration$936 = wrapTracking$1534(extra$842.parseForVariableDeclaration);
            parseFunctionDeclaration$954 = wrapTracking$1534(extra$842.parseFunctionDeclaration);
            parseFunctionExpression$955 = wrapTracking$1534(extra$842.parseFunctionExpression);
            parseParams$953 = wrapTracking$1534(extra$842.parseParams);
            parseImportDeclaration$929 = wrapTracking$1534(extra$842.parseImportDeclaration);
            parseImportSpecifier$930 = wrapTracking$1534(extra$842.parseImportSpecifier);
            parseModuleDeclaration$925 = wrapTracking$1534(extra$842.parseModuleDeclaration);
            parseModuleBlock$968 = wrapTracking$1534(extra$842.parseModuleBlock);
            parseLeftHandSideExpression$906 = wrapTracking$1534(parseLeftHandSideExpression$906);
            parseNewExpression$904 = wrapTracking$1534(extra$842.parseNewExpression);
            parseNonComputedProperty$901 = wrapTracking$1534(extra$842.parseNonComputedProperty);
            parseObjectInitialiser$894 = wrapTracking$1534(extra$842.parseObjectInitialiser);
            parseObjectProperty$893 = wrapTracking$1534(extra$842.parseObjectProperty);
            parseObjectPropertyKey$892 = wrapTracking$1534(extra$842.parseObjectPropertyKey);
            parsePostfixExpression$907 = wrapTracking$1534(extra$842.parsePostfixExpression);
            parsePrimaryExpression$898 = wrapTracking$1534(extra$842.parsePrimaryExpression);
            parseProgram$969 = wrapTracking$1534(extra$842.parseProgram);
            parsePropertyFunction$890 = wrapTracking$1534(extra$842.parsePropertyFunction);
            parseTemplateElement$895 = wrapTracking$1534(extra$842.parseTemplateElement);
            parseTemplateLiteral$896 = wrapTracking$1534(extra$842.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$900 = wrapTracking$1534(extra$842.parseSpreadOrAssignmentExpression);
            parseStatement$948 = wrapTracking$1534(extra$842.parseStatement);
            parseSwitchCase$942 = wrapTracking$1534(extra$842.parseSwitchCase);
            parseUnaryExpression$908 = wrapTracking$1534(extra$842.parseUnaryExpression);
            parseVariableDeclaration$921 = wrapTracking$1534(extra$842.parseVariableDeclaration);
            parseVariableIdentifier$920 = wrapTracking$1534(extra$842.parseVariableIdentifier);
            parseMethodDefinition$957 = wrapTracking$1534(extra$842.parseMethodDefinition);
            parseClassDeclaration$961 = wrapTracking$1534(extra$842.parseClassDeclaration);
            parseClassExpression$960 = wrapTracking$1534(extra$842.parseClassExpression);
            parseClassBody$959 = wrapTracking$1534(extra$842.parseClassBody);
        }
        if (typeof extra$842.tokens !== 'undefined') {
            extra$842.advance = advance$872;
            extra$842.scanRegExp = scanRegExp$869;
            advance$872 = collectToken$973;
            scanRegExp$869 = collectRegex$974;
        }
    }
    function unpatch$984() {
        if (typeof extra$842.skipComment === 'function') {
            skipComment$856 = extra$842.skipComment;
        }
        if (extra$842.range || extra$842.loc) {
            parseArrayInitialiser$889 = extra$842.parseArrayInitialiser;
            parseAssignmentExpression$916 = extra$842.parseAssignmentExpression;
            parseBinaryExpression$910 = extra$842.parseBinaryExpression;
            parseBlock$919 = extra$842.parseBlock;
            parseFunctionSourceElements$950 = extra$842.parseFunctionSourceElements;
            parseCatchClause$945 = extra$842.parseCatchClause;
            parseComputedMember$903 = extra$842.parseComputedMember;
            parseConditionalExpression$911 = extra$842.parseConditionalExpression;
            parseConstLetDeclaration$924 = extra$842.parseConstLetDeclaration;
            parseExportBatchSpecifier$926 = extra$842.parseExportBatchSpecifier;
            parseExportDeclaration$928 = extra$842.parseExportDeclaration;
            parseExportSpecifier$927 = extra$842.parseExportSpecifier;
            parseExpression$917 = extra$842.parseExpression;
            parseForVariableDeclaration$936 = extra$842.parseForVariableDeclaration;
            parseFunctionDeclaration$954 = extra$842.parseFunctionDeclaration;
            parseFunctionExpression$955 = extra$842.parseFunctionExpression;
            parseImportDeclaration$929 = extra$842.parseImportDeclaration;
            parseImportSpecifier$930 = extra$842.parseImportSpecifier;
            parseGroupExpression$897 = extra$842.parseGroupExpression;
            parseLeftHandSideExpression$906 = extra$842.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$905 = extra$842.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$925 = extra$842.parseModuleDeclaration;
            parseModuleBlock$968 = extra$842.parseModuleBlock;
            parseNewExpression$904 = extra$842.parseNewExpression;
            parseNonComputedProperty$901 = extra$842.parseNonComputedProperty;
            parseObjectInitialiser$894 = extra$842.parseObjectInitialiser;
            parseObjectProperty$893 = extra$842.parseObjectProperty;
            parseObjectPropertyKey$892 = extra$842.parseObjectPropertyKey;
            parsePostfixExpression$907 = extra$842.parsePostfixExpression;
            parsePrimaryExpression$898 = extra$842.parsePrimaryExpression;
            parseProgram$969 = extra$842.parseProgram;
            parsePropertyFunction$890 = extra$842.parsePropertyFunction;
            parseTemplateElement$895 = extra$842.parseTemplateElement;
            parseTemplateLiteral$896 = extra$842.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$900 = extra$842.parseSpreadOrAssignmentExpression;
            parseStatement$948 = extra$842.parseStatement;
            parseSwitchCase$942 = extra$842.parseSwitchCase;
            parseUnaryExpression$908 = extra$842.parseUnaryExpression;
            parseVariableDeclaration$921 = extra$842.parseVariableDeclaration;
            parseVariableIdentifier$920 = extra$842.parseVariableIdentifier;
            parseMethodDefinition$957 = extra$842.parseMethodDefinition;
            parseClassDeclaration$961 = extra$842.parseClassDeclaration;
            parseClassExpression$960 = extra$842.parseClassExpression;
            parseClassBody$959 = extra$842.parseClassBody;
        }
        if (typeof extra$842.scanRegExp === 'function') {
            advance$872 = extra$842.advance;
            scanRegExp$869 = extra$842.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$985(object$1535, properties$1536) {
        var entry$1537, result$1538 = {};
        for (entry$1537 in object$1535) {
            if (object$1535.hasOwnProperty(entry$1537)) {
                result$1538[entry$1537] = object$1535[entry$1537];
            }
        }
        for (entry$1537 in properties$1536) {
            if (properties$1536.hasOwnProperty(entry$1537)) {
                result$1538[entry$1537] = properties$1536[entry$1537];
            }
        }
        return result$1538;
    }
    function tokenize$986(code$1539, options$1540) {
        var toString$1541, token$1542, tokens$1543;
        toString$1541 = String;
        if (typeof code$1539 !== 'string' && !(code$1539 instanceof String)) {
            code$1539 = toString$1541(code$1539);
        }
        delegate$836 = SyntaxTreeDelegate$824;
        source$826 = code$1539;
        index$828 = 0;
        lineNumber$829 = source$826.length > 0 ? 1 : 0;
        lineStart$830 = 0;
        length$835 = source$826.length;
        lookahead$839 = null;
        state$841 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$842 = {};
        // Options matching.
        options$1540 = options$1540 || {};
        // Of course we collect tokens here.
        options$1540.tokens = true;
        extra$842.tokens = [];
        extra$842.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$842.openParenToken = -1;
        extra$842.openCurlyToken = -1;
        extra$842.range = typeof options$1540.range === 'boolean' && options$1540.range;
        extra$842.loc = typeof options$1540.loc === 'boolean' && options$1540.loc;
        if (typeof options$1540.comment === 'boolean' && options$1540.comment) {
            extra$842.comments = [];
        }
        if (typeof options$1540.tolerant === 'boolean' && options$1540.tolerant) {
            extra$842.errors = [];
        }
        if (length$835 > 0) {
            if (typeof source$826[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1539 instanceof String) {
                    source$826 = code$1539.valueOf();
                }
            }
        }
        patch$983();
        try {
            peek$874();
            if (lookahead$839.type === Token$817.EOF) {
                return extra$842.tokens;
            }
            token$1542 = lex$873();
            while (lookahead$839.type !== Token$817.EOF) {
                try {
                    token$1542 = lex$873();
                } catch (lexError$1544) {
                    token$1542 = lookahead$839;
                    if (extra$842.errors) {
                        extra$842.errors.push(lexError$1544);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1544;
                    }
                }
            }
            filterTokenLocation$975();
            tokens$1543 = extra$842.tokens;
            if (typeof extra$842.comments !== 'undefined') {
                filterCommentLocation$972();
                tokens$1543.comments = extra$842.comments;
            }
            if (typeof extra$842.errors !== 'undefined') {
                tokens$1543.errors = extra$842.errors;
            }
        } catch (e$1545) {
            throw e$1545;
        } finally {
            unpatch$984();
            extra$842 = {};
        }
        return tokens$1543;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$987(toks$1546, start$1547, inExprDelim$1548, parentIsBlock$1549) {
        var assignOps$1550 = [
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
        var binaryOps$1551 = [
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
        var unaryOps$1552 = [
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
        function back$1553(n$1554) {
            var idx$1555 = toks$1546.length - n$1554 > 0 ? toks$1546.length - n$1554 : 0;
            return toks$1546[idx$1555];
        }
        if (inExprDelim$1548 && toks$1546.length - (start$1547 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1553(start$1547 + 2).value === ':' && parentIsBlock$1549) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$844(back$1553(start$1547 + 2).value, unaryOps$1552.concat(binaryOps$1551).concat(assignOps$1550))) {
            // ... + {...}
            return false;
        } else if (back$1553(start$1547 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1556 = typeof back$1553(start$1547 + 1).startLineNumber !== 'undefined' ? back$1553(start$1547 + 1).startLineNumber : back$1553(start$1547 + 1).lineNumber;
            if (back$1553(start$1547 + 2).lineNumber !== currLineNumber$1556) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$844(back$1553(start$1547 + 2).value, [
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
    function readToken$988(toks$1557, inExprDelim$1558, parentIsBlock$1559) {
        var delimiters$1560 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1561 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1562 = toks$1557.length - 1;
        var comments$1563, commentsLen$1564 = extra$842.comments.length;
        function back$1565(n$1569) {
            var idx$1570 = toks$1557.length - n$1569 > 0 ? toks$1557.length - n$1569 : 0;
            return toks$1557[idx$1570];
        }
        function attachComments$1566(token$1571) {
            if (comments$1563) {
                token$1571.leadingComments = comments$1563;
            }
            return token$1571;
        }
        function _advance$1567() {
            return attachComments$1566(advance$872());
        }
        function _scanRegExp$1568() {
            return attachComments$1566(scanRegExp$869());
        }
        skipComment$856();
        if (extra$842.comments.length > commentsLen$1564) {
            comments$1563 = extra$842.comments.slice(commentsLen$1564);
        }
        if (isIn$844(source$826[index$828], delimiters$1560)) {
            return attachComments$1566(readDelim$989(toks$1557, inExprDelim$1558, parentIsBlock$1559));
        }
        if (source$826[index$828] === '/') {
            var prev$1572 = back$1565(1);
            if (prev$1572) {
                if (prev$1572.value === '()') {
                    if (isIn$844(back$1565(2).value, parenIdents$1561)) {
                        // ... if (...) / ...
                        return _scanRegExp$1568();
                    }
                    // ... (...) / ...
                    return _advance$1567();
                }
                if (prev$1572.value === '{}') {
                    if (blockAllowed$987(toks$1557, 0, inExprDelim$1558, parentIsBlock$1559)) {
                        if (back$1565(2).value === '()') {
                            // named function
                            if (back$1565(4).value === 'function') {
                                if (!blockAllowed$987(toks$1557, 3, inExprDelim$1558, parentIsBlock$1559)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1567();
                                }
                                if (toks$1557.length - 5 <= 0 && inExprDelim$1558) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1567();
                                }
                            }
                            // unnamed function
                            if (back$1565(3).value === 'function') {
                                if (!blockAllowed$987(toks$1557, 2, inExprDelim$1558, parentIsBlock$1559)) {
                                    // new function (...) {...} / ...
                                    return _advance$1567();
                                }
                                if (toks$1557.length - 4 <= 0 && inExprDelim$1558) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1567();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1568();
                    } else {
                        // ... + {...} / ...
                        return _advance$1567();
                    }
                }
                if (prev$1572.type === Token$817.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1568();
                }
                if (isKeyword$855(prev$1572.value)) {
                    // typeof /...
                    return _scanRegExp$1568();
                }
                return _advance$1567();
            }
            return _scanRegExp$1568();
        }
        return _advance$1567();
    }
    function readDelim$989(toks$1573, inExprDelim$1574, parentIsBlock$1575) {
        var startDelim$1576 = advance$872(), matchDelim$1577 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1578 = [];
        var delimiters$1579 = [
                '(',
                '{',
                '['
            ];
        assert$843(delimiters$1579.indexOf(startDelim$1576.value) !== -1, 'Need to begin at the delimiter');
        var token$1580 = startDelim$1576;
        var startLineNumber$1581 = token$1580.lineNumber;
        var startLineStart$1582 = token$1580.lineStart;
        var startRange$1583 = token$1580.range;
        var delimToken$1584 = {};
        delimToken$1584.type = Token$817.Delimiter;
        delimToken$1584.value = startDelim$1576.value + matchDelim$1577[startDelim$1576.value];
        delimToken$1584.startLineNumber = startLineNumber$1581;
        delimToken$1584.startLineStart = startLineStart$1582;
        delimToken$1584.startRange = startRange$1583;
        var delimIsBlock$1585 = false;
        if (startDelim$1576.value === '{') {
            delimIsBlock$1585 = blockAllowed$987(toks$1573.concat(delimToken$1584), 0, inExprDelim$1574, parentIsBlock$1575);
        }
        while (index$828 <= length$835) {
            token$1580 = readToken$988(inner$1578, startDelim$1576.value === '(' || startDelim$1576.value === '[', delimIsBlock$1585);
            if (token$1580.type === Token$817.Punctuator && token$1580.value === matchDelim$1577[startDelim$1576.value]) {
                if (token$1580.leadingComments) {
                    delimToken$1584.trailingComments = token$1580.leadingComments;
                }
                break;
            } else if (token$1580.type === Token$817.EOF) {
                throwError$877({}, Messages$822.UnexpectedEOS);
            } else {
                inner$1578.push(token$1580);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$828 >= length$835 && matchDelim$1577[startDelim$1576.value] !== source$826[length$835 - 1]) {
            throwError$877({}, Messages$822.UnexpectedEOS);
        }
        var endLineNumber$1586 = token$1580.lineNumber;
        var endLineStart$1587 = token$1580.lineStart;
        var endRange$1588 = token$1580.range;
        delimToken$1584.inner = inner$1578;
        delimToken$1584.endLineNumber = endLineNumber$1586;
        delimToken$1584.endLineStart = endLineStart$1587;
        delimToken$1584.endRange = endRange$1588;
        return delimToken$1584;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$990(code$1589) {
        var token$1590, tokenTree$1591 = [];
        extra$842 = {};
        extra$842.comments = [];
        patch$983();
        source$826 = code$1589;
        index$828 = 0;
        lineNumber$829 = source$826.length > 0 ? 1 : 0;
        lineStart$830 = 0;
        length$835 = source$826.length;
        state$841 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$828 < length$835) {
            tokenTree$1591.push(readToken$988(tokenTree$1591, false, false));
        }
        var last$1592 = tokenTree$1591[tokenTree$1591.length - 1];
        if (last$1592 && last$1592.type !== Token$817.EOF) {
            tokenTree$1591.push({
                type: Token$817.EOF,
                value: '',
                lineNumber: last$1592.lineNumber,
                lineStart: last$1592.lineStart,
                range: [
                    index$828,
                    index$828
                ]
            });
        }
        return expander$816.tokensToSyntax(tokenTree$1591);
    }
    function parse$991(code$1593, options$1594) {
        var program$1595, toString$1596;
        extra$842 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1593)) {
            tokenStream$837 = code$1593;
            length$835 = tokenStream$837.length;
            lineNumber$829 = tokenStream$837.length > 0 ? 1 : 0;
            source$826 = undefined;
        } else {
            toString$1596 = String;
            if (typeof code$1593 !== 'string' && !(code$1593 instanceof String)) {
                code$1593 = toString$1596(code$1593);
            }
            source$826 = code$1593;
            length$835 = source$826.length;
            lineNumber$829 = source$826.length > 0 ? 1 : 0;
        }
        delegate$836 = SyntaxTreeDelegate$824;
        streamIndex$838 = -1;
        index$828 = 0;
        lineStart$830 = 0;
        sm_lineStart$832 = 0;
        sm_lineNumber$831 = lineNumber$829;
        sm_index$834 = 0;
        sm_range$833 = [
            0,
            0
        ];
        lookahead$839 = null;
        state$841 = {
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
        if (typeof options$1594 !== 'undefined') {
            extra$842.range = typeof options$1594.range === 'boolean' && options$1594.range;
            extra$842.loc = typeof options$1594.loc === 'boolean' && options$1594.loc;
            if (extra$842.loc && options$1594.source !== null && options$1594.source !== undefined) {
                delegate$836 = extend$985(delegate$836, {
                    'postProcess': function (node$1597) {
                        node$1597.loc.source = toString$1596(options$1594.source);
                        return node$1597;
                    }
                });
            }
            if (typeof options$1594.tokens === 'boolean' && options$1594.tokens) {
                extra$842.tokens = [];
            }
            if (typeof options$1594.comment === 'boolean' && options$1594.comment) {
                extra$842.comments = [];
            }
            if (typeof options$1594.tolerant === 'boolean' && options$1594.tolerant) {
                extra$842.errors = [];
            }
        }
        if (length$835 > 0) {
            if (source$826 && typeof source$826[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1593 instanceof String) {
                    source$826 = code$1593.valueOf();
                }
            }
        }
        extra$842 = { loc: true };
        patch$983();
        try {
            program$1595 = parseProgram$969();
            if (typeof extra$842.comments !== 'undefined') {
                filterCommentLocation$972();
                program$1595.comments = extra$842.comments;
            }
            if (typeof extra$842.tokens !== 'undefined') {
                filterTokenLocation$975();
                program$1595.tokens = extra$842.tokens;
            }
            if (typeof extra$842.errors !== 'undefined') {
                program$1595.errors = extra$842.errors;
            }
            if (extra$842.range || extra$842.loc) {
                program$1595.body = filterGroup$981(program$1595.body);
            }
        } catch (e$1598) {
            throw e$1598;
        } finally {
            unpatch$984();
            extra$842 = {};
        }
        return program$1595;
    }
    exports$815.tokenize = tokenize$986;
    exports$815.read = read$990;
    exports$815.Token = Token$817;
    exports$815.assert = assert$843;
    exports$815.parse = parse$991;
    // Deep copy.
    exports$815.Syntax = function () {
        var name$1599, types$1600 = {};
        if (typeof Object.create === 'function') {
            types$1600 = Object.create(null);
        }
        for (name$1599 in Syntax$820) {
            if (Syntax$820.hasOwnProperty(name$1599)) {
                types$1600[name$1599] = Syntax$820[name$1599];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1600);
        }
        return types$1600;
    }();
}));
//# sourceMappingURL=parser.js.map