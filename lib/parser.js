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
(function (root$1092, factory$1093) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$1093);
    } else if (typeof exports !== 'undefined') {
        factory$1093(exports, require('./expander'));
    } else {
        factory$1093(root$1092.esprima = {});
    }
}(this, function (exports$1094, expander$1095) {
    'use strict';
    var Token$1096, TokenName$1097, FnExprTokens$1098, Syntax$1099, PropertyKind$1100, Messages$1101, Regex$1102, SyntaxTreeDelegate$1103, ClassPropertyType$1104, source$1105, strict$1106, index$1107, lineNumber$1108, lineStart$1109, sm_lineNumber$1110, sm_lineStart$1111, sm_range$1112, sm_index$1113, length$1114, delegate$1115, tokenStream$1116, streamIndex$1117, lookahead$1118, lookaheadIndex$1119, state$1120, extra$1121;
    Token$1096 = {
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
    TokenName$1097 = {};
    TokenName$1097[Token$1096.BooleanLiteral] = 'Boolean';
    TokenName$1097[Token$1096.EOF] = '<end>';
    TokenName$1097[Token$1096.Identifier] = 'Identifier';
    TokenName$1097[Token$1096.Keyword] = 'Keyword';
    TokenName$1097[Token$1096.NullLiteral] = 'Null';
    TokenName$1097[Token$1096.NumericLiteral] = 'Numeric';
    TokenName$1097[Token$1096.Punctuator] = 'Punctuator';
    TokenName$1097[Token$1096.StringLiteral] = 'String';
    TokenName$1097[Token$1096.RegularExpression] = 'RegularExpression';
    TokenName$1097[Token$1096.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$1098 = [
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
    Syntax$1099 = {
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
    PropertyKind$1100 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$1104 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$1101 = {
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
    Regex$1102 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$1122(condition$1271, message$1272) {
        if (!condition$1271) {
            throw new Error('ASSERT: ' + message$1272);
        }
    }
    function isIn$1123(el$1273, list$1274) {
        return list$1274.indexOf(el$1273) !== -1;
    }
    function isDecimalDigit$1124(ch$1275) {
        return ch$1275 >= 48 && ch$1275 <= 57;
    }    // 0..9
    function isHexDigit$1125(ch$1276) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1276) >= 0;
    }
    function isOctalDigit$1126(ch$1277) {
        return '01234567'.indexOf(ch$1277) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$1127(ch$1278) {
        return ch$1278 === 32 || ch$1278 === 9 || ch$1278 === 11 || ch$1278 === 12 || ch$1278 === 160 || ch$1278 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1278)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$1128(ch$1279) {
        return ch$1279 === 10 || ch$1279 === 13 || ch$1279 === 8232 || ch$1279 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$1129(ch$1280) {
        return ch$1280 === 36 || ch$1280 === 95 || ch$1280 >= 65 && ch$1280 <= 90 || ch$1280 >= 97 && ch$1280 <= 122 || ch$1280 === 92 || ch$1280 >= 128 && Regex$1102.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1280));
    }
    function isIdentifierPart$1130(ch$1281) {
        return ch$1281 === 36 || ch$1281 === 95 || ch$1281 >= 65 && ch$1281 <= 90 || ch$1281 >= 97 && ch$1281 <= 122 || ch$1281 >= 48 && ch$1281 <= 57 || ch$1281 === 92 || ch$1281 >= 128 && Regex$1102.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1281));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$1131(id$1282) {
        switch (id$1282) {
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
    function isStrictModeReservedWord$1132(id$1283) {
        switch (id$1283) {
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
    function isRestrictedWord$1133(id$1284) {
        return id$1284 === 'eval' || id$1284 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$1134(id$1285) {
        if (strict$1106 && isStrictModeReservedWord$1132(id$1285)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1285.length) {
        case 2:
            return id$1285 === 'if' || id$1285 === 'in' || id$1285 === 'do';
        case 3:
            return id$1285 === 'var' || id$1285 === 'for' || id$1285 === 'new' || id$1285 === 'try' || id$1285 === 'let';
        case 4:
            return id$1285 === 'this' || id$1285 === 'else' || id$1285 === 'case' || id$1285 === 'void' || id$1285 === 'with' || id$1285 === 'enum';
        case 5:
            return id$1285 === 'while' || id$1285 === 'break' || id$1285 === 'catch' || id$1285 === 'throw' || id$1285 === 'const' || id$1285 === 'yield' || id$1285 === 'class' || id$1285 === 'super';
        case 6:
            return id$1285 === 'return' || id$1285 === 'typeof' || id$1285 === 'delete' || id$1285 === 'switch' || id$1285 === 'export' || id$1285 === 'import';
        case 7:
            return id$1285 === 'default' || id$1285 === 'finally' || id$1285 === 'extends';
        case 8:
            return id$1285 === 'function' || id$1285 === 'continue' || id$1285 === 'debugger';
        case 10:
            return id$1285 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$1135() {
        var ch$1286, blockComment$1287, lineComment$1288;
        blockComment$1287 = false;
        lineComment$1288 = false;
        while (index$1107 < length$1114) {
            ch$1286 = source$1105.charCodeAt(index$1107);
            if (lineComment$1288) {
                ++index$1107;
                if (isLineTerminator$1128(ch$1286)) {
                    lineComment$1288 = false;
                    if (ch$1286 === 13 && source$1105.charCodeAt(index$1107) === 10) {
                        ++index$1107;
                    }
                    ++lineNumber$1108;
                    lineStart$1109 = index$1107;
                }
            } else if (blockComment$1287) {
                if (isLineTerminator$1128(ch$1286)) {
                    if (ch$1286 === 13 && source$1105.charCodeAt(index$1107 + 1) === 10) {
                        ++index$1107;
                    }
                    ++lineNumber$1108;
                    ++index$1107;
                    lineStart$1109 = index$1107;
                    if (index$1107 >= length$1114) {
                        throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1286 = source$1105.charCodeAt(index$1107++);
                    if (index$1107 >= length$1114) {
                        throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1286 === 42) {
                        ch$1286 = source$1105.charCodeAt(index$1107);
                        if (ch$1286 === 47) {
                            ++index$1107;
                            blockComment$1287 = false;
                        }
                    }
                }
            } else if (ch$1286 === 47) {
                ch$1286 = source$1105.charCodeAt(index$1107 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1286 === 47) {
                    index$1107 += 2;
                    lineComment$1288 = true;
                } else if (ch$1286 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$1107 += 2;
                    blockComment$1287 = true;
                    if (index$1107 >= length$1114) {
                        throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1127(ch$1286)) {
                ++index$1107;
            } else if (isLineTerminator$1128(ch$1286)) {
                ++index$1107;
                if (ch$1286 === 13 && source$1105.charCodeAt(index$1107) === 10) {
                    ++index$1107;
                }
                ++lineNumber$1108;
                lineStart$1109 = index$1107;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$1136(prefix$1289) {
        var i$1290, len$1291, ch$1292, code$1293 = 0;
        len$1291 = prefix$1289 === 'u' ? 4 : 2;
        for (i$1290 = 0; i$1290 < len$1291; ++i$1290) {
            if (index$1107 < length$1114 && isHexDigit$1125(source$1105[index$1107])) {
                ch$1292 = source$1105[index$1107++];
                code$1293 = code$1293 * 16 + '0123456789abcdef'.indexOf(ch$1292.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1293);
    }
    function scanUnicodeCodePointEscape$1137() {
        var ch$1294, code$1295, cu1$1296, cu2$1297;
        ch$1294 = source$1105[index$1107];
        code$1295 = 0;
        // At least, one hex digit is required.
        if (ch$1294 === '}') {
            throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
        }
        while (index$1107 < length$1114) {
            ch$1294 = source$1105[index$1107++];
            if (!isHexDigit$1125(ch$1294)) {
                break;
            }
            code$1295 = code$1295 * 16 + '0123456789abcdef'.indexOf(ch$1294.toLowerCase());
        }
        if (code$1295 > 1114111 || ch$1294 !== '}') {
            throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1295 <= 65535) {
            return String.fromCharCode(code$1295);
        }
        cu1$1296 = (code$1295 - 65536 >> 10) + 55296;
        cu2$1297 = (code$1295 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1296, cu2$1297);
    }
    function getEscapedIdentifier$1138() {
        var ch$1298, id$1299;
        ch$1298 = source$1105.charCodeAt(index$1107++);
        id$1299 = String.fromCharCode(ch$1298);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1298 === 92) {
            if (source$1105.charCodeAt(index$1107) !== 117) {
                throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
            }
            ++index$1107;
            ch$1298 = scanHexEscape$1136('u');
            if (!ch$1298 || ch$1298 === '\\' || !isIdentifierStart$1129(ch$1298.charCodeAt(0))) {
                throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
            }
            id$1299 = ch$1298;
        }
        while (index$1107 < length$1114) {
            ch$1298 = source$1105.charCodeAt(index$1107);
            if (!isIdentifierPart$1130(ch$1298)) {
                break;
            }
            ++index$1107;
            id$1299 += String.fromCharCode(ch$1298);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1298 === 92) {
                id$1299 = id$1299.substr(0, id$1299.length - 1);
                if (source$1105.charCodeAt(index$1107) !== 117) {
                    throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
                }
                ++index$1107;
                ch$1298 = scanHexEscape$1136('u');
                if (!ch$1298 || ch$1298 === '\\' || !isIdentifierPart$1130(ch$1298.charCodeAt(0))) {
                    throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
                }
                id$1299 += ch$1298;
            }
        }
        return id$1299;
    }
    function getIdentifier$1139() {
        var start$1300, ch$1301;
        start$1300 = index$1107++;
        while (index$1107 < length$1114) {
            ch$1301 = source$1105.charCodeAt(index$1107);
            if (ch$1301 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$1107 = start$1300;
                return getEscapedIdentifier$1138();
            }
            if (isIdentifierPart$1130(ch$1301)) {
                ++index$1107;
            } else {
                break;
            }
        }
        return source$1105.slice(start$1300, index$1107);
    }
    function scanIdentifier$1140() {
        var start$1302, id$1303, type$1304;
        start$1302 = index$1107;
        // Backslash (char #92) starts an escaped character.
        id$1303 = source$1105.charCodeAt(index$1107) === 92 ? getEscapedIdentifier$1138() : getIdentifier$1139();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1303.length === 1) {
            type$1304 = Token$1096.Identifier;
        } else if (isKeyword$1134(id$1303)) {
            type$1304 = Token$1096.Keyword;
        } else if (id$1303 === 'null') {
            type$1304 = Token$1096.NullLiteral;
        } else if (id$1303 === 'true' || id$1303 === 'false') {
            type$1304 = Token$1096.BooleanLiteral;
        } else {
            type$1304 = Token$1096.Identifier;
        }
        return {
            type: type$1304,
            value: id$1303,
            lineNumber: lineNumber$1108,
            lineStart: lineStart$1109,
            range: [
                start$1302,
                index$1107
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$1141() {
        var start$1305 = index$1107, code$1306 = source$1105.charCodeAt(index$1107), code2$1307, ch1$1308 = source$1105[index$1107], ch2$1309, ch3$1310, ch4$1311;
        switch (code$1306) {
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
            ++index$1107;
            if (extra$1121.tokenize) {
                if (code$1306 === 40) {
                    extra$1121.openParenToken = extra$1121.tokens.length;
                } else if (code$1306 === 123) {
                    extra$1121.openCurlyToken = extra$1121.tokens.length;
                }
            }
            return {
                type: Token$1096.Punctuator,
                value: String.fromCharCode(code$1306),
                lineNumber: lineNumber$1108,
                lineStart: lineStart$1109,
                range: [
                    start$1305,
                    index$1107
                ]
            };
        default:
            code2$1307 = source$1105.charCodeAt(index$1107 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1307 === 61) {
                switch (code$1306) {
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
                    index$1107 += 2;
                    return {
                        type: Token$1096.Punctuator,
                        value: String.fromCharCode(code$1306) + String.fromCharCode(code2$1307),
                        lineNumber: lineNumber$1108,
                        lineStart: lineStart$1109,
                        range: [
                            start$1305,
                            index$1107
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$1107 += 2;
                    // !== and ===
                    if (source$1105.charCodeAt(index$1107) === 61) {
                        ++index$1107;
                    }
                    return {
                        type: Token$1096.Punctuator,
                        value: source$1105.slice(start$1305, index$1107),
                        lineNumber: lineNumber$1108,
                        lineStart: lineStart$1109,
                        range: [
                            start$1305,
                            index$1107
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1309 = source$1105[index$1107 + 1];
        ch3$1310 = source$1105[index$1107 + 2];
        ch4$1311 = source$1105[index$1107 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1308 === '>' && ch2$1309 === '>' && ch3$1310 === '>') {
            if (ch4$1311 === '=') {
                index$1107 += 4;
                return {
                    type: Token$1096.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$1108,
                    lineStart: lineStart$1109,
                    range: [
                        start$1305,
                        index$1107
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1308 === '>' && ch2$1309 === '>' && ch3$1310 === '>') {
            index$1107 += 3;
            return {
                type: Token$1096.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$1108,
                lineStart: lineStart$1109,
                range: [
                    start$1305,
                    index$1107
                ]
            };
        }
        if (ch1$1308 === '<' && ch2$1309 === '<' && ch3$1310 === '=') {
            index$1107 += 3;
            return {
                type: Token$1096.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$1108,
                lineStart: lineStart$1109,
                range: [
                    start$1305,
                    index$1107
                ]
            };
        }
        if (ch1$1308 === '>' && ch2$1309 === '>' && ch3$1310 === '=') {
            index$1107 += 3;
            return {
                type: Token$1096.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$1108,
                lineStart: lineStart$1109,
                range: [
                    start$1305,
                    index$1107
                ]
            };
        }
        if (ch1$1308 === '.' && ch2$1309 === '.' && ch3$1310 === '.') {
            index$1107 += 3;
            return {
                type: Token$1096.Punctuator,
                value: '...',
                lineNumber: lineNumber$1108,
                lineStart: lineStart$1109,
                range: [
                    start$1305,
                    index$1107
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1308 === ch2$1309 && '+-<>&|'.indexOf(ch1$1308) >= 0) {
            index$1107 += 2;
            return {
                type: Token$1096.Punctuator,
                value: ch1$1308 + ch2$1309,
                lineNumber: lineNumber$1108,
                lineStart: lineStart$1109,
                range: [
                    start$1305,
                    index$1107
                ]
            };
        }
        if (ch1$1308 === '=' && ch2$1309 === '>') {
            index$1107 += 2;
            return {
                type: Token$1096.Punctuator,
                value: '=>',
                lineNumber: lineNumber$1108,
                lineStart: lineStart$1109,
                range: [
                    start$1305,
                    index$1107
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1308) >= 0) {
            ++index$1107;
            return {
                type: Token$1096.Punctuator,
                value: ch1$1308,
                lineNumber: lineNumber$1108,
                lineStart: lineStart$1109,
                range: [
                    start$1305,
                    index$1107
                ]
            };
        }
        if (ch1$1308 === '.') {
            ++index$1107;
            return {
                type: Token$1096.Punctuator,
                value: ch1$1308,
                lineNumber: lineNumber$1108,
                lineStart: lineStart$1109,
                range: [
                    start$1305,
                    index$1107
                ]
            };
        }
        throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$1142(start$1312) {
        var number$1313 = '';
        while (index$1107 < length$1114) {
            if (!isHexDigit$1125(source$1105[index$1107])) {
                break;
            }
            number$1313 += source$1105[index$1107++];
        }
        if (number$1313.length === 0) {
            throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$1129(source$1105.charCodeAt(index$1107))) {
            throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1096.NumericLiteral,
            value: parseInt('0x' + number$1313, 16),
            lineNumber: lineNumber$1108,
            lineStart: lineStart$1109,
            range: [
                start$1312,
                index$1107
            ]
        };
    }
    function scanOctalLiteral$1143(prefix$1314, start$1315) {
        var number$1316, octal$1317;
        if (isOctalDigit$1126(prefix$1314)) {
            octal$1317 = true;
            number$1316 = '0' + source$1105[index$1107++];
        } else {
            octal$1317 = false;
            ++index$1107;
            number$1316 = '';
        }
        while (index$1107 < length$1114) {
            if (!isOctalDigit$1126(source$1105[index$1107])) {
                break;
            }
            number$1316 += source$1105[index$1107++];
        }
        if (!octal$1317 && number$1316.length === 0) {
            // only 0o or 0O
            throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$1129(source$1105.charCodeAt(index$1107)) || isDecimalDigit$1124(source$1105.charCodeAt(index$1107))) {
            throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1096.NumericLiteral,
            value: parseInt(number$1316, 8),
            octal: octal$1317,
            lineNumber: lineNumber$1108,
            lineStart: lineStart$1109,
            range: [
                start$1315,
                index$1107
            ]
        };
    }
    function scanNumericLiteral$1144() {
        var number$1318, start$1319, ch$1320, octal$1321;
        ch$1320 = source$1105[index$1107];
        assert$1122(isDecimalDigit$1124(ch$1320.charCodeAt(0)) || ch$1320 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1319 = index$1107;
        number$1318 = '';
        if (ch$1320 !== '.') {
            number$1318 = source$1105[index$1107++];
            ch$1320 = source$1105[index$1107];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1318 === '0') {
                if (ch$1320 === 'x' || ch$1320 === 'X') {
                    ++index$1107;
                    return scanHexLiteral$1142(start$1319);
                }
                if (ch$1320 === 'b' || ch$1320 === 'B') {
                    ++index$1107;
                    number$1318 = '';
                    while (index$1107 < length$1114) {
                        ch$1320 = source$1105[index$1107];
                        if (ch$1320 !== '0' && ch$1320 !== '1') {
                            break;
                        }
                        number$1318 += source$1105[index$1107++];
                    }
                    if (number$1318.length === 0) {
                        // only 0b or 0B
                        throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$1107 < length$1114) {
                        ch$1320 = source$1105.charCodeAt(index$1107);
                        if (isIdentifierStart$1129(ch$1320) || isDecimalDigit$1124(ch$1320)) {
                            throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$1096.NumericLiteral,
                        value: parseInt(number$1318, 2),
                        lineNumber: lineNumber$1108,
                        lineStart: lineStart$1109,
                        range: [
                            start$1319,
                            index$1107
                        ]
                    };
                }
                if (ch$1320 === 'o' || ch$1320 === 'O' || isOctalDigit$1126(ch$1320)) {
                    return scanOctalLiteral$1143(ch$1320, start$1319);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1320 && isDecimalDigit$1124(ch$1320.charCodeAt(0))) {
                    throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$1124(source$1105.charCodeAt(index$1107))) {
                number$1318 += source$1105[index$1107++];
            }
            ch$1320 = source$1105[index$1107];
        }
        if (ch$1320 === '.') {
            number$1318 += source$1105[index$1107++];
            while (isDecimalDigit$1124(source$1105.charCodeAt(index$1107))) {
                number$1318 += source$1105[index$1107++];
            }
            ch$1320 = source$1105[index$1107];
        }
        if (ch$1320 === 'e' || ch$1320 === 'E') {
            number$1318 += source$1105[index$1107++];
            ch$1320 = source$1105[index$1107];
            if (ch$1320 === '+' || ch$1320 === '-') {
                number$1318 += source$1105[index$1107++];
            }
            if (isDecimalDigit$1124(source$1105.charCodeAt(index$1107))) {
                while (isDecimalDigit$1124(source$1105.charCodeAt(index$1107))) {
                    number$1318 += source$1105[index$1107++];
                }
            } else {
                throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$1129(source$1105.charCodeAt(index$1107))) {
            throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1096.NumericLiteral,
            value: parseFloat(number$1318),
            lineNumber: lineNumber$1108,
            lineStart: lineStart$1109,
            range: [
                start$1319,
                index$1107
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$1145() {
        var str$1322 = '', quote$1323, start$1324, ch$1325, code$1326, unescaped$1327, restore$1328, octal$1329 = false;
        quote$1323 = source$1105[index$1107];
        assert$1122(quote$1323 === '\'' || quote$1323 === '"', 'String literal must starts with a quote');
        start$1324 = index$1107;
        ++index$1107;
        while (index$1107 < length$1114) {
            ch$1325 = source$1105[index$1107++];
            if (ch$1325 === quote$1323) {
                quote$1323 = '';
                break;
            } else if (ch$1325 === '\\') {
                ch$1325 = source$1105[index$1107++];
                if (!ch$1325 || !isLineTerminator$1128(ch$1325.charCodeAt(0))) {
                    switch (ch$1325) {
                    case 'n':
                        str$1322 += '\n';
                        break;
                    case 'r':
                        str$1322 += '\r';
                        break;
                    case 't':
                        str$1322 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$1105[index$1107] === '{') {
                            ++index$1107;
                            str$1322 += scanUnicodeCodePointEscape$1137();
                        } else {
                            restore$1328 = index$1107;
                            unescaped$1327 = scanHexEscape$1136(ch$1325);
                            if (unescaped$1327) {
                                str$1322 += unescaped$1327;
                            } else {
                                index$1107 = restore$1328;
                                str$1322 += ch$1325;
                            }
                        }
                        break;
                    case 'b':
                        str$1322 += '\b';
                        break;
                    case 'f':
                        str$1322 += '\f';
                        break;
                    case 'v':
                        str$1322 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$1126(ch$1325)) {
                            code$1326 = '01234567'.indexOf(ch$1325);
                            // \0 is not octal escape sequence
                            if (code$1326 !== 0) {
                                octal$1329 = true;
                            }
                            if (index$1107 < length$1114 && isOctalDigit$1126(source$1105[index$1107])) {
                                octal$1329 = true;
                                code$1326 = code$1326 * 8 + '01234567'.indexOf(source$1105[index$1107++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1325) >= 0 && index$1107 < length$1114 && isOctalDigit$1126(source$1105[index$1107])) {
                                    code$1326 = code$1326 * 8 + '01234567'.indexOf(source$1105[index$1107++]);
                                }
                            }
                            str$1322 += String.fromCharCode(code$1326);
                        } else {
                            str$1322 += ch$1325;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$1108;
                    if (ch$1325 === '\r' && source$1105[index$1107] === '\n') {
                        ++index$1107;
                    }
                }
            } else if (isLineTerminator$1128(ch$1325.charCodeAt(0))) {
                break;
            } else {
                str$1322 += ch$1325;
            }
        }
        if (quote$1323 !== '') {
            throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1096.StringLiteral,
            value: str$1322,
            octal: octal$1329,
            lineNumber: lineNumber$1108,
            lineStart: lineStart$1109,
            range: [
                start$1324,
                index$1107
            ]
        };
    }
    function scanTemplate$1146() {
        var cooked$1330 = '', ch$1331, start$1332, terminated$1333, tail$1334, restore$1335, unescaped$1336, code$1337, octal$1338;
        terminated$1333 = false;
        tail$1334 = false;
        start$1332 = index$1107;
        ++index$1107;
        while (index$1107 < length$1114) {
            ch$1331 = source$1105[index$1107++];
            if (ch$1331 === '`') {
                tail$1334 = true;
                terminated$1333 = true;
                break;
            } else if (ch$1331 === '$') {
                if (source$1105[index$1107] === '{') {
                    ++index$1107;
                    terminated$1333 = true;
                    break;
                }
                cooked$1330 += ch$1331;
            } else if (ch$1331 === '\\') {
                ch$1331 = source$1105[index$1107++];
                if (!isLineTerminator$1128(ch$1331.charCodeAt(0))) {
                    switch (ch$1331) {
                    case 'n':
                        cooked$1330 += '\n';
                        break;
                    case 'r':
                        cooked$1330 += '\r';
                        break;
                    case 't':
                        cooked$1330 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$1105[index$1107] === '{') {
                            ++index$1107;
                            cooked$1330 += scanUnicodeCodePointEscape$1137();
                        } else {
                            restore$1335 = index$1107;
                            unescaped$1336 = scanHexEscape$1136(ch$1331);
                            if (unescaped$1336) {
                                cooked$1330 += unescaped$1336;
                            } else {
                                index$1107 = restore$1335;
                                cooked$1330 += ch$1331;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1330 += '\b';
                        break;
                    case 'f':
                        cooked$1330 += '\f';
                        break;
                    case 'v':
                        cooked$1330 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$1126(ch$1331)) {
                            code$1337 = '01234567'.indexOf(ch$1331);
                            // \0 is not octal escape sequence
                            if (code$1337 !== 0) {
                                octal$1338 = true;
                            }
                            if (index$1107 < length$1114 && isOctalDigit$1126(source$1105[index$1107])) {
                                octal$1338 = true;
                                code$1337 = code$1337 * 8 + '01234567'.indexOf(source$1105[index$1107++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1331) >= 0 && index$1107 < length$1114 && isOctalDigit$1126(source$1105[index$1107])) {
                                    code$1337 = code$1337 * 8 + '01234567'.indexOf(source$1105[index$1107++]);
                                }
                            }
                            cooked$1330 += String.fromCharCode(code$1337);
                        } else {
                            cooked$1330 += ch$1331;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$1108;
                    if (ch$1331 === '\r' && source$1105[index$1107] === '\n') {
                        ++index$1107;
                    }
                }
            } else if (isLineTerminator$1128(ch$1331.charCodeAt(0))) {
                ++lineNumber$1108;
                if (ch$1331 === '\r' && source$1105[index$1107] === '\n') {
                    ++index$1107;
                }
                cooked$1330 += '\n';
            } else {
                cooked$1330 += ch$1331;
            }
        }
        if (!terminated$1333) {
            throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1096.Template,
            value: {
                cooked: cooked$1330,
                raw: source$1105.slice(start$1332 + 1, index$1107 - (tail$1334 ? 1 : 2))
            },
            tail: tail$1334,
            octal: octal$1338,
            lineNumber: lineNumber$1108,
            lineStart: lineStart$1109,
            range: [
                start$1332,
                index$1107
            ]
        };
    }
    function scanTemplateElement$1147(option$1339) {
        var startsWith$1340, template$1341;
        lookahead$1118 = null;
        skipComment$1135();
        startsWith$1340 = option$1339.head ? '`' : '}';
        if (source$1105[index$1107] !== startsWith$1340) {
            throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
        }
        template$1341 = scanTemplate$1146();
        peek$1153();
        return template$1341;
    }
    function scanRegExp$1148() {
        var str$1342, ch$1343, start$1344, pattern$1345, flags$1346, value$1347, classMarker$1348 = false, restore$1349, terminated$1350 = false;
        lookahead$1118 = null;
        skipComment$1135();
        start$1344 = index$1107;
        ch$1343 = source$1105[index$1107];
        assert$1122(ch$1343 === '/', 'Regular expression literal must start with a slash');
        str$1342 = source$1105[index$1107++];
        while (index$1107 < length$1114) {
            ch$1343 = source$1105[index$1107++];
            str$1342 += ch$1343;
            if (classMarker$1348) {
                if (ch$1343 === ']') {
                    classMarker$1348 = false;
                }
            } else {
                if (ch$1343 === '\\') {
                    ch$1343 = source$1105[index$1107++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$1128(ch$1343.charCodeAt(0))) {
                        throwError$1156({}, Messages$1101.UnterminatedRegExp);
                    }
                    str$1342 += ch$1343;
                } else if (ch$1343 === '/') {
                    terminated$1350 = true;
                    break;
                } else if (ch$1343 === '[') {
                    classMarker$1348 = true;
                } else if (isLineTerminator$1128(ch$1343.charCodeAt(0))) {
                    throwError$1156({}, Messages$1101.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1350) {
            throwError$1156({}, Messages$1101.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1345 = str$1342.substr(1, str$1342.length - 2);
        flags$1346 = '';
        while (index$1107 < length$1114) {
            ch$1343 = source$1105[index$1107];
            if (!isIdentifierPart$1130(ch$1343.charCodeAt(0))) {
                break;
            }
            ++index$1107;
            if (ch$1343 === '\\' && index$1107 < length$1114) {
                ch$1343 = source$1105[index$1107];
                if (ch$1343 === 'u') {
                    ++index$1107;
                    restore$1349 = index$1107;
                    ch$1343 = scanHexEscape$1136('u');
                    if (ch$1343) {
                        flags$1346 += ch$1343;
                        for (str$1342 += '\\u'; restore$1349 < index$1107; ++restore$1349) {
                            str$1342 += source$1105[restore$1349];
                        }
                    } else {
                        index$1107 = restore$1349;
                        flags$1346 += 'u';
                        str$1342 += '\\u';
                    }
                } else {
                    str$1342 += '\\';
                }
            } else {
                flags$1346 += ch$1343;
                str$1342 += ch$1343;
            }
        }
        try {
            value$1347 = new RegExp(pattern$1345, flags$1346);
        } catch (e$1351) {
            throwError$1156({}, Messages$1101.InvalidRegExp);
        }
        // peek();
        if (extra$1121.tokenize) {
            return {
                type: Token$1096.RegularExpression,
                value: value$1347,
                lineNumber: lineNumber$1108,
                lineStart: lineStart$1109,
                range: [
                    start$1344,
                    index$1107
                ]
            };
        }
        return {
            type: Token$1096.RegularExpression,
            literal: str$1342,
            value: value$1347,
            range: [
                start$1344,
                index$1107
            ]
        };
    }
    function isIdentifierName$1149(token$1352) {
        return token$1352.type === Token$1096.Identifier || token$1352.type === Token$1096.Keyword || token$1352.type === Token$1096.BooleanLiteral || token$1352.type === Token$1096.NullLiteral;
    }
    function advanceSlash$1150() {
        var prevToken$1353, checkToken$1354;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1353 = extra$1121.tokens[extra$1121.tokens.length - 1];
        if (!prevToken$1353) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$1148();
        }
        if (prevToken$1353.type === 'Punctuator') {
            if (prevToken$1353.value === ')') {
                checkToken$1354 = extra$1121.tokens[extra$1121.openParenToken - 1];
                if (checkToken$1354 && checkToken$1354.type === 'Keyword' && (checkToken$1354.value === 'if' || checkToken$1354.value === 'while' || checkToken$1354.value === 'for' || checkToken$1354.value === 'with')) {
                    return scanRegExp$1148();
                }
                return scanPunctuator$1141();
            }
            if (prevToken$1353.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$1121.tokens[extra$1121.openCurlyToken - 3] && extra$1121.tokens[extra$1121.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1354 = extra$1121.tokens[extra$1121.openCurlyToken - 4];
                    if (!checkToken$1354) {
                        return scanPunctuator$1141();
                    }
                } else if (extra$1121.tokens[extra$1121.openCurlyToken - 4] && extra$1121.tokens[extra$1121.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1354 = extra$1121.tokens[extra$1121.openCurlyToken - 5];
                    if (!checkToken$1354) {
                        return scanRegExp$1148();
                    }
                } else {
                    return scanPunctuator$1141();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$1098.indexOf(checkToken$1354.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$1141();
                }
                // It is a declaration.
                return scanRegExp$1148();
            }
            return scanRegExp$1148();
        }
        if (prevToken$1353.type === 'Keyword') {
            return scanRegExp$1148();
        }
        return scanPunctuator$1141();
    }
    function advance$1151() {
        var ch$1355;
        skipComment$1135();
        if (index$1107 >= length$1114) {
            return {
                type: Token$1096.EOF,
                lineNumber: lineNumber$1108,
                lineStart: lineStart$1109,
                range: [
                    index$1107,
                    index$1107
                ]
            };
        }
        ch$1355 = source$1105.charCodeAt(index$1107);
        // Very common: ( and ) and ;
        if (ch$1355 === 40 || ch$1355 === 41 || ch$1355 === 58) {
            return scanPunctuator$1141();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1355 === 39 || ch$1355 === 34) {
            return scanStringLiteral$1145();
        }
        if (ch$1355 === 96) {
            return scanTemplate$1146();
        }
        if (isIdentifierStart$1129(ch$1355)) {
            return scanIdentifier$1140();
        }
        // # and @ are allowed for sweet.js
        if (ch$1355 === 35 || ch$1355 === 64) {
            ++index$1107;
            return {
                type: Token$1096.Punctuator,
                value: String.fromCharCode(ch$1355),
                lineNumber: lineNumber$1108,
                lineStart: lineStart$1109,
                range: [
                    index$1107 - 1,
                    index$1107
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1355 === 46) {
            if (isDecimalDigit$1124(source$1105.charCodeAt(index$1107 + 1))) {
                return scanNumericLiteral$1144();
            }
            return scanPunctuator$1141();
        }
        if (isDecimalDigit$1124(ch$1355)) {
            return scanNumericLiteral$1144();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$1121.tokenize && ch$1355 === 47) {
            return advanceSlash$1150();
        }
        return scanPunctuator$1141();
    }
    function lex$1152() {
        var token$1356;
        token$1356 = lookahead$1118;
        streamIndex$1117 = lookaheadIndex$1119;
        lineNumber$1108 = token$1356.lineNumber;
        lineStart$1109 = token$1356.lineStart;
        sm_lineNumber$1110 = lookahead$1118.sm_lineNumber;
        sm_lineStart$1111 = lookahead$1118.sm_lineStart;
        sm_range$1112 = lookahead$1118.sm_range;
        sm_index$1113 = lookahead$1118.sm_range[0];
        lookahead$1118 = tokenStream$1116[++streamIndex$1117].token;
        lookaheadIndex$1119 = streamIndex$1117;
        index$1107 = lookahead$1118.range[0];
        return token$1356;
    }
    function peek$1153() {
        lookaheadIndex$1119 = streamIndex$1117 + 1;
        if (lookaheadIndex$1119 >= length$1114) {
            lookahead$1118 = {
                type: Token$1096.EOF,
                lineNumber: lineNumber$1108,
                lineStart: lineStart$1109,
                range: [
                    index$1107,
                    index$1107
                ]
            };
            return;
        }
        lookahead$1118 = tokenStream$1116[lookaheadIndex$1119].token;
        index$1107 = lookahead$1118.range[0];
    }
    function lookahead2$1154() {
        var adv$1357, pos$1358, line$1359, start$1360, result$1361;
        if (streamIndex$1117 + 1 >= length$1114 || streamIndex$1117 + 2 >= length$1114) {
            return {
                type: Token$1096.EOF,
                lineNumber: lineNumber$1108,
                lineStart: lineStart$1109,
                range: [
                    index$1107,
                    index$1107
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$1118 === null) {
            lookaheadIndex$1119 = streamIndex$1117 + 1;
            lookahead$1118 = tokenStream$1116[lookaheadIndex$1119].token;
            index$1107 = lookahead$1118.range[0];
        }
        result$1361 = tokenStream$1116[lookaheadIndex$1119 + 1].token;
        return result$1361;
    }
    SyntaxTreeDelegate$1103 = {
        name: 'SyntaxTree',
        postProcess: function (node$1362) {
            return node$1362;
        },
        createArrayExpression: function (elements$1363) {
            return {
                type: Syntax$1099.ArrayExpression,
                elements: elements$1363
            };
        },
        createAssignmentExpression: function (operator$1364, left$1365, right$1366) {
            return {
                type: Syntax$1099.AssignmentExpression,
                operator: operator$1364,
                left: left$1365,
                right: right$1366
            };
        },
        createBinaryExpression: function (operator$1367, left$1368, right$1369) {
            var type$1370 = operator$1367 === '||' || operator$1367 === '&&' ? Syntax$1099.LogicalExpression : Syntax$1099.BinaryExpression;
            return {
                type: type$1370,
                operator: operator$1367,
                left: left$1368,
                right: right$1369
            };
        },
        createBlockStatement: function (body$1371) {
            return {
                type: Syntax$1099.BlockStatement,
                body: body$1371
            };
        },
        createBreakStatement: function (label$1372) {
            return {
                type: Syntax$1099.BreakStatement,
                label: label$1372
            };
        },
        createCallExpression: function (callee$1373, args$1374) {
            return {
                type: Syntax$1099.CallExpression,
                callee: callee$1373,
                'arguments': args$1374
            };
        },
        createCatchClause: function (param$1375, body$1376) {
            return {
                type: Syntax$1099.CatchClause,
                param: param$1375,
                body: body$1376
            };
        },
        createConditionalExpression: function (test$1377, consequent$1378, alternate$1379) {
            return {
                type: Syntax$1099.ConditionalExpression,
                test: test$1377,
                consequent: consequent$1378,
                alternate: alternate$1379
            };
        },
        createContinueStatement: function (label$1380) {
            return {
                type: Syntax$1099.ContinueStatement,
                label: label$1380
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$1099.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1381, test$1382) {
            return {
                type: Syntax$1099.DoWhileStatement,
                body: body$1381,
                test: test$1382
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$1099.EmptyStatement };
        },
        createExpressionStatement: function (expression$1383) {
            return {
                type: Syntax$1099.ExpressionStatement,
                expression: expression$1383
            };
        },
        createForStatement: function (init$1384, test$1385, update$1386, body$1387) {
            return {
                type: Syntax$1099.ForStatement,
                init: init$1384,
                test: test$1385,
                update: update$1386,
                body: body$1387
            };
        },
        createForInStatement: function (left$1388, right$1389, body$1390) {
            return {
                type: Syntax$1099.ForInStatement,
                left: left$1388,
                right: right$1389,
                body: body$1390,
                each: false
            };
        },
        createForOfStatement: function (left$1391, right$1392, body$1393) {
            return {
                type: Syntax$1099.ForOfStatement,
                left: left$1391,
                right: right$1392,
                body: body$1393
            };
        },
        createFunctionDeclaration: function (id$1394, params$1395, defaults$1396, body$1397, rest$1398, generator$1399, expression$1400) {
            return {
                type: Syntax$1099.FunctionDeclaration,
                id: id$1394,
                params: params$1395,
                defaults: defaults$1396,
                body: body$1397,
                rest: rest$1398,
                generator: generator$1399,
                expression: expression$1400
            };
        },
        createFunctionExpression: function (id$1401, params$1402, defaults$1403, body$1404, rest$1405, generator$1406, expression$1407) {
            return {
                type: Syntax$1099.FunctionExpression,
                id: id$1401,
                params: params$1402,
                defaults: defaults$1403,
                body: body$1404,
                rest: rest$1405,
                generator: generator$1406,
                expression: expression$1407
            };
        },
        createIdentifier: function (name$1408) {
            return {
                type: Syntax$1099.Identifier,
                name: name$1408
            };
        },
        createIfStatement: function (test$1409, consequent$1410, alternate$1411) {
            return {
                type: Syntax$1099.IfStatement,
                test: test$1409,
                consequent: consequent$1410,
                alternate: alternate$1411
            };
        },
        createLabeledStatement: function (label$1412, body$1413) {
            return {
                type: Syntax$1099.LabeledStatement,
                label: label$1412,
                body: body$1413
            };
        },
        createLiteral: function (token$1414) {
            return {
                type: Syntax$1099.Literal,
                value: token$1414.value,
                raw: String(token$1414.value)
            };
        },
        createMemberExpression: function (accessor$1415, object$1416, property$1417) {
            return {
                type: Syntax$1099.MemberExpression,
                computed: accessor$1415 === '[',
                object: object$1416,
                property: property$1417
            };
        },
        createNewExpression: function (callee$1418, args$1419) {
            return {
                type: Syntax$1099.NewExpression,
                callee: callee$1418,
                'arguments': args$1419
            };
        },
        createObjectExpression: function (properties$1420) {
            return {
                type: Syntax$1099.ObjectExpression,
                properties: properties$1420
            };
        },
        createPostfixExpression: function (operator$1421, argument$1422) {
            return {
                type: Syntax$1099.UpdateExpression,
                operator: operator$1421,
                argument: argument$1422,
                prefix: false
            };
        },
        createProgram: function (body$1423) {
            return {
                type: Syntax$1099.Program,
                body: body$1423
            };
        },
        createProperty: function (kind$1424, key$1425, value$1426, method$1427, shorthand$1428) {
            return {
                type: Syntax$1099.Property,
                key: key$1425,
                value: value$1426,
                kind: kind$1424,
                method: method$1427,
                shorthand: shorthand$1428
            };
        },
        createReturnStatement: function (argument$1429) {
            return {
                type: Syntax$1099.ReturnStatement,
                argument: argument$1429
            };
        },
        createSequenceExpression: function (expressions$1430) {
            return {
                type: Syntax$1099.SequenceExpression,
                expressions: expressions$1430
            };
        },
        createSwitchCase: function (test$1431, consequent$1432) {
            return {
                type: Syntax$1099.SwitchCase,
                test: test$1431,
                consequent: consequent$1432
            };
        },
        createSwitchStatement: function (discriminant$1433, cases$1434) {
            return {
                type: Syntax$1099.SwitchStatement,
                discriminant: discriminant$1433,
                cases: cases$1434
            };
        },
        createThisExpression: function () {
            return { type: Syntax$1099.ThisExpression };
        },
        createThrowStatement: function (argument$1435) {
            return {
                type: Syntax$1099.ThrowStatement,
                argument: argument$1435
            };
        },
        createTryStatement: function (block$1436, guardedHandlers$1437, handlers$1438, finalizer$1439) {
            return {
                type: Syntax$1099.TryStatement,
                block: block$1436,
                guardedHandlers: guardedHandlers$1437,
                handlers: handlers$1438,
                finalizer: finalizer$1439
            };
        },
        createUnaryExpression: function (operator$1440, argument$1441) {
            if (operator$1440 === '++' || operator$1440 === '--') {
                return {
                    type: Syntax$1099.UpdateExpression,
                    operator: operator$1440,
                    argument: argument$1441,
                    prefix: true
                };
            }
            return {
                type: Syntax$1099.UnaryExpression,
                operator: operator$1440,
                argument: argument$1441
            };
        },
        createVariableDeclaration: function (declarations$1442, kind$1443) {
            return {
                type: Syntax$1099.VariableDeclaration,
                declarations: declarations$1442,
                kind: kind$1443
            };
        },
        createVariableDeclarator: function (id$1444, init$1445) {
            return {
                type: Syntax$1099.VariableDeclarator,
                id: id$1444,
                init: init$1445
            };
        },
        createWhileStatement: function (test$1446, body$1447) {
            return {
                type: Syntax$1099.WhileStatement,
                test: test$1446,
                body: body$1447
            };
        },
        createWithStatement: function (object$1448, body$1449) {
            return {
                type: Syntax$1099.WithStatement,
                object: object$1448,
                body: body$1449
            };
        },
        createTemplateElement: function (value$1450, tail$1451) {
            return {
                type: Syntax$1099.TemplateElement,
                value: value$1450,
                tail: tail$1451
            };
        },
        createTemplateLiteral: function (quasis$1452, expressions$1453) {
            return {
                type: Syntax$1099.TemplateLiteral,
                quasis: quasis$1452,
                expressions: expressions$1453
            };
        },
        createSpreadElement: function (argument$1454) {
            return {
                type: Syntax$1099.SpreadElement,
                argument: argument$1454
            };
        },
        createTaggedTemplateExpression: function (tag$1455, quasi$1456) {
            return {
                type: Syntax$1099.TaggedTemplateExpression,
                tag: tag$1455,
                quasi: quasi$1456
            };
        },
        createArrowFunctionExpression: function (params$1457, defaults$1458, body$1459, rest$1460, expression$1461) {
            return {
                type: Syntax$1099.ArrowFunctionExpression,
                id: null,
                params: params$1457,
                defaults: defaults$1458,
                body: body$1459,
                rest: rest$1460,
                generator: false,
                expression: expression$1461
            };
        },
        createMethodDefinition: function (propertyType$1462, kind$1463, key$1464, value$1465) {
            return {
                type: Syntax$1099.MethodDefinition,
                key: key$1464,
                value: value$1465,
                kind: kind$1463,
                'static': propertyType$1462 === ClassPropertyType$1104.static
            };
        },
        createClassBody: function (body$1466) {
            return {
                type: Syntax$1099.ClassBody,
                body: body$1466
            };
        },
        createClassExpression: function (id$1467, superClass$1468, body$1469) {
            return {
                type: Syntax$1099.ClassExpression,
                id: id$1467,
                superClass: superClass$1468,
                body: body$1469
            };
        },
        createClassDeclaration: function (id$1470, superClass$1471, body$1472) {
            return {
                type: Syntax$1099.ClassDeclaration,
                id: id$1470,
                superClass: superClass$1471,
                body: body$1472
            };
        },
        createExportSpecifier: function (id$1473, name$1474) {
            return {
                type: Syntax$1099.ExportSpecifier,
                id: id$1473,
                name: name$1474
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$1099.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1475, specifiers$1476, source$1477) {
            return {
                type: Syntax$1099.ExportDeclaration,
                declaration: declaration$1475,
                specifiers: specifiers$1476,
                source: source$1477
            };
        },
        createImportSpecifier: function (id$1478, name$1479) {
            return {
                type: Syntax$1099.ImportSpecifier,
                id: id$1478,
                name: name$1479
            };
        },
        createImportDeclaration: function (specifiers$1480, kind$1481, source$1482) {
            return {
                type: Syntax$1099.ImportDeclaration,
                specifiers: specifiers$1480,
                kind: kind$1481,
                source: source$1482
            };
        },
        createYieldExpression: function (argument$1483, delegate$1484) {
            return {
                type: Syntax$1099.YieldExpression,
                argument: argument$1483,
                delegate: delegate$1484
            };
        },
        createModuleDeclaration: function (id$1485, source$1486, body$1487) {
            return {
                type: Syntax$1099.ModuleDeclaration,
                id: id$1485,
                source: source$1486,
                body: body$1487
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$1155() {
        return lookahead$1118.lineNumber !== lineNumber$1108;
    }
    // Throw an exception
    function throwError$1156(token$1488, messageFormat$1489) {
        var error$1490, args$1491 = Array.prototype.slice.call(arguments, 2), msg$1492 = messageFormat$1489.replace(/%(\d)/g, function (whole$1496, index$1497) {
                assert$1122(index$1497 < args$1491.length, 'Message reference must be in range');
                return args$1491[index$1497];
            });
        var startIndex$1493 = streamIndex$1117 > 3 ? streamIndex$1117 - 3 : 0;
        var toks$1494 = '', tailingMsg$1495 = '';
        if (tokenStream$1116) {
            toks$1494 = tokenStream$1116.slice(startIndex$1493, streamIndex$1117 + 3).map(function (stx$1498) {
                return stx$1498.token.value;
            }).join(' ');
            tailingMsg$1495 = '\n[... ' + toks$1494 + ' ...]';
        }
        if (typeof token$1488.lineNumber === 'number') {
            error$1490 = new Error('Line ' + token$1488.lineNumber + ': ' + msg$1492 + tailingMsg$1495);
            error$1490.index = token$1488.range[0];
            error$1490.lineNumber = token$1488.lineNumber;
            error$1490.column = token$1488.range[0] - lineStart$1109 + 1;
        } else {
            error$1490 = new Error('Line ' + lineNumber$1108 + ': ' + msg$1492 + tailingMsg$1495);
            error$1490.index = index$1107;
            error$1490.lineNumber = lineNumber$1108;
            error$1490.column = index$1107 - lineStart$1109 + 1;
        }
        error$1490.description = msg$1492;
        throw error$1490;
    }
    function throwErrorTolerant$1157() {
        try {
            throwError$1156.apply(null, arguments);
        } catch (e$1499) {
            if (extra$1121.errors) {
                extra$1121.errors.push(e$1499);
            } else {
                throw e$1499;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$1158(token$1500) {
        if (token$1500.type === Token$1096.EOF) {
            throwError$1156(token$1500, Messages$1101.UnexpectedEOS);
        }
        if (token$1500.type === Token$1096.NumericLiteral) {
            throwError$1156(token$1500, Messages$1101.UnexpectedNumber);
        }
        if (token$1500.type === Token$1096.StringLiteral) {
            throwError$1156(token$1500, Messages$1101.UnexpectedString);
        }
        if (token$1500.type === Token$1096.Identifier) {
            throwError$1156(token$1500, Messages$1101.UnexpectedIdentifier);
        }
        if (token$1500.type === Token$1096.Keyword) {
            if (isFutureReservedWord$1131(token$1500.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$1106 && isStrictModeReservedWord$1132(token$1500.value)) {
                throwErrorTolerant$1157(token$1500, Messages$1101.StrictReservedWord);
                return;
            }
            throwError$1156(token$1500, Messages$1101.UnexpectedToken, token$1500.value);
        }
        if (token$1500.type === Token$1096.Template) {
            throwError$1156(token$1500, Messages$1101.UnexpectedTemplate, token$1500.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$1156(token$1500, Messages$1101.UnexpectedToken, token$1500.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$1159(value$1501) {
        var token$1502 = lex$1152();
        if (token$1502.type !== Token$1096.Punctuator || token$1502.value !== value$1501) {
            throwUnexpected$1158(token$1502);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$1160(keyword$1503) {
        var token$1504 = lex$1152();
        if (token$1504.type !== Token$1096.Keyword || token$1504.value !== keyword$1503) {
            throwUnexpected$1158(token$1504);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$1161(value$1505) {
        return lookahead$1118.type === Token$1096.Punctuator && lookahead$1118.value === value$1505;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$1162(keyword$1506) {
        return lookahead$1118.type === Token$1096.Keyword && lookahead$1118.value === keyword$1506;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$1163(keyword$1507) {
        return lookahead$1118.type === Token$1096.Identifier && lookahead$1118.value === keyword$1507;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$1164() {
        var op$1508;
        if (lookahead$1118.type !== Token$1096.Punctuator) {
            return false;
        }
        op$1508 = lookahead$1118.value;
        return op$1508 === '=' || op$1508 === '*=' || op$1508 === '/=' || op$1508 === '%=' || op$1508 === '+=' || op$1508 === '-=' || op$1508 === '<<=' || op$1508 === '>>=' || op$1508 === '>>>=' || op$1508 === '&=' || op$1508 === '^=' || op$1508 === '|=';
    }
    function consumeSemicolon$1165() {
        var line$1509, ch$1510;
        ch$1510 = lookahead$1118.value ? String(lookahead$1118.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1510 === 59) {
            lex$1152();
            return;
        }
        if (lookahead$1118.lineNumber !== lineNumber$1108) {
            return;
        }
        if (match$1161(';')) {
            lex$1152();
            return;
        }
        if (lookahead$1118.type !== Token$1096.EOF && !match$1161('}')) {
            throwUnexpected$1158(lookahead$1118);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$1166(expr$1511) {
        return expr$1511.type === Syntax$1099.Identifier || expr$1511.type === Syntax$1099.MemberExpression;
    }
    function isAssignableLeftHandSide$1167(expr$1512) {
        return isLeftHandSide$1166(expr$1512) || expr$1512.type === Syntax$1099.ObjectPattern || expr$1512.type === Syntax$1099.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$1168() {
        var elements$1513 = [], blocks$1514 = [], filter$1515 = null, tmp$1516, possiblecomprehension$1517 = true, body$1518;
        expect$1159('[');
        while (!match$1161(']')) {
            if (lookahead$1118.value === 'for' && lookahead$1118.type === Token$1096.Keyword) {
                if (!possiblecomprehension$1517) {
                    throwError$1156({}, Messages$1101.ComprehensionError);
                }
                matchKeyword$1162('for');
                tmp$1516 = parseForStatement$1216({ ignoreBody: true });
                tmp$1516.of = tmp$1516.type === Syntax$1099.ForOfStatement;
                tmp$1516.type = Syntax$1099.ComprehensionBlock;
                if (tmp$1516.left.kind) {
                    // can't be let or const
                    throwError$1156({}, Messages$1101.ComprehensionError);
                }
                blocks$1514.push(tmp$1516);
            } else if (lookahead$1118.value === 'if' && lookahead$1118.type === Token$1096.Keyword) {
                if (!possiblecomprehension$1517) {
                    throwError$1156({}, Messages$1101.ComprehensionError);
                }
                expectKeyword$1160('if');
                expect$1159('(');
                filter$1515 = parseExpression$1196();
                expect$1159(')');
            } else if (lookahead$1118.value === ',' && lookahead$1118.type === Token$1096.Punctuator) {
                possiblecomprehension$1517 = false;
                // no longer allowed.
                lex$1152();
                elements$1513.push(null);
            } else {
                tmp$1516 = parseSpreadOrAssignmentExpression$1179();
                elements$1513.push(tmp$1516);
                if (tmp$1516 && tmp$1516.type === Syntax$1099.SpreadElement) {
                    if (!match$1161(']')) {
                        throwError$1156({}, Messages$1101.ElementAfterSpreadElement);
                    }
                } else if (!(match$1161(']') || matchKeyword$1162('for') || matchKeyword$1162('if'))) {
                    expect$1159(',');
                    // this lexes.
                    possiblecomprehension$1517 = false;
                }
            }
        }
        expect$1159(']');
        if (filter$1515 && !blocks$1514.length) {
            throwError$1156({}, Messages$1101.ComprehensionRequiresBlock);
        }
        if (blocks$1514.length) {
            if (elements$1513.length !== 1) {
                throwError$1156({}, Messages$1101.ComprehensionError);
            }
            return {
                type: Syntax$1099.ComprehensionExpression,
                filter: filter$1515,
                blocks: blocks$1514,
                body: elements$1513[0]
            };
        }
        return delegate$1115.createArrayExpression(elements$1513);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$1169(options$1519) {
        var previousStrict$1520, previousYieldAllowed$1521, params$1522, defaults$1523, body$1524;
        previousStrict$1520 = strict$1106;
        previousYieldAllowed$1521 = state$1120.yieldAllowed;
        state$1120.yieldAllowed = options$1519.generator;
        params$1522 = options$1519.params || [];
        defaults$1523 = options$1519.defaults || [];
        body$1524 = parseConciseBody$1228();
        if (options$1519.name && strict$1106 && isRestrictedWord$1133(params$1522[0].name)) {
            throwErrorTolerant$1157(options$1519.name, Messages$1101.StrictParamName);
        }
        if (state$1120.yieldAllowed && !state$1120.yieldFound) {
            throwErrorTolerant$1157({}, Messages$1101.NoYieldInGenerator);
        }
        strict$1106 = previousStrict$1520;
        state$1120.yieldAllowed = previousYieldAllowed$1521;
        return delegate$1115.createFunctionExpression(null, params$1522, defaults$1523, body$1524, options$1519.rest || null, options$1519.generator, body$1524.type !== Syntax$1099.BlockStatement);
    }
    function parsePropertyMethodFunction$1170(options$1525) {
        var previousStrict$1526, tmp$1527, method$1528;
        previousStrict$1526 = strict$1106;
        strict$1106 = true;
        tmp$1527 = parseParams$1232();
        if (tmp$1527.stricted) {
            throwErrorTolerant$1157(tmp$1527.stricted, tmp$1527.message);
        }
        method$1528 = parsePropertyFunction$1169({
            params: tmp$1527.params,
            defaults: tmp$1527.defaults,
            rest: tmp$1527.rest,
            generator: options$1525.generator
        });
        strict$1106 = previousStrict$1526;
        return method$1528;
    }
    function parseObjectPropertyKey$1171() {
        var token$1529 = lex$1152();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1529.type === Token$1096.StringLiteral || token$1529.type === Token$1096.NumericLiteral) {
            if (strict$1106 && token$1529.octal) {
                throwErrorTolerant$1157(token$1529, Messages$1101.StrictOctalLiteral);
            }
            return delegate$1115.createLiteral(token$1529);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$1115.createIdentifier(token$1529.value);
    }
    function parseObjectProperty$1172() {
        var token$1530, key$1531, id$1532, value$1533, param$1534;
        token$1530 = lookahead$1118;
        if (token$1530.type === Token$1096.Identifier) {
            id$1532 = parseObjectPropertyKey$1171();
            // Property Assignment: Getter and Setter.
            if (token$1530.value === 'get' && !(match$1161(':') || match$1161('('))) {
                key$1531 = parseObjectPropertyKey$1171();
                expect$1159('(');
                expect$1159(')');
                return delegate$1115.createProperty('get', key$1531, parsePropertyFunction$1169({ generator: false }), false, false);
            }
            if (token$1530.value === 'set' && !(match$1161(':') || match$1161('('))) {
                key$1531 = parseObjectPropertyKey$1171();
                expect$1159('(');
                token$1530 = lookahead$1118;
                param$1534 = [parseVariableIdentifier$1199()];
                expect$1159(')');
                return delegate$1115.createProperty('set', key$1531, parsePropertyFunction$1169({
                    params: param$1534,
                    generator: false,
                    name: token$1530
                }), false, false);
            }
            if (match$1161(':')) {
                lex$1152();
                return delegate$1115.createProperty('init', id$1532, parseAssignmentExpression$1195(), false, false);
            }
            if (match$1161('(')) {
                return delegate$1115.createProperty('init', id$1532, parsePropertyMethodFunction$1170({ generator: false }), true, false);
            }
            return delegate$1115.createProperty('init', id$1532, id$1532, false, true);
        }
        if (token$1530.type === Token$1096.EOF || token$1530.type === Token$1096.Punctuator) {
            if (!match$1161('*')) {
                throwUnexpected$1158(token$1530);
            }
            lex$1152();
            id$1532 = parseObjectPropertyKey$1171();
            if (!match$1161('(')) {
                throwUnexpected$1158(lex$1152());
            }
            return delegate$1115.createProperty('init', id$1532, parsePropertyMethodFunction$1170({ generator: true }), true, false);
        }
        key$1531 = parseObjectPropertyKey$1171();
        if (match$1161(':')) {
            lex$1152();
            return delegate$1115.createProperty('init', key$1531, parseAssignmentExpression$1195(), false, false);
        }
        if (match$1161('(')) {
            return delegate$1115.createProperty('init', key$1531, parsePropertyMethodFunction$1170({ generator: false }), true, false);
        }
        throwUnexpected$1158(lex$1152());
    }
    function parseObjectInitialiser$1173() {
        var properties$1535 = [], property$1536, name$1537, key$1538, kind$1539, map$1540 = {}, toString$1541 = String;
        expect$1159('{');
        while (!match$1161('}')) {
            property$1536 = parseObjectProperty$1172();
            if (property$1536.key.type === Syntax$1099.Identifier) {
                name$1537 = property$1536.key.name;
            } else {
                name$1537 = toString$1541(property$1536.key.value);
            }
            kind$1539 = property$1536.kind === 'init' ? PropertyKind$1100.Data : property$1536.kind === 'get' ? PropertyKind$1100.Get : PropertyKind$1100.Set;
            key$1538 = '$' + name$1537;
            if (Object.prototype.hasOwnProperty.call(map$1540, key$1538)) {
                if (map$1540[key$1538] === PropertyKind$1100.Data) {
                    if (strict$1106 && kind$1539 === PropertyKind$1100.Data) {
                        throwErrorTolerant$1157({}, Messages$1101.StrictDuplicateProperty);
                    } else if (kind$1539 !== PropertyKind$1100.Data) {
                        throwErrorTolerant$1157({}, Messages$1101.AccessorDataProperty);
                    }
                } else {
                    if (kind$1539 === PropertyKind$1100.Data) {
                        throwErrorTolerant$1157({}, Messages$1101.AccessorDataProperty);
                    } else if (map$1540[key$1538] & kind$1539) {
                        throwErrorTolerant$1157({}, Messages$1101.AccessorGetSet);
                    }
                }
                map$1540[key$1538] |= kind$1539;
            } else {
                map$1540[key$1538] = kind$1539;
            }
            properties$1535.push(property$1536);
            if (!match$1161('}')) {
                expect$1159(',');
            }
        }
        expect$1159('}');
        return delegate$1115.createObjectExpression(properties$1535);
    }
    function parseTemplateElement$1174(option$1542) {
        var token$1543 = scanTemplateElement$1147(option$1542);
        if (strict$1106 && token$1543.octal) {
            throwError$1156(token$1543, Messages$1101.StrictOctalLiteral);
        }
        return delegate$1115.createTemplateElement({
            raw: token$1543.value.raw,
            cooked: token$1543.value.cooked
        }, token$1543.tail);
    }
    function parseTemplateLiteral$1175() {
        var quasi$1544, quasis$1545, expressions$1546;
        quasi$1544 = parseTemplateElement$1174({ head: true });
        quasis$1545 = [quasi$1544];
        expressions$1546 = [];
        while (!quasi$1544.tail) {
            expressions$1546.push(parseExpression$1196());
            quasi$1544 = parseTemplateElement$1174({ head: false });
            quasis$1545.push(quasi$1544);
        }
        return delegate$1115.createTemplateLiteral(quasis$1545, expressions$1546);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$1176() {
        var expr$1547;
        expect$1159('(');
        ++state$1120.parenthesizedCount;
        expr$1547 = parseExpression$1196();
        expect$1159(')');
        return expr$1547;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$1177() {
        var type$1548, token$1549, resolvedIdent$1550;
        token$1549 = lookahead$1118;
        type$1548 = lookahead$1118.type;
        if (type$1548 === Token$1096.Identifier) {
            resolvedIdent$1550 = expander$1095.resolve(tokenStream$1116[lookaheadIndex$1119]);
            lex$1152();
            return delegate$1115.createIdentifier(resolvedIdent$1550);
        }
        if (type$1548 === Token$1096.StringLiteral || type$1548 === Token$1096.NumericLiteral) {
            if (strict$1106 && lookahead$1118.octal) {
                throwErrorTolerant$1157(lookahead$1118, Messages$1101.StrictOctalLiteral);
            }
            return delegate$1115.createLiteral(lex$1152());
        }
        if (type$1548 === Token$1096.Keyword) {
            if (matchKeyword$1162('this')) {
                lex$1152();
                return delegate$1115.createThisExpression();
            }
            if (matchKeyword$1162('function')) {
                return parseFunctionExpression$1234();
            }
            if (matchKeyword$1162('class')) {
                return parseClassExpression$1239();
            }
            if (matchKeyword$1162('super')) {
                lex$1152();
                return delegate$1115.createIdentifier('super');
            }
        }
        if (type$1548 === Token$1096.BooleanLiteral) {
            token$1549 = lex$1152();
            token$1549.value = token$1549.value === 'true';
            return delegate$1115.createLiteral(token$1549);
        }
        if (type$1548 === Token$1096.NullLiteral) {
            token$1549 = lex$1152();
            token$1549.value = null;
            return delegate$1115.createLiteral(token$1549);
        }
        if (match$1161('[')) {
            return parseArrayInitialiser$1168();
        }
        if (match$1161('{')) {
            return parseObjectInitialiser$1173();
        }
        if (match$1161('(')) {
            return parseGroupExpression$1176();
        }
        if (lookahead$1118.type === Token$1096.RegularExpression) {
            return delegate$1115.createLiteral(lex$1152());
        }
        if (type$1548 === Token$1096.Template) {
            return parseTemplateLiteral$1175();
        }
        return throwUnexpected$1158(lex$1152());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$1178() {
        var args$1551 = [], arg$1552;
        expect$1159('(');
        if (!match$1161(')')) {
            while (streamIndex$1117 < length$1114) {
                arg$1552 = parseSpreadOrAssignmentExpression$1179();
                args$1551.push(arg$1552);
                if (match$1161(')')) {
                    break;
                } else if (arg$1552.type === Syntax$1099.SpreadElement) {
                    throwError$1156({}, Messages$1101.ElementAfterSpreadElement);
                }
                expect$1159(',');
            }
        }
        expect$1159(')');
        return args$1551;
    }
    function parseSpreadOrAssignmentExpression$1179() {
        if (match$1161('...')) {
            lex$1152();
            return delegate$1115.createSpreadElement(parseAssignmentExpression$1195());
        }
        return parseAssignmentExpression$1195();
    }
    function parseNonComputedProperty$1180() {
        var token$1553 = lex$1152();
        if (!isIdentifierName$1149(token$1553)) {
            throwUnexpected$1158(token$1553);
        }
        return delegate$1115.createIdentifier(token$1553.value);
    }
    function parseNonComputedMember$1181() {
        expect$1159('.');
        return parseNonComputedProperty$1180();
    }
    function parseComputedMember$1182() {
        var expr$1554;
        expect$1159('[');
        expr$1554 = parseExpression$1196();
        expect$1159(']');
        return expr$1554;
    }
    function parseNewExpression$1183() {
        var callee$1555, args$1556;
        expectKeyword$1160('new');
        callee$1555 = parseLeftHandSideExpression$1185();
        args$1556 = match$1161('(') ? parseArguments$1178() : [];
        return delegate$1115.createNewExpression(callee$1555, args$1556);
    }
    function parseLeftHandSideExpressionAllowCall$1184() {
        var expr$1557, args$1558, property$1559;
        expr$1557 = matchKeyword$1162('new') ? parseNewExpression$1183() : parsePrimaryExpression$1177();
        while (match$1161('.') || match$1161('[') || match$1161('(') || lookahead$1118.type === Token$1096.Template) {
            if (match$1161('(')) {
                args$1558 = parseArguments$1178();
                expr$1557 = delegate$1115.createCallExpression(expr$1557, args$1558);
            } else if (match$1161('[')) {
                expr$1557 = delegate$1115.createMemberExpression('[', expr$1557, parseComputedMember$1182());
            } else if (match$1161('.')) {
                expr$1557 = delegate$1115.createMemberExpression('.', expr$1557, parseNonComputedMember$1181());
            } else {
                expr$1557 = delegate$1115.createTaggedTemplateExpression(expr$1557, parseTemplateLiteral$1175());
            }
        }
        return expr$1557;
    }
    function parseLeftHandSideExpression$1185() {
        var expr$1560, property$1561;
        expr$1560 = matchKeyword$1162('new') ? parseNewExpression$1183() : parsePrimaryExpression$1177();
        while (match$1161('.') || match$1161('[') || lookahead$1118.type === Token$1096.Template) {
            if (match$1161('[')) {
                expr$1560 = delegate$1115.createMemberExpression('[', expr$1560, parseComputedMember$1182());
            } else if (match$1161('.')) {
                expr$1560 = delegate$1115.createMemberExpression('.', expr$1560, parseNonComputedMember$1181());
            } else {
                expr$1560 = delegate$1115.createTaggedTemplateExpression(expr$1560, parseTemplateLiteral$1175());
            }
        }
        return expr$1560;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$1186() {
        var expr$1562 = parseLeftHandSideExpressionAllowCall$1184(), token$1563 = lookahead$1118;
        if (lookahead$1118.type !== Token$1096.Punctuator) {
            return expr$1562;
        }
        if ((match$1161('++') || match$1161('--')) && !peekLineTerminator$1155()) {
            // 11.3.1, 11.3.2
            if (strict$1106 && expr$1562.type === Syntax$1099.Identifier && isRestrictedWord$1133(expr$1562.name)) {
                throwErrorTolerant$1157({}, Messages$1101.StrictLHSPostfix);
            }
            if (!isLeftHandSide$1166(expr$1562)) {
                throwError$1156({}, Messages$1101.InvalidLHSInAssignment);
            }
            token$1563 = lex$1152();
            expr$1562 = delegate$1115.createPostfixExpression(token$1563.value, expr$1562);
        }
        return expr$1562;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$1187() {
        var token$1564, expr$1565;
        if (lookahead$1118.type !== Token$1096.Punctuator && lookahead$1118.type !== Token$1096.Keyword) {
            return parsePostfixExpression$1186();
        }
        if (match$1161('++') || match$1161('--')) {
            token$1564 = lex$1152();
            expr$1565 = parseUnaryExpression$1187();
            // 11.4.4, 11.4.5
            if (strict$1106 && expr$1565.type === Syntax$1099.Identifier && isRestrictedWord$1133(expr$1565.name)) {
                throwErrorTolerant$1157({}, Messages$1101.StrictLHSPrefix);
            }
            if (!isLeftHandSide$1166(expr$1565)) {
                throwError$1156({}, Messages$1101.InvalidLHSInAssignment);
            }
            return delegate$1115.createUnaryExpression(token$1564.value, expr$1565);
        }
        if (match$1161('+') || match$1161('-') || match$1161('~') || match$1161('!')) {
            token$1564 = lex$1152();
            expr$1565 = parseUnaryExpression$1187();
            return delegate$1115.createUnaryExpression(token$1564.value, expr$1565);
        }
        if (matchKeyword$1162('delete') || matchKeyword$1162('void') || matchKeyword$1162('typeof')) {
            token$1564 = lex$1152();
            expr$1565 = parseUnaryExpression$1187();
            expr$1565 = delegate$1115.createUnaryExpression(token$1564.value, expr$1565);
            if (strict$1106 && expr$1565.operator === 'delete' && expr$1565.argument.type === Syntax$1099.Identifier) {
                throwErrorTolerant$1157({}, Messages$1101.StrictDelete);
            }
            return expr$1565;
        }
        return parsePostfixExpression$1186();
    }
    function binaryPrecedence$1188(token$1566, allowIn$1567) {
        var prec$1568 = 0;
        if (token$1566.type !== Token$1096.Punctuator && token$1566.type !== Token$1096.Keyword) {
            return 0;
        }
        switch (token$1566.value) {
        case '||':
            prec$1568 = 1;
            break;
        case '&&':
            prec$1568 = 2;
            break;
        case '|':
            prec$1568 = 3;
            break;
        case '^':
            prec$1568 = 4;
            break;
        case '&':
            prec$1568 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1568 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1568 = 7;
            break;
        case 'in':
            prec$1568 = allowIn$1567 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1568 = 8;
            break;
        case '+':
        case '-':
            prec$1568 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1568 = 11;
            break;
        default:
            break;
        }
        return prec$1568;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$1189() {
        var expr$1569, token$1570, prec$1571, previousAllowIn$1572, stack$1573, right$1574, operator$1575, left$1576, i$1577;
        previousAllowIn$1572 = state$1120.allowIn;
        state$1120.allowIn = true;
        expr$1569 = parseUnaryExpression$1187();
        token$1570 = lookahead$1118;
        prec$1571 = binaryPrecedence$1188(token$1570, previousAllowIn$1572);
        if (prec$1571 === 0) {
            return expr$1569;
        }
        token$1570.prec = prec$1571;
        lex$1152();
        stack$1573 = [
            expr$1569,
            token$1570,
            parseUnaryExpression$1187()
        ];
        while ((prec$1571 = binaryPrecedence$1188(lookahead$1118, previousAllowIn$1572)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1573.length > 2 && prec$1571 <= stack$1573[stack$1573.length - 2].prec) {
                right$1574 = stack$1573.pop();
                operator$1575 = stack$1573.pop().value;
                left$1576 = stack$1573.pop();
                stack$1573.push(delegate$1115.createBinaryExpression(operator$1575, left$1576, right$1574));
            }
            // Shift.
            token$1570 = lex$1152();
            token$1570.prec = prec$1571;
            stack$1573.push(token$1570);
            stack$1573.push(parseUnaryExpression$1187());
        }
        state$1120.allowIn = previousAllowIn$1572;
        // Final reduce to clean-up the stack.
        i$1577 = stack$1573.length - 1;
        expr$1569 = stack$1573[i$1577];
        while (i$1577 > 1) {
            expr$1569 = delegate$1115.createBinaryExpression(stack$1573[i$1577 - 1].value, stack$1573[i$1577 - 2], expr$1569);
            i$1577 -= 2;
        }
        return expr$1569;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$1190() {
        var expr$1578, previousAllowIn$1579, consequent$1580, alternate$1581;
        expr$1578 = parseBinaryExpression$1189();
        if (match$1161('?')) {
            lex$1152();
            previousAllowIn$1579 = state$1120.allowIn;
            state$1120.allowIn = true;
            consequent$1580 = parseAssignmentExpression$1195();
            state$1120.allowIn = previousAllowIn$1579;
            expect$1159(':');
            alternate$1581 = parseAssignmentExpression$1195();
            expr$1578 = delegate$1115.createConditionalExpression(expr$1578, consequent$1580, alternate$1581);
        }
        return expr$1578;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$1191(expr$1582) {
        var i$1583, len$1584, property$1585, element$1586;
        if (expr$1582.type === Syntax$1099.ObjectExpression) {
            expr$1582.type = Syntax$1099.ObjectPattern;
            for (i$1583 = 0, len$1584 = expr$1582.properties.length; i$1583 < len$1584; i$1583 += 1) {
                property$1585 = expr$1582.properties[i$1583];
                if (property$1585.kind !== 'init') {
                    throwError$1156({}, Messages$1101.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$1191(property$1585.value);
            }
        } else if (expr$1582.type === Syntax$1099.ArrayExpression) {
            expr$1582.type = Syntax$1099.ArrayPattern;
            for (i$1583 = 0, len$1584 = expr$1582.elements.length; i$1583 < len$1584; i$1583 += 1) {
                element$1586 = expr$1582.elements[i$1583];
                if (element$1586) {
                    reinterpretAsAssignmentBindingPattern$1191(element$1586);
                }
            }
        } else if (expr$1582.type === Syntax$1099.Identifier) {
            if (isRestrictedWord$1133(expr$1582.name)) {
                throwError$1156({}, Messages$1101.InvalidLHSInAssignment);
            }
        } else if (expr$1582.type === Syntax$1099.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$1191(expr$1582.argument);
            if (expr$1582.argument.type === Syntax$1099.ObjectPattern) {
                throwError$1156({}, Messages$1101.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1582.type !== Syntax$1099.MemberExpression && expr$1582.type !== Syntax$1099.CallExpression && expr$1582.type !== Syntax$1099.NewExpression) {
                throwError$1156({}, Messages$1101.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$1192(options$1587, expr$1588) {
        var i$1589, len$1590, property$1591, element$1592;
        if (expr$1588.type === Syntax$1099.ObjectExpression) {
            expr$1588.type = Syntax$1099.ObjectPattern;
            for (i$1589 = 0, len$1590 = expr$1588.properties.length; i$1589 < len$1590; i$1589 += 1) {
                property$1591 = expr$1588.properties[i$1589];
                if (property$1591.kind !== 'init') {
                    throwError$1156({}, Messages$1101.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$1192(options$1587, property$1591.value);
            }
        } else if (expr$1588.type === Syntax$1099.ArrayExpression) {
            expr$1588.type = Syntax$1099.ArrayPattern;
            for (i$1589 = 0, len$1590 = expr$1588.elements.length; i$1589 < len$1590; i$1589 += 1) {
                element$1592 = expr$1588.elements[i$1589];
                if (element$1592) {
                    reinterpretAsDestructuredParameter$1192(options$1587, element$1592);
                }
            }
        } else if (expr$1588.type === Syntax$1099.Identifier) {
            validateParam$1230(options$1587, expr$1588, expr$1588.name);
        } else {
            if (expr$1588.type !== Syntax$1099.MemberExpression) {
                throwError$1156({}, Messages$1101.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$1193(expressions$1593) {
        var i$1594, len$1595, param$1596, params$1597, defaults$1598, defaultCount$1599, options$1600, rest$1601;
        params$1597 = [];
        defaults$1598 = [];
        defaultCount$1599 = 0;
        rest$1601 = null;
        options$1600 = { paramSet: {} };
        for (i$1594 = 0, len$1595 = expressions$1593.length; i$1594 < len$1595; i$1594 += 1) {
            param$1596 = expressions$1593[i$1594];
            if (param$1596.type === Syntax$1099.Identifier) {
                params$1597.push(param$1596);
                defaults$1598.push(null);
                validateParam$1230(options$1600, param$1596, param$1596.name);
            } else if (param$1596.type === Syntax$1099.ObjectExpression || param$1596.type === Syntax$1099.ArrayExpression) {
                reinterpretAsDestructuredParameter$1192(options$1600, param$1596);
                params$1597.push(param$1596);
                defaults$1598.push(null);
            } else if (param$1596.type === Syntax$1099.SpreadElement) {
                assert$1122(i$1594 === len$1595 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$1192(options$1600, param$1596.argument);
                rest$1601 = param$1596.argument;
            } else if (param$1596.type === Syntax$1099.AssignmentExpression) {
                params$1597.push(param$1596.left);
                defaults$1598.push(param$1596.right);
                ++defaultCount$1599;
                validateParam$1230(options$1600, param$1596.left, param$1596.left.name);
            } else {
                return null;
            }
        }
        if (options$1600.message === Messages$1101.StrictParamDupe) {
            throwError$1156(strict$1106 ? options$1600.stricted : options$1600.firstRestricted, options$1600.message);
        }
        if (defaultCount$1599 === 0) {
            defaults$1598 = [];
        }
        return {
            params: params$1597,
            defaults: defaults$1598,
            rest: rest$1601,
            stricted: options$1600.stricted,
            firstRestricted: options$1600.firstRestricted,
            message: options$1600.message
        };
    }
    function parseArrowFunctionExpression$1194(options$1602) {
        var previousStrict$1603, previousYieldAllowed$1604, body$1605;
        expect$1159('=>');
        previousStrict$1603 = strict$1106;
        previousYieldAllowed$1604 = state$1120.yieldAllowed;
        state$1120.yieldAllowed = false;
        body$1605 = parseConciseBody$1228();
        if (strict$1106 && options$1602.firstRestricted) {
            throwError$1156(options$1602.firstRestricted, options$1602.message);
        }
        if (strict$1106 && options$1602.stricted) {
            throwErrorTolerant$1157(options$1602.stricted, options$1602.message);
        }
        strict$1106 = previousStrict$1603;
        state$1120.yieldAllowed = previousYieldAllowed$1604;
        return delegate$1115.createArrowFunctionExpression(options$1602.params, options$1602.defaults, body$1605, options$1602.rest, body$1605.type !== Syntax$1099.BlockStatement);
    }
    function parseAssignmentExpression$1195() {
        var expr$1606, token$1607, params$1608, oldParenthesizedCount$1609;
        if (matchKeyword$1162('yield')) {
            return parseYieldExpression$1235();
        }
        oldParenthesizedCount$1609 = state$1120.parenthesizedCount;
        if (match$1161('(')) {
            token$1607 = lookahead2$1154();
            if (token$1607.type === Token$1096.Punctuator && token$1607.value === ')' || token$1607.value === '...') {
                params$1608 = parseParams$1232();
                if (!match$1161('=>')) {
                    throwUnexpected$1158(lex$1152());
                }
                return parseArrowFunctionExpression$1194(params$1608);
            }
        }
        token$1607 = lookahead$1118;
        expr$1606 = parseConditionalExpression$1190();
        if (match$1161('=>') && (state$1120.parenthesizedCount === oldParenthesizedCount$1609 || state$1120.parenthesizedCount === oldParenthesizedCount$1609 + 1)) {
            if (expr$1606.type === Syntax$1099.Identifier) {
                params$1608 = reinterpretAsCoverFormalsList$1193([expr$1606]);
            } else if (expr$1606.type === Syntax$1099.SequenceExpression) {
                params$1608 = reinterpretAsCoverFormalsList$1193(expr$1606.expressions);
            }
            if (params$1608) {
                return parseArrowFunctionExpression$1194(params$1608);
            }
        }
        if (matchAssign$1164()) {
            // 11.13.1
            if (strict$1106 && expr$1606.type === Syntax$1099.Identifier && isRestrictedWord$1133(expr$1606.name)) {
                throwErrorTolerant$1157(token$1607, Messages$1101.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$1161('=') && (expr$1606.type === Syntax$1099.ObjectExpression || expr$1606.type === Syntax$1099.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$1191(expr$1606);
            } else if (!isLeftHandSide$1166(expr$1606)) {
                throwError$1156({}, Messages$1101.InvalidLHSInAssignment);
            }
            expr$1606 = delegate$1115.createAssignmentExpression(lex$1152().value, expr$1606, parseAssignmentExpression$1195());
        }
        return expr$1606;
    }
    // 11.14 Comma Operator
    function parseExpression$1196() {
        var expr$1610, expressions$1611, sequence$1612, coverFormalsList$1613, spreadFound$1614, oldParenthesizedCount$1615;
        oldParenthesizedCount$1615 = state$1120.parenthesizedCount;
        expr$1610 = parseAssignmentExpression$1195();
        expressions$1611 = [expr$1610];
        if (match$1161(',')) {
            while (streamIndex$1117 < length$1114) {
                if (!match$1161(',')) {
                    break;
                }
                lex$1152();
                expr$1610 = parseSpreadOrAssignmentExpression$1179();
                expressions$1611.push(expr$1610);
                if (expr$1610.type === Syntax$1099.SpreadElement) {
                    spreadFound$1614 = true;
                    if (!match$1161(')')) {
                        throwError$1156({}, Messages$1101.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1612 = delegate$1115.createSequenceExpression(expressions$1611);
        }
        if (match$1161('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$1120.parenthesizedCount === oldParenthesizedCount$1615 || state$1120.parenthesizedCount === oldParenthesizedCount$1615 + 1) {
                expr$1610 = expr$1610.type === Syntax$1099.SequenceExpression ? expr$1610.expressions : expressions$1611;
                coverFormalsList$1613 = reinterpretAsCoverFormalsList$1193(expr$1610);
                if (coverFormalsList$1613) {
                    return parseArrowFunctionExpression$1194(coverFormalsList$1613);
                }
            }
            throwUnexpected$1158(lex$1152());
        }
        if (spreadFound$1614 && lookahead2$1154().value !== '=>') {
            throwError$1156({}, Messages$1101.IllegalSpread);
        }
        return sequence$1612 || expr$1610;
    }
    // 12.1 Block
    function parseStatementList$1197() {
        var list$1616 = [], statement$1617;
        while (streamIndex$1117 < length$1114) {
            if (match$1161('}')) {
                break;
            }
            statement$1617 = parseSourceElement$1242();
            if (typeof statement$1617 === 'undefined') {
                break;
            }
            list$1616.push(statement$1617);
        }
        return list$1616;
    }
    function parseBlock$1198() {
        var block$1618;
        expect$1159('{');
        block$1618 = parseStatementList$1197();
        expect$1159('}');
        return delegate$1115.createBlockStatement(block$1618);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$1199() {
        var token$1619 = lookahead$1118, resolvedIdent$1620;
        if (token$1619.type !== Token$1096.Identifier) {
            throwUnexpected$1158(token$1619);
        }
        resolvedIdent$1620 = expander$1095.resolve(tokenStream$1116[lookaheadIndex$1119]);
        lex$1152();
        return delegate$1115.createIdentifier(resolvedIdent$1620);
    }
    function parseVariableDeclaration$1200(kind$1621) {
        var id$1622, init$1623 = null;
        if (match$1161('{')) {
            id$1622 = parseObjectInitialiser$1173();
            reinterpretAsAssignmentBindingPattern$1191(id$1622);
        } else if (match$1161('[')) {
            id$1622 = parseArrayInitialiser$1168();
            reinterpretAsAssignmentBindingPattern$1191(id$1622);
        } else {
            id$1622 = state$1120.allowKeyword ? parseNonComputedProperty$1180() : parseVariableIdentifier$1199();
            // 12.2.1
            if (strict$1106 && isRestrictedWord$1133(id$1622.name)) {
                throwErrorTolerant$1157({}, Messages$1101.StrictVarName);
            }
        }
        if (kind$1621 === 'const') {
            if (!match$1161('=')) {
                throwError$1156({}, Messages$1101.NoUnintializedConst);
            }
            expect$1159('=');
            init$1623 = parseAssignmentExpression$1195();
        } else if (match$1161('=')) {
            lex$1152();
            init$1623 = parseAssignmentExpression$1195();
        }
        return delegate$1115.createVariableDeclarator(id$1622, init$1623);
    }
    function parseVariableDeclarationList$1201(kind$1624) {
        var list$1625 = [];
        do {
            list$1625.push(parseVariableDeclaration$1200(kind$1624));
            if (!match$1161(',')) {
                break;
            }
            lex$1152();
        } while (streamIndex$1117 < length$1114);
        return list$1625;
    }
    function parseVariableStatement$1202() {
        var declarations$1626;
        expectKeyword$1160('var');
        declarations$1626 = parseVariableDeclarationList$1201();
        consumeSemicolon$1165();
        return delegate$1115.createVariableDeclaration(declarations$1626, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$1203(kind$1627) {
        var declarations$1628;
        expectKeyword$1160(kind$1627);
        declarations$1628 = parseVariableDeclarationList$1201(kind$1627);
        consumeSemicolon$1165();
        return delegate$1115.createVariableDeclaration(declarations$1628, kind$1627);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$1204() {
        var id$1629, src$1630, body$1631;
        lex$1152();
        // 'module'
        if (peekLineTerminator$1155()) {
            throwError$1156({}, Messages$1101.NewlineAfterModule);
        }
        switch (lookahead$1118.type) {
        case Token$1096.StringLiteral:
            id$1629 = parsePrimaryExpression$1177();
            body$1631 = parseModuleBlock$1247();
            src$1630 = null;
            break;
        case Token$1096.Identifier:
            id$1629 = parseVariableIdentifier$1199();
            body$1631 = null;
            if (!matchContextualKeyword$1163('from')) {
                throwUnexpected$1158(lex$1152());
            }
            lex$1152();
            src$1630 = parsePrimaryExpression$1177();
            if (src$1630.type !== Syntax$1099.Literal) {
                throwError$1156({}, Messages$1101.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$1165();
        return delegate$1115.createModuleDeclaration(id$1629, src$1630, body$1631);
    }
    function parseExportBatchSpecifier$1205() {
        expect$1159('*');
        return delegate$1115.createExportBatchSpecifier();
    }
    function parseExportSpecifier$1206() {
        var id$1632, name$1633 = null;
        id$1632 = parseVariableIdentifier$1199();
        if (matchContextualKeyword$1163('as')) {
            lex$1152();
            name$1633 = parseNonComputedProperty$1180();
        }
        return delegate$1115.createExportSpecifier(id$1632, name$1633);
    }
    function parseExportDeclaration$1207() {
        var previousAllowKeyword$1634, decl$1635, def$1636, src$1637, specifiers$1638;
        expectKeyword$1160('export');
        if (lookahead$1118.type === Token$1096.Keyword) {
            switch (lookahead$1118.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$1115.createExportDeclaration(parseSourceElement$1242(), null, null);
            }
        }
        if (isIdentifierName$1149(lookahead$1118)) {
            previousAllowKeyword$1634 = state$1120.allowKeyword;
            state$1120.allowKeyword = true;
            decl$1635 = parseVariableDeclarationList$1201('let');
            state$1120.allowKeyword = previousAllowKeyword$1634;
            return delegate$1115.createExportDeclaration(decl$1635, null, null);
        }
        specifiers$1638 = [];
        src$1637 = null;
        if (match$1161('*')) {
            specifiers$1638.push(parseExportBatchSpecifier$1205());
        } else {
            expect$1159('{');
            do {
                specifiers$1638.push(parseExportSpecifier$1206());
            } while (match$1161(',') && lex$1152());
            expect$1159('}');
        }
        if (matchContextualKeyword$1163('from')) {
            lex$1152();
            src$1637 = parsePrimaryExpression$1177();
            if (src$1637.type !== Syntax$1099.Literal) {
                throwError$1156({}, Messages$1101.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$1165();
        return delegate$1115.createExportDeclaration(null, specifiers$1638, src$1637);
    }
    function parseImportDeclaration$1208() {
        var specifiers$1639, kind$1640, src$1641;
        expectKeyword$1160('import');
        specifiers$1639 = [];
        if (isIdentifierName$1149(lookahead$1118)) {
            kind$1640 = 'default';
            specifiers$1639.push(parseImportSpecifier$1209());
            if (!matchContextualKeyword$1163('from')) {
                throwError$1156({}, Messages$1101.NoFromAfterImport);
            }
            lex$1152();
        } else if (match$1161('{')) {
            kind$1640 = 'named';
            lex$1152();
            do {
                specifiers$1639.push(parseImportSpecifier$1209());
            } while (match$1161(',') && lex$1152());
            expect$1159('}');
            if (!matchContextualKeyword$1163('from')) {
                throwError$1156({}, Messages$1101.NoFromAfterImport);
            }
            lex$1152();
        }
        src$1641 = parsePrimaryExpression$1177();
        if (src$1641.type !== Syntax$1099.Literal) {
            throwError$1156({}, Messages$1101.InvalidModuleSpecifier);
        }
        consumeSemicolon$1165();
        return delegate$1115.createImportDeclaration(specifiers$1639, kind$1640, src$1641);
    }
    function parseImportSpecifier$1209() {
        var id$1642, name$1643 = null;
        id$1642 = parseNonComputedProperty$1180();
        if (matchContextualKeyword$1163('as')) {
            lex$1152();
            name$1643 = parseVariableIdentifier$1199();
        }
        return delegate$1115.createImportSpecifier(id$1642, name$1643);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$1210() {
        expect$1159(';');
        return delegate$1115.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$1211() {
        var expr$1644 = parseExpression$1196();
        consumeSemicolon$1165();
        return delegate$1115.createExpressionStatement(expr$1644);
    }
    // 12.5 If statement
    function parseIfStatement$1212() {
        var test$1645, consequent$1646, alternate$1647;
        expectKeyword$1160('if');
        expect$1159('(');
        test$1645 = parseExpression$1196();
        expect$1159(')');
        consequent$1646 = parseStatement$1227();
        if (matchKeyword$1162('else')) {
            lex$1152();
            alternate$1647 = parseStatement$1227();
        } else {
            alternate$1647 = null;
        }
        return delegate$1115.createIfStatement(test$1645, consequent$1646, alternate$1647);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$1213() {
        var body$1648, test$1649, oldInIteration$1650;
        expectKeyword$1160('do');
        oldInIteration$1650 = state$1120.inIteration;
        state$1120.inIteration = true;
        body$1648 = parseStatement$1227();
        state$1120.inIteration = oldInIteration$1650;
        expectKeyword$1160('while');
        expect$1159('(');
        test$1649 = parseExpression$1196();
        expect$1159(')');
        if (match$1161(';')) {
            lex$1152();
        }
        return delegate$1115.createDoWhileStatement(body$1648, test$1649);
    }
    function parseWhileStatement$1214() {
        var test$1651, body$1652, oldInIteration$1653;
        expectKeyword$1160('while');
        expect$1159('(');
        test$1651 = parseExpression$1196();
        expect$1159(')');
        oldInIteration$1653 = state$1120.inIteration;
        state$1120.inIteration = true;
        body$1652 = parseStatement$1227();
        state$1120.inIteration = oldInIteration$1653;
        return delegate$1115.createWhileStatement(test$1651, body$1652);
    }
    function parseForVariableDeclaration$1215() {
        var token$1654 = lex$1152(), declarations$1655 = parseVariableDeclarationList$1201();
        return delegate$1115.createVariableDeclaration(declarations$1655, token$1654.value);
    }
    function parseForStatement$1216(opts$1656) {
        var init$1657, test$1658, update$1659, left$1660, right$1661, body$1662, operator$1663, oldInIteration$1664;
        init$1657 = test$1658 = update$1659 = null;
        expectKeyword$1160('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$1163('each')) {
            throwError$1156({}, Messages$1101.EachNotAllowed);
        }
        expect$1159('(');
        if (match$1161(';')) {
            lex$1152();
        } else {
            if (matchKeyword$1162('var') || matchKeyword$1162('let') || matchKeyword$1162('const')) {
                state$1120.allowIn = false;
                init$1657 = parseForVariableDeclaration$1215();
                state$1120.allowIn = true;
                if (init$1657.declarations.length === 1) {
                    if (matchKeyword$1162('in') || matchContextualKeyword$1163('of')) {
                        operator$1663 = lookahead$1118;
                        if (!((operator$1663.value === 'in' || init$1657.kind !== 'var') && init$1657.declarations[0].init)) {
                            lex$1152();
                            left$1660 = init$1657;
                            right$1661 = parseExpression$1196();
                            init$1657 = null;
                        }
                    }
                }
            } else {
                state$1120.allowIn = false;
                init$1657 = parseExpression$1196();
                state$1120.allowIn = true;
                if (matchContextualKeyword$1163('of')) {
                    operator$1663 = lex$1152();
                    left$1660 = init$1657;
                    right$1661 = parseExpression$1196();
                    init$1657 = null;
                } else if (matchKeyword$1162('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$1167(init$1657)) {
                        throwError$1156({}, Messages$1101.InvalidLHSInForIn);
                    }
                    operator$1663 = lex$1152();
                    left$1660 = init$1657;
                    right$1661 = parseExpression$1196();
                    init$1657 = null;
                }
            }
            if (typeof left$1660 === 'undefined') {
                expect$1159(';');
            }
        }
        if (typeof left$1660 === 'undefined') {
            if (!match$1161(';')) {
                test$1658 = parseExpression$1196();
            }
            expect$1159(';');
            if (!match$1161(')')) {
                update$1659 = parseExpression$1196();
            }
        }
        expect$1159(')');
        oldInIteration$1664 = state$1120.inIteration;
        state$1120.inIteration = true;
        if (!(opts$1656 !== undefined && opts$1656.ignoreBody)) {
            body$1662 = parseStatement$1227();
        }
        state$1120.inIteration = oldInIteration$1664;
        if (typeof left$1660 === 'undefined') {
            return delegate$1115.createForStatement(init$1657, test$1658, update$1659, body$1662);
        }
        if (operator$1663.value === 'in') {
            return delegate$1115.createForInStatement(left$1660, right$1661, body$1662);
        }
        return delegate$1115.createForOfStatement(left$1660, right$1661, body$1662);
    }
    // 12.7 The continue statement
    function parseContinueStatement$1217() {
        var label$1665 = null, key$1666;
        expectKeyword$1160('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$1118.value.charCodeAt(0) === 59) {
            lex$1152();
            if (!state$1120.inIteration) {
                throwError$1156({}, Messages$1101.IllegalContinue);
            }
            return delegate$1115.createContinueStatement(null);
        }
        if (peekLineTerminator$1155()) {
            if (!state$1120.inIteration) {
                throwError$1156({}, Messages$1101.IllegalContinue);
            }
            return delegate$1115.createContinueStatement(null);
        }
        if (lookahead$1118.type === Token$1096.Identifier) {
            label$1665 = parseVariableIdentifier$1199();
            key$1666 = '$' + label$1665.name;
            if (!Object.prototype.hasOwnProperty.call(state$1120.labelSet, key$1666)) {
                throwError$1156({}, Messages$1101.UnknownLabel, label$1665.name);
            }
        }
        consumeSemicolon$1165();
        if (label$1665 === null && !state$1120.inIteration) {
            throwError$1156({}, Messages$1101.IllegalContinue);
        }
        return delegate$1115.createContinueStatement(label$1665);
    }
    // 12.8 The break statement
    function parseBreakStatement$1218() {
        var label$1667 = null, key$1668;
        expectKeyword$1160('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$1118.value.charCodeAt(0) === 59) {
            lex$1152();
            if (!(state$1120.inIteration || state$1120.inSwitch)) {
                throwError$1156({}, Messages$1101.IllegalBreak);
            }
            return delegate$1115.createBreakStatement(null);
        }
        if (peekLineTerminator$1155()) {
            if (!(state$1120.inIteration || state$1120.inSwitch)) {
                throwError$1156({}, Messages$1101.IllegalBreak);
            }
            return delegate$1115.createBreakStatement(null);
        }
        if (lookahead$1118.type === Token$1096.Identifier) {
            label$1667 = parseVariableIdentifier$1199();
            key$1668 = '$' + label$1667.name;
            if (!Object.prototype.hasOwnProperty.call(state$1120.labelSet, key$1668)) {
                throwError$1156({}, Messages$1101.UnknownLabel, label$1667.name);
            }
        }
        consumeSemicolon$1165();
        if (label$1667 === null && !(state$1120.inIteration || state$1120.inSwitch)) {
            throwError$1156({}, Messages$1101.IllegalBreak);
        }
        return delegate$1115.createBreakStatement(label$1667);
    }
    // 12.9 The return statement
    function parseReturnStatement$1219() {
        var argument$1669 = null;
        expectKeyword$1160('return');
        if (!state$1120.inFunctionBody) {
            throwErrorTolerant$1157({}, Messages$1101.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$1129(String(lookahead$1118.value).charCodeAt(0))) {
            argument$1669 = parseExpression$1196();
            consumeSemicolon$1165();
            return delegate$1115.createReturnStatement(argument$1669);
        }
        if (peekLineTerminator$1155()) {
            return delegate$1115.createReturnStatement(null);
        }
        if (!match$1161(';')) {
            if (!match$1161('}') && lookahead$1118.type !== Token$1096.EOF) {
                argument$1669 = parseExpression$1196();
            }
        }
        consumeSemicolon$1165();
        return delegate$1115.createReturnStatement(argument$1669);
    }
    // 12.10 The with statement
    function parseWithStatement$1220() {
        var object$1670, body$1671;
        if (strict$1106) {
            throwErrorTolerant$1157({}, Messages$1101.StrictModeWith);
        }
        expectKeyword$1160('with');
        expect$1159('(');
        object$1670 = parseExpression$1196();
        expect$1159(')');
        body$1671 = parseStatement$1227();
        return delegate$1115.createWithStatement(object$1670, body$1671);
    }
    // 12.10 The swith statement
    function parseSwitchCase$1221() {
        var test$1672, consequent$1673 = [], sourceElement$1674;
        if (matchKeyword$1162('default')) {
            lex$1152();
            test$1672 = null;
        } else {
            expectKeyword$1160('case');
            test$1672 = parseExpression$1196();
        }
        expect$1159(':');
        while (streamIndex$1117 < length$1114) {
            if (match$1161('}') || matchKeyword$1162('default') || matchKeyword$1162('case')) {
                break;
            }
            sourceElement$1674 = parseSourceElement$1242();
            if (typeof sourceElement$1674 === 'undefined') {
                break;
            }
            consequent$1673.push(sourceElement$1674);
        }
        return delegate$1115.createSwitchCase(test$1672, consequent$1673);
    }
    function parseSwitchStatement$1222() {
        var discriminant$1675, cases$1676, clause$1677, oldInSwitch$1678, defaultFound$1679;
        expectKeyword$1160('switch');
        expect$1159('(');
        discriminant$1675 = parseExpression$1196();
        expect$1159(')');
        expect$1159('{');
        cases$1676 = [];
        if (match$1161('}')) {
            lex$1152();
            return delegate$1115.createSwitchStatement(discriminant$1675, cases$1676);
        }
        oldInSwitch$1678 = state$1120.inSwitch;
        state$1120.inSwitch = true;
        defaultFound$1679 = false;
        while (streamIndex$1117 < length$1114) {
            if (match$1161('}')) {
                break;
            }
            clause$1677 = parseSwitchCase$1221();
            if (clause$1677.test === null) {
                if (defaultFound$1679) {
                    throwError$1156({}, Messages$1101.MultipleDefaultsInSwitch);
                }
                defaultFound$1679 = true;
            }
            cases$1676.push(clause$1677);
        }
        state$1120.inSwitch = oldInSwitch$1678;
        expect$1159('}');
        return delegate$1115.createSwitchStatement(discriminant$1675, cases$1676);
    }
    // 12.13 The throw statement
    function parseThrowStatement$1223() {
        var argument$1680;
        expectKeyword$1160('throw');
        if (peekLineTerminator$1155()) {
            throwError$1156({}, Messages$1101.NewlineAfterThrow);
        }
        argument$1680 = parseExpression$1196();
        consumeSemicolon$1165();
        return delegate$1115.createThrowStatement(argument$1680);
    }
    // 12.14 The try statement
    function parseCatchClause$1224() {
        var param$1681, body$1682;
        expectKeyword$1160('catch');
        expect$1159('(');
        if (match$1161(')')) {
            throwUnexpected$1158(lookahead$1118);
        }
        param$1681 = parseExpression$1196();
        // 12.14.1
        if (strict$1106 && param$1681.type === Syntax$1099.Identifier && isRestrictedWord$1133(param$1681.name)) {
            throwErrorTolerant$1157({}, Messages$1101.StrictCatchVariable);
        }
        expect$1159(')');
        body$1682 = parseBlock$1198();
        return delegate$1115.createCatchClause(param$1681, body$1682);
    }
    function parseTryStatement$1225() {
        var block$1683, handlers$1684 = [], finalizer$1685 = null;
        expectKeyword$1160('try');
        block$1683 = parseBlock$1198();
        if (matchKeyword$1162('catch')) {
            handlers$1684.push(parseCatchClause$1224());
        }
        if (matchKeyword$1162('finally')) {
            lex$1152();
            finalizer$1685 = parseBlock$1198();
        }
        if (handlers$1684.length === 0 && !finalizer$1685) {
            throwError$1156({}, Messages$1101.NoCatchOrFinally);
        }
        return delegate$1115.createTryStatement(block$1683, [], handlers$1684, finalizer$1685);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$1226() {
        expectKeyword$1160('debugger');
        consumeSemicolon$1165();
        return delegate$1115.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$1227() {
        var type$1686 = lookahead$1118.type, expr$1687, labeledBody$1688, key$1689;
        if (type$1686 === Token$1096.EOF) {
            throwUnexpected$1158(lookahead$1118);
        }
        if (type$1686 === Token$1096.Punctuator) {
            switch (lookahead$1118.value) {
            case ';':
                return parseEmptyStatement$1210();
            case '{':
                return parseBlock$1198();
            case '(':
                return parseExpressionStatement$1211();
            default:
                break;
            }
        }
        if (type$1686 === Token$1096.Keyword) {
            switch (lookahead$1118.value) {
            case 'break':
                return parseBreakStatement$1218();
            case 'continue':
                return parseContinueStatement$1217();
            case 'debugger':
                return parseDebuggerStatement$1226();
            case 'do':
                return parseDoWhileStatement$1213();
            case 'for':
                return parseForStatement$1216();
            case 'function':
                return parseFunctionDeclaration$1233();
            case 'class':
                return parseClassDeclaration$1240();
            case 'if':
                return parseIfStatement$1212();
            case 'return':
                return parseReturnStatement$1219();
            case 'switch':
                return parseSwitchStatement$1222();
            case 'throw':
                return parseThrowStatement$1223();
            case 'try':
                return parseTryStatement$1225();
            case 'var':
                return parseVariableStatement$1202();
            case 'while':
                return parseWhileStatement$1214();
            case 'with':
                return parseWithStatement$1220();
            default:
                break;
            }
        }
        expr$1687 = parseExpression$1196();
        // 12.12 Labelled Statements
        if (expr$1687.type === Syntax$1099.Identifier && match$1161(':')) {
            lex$1152();
            key$1689 = '$' + expr$1687.name;
            if (Object.prototype.hasOwnProperty.call(state$1120.labelSet, key$1689)) {
                throwError$1156({}, Messages$1101.Redeclaration, 'Label', expr$1687.name);
            }
            state$1120.labelSet[key$1689] = true;
            labeledBody$1688 = parseStatement$1227();
            delete state$1120.labelSet[key$1689];
            return delegate$1115.createLabeledStatement(expr$1687, labeledBody$1688);
        }
        consumeSemicolon$1165();
        return delegate$1115.createExpressionStatement(expr$1687);
    }
    // 13 Function Definition
    function parseConciseBody$1228() {
        if (match$1161('{')) {
            return parseFunctionSourceElements$1229();
        }
        return parseAssignmentExpression$1195();
    }
    function parseFunctionSourceElements$1229() {
        var sourceElement$1690, sourceElements$1691 = [], token$1692, directive$1693, firstRestricted$1694, oldLabelSet$1695, oldInIteration$1696, oldInSwitch$1697, oldInFunctionBody$1698, oldParenthesizedCount$1699;
        expect$1159('{');
        while (streamIndex$1117 < length$1114) {
            if (lookahead$1118.type !== Token$1096.StringLiteral) {
                break;
            }
            token$1692 = lookahead$1118;
            sourceElement$1690 = parseSourceElement$1242();
            sourceElements$1691.push(sourceElement$1690);
            if (sourceElement$1690.expression.type !== Syntax$1099.Literal) {
                // this is not directive
                break;
            }
            directive$1693 = token$1692.value;
            if (directive$1693 === 'use strict') {
                strict$1106 = true;
                if (firstRestricted$1694) {
                    throwErrorTolerant$1157(firstRestricted$1694, Messages$1101.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1694 && token$1692.octal) {
                    firstRestricted$1694 = token$1692;
                }
            }
        }
        oldLabelSet$1695 = state$1120.labelSet;
        oldInIteration$1696 = state$1120.inIteration;
        oldInSwitch$1697 = state$1120.inSwitch;
        oldInFunctionBody$1698 = state$1120.inFunctionBody;
        oldParenthesizedCount$1699 = state$1120.parenthesizedCount;
        state$1120.labelSet = {};
        state$1120.inIteration = false;
        state$1120.inSwitch = false;
        state$1120.inFunctionBody = true;
        state$1120.parenthesizedCount = 0;
        while (streamIndex$1117 < length$1114) {
            if (match$1161('}')) {
                break;
            }
            sourceElement$1690 = parseSourceElement$1242();
            if (typeof sourceElement$1690 === 'undefined') {
                break;
            }
            sourceElements$1691.push(sourceElement$1690);
        }
        expect$1159('}');
        state$1120.labelSet = oldLabelSet$1695;
        state$1120.inIteration = oldInIteration$1696;
        state$1120.inSwitch = oldInSwitch$1697;
        state$1120.inFunctionBody = oldInFunctionBody$1698;
        state$1120.parenthesizedCount = oldParenthesizedCount$1699;
        return delegate$1115.createBlockStatement(sourceElements$1691);
    }
    function validateParam$1230(options$1700, param$1701, name$1702) {
        var key$1703 = '$' + name$1702;
        if (strict$1106) {
            if (isRestrictedWord$1133(name$1702)) {
                options$1700.stricted = param$1701;
                options$1700.message = Messages$1101.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1700.paramSet, key$1703)) {
                options$1700.stricted = param$1701;
                options$1700.message = Messages$1101.StrictParamDupe;
            }
        } else if (!options$1700.firstRestricted) {
            if (isRestrictedWord$1133(name$1702)) {
                options$1700.firstRestricted = param$1701;
                options$1700.message = Messages$1101.StrictParamName;
            } else if (isStrictModeReservedWord$1132(name$1702)) {
                options$1700.firstRestricted = param$1701;
                options$1700.message = Messages$1101.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1700.paramSet, key$1703)) {
                options$1700.firstRestricted = param$1701;
                options$1700.message = Messages$1101.StrictParamDupe;
            }
        }
        options$1700.paramSet[key$1703] = true;
    }
    function parseParam$1231(options$1704) {
        var token$1705, rest$1706, param$1707, def$1708;
        token$1705 = lookahead$1118;
        if (token$1705.value === '...') {
            token$1705 = lex$1152();
            rest$1706 = true;
        }
        if (match$1161('[')) {
            param$1707 = parseArrayInitialiser$1168();
            reinterpretAsDestructuredParameter$1192(options$1704, param$1707);
        } else if (match$1161('{')) {
            if (rest$1706) {
                throwError$1156({}, Messages$1101.ObjectPatternAsRestParameter);
            }
            param$1707 = parseObjectInitialiser$1173();
            reinterpretAsDestructuredParameter$1192(options$1704, param$1707);
        } else {
            param$1707 = parseVariableIdentifier$1199();
            validateParam$1230(options$1704, token$1705, token$1705.value);
            if (match$1161('=')) {
                if (rest$1706) {
                    throwErrorTolerant$1157(lookahead$1118, Messages$1101.DefaultRestParameter);
                }
                lex$1152();
                def$1708 = parseAssignmentExpression$1195();
                ++options$1704.defaultCount;
            }
        }
        if (rest$1706) {
            if (!match$1161(')')) {
                throwError$1156({}, Messages$1101.ParameterAfterRestParameter);
            }
            options$1704.rest = param$1707;
            return false;
        }
        options$1704.params.push(param$1707);
        options$1704.defaults.push(def$1708);
        return !match$1161(')');
    }
    function parseParams$1232(firstRestricted$1709) {
        var options$1710;
        options$1710 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1709
        };
        expect$1159('(');
        if (!match$1161(')')) {
            options$1710.paramSet = {};
            while (streamIndex$1117 < length$1114) {
                if (!parseParam$1231(options$1710)) {
                    break;
                }
                expect$1159(',');
            }
        }
        expect$1159(')');
        if (options$1710.defaultCount === 0) {
            options$1710.defaults = [];
        }
        return options$1710;
    }
    function parseFunctionDeclaration$1233() {
        var id$1711, body$1712, token$1713, tmp$1714, firstRestricted$1715, message$1716, previousStrict$1717, previousYieldAllowed$1718, generator$1719, expression$1720;
        expectKeyword$1160('function');
        generator$1719 = false;
        if (match$1161('*')) {
            lex$1152();
            generator$1719 = true;
        }
        token$1713 = lookahead$1118;
        id$1711 = parseVariableIdentifier$1199();
        if (strict$1106) {
            if (isRestrictedWord$1133(token$1713.value)) {
                throwErrorTolerant$1157(token$1713, Messages$1101.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$1133(token$1713.value)) {
                firstRestricted$1715 = token$1713;
                message$1716 = Messages$1101.StrictFunctionName;
            } else if (isStrictModeReservedWord$1132(token$1713.value)) {
                firstRestricted$1715 = token$1713;
                message$1716 = Messages$1101.StrictReservedWord;
            }
        }
        tmp$1714 = parseParams$1232(firstRestricted$1715);
        firstRestricted$1715 = tmp$1714.firstRestricted;
        if (tmp$1714.message) {
            message$1716 = tmp$1714.message;
        }
        previousStrict$1717 = strict$1106;
        previousYieldAllowed$1718 = state$1120.yieldAllowed;
        state$1120.yieldAllowed = generator$1719;
        // here we redo some work in order to set 'expression'
        expression$1720 = !match$1161('{');
        body$1712 = parseConciseBody$1228();
        if (strict$1106 && firstRestricted$1715) {
            throwError$1156(firstRestricted$1715, message$1716);
        }
        if (strict$1106 && tmp$1714.stricted) {
            throwErrorTolerant$1157(tmp$1714.stricted, message$1716);
        }
        if (state$1120.yieldAllowed && !state$1120.yieldFound) {
            throwErrorTolerant$1157({}, Messages$1101.NoYieldInGenerator);
        }
        strict$1106 = previousStrict$1717;
        state$1120.yieldAllowed = previousYieldAllowed$1718;
        return delegate$1115.createFunctionDeclaration(id$1711, tmp$1714.params, tmp$1714.defaults, body$1712, tmp$1714.rest, generator$1719, expression$1720);
    }
    function parseFunctionExpression$1234() {
        var token$1721, id$1722 = null, firstRestricted$1723, message$1724, tmp$1725, body$1726, previousStrict$1727, previousYieldAllowed$1728, generator$1729, expression$1730;
        expectKeyword$1160('function');
        generator$1729 = false;
        if (match$1161('*')) {
            lex$1152();
            generator$1729 = true;
        }
        if (!match$1161('(')) {
            token$1721 = lookahead$1118;
            id$1722 = parseVariableIdentifier$1199();
            if (strict$1106) {
                if (isRestrictedWord$1133(token$1721.value)) {
                    throwErrorTolerant$1157(token$1721, Messages$1101.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$1133(token$1721.value)) {
                    firstRestricted$1723 = token$1721;
                    message$1724 = Messages$1101.StrictFunctionName;
                } else if (isStrictModeReservedWord$1132(token$1721.value)) {
                    firstRestricted$1723 = token$1721;
                    message$1724 = Messages$1101.StrictReservedWord;
                }
            }
        }
        tmp$1725 = parseParams$1232(firstRestricted$1723);
        firstRestricted$1723 = tmp$1725.firstRestricted;
        if (tmp$1725.message) {
            message$1724 = tmp$1725.message;
        }
        previousStrict$1727 = strict$1106;
        previousYieldAllowed$1728 = state$1120.yieldAllowed;
        state$1120.yieldAllowed = generator$1729;
        // here we redo some work in order to set 'expression'
        expression$1730 = !match$1161('{');
        body$1726 = parseConciseBody$1228();
        if (strict$1106 && firstRestricted$1723) {
            throwError$1156(firstRestricted$1723, message$1724);
        }
        if (strict$1106 && tmp$1725.stricted) {
            throwErrorTolerant$1157(tmp$1725.stricted, message$1724);
        }
        if (state$1120.yieldAllowed && !state$1120.yieldFound) {
            throwErrorTolerant$1157({}, Messages$1101.NoYieldInGenerator);
        }
        strict$1106 = previousStrict$1727;
        state$1120.yieldAllowed = previousYieldAllowed$1728;
        return delegate$1115.createFunctionExpression(id$1722, tmp$1725.params, tmp$1725.defaults, body$1726, tmp$1725.rest, generator$1729, expression$1730);
    }
    function parseYieldExpression$1235() {
        var delegateFlag$1731, expr$1732, previousYieldAllowed$1733;
        expectKeyword$1160('yield');
        if (!state$1120.yieldAllowed) {
            throwErrorTolerant$1157({}, Messages$1101.IllegalYield);
        }
        delegateFlag$1731 = false;
        if (match$1161('*')) {
            lex$1152();
            delegateFlag$1731 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1733 = state$1120.yieldAllowed;
        state$1120.yieldAllowed = false;
        expr$1732 = parseAssignmentExpression$1195();
        state$1120.yieldAllowed = previousYieldAllowed$1733;
        state$1120.yieldFound = true;
        return delegate$1115.createYieldExpression(expr$1732, delegateFlag$1731);
    }
    // 14 Classes
    function parseMethodDefinition$1236(existingPropNames$1734) {
        var token$1735, key$1736, param$1737, propType$1738, isValidDuplicateProp$1739 = false;
        if (lookahead$1118.value === 'static') {
            propType$1738 = ClassPropertyType$1104.static;
            lex$1152();
        } else {
            propType$1738 = ClassPropertyType$1104.prototype;
        }
        if (match$1161('*')) {
            lex$1152();
            return delegate$1115.createMethodDefinition(propType$1738, '', parseObjectPropertyKey$1171(), parsePropertyMethodFunction$1170({ generator: true }));
        }
        token$1735 = lookahead$1118;
        key$1736 = parseObjectPropertyKey$1171();
        if (token$1735.value === 'get' && !match$1161('(')) {
            key$1736 = parseObjectPropertyKey$1171();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1734[propType$1738].hasOwnProperty(key$1736.name)) {
                isValidDuplicateProp$1739 = existingPropNames$1734[propType$1738][key$1736.name].get === undefined && existingPropNames$1734[propType$1738][key$1736.name].data === undefined && existingPropNames$1734[propType$1738][key$1736.name].set !== undefined;
                if (!isValidDuplicateProp$1739) {
                    throwError$1156(key$1736, Messages$1101.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1734[propType$1738][key$1736.name] = {};
            }
            existingPropNames$1734[propType$1738][key$1736.name].get = true;
            expect$1159('(');
            expect$1159(')');
            return delegate$1115.createMethodDefinition(propType$1738, 'get', key$1736, parsePropertyFunction$1169({ generator: false }));
        }
        if (token$1735.value === 'set' && !match$1161('(')) {
            key$1736 = parseObjectPropertyKey$1171();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1734[propType$1738].hasOwnProperty(key$1736.name)) {
                isValidDuplicateProp$1739 = existingPropNames$1734[propType$1738][key$1736.name].set === undefined && existingPropNames$1734[propType$1738][key$1736.name].data === undefined && existingPropNames$1734[propType$1738][key$1736.name].get !== undefined;
                if (!isValidDuplicateProp$1739) {
                    throwError$1156(key$1736, Messages$1101.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1734[propType$1738][key$1736.name] = {};
            }
            existingPropNames$1734[propType$1738][key$1736.name].set = true;
            expect$1159('(');
            token$1735 = lookahead$1118;
            param$1737 = [parseVariableIdentifier$1199()];
            expect$1159(')');
            return delegate$1115.createMethodDefinition(propType$1738, 'set', key$1736, parsePropertyFunction$1169({
                params: param$1737,
                generator: false,
                name: token$1735
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1734[propType$1738].hasOwnProperty(key$1736.name)) {
            throwError$1156(key$1736, Messages$1101.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1734[propType$1738][key$1736.name] = {};
        }
        existingPropNames$1734[propType$1738][key$1736.name].data = true;
        return delegate$1115.createMethodDefinition(propType$1738, '', key$1736, parsePropertyMethodFunction$1170({ generator: false }));
    }
    function parseClassElement$1237(existingProps$1740) {
        if (match$1161(';')) {
            lex$1152();
            return;
        }
        return parseMethodDefinition$1236(existingProps$1740);
    }
    function parseClassBody$1238() {
        var classElement$1741, classElements$1742 = [], existingProps$1743 = {};
        existingProps$1743[ClassPropertyType$1104.static] = {};
        existingProps$1743[ClassPropertyType$1104.prototype] = {};
        expect$1159('{');
        while (streamIndex$1117 < length$1114) {
            if (match$1161('}')) {
                break;
            }
            classElement$1741 = parseClassElement$1237(existingProps$1743);
            if (typeof classElement$1741 !== 'undefined') {
                classElements$1742.push(classElement$1741);
            }
        }
        expect$1159('}');
        return delegate$1115.createClassBody(classElements$1742);
    }
    function parseClassExpression$1239() {
        var id$1744, previousYieldAllowed$1745, superClass$1746 = null;
        expectKeyword$1160('class');
        if (!matchKeyword$1162('extends') && !match$1161('{')) {
            id$1744 = parseVariableIdentifier$1199();
        }
        if (matchKeyword$1162('extends')) {
            expectKeyword$1160('extends');
            previousYieldAllowed$1745 = state$1120.yieldAllowed;
            state$1120.yieldAllowed = false;
            superClass$1746 = parseAssignmentExpression$1195();
            state$1120.yieldAllowed = previousYieldAllowed$1745;
        }
        return delegate$1115.createClassExpression(id$1744, superClass$1746, parseClassBody$1238());
    }
    function parseClassDeclaration$1240() {
        var id$1747, previousYieldAllowed$1748, superClass$1749 = null;
        expectKeyword$1160('class');
        id$1747 = parseVariableIdentifier$1199();
        if (matchKeyword$1162('extends')) {
            expectKeyword$1160('extends');
            previousYieldAllowed$1748 = state$1120.yieldAllowed;
            state$1120.yieldAllowed = false;
            superClass$1749 = parseAssignmentExpression$1195();
            state$1120.yieldAllowed = previousYieldAllowed$1748;
        }
        return delegate$1115.createClassDeclaration(id$1747, superClass$1749, parseClassBody$1238());
    }
    // 15 Program
    function matchModuleDeclaration$1241() {
        var id$1750;
        if (matchContextualKeyword$1163('module')) {
            id$1750 = lookahead2$1154();
            return id$1750.type === Token$1096.StringLiteral || id$1750.type === Token$1096.Identifier;
        }
        return false;
    }
    function parseSourceElement$1242() {
        if (lookahead$1118.type === Token$1096.Keyword) {
            switch (lookahead$1118.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$1203(lookahead$1118.value);
            case 'function':
                return parseFunctionDeclaration$1233();
            case 'export':
                return parseExportDeclaration$1207();
            case 'import':
                return parseImportDeclaration$1208();
            default:
                return parseStatement$1227();
            }
        }
        if (matchModuleDeclaration$1241()) {
            throwError$1156({}, Messages$1101.NestedModule);
        }
        if (lookahead$1118.type !== Token$1096.EOF) {
            return parseStatement$1227();
        }
    }
    function parseProgramElement$1243() {
        if (lookahead$1118.type === Token$1096.Keyword) {
            switch (lookahead$1118.value) {
            case 'export':
                return parseExportDeclaration$1207();
            case 'import':
                return parseImportDeclaration$1208();
            }
        }
        if (matchModuleDeclaration$1241()) {
            return parseModuleDeclaration$1204();
        }
        return parseSourceElement$1242();
    }
    function parseProgramElements$1244() {
        var sourceElement$1751, sourceElements$1752 = [], token$1753, directive$1754, firstRestricted$1755;
        while (streamIndex$1117 < length$1114) {
            token$1753 = lookahead$1118;
            if (token$1753.type !== Token$1096.StringLiteral) {
                break;
            }
            sourceElement$1751 = parseProgramElement$1243();
            sourceElements$1752.push(sourceElement$1751);
            if (sourceElement$1751.expression.type !== Syntax$1099.Literal) {
                // this is not directive
                break;
            }
            directive$1754 = token$1753.value;
            if (directive$1754 === 'use strict') {
                strict$1106 = true;
                if (firstRestricted$1755) {
                    throwErrorTolerant$1157(firstRestricted$1755, Messages$1101.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1755 && token$1753.octal) {
                    firstRestricted$1755 = token$1753;
                }
            }
        }
        while (streamIndex$1117 < length$1114) {
            sourceElement$1751 = parseProgramElement$1243();
            if (typeof sourceElement$1751 === 'undefined') {
                break;
            }
            sourceElements$1752.push(sourceElement$1751);
        }
        return sourceElements$1752;
    }
    function parseModuleElement$1245() {
        return parseSourceElement$1242();
    }
    function parseModuleElements$1246() {
        var list$1756 = [], statement$1757;
        while (streamIndex$1117 < length$1114) {
            if (match$1161('}')) {
                break;
            }
            statement$1757 = parseModuleElement$1245();
            if (typeof statement$1757 === 'undefined') {
                break;
            }
            list$1756.push(statement$1757);
        }
        return list$1756;
    }
    function parseModuleBlock$1247() {
        var block$1758;
        expect$1159('{');
        block$1758 = parseModuleElements$1246();
        expect$1159('}');
        return delegate$1115.createBlockStatement(block$1758);
    }
    function parseProgram$1248() {
        var body$1759;
        strict$1106 = false;
        peek$1153();
        body$1759 = parseProgramElements$1244();
        return delegate$1115.createProgram(body$1759);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1249(type$1760, value$1761, start$1762, end$1763, loc$1764) {
        assert$1122(typeof start$1762 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$1121.comments.length > 0) {
            if (extra$1121.comments[extra$1121.comments.length - 1].range[1] > start$1762) {
                return;
            }
        }
        extra$1121.comments.push({
            type: type$1760,
            value: value$1761,
            range: [
                start$1762,
                end$1763
            ],
            loc: loc$1764
        });
    }
    function scanComment$1250() {
        var comment$1765, ch$1766, loc$1767, start$1768, blockComment$1769, lineComment$1770;
        comment$1765 = '';
        blockComment$1769 = false;
        lineComment$1770 = false;
        while (index$1107 < length$1114) {
            ch$1766 = source$1105[index$1107];
            if (lineComment$1770) {
                ch$1766 = source$1105[index$1107++];
                if (isLineTerminator$1128(ch$1766.charCodeAt(0))) {
                    loc$1767.end = {
                        line: lineNumber$1108,
                        column: index$1107 - lineStart$1109 - 1
                    };
                    lineComment$1770 = false;
                    addComment$1249('Line', comment$1765, start$1768, index$1107 - 1, loc$1767);
                    if (ch$1766 === '\r' && source$1105[index$1107] === '\n') {
                        ++index$1107;
                    }
                    ++lineNumber$1108;
                    lineStart$1109 = index$1107;
                    comment$1765 = '';
                } else if (index$1107 >= length$1114) {
                    lineComment$1770 = false;
                    comment$1765 += ch$1766;
                    loc$1767.end = {
                        line: lineNumber$1108,
                        column: length$1114 - lineStart$1109
                    };
                    addComment$1249('Line', comment$1765, start$1768, length$1114, loc$1767);
                } else {
                    comment$1765 += ch$1766;
                }
            } else if (blockComment$1769) {
                if (isLineTerminator$1128(ch$1766.charCodeAt(0))) {
                    if (ch$1766 === '\r' && source$1105[index$1107 + 1] === '\n') {
                        ++index$1107;
                        comment$1765 += '\r\n';
                    } else {
                        comment$1765 += ch$1766;
                    }
                    ++lineNumber$1108;
                    ++index$1107;
                    lineStart$1109 = index$1107;
                    if (index$1107 >= length$1114) {
                        throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1766 = source$1105[index$1107++];
                    if (index$1107 >= length$1114) {
                        throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1765 += ch$1766;
                    if (ch$1766 === '*') {
                        ch$1766 = source$1105[index$1107];
                        if (ch$1766 === '/') {
                            comment$1765 = comment$1765.substr(0, comment$1765.length - 1);
                            blockComment$1769 = false;
                            ++index$1107;
                            loc$1767.end = {
                                line: lineNumber$1108,
                                column: index$1107 - lineStart$1109
                            };
                            addComment$1249('Block', comment$1765, start$1768, index$1107, loc$1767);
                            comment$1765 = '';
                        }
                    }
                }
            } else if (ch$1766 === '/') {
                ch$1766 = source$1105[index$1107 + 1];
                if (ch$1766 === '/') {
                    loc$1767 = {
                        start: {
                            line: lineNumber$1108,
                            column: index$1107 - lineStart$1109
                        }
                    };
                    start$1768 = index$1107;
                    index$1107 += 2;
                    lineComment$1770 = true;
                    if (index$1107 >= length$1114) {
                        loc$1767.end = {
                            line: lineNumber$1108,
                            column: index$1107 - lineStart$1109
                        };
                        lineComment$1770 = false;
                        addComment$1249('Line', comment$1765, start$1768, index$1107, loc$1767);
                    }
                } else if (ch$1766 === '*') {
                    start$1768 = index$1107;
                    index$1107 += 2;
                    blockComment$1769 = true;
                    loc$1767 = {
                        start: {
                            line: lineNumber$1108,
                            column: index$1107 - lineStart$1109 - 2
                        }
                    };
                    if (index$1107 >= length$1114) {
                        throwError$1156({}, Messages$1101.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1127(ch$1766.charCodeAt(0))) {
                ++index$1107;
            } else if (isLineTerminator$1128(ch$1766.charCodeAt(0))) {
                ++index$1107;
                if (ch$1766 === '\r' && source$1105[index$1107] === '\n') {
                    ++index$1107;
                }
                ++lineNumber$1108;
                lineStart$1109 = index$1107;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1251() {
        var i$1771, entry$1772, comment$1773, comments$1774 = [];
        for (i$1771 = 0; i$1771 < extra$1121.comments.length; ++i$1771) {
            entry$1772 = extra$1121.comments[i$1771];
            comment$1773 = {
                type: entry$1772.type,
                value: entry$1772.value
            };
            if (extra$1121.range) {
                comment$1773.range = entry$1772.range;
            }
            if (extra$1121.loc) {
                comment$1773.loc = entry$1772.loc;
            }
            comments$1774.push(comment$1773);
        }
        extra$1121.comments = comments$1774;
    }
    function collectToken$1252() {
        var start$1775, loc$1776, token$1777, range$1778, value$1779;
        skipComment$1135();
        start$1775 = index$1107;
        loc$1776 = {
            start: {
                line: lineNumber$1108,
                column: index$1107 - lineStart$1109
            }
        };
        token$1777 = extra$1121.advance();
        loc$1776.end = {
            line: lineNumber$1108,
            column: index$1107 - lineStart$1109
        };
        if (token$1777.type !== Token$1096.EOF) {
            range$1778 = [
                token$1777.range[0],
                token$1777.range[1]
            ];
            value$1779 = source$1105.slice(token$1777.range[0], token$1777.range[1]);
            extra$1121.tokens.push({
                type: TokenName$1097[token$1777.type],
                value: value$1779,
                range: range$1778,
                loc: loc$1776
            });
        }
        return token$1777;
    }
    function collectRegex$1253() {
        var pos$1780, loc$1781, regex$1782, token$1783;
        skipComment$1135();
        pos$1780 = index$1107;
        loc$1781 = {
            start: {
                line: lineNumber$1108,
                column: index$1107 - lineStart$1109
            }
        };
        regex$1782 = extra$1121.scanRegExp();
        loc$1781.end = {
            line: lineNumber$1108,
            column: index$1107 - lineStart$1109
        };
        if (!extra$1121.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$1121.tokens.length > 0) {
                token$1783 = extra$1121.tokens[extra$1121.tokens.length - 1];
                if (token$1783.range[0] === pos$1780 && token$1783.type === 'Punctuator') {
                    if (token$1783.value === '/' || token$1783.value === '/=') {
                        extra$1121.tokens.pop();
                    }
                }
            }
            extra$1121.tokens.push({
                type: 'RegularExpression',
                value: regex$1782.literal,
                range: [
                    pos$1780,
                    index$1107
                ],
                loc: loc$1781
            });
        }
        return regex$1782;
    }
    function filterTokenLocation$1254() {
        var i$1784, entry$1785, token$1786, tokens$1787 = [];
        for (i$1784 = 0; i$1784 < extra$1121.tokens.length; ++i$1784) {
            entry$1785 = extra$1121.tokens[i$1784];
            token$1786 = {
                type: entry$1785.type,
                value: entry$1785.value
            };
            if (extra$1121.range) {
                token$1786.range = entry$1785.range;
            }
            if (extra$1121.loc) {
                token$1786.loc = entry$1785.loc;
            }
            tokens$1787.push(token$1786);
        }
        extra$1121.tokens = tokens$1787;
    }
    function LocationMarker$1255() {
        var sm_index$1788 = lookahead$1118 ? lookahead$1118.sm_range[0] : 0;
        var sm_lineStart$1789 = lookahead$1118 ? lookahead$1118.sm_lineStart : 0;
        var sm_lineNumber$1790 = lookahead$1118 ? lookahead$1118.sm_lineNumber : 1;
        this.range = [
            sm_index$1788,
            sm_index$1788
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1790,
                column: sm_index$1788 - sm_lineStart$1789
            },
            end: {
                line: sm_lineNumber$1790,
                column: sm_index$1788 - sm_lineStart$1789
            }
        };
    }
    LocationMarker$1255.prototype = {
        constructor: LocationMarker$1255,
        end: function () {
            this.range[1] = sm_index$1113;
            this.loc.end.line = sm_lineNumber$1110;
            this.loc.end.column = sm_index$1113 - sm_lineStart$1111;
        },
        applyGroup: function (node$1791) {
            if (extra$1121.range) {
                node$1791.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$1121.loc) {
                node$1791.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1791 = delegate$1115.postProcess(node$1791);
            }
        },
        apply: function (node$1792) {
            var nodeType$1793 = typeof node$1792;
            assert$1122(nodeType$1793 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1793);
            if (extra$1121.range) {
                node$1792.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$1121.loc) {
                node$1792.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1792 = delegate$1115.postProcess(node$1792);
            }
        }
    };
    function createLocationMarker$1256() {
        return new LocationMarker$1255();
    }
    function trackGroupExpression$1257() {
        var marker$1794, expr$1795;
        marker$1794 = createLocationMarker$1256();
        expect$1159('(');
        ++state$1120.parenthesizedCount;
        expr$1795 = parseExpression$1196();
        expect$1159(')');
        marker$1794.end();
        marker$1794.applyGroup(expr$1795);
        return expr$1795;
    }
    function trackLeftHandSideExpression$1258() {
        var marker$1796, expr$1797;
        // skipComment();
        marker$1796 = createLocationMarker$1256();
        expr$1797 = matchKeyword$1162('new') ? parseNewExpression$1183() : parsePrimaryExpression$1177();
        while (match$1161('.') || match$1161('[') || lookahead$1118.type === Token$1096.Template) {
            if (match$1161('[')) {
                expr$1797 = delegate$1115.createMemberExpression('[', expr$1797, parseComputedMember$1182());
                marker$1796.end();
                marker$1796.apply(expr$1797);
            } else if (match$1161('.')) {
                expr$1797 = delegate$1115.createMemberExpression('.', expr$1797, parseNonComputedMember$1181());
                marker$1796.end();
                marker$1796.apply(expr$1797);
            } else {
                expr$1797 = delegate$1115.createTaggedTemplateExpression(expr$1797, parseTemplateLiteral$1175());
                marker$1796.end();
                marker$1796.apply(expr$1797);
            }
        }
        return expr$1797;
    }
    function trackLeftHandSideExpressionAllowCall$1259() {
        var marker$1798, expr$1799, args$1800;
        // skipComment();
        marker$1798 = createLocationMarker$1256();
        expr$1799 = matchKeyword$1162('new') ? parseNewExpression$1183() : parsePrimaryExpression$1177();
        while (match$1161('.') || match$1161('[') || match$1161('(') || lookahead$1118.type === Token$1096.Template) {
            if (match$1161('(')) {
                args$1800 = parseArguments$1178();
                expr$1799 = delegate$1115.createCallExpression(expr$1799, args$1800);
                marker$1798.end();
                marker$1798.apply(expr$1799);
            } else if (match$1161('[')) {
                expr$1799 = delegate$1115.createMemberExpression('[', expr$1799, parseComputedMember$1182());
                marker$1798.end();
                marker$1798.apply(expr$1799);
            } else if (match$1161('.')) {
                expr$1799 = delegate$1115.createMemberExpression('.', expr$1799, parseNonComputedMember$1181());
                marker$1798.end();
                marker$1798.apply(expr$1799);
            } else {
                expr$1799 = delegate$1115.createTaggedTemplateExpression(expr$1799, parseTemplateLiteral$1175());
                marker$1798.end();
                marker$1798.apply(expr$1799);
            }
        }
        return expr$1799;
    }
    function filterGroup$1260(node$1801) {
        var n$1802, i$1803, entry$1804;
        n$1802 = Object.prototype.toString.apply(node$1801) === '[object Array]' ? [] : {};
        for (i$1803 in node$1801) {
            if (node$1801.hasOwnProperty(i$1803) && i$1803 !== 'groupRange' && i$1803 !== 'groupLoc') {
                entry$1804 = node$1801[i$1803];
                if (entry$1804 === null || typeof entry$1804 !== 'object' || entry$1804 instanceof RegExp) {
                    n$1802[i$1803] = entry$1804;
                } else {
                    n$1802[i$1803] = filterGroup$1260(entry$1804);
                }
            }
        }
        return n$1802;
    }
    function wrapTrackingFunction$1261(range$1805, loc$1806) {
        return function (parseFunction$1807) {
            function isBinary$1808(node$1810) {
                return node$1810.type === Syntax$1099.LogicalExpression || node$1810.type === Syntax$1099.BinaryExpression;
            }
            function visit$1809(node$1811) {
                var start$1812, end$1813;
                if (isBinary$1808(node$1811.left)) {
                    visit$1809(node$1811.left);
                }
                if (isBinary$1808(node$1811.right)) {
                    visit$1809(node$1811.right);
                }
                if (range$1805) {
                    if (node$1811.left.groupRange || node$1811.right.groupRange) {
                        start$1812 = node$1811.left.groupRange ? node$1811.left.groupRange[0] : node$1811.left.range[0];
                        end$1813 = node$1811.right.groupRange ? node$1811.right.groupRange[1] : node$1811.right.range[1];
                        node$1811.range = [
                            start$1812,
                            end$1813
                        ];
                    } else if (typeof node$1811.range === 'undefined') {
                        start$1812 = node$1811.left.range[0];
                        end$1813 = node$1811.right.range[1];
                        node$1811.range = [
                            start$1812,
                            end$1813
                        ];
                    }
                }
                if (loc$1806) {
                    if (node$1811.left.groupLoc || node$1811.right.groupLoc) {
                        start$1812 = node$1811.left.groupLoc ? node$1811.left.groupLoc.start : node$1811.left.loc.start;
                        end$1813 = node$1811.right.groupLoc ? node$1811.right.groupLoc.end : node$1811.right.loc.end;
                        node$1811.loc = {
                            start: start$1812,
                            end: end$1813
                        };
                        node$1811 = delegate$1115.postProcess(node$1811);
                    } else if (typeof node$1811.loc === 'undefined') {
                        node$1811.loc = {
                            start: node$1811.left.loc.start,
                            end: node$1811.right.loc.end
                        };
                        node$1811 = delegate$1115.postProcess(node$1811);
                    }
                }
            }
            return function () {
                var marker$1814, node$1815, curr$1816 = lookahead$1118;
                marker$1814 = createLocationMarker$1256();
                node$1815 = parseFunction$1807.apply(null, arguments);
                marker$1814.end();
                if (node$1815.type !== Syntax$1099.Program) {
                    if (curr$1816.leadingComments) {
                        node$1815.leadingComments = curr$1816.leadingComments;
                    }
                    if (curr$1816.trailingComments) {
                        node$1815.trailingComments = curr$1816.trailingComments;
                    }
                }
                if (range$1805 && typeof node$1815.range === 'undefined') {
                    marker$1814.apply(node$1815);
                }
                if (loc$1806 && typeof node$1815.loc === 'undefined') {
                    marker$1814.apply(node$1815);
                }
                if (isBinary$1808(node$1815)) {
                    visit$1809(node$1815);
                }
                return node$1815;
            };
        };
    }
    function patch$1262() {
        var wrapTracking$1817;
        if (extra$1121.comments) {
            extra$1121.skipComment = skipComment$1135;
            skipComment$1135 = scanComment$1250;
        }
        if (extra$1121.range || extra$1121.loc) {
            extra$1121.parseGroupExpression = parseGroupExpression$1176;
            extra$1121.parseLeftHandSideExpression = parseLeftHandSideExpression$1185;
            extra$1121.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$1184;
            parseGroupExpression$1176 = trackGroupExpression$1257;
            parseLeftHandSideExpression$1185 = trackLeftHandSideExpression$1258;
            parseLeftHandSideExpressionAllowCall$1184 = trackLeftHandSideExpressionAllowCall$1259;
            wrapTracking$1817 = wrapTrackingFunction$1261(extra$1121.range, extra$1121.loc);
            extra$1121.parseArrayInitialiser = parseArrayInitialiser$1168;
            extra$1121.parseAssignmentExpression = parseAssignmentExpression$1195;
            extra$1121.parseBinaryExpression = parseBinaryExpression$1189;
            extra$1121.parseBlock = parseBlock$1198;
            extra$1121.parseFunctionSourceElements = parseFunctionSourceElements$1229;
            extra$1121.parseCatchClause = parseCatchClause$1224;
            extra$1121.parseComputedMember = parseComputedMember$1182;
            extra$1121.parseConditionalExpression = parseConditionalExpression$1190;
            extra$1121.parseConstLetDeclaration = parseConstLetDeclaration$1203;
            extra$1121.parseExportBatchSpecifier = parseExportBatchSpecifier$1205;
            extra$1121.parseExportDeclaration = parseExportDeclaration$1207;
            extra$1121.parseExportSpecifier = parseExportSpecifier$1206;
            extra$1121.parseExpression = parseExpression$1196;
            extra$1121.parseForVariableDeclaration = parseForVariableDeclaration$1215;
            extra$1121.parseFunctionDeclaration = parseFunctionDeclaration$1233;
            extra$1121.parseFunctionExpression = parseFunctionExpression$1234;
            extra$1121.parseParams = parseParams$1232;
            extra$1121.parseImportDeclaration = parseImportDeclaration$1208;
            extra$1121.parseImportSpecifier = parseImportSpecifier$1209;
            extra$1121.parseModuleDeclaration = parseModuleDeclaration$1204;
            extra$1121.parseModuleBlock = parseModuleBlock$1247;
            extra$1121.parseNewExpression = parseNewExpression$1183;
            extra$1121.parseNonComputedProperty = parseNonComputedProperty$1180;
            extra$1121.parseObjectInitialiser = parseObjectInitialiser$1173;
            extra$1121.parseObjectProperty = parseObjectProperty$1172;
            extra$1121.parseObjectPropertyKey = parseObjectPropertyKey$1171;
            extra$1121.parsePostfixExpression = parsePostfixExpression$1186;
            extra$1121.parsePrimaryExpression = parsePrimaryExpression$1177;
            extra$1121.parseProgram = parseProgram$1248;
            extra$1121.parsePropertyFunction = parsePropertyFunction$1169;
            extra$1121.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$1179;
            extra$1121.parseTemplateElement = parseTemplateElement$1174;
            extra$1121.parseTemplateLiteral = parseTemplateLiteral$1175;
            extra$1121.parseStatement = parseStatement$1227;
            extra$1121.parseSwitchCase = parseSwitchCase$1221;
            extra$1121.parseUnaryExpression = parseUnaryExpression$1187;
            extra$1121.parseVariableDeclaration = parseVariableDeclaration$1200;
            extra$1121.parseVariableIdentifier = parseVariableIdentifier$1199;
            extra$1121.parseMethodDefinition = parseMethodDefinition$1236;
            extra$1121.parseClassDeclaration = parseClassDeclaration$1240;
            extra$1121.parseClassExpression = parseClassExpression$1239;
            extra$1121.parseClassBody = parseClassBody$1238;
            parseArrayInitialiser$1168 = wrapTracking$1817(extra$1121.parseArrayInitialiser);
            parseAssignmentExpression$1195 = wrapTracking$1817(extra$1121.parseAssignmentExpression);
            parseBinaryExpression$1189 = wrapTracking$1817(extra$1121.parseBinaryExpression);
            parseBlock$1198 = wrapTracking$1817(extra$1121.parseBlock);
            parseFunctionSourceElements$1229 = wrapTracking$1817(extra$1121.parseFunctionSourceElements);
            parseCatchClause$1224 = wrapTracking$1817(extra$1121.parseCatchClause);
            parseComputedMember$1182 = wrapTracking$1817(extra$1121.parseComputedMember);
            parseConditionalExpression$1190 = wrapTracking$1817(extra$1121.parseConditionalExpression);
            parseConstLetDeclaration$1203 = wrapTracking$1817(extra$1121.parseConstLetDeclaration);
            parseExportBatchSpecifier$1205 = wrapTracking$1817(parseExportBatchSpecifier$1205);
            parseExportDeclaration$1207 = wrapTracking$1817(parseExportDeclaration$1207);
            parseExportSpecifier$1206 = wrapTracking$1817(parseExportSpecifier$1206);
            parseExpression$1196 = wrapTracking$1817(extra$1121.parseExpression);
            parseForVariableDeclaration$1215 = wrapTracking$1817(extra$1121.parseForVariableDeclaration);
            parseFunctionDeclaration$1233 = wrapTracking$1817(extra$1121.parseFunctionDeclaration);
            parseFunctionExpression$1234 = wrapTracking$1817(extra$1121.parseFunctionExpression);
            parseParams$1232 = wrapTracking$1817(extra$1121.parseParams);
            parseImportDeclaration$1208 = wrapTracking$1817(extra$1121.parseImportDeclaration);
            parseImportSpecifier$1209 = wrapTracking$1817(extra$1121.parseImportSpecifier);
            parseModuleDeclaration$1204 = wrapTracking$1817(extra$1121.parseModuleDeclaration);
            parseModuleBlock$1247 = wrapTracking$1817(extra$1121.parseModuleBlock);
            parseLeftHandSideExpression$1185 = wrapTracking$1817(parseLeftHandSideExpression$1185);
            parseNewExpression$1183 = wrapTracking$1817(extra$1121.parseNewExpression);
            parseNonComputedProperty$1180 = wrapTracking$1817(extra$1121.parseNonComputedProperty);
            parseObjectInitialiser$1173 = wrapTracking$1817(extra$1121.parseObjectInitialiser);
            parseObjectProperty$1172 = wrapTracking$1817(extra$1121.parseObjectProperty);
            parseObjectPropertyKey$1171 = wrapTracking$1817(extra$1121.parseObjectPropertyKey);
            parsePostfixExpression$1186 = wrapTracking$1817(extra$1121.parsePostfixExpression);
            parsePrimaryExpression$1177 = wrapTracking$1817(extra$1121.parsePrimaryExpression);
            parseProgram$1248 = wrapTracking$1817(extra$1121.parseProgram);
            parsePropertyFunction$1169 = wrapTracking$1817(extra$1121.parsePropertyFunction);
            parseTemplateElement$1174 = wrapTracking$1817(extra$1121.parseTemplateElement);
            parseTemplateLiteral$1175 = wrapTracking$1817(extra$1121.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$1179 = wrapTracking$1817(extra$1121.parseSpreadOrAssignmentExpression);
            parseStatement$1227 = wrapTracking$1817(extra$1121.parseStatement);
            parseSwitchCase$1221 = wrapTracking$1817(extra$1121.parseSwitchCase);
            parseUnaryExpression$1187 = wrapTracking$1817(extra$1121.parseUnaryExpression);
            parseVariableDeclaration$1200 = wrapTracking$1817(extra$1121.parseVariableDeclaration);
            parseVariableIdentifier$1199 = wrapTracking$1817(extra$1121.parseVariableIdentifier);
            parseMethodDefinition$1236 = wrapTracking$1817(extra$1121.parseMethodDefinition);
            parseClassDeclaration$1240 = wrapTracking$1817(extra$1121.parseClassDeclaration);
            parseClassExpression$1239 = wrapTracking$1817(extra$1121.parseClassExpression);
            parseClassBody$1238 = wrapTracking$1817(extra$1121.parseClassBody);
        }
        if (typeof extra$1121.tokens !== 'undefined') {
            extra$1121.advance = advance$1151;
            extra$1121.scanRegExp = scanRegExp$1148;
            advance$1151 = collectToken$1252;
            scanRegExp$1148 = collectRegex$1253;
        }
    }
    function unpatch$1263() {
        if (typeof extra$1121.skipComment === 'function') {
            skipComment$1135 = extra$1121.skipComment;
        }
        if (extra$1121.range || extra$1121.loc) {
            parseArrayInitialiser$1168 = extra$1121.parseArrayInitialiser;
            parseAssignmentExpression$1195 = extra$1121.parseAssignmentExpression;
            parseBinaryExpression$1189 = extra$1121.parseBinaryExpression;
            parseBlock$1198 = extra$1121.parseBlock;
            parseFunctionSourceElements$1229 = extra$1121.parseFunctionSourceElements;
            parseCatchClause$1224 = extra$1121.parseCatchClause;
            parseComputedMember$1182 = extra$1121.parseComputedMember;
            parseConditionalExpression$1190 = extra$1121.parseConditionalExpression;
            parseConstLetDeclaration$1203 = extra$1121.parseConstLetDeclaration;
            parseExportBatchSpecifier$1205 = extra$1121.parseExportBatchSpecifier;
            parseExportDeclaration$1207 = extra$1121.parseExportDeclaration;
            parseExportSpecifier$1206 = extra$1121.parseExportSpecifier;
            parseExpression$1196 = extra$1121.parseExpression;
            parseForVariableDeclaration$1215 = extra$1121.parseForVariableDeclaration;
            parseFunctionDeclaration$1233 = extra$1121.parseFunctionDeclaration;
            parseFunctionExpression$1234 = extra$1121.parseFunctionExpression;
            parseImportDeclaration$1208 = extra$1121.parseImportDeclaration;
            parseImportSpecifier$1209 = extra$1121.parseImportSpecifier;
            parseGroupExpression$1176 = extra$1121.parseGroupExpression;
            parseLeftHandSideExpression$1185 = extra$1121.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$1184 = extra$1121.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$1204 = extra$1121.parseModuleDeclaration;
            parseModuleBlock$1247 = extra$1121.parseModuleBlock;
            parseNewExpression$1183 = extra$1121.parseNewExpression;
            parseNonComputedProperty$1180 = extra$1121.parseNonComputedProperty;
            parseObjectInitialiser$1173 = extra$1121.parseObjectInitialiser;
            parseObjectProperty$1172 = extra$1121.parseObjectProperty;
            parseObjectPropertyKey$1171 = extra$1121.parseObjectPropertyKey;
            parsePostfixExpression$1186 = extra$1121.parsePostfixExpression;
            parsePrimaryExpression$1177 = extra$1121.parsePrimaryExpression;
            parseProgram$1248 = extra$1121.parseProgram;
            parsePropertyFunction$1169 = extra$1121.parsePropertyFunction;
            parseTemplateElement$1174 = extra$1121.parseTemplateElement;
            parseTemplateLiteral$1175 = extra$1121.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$1179 = extra$1121.parseSpreadOrAssignmentExpression;
            parseStatement$1227 = extra$1121.parseStatement;
            parseSwitchCase$1221 = extra$1121.parseSwitchCase;
            parseUnaryExpression$1187 = extra$1121.parseUnaryExpression;
            parseVariableDeclaration$1200 = extra$1121.parseVariableDeclaration;
            parseVariableIdentifier$1199 = extra$1121.parseVariableIdentifier;
            parseMethodDefinition$1236 = extra$1121.parseMethodDefinition;
            parseClassDeclaration$1240 = extra$1121.parseClassDeclaration;
            parseClassExpression$1239 = extra$1121.parseClassExpression;
            parseClassBody$1238 = extra$1121.parseClassBody;
        }
        if (typeof extra$1121.scanRegExp === 'function') {
            advance$1151 = extra$1121.advance;
            scanRegExp$1148 = extra$1121.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1264(object$1818, properties$1819) {
        var entry$1820, result$1821 = {};
        for (entry$1820 in object$1818) {
            if (object$1818.hasOwnProperty(entry$1820)) {
                result$1821[entry$1820] = object$1818[entry$1820];
            }
        }
        for (entry$1820 in properties$1819) {
            if (properties$1819.hasOwnProperty(entry$1820)) {
                result$1821[entry$1820] = properties$1819[entry$1820];
            }
        }
        return result$1821;
    }
    function tokenize$1265(code$1822, options$1823) {
        var toString$1824, token$1825, tokens$1826;
        toString$1824 = String;
        if (typeof code$1822 !== 'string' && !(code$1822 instanceof String)) {
            code$1822 = toString$1824(code$1822);
        }
        delegate$1115 = SyntaxTreeDelegate$1103;
        source$1105 = code$1822;
        index$1107 = 0;
        lineNumber$1108 = source$1105.length > 0 ? 1 : 0;
        lineStart$1109 = 0;
        length$1114 = source$1105.length;
        lookahead$1118 = null;
        state$1120 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$1121 = {};
        // Options matching.
        options$1823 = options$1823 || {};
        // Of course we collect tokens here.
        options$1823.tokens = true;
        extra$1121.tokens = [];
        extra$1121.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$1121.openParenToken = -1;
        extra$1121.openCurlyToken = -1;
        extra$1121.range = typeof options$1823.range === 'boolean' && options$1823.range;
        extra$1121.loc = typeof options$1823.loc === 'boolean' && options$1823.loc;
        if (typeof options$1823.comment === 'boolean' && options$1823.comment) {
            extra$1121.comments = [];
        }
        if (typeof options$1823.tolerant === 'boolean' && options$1823.tolerant) {
            extra$1121.errors = [];
        }
        if (length$1114 > 0) {
            if (typeof source$1105[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1822 instanceof String) {
                    source$1105 = code$1822.valueOf();
                }
            }
        }
        patch$1262();
        try {
            peek$1153();
            if (lookahead$1118.type === Token$1096.EOF) {
                return extra$1121.tokens;
            }
            token$1825 = lex$1152();
            while (lookahead$1118.type !== Token$1096.EOF) {
                try {
                    token$1825 = lex$1152();
                } catch (lexError$1827) {
                    token$1825 = lookahead$1118;
                    if (extra$1121.errors) {
                        extra$1121.errors.push(lexError$1827);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1827;
                    }
                }
            }
            filterTokenLocation$1254();
            tokens$1826 = extra$1121.tokens;
            if (typeof extra$1121.comments !== 'undefined') {
                filterCommentLocation$1251();
                tokens$1826.comments = extra$1121.comments;
            }
            if (typeof extra$1121.errors !== 'undefined') {
                tokens$1826.errors = extra$1121.errors;
            }
        } catch (e$1828) {
            throw e$1828;
        } finally {
            unpatch$1263();
            extra$1121 = {};
        }
        return tokens$1826;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1266(toks$1829, start$1830, inExprDelim$1831, parentIsBlock$1832) {
        var assignOps$1833 = [
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
        var binaryOps$1834 = [
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
        var unaryOps$1835 = [
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
        function back$1836(n$1837) {
            var idx$1838 = toks$1829.length - n$1837 > 0 ? toks$1829.length - n$1837 : 0;
            return toks$1829[idx$1838];
        }
        if (inExprDelim$1831 && toks$1829.length - (start$1830 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1836(start$1830 + 2).value === ':' && parentIsBlock$1832) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$1123(back$1836(start$1830 + 2).value, unaryOps$1835.concat(binaryOps$1834).concat(assignOps$1833))) {
            // ... + {...}
            return false;
        } else if (back$1836(start$1830 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1839 = typeof back$1836(start$1830 + 1).startLineNumber !== 'undefined' ? back$1836(start$1830 + 1).startLineNumber : back$1836(start$1830 + 1).lineNumber;
            if (back$1836(start$1830 + 2).lineNumber !== currLineNumber$1839) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$1123(back$1836(start$1830 + 2).value, [
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
    function readToken$1267(toks$1840, inExprDelim$1841, parentIsBlock$1842) {
        var delimiters$1843 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1844 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1845 = toks$1840.length - 1;
        var comments$1846, commentsLen$1847 = extra$1121.comments.length;
        function back$1848(n$1852) {
            var idx$1853 = toks$1840.length - n$1852 > 0 ? toks$1840.length - n$1852 : 0;
            return toks$1840[idx$1853];
        }
        function attachComments$1849(token$1854) {
            if (comments$1846) {
                token$1854.leadingComments = comments$1846;
            }
            return token$1854;
        }
        function _advance$1850() {
            return attachComments$1849(advance$1151());
        }
        function _scanRegExp$1851() {
            return attachComments$1849(scanRegExp$1148());
        }
        skipComment$1135();
        if (extra$1121.comments.length > commentsLen$1847) {
            comments$1846 = extra$1121.comments.slice(commentsLen$1847);
        }
        if (isIn$1123(source$1105[index$1107], delimiters$1843)) {
            return attachComments$1849(readDelim$1268(toks$1840, inExprDelim$1841, parentIsBlock$1842));
        }
        if (source$1105[index$1107] === '/') {
            var prev$1855 = back$1848(1);
            if (prev$1855) {
                if (prev$1855.value === '()') {
                    if (isIn$1123(back$1848(2).value, parenIdents$1844)) {
                        // ... if (...) / ...
                        return _scanRegExp$1851();
                    }
                    // ... (...) / ...
                    return _advance$1850();
                }
                if (prev$1855.value === '{}') {
                    if (blockAllowed$1266(toks$1840, 0, inExprDelim$1841, parentIsBlock$1842)) {
                        if (back$1848(2).value === '()') {
                            // named function
                            if (back$1848(4).value === 'function') {
                                if (!blockAllowed$1266(toks$1840, 3, inExprDelim$1841, parentIsBlock$1842)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1850();
                                }
                                if (toks$1840.length - 5 <= 0 && inExprDelim$1841) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1850();
                                }
                            }
                            // unnamed function
                            if (back$1848(3).value === 'function') {
                                if (!blockAllowed$1266(toks$1840, 2, inExprDelim$1841, parentIsBlock$1842)) {
                                    // new function (...) {...} / ...
                                    return _advance$1850();
                                }
                                if (toks$1840.length - 4 <= 0 && inExprDelim$1841) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1850();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1851();
                    } else {
                        // ... + {...} / ...
                        return _advance$1850();
                    }
                }
                if (prev$1855.type === Token$1096.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1851();
                }
                if (isKeyword$1134(prev$1855.value)) {
                    // typeof /...
                    return _scanRegExp$1851();
                }
                return _advance$1850();
            }
            return _scanRegExp$1851();
        }
        return _advance$1850();
    }
    function readDelim$1268(toks$1856, inExprDelim$1857, parentIsBlock$1858) {
        var startDelim$1859 = advance$1151(), matchDelim$1860 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1861 = [];
        var delimiters$1862 = [
                '(',
                '{',
                '['
            ];
        assert$1122(delimiters$1862.indexOf(startDelim$1859.value) !== -1, 'Need to begin at the delimiter');
        var token$1863 = startDelim$1859;
        var startLineNumber$1864 = token$1863.lineNumber;
        var startLineStart$1865 = token$1863.lineStart;
        var startRange$1866 = token$1863.range;
        var delimToken$1867 = {};
        delimToken$1867.type = Token$1096.Delimiter;
        delimToken$1867.value = startDelim$1859.value + matchDelim$1860[startDelim$1859.value];
        delimToken$1867.startLineNumber = startLineNumber$1864;
        delimToken$1867.startLineStart = startLineStart$1865;
        delimToken$1867.startRange = startRange$1866;
        var delimIsBlock$1868 = false;
        if (startDelim$1859.value === '{') {
            delimIsBlock$1868 = blockAllowed$1266(toks$1856.concat(delimToken$1867), 0, inExprDelim$1857, parentIsBlock$1858);
        }
        while (index$1107 <= length$1114) {
            token$1863 = readToken$1267(inner$1861, startDelim$1859.value === '(' || startDelim$1859.value === '[', delimIsBlock$1868);
            if (token$1863.type === Token$1096.Punctuator && token$1863.value === matchDelim$1860[startDelim$1859.value]) {
                if (token$1863.leadingComments) {
                    delimToken$1867.trailingComments = token$1863.leadingComments;
                }
                break;
            } else if (token$1863.type === Token$1096.EOF) {
                throwError$1156({}, Messages$1101.UnexpectedEOS);
            } else {
                inner$1861.push(token$1863);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$1107 >= length$1114 && matchDelim$1860[startDelim$1859.value] !== source$1105[length$1114 - 1]) {
            throwError$1156({}, Messages$1101.UnexpectedEOS);
        }
        var endLineNumber$1869 = token$1863.lineNumber;
        var endLineStart$1870 = token$1863.lineStart;
        var endRange$1871 = token$1863.range;
        delimToken$1867.inner = inner$1861;
        delimToken$1867.endLineNumber = endLineNumber$1869;
        delimToken$1867.endLineStart = endLineStart$1870;
        delimToken$1867.endRange = endRange$1871;
        return delimToken$1867;
    }
    // (Str) -> [...CSyntax]
    function read$1269(code$1872) {
        var token$1873, tokenTree$1874 = [];
        extra$1121 = {};
        extra$1121.comments = [];
        patch$1262();
        source$1105 = code$1872;
        index$1107 = 0;
        lineNumber$1108 = source$1105.length > 0 ? 1 : 0;
        lineStart$1109 = 0;
        length$1114 = source$1105.length;
        state$1120 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$1107 < length$1114) {
            tokenTree$1874.push(readToken$1267(tokenTree$1874, false, false));
        }
        var last$1875 = tokenTree$1874[tokenTree$1874.length - 1];
        if (last$1875 && last$1875.type !== Token$1096.EOF) {
            tokenTree$1874.push({
                type: Token$1096.EOF,
                value: '',
                lineNumber: last$1875.lineNumber,
                lineStart: last$1875.lineStart,
                range: [
                    index$1107,
                    index$1107
                ]
            });
        }
        return expander$1095.tokensToSyntax(tokenTree$1874);
    }
    function parse$1270(code$1876, options$1877) {
        var program$1878, toString$1879;
        extra$1121 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1876)) {
            tokenStream$1116 = code$1876;
            length$1114 = tokenStream$1116.length;
            lineNumber$1108 = tokenStream$1116.length > 0 ? 1 : 0;
            source$1105 = undefined;
        } else {
            toString$1879 = String;
            if (typeof code$1876 !== 'string' && !(code$1876 instanceof String)) {
                code$1876 = toString$1879(code$1876);
            }
            source$1105 = code$1876;
            length$1114 = source$1105.length;
            lineNumber$1108 = source$1105.length > 0 ? 1 : 0;
        }
        delegate$1115 = SyntaxTreeDelegate$1103;
        streamIndex$1117 = -1;
        index$1107 = 0;
        lineStart$1109 = 0;
        sm_lineStart$1111 = 0;
        sm_lineNumber$1110 = lineNumber$1108;
        sm_index$1113 = 0;
        sm_range$1112 = [
            0,
            0
        ];
        lookahead$1118 = null;
        state$1120 = {
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
        if (typeof options$1877 !== 'undefined') {
            extra$1121.range = typeof options$1877.range === 'boolean' && options$1877.range;
            extra$1121.loc = typeof options$1877.loc === 'boolean' && options$1877.loc;
            if (extra$1121.loc && options$1877.source !== null && options$1877.source !== undefined) {
                delegate$1115 = extend$1264(delegate$1115, {
                    'postProcess': function (node$1880) {
                        node$1880.loc.source = toString$1879(options$1877.source);
                        return node$1880;
                    }
                });
            }
            if (typeof options$1877.tokens === 'boolean' && options$1877.tokens) {
                extra$1121.tokens = [];
            }
            if (typeof options$1877.comment === 'boolean' && options$1877.comment) {
                extra$1121.comments = [];
            }
            if (typeof options$1877.tolerant === 'boolean' && options$1877.tolerant) {
                extra$1121.errors = [];
            }
        }
        if (length$1114 > 0) {
            if (source$1105 && typeof source$1105[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1876 instanceof String) {
                    source$1105 = code$1876.valueOf();
                }
            }
        }
        extra$1121 = { loc: true };
        patch$1262();
        try {
            program$1878 = parseProgram$1248();
            if (typeof extra$1121.comments !== 'undefined') {
                filterCommentLocation$1251();
                program$1878.comments = extra$1121.comments;
            }
            if (typeof extra$1121.tokens !== 'undefined') {
                filterTokenLocation$1254();
                program$1878.tokens = extra$1121.tokens;
            }
            if (typeof extra$1121.errors !== 'undefined') {
                program$1878.errors = extra$1121.errors;
            }
            if (extra$1121.range || extra$1121.loc) {
                program$1878.body = filterGroup$1260(program$1878.body);
            }
        } catch (e$1881) {
            throw e$1881;
        } finally {
            unpatch$1263();
            extra$1121 = {};
        }
        return program$1878;
    }
    exports$1094.tokenize = tokenize$1265;
    exports$1094.read = read$1269;
    exports$1094.Token = Token$1096;
    exports$1094.parse = parse$1270;
    // Deep copy.
    exports$1094.Syntax = function () {
        var name$1882, types$1883 = {};
        if (typeof Object.create === 'function') {
            types$1883 = Object.create(null);
        }
        for (name$1882 in Syntax$1099) {
            if (Syntax$1099.hasOwnProperty(name$1882)) {
                types$1883[name$1882] = Syntax$1099[name$1882];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1883);
        }
        return types$1883;
    }();
}));
//# sourceMappingURL=parser.js.map