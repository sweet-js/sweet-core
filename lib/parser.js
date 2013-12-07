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
(function (root$713, factory$714) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$714);
    } else if (typeof exports !== 'undefined') {
        factory$714(exports, require('./expander'));
    } else {
        factory$714(root$713.esprima = {});
    }
}(this, function (exports$715, expander$716) {
    'use strict';
    var Token$717, TokenName$718, FnExprTokens$719, Syntax$720, PropertyKind$721, Messages$722, Regex$723, SyntaxTreeDelegate$724, ClassPropertyType$725, source$726, strict$727, index$728, lineNumber$729, lineStart$730, sm_lineNumber$731, sm_lineStart$732, sm_range$733, sm_index$734, length$735, delegate$736, tokenStream$737, streamIndex$738, lookahead$739, lookaheadIndex$740, state$741, extra$742;
    Token$717 = {
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
    TokenName$718 = {};
    TokenName$718[Token$717.BooleanLiteral] = 'Boolean';
    TokenName$718[Token$717.EOF] = '<end>';
    TokenName$718[Token$717.Identifier] = 'Identifier';
    TokenName$718[Token$717.Keyword] = 'Keyword';
    TokenName$718[Token$717.NullLiteral] = 'Null';
    TokenName$718[Token$717.NumericLiteral] = 'Numeric';
    TokenName$718[Token$717.Punctuator] = 'Punctuator';
    TokenName$718[Token$717.StringLiteral] = 'String';
    TokenName$718[Token$717.RegularExpression] = 'RegularExpression';
    TokenName$718[Token$717.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$719 = [
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
    Syntax$720 = {
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
    PropertyKind$721 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$725 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$722 = {
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
    Regex$723 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$743(condition$892, message$893) {
        if (!condition$892) {
            throw new Error('ASSERT: ' + message$893);
        }
    }
    function isIn$744(el$894, list$895) {
        return list$895.indexOf(el$894) !== -1;
    }
    function isDecimalDigit$745(ch$896) {
        return ch$896 >= 48 && ch$896 <= 57;
    }    // 0..9
    function isHexDigit$746(ch$897) {
        return '0123456789abcdefABCDEF'.indexOf(ch$897) >= 0;
    }
    function isOctalDigit$747(ch$898) {
        return '01234567'.indexOf(ch$898) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$748(ch$899) {
        return ch$899 === 32 || ch$899 === 9 || ch$899 === 11 || ch$899 === 12 || ch$899 === 160 || ch$899 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$899)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$749(ch$900) {
        return ch$900 === 10 || ch$900 === 13 || ch$900 === 8232 || ch$900 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$750(ch$901) {
        return ch$901 === 36 || ch$901 === 95 || ch$901 >= 65 && ch$901 <= 90 || ch$901 >= 97 && ch$901 <= 122 || ch$901 === 92 || ch$901 >= 128 && Regex$723.NonAsciiIdentifierStart.test(String.fromCharCode(ch$901));
    }
    function isIdentifierPart$751(ch$902) {
        return ch$902 === 36 || ch$902 === 95 || ch$902 >= 65 && ch$902 <= 90 || ch$902 >= 97 && ch$902 <= 122 || ch$902 >= 48 && ch$902 <= 57 || ch$902 === 92 || ch$902 >= 128 && Regex$723.NonAsciiIdentifierPart.test(String.fromCharCode(ch$902));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$752(id$903) {
        switch (id$903) {
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
    function isStrictModeReservedWord$753(id$904) {
        switch (id$904) {
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
    function isRestrictedWord$754(id$905) {
        return id$905 === 'eval' || id$905 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$755(id$906) {
        if (strict$727 && isStrictModeReservedWord$753(id$906)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$906.length) {
        case 2:
            return id$906 === 'if' || id$906 === 'in' || id$906 === 'do';
        case 3:
            return id$906 === 'var' || id$906 === 'for' || id$906 === 'new' || id$906 === 'try' || id$906 === 'let';
        case 4:
            return id$906 === 'this' || id$906 === 'else' || id$906 === 'case' || id$906 === 'void' || id$906 === 'with' || id$906 === 'enum';
        case 5:
            return id$906 === 'while' || id$906 === 'break' || id$906 === 'catch' || id$906 === 'throw' || id$906 === 'const' || id$906 === 'yield' || id$906 === 'class' || id$906 === 'super';
        case 6:
            return id$906 === 'return' || id$906 === 'typeof' || id$906 === 'delete' || id$906 === 'switch' || id$906 === 'export' || id$906 === 'import';
        case 7:
            return id$906 === 'default' || id$906 === 'finally' || id$906 === 'extends';
        case 8:
            return id$906 === 'function' || id$906 === 'continue' || id$906 === 'debugger';
        case 10:
            return id$906 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$756() {
        var ch$907, blockComment$908, lineComment$909;
        blockComment$908 = false;
        lineComment$909 = false;
        while (index$728 < length$735) {
            ch$907 = source$726.charCodeAt(index$728);
            if (lineComment$909) {
                ++index$728;
                if (isLineTerminator$749(ch$907)) {
                    lineComment$909 = false;
                    if (ch$907 === 13 && source$726.charCodeAt(index$728) === 10) {
                        ++index$728;
                    }
                    ++lineNumber$729;
                    lineStart$730 = index$728;
                }
            } else if (blockComment$908) {
                if (isLineTerminator$749(ch$907)) {
                    if (ch$907 === 13 && source$726.charCodeAt(index$728 + 1) === 10) {
                        ++index$728;
                    }
                    ++lineNumber$729;
                    ++index$728;
                    lineStart$730 = index$728;
                    if (index$728 >= length$735) {
                        throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$907 = source$726.charCodeAt(index$728++);
                    if (index$728 >= length$735) {
                        throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$907 === 42) {
                        ch$907 = source$726.charCodeAt(index$728);
                        if (ch$907 === 47) {
                            ++index$728;
                            blockComment$908 = false;
                        }
                    }
                }
            } else if (ch$907 === 47) {
                ch$907 = source$726.charCodeAt(index$728 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$907 === 47) {
                    index$728 += 2;
                    lineComment$909 = true;
                } else if (ch$907 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$728 += 2;
                    blockComment$908 = true;
                    if (index$728 >= length$735) {
                        throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$748(ch$907)) {
                ++index$728;
            } else if (isLineTerminator$749(ch$907)) {
                ++index$728;
                if (ch$907 === 13 && source$726.charCodeAt(index$728) === 10) {
                    ++index$728;
                }
                ++lineNumber$729;
                lineStart$730 = index$728;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$757(prefix$910) {
        var i$911, len$912, ch$913, code$914 = 0;
        len$912 = prefix$910 === 'u' ? 4 : 2;
        for (i$911 = 0; i$911 < len$912; ++i$911) {
            if (index$728 < length$735 && isHexDigit$746(source$726[index$728])) {
                ch$913 = source$726[index$728++];
                code$914 = code$914 * 16 + '0123456789abcdef'.indexOf(ch$913.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$914);
    }
    function scanUnicodeCodePointEscape$758() {
        var ch$915, code$916, cu1$917, cu2$918;
        ch$915 = source$726[index$728];
        code$916 = 0;
        // At least, one hex digit is required.
        if (ch$915 === '}') {
            throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
        }
        while (index$728 < length$735) {
            ch$915 = source$726[index$728++];
            if (!isHexDigit$746(ch$915)) {
                break;
            }
            code$916 = code$916 * 16 + '0123456789abcdef'.indexOf(ch$915.toLowerCase());
        }
        if (code$916 > 1114111 || ch$915 !== '}') {
            throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$916 <= 65535) {
            return String.fromCharCode(code$916);
        }
        cu1$917 = (code$916 - 65536 >> 10) + 55296;
        cu2$918 = (code$916 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$917, cu2$918);
    }
    function getEscapedIdentifier$759() {
        var ch$919, id$920;
        ch$919 = source$726.charCodeAt(index$728++);
        id$920 = String.fromCharCode(ch$919);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$919 === 92) {
            if (source$726.charCodeAt(index$728) !== 117) {
                throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
            }
            ++index$728;
            ch$919 = scanHexEscape$757('u');
            if (!ch$919 || ch$919 === '\\' || !isIdentifierStart$750(ch$919.charCodeAt(0))) {
                throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
            }
            id$920 = ch$919;
        }
        while (index$728 < length$735) {
            ch$919 = source$726.charCodeAt(index$728);
            if (!isIdentifierPart$751(ch$919)) {
                break;
            }
            ++index$728;
            id$920 += String.fromCharCode(ch$919);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$919 === 92) {
                id$920 = id$920.substr(0, id$920.length - 1);
                if (source$726.charCodeAt(index$728) !== 117) {
                    throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
                }
                ++index$728;
                ch$919 = scanHexEscape$757('u');
                if (!ch$919 || ch$919 === '\\' || !isIdentifierPart$751(ch$919.charCodeAt(0))) {
                    throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
                }
                id$920 += ch$919;
            }
        }
        return id$920;
    }
    function getIdentifier$760() {
        var start$921, ch$922;
        start$921 = index$728++;
        while (index$728 < length$735) {
            ch$922 = source$726.charCodeAt(index$728);
            if (ch$922 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$728 = start$921;
                return getEscapedIdentifier$759();
            }
            if (isIdentifierPart$751(ch$922)) {
                ++index$728;
            } else {
                break;
            }
        }
        return source$726.slice(start$921, index$728);
    }
    function scanIdentifier$761() {
        var start$923, id$924, type$925;
        start$923 = index$728;
        // Backslash (char #92) starts an escaped character.
        id$924 = source$726.charCodeAt(index$728) === 92 ? getEscapedIdentifier$759() : getIdentifier$760();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$924.length === 1) {
            type$925 = Token$717.Identifier;
        } else if (isKeyword$755(id$924)) {
            type$925 = Token$717.Keyword;
        } else if (id$924 === 'null') {
            type$925 = Token$717.NullLiteral;
        } else if (id$924 === 'true' || id$924 === 'false') {
            type$925 = Token$717.BooleanLiteral;
        } else {
            type$925 = Token$717.Identifier;
        }
        return {
            type: type$925,
            value: id$924,
            lineNumber: lineNumber$729,
            lineStart: lineStart$730,
            range: [
                start$923,
                index$728
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$762() {
        var start$926 = index$728, code$927 = source$726.charCodeAt(index$728), code2$928, ch1$929 = source$726[index$728], ch2$930, ch3$931, ch4$932;
        switch (code$927) {
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
            ++index$728;
            if (extra$742.tokenize) {
                if (code$927 === 40) {
                    extra$742.openParenToken = extra$742.tokens.length;
                } else if (code$927 === 123) {
                    extra$742.openCurlyToken = extra$742.tokens.length;
                }
            }
            return {
                type: Token$717.Punctuator,
                value: String.fromCharCode(code$927),
                lineNumber: lineNumber$729,
                lineStart: lineStart$730,
                range: [
                    start$926,
                    index$728
                ]
            };
        default:
            code2$928 = source$726.charCodeAt(index$728 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$928 === 61) {
                switch (code$927) {
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
                    index$728 += 2;
                    return {
                        type: Token$717.Punctuator,
                        value: String.fromCharCode(code$927) + String.fromCharCode(code2$928),
                        lineNumber: lineNumber$729,
                        lineStart: lineStart$730,
                        range: [
                            start$926,
                            index$728
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$728 += 2;
                    // !== and ===
                    if (source$726.charCodeAt(index$728) === 61) {
                        ++index$728;
                    }
                    return {
                        type: Token$717.Punctuator,
                        value: source$726.slice(start$926, index$728),
                        lineNumber: lineNumber$729,
                        lineStart: lineStart$730,
                        range: [
                            start$926,
                            index$728
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$930 = source$726[index$728 + 1];
        ch3$931 = source$726[index$728 + 2];
        ch4$932 = source$726[index$728 + 3];
        // 4-character punctuator: >>>=
        if (ch1$929 === '>' && ch2$930 === '>' && ch3$931 === '>') {
            if (ch4$932 === '=') {
                index$728 += 4;
                return {
                    type: Token$717.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$729,
                    lineStart: lineStart$730,
                    range: [
                        start$926,
                        index$728
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$929 === '>' && ch2$930 === '>' && ch3$931 === '>') {
            index$728 += 3;
            return {
                type: Token$717.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$729,
                lineStart: lineStart$730,
                range: [
                    start$926,
                    index$728
                ]
            };
        }
        if (ch1$929 === '<' && ch2$930 === '<' && ch3$931 === '=') {
            index$728 += 3;
            return {
                type: Token$717.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$729,
                lineStart: lineStart$730,
                range: [
                    start$926,
                    index$728
                ]
            };
        }
        if (ch1$929 === '>' && ch2$930 === '>' && ch3$931 === '=') {
            index$728 += 3;
            return {
                type: Token$717.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$729,
                lineStart: lineStart$730,
                range: [
                    start$926,
                    index$728
                ]
            };
        }
        if (ch1$929 === '.' && ch2$930 === '.' && ch3$931 === '.') {
            index$728 += 3;
            return {
                type: Token$717.Punctuator,
                value: '...',
                lineNumber: lineNumber$729,
                lineStart: lineStart$730,
                range: [
                    start$926,
                    index$728
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$929 === ch2$930 && '+-<>&|'.indexOf(ch1$929) >= 0) {
            index$728 += 2;
            return {
                type: Token$717.Punctuator,
                value: ch1$929 + ch2$930,
                lineNumber: lineNumber$729,
                lineStart: lineStart$730,
                range: [
                    start$926,
                    index$728
                ]
            };
        }
        if (ch1$929 === '=' && ch2$930 === '>') {
            index$728 += 2;
            return {
                type: Token$717.Punctuator,
                value: '=>',
                lineNumber: lineNumber$729,
                lineStart: lineStart$730,
                range: [
                    start$926,
                    index$728
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$929) >= 0) {
            ++index$728;
            return {
                type: Token$717.Punctuator,
                value: ch1$929,
                lineNumber: lineNumber$729,
                lineStart: lineStart$730,
                range: [
                    start$926,
                    index$728
                ]
            };
        }
        if (ch1$929 === '.') {
            ++index$728;
            return {
                type: Token$717.Punctuator,
                value: ch1$929,
                lineNumber: lineNumber$729,
                lineStart: lineStart$730,
                range: [
                    start$926,
                    index$728
                ]
            };
        }
        throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$763(start$933) {
        var number$934 = '';
        while (index$728 < length$735) {
            if (!isHexDigit$746(source$726[index$728])) {
                break;
            }
            number$934 += source$726[index$728++];
        }
        if (number$934.length === 0) {
            throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$750(source$726.charCodeAt(index$728))) {
            throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$717.NumericLiteral,
            value: parseInt('0x' + number$934, 16),
            lineNumber: lineNumber$729,
            lineStart: lineStart$730,
            range: [
                start$933,
                index$728
            ]
        };
    }
    function scanOctalLiteral$764(prefix$935, start$936) {
        var number$937, octal$938;
        if (isOctalDigit$747(prefix$935)) {
            octal$938 = true;
            number$937 = '0' + source$726[index$728++];
        } else {
            octal$938 = false;
            ++index$728;
            number$937 = '';
        }
        while (index$728 < length$735) {
            if (!isOctalDigit$747(source$726[index$728])) {
                break;
            }
            number$937 += source$726[index$728++];
        }
        if (!octal$938 && number$937.length === 0) {
            // only 0o or 0O
            throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$750(source$726.charCodeAt(index$728)) || isDecimalDigit$745(source$726.charCodeAt(index$728))) {
            throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$717.NumericLiteral,
            value: parseInt(number$937, 8),
            octal: octal$938,
            lineNumber: lineNumber$729,
            lineStart: lineStart$730,
            range: [
                start$936,
                index$728
            ]
        };
    }
    function scanNumericLiteral$765() {
        var number$939, start$940, ch$941, octal$942;
        ch$941 = source$726[index$728];
        assert$743(isDecimalDigit$745(ch$941.charCodeAt(0)) || ch$941 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$940 = index$728;
        number$939 = '';
        if (ch$941 !== '.') {
            number$939 = source$726[index$728++];
            ch$941 = source$726[index$728];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$939 === '0') {
                if (ch$941 === 'x' || ch$941 === 'X') {
                    ++index$728;
                    return scanHexLiteral$763(start$940);
                }
                if (ch$941 === 'b' || ch$941 === 'B') {
                    ++index$728;
                    number$939 = '';
                    while (index$728 < length$735) {
                        ch$941 = source$726[index$728];
                        if (ch$941 !== '0' && ch$941 !== '1') {
                            break;
                        }
                        number$939 += source$726[index$728++];
                    }
                    if (number$939.length === 0) {
                        // only 0b or 0B
                        throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$728 < length$735) {
                        ch$941 = source$726.charCodeAt(index$728);
                        if (isIdentifierStart$750(ch$941) || isDecimalDigit$745(ch$941)) {
                            throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$717.NumericLiteral,
                        value: parseInt(number$939, 2),
                        lineNumber: lineNumber$729,
                        lineStart: lineStart$730,
                        range: [
                            start$940,
                            index$728
                        ]
                    };
                }
                if (ch$941 === 'o' || ch$941 === 'O' || isOctalDigit$747(ch$941)) {
                    return scanOctalLiteral$764(ch$941, start$940);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$941 && isDecimalDigit$745(ch$941.charCodeAt(0))) {
                    throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$745(source$726.charCodeAt(index$728))) {
                number$939 += source$726[index$728++];
            }
            ch$941 = source$726[index$728];
        }
        if (ch$941 === '.') {
            number$939 += source$726[index$728++];
            while (isDecimalDigit$745(source$726.charCodeAt(index$728))) {
                number$939 += source$726[index$728++];
            }
            ch$941 = source$726[index$728];
        }
        if (ch$941 === 'e' || ch$941 === 'E') {
            number$939 += source$726[index$728++];
            ch$941 = source$726[index$728];
            if (ch$941 === '+' || ch$941 === '-') {
                number$939 += source$726[index$728++];
            }
            if (isDecimalDigit$745(source$726.charCodeAt(index$728))) {
                while (isDecimalDigit$745(source$726.charCodeAt(index$728))) {
                    number$939 += source$726[index$728++];
                }
            } else {
                throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$750(source$726.charCodeAt(index$728))) {
            throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$717.NumericLiteral,
            value: parseFloat(number$939),
            lineNumber: lineNumber$729,
            lineStart: lineStart$730,
            range: [
                start$940,
                index$728
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$766() {
        var str$943 = '', quote$944, start$945, ch$946, code$947, unescaped$948, restore$949, octal$950 = false;
        quote$944 = source$726[index$728];
        assert$743(quote$944 === '\'' || quote$944 === '"', 'String literal must starts with a quote');
        start$945 = index$728;
        ++index$728;
        while (index$728 < length$735) {
            ch$946 = source$726[index$728++];
            if (ch$946 === quote$944) {
                quote$944 = '';
                break;
            } else if (ch$946 === '\\') {
                ch$946 = source$726[index$728++];
                if (!ch$946 || !isLineTerminator$749(ch$946.charCodeAt(0))) {
                    switch (ch$946) {
                    case 'n':
                        str$943 += '\n';
                        break;
                    case 'r':
                        str$943 += '\r';
                        break;
                    case 't':
                        str$943 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$726[index$728] === '{') {
                            ++index$728;
                            str$943 += scanUnicodeCodePointEscape$758();
                        } else {
                            restore$949 = index$728;
                            unescaped$948 = scanHexEscape$757(ch$946);
                            if (unescaped$948) {
                                str$943 += unescaped$948;
                            } else {
                                index$728 = restore$949;
                                str$943 += ch$946;
                            }
                        }
                        break;
                    case 'b':
                        str$943 += '\b';
                        break;
                    case 'f':
                        str$943 += '\f';
                        break;
                    case 'v':
                        str$943 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$747(ch$946)) {
                            code$947 = '01234567'.indexOf(ch$946);
                            // \0 is not octal escape sequence
                            if (code$947 !== 0) {
                                octal$950 = true;
                            }
                            if (index$728 < length$735 && isOctalDigit$747(source$726[index$728])) {
                                octal$950 = true;
                                code$947 = code$947 * 8 + '01234567'.indexOf(source$726[index$728++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$946) >= 0 && index$728 < length$735 && isOctalDigit$747(source$726[index$728])) {
                                    code$947 = code$947 * 8 + '01234567'.indexOf(source$726[index$728++]);
                                }
                            }
                            str$943 += String.fromCharCode(code$947);
                        } else {
                            str$943 += ch$946;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$729;
                    if (ch$946 === '\r' && source$726[index$728] === '\n') {
                        ++index$728;
                    }
                }
            } else if (isLineTerminator$749(ch$946.charCodeAt(0))) {
                break;
            } else {
                str$943 += ch$946;
            }
        }
        if (quote$944 !== '') {
            throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$717.StringLiteral,
            value: str$943,
            octal: octal$950,
            lineNumber: lineNumber$729,
            lineStart: lineStart$730,
            range: [
                start$945,
                index$728
            ]
        };
    }
    function scanTemplate$767() {
        var cooked$951 = '', ch$952, start$953, terminated$954, tail$955, restore$956, unescaped$957, code$958, octal$959;
        terminated$954 = false;
        tail$955 = false;
        start$953 = index$728;
        ++index$728;
        while (index$728 < length$735) {
            ch$952 = source$726[index$728++];
            if (ch$952 === '`') {
                tail$955 = true;
                terminated$954 = true;
                break;
            } else if (ch$952 === '$') {
                if (source$726[index$728] === '{') {
                    ++index$728;
                    terminated$954 = true;
                    break;
                }
                cooked$951 += ch$952;
            } else if (ch$952 === '\\') {
                ch$952 = source$726[index$728++];
                if (!isLineTerminator$749(ch$952.charCodeAt(0))) {
                    switch (ch$952) {
                    case 'n':
                        cooked$951 += '\n';
                        break;
                    case 'r':
                        cooked$951 += '\r';
                        break;
                    case 't':
                        cooked$951 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$726[index$728] === '{') {
                            ++index$728;
                            cooked$951 += scanUnicodeCodePointEscape$758();
                        } else {
                            restore$956 = index$728;
                            unescaped$957 = scanHexEscape$757(ch$952);
                            if (unescaped$957) {
                                cooked$951 += unescaped$957;
                            } else {
                                index$728 = restore$956;
                                cooked$951 += ch$952;
                            }
                        }
                        break;
                    case 'b':
                        cooked$951 += '\b';
                        break;
                    case 'f':
                        cooked$951 += '\f';
                        break;
                    case 'v':
                        cooked$951 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$747(ch$952)) {
                            code$958 = '01234567'.indexOf(ch$952);
                            // \0 is not octal escape sequence
                            if (code$958 !== 0) {
                                octal$959 = true;
                            }
                            if (index$728 < length$735 && isOctalDigit$747(source$726[index$728])) {
                                octal$959 = true;
                                code$958 = code$958 * 8 + '01234567'.indexOf(source$726[index$728++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$952) >= 0 && index$728 < length$735 && isOctalDigit$747(source$726[index$728])) {
                                    code$958 = code$958 * 8 + '01234567'.indexOf(source$726[index$728++]);
                                }
                            }
                            cooked$951 += String.fromCharCode(code$958);
                        } else {
                            cooked$951 += ch$952;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$729;
                    if (ch$952 === '\r' && source$726[index$728] === '\n') {
                        ++index$728;
                    }
                }
            } else if (isLineTerminator$749(ch$952.charCodeAt(0))) {
                ++lineNumber$729;
                if (ch$952 === '\r' && source$726[index$728] === '\n') {
                    ++index$728;
                }
                cooked$951 += '\n';
            } else {
                cooked$951 += ch$952;
            }
        }
        if (!terminated$954) {
            throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$717.Template,
            value: {
                cooked: cooked$951,
                raw: source$726.slice(start$953 + 1, index$728 - (tail$955 ? 1 : 2))
            },
            tail: tail$955,
            octal: octal$959,
            lineNumber: lineNumber$729,
            lineStart: lineStart$730,
            range: [
                start$953,
                index$728
            ]
        };
    }
    function scanTemplateElement$768(option$960) {
        var startsWith$961, template$962;
        lookahead$739 = null;
        skipComment$756();
        startsWith$961 = option$960.head ? '`' : '}';
        if (source$726[index$728] !== startsWith$961) {
            throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
        }
        template$962 = scanTemplate$767();
        peek$774();
        return template$962;
    }
    function scanRegExp$769() {
        var str$963, ch$964, start$965, pattern$966, flags$967, value$968, classMarker$969 = false, restore$970, terminated$971 = false;
        lookahead$739 = null;
        skipComment$756();
        start$965 = index$728;
        ch$964 = source$726[index$728];
        assert$743(ch$964 === '/', 'Regular expression literal must start with a slash');
        str$963 = source$726[index$728++];
        while (index$728 < length$735) {
            ch$964 = source$726[index$728++];
            str$963 += ch$964;
            if (classMarker$969) {
                if (ch$964 === ']') {
                    classMarker$969 = false;
                }
            } else {
                if (ch$964 === '\\') {
                    ch$964 = source$726[index$728++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$749(ch$964.charCodeAt(0))) {
                        throwError$777({}, Messages$722.UnterminatedRegExp);
                    }
                    str$963 += ch$964;
                } else if (ch$964 === '/') {
                    terminated$971 = true;
                    break;
                } else if (ch$964 === '[') {
                    classMarker$969 = true;
                } else if (isLineTerminator$749(ch$964.charCodeAt(0))) {
                    throwError$777({}, Messages$722.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$971) {
            throwError$777({}, Messages$722.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$966 = str$963.substr(1, str$963.length - 2);
        flags$967 = '';
        while (index$728 < length$735) {
            ch$964 = source$726[index$728];
            if (!isIdentifierPart$751(ch$964.charCodeAt(0))) {
                break;
            }
            ++index$728;
            if (ch$964 === '\\' && index$728 < length$735) {
                ch$964 = source$726[index$728];
                if (ch$964 === 'u') {
                    ++index$728;
                    restore$970 = index$728;
                    ch$964 = scanHexEscape$757('u');
                    if (ch$964) {
                        flags$967 += ch$964;
                        for (str$963 += '\\u'; restore$970 < index$728; ++restore$970) {
                            str$963 += source$726[restore$970];
                        }
                    } else {
                        index$728 = restore$970;
                        flags$967 += 'u';
                        str$963 += '\\u';
                    }
                } else {
                    str$963 += '\\';
                }
            } else {
                flags$967 += ch$964;
                str$963 += ch$964;
            }
        }
        try {
            value$968 = new RegExp(pattern$966, flags$967);
        } catch (e$972) {
            throwError$777({}, Messages$722.InvalidRegExp);
        }
        // peek();
        if (extra$742.tokenize) {
            return {
                type: Token$717.RegularExpression,
                value: value$968,
                lineNumber: lineNumber$729,
                lineStart: lineStart$730,
                range: [
                    start$965,
                    index$728
                ]
            };
        }
        return {
            type: Token$717.RegularExpression,
            literal: str$963,
            value: value$968,
            range: [
                start$965,
                index$728
            ]
        };
    }
    function isIdentifierName$770(token$973) {
        return token$973.type === Token$717.Identifier || token$973.type === Token$717.Keyword || token$973.type === Token$717.BooleanLiteral || token$973.type === Token$717.NullLiteral;
    }
    function advanceSlash$771() {
        var prevToken$974, checkToken$975;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$974 = extra$742.tokens[extra$742.tokens.length - 1];
        if (!prevToken$974) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$769();
        }
        if (prevToken$974.type === 'Punctuator') {
            if (prevToken$974.value === ')') {
                checkToken$975 = extra$742.tokens[extra$742.openParenToken - 1];
                if (checkToken$975 && checkToken$975.type === 'Keyword' && (checkToken$975.value === 'if' || checkToken$975.value === 'while' || checkToken$975.value === 'for' || checkToken$975.value === 'with')) {
                    return scanRegExp$769();
                }
                return scanPunctuator$762();
            }
            if (prevToken$974.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$742.tokens[extra$742.openCurlyToken - 3] && extra$742.tokens[extra$742.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$975 = extra$742.tokens[extra$742.openCurlyToken - 4];
                    if (!checkToken$975) {
                        return scanPunctuator$762();
                    }
                } else if (extra$742.tokens[extra$742.openCurlyToken - 4] && extra$742.tokens[extra$742.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$975 = extra$742.tokens[extra$742.openCurlyToken - 5];
                    if (!checkToken$975) {
                        return scanRegExp$769();
                    }
                } else {
                    return scanPunctuator$762();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$719.indexOf(checkToken$975.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$762();
                }
                // It is a declaration.
                return scanRegExp$769();
            }
            return scanRegExp$769();
        }
        if (prevToken$974.type === 'Keyword') {
            return scanRegExp$769();
        }
        return scanPunctuator$762();
    }
    function advance$772() {
        var ch$976;
        skipComment$756();
        if (index$728 >= length$735) {
            return {
                type: Token$717.EOF,
                lineNumber: lineNumber$729,
                lineStart: lineStart$730,
                range: [
                    index$728,
                    index$728
                ]
            };
        }
        ch$976 = source$726.charCodeAt(index$728);
        // Very common: ( and ) and ;
        if (ch$976 === 40 || ch$976 === 41 || ch$976 === 58) {
            return scanPunctuator$762();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$976 === 39 || ch$976 === 34) {
            return scanStringLiteral$766();
        }
        if (ch$976 === 96) {
            return scanTemplate$767();
        }
        if (isIdentifierStart$750(ch$976)) {
            return scanIdentifier$761();
        }
        // # and @ are allowed for sweet.js
        if (ch$976 === 35 || ch$976 === 64) {
            ++index$728;
            return {
                type: Token$717.Punctuator,
                value: String.fromCharCode(ch$976),
                lineNumber: lineNumber$729,
                lineStart: lineStart$730,
                range: [
                    index$728 - 1,
                    index$728
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$976 === 46) {
            if (isDecimalDigit$745(source$726.charCodeAt(index$728 + 1))) {
                return scanNumericLiteral$765();
            }
            return scanPunctuator$762();
        }
        if (isDecimalDigit$745(ch$976)) {
            return scanNumericLiteral$765();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$742.tokenize && ch$976 === 47) {
            return advanceSlash$771();
        }
        return scanPunctuator$762();
    }
    function lex$773() {
        var token$977;
        token$977 = lookahead$739;
        streamIndex$738 = lookaheadIndex$740;
        lineNumber$729 = token$977.lineNumber;
        lineStart$730 = token$977.lineStart;
        sm_lineNumber$731 = lookahead$739.sm_lineNumber;
        sm_lineStart$732 = lookahead$739.sm_lineStart;
        sm_range$733 = lookahead$739.sm_range;
        sm_index$734 = lookahead$739.sm_range[0];
        lookahead$739 = tokenStream$737[++streamIndex$738].token;
        lookaheadIndex$740 = streamIndex$738;
        index$728 = lookahead$739.range[0];
        return token$977;
    }
    function peek$774() {
        lookaheadIndex$740 = streamIndex$738 + 1;
        if (lookaheadIndex$740 >= length$735) {
            lookahead$739 = {
                type: Token$717.EOF,
                lineNumber: lineNumber$729,
                lineStart: lineStart$730,
                range: [
                    index$728,
                    index$728
                ]
            };
            return;
        }
        lookahead$739 = tokenStream$737[lookaheadIndex$740].token;
        index$728 = lookahead$739.range[0];
    }
    function lookahead2$775() {
        var adv$978, pos$979, line$980, start$981, result$982;
        if (streamIndex$738 + 1 >= length$735 || streamIndex$738 + 2 >= length$735) {
            return {
                type: Token$717.EOF,
                lineNumber: lineNumber$729,
                lineStart: lineStart$730,
                range: [
                    index$728,
                    index$728
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$739 === null) {
            lookaheadIndex$740 = streamIndex$738 + 1;
            lookahead$739 = tokenStream$737[lookaheadIndex$740].token;
            index$728 = lookahead$739.range[0];
        }
        result$982 = tokenStream$737[lookaheadIndex$740 + 1].token;
        return result$982;
    }
    SyntaxTreeDelegate$724 = {
        name: 'SyntaxTree',
        postProcess: function (node$983) {
            return node$983;
        },
        createArrayExpression: function (elements$984) {
            return {
                type: Syntax$720.ArrayExpression,
                elements: elements$984
            };
        },
        createAssignmentExpression: function (operator$985, left$986, right$987) {
            return {
                type: Syntax$720.AssignmentExpression,
                operator: operator$985,
                left: left$986,
                right: right$987
            };
        },
        createBinaryExpression: function (operator$988, left$989, right$990) {
            var type$991 = operator$988 === '||' || operator$988 === '&&' ? Syntax$720.LogicalExpression : Syntax$720.BinaryExpression;
            return {
                type: type$991,
                operator: operator$988,
                left: left$989,
                right: right$990
            };
        },
        createBlockStatement: function (body$992) {
            return {
                type: Syntax$720.BlockStatement,
                body: body$992
            };
        },
        createBreakStatement: function (label$993) {
            return {
                type: Syntax$720.BreakStatement,
                label: label$993
            };
        },
        createCallExpression: function (callee$994, args$995) {
            return {
                type: Syntax$720.CallExpression,
                callee: callee$994,
                'arguments': args$995
            };
        },
        createCatchClause: function (param$996, body$997) {
            return {
                type: Syntax$720.CatchClause,
                param: param$996,
                body: body$997
            };
        },
        createConditionalExpression: function (test$998, consequent$999, alternate$1000) {
            return {
                type: Syntax$720.ConditionalExpression,
                test: test$998,
                consequent: consequent$999,
                alternate: alternate$1000
            };
        },
        createContinueStatement: function (label$1001) {
            return {
                type: Syntax$720.ContinueStatement,
                label: label$1001
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$720.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1002, test$1003) {
            return {
                type: Syntax$720.DoWhileStatement,
                body: body$1002,
                test: test$1003
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$720.EmptyStatement };
        },
        createExpressionStatement: function (expression$1004) {
            return {
                type: Syntax$720.ExpressionStatement,
                expression: expression$1004
            };
        },
        createForStatement: function (init$1005, test$1006, update$1007, body$1008) {
            return {
                type: Syntax$720.ForStatement,
                init: init$1005,
                test: test$1006,
                update: update$1007,
                body: body$1008
            };
        },
        createForInStatement: function (left$1009, right$1010, body$1011) {
            return {
                type: Syntax$720.ForInStatement,
                left: left$1009,
                right: right$1010,
                body: body$1011,
                each: false
            };
        },
        createForOfStatement: function (left$1012, right$1013, body$1014) {
            return {
                type: Syntax$720.ForOfStatement,
                left: left$1012,
                right: right$1013,
                body: body$1014
            };
        },
        createFunctionDeclaration: function (id$1015, params$1016, defaults$1017, body$1018, rest$1019, generator$1020, expression$1021) {
            return {
                type: Syntax$720.FunctionDeclaration,
                id: id$1015,
                params: params$1016,
                defaults: defaults$1017,
                body: body$1018,
                rest: rest$1019,
                generator: generator$1020,
                expression: expression$1021
            };
        },
        createFunctionExpression: function (id$1022, params$1023, defaults$1024, body$1025, rest$1026, generator$1027, expression$1028) {
            return {
                type: Syntax$720.FunctionExpression,
                id: id$1022,
                params: params$1023,
                defaults: defaults$1024,
                body: body$1025,
                rest: rest$1026,
                generator: generator$1027,
                expression: expression$1028
            };
        },
        createIdentifier: function (name$1029) {
            return {
                type: Syntax$720.Identifier,
                name: name$1029
            };
        },
        createIfStatement: function (test$1030, consequent$1031, alternate$1032) {
            return {
                type: Syntax$720.IfStatement,
                test: test$1030,
                consequent: consequent$1031,
                alternate: alternate$1032
            };
        },
        createLabeledStatement: function (label$1033, body$1034) {
            return {
                type: Syntax$720.LabeledStatement,
                label: label$1033,
                body: body$1034
            };
        },
        createLiteral: function (token$1035) {
            return {
                type: Syntax$720.Literal,
                value: token$1035.value,
                raw: String(token$1035.value)
            };
        },
        createMemberExpression: function (accessor$1036, object$1037, property$1038) {
            return {
                type: Syntax$720.MemberExpression,
                computed: accessor$1036 === '[',
                object: object$1037,
                property: property$1038
            };
        },
        createNewExpression: function (callee$1039, args$1040) {
            return {
                type: Syntax$720.NewExpression,
                callee: callee$1039,
                'arguments': args$1040
            };
        },
        createObjectExpression: function (properties$1041) {
            return {
                type: Syntax$720.ObjectExpression,
                properties: properties$1041
            };
        },
        createPostfixExpression: function (operator$1042, argument$1043) {
            return {
                type: Syntax$720.UpdateExpression,
                operator: operator$1042,
                argument: argument$1043,
                prefix: false
            };
        },
        createProgram: function (body$1044) {
            return {
                type: Syntax$720.Program,
                body: body$1044
            };
        },
        createProperty: function (kind$1045, key$1046, value$1047, method$1048, shorthand$1049) {
            return {
                type: Syntax$720.Property,
                key: key$1046,
                value: value$1047,
                kind: kind$1045,
                method: method$1048,
                shorthand: shorthand$1049
            };
        },
        createReturnStatement: function (argument$1050) {
            return {
                type: Syntax$720.ReturnStatement,
                argument: argument$1050
            };
        },
        createSequenceExpression: function (expressions$1051) {
            return {
                type: Syntax$720.SequenceExpression,
                expressions: expressions$1051
            };
        },
        createSwitchCase: function (test$1052, consequent$1053) {
            return {
                type: Syntax$720.SwitchCase,
                test: test$1052,
                consequent: consequent$1053
            };
        },
        createSwitchStatement: function (discriminant$1054, cases$1055) {
            return {
                type: Syntax$720.SwitchStatement,
                discriminant: discriminant$1054,
                cases: cases$1055
            };
        },
        createThisExpression: function () {
            return { type: Syntax$720.ThisExpression };
        },
        createThrowStatement: function (argument$1056) {
            return {
                type: Syntax$720.ThrowStatement,
                argument: argument$1056
            };
        },
        createTryStatement: function (block$1057, guardedHandlers$1058, handlers$1059, finalizer$1060) {
            return {
                type: Syntax$720.TryStatement,
                block: block$1057,
                guardedHandlers: guardedHandlers$1058,
                handlers: handlers$1059,
                finalizer: finalizer$1060
            };
        },
        createUnaryExpression: function (operator$1061, argument$1062) {
            if (operator$1061 === '++' || operator$1061 === '--') {
                return {
                    type: Syntax$720.UpdateExpression,
                    operator: operator$1061,
                    argument: argument$1062,
                    prefix: true
                };
            }
            return {
                type: Syntax$720.UnaryExpression,
                operator: operator$1061,
                argument: argument$1062
            };
        },
        createVariableDeclaration: function (declarations$1063, kind$1064) {
            return {
                type: Syntax$720.VariableDeclaration,
                declarations: declarations$1063,
                kind: kind$1064
            };
        },
        createVariableDeclarator: function (id$1065, init$1066) {
            return {
                type: Syntax$720.VariableDeclarator,
                id: id$1065,
                init: init$1066
            };
        },
        createWhileStatement: function (test$1067, body$1068) {
            return {
                type: Syntax$720.WhileStatement,
                test: test$1067,
                body: body$1068
            };
        },
        createWithStatement: function (object$1069, body$1070) {
            return {
                type: Syntax$720.WithStatement,
                object: object$1069,
                body: body$1070
            };
        },
        createTemplateElement: function (value$1071, tail$1072) {
            return {
                type: Syntax$720.TemplateElement,
                value: value$1071,
                tail: tail$1072
            };
        },
        createTemplateLiteral: function (quasis$1073, expressions$1074) {
            return {
                type: Syntax$720.TemplateLiteral,
                quasis: quasis$1073,
                expressions: expressions$1074
            };
        },
        createSpreadElement: function (argument$1075) {
            return {
                type: Syntax$720.SpreadElement,
                argument: argument$1075
            };
        },
        createTaggedTemplateExpression: function (tag$1076, quasi$1077) {
            return {
                type: Syntax$720.TaggedTemplateExpression,
                tag: tag$1076,
                quasi: quasi$1077
            };
        },
        createArrowFunctionExpression: function (params$1078, defaults$1079, body$1080, rest$1081, expression$1082) {
            return {
                type: Syntax$720.ArrowFunctionExpression,
                id: null,
                params: params$1078,
                defaults: defaults$1079,
                body: body$1080,
                rest: rest$1081,
                generator: false,
                expression: expression$1082
            };
        },
        createMethodDefinition: function (propertyType$1083, kind$1084, key$1085, value$1086) {
            return {
                type: Syntax$720.MethodDefinition,
                key: key$1085,
                value: value$1086,
                kind: kind$1084,
                'static': propertyType$1083 === ClassPropertyType$725.static
            };
        },
        createClassBody: function (body$1087) {
            return {
                type: Syntax$720.ClassBody,
                body: body$1087
            };
        },
        createClassExpression: function (id$1088, superClass$1089, body$1090) {
            return {
                type: Syntax$720.ClassExpression,
                id: id$1088,
                superClass: superClass$1089,
                body: body$1090
            };
        },
        createClassDeclaration: function (id$1091, superClass$1092, body$1093) {
            return {
                type: Syntax$720.ClassDeclaration,
                id: id$1091,
                superClass: superClass$1092,
                body: body$1093
            };
        },
        createExportSpecifier: function (id$1094, name$1095) {
            return {
                type: Syntax$720.ExportSpecifier,
                id: id$1094,
                name: name$1095
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$720.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1096, specifiers$1097, source$1098) {
            return {
                type: Syntax$720.ExportDeclaration,
                declaration: declaration$1096,
                specifiers: specifiers$1097,
                source: source$1098
            };
        },
        createImportSpecifier: function (id$1099, name$1100) {
            return {
                type: Syntax$720.ImportSpecifier,
                id: id$1099,
                name: name$1100
            };
        },
        createImportDeclaration: function (specifiers$1101, kind$1102, source$1103) {
            return {
                type: Syntax$720.ImportDeclaration,
                specifiers: specifiers$1101,
                kind: kind$1102,
                source: source$1103
            };
        },
        createYieldExpression: function (argument$1104, delegate$1105) {
            return {
                type: Syntax$720.YieldExpression,
                argument: argument$1104,
                delegate: delegate$1105
            };
        },
        createModuleDeclaration: function (id$1106, source$1107, body$1108) {
            return {
                type: Syntax$720.ModuleDeclaration,
                id: id$1106,
                source: source$1107,
                body: body$1108
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$776() {
        return lookahead$739.lineNumber !== lineNumber$729;
    }
    // Throw an exception
    function throwError$777(token$1109, messageFormat$1110) {
        var error$1111, args$1112 = Array.prototype.slice.call(arguments, 2), msg$1113 = messageFormat$1110.replace(/%(\d)/g, function (whole$1114, index$1115) {
                assert$743(index$1115 < args$1112.length, 'Message reference must be in range');
                return args$1112[index$1115];
            });
        if (typeof token$1109.lineNumber === 'number') {
            error$1111 = new Error('Line ' + token$1109.lineNumber + ': ' + msg$1113);
            error$1111.index = token$1109.range[0];
            error$1111.lineNumber = token$1109.lineNumber;
            error$1111.column = token$1109.range[0] - lineStart$730 + 1;
        } else {
            error$1111 = new Error('Line ' + lineNumber$729 + ': ' + msg$1113);
            error$1111.index = index$728;
            error$1111.lineNumber = lineNumber$729;
            error$1111.column = index$728 - lineStart$730 + 1;
        }
        error$1111.description = msg$1113;
        throw error$1111;
    }
    function throwErrorTolerant$778() {
        try {
            throwError$777.apply(null, arguments);
        } catch (e$1116) {
            if (extra$742.errors) {
                extra$742.errors.push(e$1116);
            } else {
                throw e$1116;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$779(token$1117) {
        if (token$1117.type === Token$717.EOF) {
            throwError$777(token$1117, Messages$722.UnexpectedEOS);
        }
        if (token$1117.type === Token$717.NumericLiteral) {
            throwError$777(token$1117, Messages$722.UnexpectedNumber);
        }
        if (token$1117.type === Token$717.StringLiteral) {
            throwError$777(token$1117, Messages$722.UnexpectedString);
        }
        if (token$1117.type === Token$717.Identifier) {
            throwError$777(token$1117, Messages$722.UnexpectedIdentifier);
        }
        if (token$1117.type === Token$717.Keyword) {
            if (isFutureReservedWord$752(token$1117.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$727 && isStrictModeReservedWord$753(token$1117.value)) {
                throwErrorTolerant$778(token$1117, Messages$722.StrictReservedWord);
                return;
            }
            throwError$777(token$1117, Messages$722.UnexpectedToken, token$1117.value);
        }
        if (token$1117.type === Token$717.Template) {
            throwError$777(token$1117, Messages$722.UnexpectedTemplate, token$1117.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$777(token$1117, Messages$722.UnexpectedToken, token$1117.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$780(value$1118) {
        var token$1119 = lex$773();
        if (token$1119.type !== Token$717.Punctuator || token$1119.value !== value$1118) {
            throwUnexpected$779(token$1119);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$781(keyword$1120) {
        var token$1121 = lex$773();
        if (token$1121.type !== Token$717.Keyword || token$1121.value !== keyword$1120) {
            throwUnexpected$779(token$1121);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$782(value$1122) {
        return lookahead$739.type === Token$717.Punctuator && lookahead$739.value === value$1122;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$783(keyword$1123) {
        return lookahead$739.type === Token$717.Keyword && lookahead$739.value === keyword$1123;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$784(keyword$1124) {
        return lookahead$739.type === Token$717.Identifier && lookahead$739.value === keyword$1124;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$785() {
        var op$1125;
        if (lookahead$739.type !== Token$717.Punctuator) {
            return false;
        }
        op$1125 = lookahead$739.value;
        return op$1125 === '=' || op$1125 === '*=' || op$1125 === '/=' || op$1125 === '%=' || op$1125 === '+=' || op$1125 === '-=' || op$1125 === '<<=' || op$1125 === '>>=' || op$1125 === '>>>=' || op$1125 === '&=' || op$1125 === '^=' || op$1125 === '|=';
    }
    function consumeSemicolon$786() {
        var line$1126, ch$1127;
        ch$1127 = lookahead$739.value ? lookahead$739.value.charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1127 === 59) {
            lex$773();
            return;
        }
        if (lookahead$739.lineNumber !== lineNumber$729) {
            return;
        }
        if (match$782(';')) {
            lex$773();
            return;
        }
        if (lookahead$739.type !== Token$717.EOF && !match$782('}')) {
            throwUnexpected$779(lookahead$739);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$787(expr$1128) {
        return expr$1128.type === Syntax$720.Identifier || expr$1128.type === Syntax$720.MemberExpression;
    }
    function isAssignableLeftHandSide$788(expr$1129) {
        return isLeftHandSide$787(expr$1129) || expr$1129.type === Syntax$720.ObjectPattern || expr$1129.type === Syntax$720.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$789() {
        var elements$1130 = [], blocks$1131 = [], filter$1132 = null, tmp$1133, possiblecomprehension$1134 = true, body$1135;
        expect$780('[');
        while (!match$782(']')) {
            if (lookahead$739.value === 'for' && lookahead$739.type === Token$717.Keyword) {
                if (!possiblecomprehension$1134) {
                    throwError$777({}, Messages$722.ComprehensionError);
                }
                matchKeyword$783('for');
                tmp$1133 = parseForStatement$837({ ignoreBody: true });
                tmp$1133.of = tmp$1133.type === Syntax$720.ForOfStatement;
                tmp$1133.type = Syntax$720.ComprehensionBlock;
                if (tmp$1133.left.kind) {
                    // can't be let or const
                    throwError$777({}, Messages$722.ComprehensionError);
                }
                blocks$1131.push(tmp$1133);
            } else if (lookahead$739.value === 'if' && lookahead$739.type === Token$717.Keyword) {
                if (!possiblecomprehension$1134) {
                    throwError$777({}, Messages$722.ComprehensionError);
                }
                expectKeyword$781('if');
                expect$780('(');
                filter$1132 = parseExpression$817();
                expect$780(')');
            } else if (lookahead$739.value === ',' && lookahead$739.type === Token$717.Punctuator) {
                possiblecomprehension$1134 = false;
                // no longer allowed.
                lex$773();
                elements$1130.push(null);
            } else {
                tmp$1133 = parseSpreadOrAssignmentExpression$800();
                elements$1130.push(tmp$1133);
                if (tmp$1133 && tmp$1133.type === Syntax$720.SpreadElement) {
                    if (!match$782(']')) {
                        throwError$777({}, Messages$722.ElementAfterSpreadElement);
                    }
                } else if (!(match$782(']') || matchKeyword$783('for') || matchKeyword$783('if'))) {
                    expect$780(',');
                    // this lexes.
                    possiblecomprehension$1134 = false;
                }
            }
        }
        expect$780(']');
        if (filter$1132 && !blocks$1131.length) {
            throwError$777({}, Messages$722.ComprehensionRequiresBlock);
        }
        if (blocks$1131.length) {
            if (elements$1130.length !== 1) {
                throwError$777({}, Messages$722.ComprehensionError);
            }
            return {
                type: Syntax$720.ComprehensionExpression,
                filter: filter$1132,
                blocks: blocks$1131,
                body: elements$1130[0]
            };
        }
        return delegate$736.createArrayExpression(elements$1130);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$790(options$1136) {
        var previousStrict$1137, previousYieldAllowed$1138, params$1139, defaults$1140, body$1141;
        previousStrict$1137 = strict$727;
        previousYieldAllowed$1138 = state$741.yieldAllowed;
        state$741.yieldAllowed = options$1136.generator;
        params$1139 = options$1136.params || [];
        defaults$1140 = options$1136.defaults || [];
        body$1141 = parseConciseBody$849();
        if (options$1136.name && strict$727 && isRestrictedWord$754(params$1139[0].name)) {
            throwErrorTolerant$778(options$1136.name, Messages$722.StrictParamName);
        }
        if (state$741.yieldAllowed && !state$741.yieldFound) {
            throwErrorTolerant$778({}, Messages$722.NoYieldInGenerator);
        }
        strict$727 = previousStrict$1137;
        state$741.yieldAllowed = previousYieldAllowed$1138;
        return delegate$736.createFunctionExpression(null, params$1139, defaults$1140, body$1141, options$1136.rest || null, options$1136.generator, body$1141.type !== Syntax$720.BlockStatement);
    }
    function parsePropertyMethodFunction$791(options$1142) {
        var previousStrict$1143, tmp$1144, method$1145;
        previousStrict$1143 = strict$727;
        strict$727 = true;
        tmp$1144 = parseParams$853();
        if (tmp$1144.stricted) {
            throwErrorTolerant$778(tmp$1144.stricted, tmp$1144.message);
        }
        method$1145 = parsePropertyFunction$790({
            params: tmp$1144.params,
            defaults: tmp$1144.defaults,
            rest: tmp$1144.rest,
            generator: options$1142.generator
        });
        strict$727 = previousStrict$1143;
        return method$1145;
    }
    function parseObjectPropertyKey$792() {
        var token$1146 = lex$773();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1146.type === Token$717.StringLiteral || token$1146.type === Token$717.NumericLiteral) {
            if (strict$727 && token$1146.octal) {
                throwErrorTolerant$778(token$1146, Messages$722.StrictOctalLiteral);
            }
            return delegate$736.createLiteral(token$1146);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$736.createIdentifier(token$1146.value);
    }
    function parseObjectProperty$793() {
        var token$1147, key$1148, id$1149, value$1150, param$1151;
        token$1147 = lookahead$739;
        if (token$1147.type === Token$717.Identifier) {
            id$1149 = parseObjectPropertyKey$792();
            // Property Assignment: Getter and Setter.
            if (token$1147.value === 'get' && !(match$782(':') || match$782('('))) {
                key$1148 = parseObjectPropertyKey$792();
                expect$780('(');
                expect$780(')');
                return delegate$736.createProperty('get', key$1148, parsePropertyFunction$790({ generator: false }), false, false);
            }
            if (token$1147.value === 'set' && !(match$782(':') || match$782('('))) {
                key$1148 = parseObjectPropertyKey$792();
                expect$780('(');
                token$1147 = lookahead$739;
                param$1151 = [parseVariableIdentifier$820()];
                expect$780(')');
                return delegate$736.createProperty('set', key$1148, parsePropertyFunction$790({
                    params: param$1151,
                    generator: false,
                    name: token$1147
                }), false, false);
            }
            if (match$782(':')) {
                lex$773();
                return delegate$736.createProperty('init', id$1149, parseAssignmentExpression$816(), false, false);
            }
            if (match$782('(')) {
                return delegate$736.createProperty('init', id$1149, parsePropertyMethodFunction$791({ generator: false }), true, false);
            }
            return delegate$736.createProperty('init', id$1149, id$1149, false, true);
        }
        if (token$1147.type === Token$717.EOF || token$1147.type === Token$717.Punctuator) {
            if (!match$782('*')) {
                throwUnexpected$779(token$1147);
            }
            lex$773();
            id$1149 = parseObjectPropertyKey$792();
            if (!match$782('(')) {
                throwUnexpected$779(lex$773());
            }
            return delegate$736.createProperty('init', id$1149, parsePropertyMethodFunction$791({ generator: true }), true, false);
        }
        key$1148 = parseObjectPropertyKey$792();
        if (match$782(':')) {
            lex$773();
            return delegate$736.createProperty('init', key$1148, parseAssignmentExpression$816(), false, false);
        }
        if (match$782('(')) {
            return delegate$736.createProperty('init', key$1148, parsePropertyMethodFunction$791({ generator: false }), true, false);
        }
        throwUnexpected$779(lex$773());
    }
    function parseObjectInitialiser$794() {
        var properties$1152 = [], property$1153, name$1154, key$1155, kind$1156, map$1157 = {}, toString$1158 = String;
        expect$780('{');
        while (!match$782('}')) {
            property$1153 = parseObjectProperty$793();
            if (property$1153.key.type === Syntax$720.Identifier) {
                name$1154 = property$1153.key.name;
            } else {
                name$1154 = toString$1158(property$1153.key.value);
            }
            kind$1156 = property$1153.kind === 'init' ? PropertyKind$721.Data : property$1153.kind === 'get' ? PropertyKind$721.Get : PropertyKind$721.Set;
            key$1155 = '$' + name$1154;
            if (Object.prototype.hasOwnProperty.call(map$1157, key$1155)) {
                if (map$1157[key$1155] === PropertyKind$721.Data) {
                    if (strict$727 && kind$1156 === PropertyKind$721.Data) {
                        throwErrorTolerant$778({}, Messages$722.StrictDuplicateProperty);
                    } else if (kind$1156 !== PropertyKind$721.Data) {
                        throwErrorTolerant$778({}, Messages$722.AccessorDataProperty);
                    }
                } else {
                    if (kind$1156 === PropertyKind$721.Data) {
                        throwErrorTolerant$778({}, Messages$722.AccessorDataProperty);
                    } else if (map$1157[key$1155] & kind$1156) {
                        throwErrorTolerant$778({}, Messages$722.AccessorGetSet);
                    }
                }
                map$1157[key$1155] |= kind$1156;
            } else {
                map$1157[key$1155] = kind$1156;
            }
            properties$1152.push(property$1153);
            if (!match$782('}')) {
                expect$780(',');
            }
        }
        expect$780('}');
        return delegate$736.createObjectExpression(properties$1152);
    }
    function parseTemplateElement$795(option$1159) {
        var token$1160 = scanTemplateElement$768(option$1159);
        if (strict$727 && token$1160.octal) {
            throwError$777(token$1160, Messages$722.StrictOctalLiteral);
        }
        return delegate$736.createTemplateElement({
            raw: token$1160.value.raw,
            cooked: token$1160.value.cooked
        }, token$1160.tail);
    }
    function parseTemplateLiteral$796() {
        var quasi$1161, quasis$1162, expressions$1163;
        quasi$1161 = parseTemplateElement$795({ head: true });
        quasis$1162 = [quasi$1161];
        expressions$1163 = [];
        while (!quasi$1161.tail) {
            expressions$1163.push(parseExpression$817());
            quasi$1161 = parseTemplateElement$795({ head: false });
            quasis$1162.push(quasi$1161);
        }
        return delegate$736.createTemplateLiteral(quasis$1162, expressions$1163);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$797() {
        var expr$1164;
        expect$780('(');
        ++state$741.parenthesizedCount;
        expr$1164 = parseExpression$817();
        expect$780(')');
        return expr$1164;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$798() {
        var type$1165, token$1166, resolvedIdent$1167;
        token$1166 = lookahead$739;
        type$1165 = lookahead$739.type;
        if (type$1165 === Token$717.Identifier) {
            resolvedIdent$1167 = expander$716.resolve(tokenStream$737[lookaheadIndex$740]);
            lex$773();
            return delegate$736.createIdentifier(resolvedIdent$1167);
        }
        if (type$1165 === Token$717.StringLiteral || type$1165 === Token$717.NumericLiteral) {
            if (strict$727 && lookahead$739.octal) {
                throwErrorTolerant$778(lookahead$739, Messages$722.StrictOctalLiteral);
            }
            return delegate$736.createLiteral(lex$773());
        }
        if (type$1165 === Token$717.Keyword) {
            if (matchKeyword$783('this')) {
                lex$773();
                return delegate$736.createThisExpression();
            }
            if (matchKeyword$783('function')) {
                return parseFunctionExpression$855();
            }
            if (matchKeyword$783('class')) {
                return parseClassExpression$860();
            }
            if (matchKeyword$783('super')) {
                lex$773();
                return delegate$736.createIdentifier('super');
            }
        }
        if (type$1165 === Token$717.BooleanLiteral) {
            token$1166 = lex$773();
            token$1166.value = token$1166.value === 'true';
            return delegate$736.createLiteral(token$1166);
        }
        if (type$1165 === Token$717.NullLiteral) {
            token$1166 = lex$773();
            token$1166.value = null;
            return delegate$736.createLiteral(token$1166);
        }
        if (match$782('[')) {
            return parseArrayInitialiser$789();
        }
        if (match$782('{')) {
            return parseObjectInitialiser$794();
        }
        if (match$782('(')) {
            return parseGroupExpression$797();
        }
        if (lookahead$739.type === Token$717.RegularExpression) {
            return delegate$736.createLiteral(lex$773());
        }
        if (type$1165 === Token$717.Template) {
            return parseTemplateLiteral$796();
        }
        return throwUnexpected$779(lex$773());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$799() {
        var args$1168 = [], arg$1169;
        expect$780('(');
        if (!match$782(')')) {
            while (streamIndex$738 < length$735) {
                arg$1169 = parseSpreadOrAssignmentExpression$800();
                args$1168.push(arg$1169);
                if (match$782(')')) {
                    break;
                } else if (arg$1169.type === Syntax$720.SpreadElement) {
                    throwError$777({}, Messages$722.ElementAfterSpreadElement);
                }
                expect$780(',');
            }
        }
        expect$780(')');
        return args$1168;
    }
    function parseSpreadOrAssignmentExpression$800() {
        if (match$782('...')) {
            lex$773();
            return delegate$736.createSpreadElement(parseAssignmentExpression$816());
        }
        return parseAssignmentExpression$816();
    }
    function parseNonComputedProperty$801() {
        var token$1170 = lex$773();
        if (!isIdentifierName$770(token$1170)) {
            throwUnexpected$779(token$1170);
        }
        return delegate$736.createIdentifier(token$1170.value);
    }
    function parseNonComputedMember$802() {
        expect$780('.');
        return parseNonComputedProperty$801();
    }
    function parseComputedMember$803() {
        var expr$1171;
        expect$780('[');
        expr$1171 = parseExpression$817();
        expect$780(']');
        return expr$1171;
    }
    function parseNewExpression$804() {
        var callee$1172, args$1173;
        expectKeyword$781('new');
        callee$1172 = parseLeftHandSideExpression$806();
        args$1173 = match$782('(') ? parseArguments$799() : [];
        return delegate$736.createNewExpression(callee$1172, args$1173);
    }
    function parseLeftHandSideExpressionAllowCall$805() {
        var expr$1174, args$1175, property$1176;
        expr$1174 = matchKeyword$783('new') ? parseNewExpression$804() : parsePrimaryExpression$798();
        while (match$782('.') || match$782('[') || match$782('(') || lookahead$739.type === Token$717.Template) {
            if (match$782('(')) {
                args$1175 = parseArguments$799();
                expr$1174 = delegate$736.createCallExpression(expr$1174, args$1175);
            } else if (match$782('[')) {
                expr$1174 = delegate$736.createMemberExpression('[', expr$1174, parseComputedMember$803());
            } else if (match$782('.')) {
                expr$1174 = delegate$736.createMemberExpression('.', expr$1174, parseNonComputedMember$802());
            } else {
                expr$1174 = delegate$736.createTaggedTemplateExpression(expr$1174, parseTemplateLiteral$796());
            }
        }
        return expr$1174;
    }
    function parseLeftHandSideExpression$806() {
        var expr$1177, property$1178;
        expr$1177 = matchKeyword$783('new') ? parseNewExpression$804() : parsePrimaryExpression$798();
        while (match$782('.') || match$782('[') || lookahead$739.type === Token$717.Template) {
            if (match$782('[')) {
                expr$1177 = delegate$736.createMemberExpression('[', expr$1177, parseComputedMember$803());
            } else if (match$782('.')) {
                expr$1177 = delegate$736.createMemberExpression('.', expr$1177, parseNonComputedMember$802());
            } else {
                expr$1177 = delegate$736.createTaggedTemplateExpression(expr$1177, parseTemplateLiteral$796());
            }
        }
        return expr$1177;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$807() {
        var expr$1179 = parseLeftHandSideExpressionAllowCall$805(), token$1180 = lookahead$739;
        if (lookahead$739.type !== Token$717.Punctuator) {
            return expr$1179;
        }
        if ((match$782('++') || match$782('--')) && !peekLineTerminator$776()) {
            // 11.3.1, 11.3.2
            if (strict$727 && expr$1179.type === Syntax$720.Identifier && isRestrictedWord$754(expr$1179.name)) {
                throwErrorTolerant$778({}, Messages$722.StrictLHSPostfix);
            }
            if (!isLeftHandSide$787(expr$1179)) {
                throwError$777({}, Messages$722.InvalidLHSInAssignment);
            }
            token$1180 = lex$773();
            expr$1179 = delegate$736.createPostfixExpression(token$1180.value, expr$1179);
        }
        return expr$1179;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$808() {
        var token$1181, expr$1182;
        if (lookahead$739.type !== Token$717.Punctuator && lookahead$739.type !== Token$717.Keyword) {
            return parsePostfixExpression$807();
        }
        if (match$782('++') || match$782('--')) {
            token$1181 = lex$773();
            expr$1182 = parseUnaryExpression$808();
            // 11.4.4, 11.4.5
            if (strict$727 && expr$1182.type === Syntax$720.Identifier && isRestrictedWord$754(expr$1182.name)) {
                throwErrorTolerant$778({}, Messages$722.StrictLHSPrefix);
            }
            if (!isLeftHandSide$787(expr$1182)) {
                throwError$777({}, Messages$722.InvalidLHSInAssignment);
            }
            return delegate$736.createUnaryExpression(token$1181.value, expr$1182);
        }
        if (match$782('+') || match$782('-') || match$782('~') || match$782('!')) {
            token$1181 = lex$773();
            expr$1182 = parseUnaryExpression$808();
            return delegate$736.createUnaryExpression(token$1181.value, expr$1182);
        }
        if (matchKeyword$783('delete') || matchKeyword$783('void') || matchKeyword$783('typeof')) {
            token$1181 = lex$773();
            expr$1182 = parseUnaryExpression$808();
            expr$1182 = delegate$736.createUnaryExpression(token$1181.value, expr$1182);
            if (strict$727 && expr$1182.operator === 'delete' && expr$1182.argument.type === Syntax$720.Identifier) {
                throwErrorTolerant$778({}, Messages$722.StrictDelete);
            }
            return expr$1182;
        }
        return parsePostfixExpression$807();
    }
    function binaryPrecedence$809(token$1183, allowIn$1184) {
        var prec$1185 = 0;
        if (token$1183.type !== Token$717.Punctuator && token$1183.type !== Token$717.Keyword) {
            return 0;
        }
        switch (token$1183.value) {
        case '||':
            prec$1185 = 1;
            break;
        case '&&':
            prec$1185 = 2;
            break;
        case '|':
            prec$1185 = 3;
            break;
        case '^':
            prec$1185 = 4;
            break;
        case '&':
            prec$1185 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1185 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1185 = 7;
            break;
        case 'in':
            prec$1185 = allowIn$1184 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1185 = 8;
            break;
        case '+':
        case '-':
            prec$1185 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1185 = 11;
            break;
        default:
            break;
        }
        return prec$1185;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$810() {
        var expr$1186, token$1187, prec$1188, previousAllowIn$1189, stack$1190, right$1191, operator$1192, left$1193, i$1194;
        previousAllowIn$1189 = state$741.allowIn;
        state$741.allowIn = true;
        expr$1186 = parseUnaryExpression$808();
        token$1187 = lookahead$739;
        prec$1188 = binaryPrecedence$809(token$1187, previousAllowIn$1189);
        if (prec$1188 === 0) {
            return expr$1186;
        }
        token$1187.prec = prec$1188;
        lex$773();
        stack$1190 = [
            expr$1186,
            token$1187,
            parseUnaryExpression$808()
        ];
        while ((prec$1188 = binaryPrecedence$809(lookahead$739, previousAllowIn$1189)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1190.length > 2 && prec$1188 <= stack$1190[stack$1190.length - 2].prec) {
                right$1191 = stack$1190.pop();
                operator$1192 = stack$1190.pop().value;
                left$1193 = stack$1190.pop();
                stack$1190.push(delegate$736.createBinaryExpression(operator$1192, left$1193, right$1191));
            }
            // Shift.
            token$1187 = lex$773();
            token$1187.prec = prec$1188;
            stack$1190.push(token$1187);
            stack$1190.push(parseUnaryExpression$808());
        }
        state$741.allowIn = previousAllowIn$1189;
        // Final reduce to clean-up the stack.
        i$1194 = stack$1190.length - 1;
        expr$1186 = stack$1190[i$1194];
        while (i$1194 > 1) {
            expr$1186 = delegate$736.createBinaryExpression(stack$1190[i$1194 - 1].value, stack$1190[i$1194 - 2], expr$1186);
            i$1194 -= 2;
        }
        return expr$1186;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$811() {
        var expr$1195, previousAllowIn$1196, consequent$1197, alternate$1198;
        expr$1195 = parseBinaryExpression$810();
        if (match$782('?')) {
            lex$773();
            previousAllowIn$1196 = state$741.allowIn;
            state$741.allowIn = true;
            consequent$1197 = parseAssignmentExpression$816();
            state$741.allowIn = previousAllowIn$1196;
            expect$780(':');
            alternate$1198 = parseAssignmentExpression$816();
            expr$1195 = delegate$736.createConditionalExpression(expr$1195, consequent$1197, alternate$1198);
        }
        return expr$1195;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$812(expr$1199) {
        var i$1200, len$1201, property$1202, element$1203;
        if (expr$1199.type === Syntax$720.ObjectExpression) {
            expr$1199.type = Syntax$720.ObjectPattern;
            for (i$1200 = 0, len$1201 = expr$1199.properties.length; i$1200 < len$1201; i$1200 += 1) {
                property$1202 = expr$1199.properties[i$1200];
                if (property$1202.kind !== 'init') {
                    throwError$777({}, Messages$722.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$812(property$1202.value);
            }
        } else if (expr$1199.type === Syntax$720.ArrayExpression) {
            expr$1199.type = Syntax$720.ArrayPattern;
            for (i$1200 = 0, len$1201 = expr$1199.elements.length; i$1200 < len$1201; i$1200 += 1) {
                element$1203 = expr$1199.elements[i$1200];
                if (element$1203) {
                    reinterpretAsAssignmentBindingPattern$812(element$1203);
                }
            }
        } else if (expr$1199.type === Syntax$720.Identifier) {
            if (isRestrictedWord$754(expr$1199.name)) {
                throwError$777({}, Messages$722.InvalidLHSInAssignment);
            }
        } else if (expr$1199.type === Syntax$720.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$812(expr$1199.argument);
            if (expr$1199.argument.type === Syntax$720.ObjectPattern) {
                throwError$777({}, Messages$722.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1199.type !== Syntax$720.MemberExpression && expr$1199.type !== Syntax$720.CallExpression && expr$1199.type !== Syntax$720.NewExpression) {
                throwError$777({}, Messages$722.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$813(options$1204, expr$1205) {
        var i$1206, len$1207, property$1208, element$1209;
        if (expr$1205.type === Syntax$720.ObjectExpression) {
            expr$1205.type = Syntax$720.ObjectPattern;
            for (i$1206 = 0, len$1207 = expr$1205.properties.length; i$1206 < len$1207; i$1206 += 1) {
                property$1208 = expr$1205.properties[i$1206];
                if (property$1208.kind !== 'init') {
                    throwError$777({}, Messages$722.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$813(options$1204, property$1208.value);
            }
        } else if (expr$1205.type === Syntax$720.ArrayExpression) {
            expr$1205.type = Syntax$720.ArrayPattern;
            for (i$1206 = 0, len$1207 = expr$1205.elements.length; i$1206 < len$1207; i$1206 += 1) {
                element$1209 = expr$1205.elements[i$1206];
                if (element$1209) {
                    reinterpretAsDestructuredParameter$813(options$1204, element$1209);
                }
            }
        } else if (expr$1205.type === Syntax$720.Identifier) {
            validateParam$851(options$1204, expr$1205, expr$1205.name);
        } else {
            if (expr$1205.type !== Syntax$720.MemberExpression) {
                throwError$777({}, Messages$722.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$814(expressions$1210) {
        var i$1211, len$1212, param$1213, params$1214, defaults$1215, defaultCount$1216, options$1217, rest$1218;
        params$1214 = [];
        defaults$1215 = [];
        defaultCount$1216 = 0;
        rest$1218 = null;
        options$1217 = { paramSet: {} };
        for (i$1211 = 0, len$1212 = expressions$1210.length; i$1211 < len$1212; i$1211 += 1) {
            param$1213 = expressions$1210[i$1211];
            if (param$1213.type === Syntax$720.Identifier) {
                params$1214.push(param$1213);
                defaults$1215.push(null);
                validateParam$851(options$1217, param$1213, param$1213.name);
            } else if (param$1213.type === Syntax$720.ObjectExpression || param$1213.type === Syntax$720.ArrayExpression) {
                reinterpretAsDestructuredParameter$813(options$1217, param$1213);
                params$1214.push(param$1213);
                defaults$1215.push(null);
            } else if (param$1213.type === Syntax$720.SpreadElement) {
                assert$743(i$1211 === len$1212 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$813(options$1217, param$1213.argument);
                rest$1218 = param$1213.argument;
            } else if (param$1213.type === Syntax$720.AssignmentExpression) {
                params$1214.push(param$1213.left);
                defaults$1215.push(param$1213.right);
                ++defaultCount$1216;
                validateParam$851(options$1217, param$1213.left, param$1213.left.name);
            } else {
                return null;
            }
        }
        if (options$1217.message === Messages$722.StrictParamDupe) {
            throwError$777(strict$727 ? options$1217.stricted : options$1217.firstRestricted, options$1217.message);
        }
        if (defaultCount$1216 === 0) {
            defaults$1215 = [];
        }
        return {
            params: params$1214,
            defaults: defaults$1215,
            rest: rest$1218,
            stricted: options$1217.stricted,
            firstRestricted: options$1217.firstRestricted,
            message: options$1217.message
        };
    }
    function parseArrowFunctionExpression$815(options$1219) {
        var previousStrict$1220, previousYieldAllowed$1221, body$1222;
        expect$780('=>');
        previousStrict$1220 = strict$727;
        previousYieldAllowed$1221 = state$741.yieldAllowed;
        state$741.yieldAllowed = false;
        body$1222 = parseConciseBody$849();
        if (strict$727 && options$1219.firstRestricted) {
            throwError$777(options$1219.firstRestricted, options$1219.message);
        }
        if (strict$727 && options$1219.stricted) {
            throwErrorTolerant$778(options$1219.stricted, options$1219.message);
        }
        strict$727 = previousStrict$1220;
        state$741.yieldAllowed = previousYieldAllowed$1221;
        return delegate$736.createArrowFunctionExpression(options$1219.params, options$1219.defaults, body$1222, options$1219.rest, body$1222.type !== Syntax$720.BlockStatement);
    }
    function parseAssignmentExpression$816() {
        var expr$1223, token$1224, params$1225, oldParenthesizedCount$1226;
        if (matchKeyword$783('yield')) {
            return parseYieldExpression$856();
        }
        oldParenthesizedCount$1226 = state$741.parenthesizedCount;
        if (match$782('(')) {
            token$1224 = lookahead2$775();
            if (token$1224.type === Token$717.Punctuator && token$1224.value === ')' || token$1224.value === '...') {
                params$1225 = parseParams$853();
                if (!match$782('=>')) {
                    throwUnexpected$779(lex$773());
                }
                return parseArrowFunctionExpression$815(params$1225);
            }
        }
        token$1224 = lookahead$739;
        expr$1223 = parseConditionalExpression$811();
        if (match$782('=>') && (state$741.parenthesizedCount === oldParenthesizedCount$1226 || state$741.parenthesizedCount === oldParenthesizedCount$1226 + 1)) {
            if (expr$1223.type === Syntax$720.Identifier) {
                params$1225 = reinterpretAsCoverFormalsList$814([expr$1223]);
            } else if (expr$1223.type === Syntax$720.SequenceExpression) {
                params$1225 = reinterpretAsCoverFormalsList$814(expr$1223.expressions);
            }
            if (params$1225) {
                return parseArrowFunctionExpression$815(params$1225);
            }
        }
        if (matchAssign$785()) {
            // 11.13.1
            if (strict$727 && expr$1223.type === Syntax$720.Identifier && isRestrictedWord$754(expr$1223.name)) {
                throwErrorTolerant$778(token$1224, Messages$722.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$782('=') && (expr$1223.type === Syntax$720.ObjectExpression || expr$1223.type === Syntax$720.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$812(expr$1223);
            } else if (!isLeftHandSide$787(expr$1223)) {
                throwError$777({}, Messages$722.InvalidLHSInAssignment);
            }
            expr$1223 = delegate$736.createAssignmentExpression(lex$773().value, expr$1223, parseAssignmentExpression$816());
        }
        return expr$1223;
    }
    // 11.14 Comma Operator
    function parseExpression$817() {
        var expr$1227, expressions$1228, sequence$1229, coverFormalsList$1230, spreadFound$1231, oldParenthesizedCount$1232;
        oldParenthesizedCount$1232 = state$741.parenthesizedCount;
        expr$1227 = parseAssignmentExpression$816();
        expressions$1228 = [expr$1227];
        if (match$782(',')) {
            while (streamIndex$738 < length$735) {
                if (!match$782(',')) {
                    break;
                }
                lex$773();
                expr$1227 = parseSpreadOrAssignmentExpression$800();
                expressions$1228.push(expr$1227);
                if (expr$1227.type === Syntax$720.SpreadElement) {
                    spreadFound$1231 = true;
                    if (!match$782(')')) {
                        throwError$777({}, Messages$722.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1229 = delegate$736.createSequenceExpression(expressions$1228);
        }
        if (match$782('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$741.parenthesizedCount === oldParenthesizedCount$1232 || state$741.parenthesizedCount === oldParenthesizedCount$1232 + 1) {
                expr$1227 = expr$1227.type === Syntax$720.SequenceExpression ? expr$1227.expressions : expressions$1228;
                coverFormalsList$1230 = reinterpretAsCoverFormalsList$814(expr$1227);
                if (coverFormalsList$1230) {
                    return parseArrowFunctionExpression$815(coverFormalsList$1230);
                }
            }
            throwUnexpected$779(lex$773());
        }
        if (spreadFound$1231 && lookahead2$775().value !== '=>') {
            throwError$777({}, Messages$722.IllegalSpread);
        }
        return sequence$1229 || expr$1227;
    }
    // 12.1 Block
    function parseStatementList$818() {
        var list$1233 = [], statement$1234;
        while (streamIndex$738 < length$735) {
            if (match$782('}')) {
                break;
            }
            statement$1234 = parseSourceElement$863();
            if (typeof statement$1234 === 'undefined') {
                break;
            }
            list$1233.push(statement$1234);
        }
        return list$1233;
    }
    function parseBlock$819() {
        var block$1235;
        expect$780('{');
        block$1235 = parseStatementList$818();
        expect$780('}');
        return delegate$736.createBlockStatement(block$1235);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$820() {
        var token$1236 = lookahead$739, resolvedIdent$1237;
        if (token$1236.type !== Token$717.Identifier) {
            throwUnexpected$779(token$1236);
        }
        resolvedIdent$1237 = expander$716.resolve(tokenStream$737[lookaheadIndex$740]);
        lex$773();
        return delegate$736.createIdentifier(resolvedIdent$1237);
    }
    function parseVariableDeclaration$821(kind$1238) {
        var id$1239, init$1240 = null;
        if (match$782('{')) {
            id$1239 = parseObjectInitialiser$794();
            reinterpretAsAssignmentBindingPattern$812(id$1239);
        } else if (match$782('[')) {
            id$1239 = parseArrayInitialiser$789();
            reinterpretAsAssignmentBindingPattern$812(id$1239);
        } else {
            id$1239 = state$741.allowKeyword ? parseNonComputedProperty$801() : parseVariableIdentifier$820();
            // 12.2.1
            if (strict$727 && isRestrictedWord$754(id$1239.name)) {
                throwErrorTolerant$778({}, Messages$722.StrictVarName);
            }
        }
        if (kind$1238 === 'const') {
            if (!match$782('=')) {
                throwError$777({}, Messages$722.NoUnintializedConst);
            }
            expect$780('=');
            init$1240 = parseAssignmentExpression$816();
        } else if (match$782('=')) {
            lex$773();
            init$1240 = parseAssignmentExpression$816();
        }
        return delegate$736.createVariableDeclarator(id$1239, init$1240);
    }
    function parseVariableDeclarationList$822(kind$1241) {
        var list$1242 = [];
        do {
            list$1242.push(parseVariableDeclaration$821(kind$1241));
            if (!match$782(',')) {
                break;
            }
            lex$773();
        } while (streamIndex$738 < length$735);
        return list$1242;
    }
    function parseVariableStatement$823() {
        var declarations$1243;
        expectKeyword$781('var');
        declarations$1243 = parseVariableDeclarationList$822();
        consumeSemicolon$786();
        return delegate$736.createVariableDeclaration(declarations$1243, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$824(kind$1244) {
        var declarations$1245;
        expectKeyword$781(kind$1244);
        declarations$1245 = parseVariableDeclarationList$822(kind$1244);
        consumeSemicolon$786();
        return delegate$736.createVariableDeclaration(declarations$1245, kind$1244);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$825() {
        var id$1246, src$1247, body$1248;
        lex$773();
        // 'module'
        if (peekLineTerminator$776()) {
            throwError$777({}, Messages$722.NewlineAfterModule);
        }
        switch (lookahead$739.type) {
        case Token$717.StringLiteral:
            id$1246 = parsePrimaryExpression$798();
            body$1248 = parseModuleBlock$868();
            src$1247 = null;
            break;
        case Token$717.Identifier:
            id$1246 = parseVariableIdentifier$820();
            body$1248 = null;
            if (!matchContextualKeyword$784('from')) {
                throwUnexpected$779(lex$773());
            }
            lex$773();
            src$1247 = parsePrimaryExpression$798();
            if (src$1247.type !== Syntax$720.Literal) {
                throwError$777({}, Messages$722.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$786();
        return delegate$736.createModuleDeclaration(id$1246, src$1247, body$1248);
    }
    function parseExportBatchSpecifier$826() {
        expect$780('*');
        return delegate$736.createExportBatchSpecifier();
    }
    function parseExportSpecifier$827() {
        var id$1249, name$1250 = null;
        id$1249 = parseVariableIdentifier$820();
        if (matchContextualKeyword$784('as')) {
            lex$773();
            name$1250 = parseNonComputedProperty$801();
        }
        return delegate$736.createExportSpecifier(id$1249, name$1250);
    }
    function parseExportDeclaration$828() {
        var previousAllowKeyword$1251, decl$1252, def$1253, src$1254, specifiers$1255;
        expectKeyword$781('export');
        if (lookahead$739.type === Token$717.Keyword) {
            switch (lookahead$739.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$736.createExportDeclaration(parseSourceElement$863(), null, null);
            }
        }
        if (isIdentifierName$770(lookahead$739)) {
            previousAllowKeyword$1251 = state$741.allowKeyword;
            state$741.allowKeyword = true;
            decl$1252 = parseVariableDeclarationList$822('let');
            state$741.allowKeyword = previousAllowKeyword$1251;
            return delegate$736.createExportDeclaration(decl$1252, null, null);
        }
        specifiers$1255 = [];
        src$1254 = null;
        if (match$782('*')) {
            specifiers$1255.push(parseExportBatchSpecifier$826());
        } else {
            expect$780('{');
            do {
                specifiers$1255.push(parseExportSpecifier$827());
            } while (match$782(',') && lex$773());
            expect$780('}');
        }
        if (matchContextualKeyword$784('from')) {
            lex$773();
            src$1254 = parsePrimaryExpression$798();
            if (src$1254.type !== Syntax$720.Literal) {
                throwError$777({}, Messages$722.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$786();
        return delegate$736.createExportDeclaration(null, specifiers$1255, src$1254);
    }
    function parseImportDeclaration$829() {
        var specifiers$1256, kind$1257, src$1258;
        expectKeyword$781('import');
        specifiers$1256 = [];
        if (isIdentifierName$770(lookahead$739)) {
            kind$1257 = 'default';
            specifiers$1256.push(parseImportSpecifier$830());
            if (!matchContextualKeyword$784('from')) {
                throwError$777({}, Messages$722.NoFromAfterImport);
            }
            lex$773();
        } else if (match$782('{')) {
            kind$1257 = 'named';
            lex$773();
            do {
                specifiers$1256.push(parseImportSpecifier$830());
            } while (match$782(',') && lex$773());
            expect$780('}');
            if (!matchContextualKeyword$784('from')) {
                throwError$777({}, Messages$722.NoFromAfterImport);
            }
            lex$773();
        }
        src$1258 = parsePrimaryExpression$798();
        if (src$1258.type !== Syntax$720.Literal) {
            throwError$777({}, Messages$722.InvalidModuleSpecifier);
        }
        consumeSemicolon$786();
        return delegate$736.createImportDeclaration(specifiers$1256, kind$1257, src$1258);
    }
    function parseImportSpecifier$830() {
        var id$1259, name$1260 = null;
        id$1259 = parseNonComputedProperty$801();
        if (matchContextualKeyword$784('as')) {
            lex$773();
            name$1260 = parseVariableIdentifier$820();
        }
        return delegate$736.createImportSpecifier(id$1259, name$1260);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$831() {
        expect$780(';');
        return delegate$736.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$832() {
        var expr$1261 = parseExpression$817();
        consumeSemicolon$786();
        return delegate$736.createExpressionStatement(expr$1261);
    }
    // 12.5 If statement
    function parseIfStatement$833() {
        var test$1262, consequent$1263, alternate$1264;
        expectKeyword$781('if');
        expect$780('(');
        test$1262 = parseExpression$817();
        expect$780(')');
        consequent$1263 = parseStatement$848();
        if (matchKeyword$783('else')) {
            lex$773();
            alternate$1264 = parseStatement$848();
        } else {
            alternate$1264 = null;
        }
        return delegate$736.createIfStatement(test$1262, consequent$1263, alternate$1264);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$834() {
        var body$1265, test$1266, oldInIteration$1267;
        expectKeyword$781('do');
        oldInIteration$1267 = state$741.inIteration;
        state$741.inIteration = true;
        body$1265 = parseStatement$848();
        state$741.inIteration = oldInIteration$1267;
        expectKeyword$781('while');
        expect$780('(');
        test$1266 = parseExpression$817();
        expect$780(')');
        if (match$782(';')) {
            lex$773();
        }
        return delegate$736.createDoWhileStatement(body$1265, test$1266);
    }
    function parseWhileStatement$835() {
        var test$1268, body$1269, oldInIteration$1270;
        expectKeyword$781('while');
        expect$780('(');
        test$1268 = parseExpression$817();
        expect$780(')');
        oldInIteration$1270 = state$741.inIteration;
        state$741.inIteration = true;
        body$1269 = parseStatement$848();
        state$741.inIteration = oldInIteration$1270;
        return delegate$736.createWhileStatement(test$1268, body$1269);
    }
    function parseForVariableDeclaration$836() {
        var token$1271 = lex$773(), declarations$1272 = parseVariableDeclarationList$822();
        return delegate$736.createVariableDeclaration(declarations$1272, token$1271.value);
    }
    function parseForStatement$837(opts$1273) {
        var init$1274, test$1275, update$1276, left$1277, right$1278, body$1279, operator$1280, oldInIteration$1281;
        init$1274 = test$1275 = update$1276 = null;
        expectKeyword$781('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$784('each')) {
            throwError$777({}, Messages$722.EachNotAllowed);
        }
        expect$780('(');
        if (match$782(';')) {
            lex$773();
        } else {
            if (matchKeyword$783('var') || matchKeyword$783('let') || matchKeyword$783('const')) {
                state$741.allowIn = false;
                init$1274 = parseForVariableDeclaration$836();
                state$741.allowIn = true;
                if (init$1274.declarations.length === 1) {
                    if (matchKeyword$783('in') || matchContextualKeyword$784('of')) {
                        operator$1280 = lookahead$739;
                        if (!((operator$1280.value === 'in' || init$1274.kind !== 'var') && init$1274.declarations[0].init)) {
                            lex$773();
                            left$1277 = init$1274;
                            right$1278 = parseExpression$817();
                            init$1274 = null;
                        }
                    }
                }
            } else {
                state$741.allowIn = false;
                init$1274 = parseExpression$817();
                state$741.allowIn = true;
                if (matchContextualKeyword$784('of')) {
                    operator$1280 = lex$773();
                    left$1277 = init$1274;
                    right$1278 = parseExpression$817();
                    init$1274 = null;
                } else if (matchKeyword$783('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$788(init$1274)) {
                        throwError$777({}, Messages$722.InvalidLHSInForIn);
                    }
                    operator$1280 = lex$773();
                    left$1277 = init$1274;
                    right$1278 = parseExpression$817();
                    init$1274 = null;
                }
            }
            if (typeof left$1277 === 'undefined') {
                expect$780(';');
            }
        }
        if (typeof left$1277 === 'undefined') {
            if (!match$782(';')) {
                test$1275 = parseExpression$817();
            }
            expect$780(';');
            if (!match$782(')')) {
                update$1276 = parseExpression$817();
            }
        }
        expect$780(')');
        oldInIteration$1281 = state$741.inIteration;
        state$741.inIteration = true;
        if (!(opts$1273 !== undefined && opts$1273.ignoreBody)) {
            body$1279 = parseStatement$848();
        }
        state$741.inIteration = oldInIteration$1281;
        if (typeof left$1277 === 'undefined') {
            return delegate$736.createForStatement(init$1274, test$1275, update$1276, body$1279);
        }
        if (operator$1280.value === 'in') {
            return delegate$736.createForInStatement(left$1277, right$1278, body$1279);
        }
        return delegate$736.createForOfStatement(left$1277, right$1278, body$1279);
    }
    // 12.7 The continue statement
    function parseContinueStatement$838() {
        var label$1282 = null, key$1283;
        expectKeyword$781('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$739.value.charCodeAt(0) === 59) {
            lex$773();
            if (!state$741.inIteration) {
                throwError$777({}, Messages$722.IllegalContinue);
            }
            return delegate$736.createContinueStatement(null);
        }
        if (peekLineTerminator$776()) {
            if (!state$741.inIteration) {
                throwError$777({}, Messages$722.IllegalContinue);
            }
            return delegate$736.createContinueStatement(null);
        }
        if (lookahead$739.type === Token$717.Identifier) {
            label$1282 = parseVariableIdentifier$820();
            key$1283 = '$' + label$1282.name;
            if (!Object.prototype.hasOwnProperty.call(state$741.labelSet, key$1283)) {
                throwError$777({}, Messages$722.UnknownLabel, label$1282.name);
            }
        }
        consumeSemicolon$786();
        if (label$1282 === null && !state$741.inIteration) {
            throwError$777({}, Messages$722.IllegalContinue);
        }
        return delegate$736.createContinueStatement(label$1282);
    }
    // 12.8 The break statement
    function parseBreakStatement$839() {
        var label$1284 = null, key$1285;
        expectKeyword$781('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$739.value.charCodeAt(0) === 59) {
            lex$773();
            if (!(state$741.inIteration || state$741.inSwitch)) {
                throwError$777({}, Messages$722.IllegalBreak);
            }
            return delegate$736.createBreakStatement(null);
        }
        if (peekLineTerminator$776()) {
            if (!(state$741.inIteration || state$741.inSwitch)) {
                throwError$777({}, Messages$722.IllegalBreak);
            }
            return delegate$736.createBreakStatement(null);
        }
        if (lookahead$739.type === Token$717.Identifier) {
            label$1284 = parseVariableIdentifier$820();
            key$1285 = '$' + label$1284.name;
            if (!Object.prototype.hasOwnProperty.call(state$741.labelSet, key$1285)) {
                throwError$777({}, Messages$722.UnknownLabel, label$1284.name);
            }
        }
        consumeSemicolon$786();
        if (label$1284 === null && !(state$741.inIteration || state$741.inSwitch)) {
            throwError$777({}, Messages$722.IllegalBreak);
        }
        return delegate$736.createBreakStatement(label$1284);
    }
    // 12.9 The return statement
    function parseReturnStatement$840() {
        var argument$1286 = null;
        expectKeyword$781('return');
        if (!state$741.inFunctionBody) {
            throwErrorTolerant$778({}, Messages$722.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$750(String(lookahead$739.value).charCodeAt(0))) {
            argument$1286 = parseExpression$817();
            consumeSemicolon$786();
            return delegate$736.createReturnStatement(argument$1286);
        }
        if (peekLineTerminator$776()) {
            return delegate$736.createReturnStatement(null);
        }
        if (!match$782(';')) {
            if (!match$782('}') && lookahead$739.type !== Token$717.EOF) {
                argument$1286 = parseExpression$817();
            }
        }
        consumeSemicolon$786();
        return delegate$736.createReturnStatement(argument$1286);
    }
    // 12.10 The with statement
    function parseWithStatement$841() {
        var object$1287, body$1288;
        if (strict$727) {
            throwErrorTolerant$778({}, Messages$722.StrictModeWith);
        }
        expectKeyword$781('with');
        expect$780('(');
        object$1287 = parseExpression$817();
        expect$780(')');
        body$1288 = parseStatement$848();
        return delegate$736.createWithStatement(object$1287, body$1288);
    }
    // 12.10 The swith statement
    function parseSwitchCase$842() {
        var test$1289, consequent$1290 = [], sourceElement$1291;
        if (matchKeyword$783('default')) {
            lex$773();
            test$1289 = null;
        } else {
            expectKeyword$781('case');
            test$1289 = parseExpression$817();
        }
        expect$780(':');
        while (streamIndex$738 < length$735) {
            if (match$782('}') || matchKeyword$783('default') || matchKeyword$783('case')) {
                break;
            }
            sourceElement$1291 = parseSourceElement$863();
            if (typeof sourceElement$1291 === 'undefined') {
                break;
            }
            consequent$1290.push(sourceElement$1291);
        }
        return delegate$736.createSwitchCase(test$1289, consequent$1290);
    }
    function parseSwitchStatement$843() {
        var discriminant$1292, cases$1293, clause$1294, oldInSwitch$1295, defaultFound$1296;
        expectKeyword$781('switch');
        expect$780('(');
        discriminant$1292 = parseExpression$817();
        expect$780(')');
        expect$780('{');
        cases$1293 = [];
        if (match$782('}')) {
            lex$773();
            return delegate$736.createSwitchStatement(discriminant$1292, cases$1293);
        }
        oldInSwitch$1295 = state$741.inSwitch;
        state$741.inSwitch = true;
        defaultFound$1296 = false;
        while (streamIndex$738 < length$735) {
            if (match$782('}')) {
                break;
            }
            clause$1294 = parseSwitchCase$842();
            if (clause$1294.test === null) {
                if (defaultFound$1296) {
                    throwError$777({}, Messages$722.MultipleDefaultsInSwitch);
                }
                defaultFound$1296 = true;
            }
            cases$1293.push(clause$1294);
        }
        state$741.inSwitch = oldInSwitch$1295;
        expect$780('}');
        return delegate$736.createSwitchStatement(discriminant$1292, cases$1293);
    }
    // 12.13 The throw statement
    function parseThrowStatement$844() {
        var argument$1297;
        expectKeyword$781('throw');
        if (peekLineTerminator$776()) {
            throwError$777({}, Messages$722.NewlineAfterThrow);
        }
        argument$1297 = parseExpression$817();
        consumeSemicolon$786();
        return delegate$736.createThrowStatement(argument$1297);
    }
    // 12.14 The try statement
    function parseCatchClause$845() {
        var param$1298, body$1299;
        expectKeyword$781('catch');
        expect$780('(');
        if (match$782(')')) {
            throwUnexpected$779(lookahead$739);
        }
        param$1298 = parseExpression$817();
        // 12.14.1
        if (strict$727 && param$1298.type === Syntax$720.Identifier && isRestrictedWord$754(param$1298.name)) {
            throwErrorTolerant$778({}, Messages$722.StrictCatchVariable);
        }
        expect$780(')');
        body$1299 = parseBlock$819();
        return delegate$736.createCatchClause(param$1298, body$1299);
    }
    function parseTryStatement$846() {
        var block$1300, handlers$1301 = [], finalizer$1302 = null;
        expectKeyword$781('try');
        block$1300 = parseBlock$819();
        if (matchKeyword$783('catch')) {
            handlers$1301.push(parseCatchClause$845());
        }
        if (matchKeyword$783('finally')) {
            lex$773();
            finalizer$1302 = parseBlock$819();
        }
        if (handlers$1301.length === 0 && !finalizer$1302) {
            throwError$777({}, Messages$722.NoCatchOrFinally);
        }
        return delegate$736.createTryStatement(block$1300, [], handlers$1301, finalizer$1302);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$847() {
        expectKeyword$781('debugger');
        consumeSemicolon$786();
        return delegate$736.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$848() {
        var type$1303 = lookahead$739.type, expr$1304, labeledBody$1305, key$1306;
        if (type$1303 === Token$717.EOF) {
            throwUnexpected$779(lookahead$739);
        }
        if (type$1303 === Token$717.Punctuator) {
            switch (lookahead$739.value) {
            case ';':
                return parseEmptyStatement$831();
            case '{':
                return parseBlock$819();
            case '(':
                return parseExpressionStatement$832();
            default:
                break;
            }
        }
        if (type$1303 === Token$717.Keyword) {
            switch (lookahead$739.value) {
            case 'break':
                return parseBreakStatement$839();
            case 'continue':
                return parseContinueStatement$838();
            case 'debugger':
                return parseDebuggerStatement$847();
            case 'do':
                return parseDoWhileStatement$834();
            case 'for':
                return parseForStatement$837();
            case 'function':
                return parseFunctionDeclaration$854();
            case 'class':
                return parseClassDeclaration$861();
            case 'if':
                return parseIfStatement$833();
            case 'return':
                return parseReturnStatement$840();
            case 'switch':
                return parseSwitchStatement$843();
            case 'throw':
                return parseThrowStatement$844();
            case 'try':
                return parseTryStatement$846();
            case 'var':
                return parseVariableStatement$823();
            case 'while':
                return parseWhileStatement$835();
            case 'with':
                return parseWithStatement$841();
            default:
                break;
            }
        }
        expr$1304 = parseExpression$817();
        // 12.12 Labelled Statements
        if (expr$1304.type === Syntax$720.Identifier && match$782(':')) {
            lex$773();
            key$1306 = '$' + expr$1304.name;
            if (Object.prototype.hasOwnProperty.call(state$741.labelSet, key$1306)) {
                throwError$777({}, Messages$722.Redeclaration, 'Label', expr$1304.name);
            }
            state$741.labelSet[key$1306] = true;
            labeledBody$1305 = parseStatement$848();
            delete state$741.labelSet[key$1306];
            return delegate$736.createLabeledStatement(expr$1304, labeledBody$1305);
        }
        consumeSemicolon$786();
        return delegate$736.createExpressionStatement(expr$1304);
    }
    // 13 Function Definition
    function parseConciseBody$849() {
        if (match$782('{')) {
            return parseFunctionSourceElements$850();
        }
        return parseAssignmentExpression$816();
    }
    function parseFunctionSourceElements$850() {
        var sourceElement$1307, sourceElements$1308 = [], token$1309, directive$1310, firstRestricted$1311, oldLabelSet$1312, oldInIteration$1313, oldInSwitch$1314, oldInFunctionBody$1315, oldParenthesizedCount$1316;
        expect$780('{');
        while (streamIndex$738 < length$735) {
            if (lookahead$739.type !== Token$717.StringLiteral) {
                break;
            }
            token$1309 = lookahead$739;
            sourceElement$1307 = parseSourceElement$863();
            sourceElements$1308.push(sourceElement$1307);
            if (sourceElement$1307.expression.type !== Syntax$720.Literal) {
                // this is not directive
                break;
            }
            directive$1310 = token$1309.value;
            if (directive$1310 === 'use strict') {
                strict$727 = true;
                if (firstRestricted$1311) {
                    throwErrorTolerant$778(firstRestricted$1311, Messages$722.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1311 && token$1309.octal) {
                    firstRestricted$1311 = token$1309;
                }
            }
        }
        oldLabelSet$1312 = state$741.labelSet;
        oldInIteration$1313 = state$741.inIteration;
        oldInSwitch$1314 = state$741.inSwitch;
        oldInFunctionBody$1315 = state$741.inFunctionBody;
        oldParenthesizedCount$1316 = state$741.parenthesizedCount;
        state$741.labelSet = {};
        state$741.inIteration = false;
        state$741.inSwitch = false;
        state$741.inFunctionBody = true;
        state$741.parenthesizedCount = 0;
        while (streamIndex$738 < length$735) {
            if (match$782('}')) {
                break;
            }
            sourceElement$1307 = parseSourceElement$863();
            if (typeof sourceElement$1307 === 'undefined') {
                break;
            }
            sourceElements$1308.push(sourceElement$1307);
        }
        expect$780('}');
        state$741.labelSet = oldLabelSet$1312;
        state$741.inIteration = oldInIteration$1313;
        state$741.inSwitch = oldInSwitch$1314;
        state$741.inFunctionBody = oldInFunctionBody$1315;
        state$741.parenthesizedCount = oldParenthesizedCount$1316;
        return delegate$736.createBlockStatement(sourceElements$1308);
    }
    function validateParam$851(options$1317, param$1318, name$1319) {
        var key$1320 = '$' + name$1319;
        if (strict$727) {
            if (isRestrictedWord$754(name$1319)) {
                options$1317.stricted = param$1318;
                options$1317.message = Messages$722.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1317.paramSet, key$1320)) {
                options$1317.stricted = param$1318;
                options$1317.message = Messages$722.StrictParamDupe;
            }
        } else if (!options$1317.firstRestricted) {
            if (isRestrictedWord$754(name$1319)) {
                options$1317.firstRestricted = param$1318;
                options$1317.message = Messages$722.StrictParamName;
            } else if (isStrictModeReservedWord$753(name$1319)) {
                options$1317.firstRestricted = param$1318;
                options$1317.message = Messages$722.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1317.paramSet, key$1320)) {
                options$1317.firstRestricted = param$1318;
                options$1317.message = Messages$722.StrictParamDupe;
            }
        }
        options$1317.paramSet[key$1320] = true;
    }
    function parseParam$852(options$1321) {
        var token$1322, rest$1323, param$1324, def$1325;
        token$1322 = lookahead$739;
        if (token$1322.value === '...') {
            token$1322 = lex$773();
            rest$1323 = true;
        }
        if (match$782('[')) {
            param$1324 = parseArrayInitialiser$789();
            reinterpretAsDestructuredParameter$813(options$1321, param$1324);
        } else if (match$782('{')) {
            if (rest$1323) {
                throwError$777({}, Messages$722.ObjectPatternAsRestParameter);
            }
            param$1324 = parseObjectInitialiser$794();
            reinterpretAsDestructuredParameter$813(options$1321, param$1324);
        } else {
            param$1324 = parseVariableIdentifier$820();
            validateParam$851(options$1321, token$1322, token$1322.value);
            if (match$782('=')) {
                if (rest$1323) {
                    throwErrorTolerant$778(lookahead$739, Messages$722.DefaultRestParameter);
                }
                lex$773();
                def$1325 = parseAssignmentExpression$816();
                ++options$1321.defaultCount;
            }
        }
        if (rest$1323) {
            if (!match$782(')')) {
                throwError$777({}, Messages$722.ParameterAfterRestParameter);
            }
            options$1321.rest = param$1324;
            return false;
        }
        options$1321.params.push(param$1324);
        options$1321.defaults.push(def$1325);
        return !match$782(')');
    }
    function parseParams$853(firstRestricted$1326) {
        var options$1327;
        options$1327 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1326
        };
        expect$780('(');
        if (!match$782(')')) {
            options$1327.paramSet = {};
            while (streamIndex$738 < length$735) {
                if (!parseParam$852(options$1327)) {
                    break;
                }
                expect$780(',');
            }
        }
        expect$780(')');
        if (options$1327.defaultCount === 0) {
            options$1327.defaults = [];
        }
        return options$1327;
    }
    function parseFunctionDeclaration$854() {
        var id$1328, body$1329, token$1330, tmp$1331, firstRestricted$1332, message$1333, previousStrict$1334, previousYieldAllowed$1335, generator$1336, expression$1337;
        expectKeyword$781('function');
        generator$1336 = false;
        if (match$782('*')) {
            lex$773();
            generator$1336 = true;
        }
        token$1330 = lookahead$739;
        id$1328 = parseVariableIdentifier$820();
        if (strict$727) {
            if (isRestrictedWord$754(token$1330.value)) {
                throwErrorTolerant$778(token$1330, Messages$722.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$754(token$1330.value)) {
                firstRestricted$1332 = token$1330;
                message$1333 = Messages$722.StrictFunctionName;
            } else if (isStrictModeReservedWord$753(token$1330.value)) {
                firstRestricted$1332 = token$1330;
                message$1333 = Messages$722.StrictReservedWord;
            }
        }
        tmp$1331 = parseParams$853(firstRestricted$1332);
        firstRestricted$1332 = tmp$1331.firstRestricted;
        if (tmp$1331.message) {
            message$1333 = tmp$1331.message;
        }
        previousStrict$1334 = strict$727;
        previousYieldAllowed$1335 = state$741.yieldAllowed;
        state$741.yieldAllowed = generator$1336;
        // here we redo some work in order to set 'expression'
        expression$1337 = !match$782('{');
        body$1329 = parseConciseBody$849();
        if (strict$727 && firstRestricted$1332) {
            throwError$777(firstRestricted$1332, message$1333);
        }
        if (strict$727 && tmp$1331.stricted) {
            throwErrorTolerant$778(tmp$1331.stricted, message$1333);
        }
        if (state$741.yieldAllowed && !state$741.yieldFound) {
            throwErrorTolerant$778({}, Messages$722.NoYieldInGenerator);
        }
        strict$727 = previousStrict$1334;
        state$741.yieldAllowed = previousYieldAllowed$1335;
        return delegate$736.createFunctionDeclaration(id$1328, tmp$1331.params, tmp$1331.defaults, body$1329, tmp$1331.rest, generator$1336, expression$1337);
    }
    function parseFunctionExpression$855() {
        var token$1338, id$1339 = null, firstRestricted$1340, message$1341, tmp$1342, body$1343, previousStrict$1344, previousYieldAllowed$1345, generator$1346, expression$1347;
        expectKeyword$781('function');
        generator$1346 = false;
        if (match$782('*')) {
            lex$773();
            generator$1346 = true;
        }
        if (!match$782('(')) {
            token$1338 = lookahead$739;
            id$1339 = parseVariableIdentifier$820();
            if (strict$727) {
                if (isRestrictedWord$754(token$1338.value)) {
                    throwErrorTolerant$778(token$1338, Messages$722.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$754(token$1338.value)) {
                    firstRestricted$1340 = token$1338;
                    message$1341 = Messages$722.StrictFunctionName;
                } else if (isStrictModeReservedWord$753(token$1338.value)) {
                    firstRestricted$1340 = token$1338;
                    message$1341 = Messages$722.StrictReservedWord;
                }
            }
        }
        tmp$1342 = parseParams$853(firstRestricted$1340);
        firstRestricted$1340 = tmp$1342.firstRestricted;
        if (tmp$1342.message) {
            message$1341 = tmp$1342.message;
        }
        previousStrict$1344 = strict$727;
        previousYieldAllowed$1345 = state$741.yieldAllowed;
        state$741.yieldAllowed = generator$1346;
        // here we redo some work in order to set 'expression'
        expression$1347 = !match$782('{');
        body$1343 = parseConciseBody$849();
        if (strict$727 && firstRestricted$1340) {
            throwError$777(firstRestricted$1340, message$1341);
        }
        if (strict$727 && tmp$1342.stricted) {
            throwErrorTolerant$778(tmp$1342.stricted, message$1341);
        }
        if (state$741.yieldAllowed && !state$741.yieldFound) {
            throwErrorTolerant$778({}, Messages$722.NoYieldInGenerator);
        }
        strict$727 = previousStrict$1344;
        state$741.yieldAllowed = previousYieldAllowed$1345;
        return delegate$736.createFunctionExpression(id$1339, tmp$1342.params, tmp$1342.defaults, body$1343, tmp$1342.rest, generator$1346, expression$1347);
    }
    function parseYieldExpression$856() {
        var delegateFlag$1348, expr$1349, previousYieldAllowed$1350;
        expectKeyword$781('yield');
        if (!state$741.yieldAllowed) {
            throwErrorTolerant$778({}, Messages$722.IllegalYield);
        }
        delegateFlag$1348 = false;
        if (match$782('*')) {
            lex$773();
            delegateFlag$1348 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1350 = state$741.yieldAllowed;
        state$741.yieldAllowed = false;
        expr$1349 = parseAssignmentExpression$816();
        state$741.yieldAllowed = previousYieldAllowed$1350;
        state$741.yieldFound = true;
        return delegate$736.createYieldExpression(expr$1349, delegateFlag$1348);
    }
    // 14 Classes
    function parseMethodDefinition$857(existingPropNames$1351) {
        var token$1352, key$1353, param$1354, propType$1355, isValidDuplicateProp$1356 = false;
        if (lookahead$739.value === 'static') {
            propType$1355 = ClassPropertyType$725.static;
            lex$773();
        } else {
            propType$1355 = ClassPropertyType$725.prototype;
        }
        if (match$782('*')) {
            lex$773();
            return delegate$736.createMethodDefinition(propType$1355, '', parseObjectPropertyKey$792(), parsePropertyMethodFunction$791({ generator: true }));
        }
        token$1352 = lookahead$739;
        key$1353 = parseObjectPropertyKey$792();
        if (token$1352.value === 'get' && !match$782('(')) {
            key$1353 = parseObjectPropertyKey$792();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1351[propType$1355].hasOwnProperty(key$1353.name)) {
                isValidDuplicateProp$1356 = existingPropNames$1351[propType$1355][key$1353.name].get === undefined && existingPropNames$1351[propType$1355][key$1353.name].data === undefined && existingPropNames$1351[propType$1355][key$1353.name].set !== undefined;
                if (!isValidDuplicateProp$1356) {
                    throwError$777(key$1353, Messages$722.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1351[propType$1355][key$1353.name] = {};
            }
            existingPropNames$1351[propType$1355][key$1353.name].get = true;
            expect$780('(');
            expect$780(')');
            return delegate$736.createMethodDefinition(propType$1355, 'get', key$1353, parsePropertyFunction$790({ generator: false }));
        }
        if (token$1352.value === 'set' && !match$782('(')) {
            key$1353 = parseObjectPropertyKey$792();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1351[propType$1355].hasOwnProperty(key$1353.name)) {
                isValidDuplicateProp$1356 = existingPropNames$1351[propType$1355][key$1353.name].set === undefined && existingPropNames$1351[propType$1355][key$1353.name].data === undefined && existingPropNames$1351[propType$1355][key$1353.name].get !== undefined;
                if (!isValidDuplicateProp$1356) {
                    throwError$777(key$1353, Messages$722.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1351[propType$1355][key$1353.name] = {};
            }
            existingPropNames$1351[propType$1355][key$1353.name].set = true;
            expect$780('(');
            token$1352 = lookahead$739;
            param$1354 = [parseVariableIdentifier$820()];
            expect$780(')');
            return delegate$736.createMethodDefinition(propType$1355, 'set', key$1353, parsePropertyFunction$790({
                params: param$1354,
                generator: false,
                name: token$1352
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1351[propType$1355].hasOwnProperty(key$1353.name)) {
            throwError$777(key$1353, Messages$722.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1351[propType$1355][key$1353.name] = {};
        }
        existingPropNames$1351[propType$1355][key$1353.name].data = true;
        return delegate$736.createMethodDefinition(propType$1355, '', key$1353, parsePropertyMethodFunction$791({ generator: false }));
    }
    function parseClassElement$858(existingProps$1357) {
        if (match$782(';')) {
            lex$773();
            return;
        }
        return parseMethodDefinition$857(existingProps$1357);
    }
    function parseClassBody$859() {
        var classElement$1358, classElements$1359 = [], existingProps$1360 = {};
        existingProps$1360[ClassPropertyType$725.static] = {};
        existingProps$1360[ClassPropertyType$725.prototype] = {};
        expect$780('{');
        while (streamIndex$738 < length$735) {
            if (match$782('}')) {
                break;
            }
            classElement$1358 = parseClassElement$858(existingProps$1360);
            if (typeof classElement$1358 !== 'undefined') {
                classElements$1359.push(classElement$1358);
            }
        }
        expect$780('}');
        return delegate$736.createClassBody(classElements$1359);
    }
    function parseClassExpression$860() {
        var id$1361, previousYieldAllowed$1362, superClass$1363 = null;
        expectKeyword$781('class');
        if (!matchKeyword$783('extends') && !match$782('{')) {
            id$1361 = parseVariableIdentifier$820();
        }
        if (matchKeyword$783('extends')) {
            expectKeyword$781('extends');
            previousYieldAllowed$1362 = state$741.yieldAllowed;
            state$741.yieldAllowed = false;
            superClass$1363 = parseAssignmentExpression$816();
            state$741.yieldAllowed = previousYieldAllowed$1362;
        }
        return delegate$736.createClassExpression(id$1361, superClass$1363, parseClassBody$859());
    }
    function parseClassDeclaration$861() {
        var id$1364, previousYieldAllowed$1365, superClass$1366 = null;
        expectKeyword$781('class');
        id$1364 = parseVariableIdentifier$820();
        if (matchKeyword$783('extends')) {
            expectKeyword$781('extends');
            previousYieldAllowed$1365 = state$741.yieldAllowed;
            state$741.yieldAllowed = false;
            superClass$1366 = parseAssignmentExpression$816();
            state$741.yieldAllowed = previousYieldAllowed$1365;
        }
        return delegate$736.createClassDeclaration(id$1364, superClass$1366, parseClassBody$859());
    }
    // 15 Program
    function matchModuleDeclaration$862() {
        var id$1367;
        if (matchContextualKeyword$784('module')) {
            id$1367 = lookahead2$775();
            return id$1367.type === Token$717.StringLiteral || id$1367.type === Token$717.Identifier;
        }
        return false;
    }
    function parseSourceElement$863() {
        if (lookahead$739.type === Token$717.Keyword) {
            switch (lookahead$739.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$824(lookahead$739.value);
            case 'function':
                return parseFunctionDeclaration$854();
            case 'export':
                return parseExportDeclaration$828();
            case 'import':
                return parseImportDeclaration$829();
            default:
                return parseStatement$848();
            }
        }
        if (matchModuleDeclaration$862()) {
            throwError$777({}, Messages$722.NestedModule);
        }
        if (lookahead$739.type !== Token$717.EOF) {
            return parseStatement$848();
        }
    }
    function parseProgramElement$864() {
        if (lookahead$739.type === Token$717.Keyword) {
            switch (lookahead$739.value) {
            case 'export':
                return parseExportDeclaration$828();
            case 'import':
                return parseImportDeclaration$829();
            }
        }
        if (matchModuleDeclaration$862()) {
            return parseModuleDeclaration$825();
        }
        return parseSourceElement$863();
    }
    function parseProgramElements$865() {
        var sourceElement$1368, sourceElements$1369 = [], token$1370, directive$1371, firstRestricted$1372;
        while (streamIndex$738 < length$735) {
            token$1370 = lookahead$739;
            if (token$1370.type !== Token$717.StringLiteral) {
                break;
            }
            sourceElement$1368 = parseProgramElement$864();
            sourceElements$1369.push(sourceElement$1368);
            if (sourceElement$1368.expression.type !== Syntax$720.Literal) {
                // this is not directive
                break;
            }
            assert$743(false, 'directive isn\'t right');
            directive$1371 = source$726.slice(token$1370.range[0] + 1, token$1370.range[1] - 1);
            if (directive$1371 === 'use strict') {
                strict$727 = true;
                if (firstRestricted$1372) {
                    throwErrorTolerant$778(firstRestricted$1372, Messages$722.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1372 && token$1370.octal) {
                    firstRestricted$1372 = token$1370;
                }
            }
        }
        while (streamIndex$738 < length$735) {
            sourceElement$1368 = parseProgramElement$864();
            if (typeof sourceElement$1368 === 'undefined') {
                break;
            }
            sourceElements$1369.push(sourceElement$1368);
        }
        return sourceElements$1369;
    }
    function parseModuleElement$866() {
        return parseSourceElement$863();
    }
    function parseModuleElements$867() {
        var list$1373 = [], statement$1374;
        while (streamIndex$738 < length$735) {
            if (match$782('}')) {
                break;
            }
            statement$1374 = parseModuleElement$866();
            if (typeof statement$1374 === 'undefined') {
                break;
            }
            list$1373.push(statement$1374);
        }
        return list$1373;
    }
    function parseModuleBlock$868() {
        var block$1375;
        expect$780('{');
        block$1375 = parseModuleElements$867();
        expect$780('}');
        return delegate$736.createBlockStatement(block$1375);
    }
    function parseProgram$869() {
        var body$1376;
        strict$727 = false;
        peek$774();
        body$1376 = parseProgramElements$865();
        return delegate$736.createProgram(body$1376);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$870(type$1377, value$1378, start$1379, end$1380, loc$1381) {
        assert$743(typeof start$1379 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$742.comments.length > 0) {
            if (extra$742.comments[extra$742.comments.length - 1].range[1] > start$1379) {
                return;
            }
        }
        extra$742.comments.push({
            type: type$1377,
            value: value$1378,
            range: [
                start$1379,
                end$1380
            ],
            loc: loc$1381
        });
    }
    function scanComment$871() {
        var comment$1382, ch$1383, loc$1384, start$1385, blockComment$1386, lineComment$1387;
        comment$1382 = '';
        blockComment$1386 = false;
        lineComment$1387 = false;
        while (index$728 < length$735) {
            ch$1383 = source$726[index$728];
            if (lineComment$1387) {
                ch$1383 = source$726[index$728++];
                if (isLineTerminator$749(ch$1383.charCodeAt(0))) {
                    loc$1384.end = {
                        line: lineNumber$729,
                        column: index$728 - lineStart$730 - 1
                    };
                    lineComment$1387 = false;
                    addComment$870('Line', comment$1382, start$1385, index$728 - 1, loc$1384);
                    if (ch$1383 === '\r' && source$726[index$728] === '\n') {
                        ++index$728;
                    }
                    ++lineNumber$729;
                    lineStart$730 = index$728;
                    comment$1382 = '';
                } else if (index$728 >= length$735) {
                    lineComment$1387 = false;
                    comment$1382 += ch$1383;
                    loc$1384.end = {
                        line: lineNumber$729,
                        column: length$735 - lineStart$730
                    };
                    addComment$870('Line', comment$1382, start$1385, length$735, loc$1384);
                } else {
                    comment$1382 += ch$1383;
                }
            } else if (blockComment$1386) {
                if (isLineTerminator$749(ch$1383.charCodeAt(0))) {
                    if (ch$1383 === '\r' && source$726[index$728 + 1] === '\n') {
                        ++index$728;
                        comment$1382 += '\r\n';
                    } else {
                        comment$1382 += ch$1383;
                    }
                    ++lineNumber$729;
                    ++index$728;
                    lineStart$730 = index$728;
                    if (index$728 >= length$735) {
                        throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1383 = source$726[index$728++];
                    if (index$728 >= length$735) {
                        throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1382 += ch$1383;
                    if (ch$1383 === '*') {
                        ch$1383 = source$726[index$728];
                        if (ch$1383 === '/') {
                            comment$1382 = comment$1382.substr(0, comment$1382.length - 1);
                            blockComment$1386 = false;
                            ++index$728;
                            loc$1384.end = {
                                line: lineNumber$729,
                                column: index$728 - lineStart$730
                            };
                            addComment$870('Block', comment$1382, start$1385, index$728, loc$1384);
                            comment$1382 = '';
                        }
                    }
                }
            } else if (ch$1383 === '/') {
                ch$1383 = source$726[index$728 + 1];
                if (ch$1383 === '/') {
                    loc$1384 = {
                        start: {
                            line: lineNumber$729,
                            column: index$728 - lineStart$730
                        }
                    };
                    start$1385 = index$728;
                    index$728 += 2;
                    lineComment$1387 = true;
                    if (index$728 >= length$735) {
                        loc$1384.end = {
                            line: lineNumber$729,
                            column: index$728 - lineStart$730
                        };
                        lineComment$1387 = false;
                        addComment$870('Line', comment$1382, start$1385, index$728, loc$1384);
                    }
                } else if (ch$1383 === '*') {
                    start$1385 = index$728;
                    index$728 += 2;
                    blockComment$1386 = true;
                    loc$1384 = {
                        start: {
                            line: lineNumber$729,
                            column: index$728 - lineStart$730 - 2
                        }
                    };
                    if (index$728 >= length$735) {
                        throwError$777({}, Messages$722.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$748(ch$1383.charCodeAt(0))) {
                ++index$728;
            } else if (isLineTerminator$749(ch$1383.charCodeAt(0))) {
                ++index$728;
                if (ch$1383 === '\r' && source$726[index$728] === '\n') {
                    ++index$728;
                }
                ++lineNumber$729;
                lineStart$730 = index$728;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$872() {
        var i$1388, entry$1389, comment$1390, comments$1391 = [];
        for (i$1388 = 0; i$1388 < extra$742.comments.length; ++i$1388) {
            entry$1389 = extra$742.comments[i$1388];
            comment$1390 = {
                type: entry$1389.type,
                value: entry$1389.value
            };
            if (extra$742.range) {
                comment$1390.range = entry$1389.range;
            }
            if (extra$742.loc) {
                comment$1390.loc = entry$1389.loc;
            }
            comments$1391.push(comment$1390);
        }
        extra$742.comments = comments$1391;
    }
    function collectToken$873() {
        var start$1392, loc$1393, token$1394, range$1395, value$1396;
        skipComment$756();
        start$1392 = index$728;
        loc$1393 = {
            start: {
                line: lineNumber$729,
                column: index$728 - lineStart$730
            }
        };
        token$1394 = extra$742.advance();
        loc$1393.end = {
            line: lineNumber$729,
            column: index$728 - lineStart$730
        };
        if (token$1394.type !== Token$717.EOF) {
            range$1395 = [
                token$1394.range[0],
                token$1394.range[1]
            ];
            value$1396 = source$726.slice(token$1394.range[0], token$1394.range[1]);
            extra$742.tokens.push({
                type: TokenName$718[token$1394.type],
                value: value$1396,
                range: range$1395,
                loc: loc$1393
            });
        }
        return token$1394;
    }
    function collectRegex$874() {
        var pos$1397, loc$1398, regex$1399, token$1400;
        skipComment$756();
        pos$1397 = index$728;
        loc$1398 = {
            start: {
                line: lineNumber$729,
                column: index$728 - lineStart$730
            }
        };
        regex$1399 = extra$742.scanRegExp();
        loc$1398.end = {
            line: lineNumber$729,
            column: index$728 - lineStart$730
        };
        if (!extra$742.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$742.tokens.length > 0) {
                token$1400 = extra$742.tokens[extra$742.tokens.length - 1];
                if (token$1400.range[0] === pos$1397 && token$1400.type === 'Punctuator') {
                    if (token$1400.value === '/' || token$1400.value === '/=') {
                        extra$742.tokens.pop();
                    }
                }
            }
            extra$742.tokens.push({
                type: 'RegularExpression',
                value: regex$1399.literal,
                range: [
                    pos$1397,
                    index$728
                ],
                loc: loc$1398
            });
        }
        return regex$1399;
    }
    function filterTokenLocation$875() {
        var i$1401, entry$1402, token$1403, tokens$1404 = [];
        for (i$1401 = 0; i$1401 < extra$742.tokens.length; ++i$1401) {
            entry$1402 = extra$742.tokens[i$1401];
            token$1403 = {
                type: entry$1402.type,
                value: entry$1402.value
            };
            if (extra$742.range) {
                token$1403.range = entry$1402.range;
            }
            if (extra$742.loc) {
                token$1403.loc = entry$1402.loc;
            }
            tokens$1404.push(token$1403);
        }
        extra$742.tokens = tokens$1404;
    }
    function LocationMarker$876() {
        var sm_index$1405 = lookahead$739 ? lookahead$739.sm_range[0] : 0;
        var sm_lineStart$1406 = lookahead$739 ? lookahead$739.sm_lineStart : 0;
        var sm_lineNumber$1407 = lookahead$739 ? lookahead$739.sm_lineNumber : 1;
        this.range = [
            sm_index$1405,
            sm_index$1405
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1407,
                column: sm_index$1405 - sm_lineStart$1406
            },
            end: {
                line: sm_lineNumber$1407,
                column: sm_index$1405 - sm_lineStart$1406
            }
        };
    }
    LocationMarker$876.prototype = {
        constructor: LocationMarker$876,
        end: function () {
            this.range[1] = sm_index$734;
            this.loc.end.line = sm_lineNumber$731;
            this.loc.end.column = sm_index$734 - sm_lineStart$732;
        },
        applyGroup: function (node$1408) {
            if (extra$742.range) {
                node$1408.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$742.loc) {
                node$1408.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1408 = delegate$736.postProcess(node$1408);
            }
        },
        apply: function (node$1409) {
            var nodeType$1410 = typeof node$1409;
            assert$743(nodeType$1410 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1410);
            if (extra$742.range) {
                node$1409.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$742.loc) {
                node$1409.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1409 = delegate$736.postProcess(node$1409);
            }
        }
    };
    function createLocationMarker$877() {
        return new LocationMarker$876();
    }
    function trackGroupExpression$878() {
        var marker$1411, expr$1412;
        marker$1411 = createLocationMarker$877();
        expect$780('(');
        ++state$741.parenthesizedCount;
        expr$1412 = parseExpression$817();
        expect$780(')');
        marker$1411.end();
        marker$1411.applyGroup(expr$1412);
        return expr$1412;
    }
    function trackLeftHandSideExpression$879() {
        var marker$1413, expr$1414;
        // skipComment();
        marker$1413 = createLocationMarker$877();
        expr$1414 = matchKeyword$783('new') ? parseNewExpression$804() : parsePrimaryExpression$798();
        while (match$782('.') || match$782('[') || lookahead$739.type === Token$717.Template) {
            if (match$782('[')) {
                expr$1414 = delegate$736.createMemberExpression('[', expr$1414, parseComputedMember$803());
                marker$1413.end();
                marker$1413.apply(expr$1414);
            } else if (match$782('.')) {
                expr$1414 = delegate$736.createMemberExpression('.', expr$1414, parseNonComputedMember$802());
                marker$1413.end();
                marker$1413.apply(expr$1414);
            } else {
                expr$1414 = delegate$736.createTaggedTemplateExpression(expr$1414, parseTemplateLiteral$796());
                marker$1413.end();
                marker$1413.apply(expr$1414);
            }
        }
        return expr$1414;
    }
    function trackLeftHandSideExpressionAllowCall$880() {
        var marker$1415, expr$1416, args$1417;
        // skipComment();
        marker$1415 = createLocationMarker$877();
        expr$1416 = matchKeyword$783('new') ? parseNewExpression$804() : parsePrimaryExpression$798();
        while (match$782('.') || match$782('[') || match$782('(') || lookahead$739.type === Token$717.Template) {
            if (match$782('(')) {
                args$1417 = parseArguments$799();
                expr$1416 = delegate$736.createCallExpression(expr$1416, args$1417);
                marker$1415.end();
                marker$1415.apply(expr$1416);
            } else if (match$782('[')) {
                expr$1416 = delegate$736.createMemberExpression('[', expr$1416, parseComputedMember$803());
                marker$1415.end();
                marker$1415.apply(expr$1416);
            } else if (match$782('.')) {
                expr$1416 = delegate$736.createMemberExpression('.', expr$1416, parseNonComputedMember$802());
                marker$1415.end();
                marker$1415.apply(expr$1416);
            } else {
                expr$1416 = delegate$736.createTaggedTemplateExpression(expr$1416, parseTemplateLiteral$796());
                marker$1415.end();
                marker$1415.apply(expr$1416);
            }
        }
        return expr$1416;
    }
    function filterGroup$881(node$1418) {
        var n$1419, i$1420, entry$1421;
        n$1419 = Object.prototype.toString.apply(node$1418) === '[object Array]' ? [] : {};
        for (i$1420 in node$1418) {
            if (node$1418.hasOwnProperty(i$1420) && i$1420 !== 'groupRange' && i$1420 !== 'groupLoc') {
                entry$1421 = node$1418[i$1420];
                if (entry$1421 === null || typeof entry$1421 !== 'object' || entry$1421 instanceof RegExp) {
                    n$1419[i$1420] = entry$1421;
                } else {
                    n$1419[i$1420] = filterGroup$881(entry$1421);
                }
            }
        }
        return n$1419;
    }
    function wrapTrackingFunction$882(range$1422, loc$1423) {
        return function (parseFunction$1424) {
            function isBinary$1425(node$1427) {
                return node$1427.type === Syntax$720.LogicalExpression || node$1427.type === Syntax$720.BinaryExpression;
            }
            function visit$1426(node$1428) {
                var start$1429, end$1430;
                if (isBinary$1425(node$1428.left)) {
                    visit$1426(node$1428.left);
                }
                if (isBinary$1425(node$1428.right)) {
                    visit$1426(node$1428.right);
                }
                if (range$1422) {
                    if (node$1428.left.groupRange || node$1428.right.groupRange) {
                        start$1429 = node$1428.left.groupRange ? node$1428.left.groupRange[0] : node$1428.left.range[0];
                        end$1430 = node$1428.right.groupRange ? node$1428.right.groupRange[1] : node$1428.right.range[1];
                        node$1428.range = [
                            start$1429,
                            end$1430
                        ];
                    } else if (typeof node$1428.range === 'undefined') {
                        start$1429 = node$1428.left.range[0];
                        end$1430 = node$1428.right.range[1];
                        node$1428.range = [
                            start$1429,
                            end$1430
                        ];
                    }
                }
                if (loc$1423) {
                    if (node$1428.left.groupLoc || node$1428.right.groupLoc) {
                        start$1429 = node$1428.left.groupLoc ? node$1428.left.groupLoc.start : node$1428.left.loc.start;
                        end$1430 = node$1428.right.groupLoc ? node$1428.right.groupLoc.end : node$1428.right.loc.end;
                        node$1428.loc = {
                            start: start$1429,
                            end: end$1430
                        };
                        node$1428 = delegate$736.postProcess(node$1428);
                    } else if (typeof node$1428.loc === 'undefined') {
                        node$1428.loc = {
                            start: node$1428.left.loc.start,
                            end: node$1428.right.loc.end
                        };
                        node$1428 = delegate$736.postProcess(node$1428);
                    }
                }
            }
            return function () {
                var marker$1431, node$1432, curr$1433 = lookahead$739;
                marker$1431 = createLocationMarker$877();
                node$1432 = parseFunction$1424.apply(null, arguments);
                marker$1431.end();
                if (node$1432.type !== Syntax$720.Program) {
                    if (curr$1433.leadingComments) {
                        node$1432.leadingComments = curr$1433.leadingComments;
                    }
                    if (curr$1433.trailingComments) {
                        node$1432.trailingComments = curr$1433.trailingComments;
                    }
                }
                if (range$1422 && typeof node$1432.range === 'undefined') {
                    marker$1431.apply(node$1432);
                }
                if (loc$1423 && typeof node$1432.loc === 'undefined') {
                    marker$1431.apply(node$1432);
                }
                if (isBinary$1425(node$1432)) {
                    visit$1426(node$1432);
                }
                return node$1432;
            };
        };
    }
    function patch$883() {
        var wrapTracking$1434;
        if (extra$742.comments) {
            extra$742.skipComment = skipComment$756;
            skipComment$756 = scanComment$871;
        }
        if (extra$742.range || extra$742.loc) {
            extra$742.parseGroupExpression = parseGroupExpression$797;
            extra$742.parseLeftHandSideExpression = parseLeftHandSideExpression$806;
            extra$742.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$805;
            parseGroupExpression$797 = trackGroupExpression$878;
            parseLeftHandSideExpression$806 = trackLeftHandSideExpression$879;
            parseLeftHandSideExpressionAllowCall$805 = trackLeftHandSideExpressionAllowCall$880;
            wrapTracking$1434 = wrapTrackingFunction$882(extra$742.range, extra$742.loc);
            extra$742.parseArrayInitialiser = parseArrayInitialiser$789;
            extra$742.parseAssignmentExpression = parseAssignmentExpression$816;
            extra$742.parseBinaryExpression = parseBinaryExpression$810;
            extra$742.parseBlock = parseBlock$819;
            extra$742.parseFunctionSourceElements = parseFunctionSourceElements$850;
            extra$742.parseCatchClause = parseCatchClause$845;
            extra$742.parseComputedMember = parseComputedMember$803;
            extra$742.parseConditionalExpression = parseConditionalExpression$811;
            extra$742.parseConstLetDeclaration = parseConstLetDeclaration$824;
            extra$742.parseExportBatchSpecifier = parseExportBatchSpecifier$826;
            extra$742.parseExportDeclaration = parseExportDeclaration$828;
            extra$742.parseExportSpecifier = parseExportSpecifier$827;
            extra$742.parseExpression = parseExpression$817;
            extra$742.parseForVariableDeclaration = parseForVariableDeclaration$836;
            extra$742.parseFunctionDeclaration = parseFunctionDeclaration$854;
            extra$742.parseFunctionExpression = parseFunctionExpression$855;
            extra$742.parseParams = parseParams$853;
            extra$742.parseImportDeclaration = parseImportDeclaration$829;
            extra$742.parseImportSpecifier = parseImportSpecifier$830;
            extra$742.parseModuleDeclaration = parseModuleDeclaration$825;
            extra$742.parseModuleBlock = parseModuleBlock$868;
            extra$742.parseNewExpression = parseNewExpression$804;
            extra$742.parseNonComputedProperty = parseNonComputedProperty$801;
            extra$742.parseObjectInitialiser = parseObjectInitialiser$794;
            extra$742.parseObjectProperty = parseObjectProperty$793;
            extra$742.parseObjectPropertyKey = parseObjectPropertyKey$792;
            extra$742.parsePostfixExpression = parsePostfixExpression$807;
            extra$742.parsePrimaryExpression = parsePrimaryExpression$798;
            extra$742.parseProgram = parseProgram$869;
            extra$742.parsePropertyFunction = parsePropertyFunction$790;
            extra$742.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$800;
            extra$742.parseTemplateElement = parseTemplateElement$795;
            extra$742.parseTemplateLiteral = parseTemplateLiteral$796;
            extra$742.parseStatement = parseStatement$848;
            extra$742.parseSwitchCase = parseSwitchCase$842;
            extra$742.parseUnaryExpression = parseUnaryExpression$808;
            extra$742.parseVariableDeclaration = parseVariableDeclaration$821;
            extra$742.parseVariableIdentifier = parseVariableIdentifier$820;
            extra$742.parseMethodDefinition = parseMethodDefinition$857;
            extra$742.parseClassDeclaration = parseClassDeclaration$861;
            extra$742.parseClassExpression = parseClassExpression$860;
            extra$742.parseClassBody = parseClassBody$859;
            parseArrayInitialiser$789 = wrapTracking$1434(extra$742.parseArrayInitialiser);
            parseAssignmentExpression$816 = wrapTracking$1434(extra$742.parseAssignmentExpression);
            parseBinaryExpression$810 = wrapTracking$1434(extra$742.parseBinaryExpression);
            parseBlock$819 = wrapTracking$1434(extra$742.parseBlock);
            parseFunctionSourceElements$850 = wrapTracking$1434(extra$742.parseFunctionSourceElements);
            parseCatchClause$845 = wrapTracking$1434(extra$742.parseCatchClause);
            parseComputedMember$803 = wrapTracking$1434(extra$742.parseComputedMember);
            parseConditionalExpression$811 = wrapTracking$1434(extra$742.parseConditionalExpression);
            parseConstLetDeclaration$824 = wrapTracking$1434(extra$742.parseConstLetDeclaration);
            parseExportBatchSpecifier$826 = wrapTracking$1434(parseExportBatchSpecifier$826);
            parseExportDeclaration$828 = wrapTracking$1434(parseExportDeclaration$828);
            parseExportSpecifier$827 = wrapTracking$1434(parseExportSpecifier$827);
            parseExpression$817 = wrapTracking$1434(extra$742.parseExpression);
            parseForVariableDeclaration$836 = wrapTracking$1434(extra$742.parseForVariableDeclaration);
            parseFunctionDeclaration$854 = wrapTracking$1434(extra$742.parseFunctionDeclaration);
            parseFunctionExpression$855 = wrapTracking$1434(extra$742.parseFunctionExpression);
            parseParams$853 = wrapTracking$1434(extra$742.parseParams);
            parseImportDeclaration$829 = wrapTracking$1434(extra$742.parseImportDeclaration);
            parseImportSpecifier$830 = wrapTracking$1434(extra$742.parseImportSpecifier);
            parseModuleDeclaration$825 = wrapTracking$1434(extra$742.parseModuleDeclaration);
            parseModuleBlock$868 = wrapTracking$1434(extra$742.parseModuleBlock);
            parseLeftHandSideExpression$806 = wrapTracking$1434(parseLeftHandSideExpression$806);
            parseNewExpression$804 = wrapTracking$1434(extra$742.parseNewExpression);
            parseNonComputedProperty$801 = wrapTracking$1434(extra$742.parseNonComputedProperty);
            parseObjectInitialiser$794 = wrapTracking$1434(extra$742.parseObjectInitialiser);
            parseObjectProperty$793 = wrapTracking$1434(extra$742.parseObjectProperty);
            parseObjectPropertyKey$792 = wrapTracking$1434(extra$742.parseObjectPropertyKey);
            parsePostfixExpression$807 = wrapTracking$1434(extra$742.parsePostfixExpression);
            parsePrimaryExpression$798 = wrapTracking$1434(extra$742.parsePrimaryExpression);
            parseProgram$869 = wrapTracking$1434(extra$742.parseProgram);
            parsePropertyFunction$790 = wrapTracking$1434(extra$742.parsePropertyFunction);
            parseTemplateElement$795 = wrapTracking$1434(extra$742.parseTemplateElement);
            parseTemplateLiteral$796 = wrapTracking$1434(extra$742.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$800 = wrapTracking$1434(extra$742.parseSpreadOrAssignmentExpression);
            parseStatement$848 = wrapTracking$1434(extra$742.parseStatement);
            parseSwitchCase$842 = wrapTracking$1434(extra$742.parseSwitchCase);
            parseUnaryExpression$808 = wrapTracking$1434(extra$742.parseUnaryExpression);
            parseVariableDeclaration$821 = wrapTracking$1434(extra$742.parseVariableDeclaration);
            parseVariableIdentifier$820 = wrapTracking$1434(extra$742.parseVariableIdentifier);
            parseMethodDefinition$857 = wrapTracking$1434(extra$742.parseMethodDefinition);
            parseClassDeclaration$861 = wrapTracking$1434(extra$742.parseClassDeclaration);
            parseClassExpression$860 = wrapTracking$1434(extra$742.parseClassExpression);
            parseClassBody$859 = wrapTracking$1434(extra$742.parseClassBody);
        }
        if (typeof extra$742.tokens !== 'undefined') {
            extra$742.advance = advance$772;
            extra$742.scanRegExp = scanRegExp$769;
            advance$772 = collectToken$873;
            scanRegExp$769 = collectRegex$874;
        }
    }
    function unpatch$884() {
        if (typeof extra$742.skipComment === 'function') {
            skipComment$756 = extra$742.skipComment;
        }
        if (extra$742.range || extra$742.loc) {
            parseArrayInitialiser$789 = extra$742.parseArrayInitialiser;
            parseAssignmentExpression$816 = extra$742.parseAssignmentExpression;
            parseBinaryExpression$810 = extra$742.parseBinaryExpression;
            parseBlock$819 = extra$742.parseBlock;
            parseFunctionSourceElements$850 = extra$742.parseFunctionSourceElements;
            parseCatchClause$845 = extra$742.parseCatchClause;
            parseComputedMember$803 = extra$742.parseComputedMember;
            parseConditionalExpression$811 = extra$742.parseConditionalExpression;
            parseConstLetDeclaration$824 = extra$742.parseConstLetDeclaration;
            parseExportBatchSpecifier$826 = extra$742.parseExportBatchSpecifier;
            parseExportDeclaration$828 = extra$742.parseExportDeclaration;
            parseExportSpecifier$827 = extra$742.parseExportSpecifier;
            parseExpression$817 = extra$742.parseExpression;
            parseForVariableDeclaration$836 = extra$742.parseForVariableDeclaration;
            parseFunctionDeclaration$854 = extra$742.parseFunctionDeclaration;
            parseFunctionExpression$855 = extra$742.parseFunctionExpression;
            parseImportDeclaration$829 = extra$742.parseImportDeclaration;
            parseImportSpecifier$830 = extra$742.parseImportSpecifier;
            parseGroupExpression$797 = extra$742.parseGroupExpression;
            parseLeftHandSideExpression$806 = extra$742.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$805 = extra$742.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$825 = extra$742.parseModuleDeclaration;
            parseModuleBlock$868 = extra$742.parseModuleBlock;
            parseNewExpression$804 = extra$742.parseNewExpression;
            parseNonComputedProperty$801 = extra$742.parseNonComputedProperty;
            parseObjectInitialiser$794 = extra$742.parseObjectInitialiser;
            parseObjectProperty$793 = extra$742.parseObjectProperty;
            parseObjectPropertyKey$792 = extra$742.parseObjectPropertyKey;
            parsePostfixExpression$807 = extra$742.parsePostfixExpression;
            parsePrimaryExpression$798 = extra$742.parsePrimaryExpression;
            parseProgram$869 = extra$742.parseProgram;
            parsePropertyFunction$790 = extra$742.parsePropertyFunction;
            parseTemplateElement$795 = extra$742.parseTemplateElement;
            parseTemplateLiteral$796 = extra$742.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$800 = extra$742.parseSpreadOrAssignmentExpression;
            parseStatement$848 = extra$742.parseStatement;
            parseSwitchCase$842 = extra$742.parseSwitchCase;
            parseUnaryExpression$808 = extra$742.parseUnaryExpression;
            parseVariableDeclaration$821 = extra$742.parseVariableDeclaration;
            parseVariableIdentifier$820 = extra$742.parseVariableIdentifier;
            parseMethodDefinition$857 = extra$742.parseMethodDefinition;
            parseClassDeclaration$861 = extra$742.parseClassDeclaration;
            parseClassExpression$860 = extra$742.parseClassExpression;
            parseClassBody$859 = extra$742.parseClassBody;
        }
        if (typeof extra$742.scanRegExp === 'function') {
            advance$772 = extra$742.advance;
            scanRegExp$769 = extra$742.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$885(object$1435, properties$1436) {
        var entry$1437, result$1438 = {};
        for (entry$1437 in object$1435) {
            if (object$1435.hasOwnProperty(entry$1437)) {
                result$1438[entry$1437] = object$1435[entry$1437];
            }
        }
        for (entry$1437 in properties$1436) {
            if (properties$1436.hasOwnProperty(entry$1437)) {
                result$1438[entry$1437] = properties$1436[entry$1437];
            }
        }
        return result$1438;
    }
    function tokenize$886(code$1439, options$1440) {
        var toString$1441, token$1442, tokens$1443;
        toString$1441 = String;
        if (typeof code$1439 !== 'string' && !(code$1439 instanceof String)) {
            code$1439 = toString$1441(code$1439);
        }
        delegate$736 = SyntaxTreeDelegate$724;
        source$726 = code$1439;
        index$728 = 0;
        lineNumber$729 = source$726.length > 0 ? 1 : 0;
        lineStart$730 = 0;
        length$735 = source$726.length;
        lookahead$739 = null;
        state$741 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$742 = {};
        // Options matching.
        options$1440 = options$1440 || {};
        // Of course we collect tokens here.
        options$1440.tokens = true;
        extra$742.tokens = [];
        extra$742.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$742.openParenToken = -1;
        extra$742.openCurlyToken = -1;
        extra$742.range = typeof options$1440.range === 'boolean' && options$1440.range;
        extra$742.loc = typeof options$1440.loc === 'boolean' && options$1440.loc;
        if (typeof options$1440.comment === 'boolean' && options$1440.comment) {
            extra$742.comments = [];
        }
        if (typeof options$1440.tolerant === 'boolean' && options$1440.tolerant) {
            extra$742.errors = [];
        }
        if (length$735 > 0) {
            if (typeof source$726[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1439 instanceof String) {
                    source$726 = code$1439.valueOf();
                }
            }
        }
        patch$883();
        try {
            peek$774();
            if (lookahead$739.type === Token$717.EOF) {
                return extra$742.tokens;
            }
            token$1442 = lex$773();
            while (lookahead$739.type !== Token$717.EOF) {
                try {
                    token$1442 = lex$773();
                } catch (lexError$1444) {
                    token$1442 = lookahead$739;
                    if (extra$742.errors) {
                        extra$742.errors.push(lexError$1444);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1444;
                    }
                }
            }
            filterTokenLocation$875();
            tokens$1443 = extra$742.tokens;
            if (typeof extra$742.comments !== 'undefined') {
                filterCommentLocation$872();
                tokens$1443.comments = extra$742.comments;
            }
            if (typeof extra$742.errors !== 'undefined') {
                tokens$1443.errors = extra$742.errors;
            }
        } catch (e$1445) {
            throw e$1445;
        } finally {
            unpatch$884();
            extra$742 = {};
        }
        return tokens$1443;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$887(toks$1446, start$1447, inExprDelim$1448, parentIsBlock$1449) {
        var assignOps$1450 = [
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
        var binaryOps$1451 = [
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
        var unaryOps$1452 = [
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
        function back$1453(n$1454) {
            var idx$1455 = toks$1446.length - n$1454 > 0 ? toks$1446.length - n$1454 : 0;
            return toks$1446[idx$1455];
        }
        if (inExprDelim$1448 && toks$1446.length - (start$1447 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1453(start$1447 + 2).value === ':' && parentIsBlock$1449) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$744(back$1453(start$1447 + 2).value, unaryOps$1452.concat(binaryOps$1451).concat(assignOps$1450))) {
            // ... + {...}
            return false;
        } else if (back$1453(start$1447 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1456 = typeof back$1453(start$1447 + 1).startLineNumber !== 'undefined' ? back$1453(start$1447 + 1).startLineNumber : back$1453(start$1447 + 1).lineNumber;
            if (back$1453(start$1447 + 2).lineNumber !== currLineNumber$1456) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$744(back$1453(start$1447 + 2).value, [
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
    function readToken$888(toks$1457, inExprDelim$1458, parentIsBlock$1459) {
        var delimiters$1460 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1461 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1462 = toks$1457.length - 1;
        var comments$1463, commentsLen$1464 = extra$742.comments.length;
        function back$1465(n$1469) {
            var idx$1470 = toks$1457.length - n$1469 > 0 ? toks$1457.length - n$1469 : 0;
            return toks$1457[idx$1470];
        }
        function attachComments$1466(token$1471) {
            if (comments$1463) {
                token$1471.leadingComments = comments$1463;
            }
            return token$1471;
        }
        function _advance$1467() {
            return attachComments$1466(advance$772());
        }
        function _scanRegExp$1468() {
            return attachComments$1466(scanRegExp$769());
        }
        skipComment$756();
        if (extra$742.comments.length > commentsLen$1464) {
            comments$1463 = extra$742.comments.slice(commentsLen$1464);
        }
        if (isIn$744(source$726[index$728], delimiters$1460)) {
            return attachComments$1466(readDelim$889(toks$1457, inExprDelim$1458, parentIsBlock$1459));
        }
        if (source$726[index$728] === '/') {
            var prev$1472 = back$1465(1);
            if (prev$1472) {
                if (prev$1472.value === '()') {
                    if (isIn$744(back$1465(2).value, parenIdents$1461)) {
                        // ... if (...) / ...
                        return _scanRegExp$1468();
                    }
                    // ... (...) / ...
                    return _advance$1467();
                }
                if (prev$1472.value === '{}') {
                    if (blockAllowed$887(toks$1457, 0, inExprDelim$1458, parentIsBlock$1459)) {
                        if (back$1465(2).value === '()') {
                            // named function
                            if (back$1465(4).value === 'function') {
                                if (!blockAllowed$887(toks$1457, 3, inExprDelim$1458, parentIsBlock$1459)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1467();
                                }
                                if (toks$1457.length - 5 <= 0 && inExprDelim$1458) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1467();
                                }
                            }
                            // unnamed function
                            if (back$1465(3).value === 'function') {
                                if (!blockAllowed$887(toks$1457, 2, inExprDelim$1458, parentIsBlock$1459)) {
                                    // new function (...) {...} / ...
                                    return _advance$1467();
                                }
                                if (toks$1457.length - 4 <= 0 && inExprDelim$1458) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1467();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1468();
                    } else {
                        // ... + {...} / ...
                        return _advance$1467();
                    }
                }
                if (prev$1472.type === Token$717.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1468();
                }
                if (isKeyword$755(prev$1472.value)) {
                    // typeof /...
                    return _scanRegExp$1468();
                }
                return _advance$1467();
            }
            return _scanRegExp$1468();
        }
        return _advance$1467();
    }
    function readDelim$889(toks$1473, inExprDelim$1474, parentIsBlock$1475) {
        var startDelim$1476 = advance$772(), matchDelim$1477 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1478 = [];
        var delimiters$1479 = [
                '(',
                '{',
                '['
            ];
        assert$743(delimiters$1479.indexOf(startDelim$1476.value) !== -1, 'Need to begin at the delimiter');
        var token$1480 = startDelim$1476;
        var startLineNumber$1481 = token$1480.lineNumber;
        var startLineStart$1482 = token$1480.lineStart;
        var startRange$1483 = token$1480.range;
        var delimToken$1484 = {};
        delimToken$1484.type = Token$717.Delimiter;
        delimToken$1484.value = startDelim$1476.value + matchDelim$1477[startDelim$1476.value];
        delimToken$1484.startLineNumber = startLineNumber$1481;
        delimToken$1484.startLineStart = startLineStart$1482;
        delimToken$1484.startRange = startRange$1483;
        var delimIsBlock$1485 = false;
        if (startDelim$1476.value === '{') {
            delimIsBlock$1485 = blockAllowed$887(toks$1473.concat(delimToken$1484), 0, inExprDelim$1474, parentIsBlock$1475);
        }
        while (index$728 <= length$735) {
            token$1480 = readToken$888(inner$1478, startDelim$1476.value === '(' || startDelim$1476.value === '[', delimIsBlock$1485);
            if (token$1480.type === Token$717.Punctuator && token$1480.value === matchDelim$1477[startDelim$1476.value]) {
                if (token$1480.leadingComments) {
                    delimToken$1484.trailingComments = token$1480.leadingComments;
                }
                break;
            } else if (token$1480.type === Token$717.EOF) {
                throwError$777({}, Messages$722.UnexpectedEOS);
            } else {
                inner$1478.push(token$1480);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$728 >= length$735 && matchDelim$1477[startDelim$1476.value] !== source$726[length$735 - 1]) {
            throwError$777({}, Messages$722.UnexpectedEOS);
        }
        var endLineNumber$1486 = token$1480.lineNumber;
        var endLineStart$1487 = token$1480.lineStart;
        var endRange$1488 = token$1480.range;
        delimToken$1484.inner = inner$1478;
        delimToken$1484.endLineNumber = endLineNumber$1486;
        delimToken$1484.endLineStart = endLineStart$1487;
        delimToken$1484.endRange = endRange$1488;
        return delimToken$1484;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$890(code$1489) {
        var token$1490, tokenTree$1491 = [];
        extra$742 = {};
        extra$742.comments = [];
        patch$883();
        source$726 = code$1489;
        index$728 = 0;
        lineNumber$729 = source$726.length > 0 ? 1 : 0;
        lineStart$730 = 0;
        length$735 = source$726.length;
        state$741 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$728 < length$735) {
            tokenTree$1491.push(readToken$888(tokenTree$1491, false, false));
        }
        var last$1492 = tokenTree$1491[tokenTree$1491.length - 1];
        if (last$1492 && last$1492.type !== Token$717.EOF) {
            tokenTree$1491.push({
                type: Token$717.EOF,
                value: '',
                lineNumber: last$1492.lineNumber,
                lineStart: last$1492.lineStart,
                range: [
                    index$728,
                    index$728
                ]
            });
        }
        return expander$716.tokensToSyntax(tokenTree$1491);
    }
    function parse$891(code$1493, options$1494) {
        var program$1495, toString$1496;
        extra$742 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1493)) {
            tokenStream$737 = code$1493;
            length$735 = tokenStream$737.length;
            lineNumber$729 = tokenStream$737.length > 0 ? 1 : 0;
            source$726 = undefined;
        } else {
            toString$1496 = String;
            if (typeof code$1493 !== 'string' && !(code$1493 instanceof String)) {
                code$1493 = toString$1496(code$1493);
            }
            source$726 = code$1493;
            length$735 = source$726.length;
            lineNumber$729 = source$726.length > 0 ? 1 : 0;
        }
        delegate$736 = SyntaxTreeDelegate$724;
        streamIndex$738 = -1;
        index$728 = 0;
        lineStart$730 = 0;
        sm_lineStart$732 = 0;
        sm_lineNumber$731 = lineNumber$729;
        sm_index$734 = 0;
        sm_range$733 = [
            0,
            0
        ];
        lookahead$739 = null;
        state$741 = {
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
        if (typeof options$1494 !== 'undefined') {
            extra$742.range = typeof options$1494.range === 'boolean' && options$1494.range;
            extra$742.loc = typeof options$1494.loc === 'boolean' && options$1494.loc;
            if (extra$742.loc && options$1494.source !== null && options$1494.source !== undefined) {
                delegate$736 = extend$885(delegate$736, {
                    'postProcess': function (node$1497) {
                        node$1497.loc.source = toString$1496(options$1494.source);
                        return node$1497;
                    }
                });
            }
            if (typeof options$1494.tokens === 'boolean' && options$1494.tokens) {
                extra$742.tokens = [];
            }
            if (typeof options$1494.comment === 'boolean' && options$1494.comment) {
                extra$742.comments = [];
            }
            if (typeof options$1494.tolerant === 'boolean' && options$1494.tolerant) {
                extra$742.errors = [];
            }
        }
        if (length$735 > 0) {
            if (source$726 && typeof source$726[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1493 instanceof String) {
                    source$726 = code$1493.valueOf();
                }
            }
        }
        extra$742 = { loc: true };
        patch$883();
        try {
            program$1495 = parseProgram$869();
            if (typeof extra$742.comments !== 'undefined') {
                filterCommentLocation$872();
                program$1495.comments = extra$742.comments;
            }
            if (typeof extra$742.tokens !== 'undefined') {
                filterTokenLocation$875();
                program$1495.tokens = extra$742.tokens;
            }
            if (typeof extra$742.errors !== 'undefined') {
                program$1495.errors = extra$742.errors;
            }
            if (extra$742.range || extra$742.loc) {
                program$1495.body = filterGroup$881(program$1495.body);
            }
        } catch (e$1498) {
            throw e$1498;
        } finally {
            unpatch$884();
            extra$742 = {};
        }
        return program$1495;
    }
    exports$715.tokenize = tokenize$886;
    exports$715.read = read$890;
    exports$715.Token = Token$717;
    exports$715.assert = assert$743;
    exports$715.parse = parse$891;
    // Deep copy.
    exports$715.Syntax = function () {
        var name$1499, types$1500 = {};
        if (typeof Object.create === 'function') {
            types$1500 = Object.create(null);
        }
        for (name$1499 in Syntax$720) {
            if (Syntax$720.hasOwnProperty(name$1499)) {
                types$1500[name$1499] = Syntax$720[name$1499];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1500);
        }
        return types$1500;
    }();
}));
//# sourceMappingURL=parser.js.map