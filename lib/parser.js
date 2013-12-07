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
(function (root$698, factory$699) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$699);
    } else if (typeof exports !== 'undefined') {
        factory$699(exports, require('./expander'));
    } else {
        factory$699(root$698.esprima = {});
    }
}(this, function (exports$700, expander$701) {
    'use strict';
    var Token$702, TokenName$703, FnExprTokens$704, Syntax$705, PropertyKind$706, Messages$707, Regex$708, SyntaxTreeDelegate$709, ClassPropertyType$710, source$711, strict$712, index$713, lineNumber$714, lineStart$715, sm_lineNumber$716, sm_lineStart$717, sm_range$718, sm_index$719, length$720, delegate$721, tokenStream$722, streamIndex$723, lookahead$724, lookaheadIndex$725, state$726, extra$727;
    Token$702 = {
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
    TokenName$703 = {};
    TokenName$703[Token$702.BooleanLiteral] = 'Boolean';
    TokenName$703[Token$702.EOF] = '<end>';
    TokenName$703[Token$702.Identifier] = 'Identifier';
    TokenName$703[Token$702.Keyword] = 'Keyword';
    TokenName$703[Token$702.NullLiteral] = 'Null';
    TokenName$703[Token$702.NumericLiteral] = 'Numeric';
    TokenName$703[Token$702.Punctuator] = 'Punctuator';
    TokenName$703[Token$702.StringLiteral] = 'String';
    TokenName$703[Token$702.RegularExpression] = 'RegularExpression';
    TokenName$703[Token$702.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$704 = [
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
    Syntax$705 = {
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
    PropertyKind$706 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$710 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$707 = {
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
    Regex$708 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$728(condition$877, message$878) {
        if (!condition$877) {
            throw new Error('ASSERT: ' + message$878);
        }
    }
    function isIn$729(el$879, list$880) {
        return list$880.indexOf(el$879) !== -1;
    }
    function isDecimalDigit$730(ch$881) {
        return ch$881 >= 48 && ch$881 <= 57;
    }    // 0..9
    function isHexDigit$731(ch$882) {
        return '0123456789abcdefABCDEF'.indexOf(ch$882) >= 0;
    }
    function isOctalDigit$732(ch$883) {
        return '01234567'.indexOf(ch$883) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$733(ch$884) {
        return ch$884 === 32 || ch$884 === 9 || ch$884 === 11 || ch$884 === 12 || ch$884 === 160 || ch$884 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$884)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$734(ch$885) {
        return ch$885 === 10 || ch$885 === 13 || ch$885 === 8232 || ch$885 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$735(ch$886) {
        return ch$886 === 36 || ch$886 === 95 || ch$886 >= 65 && ch$886 <= 90 || ch$886 >= 97 && ch$886 <= 122 || ch$886 === 92 || ch$886 >= 128 && Regex$708.NonAsciiIdentifierStart.test(String.fromCharCode(ch$886));
    }
    function isIdentifierPart$736(ch$887) {
        return ch$887 === 36 || ch$887 === 95 || ch$887 >= 65 && ch$887 <= 90 || ch$887 >= 97 && ch$887 <= 122 || ch$887 >= 48 && ch$887 <= 57 || ch$887 === 92 || ch$887 >= 128 && Regex$708.NonAsciiIdentifierPart.test(String.fromCharCode(ch$887));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$737(id$888) {
        switch (id$888) {
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
    function isStrictModeReservedWord$738(id$889) {
        switch (id$889) {
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
    function isRestrictedWord$739(id$890) {
        return id$890 === 'eval' || id$890 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$740(id$891) {
        if (strict$712 && isStrictModeReservedWord$738(id$891)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$891.length) {
        case 2:
            return id$891 === 'if' || id$891 === 'in' || id$891 === 'do';
        case 3:
            return id$891 === 'var' || id$891 === 'for' || id$891 === 'new' || id$891 === 'try' || id$891 === 'let';
        case 4:
            return id$891 === 'this' || id$891 === 'else' || id$891 === 'case' || id$891 === 'void' || id$891 === 'with' || id$891 === 'enum';
        case 5:
            return id$891 === 'while' || id$891 === 'break' || id$891 === 'catch' || id$891 === 'throw' || id$891 === 'const' || id$891 === 'yield' || id$891 === 'class' || id$891 === 'super';
        case 6:
            return id$891 === 'return' || id$891 === 'typeof' || id$891 === 'delete' || id$891 === 'switch' || id$891 === 'export' || id$891 === 'import';
        case 7:
            return id$891 === 'default' || id$891 === 'finally' || id$891 === 'extends';
        case 8:
            return id$891 === 'function' || id$891 === 'continue' || id$891 === 'debugger';
        case 10:
            return id$891 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$741() {
        var ch$892, blockComment$893, lineComment$894;
        blockComment$893 = false;
        lineComment$894 = false;
        while (index$713 < length$720) {
            ch$892 = source$711.charCodeAt(index$713);
            if (lineComment$894) {
                ++index$713;
                if (isLineTerminator$734(ch$892)) {
                    lineComment$894 = false;
                    if (ch$892 === 13 && source$711.charCodeAt(index$713) === 10) {
                        ++index$713;
                    }
                    ++lineNumber$714;
                    lineStart$715 = index$713;
                }
            } else if (blockComment$893) {
                if (isLineTerminator$734(ch$892)) {
                    if (ch$892 === 13 && source$711.charCodeAt(index$713 + 1) === 10) {
                        ++index$713;
                    }
                    ++lineNumber$714;
                    ++index$713;
                    lineStart$715 = index$713;
                    if (index$713 >= length$720) {
                        throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$892 = source$711.charCodeAt(index$713++);
                    if (index$713 >= length$720) {
                        throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$892 === 42) {
                        ch$892 = source$711.charCodeAt(index$713);
                        if (ch$892 === 47) {
                            ++index$713;
                            blockComment$893 = false;
                        }
                    }
                }
            } else if (ch$892 === 47) {
                ch$892 = source$711.charCodeAt(index$713 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$892 === 47) {
                    index$713 += 2;
                    lineComment$894 = true;
                } else if (ch$892 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$713 += 2;
                    blockComment$893 = true;
                    if (index$713 >= length$720) {
                        throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$733(ch$892)) {
                ++index$713;
            } else if (isLineTerminator$734(ch$892)) {
                ++index$713;
                if (ch$892 === 13 && source$711.charCodeAt(index$713) === 10) {
                    ++index$713;
                }
                ++lineNumber$714;
                lineStart$715 = index$713;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$742(prefix$895) {
        var i$896, len$897, ch$898, code$899 = 0;
        len$897 = prefix$895 === 'u' ? 4 : 2;
        for (i$896 = 0; i$896 < len$897; ++i$896) {
            if (index$713 < length$720 && isHexDigit$731(source$711[index$713])) {
                ch$898 = source$711[index$713++];
                code$899 = code$899 * 16 + '0123456789abcdef'.indexOf(ch$898.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$899);
    }
    function scanUnicodeCodePointEscape$743() {
        var ch$900, code$901, cu1$902, cu2$903;
        ch$900 = source$711[index$713];
        code$901 = 0;
        // At least, one hex digit is required.
        if (ch$900 === '}') {
            throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        while (index$713 < length$720) {
            ch$900 = source$711[index$713++];
            if (!isHexDigit$731(ch$900)) {
                break;
            }
            code$901 = code$901 * 16 + '0123456789abcdef'.indexOf(ch$900.toLowerCase());
        }
        if (code$901 > 1114111 || ch$900 !== '}') {
            throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$901 <= 65535) {
            return String.fromCharCode(code$901);
        }
        cu1$902 = (code$901 - 65536 >> 10) + 55296;
        cu2$903 = (code$901 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$902, cu2$903);
    }
    function getEscapedIdentifier$744() {
        var ch$904, id$905;
        ch$904 = source$711.charCodeAt(index$713++);
        id$905 = String.fromCharCode(ch$904);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$904 === 92) {
            if (source$711.charCodeAt(index$713) !== 117) {
                throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
            }
            ++index$713;
            ch$904 = scanHexEscape$742('u');
            if (!ch$904 || ch$904 === '\\' || !isIdentifierStart$735(ch$904.charCodeAt(0))) {
                throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
            }
            id$905 = ch$904;
        }
        while (index$713 < length$720) {
            ch$904 = source$711.charCodeAt(index$713);
            if (!isIdentifierPart$736(ch$904)) {
                break;
            }
            ++index$713;
            id$905 += String.fromCharCode(ch$904);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$904 === 92) {
                id$905 = id$905.substr(0, id$905.length - 1);
                if (source$711.charCodeAt(index$713) !== 117) {
                    throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                }
                ++index$713;
                ch$904 = scanHexEscape$742('u');
                if (!ch$904 || ch$904 === '\\' || !isIdentifierPart$736(ch$904.charCodeAt(0))) {
                    throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                }
                id$905 += ch$904;
            }
        }
        return id$905;
    }
    function getIdentifier$745() {
        var start$906, ch$907;
        start$906 = index$713++;
        while (index$713 < length$720) {
            ch$907 = source$711.charCodeAt(index$713);
            if (ch$907 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$713 = start$906;
                return getEscapedIdentifier$744();
            }
            if (isIdentifierPart$736(ch$907)) {
                ++index$713;
            } else {
                break;
            }
        }
        return source$711.slice(start$906, index$713);
    }
    function scanIdentifier$746() {
        var start$908, id$909, type$910;
        start$908 = index$713;
        // Backslash (char #92) starts an escaped character.
        id$909 = source$711.charCodeAt(index$713) === 92 ? getEscapedIdentifier$744() : getIdentifier$745();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$909.length === 1) {
            type$910 = Token$702.Identifier;
        } else if (isKeyword$740(id$909)) {
            type$910 = Token$702.Keyword;
        } else if (id$909 === 'null') {
            type$910 = Token$702.NullLiteral;
        } else if (id$909 === 'true' || id$909 === 'false') {
            type$910 = Token$702.BooleanLiteral;
        } else {
            type$910 = Token$702.Identifier;
        }
        return {
            type: type$910,
            value: id$909,
            lineNumber: lineNumber$714,
            lineStart: lineStart$715,
            range: [
                start$908,
                index$713
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$747() {
        var start$911 = index$713, code$912 = source$711.charCodeAt(index$713), code2$913, ch1$914 = source$711[index$713], ch2$915, ch3$916, ch4$917;
        switch (code$912) {
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
            ++index$713;
            if (extra$727.tokenize) {
                if (code$912 === 40) {
                    extra$727.openParenToken = extra$727.tokens.length;
                } else if (code$912 === 123) {
                    extra$727.openCurlyToken = extra$727.tokens.length;
                }
            }
            return {
                type: Token$702.Punctuator,
                value: String.fromCharCode(code$912),
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$911,
                    index$713
                ]
            };
        default:
            code2$913 = source$711.charCodeAt(index$713 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$913 === 61) {
                switch (code$912) {
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
                    index$713 += 2;
                    return {
                        type: Token$702.Punctuator,
                        value: String.fromCharCode(code$912) + String.fromCharCode(code2$913),
                        lineNumber: lineNumber$714,
                        lineStart: lineStart$715,
                        range: [
                            start$911,
                            index$713
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$713 += 2;
                    // !== and ===
                    if (source$711.charCodeAt(index$713) === 61) {
                        ++index$713;
                    }
                    return {
                        type: Token$702.Punctuator,
                        value: source$711.slice(start$911, index$713),
                        lineNumber: lineNumber$714,
                        lineStart: lineStart$715,
                        range: [
                            start$911,
                            index$713
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$915 = source$711[index$713 + 1];
        ch3$916 = source$711[index$713 + 2];
        ch4$917 = source$711[index$713 + 3];
        // 4-character punctuator: >>>=
        if (ch1$914 === '>' && ch2$915 === '>' && ch3$916 === '>') {
            if (ch4$917 === '=') {
                index$713 += 4;
                return {
                    type: Token$702.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$714,
                    lineStart: lineStart$715,
                    range: [
                        start$911,
                        index$713
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$914 === '>' && ch2$915 === '>' && ch3$916 === '>') {
            index$713 += 3;
            return {
                type: Token$702.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$911,
                    index$713
                ]
            };
        }
        if (ch1$914 === '<' && ch2$915 === '<' && ch3$916 === '=') {
            index$713 += 3;
            return {
                type: Token$702.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$911,
                    index$713
                ]
            };
        }
        if (ch1$914 === '>' && ch2$915 === '>' && ch3$916 === '=') {
            index$713 += 3;
            return {
                type: Token$702.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$911,
                    index$713
                ]
            };
        }
        if (ch1$914 === '.' && ch2$915 === '.' && ch3$916 === '.') {
            index$713 += 3;
            return {
                type: Token$702.Punctuator,
                value: '...',
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$911,
                    index$713
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$914 === ch2$915 && '+-<>&|'.indexOf(ch1$914) >= 0) {
            index$713 += 2;
            return {
                type: Token$702.Punctuator,
                value: ch1$914 + ch2$915,
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$911,
                    index$713
                ]
            };
        }
        if (ch1$914 === '=' && ch2$915 === '>') {
            index$713 += 2;
            return {
                type: Token$702.Punctuator,
                value: '=>',
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$911,
                    index$713
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$914) >= 0) {
            ++index$713;
            return {
                type: Token$702.Punctuator,
                value: ch1$914,
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$911,
                    index$713
                ]
            };
        }
        if (ch1$914 === '.') {
            ++index$713;
            return {
                type: Token$702.Punctuator,
                value: ch1$914,
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$911,
                    index$713
                ]
            };
        }
        throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$748(start$918) {
        var number$919 = '';
        while (index$713 < length$720) {
            if (!isHexDigit$731(source$711[index$713])) {
                break;
            }
            number$919 += source$711[index$713++];
        }
        if (number$919.length === 0) {
            throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$735(source$711.charCodeAt(index$713))) {
            throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$702.NumericLiteral,
            value: parseInt('0x' + number$919, 16),
            lineNumber: lineNumber$714,
            lineStart: lineStart$715,
            range: [
                start$918,
                index$713
            ]
        };
    }
    function scanOctalLiteral$749(prefix$920, start$921) {
        var number$922, octal$923;
        if (isOctalDigit$732(prefix$920)) {
            octal$923 = true;
            number$922 = '0' + source$711[index$713++];
        } else {
            octal$923 = false;
            ++index$713;
            number$922 = '';
        }
        while (index$713 < length$720) {
            if (!isOctalDigit$732(source$711[index$713])) {
                break;
            }
            number$922 += source$711[index$713++];
        }
        if (!octal$923 && number$922.length === 0) {
            // only 0o or 0O
            throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$735(source$711.charCodeAt(index$713)) || isDecimalDigit$730(source$711.charCodeAt(index$713))) {
            throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$702.NumericLiteral,
            value: parseInt(number$922, 8),
            octal: octal$923,
            lineNumber: lineNumber$714,
            lineStart: lineStart$715,
            range: [
                start$921,
                index$713
            ]
        };
    }
    function scanNumericLiteral$750() {
        var number$924, start$925, ch$926, octal$927;
        ch$926 = source$711[index$713];
        assert$728(isDecimalDigit$730(ch$926.charCodeAt(0)) || ch$926 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$925 = index$713;
        number$924 = '';
        if (ch$926 !== '.') {
            number$924 = source$711[index$713++];
            ch$926 = source$711[index$713];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$924 === '0') {
                if (ch$926 === 'x' || ch$926 === 'X') {
                    ++index$713;
                    return scanHexLiteral$748(start$925);
                }
                if (ch$926 === 'b' || ch$926 === 'B') {
                    ++index$713;
                    number$924 = '';
                    while (index$713 < length$720) {
                        ch$926 = source$711[index$713];
                        if (ch$926 !== '0' && ch$926 !== '1') {
                            break;
                        }
                        number$924 += source$711[index$713++];
                    }
                    if (number$924.length === 0) {
                        // only 0b or 0B
                        throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$713 < length$720) {
                        ch$926 = source$711.charCodeAt(index$713);
                        if (isIdentifierStart$735(ch$926) || isDecimalDigit$730(ch$926)) {
                            throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$702.NumericLiteral,
                        value: parseInt(number$924, 2),
                        lineNumber: lineNumber$714,
                        lineStart: lineStart$715,
                        range: [
                            start$925,
                            index$713
                        ]
                    };
                }
                if (ch$926 === 'o' || ch$926 === 'O' || isOctalDigit$732(ch$926)) {
                    return scanOctalLiteral$749(ch$926, start$925);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$926 && isDecimalDigit$730(ch$926.charCodeAt(0))) {
                    throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$730(source$711.charCodeAt(index$713))) {
                number$924 += source$711[index$713++];
            }
            ch$926 = source$711[index$713];
        }
        if (ch$926 === '.') {
            number$924 += source$711[index$713++];
            while (isDecimalDigit$730(source$711.charCodeAt(index$713))) {
                number$924 += source$711[index$713++];
            }
            ch$926 = source$711[index$713];
        }
        if (ch$926 === 'e' || ch$926 === 'E') {
            number$924 += source$711[index$713++];
            ch$926 = source$711[index$713];
            if (ch$926 === '+' || ch$926 === '-') {
                number$924 += source$711[index$713++];
            }
            if (isDecimalDigit$730(source$711.charCodeAt(index$713))) {
                while (isDecimalDigit$730(source$711.charCodeAt(index$713))) {
                    number$924 += source$711[index$713++];
                }
            } else {
                throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$735(source$711.charCodeAt(index$713))) {
            throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$702.NumericLiteral,
            value: parseFloat(number$924),
            lineNumber: lineNumber$714,
            lineStart: lineStart$715,
            range: [
                start$925,
                index$713
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$751() {
        var str$928 = '', quote$929, start$930, ch$931, code$932, unescaped$933, restore$934, octal$935 = false;
        quote$929 = source$711[index$713];
        assert$728(quote$929 === '\'' || quote$929 === '"', 'String literal must starts with a quote');
        start$930 = index$713;
        ++index$713;
        while (index$713 < length$720) {
            ch$931 = source$711[index$713++];
            if (ch$931 === quote$929) {
                quote$929 = '';
                break;
            } else if (ch$931 === '\\') {
                ch$931 = source$711[index$713++];
                if (!ch$931 || !isLineTerminator$734(ch$931.charCodeAt(0))) {
                    switch (ch$931) {
                    case 'n':
                        str$928 += '\n';
                        break;
                    case 'r':
                        str$928 += '\r';
                        break;
                    case 't':
                        str$928 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$711[index$713] === '{') {
                            ++index$713;
                            str$928 += scanUnicodeCodePointEscape$743();
                        } else {
                            restore$934 = index$713;
                            unescaped$933 = scanHexEscape$742(ch$931);
                            if (unescaped$933) {
                                str$928 += unescaped$933;
                            } else {
                                index$713 = restore$934;
                                str$928 += ch$931;
                            }
                        }
                        break;
                    case 'b':
                        str$928 += '\b';
                        break;
                    case 'f':
                        str$928 += '\f';
                        break;
                    case 'v':
                        str$928 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$732(ch$931)) {
                            code$932 = '01234567'.indexOf(ch$931);
                            // \0 is not octal escape sequence
                            if (code$932 !== 0) {
                                octal$935 = true;
                            }
                            if (index$713 < length$720 && isOctalDigit$732(source$711[index$713])) {
                                octal$935 = true;
                                code$932 = code$932 * 8 + '01234567'.indexOf(source$711[index$713++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$931) >= 0 && index$713 < length$720 && isOctalDigit$732(source$711[index$713])) {
                                    code$932 = code$932 * 8 + '01234567'.indexOf(source$711[index$713++]);
                                }
                            }
                            str$928 += String.fromCharCode(code$932);
                        } else {
                            str$928 += ch$931;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$714;
                    if (ch$931 === '\r' && source$711[index$713] === '\n') {
                        ++index$713;
                    }
                }
            } else if (isLineTerminator$734(ch$931.charCodeAt(0))) {
                break;
            } else {
                str$928 += ch$931;
            }
        }
        if (quote$929 !== '') {
            throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$702.StringLiteral,
            value: str$928,
            octal: octal$935,
            lineNumber: lineNumber$714,
            lineStart: lineStart$715,
            range: [
                start$930,
                index$713
            ]
        };
    }
    function scanTemplate$752() {
        var cooked$936 = '', ch$937, start$938, terminated$939, tail$940, restore$941, unescaped$942, code$943, octal$944;
        terminated$939 = false;
        tail$940 = false;
        start$938 = index$713;
        ++index$713;
        while (index$713 < length$720) {
            ch$937 = source$711[index$713++];
            if (ch$937 === '`') {
                tail$940 = true;
                terminated$939 = true;
                break;
            } else if (ch$937 === '$') {
                if (source$711[index$713] === '{') {
                    ++index$713;
                    terminated$939 = true;
                    break;
                }
                cooked$936 += ch$937;
            } else if (ch$937 === '\\') {
                ch$937 = source$711[index$713++];
                if (!isLineTerminator$734(ch$937.charCodeAt(0))) {
                    switch (ch$937) {
                    case 'n':
                        cooked$936 += '\n';
                        break;
                    case 'r':
                        cooked$936 += '\r';
                        break;
                    case 't':
                        cooked$936 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$711[index$713] === '{') {
                            ++index$713;
                            cooked$936 += scanUnicodeCodePointEscape$743();
                        } else {
                            restore$941 = index$713;
                            unescaped$942 = scanHexEscape$742(ch$937);
                            if (unescaped$942) {
                                cooked$936 += unescaped$942;
                            } else {
                                index$713 = restore$941;
                                cooked$936 += ch$937;
                            }
                        }
                        break;
                    case 'b':
                        cooked$936 += '\b';
                        break;
                    case 'f':
                        cooked$936 += '\f';
                        break;
                    case 'v':
                        cooked$936 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$732(ch$937)) {
                            code$943 = '01234567'.indexOf(ch$937);
                            // \0 is not octal escape sequence
                            if (code$943 !== 0) {
                                octal$944 = true;
                            }
                            if (index$713 < length$720 && isOctalDigit$732(source$711[index$713])) {
                                octal$944 = true;
                                code$943 = code$943 * 8 + '01234567'.indexOf(source$711[index$713++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$937) >= 0 && index$713 < length$720 && isOctalDigit$732(source$711[index$713])) {
                                    code$943 = code$943 * 8 + '01234567'.indexOf(source$711[index$713++]);
                                }
                            }
                            cooked$936 += String.fromCharCode(code$943);
                        } else {
                            cooked$936 += ch$937;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$714;
                    if (ch$937 === '\r' && source$711[index$713] === '\n') {
                        ++index$713;
                    }
                }
            } else if (isLineTerminator$734(ch$937.charCodeAt(0))) {
                ++lineNumber$714;
                if (ch$937 === '\r' && source$711[index$713] === '\n') {
                    ++index$713;
                }
                cooked$936 += '\n';
            } else {
                cooked$936 += ch$937;
            }
        }
        if (!terminated$939) {
            throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$702.Template,
            value: {
                cooked: cooked$936,
                raw: source$711.slice(start$938 + 1, index$713 - (tail$940 ? 1 : 2))
            },
            tail: tail$940,
            octal: octal$944,
            lineNumber: lineNumber$714,
            lineStart: lineStart$715,
            range: [
                start$938,
                index$713
            ]
        };
    }
    function scanTemplateElement$753(option$945) {
        var startsWith$946, template$947;
        lookahead$724 = null;
        skipComment$741();
        startsWith$946 = option$945.head ? '`' : '}';
        if (source$711[index$713] !== startsWith$946) {
            throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
        }
        template$947 = scanTemplate$752();
        peek$759();
        return template$947;
    }
    function scanRegExp$754() {
        var str$948, ch$949, start$950, pattern$951, flags$952, value$953, classMarker$954 = false, restore$955, terminated$956 = false;
        lookahead$724 = null;
        skipComment$741();
        start$950 = index$713;
        ch$949 = source$711[index$713];
        assert$728(ch$949 === '/', 'Regular expression literal must start with a slash');
        str$948 = source$711[index$713++];
        while (index$713 < length$720) {
            ch$949 = source$711[index$713++];
            str$948 += ch$949;
            if (classMarker$954) {
                if (ch$949 === ']') {
                    classMarker$954 = false;
                }
            } else {
                if (ch$949 === '\\') {
                    ch$949 = source$711[index$713++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$734(ch$949.charCodeAt(0))) {
                        throwError$762({}, Messages$707.UnterminatedRegExp);
                    }
                    str$948 += ch$949;
                } else if (ch$949 === '/') {
                    terminated$956 = true;
                    break;
                } else if (ch$949 === '[') {
                    classMarker$954 = true;
                } else if (isLineTerminator$734(ch$949.charCodeAt(0))) {
                    throwError$762({}, Messages$707.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$956) {
            throwError$762({}, Messages$707.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$951 = str$948.substr(1, str$948.length - 2);
        flags$952 = '';
        while (index$713 < length$720) {
            ch$949 = source$711[index$713];
            if (!isIdentifierPart$736(ch$949.charCodeAt(0))) {
                break;
            }
            ++index$713;
            if (ch$949 === '\\' && index$713 < length$720) {
                ch$949 = source$711[index$713];
                if (ch$949 === 'u') {
                    ++index$713;
                    restore$955 = index$713;
                    ch$949 = scanHexEscape$742('u');
                    if (ch$949) {
                        flags$952 += ch$949;
                        for (str$948 += '\\u'; restore$955 < index$713; ++restore$955) {
                            str$948 += source$711[restore$955];
                        }
                    } else {
                        index$713 = restore$955;
                        flags$952 += 'u';
                        str$948 += '\\u';
                    }
                } else {
                    str$948 += '\\';
                }
            } else {
                flags$952 += ch$949;
                str$948 += ch$949;
            }
        }
        try {
            value$953 = new RegExp(pattern$951, flags$952);
        } catch (e$957) {
            throwError$762({}, Messages$707.InvalidRegExp);
        }
        // peek();
        if (extra$727.tokenize) {
            return {
                type: Token$702.RegularExpression,
                value: value$953,
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    start$950,
                    index$713
                ]
            };
        }
        return {
            type: Token$702.RegularExpression,
            literal: str$948,
            value: value$953,
            range: [
                start$950,
                index$713
            ]
        };
    }
    function isIdentifierName$755(token$958) {
        return token$958.type === Token$702.Identifier || token$958.type === Token$702.Keyword || token$958.type === Token$702.BooleanLiteral || token$958.type === Token$702.NullLiteral;
    }
    function advanceSlash$756() {
        var prevToken$959, checkToken$960;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$959 = extra$727.tokens[extra$727.tokens.length - 1];
        if (!prevToken$959) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$754();
        }
        if (prevToken$959.type === 'Punctuator') {
            if (prevToken$959.value === ')') {
                checkToken$960 = extra$727.tokens[extra$727.openParenToken - 1];
                if (checkToken$960 && checkToken$960.type === 'Keyword' && (checkToken$960.value === 'if' || checkToken$960.value === 'while' || checkToken$960.value === 'for' || checkToken$960.value === 'with')) {
                    return scanRegExp$754();
                }
                return scanPunctuator$747();
            }
            if (prevToken$959.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$727.tokens[extra$727.openCurlyToken - 3] && extra$727.tokens[extra$727.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$960 = extra$727.tokens[extra$727.openCurlyToken - 4];
                    if (!checkToken$960) {
                        return scanPunctuator$747();
                    }
                } else if (extra$727.tokens[extra$727.openCurlyToken - 4] && extra$727.tokens[extra$727.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$960 = extra$727.tokens[extra$727.openCurlyToken - 5];
                    if (!checkToken$960) {
                        return scanRegExp$754();
                    }
                } else {
                    return scanPunctuator$747();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$704.indexOf(checkToken$960.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$747();
                }
                // It is a declaration.
                return scanRegExp$754();
            }
            return scanRegExp$754();
        }
        if (prevToken$959.type === 'Keyword') {
            return scanRegExp$754();
        }
        return scanPunctuator$747();
    }
    function advance$757() {
        var ch$961;
        skipComment$741();
        if (index$713 >= length$720) {
            return {
                type: Token$702.EOF,
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    index$713,
                    index$713
                ]
            };
        }
        ch$961 = source$711.charCodeAt(index$713);
        // Very common: ( and ) and ;
        if (ch$961 === 40 || ch$961 === 41 || ch$961 === 58) {
            return scanPunctuator$747();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$961 === 39 || ch$961 === 34) {
            return scanStringLiteral$751();
        }
        if (ch$961 === 96) {
            return scanTemplate$752();
        }
        if (isIdentifierStart$735(ch$961)) {
            return scanIdentifier$746();
        }
        // # and @ are allowed for sweet.js
        if (ch$961 === 35 || ch$961 === 64) {
            ++index$713;
            return {
                type: Token$702.Punctuator,
                value: String.fromCharCode(ch$961),
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    index$713 - 1,
                    index$713
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$961 === 46) {
            if (isDecimalDigit$730(source$711.charCodeAt(index$713 + 1))) {
                return scanNumericLiteral$750();
            }
            return scanPunctuator$747();
        }
        if (isDecimalDigit$730(ch$961)) {
            return scanNumericLiteral$750();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$727.tokenize && ch$961 === 47) {
            return advanceSlash$756();
        }
        return scanPunctuator$747();
    }
    function lex$758() {
        var token$962;
        token$962 = lookahead$724;
        streamIndex$723 = lookaheadIndex$725;
        lineNumber$714 = token$962.lineNumber;
        lineStart$715 = token$962.lineStart;
        sm_lineNumber$716 = lookahead$724.sm_lineNumber;
        sm_lineStart$717 = lookahead$724.sm_lineStart;
        sm_range$718 = lookahead$724.sm_range;
        sm_index$719 = lookahead$724.sm_range[0];
        lookahead$724 = tokenStream$722[++streamIndex$723].token;
        lookaheadIndex$725 = streamIndex$723;
        index$713 = lookahead$724.range[0];
        return token$962;
    }
    function peek$759() {
        lookaheadIndex$725 = streamIndex$723 + 1;
        if (lookaheadIndex$725 >= length$720) {
            lookahead$724 = {
                type: Token$702.EOF,
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    index$713,
                    index$713
                ]
            };
            return;
        }
        lookahead$724 = tokenStream$722[lookaheadIndex$725].token;
        index$713 = lookahead$724.range[0];
    }
    function lookahead2$760() {
        var adv$963, pos$964, line$965, start$966, result$967;
        if (streamIndex$723 + 1 >= length$720 || streamIndex$723 + 2 >= length$720) {
            return {
                type: Token$702.EOF,
                lineNumber: lineNumber$714,
                lineStart: lineStart$715,
                range: [
                    index$713,
                    index$713
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$724 === null) {
            lookaheadIndex$725 = streamIndex$723 + 1;
            lookahead$724 = tokenStream$722[lookaheadIndex$725].token;
            index$713 = lookahead$724.range[0];
        }
        result$967 = tokenStream$722[lookaheadIndex$725 + 1].token;
        return result$967;
    }
    SyntaxTreeDelegate$709 = {
        name: 'SyntaxTree',
        postProcess: function (node$968) {
            return node$968;
        },
        createArrayExpression: function (elements$969) {
            return {
                type: Syntax$705.ArrayExpression,
                elements: elements$969
            };
        },
        createAssignmentExpression: function (operator$970, left$971, right$972) {
            return {
                type: Syntax$705.AssignmentExpression,
                operator: operator$970,
                left: left$971,
                right: right$972
            };
        },
        createBinaryExpression: function (operator$973, left$974, right$975) {
            var type$976 = operator$973 === '||' || operator$973 === '&&' ? Syntax$705.LogicalExpression : Syntax$705.BinaryExpression;
            return {
                type: type$976,
                operator: operator$973,
                left: left$974,
                right: right$975
            };
        },
        createBlockStatement: function (body$977) {
            return {
                type: Syntax$705.BlockStatement,
                body: body$977
            };
        },
        createBreakStatement: function (label$978) {
            return {
                type: Syntax$705.BreakStatement,
                label: label$978
            };
        },
        createCallExpression: function (callee$979, args$980) {
            return {
                type: Syntax$705.CallExpression,
                callee: callee$979,
                'arguments': args$980
            };
        },
        createCatchClause: function (param$981, body$982) {
            return {
                type: Syntax$705.CatchClause,
                param: param$981,
                body: body$982
            };
        },
        createConditionalExpression: function (test$983, consequent$984, alternate$985) {
            return {
                type: Syntax$705.ConditionalExpression,
                test: test$983,
                consequent: consequent$984,
                alternate: alternate$985
            };
        },
        createContinueStatement: function (label$986) {
            return {
                type: Syntax$705.ContinueStatement,
                label: label$986
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$705.DebuggerStatement };
        },
        createDoWhileStatement: function (body$987, test$988) {
            return {
                type: Syntax$705.DoWhileStatement,
                body: body$987,
                test: test$988
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$705.EmptyStatement };
        },
        createExpressionStatement: function (expression$989) {
            return {
                type: Syntax$705.ExpressionStatement,
                expression: expression$989
            };
        },
        createForStatement: function (init$990, test$991, update$992, body$993) {
            return {
                type: Syntax$705.ForStatement,
                init: init$990,
                test: test$991,
                update: update$992,
                body: body$993
            };
        },
        createForInStatement: function (left$994, right$995, body$996) {
            return {
                type: Syntax$705.ForInStatement,
                left: left$994,
                right: right$995,
                body: body$996,
                each: false
            };
        },
        createForOfStatement: function (left$997, right$998, body$999) {
            return {
                type: Syntax$705.ForOfStatement,
                left: left$997,
                right: right$998,
                body: body$999
            };
        },
        createFunctionDeclaration: function (id$1000, params$1001, defaults$1002, body$1003, rest$1004, generator$1005, expression$1006) {
            return {
                type: Syntax$705.FunctionDeclaration,
                id: id$1000,
                params: params$1001,
                defaults: defaults$1002,
                body: body$1003,
                rest: rest$1004,
                generator: generator$1005,
                expression: expression$1006
            };
        },
        createFunctionExpression: function (id$1007, params$1008, defaults$1009, body$1010, rest$1011, generator$1012, expression$1013) {
            return {
                type: Syntax$705.FunctionExpression,
                id: id$1007,
                params: params$1008,
                defaults: defaults$1009,
                body: body$1010,
                rest: rest$1011,
                generator: generator$1012,
                expression: expression$1013
            };
        },
        createIdentifier: function (name$1014) {
            return {
                type: Syntax$705.Identifier,
                name: name$1014
            };
        },
        createIfStatement: function (test$1015, consequent$1016, alternate$1017) {
            return {
                type: Syntax$705.IfStatement,
                test: test$1015,
                consequent: consequent$1016,
                alternate: alternate$1017
            };
        },
        createLabeledStatement: function (label$1018, body$1019) {
            return {
                type: Syntax$705.LabeledStatement,
                label: label$1018,
                body: body$1019
            };
        },
        createLiteral: function (token$1020) {
            return {
                type: Syntax$705.Literal,
                value: token$1020.value,
                raw: String(token$1020.value)
            };
        },
        createMemberExpression: function (accessor$1021, object$1022, property$1023) {
            return {
                type: Syntax$705.MemberExpression,
                computed: accessor$1021 === '[',
                object: object$1022,
                property: property$1023
            };
        },
        createNewExpression: function (callee$1024, args$1025) {
            return {
                type: Syntax$705.NewExpression,
                callee: callee$1024,
                'arguments': args$1025
            };
        },
        createObjectExpression: function (properties$1026) {
            return {
                type: Syntax$705.ObjectExpression,
                properties: properties$1026
            };
        },
        createPostfixExpression: function (operator$1027, argument$1028) {
            return {
                type: Syntax$705.UpdateExpression,
                operator: operator$1027,
                argument: argument$1028,
                prefix: false
            };
        },
        createProgram: function (body$1029) {
            return {
                type: Syntax$705.Program,
                body: body$1029
            };
        },
        createProperty: function (kind$1030, key$1031, value$1032, method$1033, shorthand$1034) {
            return {
                type: Syntax$705.Property,
                key: key$1031,
                value: value$1032,
                kind: kind$1030,
                method: method$1033,
                shorthand: shorthand$1034
            };
        },
        createReturnStatement: function (argument$1035) {
            return {
                type: Syntax$705.ReturnStatement,
                argument: argument$1035
            };
        },
        createSequenceExpression: function (expressions$1036) {
            return {
                type: Syntax$705.SequenceExpression,
                expressions: expressions$1036
            };
        },
        createSwitchCase: function (test$1037, consequent$1038) {
            return {
                type: Syntax$705.SwitchCase,
                test: test$1037,
                consequent: consequent$1038
            };
        },
        createSwitchStatement: function (discriminant$1039, cases$1040) {
            return {
                type: Syntax$705.SwitchStatement,
                discriminant: discriminant$1039,
                cases: cases$1040
            };
        },
        createThisExpression: function () {
            return { type: Syntax$705.ThisExpression };
        },
        createThrowStatement: function (argument$1041) {
            return {
                type: Syntax$705.ThrowStatement,
                argument: argument$1041
            };
        },
        createTryStatement: function (block$1042, guardedHandlers$1043, handlers$1044, finalizer$1045) {
            return {
                type: Syntax$705.TryStatement,
                block: block$1042,
                guardedHandlers: guardedHandlers$1043,
                handlers: handlers$1044,
                finalizer: finalizer$1045
            };
        },
        createUnaryExpression: function (operator$1046, argument$1047) {
            if (operator$1046 === '++' || operator$1046 === '--') {
                return {
                    type: Syntax$705.UpdateExpression,
                    operator: operator$1046,
                    argument: argument$1047,
                    prefix: true
                };
            }
            return {
                type: Syntax$705.UnaryExpression,
                operator: operator$1046,
                argument: argument$1047
            };
        },
        createVariableDeclaration: function (declarations$1048, kind$1049) {
            return {
                type: Syntax$705.VariableDeclaration,
                declarations: declarations$1048,
                kind: kind$1049
            };
        },
        createVariableDeclarator: function (id$1050, init$1051) {
            return {
                type: Syntax$705.VariableDeclarator,
                id: id$1050,
                init: init$1051
            };
        },
        createWhileStatement: function (test$1052, body$1053) {
            return {
                type: Syntax$705.WhileStatement,
                test: test$1052,
                body: body$1053
            };
        },
        createWithStatement: function (object$1054, body$1055) {
            return {
                type: Syntax$705.WithStatement,
                object: object$1054,
                body: body$1055
            };
        },
        createTemplateElement: function (value$1056, tail$1057) {
            return {
                type: Syntax$705.TemplateElement,
                value: value$1056,
                tail: tail$1057
            };
        },
        createTemplateLiteral: function (quasis$1058, expressions$1059) {
            return {
                type: Syntax$705.TemplateLiteral,
                quasis: quasis$1058,
                expressions: expressions$1059
            };
        },
        createSpreadElement: function (argument$1060) {
            return {
                type: Syntax$705.SpreadElement,
                argument: argument$1060
            };
        },
        createTaggedTemplateExpression: function (tag$1061, quasi$1062) {
            return {
                type: Syntax$705.TaggedTemplateExpression,
                tag: tag$1061,
                quasi: quasi$1062
            };
        },
        createArrowFunctionExpression: function (params$1063, defaults$1064, body$1065, rest$1066, expression$1067) {
            return {
                type: Syntax$705.ArrowFunctionExpression,
                id: null,
                params: params$1063,
                defaults: defaults$1064,
                body: body$1065,
                rest: rest$1066,
                generator: false,
                expression: expression$1067
            };
        },
        createMethodDefinition: function (propertyType$1068, kind$1069, key$1070, value$1071) {
            return {
                type: Syntax$705.MethodDefinition,
                key: key$1070,
                value: value$1071,
                kind: kind$1069,
                'static': propertyType$1068 === ClassPropertyType$710.static
            };
        },
        createClassBody: function (body$1072) {
            return {
                type: Syntax$705.ClassBody,
                body: body$1072
            };
        },
        createClassExpression: function (id$1073, superClass$1074, body$1075) {
            return {
                type: Syntax$705.ClassExpression,
                id: id$1073,
                superClass: superClass$1074,
                body: body$1075
            };
        },
        createClassDeclaration: function (id$1076, superClass$1077, body$1078) {
            return {
                type: Syntax$705.ClassDeclaration,
                id: id$1076,
                superClass: superClass$1077,
                body: body$1078
            };
        },
        createExportSpecifier: function (id$1079, name$1080) {
            return {
                type: Syntax$705.ExportSpecifier,
                id: id$1079,
                name: name$1080
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$705.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1081, specifiers$1082, source$1083) {
            return {
                type: Syntax$705.ExportDeclaration,
                declaration: declaration$1081,
                specifiers: specifiers$1082,
                source: source$1083
            };
        },
        createImportSpecifier: function (id$1084, name$1085) {
            return {
                type: Syntax$705.ImportSpecifier,
                id: id$1084,
                name: name$1085
            };
        },
        createImportDeclaration: function (specifiers$1086, kind$1087, source$1088) {
            return {
                type: Syntax$705.ImportDeclaration,
                specifiers: specifiers$1086,
                kind: kind$1087,
                source: source$1088
            };
        },
        createYieldExpression: function (argument$1089, delegate$1090) {
            return {
                type: Syntax$705.YieldExpression,
                argument: argument$1089,
                delegate: delegate$1090
            };
        },
        createModuleDeclaration: function (id$1091, source$1092, body$1093) {
            return {
                type: Syntax$705.ModuleDeclaration,
                id: id$1091,
                source: source$1092,
                body: body$1093
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$761() {
        return lookahead$724.lineNumber !== lineNumber$714;
    }
    // Throw an exception
    function throwError$762(token$1094, messageFormat$1095) {
        var error$1096, args$1097 = Array.prototype.slice.call(arguments, 2), msg$1098 = messageFormat$1095.replace(/%(\d)/g, function (whole$1099, index$1100) {
                assert$728(index$1100 < args$1097.length, 'Message reference must be in range');
                return args$1097[index$1100];
            });
        if (typeof token$1094.lineNumber === 'number') {
            error$1096 = new Error('Line ' + token$1094.lineNumber + ': ' + msg$1098);
            error$1096.index = token$1094.range[0];
            error$1096.lineNumber = token$1094.lineNumber;
            error$1096.column = token$1094.range[0] - lineStart$715 + 1;
        } else {
            error$1096 = new Error('Line ' + lineNumber$714 + ': ' + msg$1098);
            error$1096.index = index$713;
            error$1096.lineNumber = lineNumber$714;
            error$1096.column = index$713 - lineStart$715 + 1;
        }
        error$1096.description = msg$1098;
        throw error$1096;
    }
    function throwErrorTolerant$763() {
        try {
            throwError$762.apply(null, arguments);
        } catch (e$1101) {
            if (extra$727.errors) {
                extra$727.errors.push(e$1101);
            } else {
                throw e$1101;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$764(token$1102) {
        if (token$1102.type === Token$702.EOF) {
            throwError$762(token$1102, Messages$707.UnexpectedEOS);
        }
        if (token$1102.type === Token$702.NumericLiteral) {
            throwError$762(token$1102, Messages$707.UnexpectedNumber);
        }
        if (token$1102.type === Token$702.StringLiteral) {
            throwError$762(token$1102, Messages$707.UnexpectedString);
        }
        if (token$1102.type === Token$702.Identifier) {
            throwError$762(token$1102, Messages$707.UnexpectedIdentifier);
        }
        if (token$1102.type === Token$702.Keyword) {
            if (isFutureReservedWord$737(token$1102.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$712 && isStrictModeReservedWord$738(token$1102.value)) {
                throwErrorTolerant$763(token$1102, Messages$707.StrictReservedWord);
                return;
            }
            throwError$762(token$1102, Messages$707.UnexpectedToken, token$1102.value);
        }
        if (token$1102.type === Token$702.Template) {
            throwError$762(token$1102, Messages$707.UnexpectedTemplate, token$1102.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$762(token$1102, Messages$707.UnexpectedToken, token$1102.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$765(value$1103) {
        var token$1104 = lex$758();
        if (token$1104.type !== Token$702.Punctuator || token$1104.value !== value$1103) {
            throwUnexpected$764(token$1104);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$766(keyword$1105) {
        var token$1106 = lex$758();
        if (token$1106.type !== Token$702.Keyword || token$1106.value !== keyword$1105) {
            throwUnexpected$764(token$1106);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$767(value$1107) {
        return lookahead$724.type === Token$702.Punctuator && lookahead$724.value === value$1107;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$768(keyword$1108) {
        return lookahead$724.type === Token$702.Keyword && lookahead$724.value === keyword$1108;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$769(keyword$1109) {
        return lookahead$724.type === Token$702.Identifier && lookahead$724.value === keyword$1109;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$770() {
        var op$1110;
        if (lookahead$724.type !== Token$702.Punctuator) {
            return false;
        }
        op$1110 = lookahead$724.value;
        return op$1110 === '=' || op$1110 === '*=' || op$1110 === '/=' || op$1110 === '%=' || op$1110 === '+=' || op$1110 === '-=' || op$1110 === '<<=' || op$1110 === '>>=' || op$1110 === '>>>=' || op$1110 === '&=' || op$1110 === '^=' || op$1110 === '|=';
    }
    function consumeSemicolon$771() {
        var line$1111, ch$1112;
        ch$1112 = lookahead$724.value ? lookahead$724.value.charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1112 === 59) {
            lex$758();
            return;
        }
        if (lookahead$724.lineNumber !== lineNumber$714) {
            return;
        }
        if (match$767(';')) {
            lex$758();
            return;
        }
        if (lookahead$724.type !== Token$702.EOF && !match$767('}')) {
            throwUnexpected$764(lookahead$724);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$772(expr$1113) {
        return expr$1113.type === Syntax$705.Identifier || expr$1113.type === Syntax$705.MemberExpression;
    }
    function isAssignableLeftHandSide$773(expr$1114) {
        return isLeftHandSide$772(expr$1114) || expr$1114.type === Syntax$705.ObjectPattern || expr$1114.type === Syntax$705.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$774() {
        var elements$1115 = [], blocks$1116 = [], filter$1117 = null, tmp$1118, possiblecomprehension$1119 = true, body$1120;
        expect$765('[');
        while (!match$767(']')) {
            if (lookahead$724.value === 'for' && lookahead$724.type === Token$702.Keyword) {
                if (!possiblecomprehension$1119) {
                    throwError$762({}, Messages$707.ComprehensionError);
                }
                matchKeyword$768('for');
                tmp$1118 = parseForStatement$822({ ignoreBody: true });
                tmp$1118.of = tmp$1118.type === Syntax$705.ForOfStatement;
                tmp$1118.type = Syntax$705.ComprehensionBlock;
                if (tmp$1118.left.kind) {
                    // can't be let or const
                    throwError$762({}, Messages$707.ComprehensionError);
                }
                blocks$1116.push(tmp$1118);
            } else if (lookahead$724.value === 'if' && lookahead$724.type === Token$702.Keyword) {
                if (!possiblecomprehension$1119) {
                    throwError$762({}, Messages$707.ComprehensionError);
                }
                expectKeyword$766('if');
                expect$765('(');
                filter$1117 = parseExpression$802();
                expect$765(')');
            } else if (lookahead$724.value === ',' && lookahead$724.type === Token$702.Punctuator) {
                possiblecomprehension$1119 = false;
                // no longer allowed.
                lex$758();
                elements$1115.push(null);
            } else {
                tmp$1118 = parseSpreadOrAssignmentExpression$785();
                elements$1115.push(tmp$1118);
                if (tmp$1118 && tmp$1118.type === Syntax$705.SpreadElement) {
                    if (!match$767(']')) {
                        throwError$762({}, Messages$707.ElementAfterSpreadElement);
                    }
                } else if (!(match$767(']') || matchKeyword$768('for') || matchKeyword$768('if'))) {
                    expect$765(',');
                    // this lexes.
                    possiblecomprehension$1119 = false;
                }
            }
        }
        expect$765(']');
        if (filter$1117 && !blocks$1116.length) {
            throwError$762({}, Messages$707.ComprehensionRequiresBlock);
        }
        if (blocks$1116.length) {
            if (elements$1115.length !== 1) {
                throwError$762({}, Messages$707.ComprehensionError);
            }
            return {
                type: Syntax$705.ComprehensionExpression,
                filter: filter$1117,
                blocks: blocks$1116,
                body: elements$1115[0]
            };
        }
        return delegate$721.createArrayExpression(elements$1115);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$775(options$1121) {
        var previousStrict$1122, previousYieldAllowed$1123, params$1124, defaults$1125, body$1126;
        previousStrict$1122 = strict$712;
        previousYieldAllowed$1123 = state$726.yieldAllowed;
        state$726.yieldAllowed = options$1121.generator;
        params$1124 = options$1121.params || [];
        defaults$1125 = options$1121.defaults || [];
        body$1126 = parseConciseBody$834();
        if (options$1121.name && strict$712 && isRestrictedWord$739(params$1124[0].name)) {
            throwErrorTolerant$763(options$1121.name, Messages$707.StrictParamName);
        }
        if (state$726.yieldAllowed && !state$726.yieldFound) {
            throwErrorTolerant$763({}, Messages$707.NoYieldInGenerator);
        }
        strict$712 = previousStrict$1122;
        state$726.yieldAllowed = previousYieldAllowed$1123;
        return delegate$721.createFunctionExpression(null, params$1124, defaults$1125, body$1126, options$1121.rest || null, options$1121.generator, body$1126.type !== Syntax$705.BlockStatement);
    }
    function parsePropertyMethodFunction$776(options$1127) {
        var previousStrict$1128, tmp$1129, method$1130;
        previousStrict$1128 = strict$712;
        strict$712 = true;
        tmp$1129 = parseParams$838();
        if (tmp$1129.stricted) {
            throwErrorTolerant$763(tmp$1129.stricted, tmp$1129.message);
        }
        method$1130 = parsePropertyFunction$775({
            params: tmp$1129.params,
            defaults: tmp$1129.defaults,
            rest: tmp$1129.rest,
            generator: options$1127.generator
        });
        strict$712 = previousStrict$1128;
        return method$1130;
    }
    function parseObjectPropertyKey$777() {
        var token$1131 = lex$758();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1131.type === Token$702.StringLiteral || token$1131.type === Token$702.NumericLiteral) {
            if (strict$712 && token$1131.octal) {
                throwErrorTolerant$763(token$1131, Messages$707.StrictOctalLiteral);
            }
            return delegate$721.createLiteral(token$1131);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$721.createIdentifier(token$1131.value);
    }
    function parseObjectProperty$778() {
        var token$1132, key$1133, id$1134, value$1135, param$1136;
        token$1132 = lookahead$724;
        if (token$1132.type === Token$702.Identifier) {
            id$1134 = parseObjectPropertyKey$777();
            // Property Assignment: Getter and Setter.
            if (token$1132.value === 'get' && !(match$767(':') || match$767('('))) {
                key$1133 = parseObjectPropertyKey$777();
                expect$765('(');
                expect$765(')');
                return delegate$721.createProperty('get', key$1133, parsePropertyFunction$775({ generator: false }), false, false);
            }
            if (token$1132.value === 'set' && !(match$767(':') || match$767('('))) {
                key$1133 = parseObjectPropertyKey$777();
                expect$765('(');
                token$1132 = lookahead$724;
                param$1136 = [parseVariableIdentifier$805()];
                expect$765(')');
                return delegate$721.createProperty('set', key$1133, parsePropertyFunction$775({
                    params: param$1136,
                    generator: false,
                    name: token$1132
                }), false, false);
            }
            if (match$767(':')) {
                lex$758();
                return delegate$721.createProperty('init', id$1134, parseAssignmentExpression$801(), false, false);
            }
            if (match$767('(')) {
                return delegate$721.createProperty('init', id$1134, parsePropertyMethodFunction$776({ generator: false }), true, false);
            }
            return delegate$721.createProperty('init', id$1134, id$1134, false, true);
        }
        if (token$1132.type === Token$702.EOF || token$1132.type === Token$702.Punctuator) {
            if (!match$767('*')) {
                throwUnexpected$764(token$1132);
            }
            lex$758();
            id$1134 = parseObjectPropertyKey$777();
            if (!match$767('(')) {
                throwUnexpected$764(lex$758());
            }
            return delegate$721.createProperty('init', id$1134, parsePropertyMethodFunction$776({ generator: true }), true, false);
        }
        key$1133 = parseObjectPropertyKey$777();
        if (match$767(':')) {
            lex$758();
            return delegate$721.createProperty('init', key$1133, parseAssignmentExpression$801(), false, false);
        }
        if (match$767('(')) {
            return delegate$721.createProperty('init', key$1133, parsePropertyMethodFunction$776({ generator: false }), true, false);
        }
        throwUnexpected$764(lex$758());
    }
    function parseObjectInitialiser$779() {
        var properties$1137 = [], property$1138, name$1139, key$1140, kind$1141, map$1142 = {}, toString$1143 = String;
        expect$765('{');
        while (!match$767('}')) {
            property$1138 = parseObjectProperty$778();
            if (property$1138.key.type === Syntax$705.Identifier) {
                name$1139 = property$1138.key.name;
            } else {
                name$1139 = toString$1143(property$1138.key.value);
            }
            kind$1141 = property$1138.kind === 'init' ? PropertyKind$706.Data : property$1138.kind === 'get' ? PropertyKind$706.Get : PropertyKind$706.Set;
            key$1140 = '$' + name$1139;
            if (Object.prototype.hasOwnProperty.call(map$1142, key$1140)) {
                if (map$1142[key$1140] === PropertyKind$706.Data) {
                    if (strict$712 && kind$1141 === PropertyKind$706.Data) {
                        throwErrorTolerant$763({}, Messages$707.StrictDuplicateProperty);
                    } else if (kind$1141 !== PropertyKind$706.Data) {
                        throwErrorTolerant$763({}, Messages$707.AccessorDataProperty);
                    }
                } else {
                    if (kind$1141 === PropertyKind$706.Data) {
                        throwErrorTolerant$763({}, Messages$707.AccessorDataProperty);
                    } else if (map$1142[key$1140] & kind$1141) {
                        throwErrorTolerant$763({}, Messages$707.AccessorGetSet);
                    }
                }
                map$1142[key$1140] |= kind$1141;
            } else {
                map$1142[key$1140] = kind$1141;
            }
            properties$1137.push(property$1138);
            if (!match$767('}')) {
                expect$765(',');
            }
        }
        expect$765('}');
        return delegate$721.createObjectExpression(properties$1137);
    }
    function parseTemplateElement$780(option$1144) {
        var token$1145 = scanTemplateElement$753(option$1144);
        if (strict$712 && token$1145.octal) {
            throwError$762(token$1145, Messages$707.StrictOctalLiteral);
        }
        return delegate$721.createTemplateElement({
            raw: token$1145.value.raw,
            cooked: token$1145.value.cooked
        }, token$1145.tail);
    }
    function parseTemplateLiteral$781() {
        var quasi$1146, quasis$1147, expressions$1148;
        quasi$1146 = parseTemplateElement$780({ head: true });
        quasis$1147 = [quasi$1146];
        expressions$1148 = [];
        while (!quasi$1146.tail) {
            expressions$1148.push(parseExpression$802());
            quasi$1146 = parseTemplateElement$780({ head: false });
            quasis$1147.push(quasi$1146);
        }
        return delegate$721.createTemplateLiteral(quasis$1147, expressions$1148);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$782() {
        var expr$1149;
        expect$765('(');
        ++state$726.parenthesizedCount;
        expr$1149 = parseExpression$802();
        expect$765(')');
        return expr$1149;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$783() {
        var type$1150, token$1151, resolvedIdent$1152;
        token$1151 = lookahead$724;
        type$1150 = lookahead$724.type;
        if (type$1150 === Token$702.Identifier) {
            resolvedIdent$1152 = expander$701.resolve(tokenStream$722[lookaheadIndex$725]);
            lex$758();
            return delegate$721.createIdentifier(resolvedIdent$1152);
        }
        if (type$1150 === Token$702.StringLiteral || type$1150 === Token$702.NumericLiteral) {
            if (strict$712 && lookahead$724.octal) {
                throwErrorTolerant$763(lookahead$724, Messages$707.StrictOctalLiteral);
            }
            return delegate$721.createLiteral(lex$758());
        }
        if (type$1150 === Token$702.Keyword) {
            if (matchKeyword$768('this')) {
                lex$758();
                return delegate$721.createThisExpression();
            }
            if (matchKeyword$768('function')) {
                return parseFunctionExpression$840();
            }
            if (matchKeyword$768('class')) {
                return parseClassExpression$845();
            }
            if (matchKeyword$768('super')) {
                lex$758();
                return delegate$721.createIdentifier('super');
            }
        }
        if (type$1150 === Token$702.BooleanLiteral) {
            token$1151 = lex$758();
            token$1151.value = token$1151.value === 'true';
            return delegate$721.createLiteral(token$1151);
        }
        if (type$1150 === Token$702.NullLiteral) {
            token$1151 = lex$758();
            token$1151.value = null;
            return delegate$721.createLiteral(token$1151);
        }
        if (match$767('[')) {
            return parseArrayInitialiser$774();
        }
        if (match$767('{')) {
            return parseObjectInitialiser$779();
        }
        if (match$767('(')) {
            return parseGroupExpression$782();
        }
        if (lookahead$724.type === Token$702.RegularExpression) {
            return delegate$721.createLiteral(lex$758());
        }
        if (type$1150 === Token$702.Template) {
            return parseTemplateLiteral$781();
        }
        return throwUnexpected$764(lex$758());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$784() {
        var args$1153 = [], arg$1154;
        expect$765('(');
        if (!match$767(')')) {
            while (streamIndex$723 < length$720) {
                arg$1154 = parseSpreadOrAssignmentExpression$785();
                args$1153.push(arg$1154);
                if (match$767(')')) {
                    break;
                } else if (arg$1154.type === Syntax$705.SpreadElement) {
                    throwError$762({}, Messages$707.ElementAfterSpreadElement);
                }
                expect$765(',');
            }
        }
        expect$765(')');
        return args$1153;
    }
    function parseSpreadOrAssignmentExpression$785() {
        if (match$767('...')) {
            lex$758();
            return delegate$721.createSpreadElement(parseAssignmentExpression$801());
        }
        return parseAssignmentExpression$801();
    }
    function parseNonComputedProperty$786() {
        var token$1155 = lex$758();
        if (!isIdentifierName$755(token$1155)) {
            throwUnexpected$764(token$1155);
        }
        return delegate$721.createIdentifier(token$1155.value);
    }
    function parseNonComputedMember$787() {
        expect$765('.');
        return parseNonComputedProperty$786();
    }
    function parseComputedMember$788() {
        var expr$1156;
        expect$765('[');
        expr$1156 = parseExpression$802();
        expect$765(']');
        return expr$1156;
    }
    function parseNewExpression$789() {
        var callee$1157, args$1158;
        expectKeyword$766('new');
        callee$1157 = parseLeftHandSideExpression$791();
        args$1158 = match$767('(') ? parseArguments$784() : [];
        return delegate$721.createNewExpression(callee$1157, args$1158);
    }
    function parseLeftHandSideExpressionAllowCall$790() {
        var expr$1159, args$1160, property$1161;
        expr$1159 = matchKeyword$768('new') ? parseNewExpression$789() : parsePrimaryExpression$783();
        while (match$767('.') || match$767('[') || match$767('(') || lookahead$724.type === Token$702.Template) {
            if (match$767('(')) {
                args$1160 = parseArguments$784();
                expr$1159 = delegate$721.createCallExpression(expr$1159, args$1160);
            } else if (match$767('[')) {
                expr$1159 = delegate$721.createMemberExpression('[', expr$1159, parseComputedMember$788());
            } else if (match$767('.')) {
                expr$1159 = delegate$721.createMemberExpression('.', expr$1159, parseNonComputedMember$787());
            } else {
                expr$1159 = delegate$721.createTaggedTemplateExpression(expr$1159, parseTemplateLiteral$781());
            }
        }
        return expr$1159;
    }
    function parseLeftHandSideExpression$791() {
        var expr$1162, property$1163;
        expr$1162 = matchKeyword$768('new') ? parseNewExpression$789() : parsePrimaryExpression$783();
        while (match$767('.') || match$767('[') || lookahead$724.type === Token$702.Template) {
            if (match$767('[')) {
                expr$1162 = delegate$721.createMemberExpression('[', expr$1162, parseComputedMember$788());
            } else if (match$767('.')) {
                expr$1162 = delegate$721.createMemberExpression('.', expr$1162, parseNonComputedMember$787());
            } else {
                expr$1162 = delegate$721.createTaggedTemplateExpression(expr$1162, parseTemplateLiteral$781());
            }
        }
        return expr$1162;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$792() {
        var expr$1164 = parseLeftHandSideExpressionAllowCall$790(), token$1165 = lookahead$724;
        if (lookahead$724.type !== Token$702.Punctuator) {
            return expr$1164;
        }
        if ((match$767('++') || match$767('--')) && !peekLineTerminator$761()) {
            // 11.3.1, 11.3.2
            if (strict$712 && expr$1164.type === Syntax$705.Identifier && isRestrictedWord$739(expr$1164.name)) {
                throwErrorTolerant$763({}, Messages$707.StrictLHSPostfix);
            }
            if (!isLeftHandSide$772(expr$1164)) {
                throwError$762({}, Messages$707.InvalidLHSInAssignment);
            }
            token$1165 = lex$758();
            expr$1164 = delegate$721.createPostfixExpression(token$1165.value, expr$1164);
        }
        return expr$1164;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$793() {
        var token$1166, expr$1167;
        if (lookahead$724.type !== Token$702.Punctuator && lookahead$724.type !== Token$702.Keyword) {
            return parsePostfixExpression$792();
        }
        if (match$767('++') || match$767('--')) {
            token$1166 = lex$758();
            expr$1167 = parseUnaryExpression$793();
            // 11.4.4, 11.4.5
            if (strict$712 && expr$1167.type === Syntax$705.Identifier && isRestrictedWord$739(expr$1167.name)) {
                throwErrorTolerant$763({}, Messages$707.StrictLHSPrefix);
            }
            if (!isLeftHandSide$772(expr$1167)) {
                throwError$762({}, Messages$707.InvalidLHSInAssignment);
            }
            return delegate$721.createUnaryExpression(token$1166.value, expr$1167);
        }
        if (match$767('+') || match$767('-') || match$767('~') || match$767('!')) {
            token$1166 = lex$758();
            expr$1167 = parseUnaryExpression$793();
            return delegate$721.createUnaryExpression(token$1166.value, expr$1167);
        }
        if (matchKeyword$768('delete') || matchKeyword$768('void') || matchKeyword$768('typeof')) {
            token$1166 = lex$758();
            expr$1167 = parseUnaryExpression$793();
            expr$1167 = delegate$721.createUnaryExpression(token$1166.value, expr$1167);
            if (strict$712 && expr$1167.operator === 'delete' && expr$1167.argument.type === Syntax$705.Identifier) {
                throwErrorTolerant$763({}, Messages$707.StrictDelete);
            }
            return expr$1167;
        }
        return parsePostfixExpression$792();
    }
    function binaryPrecedence$794(token$1168, allowIn$1169) {
        var prec$1170 = 0;
        if (token$1168.type !== Token$702.Punctuator && token$1168.type !== Token$702.Keyword) {
            return 0;
        }
        switch (token$1168.value) {
        case '||':
            prec$1170 = 1;
            break;
        case '&&':
            prec$1170 = 2;
            break;
        case '|':
            prec$1170 = 3;
            break;
        case '^':
            prec$1170 = 4;
            break;
        case '&':
            prec$1170 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1170 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1170 = 7;
            break;
        case 'in':
            prec$1170 = allowIn$1169 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1170 = 8;
            break;
        case '+':
        case '-':
            prec$1170 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1170 = 11;
            break;
        default:
            break;
        }
        return prec$1170;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$795() {
        var expr$1171, token$1172, prec$1173, previousAllowIn$1174, stack$1175, right$1176, operator$1177, left$1178, i$1179;
        previousAllowIn$1174 = state$726.allowIn;
        state$726.allowIn = true;
        expr$1171 = parseUnaryExpression$793();
        token$1172 = lookahead$724;
        prec$1173 = binaryPrecedence$794(token$1172, previousAllowIn$1174);
        if (prec$1173 === 0) {
            return expr$1171;
        }
        token$1172.prec = prec$1173;
        lex$758();
        stack$1175 = [
            expr$1171,
            token$1172,
            parseUnaryExpression$793()
        ];
        while ((prec$1173 = binaryPrecedence$794(lookahead$724, previousAllowIn$1174)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1175.length > 2 && prec$1173 <= stack$1175[stack$1175.length - 2].prec) {
                right$1176 = stack$1175.pop();
                operator$1177 = stack$1175.pop().value;
                left$1178 = stack$1175.pop();
                stack$1175.push(delegate$721.createBinaryExpression(operator$1177, left$1178, right$1176));
            }
            // Shift.
            token$1172 = lex$758();
            token$1172.prec = prec$1173;
            stack$1175.push(token$1172);
            stack$1175.push(parseUnaryExpression$793());
        }
        state$726.allowIn = previousAllowIn$1174;
        // Final reduce to clean-up the stack.
        i$1179 = stack$1175.length - 1;
        expr$1171 = stack$1175[i$1179];
        while (i$1179 > 1) {
            expr$1171 = delegate$721.createBinaryExpression(stack$1175[i$1179 - 1].value, stack$1175[i$1179 - 2], expr$1171);
            i$1179 -= 2;
        }
        return expr$1171;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$796() {
        var expr$1180, previousAllowIn$1181, consequent$1182, alternate$1183;
        expr$1180 = parseBinaryExpression$795();
        if (match$767('?')) {
            lex$758();
            previousAllowIn$1181 = state$726.allowIn;
            state$726.allowIn = true;
            consequent$1182 = parseAssignmentExpression$801();
            state$726.allowIn = previousAllowIn$1181;
            expect$765(':');
            alternate$1183 = parseAssignmentExpression$801();
            expr$1180 = delegate$721.createConditionalExpression(expr$1180, consequent$1182, alternate$1183);
        }
        return expr$1180;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$797(expr$1184) {
        var i$1185, len$1186, property$1187, element$1188;
        if (expr$1184.type === Syntax$705.ObjectExpression) {
            expr$1184.type = Syntax$705.ObjectPattern;
            for (i$1185 = 0, len$1186 = expr$1184.properties.length; i$1185 < len$1186; i$1185 += 1) {
                property$1187 = expr$1184.properties[i$1185];
                if (property$1187.kind !== 'init') {
                    throwError$762({}, Messages$707.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$797(property$1187.value);
            }
        } else if (expr$1184.type === Syntax$705.ArrayExpression) {
            expr$1184.type = Syntax$705.ArrayPattern;
            for (i$1185 = 0, len$1186 = expr$1184.elements.length; i$1185 < len$1186; i$1185 += 1) {
                element$1188 = expr$1184.elements[i$1185];
                if (element$1188) {
                    reinterpretAsAssignmentBindingPattern$797(element$1188);
                }
            }
        } else if (expr$1184.type === Syntax$705.Identifier) {
            if (isRestrictedWord$739(expr$1184.name)) {
                throwError$762({}, Messages$707.InvalidLHSInAssignment);
            }
        } else if (expr$1184.type === Syntax$705.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$797(expr$1184.argument);
            if (expr$1184.argument.type === Syntax$705.ObjectPattern) {
                throwError$762({}, Messages$707.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1184.type !== Syntax$705.MemberExpression && expr$1184.type !== Syntax$705.CallExpression && expr$1184.type !== Syntax$705.NewExpression) {
                throwError$762({}, Messages$707.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$798(options$1189, expr$1190) {
        var i$1191, len$1192, property$1193, element$1194;
        if (expr$1190.type === Syntax$705.ObjectExpression) {
            expr$1190.type = Syntax$705.ObjectPattern;
            for (i$1191 = 0, len$1192 = expr$1190.properties.length; i$1191 < len$1192; i$1191 += 1) {
                property$1193 = expr$1190.properties[i$1191];
                if (property$1193.kind !== 'init') {
                    throwError$762({}, Messages$707.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$798(options$1189, property$1193.value);
            }
        } else if (expr$1190.type === Syntax$705.ArrayExpression) {
            expr$1190.type = Syntax$705.ArrayPattern;
            for (i$1191 = 0, len$1192 = expr$1190.elements.length; i$1191 < len$1192; i$1191 += 1) {
                element$1194 = expr$1190.elements[i$1191];
                if (element$1194) {
                    reinterpretAsDestructuredParameter$798(options$1189, element$1194);
                }
            }
        } else if (expr$1190.type === Syntax$705.Identifier) {
            validateParam$836(options$1189, expr$1190, expr$1190.name);
        } else {
            if (expr$1190.type !== Syntax$705.MemberExpression) {
                throwError$762({}, Messages$707.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$799(expressions$1195) {
        var i$1196, len$1197, param$1198, params$1199, defaults$1200, defaultCount$1201, options$1202, rest$1203;
        params$1199 = [];
        defaults$1200 = [];
        defaultCount$1201 = 0;
        rest$1203 = null;
        options$1202 = { paramSet: {} };
        for (i$1196 = 0, len$1197 = expressions$1195.length; i$1196 < len$1197; i$1196 += 1) {
            param$1198 = expressions$1195[i$1196];
            if (param$1198.type === Syntax$705.Identifier) {
                params$1199.push(param$1198);
                defaults$1200.push(null);
                validateParam$836(options$1202, param$1198, param$1198.name);
            } else if (param$1198.type === Syntax$705.ObjectExpression || param$1198.type === Syntax$705.ArrayExpression) {
                reinterpretAsDestructuredParameter$798(options$1202, param$1198);
                params$1199.push(param$1198);
                defaults$1200.push(null);
            } else if (param$1198.type === Syntax$705.SpreadElement) {
                assert$728(i$1196 === len$1197 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$798(options$1202, param$1198.argument);
                rest$1203 = param$1198.argument;
            } else if (param$1198.type === Syntax$705.AssignmentExpression) {
                params$1199.push(param$1198.left);
                defaults$1200.push(param$1198.right);
                ++defaultCount$1201;
                validateParam$836(options$1202, param$1198.left, param$1198.left.name);
            } else {
                return null;
            }
        }
        if (options$1202.message === Messages$707.StrictParamDupe) {
            throwError$762(strict$712 ? options$1202.stricted : options$1202.firstRestricted, options$1202.message);
        }
        if (defaultCount$1201 === 0) {
            defaults$1200 = [];
        }
        return {
            params: params$1199,
            defaults: defaults$1200,
            rest: rest$1203,
            stricted: options$1202.stricted,
            firstRestricted: options$1202.firstRestricted,
            message: options$1202.message
        };
    }
    function parseArrowFunctionExpression$800(options$1204) {
        var previousStrict$1205, previousYieldAllowed$1206, body$1207;
        expect$765('=>');
        previousStrict$1205 = strict$712;
        previousYieldAllowed$1206 = state$726.yieldAllowed;
        state$726.yieldAllowed = false;
        body$1207 = parseConciseBody$834();
        if (strict$712 && options$1204.firstRestricted) {
            throwError$762(options$1204.firstRestricted, options$1204.message);
        }
        if (strict$712 && options$1204.stricted) {
            throwErrorTolerant$763(options$1204.stricted, options$1204.message);
        }
        strict$712 = previousStrict$1205;
        state$726.yieldAllowed = previousYieldAllowed$1206;
        return delegate$721.createArrowFunctionExpression(options$1204.params, options$1204.defaults, body$1207, options$1204.rest, body$1207.type !== Syntax$705.BlockStatement);
    }
    function parseAssignmentExpression$801() {
        var expr$1208, token$1209, params$1210, oldParenthesizedCount$1211;
        if (matchKeyword$768('yield')) {
            return parseYieldExpression$841();
        }
        oldParenthesizedCount$1211 = state$726.parenthesizedCount;
        if (match$767('(')) {
            token$1209 = lookahead2$760();
            if (token$1209.type === Token$702.Punctuator && token$1209.value === ')' || token$1209.value === '...') {
                params$1210 = parseParams$838();
                if (!match$767('=>')) {
                    throwUnexpected$764(lex$758());
                }
                return parseArrowFunctionExpression$800(params$1210);
            }
        }
        token$1209 = lookahead$724;
        expr$1208 = parseConditionalExpression$796();
        if (match$767('=>') && (state$726.parenthesizedCount === oldParenthesizedCount$1211 || state$726.parenthesizedCount === oldParenthesizedCount$1211 + 1)) {
            if (expr$1208.type === Syntax$705.Identifier) {
                params$1210 = reinterpretAsCoverFormalsList$799([expr$1208]);
            } else if (expr$1208.type === Syntax$705.SequenceExpression) {
                params$1210 = reinterpretAsCoverFormalsList$799(expr$1208.expressions);
            }
            if (params$1210) {
                return parseArrowFunctionExpression$800(params$1210);
            }
        }
        if (matchAssign$770()) {
            // 11.13.1
            if (strict$712 && expr$1208.type === Syntax$705.Identifier && isRestrictedWord$739(expr$1208.name)) {
                throwErrorTolerant$763(token$1209, Messages$707.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$767('=') && (expr$1208.type === Syntax$705.ObjectExpression || expr$1208.type === Syntax$705.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$797(expr$1208);
            } else if (!isLeftHandSide$772(expr$1208)) {
                throwError$762({}, Messages$707.InvalidLHSInAssignment);
            }
            expr$1208 = delegate$721.createAssignmentExpression(lex$758().value, expr$1208, parseAssignmentExpression$801());
        }
        return expr$1208;
    }
    // 11.14 Comma Operator
    function parseExpression$802() {
        var expr$1212, expressions$1213, sequence$1214, coverFormalsList$1215, spreadFound$1216, oldParenthesizedCount$1217;
        oldParenthesizedCount$1217 = state$726.parenthesizedCount;
        expr$1212 = parseAssignmentExpression$801();
        expressions$1213 = [expr$1212];
        if (match$767(',')) {
            while (streamIndex$723 < length$720) {
                if (!match$767(',')) {
                    break;
                }
                lex$758();
                expr$1212 = parseSpreadOrAssignmentExpression$785();
                expressions$1213.push(expr$1212);
                if (expr$1212.type === Syntax$705.SpreadElement) {
                    spreadFound$1216 = true;
                    if (!match$767(')')) {
                        throwError$762({}, Messages$707.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1214 = delegate$721.createSequenceExpression(expressions$1213);
        }
        if (match$767('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$726.parenthesizedCount === oldParenthesizedCount$1217 || state$726.parenthesizedCount === oldParenthesizedCount$1217 + 1) {
                expr$1212 = expr$1212.type === Syntax$705.SequenceExpression ? expr$1212.expressions : expressions$1213;
                coverFormalsList$1215 = reinterpretAsCoverFormalsList$799(expr$1212);
                if (coverFormalsList$1215) {
                    return parseArrowFunctionExpression$800(coverFormalsList$1215);
                }
            }
            throwUnexpected$764(lex$758());
        }
        if (spreadFound$1216 && lookahead2$760().value !== '=>') {
            throwError$762({}, Messages$707.IllegalSpread);
        }
        return sequence$1214 || expr$1212;
    }
    // 12.1 Block
    function parseStatementList$803() {
        var list$1218 = [], statement$1219;
        while (streamIndex$723 < length$720) {
            if (match$767('}')) {
                break;
            }
            statement$1219 = parseSourceElement$848();
            if (typeof statement$1219 === 'undefined') {
                break;
            }
            list$1218.push(statement$1219);
        }
        return list$1218;
    }
    function parseBlock$804() {
        var block$1220;
        expect$765('{');
        block$1220 = parseStatementList$803();
        expect$765('}');
        return delegate$721.createBlockStatement(block$1220);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$805() {
        var token$1221 = lookahead$724, resolvedIdent$1222;
        if (token$1221.type !== Token$702.Identifier) {
            throwUnexpected$764(token$1221);
        }
        resolvedIdent$1222 = expander$701.resolve(tokenStream$722[lookaheadIndex$725]);
        lex$758();
        return delegate$721.createIdentifier(resolvedIdent$1222);
    }
    function parseVariableDeclaration$806(kind$1223) {
        var id$1224, init$1225 = null;
        if (match$767('{')) {
            id$1224 = parseObjectInitialiser$779();
            reinterpretAsAssignmentBindingPattern$797(id$1224);
        } else if (match$767('[')) {
            id$1224 = parseArrayInitialiser$774();
            reinterpretAsAssignmentBindingPattern$797(id$1224);
        } else {
            id$1224 = state$726.allowKeyword ? parseNonComputedProperty$786() : parseVariableIdentifier$805();
            // 12.2.1
            if (strict$712 && isRestrictedWord$739(id$1224.name)) {
                throwErrorTolerant$763({}, Messages$707.StrictVarName);
            }
        }
        if (kind$1223 === 'const') {
            if (!match$767('=')) {
                throwError$762({}, Messages$707.NoUnintializedConst);
            }
            expect$765('=');
            init$1225 = parseAssignmentExpression$801();
        } else if (match$767('=')) {
            lex$758();
            init$1225 = parseAssignmentExpression$801();
        }
        return delegate$721.createVariableDeclarator(id$1224, init$1225);
    }
    function parseVariableDeclarationList$807(kind$1226) {
        var list$1227 = [];
        do {
            list$1227.push(parseVariableDeclaration$806(kind$1226));
            if (!match$767(',')) {
                break;
            }
            lex$758();
        } while (streamIndex$723 < length$720);
        return list$1227;
    }
    function parseVariableStatement$808() {
        var declarations$1228;
        expectKeyword$766('var');
        declarations$1228 = parseVariableDeclarationList$807();
        consumeSemicolon$771();
        return delegate$721.createVariableDeclaration(declarations$1228, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$809(kind$1229) {
        var declarations$1230;
        expectKeyword$766(kind$1229);
        declarations$1230 = parseVariableDeclarationList$807(kind$1229);
        consumeSemicolon$771();
        return delegate$721.createVariableDeclaration(declarations$1230, kind$1229);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$810() {
        var id$1231, src$1232, body$1233;
        lex$758();
        // 'module'
        if (peekLineTerminator$761()) {
            throwError$762({}, Messages$707.NewlineAfterModule);
        }
        switch (lookahead$724.type) {
        case Token$702.StringLiteral:
            id$1231 = parsePrimaryExpression$783();
            body$1233 = parseModuleBlock$853();
            src$1232 = null;
            break;
        case Token$702.Identifier:
            id$1231 = parseVariableIdentifier$805();
            body$1233 = null;
            if (!matchContextualKeyword$769('from')) {
                throwUnexpected$764(lex$758());
            }
            lex$758();
            src$1232 = parsePrimaryExpression$783();
            if (src$1232.type !== Syntax$705.Literal) {
                throwError$762({}, Messages$707.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$771();
        return delegate$721.createModuleDeclaration(id$1231, src$1232, body$1233);
    }
    function parseExportBatchSpecifier$811() {
        expect$765('*');
        return delegate$721.createExportBatchSpecifier();
    }
    function parseExportSpecifier$812() {
        var id$1234, name$1235 = null;
        id$1234 = parseVariableIdentifier$805();
        if (matchContextualKeyword$769('as')) {
            lex$758();
            name$1235 = parseNonComputedProperty$786();
        }
        return delegate$721.createExportSpecifier(id$1234, name$1235);
    }
    function parseExportDeclaration$813() {
        var previousAllowKeyword$1236, decl$1237, def$1238, src$1239, specifiers$1240;
        expectKeyword$766('export');
        if (lookahead$724.type === Token$702.Keyword) {
            switch (lookahead$724.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$721.createExportDeclaration(parseSourceElement$848(), null, null);
            }
        }
        if (isIdentifierName$755(lookahead$724)) {
            previousAllowKeyword$1236 = state$726.allowKeyword;
            state$726.allowKeyword = true;
            decl$1237 = parseVariableDeclarationList$807('let');
            state$726.allowKeyword = previousAllowKeyword$1236;
            return delegate$721.createExportDeclaration(decl$1237, null, null);
        }
        specifiers$1240 = [];
        src$1239 = null;
        if (match$767('*')) {
            specifiers$1240.push(parseExportBatchSpecifier$811());
        } else {
            expect$765('{');
            do {
                specifiers$1240.push(parseExportSpecifier$812());
            } while (match$767(',') && lex$758());
            expect$765('}');
        }
        if (matchContextualKeyword$769('from')) {
            lex$758();
            src$1239 = parsePrimaryExpression$783();
            if (src$1239.type !== Syntax$705.Literal) {
                throwError$762({}, Messages$707.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$771();
        return delegate$721.createExportDeclaration(null, specifiers$1240, src$1239);
    }
    function parseImportDeclaration$814() {
        var specifiers$1241, kind$1242, src$1243;
        expectKeyword$766('import');
        specifiers$1241 = [];
        if (isIdentifierName$755(lookahead$724)) {
            kind$1242 = 'default';
            specifiers$1241.push(parseImportSpecifier$815());
            if (!matchContextualKeyword$769('from')) {
                throwError$762({}, Messages$707.NoFromAfterImport);
            }
            lex$758();
        } else if (match$767('{')) {
            kind$1242 = 'named';
            lex$758();
            do {
                specifiers$1241.push(parseImportSpecifier$815());
            } while (match$767(',') && lex$758());
            expect$765('}');
            if (!matchContextualKeyword$769('from')) {
                throwError$762({}, Messages$707.NoFromAfterImport);
            }
            lex$758();
        }
        src$1243 = parsePrimaryExpression$783();
        if (src$1243.type !== Syntax$705.Literal) {
            throwError$762({}, Messages$707.InvalidModuleSpecifier);
        }
        consumeSemicolon$771();
        return delegate$721.createImportDeclaration(specifiers$1241, kind$1242, src$1243);
    }
    function parseImportSpecifier$815() {
        var id$1244, name$1245 = null;
        id$1244 = parseNonComputedProperty$786();
        if (matchContextualKeyword$769('as')) {
            lex$758();
            name$1245 = parseVariableIdentifier$805();
        }
        return delegate$721.createImportSpecifier(id$1244, name$1245);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$816() {
        expect$765(';');
        return delegate$721.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$817() {
        var expr$1246 = parseExpression$802();
        consumeSemicolon$771();
        return delegate$721.createExpressionStatement(expr$1246);
    }
    // 12.5 If statement
    function parseIfStatement$818() {
        var test$1247, consequent$1248, alternate$1249;
        expectKeyword$766('if');
        expect$765('(');
        test$1247 = parseExpression$802();
        expect$765(')');
        consequent$1248 = parseStatement$833();
        if (matchKeyword$768('else')) {
            lex$758();
            alternate$1249 = parseStatement$833();
        } else {
            alternate$1249 = null;
        }
        return delegate$721.createIfStatement(test$1247, consequent$1248, alternate$1249);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$819() {
        var body$1250, test$1251, oldInIteration$1252;
        expectKeyword$766('do');
        oldInIteration$1252 = state$726.inIteration;
        state$726.inIteration = true;
        body$1250 = parseStatement$833();
        state$726.inIteration = oldInIteration$1252;
        expectKeyword$766('while');
        expect$765('(');
        test$1251 = parseExpression$802();
        expect$765(')');
        if (match$767(';')) {
            lex$758();
        }
        return delegate$721.createDoWhileStatement(body$1250, test$1251);
    }
    function parseWhileStatement$820() {
        var test$1253, body$1254, oldInIteration$1255;
        expectKeyword$766('while');
        expect$765('(');
        test$1253 = parseExpression$802();
        expect$765(')');
        oldInIteration$1255 = state$726.inIteration;
        state$726.inIteration = true;
        body$1254 = parseStatement$833();
        state$726.inIteration = oldInIteration$1255;
        return delegate$721.createWhileStatement(test$1253, body$1254);
    }
    function parseForVariableDeclaration$821() {
        var token$1256 = lex$758(), declarations$1257 = parseVariableDeclarationList$807();
        return delegate$721.createVariableDeclaration(declarations$1257, token$1256.value);
    }
    function parseForStatement$822(opts$1258) {
        var init$1259, test$1260, update$1261, left$1262, right$1263, body$1264, operator$1265, oldInIteration$1266;
        init$1259 = test$1260 = update$1261 = null;
        expectKeyword$766('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$769('each')) {
            throwError$762({}, Messages$707.EachNotAllowed);
        }
        expect$765('(');
        if (match$767(';')) {
            lex$758();
        } else {
            if (matchKeyword$768('var') || matchKeyword$768('let') || matchKeyword$768('const')) {
                state$726.allowIn = false;
                init$1259 = parseForVariableDeclaration$821();
                state$726.allowIn = true;
                if (init$1259.declarations.length === 1) {
                    if (matchKeyword$768('in') || matchContextualKeyword$769('of')) {
                        operator$1265 = lookahead$724;
                        if (!((operator$1265.value === 'in' || init$1259.kind !== 'var') && init$1259.declarations[0].init)) {
                            lex$758();
                            left$1262 = init$1259;
                            right$1263 = parseExpression$802();
                            init$1259 = null;
                        }
                    }
                }
            } else {
                state$726.allowIn = false;
                init$1259 = parseExpression$802();
                state$726.allowIn = true;
                if (matchContextualKeyword$769('of')) {
                    operator$1265 = lex$758();
                    left$1262 = init$1259;
                    right$1263 = parseExpression$802();
                    init$1259 = null;
                } else if (matchKeyword$768('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$773(init$1259)) {
                        throwError$762({}, Messages$707.InvalidLHSInForIn);
                    }
                    operator$1265 = lex$758();
                    left$1262 = init$1259;
                    right$1263 = parseExpression$802();
                    init$1259 = null;
                }
            }
            if (typeof left$1262 === 'undefined') {
                expect$765(';');
            }
        }
        if (typeof left$1262 === 'undefined') {
            if (!match$767(';')) {
                test$1260 = parseExpression$802();
            }
            expect$765(';');
            if (!match$767(')')) {
                update$1261 = parseExpression$802();
            }
        }
        expect$765(')');
        oldInIteration$1266 = state$726.inIteration;
        state$726.inIteration = true;
        if (!(opts$1258 !== undefined && opts$1258.ignoreBody)) {
            body$1264 = parseStatement$833();
        }
        state$726.inIteration = oldInIteration$1266;
        if (typeof left$1262 === 'undefined') {
            return delegate$721.createForStatement(init$1259, test$1260, update$1261, body$1264);
        }
        if (operator$1265.value === 'in') {
            return delegate$721.createForInStatement(left$1262, right$1263, body$1264);
        }
        return delegate$721.createForOfStatement(left$1262, right$1263, body$1264);
    }
    // 12.7 The continue statement
    function parseContinueStatement$823() {
        var label$1267 = null, key$1268;
        expectKeyword$766('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$724.value.charCodeAt(0) === 59) {
            lex$758();
            if (!state$726.inIteration) {
                throwError$762({}, Messages$707.IllegalContinue);
            }
            return delegate$721.createContinueStatement(null);
        }
        if (peekLineTerminator$761()) {
            if (!state$726.inIteration) {
                throwError$762({}, Messages$707.IllegalContinue);
            }
            return delegate$721.createContinueStatement(null);
        }
        if (lookahead$724.type === Token$702.Identifier) {
            label$1267 = parseVariableIdentifier$805();
            key$1268 = '$' + label$1267.name;
            if (!Object.prototype.hasOwnProperty.call(state$726.labelSet, key$1268)) {
                throwError$762({}, Messages$707.UnknownLabel, label$1267.name);
            }
        }
        consumeSemicolon$771();
        if (label$1267 === null && !state$726.inIteration) {
            throwError$762({}, Messages$707.IllegalContinue);
        }
        return delegate$721.createContinueStatement(label$1267);
    }
    // 12.8 The break statement
    function parseBreakStatement$824() {
        var label$1269 = null, key$1270;
        expectKeyword$766('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$724.value.charCodeAt(0) === 59) {
            lex$758();
            if (!(state$726.inIteration || state$726.inSwitch)) {
                throwError$762({}, Messages$707.IllegalBreak);
            }
            return delegate$721.createBreakStatement(null);
        }
        if (peekLineTerminator$761()) {
            if (!(state$726.inIteration || state$726.inSwitch)) {
                throwError$762({}, Messages$707.IllegalBreak);
            }
            return delegate$721.createBreakStatement(null);
        }
        if (lookahead$724.type === Token$702.Identifier) {
            label$1269 = parseVariableIdentifier$805();
            key$1270 = '$' + label$1269.name;
            if (!Object.prototype.hasOwnProperty.call(state$726.labelSet, key$1270)) {
                throwError$762({}, Messages$707.UnknownLabel, label$1269.name);
            }
        }
        consumeSemicolon$771();
        if (label$1269 === null && !(state$726.inIteration || state$726.inSwitch)) {
            throwError$762({}, Messages$707.IllegalBreak);
        }
        return delegate$721.createBreakStatement(label$1269);
    }
    // 12.9 The return statement
    function parseReturnStatement$825() {
        var argument$1271 = null;
        expectKeyword$766('return');
        if (!state$726.inFunctionBody) {
            throwErrorTolerant$763({}, Messages$707.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$735(String(lookahead$724.value).charCodeAt(0))) {
            argument$1271 = parseExpression$802();
            consumeSemicolon$771();
            return delegate$721.createReturnStatement(argument$1271);
        }
        if (peekLineTerminator$761()) {
            return delegate$721.createReturnStatement(null);
        }
        if (!match$767(';')) {
            if (!match$767('}') && lookahead$724.type !== Token$702.EOF) {
                argument$1271 = parseExpression$802();
            }
        }
        consumeSemicolon$771();
        return delegate$721.createReturnStatement(argument$1271);
    }
    // 12.10 The with statement
    function parseWithStatement$826() {
        var object$1272, body$1273;
        if (strict$712) {
            throwErrorTolerant$763({}, Messages$707.StrictModeWith);
        }
        expectKeyword$766('with');
        expect$765('(');
        object$1272 = parseExpression$802();
        expect$765(')');
        body$1273 = parseStatement$833();
        return delegate$721.createWithStatement(object$1272, body$1273);
    }
    // 12.10 The swith statement
    function parseSwitchCase$827() {
        var test$1274, consequent$1275 = [], sourceElement$1276;
        if (matchKeyword$768('default')) {
            lex$758();
            test$1274 = null;
        } else {
            expectKeyword$766('case');
            test$1274 = parseExpression$802();
        }
        expect$765(':');
        while (streamIndex$723 < length$720) {
            if (match$767('}') || matchKeyword$768('default') || matchKeyword$768('case')) {
                break;
            }
            sourceElement$1276 = parseSourceElement$848();
            if (typeof sourceElement$1276 === 'undefined') {
                break;
            }
            consequent$1275.push(sourceElement$1276);
        }
        return delegate$721.createSwitchCase(test$1274, consequent$1275);
    }
    function parseSwitchStatement$828() {
        var discriminant$1277, cases$1278, clause$1279, oldInSwitch$1280, defaultFound$1281;
        expectKeyword$766('switch');
        expect$765('(');
        discriminant$1277 = parseExpression$802();
        expect$765(')');
        expect$765('{');
        cases$1278 = [];
        if (match$767('}')) {
            lex$758();
            return delegate$721.createSwitchStatement(discriminant$1277, cases$1278);
        }
        oldInSwitch$1280 = state$726.inSwitch;
        state$726.inSwitch = true;
        defaultFound$1281 = false;
        while (streamIndex$723 < length$720) {
            if (match$767('}')) {
                break;
            }
            clause$1279 = parseSwitchCase$827();
            if (clause$1279.test === null) {
                if (defaultFound$1281) {
                    throwError$762({}, Messages$707.MultipleDefaultsInSwitch);
                }
                defaultFound$1281 = true;
            }
            cases$1278.push(clause$1279);
        }
        state$726.inSwitch = oldInSwitch$1280;
        expect$765('}');
        return delegate$721.createSwitchStatement(discriminant$1277, cases$1278);
    }
    // 12.13 The throw statement
    function parseThrowStatement$829() {
        var argument$1282;
        expectKeyword$766('throw');
        if (peekLineTerminator$761()) {
            throwError$762({}, Messages$707.NewlineAfterThrow);
        }
        argument$1282 = parseExpression$802();
        consumeSemicolon$771();
        return delegate$721.createThrowStatement(argument$1282);
    }
    // 12.14 The try statement
    function parseCatchClause$830() {
        var param$1283, body$1284;
        expectKeyword$766('catch');
        expect$765('(');
        if (match$767(')')) {
            throwUnexpected$764(lookahead$724);
        }
        param$1283 = parseExpression$802();
        // 12.14.1
        if (strict$712 && param$1283.type === Syntax$705.Identifier && isRestrictedWord$739(param$1283.name)) {
            throwErrorTolerant$763({}, Messages$707.StrictCatchVariable);
        }
        expect$765(')');
        body$1284 = parseBlock$804();
        return delegate$721.createCatchClause(param$1283, body$1284);
    }
    function parseTryStatement$831() {
        var block$1285, handlers$1286 = [], finalizer$1287 = null;
        expectKeyword$766('try');
        block$1285 = parseBlock$804();
        if (matchKeyword$768('catch')) {
            handlers$1286.push(parseCatchClause$830());
        }
        if (matchKeyword$768('finally')) {
            lex$758();
            finalizer$1287 = parseBlock$804();
        }
        if (handlers$1286.length === 0 && !finalizer$1287) {
            throwError$762({}, Messages$707.NoCatchOrFinally);
        }
        return delegate$721.createTryStatement(block$1285, [], handlers$1286, finalizer$1287);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$832() {
        expectKeyword$766('debugger');
        consumeSemicolon$771();
        return delegate$721.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$833() {
        var type$1288 = lookahead$724.type, expr$1289, labeledBody$1290, key$1291;
        if (type$1288 === Token$702.EOF) {
            throwUnexpected$764(lookahead$724);
        }
        if (type$1288 === Token$702.Punctuator) {
            switch (lookahead$724.value) {
            case ';':
                return parseEmptyStatement$816();
            case '{':
                return parseBlock$804();
            case '(':
                return parseExpressionStatement$817();
            default:
                break;
            }
        }
        if (type$1288 === Token$702.Keyword) {
            switch (lookahead$724.value) {
            case 'break':
                return parseBreakStatement$824();
            case 'continue':
                return parseContinueStatement$823();
            case 'debugger':
                return parseDebuggerStatement$832();
            case 'do':
                return parseDoWhileStatement$819();
            case 'for':
                return parseForStatement$822();
            case 'function':
                return parseFunctionDeclaration$839();
            case 'class':
                return parseClassDeclaration$846();
            case 'if':
                return parseIfStatement$818();
            case 'return':
                return parseReturnStatement$825();
            case 'switch':
                return parseSwitchStatement$828();
            case 'throw':
                return parseThrowStatement$829();
            case 'try':
                return parseTryStatement$831();
            case 'var':
                return parseVariableStatement$808();
            case 'while':
                return parseWhileStatement$820();
            case 'with':
                return parseWithStatement$826();
            default:
                break;
            }
        }
        expr$1289 = parseExpression$802();
        // 12.12 Labelled Statements
        if (expr$1289.type === Syntax$705.Identifier && match$767(':')) {
            lex$758();
            key$1291 = '$' + expr$1289.name;
            if (Object.prototype.hasOwnProperty.call(state$726.labelSet, key$1291)) {
                throwError$762({}, Messages$707.Redeclaration, 'Label', expr$1289.name);
            }
            state$726.labelSet[key$1291] = true;
            labeledBody$1290 = parseStatement$833();
            delete state$726.labelSet[key$1291];
            return delegate$721.createLabeledStatement(expr$1289, labeledBody$1290);
        }
        consumeSemicolon$771();
        return delegate$721.createExpressionStatement(expr$1289);
    }
    // 13 Function Definition
    function parseConciseBody$834() {
        if (match$767('{')) {
            return parseFunctionSourceElements$835();
        }
        return parseAssignmentExpression$801();
    }
    function parseFunctionSourceElements$835() {
        var sourceElement$1292, sourceElements$1293 = [], token$1294, directive$1295, firstRestricted$1296, oldLabelSet$1297, oldInIteration$1298, oldInSwitch$1299, oldInFunctionBody$1300, oldParenthesizedCount$1301;
        expect$765('{');
        while (streamIndex$723 < length$720) {
            if (lookahead$724.type !== Token$702.StringLiteral) {
                break;
            }
            token$1294 = lookahead$724;
            sourceElement$1292 = parseSourceElement$848();
            sourceElements$1293.push(sourceElement$1292);
            if (sourceElement$1292.expression.type !== Syntax$705.Literal) {
                // this is not directive
                break;
            }
            directive$1295 = token$1294.value;
            if (directive$1295 === 'use strict') {
                strict$712 = true;
                if (firstRestricted$1296) {
                    throwErrorTolerant$763(firstRestricted$1296, Messages$707.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1296 && token$1294.octal) {
                    firstRestricted$1296 = token$1294;
                }
            }
        }
        oldLabelSet$1297 = state$726.labelSet;
        oldInIteration$1298 = state$726.inIteration;
        oldInSwitch$1299 = state$726.inSwitch;
        oldInFunctionBody$1300 = state$726.inFunctionBody;
        oldParenthesizedCount$1301 = state$726.parenthesizedCount;
        state$726.labelSet = {};
        state$726.inIteration = false;
        state$726.inSwitch = false;
        state$726.inFunctionBody = true;
        state$726.parenthesizedCount = 0;
        while (streamIndex$723 < length$720) {
            if (match$767('}')) {
                break;
            }
            sourceElement$1292 = parseSourceElement$848();
            if (typeof sourceElement$1292 === 'undefined') {
                break;
            }
            sourceElements$1293.push(sourceElement$1292);
        }
        expect$765('}');
        state$726.labelSet = oldLabelSet$1297;
        state$726.inIteration = oldInIteration$1298;
        state$726.inSwitch = oldInSwitch$1299;
        state$726.inFunctionBody = oldInFunctionBody$1300;
        state$726.parenthesizedCount = oldParenthesizedCount$1301;
        return delegate$721.createBlockStatement(sourceElements$1293);
    }
    function validateParam$836(options$1302, param$1303, name$1304) {
        var key$1305 = '$' + name$1304;
        if (strict$712) {
            if (isRestrictedWord$739(name$1304)) {
                options$1302.stricted = param$1303;
                options$1302.message = Messages$707.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1302.paramSet, key$1305)) {
                options$1302.stricted = param$1303;
                options$1302.message = Messages$707.StrictParamDupe;
            }
        } else if (!options$1302.firstRestricted) {
            if (isRestrictedWord$739(name$1304)) {
                options$1302.firstRestricted = param$1303;
                options$1302.message = Messages$707.StrictParamName;
            } else if (isStrictModeReservedWord$738(name$1304)) {
                options$1302.firstRestricted = param$1303;
                options$1302.message = Messages$707.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1302.paramSet, key$1305)) {
                options$1302.firstRestricted = param$1303;
                options$1302.message = Messages$707.StrictParamDupe;
            }
        }
        options$1302.paramSet[key$1305] = true;
    }
    function parseParam$837(options$1306) {
        var token$1307, rest$1308, param$1309, def$1310;
        token$1307 = lookahead$724;
        if (token$1307.value === '...') {
            token$1307 = lex$758();
            rest$1308 = true;
        }
        if (match$767('[')) {
            param$1309 = parseArrayInitialiser$774();
            reinterpretAsDestructuredParameter$798(options$1306, param$1309);
        } else if (match$767('{')) {
            if (rest$1308) {
                throwError$762({}, Messages$707.ObjectPatternAsRestParameter);
            }
            param$1309 = parseObjectInitialiser$779();
            reinterpretAsDestructuredParameter$798(options$1306, param$1309);
        } else {
            param$1309 = parseVariableIdentifier$805();
            validateParam$836(options$1306, token$1307, token$1307.value);
            if (match$767('=')) {
                if (rest$1308) {
                    throwErrorTolerant$763(lookahead$724, Messages$707.DefaultRestParameter);
                }
                lex$758();
                def$1310 = parseAssignmentExpression$801();
                ++options$1306.defaultCount;
            }
        }
        if (rest$1308) {
            if (!match$767(')')) {
                throwError$762({}, Messages$707.ParameterAfterRestParameter);
            }
            options$1306.rest = param$1309;
            return false;
        }
        options$1306.params.push(param$1309);
        options$1306.defaults.push(def$1310);
        return !match$767(')');
    }
    function parseParams$838(firstRestricted$1311) {
        var options$1312;
        options$1312 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1311
        };
        expect$765('(');
        if (!match$767(')')) {
            options$1312.paramSet = {};
            while (streamIndex$723 < length$720) {
                if (!parseParam$837(options$1312)) {
                    break;
                }
                expect$765(',');
            }
        }
        expect$765(')');
        if (options$1312.defaultCount === 0) {
            options$1312.defaults = [];
        }
        return options$1312;
    }
    function parseFunctionDeclaration$839() {
        var id$1313, body$1314, token$1315, tmp$1316, firstRestricted$1317, message$1318, previousStrict$1319, previousYieldAllowed$1320, generator$1321, expression$1322;
        expectKeyword$766('function');
        generator$1321 = false;
        if (match$767('*')) {
            lex$758();
            generator$1321 = true;
        }
        token$1315 = lookahead$724;
        id$1313 = parseVariableIdentifier$805();
        if (strict$712) {
            if (isRestrictedWord$739(token$1315.value)) {
                throwErrorTolerant$763(token$1315, Messages$707.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$739(token$1315.value)) {
                firstRestricted$1317 = token$1315;
                message$1318 = Messages$707.StrictFunctionName;
            } else if (isStrictModeReservedWord$738(token$1315.value)) {
                firstRestricted$1317 = token$1315;
                message$1318 = Messages$707.StrictReservedWord;
            }
        }
        tmp$1316 = parseParams$838(firstRestricted$1317);
        firstRestricted$1317 = tmp$1316.firstRestricted;
        if (tmp$1316.message) {
            message$1318 = tmp$1316.message;
        }
        previousStrict$1319 = strict$712;
        previousYieldAllowed$1320 = state$726.yieldAllowed;
        state$726.yieldAllowed = generator$1321;
        // here we redo some work in order to set 'expression'
        expression$1322 = !match$767('{');
        body$1314 = parseConciseBody$834();
        if (strict$712 && firstRestricted$1317) {
            throwError$762(firstRestricted$1317, message$1318);
        }
        if (strict$712 && tmp$1316.stricted) {
            throwErrorTolerant$763(tmp$1316.stricted, message$1318);
        }
        if (state$726.yieldAllowed && !state$726.yieldFound) {
            throwErrorTolerant$763({}, Messages$707.NoYieldInGenerator);
        }
        strict$712 = previousStrict$1319;
        state$726.yieldAllowed = previousYieldAllowed$1320;
        return delegate$721.createFunctionDeclaration(id$1313, tmp$1316.params, tmp$1316.defaults, body$1314, tmp$1316.rest, generator$1321, expression$1322);
    }
    function parseFunctionExpression$840() {
        var token$1323, id$1324 = null, firstRestricted$1325, message$1326, tmp$1327, body$1328, previousStrict$1329, previousYieldAllowed$1330, generator$1331, expression$1332;
        expectKeyword$766('function');
        generator$1331 = false;
        if (match$767('*')) {
            lex$758();
            generator$1331 = true;
        }
        if (!match$767('(')) {
            token$1323 = lookahead$724;
            id$1324 = parseVariableIdentifier$805();
            if (strict$712) {
                if (isRestrictedWord$739(token$1323.value)) {
                    throwErrorTolerant$763(token$1323, Messages$707.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$739(token$1323.value)) {
                    firstRestricted$1325 = token$1323;
                    message$1326 = Messages$707.StrictFunctionName;
                } else if (isStrictModeReservedWord$738(token$1323.value)) {
                    firstRestricted$1325 = token$1323;
                    message$1326 = Messages$707.StrictReservedWord;
                }
            }
        }
        tmp$1327 = parseParams$838(firstRestricted$1325);
        firstRestricted$1325 = tmp$1327.firstRestricted;
        if (tmp$1327.message) {
            message$1326 = tmp$1327.message;
        }
        previousStrict$1329 = strict$712;
        previousYieldAllowed$1330 = state$726.yieldAllowed;
        state$726.yieldAllowed = generator$1331;
        // here we redo some work in order to set 'expression'
        expression$1332 = !match$767('{');
        body$1328 = parseConciseBody$834();
        if (strict$712 && firstRestricted$1325) {
            throwError$762(firstRestricted$1325, message$1326);
        }
        if (strict$712 && tmp$1327.stricted) {
            throwErrorTolerant$763(tmp$1327.stricted, message$1326);
        }
        if (state$726.yieldAllowed && !state$726.yieldFound) {
            throwErrorTolerant$763({}, Messages$707.NoYieldInGenerator);
        }
        strict$712 = previousStrict$1329;
        state$726.yieldAllowed = previousYieldAllowed$1330;
        return delegate$721.createFunctionExpression(id$1324, tmp$1327.params, tmp$1327.defaults, body$1328, tmp$1327.rest, generator$1331, expression$1332);
    }
    function parseYieldExpression$841() {
        var delegateFlag$1333, expr$1334, previousYieldAllowed$1335;
        expectKeyword$766('yield');
        if (!state$726.yieldAllowed) {
            throwErrorTolerant$763({}, Messages$707.IllegalYield);
        }
        delegateFlag$1333 = false;
        if (match$767('*')) {
            lex$758();
            delegateFlag$1333 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1335 = state$726.yieldAllowed;
        state$726.yieldAllowed = false;
        expr$1334 = parseAssignmentExpression$801();
        state$726.yieldAllowed = previousYieldAllowed$1335;
        state$726.yieldFound = true;
        return delegate$721.createYieldExpression(expr$1334, delegateFlag$1333);
    }
    // 14 Classes
    function parseMethodDefinition$842(existingPropNames$1336) {
        var token$1337, key$1338, param$1339, propType$1340, isValidDuplicateProp$1341 = false;
        if (lookahead$724.value === 'static') {
            propType$1340 = ClassPropertyType$710.static;
            lex$758();
        } else {
            propType$1340 = ClassPropertyType$710.prototype;
        }
        if (match$767('*')) {
            lex$758();
            return delegate$721.createMethodDefinition(propType$1340, '', parseObjectPropertyKey$777(), parsePropertyMethodFunction$776({ generator: true }));
        }
        token$1337 = lookahead$724;
        key$1338 = parseObjectPropertyKey$777();
        if (token$1337.value === 'get' && !match$767('(')) {
            key$1338 = parseObjectPropertyKey$777();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1336[propType$1340].hasOwnProperty(key$1338.name)) {
                isValidDuplicateProp$1341 = existingPropNames$1336[propType$1340][key$1338.name].get === undefined && existingPropNames$1336[propType$1340][key$1338.name].data === undefined && existingPropNames$1336[propType$1340][key$1338.name].set !== undefined;
                if (!isValidDuplicateProp$1341) {
                    throwError$762(key$1338, Messages$707.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1336[propType$1340][key$1338.name] = {};
            }
            existingPropNames$1336[propType$1340][key$1338.name].get = true;
            expect$765('(');
            expect$765(')');
            return delegate$721.createMethodDefinition(propType$1340, 'get', key$1338, parsePropertyFunction$775({ generator: false }));
        }
        if (token$1337.value === 'set' && !match$767('(')) {
            key$1338 = parseObjectPropertyKey$777();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1336[propType$1340].hasOwnProperty(key$1338.name)) {
                isValidDuplicateProp$1341 = existingPropNames$1336[propType$1340][key$1338.name].set === undefined && existingPropNames$1336[propType$1340][key$1338.name].data === undefined && existingPropNames$1336[propType$1340][key$1338.name].get !== undefined;
                if (!isValidDuplicateProp$1341) {
                    throwError$762(key$1338, Messages$707.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1336[propType$1340][key$1338.name] = {};
            }
            existingPropNames$1336[propType$1340][key$1338.name].set = true;
            expect$765('(');
            token$1337 = lookahead$724;
            param$1339 = [parseVariableIdentifier$805()];
            expect$765(')');
            return delegate$721.createMethodDefinition(propType$1340, 'set', key$1338, parsePropertyFunction$775({
                params: param$1339,
                generator: false,
                name: token$1337
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1336[propType$1340].hasOwnProperty(key$1338.name)) {
            throwError$762(key$1338, Messages$707.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1336[propType$1340][key$1338.name] = {};
        }
        existingPropNames$1336[propType$1340][key$1338.name].data = true;
        return delegate$721.createMethodDefinition(propType$1340, '', key$1338, parsePropertyMethodFunction$776({ generator: false }));
    }
    function parseClassElement$843(existingProps$1342) {
        if (match$767(';')) {
            lex$758();
            return;
        }
        return parseMethodDefinition$842(existingProps$1342);
    }
    function parseClassBody$844() {
        var classElement$1343, classElements$1344 = [], existingProps$1345 = {};
        existingProps$1345[ClassPropertyType$710.static] = {};
        existingProps$1345[ClassPropertyType$710.prototype] = {};
        expect$765('{');
        while (streamIndex$723 < length$720) {
            if (match$767('}')) {
                break;
            }
            classElement$1343 = parseClassElement$843(existingProps$1345);
            if (typeof classElement$1343 !== 'undefined') {
                classElements$1344.push(classElement$1343);
            }
        }
        expect$765('}');
        return delegate$721.createClassBody(classElements$1344);
    }
    function parseClassExpression$845() {
        var id$1346, previousYieldAllowed$1347, superClass$1348 = null;
        expectKeyword$766('class');
        if (!matchKeyword$768('extends') && !match$767('{')) {
            id$1346 = parseVariableIdentifier$805();
        }
        if (matchKeyword$768('extends')) {
            expectKeyword$766('extends');
            previousYieldAllowed$1347 = state$726.yieldAllowed;
            state$726.yieldAllowed = false;
            superClass$1348 = parseAssignmentExpression$801();
            state$726.yieldAllowed = previousYieldAllowed$1347;
        }
        return delegate$721.createClassExpression(id$1346, superClass$1348, parseClassBody$844());
    }
    function parseClassDeclaration$846() {
        var id$1349, previousYieldAllowed$1350, superClass$1351 = null;
        expectKeyword$766('class');
        id$1349 = parseVariableIdentifier$805();
        if (matchKeyword$768('extends')) {
            expectKeyword$766('extends');
            previousYieldAllowed$1350 = state$726.yieldAllowed;
            state$726.yieldAllowed = false;
            superClass$1351 = parseAssignmentExpression$801();
            state$726.yieldAllowed = previousYieldAllowed$1350;
        }
        return delegate$721.createClassDeclaration(id$1349, superClass$1351, parseClassBody$844());
    }
    // 15 Program
    function matchModuleDeclaration$847() {
        var id$1352;
        if (matchContextualKeyword$769('module')) {
            id$1352 = lookahead2$760();
            return id$1352.type === Token$702.StringLiteral || id$1352.type === Token$702.Identifier;
        }
        return false;
    }
    function parseSourceElement$848() {
        if (lookahead$724.type === Token$702.Keyword) {
            switch (lookahead$724.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$809(lookahead$724.value);
            case 'function':
                return parseFunctionDeclaration$839();
            case 'export':
                return parseExportDeclaration$813();
            case 'import':
                return parseImportDeclaration$814();
            default:
                return parseStatement$833();
            }
        }
        if (matchModuleDeclaration$847()) {
            throwError$762({}, Messages$707.NestedModule);
        }
        if (lookahead$724.type !== Token$702.EOF) {
            return parseStatement$833();
        }
    }
    function parseProgramElement$849() {
        if (lookahead$724.type === Token$702.Keyword) {
            switch (lookahead$724.value) {
            case 'export':
                return parseExportDeclaration$813();
            case 'import':
                return parseImportDeclaration$814();
            }
        }
        if (matchModuleDeclaration$847()) {
            return parseModuleDeclaration$810();
        }
        return parseSourceElement$848();
    }
    function parseProgramElements$850() {
        var sourceElement$1353, sourceElements$1354 = [], token$1355, directive$1356, firstRestricted$1357;
        while (streamIndex$723 < length$720) {
            token$1355 = lookahead$724;
            if (token$1355.type !== Token$702.StringLiteral) {
                break;
            }
            sourceElement$1353 = parseProgramElement$849();
            sourceElements$1354.push(sourceElement$1353);
            if (sourceElement$1353.expression.type !== Syntax$705.Literal) {
                // this is not directive
                break;
            }
            assert$728(false, 'directive isn\'t right');
            directive$1356 = source$711.slice(token$1355.range[0] + 1, token$1355.range[1] - 1);
            if (directive$1356 === 'use strict') {
                strict$712 = true;
                if (firstRestricted$1357) {
                    throwErrorTolerant$763(firstRestricted$1357, Messages$707.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1357 && token$1355.octal) {
                    firstRestricted$1357 = token$1355;
                }
            }
        }
        while (streamIndex$723 < length$720) {
            sourceElement$1353 = parseProgramElement$849();
            if (typeof sourceElement$1353 === 'undefined') {
                break;
            }
            sourceElements$1354.push(sourceElement$1353);
        }
        return sourceElements$1354;
    }
    function parseModuleElement$851() {
        return parseSourceElement$848();
    }
    function parseModuleElements$852() {
        var list$1358 = [], statement$1359;
        while (streamIndex$723 < length$720) {
            if (match$767('}')) {
                break;
            }
            statement$1359 = parseModuleElement$851();
            if (typeof statement$1359 === 'undefined') {
                break;
            }
            list$1358.push(statement$1359);
        }
        return list$1358;
    }
    function parseModuleBlock$853() {
        var block$1360;
        expect$765('{');
        block$1360 = parseModuleElements$852();
        expect$765('}');
        return delegate$721.createBlockStatement(block$1360);
    }
    function parseProgram$854() {
        var body$1361;
        strict$712 = false;
        peek$759();
        body$1361 = parseProgramElements$850();
        return delegate$721.createProgram(body$1361);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$855(type$1362, value$1363, start$1364, end$1365, loc$1366) {
        assert$728(typeof start$1364 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$727.comments.length > 0) {
            if (extra$727.comments[extra$727.comments.length - 1].range[1] > start$1364) {
                return;
            }
        }
        extra$727.comments.push({
            type: type$1362,
            value: value$1363,
            range: [
                start$1364,
                end$1365
            ],
            loc: loc$1366
        });
    }
    function scanComment$856() {
        var comment$1367, ch$1368, loc$1369, start$1370, blockComment$1371, lineComment$1372;
        comment$1367 = '';
        blockComment$1371 = false;
        lineComment$1372 = false;
        while (index$713 < length$720) {
            ch$1368 = source$711[index$713];
            if (lineComment$1372) {
                ch$1368 = source$711[index$713++];
                if (isLineTerminator$734(ch$1368.charCodeAt(0))) {
                    loc$1369.end = {
                        line: lineNumber$714,
                        column: index$713 - lineStart$715 - 1
                    };
                    lineComment$1372 = false;
                    addComment$855('Line', comment$1367, start$1370, index$713 - 1, loc$1369);
                    if (ch$1368 === '\r' && source$711[index$713] === '\n') {
                        ++index$713;
                    }
                    ++lineNumber$714;
                    lineStart$715 = index$713;
                    comment$1367 = '';
                } else if (index$713 >= length$720) {
                    lineComment$1372 = false;
                    comment$1367 += ch$1368;
                    loc$1369.end = {
                        line: lineNumber$714,
                        column: length$720 - lineStart$715
                    };
                    addComment$855('Line', comment$1367, start$1370, length$720, loc$1369);
                } else {
                    comment$1367 += ch$1368;
                }
            } else if (blockComment$1371) {
                if (isLineTerminator$734(ch$1368.charCodeAt(0))) {
                    if (ch$1368 === '\r' && source$711[index$713 + 1] === '\n') {
                        ++index$713;
                        comment$1367 += '\r\n';
                    } else {
                        comment$1367 += ch$1368;
                    }
                    ++lineNumber$714;
                    ++index$713;
                    lineStart$715 = index$713;
                    if (index$713 >= length$720) {
                        throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1368 = source$711[index$713++];
                    if (index$713 >= length$720) {
                        throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1367 += ch$1368;
                    if (ch$1368 === '*') {
                        ch$1368 = source$711[index$713];
                        if (ch$1368 === '/') {
                            comment$1367 = comment$1367.substr(0, comment$1367.length - 1);
                            blockComment$1371 = false;
                            ++index$713;
                            loc$1369.end = {
                                line: lineNumber$714,
                                column: index$713 - lineStart$715
                            };
                            addComment$855('Block', comment$1367, start$1370, index$713, loc$1369);
                            comment$1367 = '';
                        }
                    }
                }
            } else if (ch$1368 === '/') {
                ch$1368 = source$711[index$713 + 1];
                if (ch$1368 === '/') {
                    loc$1369 = {
                        start: {
                            line: lineNumber$714,
                            column: index$713 - lineStart$715
                        }
                    };
                    start$1370 = index$713;
                    index$713 += 2;
                    lineComment$1372 = true;
                    if (index$713 >= length$720) {
                        loc$1369.end = {
                            line: lineNumber$714,
                            column: index$713 - lineStart$715
                        };
                        lineComment$1372 = false;
                        addComment$855('Line', comment$1367, start$1370, index$713, loc$1369);
                    }
                } else if (ch$1368 === '*') {
                    start$1370 = index$713;
                    index$713 += 2;
                    blockComment$1371 = true;
                    loc$1369 = {
                        start: {
                            line: lineNumber$714,
                            column: index$713 - lineStart$715 - 2
                        }
                    };
                    if (index$713 >= length$720) {
                        throwError$762({}, Messages$707.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$733(ch$1368.charCodeAt(0))) {
                ++index$713;
            } else if (isLineTerminator$734(ch$1368.charCodeAt(0))) {
                ++index$713;
                if (ch$1368 === '\r' && source$711[index$713] === '\n') {
                    ++index$713;
                }
                ++lineNumber$714;
                lineStart$715 = index$713;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$857() {
        var i$1373, entry$1374, comment$1375, comments$1376 = [];
        for (i$1373 = 0; i$1373 < extra$727.comments.length; ++i$1373) {
            entry$1374 = extra$727.comments[i$1373];
            comment$1375 = {
                type: entry$1374.type,
                value: entry$1374.value
            };
            if (extra$727.range) {
                comment$1375.range = entry$1374.range;
            }
            if (extra$727.loc) {
                comment$1375.loc = entry$1374.loc;
            }
            comments$1376.push(comment$1375);
        }
        extra$727.comments = comments$1376;
    }
    function collectToken$858() {
        var start$1377, loc$1378, token$1379, range$1380, value$1381;
        skipComment$741();
        start$1377 = index$713;
        loc$1378 = {
            start: {
                line: lineNumber$714,
                column: index$713 - lineStart$715
            }
        };
        token$1379 = extra$727.advance();
        loc$1378.end = {
            line: lineNumber$714,
            column: index$713 - lineStart$715
        };
        if (token$1379.type !== Token$702.EOF) {
            range$1380 = [
                token$1379.range[0],
                token$1379.range[1]
            ];
            value$1381 = source$711.slice(token$1379.range[0], token$1379.range[1]);
            extra$727.tokens.push({
                type: TokenName$703[token$1379.type],
                value: value$1381,
                range: range$1380,
                loc: loc$1378
            });
        }
        return token$1379;
    }
    function collectRegex$859() {
        var pos$1382, loc$1383, regex$1384, token$1385;
        skipComment$741();
        pos$1382 = index$713;
        loc$1383 = {
            start: {
                line: lineNumber$714,
                column: index$713 - lineStart$715
            }
        };
        regex$1384 = extra$727.scanRegExp();
        loc$1383.end = {
            line: lineNumber$714,
            column: index$713 - lineStart$715
        };
        if (!extra$727.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$727.tokens.length > 0) {
                token$1385 = extra$727.tokens[extra$727.tokens.length - 1];
                if (token$1385.range[0] === pos$1382 && token$1385.type === 'Punctuator') {
                    if (token$1385.value === '/' || token$1385.value === '/=') {
                        extra$727.tokens.pop();
                    }
                }
            }
            extra$727.tokens.push({
                type: 'RegularExpression',
                value: regex$1384.literal,
                range: [
                    pos$1382,
                    index$713
                ],
                loc: loc$1383
            });
        }
        return regex$1384;
    }
    function filterTokenLocation$860() {
        var i$1386, entry$1387, token$1388, tokens$1389 = [];
        for (i$1386 = 0; i$1386 < extra$727.tokens.length; ++i$1386) {
            entry$1387 = extra$727.tokens[i$1386];
            token$1388 = {
                type: entry$1387.type,
                value: entry$1387.value
            };
            if (extra$727.range) {
                token$1388.range = entry$1387.range;
            }
            if (extra$727.loc) {
                token$1388.loc = entry$1387.loc;
            }
            tokens$1389.push(token$1388);
        }
        extra$727.tokens = tokens$1389;
    }
    function LocationMarker$861() {
        var sm_index$1390 = lookahead$724 ? lookahead$724.sm_range[0] : 0;
        var sm_lineStart$1391 = lookahead$724 ? lookahead$724.sm_lineStart : 0;
        var sm_lineNumber$1392 = lookahead$724 ? lookahead$724.sm_lineNumber : 1;
        this.range = [
            sm_index$1390,
            sm_index$1390
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1392,
                column: sm_index$1390 - sm_lineStart$1391
            },
            end: {
                line: sm_lineNumber$1392,
                column: sm_index$1390 - sm_lineStart$1391
            }
        };
    }
    LocationMarker$861.prototype = {
        constructor: LocationMarker$861,
        end: function () {
            this.range[1] = sm_index$719;
            this.loc.end.line = sm_lineNumber$716;
            this.loc.end.column = sm_index$719 - sm_lineStart$717;
        },
        applyGroup: function (node$1393) {
            if (extra$727.range) {
                node$1393.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$727.loc) {
                node$1393.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1393 = delegate$721.postProcess(node$1393);
            }
        },
        apply: function (node$1394) {
            var nodeType$1395 = typeof node$1394;
            assert$728(nodeType$1395 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1395);
            if (extra$727.range) {
                node$1394.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$727.loc) {
                node$1394.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1394 = delegate$721.postProcess(node$1394);
            }
        }
    };
    function createLocationMarker$862() {
        return new LocationMarker$861();
    }
    function trackGroupExpression$863() {
        var marker$1396, expr$1397;
        marker$1396 = createLocationMarker$862();
        expect$765('(');
        ++state$726.parenthesizedCount;
        expr$1397 = parseExpression$802();
        expect$765(')');
        marker$1396.end();
        marker$1396.applyGroup(expr$1397);
        return expr$1397;
    }
    function trackLeftHandSideExpression$864() {
        var marker$1398, expr$1399;
        // skipComment();
        marker$1398 = createLocationMarker$862();
        expr$1399 = matchKeyword$768('new') ? parseNewExpression$789() : parsePrimaryExpression$783();
        while (match$767('.') || match$767('[') || lookahead$724.type === Token$702.Template) {
            if (match$767('[')) {
                expr$1399 = delegate$721.createMemberExpression('[', expr$1399, parseComputedMember$788());
                marker$1398.end();
                marker$1398.apply(expr$1399);
            } else if (match$767('.')) {
                expr$1399 = delegate$721.createMemberExpression('.', expr$1399, parseNonComputedMember$787());
                marker$1398.end();
                marker$1398.apply(expr$1399);
            } else {
                expr$1399 = delegate$721.createTaggedTemplateExpression(expr$1399, parseTemplateLiteral$781());
                marker$1398.end();
                marker$1398.apply(expr$1399);
            }
        }
        return expr$1399;
    }
    function trackLeftHandSideExpressionAllowCall$865() {
        var marker$1400, expr$1401, args$1402;
        // skipComment();
        marker$1400 = createLocationMarker$862();
        expr$1401 = matchKeyword$768('new') ? parseNewExpression$789() : parsePrimaryExpression$783();
        while (match$767('.') || match$767('[') || match$767('(') || lookahead$724.type === Token$702.Template) {
            if (match$767('(')) {
                args$1402 = parseArguments$784();
                expr$1401 = delegate$721.createCallExpression(expr$1401, args$1402);
                marker$1400.end();
                marker$1400.apply(expr$1401);
            } else if (match$767('[')) {
                expr$1401 = delegate$721.createMemberExpression('[', expr$1401, parseComputedMember$788());
                marker$1400.end();
                marker$1400.apply(expr$1401);
            } else if (match$767('.')) {
                expr$1401 = delegate$721.createMemberExpression('.', expr$1401, parseNonComputedMember$787());
                marker$1400.end();
                marker$1400.apply(expr$1401);
            } else {
                expr$1401 = delegate$721.createTaggedTemplateExpression(expr$1401, parseTemplateLiteral$781());
                marker$1400.end();
                marker$1400.apply(expr$1401);
            }
        }
        return expr$1401;
    }
    function filterGroup$866(node$1403) {
        var n$1404, i$1405, entry$1406;
        n$1404 = Object.prototype.toString.apply(node$1403) === '[object Array]' ? [] : {};
        for (i$1405 in node$1403) {
            if (node$1403.hasOwnProperty(i$1405) && i$1405 !== 'groupRange' && i$1405 !== 'groupLoc') {
                entry$1406 = node$1403[i$1405];
                if (entry$1406 === null || typeof entry$1406 !== 'object' || entry$1406 instanceof RegExp) {
                    n$1404[i$1405] = entry$1406;
                } else {
                    n$1404[i$1405] = filterGroup$866(entry$1406);
                }
            }
        }
        return n$1404;
    }
    function wrapTrackingFunction$867(range$1407, loc$1408) {
        return function (parseFunction$1409) {
            function isBinary$1410(node$1412) {
                return node$1412.type === Syntax$705.LogicalExpression || node$1412.type === Syntax$705.BinaryExpression;
            }
            function visit$1411(node$1413) {
                var start$1414, end$1415;
                if (isBinary$1410(node$1413.left)) {
                    visit$1411(node$1413.left);
                }
                if (isBinary$1410(node$1413.right)) {
                    visit$1411(node$1413.right);
                }
                if (range$1407) {
                    if (node$1413.left.groupRange || node$1413.right.groupRange) {
                        start$1414 = node$1413.left.groupRange ? node$1413.left.groupRange[0] : node$1413.left.range[0];
                        end$1415 = node$1413.right.groupRange ? node$1413.right.groupRange[1] : node$1413.right.range[1];
                        node$1413.range = [
                            start$1414,
                            end$1415
                        ];
                    } else if (typeof node$1413.range === 'undefined') {
                        start$1414 = node$1413.left.range[0];
                        end$1415 = node$1413.right.range[1];
                        node$1413.range = [
                            start$1414,
                            end$1415
                        ];
                    }
                }
                if (loc$1408) {
                    if (node$1413.left.groupLoc || node$1413.right.groupLoc) {
                        start$1414 = node$1413.left.groupLoc ? node$1413.left.groupLoc.start : node$1413.left.loc.start;
                        end$1415 = node$1413.right.groupLoc ? node$1413.right.groupLoc.end : node$1413.right.loc.end;
                        node$1413.loc = {
                            start: start$1414,
                            end: end$1415
                        };
                        node$1413 = delegate$721.postProcess(node$1413);
                    } else if (typeof node$1413.loc === 'undefined') {
                        node$1413.loc = {
                            start: node$1413.left.loc.start,
                            end: node$1413.right.loc.end
                        };
                        node$1413 = delegate$721.postProcess(node$1413);
                    }
                }
            }
            return function () {
                var marker$1416, node$1417, curr$1418 = lookahead$724;
                marker$1416 = createLocationMarker$862();
                node$1417 = parseFunction$1409.apply(null, arguments);
                marker$1416.end();
                if (node$1417.type !== Syntax$705.Program) {
                    if (curr$1418.leadingComments) {
                        node$1417.leadingComments = curr$1418.leadingComments;
                    }
                    if (curr$1418.trailingComments) {
                        node$1417.trailingComments = curr$1418.trailingComments;
                    }
                }
                if (range$1407 && typeof node$1417.range === 'undefined') {
                    marker$1416.apply(node$1417);
                }
                if (loc$1408 && typeof node$1417.loc === 'undefined') {
                    marker$1416.apply(node$1417);
                }
                if (isBinary$1410(node$1417)) {
                    visit$1411(node$1417);
                }
                return node$1417;
            };
        };
    }
    function patch$868() {
        var wrapTracking$1419;
        if (extra$727.comments) {
            extra$727.skipComment = skipComment$741;
            skipComment$741 = scanComment$856;
        }
        if (extra$727.range || extra$727.loc) {
            extra$727.parseGroupExpression = parseGroupExpression$782;
            extra$727.parseLeftHandSideExpression = parseLeftHandSideExpression$791;
            extra$727.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$790;
            parseGroupExpression$782 = trackGroupExpression$863;
            parseLeftHandSideExpression$791 = trackLeftHandSideExpression$864;
            parseLeftHandSideExpressionAllowCall$790 = trackLeftHandSideExpressionAllowCall$865;
            wrapTracking$1419 = wrapTrackingFunction$867(extra$727.range, extra$727.loc);
            extra$727.parseArrayInitialiser = parseArrayInitialiser$774;
            extra$727.parseAssignmentExpression = parseAssignmentExpression$801;
            extra$727.parseBinaryExpression = parseBinaryExpression$795;
            extra$727.parseBlock = parseBlock$804;
            extra$727.parseFunctionSourceElements = parseFunctionSourceElements$835;
            extra$727.parseCatchClause = parseCatchClause$830;
            extra$727.parseComputedMember = parseComputedMember$788;
            extra$727.parseConditionalExpression = parseConditionalExpression$796;
            extra$727.parseConstLetDeclaration = parseConstLetDeclaration$809;
            extra$727.parseExportBatchSpecifier = parseExportBatchSpecifier$811;
            extra$727.parseExportDeclaration = parseExportDeclaration$813;
            extra$727.parseExportSpecifier = parseExportSpecifier$812;
            extra$727.parseExpression = parseExpression$802;
            extra$727.parseForVariableDeclaration = parseForVariableDeclaration$821;
            extra$727.parseFunctionDeclaration = parseFunctionDeclaration$839;
            extra$727.parseFunctionExpression = parseFunctionExpression$840;
            extra$727.parseParams = parseParams$838;
            extra$727.parseImportDeclaration = parseImportDeclaration$814;
            extra$727.parseImportSpecifier = parseImportSpecifier$815;
            extra$727.parseModuleDeclaration = parseModuleDeclaration$810;
            extra$727.parseModuleBlock = parseModuleBlock$853;
            extra$727.parseNewExpression = parseNewExpression$789;
            extra$727.parseNonComputedProperty = parseNonComputedProperty$786;
            extra$727.parseObjectInitialiser = parseObjectInitialiser$779;
            extra$727.parseObjectProperty = parseObjectProperty$778;
            extra$727.parseObjectPropertyKey = parseObjectPropertyKey$777;
            extra$727.parsePostfixExpression = parsePostfixExpression$792;
            extra$727.parsePrimaryExpression = parsePrimaryExpression$783;
            extra$727.parseProgram = parseProgram$854;
            extra$727.parsePropertyFunction = parsePropertyFunction$775;
            extra$727.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$785;
            extra$727.parseTemplateElement = parseTemplateElement$780;
            extra$727.parseTemplateLiteral = parseTemplateLiteral$781;
            extra$727.parseStatement = parseStatement$833;
            extra$727.parseSwitchCase = parseSwitchCase$827;
            extra$727.parseUnaryExpression = parseUnaryExpression$793;
            extra$727.parseVariableDeclaration = parseVariableDeclaration$806;
            extra$727.parseVariableIdentifier = parseVariableIdentifier$805;
            extra$727.parseMethodDefinition = parseMethodDefinition$842;
            extra$727.parseClassDeclaration = parseClassDeclaration$846;
            extra$727.parseClassExpression = parseClassExpression$845;
            extra$727.parseClassBody = parseClassBody$844;
            parseArrayInitialiser$774 = wrapTracking$1419(extra$727.parseArrayInitialiser);
            parseAssignmentExpression$801 = wrapTracking$1419(extra$727.parseAssignmentExpression);
            parseBinaryExpression$795 = wrapTracking$1419(extra$727.parseBinaryExpression);
            parseBlock$804 = wrapTracking$1419(extra$727.parseBlock);
            parseFunctionSourceElements$835 = wrapTracking$1419(extra$727.parseFunctionSourceElements);
            parseCatchClause$830 = wrapTracking$1419(extra$727.parseCatchClause);
            parseComputedMember$788 = wrapTracking$1419(extra$727.parseComputedMember);
            parseConditionalExpression$796 = wrapTracking$1419(extra$727.parseConditionalExpression);
            parseConstLetDeclaration$809 = wrapTracking$1419(extra$727.parseConstLetDeclaration);
            parseExportBatchSpecifier$811 = wrapTracking$1419(parseExportBatchSpecifier$811);
            parseExportDeclaration$813 = wrapTracking$1419(parseExportDeclaration$813);
            parseExportSpecifier$812 = wrapTracking$1419(parseExportSpecifier$812);
            parseExpression$802 = wrapTracking$1419(extra$727.parseExpression);
            parseForVariableDeclaration$821 = wrapTracking$1419(extra$727.parseForVariableDeclaration);
            parseFunctionDeclaration$839 = wrapTracking$1419(extra$727.parseFunctionDeclaration);
            parseFunctionExpression$840 = wrapTracking$1419(extra$727.parseFunctionExpression);
            parseParams$838 = wrapTracking$1419(extra$727.parseParams);
            parseImportDeclaration$814 = wrapTracking$1419(extra$727.parseImportDeclaration);
            parseImportSpecifier$815 = wrapTracking$1419(extra$727.parseImportSpecifier);
            parseModuleDeclaration$810 = wrapTracking$1419(extra$727.parseModuleDeclaration);
            parseModuleBlock$853 = wrapTracking$1419(extra$727.parseModuleBlock);
            parseLeftHandSideExpression$791 = wrapTracking$1419(parseLeftHandSideExpression$791);
            parseNewExpression$789 = wrapTracking$1419(extra$727.parseNewExpression);
            parseNonComputedProperty$786 = wrapTracking$1419(extra$727.parseNonComputedProperty);
            parseObjectInitialiser$779 = wrapTracking$1419(extra$727.parseObjectInitialiser);
            parseObjectProperty$778 = wrapTracking$1419(extra$727.parseObjectProperty);
            parseObjectPropertyKey$777 = wrapTracking$1419(extra$727.parseObjectPropertyKey);
            parsePostfixExpression$792 = wrapTracking$1419(extra$727.parsePostfixExpression);
            parsePrimaryExpression$783 = wrapTracking$1419(extra$727.parsePrimaryExpression);
            parseProgram$854 = wrapTracking$1419(extra$727.parseProgram);
            parsePropertyFunction$775 = wrapTracking$1419(extra$727.parsePropertyFunction);
            parseTemplateElement$780 = wrapTracking$1419(extra$727.parseTemplateElement);
            parseTemplateLiteral$781 = wrapTracking$1419(extra$727.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$785 = wrapTracking$1419(extra$727.parseSpreadOrAssignmentExpression);
            parseStatement$833 = wrapTracking$1419(extra$727.parseStatement);
            parseSwitchCase$827 = wrapTracking$1419(extra$727.parseSwitchCase);
            parseUnaryExpression$793 = wrapTracking$1419(extra$727.parseUnaryExpression);
            parseVariableDeclaration$806 = wrapTracking$1419(extra$727.parseVariableDeclaration);
            parseVariableIdentifier$805 = wrapTracking$1419(extra$727.parseVariableIdentifier);
            parseMethodDefinition$842 = wrapTracking$1419(extra$727.parseMethodDefinition);
            parseClassDeclaration$846 = wrapTracking$1419(extra$727.parseClassDeclaration);
            parseClassExpression$845 = wrapTracking$1419(extra$727.parseClassExpression);
            parseClassBody$844 = wrapTracking$1419(extra$727.parseClassBody);
        }
        if (typeof extra$727.tokens !== 'undefined') {
            extra$727.advance = advance$757;
            extra$727.scanRegExp = scanRegExp$754;
            advance$757 = collectToken$858;
            scanRegExp$754 = collectRegex$859;
        }
    }
    function unpatch$869() {
        if (typeof extra$727.skipComment === 'function') {
            skipComment$741 = extra$727.skipComment;
        }
        if (extra$727.range || extra$727.loc) {
            parseArrayInitialiser$774 = extra$727.parseArrayInitialiser;
            parseAssignmentExpression$801 = extra$727.parseAssignmentExpression;
            parseBinaryExpression$795 = extra$727.parseBinaryExpression;
            parseBlock$804 = extra$727.parseBlock;
            parseFunctionSourceElements$835 = extra$727.parseFunctionSourceElements;
            parseCatchClause$830 = extra$727.parseCatchClause;
            parseComputedMember$788 = extra$727.parseComputedMember;
            parseConditionalExpression$796 = extra$727.parseConditionalExpression;
            parseConstLetDeclaration$809 = extra$727.parseConstLetDeclaration;
            parseExportBatchSpecifier$811 = extra$727.parseExportBatchSpecifier;
            parseExportDeclaration$813 = extra$727.parseExportDeclaration;
            parseExportSpecifier$812 = extra$727.parseExportSpecifier;
            parseExpression$802 = extra$727.parseExpression;
            parseForVariableDeclaration$821 = extra$727.parseForVariableDeclaration;
            parseFunctionDeclaration$839 = extra$727.parseFunctionDeclaration;
            parseFunctionExpression$840 = extra$727.parseFunctionExpression;
            parseImportDeclaration$814 = extra$727.parseImportDeclaration;
            parseImportSpecifier$815 = extra$727.parseImportSpecifier;
            parseGroupExpression$782 = extra$727.parseGroupExpression;
            parseLeftHandSideExpression$791 = extra$727.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$790 = extra$727.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$810 = extra$727.parseModuleDeclaration;
            parseModuleBlock$853 = extra$727.parseModuleBlock;
            parseNewExpression$789 = extra$727.parseNewExpression;
            parseNonComputedProperty$786 = extra$727.parseNonComputedProperty;
            parseObjectInitialiser$779 = extra$727.parseObjectInitialiser;
            parseObjectProperty$778 = extra$727.parseObjectProperty;
            parseObjectPropertyKey$777 = extra$727.parseObjectPropertyKey;
            parsePostfixExpression$792 = extra$727.parsePostfixExpression;
            parsePrimaryExpression$783 = extra$727.parsePrimaryExpression;
            parseProgram$854 = extra$727.parseProgram;
            parsePropertyFunction$775 = extra$727.parsePropertyFunction;
            parseTemplateElement$780 = extra$727.parseTemplateElement;
            parseTemplateLiteral$781 = extra$727.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$785 = extra$727.parseSpreadOrAssignmentExpression;
            parseStatement$833 = extra$727.parseStatement;
            parseSwitchCase$827 = extra$727.parseSwitchCase;
            parseUnaryExpression$793 = extra$727.parseUnaryExpression;
            parseVariableDeclaration$806 = extra$727.parseVariableDeclaration;
            parseVariableIdentifier$805 = extra$727.parseVariableIdentifier;
            parseMethodDefinition$842 = extra$727.parseMethodDefinition;
            parseClassDeclaration$846 = extra$727.parseClassDeclaration;
            parseClassExpression$845 = extra$727.parseClassExpression;
            parseClassBody$844 = extra$727.parseClassBody;
        }
        if (typeof extra$727.scanRegExp === 'function') {
            advance$757 = extra$727.advance;
            scanRegExp$754 = extra$727.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$870(object$1420, properties$1421) {
        var entry$1422, result$1423 = {};
        for (entry$1422 in object$1420) {
            if (object$1420.hasOwnProperty(entry$1422)) {
                result$1423[entry$1422] = object$1420[entry$1422];
            }
        }
        for (entry$1422 in properties$1421) {
            if (properties$1421.hasOwnProperty(entry$1422)) {
                result$1423[entry$1422] = properties$1421[entry$1422];
            }
        }
        return result$1423;
    }
    function tokenize$871(code$1424, options$1425) {
        var toString$1426, token$1427, tokens$1428;
        toString$1426 = String;
        if (typeof code$1424 !== 'string' && !(code$1424 instanceof String)) {
            code$1424 = toString$1426(code$1424);
        }
        delegate$721 = SyntaxTreeDelegate$709;
        source$711 = code$1424;
        index$713 = 0;
        lineNumber$714 = source$711.length > 0 ? 1 : 0;
        lineStart$715 = 0;
        length$720 = source$711.length;
        lookahead$724 = null;
        state$726 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$727 = {};
        // Options matching.
        options$1425 = options$1425 || {};
        // Of course we collect tokens here.
        options$1425.tokens = true;
        extra$727.tokens = [];
        extra$727.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$727.openParenToken = -1;
        extra$727.openCurlyToken = -1;
        extra$727.range = typeof options$1425.range === 'boolean' && options$1425.range;
        extra$727.loc = typeof options$1425.loc === 'boolean' && options$1425.loc;
        if (typeof options$1425.comment === 'boolean' && options$1425.comment) {
            extra$727.comments = [];
        }
        if (typeof options$1425.tolerant === 'boolean' && options$1425.tolerant) {
            extra$727.errors = [];
        }
        if (length$720 > 0) {
            if (typeof source$711[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1424 instanceof String) {
                    source$711 = code$1424.valueOf();
                }
            }
        }
        patch$868();
        try {
            peek$759();
            if (lookahead$724.type === Token$702.EOF) {
                return extra$727.tokens;
            }
            token$1427 = lex$758();
            while (lookahead$724.type !== Token$702.EOF) {
                try {
                    token$1427 = lex$758();
                } catch (lexError$1429) {
                    token$1427 = lookahead$724;
                    if (extra$727.errors) {
                        extra$727.errors.push(lexError$1429);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1429;
                    }
                }
            }
            filterTokenLocation$860();
            tokens$1428 = extra$727.tokens;
            if (typeof extra$727.comments !== 'undefined') {
                filterCommentLocation$857();
                tokens$1428.comments = extra$727.comments;
            }
            if (typeof extra$727.errors !== 'undefined') {
                tokens$1428.errors = extra$727.errors;
            }
        } catch (e$1430) {
            throw e$1430;
        } finally {
            unpatch$869();
            extra$727 = {};
        }
        return tokens$1428;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$872(toks$1431, start$1432, inExprDelim$1433, parentIsBlock$1434) {
        var assignOps$1435 = [
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
        var binaryOps$1436 = [
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
        var unaryOps$1437 = [
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
        function back$1438(n$1439) {
            var idx$1440 = toks$1431.length - n$1439 > 0 ? toks$1431.length - n$1439 : 0;
            return toks$1431[idx$1440];
        }
        if (inExprDelim$1433 && toks$1431.length - (start$1432 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1438(start$1432 + 2).value === ':' && parentIsBlock$1434) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$729(back$1438(start$1432 + 2).value, unaryOps$1437.concat(binaryOps$1436).concat(assignOps$1435))) {
            // ... + {...}
            return false;
        } else if (back$1438(start$1432 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1441 = typeof back$1438(start$1432 + 1).startLineNumber !== 'undefined' ? back$1438(start$1432 + 1).startLineNumber : back$1438(start$1432 + 1).lineNumber;
            if (back$1438(start$1432 + 2).lineNumber !== currLineNumber$1441) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$729(back$1438(start$1432 + 2).value, [
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
    function readToken$873(toks$1442, inExprDelim$1443, parentIsBlock$1444) {
        var delimiters$1445 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1446 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1447 = toks$1442.length - 1;
        var comments$1448, commentsLen$1449 = extra$727.comments.length;
        function back$1450(n$1454) {
            var idx$1455 = toks$1442.length - n$1454 > 0 ? toks$1442.length - n$1454 : 0;
            return toks$1442[idx$1455];
        }
        function attachComments$1451(token$1456) {
            if (comments$1448) {
                token$1456.leadingComments = comments$1448;
            }
            return token$1456;
        }
        function _advance$1452() {
            return attachComments$1451(advance$757());
        }
        function _scanRegExp$1453() {
            return attachComments$1451(scanRegExp$754());
        }
        skipComment$741();
        if (extra$727.comments.length > commentsLen$1449) {
            comments$1448 = extra$727.comments.slice(commentsLen$1449);
        }
        if (isIn$729(source$711[index$713], delimiters$1445)) {
            return attachComments$1451(readDelim$874(toks$1442, inExprDelim$1443, parentIsBlock$1444));
        }
        if (source$711[index$713] === '/') {
            var prev$1457 = back$1450(1);
            if (prev$1457) {
                if (prev$1457.value === '()') {
                    if (isIn$729(back$1450(2).value, parenIdents$1446)) {
                        // ... if (...) / ...
                        return _scanRegExp$1453();
                    }
                    // ... (...) / ...
                    return _advance$1452();
                }
                if (prev$1457.value === '{}') {
                    if (blockAllowed$872(toks$1442, 0, inExprDelim$1443, parentIsBlock$1444)) {
                        if (back$1450(2).value === '()') {
                            // named function
                            if (back$1450(4).value === 'function') {
                                if (!blockAllowed$872(toks$1442, 3, inExprDelim$1443, parentIsBlock$1444)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1452();
                                }
                                if (toks$1442.length - 5 <= 0 && inExprDelim$1443) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1452();
                                }
                            }
                            // unnamed function
                            if (back$1450(3).value === 'function') {
                                if (!blockAllowed$872(toks$1442, 2, inExprDelim$1443, parentIsBlock$1444)) {
                                    // new function (...) {...} / ...
                                    return _advance$1452();
                                }
                                if (toks$1442.length - 4 <= 0 && inExprDelim$1443) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1452();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1453();
                    } else {
                        // ... + {...} / ...
                        return _advance$1452();
                    }
                }
                if (prev$1457.type === Token$702.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1453();
                }
                if (isKeyword$740(prev$1457.value)) {
                    // typeof /...
                    return _scanRegExp$1453();
                }
                return _advance$1452();
            }
            return _scanRegExp$1453();
        }
        return _advance$1452();
    }
    function readDelim$874(toks$1458, inExprDelim$1459, parentIsBlock$1460) {
        var startDelim$1461 = advance$757(), matchDelim$1462 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1463 = [];
        var delimiters$1464 = [
                '(',
                '{',
                '['
            ];
        assert$728(delimiters$1464.indexOf(startDelim$1461.value) !== -1, 'Need to begin at the delimiter');
        var token$1465 = startDelim$1461;
        var startLineNumber$1466 = token$1465.lineNumber;
        var startLineStart$1467 = token$1465.lineStart;
        var startRange$1468 = token$1465.range;
        var delimToken$1469 = {};
        delimToken$1469.type = Token$702.Delimiter;
        delimToken$1469.value = startDelim$1461.value + matchDelim$1462[startDelim$1461.value];
        delimToken$1469.startLineNumber = startLineNumber$1466;
        delimToken$1469.startLineStart = startLineStart$1467;
        delimToken$1469.startRange = startRange$1468;
        var delimIsBlock$1470 = false;
        if (startDelim$1461.value === '{') {
            delimIsBlock$1470 = blockAllowed$872(toks$1458.concat(delimToken$1469), 0, inExprDelim$1459, parentIsBlock$1460);
        }
        while (index$713 <= length$720) {
            token$1465 = readToken$873(inner$1463, startDelim$1461.value === '(' || startDelim$1461.value === '[', delimIsBlock$1470);
            if (token$1465.type === Token$702.Punctuator && token$1465.value === matchDelim$1462[startDelim$1461.value]) {
                if (token$1465.leadingComments) {
                    delimToken$1469.trailingComments = token$1465.leadingComments;
                }
                break;
            } else if (token$1465.type === Token$702.EOF) {
                throwError$762({}, Messages$707.UnexpectedEOS);
            } else {
                inner$1463.push(token$1465);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$713 >= length$720 && matchDelim$1462[startDelim$1461.value] !== source$711[length$720 - 1]) {
            throwError$762({}, Messages$707.UnexpectedEOS);
        }
        var endLineNumber$1471 = token$1465.lineNumber;
        var endLineStart$1472 = token$1465.lineStart;
        var endRange$1473 = token$1465.range;
        delimToken$1469.inner = inner$1463;
        delimToken$1469.endLineNumber = endLineNumber$1471;
        delimToken$1469.endLineStart = endLineStart$1472;
        delimToken$1469.endRange = endRange$1473;
        return delimToken$1469;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$875(code$1474) {
        var token$1475, tokenTree$1476 = [];
        extra$727 = {};
        extra$727.comments = [];
        patch$868();
        source$711 = code$1474;
        index$713 = 0;
        lineNumber$714 = source$711.length > 0 ? 1 : 0;
        lineStart$715 = 0;
        length$720 = source$711.length;
        state$726 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$713 < length$720) {
            tokenTree$1476.push(readToken$873(tokenTree$1476, false, false));
        }
        var last$1477 = tokenTree$1476[tokenTree$1476.length - 1];
        if (last$1477 && last$1477.type !== Token$702.EOF) {
            tokenTree$1476.push({
                type: Token$702.EOF,
                value: '',
                lineNumber: last$1477.lineNumber,
                lineStart: last$1477.lineStart,
                range: [
                    index$713,
                    index$713
                ]
            });
        }
        return expander$701.tokensToSyntax(tokenTree$1476);
    }
    function parse$876(code$1478, options$1479) {
        var program$1480, toString$1481;
        extra$727 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1478)) {
            tokenStream$722 = code$1478;
            length$720 = tokenStream$722.length;
            lineNumber$714 = tokenStream$722.length > 0 ? 1 : 0;
            source$711 = undefined;
        } else {
            toString$1481 = String;
            if (typeof code$1478 !== 'string' && !(code$1478 instanceof String)) {
                code$1478 = toString$1481(code$1478);
            }
            source$711 = code$1478;
            length$720 = source$711.length;
            lineNumber$714 = source$711.length > 0 ? 1 : 0;
        }
        delegate$721 = SyntaxTreeDelegate$709;
        streamIndex$723 = -1;
        index$713 = 0;
        lineStart$715 = 0;
        sm_lineStart$717 = 0;
        sm_lineNumber$716 = lineNumber$714;
        sm_index$719 = 0;
        sm_range$718 = [
            0,
            0
        ];
        lookahead$724 = null;
        state$726 = {
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
        if (typeof options$1479 !== 'undefined') {
            extra$727.range = typeof options$1479.range === 'boolean' && options$1479.range;
            extra$727.loc = typeof options$1479.loc === 'boolean' && options$1479.loc;
            if (extra$727.loc && options$1479.source !== null && options$1479.source !== undefined) {
                delegate$721 = extend$870(delegate$721, {
                    'postProcess': function (node$1482) {
                        node$1482.loc.source = toString$1481(options$1479.source);
                        return node$1482;
                    }
                });
            }
            if (typeof options$1479.tokens === 'boolean' && options$1479.tokens) {
                extra$727.tokens = [];
            }
            if (typeof options$1479.comment === 'boolean' && options$1479.comment) {
                extra$727.comments = [];
            }
            if (typeof options$1479.tolerant === 'boolean' && options$1479.tolerant) {
                extra$727.errors = [];
            }
        }
        if (length$720 > 0) {
            if (source$711 && typeof source$711[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1478 instanceof String) {
                    source$711 = code$1478.valueOf();
                }
            }
        }
        extra$727 = { loc: true };
        patch$868();
        try {
            program$1480 = parseProgram$854();
            if (typeof extra$727.comments !== 'undefined') {
                filterCommentLocation$857();
                program$1480.comments = extra$727.comments;
            }
            if (typeof extra$727.tokens !== 'undefined') {
                filterTokenLocation$860();
                program$1480.tokens = extra$727.tokens;
            }
            if (typeof extra$727.errors !== 'undefined') {
                program$1480.errors = extra$727.errors;
            }
            if (extra$727.range || extra$727.loc) {
                program$1480.body = filterGroup$866(program$1480.body);
            }
        } catch (e$1483) {
            throw e$1483;
        } finally {
            unpatch$869();
            extra$727 = {};
        }
        return program$1480;
    }
    exports$700.tokenize = tokenize$871;
    exports$700.read = read$875;
    exports$700.Token = Token$702;
    exports$700.assert = assert$728;
    exports$700.parse = parse$876;
    // Deep copy.
    exports$700.Syntax = function () {
        var name$1484, types$1485 = {};
        if (typeof Object.create === 'function') {
            types$1485 = Object.create(null);
        }
        for (name$1484 in Syntax$705) {
            if (Syntax$705.hasOwnProperty(name$1484)) {
                types$1485[name$1484] = Syntax$705[name$1484];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1485);
        }
        return types$1485;
    }();
}));
//# sourceMappingURL=parser.js.map