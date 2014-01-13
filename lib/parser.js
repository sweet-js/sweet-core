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
(function (root$859, factory$860) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$860);
    } else if (typeof exports !== 'undefined') {
        factory$860(exports, require('./expander'));
    } else {
        factory$860(root$859.esprima = {});
    }
}(this, function (exports$861, expander$862) {
    'use strict';
    var Token$863, TokenName$864, FnExprTokens$865, Syntax$866, PropertyKind$867, Messages$868, Regex$869, SyntaxTreeDelegate$870, ClassPropertyType$871, source$872, strict$873, index$874, lineNumber$875, lineStart$876, sm_lineNumber$877, sm_lineStart$878, sm_range$879, sm_index$880, length$881, delegate$882, tokenStream$883, streamIndex$884, lookahead$885, lookaheadIndex$886, state$887, extra$888;
    Token$863 = {
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
    TokenName$864 = {};
    TokenName$864[Token$863.BooleanLiteral] = 'Boolean';
    TokenName$864[Token$863.EOF] = '<end>';
    TokenName$864[Token$863.Identifier] = 'Identifier';
    TokenName$864[Token$863.Keyword] = 'Keyword';
    TokenName$864[Token$863.NullLiteral] = 'Null';
    TokenName$864[Token$863.NumericLiteral] = 'Numeric';
    TokenName$864[Token$863.Punctuator] = 'Punctuator';
    TokenName$864[Token$863.StringLiteral] = 'String';
    TokenName$864[Token$863.RegularExpression] = 'RegularExpression';
    TokenName$864[Token$863.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$865 = [
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
    Syntax$866 = {
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
    PropertyKind$867 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$871 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$868 = {
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
    Regex$869 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$889(condition$1038, message$1039) {
        if (!condition$1038) {
            throw new Error('ASSERT: ' + message$1039);
        }
    }
    function isIn$890(el$1040, list$1041) {
        return list$1041.indexOf(el$1040) !== -1;
    }
    function isDecimalDigit$891(ch$1042) {
        return ch$1042 >= 48 && ch$1042 <= 57;
    }    // 0..9
    function isHexDigit$892(ch$1043) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1043) >= 0;
    }
    function isOctalDigit$893(ch$1044) {
        return '01234567'.indexOf(ch$1044) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$894(ch$1045) {
        return ch$1045 === 32 || ch$1045 === 9 || ch$1045 === 11 || ch$1045 === 12 || ch$1045 === 160 || ch$1045 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1045)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$895(ch$1046) {
        return ch$1046 === 10 || ch$1046 === 13 || ch$1046 === 8232 || ch$1046 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$896(ch$1047) {
        return ch$1047 === 36 || ch$1047 === 95 || ch$1047 >= 65 && ch$1047 <= 90 || ch$1047 >= 97 && ch$1047 <= 122 || ch$1047 === 92 || ch$1047 >= 128 && Regex$869.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1047));
    }
    function isIdentifierPart$897(ch$1048) {
        return ch$1048 === 36 || ch$1048 === 95 || ch$1048 >= 65 && ch$1048 <= 90 || ch$1048 >= 97 && ch$1048 <= 122 || ch$1048 >= 48 && ch$1048 <= 57 || ch$1048 === 92 || ch$1048 >= 128 && Regex$869.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1048));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$898(id$1049) {
        switch (id$1049) {
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
    function isStrictModeReservedWord$899(id$1050) {
        switch (id$1050) {
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
    function isRestrictedWord$900(id$1051) {
        return id$1051 === 'eval' || id$1051 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$901(id$1052) {
        if (strict$873 && isStrictModeReservedWord$899(id$1052)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1052.length) {
        case 2:
            return id$1052 === 'if' || id$1052 === 'in' || id$1052 === 'do';
        case 3:
            return id$1052 === 'var' || id$1052 === 'for' || id$1052 === 'new' || id$1052 === 'try' || id$1052 === 'let';
        case 4:
            return id$1052 === 'this' || id$1052 === 'else' || id$1052 === 'case' || id$1052 === 'void' || id$1052 === 'with' || id$1052 === 'enum';
        case 5:
            return id$1052 === 'while' || id$1052 === 'break' || id$1052 === 'catch' || id$1052 === 'throw' || id$1052 === 'const' || id$1052 === 'yield' || id$1052 === 'class' || id$1052 === 'super';
        case 6:
            return id$1052 === 'return' || id$1052 === 'typeof' || id$1052 === 'delete' || id$1052 === 'switch' || id$1052 === 'export' || id$1052 === 'import';
        case 7:
            return id$1052 === 'default' || id$1052 === 'finally' || id$1052 === 'extends';
        case 8:
            return id$1052 === 'function' || id$1052 === 'continue' || id$1052 === 'debugger';
        case 10:
            return id$1052 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$902() {
        var ch$1053, blockComment$1054, lineComment$1055;
        blockComment$1054 = false;
        lineComment$1055 = false;
        while (index$874 < length$881) {
            ch$1053 = source$872.charCodeAt(index$874);
            if (lineComment$1055) {
                ++index$874;
                if (isLineTerminator$895(ch$1053)) {
                    lineComment$1055 = false;
                    if (ch$1053 === 13 && source$872.charCodeAt(index$874) === 10) {
                        ++index$874;
                    }
                    ++lineNumber$875;
                    lineStart$876 = index$874;
                }
            } else if (blockComment$1054) {
                if (isLineTerminator$895(ch$1053)) {
                    if (ch$1053 === 13 && source$872.charCodeAt(index$874 + 1) === 10) {
                        ++index$874;
                    }
                    ++lineNumber$875;
                    ++index$874;
                    lineStart$876 = index$874;
                    if (index$874 >= length$881) {
                        throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1053 = source$872.charCodeAt(index$874++);
                    if (index$874 >= length$881) {
                        throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1053 === 42) {
                        ch$1053 = source$872.charCodeAt(index$874);
                        if (ch$1053 === 47) {
                            ++index$874;
                            blockComment$1054 = false;
                        }
                    }
                }
            } else if (ch$1053 === 47) {
                ch$1053 = source$872.charCodeAt(index$874 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1053 === 47) {
                    index$874 += 2;
                    lineComment$1055 = true;
                } else if (ch$1053 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$874 += 2;
                    blockComment$1054 = true;
                    if (index$874 >= length$881) {
                        throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$894(ch$1053)) {
                ++index$874;
            } else if (isLineTerminator$895(ch$1053)) {
                ++index$874;
                if (ch$1053 === 13 && source$872.charCodeAt(index$874) === 10) {
                    ++index$874;
                }
                ++lineNumber$875;
                lineStart$876 = index$874;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$903(prefix$1056) {
        var i$1057, len$1058, ch$1059, code$1060 = 0;
        len$1058 = prefix$1056 === 'u' ? 4 : 2;
        for (i$1057 = 0; i$1057 < len$1058; ++i$1057) {
            if (index$874 < length$881 && isHexDigit$892(source$872[index$874])) {
                ch$1059 = source$872[index$874++];
                code$1060 = code$1060 * 16 + '0123456789abcdef'.indexOf(ch$1059.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1060);
    }
    function scanUnicodeCodePointEscape$904() {
        var ch$1061, code$1062, cu1$1063, cu2$1064;
        ch$1061 = source$872[index$874];
        code$1062 = 0;
        // At least, one hex digit is required.
        if (ch$1061 === '}') {
            throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
        }
        while (index$874 < length$881) {
            ch$1061 = source$872[index$874++];
            if (!isHexDigit$892(ch$1061)) {
                break;
            }
            code$1062 = code$1062 * 16 + '0123456789abcdef'.indexOf(ch$1061.toLowerCase());
        }
        if (code$1062 > 1114111 || ch$1061 !== '}') {
            throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1062 <= 65535) {
            return String.fromCharCode(code$1062);
        }
        cu1$1063 = (code$1062 - 65536 >> 10) + 55296;
        cu2$1064 = (code$1062 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1063, cu2$1064);
    }
    function getEscapedIdentifier$905() {
        var ch$1065, id$1066;
        ch$1065 = source$872.charCodeAt(index$874++);
        id$1066 = String.fromCharCode(ch$1065);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1065 === 92) {
            if (source$872.charCodeAt(index$874) !== 117) {
                throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
            }
            ++index$874;
            ch$1065 = scanHexEscape$903('u');
            if (!ch$1065 || ch$1065 === '\\' || !isIdentifierStart$896(ch$1065.charCodeAt(0))) {
                throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
            }
            id$1066 = ch$1065;
        }
        while (index$874 < length$881) {
            ch$1065 = source$872.charCodeAt(index$874);
            if (!isIdentifierPart$897(ch$1065)) {
                break;
            }
            ++index$874;
            id$1066 += String.fromCharCode(ch$1065);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1065 === 92) {
                id$1066 = id$1066.substr(0, id$1066.length - 1);
                if (source$872.charCodeAt(index$874) !== 117) {
                    throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
                }
                ++index$874;
                ch$1065 = scanHexEscape$903('u');
                if (!ch$1065 || ch$1065 === '\\' || !isIdentifierPart$897(ch$1065.charCodeAt(0))) {
                    throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
                }
                id$1066 += ch$1065;
            }
        }
        return id$1066;
    }
    function getIdentifier$906() {
        var start$1067, ch$1068;
        start$1067 = index$874++;
        while (index$874 < length$881) {
            ch$1068 = source$872.charCodeAt(index$874);
            if (ch$1068 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$874 = start$1067;
                return getEscapedIdentifier$905();
            }
            if (isIdentifierPart$897(ch$1068)) {
                ++index$874;
            } else {
                break;
            }
        }
        return source$872.slice(start$1067, index$874);
    }
    function scanIdentifier$907() {
        var start$1069, id$1070, type$1071;
        start$1069 = index$874;
        // Backslash (char #92) starts an escaped character.
        id$1070 = source$872.charCodeAt(index$874) === 92 ? getEscapedIdentifier$905() : getIdentifier$906();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1070.length === 1) {
            type$1071 = Token$863.Identifier;
        } else if (isKeyword$901(id$1070)) {
            type$1071 = Token$863.Keyword;
        } else if (id$1070 === 'null') {
            type$1071 = Token$863.NullLiteral;
        } else if (id$1070 === 'true' || id$1070 === 'false') {
            type$1071 = Token$863.BooleanLiteral;
        } else {
            type$1071 = Token$863.Identifier;
        }
        return {
            type: type$1071,
            value: id$1070,
            lineNumber: lineNumber$875,
            lineStart: lineStart$876,
            range: [
                start$1069,
                index$874
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$908() {
        var start$1072 = index$874, code$1073 = source$872.charCodeAt(index$874), code2$1074, ch1$1075 = source$872[index$874], ch2$1076, ch3$1077, ch4$1078;
        switch (code$1073) {
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
            ++index$874;
            if (extra$888.tokenize) {
                if (code$1073 === 40) {
                    extra$888.openParenToken = extra$888.tokens.length;
                } else if (code$1073 === 123) {
                    extra$888.openCurlyToken = extra$888.tokens.length;
                }
            }
            return {
                type: Token$863.Punctuator,
                value: String.fromCharCode(code$1073),
                lineNumber: lineNumber$875,
                lineStart: lineStart$876,
                range: [
                    start$1072,
                    index$874
                ]
            };
        default:
            code2$1074 = source$872.charCodeAt(index$874 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1074 === 61) {
                switch (code$1073) {
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
                    index$874 += 2;
                    return {
                        type: Token$863.Punctuator,
                        value: String.fromCharCode(code$1073) + String.fromCharCode(code2$1074),
                        lineNumber: lineNumber$875,
                        lineStart: lineStart$876,
                        range: [
                            start$1072,
                            index$874
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$874 += 2;
                    // !== and ===
                    if (source$872.charCodeAt(index$874) === 61) {
                        ++index$874;
                    }
                    return {
                        type: Token$863.Punctuator,
                        value: source$872.slice(start$1072, index$874),
                        lineNumber: lineNumber$875,
                        lineStart: lineStart$876,
                        range: [
                            start$1072,
                            index$874
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1076 = source$872[index$874 + 1];
        ch3$1077 = source$872[index$874 + 2];
        ch4$1078 = source$872[index$874 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1075 === '>' && ch2$1076 === '>' && ch3$1077 === '>') {
            if (ch4$1078 === '=') {
                index$874 += 4;
                return {
                    type: Token$863.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$875,
                    lineStart: lineStart$876,
                    range: [
                        start$1072,
                        index$874
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1075 === '>' && ch2$1076 === '>' && ch3$1077 === '>') {
            index$874 += 3;
            return {
                type: Token$863.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$875,
                lineStart: lineStart$876,
                range: [
                    start$1072,
                    index$874
                ]
            };
        }
        if (ch1$1075 === '<' && ch2$1076 === '<' && ch3$1077 === '=') {
            index$874 += 3;
            return {
                type: Token$863.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$875,
                lineStart: lineStart$876,
                range: [
                    start$1072,
                    index$874
                ]
            };
        }
        if (ch1$1075 === '>' && ch2$1076 === '>' && ch3$1077 === '=') {
            index$874 += 3;
            return {
                type: Token$863.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$875,
                lineStart: lineStart$876,
                range: [
                    start$1072,
                    index$874
                ]
            };
        }
        if (ch1$1075 === '.' && ch2$1076 === '.' && ch3$1077 === '.') {
            index$874 += 3;
            return {
                type: Token$863.Punctuator,
                value: '...',
                lineNumber: lineNumber$875,
                lineStart: lineStart$876,
                range: [
                    start$1072,
                    index$874
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1075 === ch2$1076 && '+-<>&|'.indexOf(ch1$1075) >= 0) {
            index$874 += 2;
            return {
                type: Token$863.Punctuator,
                value: ch1$1075 + ch2$1076,
                lineNumber: lineNumber$875,
                lineStart: lineStart$876,
                range: [
                    start$1072,
                    index$874
                ]
            };
        }
        if (ch1$1075 === '=' && ch2$1076 === '>') {
            index$874 += 2;
            return {
                type: Token$863.Punctuator,
                value: '=>',
                lineNumber: lineNumber$875,
                lineStart: lineStart$876,
                range: [
                    start$1072,
                    index$874
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1075) >= 0) {
            ++index$874;
            return {
                type: Token$863.Punctuator,
                value: ch1$1075,
                lineNumber: lineNumber$875,
                lineStart: lineStart$876,
                range: [
                    start$1072,
                    index$874
                ]
            };
        }
        if (ch1$1075 === '.') {
            ++index$874;
            return {
                type: Token$863.Punctuator,
                value: ch1$1075,
                lineNumber: lineNumber$875,
                lineStart: lineStart$876,
                range: [
                    start$1072,
                    index$874
                ]
            };
        }
        throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$909(start$1079) {
        var number$1080 = '';
        while (index$874 < length$881) {
            if (!isHexDigit$892(source$872[index$874])) {
                break;
            }
            number$1080 += source$872[index$874++];
        }
        if (number$1080.length === 0) {
            throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$896(source$872.charCodeAt(index$874))) {
            throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$863.NumericLiteral,
            value: parseInt('0x' + number$1080, 16),
            lineNumber: lineNumber$875,
            lineStart: lineStart$876,
            range: [
                start$1079,
                index$874
            ]
        };
    }
    function scanOctalLiteral$910(prefix$1081, start$1082) {
        var number$1083, octal$1084;
        if (isOctalDigit$893(prefix$1081)) {
            octal$1084 = true;
            number$1083 = '0' + source$872[index$874++];
        } else {
            octal$1084 = false;
            ++index$874;
            number$1083 = '';
        }
        while (index$874 < length$881) {
            if (!isOctalDigit$893(source$872[index$874])) {
                break;
            }
            number$1083 += source$872[index$874++];
        }
        if (!octal$1084 && number$1083.length === 0) {
            // only 0o or 0O
            throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$896(source$872.charCodeAt(index$874)) || isDecimalDigit$891(source$872.charCodeAt(index$874))) {
            throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$863.NumericLiteral,
            value: parseInt(number$1083, 8),
            octal: octal$1084,
            lineNumber: lineNumber$875,
            lineStart: lineStart$876,
            range: [
                start$1082,
                index$874
            ]
        };
    }
    function scanNumericLiteral$911() {
        var number$1085, start$1086, ch$1087, octal$1088;
        ch$1087 = source$872[index$874];
        assert$889(isDecimalDigit$891(ch$1087.charCodeAt(0)) || ch$1087 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1086 = index$874;
        number$1085 = '';
        if (ch$1087 !== '.') {
            number$1085 = source$872[index$874++];
            ch$1087 = source$872[index$874];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1085 === '0') {
                if (ch$1087 === 'x' || ch$1087 === 'X') {
                    ++index$874;
                    return scanHexLiteral$909(start$1086);
                }
                if (ch$1087 === 'b' || ch$1087 === 'B') {
                    ++index$874;
                    number$1085 = '';
                    while (index$874 < length$881) {
                        ch$1087 = source$872[index$874];
                        if (ch$1087 !== '0' && ch$1087 !== '1') {
                            break;
                        }
                        number$1085 += source$872[index$874++];
                    }
                    if (number$1085.length === 0) {
                        // only 0b or 0B
                        throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$874 < length$881) {
                        ch$1087 = source$872.charCodeAt(index$874);
                        if (isIdentifierStart$896(ch$1087) || isDecimalDigit$891(ch$1087)) {
                            throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$863.NumericLiteral,
                        value: parseInt(number$1085, 2),
                        lineNumber: lineNumber$875,
                        lineStart: lineStart$876,
                        range: [
                            start$1086,
                            index$874
                        ]
                    };
                }
                if (ch$1087 === 'o' || ch$1087 === 'O' || isOctalDigit$893(ch$1087)) {
                    return scanOctalLiteral$910(ch$1087, start$1086);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1087 && isDecimalDigit$891(ch$1087.charCodeAt(0))) {
                    throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$891(source$872.charCodeAt(index$874))) {
                number$1085 += source$872[index$874++];
            }
            ch$1087 = source$872[index$874];
        }
        if (ch$1087 === '.') {
            number$1085 += source$872[index$874++];
            while (isDecimalDigit$891(source$872.charCodeAt(index$874))) {
                number$1085 += source$872[index$874++];
            }
            ch$1087 = source$872[index$874];
        }
        if (ch$1087 === 'e' || ch$1087 === 'E') {
            number$1085 += source$872[index$874++];
            ch$1087 = source$872[index$874];
            if (ch$1087 === '+' || ch$1087 === '-') {
                number$1085 += source$872[index$874++];
            }
            if (isDecimalDigit$891(source$872.charCodeAt(index$874))) {
                while (isDecimalDigit$891(source$872.charCodeAt(index$874))) {
                    number$1085 += source$872[index$874++];
                }
            } else {
                throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$896(source$872.charCodeAt(index$874))) {
            throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$863.NumericLiteral,
            value: parseFloat(number$1085),
            lineNumber: lineNumber$875,
            lineStart: lineStart$876,
            range: [
                start$1086,
                index$874
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$912() {
        var str$1089 = '', quote$1090, start$1091, ch$1092, code$1093, unescaped$1094, restore$1095, octal$1096 = false;
        quote$1090 = source$872[index$874];
        assert$889(quote$1090 === '\'' || quote$1090 === '"', 'String literal must starts with a quote');
        start$1091 = index$874;
        ++index$874;
        while (index$874 < length$881) {
            ch$1092 = source$872[index$874++];
            if (ch$1092 === quote$1090) {
                quote$1090 = '';
                break;
            } else if (ch$1092 === '\\') {
                ch$1092 = source$872[index$874++];
                if (!ch$1092 || !isLineTerminator$895(ch$1092.charCodeAt(0))) {
                    switch (ch$1092) {
                    case 'n':
                        str$1089 += '\n';
                        break;
                    case 'r':
                        str$1089 += '\r';
                        break;
                    case 't':
                        str$1089 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$872[index$874] === '{') {
                            ++index$874;
                            str$1089 += scanUnicodeCodePointEscape$904();
                        } else {
                            restore$1095 = index$874;
                            unescaped$1094 = scanHexEscape$903(ch$1092);
                            if (unescaped$1094) {
                                str$1089 += unescaped$1094;
                            } else {
                                index$874 = restore$1095;
                                str$1089 += ch$1092;
                            }
                        }
                        break;
                    case 'b':
                        str$1089 += '\b';
                        break;
                    case 'f':
                        str$1089 += '\f';
                        break;
                    case 'v':
                        str$1089 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$893(ch$1092)) {
                            code$1093 = '01234567'.indexOf(ch$1092);
                            // \0 is not octal escape sequence
                            if (code$1093 !== 0) {
                                octal$1096 = true;
                            }
                            if (index$874 < length$881 && isOctalDigit$893(source$872[index$874])) {
                                octal$1096 = true;
                                code$1093 = code$1093 * 8 + '01234567'.indexOf(source$872[index$874++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1092) >= 0 && index$874 < length$881 && isOctalDigit$893(source$872[index$874])) {
                                    code$1093 = code$1093 * 8 + '01234567'.indexOf(source$872[index$874++]);
                                }
                            }
                            str$1089 += String.fromCharCode(code$1093);
                        } else {
                            str$1089 += ch$1092;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$875;
                    if (ch$1092 === '\r' && source$872[index$874] === '\n') {
                        ++index$874;
                    }
                }
            } else if (isLineTerminator$895(ch$1092.charCodeAt(0))) {
                break;
            } else {
                str$1089 += ch$1092;
            }
        }
        if (quote$1090 !== '') {
            throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$863.StringLiteral,
            value: str$1089,
            octal: octal$1096,
            lineNumber: lineNumber$875,
            lineStart: lineStart$876,
            range: [
                start$1091,
                index$874
            ]
        };
    }
    function scanTemplate$913() {
        var cooked$1097 = '', ch$1098, start$1099, terminated$1100, tail$1101, restore$1102, unescaped$1103, code$1104, octal$1105;
        terminated$1100 = false;
        tail$1101 = false;
        start$1099 = index$874;
        ++index$874;
        while (index$874 < length$881) {
            ch$1098 = source$872[index$874++];
            if (ch$1098 === '`') {
                tail$1101 = true;
                terminated$1100 = true;
                break;
            } else if (ch$1098 === '$') {
                if (source$872[index$874] === '{') {
                    ++index$874;
                    terminated$1100 = true;
                    break;
                }
                cooked$1097 += ch$1098;
            } else if (ch$1098 === '\\') {
                ch$1098 = source$872[index$874++];
                if (!isLineTerminator$895(ch$1098.charCodeAt(0))) {
                    switch (ch$1098) {
                    case 'n':
                        cooked$1097 += '\n';
                        break;
                    case 'r':
                        cooked$1097 += '\r';
                        break;
                    case 't':
                        cooked$1097 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$872[index$874] === '{') {
                            ++index$874;
                            cooked$1097 += scanUnicodeCodePointEscape$904();
                        } else {
                            restore$1102 = index$874;
                            unescaped$1103 = scanHexEscape$903(ch$1098);
                            if (unescaped$1103) {
                                cooked$1097 += unescaped$1103;
                            } else {
                                index$874 = restore$1102;
                                cooked$1097 += ch$1098;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1097 += '\b';
                        break;
                    case 'f':
                        cooked$1097 += '\f';
                        break;
                    case 'v':
                        cooked$1097 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$893(ch$1098)) {
                            code$1104 = '01234567'.indexOf(ch$1098);
                            // \0 is not octal escape sequence
                            if (code$1104 !== 0) {
                                octal$1105 = true;
                            }
                            if (index$874 < length$881 && isOctalDigit$893(source$872[index$874])) {
                                octal$1105 = true;
                                code$1104 = code$1104 * 8 + '01234567'.indexOf(source$872[index$874++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1098) >= 0 && index$874 < length$881 && isOctalDigit$893(source$872[index$874])) {
                                    code$1104 = code$1104 * 8 + '01234567'.indexOf(source$872[index$874++]);
                                }
                            }
                            cooked$1097 += String.fromCharCode(code$1104);
                        } else {
                            cooked$1097 += ch$1098;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$875;
                    if (ch$1098 === '\r' && source$872[index$874] === '\n') {
                        ++index$874;
                    }
                }
            } else if (isLineTerminator$895(ch$1098.charCodeAt(0))) {
                ++lineNumber$875;
                if (ch$1098 === '\r' && source$872[index$874] === '\n') {
                    ++index$874;
                }
                cooked$1097 += '\n';
            } else {
                cooked$1097 += ch$1098;
            }
        }
        if (!terminated$1100) {
            throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$863.Template,
            value: {
                cooked: cooked$1097,
                raw: source$872.slice(start$1099 + 1, index$874 - (tail$1101 ? 1 : 2))
            },
            tail: tail$1101,
            octal: octal$1105,
            lineNumber: lineNumber$875,
            lineStart: lineStart$876,
            range: [
                start$1099,
                index$874
            ]
        };
    }
    function scanTemplateElement$914(option$1106) {
        var startsWith$1107, template$1108;
        lookahead$885 = null;
        skipComment$902();
        startsWith$1107 = option$1106.head ? '`' : '}';
        if (source$872[index$874] !== startsWith$1107) {
            throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
        }
        template$1108 = scanTemplate$913();
        peek$920();
        return template$1108;
    }
    function scanRegExp$915() {
        var str$1109, ch$1110, start$1111, pattern$1112, flags$1113, value$1114, classMarker$1115 = false, restore$1116, terminated$1117 = false;
        lookahead$885 = null;
        skipComment$902();
        start$1111 = index$874;
        ch$1110 = source$872[index$874];
        assert$889(ch$1110 === '/', 'Regular expression literal must start with a slash');
        str$1109 = source$872[index$874++];
        while (index$874 < length$881) {
            ch$1110 = source$872[index$874++];
            str$1109 += ch$1110;
            if (classMarker$1115) {
                if (ch$1110 === ']') {
                    classMarker$1115 = false;
                }
            } else {
                if (ch$1110 === '\\') {
                    ch$1110 = source$872[index$874++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$895(ch$1110.charCodeAt(0))) {
                        throwError$923({}, Messages$868.UnterminatedRegExp);
                    }
                    str$1109 += ch$1110;
                } else if (ch$1110 === '/') {
                    terminated$1117 = true;
                    break;
                } else if (ch$1110 === '[') {
                    classMarker$1115 = true;
                } else if (isLineTerminator$895(ch$1110.charCodeAt(0))) {
                    throwError$923({}, Messages$868.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1117) {
            throwError$923({}, Messages$868.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1112 = str$1109.substr(1, str$1109.length - 2);
        flags$1113 = '';
        while (index$874 < length$881) {
            ch$1110 = source$872[index$874];
            if (!isIdentifierPart$897(ch$1110.charCodeAt(0))) {
                break;
            }
            ++index$874;
            if (ch$1110 === '\\' && index$874 < length$881) {
                ch$1110 = source$872[index$874];
                if (ch$1110 === 'u') {
                    ++index$874;
                    restore$1116 = index$874;
                    ch$1110 = scanHexEscape$903('u');
                    if (ch$1110) {
                        flags$1113 += ch$1110;
                        for (str$1109 += '\\u'; restore$1116 < index$874; ++restore$1116) {
                            str$1109 += source$872[restore$1116];
                        }
                    } else {
                        index$874 = restore$1116;
                        flags$1113 += 'u';
                        str$1109 += '\\u';
                    }
                } else {
                    str$1109 += '\\';
                }
            } else {
                flags$1113 += ch$1110;
                str$1109 += ch$1110;
            }
        }
        try {
            value$1114 = new RegExp(pattern$1112, flags$1113);
        } catch (e$1118) {
            throwError$923({}, Messages$868.InvalidRegExp);
        }
        // peek();
        if (extra$888.tokenize) {
            return {
                type: Token$863.RegularExpression,
                value: value$1114,
                lineNumber: lineNumber$875,
                lineStart: lineStart$876,
                range: [
                    start$1111,
                    index$874
                ]
            };
        }
        return {
            type: Token$863.RegularExpression,
            literal: str$1109,
            value: value$1114,
            range: [
                start$1111,
                index$874
            ]
        };
    }
    function isIdentifierName$916(token$1119) {
        return token$1119.type === Token$863.Identifier || token$1119.type === Token$863.Keyword || token$1119.type === Token$863.BooleanLiteral || token$1119.type === Token$863.NullLiteral;
    }
    function advanceSlash$917() {
        var prevToken$1120, checkToken$1121;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1120 = extra$888.tokens[extra$888.tokens.length - 1];
        if (!prevToken$1120) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$915();
        }
        if (prevToken$1120.type === 'Punctuator') {
            if (prevToken$1120.value === ')') {
                checkToken$1121 = extra$888.tokens[extra$888.openParenToken - 1];
                if (checkToken$1121 && checkToken$1121.type === 'Keyword' && (checkToken$1121.value === 'if' || checkToken$1121.value === 'while' || checkToken$1121.value === 'for' || checkToken$1121.value === 'with')) {
                    return scanRegExp$915();
                }
                return scanPunctuator$908();
            }
            if (prevToken$1120.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$888.tokens[extra$888.openCurlyToken - 3] && extra$888.tokens[extra$888.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1121 = extra$888.tokens[extra$888.openCurlyToken - 4];
                    if (!checkToken$1121) {
                        return scanPunctuator$908();
                    }
                } else if (extra$888.tokens[extra$888.openCurlyToken - 4] && extra$888.tokens[extra$888.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1121 = extra$888.tokens[extra$888.openCurlyToken - 5];
                    if (!checkToken$1121) {
                        return scanRegExp$915();
                    }
                } else {
                    return scanPunctuator$908();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$865.indexOf(checkToken$1121.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$908();
                }
                // It is a declaration.
                return scanRegExp$915();
            }
            return scanRegExp$915();
        }
        if (prevToken$1120.type === 'Keyword') {
            return scanRegExp$915();
        }
        return scanPunctuator$908();
    }
    function advance$918() {
        var ch$1122;
        skipComment$902();
        if (index$874 >= length$881) {
            return {
                type: Token$863.EOF,
                lineNumber: lineNumber$875,
                lineStart: lineStart$876,
                range: [
                    index$874,
                    index$874
                ]
            };
        }
        ch$1122 = source$872.charCodeAt(index$874);
        // Very common: ( and ) and ;
        if (ch$1122 === 40 || ch$1122 === 41 || ch$1122 === 58) {
            return scanPunctuator$908();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1122 === 39 || ch$1122 === 34) {
            return scanStringLiteral$912();
        }
        if (ch$1122 === 96) {
            return scanTemplate$913();
        }
        if (isIdentifierStart$896(ch$1122)) {
            return scanIdentifier$907();
        }
        // # and @ are allowed for sweet.js
        if (ch$1122 === 35 || ch$1122 === 64) {
            ++index$874;
            return {
                type: Token$863.Punctuator,
                value: String.fromCharCode(ch$1122),
                lineNumber: lineNumber$875,
                lineStart: lineStart$876,
                range: [
                    index$874 - 1,
                    index$874
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1122 === 46) {
            if (isDecimalDigit$891(source$872.charCodeAt(index$874 + 1))) {
                return scanNumericLiteral$911();
            }
            return scanPunctuator$908();
        }
        if (isDecimalDigit$891(ch$1122)) {
            return scanNumericLiteral$911();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$888.tokenize && ch$1122 === 47) {
            return advanceSlash$917();
        }
        return scanPunctuator$908();
    }
    function lex$919() {
        var token$1123;
        token$1123 = lookahead$885;
        streamIndex$884 = lookaheadIndex$886;
        lineNumber$875 = token$1123.lineNumber;
        lineStart$876 = token$1123.lineStart;
        sm_lineNumber$877 = lookahead$885.sm_lineNumber;
        sm_lineStart$878 = lookahead$885.sm_lineStart;
        sm_range$879 = lookahead$885.sm_range;
        sm_index$880 = lookahead$885.sm_range[0];
        lookahead$885 = tokenStream$883[++streamIndex$884].token;
        lookaheadIndex$886 = streamIndex$884;
        index$874 = lookahead$885.range[0];
        return token$1123;
    }
    function peek$920() {
        lookaheadIndex$886 = streamIndex$884 + 1;
        if (lookaheadIndex$886 >= length$881) {
            lookahead$885 = {
                type: Token$863.EOF,
                lineNumber: lineNumber$875,
                lineStart: lineStart$876,
                range: [
                    index$874,
                    index$874
                ]
            };
            return;
        }
        lookahead$885 = tokenStream$883[lookaheadIndex$886].token;
        index$874 = lookahead$885.range[0];
    }
    function lookahead2$921() {
        var adv$1124, pos$1125, line$1126, start$1127, result$1128;
        if (streamIndex$884 + 1 >= length$881 || streamIndex$884 + 2 >= length$881) {
            return {
                type: Token$863.EOF,
                lineNumber: lineNumber$875,
                lineStart: lineStart$876,
                range: [
                    index$874,
                    index$874
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$885 === null) {
            lookaheadIndex$886 = streamIndex$884 + 1;
            lookahead$885 = tokenStream$883[lookaheadIndex$886].token;
            index$874 = lookahead$885.range[0];
        }
        result$1128 = tokenStream$883[lookaheadIndex$886 + 1].token;
        return result$1128;
    }
    SyntaxTreeDelegate$870 = {
        name: 'SyntaxTree',
        postProcess: function (node$1129) {
            return node$1129;
        },
        createArrayExpression: function (elements$1130) {
            return {
                type: Syntax$866.ArrayExpression,
                elements: elements$1130
            };
        },
        createAssignmentExpression: function (operator$1131, left$1132, right$1133) {
            return {
                type: Syntax$866.AssignmentExpression,
                operator: operator$1131,
                left: left$1132,
                right: right$1133
            };
        },
        createBinaryExpression: function (operator$1134, left$1135, right$1136) {
            var type$1137 = operator$1134 === '||' || operator$1134 === '&&' ? Syntax$866.LogicalExpression : Syntax$866.BinaryExpression;
            return {
                type: type$1137,
                operator: operator$1134,
                left: left$1135,
                right: right$1136
            };
        },
        createBlockStatement: function (body$1138) {
            return {
                type: Syntax$866.BlockStatement,
                body: body$1138
            };
        },
        createBreakStatement: function (label$1139) {
            return {
                type: Syntax$866.BreakStatement,
                label: label$1139
            };
        },
        createCallExpression: function (callee$1140, args$1141) {
            return {
                type: Syntax$866.CallExpression,
                callee: callee$1140,
                'arguments': args$1141
            };
        },
        createCatchClause: function (param$1142, body$1143) {
            return {
                type: Syntax$866.CatchClause,
                param: param$1142,
                body: body$1143
            };
        },
        createConditionalExpression: function (test$1144, consequent$1145, alternate$1146) {
            return {
                type: Syntax$866.ConditionalExpression,
                test: test$1144,
                consequent: consequent$1145,
                alternate: alternate$1146
            };
        },
        createContinueStatement: function (label$1147) {
            return {
                type: Syntax$866.ContinueStatement,
                label: label$1147
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$866.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1148, test$1149) {
            return {
                type: Syntax$866.DoWhileStatement,
                body: body$1148,
                test: test$1149
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$866.EmptyStatement };
        },
        createExpressionStatement: function (expression$1150) {
            return {
                type: Syntax$866.ExpressionStatement,
                expression: expression$1150
            };
        },
        createForStatement: function (init$1151, test$1152, update$1153, body$1154) {
            return {
                type: Syntax$866.ForStatement,
                init: init$1151,
                test: test$1152,
                update: update$1153,
                body: body$1154
            };
        },
        createForInStatement: function (left$1155, right$1156, body$1157) {
            return {
                type: Syntax$866.ForInStatement,
                left: left$1155,
                right: right$1156,
                body: body$1157,
                each: false
            };
        },
        createForOfStatement: function (left$1158, right$1159, body$1160) {
            return {
                type: Syntax$866.ForOfStatement,
                left: left$1158,
                right: right$1159,
                body: body$1160
            };
        },
        createFunctionDeclaration: function (id$1161, params$1162, defaults$1163, body$1164, rest$1165, generator$1166, expression$1167) {
            return {
                type: Syntax$866.FunctionDeclaration,
                id: id$1161,
                params: params$1162,
                defaults: defaults$1163,
                body: body$1164,
                rest: rest$1165,
                generator: generator$1166,
                expression: expression$1167
            };
        },
        createFunctionExpression: function (id$1168, params$1169, defaults$1170, body$1171, rest$1172, generator$1173, expression$1174) {
            return {
                type: Syntax$866.FunctionExpression,
                id: id$1168,
                params: params$1169,
                defaults: defaults$1170,
                body: body$1171,
                rest: rest$1172,
                generator: generator$1173,
                expression: expression$1174
            };
        },
        createIdentifier: function (name$1175) {
            return {
                type: Syntax$866.Identifier,
                name: name$1175
            };
        },
        createIfStatement: function (test$1176, consequent$1177, alternate$1178) {
            return {
                type: Syntax$866.IfStatement,
                test: test$1176,
                consequent: consequent$1177,
                alternate: alternate$1178
            };
        },
        createLabeledStatement: function (label$1179, body$1180) {
            return {
                type: Syntax$866.LabeledStatement,
                label: label$1179,
                body: body$1180
            };
        },
        createLiteral: function (token$1181) {
            return {
                type: Syntax$866.Literal,
                value: token$1181.value,
                raw: String(token$1181.value)
            };
        },
        createMemberExpression: function (accessor$1182, object$1183, property$1184) {
            return {
                type: Syntax$866.MemberExpression,
                computed: accessor$1182 === '[',
                object: object$1183,
                property: property$1184
            };
        },
        createNewExpression: function (callee$1185, args$1186) {
            return {
                type: Syntax$866.NewExpression,
                callee: callee$1185,
                'arguments': args$1186
            };
        },
        createObjectExpression: function (properties$1187) {
            return {
                type: Syntax$866.ObjectExpression,
                properties: properties$1187
            };
        },
        createPostfixExpression: function (operator$1188, argument$1189) {
            return {
                type: Syntax$866.UpdateExpression,
                operator: operator$1188,
                argument: argument$1189,
                prefix: false
            };
        },
        createProgram: function (body$1190) {
            return {
                type: Syntax$866.Program,
                body: body$1190
            };
        },
        createProperty: function (kind$1191, key$1192, value$1193, method$1194, shorthand$1195) {
            return {
                type: Syntax$866.Property,
                key: key$1192,
                value: value$1193,
                kind: kind$1191,
                method: method$1194,
                shorthand: shorthand$1195
            };
        },
        createReturnStatement: function (argument$1196) {
            return {
                type: Syntax$866.ReturnStatement,
                argument: argument$1196
            };
        },
        createSequenceExpression: function (expressions$1197) {
            return {
                type: Syntax$866.SequenceExpression,
                expressions: expressions$1197
            };
        },
        createSwitchCase: function (test$1198, consequent$1199) {
            return {
                type: Syntax$866.SwitchCase,
                test: test$1198,
                consequent: consequent$1199
            };
        },
        createSwitchStatement: function (discriminant$1200, cases$1201) {
            return {
                type: Syntax$866.SwitchStatement,
                discriminant: discriminant$1200,
                cases: cases$1201
            };
        },
        createThisExpression: function () {
            return { type: Syntax$866.ThisExpression };
        },
        createThrowStatement: function (argument$1202) {
            return {
                type: Syntax$866.ThrowStatement,
                argument: argument$1202
            };
        },
        createTryStatement: function (block$1203, guardedHandlers$1204, handlers$1205, finalizer$1206) {
            return {
                type: Syntax$866.TryStatement,
                block: block$1203,
                guardedHandlers: guardedHandlers$1204,
                handlers: handlers$1205,
                finalizer: finalizer$1206
            };
        },
        createUnaryExpression: function (operator$1207, argument$1208) {
            if (operator$1207 === '++' || operator$1207 === '--') {
                return {
                    type: Syntax$866.UpdateExpression,
                    operator: operator$1207,
                    argument: argument$1208,
                    prefix: true
                };
            }
            return {
                type: Syntax$866.UnaryExpression,
                operator: operator$1207,
                argument: argument$1208
            };
        },
        createVariableDeclaration: function (declarations$1209, kind$1210) {
            return {
                type: Syntax$866.VariableDeclaration,
                declarations: declarations$1209,
                kind: kind$1210
            };
        },
        createVariableDeclarator: function (id$1211, init$1212) {
            return {
                type: Syntax$866.VariableDeclarator,
                id: id$1211,
                init: init$1212
            };
        },
        createWhileStatement: function (test$1213, body$1214) {
            return {
                type: Syntax$866.WhileStatement,
                test: test$1213,
                body: body$1214
            };
        },
        createWithStatement: function (object$1215, body$1216) {
            return {
                type: Syntax$866.WithStatement,
                object: object$1215,
                body: body$1216
            };
        },
        createTemplateElement: function (value$1217, tail$1218) {
            return {
                type: Syntax$866.TemplateElement,
                value: value$1217,
                tail: tail$1218
            };
        },
        createTemplateLiteral: function (quasis$1219, expressions$1220) {
            return {
                type: Syntax$866.TemplateLiteral,
                quasis: quasis$1219,
                expressions: expressions$1220
            };
        },
        createSpreadElement: function (argument$1221) {
            return {
                type: Syntax$866.SpreadElement,
                argument: argument$1221
            };
        },
        createTaggedTemplateExpression: function (tag$1222, quasi$1223) {
            return {
                type: Syntax$866.TaggedTemplateExpression,
                tag: tag$1222,
                quasi: quasi$1223
            };
        },
        createArrowFunctionExpression: function (params$1224, defaults$1225, body$1226, rest$1227, expression$1228) {
            return {
                type: Syntax$866.ArrowFunctionExpression,
                id: null,
                params: params$1224,
                defaults: defaults$1225,
                body: body$1226,
                rest: rest$1227,
                generator: false,
                expression: expression$1228
            };
        },
        createMethodDefinition: function (propertyType$1229, kind$1230, key$1231, value$1232) {
            return {
                type: Syntax$866.MethodDefinition,
                key: key$1231,
                value: value$1232,
                kind: kind$1230,
                'static': propertyType$1229 === ClassPropertyType$871.static
            };
        },
        createClassBody: function (body$1233) {
            return {
                type: Syntax$866.ClassBody,
                body: body$1233
            };
        },
        createClassExpression: function (id$1234, superClass$1235, body$1236) {
            return {
                type: Syntax$866.ClassExpression,
                id: id$1234,
                superClass: superClass$1235,
                body: body$1236
            };
        },
        createClassDeclaration: function (id$1237, superClass$1238, body$1239) {
            return {
                type: Syntax$866.ClassDeclaration,
                id: id$1237,
                superClass: superClass$1238,
                body: body$1239
            };
        },
        createExportSpecifier: function (id$1240, name$1241) {
            return {
                type: Syntax$866.ExportSpecifier,
                id: id$1240,
                name: name$1241
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$866.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1242, specifiers$1243, source$1244) {
            return {
                type: Syntax$866.ExportDeclaration,
                declaration: declaration$1242,
                specifiers: specifiers$1243,
                source: source$1244
            };
        },
        createImportSpecifier: function (id$1245, name$1246) {
            return {
                type: Syntax$866.ImportSpecifier,
                id: id$1245,
                name: name$1246
            };
        },
        createImportDeclaration: function (specifiers$1247, kind$1248, source$1249) {
            return {
                type: Syntax$866.ImportDeclaration,
                specifiers: specifiers$1247,
                kind: kind$1248,
                source: source$1249
            };
        },
        createYieldExpression: function (argument$1250, delegate$1251) {
            return {
                type: Syntax$866.YieldExpression,
                argument: argument$1250,
                delegate: delegate$1251
            };
        },
        createModuleDeclaration: function (id$1252, source$1253, body$1254) {
            return {
                type: Syntax$866.ModuleDeclaration,
                id: id$1252,
                source: source$1253,
                body: body$1254
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$922() {
        return lookahead$885.lineNumber !== lineNumber$875;
    }
    // Throw an exception
    function throwError$923(token$1255, messageFormat$1256) {
        var error$1257, args$1258 = Array.prototype.slice.call(arguments, 2), msg$1259 = messageFormat$1256.replace(/%(\d)/g, function (whole$1263, index$1264) {
                assert$889(index$1264 < args$1258.length, 'Message reference must be in range');
                return args$1258[index$1264];
            });
        var startIndex$1260 = streamIndex$884 > 3 ? streamIndex$884 - 3 : 0;
        var toks$1261 = '', tailingMsg$1262 = '';
        if (tokenStream$883) {
            toks$1261 = tokenStream$883.slice(startIndex$1260, streamIndex$884 + 3).map(function (stx$1265) {
                return stx$1265.token.value;
            }).join(' ');
            tailingMsg$1262 = '\n[... ' + toks$1261 + ' ...]';
        }
        if (typeof token$1255.lineNumber === 'number') {
            error$1257 = new Error('Line ' + token$1255.lineNumber + ': ' + msg$1259 + tailingMsg$1262);
            error$1257.index = token$1255.range[0];
            error$1257.lineNumber = token$1255.lineNumber;
            error$1257.column = token$1255.range[0] - lineStart$876 + 1;
        } else {
            error$1257 = new Error('Line ' + lineNumber$875 + ': ' + msg$1259 + tailingMsg$1262);
            error$1257.index = index$874;
            error$1257.lineNumber = lineNumber$875;
            error$1257.column = index$874 - lineStart$876 + 1;
        }
        error$1257.description = msg$1259;
        throw error$1257;
    }
    function throwErrorTolerant$924() {
        try {
            throwError$923.apply(null, arguments);
        } catch (e$1266) {
            if (extra$888.errors) {
                extra$888.errors.push(e$1266);
            } else {
                throw e$1266;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$925(token$1267) {
        if (token$1267.type === Token$863.EOF) {
            throwError$923(token$1267, Messages$868.UnexpectedEOS);
        }
        if (token$1267.type === Token$863.NumericLiteral) {
            throwError$923(token$1267, Messages$868.UnexpectedNumber);
        }
        if (token$1267.type === Token$863.StringLiteral) {
            throwError$923(token$1267, Messages$868.UnexpectedString);
        }
        if (token$1267.type === Token$863.Identifier) {
            throwError$923(token$1267, Messages$868.UnexpectedIdentifier);
        }
        if (token$1267.type === Token$863.Keyword) {
            if (isFutureReservedWord$898(token$1267.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$873 && isStrictModeReservedWord$899(token$1267.value)) {
                throwErrorTolerant$924(token$1267, Messages$868.StrictReservedWord);
                return;
            }
            throwError$923(token$1267, Messages$868.UnexpectedToken, token$1267.value);
        }
        if (token$1267.type === Token$863.Template) {
            throwError$923(token$1267, Messages$868.UnexpectedTemplate, token$1267.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$923(token$1267, Messages$868.UnexpectedToken, token$1267.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$926(value$1268) {
        var token$1269 = lex$919();
        if (token$1269.type !== Token$863.Punctuator || token$1269.value !== value$1268) {
            throwUnexpected$925(token$1269);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$927(keyword$1270) {
        var token$1271 = lex$919();
        if (token$1271.type !== Token$863.Keyword || token$1271.value !== keyword$1270) {
            throwUnexpected$925(token$1271);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$928(value$1272) {
        return lookahead$885.type === Token$863.Punctuator && lookahead$885.value === value$1272;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$929(keyword$1273) {
        return lookahead$885.type === Token$863.Keyword && lookahead$885.value === keyword$1273;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$930(keyword$1274) {
        return lookahead$885.type === Token$863.Identifier && lookahead$885.value === keyword$1274;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$931() {
        var op$1275;
        if (lookahead$885.type !== Token$863.Punctuator) {
            return false;
        }
        op$1275 = lookahead$885.value;
        return op$1275 === '=' || op$1275 === '*=' || op$1275 === '/=' || op$1275 === '%=' || op$1275 === '+=' || op$1275 === '-=' || op$1275 === '<<=' || op$1275 === '>>=' || op$1275 === '>>>=' || op$1275 === '&=' || op$1275 === '^=' || op$1275 === '|=';
    }
    function consumeSemicolon$932() {
        var line$1276, ch$1277;
        ch$1277 = lookahead$885.value ? String(lookahead$885.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1277 === 59) {
            lex$919();
            return;
        }
        if (lookahead$885.lineNumber !== lineNumber$875) {
            return;
        }
        if (match$928(';')) {
            lex$919();
            return;
        }
        if (lookahead$885.type !== Token$863.EOF && !match$928('}')) {
            throwUnexpected$925(lookahead$885);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$933(expr$1278) {
        return expr$1278.type === Syntax$866.Identifier || expr$1278.type === Syntax$866.MemberExpression;
    }
    function isAssignableLeftHandSide$934(expr$1279) {
        return isLeftHandSide$933(expr$1279) || expr$1279.type === Syntax$866.ObjectPattern || expr$1279.type === Syntax$866.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$935() {
        var elements$1280 = [], blocks$1281 = [], filter$1282 = null, tmp$1283, possiblecomprehension$1284 = true, body$1285;
        expect$926('[');
        while (!match$928(']')) {
            if (lookahead$885.value === 'for' && lookahead$885.type === Token$863.Keyword) {
                if (!possiblecomprehension$1284) {
                    throwError$923({}, Messages$868.ComprehensionError);
                }
                matchKeyword$929('for');
                tmp$1283 = parseForStatement$983({ ignoreBody: true });
                tmp$1283.of = tmp$1283.type === Syntax$866.ForOfStatement;
                tmp$1283.type = Syntax$866.ComprehensionBlock;
                if (tmp$1283.left.kind) {
                    // can't be let or const
                    throwError$923({}, Messages$868.ComprehensionError);
                }
                blocks$1281.push(tmp$1283);
            } else if (lookahead$885.value === 'if' && lookahead$885.type === Token$863.Keyword) {
                if (!possiblecomprehension$1284) {
                    throwError$923({}, Messages$868.ComprehensionError);
                }
                expectKeyword$927('if');
                expect$926('(');
                filter$1282 = parseExpression$963();
                expect$926(')');
            } else if (lookahead$885.value === ',' && lookahead$885.type === Token$863.Punctuator) {
                possiblecomprehension$1284 = false;
                // no longer allowed.
                lex$919();
                elements$1280.push(null);
            } else {
                tmp$1283 = parseSpreadOrAssignmentExpression$946();
                elements$1280.push(tmp$1283);
                if (tmp$1283 && tmp$1283.type === Syntax$866.SpreadElement) {
                    if (!match$928(']')) {
                        throwError$923({}, Messages$868.ElementAfterSpreadElement);
                    }
                } else if (!(match$928(']') || matchKeyword$929('for') || matchKeyword$929('if'))) {
                    expect$926(',');
                    // this lexes.
                    possiblecomprehension$1284 = false;
                }
            }
        }
        expect$926(']');
        if (filter$1282 && !blocks$1281.length) {
            throwError$923({}, Messages$868.ComprehensionRequiresBlock);
        }
        if (blocks$1281.length) {
            if (elements$1280.length !== 1) {
                throwError$923({}, Messages$868.ComprehensionError);
            }
            return {
                type: Syntax$866.ComprehensionExpression,
                filter: filter$1282,
                blocks: blocks$1281,
                body: elements$1280[0]
            };
        }
        return delegate$882.createArrayExpression(elements$1280);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$936(options$1286) {
        var previousStrict$1287, previousYieldAllowed$1288, params$1289, defaults$1290, body$1291;
        previousStrict$1287 = strict$873;
        previousYieldAllowed$1288 = state$887.yieldAllowed;
        state$887.yieldAllowed = options$1286.generator;
        params$1289 = options$1286.params || [];
        defaults$1290 = options$1286.defaults || [];
        body$1291 = parseConciseBody$995();
        if (options$1286.name && strict$873 && isRestrictedWord$900(params$1289[0].name)) {
            throwErrorTolerant$924(options$1286.name, Messages$868.StrictParamName);
        }
        if (state$887.yieldAllowed && !state$887.yieldFound) {
            throwErrorTolerant$924({}, Messages$868.NoYieldInGenerator);
        }
        strict$873 = previousStrict$1287;
        state$887.yieldAllowed = previousYieldAllowed$1288;
        return delegate$882.createFunctionExpression(null, params$1289, defaults$1290, body$1291, options$1286.rest || null, options$1286.generator, body$1291.type !== Syntax$866.BlockStatement);
    }
    function parsePropertyMethodFunction$937(options$1292) {
        var previousStrict$1293, tmp$1294, method$1295;
        previousStrict$1293 = strict$873;
        strict$873 = true;
        tmp$1294 = parseParams$999();
        if (tmp$1294.stricted) {
            throwErrorTolerant$924(tmp$1294.stricted, tmp$1294.message);
        }
        method$1295 = parsePropertyFunction$936({
            params: tmp$1294.params,
            defaults: tmp$1294.defaults,
            rest: tmp$1294.rest,
            generator: options$1292.generator
        });
        strict$873 = previousStrict$1293;
        return method$1295;
    }
    function parseObjectPropertyKey$938() {
        var token$1296 = lex$919();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1296.type === Token$863.StringLiteral || token$1296.type === Token$863.NumericLiteral) {
            if (strict$873 && token$1296.octal) {
                throwErrorTolerant$924(token$1296, Messages$868.StrictOctalLiteral);
            }
            return delegate$882.createLiteral(token$1296);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$882.createIdentifier(token$1296.value);
    }
    function parseObjectProperty$939() {
        var token$1297, key$1298, id$1299, value$1300, param$1301;
        token$1297 = lookahead$885;
        if (token$1297.type === Token$863.Identifier) {
            id$1299 = parseObjectPropertyKey$938();
            // Property Assignment: Getter and Setter.
            if (token$1297.value === 'get' && !(match$928(':') || match$928('('))) {
                key$1298 = parseObjectPropertyKey$938();
                expect$926('(');
                expect$926(')');
                return delegate$882.createProperty('get', key$1298, parsePropertyFunction$936({ generator: false }), false, false);
            }
            if (token$1297.value === 'set' && !(match$928(':') || match$928('('))) {
                key$1298 = parseObjectPropertyKey$938();
                expect$926('(');
                token$1297 = lookahead$885;
                param$1301 = [parseVariableIdentifier$966()];
                expect$926(')');
                return delegate$882.createProperty('set', key$1298, parsePropertyFunction$936({
                    params: param$1301,
                    generator: false,
                    name: token$1297
                }), false, false);
            }
            if (match$928(':')) {
                lex$919();
                return delegate$882.createProperty('init', id$1299, parseAssignmentExpression$962(), false, false);
            }
            if (match$928('(')) {
                return delegate$882.createProperty('init', id$1299, parsePropertyMethodFunction$937({ generator: false }), true, false);
            }
            return delegate$882.createProperty('init', id$1299, id$1299, false, true);
        }
        if (token$1297.type === Token$863.EOF || token$1297.type === Token$863.Punctuator) {
            if (!match$928('*')) {
                throwUnexpected$925(token$1297);
            }
            lex$919();
            id$1299 = parseObjectPropertyKey$938();
            if (!match$928('(')) {
                throwUnexpected$925(lex$919());
            }
            return delegate$882.createProperty('init', id$1299, parsePropertyMethodFunction$937({ generator: true }), true, false);
        }
        key$1298 = parseObjectPropertyKey$938();
        if (match$928(':')) {
            lex$919();
            return delegate$882.createProperty('init', key$1298, parseAssignmentExpression$962(), false, false);
        }
        if (match$928('(')) {
            return delegate$882.createProperty('init', key$1298, parsePropertyMethodFunction$937({ generator: false }), true, false);
        }
        throwUnexpected$925(lex$919());
    }
    function parseObjectInitialiser$940() {
        var properties$1302 = [], property$1303, name$1304, key$1305, kind$1306, map$1307 = {}, toString$1308 = String;
        expect$926('{');
        while (!match$928('}')) {
            property$1303 = parseObjectProperty$939();
            if (property$1303.key.type === Syntax$866.Identifier) {
                name$1304 = property$1303.key.name;
            } else {
                name$1304 = toString$1308(property$1303.key.value);
            }
            kind$1306 = property$1303.kind === 'init' ? PropertyKind$867.Data : property$1303.kind === 'get' ? PropertyKind$867.Get : PropertyKind$867.Set;
            key$1305 = '$' + name$1304;
            if (Object.prototype.hasOwnProperty.call(map$1307, key$1305)) {
                if (map$1307[key$1305] === PropertyKind$867.Data) {
                    if (strict$873 && kind$1306 === PropertyKind$867.Data) {
                        throwErrorTolerant$924({}, Messages$868.StrictDuplicateProperty);
                    } else if (kind$1306 !== PropertyKind$867.Data) {
                        throwErrorTolerant$924({}, Messages$868.AccessorDataProperty);
                    }
                } else {
                    if (kind$1306 === PropertyKind$867.Data) {
                        throwErrorTolerant$924({}, Messages$868.AccessorDataProperty);
                    } else if (map$1307[key$1305] & kind$1306) {
                        throwErrorTolerant$924({}, Messages$868.AccessorGetSet);
                    }
                }
                map$1307[key$1305] |= kind$1306;
            } else {
                map$1307[key$1305] = kind$1306;
            }
            properties$1302.push(property$1303);
            if (!match$928('}')) {
                expect$926(',');
            }
        }
        expect$926('}');
        return delegate$882.createObjectExpression(properties$1302);
    }
    function parseTemplateElement$941(option$1309) {
        var token$1310 = lex$919();
        if (strict$873 && token$1310.octal) {
            throwError$923(token$1310, Messages$868.StrictOctalLiteral);
        }
        return delegate$882.createTemplateElement({
            raw: token$1310.value.raw,
            cooked: token$1310.value.cooked
        }, token$1310.tail);
    }
    function parseTemplateLiteral$942() {
        var quasi$1311, quasis$1312, expressions$1313;
        quasi$1311 = parseTemplateElement$941({ head: true });
        quasis$1312 = [quasi$1311];
        expressions$1313 = [];
        while (!quasi$1311.tail) {
            expressions$1313.push(parseExpression$963());
            quasi$1311 = parseTemplateElement$941({ head: false });
            quasis$1312.push(quasi$1311);
        }
        return delegate$882.createTemplateLiteral(quasis$1312, expressions$1313);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$943() {
        var expr$1314;
        expect$926('(');
        ++state$887.parenthesizedCount;
        expr$1314 = parseExpression$963();
        expect$926(')');
        return expr$1314;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$944() {
        var type$1315, token$1316, resolvedIdent$1317;
        token$1316 = lookahead$885;
        type$1315 = lookahead$885.type;
        if (type$1315 === Token$863.Identifier) {
            resolvedIdent$1317 = expander$862.resolve(tokenStream$883[lookaheadIndex$886]);
            lex$919();
            return delegate$882.createIdentifier(resolvedIdent$1317);
        }
        if (type$1315 === Token$863.StringLiteral || type$1315 === Token$863.NumericLiteral) {
            if (strict$873 && lookahead$885.octal) {
                throwErrorTolerant$924(lookahead$885, Messages$868.StrictOctalLiteral);
            }
            return delegate$882.createLiteral(lex$919());
        }
        if (type$1315 === Token$863.Keyword) {
            if (matchKeyword$929('this')) {
                lex$919();
                return delegate$882.createThisExpression();
            }
            if (matchKeyword$929('function')) {
                return parseFunctionExpression$1001();
            }
            if (matchKeyword$929('class')) {
                return parseClassExpression$1006();
            }
            if (matchKeyword$929('super')) {
                lex$919();
                return delegate$882.createIdentifier('super');
            }
        }
        if (type$1315 === Token$863.BooleanLiteral) {
            token$1316 = lex$919();
            token$1316.value = token$1316.value === 'true';
            return delegate$882.createLiteral(token$1316);
        }
        if (type$1315 === Token$863.NullLiteral) {
            token$1316 = lex$919();
            token$1316.value = null;
            return delegate$882.createLiteral(token$1316);
        }
        if (match$928('[')) {
            return parseArrayInitialiser$935();
        }
        if (match$928('{')) {
            return parseObjectInitialiser$940();
        }
        if (match$928('(')) {
            return parseGroupExpression$943();
        }
        if (lookahead$885.type === Token$863.RegularExpression) {
            return delegate$882.createLiteral(lex$919());
        }
        if (type$1315 === Token$863.Template) {
            return parseTemplateLiteral$942();
        }
        return throwUnexpected$925(lex$919());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$945() {
        var args$1318 = [], arg$1319;
        expect$926('(');
        if (!match$928(')')) {
            while (streamIndex$884 < length$881) {
                arg$1319 = parseSpreadOrAssignmentExpression$946();
                args$1318.push(arg$1319);
                if (match$928(')')) {
                    break;
                } else if (arg$1319.type === Syntax$866.SpreadElement) {
                    throwError$923({}, Messages$868.ElementAfterSpreadElement);
                }
                expect$926(',');
            }
        }
        expect$926(')');
        return args$1318;
    }
    function parseSpreadOrAssignmentExpression$946() {
        if (match$928('...')) {
            lex$919();
            return delegate$882.createSpreadElement(parseAssignmentExpression$962());
        }
        return parseAssignmentExpression$962();
    }
    function parseNonComputedProperty$947() {
        var token$1320 = lex$919();
        if (!isIdentifierName$916(token$1320)) {
            throwUnexpected$925(token$1320);
        }
        return delegate$882.createIdentifier(token$1320.value);
    }
    function parseNonComputedMember$948() {
        expect$926('.');
        return parseNonComputedProperty$947();
    }
    function parseComputedMember$949() {
        var expr$1321;
        expect$926('[');
        expr$1321 = parseExpression$963();
        expect$926(']');
        return expr$1321;
    }
    function parseNewExpression$950() {
        var callee$1322, args$1323;
        expectKeyword$927('new');
        callee$1322 = parseLeftHandSideExpression$952();
        args$1323 = match$928('(') ? parseArguments$945() : [];
        return delegate$882.createNewExpression(callee$1322, args$1323);
    }
    function parseLeftHandSideExpressionAllowCall$951() {
        var expr$1324, args$1325, property$1326;
        expr$1324 = matchKeyword$929('new') ? parseNewExpression$950() : parsePrimaryExpression$944();
        while (match$928('.') || match$928('[') || match$928('(') || lookahead$885.type === Token$863.Template) {
            if (match$928('(')) {
                args$1325 = parseArguments$945();
                expr$1324 = delegate$882.createCallExpression(expr$1324, args$1325);
            } else if (match$928('[')) {
                expr$1324 = delegate$882.createMemberExpression('[', expr$1324, parseComputedMember$949());
            } else if (match$928('.')) {
                expr$1324 = delegate$882.createMemberExpression('.', expr$1324, parseNonComputedMember$948());
            } else {
                expr$1324 = delegate$882.createTaggedTemplateExpression(expr$1324, parseTemplateLiteral$942());
            }
        }
        return expr$1324;
    }
    function parseLeftHandSideExpression$952() {
        var expr$1327, property$1328;
        expr$1327 = matchKeyword$929('new') ? parseNewExpression$950() : parsePrimaryExpression$944();
        while (match$928('.') || match$928('[') || lookahead$885.type === Token$863.Template) {
            if (match$928('[')) {
                expr$1327 = delegate$882.createMemberExpression('[', expr$1327, parseComputedMember$949());
            } else if (match$928('.')) {
                expr$1327 = delegate$882.createMemberExpression('.', expr$1327, parseNonComputedMember$948());
            } else {
                expr$1327 = delegate$882.createTaggedTemplateExpression(expr$1327, parseTemplateLiteral$942());
            }
        }
        return expr$1327;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$953() {
        var expr$1329 = parseLeftHandSideExpressionAllowCall$951(), token$1330 = lookahead$885;
        if (lookahead$885.type !== Token$863.Punctuator) {
            return expr$1329;
        }
        if ((match$928('++') || match$928('--')) && !peekLineTerminator$922()) {
            // 11.3.1, 11.3.2
            if (strict$873 && expr$1329.type === Syntax$866.Identifier && isRestrictedWord$900(expr$1329.name)) {
                throwErrorTolerant$924({}, Messages$868.StrictLHSPostfix);
            }
            if (!isLeftHandSide$933(expr$1329)) {
                throwError$923({}, Messages$868.InvalidLHSInAssignment);
            }
            token$1330 = lex$919();
            expr$1329 = delegate$882.createPostfixExpression(token$1330.value, expr$1329);
        }
        return expr$1329;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$954() {
        var token$1331, expr$1332;
        if (lookahead$885.type !== Token$863.Punctuator && lookahead$885.type !== Token$863.Keyword) {
            return parsePostfixExpression$953();
        }
        if (match$928('++') || match$928('--')) {
            token$1331 = lex$919();
            expr$1332 = parseUnaryExpression$954();
            // 11.4.4, 11.4.5
            if (strict$873 && expr$1332.type === Syntax$866.Identifier && isRestrictedWord$900(expr$1332.name)) {
                throwErrorTolerant$924({}, Messages$868.StrictLHSPrefix);
            }
            if (!isLeftHandSide$933(expr$1332)) {
                throwError$923({}, Messages$868.InvalidLHSInAssignment);
            }
            return delegate$882.createUnaryExpression(token$1331.value, expr$1332);
        }
        if (match$928('+') || match$928('-') || match$928('~') || match$928('!')) {
            token$1331 = lex$919();
            expr$1332 = parseUnaryExpression$954();
            return delegate$882.createUnaryExpression(token$1331.value, expr$1332);
        }
        if (matchKeyword$929('delete') || matchKeyword$929('void') || matchKeyword$929('typeof')) {
            token$1331 = lex$919();
            expr$1332 = parseUnaryExpression$954();
            expr$1332 = delegate$882.createUnaryExpression(token$1331.value, expr$1332);
            if (strict$873 && expr$1332.operator === 'delete' && expr$1332.argument.type === Syntax$866.Identifier) {
                throwErrorTolerant$924({}, Messages$868.StrictDelete);
            }
            return expr$1332;
        }
        return parsePostfixExpression$953();
    }
    function binaryPrecedence$955(token$1333, allowIn$1334) {
        var prec$1335 = 0;
        if (token$1333.type !== Token$863.Punctuator && token$1333.type !== Token$863.Keyword) {
            return 0;
        }
        switch (token$1333.value) {
        case '||':
            prec$1335 = 1;
            break;
        case '&&':
            prec$1335 = 2;
            break;
        case '|':
            prec$1335 = 3;
            break;
        case '^':
            prec$1335 = 4;
            break;
        case '&':
            prec$1335 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1335 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1335 = 7;
            break;
        case 'in':
            prec$1335 = allowIn$1334 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1335 = 8;
            break;
        case '+':
        case '-':
            prec$1335 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1335 = 11;
            break;
        default:
            break;
        }
        return prec$1335;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$956() {
        var expr$1336, token$1337, prec$1338, previousAllowIn$1339, stack$1340, right$1341, operator$1342, left$1343, i$1344;
        previousAllowIn$1339 = state$887.allowIn;
        state$887.allowIn = true;
        expr$1336 = parseUnaryExpression$954();
        token$1337 = lookahead$885;
        prec$1338 = binaryPrecedence$955(token$1337, previousAllowIn$1339);
        if (prec$1338 === 0) {
            return expr$1336;
        }
        token$1337.prec = prec$1338;
        lex$919();
        stack$1340 = [
            expr$1336,
            token$1337,
            parseUnaryExpression$954()
        ];
        while ((prec$1338 = binaryPrecedence$955(lookahead$885, previousAllowIn$1339)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1340.length > 2 && prec$1338 <= stack$1340[stack$1340.length - 2].prec) {
                right$1341 = stack$1340.pop();
                operator$1342 = stack$1340.pop().value;
                left$1343 = stack$1340.pop();
                stack$1340.push(delegate$882.createBinaryExpression(operator$1342, left$1343, right$1341));
            }
            // Shift.
            token$1337 = lex$919();
            token$1337.prec = prec$1338;
            stack$1340.push(token$1337);
            stack$1340.push(parseUnaryExpression$954());
        }
        state$887.allowIn = previousAllowIn$1339;
        // Final reduce to clean-up the stack.
        i$1344 = stack$1340.length - 1;
        expr$1336 = stack$1340[i$1344];
        while (i$1344 > 1) {
            expr$1336 = delegate$882.createBinaryExpression(stack$1340[i$1344 - 1].value, stack$1340[i$1344 - 2], expr$1336);
            i$1344 -= 2;
        }
        return expr$1336;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$957() {
        var expr$1345, previousAllowIn$1346, consequent$1347, alternate$1348;
        expr$1345 = parseBinaryExpression$956();
        if (match$928('?')) {
            lex$919();
            previousAllowIn$1346 = state$887.allowIn;
            state$887.allowIn = true;
            consequent$1347 = parseAssignmentExpression$962();
            state$887.allowIn = previousAllowIn$1346;
            expect$926(':');
            alternate$1348 = parseAssignmentExpression$962();
            expr$1345 = delegate$882.createConditionalExpression(expr$1345, consequent$1347, alternate$1348);
        }
        return expr$1345;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$958(expr$1349) {
        var i$1350, len$1351, property$1352, element$1353;
        if (expr$1349.type === Syntax$866.ObjectExpression) {
            expr$1349.type = Syntax$866.ObjectPattern;
            for (i$1350 = 0, len$1351 = expr$1349.properties.length; i$1350 < len$1351; i$1350 += 1) {
                property$1352 = expr$1349.properties[i$1350];
                if (property$1352.kind !== 'init') {
                    throwError$923({}, Messages$868.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$958(property$1352.value);
            }
        } else if (expr$1349.type === Syntax$866.ArrayExpression) {
            expr$1349.type = Syntax$866.ArrayPattern;
            for (i$1350 = 0, len$1351 = expr$1349.elements.length; i$1350 < len$1351; i$1350 += 1) {
                element$1353 = expr$1349.elements[i$1350];
                if (element$1353) {
                    reinterpretAsAssignmentBindingPattern$958(element$1353);
                }
            }
        } else if (expr$1349.type === Syntax$866.Identifier) {
            if (isRestrictedWord$900(expr$1349.name)) {
                throwError$923({}, Messages$868.InvalidLHSInAssignment);
            }
        } else if (expr$1349.type === Syntax$866.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$958(expr$1349.argument);
            if (expr$1349.argument.type === Syntax$866.ObjectPattern) {
                throwError$923({}, Messages$868.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1349.type !== Syntax$866.MemberExpression && expr$1349.type !== Syntax$866.CallExpression && expr$1349.type !== Syntax$866.NewExpression) {
                throwError$923({}, Messages$868.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$959(options$1354, expr$1355) {
        var i$1356, len$1357, property$1358, element$1359;
        if (expr$1355.type === Syntax$866.ObjectExpression) {
            expr$1355.type = Syntax$866.ObjectPattern;
            for (i$1356 = 0, len$1357 = expr$1355.properties.length; i$1356 < len$1357; i$1356 += 1) {
                property$1358 = expr$1355.properties[i$1356];
                if (property$1358.kind !== 'init') {
                    throwError$923({}, Messages$868.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$959(options$1354, property$1358.value);
            }
        } else if (expr$1355.type === Syntax$866.ArrayExpression) {
            expr$1355.type = Syntax$866.ArrayPattern;
            for (i$1356 = 0, len$1357 = expr$1355.elements.length; i$1356 < len$1357; i$1356 += 1) {
                element$1359 = expr$1355.elements[i$1356];
                if (element$1359) {
                    reinterpretAsDestructuredParameter$959(options$1354, element$1359);
                }
            }
        } else if (expr$1355.type === Syntax$866.Identifier) {
            validateParam$997(options$1354, expr$1355, expr$1355.name);
        } else {
            if (expr$1355.type !== Syntax$866.MemberExpression) {
                throwError$923({}, Messages$868.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$960(expressions$1360) {
        var i$1361, len$1362, param$1363, params$1364, defaults$1365, defaultCount$1366, options$1367, rest$1368;
        params$1364 = [];
        defaults$1365 = [];
        defaultCount$1366 = 0;
        rest$1368 = null;
        options$1367 = { paramSet: {} };
        for (i$1361 = 0, len$1362 = expressions$1360.length; i$1361 < len$1362; i$1361 += 1) {
            param$1363 = expressions$1360[i$1361];
            if (param$1363.type === Syntax$866.Identifier) {
                params$1364.push(param$1363);
                defaults$1365.push(null);
                validateParam$997(options$1367, param$1363, param$1363.name);
            } else if (param$1363.type === Syntax$866.ObjectExpression || param$1363.type === Syntax$866.ArrayExpression) {
                reinterpretAsDestructuredParameter$959(options$1367, param$1363);
                params$1364.push(param$1363);
                defaults$1365.push(null);
            } else if (param$1363.type === Syntax$866.SpreadElement) {
                assert$889(i$1361 === len$1362 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$959(options$1367, param$1363.argument);
                rest$1368 = param$1363.argument;
            } else if (param$1363.type === Syntax$866.AssignmentExpression) {
                params$1364.push(param$1363.left);
                defaults$1365.push(param$1363.right);
                ++defaultCount$1366;
                validateParam$997(options$1367, param$1363.left, param$1363.left.name);
            } else {
                return null;
            }
        }
        if (options$1367.message === Messages$868.StrictParamDupe) {
            throwError$923(strict$873 ? options$1367.stricted : options$1367.firstRestricted, options$1367.message);
        }
        if (defaultCount$1366 === 0) {
            defaults$1365 = [];
        }
        return {
            params: params$1364,
            defaults: defaults$1365,
            rest: rest$1368,
            stricted: options$1367.stricted,
            firstRestricted: options$1367.firstRestricted,
            message: options$1367.message
        };
    }
    function parseArrowFunctionExpression$961(options$1369) {
        var previousStrict$1370, previousYieldAllowed$1371, body$1372;
        expect$926('=>');
        previousStrict$1370 = strict$873;
        previousYieldAllowed$1371 = state$887.yieldAllowed;
        state$887.yieldAllowed = false;
        body$1372 = parseConciseBody$995();
        if (strict$873 && options$1369.firstRestricted) {
            throwError$923(options$1369.firstRestricted, options$1369.message);
        }
        if (strict$873 && options$1369.stricted) {
            throwErrorTolerant$924(options$1369.stricted, options$1369.message);
        }
        strict$873 = previousStrict$1370;
        state$887.yieldAllowed = previousYieldAllowed$1371;
        return delegate$882.createArrowFunctionExpression(options$1369.params, options$1369.defaults, body$1372, options$1369.rest, body$1372.type !== Syntax$866.BlockStatement);
    }
    function parseAssignmentExpression$962() {
        var expr$1373, token$1374, params$1375, oldParenthesizedCount$1376;
        if (matchKeyword$929('yield')) {
            return parseYieldExpression$1002();
        }
        oldParenthesizedCount$1376 = state$887.parenthesizedCount;
        if (match$928('(')) {
            token$1374 = lookahead2$921();
            if (token$1374.type === Token$863.Punctuator && token$1374.value === ')' || token$1374.value === '...') {
                params$1375 = parseParams$999();
                if (!match$928('=>')) {
                    throwUnexpected$925(lex$919());
                }
                return parseArrowFunctionExpression$961(params$1375);
            }
        }
        token$1374 = lookahead$885;
        expr$1373 = parseConditionalExpression$957();
        if (match$928('=>') && (state$887.parenthesizedCount === oldParenthesizedCount$1376 || state$887.parenthesizedCount === oldParenthesizedCount$1376 + 1)) {
            if (expr$1373.type === Syntax$866.Identifier) {
                params$1375 = reinterpretAsCoverFormalsList$960([expr$1373]);
            } else if (expr$1373.type === Syntax$866.SequenceExpression) {
                params$1375 = reinterpretAsCoverFormalsList$960(expr$1373.expressions);
            }
            if (params$1375) {
                return parseArrowFunctionExpression$961(params$1375);
            }
        }
        if (matchAssign$931()) {
            // 11.13.1
            if (strict$873 && expr$1373.type === Syntax$866.Identifier && isRestrictedWord$900(expr$1373.name)) {
                throwErrorTolerant$924(token$1374, Messages$868.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$928('=') && (expr$1373.type === Syntax$866.ObjectExpression || expr$1373.type === Syntax$866.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$958(expr$1373);
            } else if (!isLeftHandSide$933(expr$1373)) {
                throwError$923({}, Messages$868.InvalidLHSInAssignment);
            }
            expr$1373 = delegate$882.createAssignmentExpression(lex$919().value, expr$1373, parseAssignmentExpression$962());
        }
        return expr$1373;
    }
    // 11.14 Comma Operator
    function parseExpression$963() {
        var expr$1377, expressions$1378, sequence$1379, coverFormalsList$1380, spreadFound$1381, oldParenthesizedCount$1382;
        oldParenthesizedCount$1382 = state$887.parenthesizedCount;
        expr$1377 = parseAssignmentExpression$962();
        expressions$1378 = [expr$1377];
        if (match$928(',')) {
            while (streamIndex$884 < length$881) {
                if (!match$928(',')) {
                    break;
                }
                lex$919();
                expr$1377 = parseSpreadOrAssignmentExpression$946();
                expressions$1378.push(expr$1377);
                if (expr$1377.type === Syntax$866.SpreadElement) {
                    spreadFound$1381 = true;
                    if (!match$928(')')) {
                        throwError$923({}, Messages$868.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1379 = delegate$882.createSequenceExpression(expressions$1378);
        }
        if (match$928('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$887.parenthesizedCount === oldParenthesizedCount$1382 || state$887.parenthesizedCount === oldParenthesizedCount$1382 + 1) {
                expr$1377 = expr$1377.type === Syntax$866.SequenceExpression ? expr$1377.expressions : expressions$1378;
                coverFormalsList$1380 = reinterpretAsCoverFormalsList$960(expr$1377);
                if (coverFormalsList$1380) {
                    return parseArrowFunctionExpression$961(coverFormalsList$1380);
                }
            }
            throwUnexpected$925(lex$919());
        }
        if (spreadFound$1381 && lookahead2$921().value !== '=>') {
            throwError$923({}, Messages$868.IllegalSpread);
        }
        return sequence$1379 || expr$1377;
    }
    // 12.1 Block
    function parseStatementList$964() {
        var list$1383 = [], statement$1384;
        while (streamIndex$884 < length$881) {
            if (match$928('}')) {
                break;
            }
            statement$1384 = parseSourceElement$1009();
            if (typeof statement$1384 === 'undefined') {
                break;
            }
            list$1383.push(statement$1384);
        }
        return list$1383;
    }
    function parseBlock$965() {
        var block$1385;
        expect$926('{');
        block$1385 = parseStatementList$964();
        expect$926('}');
        return delegate$882.createBlockStatement(block$1385);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$966() {
        var token$1386 = lookahead$885, resolvedIdent$1387;
        if (token$1386.type !== Token$863.Identifier) {
            throwUnexpected$925(token$1386);
        }
        resolvedIdent$1387 = expander$862.resolve(tokenStream$883[lookaheadIndex$886]);
        lex$919();
        return delegate$882.createIdentifier(resolvedIdent$1387);
    }
    function parseVariableDeclaration$967(kind$1388) {
        var id$1389, init$1390 = null;
        if (match$928('{')) {
            id$1389 = parseObjectInitialiser$940();
            reinterpretAsAssignmentBindingPattern$958(id$1389);
        } else if (match$928('[')) {
            id$1389 = parseArrayInitialiser$935();
            reinterpretAsAssignmentBindingPattern$958(id$1389);
        } else {
            id$1389 = state$887.allowKeyword ? parseNonComputedProperty$947() : parseVariableIdentifier$966();
            // 12.2.1
            if (strict$873 && isRestrictedWord$900(id$1389.name)) {
                throwErrorTolerant$924({}, Messages$868.StrictVarName);
            }
        }
        if (kind$1388 === 'const') {
            if (!match$928('=')) {
                throwError$923({}, Messages$868.NoUnintializedConst);
            }
            expect$926('=');
            init$1390 = parseAssignmentExpression$962();
        } else if (match$928('=')) {
            lex$919();
            init$1390 = parseAssignmentExpression$962();
        }
        return delegate$882.createVariableDeclarator(id$1389, init$1390);
    }
    function parseVariableDeclarationList$968(kind$1391) {
        var list$1392 = [];
        do {
            list$1392.push(parseVariableDeclaration$967(kind$1391));
            if (!match$928(',')) {
                break;
            }
            lex$919();
        } while (streamIndex$884 < length$881);
        return list$1392;
    }
    function parseVariableStatement$969() {
        var declarations$1393;
        expectKeyword$927('var');
        declarations$1393 = parseVariableDeclarationList$968();
        consumeSemicolon$932();
        return delegate$882.createVariableDeclaration(declarations$1393, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$970(kind$1394) {
        var declarations$1395;
        expectKeyword$927(kind$1394);
        declarations$1395 = parseVariableDeclarationList$968(kind$1394);
        consumeSemicolon$932();
        return delegate$882.createVariableDeclaration(declarations$1395, kind$1394);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$971() {
        var id$1396, src$1397, body$1398;
        lex$919();
        // 'module'
        if (peekLineTerminator$922()) {
            throwError$923({}, Messages$868.NewlineAfterModule);
        }
        switch (lookahead$885.type) {
        case Token$863.StringLiteral:
            id$1396 = parsePrimaryExpression$944();
            body$1398 = parseModuleBlock$1014();
            src$1397 = null;
            break;
        case Token$863.Identifier:
            id$1396 = parseVariableIdentifier$966();
            body$1398 = null;
            if (!matchContextualKeyword$930('from')) {
                throwUnexpected$925(lex$919());
            }
            lex$919();
            src$1397 = parsePrimaryExpression$944();
            if (src$1397.type !== Syntax$866.Literal) {
                throwError$923({}, Messages$868.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$932();
        return delegate$882.createModuleDeclaration(id$1396, src$1397, body$1398);
    }
    function parseExportBatchSpecifier$972() {
        expect$926('*');
        return delegate$882.createExportBatchSpecifier();
    }
    function parseExportSpecifier$973() {
        var id$1399, name$1400 = null;
        id$1399 = parseVariableIdentifier$966();
        if (matchContextualKeyword$930('as')) {
            lex$919();
            name$1400 = parseNonComputedProperty$947();
        }
        return delegate$882.createExportSpecifier(id$1399, name$1400);
    }
    function parseExportDeclaration$974() {
        var previousAllowKeyword$1401, decl$1402, def$1403, src$1404, specifiers$1405;
        expectKeyword$927('export');
        if (lookahead$885.type === Token$863.Keyword) {
            switch (lookahead$885.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$882.createExportDeclaration(parseSourceElement$1009(), null, null);
            }
        }
        if (isIdentifierName$916(lookahead$885)) {
            previousAllowKeyword$1401 = state$887.allowKeyword;
            state$887.allowKeyword = true;
            decl$1402 = parseVariableDeclarationList$968('let');
            state$887.allowKeyword = previousAllowKeyword$1401;
            return delegate$882.createExportDeclaration(decl$1402, null, null);
        }
        specifiers$1405 = [];
        src$1404 = null;
        if (match$928('*')) {
            specifiers$1405.push(parseExportBatchSpecifier$972());
        } else {
            expect$926('{');
            do {
                specifiers$1405.push(parseExportSpecifier$973());
            } while (match$928(',') && lex$919());
            expect$926('}');
        }
        if (matchContextualKeyword$930('from')) {
            lex$919();
            src$1404 = parsePrimaryExpression$944();
            if (src$1404.type !== Syntax$866.Literal) {
                throwError$923({}, Messages$868.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$932();
        return delegate$882.createExportDeclaration(null, specifiers$1405, src$1404);
    }
    function parseImportDeclaration$975() {
        var specifiers$1406, kind$1407, src$1408;
        expectKeyword$927('import');
        specifiers$1406 = [];
        if (isIdentifierName$916(lookahead$885)) {
            kind$1407 = 'default';
            specifiers$1406.push(parseImportSpecifier$976());
            if (!matchContextualKeyword$930('from')) {
                throwError$923({}, Messages$868.NoFromAfterImport);
            }
            lex$919();
        } else if (match$928('{')) {
            kind$1407 = 'named';
            lex$919();
            do {
                specifiers$1406.push(parseImportSpecifier$976());
            } while (match$928(',') && lex$919());
            expect$926('}');
            if (!matchContextualKeyword$930('from')) {
                throwError$923({}, Messages$868.NoFromAfterImport);
            }
            lex$919();
        }
        src$1408 = parsePrimaryExpression$944();
        if (src$1408.type !== Syntax$866.Literal) {
            throwError$923({}, Messages$868.InvalidModuleSpecifier);
        }
        consumeSemicolon$932();
        return delegate$882.createImportDeclaration(specifiers$1406, kind$1407, src$1408);
    }
    function parseImportSpecifier$976() {
        var id$1409, name$1410 = null;
        id$1409 = parseNonComputedProperty$947();
        if (matchContextualKeyword$930('as')) {
            lex$919();
            name$1410 = parseVariableIdentifier$966();
        }
        return delegate$882.createImportSpecifier(id$1409, name$1410);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$977() {
        expect$926(';');
        return delegate$882.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$978() {
        var expr$1411 = parseExpression$963();
        consumeSemicolon$932();
        return delegate$882.createExpressionStatement(expr$1411);
    }
    // 12.5 If statement
    function parseIfStatement$979() {
        var test$1412, consequent$1413, alternate$1414;
        expectKeyword$927('if');
        expect$926('(');
        test$1412 = parseExpression$963();
        expect$926(')');
        consequent$1413 = parseStatement$994();
        if (matchKeyword$929('else')) {
            lex$919();
            alternate$1414 = parseStatement$994();
        } else {
            alternate$1414 = null;
        }
        return delegate$882.createIfStatement(test$1412, consequent$1413, alternate$1414);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$980() {
        var body$1415, test$1416, oldInIteration$1417;
        expectKeyword$927('do');
        oldInIteration$1417 = state$887.inIteration;
        state$887.inIteration = true;
        body$1415 = parseStatement$994();
        state$887.inIteration = oldInIteration$1417;
        expectKeyword$927('while');
        expect$926('(');
        test$1416 = parseExpression$963();
        expect$926(')');
        if (match$928(';')) {
            lex$919();
        }
        return delegate$882.createDoWhileStatement(body$1415, test$1416);
    }
    function parseWhileStatement$981() {
        var test$1418, body$1419, oldInIteration$1420;
        expectKeyword$927('while');
        expect$926('(');
        test$1418 = parseExpression$963();
        expect$926(')');
        oldInIteration$1420 = state$887.inIteration;
        state$887.inIteration = true;
        body$1419 = parseStatement$994();
        state$887.inIteration = oldInIteration$1420;
        return delegate$882.createWhileStatement(test$1418, body$1419);
    }
    function parseForVariableDeclaration$982() {
        var token$1421 = lex$919(), declarations$1422 = parseVariableDeclarationList$968();
        return delegate$882.createVariableDeclaration(declarations$1422, token$1421.value);
    }
    function parseForStatement$983(opts$1423) {
        var init$1424, test$1425, update$1426, left$1427, right$1428, body$1429, operator$1430, oldInIteration$1431;
        init$1424 = test$1425 = update$1426 = null;
        expectKeyword$927('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$930('each')) {
            throwError$923({}, Messages$868.EachNotAllowed);
        }
        expect$926('(');
        if (match$928(';')) {
            lex$919();
        } else {
            if (matchKeyword$929('var') || matchKeyword$929('let') || matchKeyword$929('const')) {
                state$887.allowIn = false;
                init$1424 = parseForVariableDeclaration$982();
                state$887.allowIn = true;
                if (init$1424.declarations.length === 1) {
                    if (matchKeyword$929('in') || matchContextualKeyword$930('of')) {
                        operator$1430 = lookahead$885;
                        if (!((operator$1430.value === 'in' || init$1424.kind !== 'var') && init$1424.declarations[0].init)) {
                            lex$919();
                            left$1427 = init$1424;
                            right$1428 = parseExpression$963();
                            init$1424 = null;
                        }
                    }
                }
            } else {
                state$887.allowIn = false;
                init$1424 = parseExpression$963();
                state$887.allowIn = true;
                if (matchContextualKeyword$930('of')) {
                    operator$1430 = lex$919();
                    left$1427 = init$1424;
                    right$1428 = parseExpression$963();
                    init$1424 = null;
                } else if (matchKeyword$929('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$934(init$1424)) {
                        throwError$923({}, Messages$868.InvalidLHSInForIn);
                    }
                    operator$1430 = lex$919();
                    left$1427 = init$1424;
                    right$1428 = parseExpression$963();
                    init$1424 = null;
                }
            }
            if (typeof left$1427 === 'undefined') {
                expect$926(';');
            }
        }
        if (typeof left$1427 === 'undefined') {
            if (!match$928(';')) {
                test$1425 = parseExpression$963();
            }
            expect$926(';');
            if (!match$928(')')) {
                update$1426 = parseExpression$963();
            }
        }
        expect$926(')');
        oldInIteration$1431 = state$887.inIteration;
        state$887.inIteration = true;
        if (!(opts$1423 !== undefined && opts$1423.ignoreBody)) {
            body$1429 = parseStatement$994();
        }
        state$887.inIteration = oldInIteration$1431;
        if (typeof left$1427 === 'undefined') {
            return delegate$882.createForStatement(init$1424, test$1425, update$1426, body$1429);
        }
        if (operator$1430.value === 'in') {
            return delegate$882.createForInStatement(left$1427, right$1428, body$1429);
        }
        return delegate$882.createForOfStatement(left$1427, right$1428, body$1429);
    }
    // 12.7 The continue statement
    function parseContinueStatement$984() {
        var label$1432 = null, key$1433;
        expectKeyword$927('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$885.value.charCodeAt(0) === 59) {
            lex$919();
            if (!state$887.inIteration) {
                throwError$923({}, Messages$868.IllegalContinue);
            }
            return delegate$882.createContinueStatement(null);
        }
        if (peekLineTerminator$922()) {
            if (!state$887.inIteration) {
                throwError$923({}, Messages$868.IllegalContinue);
            }
            return delegate$882.createContinueStatement(null);
        }
        if (lookahead$885.type === Token$863.Identifier) {
            label$1432 = parseVariableIdentifier$966();
            key$1433 = '$' + label$1432.name;
            if (!Object.prototype.hasOwnProperty.call(state$887.labelSet, key$1433)) {
                throwError$923({}, Messages$868.UnknownLabel, label$1432.name);
            }
        }
        consumeSemicolon$932();
        if (label$1432 === null && !state$887.inIteration) {
            throwError$923({}, Messages$868.IllegalContinue);
        }
        return delegate$882.createContinueStatement(label$1432);
    }
    // 12.8 The break statement
    function parseBreakStatement$985() {
        var label$1434 = null, key$1435;
        expectKeyword$927('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$885.value.charCodeAt(0) === 59) {
            lex$919();
            if (!(state$887.inIteration || state$887.inSwitch)) {
                throwError$923({}, Messages$868.IllegalBreak);
            }
            return delegate$882.createBreakStatement(null);
        }
        if (peekLineTerminator$922()) {
            if (!(state$887.inIteration || state$887.inSwitch)) {
                throwError$923({}, Messages$868.IllegalBreak);
            }
            return delegate$882.createBreakStatement(null);
        }
        if (lookahead$885.type === Token$863.Identifier) {
            label$1434 = parseVariableIdentifier$966();
            key$1435 = '$' + label$1434.name;
            if (!Object.prototype.hasOwnProperty.call(state$887.labelSet, key$1435)) {
                throwError$923({}, Messages$868.UnknownLabel, label$1434.name);
            }
        }
        consumeSemicolon$932();
        if (label$1434 === null && !(state$887.inIteration || state$887.inSwitch)) {
            throwError$923({}, Messages$868.IllegalBreak);
        }
        return delegate$882.createBreakStatement(label$1434);
    }
    // 12.9 The return statement
    function parseReturnStatement$986() {
        var argument$1436 = null;
        expectKeyword$927('return');
        if (!state$887.inFunctionBody) {
            throwErrorTolerant$924({}, Messages$868.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$896(String(lookahead$885.value).charCodeAt(0))) {
            argument$1436 = parseExpression$963();
            consumeSemicolon$932();
            return delegate$882.createReturnStatement(argument$1436);
        }
        if (peekLineTerminator$922()) {
            return delegate$882.createReturnStatement(null);
        }
        if (!match$928(';')) {
            if (!match$928('}') && lookahead$885.type !== Token$863.EOF) {
                argument$1436 = parseExpression$963();
            }
        }
        consumeSemicolon$932();
        return delegate$882.createReturnStatement(argument$1436);
    }
    // 12.10 The with statement
    function parseWithStatement$987() {
        var object$1437, body$1438;
        if (strict$873) {
            throwErrorTolerant$924({}, Messages$868.StrictModeWith);
        }
        expectKeyword$927('with');
        expect$926('(');
        object$1437 = parseExpression$963();
        expect$926(')');
        body$1438 = parseStatement$994();
        return delegate$882.createWithStatement(object$1437, body$1438);
    }
    // 12.10 The swith statement
    function parseSwitchCase$988() {
        var test$1439, consequent$1440 = [], sourceElement$1441;
        if (matchKeyword$929('default')) {
            lex$919();
            test$1439 = null;
        } else {
            expectKeyword$927('case');
            test$1439 = parseExpression$963();
        }
        expect$926(':');
        while (streamIndex$884 < length$881) {
            if (match$928('}') || matchKeyword$929('default') || matchKeyword$929('case')) {
                break;
            }
            sourceElement$1441 = parseSourceElement$1009();
            if (typeof sourceElement$1441 === 'undefined') {
                break;
            }
            consequent$1440.push(sourceElement$1441);
        }
        return delegate$882.createSwitchCase(test$1439, consequent$1440);
    }
    function parseSwitchStatement$989() {
        var discriminant$1442, cases$1443, clause$1444, oldInSwitch$1445, defaultFound$1446;
        expectKeyword$927('switch');
        expect$926('(');
        discriminant$1442 = parseExpression$963();
        expect$926(')');
        expect$926('{');
        cases$1443 = [];
        if (match$928('}')) {
            lex$919();
            return delegate$882.createSwitchStatement(discriminant$1442, cases$1443);
        }
        oldInSwitch$1445 = state$887.inSwitch;
        state$887.inSwitch = true;
        defaultFound$1446 = false;
        while (streamIndex$884 < length$881) {
            if (match$928('}')) {
                break;
            }
            clause$1444 = parseSwitchCase$988();
            if (clause$1444.test === null) {
                if (defaultFound$1446) {
                    throwError$923({}, Messages$868.MultipleDefaultsInSwitch);
                }
                defaultFound$1446 = true;
            }
            cases$1443.push(clause$1444);
        }
        state$887.inSwitch = oldInSwitch$1445;
        expect$926('}');
        return delegate$882.createSwitchStatement(discriminant$1442, cases$1443);
    }
    // 12.13 The throw statement
    function parseThrowStatement$990() {
        var argument$1447;
        expectKeyword$927('throw');
        if (peekLineTerminator$922()) {
            throwError$923({}, Messages$868.NewlineAfterThrow);
        }
        argument$1447 = parseExpression$963();
        consumeSemicolon$932();
        return delegate$882.createThrowStatement(argument$1447);
    }
    // 12.14 The try statement
    function parseCatchClause$991() {
        var param$1448, body$1449;
        expectKeyword$927('catch');
        expect$926('(');
        if (match$928(')')) {
            throwUnexpected$925(lookahead$885);
        }
        param$1448 = parseExpression$963();
        // 12.14.1
        if (strict$873 && param$1448.type === Syntax$866.Identifier && isRestrictedWord$900(param$1448.name)) {
            throwErrorTolerant$924({}, Messages$868.StrictCatchVariable);
        }
        expect$926(')');
        body$1449 = parseBlock$965();
        return delegate$882.createCatchClause(param$1448, body$1449);
    }
    function parseTryStatement$992() {
        var block$1450, handlers$1451 = [], finalizer$1452 = null;
        expectKeyword$927('try');
        block$1450 = parseBlock$965();
        if (matchKeyword$929('catch')) {
            handlers$1451.push(parseCatchClause$991());
        }
        if (matchKeyword$929('finally')) {
            lex$919();
            finalizer$1452 = parseBlock$965();
        }
        if (handlers$1451.length === 0 && !finalizer$1452) {
            throwError$923({}, Messages$868.NoCatchOrFinally);
        }
        return delegate$882.createTryStatement(block$1450, [], handlers$1451, finalizer$1452);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$993() {
        expectKeyword$927('debugger');
        consumeSemicolon$932();
        return delegate$882.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$994() {
        var type$1453 = lookahead$885.type, expr$1454, labeledBody$1455, key$1456;
        if (type$1453 === Token$863.EOF) {
            throwUnexpected$925(lookahead$885);
        }
        if (type$1453 === Token$863.Punctuator) {
            switch (lookahead$885.value) {
            case ';':
                return parseEmptyStatement$977();
            case '{':
                return parseBlock$965();
            case '(':
                return parseExpressionStatement$978();
            default:
                break;
            }
        }
        if (type$1453 === Token$863.Keyword) {
            switch (lookahead$885.value) {
            case 'break':
                return parseBreakStatement$985();
            case 'continue':
                return parseContinueStatement$984();
            case 'debugger':
                return parseDebuggerStatement$993();
            case 'do':
                return parseDoWhileStatement$980();
            case 'for':
                return parseForStatement$983();
            case 'function':
                return parseFunctionDeclaration$1000();
            case 'class':
                return parseClassDeclaration$1007();
            case 'if':
                return parseIfStatement$979();
            case 'return':
                return parseReturnStatement$986();
            case 'switch':
                return parseSwitchStatement$989();
            case 'throw':
                return parseThrowStatement$990();
            case 'try':
                return parseTryStatement$992();
            case 'var':
                return parseVariableStatement$969();
            case 'while':
                return parseWhileStatement$981();
            case 'with':
                return parseWithStatement$987();
            default:
                break;
            }
        }
        expr$1454 = parseExpression$963();
        // 12.12 Labelled Statements
        if (expr$1454.type === Syntax$866.Identifier && match$928(':')) {
            lex$919();
            key$1456 = '$' + expr$1454.name;
            if (Object.prototype.hasOwnProperty.call(state$887.labelSet, key$1456)) {
                throwError$923({}, Messages$868.Redeclaration, 'Label', expr$1454.name);
            }
            state$887.labelSet[key$1456] = true;
            labeledBody$1455 = parseStatement$994();
            delete state$887.labelSet[key$1456];
            return delegate$882.createLabeledStatement(expr$1454, labeledBody$1455);
        }
        consumeSemicolon$932();
        return delegate$882.createExpressionStatement(expr$1454);
    }
    // 13 Function Definition
    function parseConciseBody$995() {
        if (match$928('{')) {
            return parseFunctionSourceElements$996();
        }
        return parseAssignmentExpression$962();
    }
    function parseFunctionSourceElements$996() {
        var sourceElement$1457, sourceElements$1458 = [], token$1459, directive$1460, firstRestricted$1461, oldLabelSet$1462, oldInIteration$1463, oldInSwitch$1464, oldInFunctionBody$1465, oldParenthesizedCount$1466;
        expect$926('{');
        while (streamIndex$884 < length$881) {
            if (lookahead$885.type !== Token$863.StringLiteral) {
                break;
            }
            token$1459 = lookahead$885;
            sourceElement$1457 = parseSourceElement$1009();
            sourceElements$1458.push(sourceElement$1457);
            if (sourceElement$1457.expression.type !== Syntax$866.Literal) {
                // this is not directive
                break;
            }
            directive$1460 = token$1459.value;
            if (directive$1460 === 'use strict') {
                strict$873 = true;
                if (firstRestricted$1461) {
                    throwErrorTolerant$924(firstRestricted$1461, Messages$868.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1461 && token$1459.octal) {
                    firstRestricted$1461 = token$1459;
                }
            }
        }
        oldLabelSet$1462 = state$887.labelSet;
        oldInIteration$1463 = state$887.inIteration;
        oldInSwitch$1464 = state$887.inSwitch;
        oldInFunctionBody$1465 = state$887.inFunctionBody;
        oldParenthesizedCount$1466 = state$887.parenthesizedCount;
        state$887.labelSet = {};
        state$887.inIteration = false;
        state$887.inSwitch = false;
        state$887.inFunctionBody = true;
        state$887.parenthesizedCount = 0;
        while (streamIndex$884 < length$881) {
            if (match$928('}')) {
                break;
            }
            sourceElement$1457 = parseSourceElement$1009();
            if (typeof sourceElement$1457 === 'undefined') {
                break;
            }
            sourceElements$1458.push(sourceElement$1457);
        }
        expect$926('}');
        state$887.labelSet = oldLabelSet$1462;
        state$887.inIteration = oldInIteration$1463;
        state$887.inSwitch = oldInSwitch$1464;
        state$887.inFunctionBody = oldInFunctionBody$1465;
        state$887.parenthesizedCount = oldParenthesizedCount$1466;
        return delegate$882.createBlockStatement(sourceElements$1458);
    }
    function validateParam$997(options$1467, param$1468, name$1469) {
        var key$1470 = '$' + name$1469;
        if (strict$873) {
            if (isRestrictedWord$900(name$1469)) {
                options$1467.stricted = param$1468;
                options$1467.message = Messages$868.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1467.paramSet, key$1470)) {
                options$1467.stricted = param$1468;
                options$1467.message = Messages$868.StrictParamDupe;
            }
        } else if (!options$1467.firstRestricted) {
            if (isRestrictedWord$900(name$1469)) {
                options$1467.firstRestricted = param$1468;
                options$1467.message = Messages$868.StrictParamName;
            } else if (isStrictModeReservedWord$899(name$1469)) {
                options$1467.firstRestricted = param$1468;
                options$1467.message = Messages$868.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1467.paramSet, key$1470)) {
                options$1467.firstRestricted = param$1468;
                options$1467.message = Messages$868.StrictParamDupe;
            }
        }
        options$1467.paramSet[key$1470] = true;
    }
    function parseParam$998(options$1471) {
        var token$1472, rest$1473, param$1474, def$1475;
        token$1472 = lookahead$885;
        if (token$1472.value === '...') {
            token$1472 = lex$919();
            rest$1473 = true;
        }
        if (match$928('[')) {
            param$1474 = parseArrayInitialiser$935();
            reinterpretAsDestructuredParameter$959(options$1471, param$1474);
        } else if (match$928('{')) {
            if (rest$1473) {
                throwError$923({}, Messages$868.ObjectPatternAsRestParameter);
            }
            param$1474 = parseObjectInitialiser$940();
            reinterpretAsDestructuredParameter$959(options$1471, param$1474);
        } else {
            param$1474 = parseVariableIdentifier$966();
            validateParam$997(options$1471, token$1472, token$1472.value);
            if (match$928('=')) {
                if (rest$1473) {
                    throwErrorTolerant$924(lookahead$885, Messages$868.DefaultRestParameter);
                }
                lex$919();
                def$1475 = parseAssignmentExpression$962();
                ++options$1471.defaultCount;
            }
        }
        if (rest$1473) {
            if (!match$928(')')) {
                throwError$923({}, Messages$868.ParameterAfterRestParameter);
            }
            options$1471.rest = param$1474;
            return false;
        }
        options$1471.params.push(param$1474);
        options$1471.defaults.push(def$1475);
        return !match$928(')');
    }
    function parseParams$999(firstRestricted$1476) {
        var options$1477;
        options$1477 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1476
        };
        expect$926('(');
        if (!match$928(')')) {
            options$1477.paramSet = {};
            while (streamIndex$884 < length$881) {
                if (!parseParam$998(options$1477)) {
                    break;
                }
                expect$926(',');
            }
        }
        expect$926(')');
        if (options$1477.defaultCount === 0) {
            options$1477.defaults = [];
        }
        return options$1477;
    }
    function parseFunctionDeclaration$1000() {
        var id$1478, body$1479, token$1480, tmp$1481, firstRestricted$1482, message$1483, previousStrict$1484, previousYieldAllowed$1485, generator$1486, expression$1487;
        expectKeyword$927('function');
        generator$1486 = false;
        if (match$928('*')) {
            lex$919();
            generator$1486 = true;
        }
        token$1480 = lookahead$885;
        id$1478 = parseVariableIdentifier$966();
        if (strict$873) {
            if (isRestrictedWord$900(token$1480.value)) {
                throwErrorTolerant$924(token$1480, Messages$868.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$900(token$1480.value)) {
                firstRestricted$1482 = token$1480;
                message$1483 = Messages$868.StrictFunctionName;
            } else if (isStrictModeReservedWord$899(token$1480.value)) {
                firstRestricted$1482 = token$1480;
                message$1483 = Messages$868.StrictReservedWord;
            }
        }
        tmp$1481 = parseParams$999(firstRestricted$1482);
        firstRestricted$1482 = tmp$1481.firstRestricted;
        if (tmp$1481.message) {
            message$1483 = tmp$1481.message;
        }
        previousStrict$1484 = strict$873;
        previousYieldAllowed$1485 = state$887.yieldAllowed;
        state$887.yieldAllowed = generator$1486;
        // here we redo some work in order to set 'expression'
        expression$1487 = !match$928('{');
        body$1479 = parseConciseBody$995();
        if (strict$873 && firstRestricted$1482) {
            throwError$923(firstRestricted$1482, message$1483);
        }
        if (strict$873 && tmp$1481.stricted) {
            throwErrorTolerant$924(tmp$1481.stricted, message$1483);
        }
        if (state$887.yieldAllowed && !state$887.yieldFound) {
            throwErrorTolerant$924({}, Messages$868.NoYieldInGenerator);
        }
        strict$873 = previousStrict$1484;
        state$887.yieldAllowed = previousYieldAllowed$1485;
        return delegate$882.createFunctionDeclaration(id$1478, tmp$1481.params, tmp$1481.defaults, body$1479, tmp$1481.rest, generator$1486, expression$1487);
    }
    function parseFunctionExpression$1001() {
        var token$1488, id$1489 = null, firstRestricted$1490, message$1491, tmp$1492, body$1493, previousStrict$1494, previousYieldAllowed$1495, generator$1496, expression$1497;
        expectKeyword$927('function');
        generator$1496 = false;
        if (match$928('*')) {
            lex$919();
            generator$1496 = true;
        }
        if (!match$928('(')) {
            token$1488 = lookahead$885;
            id$1489 = parseVariableIdentifier$966();
            if (strict$873) {
                if (isRestrictedWord$900(token$1488.value)) {
                    throwErrorTolerant$924(token$1488, Messages$868.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$900(token$1488.value)) {
                    firstRestricted$1490 = token$1488;
                    message$1491 = Messages$868.StrictFunctionName;
                } else if (isStrictModeReservedWord$899(token$1488.value)) {
                    firstRestricted$1490 = token$1488;
                    message$1491 = Messages$868.StrictReservedWord;
                }
            }
        }
        tmp$1492 = parseParams$999(firstRestricted$1490);
        firstRestricted$1490 = tmp$1492.firstRestricted;
        if (tmp$1492.message) {
            message$1491 = tmp$1492.message;
        }
        previousStrict$1494 = strict$873;
        previousYieldAllowed$1495 = state$887.yieldAllowed;
        state$887.yieldAllowed = generator$1496;
        // here we redo some work in order to set 'expression'
        expression$1497 = !match$928('{');
        body$1493 = parseConciseBody$995();
        if (strict$873 && firstRestricted$1490) {
            throwError$923(firstRestricted$1490, message$1491);
        }
        if (strict$873 && tmp$1492.stricted) {
            throwErrorTolerant$924(tmp$1492.stricted, message$1491);
        }
        if (state$887.yieldAllowed && !state$887.yieldFound) {
            throwErrorTolerant$924({}, Messages$868.NoYieldInGenerator);
        }
        strict$873 = previousStrict$1494;
        state$887.yieldAllowed = previousYieldAllowed$1495;
        return delegate$882.createFunctionExpression(id$1489, tmp$1492.params, tmp$1492.defaults, body$1493, tmp$1492.rest, generator$1496, expression$1497);
    }
    function parseYieldExpression$1002() {
        var delegateFlag$1498, expr$1499, previousYieldAllowed$1500;
        expectKeyword$927('yield');
        if (!state$887.yieldAllowed) {
            throwErrorTolerant$924({}, Messages$868.IllegalYield);
        }
        delegateFlag$1498 = false;
        if (match$928('*')) {
            lex$919();
            delegateFlag$1498 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1500 = state$887.yieldAllowed;
        state$887.yieldAllowed = false;
        expr$1499 = parseAssignmentExpression$962();
        state$887.yieldAllowed = previousYieldAllowed$1500;
        state$887.yieldFound = true;
        return delegate$882.createYieldExpression(expr$1499, delegateFlag$1498);
    }
    // 14 Classes
    function parseMethodDefinition$1003(existingPropNames$1501) {
        var token$1502, key$1503, param$1504, propType$1505, isValidDuplicateProp$1506 = false;
        if (lookahead$885.value === 'static') {
            propType$1505 = ClassPropertyType$871.static;
            lex$919();
        } else {
            propType$1505 = ClassPropertyType$871.prototype;
        }
        if (match$928('*')) {
            lex$919();
            return delegate$882.createMethodDefinition(propType$1505, '', parseObjectPropertyKey$938(), parsePropertyMethodFunction$937({ generator: true }));
        }
        token$1502 = lookahead$885;
        key$1503 = parseObjectPropertyKey$938();
        if (token$1502.value === 'get' && !match$928('(')) {
            key$1503 = parseObjectPropertyKey$938();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1501[propType$1505].hasOwnProperty(key$1503.name)) {
                isValidDuplicateProp$1506 = existingPropNames$1501[propType$1505][key$1503.name].get === undefined && existingPropNames$1501[propType$1505][key$1503.name].data === undefined && existingPropNames$1501[propType$1505][key$1503.name].set !== undefined;
                if (!isValidDuplicateProp$1506) {
                    throwError$923(key$1503, Messages$868.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1501[propType$1505][key$1503.name] = {};
            }
            existingPropNames$1501[propType$1505][key$1503.name].get = true;
            expect$926('(');
            expect$926(')');
            return delegate$882.createMethodDefinition(propType$1505, 'get', key$1503, parsePropertyFunction$936({ generator: false }));
        }
        if (token$1502.value === 'set' && !match$928('(')) {
            key$1503 = parseObjectPropertyKey$938();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1501[propType$1505].hasOwnProperty(key$1503.name)) {
                isValidDuplicateProp$1506 = existingPropNames$1501[propType$1505][key$1503.name].set === undefined && existingPropNames$1501[propType$1505][key$1503.name].data === undefined && existingPropNames$1501[propType$1505][key$1503.name].get !== undefined;
                if (!isValidDuplicateProp$1506) {
                    throwError$923(key$1503, Messages$868.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1501[propType$1505][key$1503.name] = {};
            }
            existingPropNames$1501[propType$1505][key$1503.name].set = true;
            expect$926('(');
            token$1502 = lookahead$885;
            param$1504 = [parseVariableIdentifier$966()];
            expect$926(')');
            return delegate$882.createMethodDefinition(propType$1505, 'set', key$1503, parsePropertyFunction$936({
                params: param$1504,
                generator: false,
                name: token$1502
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1501[propType$1505].hasOwnProperty(key$1503.name)) {
            throwError$923(key$1503, Messages$868.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1501[propType$1505][key$1503.name] = {};
        }
        existingPropNames$1501[propType$1505][key$1503.name].data = true;
        return delegate$882.createMethodDefinition(propType$1505, '', key$1503, parsePropertyMethodFunction$937({ generator: false }));
    }
    function parseClassElement$1004(existingProps$1507) {
        if (match$928(';')) {
            lex$919();
            return;
        }
        return parseMethodDefinition$1003(existingProps$1507);
    }
    function parseClassBody$1005() {
        var classElement$1508, classElements$1509 = [], existingProps$1510 = {};
        existingProps$1510[ClassPropertyType$871.static] = {};
        existingProps$1510[ClassPropertyType$871.prototype] = {};
        expect$926('{');
        while (streamIndex$884 < length$881) {
            if (match$928('}')) {
                break;
            }
            classElement$1508 = parseClassElement$1004(existingProps$1510);
            if (typeof classElement$1508 !== 'undefined') {
                classElements$1509.push(classElement$1508);
            }
        }
        expect$926('}');
        return delegate$882.createClassBody(classElements$1509);
    }
    function parseClassExpression$1006() {
        var id$1511, previousYieldAllowed$1512, superClass$1513 = null;
        expectKeyword$927('class');
        if (!matchKeyword$929('extends') && !match$928('{')) {
            id$1511 = parseVariableIdentifier$966();
        }
        if (matchKeyword$929('extends')) {
            expectKeyword$927('extends');
            previousYieldAllowed$1512 = state$887.yieldAllowed;
            state$887.yieldAllowed = false;
            superClass$1513 = parseAssignmentExpression$962();
            state$887.yieldAllowed = previousYieldAllowed$1512;
        }
        return delegate$882.createClassExpression(id$1511, superClass$1513, parseClassBody$1005());
    }
    function parseClassDeclaration$1007() {
        var id$1514, previousYieldAllowed$1515, superClass$1516 = null;
        expectKeyword$927('class');
        id$1514 = parseVariableIdentifier$966();
        if (matchKeyword$929('extends')) {
            expectKeyword$927('extends');
            previousYieldAllowed$1515 = state$887.yieldAllowed;
            state$887.yieldAllowed = false;
            superClass$1516 = parseAssignmentExpression$962();
            state$887.yieldAllowed = previousYieldAllowed$1515;
        }
        return delegate$882.createClassDeclaration(id$1514, superClass$1516, parseClassBody$1005());
    }
    // 15 Program
    function matchModuleDeclaration$1008() {
        var id$1517;
        if (matchContextualKeyword$930('module')) {
            id$1517 = lookahead2$921();
            return id$1517.type === Token$863.StringLiteral || id$1517.type === Token$863.Identifier;
        }
        return false;
    }
    function parseSourceElement$1009() {
        if (lookahead$885.type === Token$863.Keyword) {
            switch (lookahead$885.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$970(lookahead$885.value);
            case 'function':
                return parseFunctionDeclaration$1000();
            case 'export':
                return parseExportDeclaration$974();
            case 'import':
                return parseImportDeclaration$975();
            default:
                return parseStatement$994();
            }
        }
        if (matchModuleDeclaration$1008()) {
            throwError$923({}, Messages$868.NestedModule);
        }
        if (lookahead$885.type !== Token$863.EOF) {
            return parseStatement$994();
        }
    }
    function parseProgramElement$1010() {
        if (lookahead$885.type === Token$863.Keyword) {
            switch (lookahead$885.value) {
            case 'export':
                return parseExportDeclaration$974();
            case 'import':
                return parseImportDeclaration$975();
            }
        }
        if (matchModuleDeclaration$1008()) {
            return parseModuleDeclaration$971();
        }
        return parseSourceElement$1009();
    }
    function parseProgramElements$1011() {
        var sourceElement$1518, sourceElements$1519 = [], token$1520, directive$1521, firstRestricted$1522;
        while (streamIndex$884 < length$881) {
            token$1520 = lookahead$885;
            if (token$1520.type !== Token$863.StringLiteral) {
                break;
            }
            sourceElement$1518 = parseProgramElement$1010();
            sourceElements$1519.push(sourceElement$1518);
            if (sourceElement$1518.expression.type !== Syntax$866.Literal) {
                // this is not directive
                break;
            }
            directive$1521 = token$1520.value;
            if (directive$1521 === 'use strict') {
                strict$873 = true;
                if (firstRestricted$1522) {
                    throwErrorTolerant$924(firstRestricted$1522, Messages$868.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1522 && token$1520.octal) {
                    firstRestricted$1522 = token$1520;
                }
            }
        }
        while (streamIndex$884 < length$881) {
            sourceElement$1518 = parseProgramElement$1010();
            if (typeof sourceElement$1518 === 'undefined') {
                break;
            }
            sourceElements$1519.push(sourceElement$1518);
        }
        return sourceElements$1519;
    }
    function parseModuleElement$1012() {
        return parseSourceElement$1009();
    }
    function parseModuleElements$1013() {
        var list$1523 = [], statement$1524;
        while (streamIndex$884 < length$881) {
            if (match$928('}')) {
                break;
            }
            statement$1524 = parseModuleElement$1012();
            if (typeof statement$1524 === 'undefined') {
                break;
            }
            list$1523.push(statement$1524);
        }
        return list$1523;
    }
    function parseModuleBlock$1014() {
        var block$1525;
        expect$926('{');
        block$1525 = parseModuleElements$1013();
        expect$926('}');
        return delegate$882.createBlockStatement(block$1525);
    }
    function parseProgram$1015() {
        var body$1526;
        strict$873 = false;
        peek$920();
        body$1526 = parseProgramElements$1011();
        return delegate$882.createProgram(body$1526);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1016(type$1527, value$1528, start$1529, end$1530, loc$1531) {
        assert$889(typeof start$1529 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$888.comments.length > 0) {
            if (extra$888.comments[extra$888.comments.length - 1].range[1] > start$1529) {
                return;
            }
        }
        extra$888.comments.push({
            type: type$1527,
            value: value$1528,
            range: [
                start$1529,
                end$1530
            ],
            loc: loc$1531
        });
    }
    function scanComment$1017() {
        var comment$1532, ch$1533, loc$1534, start$1535, blockComment$1536, lineComment$1537;
        comment$1532 = '';
        blockComment$1536 = false;
        lineComment$1537 = false;
        while (index$874 < length$881) {
            ch$1533 = source$872[index$874];
            if (lineComment$1537) {
                ch$1533 = source$872[index$874++];
                if (isLineTerminator$895(ch$1533.charCodeAt(0))) {
                    loc$1534.end = {
                        line: lineNumber$875,
                        column: index$874 - lineStart$876 - 1
                    };
                    lineComment$1537 = false;
                    addComment$1016('Line', comment$1532, start$1535, index$874 - 1, loc$1534);
                    if (ch$1533 === '\r' && source$872[index$874] === '\n') {
                        ++index$874;
                    }
                    ++lineNumber$875;
                    lineStart$876 = index$874;
                    comment$1532 = '';
                } else if (index$874 >= length$881) {
                    lineComment$1537 = false;
                    comment$1532 += ch$1533;
                    loc$1534.end = {
                        line: lineNumber$875,
                        column: length$881 - lineStart$876
                    };
                    addComment$1016('Line', comment$1532, start$1535, length$881, loc$1534);
                } else {
                    comment$1532 += ch$1533;
                }
            } else if (blockComment$1536) {
                if (isLineTerminator$895(ch$1533.charCodeAt(0))) {
                    if (ch$1533 === '\r' && source$872[index$874 + 1] === '\n') {
                        ++index$874;
                        comment$1532 += '\r\n';
                    } else {
                        comment$1532 += ch$1533;
                    }
                    ++lineNumber$875;
                    ++index$874;
                    lineStart$876 = index$874;
                    if (index$874 >= length$881) {
                        throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1533 = source$872[index$874++];
                    if (index$874 >= length$881) {
                        throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1532 += ch$1533;
                    if (ch$1533 === '*') {
                        ch$1533 = source$872[index$874];
                        if (ch$1533 === '/') {
                            comment$1532 = comment$1532.substr(0, comment$1532.length - 1);
                            blockComment$1536 = false;
                            ++index$874;
                            loc$1534.end = {
                                line: lineNumber$875,
                                column: index$874 - lineStart$876
                            };
                            addComment$1016('Block', comment$1532, start$1535, index$874, loc$1534);
                            comment$1532 = '';
                        }
                    }
                }
            } else if (ch$1533 === '/') {
                ch$1533 = source$872[index$874 + 1];
                if (ch$1533 === '/') {
                    loc$1534 = {
                        start: {
                            line: lineNumber$875,
                            column: index$874 - lineStart$876
                        }
                    };
                    start$1535 = index$874;
                    index$874 += 2;
                    lineComment$1537 = true;
                    if (index$874 >= length$881) {
                        loc$1534.end = {
                            line: lineNumber$875,
                            column: index$874 - lineStart$876
                        };
                        lineComment$1537 = false;
                        addComment$1016('Line', comment$1532, start$1535, index$874, loc$1534);
                    }
                } else if (ch$1533 === '*') {
                    start$1535 = index$874;
                    index$874 += 2;
                    blockComment$1536 = true;
                    loc$1534 = {
                        start: {
                            line: lineNumber$875,
                            column: index$874 - lineStart$876 - 2
                        }
                    };
                    if (index$874 >= length$881) {
                        throwError$923({}, Messages$868.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$894(ch$1533.charCodeAt(0))) {
                ++index$874;
            } else if (isLineTerminator$895(ch$1533.charCodeAt(0))) {
                ++index$874;
                if (ch$1533 === '\r' && source$872[index$874] === '\n') {
                    ++index$874;
                }
                ++lineNumber$875;
                lineStart$876 = index$874;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1018() {
        var i$1538, entry$1539, comment$1540, comments$1541 = [];
        for (i$1538 = 0; i$1538 < extra$888.comments.length; ++i$1538) {
            entry$1539 = extra$888.comments[i$1538];
            comment$1540 = {
                type: entry$1539.type,
                value: entry$1539.value
            };
            if (extra$888.range) {
                comment$1540.range = entry$1539.range;
            }
            if (extra$888.loc) {
                comment$1540.loc = entry$1539.loc;
            }
            comments$1541.push(comment$1540);
        }
        extra$888.comments = comments$1541;
    }
    function collectToken$1019() {
        var start$1542, loc$1543, token$1544, range$1545, value$1546;
        skipComment$902();
        start$1542 = index$874;
        loc$1543 = {
            start: {
                line: lineNumber$875,
                column: index$874 - lineStart$876
            }
        };
        token$1544 = extra$888.advance();
        loc$1543.end = {
            line: lineNumber$875,
            column: index$874 - lineStart$876
        };
        if (token$1544.type !== Token$863.EOF) {
            range$1545 = [
                token$1544.range[0],
                token$1544.range[1]
            ];
            value$1546 = source$872.slice(token$1544.range[0], token$1544.range[1]);
            extra$888.tokens.push({
                type: TokenName$864[token$1544.type],
                value: value$1546,
                range: range$1545,
                loc: loc$1543
            });
        }
        return token$1544;
    }
    function collectRegex$1020() {
        var pos$1547, loc$1548, regex$1549, token$1550;
        skipComment$902();
        pos$1547 = index$874;
        loc$1548 = {
            start: {
                line: lineNumber$875,
                column: index$874 - lineStart$876
            }
        };
        regex$1549 = extra$888.scanRegExp();
        loc$1548.end = {
            line: lineNumber$875,
            column: index$874 - lineStart$876
        };
        if (!extra$888.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$888.tokens.length > 0) {
                token$1550 = extra$888.tokens[extra$888.tokens.length - 1];
                if (token$1550.range[0] === pos$1547 && token$1550.type === 'Punctuator') {
                    if (token$1550.value === '/' || token$1550.value === '/=') {
                        extra$888.tokens.pop();
                    }
                }
            }
            extra$888.tokens.push({
                type: 'RegularExpression',
                value: regex$1549.literal,
                range: [
                    pos$1547,
                    index$874
                ],
                loc: loc$1548
            });
        }
        return regex$1549;
    }
    function filterTokenLocation$1021() {
        var i$1551, entry$1552, token$1553, tokens$1554 = [];
        for (i$1551 = 0; i$1551 < extra$888.tokens.length; ++i$1551) {
            entry$1552 = extra$888.tokens[i$1551];
            token$1553 = {
                type: entry$1552.type,
                value: entry$1552.value
            };
            if (extra$888.range) {
                token$1553.range = entry$1552.range;
            }
            if (extra$888.loc) {
                token$1553.loc = entry$1552.loc;
            }
            tokens$1554.push(token$1553);
        }
        extra$888.tokens = tokens$1554;
    }
    function LocationMarker$1022() {
        var sm_index$1555 = lookahead$885 ? lookahead$885.sm_range[0] : 0;
        var sm_lineStart$1556 = lookahead$885 ? lookahead$885.sm_lineStart : 0;
        var sm_lineNumber$1557 = lookahead$885 ? lookahead$885.sm_lineNumber : 1;
        this.range = [
            sm_index$1555,
            sm_index$1555
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1557,
                column: sm_index$1555 - sm_lineStart$1556
            },
            end: {
                line: sm_lineNumber$1557,
                column: sm_index$1555 - sm_lineStart$1556
            }
        };
    }
    LocationMarker$1022.prototype = {
        constructor: LocationMarker$1022,
        end: function () {
            this.range[1] = sm_index$880;
            this.loc.end.line = sm_lineNumber$877;
            this.loc.end.column = sm_index$880 - sm_lineStart$878;
        },
        applyGroup: function (node$1558) {
            if (extra$888.range) {
                node$1558.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$888.loc) {
                node$1558.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1558 = delegate$882.postProcess(node$1558);
            }
        },
        apply: function (node$1559) {
            var nodeType$1560 = typeof node$1559;
            assert$889(nodeType$1560 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1560);
            if (extra$888.range) {
                node$1559.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$888.loc) {
                node$1559.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1559 = delegate$882.postProcess(node$1559);
            }
        }
    };
    function createLocationMarker$1023() {
        return new LocationMarker$1022();
    }
    function trackGroupExpression$1024() {
        var marker$1561, expr$1562;
        marker$1561 = createLocationMarker$1023();
        expect$926('(');
        ++state$887.parenthesizedCount;
        expr$1562 = parseExpression$963();
        expect$926(')');
        marker$1561.end();
        marker$1561.applyGroup(expr$1562);
        return expr$1562;
    }
    function trackLeftHandSideExpression$1025() {
        var marker$1563, expr$1564;
        // skipComment();
        marker$1563 = createLocationMarker$1023();
        expr$1564 = matchKeyword$929('new') ? parseNewExpression$950() : parsePrimaryExpression$944();
        while (match$928('.') || match$928('[') || lookahead$885.type === Token$863.Template) {
            if (match$928('[')) {
                expr$1564 = delegate$882.createMemberExpression('[', expr$1564, parseComputedMember$949());
                marker$1563.end();
                marker$1563.apply(expr$1564);
            } else if (match$928('.')) {
                expr$1564 = delegate$882.createMemberExpression('.', expr$1564, parseNonComputedMember$948());
                marker$1563.end();
                marker$1563.apply(expr$1564);
            } else {
                expr$1564 = delegate$882.createTaggedTemplateExpression(expr$1564, parseTemplateLiteral$942());
                marker$1563.end();
                marker$1563.apply(expr$1564);
            }
        }
        return expr$1564;
    }
    function trackLeftHandSideExpressionAllowCall$1026() {
        var marker$1565, expr$1566, args$1567;
        // skipComment();
        marker$1565 = createLocationMarker$1023();
        expr$1566 = matchKeyword$929('new') ? parseNewExpression$950() : parsePrimaryExpression$944();
        while (match$928('.') || match$928('[') || match$928('(') || lookahead$885.type === Token$863.Template) {
            if (match$928('(')) {
                args$1567 = parseArguments$945();
                expr$1566 = delegate$882.createCallExpression(expr$1566, args$1567);
                marker$1565.end();
                marker$1565.apply(expr$1566);
            } else if (match$928('[')) {
                expr$1566 = delegate$882.createMemberExpression('[', expr$1566, parseComputedMember$949());
                marker$1565.end();
                marker$1565.apply(expr$1566);
            } else if (match$928('.')) {
                expr$1566 = delegate$882.createMemberExpression('.', expr$1566, parseNonComputedMember$948());
                marker$1565.end();
                marker$1565.apply(expr$1566);
            } else {
                expr$1566 = delegate$882.createTaggedTemplateExpression(expr$1566, parseTemplateLiteral$942());
                marker$1565.end();
                marker$1565.apply(expr$1566);
            }
        }
        return expr$1566;
    }
    function filterGroup$1027(node$1568) {
        var n$1569, i$1570, entry$1571;
        n$1569 = Object.prototype.toString.apply(node$1568) === '[object Array]' ? [] : {};
        for (i$1570 in node$1568) {
            if (node$1568.hasOwnProperty(i$1570) && i$1570 !== 'groupRange' && i$1570 !== 'groupLoc') {
                entry$1571 = node$1568[i$1570];
                if (entry$1571 === null || typeof entry$1571 !== 'object' || entry$1571 instanceof RegExp) {
                    n$1569[i$1570] = entry$1571;
                } else {
                    n$1569[i$1570] = filterGroup$1027(entry$1571);
                }
            }
        }
        return n$1569;
    }
    function wrapTrackingFunction$1028(range$1572, loc$1573) {
        return function (parseFunction$1574) {
            function isBinary$1575(node$1577) {
                return node$1577.type === Syntax$866.LogicalExpression || node$1577.type === Syntax$866.BinaryExpression;
            }
            function visit$1576(node$1578) {
                var start$1579, end$1580;
                if (isBinary$1575(node$1578.left)) {
                    visit$1576(node$1578.left);
                }
                if (isBinary$1575(node$1578.right)) {
                    visit$1576(node$1578.right);
                }
                if (range$1572) {
                    if (node$1578.left.groupRange || node$1578.right.groupRange) {
                        start$1579 = node$1578.left.groupRange ? node$1578.left.groupRange[0] : node$1578.left.range[0];
                        end$1580 = node$1578.right.groupRange ? node$1578.right.groupRange[1] : node$1578.right.range[1];
                        node$1578.range = [
                            start$1579,
                            end$1580
                        ];
                    } else if (typeof node$1578.range === 'undefined') {
                        start$1579 = node$1578.left.range[0];
                        end$1580 = node$1578.right.range[1];
                        node$1578.range = [
                            start$1579,
                            end$1580
                        ];
                    }
                }
                if (loc$1573) {
                    if (node$1578.left.groupLoc || node$1578.right.groupLoc) {
                        start$1579 = node$1578.left.groupLoc ? node$1578.left.groupLoc.start : node$1578.left.loc.start;
                        end$1580 = node$1578.right.groupLoc ? node$1578.right.groupLoc.end : node$1578.right.loc.end;
                        node$1578.loc = {
                            start: start$1579,
                            end: end$1580
                        };
                        node$1578 = delegate$882.postProcess(node$1578);
                    } else if (typeof node$1578.loc === 'undefined') {
                        node$1578.loc = {
                            start: node$1578.left.loc.start,
                            end: node$1578.right.loc.end
                        };
                        node$1578 = delegate$882.postProcess(node$1578);
                    }
                }
            }
            return function () {
                var marker$1581, node$1582, curr$1583 = lookahead$885;
                marker$1581 = createLocationMarker$1023();
                node$1582 = parseFunction$1574.apply(null, arguments);
                marker$1581.end();
                if (node$1582.type !== Syntax$866.Program) {
                    if (curr$1583.leadingComments) {
                        node$1582.leadingComments = curr$1583.leadingComments;
                    }
                    if (curr$1583.trailingComments) {
                        node$1582.trailingComments = curr$1583.trailingComments;
                    }
                }
                if (range$1572 && typeof node$1582.range === 'undefined') {
                    marker$1581.apply(node$1582);
                }
                if (loc$1573 && typeof node$1582.loc === 'undefined') {
                    marker$1581.apply(node$1582);
                }
                if (isBinary$1575(node$1582)) {
                    visit$1576(node$1582);
                }
                return node$1582;
            };
        };
    }
    function patch$1029() {
        var wrapTracking$1584;
        if (extra$888.comments) {
            extra$888.skipComment = skipComment$902;
            skipComment$902 = scanComment$1017;
        }
        if (extra$888.range || extra$888.loc) {
            extra$888.parseGroupExpression = parseGroupExpression$943;
            extra$888.parseLeftHandSideExpression = parseLeftHandSideExpression$952;
            extra$888.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$951;
            parseGroupExpression$943 = trackGroupExpression$1024;
            parseLeftHandSideExpression$952 = trackLeftHandSideExpression$1025;
            parseLeftHandSideExpressionAllowCall$951 = trackLeftHandSideExpressionAllowCall$1026;
            wrapTracking$1584 = wrapTrackingFunction$1028(extra$888.range, extra$888.loc);
            extra$888.parseArrayInitialiser = parseArrayInitialiser$935;
            extra$888.parseAssignmentExpression = parseAssignmentExpression$962;
            extra$888.parseBinaryExpression = parseBinaryExpression$956;
            extra$888.parseBlock = parseBlock$965;
            extra$888.parseFunctionSourceElements = parseFunctionSourceElements$996;
            extra$888.parseCatchClause = parseCatchClause$991;
            extra$888.parseComputedMember = parseComputedMember$949;
            extra$888.parseConditionalExpression = parseConditionalExpression$957;
            extra$888.parseConstLetDeclaration = parseConstLetDeclaration$970;
            extra$888.parseExportBatchSpecifier = parseExportBatchSpecifier$972;
            extra$888.parseExportDeclaration = parseExportDeclaration$974;
            extra$888.parseExportSpecifier = parseExportSpecifier$973;
            extra$888.parseExpression = parseExpression$963;
            extra$888.parseForVariableDeclaration = parseForVariableDeclaration$982;
            extra$888.parseFunctionDeclaration = parseFunctionDeclaration$1000;
            extra$888.parseFunctionExpression = parseFunctionExpression$1001;
            extra$888.parseParams = parseParams$999;
            extra$888.parseImportDeclaration = parseImportDeclaration$975;
            extra$888.parseImportSpecifier = parseImportSpecifier$976;
            extra$888.parseModuleDeclaration = parseModuleDeclaration$971;
            extra$888.parseModuleBlock = parseModuleBlock$1014;
            extra$888.parseNewExpression = parseNewExpression$950;
            extra$888.parseNonComputedProperty = parseNonComputedProperty$947;
            extra$888.parseObjectInitialiser = parseObjectInitialiser$940;
            extra$888.parseObjectProperty = parseObjectProperty$939;
            extra$888.parseObjectPropertyKey = parseObjectPropertyKey$938;
            extra$888.parsePostfixExpression = parsePostfixExpression$953;
            extra$888.parsePrimaryExpression = parsePrimaryExpression$944;
            extra$888.parseProgram = parseProgram$1015;
            extra$888.parsePropertyFunction = parsePropertyFunction$936;
            extra$888.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$946;
            extra$888.parseTemplateElement = parseTemplateElement$941;
            extra$888.parseTemplateLiteral = parseTemplateLiteral$942;
            extra$888.parseStatement = parseStatement$994;
            extra$888.parseSwitchCase = parseSwitchCase$988;
            extra$888.parseUnaryExpression = parseUnaryExpression$954;
            extra$888.parseVariableDeclaration = parseVariableDeclaration$967;
            extra$888.parseVariableIdentifier = parseVariableIdentifier$966;
            extra$888.parseMethodDefinition = parseMethodDefinition$1003;
            extra$888.parseClassDeclaration = parseClassDeclaration$1007;
            extra$888.parseClassExpression = parseClassExpression$1006;
            extra$888.parseClassBody = parseClassBody$1005;
            parseArrayInitialiser$935 = wrapTracking$1584(extra$888.parseArrayInitialiser);
            parseAssignmentExpression$962 = wrapTracking$1584(extra$888.parseAssignmentExpression);
            parseBinaryExpression$956 = wrapTracking$1584(extra$888.parseBinaryExpression);
            parseBlock$965 = wrapTracking$1584(extra$888.parseBlock);
            parseFunctionSourceElements$996 = wrapTracking$1584(extra$888.parseFunctionSourceElements);
            parseCatchClause$991 = wrapTracking$1584(extra$888.parseCatchClause);
            parseComputedMember$949 = wrapTracking$1584(extra$888.parseComputedMember);
            parseConditionalExpression$957 = wrapTracking$1584(extra$888.parseConditionalExpression);
            parseConstLetDeclaration$970 = wrapTracking$1584(extra$888.parseConstLetDeclaration);
            parseExportBatchSpecifier$972 = wrapTracking$1584(parseExportBatchSpecifier$972);
            parseExportDeclaration$974 = wrapTracking$1584(parseExportDeclaration$974);
            parseExportSpecifier$973 = wrapTracking$1584(parseExportSpecifier$973);
            parseExpression$963 = wrapTracking$1584(extra$888.parseExpression);
            parseForVariableDeclaration$982 = wrapTracking$1584(extra$888.parseForVariableDeclaration);
            parseFunctionDeclaration$1000 = wrapTracking$1584(extra$888.parseFunctionDeclaration);
            parseFunctionExpression$1001 = wrapTracking$1584(extra$888.parseFunctionExpression);
            parseParams$999 = wrapTracking$1584(extra$888.parseParams);
            parseImportDeclaration$975 = wrapTracking$1584(extra$888.parseImportDeclaration);
            parseImportSpecifier$976 = wrapTracking$1584(extra$888.parseImportSpecifier);
            parseModuleDeclaration$971 = wrapTracking$1584(extra$888.parseModuleDeclaration);
            parseModuleBlock$1014 = wrapTracking$1584(extra$888.parseModuleBlock);
            parseLeftHandSideExpression$952 = wrapTracking$1584(parseLeftHandSideExpression$952);
            parseNewExpression$950 = wrapTracking$1584(extra$888.parseNewExpression);
            parseNonComputedProperty$947 = wrapTracking$1584(extra$888.parseNonComputedProperty);
            parseObjectInitialiser$940 = wrapTracking$1584(extra$888.parseObjectInitialiser);
            parseObjectProperty$939 = wrapTracking$1584(extra$888.parseObjectProperty);
            parseObjectPropertyKey$938 = wrapTracking$1584(extra$888.parseObjectPropertyKey);
            parsePostfixExpression$953 = wrapTracking$1584(extra$888.parsePostfixExpression);
            parsePrimaryExpression$944 = wrapTracking$1584(extra$888.parsePrimaryExpression);
            parseProgram$1015 = wrapTracking$1584(extra$888.parseProgram);
            parsePropertyFunction$936 = wrapTracking$1584(extra$888.parsePropertyFunction);
            parseTemplateElement$941 = wrapTracking$1584(extra$888.parseTemplateElement);
            parseTemplateLiteral$942 = wrapTracking$1584(extra$888.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$946 = wrapTracking$1584(extra$888.parseSpreadOrAssignmentExpression);
            parseStatement$994 = wrapTracking$1584(extra$888.parseStatement);
            parseSwitchCase$988 = wrapTracking$1584(extra$888.parseSwitchCase);
            parseUnaryExpression$954 = wrapTracking$1584(extra$888.parseUnaryExpression);
            parseVariableDeclaration$967 = wrapTracking$1584(extra$888.parseVariableDeclaration);
            parseVariableIdentifier$966 = wrapTracking$1584(extra$888.parseVariableIdentifier);
            parseMethodDefinition$1003 = wrapTracking$1584(extra$888.parseMethodDefinition);
            parseClassDeclaration$1007 = wrapTracking$1584(extra$888.parseClassDeclaration);
            parseClassExpression$1006 = wrapTracking$1584(extra$888.parseClassExpression);
            parseClassBody$1005 = wrapTracking$1584(extra$888.parseClassBody);
        }
        if (typeof extra$888.tokens !== 'undefined') {
            extra$888.advance = advance$918;
            extra$888.scanRegExp = scanRegExp$915;
            advance$918 = collectToken$1019;
            scanRegExp$915 = collectRegex$1020;
        }
    }
    function unpatch$1030() {
        if (typeof extra$888.skipComment === 'function') {
            skipComment$902 = extra$888.skipComment;
        }
        if (extra$888.range || extra$888.loc) {
            parseArrayInitialiser$935 = extra$888.parseArrayInitialiser;
            parseAssignmentExpression$962 = extra$888.parseAssignmentExpression;
            parseBinaryExpression$956 = extra$888.parseBinaryExpression;
            parseBlock$965 = extra$888.parseBlock;
            parseFunctionSourceElements$996 = extra$888.parseFunctionSourceElements;
            parseCatchClause$991 = extra$888.parseCatchClause;
            parseComputedMember$949 = extra$888.parseComputedMember;
            parseConditionalExpression$957 = extra$888.parseConditionalExpression;
            parseConstLetDeclaration$970 = extra$888.parseConstLetDeclaration;
            parseExportBatchSpecifier$972 = extra$888.parseExportBatchSpecifier;
            parseExportDeclaration$974 = extra$888.parseExportDeclaration;
            parseExportSpecifier$973 = extra$888.parseExportSpecifier;
            parseExpression$963 = extra$888.parseExpression;
            parseForVariableDeclaration$982 = extra$888.parseForVariableDeclaration;
            parseFunctionDeclaration$1000 = extra$888.parseFunctionDeclaration;
            parseFunctionExpression$1001 = extra$888.parseFunctionExpression;
            parseImportDeclaration$975 = extra$888.parseImportDeclaration;
            parseImportSpecifier$976 = extra$888.parseImportSpecifier;
            parseGroupExpression$943 = extra$888.parseGroupExpression;
            parseLeftHandSideExpression$952 = extra$888.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$951 = extra$888.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$971 = extra$888.parseModuleDeclaration;
            parseModuleBlock$1014 = extra$888.parseModuleBlock;
            parseNewExpression$950 = extra$888.parseNewExpression;
            parseNonComputedProperty$947 = extra$888.parseNonComputedProperty;
            parseObjectInitialiser$940 = extra$888.parseObjectInitialiser;
            parseObjectProperty$939 = extra$888.parseObjectProperty;
            parseObjectPropertyKey$938 = extra$888.parseObjectPropertyKey;
            parsePostfixExpression$953 = extra$888.parsePostfixExpression;
            parsePrimaryExpression$944 = extra$888.parsePrimaryExpression;
            parseProgram$1015 = extra$888.parseProgram;
            parsePropertyFunction$936 = extra$888.parsePropertyFunction;
            parseTemplateElement$941 = extra$888.parseTemplateElement;
            parseTemplateLiteral$942 = extra$888.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$946 = extra$888.parseSpreadOrAssignmentExpression;
            parseStatement$994 = extra$888.parseStatement;
            parseSwitchCase$988 = extra$888.parseSwitchCase;
            parseUnaryExpression$954 = extra$888.parseUnaryExpression;
            parseVariableDeclaration$967 = extra$888.parseVariableDeclaration;
            parseVariableIdentifier$966 = extra$888.parseVariableIdentifier;
            parseMethodDefinition$1003 = extra$888.parseMethodDefinition;
            parseClassDeclaration$1007 = extra$888.parseClassDeclaration;
            parseClassExpression$1006 = extra$888.parseClassExpression;
            parseClassBody$1005 = extra$888.parseClassBody;
        }
        if (typeof extra$888.scanRegExp === 'function') {
            advance$918 = extra$888.advance;
            scanRegExp$915 = extra$888.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1031(object$1585, properties$1586) {
        var entry$1587, result$1588 = {};
        for (entry$1587 in object$1585) {
            if (object$1585.hasOwnProperty(entry$1587)) {
                result$1588[entry$1587] = object$1585[entry$1587];
            }
        }
        for (entry$1587 in properties$1586) {
            if (properties$1586.hasOwnProperty(entry$1587)) {
                result$1588[entry$1587] = properties$1586[entry$1587];
            }
        }
        return result$1588;
    }
    function tokenize$1032(code$1589, options$1590) {
        var toString$1591, token$1592, tokens$1593;
        toString$1591 = String;
        if (typeof code$1589 !== 'string' && !(code$1589 instanceof String)) {
            code$1589 = toString$1591(code$1589);
        }
        delegate$882 = SyntaxTreeDelegate$870;
        source$872 = code$1589;
        index$874 = 0;
        lineNumber$875 = source$872.length > 0 ? 1 : 0;
        lineStart$876 = 0;
        length$881 = source$872.length;
        lookahead$885 = null;
        state$887 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$888 = {};
        // Options matching.
        options$1590 = options$1590 || {};
        // Of course we collect tokens here.
        options$1590.tokens = true;
        extra$888.tokens = [];
        extra$888.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$888.openParenToken = -1;
        extra$888.openCurlyToken = -1;
        extra$888.range = typeof options$1590.range === 'boolean' && options$1590.range;
        extra$888.loc = typeof options$1590.loc === 'boolean' && options$1590.loc;
        if (typeof options$1590.comment === 'boolean' && options$1590.comment) {
            extra$888.comments = [];
        }
        if (typeof options$1590.tolerant === 'boolean' && options$1590.tolerant) {
            extra$888.errors = [];
        }
        if (length$881 > 0) {
            if (typeof source$872[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1589 instanceof String) {
                    source$872 = code$1589.valueOf();
                }
            }
        }
        patch$1029();
        try {
            peek$920();
            if (lookahead$885.type === Token$863.EOF) {
                return extra$888.tokens;
            }
            token$1592 = lex$919();
            while (lookahead$885.type !== Token$863.EOF) {
                try {
                    token$1592 = lex$919();
                } catch (lexError$1594) {
                    token$1592 = lookahead$885;
                    if (extra$888.errors) {
                        extra$888.errors.push(lexError$1594);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1594;
                    }
                }
            }
            filterTokenLocation$1021();
            tokens$1593 = extra$888.tokens;
            if (typeof extra$888.comments !== 'undefined') {
                filterCommentLocation$1018();
                tokens$1593.comments = extra$888.comments;
            }
            if (typeof extra$888.errors !== 'undefined') {
                tokens$1593.errors = extra$888.errors;
            }
        } catch (e$1595) {
            throw e$1595;
        } finally {
            unpatch$1030();
            extra$888 = {};
        }
        return tokens$1593;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1033(toks$1596, start$1597, inExprDelim$1598, parentIsBlock$1599) {
        var assignOps$1600 = [
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
        var binaryOps$1601 = [
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
        var unaryOps$1602 = [
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
        function back$1603(n$1604) {
            var idx$1605 = toks$1596.length - n$1604 > 0 ? toks$1596.length - n$1604 : 0;
            return toks$1596[idx$1605];
        }
        if (inExprDelim$1598 && toks$1596.length - (start$1597 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1603(start$1597 + 2).value === ':' && parentIsBlock$1599) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$890(back$1603(start$1597 + 2).value, unaryOps$1602.concat(binaryOps$1601).concat(assignOps$1600))) {
            // ... + {...}
            return false;
        } else if (back$1603(start$1597 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1606 = typeof back$1603(start$1597 + 1).startLineNumber !== 'undefined' ? back$1603(start$1597 + 1).startLineNumber : back$1603(start$1597 + 1).lineNumber;
            if (back$1603(start$1597 + 2).lineNumber !== currLineNumber$1606) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$890(back$1603(start$1597 + 2).value, [
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
    function readToken$1034(toks$1607, inExprDelim$1608, parentIsBlock$1609) {
        var delimiters$1610 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1611 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1612 = toks$1607.length - 1;
        var comments$1613, commentsLen$1614 = extra$888.comments.length;
        function back$1615(n$1619) {
            var idx$1620 = toks$1607.length - n$1619 > 0 ? toks$1607.length - n$1619 : 0;
            return toks$1607[idx$1620];
        }
        function attachComments$1616(token$1621) {
            if (comments$1613) {
                token$1621.leadingComments = comments$1613;
            }
            return token$1621;
        }
        function _advance$1617() {
            return attachComments$1616(advance$918());
        }
        function _scanRegExp$1618() {
            return attachComments$1616(scanRegExp$915());
        }
        skipComment$902();
        if (extra$888.comments.length > commentsLen$1614) {
            comments$1613 = extra$888.comments.slice(commentsLen$1614);
        }
        if (isIn$890(source$872[index$874], delimiters$1610)) {
            return attachComments$1616(readDelim$1035(toks$1607, inExprDelim$1608, parentIsBlock$1609));
        }
        if (source$872[index$874] === '/') {
            var prev$1622 = back$1615(1);
            if (prev$1622) {
                if (prev$1622.value === '()') {
                    if (isIn$890(back$1615(2).value, parenIdents$1611)) {
                        // ... if (...) / ...
                        return _scanRegExp$1618();
                    }
                    // ... (...) / ...
                    return _advance$1617();
                }
                if (prev$1622.value === '{}') {
                    if (blockAllowed$1033(toks$1607, 0, inExprDelim$1608, parentIsBlock$1609)) {
                        if (back$1615(2).value === '()') {
                            // named function
                            if (back$1615(4).value === 'function') {
                                if (!blockAllowed$1033(toks$1607, 3, inExprDelim$1608, parentIsBlock$1609)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1617();
                                }
                                if (toks$1607.length - 5 <= 0 && inExprDelim$1608) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1617();
                                }
                            }
                            // unnamed function
                            if (back$1615(3).value === 'function') {
                                if (!blockAllowed$1033(toks$1607, 2, inExprDelim$1608, parentIsBlock$1609)) {
                                    // new function (...) {...} / ...
                                    return _advance$1617();
                                }
                                if (toks$1607.length - 4 <= 0 && inExprDelim$1608) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1617();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1618();
                    } else {
                        // ... + {...} / ...
                        return _advance$1617();
                    }
                }
                if (prev$1622.type === Token$863.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1618();
                }
                if (isKeyword$901(prev$1622.value)) {
                    // typeof /...
                    return _scanRegExp$1618();
                }
                return _advance$1617();
            }
            return _scanRegExp$1618();
        }
        return _advance$1617();
    }
    function readDelim$1035(toks$1623, inExprDelim$1624, parentIsBlock$1625) {
        var startDelim$1626 = advance$918(), matchDelim$1627 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1628 = [];
        var delimiters$1629 = [
                '(',
                '{',
                '['
            ];
        assert$889(delimiters$1629.indexOf(startDelim$1626.value) !== -1, 'Need to begin at the delimiter');
        var token$1630 = startDelim$1626;
        var startLineNumber$1631 = token$1630.lineNumber;
        var startLineStart$1632 = token$1630.lineStart;
        var startRange$1633 = token$1630.range;
        var delimToken$1634 = {};
        delimToken$1634.type = Token$863.Delimiter;
        delimToken$1634.value = startDelim$1626.value + matchDelim$1627[startDelim$1626.value];
        delimToken$1634.startLineNumber = startLineNumber$1631;
        delimToken$1634.startLineStart = startLineStart$1632;
        delimToken$1634.startRange = startRange$1633;
        var delimIsBlock$1635 = false;
        if (startDelim$1626.value === '{') {
            delimIsBlock$1635 = blockAllowed$1033(toks$1623.concat(delimToken$1634), 0, inExprDelim$1624, parentIsBlock$1625);
        }
        while (index$874 <= length$881) {
            token$1630 = readToken$1034(inner$1628, startDelim$1626.value === '(' || startDelim$1626.value === '[', delimIsBlock$1635);
            if (token$1630.type === Token$863.Punctuator && token$1630.value === matchDelim$1627[startDelim$1626.value]) {
                if (token$1630.leadingComments) {
                    delimToken$1634.trailingComments = token$1630.leadingComments;
                }
                break;
            } else if (token$1630.type === Token$863.EOF) {
                throwError$923({}, Messages$868.UnexpectedEOS);
            } else {
                inner$1628.push(token$1630);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$874 >= length$881 && matchDelim$1627[startDelim$1626.value] !== source$872[length$881 - 1]) {
            throwError$923({}, Messages$868.UnexpectedEOS);
        }
        var endLineNumber$1636 = token$1630.lineNumber;
        var endLineStart$1637 = token$1630.lineStart;
        var endRange$1638 = token$1630.range;
        delimToken$1634.inner = inner$1628;
        delimToken$1634.endLineNumber = endLineNumber$1636;
        delimToken$1634.endLineStart = endLineStart$1637;
        delimToken$1634.endRange = endRange$1638;
        return delimToken$1634;
    }
    // (Str) -> [...CSyntax]
    function read$1036(code$1639) {
        var token$1640, tokenTree$1641 = [];
        extra$888 = {};
        extra$888.comments = [];
        patch$1029();
        source$872 = code$1639;
        index$874 = 0;
        lineNumber$875 = source$872.length > 0 ? 1 : 0;
        lineStart$876 = 0;
        length$881 = source$872.length;
        state$887 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$874 < length$881) {
            tokenTree$1641.push(readToken$1034(tokenTree$1641, false, false));
        }
        var last$1642 = tokenTree$1641[tokenTree$1641.length - 1];
        if (last$1642 && last$1642.type !== Token$863.EOF) {
            tokenTree$1641.push({
                type: Token$863.EOF,
                value: '',
                lineNumber: last$1642.lineNumber,
                lineStart: last$1642.lineStart,
                range: [
                    index$874,
                    index$874
                ]
            });
        }
        return expander$862.tokensToSyntax(tokenTree$1641);
    }
    function parse$1037(code$1643, options$1644) {
        var program$1645, toString$1646;
        extra$888 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1643)) {
            tokenStream$883 = code$1643;
            length$881 = tokenStream$883.length;
            lineNumber$875 = tokenStream$883.length > 0 ? 1 : 0;
            source$872 = undefined;
        } else {
            toString$1646 = String;
            if (typeof code$1643 !== 'string' && !(code$1643 instanceof String)) {
                code$1643 = toString$1646(code$1643);
            }
            source$872 = code$1643;
            length$881 = source$872.length;
            lineNumber$875 = source$872.length > 0 ? 1 : 0;
        }
        delegate$882 = SyntaxTreeDelegate$870;
        streamIndex$884 = -1;
        index$874 = 0;
        lineStart$876 = 0;
        sm_lineStart$878 = 0;
        sm_lineNumber$877 = lineNumber$875;
        sm_index$880 = 0;
        sm_range$879 = [
            0,
            0
        ];
        lookahead$885 = null;
        state$887 = {
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
        if (typeof options$1644 !== 'undefined') {
            extra$888.range = typeof options$1644.range === 'boolean' && options$1644.range;
            extra$888.loc = typeof options$1644.loc === 'boolean' && options$1644.loc;
            if (extra$888.loc && options$1644.source !== null && options$1644.source !== undefined) {
                delegate$882 = extend$1031(delegate$882, {
                    'postProcess': function (node$1647) {
                        node$1647.loc.source = toString$1646(options$1644.source);
                        return node$1647;
                    }
                });
            }
            if (typeof options$1644.tokens === 'boolean' && options$1644.tokens) {
                extra$888.tokens = [];
            }
            if (typeof options$1644.comment === 'boolean' && options$1644.comment) {
                extra$888.comments = [];
            }
            if (typeof options$1644.tolerant === 'boolean' && options$1644.tolerant) {
                extra$888.errors = [];
            }
        }
        if (length$881 > 0) {
            if (source$872 && typeof source$872[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1643 instanceof String) {
                    source$872 = code$1643.valueOf();
                }
            }
        }
        extra$888 = { loc: true };
        patch$1029();
        try {
            program$1645 = parseProgram$1015();
            if (typeof extra$888.comments !== 'undefined') {
                filterCommentLocation$1018();
                program$1645.comments = extra$888.comments;
            }
            if (typeof extra$888.tokens !== 'undefined') {
                filterTokenLocation$1021();
                program$1645.tokens = extra$888.tokens;
            }
            if (typeof extra$888.errors !== 'undefined') {
                program$1645.errors = extra$888.errors;
            }
            if (extra$888.range || extra$888.loc) {
                program$1645.body = filterGroup$1027(program$1645.body);
            }
        } catch (e$1648) {
            throw e$1648;
        } finally {
            unpatch$1030();
            extra$888 = {};
        }
        return program$1645;
    }
    exports$861.tokenize = tokenize$1032;
    exports$861.read = read$1036;
    exports$861.Token = Token$863;
    exports$861.parse = parse$1037;
    // Deep copy.
    exports$861.Syntax = function () {
        var name$1649, types$1650 = {};
        if (typeof Object.create === 'function') {
            types$1650 = Object.create(null);
        }
        for (name$1649 in Syntax$866) {
            if (Syntax$866.hasOwnProperty(name$1649)) {
                types$1650[name$1649] = Syntax$866[name$1649];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1650);
        }
        return types$1650;
    }();
}));
//# sourceMappingURL=parser.js.map