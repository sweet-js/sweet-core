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
(function (root$850, factory$851) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$851);
    } else if (typeof exports !== 'undefined') {
        factory$851(exports, require('./expander'));
    } else {
        factory$851(root$850.esprima = {});
    }
}(this, function (exports$852, expander$853) {
    'use strict';
    var Token$854, TokenName$855, FnExprTokens$856, Syntax$857, PropertyKind$858, Messages$859, Regex$860, SyntaxTreeDelegate$861, ClassPropertyType$862, source$863, strict$864, index$865, lineNumber$866, lineStart$867, sm_lineNumber$868, sm_lineStart$869, sm_range$870, sm_index$871, length$872, delegate$873, tokenStream$874, streamIndex$875, lookahead$876, lookaheadIndex$877, state$878, extra$879;
    Token$854 = {
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
    TokenName$855 = {};
    TokenName$855[Token$854.BooleanLiteral] = 'Boolean';
    TokenName$855[Token$854.EOF] = '<end>';
    TokenName$855[Token$854.Identifier] = 'Identifier';
    TokenName$855[Token$854.Keyword] = 'Keyword';
    TokenName$855[Token$854.NullLiteral] = 'Null';
    TokenName$855[Token$854.NumericLiteral] = 'Numeric';
    TokenName$855[Token$854.Punctuator] = 'Punctuator';
    TokenName$855[Token$854.StringLiteral] = 'String';
    TokenName$855[Token$854.RegularExpression] = 'RegularExpression';
    TokenName$855[Token$854.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$856 = [
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
    Syntax$857 = {
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
    PropertyKind$858 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$862 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$859 = {
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
    Regex$860 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$880(condition$1029, message$1030) {
        if (!condition$1029) {
            throw new Error('ASSERT: ' + message$1030);
        }
    }
    function isIn$881(el$1031, list$1032) {
        return list$1032.indexOf(el$1031) !== -1;
    }
    function isDecimalDigit$882(ch$1033) {
        return ch$1033 >= 48 && ch$1033 <= 57;
    }    // 0..9
    function isHexDigit$883(ch$1034) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1034) >= 0;
    }
    function isOctalDigit$884(ch$1035) {
        return '01234567'.indexOf(ch$1035) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$885(ch$1036) {
        return ch$1036 === 32 || ch$1036 === 9 || ch$1036 === 11 || ch$1036 === 12 || ch$1036 === 160 || ch$1036 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1036)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$886(ch$1037) {
        return ch$1037 === 10 || ch$1037 === 13 || ch$1037 === 8232 || ch$1037 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$887(ch$1038) {
        return ch$1038 === 36 || ch$1038 === 95 || ch$1038 >= 65 && ch$1038 <= 90 || ch$1038 >= 97 && ch$1038 <= 122 || ch$1038 === 92 || ch$1038 >= 128 && Regex$860.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1038));
    }
    function isIdentifierPart$888(ch$1039) {
        return ch$1039 === 36 || ch$1039 === 95 || ch$1039 >= 65 && ch$1039 <= 90 || ch$1039 >= 97 && ch$1039 <= 122 || ch$1039 >= 48 && ch$1039 <= 57 || ch$1039 === 92 || ch$1039 >= 128 && Regex$860.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1039));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$889(id$1040) {
        switch (id$1040) {
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
    function isStrictModeReservedWord$890(id$1041) {
        switch (id$1041) {
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
    function isRestrictedWord$891(id$1042) {
        return id$1042 === 'eval' || id$1042 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$892(id$1043) {
        if (strict$864 && isStrictModeReservedWord$890(id$1043)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1043.length) {
        case 2:
            return id$1043 === 'if' || id$1043 === 'in' || id$1043 === 'do';
        case 3:
            return id$1043 === 'var' || id$1043 === 'for' || id$1043 === 'new' || id$1043 === 'try' || id$1043 === 'let';
        case 4:
            return id$1043 === 'this' || id$1043 === 'else' || id$1043 === 'case' || id$1043 === 'void' || id$1043 === 'with' || id$1043 === 'enum';
        case 5:
            return id$1043 === 'while' || id$1043 === 'break' || id$1043 === 'catch' || id$1043 === 'throw' || id$1043 === 'const' || id$1043 === 'yield' || id$1043 === 'class' || id$1043 === 'super';
        case 6:
            return id$1043 === 'return' || id$1043 === 'typeof' || id$1043 === 'delete' || id$1043 === 'switch' || id$1043 === 'export' || id$1043 === 'import';
        case 7:
            return id$1043 === 'default' || id$1043 === 'finally' || id$1043 === 'extends';
        case 8:
            return id$1043 === 'function' || id$1043 === 'continue' || id$1043 === 'debugger';
        case 10:
            return id$1043 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$893() {
        var ch$1044, blockComment$1045, lineComment$1046;
        blockComment$1045 = false;
        lineComment$1046 = false;
        while (index$865 < length$872) {
            ch$1044 = source$863.charCodeAt(index$865);
            if (lineComment$1046) {
                ++index$865;
                if (isLineTerminator$886(ch$1044)) {
                    lineComment$1046 = false;
                    if (ch$1044 === 13 && source$863.charCodeAt(index$865) === 10) {
                        ++index$865;
                    }
                    ++lineNumber$866;
                    lineStart$867 = index$865;
                }
            } else if (blockComment$1045) {
                if (isLineTerminator$886(ch$1044)) {
                    if (ch$1044 === 13 && source$863.charCodeAt(index$865 + 1) === 10) {
                        ++index$865;
                    }
                    ++lineNumber$866;
                    ++index$865;
                    lineStart$867 = index$865;
                    if (index$865 >= length$872) {
                        throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1044 = source$863.charCodeAt(index$865++);
                    if (index$865 >= length$872) {
                        throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1044 === 42) {
                        ch$1044 = source$863.charCodeAt(index$865);
                        if (ch$1044 === 47) {
                            ++index$865;
                            blockComment$1045 = false;
                        }
                    }
                }
            } else if (ch$1044 === 47) {
                ch$1044 = source$863.charCodeAt(index$865 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1044 === 47) {
                    index$865 += 2;
                    lineComment$1046 = true;
                } else if (ch$1044 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$865 += 2;
                    blockComment$1045 = true;
                    if (index$865 >= length$872) {
                        throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$885(ch$1044)) {
                ++index$865;
            } else if (isLineTerminator$886(ch$1044)) {
                ++index$865;
                if (ch$1044 === 13 && source$863.charCodeAt(index$865) === 10) {
                    ++index$865;
                }
                ++lineNumber$866;
                lineStart$867 = index$865;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$894(prefix$1047) {
        var i$1048, len$1049, ch$1050, code$1051 = 0;
        len$1049 = prefix$1047 === 'u' ? 4 : 2;
        for (i$1048 = 0; i$1048 < len$1049; ++i$1048) {
            if (index$865 < length$872 && isHexDigit$883(source$863[index$865])) {
                ch$1050 = source$863[index$865++];
                code$1051 = code$1051 * 16 + '0123456789abcdef'.indexOf(ch$1050.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1051);
    }
    function scanUnicodeCodePointEscape$895() {
        var ch$1052, code$1053, cu1$1054, cu2$1055;
        ch$1052 = source$863[index$865];
        code$1053 = 0;
        // At least, one hex digit is required.
        if (ch$1052 === '}') {
            throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
        }
        while (index$865 < length$872) {
            ch$1052 = source$863[index$865++];
            if (!isHexDigit$883(ch$1052)) {
                break;
            }
            code$1053 = code$1053 * 16 + '0123456789abcdef'.indexOf(ch$1052.toLowerCase());
        }
        if (code$1053 > 1114111 || ch$1052 !== '}') {
            throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1053 <= 65535) {
            return String.fromCharCode(code$1053);
        }
        cu1$1054 = (code$1053 - 65536 >> 10) + 55296;
        cu2$1055 = (code$1053 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1054, cu2$1055);
    }
    function getEscapedIdentifier$896() {
        var ch$1056, id$1057;
        ch$1056 = source$863.charCodeAt(index$865++);
        id$1057 = String.fromCharCode(ch$1056);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1056 === 92) {
            if (source$863.charCodeAt(index$865) !== 117) {
                throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
            }
            ++index$865;
            ch$1056 = scanHexEscape$894('u');
            if (!ch$1056 || ch$1056 === '\\' || !isIdentifierStart$887(ch$1056.charCodeAt(0))) {
                throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
            }
            id$1057 = ch$1056;
        }
        while (index$865 < length$872) {
            ch$1056 = source$863.charCodeAt(index$865);
            if (!isIdentifierPart$888(ch$1056)) {
                break;
            }
            ++index$865;
            id$1057 += String.fromCharCode(ch$1056);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1056 === 92) {
                id$1057 = id$1057.substr(0, id$1057.length - 1);
                if (source$863.charCodeAt(index$865) !== 117) {
                    throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
                }
                ++index$865;
                ch$1056 = scanHexEscape$894('u');
                if (!ch$1056 || ch$1056 === '\\' || !isIdentifierPart$888(ch$1056.charCodeAt(0))) {
                    throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
                }
                id$1057 += ch$1056;
            }
        }
        return id$1057;
    }
    function getIdentifier$897() {
        var start$1058, ch$1059;
        start$1058 = index$865++;
        while (index$865 < length$872) {
            ch$1059 = source$863.charCodeAt(index$865);
            if (ch$1059 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$865 = start$1058;
                return getEscapedIdentifier$896();
            }
            if (isIdentifierPart$888(ch$1059)) {
                ++index$865;
            } else {
                break;
            }
        }
        return source$863.slice(start$1058, index$865);
    }
    function scanIdentifier$898() {
        var start$1060, id$1061, type$1062;
        start$1060 = index$865;
        // Backslash (char #92) starts an escaped character.
        id$1061 = source$863.charCodeAt(index$865) === 92 ? getEscapedIdentifier$896() : getIdentifier$897();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1061.length === 1) {
            type$1062 = Token$854.Identifier;
        } else if (isKeyword$892(id$1061)) {
            type$1062 = Token$854.Keyword;
        } else if (id$1061 === 'null') {
            type$1062 = Token$854.NullLiteral;
        } else if (id$1061 === 'true' || id$1061 === 'false') {
            type$1062 = Token$854.BooleanLiteral;
        } else {
            type$1062 = Token$854.Identifier;
        }
        return {
            type: type$1062,
            value: id$1061,
            lineNumber: lineNumber$866,
            lineStart: lineStart$867,
            range: [
                start$1060,
                index$865
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$899() {
        var start$1063 = index$865, code$1064 = source$863.charCodeAt(index$865), code2$1065, ch1$1066 = source$863[index$865], ch2$1067, ch3$1068, ch4$1069;
        switch (code$1064) {
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
            ++index$865;
            if (extra$879.tokenize) {
                if (code$1064 === 40) {
                    extra$879.openParenToken = extra$879.tokens.length;
                } else if (code$1064 === 123) {
                    extra$879.openCurlyToken = extra$879.tokens.length;
                }
            }
            return {
                type: Token$854.Punctuator,
                value: String.fromCharCode(code$1064),
                lineNumber: lineNumber$866,
                lineStart: lineStart$867,
                range: [
                    start$1063,
                    index$865
                ]
            };
        default:
            code2$1065 = source$863.charCodeAt(index$865 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1065 === 61) {
                switch (code$1064) {
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
                    index$865 += 2;
                    return {
                        type: Token$854.Punctuator,
                        value: String.fromCharCode(code$1064) + String.fromCharCode(code2$1065),
                        lineNumber: lineNumber$866,
                        lineStart: lineStart$867,
                        range: [
                            start$1063,
                            index$865
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$865 += 2;
                    // !== and ===
                    if (source$863.charCodeAt(index$865) === 61) {
                        ++index$865;
                    }
                    return {
                        type: Token$854.Punctuator,
                        value: source$863.slice(start$1063, index$865),
                        lineNumber: lineNumber$866,
                        lineStart: lineStart$867,
                        range: [
                            start$1063,
                            index$865
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1067 = source$863[index$865 + 1];
        ch3$1068 = source$863[index$865 + 2];
        ch4$1069 = source$863[index$865 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1066 === '>' && ch2$1067 === '>' && ch3$1068 === '>') {
            if (ch4$1069 === '=') {
                index$865 += 4;
                return {
                    type: Token$854.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$866,
                    lineStart: lineStart$867,
                    range: [
                        start$1063,
                        index$865
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1066 === '>' && ch2$1067 === '>' && ch3$1068 === '>') {
            index$865 += 3;
            return {
                type: Token$854.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$866,
                lineStart: lineStart$867,
                range: [
                    start$1063,
                    index$865
                ]
            };
        }
        if (ch1$1066 === '<' && ch2$1067 === '<' && ch3$1068 === '=') {
            index$865 += 3;
            return {
                type: Token$854.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$866,
                lineStart: lineStart$867,
                range: [
                    start$1063,
                    index$865
                ]
            };
        }
        if (ch1$1066 === '>' && ch2$1067 === '>' && ch3$1068 === '=') {
            index$865 += 3;
            return {
                type: Token$854.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$866,
                lineStart: lineStart$867,
                range: [
                    start$1063,
                    index$865
                ]
            };
        }
        if (ch1$1066 === '.' && ch2$1067 === '.' && ch3$1068 === '.') {
            index$865 += 3;
            return {
                type: Token$854.Punctuator,
                value: '...',
                lineNumber: lineNumber$866,
                lineStart: lineStart$867,
                range: [
                    start$1063,
                    index$865
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1066 === ch2$1067 && '+-<>&|'.indexOf(ch1$1066) >= 0) {
            index$865 += 2;
            return {
                type: Token$854.Punctuator,
                value: ch1$1066 + ch2$1067,
                lineNumber: lineNumber$866,
                lineStart: lineStart$867,
                range: [
                    start$1063,
                    index$865
                ]
            };
        }
        if (ch1$1066 === '=' && ch2$1067 === '>') {
            index$865 += 2;
            return {
                type: Token$854.Punctuator,
                value: '=>',
                lineNumber: lineNumber$866,
                lineStart: lineStart$867,
                range: [
                    start$1063,
                    index$865
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1066) >= 0) {
            ++index$865;
            return {
                type: Token$854.Punctuator,
                value: ch1$1066,
                lineNumber: lineNumber$866,
                lineStart: lineStart$867,
                range: [
                    start$1063,
                    index$865
                ]
            };
        }
        if (ch1$1066 === '.') {
            ++index$865;
            return {
                type: Token$854.Punctuator,
                value: ch1$1066,
                lineNumber: lineNumber$866,
                lineStart: lineStart$867,
                range: [
                    start$1063,
                    index$865
                ]
            };
        }
        throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$900(start$1070) {
        var number$1071 = '';
        while (index$865 < length$872) {
            if (!isHexDigit$883(source$863[index$865])) {
                break;
            }
            number$1071 += source$863[index$865++];
        }
        if (number$1071.length === 0) {
            throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$887(source$863.charCodeAt(index$865))) {
            throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$854.NumericLiteral,
            value: parseInt('0x' + number$1071, 16),
            lineNumber: lineNumber$866,
            lineStart: lineStart$867,
            range: [
                start$1070,
                index$865
            ]
        };
    }
    function scanOctalLiteral$901(prefix$1072, start$1073) {
        var number$1074, octal$1075;
        if (isOctalDigit$884(prefix$1072)) {
            octal$1075 = true;
            number$1074 = '0' + source$863[index$865++];
        } else {
            octal$1075 = false;
            ++index$865;
            number$1074 = '';
        }
        while (index$865 < length$872) {
            if (!isOctalDigit$884(source$863[index$865])) {
                break;
            }
            number$1074 += source$863[index$865++];
        }
        if (!octal$1075 && number$1074.length === 0) {
            // only 0o or 0O
            throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$887(source$863.charCodeAt(index$865)) || isDecimalDigit$882(source$863.charCodeAt(index$865))) {
            throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$854.NumericLiteral,
            value: parseInt(number$1074, 8),
            octal: octal$1075,
            lineNumber: lineNumber$866,
            lineStart: lineStart$867,
            range: [
                start$1073,
                index$865
            ]
        };
    }
    function scanNumericLiteral$902() {
        var number$1076, start$1077, ch$1078, octal$1079;
        ch$1078 = source$863[index$865];
        assert$880(isDecimalDigit$882(ch$1078.charCodeAt(0)) || ch$1078 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1077 = index$865;
        number$1076 = '';
        if (ch$1078 !== '.') {
            number$1076 = source$863[index$865++];
            ch$1078 = source$863[index$865];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1076 === '0') {
                if (ch$1078 === 'x' || ch$1078 === 'X') {
                    ++index$865;
                    return scanHexLiteral$900(start$1077);
                }
                if (ch$1078 === 'b' || ch$1078 === 'B') {
                    ++index$865;
                    number$1076 = '';
                    while (index$865 < length$872) {
                        ch$1078 = source$863[index$865];
                        if (ch$1078 !== '0' && ch$1078 !== '1') {
                            break;
                        }
                        number$1076 += source$863[index$865++];
                    }
                    if (number$1076.length === 0) {
                        // only 0b or 0B
                        throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$865 < length$872) {
                        ch$1078 = source$863.charCodeAt(index$865);
                        if (isIdentifierStart$887(ch$1078) || isDecimalDigit$882(ch$1078)) {
                            throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$854.NumericLiteral,
                        value: parseInt(number$1076, 2),
                        lineNumber: lineNumber$866,
                        lineStart: lineStart$867,
                        range: [
                            start$1077,
                            index$865
                        ]
                    };
                }
                if (ch$1078 === 'o' || ch$1078 === 'O' || isOctalDigit$884(ch$1078)) {
                    return scanOctalLiteral$901(ch$1078, start$1077);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1078 && isDecimalDigit$882(ch$1078.charCodeAt(0))) {
                    throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$882(source$863.charCodeAt(index$865))) {
                number$1076 += source$863[index$865++];
            }
            ch$1078 = source$863[index$865];
        }
        if (ch$1078 === '.') {
            number$1076 += source$863[index$865++];
            while (isDecimalDigit$882(source$863.charCodeAt(index$865))) {
                number$1076 += source$863[index$865++];
            }
            ch$1078 = source$863[index$865];
        }
        if (ch$1078 === 'e' || ch$1078 === 'E') {
            number$1076 += source$863[index$865++];
            ch$1078 = source$863[index$865];
            if (ch$1078 === '+' || ch$1078 === '-') {
                number$1076 += source$863[index$865++];
            }
            if (isDecimalDigit$882(source$863.charCodeAt(index$865))) {
                while (isDecimalDigit$882(source$863.charCodeAt(index$865))) {
                    number$1076 += source$863[index$865++];
                }
            } else {
                throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$887(source$863.charCodeAt(index$865))) {
            throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$854.NumericLiteral,
            value: parseFloat(number$1076),
            lineNumber: lineNumber$866,
            lineStart: lineStart$867,
            range: [
                start$1077,
                index$865
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$903() {
        var str$1080 = '', quote$1081, start$1082, ch$1083, code$1084, unescaped$1085, restore$1086, octal$1087 = false;
        quote$1081 = source$863[index$865];
        assert$880(quote$1081 === '\'' || quote$1081 === '"', 'String literal must starts with a quote');
        start$1082 = index$865;
        ++index$865;
        while (index$865 < length$872) {
            ch$1083 = source$863[index$865++];
            if (ch$1083 === quote$1081) {
                quote$1081 = '';
                break;
            } else if (ch$1083 === '\\') {
                ch$1083 = source$863[index$865++];
                if (!ch$1083 || !isLineTerminator$886(ch$1083.charCodeAt(0))) {
                    switch (ch$1083) {
                    case 'n':
                        str$1080 += '\n';
                        break;
                    case 'r':
                        str$1080 += '\r';
                        break;
                    case 't':
                        str$1080 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$863[index$865] === '{') {
                            ++index$865;
                            str$1080 += scanUnicodeCodePointEscape$895();
                        } else {
                            restore$1086 = index$865;
                            unescaped$1085 = scanHexEscape$894(ch$1083);
                            if (unescaped$1085) {
                                str$1080 += unescaped$1085;
                            } else {
                                index$865 = restore$1086;
                                str$1080 += ch$1083;
                            }
                        }
                        break;
                    case 'b':
                        str$1080 += '\b';
                        break;
                    case 'f':
                        str$1080 += '\f';
                        break;
                    case 'v':
                        str$1080 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$884(ch$1083)) {
                            code$1084 = '01234567'.indexOf(ch$1083);
                            // \0 is not octal escape sequence
                            if (code$1084 !== 0) {
                                octal$1087 = true;
                            }
                            if (index$865 < length$872 && isOctalDigit$884(source$863[index$865])) {
                                octal$1087 = true;
                                code$1084 = code$1084 * 8 + '01234567'.indexOf(source$863[index$865++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1083) >= 0 && index$865 < length$872 && isOctalDigit$884(source$863[index$865])) {
                                    code$1084 = code$1084 * 8 + '01234567'.indexOf(source$863[index$865++]);
                                }
                            }
                            str$1080 += String.fromCharCode(code$1084);
                        } else {
                            str$1080 += ch$1083;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$866;
                    if (ch$1083 === '\r' && source$863[index$865] === '\n') {
                        ++index$865;
                    }
                }
            } else if (isLineTerminator$886(ch$1083.charCodeAt(0))) {
                break;
            } else {
                str$1080 += ch$1083;
            }
        }
        if (quote$1081 !== '') {
            throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$854.StringLiteral,
            value: str$1080,
            octal: octal$1087,
            lineNumber: lineNumber$866,
            lineStart: lineStart$867,
            range: [
                start$1082,
                index$865
            ]
        };
    }
    function scanTemplate$904() {
        var cooked$1088 = '', ch$1089, start$1090, terminated$1091, tail$1092, restore$1093, unescaped$1094, code$1095, octal$1096;
        terminated$1091 = false;
        tail$1092 = false;
        start$1090 = index$865;
        ++index$865;
        while (index$865 < length$872) {
            ch$1089 = source$863[index$865++];
            if (ch$1089 === '`') {
                tail$1092 = true;
                terminated$1091 = true;
                break;
            } else if (ch$1089 === '$') {
                if (source$863[index$865] === '{') {
                    ++index$865;
                    terminated$1091 = true;
                    break;
                }
                cooked$1088 += ch$1089;
            } else if (ch$1089 === '\\') {
                ch$1089 = source$863[index$865++];
                if (!isLineTerminator$886(ch$1089.charCodeAt(0))) {
                    switch (ch$1089) {
                    case 'n':
                        cooked$1088 += '\n';
                        break;
                    case 'r':
                        cooked$1088 += '\r';
                        break;
                    case 't':
                        cooked$1088 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$863[index$865] === '{') {
                            ++index$865;
                            cooked$1088 += scanUnicodeCodePointEscape$895();
                        } else {
                            restore$1093 = index$865;
                            unescaped$1094 = scanHexEscape$894(ch$1089);
                            if (unescaped$1094) {
                                cooked$1088 += unescaped$1094;
                            } else {
                                index$865 = restore$1093;
                                cooked$1088 += ch$1089;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1088 += '\b';
                        break;
                    case 'f':
                        cooked$1088 += '\f';
                        break;
                    case 'v':
                        cooked$1088 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$884(ch$1089)) {
                            code$1095 = '01234567'.indexOf(ch$1089);
                            // \0 is not octal escape sequence
                            if (code$1095 !== 0) {
                                octal$1096 = true;
                            }
                            if (index$865 < length$872 && isOctalDigit$884(source$863[index$865])) {
                                octal$1096 = true;
                                code$1095 = code$1095 * 8 + '01234567'.indexOf(source$863[index$865++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1089) >= 0 && index$865 < length$872 && isOctalDigit$884(source$863[index$865])) {
                                    code$1095 = code$1095 * 8 + '01234567'.indexOf(source$863[index$865++]);
                                }
                            }
                            cooked$1088 += String.fromCharCode(code$1095);
                        } else {
                            cooked$1088 += ch$1089;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$866;
                    if (ch$1089 === '\r' && source$863[index$865] === '\n') {
                        ++index$865;
                    }
                }
            } else if (isLineTerminator$886(ch$1089.charCodeAt(0))) {
                ++lineNumber$866;
                if (ch$1089 === '\r' && source$863[index$865] === '\n') {
                    ++index$865;
                }
                cooked$1088 += '\n';
            } else {
                cooked$1088 += ch$1089;
            }
        }
        if (!terminated$1091) {
            throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$854.Template,
            value: {
                cooked: cooked$1088,
                raw: source$863.slice(start$1090 + 1, index$865 - (tail$1092 ? 1 : 2))
            },
            tail: tail$1092,
            octal: octal$1096,
            lineNumber: lineNumber$866,
            lineStart: lineStart$867,
            range: [
                start$1090,
                index$865
            ]
        };
    }
    function scanTemplateElement$905(option$1097) {
        var startsWith$1098, template$1099;
        lookahead$876 = null;
        skipComment$893();
        startsWith$1098 = option$1097.head ? '`' : '}';
        if (source$863[index$865] !== startsWith$1098) {
            throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
        }
        template$1099 = scanTemplate$904();
        peek$911();
        return template$1099;
    }
    function scanRegExp$906() {
        var str$1100, ch$1101, start$1102, pattern$1103, flags$1104, value$1105, classMarker$1106 = false, restore$1107, terminated$1108 = false;
        lookahead$876 = null;
        skipComment$893();
        start$1102 = index$865;
        ch$1101 = source$863[index$865];
        assert$880(ch$1101 === '/', 'Regular expression literal must start with a slash');
        str$1100 = source$863[index$865++];
        while (index$865 < length$872) {
            ch$1101 = source$863[index$865++];
            str$1100 += ch$1101;
            if (classMarker$1106) {
                if (ch$1101 === ']') {
                    classMarker$1106 = false;
                }
            } else {
                if (ch$1101 === '\\') {
                    ch$1101 = source$863[index$865++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$886(ch$1101.charCodeAt(0))) {
                        throwError$914({}, Messages$859.UnterminatedRegExp);
                    }
                    str$1100 += ch$1101;
                } else if (ch$1101 === '/') {
                    terminated$1108 = true;
                    break;
                } else if (ch$1101 === '[') {
                    classMarker$1106 = true;
                } else if (isLineTerminator$886(ch$1101.charCodeAt(0))) {
                    throwError$914({}, Messages$859.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1108) {
            throwError$914({}, Messages$859.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1103 = str$1100.substr(1, str$1100.length - 2);
        flags$1104 = '';
        while (index$865 < length$872) {
            ch$1101 = source$863[index$865];
            if (!isIdentifierPart$888(ch$1101.charCodeAt(0))) {
                break;
            }
            ++index$865;
            if (ch$1101 === '\\' && index$865 < length$872) {
                ch$1101 = source$863[index$865];
                if (ch$1101 === 'u') {
                    ++index$865;
                    restore$1107 = index$865;
                    ch$1101 = scanHexEscape$894('u');
                    if (ch$1101) {
                        flags$1104 += ch$1101;
                        for (str$1100 += '\\u'; restore$1107 < index$865; ++restore$1107) {
                            str$1100 += source$863[restore$1107];
                        }
                    } else {
                        index$865 = restore$1107;
                        flags$1104 += 'u';
                        str$1100 += '\\u';
                    }
                } else {
                    str$1100 += '\\';
                }
            } else {
                flags$1104 += ch$1101;
                str$1100 += ch$1101;
            }
        }
        try {
            value$1105 = new RegExp(pattern$1103, flags$1104);
        } catch (e$1109) {
            throwError$914({}, Messages$859.InvalidRegExp);
        }
        // peek();
        if (extra$879.tokenize) {
            return {
                type: Token$854.RegularExpression,
                value: value$1105,
                lineNumber: lineNumber$866,
                lineStart: lineStart$867,
                range: [
                    start$1102,
                    index$865
                ]
            };
        }
        return {
            type: Token$854.RegularExpression,
            literal: str$1100,
            value: value$1105,
            range: [
                start$1102,
                index$865
            ]
        };
    }
    function isIdentifierName$907(token$1110) {
        return token$1110.type === Token$854.Identifier || token$1110.type === Token$854.Keyword || token$1110.type === Token$854.BooleanLiteral || token$1110.type === Token$854.NullLiteral;
    }
    function advanceSlash$908() {
        var prevToken$1111, checkToken$1112;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1111 = extra$879.tokens[extra$879.tokens.length - 1];
        if (!prevToken$1111) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$906();
        }
        if (prevToken$1111.type === 'Punctuator') {
            if (prevToken$1111.value === ')') {
                checkToken$1112 = extra$879.tokens[extra$879.openParenToken - 1];
                if (checkToken$1112 && checkToken$1112.type === 'Keyword' && (checkToken$1112.value === 'if' || checkToken$1112.value === 'while' || checkToken$1112.value === 'for' || checkToken$1112.value === 'with')) {
                    return scanRegExp$906();
                }
                return scanPunctuator$899();
            }
            if (prevToken$1111.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$879.tokens[extra$879.openCurlyToken - 3] && extra$879.tokens[extra$879.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1112 = extra$879.tokens[extra$879.openCurlyToken - 4];
                    if (!checkToken$1112) {
                        return scanPunctuator$899();
                    }
                } else if (extra$879.tokens[extra$879.openCurlyToken - 4] && extra$879.tokens[extra$879.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1112 = extra$879.tokens[extra$879.openCurlyToken - 5];
                    if (!checkToken$1112) {
                        return scanRegExp$906();
                    }
                } else {
                    return scanPunctuator$899();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$856.indexOf(checkToken$1112.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$899();
                }
                // It is a declaration.
                return scanRegExp$906();
            }
            return scanRegExp$906();
        }
        if (prevToken$1111.type === 'Keyword') {
            return scanRegExp$906();
        }
        return scanPunctuator$899();
    }
    function advance$909() {
        var ch$1113;
        skipComment$893();
        if (index$865 >= length$872) {
            return {
                type: Token$854.EOF,
                lineNumber: lineNumber$866,
                lineStart: lineStart$867,
                range: [
                    index$865,
                    index$865
                ]
            };
        }
        ch$1113 = source$863.charCodeAt(index$865);
        // Very common: ( and ) and ;
        if (ch$1113 === 40 || ch$1113 === 41 || ch$1113 === 58) {
            return scanPunctuator$899();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1113 === 39 || ch$1113 === 34) {
            return scanStringLiteral$903();
        }
        if (ch$1113 === 96) {
            return scanTemplate$904();
        }
        if (isIdentifierStart$887(ch$1113)) {
            return scanIdentifier$898();
        }
        // # and @ are allowed for sweet.js
        if (ch$1113 === 35 || ch$1113 === 64) {
            ++index$865;
            return {
                type: Token$854.Punctuator,
                value: String.fromCharCode(ch$1113),
                lineNumber: lineNumber$866,
                lineStart: lineStart$867,
                range: [
                    index$865 - 1,
                    index$865
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1113 === 46) {
            if (isDecimalDigit$882(source$863.charCodeAt(index$865 + 1))) {
                return scanNumericLiteral$902();
            }
            return scanPunctuator$899();
        }
        if (isDecimalDigit$882(ch$1113)) {
            return scanNumericLiteral$902();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$879.tokenize && ch$1113 === 47) {
            return advanceSlash$908();
        }
        return scanPunctuator$899();
    }
    function lex$910() {
        var token$1114;
        token$1114 = lookahead$876;
        streamIndex$875 = lookaheadIndex$877;
        lineNumber$866 = token$1114.lineNumber;
        lineStart$867 = token$1114.lineStart;
        sm_lineNumber$868 = lookahead$876.sm_lineNumber;
        sm_lineStart$869 = lookahead$876.sm_lineStart;
        sm_range$870 = lookahead$876.sm_range;
        sm_index$871 = lookahead$876.sm_range[0];
        lookahead$876 = tokenStream$874[++streamIndex$875].token;
        lookaheadIndex$877 = streamIndex$875;
        index$865 = lookahead$876.range[0];
        return token$1114;
    }
    function peek$911() {
        lookaheadIndex$877 = streamIndex$875 + 1;
        if (lookaheadIndex$877 >= length$872) {
            lookahead$876 = {
                type: Token$854.EOF,
                lineNumber: lineNumber$866,
                lineStart: lineStart$867,
                range: [
                    index$865,
                    index$865
                ]
            };
            return;
        }
        lookahead$876 = tokenStream$874[lookaheadIndex$877].token;
        index$865 = lookahead$876.range[0];
    }
    function lookahead2$912() {
        var adv$1115, pos$1116, line$1117, start$1118, result$1119;
        if (streamIndex$875 + 1 >= length$872 || streamIndex$875 + 2 >= length$872) {
            return {
                type: Token$854.EOF,
                lineNumber: lineNumber$866,
                lineStart: lineStart$867,
                range: [
                    index$865,
                    index$865
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$876 === null) {
            lookaheadIndex$877 = streamIndex$875 + 1;
            lookahead$876 = tokenStream$874[lookaheadIndex$877].token;
            index$865 = lookahead$876.range[0];
        }
        result$1119 = tokenStream$874[lookaheadIndex$877 + 1].token;
        return result$1119;
    }
    SyntaxTreeDelegate$861 = {
        name: 'SyntaxTree',
        postProcess: function (node$1120) {
            return node$1120;
        },
        createArrayExpression: function (elements$1121) {
            return {
                type: Syntax$857.ArrayExpression,
                elements: elements$1121
            };
        },
        createAssignmentExpression: function (operator$1122, left$1123, right$1124) {
            return {
                type: Syntax$857.AssignmentExpression,
                operator: operator$1122,
                left: left$1123,
                right: right$1124
            };
        },
        createBinaryExpression: function (operator$1125, left$1126, right$1127) {
            var type$1128 = operator$1125 === '||' || operator$1125 === '&&' ? Syntax$857.LogicalExpression : Syntax$857.BinaryExpression;
            return {
                type: type$1128,
                operator: operator$1125,
                left: left$1126,
                right: right$1127
            };
        },
        createBlockStatement: function (body$1129) {
            return {
                type: Syntax$857.BlockStatement,
                body: body$1129
            };
        },
        createBreakStatement: function (label$1130) {
            return {
                type: Syntax$857.BreakStatement,
                label: label$1130
            };
        },
        createCallExpression: function (callee$1131, args$1132) {
            return {
                type: Syntax$857.CallExpression,
                callee: callee$1131,
                'arguments': args$1132
            };
        },
        createCatchClause: function (param$1133, body$1134) {
            return {
                type: Syntax$857.CatchClause,
                param: param$1133,
                body: body$1134
            };
        },
        createConditionalExpression: function (test$1135, consequent$1136, alternate$1137) {
            return {
                type: Syntax$857.ConditionalExpression,
                test: test$1135,
                consequent: consequent$1136,
                alternate: alternate$1137
            };
        },
        createContinueStatement: function (label$1138) {
            return {
                type: Syntax$857.ContinueStatement,
                label: label$1138
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$857.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1139, test$1140) {
            return {
                type: Syntax$857.DoWhileStatement,
                body: body$1139,
                test: test$1140
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$857.EmptyStatement };
        },
        createExpressionStatement: function (expression$1141) {
            return {
                type: Syntax$857.ExpressionStatement,
                expression: expression$1141
            };
        },
        createForStatement: function (init$1142, test$1143, update$1144, body$1145) {
            return {
                type: Syntax$857.ForStatement,
                init: init$1142,
                test: test$1143,
                update: update$1144,
                body: body$1145
            };
        },
        createForInStatement: function (left$1146, right$1147, body$1148) {
            return {
                type: Syntax$857.ForInStatement,
                left: left$1146,
                right: right$1147,
                body: body$1148,
                each: false
            };
        },
        createForOfStatement: function (left$1149, right$1150, body$1151) {
            return {
                type: Syntax$857.ForOfStatement,
                left: left$1149,
                right: right$1150,
                body: body$1151
            };
        },
        createFunctionDeclaration: function (id$1152, params$1153, defaults$1154, body$1155, rest$1156, generator$1157, expression$1158) {
            return {
                type: Syntax$857.FunctionDeclaration,
                id: id$1152,
                params: params$1153,
                defaults: defaults$1154,
                body: body$1155,
                rest: rest$1156,
                generator: generator$1157,
                expression: expression$1158
            };
        },
        createFunctionExpression: function (id$1159, params$1160, defaults$1161, body$1162, rest$1163, generator$1164, expression$1165) {
            return {
                type: Syntax$857.FunctionExpression,
                id: id$1159,
                params: params$1160,
                defaults: defaults$1161,
                body: body$1162,
                rest: rest$1163,
                generator: generator$1164,
                expression: expression$1165
            };
        },
        createIdentifier: function (name$1166) {
            return {
                type: Syntax$857.Identifier,
                name: name$1166
            };
        },
        createIfStatement: function (test$1167, consequent$1168, alternate$1169) {
            return {
                type: Syntax$857.IfStatement,
                test: test$1167,
                consequent: consequent$1168,
                alternate: alternate$1169
            };
        },
        createLabeledStatement: function (label$1170, body$1171) {
            return {
                type: Syntax$857.LabeledStatement,
                label: label$1170,
                body: body$1171
            };
        },
        createLiteral: function (token$1172) {
            return {
                type: Syntax$857.Literal,
                value: token$1172.value,
                raw: String(token$1172.value)
            };
        },
        createMemberExpression: function (accessor$1173, object$1174, property$1175) {
            return {
                type: Syntax$857.MemberExpression,
                computed: accessor$1173 === '[',
                object: object$1174,
                property: property$1175
            };
        },
        createNewExpression: function (callee$1176, args$1177) {
            return {
                type: Syntax$857.NewExpression,
                callee: callee$1176,
                'arguments': args$1177
            };
        },
        createObjectExpression: function (properties$1178) {
            return {
                type: Syntax$857.ObjectExpression,
                properties: properties$1178
            };
        },
        createPostfixExpression: function (operator$1179, argument$1180) {
            return {
                type: Syntax$857.UpdateExpression,
                operator: operator$1179,
                argument: argument$1180,
                prefix: false
            };
        },
        createProgram: function (body$1181) {
            return {
                type: Syntax$857.Program,
                body: body$1181
            };
        },
        createProperty: function (kind$1182, key$1183, value$1184, method$1185, shorthand$1186) {
            return {
                type: Syntax$857.Property,
                key: key$1183,
                value: value$1184,
                kind: kind$1182,
                method: method$1185,
                shorthand: shorthand$1186
            };
        },
        createReturnStatement: function (argument$1187) {
            return {
                type: Syntax$857.ReturnStatement,
                argument: argument$1187
            };
        },
        createSequenceExpression: function (expressions$1188) {
            return {
                type: Syntax$857.SequenceExpression,
                expressions: expressions$1188
            };
        },
        createSwitchCase: function (test$1189, consequent$1190) {
            return {
                type: Syntax$857.SwitchCase,
                test: test$1189,
                consequent: consequent$1190
            };
        },
        createSwitchStatement: function (discriminant$1191, cases$1192) {
            return {
                type: Syntax$857.SwitchStatement,
                discriminant: discriminant$1191,
                cases: cases$1192
            };
        },
        createThisExpression: function () {
            return { type: Syntax$857.ThisExpression };
        },
        createThrowStatement: function (argument$1193) {
            return {
                type: Syntax$857.ThrowStatement,
                argument: argument$1193
            };
        },
        createTryStatement: function (block$1194, guardedHandlers$1195, handlers$1196, finalizer$1197) {
            return {
                type: Syntax$857.TryStatement,
                block: block$1194,
                guardedHandlers: guardedHandlers$1195,
                handlers: handlers$1196,
                finalizer: finalizer$1197
            };
        },
        createUnaryExpression: function (operator$1198, argument$1199) {
            if (operator$1198 === '++' || operator$1198 === '--') {
                return {
                    type: Syntax$857.UpdateExpression,
                    operator: operator$1198,
                    argument: argument$1199,
                    prefix: true
                };
            }
            return {
                type: Syntax$857.UnaryExpression,
                operator: operator$1198,
                argument: argument$1199
            };
        },
        createVariableDeclaration: function (declarations$1200, kind$1201) {
            return {
                type: Syntax$857.VariableDeclaration,
                declarations: declarations$1200,
                kind: kind$1201
            };
        },
        createVariableDeclarator: function (id$1202, init$1203) {
            return {
                type: Syntax$857.VariableDeclarator,
                id: id$1202,
                init: init$1203
            };
        },
        createWhileStatement: function (test$1204, body$1205) {
            return {
                type: Syntax$857.WhileStatement,
                test: test$1204,
                body: body$1205
            };
        },
        createWithStatement: function (object$1206, body$1207) {
            return {
                type: Syntax$857.WithStatement,
                object: object$1206,
                body: body$1207
            };
        },
        createTemplateElement: function (value$1208, tail$1209) {
            return {
                type: Syntax$857.TemplateElement,
                value: value$1208,
                tail: tail$1209
            };
        },
        createTemplateLiteral: function (quasis$1210, expressions$1211) {
            return {
                type: Syntax$857.TemplateLiteral,
                quasis: quasis$1210,
                expressions: expressions$1211
            };
        },
        createSpreadElement: function (argument$1212) {
            return {
                type: Syntax$857.SpreadElement,
                argument: argument$1212
            };
        },
        createTaggedTemplateExpression: function (tag$1213, quasi$1214) {
            return {
                type: Syntax$857.TaggedTemplateExpression,
                tag: tag$1213,
                quasi: quasi$1214
            };
        },
        createArrowFunctionExpression: function (params$1215, defaults$1216, body$1217, rest$1218, expression$1219) {
            return {
                type: Syntax$857.ArrowFunctionExpression,
                id: null,
                params: params$1215,
                defaults: defaults$1216,
                body: body$1217,
                rest: rest$1218,
                generator: false,
                expression: expression$1219
            };
        },
        createMethodDefinition: function (propertyType$1220, kind$1221, key$1222, value$1223) {
            return {
                type: Syntax$857.MethodDefinition,
                key: key$1222,
                value: value$1223,
                kind: kind$1221,
                'static': propertyType$1220 === ClassPropertyType$862.static
            };
        },
        createClassBody: function (body$1224) {
            return {
                type: Syntax$857.ClassBody,
                body: body$1224
            };
        },
        createClassExpression: function (id$1225, superClass$1226, body$1227) {
            return {
                type: Syntax$857.ClassExpression,
                id: id$1225,
                superClass: superClass$1226,
                body: body$1227
            };
        },
        createClassDeclaration: function (id$1228, superClass$1229, body$1230) {
            return {
                type: Syntax$857.ClassDeclaration,
                id: id$1228,
                superClass: superClass$1229,
                body: body$1230
            };
        },
        createExportSpecifier: function (id$1231, name$1232) {
            return {
                type: Syntax$857.ExportSpecifier,
                id: id$1231,
                name: name$1232
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$857.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1233, specifiers$1234, source$1235) {
            return {
                type: Syntax$857.ExportDeclaration,
                declaration: declaration$1233,
                specifiers: specifiers$1234,
                source: source$1235
            };
        },
        createImportSpecifier: function (id$1236, name$1237) {
            return {
                type: Syntax$857.ImportSpecifier,
                id: id$1236,
                name: name$1237
            };
        },
        createImportDeclaration: function (specifiers$1238, kind$1239, source$1240) {
            return {
                type: Syntax$857.ImportDeclaration,
                specifiers: specifiers$1238,
                kind: kind$1239,
                source: source$1240
            };
        },
        createYieldExpression: function (argument$1241, delegate$1242) {
            return {
                type: Syntax$857.YieldExpression,
                argument: argument$1241,
                delegate: delegate$1242
            };
        },
        createModuleDeclaration: function (id$1243, source$1244, body$1245) {
            return {
                type: Syntax$857.ModuleDeclaration,
                id: id$1243,
                source: source$1244,
                body: body$1245
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$913() {
        return lookahead$876.lineNumber !== lineNumber$866;
    }
    // Throw an exception
    function throwError$914(token$1246, messageFormat$1247) {
        var error$1248, args$1249 = Array.prototype.slice.call(arguments, 2), msg$1250 = messageFormat$1247.replace(/%(\d)/g, function (whole$1254, index$1255) {
                assert$880(index$1255 < args$1249.length, 'Message reference must be in range');
                return args$1249[index$1255];
            });
        var startIndex$1251 = streamIndex$875 > 3 ? streamIndex$875 - 3 : 0;
        var toks$1252 = '', tailingMsg$1253 = '';
        if (tokenStream$874) {
            toks$1252 = tokenStream$874.slice(startIndex$1251, streamIndex$875 + 3).map(function (stx$1256) {
                return stx$1256.token.value;
            }).join(' ');
            tailingMsg$1253 = '\n[... ' + toks$1252 + ' ...]';
        }
        if (typeof token$1246.lineNumber === 'number') {
            error$1248 = new Error('Line ' + token$1246.lineNumber + ': ' + msg$1250 + tailingMsg$1253);
            error$1248.index = token$1246.range[0];
            error$1248.lineNumber = token$1246.lineNumber;
            error$1248.column = token$1246.range[0] - lineStart$867 + 1;
        } else {
            error$1248 = new Error('Line ' + lineNumber$866 + ': ' + msg$1250 + tailingMsg$1253);
            error$1248.index = index$865;
            error$1248.lineNumber = lineNumber$866;
            error$1248.column = index$865 - lineStart$867 + 1;
        }
        error$1248.description = msg$1250;
        throw error$1248;
    }
    function throwErrorTolerant$915() {
        try {
            throwError$914.apply(null, arguments);
        } catch (e$1257) {
            if (extra$879.errors) {
                extra$879.errors.push(e$1257);
            } else {
                throw e$1257;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$916(token$1258) {
        if (token$1258.type === Token$854.EOF) {
            throwError$914(token$1258, Messages$859.UnexpectedEOS);
        }
        if (token$1258.type === Token$854.NumericLiteral) {
            throwError$914(token$1258, Messages$859.UnexpectedNumber);
        }
        if (token$1258.type === Token$854.StringLiteral) {
            throwError$914(token$1258, Messages$859.UnexpectedString);
        }
        if (token$1258.type === Token$854.Identifier) {
            throwError$914(token$1258, Messages$859.UnexpectedIdentifier);
        }
        if (token$1258.type === Token$854.Keyword) {
            if (isFutureReservedWord$889(token$1258.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$864 && isStrictModeReservedWord$890(token$1258.value)) {
                throwErrorTolerant$915(token$1258, Messages$859.StrictReservedWord);
                return;
            }
            throwError$914(token$1258, Messages$859.UnexpectedToken, token$1258.value);
        }
        if (token$1258.type === Token$854.Template) {
            throwError$914(token$1258, Messages$859.UnexpectedTemplate, token$1258.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$914(token$1258, Messages$859.UnexpectedToken, token$1258.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$917(value$1259) {
        var token$1260 = lex$910();
        if (token$1260.type !== Token$854.Punctuator || token$1260.value !== value$1259) {
            throwUnexpected$916(token$1260);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$918(keyword$1261) {
        var token$1262 = lex$910();
        if (token$1262.type !== Token$854.Keyword || token$1262.value !== keyword$1261) {
            throwUnexpected$916(token$1262);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$919(value$1263) {
        return lookahead$876.type === Token$854.Punctuator && lookahead$876.value === value$1263;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$920(keyword$1264) {
        return lookahead$876.type === Token$854.Keyword && lookahead$876.value === keyword$1264;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$921(keyword$1265) {
        return lookahead$876.type === Token$854.Identifier && lookahead$876.value === keyword$1265;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$922() {
        var op$1266;
        if (lookahead$876.type !== Token$854.Punctuator) {
            return false;
        }
        op$1266 = lookahead$876.value;
        return op$1266 === '=' || op$1266 === '*=' || op$1266 === '/=' || op$1266 === '%=' || op$1266 === '+=' || op$1266 === '-=' || op$1266 === '<<=' || op$1266 === '>>=' || op$1266 === '>>>=' || op$1266 === '&=' || op$1266 === '^=' || op$1266 === '|=';
    }
    function consumeSemicolon$923() {
        var line$1267, ch$1268;
        ch$1268 = lookahead$876.value ? String(lookahead$876.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1268 === 59) {
            lex$910();
            return;
        }
        if (lookahead$876.lineNumber !== lineNumber$866) {
            return;
        }
        if (match$919(';')) {
            lex$910();
            return;
        }
        if (lookahead$876.type !== Token$854.EOF && !match$919('}')) {
            throwUnexpected$916(lookahead$876);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$924(expr$1269) {
        return expr$1269.type === Syntax$857.Identifier || expr$1269.type === Syntax$857.MemberExpression;
    }
    function isAssignableLeftHandSide$925(expr$1270) {
        return isLeftHandSide$924(expr$1270) || expr$1270.type === Syntax$857.ObjectPattern || expr$1270.type === Syntax$857.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$926() {
        var elements$1271 = [], blocks$1272 = [], filter$1273 = null, tmp$1274, possiblecomprehension$1275 = true, body$1276;
        expect$917('[');
        while (!match$919(']')) {
            if (lookahead$876.value === 'for' && lookahead$876.type === Token$854.Keyword) {
                if (!possiblecomprehension$1275) {
                    throwError$914({}, Messages$859.ComprehensionError);
                }
                matchKeyword$920('for');
                tmp$1274 = parseForStatement$974({ ignoreBody: true });
                tmp$1274.of = tmp$1274.type === Syntax$857.ForOfStatement;
                tmp$1274.type = Syntax$857.ComprehensionBlock;
                if (tmp$1274.left.kind) {
                    // can't be let or const
                    throwError$914({}, Messages$859.ComprehensionError);
                }
                blocks$1272.push(tmp$1274);
            } else if (lookahead$876.value === 'if' && lookahead$876.type === Token$854.Keyword) {
                if (!possiblecomprehension$1275) {
                    throwError$914({}, Messages$859.ComprehensionError);
                }
                expectKeyword$918('if');
                expect$917('(');
                filter$1273 = parseExpression$954();
                expect$917(')');
            } else if (lookahead$876.value === ',' && lookahead$876.type === Token$854.Punctuator) {
                possiblecomprehension$1275 = false;
                // no longer allowed.
                lex$910();
                elements$1271.push(null);
            } else {
                tmp$1274 = parseSpreadOrAssignmentExpression$937();
                elements$1271.push(tmp$1274);
                if (tmp$1274 && tmp$1274.type === Syntax$857.SpreadElement) {
                    if (!match$919(']')) {
                        throwError$914({}, Messages$859.ElementAfterSpreadElement);
                    }
                } else if (!(match$919(']') || matchKeyword$920('for') || matchKeyword$920('if'))) {
                    expect$917(',');
                    // this lexes.
                    possiblecomprehension$1275 = false;
                }
            }
        }
        expect$917(']');
        if (filter$1273 && !blocks$1272.length) {
            throwError$914({}, Messages$859.ComprehensionRequiresBlock);
        }
        if (blocks$1272.length) {
            if (elements$1271.length !== 1) {
                throwError$914({}, Messages$859.ComprehensionError);
            }
            return {
                type: Syntax$857.ComprehensionExpression,
                filter: filter$1273,
                blocks: blocks$1272,
                body: elements$1271[0]
            };
        }
        return delegate$873.createArrayExpression(elements$1271);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$927(options$1277) {
        var previousStrict$1278, previousYieldAllowed$1279, params$1280, defaults$1281, body$1282;
        previousStrict$1278 = strict$864;
        previousYieldAllowed$1279 = state$878.yieldAllowed;
        state$878.yieldAllowed = options$1277.generator;
        params$1280 = options$1277.params || [];
        defaults$1281 = options$1277.defaults || [];
        body$1282 = parseConciseBody$986();
        if (options$1277.name && strict$864 && isRestrictedWord$891(params$1280[0].name)) {
            throwErrorTolerant$915(options$1277.name, Messages$859.StrictParamName);
        }
        if (state$878.yieldAllowed && !state$878.yieldFound) {
            throwErrorTolerant$915({}, Messages$859.NoYieldInGenerator);
        }
        strict$864 = previousStrict$1278;
        state$878.yieldAllowed = previousYieldAllowed$1279;
        return delegate$873.createFunctionExpression(null, params$1280, defaults$1281, body$1282, options$1277.rest || null, options$1277.generator, body$1282.type !== Syntax$857.BlockStatement);
    }
    function parsePropertyMethodFunction$928(options$1283) {
        var previousStrict$1284, tmp$1285, method$1286;
        previousStrict$1284 = strict$864;
        strict$864 = true;
        tmp$1285 = parseParams$990();
        if (tmp$1285.stricted) {
            throwErrorTolerant$915(tmp$1285.stricted, tmp$1285.message);
        }
        method$1286 = parsePropertyFunction$927({
            params: tmp$1285.params,
            defaults: tmp$1285.defaults,
            rest: tmp$1285.rest,
            generator: options$1283.generator
        });
        strict$864 = previousStrict$1284;
        return method$1286;
    }
    function parseObjectPropertyKey$929() {
        var token$1287 = lex$910();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1287.type === Token$854.StringLiteral || token$1287.type === Token$854.NumericLiteral) {
            if (strict$864 && token$1287.octal) {
                throwErrorTolerant$915(token$1287, Messages$859.StrictOctalLiteral);
            }
            return delegate$873.createLiteral(token$1287);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$873.createIdentifier(token$1287.value);
    }
    function parseObjectProperty$930() {
        var token$1288, key$1289, id$1290, value$1291, param$1292;
        token$1288 = lookahead$876;
        if (token$1288.type === Token$854.Identifier) {
            id$1290 = parseObjectPropertyKey$929();
            // Property Assignment: Getter and Setter.
            if (token$1288.value === 'get' && !(match$919(':') || match$919('('))) {
                key$1289 = parseObjectPropertyKey$929();
                expect$917('(');
                expect$917(')');
                return delegate$873.createProperty('get', key$1289, parsePropertyFunction$927({ generator: false }), false, false);
            }
            if (token$1288.value === 'set' && !(match$919(':') || match$919('('))) {
                key$1289 = parseObjectPropertyKey$929();
                expect$917('(');
                token$1288 = lookahead$876;
                param$1292 = [parseVariableIdentifier$957()];
                expect$917(')');
                return delegate$873.createProperty('set', key$1289, parsePropertyFunction$927({
                    params: param$1292,
                    generator: false,
                    name: token$1288
                }), false, false);
            }
            if (match$919(':')) {
                lex$910();
                return delegate$873.createProperty('init', id$1290, parseAssignmentExpression$953(), false, false);
            }
            if (match$919('(')) {
                return delegate$873.createProperty('init', id$1290, parsePropertyMethodFunction$928({ generator: false }), true, false);
            }
            return delegate$873.createProperty('init', id$1290, id$1290, false, true);
        }
        if (token$1288.type === Token$854.EOF || token$1288.type === Token$854.Punctuator) {
            if (!match$919('*')) {
                throwUnexpected$916(token$1288);
            }
            lex$910();
            id$1290 = parseObjectPropertyKey$929();
            if (!match$919('(')) {
                throwUnexpected$916(lex$910());
            }
            return delegate$873.createProperty('init', id$1290, parsePropertyMethodFunction$928({ generator: true }), true, false);
        }
        key$1289 = parseObjectPropertyKey$929();
        if (match$919(':')) {
            lex$910();
            return delegate$873.createProperty('init', key$1289, parseAssignmentExpression$953(), false, false);
        }
        if (match$919('(')) {
            return delegate$873.createProperty('init', key$1289, parsePropertyMethodFunction$928({ generator: false }), true, false);
        }
        throwUnexpected$916(lex$910());
    }
    function parseObjectInitialiser$931() {
        var properties$1293 = [], property$1294, name$1295, key$1296, kind$1297, map$1298 = {}, toString$1299 = String;
        expect$917('{');
        while (!match$919('}')) {
            property$1294 = parseObjectProperty$930();
            if (property$1294.key.type === Syntax$857.Identifier) {
                name$1295 = property$1294.key.name;
            } else {
                name$1295 = toString$1299(property$1294.key.value);
            }
            kind$1297 = property$1294.kind === 'init' ? PropertyKind$858.Data : property$1294.kind === 'get' ? PropertyKind$858.Get : PropertyKind$858.Set;
            key$1296 = '$' + name$1295;
            if (Object.prototype.hasOwnProperty.call(map$1298, key$1296)) {
                if (map$1298[key$1296] === PropertyKind$858.Data) {
                    if (strict$864 && kind$1297 === PropertyKind$858.Data) {
                        throwErrorTolerant$915({}, Messages$859.StrictDuplicateProperty);
                    } else if (kind$1297 !== PropertyKind$858.Data) {
                        throwErrorTolerant$915({}, Messages$859.AccessorDataProperty);
                    }
                } else {
                    if (kind$1297 === PropertyKind$858.Data) {
                        throwErrorTolerant$915({}, Messages$859.AccessorDataProperty);
                    } else if (map$1298[key$1296] & kind$1297) {
                        throwErrorTolerant$915({}, Messages$859.AccessorGetSet);
                    }
                }
                map$1298[key$1296] |= kind$1297;
            } else {
                map$1298[key$1296] = kind$1297;
            }
            properties$1293.push(property$1294);
            if (!match$919('}')) {
                expect$917(',');
            }
        }
        expect$917('}');
        return delegate$873.createObjectExpression(properties$1293);
    }
    function parseTemplateElement$932(option$1300) {
        var token$1301 = scanTemplateElement$905(option$1300);
        if (strict$864 && token$1301.octal) {
            throwError$914(token$1301, Messages$859.StrictOctalLiteral);
        }
        return delegate$873.createTemplateElement({
            raw: token$1301.value.raw,
            cooked: token$1301.value.cooked
        }, token$1301.tail);
    }
    function parseTemplateLiteral$933() {
        var quasi$1302, quasis$1303, expressions$1304;
        quasi$1302 = parseTemplateElement$932({ head: true });
        quasis$1303 = [quasi$1302];
        expressions$1304 = [];
        while (!quasi$1302.tail) {
            expressions$1304.push(parseExpression$954());
            quasi$1302 = parseTemplateElement$932({ head: false });
            quasis$1303.push(quasi$1302);
        }
        return delegate$873.createTemplateLiteral(quasis$1303, expressions$1304);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$934() {
        var expr$1305;
        expect$917('(');
        ++state$878.parenthesizedCount;
        expr$1305 = parseExpression$954();
        expect$917(')');
        return expr$1305;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$935() {
        var type$1306, token$1307, resolvedIdent$1308;
        token$1307 = lookahead$876;
        type$1306 = lookahead$876.type;
        if (type$1306 === Token$854.Identifier) {
            resolvedIdent$1308 = expander$853.resolve(tokenStream$874[lookaheadIndex$877]);
            lex$910();
            return delegate$873.createIdentifier(resolvedIdent$1308);
        }
        if (type$1306 === Token$854.StringLiteral || type$1306 === Token$854.NumericLiteral) {
            if (strict$864 && lookahead$876.octal) {
                throwErrorTolerant$915(lookahead$876, Messages$859.StrictOctalLiteral);
            }
            return delegate$873.createLiteral(lex$910());
        }
        if (type$1306 === Token$854.Keyword) {
            if (matchKeyword$920('this')) {
                lex$910();
                return delegate$873.createThisExpression();
            }
            if (matchKeyword$920('function')) {
                return parseFunctionExpression$992();
            }
            if (matchKeyword$920('class')) {
                return parseClassExpression$997();
            }
            if (matchKeyword$920('super')) {
                lex$910();
                return delegate$873.createIdentifier('super');
            }
        }
        if (type$1306 === Token$854.BooleanLiteral) {
            token$1307 = lex$910();
            token$1307.value = token$1307.value === 'true';
            return delegate$873.createLiteral(token$1307);
        }
        if (type$1306 === Token$854.NullLiteral) {
            token$1307 = lex$910();
            token$1307.value = null;
            return delegate$873.createLiteral(token$1307);
        }
        if (match$919('[')) {
            return parseArrayInitialiser$926();
        }
        if (match$919('{')) {
            return parseObjectInitialiser$931();
        }
        if (match$919('(')) {
            return parseGroupExpression$934();
        }
        if (lookahead$876.type === Token$854.RegularExpression) {
            return delegate$873.createLiteral(lex$910());
        }
        if (type$1306 === Token$854.Template) {
            return parseTemplateLiteral$933();
        }
        return throwUnexpected$916(lex$910());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$936() {
        var args$1309 = [], arg$1310;
        expect$917('(');
        if (!match$919(')')) {
            while (streamIndex$875 < length$872) {
                arg$1310 = parseSpreadOrAssignmentExpression$937();
                args$1309.push(arg$1310);
                if (match$919(')')) {
                    break;
                } else if (arg$1310.type === Syntax$857.SpreadElement) {
                    throwError$914({}, Messages$859.ElementAfterSpreadElement);
                }
                expect$917(',');
            }
        }
        expect$917(')');
        return args$1309;
    }
    function parseSpreadOrAssignmentExpression$937() {
        if (match$919('...')) {
            lex$910();
            return delegate$873.createSpreadElement(parseAssignmentExpression$953());
        }
        return parseAssignmentExpression$953();
    }
    function parseNonComputedProperty$938() {
        var token$1311 = lex$910();
        if (!isIdentifierName$907(token$1311)) {
            throwUnexpected$916(token$1311);
        }
        return delegate$873.createIdentifier(token$1311.value);
    }
    function parseNonComputedMember$939() {
        expect$917('.');
        return parseNonComputedProperty$938();
    }
    function parseComputedMember$940() {
        var expr$1312;
        expect$917('[');
        expr$1312 = parseExpression$954();
        expect$917(']');
        return expr$1312;
    }
    function parseNewExpression$941() {
        var callee$1313, args$1314;
        expectKeyword$918('new');
        callee$1313 = parseLeftHandSideExpression$943();
        args$1314 = match$919('(') ? parseArguments$936() : [];
        return delegate$873.createNewExpression(callee$1313, args$1314);
    }
    function parseLeftHandSideExpressionAllowCall$942() {
        var expr$1315, args$1316, property$1317;
        expr$1315 = matchKeyword$920('new') ? parseNewExpression$941() : parsePrimaryExpression$935();
        while (match$919('.') || match$919('[') || match$919('(') || lookahead$876.type === Token$854.Template) {
            if (match$919('(')) {
                args$1316 = parseArguments$936();
                expr$1315 = delegate$873.createCallExpression(expr$1315, args$1316);
            } else if (match$919('[')) {
                expr$1315 = delegate$873.createMemberExpression('[', expr$1315, parseComputedMember$940());
            } else if (match$919('.')) {
                expr$1315 = delegate$873.createMemberExpression('.', expr$1315, parseNonComputedMember$939());
            } else {
                expr$1315 = delegate$873.createTaggedTemplateExpression(expr$1315, parseTemplateLiteral$933());
            }
        }
        return expr$1315;
    }
    function parseLeftHandSideExpression$943() {
        var expr$1318, property$1319;
        expr$1318 = matchKeyword$920('new') ? parseNewExpression$941() : parsePrimaryExpression$935();
        while (match$919('.') || match$919('[') || lookahead$876.type === Token$854.Template) {
            if (match$919('[')) {
                expr$1318 = delegate$873.createMemberExpression('[', expr$1318, parseComputedMember$940());
            } else if (match$919('.')) {
                expr$1318 = delegate$873.createMemberExpression('.', expr$1318, parseNonComputedMember$939());
            } else {
                expr$1318 = delegate$873.createTaggedTemplateExpression(expr$1318, parseTemplateLiteral$933());
            }
        }
        return expr$1318;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$944() {
        var expr$1320 = parseLeftHandSideExpressionAllowCall$942(), token$1321 = lookahead$876;
        if (lookahead$876.type !== Token$854.Punctuator) {
            return expr$1320;
        }
        if ((match$919('++') || match$919('--')) && !peekLineTerminator$913()) {
            // 11.3.1, 11.3.2
            if (strict$864 && expr$1320.type === Syntax$857.Identifier && isRestrictedWord$891(expr$1320.name)) {
                throwErrorTolerant$915({}, Messages$859.StrictLHSPostfix);
            }
            if (!isLeftHandSide$924(expr$1320)) {
                throwError$914({}, Messages$859.InvalidLHSInAssignment);
            }
            token$1321 = lex$910();
            expr$1320 = delegate$873.createPostfixExpression(token$1321.value, expr$1320);
        }
        return expr$1320;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$945() {
        var token$1322, expr$1323;
        if (lookahead$876.type !== Token$854.Punctuator && lookahead$876.type !== Token$854.Keyword) {
            return parsePostfixExpression$944();
        }
        if (match$919('++') || match$919('--')) {
            token$1322 = lex$910();
            expr$1323 = parseUnaryExpression$945();
            // 11.4.4, 11.4.5
            if (strict$864 && expr$1323.type === Syntax$857.Identifier && isRestrictedWord$891(expr$1323.name)) {
                throwErrorTolerant$915({}, Messages$859.StrictLHSPrefix);
            }
            if (!isLeftHandSide$924(expr$1323)) {
                throwError$914({}, Messages$859.InvalidLHSInAssignment);
            }
            return delegate$873.createUnaryExpression(token$1322.value, expr$1323);
        }
        if (match$919('+') || match$919('-') || match$919('~') || match$919('!')) {
            token$1322 = lex$910();
            expr$1323 = parseUnaryExpression$945();
            return delegate$873.createUnaryExpression(token$1322.value, expr$1323);
        }
        if (matchKeyword$920('delete') || matchKeyword$920('void') || matchKeyword$920('typeof')) {
            token$1322 = lex$910();
            expr$1323 = parseUnaryExpression$945();
            expr$1323 = delegate$873.createUnaryExpression(token$1322.value, expr$1323);
            if (strict$864 && expr$1323.operator === 'delete' && expr$1323.argument.type === Syntax$857.Identifier) {
                throwErrorTolerant$915({}, Messages$859.StrictDelete);
            }
            return expr$1323;
        }
        return parsePostfixExpression$944();
    }
    function binaryPrecedence$946(token$1324, allowIn$1325) {
        var prec$1326 = 0;
        if (token$1324.type !== Token$854.Punctuator && token$1324.type !== Token$854.Keyword) {
            return 0;
        }
        switch (token$1324.value) {
        case '||':
            prec$1326 = 1;
            break;
        case '&&':
            prec$1326 = 2;
            break;
        case '|':
            prec$1326 = 3;
            break;
        case '^':
            prec$1326 = 4;
            break;
        case '&':
            prec$1326 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1326 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1326 = 7;
            break;
        case 'in':
            prec$1326 = allowIn$1325 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1326 = 8;
            break;
        case '+':
        case '-':
            prec$1326 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1326 = 11;
            break;
        default:
            break;
        }
        return prec$1326;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$947() {
        var expr$1327, token$1328, prec$1329, previousAllowIn$1330, stack$1331, right$1332, operator$1333, left$1334, i$1335;
        previousAllowIn$1330 = state$878.allowIn;
        state$878.allowIn = true;
        expr$1327 = parseUnaryExpression$945();
        token$1328 = lookahead$876;
        prec$1329 = binaryPrecedence$946(token$1328, previousAllowIn$1330);
        if (prec$1329 === 0) {
            return expr$1327;
        }
        token$1328.prec = prec$1329;
        lex$910();
        stack$1331 = [
            expr$1327,
            token$1328,
            parseUnaryExpression$945()
        ];
        while ((prec$1329 = binaryPrecedence$946(lookahead$876, previousAllowIn$1330)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1331.length > 2 && prec$1329 <= stack$1331[stack$1331.length - 2].prec) {
                right$1332 = stack$1331.pop();
                operator$1333 = stack$1331.pop().value;
                left$1334 = stack$1331.pop();
                stack$1331.push(delegate$873.createBinaryExpression(operator$1333, left$1334, right$1332));
            }
            // Shift.
            token$1328 = lex$910();
            token$1328.prec = prec$1329;
            stack$1331.push(token$1328);
            stack$1331.push(parseUnaryExpression$945());
        }
        state$878.allowIn = previousAllowIn$1330;
        // Final reduce to clean-up the stack.
        i$1335 = stack$1331.length - 1;
        expr$1327 = stack$1331[i$1335];
        while (i$1335 > 1) {
            expr$1327 = delegate$873.createBinaryExpression(stack$1331[i$1335 - 1].value, stack$1331[i$1335 - 2], expr$1327);
            i$1335 -= 2;
        }
        return expr$1327;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$948() {
        var expr$1336, previousAllowIn$1337, consequent$1338, alternate$1339;
        expr$1336 = parseBinaryExpression$947();
        if (match$919('?')) {
            lex$910();
            previousAllowIn$1337 = state$878.allowIn;
            state$878.allowIn = true;
            consequent$1338 = parseAssignmentExpression$953();
            state$878.allowIn = previousAllowIn$1337;
            expect$917(':');
            alternate$1339 = parseAssignmentExpression$953();
            expr$1336 = delegate$873.createConditionalExpression(expr$1336, consequent$1338, alternate$1339);
        }
        return expr$1336;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$949(expr$1340) {
        var i$1341, len$1342, property$1343, element$1344;
        if (expr$1340.type === Syntax$857.ObjectExpression) {
            expr$1340.type = Syntax$857.ObjectPattern;
            for (i$1341 = 0, len$1342 = expr$1340.properties.length; i$1341 < len$1342; i$1341 += 1) {
                property$1343 = expr$1340.properties[i$1341];
                if (property$1343.kind !== 'init') {
                    throwError$914({}, Messages$859.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$949(property$1343.value);
            }
        } else if (expr$1340.type === Syntax$857.ArrayExpression) {
            expr$1340.type = Syntax$857.ArrayPattern;
            for (i$1341 = 0, len$1342 = expr$1340.elements.length; i$1341 < len$1342; i$1341 += 1) {
                element$1344 = expr$1340.elements[i$1341];
                if (element$1344) {
                    reinterpretAsAssignmentBindingPattern$949(element$1344);
                }
            }
        } else if (expr$1340.type === Syntax$857.Identifier) {
            if (isRestrictedWord$891(expr$1340.name)) {
                throwError$914({}, Messages$859.InvalidLHSInAssignment);
            }
        } else if (expr$1340.type === Syntax$857.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$949(expr$1340.argument);
            if (expr$1340.argument.type === Syntax$857.ObjectPattern) {
                throwError$914({}, Messages$859.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1340.type !== Syntax$857.MemberExpression && expr$1340.type !== Syntax$857.CallExpression && expr$1340.type !== Syntax$857.NewExpression) {
                throwError$914({}, Messages$859.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$950(options$1345, expr$1346) {
        var i$1347, len$1348, property$1349, element$1350;
        if (expr$1346.type === Syntax$857.ObjectExpression) {
            expr$1346.type = Syntax$857.ObjectPattern;
            for (i$1347 = 0, len$1348 = expr$1346.properties.length; i$1347 < len$1348; i$1347 += 1) {
                property$1349 = expr$1346.properties[i$1347];
                if (property$1349.kind !== 'init') {
                    throwError$914({}, Messages$859.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$950(options$1345, property$1349.value);
            }
        } else if (expr$1346.type === Syntax$857.ArrayExpression) {
            expr$1346.type = Syntax$857.ArrayPattern;
            for (i$1347 = 0, len$1348 = expr$1346.elements.length; i$1347 < len$1348; i$1347 += 1) {
                element$1350 = expr$1346.elements[i$1347];
                if (element$1350) {
                    reinterpretAsDestructuredParameter$950(options$1345, element$1350);
                }
            }
        } else if (expr$1346.type === Syntax$857.Identifier) {
            validateParam$988(options$1345, expr$1346, expr$1346.name);
        } else {
            if (expr$1346.type !== Syntax$857.MemberExpression) {
                throwError$914({}, Messages$859.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$951(expressions$1351) {
        var i$1352, len$1353, param$1354, params$1355, defaults$1356, defaultCount$1357, options$1358, rest$1359;
        params$1355 = [];
        defaults$1356 = [];
        defaultCount$1357 = 0;
        rest$1359 = null;
        options$1358 = { paramSet: {} };
        for (i$1352 = 0, len$1353 = expressions$1351.length; i$1352 < len$1353; i$1352 += 1) {
            param$1354 = expressions$1351[i$1352];
            if (param$1354.type === Syntax$857.Identifier) {
                params$1355.push(param$1354);
                defaults$1356.push(null);
                validateParam$988(options$1358, param$1354, param$1354.name);
            } else if (param$1354.type === Syntax$857.ObjectExpression || param$1354.type === Syntax$857.ArrayExpression) {
                reinterpretAsDestructuredParameter$950(options$1358, param$1354);
                params$1355.push(param$1354);
                defaults$1356.push(null);
            } else if (param$1354.type === Syntax$857.SpreadElement) {
                assert$880(i$1352 === len$1353 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$950(options$1358, param$1354.argument);
                rest$1359 = param$1354.argument;
            } else if (param$1354.type === Syntax$857.AssignmentExpression) {
                params$1355.push(param$1354.left);
                defaults$1356.push(param$1354.right);
                ++defaultCount$1357;
                validateParam$988(options$1358, param$1354.left, param$1354.left.name);
            } else {
                return null;
            }
        }
        if (options$1358.message === Messages$859.StrictParamDupe) {
            throwError$914(strict$864 ? options$1358.stricted : options$1358.firstRestricted, options$1358.message);
        }
        if (defaultCount$1357 === 0) {
            defaults$1356 = [];
        }
        return {
            params: params$1355,
            defaults: defaults$1356,
            rest: rest$1359,
            stricted: options$1358.stricted,
            firstRestricted: options$1358.firstRestricted,
            message: options$1358.message
        };
    }
    function parseArrowFunctionExpression$952(options$1360) {
        var previousStrict$1361, previousYieldAllowed$1362, body$1363;
        expect$917('=>');
        previousStrict$1361 = strict$864;
        previousYieldAllowed$1362 = state$878.yieldAllowed;
        state$878.yieldAllowed = false;
        body$1363 = parseConciseBody$986();
        if (strict$864 && options$1360.firstRestricted) {
            throwError$914(options$1360.firstRestricted, options$1360.message);
        }
        if (strict$864 && options$1360.stricted) {
            throwErrorTolerant$915(options$1360.stricted, options$1360.message);
        }
        strict$864 = previousStrict$1361;
        state$878.yieldAllowed = previousYieldAllowed$1362;
        return delegate$873.createArrowFunctionExpression(options$1360.params, options$1360.defaults, body$1363, options$1360.rest, body$1363.type !== Syntax$857.BlockStatement);
    }
    function parseAssignmentExpression$953() {
        var expr$1364, token$1365, params$1366, oldParenthesizedCount$1367;
        if (matchKeyword$920('yield')) {
            return parseYieldExpression$993();
        }
        oldParenthesizedCount$1367 = state$878.parenthesizedCount;
        if (match$919('(')) {
            token$1365 = lookahead2$912();
            if (token$1365.type === Token$854.Punctuator && token$1365.value === ')' || token$1365.value === '...') {
                params$1366 = parseParams$990();
                if (!match$919('=>')) {
                    throwUnexpected$916(lex$910());
                }
                return parseArrowFunctionExpression$952(params$1366);
            }
        }
        token$1365 = lookahead$876;
        expr$1364 = parseConditionalExpression$948();
        if (match$919('=>') && (state$878.parenthesizedCount === oldParenthesizedCount$1367 || state$878.parenthesizedCount === oldParenthesizedCount$1367 + 1)) {
            if (expr$1364.type === Syntax$857.Identifier) {
                params$1366 = reinterpretAsCoverFormalsList$951([expr$1364]);
            } else if (expr$1364.type === Syntax$857.SequenceExpression) {
                params$1366 = reinterpretAsCoverFormalsList$951(expr$1364.expressions);
            }
            if (params$1366) {
                return parseArrowFunctionExpression$952(params$1366);
            }
        }
        if (matchAssign$922()) {
            // 11.13.1
            if (strict$864 && expr$1364.type === Syntax$857.Identifier && isRestrictedWord$891(expr$1364.name)) {
                throwErrorTolerant$915(token$1365, Messages$859.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$919('=') && (expr$1364.type === Syntax$857.ObjectExpression || expr$1364.type === Syntax$857.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$949(expr$1364);
            } else if (!isLeftHandSide$924(expr$1364)) {
                throwError$914({}, Messages$859.InvalidLHSInAssignment);
            }
            expr$1364 = delegate$873.createAssignmentExpression(lex$910().value, expr$1364, parseAssignmentExpression$953());
        }
        return expr$1364;
    }
    // 11.14 Comma Operator
    function parseExpression$954() {
        var expr$1368, expressions$1369, sequence$1370, coverFormalsList$1371, spreadFound$1372, oldParenthesizedCount$1373;
        oldParenthesizedCount$1373 = state$878.parenthesizedCount;
        expr$1368 = parseAssignmentExpression$953();
        expressions$1369 = [expr$1368];
        if (match$919(',')) {
            while (streamIndex$875 < length$872) {
                if (!match$919(',')) {
                    break;
                }
                lex$910();
                expr$1368 = parseSpreadOrAssignmentExpression$937();
                expressions$1369.push(expr$1368);
                if (expr$1368.type === Syntax$857.SpreadElement) {
                    spreadFound$1372 = true;
                    if (!match$919(')')) {
                        throwError$914({}, Messages$859.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1370 = delegate$873.createSequenceExpression(expressions$1369);
        }
        if (match$919('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$878.parenthesizedCount === oldParenthesizedCount$1373 || state$878.parenthesizedCount === oldParenthesizedCount$1373 + 1) {
                expr$1368 = expr$1368.type === Syntax$857.SequenceExpression ? expr$1368.expressions : expressions$1369;
                coverFormalsList$1371 = reinterpretAsCoverFormalsList$951(expr$1368);
                if (coverFormalsList$1371) {
                    return parseArrowFunctionExpression$952(coverFormalsList$1371);
                }
            }
            throwUnexpected$916(lex$910());
        }
        if (spreadFound$1372 && lookahead2$912().value !== '=>') {
            throwError$914({}, Messages$859.IllegalSpread);
        }
        return sequence$1370 || expr$1368;
    }
    // 12.1 Block
    function parseStatementList$955() {
        var list$1374 = [], statement$1375;
        while (streamIndex$875 < length$872) {
            if (match$919('}')) {
                break;
            }
            statement$1375 = parseSourceElement$1000();
            if (typeof statement$1375 === 'undefined') {
                break;
            }
            list$1374.push(statement$1375);
        }
        return list$1374;
    }
    function parseBlock$956() {
        var block$1376;
        expect$917('{');
        block$1376 = parseStatementList$955();
        expect$917('}');
        return delegate$873.createBlockStatement(block$1376);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$957() {
        var token$1377 = lookahead$876, resolvedIdent$1378;
        if (token$1377.type !== Token$854.Identifier) {
            throwUnexpected$916(token$1377);
        }
        resolvedIdent$1378 = expander$853.resolve(tokenStream$874[lookaheadIndex$877]);
        lex$910();
        return delegate$873.createIdentifier(resolvedIdent$1378);
    }
    function parseVariableDeclaration$958(kind$1379) {
        var id$1380, init$1381 = null;
        if (match$919('{')) {
            id$1380 = parseObjectInitialiser$931();
            reinterpretAsAssignmentBindingPattern$949(id$1380);
        } else if (match$919('[')) {
            id$1380 = parseArrayInitialiser$926();
            reinterpretAsAssignmentBindingPattern$949(id$1380);
        } else {
            id$1380 = state$878.allowKeyword ? parseNonComputedProperty$938() : parseVariableIdentifier$957();
            // 12.2.1
            if (strict$864 && isRestrictedWord$891(id$1380.name)) {
                throwErrorTolerant$915({}, Messages$859.StrictVarName);
            }
        }
        if (kind$1379 === 'const') {
            if (!match$919('=')) {
                throwError$914({}, Messages$859.NoUnintializedConst);
            }
            expect$917('=');
            init$1381 = parseAssignmentExpression$953();
        } else if (match$919('=')) {
            lex$910();
            init$1381 = parseAssignmentExpression$953();
        }
        return delegate$873.createVariableDeclarator(id$1380, init$1381);
    }
    function parseVariableDeclarationList$959(kind$1382) {
        var list$1383 = [];
        do {
            list$1383.push(parseVariableDeclaration$958(kind$1382));
            if (!match$919(',')) {
                break;
            }
            lex$910();
        } while (streamIndex$875 < length$872);
        return list$1383;
    }
    function parseVariableStatement$960() {
        var declarations$1384;
        expectKeyword$918('var');
        declarations$1384 = parseVariableDeclarationList$959();
        consumeSemicolon$923();
        return delegate$873.createVariableDeclaration(declarations$1384, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$961(kind$1385) {
        var declarations$1386;
        expectKeyword$918(kind$1385);
        declarations$1386 = parseVariableDeclarationList$959(kind$1385);
        consumeSemicolon$923();
        return delegate$873.createVariableDeclaration(declarations$1386, kind$1385);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$962() {
        var id$1387, src$1388, body$1389;
        lex$910();
        // 'module'
        if (peekLineTerminator$913()) {
            throwError$914({}, Messages$859.NewlineAfterModule);
        }
        switch (lookahead$876.type) {
        case Token$854.StringLiteral:
            id$1387 = parsePrimaryExpression$935();
            body$1389 = parseModuleBlock$1005();
            src$1388 = null;
            break;
        case Token$854.Identifier:
            id$1387 = parseVariableIdentifier$957();
            body$1389 = null;
            if (!matchContextualKeyword$921('from')) {
                throwUnexpected$916(lex$910());
            }
            lex$910();
            src$1388 = parsePrimaryExpression$935();
            if (src$1388.type !== Syntax$857.Literal) {
                throwError$914({}, Messages$859.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$923();
        return delegate$873.createModuleDeclaration(id$1387, src$1388, body$1389);
    }
    function parseExportBatchSpecifier$963() {
        expect$917('*');
        return delegate$873.createExportBatchSpecifier();
    }
    function parseExportSpecifier$964() {
        var id$1390, name$1391 = null;
        id$1390 = parseVariableIdentifier$957();
        if (matchContextualKeyword$921('as')) {
            lex$910();
            name$1391 = parseNonComputedProperty$938();
        }
        return delegate$873.createExportSpecifier(id$1390, name$1391);
    }
    function parseExportDeclaration$965() {
        var previousAllowKeyword$1392, decl$1393, def$1394, src$1395, specifiers$1396;
        expectKeyword$918('export');
        if (lookahead$876.type === Token$854.Keyword) {
            switch (lookahead$876.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$873.createExportDeclaration(parseSourceElement$1000(), null, null);
            }
        }
        if (isIdentifierName$907(lookahead$876)) {
            previousAllowKeyword$1392 = state$878.allowKeyword;
            state$878.allowKeyword = true;
            decl$1393 = parseVariableDeclarationList$959('let');
            state$878.allowKeyword = previousAllowKeyword$1392;
            return delegate$873.createExportDeclaration(decl$1393, null, null);
        }
        specifiers$1396 = [];
        src$1395 = null;
        if (match$919('*')) {
            specifiers$1396.push(parseExportBatchSpecifier$963());
        } else {
            expect$917('{');
            do {
                specifiers$1396.push(parseExportSpecifier$964());
            } while (match$919(',') && lex$910());
            expect$917('}');
        }
        if (matchContextualKeyword$921('from')) {
            lex$910();
            src$1395 = parsePrimaryExpression$935();
            if (src$1395.type !== Syntax$857.Literal) {
                throwError$914({}, Messages$859.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$923();
        return delegate$873.createExportDeclaration(null, specifiers$1396, src$1395);
    }
    function parseImportDeclaration$966() {
        var specifiers$1397, kind$1398, src$1399;
        expectKeyword$918('import');
        specifiers$1397 = [];
        if (isIdentifierName$907(lookahead$876)) {
            kind$1398 = 'default';
            specifiers$1397.push(parseImportSpecifier$967());
            if (!matchContextualKeyword$921('from')) {
                throwError$914({}, Messages$859.NoFromAfterImport);
            }
            lex$910();
        } else if (match$919('{')) {
            kind$1398 = 'named';
            lex$910();
            do {
                specifiers$1397.push(parseImportSpecifier$967());
            } while (match$919(',') && lex$910());
            expect$917('}');
            if (!matchContextualKeyword$921('from')) {
                throwError$914({}, Messages$859.NoFromAfterImport);
            }
            lex$910();
        }
        src$1399 = parsePrimaryExpression$935();
        if (src$1399.type !== Syntax$857.Literal) {
            throwError$914({}, Messages$859.InvalidModuleSpecifier);
        }
        consumeSemicolon$923();
        return delegate$873.createImportDeclaration(specifiers$1397, kind$1398, src$1399);
    }
    function parseImportSpecifier$967() {
        var id$1400, name$1401 = null;
        id$1400 = parseNonComputedProperty$938();
        if (matchContextualKeyword$921('as')) {
            lex$910();
            name$1401 = parseVariableIdentifier$957();
        }
        return delegate$873.createImportSpecifier(id$1400, name$1401);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$968() {
        expect$917(';');
        return delegate$873.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$969() {
        var expr$1402 = parseExpression$954();
        consumeSemicolon$923();
        return delegate$873.createExpressionStatement(expr$1402);
    }
    // 12.5 If statement
    function parseIfStatement$970() {
        var test$1403, consequent$1404, alternate$1405;
        expectKeyword$918('if');
        expect$917('(');
        test$1403 = parseExpression$954();
        expect$917(')');
        consequent$1404 = parseStatement$985();
        if (matchKeyword$920('else')) {
            lex$910();
            alternate$1405 = parseStatement$985();
        } else {
            alternate$1405 = null;
        }
        return delegate$873.createIfStatement(test$1403, consequent$1404, alternate$1405);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$971() {
        var body$1406, test$1407, oldInIteration$1408;
        expectKeyword$918('do');
        oldInIteration$1408 = state$878.inIteration;
        state$878.inIteration = true;
        body$1406 = parseStatement$985();
        state$878.inIteration = oldInIteration$1408;
        expectKeyword$918('while');
        expect$917('(');
        test$1407 = parseExpression$954();
        expect$917(')');
        if (match$919(';')) {
            lex$910();
        }
        return delegate$873.createDoWhileStatement(body$1406, test$1407);
    }
    function parseWhileStatement$972() {
        var test$1409, body$1410, oldInIteration$1411;
        expectKeyword$918('while');
        expect$917('(');
        test$1409 = parseExpression$954();
        expect$917(')');
        oldInIteration$1411 = state$878.inIteration;
        state$878.inIteration = true;
        body$1410 = parseStatement$985();
        state$878.inIteration = oldInIteration$1411;
        return delegate$873.createWhileStatement(test$1409, body$1410);
    }
    function parseForVariableDeclaration$973() {
        var token$1412 = lex$910(), declarations$1413 = parseVariableDeclarationList$959();
        return delegate$873.createVariableDeclaration(declarations$1413, token$1412.value);
    }
    function parseForStatement$974(opts$1414) {
        var init$1415, test$1416, update$1417, left$1418, right$1419, body$1420, operator$1421, oldInIteration$1422;
        init$1415 = test$1416 = update$1417 = null;
        expectKeyword$918('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$921('each')) {
            throwError$914({}, Messages$859.EachNotAllowed);
        }
        expect$917('(');
        if (match$919(';')) {
            lex$910();
        } else {
            if (matchKeyword$920('var') || matchKeyword$920('let') || matchKeyword$920('const')) {
                state$878.allowIn = false;
                init$1415 = parseForVariableDeclaration$973();
                state$878.allowIn = true;
                if (init$1415.declarations.length === 1) {
                    if (matchKeyword$920('in') || matchContextualKeyword$921('of')) {
                        operator$1421 = lookahead$876;
                        if (!((operator$1421.value === 'in' || init$1415.kind !== 'var') && init$1415.declarations[0].init)) {
                            lex$910();
                            left$1418 = init$1415;
                            right$1419 = parseExpression$954();
                            init$1415 = null;
                        }
                    }
                }
            } else {
                state$878.allowIn = false;
                init$1415 = parseExpression$954();
                state$878.allowIn = true;
                if (matchContextualKeyword$921('of')) {
                    operator$1421 = lex$910();
                    left$1418 = init$1415;
                    right$1419 = parseExpression$954();
                    init$1415 = null;
                } else if (matchKeyword$920('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$925(init$1415)) {
                        throwError$914({}, Messages$859.InvalidLHSInForIn);
                    }
                    operator$1421 = lex$910();
                    left$1418 = init$1415;
                    right$1419 = parseExpression$954();
                    init$1415 = null;
                }
            }
            if (typeof left$1418 === 'undefined') {
                expect$917(';');
            }
        }
        if (typeof left$1418 === 'undefined') {
            if (!match$919(';')) {
                test$1416 = parseExpression$954();
            }
            expect$917(';');
            if (!match$919(')')) {
                update$1417 = parseExpression$954();
            }
        }
        expect$917(')');
        oldInIteration$1422 = state$878.inIteration;
        state$878.inIteration = true;
        if (!(opts$1414 !== undefined && opts$1414.ignoreBody)) {
            body$1420 = parseStatement$985();
        }
        state$878.inIteration = oldInIteration$1422;
        if (typeof left$1418 === 'undefined') {
            return delegate$873.createForStatement(init$1415, test$1416, update$1417, body$1420);
        }
        if (operator$1421.value === 'in') {
            return delegate$873.createForInStatement(left$1418, right$1419, body$1420);
        }
        return delegate$873.createForOfStatement(left$1418, right$1419, body$1420);
    }
    // 12.7 The continue statement
    function parseContinueStatement$975() {
        var label$1423 = null, key$1424;
        expectKeyword$918('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$876.value.charCodeAt(0) === 59) {
            lex$910();
            if (!state$878.inIteration) {
                throwError$914({}, Messages$859.IllegalContinue);
            }
            return delegate$873.createContinueStatement(null);
        }
        if (peekLineTerminator$913()) {
            if (!state$878.inIteration) {
                throwError$914({}, Messages$859.IllegalContinue);
            }
            return delegate$873.createContinueStatement(null);
        }
        if (lookahead$876.type === Token$854.Identifier) {
            label$1423 = parseVariableIdentifier$957();
            key$1424 = '$' + label$1423.name;
            if (!Object.prototype.hasOwnProperty.call(state$878.labelSet, key$1424)) {
                throwError$914({}, Messages$859.UnknownLabel, label$1423.name);
            }
        }
        consumeSemicolon$923();
        if (label$1423 === null && !state$878.inIteration) {
            throwError$914({}, Messages$859.IllegalContinue);
        }
        return delegate$873.createContinueStatement(label$1423);
    }
    // 12.8 The break statement
    function parseBreakStatement$976() {
        var label$1425 = null, key$1426;
        expectKeyword$918('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$876.value.charCodeAt(0) === 59) {
            lex$910();
            if (!(state$878.inIteration || state$878.inSwitch)) {
                throwError$914({}, Messages$859.IllegalBreak);
            }
            return delegate$873.createBreakStatement(null);
        }
        if (peekLineTerminator$913()) {
            if (!(state$878.inIteration || state$878.inSwitch)) {
                throwError$914({}, Messages$859.IllegalBreak);
            }
            return delegate$873.createBreakStatement(null);
        }
        if (lookahead$876.type === Token$854.Identifier) {
            label$1425 = parseVariableIdentifier$957();
            key$1426 = '$' + label$1425.name;
            if (!Object.prototype.hasOwnProperty.call(state$878.labelSet, key$1426)) {
                throwError$914({}, Messages$859.UnknownLabel, label$1425.name);
            }
        }
        consumeSemicolon$923();
        if (label$1425 === null && !(state$878.inIteration || state$878.inSwitch)) {
            throwError$914({}, Messages$859.IllegalBreak);
        }
        return delegate$873.createBreakStatement(label$1425);
    }
    // 12.9 The return statement
    function parseReturnStatement$977() {
        var argument$1427 = null;
        expectKeyword$918('return');
        if (!state$878.inFunctionBody) {
            throwErrorTolerant$915({}, Messages$859.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$887(String(lookahead$876.value).charCodeAt(0))) {
            argument$1427 = parseExpression$954();
            consumeSemicolon$923();
            return delegate$873.createReturnStatement(argument$1427);
        }
        if (peekLineTerminator$913()) {
            return delegate$873.createReturnStatement(null);
        }
        if (!match$919(';')) {
            if (!match$919('}') && lookahead$876.type !== Token$854.EOF) {
                argument$1427 = parseExpression$954();
            }
        }
        consumeSemicolon$923();
        return delegate$873.createReturnStatement(argument$1427);
    }
    // 12.10 The with statement
    function parseWithStatement$978() {
        var object$1428, body$1429;
        if (strict$864) {
            throwErrorTolerant$915({}, Messages$859.StrictModeWith);
        }
        expectKeyword$918('with');
        expect$917('(');
        object$1428 = parseExpression$954();
        expect$917(')');
        body$1429 = parseStatement$985();
        return delegate$873.createWithStatement(object$1428, body$1429);
    }
    // 12.10 The swith statement
    function parseSwitchCase$979() {
        var test$1430, consequent$1431 = [], sourceElement$1432;
        if (matchKeyword$920('default')) {
            lex$910();
            test$1430 = null;
        } else {
            expectKeyword$918('case');
            test$1430 = parseExpression$954();
        }
        expect$917(':');
        while (streamIndex$875 < length$872) {
            if (match$919('}') || matchKeyword$920('default') || matchKeyword$920('case')) {
                break;
            }
            sourceElement$1432 = parseSourceElement$1000();
            if (typeof sourceElement$1432 === 'undefined') {
                break;
            }
            consequent$1431.push(sourceElement$1432);
        }
        return delegate$873.createSwitchCase(test$1430, consequent$1431);
    }
    function parseSwitchStatement$980() {
        var discriminant$1433, cases$1434, clause$1435, oldInSwitch$1436, defaultFound$1437;
        expectKeyword$918('switch');
        expect$917('(');
        discriminant$1433 = parseExpression$954();
        expect$917(')');
        expect$917('{');
        cases$1434 = [];
        if (match$919('}')) {
            lex$910();
            return delegate$873.createSwitchStatement(discriminant$1433, cases$1434);
        }
        oldInSwitch$1436 = state$878.inSwitch;
        state$878.inSwitch = true;
        defaultFound$1437 = false;
        while (streamIndex$875 < length$872) {
            if (match$919('}')) {
                break;
            }
            clause$1435 = parseSwitchCase$979();
            if (clause$1435.test === null) {
                if (defaultFound$1437) {
                    throwError$914({}, Messages$859.MultipleDefaultsInSwitch);
                }
                defaultFound$1437 = true;
            }
            cases$1434.push(clause$1435);
        }
        state$878.inSwitch = oldInSwitch$1436;
        expect$917('}');
        return delegate$873.createSwitchStatement(discriminant$1433, cases$1434);
    }
    // 12.13 The throw statement
    function parseThrowStatement$981() {
        var argument$1438;
        expectKeyword$918('throw');
        if (peekLineTerminator$913()) {
            throwError$914({}, Messages$859.NewlineAfterThrow);
        }
        argument$1438 = parseExpression$954();
        consumeSemicolon$923();
        return delegate$873.createThrowStatement(argument$1438);
    }
    // 12.14 The try statement
    function parseCatchClause$982() {
        var param$1439, body$1440;
        expectKeyword$918('catch');
        expect$917('(');
        if (match$919(')')) {
            throwUnexpected$916(lookahead$876);
        }
        param$1439 = parseExpression$954();
        // 12.14.1
        if (strict$864 && param$1439.type === Syntax$857.Identifier && isRestrictedWord$891(param$1439.name)) {
            throwErrorTolerant$915({}, Messages$859.StrictCatchVariable);
        }
        expect$917(')');
        body$1440 = parseBlock$956();
        return delegate$873.createCatchClause(param$1439, body$1440);
    }
    function parseTryStatement$983() {
        var block$1441, handlers$1442 = [], finalizer$1443 = null;
        expectKeyword$918('try');
        block$1441 = parseBlock$956();
        if (matchKeyword$920('catch')) {
            handlers$1442.push(parseCatchClause$982());
        }
        if (matchKeyword$920('finally')) {
            lex$910();
            finalizer$1443 = parseBlock$956();
        }
        if (handlers$1442.length === 0 && !finalizer$1443) {
            throwError$914({}, Messages$859.NoCatchOrFinally);
        }
        return delegate$873.createTryStatement(block$1441, [], handlers$1442, finalizer$1443);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$984() {
        expectKeyword$918('debugger');
        consumeSemicolon$923();
        return delegate$873.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$985() {
        var type$1444 = lookahead$876.type, expr$1445, labeledBody$1446, key$1447;
        if (type$1444 === Token$854.EOF) {
            throwUnexpected$916(lookahead$876);
        }
        if (type$1444 === Token$854.Punctuator) {
            switch (lookahead$876.value) {
            case ';':
                return parseEmptyStatement$968();
            case '{':
                return parseBlock$956();
            case '(':
                return parseExpressionStatement$969();
            default:
                break;
            }
        }
        if (type$1444 === Token$854.Keyword) {
            switch (lookahead$876.value) {
            case 'break':
                return parseBreakStatement$976();
            case 'continue':
                return parseContinueStatement$975();
            case 'debugger':
                return parseDebuggerStatement$984();
            case 'do':
                return parseDoWhileStatement$971();
            case 'for':
                return parseForStatement$974();
            case 'function':
                return parseFunctionDeclaration$991();
            case 'class':
                return parseClassDeclaration$998();
            case 'if':
                return parseIfStatement$970();
            case 'return':
                return parseReturnStatement$977();
            case 'switch':
                return parseSwitchStatement$980();
            case 'throw':
                return parseThrowStatement$981();
            case 'try':
                return parseTryStatement$983();
            case 'var':
                return parseVariableStatement$960();
            case 'while':
                return parseWhileStatement$972();
            case 'with':
                return parseWithStatement$978();
            default:
                break;
            }
        }
        expr$1445 = parseExpression$954();
        // 12.12 Labelled Statements
        if (expr$1445.type === Syntax$857.Identifier && match$919(':')) {
            lex$910();
            key$1447 = '$' + expr$1445.name;
            if (Object.prototype.hasOwnProperty.call(state$878.labelSet, key$1447)) {
                throwError$914({}, Messages$859.Redeclaration, 'Label', expr$1445.name);
            }
            state$878.labelSet[key$1447] = true;
            labeledBody$1446 = parseStatement$985();
            delete state$878.labelSet[key$1447];
            return delegate$873.createLabeledStatement(expr$1445, labeledBody$1446);
        }
        consumeSemicolon$923();
        return delegate$873.createExpressionStatement(expr$1445);
    }
    // 13 Function Definition
    function parseConciseBody$986() {
        if (match$919('{')) {
            return parseFunctionSourceElements$987();
        }
        return parseAssignmentExpression$953();
    }
    function parseFunctionSourceElements$987() {
        var sourceElement$1448, sourceElements$1449 = [], token$1450, directive$1451, firstRestricted$1452, oldLabelSet$1453, oldInIteration$1454, oldInSwitch$1455, oldInFunctionBody$1456, oldParenthesizedCount$1457;
        expect$917('{');
        while (streamIndex$875 < length$872) {
            if (lookahead$876.type !== Token$854.StringLiteral) {
                break;
            }
            token$1450 = lookahead$876;
            sourceElement$1448 = parseSourceElement$1000();
            sourceElements$1449.push(sourceElement$1448);
            if (sourceElement$1448.expression.type !== Syntax$857.Literal) {
                // this is not directive
                break;
            }
            directive$1451 = token$1450.value;
            if (directive$1451 === 'use strict') {
                strict$864 = true;
                if (firstRestricted$1452) {
                    throwErrorTolerant$915(firstRestricted$1452, Messages$859.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1452 && token$1450.octal) {
                    firstRestricted$1452 = token$1450;
                }
            }
        }
        oldLabelSet$1453 = state$878.labelSet;
        oldInIteration$1454 = state$878.inIteration;
        oldInSwitch$1455 = state$878.inSwitch;
        oldInFunctionBody$1456 = state$878.inFunctionBody;
        oldParenthesizedCount$1457 = state$878.parenthesizedCount;
        state$878.labelSet = {};
        state$878.inIteration = false;
        state$878.inSwitch = false;
        state$878.inFunctionBody = true;
        state$878.parenthesizedCount = 0;
        while (streamIndex$875 < length$872) {
            if (match$919('}')) {
                break;
            }
            sourceElement$1448 = parseSourceElement$1000();
            if (typeof sourceElement$1448 === 'undefined') {
                break;
            }
            sourceElements$1449.push(sourceElement$1448);
        }
        expect$917('}');
        state$878.labelSet = oldLabelSet$1453;
        state$878.inIteration = oldInIteration$1454;
        state$878.inSwitch = oldInSwitch$1455;
        state$878.inFunctionBody = oldInFunctionBody$1456;
        state$878.parenthesizedCount = oldParenthesizedCount$1457;
        return delegate$873.createBlockStatement(sourceElements$1449);
    }
    function validateParam$988(options$1458, param$1459, name$1460) {
        var key$1461 = '$' + name$1460;
        if (strict$864) {
            if (isRestrictedWord$891(name$1460)) {
                options$1458.stricted = param$1459;
                options$1458.message = Messages$859.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1458.paramSet, key$1461)) {
                options$1458.stricted = param$1459;
                options$1458.message = Messages$859.StrictParamDupe;
            }
        } else if (!options$1458.firstRestricted) {
            if (isRestrictedWord$891(name$1460)) {
                options$1458.firstRestricted = param$1459;
                options$1458.message = Messages$859.StrictParamName;
            } else if (isStrictModeReservedWord$890(name$1460)) {
                options$1458.firstRestricted = param$1459;
                options$1458.message = Messages$859.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1458.paramSet, key$1461)) {
                options$1458.firstRestricted = param$1459;
                options$1458.message = Messages$859.StrictParamDupe;
            }
        }
        options$1458.paramSet[key$1461] = true;
    }
    function parseParam$989(options$1462) {
        var token$1463, rest$1464, param$1465, def$1466;
        token$1463 = lookahead$876;
        if (token$1463.value === '...') {
            token$1463 = lex$910();
            rest$1464 = true;
        }
        if (match$919('[')) {
            param$1465 = parseArrayInitialiser$926();
            reinterpretAsDestructuredParameter$950(options$1462, param$1465);
        } else if (match$919('{')) {
            if (rest$1464) {
                throwError$914({}, Messages$859.ObjectPatternAsRestParameter);
            }
            param$1465 = parseObjectInitialiser$931();
            reinterpretAsDestructuredParameter$950(options$1462, param$1465);
        } else {
            param$1465 = parseVariableIdentifier$957();
            validateParam$988(options$1462, token$1463, token$1463.value);
            if (match$919('=')) {
                if (rest$1464) {
                    throwErrorTolerant$915(lookahead$876, Messages$859.DefaultRestParameter);
                }
                lex$910();
                def$1466 = parseAssignmentExpression$953();
                ++options$1462.defaultCount;
            }
        }
        if (rest$1464) {
            if (!match$919(')')) {
                throwError$914({}, Messages$859.ParameterAfterRestParameter);
            }
            options$1462.rest = param$1465;
            return false;
        }
        options$1462.params.push(param$1465);
        options$1462.defaults.push(def$1466);
        return !match$919(')');
    }
    function parseParams$990(firstRestricted$1467) {
        var options$1468;
        options$1468 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1467
        };
        expect$917('(');
        if (!match$919(')')) {
            options$1468.paramSet = {};
            while (streamIndex$875 < length$872) {
                if (!parseParam$989(options$1468)) {
                    break;
                }
                expect$917(',');
            }
        }
        expect$917(')');
        if (options$1468.defaultCount === 0) {
            options$1468.defaults = [];
        }
        return options$1468;
    }
    function parseFunctionDeclaration$991() {
        var id$1469, body$1470, token$1471, tmp$1472, firstRestricted$1473, message$1474, previousStrict$1475, previousYieldAllowed$1476, generator$1477, expression$1478;
        expectKeyword$918('function');
        generator$1477 = false;
        if (match$919('*')) {
            lex$910();
            generator$1477 = true;
        }
        token$1471 = lookahead$876;
        id$1469 = parseVariableIdentifier$957();
        if (strict$864) {
            if (isRestrictedWord$891(token$1471.value)) {
                throwErrorTolerant$915(token$1471, Messages$859.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$891(token$1471.value)) {
                firstRestricted$1473 = token$1471;
                message$1474 = Messages$859.StrictFunctionName;
            } else if (isStrictModeReservedWord$890(token$1471.value)) {
                firstRestricted$1473 = token$1471;
                message$1474 = Messages$859.StrictReservedWord;
            }
        }
        tmp$1472 = parseParams$990(firstRestricted$1473);
        firstRestricted$1473 = tmp$1472.firstRestricted;
        if (tmp$1472.message) {
            message$1474 = tmp$1472.message;
        }
        previousStrict$1475 = strict$864;
        previousYieldAllowed$1476 = state$878.yieldAllowed;
        state$878.yieldAllowed = generator$1477;
        // here we redo some work in order to set 'expression'
        expression$1478 = !match$919('{');
        body$1470 = parseConciseBody$986();
        if (strict$864 && firstRestricted$1473) {
            throwError$914(firstRestricted$1473, message$1474);
        }
        if (strict$864 && tmp$1472.stricted) {
            throwErrorTolerant$915(tmp$1472.stricted, message$1474);
        }
        if (state$878.yieldAllowed && !state$878.yieldFound) {
            throwErrorTolerant$915({}, Messages$859.NoYieldInGenerator);
        }
        strict$864 = previousStrict$1475;
        state$878.yieldAllowed = previousYieldAllowed$1476;
        return delegate$873.createFunctionDeclaration(id$1469, tmp$1472.params, tmp$1472.defaults, body$1470, tmp$1472.rest, generator$1477, expression$1478);
    }
    function parseFunctionExpression$992() {
        var token$1479, id$1480 = null, firstRestricted$1481, message$1482, tmp$1483, body$1484, previousStrict$1485, previousYieldAllowed$1486, generator$1487, expression$1488;
        expectKeyword$918('function');
        generator$1487 = false;
        if (match$919('*')) {
            lex$910();
            generator$1487 = true;
        }
        if (!match$919('(')) {
            token$1479 = lookahead$876;
            id$1480 = parseVariableIdentifier$957();
            if (strict$864) {
                if (isRestrictedWord$891(token$1479.value)) {
                    throwErrorTolerant$915(token$1479, Messages$859.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$891(token$1479.value)) {
                    firstRestricted$1481 = token$1479;
                    message$1482 = Messages$859.StrictFunctionName;
                } else if (isStrictModeReservedWord$890(token$1479.value)) {
                    firstRestricted$1481 = token$1479;
                    message$1482 = Messages$859.StrictReservedWord;
                }
            }
        }
        tmp$1483 = parseParams$990(firstRestricted$1481);
        firstRestricted$1481 = tmp$1483.firstRestricted;
        if (tmp$1483.message) {
            message$1482 = tmp$1483.message;
        }
        previousStrict$1485 = strict$864;
        previousYieldAllowed$1486 = state$878.yieldAllowed;
        state$878.yieldAllowed = generator$1487;
        // here we redo some work in order to set 'expression'
        expression$1488 = !match$919('{');
        body$1484 = parseConciseBody$986();
        if (strict$864 && firstRestricted$1481) {
            throwError$914(firstRestricted$1481, message$1482);
        }
        if (strict$864 && tmp$1483.stricted) {
            throwErrorTolerant$915(tmp$1483.stricted, message$1482);
        }
        if (state$878.yieldAllowed && !state$878.yieldFound) {
            throwErrorTolerant$915({}, Messages$859.NoYieldInGenerator);
        }
        strict$864 = previousStrict$1485;
        state$878.yieldAllowed = previousYieldAllowed$1486;
        return delegate$873.createFunctionExpression(id$1480, tmp$1483.params, tmp$1483.defaults, body$1484, tmp$1483.rest, generator$1487, expression$1488);
    }
    function parseYieldExpression$993() {
        var delegateFlag$1489, expr$1490, previousYieldAllowed$1491;
        expectKeyword$918('yield');
        if (!state$878.yieldAllowed) {
            throwErrorTolerant$915({}, Messages$859.IllegalYield);
        }
        delegateFlag$1489 = false;
        if (match$919('*')) {
            lex$910();
            delegateFlag$1489 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1491 = state$878.yieldAllowed;
        state$878.yieldAllowed = false;
        expr$1490 = parseAssignmentExpression$953();
        state$878.yieldAllowed = previousYieldAllowed$1491;
        state$878.yieldFound = true;
        return delegate$873.createYieldExpression(expr$1490, delegateFlag$1489);
    }
    // 14 Classes
    function parseMethodDefinition$994(existingPropNames$1492) {
        var token$1493, key$1494, param$1495, propType$1496, isValidDuplicateProp$1497 = false;
        if (lookahead$876.value === 'static') {
            propType$1496 = ClassPropertyType$862.static;
            lex$910();
        } else {
            propType$1496 = ClassPropertyType$862.prototype;
        }
        if (match$919('*')) {
            lex$910();
            return delegate$873.createMethodDefinition(propType$1496, '', parseObjectPropertyKey$929(), parsePropertyMethodFunction$928({ generator: true }));
        }
        token$1493 = lookahead$876;
        key$1494 = parseObjectPropertyKey$929();
        if (token$1493.value === 'get' && !match$919('(')) {
            key$1494 = parseObjectPropertyKey$929();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1492[propType$1496].hasOwnProperty(key$1494.name)) {
                isValidDuplicateProp$1497 = existingPropNames$1492[propType$1496][key$1494.name].get === undefined && existingPropNames$1492[propType$1496][key$1494.name].data === undefined && existingPropNames$1492[propType$1496][key$1494.name].set !== undefined;
                if (!isValidDuplicateProp$1497) {
                    throwError$914(key$1494, Messages$859.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1492[propType$1496][key$1494.name] = {};
            }
            existingPropNames$1492[propType$1496][key$1494.name].get = true;
            expect$917('(');
            expect$917(')');
            return delegate$873.createMethodDefinition(propType$1496, 'get', key$1494, parsePropertyFunction$927({ generator: false }));
        }
        if (token$1493.value === 'set' && !match$919('(')) {
            key$1494 = parseObjectPropertyKey$929();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1492[propType$1496].hasOwnProperty(key$1494.name)) {
                isValidDuplicateProp$1497 = existingPropNames$1492[propType$1496][key$1494.name].set === undefined && existingPropNames$1492[propType$1496][key$1494.name].data === undefined && existingPropNames$1492[propType$1496][key$1494.name].get !== undefined;
                if (!isValidDuplicateProp$1497) {
                    throwError$914(key$1494, Messages$859.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1492[propType$1496][key$1494.name] = {};
            }
            existingPropNames$1492[propType$1496][key$1494.name].set = true;
            expect$917('(');
            token$1493 = lookahead$876;
            param$1495 = [parseVariableIdentifier$957()];
            expect$917(')');
            return delegate$873.createMethodDefinition(propType$1496, 'set', key$1494, parsePropertyFunction$927({
                params: param$1495,
                generator: false,
                name: token$1493
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1492[propType$1496].hasOwnProperty(key$1494.name)) {
            throwError$914(key$1494, Messages$859.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1492[propType$1496][key$1494.name] = {};
        }
        existingPropNames$1492[propType$1496][key$1494.name].data = true;
        return delegate$873.createMethodDefinition(propType$1496, '', key$1494, parsePropertyMethodFunction$928({ generator: false }));
    }
    function parseClassElement$995(existingProps$1498) {
        if (match$919(';')) {
            lex$910();
            return;
        }
        return parseMethodDefinition$994(existingProps$1498);
    }
    function parseClassBody$996() {
        var classElement$1499, classElements$1500 = [], existingProps$1501 = {};
        existingProps$1501[ClassPropertyType$862.static] = {};
        existingProps$1501[ClassPropertyType$862.prototype] = {};
        expect$917('{');
        while (streamIndex$875 < length$872) {
            if (match$919('}')) {
                break;
            }
            classElement$1499 = parseClassElement$995(existingProps$1501);
            if (typeof classElement$1499 !== 'undefined') {
                classElements$1500.push(classElement$1499);
            }
        }
        expect$917('}');
        return delegate$873.createClassBody(classElements$1500);
    }
    function parseClassExpression$997() {
        var id$1502, previousYieldAllowed$1503, superClass$1504 = null;
        expectKeyword$918('class');
        if (!matchKeyword$920('extends') && !match$919('{')) {
            id$1502 = parseVariableIdentifier$957();
        }
        if (matchKeyword$920('extends')) {
            expectKeyword$918('extends');
            previousYieldAllowed$1503 = state$878.yieldAllowed;
            state$878.yieldAllowed = false;
            superClass$1504 = parseAssignmentExpression$953();
            state$878.yieldAllowed = previousYieldAllowed$1503;
        }
        return delegate$873.createClassExpression(id$1502, superClass$1504, parseClassBody$996());
    }
    function parseClassDeclaration$998() {
        var id$1505, previousYieldAllowed$1506, superClass$1507 = null;
        expectKeyword$918('class');
        id$1505 = parseVariableIdentifier$957();
        if (matchKeyword$920('extends')) {
            expectKeyword$918('extends');
            previousYieldAllowed$1506 = state$878.yieldAllowed;
            state$878.yieldAllowed = false;
            superClass$1507 = parseAssignmentExpression$953();
            state$878.yieldAllowed = previousYieldAllowed$1506;
        }
        return delegate$873.createClassDeclaration(id$1505, superClass$1507, parseClassBody$996());
    }
    // 15 Program
    function matchModuleDeclaration$999() {
        var id$1508;
        if (matchContextualKeyword$921('module')) {
            id$1508 = lookahead2$912();
            return id$1508.type === Token$854.StringLiteral || id$1508.type === Token$854.Identifier;
        }
        return false;
    }
    function parseSourceElement$1000() {
        if (lookahead$876.type === Token$854.Keyword) {
            switch (lookahead$876.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$961(lookahead$876.value);
            case 'function':
                return parseFunctionDeclaration$991();
            case 'export':
                return parseExportDeclaration$965();
            case 'import':
                return parseImportDeclaration$966();
            default:
                return parseStatement$985();
            }
        }
        if (matchModuleDeclaration$999()) {
            throwError$914({}, Messages$859.NestedModule);
        }
        if (lookahead$876.type !== Token$854.EOF) {
            return parseStatement$985();
        }
    }
    function parseProgramElement$1001() {
        if (lookahead$876.type === Token$854.Keyword) {
            switch (lookahead$876.value) {
            case 'export':
                return parseExportDeclaration$965();
            case 'import':
                return parseImportDeclaration$966();
            }
        }
        if (matchModuleDeclaration$999()) {
            return parseModuleDeclaration$962();
        }
        return parseSourceElement$1000();
    }
    function parseProgramElements$1002() {
        var sourceElement$1509, sourceElements$1510 = [], token$1511, directive$1512, firstRestricted$1513;
        while (streamIndex$875 < length$872) {
            token$1511 = lookahead$876;
            if (token$1511.type !== Token$854.StringLiteral) {
                break;
            }
            sourceElement$1509 = parseProgramElement$1001();
            sourceElements$1510.push(sourceElement$1509);
            if (sourceElement$1509.expression.type !== Syntax$857.Literal) {
                // this is not directive
                break;
            }
            directive$1512 = token$1511.value;
            if (directive$1512 === 'use strict') {
                strict$864 = true;
                if (firstRestricted$1513) {
                    throwErrorTolerant$915(firstRestricted$1513, Messages$859.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1513 && token$1511.octal) {
                    firstRestricted$1513 = token$1511;
                }
            }
        }
        while (streamIndex$875 < length$872) {
            sourceElement$1509 = parseProgramElement$1001();
            if (typeof sourceElement$1509 === 'undefined') {
                break;
            }
            sourceElements$1510.push(sourceElement$1509);
        }
        return sourceElements$1510;
    }
    function parseModuleElement$1003() {
        return parseSourceElement$1000();
    }
    function parseModuleElements$1004() {
        var list$1514 = [], statement$1515;
        while (streamIndex$875 < length$872) {
            if (match$919('}')) {
                break;
            }
            statement$1515 = parseModuleElement$1003();
            if (typeof statement$1515 === 'undefined') {
                break;
            }
            list$1514.push(statement$1515);
        }
        return list$1514;
    }
    function parseModuleBlock$1005() {
        var block$1516;
        expect$917('{');
        block$1516 = parseModuleElements$1004();
        expect$917('}');
        return delegate$873.createBlockStatement(block$1516);
    }
    function parseProgram$1006() {
        var body$1517;
        strict$864 = false;
        peek$911();
        body$1517 = parseProgramElements$1002();
        return delegate$873.createProgram(body$1517);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1007(type$1518, value$1519, start$1520, end$1521, loc$1522) {
        assert$880(typeof start$1520 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$879.comments.length > 0) {
            if (extra$879.comments[extra$879.comments.length - 1].range[1] > start$1520) {
                return;
            }
        }
        extra$879.comments.push({
            type: type$1518,
            value: value$1519,
            range: [
                start$1520,
                end$1521
            ],
            loc: loc$1522
        });
    }
    function scanComment$1008() {
        var comment$1523, ch$1524, loc$1525, start$1526, blockComment$1527, lineComment$1528;
        comment$1523 = '';
        blockComment$1527 = false;
        lineComment$1528 = false;
        while (index$865 < length$872) {
            ch$1524 = source$863[index$865];
            if (lineComment$1528) {
                ch$1524 = source$863[index$865++];
                if (isLineTerminator$886(ch$1524.charCodeAt(0))) {
                    loc$1525.end = {
                        line: lineNumber$866,
                        column: index$865 - lineStart$867 - 1
                    };
                    lineComment$1528 = false;
                    addComment$1007('Line', comment$1523, start$1526, index$865 - 1, loc$1525);
                    if (ch$1524 === '\r' && source$863[index$865] === '\n') {
                        ++index$865;
                    }
                    ++lineNumber$866;
                    lineStart$867 = index$865;
                    comment$1523 = '';
                } else if (index$865 >= length$872) {
                    lineComment$1528 = false;
                    comment$1523 += ch$1524;
                    loc$1525.end = {
                        line: lineNumber$866,
                        column: length$872 - lineStart$867
                    };
                    addComment$1007('Line', comment$1523, start$1526, length$872, loc$1525);
                } else {
                    comment$1523 += ch$1524;
                }
            } else if (blockComment$1527) {
                if (isLineTerminator$886(ch$1524.charCodeAt(0))) {
                    if (ch$1524 === '\r' && source$863[index$865 + 1] === '\n') {
                        ++index$865;
                        comment$1523 += '\r\n';
                    } else {
                        comment$1523 += ch$1524;
                    }
                    ++lineNumber$866;
                    ++index$865;
                    lineStart$867 = index$865;
                    if (index$865 >= length$872) {
                        throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1524 = source$863[index$865++];
                    if (index$865 >= length$872) {
                        throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1523 += ch$1524;
                    if (ch$1524 === '*') {
                        ch$1524 = source$863[index$865];
                        if (ch$1524 === '/') {
                            comment$1523 = comment$1523.substr(0, comment$1523.length - 1);
                            blockComment$1527 = false;
                            ++index$865;
                            loc$1525.end = {
                                line: lineNumber$866,
                                column: index$865 - lineStart$867
                            };
                            addComment$1007('Block', comment$1523, start$1526, index$865, loc$1525);
                            comment$1523 = '';
                        }
                    }
                }
            } else if (ch$1524 === '/') {
                ch$1524 = source$863[index$865 + 1];
                if (ch$1524 === '/') {
                    loc$1525 = {
                        start: {
                            line: lineNumber$866,
                            column: index$865 - lineStart$867
                        }
                    };
                    start$1526 = index$865;
                    index$865 += 2;
                    lineComment$1528 = true;
                    if (index$865 >= length$872) {
                        loc$1525.end = {
                            line: lineNumber$866,
                            column: index$865 - lineStart$867
                        };
                        lineComment$1528 = false;
                        addComment$1007('Line', comment$1523, start$1526, index$865, loc$1525);
                    }
                } else if (ch$1524 === '*') {
                    start$1526 = index$865;
                    index$865 += 2;
                    blockComment$1527 = true;
                    loc$1525 = {
                        start: {
                            line: lineNumber$866,
                            column: index$865 - lineStart$867 - 2
                        }
                    };
                    if (index$865 >= length$872) {
                        throwError$914({}, Messages$859.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$885(ch$1524.charCodeAt(0))) {
                ++index$865;
            } else if (isLineTerminator$886(ch$1524.charCodeAt(0))) {
                ++index$865;
                if (ch$1524 === '\r' && source$863[index$865] === '\n') {
                    ++index$865;
                }
                ++lineNumber$866;
                lineStart$867 = index$865;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1009() {
        var i$1529, entry$1530, comment$1531, comments$1532 = [];
        for (i$1529 = 0; i$1529 < extra$879.comments.length; ++i$1529) {
            entry$1530 = extra$879.comments[i$1529];
            comment$1531 = {
                type: entry$1530.type,
                value: entry$1530.value
            };
            if (extra$879.range) {
                comment$1531.range = entry$1530.range;
            }
            if (extra$879.loc) {
                comment$1531.loc = entry$1530.loc;
            }
            comments$1532.push(comment$1531);
        }
        extra$879.comments = comments$1532;
    }
    function collectToken$1010() {
        var start$1533, loc$1534, token$1535, range$1536, value$1537;
        skipComment$893();
        start$1533 = index$865;
        loc$1534 = {
            start: {
                line: lineNumber$866,
                column: index$865 - lineStart$867
            }
        };
        token$1535 = extra$879.advance();
        loc$1534.end = {
            line: lineNumber$866,
            column: index$865 - lineStart$867
        };
        if (token$1535.type !== Token$854.EOF) {
            range$1536 = [
                token$1535.range[0],
                token$1535.range[1]
            ];
            value$1537 = source$863.slice(token$1535.range[0], token$1535.range[1]);
            extra$879.tokens.push({
                type: TokenName$855[token$1535.type],
                value: value$1537,
                range: range$1536,
                loc: loc$1534
            });
        }
        return token$1535;
    }
    function collectRegex$1011() {
        var pos$1538, loc$1539, regex$1540, token$1541;
        skipComment$893();
        pos$1538 = index$865;
        loc$1539 = {
            start: {
                line: lineNumber$866,
                column: index$865 - lineStart$867
            }
        };
        regex$1540 = extra$879.scanRegExp();
        loc$1539.end = {
            line: lineNumber$866,
            column: index$865 - lineStart$867
        };
        if (!extra$879.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$879.tokens.length > 0) {
                token$1541 = extra$879.tokens[extra$879.tokens.length - 1];
                if (token$1541.range[0] === pos$1538 && token$1541.type === 'Punctuator') {
                    if (token$1541.value === '/' || token$1541.value === '/=') {
                        extra$879.tokens.pop();
                    }
                }
            }
            extra$879.tokens.push({
                type: 'RegularExpression',
                value: regex$1540.literal,
                range: [
                    pos$1538,
                    index$865
                ],
                loc: loc$1539
            });
        }
        return regex$1540;
    }
    function filterTokenLocation$1012() {
        var i$1542, entry$1543, token$1544, tokens$1545 = [];
        for (i$1542 = 0; i$1542 < extra$879.tokens.length; ++i$1542) {
            entry$1543 = extra$879.tokens[i$1542];
            token$1544 = {
                type: entry$1543.type,
                value: entry$1543.value
            };
            if (extra$879.range) {
                token$1544.range = entry$1543.range;
            }
            if (extra$879.loc) {
                token$1544.loc = entry$1543.loc;
            }
            tokens$1545.push(token$1544);
        }
        extra$879.tokens = tokens$1545;
    }
    function LocationMarker$1013() {
        var sm_index$1546 = lookahead$876 ? lookahead$876.sm_range[0] : 0;
        var sm_lineStart$1547 = lookahead$876 ? lookahead$876.sm_lineStart : 0;
        var sm_lineNumber$1548 = lookahead$876 ? lookahead$876.sm_lineNumber : 1;
        this.range = [
            sm_index$1546,
            sm_index$1546
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1548,
                column: sm_index$1546 - sm_lineStart$1547
            },
            end: {
                line: sm_lineNumber$1548,
                column: sm_index$1546 - sm_lineStart$1547
            }
        };
    }
    LocationMarker$1013.prototype = {
        constructor: LocationMarker$1013,
        end: function () {
            this.range[1] = sm_index$871;
            this.loc.end.line = sm_lineNumber$868;
            this.loc.end.column = sm_index$871 - sm_lineStart$869;
        },
        applyGroup: function (node$1549) {
            if (extra$879.range) {
                node$1549.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$879.loc) {
                node$1549.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1549 = delegate$873.postProcess(node$1549);
            }
        },
        apply: function (node$1550) {
            var nodeType$1551 = typeof node$1550;
            assert$880(nodeType$1551 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1551);
            if (extra$879.range) {
                node$1550.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$879.loc) {
                node$1550.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1550 = delegate$873.postProcess(node$1550);
            }
        }
    };
    function createLocationMarker$1014() {
        return new LocationMarker$1013();
    }
    function trackGroupExpression$1015() {
        var marker$1552, expr$1553;
        marker$1552 = createLocationMarker$1014();
        expect$917('(');
        ++state$878.parenthesizedCount;
        expr$1553 = parseExpression$954();
        expect$917(')');
        marker$1552.end();
        marker$1552.applyGroup(expr$1553);
        return expr$1553;
    }
    function trackLeftHandSideExpression$1016() {
        var marker$1554, expr$1555;
        // skipComment();
        marker$1554 = createLocationMarker$1014();
        expr$1555 = matchKeyword$920('new') ? parseNewExpression$941() : parsePrimaryExpression$935();
        while (match$919('.') || match$919('[') || lookahead$876.type === Token$854.Template) {
            if (match$919('[')) {
                expr$1555 = delegate$873.createMemberExpression('[', expr$1555, parseComputedMember$940());
                marker$1554.end();
                marker$1554.apply(expr$1555);
            } else if (match$919('.')) {
                expr$1555 = delegate$873.createMemberExpression('.', expr$1555, parseNonComputedMember$939());
                marker$1554.end();
                marker$1554.apply(expr$1555);
            } else {
                expr$1555 = delegate$873.createTaggedTemplateExpression(expr$1555, parseTemplateLiteral$933());
                marker$1554.end();
                marker$1554.apply(expr$1555);
            }
        }
        return expr$1555;
    }
    function trackLeftHandSideExpressionAllowCall$1017() {
        var marker$1556, expr$1557, args$1558;
        // skipComment();
        marker$1556 = createLocationMarker$1014();
        expr$1557 = matchKeyword$920('new') ? parseNewExpression$941() : parsePrimaryExpression$935();
        while (match$919('.') || match$919('[') || match$919('(') || lookahead$876.type === Token$854.Template) {
            if (match$919('(')) {
                args$1558 = parseArguments$936();
                expr$1557 = delegate$873.createCallExpression(expr$1557, args$1558);
                marker$1556.end();
                marker$1556.apply(expr$1557);
            } else if (match$919('[')) {
                expr$1557 = delegate$873.createMemberExpression('[', expr$1557, parseComputedMember$940());
                marker$1556.end();
                marker$1556.apply(expr$1557);
            } else if (match$919('.')) {
                expr$1557 = delegate$873.createMemberExpression('.', expr$1557, parseNonComputedMember$939());
                marker$1556.end();
                marker$1556.apply(expr$1557);
            } else {
                expr$1557 = delegate$873.createTaggedTemplateExpression(expr$1557, parseTemplateLiteral$933());
                marker$1556.end();
                marker$1556.apply(expr$1557);
            }
        }
        return expr$1557;
    }
    function filterGroup$1018(node$1559) {
        var n$1560, i$1561, entry$1562;
        n$1560 = Object.prototype.toString.apply(node$1559) === '[object Array]' ? [] : {};
        for (i$1561 in node$1559) {
            if (node$1559.hasOwnProperty(i$1561) && i$1561 !== 'groupRange' && i$1561 !== 'groupLoc') {
                entry$1562 = node$1559[i$1561];
                if (entry$1562 === null || typeof entry$1562 !== 'object' || entry$1562 instanceof RegExp) {
                    n$1560[i$1561] = entry$1562;
                } else {
                    n$1560[i$1561] = filterGroup$1018(entry$1562);
                }
            }
        }
        return n$1560;
    }
    function wrapTrackingFunction$1019(range$1563, loc$1564) {
        return function (parseFunction$1565) {
            function isBinary$1566(node$1568) {
                return node$1568.type === Syntax$857.LogicalExpression || node$1568.type === Syntax$857.BinaryExpression;
            }
            function visit$1567(node$1569) {
                var start$1570, end$1571;
                if (isBinary$1566(node$1569.left)) {
                    visit$1567(node$1569.left);
                }
                if (isBinary$1566(node$1569.right)) {
                    visit$1567(node$1569.right);
                }
                if (range$1563) {
                    if (node$1569.left.groupRange || node$1569.right.groupRange) {
                        start$1570 = node$1569.left.groupRange ? node$1569.left.groupRange[0] : node$1569.left.range[0];
                        end$1571 = node$1569.right.groupRange ? node$1569.right.groupRange[1] : node$1569.right.range[1];
                        node$1569.range = [
                            start$1570,
                            end$1571
                        ];
                    } else if (typeof node$1569.range === 'undefined') {
                        start$1570 = node$1569.left.range[0];
                        end$1571 = node$1569.right.range[1];
                        node$1569.range = [
                            start$1570,
                            end$1571
                        ];
                    }
                }
                if (loc$1564) {
                    if (node$1569.left.groupLoc || node$1569.right.groupLoc) {
                        start$1570 = node$1569.left.groupLoc ? node$1569.left.groupLoc.start : node$1569.left.loc.start;
                        end$1571 = node$1569.right.groupLoc ? node$1569.right.groupLoc.end : node$1569.right.loc.end;
                        node$1569.loc = {
                            start: start$1570,
                            end: end$1571
                        };
                        node$1569 = delegate$873.postProcess(node$1569);
                    } else if (typeof node$1569.loc === 'undefined') {
                        node$1569.loc = {
                            start: node$1569.left.loc.start,
                            end: node$1569.right.loc.end
                        };
                        node$1569 = delegate$873.postProcess(node$1569);
                    }
                }
            }
            return function () {
                var marker$1572, node$1573, curr$1574 = lookahead$876;
                marker$1572 = createLocationMarker$1014();
                node$1573 = parseFunction$1565.apply(null, arguments);
                marker$1572.end();
                if (node$1573.type !== Syntax$857.Program) {
                    if (curr$1574.leadingComments) {
                        node$1573.leadingComments = curr$1574.leadingComments;
                    }
                    if (curr$1574.trailingComments) {
                        node$1573.trailingComments = curr$1574.trailingComments;
                    }
                }
                if (range$1563 && typeof node$1573.range === 'undefined') {
                    marker$1572.apply(node$1573);
                }
                if (loc$1564 && typeof node$1573.loc === 'undefined') {
                    marker$1572.apply(node$1573);
                }
                if (isBinary$1566(node$1573)) {
                    visit$1567(node$1573);
                }
                return node$1573;
            };
        };
    }
    function patch$1020() {
        var wrapTracking$1575;
        if (extra$879.comments) {
            extra$879.skipComment = skipComment$893;
            skipComment$893 = scanComment$1008;
        }
        if (extra$879.range || extra$879.loc) {
            extra$879.parseGroupExpression = parseGroupExpression$934;
            extra$879.parseLeftHandSideExpression = parseLeftHandSideExpression$943;
            extra$879.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$942;
            parseGroupExpression$934 = trackGroupExpression$1015;
            parseLeftHandSideExpression$943 = trackLeftHandSideExpression$1016;
            parseLeftHandSideExpressionAllowCall$942 = trackLeftHandSideExpressionAllowCall$1017;
            wrapTracking$1575 = wrapTrackingFunction$1019(extra$879.range, extra$879.loc);
            extra$879.parseArrayInitialiser = parseArrayInitialiser$926;
            extra$879.parseAssignmentExpression = parseAssignmentExpression$953;
            extra$879.parseBinaryExpression = parseBinaryExpression$947;
            extra$879.parseBlock = parseBlock$956;
            extra$879.parseFunctionSourceElements = parseFunctionSourceElements$987;
            extra$879.parseCatchClause = parseCatchClause$982;
            extra$879.parseComputedMember = parseComputedMember$940;
            extra$879.parseConditionalExpression = parseConditionalExpression$948;
            extra$879.parseConstLetDeclaration = parseConstLetDeclaration$961;
            extra$879.parseExportBatchSpecifier = parseExportBatchSpecifier$963;
            extra$879.parseExportDeclaration = parseExportDeclaration$965;
            extra$879.parseExportSpecifier = parseExportSpecifier$964;
            extra$879.parseExpression = parseExpression$954;
            extra$879.parseForVariableDeclaration = parseForVariableDeclaration$973;
            extra$879.parseFunctionDeclaration = parseFunctionDeclaration$991;
            extra$879.parseFunctionExpression = parseFunctionExpression$992;
            extra$879.parseParams = parseParams$990;
            extra$879.parseImportDeclaration = parseImportDeclaration$966;
            extra$879.parseImportSpecifier = parseImportSpecifier$967;
            extra$879.parseModuleDeclaration = parseModuleDeclaration$962;
            extra$879.parseModuleBlock = parseModuleBlock$1005;
            extra$879.parseNewExpression = parseNewExpression$941;
            extra$879.parseNonComputedProperty = parseNonComputedProperty$938;
            extra$879.parseObjectInitialiser = parseObjectInitialiser$931;
            extra$879.parseObjectProperty = parseObjectProperty$930;
            extra$879.parseObjectPropertyKey = parseObjectPropertyKey$929;
            extra$879.parsePostfixExpression = parsePostfixExpression$944;
            extra$879.parsePrimaryExpression = parsePrimaryExpression$935;
            extra$879.parseProgram = parseProgram$1006;
            extra$879.parsePropertyFunction = parsePropertyFunction$927;
            extra$879.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$937;
            extra$879.parseTemplateElement = parseTemplateElement$932;
            extra$879.parseTemplateLiteral = parseTemplateLiteral$933;
            extra$879.parseStatement = parseStatement$985;
            extra$879.parseSwitchCase = parseSwitchCase$979;
            extra$879.parseUnaryExpression = parseUnaryExpression$945;
            extra$879.parseVariableDeclaration = parseVariableDeclaration$958;
            extra$879.parseVariableIdentifier = parseVariableIdentifier$957;
            extra$879.parseMethodDefinition = parseMethodDefinition$994;
            extra$879.parseClassDeclaration = parseClassDeclaration$998;
            extra$879.parseClassExpression = parseClassExpression$997;
            extra$879.parseClassBody = parseClassBody$996;
            parseArrayInitialiser$926 = wrapTracking$1575(extra$879.parseArrayInitialiser);
            parseAssignmentExpression$953 = wrapTracking$1575(extra$879.parseAssignmentExpression);
            parseBinaryExpression$947 = wrapTracking$1575(extra$879.parseBinaryExpression);
            parseBlock$956 = wrapTracking$1575(extra$879.parseBlock);
            parseFunctionSourceElements$987 = wrapTracking$1575(extra$879.parseFunctionSourceElements);
            parseCatchClause$982 = wrapTracking$1575(extra$879.parseCatchClause);
            parseComputedMember$940 = wrapTracking$1575(extra$879.parseComputedMember);
            parseConditionalExpression$948 = wrapTracking$1575(extra$879.parseConditionalExpression);
            parseConstLetDeclaration$961 = wrapTracking$1575(extra$879.parseConstLetDeclaration);
            parseExportBatchSpecifier$963 = wrapTracking$1575(parseExportBatchSpecifier$963);
            parseExportDeclaration$965 = wrapTracking$1575(parseExportDeclaration$965);
            parseExportSpecifier$964 = wrapTracking$1575(parseExportSpecifier$964);
            parseExpression$954 = wrapTracking$1575(extra$879.parseExpression);
            parseForVariableDeclaration$973 = wrapTracking$1575(extra$879.parseForVariableDeclaration);
            parseFunctionDeclaration$991 = wrapTracking$1575(extra$879.parseFunctionDeclaration);
            parseFunctionExpression$992 = wrapTracking$1575(extra$879.parseFunctionExpression);
            parseParams$990 = wrapTracking$1575(extra$879.parseParams);
            parseImportDeclaration$966 = wrapTracking$1575(extra$879.parseImportDeclaration);
            parseImportSpecifier$967 = wrapTracking$1575(extra$879.parseImportSpecifier);
            parseModuleDeclaration$962 = wrapTracking$1575(extra$879.parseModuleDeclaration);
            parseModuleBlock$1005 = wrapTracking$1575(extra$879.parseModuleBlock);
            parseLeftHandSideExpression$943 = wrapTracking$1575(parseLeftHandSideExpression$943);
            parseNewExpression$941 = wrapTracking$1575(extra$879.parseNewExpression);
            parseNonComputedProperty$938 = wrapTracking$1575(extra$879.parseNonComputedProperty);
            parseObjectInitialiser$931 = wrapTracking$1575(extra$879.parseObjectInitialiser);
            parseObjectProperty$930 = wrapTracking$1575(extra$879.parseObjectProperty);
            parseObjectPropertyKey$929 = wrapTracking$1575(extra$879.parseObjectPropertyKey);
            parsePostfixExpression$944 = wrapTracking$1575(extra$879.parsePostfixExpression);
            parsePrimaryExpression$935 = wrapTracking$1575(extra$879.parsePrimaryExpression);
            parseProgram$1006 = wrapTracking$1575(extra$879.parseProgram);
            parsePropertyFunction$927 = wrapTracking$1575(extra$879.parsePropertyFunction);
            parseTemplateElement$932 = wrapTracking$1575(extra$879.parseTemplateElement);
            parseTemplateLiteral$933 = wrapTracking$1575(extra$879.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$937 = wrapTracking$1575(extra$879.parseSpreadOrAssignmentExpression);
            parseStatement$985 = wrapTracking$1575(extra$879.parseStatement);
            parseSwitchCase$979 = wrapTracking$1575(extra$879.parseSwitchCase);
            parseUnaryExpression$945 = wrapTracking$1575(extra$879.parseUnaryExpression);
            parseVariableDeclaration$958 = wrapTracking$1575(extra$879.parseVariableDeclaration);
            parseVariableIdentifier$957 = wrapTracking$1575(extra$879.parseVariableIdentifier);
            parseMethodDefinition$994 = wrapTracking$1575(extra$879.parseMethodDefinition);
            parseClassDeclaration$998 = wrapTracking$1575(extra$879.parseClassDeclaration);
            parseClassExpression$997 = wrapTracking$1575(extra$879.parseClassExpression);
            parseClassBody$996 = wrapTracking$1575(extra$879.parseClassBody);
        }
        if (typeof extra$879.tokens !== 'undefined') {
            extra$879.advance = advance$909;
            extra$879.scanRegExp = scanRegExp$906;
            advance$909 = collectToken$1010;
            scanRegExp$906 = collectRegex$1011;
        }
    }
    function unpatch$1021() {
        if (typeof extra$879.skipComment === 'function') {
            skipComment$893 = extra$879.skipComment;
        }
        if (extra$879.range || extra$879.loc) {
            parseArrayInitialiser$926 = extra$879.parseArrayInitialiser;
            parseAssignmentExpression$953 = extra$879.parseAssignmentExpression;
            parseBinaryExpression$947 = extra$879.parseBinaryExpression;
            parseBlock$956 = extra$879.parseBlock;
            parseFunctionSourceElements$987 = extra$879.parseFunctionSourceElements;
            parseCatchClause$982 = extra$879.parseCatchClause;
            parseComputedMember$940 = extra$879.parseComputedMember;
            parseConditionalExpression$948 = extra$879.parseConditionalExpression;
            parseConstLetDeclaration$961 = extra$879.parseConstLetDeclaration;
            parseExportBatchSpecifier$963 = extra$879.parseExportBatchSpecifier;
            parseExportDeclaration$965 = extra$879.parseExportDeclaration;
            parseExportSpecifier$964 = extra$879.parseExportSpecifier;
            parseExpression$954 = extra$879.parseExpression;
            parseForVariableDeclaration$973 = extra$879.parseForVariableDeclaration;
            parseFunctionDeclaration$991 = extra$879.parseFunctionDeclaration;
            parseFunctionExpression$992 = extra$879.parseFunctionExpression;
            parseImportDeclaration$966 = extra$879.parseImportDeclaration;
            parseImportSpecifier$967 = extra$879.parseImportSpecifier;
            parseGroupExpression$934 = extra$879.parseGroupExpression;
            parseLeftHandSideExpression$943 = extra$879.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$942 = extra$879.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$962 = extra$879.parseModuleDeclaration;
            parseModuleBlock$1005 = extra$879.parseModuleBlock;
            parseNewExpression$941 = extra$879.parseNewExpression;
            parseNonComputedProperty$938 = extra$879.parseNonComputedProperty;
            parseObjectInitialiser$931 = extra$879.parseObjectInitialiser;
            parseObjectProperty$930 = extra$879.parseObjectProperty;
            parseObjectPropertyKey$929 = extra$879.parseObjectPropertyKey;
            parsePostfixExpression$944 = extra$879.parsePostfixExpression;
            parsePrimaryExpression$935 = extra$879.parsePrimaryExpression;
            parseProgram$1006 = extra$879.parseProgram;
            parsePropertyFunction$927 = extra$879.parsePropertyFunction;
            parseTemplateElement$932 = extra$879.parseTemplateElement;
            parseTemplateLiteral$933 = extra$879.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$937 = extra$879.parseSpreadOrAssignmentExpression;
            parseStatement$985 = extra$879.parseStatement;
            parseSwitchCase$979 = extra$879.parseSwitchCase;
            parseUnaryExpression$945 = extra$879.parseUnaryExpression;
            parseVariableDeclaration$958 = extra$879.parseVariableDeclaration;
            parseVariableIdentifier$957 = extra$879.parseVariableIdentifier;
            parseMethodDefinition$994 = extra$879.parseMethodDefinition;
            parseClassDeclaration$998 = extra$879.parseClassDeclaration;
            parseClassExpression$997 = extra$879.parseClassExpression;
            parseClassBody$996 = extra$879.parseClassBody;
        }
        if (typeof extra$879.scanRegExp === 'function') {
            advance$909 = extra$879.advance;
            scanRegExp$906 = extra$879.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1022(object$1576, properties$1577) {
        var entry$1578, result$1579 = {};
        for (entry$1578 in object$1576) {
            if (object$1576.hasOwnProperty(entry$1578)) {
                result$1579[entry$1578] = object$1576[entry$1578];
            }
        }
        for (entry$1578 in properties$1577) {
            if (properties$1577.hasOwnProperty(entry$1578)) {
                result$1579[entry$1578] = properties$1577[entry$1578];
            }
        }
        return result$1579;
    }
    function tokenize$1023(code$1580, options$1581) {
        var toString$1582, token$1583, tokens$1584;
        toString$1582 = String;
        if (typeof code$1580 !== 'string' && !(code$1580 instanceof String)) {
            code$1580 = toString$1582(code$1580);
        }
        delegate$873 = SyntaxTreeDelegate$861;
        source$863 = code$1580;
        index$865 = 0;
        lineNumber$866 = source$863.length > 0 ? 1 : 0;
        lineStart$867 = 0;
        length$872 = source$863.length;
        lookahead$876 = null;
        state$878 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$879 = {};
        // Options matching.
        options$1581 = options$1581 || {};
        // Of course we collect tokens here.
        options$1581.tokens = true;
        extra$879.tokens = [];
        extra$879.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$879.openParenToken = -1;
        extra$879.openCurlyToken = -1;
        extra$879.range = typeof options$1581.range === 'boolean' && options$1581.range;
        extra$879.loc = typeof options$1581.loc === 'boolean' && options$1581.loc;
        if (typeof options$1581.comment === 'boolean' && options$1581.comment) {
            extra$879.comments = [];
        }
        if (typeof options$1581.tolerant === 'boolean' && options$1581.tolerant) {
            extra$879.errors = [];
        }
        if (length$872 > 0) {
            if (typeof source$863[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1580 instanceof String) {
                    source$863 = code$1580.valueOf();
                }
            }
        }
        patch$1020();
        try {
            peek$911();
            if (lookahead$876.type === Token$854.EOF) {
                return extra$879.tokens;
            }
            token$1583 = lex$910();
            while (lookahead$876.type !== Token$854.EOF) {
                try {
                    token$1583 = lex$910();
                } catch (lexError$1585) {
                    token$1583 = lookahead$876;
                    if (extra$879.errors) {
                        extra$879.errors.push(lexError$1585);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1585;
                    }
                }
            }
            filterTokenLocation$1012();
            tokens$1584 = extra$879.tokens;
            if (typeof extra$879.comments !== 'undefined') {
                filterCommentLocation$1009();
                tokens$1584.comments = extra$879.comments;
            }
            if (typeof extra$879.errors !== 'undefined') {
                tokens$1584.errors = extra$879.errors;
            }
        } catch (e$1586) {
            throw e$1586;
        } finally {
            unpatch$1021();
            extra$879 = {};
        }
        return tokens$1584;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1024(toks$1587, start$1588, inExprDelim$1589, parentIsBlock$1590) {
        var assignOps$1591 = [
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
        var binaryOps$1592 = [
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
        var unaryOps$1593 = [
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
        function back$1594(n$1595) {
            var idx$1596 = toks$1587.length - n$1595 > 0 ? toks$1587.length - n$1595 : 0;
            return toks$1587[idx$1596];
        }
        if (inExprDelim$1589 && toks$1587.length - (start$1588 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1594(start$1588 + 2).value === ':' && parentIsBlock$1590) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$881(back$1594(start$1588 + 2).value, unaryOps$1593.concat(binaryOps$1592).concat(assignOps$1591))) {
            // ... + {...}
            return false;
        } else if (back$1594(start$1588 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1597 = typeof back$1594(start$1588 + 1).startLineNumber !== 'undefined' ? back$1594(start$1588 + 1).startLineNumber : back$1594(start$1588 + 1).lineNumber;
            if (back$1594(start$1588 + 2).lineNumber !== currLineNumber$1597) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$881(back$1594(start$1588 + 2).value, [
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
    function readToken$1025(toks$1598, inExprDelim$1599, parentIsBlock$1600) {
        var delimiters$1601 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1602 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1603 = toks$1598.length - 1;
        var comments$1604, commentsLen$1605 = extra$879.comments.length;
        function back$1606(n$1610) {
            var idx$1611 = toks$1598.length - n$1610 > 0 ? toks$1598.length - n$1610 : 0;
            return toks$1598[idx$1611];
        }
        function attachComments$1607(token$1612) {
            if (comments$1604) {
                token$1612.leadingComments = comments$1604;
            }
            return token$1612;
        }
        function _advance$1608() {
            return attachComments$1607(advance$909());
        }
        function _scanRegExp$1609() {
            return attachComments$1607(scanRegExp$906());
        }
        skipComment$893();
        if (extra$879.comments.length > commentsLen$1605) {
            comments$1604 = extra$879.comments.slice(commentsLen$1605);
        }
        if (isIn$881(source$863[index$865], delimiters$1601)) {
            return attachComments$1607(readDelim$1026(toks$1598, inExprDelim$1599, parentIsBlock$1600));
        }
        if (source$863[index$865] === '/') {
            var prev$1613 = back$1606(1);
            if (prev$1613) {
                if (prev$1613.value === '()') {
                    if (isIn$881(back$1606(2).value, parenIdents$1602)) {
                        // ... if (...) / ...
                        return _scanRegExp$1609();
                    }
                    // ... (...) / ...
                    return _advance$1608();
                }
                if (prev$1613.value === '{}') {
                    if (blockAllowed$1024(toks$1598, 0, inExprDelim$1599, parentIsBlock$1600)) {
                        if (back$1606(2).value === '()') {
                            // named function
                            if (back$1606(4).value === 'function') {
                                if (!blockAllowed$1024(toks$1598, 3, inExprDelim$1599, parentIsBlock$1600)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1608();
                                }
                                if (toks$1598.length - 5 <= 0 && inExprDelim$1599) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1608();
                                }
                            }
                            // unnamed function
                            if (back$1606(3).value === 'function') {
                                if (!blockAllowed$1024(toks$1598, 2, inExprDelim$1599, parentIsBlock$1600)) {
                                    // new function (...) {...} / ...
                                    return _advance$1608();
                                }
                                if (toks$1598.length - 4 <= 0 && inExprDelim$1599) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1608();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1609();
                    } else {
                        // ... + {...} / ...
                        return _advance$1608();
                    }
                }
                if (prev$1613.type === Token$854.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1609();
                }
                if (isKeyword$892(prev$1613.value)) {
                    // typeof /...
                    return _scanRegExp$1609();
                }
                return _advance$1608();
            }
            return _scanRegExp$1609();
        }
        return _advance$1608();
    }
    function readDelim$1026(toks$1614, inExprDelim$1615, parentIsBlock$1616) {
        var startDelim$1617 = advance$909(), matchDelim$1618 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1619 = [];
        var delimiters$1620 = [
                '(',
                '{',
                '['
            ];
        assert$880(delimiters$1620.indexOf(startDelim$1617.value) !== -1, 'Need to begin at the delimiter');
        var token$1621 = startDelim$1617;
        var startLineNumber$1622 = token$1621.lineNumber;
        var startLineStart$1623 = token$1621.lineStart;
        var startRange$1624 = token$1621.range;
        var delimToken$1625 = {};
        delimToken$1625.type = Token$854.Delimiter;
        delimToken$1625.value = startDelim$1617.value + matchDelim$1618[startDelim$1617.value];
        delimToken$1625.startLineNumber = startLineNumber$1622;
        delimToken$1625.startLineStart = startLineStart$1623;
        delimToken$1625.startRange = startRange$1624;
        var delimIsBlock$1626 = false;
        if (startDelim$1617.value === '{') {
            delimIsBlock$1626 = blockAllowed$1024(toks$1614.concat(delimToken$1625), 0, inExprDelim$1615, parentIsBlock$1616);
        }
        while (index$865 <= length$872) {
            token$1621 = readToken$1025(inner$1619, startDelim$1617.value === '(' || startDelim$1617.value === '[', delimIsBlock$1626);
            if (token$1621.type === Token$854.Punctuator && token$1621.value === matchDelim$1618[startDelim$1617.value]) {
                if (token$1621.leadingComments) {
                    delimToken$1625.trailingComments = token$1621.leadingComments;
                }
                break;
            } else if (token$1621.type === Token$854.EOF) {
                throwError$914({}, Messages$859.UnexpectedEOS);
            } else {
                inner$1619.push(token$1621);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$865 >= length$872 && matchDelim$1618[startDelim$1617.value] !== source$863[length$872 - 1]) {
            throwError$914({}, Messages$859.UnexpectedEOS);
        }
        var endLineNumber$1627 = token$1621.lineNumber;
        var endLineStart$1628 = token$1621.lineStart;
        var endRange$1629 = token$1621.range;
        delimToken$1625.inner = inner$1619;
        delimToken$1625.endLineNumber = endLineNumber$1627;
        delimToken$1625.endLineStart = endLineStart$1628;
        delimToken$1625.endRange = endRange$1629;
        return delimToken$1625;
    }
    // (Str) -> [...CSyntax]
    function read$1027(code$1630) {
        var token$1631, tokenTree$1632 = [];
        extra$879 = {};
        extra$879.comments = [];
        patch$1020();
        source$863 = code$1630;
        index$865 = 0;
        lineNumber$866 = source$863.length > 0 ? 1 : 0;
        lineStart$867 = 0;
        length$872 = source$863.length;
        state$878 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$865 < length$872) {
            tokenTree$1632.push(readToken$1025(tokenTree$1632, false, false));
        }
        var last$1633 = tokenTree$1632[tokenTree$1632.length - 1];
        if (last$1633 && last$1633.type !== Token$854.EOF) {
            tokenTree$1632.push({
                type: Token$854.EOF,
                value: '',
                lineNumber: last$1633.lineNumber,
                lineStart: last$1633.lineStart,
                range: [
                    index$865,
                    index$865
                ]
            });
        }
        return expander$853.tokensToSyntax(tokenTree$1632);
    }
    function parse$1028(code$1634, options$1635) {
        var program$1636, toString$1637;
        extra$879 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1634)) {
            tokenStream$874 = code$1634;
            length$872 = tokenStream$874.length;
            lineNumber$866 = tokenStream$874.length > 0 ? 1 : 0;
            source$863 = undefined;
        } else {
            toString$1637 = String;
            if (typeof code$1634 !== 'string' && !(code$1634 instanceof String)) {
                code$1634 = toString$1637(code$1634);
            }
            source$863 = code$1634;
            length$872 = source$863.length;
            lineNumber$866 = source$863.length > 0 ? 1 : 0;
        }
        delegate$873 = SyntaxTreeDelegate$861;
        streamIndex$875 = -1;
        index$865 = 0;
        lineStart$867 = 0;
        sm_lineStart$869 = 0;
        sm_lineNumber$868 = lineNumber$866;
        sm_index$871 = 0;
        sm_range$870 = [
            0,
            0
        ];
        lookahead$876 = null;
        state$878 = {
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
        if (typeof options$1635 !== 'undefined') {
            extra$879.range = typeof options$1635.range === 'boolean' && options$1635.range;
            extra$879.loc = typeof options$1635.loc === 'boolean' && options$1635.loc;
            if (extra$879.loc && options$1635.source !== null && options$1635.source !== undefined) {
                delegate$873 = extend$1022(delegate$873, {
                    'postProcess': function (node$1638) {
                        node$1638.loc.source = toString$1637(options$1635.source);
                        return node$1638;
                    }
                });
            }
            if (typeof options$1635.tokens === 'boolean' && options$1635.tokens) {
                extra$879.tokens = [];
            }
            if (typeof options$1635.comment === 'boolean' && options$1635.comment) {
                extra$879.comments = [];
            }
            if (typeof options$1635.tolerant === 'boolean' && options$1635.tolerant) {
                extra$879.errors = [];
            }
        }
        if (length$872 > 0) {
            if (source$863 && typeof source$863[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1634 instanceof String) {
                    source$863 = code$1634.valueOf();
                }
            }
        }
        extra$879 = { loc: true };
        patch$1020();
        try {
            program$1636 = parseProgram$1006();
            if (typeof extra$879.comments !== 'undefined') {
                filterCommentLocation$1009();
                program$1636.comments = extra$879.comments;
            }
            if (typeof extra$879.tokens !== 'undefined') {
                filterTokenLocation$1012();
                program$1636.tokens = extra$879.tokens;
            }
            if (typeof extra$879.errors !== 'undefined') {
                program$1636.errors = extra$879.errors;
            }
            if (extra$879.range || extra$879.loc) {
                program$1636.body = filterGroup$1018(program$1636.body);
            }
        } catch (e$1639) {
            throw e$1639;
        } finally {
            unpatch$1021();
            extra$879 = {};
        }
        return program$1636;
    }
    exports$852.tokenize = tokenize$1023;
    exports$852.read = read$1027;
    exports$852.Token = Token$854;
    exports$852.parse = parse$1028;
    // Deep copy.
    exports$852.Syntax = function () {
        var name$1640, types$1641 = {};
        if (typeof Object.create === 'function') {
            types$1641 = Object.create(null);
        }
        for (name$1640 in Syntax$857) {
            if (Syntax$857.hasOwnProperty(name$1640)) {
                types$1641[name$1640] = Syntax$857[name$1640];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1641);
        }
        return types$1641;
    }();
}));
//# sourceMappingURL=parser.js.map