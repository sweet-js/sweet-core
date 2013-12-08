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
(function (root$830, factory$831) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$831);
    } else if (typeof exports !== 'undefined') {
        factory$831(exports, require('./expander'));
    } else {
        factory$831(root$830.esprima = {});
    }
}(this, function (exports$832, expander$833) {
    'use strict';
    var Token$834, TokenName$835, FnExprTokens$836, Syntax$837, PropertyKind$838, Messages$839, Regex$840, SyntaxTreeDelegate$841, ClassPropertyType$842, source$843, strict$844, index$845, lineNumber$846, lineStart$847, sm_lineNumber$848, sm_lineStart$849, sm_range$850, sm_index$851, length$852, delegate$853, tokenStream$854, streamIndex$855, lookahead$856, lookaheadIndex$857, state$858, extra$859;
    Token$834 = {
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
    TokenName$835 = {};
    TokenName$835[Token$834.BooleanLiteral] = 'Boolean';
    TokenName$835[Token$834.EOF] = '<end>';
    TokenName$835[Token$834.Identifier] = 'Identifier';
    TokenName$835[Token$834.Keyword] = 'Keyword';
    TokenName$835[Token$834.NullLiteral] = 'Null';
    TokenName$835[Token$834.NumericLiteral] = 'Numeric';
    TokenName$835[Token$834.Punctuator] = 'Punctuator';
    TokenName$835[Token$834.StringLiteral] = 'String';
    TokenName$835[Token$834.RegularExpression] = 'RegularExpression';
    TokenName$835[Token$834.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$836 = [
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
    Syntax$837 = {
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
    PropertyKind$838 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$842 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$839 = {
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
    Regex$840 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$860(condition$1009, message$1010) {
        if (!condition$1009) {
            throw new Error('ASSERT: ' + message$1010);
        }
    }
    function isIn$861(el$1011, list$1012) {
        return list$1012.indexOf(el$1011) !== -1;
    }
    function isDecimalDigit$862(ch$1013) {
        return ch$1013 >= 48 && ch$1013 <= 57;
    }    // 0..9
    function isHexDigit$863(ch$1014) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1014) >= 0;
    }
    function isOctalDigit$864(ch$1015) {
        return '01234567'.indexOf(ch$1015) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$865(ch$1016) {
        return ch$1016 === 32 || ch$1016 === 9 || ch$1016 === 11 || ch$1016 === 12 || ch$1016 === 160 || ch$1016 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1016)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$866(ch$1017) {
        return ch$1017 === 10 || ch$1017 === 13 || ch$1017 === 8232 || ch$1017 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$867(ch$1018) {
        return ch$1018 === 36 || ch$1018 === 95 || ch$1018 >= 65 && ch$1018 <= 90 || ch$1018 >= 97 && ch$1018 <= 122 || ch$1018 === 92 || ch$1018 >= 128 && Regex$840.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1018));
    }
    function isIdentifierPart$868(ch$1019) {
        return ch$1019 === 36 || ch$1019 === 95 || ch$1019 >= 65 && ch$1019 <= 90 || ch$1019 >= 97 && ch$1019 <= 122 || ch$1019 >= 48 && ch$1019 <= 57 || ch$1019 === 92 || ch$1019 >= 128 && Regex$840.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1019));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$869(id$1020) {
        switch (id$1020) {
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
    function isStrictModeReservedWord$870(id$1021) {
        switch (id$1021) {
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
    function isRestrictedWord$871(id$1022) {
        return id$1022 === 'eval' || id$1022 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$872(id$1023) {
        if (strict$844 && isStrictModeReservedWord$870(id$1023)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1023.length) {
        case 2:
            return id$1023 === 'if' || id$1023 === 'in' || id$1023 === 'do';
        case 3:
            return id$1023 === 'var' || id$1023 === 'for' || id$1023 === 'new' || id$1023 === 'try' || id$1023 === 'let';
        case 4:
            return id$1023 === 'this' || id$1023 === 'else' || id$1023 === 'case' || id$1023 === 'void' || id$1023 === 'with' || id$1023 === 'enum';
        case 5:
            return id$1023 === 'while' || id$1023 === 'break' || id$1023 === 'catch' || id$1023 === 'throw' || id$1023 === 'const' || id$1023 === 'yield' || id$1023 === 'class' || id$1023 === 'super';
        case 6:
            return id$1023 === 'return' || id$1023 === 'typeof' || id$1023 === 'delete' || id$1023 === 'switch' || id$1023 === 'export' || id$1023 === 'import';
        case 7:
            return id$1023 === 'default' || id$1023 === 'finally' || id$1023 === 'extends';
        case 8:
            return id$1023 === 'function' || id$1023 === 'continue' || id$1023 === 'debugger';
        case 10:
            return id$1023 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$873() {
        var ch$1024, blockComment$1025, lineComment$1026;
        blockComment$1025 = false;
        lineComment$1026 = false;
        while (index$845 < length$852) {
            ch$1024 = source$843.charCodeAt(index$845);
            if (lineComment$1026) {
                ++index$845;
                if (isLineTerminator$866(ch$1024)) {
                    lineComment$1026 = false;
                    if (ch$1024 === 13 && source$843.charCodeAt(index$845) === 10) {
                        ++index$845;
                    }
                    ++lineNumber$846;
                    lineStart$847 = index$845;
                }
            } else if (blockComment$1025) {
                if (isLineTerminator$866(ch$1024)) {
                    if (ch$1024 === 13 && source$843.charCodeAt(index$845 + 1) === 10) {
                        ++index$845;
                    }
                    ++lineNumber$846;
                    ++index$845;
                    lineStart$847 = index$845;
                    if (index$845 >= length$852) {
                        throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1024 = source$843.charCodeAt(index$845++);
                    if (index$845 >= length$852) {
                        throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1024 === 42) {
                        ch$1024 = source$843.charCodeAt(index$845);
                        if (ch$1024 === 47) {
                            ++index$845;
                            blockComment$1025 = false;
                        }
                    }
                }
            } else if (ch$1024 === 47) {
                ch$1024 = source$843.charCodeAt(index$845 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1024 === 47) {
                    index$845 += 2;
                    lineComment$1026 = true;
                } else if (ch$1024 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$845 += 2;
                    blockComment$1025 = true;
                    if (index$845 >= length$852) {
                        throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$865(ch$1024)) {
                ++index$845;
            } else if (isLineTerminator$866(ch$1024)) {
                ++index$845;
                if (ch$1024 === 13 && source$843.charCodeAt(index$845) === 10) {
                    ++index$845;
                }
                ++lineNumber$846;
                lineStart$847 = index$845;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$874(prefix$1027) {
        var i$1028, len$1029, ch$1030, code$1031 = 0;
        len$1029 = prefix$1027 === 'u' ? 4 : 2;
        for (i$1028 = 0; i$1028 < len$1029; ++i$1028) {
            if (index$845 < length$852 && isHexDigit$863(source$843[index$845])) {
                ch$1030 = source$843[index$845++];
                code$1031 = code$1031 * 16 + '0123456789abcdef'.indexOf(ch$1030.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1031);
    }
    function scanUnicodeCodePointEscape$875() {
        var ch$1032, code$1033, cu1$1034, cu2$1035;
        ch$1032 = source$843[index$845];
        code$1033 = 0;
        // At least, one hex digit is required.
        if (ch$1032 === '}') {
            throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
        }
        while (index$845 < length$852) {
            ch$1032 = source$843[index$845++];
            if (!isHexDigit$863(ch$1032)) {
                break;
            }
            code$1033 = code$1033 * 16 + '0123456789abcdef'.indexOf(ch$1032.toLowerCase());
        }
        if (code$1033 > 1114111 || ch$1032 !== '}') {
            throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1033 <= 65535) {
            return String.fromCharCode(code$1033);
        }
        cu1$1034 = (code$1033 - 65536 >> 10) + 55296;
        cu2$1035 = (code$1033 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1034, cu2$1035);
    }
    function getEscapedIdentifier$876() {
        var ch$1036, id$1037;
        ch$1036 = source$843.charCodeAt(index$845++);
        id$1037 = String.fromCharCode(ch$1036);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1036 === 92) {
            if (source$843.charCodeAt(index$845) !== 117) {
                throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
            }
            ++index$845;
            ch$1036 = scanHexEscape$874('u');
            if (!ch$1036 || ch$1036 === '\\' || !isIdentifierStart$867(ch$1036.charCodeAt(0))) {
                throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
            }
            id$1037 = ch$1036;
        }
        while (index$845 < length$852) {
            ch$1036 = source$843.charCodeAt(index$845);
            if (!isIdentifierPart$868(ch$1036)) {
                break;
            }
            ++index$845;
            id$1037 += String.fromCharCode(ch$1036);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1036 === 92) {
                id$1037 = id$1037.substr(0, id$1037.length - 1);
                if (source$843.charCodeAt(index$845) !== 117) {
                    throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
                }
                ++index$845;
                ch$1036 = scanHexEscape$874('u');
                if (!ch$1036 || ch$1036 === '\\' || !isIdentifierPart$868(ch$1036.charCodeAt(0))) {
                    throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
                }
                id$1037 += ch$1036;
            }
        }
        return id$1037;
    }
    function getIdentifier$877() {
        var start$1038, ch$1039;
        start$1038 = index$845++;
        while (index$845 < length$852) {
            ch$1039 = source$843.charCodeAt(index$845);
            if (ch$1039 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$845 = start$1038;
                return getEscapedIdentifier$876();
            }
            if (isIdentifierPart$868(ch$1039)) {
                ++index$845;
            } else {
                break;
            }
        }
        return source$843.slice(start$1038, index$845);
    }
    function scanIdentifier$878() {
        var start$1040, id$1041, type$1042;
        start$1040 = index$845;
        // Backslash (char #92) starts an escaped character.
        id$1041 = source$843.charCodeAt(index$845) === 92 ? getEscapedIdentifier$876() : getIdentifier$877();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1041.length === 1) {
            type$1042 = Token$834.Identifier;
        } else if (isKeyword$872(id$1041)) {
            type$1042 = Token$834.Keyword;
        } else if (id$1041 === 'null') {
            type$1042 = Token$834.NullLiteral;
        } else if (id$1041 === 'true' || id$1041 === 'false') {
            type$1042 = Token$834.BooleanLiteral;
        } else {
            type$1042 = Token$834.Identifier;
        }
        return {
            type: type$1042,
            value: id$1041,
            lineNumber: lineNumber$846,
            lineStart: lineStart$847,
            range: [
                start$1040,
                index$845
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$879() {
        var start$1043 = index$845, code$1044 = source$843.charCodeAt(index$845), code2$1045, ch1$1046 = source$843[index$845], ch2$1047, ch3$1048, ch4$1049;
        switch (code$1044) {
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
            ++index$845;
            if (extra$859.tokenize) {
                if (code$1044 === 40) {
                    extra$859.openParenToken = extra$859.tokens.length;
                } else if (code$1044 === 123) {
                    extra$859.openCurlyToken = extra$859.tokens.length;
                }
            }
            return {
                type: Token$834.Punctuator,
                value: String.fromCharCode(code$1044),
                lineNumber: lineNumber$846,
                lineStart: lineStart$847,
                range: [
                    start$1043,
                    index$845
                ]
            };
        default:
            code2$1045 = source$843.charCodeAt(index$845 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1045 === 61) {
                switch (code$1044) {
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
                    index$845 += 2;
                    return {
                        type: Token$834.Punctuator,
                        value: String.fromCharCode(code$1044) + String.fromCharCode(code2$1045),
                        lineNumber: lineNumber$846,
                        lineStart: lineStart$847,
                        range: [
                            start$1043,
                            index$845
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$845 += 2;
                    // !== and ===
                    if (source$843.charCodeAt(index$845) === 61) {
                        ++index$845;
                    }
                    return {
                        type: Token$834.Punctuator,
                        value: source$843.slice(start$1043, index$845),
                        lineNumber: lineNumber$846,
                        lineStart: lineStart$847,
                        range: [
                            start$1043,
                            index$845
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1047 = source$843[index$845 + 1];
        ch3$1048 = source$843[index$845 + 2];
        ch4$1049 = source$843[index$845 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1046 === '>' && ch2$1047 === '>' && ch3$1048 === '>') {
            if (ch4$1049 === '=') {
                index$845 += 4;
                return {
                    type: Token$834.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$846,
                    lineStart: lineStart$847,
                    range: [
                        start$1043,
                        index$845
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1046 === '>' && ch2$1047 === '>' && ch3$1048 === '>') {
            index$845 += 3;
            return {
                type: Token$834.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$846,
                lineStart: lineStart$847,
                range: [
                    start$1043,
                    index$845
                ]
            };
        }
        if (ch1$1046 === '<' && ch2$1047 === '<' && ch3$1048 === '=') {
            index$845 += 3;
            return {
                type: Token$834.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$846,
                lineStart: lineStart$847,
                range: [
                    start$1043,
                    index$845
                ]
            };
        }
        if (ch1$1046 === '>' && ch2$1047 === '>' && ch3$1048 === '=') {
            index$845 += 3;
            return {
                type: Token$834.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$846,
                lineStart: lineStart$847,
                range: [
                    start$1043,
                    index$845
                ]
            };
        }
        if (ch1$1046 === '.' && ch2$1047 === '.' && ch3$1048 === '.') {
            index$845 += 3;
            return {
                type: Token$834.Punctuator,
                value: '...',
                lineNumber: lineNumber$846,
                lineStart: lineStart$847,
                range: [
                    start$1043,
                    index$845
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1046 === ch2$1047 && '+-<>&|'.indexOf(ch1$1046) >= 0) {
            index$845 += 2;
            return {
                type: Token$834.Punctuator,
                value: ch1$1046 + ch2$1047,
                lineNumber: lineNumber$846,
                lineStart: lineStart$847,
                range: [
                    start$1043,
                    index$845
                ]
            };
        }
        if (ch1$1046 === '=' && ch2$1047 === '>') {
            index$845 += 2;
            return {
                type: Token$834.Punctuator,
                value: '=>',
                lineNumber: lineNumber$846,
                lineStart: lineStart$847,
                range: [
                    start$1043,
                    index$845
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1046) >= 0) {
            ++index$845;
            return {
                type: Token$834.Punctuator,
                value: ch1$1046,
                lineNumber: lineNumber$846,
                lineStart: lineStart$847,
                range: [
                    start$1043,
                    index$845
                ]
            };
        }
        if (ch1$1046 === '.') {
            ++index$845;
            return {
                type: Token$834.Punctuator,
                value: ch1$1046,
                lineNumber: lineNumber$846,
                lineStart: lineStart$847,
                range: [
                    start$1043,
                    index$845
                ]
            };
        }
        throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$880(start$1050) {
        var number$1051 = '';
        while (index$845 < length$852) {
            if (!isHexDigit$863(source$843[index$845])) {
                break;
            }
            number$1051 += source$843[index$845++];
        }
        if (number$1051.length === 0) {
            throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$867(source$843.charCodeAt(index$845))) {
            throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$834.NumericLiteral,
            value: parseInt('0x' + number$1051, 16),
            lineNumber: lineNumber$846,
            lineStart: lineStart$847,
            range: [
                start$1050,
                index$845
            ]
        };
    }
    function scanOctalLiteral$881(prefix$1052, start$1053) {
        var number$1054, octal$1055;
        if (isOctalDigit$864(prefix$1052)) {
            octal$1055 = true;
            number$1054 = '0' + source$843[index$845++];
        } else {
            octal$1055 = false;
            ++index$845;
            number$1054 = '';
        }
        while (index$845 < length$852) {
            if (!isOctalDigit$864(source$843[index$845])) {
                break;
            }
            number$1054 += source$843[index$845++];
        }
        if (!octal$1055 && number$1054.length === 0) {
            // only 0o or 0O
            throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$867(source$843.charCodeAt(index$845)) || isDecimalDigit$862(source$843.charCodeAt(index$845))) {
            throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$834.NumericLiteral,
            value: parseInt(number$1054, 8),
            octal: octal$1055,
            lineNumber: lineNumber$846,
            lineStart: lineStart$847,
            range: [
                start$1053,
                index$845
            ]
        };
    }
    function scanNumericLiteral$882() {
        var number$1056, start$1057, ch$1058, octal$1059;
        ch$1058 = source$843[index$845];
        assert$860(isDecimalDigit$862(ch$1058.charCodeAt(0)) || ch$1058 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1057 = index$845;
        number$1056 = '';
        if (ch$1058 !== '.') {
            number$1056 = source$843[index$845++];
            ch$1058 = source$843[index$845];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1056 === '0') {
                if (ch$1058 === 'x' || ch$1058 === 'X') {
                    ++index$845;
                    return scanHexLiteral$880(start$1057);
                }
                if (ch$1058 === 'b' || ch$1058 === 'B') {
                    ++index$845;
                    number$1056 = '';
                    while (index$845 < length$852) {
                        ch$1058 = source$843[index$845];
                        if (ch$1058 !== '0' && ch$1058 !== '1') {
                            break;
                        }
                        number$1056 += source$843[index$845++];
                    }
                    if (number$1056.length === 0) {
                        // only 0b or 0B
                        throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$845 < length$852) {
                        ch$1058 = source$843.charCodeAt(index$845);
                        if (isIdentifierStart$867(ch$1058) || isDecimalDigit$862(ch$1058)) {
                            throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$834.NumericLiteral,
                        value: parseInt(number$1056, 2),
                        lineNumber: lineNumber$846,
                        lineStart: lineStart$847,
                        range: [
                            start$1057,
                            index$845
                        ]
                    };
                }
                if (ch$1058 === 'o' || ch$1058 === 'O' || isOctalDigit$864(ch$1058)) {
                    return scanOctalLiteral$881(ch$1058, start$1057);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1058 && isDecimalDigit$862(ch$1058.charCodeAt(0))) {
                    throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$862(source$843.charCodeAt(index$845))) {
                number$1056 += source$843[index$845++];
            }
            ch$1058 = source$843[index$845];
        }
        if (ch$1058 === '.') {
            number$1056 += source$843[index$845++];
            while (isDecimalDigit$862(source$843.charCodeAt(index$845))) {
                number$1056 += source$843[index$845++];
            }
            ch$1058 = source$843[index$845];
        }
        if (ch$1058 === 'e' || ch$1058 === 'E') {
            number$1056 += source$843[index$845++];
            ch$1058 = source$843[index$845];
            if (ch$1058 === '+' || ch$1058 === '-') {
                number$1056 += source$843[index$845++];
            }
            if (isDecimalDigit$862(source$843.charCodeAt(index$845))) {
                while (isDecimalDigit$862(source$843.charCodeAt(index$845))) {
                    number$1056 += source$843[index$845++];
                }
            } else {
                throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$867(source$843.charCodeAt(index$845))) {
            throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$834.NumericLiteral,
            value: parseFloat(number$1056),
            lineNumber: lineNumber$846,
            lineStart: lineStart$847,
            range: [
                start$1057,
                index$845
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$883() {
        var str$1060 = '', quote$1061, start$1062, ch$1063, code$1064, unescaped$1065, restore$1066, octal$1067 = false;
        quote$1061 = source$843[index$845];
        assert$860(quote$1061 === '\'' || quote$1061 === '"', 'String literal must starts with a quote');
        start$1062 = index$845;
        ++index$845;
        while (index$845 < length$852) {
            ch$1063 = source$843[index$845++];
            if (ch$1063 === quote$1061) {
                quote$1061 = '';
                break;
            } else if (ch$1063 === '\\') {
                ch$1063 = source$843[index$845++];
                if (!ch$1063 || !isLineTerminator$866(ch$1063.charCodeAt(0))) {
                    switch (ch$1063) {
                    case 'n':
                        str$1060 += '\n';
                        break;
                    case 'r':
                        str$1060 += '\r';
                        break;
                    case 't':
                        str$1060 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$843[index$845] === '{') {
                            ++index$845;
                            str$1060 += scanUnicodeCodePointEscape$875();
                        } else {
                            restore$1066 = index$845;
                            unescaped$1065 = scanHexEscape$874(ch$1063);
                            if (unescaped$1065) {
                                str$1060 += unescaped$1065;
                            } else {
                                index$845 = restore$1066;
                                str$1060 += ch$1063;
                            }
                        }
                        break;
                    case 'b':
                        str$1060 += '\b';
                        break;
                    case 'f':
                        str$1060 += '\f';
                        break;
                    case 'v':
                        str$1060 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$864(ch$1063)) {
                            code$1064 = '01234567'.indexOf(ch$1063);
                            // \0 is not octal escape sequence
                            if (code$1064 !== 0) {
                                octal$1067 = true;
                            }
                            if (index$845 < length$852 && isOctalDigit$864(source$843[index$845])) {
                                octal$1067 = true;
                                code$1064 = code$1064 * 8 + '01234567'.indexOf(source$843[index$845++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1063) >= 0 && index$845 < length$852 && isOctalDigit$864(source$843[index$845])) {
                                    code$1064 = code$1064 * 8 + '01234567'.indexOf(source$843[index$845++]);
                                }
                            }
                            str$1060 += String.fromCharCode(code$1064);
                        } else {
                            str$1060 += ch$1063;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$846;
                    if (ch$1063 === '\r' && source$843[index$845] === '\n') {
                        ++index$845;
                    }
                }
            } else if (isLineTerminator$866(ch$1063.charCodeAt(0))) {
                break;
            } else {
                str$1060 += ch$1063;
            }
        }
        if (quote$1061 !== '') {
            throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$834.StringLiteral,
            value: str$1060,
            octal: octal$1067,
            lineNumber: lineNumber$846,
            lineStart: lineStart$847,
            range: [
                start$1062,
                index$845
            ]
        };
    }
    function scanTemplate$884() {
        var cooked$1068 = '', ch$1069, start$1070, terminated$1071, tail$1072, restore$1073, unescaped$1074, code$1075, octal$1076;
        terminated$1071 = false;
        tail$1072 = false;
        start$1070 = index$845;
        ++index$845;
        while (index$845 < length$852) {
            ch$1069 = source$843[index$845++];
            if (ch$1069 === '`') {
                tail$1072 = true;
                terminated$1071 = true;
                break;
            } else if (ch$1069 === '$') {
                if (source$843[index$845] === '{') {
                    ++index$845;
                    terminated$1071 = true;
                    break;
                }
                cooked$1068 += ch$1069;
            } else if (ch$1069 === '\\') {
                ch$1069 = source$843[index$845++];
                if (!isLineTerminator$866(ch$1069.charCodeAt(0))) {
                    switch (ch$1069) {
                    case 'n':
                        cooked$1068 += '\n';
                        break;
                    case 'r':
                        cooked$1068 += '\r';
                        break;
                    case 't':
                        cooked$1068 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$843[index$845] === '{') {
                            ++index$845;
                            cooked$1068 += scanUnicodeCodePointEscape$875();
                        } else {
                            restore$1073 = index$845;
                            unescaped$1074 = scanHexEscape$874(ch$1069);
                            if (unescaped$1074) {
                                cooked$1068 += unescaped$1074;
                            } else {
                                index$845 = restore$1073;
                                cooked$1068 += ch$1069;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1068 += '\b';
                        break;
                    case 'f':
                        cooked$1068 += '\f';
                        break;
                    case 'v':
                        cooked$1068 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$864(ch$1069)) {
                            code$1075 = '01234567'.indexOf(ch$1069);
                            // \0 is not octal escape sequence
                            if (code$1075 !== 0) {
                                octal$1076 = true;
                            }
                            if (index$845 < length$852 && isOctalDigit$864(source$843[index$845])) {
                                octal$1076 = true;
                                code$1075 = code$1075 * 8 + '01234567'.indexOf(source$843[index$845++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1069) >= 0 && index$845 < length$852 && isOctalDigit$864(source$843[index$845])) {
                                    code$1075 = code$1075 * 8 + '01234567'.indexOf(source$843[index$845++]);
                                }
                            }
                            cooked$1068 += String.fromCharCode(code$1075);
                        } else {
                            cooked$1068 += ch$1069;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$846;
                    if (ch$1069 === '\r' && source$843[index$845] === '\n') {
                        ++index$845;
                    }
                }
            } else if (isLineTerminator$866(ch$1069.charCodeAt(0))) {
                ++lineNumber$846;
                if (ch$1069 === '\r' && source$843[index$845] === '\n') {
                    ++index$845;
                }
                cooked$1068 += '\n';
            } else {
                cooked$1068 += ch$1069;
            }
        }
        if (!terminated$1071) {
            throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$834.Template,
            value: {
                cooked: cooked$1068,
                raw: source$843.slice(start$1070 + 1, index$845 - (tail$1072 ? 1 : 2))
            },
            tail: tail$1072,
            octal: octal$1076,
            lineNumber: lineNumber$846,
            lineStart: lineStart$847,
            range: [
                start$1070,
                index$845
            ]
        };
    }
    function scanTemplateElement$885(option$1077) {
        var startsWith$1078, template$1079;
        lookahead$856 = null;
        skipComment$873();
        startsWith$1078 = option$1077.head ? '`' : '}';
        if (source$843[index$845] !== startsWith$1078) {
            throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
        }
        template$1079 = scanTemplate$884();
        peek$891();
        return template$1079;
    }
    function scanRegExp$886() {
        var str$1080, ch$1081, start$1082, pattern$1083, flags$1084, value$1085, classMarker$1086 = false, restore$1087, terminated$1088 = false;
        lookahead$856 = null;
        skipComment$873();
        start$1082 = index$845;
        ch$1081 = source$843[index$845];
        assert$860(ch$1081 === '/', 'Regular expression literal must start with a slash');
        str$1080 = source$843[index$845++];
        while (index$845 < length$852) {
            ch$1081 = source$843[index$845++];
            str$1080 += ch$1081;
            if (classMarker$1086) {
                if (ch$1081 === ']') {
                    classMarker$1086 = false;
                }
            } else {
                if (ch$1081 === '\\') {
                    ch$1081 = source$843[index$845++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$866(ch$1081.charCodeAt(0))) {
                        throwError$894({}, Messages$839.UnterminatedRegExp);
                    }
                    str$1080 += ch$1081;
                } else if (ch$1081 === '/') {
                    terminated$1088 = true;
                    break;
                } else if (ch$1081 === '[') {
                    classMarker$1086 = true;
                } else if (isLineTerminator$866(ch$1081.charCodeAt(0))) {
                    throwError$894({}, Messages$839.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1088) {
            throwError$894({}, Messages$839.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1083 = str$1080.substr(1, str$1080.length - 2);
        flags$1084 = '';
        while (index$845 < length$852) {
            ch$1081 = source$843[index$845];
            if (!isIdentifierPart$868(ch$1081.charCodeAt(0))) {
                break;
            }
            ++index$845;
            if (ch$1081 === '\\' && index$845 < length$852) {
                ch$1081 = source$843[index$845];
                if (ch$1081 === 'u') {
                    ++index$845;
                    restore$1087 = index$845;
                    ch$1081 = scanHexEscape$874('u');
                    if (ch$1081) {
                        flags$1084 += ch$1081;
                        for (str$1080 += '\\u'; restore$1087 < index$845; ++restore$1087) {
                            str$1080 += source$843[restore$1087];
                        }
                    } else {
                        index$845 = restore$1087;
                        flags$1084 += 'u';
                        str$1080 += '\\u';
                    }
                } else {
                    str$1080 += '\\';
                }
            } else {
                flags$1084 += ch$1081;
                str$1080 += ch$1081;
            }
        }
        try {
            value$1085 = new RegExp(pattern$1083, flags$1084);
        } catch (e$1089) {
            throwError$894({}, Messages$839.InvalidRegExp);
        }
        // peek();
        if (extra$859.tokenize) {
            return {
                type: Token$834.RegularExpression,
                value: value$1085,
                lineNumber: lineNumber$846,
                lineStart: lineStart$847,
                range: [
                    start$1082,
                    index$845
                ]
            };
        }
        return {
            type: Token$834.RegularExpression,
            literal: str$1080,
            value: value$1085,
            range: [
                start$1082,
                index$845
            ]
        };
    }
    function isIdentifierName$887(token$1090) {
        return token$1090.type === Token$834.Identifier || token$1090.type === Token$834.Keyword || token$1090.type === Token$834.BooleanLiteral || token$1090.type === Token$834.NullLiteral;
    }
    function advanceSlash$888() {
        var prevToken$1091, checkToken$1092;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1091 = extra$859.tokens[extra$859.tokens.length - 1];
        if (!prevToken$1091) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$886();
        }
        if (prevToken$1091.type === 'Punctuator') {
            if (prevToken$1091.value === ')') {
                checkToken$1092 = extra$859.tokens[extra$859.openParenToken - 1];
                if (checkToken$1092 && checkToken$1092.type === 'Keyword' && (checkToken$1092.value === 'if' || checkToken$1092.value === 'while' || checkToken$1092.value === 'for' || checkToken$1092.value === 'with')) {
                    return scanRegExp$886();
                }
                return scanPunctuator$879();
            }
            if (prevToken$1091.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$859.tokens[extra$859.openCurlyToken - 3] && extra$859.tokens[extra$859.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1092 = extra$859.tokens[extra$859.openCurlyToken - 4];
                    if (!checkToken$1092) {
                        return scanPunctuator$879();
                    }
                } else if (extra$859.tokens[extra$859.openCurlyToken - 4] && extra$859.tokens[extra$859.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1092 = extra$859.tokens[extra$859.openCurlyToken - 5];
                    if (!checkToken$1092) {
                        return scanRegExp$886();
                    }
                } else {
                    return scanPunctuator$879();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$836.indexOf(checkToken$1092.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$879();
                }
                // It is a declaration.
                return scanRegExp$886();
            }
            return scanRegExp$886();
        }
        if (prevToken$1091.type === 'Keyword') {
            return scanRegExp$886();
        }
        return scanPunctuator$879();
    }
    function advance$889() {
        var ch$1093;
        skipComment$873();
        if (index$845 >= length$852) {
            return {
                type: Token$834.EOF,
                lineNumber: lineNumber$846,
                lineStart: lineStart$847,
                range: [
                    index$845,
                    index$845
                ]
            };
        }
        ch$1093 = source$843.charCodeAt(index$845);
        // Very common: ( and ) and ;
        if (ch$1093 === 40 || ch$1093 === 41 || ch$1093 === 58) {
            return scanPunctuator$879();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1093 === 39 || ch$1093 === 34) {
            return scanStringLiteral$883();
        }
        if (ch$1093 === 96) {
            return scanTemplate$884();
        }
        if (isIdentifierStart$867(ch$1093)) {
            return scanIdentifier$878();
        }
        // # and @ are allowed for sweet.js
        if (ch$1093 === 35 || ch$1093 === 64) {
            ++index$845;
            return {
                type: Token$834.Punctuator,
                value: String.fromCharCode(ch$1093),
                lineNumber: lineNumber$846,
                lineStart: lineStart$847,
                range: [
                    index$845 - 1,
                    index$845
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1093 === 46) {
            if (isDecimalDigit$862(source$843.charCodeAt(index$845 + 1))) {
                return scanNumericLiteral$882();
            }
            return scanPunctuator$879();
        }
        if (isDecimalDigit$862(ch$1093)) {
            return scanNumericLiteral$882();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$859.tokenize && ch$1093 === 47) {
            return advanceSlash$888();
        }
        return scanPunctuator$879();
    }
    function lex$890() {
        var token$1094;
        token$1094 = lookahead$856;
        streamIndex$855 = lookaheadIndex$857;
        lineNumber$846 = token$1094.lineNumber;
        lineStart$847 = token$1094.lineStart;
        sm_lineNumber$848 = lookahead$856.sm_lineNumber;
        sm_lineStart$849 = lookahead$856.sm_lineStart;
        sm_range$850 = lookahead$856.sm_range;
        sm_index$851 = lookahead$856.sm_range[0];
        lookahead$856 = tokenStream$854[++streamIndex$855].token;
        lookaheadIndex$857 = streamIndex$855;
        index$845 = lookahead$856.range[0];
        return token$1094;
    }
    function peek$891() {
        lookaheadIndex$857 = streamIndex$855 + 1;
        if (lookaheadIndex$857 >= length$852) {
            lookahead$856 = {
                type: Token$834.EOF,
                lineNumber: lineNumber$846,
                lineStart: lineStart$847,
                range: [
                    index$845,
                    index$845
                ]
            };
            return;
        }
        lookahead$856 = tokenStream$854[lookaheadIndex$857].token;
        index$845 = lookahead$856.range[0];
    }
    function lookahead2$892() {
        var adv$1095, pos$1096, line$1097, start$1098, result$1099;
        if (streamIndex$855 + 1 >= length$852 || streamIndex$855 + 2 >= length$852) {
            return {
                type: Token$834.EOF,
                lineNumber: lineNumber$846,
                lineStart: lineStart$847,
                range: [
                    index$845,
                    index$845
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$856 === null) {
            lookaheadIndex$857 = streamIndex$855 + 1;
            lookahead$856 = tokenStream$854[lookaheadIndex$857].token;
            index$845 = lookahead$856.range[0];
        }
        result$1099 = tokenStream$854[lookaheadIndex$857 + 1].token;
        return result$1099;
    }
    SyntaxTreeDelegate$841 = {
        name: 'SyntaxTree',
        postProcess: function (node$1100) {
            return node$1100;
        },
        createArrayExpression: function (elements$1101) {
            return {
                type: Syntax$837.ArrayExpression,
                elements: elements$1101
            };
        },
        createAssignmentExpression: function (operator$1102, left$1103, right$1104) {
            return {
                type: Syntax$837.AssignmentExpression,
                operator: operator$1102,
                left: left$1103,
                right: right$1104
            };
        },
        createBinaryExpression: function (operator$1105, left$1106, right$1107) {
            var type$1108 = operator$1105 === '||' || operator$1105 === '&&' ? Syntax$837.LogicalExpression : Syntax$837.BinaryExpression;
            return {
                type: type$1108,
                operator: operator$1105,
                left: left$1106,
                right: right$1107
            };
        },
        createBlockStatement: function (body$1109) {
            return {
                type: Syntax$837.BlockStatement,
                body: body$1109
            };
        },
        createBreakStatement: function (label$1110) {
            return {
                type: Syntax$837.BreakStatement,
                label: label$1110
            };
        },
        createCallExpression: function (callee$1111, args$1112) {
            return {
                type: Syntax$837.CallExpression,
                callee: callee$1111,
                'arguments': args$1112
            };
        },
        createCatchClause: function (param$1113, body$1114) {
            return {
                type: Syntax$837.CatchClause,
                param: param$1113,
                body: body$1114
            };
        },
        createConditionalExpression: function (test$1115, consequent$1116, alternate$1117) {
            return {
                type: Syntax$837.ConditionalExpression,
                test: test$1115,
                consequent: consequent$1116,
                alternate: alternate$1117
            };
        },
        createContinueStatement: function (label$1118) {
            return {
                type: Syntax$837.ContinueStatement,
                label: label$1118
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$837.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1119, test$1120) {
            return {
                type: Syntax$837.DoWhileStatement,
                body: body$1119,
                test: test$1120
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$837.EmptyStatement };
        },
        createExpressionStatement: function (expression$1121) {
            return {
                type: Syntax$837.ExpressionStatement,
                expression: expression$1121
            };
        },
        createForStatement: function (init$1122, test$1123, update$1124, body$1125) {
            return {
                type: Syntax$837.ForStatement,
                init: init$1122,
                test: test$1123,
                update: update$1124,
                body: body$1125
            };
        },
        createForInStatement: function (left$1126, right$1127, body$1128) {
            return {
                type: Syntax$837.ForInStatement,
                left: left$1126,
                right: right$1127,
                body: body$1128,
                each: false
            };
        },
        createForOfStatement: function (left$1129, right$1130, body$1131) {
            return {
                type: Syntax$837.ForOfStatement,
                left: left$1129,
                right: right$1130,
                body: body$1131
            };
        },
        createFunctionDeclaration: function (id$1132, params$1133, defaults$1134, body$1135, rest$1136, generator$1137, expression$1138) {
            return {
                type: Syntax$837.FunctionDeclaration,
                id: id$1132,
                params: params$1133,
                defaults: defaults$1134,
                body: body$1135,
                rest: rest$1136,
                generator: generator$1137,
                expression: expression$1138
            };
        },
        createFunctionExpression: function (id$1139, params$1140, defaults$1141, body$1142, rest$1143, generator$1144, expression$1145) {
            return {
                type: Syntax$837.FunctionExpression,
                id: id$1139,
                params: params$1140,
                defaults: defaults$1141,
                body: body$1142,
                rest: rest$1143,
                generator: generator$1144,
                expression: expression$1145
            };
        },
        createIdentifier: function (name$1146) {
            return {
                type: Syntax$837.Identifier,
                name: name$1146
            };
        },
        createIfStatement: function (test$1147, consequent$1148, alternate$1149) {
            return {
                type: Syntax$837.IfStatement,
                test: test$1147,
                consequent: consequent$1148,
                alternate: alternate$1149
            };
        },
        createLabeledStatement: function (label$1150, body$1151) {
            return {
                type: Syntax$837.LabeledStatement,
                label: label$1150,
                body: body$1151
            };
        },
        createLiteral: function (token$1152) {
            return {
                type: Syntax$837.Literal,
                value: token$1152.value,
                raw: String(token$1152.value)
            };
        },
        createMemberExpression: function (accessor$1153, object$1154, property$1155) {
            return {
                type: Syntax$837.MemberExpression,
                computed: accessor$1153 === '[',
                object: object$1154,
                property: property$1155
            };
        },
        createNewExpression: function (callee$1156, args$1157) {
            return {
                type: Syntax$837.NewExpression,
                callee: callee$1156,
                'arguments': args$1157
            };
        },
        createObjectExpression: function (properties$1158) {
            return {
                type: Syntax$837.ObjectExpression,
                properties: properties$1158
            };
        },
        createPostfixExpression: function (operator$1159, argument$1160) {
            return {
                type: Syntax$837.UpdateExpression,
                operator: operator$1159,
                argument: argument$1160,
                prefix: false
            };
        },
        createProgram: function (body$1161) {
            return {
                type: Syntax$837.Program,
                body: body$1161
            };
        },
        createProperty: function (kind$1162, key$1163, value$1164, method$1165, shorthand$1166) {
            return {
                type: Syntax$837.Property,
                key: key$1163,
                value: value$1164,
                kind: kind$1162,
                method: method$1165,
                shorthand: shorthand$1166
            };
        },
        createReturnStatement: function (argument$1167) {
            return {
                type: Syntax$837.ReturnStatement,
                argument: argument$1167
            };
        },
        createSequenceExpression: function (expressions$1168) {
            return {
                type: Syntax$837.SequenceExpression,
                expressions: expressions$1168
            };
        },
        createSwitchCase: function (test$1169, consequent$1170) {
            return {
                type: Syntax$837.SwitchCase,
                test: test$1169,
                consequent: consequent$1170
            };
        },
        createSwitchStatement: function (discriminant$1171, cases$1172) {
            return {
                type: Syntax$837.SwitchStatement,
                discriminant: discriminant$1171,
                cases: cases$1172
            };
        },
        createThisExpression: function () {
            return { type: Syntax$837.ThisExpression };
        },
        createThrowStatement: function (argument$1173) {
            return {
                type: Syntax$837.ThrowStatement,
                argument: argument$1173
            };
        },
        createTryStatement: function (block$1174, guardedHandlers$1175, handlers$1176, finalizer$1177) {
            return {
                type: Syntax$837.TryStatement,
                block: block$1174,
                guardedHandlers: guardedHandlers$1175,
                handlers: handlers$1176,
                finalizer: finalizer$1177
            };
        },
        createUnaryExpression: function (operator$1178, argument$1179) {
            if (operator$1178 === '++' || operator$1178 === '--') {
                return {
                    type: Syntax$837.UpdateExpression,
                    operator: operator$1178,
                    argument: argument$1179,
                    prefix: true
                };
            }
            return {
                type: Syntax$837.UnaryExpression,
                operator: operator$1178,
                argument: argument$1179
            };
        },
        createVariableDeclaration: function (declarations$1180, kind$1181) {
            return {
                type: Syntax$837.VariableDeclaration,
                declarations: declarations$1180,
                kind: kind$1181
            };
        },
        createVariableDeclarator: function (id$1182, init$1183) {
            return {
                type: Syntax$837.VariableDeclarator,
                id: id$1182,
                init: init$1183
            };
        },
        createWhileStatement: function (test$1184, body$1185) {
            return {
                type: Syntax$837.WhileStatement,
                test: test$1184,
                body: body$1185
            };
        },
        createWithStatement: function (object$1186, body$1187) {
            return {
                type: Syntax$837.WithStatement,
                object: object$1186,
                body: body$1187
            };
        },
        createTemplateElement: function (value$1188, tail$1189) {
            return {
                type: Syntax$837.TemplateElement,
                value: value$1188,
                tail: tail$1189
            };
        },
        createTemplateLiteral: function (quasis$1190, expressions$1191) {
            return {
                type: Syntax$837.TemplateLiteral,
                quasis: quasis$1190,
                expressions: expressions$1191
            };
        },
        createSpreadElement: function (argument$1192) {
            return {
                type: Syntax$837.SpreadElement,
                argument: argument$1192
            };
        },
        createTaggedTemplateExpression: function (tag$1193, quasi$1194) {
            return {
                type: Syntax$837.TaggedTemplateExpression,
                tag: tag$1193,
                quasi: quasi$1194
            };
        },
        createArrowFunctionExpression: function (params$1195, defaults$1196, body$1197, rest$1198, expression$1199) {
            return {
                type: Syntax$837.ArrowFunctionExpression,
                id: null,
                params: params$1195,
                defaults: defaults$1196,
                body: body$1197,
                rest: rest$1198,
                generator: false,
                expression: expression$1199
            };
        },
        createMethodDefinition: function (propertyType$1200, kind$1201, key$1202, value$1203) {
            return {
                type: Syntax$837.MethodDefinition,
                key: key$1202,
                value: value$1203,
                kind: kind$1201,
                'static': propertyType$1200 === ClassPropertyType$842.static
            };
        },
        createClassBody: function (body$1204) {
            return {
                type: Syntax$837.ClassBody,
                body: body$1204
            };
        },
        createClassExpression: function (id$1205, superClass$1206, body$1207) {
            return {
                type: Syntax$837.ClassExpression,
                id: id$1205,
                superClass: superClass$1206,
                body: body$1207
            };
        },
        createClassDeclaration: function (id$1208, superClass$1209, body$1210) {
            return {
                type: Syntax$837.ClassDeclaration,
                id: id$1208,
                superClass: superClass$1209,
                body: body$1210
            };
        },
        createExportSpecifier: function (id$1211, name$1212) {
            return {
                type: Syntax$837.ExportSpecifier,
                id: id$1211,
                name: name$1212
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$837.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1213, specifiers$1214, source$1215) {
            return {
                type: Syntax$837.ExportDeclaration,
                declaration: declaration$1213,
                specifiers: specifiers$1214,
                source: source$1215
            };
        },
        createImportSpecifier: function (id$1216, name$1217) {
            return {
                type: Syntax$837.ImportSpecifier,
                id: id$1216,
                name: name$1217
            };
        },
        createImportDeclaration: function (specifiers$1218, kind$1219, source$1220) {
            return {
                type: Syntax$837.ImportDeclaration,
                specifiers: specifiers$1218,
                kind: kind$1219,
                source: source$1220
            };
        },
        createYieldExpression: function (argument$1221, delegate$1222) {
            return {
                type: Syntax$837.YieldExpression,
                argument: argument$1221,
                delegate: delegate$1222
            };
        },
        createModuleDeclaration: function (id$1223, source$1224, body$1225) {
            return {
                type: Syntax$837.ModuleDeclaration,
                id: id$1223,
                source: source$1224,
                body: body$1225
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$893() {
        return lookahead$856.lineNumber !== lineNumber$846;
    }
    // Throw an exception
    function throwError$894(token$1226, messageFormat$1227) {
        var error$1228, args$1229 = Array.prototype.slice.call(arguments, 2), msg$1230 = messageFormat$1227.replace(/%(\d)/g, function (whole$1231, index$1232) {
                assert$860(index$1232 < args$1229.length, 'Message reference must be in range');
                return args$1229[index$1232];
            });
        if (typeof token$1226.lineNumber === 'number') {
            error$1228 = new Error('Line ' + token$1226.lineNumber + ': ' + msg$1230);
            error$1228.index = token$1226.range[0];
            error$1228.lineNumber = token$1226.lineNumber;
            error$1228.column = token$1226.range[0] - lineStart$847 + 1;
        } else {
            error$1228 = new Error('Line ' + lineNumber$846 + ': ' + msg$1230);
            error$1228.index = index$845;
            error$1228.lineNumber = lineNumber$846;
            error$1228.column = index$845 - lineStart$847 + 1;
        }
        error$1228.description = msg$1230;
        throw error$1228;
    }
    function throwErrorTolerant$895() {
        try {
            throwError$894.apply(null, arguments);
        } catch (e$1233) {
            if (extra$859.errors) {
                extra$859.errors.push(e$1233);
            } else {
                throw e$1233;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$896(token$1234) {
        if (token$1234.type === Token$834.EOF) {
            throwError$894(token$1234, Messages$839.UnexpectedEOS);
        }
        if (token$1234.type === Token$834.NumericLiteral) {
            throwError$894(token$1234, Messages$839.UnexpectedNumber);
        }
        if (token$1234.type === Token$834.StringLiteral) {
            throwError$894(token$1234, Messages$839.UnexpectedString);
        }
        if (token$1234.type === Token$834.Identifier) {
            throwError$894(token$1234, Messages$839.UnexpectedIdentifier);
        }
        if (token$1234.type === Token$834.Keyword) {
            if (isFutureReservedWord$869(token$1234.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$844 && isStrictModeReservedWord$870(token$1234.value)) {
                throwErrorTolerant$895(token$1234, Messages$839.StrictReservedWord);
                return;
            }
            throwError$894(token$1234, Messages$839.UnexpectedToken, token$1234.value);
        }
        if (token$1234.type === Token$834.Template) {
            throwError$894(token$1234, Messages$839.UnexpectedTemplate, token$1234.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$894(token$1234, Messages$839.UnexpectedToken, token$1234.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$897(value$1235) {
        var token$1236 = lex$890();
        if (token$1236.type !== Token$834.Punctuator || token$1236.value !== value$1235) {
            throwUnexpected$896(token$1236);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$898(keyword$1237) {
        var token$1238 = lex$890();
        if (token$1238.type !== Token$834.Keyword || token$1238.value !== keyword$1237) {
            throwUnexpected$896(token$1238);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$899(value$1239) {
        return lookahead$856.type === Token$834.Punctuator && lookahead$856.value === value$1239;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$900(keyword$1240) {
        return lookahead$856.type === Token$834.Keyword && lookahead$856.value === keyword$1240;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$901(keyword$1241) {
        return lookahead$856.type === Token$834.Identifier && lookahead$856.value === keyword$1241;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$902() {
        var op$1242;
        if (lookahead$856.type !== Token$834.Punctuator) {
            return false;
        }
        op$1242 = lookahead$856.value;
        return op$1242 === '=' || op$1242 === '*=' || op$1242 === '/=' || op$1242 === '%=' || op$1242 === '+=' || op$1242 === '-=' || op$1242 === '<<=' || op$1242 === '>>=' || op$1242 === '>>>=' || op$1242 === '&=' || op$1242 === '^=' || op$1242 === '|=';
    }
    function consumeSemicolon$903() {
        var line$1243, ch$1244;
        ch$1244 = lookahead$856.value ? String(lookahead$856.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1244 === 59) {
            lex$890();
            return;
        }
        if (lookahead$856.lineNumber !== lineNumber$846) {
            return;
        }
        if (match$899(';')) {
            lex$890();
            return;
        }
        if (lookahead$856.type !== Token$834.EOF && !match$899('}')) {
            throwUnexpected$896(lookahead$856);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$904(expr$1245) {
        return expr$1245.type === Syntax$837.Identifier || expr$1245.type === Syntax$837.MemberExpression;
    }
    function isAssignableLeftHandSide$905(expr$1246) {
        return isLeftHandSide$904(expr$1246) || expr$1246.type === Syntax$837.ObjectPattern || expr$1246.type === Syntax$837.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$906() {
        var elements$1247 = [], blocks$1248 = [], filter$1249 = null, tmp$1250, possiblecomprehension$1251 = true, body$1252;
        expect$897('[');
        while (!match$899(']')) {
            if (lookahead$856.value === 'for' && lookahead$856.type === Token$834.Keyword) {
                if (!possiblecomprehension$1251) {
                    throwError$894({}, Messages$839.ComprehensionError);
                }
                matchKeyword$900('for');
                tmp$1250 = parseForStatement$954({ ignoreBody: true });
                tmp$1250.of = tmp$1250.type === Syntax$837.ForOfStatement;
                tmp$1250.type = Syntax$837.ComprehensionBlock;
                if (tmp$1250.left.kind) {
                    // can't be let or const
                    throwError$894({}, Messages$839.ComprehensionError);
                }
                blocks$1248.push(tmp$1250);
            } else if (lookahead$856.value === 'if' && lookahead$856.type === Token$834.Keyword) {
                if (!possiblecomprehension$1251) {
                    throwError$894({}, Messages$839.ComprehensionError);
                }
                expectKeyword$898('if');
                expect$897('(');
                filter$1249 = parseExpression$934();
                expect$897(')');
            } else if (lookahead$856.value === ',' && lookahead$856.type === Token$834.Punctuator) {
                possiblecomprehension$1251 = false;
                // no longer allowed.
                lex$890();
                elements$1247.push(null);
            } else {
                tmp$1250 = parseSpreadOrAssignmentExpression$917();
                elements$1247.push(tmp$1250);
                if (tmp$1250 && tmp$1250.type === Syntax$837.SpreadElement) {
                    if (!match$899(']')) {
                        throwError$894({}, Messages$839.ElementAfterSpreadElement);
                    }
                } else if (!(match$899(']') || matchKeyword$900('for') || matchKeyword$900('if'))) {
                    expect$897(',');
                    // this lexes.
                    possiblecomprehension$1251 = false;
                }
            }
        }
        expect$897(']');
        if (filter$1249 && !blocks$1248.length) {
            throwError$894({}, Messages$839.ComprehensionRequiresBlock);
        }
        if (blocks$1248.length) {
            if (elements$1247.length !== 1) {
                throwError$894({}, Messages$839.ComprehensionError);
            }
            return {
                type: Syntax$837.ComprehensionExpression,
                filter: filter$1249,
                blocks: blocks$1248,
                body: elements$1247[0]
            };
        }
        return delegate$853.createArrayExpression(elements$1247);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$907(options$1253) {
        var previousStrict$1254, previousYieldAllowed$1255, params$1256, defaults$1257, body$1258;
        previousStrict$1254 = strict$844;
        previousYieldAllowed$1255 = state$858.yieldAllowed;
        state$858.yieldAllowed = options$1253.generator;
        params$1256 = options$1253.params || [];
        defaults$1257 = options$1253.defaults || [];
        body$1258 = parseConciseBody$966();
        if (options$1253.name && strict$844 && isRestrictedWord$871(params$1256[0].name)) {
            throwErrorTolerant$895(options$1253.name, Messages$839.StrictParamName);
        }
        if (state$858.yieldAllowed && !state$858.yieldFound) {
            throwErrorTolerant$895({}, Messages$839.NoYieldInGenerator);
        }
        strict$844 = previousStrict$1254;
        state$858.yieldAllowed = previousYieldAllowed$1255;
        return delegate$853.createFunctionExpression(null, params$1256, defaults$1257, body$1258, options$1253.rest || null, options$1253.generator, body$1258.type !== Syntax$837.BlockStatement);
    }
    function parsePropertyMethodFunction$908(options$1259) {
        var previousStrict$1260, tmp$1261, method$1262;
        previousStrict$1260 = strict$844;
        strict$844 = true;
        tmp$1261 = parseParams$970();
        if (tmp$1261.stricted) {
            throwErrorTolerant$895(tmp$1261.stricted, tmp$1261.message);
        }
        method$1262 = parsePropertyFunction$907({
            params: tmp$1261.params,
            defaults: tmp$1261.defaults,
            rest: tmp$1261.rest,
            generator: options$1259.generator
        });
        strict$844 = previousStrict$1260;
        return method$1262;
    }
    function parseObjectPropertyKey$909() {
        var token$1263 = lex$890();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1263.type === Token$834.StringLiteral || token$1263.type === Token$834.NumericLiteral) {
            if (strict$844 && token$1263.octal) {
                throwErrorTolerant$895(token$1263, Messages$839.StrictOctalLiteral);
            }
            return delegate$853.createLiteral(token$1263);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$853.createIdentifier(token$1263.value);
    }
    function parseObjectProperty$910() {
        var token$1264, key$1265, id$1266, value$1267, param$1268;
        token$1264 = lookahead$856;
        if (token$1264.type === Token$834.Identifier) {
            id$1266 = parseObjectPropertyKey$909();
            // Property Assignment: Getter and Setter.
            if (token$1264.value === 'get' && !(match$899(':') || match$899('('))) {
                key$1265 = parseObjectPropertyKey$909();
                expect$897('(');
                expect$897(')');
                return delegate$853.createProperty('get', key$1265, parsePropertyFunction$907({ generator: false }), false, false);
            }
            if (token$1264.value === 'set' && !(match$899(':') || match$899('('))) {
                key$1265 = parseObjectPropertyKey$909();
                expect$897('(');
                token$1264 = lookahead$856;
                param$1268 = [parseVariableIdentifier$937()];
                expect$897(')');
                return delegate$853.createProperty('set', key$1265, parsePropertyFunction$907({
                    params: param$1268,
                    generator: false,
                    name: token$1264
                }), false, false);
            }
            if (match$899(':')) {
                lex$890();
                return delegate$853.createProperty('init', id$1266, parseAssignmentExpression$933(), false, false);
            }
            if (match$899('(')) {
                return delegate$853.createProperty('init', id$1266, parsePropertyMethodFunction$908({ generator: false }), true, false);
            }
            return delegate$853.createProperty('init', id$1266, id$1266, false, true);
        }
        if (token$1264.type === Token$834.EOF || token$1264.type === Token$834.Punctuator) {
            if (!match$899('*')) {
                throwUnexpected$896(token$1264);
            }
            lex$890();
            id$1266 = parseObjectPropertyKey$909();
            if (!match$899('(')) {
                throwUnexpected$896(lex$890());
            }
            return delegate$853.createProperty('init', id$1266, parsePropertyMethodFunction$908({ generator: true }), true, false);
        }
        key$1265 = parseObjectPropertyKey$909();
        if (match$899(':')) {
            lex$890();
            return delegate$853.createProperty('init', key$1265, parseAssignmentExpression$933(), false, false);
        }
        if (match$899('(')) {
            return delegate$853.createProperty('init', key$1265, parsePropertyMethodFunction$908({ generator: false }), true, false);
        }
        throwUnexpected$896(lex$890());
    }
    function parseObjectInitialiser$911() {
        var properties$1269 = [], property$1270, name$1271, key$1272, kind$1273, map$1274 = {}, toString$1275 = String;
        expect$897('{');
        while (!match$899('}')) {
            property$1270 = parseObjectProperty$910();
            if (property$1270.key.type === Syntax$837.Identifier) {
                name$1271 = property$1270.key.name;
            } else {
                name$1271 = toString$1275(property$1270.key.value);
            }
            kind$1273 = property$1270.kind === 'init' ? PropertyKind$838.Data : property$1270.kind === 'get' ? PropertyKind$838.Get : PropertyKind$838.Set;
            key$1272 = '$' + name$1271;
            if (Object.prototype.hasOwnProperty.call(map$1274, key$1272)) {
                if (map$1274[key$1272] === PropertyKind$838.Data) {
                    if (strict$844 && kind$1273 === PropertyKind$838.Data) {
                        throwErrorTolerant$895({}, Messages$839.StrictDuplicateProperty);
                    } else if (kind$1273 !== PropertyKind$838.Data) {
                        throwErrorTolerant$895({}, Messages$839.AccessorDataProperty);
                    }
                } else {
                    if (kind$1273 === PropertyKind$838.Data) {
                        throwErrorTolerant$895({}, Messages$839.AccessorDataProperty);
                    } else if (map$1274[key$1272] & kind$1273) {
                        throwErrorTolerant$895({}, Messages$839.AccessorGetSet);
                    }
                }
                map$1274[key$1272] |= kind$1273;
            } else {
                map$1274[key$1272] = kind$1273;
            }
            properties$1269.push(property$1270);
            if (!match$899('}')) {
                expect$897(',');
            }
        }
        expect$897('}');
        return delegate$853.createObjectExpression(properties$1269);
    }
    function parseTemplateElement$912(option$1276) {
        var token$1277 = scanTemplateElement$885(option$1276);
        if (strict$844 && token$1277.octal) {
            throwError$894(token$1277, Messages$839.StrictOctalLiteral);
        }
        return delegate$853.createTemplateElement({
            raw: token$1277.value.raw,
            cooked: token$1277.value.cooked
        }, token$1277.tail);
    }
    function parseTemplateLiteral$913() {
        var quasi$1278, quasis$1279, expressions$1280;
        quasi$1278 = parseTemplateElement$912({ head: true });
        quasis$1279 = [quasi$1278];
        expressions$1280 = [];
        while (!quasi$1278.tail) {
            expressions$1280.push(parseExpression$934());
            quasi$1278 = parseTemplateElement$912({ head: false });
            quasis$1279.push(quasi$1278);
        }
        return delegate$853.createTemplateLiteral(quasis$1279, expressions$1280);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$914() {
        var expr$1281;
        expect$897('(');
        ++state$858.parenthesizedCount;
        expr$1281 = parseExpression$934();
        expect$897(')');
        return expr$1281;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$915() {
        var type$1282, token$1283, resolvedIdent$1284;
        token$1283 = lookahead$856;
        type$1282 = lookahead$856.type;
        if (type$1282 === Token$834.Identifier) {
            resolvedIdent$1284 = expander$833.resolve(tokenStream$854[lookaheadIndex$857]);
            lex$890();
            return delegate$853.createIdentifier(resolvedIdent$1284);
        }
        if (type$1282 === Token$834.StringLiteral || type$1282 === Token$834.NumericLiteral) {
            if (strict$844 && lookahead$856.octal) {
                throwErrorTolerant$895(lookahead$856, Messages$839.StrictOctalLiteral);
            }
            return delegate$853.createLiteral(lex$890());
        }
        if (type$1282 === Token$834.Keyword) {
            if (matchKeyword$900('this')) {
                lex$890();
                return delegate$853.createThisExpression();
            }
            if (matchKeyword$900('function')) {
                return parseFunctionExpression$972();
            }
            if (matchKeyword$900('class')) {
                return parseClassExpression$977();
            }
            if (matchKeyword$900('super')) {
                lex$890();
                return delegate$853.createIdentifier('super');
            }
        }
        if (type$1282 === Token$834.BooleanLiteral) {
            token$1283 = lex$890();
            token$1283.value = token$1283.value === 'true';
            return delegate$853.createLiteral(token$1283);
        }
        if (type$1282 === Token$834.NullLiteral) {
            token$1283 = lex$890();
            token$1283.value = null;
            return delegate$853.createLiteral(token$1283);
        }
        if (match$899('[')) {
            return parseArrayInitialiser$906();
        }
        if (match$899('{')) {
            return parseObjectInitialiser$911();
        }
        if (match$899('(')) {
            return parseGroupExpression$914();
        }
        if (lookahead$856.type === Token$834.RegularExpression) {
            return delegate$853.createLiteral(lex$890());
        }
        if (type$1282 === Token$834.Template) {
            return parseTemplateLiteral$913();
        }
        return throwUnexpected$896(lex$890());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$916() {
        var args$1285 = [], arg$1286;
        expect$897('(');
        if (!match$899(')')) {
            while (streamIndex$855 < length$852) {
                arg$1286 = parseSpreadOrAssignmentExpression$917();
                args$1285.push(arg$1286);
                if (match$899(')')) {
                    break;
                } else if (arg$1286.type === Syntax$837.SpreadElement) {
                    throwError$894({}, Messages$839.ElementAfterSpreadElement);
                }
                expect$897(',');
            }
        }
        expect$897(')');
        return args$1285;
    }
    function parseSpreadOrAssignmentExpression$917() {
        if (match$899('...')) {
            lex$890();
            return delegate$853.createSpreadElement(parseAssignmentExpression$933());
        }
        return parseAssignmentExpression$933();
    }
    function parseNonComputedProperty$918() {
        var token$1287 = lex$890();
        if (!isIdentifierName$887(token$1287)) {
            throwUnexpected$896(token$1287);
        }
        return delegate$853.createIdentifier(token$1287.value);
    }
    function parseNonComputedMember$919() {
        expect$897('.');
        return parseNonComputedProperty$918();
    }
    function parseComputedMember$920() {
        var expr$1288;
        expect$897('[');
        expr$1288 = parseExpression$934();
        expect$897(']');
        return expr$1288;
    }
    function parseNewExpression$921() {
        var callee$1289, args$1290;
        expectKeyword$898('new');
        callee$1289 = parseLeftHandSideExpression$923();
        args$1290 = match$899('(') ? parseArguments$916() : [];
        return delegate$853.createNewExpression(callee$1289, args$1290);
    }
    function parseLeftHandSideExpressionAllowCall$922() {
        var expr$1291, args$1292, property$1293;
        expr$1291 = matchKeyword$900('new') ? parseNewExpression$921() : parsePrimaryExpression$915();
        while (match$899('.') || match$899('[') || match$899('(') || lookahead$856.type === Token$834.Template) {
            if (match$899('(')) {
                args$1292 = parseArguments$916();
                expr$1291 = delegate$853.createCallExpression(expr$1291, args$1292);
            } else if (match$899('[')) {
                expr$1291 = delegate$853.createMemberExpression('[', expr$1291, parseComputedMember$920());
            } else if (match$899('.')) {
                expr$1291 = delegate$853.createMemberExpression('.', expr$1291, parseNonComputedMember$919());
            } else {
                expr$1291 = delegate$853.createTaggedTemplateExpression(expr$1291, parseTemplateLiteral$913());
            }
        }
        return expr$1291;
    }
    function parseLeftHandSideExpression$923() {
        var expr$1294, property$1295;
        expr$1294 = matchKeyword$900('new') ? parseNewExpression$921() : parsePrimaryExpression$915();
        while (match$899('.') || match$899('[') || lookahead$856.type === Token$834.Template) {
            if (match$899('[')) {
                expr$1294 = delegate$853.createMemberExpression('[', expr$1294, parseComputedMember$920());
            } else if (match$899('.')) {
                expr$1294 = delegate$853.createMemberExpression('.', expr$1294, parseNonComputedMember$919());
            } else {
                expr$1294 = delegate$853.createTaggedTemplateExpression(expr$1294, parseTemplateLiteral$913());
            }
        }
        return expr$1294;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$924() {
        var expr$1296 = parseLeftHandSideExpressionAllowCall$922(), token$1297 = lookahead$856;
        if (lookahead$856.type !== Token$834.Punctuator) {
            return expr$1296;
        }
        if ((match$899('++') || match$899('--')) && !peekLineTerminator$893()) {
            // 11.3.1, 11.3.2
            if (strict$844 && expr$1296.type === Syntax$837.Identifier && isRestrictedWord$871(expr$1296.name)) {
                throwErrorTolerant$895({}, Messages$839.StrictLHSPostfix);
            }
            if (!isLeftHandSide$904(expr$1296)) {
                throwError$894({}, Messages$839.InvalidLHSInAssignment);
            }
            token$1297 = lex$890();
            expr$1296 = delegate$853.createPostfixExpression(token$1297.value, expr$1296);
        }
        return expr$1296;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$925() {
        var token$1298, expr$1299;
        if (lookahead$856.type !== Token$834.Punctuator && lookahead$856.type !== Token$834.Keyword) {
            return parsePostfixExpression$924();
        }
        if (match$899('++') || match$899('--')) {
            token$1298 = lex$890();
            expr$1299 = parseUnaryExpression$925();
            // 11.4.4, 11.4.5
            if (strict$844 && expr$1299.type === Syntax$837.Identifier && isRestrictedWord$871(expr$1299.name)) {
                throwErrorTolerant$895({}, Messages$839.StrictLHSPrefix);
            }
            if (!isLeftHandSide$904(expr$1299)) {
                throwError$894({}, Messages$839.InvalidLHSInAssignment);
            }
            return delegate$853.createUnaryExpression(token$1298.value, expr$1299);
        }
        if (match$899('+') || match$899('-') || match$899('~') || match$899('!')) {
            token$1298 = lex$890();
            expr$1299 = parseUnaryExpression$925();
            return delegate$853.createUnaryExpression(token$1298.value, expr$1299);
        }
        if (matchKeyword$900('delete') || matchKeyword$900('void') || matchKeyword$900('typeof')) {
            token$1298 = lex$890();
            expr$1299 = parseUnaryExpression$925();
            expr$1299 = delegate$853.createUnaryExpression(token$1298.value, expr$1299);
            if (strict$844 && expr$1299.operator === 'delete' && expr$1299.argument.type === Syntax$837.Identifier) {
                throwErrorTolerant$895({}, Messages$839.StrictDelete);
            }
            return expr$1299;
        }
        return parsePostfixExpression$924();
    }
    function binaryPrecedence$926(token$1300, allowIn$1301) {
        var prec$1302 = 0;
        if (token$1300.type !== Token$834.Punctuator && token$1300.type !== Token$834.Keyword) {
            return 0;
        }
        switch (token$1300.value) {
        case '||':
            prec$1302 = 1;
            break;
        case '&&':
            prec$1302 = 2;
            break;
        case '|':
            prec$1302 = 3;
            break;
        case '^':
            prec$1302 = 4;
            break;
        case '&':
            prec$1302 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1302 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1302 = 7;
            break;
        case 'in':
            prec$1302 = allowIn$1301 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1302 = 8;
            break;
        case '+':
        case '-':
            prec$1302 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1302 = 11;
            break;
        default:
            break;
        }
        return prec$1302;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$927() {
        var expr$1303, token$1304, prec$1305, previousAllowIn$1306, stack$1307, right$1308, operator$1309, left$1310, i$1311;
        previousAllowIn$1306 = state$858.allowIn;
        state$858.allowIn = true;
        expr$1303 = parseUnaryExpression$925();
        token$1304 = lookahead$856;
        prec$1305 = binaryPrecedence$926(token$1304, previousAllowIn$1306);
        if (prec$1305 === 0) {
            return expr$1303;
        }
        token$1304.prec = prec$1305;
        lex$890();
        stack$1307 = [
            expr$1303,
            token$1304,
            parseUnaryExpression$925()
        ];
        while ((prec$1305 = binaryPrecedence$926(lookahead$856, previousAllowIn$1306)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1307.length > 2 && prec$1305 <= stack$1307[stack$1307.length - 2].prec) {
                right$1308 = stack$1307.pop();
                operator$1309 = stack$1307.pop().value;
                left$1310 = stack$1307.pop();
                stack$1307.push(delegate$853.createBinaryExpression(operator$1309, left$1310, right$1308));
            }
            // Shift.
            token$1304 = lex$890();
            token$1304.prec = prec$1305;
            stack$1307.push(token$1304);
            stack$1307.push(parseUnaryExpression$925());
        }
        state$858.allowIn = previousAllowIn$1306;
        // Final reduce to clean-up the stack.
        i$1311 = stack$1307.length - 1;
        expr$1303 = stack$1307[i$1311];
        while (i$1311 > 1) {
            expr$1303 = delegate$853.createBinaryExpression(stack$1307[i$1311 - 1].value, stack$1307[i$1311 - 2], expr$1303);
            i$1311 -= 2;
        }
        return expr$1303;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$928() {
        var expr$1312, previousAllowIn$1313, consequent$1314, alternate$1315;
        expr$1312 = parseBinaryExpression$927();
        if (match$899('?')) {
            lex$890();
            previousAllowIn$1313 = state$858.allowIn;
            state$858.allowIn = true;
            consequent$1314 = parseAssignmentExpression$933();
            state$858.allowIn = previousAllowIn$1313;
            expect$897(':');
            alternate$1315 = parseAssignmentExpression$933();
            expr$1312 = delegate$853.createConditionalExpression(expr$1312, consequent$1314, alternate$1315);
        }
        return expr$1312;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$929(expr$1316) {
        var i$1317, len$1318, property$1319, element$1320;
        if (expr$1316.type === Syntax$837.ObjectExpression) {
            expr$1316.type = Syntax$837.ObjectPattern;
            for (i$1317 = 0, len$1318 = expr$1316.properties.length; i$1317 < len$1318; i$1317 += 1) {
                property$1319 = expr$1316.properties[i$1317];
                if (property$1319.kind !== 'init') {
                    throwError$894({}, Messages$839.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$929(property$1319.value);
            }
        } else if (expr$1316.type === Syntax$837.ArrayExpression) {
            expr$1316.type = Syntax$837.ArrayPattern;
            for (i$1317 = 0, len$1318 = expr$1316.elements.length; i$1317 < len$1318; i$1317 += 1) {
                element$1320 = expr$1316.elements[i$1317];
                if (element$1320) {
                    reinterpretAsAssignmentBindingPattern$929(element$1320);
                }
            }
        } else if (expr$1316.type === Syntax$837.Identifier) {
            if (isRestrictedWord$871(expr$1316.name)) {
                throwError$894({}, Messages$839.InvalidLHSInAssignment);
            }
        } else if (expr$1316.type === Syntax$837.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$929(expr$1316.argument);
            if (expr$1316.argument.type === Syntax$837.ObjectPattern) {
                throwError$894({}, Messages$839.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1316.type !== Syntax$837.MemberExpression && expr$1316.type !== Syntax$837.CallExpression && expr$1316.type !== Syntax$837.NewExpression) {
                throwError$894({}, Messages$839.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$930(options$1321, expr$1322) {
        var i$1323, len$1324, property$1325, element$1326;
        if (expr$1322.type === Syntax$837.ObjectExpression) {
            expr$1322.type = Syntax$837.ObjectPattern;
            for (i$1323 = 0, len$1324 = expr$1322.properties.length; i$1323 < len$1324; i$1323 += 1) {
                property$1325 = expr$1322.properties[i$1323];
                if (property$1325.kind !== 'init') {
                    throwError$894({}, Messages$839.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$930(options$1321, property$1325.value);
            }
        } else if (expr$1322.type === Syntax$837.ArrayExpression) {
            expr$1322.type = Syntax$837.ArrayPattern;
            for (i$1323 = 0, len$1324 = expr$1322.elements.length; i$1323 < len$1324; i$1323 += 1) {
                element$1326 = expr$1322.elements[i$1323];
                if (element$1326) {
                    reinterpretAsDestructuredParameter$930(options$1321, element$1326);
                }
            }
        } else if (expr$1322.type === Syntax$837.Identifier) {
            validateParam$968(options$1321, expr$1322, expr$1322.name);
        } else {
            if (expr$1322.type !== Syntax$837.MemberExpression) {
                throwError$894({}, Messages$839.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$931(expressions$1327) {
        var i$1328, len$1329, param$1330, params$1331, defaults$1332, defaultCount$1333, options$1334, rest$1335;
        params$1331 = [];
        defaults$1332 = [];
        defaultCount$1333 = 0;
        rest$1335 = null;
        options$1334 = { paramSet: {} };
        for (i$1328 = 0, len$1329 = expressions$1327.length; i$1328 < len$1329; i$1328 += 1) {
            param$1330 = expressions$1327[i$1328];
            if (param$1330.type === Syntax$837.Identifier) {
                params$1331.push(param$1330);
                defaults$1332.push(null);
                validateParam$968(options$1334, param$1330, param$1330.name);
            } else if (param$1330.type === Syntax$837.ObjectExpression || param$1330.type === Syntax$837.ArrayExpression) {
                reinterpretAsDestructuredParameter$930(options$1334, param$1330);
                params$1331.push(param$1330);
                defaults$1332.push(null);
            } else if (param$1330.type === Syntax$837.SpreadElement) {
                assert$860(i$1328 === len$1329 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$930(options$1334, param$1330.argument);
                rest$1335 = param$1330.argument;
            } else if (param$1330.type === Syntax$837.AssignmentExpression) {
                params$1331.push(param$1330.left);
                defaults$1332.push(param$1330.right);
                ++defaultCount$1333;
                validateParam$968(options$1334, param$1330.left, param$1330.left.name);
            } else {
                return null;
            }
        }
        if (options$1334.message === Messages$839.StrictParamDupe) {
            throwError$894(strict$844 ? options$1334.stricted : options$1334.firstRestricted, options$1334.message);
        }
        if (defaultCount$1333 === 0) {
            defaults$1332 = [];
        }
        return {
            params: params$1331,
            defaults: defaults$1332,
            rest: rest$1335,
            stricted: options$1334.stricted,
            firstRestricted: options$1334.firstRestricted,
            message: options$1334.message
        };
    }
    function parseArrowFunctionExpression$932(options$1336) {
        var previousStrict$1337, previousYieldAllowed$1338, body$1339;
        expect$897('=>');
        previousStrict$1337 = strict$844;
        previousYieldAllowed$1338 = state$858.yieldAllowed;
        state$858.yieldAllowed = false;
        body$1339 = parseConciseBody$966();
        if (strict$844 && options$1336.firstRestricted) {
            throwError$894(options$1336.firstRestricted, options$1336.message);
        }
        if (strict$844 && options$1336.stricted) {
            throwErrorTolerant$895(options$1336.stricted, options$1336.message);
        }
        strict$844 = previousStrict$1337;
        state$858.yieldAllowed = previousYieldAllowed$1338;
        return delegate$853.createArrowFunctionExpression(options$1336.params, options$1336.defaults, body$1339, options$1336.rest, body$1339.type !== Syntax$837.BlockStatement);
    }
    function parseAssignmentExpression$933() {
        var expr$1340, token$1341, params$1342, oldParenthesizedCount$1343;
        if (matchKeyword$900('yield')) {
            return parseYieldExpression$973();
        }
        oldParenthesizedCount$1343 = state$858.parenthesizedCount;
        if (match$899('(')) {
            token$1341 = lookahead2$892();
            if (token$1341.type === Token$834.Punctuator && token$1341.value === ')' || token$1341.value === '...') {
                params$1342 = parseParams$970();
                if (!match$899('=>')) {
                    throwUnexpected$896(lex$890());
                }
                return parseArrowFunctionExpression$932(params$1342);
            }
        }
        token$1341 = lookahead$856;
        expr$1340 = parseConditionalExpression$928();
        if (match$899('=>') && (state$858.parenthesizedCount === oldParenthesizedCount$1343 || state$858.parenthesizedCount === oldParenthesizedCount$1343 + 1)) {
            if (expr$1340.type === Syntax$837.Identifier) {
                params$1342 = reinterpretAsCoverFormalsList$931([expr$1340]);
            } else if (expr$1340.type === Syntax$837.SequenceExpression) {
                params$1342 = reinterpretAsCoverFormalsList$931(expr$1340.expressions);
            }
            if (params$1342) {
                return parseArrowFunctionExpression$932(params$1342);
            }
        }
        if (matchAssign$902()) {
            // 11.13.1
            if (strict$844 && expr$1340.type === Syntax$837.Identifier && isRestrictedWord$871(expr$1340.name)) {
                throwErrorTolerant$895(token$1341, Messages$839.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$899('=') && (expr$1340.type === Syntax$837.ObjectExpression || expr$1340.type === Syntax$837.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$929(expr$1340);
            } else if (!isLeftHandSide$904(expr$1340)) {
                throwError$894({}, Messages$839.InvalidLHSInAssignment);
            }
            expr$1340 = delegate$853.createAssignmentExpression(lex$890().value, expr$1340, parseAssignmentExpression$933());
        }
        return expr$1340;
    }
    // 11.14 Comma Operator
    function parseExpression$934() {
        var expr$1344, expressions$1345, sequence$1346, coverFormalsList$1347, spreadFound$1348, oldParenthesizedCount$1349;
        oldParenthesizedCount$1349 = state$858.parenthesizedCount;
        expr$1344 = parseAssignmentExpression$933();
        expressions$1345 = [expr$1344];
        if (match$899(',')) {
            while (streamIndex$855 < length$852) {
                if (!match$899(',')) {
                    break;
                }
                lex$890();
                expr$1344 = parseSpreadOrAssignmentExpression$917();
                expressions$1345.push(expr$1344);
                if (expr$1344.type === Syntax$837.SpreadElement) {
                    spreadFound$1348 = true;
                    if (!match$899(')')) {
                        throwError$894({}, Messages$839.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1346 = delegate$853.createSequenceExpression(expressions$1345);
        }
        if (match$899('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$858.parenthesizedCount === oldParenthesizedCount$1349 || state$858.parenthesizedCount === oldParenthesizedCount$1349 + 1) {
                expr$1344 = expr$1344.type === Syntax$837.SequenceExpression ? expr$1344.expressions : expressions$1345;
                coverFormalsList$1347 = reinterpretAsCoverFormalsList$931(expr$1344);
                if (coverFormalsList$1347) {
                    return parseArrowFunctionExpression$932(coverFormalsList$1347);
                }
            }
            throwUnexpected$896(lex$890());
        }
        if (spreadFound$1348 && lookahead2$892().value !== '=>') {
            throwError$894({}, Messages$839.IllegalSpread);
        }
        return sequence$1346 || expr$1344;
    }
    // 12.1 Block
    function parseStatementList$935() {
        var list$1350 = [], statement$1351;
        while (streamIndex$855 < length$852) {
            if (match$899('}')) {
                break;
            }
            statement$1351 = parseSourceElement$980();
            if (typeof statement$1351 === 'undefined') {
                break;
            }
            list$1350.push(statement$1351);
        }
        return list$1350;
    }
    function parseBlock$936() {
        var block$1352;
        expect$897('{');
        block$1352 = parseStatementList$935();
        expect$897('}');
        return delegate$853.createBlockStatement(block$1352);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$937() {
        var token$1353 = lookahead$856, resolvedIdent$1354;
        if (token$1353.type !== Token$834.Identifier) {
            throwUnexpected$896(token$1353);
        }
        resolvedIdent$1354 = expander$833.resolve(tokenStream$854[lookaheadIndex$857]);
        lex$890();
        return delegate$853.createIdentifier(resolvedIdent$1354);
    }
    function parseVariableDeclaration$938(kind$1355) {
        var id$1356, init$1357 = null;
        if (match$899('{')) {
            id$1356 = parseObjectInitialiser$911();
            reinterpretAsAssignmentBindingPattern$929(id$1356);
        } else if (match$899('[')) {
            id$1356 = parseArrayInitialiser$906();
            reinterpretAsAssignmentBindingPattern$929(id$1356);
        } else {
            id$1356 = state$858.allowKeyword ? parseNonComputedProperty$918() : parseVariableIdentifier$937();
            // 12.2.1
            if (strict$844 && isRestrictedWord$871(id$1356.name)) {
                throwErrorTolerant$895({}, Messages$839.StrictVarName);
            }
        }
        if (kind$1355 === 'const') {
            if (!match$899('=')) {
                throwError$894({}, Messages$839.NoUnintializedConst);
            }
            expect$897('=');
            init$1357 = parseAssignmentExpression$933();
        } else if (match$899('=')) {
            lex$890();
            init$1357 = parseAssignmentExpression$933();
        }
        return delegate$853.createVariableDeclarator(id$1356, init$1357);
    }
    function parseVariableDeclarationList$939(kind$1358) {
        var list$1359 = [];
        do {
            list$1359.push(parseVariableDeclaration$938(kind$1358));
            if (!match$899(',')) {
                break;
            }
            lex$890();
        } while (streamIndex$855 < length$852);
        return list$1359;
    }
    function parseVariableStatement$940() {
        var declarations$1360;
        expectKeyword$898('var');
        declarations$1360 = parseVariableDeclarationList$939();
        consumeSemicolon$903();
        return delegate$853.createVariableDeclaration(declarations$1360, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$941(kind$1361) {
        var declarations$1362;
        expectKeyword$898(kind$1361);
        declarations$1362 = parseVariableDeclarationList$939(kind$1361);
        consumeSemicolon$903();
        return delegate$853.createVariableDeclaration(declarations$1362, kind$1361);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$942() {
        var id$1363, src$1364, body$1365;
        lex$890();
        // 'module'
        if (peekLineTerminator$893()) {
            throwError$894({}, Messages$839.NewlineAfterModule);
        }
        switch (lookahead$856.type) {
        case Token$834.StringLiteral:
            id$1363 = parsePrimaryExpression$915();
            body$1365 = parseModuleBlock$985();
            src$1364 = null;
            break;
        case Token$834.Identifier:
            id$1363 = parseVariableIdentifier$937();
            body$1365 = null;
            if (!matchContextualKeyword$901('from')) {
                throwUnexpected$896(lex$890());
            }
            lex$890();
            src$1364 = parsePrimaryExpression$915();
            if (src$1364.type !== Syntax$837.Literal) {
                throwError$894({}, Messages$839.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$903();
        return delegate$853.createModuleDeclaration(id$1363, src$1364, body$1365);
    }
    function parseExportBatchSpecifier$943() {
        expect$897('*');
        return delegate$853.createExportBatchSpecifier();
    }
    function parseExportSpecifier$944() {
        var id$1366, name$1367 = null;
        id$1366 = parseVariableIdentifier$937();
        if (matchContextualKeyword$901('as')) {
            lex$890();
            name$1367 = parseNonComputedProperty$918();
        }
        return delegate$853.createExportSpecifier(id$1366, name$1367);
    }
    function parseExportDeclaration$945() {
        var previousAllowKeyword$1368, decl$1369, def$1370, src$1371, specifiers$1372;
        expectKeyword$898('export');
        if (lookahead$856.type === Token$834.Keyword) {
            switch (lookahead$856.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$853.createExportDeclaration(parseSourceElement$980(), null, null);
            }
        }
        if (isIdentifierName$887(lookahead$856)) {
            previousAllowKeyword$1368 = state$858.allowKeyword;
            state$858.allowKeyword = true;
            decl$1369 = parseVariableDeclarationList$939('let');
            state$858.allowKeyword = previousAllowKeyword$1368;
            return delegate$853.createExportDeclaration(decl$1369, null, null);
        }
        specifiers$1372 = [];
        src$1371 = null;
        if (match$899('*')) {
            specifiers$1372.push(parseExportBatchSpecifier$943());
        } else {
            expect$897('{');
            do {
                specifiers$1372.push(parseExportSpecifier$944());
            } while (match$899(',') && lex$890());
            expect$897('}');
        }
        if (matchContextualKeyword$901('from')) {
            lex$890();
            src$1371 = parsePrimaryExpression$915();
            if (src$1371.type !== Syntax$837.Literal) {
                throwError$894({}, Messages$839.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$903();
        return delegate$853.createExportDeclaration(null, specifiers$1372, src$1371);
    }
    function parseImportDeclaration$946() {
        var specifiers$1373, kind$1374, src$1375;
        expectKeyword$898('import');
        specifiers$1373 = [];
        if (isIdentifierName$887(lookahead$856)) {
            kind$1374 = 'default';
            specifiers$1373.push(parseImportSpecifier$947());
            if (!matchContextualKeyword$901('from')) {
                throwError$894({}, Messages$839.NoFromAfterImport);
            }
            lex$890();
        } else if (match$899('{')) {
            kind$1374 = 'named';
            lex$890();
            do {
                specifiers$1373.push(parseImportSpecifier$947());
            } while (match$899(',') && lex$890());
            expect$897('}');
            if (!matchContextualKeyword$901('from')) {
                throwError$894({}, Messages$839.NoFromAfterImport);
            }
            lex$890();
        }
        src$1375 = parsePrimaryExpression$915();
        if (src$1375.type !== Syntax$837.Literal) {
            throwError$894({}, Messages$839.InvalidModuleSpecifier);
        }
        consumeSemicolon$903();
        return delegate$853.createImportDeclaration(specifiers$1373, kind$1374, src$1375);
    }
    function parseImportSpecifier$947() {
        var id$1376, name$1377 = null;
        id$1376 = parseNonComputedProperty$918();
        if (matchContextualKeyword$901('as')) {
            lex$890();
            name$1377 = parseVariableIdentifier$937();
        }
        return delegate$853.createImportSpecifier(id$1376, name$1377);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$948() {
        expect$897(';');
        return delegate$853.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$949() {
        var expr$1378 = parseExpression$934();
        consumeSemicolon$903();
        return delegate$853.createExpressionStatement(expr$1378);
    }
    // 12.5 If statement
    function parseIfStatement$950() {
        var test$1379, consequent$1380, alternate$1381;
        expectKeyword$898('if');
        expect$897('(');
        test$1379 = parseExpression$934();
        expect$897(')');
        consequent$1380 = parseStatement$965();
        if (matchKeyword$900('else')) {
            lex$890();
            alternate$1381 = parseStatement$965();
        } else {
            alternate$1381 = null;
        }
        return delegate$853.createIfStatement(test$1379, consequent$1380, alternate$1381);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$951() {
        var body$1382, test$1383, oldInIteration$1384;
        expectKeyword$898('do');
        oldInIteration$1384 = state$858.inIteration;
        state$858.inIteration = true;
        body$1382 = parseStatement$965();
        state$858.inIteration = oldInIteration$1384;
        expectKeyword$898('while');
        expect$897('(');
        test$1383 = parseExpression$934();
        expect$897(')');
        if (match$899(';')) {
            lex$890();
        }
        return delegate$853.createDoWhileStatement(body$1382, test$1383);
    }
    function parseWhileStatement$952() {
        var test$1385, body$1386, oldInIteration$1387;
        expectKeyword$898('while');
        expect$897('(');
        test$1385 = parseExpression$934();
        expect$897(')');
        oldInIteration$1387 = state$858.inIteration;
        state$858.inIteration = true;
        body$1386 = parseStatement$965();
        state$858.inIteration = oldInIteration$1387;
        return delegate$853.createWhileStatement(test$1385, body$1386);
    }
    function parseForVariableDeclaration$953() {
        var token$1388 = lex$890(), declarations$1389 = parseVariableDeclarationList$939();
        return delegate$853.createVariableDeclaration(declarations$1389, token$1388.value);
    }
    function parseForStatement$954(opts$1390) {
        var init$1391, test$1392, update$1393, left$1394, right$1395, body$1396, operator$1397, oldInIteration$1398;
        init$1391 = test$1392 = update$1393 = null;
        expectKeyword$898('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$901('each')) {
            throwError$894({}, Messages$839.EachNotAllowed);
        }
        expect$897('(');
        if (match$899(';')) {
            lex$890();
        } else {
            if (matchKeyword$900('var') || matchKeyword$900('let') || matchKeyword$900('const')) {
                state$858.allowIn = false;
                init$1391 = parseForVariableDeclaration$953();
                state$858.allowIn = true;
                if (init$1391.declarations.length === 1) {
                    if (matchKeyword$900('in') || matchContextualKeyword$901('of')) {
                        operator$1397 = lookahead$856;
                        if (!((operator$1397.value === 'in' || init$1391.kind !== 'var') && init$1391.declarations[0].init)) {
                            lex$890();
                            left$1394 = init$1391;
                            right$1395 = parseExpression$934();
                            init$1391 = null;
                        }
                    }
                }
            } else {
                state$858.allowIn = false;
                init$1391 = parseExpression$934();
                state$858.allowIn = true;
                if (matchContextualKeyword$901('of')) {
                    operator$1397 = lex$890();
                    left$1394 = init$1391;
                    right$1395 = parseExpression$934();
                    init$1391 = null;
                } else if (matchKeyword$900('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$905(init$1391)) {
                        throwError$894({}, Messages$839.InvalidLHSInForIn);
                    }
                    operator$1397 = lex$890();
                    left$1394 = init$1391;
                    right$1395 = parseExpression$934();
                    init$1391 = null;
                }
            }
            if (typeof left$1394 === 'undefined') {
                expect$897(';');
            }
        }
        if (typeof left$1394 === 'undefined') {
            if (!match$899(';')) {
                test$1392 = parseExpression$934();
            }
            expect$897(';');
            if (!match$899(')')) {
                update$1393 = parseExpression$934();
            }
        }
        expect$897(')');
        oldInIteration$1398 = state$858.inIteration;
        state$858.inIteration = true;
        if (!(opts$1390 !== undefined && opts$1390.ignoreBody)) {
            body$1396 = parseStatement$965();
        }
        state$858.inIteration = oldInIteration$1398;
        if (typeof left$1394 === 'undefined') {
            return delegate$853.createForStatement(init$1391, test$1392, update$1393, body$1396);
        }
        if (operator$1397.value === 'in') {
            return delegate$853.createForInStatement(left$1394, right$1395, body$1396);
        }
        return delegate$853.createForOfStatement(left$1394, right$1395, body$1396);
    }
    // 12.7 The continue statement
    function parseContinueStatement$955() {
        var label$1399 = null, key$1400;
        expectKeyword$898('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$856.value.charCodeAt(0) === 59) {
            lex$890();
            if (!state$858.inIteration) {
                throwError$894({}, Messages$839.IllegalContinue);
            }
            return delegate$853.createContinueStatement(null);
        }
        if (peekLineTerminator$893()) {
            if (!state$858.inIteration) {
                throwError$894({}, Messages$839.IllegalContinue);
            }
            return delegate$853.createContinueStatement(null);
        }
        if (lookahead$856.type === Token$834.Identifier) {
            label$1399 = parseVariableIdentifier$937();
            key$1400 = '$' + label$1399.name;
            if (!Object.prototype.hasOwnProperty.call(state$858.labelSet, key$1400)) {
                throwError$894({}, Messages$839.UnknownLabel, label$1399.name);
            }
        }
        consumeSemicolon$903();
        if (label$1399 === null && !state$858.inIteration) {
            throwError$894({}, Messages$839.IllegalContinue);
        }
        return delegate$853.createContinueStatement(label$1399);
    }
    // 12.8 The break statement
    function parseBreakStatement$956() {
        var label$1401 = null, key$1402;
        expectKeyword$898('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$856.value.charCodeAt(0) === 59) {
            lex$890();
            if (!(state$858.inIteration || state$858.inSwitch)) {
                throwError$894({}, Messages$839.IllegalBreak);
            }
            return delegate$853.createBreakStatement(null);
        }
        if (peekLineTerminator$893()) {
            if (!(state$858.inIteration || state$858.inSwitch)) {
                throwError$894({}, Messages$839.IllegalBreak);
            }
            return delegate$853.createBreakStatement(null);
        }
        if (lookahead$856.type === Token$834.Identifier) {
            label$1401 = parseVariableIdentifier$937();
            key$1402 = '$' + label$1401.name;
            if (!Object.prototype.hasOwnProperty.call(state$858.labelSet, key$1402)) {
                throwError$894({}, Messages$839.UnknownLabel, label$1401.name);
            }
        }
        consumeSemicolon$903();
        if (label$1401 === null && !(state$858.inIteration || state$858.inSwitch)) {
            throwError$894({}, Messages$839.IllegalBreak);
        }
        return delegate$853.createBreakStatement(label$1401);
    }
    // 12.9 The return statement
    function parseReturnStatement$957() {
        var argument$1403 = null;
        expectKeyword$898('return');
        if (!state$858.inFunctionBody) {
            throwErrorTolerant$895({}, Messages$839.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$867(String(lookahead$856.value).charCodeAt(0))) {
            argument$1403 = parseExpression$934();
            consumeSemicolon$903();
            return delegate$853.createReturnStatement(argument$1403);
        }
        if (peekLineTerminator$893()) {
            return delegate$853.createReturnStatement(null);
        }
        if (!match$899(';')) {
            if (!match$899('}') && lookahead$856.type !== Token$834.EOF) {
                argument$1403 = parseExpression$934();
            }
        }
        consumeSemicolon$903();
        return delegate$853.createReturnStatement(argument$1403);
    }
    // 12.10 The with statement
    function parseWithStatement$958() {
        var object$1404, body$1405;
        if (strict$844) {
            throwErrorTolerant$895({}, Messages$839.StrictModeWith);
        }
        expectKeyword$898('with');
        expect$897('(');
        object$1404 = parseExpression$934();
        expect$897(')');
        body$1405 = parseStatement$965();
        return delegate$853.createWithStatement(object$1404, body$1405);
    }
    // 12.10 The swith statement
    function parseSwitchCase$959() {
        var test$1406, consequent$1407 = [], sourceElement$1408;
        if (matchKeyword$900('default')) {
            lex$890();
            test$1406 = null;
        } else {
            expectKeyword$898('case');
            test$1406 = parseExpression$934();
        }
        expect$897(':');
        while (streamIndex$855 < length$852) {
            if (match$899('}') || matchKeyword$900('default') || matchKeyword$900('case')) {
                break;
            }
            sourceElement$1408 = parseSourceElement$980();
            if (typeof sourceElement$1408 === 'undefined') {
                break;
            }
            consequent$1407.push(sourceElement$1408);
        }
        return delegate$853.createSwitchCase(test$1406, consequent$1407);
    }
    function parseSwitchStatement$960() {
        var discriminant$1409, cases$1410, clause$1411, oldInSwitch$1412, defaultFound$1413;
        expectKeyword$898('switch');
        expect$897('(');
        discriminant$1409 = parseExpression$934();
        expect$897(')');
        expect$897('{');
        cases$1410 = [];
        if (match$899('}')) {
            lex$890();
            return delegate$853.createSwitchStatement(discriminant$1409, cases$1410);
        }
        oldInSwitch$1412 = state$858.inSwitch;
        state$858.inSwitch = true;
        defaultFound$1413 = false;
        while (streamIndex$855 < length$852) {
            if (match$899('}')) {
                break;
            }
            clause$1411 = parseSwitchCase$959();
            if (clause$1411.test === null) {
                if (defaultFound$1413) {
                    throwError$894({}, Messages$839.MultipleDefaultsInSwitch);
                }
                defaultFound$1413 = true;
            }
            cases$1410.push(clause$1411);
        }
        state$858.inSwitch = oldInSwitch$1412;
        expect$897('}');
        return delegate$853.createSwitchStatement(discriminant$1409, cases$1410);
    }
    // 12.13 The throw statement
    function parseThrowStatement$961() {
        var argument$1414;
        expectKeyword$898('throw');
        if (peekLineTerminator$893()) {
            throwError$894({}, Messages$839.NewlineAfterThrow);
        }
        argument$1414 = parseExpression$934();
        consumeSemicolon$903();
        return delegate$853.createThrowStatement(argument$1414);
    }
    // 12.14 The try statement
    function parseCatchClause$962() {
        var param$1415, body$1416;
        expectKeyword$898('catch');
        expect$897('(');
        if (match$899(')')) {
            throwUnexpected$896(lookahead$856);
        }
        param$1415 = parseExpression$934();
        // 12.14.1
        if (strict$844 && param$1415.type === Syntax$837.Identifier && isRestrictedWord$871(param$1415.name)) {
            throwErrorTolerant$895({}, Messages$839.StrictCatchVariable);
        }
        expect$897(')');
        body$1416 = parseBlock$936();
        return delegate$853.createCatchClause(param$1415, body$1416);
    }
    function parseTryStatement$963() {
        var block$1417, handlers$1418 = [], finalizer$1419 = null;
        expectKeyword$898('try');
        block$1417 = parseBlock$936();
        if (matchKeyword$900('catch')) {
            handlers$1418.push(parseCatchClause$962());
        }
        if (matchKeyword$900('finally')) {
            lex$890();
            finalizer$1419 = parseBlock$936();
        }
        if (handlers$1418.length === 0 && !finalizer$1419) {
            throwError$894({}, Messages$839.NoCatchOrFinally);
        }
        return delegate$853.createTryStatement(block$1417, [], handlers$1418, finalizer$1419);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$964() {
        expectKeyword$898('debugger');
        consumeSemicolon$903();
        return delegate$853.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$965() {
        var type$1420 = lookahead$856.type, expr$1421, labeledBody$1422, key$1423;
        if (type$1420 === Token$834.EOF) {
            throwUnexpected$896(lookahead$856);
        }
        if (type$1420 === Token$834.Punctuator) {
            switch (lookahead$856.value) {
            case ';':
                return parseEmptyStatement$948();
            case '{':
                return parseBlock$936();
            case '(':
                return parseExpressionStatement$949();
            default:
                break;
            }
        }
        if (type$1420 === Token$834.Keyword) {
            switch (lookahead$856.value) {
            case 'break':
                return parseBreakStatement$956();
            case 'continue':
                return parseContinueStatement$955();
            case 'debugger':
                return parseDebuggerStatement$964();
            case 'do':
                return parseDoWhileStatement$951();
            case 'for':
                return parseForStatement$954();
            case 'function':
                return parseFunctionDeclaration$971();
            case 'class':
                return parseClassDeclaration$978();
            case 'if':
                return parseIfStatement$950();
            case 'return':
                return parseReturnStatement$957();
            case 'switch':
                return parseSwitchStatement$960();
            case 'throw':
                return parseThrowStatement$961();
            case 'try':
                return parseTryStatement$963();
            case 'var':
                return parseVariableStatement$940();
            case 'while':
                return parseWhileStatement$952();
            case 'with':
                return parseWithStatement$958();
            default:
                break;
            }
        }
        expr$1421 = parseExpression$934();
        // 12.12 Labelled Statements
        if (expr$1421.type === Syntax$837.Identifier && match$899(':')) {
            lex$890();
            key$1423 = '$' + expr$1421.name;
            if (Object.prototype.hasOwnProperty.call(state$858.labelSet, key$1423)) {
                throwError$894({}, Messages$839.Redeclaration, 'Label', expr$1421.name);
            }
            state$858.labelSet[key$1423] = true;
            labeledBody$1422 = parseStatement$965();
            delete state$858.labelSet[key$1423];
            return delegate$853.createLabeledStatement(expr$1421, labeledBody$1422);
        }
        consumeSemicolon$903();
        return delegate$853.createExpressionStatement(expr$1421);
    }
    // 13 Function Definition
    function parseConciseBody$966() {
        if (match$899('{')) {
            return parseFunctionSourceElements$967();
        }
        return parseAssignmentExpression$933();
    }
    function parseFunctionSourceElements$967() {
        var sourceElement$1424, sourceElements$1425 = [], token$1426, directive$1427, firstRestricted$1428, oldLabelSet$1429, oldInIteration$1430, oldInSwitch$1431, oldInFunctionBody$1432, oldParenthesizedCount$1433;
        expect$897('{');
        while (streamIndex$855 < length$852) {
            if (lookahead$856.type !== Token$834.StringLiteral) {
                break;
            }
            token$1426 = lookahead$856;
            sourceElement$1424 = parseSourceElement$980();
            sourceElements$1425.push(sourceElement$1424);
            if (sourceElement$1424.expression.type !== Syntax$837.Literal) {
                // this is not directive
                break;
            }
            directive$1427 = token$1426.value;
            if (directive$1427 === 'use strict') {
                strict$844 = true;
                if (firstRestricted$1428) {
                    throwErrorTolerant$895(firstRestricted$1428, Messages$839.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1428 && token$1426.octal) {
                    firstRestricted$1428 = token$1426;
                }
            }
        }
        oldLabelSet$1429 = state$858.labelSet;
        oldInIteration$1430 = state$858.inIteration;
        oldInSwitch$1431 = state$858.inSwitch;
        oldInFunctionBody$1432 = state$858.inFunctionBody;
        oldParenthesizedCount$1433 = state$858.parenthesizedCount;
        state$858.labelSet = {};
        state$858.inIteration = false;
        state$858.inSwitch = false;
        state$858.inFunctionBody = true;
        state$858.parenthesizedCount = 0;
        while (streamIndex$855 < length$852) {
            if (match$899('}')) {
                break;
            }
            sourceElement$1424 = parseSourceElement$980();
            if (typeof sourceElement$1424 === 'undefined') {
                break;
            }
            sourceElements$1425.push(sourceElement$1424);
        }
        expect$897('}');
        state$858.labelSet = oldLabelSet$1429;
        state$858.inIteration = oldInIteration$1430;
        state$858.inSwitch = oldInSwitch$1431;
        state$858.inFunctionBody = oldInFunctionBody$1432;
        state$858.parenthesizedCount = oldParenthesizedCount$1433;
        return delegate$853.createBlockStatement(sourceElements$1425);
    }
    function validateParam$968(options$1434, param$1435, name$1436) {
        var key$1437 = '$' + name$1436;
        if (strict$844) {
            if (isRestrictedWord$871(name$1436)) {
                options$1434.stricted = param$1435;
                options$1434.message = Messages$839.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1434.paramSet, key$1437)) {
                options$1434.stricted = param$1435;
                options$1434.message = Messages$839.StrictParamDupe;
            }
        } else if (!options$1434.firstRestricted) {
            if (isRestrictedWord$871(name$1436)) {
                options$1434.firstRestricted = param$1435;
                options$1434.message = Messages$839.StrictParamName;
            } else if (isStrictModeReservedWord$870(name$1436)) {
                options$1434.firstRestricted = param$1435;
                options$1434.message = Messages$839.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1434.paramSet, key$1437)) {
                options$1434.firstRestricted = param$1435;
                options$1434.message = Messages$839.StrictParamDupe;
            }
        }
        options$1434.paramSet[key$1437] = true;
    }
    function parseParam$969(options$1438) {
        var token$1439, rest$1440, param$1441, def$1442;
        token$1439 = lookahead$856;
        if (token$1439.value === '...') {
            token$1439 = lex$890();
            rest$1440 = true;
        }
        if (match$899('[')) {
            param$1441 = parseArrayInitialiser$906();
            reinterpretAsDestructuredParameter$930(options$1438, param$1441);
        } else if (match$899('{')) {
            if (rest$1440) {
                throwError$894({}, Messages$839.ObjectPatternAsRestParameter);
            }
            param$1441 = parseObjectInitialiser$911();
            reinterpretAsDestructuredParameter$930(options$1438, param$1441);
        } else {
            param$1441 = parseVariableIdentifier$937();
            validateParam$968(options$1438, token$1439, token$1439.value);
            if (match$899('=')) {
                if (rest$1440) {
                    throwErrorTolerant$895(lookahead$856, Messages$839.DefaultRestParameter);
                }
                lex$890();
                def$1442 = parseAssignmentExpression$933();
                ++options$1438.defaultCount;
            }
        }
        if (rest$1440) {
            if (!match$899(')')) {
                throwError$894({}, Messages$839.ParameterAfterRestParameter);
            }
            options$1438.rest = param$1441;
            return false;
        }
        options$1438.params.push(param$1441);
        options$1438.defaults.push(def$1442);
        return !match$899(')');
    }
    function parseParams$970(firstRestricted$1443) {
        var options$1444;
        options$1444 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1443
        };
        expect$897('(');
        if (!match$899(')')) {
            options$1444.paramSet = {};
            while (streamIndex$855 < length$852) {
                if (!parseParam$969(options$1444)) {
                    break;
                }
                expect$897(',');
            }
        }
        expect$897(')');
        if (options$1444.defaultCount === 0) {
            options$1444.defaults = [];
        }
        return options$1444;
    }
    function parseFunctionDeclaration$971() {
        var id$1445, body$1446, token$1447, tmp$1448, firstRestricted$1449, message$1450, previousStrict$1451, previousYieldAllowed$1452, generator$1453, expression$1454;
        expectKeyword$898('function');
        generator$1453 = false;
        if (match$899('*')) {
            lex$890();
            generator$1453 = true;
        }
        token$1447 = lookahead$856;
        id$1445 = parseVariableIdentifier$937();
        if (strict$844) {
            if (isRestrictedWord$871(token$1447.value)) {
                throwErrorTolerant$895(token$1447, Messages$839.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$871(token$1447.value)) {
                firstRestricted$1449 = token$1447;
                message$1450 = Messages$839.StrictFunctionName;
            } else if (isStrictModeReservedWord$870(token$1447.value)) {
                firstRestricted$1449 = token$1447;
                message$1450 = Messages$839.StrictReservedWord;
            }
        }
        tmp$1448 = parseParams$970(firstRestricted$1449);
        firstRestricted$1449 = tmp$1448.firstRestricted;
        if (tmp$1448.message) {
            message$1450 = tmp$1448.message;
        }
        previousStrict$1451 = strict$844;
        previousYieldAllowed$1452 = state$858.yieldAllowed;
        state$858.yieldAllowed = generator$1453;
        // here we redo some work in order to set 'expression'
        expression$1454 = !match$899('{');
        body$1446 = parseConciseBody$966();
        if (strict$844 && firstRestricted$1449) {
            throwError$894(firstRestricted$1449, message$1450);
        }
        if (strict$844 && tmp$1448.stricted) {
            throwErrorTolerant$895(tmp$1448.stricted, message$1450);
        }
        if (state$858.yieldAllowed && !state$858.yieldFound) {
            throwErrorTolerant$895({}, Messages$839.NoYieldInGenerator);
        }
        strict$844 = previousStrict$1451;
        state$858.yieldAllowed = previousYieldAllowed$1452;
        return delegate$853.createFunctionDeclaration(id$1445, tmp$1448.params, tmp$1448.defaults, body$1446, tmp$1448.rest, generator$1453, expression$1454);
    }
    function parseFunctionExpression$972() {
        var token$1455, id$1456 = null, firstRestricted$1457, message$1458, tmp$1459, body$1460, previousStrict$1461, previousYieldAllowed$1462, generator$1463, expression$1464;
        expectKeyword$898('function');
        generator$1463 = false;
        if (match$899('*')) {
            lex$890();
            generator$1463 = true;
        }
        if (!match$899('(')) {
            token$1455 = lookahead$856;
            id$1456 = parseVariableIdentifier$937();
            if (strict$844) {
                if (isRestrictedWord$871(token$1455.value)) {
                    throwErrorTolerant$895(token$1455, Messages$839.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$871(token$1455.value)) {
                    firstRestricted$1457 = token$1455;
                    message$1458 = Messages$839.StrictFunctionName;
                } else if (isStrictModeReservedWord$870(token$1455.value)) {
                    firstRestricted$1457 = token$1455;
                    message$1458 = Messages$839.StrictReservedWord;
                }
            }
        }
        tmp$1459 = parseParams$970(firstRestricted$1457);
        firstRestricted$1457 = tmp$1459.firstRestricted;
        if (tmp$1459.message) {
            message$1458 = tmp$1459.message;
        }
        previousStrict$1461 = strict$844;
        previousYieldAllowed$1462 = state$858.yieldAllowed;
        state$858.yieldAllowed = generator$1463;
        // here we redo some work in order to set 'expression'
        expression$1464 = !match$899('{');
        body$1460 = parseConciseBody$966();
        if (strict$844 && firstRestricted$1457) {
            throwError$894(firstRestricted$1457, message$1458);
        }
        if (strict$844 && tmp$1459.stricted) {
            throwErrorTolerant$895(tmp$1459.stricted, message$1458);
        }
        if (state$858.yieldAllowed && !state$858.yieldFound) {
            throwErrorTolerant$895({}, Messages$839.NoYieldInGenerator);
        }
        strict$844 = previousStrict$1461;
        state$858.yieldAllowed = previousYieldAllowed$1462;
        return delegate$853.createFunctionExpression(id$1456, tmp$1459.params, tmp$1459.defaults, body$1460, tmp$1459.rest, generator$1463, expression$1464);
    }
    function parseYieldExpression$973() {
        var delegateFlag$1465, expr$1466, previousYieldAllowed$1467;
        expectKeyword$898('yield');
        if (!state$858.yieldAllowed) {
            throwErrorTolerant$895({}, Messages$839.IllegalYield);
        }
        delegateFlag$1465 = false;
        if (match$899('*')) {
            lex$890();
            delegateFlag$1465 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1467 = state$858.yieldAllowed;
        state$858.yieldAllowed = false;
        expr$1466 = parseAssignmentExpression$933();
        state$858.yieldAllowed = previousYieldAllowed$1467;
        state$858.yieldFound = true;
        return delegate$853.createYieldExpression(expr$1466, delegateFlag$1465);
    }
    // 14 Classes
    function parseMethodDefinition$974(existingPropNames$1468) {
        var token$1469, key$1470, param$1471, propType$1472, isValidDuplicateProp$1473 = false;
        if (lookahead$856.value === 'static') {
            propType$1472 = ClassPropertyType$842.static;
            lex$890();
        } else {
            propType$1472 = ClassPropertyType$842.prototype;
        }
        if (match$899('*')) {
            lex$890();
            return delegate$853.createMethodDefinition(propType$1472, '', parseObjectPropertyKey$909(), parsePropertyMethodFunction$908({ generator: true }));
        }
        token$1469 = lookahead$856;
        key$1470 = parseObjectPropertyKey$909();
        if (token$1469.value === 'get' && !match$899('(')) {
            key$1470 = parseObjectPropertyKey$909();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1468[propType$1472].hasOwnProperty(key$1470.name)) {
                isValidDuplicateProp$1473 = existingPropNames$1468[propType$1472][key$1470.name].get === undefined && existingPropNames$1468[propType$1472][key$1470.name].data === undefined && existingPropNames$1468[propType$1472][key$1470.name].set !== undefined;
                if (!isValidDuplicateProp$1473) {
                    throwError$894(key$1470, Messages$839.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1468[propType$1472][key$1470.name] = {};
            }
            existingPropNames$1468[propType$1472][key$1470.name].get = true;
            expect$897('(');
            expect$897(')');
            return delegate$853.createMethodDefinition(propType$1472, 'get', key$1470, parsePropertyFunction$907({ generator: false }));
        }
        if (token$1469.value === 'set' && !match$899('(')) {
            key$1470 = parseObjectPropertyKey$909();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1468[propType$1472].hasOwnProperty(key$1470.name)) {
                isValidDuplicateProp$1473 = existingPropNames$1468[propType$1472][key$1470.name].set === undefined && existingPropNames$1468[propType$1472][key$1470.name].data === undefined && existingPropNames$1468[propType$1472][key$1470.name].get !== undefined;
                if (!isValidDuplicateProp$1473) {
                    throwError$894(key$1470, Messages$839.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1468[propType$1472][key$1470.name] = {};
            }
            existingPropNames$1468[propType$1472][key$1470.name].set = true;
            expect$897('(');
            token$1469 = lookahead$856;
            param$1471 = [parseVariableIdentifier$937()];
            expect$897(')');
            return delegate$853.createMethodDefinition(propType$1472, 'set', key$1470, parsePropertyFunction$907({
                params: param$1471,
                generator: false,
                name: token$1469
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1468[propType$1472].hasOwnProperty(key$1470.name)) {
            throwError$894(key$1470, Messages$839.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1468[propType$1472][key$1470.name] = {};
        }
        existingPropNames$1468[propType$1472][key$1470.name].data = true;
        return delegate$853.createMethodDefinition(propType$1472, '', key$1470, parsePropertyMethodFunction$908({ generator: false }));
    }
    function parseClassElement$975(existingProps$1474) {
        if (match$899(';')) {
            lex$890();
            return;
        }
        return parseMethodDefinition$974(existingProps$1474);
    }
    function parseClassBody$976() {
        var classElement$1475, classElements$1476 = [], existingProps$1477 = {};
        existingProps$1477[ClassPropertyType$842.static] = {};
        existingProps$1477[ClassPropertyType$842.prototype] = {};
        expect$897('{');
        while (streamIndex$855 < length$852) {
            if (match$899('}')) {
                break;
            }
            classElement$1475 = parseClassElement$975(existingProps$1477);
            if (typeof classElement$1475 !== 'undefined') {
                classElements$1476.push(classElement$1475);
            }
        }
        expect$897('}');
        return delegate$853.createClassBody(classElements$1476);
    }
    function parseClassExpression$977() {
        var id$1478, previousYieldAllowed$1479, superClass$1480 = null;
        expectKeyword$898('class');
        if (!matchKeyword$900('extends') && !match$899('{')) {
            id$1478 = parseVariableIdentifier$937();
        }
        if (matchKeyword$900('extends')) {
            expectKeyword$898('extends');
            previousYieldAllowed$1479 = state$858.yieldAllowed;
            state$858.yieldAllowed = false;
            superClass$1480 = parseAssignmentExpression$933();
            state$858.yieldAllowed = previousYieldAllowed$1479;
        }
        return delegate$853.createClassExpression(id$1478, superClass$1480, parseClassBody$976());
    }
    function parseClassDeclaration$978() {
        var id$1481, previousYieldAllowed$1482, superClass$1483 = null;
        expectKeyword$898('class');
        id$1481 = parseVariableIdentifier$937();
        if (matchKeyword$900('extends')) {
            expectKeyword$898('extends');
            previousYieldAllowed$1482 = state$858.yieldAllowed;
            state$858.yieldAllowed = false;
            superClass$1483 = parseAssignmentExpression$933();
            state$858.yieldAllowed = previousYieldAllowed$1482;
        }
        return delegate$853.createClassDeclaration(id$1481, superClass$1483, parseClassBody$976());
    }
    // 15 Program
    function matchModuleDeclaration$979() {
        var id$1484;
        if (matchContextualKeyword$901('module')) {
            id$1484 = lookahead2$892();
            return id$1484.type === Token$834.StringLiteral || id$1484.type === Token$834.Identifier;
        }
        return false;
    }
    function parseSourceElement$980() {
        if (lookahead$856.type === Token$834.Keyword) {
            switch (lookahead$856.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$941(lookahead$856.value);
            case 'function':
                return parseFunctionDeclaration$971();
            case 'export':
                return parseExportDeclaration$945();
            case 'import':
                return parseImportDeclaration$946();
            default:
                return parseStatement$965();
            }
        }
        if (matchModuleDeclaration$979()) {
            throwError$894({}, Messages$839.NestedModule);
        }
        if (lookahead$856.type !== Token$834.EOF) {
            return parseStatement$965();
        }
    }
    function parseProgramElement$981() {
        if (lookahead$856.type === Token$834.Keyword) {
            switch (lookahead$856.value) {
            case 'export':
                return parseExportDeclaration$945();
            case 'import':
                return parseImportDeclaration$946();
            }
        }
        if (matchModuleDeclaration$979()) {
            return parseModuleDeclaration$942();
        }
        return parseSourceElement$980();
    }
    function parseProgramElements$982() {
        var sourceElement$1485, sourceElements$1486 = [], token$1487, directive$1488, firstRestricted$1489;
        while (streamIndex$855 < length$852) {
            token$1487 = lookahead$856;
            if (token$1487.type !== Token$834.StringLiteral) {
                break;
            }
            sourceElement$1485 = parseProgramElement$981();
            sourceElements$1486.push(sourceElement$1485);
            if (sourceElement$1485.expression.type !== Syntax$837.Literal) {
                // this is not directive
                break;
            }
            assert$860(false, 'directive isn\'t right');
            directive$1488 = source$843.slice(token$1487.range[0] + 1, token$1487.range[1] - 1);
            if (directive$1488 === 'use strict') {
                strict$844 = true;
                if (firstRestricted$1489) {
                    throwErrorTolerant$895(firstRestricted$1489, Messages$839.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1489 && token$1487.octal) {
                    firstRestricted$1489 = token$1487;
                }
            }
        }
        while (streamIndex$855 < length$852) {
            sourceElement$1485 = parseProgramElement$981();
            if (typeof sourceElement$1485 === 'undefined') {
                break;
            }
            sourceElements$1486.push(sourceElement$1485);
        }
        return sourceElements$1486;
    }
    function parseModuleElement$983() {
        return parseSourceElement$980();
    }
    function parseModuleElements$984() {
        var list$1490 = [], statement$1491;
        while (streamIndex$855 < length$852) {
            if (match$899('}')) {
                break;
            }
            statement$1491 = parseModuleElement$983();
            if (typeof statement$1491 === 'undefined') {
                break;
            }
            list$1490.push(statement$1491);
        }
        return list$1490;
    }
    function parseModuleBlock$985() {
        var block$1492;
        expect$897('{');
        block$1492 = parseModuleElements$984();
        expect$897('}');
        return delegate$853.createBlockStatement(block$1492);
    }
    function parseProgram$986() {
        var body$1493;
        strict$844 = false;
        peek$891();
        body$1493 = parseProgramElements$982();
        return delegate$853.createProgram(body$1493);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$987(type$1494, value$1495, start$1496, end$1497, loc$1498) {
        assert$860(typeof start$1496 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$859.comments.length > 0) {
            if (extra$859.comments[extra$859.comments.length - 1].range[1] > start$1496) {
                return;
            }
        }
        extra$859.comments.push({
            type: type$1494,
            value: value$1495,
            range: [
                start$1496,
                end$1497
            ],
            loc: loc$1498
        });
    }
    function scanComment$988() {
        var comment$1499, ch$1500, loc$1501, start$1502, blockComment$1503, lineComment$1504;
        comment$1499 = '';
        blockComment$1503 = false;
        lineComment$1504 = false;
        while (index$845 < length$852) {
            ch$1500 = source$843[index$845];
            if (lineComment$1504) {
                ch$1500 = source$843[index$845++];
                if (isLineTerminator$866(ch$1500.charCodeAt(0))) {
                    loc$1501.end = {
                        line: lineNumber$846,
                        column: index$845 - lineStart$847 - 1
                    };
                    lineComment$1504 = false;
                    addComment$987('Line', comment$1499, start$1502, index$845 - 1, loc$1501);
                    if (ch$1500 === '\r' && source$843[index$845] === '\n') {
                        ++index$845;
                    }
                    ++lineNumber$846;
                    lineStart$847 = index$845;
                    comment$1499 = '';
                } else if (index$845 >= length$852) {
                    lineComment$1504 = false;
                    comment$1499 += ch$1500;
                    loc$1501.end = {
                        line: lineNumber$846,
                        column: length$852 - lineStart$847
                    };
                    addComment$987('Line', comment$1499, start$1502, length$852, loc$1501);
                } else {
                    comment$1499 += ch$1500;
                }
            } else if (blockComment$1503) {
                if (isLineTerminator$866(ch$1500.charCodeAt(0))) {
                    if (ch$1500 === '\r' && source$843[index$845 + 1] === '\n') {
                        ++index$845;
                        comment$1499 += '\r\n';
                    } else {
                        comment$1499 += ch$1500;
                    }
                    ++lineNumber$846;
                    ++index$845;
                    lineStart$847 = index$845;
                    if (index$845 >= length$852) {
                        throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1500 = source$843[index$845++];
                    if (index$845 >= length$852) {
                        throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1499 += ch$1500;
                    if (ch$1500 === '*') {
                        ch$1500 = source$843[index$845];
                        if (ch$1500 === '/') {
                            comment$1499 = comment$1499.substr(0, comment$1499.length - 1);
                            blockComment$1503 = false;
                            ++index$845;
                            loc$1501.end = {
                                line: lineNumber$846,
                                column: index$845 - lineStart$847
                            };
                            addComment$987('Block', comment$1499, start$1502, index$845, loc$1501);
                            comment$1499 = '';
                        }
                    }
                }
            } else if (ch$1500 === '/') {
                ch$1500 = source$843[index$845 + 1];
                if (ch$1500 === '/') {
                    loc$1501 = {
                        start: {
                            line: lineNumber$846,
                            column: index$845 - lineStart$847
                        }
                    };
                    start$1502 = index$845;
                    index$845 += 2;
                    lineComment$1504 = true;
                    if (index$845 >= length$852) {
                        loc$1501.end = {
                            line: lineNumber$846,
                            column: index$845 - lineStart$847
                        };
                        lineComment$1504 = false;
                        addComment$987('Line', comment$1499, start$1502, index$845, loc$1501);
                    }
                } else if (ch$1500 === '*') {
                    start$1502 = index$845;
                    index$845 += 2;
                    blockComment$1503 = true;
                    loc$1501 = {
                        start: {
                            line: lineNumber$846,
                            column: index$845 - lineStart$847 - 2
                        }
                    };
                    if (index$845 >= length$852) {
                        throwError$894({}, Messages$839.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$865(ch$1500.charCodeAt(0))) {
                ++index$845;
            } else if (isLineTerminator$866(ch$1500.charCodeAt(0))) {
                ++index$845;
                if (ch$1500 === '\r' && source$843[index$845] === '\n') {
                    ++index$845;
                }
                ++lineNumber$846;
                lineStart$847 = index$845;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$989() {
        var i$1505, entry$1506, comment$1507, comments$1508 = [];
        for (i$1505 = 0; i$1505 < extra$859.comments.length; ++i$1505) {
            entry$1506 = extra$859.comments[i$1505];
            comment$1507 = {
                type: entry$1506.type,
                value: entry$1506.value
            };
            if (extra$859.range) {
                comment$1507.range = entry$1506.range;
            }
            if (extra$859.loc) {
                comment$1507.loc = entry$1506.loc;
            }
            comments$1508.push(comment$1507);
        }
        extra$859.comments = comments$1508;
    }
    function collectToken$990() {
        var start$1509, loc$1510, token$1511, range$1512, value$1513;
        skipComment$873();
        start$1509 = index$845;
        loc$1510 = {
            start: {
                line: lineNumber$846,
                column: index$845 - lineStart$847
            }
        };
        token$1511 = extra$859.advance();
        loc$1510.end = {
            line: lineNumber$846,
            column: index$845 - lineStart$847
        };
        if (token$1511.type !== Token$834.EOF) {
            range$1512 = [
                token$1511.range[0],
                token$1511.range[1]
            ];
            value$1513 = source$843.slice(token$1511.range[0], token$1511.range[1]);
            extra$859.tokens.push({
                type: TokenName$835[token$1511.type],
                value: value$1513,
                range: range$1512,
                loc: loc$1510
            });
        }
        return token$1511;
    }
    function collectRegex$991() {
        var pos$1514, loc$1515, regex$1516, token$1517;
        skipComment$873();
        pos$1514 = index$845;
        loc$1515 = {
            start: {
                line: lineNumber$846,
                column: index$845 - lineStart$847
            }
        };
        regex$1516 = extra$859.scanRegExp();
        loc$1515.end = {
            line: lineNumber$846,
            column: index$845 - lineStart$847
        };
        if (!extra$859.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$859.tokens.length > 0) {
                token$1517 = extra$859.tokens[extra$859.tokens.length - 1];
                if (token$1517.range[0] === pos$1514 && token$1517.type === 'Punctuator') {
                    if (token$1517.value === '/' || token$1517.value === '/=') {
                        extra$859.tokens.pop();
                    }
                }
            }
            extra$859.tokens.push({
                type: 'RegularExpression',
                value: regex$1516.literal,
                range: [
                    pos$1514,
                    index$845
                ],
                loc: loc$1515
            });
        }
        return regex$1516;
    }
    function filterTokenLocation$992() {
        var i$1518, entry$1519, token$1520, tokens$1521 = [];
        for (i$1518 = 0; i$1518 < extra$859.tokens.length; ++i$1518) {
            entry$1519 = extra$859.tokens[i$1518];
            token$1520 = {
                type: entry$1519.type,
                value: entry$1519.value
            };
            if (extra$859.range) {
                token$1520.range = entry$1519.range;
            }
            if (extra$859.loc) {
                token$1520.loc = entry$1519.loc;
            }
            tokens$1521.push(token$1520);
        }
        extra$859.tokens = tokens$1521;
    }
    function LocationMarker$993() {
        var sm_index$1522 = lookahead$856 ? lookahead$856.sm_range[0] : 0;
        var sm_lineStart$1523 = lookahead$856 ? lookahead$856.sm_lineStart : 0;
        var sm_lineNumber$1524 = lookahead$856 ? lookahead$856.sm_lineNumber : 1;
        this.range = [
            sm_index$1522,
            sm_index$1522
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1524,
                column: sm_index$1522 - sm_lineStart$1523
            },
            end: {
                line: sm_lineNumber$1524,
                column: sm_index$1522 - sm_lineStart$1523
            }
        };
    }
    LocationMarker$993.prototype = {
        constructor: LocationMarker$993,
        end: function () {
            this.range[1] = sm_index$851;
            this.loc.end.line = sm_lineNumber$848;
            this.loc.end.column = sm_index$851 - sm_lineStart$849;
        },
        applyGroup: function (node$1525) {
            if (extra$859.range) {
                node$1525.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$859.loc) {
                node$1525.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1525 = delegate$853.postProcess(node$1525);
            }
        },
        apply: function (node$1526) {
            var nodeType$1527 = typeof node$1526;
            assert$860(nodeType$1527 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1527);
            if (extra$859.range) {
                node$1526.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$859.loc) {
                node$1526.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1526 = delegate$853.postProcess(node$1526);
            }
        }
    };
    function createLocationMarker$994() {
        return new LocationMarker$993();
    }
    function trackGroupExpression$995() {
        var marker$1528, expr$1529;
        marker$1528 = createLocationMarker$994();
        expect$897('(');
        ++state$858.parenthesizedCount;
        expr$1529 = parseExpression$934();
        expect$897(')');
        marker$1528.end();
        marker$1528.applyGroup(expr$1529);
        return expr$1529;
    }
    function trackLeftHandSideExpression$996() {
        var marker$1530, expr$1531;
        // skipComment();
        marker$1530 = createLocationMarker$994();
        expr$1531 = matchKeyword$900('new') ? parseNewExpression$921() : parsePrimaryExpression$915();
        while (match$899('.') || match$899('[') || lookahead$856.type === Token$834.Template) {
            if (match$899('[')) {
                expr$1531 = delegate$853.createMemberExpression('[', expr$1531, parseComputedMember$920());
                marker$1530.end();
                marker$1530.apply(expr$1531);
            } else if (match$899('.')) {
                expr$1531 = delegate$853.createMemberExpression('.', expr$1531, parseNonComputedMember$919());
                marker$1530.end();
                marker$1530.apply(expr$1531);
            } else {
                expr$1531 = delegate$853.createTaggedTemplateExpression(expr$1531, parseTemplateLiteral$913());
                marker$1530.end();
                marker$1530.apply(expr$1531);
            }
        }
        return expr$1531;
    }
    function trackLeftHandSideExpressionAllowCall$997() {
        var marker$1532, expr$1533, args$1534;
        // skipComment();
        marker$1532 = createLocationMarker$994();
        expr$1533 = matchKeyword$900('new') ? parseNewExpression$921() : parsePrimaryExpression$915();
        while (match$899('.') || match$899('[') || match$899('(') || lookahead$856.type === Token$834.Template) {
            if (match$899('(')) {
                args$1534 = parseArguments$916();
                expr$1533 = delegate$853.createCallExpression(expr$1533, args$1534);
                marker$1532.end();
                marker$1532.apply(expr$1533);
            } else if (match$899('[')) {
                expr$1533 = delegate$853.createMemberExpression('[', expr$1533, parseComputedMember$920());
                marker$1532.end();
                marker$1532.apply(expr$1533);
            } else if (match$899('.')) {
                expr$1533 = delegate$853.createMemberExpression('.', expr$1533, parseNonComputedMember$919());
                marker$1532.end();
                marker$1532.apply(expr$1533);
            } else {
                expr$1533 = delegate$853.createTaggedTemplateExpression(expr$1533, parseTemplateLiteral$913());
                marker$1532.end();
                marker$1532.apply(expr$1533);
            }
        }
        return expr$1533;
    }
    function filterGroup$998(node$1535) {
        var n$1536, i$1537, entry$1538;
        n$1536 = Object.prototype.toString.apply(node$1535) === '[object Array]' ? [] : {};
        for (i$1537 in node$1535) {
            if (node$1535.hasOwnProperty(i$1537) && i$1537 !== 'groupRange' && i$1537 !== 'groupLoc') {
                entry$1538 = node$1535[i$1537];
                if (entry$1538 === null || typeof entry$1538 !== 'object' || entry$1538 instanceof RegExp) {
                    n$1536[i$1537] = entry$1538;
                } else {
                    n$1536[i$1537] = filterGroup$998(entry$1538);
                }
            }
        }
        return n$1536;
    }
    function wrapTrackingFunction$999(range$1539, loc$1540) {
        return function (parseFunction$1541) {
            function isBinary$1542(node$1544) {
                return node$1544.type === Syntax$837.LogicalExpression || node$1544.type === Syntax$837.BinaryExpression;
            }
            function visit$1543(node$1545) {
                var start$1546, end$1547;
                if (isBinary$1542(node$1545.left)) {
                    visit$1543(node$1545.left);
                }
                if (isBinary$1542(node$1545.right)) {
                    visit$1543(node$1545.right);
                }
                if (range$1539) {
                    if (node$1545.left.groupRange || node$1545.right.groupRange) {
                        start$1546 = node$1545.left.groupRange ? node$1545.left.groupRange[0] : node$1545.left.range[0];
                        end$1547 = node$1545.right.groupRange ? node$1545.right.groupRange[1] : node$1545.right.range[1];
                        node$1545.range = [
                            start$1546,
                            end$1547
                        ];
                    } else if (typeof node$1545.range === 'undefined') {
                        start$1546 = node$1545.left.range[0];
                        end$1547 = node$1545.right.range[1];
                        node$1545.range = [
                            start$1546,
                            end$1547
                        ];
                    }
                }
                if (loc$1540) {
                    if (node$1545.left.groupLoc || node$1545.right.groupLoc) {
                        start$1546 = node$1545.left.groupLoc ? node$1545.left.groupLoc.start : node$1545.left.loc.start;
                        end$1547 = node$1545.right.groupLoc ? node$1545.right.groupLoc.end : node$1545.right.loc.end;
                        node$1545.loc = {
                            start: start$1546,
                            end: end$1547
                        };
                        node$1545 = delegate$853.postProcess(node$1545);
                    } else if (typeof node$1545.loc === 'undefined') {
                        node$1545.loc = {
                            start: node$1545.left.loc.start,
                            end: node$1545.right.loc.end
                        };
                        node$1545 = delegate$853.postProcess(node$1545);
                    }
                }
            }
            return function () {
                var marker$1548, node$1549, curr$1550 = lookahead$856;
                marker$1548 = createLocationMarker$994();
                node$1549 = parseFunction$1541.apply(null, arguments);
                marker$1548.end();
                if (node$1549.type !== Syntax$837.Program) {
                    if (curr$1550.leadingComments) {
                        node$1549.leadingComments = curr$1550.leadingComments;
                    }
                    if (curr$1550.trailingComments) {
                        node$1549.trailingComments = curr$1550.trailingComments;
                    }
                }
                if (range$1539 && typeof node$1549.range === 'undefined') {
                    marker$1548.apply(node$1549);
                }
                if (loc$1540 && typeof node$1549.loc === 'undefined') {
                    marker$1548.apply(node$1549);
                }
                if (isBinary$1542(node$1549)) {
                    visit$1543(node$1549);
                }
                return node$1549;
            };
        };
    }
    function patch$1000() {
        var wrapTracking$1551;
        if (extra$859.comments) {
            extra$859.skipComment = skipComment$873;
            skipComment$873 = scanComment$988;
        }
        if (extra$859.range || extra$859.loc) {
            extra$859.parseGroupExpression = parseGroupExpression$914;
            extra$859.parseLeftHandSideExpression = parseLeftHandSideExpression$923;
            extra$859.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$922;
            parseGroupExpression$914 = trackGroupExpression$995;
            parseLeftHandSideExpression$923 = trackLeftHandSideExpression$996;
            parseLeftHandSideExpressionAllowCall$922 = trackLeftHandSideExpressionAllowCall$997;
            wrapTracking$1551 = wrapTrackingFunction$999(extra$859.range, extra$859.loc);
            extra$859.parseArrayInitialiser = parseArrayInitialiser$906;
            extra$859.parseAssignmentExpression = parseAssignmentExpression$933;
            extra$859.parseBinaryExpression = parseBinaryExpression$927;
            extra$859.parseBlock = parseBlock$936;
            extra$859.parseFunctionSourceElements = parseFunctionSourceElements$967;
            extra$859.parseCatchClause = parseCatchClause$962;
            extra$859.parseComputedMember = parseComputedMember$920;
            extra$859.parseConditionalExpression = parseConditionalExpression$928;
            extra$859.parseConstLetDeclaration = parseConstLetDeclaration$941;
            extra$859.parseExportBatchSpecifier = parseExportBatchSpecifier$943;
            extra$859.parseExportDeclaration = parseExportDeclaration$945;
            extra$859.parseExportSpecifier = parseExportSpecifier$944;
            extra$859.parseExpression = parseExpression$934;
            extra$859.parseForVariableDeclaration = parseForVariableDeclaration$953;
            extra$859.parseFunctionDeclaration = parseFunctionDeclaration$971;
            extra$859.parseFunctionExpression = parseFunctionExpression$972;
            extra$859.parseParams = parseParams$970;
            extra$859.parseImportDeclaration = parseImportDeclaration$946;
            extra$859.parseImportSpecifier = parseImportSpecifier$947;
            extra$859.parseModuleDeclaration = parseModuleDeclaration$942;
            extra$859.parseModuleBlock = parseModuleBlock$985;
            extra$859.parseNewExpression = parseNewExpression$921;
            extra$859.parseNonComputedProperty = parseNonComputedProperty$918;
            extra$859.parseObjectInitialiser = parseObjectInitialiser$911;
            extra$859.parseObjectProperty = parseObjectProperty$910;
            extra$859.parseObjectPropertyKey = parseObjectPropertyKey$909;
            extra$859.parsePostfixExpression = parsePostfixExpression$924;
            extra$859.parsePrimaryExpression = parsePrimaryExpression$915;
            extra$859.parseProgram = parseProgram$986;
            extra$859.parsePropertyFunction = parsePropertyFunction$907;
            extra$859.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$917;
            extra$859.parseTemplateElement = parseTemplateElement$912;
            extra$859.parseTemplateLiteral = parseTemplateLiteral$913;
            extra$859.parseStatement = parseStatement$965;
            extra$859.parseSwitchCase = parseSwitchCase$959;
            extra$859.parseUnaryExpression = parseUnaryExpression$925;
            extra$859.parseVariableDeclaration = parseVariableDeclaration$938;
            extra$859.parseVariableIdentifier = parseVariableIdentifier$937;
            extra$859.parseMethodDefinition = parseMethodDefinition$974;
            extra$859.parseClassDeclaration = parseClassDeclaration$978;
            extra$859.parseClassExpression = parseClassExpression$977;
            extra$859.parseClassBody = parseClassBody$976;
            parseArrayInitialiser$906 = wrapTracking$1551(extra$859.parseArrayInitialiser);
            parseAssignmentExpression$933 = wrapTracking$1551(extra$859.parseAssignmentExpression);
            parseBinaryExpression$927 = wrapTracking$1551(extra$859.parseBinaryExpression);
            parseBlock$936 = wrapTracking$1551(extra$859.parseBlock);
            parseFunctionSourceElements$967 = wrapTracking$1551(extra$859.parseFunctionSourceElements);
            parseCatchClause$962 = wrapTracking$1551(extra$859.parseCatchClause);
            parseComputedMember$920 = wrapTracking$1551(extra$859.parseComputedMember);
            parseConditionalExpression$928 = wrapTracking$1551(extra$859.parseConditionalExpression);
            parseConstLetDeclaration$941 = wrapTracking$1551(extra$859.parseConstLetDeclaration);
            parseExportBatchSpecifier$943 = wrapTracking$1551(parseExportBatchSpecifier$943);
            parseExportDeclaration$945 = wrapTracking$1551(parseExportDeclaration$945);
            parseExportSpecifier$944 = wrapTracking$1551(parseExportSpecifier$944);
            parseExpression$934 = wrapTracking$1551(extra$859.parseExpression);
            parseForVariableDeclaration$953 = wrapTracking$1551(extra$859.parseForVariableDeclaration);
            parseFunctionDeclaration$971 = wrapTracking$1551(extra$859.parseFunctionDeclaration);
            parseFunctionExpression$972 = wrapTracking$1551(extra$859.parseFunctionExpression);
            parseParams$970 = wrapTracking$1551(extra$859.parseParams);
            parseImportDeclaration$946 = wrapTracking$1551(extra$859.parseImportDeclaration);
            parseImportSpecifier$947 = wrapTracking$1551(extra$859.parseImportSpecifier);
            parseModuleDeclaration$942 = wrapTracking$1551(extra$859.parseModuleDeclaration);
            parseModuleBlock$985 = wrapTracking$1551(extra$859.parseModuleBlock);
            parseLeftHandSideExpression$923 = wrapTracking$1551(parseLeftHandSideExpression$923);
            parseNewExpression$921 = wrapTracking$1551(extra$859.parseNewExpression);
            parseNonComputedProperty$918 = wrapTracking$1551(extra$859.parseNonComputedProperty);
            parseObjectInitialiser$911 = wrapTracking$1551(extra$859.parseObjectInitialiser);
            parseObjectProperty$910 = wrapTracking$1551(extra$859.parseObjectProperty);
            parseObjectPropertyKey$909 = wrapTracking$1551(extra$859.parseObjectPropertyKey);
            parsePostfixExpression$924 = wrapTracking$1551(extra$859.parsePostfixExpression);
            parsePrimaryExpression$915 = wrapTracking$1551(extra$859.parsePrimaryExpression);
            parseProgram$986 = wrapTracking$1551(extra$859.parseProgram);
            parsePropertyFunction$907 = wrapTracking$1551(extra$859.parsePropertyFunction);
            parseTemplateElement$912 = wrapTracking$1551(extra$859.parseTemplateElement);
            parseTemplateLiteral$913 = wrapTracking$1551(extra$859.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$917 = wrapTracking$1551(extra$859.parseSpreadOrAssignmentExpression);
            parseStatement$965 = wrapTracking$1551(extra$859.parseStatement);
            parseSwitchCase$959 = wrapTracking$1551(extra$859.parseSwitchCase);
            parseUnaryExpression$925 = wrapTracking$1551(extra$859.parseUnaryExpression);
            parseVariableDeclaration$938 = wrapTracking$1551(extra$859.parseVariableDeclaration);
            parseVariableIdentifier$937 = wrapTracking$1551(extra$859.parseVariableIdentifier);
            parseMethodDefinition$974 = wrapTracking$1551(extra$859.parseMethodDefinition);
            parseClassDeclaration$978 = wrapTracking$1551(extra$859.parseClassDeclaration);
            parseClassExpression$977 = wrapTracking$1551(extra$859.parseClassExpression);
            parseClassBody$976 = wrapTracking$1551(extra$859.parseClassBody);
        }
        if (typeof extra$859.tokens !== 'undefined') {
            extra$859.advance = advance$889;
            extra$859.scanRegExp = scanRegExp$886;
            advance$889 = collectToken$990;
            scanRegExp$886 = collectRegex$991;
        }
    }
    function unpatch$1001() {
        if (typeof extra$859.skipComment === 'function') {
            skipComment$873 = extra$859.skipComment;
        }
        if (extra$859.range || extra$859.loc) {
            parseArrayInitialiser$906 = extra$859.parseArrayInitialiser;
            parseAssignmentExpression$933 = extra$859.parseAssignmentExpression;
            parseBinaryExpression$927 = extra$859.parseBinaryExpression;
            parseBlock$936 = extra$859.parseBlock;
            parseFunctionSourceElements$967 = extra$859.parseFunctionSourceElements;
            parseCatchClause$962 = extra$859.parseCatchClause;
            parseComputedMember$920 = extra$859.parseComputedMember;
            parseConditionalExpression$928 = extra$859.parseConditionalExpression;
            parseConstLetDeclaration$941 = extra$859.parseConstLetDeclaration;
            parseExportBatchSpecifier$943 = extra$859.parseExportBatchSpecifier;
            parseExportDeclaration$945 = extra$859.parseExportDeclaration;
            parseExportSpecifier$944 = extra$859.parseExportSpecifier;
            parseExpression$934 = extra$859.parseExpression;
            parseForVariableDeclaration$953 = extra$859.parseForVariableDeclaration;
            parseFunctionDeclaration$971 = extra$859.parseFunctionDeclaration;
            parseFunctionExpression$972 = extra$859.parseFunctionExpression;
            parseImportDeclaration$946 = extra$859.parseImportDeclaration;
            parseImportSpecifier$947 = extra$859.parseImportSpecifier;
            parseGroupExpression$914 = extra$859.parseGroupExpression;
            parseLeftHandSideExpression$923 = extra$859.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$922 = extra$859.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$942 = extra$859.parseModuleDeclaration;
            parseModuleBlock$985 = extra$859.parseModuleBlock;
            parseNewExpression$921 = extra$859.parseNewExpression;
            parseNonComputedProperty$918 = extra$859.parseNonComputedProperty;
            parseObjectInitialiser$911 = extra$859.parseObjectInitialiser;
            parseObjectProperty$910 = extra$859.parseObjectProperty;
            parseObjectPropertyKey$909 = extra$859.parseObjectPropertyKey;
            parsePostfixExpression$924 = extra$859.parsePostfixExpression;
            parsePrimaryExpression$915 = extra$859.parsePrimaryExpression;
            parseProgram$986 = extra$859.parseProgram;
            parsePropertyFunction$907 = extra$859.parsePropertyFunction;
            parseTemplateElement$912 = extra$859.parseTemplateElement;
            parseTemplateLiteral$913 = extra$859.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$917 = extra$859.parseSpreadOrAssignmentExpression;
            parseStatement$965 = extra$859.parseStatement;
            parseSwitchCase$959 = extra$859.parseSwitchCase;
            parseUnaryExpression$925 = extra$859.parseUnaryExpression;
            parseVariableDeclaration$938 = extra$859.parseVariableDeclaration;
            parseVariableIdentifier$937 = extra$859.parseVariableIdentifier;
            parseMethodDefinition$974 = extra$859.parseMethodDefinition;
            parseClassDeclaration$978 = extra$859.parseClassDeclaration;
            parseClassExpression$977 = extra$859.parseClassExpression;
            parseClassBody$976 = extra$859.parseClassBody;
        }
        if (typeof extra$859.scanRegExp === 'function') {
            advance$889 = extra$859.advance;
            scanRegExp$886 = extra$859.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1002(object$1552, properties$1553) {
        var entry$1554, result$1555 = {};
        for (entry$1554 in object$1552) {
            if (object$1552.hasOwnProperty(entry$1554)) {
                result$1555[entry$1554] = object$1552[entry$1554];
            }
        }
        for (entry$1554 in properties$1553) {
            if (properties$1553.hasOwnProperty(entry$1554)) {
                result$1555[entry$1554] = properties$1553[entry$1554];
            }
        }
        return result$1555;
    }
    function tokenize$1003(code$1556, options$1557) {
        var toString$1558, token$1559, tokens$1560;
        toString$1558 = String;
        if (typeof code$1556 !== 'string' && !(code$1556 instanceof String)) {
            code$1556 = toString$1558(code$1556);
        }
        delegate$853 = SyntaxTreeDelegate$841;
        source$843 = code$1556;
        index$845 = 0;
        lineNumber$846 = source$843.length > 0 ? 1 : 0;
        lineStart$847 = 0;
        length$852 = source$843.length;
        lookahead$856 = null;
        state$858 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$859 = {};
        // Options matching.
        options$1557 = options$1557 || {};
        // Of course we collect tokens here.
        options$1557.tokens = true;
        extra$859.tokens = [];
        extra$859.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$859.openParenToken = -1;
        extra$859.openCurlyToken = -1;
        extra$859.range = typeof options$1557.range === 'boolean' && options$1557.range;
        extra$859.loc = typeof options$1557.loc === 'boolean' && options$1557.loc;
        if (typeof options$1557.comment === 'boolean' && options$1557.comment) {
            extra$859.comments = [];
        }
        if (typeof options$1557.tolerant === 'boolean' && options$1557.tolerant) {
            extra$859.errors = [];
        }
        if (length$852 > 0) {
            if (typeof source$843[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1556 instanceof String) {
                    source$843 = code$1556.valueOf();
                }
            }
        }
        patch$1000();
        try {
            peek$891();
            if (lookahead$856.type === Token$834.EOF) {
                return extra$859.tokens;
            }
            token$1559 = lex$890();
            while (lookahead$856.type !== Token$834.EOF) {
                try {
                    token$1559 = lex$890();
                } catch (lexError$1561) {
                    token$1559 = lookahead$856;
                    if (extra$859.errors) {
                        extra$859.errors.push(lexError$1561);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1561;
                    }
                }
            }
            filterTokenLocation$992();
            tokens$1560 = extra$859.tokens;
            if (typeof extra$859.comments !== 'undefined') {
                filterCommentLocation$989();
                tokens$1560.comments = extra$859.comments;
            }
            if (typeof extra$859.errors !== 'undefined') {
                tokens$1560.errors = extra$859.errors;
            }
        } catch (e$1562) {
            throw e$1562;
        } finally {
            unpatch$1001();
            extra$859 = {};
        }
        return tokens$1560;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1004(toks$1563, start$1564, inExprDelim$1565, parentIsBlock$1566) {
        var assignOps$1567 = [
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
        var binaryOps$1568 = [
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
        var unaryOps$1569 = [
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
        function back$1570(n$1571) {
            var idx$1572 = toks$1563.length - n$1571 > 0 ? toks$1563.length - n$1571 : 0;
            return toks$1563[idx$1572];
        }
        if (inExprDelim$1565 && toks$1563.length - (start$1564 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1570(start$1564 + 2).value === ':' && parentIsBlock$1566) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$861(back$1570(start$1564 + 2).value, unaryOps$1569.concat(binaryOps$1568).concat(assignOps$1567))) {
            // ... + {...}
            return false;
        } else if (back$1570(start$1564 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1573 = typeof back$1570(start$1564 + 1).startLineNumber !== 'undefined' ? back$1570(start$1564 + 1).startLineNumber : back$1570(start$1564 + 1).lineNumber;
            if (back$1570(start$1564 + 2).lineNumber !== currLineNumber$1573) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$861(back$1570(start$1564 + 2).value, [
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
    function readToken$1005(toks$1574, inExprDelim$1575, parentIsBlock$1576) {
        var delimiters$1577 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1578 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1579 = toks$1574.length - 1;
        var comments$1580, commentsLen$1581 = extra$859.comments.length;
        function back$1582(n$1586) {
            var idx$1587 = toks$1574.length - n$1586 > 0 ? toks$1574.length - n$1586 : 0;
            return toks$1574[idx$1587];
        }
        function attachComments$1583(token$1588) {
            if (comments$1580) {
                token$1588.leadingComments = comments$1580;
            }
            return token$1588;
        }
        function _advance$1584() {
            return attachComments$1583(advance$889());
        }
        function _scanRegExp$1585() {
            return attachComments$1583(scanRegExp$886());
        }
        skipComment$873();
        if (extra$859.comments.length > commentsLen$1581) {
            comments$1580 = extra$859.comments.slice(commentsLen$1581);
        }
        if (isIn$861(source$843[index$845], delimiters$1577)) {
            return attachComments$1583(readDelim$1006(toks$1574, inExprDelim$1575, parentIsBlock$1576));
        }
        if (source$843[index$845] === '/') {
            var prev$1589 = back$1582(1);
            if (prev$1589) {
                if (prev$1589.value === '()') {
                    if (isIn$861(back$1582(2).value, parenIdents$1578)) {
                        // ... if (...) / ...
                        return _scanRegExp$1585();
                    }
                    // ... (...) / ...
                    return _advance$1584();
                }
                if (prev$1589.value === '{}') {
                    if (blockAllowed$1004(toks$1574, 0, inExprDelim$1575, parentIsBlock$1576)) {
                        if (back$1582(2).value === '()') {
                            // named function
                            if (back$1582(4).value === 'function') {
                                if (!blockAllowed$1004(toks$1574, 3, inExprDelim$1575, parentIsBlock$1576)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1584();
                                }
                                if (toks$1574.length - 5 <= 0 && inExprDelim$1575) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1584();
                                }
                            }
                            // unnamed function
                            if (back$1582(3).value === 'function') {
                                if (!blockAllowed$1004(toks$1574, 2, inExprDelim$1575, parentIsBlock$1576)) {
                                    // new function (...) {...} / ...
                                    return _advance$1584();
                                }
                                if (toks$1574.length - 4 <= 0 && inExprDelim$1575) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1584();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1585();
                    } else {
                        // ... + {...} / ...
                        return _advance$1584();
                    }
                }
                if (prev$1589.type === Token$834.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1585();
                }
                if (isKeyword$872(prev$1589.value)) {
                    // typeof /...
                    return _scanRegExp$1585();
                }
                return _advance$1584();
            }
            return _scanRegExp$1585();
        }
        return _advance$1584();
    }
    function readDelim$1006(toks$1590, inExprDelim$1591, parentIsBlock$1592) {
        var startDelim$1593 = advance$889(), matchDelim$1594 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1595 = [];
        var delimiters$1596 = [
                '(',
                '{',
                '['
            ];
        assert$860(delimiters$1596.indexOf(startDelim$1593.value) !== -1, 'Need to begin at the delimiter');
        var token$1597 = startDelim$1593;
        var startLineNumber$1598 = token$1597.lineNumber;
        var startLineStart$1599 = token$1597.lineStart;
        var startRange$1600 = token$1597.range;
        var delimToken$1601 = {};
        delimToken$1601.type = Token$834.Delimiter;
        delimToken$1601.value = startDelim$1593.value + matchDelim$1594[startDelim$1593.value];
        delimToken$1601.startLineNumber = startLineNumber$1598;
        delimToken$1601.startLineStart = startLineStart$1599;
        delimToken$1601.startRange = startRange$1600;
        var delimIsBlock$1602 = false;
        if (startDelim$1593.value === '{') {
            delimIsBlock$1602 = blockAllowed$1004(toks$1590.concat(delimToken$1601), 0, inExprDelim$1591, parentIsBlock$1592);
        }
        while (index$845 <= length$852) {
            token$1597 = readToken$1005(inner$1595, startDelim$1593.value === '(' || startDelim$1593.value === '[', delimIsBlock$1602);
            if (token$1597.type === Token$834.Punctuator && token$1597.value === matchDelim$1594[startDelim$1593.value]) {
                if (token$1597.leadingComments) {
                    delimToken$1601.trailingComments = token$1597.leadingComments;
                }
                break;
            } else if (token$1597.type === Token$834.EOF) {
                throwError$894({}, Messages$839.UnexpectedEOS);
            } else {
                inner$1595.push(token$1597);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$845 >= length$852 && matchDelim$1594[startDelim$1593.value] !== source$843[length$852 - 1]) {
            throwError$894({}, Messages$839.UnexpectedEOS);
        }
        var endLineNumber$1603 = token$1597.lineNumber;
        var endLineStart$1604 = token$1597.lineStart;
        var endRange$1605 = token$1597.range;
        delimToken$1601.inner = inner$1595;
        delimToken$1601.endLineNumber = endLineNumber$1603;
        delimToken$1601.endLineStart = endLineStart$1604;
        delimToken$1601.endRange = endRange$1605;
        return delimToken$1601;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$1007(code$1606) {
        var token$1607, tokenTree$1608 = [];
        extra$859 = {};
        extra$859.comments = [];
        patch$1000();
        source$843 = code$1606;
        index$845 = 0;
        lineNumber$846 = source$843.length > 0 ? 1 : 0;
        lineStart$847 = 0;
        length$852 = source$843.length;
        state$858 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$845 < length$852) {
            tokenTree$1608.push(readToken$1005(tokenTree$1608, false, false));
        }
        var last$1609 = tokenTree$1608[tokenTree$1608.length - 1];
        if (last$1609 && last$1609.type !== Token$834.EOF) {
            tokenTree$1608.push({
                type: Token$834.EOF,
                value: '',
                lineNumber: last$1609.lineNumber,
                lineStart: last$1609.lineStart,
                range: [
                    index$845,
                    index$845
                ]
            });
        }
        return expander$833.tokensToSyntax(tokenTree$1608);
    }
    function parse$1008(code$1610, options$1611) {
        var program$1612, toString$1613;
        extra$859 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1610)) {
            tokenStream$854 = code$1610;
            length$852 = tokenStream$854.length;
            lineNumber$846 = tokenStream$854.length > 0 ? 1 : 0;
            source$843 = undefined;
        } else {
            toString$1613 = String;
            if (typeof code$1610 !== 'string' && !(code$1610 instanceof String)) {
                code$1610 = toString$1613(code$1610);
            }
            source$843 = code$1610;
            length$852 = source$843.length;
            lineNumber$846 = source$843.length > 0 ? 1 : 0;
        }
        delegate$853 = SyntaxTreeDelegate$841;
        streamIndex$855 = -1;
        index$845 = 0;
        lineStart$847 = 0;
        sm_lineStart$849 = 0;
        sm_lineNumber$848 = lineNumber$846;
        sm_index$851 = 0;
        sm_range$850 = [
            0,
            0
        ];
        lookahead$856 = null;
        state$858 = {
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
        if (typeof options$1611 !== 'undefined') {
            extra$859.range = typeof options$1611.range === 'boolean' && options$1611.range;
            extra$859.loc = typeof options$1611.loc === 'boolean' && options$1611.loc;
            if (extra$859.loc && options$1611.source !== null && options$1611.source !== undefined) {
                delegate$853 = extend$1002(delegate$853, {
                    'postProcess': function (node$1614) {
                        node$1614.loc.source = toString$1613(options$1611.source);
                        return node$1614;
                    }
                });
            }
            if (typeof options$1611.tokens === 'boolean' && options$1611.tokens) {
                extra$859.tokens = [];
            }
            if (typeof options$1611.comment === 'boolean' && options$1611.comment) {
                extra$859.comments = [];
            }
            if (typeof options$1611.tolerant === 'boolean' && options$1611.tolerant) {
                extra$859.errors = [];
            }
        }
        if (length$852 > 0) {
            if (source$843 && typeof source$843[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1610 instanceof String) {
                    source$843 = code$1610.valueOf();
                }
            }
        }
        extra$859 = { loc: true };
        patch$1000();
        try {
            program$1612 = parseProgram$986();
            if (typeof extra$859.comments !== 'undefined') {
                filterCommentLocation$989();
                program$1612.comments = extra$859.comments;
            }
            if (typeof extra$859.tokens !== 'undefined') {
                filterTokenLocation$992();
                program$1612.tokens = extra$859.tokens;
            }
            if (typeof extra$859.errors !== 'undefined') {
                program$1612.errors = extra$859.errors;
            }
            if (extra$859.range || extra$859.loc) {
                program$1612.body = filterGroup$998(program$1612.body);
            }
        } catch (e$1615) {
            throw e$1615;
        } finally {
            unpatch$1001();
            extra$859 = {};
        }
        return program$1612;
    }
    exports$832.tokenize = tokenize$1003;
    exports$832.read = read$1007;
    exports$832.Token = Token$834;
    exports$832.assert = assert$860;
    exports$832.parse = parse$1008;
    // Deep copy.
    exports$832.Syntax = function () {
        var name$1616, types$1617 = {};
        if (typeof Object.create === 'function') {
            types$1617 = Object.create(null);
        }
        for (name$1616 in Syntax$837) {
            if (Syntax$837.hasOwnProperty(name$1616)) {
                types$1617[name$1616] = Syntax$837[name$1616];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1617);
        }
        return types$1617;
    }();
}));
//# sourceMappingURL=parser.js.map