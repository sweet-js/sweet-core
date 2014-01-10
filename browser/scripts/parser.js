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
(function (root$845, factory$846) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$846);
    } else if (typeof exports !== 'undefined') {
        factory$846(exports, require('./expander'));
    } else {
        factory$846(root$845.esprima = {});
    }
}(this, function (exports$847, expander$848) {
    'use strict';
    var Token$849, TokenName$850, FnExprTokens$851, Syntax$852, PropertyKind$853, Messages$854, Regex$855, SyntaxTreeDelegate$856, ClassPropertyType$857, source$858, strict$859, index$860, lineNumber$861, lineStart$862, sm_lineNumber$863, sm_lineStart$864, sm_range$865, sm_index$866, length$867, delegate$868, tokenStream$869, streamIndex$870, lookahead$871, lookaheadIndex$872, state$873, extra$874;
    Token$849 = {
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
    TokenName$850 = {};
    TokenName$850[Token$849.BooleanLiteral] = 'Boolean';
    TokenName$850[Token$849.EOF] = '<end>';
    TokenName$850[Token$849.Identifier] = 'Identifier';
    TokenName$850[Token$849.Keyword] = 'Keyword';
    TokenName$850[Token$849.NullLiteral] = 'Null';
    TokenName$850[Token$849.NumericLiteral] = 'Numeric';
    TokenName$850[Token$849.Punctuator] = 'Punctuator';
    TokenName$850[Token$849.StringLiteral] = 'String';
    TokenName$850[Token$849.RegularExpression] = 'RegularExpression';
    TokenName$850[Token$849.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$851 = [
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
    Syntax$852 = {
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
    PropertyKind$853 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$857 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$854 = {
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
    Regex$855 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$875(condition$1024, message$1025) {
        if (!condition$1024) {
            throw new Error('ASSERT: ' + message$1025);
        }
    }
    function isIn$876(el$1026, list$1027) {
        return list$1027.indexOf(el$1026) !== -1;
    }
    function isDecimalDigit$877(ch$1028) {
        return ch$1028 >= 48 && ch$1028 <= 57;
    }    // 0..9
    function isHexDigit$878(ch$1029) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1029) >= 0;
    }
    function isOctalDigit$879(ch$1030) {
        return '01234567'.indexOf(ch$1030) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$880(ch$1031) {
        return ch$1031 === 32 || ch$1031 === 9 || ch$1031 === 11 || ch$1031 === 12 || ch$1031 === 160 || ch$1031 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1031)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$881(ch$1032) {
        return ch$1032 === 10 || ch$1032 === 13 || ch$1032 === 8232 || ch$1032 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$882(ch$1033) {
        return ch$1033 === 36 || ch$1033 === 95 || ch$1033 >= 65 && ch$1033 <= 90 || ch$1033 >= 97 && ch$1033 <= 122 || ch$1033 === 92 || ch$1033 >= 128 && Regex$855.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1033));
    }
    function isIdentifierPart$883(ch$1034) {
        return ch$1034 === 36 || ch$1034 === 95 || ch$1034 >= 65 && ch$1034 <= 90 || ch$1034 >= 97 && ch$1034 <= 122 || ch$1034 >= 48 && ch$1034 <= 57 || ch$1034 === 92 || ch$1034 >= 128 && Regex$855.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1034));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$884(id$1035) {
        switch (id$1035) {
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
    function isStrictModeReservedWord$885(id$1036) {
        switch (id$1036) {
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
    function isRestrictedWord$886(id$1037) {
        return id$1037 === 'eval' || id$1037 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$887(id$1038) {
        if (strict$859 && isStrictModeReservedWord$885(id$1038)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1038.length) {
        case 2:
            return id$1038 === 'if' || id$1038 === 'in' || id$1038 === 'do';
        case 3:
            return id$1038 === 'var' || id$1038 === 'for' || id$1038 === 'new' || id$1038 === 'try' || id$1038 === 'let';
        case 4:
            return id$1038 === 'this' || id$1038 === 'else' || id$1038 === 'case' || id$1038 === 'void' || id$1038 === 'with' || id$1038 === 'enum';
        case 5:
            return id$1038 === 'while' || id$1038 === 'break' || id$1038 === 'catch' || id$1038 === 'throw' || id$1038 === 'const' || id$1038 === 'yield' || id$1038 === 'class' || id$1038 === 'super';
        case 6:
            return id$1038 === 'return' || id$1038 === 'typeof' || id$1038 === 'delete' || id$1038 === 'switch' || id$1038 === 'export' || id$1038 === 'import';
        case 7:
            return id$1038 === 'default' || id$1038 === 'finally' || id$1038 === 'extends';
        case 8:
            return id$1038 === 'function' || id$1038 === 'continue' || id$1038 === 'debugger';
        case 10:
            return id$1038 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$888() {
        var ch$1039, blockComment$1040, lineComment$1041;
        blockComment$1040 = false;
        lineComment$1041 = false;
        while (index$860 < length$867) {
            ch$1039 = source$858.charCodeAt(index$860);
            if (lineComment$1041) {
                ++index$860;
                if (isLineTerminator$881(ch$1039)) {
                    lineComment$1041 = false;
                    if (ch$1039 === 13 && source$858.charCodeAt(index$860) === 10) {
                        ++index$860;
                    }
                    ++lineNumber$861;
                    lineStart$862 = index$860;
                }
            } else if (blockComment$1040) {
                if (isLineTerminator$881(ch$1039)) {
                    if (ch$1039 === 13 && source$858.charCodeAt(index$860 + 1) === 10) {
                        ++index$860;
                    }
                    ++lineNumber$861;
                    ++index$860;
                    lineStart$862 = index$860;
                    if (index$860 >= length$867) {
                        throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1039 = source$858.charCodeAt(index$860++);
                    if (index$860 >= length$867) {
                        throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1039 === 42) {
                        ch$1039 = source$858.charCodeAt(index$860);
                        if (ch$1039 === 47) {
                            ++index$860;
                            blockComment$1040 = false;
                        }
                    }
                }
            } else if (ch$1039 === 47) {
                ch$1039 = source$858.charCodeAt(index$860 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1039 === 47) {
                    index$860 += 2;
                    lineComment$1041 = true;
                } else if (ch$1039 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$860 += 2;
                    blockComment$1040 = true;
                    if (index$860 >= length$867) {
                        throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$880(ch$1039)) {
                ++index$860;
            } else if (isLineTerminator$881(ch$1039)) {
                ++index$860;
                if (ch$1039 === 13 && source$858.charCodeAt(index$860) === 10) {
                    ++index$860;
                }
                ++lineNumber$861;
                lineStart$862 = index$860;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$889(prefix$1042) {
        var i$1043, len$1044, ch$1045, code$1046 = 0;
        len$1044 = prefix$1042 === 'u' ? 4 : 2;
        for (i$1043 = 0; i$1043 < len$1044; ++i$1043) {
            if (index$860 < length$867 && isHexDigit$878(source$858[index$860])) {
                ch$1045 = source$858[index$860++];
                code$1046 = code$1046 * 16 + '0123456789abcdef'.indexOf(ch$1045.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1046);
    }
    function scanUnicodeCodePointEscape$890() {
        var ch$1047, code$1048, cu1$1049, cu2$1050;
        ch$1047 = source$858[index$860];
        code$1048 = 0;
        // At least, one hex digit is required.
        if (ch$1047 === '}') {
            throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
        }
        while (index$860 < length$867) {
            ch$1047 = source$858[index$860++];
            if (!isHexDigit$878(ch$1047)) {
                break;
            }
            code$1048 = code$1048 * 16 + '0123456789abcdef'.indexOf(ch$1047.toLowerCase());
        }
        if (code$1048 > 1114111 || ch$1047 !== '}') {
            throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1048 <= 65535) {
            return String.fromCharCode(code$1048);
        }
        cu1$1049 = (code$1048 - 65536 >> 10) + 55296;
        cu2$1050 = (code$1048 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1049, cu2$1050);
    }
    function getEscapedIdentifier$891() {
        var ch$1051, id$1052;
        ch$1051 = source$858.charCodeAt(index$860++);
        id$1052 = String.fromCharCode(ch$1051);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1051 === 92) {
            if (source$858.charCodeAt(index$860) !== 117) {
                throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
            }
            ++index$860;
            ch$1051 = scanHexEscape$889('u');
            if (!ch$1051 || ch$1051 === '\\' || !isIdentifierStart$882(ch$1051.charCodeAt(0))) {
                throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
            }
            id$1052 = ch$1051;
        }
        while (index$860 < length$867) {
            ch$1051 = source$858.charCodeAt(index$860);
            if (!isIdentifierPart$883(ch$1051)) {
                break;
            }
            ++index$860;
            id$1052 += String.fromCharCode(ch$1051);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1051 === 92) {
                id$1052 = id$1052.substr(0, id$1052.length - 1);
                if (source$858.charCodeAt(index$860) !== 117) {
                    throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
                }
                ++index$860;
                ch$1051 = scanHexEscape$889('u');
                if (!ch$1051 || ch$1051 === '\\' || !isIdentifierPart$883(ch$1051.charCodeAt(0))) {
                    throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
                }
                id$1052 += ch$1051;
            }
        }
        return id$1052;
    }
    function getIdentifier$892() {
        var start$1053, ch$1054;
        start$1053 = index$860++;
        while (index$860 < length$867) {
            ch$1054 = source$858.charCodeAt(index$860);
            if (ch$1054 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$860 = start$1053;
                return getEscapedIdentifier$891();
            }
            if (isIdentifierPart$883(ch$1054)) {
                ++index$860;
            } else {
                break;
            }
        }
        return source$858.slice(start$1053, index$860);
    }
    function scanIdentifier$893() {
        var start$1055, id$1056, type$1057;
        start$1055 = index$860;
        // Backslash (char #92) starts an escaped character.
        id$1056 = source$858.charCodeAt(index$860) === 92 ? getEscapedIdentifier$891() : getIdentifier$892();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1056.length === 1) {
            type$1057 = Token$849.Identifier;
        } else if (isKeyword$887(id$1056)) {
            type$1057 = Token$849.Keyword;
        } else if (id$1056 === 'null') {
            type$1057 = Token$849.NullLiteral;
        } else if (id$1056 === 'true' || id$1056 === 'false') {
            type$1057 = Token$849.BooleanLiteral;
        } else {
            type$1057 = Token$849.Identifier;
        }
        return {
            type: type$1057,
            value: id$1056,
            lineNumber: lineNumber$861,
            lineStart: lineStart$862,
            range: [
                start$1055,
                index$860
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$894() {
        var start$1058 = index$860, code$1059 = source$858.charCodeAt(index$860), code2$1060, ch1$1061 = source$858[index$860], ch2$1062, ch3$1063, ch4$1064;
        switch (code$1059) {
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
            ++index$860;
            if (extra$874.tokenize) {
                if (code$1059 === 40) {
                    extra$874.openParenToken = extra$874.tokens.length;
                } else if (code$1059 === 123) {
                    extra$874.openCurlyToken = extra$874.tokens.length;
                }
            }
            return {
                type: Token$849.Punctuator,
                value: String.fromCharCode(code$1059),
                lineNumber: lineNumber$861,
                lineStart: lineStart$862,
                range: [
                    start$1058,
                    index$860
                ]
            };
        default:
            code2$1060 = source$858.charCodeAt(index$860 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1060 === 61) {
                switch (code$1059) {
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
                    index$860 += 2;
                    return {
                        type: Token$849.Punctuator,
                        value: String.fromCharCode(code$1059) + String.fromCharCode(code2$1060),
                        lineNumber: lineNumber$861,
                        lineStart: lineStart$862,
                        range: [
                            start$1058,
                            index$860
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$860 += 2;
                    // !== and ===
                    if (source$858.charCodeAt(index$860) === 61) {
                        ++index$860;
                    }
                    return {
                        type: Token$849.Punctuator,
                        value: source$858.slice(start$1058, index$860),
                        lineNumber: lineNumber$861,
                        lineStart: lineStart$862,
                        range: [
                            start$1058,
                            index$860
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1062 = source$858[index$860 + 1];
        ch3$1063 = source$858[index$860 + 2];
        ch4$1064 = source$858[index$860 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1061 === '>' && ch2$1062 === '>' && ch3$1063 === '>') {
            if (ch4$1064 === '=') {
                index$860 += 4;
                return {
                    type: Token$849.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$861,
                    lineStart: lineStart$862,
                    range: [
                        start$1058,
                        index$860
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1061 === '>' && ch2$1062 === '>' && ch3$1063 === '>') {
            index$860 += 3;
            return {
                type: Token$849.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$861,
                lineStart: lineStart$862,
                range: [
                    start$1058,
                    index$860
                ]
            };
        }
        if (ch1$1061 === '<' && ch2$1062 === '<' && ch3$1063 === '=') {
            index$860 += 3;
            return {
                type: Token$849.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$861,
                lineStart: lineStart$862,
                range: [
                    start$1058,
                    index$860
                ]
            };
        }
        if (ch1$1061 === '>' && ch2$1062 === '>' && ch3$1063 === '=') {
            index$860 += 3;
            return {
                type: Token$849.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$861,
                lineStart: lineStart$862,
                range: [
                    start$1058,
                    index$860
                ]
            };
        }
        if (ch1$1061 === '.' && ch2$1062 === '.' && ch3$1063 === '.') {
            index$860 += 3;
            return {
                type: Token$849.Punctuator,
                value: '...',
                lineNumber: lineNumber$861,
                lineStart: lineStart$862,
                range: [
                    start$1058,
                    index$860
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1061 === ch2$1062 && '+-<>&|'.indexOf(ch1$1061) >= 0) {
            index$860 += 2;
            return {
                type: Token$849.Punctuator,
                value: ch1$1061 + ch2$1062,
                lineNumber: lineNumber$861,
                lineStart: lineStart$862,
                range: [
                    start$1058,
                    index$860
                ]
            };
        }
        if (ch1$1061 === '=' && ch2$1062 === '>') {
            index$860 += 2;
            return {
                type: Token$849.Punctuator,
                value: '=>',
                lineNumber: lineNumber$861,
                lineStart: lineStart$862,
                range: [
                    start$1058,
                    index$860
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1061) >= 0) {
            ++index$860;
            return {
                type: Token$849.Punctuator,
                value: ch1$1061,
                lineNumber: lineNumber$861,
                lineStart: lineStart$862,
                range: [
                    start$1058,
                    index$860
                ]
            };
        }
        if (ch1$1061 === '.') {
            ++index$860;
            return {
                type: Token$849.Punctuator,
                value: ch1$1061,
                lineNumber: lineNumber$861,
                lineStart: lineStart$862,
                range: [
                    start$1058,
                    index$860
                ]
            };
        }
        throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$895(start$1065) {
        var number$1066 = '';
        while (index$860 < length$867) {
            if (!isHexDigit$878(source$858[index$860])) {
                break;
            }
            number$1066 += source$858[index$860++];
        }
        if (number$1066.length === 0) {
            throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$882(source$858.charCodeAt(index$860))) {
            throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$849.NumericLiteral,
            value: parseInt('0x' + number$1066, 16),
            lineNumber: lineNumber$861,
            lineStart: lineStart$862,
            range: [
                start$1065,
                index$860
            ]
        };
    }
    function scanOctalLiteral$896(prefix$1067, start$1068) {
        var number$1069, octal$1070;
        if (isOctalDigit$879(prefix$1067)) {
            octal$1070 = true;
            number$1069 = '0' + source$858[index$860++];
        } else {
            octal$1070 = false;
            ++index$860;
            number$1069 = '';
        }
        while (index$860 < length$867) {
            if (!isOctalDigit$879(source$858[index$860])) {
                break;
            }
            number$1069 += source$858[index$860++];
        }
        if (!octal$1070 && number$1069.length === 0) {
            // only 0o or 0O
            throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$882(source$858.charCodeAt(index$860)) || isDecimalDigit$877(source$858.charCodeAt(index$860))) {
            throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$849.NumericLiteral,
            value: parseInt(number$1069, 8),
            octal: octal$1070,
            lineNumber: lineNumber$861,
            lineStart: lineStart$862,
            range: [
                start$1068,
                index$860
            ]
        };
    }
    function scanNumericLiteral$897() {
        var number$1071, start$1072, ch$1073, octal$1074;
        ch$1073 = source$858[index$860];
        assert$875(isDecimalDigit$877(ch$1073.charCodeAt(0)) || ch$1073 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1072 = index$860;
        number$1071 = '';
        if (ch$1073 !== '.') {
            number$1071 = source$858[index$860++];
            ch$1073 = source$858[index$860];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1071 === '0') {
                if (ch$1073 === 'x' || ch$1073 === 'X') {
                    ++index$860;
                    return scanHexLiteral$895(start$1072);
                }
                if (ch$1073 === 'b' || ch$1073 === 'B') {
                    ++index$860;
                    number$1071 = '';
                    while (index$860 < length$867) {
                        ch$1073 = source$858[index$860];
                        if (ch$1073 !== '0' && ch$1073 !== '1') {
                            break;
                        }
                        number$1071 += source$858[index$860++];
                    }
                    if (number$1071.length === 0) {
                        // only 0b or 0B
                        throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$860 < length$867) {
                        ch$1073 = source$858.charCodeAt(index$860);
                        if (isIdentifierStart$882(ch$1073) || isDecimalDigit$877(ch$1073)) {
                            throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$849.NumericLiteral,
                        value: parseInt(number$1071, 2),
                        lineNumber: lineNumber$861,
                        lineStart: lineStart$862,
                        range: [
                            start$1072,
                            index$860
                        ]
                    };
                }
                if (ch$1073 === 'o' || ch$1073 === 'O' || isOctalDigit$879(ch$1073)) {
                    return scanOctalLiteral$896(ch$1073, start$1072);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1073 && isDecimalDigit$877(ch$1073.charCodeAt(0))) {
                    throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$877(source$858.charCodeAt(index$860))) {
                number$1071 += source$858[index$860++];
            }
            ch$1073 = source$858[index$860];
        }
        if (ch$1073 === '.') {
            number$1071 += source$858[index$860++];
            while (isDecimalDigit$877(source$858.charCodeAt(index$860))) {
                number$1071 += source$858[index$860++];
            }
            ch$1073 = source$858[index$860];
        }
        if (ch$1073 === 'e' || ch$1073 === 'E') {
            number$1071 += source$858[index$860++];
            ch$1073 = source$858[index$860];
            if (ch$1073 === '+' || ch$1073 === '-') {
                number$1071 += source$858[index$860++];
            }
            if (isDecimalDigit$877(source$858.charCodeAt(index$860))) {
                while (isDecimalDigit$877(source$858.charCodeAt(index$860))) {
                    number$1071 += source$858[index$860++];
                }
            } else {
                throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$882(source$858.charCodeAt(index$860))) {
            throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$849.NumericLiteral,
            value: parseFloat(number$1071),
            lineNumber: lineNumber$861,
            lineStart: lineStart$862,
            range: [
                start$1072,
                index$860
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$898() {
        var str$1075 = '', quote$1076, start$1077, ch$1078, code$1079, unescaped$1080, restore$1081, octal$1082 = false;
        quote$1076 = source$858[index$860];
        assert$875(quote$1076 === '\'' || quote$1076 === '"', 'String literal must starts with a quote');
        start$1077 = index$860;
        ++index$860;
        while (index$860 < length$867) {
            ch$1078 = source$858[index$860++];
            if (ch$1078 === quote$1076) {
                quote$1076 = '';
                break;
            } else if (ch$1078 === '\\') {
                ch$1078 = source$858[index$860++];
                if (!ch$1078 || !isLineTerminator$881(ch$1078.charCodeAt(0))) {
                    switch (ch$1078) {
                    case 'n':
                        str$1075 += '\n';
                        break;
                    case 'r':
                        str$1075 += '\r';
                        break;
                    case 't':
                        str$1075 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$858[index$860] === '{') {
                            ++index$860;
                            str$1075 += scanUnicodeCodePointEscape$890();
                        } else {
                            restore$1081 = index$860;
                            unescaped$1080 = scanHexEscape$889(ch$1078);
                            if (unescaped$1080) {
                                str$1075 += unescaped$1080;
                            } else {
                                index$860 = restore$1081;
                                str$1075 += ch$1078;
                            }
                        }
                        break;
                    case 'b':
                        str$1075 += '\b';
                        break;
                    case 'f':
                        str$1075 += '\f';
                        break;
                    case 'v':
                        str$1075 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$879(ch$1078)) {
                            code$1079 = '01234567'.indexOf(ch$1078);
                            // \0 is not octal escape sequence
                            if (code$1079 !== 0) {
                                octal$1082 = true;
                            }
                            if (index$860 < length$867 && isOctalDigit$879(source$858[index$860])) {
                                octal$1082 = true;
                                code$1079 = code$1079 * 8 + '01234567'.indexOf(source$858[index$860++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1078) >= 0 && index$860 < length$867 && isOctalDigit$879(source$858[index$860])) {
                                    code$1079 = code$1079 * 8 + '01234567'.indexOf(source$858[index$860++]);
                                }
                            }
                            str$1075 += String.fromCharCode(code$1079);
                        } else {
                            str$1075 += ch$1078;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$861;
                    if (ch$1078 === '\r' && source$858[index$860] === '\n') {
                        ++index$860;
                    }
                }
            } else if (isLineTerminator$881(ch$1078.charCodeAt(0))) {
                break;
            } else {
                str$1075 += ch$1078;
            }
        }
        if (quote$1076 !== '') {
            throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$849.StringLiteral,
            value: str$1075,
            octal: octal$1082,
            lineNumber: lineNumber$861,
            lineStart: lineStart$862,
            range: [
                start$1077,
                index$860
            ]
        };
    }
    function scanTemplate$899() {
        var cooked$1083 = '', ch$1084, start$1085, terminated$1086, tail$1087, restore$1088, unescaped$1089, code$1090, octal$1091;
        terminated$1086 = false;
        tail$1087 = false;
        start$1085 = index$860;
        ++index$860;
        while (index$860 < length$867) {
            ch$1084 = source$858[index$860++];
            if (ch$1084 === '`') {
                tail$1087 = true;
                terminated$1086 = true;
                break;
            } else if (ch$1084 === '$') {
                if (source$858[index$860] === '{') {
                    ++index$860;
                    terminated$1086 = true;
                    break;
                }
                cooked$1083 += ch$1084;
            } else if (ch$1084 === '\\') {
                ch$1084 = source$858[index$860++];
                if (!isLineTerminator$881(ch$1084.charCodeAt(0))) {
                    switch (ch$1084) {
                    case 'n':
                        cooked$1083 += '\n';
                        break;
                    case 'r':
                        cooked$1083 += '\r';
                        break;
                    case 't':
                        cooked$1083 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$858[index$860] === '{') {
                            ++index$860;
                            cooked$1083 += scanUnicodeCodePointEscape$890();
                        } else {
                            restore$1088 = index$860;
                            unescaped$1089 = scanHexEscape$889(ch$1084);
                            if (unescaped$1089) {
                                cooked$1083 += unescaped$1089;
                            } else {
                                index$860 = restore$1088;
                                cooked$1083 += ch$1084;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1083 += '\b';
                        break;
                    case 'f':
                        cooked$1083 += '\f';
                        break;
                    case 'v':
                        cooked$1083 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$879(ch$1084)) {
                            code$1090 = '01234567'.indexOf(ch$1084);
                            // \0 is not octal escape sequence
                            if (code$1090 !== 0) {
                                octal$1091 = true;
                            }
                            if (index$860 < length$867 && isOctalDigit$879(source$858[index$860])) {
                                octal$1091 = true;
                                code$1090 = code$1090 * 8 + '01234567'.indexOf(source$858[index$860++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1084) >= 0 && index$860 < length$867 && isOctalDigit$879(source$858[index$860])) {
                                    code$1090 = code$1090 * 8 + '01234567'.indexOf(source$858[index$860++]);
                                }
                            }
                            cooked$1083 += String.fromCharCode(code$1090);
                        } else {
                            cooked$1083 += ch$1084;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$861;
                    if (ch$1084 === '\r' && source$858[index$860] === '\n') {
                        ++index$860;
                    }
                }
            } else if (isLineTerminator$881(ch$1084.charCodeAt(0))) {
                ++lineNumber$861;
                if (ch$1084 === '\r' && source$858[index$860] === '\n') {
                    ++index$860;
                }
                cooked$1083 += '\n';
            } else {
                cooked$1083 += ch$1084;
            }
        }
        if (!terminated$1086) {
            throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$849.Template,
            value: {
                cooked: cooked$1083,
                raw: source$858.slice(start$1085 + 1, index$860 - (tail$1087 ? 1 : 2))
            },
            tail: tail$1087,
            octal: octal$1091,
            lineNumber: lineNumber$861,
            lineStart: lineStart$862,
            range: [
                start$1085,
                index$860
            ]
        };
    }
    function scanTemplateElement$900(option$1092) {
        var startsWith$1093, template$1094;
        lookahead$871 = null;
        skipComment$888();
        startsWith$1093 = option$1092.head ? '`' : '}';
        if (source$858[index$860] !== startsWith$1093) {
            throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
        }
        template$1094 = scanTemplate$899();
        peek$906();
        return template$1094;
    }
    function scanRegExp$901() {
        var str$1095, ch$1096, start$1097, pattern$1098, flags$1099, value$1100, classMarker$1101 = false, restore$1102, terminated$1103 = false;
        lookahead$871 = null;
        skipComment$888();
        start$1097 = index$860;
        ch$1096 = source$858[index$860];
        assert$875(ch$1096 === '/', 'Regular expression literal must start with a slash');
        str$1095 = source$858[index$860++];
        while (index$860 < length$867) {
            ch$1096 = source$858[index$860++];
            str$1095 += ch$1096;
            if (classMarker$1101) {
                if (ch$1096 === ']') {
                    classMarker$1101 = false;
                }
            } else {
                if (ch$1096 === '\\') {
                    ch$1096 = source$858[index$860++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$881(ch$1096.charCodeAt(0))) {
                        throwError$909({}, Messages$854.UnterminatedRegExp);
                    }
                    str$1095 += ch$1096;
                } else if (ch$1096 === '/') {
                    terminated$1103 = true;
                    break;
                } else if (ch$1096 === '[') {
                    classMarker$1101 = true;
                } else if (isLineTerminator$881(ch$1096.charCodeAt(0))) {
                    throwError$909({}, Messages$854.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1103) {
            throwError$909({}, Messages$854.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1098 = str$1095.substr(1, str$1095.length - 2);
        flags$1099 = '';
        while (index$860 < length$867) {
            ch$1096 = source$858[index$860];
            if (!isIdentifierPart$883(ch$1096.charCodeAt(0))) {
                break;
            }
            ++index$860;
            if (ch$1096 === '\\' && index$860 < length$867) {
                ch$1096 = source$858[index$860];
                if (ch$1096 === 'u') {
                    ++index$860;
                    restore$1102 = index$860;
                    ch$1096 = scanHexEscape$889('u');
                    if (ch$1096) {
                        flags$1099 += ch$1096;
                        for (str$1095 += '\\u'; restore$1102 < index$860; ++restore$1102) {
                            str$1095 += source$858[restore$1102];
                        }
                    } else {
                        index$860 = restore$1102;
                        flags$1099 += 'u';
                        str$1095 += '\\u';
                    }
                } else {
                    str$1095 += '\\';
                }
            } else {
                flags$1099 += ch$1096;
                str$1095 += ch$1096;
            }
        }
        try {
            value$1100 = new RegExp(pattern$1098, flags$1099);
        } catch (e$1104) {
            throwError$909({}, Messages$854.InvalidRegExp);
        }
        // peek();
        if (extra$874.tokenize) {
            return {
                type: Token$849.RegularExpression,
                value: value$1100,
                lineNumber: lineNumber$861,
                lineStart: lineStart$862,
                range: [
                    start$1097,
                    index$860
                ]
            };
        }
        return {
            type: Token$849.RegularExpression,
            literal: str$1095,
            value: value$1100,
            range: [
                start$1097,
                index$860
            ]
        };
    }
    function isIdentifierName$902(token$1105) {
        return token$1105.type === Token$849.Identifier || token$1105.type === Token$849.Keyword || token$1105.type === Token$849.BooleanLiteral || token$1105.type === Token$849.NullLiteral;
    }
    function advanceSlash$903() {
        var prevToken$1106, checkToken$1107;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1106 = extra$874.tokens[extra$874.tokens.length - 1];
        if (!prevToken$1106) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$901();
        }
        if (prevToken$1106.type === 'Punctuator') {
            if (prevToken$1106.value === ')') {
                checkToken$1107 = extra$874.tokens[extra$874.openParenToken - 1];
                if (checkToken$1107 && checkToken$1107.type === 'Keyword' && (checkToken$1107.value === 'if' || checkToken$1107.value === 'while' || checkToken$1107.value === 'for' || checkToken$1107.value === 'with')) {
                    return scanRegExp$901();
                }
                return scanPunctuator$894();
            }
            if (prevToken$1106.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$874.tokens[extra$874.openCurlyToken - 3] && extra$874.tokens[extra$874.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1107 = extra$874.tokens[extra$874.openCurlyToken - 4];
                    if (!checkToken$1107) {
                        return scanPunctuator$894();
                    }
                } else if (extra$874.tokens[extra$874.openCurlyToken - 4] && extra$874.tokens[extra$874.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1107 = extra$874.tokens[extra$874.openCurlyToken - 5];
                    if (!checkToken$1107) {
                        return scanRegExp$901();
                    }
                } else {
                    return scanPunctuator$894();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$851.indexOf(checkToken$1107.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$894();
                }
                // It is a declaration.
                return scanRegExp$901();
            }
            return scanRegExp$901();
        }
        if (prevToken$1106.type === 'Keyword') {
            return scanRegExp$901();
        }
        return scanPunctuator$894();
    }
    function advance$904() {
        var ch$1108;
        skipComment$888();
        if (index$860 >= length$867) {
            return {
                type: Token$849.EOF,
                lineNumber: lineNumber$861,
                lineStart: lineStart$862,
                range: [
                    index$860,
                    index$860
                ]
            };
        }
        ch$1108 = source$858.charCodeAt(index$860);
        // Very common: ( and ) and ;
        if (ch$1108 === 40 || ch$1108 === 41 || ch$1108 === 58) {
            return scanPunctuator$894();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1108 === 39 || ch$1108 === 34) {
            return scanStringLiteral$898();
        }
        if (ch$1108 === 96) {
            return scanTemplate$899();
        }
        if (isIdentifierStart$882(ch$1108)) {
            return scanIdentifier$893();
        }
        // # and @ are allowed for sweet.js
        if (ch$1108 === 35 || ch$1108 === 64) {
            ++index$860;
            return {
                type: Token$849.Punctuator,
                value: String.fromCharCode(ch$1108),
                lineNumber: lineNumber$861,
                lineStart: lineStart$862,
                range: [
                    index$860 - 1,
                    index$860
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1108 === 46) {
            if (isDecimalDigit$877(source$858.charCodeAt(index$860 + 1))) {
                return scanNumericLiteral$897();
            }
            return scanPunctuator$894();
        }
        if (isDecimalDigit$877(ch$1108)) {
            return scanNumericLiteral$897();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$874.tokenize && ch$1108 === 47) {
            return advanceSlash$903();
        }
        return scanPunctuator$894();
    }
    function lex$905() {
        var token$1109;
        token$1109 = lookahead$871;
        streamIndex$870 = lookaheadIndex$872;
        lineNumber$861 = token$1109.lineNumber;
        lineStart$862 = token$1109.lineStart;
        sm_lineNumber$863 = lookahead$871.sm_lineNumber;
        sm_lineStart$864 = lookahead$871.sm_lineStart;
        sm_range$865 = lookahead$871.sm_range;
        sm_index$866 = lookahead$871.sm_range[0];
        lookahead$871 = tokenStream$869[++streamIndex$870].token;
        lookaheadIndex$872 = streamIndex$870;
        index$860 = lookahead$871.range[0];
        return token$1109;
    }
    function peek$906() {
        lookaheadIndex$872 = streamIndex$870 + 1;
        if (lookaheadIndex$872 >= length$867) {
            lookahead$871 = {
                type: Token$849.EOF,
                lineNumber: lineNumber$861,
                lineStart: lineStart$862,
                range: [
                    index$860,
                    index$860
                ]
            };
            return;
        }
        lookahead$871 = tokenStream$869[lookaheadIndex$872].token;
        index$860 = lookahead$871.range[0];
    }
    function lookahead2$907() {
        var adv$1110, pos$1111, line$1112, start$1113, result$1114;
        if (streamIndex$870 + 1 >= length$867 || streamIndex$870 + 2 >= length$867) {
            return {
                type: Token$849.EOF,
                lineNumber: lineNumber$861,
                lineStart: lineStart$862,
                range: [
                    index$860,
                    index$860
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$871 === null) {
            lookaheadIndex$872 = streamIndex$870 + 1;
            lookahead$871 = tokenStream$869[lookaheadIndex$872].token;
            index$860 = lookahead$871.range[0];
        }
        result$1114 = tokenStream$869[lookaheadIndex$872 + 1].token;
        return result$1114;
    }
    SyntaxTreeDelegate$856 = {
        name: 'SyntaxTree',
        postProcess: function (node$1115) {
            return node$1115;
        },
        createArrayExpression: function (elements$1116) {
            return {
                type: Syntax$852.ArrayExpression,
                elements: elements$1116
            };
        },
        createAssignmentExpression: function (operator$1117, left$1118, right$1119) {
            return {
                type: Syntax$852.AssignmentExpression,
                operator: operator$1117,
                left: left$1118,
                right: right$1119
            };
        },
        createBinaryExpression: function (operator$1120, left$1121, right$1122) {
            var type$1123 = operator$1120 === '||' || operator$1120 === '&&' ? Syntax$852.LogicalExpression : Syntax$852.BinaryExpression;
            return {
                type: type$1123,
                operator: operator$1120,
                left: left$1121,
                right: right$1122
            };
        },
        createBlockStatement: function (body$1124) {
            return {
                type: Syntax$852.BlockStatement,
                body: body$1124
            };
        },
        createBreakStatement: function (label$1125) {
            return {
                type: Syntax$852.BreakStatement,
                label: label$1125
            };
        },
        createCallExpression: function (callee$1126, args$1127) {
            return {
                type: Syntax$852.CallExpression,
                callee: callee$1126,
                'arguments': args$1127
            };
        },
        createCatchClause: function (param$1128, body$1129) {
            return {
                type: Syntax$852.CatchClause,
                param: param$1128,
                body: body$1129
            };
        },
        createConditionalExpression: function (test$1130, consequent$1131, alternate$1132) {
            return {
                type: Syntax$852.ConditionalExpression,
                test: test$1130,
                consequent: consequent$1131,
                alternate: alternate$1132
            };
        },
        createContinueStatement: function (label$1133) {
            return {
                type: Syntax$852.ContinueStatement,
                label: label$1133
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$852.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1134, test$1135) {
            return {
                type: Syntax$852.DoWhileStatement,
                body: body$1134,
                test: test$1135
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$852.EmptyStatement };
        },
        createExpressionStatement: function (expression$1136) {
            return {
                type: Syntax$852.ExpressionStatement,
                expression: expression$1136
            };
        },
        createForStatement: function (init$1137, test$1138, update$1139, body$1140) {
            return {
                type: Syntax$852.ForStatement,
                init: init$1137,
                test: test$1138,
                update: update$1139,
                body: body$1140
            };
        },
        createForInStatement: function (left$1141, right$1142, body$1143) {
            return {
                type: Syntax$852.ForInStatement,
                left: left$1141,
                right: right$1142,
                body: body$1143,
                each: false
            };
        },
        createForOfStatement: function (left$1144, right$1145, body$1146) {
            return {
                type: Syntax$852.ForOfStatement,
                left: left$1144,
                right: right$1145,
                body: body$1146
            };
        },
        createFunctionDeclaration: function (id$1147, params$1148, defaults$1149, body$1150, rest$1151, generator$1152, expression$1153) {
            return {
                type: Syntax$852.FunctionDeclaration,
                id: id$1147,
                params: params$1148,
                defaults: defaults$1149,
                body: body$1150,
                rest: rest$1151,
                generator: generator$1152,
                expression: expression$1153
            };
        },
        createFunctionExpression: function (id$1154, params$1155, defaults$1156, body$1157, rest$1158, generator$1159, expression$1160) {
            return {
                type: Syntax$852.FunctionExpression,
                id: id$1154,
                params: params$1155,
                defaults: defaults$1156,
                body: body$1157,
                rest: rest$1158,
                generator: generator$1159,
                expression: expression$1160
            };
        },
        createIdentifier: function (name$1161) {
            return {
                type: Syntax$852.Identifier,
                name: name$1161
            };
        },
        createIfStatement: function (test$1162, consequent$1163, alternate$1164) {
            return {
                type: Syntax$852.IfStatement,
                test: test$1162,
                consequent: consequent$1163,
                alternate: alternate$1164
            };
        },
        createLabeledStatement: function (label$1165, body$1166) {
            return {
                type: Syntax$852.LabeledStatement,
                label: label$1165,
                body: body$1166
            };
        },
        createLiteral: function (token$1167) {
            return {
                type: Syntax$852.Literal,
                value: token$1167.value,
                raw: String(token$1167.value)
            };
        },
        createMemberExpression: function (accessor$1168, object$1169, property$1170) {
            return {
                type: Syntax$852.MemberExpression,
                computed: accessor$1168 === '[',
                object: object$1169,
                property: property$1170
            };
        },
        createNewExpression: function (callee$1171, args$1172) {
            return {
                type: Syntax$852.NewExpression,
                callee: callee$1171,
                'arguments': args$1172
            };
        },
        createObjectExpression: function (properties$1173) {
            return {
                type: Syntax$852.ObjectExpression,
                properties: properties$1173
            };
        },
        createPostfixExpression: function (operator$1174, argument$1175) {
            return {
                type: Syntax$852.UpdateExpression,
                operator: operator$1174,
                argument: argument$1175,
                prefix: false
            };
        },
        createProgram: function (body$1176) {
            return {
                type: Syntax$852.Program,
                body: body$1176
            };
        },
        createProperty: function (kind$1177, key$1178, value$1179, method$1180, shorthand$1181) {
            return {
                type: Syntax$852.Property,
                key: key$1178,
                value: value$1179,
                kind: kind$1177,
                method: method$1180,
                shorthand: shorthand$1181
            };
        },
        createReturnStatement: function (argument$1182) {
            return {
                type: Syntax$852.ReturnStatement,
                argument: argument$1182
            };
        },
        createSequenceExpression: function (expressions$1183) {
            return {
                type: Syntax$852.SequenceExpression,
                expressions: expressions$1183
            };
        },
        createSwitchCase: function (test$1184, consequent$1185) {
            return {
                type: Syntax$852.SwitchCase,
                test: test$1184,
                consequent: consequent$1185
            };
        },
        createSwitchStatement: function (discriminant$1186, cases$1187) {
            return {
                type: Syntax$852.SwitchStatement,
                discriminant: discriminant$1186,
                cases: cases$1187
            };
        },
        createThisExpression: function () {
            return { type: Syntax$852.ThisExpression };
        },
        createThrowStatement: function (argument$1188) {
            return {
                type: Syntax$852.ThrowStatement,
                argument: argument$1188
            };
        },
        createTryStatement: function (block$1189, guardedHandlers$1190, handlers$1191, finalizer$1192) {
            return {
                type: Syntax$852.TryStatement,
                block: block$1189,
                guardedHandlers: guardedHandlers$1190,
                handlers: handlers$1191,
                finalizer: finalizer$1192
            };
        },
        createUnaryExpression: function (operator$1193, argument$1194) {
            if (operator$1193 === '++' || operator$1193 === '--') {
                return {
                    type: Syntax$852.UpdateExpression,
                    operator: operator$1193,
                    argument: argument$1194,
                    prefix: true
                };
            }
            return {
                type: Syntax$852.UnaryExpression,
                operator: operator$1193,
                argument: argument$1194
            };
        },
        createVariableDeclaration: function (declarations$1195, kind$1196) {
            return {
                type: Syntax$852.VariableDeclaration,
                declarations: declarations$1195,
                kind: kind$1196
            };
        },
        createVariableDeclarator: function (id$1197, init$1198) {
            return {
                type: Syntax$852.VariableDeclarator,
                id: id$1197,
                init: init$1198
            };
        },
        createWhileStatement: function (test$1199, body$1200) {
            return {
                type: Syntax$852.WhileStatement,
                test: test$1199,
                body: body$1200
            };
        },
        createWithStatement: function (object$1201, body$1202) {
            return {
                type: Syntax$852.WithStatement,
                object: object$1201,
                body: body$1202
            };
        },
        createTemplateElement: function (value$1203, tail$1204) {
            return {
                type: Syntax$852.TemplateElement,
                value: value$1203,
                tail: tail$1204
            };
        },
        createTemplateLiteral: function (quasis$1205, expressions$1206) {
            return {
                type: Syntax$852.TemplateLiteral,
                quasis: quasis$1205,
                expressions: expressions$1206
            };
        },
        createSpreadElement: function (argument$1207) {
            return {
                type: Syntax$852.SpreadElement,
                argument: argument$1207
            };
        },
        createTaggedTemplateExpression: function (tag$1208, quasi$1209) {
            return {
                type: Syntax$852.TaggedTemplateExpression,
                tag: tag$1208,
                quasi: quasi$1209
            };
        },
        createArrowFunctionExpression: function (params$1210, defaults$1211, body$1212, rest$1213, expression$1214) {
            return {
                type: Syntax$852.ArrowFunctionExpression,
                id: null,
                params: params$1210,
                defaults: defaults$1211,
                body: body$1212,
                rest: rest$1213,
                generator: false,
                expression: expression$1214
            };
        },
        createMethodDefinition: function (propertyType$1215, kind$1216, key$1217, value$1218) {
            return {
                type: Syntax$852.MethodDefinition,
                key: key$1217,
                value: value$1218,
                kind: kind$1216,
                'static': propertyType$1215 === ClassPropertyType$857.static
            };
        },
        createClassBody: function (body$1219) {
            return {
                type: Syntax$852.ClassBody,
                body: body$1219
            };
        },
        createClassExpression: function (id$1220, superClass$1221, body$1222) {
            return {
                type: Syntax$852.ClassExpression,
                id: id$1220,
                superClass: superClass$1221,
                body: body$1222
            };
        },
        createClassDeclaration: function (id$1223, superClass$1224, body$1225) {
            return {
                type: Syntax$852.ClassDeclaration,
                id: id$1223,
                superClass: superClass$1224,
                body: body$1225
            };
        },
        createExportSpecifier: function (id$1226, name$1227) {
            return {
                type: Syntax$852.ExportSpecifier,
                id: id$1226,
                name: name$1227
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$852.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1228, specifiers$1229, source$1230) {
            return {
                type: Syntax$852.ExportDeclaration,
                declaration: declaration$1228,
                specifiers: specifiers$1229,
                source: source$1230
            };
        },
        createImportSpecifier: function (id$1231, name$1232) {
            return {
                type: Syntax$852.ImportSpecifier,
                id: id$1231,
                name: name$1232
            };
        },
        createImportDeclaration: function (specifiers$1233, kind$1234, source$1235) {
            return {
                type: Syntax$852.ImportDeclaration,
                specifiers: specifiers$1233,
                kind: kind$1234,
                source: source$1235
            };
        },
        createYieldExpression: function (argument$1236, delegate$1237) {
            return {
                type: Syntax$852.YieldExpression,
                argument: argument$1236,
                delegate: delegate$1237
            };
        },
        createModuleDeclaration: function (id$1238, source$1239, body$1240) {
            return {
                type: Syntax$852.ModuleDeclaration,
                id: id$1238,
                source: source$1239,
                body: body$1240
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$908() {
        return lookahead$871.lineNumber !== lineNumber$861;
    }
    // Throw an exception
    function throwError$909(token$1241, messageFormat$1242) {
        var error$1243, args$1244 = Array.prototype.slice.call(arguments, 2), msg$1245 = messageFormat$1242.replace(/%(\d)/g, function (whole$1249, index$1250) {
                assert$875(index$1250 < args$1244.length, 'Message reference must be in range');
                return args$1244[index$1250];
            });
        var startIndex$1246 = streamIndex$870 > 3 ? streamIndex$870 - 3 : 0;
        var toks$1247 = '', tailingMsg$1248 = '';
        if (tokenStream$869) {
            toks$1247 = tokenStream$869.slice(startIndex$1246, streamIndex$870 + 3).map(function (stx$1251) {
                return stx$1251.token.value;
            }).join(' ');
            tailingMsg$1248 = '\n[... ' + toks$1247 + ' ...]';
        }
        if (typeof token$1241.lineNumber === 'number') {
            error$1243 = new Error('Line ' + token$1241.lineNumber + ': ' + msg$1245 + tailingMsg$1248);
            error$1243.index = token$1241.range[0];
            error$1243.lineNumber = token$1241.lineNumber;
            error$1243.column = token$1241.range[0] - lineStart$862 + 1;
        } else {
            error$1243 = new Error('Line ' + lineNumber$861 + ': ' + msg$1245 + tailingMsg$1248);
            error$1243.index = index$860;
            error$1243.lineNumber = lineNumber$861;
            error$1243.column = index$860 - lineStart$862 + 1;
        }
        error$1243.description = msg$1245;
        throw error$1243;
    }
    function throwErrorTolerant$910() {
        try {
            throwError$909.apply(null, arguments);
        } catch (e$1252) {
            if (extra$874.errors) {
                extra$874.errors.push(e$1252);
            } else {
                throw e$1252;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$911(token$1253) {
        if (token$1253.type === Token$849.EOF) {
            throwError$909(token$1253, Messages$854.UnexpectedEOS);
        }
        if (token$1253.type === Token$849.NumericLiteral) {
            throwError$909(token$1253, Messages$854.UnexpectedNumber);
        }
        if (token$1253.type === Token$849.StringLiteral) {
            throwError$909(token$1253, Messages$854.UnexpectedString);
        }
        if (token$1253.type === Token$849.Identifier) {
            throwError$909(token$1253, Messages$854.UnexpectedIdentifier);
        }
        if (token$1253.type === Token$849.Keyword) {
            if (isFutureReservedWord$884(token$1253.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$859 && isStrictModeReservedWord$885(token$1253.value)) {
                throwErrorTolerant$910(token$1253, Messages$854.StrictReservedWord);
                return;
            }
            throwError$909(token$1253, Messages$854.UnexpectedToken, token$1253.value);
        }
        if (token$1253.type === Token$849.Template) {
            throwError$909(token$1253, Messages$854.UnexpectedTemplate, token$1253.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$909(token$1253, Messages$854.UnexpectedToken, token$1253.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$912(value$1254) {
        var token$1255 = lex$905();
        if (token$1255.type !== Token$849.Punctuator || token$1255.value !== value$1254) {
            throwUnexpected$911(token$1255);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$913(keyword$1256) {
        var token$1257 = lex$905();
        if (token$1257.type !== Token$849.Keyword || token$1257.value !== keyword$1256) {
            throwUnexpected$911(token$1257);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$914(value$1258) {
        return lookahead$871.type === Token$849.Punctuator && lookahead$871.value === value$1258;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$915(keyword$1259) {
        return lookahead$871.type === Token$849.Keyword && lookahead$871.value === keyword$1259;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$916(keyword$1260) {
        return lookahead$871.type === Token$849.Identifier && lookahead$871.value === keyword$1260;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$917() {
        var op$1261;
        if (lookahead$871.type !== Token$849.Punctuator) {
            return false;
        }
        op$1261 = lookahead$871.value;
        return op$1261 === '=' || op$1261 === '*=' || op$1261 === '/=' || op$1261 === '%=' || op$1261 === '+=' || op$1261 === '-=' || op$1261 === '<<=' || op$1261 === '>>=' || op$1261 === '>>>=' || op$1261 === '&=' || op$1261 === '^=' || op$1261 === '|=';
    }
    function consumeSemicolon$918() {
        var line$1262, ch$1263;
        ch$1263 = lookahead$871.value ? String(lookahead$871.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1263 === 59) {
            lex$905();
            return;
        }
        if (lookahead$871.lineNumber !== lineNumber$861) {
            return;
        }
        if (match$914(';')) {
            lex$905();
            return;
        }
        if (lookahead$871.type !== Token$849.EOF && !match$914('}')) {
            throwUnexpected$911(lookahead$871);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$919(expr$1264) {
        return expr$1264.type === Syntax$852.Identifier || expr$1264.type === Syntax$852.MemberExpression;
    }
    function isAssignableLeftHandSide$920(expr$1265) {
        return isLeftHandSide$919(expr$1265) || expr$1265.type === Syntax$852.ObjectPattern || expr$1265.type === Syntax$852.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$921() {
        var elements$1266 = [], blocks$1267 = [], filter$1268 = null, tmp$1269, possiblecomprehension$1270 = true, body$1271;
        expect$912('[');
        while (!match$914(']')) {
            if (lookahead$871.value === 'for' && lookahead$871.type === Token$849.Keyword) {
                if (!possiblecomprehension$1270) {
                    throwError$909({}, Messages$854.ComprehensionError);
                }
                matchKeyword$915('for');
                tmp$1269 = parseForStatement$969({ ignoreBody: true });
                tmp$1269.of = tmp$1269.type === Syntax$852.ForOfStatement;
                tmp$1269.type = Syntax$852.ComprehensionBlock;
                if (tmp$1269.left.kind) {
                    // can't be let or const
                    throwError$909({}, Messages$854.ComprehensionError);
                }
                blocks$1267.push(tmp$1269);
            } else if (lookahead$871.value === 'if' && lookahead$871.type === Token$849.Keyword) {
                if (!possiblecomprehension$1270) {
                    throwError$909({}, Messages$854.ComprehensionError);
                }
                expectKeyword$913('if');
                expect$912('(');
                filter$1268 = parseExpression$949();
                expect$912(')');
            } else if (lookahead$871.value === ',' && lookahead$871.type === Token$849.Punctuator) {
                possiblecomprehension$1270 = false;
                // no longer allowed.
                lex$905();
                elements$1266.push(null);
            } else {
                tmp$1269 = parseSpreadOrAssignmentExpression$932();
                elements$1266.push(tmp$1269);
                if (tmp$1269 && tmp$1269.type === Syntax$852.SpreadElement) {
                    if (!match$914(']')) {
                        throwError$909({}, Messages$854.ElementAfterSpreadElement);
                    }
                } else if (!(match$914(']') || matchKeyword$915('for') || matchKeyword$915('if'))) {
                    expect$912(',');
                    // this lexes.
                    possiblecomprehension$1270 = false;
                }
            }
        }
        expect$912(']');
        if (filter$1268 && !blocks$1267.length) {
            throwError$909({}, Messages$854.ComprehensionRequiresBlock);
        }
        if (blocks$1267.length) {
            if (elements$1266.length !== 1) {
                throwError$909({}, Messages$854.ComprehensionError);
            }
            return {
                type: Syntax$852.ComprehensionExpression,
                filter: filter$1268,
                blocks: blocks$1267,
                body: elements$1266[0]
            };
        }
        return delegate$868.createArrayExpression(elements$1266);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$922(options$1272) {
        var previousStrict$1273, previousYieldAllowed$1274, params$1275, defaults$1276, body$1277;
        previousStrict$1273 = strict$859;
        previousYieldAllowed$1274 = state$873.yieldAllowed;
        state$873.yieldAllowed = options$1272.generator;
        params$1275 = options$1272.params || [];
        defaults$1276 = options$1272.defaults || [];
        body$1277 = parseConciseBody$981();
        if (options$1272.name && strict$859 && isRestrictedWord$886(params$1275[0].name)) {
            throwErrorTolerant$910(options$1272.name, Messages$854.StrictParamName);
        }
        if (state$873.yieldAllowed && !state$873.yieldFound) {
            throwErrorTolerant$910({}, Messages$854.NoYieldInGenerator);
        }
        strict$859 = previousStrict$1273;
        state$873.yieldAllowed = previousYieldAllowed$1274;
        return delegate$868.createFunctionExpression(null, params$1275, defaults$1276, body$1277, options$1272.rest || null, options$1272.generator, body$1277.type !== Syntax$852.BlockStatement);
    }
    function parsePropertyMethodFunction$923(options$1278) {
        var previousStrict$1279, tmp$1280, method$1281;
        previousStrict$1279 = strict$859;
        strict$859 = true;
        tmp$1280 = parseParams$985();
        if (tmp$1280.stricted) {
            throwErrorTolerant$910(tmp$1280.stricted, tmp$1280.message);
        }
        method$1281 = parsePropertyFunction$922({
            params: tmp$1280.params,
            defaults: tmp$1280.defaults,
            rest: tmp$1280.rest,
            generator: options$1278.generator
        });
        strict$859 = previousStrict$1279;
        return method$1281;
    }
    function parseObjectPropertyKey$924() {
        var token$1282 = lex$905();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1282.type === Token$849.StringLiteral || token$1282.type === Token$849.NumericLiteral) {
            if (strict$859 && token$1282.octal) {
                throwErrorTolerant$910(token$1282, Messages$854.StrictOctalLiteral);
            }
            return delegate$868.createLiteral(token$1282);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$868.createIdentifier(token$1282.value);
    }
    function parseObjectProperty$925() {
        var token$1283, key$1284, id$1285, value$1286, param$1287;
        token$1283 = lookahead$871;
        if (token$1283.type === Token$849.Identifier) {
            id$1285 = parseObjectPropertyKey$924();
            // Property Assignment: Getter and Setter.
            if (token$1283.value === 'get' && !(match$914(':') || match$914('('))) {
                key$1284 = parseObjectPropertyKey$924();
                expect$912('(');
                expect$912(')');
                return delegate$868.createProperty('get', key$1284, parsePropertyFunction$922({ generator: false }), false, false);
            }
            if (token$1283.value === 'set' && !(match$914(':') || match$914('('))) {
                key$1284 = parseObjectPropertyKey$924();
                expect$912('(');
                token$1283 = lookahead$871;
                param$1287 = [parseVariableIdentifier$952()];
                expect$912(')');
                return delegate$868.createProperty('set', key$1284, parsePropertyFunction$922({
                    params: param$1287,
                    generator: false,
                    name: token$1283
                }), false, false);
            }
            if (match$914(':')) {
                lex$905();
                return delegate$868.createProperty('init', id$1285, parseAssignmentExpression$948(), false, false);
            }
            if (match$914('(')) {
                return delegate$868.createProperty('init', id$1285, parsePropertyMethodFunction$923({ generator: false }), true, false);
            }
            return delegate$868.createProperty('init', id$1285, id$1285, false, true);
        }
        if (token$1283.type === Token$849.EOF || token$1283.type === Token$849.Punctuator) {
            if (!match$914('*')) {
                throwUnexpected$911(token$1283);
            }
            lex$905();
            id$1285 = parseObjectPropertyKey$924();
            if (!match$914('(')) {
                throwUnexpected$911(lex$905());
            }
            return delegate$868.createProperty('init', id$1285, parsePropertyMethodFunction$923({ generator: true }), true, false);
        }
        key$1284 = parseObjectPropertyKey$924();
        if (match$914(':')) {
            lex$905();
            return delegate$868.createProperty('init', key$1284, parseAssignmentExpression$948(), false, false);
        }
        if (match$914('(')) {
            return delegate$868.createProperty('init', key$1284, parsePropertyMethodFunction$923({ generator: false }), true, false);
        }
        throwUnexpected$911(lex$905());
    }
    function parseObjectInitialiser$926() {
        var properties$1288 = [], property$1289, name$1290, key$1291, kind$1292, map$1293 = {}, toString$1294 = String;
        expect$912('{');
        while (!match$914('}')) {
            property$1289 = parseObjectProperty$925();
            if (property$1289.key.type === Syntax$852.Identifier) {
                name$1290 = property$1289.key.name;
            } else {
                name$1290 = toString$1294(property$1289.key.value);
            }
            kind$1292 = property$1289.kind === 'init' ? PropertyKind$853.Data : property$1289.kind === 'get' ? PropertyKind$853.Get : PropertyKind$853.Set;
            key$1291 = '$' + name$1290;
            if (Object.prototype.hasOwnProperty.call(map$1293, key$1291)) {
                if (map$1293[key$1291] === PropertyKind$853.Data) {
                    if (strict$859 && kind$1292 === PropertyKind$853.Data) {
                        throwErrorTolerant$910({}, Messages$854.StrictDuplicateProperty);
                    } else if (kind$1292 !== PropertyKind$853.Data) {
                        throwErrorTolerant$910({}, Messages$854.AccessorDataProperty);
                    }
                } else {
                    if (kind$1292 === PropertyKind$853.Data) {
                        throwErrorTolerant$910({}, Messages$854.AccessorDataProperty);
                    } else if (map$1293[key$1291] & kind$1292) {
                        throwErrorTolerant$910({}, Messages$854.AccessorGetSet);
                    }
                }
                map$1293[key$1291] |= kind$1292;
            } else {
                map$1293[key$1291] = kind$1292;
            }
            properties$1288.push(property$1289);
            if (!match$914('}')) {
                expect$912(',');
            }
        }
        expect$912('}');
        return delegate$868.createObjectExpression(properties$1288);
    }
    function parseTemplateElement$927(option$1295) {
        var token$1296 = scanTemplateElement$900(option$1295);
        if (strict$859 && token$1296.octal) {
            throwError$909(token$1296, Messages$854.StrictOctalLiteral);
        }
        return delegate$868.createTemplateElement({
            raw: token$1296.value.raw,
            cooked: token$1296.value.cooked
        }, token$1296.tail);
    }
    function parseTemplateLiteral$928() {
        var quasi$1297, quasis$1298, expressions$1299;
        quasi$1297 = parseTemplateElement$927({ head: true });
        quasis$1298 = [quasi$1297];
        expressions$1299 = [];
        while (!quasi$1297.tail) {
            expressions$1299.push(parseExpression$949());
            quasi$1297 = parseTemplateElement$927({ head: false });
            quasis$1298.push(quasi$1297);
        }
        return delegate$868.createTemplateLiteral(quasis$1298, expressions$1299);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$929() {
        var expr$1300;
        expect$912('(');
        ++state$873.parenthesizedCount;
        expr$1300 = parseExpression$949();
        expect$912(')');
        return expr$1300;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$930() {
        var type$1301, token$1302, resolvedIdent$1303;
        token$1302 = lookahead$871;
        type$1301 = lookahead$871.type;
        if (type$1301 === Token$849.Identifier) {
            resolvedIdent$1303 = expander$848.resolve(tokenStream$869[lookaheadIndex$872]);
            lex$905();
            return delegate$868.createIdentifier(resolvedIdent$1303);
        }
        if (type$1301 === Token$849.StringLiteral || type$1301 === Token$849.NumericLiteral) {
            if (strict$859 && lookahead$871.octal) {
                throwErrorTolerant$910(lookahead$871, Messages$854.StrictOctalLiteral);
            }
            return delegate$868.createLiteral(lex$905());
        }
        if (type$1301 === Token$849.Keyword) {
            if (matchKeyword$915('this')) {
                lex$905();
                return delegate$868.createThisExpression();
            }
            if (matchKeyword$915('function')) {
                return parseFunctionExpression$987();
            }
            if (matchKeyword$915('class')) {
                return parseClassExpression$992();
            }
            if (matchKeyword$915('super')) {
                lex$905();
                return delegate$868.createIdentifier('super');
            }
        }
        if (type$1301 === Token$849.BooleanLiteral) {
            token$1302 = lex$905();
            token$1302.value = token$1302.value === 'true';
            return delegate$868.createLiteral(token$1302);
        }
        if (type$1301 === Token$849.NullLiteral) {
            token$1302 = lex$905();
            token$1302.value = null;
            return delegate$868.createLiteral(token$1302);
        }
        if (match$914('[')) {
            return parseArrayInitialiser$921();
        }
        if (match$914('{')) {
            return parseObjectInitialiser$926();
        }
        if (match$914('(')) {
            return parseGroupExpression$929();
        }
        if (lookahead$871.type === Token$849.RegularExpression) {
            return delegate$868.createLiteral(lex$905());
        }
        if (type$1301 === Token$849.Template) {
            return parseTemplateLiteral$928();
        }
        return throwUnexpected$911(lex$905());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$931() {
        var args$1304 = [], arg$1305;
        expect$912('(');
        if (!match$914(')')) {
            while (streamIndex$870 < length$867) {
                arg$1305 = parseSpreadOrAssignmentExpression$932();
                args$1304.push(arg$1305);
                if (match$914(')')) {
                    break;
                } else if (arg$1305.type === Syntax$852.SpreadElement) {
                    throwError$909({}, Messages$854.ElementAfterSpreadElement);
                }
                expect$912(',');
            }
        }
        expect$912(')');
        return args$1304;
    }
    function parseSpreadOrAssignmentExpression$932() {
        if (match$914('...')) {
            lex$905();
            return delegate$868.createSpreadElement(parseAssignmentExpression$948());
        }
        return parseAssignmentExpression$948();
    }
    function parseNonComputedProperty$933() {
        var token$1306 = lex$905();
        if (!isIdentifierName$902(token$1306)) {
            throwUnexpected$911(token$1306);
        }
        return delegate$868.createIdentifier(token$1306.value);
    }
    function parseNonComputedMember$934() {
        expect$912('.');
        return parseNonComputedProperty$933();
    }
    function parseComputedMember$935() {
        var expr$1307;
        expect$912('[');
        expr$1307 = parseExpression$949();
        expect$912(']');
        return expr$1307;
    }
    function parseNewExpression$936() {
        var callee$1308, args$1309;
        expectKeyword$913('new');
        callee$1308 = parseLeftHandSideExpression$938();
        args$1309 = match$914('(') ? parseArguments$931() : [];
        return delegate$868.createNewExpression(callee$1308, args$1309);
    }
    function parseLeftHandSideExpressionAllowCall$937() {
        var expr$1310, args$1311, property$1312;
        expr$1310 = matchKeyword$915('new') ? parseNewExpression$936() : parsePrimaryExpression$930();
        while (match$914('.') || match$914('[') || match$914('(') || lookahead$871.type === Token$849.Template) {
            if (match$914('(')) {
                args$1311 = parseArguments$931();
                expr$1310 = delegate$868.createCallExpression(expr$1310, args$1311);
            } else if (match$914('[')) {
                expr$1310 = delegate$868.createMemberExpression('[', expr$1310, parseComputedMember$935());
            } else if (match$914('.')) {
                expr$1310 = delegate$868.createMemberExpression('.', expr$1310, parseNonComputedMember$934());
            } else {
                expr$1310 = delegate$868.createTaggedTemplateExpression(expr$1310, parseTemplateLiteral$928());
            }
        }
        return expr$1310;
    }
    function parseLeftHandSideExpression$938() {
        var expr$1313, property$1314;
        expr$1313 = matchKeyword$915('new') ? parseNewExpression$936() : parsePrimaryExpression$930();
        while (match$914('.') || match$914('[') || lookahead$871.type === Token$849.Template) {
            if (match$914('[')) {
                expr$1313 = delegate$868.createMemberExpression('[', expr$1313, parseComputedMember$935());
            } else if (match$914('.')) {
                expr$1313 = delegate$868.createMemberExpression('.', expr$1313, parseNonComputedMember$934());
            } else {
                expr$1313 = delegate$868.createTaggedTemplateExpression(expr$1313, parseTemplateLiteral$928());
            }
        }
        return expr$1313;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$939() {
        var expr$1315 = parseLeftHandSideExpressionAllowCall$937(), token$1316 = lookahead$871;
        if (lookahead$871.type !== Token$849.Punctuator) {
            return expr$1315;
        }
        if ((match$914('++') || match$914('--')) && !peekLineTerminator$908()) {
            // 11.3.1, 11.3.2
            if (strict$859 && expr$1315.type === Syntax$852.Identifier && isRestrictedWord$886(expr$1315.name)) {
                throwErrorTolerant$910({}, Messages$854.StrictLHSPostfix);
            }
            if (!isLeftHandSide$919(expr$1315)) {
                throwError$909({}, Messages$854.InvalidLHSInAssignment);
            }
            token$1316 = lex$905();
            expr$1315 = delegate$868.createPostfixExpression(token$1316.value, expr$1315);
        }
        return expr$1315;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$940() {
        var token$1317, expr$1318;
        if (lookahead$871.type !== Token$849.Punctuator && lookahead$871.type !== Token$849.Keyword) {
            return parsePostfixExpression$939();
        }
        if (match$914('++') || match$914('--')) {
            token$1317 = lex$905();
            expr$1318 = parseUnaryExpression$940();
            // 11.4.4, 11.4.5
            if (strict$859 && expr$1318.type === Syntax$852.Identifier && isRestrictedWord$886(expr$1318.name)) {
                throwErrorTolerant$910({}, Messages$854.StrictLHSPrefix);
            }
            if (!isLeftHandSide$919(expr$1318)) {
                throwError$909({}, Messages$854.InvalidLHSInAssignment);
            }
            return delegate$868.createUnaryExpression(token$1317.value, expr$1318);
        }
        if (match$914('+') || match$914('-') || match$914('~') || match$914('!')) {
            token$1317 = lex$905();
            expr$1318 = parseUnaryExpression$940();
            return delegate$868.createUnaryExpression(token$1317.value, expr$1318);
        }
        if (matchKeyword$915('delete') || matchKeyword$915('void') || matchKeyword$915('typeof')) {
            token$1317 = lex$905();
            expr$1318 = parseUnaryExpression$940();
            expr$1318 = delegate$868.createUnaryExpression(token$1317.value, expr$1318);
            if (strict$859 && expr$1318.operator === 'delete' && expr$1318.argument.type === Syntax$852.Identifier) {
                throwErrorTolerant$910({}, Messages$854.StrictDelete);
            }
            return expr$1318;
        }
        return parsePostfixExpression$939();
    }
    function binaryPrecedence$941(token$1319, allowIn$1320) {
        var prec$1321 = 0;
        if (token$1319.type !== Token$849.Punctuator && token$1319.type !== Token$849.Keyword) {
            return 0;
        }
        switch (token$1319.value) {
        case '||':
            prec$1321 = 1;
            break;
        case '&&':
            prec$1321 = 2;
            break;
        case '|':
            prec$1321 = 3;
            break;
        case '^':
            prec$1321 = 4;
            break;
        case '&':
            prec$1321 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1321 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1321 = 7;
            break;
        case 'in':
            prec$1321 = allowIn$1320 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1321 = 8;
            break;
        case '+':
        case '-':
            prec$1321 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1321 = 11;
            break;
        default:
            break;
        }
        return prec$1321;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$942() {
        var expr$1322, token$1323, prec$1324, previousAllowIn$1325, stack$1326, right$1327, operator$1328, left$1329, i$1330;
        previousAllowIn$1325 = state$873.allowIn;
        state$873.allowIn = true;
        expr$1322 = parseUnaryExpression$940();
        token$1323 = lookahead$871;
        prec$1324 = binaryPrecedence$941(token$1323, previousAllowIn$1325);
        if (prec$1324 === 0) {
            return expr$1322;
        }
        token$1323.prec = prec$1324;
        lex$905();
        stack$1326 = [
            expr$1322,
            token$1323,
            parseUnaryExpression$940()
        ];
        while ((prec$1324 = binaryPrecedence$941(lookahead$871, previousAllowIn$1325)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1326.length > 2 && prec$1324 <= stack$1326[stack$1326.length - 2].prec) {
                right$1327 = stack$1326.pop();
                operator$1328 = stack$1326.pop().value;
                left$1329 = stack$1326.pop();
                stack$1326.push(delegate$868.createBinaryExpression(operator$1328, left$1329, right$1327));
            }
            // Shift.
            token$1323 = lex$905();
            token$1323.prec = prec$1324;
            stack$1326.push(token$1323);
            stack$1326.push(parseUnaryExpression$940());
        }
        state$873.allowIn = previousAllowIn$1325;
        // Final reduce to clean-up the stack.
        i$1330 = stack$1326.length - 1;
        expr$1322 = stack$1326[i$1330];
        while (i$1330 > 1) {
            expr$1322 = delegate$868.createBinaryExpression(stack$1326[i$1330 - 1].value, stack$1326[i$1330 - 2], expr$1322);
            i$1330 -= 2;
        }
        return expr$1322;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$943() {
        var expr$1331, previousAllowIn$1332, consequent$1333, alternate$1334;
        expr$1331 = parseBinaryExpression$942();
        if (match$914('?')) {
            lex$905();
            previousAllowIn$1332 = state$873.allowIn;
            state$873.allowIn = true;
            consequent$1333 = parseAssignmentExpression$948();
            state$873.allowIn = previousAllowIn$1332;
            expect$912(':');
            alternate$1334 = parseAssignmentExpression$948();
            expr$1331 = delegate$868.createConditionalExpression(expr$1331, consequent$1333, alternate$1334);
        }
        return expr$1331;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$944(expr$1335) {
        var i$1336, len$1337, property$1338, element$1339;
        if (expr$1335.type === Syntax$852.ObjectExpression) {
            expr$1335.type = Syntax$852.ObjectPattern;
            for (i$1336 = 0, len$1337 = expr$1335.properties.length; i$1336 < len$1337; i$1336 += 1) {
                property$1338 = expr$1335.properties[i$1336];
                if (property$1338.kind !== 'init') {
                    throwError$909({}, Messages$854.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$944(property$1338.value);
            }
        } else if (expr$1335.type === Syntax$852.ArrayExpression) {
            expr$1335.type = Syntax$852.ArrayPattern;
            for (i$1336 = 0, len$1337 = expr$1335.elements.length; i$1336 < len$1337; i$1336 += 1) {
                element$1339 = expr$1335.elements[i$1336];
                if (element$1339) {
                    reinterpretAsAssignmentBindingPattern$944(element$1339);
                }
            }
        } else if (expr$1335.type === Syntax$852.Identifier) {
            if (isRestrictedWord$886(expr$1335.name)) {
                throwError$909({}, Messages$854.InvalidLHSInAssignment);
            }
        } else if (expr$1335.type === Syntax$852.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$944(expr$1335.argument);
            if (expr$1335.argument.type === Syntax$852.ObjectPattern) {
                throwError$909({}, Messages$854.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1335.type !== Syntax$852.MemberExpression && expr$1335.type !== Syntax$852.CallExpression && expr$1335.type !== Syntax$852.NewExpression) {
                throwError$909({}, Messages$854.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$945(options$1340, expr$1341) {
        var i$1342, len$1343, property$1344, element$1345;
        if (expr$1341.type === Syntax$852.ObjectExpression) {
            expr$1341.type = Syntax$852.ObjectPattern;
            for (i$1342 = 0, len$1343 = expr$1341.properties.length; i$1342 < len$1343; i$1342 += 1) {
                property$1344 = expr$1341.properties[i$1342];
                if (property$1344.kind !== 'init') {
                    throwError$909({}, Messages$854.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$945(options$1340, property$1344.value);
            }
        } else if (expr$1341.type === Syntax$852.ArrayExpression) {
            expr$1341.type = Syntax$852.ArrayPattern;
            for (i$1342 = 0, len$1343 = expr$1341.elements.length; i$1342 < len$1343; i$1342 += 1) {
                element$1345 = expr$1341.elements[i$1342];
                if (element$1345) {
                    reinterpretAsDestructuredParameter$945(options$1340, element$1345);
                }
            }
        } else if (expr$1341.type === Syntax$852.Identifier) {
            validateParam$983(options$1340, expr$1341, expr$1341.name);
        } else {
            if (expr$1341.type !== Syntax$852.MemberExpression) {
                throwError$909({}, Messages$854.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$946(expressions$1346) {
        var i$1347, len$1348, param$1349, params$1350, defaults$1351, defaultCount$1352, options$1353, rest$1354;
        params$1350 = [];
        defaults$1351 = [];
        defaultCount$1352 = 0;
        rest$1354 = null;
        options$1353 = { paramSet: {} };
        for (i$1347 = 0, len$1348 = expressions$1346.length; i$1347 < len$1348; i$1347 += 1) {
            param$1349 = expressions$1346[i$1347];
            if (param$1349.type === Syntax$852.Identifier) {
                params$1350.push(param$1349);
                defaults$1351.push(null);
                validateParam$983(options$1353, param$1349, param$1349.name);
            } else if (param$1349.type === Syntax$852.ObjectExpression || param$1349.type === Syntax$852.ArrayExpression) {
                reinterpretAsDestructuredParameter$945(options$1353, param$1349);
                params$1350.push(param$1349);
                defaults$1351.push(null);
            } else if (param$1349.type === Syntax$852.SpreadElement) {
                assert$875(i$1347 === len$1348 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$945(options$1353, param$1349.argument);
                rest$1354 = param$1349.argument;
            } else if (param$1349.type === Syntax$852.AssignmentExpression) {
                params$1350.push(param$1349.left);
                defaults$1351.push(param$1349.right);
                ++defaultCount$1352;
                validateParam$983(options$1353, param$1349.left, param$1349.left.name);
            } else {
                return null;
            }
        }
        if (options$1353.message === Messages$854.StrictParamDupe) {
            throwError$909(strict$859 ? options$1353.stricted : options$1353.firstRestricted, options$1353.message);
        }
        if (defaultCount$1352 === 0) {
            defaults$1351 = [];
        }
        return {
            params: params$1350,
            defaults: defaults$1351,
            rest: rest$1354,
            stricted: options$1353.stricted,
            firstRestricted: options$1353.firstRestricted,
            message: options$1353.message
        };
    }
    function parseArrowFunctionExpression$947(options$1355) {
        var previousStrict$1356, previousYieldAllowed$1357, body$1358;
        expect$912('=>');
        previousStrict$1356 = strict$859;
        previousYieldAllowed$1357 = state$873.yieldAllowed;
        state$873.yieldAllowed = false;
        body$1358 = parseConciseBody$981();
        if (strict$859 && options$1355.firstRestricted) {
            throwError$909(options$1355.firstRestricted, options$1355.message);
        }
        if (strict$859 && options$1355.stricted) {
            throwErrorTolerant$910(options$1355.stricted, options$1355.message);
        }
        strict$859 = previousStrict$1356;
        state$873.yieldAllowed = previousYieldAllowed$1357;
        return delegate$868.createArrowFunctionExpression(options$1355.params, options$1355.defaults, body$1358, options$1355.rest, body$1358.type !== Syntax$852.BlockStatement);
    }
    function parseAssignmentExpression$948() {
        var expr$1359, token$1360, params$1361, oldParenthesizedCount$1362;
        if (matchKeyword$915('yield')) {
            return parseYieldExpression$988();
        }
        oldParenthesizedCount$1362 = state$873.parenthesizedCount;
        if (match$914('(')) {
            token$1360 = lookahead2$907();
            if (token$1360.type === Token$849.Punctuator && token$1360.value === ')' || token$1360.value === '...') {
                params$1361 = parseParams$985();
                if (!match$914('=>')) {
                    throwUnexpected$911(lex$905());
                }
                return parseArrowFunctionExpression$947(params$1361);
            }
        }
        token$1360 = lookahead$871;
        expr$1359 = parseConditionalExpression$943();
        if (match$914('=>') && (state$873.parenthesizedCount === oldParenthesizedCount$1362 || state$873.parenthesizedCount === oldParenthesizedCount$1362 + 1)) {
            if (expr$1359.type === Syntax$852.Identifier) {
                params$1361 = reinterpretAsCoverFormalsList$946([expr$1359]);
            } else if (expr$1359.type === Syntax$852.SequenceExpression) {
                params$1361 = reinterpretAsCoverFormalsList$946(expr$1359.expressions);
            }
            if (params$1361) {
                return parseArrowFunctionExpression$947(params$1361);
            }
        }
        if (matchAssign$917()) {
            // 11.13.1
            if (strict$859 && expr$1359.type === Syntax$852.Identifier && isRestrictedWord$886(expr$1359.name)) {
                throwErrorTolerant$910(token$1360, Messages$854.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$914('=') && (expr$1359.type === Syntax$852.ObjectExpression || expr$1359.type === Syntax$852.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$944(expr$1359);
            } else if (!isLeftHandSide$919(expr$1359)) {
                throwError$909({}, Messages$854.InvalidLHSInAssignment);
            }
            expr$1359 = delegate$868.createAssignmentExpression(lex$905().value, expr$1359, parseAssignmentExpression$948());
        }
        return expr$1359;
    }
    // 11.14 Comma Operator
    function parseExpression$949() {
        var expr$1363, expressions$1364, sequence$1365, coverFormalsList$1366, spreadFound$1367, oldParenthesizedCount$1368;
        oldParenthesizedCount$1368 = state$873.parenthesizedCount;
        expr$1363 = parseAssignmentExpression$948();
        expressions$1364 = [expr$1363];
        if (match$914(',')) {
            while (streamIndex$870 < length$867) {
                if (!match$914(',')) {
                    break;
                }
                lex$905();
                expr$1363 = parseSpreadOrAssignmentExpression$932();
                expressions$1364.push(expr$1363);
                if (expr$1363.type === Syntax$852.SpreadElement) {
                    spreadFound$1367 = true;
                    if (!match$914(')')) {
                        throwError$909({}, Messages$854.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1365 = delegate$868.createSequenceExpression(expressions$1364);
        }
        if (match$914('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$873.parenthesizedCount === oldParenthesizedCount$1368 || state$873.parenthesizedCount === oldParenthesizedCount$1368 + 1) {
                expr$1363 = expr$1363.type === Syntax$852.SequenceExpression ? expr$1363.expressions : expressions$1364;
                coverFormalsList$1366 = reinterpretAsCoverFormalsList$946(expr$1363);
                if (coverFormalsList$1366) {
                    return parseArrowFunctionExpression$947(coverFormalsList$1366);
                }
            }
            throwUnexpected$911(lex$905());
        }
        if (spreadFound$1367 && lookahead2$907().value !== '=>') {
            throwError$909({}, Messages$854.IllegalSpread);
        }
        return sequence$1365 || expr$1363;
    }
    // 12.1 Block
    function parseStatementList$950() {
        var list$1369 = [], statement$1370;
        while (streamIndex$870 < length$867) {
            if (match$914('}')) {
                break;
            }
            statement$1370 = parseSourceElement$995();
            if (typeof statement$1370 === 'undefined') {
                break;
            }
            list$1369.push(statement$1370);
        }
        return list$1369;
    }
    function parseBlock$951() {
        var block$1371;
        expect$912('{');
        block$1371 = parseStatementList$950();
        expect$912('}');
        return delegate$868.createBlockStatement(block$1371);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$952() {
        var token$1372 = lookahead$871, resolvedIdent$1373;
        if (token$1372.type !== Token$849.Identifier) {
            throwUnexpected$911(token$1372);
        }
        resolvedIdent$1373 = expander$848.resolve(tokenStream$869[lookaheadIndex$872]);
        lex$905();
        return delegate$868.createIdentifier(resolvedIdent$1373);
    }
    function parseVariableDeclaration$953(kind$1374) {
        var id$1375, init$1376 = null;
        if (match$914('{')) {
            id$1375 = parseObjectInitialiser$926();
            reinterpretAsAssignmentBindingPattern$944(id$1375);
        } else if (match$914('[')) {
            id$1375 = parseArrayInitialiser$921();
            reinterpretAsAssignmentBindingPattern$944(id$1375);
        } else {
            id$1375 = state$873.allowKeyword ? parseNonComputedProperty$933() : parseVariableIdentifier$952();
            // 12.2.1
            if (strict$859 && isRestrictedWord$886(id$1375.name)) {
                throwErrorTolerant$910({}, Messages$854.StrictVarName);
            }
        }
        if (kind$1374 === 'const') {
            if (!match$914('=')) {
                throwError$909({}, Messages$854.NoUnintializedConst);
            }
            expect$912('=');
            init$1376 = parseAssignmentExpression$948();
        } else if (match$914('=')) {
            lex$905();
            init$1376 = parseAssignmentExpression$948();
        }
        return delegate$868.createVariableDeclarator(id$1375, init$1376);
    }
    function parseVariableDeclarationList$954(kind$1377) {
        var list$1378 = [];
        do {
            list$1378.push(parseVariableDeclaration$953(kind$1377));
            if (!match$914(',')) {
                break;
            }
            lex$905();
        } while (streamIndex$870 < length$867);
        return list$1378;
    }
    function parseVariableStatement$955() {
        var declarations$1379;
        expectKeyword$913('var');
        declarations$1379 = parseVariableDeclarationList$954();
        consumeSemicolon$918();
        return delegate$868.createVariableDeclaration(declarations$1379, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$956(kind$1380) {
        var declarations$1381;
        expectKeyword$913(kind$1380);
        declarations$1381 = parseVariableDeclarationList$954(kind$1380);
        consumeSemicolon$918();
        return delegate$868.createVariableDeclaration(declarations$1381, kind$1380);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$957() {
        var id$1382, src$1383, body$1384;
        lex$905();
        // 'module'
        if (peekLineTerminator$908()) {
            throwError$909({}, Messages$854.NewlineAfterModule);
        }
        switch (lookahead$871.type) {
        case Token$849.StringLiteral:
            id$1382 = parsePrimaryExpression$930();
            body$1384 = parseModuleBlock$1000();
            src$1383 = null;
            break;
        case Token$849.Identifier:
            id$1382 = parseVariableIdentifier$952();
            body$1384 = null;
            if (!matchContextualKeyword$916('from')) {
                throwUnexpected$911(lex$905());
            }
            lex$905();
            src$1383 = parsePrimaryExpression$930();
            if (src$1383.type !== Syntax$852.Literal) {
                throwError$909({}, Messages$854.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$918();
        return delegate$868.createModuleDeclaration(id$1382, src$1383, body$1384);
    }
    function parseExportBatchSpecifier$958() {
        expect$912('*');
        return delegate$868.createExportBatchSpecifier();
    }
    function parseExportSpecifier$959() {
        var id$1385, name$1386 = null;
        id$1385 = parseVariableIdentifier$952();
        if (matchContextualKeyword$916('as')) {
            lex$905();
            name$1386 = parseNonComputedProperty$933();
        }
        return delegate$868.createExportSpecifier(id$1385, name$1386);
    }
    function parseExportDeclaration$960() {
        var previousAllowKeyword$1387, decl$1388, def$1389, src$1390, specifiers$1391;
        expectKeyword$913('export');
        if (lookahead$871.type === Token$849.Keyword) {
            switch (lookahead$871.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$868.createExportDeclaration(parseSourceElement$995(), null, null);
            }
        }
        if (isIdentifierName$902(lookahead$871)) {
            previousAllowKeyword$1387 = state$873.allowKeyword;
            state$873.allowKeyword = true;
            decl$1388 = parseVariableDeclarationList$954('let');
            state$873.allowKeyword = previousAllowKeyword$1387;
            return delegate$868.createExportDeclaration(decl$1388, null, null);
        }
        specifiers$1391 = [];
        src$1390 = null;
        if (match$914('*')) {
            specifiers$1391.push(parseExportBatchSpecifier$958());
        } else {
            expect$912('{');
            do {
                specifiers$1391.push(parseExportSpecifier$959());
            } while (match$914(',') && lex$905());
            expect$912('}');
        }
        if (matchContextualKeyword$916('from')) {
            lex$905();
            src$1390 = parsePrimaryExpression$930();
            if (src$1390.type !== Syntax$852.Literal) {
                throwError$909({}, Messages$854.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$918();
        return delegate$868.createExportDeclaration(null, specifiers$1391, src$1390);
    }
    function parseImportDeclaration$961() {
        var specifiers$1392, kind$1393, src$1394;
        expectKeyword$913('import');
        specifiers$1392 = [];
        if (isIdentifierName$902(lookahead$871)) {
            kind$1393 = 'default';
            specifiers$1392.push(parseImportSpecifier$962());
            if (!matchContextualKeyword$916('from')) {
                throwError$909({}, Messages$854.NoFromAfterImport);
            }
            lex$905();
        } else if (match$914('{')) {
            kind$1393 = 'named';
            lex$905();
            do {
                specifiers$1392.push(parseImportSpecifier$962());
            } while (match$914(',') && lex$905());
            expect$912('}');
            if (!matchContextualKeyword$916('from')) {
                throwError$909({}, Messages$854.NoFromAfterImport);
            }
            lex$905();
        }
        src$1394 = parsePrimaryExpression$930();
        if (src$1394.type !== Syntax$852.Literal) {
            throwError$909({}, Messages$854.InvalidModuleSpecifier);
        }
        consumeSemicolon$918();
        return delegate$868.createImportDeclaration(specifiers$1392, kind$1393, src$1394);
    }
    function parseImportSpecifier$962() {
        var id$1395, name$1396 = null;
        id$1395 = parseNonComputedProperty$933();
        if (matchContextualKeyword$916('as')) {
            lex$905();
            name$1396 = parseVariableIdentifier$952();
        }
        return delegate$868.createImportSpecifier(id$1395, name$1396);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$963() {
        expect$912(';');
        return delegate$868.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$964() {
        var expr$1397 = parseExpression$949();
        consumeSemicolon$918();
        return delegate$868.createExpressionStatement(expr$1397);
    }
    // 12.5 If statement
    function parseIfStatement$965() {
        var test$1398, consequent$1399, alternate$1400;
        expectKeyword$913('if');
        expect$912('(');
        test$1398 = parseExpression$949();
        expect$912(')');
        consequent$1399 = parseStatement$980();
        if (matchKeyword$915('else')) {
            lex$905();
            alternate$1400 = parseStatement$980();
        } else {
            alternate$1400 = null;
        }
        return delegate$868.createIfStatement(test$1398, consequent$1399, alternate$1400);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$966() {
        var body$1401, test$1402, oldInIteration$1403;
        expectKeyword$913('do');
        oldInIteration$1403 = state$873.inIteration;
        state$873.inIteration = true;
        body$1401 = parseStatement$980();
        state$873.inIteration = oldInIteration$1403;
        expectKeyword$913('while');
        expect$912('(');
        test$1402 = parseExpression$949();
        expect$912(')');
        if (match$914(';')) {
            lex$905();
        }
        return delegate$868.createDoWhileStatement(body$1401, test$1402);
    }
    function parseWhileStatement$967() {
        var test$1404, body$1405, oldInIteration$1406;
        expectKeyword$913('while');
        expect$912('(');
        test$1404 = parseExpression$949();
        expect$912(')');
        oldInIteration$1406 = state$873.inIteration;
        state$873.inIteration = true;
        body$1405 = parseStatement$980();
        state$873.inIteration = oldInIteration$1406;
        return delegate$868.createWhileStatement(test$1404, body$1405);
    }
    function parseForVariableDeclaration$968() {
        var token$1407 = lex$905(), declarations$1408 = parseVariableDeclarationList$954();
        return delegate$868.createVariableDeclaration(declarations$1408, token$1407.value);
    }
    function parseForStatement$969(opts$1409) {
        var init$1410, test$1411, update$1412, left$1413, right$1414, body$1415, operator$1416, oldInIteration$1417;
        init$1410 = test$1411 = update$1412 = null;
        expectKeyword$913('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$916('each')) {
            throwError$909({}, Messages$854.EachNotAllowed);
        }
        expect$912('(');
        if (match$914(';')) {
            lex$905();
        } else {
            if (matchKeyword$915('var') || matchKeyword$915('let') || matchKeyword$915('const')) {
                state$873.allowIn = false;
                init$1410 = parseForVariableDeclaration$968();
                state$873.allowIn = true;
                if (init$1410.declarations.length === 1) {
                    if (matchKeyword$915('in') || matchContextualKeyword$916('of')) {
                        operator$1416 = lookahead$871;
                        if (!((operator$1416.value === 'in' || init$1410.kind !== 'var') && init$1410.declarations[0].init)) {
                            lex$905();
                            left$1413 = init$1410;
                            right$1414 = parseExpression$949();
                            init$1410 = null;
                        }
                    }
                }
            } else {
                state$873.allowIn = false;
                init$1410 = parseExpression$949();
                state$873.allowIn = true;
                if (matchContextualKeyword$916('of')) {
                    operator$1416 = lex$905();
                    left$1413 = init$1410;
                    right$1414 = parseExpression$949();
                    init$1410 = null;
                } else if (matchKeyword$915('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$920(init$1410)) {
                        throwError$909({}, Messages$854.InvalidLHSInForIn);
                    }
                    operator$1416 = lex$905();
                    left$1413 = init$1410;
                    right$1414 = parseExpression$949();
                    init$1410 = null;
                }
            }
            if (typeof left$1413 === 'undefined') {
                expect$912(';');
            }
        }
        if (typeof left$1413 === 'undefined') {
            if (!match$914(';')) {
                test$1411 = parseExpression$949();
            }
            expect$912(';');
            if (!match$914(')')) {
                update$1412 = parseExpression$949();
            }
        }
        expect$912(')');
        oldInIteration$1417 = state$873.inIteration;
        state$873.inIteration = true;
        if (!(opts$1409 !== undefined && opts$1409.ignoreBody)) {
            body$1415 = parseStatement$980();
        }
        state$873.inIteration = oldInIteration$1417;
        if (typeof left$1413 === 'undefined') {
            return delegate$868.createForStatement(init$1410, test$1411, update$1412, body$1415);
        }
        if (operator$1416.value === 'in') {
            return delegate$868.createForInStatement(left$1413, right$1414, body$1415);
        }
        return delegate$868.createForOfStatement(left$1413, right$1414, body$1415);
    }
    // 12.7 The continue statement
    function parseContinueStatement$970() {
        var label$1418 = null, key$1419;
        expectKeyword$913('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$871.value.charCodeAt(0) === 59) {
            lex$905();
            if (!state$873.inIteration) {
                throwError$909({}, Messages$854.IllegalContinue);
            }
            return delegate$868.createContinueStatement(null);
        }
        if (peekLineTerminator$908()) {
            if (!state$873.inIteration) {
                throwError$909({}, Messages$854.IllegalContinue);
            }
            return delegate$868.createContinueStatement(null);
        }
        if (lookahead$871.type === Token$849.Identifier) {
            label$1418 = parseVariableIdentifier$952();
            key$1419 = '$' + label$1418.name;
            if (!Object.prototype.hasOwnProperty.call(state$873.labelSet, key$1419)) {
                throwError$909({}, Messages$854.UnknownLabel, label$1418.name);
            }
        }
        consumeSemicolon$918();
        if (label$1418 === null && !state$873.inIteration) {
            throwError$909({}, Messages$854.IllegalContinue);
        }
        return delegate$868.createContinueStatement(label$1418);
    }
    // 12.8 The break statement
    function parseBreakStatement$971() {
        var label$1420 = null, key$1421;
        expectKeyword$913('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$871.value.charCodeAt(0) === 59) {
            lex$905();
            if (!(state$873.inIteration || state$873.inSwitch)) {
                throwError$909({}, Messages$854.IllegalBreak);
            }
            return delegate$868.createBreakStatement(null);
        }
        if (peekLineTerminator$908()) {
            if (!(state$873.inIteration || state$873.inSwitch)) {
                throwError$909({}, Messages$854.IllegalBreak);
            }
            return delegate$868.createBreakStatement(null);
        }
        if (lookahead$871.type === Token$849.Identifier) {
            label$1420 = parseVariableIdentifier$952();
            key$1421 = '$' + label$1420.name;
            if (!Object.prototype.hasOwnProperty.call(state$873.labelSet, key$1421)) {
                throwError$909({}, Messages$854.UnknownLabel, label$1420.name);
            }
        }
        consumeSemicolon$918();
        if (label$1420 === null && !(state$873.inIteration || state$873.inSwitch)) {
            throwError$909({}, Messages$854.IllegalBreak);
        }
        return delegate$868.createBreakStatement(label$1420);
    }
    // 12.9 The return statement
    function parseReturnStatement$972() {
        var argument$1422 = null;
        expectKeyword$913('return');
        if (!state$873.inFunctionBody) {
            throwErrorTolerant$910({}, Messages$854.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$882(String(lookahead$871.value).charCodeAt(0))) {
            argument$1422 = parseExpression$949();
            consumeSemicolon$918();
            return delegate$868.createReturnStatement(argument$1422);
        }
        if (peekLineTerminator$908()) {
            return delegate$868.createReturnStatement(null);
        }
        if (!match$914(';')) {
            if (!match$914('}') && lookahead$871.type !== Token$849.EOF) {
                argument$1422 = parseExpression$949();
            }
        }
        consumeSemicolon$918();
        return delegate$868.createReturnStatement(argument$1422);
    }
    // 12.10 The with statement
    function parseWithStatement$973() {
        var object$1423, body$1424;
        if (strict$859) {
            throwErrorTolerant$910({}, Messages$854.StrictModeWith);
        }
        expectKeyword$913('with');
        expect$912('(');
        object$1423 = parseExpression$949();
        expect$912(')');
        body$1424 = parseStatement$980();
        return delegate$868.createWithStatement(object$1423, body$1424);
    }
    // 12.10 The swith statement
    function parseSwitchCase$974() {
        var test$1425, consequent$1426 = [], sourceElement$1427;
        if (matchKeyword$915('default')) {
            lex$905();
            test$1425 = null;
        } else {
            expectKeyword$913('case');
            test$1425 = parseExpression$949();
        }
        expect$912(':');
        while (streamIndex$870 < length$867) {
            if (match$914('}') || matchKeyword$915('default') || matchKeyword$915('case')) {
                break;
            }
            sourceElement$1427 = parseSourceElement$995();
            if (typeof sourceElement$1427 === 'undefined') {
                break;
            }
            consequent$1426.push(sourceElement$1427);
        }
        return delegate$868.createSwitchCase(test$1425, consequent$1426);
    }
    function parseSwitchStatement$975() {
        var discriminant$1428, cases$1429, clause$1430, oldInSwitch$1431, defaultFound$1432;
        expectKeyword$913('switch');
        expect$912('(');
        discriminant$1428 = parseExpression$949();
        expect$912(')');
        expect$912('{');
        cases$1429 = [];
        if (match$914('}')) {
            lex$905();
            return delegate$868.createSwitchStatement(discriminant$1428, cases$1429);
        }
        oldInSwitch$1431 = state$873.inSwitch;
        state$873.inSwitch = true;
        defaultFound$1432 = false;
        while (streamIndex$870 < length$867) {
            if (match$914('}')) {
                break;
            }
            clause$1430 = parseSwitchCase$974();
            if (clause$1430.test === null) {
                if (defaultFound$1432) {
                    throwError$909({}, Messages$854.MultipleDefaultsInSwitch);
                }
                defaultFound$1432 = true;
            }
            cases$1429.push(clause$1430);
        }
        state$873.inSwitch = oldInSwitch$1431;
        expect$912('}');
        return delegate$868.createSwitchStatement(discriminant$1428, cases$1429);
    }
    // 12.13 The throw statement
    function parseThrowStatement$976() {
        var argument$1433;
        expectKeyword$913('throw');
        if (peekLineTerminator$908()) {
            throwError$909({}, Messages$854.NewlineAfterThrow);
        }
        argument$1433 = parseExpression$949();
        consumeSemicolon$918();
        return delegate$868.createThrowStatement(argument$1433);
    }
    // 12.14 The try statement
    function parseCatchClause$977() {
        var param$1434, body$1435;
        expectKeyword$913('catch');
        expect$912('(');
        if (match$914(')')) {
            throwUnexpected$911(lookahead$871);
        }
        param$1434 = parseExpression$949();
        // 12.14.1
        if (strict$859 && param$1434.type === Syntax$852.Identifier && isRestrictedWord$886(param$1434.name)) {
            throwErrorTolerant$910({}, Messages$854.StrictCatchVariable);
        }
        expect$912(')');
        body$1435 = parseBlock$951();
        return delegate$868.createCatchClause(param$1434, body$1435);
    }
    function parseTryStatement$978() {
        var block$1436, handlers$1437 = [], finalizer$1438 = null;
        expectKeyword$913('try');
        block$1436 = parseBlock$951();
        if (matchKeyword$915('catch')) {
            handlers$1437.push(parseCatchClause$977());
        }
        if (matchKeyword$915('finally')) {
            lex$905();
            finalizer$1438 = parseBlock$951();
        }
        if (handlers$1437.length === 0 && !finalizer$1438) {
            throwError$909({}, Messages$854.NoCatchOrFinally);
        }
        return delegate$868.createTryStatement(block$1436, [], handlers$1437, finalizer$1438);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$979() {
        expectKeyword$913('debugger');
        consumeSemicolon$918();
        return delegate$868.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$980() {
        var type$1439 = lookahead$871.type, expr$1440, labeledBody$1441, key$1442;
        if (type$1439 === Token$849.EOF) {
            throwUnexpected$911(lookahead$871);
        }
        if (type$1439 === Token$849.Punctuator) {
            switch (lookahead$871.value) {
            case ';':
                return parseEmptyStatement$963();
            case '{':
                return parseBlock$951();
            case '(':
                return parseExpressionStatement$964();
            default:
                break;
            }
        }
        if (type$1439 === Token$849.Keyword) {
            switch (lookahead$871.value) {
            case 'break':
                return parseBreakStatement$971();
            case 'continue':
                return parseContinueStatement$970();
            case 'debugger':
                return parseDebuggerStatement$979();
            case 'do':
                return parseDoWhileStatement$966();
            case 'for':
                return parseForStatement$969();
            case 'function':
                return parseFunctionDeclaration$986();
            case 'class':
                return parseClassDeclaration$993();
            case 'if':
                return parseIfStatement$965();
            case 'return':
                return parseReturnStatement$972();
            case 'switch':
                return parseSwitchStatement$975();
            case 'throw':
                return parseThrowStatement$976();
            case 'try':
                return parseTryStatement$978();
            case 'var':
                return parseVariableStatement$955();
            case 'while':
                return parseWhileStatement$967();
            case 'with':
                return parseWithStatement$973();
            default:
                break;
            }
        }
        expr$1440 = parseExpression$949();
        // 12.12 Labelled Statements
        if (expr$1440.type === Syntax$852.Identifier && match$914(':')) {
            lex$905();
            key$1442 = '$' + expr$1440.name;
            if (Object.prototype.hasOwnProperty.call(state$873.labelSet, key$1442)) {
                throwError$909({}, Messages$854.Redeclaration, 'Label', expr$1440.name);
            }
            state$873.labelSet[key$1442] = true;
            labeledBody$1441 = parseStatement$980();
            delete state$873.labelSet[key$1442];
            return delegate$868.createLabeledStatement(expr$1440, labeledBody$1441);
        }
        consumeSemicolon$918();
        return delegate$868.createExpressionStatement(expr$1440);
    }
    // 13 Function Definition
    function parseConciseBody$981() {
        if (match$914('{')) {
            return parseFunctionSourceElements$982();
        }
        return parseAssignmentExpression$948();
    }
    function parseFunctionSourceElements$982() {
        var sourceElement$1443, sourceElements$1444 = [], token$1445, directive$1446, firstRestricted$1447, oldLabelSet$1448, oldInIteration$1449, oldInSwitch$1450, oldInFunctionBody$1451, oldParenthesizedCount$1452;
        expect$912('{');
        while (streamIndex$870 < length$867) {
            if (lookahead$871.type !== Token$849.StringLiteral) {
                break;
            }
            token$1445 = lookahead$871;
            sourceElement$1443 = parseSourceElement$995();
            sourceElements$1444.push(sourceElement$1443);
            if (sourceElement$1443.expression.type !== Syntax$852.Literal) {
                // this is not directive
                break;
            }
            directive$1446 = token$1445.value;
            if (directive$1446 === 'use strict') {
                strict$859 = true;
                if (firstRestricted$1447) {
                    throwErrorTolerant$910(firstRestricted$1447, Messages$854.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1447 && token$1445.octal) {
                    firstRestricted$1447 = token$1445;
                }
            }
        }
        oldLabelSet$1448 = state$873.labelSet;
        oldInIteration$1449 = state$873.inIteration;
        oldInSwitch$1450 = state$873.inSwitch;
        oldInFunctionBody$1451 = state$873.inFunctionBody;
        oldParenthesizedCount$1452 = state$873.parenthesizedCount;
        state$873.labelSet = {};
        state$873.inIteration = false;
        state$873.inSwitch = false;
        state$873.inFunctionBody = true;
        state$873.parenthesizedCount = 0;
        while (streamIndex$870 < length$867) {
            if (match$914('}')) {
                break;
            }
            sourceElement$1443 = parseSourceElement$995();
            if (typeof sourceElement$1443 === 'undefined') {
                break;
            }
            sourceElements$1444.push(sourceElement$1443);
        }
        expect$912('}');
        state$873.labelSet = oldLabelSet$1448;
        state$873.inIteration = oldInIteration$1449;
        state$873.inSwitch = oldInSwitch$1450;
        state$873.inFunctionBody = oldInFunctionBody$1451;
        state$873.parenthesizedCount = oldParenthesizedCount$1452;
        return delegate$868.createBlockStatement(sourceElements$1444);
    }
    function validateParam$983(options$1453, param$1454, name$1455) {
        var key$1456 = '$' + name$1455;
        if (strict$859) {
            if (isRestrictedWord$886(name$1455)) {
                options$1453.stricted = param$1454;
                options$1453.message = Messages$854.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1453.paramSet, key$1456)) {
                options$1453.stricted = param$1454;
                options$1453.message = Messages$854.StrictParamDupe;
            }
        } else if (!options$1453.firstRestricted) {
            if (isRestrictedWord$886(name$1455)) {
                options$1453.firstRestricted = param$1454;
                options$1453.message = Messages$854.StrictParamName;
            } else if (isStrictModeReservedWord$885(name$1455)) {
                options$1453.firstRestricted = param$1454;
                options$1453.message = Messages$854.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1453.paramSet, key$1456)) {
                options$1453.firstRestricted = param$1454;
                options$1453.message = Messages$854.StrictParamDupe;
            }
        }
        options$1453.paramSet[key$1456] = true;
    }
    function parseParam$984(options$1457) {
        var token$1458, rest$1459, param$1460, def$1461;
        token$1458 = lookahead$871;
        if (token$1458.value === '...') {
            token$1458 = lex$905();
            rest$1459 = true;
        }
        if (match$914('[')) {
            param$1460 = parseArrayInitialiser$921();
            reinterpretAsDestructuredParameter$945(options$1457, param$1460);
        } else if (match$914('{')) {
            if (rest$1459) {
                throwError$909({}, Messages$854.ObjectPatternAsRestParameter);
            }
            param$1460 = parseObjectInitialiser$926();
            reinterpretAsDestructuredParameter$945(options$1457, param$1460);
        } else {
            param$1460 = parseVariableIdentifier$952();
            validateParam$983(options$1457, token$1458, token$1458.value);
            if (match$914('=')) {
                if (rest$1459) {
                    throwErrorTolerant$910(lookahead$871, Messages$854.DefaultRestParameter);
                }
                lex$905();
                def$1461 = parseAssignmentExpression$948();
                ++options$1457.defaultCount;
            }
        }
        if (rest$1459) {
            if (!match$914(')')) {
                throwError$909({}, Messages$854.ParameterAfterRestParameter);
            }
            options$1457.rest = param$1460;
            return false;
        }
        options$1457.params.push(param$1460);
        options$1457.defaults.push(def$1461);
        return !match$914(')');
    }
    function parseParams$985(firstRestricted$1462) {
        var options$1463;
        options$1463 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1462
        };
        expect$912('(');
        if (!match$914(')')) {
            options$1463.paramSet = {};
            while (streamIndex$870 < length$867) {
                if (!parseParam$984(options$1463)) {
                    break;
                }
                expect$912(',');
            }
        }
        expect$912(')');
        if (options$1463.defaultCount === 0) {
            options$1463.defaults = [];
        }
        return options$1463;
    }
    function parseFunctionDeclaration$986() {
        var id$1464, body$1465, token$1466, tmp$1467, firstRestricted$1468, message$1469, previousStrict$1470, previousYieldAllowed$1471, generator$1472, expression$1473;
        expectKeyword$913('function');
        generator$1472 = false;
        if (match$914('*')) {
            lex$905();
            generator$1472 = true;
        }
        token$1466 = lookahead$871;
        id$1464 = parseVariableIdentifier$952();
        if (strict$859) {
            if (isRestrictedWord$886(token$1466.value)) {
                throwErrorTolerant$910(token$1466, Messages$854.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$886(token$1466.value)) {
                firstRestricted$1468 = token$1466;
                message$1469 = Messages$854.StrictFunctionName;
            } else if (isStrictModeReservedWord$885(token$1466.value)) {
                firstRestricted$1468 = token$1466;
                message$1469 = Messages$854.StrictReservedWord;
            }
        }
        tmp$1467 = parseParams$985(firstRestricted$1468);
        firstRestricted$1468 = tmp$1467.firstRestricted;
        if (tmp$1467.message) {
            message$1469 = tmp$1467.message;
        }
        previousStrict$1470 = strict$859;
        previousYieldAllowed$1471 = state$873.yieldAllowed;
        state$873.yieldAllowed = generator$1472;
        // here we redo some work in order to set 'expression'
        expression$1473 = !match$914('{');
        body$1465 = parseConciseBody$981();
        if (strict$859 && firstRestricted$1468) {
            throwError$909(firstRestricted$1468, message$1469);
        }
        if (strict$859 && tmp$1467.stricted) {
            throwErrorTolerant$910(tmp$1467.stricted, message$1469);
        }
        if (state$873.yieldAllowed && !state$873.yieldFound) {
            throwErrorTolerant$910({}, Messages$854.NoYieldInGenerator);
        }
        strict$859 = previousStrict$1470;
        state$873.yieldAllowed = previousYieldAllowed$1471;
        return delegate$868.createFunctionDeclaration(id$1464, tmp$1467.params, tmp$1467.defaults, body$1465, tmp$1467.rest, generator$1472, expression$1473);
    }
    function parseFunctionExpression$987() {
        var token$1474, id$1475 = null, firstRestricted$1476, message$1477, tmp$1478, body$1479, previousStrict$1480, previousYieldAllowed$1481, generator$1482, expression$1483;
        expectKeyword$913('function');
        generator$1482 = false;
        if (match$914('*')) {
            lex$905();
            generator$1482 = true;
        }
        if (!match$914('(')) {
            token$1474 = lookahead$871;
            id$1475 = parseVariableIdentifier$952();
            if (strict$859) {
                if (isRestrictedWord$886(token$1474.value)) {
                    throwErrorTolerant$910(token$1474, Messages$854.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$886(token$1474.value)) {
                    firstRestricted$1476 = token$1474;
                    message$1477 = Messages$854.StrictFunctionName;
                } else if (isStrictModeReservedWord$885(token$1474.value)) {
                    firstRestricted$1476 = token$1474;
                    message$1477 = Messages$854.StrictReservedWord;
                }
            }
        }
        tmp$1478 = parseParams$985(firstRestricted$1476);
        firstRestricted$1476 = tmp$1478.firstRestricted;
        if (tmp$1478.message) {
            message$1477 = tmp$1478.message;
        }
        previousStrict$1480 = strict$859;
        previousYieldAllowed$1481 = state$873.yieldAllowed;
        state$873.yieldAllowed = generator$1482;
        // here we redo some work in order to set 'expression'
        expression$1483 = !match$914('{');
        body$1479 = parseConciseBody$981();
        if (strict$859 && firstRestricted$1476) {
            throwError$909(firstRestricted$1476, message$1477);
        }
        if (strict$859 && tmp$1478.stricted) {
            throwErrorTolerant$910(tmp$1478.stricted, message$1477);
        }
        if (state$873.yieldAllowed && !state$873.yieldFound) {
            throwErrorTolerant$910({}, Messages$854.NoYieldInGenerator);
        }
        strict$859 = previousStrict$1480;
        state$873.yieldAllowed = previousYieldAllowed$1481;
        return delegate$868.createFunctionExpression(id$1475, tmp$1478.params, tmp$1478.defaults, body$1479, tmp$1478.rest, generator$1482, expression$1483);
    }
    function parseYieldExpression$988() {
        var delegateFlag$1484, expr$1485, previousYieldAllowed$1486;
        expectKeyword$913('yield');
        if (!state$873.yieldAllowed) {
            throwErrorTolerant$910({}, Messages$854.IllegalYield);
        }
        delegateFlag$1484 = false;
        if (match$914('*')) {
            lex$905();
            delegateFlag$1484 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1486 = state$873.yieldAllowed;
        state$873.yieldAllowed = false;
        expr$1485 = parseAssignmentExpression$948();
        state$873.yieldAllowed = previousYieldAllowed$1486;
        state$873.yieldFound = true;
        return delegate$868.createYieldExpression(expr$1485, delegateFlag$1484);
    }
    // 14 Classes
    function parseMethodDefinition$989(existingPropNames$1487) {
        var token$1488, key$1489, param$1490, propType$1491, isValidDuplicateProp$1492 = false;
        if (lookahead$871.value === 'static') {
            propType$1491 = ClassPropertyType$857.static;
            lex$905();
        } else {
            propType$1491 = ClassPropertyType$857.prototype;
        }
        if (match$914('*')) {
            lex$905();
            return delegate$868.createMethodDefinition(propType$1491, '', parseObjectPropertyKey$924(), parsePropertyMethodFunction$923({ generator: true }));
        }
        token$1488 = lookahead$871;
        key$1489 = parseObjectPropertyKey$924();
        if (token$1488.value === 'get' && !match$914('(')) {
            key$1489 = parseObjectPropertyKey$924();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1487[propType$1491].hasOwnProperty(key$1489.name)) {
                isValidDuplicateProp$1492 = existingPropNames$1487[propType$1491][key$1489.name].get === undefined && existingPropNames$1487[propType$1491][key$1489.name].data === undefined && existingPropNames$1487[propType$1491][key$1489.name].set !== undefined;
                if (!isValidDuplicateProp$1492) {
                    throwError$909(key$1489, Messages$854.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1487[propType$1491][key$1489.name] = {};
            }
            existingPropNames$1487[propType$1491][key$1489.name].get = true;
            expect$912('(');
            expect$912(')');
            return delegate$868.createMethodDefinition(propType$1491, 'get', key$1489, parsePropertyFunction$922({ generator: false }));
        }
        if (token$1488.value === 'set' && !match$914('(')) {
            key$1489 = parseObjectPropertyKey$924();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1487[propType$1491].hasOwnProperty(key$1489.name)) {
                isValidDuplicateProp$1492 = existingPropNames$1487[propType$1491][key$1489.name].set === undefined && existingPropNames$1487[propType$1491][key$1489.name].data === undefined && existingPropNames$1487[propType$1491][key$1489.name].get !== undefined;
                if (!isValidDuplicateProp$1492) {
                    throwError$909(key$1489, Messages$854.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1487[propType$1491][key$1489.name] = {};
            }
            existingPropNames$1487[propType$1491][key$1489.name].set = true;
            expect$912('(');
            token$1488 = lookahead$871;
            param$1490 = [parseVariableIdentifier$952()];
            expect$912(')');
            return delegate$868.createMethodDefinition(propType$1491, 'set', key$1489, parsePropertyFunction$922({
                params: param$1490,
                generator: false,
                name: token$1488
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1487[propType$1491].hasOwnProperty(key$1489.name)) {
            throwError$909(key$1489, Messages$854.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1487[propType$1491][key$1489.name] = {};
        }
        existingPropNames$1487[propType$1491][key$1489.name].data = true;
        return delegate$868.createMethodDefinition(propType$1491, '', key$1489, parsePropertyMethodFunction$923({ generator: false }));
    }
    function parseClassElement$990(existingProps$1493) {
        if (match$914(';')) {
            lex$905();
            return;
        }
        return parseMethodDefinition$989(existingProps$1493);
    }
    function parseClassBody$991() {
        var classElement$1494, classElements$1495 = [], existingProps$1496 = {};
        existingProps$1496[ClassPropertyType$857.static] = {};
        existingProps$1496[ClassPropertyType$857.prototype] = {};
        expect$912('{');
        while (streamIndex$870 < length$867) {
            if (match$914('}')) {
                break;
            }
            classElement$1494 = parseClassElement$990(existingProps$1496);
            if (typeof classElement$1494 !== 'undefined') {
                classElements$1495.push(classElement$1494);
            }
        }
        expect$912('}');
        return delegate$868.createClassBody(classElements$1495);
    }
    function parseClassExpression$992() {
        var id$1497, previousYieldAllowed$1498, superClass$1499 = null;
        expectKeyword$913('class');
        if (!matchKeyword$915('extends') && !match$914('{')) {
            id$1497 = parseVariableIdentifier$952();
        }
        if (matchKeyword$915('extends')) {
            expectKeyword$913('extends');
            previousYieldAllowed$1498 = state$873.yieldAllowed;
            state$873.yieldAllowed = false;
            superClass$1499 = parseAssignmentExpression$948();
            state$873.yieldAllowed = previousYieldAllowed$1498;
        }
        return delegate$868.createClassExpression(id$1497, superClass$1499, parseClassBody$991());
    }
    function parseClassDeclaration$993() {
        var id$1500, previousYieldAllowed$1501, superClass$1502 = null;
        expectKeyword$913('class');
        id$1500 = parseVariableIdentifier$952();
        if (matchKeyword$915('extends')) {
            expectKeyword$913('extends');
            previousYieldAllowed$1501 = state$873.yieldAllowed;
            state$873.yieldAllowed = false;
            superClass$1502 = parseAssignmentExpression$948();
            state$873.yieldAllowed = previousYieldAllowed$1501;
        }
        return delegate$868.createClassDeclaration(id$1500, superClass$1502, parseClassBody$991());
    }
    // 15 Program
    function matchModuleDeclaration$994() {
        var id$1503;
        if (matchContextualKeyword$916('module')) {
            id$1503 = lookahead2$907();
            return id$1503.type === Token$849.StringLiteral || id$1503.type === Token$849.Identifier;
        }
        return false;
    }
    function parseSourceElement$995() {
        if (lookahead$871.type === Token$849.Keyword) {
            switch (lookahead$871.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$956(lookahead$871.value);
            case 'function':
                return parseFunctionDeclaration$986();
            case 'export':
                return parseExportDeclaration$960();
            case 'import':
                return parseImportDeclaration$961();
            default:
                return parseStatement$980();
            }
        }
        if (matchModuleDeclaration$994()) {
            throwError$909({}, Messages$854.NestedModule);
        }
        if (lookahead$871.type !== Token$849.EOF) {
            return parseStatement$980();
        }
    }
    function parseProgramElement$996() {
        if (lookahead$871.type === Token$849.Keyword) {
            switch (lookahead$871.value) {
            case 'export':
                return parseExportDeclaration$960();
            case 'import':
                return parseImportDeclaration$961();
            }
        }
        if (matchModuleDeclaration$994()) {
            return parseModuleDeclaration$957();
        }
        return parseSourceElement$995();
    }
    function parseProgramElements$997() {
        var sourceElement$1504, sourceElements$1505 = [], token$1506, directive$1507, firstRestricted$1508;
        while (streamIndex$870 < length$867) {
            token$1506 = lookahead$871;
            if (token$1506.type !== Token$849.StringLiteral) {
                break;
            }
            sourceElement$1504 = parseProgramElement$996();
            sourceElements$1505.push(sourceElement$1504);
            if (sourceElement$1504.expression.type !== Syntax$852.Literal) {
                // this is not directive
                break;
            }
            directive$1507 = token$1506.value;
            if (directive$1507 === 'use strict') {
                strict$859 = true;
                if (firstRestricted$1508) {
                    throwErrorTolerant$910(firstRestricted$1508, Messages$854.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1508 && token$1506.octal) {
                    firstRestricted$1508 = token$1506;
                }
            }
        }
        while (streamIndex$870 < length$867) {
            sourceElement$1504 = parseProgramElement$996();
            if (typeof sourceElement$1504 === 'undefined') {
                break;
            }
            sourceElements$1505.push(sourceElement$1504);
        }
        return sourceElements$1505;
    }
    function parseModuleElement$998() {
        return parseSourceElement$995();
    }
    function parseModuleElements$999() {
        var list$1509 = [], statement$1510;
        while (streamIndex$870 < length$867) {
            if (match$914('}')) {
                break;
            }
            statement$1510 = parseModuleElement$998();
            if (typeof statement$1510 === 'undefined') {
                break;
            }
            list$1509.push(statement$1510);
        }
        return list$1509;
    }
    function parseModuleBlock$1000() {
        var block$1511;
        expect$912('{');
        block$1511 = parseModuleElements$999();
        expect$912('}');
        return delegate$868.createBlockStatement(block$1511);
    }
    function parseProgram$1001() {
        var body$1512;
        strict$859 = false;
        peek$906();
        body$1512 = parseProgramElements$997();
        return delegate$868.createProgram(body$1512);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1002(type$1513, value$1514, start$1515, end$1516, loc$1517) {
        assert$875(typeof start$1515 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$874.comments.length > 0) {
            if (extra$874.comments[extra$874.comments.length - 1].range[1] > start$1515) {
                return;
            }
        }
        extra$874.comments.push({
            type: type$1513,
            value: value$1514,
            range: [
                start$1515,
                end$1516
            ],
            loc: loc$1517
        });
    }
    function scanComment$1003() {
        var comment$1518, ch$1519, loc$1520, start$1521, blockComment$1522, lineComment$1523;
        comment$1518 = '';
        blockComment$1522 = false;
        lineComment$1523 = false;
        while (index$860 < length$867) {
            ch$1519 = source$858[index$860];
            if (lineComment$1523) {
                ch$1519 = source$858[index$860++];
                if (isLineTerminator$881(ch$1519.charCodeAt(0))) {
                    loc$1520.end = {
                        line: lineNumber$861,
                        column: index$860 - lineStart$862 - 1
                    };
                    lineComment$1523 = false;
                    addComment$1002('Line', comment$1518, start$1521, index$860 - 1, loc$1520);
                    if (ch$1519 === '\r' && source$858[index$860] === '\n') {
                        ++index$860;
                    }
                    ++lineNumber$861;
                    lineStart$862 = index$860;
                    comment$1518 = '';
                } else if (index$860 >= length$867) {
                    lineComment$1523 = false;
                    comment$1518 += ch$1519;
                    loc$1520.end = {
                        line: lineNumber$861,
                        column: length$867 - lineStart$862
                    };
                    addComment$1002('Line', comment$1518, start$1521, length$867, loc$1520);
                } else {
                    comment$1518 += ch$1519;
                }
            } else if (blockComment$1522) {
                if (isLineTerminator$881(ch$1519.charCodeAt(0))) {
                    if (ch$1519 === '\r' && source$858[index$860 + 1] === '\n') {
                        ++index$860;
                        comment$1518 += '\r\n';
                    } else {
                        comment$1518 += ch$1519;
                    }
                    ++lineNumber$861;
                    ++index$860;
                    lineStart$862 = index$860;
                    if (index$860 >= length$867) {
                        throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1519 = source$858[index$860++];
                    if (index$860 >= length$867) {
                        throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1518 += ch$1519;
                    if (ch$1519 === '*') {
                        ch$1519 = source$858[index$860];
                        if (ch$1519 === '/') {
                            comment$1518 = comment$1518.substr(0, comment$1518.length - 1);
                            blockComment$1522 = false;
                            ++index$860;
                            loc$1520.end = {
                                line: lineNumber$861,
                                column: index$860 - lineStart$862
                            };
                            addComment$1002('Block', comment$1518, start$1521, index$860, loc$1520);
                            comment$1518 = '';
                        }
                    }
                }
            } else if (ch$1519 === '/') {
                ch$1519 = source$858[index$860 + 1];
                if (ch$1519 === '/') {
                    loc$1520 = {
                        start: {
                            line: lineNumber$861,
                            column: index$860 - lineStart$862
                        }
                    };
                    start$1521 = index$860;
                    index$860 += 2;
                    lineComment$1523 = true;
                    if (index$860 >= length$867) {
                        loc$1520.end = {
                            line: lineNumber$861,
                            column: index$860 - lineStart$862
                        };
                        lineComment$1523 = false;
                        addComment$1002('Line', comment$1518, start$1521, index$860, loc$1520);
                    }
                } else if (ch$1519 === '*') {
                    start$1521 = index$860;
                    index$860 += 2;
                    blockComment$1522 = true;
                    loc$1520 = {
                        start: {
                            line: lineNumber$861,
                            column: index$860 - lineStart$862 - 2
                        }
                    };
                    if (index$860 >= length$867) {
                        throwError$909({}, Messages$854.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$880(ch$1519.charCodeAt(0))) {
                ++index$860;
            } else if (isLineTerminator$881(ch$1519.charCodeAt(0))) {
                ++index$860;
                if (ch$1519 === '\r' && source$858[index$860] === '\n') {
                    ++index$860;
                }
                ++lineNumber$861;
                lineStart$862 = index$860;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1004() {
        var i$1524, entry$1525, comment$1526, comments$1527 = [];
        for (i$1524 = 0; i$1524 < extra$874.comments.length; ++i$1524) {
            entry$1525 = extra$874.comments[i$1524];
            comment$1526 = {
                type: entry$1525.type,
                value: entry$1525.value
            };
            if (extra$874.range) {
                comment$1526.range = entry$1525.range;
            }
            if (extra$874.loc) {
                comment$1526.loc = entry$1525.loc;
            }
            comments$1527.push(comment$1526);
        }
        extra$874.comments = comments$1527;
    }
    function collectToken$1005() {
        var start$1528, loc$1529, token$1530, range$1531, value$1532;
        skipComment$888();
        start$1528 = index$860;
        loc$1529 = {
            start: {
                line: lineNumber$861,
                column: index$860 - lineStart$862
            }
        };
        token$1530 = extra$874.advance();
        loc$1529.end = {
            line: lineNumber$861,
            column: index$860 - lineStart$862
        };
        if (token$1530.type !== Token$849.EOF) {
            range$1531 = [
                token$1530.range[0],
                token$1530.range[1]
            ];
            value$1532 = source$858.slice(token$1530.range[0], token$1530.range[1]);
            extra$874.tokens.push({
                type: TokenName$850[token$1530.type],
                value: value$1532,
                range: range$1531,
                loc: loc$1529
            });
        }
        return token$1530;
    }
    function collectRegex$1006() {
        var pos$1533, loc$1534, regex$1535, token$1536;
        skipComment$888();
        pos$1533 = index$860;
        loc$1534 = {
            start: {
                line: lineNumber$861,
                column: index$860 - lineStart$862
            }
        };
        regex$1535 = extra$874.scanRegExp();
        loc$1534.end = {
            line: lineNumber$861,
            column: index$860 - lineStart$862
        };
        if (!extra$874.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$874.tokens.length > 0) {
                token$1536 = extra$874.tokens[extra$874.tokens.length - 1];
                if (token$1536.range[0] === pos$1533 && token$1536.type === 'Punctuator') {
                    if (token$1536.value === '/' || token$1536.value === '/=') {
                        extra$874.tokens.pop();
                    }
                }
            }
            extra$874.tokens.push({
                type: 'RegularExpression',
                value: regex$1535.literal,
                range: [
                    pos$1533,
                    index$860
                ],
                loc: loc$1534
            });
        }
        return regex$1535;
    }
    function filterTokenLocation$1007() {
        var i$1537, entry$1538, token$1539, tokens$1540 = [];
        for (i$1537 = 0; i$1537 < extra$874.tokens.length; ++i$1537) {
            entry$1538 = extra$874.tokens[i$1537];
            token$1539 = {
                type: entry$1538.type,
                value: entry$1538.value
            };
            if (extra$874.range) {
                token$1539.range = entry$1538.range;
            }
            if (extra$874.loc) {
                token$1539.loc = entry$1538.loc;
            }
            tokens$1540.push(token$1539);
        }
        extra$874.tokens = tokens$1540;
    }
    function LocationMarker$1008() {
        var sm_index$1541 = lookahead$871 ? lookahead$871.sm_range[0] : 0;
        var sm_lineStart$1542 = lookahead$871 ? lookahead$871.sm_lineStart : 0;
        var sm_lineNumber$1543 = lookahead$871 ? lookahead$871.sm_lineNumber : 1;
        this.range = [
            sm_index$1541,
            sm_index$1541
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1543,
                column: sm_index$1541 - sm_lineStart$1542
            },
            end: {
                line: sm_lineNumber$1543,
                column: sm_index$1541 - sm_lineStart$1542
            }
        };
    }
    LocationMarker$1008.prototype = {
        constructor: LocationMarker$1008,
        end: function () {
            this.range[1] = sm_index$866;
            this.loc.end.line = sm_lineNumber$863;
            this.loc.end.column = sm_index$866 - sm_lineStart$864;
        },
        applyGroup: function (node$1544) {
            if (extra$874.range) {
                node$1544.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$874.loc) {
                node$1544.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1544 = delegate$868.postProcess(node$1544);
            }
        },
        apply: function (node$1545) {
            var nodeType$1546 = typeof node$1545;
            assert$875(nodeType$1546 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1546);
            if (extra$874.range) {
                node$1545.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$874.loc) {
                node$1545.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1545 = delegate$868.postProcess(node$1545);
            }
        }
    };
    function createLocationMarker$1009() {
        return new LocationMarker$1008();
    }
    function trackGroupExpression$1010() {
        var marker$1547, expr$1548;
        marker$1547 = createLocationMarker$1009();
        expect$912('(');
        ++state$873.parenthesizedCount;
        expr$1548 = parseExpression$949();
        expect$912(')');
        marker$1547.end();
        marker$1547.applyGroup(expr$1548);
        return expr$1548;
    }
    function trackLeftHandSideExpression$1011() {
        var marker$1549, expr$1550;
        // skipComment();
        marker$1549 = createLocationMarker$1009();
        expr$1550 = matchKeyword$915('new') ? parseNewExpression$936() : parsePrimaryExpression$930();
        while (match$914('.') || match$914('[') || lookahead$871.type === Token$849.Template) {
            if (match$914('[')) {
                expr$1550 = delegate$868.createMemberExpression('[', expr$1550, parseComputedMember$935());
                marker$1549.end();
                marker$1549.apply(expr$1550);
            } else if (match$914('.')) {
                expr$1550 = delegate$868.createMemberExpression('.', expr$1550, parseNonComputedMember$934());
                marker$1549.end();
                marker$1549.apply(expr$1550);
            } else {
                expr$1550 = delegate$868.createTaggedTemplateExpression(expr$1550, parseTemplateLiteral$928());
                marker$1549.end();
                marker$1549.apply(expr$1550);
            }
        }
        return expr$1550;
    }
    function trackLeftHandSideExpressionAllowCall$1012() {
        var marker$1551, expr$1552, args$1553;
        // skipComment();
        marker$1551 = createLocationMarker$1009();
        expr$1552 = matchKeyword$915('new') ? parseNewExpression$936() : parsePrimaryExpression$930();
        while (match$914('.') || match$914('[') || match$914('(') || lookahead$871.type === Token$849.Template) {
            if (match$914('(')) {
                args$1553 = parseArguments$931();
                expr$1552 = delegate$868.createCallExpression(expr$1552, args$1553);
                marker$1551.end();
                marker$1551.apply(expr$1552);
            } else if (match$914('[')) {
                expr$1552 = delegate$868.createMemberExpression('[', expr$1552, parseComputedMember$935());
                marker$1551.end();
                marker$1551.apply(expr$1552);
            } else if (match$914('.')) {
                expr$1552 = delegate$868.createMemberExpression('.', expr$1552, parseNonComputedMember$934());
                marker$1551.end();
                marker$1551.apply(expr$1552);
            } else {
                expr$1552 = delegate$868.createTaggedTemplateExpression(expr$1552, parseTemplateLiteral$928());
                marker$1551.end();
                marker$1551.apply(expr$1552);
            }
        }
        return expr$1552;
    }
    function filterGroup$1013(node$1554) {
        var n$1555, i$1556, entry$1557;
        n$1555 = Object.prototype.toString.apply(node$1554) === '[object Array]' ? [] : {};
        for (i$1556 in node$1554) {
            if (node$1554.hasOwnProperty(i$1556) && i$1556 !== 'groupRange' && i$1556 !== 'groupLoc') {
                entry$1557 = node$1554[i$1556];
                if (entry$1557 === null || typeof entry$1557 !== 'object' || entry$1557 instanceof RegExp) {
                    n$1555[i$1556] = entry$1557;
                } else {
                    n$1555[i$1556] = filterGroup$1013(entry$1557);
                }
            }
        }
        return n$1555;
    }
    function wrapTrackingFunction$1014(range$1558, loc$1559) {
        return function (parseFunction$1560) {
            function isBinary$1561(node$1563) {
                return node$1563.type === Syntax$852.LogicalExpression || node$1563.type === Syntax$852.BinaryExpression;
            }
            function visit$1562(node$1564) {
                var start$1565, end$1566;
                if (isBinary$1561(node$1564.left)) {
                    visit$1562(node$1564.left);
                }
                if (isBinary$1561(node$1564.right)) {
                    visit$1562(node$1564.right);
                }
                if (range$1558) {
                    if (node$1564.left.groupRange || node$1564.right.groupRange) {
                        start$1565 = node$1564.left.groupRange ? node$1564.left.groupRange[0] : node$1564.left.range[0];
                        end$1566 = node$1564.right.groupRange ? node$1564.right.groupRange[1] : node$1564.right.range[1];
                        node$1564.range = [
                            start$1565,
                            end$1566
                        ];
                    } else if (typeof node$1564.range === 'undefined') {
                        start$1565 = node$1564.left.range[0];
                        end$1566 = node$1564.right.range[1];
                        node$1564.range = [
                            start$1565,
                            end$1566
                        ];
                    }
                }
                if (loc$1559) {
                    if (node$1564.left.groupLoc || node$1564.right.groupLoc) {
                        start$1565 = node$1564.left.groupLoc ? node$1564.left.groupLoc.start : node$1564.left.loc.start;
                        end$1566 = node$1564.right.groupLoc ? node$1564.right.groupLoc.end : node$1564.right.loc.end;
                        node$1564.loc = {
                            start: start$1565,
                            end: end$1566
                        };
                        node$1564 = delegate$868.postProcess(node$1564);
                    } else if (typeof node$1564.loc === 'undefined') {
                        node$1564.loc = {
                            start: node$1564.left.loc.start,
                            end: node$1564.right.loc.end
                        };
                        node$1564 = delegate$868.postProcess(node$1564);
                    }
                }
            }
            return function () {
                var marker$1567, node$1568, curr$1569 = lookahead$871;
                marker$1567 = createLocationMarker$1009();
                node$1568 = parseFunction$1560.apply(null, arguments);
                marker$1567.end();
                if (node$1568.type !== Syntax$852.Program) {
                    if (curr$1569.leadingComments) {
                        node$1568.leadingComments = curr$1569.leadingComments;
                    }
                    if (curr$1569.trailingComments) {
                        node$1568.trailingComments = curr$1569.trailingComments;
                    }
                }
                if (range$1558 && typeof node$1568.range === 'undefined') {
                    marker$1567.apply(node$1568);
                }
                if (loc$1559 && typeof node$1568.loc === 'undefined') {
                    marker$1567.apply(node$1568);
                }
                if (isBinary$1561(node$1568)) {
                    visit$1562(node$1568);
                }
                return node$1568;
            };
        };
    }
    function patch$1015() {
        var wrapTracking$1570;
        if (extra$874.comments) {
            extra$874.skipComment = skipComment$888;
            skipComment$888 = scanComment$1003;
        }
        if (extra$874.range || extra$874.loc) {
            extra$874.parseGroupExpression = parseGroupExpression$929;
            extra$874.parseLeftHandSideExpression = parseLeftHandSideExpression$938;
            extra$874.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$937;
            parseGroupExpression$929 = trackGroupExpression$1010;
            parseLeftHandSideExpression$938 = trackLeftHandSideExpression$1011;
            parseLeftHandSideExpressionAllowCall$937 = trackLeftHandSideExpressionAllowCall$1012;
            wrapTracking$1570 = wrapTrackingFunction$1014(extra$874.range, extra$874.loc);
            extra$874.parseArrayInitialiser = parseArrayInitialiser$921;
            extra$874.parseAssignmentExpression = parseAssignmentExpression$948;
            extra$874.parseBinaryExpression = parseBinaryExpression$942;
            extra$874.parseBlock = parseBlock$951;
            extra$874.parseFunctionSourceElements = parseFunctionSourceElements$982;
            extra$874.parseCatchClause = parseCatchClause$977;
            extra$874.parseComputedMember = parseComputedMember$935;
            extra$874.parseConditionalExpression = parseConditionalExpression$943;
            extra$874.parseConstLetDeclaration = parseConstLetDeclaration$956;
            extra$874.parseExportBatchSpecifier = parseExportBatchSpecifier$958;
            extra$874.parseExportDeclaration = parseExportDeclaration$960;
            extra$874.parseExportSpecifier = parseExportSpecifier$959;
            extra$874.parseExpression = parseExpression$949;
            extra$874.parseForVariableDeclaration = parseForVariableDeclaration$968;
            extra$874.parseFunctionDeclaration = parseFunctionDeclaration$986;
            extra$874.parseFunctionExpression = parseFunctionExpression$987;
            extra$874.parseParams = parseParams$985;
            extra$874.parseImportDeclaration = parseImportDeclaration$961;
            extra$874.parseImportSpecifier = parseImportSpecifier$962;
            extra$874.parseModuleDeclaration = parseModuleDeclaration$957;
            extra$874.parseModuleBlock = parseModuleBlock$1000;
            extra$874.parseNewExpression = parseNewExpression$936;
            extra$874.parseNonComputedProperty = parseNonComputedProperty$933;
            extra$874.parseObjectInitialiser = parseObjectInitialiser$926;
            extra$874.parseObjectProperty = parseObjectProperty$925;
            extra$874.parseObjectPropertyKey = parseObjectPropertyKey$924;
            extra$874.parsePostfixExpression = parsePostfixExpression$939;
            extra$874.parsePrimaryExpression = parsePrimaryExpression$930;
            extra$874.parseProgram = parseProgram$1001;
            extra$874.parsePropertyFunction = parsePropertyFunction$922;
            extra$874.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$932;
            extra$874.parseTemplateElement = parseTemplateElement$927;
            extra$874.parseTemplateLiteral = parseTemplateLiteral$928;
            extra$874.parseStatement = parseStatement$980;
            extra$874.parseSwitchCase = parseSwitchCase$974;
            extra$874.parseUnaryExpression = parseUnaryExpression$940;
            extra$874.parseVariableDeclaration = parseVariableDeclaration$953;
            extra$874.parseVariableIdentifier = parseVariableIdentifier$952;
            extra$874.parseMethodDefinition = parseMethodDefinition$989;
            extra$874.parseClassDeclaration = parseClassDeclaration$993;
            extra$874.parseClassExpression = parseClassExpression$992;
            extra$874.parseClassBody = parseClassBody$991;
            parseArrayInitialiser$921 = wrapTracking$1570(extra$874.parseArrayInitialiser);
            parseAssignmentExpression$948 = wrapTracking$1570(extra$874.parseAssignmentExpression);
            parseBinaryExpression$942 = wrapTracking$1570(extra$874.parseBinaryExpression);
            parseBlock$951 = wrapTracking$1570(extra$874.parseBlock);
            parseFunctionSourceElements$982 = wrapTracking$1570(extra$874.parseFunctionSourceElements);
            parseCatchClause$977 = wrapTracking$1570(extra$874.parseCatchClause);
            parseComputedMember$935 = wrapTracking$1570(extra$874.parseComputedMember);
            parseConditionalExpression$943 = wrapTracking$1570(extra$874.parseConditionalExpression);
            parseConstLetDeclaration$956 = wrapTracking$1570(extra$874.parseConstLetDeclaration);
            parseExportBatchSpecifier$958 = wrapTracking$1570(parseExportBatchSpecifier$958);
            parseExportDeclaration$960 = wrapTracking$1570(parseExportDeclaration$960);
            parseExportSpecifier$959 = wrapTracking$1570(parseExportSpecifier$959);
            parseExpression$949 = wrapTracking$1570(extra$874.parseExpression);
            parseForVariableDeclaration$968 = wrapTracking$1570(extra$874.parseForVariableDeclaration);
            parseFunctionDeclaration$986 = wrapTracking$1570(extra$874.parseFunctionDeclaration);
            parseFunctionExpression$987 = wrapTracking$1570(extra$874.parseFunctionExpression);
            parseParams$985 = wrapTracking$1570(extra$874.parseParams);
            parseImportDeclaration$961 = wrapTracking$1570(extra$874.parseImportDeclaration);
            parseImportSpecifier$962 = wrapTracking$1570(extra$874.parseImportSpecifier);
            parseModuleDeclaration$957 = wrapTracking$1570(extra$874.parseModuleDeclaration);
            parseModuleBlock$1000 = wrapTracking$1570(extra$874.parseModuleBlock);
            parseLeftHandSideExpression$938 = wrapTracking$1570(parseLeftHandSideExpression$938);
            parseNewExpression$936 = wrapTracking$1570(extra$874.parseNewExpression);
            parseNonComputedProperty$933 = wrapTracking$1570(extra$874.parseNonComputedProperty);
            parseObjectInitialiser$926 = wrapTracking$1570(extra$874.parseObjectInitialiser);
            parseObjectProperty$925 = wrapTracking$1570(extra$874.parseObjectProperty);
            parseObjectPropertyKey$924 = wrapTracking$1570(extra$874.parseObjectPropertyKey);
            parsePostfixExpression$939 = wrapTracking$1570(extra$874.parsePostfixExpression);
            parsePrimaryExpression$930 = wrapTracking$1570(extra$874.parsePrimaryExpression);
            parseProgram$1001 = wrapTracking$1570(extra$874.parseProgram);
            parsePropertyFunction$922 = wrapTracking$1570(extra$874.parsePropertyFunction);
            parseTemplateElement$927 = wrapTracking$1570(extra$874.parseTemplateElement);
            parseTemplateLiteral$928 = wrapTracking$1570(extra$874.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$932 = wrapTracking$1570(extra$874.parseSpreadOrAssignmentExpression);
            parseStatement$980 = wrapTracking$1570(extra$874.parseStatement);
            parseSwitchCase$974 = wrapTracking$1570(extra$874.parseSwitchCase);
            parseUnaryExpression$940 = wrapTracking$1570(extra$874.parseUnaryExpression);
            parseVariableDeclaration$953 = wrapTracking$1570(extra$874.parseVariableDeclaration);
            parseVariableIdentifier$952 = wrapTracking$1570(extra$874.parseVariableIdentifier);
            parseMethodDefinition$989 = wrapTracking$1570(extra$874.parseMethodDefinition);
            parseClassDeclaration$993 = wrapTracking$1570(extra$874.parseClassDeclaration);
            parseClassExpression$992 = wrapTracking$1570(extra$874.parseClassExpression);
            parseClassBody$991 = wrapTracking$1570(extra$874.parseClassBody);
        }
        if (typeof extra$874.tokens !== 'undefined') {
            extra$874.advance = advance$904;
            extra$874.scanRegExp = scanRegExp$901;
            advance$904 = collectToken$1005;
            scanRegExp$901 = collectRegex$1006;
        }
    }
    function unpatch$1016() {
        if (typeof extra$874.skipComment === 'function') {
            skipComment$888 = extra$874.skipComment;
        }
        if (extra$874.range || extra$874.loc) {
            parseArrayInitialiser$921 = extra$874.parseArrayInitialiser;
            parseAssignmentExpression$948 = extra$874.parseAssignmentExpression;
            parseBinaryExpression$942 = extra$874.parseBinaryExpression;
            parseBlock$951 = extra$874.parseBlock;
            parseFunctionSourceElements$982 = extra$874.parseFunctionSourceElements;
            parseCatchClause$977 = extra$874.parseCatchClause;
            parseComputedMember$935 = extra$874.parseComputedMember;
            parseConditionalExpression$943 = extra$874.parseConditionalExpression;
            parseConstLetDeclaration$956 = extra$874.parseConstLetDeclaration;
            parseExportBatchSpecifier$958 = extra$874.parseExportBatchSpecifier;
            parseExportDeclaration$960 = extra$874.parseExportDeclaration;
            parseExportSpecifier$959 = extra$874.parseExportSpecifier;
            parseExpression$949 = extra$874.parseExpression;
            parseForVariableDeclaration$968 = extra$874.parseForVariableDeclaration;
            parseFunctionDeclaration$986 = extra$874.parseFunctionDeclaration;
            parseFunctionExpression$987 = extra$874.parseFunctionExpression;
            parseImportDeclaration$961 = extra$874.parseImportDeclaration;
            parseImportSpecifier$962 = extra$874.parseImportSpecifier;
            parseGroupExpression$929 = extra$874.parseGroupExpression;
            parseLeftHandSideExpression$938 = extra$874.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$937 = extra$874.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$957 = extra$874.parseModuleDeclaration;
            parseModuleBlock$1000 = extra$874.parseModuleBlock;
            parseNewExpression$936 = extra$874.parseNewExpression;
            parseNonComputedProperty$933 = extra$874.parseNonComputedProperty;
            parseObjectInitialiser$926 = extra$874.parseObjectInitialiser;
            parseObjectProperty$925 = extra$874.parseObjectProperty;
            parseObjectPropertyKey$924 = extra$874.parseObjectPropertyKey;
            parsePostfixExpression$939 = extra$874.parsePostfixExpression;
            parsePrimaryExpression$930 = extra$874.parsePrimaryExpression;
            parseProgram$1001 = extra$874.parseProgram;
            parsePropertyFunction$922 = extra$874.parsePropertyFunction;
            parseTemplateElement$927 = extra$874.parseTemplateElement;
            parseTemplateLiteral$928 = extra$874.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$932 = extra$874.parseSpreadOrAssignmentExpression;
            parseStatement$980 = extra$874.parseStatement;
            parseSwitchCase$974 = extra$874.parseSwitchCase;
            parseUnaryExpression$940 = extra$874.parseUnaryExpression;
            parseVariableDeclaration$953 = extra$874.parseVariableDeclaration;
            parseVariableIdentifier$952 = extra$874.parseVariableIdentifier;
            parseMethodDefinition$989 = extra$874.parseMethodDefinition;
            parseClassDeclaration$993 = extra$874.parseClassDeclaration;
            parseClassExpression$992 = extra$874.parseClassExpression;
            parseClassBody$991 = extra$874.parseClassBody;
        }
        if (typeof extra$874.scanRegExp === 'function') {
            advance$904 = extra$874.advance;
            scanRegExp$901 = extra$874.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1017(object$1571, properties$1572) {
        var entry$1573, result$1574 = {};
        for (entry$1573 in object$1571) {
            if (object$1571.hasOwnProperty(entry$1573)) {
                result$1574[entry$1573] = object$1571[entry$1573];
            }
        }
        for (entry$1573 in properties$1572) {
            if (properties$1572.hasOwnProperty(entry$1573)) {
                result$1574[entry$1573] = properties$1572[entry$1573];
            }
        }
        return result$1574;
    }
    function tokenize$1018(code$1575, options$1576) {
        var toString$1577, token$1578, tokens$1579;
        toString$1577 = String;
        if (typeof code$1575 !== 'string' && !(code$1575 instanceof String)) {
            code$1575 = toString$1577(code$1575);
        }
        delegate$868 = SyntaxTreeDelegate$856;
        source$858 = code$1575;
        index$860 = 0;
        lineNumber$861 = source$858.length > 0 ? 1 : 0;
        lineStart$862 = 0;
        length$867 = source$858.length;
        lookahead$871 = null;
        state$873 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$874 = {};
        // Options matching.
        options$1576 = options$1576 || {};
        // Of course we collect tokens here.
        options$1576.tokens = true;
        extra$874.tokens = [];
        extra$874.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$874.openParenToken = -1;
        extra$874.openCurlyToken = -1;
        extra$874.range = typeof options$1576.range === 'boolean' && options$1576.range;
        extra$874.loc = typeof options$1576.loc === 'boolean' && options$1576.loc;
        if (typeof options$1576.comment === 'boolean' && options$1576.comment) {
            extra$874.comments = [];
        }
        if (typeof options$1576.tolerant === 'boolean' && options$1576.tolerant) {
            extra$874.errors = [];
        }
        if (length$867 > 0) {
            if (typeof source$858[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1575 instanceof String) {
                    source$858 = code$1575.valueOf();
                }
            }
        }
        patch$1015();
        try {
            peek$906();
            if (lookahead$871.type === Token$849.EOF) {
                return extra$874.tokens;
            }
            token$1578 = lex$905();
            while (lookahead$871.type !== Token$849.EOF) {
                try {
                    token$1578 = lex$905();
                } catch (lexError$1580) {
                    token$1578 = lookahead$871;
                    if (extra$874.errors) {
                        extra$874.errors.push(lexError$1580);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1580;
                    }
                }
            }
            filterTokenLocation$1007();
            tokens$1579 = extra$874.tokens;
            if (typeof extra$874.comments !== 'undefined') {
                filterCommentLocation$1004();
                tokens$1579.comments = extra$874.comments;
            }
            if (typeof extra$874.errors !== 'undefined') {
                tokens$1579.errors = extra$874.errors;
            }
        } catch (e$1581) {
            throw e$1581;
        } finally {
            unpatch$1016();
            extra$874 = {};
        }
        return tokens$1579;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1019(toks$1582, start$1583, inExprDelim$1584, parentIsBlock$1585) {
        var assignOps$1586 = [
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
        var binaryOps$1587 = [
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
        var unaryOps$1588 = [
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
        function back$1589(n$1590) {
            var idx$1591 = toks$1582.length - n$1590 > 0 ? toks$1582.length - n$1590 : 0;
            return toks$1582[idx$1591];
        }
        if (inExprDelim$1584 && toks$1582.length - (start$1583 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1589(start$1583 + 2).value === ':' && parentIsBlock$1585) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$876(back$1589(start$1583 + 2).value, unaryOps$1588.concat(binaryOps$1587).concat(assignOps$1586))) {
            // ... + {...}
            return false;
        } else if (back$1589(start$1583 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1592 = typeof back$1589(start$1583 + 1).startLineNumber !== 'undefined' ? back$1589(start$1583 + 1).startLineNumber : back$1589(start$1583 + 1).lineNumber;
            if (back$1589(start$1583 + 2).lineNumber !== currLineNumber$1592) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$876(back$1589(start$1583 + 2).value, [
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
    function readToken$1020(toks$1593, inExprDelim$1594, parentIsBlock$1595) {
        var delimiters$1596 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1597 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1598 = toks$1593.length - 1;
        var comments$1599, commentsLen$1600 = extra$874.comments.length;
        function back$1601(n$1605) {
            var idx$1606 = toks$1593.length - n$1605 > 0 ? toks$1593.length - n$1605 : 0;
            return toks$1593[idx$1606];
        }
        function attachComments$1602(token$1607) {
            if (comments$1599) {
                token$1607.leadingComments = comments$1599;
            }
            return token$1607;
        }
        function _advance$1603() {
            return attachComments$1602(advance$904());
        }
        function _scanRegExp$1604() {
            return attachComments$1602(scanRegExp$901());
        }
        skipComment$888();
        if (extra$874.comments.length > commentsLen$1600) {
            comments$1599 = extra$874.comments.slice(commentsLen$1600);
        }
        if (isIn$876(source$858[index$860], delimiters$1596)) {
            return attachComments$1602(readDelim$1021(toks$1593, inExprDelim$1594, parentIsBlock$1595));
        }
        if (source$858[index$860] === '/') {
            var prev$1608 = back$1601(1);
            if (prev$1608) {
                if (prev$1608.value === '()') {
                    if (isIn$876(back$1601(2).value, parenIdents$1597)) {
                        // ... if (...) / ...
                        return _scanRegExp$1604();
                    }
                    // ... (...) / ...
                    return _advance$1603();
                }
                if (prev$1608.value === '{}') {
                    if (blockAllowed$1019(toks$1593, 0, inExprDelim$1594, parentIsBlock$1595)) {
                        if (back$1601(2).value === '()') {
                            // named function
                            if (back$1601(4).value === 'function') {
                                if (!blockAllowed$1019(toks$1593, 3, inExprDelim$1594, parentIsBlock$1595)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1603();
                                }
                                if (toks$1593.length - 5 <= 0 && inExprDelim$1594) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1603();
                                }
                            }
                            // unnamed function
                            if (back$1601(3).value === 'function') {
                                if (!blockAllowed$1019(toks$1593, 2, inExprDelim$1594, parentIsBlock$1595)) {
                                    // new function (...) {...} / ...
                                    return _advance$1603();
                                }
                                if (toks$1593.length - 4 <= 0 && inExprDelim$1594) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1603();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1604();
                    } else {
                        // ... + {...} / ...
                        return _advance$1603();
                    }
                }
                if (prev$1608.type === Token$849.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1604();
                }
                if (isKeyword$887(prev$1608.value)) {
                    // typeof /...
                    return _scanRegExp$1604();
                }
                return _advance$1603();
            }
            return _scanRegExp$1604();
        }
        return _advance$1603();
    }
    function readDelim$1021(toks$1609, inExprDelim$1610, parentIsBlock$1611) {
        var startDelim$1612 = advance$904(), matchDelim$1613 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1614 = [];
        var delimiters$1615 = [
                '(',
                '{',
                '['
            ];
        assert$875(delimiters$1615.indexOf(startDelim$1612.value) !== -1, 'Need to begin at the delimiter');
        var token$1616 = startDelim$1612;
        var startLineNumber$1617 = token$1616.lineNumber;
        var startLineStart$1618 = token$1616.lineStart;
        var startRange$1619 = token$1616.range;
        var delimToken$1620 = {};
        delimToken$1620.type = Token$849.Delimiter;
        delimToken$1620.value = startDelim$1612.value + matchDelim$1613[startDelim$1612.value];
        delimToken$1620.startLineNumber = startLineNumber$1617;
        delimToken$1620.startLineStart = startLineStart$1618;
        delimToken$1620.startRange = startRange$1619;
        var delimIsBlock$1621 = false;
        if (startDelim$1612.value === '{') {
            delimIsBlock$1621 = blockAllowed$1019(toks$1609.concat(delimToken$1620), 0, inExprDelim$1610, parentIsBlock$1611);
        }
        while (index$860 <= length$867) {
            token$1616 = readToken$1020(inner$1614, startDelim$1612.value === '(' || startDelim$1612.value === '[', delimIsBlock$1621);
            if (token$1616.type === Token$849.Punctuator && token$1616.value === matchDelim$1613[startDelim$1612.value]) {
                if (token$1616.leadingComments) {
                    delimToken$1620.trailingComments = token$1616.leadingComments;
                }
                break;
            } else if (token$1616.type === Token$849.EOF) {
                throwError$909({}, Messages$854.UnexpectedEOS);
            } else {
                inner$1614.push(token$1616);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$860 >= length$867 && matchDelim$1613[startDelim$1612.value] !== source$858[length$867 - 1]) {
            throwError$909({}, Messages$854.UnexpectedEOS);
        }
        var endLineNumber$1622 = token$1616.lineNumber;
        var endLineStart$1623 = token$1616.lineStart;
        var endRange$1624 = token$1616.range;
        delimToken$1620.inner = inner$1614;
        delimToken$1620.endLineNumber = endLineNumber$1622;
        delimToken$1620.endLineStart = endLineStart$1623;
        delimToken$1620.endRange = endRange$1624;
        return delimToken$1620;
    }
    // (Str) -> [...CSyntax]
    function read$1022(code$1625) {
        var token$1626, tokenTree$1627 = [];
        extra$874 = {};
        extra$874.comments = [];
        patch$1015();
        source$858 = code$1625;
        index$860 = 0;
        lineNumber$861 = source$858.length > 0 ? 1 : 0;
        lineStart$862 = 0;
        length$867 = source$858.length;
        state$873 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$860 < length$867) {
            tokenTree$1627.push(readToken$1020(tokenTree$1627, false, false));
        }
        var last$1628 = tokenTree$1627[tokenTree$1627.length - 1];
        if (last$1628 && last$1628.type !== Token$849.EOF) {
            tokenTree$1627.push({
                type: Token$849.EOF,
                value: '',
                lineNumber: last$1628.lineNumber,
                lineStart: last$1628.lineStart,
                range: [
                    index$860,
                    index$860
                ]
            });
        }
        return expander$848.tokensToSyntax(tokenTree$1627);
    }
    function parse$1023(code$1629, options$1630) {
        var program$1631, toString$1632;
        extra$874 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1629)) {
            tokenStream$869 = code$1629;
            length$867 = tokenStream$869.length;
            lineNumber$861 = tokenStream$869.length > 0 ? 1 : 0;
            source$858 = undefined;
        } else {
            toString$1632 = String;
            if (typeof code$1629 !== 'string' && !(code$1629 instanceof String)) {
                code$1629 = toString$1632(code$1629);
            }
            source$858 = code$1629;
            length$867 = source$858.length;
            lineNumber$861 = source$858.length > 0 ? 1 : 0;
        }
        delegate$868 = SyntaxTreeDelegate$856;
        streamIndex$870 = -1;
        index$860 = 0;
        lineStart$862 = 0;
        sm_lineStart$864 = 0;
        sm_lineNumber$863 = lineNumber$861;
        sm_index$866 = 0;
        sm_range$865 = [
            0,
            0
        ];
        lookahead$871 = null;
        state$873 = {
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
        if (typeof options$1630 !== 'undefined') {
            extra$874.range = typeof options$1630.range === 'boolean' && options$1630.range;
            extra$874.loc = typeof options$1630.loc === 'boolean' && options$1630.loc;
            if (extra$874.loc && options$1630.source !== null && options$1630.source !== undefined) {
                delegate$868 = extend$1017(delegate$868, {
                    'postProcess': function (node$1633) {
                        node$1633.loc.source = toString$1632(options$1630.source);
                        return node$1633;
                    }
                });
            }
            if (typeof options$1630.tokens === 'boolean' && options$1630.tokens) {
                extra$874.tokens = [];
            }
            if (typeof options$1630.comment === 'boolean' && options$1630.comment) {
                extra$874.comments = [];
            }
            if (typeof options$1630.tolerant === 'boolean' && options$1630.tolerant) {
                extra$874.errors = [];
            }
        }
        if (length$867 > 0) {
            if (source$858 && typeof source$858[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1629 instanceof String) {
                    source$858 = code$1629.valueOf();
                }
            }
        }
        extra$874 = { loc: true };
        patch$1015();
        try {
            program$1631 = parseProgram$1001();
            if (typeof extra$874.comments !== 'undefined') {
                filterCommentLocation$1004();
                program$1631.comments = extra$874.comments;
            }
            if (typeof extra$874.tokens !== 'undefined') {
                filterTokenLocation$1007();
                program$1631.tokens = extra$874.tokens;
            }
            if (typeof extra$874.errors !== 'undefined') {
                program$1631.errors = extra$874.errors;
            }
            if (extra$874.range || extra$874.loc) {
                program$1631.body = filterGroup$1013(program$1631.body);
            }
        } catch (e$1634) {
            throw e$1634;
        } finally {
            unpatch$1016();
            extra$874 = {};
        }
        return program$1631;
    }
    exports$847.tokenize = tokenize$1018;
    exports$847.read = read$1022;
    exports$847.Token = Token$849;
    exports$847.parse = parse$1023;
    // Deep copy.
    exports$847.Syntax = function () {
        var name$1635, types$1636 = {};
        if (typeof Object.create === 'function') {
            types$1636 = Object.create(null);
        }
        for (name$1635 in Syntax$852) {
            if (Syntax$852.hasOwnProperty(name$1635)) {
                types$1636[name$1635] = Syntax$852[name$1635];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1636);
        }
        return types$1636;
    }();
}));
//# sourceMappingURL=parser.js.map