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
(function (root$700, factory$701) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$701);
    } else if (typeof exports !== 'undefined') {
        factory$701(exports, require('./expander'));
    } else {
        factory$701(root$700.esprima = {});
    }
}(this, function (exports$702, expander$703) {
    'use strict';
    var Token$704, TokenName$705, FnExprTokens$706, Syntax$707, PropertyKind$708, Messages$709, Regex$710, SyntaxTreeDelegate$711, ClassPropertyType$712, source$713, strict$714, index$715, lineNumber$716, lineStart$717, sm_lineNumber$718, sm_lineStart$719, sm_range$720, sm_index$721, length$722, delegate$723, tokenStream$724, streamIndex$725, lookahead$726, lookaheadIndex$727, state$728, extra$729;
    Token$704 = {
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
    TokenName$705 = {};
    TokenName$705[Token$704.BooleanLiteral] = 'Boolean';
    TokenName$705[Token$704.EOF] = '<end>';
    TokenName$705[Token$704.Identifier] = 'Identifier';
    TokenName$705[Token$704.Keyword] = 'Keyword';
    TokenName$705[Token$704.NullLiteral] = 'Null';
    TokenName$705[Token$704.NumericLiteral] = 'Numeric';
    TokenName$705[Token$704.Punctuator] = 'Punctuator';
    TokenName$705[Token$704.StringLiteral] = 'String';
    TokenName$705[Token$704.RegularExpression] = 'RegularExpression';
    TokenName$705[Token$704.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$706 = [
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
    Syntax$707 = {
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
    PropertyKind$708 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$712 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$709 = {
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
    Regex$710 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$730(condition$879, message$880) {
        if (!condition$879) {
            throw new Error('ASSERT: ' + message$880);
        }
    }
    function isIn$731(el$881, list$882) {
        return list$882.indexOf(el$881) !== -1;
    }
    function isDecimalDigit$732(ch$883) {
        return ch$883 >= 48 && ch$883 <= 57;
    }    // 0..9
    function isHexDigit$733(ch$884) {
        return '0123456789abcdefABCDEF'.indexOf(ch$884) >= 0;
    }
    function isOctalDigit$734(ch$885) {
        return '01234567'.indexOf(ch$885) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$735(ch$886) {
        return ch$886 === 32 || ch$886 === 9 || ch$886 === 11 || ch$886 === 12 || ch$886 === 160 || ch$886 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$886)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$736(ch$887) {
        return ch$887 === 10 || ch$887 === 13 || ch$887 === 8232 || ch$887 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$737(ch$888) {
        return ch$888 === 36 || ch$888 === 95 || ch$888 >= 65 && ch$888 <= 90 || ch$888 >= 97 && ch$888 <= 122 || ch$888 === 92 || ch$888 >= 128 && Regex$710.NonAsciiIdentifierStart.test(String.fromCharCode(ch$888));
    }
    function isIdentifierPart$738(ch$889) {
        return ch$889 === 36 || ch$889 === 95 || ch$889 >= 65 && ch$889 <= 90 || ch$889 >= 97 && ch$889 <= 122 || ch$889 >= 48 && ch$889 <= 57 || ch$889 === 92 || ch$889 >= 128 && Regex$710.NonAsciiIdentifierPart.test(String.fromCharCode(ch$889));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$739(id$890) {
        switch (id$890) {
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
    function isStrictModeReservedWord$740(id$891) {
        switch (id$891) {
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
    function isRestrictedWord$741(id$892) {
        return id$892 === 'eval' || id$892 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$742(id$893) {
        if (strict$714 && isStrictModeReservedWord$740(id$893)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$893.length) {
        case 2:
            return id$893 === 'if' || id$893 === 'in' || id$893 === 'do';
        case 3:
            return id$893 === 'var' || id$893 === 'for' || id$893 === 'new' || id$893 === 'try' || id$893 === 'let';
        case 4:
            return id$893 === 'this' || id$893 === 'else' || id$893 === 'case' || id$893 === 'void' || id$893 === 'with' || id$893 === 'enum';
        case 5:
            return id$893 === 'while' || id$893 === 'break' || id$893 === 'catch' || id$893 === 'throw' || id$893 === 'const' || id$893 === 'yield' || id$893 === 'class' || id$893 === 'super';
        case 6:
            return id$893 === 'return' || id$893 === 'typeof' || id$893 === 'delete' || id$893 === 'switch' || id$893 === 'export' || id$893 === 'import';
        case 7:
            return id$893 === 'default' || id$893 === 'finally' || id$893 === 'extends';
        case 8:
            return id$893 === 'function' || id$893 === 'continue' || id$893 === 'debugger';
        case 10:
            return id$893 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$743() {
        var ch$894, blockComment$895, lineComment$896;
        blockComment$895 = false;
        lineComment$896 = false;
        while (index$715 < length$722) {
            ch$894 = source$713.charCodeAt(index$715);
            if (lineComment$896) {
                ++index$715;
                if (isLineTerminator$736(ch$894)) {
                    lineComment$896 = false;
                    if (ch$894 === 13 && source$713.charCodeAt(index$715) === 10) {
                        ++index$715;
                    }
                    ++lineNumber$716;
                    lineStart$717 = index$715;
                }
            } else if (blockComment$895) {
                if (isLineTerminator$736(ch$894)) {
                    if (ch$894 === 13 && source$713.charCodeAt(index$715 + 1) === 10) {
                        ++index$715;
                    }
                    ++lineNumber$716;
                    ++index$715;
                    lineStart$717 = index$715;
                    if (index$715 >= length$722) {
                        throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$894 = source$713.charCodeAt(index$715++);
                    if (index$715 >= length$722) {
                        throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$894 === 42) {
                        ch$894 = source$713.charCodeAt(index$715);
                        if (ch$894 === 47) {
                            ++index$715;
                            blockComment$895 = false;
                        }
                    }
                }
            } else if (ch$894 === 47) {
                ch$894 = source$713.charCodeAt(index$715 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$894 === 47) {
                    index$715 += 2;
                    lineComment$896 = true;
                } else if (ch$894 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$715 += 2;
                    blockComment$895 = true;
                    if (index$715 >= length$722) {
                        throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$735(ch$894)) {
                ++index$715;
            } else if (isLineTerminator$736(ch$894)) {
                ++index$715;
                if (ch$894 === 13 && source$713.charCodeAt(index$715) === 10) {
                    ++index$715;
                }
                ++lineNumber$716;
                lineStart$717 = index$715;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$744(prefix$897) {
        var i$898, len$899, ch$900, code$901 = 0;
        len$899 = prefix$897 === 'u' ? 4 : 2;
        for (i$898 = 0; i$898 < len$899; ++i$898) {
            if (index$715 < length$722 && isHexDigit$733(source$713[index$715])) {
                ch$900 = source$713[index$715++];
                code$901 = code$901 * 16 + '0123456789abcdef'.indexOf(ch$900.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$901);
    }
    function scanUnicodeCodePointEscape$745() {
        var ch$902, code$903, cu1$904, cu2$905;
        ch$902 = source$713[index$715];
        code$903 = 0;
        // At least, one hex digit is required.
        if (ch$902 === '}') {
            throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
        }
        while (index$715 < length$722) {
            ch$902 = source$713[index$715++];
            if (!isHexDigit$733(ch$902)) {
                break;
            }
            code$903 = code$903 * 16 + '0123456789abcdef'.indexOf(ch$902.toLowerCase());
        }
        if (code$903 > 1114111 || ch$902 !== '}') {
            throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$903 <= 65535) {
            return String.fromCharCode(code$903);
        }
        cu1$904 = (code$903 - 65536 >> 10) + 55296;
        cu2$905 = (code$903 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$904, cu2$905);
    }
    function getEscapedIdentifier$746() {
        var ch$906, id$907;
        ch$906 = source$713.charCodeAt(index$715++);
        id$907 = String.fromCharCode(ch$906);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$906 === 92) {
            if (source$713.charCodeAt(index$715) !== 117) {
                throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
            }
            ++index$715;
            ch$906 = scanHexEscape$744('u');
            if (!ch$906 || ch$906 === '\\' || !isIdentifierStart$737(ch$906.charCodeAt(0))) {
                throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
            }
            id$907 = ch$906;
        }
        while (index$715 < length$722) {
            ch$906 = source$713.charCodeAt(index$715);
            if (!isIdentifierPart$738(ch$906)) {
                break;
            }
            ++index$715;
            id$907 += String.fromCharCode(ch$906);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$906 === 92) {
                id$907 = id$907.substr(0, id$907.length - 1);
                if (source$713.charCodeAt(index$715) !== 117) {
                    throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
                }
                ++index$715;
                ch$906 = scanHexEscape$744('u');
                if (!ch$906 || ch$906 === '\\' || !isIdentifierPart$738(ch$906.charCodeAt(0))) {
                    throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
                }
                id$907 += ch$906;
            }
        }
        return id$907;
    }
    function getIdentifier$747() {
        var start$908, ch$909;
        start$908 = index$715++;
        while (index$715 < length$722) {
            ch$909 = source$713.charCodeAt(index$715);
            if (ch$909 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$715 = start$908;
                return getEscapedIdentifier$746();
            }
            if (isIdentifierPart$738(ch$909)) {
                ++index$715;
            } else {
                break;
            }
        }
        return source$713.slice(start$908, index$715);
    }
    function scanIdentifier$748() {
        var start$910, id$911, type$912;
        start$910 = index$715;
        // Backslash (char #92) starts an escaped character.
        id$911 = source$713.charCodeAt(index$715) === 92 ? getEscapedIdentifier$746() : getIdentifier$747();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$911.length === 1) {
            type$912 = Token$704.Identifier;
        } else if (isKeyword$742(id$911)) {
            type$912 = Token$704.Keyword;
        } else if (id$911 === 'null') {
            type$912 = Token$704.NullLiteral;
        } else if (id$911 === 'true' || id$911 === 'false') {
            type$912 = Token$704.BooleanLiteral;
        } else {
            type$912 = Token$704.Identifier;
        }
        return {
            type: type$912,
            value: id$911,
            lineNumber: lineNumber$716,
            lineStart: lineStart$717,
            range: [
                start$910,
                index$715
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$749() {
        var start$913 = index$715, code$914 = source$713.charCodeAt(index$715), code2$915, ch1$916 = source$713[index$715], ch2$917, ch3$918, ch4$919;
        switch (code$914) {
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
            ++index$715;
            if (extra$729.tokenize) {
                if (code$914 === 40) {
                    extra$729.openParenToken = extra$729.tokens.length;
                } else if (code$914 === 123) {
                    extra$729.openCurlyToken = extra$729.tokens.length;
                }
            }
            return {
                type: Token$704.Punctuator,
                value: String.fromCharCode(code$914),
                lineNumber: lineNumber$716,
                lineStart: lineStart$717,
                range: [
                    start$913,
                    index$715
                ]
            };
        default:
            code2$915 = source$713.charCodeAt(index$715 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$915 === 61) {
                switch (code$914) {
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
                    index$715 += 2;
                    return {
                        type: Token$704.Punctuator,
                        value: String.fromCharCode(code$914) + String.fromCharCode(code2$915),
                        lineNumber: lineNumber$716,
                        lineStart: lineStart$717,
                        range: [
                            start$913,
                            index$715
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$715 += 2;
                    // !== and ===
                    if (source$713.charCodeAt(index$715) === 61) {
                        ++index$715;
                    }
                    return {
                        type: Token$704.Punctuator,
                        value: source$713.slice(start$913, index$715),
                        lineNumber: lineNumber$716,
                        lineStart: lineStart$717,
                        range: [
                            start$913,
                            index$715
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$917 = source$713[index$715 + 1];
        ch3$918 = source$713[index$715 + 2];
        ch4$919 = source$713[index$715 + 3];
        // 4-character punctuator: >>>=
        if (ch1$916 === '>' && ch2$917 === '>' && ch3$918 === '>') {
            if (ch4$919 === '=') {
                index$715 += 4;
                return {
                    type: Token$704.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$716,
                    lineStart: lineStart$717,
                    range: [
                        start$913,
                        index$715
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$916 === '>' && ch2$917 === '>' && ch3$918 === '>') {
            index$715 += 3;
            return {
                type: Token$704.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$716,
                lineStart: lineStart$717,
                range: [
                    start$913,
                    index$715
                ]
            };
        }
        if (ch1$916 === '<' && ch2$917 === '<' && ch3$918 === '=') {
            index$715 += 3;
            return {
                type: Token$704.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$716,
                lineStart: lineStart$717,
                range: [
                    start$913,
                    index$715
                ]
            };
        }
        if (ch1$916 === '>' && ch2$917 === '>' && ch3$918 === '=') {
            index$715 += 3;
            return {
                type: Token$704.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$716,
                lineStart: lineStart$717,
                range: [
                    start$913,
                    index$715
                ]
            };
        }
        if (ch1$916 === '.' && ch2$917 === '.' && ch3$918 === '.') {
            index$715 += 3;
            return {
                type: Token$704.Punctuator,
                value: '...',
                lineNumber: lineNumber$716,
                lineStart: lineStart$717,
                range: [
                    start$913,
                    index$715
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$916 === ch2$917 && '+-<>&|'.indexOf(ch1$916) >= 0) {
            index$715 += 2;
            return {
                type: Token$704.Punctuator,
                value: ch1$916 + ch2$917,
                lineNumber: lineNumber$716,
                lineStart: lineStart$717,
                range: [
                    start$913,
                    index$715
                ]
            };
        }
        if (ch1$916 === '=' && ch2$917 === '>') {
            index$715 += 2;
            return {
                type: Token$704.Punctuator,
                value: '=>',
                lineNumber: lineNumber$716,
                lineStart: lineStart$717,
                range: [
                    start$913,
                    index$715
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$916) >= 0) {
            ++index$715;
            return {
                type: Token$704.Punctuator,
                value: ch1$916,
                lineNumber: lineNumber$716,
                lineStart: lineStart$717,
                range: [
                    start$913,
                    index$715
                ]
            };
        }
        if (ch1$916 === '.') {
            ++index$715;
            return {
                type: Token$704.Punctuator,
                value: ch1$916,
                lineNumber: lineNumber$716,
                lineStart: lineStart$717,
                range: [
                    start$913,
                    index$715
                ]
            };
        }
        throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$750(start$920) {
        var number$921 = '';
        while (index$715 < length$722) {
            if (!isHexDigit$733(source$713[index$715])) {
                break;
            }
            number$921 += source$713[index$715++];
        }
        if (number$921.length === 0) {
            throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$737(source$713.charCodeAt(index$715))) {
            throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$704.NumericLiteral,
            value: parseInt('0x' + number$921, 16),
            lineNumber: lineNumber$716,
            lineStart: lineStart$717,
            range: [
                start$920,
                index$715
            ]
        };
    }
    function scanOctalLiteral$751(prefix$922, start$923) {
        var number$924, octal$925;
        if (isOctalDigit$734(prefix$922)) {
            octal$925 = true;
            number$924 = '0' + source$713[index$715++];
        } else {
            octal$925 = false;
            ++index$715;
            number$924 = '';
        }
        while (index$715 < length$722) {
            if (!isOctalDigit$734(source$713[index$715])) {
                break;
            }
            number$924 += source$713[index$715++];
        }
        if (!octal$925 && number$924.length === 0) {
            // only 0o or 0O
            throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$737(source$713.charCodeAt(index$715)) || isDecimalDigit$732(source$713.charCodeAt(index$715))) {
            throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$704.NumericLiteral,
            value: parseInt(number$924, 8),
            octal: octal$925,
            lineNumber: lineNumber$716,
            lineStart: lineStart$717,
            range: [
                start$923,
                index$715
            ]
        };
    }
    function scanNumericLiteral$752() {
        var number$926, start$927, ch$928, octal$929;
        ch$928 = source$713[index$715];
        assert$730(isDecimalDigit$732(ch$928.charCodeAt(0)) || ch$928 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$927 = index$715;
        number$926 = '';
        if (ch$928 !== '.') {
            number$926 = source$713[index$715++];
            ch$928 = source$713[index$715];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$926 === '0') {
                if (ch$928 === 'x' || ch$928 === 'X') {
                    ++index$715;
                    return scanHexLiteral$750(start$927);
                }
                if (ch$928 === 'b' || ch$928 === 'B') {
                    ++index$715;
                    number$926 = '';
                    while (index$715 < length$722) {
                        ch$928 = source$713[index$715];
                        if (ch$928 !== '0' && ch$928 !== '1') {
                            break;
                        }
                        number$926 += source$713[index$715++];
                    }
                    if (number$926.length === 0) {
                        // only 0b or 0B
                        throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$715 < length$722) {
                        ch$928 = source$713.charCodeAt(index$715);
                        if (isIdentifierStart$737(ch$928) || isDecimalDigit$732(ch$928)) {
                            throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$704.NumericLiteral,
                        value: parseInt(number$926, 2),
                        lineNumber: lineNumber$716,
                        lineStart: lineStart$717,
                        range: [
                            start$927,
                            index$715
                        ]
                    };
                }
                if (ch$928 === 'o' || ch$928 === 'O' || isOctalDigit$734(ch$928)) {
                    return scanOctalLiteral$751(ch$928, start$927);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$928 && isDecimalDigit$732(ch$928.charCodeAt(0))) {
                    throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$732(source$713.charCodeAt(index$715))) {
                number$926 += source$713[index$715++];
            }
            ch$928 = source$713[index$715];
        }
        if (ch$928 === '.') {
            number$926 += source$713[index$715++];
            while (isDecimalDigit$732(source$713.charCodeAt(index$715))) {
                number$926 += source$713[index$715++];
            }
            ch$928 = source$713[index$715];
        }
        if (ch$928 === 'e' || ch$928 === 'E') {
            number$926 += source$713[index$715++];
            ch$928 = source$713[index$715];
            if (ch$928 === '+' || ch$928 === '-') {
                number$926 += source$713[index$715++];
            }
            if (isDecimalDigit$732(source$713.charCodeAt(index$715))) {
                while (isDecimalDigit$732(source$713.charCodeAt(index$715))) {
                    number$926 += source$713[index$715++];
                }
            } else {
                throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$737(source$713.charCodeAt(index$715))) {
            throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$704.NumericLiteral,
            value: parseFloat(number$926),
            lineNumber: lineNumber$716,
            lineStart: lineStart$717,
            range: [
                start$927,
                index$715
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$753() {
        var str$930 = '', quote$931, start$932, ch$933, code$934, unescaped$935, restore$936, octal$937 = false;
        quote$931 = source$713[index$715];
        assert$730(quote$931 === '\'' || quote$931 === '"', 'String literal must starts with a quote');
        start$932 = index$715;
        ++index$715;
        while (index$715 < length$722) {
            ch$933 = source$713[index$715++];
            if (ch$933 === quote$931) {
                quote$931 = '';
                break;
            } else if (ch$933 === '\\') {
                ch$933 = source$713[index$715++];
                if (!ch$933 || !isLineTerminator$736(ch$933.charCodeAt(0))) {
                    switch (ch$933) {
                    case 'n':
                        str$930 += '\n';
                        break;
                    case 'r':
                        str$930 += '\r';
                        break;
                    case 't':
                        str$930 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$713[index$715] === '{') {
                            ++index$715;
                            str$930 += scanUnicodeCodePointEscape$745();
                        } else {
                            restore$936 = index$715;
                            unescaped$935 = scanHexEscape$744(ch$933);
                            if (unescaped$935) {
                                str$930 += unescaped$935;
                            } else {
                                index$715 = restore$936;
                                str$930 += ch$933;
                            }
                        }
                        break;
                    case 'b':
                        str$930 += '\b';
                        break;
                    case 'f':
                        str$930 += '\f';
                        break;
                    case 'v':
                        str$930 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$734(ch$933)) {
                            code$934 = '01234567'.indexOf(ch$933);
                            // \0 is not octal escape sequence
                            if (code$934 !== 0) {
                                octal$937 = true;
                            }
                            if (index$715 < length$722 && isOctalDigit$734(source$713[index$715])) {
                                octal$937 = true;
                                code$934 = code$934 * 8 + '01234567'.indexOf(source$713[index$715++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$933) >= 0 && index$715 < length$722 && isOctalDigit$734(source$713[index$715])) {
                                    code$934 = code$934 * 8 + '01234567'.indexOf(source$713[index$715++]);
                                }
                            }
                            str$930 += String.fromCharCode(code$934);
                        } else {
                            str$930 += ch$933;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$716;
                    if (ch$933 === '\r' && source$713[index$715] === '\n') {
                        ++index$715;
                    }
                }
            } else if (isLineTerminator$736(ch$933.charCodeAt(0))) {
                break;
            } else {
                str$930 += ch$933;
            }
        }
        if (quote$931 !== '') {
            throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$704.StringLiteral,
            value: str$930,
            octal: octal$937,
            lineNumber: lineNumber$716,
            lineStart: lineStart$717,
            range: [
                start$932,
                index$715
            ]
        };
    }
    function scanTemplate$754() {
        var cooked$938 = '', ch$939, start$940, terminated$941, tail$942, restore$943, unescaped$944, code$945, octal$946;
        terminated$941 = false;
        tail$942 = false;
        start$940 = index$715;
        ++index$715;
        while (index$715 < length$722) {
            ch$939 = source$713[index$715++];
            if (ch$939 === '`') {
                tail$942 = true;
                terminated$941 = true;
                break;
            } else if (ch$939 === '$') {
                if (source$713[index$715] === '{') {
                    ++index$715;
                    terminated$941 = true;
                    break;
                }
                cooked$938 += ch$939;
            } else if (ch$939 === '\\') {
                ch$939 = source$713[index$715++];
                if (!isLineTerminator$736(ch$939.charCodeAt(0))) {
                    switch (ch$939) {
                    case 'n':
                        cooked$938 += '\n';
                        break;
                    case 'r':
                        cooked$938 += '\r';
                        break;
                    case 't':
                        cooked$938 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$713[index$715] === '{') {
                            ++index$715;
                            cooked$938 += scanUnicodeCodePointEscape$745();
                        } else {
                            restore$943 = index$715;
                            unescaped$944 = scanHexEscape$744(ch$939);
                            if (unescaped$944) {
                                cooked$938 += unescaped$944;
                            } else {
                                index$715 = restore$943;
                                cooked$938 += ch$939;
                            }
                        }
                        break;
                    case 'b':
                        cooked$938 += '\b';
                        break;
                    case 'f':
                        cooked$938 += '\f';
                        break;
                    case 'v':
                        cooked$938 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$734(ch$939)) {
                            code$945 = '01234567'.indexOf(ch$939);
                            // \0 is not octal escape sequence
                            if (code$945 !== 0) {
                                octal$946 = true;
                            }
                            if (index$715 < length$722 && isOctalDigit$734(source$713[index$715])) {
                                octal$946 = true;
                                code$945 = code$945 * 8 + '01234567'.indexOf(source$713[index$715++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$939) >= 0 && index$715 < length$722 && isOctalDigit$734(source$713[index$715])) {
                                    code$945 = code$945 * 8 + '01234567'.indexOf(source$713[index$715++]);
                                }
                            }
                            cooked$938 += String.fromCharCode(code$945);
                        } else {
                            cooked$938 += ch$939;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$716;
                    if (ch$939 === '\r' && source$713[index$715] === '\n') {
                        ++index$715;
                    }
                }
            } else if (isLineTerminator$736(ch$939.charCodeAt(0))) {
                ++lineNumber$716;
                if (ch$939 === '\r' && source$713[index$715] === '\n') {
                    ++index$715;
                }
                cooked$938 += '\n';
            } else {
                cooked$938 += ch$939;
            }
        }
        if (!terminated$941) {
            throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$704.Template,
            value: {
                cooked: cooked$938,
                raw: source$713.slice(start$940 + 1, index$715 - (tail$942 ? 1 : 2))
            },
            tail: tail$942,
            octal: octal$946,
            lineNumber: lineNumber$716,
            lineStart: lineStart$717,
            range: [
                start$940,
                index$715
            ]
        };
    }
    function scanTemplateElement$755(option$947) {
        var startsWith$948, template$949;
        lookahead$726 = null;
        skipComment$743();
        startsWith$948 = option$947.head ? '`' : '}';
        if (source$713[index$715] !== startsWith$948) {
            throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
        }
        template$949 = scanTemplate$754();
        peek$761();
        return template$949;
    }
    function scanRegExp$756() {
        var str$950, ch$951, start$952, pattern$953, flags$954, value$955, classMarker$956 = false, restore$957, terminated$958 = false;
        lookahead$726 = null;
        skipComment$743();
        start$952 = index$715;
        ch$951 = source$713[index$715];
        assert$730(ch$951 === '/', 'Regular expression literal must start with a slash');
        str$950 = source$713[index$715++];
        while (index$715 < length$722) {
            ch$951 = source$713[index$715++];
            str$950 += ch$951;
            if (classMarker$956) {
                if (ch$951 === ']') {
                    classMarker$956 = false;
                }
            } else {
                if (ch$951 === '\\') {
                    ch$951 = source$713[index$715++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$736(ch$951.charCodeAt(0))) {
                        throwError$764({}, Messages$709.UnterminatedRegExp);
                    }
                    str$950 += ch$951;
                } else if (ch$951 === '/') {
                    terminated$958 = true;
                    break;
                } else if (ch$951 === '[') {
                    classMarker$956 = true;
                } else if (isLineTerminator$736(ch$951.charCodeAt(0))) {
                    throwError$764({}, Messages$709.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$958) {
            throwError$764({}, Messages$709.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$953 = str$950.substr(1, str$950.length - 2);
        flags$954 = '';
        while (index$715 < length$722) {
            ch$951 = source$713[index$715];
            if (!isIdentifierPart$738(ch$951.charCodeAt(0))) {
                break;
            }
            ++index$715;
            if (ch$951 === '\\' && index$715 < length$722) {
                ch$951 = source$713[index$715];
                if (ch$951 === 'u') {
                    ++index$715;
                    restore$957 = index$715;
                    ch$951 = scanHexEscape$744('u');
                    if (ch$951) {
                        flags$954 += ch$951;
                        for (str$950 += '\\u'; restore$957 < index$715; ++restore$957) {
                            str$950 += source$713[restore$957];
                        }
                    } else {
                        index$715 = restore$957;
                        flags$954 += 'u';
                        str$950 += '\\u';
                    }
                } else {
                    str$950 += '\\';
                }
            } else {
                flags$954 += ch$951;
                str$950 += ch$951;
            }
        }
        try {
            value$955 = new RegExp(pattern$953, flags$954);
        } catch (e$959) {
            throwError$764({}, Messages$709.InvalidRegExp);
        }
        // peek();
        if (extra$729.tokenize) {
            return {
                type: Token$704.RegularExpression,
                value: value$955,
                lineNumber: lineNumber$716,
                lineStart: lineStart$717,
                range: [
                    start$952,
                    index$715
                ]
            };
        }
        return {
            type: Token$704.RegularExpression,
            literal: str$950,
            value: value$955,
            range: [
                start$952,
                index$715
            ]
        };
    }
    function isIdentifierName$757(token$960) {
        return token$960.type === Token$704.Identifier || token$960.type === Token$704.Keyword || token$960.type === Token$704.BooleanLiteral || token$960.type === Token$704.NullLiteral;
    }
    function advanceSlash$758() {
        var prevToken$961, checkToken$962;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$961 = extra$729.tokens[extra$729.tokens.length - 1];
        if (!prevToken$961) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$756();
        }
        if (prevToken$961.type === 'Punctuator') {
            if (prevToken$961.value === ')') {
                checkToken$962 = extra$729.tokens[extra$729.openParenToken - 1];
                if (checkToken$962 && checkToken$962.type === 'Keyword' && (checkToken$962.value === 'if' || checkToken$962.value === 'while' || checkToken$962.value === 'for' || checkToken$962.value === 'with')) {
                    return scanRegExp$756();
                }
                return scanPunctuator$749();
            }
            if (prevToken$961.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$729.tokens[extra$729.openCurlyToken - 3] && extra$729.tokens[extra$729.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$962 = extra$729.tokens[extra$729.openCurlyToken - 4];
                    if (!checkToken$962) {
                        return scanPunctuator$749();
                    }
                } else if (extra$729.tokens[extra$729.openCurlyToken - 4] && extra$729.tokens[extra$729.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$962 = extra$729.tokens[extra$729.openCurlyToken - 5];
                    if (!checkToken$962) {
                        return scanRegExp$756();
                    }
                } else {
                    return scanPunctuator$749();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$706.indexOf(checkToken$962.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$749();
                }
                // It is a declaration.
                return scanRegExp$756();
            }
            return scanRegExp$756();
        }
        if (prevToken$961.type === 'Keyword') {
            return scanRegExp$756();
        }
        return scanPunctuator$749();
    }
    function advance$759() {
        var ch$963;
        skipComment$743();
        if (index$715 >= length$722) {
            return {
                type: Token$704.EOF,
                lineNumber: lineNumber$716,
                lineStart: lineStart$717,
                range: [
                    index$715,
                    index$715
                ]
            };
        }
        ch$963 = source$713.charCodeAt(index$715);
        // Very common: ( and ) and ;
        if (ch$963 === 40 || ch$963 === 41 || ch$963 === 58) {
            return scanPunctuator$749();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$963 === 39 || ch$963 === 34) {
            return scanStringLiteral$753();
        }
        if (ch$963 === 96) {
            return scanTemplate$754();
        }
        if (isIdentifierStart$737(ch$963)) {
            return scanIdentifier$748();
        }
        // # and @ are allowed for sweet.js
        if (ch$963 === 35 || ch$963 === 64) {
            ++index$715;
            return {
                type: Token$704.Punctuator,
                value: String.fromCharCode(ch$963),
                lineNumber: lineNumber$716,
                lineStart: lineStart$717,
                range: [
                    index$715 - 1,
                    index$715
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$963 === 46) {
            if (isDecimalDigit$732(source$713.charCodeAt(index$715 + 1))) {
                return scanNumericLiteral$752();
            }
            return scanPunctuator$749();
        }
        if (isDecimalDigit$732(ch$963)) {
            return scanNumericLiteral$752();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$729.tokenize && ch$963 === 47) {
            return advanceSlash$758();
        }
        return scanPunctuator$749();
    }
    function lex$760() {
        var token$964;
        token$964 = lookahead$726;
        streamIndex$725 = lookaheadIndex$727;
        lineNumber$716 = token$964.lineNumber;
        lineStart$717 = token$964.lineStart;
        sm_lineNumber$718 = lookahead$726.sm_lineNumber;
        sm_lineStart$719 = lookahead$726.sm_lineStart;
        sm_range$720 = lookahead$726.sm_range;
        sm_index$721 = lookahead$726.sm_range[0];
        lookahead$726 = tokenStream$724[++streamIndex$725].token;
        lookaheadIndex$727 = streamIndex$725;
        index$715 = lookahead$726.range[0];
        return token$964;
    }
    function peek$761() {
        lookaheadIndex$727 = streamIndex$725 + 1;
        if (lookaheadIndex$727 >= length$722) {
            lookahead$726 = {
                type: Token$704.EOF,
                lineNumber: lineNumber$716,
                lineStart: lineStart$717,
                range: [
                    index$715,
                    index$715
                ]
            };
            return;
        }
        lookahead$726 = tokenStream$724[lookaheadIndex$727].token;
        index$715 = lookahead$726.range[0];
    }
    function lookahead2$762() {
        var adv$965, pos$966, line$967, start$968, result$969;
        if (streamIndex$725 + 1 >= length$722 || streamIndex$725 + 2 >= length$722) {
            return {
                type: Token$704.EOF,
                lineNumber: lineNumber$716,
                lineStart: lineStart$717,
                range: [
                    index$715,
                    index$715
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$726 === null) {
            lookaheadIndex$727 = streamIndex$725 + 1;
            lookahead$726 = tokenStream$724[lookaheadIndex$727].token;
            index$715 = lookahead$726.range[0];
        }
        result$969 = tokenStream$724[lookaheadIndex$727 + 1].token;
        return result$969;
    }
    SyntaxTreeDelegate$711 = {
        name: 'SyntaxTree',
        postProcess: function (node$970) {
            return node$970;
        },
        createArrayExpression: function (elements$971) {
            return {
                type: Syntax$707.ArrayExpression,
                elements: elements$971
            };
        },
        createAssignmentExpression: function (operator$972, left$973, right$974) {
            return {
                type: Syntax$707.AssignmentExpression,
                operator: operator$972,
                left: left$973,
                right: right$974
            };
        },
        createBinaryExpression: function (operator$975, left$976, right$977) {
            var type$978 = operator$975 === '||' || operator$975 === '&&' ? Syntax$707.LogicalExpression : Syntax$707.BinaryExpression;
            return {
                type: type$978,
                operator: operator$975,
                left: left$976,
                right: right$977
            };
        },
        createBlockStatement: function (body$979) {
            return {
                type: Syntax$707.BlockStatement,
                body: body$979
            };
        },
        createBreakStatement: function (label$980) {
            return {
                type: Syntax$707.BreakStatement,
                label: label$980
            };
        },
        createCallExpression: function (callee$981, args$982) {
            return {
                type: Syntax$707.CallExpression,
                callee: callee$981,
                'arguments': args$982
            };
        },
        createCatchClause: function (param$983, body$984) {
            return {
                type: Syntax$707.CatchClause,
                param: param$983,
                body: body$984
            };
        },
        createConditionalExpression: function (test$985, consequent$986, alternate$987) {
            return {
                type: Syntax$707.ConditionalExpression,
                test: test$985,
                consequent: consequent$986,
                alternate: alternate$987
            };
        },
        createContinueStatement: function (label$988) {
            return {
                type: Syntax$707.ContinueStatement,
                label: label$988
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$707.DebuggerStatement };
        },
        createDoWhileStatement: function (body$989, test$990) {
            return {
                type: Syntax$707.DoWhileStatement,
                body: body$989,
                test: test$990
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$707.EmptyStatement };
        },
        createExpressionStatement: function (expression$991) {
            return {
                type: Syntax$707.ExpressionStatement,
                expression: expression$991
            };
        },
        createForStatement: function (init$992, test$993, update$994, body$995) {
            return {
                type: Syntax$707.ForStatement,
                init: init$992,
                test: test$993,
                update: update$994,
                body: body$995
            };
        },
        createForInStatement: function (left$996, right$997, body$998) {
            return {
                type: Syntax$707.ForInStatement,
                left: left$996,
                right: right$997,
                body: body$998,
                each: false
            };
        },
        createForOfStatement: function (left$999, right$1000, body$1001) {
            return {
                type: Syntax$707.ForOfStatement,
                left: left$999,
                right: right$1000,
                body: body$1001
            };
        },
        createFunctionDeclaration: function (id$1002, params$1003, defaults$1004, body$1005, rest$1006, generator$1007, expression$1008) {
            return {
                type: Syntax$707.FunctionDeclaration,
                id: id$1002,
                params: params$1003,
                defaults: defaults$1004,
                body: body$1005,
                rest: rest$1006,
                generator: generator$1007,
                expression: expression$1008
            };
        },
        createFunctionExpression: function (id$1009, params$1010, defaults$1011, body$1012, rest$1013, generator$1014, expression$1015) {
            return {
                type: Syntax$707.FunctionExpression,
                id: id$1009,
                params: params$1010,
                defaults: defaults$1011,
                body: body$1012,
                rest: rest$1013,
                generator: generator$1014,
                expression: expression$1015
            };
        },
        createIdentifier: function (name$1016) {
            return {
                type: Syntax$707.Identifier,
                name: name$1016
            };
        },
        createIfStatement: function (test$1017, consequent$1018, alternate$1019) {
            return {
                type: Syntax$707.IfStatement,
                test: test$1017,
                consequent: consequent$1018,
                alternate: alternate$1019
            };
        },
        createLabeledStatement: function (label$1020, body$1021) {
            return {
                type: Syntax$707.LabeledStatement,
                label: label$1020,
                body: body$1021
            };
        },
        createLiteral: function (token$1022) {
            return {
                type: Syntax$707.Literal,
                value: token$1022.value,
                raw: String(token$1022.value)
            };
        },
        createMemberExpression: function (accessor$1023, object$1024, property$1025) {
            return {
                type: Syntax$707.MemberExpression,
                computed: accessor$1023 === '[',
                object: object$1024,
                property: property$1025
            };
        },
        createNewExpression: function (callee$1026, args$1027) {
            return {
                type: Syntax$707.NewExpression,
                callee: callee$1026,
                'arguments': args$1027
            };
        },
        createObjectExpression: function (properties$1028) {
            return {
                type: Syntax$707.ObjectExpression,
                properties: properties$1028
            };
        },
        createPostfixExpression: function (operator$1029, argument$1030) {
            return {
                type: Syntax$707.UpdateExpression,
                operator: operator$1029,
                argument: argument$1030,
                prefix: false
            };
        },
        createProgram: function (body$1031) {
            return {
                type: Syntax$707.Program,
                body: body$1031
            };
        },
        createProperty: function (kind$1032, key$1033, value$1034, method$1035, shorthand$1036) {
            return {
                type: Syntax$707.Property,
                key: key$1033,
                value: value$1034,
                kind: kind$1032,
                method: method$1035,
                shorthand: shorthand$1036
            };
        },
        createReturnStatement: function (argument$1037) {
            return {
                type: Syntax$707.ReturnStatement,
                argument: argument$1037
            };
        },
        createSequenceExpression: function (expressions$1038) {
            return {
                type: Syntax$707.SequenceExpression,
                expressions: expressions$1038
            };
        },
        createSwitchCase: function (test$1039, consequent$1040) {
            return {
                type: Syntax$707.SwitchCase,
                test: test$1039,
                consequent: consequent$1040
            };
        },
        createSwitchStatement: function (discriminant$1041, cases$1042) {
            return {
                type: Syntax$707.SwitchStatement,
                discriminant: discriminant$1041,
                cases: cases$1042
            };
        },
        createThisExpression: function () {
            return { type: Syntax$707.ThisExpression };
        },
        createThrowStatement: function (argument$1043) {
            return {
                type: Syntax$707.ThrowStatement,
                argument: argument$1043
            };
        },
        createTryStatement: function (block$1044, guardedHandlers$1045, handlers$1046, finalizer$1047) {
            return {
                type: Syntax$707.TryStatement,
                block: block$1044,
                guardedHandlers: guardedHandlers$1045,
                handlers: handlers$1046,
                finalizer: finalizer$1047
            };
        },
        createUnaryExpression: function (operator$1048, argument$1049) {
            if (operator$1048 === '++' || operator$1048 === '--') {
                return {
                    type: Syntax$707.UpdateExpression,
                    operator: operator$1048,
                    argument: argument$1049,
                    prefix: true
                };
            }
            return {
                type: Syntax$707.UnaryExpression,
                operator: operator$1048,
                argument: argument$1049
            };
        },
        createVariableDeclaration: function (declarations$1050, kind$1051) {
            return {
                type: Syntax$707.VariableDeclaration,
                declarations: declarations$1050,
                kind: kind$1051
            };
        },
        createVariableDeclarator: function (id$1052, init$1053) {
            return {
                type: Syntax$707.VariableDeclarator,
                id: id$1052,
                init: init$1053
            };
        },
        createWhileStatement: function (test$1054, body$1055) {
            return {
                type: Syntax$707.WhileStatement,
                test: test$1054,
                body: body$1055
            };
        },
        createWithStatement: function (object$1056, body$1057) {
            return {
                type: Syntax$707.WithStatement,
                object: object$1056,
                body: body$1057
            };
        },
        createTemplateElement: function (value$1058, tail$1059) {
            return {
                type: Syntax$707.TemplateElement,
                value: value$1058,
                tail: tail$1059
            };
        },
        createTemplateLiteral: function (quasis$1060, expressions$1061) {
            return {
                type: Syntax$707.TemplateLiteral,
                quasis: quasis$1060,
                expressions: expressions$1061
            };
        },
        createSpreadElement: function (argument$1062) {
            return {
                type: Syntax$707.SpreadElement,
                argument: argument$1062
            };
        },
        createTaggedTemplateExpression: function (tag$1063, quasi$1064) {
            return {
                type: Syntax$707.TaggedTemplateExpression,
                tag: tag$1063,
                quasi: quasi$1064
            };
        },
        createArrowFunctionExpression: function (params$1065, defaults$1066, body$1067, rest$1068, expression$1069) {
            return {
                type: Syntax$707.ArrowFunctionExpression,
                id: null,
                params: params$1065,
                defaults: defaults$1066,
                body: body$1067,
                rest: rest$1068,
                generator: false,
                expression: expression$1069
            };
        },
        createMethodDefinition: function (propertyType$1070, kind$1071, key$1072, value$1073) {
            return {
                type: Syntax$707.MethodDefinition,
                key: key$1072,
                value: value$1073,
                kind: kind$1071,
                'static': propertyType$1070 === ClassPropertyType$712.static
            };
        },
        createClassBody: function (body$1074) {
            return {
                type: Syntax$707.ClassBody,
                body: body$1074
            };
        },
        createClassExpression: function (id$1075, superClass$1076, body$1077) {
            return {
                type: Syntax$707.ClassExpression,
                id: id$1075,
                superClass: superClass$1076,
                body: body$1077
            };
        },
        createClassDeclaration: function (id$1078, superClass$1079, body$1080) {
            return {
                type: Syntax$707.ClassDeclaration,
                id: id$1078,
                superClass: superClass$1079,
                body: body$1080
            };
        },
        createExportSpecifier: function (id$1081, name$1082) {
            return {
                type: Syntax$707.ExportSpecifier,
                id: id$1081,
                name: name$1082
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$707.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1083, specifiers$1084, source$1085) {
            return {
                type: Syntax$707.ExportDeclaration,
                declaration: declaration$1083,
                specifiers: specifiers$1084,
                source: source$1085
            };
        },
        createImportSpecifier: function (id$1086, name$1087) {
            return {
                type: Syntax$707.ImportSpecifier,
                id: id$1086,
                name: name$1087
            };
        },
        createImportDeclaration: function (specifiers$1088, kind$1089, source$1090) {
            return {
                type: Syntax$707.ImportDeclaration,
                specifiers: specifiers$1088,
                kind: kind$1089,
                source: source$1090
            };
        },
        createYieldExpression: function (argument$1091, delegate$1092) {
            return {
                type: Syntax$707.YieldExpression,
                argument: argument$1091,
                delegate: delegate$1092
            };
        },
        createModuleDeclaration: function (id$1093, source$1094, body$1095) {
            return {
                type: Syntax$707.ModuleDeclaration,
                id: id$1093,
                source: source$1094,
                body: body$1095
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$763() {
        return lookahead$726.lineNumber !== lineNumber$716;
    }
    // Throw an exception
    function throwError$764(token$1096, messageFormat$1097) {
        var error$1098, args$1099 = Array.prototype.slice.call(arguments, 2), msg$1100 = messageFormat$1097.replace(/%(\d)/g, function (whole$1101, index$1102) {
                assert$730(index$1102 < args$1099.length, 'Message reference must be in range');
                return args$1099[index$1102];
            });
        if (typeof token$1096.lineNumber === 'number') {
            error$1098 = new Error('Line ' + token$1096.lineNumber + ': ' + msg$1100);
            error$1098.index = token$1096.range[0];
            error$1098.lineNumber = token$1096.lineNumber;
            error$1098.column = token$1096.range[0] - lineStart$717 + 1;
        } else {
            error$1098 = new Error('Line ' + lineNumber$716 + ': ' + msg$1100);
            error$1098.index = index$715;
            error$1098.lineNumber = lineNumber$716;
            error$1098.column = index$715 - lineStart$717 + 1;
        }
        error$1098.description = msg$1100;
        throw error$1098;
    }
    function throwErrorTolerant$765() {
        try {
            throwError$764.apply(null, arguments);
        } catch (e$1103) {
            if (extra$729.errors) {
                extra$729.errors.push(e$1103);
            } else {
                throw e$1103;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$766(token$1104) {
        if (token$1104.type === Token$704.EOF) {
            throwError$764(token$1104, Messages$709.UnexpectedEOS);
        }
        if (token$1104.type === Token$704.NumericLiteral) {
            throwError$764(token$1104, Messages$709.UnexpectedNumber);
        }
        if (token$1104.type === Token$704.StringLiteral) {
            throwError$764(token$1104, Messages$709.UnexpectedString);
        }
        if (token$1104.type === Token$704.Identifier) {
            throwError$764(token$1104, Messages$709.UnexpectedIdentifier);
        }
        if (token$1104.type === Token$704.Keyword) {
            if (isFutureReservedWord$739(token$1104.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$714 && isStrictModeReservedWord$740(token$1104.value)) {
                throwErrorTolerant$765(token$1104, Messages$709.StrictReservedWord);
                return;
            }
            throwError$764(token$1104, Messages$709.UnexpectedToken, token$1104.value);
        }
        if (token$1104.type === Token$704.Template) {
            throwError$764(token$1104, Messages$709.UnexpectedTemplate, token$1104.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$764(token$1104, Messages$709.UnexpectedToken, token$1104.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$767(value$1105) {
        var token$1106 = lex$760();
        if (token$1106.type !== Token$704.Punctuator || token$1106.value !== value$1105) {
            throwUnexpected$766(token$1106);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$768(keyword$1107) {
        var token$1108 = lex$760();
        if (token$1108.type !== Token$704.Keyword || token$1108.value !== keyword$1107) {
            throwUnexpected$766(token$1108);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$769(value$1109) {
        return lookahead$726.type === Token$704.Punctuator && lookahead$726.value === value$1109;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$770(keyword$1110) {
        return lookahead$726.type === Token$704.Keyword && lookahead$726.value === keyword$1110;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$771(keyword$1111) {
        return lookahead$726.type === Token$704.Identifier && lookahead$726.value === keyword$1111;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$772() {
        var op$1112;
        if (lookahead$726.type !== Token$704.Punctuator) {
            return false;
        }
        op$1112 = lookahead$726.value;
        return op$1112 === '=' || op$1112 === '*=' || op$1112 === '/=' || op$1112 === '%=' || op$1112 === '+=' || op$1112 === '-=' || op$1112 === '<<=' || op$1112 === '>>=' || op$1112 === '>>>=' || op$1112 === '&=' || op$1112 === '^=' || op$1112 === '|=';
    }
    function consumeSemicolon$773() {
        var line$1113, ch$1114;
        ch$1114 = lookahead$726.value ? lookahead$726.value.charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1114 === 59) {
            lex$760();
            return;
        }
        if (lookahead$726.lineNumber !== lineNumber$716) {
            return;
        }
        if (match$769(';')) {
            lex$760();
            return;
        }
        if (lookahead$726.type !== Token$704.EOF && !match$769('}')) {
            throwUnexpected$766(lookahead$726);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$774(expr$1115) {
        return expr$1115.type === Syntax$707.Identifier || expr$1115.type === Syntax$707.MemberExpression;
    }
    function isAssignableLeftHandSide$775(expr$1116) {
        return isLeftHandSide$774(expr$1116) || expr$1116.type === Syntax$707.ObjectPattern || expr$1116.type === Syntax$707.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$776() {
        var elements$1117 = [], blocks$1118 = [], filter$1119 = null, tmp$1120, possiblecomprehension$1121 = true, body$1122;
        expect$767('[');
        while (!match$769(']')) {
            if (lookahead$726.value === 'for' && lookahead$726.type === Token$704.Keyword) {
                if (!possiblecomprehension$1121) {
                    throwError$764({}, Messages$709.ComprehensionError);
                }
                matchKeyword$770('for');
                tmp$1120 = parseForStatement$824({ ignoreBody: true });
                tmp$1120.of = tmp$1120.type === Syntax$707.ForOfStatement;
                tmp$1120.type = Syntax$707.ComprehensionBlock;
                if (tmp$1120.left.kind) {
                    // can't be let or const
                    throwError$764({}, Messages$709.ComprehensionError);
                }
                blocks$1118.push(tmp$1120);
            } else if (lookahead$726.value === 'if' && lookahead$726.type === Token$704.Keyword) {
                if (!possiblecomprehension$1121) {
                    throwError$764({}, Messages$709.ComprehensionError);
                }
                expectKeyword$768('if');
                expect$767('(');
                filter$1119 = parseExpression$804();
                expect$767(')');
            } else if (lookahead$726.value === ',' && lookahead$726.type === Token$704.Punctuator) {
                possiblecomprehension$1121 = false;
                // no longer allowed.
                lex$760();
                elements$1117.push(null);
            } else {
                tmp$1120 = parseSpreadOrAssignmentExpression$787();
                elements$1117.push(tmp$1120);
                if (tmp$1120 && tmp$1120.type === Syntax$707.SpreadElement) {
                    if (!match$769(']')) {
                        throwError$764({}, Messages$709.ElementAfterSpreadElement);
                    }
                } else if (!(match$769(']') || matchKeyword$770('for') || matchKeyword$770('if'))) {
                    expect$767(',');
                    // this lexes.
                    possiblecomprehension$1121 = false;
                }
            }
        }
        expect$767(']');
        if (filter$1119 && !blocks$1118.length) {
            throwError$764({}, Messages$709.ComprehensionRequiresBlock);
        }
        if (blocks$1118.length) {
            if (elements$1117.length !== 1) {
                throwError$764({}, Messages$709.ComprehensionError);
            }
            return {
                type: Syntax$707.ComprehensionExpression,
                filter: filter$1119,
                blocks: blocks$1118,
                body: elements$1117[0]
            };
        }
        return delegate$723.createArrayExpression(elements$1117);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$777(options$1123) {
        var previousStrict$1124, previousYieldAllowed$1125, params$1126, defaults$1127, body$1128;
        previousStrict$1124 = strict$714;
        previousYieldAllowed$1125 = state$728.yieldAllowed;
        state$728.yieldAllowed = options$1123.generator;
        params$1126 = options$1123.params || [];
        defaults$1127 = options$1123.defaults || [];
        body$1128 = parseConciseBody$836();
        if (options$1123.name && strict$714 && isRestrictedWord$741(params$1126[0].name)) {
            throwErrorTolerant$765(options$1123.name, Messages$709.StrictParamName);
        }
        if (state$728.yieldAllowed && !state$728.yieldFound) {
            throwErrorTolerant$765({}, Messages$709.NoYieldInGenerator);
        }
        strict$714 = previousStrict$1124;
        state$728.yieldAllowed = previousYieldAllowed$1125;
        return delegate$723.createFunctionExpression(null, params$1126, defaults$1127, body$1128, options$1123.rest || null, options$1123.generator, body$1128.type !== Syntax$707.BlockStatement);
    }
    function parsePropertyMethodFunction$778(options$1129) {
        var previousStrict$1130, tmp$1131, method$1132;
        previousStrict$1130 = strict$714;
        strict$714 = true;
        tmp$1131 = parseParams$840();
        if (tmp$1131.stricted) {
            throwErrorTolerant$765(tmp$1131.stricted, tmp$1131.message);
        }
        method$1132 = parsePropertyFunction$777({
            params: tmp$1131.params,
            defaults: tmp$1131.defaults,
            rest: tmp$1131.rest,
            generator: options$1129.generator
        });
        strict$714 = previousStrict$1130;
        return method$1132;
    }
    function parseObjectPropertyKey$779() {
        var token$1133 = lex$760();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1133.type === Token$704.StringLiteral || token$1133.type === Token$704.NumericLiteral) {
            if (strict$714 && token$1133.octal) {
                throwErrorTolerant$765(token$1133, Messages$709.StrictOctalLiteral);
            }
            return delegate$723.createLiteral(token$1133);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$723.createIdentifier(token$1133.value);
    }
    function parseObjectProperty$780() {
        var token$1134, key$1135, id$1136, value$1137, param$1138;
        token$1134 = lookahead$726;
        if (token$1134.type === Token$704.Identifier) {
            id$1136 = parseObjectPropertyKey$779();
            // Property Assignment: Getter and Setter.
            if (token$1134.value === 'get' && !(match$769(':') || match$769('('))) {
                key$1135 = parseObjectPropertyKey$779();
                expect$767('(');
                expect$767(')');
                return delegate$723.createProperty('get', key$1135, parsePropertyFunction$777({ generator: false }), false, false);
            }
            if (token$1134.value === 'set' && !(match$769(':') || match$769('('))) {
                key$1135 = parseObjectPropertyKey$779();
                expect$767('(');
                token$1134 = lookahead$726;
                param$1138 = [parseVariableIdentifier$807()];
                expect$767(')');
                return delegate$723.createProperty('set', key$1135, parsePropertyFunction$777({
                    params: param$1138,
                    generator: false,
                    name: token$1134
                }), false, false);
            }
            if (match$769(':')) {
                lex$760();
                return delegate$723.createProperty('init', id$1136, parseAssignmentExpression$803(), false, false);
            }
            if (match$769('(')) {
                return delegate$723.createProperty('init', id$1136, parsePropertyMethodFunction$778({ generator: false }), true, false);
            }
            return delegate$723.createProperty('init', id$1136, id$1136, false, true);
        }
        if (token$1134.type === Token$704.EOF || token$1134.type === Token$704.Punctuator) {
            if (!match$769('*')) {
                throwUnexpected$766(token$1134);
            }
            lex$760();
            id$1136 = parseObjectPropertyKey$779();
            if (!match$769('(')) {
                throwUnexpected$766(lex$760());
            }
            return delegate$723.createProperty('init', id$1136, parsePropertyMethodFunction$778({ generator: true }), true, false);
        }
        key$1135 = parseObjectPropertyKey$779();
        if (match$769(':')) {
            lex$760();
            return delegate$723.createProperty('init', key$1135, parseAssignmentExpression$803(), false, false);
        }
        if (match$769('(')) {
            return delegate$723.createProperty('init', key$1135, parsePropertyMethodFunction$778({ generator: false }), true, false);
        }
        throwUnexpected$766(lex$760());
    }
    function parseObjectInitialiser$781() {
        var properties$1139 = [], property$1140, name$1141, key$1142, kind$1143, map$1144 = {}, toString$1145 = String;
        expect$767('{');
        while (!match$769('}')) {
            property$1140 = parseObjectProperty$780();
            if (property$1140.key.type === Syntax$707.Identifier) {
                name$1141 = property$1140.key.name;
            } else {
                name$1141 = toString$1145(property$1140.key.value);
            }
            kind$1143 = property$1140.kind === 'init' ? PropertyKind$708.Data : property$1140.kind === 'get' ? PropertyKind$708.Get : PropertyKind$708.Set;
            key$1142 = '$' + name$1141;
            if (Object.prototype.hasOwnProperty.call(map$1144, key$1142)) {
                if (map$1144[key$1142] === PropertyKind$708.Data) {
                    if (strict$714 && kind$1143 === PropertyKind$708.Data) {
                        throwErrorTolerant$765({}, Messages$709.StrictDuplicateProperty);
                    } else if (kind$1143 !== PropertyKind$708.Data) {
                        throwErrorTolerant$765({}, Messages$709.AccessorDataProperty);
                    }
                } else {
                    if (kind$1143 === PropertyKind$708.Data) {
                        throwErrorTolerant$765({}, Messages$709.AccessorDataProperty);
                    } else if (map$1144[key$1142] & kind$1143) {
                        throwErrorTolerant$765({}, Messages$709.AccessorGetSet);
                    }
                }
                map$1144[key$1142] |= kind$1143;
            } else {
                map$1144[key$1142] = kind$1143;
            }
            properties$1139.push(property$1140);
            if (!match$769('}')) {
                expect$767(',');
            }
        }
        expect$767('}');
        return delegate$723.createObjectExpression(properties$1139);
    }
    function parseTemplateElement$782(option$1146) {
        var token$1147 = scanTemplateElement$755(option$1146);
        if (strict$714 && token$1147.octal) {
            throwError$764(token$1147, Messages$709.StrictOctalLiteral);
        }
        return delegate$723.createTemplateElement({
            raw: token$1147.value.raw,
            cooked: token$1147.value.cooked
        }, token$1147.tail);
    }
    function parseTemplateLiteral$783() {
        var quasi$1148, quasis$1149, expressions$1150;
        quasi$1148 = parseTemplateElement$782({ head: true });
        quasis$1149 = [quasi$1148];
        expressions$1150 = [];
        while (!quasi$1148.tail) {
            expressions$1150.push(parseExpression$804());
            quasi$1148 = parseTemplateElement$782({ head: false });
            quasis$1149.push(quasi$1148);
        }
        return delegate$723.createTemplateLiteral(quasis$1149, expressions$1150);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$784() {
        var expr$1151;
        expect$767('(');
        ++state$728.parenthesizedCount;
        expr$1151 = parseExpression$804();
        expect$767(')');
        return expr$1151;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$785() {
        var type$1152, token$1153, resolvedIdent$1154;
        token$1153 = lookahead$726;
        type$1152 = lookahead$726.type;
        if (type$1152 === Token$704.Identifier) {
            resolvedIdent$1154 = expander$703.resolve(tokenStream$724[lookaheadIndex$727]);
            lex$760();
            return delegate$723.createIdentifier(resolvedIdent$1154);
        }
        if (type$1152 === Token$704.StringLiteral || type$1152 === Token$704.NumericLiteral) {
            if (strict$714 && lookahead$726.octal) {
                throwErrorTolerant$765(lookahead$726, Messages$709.StrictOctalLiteral);
            }
            return delegate$723.createLiteral(lex$760());
        }
        if (type$1152 === Token$704.Keyword) {
            if (matchKeyword$770('this')) {
                lex$760();
                return delegate$723.createThisExpression();
            }
            if (matchKeyword$770('function')) {
                return parseFunctionExpression$842();
            }
            if (matchKeyword$770('class')) {
                return parseClassExpression$847();
            }
            if (matchKeyword$770('super')) {
                lex$760();
                return delegate$723.createIdentifier('super');
            }
        }
        if (type$1152 === Token$704.BooleanLiteral) {
            token$1153 = lex$760();
            token$1153.value = token$1153.value === 'true';
            return delegate$723.createLiteral(token$1153);
        }
        if (type$1152 === Token$704.NullLiteral) {
            token$1153 = lex$760();
            token$1153.value = null;
            return delegate$723.createLiteral(token$1153);
        }
        if (match$769('[')) {
            return parseArrayInitialiser$776();
        }
        if (match$769('{')) {
            return parseObjectInitialiser$781();
        }
        if (match$769('(')) {
            return parseGroupExpression$784();
        }
        if (lookahead$726.type === Token$704.RegularExpression) {
            return delegate$723.createLiteral(lex$760());
        }
        if (type$1152 === Token$704.Template) {
            return parseTemplateLiteral$783();
        }
        return throwUnexpected$766(lex$760());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$786() {
        var args$1155 = [], arg$1156;
        expect$767('(');
        if (!match$769(')')) {
            while (streamIndex$725 < length$722) {
                arg$1156 = parseSpreadOrAssignmentExpression$787();
                args$1155.push(arg$1156);
                if (match$769(')')) {
                    break;
                } else if (arg$1156.type === Syntax$707.SpreadElement) {
                    throwError$764({}, Messages$709.ElementAfterSpreadElement);
                }
                expect$767(',');
            }
        }
        expect$767(')');
        return args$1155;
    }
    function parseSpreadOrAssignmentExpression$787() {
        if (match$769('...')) {
            lex$760();
            return delegate$723.createSpreadElement(parseAssignmentExpression$803());
        }
        return parseAssignmentExpression$803();
    }
    function parseNonComputedProperty$788() {
        var token$1157 = lex$760();
        if (!isIdentifierName$757(token$1157)) {
            throwUnexpected$766(token$1157);
        }
        return delegate$723.createIdentifier(token$1157.value);
    }
    function parseNonComputedMember$789() {
        expect$767('.');
        return parseNonComputedProperty$788();
    }
    function parseComputedMember$790() {
        var expr$1158;
        expect$767('[');
        expr$1158 = parseExpression$804();
        expect$767(']');
        return expr$1158;
    }
    function parseNewExpression$791() {
        var callee$1159, args$1160;
        expectKeyword$768('new');
        callee$1159 = parseLeftHandSideExpression$793();
        args$1160 = match$769('(') ? parseArguments$786() : [];
        return delegate$723.createNewExpression(callee$1159, args$1160);
    }
    function parseLeftHandSideExpressionAllowCall$792() {
        var expr$1161, args$1162, property$1163;
        expr$1161 = matchKeyword$770('new') ? parseNewExpression$791() : parsePrimaryExpression$785();
        while (match$769('.') || match$769('[') || match$769('(') || lookahead$726.type === Token$704.Template) {
            if (match$769('(')) {
                args$1162 = parseArguments$786();
                expr$1161 = delegate$723.createCallExpression(expr$1161, args$1162);
            } else if (match$769('[')) {
                expr$1161 = delegate$723.createMemberExpression('[', expr$1161, parseComputedMember$790());
            } else if (match$769('.')) {
                expr$1161 = delegate$723.createMemberExpression('.', expr$1161, parseNonComputedMember$789());
            } else {
                expr$1161 = delegate$723.createTaggedTemplateExpression(expr$1161, parseTemplateLiteral$783());
            }
        }
        return expr$1161;
    }
    function parseLeftHandSideExpression$793() {
        var expr$1164, property$1165;
        expr$1164 = matchKeyword$770('new') ? parseNewExpression$791() : parsePrimaryExpression$785();
        while (match$769('.') || match$769('[') || lookahead$726.type === Token$704.Template) {
            if (match$769('[')) {
                expr$1164 = delegate$723.createMemberExpression('[', expr$1164, parseComputedMember$790());
            } else if (match$769('.')) {
                expr$1164 = delegate$723.createMemberExpression('.', expr$1164, parseNonComputedMember$789());
            } else {
                expr$1164 = delegate$723.createTaggedTemplateExpression(expr$1164, parseTemplateLiteral$783());
            }
        }
        return expr$1164;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$794() {
        var expr$1166 = parseLeftHandSideExpressionAllowCall$792(), token$1167 = lookahead$726;
        if (lookahead$726.type !== Token$704.Punctuator) {
            return expr$1166;
        }
        if ((match$769('++') || match$769('--')) && !peekLineTerminator$763()) {
            // 11.3.1, 11.3.2
            if (strict$714 && expr$1166.type === Syntax$707.Identifier && isRestrictedWord$741(expr$1166.name)) {
                throwErrorTolerant$765({}, Messages$709.StrictLHSPostfix);
            }
            if (!isLeftHandSide$774(expr$1166)) {
                throwError$764({}, Messages$709.InvalidLHSInAssignment);
            }
            token$1167 = lex$760();
            expr$1166 = delegate$723.createPostfixExpression(token$1167.value, expr$1166);
        }
        return expr$1166;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$795() {
        var token$1168, expr$1169;
        if (lookahead$726.type !== Token$704.Punctuator && lookahead$726.type !== Token$704.Keyword) {
            return parsePostfixExpression$794();
        }
        if (match$769('++') || match$769('--')) {
            token$1168 = lex$760();
            expr$1169 = parseUnaryExpression$795();
            // 11.4.4, 11.4.5
            if (strict$714 && expr$1169.type === Syntax$707.Identifier && isRestrictedWord$741(expr$1169.name)) {
                throwErrorTolerant$765({}, Messages$709.StrictLHSPrefix);
            }
            if (!isLeftHandSide$774(expr$1169)) {
                throwError$764({}, Messages$709.InvalidLHSInAssignment);
            }
            return delegate$723.createUnaryExpression(token$1168.value, expr$1169);
        }
        if (match$769('+') || match$769('-') || match$769('~') || match$769('!')) {
            token$1168 = lex$760();
            expr$1169 = parseUnaryExpression$795();
            return delegate$723.createUnaryExpression(token$1168.value, expr$1169);
        }
        if (matchKeyword$770('delete') || matchKeyword$770('void') || matchKeyword$770('typeof')) {
            token$1168 = lex$760();
            expr$1169 = parseUnaryExpression$795();
            expr$1169 = delegate$723.createUnaryExpression(token$1168.value, expr$1169);
            if (strict$714 && expr$1169.operator === 'delete' && expr$1169.argument.type === Syntax$707.Identifier) {
                throwErrorTolerant$765({}, Messages$709.StrictDelete);
            }
            return expr$1169;
        }
        return parsePostfixExpression$794();
    }
    function binaryPrecedence$796(token$1170, allowIn$1171) {
        var prec$1172 = 0;
        if (token$1170.type !== Token$704.Punctuator && token$1170.type !== Token$704.Keyword) {
            return 0;
        }
        switch (token$1170.value) {
        case '||':
            prec$1172 = 1;
            break;
        case '&&':
            prec$1172 = 2;
            break;
        case '|':
            prec$1172 = 3;
            break;
        case '^':
            prec$1172 = 4;
            break;
        case '&':
            prec$1172 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1172 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1172 = 7;
            break;
        case 'in':
            prec$1172 = allowIn$1171 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1172 = 8;
            break;
        case '+':
        case '-':
            prec$1172 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1172 = 11;
            break;
        default:
            break;
        }
        return prec$1172;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$797() {
        var expr$1173, token$1174, prec$1175, previousAllowIn$1176, stack$1177, right$1178, operator$1179, left$1180, i$1181;
        previousAllowIn$1176 = state$728.allowIn;
        state$728.allowIn = true;
        expr$1173 = parseUnaryExpression$795();
        token$1174 = lookahead$726;
        prec$1175 = binaryPrecedence$796(token$1174, previousAllowIn$1176);
        if (prec$1175 === 0) {
            return expr$1173;
        }
        token$1174.prec = prec$1175;
        lex$760();
        stack$1177 = [
            expr$1173,
            token$1174,
            parseUnaryExpression$795()
        ];
        while ((prec$1175 = binaryPrecedence$796(lookahead$726, previousAllowIn$1176)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1177.length > 2 && prec$1175 <= stack$1177[stack$1177.length - 2].prec) {
                right$1178 = stack$1177.pop();
                operator$1179 = stack$1177.pop().value;
                left$1180 = stack$1177.pop();
                stack$1177.push(delegate$723.createBinaryExpression(operator$1179, left$1180, right$1178));
            }
            // Shift.
            token$1174 = lex$760();
            token$1174.prec = prec$1175;
            stack$1177.push(token$1174);
            stack$1177.push(parseUnaryExpression$795());
        }
        state$728.allowIn = previousAllowIn$1176;
        // Final reduce to clean-up the stack.
        i$1181 = stack$1177.length - 1;
        expr$1173 = stack$1177[i$1181];
        while (i$1181 > 1) {
            expr$1173 = delegate$723.createBinaryExpression(stack$1177[i$1181 - 1].value, stack$1177[i$1181 - 2], expr$1173);
            i$1181 -= 2;
        }
        return expr$1173;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$798() {
        var expr$1182, previousAllowIn$1183, consequent$1184, alternate$1185;
        expr$1182 = parseBinaryExpression$797();
        if (match$769('?')) {
            lex$760();
            previousAllowIn$1183 = state$728.allowIn;
            state$728.allowIn = true;
            consequent$1184 = parseAssignmentExpression$803();
            state$728.allowIn = previousAllowIn$1183;
            expect$767(':');
            alternate$1185 = parseAssignmentExpression$803();
            expr$1182 = delegate$723.createConditionalExpression(expr$1182, consequent$1184, alternate$1185);
        }
        return expr$1182;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$799(expr$1186) {
        var i$1187, len$1188, property$1189, element$1190;
        if (expr$1186.type === Syntax$707.ObjectExpression) {
            expr$1186.type = Syntax$707.ObjectPattern;
            for (i$1187 = 0, len$1188 = expr$1186.properties.length; i$1187 < len$1188; i$1187 += 1) {
                property$1189 = expr$1186.properties[i$1187];
                if (property$1189.kind !== 'init') {
                    throwError$764({}, Messages$709.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$799(property$1189.value);
            }
        } else if (expr$1186.type === Syntax$707.ArrayExpression) {
            expr$1186.type = Syntax$707.ArrayPattern;
            for (i$1187 = 0, len$1188 = expr$1186.elements.length; i$1187 < len$1188; i$1187 += 1) {
                element$1190 = expr$1186.elements[i$1187];
                if (element$1190) {
                    reinterpretAsAssignmentBindingPattern$799(element$1190);
                }
            }
        } else if (expr$1186.type === Syntax$707.Identifier) {
            if (isRestrictedWord$741(expr$1186.name)) {
                throwError$764({}, Messages$709.InvalidLHSInAssignment);
            }
        } else if (expr$1186.type === Syntax$707.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$799(expr$1186.argument);
            if (expr$1186.argument.type === Syntax$707.ObjectPattern) {
                throwError$764({}, Messages$709.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1186.type !== Syntax$707.MemberExpression && expr$1186.type !== Syntax$707.CallExpression && expr$1186.type !== Syntax$707.NewExpression) {
                throwError$764({}, Messages$709.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$800(options$1191, expr$1192) {
        var i$1193, len$1194, property$1195, element$1196;
        if (expr$1192.type === Syntax$707.ObjectExpression) {
            expr$1192.type = Syntax$707.ObjectPattern;
            for (i$1193 = 0, len$1194 = expr$1192.properties.length; i$1193 < len$1194; i$1193 += 1) {
                property$1195 = expr$1192.properties[i$1193];
                if (property$1195.kind !== 'init') {
                    throwError$764({}, Messages$709.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$800(options$1191, property$1195.value);
            }
        } else if (expr$1192.type === Syntax$707.ArrayExpression) {
            expr$1192.type = Syntax$707.ArrayPattern;
            for (i$1193 = 0, len$1194 = expr$1192.elements.length; i$1193 < len$1194; i$1193 += 1) {
                element$1196 = expr$1192.elements[i$1193];
                if (element$1196) {
                    reinterpretAsDestructuredParameter$800(options$1191, element$1196);
                }
            }
        } else if (expr$1192.type === Syntax$707.Identifier) {
            validateParam$838(options$1191, expr$1192, expr$1192.name);
        } else {
            if (expr$1192.type !== Syntax$707.MemberExpression) {
                throwError$764({}, Messages$709.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$801(expressions$1197) {
        var i$1198, len$1199, param$1200, params$1201, defaults$1202, defaultCount$1203, options$1204, rest$1205;
        params$1201 = [];
        defaults$1202 = [];
        defaultCount$1203 = 0;
        rest$1205 = null;
        options$1204 = { paramSet: {} };
        for (i$1198 = 0, len$1199 = expressions$1197.length; i$1198 < len$1199; i$1198 += 1) {
            param$1200 = expressions$1197[i$1198];
            if (param$1200.type === Syntax$707.Identifier) {
                params$1201.push(param$1200);
                defaults$1202.push(null);
                validateParam$838(options$1204, param$1200, param$1200.name);
            } else if (param$1200.type === Syntax$707.ObjectExpression || param$1200.type === Syntax$707.ArrayExpression) {
                reinterpretAsDestructuredParameter$800(options$1204, param$1200);
                params$1201.push(param$1200);
                defaults$1202.push(null);
            } else if (param$1200.type === Syntax$707.SpreadElement) {
                assert$730(i$1198 === len$1199 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$800(options$1204, param$1200.argument);
                rest$1205 = param$1200.argument;
            } else if (param$1200.type === Syntax$707.AssignmentExpression) {
                params$1201.push(param$1200.left);
                defaults$1202.push(param$1200.right);
                ++defaultCount$1203;
                validateParam$838(options$1204, param$1200.left, param$1200.left.name);
            } else {
                return null;
            }
        }
        if (options$1204.message === Messages$709.StrictParamDupe) {
            throwError$764(strict$714 ? options$1204.stricted : options$1204.firstRestricted, options$1204.message);
        }
        if (defaultCount$1203 === 0) {
            defaults$1202 = [];
        }
        return {
            params: params$1201,
            defaults: defaults$1202,
            rest: rest$1205,
            stricted: options$1204.stricted,
            firstRestricted: options$1204.firstRestricted,
            message: options$1204.message
        };
    }
    function parseArrowFunctionExpression$802(options$1206) {
        var previousStrict$1207, previousYieldAllowed$1208, body$1209;
        expect$767('=>');
        previousStrict$1207 = strict$714;
        previousYieldAllowed$1208 = state$728.yieldAllowed;
        state$728.yieldAllowed = false;
        body$1209 = parseConciseBody$836();
        if (strict$714 && options$1206.firstRestricted) {
            throwError$764(options$1206.firstRestricted, options$1206.message);
        }
        if (strict$714 && options$1206.stricted) {
            throwErrorTolerant$765(options$1206.stricted, options$1206.message);
        }
        strict$714 = previousStrict$1207;
        state$728.yieldAllowed = previousYieldAllowed$1208;
        return delegate$723.createArrowFunctionExpression(options$1206.params, options$1206.defaults, body$1209, options$1206.rest, body$1209.type !== Syntax$707.BlockStatement);
    }
    function parseAssignmentExpression$803() {
        var expr$1210, token$1211, params$1212, oldParenthesizedCount$1213;
        if (matchKeyword$770('yield')) {
            return parseYieldExpression$843();
        }
        oldParenthesizedCount$1213 = state$728.parenthesizedCount;
        if (match$769('(')) {
            token$1211 = lookahead2$762();
            if (token$1211.type === Token$704.Punctuator && token$1211.value === ')' || token$1211.value === '...') {
                params$1212 = parseParams$840();
                if (!match$769('=>')) {
                    throwUnexpected$766(lex$760());
                }
                return parseArrowFunctionExpression$802(params$1212);
            }
        }
        token$1211 = lookahead$726;
        expr$1210 = parseConditionalExpression$798();
        if (match$769('=>') && (state$728.parenthesizedCount === oldParenthesizedCount$1213 || state$728.parenthesizedCount === oldParenthesizedCount$1213 + 1)) {
            if (expr$1210.type === Syntax$707.Identifier) {
                params$1212 = reinterpretAsCoverFormalsList$801([expr$1210]);
            } else if (expr$1210.type === Syntax$707.SequenceExpression) {
                params$1212 = reinterpretAsCoverFormalsList$801(expr$1210.expressions);
            }
            if (params$1212) {
                return parseArrowFunctionExpression$802(params$1212);
            }
        }
        if (matchAssign$772()) {
            // 11.13.1
            if (strict$714 && expr$1210.type === Syntax$707.Identifier && isRestrictedWord$741(expr$1210.name)) {
                throwErrorTolerant$765(token$1211, Messages$709.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$769('=') && (expr$1210.type === Syntax$707.ObjectExpression || expr$1210.type === Syntax$707.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$799(expr$1210);
            } else if (!isLeftHandSide$774(expr$1210)) {
                throwError$764({}, Messages$709.InvalidLHSInAssignment);
            }
            expr$1210 = delegate$723.createAssignmentExpression(lex$760().value, expr$1210, parseAssignmentExpression$803());
        }
        return expr$1210;
    }
    // 11.14 Comma Operator
    function parseExpression$804() {
        var expr$1214, expressions$1215, sequence$1216, coverFormalsList$1217, spreadFound$1218, oldParenthesizedCount$1219;
        oldParenthesizedCount$1219 = state$728.parenthesizedCount;
        expr$1214 = parseAssignmentExpression$803();
        expressions$1215 = [expr$1214];
        if (match$769(',')) {
            while (streamIndex$725 < length$722) {
                if (!match$769(',')) {
                    break;
                }
                lex$760();
                expr$1214 = parseSpreadOrAssignmentExpression$787();
                expressions$1215.push(expr$1214);
                if (expr$1214.type === Syntax$707.SpreadElement) {
                    spreadFound$1218 = true;
                    if (!match$769(')')) {
                        throwError$764({}, Messages$709.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1216 = delegate$723.createSequenceExpression(expressions$1215);
        }
        if (match$769('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$728.parenthesizedCount === oldParenthesizedCount$1219 || state$728.parenthesizedCount === oldParenthesizedCount$1219 + 1) {
                expr$1214 = expr$1214.type === Syntax$707.SequenceExpression ? expr$1214.expressions : expressions$1215;
                coverFormalsList$1217 = reinterpretAsCoverFormalsList$801(expr$1214);
                if (coverFormalsList$1217) {
                    return parseArrowFunctionExpression$802(coverFormalsList$1217);
                }
            }
            throwUnexpected$766(lex$760());
        }
        if (spreadFound$1218 && lookahead2$762().value !== '=>') {
            throwError$764({}, Messages$709.IllegalSpread);
        }
        return sequence$1216 || expr$1214;
    }
    // 12.1 Block
    function parseStatementList$805() {
        var list$1220 = [], statement$1221;
        while (streamIndex$725 < length$722) {
            if (match$769('}')) {
                break;
            }
            statement$1221 = parseSourceElement$850();
            if (typeof statement$1221 === 'undefined') {
                break;
            }
            list$1220.push(statement$1221);
        }
        return list$1220;
    }
    function parseBlock$806() {
        var block$1222;
        expect$767('{');
        block$1222 = parseStatementList$805();
        expect$767('}');
        return delegate$723.createBlockStatement(block$1222);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$807() {
        var token$1223 = lookahead$726, resolvedIdent$1224;
        if (token$1223.type !== Token$704.Identifier) {
            throwUnexpected$766(token$1223);
        }
        resolvedIdent$1224 = expander$703.resolve(tokenStream$724[lookaheadIndex$727]);
        lex$760();
        return delegate$723.createIdentifier(resolvedIdent$1224);
    }
    function parseVariableDeclaration$808(kind$1225) {
        var id$1226, init$1227 = null;
        if (match$769('{')) {
            id$1226 = parseObjectInitialiser$781();
            reinterpretAsAssignmentBindingPattern$799(id$1226);
        } else if (match$769('[')) {
            id$1226 = parseArrayInitialiser$776();
            reinterpretAsAssignmentBindingPattern$799(id$1226);
        } else {
            id$1226 = state$728.allowKeyword ? parseNonComputedProperty$788() : parseVariableIdentifier$807();
            // 12.2.1
            if (strict$714 && isRestrictedWord$741(id$1226.name)) {
                throwErrorTolerant$765({}, Messages$709.StrictVarName);
            }
        }
        if (kind$1225 === 'const') {
            if (!match$769('=')) {
                throwError$764({}, Messages$709.NoUnintializedConst);
            }
            expect$767('=');
            init$1227 = parseAssignmentExpression$803();
        } else if (match$769('=')) {
            lex$760();
            init$1227 = parseAssignmentExpression$803();
        }
        return delegate$723.createVariableDeclarator(id$1226, init$1227);
    }
    function parseVariableDeclarationList$809(kind$1228) {
        var list$1229 = [];
        do {
            list$1229.push(parseVariableDeclaration$808(kind$1228));
            if (!match$769(',')) {
                break;
            }
            lex$760();
        } while (streamIndex$725 < length$722);
        return list$1229;
    }
    function parseVariableStatement$810() {
        var declarations$1230;
        expectKeyword$768('var');
        declarations$1230 = parseVariableDeclarationList$809();
        consumeSemicolon$773();
        return delegate$723.createVariableDeclaration(declarations$1230, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$811(kind$1231) {
        var declarations$1232;
        expectKeyword$768(kind$1231);
        declarations$1232 = parseVariableDeclarationList$809(kind$1231);
        consumeSemicolon$773();
        return delegate$723.createVariableDeclaration(declarations$1232, kind$1231);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$812() {
        var id$1233, src$1234, body$1235;
        lex$760();
        // 'module'
        if (peekLineTerminator$763()) {
            throwError$764({}, Messages$709.NewlineAfterModule);
        }
        switch (lookahead$726.type) {
        case Token$704.StringLiteral:
            id$1233 = parsePrimaryExpression$785();
            body$1235 = parseModuleBlock$855();
            src$1234 = null;
            break;
        case Token$704.Identifier:
            id$1233 = parseVariableIdentifier$807();
            body$1235 = null;
            if (!matchContextualKeyword$771('from')) {
                throwUnexpected$766(lex$760());
            }
            lex$760();
            src$1234 = parsePrimaryExpression$785();
            if (src$1234.type !== Syntax$707.Literal) {
                throwError$764({}, Messages$709.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$773();
        return delegate$723.createModuleDeclaration(id$1233, src$1234, body$1235);
    }
    function parseExportBatchSpecifier$813() {
        expect$767('*');
        return delegate$723.createExportBatchSpecifier();
    }
    function parseExportSpecifier$814() {
        var id$1236, name$1237 = null;
        id$1236 = parseVariableIdentifier$807();
        if (matchContextualKeyword$771('as')) {
            lex$760();
            name$1237 = parseNonComputedProperty$788();
        }
        return delegate$723.createExportSpecifier(id$1236, name$1237);
    }
    function parseExportDeclaration$815() {
        var previousAllowKeyword$1238, decl$1239, def$1240, src$1241, specifiers$1242;
        expectKeyword$768('export');
        if (lookahead$726.type === Token$704.Keyword) {
            switch (lookahead$726.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$723.createExportDeclaration(parseSourceElement$850(), null, null);
            }
        }
        if (isIdentifierName$757(lookahead$726)) {
            previousAllowKeyword$1238 = state$728.allowKeyword;
            state$728.allowKeyword = true;
            decl$1239 = parseVariableDeclarationList$809('let');
            state$728.allowKeyword = previousAllowKeyword$1238;
            return delegate$723.createExportDeclaration(decl$1239, null, null);
        }
        specifiers$1242 = [];
        src$1241 = null;
        if (match$769('*')) {
            specifiers$1242.push(parseExportBatchSpecifier$813());
        } else {
            expect$767('{');
            do {
                specifiers$1242.push(parseExportSpecifier$814());
            } while (match$769(',') && lex$760());
            expect$767('}');
        }
        if (matchContextualKeyword$771('from')) {
            lex$760();
            src$1241 = parsePrimaryExpression$785();
            if (src$1241.type !== Syntax$707.Literal) {
                throwError$764({}, Messages$709.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$773();
        return delegate$723.createExportDeclaration(null, specifiers$1242, src$1241);
    }
    function parseImportDeclaration$816() {
        var specifiers$1243, kind$1244, src$1245;
        expectKeyword$768('import');
        specifiers$1243 = [];
        if (isIdentifierName$757(lookahead$726)) {
            kind$1244 = 'default';
            specifiers$1243.push(parseImportSpecifier$817());
            if (!matchContextualKeyword$771('from')) {
                throwError$764({}, Messages$709.NoFromAfterImport);
            }
            lex$760();
        } else if (match$769('{')) {
            kind$1244 = 'named';
            lex$760();
            do {
                specifiers$1243.push(parseImportSpecifier$817());
            } while (match$769(',') && lex$760());
            expect$767('}');
            if (!matchContextualKeyword$771('from')) {
                throwError$764({}, Messages$709.NoFromAfterImport);
            }
            lex$760();
        }
        src$1245 = parsePrimaryExpression$785();
        if (src$1245.type !== Syntax$707.Literal) {
            throwError$764({}, Messages$709.InvalidModuleSpecifier);
        }
        consumeSemicolon$773();
        return delegate$723.createImportDeclaration(specifiers$1243, kind$1244, src$1245);
    }
    function parseImportSpecifier$817() {
        var id$1246, name$1247 = null;
        id$1246 = parseNonComputedProperty$788();
        if (matchContextualKeyword$771('as')) {
            lex$760();
            name$1247 = parseVariableIdentifier$807();
        }
        return delegate$723.createImportSpecifier(id$1246, name$1247);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$818() {
        expect$767(';');
        return delegate$723.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$819() {
        var expr$1248 = parseExpression$804();
        consumeSemicolon$773();
        return delegate$723.createExpressionStatement(expr$1248);
    }
    // 12.5 If statement
    function parseIfStatement$820() {
        var test$1249, consequent$1250, alternate$1251;
        expectKeyword$768('if');
        expect$767('(');
        test$1249 = parseExpression$804();
        expect$767(')');
        consequent$1250 = parseStatement$835();
        if (matchKeyword$770('else')) {
            lex$760();
            alternate$1251 = parseStatement$835();
        } else {
            alternate$1251 = null;
        }
        return delegate$723.createIfStatement(test$1249, consequent$1250, alternate$1251);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$821() {
        var body$1252, test$1253, oldInIteration$1254;
        expectKeyword$768('do');
        oldInIteration$1254 = state$728.inIteration;
        state$728.inIteration = true;
        body$1252 = parseStatement$835();
        state$728.inIteration = oldInIteration$1254;
        expectKeyword$768('while');
        expect$767('(');
        test$1253 = parseExpression$804();
        expect$767(')');
        if (match$769(';')) {
            lex$760();
        }
        return delegate$723.createDoWhileStatement(body$1252, test$1253);
    }
    function parseWhileStatement$822() {
        var test$1255, body$1256, oldInIteration$1257;
        expectKeyword$768('while');
        expect$767('(');
        test$1255 = parseExpression$804();
        expect$767(')');
        oldInIteration$1257 = state$728.inIteration;
        state$728.inIteration = true;
        body$1256 = parseStatement$835();
        state$728.inIteration = oldInIteration$1257;
        return delegate$723.createWhileStatement(test$1255, body$1256);
    }
    function parseForVariableDeclaration$823() {
        var token$1258 = lex$760(), declarations$1259 = parseVariableDeclarationList$809();
        return delegate$723.createVariableDeclaration(declarations$1259, token$1258.value);
    }
    function parseForStatement$824(opts$1260) {
        var init$1261, test$1262, update$1263, left$1264, right$1265, body$1266, operator$1267, oldInIteration$1268;
        init$1261 = test$1262 = update$1263 = null;
        expectKeyword$768('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$771('each')) {
            throwError$764({}, Messages$709.EachNotAllowed);
        }
        expect$767('(');
        if (match$769(';')) {
            lex$760();
        } else {
            if (matchKeyword$770('var') || matchKeyword$770('let') || matchKeyword$770('const')) {
                state$728.allowIn = false;
                init$1261 = parseForVariableDeclaration$823();
                state$728.allowIn = true;
                if (init$1261.declarations.length === 1) {
                    if (matchKeyword$770('in') || matchContextualKeyword$771('of')) {
                        operator$1267 = lookahead$726;
                        if (!((operator$1267.value === 'in' || init$1261.kind !== 'var') && init$1261.declarations[0].init)) {
                            lex$760();
                            left$1264 = init$1261;
                            right$1265 = parseExpression$804();
                            init$1261 = null;
                        }
                    }
                }
            } else {
                state$728.allowIn = false;
                init$1261 = parseExpression$804();
                state$728.allowIn = true;
                if (matchContextualKeyword$771('of')) {
                    operator$1267 = lex$760();
                    left$1264 = init$1261;
                    right$1265 = parseExpression$804();
                    init$1261 = null;
                } else if (matchKeyword$770('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$775(init$1261)) {
                        throwError$764({}, Messages$709.InvalidLHSInForIn);
                    }
                    operator$1267 = lex$760();
                    left$1264 = init$1261;
                    right$1265 = parseExpression$804();
                    init$1261 = null;
                }
            }
            if (typeof left$1264 === 'undefined') {
                expect$767(';');
            }
        }
        if (typeof left$1264 === 'undefined') {
            if (!match$769(';')) {
                test$1262 = parseExpression$804();
            }
            expect$767(';');
            if (!match$769(')')) {
                update$1263 = parseExpression$804();
            }
        }
        expect$767(')');
        oldInIteration$1268 = state$728.inIteration;
        state$728.inIteration = true;
        if (!(opts$1260 !== undefined && opts$1260.ignoreBody)) {
            body$1266 = parseStatement$835();
        }
        state$728.inIteration = oldInIteration$1268;
        if (typeof left$1264 === 'undefined') {
            return delegate$723.createForStatement(init$1261, test$1262, update$1263, body$1266);
        }
        if (operator$1267.value === 'in') {
            return delegate$723.createForInStatement(left$1264, right$1265, body$1266);
        }
        return delegate$723.createForOfStatement(left$1264, right$1265, body$1266);
    }
    // 12.7 The continue statement
    function parseContinueStatement$825() {
        var label$1269 = null, key$1270;
        expectKeyword$768('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$726.value.charCodeAt(0) === 59) {
            lex$760();
            if (!state$728.inIteration) {
                throwError$764({}, Messages$709.IllegalContinue);
            }
            return delegate$723.createContinueStatement(null);
        }
        if (peekLineTerminator$763()) {
            if (!state$728.inIteration) {
                throwError$764({}, Messages$709.IllegalContinue);
            }
            return delegate$723.createContinueStatement(null);
        }
        if (lookahead$726.type === Token$704.Identifier) {
            label$1269 = parseVariableIdentifier$807();
            key$1270 = '$' + label$1269.name;
            if (!Object.prototype.hasOwnProperty.call(state$728.labelSet, key$1270)) {
                throwError$764({}, Messages$709.UnknownLabel, label$1269.name);
            }
        }
        consumeSemicolon$773();
        if (label$1269 === null && !state$728.inIteration) {
            throwError$764({}, Messages$709.IllegalContinue);
        }
        return delegate$723.createContinueStatement(label$1269);
    }
    // 12.8 The break statement
    function parseBreakStatement$826() {
        var label$1271 = null, key$1272;
        expectKeyword$768('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$726.value.charCodeAt(0) === 59) {
            lex$760();
            if (!(state$728.inIteration || state$728.inSwitch)) {
                throwError$764({}, Messages$709.IllegalBreak);
            }
            return delegate$723.createBreakStatement(null);
        }
        if (peekLineTerminator$763()) {
            if (!(state$728.inIteration || state$728.inSwitch)) {
                throwError$764({}, Messages$709.IllegalBreak);
            }
            return delegate$723.createBreakStatement(null);
        }
        if (lookahead$726.type === Token$704.Identifier) {
            label$1271 = parseVariableIdentifier$807();
            key$1272 = '$' + label$1271.name;
            if (!Object.prototype.hasOwnProperty.call(state$728.labelSet, key$1272)) {
                throwError$764({}, Messages$709.UnknownLabel, label$1271.name);
            }
        }
        consumeSemicolon$773();
        if (label$1271 === null && !(state$728.inIteration || state$728.inSwitch)) {
            throwError$764({}, Messages$709.IllegalBreak);
        }
        return delegate$723.createBreakStatement(label$1271);
    }
    // 12.9 The return statement
    function parseReturnStatement$827() {
        var argument$1273 = null;
        expectKeyword$768('return');
        if (!state$728.inFunctionBody) {
            throwErrorTolerant$765({}, Messages$709.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$737(String(lookahead$726.value).charCodeAt(0))) {
            argument$1273 = parseExpression$804();
            consumeSemicolon$773();
            return delegate$723.createReturnStatement(argument$1273);
        }
        if (peekLineTerminator$763()) {
            return delegate$723.createReturnStatement(null);
        }
        if (!match$769(';')) {
            if (!match$769('}') && lookahead$726.type !== Token$704.EOF) {
                argument$1273 = parseExpression$804();
            }
        }
        consumeSemicolon$773();
        return delegate$723.createReturnStatement(argument$1273);
    }
    // 12.10 The with statement
    function parseWithStatement$828() {
        var object$1274, body$1275;
        if (strict$714) {
            throwErrorTolerant$765({}, Messages$709.StrictModeWith);
        }
        expectKeyword$768('with');
        expect$767('(');
        object$1274 = parseExpression$804();
        expect$767(')');
        body$1275 = parseStatement$835();
        return delegate$723.createWithStatement(object$1274, body$1275);
    }
    // 12.10 The swith statement
    function parseSwitchCase$829() {
        var test$1276, consequent$1277 = [], sourceElement$1278;
        if (matchKeyword$770('default')) {
            lex$760();
            test$1276 = null;
        } else {
            expectKeyword$768('case');
            test$1276 = parseExpression$804();
        }
        expect$767(':');
        while (streamIndex$725 < length$722) {
            if (match$769('}') || matchKeyword$770('default') || matchKeyword$770('case')) {
                break;
            }
            sourceElement$1278 = parseSourceElement$850();
            if (typeof sourceElement$1278 === 'undefined') {
                break;
            }
            consequent$1277.push(sourceElement$1278);
        }
        return delegate$723.createSwitchCase(test$1276, consequent$1277);
    }
    function parseSwitchStatement$830() {
        var discriminant$1279, cases$1280, clause$1281, oldInSwitch$1282, defaultFound$1283;
        expectKeyword$768('switch');
        expect$767('(');
        discriminant$1279 = parseExpression$804();
        expect$767(')');
        expect$767('{');
        cases$1280 = [];
        if (match$769('}')) {
            lex$760();
            return delegate$723.createSwitchStatement(discriminant$1279, cases$1280);
        }
        oldInSwitch$1282 = state$728.inSwitch;
        state$728.inSwitch = true;
        defaultFound$1283 = false;
        while (streamIndex$725 < length$722) {
            if (match$769('}')) {
                break;
            }
            clause$1281 = parseSwitchCase$829();
            if (clause$1281.test === null) {
                if (defaultFound$1283) {
                    throwError$764({}, Messages$709.MultipleDefaultsInSwitch);
                }
                defaultFound$1283 = true;
            }
            cases$1280.push(clause$1281);
        }
        state$728.inSwitch = oldInSwitch$1282;
        expect$767('}');
        return delegate$723.createSwitchStatement(discriminant$1279, cases$1280);
    }
    // 12.13 The throw statement
    function parseThrowStatement$831() {
        var argument$1284;
        expectKeyword$768('throw');
        if (peekLineTerminator$763()) {
            throwError$764({}, Messages$709.NewlineAfterThrow);
        }
        argument$1284 = parseExpression$804();
        consumeSemicolon$773();
        return delegate$723.createThrowStatement(argument$1284);
    }
    // 12.14 The try statement
    function parseCatchClause$832() {
        var param$1285, body$1286;
        expectKeyword$768('catch');
        expect$767('(');
        if (match$769(')')) {
            throwUnexpected$766(lookahead$726);
        }
        param$1285 = parseExpression$804();
        // 12.14.1
        if (strict$714 && param$1285.type === Syntax$707.Identifier && isRestrictedWord$741(param$1285.name)) {
            throwErrorTolerant$765({}, Messages$709.StrictCatchVariable);
        }
        expect$767(')');
        body$1286 = parseBlock$806();
        return delegate$723.createCatchClause(param$1285, body$1286);
    }
    function parseTryStatement$833() {
        var block$1287, handlers$1288 = [], finalizer$1289 = null;
        expectKeyword$768('try');
        block$1287 = parseBlock$806();
        if (matchKeyword$770('catch')) {
            handlers$1288.push(parseCatchClause$832());
        }
        if (matchKeyword$770('finally')) {
            lex$760();
            finalizer$1289 = parseBlock$806();
        }
        if (handlers$1288.length === 0 && !finalizer$1289) {
            throwError$764({}, Messages$709.NoCatchOrFinally);
        }
        return delegate$723.createTryStatement(block$1287, [], handlers$1288, finalizer$1289);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$834() {
        expectKeyword$768('debugger');
        consumeSemicolon$773();
        return delegate$723.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$835() {
        var type$1290 = lookahead$726.type, expr$1291, labeledBody$1292, key$1293;
        if (type$1290 === Token$704.EOF) {
            throwUnexpected$766(lookahead$726);
        }
        if (type$1290 === Token$704.Punctuator) {
            switch (lookahead$726.value) {
            case ';':
                return parseEmptyStatement$818();
            case '{':
                return parseBlock$806();
            case '(':
                return parseExpressionStatement$819();
            default:
                break;
            }
        }
        if (type$1290 === Token$704.Keyword) {
            switch (lookahead$726.value) {
            case 'break':
                return parseBreakStatement$826();
            case 'continue':
                return parseContinueStatement$825();
            case 'debugger':
                return parseDebuggerStatement$834();
            case 'do':
                return parseDoWhileStatement$821();
            case 'for':
                return parseForStatement$824();
            case 'function':
                return parseFunctionDeclaration$841();
            case 'class':
                return parseClassDeclaration$848();
            case 'if':
                return parseIfStatement$820();
            case 'return':
                return parseReturnStatement$827();
            case 'switch':
                return parseSwitchStatement$830();
            case 'throw':
                return parseThrowStatement$831();
            case 'try':
                return parseTryStatement$833();
            case 'var':
                return parseVariableStatement$810();
            case 'while':
                return parseWhileStatement$822();
            case 'with':
                return parseWithStatement$828();
            default:
                break;
            }
        }
        expr$1291 = parseExpression$804();
        // 12.12 Labelled Statements
        if (expr$1291.type === Syntax$707.Identifier && match$769(':')) {
            lex$760();
            key$1293 = '$' + expr$1291.name;
            if (Object.prototype.hasOwnProperty.call(state$728.labelSet, key$1293)) {
                throwError$764({}, Messages$709.Redeclaration, 'Label', expr$1291.name);
            }
            state$728.labelSet[key$1293] = true;
            labeledBody$1292 = parseStatement$835();
            delete state$728.labelSet[key$1293];
            return delegate$723.createLabeledStatement(expr$1291, labeledBody$1292);
        }
        consumeSemicolon$773();
        return delegate$723.createExpressionStatement(expr$1291);
    }
    // 13 Function Definition
    function parseConciseBody$836() {
        if (match$769('{')) {
            return parseFunctionSourceElements$837();
        }
        return parseAssignmentExpression$803();
    }
    function parseFunctionSourceElements$837() {
        var sourceElement$1294, sourceElements$1295 = [], token$1296, directive$1297, firstRestricted$1298, oldLabelSet$1299, oldInIteration$1300, oldInSwitch$1301, oldInFunctionBody$1302, oldParenthesizedCount$1303;
        expect$767('{');
        while (streamIndex$725 < length$722) {
            if (lookahead$726.type !== Token$704.StringLiteral) {
                break;
            }
            token$1296 = lookahead$726;
            sourceElement$1294 = parseSourceElement$850();
            sourceElements$1295.push(sourceElement$1294);
            if (sourceElement$1294.expression.type !== Syntax$707.Literal) {
                // this is not directive
                break;
            }
            directive$1297 = token$1296.value;
            if (directive$1297 === 'use strict') {
                strict$714 = true;
                if (firstRestricted$1298) {
                    throwErrorTolerant$765(firstRestricted$1298, Messages$709.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1298 && token$1296.octal) {
                    firstRestricted$1298 = token$1296;
                }
            }
        }
        oldLabelSet$1299 = state$728.labelSet;
        oldInIteration$1300 = state$728.inIteration;
        oldInSwitch$1301 = state$728.inSwitch;
        oldInFunctionBody$1302 = state$728.inFunctionBody;
        oldParenthesizedCount$1303 = state$728.parenthesizedCount;
        state$728.labelSet = {};
        state$728.inIteration = false;
        state$728.inSwitch = false;
        state$728.inFunctionBody = true;
        state$728.parenthesizedCount = 0;
        while (streamIndex$725 < length$722) {
            if (match$769('}')) {
                break;
            }
            sourceElement$1294 = parseSourceElement$850();
            if (typeof sourceElement$1294 === 'undefined') {
                break;
            }
            sourceElements$1295.push(sourceElement$1294);
        }
        expect$767('}');
        state$728.labelSet = oldLabelSet$1299;
        state$728.inIteration = oldInIteration$1300;
        state$728.inSwitch = oldInSwitch$1301;
        state$728.inFunctionBody = oldInFunctionBody$1302;
        state$728.parenthesizedCount = oldParenthesizedCount$1303;
        return delegate$723.createBlockStatement(sourceElements$1295);
    }
    function validateParam$838(options$1304, param$1305, name$1306) {
        var key$1307 = '$' + name$1306;
        if (strict$714) {
            if (isRestrictedWord$741(name$1306)) {
                options$1304.stricted = param$1305;
                options$1304.message = Messages$709.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1304.paramSet, key$1307)) {
                options$1304.stricted = param$1305;
                options$1304.message = Messages$709.StrictParamDupe;
            }
        } else if (!options$1304.firstRestricted) {
            if (isRestrictedWord$741(name$1306)) {
                options$1304.firstRestricted = param$1305;
                options$1304.message = Messages$709.StrictParamName;
            } else if (isStrictModeReservedWord$740(name$1306)) {
                options$1304.firstRestricted = param$1305;
                options$1304.message = Messages$709.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1304.paramSet, key$1307)) {
                options$1304.firstRestricted = param$1305;
                options$1304.message = Messages$709.StrictParamDupe;
            }
        }
        options$1304.paramSet[key$1307] = true;
    }
    function parseParam$839(options$1308) {
        var token$1309, rest$1310, param$1311, def$1312;
        token$1309 = lookahead$726;
        if (token$1309.value === '...') {
            token$1309 = lex$760();
            rest$1310 = true;
        }
        if (match$769('[')) {
            param$1311 = parseArrayInitialiser$776();
            reinterpretAsDestructuredParameter$800(options$1308, param$1311);
        } else if (match$769('{')) {
            if (rest$1310) {
                throwError$764({}, Messages$709.ObjectPatternAsRestParameter);
            }
            param$1311 = parseObjectInitialiser$781();
            reinterpretAsDestructuredParameter$800(options$1308, param$1311);
        } else {
            param$1311 = parseVariableIdentifier$807();
            validateParam$838(options$1308, token$1309, token$1309.value);
            if (match$769('=')) {
                if (rest$1310) {
                    throwErrorTolerant$765(lookahead$726, Messages$709.DefaultRestParameter);
                }
                lex$760();
                def$1312 = parseAssignmentExpression$803();
                ++options$1308.defaultCount;
            }
        }
        if (rest$1310) {
            if (!match$769(')')) {
                throwError$764({}, Messages$709.ParameterAfterRestParameter);
            }
            options$1308.rest = param$1311;
            return false;
        }
        options$1308.params.push(param$1311);
        options$1308.defaults.push(def$1312);
        return !match$769(')');
    }
    function parseParams$840(firstRestricted$1313) {
        var options$1314;
        options$1314 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1313
        };
        expect$767('(');
        if (!match$769(')')) {
            options$1314.paramSet = {};
            while (streamIndex$725 < length$722) {
                if (!parseParam$839(options$1314)) {
                    break;
                }
                expect$767(',');
            }
        }
        expect$767(')');
        if (options$1314.defaultCount === 0) {
            options$1314.defaults = [];
        }
        return options$1314;
    }
    function parseFunctionDeclaration$841() {
        var id$1315, body$1316, token$1317, tmp$1318, firstRestricted$1319, message$1320, previousStrict$1321, previousYieldAllowed$1322, generator$1323, expression$1324;
        expectKeyword$768('function');
        generator$1323 = false;
        if (match$769('*')) {
            lex$760();
            generator$1323 = true;
        }
        token$1317 = lookahead$726;
        id$1315 = parseVariableIdentifier$807();
        if (strict$714) {
            if (isRestrictedWord$741(token$1317.value)) {
                throwErrorTolerant$765(token$1317, Messages$709.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$741(token$1317.value)) {
                firstRestricted$1319 = token$1317;
                message$1320 = Messages$709.StrictFunctionName;
            } else if (isStrictModeReservedWord$740(token$1317.value)) {
                firstRestricted$1319 = token$1317;
                message$1320 = Messages$709.StrictReservedWord;
            }
        }
        tmp$1318 = parseParams$840(firstRestricted$1319);
        firstRestricted$1319 = tmp$1318.firstRestricted;
        if (tmp$1318.message) {
            message$1320 = tmp$1318.message;
        }
        previousStrict$1321 = strict$714;
        previousYieldAllowed$1322 = state$728.yieldAllowed;
        state$728.yieldAllowed = generator$1323;
        // here we redo some work in order to set 'expression'
        expression$1324 = !match$769('{');
        body$1316 = parseConciseBody$836();
        if (strict$714 && firstRestricted$1319) {
            throwError$764(firstRestricted$1319, message$1320);
        }
        if (strict$714 && tmp$1318.stricted) {
            throwErrorTolerant$765(tmp$1318.stricted, message$1320);
        }
        if (state$728.yieldAllowed && !state$728.yieldFound) {
            throwErrorTolerant$765({}, Messages$709.NoYieldInGenerator);
        }
        strict$714 = previousStrict$1321;
        state$728.yieldAllowed = previousYieldAllowed$1322;
        return delegate$723.createFunctionDeclaration(id$1315, tmp$1318.params, tmp$1318.defaults, body$1316, tmp$1318.rest, generator$1323, expression$1324);
    }
    function parseFunctionExpression$842() {
        var token$1325, id$1326 = null, firstRestricted$1327, message$1328, tmp$1329, body$1330, previousStrict$1331, previousYieldAllowed$1332, generator$1333, expression$1334;
        expectKeyword$768('function');
        generator$1333 = false;
        if (match$769('*')) {
            lex$760();
            generator$1333 = true;
        }
        if (!match$769('(')) {
            token$1325 = lookahead$726;
            id$1326 = parseVariableIdentifier$807();
            if (strict$714) {
                if (isRestrictedWord$741(token$1325.value)) {
                    throwErrorTolerant$765(token$1325, Messages$709.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$741(token$1325.value)) {
                    firstRestricted$1327 = token$1325;
                    message$1328 = Messages$709.StrictFunctionName;
                } else if (isStrictModeReservedWord$740(token$1325.value)) {
                    firstRestricted$1327 = token$1325;
                    message$1328 = Messages$709.StrictReservedWord;
                }
            }
        }
        tmp$1329 = parseParams$840(firstRestricted$1327);
        firstRestricted$1327 = tmp$1329.firstRestricted;
        if (tmp$1329.message) {
            message$1328 = tmp$1329.message;
        }
        previousStrict$1331 = strict$714;
        previousYieldAllowed$1332 = state$728.yieldAllowed;
        state$728.yieldAllowed = generator$1333;
        // here we redo some work in order to set 'expression'
        expression$1334 = !match$769('{');
        body$1330 = parseConciseBody$836();
        if (strict$714 && firstRestricted$1327) {
            throwError$764(firstRestricted$1327, message$1328);
        }
        if (strict$714 && tmp$1329.stricted) {
            throwErrorTolerant$765(tmp$1329.stricted, message$1328);
        }
        if (state$728.yieldAllowed && !state$728.yieldFound) {
            throwErrorTolerant$765({}, Messages$709.NoYieldInGenerator);
        }
        strict$714 = previousStrict$1331;
        state$728.yieldAllowed = previousYieldAllowed$1332;
        return delegate$723.createFunctionExpression(id$1326, tmp$1329.params, tmp$1329.defaults, body$1330, tmp$1329.rest, generator$1333, expression$1334);
    }
    function parseYieldExpression$843() {
        var delegateFlag$1335, expr$1336, previousYieldAllowed$1337;
        expectKeyword$768('yield');
        if (!state$728.yieldAllowed) {
            throwErrorTolerant$765({}, Messages$709.IllegalYield);
        }
        delegateFlag$1335 = false;
        if (match$769('*')) {
            lex$760();
            delegateFlag$1335 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1337 = state$728.yieldAllowed;
        state$728.yieldAllowed = false;
        expr$1336 = parseAssignmentExpression$803();
        state$728.yieldAllowed = previousYieldAllowed$1337;
        state$728.yieldFound = true;
        return delegate$723.createYieldExpression(expr$1336, delegateFlag$1335);
    }
    // 14 Classes
    function parseMethodDefinition$844(existingPropNames$1338) {
        var token$1339, key$1340, param$1341, propType$1342, isValidDuplicateProp$1343 = false;
        if (lookahead$726.value === 'static') {
            propType$1342 = ClassPropertyType$712.static;
            lex$760();
        } else {
            propType$1342 = ClassPropertyType$712.prototype;
        }
        if (match$769('*')) {
            lex$760();
            return delegate$723.createMethodDefinition(propType$1342, '', parseObjectPropertyKey$779(), parsePropertyMethodFunction$778({ generator: true }));
        }
        token$1339 = lookahead$726;
        key$1340 = parseObjectPropertyKey$779();
        if (token$1339.value === 'get' && !match$769('(')) {
            key$1340 = parseObjectPropertyKey$779();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1338[propType$1342].hasOwnProperty(key$1340.name)) {
                isValidDuplicateProp$1343 = existingPropNames$1338[propType$1342][key$1340.name].get === undefined && existingPropNames$1338[propType$1342][key$1340.name].data === undefined && existingPropNames$1338[propType$1342][key$1340.name].set !== undefined;
                if (!isValidDuplicateProp$1343) {
                    throwError$764(key$1340, Messages$709.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1338[propType$1342][key$1340.name] = {};
            }
            existingPropNames$1338[propType$1342][key$1340.name].get = true;
            expect$767('(');
            expect$767(')');
            return delegate$723.createMethodDefinition(propType$1342, 'get', key$1340, parsePropertyFunction$777({ generator: false }));
        }
        if (token$1339.value === 'set' && !match$769('(')) {
            key$1340 = parseObjectPropertyKey$779();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1338[propType$1342].hasOwnProperty(key$1340.name)) {
                isValidDuplicateProp$1343 = existingPropNames$1338[propType$1342][key$1340.name].set === undefined && existingPropNames$1338[propType$1342][key$1340.name].data === undefined && existingPropNames$1338[propType$1342][key$1340.name].get !== undefined;
                if (!isValidDuplicateProp$1343) {
                    throwError$764(key$1340, Messages$709.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1338[propType$1342][key$1340.name] = {};
            }
            existingPropNames$1338[propType$1342][key$1340.name].set = true;
            expect$767('(');
            token$1339 = lookahead$726;
            param$1341 = [parseVariableIdentifier$807()];
            expect$767(')');
            return delegate$723.createMethodDefinition(propType$1342, 'set', key$1340, parsePropertyFunction$777({
                params: param$1341,
                generator: false,
                name: token$1339
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1338[propType$1342].hasOwnProperty(key$1340.name)) {
            throwError$764(key$1340, Messages$709.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1338[propType$1342][key$1340.name] = {};
        }
        existingPropNames$1338[propType$1342][key$1340.name].data = true;
        return delegate$723.createMethodDefinition(propType$1342, '', key$1340, parsePropertyMethodFunction$778({ generator: false }));
    }
    function parseClassElement$845(existingProps$1344) {
        if (match$769(';')) {
            lex$760();
            return;
        }
        return parseMethodDefinition$844(existingProps$1344);
    }
    function parseClassBody$846() {
        var classElement$1345, classElements$1346 = [], existingProps$1347 = {};
        existingProps$1347[ClassPropertyType$712.static] = {};
        existingProps$1347[ClassPropertyType$712.prototype] = {};
        expect$767('{');
        while (streamIndex$725 < length$722) {
            if (match$769('}')) {
                break;
            }
            classElement$1345 = parseClassElement$845(existingProps$1347);
            if (typeof classElement$1345 !== 'undefined') {
                classElements$1346.push(classElement$1345);
            }
        }
        expect$767('}');
        return delegate$723.createClassBody(classElements$1346);
    }
    function parseClassExpression$847() {
        var id$1348, previousYieldAllowed$1349, superClass$1350 = null;
        expectKeyword$768('class');
        if (!matchKeyword$770('extends') && !match$769('{')) {
            id$1348 = parseVariableIdentifier$807();
        }
        if (matchKeyword$770('extends')) {
            expectKeyword$768('extends');
            previousYieldAllowed$1349 = state$728.yieldAllowed;
            state$728.yieldAllowed = false;
            superClass$1350 = parseAssignmentExpression$803();
            state$728.yieldAllowed = previousYieldAllowed$1349;
        }
        return delegate$723.createClassExpression(id$1348, superClass$1350, parseClassBody$846());
    }
    function parseClassDeclaration$848() {
        var id$1351, previousYieldAllowed$1352, superClass$1353 = null;
        expectKeyword$768('class');
        id$1351 = parseVariableIdentifier$807();
        if (matchKeyword$770('extends')) {
            expectKeyword$768('extends');
            previousYieldAllowed$1352 = state$728.yieldAllowed;
            state$728.yieldAllowed = false;
            superClass$1353 = parseAssignmentExpression$803();
            state$728.yieldAllowed = previousYieldAllowed$1352;
        }
        return delegate$723.createClassDeclaration(id$1351, superClass$1353, parseClassBody$846());
    }
    // 15 Program
    function matchModuleDeclaration$849() {
        var id$1354;
        if (matchContextualKeyword$771('module')) {
            id$1354 = lookahead2$762();
            return id$1354.type === Token$704.StringLiteral || id$1354.type === Token$704.Identifier;
        }
        return false;
    }
    function parseSourceElement$850() {
        if (lookahead$726.type === Token$704.Keyword) {
            switch (lookahead$726.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$811(lookahead$726.value);
            case 'function':
                return parseFunctionDeclaration$841();
            case 'export':
                return parseExportDeclaration$815();
            case 'import':
                return parseImportDeclaration$816();
            default:
                return parseStatement$835();
            }
        }
        if (matchModuleDeclaration$849()) {
            throwError$764({}, Messages$709.NestedModule);
        }
        if (lookahead$726.type !== Token$704.EOF) {
            return parseStatement$835();
        }
    }
    function parseProgramElement$851() {
        if (lookahead$726.type === Token$704.Keyword) {
            switch (lookahead$726.value) {
            case 'export':
                return parseExportDeclaration$815();
            case 'import':
                return parseImportDeclaration$816();
            }
        }
        if (matchModuleDeclaration$849()) {
            return parseModuleDeclaration$812();
        }
        return parseSourceElement$850();
    }
    function parseProgramElements$852() {
        var sourceElement$1355, sourceElements$1356 = [], token$1357, directive$1358, firstRestricted$1359;
        while (streamIndex$725 < length$722) {
            token$1357 = lookahead$726;
            if (token$1357.type !== Token$704.StringLiteral) {
                break;
            }
            sourceElement$1355 = parseProgramElement$851();
            sourceElements$1356.push(sourceElement$1355);
            if (sourceElement$1355.expression.type !== Syntax$707.Literal) {
                // this is not directive
                break;
            }
            assert$730(false, 'directive isn\'t right');
            directive$1358 = source$713.slice(token$1357.range[0] + 1, token$1357.range[1] - 1);
            if (directive$1358 === 'use strict') {
                strict$714 = true;
                if (firstRestricted$1359) {
                    throwErrorTolerant$765(firstRestricted$1359, Messages$709.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1359 && token$1357.octal) {
                    firstRestricted$1359 = token$1357;
                }
            }
        }
        while (streamIndex$725 < length$722) {
            sourceElement$1355 = parseProgramElement$851();
            if (typeof sourceElement$1355 === 'undefined') {
                break;
            }
            sourceElements$1356.push(sourceElement$1355);
        }
        return sourceElements$1356;
    }
    function parseModuleElement$853() {
        return parseSourceElement$850();
    }
    function parseModuleElements$854() {
        var list$1360 = [], statement$1361;
        while (streamIndex$725 < length$722) {
            if (match$769('}')) {
                break;
            }
            statement$1361 = parseModuleElement$853();
            if (typeof statement$1361 === 'undefined') {
                break;
            }
            list$1360.push(statement$1361);
        }
        return list$1360;
    }
    function parseModuleBlock$855() {
        var block$1362;
        expect$767('{');
        block$1362 = parseModuleElements$854();
        expect$767('}');
        return delegate$723.createBlockStatement(block$1362);
    }
    function parseProgram$856() {
        var body$1363;
        strict$714 = false;
        peek$761();
        body$1363 = parseProgramElements$852();
        return delegate$723.createProgram(body$1363);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$857(type$1364, value$1365, start$1366, end$1367, loc$1368) {
        assert$730(typeof start$1366 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$729.comments.length > 0) {
            if (extra$729.comments[extra$729.comments.length - 1].range[1] > start$1366) {
                return;
            }
        }
        extra$729.comments.push({
            type: type$1364,
            value: value$1365,
            range: [
                start$1366,
                end$1367
            ],
            loc: loc$1368
        });
    }
    function scanComment$858() {
        var comment$1369, ch$1370, loc$1371, start$1372, blockComment$1373, lineComment$1374;
        comment$1369 = '';
        blockComment$1373 = false;
        lineComment$1374 = false;
        while (index$715 < length$722) {
            ch$1370 = source$713[index$715];
            if (lineComment$1374) {
                ch$1370 = source$713[index$715++];
                if (isLineTerminator$736(ch$1370.charCodeAt(0))) {
                    loc$1371.end = {
                        line: lineNumber$716,
                        column: index$715 - lineStart$717 - 1
                    };
                    lineComment$1374 = false;
                    addComment$857('Line', comment$1369, start$1372, index$715 - 1, loc$1371);
                    if (ch$1370 === '\r' && source$713[index$715] === '\n') {
                        ++index$715;
                    }
                    ++lineNumber$716;
                    lineStart$717 = index$715;
                    comment$1369 = '';
                } else if (index$715 >= length$722) {
                    lineComment$1374 = false;
                    comment$1369 += ch$1370;
                    loc$1371.end = {
                        line: lineNumber$716,
                        column: length$722 - lineStart$717
                    };
                    addComment$857('Line', comment$1369, start$1372, length$722, loc$1371);
                } else {
                    comment$1369 += ch$1370;
                }
            } else if (blockComment$1373) {
                if (isLineTerminator$736(ch$1370.charCodeAt(0))) {
                    if (ch$1370 === '\r' && source$713[index$715 + 1] === '\n') {
                        ++index$715;
                        comment$1369 += '\r\n';
                    } else {
                        comment$1369 += ch$1370;
                    }
                    ++lineNumber$716;
                    ++index$715;
                    lineStart$717 = index$715;
                    if (index$715 >= length$722) {
                        throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1370 = source$713[index$715++];
                    if (index$715 >= length$722) {
                        throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1369 += ch$1370;
                    if (ch$1370 === '*') {
                        ch$1370 = source$713[index$715];
                        if (ch$1370 === '/') {
                            comment$1369 = comment$1369.substr(0, comment$1369.length - 1);
                            blockComment$1373 = false;
                            ++index$715;
                            loc$1371.end = {
                                line: lineNumber$716,
                                column: index$715 - lineStart$717
                            };
                            addComment$857('Block', comment$1369, start$1372, index$715, loc$1371);
                            comment$1369 = '';
                        }
                    }
                }
            } else if (ch$1370 === '/') {
                ch$1370 = source$713[index$715 + 1];
                if (ch$1370 === '/') {
                    loc$1371 = {
                        start: {
                            line: lineNumber$716,
                            column: index$715 - lineStart$717
                        }
                    };
                    start$1372 = index$715;
                    index$715 += 2;
                    lineComment$1374 = true;
                    if (index$715 >= length$722) {
                        loc$1371.end = {
                            line: lineNumber$716,
                            column: index$715 - lineStart$717
                        };
                        lineComment$1374 = false;
                        addComment$857('Line', comment$1369, start$1372, index$715, loc$1371);
                    }
                } else if (ch$1370 === '*') {
                    start$1372 = index$715;
                    index$715 += 2;
                    blockComment$1373 = true;
                    loc$1371 = {
                        start: {
                            line: lineNumber$716,
                            column: index$715 - lineStart$717 - 2
                        }
                    };
                    if (index$715 >= length$722) {
                        throwError$764({}, Messages$709.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$735(ch$1370.charCodeAt(0))) {
                ++index$715;
            } else if (isLineTerminator$736(ch$1370.charCodeAt(0))) {
                ++index$715;
                if (ch$1370 === '\r' && source$713[index$715] === '\n') {
                    ++index$715;
                }
                ++lineNumber$716;
                lineStart$717 = index$715;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$859() {
        var i$1375, entry$1376, comment$1377, comments$1378 = [];
        for (i$1375 = 0; i$1375 < extra$729.comments.length; ++i$1375) {
            entry$1376 = extra$729.comments[i$1375];
            comment$1377 = {
                type: entry$1376.type,
                value: entry$1376.value
            };
            if (extra$729.range) {
                comment$1377.range = entry$1376.range;
            }
            if (extra$729.loc) {
                comment$1377.loc = entry$1376.loc;
            }
            comments$1378.push(comment$1377);
        }
        extra$729.comments = comments$1378;
    }
    function collectToken$860() {
        var start$1379, loc$1380, token$1381, range$1382, value$1383;
        skipComment$743();
        start$1379 = index$715;
        loc$1380 = {
            start: {
                line: lineNumber$716,
                column: index$715 - lineStart$717
            }
        };
        token$1381 = extra$729.advance();
        loc$1380.end = {
            line: lineNumber$716,
            column: index$715 - lineStart$717
        };
        if (token$1381.type !== Token$704.EOF) {
            range$1382 = [
                token$1381.range[0],
                token$1381.range[1]
            ];
            value$1383 = source$713.slice(token$1381.range[0], token$1381.range[1]);
            extra$729.tokens.push({
                type: TokenName$705[token$1381.type],
                value: value$1383,
                range: range$1382,
                loc: loc$1380
            });
        }
        return token$1381;
    }
    function collectRegex$861() {
        var pos$1384, loc$1385, regex$1386, token$1387;
        skipComment$743();
        pos$1384 = index$715;
        loc$1385 = {
            start: {
                line: lineNumber$716,
                column: index$715 - lineStart$717
            }
        };
        regex$1386 = extra$729.scanRegExp();
        loc$1385.end = {
            line: lineNumber$716,
            column: index$715 - lineStart$717
        };
        if (!extra$729.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$729.tokens.length > 0) {
                token$1387 = extra$729.tokens[extra$729.tokens.length - 1];
                if (token$1387.range[0] === pos$1384 && token$1387.type === 'Punctuator') {
                    if (token$1387.value === '/' || token$1387.value === '/=') {
                        extra$729.tokens.pop();
                    }
                }
            }
            extra$729.tokens.push({
                type: 'RegularExpression',
                value: regex$1386.literal,
                range: [
                    pos$1384,
                    index$715
                ],
                loc: loc$1385
            });
        }
        return regex$1386;
    }
    function filterTokenLocation$862() {
        var i$1388, entry$1389, token$1390, tokens$1391 = [];
        for (i$1388 = 0; i$1388 < extra$729.tokens.length; ++i$1388) {
            entry$1389 = extra$729.tokens[i$1388];
            token$1390 = {
                type: entry$1389.type,
                value: entry$1389.value
            };
            if (extra$729.range) {
                token$1390.range = entry$1389.range;
            }
            if (extra$729.loc) {
                token$1390.loc = entry$1389.loc;
            }
            tokens$1391.push(token$1390);
        }
        extra$729.tokens = tokens$1391;
    }
    function LocationMarker$863() {
        var sm_index$1392 = lookahead$726 ? lookahead$726.sm_range[0] : 0;
        var sm_lineStart$1393 = lookahead$726 ? lookahead$726.sm_lineStart : 0;
        var sm_lineNumber$1394 = lookahead$726 ? lookahead$726.sm_lineNumber : 1;
        this.range = [
            sm_index$1392,
            sm_index$1392
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1394,
                column: sm_index$1392 - sm_lineStart$1393
            },
            end: {
                line: sm_lineNumber$1394,
                column: sm_index$1392 - sm_lineStart$1393
            }
        };
    }
    LocationMarker$863.prototype = {
        constructor: LocationMarker$863,
        end: function () {
            this.range[1] = sm_index$721;
            this.loc.end.line = sm_lineNumber$718;
            this.loc.end.column = sm_index$721 - sm_lineStart$719;
        },
        applyGroup: function (node$1395) {
            if (extra$729.range) {
                node$1395.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$729.loc) {
                node$1395.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1395 = delegate$723.postProcess(node$1395);
            }
        },
        apply: function (node$1396) {
            var nodeType$1397 = typeof node$1396;
            assert$730(nodeType$1397 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1397);
            if (extra$729.range) {
                node$1396.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$729.loc) {
                node$1396.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1396 = delegate$723.postProcess(node$1396);
            }
        }
    };
    function createLocationMarker$864() {
        return new LocationMarker$863();
    }
    function trackGroupExpression$865() {
        var marker$1398, expr$1399;
        marker$1398 = createLocationMarker$864();
        expect$767('(');
        ++state$728.parenthesizedCount;
        expr$1399 = parseExpression$804();
        expect$767(')');
        marker$1398.end();
        marker$1398.applyGroup(expr$1399);
        return expr$1399;
    }
    function trackLeftHandSideExpression$866() {
        var marker$1400, expr$1401;
        // skipComment();
        marker$1400 = createLocationMarker$864();
        expr$1401 = matchKeyword$770('new') ? parseNewExpression$791() : parsePrimaryExpression$785();
        while (match$769('.') || match$769('[') || lookahead$726.type === Token$704.Template) {
            if (match$769('[')) {
                expr$1401 = delegate$723.createMemberExpression('[', expr$1401, parseComputedMember$790());
                marker$1400.end();
                marker$1400.apply(expr$1401);
            } else if (match$769('.')) {
                expr$1401 = delegate$723.createMemberExpression('.', expr$1401, parseNonComputedMember$789());
                marker$1400.end();
                marker$1400.apply(expr$1401);
            } else {
                expr$1401 = delegate$723.createTaggedTemplateExpression(expr$1401, parseTemplateLiteral$783());
                marker$1400.end();
                marker$1400.apply(expr$1401);
            }
        }
        return expr$1401;
    }
    function trackLeftHandSideExpressionAllowCall$867() {
        var marker$1402, expr$1403, args$1404;
        // skipComment();
        marker$1402 = createLocationMarker$864();
        expr$1403 = matchKeyword$770('new') ? parseNewExpression$791() : parsePrimaryExpression$785();
        while (match$769('.') || match$769('[') || match$769('(') || lookahead$726.type === Token$704.Template) {
            if (match$769('(')) {
                args$1404 = parseArguments$786();
                expr$1403 = delegate$723.createCallExpression(expr$1403, args$1404);
                marker$1402.end();
                marker$1402.apply(expr$1403);
            } else if (match$769('[')) {
                expr$1403 = delegate$723.createMemberExpression('[', expr$1403, parseComputedMember$790());
                marker$1402.end();
                marker$1402.apply(expr$1403);
            } else if (match$769('.')) {
                expr$1403 = delegate$723.createMemberExpression('.', expr$1403, parseNonComputedMember$789());
                marker$1402.end();
                marker$1402.apply(expr$1403);
            } else {
                expr$1403 = delegate$723.createTaggedTemplateExpression(expr$1403, parseTemplateLiteral$783());
                marker$1402.end();
                marker$1402.apply(expr$1403);
            }
        }
        return expr$1403;
    }
    function filterGroup$868(node$1405) {
        var n$1406, i$1407, entry$1408;
        n$1406 = Object.prototype.toString.apply(node$1405) === '[object Array]' ? [] : {};
        for (i$1407 in node$1405) {
            if (node$1405.hasOwnProperty(i$1407) && i$1407 !== 'groupRange' && i$1407 !== 'groupLoc') {
                entry$1408 = node$1405[i$1407];
                if (entry$1408 === null || typeof entry$1408 !== 'object' || entry$1408 instanceof RegExp) {
                    n$1406[i$1407] = entry$1408;
                } else {
                    n$1406[i$1407] = filterGroup$868(entry$1408);
                }
            }
        }
        return n$1406;
    }
    function wrapTrackingFunction$869(range$1409, loc$1410) {
        return function (parseFunction$1411) {
            function isBinary$1412(node$1414) {
                return node$1414.type === Syntax$707.LogicalExpression || node$1414.type === Syntax$707.BinaryExpression;
            }
            function visit$1413(node$1415) {
                var start$1416, end$1417;
                if (isBinary$1412(node$1415.left)) {
                    visit$1413(node$1415.left);
                }
                if (isBinary$1412(node$1415.right)) {
                    visit$1413(node$1415.right);
                }
                if (range$1409) {
                    if (node$1415.left.groupRange || node$1415.right.groupRange) {
                        start$1416 = node$1415.left.groupRange ? node$1415.left.groupRange[0] : node$1415.left.range[0];
                        end$1417 = node$1415.right.groupRange ? node$1415.right.groupRange[1] : node$1415.right.range[1];
                        node$1415.range = [
                            start$1416,
                            end$1417
                        ];
                    } else if (typeof node$1415.range === 'undefined') {
                        start$1416 = node$1415.left.range[0];
                        end$1417 = node$1415.right.range[1];
                        node$1415.range = [
                            start$1416,
                            end$1417
                        ];
                    }
                }
                if (loc$1410) {
                    if (node$1415.left.groupLoc || node$1415.right.groupLoc) {
                        start$1416 = node$1415.left.groupLoc ? node$1415.left.groupLoc.start : node$1415.left.loc.start;
                        end$1417 = node$1415.right.groupLoc ? node$1415.right.groupLoc.end : node$1415.right.loc.end;
                        node$1415.loc = {
                            start: start$1416,
                            end: end$1417
                        };
                        node$1415 = delegate$723.postProcess(node$1415);
                    } else if (typeof node$1415.loc === 'undefined') {
                        node$1415.loc = {
                            start: node$1415.left.loc.start,
                            end: node$1415.right.loc.end
                        };
                        node$1415 = delegate$723.postProcess(node$1415);
                    }
                }
            }
            return function () {
                var marker$1418, node$1419, curr$1420 = lookahead$726;
                marker$1418 = createLocationMarker$864();
                node$1419 = parseFunction$1411.apply(null, arguments);
                marker$1418.end();
                if (node$1419.type !== Syntax$707.Program) {
                    if (curr$1420.leadingComments) {
                        node$1419.leadingComments = curr$1420.leadingComments;
                    }
                    if (curr$1420.trailingComments) {
                        node$1419.trailingComments = curr$1420.trailingComments;
                    }
                }
                if (range$1409 && typeof node$1419.range === 'undefined') {
                    marker$1418.apply(node$1419);
                }
                if (loc$1410 && typeof node$1419.loc === 'undefined') {
                    marker$1418.apply(node$1419);
                }
                if (isBinary$1412(node$1419)) {
                    visit$1413(node$1419);
                }
                return node$1419;
            };
        };
    }
    function patch$870() {
        var wrapTracking$1421;
        if (extra$729.comments) {
            extra$729.skipComment = skipComment$743;
            skipComment$743 = scanComment$858;
        }
        if (extra$729.range || extra$729.loc) {
            extra$729.parseGroupExpression = parseGroupExpression$784;
            extra$729.parseLeftHandSideExpression = parseLeftHandSideExpression$793;
            extra$729.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$792;
            parseGroupExpression$784 = trackGroupExpression$865;
            parseLeftHandSideExpression$793 = trackLeftHandSideExpression$866;
            parseLeftHandSideExpressionAllowCall$792 = trackLeftHandSideExpressionAllowCall$867;
            wrapTracking$1421 = wrapTrackingFunction$869(extra$729.range, extra$729.loc);
            extra$729.parseArrayInitialiser = parseArrayInitialiser$776;
            extra$729.parseAssignmentExpression = parseAssignmentExpression$803;
            extra$729.parseBinaryExpression = parseBinaryExpression$797;
            extra$729.parseBlock = parseBlock$806;
            extra$729.parseFunctionSourceElements = parseFunctionSourceElements$837;
            extra$729.parseCatchClause = parseCatchClause$832;
            extra$729.parseComputedMember = parseComputedMember$790;
            extra$729.parseConditionalExpression = parseConditionalExpression$798;
            extra$729.parseConstLetDeclaration = parseConstLetDeclaration$811;
            extra$729.parseExportBatchSpecifier = parseExportBatchSpecifier$813;
            extra$729.parseExportDeclaration = parseExportDeclaration$815;
            extra$729.parseExportSpecifier = parseExportSpecifier$814;
            extra$729.parseExpression = parseExpression$804;
            extra$729.parseForVariableDeclaration = parseForVariableDeclaration$823;
            extra$729.parseFunctionDeclaration = parseFunctionDeclaration$841;
            extra$729.parseFunctionExpression = parseFunctionExpression$842;
            extra$729.parseParams = parseParams$840;
            extra$729.parseImportDeclaration = parseImportDeclaration$816;
            extra$729.parseImportSpecifier = parseImportSpecifier$817;
            extra$729.parseModuleDeclaration = parseModuleDeclaration$812;
            extra$729.parseModuleBlock = parseModuleBlock$855;
            extra$729.parseNewExpression = parseNewExpression$791;
            extra$729.parseNonComputedProperty = parseNonComputedProperty$788;
            extra$729.parseObjectInitialiser = parseObjectInitialiser$781;
            extra$729.parseObjectProperty = parseObjectProperty$780;
            extra$729.parseObjectPropertyKey = parseObjectPropertyKey$779;
            extra$729.parsePostfixExpression = parsePostfixExpression$794;
            extra$729.parsePrimaryExpression = parsePrimaryExpression$785;
            extra$729.parseProgram = parseProgram$856;
            extra$729.parsePropertyFunction = parsePropertyFunction$777;
            extra$729.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$787;
            extra$729.parseTemplateElement = parseTemplateElement$782;
            extra$729.parseTemplateLiteral = parseTemplateLiteral$783;
            extra$729.parseStatement = parseStatement$835;
            extra$729.parseSwitchCase = parseSwitchCase$829;
            extra$729.parseUnaryExpression = parseUnaryExpression$795;
            extra$729.parseVariableDeclaration = parseVariableDeclaration$808;
            extra$729.parseVariableIdentifier = parseVariableIdentifier$807;
            extra$729.parseMethodDefinition = parseMethodDefinition$844;
            extra$729.parseClassDeclaration = parseClassDeclaration$848;
            extra$729.parseClassExpression = parseClassExpression$847;
            extra$729.parseClassBody = parseClassBody$846;
            parseArrayInitialiser$776 = wrapTracking$1421(extra$729.parseArrayInitialiser);
            parseAssignmentExpression$803 = wrapTracking$1421(extra$729.parseAssignmentExpression);
            parseBinaryExpression$797 = wrapTracking$1421(extra$729.parseBinaryExpression);
            parseBlock$806 = wrapTracking$1421(extra$729.parseBlock);
            parseFunctionSourceElements$837 = wrapTracking$1421(extra$729.parseFunctionSourceElements);
            parseCatchClause$832 = wrapTracking$1421(extra$729.parseCatchClause);
            parseComputedMember$790 = wrapTracking$1421(extra$729.parseComputedMember);
            parseConditionalExpression$798 = wrapTracking$1421(extra$729.parseConditionalExpression);
            parseConstLetDeclaration$811 = wrapTracking$1421(extra$729.parseConstLetDeclaration);
            parseExportBatchSpecifier$813 = wrapTracking$1421(parseExportBatchSpecifier$813);
            parseExportDeclaration$815 = wrapTracking$1421(parseExportDeclaration$815);
            parseExportSpecifier$814 = wrapTracking$1421(parseExportSpecifier$814);
            parseExpression$804 = wrapTracking$1421(extra$729.parseExpression);
            parseForVariableDeclaration$823 = wrapTracking$1421(extra$729.parseForVariableDeclaration);
            parseFunctionDeclaration$841 = wrapTracking$1421(extra$729.parseFunctionDeclaration);
            parseFunctionExpression$842 = wrapTracking$1421(extra$729.parseFunctionExpression);
            parseParams$840 = wrapTracking$1421(extra$729.parseParams);
            parseImportDeclaration$816 = wrapTracking$1421(extra$729.parseImportDeclaration);
            parseImportSpecifier$817 = wrapTracking$1421(extra$729.parseImportSpecifier);
            parseModuleDeclaration$812 = wrapTracking$1421(extra$729.parseModuleDeclaration);
            parseModuleBlock$855 = wrapTracking$1421(extra$729.parseModuleBlock);
            parseLeftHandSideExpression$793 = wrapTracking$1421(parseLeftHandSideExpression$793);
            parseNewExpression$791 = wrapTracking$1421(extra$729.parseNewExpression);
            parseNonComputedProperty$788 = wrapTracking$1421(extra$729.parseNonComputedProperty);
            parseObjectInitialiser$781 = wrapTracking$1421(extra$729.parseObjectInitialiser);
            parseObjectProperty$780 = wrapTracking$1421(extra$729.parseObjectProperty);
            parseObjectPropertyKey$779 = wrapTracking$1421(extra$729.parseObjectPropertyKey);
            parsePostfixExpression$794 = wrapTracking$1421(extra$729.parsePostfixExpression);
            parsePrimaryExpression$785 = wrapTracking$1421(extra$729.parsePrimaryExpression);
            parseProgram$856 = wrapTracking$1421(extra$729.parseProgram);
            parsePropertyFunction$777 = wrapTracking$1421(extra$729.parsePropertyFunction);
            parseTemplateElement$782 = wrapTracking$1421(extra$729.parseTemplateElement);
            parseTemplateLiteral$783 = wrapTracking$1421(extra$729.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$787 = wrapTracking$1421(extra$729.parseSpreadOrAssignmentExpression);
            parseStatement$835 = wrapTracking$1421(extra$729.parseStatement);
            parseSwitchCase$829 = wrapTracking$1421(extra$729.parseSwitchCase);
            parseUnaryExpression$795 = wrapTracking$1421(extra$729.parseUnaryExpression);
            parseVariableDeclaration$808 = wrapTracking$1421(extra$729.parseVariableDeclaration);
            parseVariableIdentifier$807 = wrapTracking$1421(extra$729.parseVariableIdentifier);
            parseMethodDefinition$844 = wrapTracking$1421(extra$729.parseMethodDefinition);
            parseClassDeclaration$848 = wrapTracking$1421(extra$729.parseClassDeclaration);
            parseClassExpression$847 = wrapTracking$1421(extra$729.parseClassExpression);
            parseClassBody$846 = wrapTracking$1421(extra$729.parseClassBody);
        }
        if (typeof extra$729.tokens !== 'undefined') {
            extra$729.advance = advance$759;
            extra$729.scanRegExp = scanRegExp$756;
            advance$759 = collectToken$860;
            scanRegExp$756 = collectRegex$861;
        }
    }
    function unpatch$871() {
        if (typeof extra$729.skipComment === 'function') {
            skipComment$743 = extra$729.skipComment;
        }
        if (extra$729.range || extra$729.loc) {
            parseArrayInitialiser$776 = extra$729.parseArrayInitialiser;
            parseAssignmentExpression$803 = extra$729.parseAssignmentExpression;
            parseBinaryExpression$797 = extra$729.parseBinaryExpression;
            parseBlock$806 = extra$729.parseBlock;
            parseFunctionSourceElements$837 = extra$729.parseFunctionSourceElements;
            parseCatchClause$832 = extra$729.parseCatchClause;
            parseComputedMember$790 = extra$729.parseComputedMember;
            parseConditionalExpression$798 = extra$729.parseConditionalExpression;
            parseConstLetDeclaration$811 = extra$729.parseConstLetDeclaration;
            parseExportBatchSpecifier$813 = extra$729.parseExportBatchSpecifier;
            parseExportDeclaration$815 = extra$729.parseExportDeclaration;
            parseExportSpecifier$814 = extra$729.parseExportSpecifier;
            parseExpression$804 = extra$729.parseExpression;
            parseForVariableDeclaration$823 = extra$729.parseForVariableDeclaration;
            parseFunctionDeclaration$841 = extra$729.parseFunctionDeclaration;
            parseFunctionExpression$842 = extra$729.parseFunctionExpression;
            parseImportDeclaration$816 = extra$729.parseImportDeclaration;
            parseImportSpecifier$817 = extra$729.parseImportSpecifier;
            parseGroupExpression$784 = extra$729.parseGroupExpression;
            parseLeftHandSideExpression$793 = extra$729.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$792 = extra$729.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$812 = extra$729.parseModuleDeclaration;
            parseModuleBlock$855 = extra$729.parseModuleBlock;
            parseNewExpression$791 = extra$729.parseNewExpression;
            parseNonComputedProperty$788 = extra$729.parseNonComputedProperty;
            parseObjectInitialiser$781 = extra$729.parseObjectInitialiser;
            parseObjectProperty$780 = extra$729.parseObjectProperty;
            parseObjectPropertyKey$779 = extra$729.parseObjectPropertyKey;
            parsePostfixExpression$794 = extra$729.parsePostfixExpression;
            parsePrimaryExpression$785 = extra$729.parsePrimaryExpression;
            parseProgram$856 = extra$729.parseProgram;
            parsePropertyFunction$777 = extra$729.parsePropertyFunction;
            parseTemplateElement$782 = extra$729.parseTemplateElement;
            parseTemplateLiteral$783 = extra$729.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$787 = extra$729.parseSpreadOrAssignmentExpression;
            parseStatement$835 = extra$729.parseStatement;
            parseSwitchCase$829 = extra$729.parseSwitchCase;
            parseUnaryExpression$795 = extra$729.parseUnaryExpression;
            parseVariableDeclaration$808 = extra$729.parseVariableDeclaration;
            parseVariableIdentifier$807 = extra$729.parseVariableIdentifier;
            parseMethodDefinition$844 = extra$729.parseMethodDefinition;
            parseClassDeclaration$848 = extra$729.parseClassDeclaration;
            parseClassExpression$847 = extra$729.parseClassExpression;
            parseClassBody$846 = extra$729.parseClassBody;
        }
        if (typeof extra$729.scanRegExp === 'function') {
            advance$759 = extra$729.advance;
            scanRegExp$756 = extra$729.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$872(object$1422, properties$1423) {
        var entry$1424, result$1425 = {};
        for (entry$1424 in object$1422) {
            if (object$1422.hasOwnProperty(entry$1424)) {
                result$1425[entry$1424] = object$1422[entry$1424];
            }
        }
        for (entry$1424 in properties$1423) {
            if (properties$1423.hasOwnProperty(entry$1424)) {
                result$1425[entry$1424] = properties$1423[entry$1424];
            }
        }
        return result$1425;
    }
    function tokenize$873(code$1426, options$1427) {
        var toString$1428, token$1429, tokens$1430;
        toString$1428 = String;
        if (typeof code$1426 !== 'string' && !(code$1426 instanceof String)) {
            code$1426 = toString$1428(code$1426);
        }
        delegate$723 = SyntaxTreeDelegate$711;
        source$713 = code$1426;
        index$715 = 0;
        lineNumber$716 = source$713.length > 0 ? 1 : 0;
        lineStart$717 = 0;
        length$722 = source$713.length;
        lookahead$726 = null;
        state$728 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$729 = {};
        // Options matching.
        options$1427 = options$1427 || {};
        // Of course we collect tokens here.
        options$1427.tokens = true;
        extra$729.tokens = [];
        extra$729.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$729.openParenToken = -1;
        extra$729.openCurlyToken = -1;
        extra$729.range = typeof options$1427.range === 'boolean' && options$1427.range;
        extra$729.loc = typeof options$1427.loc === 'boolean' && options$1427.loc;
        if (typeof options$1427.comment === 'boolean' && options$1427.comment) {
            extra$729.comments = [];
        }
        if (typeof options$1427.tolerant === 'boolean' && options$1427.tolerant) {
            extra$729.errors = [];
        }
        if (length$722 > 0) {
            if (typeof source$713[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1426 instanceof String) {
                    source$713 = code$1426.valueOf();
                }
            }
        }
        patch$870();
        try {
            peek$761();
            if (lookahead$726.type === Token$704.EOF) {
                return extra$729.tokens;
            }
            token$1429 = lex$760();
            while (lookahead$726.type !== Token$704.EOF) {
                try {
                    token$1429 = lex$760();
                } catch (lexError$1431) {
                    token$1429 = lookahead$726;
                    if (extra$729.errors) {
                        extra$729.errors.push(lexError$1431);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1431;
                    }
                }
            }
            filterTokenLocation$862();
            tokens$1430 = extra$729.tokens;
            if (typeof extra$729.comments !== 'undefined') {
                filterCommentLocation$859();
                tokens$1430.comments = extra$729.comments;
            }
            if (typeof extra$729.errors !== 'undefined') {
                tokens$1430.errors = extra$729.errors;
            }
        } catch (e$1432) {
            throw e$1432;
        } finally {
            unpatch$871();
            extra$729 = {};
        }
        return tokens$1430;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$874(toks$1433, start$1434, inExprDelim$1435, parentIsBlock$1436) {
        var assignOps$1437 = [
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
        var binaryOps$1438 = [
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
        var unaryOps$1439 = [
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
        function back$1440(n$1441) {
            var idx$1442 = toks$1433.length - n$1441 > 0 ? toks$1433.length - n$1441 : 0;
            return toks$1433[idx$1442];
        }
        if (inExprDelim$1435 && toks$1433.length - (start$1434 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1440(start$1434 + 2).value === ':' && parentIsBlock$1436) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$731(back$1440(start$1434 + 2).value, unaryOps$1439.concat(binaryOps$1438).concat(assignOps$1437))) {
            // ... + {...}
            return false;
        } else if (back$1440(start$1434 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1443 = typeof back$1440(start$1434 + 1).startLineNumber !== 'undefined' ? back$1440(start$1434 + 1).startLineNumber : back$1440(start$1434 + 1).lineNumber;
            if (back$1440(start$1434 + 2).lineNumber !== currLineNumber$1443) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$731(back$1440(start$1434 + 2).value, [
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
    function readToken$875(toks$1444, inExprDelim$1445, parentIsBlock$1446) {
        var delimiters$1447 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1448 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1449 = toks$1444.length - 1;
        var comments$1450, commentsLen$1451 = extra$729.comments.length;
        function back$1452(n$1456) {
            var idx$1457 = toks$1444.length - n$1456 > 0 ? toks$1444.length - n$1456 : 0;
            return toks$1444[idx$1457];
        }
        function attachComments$1453(token$1458) {
            if (comments$1450) {
                token$1458.leadingComments = comments$1450;
            }
            return token$1458;
        }
        function _advance$1454() {
            return attachComments$1453(advance$759());
        }
        function _scanRegExp$1455() {
            return attachComments$1453(scanRegExp$756());
        }
        skipComment$743();
        if (extra$729.comments.length > commentsLen$1451) {
            comments$1450 = extra$729.comments.slice(commentsLen$1451);
        }
        if (isIn$731(source$713[index$715], delimiters$1447)) {
            return attachComments$1453(readDelim$876(toks$1444, inExprDelim$1445, parentIsBlock$1446));
        }
        if (source$713[index$715] === '/') {
            var prev$1459 = back$1452(1);
            if (prev$1459) {
                if (prev$1459.value === '()') {
                    if (isIn$731(back$1452(2).value, parenIdents$1448)) {
                        // ... if (...) / ...
                        return _scanRegExp$1455();
                    }
                    // ... (...) / ...
                    return _advance$1454();
                }
                if (prev$1459.value === '{}') {
                    if (blockAllowed$874(toks$1444, 0, inExprDelim$1445, parentIsBlock$1446)) {
                        if (back$1452(2).value === '()') {
                            // named function
                            if (back$1452(4).value === 'function') {
                                if (!blockAllowed$874(toks$1444, 3, inExprDelim$1445, parentIsBlock$1446)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1454();
                                }
                                if (toks$1444.length - 5 <= 0 && inExprDelim$1445) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1454();
                                }
                            }
                            // unnamed function
                            if (back$1452(3).value === 'function') {
                                if (!blockAllowed$874(toks$1444, 2, inExprDelim$1445, parentIsBlock$1446)) {
                                    // new function (...) {...} / ...
                                    return _advance$1454();
                                }
                                if (toks$1444.length - 4 <= 0 && inExprDelim$1445) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1454();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1455();
                    } else {
                        // ... + {...} / ...
                        return _advance$1454();
                    }
                }
                if (prev$1459.type === Token$704.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1455();
                }
                if (isKeyword$742(prev$1459.value)) {
                    // typeof /...
                    return _scanRegExp$1455();
                }
                return _advance$1454();
            }
            return _scanRegExp$1455();
        }
        return _advance$1454();
    }
    function readDelim$876(toks$1460, inExprDelim$1461, parentIsBlock$1462) {
        var startDelim$1463 = advance$759(), matchDelim$1464 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1465 = [];
        var delimiters$1466 = [
                '(',
                '{',
                '['
            ];
        assert$730(delimiters$1466.indexOf(startDelim$1463.value) !== -1, 'Need to begin at the delimiter');
        var token$1467 = startDelim$1463;
        var startLineNumber$1468 = token$1467.lineNumber;
        var startLineStart$1469 = token$1467.lineStart;
        var startRange$1470 = token$1467.range;
        var delimToken$1471 = {};
        delimToken$1471.type = Token$704.Delimiter;
        delimToken$1471.value = startDelim$1463.value + matchDelim$1464[startDelim$1463.value];
        delimToken$1471.startLineNumber = startLineNumber$1468;
        delimToken$1471.startLineStart = startLineStart$1469;
        delimToken$1471.startRange = startRange$1470;
        var delimIsBlock$1472 = false;
        if (startDelim$1463.value === '{') {
            delimIsBlock$1472 = blockAllowed$874(toks$1460.concat(delimToken$1471), 0, inExprDelim$1461, parentIsBlock$1462);
        }
        while (index$715 <= length$722) {
            token$1467 = readToken$875(inner$1465, startDelim$1463.value === '(' || startDelim$1463.value === '[', delimIsBlock$1472);
            if (token$1467.type === Token$704.Punctuator && token$1467.value === matchDelim$1464[startDelim$1463.value]) {
                if (token$1467.leadingComments) {
                    delimToken$1471.trailingComments = token$1467.leadingComments;
                }
                break;
            } else if (token$1467.type === Token$704.EOF) {
                throwError$764({}, Messages$709.UnexpectedEOS);
            } else {
                inner$1465.push(token$1467);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$715 >= length$722 && matchDelim$1464[startDelim$1463.value] !== source$713[length$722 - 1]) {
            throwError$764({}, Messages$709.UnexpectedEOS);
        }
        var endLineNumber$1473 = token$1467.lineNumber;
        var endLineStart$1474 = token$1467.lineStart;
        var endRange$1475 = token$1467.range;
        delimToken$1471.inner = inner$1465;
        delimToken$1471.endLineNumber = endLineNumber$1473;
        delimToken$1471.endLineStart = endLineStart$1474;
        delimToken$1471.endRange = endRange$1475;
        return delimToken$1471;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$877(code$1476) {
        var token$1477, tokenTree$1478 = [];
        extra$729 = {};
        extra$729.comments = [];
        patch$870();
        source$713 = code$1476;
        index$715 = 0;
        lineNumber$716 = source$713.length > 0 ? 1 : 0;
        lineStart$717 = 0;
        length$722 = source$713.length;
        state$728 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$715 < length$722) {
            tokenTree$1478.push(readToken$875(tokenTree$1478, false, false));
        }
        var last$1479 = tokenTree$1478[tokenTree$1478.length - 1];
        if (last$1479 && last$1479.type !== Token$704.EOF) {
            tokenTree$1478.push({
                type: Token$704.EOF,
                value: '',
                lineNumber: last$1479.lineNumber,
                lineStart: last$1479.lineStart,
                range: [
                    index$715,
                    index$715
                ]
            });
        }
        return expander$703.tokensToSyntax(tokenTree$1478);
    }
    function parse$878(code$1480, options$1481) {
        var program$1482, toString$1483;
        extra$729 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1480)) {
            tokenStream$724 = code$1480;
            length$722 = tokenStream$724.length;
            lineNumber$716 = tokenStream$724.length > 0 ? 1 : 0;
            source$713 = undefined;
        } else {
            toString$1483 = String;
            if (typeof code$1480 !== 'string' && !(code$1480 instanceof String)) {
                code$1480 = toString$1483(code$1480);
            }
            source$713 = code$1480;
            length$722 = source$713.length;
            lineNumber$716 = source$713.length > 0 ? 1 : 0;
        }
        delegate$723 = SyntaxTreeDelegate$711;
        streamIndex$725 = -1;
        index$715 = 0;
        lineStart$717 = 0;
        sm_lineStart$719 = 0;
        sm_lineNumber$718 = lineNumber$716;
        sm_index$721 = 0;
        sm_range$720 = [
            0,
            0
        ];
        lookahead$726 = null;
        state$728 = {
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
        if (typeof options$1481 !== 'undefined') {
            extra$729.range = typeof options$1481.range === 'boolean' && options$1481.range;
            extra$729.loc = typeof options$1481.loc === 'boolean' && options$1481.loc;
            if (extra$729.loc && options$1481.source !== null && options$1481.source !== undefined) {
                delegate$723 = extend$872(delegate$723, {
                    'postProcess': function (node$1484) {
                        node$1484.loc.source = toString$1483(options$1481.source);
                        return node$1484;
                    }
                });
            }
            if (typeof options$1481.tokens === 'boolean' && options$1481.tokens) {
                extra$729.tokens = [];
            }
            if (typeof options$1481.comment === 'boolean' && options$1481.comment) {
                extra$729.comments = [];
            }
            if (typeof options$1481.tolerant === 'boolean' && options$1481.tolerant) {
                extra$729.errors = [];
            }
        }
        if (length$722 > 0) {
            if (source$713 && typeof source$713[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1480 instanceof String) {
                    source$713 = code$1480.valueOf();
                }
            }
        }
        extra$729 = { loc: true };
        patch$870();
        try {
            program$1482 = parseProgram$856();
            if (typeof extra$729.comments !== 'undefined') {
                filterCommentLocation$859();
                program$1482.comments = extra$729.comments;
            }
            if (typeof extra$729.tokens !== 'undefined') {
                filterTokenLocation$862();
                program$1482.tokens = extra$729.tokens;
            }
            if (typeof extra$729.errors !== 'undefined') {
                program$1482.errors = extra$729.errors;
            }
            if (extra$729.range || extra$729.loc) {
                program$1482.body = filterGroup$868(program$1482.body);
            }
        } catch (e$1485) {
            throw e$1485;
        } finally {
            unpatch$871();
            extra$729 = {};
        }
        return program$1482;
    }
    exports$702.tokenize = tokenize$873;
    exports$702.read = read$877;
    exports$702.Token = Token$704;
    exports$702.assert = assert$730;
    exports$702.parse = parse$878;
    // Deep copy.
    exports$702.Syntax = function () {
        var name$1486, types$1487 = {};
        if (typeof Object.create === 'function') {
            types$1487 = Object.create(null);
        }
        for (name$1486 in Syntax$707) {
            if (Syntax$707.hasOwnProperty(name$1486)) {
                types$1487[name$1486] = Syntax$707[name$1486];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1487);
        }
        return types$1487;
    }();
}));
//# sourceMappingURL=parser.js.map