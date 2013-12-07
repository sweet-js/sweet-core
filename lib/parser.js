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
(function (root$731, factory$732) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$732);
    } else if (typeof exports !== 'undefined') {
        factory$732(exports, require('./expander'));
    } else {
        factory$732(root$731.esprima = {});
    }
}(this, function (exports$733, expander$734) {
    'use strict';
    var Token$735, TokenName$736, FnExprTokens$737, Syntax$738, PropertyKind$739, Messages$740, Regex$741, SyntaxTreeDelegate$742, ClassPropertyType$743, source$744, strict$745, index$746, lineNumber$747, lineStart$748, sm_lineNumber$749, sm_lineStart$750, sm_range$751, sm_index$752, length$753, delegate$754, tokenStream$755, streamIndex$756, lookahead$757, lookaheadIndex$758, state$759, extra$760;
    Token$735 = {
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
    TokenName$736 = {};
    TokenName$736[Token$735.BooleanLiteral] = 'Boolean';
    TokenName$736[Token$735.EOF] = '<end>';
    TokenName$736[Token$735.Identifier] = 'Identifier';
    TokenName$736[Token$735.Keyword] = 'Keyword';
    TokenName$736[Token$735.NullLiteral] = 'Null';
    TokenName$736[Token$735.NumericLiteral] = 'Numeric';
    TokenName$736[Token$735.Punctuator] = 'Punctuator';
    TokenName$736[Token$735.StringLiteral] = 'String';
    TokenName$736[Token$735.RegularExpression] = 'RegularExpression';
    TokenName$736[Token$735.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$737 = [
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
    Syntax$738 = {
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
    PropertyKind$739 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$743 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$740 = {
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
    Regex$741 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$761(condition$910, message$911) {
        if (!condition$910) {
            throw new Error('ASSERT: ' + message$911);
        }
    }
    function isIn$762(el$912, list$913) {
        return list$913.indexOf(el$912) !== -1;
    }
    function isDecimalDigit$763(ch$914) {
        return ch$914 >= 48 && ch$914 <= 57;
    }    // 0..9
    function isHexDigit$764(ch$915) {
        return '0123456789abcdefABCDEF'.indexOf(ch$915) >= 0;
    }
    function isOctalDigit$765(ch$916) {
        return '01234567'.indexOf(ch$916) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$766(ch$917) {
        return ch$917 === 32 || ch$917 === 9 || ch$917 === 11 || ch$917 === 12 || ch$917 === 160 || ch$917 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$917)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$767(ch$918) {
        return ch$918 === 10 || ch$918 === 13 || ch$918 === 8232 || ch$918 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$768(ch$919) {
        return ch$919 === 36 || ch$919 === 95 || ch$919 >= 65 && ch$919 <= 90 || ch$919 >= 97 && ch$919 <= 122 || ch$919 === 92 || ch$919 >= 128 && Regex$741.NonAsciiIdentifierStart.test(String.fromCharCode(ch$919));
    }
    function isIdentifierPart$769(ch$920) {
        return ch$920 === 36 || ch$920 === 95 || ch$920 >= 65 && ch$920 <= 90 || ch$920 >= 97 && ch$920 <= 122 || ch$920 >= 48 && ch$920 <= 57 || ch$920 === 92 || ch$920 >= 128 && Regex$741.NonAsciiIdentifierPart.test(String.fromCharCode(ch$920));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$770(id$921) {
        switch (id$921) {
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
    function isStrictModeReservedWord$771(id$922) {
        switch (id$922) {
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
    function isRestrictedWord$772(id$923) {
        return id$923 === 'eval' || id$923 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$773(id$924) {
        if (strict$745 && isStrictModeReservedWord$771(id$924)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$924.length) {
        case 2:
            return id$924 === 'if' || id$924 === 'in' || id$924 === 'do';
        case 3:
            return id$924 === 'var' || id$924 === 'for' || id$924 === 'new' || id$924 === 'try' || id$924 === 'let';
        case 4:
            return id$924 === 'this' || id$924 === 'else' || id$924 === 'case' || id$924 === 'void' || id$924 === 'with' || id$924 === 'enum';
        case 5:
            return id$924 === 'while' || id$924 === 'break' || id$924 === 'catch' || id$924 === 'throw' || id$924 === 'const' || id$924 === 'yield' || id$924 === 'class' || id$924 === 'super';
        case 6:
            return id$924 === 'return' || id$924 === 'typeof' || id$924 === 'delete' || id$924 === 'switch' || id$924 === 'export' || id$924 === 'import';
        case 7:
            return id$924 === 'default' || id$924 === 'finally' || id$924 === 'extends';
        case 8:
            return id$924 === 'function' || id$924 === 'continue' || id$924 === 'debugger';
        case 10:
            return id$924 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$774() {
        var ch$925, blockComment$926, lineComment$927;
        blockComment$926 = false;
        lineComment$927 = false;
        while (index$746 < length$753) {
            ch$925 = source$744.charCodeAt(index$746);
            if (lineComment$927) {
                ++index$746;
                if (isLineTerminator$767(ch$925)) {
                    lineComment$927 = false;
                    if (ch$925 === 13 && source$744.charCodeAt(index$746) === 10) {
                        ++index$746;
                    }
                    ++lineNumber$747;
                    lineStart$748 = index$746;
                }
            } else if (blockComment$926) {
                if (isLineTerminator$767(ch$925)) {
                    if (ch$925 === 13 && source$744.charCodeAt(index$746 + 1) === 10) {
                        ++index$746;
                    }
                    ++lineNumber$747;
                    ++index$746;
                    lineStart$748 = index$746;
                    if (index$746 >= length$753) {
                        throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$925 = source$744.charCodeAt(index$746++);
                    if (index$746 >= length$753) {
                        throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$925 === 42) {
                        ch$925 = source$744.charCodeAt(index$746);
                        if (ch$925 === 47) {
                            ++index$746;
                            blockComment$926 = false;
                        }
                    }
                }
            } else if (ch$925 === 47) {
                ch$925 = source$744.charCodeAt(index$746 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$925 === 47) {
                    index$746 += 2;
                    lineComment$927 = true;
                } else if (ch$925 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$746 += 2;
                    blockComment$926 = true;
                    if (index$746 >= length$753) {
                        throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$766(ch$925)) {
                ++index$746;
            } else if (isLineTerminator$767(ch$925)) {
                ++index$746;
                if (ch$925 === 13 && source$744.charCodeAt(index$746) === 10) {
                    ++index$746;
                }
                ++lineNumber$747;
                lineStart$748 = index$746;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$775(prefix$928) {
        var i$929, len$930, ch$931, code$932 = 0;
        len$930 = prefix$928 === 'u' ? 4 : 2;
        for (i$929 = 0; i$929 < len$930; ++i$929) {
            if (index$746 < length$753 && isHexDigit$764(source$744[index$746])) {
                ch$931 = source$744[index$746++];
                code$932 = code$932 * 16 + '0123456789abcdef'.indexOf(ch$931.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$932);
    }
    function scanUnicodeCodePointEscape$776() {
        var ch$933, code$934, cu1$935, cu2$936;
        ch$933 = source$744[index$746];
        code$934 = 0;
        // At least, one hex digit is required.
        if (ch$933 === '}') {
            throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
        }
        while (index$746 < length$753) {
            ch$933 = source$744[index$746++];
            if (!isHexDigit$764(ch$933)) {
                break;
            }
            code$934 = code$934 * 16 + '0123456789abcdef'.indexOf(ch$933.toLowerCase());
        }
        if (code$934 > 1114111 || ch$933 !== '}') {
            throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$934 <= 65535) {
            return String.fromCharCode(code$934);
        }
        cu1$935 = (code$934 - 65536 >> 10) + 55296;
        cu2$936 = (code$934 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$935, cu2$936);
    }
    function getEscapedIdentifier$777() {
        var ch$937, id$938;
        ch$937 = source$744.charCodeAt(index$746++);
        id$938 = String.fromCharCode(ch$937);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$937 === 92) {
            if (source$744.charCodeAt(index$746) !== 117) {
                throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
            }
            ++index$746;
            ch$937 = scanHexEscape$775('u');
            if (!ch$937 || ch$937 === '\\' || !isIdentifierStart$768(ch$937.charCodeAt(0))) {
                throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
            }
            id$938 = ch$937;
        }
        while (index$746 < length$753) {
            ch$937 = source$744.charCodeAt(index$746);
            if (!isIdentifierPart$769(ch$937)) {
                break;
            }
            ++index$746;
            id$938 += String.fromCharCode(ch$937);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$937 === 92) {
                id$938 = id$938.substr(0, id$938.length - 1);
                if (source$744.charCodeAt(index$746) !== 117) {
                    throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
                }
                ++index$746;
                ch$937 = scanHexEscape$775('u');
                if (!ch$937 || ch$937 === '\\' || !isIdentifierPart$769(ch$937.charCodeAt(0))) {
                    throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
                }
                id$938 += ch$937;
            }
        }
        return id$938;
    }
    function getIdentifier$778() {
        var start$939, ch$940;
        start$939 = index$746++;
        while (index$746 < length$753) {
            ch$940 = source$744.charCodeAt(index$746);
            if (ch$940 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$746 = start$939;
                return getEscapedIdentifier$777();
            }
            if (isIdentifierPart$769(ch$940)) {
                ++index$746;
            } else {
                break;
            }
        }
        return source$744.slice(start$939, index$746);
    }
    function scanIdentifier$779() {
        var start$941, id$942, type$943;
        start$941 = index$746;
        // Backslash (char #92) starts an escaped character.
        id$942 = source$744.charCodeAt(index$746) === 92 ? getEscapedIdentifier$777() : getIdentifier$778();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$942.length === 1) {
            type$943 = Token$735.Identifier;
        } else if (isKeyword$773(id$942)) {
            type$943 = Token$735.Keyword;
        } else if (id$942 === 'null') {
            type$943 = Token$735.NullLiteral;
        } else if (id$942 === 'true' || id$942 === 'false') {
            type$943 = Token$735.BooleanLiteral;
        } else {
            type$943 = Token$735.Identifier;
        }
        return {
            type: type$943,
            value: id$942,
            lineNumber: lineNumber$747,
            lineStart: lineStart$748,
            range: [
                start$941,
                index$746
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$780() {
        var start$944 = index$746, code$945 = source$744.charCodeAt(index$746), code2$946, ch1$947 = source$744[index$746], ch2$948, ch3$949, ch4$950;
        switch (code$945) {
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
            ++index$746;
            if (extra$760.tokenize) {
                if (code$945 === 40) {
                    extra$760.openParenToken = extra$760.tokens.length;
                } else if (code$945 === 123) {
                    extra$760.openCurlyToken = extra$760.tokens.length;
                }
            }
            return {
                type: Token$735.Punctuator,
                value: String.fromCharCode(code$945),
                lineNumber: lineNumber$747,
                lineStart: lineStart$748,
                range: [
                    start$944,
                    index$746
                ]
            };
        default:
            code2$946 = source$744.charCodeAt(index$746 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$946 === 61) {
                switch (code$945) {
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
                    index$746 += 2;
                    return {
                        type: Token$735.Punctuator,
                        value: String.fromCharCode(code$945) + String.fromCharCode(code2$946),
                        lineNumber: lineNumber$747,
                        lineStart: lineStart$748,
                        range: [
                            start$944,
                            index$746
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$746 += 2;
                    // !== and ===
                    if (source$744.charCodeAt(index$746) === 61) {
                        ++index$746;
                    }
                    return {
                        type: Token$735.Punctuator,
                        value: source$744.slice(start$944, index$746),
                        lineNumber: lineNumber$747,
                        lineStart: lineStart$748,
                        range: [
                            start$944,
                            index$746
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$948 = source$744[index$746 + 1];
        ch3$949 = source$744[index$746 + 2];
        ch4$950 = source$744[index$746 + 3];
        // 4-character punctuator: >>>=
        if (ch1$947 === '>' && ch2$948 === '>' && ch3$949 === '>') {
            if (ch4$950 === '=') {
                index$746 += 4;
                return {
                    type: Token$735.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$747,
                    lineStart: lineStart$748,
                    range: [
                        start$944,
                        index$746
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$947 === '>' && ch2$948 === '>' && ch3$949 === '>') {
            index$746 += 3;
            return {
                type: Token$735.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$747,
                lineStart: lineStart$748,
                range: [
                    start$944,
                    index$746
                ]
            };
        }
        if (ch1$947 === '<' && ch2$948 === '<' && ch3$949 === '=') {
            index$746 += 3;
            return {
                type: Token$735.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$747,
                lineStart: lineStart$748,
                range: [
                    start$944,
                    index$746
                ]
            };
        }
        if (ch1$947 === '>' && ch2$948 === '>' && ch3$949 === '=') {
            index$746 += 3;
            return {
                type: Token$735.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$747,
                lineStart: lineStart$748,
                range: [
                    start$944,
                    index$746
                ]
            };
        }
        if (ch1$947 === '.' && ch2$948 === '.' && ch3$949 === '.') {
            index$746 += 3;
            return {
                type: Token$735.Punctuator,
                value: '...',
                lineNumber: lineNumber$747,
                lineStart: lineStart$748,
                range: [
                    start$944,
                    index$746
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$947 === ch2$948 && '+-<>&|'.indexOf(ch1$947) >= 0) {
            index$746 += 2;
            return {
                type: Token$735.Punctuator,
                value: ch1$947 + ch2$948,
                lineNumber: lineNumber$747,
                lineStart: lineStart$748,
                range: [
                    start$944,
                    index$746
                ]
            };
        }
        if (ch1$947 === '=' && ch2$948 === '>') {
            index$746 += 2;
            return {
                type: Token$735.Punctuator,
                value: '=>',
                lineNumber: lineNumber$747,
                lineStart: lineStart$748,
                range: [
                    start$944,
                    index$746
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$947) >= 0) {
            ++index$746;
            return {
                type: Token$735.Punctuator,
                value: ch1$947,
                lineNumber: lineNumber$747,
                lineStart: lineStart$748,
                range: [
                    start$944,
                    index$746
                ]
            };
        }
        if (ch1$947 === '.') {
            ++index$746;
            return {
                type: Token$735.Punctuator,
                value: ch1$947,
                lineNumber: lineNumber$747,
                lineStart: lineStart$748,
                range: [
                    start$944,
                    index$746
                ]
            };
        }
        throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$781(start$951) {
        var number$952 = '';
        while (index$746 < length$753) {
            if (!isHexDigit$764(source$744[index$746])) {
                break;
            }
            number$952 += source$744[index$746++];
        }
        if (number$952.length === 0) {
            throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$768(source$744.charCodeAt(index$746))) {
            throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$735.NumericLiteral,
            value: parseInt('0x' + number$952, 16),
            lineNumber: lineNumber$747,
            lineStart: lineStart$748,
            range: [
                start$951,
                index$746
            ]
        };
    }
    function scanOctalLiteral$782(prefix$953, start$954) {
        var number$955, octal$956;
        if (isOctalDigit$765(prefix$953)) {
            octal$956 = true;
            number$955 = '0' + source$744[index$746++];
        } else {
            octal$956 = false;
            ++index$746;
            number$955 = '';
        }
        while (index$746 < length$753) {
            if (!isOctalDigit$765(source$744[index$746])) {
                break;
            }
            number$955 += source$744[index$746++];
        }
        if (!octal$956 && number$955.length === 0) {
            // only 0o or 0O
            throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$768(source$744.charCodeAt(index$746)) || isDecimalDigit$763(source$744.charCodeAt(index$746))) {
            throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$735.NumericLiteral,
            value: parseInt(number$955, 8),
            octal: octal$956,
            lineNumber: lineNumber$747,
            lineStart: lineStart$748,
            range: [
                start$954,
                index$746
            ]
        };
    }
    function scanNumericLiteral$783() {
        var number$957, start$958, ch$959, octal$960;
        ch$959 = source$744[index$746];
        assert$761(isDecimalDigit$763(ch$959.charCodeAt(0)) || ch$959 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$958 = index$746;
        number$957 = '';
        if (ch$959 !== '.') {
            number$957 = source$744[index$746++];
            ch$959 = source$744[index$746];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$957 === '0') {
                if (ch$959 === 'x' || ch$959 === 'X') {
                    ++index$746;
                    return scanHexLiteral$781(start$958);
                }
                if (ch$959 === 'b' || ch$959 === 'B') {
                    ++index$746;
                    number$957 = '';
                    while (index$746 < length$753) {
                        ch$959 = source$744[index$746];
                        if (ch$959 !== '0' && ch$959 !== '1') {
                            break;
                        }
                        number$957 += source$744[index$746++];
                    }
                    if (number$957.length === 0) {
                        // only 0b or 0B
                        throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$746 < length$753) {
                        ch$959 = source$744.charCodeAt(index$746);
                        if (isIdentifierStart$768(ch$959) || isDecimalDigit$763(ch$959)) {
                            throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$735.NumericLiteral,
                        value: parseInt(number$957, 2),
                        lineNumber: lineNumber$747,
                        lineStart: lineStart$748,
                        range: [
                            start$958,
                            index$746
                        ]
                    };
                }
                if (ch$959 === 'o' || ch$959 === 'O' || isOctalDigit$765(ch$959)) {
                    return scanOctalLiteral$782(ch$959, start$958);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$959 && isDecimalDigit$763(ch$959.charCodeAt(0))) {
                    throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$763(source$744.charCodeAt(index$746))) {
                number$957 += source$744[index$746++];
            }
            ch$959 = source$744[index$746];
        }
        if (ch$959 === '.') {
            number$957 += source$744[index$746++];
            while (isDecimalDigit$763(source$744.charCodeAt(index$746))) {
                number$957 += source$744[index$746++];
            }
            ch$959 = source$744[index$746];
        }
        if (ch$959 === 'e' || ch$959 === 'E') {
            number$957 += source$744[index$746++];
            ch$959 = source$744[index$746];
            if (ch$959 === '+' || ch$959 === '-') {
                number$957 += source$744[index$746++];
            }
            if (isDecimalDigit$763(source$744.charCodeAt(index$746))) {
                while (isDecimalDigit$763(source$744.charCodeAt(index$746))) {
                    number$957 += source$744[index$746++];
                }
            } else {
                throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$768(source$744.charCodeAt(index$746))) {
            throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$735.NumericLiteral,
            value: parseFloat(number$957),
            lineNumber: lineNumber$747,
            lineStart: lineStart$748,
            range: [
                start$958,
                index$746
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$784() {
        var str$961 = '', quote$962, start$963, ch$964, code$965, unescaped$966, restore$967, octal$968 = false;
        quote$962 = source$744[index$746];
        assert$761(quote$962 === '\'' || quote$962 === '"', 'String literal must starts with a quote');
        start$963 = index$746;
        ++index$746;
        while (index$746 < length$753) {
            ch$964 = source$744[index$746++];
            if (ch$964 === quote$962) {
                quote$962 = '';
                break;
            } else if (ch$964 === '\\') {
                ch$964 = source$744[index$746++];
                if (!ch$964 || !isLineTerminator$767(ch$964.charCodeAt(0))) {
                    switch (ch$964) {
                    case 'n':
                        str$961 += '\n';
                        break;
                    case 'r':
                        str$961 += '\r';
                        break;
                    case 't':
                        str$961 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$744[index$746] === '{') {
                            ++index$746;
                            str$961 += scanUnicodeCodePointEscape$776();
                        } else {
                            restore$967 = index$746;
                            unescaped$966 = scanHexEscape$775(ch$964);
                            if (unescaped$966) {
                                str$961 += unescaped$966;
                            } else {
                                index$746 = restore$967;
                                str$961 += ch$964;
                            }
                        }
                        break;
                    case 'b':
                        str$961 += '\b';
                        break;
                    case 'f':
                        str$961 += '\f';
                        break;
                    case 'v':
                        str$961 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$765(ch$964)) {
                            code$965 = '01234567'.indexOf(ch$964);
                            // \0 is not octal escape sequence
                            if (code$965 !== 0) {
                                octal$968 = true;
                            }
                            if (index$746 < length$753 && isOctalDigit$765(source$744[index$746])) {
                                octal$968 = true;
                                code$965 = code$965 * 8 + '01234567'.indexOf(source$744[index$746++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$964) >= 0 && index$746 < length$753 && isOctalDigit$765(source$744[index$746])) {
                                    code$965 = code$965 * 8 + '01234567'.indexOf(source$744[index$746++]);
                                }
                            }
                            str$961 += String.fromCharCode(code$965);
                        } else {
                            str$961 += ch$964;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$747;
                    if (ch$964 === '\r' && source$744[index$746] === '\n') {
                        ++index$746;
                    }
                }
            } else if (isLineTerminator$767(ch$964.charCodeAt(0))) {
                break;
            } else {
                str$961 += ch$964;
            }
        }
        if (quote$962 !== '') {
            throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$735.StringLiteral,
            value: str$961,
            octal: octal$968,
            lineNumber: lineNumber$747,
            lineStart: lineStart$748,
            range: [
                start$963,
                index$746
            ]
        };
    }
    function scanTemplate$785() {
        var cooked$969 = '', ch$970, start$971, terminated$972, tail$973, restore$974, unescaped$975, code$976, octal$977;
        terminated$972 = false;
        tail$973 = false;
        start$971 = index$746;
        ++index$746;
        while (index$746 < length$753) {
            ch$970 = source$744[index$746++];
            if (ch$970 === '`') {
                tail$973 = true;
                terminated$972 = true;
                break;
            } else if (ch$970 === '$') {
                if (source$744[index$746] === '{') {
                    ++index$746;
                    terminated$972 = true;
                    break;
                }
                cooked$969 += ch$970;
            } else if (ch$970 === '\\') {
                ch$970 = source$744[index$746++];
                if (!isLineTerminator$767(ch$970.charCodeAt(0))) {
                    switch (ch$970) {
                    case 'n':
                        cooked$969 += '\n';
                        break;
                    case 'r':
                        cooked$969 += '\r';
                        break;
                    case 't':
                        cooked$969 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$744[index$746] === '{') {
                            ++index$746;
                            cooked$969 += scanUnicodeCodePointEscape$776();
                        } else {
                            restore$974 = index$746;
                            unescaped$975 = scanHexEscape$775(ch$970);
                            if (unescaped$975) {
                                cooked$969 += unescaped$975;
                            } else {
                                index$746 = restore$974;
                                cooked$969 += ch$970;
                            }
                        }
                        break;
                    case 'b':
                        cooked$969 += '\b';
                        break;
                    case 'f':
                        cooked$969 += '\f';
                        break;
                    case 'v':
                        cooked$969 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$765(ch$970)) {
                            code$976 = '01234567'.indexOf(ch$970);
                            // \0 is not octal escape sequence
                            if (code$976 !== 0) {
                                octal$977 = true;
                            }
                            if (index$746 < length$753 && isOctalDigit$765(source$744[index$746])) {
                                octal$977 = true;
                                code$976 = code$976 * 8 + '01234567'.indexOf(source$744[index$746++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$970) >= 0 && index$746 < length$753 && isOctalDigit$765(source$744[index$746])) {
                                    code$976 = code$976 * 8 + '01234567'.indexOf(source$744[index$746++]);
                                }
                            }
                            cooked$969 += String.fromCharCode(code$976);
                        } else {
                            cooked$969 += ch$970;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$747;
                    if (ch$970 === '\r' && source$744[index$746] === '\n') {
                        ++index$746;
                    }
                }
            } else if (isLineTerminator$767(ch$970.charCodeAt(0))) {
                ++lineNumber$747;
                if (ch$970 === '\r' && source$744[index$746] === '\n') {
                    ++index$746;
                }
                cooked$969 += '\n';
            } else {
                cooked$969 += ch$970;
            }
        }
        if (!terminated$972) {
            throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$735.Template,
            value: {
                cooked: cooked$969,
                raw: source$744.slice(start$971 + 1, index$746 - (tail$973 ? 1 : 2))
            },
            tail: tail$973,
            octal: octal$977,
            lineNumber: lineNumber$747,
            lineStart: lineStart$748,
            range: [
                start$971,
                index$746
            ]
        };
    }
    function scanTemplateElement$786(option$978) {
        var startsWith$979, template$980;
        lookahead$757 = null;
        skipComment$774();
        startsWith$979 = option$978.head ? '`' : '}';
        if (source$744[index$746] !== startsWith$979) {
            throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
        }
        template$980 = scanTemplate$785();
        peek$792();
        return template$980;
    }
    function scanRegExp$787() {
        var str$981, ch$982, start$983, pattern$984, flags$985, value$986, classMarker$987 = false, restore$988, terminated$989 = false;
        lookahead$757 = null;
        skipComment$774();
        start$983 = index$746;
        ch$982 = source$744[index$746];
        assert$761(ch$982 === '/', 'Regular expression literal must start with a slash');
        str$981 = source$744[index$746++];
        while (index$746 < length$753) {
            ch$982 = source$744[index$746++];
            str$981 += ch$982;
            if (classMarker$987) {
                if (ch$982 === ']') {
                    classMarker$987 = false;
                }
            } else {
                if (ch$982 === '\\') {
                    ch$982 = source$744[index$746++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$767(ch$982.charCodeAt(0))) {
                        throwError$795({}, Messages$740.UnterminatedRegExp);
                    }
                    str$981 += ch$982;
                } else if (ch$982 === '/') {
                    terminated$989 = true;
                    break;
                } else if (ch$982 === '[') {
                    classMarker$987 = true;
                } else if (isLineTerminator$767(ch$982.charCodeAt(0))) {
                    throwError$795({}, Messages$740.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$989) {
            throwError$795({}, Messages$740.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$984 = str$981.substr(1, str$981.length - 2);
        flags$985 = '';
        while (index$746 < length$753) {
            ch$982 = source$744[index$746];
            if (!isIdentifierPart$769(ch$982.charCodeAt(0))) {
                break;
            }
            ++index$746;
            if (ch$982 === '\\' && index$746 < length$753) {
                ch$982 = source$744[index$746];
                if (ch$982 === 'u') {
                    ++index$746;
                    restore$988 = index$746;
                    ch$982 = scanHexEscape$775('u');
                    if (ch$982) {
                        flags$985 += ch$982;
                        for (str$981 += '\\u'; restore$988 < index$746; ++restore$988) {
                            str$981 += source$744[restore$988];
                        }
                    } else {
                        index$746 = restore$988;
                        flags$985 += 'u';
                        str$981 += '\\u';
                    }
                } else {
                    str$981 += '\\';
                }
            } else {
                flags$985 += ch$982;
                str$981 += ch$982;
            }
        }
        try {
            value$986 = new RegExp(pattern$984, flags$985);
        } catch (e$990) {
            throwError$795({}, Messages$740.InvalidRegExp);
        }
        // peek();
        if (extra$760.tokenize) {
            return {
                type: Token$735.RegularExpression,
                value: value$986,
                lineNumber: lineNumber$747,
                lineStart: lineStart$748,
                range: [
                    start$983,
                    index$746
                ]
            };
        }
        return {
            type: Token$735.RegularExpression,
            literal: str$981,
            value: value$986,
            range: [
                start$983,
                index$746
            ]
        };
    }
    function isIdentifierName$788(token$991) {
        return token$991.type === Token$735.Identifier || token$991.type === Token$735.Keyword || token$991.type === Token$735.BooleanLiteral || token$991.type === Token$735.NullLiteral;
    }
    function advanceSlash$789() {
        var prevToken$992, checkToken$993;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$992 = extra$760.tokens[extra$760.tokens.length - 1];
        if (!prevToken$992) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$787();
        }
        if (prevToken$992.type === 'Punctuator') {
            if (prevToken$992.value === ')') {
                checkToken$993 = extra$760.tokens[extra$760.openParenToken - 1];
                if (checkToken$993 && checkToken$993.type === 'Keyword' && (checkToken$993.value === 'if' || checkToken$993.value === 'while' || checkToken$993.value === 'for' || checkToken$993.value === 'with')) {
                    return scanRegExp$787();
                }
                return scanPunctuator$780();
            }
            if (prevToken$992.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$760.tokens[extra$760.openCurlyToken - 3] && extra$760.tokens[extra$760.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$993 = extra$760.tokens[extra$760.openCurlyToken - 4];
                    if (!checkToken$993) {
                        return scanPunctuator$780();
                    }
                } else if (extra$760.tokens[extra$760.openCurlyToken - 4] && extra$760.tokens[extra$760.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$993 = extra$760.tokens[extra$760.openCurlyToken - 5];
                    if (!checkToken$993) {
                        return scanRegExp$787();
                    }
                } else {
                    return scanPunctuator$780();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$737.indexOf(checkToken$993.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$780();
                }
                // It is a declaration.
                return scanRegExp$787();
            }
            return scanRegExp$787();
        }
        if (prevToken$992.type === 'Keyword') {
            return scanRegExp$787();
        }
        return scanPunctuator$780();
    }
    function advance$790() {
        var ch$994;
        skipComment$774();
        if (index$746 >= length$753) {
            return {
                type: Token$735.EOF,
                lineNumber: lineNumber$747,
                lineStart: lineStart$748,
                range: [
                    index$746,
                    index$746
                ]
            };
        }
        ch$994 = source$744.charCodeAt(index$746);
        // Very common: ( and ) and ;
        if (ch$994 === 40 || ch$994 === 41 || ch$994 === 58) {
            return scanPunctuator$780();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$994 === 39 || ch$994 === 34) {
            return scanStringLiteral$784();
        }
        if (ch$994 === 96) {
            return scanTemplate$785();
        }
        if (isIdentifierStart$768(ch$994)) {
            return scanIdentifier$779();
        }
        // # and @ are allowed for sweet.js
        if (ch$994 === 35 || ch$994 === 64) {
            ++index$746;
            return {
                type: Token$735.Punctuator,
                value: String.fromCharCode(ch$994),
                lineNumber: lineNumber$747,
                lineStart: lineStart$748,
                range: [
                    index$746 - 1,
                    index$746
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$994 === 46) {
            if (isDecimalDigit$763(source$744.charCodeAt(index$746 + 1))) {
                return scanNumericLiteral$783();
            }
            return scanPunctuator$780();
        }
        if (isDecimalDigit$763(ch$994)) {
            return scanNumericLiteral$783();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$760.tokenize && ch$994 === 47) {
            return advanceSlash$789();
        }
        return scanPunctuator$780();
    }
    function lex$791() {
        var token$995;
        token$995 = lookahead$757;
        streamIndex$756 = lookaheadIndex$758;
        lineNumber$747 = token$995.lineNumber;
        lineStart$748 = token$995.lineStart;
        sm_lineNumber$749 = lookahead$757.sm_lineNumber;
        sm_lineStart$750 = lookahead$757.sm_lineStart;
        sm_range$751 = lookahead$757.sm_range;
        sm_index$752 = lookahead$757.sm_range[0];
        lookahead$757 = tokenStream$755[++streamIndex$756].token;
        lookaheadIndex$758 = streamIndex$756;
        index$746 = lookahead$757.range[0];
        return token$995;
    }
    function peek$792() {
        lookaheadIndex$758 = streamIndex$756 + 1;
        if (lookaheadIndex$758 >= length$753) {
            lookahead$757 = {
                type: Token$735.EOF,
                lineNumber: lineNumber$747,
                lineStart: lineStart$748,
                range: [
                    index$746,
                    index$746
                ]
            };
            return;
        }
        lookahead$757 = tokenStream$755[lookaheadIndex$758].token;
        index$746 = lookahead$757.range[0];
    }
    function lookahead2$793() {
        var adv$996, pos$997, line$998, start$999, result$1000;
        if (streamIndex$756 + 1 >= length$753 || streamIndex$756 + 2 >= length$753) {
            return {
                type: Token$735.EOF,
                lineNumber: lineNumber$747,
                lineStart: lineStart$748,
                range: [
                    index$746,
                    index$746
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$757 === null) {
            lookaheadIndex$758 = streamIndex$756 + 1;
            lookahead$757 = tokenStream$755[lookaheadIndex$758].token;
            index$746 = lookahead$757.range[0];
        }
        result$1000 = tokenStream$755[lookaheadIndex$758 + 1].token;
        return result$1000;
    }
    SyntaxTreeDelegate$742 = {
        name: 'SyntaxTree',
        postProcess: function (node$1001) {
            return node$1001;
        },
        createArrayExpression: function (elements$1002) {
            return {
                type: Syntax$738.ArrayExpression,
                elements: elements$1002
            };
        },
        createAssignmentExpression: function (operator$1003, left$1004, right$1005) {
            return {
                type: Syntax$738.AssignmentExpression,
                operator: operator$1003,
                left: left$1004,
                right: right$1005
            };
        },
        createBinaryExpression: function (operator$1006, left$1007, right$1008) {
            var type$1009 = operator$1006 === '||' || operator$1006 === '&&' ? Syntax$738.LogicalExpression : Syntax$738.BinaryExpression;
            return {
                type: type$1009,
                operator: operator$1006,
                left: left$1007,
                right: right$1008
            };
        },
        createBlockStatement: function (body$1010) {
            return {
                type: Syntax$738.BlockStatement,
                body: body$1010
            };
        },
        createBreakStatement: function (label$1011) {
            return {
                type: Syntax$738.BreakStatement,
                label: label$1011
            };
        },
        createCallExpression: function (callee$1012, args$1013) {
            return {
                type: Syntax$738.CallExpression,
                callee: callee$1012,
                'arguments': args$1013
            };
        },
        createCatchClause: function (param$1014, body$1015) {
            return {
                type: Syntax$738.CatchClause,
                param: param$1014,
                body: body$1015
            };
        },
        createConditionalExpression: function (test$1016, consequent$1017, alternate$1018) {
            return {
                type: Syntax$738.ConditionalExpression,
                test: test$1016,
                consequent: consequent$1017,
                alternate: alternate$1018
            };
        },
        createContinueStatement: function (label$1019) {
            return {
                type: Syntax$738.ContinueStatement,
                label: label$1019
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$738.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1020, test$1021) {
            return {
                type: Syntax$738.DoWhileStatement,
                body: body$1020,
                test: test$1021
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$738.EmptyStatement };
        },
        createExpressionStatement: function (expression$1022) {
            return {
                type: Syntax$738.ExpressionStatement,
                expression: expression$1022
            };
        },
        createForStatement: function (init$1023, test$1024, update$1025, body$1026) {
            return {
                type: Syntax$738.ForStatement,
                init: init$1023,
                test: test$1024,
                update: update$1025,
                body: body$1026
            };
        },
        createForInStatement: function (left$1027, right$1028, body$1029) {
            return {
                type: Syntax$738.ForInStatement,
                left: left$1027,
                right: right$1028,
                body: body$1029,
                each: false
            };
        },
        createForOfStatement: function (left$1030, right$1031, body$1032) {
            return {
                type: Syntax$738.ForOfStatement,
                left: left$1030,
                right: right$1031,
                body: body$1032
            };
        },
        createFunctionDeclaration: function (id$1033, params$1034, defaults$1035, body$1036, rest$1037, generator$1038, expression$1039) {
            return {
                type: Syntax$738.FunctionDeclaration,
                id: id$1033,
                params: params$1034,
                defaults: defaults$1035,
                body: body$1036,
                rest: rest$1037,
                generator: generator$1038,
                expression: expression$1039
            };
        },
        createFunctionExpression: function (id$1040, params$1041, defaults$1042, body$1043, rest$1044, generator$1045, expression$1046) {
            return {
                type: Syntax$738.FunctionExpression,
                id: id$1040,
                params: params$1041,
                defaults: defaults$1042,
                body: body$1043,
                rest: rest$1044,
                generator: generator$1045,
                expression: expression$1046
            };
        },
        createIdentifier: function (name$1047) {
            return {
                type: Syntax$738.Identifier,
                name: name$1047
            };
        },
        createIfStatement: function (test$1048, consequent$1049, alternate$1050) {
            return {
                type: Syntax$738.IfStatement,
                test: test$1048,
                consequent: consequent$1049,
                alternate: alternate$1050
            };
        },
        createLabeledStatement: function (label$1051, body$1052) {
            return {
                type: Syntax$738.LabeledStatement,
                label: label$1051,
                body: body$1052
            };
        },
        createLiteral: function (token$1053) {
            return {
                type: Syntax$738.Literal,
                value: token$1053.value,
                raw: String(token$1053.value)
            };
        },
        createMemberExpression: function (accessor$1054, object$1055, property$1056) {
            return {
                type: Syntax$738.MemberExpression,
                computed: accessor$1054 === '[',
                object: object$1055,
                property: property$1056
            };
        },
        createNewExpression: function (callee$1057, args$1058) {
            return {
                type: Syntax$738.NewExpression,
                callee: callee$1057,
                'arguments': args$1058
            };
        },
        createObjectExpression: function (properties$1059) {
            return {
                type: Syntax$738.ObjectExpression,
                properties: properties$1059
            };
        },
        createPostfixExpression: function (operator$1060, argument$1061) {
            return {
                type: Syntax$738.UpdateExpression,
                operator: operator$1060,
                argument: argument$1061,
                prefix: false
            };
        },
        createProgram: function (body$1062) {
            return {
                type: Syntax$738.Program,
                body: body$1062
            };
        },
        createProperty: function (kind$1063, key$1064, value$1065, method$1066, shorthand$1067) {
            return {
                type: Syntax$738.Property,
                key: key$1064,
                value: value$1065,
                kind: kind$1063,
                method: method$1066,
                shorthand: shorthand$1067
            };
        },
        createReturnStatement: function (argument$1068) {
            return {
                type: Syntax$738.ReturnStatement,
                argument: argument$1068
            };
        },
        createSequenceExpression: function (expressions$1069) {
            return {
                type: Syntax$738.SequenceExpression,
                expressions: expressions$1069
            };
        },
        createSwitchCase: function (test$1070, consequent$1071) {
            return {
                type: Syntax$738.SwitchCase,
                test: test$1070,
                consequent: consequent$1071
            };
        },
        createSwitchStatement: function (discriminant$1072, cases$1073) {
            return {
                type: Syntax$738.SwitchStatement,
                discriminant: discriminant$1072,
                cases: cases$1073
            };
        },
        createThisExpression: function () {
            return { type: Syntax$738.ThisExpression };
        },
        createThrowStatement: function (argument$1074) {
            return {
                type: Syntax$738.ThrowStatement,
                argument: argument$1074
            };
        },
        createTryStatement: function (block$1075, guardedHandlers$1076, handlers$1077, finalizer$1078) {
            return {
                type: Syntax$738.TryStatement,
                block: block$1075,
                guardedHandlers: guardedHandlers$1076,
                handlers: handlers$1077,
                finalizer: finalizer$1078
            };
        },
        createUnaryExpression: function (operator$1079, argument$1080) {
            if (operator$1079 === '++' || operator$1079 === '--') {
                return {
                    type: Syntax$738.UpdateExpression,
                    operator: operator$1079,
                    argument: argument$1080,
                    prefix: true
                };
            }
            return {
                type: Syntax$738.UnaryExpression,
                operator: operator$1079,
                argument: argument$1080
            };
        },
        createVariableDeclaration: function (declarations$1081, kind$1082) {
            return {
                type: Syntax$738.VariableDeclaration,
                declarations: declarations$1081,
                kind: kind$1082
            };
        },
        createVariableDeclarator: function (id$1083, init$1084) {
            return {
                type: Syntax$738.VariableDeclarator,
                id: id$1083,
                init: init$1084
            };
        },
        createWhileStatement: function (test$1085, body$1086) {
            return {
                type: Syntax$738.WhileStatement,
                test: test$1085,
                body: body$1086
            };
        },
        createWithStatement: function (object$1087, body$1088) {
            return {
                type: Syntax$738.WithStatement,
                object: object$1087,
                body: body$1088
            };
        },
        createTemplateElement: function (value$1089, tail$1090) {
            return {
                type: Syntax$738.TemplateElement,
                value: value$1089,
                tail: tail$1090
            };
        },
        createTemplateLiteral: function (quasis$1091, expressions$1092) {
            return {
                type: Syntax$738.TemplateLiteral,
                quasis: quasis$1091,
                expressions: expressions$1092
            };
        },
        createSpreadElement: function (argument$1093) {
            return {
                type: Syntax$738.SpreadElement,
                argument: argument$1093
            };
        },
        createTaggedTemplateExpression: function (tag$1094, quasi$1095) {
            return {
                type: Syntax$738.TaggedTemplateExpression,
                tag: tag$1094,
                quasi: quasi$1095
            };
        },
        createArrowFunctionExpression: function (params$1096, defaults$1097, body$1098, rest$1099, expression$1100) {
            return {
                type: Syntax$738.ArrowFunctionExpression,
                id: null,
                params: params$1096,
                defaults: defaults$1097,
                body: body$1098,
                rest: rest$1099,
                generator: false,
                expression: expression$1100
            };
        },
        createMethodDefinition: function (propertyType$1101, kind$1102, key$1103, value$1104) {
            return {
                type: Syntax$738.MethodDefinition,
                key: key$1103,
                value: value$1104,
                kind: kind$1102,
                'static': propertyType$1101 === ClassPropertyType$743.static
            };
        },
        createClassBody: function (body$1105) {
            return {
                type: Syntax$738.ClassBody,
                body: body$1105
            };
        },
        createClassExpression: function (id$1106, superClass$1107, body$1108) {
            return {
                type: Syntax$738.ClassExpression,
                id: id$1106,
                superClass: superClass$1107,
                body: body$1108
            };
        },
        createClassDeclaration: function (id$1109, superClass$1110, body$1111) {
            return {
                type: Syntax$738.ClassDeclaration,
                id: id$1109,
                superClass: superClass$1110,
                body: body$1111
            };
        },
        createExportSpecifier: function (id$1112, name$1113) {
            return {
                type: Syntax$738.ExportSpecifier,
                id: id$1112,
                name: name$1113
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$738.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1114, specifiers$1115, source$1116) {
            return {
                type: Syntax$738.ExportDeclaration,
                declaration: declaration$1114,
                specifiers: specifiers$1115,
                source: source$1116
            };
        },
        createImportSpecifier: function (id$1117, name$1118) {
            return {
                type: Syntax$738.ImportSpecifier,
                id: id$1117,
                name: name$1118
            };
        },
        createImportDeclaration: function (specifiers$1119, kind$1120, source$1121) {
            return {
                type: Syntax$738.ImportDeclaration,
                specifiers: specifiers$1119,
                kind: kind$1120,
                source: source$1121
            };
        },
        createYieldExpression: function (argument$1122, delegate$1123) {
            return {
                type: Syntax$738.YieldExpression,
                argument: argument$1122,
                delegate: delegate$1123
            };
        },
        createModuleDeclaration: function (id$1124, source$1125, body$1126) {
            return {
                type: Syntax$738.ModuleDeclaration,
                id: id$1124,
                source: source$1125,
                body: body$1126
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$794() {
        return lookahead$757.lineNumber !== lineNumber$747;
    }
    // Throw an exception
    function throwError$795(token$1127, messageFormat$1128) {
        var error$1129, args$1130 = Array.prototype.slice.call(arguments, 2), msg$1131 = messageFormat$1128.replace(/%(\d)/g, function (whole$1132, index$1133) {
                assert$761(index$1133 < args$1130.length, 'Message reference must be in range');
                return args$1130[index$1133];
            });
        if (typeof token$1127.lineNumber === 'number') {
            error$1129 = new Error('Line ' + token$1127.lineNumber + ': ' + msg$1131);
            error$1129.index = token$1127.range[0];
            error$1129.lineNumber = token$1127.lineNumber;
            error$1129.column = token$1127.range[0] - lineStart$748 + 1;
        } else {
            error$1129 = new Error('Line ' + lineNumber$747 + ': ' + msg$1131);
            error$1129.index = index$746;
            error$1129.lineNumber = lineNumber$747;
            error$1129.column = index$746 - lineStart$748 + 1;
        }
        error$1129.description = msg$1131;
        throw error$1129;
    }
    function throwErrorTolerant$796() {
        try {
            throwError$795.apply(null, arguments);
        } catch (e$1134) {
            if (extra$760.errors) {
                extra$760.errors.push(e$1134);
            } else {
                throw e$1134;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$797(token$1135) {
        if (token$1135.type === Token$735.EOF) {
            throwError$795(token$1135, Messages$740.UnexpectedEOS);
        }
        if (token$1135.type === Token$735.NumericLiteral) {
            throwError$795(token$1135, Messages$740.UnexpectedNumber);
        }
        if (token$1135.type === Token$735.StringLiteral) {
            throwError$795(token$1135, Messages$740.UnexpectedString);
        }
        if (token$1135.type === Token$735.Identifier) {
            throwError$795(token$1135, Messages$740.UnexpectedIdentifier);
        }
        if (token$1135.type === Token$735.Keyword) {
            if (isFutureReservedWord$770(token$1135.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$745 && isStrictModeReservedWord$771(token$1135.value)) {
                throwErrorTolerant$796(token$1135, Messages$740.StrictReservedWord);
                return;
            }
            throwError$795(token$1135, Messages$740.UnexpectedToken, token$1135.value);
        }
        if (token$1135.type === Token$735.Template) {
            throwError$795(token$1135, Messages$740.UnexpectedTemplate, token$1135.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$795(token$1135, Messages$740.UnexpectedToken, token$1135.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$798(value$1136) {
        var token$1137 = lex$791();
        if (token$1137.type !== Token$735.Punctuator || token$1137.value !== value$1136) {
            throwUnexpected$797(token$1137);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$799(keyword$1138) {
        var token$1139 = lex$791();
        if (token$1139.type !== Token$735.Keyword || token$1139.value !== keyword$1138) {
            throwUnexpected$797(token$1139);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$800(value$1140) {
        return lookahead$757.type === Token$735.Punctuator && lookahead$757.value === value$1140;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$801(keyword$1141) {
        return lookahead$757.type === Token$735.Keyword && lookahead$757.value === keyword$1141;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$802(keyword$1142) {
        return lookahead$757.type === Token$735.Identifier && lookahead$757.value === keyword$1142;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$803() {
        var op$1143;
        if (lookahead$757.type !== Token$735.Punctuator) {
            return false;
        }
        op$1143 = lookahead$757.value;
        return op$1143 === '=' || op$1143 === '*=' || op$1143 === '/=' || op$1143 === '%=' || op$1143 === '+=' || op$1143 === '-=' || op$1143 === '<<=' || op$1143 === '>>=' || op$1143 === '>>>=' || op$1143 === '&=' || op$1143 === '^=' || op$1143 === '|=';
    }
    function consumeSemicolon$804() {
        var line$1144, ch$1145;
        ch$1145 = lookahead$757.value ? lookahead$757.value.charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1145 === 59) {
            lex$791();
            return;
        }
        if (lookahead$757.lineNumber !== lineNumber$747) {
            return;
        }
        if (match$800(';')) {
            lex$791();
            return;
        }
        if (lookahead$757.type !== Token$735.EOF && !match$800('}')) {
            throwUnexpected$797(lookahead$757);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$805(expr$1146) {
        return expr$1146.type === Syntax$738.Identifier || expr$1146.type === Syntax$738.MemberExpression;
    }
    function isAssignableLeftHandSide$806(expr$1147) {
        return isLeftHandSide$805(expr$1147) || expr$1147.type === Syntax$738.ObjectPattern || expr$1147.type === Syntax$738.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$807() {
        var elements$1148 = [], blocks$1149 = [], filter$1150 = null, tmp$1151, possiblecomprehension$1152 = true, body$1153;
        expect$798('[');
        while (!match$800(']')) {
            if (lookahead$757.value === 'for' && lookahead$757.type === Token$735.Keyword) {
                if (!possiblecomprehension$1152) {
                    throwError$795({}, Messages$740.ComprehensionError);
                }
                matchKeyword$801('for');
                tmp$1151 = parseForStatement$855({ ignoreBody: true });
                tmp$1151.of = tmp$1151.type === Syntax$738.ForOfStatement;
                tmp$1151.type = Syntax$738.ComprehensionBlock;
                if (tmp$1151.left.kind) {
                    // can't be let or const
                    throwError$795({}, Messages$740.ComprehensionError);
                }
                blocks$1149.push(tmp$1151);
            } else if (lookahead$757.value === 'if' && lookahead$757.type === Token$735.Keyword) {
                if (!possiblecomprehension$1152) {
                    throwError$795({}, Messages$740.ComprehensionError);
                }
                expectKeyword$799('if');
                expect$798('(');
                filter$1150 = parseExpression$835();
                expect$798(')');
            } else if (lookahead$757.value === ',' && lookahead$757.type === Token$735.Punctuator) {
                possiblecomprehension$1152 = false;
                // no longer allowed.
                lex$791();
                elements$1148.push(null);
            } else {
                tmp$1151 = parseSpreadOrAssignmentExpression$818();
                elements$1148.push(tmp$1151);
                if (tmp$1151 && tmp$1151.type === Syntax$738.SpreadElement) {
                    if (!match$800(']')) {
                        throwError$795({}, Messages$740.ElementAfterSpreadElement);
                    }
                } else if (!(match$800(']') || matchKeyword$801('for') || matchKeyword$801('if'))) {
                    expect$798(',');
                    // this lexes.
                    possiblecomprehension$1152 = false;
                }
            }
        }
        expect$798(']');
        if (filter$1150 && !blocks$1149.length) {
            throwError$795({}, Messages$740.ComprehensionRequiresBlock);
        }
        if (blocks$1149.length) {
            if (elements$1148.length !== 1) {
                throwError$795({}, Messages$740.ComprehensionError);
            }
            return {
                type: Syntax$738.ComprehensionExpression,
                filter: filter$1150,
                blocks: blocks$1149,
                body: elements$1148[0]
            };
        }
        return delegate$754.createArrayExpression(elements$1148);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$808(options$1154) {
        var previousStrict$1155, previousYieldAllowed$1156, params$1157, defaults$1158, body$1159;
        previousStrict$1155 = strict$745;
        previousYieldAllowed$1156 = state$759.yieldAllowed;
        state$759.yieldAllowed = options$1154.generator;
        params$1157 = options$1154.params || [];
        defaults$1158 = options$1154.defaults || [];
        body$1159 = parseConciseBody$867();
        if (options$1154.name && strict$745 && isRestrictedWord$772(params$1157[0].name)) {
            throwErrorTolerant$796(options$1154.name, Messages$740.StrictParamName);
        }
        if (state$759.yieldAllowed && !state$759.yieldFound) {
            throwErrorTolerant$796({}, Messages$740.NoYieldInGenerator);
        }
        strict$745 = previousStrict$1155;
        state$759.yieldAllowed = previousYieldAllowed$1156;
        return delegate$754.createFunctionExpression(null, params$1157, defaults$1158, body$1159, options$1154.rest || null, options$1154.generator, body$1159.type !== Syntax$738.BlockStatement);
    }
    function parsePropertyMethodFunction$809(options$1160) {
        var previousStrict$1161, tmp$1162, method$1163;
        previousStrict$1161 = strict$745;
        strict$745 = true;
        tmp$1162 = parseParams$871();
        if (tmp$1162.stricted) {
            throwErrorTolerant$796(tmp$1162.stricted, tmp$1162.message);
        }
        method$1163 = parsePropertyFunction$808({
            params: tmp$1162.params,
            defaults: tmp$1162.defaults,
            rest: tmp$1162.rest,
            generator: options$1160.generator
        });
        strict$745 = previousStrict$1161;
        return method$1163;
    }
    function parseObjectPropertyKey$810() {
        var token$1164 = lex$791();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1164.type === Token$735.StringLiteral || token$1164.type === Token$735.NumericLiteral) {
            if (strict$745 && token$1164.octal) {
                throwErrorTolerant$796(token$1164, Messages$740.StrictOctalLiteral);
            }
            return delegate$754.createLiteral(token$1164);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$754.createIdentifier(token$1164.value);
    }
    function parseObjectProperty$811() {
        var token$1165, key$1166, id$1167, value$1168, param$1169;
        token$1165 = lookahead$757;
        if (token$1165.type === Token$735.Identifier) {
            id$1167 = parseObjectPropertyKey$810();
            // Property Assignment: Getter and Setter.
            if (token$1165.value === 'get' && !(match$800(':') || match$800('('))) {
                key$1166 = parseObjectPropertyKey$810();
                expect$798('(');
                expect$798(')');
                return delegate$754.createProperty('get', key$1166, parsePropertyFunction$808({ generator: false }), false, false);
            }
            if (token$1165.value === 'set' && !(match$800(':') || match$800('('))) {
                key$1166 = parseObjectPropertyKey$810();
                expect$798('(');
                token$1165 = lookahead$757;
                param$1169 = [parseVariableIdentifier$838()];
                expect$798(')');
                return delegate$754.createProperty('set', key$1166, parsePropertyFunction$808({
                    params: param$1169,
                    generator: false,
                    name: token$1165
                }), false, false);
            }
            if (match$800(':')) {
                lex$791();
                return delegate$754.createProperty('init', id$1167, parseAssignmentExpression$834(), false, false);
            }
            if (match$800('(')) {
                return delegate$754.createProperty('init', id$1167, parsePropertyMethodFunction$809({ generator: false }), true, false);
            }
            return delegate$754.createProperty('init', id$1167, id$1167, false, true);
        }
        if (token$1165.type === Token$735.EOF || token$1165.type === Token$735.Punctuator) {
            if (!match$800('*')) {
                throwUnexpected$797(token$1165);
            }
            lex$791();
            id$1167 = parseObjectPropertyKey$810();
            if (!match$800('(')) {
                throwUnexpected$797(lex$791());
            }
            return delegate$754.createProperty('init', id$1167, parsePropertyMethodFunction$809({ generator: true }), true, false);
        }
        key$1166 = parseObjectPropertyKey$810();
        if (match$800(':')) {
            lex$791();
            return delegate$754.createProperty('init', key$1166, parseAssignmentExpression$834(), false, false);
        }
        if (match$800('(')) {
            return delegate$754.createProperty('init', key$1166, parsePropertyMethodFunction$809({ generator: false }), true, false);
        }
        throwUnexpected$797(lex$791());
    }
    function parseObjectInitialiser$812() {
        var properties$1170 = [], property$1171, name$1172, key$1173, kind$1174, map$1175 = {}, toString$1176 = String;
        expect$798('{');
        while (!match$800('}')) {
            property$1171 = parseObjectProperty$811();
            if (property$1171.key.type === Syntax$738.Identifier) {
                name$1172 = property$1171.key.name;
            } else {
                name$1172 = toString$1176(property$1171.key.value);
            }
            kind$1174 = property$1171.kind === 'init' ? PropertyKind$739.Data : property$1171.kind === 'get' ? PropertyKind$739.Get : PropertyKind$739.Set;
            key$1173 = '$' + name$1172;
            if (Object.prototype.hasOwnProperty.call(map$1175, key$1173)) {
                if (map$1175[key$1173] === PropertyKind$739.Data) {
                    if (strict$745 && kind$1174 === PropertyKind$739.Data) {
                        throwErrorTolerant$796({}, Messages$740.StrictDuplicateProperty);
                    } else if (kind$1174 !== PropertyKind$739.Data) {
                        throwErrorTolerant$796({}, Messages$740.AccessorDataProperty);
                    }
                } else {
                    if (kind$1174 === PropertyKind$739.Data) {
                        throwErrorTolerant$796({}, Messages$740.AccessorDataProperty);
                    } else if (map$1175[key$1173] & kind$1174) {
                        throwErrorTolerant$796({}, Messages$740.AccessorGetSet);
                    }
                }
                map$1175[key$1173] |= kind$1174;
            } else {
                map$1175[key$1173] = kind$1174;
            }
            properties$1170.push(property$1171);
            if (!match$800('}')) {
                expect$798(',');
            }
        }
        expect$798('}');
        return delegate$754.createObjectExpression(properties$1170);
    }
    function parseTemplateElement$813(option$1177) {
        var token$1178 = scanTemplateElement$786(option$1177);
        if (strict$745 && token$1178.octal) {
            throwError$795(token$1178, Messages$740.StrictOctalLiteral);
        }
        return delegate$754.createTemplateElement({
            raw: token$1178.value.raw,
            cooked: token$1178.value.cooked
        }, token$1178.tail);
    }
    function parseTemplateLiteral$814() {
        var quasi$1179, quasis$1180, expressions$1181;
        quasi$1179 = parseTemplateElement$813({ head: true });
        quasis$1180 = [quasi$1179];
        expressions$1181 = [];
        while (!quasi$1179.tail) {
            expressions$1181.push(parseExpression$835());
            quasi$1179 = parseTemplateElement$813({ head: false });
            quasis$1180.push(quasi$1179);
        }
        return delegate$754.createTemplateLiteral(quasis$1180, expressions$1181);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$815() {
        var expr$1182;
        expect$798('(');
        ++state$759.parenthesizedCount;
        expr$1182 = parseExpression$835();
        expect$798(')');
        return expr$1182;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$816() {
        var type$1183, token$1184, resolvedIdent$1185;
        token$1184 = lookahead$757;
        type$1183 = lookahead$757.type;
        if (type$1183 === Token$735.Identifier) {
            resolvedIdent$1185 = expander$734.resolve(tokenStream$755[lookaheadIndex$758]);
            lex$791();
            return delegate$754.createIdentifier(resolvedIdent$1185);
        }
        if (type$1183 === Token$735.StringLiteral || type$1183 === Token$735.NumericLiteral) {
            if (strict$745 && lookahead$757.octal) {
                throwErrorTolerant$796(lookahead$757, Messages$740.StrictOctalLiteral);
            }
            return delegate$754.createLiteral(lex$791());
        }
        if (type$1183 === Token$735.Keyword) {
            if (matchKeyword$801('this')) {
                lex$791();
                return delegate$754.createThisExpression();
            }
            if (matchKeyword$801('function')) {
                return parseFunctionExpression$873();
            }
            if (matchKeyword$801('class')) {
                return parseClassExpression$878();
            }
            if (matchKeyword$801('super')) {
                lex$791();
                return delegate$754.createIdentifier('super');
            }
        }
        if (type$1183 === Token$735.BooleanLiteral) {
            token$1184 = lex$791();
            token$1184.value = token$1184.value === 'true';
            return delegate$754.createLiteral(token$1184);
        }
        if (type$1183 === Token$735.NullLiteral) {
            token$1184 = lex$791();
            token$1184.value = null;
            return delegate$754.createLiteral(token$1184);
        }
        if (match$800('[')) {
            return parseArrayInitialiser$807();
        }
        if (match$800('{')) {
            return parseObjectInitialiser$812();
        }
        if (match$800('(')) {
            return parseGroupExpression$815();
        }
        if (lookahead$757.type === Token$735.RegularExpression) {
            return delegate$754.createLiteral(lex$791());
        }
        if (type$1183 === Token$735.Template) {
            return parseTemplateLiteral$814();
        }
        return throwUnexpected$797(lex$791());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$817() {
        var args$1186 = [], arg$1187;
        expect$798('(');
        if (!match$800(')')) {
            while (streamIndex$756 < length$753) {
                arg$1187 = parseSpreadOrAssignmentExpression$818();
                args$1186.push(arg$1187);
                if (match$800(')')) {
                    break;
                } else if (arg$1187.type === Syntax$738.SpreadElement) {
                    throwError$795({}, Messages$740.ElementAfterSpreadElement);
                }
                expect$798(',');
            }
        }
        expect$798(')');
        return args$1186;
    }
    function parseSpreadOrAssignmentExpression$818() {
        if (match$800('...')) {
            lex$791();
            return delegate$754.createSpreadElement(parseAssignmentExpression$834());
        }
        return parseAssignmentExpression$834();
    }
    function parseNonComputedProperty$819() {
        var token$1188 = lex$791();
        if (!isIdentifierName$788(token$1188)) {
            throwUnexpected$797(token$1188);
        }
        return delegate$754.createIdentifier(token$1188.value);
    }
    function parseNonComputedMember$820() {
        expect$798('.');
        return parseNonComputedProperty$819();
    }
    function parseComputedMember$821() {
        var expr$1189;
        expect$798('[');
        expr$1189 = parseExpression$835();
        expect$798(']');
        return expr$1189;
    }
    function parseNewExpression$822() {
        var callee$1190, args$1191;
        expectKeyword$799('new');
        callee$1190 = parseLeftHandSideExpression$824();
        args$1191 = match$800('(') ? parseArguments$817() : [];
        return delegate$754.createNewExpression(callee$1190, args$1191);
    }
    function parseLeftHandSideExpressionAllowCall$823() {
        var expr$1192, args$1193, property$1194;
        expr$1192 = matchKeyword$801('new') ? parseNewExpression$822() : parsePrimaryExpression$816();
        while (match$800('.') || match$800('[') || match$800('(') || lookahead$757.type === Token$735.Template) {
            if (match$800('(')) {
                args$1193 = parseArguments$817();
                expr$1192 = delegate$754.createCallExpression(expr$1192, args$1193);
            } else if (match$800('[')) {
                expr$1192 = delegate$754.createMemberExpression('[', expr$1192, parseComputedMember$821());
            } else if (match$800('.')) {
                expr$1192 = delegate$754.createMemberExpression('.', expr$1192, parseNonComputedMember$820());
            } else {
                expr$1192 = delegate$754.createTaggedTemplateExpression(expr$1192, parseTemplateLiteral$814());
            }
        }
        return expr$1192;
    }
    function parseLeftHandSideExpression$824() {
        var expr$1195, property$1196;
        expr$1195 = matchKeyword$801('new') ? parseNewExpression$822() : parsePrimaryExpression$816();
        while (match$800('.') || match$800('[') || lookahead$757.type === Token$735.Template) {
            if (match$800('[')) {
                expr$1195 = delegate$754.createMemberExpression('[', expr$1195, parseComputedMember$821());
            } else if (match$800('.')) {
                expr$1195 = delegate$754.createMemberExpression('.', expr$1195, parseNonComputedMember$820());
            } else {
                expr$1195 = delegate$754.createTaggedTemplateExpression(expr$1195, parseTemplateLiteral$814());
            }
        }
        return expr$1195;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$825() {
        var expr$1197 = parseLeftHandSideExpressionAllowCall$823(), token$1198 = lookahead$757;
        if (lookahead$757.type !== Token$735.Punctuator) {
            return expr$1197;
        }
        if ((match$800('++') || match$800('--')) && !peekLineTerminator$794()) {
            // 11.3.1, 11.3.2
            if (strict$745 && expr$1197.type === Syntax$738.Identifier && isRestrictedWord$772(expr$1197.name)) {
                throwErrorTolerant$796({}, Messages$740.StrictLHSPostfix);
            }
            if (!isLeftHandSide$805(expr$1197)) {
                throwError$795({}, Messages$740.InvalidLHSInAssignment);
            }
            token$1198 = lex$791();
            expr$1197 = delegate$754.createPostfixExpression(token$1198.value, expr$1197);
        }
        return expr$1197;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$826() {
        var token$1199, expr$1200;
        if (lookahead$757.type !== Token$735.Punctuator && lookahead$757.type !== Token$735.Keyword) {
            return parsePostfixExpression$825();
        }
        if (match$800('++') || match$800('--')) {
            token$1199 = lex$791();
            expr$1200 = parseUnaryExpression$826();
            // 11.4.4, 11.4.5
            if (strict$745 && expr$1200.type === Syntax$738.Identifier && isRestrictedWord$772(expr$1200.name)) {
                throwErrorTolerant$796({}, Messages$740.StrictLHSPrefix);
            }
            if (!isLeftHandSide$805(expr$1200)) {
                throwError$795({}, Messages$740.InvalidLHSInAssignment);
            }
            return delegate$754.createUnaryExpression(token$1199.value, expr$1200);
        }
        if (match$800('+') || match$800('-') || match$800('~') || match$800('!')) {
            token$1199 = lex$791();
            expr$1200 = parseUnaryExpression$826();
            return delegate$754.createUnaryExpression(token$1199.value, expr$1200);
        }
        if (matchKeyword$801('delete') || matchKeyword$801('void') || matchKeyword$801('typeof')) {
            token$1199 = lex$791();
            expr$1200 = parseUnaryExpression$826();
            expr$1200 = delegate$754.createUnaryExpression(token$1199.value, expr$1200);
            if (strict$745 && expr$1200.operator === 'delete' && expr$1200.argument.type === Syntax$738.Identifier) {
                throwErrorTolerant$796({}, Messages$740.StrictDelete);
            }
            return expr$1200;
        }
        return parsePostfixExpression$825();
    }
    function binaryPrecedence$827(token$1201, allowIn$1202) {
        var prec$1203 = 0;
        if (token$1201.type !== Token$735.Punctuator && token$1201.type !== Token$735.Keyword) {
            return 0;
        }
        switch (token$1201.value) {
        case '||':
            prec$1203 = 1;
            break;
        case '&&':
            prec$1203 = 2;
            break;
        case '|':
            prec$1203 = 3;
            break;
        case '^':
            prec$1203 = 4;
            break;
        case '&':
            prec$1203 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1203 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1203 = 7;
            break;
        case 'in':
            prec$1203 = allowIn$1202 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1203 = 8;
            break;
        case '+':
        case '-':
            prec$1203 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1203 = 11;
            break;
        default:
            break;
        }
        return prec$1203;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$828() {
        var expr$1204, token$1205, prec$1206, previousAllowIn$1207, stack$1208, right$1209, operator$1210, left$1211, i$1212;
        previousAllowIn$1207 = state$759.allowIn;
        state$759.allowIn = true;
        expr$1204 = parseUnaryExpression$826();
        token$1205 = lookahead$757;
        prec$1206 = binaryPrecedence$827(token$1205, previousAllowIn$1207);
        if (prec$1206 === 0) {
            return expr$1204;
        }
        token$1205.prec = prec$1206;
        lex$791();
        stack$1208 = [
            expr$1204,
            token$1205,
            parseUnaryExpression$826()
        ];
        while ((prec$1206 = binaryPrecedence$827(lookahead$757, previousAllowIn$1207)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1208.length > 2 && prec$1206 <= stack$1208[stack$1208.length - 2].prec) {
                right$1209 = stack$1208.pop();
                operator$1210 = stack$1208.pop().value;
                left$1211 = stack$1208.pop();
                stack$1208.push(delegate$754.createBinaryExpression(operator$1210, left$1211, right$1209));
            }
            // Shift.
            token$1205 = lex$791();
            token$1205.prec = prec$1206;
            stack$1208.push(token$1205);
            stack$1208.push(parseUnaryExpression$826());
        }
        state$759.allowIn = previousAllowIn$1207;
        // Final reduce to clean-up the stack.
        i$1212 = stack$1208.length - 1;
        expr$1204 = stack$1208[i$1212];
        while (i$1212 > 1) {
            expr$1204 = delegate$754.createBinaryExpression(stack$1208[i$1212 - 1].value, stack$1208[i$1212 - 2], expr$1204);
            i$1212 -= 2;
        }
        return expr$1204;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$829() {
        var expr$1213, previousAllowIn$1214, consequent$1215, alternate$1216;
        expr$1213 = parseBinaryExpression$828();
        if (match$800('?')) {
            lex$791();
            previousAllowIn$1214 = state$759.allowIn;
            state$759.allowIn = true;
            consequent$1215 = parseAssignmentExpression$834();
            state$759.allowIn = previousAllowIn$1214;
            expect$798(':');
            alternate$1216 = parseAssignmentExpression$834();
            expr$1213 = delegate$754.createConditionalExpression(expr$1213, consequent$1215, alternate$1216);
        }
        return expr$1213;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$830(expr$1217) {
        var i$1218, len$1219, property$1220, element$1221;
        if (expr$1217.type === Syntax$738.ObjectExpression) {
            expr$1217.type = Syntax$738.ObjectPattern;
            for (i$1218 = 0, len$1219 = expr$1217.properties.length; i$1218 < len$1219; i$1218 += 1) {
                property$1220 = expr$1217.properties[i$1218];
                if (property$1220.kind !== 'init') {
                    throwError$795({}, Messages$740.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$830(property$1220.value);
            }
        } else if (expr$1217.type === Syntax$738.ArrayExpression) {
            expr$1217.type = Syntax$738.ArrayPattern;
            for (i$1218 = 0, len$1219 = expr$1217.elements.length; i$1218 < len$1219; i$1218 += 1) {
                element$1221 = expr$1217.elements[i$1218];
                if (element$1221) {
                    reinterpretAsAssignmentBindingPattern$830(element$1221);
                }
            }
        } else if (expr$1217.type === Syntax$738.Identifier) {
            if (isRestrictedWord$772(expr$1217.name)) {
                throwError$795({}, Messages$740.InvalidLHSInAssignment);
            }
        } else if (expr$1217.type === Syntax$738.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$830(expr$1217.argument);
            if (expr$1217.argument.type === Syntax$738.ObjectPattern) {
                throwError$795({}, Messages$740.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1217.type !== Syntax$738.MemberExpression && expr$1217.type !== Syntax$738.CallExpression && expr$1217.type !== Syntax$738.NewExpression) {
                throwError$795({}, Messages$740.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$831(options$1222, expr$1223) {
        var i$1224, len$1225, property$1226, element$1227;
        if (expr$1223.type === Syntax$738.ObjectExpression) {
            expr$1223.type = Syntax$738.ObjectPattern;
            for (i$1224 = 0, len$1225 = expr$1223.properties.length; i$1224 < len$1225; i$1224 += 1) {
                property$1226 = expr$1223.properties[i$1224];
                if (property$1226.kind !== 'init') {
                    throwError$795({}, Messages$740.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$831(options$1222, property$1226.value);
            }
        } else if (expr$1223.type === Syntax$738.ArrayExpression) {
            expr$1223.type = Syntax$738.ArrayPattern;
            for (i$1224 = 0, len$1225 = expr$1223.elements.length; i$1224 < len$1225; i$1224 += 1) {
                element$1227 = expr$1223.elements[i$1224];
                if (element$1227) {
                    reinterpretAsDestructuredParameter$831(options$1222, element$1227);
                }
            }
        } else if (expr$1223.type === Syntax$738.Identifier) {
            validateParam$869(options$1222, expr$1223, expr$1223.name);
        } else {
            if (expr$1223.type !== Syntax$738.MemberExpression) {
                throwError$795({}, Messages$740.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$832(expressions$1228) {
        var i$1229, len$1230, param$1231, params$1232, defaults$1233, defaultCount$1234, options$1235, rest$1236;
        params$1232 = [];
        defaults$1233 = [];
        defaultCount$1234 = 0;
        rest$1236 = null;
        options$1235 = { paramSet: {} };
        for (i$1229 = 0, len$1230 = expressions$1228.length; i$1229 < len$1230; i$1229 += 1) {
            param$1231 = expressions$1228[i$1229];
            if (param$1231.type === Syntax$738.Identifier) {
                params$1232.push(param$1231);
                defaults$1233.push(null);
                validateParam$869(options$1235, param$1231, param$1231.name);
            } else if (param$1231.type === Syntax$738.ObjectExpression || param$1231.type === Syntax$738.ArrayExpression) {
                reinterpretAsDestructuredParameter$831(options$1235, param$1231);
                params$1232.push(param$1231);
                defaults$1233.push(null);
            } else if (param$1231.type === Syntax$738.SpreadElement) {
                assert$761(i$1229 === len$1230 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$831(options$1235, param$1231.argument);
                rest$1236 = param$1231.argument;
            } else if (param$1231.type === Syntax$738.AssignmentExpression) {
                params$1232.push(param$1231.left);
                defaults$1233.push(param$1231.right);
                ++defaultCount$1234;
                validateParam$869(options$1235, param$1231.left, param$1231.left.name);
            } else {
                return null;
            }
        }
        if (options$1235.message === Messages$740.StrictParamDupe) {
            throwError$795(strict$745 ? options$1235.stricted : options$1235.firstRestricted, options$1235.message);
        }
        if (defaultCount$1234 === 0) {
            defaults$1233 = [];
        }
        return {
            params: params$1232,
            defaults: defaults$1233,
            rest: rest$1236,
            stricted: options$1235.stricted,
            firstRestricted: options$1235.firstRestricted,
            message: options$1235.message
        };
    }
    function parseArrowFunctionExpression$833(options$1237) {
        var previousStrict$1238, previousYieldAllowed$1239, body$1240;
        expect$798('=>');
        previousStrict$1238 = strict$745;
        previousYieldAllowed$1239 = state$759.yieldAllowed;
        state$759.yieldAllowed = false;
        body$1240 = parseConciseBody$867();
        if (strict$745 && options$1237.firstRestricted) {
            throwError$795(options$1237.firstRestricted, options$1237.message);
        }
        if (strict$745 && options$1237.stricted) {
            throwErrorTolerant$796(options$1237.stricted, options$1237.message);
        }
        strict$745 = previousStrict$1238;
        state$759.yieldAllowed = previousYieldAllowed$1239;
        return delegate$754.createArrowFunctionExpression(options$1237.params, options$1237.defaults, body$1240, options$1237.rest, body$1240.type !== Syntax$738.BlockStatement);
    }
    function parseAssignmentExpression$834() {
        var expr$1241, token$1242, params$1243, oldParenthesizedCount$1244;
        if (matchKeyword$801('yield')) {
            return parseYieldExpression$874();
        }
        oldParenthesizedCount$1244 = state$759.parenthesizedCount;
        if (match$800('(')) {
            token$1242 = lookahead2$793();
            if (token$1242.type === Token$735.Punctuator && token$1242.value === ')' || token$1242.value === '...') {
                params$1243 = parseParams$871();
                if (!match$800('=>')) {
                    throwUnexpected$797(lex$791());
                }
                return parseArrowFunctionExpression$833(params$1243);
            }
        }
        token$1242 = lookahead$757;
        expr$1241 = parseConditionalExpression$829();
        if (match$800('=>') && (state$759.parenthesizedCount === oldParenthesizedCount$1244 || state$759.parenthesizedCount === oldParenthesizedCount$1244 + 1)) {
            if (expr$1241.type === Syntax$738.Identifier) {
                params$1243 = reinterpretAsCoverFormalsList$832([expr$1241]);
            } else if (expr$1241.type === Syntax$738.SequenceExpression) {
                params$1243 = reinterpretAsCoverFormalsList$832(expr$1241.expressions);
            }
            if (params$1243) {
                return parseArrowFunctionExpression$833(params$1243);
            }
        }
        if (matchAssign$803()) {
            // 11.13.1
            if (strict$745 && expr$1241.type === Syntax$738.Identifier && isRestrictedWord$772(expr$1241.name)) {
                throwErrorTolerant$796(token$1242, Messages$740.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$800('=') && (expr$1241.type === Syntax$738.ObjectExpression || expr$1241.type === Syntax$738.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$830(expr$1241);
            } else if (!isLeftHandSide$805(expr$1241)) {
                throwError$795({}, Messages$740.InvalidLHSInAssignment);
            }
            expr$1241 = delegate$754.createAssignmentExpression(lex$791().value, expr$1241, parseAssignmentExpression$834());
        }
        return expr$1241;
    }
    // 11.14 Comma Operator
    function parseExpression$835() {
        var expr$1245, expressions$1246, sequence$1247, coverFormalsList$1248, spreadFound$1249, oldParenthesizedCount$1250;
        oldParenthesizedCount$1250 = state$759.parenthesizedCount;
        expr$1245 = parseAssignmentExpression$834();
        expressions$1246 = [expr$1245];
        if (match$800(',')) {
            while (streamIndex$756 < length$753) {
                if (!match$800(',')) {
                    break;
                }
                lex$791();
                expr$1245 = parseSpreadOrAssignmentExpression$818();
                expressions$1246.push(expr$1245);
                if (expr$1245.type === Syntax$738.SpreadElement) {
                    spreadFound$1249 = true;
                    if (!match$800(')')) {
                        throwError$795({}, Messages$740.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1247 = delegate$754.createSequenceExpression(expressions$1246);
        }
        if (match$800('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$759.parenthesizedCount === oldParenthesizedCount$1250 || state$759.parenthesizedCount === oldParenthesizedCount$1250 + 1) {
                expr$1245 = expr$1245.type === Syntax$738.SequenceExpression ? expr$1245.expressions : expressions$1246;
                coverFormalsList$1248 = reinterpretAsCoverFormalsList$832(expr$1245);
                if (coverFormalsList$1248) {
                    return parseArrowFunctionExpression$833(coverFormalsList$1248);
                }
            }
            throwUnexpected$797(lex$791());
        }
        if (spreadFound$1249 && lookahead2$793().value !== '=>') {
            throwError$795({}, Messages$740.IllegalSpread);
        }
        return sequence$1247 || expr$1245;
    }
    // 12.1 Block
    function parseStatementList$836() {
        var list$1251 = [], statement$1252;
        while (streamIndex$756 < length$753) {
            if (match$800('}')) {
                break;
            }
            statement$1252 = parseSourceElement$881();
            if (typeof statement$1252 === 'undefined') {
                break;
            }
            list$1251.push(statement$1252);
        }
        return list$1251;
    }
    function parseBlock$837() {
        var block$1253;
        expect$798('{');
        block$1253 = parseStatementList$836();
        expect$798('}');
        return delegate$754.createBlockStatement(block$1253);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$838() {
        var token$1254 = lookahead$757, resolvedIdent$1255;
        if (token$1254.type !== Token$735.Identifier) {
            throwUnexpected$797(token$1254);
        }
        resolvedIdent$1255 = expander$734.resolve(tokenStream$755[lookaheadIndex$758]);
        lex$791();
        return delegate$754.createIdentifier(resolvedIdent$1255);
    }
    function parseVariableDeclaration$839(kind$1256) {
        var id$1257, init$1258 = null;
        if (match$800('{')) {
            id$1257 = parseObjectInitialiser$812();
            reinterpretAsAssignmentBindingPattern$830(id$1257);
        } else if (match$800('[')) {
            id$1257 = parseArrayInitialiser$807();
            reinterpretAsAssignmentBindingPattern$830(id$1257);
        } else {
            id$1257 = state$759.allowKeyword ? parseNonComputedProperty$819() : parseVariableIdentifier$838();
            // 12.2.1
            if (strict$745 && isRestrictedWord$772(id$1257.name)) {
                throwErrorTolerant$796({}, Messages$740.StrictVarName);
            }
        }
        if (kind$1256 === 'const') {
            if (!match$800('=')) {
                throwError$795({}, Messages$740.NoUnintializedConst);
            }
            expect$798('=');
            init$1258 = parseAssignmentExpression$834();
        } else if (match$800('=')) {
            lex$791();
            init$1258 = parseAssignmentExpression$834();
        }
        return delegate$754.createVariableDeclarator(id$1257, init$1258);
    }
    function parseVariableDeclarationList$840(kind$1259) {
        var list$1260 = [];
        do {
            list$1260.push(parseVariableDeclaration$839(kind$1259));
            if (!match$800(',')) {
                break;
            }
            lex$791();
        } while (streamIndex$756 < length$753);
        return list$1260;
    }
    function parseVariableStatement$841() {
        var declarations$1261;
        expectKeyword$799('var');
        declarations$1261 = parseVariableDeclarationList$840();
        consumeSemicolon$804();
        return delegate$754.createVariableDeclaration(declarations$1261, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$842(kind$1262) {
        var declarations$1263;
        expectKeyword$799(kind$1262);
        declarations$1263 = parseVariableDeclarationList$840(kind$1262);
        consumeSemicolon$804();
        return delegate$754.createVariableDeclaration(declarations$1263, kind$1262);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$843() {
        var id$1264, src$1265, body$1266;
        lex$791();
        // 'module'
        if (peekLineTerminator$794()) {
            throwError$795({}, Messages$740.NewlineAfterModule);
        }
        switch (lookahead$757.type) {
        case Token$735.StringLiteral:
            id$1264 = parsePrimaryExpression$816();
            body$1266 = parseModuleBlock$886();
            src$1265 = null;
            break;
        case Token$735.Identifier:
            id$1264 = parseVariableIdentifier$838();
            body$1266 = null;
            if (!matchContextualKeyword$802('from')) {
                throwUnexpected$797(lex$791());
            }
            lex$791();
            src$1265 = parsePrimaryExpression$816();
            if (src$1265.type !== Syntax$738.Literal) {
                throwError$795({}, Messages$740.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$804();
        return delegate$754.createModuleDeclaration(id$1264, src$1265, body$1266);
    }
    function parseExportBatchSpecifier$844() {
        expect$798('*');
        return delegate$754.createExportBatchSpecifier();
    }
    function parseExportSpecifier$845() {
        var id$1267, name$1268 = null;
        id$1267 = parseVariableIdentifier$838();
        if (matchContextualKeyword$802('as')) {
            lex$791();
            name$1268 = parseNonComputedProperty$819();
        }
        return delegate$754.createExportSpecifier(id$1267, name$1268);
    }
    function parseExportDeclaration$846() {
        var previousAllowKeyword$1269, decl$1270, def$1271, src$1272, specifiers$1273;
        expectKeyword$799('export');
        if (lookahead$757.type === Token$735.Keyword) {
            switch (lookahead$757.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$754.createExportDeclaration(parseSourceElement$881(), null, null);
            }
        }
        if (isIdentifierName$788(lookahead$757)) {
            previousAllowKeyword$1269 = state$759.allowKeyword;
            state$759.allowKeyword = true;
            decl$1270 = parseVariableDeclarationList$840('let');
            state$759.allowKeyword = previousAllowKeyword$1269;
            return delegate$754.createExportDeclaration(decl$1270, null, null);
        }
        specifiers$1273 = [];
        src$1272 = null;
        if (match$800('*')) {
            specifiers$1273.push(parseExportBatchSpecifier$844());
        } else {
            expect$798('{');
            do {
                specifiers$1273.push(parseExportSpecifier$845());
            } while (match$800(',') && lex$791());
            expect$798('}');
        }
        if (matchContextualKeyword$802('from')) {
            lex$791();
            src$1272 = parsePrimaryExpression$816();
            if (src$1272.type !== Syntax$738.Literal) {
                throwError$795({}, Messages$740.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$804();
        return delegate$754.createExportDeclaration(null, specifiers$1273, src$1272);
    }
    function parseImportDeclaration$847() {
        var specifiers$1274, kind$1275, src$1276;
        expectKeyword$799('import');
        specifiers$1274 = [];
        if (isIdentifierName$788(lookahead$757)) {
            kind$1275 = 'default';
            specifiers$1274.push(parseImportSpecifier$848());
            if (!matchContextualKeyword$802('from')) {
                throwError$795({}, Messages$740.NoFromAfterImport);
            }
            lex$791();
        } else if (match$800('{')) {
            kind$1275 = 'named';
            lex$791();
            do {
                specifiers$1274.push(parseImportSpecifier$848());
            } while (match$800(',') && lex$791());
            expect$798('}');
            if (!matchContextualKeyword$802('from')) {
                throwError$795({}, Messages$740.NoFromAfterImport);
            }
            lex$791();
        }
        src$1276 = parsePrimaryExpression$816();
        if (src$1276.type !== Syntax$738.Literal) {
            throwError$795({}, Messages$740.InvalidModuleSpecifier);
        }
        consumeSemicolon$804();
        return delegate$754.createImportDeclaration(specifiers$1274, kind$1275, src$1276);
    }
    function parseImportSpecifier$848() {
        var id$1277, name$1278 = null;
        id$1277 = parseNonComputedProperty$819();
        if (matchContextualKeyword$802('as')) {
            lex$791();
            name$1278 = parseVariableIdentifier$838();
        }
        return delegate$754.createImportSpecifier(id$1277, name$1278);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$849() {
        expect$798(';');
        return delegate$754.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$850() {
        var expr$1279 = parseExpression$835();
        consumeSemicolon$804();
        return delegate$754.createExpressionStatement(expr$1279);
    }
    // 12.5 If statement
    function parseIfStatement$851() {
        var test$1280, consequent$1281, alternate$1282;
        expectKeyword$799('if');
        expect$798('(');
        test$1280 = parseExpression$835();
        expect$798(')');
        consequent$1281 = parseStatement$866();
        if (matchKeyword$801('else')) {
            lex$791();
            alternate$1282 = parseStatement$866();
        } else {
            alternate$1282 = null;
        }
        return delegate$754.createIfStatement(test$1280, consequent$1281, alternate$1282);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$852() {
        var body$1283, test$1284, oldInIteration$1285;
        expectKeyword$799('do');
        oldInIteration$1285 = state$759.inIteration;
        state$759.inIteration = true;
        body$1283 = parseStatement$866();
        state$759.inIteration = oldInIteration$1285;
        expectKeyword$799('while');
        expect$798('(');
        test$1284 = parseExpression$835();
        expect$798(')');
        if (match$800(';')) {
            lex$791();
        }
        return delegate$754.createDoWhileStatement(body$1283, test$1284);
    }
    function parseWhileStatement$853() {
        var test$1286, body$1287, oldInIteration$1288;
        expectKeyword$799('while');
        expect$798('(');
        test$1286 = parseExpression$835();
        expect$798(')');
        oldInIteration$1288 = state$759.inIteration;
        state$759.inIteration = true;
        body$1287 = parseStatement$866();
        state$759.inIteration = oldInIteration$1288;
        return delegate$754.createWhileStatement(test$1286, body$1287);
    }
    function parseForVariableDeclaration$854() {
        var token$1289 = lex$791(), declarations$1290 = parseVariableDeclarationList$840();
        return delegate$754.createVariableDeclaration(declarations$1290, token$1289.value);
    }
    function parseForStatement$855(opts$1291) {
        var init$1292, test$1293, update$1294, left$1295, right$1296, body$1297, operator$1298, oldInIteration$1299;
        init$1292 = test$1293 = update$1294 = null;
        expectKeyword$799('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$802('each')) {
            throwError$795({}, Messages$740.EachNotAllowed);
        }
        expect$798('(');
        if (match$800(';')) {
            lex$791();
        } else {
            if (matchKeyword$801('var') || matchKeyword$801('let') || matchKeyword$801('const')) {
                state$759.allowIn = false;
                init$1292 = parseForVariableDeclaration$854();
                state$759.allowIn = true;
                if (init$1292.declarations.length === 1) {
                    if (matchKeyword$801('in') || matchContextualKeyword$802('of')) {
                        operator$1298 = lookahead$757;
                        if (!((operator$1298.value === 'in' || init$1292.kind !== 'var') && init$1292.declarations[0].init)) {
                            lex$791();
                            left$1295 = init$1292;
                            right$1296 = parseExpression$835();
                            init$1292 = null;
                        }
                    }
                }
            } else {
                state$759.allowIn = false;
                init$1292 = parseExpression$835();
                state$759.allowIn = true;
                if (matchContextualKeyword$802('of')) {
                    operator$1298 = lex$791();
                    left$1295 = init$1292;
                    right$1296 = parseExpression$835();
                    init$1292 = null;
                } else if (matchKeyword$801('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$806(init$1292)) {
                        throwError$795({}, Messages$740.InvalidLHSInForIn);
                    }
                    operator$1298 = lex$791();
                    left$1295 = init$1292;
                    right$1296 = parseExpression$835();
                    init$1292 = null;
                }
            }
            if (typeof left$1295 === 'undefined') {
                expect$798(';');
            }
        }
        if (typeof left$1295 === 'undefined') {
            if (!match$800(';')) {
                test$1293 = parseExpression$835();
            }
            expect$798(';');
            if (!match$800(')')) {
                update$1294 = parseExpression$835();
            }
        }
        expect$798(')');
        oldInIteration$1299 = state$759.inIteration;
        state$759.inIteration = true;
        if (!(opts$1291 !== undefined && opts$1291.ignoreBody)) {
            body$1297 = parseStatement$866();
        }
        state$759.inIteration = oldInIteration$1299;
        if (typeof left$1295 === 'undefined') {
            return delegate$754.createForStatement(init$1292, test$1293, update$1294, body$1297);
        }
        if (operator$1298.value === 'in') {
            return delegate$754.createForInStatement(left$1295, right$1296, body$1297);
        }
        return delegate$754.createForOfStatement(left$1295, right$1296, body$1297);
    }
    // 12.7 The continue statement
    function parseContinueStatement$856() {
        var label$1300 = null, key$1301;
        expectKeyword$799('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$757.value.charCodeAt(0) === 59) {
            lex$791();
            if (!state$759.inIteration) {
                throwError$795({}, Messages$740.IllegalContinue);
            }
            return delegate$754.createContinueStatement(null);
        }
        if (peekLineTerminator$794()) {
            if (!state$759.inIteration) {
                throwError$795({}, Messages$740.IllegalContinue);
            }
            return delegate$754.createContinueStatement(null);
        }
        if (lookahead$757.type === Token$735.Identifier) {
            label$1300 = parseVariableIdentifier$838();
            key$1301 = '$' + label$1300.name;
            if (!Object.prototype.hasOwnProperty.call(state$759.labelSet, key$1301)) {
                throwError$795({}, Messages$740.UnknownLabel, label$1300.name);
            }
        }
        consumeSemicolon$804();
        if (label$1300 === null && !state$759.inIteration) {
            throwError$795({}, Messages$740.IllegalContinue);
        }
        return delegate$754.createContinueStatement(label$1300);
    }
    // 12.8 The break statement
    function parseBreakStatement$857() {
        var label$1302 = null, key$1303;
        expectKeyword$799('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$757.value.charCodeAt(0) === 59) {
            lex$791();
            if (!(state$759.inIteration || state$759.inSwitch)) {
                throwError$795({}, Messages$740.IllegalBreak);
            }
            return delegate$754.createBreakStatement(null);
        }
        if (peekLineTerminator$794()) {
            if (!(state$759.inIteration || state$759.inSwitch)) {
                throwError$795({}, Messages$740.IllegalBreak);
            }
            return delegate$754.createBreakStatement(null);
        }
        if (lookahead$757.type === Token$735.Identifier) {
            label$1302 = parseVariableIdentifier$838();
            key$1303 = '$' + label$1302.name;
            if (!Object.prototype.hasOwnProperty.call(state$759.labelSet, key$1303)) {
                throwError$795({}, Messages$740.UnknownLabel, label$1302.name);
            }
        }
        consumeSemicolon$804();
        if (label$1302 === null && !(state$759.inIteration || state$759.inSwitch)) {
            throwError$795({}, Messages$740.IllegalBreak);
        }
        return delegate$754.createBreakStatement(label$1302);
    }
    // 12.9 The return statement
    function parseReturnStatement$858() {
        var argument$1304 = null;
        expectKeyword$799('return');
        if (!state$759.inFunctionBody) {
            throwErrorTolerant$796({}, Messages$740.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$768(String(lookahead$757.value).charCodeAt(0))) {
            argument$1304 = parseExpression$835();
            consumeSemicolon$804();
            return delegate$754.createReturnStatement(argument$1304);
        }
        if (peekLineTerminator$794()) {
            return delegate$754.createReturnStatement(null);
        }
        if (!match$800(';')) {
            if (!match$800('}') && lookahead$757.type !== Token$735.EOF) {
                argument$1304 = parseExpression$835();
            }
        }
        consumeSemicolon$804();
        return delegate$754.createReturnStatement(argument$1304);
    }
    // 12.10 The with statement
    function parseWithStatement$859() {
        var object$1305, body$1306;
        if (strict$745) {
            throwErrorTolerant$796({}, Messages$740.StrictModeWith);
        }
        expectKeyword$799('with');
        expect$798('(');
        object$1305 = parseExpression$835();
        expect$798(')');
        body$1306 = parseStatement$866();
        return delegate$754.createWithStatement(object$1305, body$1306);
    }
    // 12.10 The swith statement
    function parseSwitchCase$860() {
        var test$1307, consequent$1308 = [], sourceElement$1309;
        if (matchKeyword$801('default')) {
            lex$791();
            test$1307 = null;
        } else {
            expectKeyword$799('case');
            test$1307 = parseExpression$835();
        }
        expect$798(':');
        while (streamIndex$756 < length$753) {
            if (match$800('}') || matchKeyword$801('default') || matchKeyword$801('case')) {
                break;
            }
            sourceElement$1309 = parseSourceElement$881();
            if (typeof sourceElement$1309 === 'undefined') {
                break;
            }
            consequent$1308.push(sourceElement$1309);
        }
        return delegate$754.createSwitchCase(test$1307, consequent$1308);
    }
    function parseSwitchStatement$861() {
        var discriminant$1310, cases$1311, clause$1312, oldInSwitch$1313, defaultFound$1314;
        expectKeyword$799('switch');
        expect$798('(');
        discriminant$1310 = parseExpression$835();
        expect$798(')');
        expect$798('{');
        cases$1311 = [];
        if (match$800('}')) {
            lex$791();
            return delegate$754.createSwitchStatement(discriminant$1310, cases$1311);
        }
        oldInSwitch$1313 = state$759.inSwitch;
        state$759.inSwitch = true;
        defaultFound$1314 = false;
        while (streamIndex$756 < length$753) {
            if (match$800('}')) {
                break;
            }
            clause$1312 = parseSwitchCase$860();
            if (clause$1312.test === null) {
                if (defaultFound$1314) {
                    throwError$795({}, Messages$740.MultipleDefaultsInSwitch);
                }
                defaultFound$1314 = true;
            }
            cases$1311.push(clause$1312);
        }
        state$759.inSwitch = oldInSwitch$1313;
        expect$798('}');
        return delegate$754.createSwitchStatement(discriminant$1310, cases$1311);
    }
    // 12.13 The throw statement
    function parseThrowStatement$862() {
        var argument$1315;
        expectKeyword$799('throw');
        if (peekLineTerminator$794()) {
            throwError$795({}, Messages$740.NewlineAfterThrow);
        }
        argument$1315 = parseExpression$835();
        consumeSemicolon$804();
        return delegate$754.createThrowStatement(argument$1315);
    }
    // 12.14 The try statement
    function parseCatchClause$863() {
        var param$1316, body$1317;
        expectKeyword$799('catch');
        expect$798('(');
        if (match$800(')')) {
            throwUnexpected$797(lookahead$757);
        }
        param$1316 = parseExpression$835();
        // 12.14.1
        if (strict$745 && param$1316.type === Syntax$738.Identifier && isRestrictedWord$772(param$1316.name)) {
            throwErrorTolerant$796({}, Messages$740.StrictCatchVariable);
        }
        expect$798(')');
        body$1317 = parseBlock$837();
        return delegate$754.createCatchClause(param$1316, body$1317);
    }
    function parseTryStatement$864() {
        var block$1318, handlers$1319 = [], finalizer$1320 = null;
        expectKeyword$799('try');
        block$1318 = parseBlock$837();
        if (matchKeyword$801('catch')) {
            handlers$1319.push(parseCatchClause$863());
        }
        if (matchKeyword$801('finally')) {
            lex$791();
            finalizer$1320 = parseBlock$837();
        }
        if (handlers$1319.length === 0 && !finalizer$1320) {
            throwError$795({}, Messages$740.NoCatchOrFinally);
        }
        return delegate$754.createTryStatement(block$1318, [], handlers$1319, finalizer$1320);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$865() {
        expectKeyword$799('debugger');
        consumeSemicolon$804();
        return delegate$754.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$866() {
        var type$1321 = lookahead$757.type, expr$1322, labeledBody$1323, key$1324;
        if (type$1321 === Token$735.EOF) {
            throwUnexpected$797(lookahead$757);
        }
        if (type$1321 === Token$735.Punctuator) {
            switch (lookahead$757.value) {
            case ';':
                return parseEmptyStatement$849();
            case '{':
                return parseBlock$837();
            case '(':
                return parseExpressionStatement$850();
            default:
                break;
            }
        }
        if (type$1321 === Token$735.Keyword) {
            switch (lookahead$757.value) {
            case 'break':
                return parseBreakStatement$857();
            case 'continue':
                return parseContinueStatement$856();
            case 'debugger':
                return parseDebuggerStatement$865();
            case 'do':
                return parseDoWhileStatement$852();
            case 'for':
                return parseForStatement$855();
            case 'function':
                return parseFunctionDeclaration$872();
            case 'class':
                return parseClassDeclaration$879();
            case 'if':
                return parseIfStatement$851();
            case 'return':
                return parseReturnStatement$858();
            case 'switch':
                return parseSwitchStatement$861();
            case 'throw':
                return parseThrowStatement$862();
            case 'try':
                return parseTryStatement$864();
            case 'var':
                return parseVariableStatement$841();
            case 'while':
                return parseWhileStatement$853();
            case 'with':
                return parseWithStatement$859();
            default:
                break;
            }
        }
        expr$1322 = parseExpression$835();
        // 12.12 Labelled Statements
        if (expr$1322.type === Syntax$738.Identifier && match$800(':')) {
            lex$791();
            key$1324 = '$' + expr$1322.name;
            if (Object.prototype.hasOwnProperty.call(state$759.labelSet, key$1324)) {
                throwError$795({}, Messages$740.Redeclaration, 'Label', expr$1322.name);
            }
            state$759.labelSet[key$1324] = true;
            labeledBody$1323 = parseStatement$866();
            delete state$759.labelSet[key$1324];
            return delegate$754.createLabeledStatement(expr$1322, labeledBody$1323);
        }
        consumeSemicolon$804();
        return delegate$754.createExpressionStatement(expr$1322);
    }
    // 13 Function Definition
    function parseConciseBody$867() {
        if (match$800('{')) {
            return parseFunctionSourceElements$868();
        }
        return parseAssignmentExpression$834();
    }
    function parseFunctionSourceElements$868() {
        var sourceElement$1325, sourceElements$1326 = [], token$1327, directive$1328, firstRestricted$1329, oldLabelSet$1330, oldInIteration$1331, oldInSwitch$1332, oldInFunctionBody$1333, oldParenthesizedCount$1334;
        expect$798('{');
        while (streamIndex$756 < length$753) {
            if (lookahead$757.type !== Token$735.StringLiteral) {
                break;
            }
            token$1327 = lookahead$757;
            sourceElement$1325 = parseSourceElement$881();
            sourceElements$1326.push(sourceElement$1325);
            if (sourceElement$1325.expression.type !== Syntax$738.Literal) {
                // this is not directive
                break;
            }
            directive$1328 = token$1327.value;
            if (directive$1328 === 'use strict') {
                strict$745 = true;
                if (firstRestricted$1329) {
                    throwErrorTolerant$796(firstRestricted$1329, Messages$740.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1329 && token$1327.octal) {
                    firstRestricted$1329 = token$1327;
                }
            }
        }
        oldLabelSet$1330 = state$759.labelSet;
        oldInIteration$1331 = state$759.inIteration;
        oldInSwitch$1332 = state$759.inSwitch;
        oldInFunctionBody$1333 = state$759.inFunctionBody;
        oldParenthesizedCount$1334 = state$759.parenthesizedCount;
        state$759.labelSet = {};
        state$759.inIteration = false;
        state$759.inSwitch = false;
        state$759.inFunctionBody = true;
        state$759.parenthesizedCount = 0;
        while (streamIndex$756 < length$753) {
            if (match$800('}')) {
                break;
            }
            sourceElement$1325 = parseSourceElement$881();
            if (typeof sourceElement$1325 === 'undefined') {
                break;
            }
            sourceElements$1326.push(sourceElement$1325);
        }
        expect$798('}');
        state$759.labelSet = oldLabelSet$1330;
        state$759.inIteration = oldInIteration$1331;
        state$759.inSwitch = oldInSwitch$1332;
        state$759.inFunctionBody = oldInFunctionBody$1333;
        state$759.parenthesizedCount = oldParenthesizedCount$1334;
        return delegate$754.createBlockStatement(sourceElements$1326);
    }
    function validateParam$869(options$1335, param$1336, name$1337) {
        var key$1338 = '$' + name$1337;
        if (strict$745) {
            if (isRestrictedWord$772(name$1337)) {
                options$1335.stricted = param$1336;
                options$1335.message = Messages$740.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1335.paramSet, key$1338)) {
                options$1335.stricted = param$1336;
                options$1335.message = Messages$740.StrictParamDupe;
            }
        } else if (!options$1335.firstRestricted) {
            if (isRestrictedWord$772(name$1337)) {
                options$1335.firstRestricted = param$1336;
                options$1335.message = Messages$740.StrictParamName;
            } else if (isStrictModeReservedWord$771(name$1337)) {
                options$1335.firstRestricted = param$1336;
                options$1335.message = Messages$740.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1335.paramSet, key$1338)) {
                options$1335.firstRestricted = param$1336;
                options$1335.message = Messages$740.StrictParamDupe;
            }
        }
        options$1335.paramSet[key$1338] = true;
    }
    function parseParam$870(options$1339) {
        var token$1340, rest$1341, param$1342, def$1343;
        token$1340 = lookahead$757;
        if (token$1340.value === '...') {
            token$1340 = lex$791();
            rest$1341 = true;
        }
        if (match$800('[')) {
            param$1342 = parseArrayInitialiser$807();
            reinterpretAsDestructuredParameter$831(options$1339, param$1342);
        } else if (match$800('{')) {
            if (rest$1341) {
                throwError$795({}, Messages$740.ObjectPatternAsRestParameter);
            }
            param$1342 = parseObjectInitialiser$812();
            reinterpretAsDestructuredParameter$831(options$1339, param$1342);
        } else {
            param$1342 = parseVariableIdentifier$838();
            validateParam$869(options$1339, token$1340, token$1340.value);
            if (match$800('=')) {
                if (rest$1341) {
                    throwErrorTolerant$796(lookahead$757, Messages$740.DefaultRestParameter);
                }
                lex$791();
                def$1343 = parseAssignmentExpression$834();
                ++options$1339.defaultCount;
            }
        }
        if (rest$1341) {
            if (!match$800(')')) {
                throwError$795({}, Messages$740.ParameterAfterRestParameter);
            }
            options$1339.rest = param$1342;
            return false;
        }
        options$1339.params.push(param$1342);
        options$1339.defaults.push(def$1343);
        return !match$800(')');
    }
    function parseParams$871(firstRestricted$1344) {
        var options$1345;
        options$1345 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1344
        };
        expect$798('(');
        if (!match$800(')')) {
            options$1345.paramSet = {};
            while (streamIndex$756 < length$753) {
                if (!parseParam$870(options$1345)) {
                    break;
                }
                expect$798(',');
            }
        }
        expect$798(')');
        if (options$1345.defaultCount === 0) {
            options$1345.defaults = [];
        }
        return options$1345;
    }
    function parseFunctionDeclaration$872() {
        var id$1346, body$1347, token$1348, tmp$1349, firstRestricted$1350, message$1351, previousStrict$1352, previousYieldAllowed$1353, generator$1354, expression$1355;
        expectKeyword$799('function');
        generator$1354 = false;
        if (match$800('*')) {
            lex$791();
            generator$1354 = true;
        }
        token$1348 = lookahead$757;
        id$1346 = parseVariableIdentifier$838();
        if (strict$745) {
            if (isRestrictedWord$772(token$1348.value)) {
                throwErrorTolerant$796(token$1348, Messages$740.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$772(token$1348.value)) {
                firstRestricted$1350 = token$1348;
                message$1351 = Messages$740.StrictFunctionName;
            } else if (isStrictModeReservedWord$771(token$1348.value)) {
                firstRestricted$1350 = token$1348;
                message$1351 = Messages$740.StrictReservedWord;
            }
        }
        tmp$1349 = parseParams$871(firstRestricted$1350);
        firstRestricted$1350 = tmp$1349.firstRestricted;
        if (tmp$1349.message) {
            message$1351 = tmp$1349.message;
        }
        previousStrict$1352 = strict$745;
        previousYieldAllowed$1353 = state$759.yieldAllowed;
        state$759.yieldAllowed = generator$1354;
        // here we redo some work in order to set 'expression'
        expression$1355 = !match$800('{');
        body$1347 = parseConciseBody$867();
        if (strict$745 && firstRestricted$1350) {
            throwError$795(firstRestricted$1350, message$1351);
        }
        if (strict$745 && tmp$1349.stricted) {
            throwErrorTolerant$796(tmp$1349.stricted, message$1351);
        }
        if (state$759.yieldAllowed && !state$759.yieldFound) {
            throwErrorTolerant$796({}, Messages$740.NoYieldInGenerator);
        }
        strict$745 = previousStrict$1352;
        state$759.yieldAllowed = previousYieldAllowed$1353;
        return delegate$754.createFunctionDeclaration(id$1346, tmp$1349.params, tmp$1349.defaults, body$1347, tmp$1349.rest, generator$1354, expression$1355);
    }
    function parseFunctionExpression$873() {
        var token$1356, id$1357 = null, firstRestricted$1358, message$1359, tmp$1360, body$1361, previousStrict$1362, previousYieldAllowed$1363, generator$1364, expression$1365;
        expectKeyword$799('function');
        generator$1364 = false;
        if (match$800('*')) {
            lex$791();
            generator$1364 = true;
        }
        if (!match$800('(')) {
            token$1356 = lookahead$757;
            id$1357 = parseVariableIdentifier$838();
            if (strict$745) {
                if (isRestrictedWord$772(token$1356.value)) {
                    throwErrorTolerant$796(token$1356, Messages$740.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$772(token$1356.value)) {
                    firstRestricted$1358 = token$1356;
                    message$1359 = Messages$740.StrictFunctionName;
                } else if (isStrictModeReservedWord$771(token$1356.value)) {
                    firstRestricted$1358 = token$1356;
                    message$1359 = Messages$740.StrictReservedWord;
                }
            }
        }
        tmp$1360 = parseParams$871(firstRestricted$1358);
        firstRestricted$1358 = tmp$1360.firstRestricted;
        if (tmp$1360.message) {
            message$1359 = tmp$1360.message;
        }
        previousStrict$1362 = strict$745;
        previousYieldAllowed$1363 = state$759.yieldAllowed;
        state$759.yieldAllowed = generator$1364;
        // here we redo some work in order to set 'expression'
        expression$1365 = !match$800('{');
        body$1361 = parseConciseBody$867();
        if (strict$745 && firstRestricted$1358) {
            throwError$795(firstRestricted$1358, message$1359);
        }
        if (strict$745 && tmp$1360.stricted) {
            throwErrorTolerant$796(tmp$1360.stricted, message$1359);
        }
        if (state$759.yieldAllowed && !state$759.yieldFound) {
            throwErrorTolerant$796({}, Messages$740.NoYieldInGenerator);
        }
        strict$745 = previousStrict$1362;
        state$759.yieldAllowed = previousYieldAllowed$1363;
        return delegate$754.createFunctionExpression(id$1357, tmp$1360.params, tmp$1360.defaults, body$1361, tmp$1360.rest, generator$1364, expression$1365);
    }
    function parseYieldExpression$874() {
        var delegateFlag$1366, expr$1367, previousYieldAllowed$1368;
        expectKeyword$799('yield');
        if (!state$759.yieldAllowed) {
            throwErrorTolerant$796({}, Messages$740.IllegalYield);
        }
        delegateFlag$1366 = false;
        if (match$800('*')) {
            lex$791();
            delegateFlag$1366 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1368 = state$759.yieldAllowed;
        state$759.yieldAllowed = false;
        expr$1367 = parseAssignmentExpression$834();
        state$759.yieldAllowed = previousYieldAllowed$1368;
        state$759.yieldFound = true;
        return delegate$754.createYieldExpression(expr$1367, delegateFlag$1366);
    }
    // 14 Classes
    function parseMethodDefinition$875(existingPropNames$1369) {
        var token$1370, key$1371, param$1372, propType$1373, isValidDuplicateProp$1374 = false;
        if (lookahead$757.value === 'static') {
            propType$1373 = ClassPropertyType$743.static;
            lex$791();
        } else {
            propType$1373 = ClassPropertyType$743.prototype;
        }
        if (match$800('*')) {
            lex$791();
            return delegate$754.createMethodDefinition(propType$1373, '', parseObjectPropertyKey$810(), parsePropertyMethodFunction$809({ generator: true }));
        }
        token$1370 = lookahead$757;
        key$1371 = parseObjectPropertyKey$810();
        if (token$1370.value === 'get' && !match$800('(')) {
            key$1371 = parseObjectPropertyKey$810();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1369[propType$1373].hasOwnProperty(key$1371.name)) {
                isValidDuplicateProp$1374 = existingPropNames$1369[propType$1373][key$1371.name].get === undefined && existingPropNames$1369[propType$1373][key$1371.name].data === undefined && existingPropNames$1369[propType$1373][key$1371.name].set !== undefined;
                if (!isValidDuplicateProp$1374) {
                    throwError$795(key$1371, Messages$740.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1369[propType$1373][key$1371.name] = {};
            }
            existingPropNames$1369[propType$1373][key$1371.name].get = true;
            expect$798('(');
            expect$798(')');
            return delegate$754.createMethodDefinition(propType$1373, 'get', key$1371, parsePropertyFunction$808({ generator: false }));
        }
        if (token$1370.value === 'set' && !match$800('(')) {
            key$1371 = parseObjectPropertyKey$810();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1369[propType$1373].hasOwnProperty(key$1371.name)) {
                isValidDuplicateProp$1374 = existingPropNames$1369[propType$1373][key$1371.name].set === undefined && existingPropNames$1369[propType$1373][key$1371.name].data === undefined && existingPropNames$1369[propType$1373][key$1371.name].get !== undefined;
                if (!isValidDuplicateProp$1374) {
                    throwError$795(key$1371, Messages$740.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1369[propType$1373][key$1371.name] = {};
            }
            existingPropNames$1369[propType$1373][key$1371.name].set = true;
            expect$798('(');
            token$1370 = lookahead$757;
            param$1372 = [parseVariableIdentifier$838()];
            expect$798(')');
            return delegate$754.createMethodDefinition(propType$1373, 'set', key$1371, parsePropertyFunction$808({
                params: param$1372,
                generator: false,
                name: token$1370
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1369[propType$1373].hasOwnProperty(key$1371.name)) {
            throwError$795(key$1371, Messages$740.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1369[propType$1373][key$1371.name] = {};
        }
        existingPropNames$1369[propType$1373][key$1371.name].data = true;
        return delegate$754.createMethodDefinition(propType$1373, '', key$1371, parsePropertyMethodFunction$809({ generator: false }));
    }
    function parseClassElement$876(existingProps$1375) {
        if (match$800(';')) {
            lex$791();
            return;
        }
        return parseMethodDefinition$875(existingProps$1375);
    }
    function parseClassBody$877() {
        var classElement$1376, classElements$1377 = [], existingProps$1378 = {};
        existingProps$1378[ClassPropertyType$743.static] = {};
        existingProps$1378[ClassPropertyType$743.prototype] = {};
        expect$798('{');
        while (streamIndex$756 < length$753) {
            if (match$800('}')) {
                break;
            }
            classElement$1376 = parseClassElement$876(existingProps$1378);
            if (typeof classElement$1376 !== 'undefined') {
                classElements$1377.push(classElement$1376);
            }
        }
        expect$798('}');
        return delegate$754.createClassBody(classElements$1377);
    }
    function parseClassExpression$878() {
        var id$1379, previousYieldAllowed$1380, superClass$1381 = null;
        expectKeyword$799('class');
        if (!matchKeyword$801('extends') && !match$800('{')) {
            id$1379 = parseVariableIdentifier$838();
        }
        if (matchKeyword$801('extends')) {
            expectKeyword$799('extends');
            previousYieldAllowed$1380 = state$759.yieldAllowed;
            state$759.yieldAllowed = false;
            superClass$1381 = parseAssignmentExpression$834();
            state$759.yieldAllowed = previousYieldAllowed$1380;
        }
        return delegate$754.createClassExpression(id$1379, superClass$1381, parseClassBody$877());
    }
    function parseClassDeclaration$879() {
        var id$1382, previousYieldAllowed$1383, superClass$1384 = null;
        expectKeyword$799('class');
        id$1382 = parseVariableIdentifier$838();
        if (matchKeyword$801('extends')) {
            expectKeyword$799('extends');
            previousYieldAllowed$1383 = state$759.yieldAllowed;
            state$759.yieldAllowed = false;
            superClass$1384 = parseAssignmentExpression$834();
            state$759.yieldAllowed = previousYieldAllowed$1383;
        }
        return delegate$754.createClassDeclaration(id$1382, superClass$1384, parseClassBody$877());
    }
    // 15 Program
    function matchModuleDeclaration$880() {
        var id$1385;
        if (matchContextualKeyword$802('module')) {
            id$1385 = lookahead2$793();
            return id$1385.type === Token$735.StringLiteral || id$1385.type === Token$735.Identifier;
        }
        return false;
    }
    function parseSourceElement$881() {
        if (lookahead$757.type === Token$735.Keyword) {
            switch (lookahead$757.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$842(lookahead$757.value);
            case 'function':
                return parseFunctionDeclaration$872();
            case 'export':
                return parseExportDeclaration$846();
            case 'import':
                return parseImportDeclaration$847();
            default:
                return parseStatement$866();
            }
        }
        if (matchModuleDeclaration$880()) {
            throwError$795({}, Messages$740.NestedModule);
        }
        if (lookahead$757.type !== Token$735.EOF) {
            return parseStatement$866();
        }
    }
    function parseProgramElement$882() {
        if (lookahead$757.type === Token$735.Keyword) {
            switch (lookahead$757.value) {
            case 'export':
                return parseExportDeclaration$846();
            case 'import':
                return parseImportDeclaration$847();
            }
        }
        if (matchModuleDeclaration$880()) {
            return parseModuleDeclaration$843();
        }
        return parseSourceElement$881();
    }
    function parseProgramElements$883() {
        var sourceElement$1386, sourceElements$1387 = [], token$1388, directive$1389, firstRestricted$1390;
        while (streamIndex$756 < length$753) {
            token$1388 = lookahead$757;
            if (token$1388.type !== Token$735.StringLiteral) {
                break;
            }
            sourceElement$1386 = parseProgramElement$882();
            sourceElements$1387.push(sourceElement$1386);
            if (sourceElement$1386.expression.type !== Syntax$738.Literal) {
                // this is not directive
                break;
            }
            assert$761(false, 'directive isn\'t right');
            directive$1389 = source$744.slice(token$1388.range[0] + 1, token$1388.range[1] - 1);
            if (directive$1389 === 'use strict') {
                strict$745 = true;
                if (firstRestricted$1390) {
                    throwErrorTolerant$796(firstRestricted$1390, Messages$740.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1390 && token$1388.octal) {
                    firstRestricted$1390 = token$1388;
                }
            }
        }
        while (streamIndex$756 < length$753) {
            sourceElement$1386 = parseProgramElement$882();
            if (typeof sourceElement$1386 === 'undefined') {
                break;
            }
            sourceElements$1387.push(sourceElement$1386);
        }
        return sourceElements$1387;
    }
    function parseModuleElement$884() {
        return parseSourceElement$881();
    }
    function parseModuleElements$885() {
        var list$1391 = [], statement$1392;
        while (streamIndex$756 < length$753) {
            if (match$800('}')) {
                break;
            }
            statement$1392 = parseModuleElement$884();
            if (typeof statement$1392 === 'undefined') {
                break;
            }
            list$1391.push(statement$1392);
        }
        return list$1391;
    }
    function parseModuleBlock$886() {
        var block$1393;
        expect$798('{');
        block$1393 = parseModuleElements$885();
        expect$798('}');
        return delegate$754.createBlockStatement(block$1393);
    }
    function parseProgram$887() {
        var body$1394;
        strict$745 = false;
        peek$792();
        body$1394 = parseProgramElements$883();
        return delegate$754.createProgram(body$1394);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$888(type$1395, value$1396, start$1397, end$1398, loc$1399) {
        assert$761(typeof start$1397 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$760.comments.length > 0) {
            if (extra$760.comments[extra$760.comments.length - 1].range[1] > start$1397) {
                return;
            }
        }
        extra$760.comments.push({
            type: type$1395,
            value: value$1396,
            range: [
                start$1397,
                end$1398
            ],
            loc: loc$1399
        });
    }
    function scanComment$889() {
        var comment$1400, ch$1401, loc$1402, start$1403, blockComment$1404, lineComment$1405;
        comment$1400 = '';
        blockComment$1404 = false;
        lineComment$1405 = false;
        while (index$746 < length$753) {
            ch$1401 = source$744[index$746];
            if (lineComment$1405) {
                ch$1401 = source$744[index$746++];
                if (isLineTerminator$767(ch$1401.charCodeAt(0))) {
                    loc$1402.end = {
                        line: lineNumber$747,
                        column: index$746 - lineStart$748 - 1
                    };
                    lineComment$1405 = false;
                    addComment$888('Line', comment$1400, start$1403, index$746 - 1, loc$1402);
                    if (ch$1401 === '\r' && source$744[index$746] === '\n') {
                        ++index$746;
                    }
                    ++lineNumber$747;
                    lineStart$748 = index$746;
                    comment$1400 = '';
                } else if (index$746 >= length$753) {
                    lineComment$1405 = false;
                    comment$1400 += ch$1401;
                    loc$1402.end = {
                        line: lineNumber$747,
                        column: length$753 - lineStart$748
                    };
                    addComment$888('Line', comment$1400, start$1403, length$753, loc$1402);
                } else {
                    comment$1400 += ch$1401;
                }
            } else if (blockComment$1404) {
                if (isLineTerminator$767(ch$1401.charCodeAt(0))) {
                    if (ch$1401 === '\r' && source$744[index$746 + 1] === '\n') {
                        ++index$746;
                        comment$1400 += '\r\n';
                    } else {
                        comment$1400 += ch$1401;
                    }
                    ++lineNumber$747;
                    ++index$746;
                    lineStart$748 = index$746;
                    if (index$746 >= length$753) {
                        throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1401 = source$744[index$746++];
                    if (index$746 >= length$753) {
                        throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1400 += ch$1401;
                    if (ch$1401 === '*') {
                        ch$1401 = source$744[index$746];
                        if (ch$1401 === '/') {
                            comment$1400 = comment$1400.substr(0, comment$1400.length - 1);
                            blockComment$1404 = false;
                            ++index$746;
                            loc$1402.end = {
                                line: lineNumber$747,
                                column: index$746 - lineStart$748
                            };
                            addComment$888('Block', comment$1400, start$1403, index$746, loc$1402);
                            comment$1400 = '';
                        }
                    }
                }
            } else if (ch$1401 === '/') {
                ch$1401 = source$744[index$746 + 1];
                if (ch$1401 === '/') {
                    loc$1402 = {
                        start: {
                            line: lineNumber$747,
                            column: index$746 - lineStart$748
                        }
                    };
                    start$1403 = index$746;
                    index$746 += 2;
                    lineComment$1405 = true;
                    if (index$746 >= length$753) {
                        loc$1402.end = {
                            line: lineNumber$747,
                            column: index$746 - lineStart$748
                        };
                        lineComment$1405 = false;
                        addComment$888('Line', comment$1400, start$1403, index$746, loc$1402);
                    }
                } else if (ch$1401 === '*') {
                    start$1403 = index$746;
                    index$746 += 2;
                    blockComment$1404 = true;
                    loc$1402 = {
                        start: {
                            line: lineNumber$747,
                            column: index$746 - lineStart$748 - 2
                        }
                    };
                    if (index$746 >= length$753) {
                        throwError$795({}, Messages$740.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$766(ch$1401.charCodeAt(0))) {
                ++index$746;
            } else if (isLineTerminator$767(ch$1401.charCodeAt(0))) {
                ++index$746;
                if (ch$1401 === '\r' && source$744[index$746] === '\n') {
                    ++index$746;
                }
                ++lineNumber$747;
                lineStart$748 = index$746;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$890() {
        var i$1406, entry$1407, comment$1408, comments$1409 = [];
        for (i$1406 = 0; i$1406 < extra$760.comments.length; ++i$1406) {
            entry$1407 = extra$760.comments[i$1406];
            comment$1408 = {
                type: entry$1407.type,
                value: entry$1407.value
            };
            if (extra$760.range) {
                comment$1408.range = entry$1407.range;
            }
            if (extra$760.loc) {
                comment$1408.loc = entry$1407.loc;
            }
            comments$1409.push(comment$1408);
        }
        extra$760.comments = comments$1409;
    }
    function collectToken$891() {
        var start$1410, loc$1411, token$1412, range$1413, value$1414;
        skipComment$774();
        start$1410 = index$746;
        loc$1411 = {
            start: {
                line: lineNumber$747,
                column: index$746 - lineStart$748
            }
        };
        token$1412 = extra$760.advance();
        loc$1411.end = {
            line: lineNumber$747,
            column: index$746 - lineStart$748
        };
        if (token$1412.type !== Token$735.EOF) {
            range$1413 = [
                token$1412.range[0],
                token$1412.range[1]
            ];
            value$1414 = source$744.slice(token$1412.range[0], token$1412.range[1]);
            extra$760.tokens.push({
                type: TokenName$736[token$1412.type],
                value: value$1414,
                range: range$1413,
                loc: loc$1411
            });
        }
        return token$1412;
    }
    function collectRegex$892() {
        var pos$1415, loc$1416, regex$1417, token$1418;
        skipComment$774();
        pos$1415 = index$746;
        loc$1416 = {
            start: {
                line: lineNumber$747,
                column: index$746 - lineStart$748
            }
        };
        regex$1417 = extra$760.scanRegExp();
        loc$1416.end = {
            line: lineNumber$747,
            column: index$746 - lineStart$748
        };
        if (!extra$760.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$760.tokens.length > 0) {
                token$1418 = extra$760.tokens[extra$760.tokens.length - 1];
                if (token$1418.range[0] === pos$1415 && token$1418.type === 'Punctuator') {
                    if (token$1418.value === '/' || token$1418.value === '/=') {
                        extra$760.tokens.pop();
                    }
                }
            }
            extra$760.tokens.push({
                type: 'RegularExpression',
                value: regex$1417.literal,
                range: [
                    pos$1415,
                    index$746
                ],
                loc: loc$1416
            });
        }
        return regex$1417;
    }
    function filterTokenLocation$893() {
        var i$1419, entry$1420, token$1421, tokens$1422 = [];
        for (i$1419 = 0; i$1419 < extra$760.tokens.length; ++i$1419) {
            entry$1420 = extra$760.tokens[i$1419];
            token$1421 = {
                type: entry$1420.type,
                value: entry$1420.value
            };
            if (extra$760.range) {
                token$1421.range = entry$1420.range;
            }
            if (extra$760.loc) {
                token$1421.loc = entry$1420.loc;
            }
            tokens$1422.push(token$1421);
        }
        extra$760.tokens = tokens$1422;
    }
    function LocationMarker$894() {
        var sm_index$1423 = lookahead$757 ? lookahead$757.sm_range[0] : 0;
        var sm_lineStart$1424 = lookahead$757 ? lookahead$757.sm_lineStart : 0;
        var sm_lineNumber$1425 = lookahead$757 ? lookahead$757.sm_lineNumber : 1;
        this.range = [
            sm_index$1423,
            sm_index$1423
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1425,
                column: sm_index$1423 - sm_lineStart$1424
            },
            end: {
                line: sm_lineNumber$1425,
                column: sm_index$1423 - sm_lineStart$1424
            }
        };
    }
    LocationMarker$894.prototype = {
        constructor: LocationMarker$894,
        end: function () {
            this.range[1] = sm_index$752;
            this.loc.end.line = sm_lineNumber$749;
            this.loc.end.column = sm_index$752 - sm_lineStart$750;
        },
        applyGroup: function (node$1426) {
            if (extra$760.range) {
                node$1426.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$760.loc) {
                node$1426.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1426 = delegate$754.postProcess(node$1426);
            }
        },
        apply: function (node$1427) {
            var nodeType$1428 = typeof node$1427;
            assert$761(nodeType$1428 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1428);
            if (extra$760.range) {
                node$1427.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$760.loc) {
                node$1427.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1427 = delegate$754.postProcess(node$1427);
            }
        }
    };
    function createLocationMarker$895() {
        return new LocationMarker$894();
    }
    function trackGroupExpression$896() {
        var marker$1429, expr$1430;
        marker$1429 = createLocationMarker$895();
        expect$798('(');
        ++state$759.parenthesizedCount;
        expr$1430 = parseExpression$835();
        expect$798(')');
        marker$1429.end();
        marker$1429.applyGroup(expr$1430);
        return expr$1430;
    }
    function trackLeftHandSideExpression$897() {
        var marker$1431, expr$1432;
        // skipComment();
        marker$1431 = createLocationMarker$895();
        expr$1432 = matchKeyword$801('new') ? parseNewExpression$822() : parsePrimaryExpression$816();
        while (match$800('.') || match$800('[') || lookahead$757.type === Token$735.Template) {
            if (match$800('[')) {
                expr$1432 = delegate$754.createMemberExpression('[', expr$1432, parseComputedMember$821());
                marker$1431.end();
                marker$1431.apply(expr$1432);
            } else if (match$800('.')) {
                expr$1432 = delegate$754.createMemberExpression('.', expr$1432, parseNonComputedMember$820());
                marker$1431.end();
                marker$1431.apply(expr$1432);
            } else {
                expr$1432 = delegate$754.createTaggedTemplateExpression(expr$1432, parseTemplateLiteral$814());
                marker$1431.end();
                marker$1431.apply(expr$1432);
            }
        }
        return expr$1432;
    }
    function trackLeftHandSideExpressionAllowCall$898() {
        var marker$1433, expr$1434, args$1435;
        // skipComment();
        marker$1433 = createLocationMarker$895();
        expr$1434 = matchKeyword$801('new') ? parseNewExpression$822() : parsePrimaryExpression$816();
        while (match$800('.') || match$800('[') || match$800('(') || lookahead$757.type === Token$735.Template) {
            if (match$800('(')) {
                args$1435 = parseArguments$817();
                expr$1434 = delegate$754.createCallExpression(expr$1434, args$1435);
                marker$1433.end();
                marker$1433.apply(expr$1434);
            } else if (match$800('[')) {
                expr$1434 = delegate$754.createMemberExpression('[', expr$1434, parseComputedMember$821());
                marker$1433.end();
                marker$1433.apply(expr$1434);
            } else if (match$800('.')) {
                expr$1434 = delegate$754.createMemberExpression('.', expr$1434, parseNonComputedMember$820());
                marker$1433.end();
                marker$1433.apply(expr$1434);
            } else {
                expr$1434 = delegate$754.createTaggedTemplateExpression(expr$1434, parseTemplateLiteral$814());
                marker$1433.end();
                marker$1433.apply(expr$1434);
            }
        }
        return expr$1434;
    }
    function filterGroup$899(node$1436) {
        var n$1437, i$1438, entry$1439;
        n$1437 = Object.prototype.toString.apply(node$1436) === '[object Array]' ? [] : {};
        for (i$1438 in node$1436) {
            if (node$1436.hasOwnProperty(i$1438) && i$1438 !== 'groupRange' && i$1438 !== 'groupLoc') {
                entry$1439 = node$1436[i$1438];
                if (entry$1439 === null || typeof entry$1439 !== 'object' || entry$1439 instanceof RegExp) {
                    n$1437[i$1438] = entry$1439;
                } else {
                    n$1437[i$1438] = filterGroup$899(entry$1439);
                }
            }
        }
        return n$1437;
    }
    function wrapTrackingFunction$900(range$1440, loc$1441) {
        return function (parseFunction$1442) {
            function isBinary$1443(node$1445) {
                return node$1445.type === Syntax$738.LogicalExpression || node$1445.type === Syntax$738.BinaryExpression;
            }
            function visit$1444(node$1446) {
                var start$1447, end$1448;
                if (isBinary$1443(node$1446.left)) {
                    visit$1444(node$1446.left);
                }
                if (isBinary$1443(node$1446.right)) {
                    visit$1444(node$1446.right);
                }
                if (range$1440) {
                    if (node$1446.left.groupRange || node$1446.right.groupRange) {
                        start$1447 = node$1446.left.groupRange ? node$1446.left.groupRange[0] : node$1446.left.range[0];
                        end$1448 = node$1446.right.groupRange ? node$1446.right.groupRange[1] : node$1446.right.range[1];
                        node$1446.range = [
                            start$1447,
                            end$1448
                        ];
                    } else if (typeof node$1446.range === 'undefined') {
                        start$1447 = node$1446.left.range[0];
                        end$1448 = node$1446.right.range[1];
                        node$1446.range = [
                            start$1447,
                            end$1448
                        ];
                    }
                }
                if (loc$1441) {
                    if (node$1446.left.groupLoc || node$1446.right.groupLoc) {
                        start$1447 = node$1446.left.groupLoc ? node$1446.left.groupLoc.start : node$1446.left.loc.start;
                        end$1448 = node$1446.right.groupLoc ? node$1446.right.groupLoc.end : node$1446.right.loc.end;
                        node$1446.loc = {
                            start: start$1447,
                            end: end$1448
                        };
                        node$1446 = delegate$754.postProcess(node$1446);
                    } else if (typeof node$1446.loc === 'undefined') {
                        node$1446.loc = {
                            start: node$1446.left.loc.start,
                            end: node$1446.right.loc.end
                        };
                        node$1446 = delegate$754.postProcess(node$1446);
                    }
                }
            }
            return function () {
                var marker$1449, node$1450, curr$1451 = lookahead$757;
                marker$1449 = createLocationMarker$895();
                node$1450 = parseFunction$1442.apply(null, arguments);
                marker$1449.end();
                if (node$1450.type !== Syntax$738.Program) {
                    if (curr$1451.leadingComments) {
                        node$1450.leadingComments = curr$1451.leadingComments;
                    }
                    if (curr$1451.trailingComments) {
                        node$1450.trailingComments = curr$1451.trailingComments;
                    }
                }
                if (range$1440 && typeof node$1450.range === 'undefined') {
                    marker$1449.apply(node$1450);
                }
                if (loc$1441 && typeof node$1450.loc === 'undefined') {
                    marker$1449.apply(node$1450);
                }
                if (isBinary$1443(node$1450)) {
                    visit$1444(node$1450);
                }
                return node$1450;
            };
        };
    }
    function patch$901() {
        var wrapTracking$1452;
        if (extra$760.comments) {
            extra$760.skipComment = skipComment$774;
            skipComment$774 = scanComment$889;
        }
        if (extra$760.range || extra$760.loc) {
            extra$760.parseGroupExpression = parseGroupExpression$815;
            extra$760.parseLeftHandSideExpression = parseLeftHandSideExpression$824;
            extra$760.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$823;
            parseGroupExpression$815 = trackGroupExpression$896;
            parseLeftHandSideExpression$824 = trackLeftHandSideExpression$897;
            parseLeftHandSideExpressionAllowCall$823 = trackLeftHandSideExpressionAllowCall$898;
            wrapTracking$1452 = wrapTrackingFunction$900(extra$760.range, extra$760.loc);
            extra$760.parseArrayInitialiser = parseArrayInitialiser$807;
            extra$760.parseAssignmentExpression = parseAssignmentExpression$834;
            extra$760.parseBinaryExpression = parseBinaryExpression$828;
            extra$760.parseBlock = parseBlock$837;
            extra$760.parseFunctionSourceElements = parseFunctionSourceElements$868;
            extra$760.parseCatchClause = parseCatchClause$863;
            extra$760.parseComputedMember = parseComputedMember$821;
            extra$760.parseConditionalExpression = parseConditionalExpression$829;
            extra$760.parseConstLetDeclaration = parseConstLetDeclaration$842;
            extra$760.parseExportBatchSpecifier = parseExportBatchSpecifier$844;
            extra$760.parseExportDeclaration = parseExportDeclaration$846;
            extra$760.parseExportSpecifier = parseExportSpecifier$845;
            extra$760.parseExpression = parseExpression$835;
            extra$760.parseForVariableDeclaration = parseForVariableDeclaration$854;
            extra$760.parseFunctionDeclaration = parseFunctionDeclaration$872;
            extra$760.parseFunctionExpression = parseFunctionExpression$873;
            extra$760.parseParams = parseParams$871;
            extra$760.parseImportDeclaration = parseImportDeclaration$847;
            extra$760.parseImportSpecifier = parseImportSpecifier$848;
            extra$760.parseModuleDeclaration = parseModuleDeclaration$843;
            extra$760.parseModuleBlock = parseModuleBlock$886;
            extra$760.parseNewExpression = parseNewExpression$822;
            extra$760.parseNonComputedProperty = parseNonComputedProperty$819;
            extra$760.parseObjectInitialiser = parseObjectInitialiser$812;
            extra$760.parseObjectProperty = parseObjectProperty$811;
            extra$760.parseObjectPropertyKey = parseObjectPropertyKey$810;
            extra$760.parsePostfixExpression = parsePostfixExpression$825;
            extra$760.parsePrimaryExpression = parsePrimaryExpression$816;
            extra$760.parseProgram = parseProgram$887;
            extra$760.parsePropertyFunction = parsePropertyFunction$808;
            extra$760.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$818;
            extra$760.parseTemplateElement = parseTemplateElement$813;
            extra$760.parseTemplateLiteral = parseTemplateLiteral$814;
            extra$760.parseStatement = parseStatement$866;
            extra$760.parseSwitchCase = parseSwitchCase$860;
            extra$760.parseUnaryExpression = parseUnaryExpression$826;
            extra$760.parseVariableDeclaration = parseVariableDeclaration$839;
            extra$760.parseVariableIdentifier = parseVariableIdentifier$838;
            extra$760.parseMethodDefinition = parseMethodDefinition$875;
            extra$760.parseClassDeclaration = parseClassDeclaration$879;
            extra$760.parseClassExpression = parseClassExpression$878;
            extra$760.parseClassBody = parseClassBody$877;
            parseArrayInitialiser$807 = wrapTracking$1452(extra$760.parseArrayInitialiser);
            parseAssignmentExpression$834 = wrapTracking$1452(extra$760.parseAssignmentExpression);
            parseBinaryExpression$828 = wrapTracking$1452(extra$760.parseBinaryExpression);
            parseBlock$837 = wrapTracking$1452(extra$760.parseBlock);
            parseFunctionSourceElements$868 = wrapTracking$1452(extra$760.parseFunctionSourceElements);
            parseCatchClause$863 = wrapTracking$1452(extra$760.parseCatchClause);
            parseComputedMember$821 = wrapTracking$1452(extra$760.parseComputedMember);
            parseConditionalExpression$829 = wrapTracking$1452(extra$760.parseConditionalExpression);
            parseConstLetDeclaration$842 = wrapTracking$1452(extra$760.parseConstLetDeclaration);
            parseExportBatchSpecifier$844 = wrapTracking$1452(parseExportBatchSpecifier$844);
            parseExportDeclaration$846 = wrapTracking$1452(parseExportDeclaration$846);
            parseExportSpecifier$845 = wrapTracking$1452(parseExportSpecifier$845);
            parseExpression$835 = wrapTracking$1452(extra$760.parseExpression);
            parseForVariableDeclaration$854 = wrapTracking$1452(extra$760.parseForVariableDeclaration);
            parseFunctionDeclaration$872 = wrapTracking$1452(extra$760.parseFunctionDeclaration);
            parseFunctionExpression$873 = wrapTracking$1452(extra$760.parseFunctionExpression);
            parseParams$871 = wrapTracking$1452(extra$760.parseParams);
            parseImportDeclaration$847 = wrapTracking$1452(extra$760.parseImportDeclaration);
            parseImportSpecifier$848 = wrapTracking$1452(extra$760.parseImportSpecifier);
            parseModuleDeclaration$843 = wrapTracking$1452(extra$760.parseModuleDeclaration);
            parseModuleBlock$886 = wrapTracking$1452(extra$760.parseModuleBlock);
            parseLeftHandSideExpression$824 = wrapTracking$1452(parseLeftHandSideExpression$824);
            parseNewExpression$822 = wrapTracking$1452(extra$760.parseNewExpression);
            parseNonComputedProperty$819 = wrapTracking$1452(extra$760.parseNonComputedProperty);
            parseObjectInitialiser$812 = wrapTracking$1452(extra$760.parseObjectInitialiser);
            parseObjectProperty$811 = wrapTracking$1452(extra$760.parseObjectProperty);
            parseObjectPropertyKey$810 = wrapTracking$1452(extra$760.parseObjectPropertyKey);
            parsePostfixExpression$825 = wrapTracking$1452(extra$760.parsePostfixExpression);
            parsePrimaryExpression$816 = wrapTracking$1452(extra$760.parsePrimaryExpression);
            parseProgram$887 = wrapTracking$1452(extra$760.parseProgram);
            parsePropertyFunction$808 = wrapTracking$1452(extra$760.parsePropertyFunction);
            parseTemplateElement$813 = wrapTracking$1452(extra$760.parseTemplateElement);
            parseTemplateLiteral$814 = wrapTracking$1452(extra$760.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$818 = wrapTracking$1452(extra$760.parseSpreadOrAssignmentExpression);
            parseStatement$866 = wrapTracking$1452(extra$760.parseStatement);
            parseSwitchCase$860 = wrapTracking$1452(extra$760.parseSwitchCase);
            parseUnaryExpression$826 = wrapTracking$1452(extra$760.parseUnaryExpression);
            parseVariableDeclaration$839 = wrapTracking$1452(extra$760.parseVariableDeclaration);
            parseVariableIdentifier$838 = wrapTracking$1452(extra$760.parseVariableIdentifier);
            parseMethodDefinition$875 = wrapTracking$1452(extra$760.parseMethodDefinition);
            parseClassDeclaration$879 = wrapTracking$1452(extra$760.parseClassDeclaration);
            parseClassExpression$878 = wrapTracking$1452(extra$760.parseClassExpression);
            parseClassBody$877 = wrapTracking$1452(extra$760.parseClassBody);
        }
        if (typeof extra$760.tokens !== 'undefined') {
            extra$760.advance = advance$790;
            extra$760.scanRegExp = scanRegExp$787;
            advance$790 = collectToken$891;
            scanRegExp$787 = collectRegex$892;
        }
    }
    function unpatch$902() {
        if (typeof extra$760.skipComment === 'function') {
            skipComment$774 = extra$760.skipComment;
        }
        if (extra$760.range || extra$760.loc) {
            parseArrayInitialiser$807 = extra$760.parseArrayInitialiser;
            parseAssignmentExpression$834 = extra$760.parseAssignmentExpression;
            parseBinaryExpression$828 = extra$760.parseBinaryExpression;
            parseBlock$837 = extra$760.parseBlock;
            parseFunctionSourceElements$868 = extra$760.parseFunctionSourceElements;
            parseCatchClause$863 = extra$760.parseCatchClause;
            parseComputedMember$821 = extra$760.parseComputedMember;
            parseConditionalExpression$829 = extra$760.parseConditionalExpression;
            parseConstLetDeclaration$842 = extra$760.parseConstLetDeclaration;
            parseExportBatchSpecifier$844 = extra$760.parseExportBatchSpecifier;
            parseExportDeclaration$846 = extra$760.parseExportDeclaration;
            parseExportSpecifier$845 = extra$760.parseExportSpecifier;
            parseExpression$835 = extra$760.parseExpression;
            parseForVariableDeclaration$854 = extra$760.parseForVariableDeclaration;
            parseFunctionDeclaration$872 = extra$760.parseFunctionDeclaration;
            parseFunctionExpression$873 = extra$760.parseFunctionExpression;
            parseImportDeclaration$847 = extra$760.parseImportDeclaration;
            parseImportSpecifier$848 = extra$760.parseImportSpecifier;
            parseGroupExpression$815 = extra$760.parseGroupExpression;
            parseLeftHandSideExpression$824 = extra$760.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$823 = extra$760.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$843 = extra$760.parseModuleDeclaration;
            parseModuleBlock$886 = extra$760.parseModuleBlock;
            parseNewExpression$822 = extra$760.parseNewExpression;
            parseNonComputedProperty$819 = extra$760.parseNonComputedProperty;
            parseObjectInitialiser$812 = extra$760.parseObjectInitialiser;
            parseObjectProperty$811 = extra$760.parseObjectProperty;
            parseObjectPropertyKey$810 = extra$760.parseObjectPropertyKey;
            parsePostfixExpression$825 = extra$760.parsePostfixExpression;
            parsePrimaryExpression$816 = extra$760.parsePrimaryExpression;
            parseProgram$887 = extra$760.parseProgram;
            parsePropertyFunction$808 = extra$760.parsePropertyFunction;
            parseTemplateElement$813 = extra$760.parseTemplateElement;
            parseTemplateLiteral$814 = extra$760.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$818 = extra$760.parseSpreadOrAssignmentExpression;
            parseStatement$866 = extra$760.parseStatement;
            parseSwitchCase$860 = extra$760.parseSwitchCase;
            parseUnaryExpression$826 = extra$760.parseUnaryExpression;
            parseVariableDeclaration$839 = extra$760.parseVariableDeclaration;
            parseVariableIdentifier$838 = extra$760.parseVariableIdentifier;
            parseMethodDefinition$875 = extra$760.parseMethodDefinition;
            parseClassDeclaration$879 = extra$760.parseClassDeclaration;
            parseClassExpression$878 = extra$760.parseClassExpression;
            parseClassBody$877 = extra$760.parseClassBody;
        }
        if (typeof extra$760.scanRegExp === 'function') {
            advance$790 = extra$760.advance;
            scanRegExp$787 = extra$760.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$903(object$1453, properties$1454) {
        var entry$1455, result$1456 = {};
        for (entry$1455 in object$1453) {
            if (object$1453.hasOwnProperty(entry$1455)) {
                result$1456[entry$1455] = object$1453[entry$1455];
            }
        }
        for (entry$1455 in properties$1454) {
            if (properties$1454.hasOwnProperty(entry$1455)) {
                result$1456[entry$1455] = properties$1454[entry$1455];
            }
        }
        return result$1456;
    }
    function tokenize$904(code$1457, options$1458) {
        var toString$1459, token$1460, tokens$1461;
        toString$1459 = String;
        if (typeof code$1457 !== 'string' && !(code$1457 instanceof String)) {
            code$1457 = toString$1459(code$1457);
        }
        delegate$754 = SyntaxTreeDelegate$742;
        source$744 = code$1457;
        index$746 = 0;
        lineNumber$747 = source$744.length > 0 ? 1 : 0;
        lineStart$748 = 0;
        length$753 = source$744.length;
        lookahead$757 = null;
        state$759 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$760 = {};
        // Options matching.
        options$1458 = options$1458 || {};
        // Of course we collect tokens here.
        options$1458.tokens = true;
        extra$760.tokens = [];
        extra$760.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$760.openParenToken = -1;
        extra$760.openCurlyToken = -1;
        extra$760.range = typeof options$1458.range === 'boolean' && options$1458.range;
        extra$760.loc = typeof options$1458.loc === 'boolean' && options$1458.loc;
        if (typeof options$1458.comment === 'boolean' && options$1458.comment) {
            extra$760.comments = [];
        }
        if (typeof options$1458.tolerant === 'boolean' && options$1458.tolerant) {
            extra$760.errors = [];
        }
        if (length$753 > 0) {
            if (typeof source$744[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1457 instanceof String) {
                    source$744 = code$1457.valueOf();
                }
            }
        }
        patch$901();
        try {
            peek$792();
            if (lookahead$757.type === Token$735.EOF) {
                return extra$760.tokens;
            }
            token$1460 = lex$791();
            while (lookahead$757.type !== Token$735.EOF) {
                try {
                    token$1460 = lex$791();
                } catch (lexError$1462) {
                    token$1460 = lookahead$757;
                    if (extra$760.errors) {
                        extra$760.errors.push(lexError$1462);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1462;
                    }
                }
            }
            filterTokenLocation$893();
            tokens$1461 = extra$760.tokens;
            if (typeof extra$760.comments !== 'undefined') {
                filterCommentLocation$890();
                tokens$1461.comments = extra$760.comments;
            }
            if (typeof extra$760.errors !== 'undefined') {
                tokens$1461.errors = extra$760.errors;
            }
        } catch (e$1463) {
            throw e$1463;
        } finally {
            unpatch$902();
            extra$760 = {};
        }
        return tokens$1461;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$905(toks$1464, start$1465, inExprDelim$1466, parentIsBlock$1467) {
        var assignOps$1468 = [
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
        var binaryOps$1469 = [
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
        var unaryOps$1470 = [
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
        function back$1471(n$1472) {
            var idx$1473 = toks$1464.length - n$1472 > 0 ? toks$1464.length - n$1472 : 0;
            return toks$1464[idx$1473];
        }
        if (inExprDelim$1466 && toks$1464.length - (start$1465 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1471(start$1465 + 2).value === ':' && parentIsBlock$1467) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$762(back$1471(start$1465 + 2).value, unaryOps$1470.concat(binaryOps$1469).concat(assignOps$1468))) {
            // ... + {...}
            return false;
        } else if (back$1471(start$1465 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1474 = typeof back$1471(start$1465 + 1).startLineNumber !== 'undefined' ? back$1471(start$1465 + 1).startLineNumber : back$1471(start$1465 + 1).lineNumber;
            if (back$1471(start$1465 + 2).lineNumber !== currLineNumber$1474) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$762(back$1471(start$1465 + 2).value, [
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
    function readToken$906(toks$1475, inExprDelim$1476, parentIsBlock$1477) {
        var delimiters$1478 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1479 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1480 = toks$1475.length - 1;
        var comments$1481, commentsLen$1482 = extra$760.comments.length;
        function back$1483(n$1487) {
            var idx$1488 = toks$1475.length - n$1487 > 0 ? toks$1475.length - n$1487 : 0;
            return toks$1475[idx$1488];
        }
        function attachComments$1484(token$1489) {
            if (comments$1481) {
                token$1489.leadingComments = comments$1481;
            }
            return token$1489;
        }
        function _advance$1485() {
            return attachComments$1484(advance$790());
        }
        function _scanRegExp$1486() {
            return attachComments$1484(scanRegExp$787());
        }
        skipComment$774();
        if (extra$760.comments.length > commentsLen$1482) {
            comments$1481 = extra$760.comments.slice(commentsLen$1482);
        }
        if (isIn$762(source$744[index$746], delimiters$1478)) {
            return attachComments$1484(readDelim$907(toks$1475, inExprDelim$1476, parentIsBlock$1477));
        }
        if (source$744[index$746] === '/') {
            var prev$1490 = back$1483(1);
            if (prev$1490) {
                if (prev$1490.value === '()') {
                    if (isIn$762(back$1483(2).value, parenIdents$1479)) {
                        // ... if (...) / ...
                        return _scanRegExp$1486();
                    }
                    // ... (...) / ...
                    return _advance$1485();
                }
                if (prev$1490.value === '{}') {
                    if (blockAllowed$905(toks$1475, 0, inExprDelim$1476, parentIsBlock$1477)) {
                        if (back$1483(2).value === '()') {
                            // named function
                            if (back$1483(4).value === 'function') {
                                if (!blockAllowed$905(toks$1475, 3, inExprDelim$1476, parentIsBlock$1477)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1485();
                                }
                                if (toks$1475.length - 5 <= 0 && inExprDelim$1476) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1485();
                                }
                            }
                            // unnamed function
                            if (back$1483(3).value === 'function') {
                                if (!blockAllowed$905(toks$1475, 2, inExprDelim$1476, parentIsBlock$1477)) {
                                    // new function (...) {...} / ...
                                    return _advance$1485();
                                }
                                if (toks$1475.length - 4 <= 0 && inExprDelim$1476) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1485();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1486();
                    } else {
                        // ... + {...} / ...
                        return _advance$1485();
                    }
                }
                if (prev$1490.type === Token$735.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1486();
                }
                if (isKeyword$773(prev$1490.value)) {
                    // typeof /...
                    return _scanRegExp$1486();
                }
                return _advance$1485();
            }
            return _scanRegExp$1486();
        }
        return _advance$1485();
    }
    function readDelim$907(toks$1491, inExprDelim$1492, parentIsBlock$1493) {
        var startDelim$1494 = advance$790(), matchDelim$1495 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1496 = [];
        var delimiters$1497 = [
                '(',
                '{',
                '['
            ];
        assert$761(delimiters$1497.indexOf(startDelim$1494.value) !== -1, 'Need to begin at the delimiter');
        var token$1498 = startDelim$1494;
        var startLineNumber$1499 = token$1498.lineNumber;
        var startLineStart$1500 = token$1498.lineStart;
        var startRange$1501 = token$1498.range;
        var delimToken$1502 = {};
        delimToken$1502.type = Token$735.Delimiter;
        delimToken$1502.value = startDelim$1494.value + matchDelim$1495[startDelim$1494.value];
        delimToken$1502.startLineNumber = startLineNumber$1499;
        delimToken$1502.startLineStart = startLineStart$1500;
        delimToken$1502.startRange = startRange$1501;
        var delimIsBlock$1503 = false;
        if (startDelim$1494.value === '{') {
            delimIsBlock$1503 = blockAllowed$905(toks$1491.concat(delimToken$1502), 0, inExprDelim$1492, parentIsBlock$1493);
        }
        while (index$746 <= length$753) {
            token$1498 = readToken$906(inner$1496, startDelim$1494.value === '(' || startDelim$1494.value === '[', delimIsBlock$1503);
            if (token$1498.type === Token$735.Punctuator && token$1498.value === matchDelim$1495[startDelim$1494.value]) {
                if (token$1498.leadingComments) {
                    delimToken$1502.trailingComments = token$1498.leadingComments;
                }
                break;
            } else if (token$1498.type === Token$735.EOF) {
                throwError$795({}, Messages$740.UnexpectedEOS);
            } else {
                inner$1496.push(token$1498);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$746 >= length$753 && matchDelim$1495[startDelim$1494.value] !== source$744[length$753 - 1]) {
            throwError$795({}, Messages$740.UnexpectedEOS);
        }
        var endLineNumber$1504 = token$1498.lineNumber;
        var endLineStart$1505 = token$1498.lineStart;
        var endRange$1506 = token$1498.range;
        delimToken$1502.inner = inner$1496;
        delimToken$1502.endLineNumber = endLineNumber$1504;
        delimToken$1502.endLineStart = endLineStart$1505;
        delimToken$1502.endRange = endRange$1506;
        return delimToken$1502;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$908(code$1507) {
        var token$1508, tokenTree$1509 = [];
        extra$760 = {};
        extra$760.comments = [];
        patch$901();
        source$744 = code$1507;
        index$746 = 0;
        lineNumber$747 = source$744.length > 0 ? 1 : 0;
        lineStart$748 = 0;
        length$753 = source$744.length;
        state$759 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$746 < length$753) {
            tokenTree$1509.push(readToken$906(tokenTree$1509, false, false));
        }
        var last$1510 = tokenTree$1509[tokenTree$1509.length - 1];
        if (last$1510 && last$1510.type !== Token$735.EOF) {
            tokenTree$1509.push({
                type: Token$735.EOF,
                value: '',
                lineNumber: last$1510.lineNumber,
                lineStart: last$1510.lineStart,
                range: [
                    index$746,
                    index$746
                ]
            });
        }
        return expander$734.tokensToSyntax(tokenTree$1509);
    }
    function parse$909(code$1511, options$1512) {
        var program$1513, toString$1514;
        extra$760 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1511)) {
            tokenStream$755 = code$1511;
            length$753 = tokenStream$755.length;
            lineNumber$747 = tokenStream$755.length > 0 ? 1 : 0;
            source$744 = undefined;
        } else {
            toString$1514 = String;
            if (typeof code$1511 !== 'string' && !(code$1511 instanceof String)) {
                code$1511 = toString$1514(code$1511);
            }
            source$744 = code$1511;
            length$753 = source$744.length;
            lineNumber$747 = source$744.length > 0 ? 1 : 0;
        }
        delegate$754 = SyntaxTreeDelegate$742;
        streamIndex$756 = -1;
        index$746 = 0;
        lineStart$748 = 0;
        sm_lineStart$750 = 0;
        sm_lineNumber$749 = lineNumber$747;
        sm_index$752 = 0;
        sm_range$751 = [
            0,
            0
        ];
        lookahead$757 = null;
        state$759 = {
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
        if (typeof options$1512 !== 'undefined') {
            extra$760.range = typeof options$1512.range === 'boolean' && options$1512.range;
            extra$760.loc = typeof options$1512.loc === 'boolean' && options$1512.loc;
            if (extra$760.loc && options$1512.source !== null && options$1512.source !== undefined) {
                delegate$754 = extend$903(delegate$754, {
                    'postProcess': function (node$1515) {
                        node$1515.loc.source = toString$1514(options$1512.source);
                        return node$1515;
                    }
                });
            }
            if (typeof options$1512.tokens === 'boolean' && options$1512.tokens) {
                extra$760.tokens = [];
            }
            if (typeof options$1512.comment === 'boolean' && options$1512.comment) {
                extra$760.comments = [];
            }
            if (typeof options$1512.tolerant === 'boolean' && options$1512.tolerant) {
                extra$760.errors = [];
            }
        }
        if (length$753 > 0) {
            if (source$744 && typeof source$744[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1511 instanceof String) {
                    source$744 = code$1511.valueOf();
                }
            }
        }
        extra$760 = { loc: true };
        patch$901();
        try {
            program$1513 = parseProgram$887();
            if (typeof extra$760.comments !== 'undefined') {
                filterCommentLocation$890();
                program$1513.comments = extra$760.comments;
            }
            if (typeof extra$760.tokens !== 'undefined') {
                filterTokenLocation$893();
                program$1513.tokens = extra$760.tokens;
            }
            if (typeof extra$760.errors !== 'undefined') {
                program$1513.errors = extra$760.errors;
            }
            if (extra$760.range || extra$760.loc) {
                program$1513.body = filterGroup$899(program$1513.body);
            }
        } catch (e$1516) {
            throw e$1516;
        } finally {
            unpatch$902();
            extra$760 = {};
        }
        return program$1513;
    }
    exports$733.tokenize = tokenize$904;
    exports$733.read = read$908;
    exports$733.Token = Token$735;
    exports$733.assert = assert$761;
    exports$733.parse = parse$909;
    // Deep copy.
    exports$733.Syntax = function () {
        var name$1517, types$1518 = {};
        if (typeof Object.create === 'function') {
            types$1518 = Object.create(null);
        }
        for (name$1517 in Syntax$738) {
            if (Syntax$738.hasOwnProperty(name$1517)) {
                types$1518[name$1517] = Syntax$738[name$1517];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1518);
        }
        return types$1518;
    }();
}));
//# sourceMappingURL=parser.js.map