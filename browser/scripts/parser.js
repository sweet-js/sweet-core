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
(function (root$839, factory$840) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$840);
    } else if (typeof exports !== 'undefined') {
        factory$840(exports, require('./expander'));
    } else {
        factory$840(root$839.esprima = {});
    }
}(this, function (exports$841, expander$842) {
    'use strict';
    var Token$843, TokenName$844, FnExprTokens$845, Syntax$846, PropertyKind$847, Messages$848, Regex$849, SyntaxTreeDelegate$850, ClassPropertyType$851, source$852, strict$853, index$854, lineNumber$855, lineStart$856, sm_lineNumber$857, sm_lineStart$858, sm_range$859, sm_index$860, length$861, delegate$862, tokenStream$863, streamIndex$864, lookahead$865, lookaheadIndex$866, state$867, extra$868;
    Token$843 = {
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
    TokenName$844 = {};
    TokenName$844[Token$843.BooleanLiteral] = 'Boolean';
    TokenName$844[Token$843.EOF] = '<end>';
    TokenName$844[Token$843.Identifier] = 'Identifier';
    TokenName$844[Token$843.Keyword] = 'Keyword';
    TokenName$844[Token$843.NullLiteral] = 'Null';
    TokenName$844[Token$843.NumericLiteral] = 'Numeric';
    TokenName$844[Token$843.Punctuator] = 'Punctuator';
    TokenName$844[Token$843.StringLiteral] = 'String';
    TokenName$844[Token$843.RegularExpression] = 'RegularExpression';
    TokenName$844[Token$843.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$845 = [
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
    Syntax$846 = {
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
    PropertyKind$847 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$851 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$848 = {
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
    Regex$849 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$869(condition$1018, message$1019) {
        if (!condition$1018) {
            throw new Error('ASSERT: ' + message$1019);
        }
    }
    function isIn$870(el$1020, list$1021) {
        return list$1021.indexOf(el$1020) !== -1;
    }
    function isDecimalDigit$871(ch$1022) {
        return ch$1022 >= 48 && ch$1022 <= 57;
    }    // 0..9
    function isHexDigit$872(ch$1023) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1023) >= 0;
    }
    function isOctalDigit$873(ch$1024) {
        return '01234567'.indexOf(ch$1024) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$874(ch$1025) {
        return ch$1025 === 32 || ch$1025 === 9 || ch$1025 === 11 || ch$1025 === 12 || ch$1025 === 160 || ch$1025 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1025)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$875(ch$1026) {
        return ch$1026 === 10 || ch$1026 === 13 || ch$1026 === 8232 || ch$1026 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$876(ch$1027) {
        return ch$1027 === 36 || ch$1027 === 95 || ch$1027 >= 65 && ch$1027 <= 90 || ch$1027 >= 97 && ch$1027 <= 122 || ch$1027 === 92 || ch$1027 >= 128 && Regex$849.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1027));
    }
    function isIdentifierPart$877(ch$1028) {
        return ch$1028 === 36 || ch$1028 === 95 || ch$1028 >= 65 && ch$1028 <= 90 || ch$1028 >= 97 && ch$1028 <= 122 || ch$1028 >= 48 && ch$1028 <= 57 || ch$1028 === 92 || ch$1028 >= 128 && Regex$849.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1028));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$878(id$1029) {
        switch (id$1029) {
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
    function isStrictModeReservedWord$879(id$1030) {
        switch (id$1030) {
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
    function isRestrictedWord$880(id$1031) {
        return id$1031 === 'eval' || id$1031 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$881(id$1032) {
        if (strict$853 && isStrictModeReservedWord$879(id$1032)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1032.length) {
        case 2:
            return id$1032 === 'if' || id$1032 === 'in' || id$1032 === 'do';
        case 3:
            return id$1032 === 'var' || id$1032 === 'for' || id$1032 === 'new' || id$1032 === 'try' || id$1032 === 'let';
        case 4:
            return id$1032 === 'this' || id$1032 === 'else' || id$1032 === 'case' || id$1032 === 'void' || id$1032 === 'with' || id$1032 === 'enum';
        case 5:
            return id$1032 === 'while' || id$1032 === 'break' || id$1032 === 'catch' || id$1032 === 'throw' || id$1032 === 'const' || id$1032 === 'yield' || id$1032 === 'class' || id$1032 === 'super';
        case 6:
            return id$1032 === 'return' || id$1032 === 'typeof' || id$1032 === 'delete' || id$1032 === 'switch' || id$1032 === 'export' || id$1032 === 'import';
        case 7:
            return id$1032 === 'default' || id$1032 === 'finally' || id$1032 === 'extends';
        case 8:
            return id$1032 === 'function' || id$1032 === 'continue' || id$1032 === 'debugger';
        case 10:
            return id$1032 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$882() {
        var ch$1033, blockComment$1034, lineComment$1035;
        blockComment$1034 = false;
        lineComment$1035 = false;
        while (index$854 < length$861) {
            ch$1033 = source$852.charCodeAt(index$854);
            if (lineComment$1035) {
                ++index$854;
                if (isLineTerminator$875(ch$1033)) {
                    lineComment$1035 = false;
                    if (ch$1033 === 13 && source$852.charCodeAt(index$854) === 10) {
                        ++index$854;
                    }
                    ++lineNumber$855;
                    lineStart$856 = index$854;
                }
            } else if (blockComment$1034) {
                if (isLineTerminator$875(ch$1033)) {
                    if (ch$1033 === 13 && source$852.charCodeAt(index$854 + 1) === 10) {
                        ++index$854;
                    }
                    ++lineNumber$855;
                    ++index$854;
                    lineStart$856 = index$854;
                    if (index$854 >= length$861) {
                        throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1033 = source$852.charCodeAt(index$854++);
                    if (index$854 >= length$861) {
                        throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1033 === 42) {
                        ch$1033 = source$852.charCodeAt(index$854);
                        if (ch$1033 === 47) {
                            ++index$854;
                            blockComment$1034 = false;
                        }
                    }
                }
            } else if (ch$1033 === 47) {
                ch$1033 = source$852.charCodeAt(index$854 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1033 === 47) {
                    index$854 += 2;
                    lineComment$1035 = true;
                } else if (ch$1033 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$854 += 2;
                    blockComment$1034 = true;
                    if (index$854 >= length$861) {
                        throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$874(ch$1033)) {
                ++index$854;
            } else if (isLineTerminator$875(ch$1033)) {
                ++index$854;
                if (ch$1033 === 13 && source$852.charCodeAt(index$854) === 10) {
                    ++index$854;
                }
                ++lineNumber$855;
                lineStart$856 = index$854;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$883(prefix$1036) {
        var i$1037, len$1038, ch$1039, code$1040 = 0;
        len$1038 = prefix$1036 === 'u' ? 4 : 2;
        for (i$1037 = 0; i$1037 < len$1038; ++i$1037) {
            if (index$854 < length$861 && isHexDigit$872(source$852[index$854])) {
                ch$1039 = source$852[index$854++];
                code$1040 = code$1040 * 16 + '0123456789abcdef'.indexOf(ch$1039.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1040);
    }
    function scanUnicodeCodePointEscape$884() {
        var ch$1041, code$1042, cu1$1043, cu2$1044;
        ch$1041 = source$852[index$854];
        code$1042 = 0;
        // At least, one hex digit is required.
        if (ch$1041 === '}') {
            throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
        }
        while (index$854 < length$861) {
            ch$1041 = source$852[index$854++];
            if (!isHexDigit$872(ch$1041)) {
                break;
            }
            code$1042 = code$1042 * 16 + '0123456789abcdef'.indexOf(ch$1041.toLowerCase());
        }
        if (code$1042 > 1114111 || ch$1041 !== '}') {
            throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1042 <= 65535) {
            return String.fromCharCode(code$1042);
        }
        cu1$1043 = (code$1042 - 65536 >> 10) + 55296;
        cu2$1044 = (code$1042 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1043, cu2$1044);
    }
    function getEscapedIdentifier$885() {
        var ch$1045, id$1046;
        ch$1045 = source$852.charCodeAt(index$854++);
        id$1046 = String.fromCharCode(ch$1045);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1045 === 92) {
            if (source$852.charCodeAt(index$854) !== 117) {
                throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
            }
            ++index$854;
            ch$1045 = scanHexEscape$883('u');
            if (!ch$1045 || ch$1045 === '\\' || !isIdentifierStart$876(ch$1045.charCodeAt(0))) {
                throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
            }
            id$1046 = ch$1045;
        }
        while (index$854 < length$861) {
            ch$1045 = source$852.charCodeAt(index$854);
            if (!isIdentifierPart$877(ch$1045)) {
                break;
            }
            ++index$854;
            id$1046 += String.fromCharCode(ch$1045);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1045 === 92) {
                id$1046 = id$1046.substr(0, id$1046.length - 1);
                if (source$852.charCodeAt(index$854) !== 117) {
                    throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
                }
                ++index$854;
                ch$1045 = scanHexEscape$883('u');
                if (!ch$1045 || ch$1045 === '\\' || !isIdentifierPart$877(ch$1045.charCodeAt(0))) {
                    throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
                }
                id$1046 += ch$1045;
            }
        }
        return id$1046;
    }
    function getIdentifier$886() {
        var start$1047, ch$1048;
        start$1047 = index$854++;
        while (index$854 < length$861) {
            ch$1048 = source$852.charCodeAt(index$854);
            if (ch$1048 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$854 = start$1047;
                return getEscapedIdentifier$885();
            }
            if (isIdentifierPart$877(ch$1048)) {
                ++index$854;
            } else {
                break;
            }
        }
        return source$852.slice(start$1047, index$854);
    }
    function scanIdentifier$887() {
        var start$1049, id$1050, type$1051;
        start$1049 = index$854;
        // Backslash (char #92) starts an escaped character.
        id$1050 = source$852.charCodeAt(index$854) === 92 ? getEscapedIdentifier$885() : getIdentifier$886();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1050.length === 1) {
            type$1051 = Token$843.Identifier;
        } else if (isKeyword$881(id$1050)) {
            type$1051 = Token$843.Keyword;
        } else if (id$1050 === 'null') {
            type$1051 = Token$843.NullLiteral;
        } else if (id$1050 === 'true' || id$1050 === 'false') {
            type$1051 = Token$843.BooleanLiteral;
        } else {
            type$1051 = Token$843.Identifier;
        }
        return {
            type: type$1051,
            value: id$1050,
            lineNumber: lineNumber$855,
            lineStart: lineStart$856,
            range: [
                start$1049,
                index$854
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$888() {
        var start$1052 = index$854, code$1053 = source$852.charCodeAt(index$854), code2$1054, ch1$1055 = source$852[index$854], ch2$1056, ch3$1057, ch4$1058;
        switch (code$1053) {
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
            ++index$854;
            if (extra$868.tokenize) {
                if (code$1053 === 40) {
                    extra$868.openParenToken = extra$868.tokens.length;
                } else if (code$1053 === 123) {
                    extra$868.openCurlyToken = extra$868.tokens.length;
                }
            }
            return {
                type: Token$843.Punctuator,
                value: String.fromCharCode(code$1053),
                lineNumber: lineNumber$855,
                lineStart: lineStart$856,
                range: [
                    start$1052,
                    index$854
                ]
            };
        default:
            code2$1054 = source$852.charCodeAt(index$854 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1054 === 61) {
                switch (code$1053) {
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
                    index$854 += 2;
                    return {
                        type: Token$843.Punctuator,
                        value: String.fromCharCode(code$1053) + String.fromCharCode(code2$1054),
                        lineNumber: lineNumber$855,
                        lineStart: lineStart$856,
                        range: [
                            start$1052,
                            index$854
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$854 += 2;
                    // !== and ===
                    if (source$852.charCodeAt(index$854) === 61) {
                        ++index$854;
                    }
                    return {
                        type: Token$843.Punctuator,
                        value: source$852.slice(start$1052, index$854),
                        lineNumber: lineNumber$855,
                        lineStart: lineStart$856,
                        range: [
                            start$1052,
                            index$854
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1056 = source$852[index$854 + 1];
        ch3$1057 = source$852[index$854 + 2];
        ch4$1058 = source$852[index$854 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1055 === '>' && ch2$1056 === '>' && ch3$1057 === '>') {
            if (ch4$1058 === '=') {
                index$854 += 4;
                return {
                    type: Token$843.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$855,
                    lineStart: lineStart$856,
                    range: [
                        start$1052,
                        index$854
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1055 === '>' && ch2$1056 === '>' && ch3$1057 === '>') {
            index$854 += 3;
            return {
                type: Token$843.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$855,
                lineStart: lineStart$856,
                range: [
                    start$1052,
                    index$854
                ]
            };
        }
        if (ch1$1055 === '<' && ch2$1056 === '<' && ch3$1057 === '=') {
            index$854 += 3;
            return {
                type: Token$843.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$855,
                lineStart: lineStart$856,
                range: [
                    start$1052,
                    index$854
                ]
            };
        }
        if (ch1$1055 === '>' && ch2$1056 === '>' && ch3$1057 === '=') {
            index$854 += 3;
            return {
                type: Token$843.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$855,
                lineStart: lineStart$856,
                range: [
                    start$1052,
                    index$854
                ]
            };
        }
        if (ch1$1055 === '.' && ch2$1056 === '.' && ch3$1057 === '.') {
            index$854 += 3;
            return {
                type: Token$843.Punctuator,
                value: '...',
                lineNumber: lineNumber$855,
                lineStart: lineStart$856,
                range: [
                    start$1052,
                    index$854
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1055 === ch2$1056 && '+-<>&|'.indexOf(ch1$1055) >= 0) {
            index$854 += 2;
            return {
                type: Token$843.Punctuator,
                value: ch1$1055 + ch2$1056,
                lineNumber: lineNumber$855,
                lineStart: lineStart$856,
                range: [
                    start$1052,
                    index$854
                ]
            };
        }
        if (ch1$1055 === '=' && ch2$1056 === '>') {
            index$854 += 2;
            return {
                type: Token$843.Punctuator,
                value: '=>',
                lineNumber: lineNumber$855,
                lineStart: lineStart$856,
                range: [
                    start$1052,
                    index$854
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1055) >= 0) {
            ++index$854;
            return {
                type: Token$843.Punctuator,
                value: ch1$1055,
                lineNumber: lineNumber$855,
                lineStart: lineStart$856,
                range: [
                    start$1052,
                    index$854
                ]
            };
        }
        if (ch1$1055 === '.') {
            ++index$854;
            return {
                type: Token$843.Punctuator,
                value: ch1$1055,
                lineNumber: lineNumber$855,
                lineStart: lineStart$856,
                range: [
                    start$1052,
                    index$854
                ]
            };
        }
        throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$889(start$1059) {
        var number$1060 = '';
        while (index$854 < length$861) {
            if (!isHexDigit$872(source$852[index$854])) {
                break;
            }
            number$1060 += source$852[index$854++];
        }
        if (number$1060.length === 0) {
            throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$876(source$852.charCodeAt(index$854))) {
            throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$843.NumericLiteral,
            value: parseInt('0x' + number$1060, 16),
            lineNumber: lineNumber$855,
            lineStart: lineStart$856,
            range: [
                start$1059,
                index$854
            ]
        };
    }
    function scanOctalLiteral$890(prefix$1061, start$1062) {
        var number$1063, octal$1064;
        if (isOctalDigit$873(prefix$1061)) {
            octal$1064 = true;
            number$1063 = '0' + source$852[index$854++];
        } else {
            octal$1064 = false;
            ++index$854;
            number$1063 = '';
        }
        while (index$854 < length$861) {
            if (!isOctalDigit$873(source$852[index$854])) {
                break;
            }
            number$1063 += source$852[index$854++];
        }
        if (!octal$1064 && number$1063.length === 0) {
            // only 0o or 0O
            throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$876(source$852.charCodeAt(index$854)) || isDecimalDigit$871(source$852.charCodeAt(index$854))) {
            throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$843.NumericLiteral,
            value: parseInt(number$1063, 8),
            octal: octal$1064,
            lineNumber: lineNumber$855,
            lineStart: lineStart$856,
            range: [
                start$1062,
                index$854
            ]
        };
    }
    function scanNumericLiteral$891() {
        var number$1065, start$1066, ch$1067, octal$1068;
        ch$1067 = source$852[index$854];
        assert$869(isDecimalDigit$871(ch$1067.charCodeAt(0)) || ch$1067 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1066 = index$854;
        number$1065 = '';
        if (ch$1067 !== '.') {
            number$1065 = source$852[index$854++];
            ch$1067 = source$852[index$854];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1065 === '0') {
                if (ch$1067 === 'x' || ch$1067 === 'X') {
                    ++index$854;
                    return scanHexLiteral$889(start$1066);
                }
                if (ch$1067 === 'b' || ch$1067 === 'B') {
                    ++index$854;
                    number$1065 = '';
                    while (index$854 < length$861) {
                        ch$1067 = source$852[index$854];
                        if (ch$1067 !== '0' && ch$1067 !== '1') {
                            break;
                        }
                        number$1065 += source$852[index$854++];
                    }
                    if (number$1065.length === 0) {
                        // only 0b or 0B
                        throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$854 < length$861) {
                        ch$1067 = source$852.charCodeAt(index$854);
                        if (isIdentifierStart$876(ch$1067) || isDecimalDigit$871(ch$1067)) {
                            throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$843.NumericLiteral,
                        value: parseInt(number$1065, 2),
                        lineNumber: lineNumber$855,
                        lineStart: lineStart$856,
                        range: [
                            start$1066,
                            index$854
                        ]
                    };
                }
                if (ch$1067 === 'o' || ch$1067 === 'O' || isOctalDigit$873(ch$1067)) {
                    return scanOctalLiteral$890(ch$1067, start$1066);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1067 && isDecimalDigit$871(ch$1067.charCodeAt(0))) {
                    throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$871(source$852.charCodeAt(index$854))) {
                number$1065 += source$852[index$854++];
            }
            ch$1067 = source$852[index$854];
        }
        if (ch$1067 === '.') {
            number$1065 += source$852[index$854++];
            while (isDecimalDigit$871(source$852.charCodeAt(index$854))) {
                number$1065 += source$852[index$854++];
            }
            ch$1067 = source$852[index$854];
        }
        if (ch$1067 === 'e' || ch$1067 === 'E') {
            number$1065 += source$852[index$854++];
            ch$1067 = source$852[index$854];
            if (ch$1067 === '+' || ch$1067 === '-') {
                number$1065 += source$852[index$854++];
            }
            if (isDecimalDigit$871(source$852.charCodeAt(index$854))) {
                while (isDecimalDigit$871(source$852.charCodeAt(index$854))) {
                    number$1065 += source$852[index$854++];
                }
            } else {
                throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$876(source$852.charCodeAt(index$854))) {
            throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$843.NumericLiteral,
            value: parseFloat(number$1065),
            lineNumber: lineNumber$855,
            lineStart: lineStart$856,
            range: [
                start$1066,
                index$854
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$892() {
        var str$1069 = '', quote$1070, start$1071, ch$1072, code$1073, unescaped$1074, restore$1075, octal$1076 = false;
        quote$1070 = source$852[index$854];
        assert$869(quote$1070 === '\'' || quote$1070 === '"', 'String literal must starts with a quote');
        start$1071 = index$854;
        ++index$854;
        while (index$854 < length$861) {
            ch$1072 = source$852[index$854++];
            if (ch$1072 === quote$1070) {
                quote$1070 = '';
                break;
            } else if (ch$1072 === '\\') {
                ch$1072 = source$852[index$854++];
                if (!ch$1072 || !isLineTerminator$875(ch$1072.charCodeAt(0))) {
                    switch (ch$1072) {
                    case 'n':
                        str$1069 += '\n';
                        break;
                    case 'r':
                        str$1069 += '\r';
                        break;
                    case 't':
                        str$1069 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$852[index$854] === '{') {
                            ++index$854;
                            str$1069 += scanUnicodeCodePointEscape$884();
                        } else {
                            restore$1075 = index$854;
                            unescaped$1074 = scanHexEscape$883(ch$1072);
                            if (unescaped$1074) {
                                str$1069 += unescaped$1074;
                            } else {
                                index$854 = restore$1075;
                                str$1069 += ch$1072;
                            }
                        }
                        break;
                    case 'b':
                        str$1069 += '\b';
                        break;
                    case 'f':
                        str$1069 += '\f';
                        break;
                    case 'v':
                        str$1069 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$873(ch$1072)) {
                            code$1073 = '01234567'.indexOf(ch$1072);
                            // \0 is not octal escape sequence
                            if (code$1073 !== 0) {
                                octal$1076 = true;
                            }
                            if (index$854 < length$861 && isOctalDigit$873(source$852[index$854])) {
                                octal$1076 = true;
                                code$1073 = code$1073 * 8 + '01234567'.indexOf(source$852[index$854++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1072) >= 0 && index$854 < length$861 && isOctalDigit$873(source$852[index$854])) {
                                    code$1073 = code$1073 * 8 + '01234567'.indexOf(source$852[index$854++]);
                                }
                            }
                            str$1069 += String.fromCharCode(code$1073);
                        } else {
                            str$1069 += ch$1072;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$855;
                    if (ch$1072 === '\r' && source$852[index$854] === '\n') {
                        ++index$854;
                    }
                }
            } else if (isLineTerminator$875(ch$1072.charCodeAt(0))) {
                break;
            } else {
                str$1069 += ch$1072;
            }
        }
        if (quote$1070 !== '') {
            throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$843.StringLiteral,
            value: str$1069,
            octal: octal$1076,
            lineNumber: lineNumber$855,
            lineStart: lineStart$856,
            range: [
                start$1071,
                index$854
            ]
        };
    }
    function scanTemplate$893() {
        var cooked$1077 = '', ch$1078, start$1079, terminated$1080, tail$1081, restore$1082, unescaped$1083, code$1084, octal$1085;
        terminated$1080 = false;
        tail$1081 = false;
        start$1079 = index$854;
        ++index$854;
        while (index$854 < length$861) {
            ch$1078 = source$852[index$854++];
            if (ch$1078 === '`') {
                tail$1081 = true;
                terminated$1080 = true;
                break;
            } else if (ch$1078 === '$') {
                if (source$852[index$854] === '{') {
                    ++index$854;
                    terminated$1080 = true;
                    break;
                }
                cooked$1077 += ch$1078;
            } else if (ch$1078 === '\\') {
                ch$1078 = source$852[index$854++];
                if (!isLineTerminator$875(ch$1078.charCodeAt(0))) {
                    switch (ch$1078) {
                    case 'n':
                        cooked$1077 += '\n';
                        break;
                    case 'r':
                        cooked$1077 += '\r';
                        break;
                    case 't':
                        cooked$1077 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$852[index$854] === '{') {
                            ++index$854;
                            cooked$1077 += scanUnicodeCodePointEscape$884();
                        } else {
                            restore$1082 = index$854;
                            unescaped$1083 = scanHexEscape$883(ch$1078);
                            if (unescaped$1083) {
                                cooked$1077 += unescaped$1083;
                            } else {
                                index$854 = restore$1082;
                                cooked$1077 += ch$1078;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1077 += '\b';
                        break;
                    case 'f':
                        cooked$1077 += '\f';
                        break;
                    case 'v':
                        cooked$1077 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$873(ch$1078)) {
                            code$1084 = '01234567'.indexOf(ch$1078);
                            // \0 is not octal escape sequence
                            if (code$1084 !== 0) {
                                octal$1085 = true;
                            }
                            if (index$854 < length$861 && isOctalDigit$873(source$852[index$854])) {
                                octal$1085 = true;
                                code$1084 = code$1084 * 8 + '01234567'.indexOf(source$852[index$854++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1078) >= 0 && index$854 < length$861 && isOctalDigit$873(source$852[index$854])) {
                                    code$1084 = code$1084 * 8 + '01234567'.indexOf(source$852[index$854++]);
                                }
                            }
                            cooked$1077 += String.fromCharCode(code$1084);
                        } else {
                            cooked$1077 += ch$1078;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$855;
                    if (ch$1078 === '\r' && source$852[index$854] === '\n') {
                        ++index$854;
                    }
                }
            } else if (isLineTerminator$875(ch$1078.charCodeAt(0))) {
                ++lineNumber$855;
                if (ch$1078 === '\r' && source$852[index$854] === '\n') {
                    ++index$854;
                }
                cooked$1077 += '\n';
            } else {
                cooked$1077 += ch$1078;
            }
        }
        if (!terminated$1080) {
            throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$843.Template,
            value: {
                cooked: cooked$1077,
                raw: source$852.slice(start$1079 + 1, index$854 - (tail$1081 ? 1 : 2))
            },
            tail: tail$1081,
            octal: octal$1085,
            lineNumber: lineNumber$855,
            lineStart: lineStart$856,
            range: [
                start$1079,
                index$854
            ]
        };
    }
    function scanTemplateElement$894(option$1086) {
        var startsWith$1087, template$1088;
        lookahead$865 = null;
        skipComment$882();
        startsWith$1087 = option$1086.head ? '`' : '}';
        if (source$852[index$854] !== startsWith$1087) {
            throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
        }
        template$1088 = scanTemplate$893();
        peek$900();
        return template$1088;
    }
    function scanRegExp$895() {
        var str$1089, ch$1090, start$1091, pattern$1092, flags$1093, value$1094, classMarker$1095 = false, restore$1096, terminated$1097 = false;
        lookahead$865 = null;
        skipComment$882();
        start$1091 = index$854;
        ch$1090 = source$852[index$854];
        assert$869(ch$1090 === '/', 'Regular expression literal must start with a slash');
        str$1089 = source$852[index$854++];
        while (index$854 < length$861) {
            ch$1090 = source$852[index$854++];
            str$1089 += ch$1090;
            if (classMarker$1095) {
                if (ch$1090 === ']') {
                    classMarker$1095 = false;
                }
            } else {
                if (ch$1090 === '\\') {
                    ch$1090 = source$852[index$854++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$875(ch$1090.charCodeAt(0))) {
                        throwError$903({}, Messages$848.UnterminatedRegExp);
                    }
                    str$1089 += ch$1090;
                } else if (ch$1090 === '/') {
                    terminated$1097 = true;
                    break;
                } else if (ch$1090 === '[') {
                    classMarker$1095 = true;
                } else if (isLineTerminator$875(ch$1090.charCodeAt(0))) {
                    throwError$903({}, Messages$848.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1097) {
            throwError$903({}, Messages$848.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1092 = str$1089.substr(1, str$1089.length - 2);
        flags$1093 = '';
        while (index$854 < length$861) {
            ch$1090 = source$852[index$854];
            if (!isIdentifierPart$877(ch$1090.charCodeAt(0))) {
                break;
            }
            ++index$854;
            if (ch$1090 === '\\' && index$854 < length$861) {
                ch$1090 = source$852[index$854];
                if (ch$1090 === 'u') {
                    ++index$854;
                    restore$1096 = index$854;
                    ch$1090 = scanHexEscape$883('u');
                    if (ch$1090) {
                        flags$1093 += ch$1090;
                        for (str$1089 += '\\u'; restore$1096 < index$854; ++restore$1096) {
                            str$1089 += source$852[restore$1096];
                        }
                    } else {
                        index$854 = restore$1096;
                        flags$1093 += 'u';
                        str$1089 += '\\u';
                    }
                } else {
                    str$1089 += '\\';
                }
            } else {
                flags$1093 += ch$1090;
                str$1089 += ch$1090;
            }
        }
        try {
            value$1094 = new RegExp(pattern$1092, flags$1093);
        } catch (e$1098) {
            throwError$903({}, Messages$848.InvalidRegExp);
        }
        // peek();
        if (extra$868.tokenize) {
            return {
                type: Token$843.RegularExpression,
                value: value$1094,
                lineNumber: lineNumber$855,
                lineStart: lineStart$856,
                range: [
                    start$1091,
                    index$854
                ]
            };
        }
        return {
            type: Token$843.RegularExpression,
            literal: str$1089,
            value: value$1094,
            range: [
                start$1091,
                index$854
            ]
        };
    }
    function isIdentifierName$896(token$1099) {
        return token$1099.type === Token$843.Identifier || token$1099.type === Token$843.Keyword || token$1099.type === Token$843.BooleanLiteral || token$1099.type === Token$843.NullLiteral;
    }
    function advanceSlash$897() {
        var prevToken$1100, checkToken$1101;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1100 = extra$868.tokens[extra$868.tokens.length - 1];
        if (!prevToken$1100) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$895();
        }
        if (prevToken$1100.type === 'Punctuator') {
            if (prevToken$1100.value === ')') {
                checkToken$1101 = extra$868.tokens[extra$868.openParenToken - 1];
                if (checkToken$1101 && checkToken$1101.type === 'Keyword' && (checkToken$1101.value === 'if' || checkToken$1101.value === 'while' || checkToken$1101.value === 'for' || checkToken$1101.value === 'with')) {
                    return scanRegExp$895();
                }
                return scanPunctuator$888();
            }
            if (prevToken$1100.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$868.tokens[extra$868.openCurlyToken - 3] && extra$868.tokens[extra$868.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1101 = extra$868.tokens[extra$868.openCurlyToken - 4];
                    if (!checkToken$1101) {
                        return scanPunctuator$888();
                    }
                } else if (extra$868.tokens[extra$868.openCurlyToken - 4] && extra$868.tokens[extra$868.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1101 = extra$868.tokens[extra$868.openCurlyToken - 5];
                    if (!checkToken$1101) {
                        return scanRegExp$895();
                    }
                } else {
                    return scanPunctuator$888();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$845.indexOf(checkToken$1101.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$888();
                }
                // It is a declaration.
                return scanRegExp$895();
            }
            return scanRegExp$895();
        }
        if (prevToken$1100.type === 'Keyword') {
            return scanRegExp$895();
        }
        return scanPunctuator$888();
    }
    function advance$898() {
        var ch$1102;
        skipComment$882();
        if (index$854 >= length$861) {
            return {
                type: Token$843.EOF,
                lineNumber: lineNumber$855,
                lineStart: lineStart$856,
                range: [
                    index$854,
                    index$854
                ]
            };
        }
        ch$1102 = source$852.charCodeAt(index$854);
        // Very common: ( and ) and ;
        if (ch$1102 === 40 || ch$1102 === 41 || ch$1102 === 58) {
            return scanPunctuator$888();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1102 === 39 || ch$1102 === 34) {
            return scanStringLiteral$892();
        }
        if (ch$1102 === 96) {
            return scanTemplate$893();
        }
        if (isIdentifierStart$876(ch$1102)) {
            return scanIdentifier$887();
        }
        // # and @ are allowed for sweet.js
        if (ch$1102 === 35 || ch$1102 === 64) {
            ++index$854;
            return {
                type: Token$843.Punctuator,
                value: String.fromCharCode(ch$1102),
                lineNumber: lineNumber$855,
                lineStart: lineStart$856,
                range: [
                    index$854 - 1,
                    index$854
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1102 === 46) {
            if (isDecimalDigit$871(source$852.charCodeAt(index$854 + 1))) {
                return scanNumericLiteral$891();
            }
            return scanPunctuator$888();
        }
        if (isDecimalDigit$871(ch$1102)) {
            return scanNumericLiteral$891();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$868.tokenize && ch$1102 === 47) {
            return advanceSlash$897();
        }
        return scanPunctuator$888();
    }
    function lex$899() {
        var token$1103;
        token$1103 = lookahead$865;
        streamIndex$864 = lookaheadIndex$866;
        lineNumber$855 = token$1103.lineNumber;
        lineStart$856 = token$1103.lineStart;
        sm_lineNumber$857 = lookahead$865.sm_lineNumber;
        sm_lineStart$858 = lookahead$865.sm_lineStart;
        sm_range$859 = lookahead$865.sm_range;
        sm_index$860 = lookahead$865.sm_range[0];
        lookahead$865 = tokenStream$863[++streamIndex$864].token;
        lookaheadIndex$866 = streamIndex$864;
        index$854 = lookahead$865.range[0];
        return token$1103;
    }
    function peek$900() {
        lookaheadIndex$866 = streamIndex$864 + 1;
        if (lookaheadIndex$866 >= length$861) {
            lookahead$865 = {
                type: Token$843.EOF,
                lineNumber: lineNumber$855,
                lineStart: lineStart$856,
                range: [
                    index$854,
                    index$854
                ]
            };
            return;
        }
        lookahead$865 = tokenStream$863[lookaheadIndex$866].token;
        index$854 = lookahead$865.range[0];
    }
    function lookahead2$901() {
        var adv$1104, pos$1105, line$1106, start$1107, result$1108;
        if (streamIndex$864 + 1 >= length$861 || streamIndex$864 + 2 >= length$861) {
            return {
                type: Token$843.EOF,
                lineNumber: lineNumber$855,
                lineStart: lineStart$856,
                range: [
                    index$854,
                    index$854
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$865 === null) {
            lookaheadIndex$866 = streamIndex$864 + 1;
            lookahead$865 = tokenStream$863[lookaheadIndex$866].token;
            index$854 = lookahead$865.range[0];
        }
        result$1108 = tokenStream$863[lookaheadIndex$866 + 1].token;
        return result$1108;
    }
    SyntaxTreeDelegate$850 = {
        name: 'SyntaxTree',
        postProcess: function (node$1109) {
            return node$1109;
        },
        createArrayExpression: function (elements$1110) {
            return {
                type: Syntax$846.ArrayExpression,
                elements: elements$1110
            };
        },
        createAssignmentExpression: function (operator$1111, left$1112, right$1113) {
            return {
                type: Syntax$846.AssignmentExpression,
                operator: operator$1111,
                left: left$1112,
                right: right$1113
            };
        },
        createBinaryExpression: function (operator$1114, left$1115, right$1116) {
            var type$1117 = operator$1114 === '||' || operator$1114 === '&&' ? Syntax$846.LogicalExpression : Syntax$846.BinaryExpression;
            return {
                type: type$1117,
                operator: operator$1114,
                left: left$1115,
                right: right$1116
            };
        },
        createBlockStatement: function (body$1118) {
            return {
                type: Syntax$846.BlockStatement,
                body: body$1118
            };
        },
        createBreakStatement: function (label$1119) {
            return {
                type: Syntax$846.BreakStatement,
                label: label$1119
            };
        },
        createCallExpression: function (callee$1120, args$1121) {
            return {
                type: Syntax$846.CallExpression,
                callee: callee$1120,
                'arguments': args$1121
            };
        },
        createCatchClause: function (param$1122, body$1123) {
            return {
                type: Syntax$846.CatchClause,
                param: param$1122,
                body: body$1123
            };
        },
        createConditionalExpression: function (test$1124, consequent$1125, alternate$1126) {
            return {
                type: Syntax$846.ConditionalExpression,
                test: test$1124,
                consequent: consequent$1125,
                alternate: alternate$1126
            };
        },
        createContinueStatement: function (label$1127) {
            return {
                type: Syntax$846.ContinueStatement,
                label: label$1127
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$846.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1128, test$1129) {
            return {
                type: Syntax$846.DoWhileStatement,
                body: body$1128,
                test: test$1129
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$846.EmptyStatement };
        },
        createExpressionStatement: function (expression$1130) {
            return {
                type: Syntax$846.ExpressionStatement,
                expression: expression$1130
            };
        },
        createForStatement: function (init$1131, test$1132, update$1133, body$1134) {
            return {
                type: Syntax$846.ForStatement,
                init: init$1131,
                test: test$1132,
                update: update$1133,
                body: body$1134
            };
        },
        createForInStatement: function (left$1135, right$1136, body$1137) {
            return {
                type: Syntax$846.ForInStatement,
                left: left$1135,
                right: right$1136,
                body: body$1137,
                each: false
            };
        },
        createForOfStatement: function (left$1138, right$1139, body$1140) {
            return {
                type: Syntax$846.ForOfStatement,
                left: left$1138,
                right: right$1139,
                body: body$1140
            };
        },
        createFunctionDeclaration: function (id$1141, params$1142, defaults$1143, body$1144, rest$1145, generator$1146, expression$1147) {
            return {
                type: Syntax$846.FunctionDeclaration,
                id: id$1141,
                params: params$1142,
                defaults: defaults$1143,
                body: body$1144,
                rest: rest$1145,
                generator: generator$1146,
                expression: expression$1147
            };
        },
        createFunctionExpression: function (id$1148, params$1149, defaults$1150, body$1151, rest$1152, generator$1153, expression$1154) {
            return {
                type: Syntax$846.FunctionExpression,
                id: id$1148,
                params: params$1149,
                defaults: defaults$1150,
                body: body$1151,
                rest: rest$1152,
                generator: generator$1153,
                expression: expression$1154
            };
        },
        createIdentifier: function (name$1155) {
            return {
                type: Syntax$846.Identifier,
                name: name$1155
            };
        },
        createIfStatement: function (test$1156, consequent$1157, alternate$1158) {
            return {
                type: Syntax$846.IfStatement,
                test: test$1156,
                consequent: consequent$1157,
                alternate: alternate$1158
            };
        },
        createLabeledStatement: function (label$1159, body$1160) {
            return {
                type: Syntax$846.LabeledStatement,
                label: label$1159,
                body: body$1160
            };
        },
        createLiteral: function (token$1161) {
            return {
                type: Syntax$846.Literal,
                value: token$1161.value,
                raw: String(token$1161.value)
            };
        },
        createMemberExpression: function (accessor$1162, object$1163, property$1164) {
            return {
                type: Syntax$846.MemberExpression,
                computed: accessor$1162 === '[',
                object: object$1163,
                property: property$1164
            };
        },
        createNewExpression: function (callee$1165, args$1166) {
            return {
                type: Syntax$846.NewExpression,
                callee: callee$1165,
                'arguments': args$1166
            };
        },
        createObjectExpression: function (properties$1167) {
            return {
                type: Syntax$846.ObjectExpression,
                properties: properties$1167
            };
        },
        createPostfixExpression: function (operator$1168, argument$1169) {
            return {
                type: Syntax$846.UpdateExpression,
                operator: operator$1168,
                argument: argument$1169,
                prefix: false
            };
        },
        createProgram: function (body$1170) {
            return {
                type: Syntax$846.Program,
                body: body$1170
            };
        },
        createProperty: function (kind$1171, key$1172, value$1173, method$1174, shorthand$1175) {
            return {
                type: Syntax$846.Property,
                key: key$1172,
                value: value$1173,
                kind: kind$1171,
                method: method$1174,
                shorthand: shorthand$1175
            };
        },
        createReturnStatement: function (argument$1176) {
            return {
                type: Syntax$846.ReturnStatement,
                argument: argument$1176
            };
        },
        createSequenceExpression: function (expressions$1177) {
            return {
                type: Syntax$846.SequenceExpression,
                expressions: expressions$1177
            };
        },
        createSwitchCase: function (test$1178, consequent$1179) {
            return {
                type: Syntax$846.SwitchCase,
                test: test$1178,
                consequent: consequent$1179
            };
        },
        createSwitchStatement: function (discriminant$1180, cases$1181) {
            return {
                type: Syntax$846.SwitchStatement,
                discriminant: discriminant$1180,
                cases: cases$1181
            };
        },
        createThisExpression: function () {
            return { type: Syntax$846.ThisExpression };
        },
        createThrowStatement: function (argument$1182) {
            return {
                type: Syntax$846.ThrowStatement,
                argument: argument$1182
            };
        },
        createTryStatement: function (block$1183, guardedHandlers$1184, handlers$1185, finalizer$1186) {
            return {
                type: Syntax$846.TryStatement,
                block: block$1183,
                guardedHandlers: guardedHandlers$1184,
                handlers: handlers$1185,
                finalizer: finalizer$1186
            };
        },
        createUnaryExpression: function (operator$1187, argument$1188) {
            if (operator$1187 === '++' || operator$1187 === '--') {
                return {
                    type: Syntax$846.UpdateExpression,
                    operator: operator$1187,
                    argument: argument$1188,
                    prefix: true
                };
            }
            return {
                type: Syntax$846.UnaryExpression,
                operator: operator$1187,
                argument: argument$1188
            };
        },
        createVariableDeclaration: function (declarations$1189, kind$1190) {
            return {
                type: Syntax$846.VariableDeclaration,
                declarations: declarations$1189,
                kind: kind$1190
            };
        },
        createVariableDeclarator: function (id$1191, init$1192) {
            return {
                type: Syntax$846.VariableDeclarator,
                id: id$1191,
                init: init$1192
            };
        },
        createWhileStatement: function (test$1193, body$1194) {
            return {
                type: Syntax$846.WhileStatement,
                test: test$1193,
                body: body$1194
            };
        },
        createWithStatement: function (object$1195, body$1196) {
            return {
                type: Syntax$846.WithStatement,
                object: object$1195,
                body: body$1196
            };
        },
        createTemplateElement: function (value$1197, tail$1198) {
            return {
                type: Syntax$846.TemplateElement,
                value: value$1197,
                tail: tail$1198
            };
        },
        createTemplateLiteral: function (quasis$1199, expressions$1200) {
            return {
                type: Syntax$846.TemplateLiteral,
                quasis: quasis$1199,
                expressions: expressions$1200
            };
        },
        createSpreadElement: function (argument$1201) {
            return {
                type: Syntax$846.SpreadElement,
                argument: argument$1201
            };
        },
        createTaggedTemplateExpression: function (tag$1202, quasi$1203) {
            return {
                type: Syntax$846.TaggedTemplateExpression,
                tag: tag$1202,
                quasi: quasi$1203
            };
        },
        createArrowFunctionExpression: function (params$1204, defaults$1205, body$1206, rest$1207, expression$1208) {
            return {
                type: Syntax$846.ArrowFunctionExpression,
                id: null,
                params: params$1204,
                defaults: defaults$1205,
                body: body$1206,
                rest: rest$1207,
                generator: false,
                expression: expression$1208
            };
        },
        createMethodDefinition: function (propertyType$1209, kind$1210, key$1211, value$1212) {
            return {
                type: Syntax$846.MethodDefinition,
                key: key$1211,
                value: value$1212,
                kind: kind$1210,
                'static': propertyType$1209 === ClassPropertyType$851.static
            };
        },
        createClassBody: function (body$1213) {
            return {
                type: Syntax$846.ClassBody,
                body: body$1213
            };
        },
        createClassExpression: function (id$1214, superClass$1215, body$1216) {
            return {
                type: Syntax$846.ClassExpression,
                id: id$1214,
                superClass: superClass$1215,
                body: body$1216
            };
        },
        createClassDeclaration: function (id$1217, superClass$1218, body$1219) {
            return {
                type: Syntax$846.ClassDeclaration,
                id: id$1217,
                superClass: superClass$1218,
                body: body$1219
            };
        },
        createExportSpecifier: function (id$1220, name$1221) {
            return {
                type: Syntax$846.ExportSpecifier,
                id: id$1220,
                name: name$1221
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$846.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1222, specifiers$1223, source$1224) {
            return {
                type: Syntax$846.ExportDeclaration,
                declaration: declaration$1222,
                specifiers: specifiers$1223,
                source: source$1224
            };
        },
        createImportSpecifier: function (id$1225, name$1226) {
            return {
                type: Syntax$846.ImportSpecifier,
                id: id$1225,
                name: name$1226
            };
        },
        createImportDeclaration: function (specifiers$1227, kind$1228, source$1229) {
            return {
                type: Syntax$846.ImportDeclaration,
                specifiers: specifiers$1227,
                kind: kind$1228,
                source: source$1229
            };
        },
        createYieldExpression: function (argument$1230, delegate$1231) {
            return {
                type: Syntax$846.YieldExpression,
                argument: argument$1230,
                delegate: delegate$1231
            };
        },
        createModuleDeclaration: function (id$1232, source$1233, body$1234) {
            return {
                type: Syntax$846.ModuleDeclaration,
                id: id$1232,
                source: source$1233,
                body: body$1234
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$902() {
        return lookahead$865.lineNumber !== lineNumber$855;
    }
    // Throw an exception
    function throwError$903(token$1235, messageFormat$1236) {
        var error$1237, args$1238 = Array.prototype.slice.call(arguments, 2), msg$1239 = messageFormat$1236.replace(/%(\d)/g, function (whole$1243, index$1244) {
                assert$869(index$1244 < args$1238.length, 'Message reference must be in range');
                return args$1238[index$1244];
            });
        var startIndex$1240 = streamIndex$864 > 3 ? streamIndex$864 - 3 : 0;
        var toks$1241 = tokenStream$863.slice(startIndex$1240, streamIndex$864 + 3).map(function (stx$1245) {
                return stx$1245.token.value;
            }).join(' ');
        var tailingMsg$1242 = '\n[... ' + toks$1241 + ' ...]';
        if (typeof token$1235.lineNumber === 'number') {
            error$1237 = new Error('Line ' + token$1235.lineNumber + ': ' + msg$1239 + tailingMsg$1242);
            error$1237.index = token$1235.range[0];
            error$1237.lineNumber = token$1235.lineNumber;
            error$1237.column = token$1235.range[0] - lineStart$856 + 1;
        } else {
            error$1237 = new Error('Line ' + lineNumber$855 + ': ' + msg$1239 + tailingMsg$1242);
            error$1237.index = index$854;
            error$1237.lineNumber = lineNumber$855;
            error$1237.column = index$854 - lineStart$856 + 1;
        }
        error$1237.description = msg$1239;
        throw error$1237;
    }
    function throwErrorTolerant$904() {
        try {
            throwError$903.apply(null, arguments);
        } catch (e$1246) {
            if (extra$868.errors) {
                extra$868.errors.push(e$1246);
            } else {
                throw e$1246;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$905(token$1247) {
        if (token$1247.type === Token$843.EOF) {
            throwError$903(token$1247, Messages$848.UnexpectedEOS);
        }
        if (token$1247.type === Token$843.NumericLiteral) {
            throwError$903(token$1247, Messages$848.UnexpectedNumber);
        }
        if (token$1247.type === Token$843.StringLiteral) {
            throwError$903(token$1247, Messages$848.UnexpectedString);
        }
        if (token$1247.type === Token$843.Identifier) {
            throwError$903(token$1247, Messages$848.UnexpectedIdentifier);
        }
        if (token$1247.type === Token$843.Keyword) {
            if (isFutureReservedWord$878(token$1247.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$853 && isStrictModeReservedWord$879(token$1247.value)) {
                throwErrorTolerant$904(token$1247, Messages$848.StrictReservedWord);
                return;
            }
            throwError$903(token$1247, Messages$848.UnexpectedToken, token$1247.value);
        }
        if (token$1247.type === Token$843.Template) {
            throwError$903(token$1247, Messages$848.UnexpectedTemplate, token$1247.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$903(token$1247, Messages$848.UnexpectedToken, token$1247.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$906(value$1248) {
        var token$1249 = lex$899();
        if (token$1249.type !== Token$843.Punctuator || token$1249.value !== value$1248) {
            throwUnexpected$905(token$1249);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$907(keyword$1250) {
        var token$1251 = lex$899();
        if (token$1251.type !== Token$843.Keyword || token$1251.value !== keyword$1250) {
            throwUnexpected$905(token$1251);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$908(value$1252) {
        return lookahead$865.type === Token$843.Punctuator && lookahead$865.value === value$1252;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$909(keyword$1253) {
        return lookahead$865.type === Token$843.Keyword && lookahead$865.value === keyword$1253;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$910(keyword$1254) {
        return lookahead$865.type === Token$843.Identifier && lookahead$865.value === keyword$1254;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$911() {
        var op$1255;
        if (lookahead$865.type !== Token$843.Punctuator) {
            return false;
        }
        op$1255 = lookahead$865.value;
        return op$1255 === '=' || op$1255 === '*=' || op$1255 === '/=' || op$1255 === '%=' || op$1255 === '+=' || op$1255 === '-=' || op$1255 === '<<=' || op$1255 === '>>=' || op$1255 === '>>>=' || op$1255 === '&=' || op$1255 === '^=' || op$1255 === '|=';
    }
    function consumeSemicolon$912() {
        var line$1256, ch$1257;
        ch$1257 = lookahead$865.value ? String(lookahead$865.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1257 === 59) {
            lex$899();
            return;
        }
        if (lookahead$865.lineNumber !== lineNumber$855) {
            return;
        }
        if (match$908(';')) {
            lex$899();
            return;
        }
        if (lookahead$865.type !== Token$843.EOF && !match$908('}')) {
            throwUnexpected$905(lookahead$865);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$913(expr$1258) {
        return expr$1258.type === Syntax$846.Identifier || expr$1258.type === Syntax$846.MemberExpression;
    }
    function isAssignableLeftHandSide$914(expr$1259) {
        return isLeftHandSide$913(expr$1259) || expr$1259.type === Syntax$846.ObjectPattern || expr$1259.type === Syntax$846.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$915() {
        var elements$1260 = [], blocks$1261 = [], filter$1262 = null, tmp$1263, possiblecomprehension$1264 = true, body$1265;
        expect$906('[');
        while (!match$908(']')) {
            if (lookahead$865.value === 'for' && lookahead$865.type === Token$843.Keyword) {
                if (!possiblecomprehension$1264) {
                    throwError$903({}, Messages$848.ComprehensionError);
                }
                matchKeyword$909('for');
                tmp$1263 = parseForStatement$963({ ignoreBody: true });
                tmp$1263.of = tmp$1263.type === Syntax$846.ForOfStatement;
                tmp$1263.type = Syntax$846.ComprehensionBlock;
                if (tmp$1263.left.kind) {
                    // can't be let or const
                    throwError$903({}, Messages$848.ComprehensionError);
                }
                blocks$1261.push(tmp$1263);
            } else if (lookahead$865.value === 'if' && lookahead$865.type === Token$843.Keyword) {
                if (!possiblecomprehension$1264) {
                    throwError$903({}, Messages$848.ComprehensionError);
                }
                expectKeyword$907('if');
                expect$906('(');
                filter$1262 = parseExpression$943();
                expect$906(')');
            } else if (lookahead$865.value === ',' && lookahead$865.type === Token$843.Punctuator) {
                possiblecomprehension$1264 = false;
                // no longer allowed.
                lex$899();
                elements$1260.push(null);
            } else {
                tmp$1263 = parseSpreadOrAssignmentExpression$926();
                elements$1260.push(tmp$1263);
                if (tmp$1263 && tmp$1263.type === Syntax$846.SpreadElement) {
                    if (!match$908(']')) {
                        throwError$903({}, Messages$848.ElementAfterSpreadElement);
                    }
                } else if (!(match$908(']') || matchKeyword$909('for') || matchKeyword$909('if'))) {
                    expect$906(',');
                    // this lexes.
                    possiblecomprehension$1264 = false;
                }
            }
        }
        expect$906(']');
        if (filter$1262 && !blocks$1261.length) {
            throwError$903({}, Messages$848.ComprehensionRequiresBlock);
        }
        if (blocks$1261.length) {
            if (elements$1260.length !== 1) {
                throwError$903({}, Messages$848.ComprehensionError);
            }
            return {
                type: Syntax$846.ComprehensionExpression,
                filter: filter$1262,
                blocks: blocks$1261,
                body: elements$1260[0]
            };
        }
        return delegate$862.createArrayExpression(elements$1260);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$916(options$1266) {
        var previousStrict$1267, previousYieldAllowed$1268, params$1269, defaults$1270, body$1271;
        previousStrict$1267 = strict$853;
        previousYieldAllowed$1268 = state$867.yieldAllowed;
        state$867.yieldAllowed = options$1266.generator;
        params$1269 = options$1266.params || [];
        defaults$1270 = options$1266.defaults || [];
        body$1271 = parseConciseBody$975();
        if (options$1266.name && strict$853 && isRestrictedWord$880(params$1269[0].name)) {
            throwErrorTolerant$904(options$1266.name, Messages$848.StrictParamName);
        }
        if (state$867.yieldAllowed && !state$867.yieldFound) {
            throwErrorTolerant$904({}, Messages$848.NoYieldInGenerator);
        }
        strict$853 = previousStrict$1267;
        state$867.yieldAllowed = previousYieldAllowed$1268;
        return delegate$862.createFunctionExpression(null, params$1269, defaults$1270, body$1271, options$1266.rest || null, options$1266.generator, body$1271.type !== Syntax$846.BlockStatement);
    }
    function parsePropertyMethodFunction$917(options$1272) {
        var previousStrict$1273, tmp$1274, method$1275;
        previousStrict$1273 = strict$853;
        strict$853 = true;
        tmp$1274 = parseParams$979();
        if (tmp$1274.stricted) {
            throwErrorTolerant$904(tmp$1274.stricted, tmp$1274.message);
        }
        method$1275 = parsePropertyFunction$916({
            params: tmp$1274.params,
            defaults: tmp$1274.defaults,
            rest: tmp$1274.rest,
            generator: options$1272.generator
        });
        strict$853 = previousStrict$1273;
        return method$1275;
    }
    function parseObjectPropertyKey$918() {
        var token$1276 = lex$899();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1276.type === Token$843.StringLiteral || token$1276.type === Token$843.NumericLiteral) {
            if (strict$853 && token$1276.octal) {
                throwErrorTolerant$904(token$1276, Messages$848.StrictOctalLiteral);
            }
            return delegate$862.createLiteral(token$1276);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$862.createIdentifier(token$1276.value);
    }
    function parseObjectProperty$919() {
        var token$1277, key$1278, id$1279, value$1280, param$1281;
        token$1277 = lookahead$865;
        if (token$1277.type === Token$843.Identifier) {
            id$1279 = parseObjectPropertyKey$918();
            // Property Assignment: Getter and Setter.
            if (token$1277.value === 'get' && !(match$908(':') || match$908('('))) {
                key$1278 = parseObjectPropertyKey$918();
                expect$906('(');
                expect$906(')');
                return delegate$862.createProperty('get', key$1278, parsePropertyFunction$916({ generator: false }), false, false);
            }
            if (token$1277.value === 'set' && !(match$908(':') || match$908('('))) {
                key$1278 = parseObjectPropertyKey$918();
                expect$906('(');
                token$1277 = lookahead$865;
                param$1281 = [parseVariableIdentifier$946()];
                expect$906(')');
                return delegate$862.createProperty('set', key$1278, parsePropertyFunction$916({
                    params: param$1281,
                    generator: false,
                    name: token$1277
                }), false, false);
            }
            if (match$908(':')) {
                lex$899();
                return delegate$862.createProperty('init', id$1279, parseAssignmentExpression$942(), false, false);
            }
            if (match$908('(')) {
                return delegate$862.createProperty('init', id$1279, parsePropertyMethodFunction$917({ generator: false }), true, false);
            }
            return delegate$862.createProperty('init', id$1279, id$1279, false, true);
        }
        if (token$1277.type === Token$843.EOF || token$1277.type === Token$843.Punctuator) {
            if (!match$908('*')) {
                throwUnexpected$905(token$1277);
            }
            lex$899();
            id$1279 = parseObjectPropertyKey$918();
            if (!match$908('(')) {
                throwUnexpected$905(lex$899());
            }
            return delegate$862.createProperty('init', id$1279, parsePropertyMethodFunction$917({ generator: true }), true, false);
        }
        key$1278 = parseObjectPropertyKey$918();
        if (match$908(':')) {
            lex$899();
            return delegate$862.createProperty('init', key$1278, parseAssignmentExpression$942(), false, false);
        }
        if (match$908('(')) {
            return delegate$862.createProperty('init', key$1278, parsePropertyMethodFunction$917({ generator: false }), true, false);
        }
        throwUnexpected$905(lex$899());
    }
    function parseObjectInitialiser$920() {
        var properties$1282 = [], property$1283, name$1284, key$1285, kind$1286, map$1287 = {}, toString$1288 = String;
        expect$906('{');
        while (!match$908('}')) {
            property$1283 = parseObjectProperty$919();
            if (property$1283.key.type === Syntax$846.Identifier) {
                name$1284 = property$1283.key.name;
            } else {
                name$1284 = toString$1288(property$1283.key.value);
            }
            kind$1286 = property$1283.kind === 'init' ? PropertyKind$847.Data : property$1283.kind === 'get' ? PropertyKind$847.Get : PropertyKind$847.Set;
            key$1285 = '$' + name$1284;
            if (Object.prototype.hasOwnProperty.call(map$1287, key$1285)) {
                if (map$1287[key$1285] === PropertyKind$847.Data) {
                    if (strict$853 && kind$1286 === PropertyKind$847.Data) {
                        throwErrorTolerant$904({}, Messages$848.StrictDuplicateProperty);
                    } else if (kind$1286 !== PropertyKind$847.Data) {
                        throwErrorTolerant$904({}, Messages$848.AccessorDataProperty);
                    }
                } else {
                    if (kind$1286 === PropertyKind$847.Data) {
                        throwErrorTolerant$904({}, Messages$848.AccessorDataProperty);
                    } else if (map$1287[key$1285] & kind$1286) {
                        throwErrorTolerant$904({}, Messages$848.AccessorGetSet);
                    }
                }
                map$1287[key$1285] |= kind$1286;
            } else {
                map$1287[key$1285] = kind$1286;
            }
            properties$1282.push(property$1283);
            if (!match$908('}')) {
                expect$906(',');
            }
        }
        expect$906('}');
        return delegate$862.createObjectExpression(properties$1282);
    }
    function parseTemplateElement$921(option$1289) {
        var token$1290 = scanTemplateElement$894(option$1289);
        if (strict$853 && token$1290.octal) {
            throwError$903(token$1290, Messages$848.StrictOctalLiteral);
        }
        return delegate$862.createTemplateElement({
            raw: token$1290.value.raw,
            cooked: token$1290.value.cooked
        }, token$1290.tail);
    }
    function parseTemplateLiteral$922() {
        var quasi$1291, quasis$1292, expressions$1293;
        quasi$1291 = parseTemplateElement$921({ head: true });
        quasis$1292 = [quasi$1291];
        expressions$1293 = [];
        while (!quasi$1291.tail) {
            expressions$1293.push(parseExpression$943());
            quasi$1291 = parseTemplateElement$921({ head: false });
            quasis$1292.push(quasi$1291);
        }
        return delegate$862.createTemplateLiteral(quasis$1292, expressions$1293);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$923() {
        var expr$1294;
        expect$906('(');
        ++state$867.parenthesizedCount;
        expr$1294 = parseExpression$943();
        expect$906(')');
        return expr$1294;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$924() {
        var type$1295, token$1296, resolvedIdent$1297;
        token$1296 = lookahead$865;
        type$1295 = lookahead$865.type;
        if (type$1295 === Token$843.Identifier) {
            resolvedIdent$1297 = expander$842.resolve(tokenStream$863[lookaheadIndex$866]);
            lex$899();
            return delegate$862.createIdentifier(resolvedIdent$1297);
        }
        if (type$1295 === Token$843.StringLiteral || type$1295 === Token$843.NumericLiteral) {
            if (strict$853 && lookahead$865.octal) {
                throwErrorTolerant$904(lookahead$865, Messages$848.StrictOctalLiteral);
            }
            return delegate$862.createLiteral(lex$899());
        }
        if (type$1295 === Token$843.Keyword) {
            if (matchKeyword$909('this')) {
                lex$899();
                return delegate$862.createThisExpression();
            }
            if (matchKeyword$909('function')) {
                return parseFunctionExpression$981();
            }
            if (matchKeyword$909('class')) {
                return parseClassExpression$986();
            }
            if (matchKeyword$909('super')) {
                lex$899();
                return delegate$862.createIdentifier('super');
            }
        }
        if (type$1295 === Token$843.BooleanLiteral) {
            token$1296 = lex$899();
            token$1296.value = token$1296.value === 'true';
            return delegate$862.createLiteral(token$1296);
        }
        if (type$1295 === Token$843.NullLiteral) {
            token$1296 = lex$899();
            token$1296.value = null;
            return delegate$862.createLiteral(token$1296);
        }
        if (match$908('[')) {
            return parseArrayInitialiser$915();
        }
        if (match$908('{')) {
            return parseObjectInitialiser$920();
        }
        if (match$908('(')) {
            return parseGroupExpression$923();
        }
        if (lookahead$865.type === Token$843.RegularExpression) {
            return delegate$862.createLiteral(lex$899());
        }
        if (type$1295 === Token$843.Template) {
            return parseTemplateLiteral$922();
        }
        return throwUnexpected$905(lex$899());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$925() {
        var args$1298 = [], arg$1299;
        expect$906('(');
        if (!match$908(')')) {
            while (streamIndex$864 < length$861) {
                arg$1299 = parseSpreadOrAssignmentExpression$926();
                args$1298.push(arg$1299);
                if (match$908(')')) {
                    break;
                } else if (arg$1299.type === Syntax$846.SpreadElement) {
                    throwError$903({}, Messages$848.ElementAfterSpreadElement);
                }
                expect$906(',');
            }
        }
        expect$906(')');
        return args$1298;
    }
    function parseSpreadOrAssignmentExpression$926() {
        if (match$908('...')) {
            lex$899();
            return delegate$862.createSpreadElement(parseAssignmentExpression$942());
        }
        return parseAssignmentExpression$942();
    }
    function parseNonComputedProperty$927() {
        var token$1300 = lex$899();
        if (!isIdentifierName$896(token$1300)) {
            throwUnexpected$905(token$1300);
        }
        return delegate$862.createIdentifier(token$1300.value);
    }
    function parseNonComputedMember$928() {
        expect$906('.');
        return parseNonComputedProperty$927();
    }
    function parseComputedMember$929() {
        var expr$1301;
        expect$906('[');
        expr$1301 = parseExpression$943();
        expect$906(']');
        return expr$1301;
    }
    function parseNewExpression$930() {
        var callee$1302, args$1303;
        expectKeyword$907('new');
        callee$1302 = parseLeftHandSideExpression$932();
        args$1303 = match$908('(') ? parseArguments$925() : [];
        return delegate$862.createNewExpression(callee$1302, args$1303);
    }
    function parseLeftHandSideExpressionAllowCall$931() {
        var expr$1304, args$1305, property$1306;
        expr$1304 = matchKeyword$909('new') ? parseNewExpression$930() : parsePrimaryExpression$924();
        while (match$908('.') || match$908('[') || match$908('(') || lookahead$865.type === Token$843.Template) {
            if (match$908('(')) {
                args$1305 = parseArguments$925();
                expr$1304 = delegate$862.createCallExpression(expr$1304, args$1305);
            } else if (match$908('[')) {
                expr$1304 = delegate$862.createMemberExpression('[', expr$1304, parseComputedMember$929());
            } else if (match$908('.')) {
                expr$1304 = delegate$862.createMemberExpression('.', expr$1304, parseNonComputedMember$928());
            } else {
                expr$1304 = delegate$862.createTaggedTemplateExpression(expr$1304, parseTemplateLiteral$922());
            }
        }
        return expr$1304;
    }
    function parseLeftHandSideExpression$932() {
        var expr$1307, property$1308;
        expr$1307 = matchKeyword$909('new') ? parseNewExpression$930() : parsePrimaryExpression$924();
        while (match$908('.') || match$908('[') || lookahead$865.type === Token$843.Template) {
            if (match$908('[')) {
                expr$1307 = delegate$862.createMemberExpression('[', expr$1307, parseComputedMember$929());
            } else if (match$908('.')) {
                expr$1307 = delegate$862.createMemberExpression('.', expr$1307, parseNonComputedMember$928());
            } else {
                expr$1307 = delegate$862.createTaggedTemplateExpression(expr$1307, parseTemplateLiteral$922());
            }
        }
        return expr$1307;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$933() {
        var expr$1309 = parseLeftHandSideExpressionAllowCall$931(), token$1310 = lookahead$865;
        if (lookahead$865.type !== Token$843.Punctuator) {
            return expr$1309;
        }
        if ((match$908('++') || match$908('--')) && !peekLineTerminator$902()) {
            // 11.3.1, 11.3.2
            if (strict$853 && expr$1309.type === Syntax$846.Identifier && isRestrictedWord$880(expr$1309.name)) {
                throwErrorTolerant$904({}, Messages$848.StrictLHSPostfix);
            }
            if (!isLeftHandSide$913(expr$1309)) {
                throwError$903({}, Messages$848.InvalidLHSInAssignment);
            }
            token$1310 = lex$899();
            expr$1309 = delegate$862.createPostfixExpression(token$1310.value, expr$1309);
        }
        return expr$1309;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$934() {
        var token$1311, expr$1312;
        if (lookahead$865.type !== Token$843.Punctuator && lookahead$865.type !== Token$843.Keyword) {
            return parsePostfixExpression$933();
        }
        if (match$908('++') || match$908('--')) {
            token$1311 = lex$899();
            expr$1312 = parseUnaryExpression$934();
            // 11.4.4, 11.4.5
            if (strict$853 && expr$1312.type === Syntax$846.Identifier && isRestrictedWord$880(expr$1312.name)) {
                throwErrorTolerant$904({}, Messages$848.StrictLHSPrefix);
            }
            if (!isLeftHandSide$913(expr$1312)) {
                throwError$903({}, Messages$848.InvalidLHSInAssignment);
            }
            return delegate$862.createUnaryExpression(token$1311.value, expr$1312);
        }
        if (match$908('+') || match$908('-') || match$908('~') || match$908('!')) {
            token$1311 = lex$899();
            expr$1312 = parseUnaryExpression$934();
            return delegate$862.createUnaryExpression(token$1311.value, expr$1312);
        }
        if (matchKeyword$909('delete') || matchKeyword$909('void') || matchKeyword$909('typeof')) {
            token$1311 = lex$899();
            expr$1312 = parseUnaryExpression$934();
            expr$1312 = delegate$862.createUnaryExpression(token$1311.value, expr$1312);
            if (strict$853 && expr$1312.operator === 'delete' && expr$1312.argument.type === Syntax$846.Identifier) {
                throwErrorTolerant$904({}, Messages$848.StrictDelete);
            }
            return expr$1312;
        }
        return parsePostfixExpression$933();
    }
    function binaryPrecedence$935(token$1313, allowIn$1314) {
        var prec$1315 = 0;
        if (token$1313.type !== Token$843.Punctuator && token$1313.type !== Token$843.Keyword) {
            return 0;
        }
        switch (token$1313.value) {
        case '||':
            prec$1315 = 1;
            break;
        case '&&':
            prec$1315 = 2;
            break;
        case '|':
            prec$1315 = 3;
            break;
        case '^':
            prec$1315 = 4;
            break;
        case '&':
            prec$1315 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1315 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1315 = 7;
            break;
        case 'in':
            prec$1315 = allowIn$1314 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1315 = 8;
            break;
        case '+':
        case '-':
            prec$1315 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1315 = 11;
            break;
        default:
            break;
        }
        return prec$1315;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$936() {
        var expr$1316, token$1317, prec$1318, previousAllowIn$1319, stack$1320, right$1321, operator$1322, left$1323, i$1324;
        previousAllowIn$1319 = state$867.allowIn;
        state$867.allowIn = true;
        expr$1316 = parseUnaryExpression$934();
        token$1317 = lookahead$865;
        prec$1318 = binaryPrecedence$935(token$1317, previousAllowIn$1319);
        if (prec$1318 === 0) {
            return expr$1316;
        }
        token$1317.prec = prec$1318;
        lex$899();
        stack$1320 = [
            expr$1316,
            token$1317,
            parseUnaryExpression$934()
        ];
        while ((prec$1318 = binaryPrecedence$935(lookahead$865, previousAllowIn$1319)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1320.length > 2 && prec$1318 <= stack$1320[stack$1320.length - 2].prec) {
                right$1321 = stack$1320.pop();
                operator$1322 = stack$1320.pop().value;
                left$1323 = stack$1320.pop();
                stack$1320.push(delegate$862.createBinaryExpression(operator$1322, left$1323, right$1321));
            }
            // Shift.
            token$1317 = lex$899();
            token$1317.prec = prec$1318;
            stack$1320.push(token$1317);
            stack$1320.push(parseUnaryExpression$934());
        }
        state$867.allowIn = previousAllowIn$1319;
        // Final reduce to clean-up the stack.
        i$1324 = stack$1320.length - 1;
        expr$1316 = stack$1320[i$1324];
        while (i$1324 > 1) {
            expr$1316 = delegate$862.createBinaryExpression(stack$1320[i$1324 - 1].value, stack$1320[i$1324 - 2], expr$1316);
            i$1324 -= 2;
        }
        return expr$1316;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$937() {
        var expr$1325, previousAllowIn$1326, consequent$1327, alternate$1328;
        expr$1325 = parseBinaryExpression$936();
        if (match$908('?')) {
            lex$899();
            previousAllowIn$1326 = state$867.allowIn;
            state$867.allowIn = true;
            consequent$1327 = parseAssignmentExpression$942();
            state$867.allowIn = previousAllowIn$1326;
            expect$906(':');
            alternate$1328 = parseAssignmentExpression$942();
            expr$1325 = delegate$862.createConditionalExpression(expr$1325, consequent$1327, alternate$1328);
        }
        return expr$1325;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$938(expr$1329) {
        var i$1330, len$1331, property$1332, element$1333;
        if (expr$1329.type === Syntax$846.ObjectExpression) {
            expr$1329.type = Syntax$846.ObjectPattern;
            for (i$1330 = 0, len$1331 = expr$1329.properties.length; i$1330 < len$1331; i$1330 += 1) {
                property$1332 = expr$1329.properties[i$1330];
                if (property$1332.kind !== 'init') {
                    throwError$903({}, Messages$848.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$938(property$1332.value);
            }
        } else if (expr$1329.type === Syntax$846.ArrayExpression) {
            expr$1329.type = Syntax$846.ArrayPattern;
            for (i$1330 = 0, len$1331 = expr$1329.elements.length; i$1330 < len$1331; i$1330 += 1) {
                element$1333 = expr$1329.elements[i$1330];
                if (element$1333) {
                    reinterpretAsAssignmentBindingPattern$938(element$1333);
                }
            }
        } else if (expr$1329.type === Syntax$846.Identifier) {
            if (isRestrictedWord$880(expr$1329.name)) {
                throwError$903({}, Messages$848.InvalidLHSInAssignment);
            }
        } else if (expr$1329.type === Syntax$846.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$938(expr$1329.argument);
            if (expr$1329.argument.type === Syntax$846.ObjectPattern) {
                throwError$903({}, Messages$848.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1329.type !== Syntax$846.MemberExpression && expr$1329.type !== Syntax$846.CallExpression && expr$1329.type !== Syntax$846.NewExpression) {
                throwError$903({}, Messages$848.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$939(options$1334, expr$1335) {
        var i$1336, len$1337, property$1338, element$1339;
        if (expr$1335.type === Syntax$846.ObjectExpression) {
            expr$1335.type = Syntax$846.ObjectPattern;
            for (i$1336 = 0, len$1337 = expr$1335.properties.length; i$1336 < len$1337; i$1336 += 1) {
                property$1338 = expr$1335.properties[i$1336];
                if (property$1338.kind !== 'init') {
                    throwError$903({}, Messages$848.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$939(options$1334, property$1338.value);
            }
        } else if (expr$1335.type === Syntax$846.ArrayExpression) {
            expr$1335.type = Syntax$846.ArrayPattern;
            for (i$1336 = 0, len$1337 = expr$1335.elements.length; i$1336 < len$1337; i$1336 += 1) {
                element$1339 = expr$1335.elements[i$1336];
                if (element$1339) {
                    reinterpretAsDestructuredParameter$939(options$1334, element$1339);
                }
            }
        } else if (expr$1335.type === Syntax$846.Identifier) {
            validateParam$977(options$1334, expr$1335, expr$1335.name);
        } else {
            if (expr$1335.type !== Syntax$846.MemberExpression) {
                throwError$903({}, Messages$848.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$940(expressions$1340) {
        var i$1341, len$1342, param$1343, params$1344, defaults$1345, defaultCount$1346, options$1347, rest$1348;
        params$1344 = [];
        defaults$1345 = [];
        defaultCount$1346 = 0;
        rest$1348 = null;
        options$1347 = { paramSet: {} };
        for (i$1341 = 0, len$1342 = expressions$1340.length; i$1341 < len$1342; i$1341 += 1) {
            param$1343 = expressions$1340[i$1341];
            if (param$1343.type === Syntax$846.Identifier) {
                params$1344.push(param$1343);
                defaults$1345.push(null);
                validateParam$977(options$1347, param$1343, param$1343.name);
            } else if (param$1343.type === Syntax$846.ObjectExpression || param$1343.type === Syntax$846.ArrayExpression) {
                reinterpretAsDestructuredParameter$939(options$1347, param$1343);
                params$1344.push(param$1343);
                defaults$1345.push(null);
            } else if (param$1343.type === Syntax$846.SpreadElement) {
                assert$869(i$1341 === len$1342 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$939(options$1347, param$1343.argument);
                rest$1348 = param$1343.argument;
            } else if (param$1343.type === Syntax$846.AssignmentExpression) {
                params$1344.push(param$1343.left);
                defaults$1345.push(param$1343.right);
                ++defaultCount$1346;
                validateParam$977(options$1347, param$1343.left, param$1343.left.name);
            } else {
                return null;
            }
        }
        if (options$1347.message === Messages$848.StrictParamDupe) {
            throwError$903(strict$853 ? options$1347.stricted : options$1347.firstRestricted, options$1347.message);
        }
        if (defaultCount$1346 === 0) {
            defaults$1345 = [];
        }
        return {
            params: params$1344,
            defaults: defaults$1345,
            rest: rest$1348,
            stricted: options$1347.stricted,
            firstRestricted: options$1347.firstRestricted,
            message: options$1347.message
        };
    }
    function parseArrowFunctionExpression$941(options$1349) {
        var previousStrict$1350, previousYieldAllowed$1351, body$1352;
        expect$906('=>');
        previousStrict$1350 = strict$853;
        previousYieldAllowed$1351 = state$867.yieldAllowed;
        state$867.yieldAllowed = false;
        body$1352 = parseConciseBody$975();
        if (strict$853 && options$1349.firstRestricted) {
            throwError$903(options$1349.firstRestricted, options$1349.message);
        }
        if (strict$853 && options$1349.stricted) {
            throwErrorTolerant$904(options$1349.stricted, options$1349.message);
        }
        strict$853 = previousStrict$1350;
        state$867.yieldAllowed = previousYieldAllowed$1351;
        return delegate$862.createArrowFunctionExpression(options$1349.params, options$1349.defaults, body$1352, options$1349.rest, body$1352.type !== Syntax$846.BlockStatement);
    }
    function parseAssignmentExpression$942() {
        var expr$1353, token$1354, params$1355, oldParenthesizedCount$1356;
        if (matchKeyword$909('yield')) {
            return parseYieldExpression$982();
        }
        oldParenthesizedCount$1356 = state$867.parenthesizedCount;
        if (match$908('(')) {
            token$1354 = lookahead2$901();
            if (token$1354.type === Token$843.Punctuator && token$1354.value === ')' || token$1354.value === '...') {
                params$1355 = parseParams$979();
                if (!match$908('=>')) {
                    throwUnexpected$905(lex$899());
                }
                return parseArrowFunctionExpression$941(params$1355);
            }
        }
        token$1354 = lookahead$865;
        expr$1353 = parseConditionalExpression$937();
        if (match$908('=>') && (state$867.parenthesizedCount === oldParenthesizedCount$1356 || state$867.parenthesizedCount === oldParenthesizedCount$1356 + 1)) {
            if (expr$1353.type === Syntax$846.Identifier) {
                params$1355 = reinterpretAsCoverFormalsList$940([expr$1353]);
            } else if (expr$1353.type === Syntax$846.SequenceExpression) {
                params$1355 = reinterpretAsCoverFormalsList$940(expr$1353.expressions);
            }
            if (params$1355) {
                return parseArrowFunctionExpression$941(params$1355);
            }
        }
        if (matchAssign$911()) {
            // 11.13.1
            if (strict$853 && expr$1353.type === Syntax$846.Identifier && isRestrictedWord$880(expr$1353.name)) {
                throwErrorTolerant$904(token$1354, Messages$848.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$908('=') && (expr$1353.type === Syntax$846.ObjectExpression || expr$1353.type === Syntax$846.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$938(expr$1353);
            } else if (!isLeftHandSide$913(expr$1353)) {
                throwError$903({}, Messages$848.InvalidLHSInAssignment);
            }
            expr$1353 = delegate$862.createAssignmentExpression(lex$899().value, expr$1353, parseAssignmentExpression$942());
        }
        return expr$1353;
    }
    // 11.14 Comma Operator
    function parseExpression$943() {
        var expr$1357, expressions$1358, sequence$1359, coverFormalsList$1360, spreadFound$1361, oldParenthesizedCount$1362;
        oldParenthesizedCount$1362 = state$867.parenthesizedCount;
        expr$1357 = parseAssignmentExpression$942();
        expressions$1358 = [expr$1357];
        if (match$908(',')) {
            while (streamIndex$864 < length$861) {
                if (!match$908(',')) {
                    break;
                }
                lex$899();
                expr$1357 = parseSpreadOrAssignmentExpression$926();
                expressions$1358.push(expr$1357);
                if (expr$1357.type === Syntax$846.SpreadElement) {
                    spreadFound$1361 = true;
                    if (!match$908(')')) {
                        throwError$903({}, Messages$848.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1359 = delegate$862.createSequenceExpression(expressions$1358);
        }
        if (match$908('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$867.parenthesizedCount === oldParenthesizedCount$1362 || state$867.parenthesizedCount === oldParenthesizedCount$1362 + 1) {
                expr$1357 = expr$1357.type === Syntax$846.SequenceExpression ? expr$1357.expressions : expressions$1358;
                coverFormalsList$1360 = reinterpretAsCoverFormalsList$940(expr$1357);
                if (coverFormalsList$1360) {
                    return parseArrowFunctionExpression$941(coverFormalsList$1360);
                }
            }
            throwUnexpected$905(lex$899());
        }
        if (spreadFound$1361 && lookahead2$901().value !== '=>') {
            throwError$903({}, Messages$848.IllegalSpread);
        }
        return sequence$1359 || expr$1357;
    }
    // 12.1 Block
    function parseStatementList$944() {
        var list$1363 = [], statement$1364;
        while (streamIndex$864 < length$861) {
            if (match$908('}')) {
                break;
            }
            statement$1364 = parseSourceElement$989();
            if (typeof statement$1364 === 'undefined') {
                break;
            }
            list$1363.push(statement$1364);
        }
        return list$1363;
    }
    function parseBlock$945() {
        var block$1365;
        expect$906('{');
        block$1365 = parseStatementList$944();
        expect$906('}');
        return delegate$862.createBlockStatement(block$1365);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$946() {
        var token$1366 = lookahead$865, resolvedIdent$1367;
        if (token$1366.type !== Token$843.Identifier) {
            throwUnexpected$905(token$1366);
        }
        resolvedIdent$1367 = expander$842.resolve(tokenStream$863[lookaheadIndex$866]);
        lex$899();
        return delegate$862.createIdentifier(resolvedIdent$1367);
    }
    function parseVariableDeclaration$947(kind$1368) {
        var id$1369, init$1370 = null;
        if (match$908('{')) {
            id$1369 = parseObjectInitialiser$920();
            reinterpretAsAssignmentBindingPattern$938(id$1369);
        } else if (match$908('[')) {
            id$1369 = parseArrayInitialiser$915();
            reinterpretAsAssignmentBindingPattern$938(id$1369);
        } else {
            id$1369 = state$867.allowKeyword ? parseNonComputedProperty$927() : parseVariableIdentifier$946();
            // 12.2.1
            if (strict$853 && isRestrictedWord$880(id$1369.name)) {
                throwErrorTolerant$904({}, Messages$848.StrictVarName);
            }
        }
        if (kind$1368 === 'const') {
            if (!match$908('=')) {
                throwError$903({}, Messages$848.NoUnintializedConst);
            }
            expect$906('=');
            init$1370 = parseAssignmentExpression$942();
        } else if (match$908('=')) {
            lex$899();
            init$1370 = parseAssignmentExpression$942();
        }
        return delegate$862.createVariableDeclarator(id$1369, init$1370);
    }
    function parseVariableDeclarationList$948(kind$1371) {
        var list$1372 = [];
        do {
            list$1372.push(parseVariableDeclaration$947(kind$1371));
            if (!match$908(',')) {
                break;
            }
            lex$899();
        } while (streamIndex$864 < length$861);
        return list$1372;
    }
    function parseVariableStatement$949() {
        var declarations$1373;
        expectKeyword$907('var');
        declarations$1373 = parseVariableDeclarationList$948();
        consumeSemicolon$912();
        return delegate$862.createVariableDeclaration(declarations$1373, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$950(kind$1374) {
        var declarations$1375;
        expectKeyword$907(kind$1374);
        declarations$1375 = parseVariableDeclarationList$948(kind$1374);
        consumeSemicolon$912();
        return delegate$862.createVariableDeclaration(declarations$1375, kind$1374);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$951() {
        var id$1376, src$1377, body$1378;
        lex$899();
        // 'module'
        if (peekLineTerminator$902()) {
            throwError$903({}, Messages$848.NewlineAfterModule);
        }
        switch (lookahead$865.type) {
        case Token$843.StringLiteral:
            id$1376 = parsePrimaryExpression$924();
            body$1378 = parseModuleBlock$994();
            src$1377 = null;
            break;
        case Token$843.Identifier:
            id$1376 = parseVariableIdentifier$946();
            body$1378 = null;
            if (!matchContextualKeyword$910('from')) {
                throwUnexpected$905(lex$899());
            }
            lex$899();
            src$1377 = parsePrimaryExpression$924();
            if (src$1377.type !== Syntax$846.Literal) {
                throwError$903({}, Messages$848.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$912();
        return delegate$862.createModuleDeclaration(id$1376, src$1377, body$1378);
    }
    function parseExportBatchSpecifier$952() {
        expect$906('*');
        return delegate$862.createExportBatchSpecifier();
    }
    function parseExportSpecifier$953() {
        var id$1379, name$1380 = null;
        id$1379 = parseVariableIdentifier$946();
        if (matchContextualKeyword$910('as')) {
            lex$899();
            name$1380 = parseNonComputedProperty$927();
        }
        return delegate$862.createExportSpecifier(id$1379, name$1380);
    }
    function parseExportDeclaration$954() {
        var previousAllowKeyword$1381, decl$1382, def$1383, src$1384, specifiers$1385;
        expectKeyword$907('export');
        if (lookahead$865.type === Token$843.Keyword) {
            switch (lookahead$865.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$862.createExportDeclaration(parseSourceElement$989(), null, null);
            }
        }
        if (isIdentifierName$896(lookahead$865)) {
            previousAllowKeyword$1381 = state$867.allowKeyword;
            state$867.allowKeyword = true;
            decl$1382 = parseVariableDeclarationList$948('let');
            state$867.allowKeyword = previousAllowKeyword$1381;
            return delegate$862.createExportDeclaration(decl$1382, null, null);
        }
        specifiers$1385 = [];
        src$1384 = null;
        if (match$908('*')) {
            specifiers$1385.push(parseExportBatchSpecifier$952());
        } else {
            expect$906('{');
            do {
                specifiers$1385.push(parseExportSpecifier$953());
            } while (match$908(',') && lex$899());
            expect$906('}');
        }
        if (matchContextualKeyword$910('from')) {
            lex$899();
            src$1384 = parsePrimaryExpression$924();
            if (src$1384.type !== Syntax$846.Literal) {
                throwError$903({}, Messages$848.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$912();
        return delegate$862.createExportDeclaration(null, specifiers$1385, src$1384);
    }
    function parseImportDeclaration$955() {
        var specifiers$1386, kind$1387, src$1388;
        expectKeyword$907('import');
        specifiers$1386 = [];
        if (isIdentifierName$896(lookahead$865)) {
            kind$1387 = 'default';
            specifiers$1386.push(parseImportSpecifier$956());
            if (!matchContextualKeyword$910('from')) {
                throwError$903({}, Messages$848.NoFromAfterImport);
            }
            lex$899();
        } else if (match$908('{')) {
            kind$1387 = 'named';
            lex$899();
            do {
                specifiers$1386.push(parseImportSpecifier$956());
            } while (match$908(',') && lex$899());
            expect$906('}');
            if (!matchContextualKeyword$910('from')) {
                throwError$903({}, Messages$848.NoFromAfterImport);
            }
            lex$899();
        }
        src$1388 = parsePrimaryExpression$924();
        if (src$1388.type !== Syntax$846.Literal) {
            throwError$903({}, Messages$848.InvalidModuleSpecifier);
        }
        consumeSemicolon$912();
        return delegate$862.createImportDeclaration(specifiers$1386, kind$1387, src$1388);
    }
    function parseImportSpecifier$956() {
        var id$1389, name$1390 = null;
        id$1389 = parseNonComputedProperty$927();
        if (matchContextualKeyword$910('as')) {
            lex$899();
            name$1390 = parseVariableIdentifier$946();
        }
        return delegate$862.createImportSpecifier(id$1389, name$1390);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$957() {
        expect$906(';');
        return delegate$862.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$958() {
        var expr$1391 = parseExpression$943();
        consumeSemicolon$912();
        return delegate$862.createExpressionStatement(expr$1391);
    }
    // 12.5 If statement
    function parseIfStatement$959() {
        var test$1392, consequent$1393, alternate$1394;
        expectKeyword$907('if');
        expect$906('(');
        test$1392 = parseExpression$943();
        expect$906(')');
        consequent$1393 = parseStatement$974();
        if (matchKeyword$909('else')) {
            lex$899();
            alternate$1394 = parseStatement$974();
        } else {
            alternate$1394 = null;
        }
        return delegate$862.createIfStatement(test$1392, consequent$1393, alternate$1394);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$960() {
        var body$1395, test$1396, oldInIteration$1397;
        expectKeyword$907('do');
        oldInIteration$1397 = state$867.inIteration;
        state$867.inIteration = true;
        body$1395 = parseStatement$974();
        state$867.inIteration = oldInIteration$1397;
        expectKeyword$907('while');
        expect$906('(');
        test$1396 = parseExpression$943();
        expect$906(')');
        if (match$908(';')) {
            lex$899();
        }
        return delegate$862.createDoWhileStatement(body$1395, test$1396);
    }
    function parseWhileStatement$961() {
        var test$1398, body$1399, oldInIteration$1400;
        expectKeyword$907('while');
        expect$906('(');
        test$1398 = parseExpression$943();
        expect$906(')');
        oldInIteration$1400 = state$867.inIteration;
        state$867.inIteration = true;
        body$1399 = parseStatement$974();
        state$867.inIteration = oldInIteration$1400;
        return delegate$862.createWhileStatement(test$1398, body$1399);
    }
    function parseForVariableDeclaration$962() {
        var token$1401 = lex$899(), declarations$1402 = parseVariableDeclarationList$948();
        return delegate$862.createVariableDeclaration(declarations$1402, token$1401.value);
    }
    function parseForStatement$963(opts$1403) {
        var init$1404, test$1405, update$1406, left$1407, right$1408, body$1409, operator$1410, oldInIteration$1411;
        init$1404 = test$1405 = update$1406 = null;
        expectKeyword$907('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$910('each')) {
            throwError$903({}, Messages$848.EachNotAllowed);
        }
        expect$906('(');
        if (match$908(';')) {
            lex$899();
        } else {
            if (matchKeyword$909('var') || matchKeyword$909('let') || matchKeyword$909('const')) {
                state$867.allowIn = false;
                init$1404 = parseForVariableDeclaration$962();
                state$867.allowIn = true;
                if (init$1404.declarations.length === 1) {
                    if (matchKeyword$909('in') || matchContextualKeyword$910('of')) {
                        operator$1410 = lookahead$865;
                        if (!((operator$1410.value === 'in' || init$1404.kind !== 'var') && init$1404.declarations[0].init)) {
                            lex$899();
                            left$1407 = init$1404;
                            right$1408 = parseExpression$943();
                            init$1404 = null;
                        }
                    }
                }
            } else {
                state$867.allowIn = false;
                init$1404 = parseExpression$943();
                state$867.allowIn = true;
                if (matchContextualKeyword$910('of')) {
                    operator$1410 = lex$899();
                    left$1407 = init$1404;
                    right$1408 = parseExpression$943();
                    init$1404 = null;
                } else if (matchKeyword$909('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$914(init$1404)) {
                        throwError$903({}, Messages$848.InvalidLHSInForIn);
                    }
                    operator$1410 = lex$899();
                    left$1407 = init$1404;
                    right$1408 = parseExpression$943();
                    init$1404 = null;
                }
            }
            if (typeof left$1407 === 'undefined') {
                expect$906(';');
            }
        }
        if (typeof left$1407 === 'undefined') {
            if (!match$908(';')) {
                test$1405 = parseExpression$943();
            }
            expect$906(';');
            if (!match$908(')')) {
                update$1406 = parseExpression$943();
            }
        }
        expect$906(')');
        oldInIteration$1411 = state$867.inIteration;
        state$867.inIteration = true;
        if (!(opts$1403 !== undefined && opts$1403.ignoreBody)) {
            body$1409 = parseStatement$974();
        }
        state$867.inIteration = oldInIteration$1411;
        if (typeof left$1407 === 'undefined') {
            return delegate$862.createForStatement(init$1404, test$1405, update$1406, body$1409);
        }
        if (operator$1410.value === 'in') {
            return delegate$862.createForInStatement(left$1407, right$1408, body$1409);
        }
        return delegate$862.createForOfStatement(left$1407, right$1408, body$1409);
    }
    // 12.7 The continue statement
    function parseContinueStatement$964() {
        var label$1412 = null, key$1413;
        expectKeyword$907('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$865.value.charCodeAt(0) === 59) {
            lex$899();
            if (!state$867.inIteration) {
                throwError$903({}, Messages$848.IllegalContinue);
            }
            return delegate$862.createContinueStatement(null);
        }
        if (peekLineTerminator$902()) {
            if (!state$867.inIteration) {
                throwError$903({}, Messages$848.IllegalContinue);
            }
            return delegate$862.createContinueStatement(null);
        }
        if (lookahead$865.type === Token$843.Identifier) {
            label$1412 = parseVariableIdentifier$946();
            key$1413 = '$' + label$1412.name;
            if (!Object.prototype.hasOwnProperty.call(state$867.labelSet, key$1413)) {
                throwError$903({}, Messages$848.UnknownLabel, label$1412.name);
            }
        }
        consumeSemicolon$912();
        if (label$1412 === null && !state$867.inIteration) {
            throwError$903({}, Messages$848.IllegalContinue);
        }
        return delegate$862.createContinueStatement(label$1412);
    }
    // 12.8 The break statement
    function parseBreakStatement$965() {
        var label$1414 = null, key$1415;
        expectKeyword$907('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$865.value.charCodeAt(0) === 59) {
            lex$899();
            if (!(state$867.inIteration || state$867.inSwitch)) {
                throwError$903({}, Messages$848.IllegalBreak);
            }
            return delegate$862.createBreakStatement(null);
        }
        if (peekLineTerminator$902()) {
            if (!(state$867.inIteration || state$867.inSwitch)) {
                throwError$903({}, Messages$848.IllegalBreak);
            }
            return delegate$862.createBreakStatement(null);
        }
        if (lookahead$865.type === Token$843.Identifier) {
            label$1414 = parseVariableIdentifier$946();
            key$1415 = '$' + label$1414.name;
            if (!Object.prototype.hasOwnProperty.call(state$867.labelSet, key$1415)) {
                throwError$903({}, Messages$848.UnknownLabel, label$1414.name);
            }
        }
        consumeSemicolon$912();
        if (label$1414 === null && !(state$867.inIteration || state$867.inSwitch)) {
            throwError$903({}, Messages$848.IllegalBreak);
        }
        return delegate$862.createBreakStatement(label$1414);
    }
    // 12.9 The return statement
    function parseReturnStatement$966() {
        var argument$1416 = null;
        expectKeyword$907('return');
        if (!state$867.inFunctionBody) {
            throwErrorTolerant$904({}, Messages$848.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$876(String(lookahead$865.value).charCodeAt(0))) {
            argument$1416 = parseExpression$943();
            consumeSemicolon$912();
            return delegate$862.createReturnStatement(argument$1416);
        }
        if (peekLineTerminator$902()) {
            return delegate$862.createReturnStatement(null);
        }
        if (!match$908(';')) {
            if (!match$908('}') && lookahead$865.type !== Token$843.EOF) {
                argument$1416 = parseExpression$943();
            }
        }
        consumeSemicolon$912();
        return delegate$862.createReturnStatement(argument$1416);
    }
    // 12.10 The with statement
    function parseWithStatement$967() {
        var object$1417, body$1418;
        if (strict$853) {
            throwErrorTolerant$904({}, Messages$848.StrictModeWith);
        }
        expectKeyword$907('with');
        expect$906('(');
        object$1417 = parseExpression$943();
        expect$906(')');
        body$1418 = parseStatement$974();
        return delegate$862.createWithStatement(object$1417, body$1418);
    }
    // 12.10 The swith statement
    function parseSwitchCase$968() {
        var test$1419, consequent$1420 = [], sourceElement$1421;
        if (matchKeyword$909('default')) {
            lex$899();
            test$1419 = null;
        } else {
            expectKeyword$907('case');
            test$1419 = parseExpression$943();
        }
        expect$906(':');
        while (streamIndex$864 < length$861) {
            if (match$908('}') || matchKeyword$909('default') || matchKeyword$909('case')) {
                break;
            }
            sourceElement$1421 = parseSourceElement$989();
            if (typeof sourceElement$1421 === 'undefined') {
                break;
            }
            consequent$1420.push(sourceElement$1421);
        }
        return delegate$862.createSwitchCase(test$1419, consequent$1420);
    }
    function parseSwitchStatement$969() {
        var discriminant$1422, cases$1423, clause$1424, oldInSwitch$1425, defaultFound$1426;
        expectKeyword$907('switch');
        expect$906('(');
        discriminant$1422 = parseExpression$943();
        expect$906(')');
        expect$906('{');
        cases$1423 = [];
        if (match$908('}')) {
            lex$899();
            return delegate$862.createSwitchStatement(discriminant$1422, cases$1423);
        }
        oldInSwitch$1425 = state$867.inSwitch;
        state$867.inSwitch = true;
        defaultFound$1426 = false;
        while (streamIndex$864 < length$861) {
            if (match$908('}')) {
                break;
            }
            clause$1424 = parseSwitchCase$968();
            if (clause$1424.test === null) {
                if (defaultFound$1426) {
                    throwError$903({}, Messages$848.MultipleDefaultsInSwitch);
                }
                defaultFound$1426 = true;
            }
            cases$1423.push(clause$1424);
        }
        state$867.inSwitch = oldInSwitch$1425;
        expect$906('}');
        return delegate$862.createSwitchStatement(discriminant$1422, cases$1423);
    }
    // 12.13 The throw statement
    function parseThrowStatement$970() {
        var argument$1427;
        expectKeyword$907('throw');
        if (peekLineTerminator$902()) {
            throwError$903({}, Messages$848.NewlineAfterThrow);
        }
        argument$1427 = parseExpression$943();
        consumeSemicolon$912();
        return delegate$862.createThrowStatement(argument$1427);
    }
    // 12.14 The try statement
    function parseCatchClause$971() {
        var param$1428, body$1429;
        expectKeyword$907('catch');
        expect$906('(');
        if (match$908(')')) {
            throwUnexpected$905(lookahead$865);
        }
        param$1428 = parseExpression$943();
        // 12.14.1
        if (strict$853 && param$1428.type === Syntax$846.Identifier && isRestrictedWord$880(param$1428.name)) {
            throwErrorTolerant$904({}, Messages$848.StrictCatchVariable);
        }
        expect$906(')');
        body$1429 = parseBlock$945();
        return delegate$862.createCatchClause(param$1428, body$1429);
    }
    function parseTryStatement$972() {
        var block$1430, handlers$1431 = [], finalizer$1432 = null;
        expectKeyword$907('try');
        block$1430 = parseBlock$945();
        if (matchKeyword$909('catch')) {
            handlers$1431.push(parseCatchClause$971());
        }
        if (matchKeyword$909('finally')) {
            lex$899();
            finalizer$1432 = parseBlock$945();
        }
        if (handlers$1431.length === 0 && !finalizer$1432) {
            throwError$903({}, Messages$848.NoCatchOrFinally);
        }
        return delegate$862.createTryStatement(block$1430, [], handlers$1431, finalizer$1432);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$973() {
        expectKeyword$907('debugger');
        consumeSemicolon$912();
        return delegate$862.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$974() {
        var type$1433 = lookahead$865.type, expr$1434, labeledBody$1435, key$1436;
        if (type$1433 === Token$843.EOF) {
            throwUnexpected$905(lookahead$865);
        }
        if (type$1433 === Token$843.Punctuator) {
            switch (lookahead$865.value) {
            case ';':
                return parseEmptyStatement$957();
            case '{':
                return parseBlock$945();
            case '(':
                return parseExpressionStatement$958();
            default:
                break;
            }
        }
        if (type$1433 === Token$843.Keyword) {
            switch (lookahead$865.value) {
            case 'break':
                return parseBreakStatement$965();
            case 'continue':
                return parseContinueStatement$964();
            case 'debugger':
                return parseDebuggerStatement$973();
            case 'do':
                return parseDoWhileStatement$960();
            case 'for':
                return parseForStatement$963();
            case 'function':
                return parseFunctionDeclaration$980();
            case 'class':
                return parseClassDeclaration$987();
            case 'if':
                return parseIfStatement$959();
            case 'return':
                return parseReturnStatement$966();
            case 'switch':
                return parseSwitchStatement$969();
            case 'throw':
                return parseThrowStatement$970();
            case 'try':
                return parseTryStatement$972();
            case 'var':
                return parseVariableStatement$949();
            case 'while':
                return parseWhileStatement$961();
            case 'with':
                return parseWithStatement$967();
            default:
                break;
            }
        }
        expr$1434 = parseExpression$943();
        // 12.12 Labelled Statements
        if (expr$1434.type === Syntax$846.Identifier && match$908(':')) {
            lex$899();
            key$1436 = '$' + expr$1434.name;
            if (Object.prototype.hasOwnProperty.call(state$867.labelSet, key$1436)) {
                throwError$903({}, Messages$848.Redeclaration, 'Label', expr$1434.name);
            }
            state$867.labelSet[key$1436] = true;
            labeledBody$1435 = parseStatement$974();
            delete state$867.labelSet[key$1436];
            return delegate$862.createLabeledStatement(expr$1434, labeledBody$1435);
        }
        consumeSemicolon$912();
        return delegate$862.createExpressionStatement(expr$1434);
    }
    // 13 Function Definition
    function parseConciseBody$975() {
        if (match$908('{')) {
            return parseFunctionSourceElements$976();
        }
        return parseAssignmentExpression$942();
    }
    function parseFunctionSourceElements$976() {
        var sourceElement$1437, sourceElements$1438 = [], token$1439, directive$1440, firstRestricted$1441, oldLabelSet$1442, oldInIteration$1443, oldInSwitch$1444, oldInFunctionBody$1445, oldParenthesizedCount$1446;
        expect$906('{');
        while (streamIndex$864 < length$861) {
            if (lookahead$865.type !== Token$843.StringLiteral) {
                break;
            }
            token$1439 = lookahead$865;
            sourceElement$1437 = parseSourceElement$989();
            sourceElements$1438.push(sourceElement$1437);
            if (sourceElement$1437.expression.type !== Syntax$846.Literal) {
                // this is not directive
                break;
            }
            directive$1440 = token$1439.value;
            if (directive$1440 === 'use strict') {
                strict$853 = true;
                if (firstRestricted$1441) {
                    throwErrorTolerant$904(firstRestricted$1441, Messages$848.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1441 && token$1439.octal) {
                    firstRestricted$1441 = token$1439;
                }
            }
        }
        oldLabelSet$1442 = state$867.labelSet;
        oldInIteration$1443 = state$867.inIteration;
        oldInSwitch$1444 = state$867.inSwitch;
        oldInFunctionBody$1445 = state$867.inFunctionBody;
        oldParenthesizedCount$1446 = state$867.parenthesizedCount;
        state$867.labelSet = {};
        state$867.inIteration = false;
        state$867.inSwitch = false;
        state$867.inFunctionBody = true;
        state$867.parenthesizedCount = 0;
        while (streamIndex$864 < length$861) {
            if (match$908('}')) {
                break;
            }
            sourceElement$1437 = parseSourceElement$989();
            if (typeof sourceElement$1437 === 'undefined') {
                break;
            }
            sourceElements$1438.push(sourceElement$1437);
        }
        expect$906('}');
        state$867.labelSet = oldLabelSet$1442;
        state$867.inIteration = oldInIteration$1443;
        state$867.inSwitch = oldInSwitch$1444;
        state$867.inFunctionBody = oldInFunctionBody$1445;
        state$867.parenthesizedCount = oldParenthesizedCount$1446;
        return delegate$862.createBlockStatement(sourceElements$1438);
    }
    function validateParam$977(options$1447, param$1448, name$1449) {
        var key$1450 = '$' + name$1449;
        if (strict$853) {
            if (isRestrictedWord$880(name$1449)) {
                options$1447.stricted = param$1448;
                options$1447.message = Messages$848.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1447.paramSet, key$1450)) {
                options$1447.stricted = param$1448;
                options$1447.message = Messages$848.StrictParamDupe;
            }
        } else if (!options$1447.firstRestricted) {
            if (isRestrictedWord$880(name$1449)) {
                options$1447.firstRestricted = param$1448;
                options$1447.message = Messages$848.StrictParamName;
            } else if (isStrictModeReservedWord$879(name$1449)) {
                options$1447.firstRestricted = param$1448;
                options$1447.message = Messages$848.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1447.paramSet, key$1450)) {
                options$1447.firstRestricted = param$1448;
                options$1447.message = Messages$848.StrictParamDupe;
            }
        }
        options$1447.paramSet[key$1450] = true;
    }
    function parseParam$978(options$1451) {
        var token$1452, rest$1453, param$1454, def$1455;
        token$1452 = lookahead$865;
        if (token$1452.value === '...') {
            token$1452 = lex$899();
            rest$1453 = true;
        }
        if (match$908('[')) {
            param$1454 = parseArrayInitialiser$915();
            reinterpretAsDestructuredParameter$939(options$1451, param$1454);
        } else if (match$908('{')) {
            if (rest$1453) {
                throwError$903({}, Messages$848.ObjectPatternAsRestParameter);
            }
            param$1454 = parseObjectInitialiser$920();
            reinterpretAsDestructuredParameter$939(options$1451, param$1454);
        } else {
            param$1454 = parseVariableIdentifier$946();
            validateParam$977(options$1451, token$1452, token$1452.value);
            if (match$908('=')) {
                if (rest$1453) {
                    throwErrorTolerant$904(lookahead$865, Messages$848.DefaultRestParameter);
                }
                lex$899();
                def$1455 = parseAssignmentExpression$942();
                ++options$1451.defaultCount;
            }
        }
        if (rest$1453) {
            if (!match$908(')')) {
                throwError$903({}, Messages$848.ParameterAfterRestParameter);
            }
            options$1451.rest = param$1454;
            return false;
        }
        options$1451.params.push(param$1454);
        options$1451.defaults.push(def$1455);
        return !match$908(')');
    }
    function parseParams$979(firstRestricted$1456) {
        var options$1457;
        options$1457 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1456
        };
        expect$906('(');
        if (!match$908(')')) {
            options$1457.paramSet = {};
            while (streamIndex$864 < length$861) {
                if (!parseParam$978(options$1457)) {
                    break;
                }
                expect$906(',');
            }
        }
        expect$906(')');
        if (options$1457.defaultCount === 0) {
            options$1457.defaults = [];
        }
        return options$1457;
    }
    function parseFunctionDeclaration$980() {
        var id$1458, body$1459, token$1460, tmp$1461, firstRestricted$1462, message$1463, previousStrict$1464, previousYieldAllowed$1465, generator$1466, expression$1467;
        expectKeyword$907('function');
        generator$1466 = false;
        if (match$908('*')) {
            lex$899();
            generator$1466 = true;
        }
        token$1460 = lookahead$865;
        id$1458 = parseVariableIdentifier$946();
        if (strict$853) {
            if (isRestrictedWord$880(token$1460.value)) {
                throwErrorTolerant$904(token$1460, Messages$848.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$880(token$1460.value)) {
                firstRestricted$1462 = token$1460;
                message$1463 = Messages$848.StrictFunctionName;
            } else if (isStrictModeReservedWord$879(token$1460.value)) {
                firstRestricted$1462 = token$1460;
                message$1463 = Messages$848.StrictReservedWord;
            }
        }
        tmp$1461 = parseParams$979(firstRestricted$1462);
        firstRestricted$1462 = tmp$1461.firstRestricted;
        if (tmp$1461.message) {
            message$1463 = tmp$1461.message;
        }
        previousStrict$1464 = strict$853;
        previousYieldAllowed$1465 = state$867.yieldAllowed;
        state$867.yieldAllowed = generator$1466;
        // here we redo some work in order to set 'expression'
        expression$1467 = !match$908('{');
        body$1459 = parseConciseBody$975();
        if (strict$853 && firstRestricted$1462) {
            throwError$903(firstRestricted$1462, message$1463);
        }
        if (strict$853 && tmp$1461.stricted) {
            throwErrorTolerant$904(tmp$1461.stricted, message$1463);
        }
        if (state$867.yieldAllowed && !state$867.yieldFound) {
            throwErrorTolerant$904({}, Messages$848.NoYieldInGenerator);
        }
        strict$853 = previousStrict$1464;
        state$867.yieldAllowed = previousYieldAllowed$1465;
        return delegate$862.createFunctionDeclaration(id$1458, tmp$1461.params, tmp$1461.defaults, body$1459, tmp$1461.rest, generator$1466, expression$1467);
    }
    function parseFunctionExpression$981() {
        var token$1468, id$1469 = null, firstRestricted$1470, message$1471, tmp$1472, body$1473, previousStrict$1474, previousYieldAllowed$1475, generator$1476, expression$1477;
        expectKeyword$907('function');
        generator$1476 = false;
        if (match$908('*')) {
            lex$899();
            generator$1476 = true;
        }
        if (!match$908('(')) {
            token$1468 = lookahead$865;
            id$1469 = parseVariableIdentifier$946();
            if (strict$853) {
                if (isRestrictedWord$880(token$1468.value)) {
                    throwErrorTolerant$904(token$1468, Messages$848.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$880(token$1468.value)) {
                    firstRestricted$1470 = token$1468;
                    message$1471 = Messages$848.StrictFunctionName;
                } else if (isStrictModeReservedWord$879(token$1468.value)) {
                    firstRestricted$1470 = token$1468;
                    message$1471 = Messages$848.StrictReservedWord;
                }
            }
        }
        tmp$1472 = parseParams$979(firstRestricted$1470);
        firstRestricted$1470 = tmp$1472.firstRestricted;
        if (tmp$1472.message) {
            message$1471 = tmp$1472.message;
        }
        previousStrict$1474 = strict$853;
        previousYieldAllowed$1475 = state$867.yieldAllowed;
        state$867.yieldAllowed = generator$1476;
        // here we redo some work in order to set 'expression'
        expression$1477 = !match$908('{');
        body$1473 = parseConciseBody$975();
        if (strict$853 && firstRestricted$1470) {
            throwError$903(firstRestricted$1470, message$1471);
        }
        if (strict$853 && tmp$1472.stricted) {
            throwErrorTolerant$904(tmp$1472.stricted, message$1471);
        }
        if (state$867.yieldAllowed && !state$867.yieldFound) {
            throwErrorTolerant$904({}, Messages$848.NoYieldInGenerator);
        }
        strict$853 = previousStrict$1474;
        state$867.yieldAllowed = previousYieldAllowed$1475;
        return delegate$862.createFunctionExpression(id$1469, tmp$1472.params, tmp$1472.defaults, body$1473, tmp$1472.rest, generator$1476, expression$1477);
    }
    function parseYieldExpression$982() {
        var delegateFlag$1478, expr$1479, previousYieldAllowed$1480;
        expectKeyword$907('yield');
        if (!state$867.yieldAllowed) {
            throwErrorTolerant$904({}, Messages$848.IllegalYield);
        }
        delegateFlag$1478 = false;
        if (match$908('*')) {
            lex$899();
            delegateFlag$1478 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1480 = state$867.yieldAllowed;
        state$867.yieldAllowed = false;
        expr$1479 = parseAssignmentExpression$942();
        state$867.yieldAllowed = previousYieldAllowed$1480;
        state$867.yieldFound = true;
        return delegate$862.createYieldExpression(expr$1479, delegateFlag$1478);
    }
    // 14 Classes
    function parseMethodDefinition$983(existingPropNames$1481) {
        var token$1482, key$1483, param$1484, propType$1485, isValidDuplicateProp$1486 = false;
        if (lookahead$865.value === 'static') {
            propType$1485 = ClassPropertyType$851.static;
            lex$899();
        } else {
            propType$1485 = ClassPropertyType$851.prototype;
        }
        if (match$908('*')) {
            lex$899();
            return delegate$862.createMethodDefinition(propType$1485, '', parseObjectPropertyKey$918(), parsePropertyMethodFunction$917({ generator: true }));
        }
        token$1482 = lookahead$865;
        key$1483 = parseObjectPropertyKey$918();
        if (token$1482.value === 'get' && !match$908('(')) {
            key$1483 = parseObjectPropertyKey$918();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1481[propType$1485].hasOwnProperty(key$1483.name)) {
                isValidDuplicateProp$1486 = existingPropNames$1481[propType$1485][key$1483.name].get === undefined && existingPropNames$1481[propType$1485][key$1483.name].data === undefined && existingPropNames$1481[propType$1485][key$1483.name].set !== undefined;
                if (!isValidDuplicateProp$1486) {
                    throwError$903(key$1483, Messages$848.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1481[propType$1485][key$1483.name] = {};
            }
            existingPropNames$1481[propType$1485][key$1483.name].get = true;
            expect$906('(');
            expect$906(')');
            return delegate$862.createMethodDefinition(propType$1485, 'get', key$1483, parsePropertyFunction$916({ generator: false }));
        }
        if (token$1482.value === 'set' && !match$908('(')) {
            key$1483 = parseObjectPropertyKey$918();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1481[propType$1485].hasOwnProperty(key$1483.name)) {
                isValidDuplicateProp$1486 = existingPropNames$1481[propType$1485][key$1483.name].set === undefined && existingPropNames$1481[propType$1485][key$1483.name].data === undefined && existingPropNames$1481[propType$1485][key$1483.name].get !== undefined;
                if (!isValidDuplicateProp$1486) {
                    throwError$903(key$1483, Messages$848.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1481[propType$1485][key$1483.name] = {};
            }
            existingPropNames$1481[propType$1485][key$1483.name].set = true;
            expect$906('(');
            token$1482 = lookahead$865;
            param$1484 = [parseVariableIdentifier$946()];
            expect$906(')');
            return delegate$862.createMethodDefinition(propType$1485, 'set', key$1483, parsePropertyFunction$916({
                params: param$1484,
                generator: false,
                name: token$1482
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1481[propType$1485].hasOwnProperty(key$1483.name)) {
            throwError$903(key$1483, Messages$848.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1481[propType$1485][key$1483.name] = {};
        }
        existingPropNames$1481[propType$1485][key$1483.name].data = true;
        return delegate$862.createMethodDefinition(propType$1485, '', key$1483, parsePropertyMethodFunction$917({ generator: false }));
    }
    function parseClassElement$984(existingProps$1487) {
        if (match$908(';')) {
            lex$899();
            return;
        }
        return parseMethodDefinition$983(existingProps$1487);
    }
    function parseClassBody$985() {
        var classElement$1488, classElements$1489 = [], existingProps$1490 = {};
        existingProps$1490[ClassPropertyType$851.static] = {};
        existingProps$1490[ClassPropertyType$851.prototype] = {};
        expect$906('{');
        while (streamIndex$864 < length$861) {
            if (match$908('}')) {
                break;
            }
            classElement$1488 = parseClassElement$984(existingProps$1490);
            if (typeof classElement$1488 !== 'undefined') {
                classElements$1489.push(classElement$1488);
            }
        }
        expect$906('}');
        return delegate$862.createClassBody(classElements$1489);
    }
    function parseClassExpression$986() {
        var id$1491, previousYieldAllowed$1492, superClass$1493 = null;
        expectKeyword$907('class');
        if (!matchKeyword$909('extends') && !match$908('{')) {
            id$1491 = parseVariableIdentifier$946();
        }
        if (matchKeyword$909('extends')) {
            expectKeyword$907('extends');
            previousYieldAllowed$1492 = state$867.yieldAllowed;
            state$867.yieldAllowed = false;
            superClass$1493 = parseAssignmentExpression$942();
            state$867.yieldAllowed = previousYieldAllowed$1492;
        }
        return delegate$862.createClassExpression(id$1491, superClass$1493, parseClassBody$985());
    }
    function parseClassDeclaration$987() {
        var id$1494, previousYieldAllowed$1495, superClass$1496 = null;
        expectKeyword$907('class');
        id$1494 = parseVariableIdentifier$946();
        if (matchKeyword$909('extends')) {
            expectKeyword$907('extends');
            previousYieldAllowed$1495 = state$867.yieldAllowed;
            state$867.yieldAllowed = false;
            superClass$1496 = parseAssignmentExpression$942();
            state$867.yieldAllowed = previousYieldAllowed$1495;
        }
        return delegate$862.createClassDeclaration(id$1494, superClass$1496, parseClassBody$985());
    }
    // 15 Program
    function matchModuleDeclaration$988() {
        var id$1497;
        if (matchContextualKeyword$910('module')) {
            id$1497 = lookahead2$901();
            return id$1497.type === Token$843.StringLiteral || id$1497.type === Token$843.Identifier;
        }
        return false;
    }
    function parseSourceElement$989() {
        if (lookahead$865.type === Token$843.Keyword) {
            switch (lookahead$865.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$950(lookahead$865.value);
            case 'function':
                return parseFunctionDeclaration$980();
            case 'export':
                return parseExportDeclaration$954();
            case 'import':
                return parseImportDeclaration$955();
            default:
                return parseStatement$974();
            }
        }
        if (matchModuleDeclaration$988()) {
            throwError$903({}, Messages$848.NestedModule);
        }
        if (lookahead$865.type !== Token$843.EOF) {
            return parseStatement$974();
        }
    }
    function parseProgramElement$990() {
        if (lookahead$865.type === Token$843.Keyword) {
            switch (lookahead$865.value) {
            case 'export':
                return parseExportDeclaration$954();
            case 'import':
                return parseImportDeclaration$955();
            }
        }
        if (matchModuleDeclaration$988()) {
            return parseModuleDeclaration$951();
        }
        return parseSourceElement$989();
    }
    function parseProgramElements$991() {
        var sourceElement$1498, sourceElements$1499 = [], token$1500, directive$1501, firstRestricted$1502;
        while (streamIndex$864 < length$861) {
            token$1500 = lookahead$865;
            if (token$1500.type !== Token$843.StringLiteral) {
                break;
            }
            sourceElement$1498 = parseProgramElement$990();
            sourceElements$1499.push(sourceElement$1498);
            if (sourceElement$1498.expression.type !== Syntax$846.Literal) {
                // this is not directive
                break;
            }
            directive$1501 = token$1500.value;
            if (directive$1501 === 'use strict') {
                strict$853 = true;
                if (firstRestricted$1502) {
                    throwErrorTolerant$904(firstRestricted$1502, Messages$848.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1502 && token$1500.octal) {
                    firstRestricted$1502 = token$1500;
                }
            }
        }
        while (streamIndex$864 < length$861) {
            sourceElement$1498 = parseProgramElement$990();
            if (typeof sourceElement$1498 === 'undefined') {
                break;
            }
            sourceElements$1499.push(sourceElement$1498);
        }
        return sourceElements$1499;
    }
    function parseModuleElement$992() {
        return parseSourceElement$989();
    }
    function parseModuleElements$993() {
        var list$1503 = [], statement$1504;
        while (streamIndex$864 < length$861) {
            if (match$908('}')) {
                break;
            }
            statement$1504 = parseModuleElement$992();
            if (typeof statement$1504 === 'undefined') {
                break;
            }
            list$1503.push(statement$1504);
        }
        return list$1503;
    }
    function parseModuleBlock$994() {
        var block$1505;
        expect$906('{');
        block$1505 = parseModuleElements$993();
        expect$906('}');
        return delegate$862.createBlockStatement(block$1505);
    }
    function parseProgram$995() {
        var body$1506;
        strict$853 = false;
        peek$900();
        body$1506 = parseProgramElements$991();
        return delegate$862.createProgram(body$1506);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$996(type$1507, value$1508, start$1509, end$1510, loc$1511) {
        assert$869(typeof start$1509 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$868.comments.length > 0) {
            if (extra$868.comments[extra$868.comments.length - 1].range[1] > start$1509) {
                return;
            }
        }
        extra$868.comments.push({
            type: type$1507,
            value: value$1508,
            range: [
                start$1509,
                end$1510
            ],
            loc: loc$1511
        });
    }
    function scanComment$997() {
        var comment$1512, ch$1513, loc$1514, start$1515, blockComment$1516, lineComment$1517;
        comment$1512 = '';
        blockComment$1516 = false;
        lineComment$1517 = false;
        while (index$854 < length$861) {
            ch$1513 = source$852[index$854];
            if (lineComment$1517) {
                ch$1513 = source$852[index$854++];
                if (isLineTerminator$875(ch$1513.charCodeAt(0))) {
                    loc$1514.end = {
                        line: lineNumber$855,
                        column: index$854 - lineStart$856 - 1
                    };
                    lineComment$1517 = false;
                    addComment$996('Line', comment$1512, start$1515, index$854 - 1, loc$1514);
                    if (ch$1513 === '\r' && source$852[index$854] === '\n') {
                        ++index$854;
                    }
                    ++lineNumber$855;
                    lineStart$856 = index$854;
                    comment$1512 = '';
                } else if (index$854 >= length$861) {
                    lineComment$1517 = false;
                    comment$1512 += ch$1513;
                    loc$1514.end = {
                        line: lineNumber$855,
                        column: length$861 - lineStart$856
                    };
                    addComment$996('Line', comment$1512, start$1515, length$861, loc$1514);
                } else {
                    comment$1512 += ch$1513;
                }
            } else if (blockComment$1516) {
                if (isLineTerminator$875(ch$1513.charCodeAt(0))) {
                    if (ch$1513 === '\r' && source$852[index$854 + 1] === '\n') {
                        ++index$854;
                        comment$1512 += '\r\n';
                    } else {
                        comment$1512 += ch$1513;
                    }
                    ++lineNumber$855;
                    ++index$854;
                    lineStart$856 = index$854;
                    if (index$854 >= length$861) {
                        throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1513 = source$852[index$854++];
                    if (index$854 >= length$861) {
                        throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1512 += ch$1513;
                    if (ch$1513 === '*') {
                        ch$1513 = source$852[index$854];
                        if (ch$1513 === '/') {
                            comment$1512 = comment$1512.substr(0, comment$1512.length - 1);
                            blockComment$1516 = false;
                            ++index$854;
                            loc$1514.end = {
                                line: lineNumber$855,
                                column: index$854 - lineStart$856
                            };
                            addComment$996('Block', comment$1512, start$1515, index$854, loc$1514);
                            comment$1512 = '';
                        }
                    }
                }
            } else if (ch$1513 === '/') {
                ch$1513 = source$852[index$854 + 1];
                if (ch$1513 === '/') {
                    loc$1514 = {
                        start: {
                            line: lineNumber$855,
                            column: index$854 - lineStart$856
                        }
                    };
                    start$1515 = index$854;
                    index$854 += 2;
                    lineComment$1517 = true;
                    if (index$854 >= length$861) {
                        loc$1514.end = {
                            line: lineNumber$855,
                            column: index$854 - lineStart$856
                        };
                        lineComment$1517 = false;
                        addComment$996('Line', comment$1512, start$1515, index$854, loc$1514);
                    }
                } else if (ch$1513 === '*') {
                    start$1515 = index$854;
                    index$854 += 2;
                    blockComment$1516 = true;
                    loc$1514 = {
                        start: {
                            line: lineNumber$855,
                            column: index$854 - lineStart$856 - 2
                        }
                    };
                    if (index$854 >= length$861) {
                        throwError$903({}, Messages$848.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$874(ch$1513.charCodeAt(0))) {
                ++index$854;
            } else if (isLineTerminator$875(ch$1513.charCodeAt(0))) {
                ++index$854;
                if (ch$1513 === '\r' && source$852[index$854] === '\n') {
                    ++index$854;
                }
                ++lineNumber$855;
                lineStart$856 = index$854;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$998() {
        var i$1518, entry$1519, comment$1520, comments$1521 = [];
        for (i$1518 = 0; i$1518 < extra$868.comments.length; ++i$1518) {
            entry$1519 = extra$868.comments[i$1518];
            comment$1520 = {
                type: entry$1519.type,
                value: entry$1519.value
            };
            if (extra$868.range) {
                comment$1520.range = entry$1519.range;
            }
            if (extra$868.loc) {
                comment$1520.loc = entry$1519.loc;
            }
            comments$1521.push(comment$1520);
        }
        extra$868.comments = comments$1521;
    }
    function collectToken$999() {
        var start$1522, loc$1523, token$1524, range$1525, value$1526;
        skipComment$882();
        start$1522 = index$854;
        loc$1523 = {
            start: {
                line: lineNumber$855,
                column: index$854 - lineStart$856
            }
        };
        token$1524 = extra$868.advance();
        loc$1523.end = {
            line: lineNumber$855,
            column: index$854 - lineStart$856
        };
        if (token$1524.type !== Token$843.EOF) {
            range$1525 = [
                token$1524.range[0],
                token$1524.range[1]
            ];
            value$1526 = source$852.slice(token$1524.range[0], token$1524.range[1]);
            extra$868.tokens.push({
                type: TokenName$844[token$1524.type],
                value: value$1526,
                range: range$1525,
                loc: loc$1523
            });
        }
        return token$1524;
    }
    function collectRegex$1000() {
        var pos$1527, loc$1528, regex$1529, token$1530;
        skipComment$882();
        pos$1527 = index$854;
        loc$1528 = {
            start: {
                line: lineNumber$855,
                column: index$854 - lineStart$856
            }
        };
        regex$1529 = extra$868.scanRegExp();
        loc$1528.end = {
            line: lineNumber$855,
            column: index$854 - lineStart$856
        };
        if (!extra$868.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$868.tokens.length > 0) {
                token$1530 = extra$868.tokens[extra$868.tokens.length - 1];
                if (token$1530.range[0] === pos$1527 && token$1530.type === 'Punctuator') {
                    if (token$1530.value === '/' || token$1530.value === '/=') {
                        extra$868.tokens.pop();
                    }
                }
            }
            extra$868.tokens.push({
                type: 'RegularExpression',
                value: regex$1529.literal,
                range: [
                    pos$1527,
                    index$854
                ],
                loc: loc$1528
            });
        }
        return regex$1529;
    }
    function filterTokenLocation$1001() {
        var i$1531, entry$1532, token$1533, tokens$1534 = [];
        for (i$1531 = 0; i$1531 < extra$868.tokens.length; ++i$1531) {
            entry$1532 = extra$868.tokens[i$1531];
            token$1533 = {
                type: entry$1532.type,
                value: entry$1532.value
            };
            if (extra$868.range) {
                token$1533.range = entry$1532.range;
            }
            if (extra$868.loc) {
                token$1533.loc = entry$1532.loc;
            }
            tokens$1534.push(token$1533);
        }
        extra$868.tokens = tokens$1534;
    }
    function LocationMarker$1002() {
        var sm_index$1535 = lookahead$865 ? lookahead$865.sm_range[0] : 0;
        var sm_lineStart$1536 = lookahead$865 ? lookahead$865.sm_lineStart : 0;
        var sm_lineNumber$1537 = lookahead$865 ? lookahead$865.sm_lineNumber : 1;
        this.range = [
            sm_index$1535,
            sm_index$1535
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1537,
                column: sm_index$1535 - sm_lineStart$1536
            },
            end: {
                line: sm_lineNumber$1537,
                column: sm_index$1535 - sm_lineStart$1536
            }
        };
    }
    LocationMarker$1002.prototype = {
        constructor: LocationMarker$1002,
        end: function () {
            this.range[1] = sm_index$860;
            this.loc.end.line = sm_lineNumber$857;
            this.loc.end.column = sm_index$860 - sm_lineStart$858;
        },
        applyGroup: function (node$1538) {
            if (extra$868.range) {
                node$1538.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$868.loc) {
                node$1538.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1538 = delegate$862.postProcess(node$1538);
            }
        },
        apply: function (node$1539) {
            var nodeType$1540 = typeof node$1539;
            assert$869(nodeType$1540 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1540);
            if (extra$868.range) {
                node$1539.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$868.loc) {
                node$1539.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1539 = delegate$862.postProcess(node$1539);
            }
        }
    };
    function createLocationMarker$1003() {
        return new LocationMarker$1002();
    }
    function trackGroupExpression$1004() {
        var marker$1541, expr$1542;
        marker$1541 = createLocationMarker$1003();
        expect$906('(');
        ++state$867.parenthesizedCount;
        expr$1542 = parseExpression$943();
        expect$906(')');
        marker$1541.end();
        marker$1541.applyGroup(expr$1542);
        return expr$1542;
    }
    function trackLeftHandSideExpression$1005() {
        var marker$1543, expr$1544;
        // skipComment();
        marker$1543 = createLocationMarker$1003();
        expr$1544 = matchKeyword$909('new') ? parseNewExpression$930() : parsePrimaryExpression$924();
        while (match$908('.') || match$908('[') || lookahead$865.type === Token$843.Template) {
            if (match$908('[')) {
                expr$1544 = delegate$862.createMemberExpression('[', expr$1544, parseComputedMember$929());
                marker$1543.end();
                marker$1543.apply(expr$1544);
            } else if (match$908('.')) {
                expr$1544 = delegate$862.createMemberExpression('.', expr$1544, parseNonComputedMember$928());
                marker$1543.end();
                marker$1543.apply(expr$1544);
            } else {
                expr$1544 = delegate$862.createTaggedTemplateExpression(expr$1544, parseTemplateLiteral$922());
                marker$1543.end();
                marker$1543.apply(expr$1544);
            }
        }
        return expr$1544;
    }
    function trackLeftHandSideExpressionAllowCall$1006() {
        var marker$1545, expr$1546, args$1547;
        // skipComment();
        marker$1545 = createLocationMarker$1003();
        expr$1546 = matchKeyword$909('new') ? parseNewExpression$930() : parsePrimaryExpression$924();
        while (match$908('.') || match$908('[') || match$908('(') || lookahead$865.type === Token$843.Template) {
            if (match$908('(')) {
                args$1547 = parseArguments$925();
                expr$1546 = delegate$862.createCallExpression(expr$1546, args$1547);
                marker$1545.end();
                marker$1545.apply(expr$1546);
            } else if (match$908('[')) {
                expr$1546 = delegate$862.createMemberExpression('[', expr$1546, parseComputedMember$929());
                marker$1545.end();
                marker$1545.apply(expr$1546);
            } else if (match$908('.')) {
                expr$1546 = delegate$862.createMemberExpression('.', expr$1546, parseNonComputedMember$928());
                marker$1545.end();
                marker$1545.apply(expr$1546);
            } else {
                expr$1546 = delegate$862.createTaggedTemplateExpression(expr$1546, parseTemplateLiteral$922());
                marker$1545.end();
                marker$1545.apply(expr$1546);
            }
        }
        return expr$1546;
    }
    function filterGroup$1007(node$1548) {
        var n$1549, i$1550, entry$1551;
        n$1549 = Object.prototype.toString.apply(node$1548) === '[object Array]' ? [] : {};
        for (i$1550 in node$1548) {
            if (node$1548.hasOwnProperty(i$1550) && i$1550 !== 'groupRange' && i$1550 !== 'groupLoc') {
                entry$1551 = node$1548[i$1550];
                if (entry$1551 === null || typeof entry$1551 !== 'object' || entry$1551 instanceof RegExp) {
                    n$1549[i$1550] = entry$1551;
                } else {
                    n$1549[i$1550] = filterGroup$1007(entry$1551);
                }
            }
        }
        return n$1549;
    }
    function wrapTrackingFunction$1008(range$1552, loc$1553) {
        return function (parseFunction$1554) {
            function isBinary$1555(node$1557) {
                return node$1557.type === Syntax$846.LogicalExpression || node$1557.type === Syntax$846.BinaryExpression;
            }
            function visit$1556(node$1558) {
                var start$1559, end$1560;
                if (isBinary$1555(node$1558.left)) {
                    visit$1556(node$1558.left);
                }
                if (isBinary$1555(node$1558.right)) {
                    visit$1556(node$1558.right);
                }
                if (range$1552) {
                    if (node$1558.left.groupRange || node$1558.right.groupRange) {
                        start$1559 = node$1558.left.groupRange ? node$1558.left.groupRange[0] : node$1558.left.range[0];
                        end$1560 = node$1558.right.groupRange ? node$1558.right.groupRange[1] : node$1558.right.range[1];
                        node$1558.range = [
                            start$1559,
                            end$1560
                        ];
                    } else if (typeof node$1558.range === 'undefined') {
                        start$1559 = node$1558.left.range[0];
                        end$1560 = node$1558.right.range[1];
                        node$1558.range = [
                            start$1559,
                            end$1560
                        ];
                    }
                }
                if (loc$1553) {
                    if (node$1558.left.groupLoc || node$1558.right.groupLoc) {
                        start$1559 = node$1558.left.groupLoc ? node$1558.left.groupLoc.start : node$1558.left.loc.start;
                        end$1560 = node$1558.right.groupLoc ? node$1558.right.groupLoc.end : node$1558.right.loc.end;
                        node$1558.loc = {
                            start: start$1559,
                            end: end$1560
                        };
                        node$1558 = delegate$862.postProcess(node$1558);
                    } else if (typeof node$1558.loc === 'undefined') {
                        node$1558.loc = {
                            start: node$1558.left.loc.start,
                            end: node$1558.right.loc.end
                        };
                        node$1558 = delegate$862.postProcess(node$1558);
                    }
                }
            }
            return function () {
                var marker$1561, node$1562, curr$1563 = lookahead$865;
                marker$1561 = createLocationMarker$1003();
                node$1562 = parseFunction$1554.apply(null, arguments);
                marker$1561.end();
                if (node$1562.type !== Syntax$846.Program) {
                    if (curr$1563.leadingComments) {
                        node$1562.leadingComments = curr$1563.leadingComments;
                    }
                    if (curr$1563.trailingComments) {
                        node$1562.trailingComments = curr$1563.trailingComments;
                    }
                }
                if (range$1552 && typeof node$1562.range === 'undefined') {
                    marker$1561.apply(node$1562);
                }
                if (loc$1553 && typeof node$1562.loc === 'undefined') {
                    marker$1561.apply(node$1562);
                }
                if (isBinary$1555(node$1562)) {
                    visit$1556(node$1562);
                }
                return node$1562;
            };
        };
    }
    function patch$1009() {
        var wrapTracking$1564;
        if (extra$868.comments) {
            extra$868.skipComment = skipComment$882;
            skipComment$882 = scanComment$997;
        }
        if (extra$868.range || extra$868.loc) {
            extra$868.parseGroupExpression = parseGroupExpression$923;
            extra$868.parseLeftHandSideExpression = parseLeftHandSideExpression$932;
            extra$868.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$931;
            parseGroupExpression$923 = trackGroupExpression$1004;
            parseLeftHandSideExpression$932 = trackLeftHandSideExpression$1005;
            parseLeftHandSideExpressionAllowCall$931 = trackLeftHandSideExpressionAllowCall$1006;
            wrapTracking$1564 = wrapTrackingFunction$1008(extra$868.range, extra$868.loc);
            extra$868.parseArrayInitialiser = parseArrayInitialiser$915;
            extra$868.parseAssignmentExpression = parseAssignmentExpression$942;
            extra$868.parseBinaryExpression = parseBinaryExpression$936;
            extra$868.parseBlock = parseBlock$945;
            extra$868.parseFunctionSourceElements = parseFunctionSourceElements$976;
            extra$868.parseCatchClause = parseCatchClause$971;
            extra$868.parseComputedMember = parseComputedMember$929;
            extra$868.parseConditionalExpression = parseConditionalExpression$937;
            extra$868.parseConstLetDeclaration = parseConstLetDeclaration$950;
            extra$868.parseExportBatchSpecifier = parseExportBatchSpecifier$952;
            extra$868.parseExportDeclaration = parseExportDeclaration$954;
            extra$868.parseExportSpecifier = parseExportSpecifier$953;
            extra$868.parseExpression = parseExpression$943;
            extra$868.parseForVariableDeclaration = parseForVariableDeclaration$962;
            extra$868.parseFunctionDeclaration = parseFunctionDeclaration$980;
            extra$868.parseFunctionExpression = parseFunctionExpression$981;
            extra$868.parseParams = parseParams$979;
            extra$868.parseImportDeclaration = parseImportDeclaration$955;
            extra$868.parseImportSpecifier = parseImportSpecifier$956;
            extra$868.parseModuleDeclaration = parseModuleDeclaration$951;
            extra$868.parseModuleBlock = parseModuleBlock$994;
            extra$868.parseNewExpression = parseNewExpression$930;
            extra$868.parseNonComputedProperty = parseNonComputedProperty$927;
            extra$868.parseObjectInitialiser = parseObjectInitialiser$920;
            extra$868.parseObjectProperty = parseObjectProperty$919;
            extra$868.parseObjectPropertyKey = parseObjectPropertyKey$918;
            extra$868.parsePostfixExpression = parsePostfixExpression$933;
            extra$868.parsePrimaryExpression = parsePrimaryExpression$924;
            extra$868.parseProgram = parseProgram$995;
            extra$868.parsePropertyFunction = parsePropertyFunction$916;
            extra$868.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$926;
            extra$868.parseTemplateElement = parseTemplateElement$921;
            extra$868.parseTemplateLiteral = parseTemplateLiteral$922;
            extra$868.parseStatement = parseStatement$974;
            extra$868.parseSwitchCase = parseSwitchCase$968;
            extra$868.parseUnaryExpression = parseUnaryExpression$934;
            extra$868.parseVariableDeclaration = parseVariableDeclaration$947;
            extra$868.parseVariableIdentifier = parseVariableIdentifier$946;
            extra$868.parseMethodDefinition = parseMethodDefinition$983;
            extra$868.parseClassDeclaration = parseClassDeclaration$987;
            extra$868.parseClassExpression = parseClassExpression$986;
            extra$868.parseClassBody = parseClassBody$985;
            parseArrayInitialiser$915 = wrapTracking$1564(extra$868.parseArrayInitialiser);
            parseAssignmentExpression$942 = wrapTracking$1564(extra$868.parseAssignmentExpression);
            parseBinaryExpression$936 = wrapTracking$1564(extra$868.parseBinaryExpression);
            parseBlock$945 = wrapTracking$1564(extra$868.parseBlock);
            parseFunctionSourceElements$976 = wrapTracking$1564(extra$868.parseFunctionSourceElements);
            parseCatchClause$971 = wrapTracking$1564(extra$868.parseCatchClause);
            parseComputedMember$929 = wrapTracking$1564(extra$868.parseComputedMember);
            parseConditionalExpression$937 = wrapTracking$1564(extra$868.parseConditionalExpression);
            parseConstLetDeclaration$950 = wrapTracking$1564(extra$868.parseConstLetDeclaration);
            parseExportBatchSpecifier$952 = wrapTracking$1564(parseExportBatchSpecifier$952);
            parseExportDeclaration$954 = wrapTracking$1564(parseExportDeclaration$954);
            parseExportSpecifier$953 = wrapTracking$1564(parseExportSpecifier$953);
            parseExpression$943 = wrapTracking$1564(extra$868.parseExpression);
            parseForVariableDeclaration$962 = wrapTracking$1564(extra$868.parseForVariableDeclaration);
            parseFunctionDeclaration$980 = wrapTracking$1564(extra$868.parseFunctionDeclaration);
            parseFunctionExpression$981 = wrapTracking$1564(extra$868.parseFunctionExpression);
            parseParams$979 = wrapTracking$1564(extra$868.parseParams);
            parseImportDeclaration$955 = wrapTracking$1564(extra$868.parseImportDeclaration);
            parseImportSpecifier$956 = wrapTracking$1564(extra$868.parseImportSpecifier);
            parseModuleDeclaration$951 = wrapTracking$1564(extra$868.parseModuleDeclaration);
            parseModuleBlock$994 = wrapTracking$1564(extra$868.parseModuleBlock);
            parseLeftHandSideExpression$932 = wrapTracking$1564(parseLeftHandSideExpression$932);
            parseNewExpression$930 = wrapTracking$1564(extra$868.parseNewExpression);
            parseNonComputedProperty$927 = wrapTracking$1564(extra$868.parseNonComputedProperty);
            parseObjectInitialiser$920 = wrapTracking$1564(extra$868.parseObjectInitialiser);
            parseObjectProperty$919 = wrapTracking$1564(extra$868.parseObjectProperty);
            parseObjectPropertyKey$918 = wrapTracking$1564(extra$868.parseObjectPropertyKey);
            parsePostfixExpression$933 = wrapTracking$1564(extra$868.parsePostfixExpression);
            parsePrimaryExpression$924 = wrapTracking$1564(extra$868.parsePrimaryExpression);
            parseProgram$995 = wrapTracking$1564(extra$868.parseProgram);
            parsePropertyFunction$916 = wrapTracking$1564(extra$868.parsePropertyFunction);
            parseTemplateElement$921 = wrapTracking$1564(extra$868.parseTemplateElement);
            parseTemplateLiteral$922 = wrapTracking$1564(extra$868.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$926 = wrapTracking$1564(extra$868.parseSpreadOrAssignmentExpression);
            parseStatement$974 = wrapTracking$1564(extra$868.parseStatement);
            parseSwitchCase$968 = wrapTracking$1564(extra$868.parseSwitchCase);
            parseUnaryExpression$934 = wrapTracking$1564(extra$868.parseUnaryExpression);
            parseVariableDeclaration$947 = wrapTracking$1564(extra$868.parseVariableDeclaration);
            parseVariableIdentifier$946 = wrapTracking$1564(extra$868.parseVariableIdentifier);
            parseMethodDefinition$983 = wrapTracking$1564(extra$868.parseMethodDefinition);
            parseClassDeclaration$987 = wrapTracking$1564(extra$868.parseClassDeclaration);
            parseClassExpression$986 = wrapTracking$1564(extra$868.parseClassExpression);
            parseClassBody$985 = wrapTracking$1564(extra$868.parseClassBody);
        }
        if (typeof extra$868.tokens !== 'undefined') {
            extra$868.advance = advance$898;
            extra$868.scanRegExp = scanRegExp$895;
            advance$898 = collectToken$999;
            scanRegExp$895 = collectRegex$1000;
        }
    }
    function unpatch$1010() {
        if (typeof extra$868.skipComment === 'function') {
            skipComment$882 = extra$868.skipComment;
        }
        if (extra$868.range || extra$868.loc) {
            parseArrayInitialiser$915 = extra$868.parseArrayInitialiser;
            parseAssignmentExpression$942 = extra$868.parseAssignmentExpression;
            parseBinaryExpression$936 = extra$868.parseBinaryExpression;
            parseBlock$945 = extra$868.parseBlock;
            parseFunctionSourceElements$976 = extra$868.parseFunctionSourceElements;
            parseCatchClause$971 = extra$868.parseCatchClause;
            parseComputedMember$929 = extra$868.parseComputedMember;
            parseConditionalExpression$937 = extra$868.parseConditionalExpression;
            parseConstLetDeclaration$950 = extra$868.parseConstLetDeclaration;
            parseExportBatchSpecifier$952 = extra$868.parseExportBatchSpecifier;
            parseExportDeclaration$954 = extra$868.parseExportDeclaration;
            parseExportSpecifier$953 = extra$868.parseExportSpecifier;
            parseExpression$943 = extra$868.parseExpression;
            parseForVariableDeclaration$962 = extra$868.parseForVariableDeclaration;
            parseFunctionDeclaration$980 = extra$868.parseFunctionDeclaration;
            parseFunctionExpression$981 = extra$868.parseFunctionExpression;
            parseImportDeclaration$955 = extra$868.parseImportDeclaration;
            parseImportSpecifier$956 = extra$868.parseImportSpecifier;
            parseGroupExpression$923 = extra$868.parseGroupExpression;
            parseLeftHandSideExpression$932 = extra$868.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$931 = extra$868.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$951 = extra$868.parseModuleDeclaration;
            parseModuleBlock$994 = extra$868.parseModuleBlock;
            parseNewExpression$930 = extra$868.parseNewExpression;
            parseNonComputedProperty$927 = extra$868.parseNonComputedProperty;
            parseObjectInitialiser$920 = extra$868.parseObjectInitialiser;
            parseObjectProperty$919 = extra$868.parseObjectProperty;
            parseObjectPropertyKey$918 = extra$868.parseObjectPropertyKey;
            parsePostfixExpression$933 = extra$868.parsePostfixExpression;
            parsePrimaryExpression$924 = extra$868.parsePrimaryExpression;
            parseProgram$995 = extra$868.parseProgram;
            parsePropertyFunction$916 = extra$868.parsePropertyFunction;
            parseTemplateElement$921 = extra$868.parseTemplateElement;
            parseTemplateLiteral$922 = extra$868.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$926 = extra$868.parseSpreadOrAssignmentExpression;
            parseStatement$974 = extra$868.parseStatement;
            parseSwitchCase$968 = extra$868.parseSwitchCase;
            parseUnaryExpression$934 = extra$868.parseUnaryExpression;
            parseVariableDeclaration$947 = extra$868.parseVariableDeclaration;
            parseVariableIdentifier$946 = extra$868.parseVariableIdentifier;
            parseMethodDefinition$983 = extra$868.parseMethodDefinition;
            parseClassDeclaration$987 = extra$868.parseClassDeclaration;
            parseClassExpression$986 = extra$868.parseClassExpression;
            parseClassBody$985 = extra$868.parseClassBody;
        }
        if (typeof extra$868.scanRegExp === 'function') {
            advance$898 = extra$868.advance;
            scanRegExp$895 = extra$868.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1011(object$1565, properties$1566) {
        var entry$1567, result$1568 = {};
        for (entry$1567 in object$1565) {
            if (object$1565.hasOwnProperty(entry$1567)) {
                result$1568[entry$1567] = object$1565[entry$1567];
            }
        }
        for (entry$1567 in properties$1566) {
            if (properties$1566.hasOwnProperty(entry$1567)) {
                result$1568[entry$1567] = properties$1566[entry$1567];
            }
        }
        return result$1568;
    }
    function tokenize$1012(code$1569, options$1570) {
        var toString$1571, token$1572, tokens$1573;
        toString$1571 = String;
        if (typeof code$1569 !== 'string' && !(code$1569 instanceof String)) {
            code$1569 = toString$1571(code$1569);
        }
        delegate$862 = SyntaxTreeDelegate$850;
        source$852 = code$1569;
        index$854 = 0;
        lineNumber$855 = source$852.length > 0 ? 1 : 0;
        lineStart$856 = 0;
        length$861 = source$852.length;
        lookahead$865 = null;
        state$867 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$868 = {};
        // Options matching.
        options$1570 = options$1570 || {};
        // Of course we collect tokens here.
        options$1570.tokens = true;
        extra$868.tokens = [];
        extra$868.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$868.openParenToken = -1;
        extra$868.openCurlyToken = -1;
        extra$868.range = typeof options$1570.range === 'boolean' && options$1570.range;
        extra$868.loc = typeof options$1570.loc === 'boolean' && options$1570.loc;
        if (typeof options$1570.comment === 'boolean' && options$1570.comment) {
            extra$868.comments = [];
        }
        if (typeof options$1570.tolerant === 'boolean' && options$1570.tolerant) {
            extra$868.errors = [];
        }
        if (length$861 > 0) {
            if (typeof source$852[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1569 instanceof String) {
                    source$852 = code$1569.valueOf();
                }
            }
        }
        patch$1009();
        try {
            peek$900();
            if (lookahead$865.type === Token$843.EOF) {
                return extra$868.tokens;
            }
            token$1572 = lex$899();
            while (lookahead$865.type !== Token$843.EOF) {
                try {
                    token$1572 = lex$899();
                } catch (lexError$1574) {
                    token$1572 = lookahead$865;
                    if (extra$868.errors) {
                        extra$868.errors.push(lexError$1574);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1574;
                    }
                }
            }
            filterTokenLocation$1001();
            tokens$1573 = extra$868.tokens;
            if (typeof extra$868.comments !== 'undefined') {
                filterCommentLocation$998();
                tokens$1573.comments = extra$868.comments;
            }
            if (typeof extra$868.errors !== 'undefined') {
                tokens$1573.errors = extra$868.errors;
            }
        } catch (e$1575) {
            throw e$1575;
        } finally {
            unpatch$1010();
            extra$868 = {};
        }
        return tokens$1573;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1013(toks$1576, start$1577, inExprDelim$1578, parentIsBlock$1579) {
        var assignOps$1580 = [
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
        var binaryOps$1581 = [
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
        var unaryOps$1582 = [
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
        function back$1583(n$1584) {
            var idx$1585 = toks$1576.length - n$1584 > 0 ? toks$1576.length - n$1584 : 0;
            return toks$1576[idx$1585];
        }
        if (inExprDelim$1578 && toks$1576.length - (start$1577 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1583(start$1577 + 2).value === ':' && parentIsBlock$1579) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$870(back$1583(start$1577 + 2).value, unaryOps$1582.concat(binaryOps$1581).concat(assignOps$1580))) {
            // ... + {...}
            return false;
        } else if (back$1583(start$1577 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1586 = typeof back$1583(start$1577 + 1).startLineNumber !== 'undefined' ? back$1583(start$1577 + 1).startLineNumber : back$1583(start$1577 + 1).lineNumber;
            if (back$1583(start$1577 + 2).lineNumber !== currLineNumber$1586) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$870(back$1583(start$1577 + 2).value, [
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
    function readToken$1014(toks$1587, inExprDelim$1588, parentIsBlock$1589) {
        var delimiters$1590 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1591 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1592 = toks$1587.length - 1;
        var comments$1593, commentsLen$1594 = extra$868.comments.length;
        function back$1595(n$1599) {
            var idx$1600 = toks$1587.length - n$1599 > 0 ? toks$1587.length - n$1599 : 0;
            return toks$1587[idx$1600];
        }
        function attachComments$1596(token$1601) {
            if (comments$1593) {
                token$1601.leadingComments = comments$1593;
            }
            return token$1601;
        }
        function _advance$1597() {
            return attachComments$1596(advance$898());
        }
        function _scanRegExp$1598() {
            return attachComments$1596(scanRegExp$895());
        }
        skipComment$882();
        if (extra$868.comments.length > commentsLen$1594) {
            comments$1593 = extra$868.comments.slice(commentsLen$1594);
        }
        if (isIn$870(source$852[index$854], delimiters$1590)) {
            return attachComments$1596(readDelim$1015(toks$1587, inExprDelim$1588, parentIsBlock$1589));
        }
        if (source$852[index$854] === '/') {
            var prev$1602 = back$1595(1);
            if (prev$1602) {
                if (prev$1602.value === '()') {
                    if (isIn$870(back$1595(2).value, parenIdents$1591)) {
                        // ... if (...) / ...
                        return _scanRegExp$1598();
                    }
                    // ... (...) / ...
                    return _advance$1597();
                }
                if (prev$1602.value === '{}') {
                    if (blockAllowed$1013(toks$1587, 0, inExprDelim$1588, parentIsBlock$1589)) {
                        if (back$1595(2).value === '()') {
                            // named function
                            if (back$1595(4).value === 'function') {
                                if (!blockAllowed$1013(toks$1587, 3, inExprDelim$1588, parentIsBlock$1589)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1597();
                                }
                                if (toks$1587.length - 5 <= 0 && inExprDelim$1588) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1597();
                                }
                            }
                            // unnamed function
                            if (back$1595(3).value === 'function') {
                                if (!blockAllowed$1013(toks$1587, 2, inExprDelim$1588, parentIsBlock$1589)) {
                                    // new function (...) {...} / ...
                                    return _advance$1597();
                                }
                                if (toks$1587.length - 4 <= 0 && inExprDelim$1588) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1597();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1598();
                    } else {
                        // ... + {...} / ...
                        return _advance$1597();
                    }
                }
                if (prev$1602.type === Token$843.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1598();
                }
                if (isKeyword$881(prev$1602.value)) {
                    // typeof /...
                    return _scanRegExp$1598();
                }
                return _advance$1597();
            }
            return _scanRegExp$1598();
        }
        return _advance$1597();
    }
    function readDelim$1015(toks$1603, inExprDelim$1604, parentIsBlock$1605) {
        var startDelim$1606 = advance$898(), matchDelim$1607 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1608 = [];
        var delimiters$1609 = [
                '(',
                '{',
                '['
            ];
        assert$869(delimiters$1609.indexOf(startDelim$1606.value) !== -1, 'Need to begin at the delimiter');
        var token$1610 = startDelim$1606;
        var startLineNumber$1611 = token$1610.lineNumber;
        var startLineStart$1612 = token$1610.lineStart;
        var startRange$1613 = token$1610.range;
        var delimToken$1614 = {};
        delimToken$1614.type = Token$843.Delimiter;
        delimToken$1614.value = startDelim$1606.value + matchDelim$1607[startDelim$1606.value];
        delimToken$1614.startLineNumber = startLineNumber$1611;
        delimToken$1614.startLineStart = startLineStart$1612;
        delimToken$1614.startRange = startRange$1613;
        var delimIsBlock$1615 = false;
        if (startDelim$1606.value === '{') {
            delimIsBlock$1615 = blockAllowed$1013(toks$1603.concat(delimToken$1614), 0, inExprDelim$1604, parentIsBlock$1605);
        }
        while (index$854 <= length$861) {
            token$1610 = readToken$1014(inner$1608, startDelim$1606.value === '(' || startDelim$1606.value === '[', delimIsBlock$1615);
            if (token$1610.type === Token$843.Punctuator && token$1610.value === matchDelim$1607[startDelim$1606.value]) {
                if (token$1610.leadingComments) {
                    delimToken$1614.trailingComments = token$1610.leadingComments;
                }
                break;
            } else if (token$1610.type === Token$843.EOF) {
                throwError$903({}, Messages$848.UnexpectedEOS);
            } else {
                inner$1608.push(token$1610);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$854 >= length$861 && matchDelim$1607[startDelim$1606.value] !== source$852[length$861 - 1]) {
            throwError$903({}, Messages$848.UnexpectedEOS);
        }
        var endLineNumber$1616 = token$1610.lineNumber;
        var endLineStart$1617 = token$1610.lineStart;
        var endRange$1618 = token$1610.range;
        delimToken$1614.inner = inner$1608;
        delimToken$1614.endLineNumber = endLineNumber$1616;
        delimToken$1614.endLineStart = endLineStart$1617;
        delimToken$1614.endRange = endRange$1618;
        return delimToken$1614;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$1016(code$1619) {
        var token$1620, tokenTree$1621 = [];
        extra$868 = {};
        extra$868.comments = [];
        patch$1009();
        source$852 = code$1619;
        index$854 = 0;
        lineNumber$855 = source$852.length > 0 ? 1 : 0;
        lineStart$856 = 0;
        length$861 = source$852.length;
        state$867 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$854 < length$861) {
            tokenTree$1621.push(readToken$1014(tokenTree$1621, false, false));
        }
        var last$1622 = tokenTree$1621[tokenTree$1621.length - 1];
        if (last$1622 && last$1622.type !== Token$843.EOF) {
            tokenTree$1621.push({
                type: Token$843.EOF,
                value: '',
                lineNumber: last$1622.lineNumber,
                lineStart: last$1622.lineStart,
                range: [
                    index$854,
                    index$854
                ]
            });
        }
        return expander$842.tokensToSyntax(tokenTree$1621);
    }
    function parse$1017(code$1623, options$1624) {
        var program$1625, toString$1626;
        extra$868 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1623)) {
            tokenStream$863 = code$1623;
            length$861 = tokenStream$863.length;
            lineNumber$855 = tokenStream$863.length > 0 ? 1 : 0;
            source$852 = undefined;
        } else {
            toString$1626 = String;
            if (typeof code$1623 !== 'string' && !(code$1623 instanceof String)) {
                code$1623 = toString$1626(code$1623);
            }
            source$852 = code$1623;
            length$861 = source$852.length;
            lineNumber$855 = source$852.length > 0 ? 1 : 0;
        }
        delegate$862 = SyntaxTreeDelegate$850;
        streamIndex$864 = -1;
        index$854 = 0;
        lineStart$856 = 0;
        sm_lineStart$858 = 0;
        sm_lineNumber$857 = lineNumber$855;
        sm_index$860 = 0;
        sm_range$859 = [
            0,
            0
        ];
        lookahead$865 = null;
        state$867 = {
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
        if (typeof options$1624 !== 'undefined') {
            extra$868.range = typeof options$1624.range === 'boolean' && options$1624.range;
            extra$868.loc = typeof options$1624.loc === 'boolean' && options$1624.loc;
            if (extra$868.loc && options$1624.source !== null && options$1624.source !== undefined) {
                delegate$862 = extend$1011(delegate$862, {
                    'postProcess': function (node$1627) {
                        node$1627.loc.source = toString$1626(options$1624.source);
                        return node$1627;
                    }
                });
            }
            if (typeof options$1624.tokens === 'boolean' && options$1624.tokens) {
                extra$868.tokens = [];
            }
            if (typeof options$1624.comment === 'boolean' && options$1624.comment) {
                extra$868.comments = [];
            }
            if (typeof options$1624.tolerant === 'boolean' && options$1624.tolerant) {
                extra$868.errors = [];
            }
        }
        if (length$861 > 0) {
            if (source$852 && typeof source$852[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1623 instanceof String) {
                    source$852 = code$1623.valueOf();
                }
            }
        }
        extra$868 = { loc: true };
        patch$1009();
        try {
            program$1625 = parseProgram$995();
            if (typeof extra$868.comments !== 'undefined') {
                filterCommentLocation$998();
                program$1625.comments = extra$868.comments;
            }
            if (typeof extra$868.tokens !== 'undefined') {
                filterTokenLocation$1001();
                program$1625.tokens = extra$868.tokens;
            }
            if (typeof extra$868.errors !== 'undefined') {
                program$1625.errors = extra$868.errors;
            }
            if (extra$868.range || extra$868.loc) {
                program$1625.body = filterGroup$1007(program$1625.body);
            }
        } catch (e$1628) {
            throw e$1628;
        } finally {
            unpatch$1010();
            extra$868 = {};
        }
        return program$1625;
    }
    exports$841.tokenize = tokenize$1012;
    exports$841.read = read$1016;
    exports$841.Token = Token$843;
    exports$841.parse = parse$1017;
    // Deep copy.
    exports$841.Syntax = function () {
        var name$1629, types$1630 = {};
        if (typeof Object.create === 'function') {
            types$1630 = Object.create(null);
        }
        for (name$1629 in Syntax$846) {
            if (Syntax$846.hasOwnProperty(name$1629)) {
                types$1630[name$1629] = Syntax$846[name$1629];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1630);
        }
        return types$1630;
    }();
}));
//# sourceMappingURL=parser.js.map