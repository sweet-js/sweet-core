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
(function (root$857, factory$858) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$858);
    } else if (typeof exports !== 'undefined') {
        factory$858(exports, require('./expander'));
    } else {
        factory$858(root$857.esprima = {});
    }
}(this, function (exports$859, expander$860) {
    'use strict';
    var Token$861, TokenName$862, FnExprTokens$863, Syntax$864, PropertyKind$865, Messages$866, Regex$867, SyntaxTreeDelegate$868, ClassPropertyType$869, source$870, strict$871, index$872, lineNumber$873, lineStart$874, sm_lineNumber$875, sm_lineStart$876, sm_range$877, sm_index$878, length$879, delegate$880, tokenStream$881, streamIndex$882, lookahead$883, lookaheadIndex$884, state$885, extra$886;
    Token$861 = {
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
    TokenName$862 = {};
    TokenName$862[Token$861.BooleanLiteral] = 'Boolean';
    TokenName$862[Token$861.EOF] = '<end>';
    TokenName$862[Token$861.Identifier] = 'Identifier';
    TokenName$862[Token$861.Keyword] = 'Keyword';
    TokenName$862[Token$861.NullLiteral] = 'Null';
    TokenName$862[Token$861.NumericLiteral] = 'Numeric';
    TokenName$862[Token$861.Punctuator] = 'Punctuator';
    TokenName$862[Token$861.StringLiteral] = 'String';
    TokenName$862[Token$861.RegularExpression] = 'RegularExpression';
    TokenName$862[Token$861.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$863 = [
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
    Syntax$864 = {
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
    PropertyKind$865 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$869 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$866 = {
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
    Regex$867 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$887(condition$1036, message$1037) {
        if (!condition$1036) {
            throw new Error('ASSERT: ' + message$1037);
        }
    }
    function isIn$888(el$1038, list$1039) {
        return list$1039.indexOf(el$1038) !== -1;
    }
    function isDecimalDigit$889(ch$1040) {
        return ch$1040 >= 48 && ch$1040 <= 57;
    }    // 0..9
    function isHexDigit$890(ch$1041) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1041) >= 0;
    }
    function isOctalDigit$891(ch$1042) {
        return '01234567'.indexOf(ch$1042) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$892(ch$1043) {
        return ch$1043 === 32 || ch$1043 === 9 || ch$1043 === 11 || ch$1043 === 12 || ch$1043 === 160 || ch$1043 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1043)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$893(ch$1044) {
        return ch$1044 === 10 || ch$1044 === 13 || ch$1044 === 8232 || ch$1044 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$894(ch$1045) {
        return ch$1045 === 36 || ch$1045 === 95 || ch$1045 >= 65 && ch$1045 <= 90 || ch$1045 >= 97 && ch$1045 <= 122 || ch$1045 === 92 || ch$1045 >= 128 && Regex$867.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1045));
    }
    function isIdentifierPart$895(ch$1046) {
        return ch$1046 === 36 || ch$1046 === 95 || ch$1046 >= 65 && ch$1046 <= 90 || ch$1046 >= 97 && ch$1046 <= 122 || ch$1046 >= 48 && ch$1046 <= 57 || ch$1046 === 92 || ch$1046 >= 128 && Regex$867.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1046));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$896(id$1047) {
        switch (id$1047) {
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
    function isStrictModeReservedWord$897(id$1048) {
        switch (id$1048) {
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
    function isRestrictedWord$898(id$1049) {
        return id$1049 === 'eval' || id$1049 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$899(id$1050) {
        if (strict$871 && isStrictModeReservedWord$897(id$1050)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1050.length) {
        case 2:
            return id$1050 === 'if' || id$1050 === 'in' || id$1050 === 'do';
        case 3:
            return id$1050 === 'var' || id$1050 === 'for' || id$1050 === 'new' || id$1050 === 'try' || id$1050 === 'let';
        case 4:
            return id$1050 === 'this' || id$1050 === 'else' || id$1050 === 'case' || id$1050 === 'void' || id$1050 === 'with' || id$1050 === 'enum';
        case 5:
            return id$1050 === 'while' || id$1050 === 'break' || id$1050 === 'catch' || id$1050 === 'throw' || id$1050 === 'const' || id$1050 === 'yield' || id$1050 === 'class' || id$1050 === 'super';
        case 6:
            return id$1050 === 'return' || id$1050 === 'typeof' || id$1050 === 'delete' || id$1050 === 'switch' || id$1050 === 'export' || id$1050 === 'import';
        case 7:
            return id$1050 === 'default' || id$1050 === 'finally' || id$1050 === 'extends';
        case 8:
            return id$1050 === 'function' || id$1050 === 'continue' || id$1050 === 'debugger';
        case 10:
            return id$1050 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$900() {
        var ch$1051, blockComment$1052, lineComment$1053;
        blockComment$1052 = false;
        lineComment$1053 = false;
        while (index$872 < length$879) {
            ch$1051 = source$870.charCodeAt(index$872);
            if (lineComment$1053) {
                ++index$872;
                if (isLineTerminator$893(ch$1051)) {
                    lineComment$1053 = false;
                    if (ch$1051 === 13 && source$870.charCodeAt(index$872) === 10) {
                        ++index$872;
                    }
                    ++lineNumber$873;
                    lineStart$874 = index$872;
                }
            } else if (blockComment$1052) {
                if (isLineTerminator$893(ch$1051)) {
                    if (ch$1051 === 13 && source$870.charCodeAt(index$872 + 1) === 10) {
                        ++index$872;
                    }
                    ++lineNumber$873;
                    ++index$872;
                    lineStart$874 = index$872;
                    if (index$872 >= length$879) {
                        throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1051 = source$870.charCodeAt(index$872++);
                    if (index$872 >= length$879) {
                        throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1051 === 42) {
                        ch$1051 = source$870.charCodeAt(index$872);
                        if (ch$1051 === 47) {
                            ++index$872;
                            blockComment$1052 = false;
                        }
                    }
                }
            } else if (ch$1051 === 47) {
                ch$1051 = source$870.charCodeAt(index$872 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1051 === 47) {
                    index$872 += 2;
                    lineComment$1053 = true;
                } else if (ch$1051 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$872 += 2;
                    blockComment$1052 = true;
                    if (index$872 >= length$879) {
                        throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$892(ch$1051)) {
                ++index$872;
            } else if (isLineTerminator$893(ch$1051)) {
                ++index$872;
                if (ch$1051 === 13 && source$870.charCodeAt(index$872) === 10) {
                    ++index$872;
                }
                ++lineNumber$873;
                lineStart$874 = index$872;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$901(prefix$1054) {
        var i$1055, len$1056, ch$1057, code$1058 = 0;
        len$1056 = prefix$1054 === 'u' ? 4 : 2;
        for (i$1055 = 0; i$1055 < len$1056; ++i$1055) {
            if (index$872 < length$879 && isHexDigit$890(source$870[index$872])) {
                ch$1057 = source$870[index$872++];
                code$1058 = code$1058 * 16 + '0123456789abcdef'.indexOf(ch$1057.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1058);
    }
    function scanUnicodeCodePointEscape$902() {
        var ch$1059, code$1060, cu1$1061, cu2$1062;
        ch$1059 = source$870[index$872];
        code$1060 = 0;
        // At least, one hex digit is required.
        if (ch$1059 === '}') {
            throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
        }
        while (index$872 < length$879) {
            ch$1059 = source$870[index$872++];
            if (!isHexDigit$890(ch$1059)) {
                break;
            }
            code$1060 = code$1060 * 16 + '0123456789abcdef'.indexOf(ch$1059.toLowerCase());
        }
        if (code$1060 > 1114111 || ch$1059 !== '}') {
            throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1060 <= 65535) {
            return String.fromCharCode(code$1060);
        }
        cu1$1061 = (code$1060 - 65536 >> 10) + 55296;
        cu2$1062 = (code$1060 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1061, cu2$1062);
    }
    function getEscapedIdentifier$903() {
        var ch$1063, id$1064;
        ch$1063 = source$870.charCodeAt(index$872++);
        id$1064 = String.fromCharCode(ch$1063);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1063 === 92) {
            if (source$870.charCodeAt(index$872) !== 117) {
                throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
            }
            ++index$872;
            ch$1063 = scanHexEscape$901('u');
            if (!ch$1063 || ch$1063 === '\\' || !isIdentifierStart$894(ch$1063.charCodeAt(0))) {
                throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
            }
            id$1064 = ch$1063;
        }
        while (index$872 < length$879) {
            ch$1063 = source$870.charCodeAt(index$872);
            if (!isIdentifierPart$895(ch$1063)) {
                break;
            }
            ++index$872;
            id$1064 += String.fromCharCode(ch$1063);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1063 === 92) {
                id$1064 = id$1064.substr(0, id$1064.length - 1);
                if (source$870.charCodeAt(index$872) !== 117) {
                    throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
                }
                ++index$872;
                ch$1063 = scanHexEscape$901('u');
                if (!ch$1063 || ch$1063 === '\\' || !isIdentifierPart$895(ch$1063.charCodeAt(0))) {
                    throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
                }
                id$1064 += ch$1063;
            }
        }
        return id$1064;
    }
    function getIdentifier$904() {
        var start$1065, ch$1066;
        start$1065 = index$872++;
        while (index$872 < length$879) {
            ch$1066 = source$870.charCodeAt(index$872);
            if (ch$1066 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$872 = start$1065;
                return getEscapedIdentifier$903();
            }
            if (isIdentifierPart$895(ch$1066)) {
                ++index$872;
            } else {
                break;
            }
        }
        return source$870.slice(start$1065, index$872);
    }
    function scanIdentifier$905() {
        var start$1067, id$1068, type$1069;
        start$1067 = index$872;
        // Backslash (char #92) starts an escaped character.
        id$1068 = source$870.charCodeAt(index$872) === 92 ? getEscapedIdentifier$903() : getIdentifier$904();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1068.length === 1) {
            type$1069 = Token$861.Identifier;
        } else if (isKeyword$899(id$1068)) {
            type$1069 = Token$861.Keyword;
        } else if (id$1068 === 'null') {
            type$1069 = Token$861.NullLiteral;
        } else if (id$1068 === 'true' || id$1068 === 'false') {
            type$1069 = Token$861.BooleanLiteral;
        } else {
            type$1069 = Token$861.Identifier;
        }
        return {
            type: type$1069,
            value: id$1068,
            lineNumber: lineNumber$873,
            lineStart: lineStart$874,
            range: [
                start$1067,
                index$872
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$906() {
        var start$1070 = index$872, code$1071 = source$870.charCodeAt(index$872), code2$1072, ch1$1073 = source$870[index$872], ch2$1074, ch3$1075, ch4$1076;
        switch (code$1071) {
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
            ++index$872;
            if (extra$886.tokenize) {
                if (code$1071 === 40) {
                    extra$886.openParenToken = extra$886.tokens.length;
                } else if (code$1071 === 123) {
                    extra$886.openCurlyToken = extra$886.tokens.length;
                }
            }
            return {
                type: Token$861.Punctuator,
                value: String.fromCharCode(code$1071),
                lineNumber: lineNumber$873,
                lineStart: lineStart$874,
                range: [
                    start$1070,
                    index$872
                ]
            };
        default:
            code2$1072 = source$870.charCodeAt(index$872 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1072 === 61) {
                switch (code$1071) {
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
                    index$872 += 2;
                    return {
                        type: Token$861.Punctuator,
                        value: String.fromCharCode(code$1071) + String.fromCharCode(code2$1072),
                        lineNumber: lineNumber$873,
                        lineStart: lineStart$874,
                        range: [
                            start$1070,
                            index$872
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$872 += 2;
                    // !== and ===
                    if (source$870.charCodeAt(index$872) === 61) {
                        ++index$872;
                    }
                    return {
                        type: Token$861.Punctuator,
                        value: source$870.slice(start$1070, index$872),
                        lineNumber: lineNumber$873,
                        lineStart: lineStart$874,
                        range: [
                            start$1070,
                            index$872
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1074 = source$870[index$872 + 1];
        ch3$1075 = source$870[index$872 + 2];
        ch4$1076 = source$870[index$872 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1073 === '>' && ch2$1074 === '>' && ch3$1075 === '>') {
            if (ch4$1076 === '=') {
                index$872 += 4;
                return {
                    type: Token$861.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$873,
                    lineStart: lineStart$874,
                    range: [
                        start$1070,
                        index$872
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1073 === '>' && ch2$1074 === '>' && ch3$1075 === '>') {
            index$872 += 3;
            return {
                type: Token$861.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$873,
                lineStart: lineStart$874,
                range: [
                    start$1070,
                    index$872
                ]
            };
        }
        if (ch1$1073 === '<' && ch2$1074 === '<' && ch3$1075 === '=') {
            index$872 += 3;
            return {
                type: Token$861.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$873,
                lineStart: lineStart$874,
                range: [
                    start$1070,
                    index$872
                ]
            };
        }
        if (ch1$1073 === '>' && ch2$1074 === '>' && ch3$1075 === '=') {
            index$872 += 3;
            return {
                type: Token$861.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$873,
                lineStart: lineStart$874,
                range: [
                    start$1070,
                    index$872
                ]
            };
        }
        if (ch1$1073 === '.' && ch2$1074 === '.' && ch3$1075 === '.') {
            index$872 += 3;
            return {
                type: Token$861.Punctuator,
                value: '...',
                lineNumber: lineNumber$873,
                lineStart: lineStart$874,
                range: [
                    start$1070,
                    index$872
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1073 === ch2$1074 && '+-<>&|'.indexOf(ch1$1073) >= 0) {
            index$872 += 2;
            return {
                type: Token$861.Punctuator,
                value: ch1$1073 + ch2$1074,
                lineNumber: lineNumber$873,
                lineStart: lineStart$874,
                range: [
                    start$1070,
                    index$872
                ]
            };
        }
        if (ch1$1073 === '=' && ch2$1074 === '>') {
            index$872 += 2;
            return {
                type: Token$861.Punctuator,
                value: '=>',
                lineNumber: lineNumber$873,
                lineStart: lineStart$874,
                range: [
                    start$1070,
                    index$872
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1073) >= 0) {
            ++index$872;
            return {
                type: Token$861.Punctuator,
                value: ch1$1073,
                lineNumber: lineNumber$873,
                lineStart: lineStart$874,
                range: [
                    start$1070,
                    index$872
                ]
            };
        }
        if (ch1$1073 === '.') {
            ++index$872;
            return {
                type: Token$861.Punctuator,
                value: ch1$1073,
                lineNumber: lineNumber$873,
                lineStart: lineStart$874,
                range: [
                    start$1070,
                    index$872
                ]
            };
        }
        throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$907(start$1077) {
        var number$1078 = '';
        while (index$872 < length$879) {
            if (!isHexDigit$890(source$870[index$872])) {
                break;
            }
            number$1078 += source$870[index$872++];
        }
        if (number$1078.length === 0) {
            throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$894(source$870.charCodeAt(index$872))) {
            throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$861.NumericLiteral,
            value: parseInt('0x' + number$1078, 16),
            lineNumber: lineNumber$873,
            lineStart: lineStart$874,
            range: [
                start$1077,
                index$872
            ]
        };
    }
    function scanOctalLiteral$908(prefix$1079, start$1080) {
        var number$1081, octal$1082;
        if (isOctalDigit$891(prefix$1079)) {
            octal$1082 = true;
            number$1081 = '0' + source$870[index$872++];
        } else {
            octal$1082 = false;
            ++index$872;
            number$1081 = '';
        }
        while (index$872 < length$879) {
            if (!isOctalDigit$891(source$870[index$872])) {
                break;
            }
            number$1081 += source$870[index$872++];
        }
        if (!octal$1082 && number$1081.length === 0) {
            // only 0o or 0O
            throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$894(source$870.charCodeAt(index$872)) || isDecimalDigit$889(source$870.charCodeAt(index$872))) {
            throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$861.NumericLiteral,
            value: parseInt(number$1081, 8),
            octal: octal$1082,
            lineNumber: lineNumber$873,
            lineStart: lineStart$874,
            range: [
                start$1080,
                index$872
            ]
        };
    }
    function scanNumericLiteral$909() {
        var number$1083, start$1084, ch$1085, octal$1086;
        ch$1085 = source$870[index$872];
        assert$887(isDecimalDigit$889(ch$1085.charCodeAt(0)) || ch$1085 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1084 = index$872;
        number$1083 = '';
        if (ch$1085 !== '.') {
            number$1083 = source$870[index$872++];
            ch$1085 = source$870[index$872];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1083 === '0') {
                if (ch$1085 === 'x' || ch$1085 === 'X') {
                    ++index$872;
                    return scanHexLiteral$907(start$1084);
                }
                if (ch$1085 === 'b' || ch$1085 === 'B') {
                    ++index$872;
                    number$1083 = '';
                    while (index$872 < length$879) {
                        ch$1085 = source$870[index$872];
                        if (ch$1085 !== '0' && ch$1085 !== '1') {
                            break;
                        }
                        number$1083 += source$870[index$872++];
                    }
                    if (number$1083.length === 0) {
                        // only 0b or 0B
                        throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$872 < length$879) {
                        ch$1085 = source$870.charCodeAt(index$872);
                        if (isIdentifierStart$894(ch$1085) || isDecimalDigit$889(ch$1085)) {
                            throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$861.NumericLiteral,
                        value: parseInt(number$1083, 2),
                        lineNumber: lineNumber$873,
                        lineStart: lineStart$874,
                        range: [
                            start$1084,
                            index$872
                        ]
                    };
                }
                if (ch$1085 === 'o' || ch$1085 === 'O' || isOctalDigit$891(ch$1085)) {
                    return scanOctalLiteral$908(ch$1085, start$1084);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1085 && isDecimalDigit$889(ch$1085.charCodeAt(0))) {
                    throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$889(source$870.charCodeAt(index$872))) {
                number$1083 += source$870[index$872++];
            }
            ch$1085 = source$870[index$872];
        }
        if (ch$1085 === '.') {
            number$1083 += source$870[index$872++];
            while (isDecimalDigit$889(source$870.charCodeAt(index$872))) {
                number$1083 += source$870[index$872++];
            }
            ch$1085 = source$870[index$872];
        }
        if (ch$1085 === 'e' || ch$1085 === 'E') {
            number$1083 += source$870[index$872++];
            ch$1085 = source$870[index$872];
            if (ch$1085 === '+' || ch$1085 === '-') {
                number$1083 += source$870[index$872++];
            }
            if (isDecimalDigit$889(source$870.charCodeAt(index$872))) {
                while (isDecimalDigit$889(source$870.charCodeAt(index$872))) {
                    number$1083 += source$870[index$872++];
                }
            } else {
                throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$894(source$870.charCodeAt(index$872))) {
            throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$861.NumericLiteral,
            value: parseFloat(number$1083),
            lineNumber: lineNumber$873,
            lineStart: lineStart$874,
            range: [
                start$1084,
                index$872
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$910() {
        var str$1087 = '', quote$1088, start$1089, ch$1090, code$1091, unescaped$1092, restore$1093, octal$1094 = false;
        quote$1088 = source$870[index$872];
        assert$887(quote$1088 === '\'' || quote$1088 === '"', 'String literal must starts with a quote');
        start$1089 = index$872;
        ++index$872;
        while (index$872 < length$879) {
            ch$1090 = source$870[index$872++];
            if (ch$1090 === quote$1088) {
                quote$1088 = '';
                break;
            } else if (ch$1090 === '\\') {
                ch$1090 = source$870[index$872++];
                if (!ch$1090 || !isLineTerminator$893(ch$1090.charCodeAt(0))) {
                    switch (ch$1090) {
                    case 'n':
                        str$1087 += '\n';
                        break;
                    case 'r':
                        str$1087 += '\r';
                        break;
                    case 't':
                        str$1087 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$870[index$872] === '{') {
                            ++index$872;
                            str$1087 += scanUnicodeCodePointEscape$902();
                        } else {
                            restore$1093 = index$872;
                            unescaped$1092 = scanHexEscape$901(ch$1090);
                            if (unescaped$1092) {
                                str$1087 += unescaped$1092;
                            } else {
                                index$872 = restore$1093;
                                str$1087 += ch$1090;
                            }
                        }
                        break;
                    case 'b':
                        str$1087 += '\b';
                        break;
                    case 'f':
                        str$1087 += '\f';
                        break;
                    case 'v':
                        str$1087 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$891(ch$1090)) {
                            code$1091 = '01234567'.indexOf(ch$1090);
                            // \0 is not octal escape sequence
                            if (code$1091 !== 0) {
                                octal$1094 = true;
                            }
                            if (index$872 < length$879 && isOctalDigit$891(source$870[index$872])) {
                                octal$1094 = true;
                                code$1091 = code$1091 * 8 + '01234567'.indexOf(source$870[index$872++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1090) >= 0 && index$872 < length$879 && isOctalDigit$891(source$870[index$872])) {
                                    code$1091 = code$1091 * 8 + '01234567'.indexOf(source$870[index$872++]);
                                }
                            }
                            str$1087 += String.fromCharCode(code$1091);
                        } else {
                            str$1087 += ch$1090;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$873;
                    if (ch$1090 === '\r' && source$870[index$872] === '\n') {
                        ++index$872;
                    }
                }
            } else if (isLineTerminator$893(ch$1090.charCodeAt(0))) {
                break;
            } else {
                str$1087 += ch$1090;
            }
        }
        if (quote$1088 !== '') {
            throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$861.StringLiteral,
            value: str$1087,
            octal: octal$1094,
            lineNumber: lineNumber$873,
            lineStart: lineStart$874,
            range: [
                start$1089,
                index$872
            ]
        };
    }
    function scanTemplate$911() {
        var cooked$1095 = '', ch$1096, start$1097, terminated$1098, tail$1099, restore$1100, unescaped$1101, code$1102, octal$1103;
        terminated$1098 = false;
        tail$1099 = false;
        start$1097 = index$872;
        ++index$872;
        while (index$872 < length$879) {
            ch$1096 = source$870[index$872++];
            if (ch$1096 === '`') {
                tail$1099 = true;
                terminated$1098 = true;
                break;
            } else if (ch$1096 === '$') {
                if (source$870[index$872] === '{') {
                    ++index$872;
                    terminated$1098 = true;
                    break;
                }
                cooked$1095 += ch$1096;
            } else if (ch$1096 === '\\') {
                ch$1096 = source$870[index$872++];
                if (!isLineTerminator$893(ch$1096.charCodeAt(0))) {
                    switch (ch$1096) {
                    case 'n':
                        cooked$1095 += '\n';
                        break;
                    case 'r':
                        cooked$1095 += '\r';
                        break;
                    case 't':
                        cooked$1095 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$870[index$872] === '{') {
                            ++index$872;
                            cooked$1095 += scanUnicodeCodePointEscape$902();
                        } else {
                            restore$1100 = index$872;
                            unescaped$1101 = scanHexEscape$901(ch$1096);
                            if (unescaped$1101) {
                                cooked$1095 += unescaped$1101;
                            } else {
                                index$872 = restore$1100;
                                cooked$1095 += ch$1096;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1095 += '\b';
                        break;
                    case 'f':
                        cooked$1095 += '\f';
                        break;
                    case 'v':
                        cooked$1095 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$891(ch$1096)) {
                            code$1102 = '01234567'.indexOf(ch$1096);
                            // \0 is not octal escape sequence
                            if (code$1102 !== 0) {
                                octal$1103 = true;
                            }
                            if (index$872 < length$879 && isOctalDigit$891(source$870[index$872])) {
                                octal$1103 = true;
                                code$1102 = code$1102 * 8 + '01234567'.indexOf(source$870[index$872++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1096) >= 0 && index$872 < length$879 && isOctalDigit$891(source$870[index$872])) {
                                    code$1102 = code$1102 * 8 + '01234567'.indexOf(source$870[index$872++]);
                                }
                            }
                            cooked$1095 += String.fromCharCode(code$1102);
                        } else {
                            cooked$1095 += ch$1096;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$873;
                    if (ch$1096 === '\r' && source$870[index$872] === '\n') {
                        ++index$872;
                    }
                }
            } else if (isLineTerminator$893(ch$1096.charCodeAt(0))) {
                ++lineNumber$873;
                if (ch$1096 === '\r' && source$870[index$872] === '\n') {
                    ++index$872;
                }
                cooked$1095 += '\n';
            } else {
                cooked$1095 += ch$1096;
            }
        }
        if (!terminated$1098) {
            throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$861.Template,
            value: {
                cooked: cooked$1095,
                raw: source$870.slice(start$1097 + 1, index$872 - (tail$1099 ? 1 : 2))
            },
            tail: tail$1099,
            octal: octal$1103,
            lineNumber: lineNumber$873,
            lineStart: lineStart$874,
            range: [
                start$1097,
                index$872
            ]
        };
    }
    function scanTemplateElement$912(option$1104) {
        var startsWith$1105, template$1106;
        lookahead$883 = null;
        skipComment$900();
        startsWith$1105 = option$1104.head ? '`' : '}';
        if (source$870[index$872] !== startsWith$1105) {
            throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
        }
        template$1106 = scanTemplate$911();
        peek$918();
        return template$1106;
    }
    function scanRegExp$913() {
        var str$1107, ch$1108, start$1109, pattern$1110, flags$1111, value$1112, classMarker$1113 = false, restore$1114, terminated$1115 = false;
        lookahead$883 = null;
        skipComment$900();
        start$1109 = index$872;
        ch$1108 = source$870[index$872];
        assert$887(ch$1108 === '/', 'Regular expression literal must start with a slash');
        str$1107 = source$870[index$872++];
        while (index$872 < length$879) {
            ch$1108 = source$870[index$872++];
            str$1107 += ch$1108;
            if (classMarker$1113) {
                if (ch$1108 === ']') {
                    classMarker$1113 = false;
                }
            } else {
                if (ch$1108 === '\\') {
                    ch$1108 = source$870[index$872++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$893(ch$1108.charCodeAt(0))) {
                        throwError$921({}, Messages$866.UnterminatedRegExp);
                    }
                    str$1107 += ch$1108;
                } else if (ch$1108 === '/') {
                    terminated$1115 = true;
                    break;
                } else if (ch$1108 === '[') {
                    classMarker$1113 = true;
                } else if (isLineTerminator$893(ch$1108.charCodeAt(0))) {
                    throwError$921({}, Messages$866.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1115) {
            throwError$921({}, Messages$866.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1110 = str$1107.substr(1, str$1107.length - 2);
        flags$1111 = '';
        while (index$872 < length$879) {
            ch$1108 = source$870[index$872];
            if (!isIdentifierPart$895(ch$1108.charCodeAt(0))) {
                break;
            }
            ++index$872;
            if (ch$1108 === '\\' && index$872 < length$879) {
                ch$1108 = source$870[index$872];
                if (ch$1108 === 'u') {
                    ++index$872;
                    restore$1114 = index$872;
                    ch$1108 = scanHexEscape$901('u');
                    if (ch$1108) {
                        flags$1111 += ch$1108;
                        for (str$1107 += '\\u'; restore$1114 < index$872; ++restore$1114) {
                            str$1107 += source$870[restore$1114];
                        }
                    } else {
                        index$872 = restore$1114;
                        flags$1111 += 'u';
                        str$1107 += '\\u';
                    }
                } else {
                    str$1107 += '\\';
                }
            } else {
                flags$1111 += ch$1108;
                str$1107 += ch$1108;
            }
        }
        try {
            value$1112 = new RegExp(pattern$1110, flags$1111);
        } catch (e$1116) {
            throwError$921({}, Messages$866.InvalidRegExp);
        }
        // peek();
        if (extra$886.tokenize) {
            return {
                type: Token$861.RegularExpression,
                value: value$1112,
                lineNumber: lineNumber$873,
                lineStart: lineStart$874,
                range: [
                    start$1109,
                    index$872
                ]
            };
        }
        return {
            type: Token$861.RegularExpression,
            literal: str$1107,
            value: value$1112,
            range: [
                start$1109,
                index$872
            ]
        };
    }
    function isIdentifierName$914(token$1117) {
        return token$1117.type === Token$861.Identifier || token$1117.type === Token$861.Keyword || token$1117.type === Token$861.BooleanLiteral || token$1117.type === Token$861.NullLiteral;
    }
    function advanceSlash$915() {
        var prevToken$1118, checkToken$1119;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1118 = extra$886.tokens[extra$886.tokens.length - 1];
        if (!prevToken$1118) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$913();
        }
        if (prevToken$1118.type === 'Punctuator') {
            if (prevToken$1118.value === ')') {
                checkToken$1119 = extra$886.tokens[extra$886.openParenToken - 1];
                if (checkToken$1119 && checkToken$1119.type === 'Keyword' && (checkToken$1119.value === 'if' || checkToken$1119.value === 'while' || checkToken$1119.value === 'for' || checkToken$1119.value === 'with')) {
                    return scanRegExp$913();
                }
                return scanPunctuator$906();
            }
            if (prevToken$1118.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$886.tokens[extra$886.openCurlyToken - 3] && extra$886.tokens[extra$886.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1119 = extra$886.tokens[extra$886.openCurlyToken - 4];
                    if (!checkToken$1119) {
                        return scanPunctuator$906();
                    }
                } else if (extra$886.tokens[extra$886.openCurlyToken - 4] && extra$886.tokens[extra$886.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1119 = extra$886.tokens[extra$886.openCurlyToken - 5];
                    if (!checkToken$1119) {
                        return scanRegExp$913();
                    }
                } else {
                    return scanPunctuator$906();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$863.indexOf(checkToken$1119.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$906();
                }
                // It is a declaration.
                return scanRegExp$913();
            }
            return scanRegExp$913();
        }
        if (prevToken$1118.type === 'Keyword') {
            return scanRegExp$913();
        }
        return scanPunctuator$906();
    }
    function advance$916() {
        var ch$1120;
        skipComment$900();
        if (index$872 >= length$879) {
            return {
                type: Token$861.EOF,
                lineNumber: lineNumber$873,
                lineStart: lineStart$874,
                range: [
                    index$872,
                    index$872
                ]
            };
        }
        ch$1120 = source$870.charCodeAt(index$872);
        // Very common: ( and ) and ;
        if (ch$1120 === 40 || ch$1120 === 41 || ch$1120 === 58) {
            return scanPunctuator$906();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1120 === 39 || ch$1120 === 34) {
            return scanStringLiteral$910();
        }
        if (ch$1120 === 96) {
            return scanTemplate$911();
        }
        if (isIdentifierStart$894(ch$1120)) {
            return scanIdentifier$905();
        }
        // # and @ are allowed for sweet.js
        if (ch$1120 === 35 || ch$1120 === 64) {
            ++index$872;
            return {
                type: Token$861.Punctuator,
                value: String.fromCharCode(ch$1120),
                lineNumber: lineNumber$873,
                lineStart: lineStart$874,
                range: [
                    index$872 - 1,
                    index$872
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1120 === 46) {
            if (isDecimalDigit$889(source$870.charCodeAt(index$872 + 1))) {
                return scanNumericLiteral$909();
            }
            return scanPunctuator$906();
        }
        if (isDecimalDigit$889(ch$1120)) {
            return scanNumericLiteral$909();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$886.tokenize && ch$1120 === 47) {
            return advanceSlash$915();
        }
        return scanPunctuator$906();
    }
    function lex$917() {
        var token$1121;
        token$1121 = lookahead$883;
        streamIndex$882 = lookaheadIndex$884;
        lineNumber$873 = token$1121.lineNumber;
        lineStart$874 = token$1121.lineStart;
        sm_lineNumber$875 = lookahead$883.sm_lineNumber;
        sm_lineStart$876 = lookahead$883.sm_lineStart;
        sm_range$877 = lookahead$883.sm_range;
        sm_index$878 = lookahead$883.sm_range[0];
        lookahead$883 = tokenStream$881[++streamIndex$882].token;
        lookaheadIndex$884 = streamIndex$882;
        index$872 = lookahead$883.range[0];
        return token$1121;
    }
    function peek$918() {
        lookaheadIndex$884 = streamIndex$882 + 1;
        if (lookaheadIndex$884 >= length$879) {
            lookahead$883 = {
                type: Token$861.EOF,
                lineNumber: lineNumber$873,
                lineStart: lineStart$874,
                range: [
                    index$872,
                    index$872
                ]
            };
            return;
        }
        lookahead$883 = tokenStream$881[lookaheadIndex$884].token;
        index$872 = lookahead$883.range[0];
    }
    function lookahead2$919() {
        var adv$1122, pos$1123, line$1124, start$1125, result$1126;
        if (streamIndex$882 + 1 >= length$879 || streamIndex$882 + 2 >= length$879) {
            return {
                type: Token$861.EOF,
                lineNumber: lineNumber$873,
                lineStart: lineStart$874,
                range: [
                    index$872,
                    index$872
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$883 === null) {
            lookaheadIndex$884 = streamIndex$882 + 1;
            lookahead$883 = tokenStream$881[lookaheadIndex$884].token;
            index$872 = lookahead$883.range[0];
        }
        result$1126 = tokenStream$881[lookaheadIndex$884 + 1].token;
        return result$1126;
    }
    SyntaxTreeDelegate$868 = {
        name: 'SyntaxTree',
        postProcess: function (node$1127) {
            return node$1127;
        },
        createArrayExpression: function (elements$1128) {
            return {
                type: Syntax$864.ArrayExpression,
                elements: elements$1128
            };
        },
        createAssignmentExpression: function (operator$1129, left$1130, right$1131) {
            return {
                type: Syntax$864.AssignmentExpression,
                operator: operator$1129,
                left: left$1130,
                right: right$1131
            };
        },
        createBinaryExpression: function (operator$1132, left$1133, right$1134) {
            var type$1135 = operator$1132 === '||' || operator$1132 === '&&' ? Syntax$864.LogicalExpression : Syntax$864.BinaryExpression;
            return {
                type: type$1135,
                operator: operator$1132,
                left: left$1133,
                right: right$1134
            };
        },
        createBlockStatement: function (body$1136) {
            return {
                type: Syntax$864.BlockStatement,
                body: body$1136
            };
        },
        createBreakStatement: function (label$1137) {
            return {
                type: Syntax$864.BreakStatement,
                label: label$1137
            };
        },
        createCallExpression: function (callee$1138, args$1139) {
            return {
                type: Syntax$864.CallExpression,
                callee: callee$1138,
                'arguments': args$1139
            };
        },
        createCatchClause: function (param$1140, body$1141) {
            return {
                type: Syntax$864.CatchClause,
                param: param$1140,
                body: body$1141
            };
        },
        createConditionalExpression: function (test$1142, consequent$1143, alternate$1144) {
            return {
                type: Syntax$864.ConditionalExpression,
                test: test$1142,
                consequent: consequent$1143,
                alternate: alternate$1144
            };
        },
        createContinueStatement: function (label$1145) {
            return {
                type: Syntax$864.ContinueStatement,
                label: label$1145
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$864.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1146, test$1147) {
            return {
                type: Syntax$864.DoWhileStatement,
                body: body$1146,
                test: test$1147
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$864.EmptyStatement };
        },
        createExpressionStatement: function (expression$1148) {
            return {
                type: Syntax$864.ExpressionStatement,
                expression: expression$1148
            };
        },
        createForStatement: function (init$1149, test$1150, update$1151, body$1152) {
            return {
                type: Syntax$864.ForStatement,
                init: init$1149,
                test: test$1150,
                update: update$1151,
                body: body$1152
            };
        },
        createForInStatement: function (left$1153, right$1154, body$1155) {
            return {
                type: Syntax$864.ForInStatement,
                left: left$1153,
                right: right$1154,
                body: body$1155,
                each: false
            };
        },
        createForOfStatement: function (left$1156, right$1157, body$1158) {
            return {
                type: Syntax$864.ForOfStatement,
                left: left$1156,
                right: right$1157,
                body: body$1158
            };
        },
        createFunctionDeclaration: function (id$1159, params$1160, defaults$1161, body$1162, rest$1163, generator$1164, expression$1165) {
            return {
                type: Syntax$864.FunctionDeclaration,
                id: id$1159,
                params: params$1160,
                defaults: defaults$1161,
                body: body$1162,
                rest: rest$1163,
                generator: generator$1164,
                expression: expression$1165
            };
        },
        createFunctionExpression: function (id$1166, params$1167, defaults$1168, body$1169, rest$1170, generator$1171, expression$1172) {
            return {
                type: Syntax$864.FunctionExpression,
                id: id$1166,
                params: params$1167,
                defaults: defaults$1168,
                body: body$1169,
                rest: rest$1170,
                generator: generator$1171,
                expression: expression$1172
            };
        },
        createIdentifier: function (name$1173) {
            return {
                type: Syntax$864.Identifier,
                name: name$1173
            };
        },
        createIfStatement: function (test$1174, consequent$1175, alternate$1176) {
            return {
                type: Syntax$864.IfStatement,
                test: test$1174,
                consequent: consequent$1175,
                alternate: alternate$1176
            };
        },
        createLabeledStatement: function (label$1177, body$1178) {
            return {
                type: Syntax$864.LabeledStatement,
                label: label$1177,
                body: body$1178
            };
        },
        createLiteral: function (token$1179) {
            return {
                type: Syntax$864.Literal,
                value: token$1179.value,
                raw: String(token$1179.value)
            };
        },
        createMemberExpression: function (accessor$1180, object$1181, property$1182) {
            return {
                type: Syntax$864.MemberExpression,
                computed: accessor$1180 === '[',
                object: object$1181,
                property: property$1182
            };
        },
        createNewExpression: function (callee$1183, args$1184) {
            return {
                type: Syntax$864.NewExpression,
                callee: callee$1183,
                'arguments': args$1184
            };
        },
        createObjectExpression: function (properties$1185) {
            return {
                type: Syntax$864.ObjectExpression,
                properties: properties$1185
            };
        },
        createPostfixExpression: function (operator$1186, argument$1187) {
            return {
                type: Syntax$864.UpdateExpression,
                operator: operator$1186,
                argument: argument$1187,
                prefix: false
            };
        },
        createProgram: function (body$1188) {
            return {
                type: Syntax$864.Program,
                body: body$1188
            };
        },
        createProperty: function (kind$1189, key$1190, value$1191, method$1192, shorthand$1193) {
            return {
                type: Syntax$864.Property,
                key: key$1190,
                value: value$1191,
                kind: kind$1189,
                method: method$1192,
                shorthand: shorthand$1193
            };
        },
        createReturnStatement: function (argument$1194) {
            return {
                type: Syntax$864.ReturnStatement,
                argument: argument$1194
            };
        },
        createSequenceExpression: function (expressions$1195) {
            return {
                type: Syntax$864.SequenceExpression,
                expressions: expressions$1195
            };
        },
        createSwitchCase: function (test$1196, consequent$1197) {
            return {
                type: Syntax$864.SwitchCase,
                test: test$1196,
                consequent: consequent$1197
            };
        },
        createSwitchStatement: function (discriminant$1198, cases$1199) {
            return {
                type: Syntax$864.SwitchStatement,
                discriminant: discriminant$1198,
                cases: cases$1199
            };
        },
        createThisExpression: function () {
            return { type: Syntax$864.ThisExpression };
        },
        createThrowStatement: function (argument$1200) {
            return {
                type: Syntax$864.ThrowStatement,
                argument: argument$1200
            };
        },
        createTryStatement: function (block$1201, guardedHandlers$1202, handlers$1203, finalizer$1204) {
            return {
                type: Syntax$864.TryStatement,
                block: block$1201,
                guardedHandlers: guardedHandlers$1202,
                handlers: handlers$1203,
                finalizer: finalizer$1204
            };
        },
        createUnaryExpression: function (operator$1205, argument$1206) {
            if (operator$1205 === '++' || operator$1205 === '--') {
                return {
                    type: Syntax$864.UpdateExpression,
                    operator: operator$1205,
                    argument: argument$1206,
                    prefix: true
                };
            }
            return {
                type: Syntax$864.UnaryExpression,
                operator: operator$1205,
                argument: argument$1206
            };
        },
        createVariableDeclaration: function (declarations$1207, kind$1208) {
            return {
                type: Syntax$864.VariableDeclaration,
                declarations: declarations$1207,
                kind: kind$1208
            };
        },
        createVariableDeclarator: function (id$1209, init$1210) {
            return {
                type: Syntax$864.VariableDeclarator,
                id: id$1209,
                init: init$1210
            };
        },
        createWhileStatement: function (test$1211, body$1212) {
            return {
                type: Syntax$864.WhileStatement,
                test: test$1211,
                body: body$1212
            };
        },
        createWithStatement: function (object$1213, body$1214) {
            return {
                type: Syntax$864.WithStatement,
                object: object$1213,
                body: body$1214
            };
        },
        createTemplateElement: function (value$1215, tail$1216) {
            return {
                type: Syntax$864.TemplateElement,
                value: value$1215,
                tail: tail$1216
            };
        },
        createTemplateLiteral: function (quasis$1217, expressions$1218) {
            return {
                type: Syntax$864.TemplateLiteral,
                quasis: quasis$1217,
                expressions: expressions$1218
            };
        },
        createSpreadElement: function (argument$1219) {
            return {
                type: Syntax$864.SpreadElement,
                argument: argument$1219
            };
        },
        createTaggedTemplateExpression: function (tag$1220, quasi$1221) {
            return {
                type: Syntax$864.TaggedTemplateExpression,
                tag: tag$1220,
                quasi: quasi$1221
            };
        },
        createArrowFunctionExpression: function (params$1222, defaults$1223, body$1224, rest$1225, expression$1226) {
            return {
                type: Syntax$864.ArrowFunctionExpression,
                id: null,
                params: params$1222,
                defaults: defaults$1223,
                body: body$1224,
                rest: rest$1225,
                generator: false,
                expression: expression$1226
            };
        },
        createMethodDefinition: function (propertyType$1227, kind$1228, key$1229, value$1230) {
            return {
                type: Syntax$864.MethodDefinition,
                key: key$1229,
                value: value$1230,
                kind: kind$1228,
                'static': propertyType$1227 === ClassPropertyType$869.static
            };
        },
        createClassBody: function (body$1231) {
            return {
                type: Syntax$864.ClassBody,
                body: body$1231
            };
        },
        createClassExpression: function (id$1232, superClass$1233, body$1234) {
            return {
                type: Syntax$864.ClassExpression,
                id: id$1232,
                superClass: superClass$1233,
                body: body$1234
            };
        },
        createClassDeclaration: function (id$1235, superClass$1236, body$1237) {
            return {
                type: Syntax$864.ClassDeclaration,
                id: id$1235,
                superClass: superClass$1236,
                body: body$1237
            };
        },
        createExportSpecifier: function (id$1238, name$1239) {
            return {
                type: Syntax$864.ExportSpecifier,
                id: id$1238,
                name: name$1239
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$864.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1240, specifiers$1241, source$1242) {
            return {
                type: Syntax$864.ExportDeclaration,
                declaration: declaration$1240,
                specifiers: specifiers$1241,
                source: source$1242
            };
        },
        createImportSpecifier: function (id$1243, name$1244) {
            return {
                type: Syntax$864.ImportSpecifier,
                id: id$1243,
                name: name$1244
            };
        },
        createImportDeclaration: function (specifiers$1245, kind$1246, source$1247) {
            return {
                type: Syntax$864.ImportDeclaration,
                specifiers: specifiers$1245,
                kind: kind$1246,
                source: source$1247
            };
        },
        createYieldExpression: function (argument$1248, delegate$1249) {
            return {
                type: Syntax$864.YieldExpression,
                argument: argument$1248,
                delegate: delegate$1249
            };
        },
        createModuleDeclaration: function (id$1250, source$1251, body$1252) {
            return {
                type: Syntax$864.ModuleDeclaration,
                id: id$1250,
                source: source$1251,
                body: body$1252
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$920() {
        return lookahead$883.lineNumber !== lineNumber$873;
    }
    // Throw an exception
    function throwError$921(token$1253, messageFormat$1254) {
        var error$1255, args$1256 = Array.prototype.slice.call(arguments, 2), msg$1257 = messageFormat$1254.replace(/%(\d)/g, function (whole$1261, index$1262) {
                assert$887(index$1262 < args$1256.length, 'Message reference must be in range');
                return args$1256[index$1262];
            });
        var startIndex$1258 = streamIndex$882 > 3 ? streamIndex$882 - 3 : 0;
        var toks$1259 = '', tailingMsg$1260 = '';
        if (tokenStream$881) {
            toks$1259 = tokenStream$881.slice(startIndex$1258, streamIndex$882 + 3).map(function (stx$1263) {
                return stx$1263.token.value;
            }).join(' ');
            tailingMsg$1260 = '\n[... ' + toks$1259 + ' ...]';
        }
        if (typeof token$1253.lineNumber === 'number') {
            error$1255 = new Error('Line ' + token$1253.lineNumber + ': ' + msg$1257 + tailingMsg$1260);
            error$1255.index = token$1253.range[0];
            error$1255.lineNumber = token$1253.lineNumber;
            error$1255.column = token$1253.range[0] - lineStart$874 + 1;
        } else {
            error$1255 = new Error('Line ' + lineNumber$873 + ': ' + msg$1257 + tailingMsg$1260);
            error$1255.index = index$872;
            error$1255.lineNumber = lineNumber$873;
            error$1255.column = index$872 - lineStart$874 + 1;
        }
        error$1255.description = msg$1257;
        throw error$1255;
    }
    function throwErrorTolerant$922() {
        try {
            throwError$921.apply(null, arguments);
        } catch (e$1264) {
            if (extra$886.errors) {
                extra$886.errors.push(e$1264);
            } else {
                throw e$1264;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$923(token$1265) {
        if (token$1265.type === Token$861.EOF) {
            throwError$921(token$1265, Messages$866.UnexpectedEOS);
        }
        if (token$1265.type === Token$861.NumericLiteral) {
            throwError$921(token$1265, Messages$866.UnexpectedNumber);
        }
        if (token$1265.type === Token$861.StringLiteral) {
            throwError$921(token$1265, Messages$866.UnexpectedString);
        }
        if (token$1265.type === Token$861.Identifier) {
            throwError$921(token$1265, Messages$866.UnexpectedIdentifier);
        }
        if (token$1265.type === Token$861.Keyword) {
            if (isFutureReservedWord$896(token$1265.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$871 && isStrictModeReservedWord$897(token$1265.value)) {
                throwErrorTolerant$922(token$1265, Messages$866.StrictReservedWord);
                return;
            }
            throwError$921(token$1265, Messages$866.UnexpectedToken, token$1265.value);
        }
        if (token$1265.type === Token$861.Template) {
            throwError$921(token$1265, Messages$866.UnexpectedTemplate, token$1265.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$921(token$1265, Messages$866.UnexpectedToken, token$1265.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$924(value$1266) {
        var token$1267 = lex$917();
        if (token$1267.type !== Token$861.Punctuator || token$1267.value !== value$1266) {
            throwUnexpected$923(token$1267);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$925(keyword$1268) {
        var token$1269 = lex$917();
        if (token$1269.type !== Token$861.Keyword || token$1269.value !== keyword$1268) {
            throwUnexpected$923(token$1269);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$926(value$1270) {
        return lookahead$883.type === Token$861.Punctuator && lookahead$883.value === value$1270;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$927(keyword$1271) {
        return lookahead$883.type === Token$861.Keyword && lookahead$883.value === keyword$1271;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$928(keyword$1272) {
        return lookahead$883.type === Token$861.Identifier && lookahead$883.value === keyword$1272;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$929() {
        var op$1273;
        if (lookahead$883.type !== Token$861.Punctuator) {
            return false;
        }
        op$1273 = lookahead$883.value;
        return op$1273 === '=' || op$1273 === '*=' || op$1273 === '/=' || op$1273 === '%=' || op$1273 === '+=' || op$1273 === '-=' || op$1273 === '<<=' || op$1273 === '>>=' || op$1273 === '>>>=' || op$1273 === '&=' || op$1273 === '^=' || op$1273 === '|=';
    }
    function consumeSemicolon$930() {
        var line$1274, ch$1275;
        ch$1275 = lookahead$883.value ? String(lookahead$883.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1275 === 59) {
            lex$917();
            return;
        }
        if (lookahead$883.lineNumber !== lineNumber$873) {
            return;
        }
        if (match$926(';')) {
            lex$917();
            return;
        }
        if (lookahead$883.type !== Token$861.EOF && !match$926('}')) {
            throwUnexpected$923(lookahead$883);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$931(expr$1276) {
        return expr$1276.type === Syntax$864.Identifier || expr$1276.type === Syntax$864.MemberExpression;
    }
    function isAssignableLeftHandSide$932(expr$1277) {
        return isLeftHandSide$931(expr$1277) || expr$1277.type === Syntax$864.ObjectPattern || expr$1277.type === Syntax$864.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$933() {
        var elements$1278 = [], blocks$1279 = [], filter$1280 = null, tmp$1281, possiblecomprehension$1282 = true, body$1283;
        expect$924('[');
        while (!match$926(']')) {
            if (lookahead$883.value === 'for' && lookahead$883.type === Token$861.Keyword) {
                if (!possiblecomprehension$1282) {
                    throwError$921({}, Messages$866.ComprehensionError);
                }
                matchKeyword$927('for');
                tmp$1281 = parseForStatement$981({ ignoreBody: true });
                tmp$1281.of = tmp$1281.type === Syntax$864.ForOfStatement;
                tmp$1281.type = Syntax$864.ComprehensionBlock;
                if (tmp$1281.left.kind) {
                    // can't be let or const
                    throwError$921({}, Messages$866.ComprehensionError);
                }
                blocks$1279.push(tmp$1281);
            } else if (lookahead$883.value === 'if' && lookahead$883.type === Token$861.Keyword) {
                if (!possiblecomprehension$1282) {
                    throwError$921({}, Messages$866.ComprehensionError);
                }
                expectKeyword$925('if');
                expect$924('(');
                filter$1280 = parseExpression$961();
                expect$924(')');
            } else if (lookahead$883.value === ',' && lookahead$883.type === Token$861.Punctuator) {
                possiblecomprehension$1282 = false;
                // no longer allowed.
                lex$917();
                elements$1278.push(null);
            } else {
                tmp$1281 = parseSpreadOrAssignmentExpression$944();
                elements$1278.push(tmp$1281);
                if (tmp$1281 && tmp$1281.type === Syntax$864.SpreadElement) {
                    if (!match$926(']')) {
                        throwError$921({}, Messages$866.ElementAfterSpreadElement);
                    }
                } else if (!(match$926(']') || matchKeyword$927('for') || matchKeyword$927('if'))) {
                    expect$924(',');
                    // this lexes.
                    possiblecomprehension$1282 = false;
                }
            }
        }
        expect$924(']');
        if (filter$1280 && !blocks$1279.length) {
            throwError$921({}, Messages$866.ComprehensionRequiresBlock);
        }
        if (blocks$1279.length) {
            if (elements$1278.length !== 1) {
                throwError$921({}, Messages$866.ComprehensionError);
            }
            return {
                type: Syntax$864.ComprehensionExpression,
                filter: filter$1280,
                blocks: blocks$1279,
                body: elements$1278[0]
            };
        }
        return delegate$880.createArrayExpression(elements$1278);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$934(options$1284) {
        var previousStrict$1285, previousYieldAllowed$1286, params$1287, defaults$1288, body$1289;
        previousStrict$1285 = strict$871;
        previousYieldAllowed$1286 = state$885.yieldAllowed;
        state$885.yieldAllowed = options$1284.generator;
        params$1287 = options$1284.params || [];
        defaults$1288 = options$1284.defaults || [];
        body$1289 = parseConciseBody$993();
        if (options$1284.name && strict$871 && isRestrictedWord$898(params$1287[0].name)) {
            throwErrorTolerant$922(options$1284.name, Messages$866.StrictParamName);
        }
        if (state$885.yieldAllowed && !state$885.yieldFound) {
            throwErrorTolerant$922({}, Messages$866.NoYieldInGenerator);
        }
        strict$871 = previousStrict$1285;
        state$885.yieldAllowed = previousYieldAllowed$1286;
        return delegate$880.createFunctionExpression(null, params$1287, defaults$1288, body$1289, options$1284.rest || null, options$1284.generator, body$1289.type !== Syntax$864.BlockStatement);
    }
    function parsePropertyMethodFunction$935(options$1290) {
        var previousStrict$1291, tmp$1292, method$1293;
        previousStrict$1291 = strict$871;
        strict$871 = true;
        tmp$1292 = parseParams$997();
        if (tmp$1292.stricted) {
            throwErrorTolerant$922(tmp$1292.stricted, tmp$1292.message);
        }
        method$1293 = parsePropertyFunction$934({
            params: tmp$1292.params,
            defaults: tmp$1292.defaults,
            rest: tmp$1292.rest,
            generator: options$1290.generator
        });
        strict$871 = previousStrict$1291;
        return method$1293;
    }
    function parseObjectPropertyKey$936() {
        var token$1294 = lex$917();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1294.type === Token$861.StringLiteral || token$1294.type === Token$861.NumericLiteral) {
            if (strict$871 && token$1294.octal) {
                throwErrorTolerant$922(token$1294, Messages$866.StrictOctalLiteral);
            }
            return delegate$880.createLiteral(token$1294);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$880.createIdentifier(token$1294.value);
    }
    function parseObjectProperty$937() {
        var token$1295, key$1296, id$1297, value$1298, param$1299;
        token$1295 = lookahead$883;
        if (token$1295.type === Token$861.Identifier) {
            id$1297 = parseObjectPropertyKey$936();
            // Property Assignment: Getter and Setter.
            if (token$1295.value === 'get' && !(match$926(':') || match$926('('))) {
                key$1296 = parseObjectPropertyKey$936();
                expect$924('(');
                expect$924(')');
                return delegate$880.createProperty('get', key$1296, parsePropertyFunction$934({ generator: false }), false, false);
            }
            if (token$1295.value === 'set' && !(match$926(':') || match$926('('))) {
                key$1296 = parseObjectPropertyKey$936();
                expect$924('(');
                token$1295 = lookahead$883;
                param$1299 = [parseVariableIdentifier$964()];
                expect$924(')');
                return delegate$880.createProperty('set', key$1296, parsePropertyFunction$934({
                    params: param$1299,
                    generator: false,
                    name: token$1295
                }), false, false);
            }
            if (match$926(':')) {
                lex$917();
                return delegate$880.createProperty('init', id$1297, parseAssignmentExpression$960(), false, false);
            }
            if (match$926('(')) {
                return delegate$880.createProperty('init', id$1297, parsePropertyMethodFunction$935({ generator: false }), true, false);
            }
            return delegate$880.createProperty('init', id$1297, id$1297, false, true);
        }
        if (token$1295.type === Token$861.EOF || token$1295.type === Token$861.Punctuator) {
            if (!match$926('*')) {
                throwUnexpected$923(token$1295);
            }
            lex$917();
            id$1297 = parseObjectPropertyKey$936();
            if (!match$926('(')) {
                throwUnexpected$923(lex$917());
            }
            return delegate$880.createProperty('init', id$1297, parsePropertyMethodFunction$935({ generator: true }), true, false);
        }
        key$1296 = parseObjectPropertyKey$936();
        if (match$926(':')) {
            lex$917();
            return delegate$880.createProperty('init', key$1296, parseAssignmentExpression$960(), false, false);
        }
        if (match$926('(')) {
            return delegate$880.createProperty('init', key$1296, parsePropertyMethodFunction$935({ generator: false }), true, false);
        }
        throwUnexpected$923(lex$917());
    }
    function parseObjectInitialiser$938() {
        var properties$1300 = [], property$1301, name$1302, key$1303, kind$1304, map$1305 = {}, toString$1306 = String;
        expect$924('{');
        while (!match$926('}')) {
            property$1301 = parseObjectProperty$937();
            if (property$1301.key.type === Syntax$864.Identifier) {
                name$1302 = property$1301.key.name;
            } else {
                name$1302 = toString$1306(property$1301.key.value);
            }
            kind$1304 = property$1301.kind === 'init' ? PropertyKind$865.Data : property$1301.kind === 'get' ? PropertyKind$865.Get : PropertyKind$865.Set;
            key$1303 = '$' + name$1302;
            if (Object.prototype.hasOwnProperty.call(map$1305, key$1303)) {
                if (map$1305[key$1303] === PropertyKind$865.Data) {
                    if (strict$871 && kind$1304 === PropertyKind$865.Data) {
                        throwErrorTolerant$922({}, Messages$866.StrictDuplicateProperty);
                    } else if (kind$1304 !== PropertyKind$865.Data) {
                        throwErrorTolerant$922({}, Messages$866.AccessorDataProperty);
                    }
                } else {
                    if (kind$1304 === PropertyKind$865.Data) {
                        throwErrorTolerant$922({}, Messages$866.AccessorDataProperty);
                    } else if (map$1305[key$1303] & kind$1304) {
                        throwErrorTolerant$922({}, Messages$866.AccessorGetSet);
                    }
                }
                map$1305[key$1303] |= kind$1304;
            } else {
                map$1305[key$1303] = kind$1304;
            }
            properties$1300.push(property$1301);
            if (!match$926('}')) {
                expect$924(',');
            }
        }
        expect$924('}');
        return delegate$880.createObjectExpression(properties$1300);
    }
    function parseTemplateElement$939(option$1307) {
        var token$1308 = scanTemplateElement$912(option$1307);
        if (strict$871 && token$1308.octal) {
            throwError$921(token$1308, Messages$866.StrictOctalLiteral);
        }
        return delegate$880.createTemplateElement({
            raw: token$1308.value.raw,
            cooked: token$1308.value.cooked
        }, token$1308.tail);
    }
    function parseTemplateLiteral$940() {
        var quasi$1309, quasis$1310, expressions$1311;
        quasi$1309 = parseTemplateElement$939({ head: true });
        quasis$1310 = [quasi$1309];
        expressions$1311 = [];
        while (!quasi$1309.tail) {
            expressions$1311.push(parseExpression$961());
            quasi$1309 = parseTemplateElement$939({ head: false });
            quasis$1310.push(quasi$1309);
        }
        return delegate$880.createTemplateLiteral(quasis$1310, expressions$1311);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$941() {
        var expr$1312;
        expect$924('(');
        ++state$885.parenthesizedCount;
        expr$1312 = parseExpression$961();
        expect$924(')');
        return expr$1312;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$942() {
        var type$1313, token$1314, resolvedIdent$1315;
        token$1314 = lookahead$883;
        type$1313 = lookahead$883.type;
        if (type$1313 === Token$861.Identifier) {
            resolvedIdent$1315 = expander$860.resolve(tokenStream$881[lookaheadIndex$884]);
            lex$917();
            return delegate$880.createIdentifier(resolvedIdent$1315);
        }
        if (type$1313 === Token$861.StringLiteral || type$1313 === Token$861.NumericLiteral) {
            if (strict$871 && lookahead$883.octal) {
                throwErrorTolerant$922(lookahead$883, Messages$866.StrictOctalLiteral);
            }
            return delegate$880.createLiteral(lex$917());
        }
        if (type$1313 === Token$861.Keyword) {
            if (matchKeyword$927('this')) {
                lex$917();
                return delegate$880.createThisExpression();
            }
            if (matchKeyword$927('function')) {
                return parseFunctionExpression$999();
            }
            if (matchKeyword$927('class')) {
                return parseClassExpression$1004();
            }
            if (matchKeyword$927('super')) {
                lex$917();
                return delegate$880.createIdentifier('super');
            }
        }
        if (type$1313 === Token$861.BooleanLiteral) {
            token$1314 = lex$917();
            token$1314.value = token$1314.value === 'true';
            return delegate$880.createLiteral(token$1314);
        }
        if (type$1313 === Token$861.NullLiteral) {
            token$1314 = lex$917();
            token$1314.value = null;
            return delegate$880.createLiteral(token$1314);
        }
        if (match$926('[')) {
            return parseArrayInitialiser$933();
        }
        if (match$926('{')) {
            return parseObjectInitialiser$938();
        }
        if (match$926('(')) {
            return parseGroupExpression$941();
        }
        if (lookahead$883.type === Token$861.RegularExpression) {
            return delegate$880.createLiteral(lex$917());
        }
        if (type$1313 === Token$861.Template) {
            return parseTemplateLiteral$940();
        }
        return throwUnexpected$923(lex$917());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$943() {
        var args$1316 = [], arg$1317;
        expect$924('(');
        if (!match$926(')')) {
            while (streamIndex$882 < length$879) {
                arg$1317 = parseSpreadOrAssignmentExpression$944();
                args$1316.push(arg$1317);
                if (match$926(')')) {
                    break;
                } else if (arg$1317.type === Syntax$864.SpreadElement) {
                    throwError$921({}, Messages$866.ElementAfterSpreadElement);
                }
                expect$924(',');
            }
        }
        expect$924(')');
        return args$1316;
    }
    function parseSpreadOrAssignmentExpression$944() {
        if (match$926('...')) {
            lex$917();
            return delegate$880.createSpreadElement(parseAssignmentExpression$960());
        }
        return parseAssignmentExpression$960();
    }
    function parseNonComputedProperty$945() {
        var token$1318 = lex$917();
        if (!isIdentifierName$914(token$1318)) {
            throwUnexpected$923(token$1318);
        }
        return delegate$880.createIdentifier(token$1318.value);
    }
    function parseNonComputedMember$946() {
        expect$924('.');
        return parseNonComputedProperty$945();
    }
    function parseComputedMember$947() {
        var expr$1319;
        expect$924('[');
        expr$1319 = parseExpression$961();
        expect$924(']');
        return expr$1319;
    }
    function parseNewExpression$948() {
        var callee$1320, args$1321;
        expectKeyword$925('new');
        callee$1320 = parseLeftHandSideExpression$950();
        args$1321 = match$926('(') ? parseArguments$943() : [];
        return delegate$880.createNewExpression(callee$1320, args$1321);
    }
    function parseLeftHandSideExpressionAllowCall$949() {
        var expr$1322, args$1323, property$1324;
        expr$1322 = matchKeyword$927('new') ? parseNewExpression$948() : parsePrimaryExpression$942();
        while (match$926('.') || match$926('[') || match$926('(') || lookahead$883.type === Token$861.Template) {
            if (match$926('(')) {
                args$1323 = parseArguments$943();
                expr$1322 = delegate$880.createCallExpression(expr$1322, args$1323);
            } else if (match$926('[')) {
                expr$1322 = delegate$880.createMemberExpression('[', expr$1322, parseComputedMember$947());
            } else if (match$926('.')) {
                expr$1322 = delegate$880.createMemberExpression('.', expr$1322, parseNonComputedMember$946());
            } else {
                expr$1322 = delegate$880.createTaggedTemplateExpression(expr$1322, parseTemplateLiteral$940());
            }
        }
        return expr$1322;
    }
    function parseLeftHandSideExpression$950() {
        var expr$1325, property$1326;
        expr$1325 = matchKeyword$927('new') ? parseNewExpression$948() : parsePrimaryExpression$942();
        while (match$926('.') || match$926('[') || lookahead$883.type === Token$861.Template) {
            if (match$926('[')) {
                expr$1325 = delegate$880.createMemberExpression('[', expr$1325, parseComputedMember$947());
            } else if (match$926('.')) {
                expr$1325 = delegate$880.createMemberExpression('.', expr$1325, parseNonComputedMember$946());
            } else {
                expr$1325 = delegate$880.createTaggedTemplateExpression(expr$1325, parseTemplateLiteral$940());
            }
        }
        return expr$1325;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$951() {
        var expr$1327 = parseLeftHandSideExpressionAllowCall$949(), token$1328 = lookahead$883;
        if (lookahead$883.type !== Token$861.Punctuator) {
            return expr$1327;
        }
        if ((match$926('++') || match$926('--')) && !peekLineTerminator$920()) {
            // 11.3.1, 11.3.2
            if (strict$871 && expr$1327.type === Syntax$864.Identifier && isRestrictedWord$898(expr$1327.name)) {
                throwErrorTolerant$922({}, Messages$866.StrictLHSPostfix);
            }
            if (!isLeftHandSide$931(expr$1327)) {
                throwError$921({}, Messages$866.InvalidLHSInAssignment);
            }
            token$1328 = lex$917();
            expr$1327 = delegate$880.createPostfixExpression(token$1328.value, expr$1327);
        }
        return expr$1327;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$952() {
        var token$1329, expr$1330;
        if (lookahead$883.type !== Token$861.Punctuator && lookahead$883.type !== Token$861.Keyword) {
            return parsePostfixExpression$951();
        }
        if (match$926('++') || match$926('--')) {
            token$1329 = lex$917();
            expr$1330 = parseUnaryExpression$952();
            // 11.4.4, 11.4.5
            if (strict$871 && expr$1330.type === Syntax$864.Identifier && isRestrictedWord$898(expr$1330.name)) {
                throwErrorTolerant$922({}, Messages$866.StrictLHSPrefix);
            }
            if (!isLeftHandSide$931(expr$1330)) {
                throwError$921({}, Messages$866.InvalidLHSInAssignment);
            }
            return delegate$880.createUnaryExpression(token$1329.value, expr$1330);
        }
        if (match$926('+') || match$926('-') || match$926('~') || match$926('!')) {
            token$1329 = lex$917();
            expr$1330 = parseUnaryExpression$952();
            return delegate$880.createUnaryExpression(token$1329.value, expr$1330);
        }
        if (matchKeyword$927('delete') || matchKeyword$927('void') || matchKeyword$927('typeof')) {
            token$1329 = lex$917();
            expr$1330 = parseUnaryExpression$952();
            expr$1330 = delegate$880.createUnaryExpression(token$1329.value, expr$1330);
            if (strict$871 && expr$1330.operator === 'delete' && expr$1330.argument.type === Syntax$864.Identifier) {
                throwErrorTolerant$922({}, Messages$866.StrictDelete);
            }
            return expr$1330;
        }
        return parsePostfixExpression$951();
    }
    function binaryPrecedence$953(token$1331, allowIn$1332) {
        var prec$1333 = 0;
        if (token$1331.type !== Token$861.Punctuator && token$1331.type !== Token$861.Keyword) {
            return 0;
        }
        switch (token$1331.value) {
        case '||':
            prec$1333 = 1;
            break;
        case '&&':
            prec$1333 = 2;
            break;
        case '|':
            prec$1333 = 3;
            break;
        case '^':
            prec$1333 = 4;
            break;
        case '&':
            prec$1333 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1333 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1333 = 7;
            break;
        case 'in':
            prec$1333 = allowIn$1332 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1333 = 8;
            break;
        case '+':
        case '-':
            prec$1333 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1333 = 11;
            break;
        default:
            break;
        }
        return prec$1333;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$954() {
        var expr$1334, token$1335, prec$1336, previousAllowIn$1337, stack$1338, right$1339, operator$1340, left$1341, i$1342;
        previousAllowIn$1337 = state$885.allowIn;
        state$885.allowIn = true;
        expr$1334 = parseUnaryExpression$952();
        token$1335 = lookahead$883;
        prec$1336 = binaryPrecedence$953(token$1335, previousAllowIn$1337);
        if (prec$1336 === 0) {
            return expr$1334;
        }
        token$1335.prec = prec$1336;
        lex$917();
        stack$1338 = [
            expr$1334,
            token$1335,
            parseUnaryExpression$952()
        ];
        while ((prec$1336 = binaryPrecedence$953(lookahead$883, previousAllowIn$1337)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1338.length > 2 && prec$1336 <= stack$1338[stack$1338.length - 2].prec) {
                right$1339 = stack$1338.pop();
                operator$1340 = stack$1338.pop().value;
                left$1341 = stack$1338.pop();
                stack$1338.push(delegate$880.createBinaryExpression(operator$1340, left$1341, right$1339));
            }
            // Shift.
            token$1335 = lex$917();
            token$1335.prec = prec$1336;
            stack$1338.push(token$1335);
            stack$1338.push(parseUnaryExpression$952());
        }
        state$885.allowIn = previousAllowIn$1337;
        // Final reduce to clean-up the stack.
        i$1342 = stack$1338.length - 1;
        expr$1334 = stack$1338[i$1342];
        while (i$1342 > 1) {
            expr$1334 = delegate$880.createBinaryExpression(stack$1338[i$1342 - 1].value, stack$1338[i$1342 - 2], expr$1334);
            i$1342 -= 2;
        }
        return expr$1334;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$955() {
        var expr$1343, previousAllowIn$1344, consequent$1345, alternate$1346;
        expr$1343 = parseBinaryExpression$954();
        if (match$926('?')) {
            lex$917();
            previousAllowIn$1344 = state$885.allowIn;
            state$885.allowIn = true;
            consequent$1345 = parseAssignmentExpression$960();
            state$885.allowIn = previousAllowIn$1344;
            expect$924(':');
            alternate$1346 = parseAssignmentExpression$960();
            expr$1343 = delegate$880.createConditionalExpression(expr$1343, consequent$1345, alternate$1346);
        }
        return expr$1343;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$956(expr$1347) {
        var i$1348, len$1349, property$1350, element$1351;
        if (expr$1347.type === Syntax$864.ObjectExpression) {
            expr$1347.type = Syntax$864.ObjectPattern;
            for (i$1348 = 0, len$1349 = expr$1347.properties.length; i$1348 < len$1349; i$1348 += 1) {
                property$1350 = expr$1347.properties[i$1348];
                if (property$1350.kind !== 'init') {
                    throwError$921({}, Messages$866.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$956(property$1350.value);
            }
        } else if (expr$1347.type === Syntax$864.ArrayExpression) {
            expr$1347.type = Syntax$864.ArrayPattern;
            for (i$1348 = 0, len$1349 = expr$1347.elements.length; i$1348 < len$1349; i$1348 += 1) {
                element$1351 = expr$1347.elements[i$1348];
                if (element$1351) {
                    reinterpretAsAssignmentBindingPattern$956(element$1351);
                }
            }
        } else if (expr$1347.type === Syntax$864.Identifier) {
            if (isRestrictedWord$898(expr$1347.name)) {
                throwError$921({}, Messages$866.InvalidLHSInAssignment);
            }
        } else if (expr$1347.type === Syntax$864.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$956(expr$1347.argument);
            if (expr$1347.argument.type === Syntax$864.ObjectPattern) {
                throwError$921({}, Messages$866.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1347.type !== Syntax$864.MemberExpression && expr$1347.type !== Syntax$864.CallExpression && expr$1347.type !== Syntax$864.NewExpression) {
                throwError$921({}, Messages$866.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$957(options$1352, expr$1353) {
        var i$1354, len$1355, property$1356, element$1357;
        if (expr$1353.type === Syntax$864.ObjectExpression) {
            expr$1353.type = Syntax$864.ObjectPattern;
            for (i$1354 = 0, len$1355 = expr$1353.properties.length; i$1354 < len$1355; i$1354 += 1) {
                property$1356 = expr$1353.properties[i$1354];
                if (property$1356.kind !== 'init') {
                    throwError$921({}, Messages$866.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$957(options$1352, property$1356.value);
            }
        } else if (expr$1353.type === Syntax$864.ArrayExpression) {
            expr$1353.type = Syntax$864.ArrayPattern;
            for (i$1354 = 0, len$1355 = expr$1353.elements.length; i$1354 < len$1355; i$1354 += 1) {
                element$1357 = expr$1353.elements[i$1354];
                if (element$1357) {
                    reinterpretAsDestructuredParameter$957(options$1352, element$1357);
                }
            }
        } else if (expr$1353.type === Syntax$864.Identifier) {
            validateParam$995(options$1352, expr$1353, expr$1353.name);
        } else {
            if (expr$1353.type !== Syntax$864.MemberExpression) {
                throwError$921({}, Messages$866.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$958(expressions$1358) {
        var i$1359, len$1360, param$1361, params$1362, defaults$1363, defaultCount$1364, options$1365, rest$1366;
        params$1362 = [];
        defaults$1363 = [];
        defaultCount$1364 = 0;
        rest$1366 = null;
        options$1365 = { paramSet: {} };
        for (i$1359 = 0, len$1360 = expressions$1358.length; i$1359 < len$1360; i$1359 += 1) {
            param$1361 = expressions$1358[i$1359];
            if (param$1361.type === Syntax$864.Identifier) {
                params$1362.push(param$1361);
                defaults$1363.push(null);
                validateParam$995(options$1365, param$1361, param$1361.name);
            } else if (param$1361.type === Syntax$864.ObjectExpression || param$1361.type === Syntax$864.ArrayExpression) {
                reinterpretAsDestructuredParameter$957(options$1365, param$1361);
                params$1362.push(param$1361);
                defaults$1363.push(null);
            } else if (param$1361.type === Syntax$864.SpreadElement) {
                assert$887(i$1359 === len$1360 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$957(options$1365, param$1361.argument);
                rest$1366 = param$1361.argument;
            } else if (param$1361.type === Syntax$864.AssignmentExpression) {
                params$1362.push(param$1361.left);
                defaults$1363.push(param$1361.right);
                ++defaultCount$1364;
                validateParam$995(options$1365, param$1361.left, param$1361.left.name);
            } else {
                return null;
            }
        }
        if (options$1365.message === Messages$866.StrictParamDupe) {
            throwError$921(strict$871 ? options$1365.stricted : options$1365.firstRestricted, options$1365.message);
        }
        if (defaultCount$1364 === 0) {
            defaults$1363 = [];
        }
        return {
            params: params$1362,
            defaults: defaults$1363,
            rest: rest$1366,
            stricted: options$1365.stricted,
            firstRestricted: options$1365.firstRestricted,
            message: options$1365.message
        };
    }
    function parseArrowFunctionExpression$959(options$1367) {
        var previousStrict$1368, previousYieldAllowed$1369, body$1370;
        expect$924('=>');
        previousStrict$1368 = strict$871;
        previousYieldAllowed$1369 = state$885.yieldAllowed;
        state$885.yieldAllowed = false;
        body$1370 = parseConciseBody$993();
        if (strict$871 && options$1367.firstRestricted) {
            throwError$921(options$1367.firstRestricted, options$1367.message);
        }
        if (strict$871 && options$1367.stricted) {
            throwErrorTolerant$922(options$1367.stricted, options$1367.message);
        }
        strict$871 = previousStrict$1368;
        state$885.yieldAllowed = previousYieldAllowed$1369;
        return delegate$880.createArrowFunctionExpression(options$1367.params, options$1367.defaults, body$1370, options$1367.rest, body$1370.type !== Syntax$864.BlockStatement);
    }
    function parseAssignmentExpression$960() {
        var expr$1371, token$1372, params$1373, oldParenthesizedCount$1374;
        if (matchKeyword$927('yield')) {
            return parseYieldExpression$1000();
        }
        oldParenthesizedCount$1374 = state$885.parenthesizedCount;
        if (match$926('(')) {
            token$1372 = lookahead2$919();
            if (token$1372.type === Token$861.Punctuator && token$1372.value === ')' || token$1372.value === '...') {
                params$1373 = parseParams$997();
                if (!match$926('=>')) {
                    throwUnexpected$923(lex$917());
                }
                return parseArrowFunctionExpression$959(params$1373);
            }
        }
        token$1372 = lookahead$883;
        expr$1371 = parseConditionalExpression$955();
        if (match$926('=>') && (state$885.parenthesizedCount === oldParenthesizedCount$1374 || state$885.parenthesizedCount === oldParenthesizedCount$1374 + 1)) {
            if (expr$1371.type === Syntax$864.Identifier) {
                params$1373 = reinterpretAsCoverFormalsList$958([expr$1371]);
            } else if (expr$1371.type === Syntax$864.SequenceExpression) {
                params$1373 = reinterpretAsCoverFormalsList$958(expr$1371.expressions);
            }
            if (params$1373) {
                return parseArrowFunctionExpression$959(params$1373);
            }
        }
        if (matchAssign$929()) {
            // 11.13.1
            if (strict$871 && expr$1371.type === Syntax$864.Identifier && isRestrictedWord$898(expr$1371.name)) {
                throwErrorTolerant$922(token$1372, Messages$866.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$926('=') && (expr$1371.type === Syntax$864.ObjectExpression || expr$1371.type === Syntax$864.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$956(expr$1371);
            } else if (!isLeftHandSide$931(expr$1371)) {
                throwError$921({}, Messages$866.InvalidLHSInAssignment);
            }
            expr$1371 = delegate$880.createAssignmentExpression(lex$917().value, expr$1371, parseAssignmentExpression$960());
        }
        return expr$1371;
    }
    // 11.14 Comma Operator
    function parseExpression$961() {
        var expr$1375, expressions$1376, sequence$1377, coverFormalsList$1378, spreadFound$1379, oldParenthesizedCount$1380;
        oldParenthesizedCount$1380 = state$885.parenthesizedCount;
        expr$1375 = parseAssignmentExpression$960();
        expressions$1376 = [expr$1375];
        if (match$926(',')) {
            while (streamIndex$882 < length$879) {
                if (!match$926(',')) {
                    break;
                }
                lex$917();
                expr$1375 = parseSpreadOrAssignmentExpression$944();
                expressions$1376.push(expr$1375);
                if (expr$1375.type === Syntax$864.SpreadElement) {
                    spreadFound$1379 = true;
                    if (!match$926(')')) {
                        throwError$921({}, Messages$866.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1377 = delegate$880.createSequenceExpression(expressions$1376);
        }
        if (match$926('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$885.parenthesizedCount === oldParenthesizedCount$1380 || state$885.parenthesizedCount === oldParenthesizedCount$1380 + 1) {
                expr$1375 = expr$1375.type === Syntax$864.SequenceExpression ? expr$1375.expressions : expressions$1376;
                coverFormalsList$1378 = reinterpretAsCoverFormalsList$958(expr$1375);
                if (coverFormalsList$1378) {
                    return parseArrowFunctionExpression$959(coverFormalsList$1378);
                }
            }
            throwUnexpected$923(lex$917());
        }
        if (spreadFound$1379 && lookahead2$919().value !== '=>') {
            throwError$921({}, Messages$866.IllegalSpread);
        }
        return sequence$1377 || expr$1375;
    }
    // 12.1 Block
    function parseStatementList$962() {
        var list$1381 = [], statement$1382;
        while (streamIndex$882 < length$879) {
            if (match$926('}')) {
                break;
            }
            statement$1382 = parseSourceElement$1007();
            if (typeof statement$1382 === 'undefined') {
                break;
            }
            list$1381.push(statement$1382);
        }
        return list$1381;
    }
    function parseBlock$963() {
        var block$1383;
        expect$924('{');
        block$1383 = parseStatementList$962();
        expect$924('}');
        return delegate$880.createBlockStatement(block$1383);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$964() {
        var token$1384 = lookahead$883, resolvedIdent$1385;
        if (token$1384.type !== Token$861.Identifier) {
            throwUnexpected$923(token$1384);
        }
        resolvedIdent$1385 = expander$860.resolve(tokenStream$881[lookaheadIndex$884]);
        lex$917();
        return delegate$880.createIdentifier(resolvedIdent$1385);
    }
    function parseVariableDeclaration$965(kind$1386) {
        var id$1387, init$1388 = null;
        if (match$926('{')) {
            id$1387 = parseObjectInitialiser$938();
            reinterpretAsAssignmentBindingPattern$956(id$1387);
        } else if (match$926('[')) {
            id$1387 = parseArrayInitialiser$933();
            reinterpretAsAssignmentBindingPattern$956(id$1387);
        } else {
            id$1387 = state$885.allowKeyword ? parseNonComputedProperty$945() : parseVariableIdentifier$964();
            // 12.2.1
            if (strict$871 && isRestrictedWord$898(id$1387.name)) {
                throwErrorTolerant$922({}, Messages$866.StrictVarName);
            }
        }
        if (kind$1386 === 'const') {
            if (!match$926('=')) {
                throwError$921({}, Messages$866.NoUnintializedConst);
            }
            expect$924('=');
            init$1388 = parseAssignmentExpression$960();
        } else if (match$926('=')) {
            lex$917();
            init$1388 = parseAssignmentExpression$960();
        }
        return delegate$880.createVariableDeclarator(id$1387, init$1388);
    }
    function parseVariableDeclarationList$966(kind$1389) {
        var list$1390 = [];
        do {
            list$1390.push(parseVariableDeclaration$965(kind$1389));
            if (!match$926(',')) {
                break;
            }
            lex$917();
        } while (streamIndex$882 < length$879);
        return list$1390;
    }
    function parseVariableStatement$967() {
        var declarations$1391;
        expectKeyword$925('var');
        declarations$1391 = parseVariableDeclarationList$966();
        consumeSemicolon$930();
        return delegate$880.createVariableDeclaration(declarations$1391, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$968(kind$1392) {
        var declarations$1393;
        expectKeyword$925(kind$1392);
        declarations$1393 = parseVariableDeclarationList$966(kind$1392);
        consumeSemicolon$930();
        return delegate$880.createVariableDeclaration(declarations$1393, kind$1392);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$969() {
        var id$1394, src$1395, body$1396;
        lex$917();
        // 'module'
        if (peekLineTerminator$920()) {
            throwError$921({}, Messages$866.NewlineAfterModule);
        }
        switch (lookahead$883.type) {
        case Token$861.StringLiteral:
            id$1394 = parsePrimaryExpression$942();
            body$1396 = parseModuleBlock$1012();
            src$1395 = null;
            break;
        case Token$861.Identifier:
            id$1394 = parseVariableIdentifier$964();
            body$1396 = null;
            if (!matchContextualKeyword$928('from')) {
                throwUnexpected$923(lex$917());
            }
            lex$917();
            src$1395 = parsePrimaryExpression$942();
            if (src$1395.type !== Syntax$864.Literal) {
                throwError$921({}, Messages$866.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$930();
        return delegate$880.createModuleDeclaration(id$1394, src$1395, body$1396);
    }
    function parseExportBatchSpecifier$970() {
        expect$924('*');
        return delegate$880.createExportBatchSpecifier();
    }
    function parseExportSpecifier$971() {
        var id$1397, name$1398 = null;
        id$1397 = parseVariableIdentifier$964();
        if (matchContextualKeyword$928('as')) {
            lex$917();
            name$1398 = parseNonComputedProperty$945();
        }
        return delegate$880.createExportSpecifier(id$1397, name$1398);
    }
    function parseExportDeclaration$972() {
        var previousAllowKeyword$1399, decl$1400, def$1401, src$1402, specifiers$1403;
        expectKeyword$925('export');
        if (lookahead$883.type === Token$861.Keyword) {
            switch (lookahead$883.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$880.createExportDeclaration(parseSourceElement$1007(), null, null);
            }
        }
        if (isIdentifierName$914(lookahead$883)) {
            previousAllowKeyword$1399 = state$885.allowKeyword;
            state$885.allowKeyword = true;
            decl$1400 = parseVariableDeclarationList$966('let');
            state$885.allowKeyword = previousAllowKeyword$1399;
            return delegate$880.createExportDeclaration(decl$1400, null, null);
        }
        specifiers$1403 = [];
        src$1402 = null;
        if (match$926('*')) {
            specifiers$1403.push(parseExportBatchSpecifier$970());
        } else {
            expect$924('{');
            do {
                specifiers$1403.push(parseExportSpecifier$971());
            } while (match$926(',') && lex$917());
            expect$924('}');
        }
        if (matchContextualKeyword$928('from')) {
            lex$917();
            src$1402 = parsePrimaryExpression$942();
            if (src$1402.type !== Syntax$864.Literal) {
                throwError$921({}, Messages$866.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$930();
        return delegate$880.createExportDeclaration(null, specifiers$1403, src$1402);
    }
    function parseImportDeclaration$973() {
        var specifiers$1404, kind$1405, src$1406;
        expectKeyword$925('import');
        specifiers$1404 = [];
        if (isIdentifierName$914(lookahead$883)) {
            kind$1405 = 'default';
            specifiers$1404.push(parseImportSpecifier$974());
            if (!matchContextualKeyword$928('from')) {
                throwError$921({}, Messages$866.NoFromAfterImport);
            }
            lex$917();
        } else if (match$926('{')) {
            kind$1405 = 'named';
            lex$917();
            do {
                specifiers$1404.push(parseImportSpecifier$974());
            } while (match$926(',') && lex$917());
            expect$924('}');
            if (!matchContextualKeyword$928('from')) {
                throwError$921({}, Messages$866.NoFromAfterImport);
            }
            lex$917();
        }
        src$1406 = parsePrimaryExpression$942();
        if (src$1406.type !== Syntax$864.Literal) {
            throwError$921({}, Messages$866.InvalidModuleSpecifier);
        }
        consumeSemicolon$930();
        return delegate$880.createImportDeclaration(specifiers$1404, kind$1405, src$1406);
    }
    function parseImportSpecifier$974() {
        var id$1407, name$1408 = null;
        id$1407 = parseNonComputedProperty$945();
        if (matchContextualKeyword$928('as')) {
            lex$917();
            name$1408 = parseVariableIdentifier$964();
        }
        return delegate$880.createImportSpecifier(id$1407, name$1408);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$975() {
        expect$924(';');
        return delegate$880.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$976() {
        var expr$1409 = parseExpression$961();
        consumeSemicolon$930();
        return delegate$880.createExpressionStatement(expr$1409);
    }
    // 12.5 If statement
    function parseIfStatement$977() {
        var test$1410, consequent$1411, alternate$1412;
        expectKeyword$925('if');
        expect$924('(');
        test$1410 = parseExpression$961();
        expect$924(')');
        consequent$1411 = parseStatement$992();
        if (matchKeyword$927('else')) {
            lex$917();
            alternate$1412 = parseStatement$992();
        } else {
            alternate$1412 = null;
        }
        return delegate$880.createIfStatement(test$1410, consequent$1411, alternate$1412);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$978() {
        var body$1413, test$1414, oldInIteration$1415;
        expectKeyword$925('do');
        oldInIteration$1415 = state$885.inIteration;
        state$885.inIteration = true;
        body$1413 = parseStatement$992();
        state$885.inIteration = oldInIteration$1415;
        expectKeyword$925('while');
        expect$924('(');
        test$1414 = parseExpression$961();
        expect$924(')');
        if (match$926(';')) {
            lex$917();
        }
        return delegate$880.createDoWhileStatement(body$1413, test$1414);
    }
    function parseWhileStatement$979() {
        var test$1416, body$1417, oldInIteration$1418;
        expectKeyword$925('while');
        expect$924('(');
        test$1416 = parseExpression$961();
        expect$924(')');
        oldInIteration$1418 = state$885.inIteration;
        state$885.inIteration = true;
        body$1417 = parseStatement$992();
        state$885.inIteration = oldInIteration$1418;
        return delegate$880.createWhileStatement(test$1416, body$1417);
    }
    function parseForVariableDeclaration$980() {
        var token$1419 = lex$917(), declarations$1420 = parseVariableDeclarationList$966();
        return delegate$880.createVariableDeclaration(declarations$1420, token$1419.value);
    }
    function parseForStatement$981(opts$1421) {
        var init$1422, test$1423, update$1424, left$1425, right$1426, body$1427, operator$1428, oldInIteration$1429;
        init$1422 = test$1423 = update$1424 = null;
        expectKeyword$925('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$928('each')) {
            throwError$921({}, Messages$866.EachNotAllowed);
        }
        expect$924('(');
        if (match$926(';')) {
            lex$917();
        } else {
            if (matchKeyword$927('var') || matchKeyword$927('let') || matchKeyword$927('const')) {
                state$885.allowIn = false;
                init$1422 = parseForVariableDeclaration$980();
                state$885.allowIn = true;
                if (init$1422.declarations.length === 1) {
                    if (matchKeyword$927('in') || matchContextualKeyword$928('of')) {
                        operator$1428 = lookahead$883;
                        if (!((operator$1428.value === 'in' || init$1422.kind !== 'var') && init$1422.declarations[0].init)) {
                            lex$917();
                            left$1425 = init$1422;
                            right$1426 = parseExpression$961();
                            init$1422 = null;
                        }
                    }
                }
            } else {
                state$885.allowIn = false;
                init$1422 = parseExpression$961();
                state$885.allowIn = true;
                if (matchContextualKeyword$928('of')) {
                    operator$1428 = lex$917();
                    left$1425 = init$1422;
                    right$1426 = parseExpression$961();
                    init$1422 = null;
                } else if (matchKeyword$927('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$932(init$1422)) {
                        throwError$921({}, Messages$866.InvalidLHSInForIn);
                    }
                    operator$1428 = lex$917();
                    left$1425 = init$1422;
                    right$1426 = parseExpression$961();
                    init$1422 = null;
                }
            }
            if (typeof left$1425 === 'undefined') {
                expect$924(';');
            }
        }
        if (typeof left$1425 === 'undefined') {
            if (!match$926(';')) {
                test$1423 = parseExpression$961();
            }
            expect$924(';');
            if (!match$926(')')) {
                update$1424 = parseExpression$961();
            }
        }
        expect$924(')');
        oldInIteration$1429 = state$885.inIteration;
        state$885.inIteration = true;
        if (!(opts$1421 !== undefined && opts$1421.ignoreBody)) {
            body$1427 = parseStatement$992();
        }
        state$885.inIteration = oldInIteration$1429;
        if (typeof left$1425 === 'undefined') {
            return delegate$880.createForStatement(init$1422, test$1423, update$1424, body$1427);
        }
        if (operator$1428.value === 'in') {
            return delegate$880.createForInStatement(left$1425, right$1426, body$1427);
        }
        return delegate$880.createForOfStatement(left$1425, right$1426, body$1427);
    }
    // 12.7 The continue statement
    function parseContinueStatement$982() {
        var label$1430 = null, key$1431;
        expectKeyword$925('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$883.value.charCodeAt(0) === 59) {
            lex$917();
            if (!state$885.inIteration) {
                throwError$921({}, Messages$866.IllegalContinue);
            }
            return delegate$880.createContinueStatement(null);
        }
        if (peekLineTerminator$920()) {
            if (!state$885.inIteration) {
                throwError$921({}, Messages$866.IllegalContinue);
            }
            return delegate$880.createContinueStatement(null);
        }
        if (lookahead$883.type === Token$861.Identifier) {
            label$1430 = parseVariableIdentifier$964();
            key$1431 = '$' + label$1430.name;
            if (!Object.prototype.hasOwnProperty.call(state$885.labelSet, key$1431)) {
                throwError$921({}, Messages$866.UnknownLabel, label$1430.name);
            }
        }
        consumeSemicolon$930();
        if (label$1430 === null && !state$885.inIteration) {
            throwError$921({}, Messages$866.IllegalContinue);
        }
        return delegate$880.createContinueStatement(label$1430);
    }
    // 12.8 The break statement
    function parseBreakStatement$983() {
        var label$1432 = null, key$1433;
        expectKeyword$925('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$883.value.charCodeAt(0) === 59) {
            lex$917();
            if (!(state$885.inIteration || state$885.inSwitch)) {
                throwError$921({}, Messages$866.IllegalBreak);
            }
            return delegate$880.createBreakStatement(null);
        }
        if (peekLineTerminator$920()) {
            if (!(state$885.inIteration || state$885.inSwitch)) {
                throwError$921({}, Messages$866.IllegalBreak);
            }
            return delegate$880.createBreakStatement(null);
        }
        if (lookahead$883.type === Token$861.Identifier) {
            label$1432 = parseVariableIdentifier$964();
            key$1433 = '$' + label$1432.name;
            if (!Object.prototype.hasOwnProperty.call(state$885.labelSet, key$1433)) {
                throwError$921({}, Messages$866.UnknownLabel, label$1432.name);
            }
        }
        consumeSemicolon$930();
        if (label$1432 === null && !(state$885.inIteration || state$885.inSwitch)) {
            throwError$921({}, Messages$866.IllegalBreak);
        }
        return delegate$880.createBreakStatement(label$1432);
    }
    // 12.9 The return statement
    function parseReturnStatement$984() {
        var argument$1434 = null;
        expectKeyword$925('return');
        if (!state$885.inFunctionBody) {
            throwErrorTolerant$922({}, Messages$866.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$894(String(lookahead$883.value).charCodeAt(0))) {
            argument$1434 = parseExpression$961();
            consumeSemicolon$930();
            return delegate$880.createReturnStatement(argument$1434);
        }
        if (peekLineTerminator$920()) {
            return delegate$880.createReturnStatement(null);
        }
        if (!match$926(';')) {
            if (!match$926('}') && lookahead$883.type !== Token$861.EOF) {
                argument$1434 = parseExpression$961();
            }
        }
        consumeSemicolon$930();
        return delegate$880.createReturnStatement(argument$1434);
    }
    // 12.10 The with statement
    function parseWithStatement$985() {
        var object$1435, body$1436;
        if (strict$871) {
            throwErrorTolerant$922({}, Messages$866.StrictModeWith);
        }
        expectKeyword$925('with');
        expect$924('(');
        object$1435 = parseExpression$961();
        expect$924(')');
        body$1436 = parseStatement$992();
        return delegate$880.createWithStatement(object$1435, body$1436);
    }
    // 12.10 The swith statement
    function parseSwitchCase$986() {
        var test$1437, consequent$1438 = [], sourceElement$1439;
        if (matchKeyword$927('default')) {
            lex$917();
            test$1437 = null;
        } else {
            expectKeyword$925('case');
            test$1437 = parseExpression$961();
        }
        expect$924(':');
        while (streamIndex$882 < length$879) {
            if (match$926('}') || matchKeyword$927('default') || matchKeyword$927('case')) {
                break;
            }
            sourceElement$1439 = parseSourceElement$1007();
            if (typeof sourceElement$1439 === 'undefined') {
                break;
            }
            consequent$1438.push(sourceElement$1439);
        }
        return delegate$880.createSwitchCase(test$1437, consequent$1438);
    }
    function parseSwitchStatement$987() {
        var discriminant$1440, cases$1441, clause$1442, oldInSwitch$1443, defaultFound$1444;
        expectKeyword$925('switch');
        expect$924('(');
        discriminant$1440 = parseExpression$961();
        expect$924(')');
        expect$924('{');
        cases$1441 = [];
        if (match$926('}')) {
            lex$917();
            return delegate$880.createSwitchStatement(discriminant$1440, cases$1441);
        }
        oldInSwitch$1443 = state$885.inSwitch;
        state$885.inSwitch = true;
        defaultFound$1444 = false;
        while (streamIndex$882 < length$879) {
            if (match$926('}')) {
                break;
            }
            clause$1442 = parseSwitchCase$986();
            if (clause$1442.test === null) {
                if (defaultFound$1444) {
                    throwError$921({}, Messages$866.MultipleDefaultsInSwitch);
                }
                defaultFound$1444 = true;
            }
            cases$1441.push(clause$1442);
        }
        state$885.inSwitch = oldInSwitch$1443;
        expect$924('}');
        return delegate$880.createSwitchStatement(discriminant$1440, cases$1441);
    }
    // 12.13 The throw statement
    function parseThrowStatement$988() {
        var argument$1445;
        expectKeyword$925('throw');
        if (peekLineTerminator$920()) {
            throwError$921({}, Messages$866.NewlineAfterThrow);
        }
        argument$1445 = parseExpression$961();
        consumeSemicolon$930();
        return delegate$880.createThrowStatement(argument$1445);
    }
    // 12.14 The try statement
    function parseCatchClause$989() {
        var param$1446, body$1447;
        expectKeyword$925('catch');
        expect$924('(');
        if (match$926(')')) {
            throwUnexpected$923(lookahead$883);
        }
        param$1446 = parseExpression$961();
        // 12.14.1
        if (strict$871 && param$1446.type === Syntax$864.Identifier && isRestrictedWord$898(param$1446.name)) {
            throwErrorTolerant$922({}, Messages$866.StrictCatchVariable);
        }
        expect$924(')');
        body$1447 = parseBlock$963();
        return delegate$880.createCatchClause(param$1446, body$1447);
    }
    function parseTryStatement$990() {
        var block$1448, handlers$1449 = [], finalizer$1450 = null;
        expectKeyword$925('try');
        block$1448 = parseBlock$963();
        if (matchKeyword$927('catch')) {
            handlers$1449.push(parseCatchClause$989());
        }
        if (matchKeyword$927('finally')) {
            lex$917();
            finalizer$1450 = parseBlock$963();
        }
        if (handlers$1449.length === 0 && !finalizer$1450) {
            throwError$921({}, Messages$866.NoCatchOrFinally);
        }
        return delegate$880.createTryStatement(block$1448, [], handlers$1449, finalizer$1450);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$991() {
        expectKeyword$925('debugger');
        consumeSemicolon$930();
        return delegate$880.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$992() {
        var type$1451 = lookahead$883.type, expr$1452, labeledBody$1453, key$1454;
        if (type$1451 === Token$861.EOF) {
            throwUnexpected$923(lookahead$883);
        }
        if (type$1451 === Token$861.Punctuator) {
            switch (lookahead$883.value) {
            case ';':
                return parseEmptyStatement$975();
            case '{':
                return parseBlock$963();
            case '(':
                return parseExpressionStatement$976();
            default:
                break;
            }
        }
        if (type$1451 === Token$861.Keyword) {
            switch (lookahead$883.value) {
            case 'break':
                return parseBreakStatement$983();
            case 'continue':
                return parseContinueStatement$982();
            case 'debugger':
                return parseDebuggerStatement$991();
            case 'do':
                return parseDoWhileStatement$978();
            case 'for':
                return parseForStatement$981();
            case 'function':
                return parseFunctionDeclaration$998();
            case 'class':
                return parseClassDeclaration$1005();
            case 'if':
                return parseIfStatement$977();
            case 'return':
                return parseReturnStatement$984();
            case 'switch':
                return parseSwitchStatement$987();
            case 'throw':
                return parseThrowStatement$988();
            case 'try':
                return parseTryStatement$990();
            case 'var':
                return parseVariableStatement$967();
            case 'while':
                return parseWhileStatement$979();
            case 'with':
                return parseWithStatement$985();
            default:
                break;
            }
        }
        expr$1452 = parseExpression$961();
        // 12.12 Labelled Statements
        if (expr$1452.type === Syntax$864.Identifier && match$926(':')) {
            lex$917();
            key$1454 = '$' + expr$1452.name;
            if (Object.prototype.hasOwnProperty.call(state$885.labelSet, key$1454)) {
                throwError$921({}, Messages$866.Redeclaration, 'Label', expr$1452.name);
            }
            state$885.labelSet[key$1454] = true;
            labeledBody$1453 = parseStatement$992();
            delete state$885.labelSet[key$1454];
            return delegate$880.createLabeledStatement(expr$1452, labeledBody$1453);
        }
        consumeSemicolon$930();
        return delegate$880.createExpressionStatement(expr$1452);
    }
    // 13 Function Definition
    function parseConciseBody$993() {
        if (match$926('{')) {
            return parseFunctionSourceElements$994();
        }
        return parseAssignmentExpression$960();
    }
    function parseFunctionSourceElements$994() {
        var sourceElement$1455, sourceElements$1456 = [], token$1457, directive$1458, firstRestricted$1459, oldLabelSet$1460, oldInIteration$1461, oldInSwitch$1462, oldInFunctionBody$1463, oldParenthesizedCount$1464;
        expect$924('{');
        while (streamIndex$882 < length$879) {
            if (lookahead$883.type !== Token$861.StringLiteral) {
                break;
            }
            token$1457 = lookahead$883;
            sourceElement$1455 = parseSourceElement$1007();
            sourceElements$1456.push(sourceElement$1455);
            if (sourceElement$1455.expression.type !== Syntax$864.Literal) {
                // this is not directive
                break;
            }
            directive$1458 = token$1457.value;
            if (directive$1458 === 'use strict') {
                strict$871 = true;
                if (firstRestricted$1459) {
                    throwErrorTolerant$922(firstRestricted$1459, Messages$866.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1459 && token$1457.octal) {
                    firstRestricted$1459 = token$1457;
                }
            }
        }
        oldLabelSet$1460 = state$885.labelSet;
        oldInIteration$1461 = state$885.inIteration;
        oldInSwitch$1462 = state$885.inSwitch;
        oldInFunctionBody$1463 = state$885.inFunctionBody;
        oldParenthesizedCount$1464 = state$885.parenthesizedCount;
        state$885.labelSet = {};
        state$885.inIteration = false;
        state$885.inSwitch = false;
        state$885.inFunctionBody = true;
        state$885.parenthesizedCount = 0;
        while (streamIndex$882 < length$879) {
            if (match$926('}')) {
                break;
            }
            sourceElement$1455 = parseSourceElement$1007();
            if (typeof sourceElement$1455 === 'undefined') {
                break;
            }
            sourceElements$1456.push(sourceElement$1455);
        }
        expect$924('}');
        state$885.labelSet = oldLabelSet$1460;
        state$885.inIteration = oldInIteration$1461;
        state$885.inSwitch = oldInSwitch$1462;
        state$885.inFunctionBody = oldInFunctionBody$1463;
        state$885.parenthesizedCount = oldParenthesizedCount$1464;
        return delegate$880.createBlockStatement(sourceElements$1456);
    }
    function validateParam$995(options$1465, param$1466, name$1467) {
        var key$1468 = '$' + name$1467;
        if (strict$871) {
            if (isRestrictedWord$898(name$1467)) {
                options$1465.stricted = param$1466;
                options$1465.message = Messages$866.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1465.paramSet, key$1468)) {
                options$1465.stricted = param$1466;
                options$1465.message = Messages$866.StrictParamDupe;
            }
        } else if (!options$1465.firstRestricted) {
            if (isRestrictedWord$898(name$1467)) {
                options$1465.firstRestricted = param$1466;
                options$1465.message = Messages$866.StrictParamName;
            } else if (isStrictModeReservedWord$897(name$1467)) {
                options$1465.firstRestricted = param$1466;
                options$1465.message = Messages$866.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1465.paramSet, key$1468)) {
                options$1465.firstRestricted = param$1466;
                options$1465.message = Messages$866.StrictParamDupe;
            }
        }
        options$1465.paramSet[key$1468] = true;
    }
    function parseParam$996(options$1469) {
        var token$1470, rest$1471, param$1472, def$1473;
        token$1470 = lookahead$883;
        if (token$1470.value === '...') {
            token$1470 = lex$917();
            rest$1471 = true;
        }
        if (match$926('[')) {
            param$1472 = parseArrayInitialiser$933();
            reinterpretAsDestructuredParameter$957(options$1469, param$1472);
        } else if (match$926('{')) {
            if (rest$1471) {
                throwError$921({}, Messages$866.ObjectPatternAsRestParameter);
            }
            param$1472 = parseObjectInitialiser$938();
            reinterpretAsDestructuredParameter$957(options$1469, param$1472);
        } else {
            param$1472 = parseVariableIdentifier$964();
            validateParam$995(options$1469, token$1470, token$1470.value);
            if (match$926('=')) {
                if (rest$1471) {
                    throwErrorTolerant$922(lookahead$883, Messages$866.DefaultRestParameter);
                }
                lex$917();
                def$1473 = parseAssignmentExpression$960();
                ++options$1469.defaultCount;
            }
        }
        if (rest$1471) {
            if (!match$926(')')) {
                throwError$921({}, Messages$866.ParameterAfterRestParameter);
            }
            options$1469.rest = param$1472;
            return false;
        }
        options$1469.params.push(param$1472);
        options$1469.defaults.push(def$1473);
        return !match$926(')');
    }
    function parseParams$997(firstRestricted$1474) {
        var options$1475;
        options$1475 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1474
        };
        expect$924('(');
        if (!match$926(')')) {
            options$1475.paramSet = {};
            while (streamIndex$882 < length$879) {
                if (!parseParam$996(options$1475)) {
                    break;
                }
                expect$924(',');
            }
        }
        expect$924(')');
        if (options$1475.defaultCount === 0) {
            options$1475.defaults = [];
        }
        return options$1475;
    }
    function parseFunctionDeclaration$998() {
        var id$1476, body$1477, token$1478, tmp$1479, firstRestricted$1480, message$1481, previousStrict$1482, previousYieldAllowed$1483, generator$1484, expression$1485;
        expectKeyword$925('function');
        generator$1484 = false;
        if (match$926('*')) {
            lex$917();
            generator$1484 = true;
        }
        token$1478 = lookahead$883;
        id$1476 = parseVariableIdentifier$964();
        if (strict$871) {
            if (isRestrictedWord$898(token$1478.value)) {
                throwErrorTolerant$922(token$1478, Messages$866.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$898(token$1478.value)) {
                firstRestricted$1480 = token$1478;
                message$1481 = Messages$866.StrictFunctionName;
            } else if (isStrictModeReservedWord$897(token$1478.value)) {
                firstRestricted$1480 = token$1478;
                message$1481 = Messages$866.StrictReservedWord;
            }
        }
        tmp$1479 = parseParams$997(firstRestricted$1480);
        firstRestricted$1480 = tmp$1479.firstRestricted;
        if (tmp$1479.message) {
            message$1481 = tmp$1479.message;
        }
        previousStrict$1482 = strict$871;
        previousYieldAllowed$1483 = state$885.yieldAllowed;
        state$885.yieldAllowed = generator$1484;
        // here we redo some work in order to set 'expression'
        expression$1485 = !match$926('{');
        body$1477 = parseConciseBody$993();
        if (strict$871 && firstRestricted$1480) {
            throwError$921(firstRestricted$1480, message$1481);
        }
        if (strict$871 && tmp$1479.stricted) {
            throwErrorTolerant$922(tmp$1479.stricted, message$1481);
        }
        if (state$885.yieldAllowed && !state$885.yieldFound) {
            throwErrorTolerant$922({}, Messages$866.NoYieldInGenerator);
        }
        strict$871 = previousStrict$1482;
        state$885.yieldAllowed = previousYieldAllowed$1483;
        return delegate$880.createFunctionDeclaration(id$1476, tmp$1479.params, tmp$1479.defaults, body$1477, tmp$1479.rest, generator$1484, expression$1485);
    }
    function parseFunctionExpression$999() {
        var token$1486, id$1487 = null, firstRestricted$1488, message$1489, tmp$1490, body$1491, previousStrict$1492, previousYieldAllowed$1493, generator$1494, expression$1495;
        expectKeyword$925('function');
        generator$1494 = false;
        if (match$926('*')) {
            lex$917();
            generator$1494 = true;
        }
        if (!match$926('(')) {
            token$1486 = lookahead$883;
            id$1487 = parseVariableIdentifier$964();
            if (strict$871) {
                if (isRestrictedWord$898(token$1486.value)) {
                    throwErrorTolerant$922(token$1486, Messages$866.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$898(token$1486.value)) {
                    firstRestricted$1488 = token$1486;
                    message$1489 = Messages$866.StrictFunctionName;
                } else if (isStrictModeReservedWord$897(token$1486.value)) {
                    firstRestricted$1488 = token$1486;
                    message$1489 = Messages$866.StrictReservedWord;
                }
            }
        }
        tmp$1490 = parseParams$997(firstRestricted$1488);
        firstRestricted$1488 = tmp$1490.firstRestricted;
        if (tmp$1490.message) {
            message$1489 = tmp$1490.message;
        }
        previousStrict$1492 = strict$871;
        previousYieldAllowed$1493 = state$885.yieldAllowed;
        state$885.yieldAllowed = generator$1494;
        // here we redo some work in order to set 'expression'
        expression$1495 = !match$926('{');
        body$1491 = parseConciseBody$993();
        if (strict$871 && firstRestricted$1488) {
            throwError$921(firstRestricted$1488, message$1489);
        }
        if (strict$871 && tmp$1490.stricted) {
            throwErrorTolerant$922(tmp$1490.stricted, message$1489);
        }
        if (state$885.yieldAllowed && !state$885.yieldFound) {
            throwErrorTolerant$922({}, Messages$866.NoYieldInGenerator);
        }
        strict$871 = previousStrict$1492;
        state$885.yieldAllowed = previousYieldAllowed$1493;
        return delegate$880.createFunctionExpression(id$1487, tmp$1490.params, tmp$1490.defaults, body$1491, tmp$1490.rest, generator$1494, expression$1495);
    }
    function parseYieldExpression$1000() {
        var delegateFlag$1496, expr$1497, previousYieldAllowed$1498;
        expectKeyword$925('yield');
        if (!state$885.yieldAllowed) {
            throwErrorTolerant$922({}, Messages$866.IllegalYield);
        }
        delegateFlag$1496 = false;
        if (match$926('*')) {
            lex$917();
            delegateFlag$1496 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1498 = state$885.yieldAllowed;
        state$885.yieldAllowed = false;
        expr$1497 = parseAssignmentExpression$960();
        state$885.yieldAllowed = previousYieldAllowed$1498;
        state$885.yieldFound = true;
        return delegate$880.createYieldExpression(expr$1497, delegateFlag$1496);
    }
    // 14 Classes
    function parseMethodDefinition$1001(existingPropNames$1499) {
        var token$1500, key$1501, param$1502, propType$1503, isValidDuplicateProp$1504 = false;
        if (lookahead$883.value === 'static') {
            propType$1503 = ClassPropertyType$869.static;
            lex$917();
        } else {
            propType$1503 = ClassPropertyType$869.prototype;
        }
        if (match$926('*')) {
            lex$917();
            return delegate$880.createMethodDefinition(propType$1503, '', parseObjectPropertyKey$936(), parsePropertyMethodFunction$935({ generator: true }));
        }
        token$1500 = lookahead$883;
        key$1501 = parseObjectPropertyKey$936();
        if (token$1500.value === 'get' && !match$926('(')) {
            key$1501 = parseObjectPropertyKey$936();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1499[propType$1503].hasOwnProperty(key$1501.name)) {
                isValidDuplicateProp$1504 = existingPropNames$1499[propType$1503][key$1501.name].get === undefined && existingPropNames$1499[propType$1503][key$1501.name].data === undefined && existingPropNames$1499[propType$1503][key$1501.name].set !== undefined;
                if (!isValidDuplicateProp$1504) {
                    throwError$921(key$1501, Messages$866.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1499[propType$1503][key$1501.name] = {};
            }
            existingPropNames$1499[propType$1503][key$1501.name].get = true;
            expect$924('(');
            expect$924(')');
            return delegate$880.createMethodDefinition(propType$1503, 'get', key$1501, parsePropertyFunction$934({ generator: false }));
        }
        if (token$1500.value === 'set' && !match$926('(')) {
            key$1501 = parseObjectPropertyKey$936();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1499[propType$1503].hasOwnProperty(key$1501.name)) {
                isValidDuplicateProp$1504 = existingPropNames$1499[propType$1503][key$1501.name].set === undefined && existingPropNames$1499[propType$1503][key$1501.name].data === undefined && existingPropNames$1499[propType$1503][key$1501.name].get !== undefined;
                if (!isValidDuplicateProp$1504) {
                    throwError$921(key$1501, Messages$866.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1499[propType$1503][key$1501.name] = {};
            }
            existingPropNames$1499[propType$1503][key$1501.name].set = true;
            expect$924('(');
            token$1500 = lookahead$883;
            param$1502 = [parseVariableIdentifier$964()];
            expect$924(')');
            return delegate$880.createMethodDefinition(propType$1503, 'set', key$1501, parsePropertyFunction$934({
                params: param$1502,
                generator: false,
                name: token$1500
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1499[propType$1503].hasOwnProperty(key$1501.name)) {
            throwError$921(key$1501, Messages$866.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1499[propType$1503][key$1501.name] = {};
        }
        existingPropNames$1499[propType$1503][key$1501.name].data = true;
        return delegate$880.createMethodDefinition(propType$1503, '', key$1501, parsePropertyMethodFunction$935({ generator: false }));
    }
    function parseClassElement$1002(existingProps$1505) {
        if (match$926(';')) {
            lex$917();
            return;
        }
        return parseMethodDefinition$1001(existingProps$1505);
    }
    function parseClassBody$1003() {
        var classElement$1506, classElements$1507 = [], existingProps$1508 = {};
        existingProps$1508[ClassPropertyType$869.static] = {};
        existingProps$1508[ClassPropertyType$869.prototype] = {};
        expect$924('{');
        while (streamIndex$882 < length$879) {
            if (match$926('}')) {
                break;
            }
            classElement$1506 = parseClassElement$1002(existingProps$1508);
            if (typeof classElement$1506 !== 'undefined') {
                classElements$1507.push(classElement$1506);
            }
        }
        expect$924('}');
        return delegate$880.createClassBody(classElements$1507);
    }
    function parseClassExpression$1004() {
        var id$1509, previousYieldAllowed$1510, superClass$1511 = null;
        expectKeyword$925('class');
        if (!matchKeyword$927('extends') && !match$926('{')) {
            id$1509 = parseVariableIdentifier$964();
        }
        if (matchKeyword$927('extends')) {
            expectKeyword$925('extends');
            previousYieldAllowed$1510 = state$885.yieldAllowed;
            state$885.yieldAllowed = false;
            superClass$1511 = parseAssignmentExpression$960();
            state$885.yieldAllowed = previousYieldAllowed$1510;
        }
        return delegate$880.createClassExpression(id$1509, superClass$1511, parseClassBody$1003());
    }
    function parseClassDeclaration$1005() {
        var id$1512, previousYieldAllowed$1513, superClass$1514 = null;
        expectKeyword$925('class');
        id$1512 = parseVariableIdentifier$964();
        if (matchKeyword$927('extends')) {
            expectKeyword$925('extends');
            previousYieldAllowed$1513 = state$885.yieldAllowed;
            state$885.yieldAllowed = false;
            superClass$1514 = parseAssignmentExpression$960();
            state$885.yieldAllowed = previousYieldAllowed$1513;
        }
        return delegate$880.createClassDeclaration(id$1512, superClass$1514, parseClassBody$1003());
    }
    // 15 Program
    function matchModuleDeclaration$1006() {
        var id$1515;
        if (matchContextualKeyword$928('module')) {
            id$1515 = lookahead2$919();
            return id$1515.type === Token$861.StringLiteral || id$1515.type === Token$861.Identifier;
        }
        return false;
    }
    function parseSourceElement$1007() {
        if (lookahead$883.type === Token$861.Keyword) {
            switch (lookahead$883.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$968(lookahead$883.value);
            case 'function':
                return parseFunctionDeclaration$998();
            case 'export':
                return parseExportDeclaration$972();
            case 'import':
                return parseImportDeclaration$973();
            default:
                return parseStatement$992();
            }
        }
        if (matchModuleDeclaration$1006()) {
            throwError$921({}, Messages$866.NestedModule);
        }
        if (lookahead$883.type !== Token$861.EOF) {
            return parseStatement$992();
        }
    }
    function parseProgramElement$1008() {
        if (lookahead$883.type === Token$861.Keyword) {
            switch (lookahead$883.value) {
            case 'export':
                return parseExportDeclaration$972();
            case 'import':
                return parseImportDeclaration$973();
            }
        }
        if (matchModuleDeclaration$1006()) {
            return parseModuleDeclaration$969();
        }
        return parseSourceElement$1007();
    }
    function parseProgramElements$1009() {
        var sourceElement$1516, sourceElements$1517 = [], token$1518, directive$1519, firstRestricted$1520;
        while (streamIndex$882 < length$879) {
            token$1518 = lookahead$883;
            if (token$1518.type !== Token$861.StringLiteral) {
                break;
            }
            sourceElement$1516 = parseProgramElement$1008();
            sourceElements$1517.push(sourceElement$1516);
            if (sourceElement$1516.expression.type !== Syntax$864.Literal) {
                // this is not directive
                break;
            }
            directive$1519 = token$1518.value;
            if (directive$1519 === 'use strict') {
                strict$871 = true;
                if (firstRestricted$1520) {
                    throwErrorTolerant$922(firstRestricted$1520, Messages$866.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1520 && token$1518.octal) {
                    firstRestricted$1520 = token$1518;
                }
            }
        }
        while (streamIndex$882 < length$879) {
            sourceElement$1516 = parseProgramElement$1008();
            if (typeof sourceElement$1516 === 'undefined') {
                break;
            }
            sourceElements$1517.push(sourceElement$1516);
        }
        return sourceElements$1517;
    }
    function parseModuleElement$1010() {
        return parseSourceElement$1007();
    }
    function parseModuleElements$1011() {
        var list$1521 = [], statement$1522;
        while (streamIndex$882 < length$879) {
            if (match$926('}')) {
                break;
            }
            statement$1522 = parseModuleElement$1010();
            if (typeof statement$1522 === 'undefined') {
                break;
            }
            list$1521.push(statement$1522);
        }
        return list$1521;
    }
    function parseModuleBlock$1012() {
        var block$1523;
        expect$924('{');
        block$1523 = parseModuleElements$1011();
        expect$924('}');
        return delegate$880.createBlockStatement(block$1523);
    }
    function parseProgram$1013() {
        var body$1524;
        strict$871 = false;
        peek$918();
        body$1524 = parseProgramElements$1009();
        return delegate$880.createProgram(body$1524);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1014(type$1525, value$1526, start$1527, end$1528, loc$1529) {
        assert$887(typeof start$1527 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$886.comments.length > 0) {
            if (extra$886.comments[extra$886.comments.length - 1].range[1] > start$1527) {
                return;
            }
        }
        extra$886.comments.push({
            type: type$1525,
            value: value$1526,
            range: [
                start$1527,
                end$1528
            ],
            loc: loc$1529
        });
    }
    function scanComment$1015() {
        var comment$1530, ch$1531, loc$1532, start$1533, blockComment$1534, lineComment$1535;
        comment$1530 = '';
        blockComment$1534 = false;
        lineComment$1535 = false;
        while (index$872 < length$879) {
            ch$1531 = source$870[index$872];
            if (lineComment$1535) {
                ch$1531 = source$870[index$872++];
                if (isLineTerminator$893(ch$1531.charCodeAt(0))) {
                    loc$1532.end = {
                        line: lineNumber$873,
                        column: index$872 - lineStart$874 - 1
                    };
                    lineComment$1535 = false;
                    addComment$1014('Line', comment$1530, start$1533, index$872 - 1, loc$1532);
                    if (ch$1531 === '\r' && source$870[index$872] === '\n') {
                        ++index$872;
                    }
                    ++lineNumber$873;
                    lineStart$874 = index$872;
                    comment$1530 = '';
                } else if (index$872 >= length$879) {
                    lineComment$1535 = false;
                    comment$1530 += ch$1531;
                    loc$1532.end = {
                        line: lineNumber$873,
                        column: length$879 - lineStart$874
                    };
                    addComment$1014('Line', comment$1530, start$1533, length$879, loc$1532);
                } else {
                    comment$1530 += ch$1531;
                }
            } else if (blockComment$1534) {
                if (isLineTerminator$893(ch$1531.charCodeAt(0))) {
                    if (ch$1531 === '\r' && source$870[index$872 + 1] === '\n') {
                        ++index$872;
                        comment$1530 += '\r\n';
                    } else {
                        comment$1530 += ch$1531;
                    }
                    ++lineNumber$873;
                    ++index$872;
                    lineStart$874 = index$872;
                    if (index$872 >= length$879) {
                        throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1531 = source$870[index$872++];
                    if (index$872 >= length$879) {
                        throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1530 += ch$1531;
                    if (ch$1531 === '*') {
                        ch$1531 = source$870[index$872];
                        if (ch$1531 === '/') {
                            comment$1530 = comment$1530.substr(0, comment$1530.length - 1);
                            blockComment$1534 = false;
                            ++index$872;
                            loc$1532.end = {
                                line: lineNumber$873,
                                column: index$872 - lineStart$874
                            };
                            addComment$1014('Block', comment$1530, start$1533, index$872, loc$1532);
                            comment$1530 = '';
                        }
                    }
                }
            } else if (ch$1531 === '/') {
                ch$1531 = source$870[index$872 + 1];
                if (ch$1531 === '/') {
                    loc$1532 = {
                        start: {
                            line: lineNumber$873,
                            column: index$872 - lineStart$874
                        }
                    };
                    start$1533 = index$872;
                    index$872 += 2;
                    lineComment$1535 = true;
                    if (index$872 >= length$879) {
                        loc$1532.end = {
                            line: lineNumber$873,
                            column: index$872 - lineStart$874
                        };
                        lineComment$1535 = false;
                        addComment$1014('Line', comment$1530, start$1533, index$872, loc$1532);
                    }
                } else if (ch$1531 === '*') {
                    start$1533 = index$872;
                    index$872 += 2;
                    blockComment$1534 = true;
                    loc$1532 = {
                        start: {
                            line: lineNumber$873,
                            column: index$872 - lineStart$874 - 2
                        }
                    };
                    if (index$872 >= length$879) {
                        throwError$921({}, Messages$866.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$892(ch$1531.charCodeAt(0))) {
                ++index$872;
            } else if (isLineTerminator$893(ch$1531.charCodeAt(0))) {
                ++index$872;
                if (ch$1531 === '\r' && source$870[index$872] === '\n') {
                    ++index$872;
                }
                ++lineNumber$873;
                lineStart$874 = index$872;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1016() {
        var i$1536, entry$1537, comment$1538, comments$1539 = [];
        for (i$1536 = 0; i$1536 < extra$886.comments.length; ++i$1536) {
            entry$1537 = extra$886.comments[i$1536];
            comment$1538 = {
                type: entry$1537.type,
                value: entry$1537.value
            };
            if (extra$886.range) {
                comment$1538.range = entry$1537.range;
            }
            if (extra$886.loc) {
                comment$1538.loc = entry$1537.loc;
            }
            comments$1539.push(comment$1538);
        }
        extra$886.comments = comments$1539;
    }
    function collectToken$1017() {
        var start$1540, loc$1541, token$1542, range$1543, value$1544;
        skipComment$900();
        start$1540 = index$872;
        loc$1541 = {
            start: {
                line: lineNumber$873,
                column: index$872 - lineStart$874
            }
        };
        token$1542 = extra$886.advance();
        loc$1541.end = {
            line: lineNumber$873,
            column: index$872 - lineStart$874
        };
        if (token$1542.type !== Token$861.EOF) {
            range$1543 = [
                token$1542.range[0],
                token$1542.range[1]
            ];
            value$1544 = source$870.slice(token$1542.range[0], token$1542.range[1]);
            extra$886.tokens.push({
                type: TokenName$862[token$1542.type],
                value: value$1544,
                range: range$1543,
                loc: loc$1541
            });
        }
        return token$1542;
    }
    function collectRegex$1018() {
        var pos$1545, loc$1546, regex$1547, token$1548;
        skipComment$900();
        pos$1545 = index$872;
        loc$1546 = {
            start: {
                line: lineNumber$873,
                column: index$872 - lineStart$874
            }
        };
        regex$1547 = extra$886.scanRegExp();
        loc$1546.end = {
            line: lineNumber$873,
            column: index$872 - lineStart$874
        };
        if (!extra$886.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$886.tokens.length > 0) {
                token$1548 = extra$886.tokens[extra$886.tokens.length - 1];
                if (token$1548.range[0] === pos$1545 && token$1548.type === 'Punctuator') {
                    if (token$1548.value === '/' || token$1548.value === '/=') {
                        extra$886.tokens.pop();
                    }
                }
            }
            extra$886.tokens.push({
                type: 'RegularExpression',
                value: regex$1547.literal,
                range: [
                    pos$1545,
                    index$872
                ],
                loc: loc$1546
            });
        }
        return regex$1547;
    }
    function filterTokenLocation$1019() {
        var i$1549, entry$1550, token$1551, tokens$1552 = [];
        for (i$1549 = 0; i$1549 < extra$886.tokens.length; ++i$1549) {
            entry$1550 = extra$886.tokens[i$1549];
            token$1551 = {
                type: entry$1550.type,
                value: entry$1550.value
            };
            if (extra$886.range) {
                token$1551.range = entry$1550.range;
            }
            if (extra$886.loc) {
                token$1551.loc = entry$1550.loc;
            }
            tokens$1552.push(token$1551);
        }
        extra$886.tokens = tokens$1552;
    }
    function LocationMarker$1020() {
        var sm_index$1553 = lookahead$883 ? lookahead$883.sm_range[0] : 0;
        var sm_lineStart$1554 = lookahead$883 ? lookahead$883.sm_lineStart : 0;
        var sm_lineNumber$1555 = lookahead$883 ? lookahead$883.sm_lineNumber : 1;
        this.range = [
            sm_index$1553,
            sm_index$1553
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1555,
                column: sm_index$1553 - sm_lineStart$1554
            },
            end: {
                line: sm_lineNumber$1555,
                column: sm_index$1553 - sm_lineStart$1554
            }
        };
    }
    LocationMarker$1020.prototype = {
        constructor: LocationMarker$1020,
        end: function () {
            this.range[1] = sm_index$878;
            this.loc.end.line = sm_lineNumber$875;
            this.loc.end.column = sm_index$878 - sm_lineStart$876;
        },
        applyGroup: function (node$1556) {
            if (extra$886.range) {
                node$1556.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$886.loc) {
                node$1556.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1556 = delegate$880.postProcess(node$1556);
            }
        },
        apply: function (node$1557) {
            var nodeType$1558 = typeof node$1557;
            assert$887(nodeType$1558 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1558);
            if (extra$886.range) {
                node$1557.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$886.loc) {
                node$1557.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1557 = delegate$880.postProcess(node$1557);
            }
        }
    };
    function createLocationMarker$1021() {
        return new LocationMarker$1020();
    }
    function trackGroupExpression$1022() {
        var marker$1559, expr$1560;
        marker$1559 = createLocationMarker$1021();
        expect$924('(');
        ++state$885.parenthesizedCount;
        expr$1560 = parseExpression$961();
        expect$924(')');
        marker$1559.end();
        marker$1559.applyGroup(expr$1560);
        return expr$1560;
    }
    function trackLeftHandSideExpression$1023() {
        var marker$1561, expr$1562;
        // skipComment();
        marker$1561 = createLocationMarker$1021();
        expr$1562 = matchKeyword$927('new') ? parseNewExpression$948() : parsePrimaryExpression$942();
        while (match$926('.') || match$926('[') || lookahead$883.type === Token$861.Template) {
            if (match$926('[')) {
                expr$1562 = delegate$880.createMemberExpression('[', expr$1562, parseComputedMember$947());
                marker$1561.end();
                marker$1561.apply(expr$1562);
            } else if (match$926('.')) {
                expr$1562 = delegate$880.createMemberExpression('.', expr$1562, parseNonComputedMember$946());
                marker$1561.end();
                marker$1561.apply(expr$1562);
            } else {
                expr$1562 = delegate$880.createTaggedTemplateExpression(expr$1562, parseTemplateLiteral$940());
                marker$1561.end();
                marker$1561.apply(expr$1562);
            }
        }
        return expr$1562;
    }
    function trackLeftHandSideExpressionAllowCall$1024() {
        var marker$1563, expr$1564, args$1565;
        // skipComment();
        marker$1563 = createLocationMarker$1021();
        expr$1564 = matchKeyword$927('new') ? parseNewExpression$948() : parsePrimaryExpression$942();
        while (match$926('.') || match$926('[') || match$926('(') || lookahead$883.type === Token$861.Template) {
            if (match$926('(')) {
                args$1565 = parseArguments$943();
                expr$1564 = delegate$880.createCallExpression(expr$1564, args$1565);
                marker$1563.end();
                marker$1563.apply(expr$1564);
            } else if (match$926('[')) {
                expr$1564 = delegate$880.createMemberExpression('[', expr$1564, parseComputedMember$947());
                marker$1563.end();
                marker$1563.apply(expr$1564);
            } else if (match$926('.')) {
                expr$1564 = delegate$880.createMemberExpression('.', expr$1564, parseNonComputedMember$946());
                marker$1563.end();
                marker$1563.apply(expr$1564);
            } else {
                expr$1564 = delegate$880.createTaggedTemplateExpression(expr$1564, parseTemplateLiteral$940());
                marker$1563.end();
                marker$1563.apply(expr$1564);
            }
        }
        return expr$1564;
    }
    function filterGroup$1025(node$1566) {
        var n$1567, i$1568, entry$1569;
        n$1567 = Object.prototype.toString.apply(node$1566) === '[object Array]' ? [] : {};
        for (i$1568 in node$1566) {
            if (node$1566.hasOwnProperty(i$1568) && i$1568 !== 'groupRange' && i$1568 !== 'groupLoc') {
                entry$1569 = node$1566[i$1568];
                if (entry$1569 === null || typeof entry$1569 !== 'object' || entry$1569 instanceof RegExp) {
                    n$1567[i$1568] = entry$1569;
                } else {
                    n$1567[i$1568] = filterGroup$1025(entry$1569);
                }
            }
        }
        return n$1567;
    }
    function wrapTrackingFunction$1026(range$1570, loc$1571) {
        return function (parseFunction$1572) {
            function isBinary$1573(node$1575) {
                return node$1575.type === Syntax$864.LogicalExpression || node$1575.type === Syntax$864.BinaryExpression;
            }
            function visit$1574(node$1576) {
                var start$1577, end$1578;
                if (isBinary$1573(node$1576.left)) {
                    visit$1574(node$1576.left);
                }
                if (isBinary$1573(node$1576.right)) {
                    visit$1574(node$1576.right);
                }
                if (range$1570) {
                    if (node$1576.left.groupRange || node$1576.right.groupRange) {
                        start$1577 = node$1576.left.groupRange ? node$1576.left.groupRange[0] : node$1576.left.range[0];
                        end$1578 = node$1576.right.groupRange ? node$1576.right.groupRange[1] : node$1576.right.range[1];
                        node$1576.range = [
                            start$1577,
                            end$1578
                        ];
                    } else if (typeof node$1576.range === 'undefined') {
                        start$1577 = node$1576.left.range[0];
                        end$1578 = node$1576.right.range[1];
                        node$1576.range = [
                            start$1577,
                            end$1578
                        ];
                    }
                }
                if (loc$1571) {
                    if (node$1576.left.groupLoc || node$1576.right.groupLoc) {
                        start$1577 = node$1576.left.groupLoc ? node$1576.left.groupLoc.start : node$1576.left.loc.start;
                        end$1578 = node$1576.right.groupLoc ? node$1576.right.groupLoc.end : node$1576.right.loc.end;
                        node$1576.loc = {
                            start: start$1577,
                            end: end$1578
                        };
                        node$1576 = delegate$880.postProcess(node$1576);
                    } else if (typeof node$1576.loc === 'undefined') {
                        node$1576.loc = {
                            start: node$1576.left.loc.start,
                            end: node$1576.right.loc.end
                        };
                        node$1576 = delegate$880.postProcess(node$1576);
                    }
                }
            }
            return function () {
                var marker$1579, node$1580, curr$1581 = lookahead$883;
                marker$1579 = createLocationMarker$1021();
                node$1580 = parseFunction$1572.apply(null, arguments);
                marker$1579.end();
                if (node$1580.type !== Syntax$864.Program) {
                    if (curr$1581.leadingComments) {
                        node$1580.leadingComments = curr$1581.leadingComments;
                    }
                    if (curr$1581.trailingComments) {
                        node$1580.trailingComments = curr$1581.trailingComments;
                    }
                }
                if (range$1570 && typeof node$1580.range === 'undefined') {
                    marker$1579.apply(node$1580);
                }
                if (loc$1571 && typeof node$1580.loc === 'undefined') {
                    marker$1579.apply(node$1580);
                }
                if (isBinary$1573(node$1580)) {
                    visit$1574(node$1580);
                }
                return node$1580;
            };
        };
    }
    function patch$1027() {
        var wrapTracking$1582;
        if (extra$886.comments) {
            extra$886.skipComment = skipComment$900;
            skipComment$900 = scanComment$1015;
        }
        if (extra$886.range || extra$886.loc) {
            extra$886.parseGroupExpression = parseGroupExpression$941;
            extra$886.parseLeftHandSideExpression = parseLeftHandSideExpression$950;
            extra$886.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$949;
            parseGroupExpression$941 = trackGroupExpression$1022;
            parseLeftHandSideExpression$950 = trackLeftHandSideExpression$1023;
            parseLeftHandSideExpressionAllowCall$949 = trackLeftHandSideExpressionAllowCall$1024;
            wrapTracking$1582 = wrapTrackingFunction$1026(extra$886.range, extra$886.loc);
            extra$886.parseArrayInitialiser = parseArrayInitialiser$933;
            extra$886.parseAssignmentExpression = parseAssignmentExpression$960;
            extra$886.parseBinaryExpression = parseBinaryExpression$954;
            extra$886.parseBlock = parseBlock$963;
            extra$886.parseFunctionSourceElements = parseFunctionSourceElements$994;
            extra$886.parseCatchClause = parseCatchClause$989;
            extra$886.parseComputedMember = parseComputedMember$947;
            extra$886.parseConditionalExpression = parseConditionalExpression$955;
            extra$886.parseConstLetDeclaration = parseConstLetDeclaration$968;
            extra$886.parseExportBatchSpecifier = parseExportBatchSpecifier$970;
            extra$886.parseExportDeclaration = parseExportDeclaration$972;
            extra$886.parseExportSpecifier = parseExportSpecifier$971;
            extra$886.parseExpression = parseExpression$961;
            extra$886.parseForVariableDeclaration = parseForVariableDeclaration$980;
            extra$886.parseFunctionDeclaration = parseFunctionDeclaration$998;
            extra$886.parseFunctionExpression = parseFunctionExpression$999;
            extra$886.parseParams = parseParams$997;
            extra$886.parseImportDeclaration = parseImportDeclaration$973;
            extra$886.parseImportSpecifier = parseImportSpecifier$974;
            extra$886.parseModuleDeclaration = parseModuleDeclaration$969;
            extra$886.parseModuleBlock = parseModuleBlock$1012;
            extra$886.parseNewExpression = parseNewExpression$948;
            extra$886.parseNonComputedProperty = parseNonComputedProperty$945;
            extra$886.parseObjectInitialiser = parseObjectInitialiser$938;
            extra$886.parseObjectProperty = parseObjectProperty$937;
            extra$886.parseObjectPropertyKey = parseObjectPropertyKey$936;
            extra$886.parsePostfixExpression = parsePostfixExpression$951;
            extra$886.parsePrimaryExpression = parsePrimaryExpression$942;
            extra$886.parseProgram = parseProgram$1013;
            extra$886.parsePropertyFunction = parsePropertyFunction$934;
            extra$886.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$944;
            extra$886.parseTemplateElement = parseTemplateElement$939;
            extra$886.parseTemplateLiteral = parseTemplateLiteral$940;
            extra$886.parseStatement = parseStatement$992;
            extra$886.parseSwitchCase = parseSwitchCase$986;
            extra$886.parseUnaryExpression = parseUnaryExpression$952;
            extra$886.parseVariableDeclaration = parseVariableDeclaration$965;
            extra$886.parseVariableIdentifier = parseVariableIdentifier$964;
            extra$886.parseMethodDefinition = parseMethodDefinition$1001;
            extra$886.parseClassDeclaration = parseClassDeclaration$1005;
            extra$886.parseClassExpression = parseClassExpression$1004;
            extra$886.parseClassBody = parseClassBody$1003;
            parseArrayInitialiser$933 = wrapTracking$1582(extra$886.parseArrayInitialiser);
            parseAssignmentExpression$960 = wrapTracking$1582(extra$886.parseAssignmentExpression);
            parseBinaryExpression$954 = wrapTracking$1582(extra$886.parseBinaryExpression);
            parseBlock$963 = wrapTracking$1582(extra$886.parseBlock);
            parseFunctionSourceElements$994 = wrapTracking$1582(extra$886.parseFunctionSourceElements);
            parseCatchClause$989 = wrapTracking$1582(extra$886.parseCatchClause);
            parseComputedMember$947 = wrapTracking$1582(extra$886.parseComputedMember);
            parseConditionalExpression$955 = wrapTracking$1582(extra$886.parseConditionalExpression);
            parseConstLetDeclaration$968 = wrapTracking$1582(extra$886.parseConstLetDeclaration);
            parseExportBatchSpecifier$970 = wrapTracking$1582(parseExportBatchSpecifier$970);
            parseExportDeclaration$972 = wrapTracking$1582(parseExportDeclaration$972);
            parseExportSpecifier$971 = wrapTracking$1582(parseExportSpecifier$971);
            parseExpression$961 = wrapTracking$1582(extra$886.parseExpression);
            parseForVariableDeclaration$980 = wrapTracking$1582(extra$886.parseForVariableDeclaration);
            parseFunctionDeclaration$998 = wrapTracking$1582(extra$886.parseFunctionDeclaration);
            parseFunctionExpression$999 = wrapTracking$1582(extra$886.parseFunctionExpression);
            parseParams$997 = wrapTracking$1582(extra$886.parseParams);
            parseImportDeclaration$973 = wrapTracking$1582(extra$886.parseImportDeclaration);
            parseImportSpecifier$974 = wrapTracking$1582(extra$886.parseImportSpecifier);
            parseModuleDeclaration$969 = wrapTracking$1582(extra$886.parseModuleDeclaration);
            parseModuleBlock$1012 = wrapTracking$1582(extra$886.parseModuleBlock);
            parseLeftHandSideExpression$950 = wrapTracking$1582(parseLeftHandSideExpression$950);
            parseNewExpression$948 = wrapTracking$1582(extra$886.parseNewExpression);
            parseNonComputedProperty$945 = wrapTracking$1582(extra$886.parseNonComputedProperty);
            parseObjectInitialiser$938 = wrapTracking$1582(extra$886.parseObjectInitialiser);
            parseObjectProperty$937 = wrapTracking$1582(extra$886.parseObjectProperty);
            parseObjectPropertyKey$936 = wrapTracking$1582(extra$886.parseObjectPropertyKey);
            parsePostfixExpression$951 = wrapTracking$1582(extra$886.parsePostfixExpression);
            parsePrimaryExpression$942 = wrapTracking$1582(extra$886.parsePrimaryExpression);
            parseProgram$1013 = wrapTracking$1582(extra$886.parseProgram);
            parsePropertyFunction$934 = wrapTracking$1582(extra$886.parsePropertyFunction);
            parseTemplateElement$939 = wrapTracking$1582(extra$886.parseTemplateElement);
            parseTemplateLiteral$940 = wrapTracking$1582(extra$886.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$944 = wrapTracking$1582(extra$886.parseSpreadOrAssignmentExpression);
            parseStatement$992 = wrapTracking$1582(extra$886.parseStatement);
            parseSwitchCase$986 = wrapTracking$1582(extra$886.parseSwitchCase);
            parseUnaryExpression$952 = wrapTracking$1582(extra$886.parseUnaryExpression);
            parseVariableDeclaration$965 = wrapTracking$1582(extra$886.parseVariableDeclaration);
            parseVariableIdentifier$964 = wrapTracking$1582(extra$886.parseVariableIdentifier);
            parseMethodDefinition$1001 = wrapTracking$1582(extra$886.parseMethodDefinition);
            parseClassDeclaration$1005 = wrapTracking$1582(extra$886.parseClassDeclaration);
            parseClassExpression$1004 = wrapTracking$1582(extra$886.parseClassExpression);
            parseClassBody$1003 = wrapTracking$1582(extra$886.parseClassBody);
        }
        if (typeof extra$886.tokens !== 'undefined') {
            extra$886.advance = advance$916;
            extra$886.scanRegExp = scanRegExp$913;
            advance$916 = collectToken$1017;
            scanRegExp$913 = collectRegex$1018;
        }
    }
    function unpatch$1028() {
        if (typeof extra$886.skipComment === 'function') {
            skipComment$900 = extra$886.skipComment;
        }
        if (extra$886.range || extra$886.loc) {
            parseArrayInitialiser$933 = extra$886.parseArrayInitialiser;
            parseAssignmentExpression$960 = extra$886.parseAssignmentExpression;
            parseBinaryExpression$954 = extra$886.parseBinaryExpression;
            parseBlock$963 = extra$886.parseBlock;
            parseFunctionSourceElements$994 = extra$886.parseFunctionSourceElements;
            parseCatchClause$989 = extra$886.parseCatchClause;
            parseComputedMember$947 = extra$886.parseComputedMember;
            parseConditionalExpression$955 = extra$886.parseConditionalExpression;
            parseConstLetDeclaration$968 = extra$886.parseConstLetDeclaration;
            parseExportBatchSpecifier$970 = extra$886.parseExportBatchSpecifier;
            parseExportDeclaration$972 = extra$886.parseExportDeclaration;
            parseExportSpecifier$971 = extra$886.parseExportSpecifier;
            parseExpression$961 = extra$886.parseExpression;
            parseForVariableDeclaration$980 = extra$886.parseForVariableDeclaration;
            parseFunctionDeclaration$998 = extra$886.parseFunctionDeclaration;
            parseFunctionExpression$999 = extra$886.parseFunctionExpression;
            parseImportDeclaration$973 = extra$886.parseImportDeclaration;
            parseImportSpecifier$974 = extra$886.parseImportSpecifier;
            parseGroupExpression$941 = extra$886.parseGroupExpression;
            parseLeftHandSideExpression$950 = extra$886.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$949 = extra$886.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$969 = extra$886.parseModuleDeclaration;
            parseModuleBlock$1012 = extra$886.parseModuleBlock;
            parseNewExpression$948 = extra$886.parseNewExpression;
            parseNonComputedProperty$945 = extra$886.parseNonComputedProperty;
            parseObjectInitialiser$938 = extra$886.parseObjectInitialiser;
            parseObjectProperty$937 = extra$886.parseObjectProperty;
            parseObjectPropertyKey$936 = extra$886.parseObjectPropertyKey;
            parsePostfixExpression$951 = extra$886.parsePostfixExpression;
            parsePrimaryExpression$942 = extra$886.parsePrimaryExpression;
            parseProgram$1013 = extra$886.parseProgram;
            parsePropertyFunction$934 = extra$886.parsePropertyFunction;
            parseTemplateElement$939 = extra$886.parseTemplateElement;
            parseTemplateLiteral$940 = extra$886.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$944 = extra$886.parseSpreadOrAssignmentExpression;
            parseStatement$992 = extra$886.parseStatement;
            parseSwitchCase$986 = extra$886.parseSwitchCase;
            parseUnaryExpression$952 = extra$886.parseUnaryExpression;
            parseVariableDeclaration$965 = extra$886.parseVariableDeclaration;
            parseVariableIdentifier$964 = extra$886.parseVariableIdentifier;
            parseMethodDefinition$1001 = extra$886.parseMethodDefinition;
            parseClassDeclaration$1005 = extra$886.parseClassDeclaration;
            parseClassExpression$1004 = extra$886.parseClassExpression;
            parseClassBody$1003 = extra$886.parseClassBody;
        }
        if (typeof extra$886.scanRegExp === 'function') {
            advance$916 = extra$886.advance;
            scanRegExp$913 = extra$886.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1029(object$1583, properties$1584) {
        var entry$1585, result$1586 = {};
        for (entry$1585 in object$1583) {
            if (object$1583.hasOwnProperty(entry$1585)) {
                result$1586[entry$1585] = object$1583[entry$1585];
            }
        }
        for (entry$1585 in properties$1584) {
            if (properties$1584.hasOwnProperty(entry$1585)) {
                result$1586[entry$1585] = properties$1584[entry$1585];
            }
        }
        return result$1586;
    }
    function tokenize$1030(code$1587, options$1588) {
        var toString$1589, token$1590, tokens$1591;
        toString$1589 = String;
        if (typeof code$1587 !== 'string' && !(code$1587 instanceof String)) {
            code$1587 = toString$1589(code$1587);
        }
        delegate$880 = SyntaxTreeDelegate$868;
        source$870 = code$1587;
        index$872 = 0;
        lineNumber$873 = source$870.length > 0 ? 1 : 0;
        lineStart$874 = 0;
        length$879 = source$870.length;
        lookahead$883 = null;
        state$885 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$886 = {};
        // Options matching.
        options$1588 = options$1588 || {};
        // Of course we collect tokens here.
        options$1588.tokens = true;
        extra$886.tokens = [];
        extra$886.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$886.openParenToken = -1;
        extra$886.openCurlyToken = -1;
        extra$886.range = typeof options$1588.range === 'boolean' && options$1588.range;
        extra$886.loc = typeof options$1588.loc === 'boolean' && options$1588.loc;
        if (typeof options$1588.comment === 'boolean' && options$1588.comment) {
            extra$886.comments = [];
        }
        if (typeof options$1588.tolerant === 'boolean' && options$1588.tolerant) {
            extra$886.errors = [];
        }
        if (length$879 > 0) {
            if (typeof source$870[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1587 instanceof String) {
                    source$870 = code$1587.valueOf();
                }
            }
        }
        patch$1027();
        try {
            peek$918();
            if (lookahead$883.type === Token$861.EOF) {
                return extra$886.tokens;
            }
            token$1590 = lex$917();
            while (lookahead$883.type !== Token$861.EOF) {
                try {
                    token$1590 = lex$917();
                } catch (lexError$1592) {
                    token$1590 = lookahead$883;
                    if (extra$886.errors) {
                        extra$886.errors.push(lexError$1592);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1592;
                    }
                }
            }
            filterTokenLocation$1019();
            tokens$1591 = extra$886.tokens;
            if (typeof extra$886.comments !== 'undefined') {
                filterCommentLocation$1016();
                tokens$1591.comments = extra$886.comments;
            }
            if (typeof extra$886.errors !== 'undefined') {
                tokens$1591.errors = extra$886.errors;
            }
        } catch (e$1593) {
            throw e$1593;
        } finally {
            unpatch$1028();
            extra$886 = {};
        }
        return tokens$1591;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1031(toks$1594, start$1595, inExprDelim$1596, parentIsBlock$1597) {
        var assignOps$1598 = [
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
        var binaryOps$1599 = [
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
        var unaryOps$1600 = [
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
        function back$1601(n$1602) {
            var idx$1603 = toks$1594.length - n$1602 > 0 ? toks$1594.length - n$1602 : 0;
            return toks$1594[idx$1603];
        }
        if (inExprDelim$1596 && toks$1594.length - (start$1595 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1601(start$1595 + 2).value === ':' && parentIsBlock$1597) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$888(back$1601(start$1595 + 2).value, unaryOps$1600.concat(binaryOps$1599).concat(assignOps$1598))) {
            // ... + {...}
            return false;
        } else if (back$1601(start$1595 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1604 = typeof back$1601(start$1595 + 1).startLineNumber !== 'undefined' ? back$1601(start$1595 + 1).startLineNumber : back$1601(start$1595 + 1).lineNumber;
            if (back$1601(start$1595 + 2).lineNumber !== currLineNumber$1604) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$888(back$1601(start$1595 + 2).value, [
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
    function readToken$1032(toks$1605, inExprDelim$1606, parentIsBlock$1607) {
        var delimiters$1608 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1609 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1610 = toks$1605.length - 1;
        var comments$1611, commentsLen$1612 = extra$886.comments.length;
        function back$1613(n$1617) {
            var idx$1618 = toks$1605.length - n$1617 > 0 ? toks$1605.length - n$1617 : 0;
            return toks$1605[idx$1618];
        }
        function attachComments$1614(token$1619) {
            if (comments$1611) {
                token$1619.leadingComments = comments$1611;
            }
            return token$1619;
        }
        function _advance$1615() {
            return attachComments$1614(advance$916());
        }
        function _scanRegExp$1616() {
            return attachComments$1614(scanRegExp$913());
        }
        skipComment$900();
        if (extra$886.comments.length > commentsLen$1612) {
            comments$1611 = extra$886.comments.slice(commentsLen$1612);
        }
        if (isIn$888(source$870[index$872], delimiters$1608)) {
            return attachComments$1614(readDelim$1033(toks$1605, inExprDelim$1606, parentIsBlock$1607));
        }
        if (source$870[index$872] === '/') {
            var prev$1620 = back$1613(1);
            if (prev$1620) {
                if (prev$1620.value === '()') {
                    if (isIn$888(back$1613(2).value, parenIdents$1609)) {
                        // ... if (...) / ...
                        return _scanRegExp$1616();
                    }
                    // ... (...) / ...
                    return _advance$1615();
                }
                if (prev$1620.value === '{}') {
                    if (blockAllowed$1031(toks$1605, 0, inExprDelim$1606, parentIsBlock$1607)) {
                        if (back$1613(2).value === '()') {
                            // named function
                            if (back$1613(4).value === 'function') {
                                if (!blockAllowed$1031(toks$1605, 3, inExprDelim$1606, parentIsBlock$1607)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1615();
                                }
                                if (toks$1605.length - 5 <= 0 && inExprDelim$1606) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1615();
                                }
                            }
                            // unnamed function
                            if (back$1613(3).value === 'function') {
                                if (!blockAllowed$1031(toks$1605, 2, inExprDelim$1606, parentIsBlock$1607)) {
                                    // new function (...) {...} / ...
                                    return _advance$1615();
                                }
                                if (toks$1605.length - 4 <= 0 && inExprDelim$1606) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1615();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1616();
                    } else {
                        // ... + {...} / ...
                        return _advance$1615();
                    }
                }
                if (prev$1620.type === Token$861.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1616();
                }
                if (isKeyword$899(prev$1620.value)) {
                    // typeof /...
                    return _scanRegExp$1616();
                }
                return _advance$1615();
            }
            return _scanRegExp$1616();
        }
        return _advance$1615();
    }
    function readDelim$1033(toks$1621, inExprDelim$1622, parentIsBlock$1623) {
        var startDelim$1624 = advance$916(), matchDelim$1625 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1626 = [];
        var delimiters$1627 = [
                '(',
                '{',
                '['
            ];
        assert$887(delimiters$1627.indexOf(startDelim$1624.value) !== -1, 'Need to begin at the delimiter');
        var token$1628 = startDelim$1624;
        var startLineNumber$1629 = token$1628.lineNumber;
        var startLineStart$1630 = token$1628.lineStart;
        var startRange$1631 = token$1628.range;
        var delimToken$1632 = {};
        delimToken$1632.type = Token$861.Delimiter;
        delimToken$1632.value = startDelim$1624.value + matchDelim$1625[startDelim$1624.value];
        delimToken$1632.startLineNumber = startLineNumber$1629;
        delimToken$1632.startLineStart = startLineStart$1630;
        delimToken$1632.startRange = startRange$1631;
        var delimIsBlock$1633 = false;
        if (startDelim$1624.value === '{') {
            delimIsBlock$1633 = blockAllowed$1031(toks$1621.concat(delimToken$1632), 0, inExprDelim$1622, parentIsBlock$1623);
        }
        while (index$872 <= length$879) {
            token$1628 = readToken$1032(inner$1626, startDelim$1624.value === '(' || startDelim$1624.value === '[', delimIsBlock$1633);
            if (token$1628.type === Token$861.Punctuator && token$1628.value === matchDelim$1625[startDelim$1624.value]) {
                if (token$1628.leadingComments) {
                    delimToken$1632.trailingComments = token$1628.leadingComments;
                }
                break;
            } else if (token$1628.type === Token$861.EOF) {
                throwError$921({}, Messages$866.UnexpectedEOS);
            } else {
                inner$1626.push(token$1628);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$872 >= length$879 && matchDelim$1625[startDelim$1624.value] !== source$870[length$879 - 1]) {
            throwError$921({}, Messages$866.UnexpectedEOS);
        }
        var endLineNumber$1634 = token$1628.lineNumber;
        var endLineStart$1635 = token$1628.lineStart;
        var endRange$1636 = token$1628.range;
        delimToken$1632.inner = inner$1626;
        delimToken$1632.endLineNumber = endLineNumber$1634;
        delimToken$1632.endLineStart = endLineStart$1635;
        delimToken$1632.endRange = endRange$1636;
        return delimToken$1632;
    }
    // (Str) -> [...CSyntax]
    function read$1034(code$1637) {
        var token$1638, tokenTree$1639 = [];
        extra$886 = {};
        extra$886.comments = [];
        patch$1027();
        source$870 = code$1637;
        index$872 = 0;
        lineNumber$873 = source$870.length > 0 ? 1 : 0;
        lineStart$874 = 0;
        length$879 = source$870.length;
        state$885 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$872 < length$879) {
            tokenTree$1639.push(readToken$1032(tokenTree$1639, false, false));
        }
        var last$1640 = tokenTree$1639[tokenTree$1639.length - 1];
        if (last$1640 && last$1640.type !== Token$861.EOF) {
            tokenTree$1639.push({
                type: Token$861.EOF,
                value: '',
                lineNumber: last$1640.lineNumber,
                lineStart: last$1640.lineStart,
                range: [
                    index$872,
                    index$872
                ]
            });
        }
        return expander$860.tokensToSyntax(tokenTree$1639);
    }
    function parse$1035(code$1641, options$1642) {
        var program$1643, toString$1644;
        extra$886 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1641)) {
            tokenStream$881 = code$1641;
            length$879 = tokenStream$881.length;
            lineNumber$873 = tokenStream$881.length > 0 ? 1 : 0;
            source$870 = undefined;
        } else {
            toString$1644 = String;
            if (typeof code$1641 !== 'string' && !(code$1641 instanceof String)) {
                code$1641 = toString$1644(code$1641);
            }
            source$870 = code$1641;
            length$879 = source$870.length;
            lineNumber$873 = source$870.length > 0 ? 1 : 0;
        }
        delegate$880 = SyntaxTreeDelegate$868;
        streamIndex$882 = -1;
        index$872 = 0;
        lineStart$874 = 0;
        sm_lineStart$876 = 0;
        sm_lineNumber$875 = lineNumber$873;
        sm_index$878 = 0;
        sm_range$877 = [
            0,
            0
        ];
        lookahead$883 = null;
        state$885 = {
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
        if (typeof options$1642 !== 'undefined') {
            extra$886.range = typeof options$1642.range === 'boolean' && options$1642.range;
            extra$886.loc = typeof options$1642.loc === 'boolean' && options$1642.loc;
            if (extra$886.loc && options$1642.source !== null && options$1642.source !== undefined) {
                delegate$880 = extend$1029(delegate$880, {
                    'postProcess': function (node$1645) {
                        node$1645.loc.source = toString$1644(options$1642.source);
                        return node$1645;
                    }
                });
            }
            if (typeof options$1642.tokens === 'boolean' && options$1642.tokens) {
                extra$886.tokens = [];
            }
            if (typeof options$1642.comment === 'boolean' && options$1642.comment) {
                extra$886.comments = [];
            }
            if (typeof options$1642.tolerant === 'boolean' && options$1642.tolerant) {
                extra$886.errors = [];
            }
        }
        if (length$879 > 0) {
            if (source$870 && typeof source$870[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1641 instanceof String) {
                    source$870 = code$1641.valueOf();
                }
            }
        }
        extra$886 = { loc: true };
        patch$1027();
        try {
            program$1643 = parseProgram$1013();
            if (typeof extra$886.comments !== 'undefined') {
                filterCommentLocation$1016();
                program$1643.comments = extra$886.comments;
            }
            if (typeof extra$886.tokens !== 'undefined') {
                filterTokenLocation$1019();
                program$1643.tokens = extra$886.tokens;
            }
            if (typeof extra$886.errors !== 'undefined') {
                program$1643.errors = extra$886.errors;
            }
            if (extra$886.range || extra$886.loc) {
                program$1643.body = filterGroup$1025(program$1643.body);
            }
        } catch (e$1646) {
            throw e$1646;
        } finally {
            unpatch$1028();
            extra$886 = {};
        }
        return program$1643;
    }
    exports$859.tokenize = tokenize$1030;
    exports$859.read = read$1034;
    exports$859.Token = Token$861;
    exports$859.parse = parse$1035;
    // Deep copy.
    exports$859.Syntax = function () {
        var name$1647, types$1648 = {};
        if (typeof Object.create === 'function') {
            types$1648 = Object.create(null);
        }
        for (name$1647 in Syntax$864) {
            if (Syntax$864.hasOwnProperty(name$1647)) {
                types$1648[name$1647] = Syntax$864[name$1647];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1648);
        }
        return types$1648;
    }();
}));
//# sourceMappingURL=parser.js.map